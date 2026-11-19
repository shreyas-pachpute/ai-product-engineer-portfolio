import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Header } from "@/components/site/header";
import { Stage } from "@/components/world/stage";
import { fontVariables } from "@/lib/fonts";
import { INTRO_HEAD_SCRIPT } from "@/lib/intro";
import { DESCRIPTION, IDENTITY, SITE_URL, TAGLINE } from "@/lib/site";
import "@/app/globals.css";

const TITLE = `${IDENTITY.name} — ${IDENTITY.role}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: `%s | ${IDENTITY.name}`,
  },
  description: DESCRIPTION,
  applicationName: IDENTITY.name,
  authors: [{ name: IDENTITY.name, url: SITE_URL }],
  creator: IDENTITY.name,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "profile",
    url: "/",
    siteName: IDENTITY.name,
    title: TITLE,
    description: TAGLINE,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: TAGLINE,
  },
};

export const viewport: Viewport = {
  // The paper colour: what a phone's browser chrome is tinted with.
  themeColor: "#fbf3e4",
  colorScheme: "light",
};

/**
 * Structured data: who this site is about, and where else they are.
 * Only the facts the site states — name, title, contact links.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: IDENTITY.name,
      jobTitle: IDENTITY.role,
      url: SITE_URL,
      email: `mailto:${IDENTITY.email}`,
      sameAs: IDENTITY.links.map((link) => link.href),
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: TITLE,
      description: DESCRIPTION,
      inLanguage: "en",
      about: { "@id": `${SITE_URL}/#person` },
    },
  ],
};

/**
 * Without JavaScript nothing pins or switches the chapters, so they fall
 * back to an ordinary document: every chapter in order, on paper. The same
 * rules exist in app/globals.css for screens too small for the stage
 * (search "plain document"); keep the two in step.
 */
const NO_SCRIPT_CSS = `.stage,.rail,.pins,.boats,.fold-control{display:none}.chapter,.chapter:last-of-type{height:auto}.panel{position:static;height:auto;padding:2.5rem var(--gutter);color:var(--color-ink);pointer-events:auto}.panel--harbour{padding-top:calc(var(--header-h) + 1rem)}.fade,.rise>span,.unfold,.tip,.letter,.sweep,.glide{opacity:1!important;animation:none!important;-webkit-mask-image:none;mask-image:none}.board{height:auto!important;grid-template-rows:none!important}.anatomy,.closing{grid-row:auto!important}.anatomy__row{grid-area:auto!important;opacity:1!important;color:var(--color-ink)}.anatomy__line,.board .body{display:block!important}.site-header{position:absolute}`;

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    // `suppressHydrationWarning`: the head script and the scroll driver
    // write data-* attributes onto this element outside React, on purpose.
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        {/* Decides before first paint whether the opening plays. See lib/intro.ts. */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_HEAD_SCRIPT }} />
        <noscript>
          <style>{NO_SCRIPT_CSS}</style>
        </noscript>
      </head>
      <body>
        {/*
         * The world and the header are here, not in a page, so they stay
         * mounted when the route changes: moving between pages is a cut
         * to another camera on the same sea, not a reload of it.
         */}
        <Stage />
        <Header />
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
