import type { ReactNode } from "react";
import { LenisProvider } from "@/components/providers/lenis-provider";
import { MotionProvider } from "@/components/providers/motion-provider";
import { CommandPaletteProvider } from "@/components/command/command-palette-provider";

/**
 * Single composition point for app-wide context. This file has no hooks of
 * its own, so it stays a Server Component even though everything it
 * renders is a Client Component — Next allows Server Components to render
 * Client Components as children, and doing so here keeps the client
 * boundary limited to the providers that actually need it instead of
 * infecting RootLayout.
 *
 * Extension point: analytics (Phase 30), a future toast host, etc. join
 * here — not scaffolded now, since nothing in Phases 0–5 needs them.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionProvider>
      <LenisProvider>
        <CommandPaletteProvider>{children}</CommandPaletteProvider>
      </LenisProvider>
    </MotionProvider>
  );
}
