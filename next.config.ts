import type { NextConfig } from "next";

/**
 * Phase 0 assumed `.mdx` files would live directly as route segments
 * (`@next/mdx`'s pattern). Now that the actual Work content model exists,
 * a content-collection approach is clearly the better fit: case studies
 * live in `content/work/*.mdx` (not as routes), get parsed + validated by
 * `lib/content/work.ts`, and are rendered through a single
 * `app/work/[slug]/page.tsx` via `next-mdx-remote/rsc`. That gives a
 * typed, queryable collection for the index/related-work/prev-next
 * logic, which `.mdx`-as-route-file can't do without extra machinery.
 * `pageExtensions`/`createMDX` are removed accordingly — nothing in the
 * app router resolves `.mdx` as a page anymore.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
