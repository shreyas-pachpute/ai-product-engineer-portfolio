import {
  cloneElement,
  isValidElement,
  type HTMLAttributes,
  type ReactElement,
  type Ref,
} from "react";

/**
 * Minimal `asChild` implementation (the pattern Radix popularized): instead
 * of always rendering its own DOM node, a component can merge its props
 * (className, event handlers, ref) onto a single child element it's given.
 * This is what lets `<Button asChild><Link href="/contact">...</Link></Button>`
 * render one real `<a>` styled as a button, instead of a button nested
 * inside — or wrapping — a link.
 *
 * Written with React 19's ref-as-prop model (no `forwardRef`) — `ref` is
 * just another prop here.
 *
 * Deliberately minimal: merges className/style shallowly (callers are
 * expected to have already resolved variants through `cn` before this
 * point). This covers every real usage in this codebase (CTAs rendered as
 * Next.js `Link`); it does not attempt to be a general-purpose
 * polymorphism engine.
 */
export function Slot({
  children,
  ref,
  ...props
}: HTMLAttributes<HTMLElement> & { ref?: Ref<HTMLElement> }) {
  if (!isValidElement(children)) {
    return null;
  }

  const child = children as ReactElement<Record<string, unknown>>;
  const childProps = child.props ?? {};

  return cloneElement(child, {
    ...props,
    ...childProps,
    className:
      [props.className, childProps.className as string | undefined]
        .filter(Boolean)
        .join(" ") || undefined,
    style: { ...props.style, ...(childProps.style as object | undefined) },
    ref,
  });
}
