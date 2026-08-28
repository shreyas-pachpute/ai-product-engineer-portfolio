import { cn } from "@/lib/utils/cn";

type DividerProps = {
  orientation?: "horizontal" | "vertical";
  className?: string;
};

/** A single-pixel rule using the border-subtle token. Not a `<hr>` by default — it's as often decorative between flex/grid children as it is semantic. */
export function Divider({
  orientation = "horizontal",
  className,
}: DividerProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "bg-border-subtle shrink-0",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
    />
  );
}
