# Portfolio — Shreyas Pachpute, AI Product Engineer

A production-grade portfolio and writing platform built on the Next.js App
Router. Dark-only design system, MDX-backed content collections, and a
server-rendered SEO layer targeting both traditional search engines and
LLM-based answer engines.

## Stack

| Concern       | Choice                                                       |
| ------------- | ------------------------------------------------------------ |
| Framework     | Next.js 16 (App Router, Turbopack), React 19                 |
| Language      | TypeScript (strict)                                          |
| Styling       | Tailwind CSS v4 — CSS-first `@theme`, no JS config file      |
| Motion        | Framer Motion (`LazyMotion` + `domAnimation`, `strict`)      |
| Smooth scroll | Lenis                                                        |
| Content       | MDX via `next-mdx-remote/rsc`, validated with Zod            |
| Code blocks   | `rehype-pretty-code` + Shiki — highlighted at build time     |
| Math          | `remark-math` + KaTeX, scoped to the Notes route segment     |
| OG images     | `next/og` (satori), fonts read from `@fontsource/*` at build |

## Getting started

```bash
npm install
cp .env.example .env.local   # then edit NEXT_PUBLIC_SITE_URL
npm run dev
```

### Scripts

| Script                 | Purpose                    |
| ---------------------- | -------------------------- |
| `npm run dev`          | Dev server (Turbopack)     |
| `npm run build`        | Production build           |
| `npm start`            | Serve the production build |
| `npm run typecheck`    | `tsc --noEmit`             |
| `npm run lint`         | ESLint                     |
| `npm run format`       | Prettier, write            |
| `npm run format:check` | Prettier, check only       |

## Environment

`NEXT_PUBLIC_SITE_URL` is the only required variable. Every canonical URL,
sitemap `<loc>`, JSON-LD `@id`, RSS link, and absolute Open Graph image URL
derives from it.

**It must be set before deploying.** If it is unset, a production build
still succeeds but silently falls back to `http://localhost:3000` — shared
links render broken previews and the sitemap points at an unreachable host.
On Vercel it self-resolves from `VERCEL_PROJECT_PRODUCTION_URL`; on any
other host, set it explicitly. See `.env.example`.

## Adding content

Content is filesystem-backed. Adding an entry means adding one `.mdx` file —
no React component or route changes.

### A case study

Create `content/work/<slug>.mdx`. The slug becomes the URL. Frontmatter is
validated by `lib/content/work-schema.ts`; the build fails loudly on an
invalid or missing field.

```mdx
---
title: "Document Intelligence Pipeline"
category: "RAG & Knowledge"
tier: "signature" # "signature" (adds a sticky section nav) | "buildlog"
icon: "knowledge" # see WORK_ICON_KEYS in work-schema.ts
problem: "One line — reused on the index, the hero, and related-work cards."
summary: "Short abstract used for <meta description>."
timeline: "6 weeks"
publishedAt: "2026-06-01"
featured: true
order: 3 # manual sort; ties broken by publishedAt desc
repoUrl: "https://github.com/..." # optional — renders a "Source" button
liveUrl: "https://..." # optional — renders a "View it live" button
---

## The Problem

Body is freeform MDX. `##` headings become the section nav and the TOC.
```

`repoUrl` and `liveUrl` are optional and currently unset everywhere. The
buttons only render when a real URL is present — there are deliberately no
placeholder or "coming soon" links.

### A note

Create `content/notes/<slug>.mdx`. Validated by
`lib/content/notes-schema.ts`.

```mdx
---
title: "Your vector database is probably a default, not a decision"
type: "note" # note | essay | review | report
theme: "systems" # systems | evaluation | product | tools
summary: "One or two sentences, shown on the index."
publishedAt: "2026-05-02"
featured: false
order: 0
---
```

The Notes index groups by `theme`, not by date. A new theme value requires
adding it to `NOTE_THEMES` and `NOTE_THEME_LABELS` in the schema.

New notes appear automatically in the index, the RSS feed
(`/notes/rss.xml`), the sitemap, and the ⌘K command palette.

### Components available inside MDX

`<Callout>`, `<DecisionCard>`, `<ArchitectureBlock>`, `<Timeline>`,
`<Metrics>`, `<MediaBlock>` — and in Notes, additionally `<Reference>` plus
KaTeX math and GFM footnotes. Registered in
`components/work/mdx-components.tsx` and `components/notes/mdx-components.tsx`.

## Architecture notes

- **Server-first.** Roughly a third of component files carry `"use client"`,
  each scoped to a leaf that genuinely needs state, a browser API, or motion
  — sections and pages themselves stay server-rendered. Content loaders
  (`lib/content/*`) use `fs` and are server-only by construction.
- **Design tokens are the single source of truth.** Everything lives in the
  `@theme` block in `app/globals.css`. Components consume generated
  utilities; no hex codes or ad-hoc easing curves in component files.
- **Motion has three intent tiers** — feedback, orientation, narrative —
  mirrored in CSS (`--ease-*`) and TS (`lib/motion/tokens.ts`).
- **Reduced motion is honored twice**: a global CSS override plus Framer's
  `MotionConfig reducedMotion="user"`. Lenis is never instantiated at all
  when the preference is set.
- **`blockJS: false`** is set deliberately in the MDX options. The default
  (`true`) silently strips array/object JSX props — see the comment in
  `lib/content/mdx-options.ts` for the full rationale.

## SEO surface

Generated at build time: `sitemap.xml`, `robots.txt`, `manifest.webmanifest`,
`/notes/rss.xml`, `/llms.txt`, per-route Open Graph images, favicons, and
JSON-LD (`Person`, `WebSite`, `Article`, `SoftwareApplication`,
`BreadcrumbList`) using an `@graph` with stable `@id` anchors.

## Accessibility

Targets WCAG 2.2 AA. Color tokens are contrast-checked against the canvas;
`accent-primary` is used for backgrounds/borders while `accent-primary-hover`
carries accent-colored _text_, which is the variant that clears 4.5:1.
Route changes move focus to `#main-content`. Scroll-gated visual sequences
have `sr-only` linear-order equivalents.

## Deploying

Any Node host or Vercel. Set `NEXT_PUBLIC_SITE_URL`, then `npm run build`.
All 28 routes are statically prerendered except `/llms.txt`,
`/notes/rss.xml`, and the two dynamic OG image routes.
