import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { fontVariables } from "@/lib/fonts";
import { Providers } from "@/components/providers/providers";
import { SkipLink, Footer, PageTransition } from "@/components/layout";
import { Navbar } from "@/components/nav";
import { AmbientField } from "@/components/effects/ambient-field";
import { CursorSpotlight } from "@/components/effects/cursor-spotlight";
import { CursorGlowController } from "@/components/effects/cursor-glow-controller";
import { SpotlightController } from "@/components/effects/spotlight-controller";
import { CommandPalette } from "@/components/command";
import { buildCommandIndex } from "@/lib/command/command-index";
import { surfaceBaseHex } from "@/lib/design-tokens";
import { JsonLd } from "@/components/seo/json-ld";
import { siteGraph } from "@/lib/seo/json-ld";
import {
  AUTHOR_NAME,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo/site-config";
import "@/app/globals.css";

/**
 * `metadataBase` is what lets every route's relative OG/canonical URLs
 * (and the auto-discovered opengraph-image files) resolve to absolute
 * ones — without it, Next warns and falls back to inferring a URL from
 * the deployment environment, which is fine on Vercel but not something
 * to rely on silently. Reads `NEXT_PUBLIC_SITE_URL`, defaulting to
 * localhost for local builds; set that env var to the real domain once
 * one exists.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${AUTHOR_NAME}`,
  },
  description: SITE_DESCRIPTION,
  authors: [{ name: AUTHOR_NAME, url: SITE_URL }],
  creator: AUTHOR_NAME,
  publisher: AUTHOR_NAME,
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  themeColor: surfaceBaseHex,
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  // Built here, in a Server Component, so the `fs`-backed content loaders
  // never cross the client boundary — the palette receives a finished,
  // serializable array.
  const commandIndex = buildCommandIndex();

  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body>
        <JsonLd data={siteGraph()} />
        <AmbientField />
        <CursorSpotlight />
        <Providers>
          <CursorGlowController />
          <SpotlightController />
          <SkipLink />
          <Navbar />
          <main id="main-content" tabIndex={-1} className="pt-32 outline-none">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
          <CommandPalette items={commandIndex} />
        </Providers>
      </body>
    </html>
  );
}
