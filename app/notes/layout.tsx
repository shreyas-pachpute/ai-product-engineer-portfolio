import type { ReactNode } from "react";
import "katex/dist/katex.min.css";

// KaTeX's stylesheet is only needed where equations can appear — scoped to
// this route segment via its own layout rather than imported globally.
export default function NotesLayout({ children }: { children: ReactNode }) {
  return children;
}
