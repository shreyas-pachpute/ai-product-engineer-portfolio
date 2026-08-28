import type { SVGProps } from "react";

/** Same visual grammar as the Logo and Capabilities icons (nodes + thin connecting strokes), one mark per lifecycle stage — used on the mobile stacked layout only; the desktop experience has the full diagram instead. */

const stroke = {
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function ProblemIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="7.5" {...stroke} />
      <circle cx="12" cy="12" r="2.6" {...stroke} />
    </svg>
  );
}

export function ArchitectureIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M8.6 8.6L10.5 15M15.4 8.6L13.5 15" {...stroke} />
      <circle cx="7" cy="7" r="2.3" {...stroke} />
      <circle cx="17" cy="7" r="2.3" {...stroke} />
      <circle cx="12" cy="17" r="2.3" {...stroke} />
    </svg>
  );
}

export function EconomicsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M4 16C4 10.5 7.6 6 12 6C16.4 6 20 10.5 20 16" {...stroke} />
      <path d="M12 16L15.5 11" {...stroke} />
      <circle cx="12" cy="16" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ReliabilityIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="8" {...stroke} />
      <path d="M8.5 12.3L10.8 14.6L15.5 9.5" {...stroke} />
    </svg>
  );
}

export function DeploymentIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M12 19V7M12 7L7.5 11.5M12 7L16.5 11.5" {...stroke} />
      <path d="M5 19H19" {...stroke} />
    </svg>
  );
}

export function IterationIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M5 12C5 8.13 8.13 5 12 5C14.7 5 17 6.5 18.2 8.7" {...stroke} />
      <path d="M18.2 4.5V8.7H14" {...stroke} />
      <path
        d="M19 12C19 15.87 15.87 19 12 19C9.3 19 7 17.5 5.8 15.3"
        {...stroke}
      />
      <path d="M5.8 19V15.3H10" {...stroke} />
    </svg>
  );
}
