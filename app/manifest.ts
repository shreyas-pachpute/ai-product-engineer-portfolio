import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo/site-config";
import { surfaceBaseHex } from "@/lib/design-tokens";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "AI Product Engineer",
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: surfaceBaseHex,
    theme_color: surfaceBaseHex,
    // Next serves the generated icon.tsx/apple-icon.tsx at extension-less
    // /icon and /apple-icon (verified directly, not assumed) — a plausible
    // guess like "/icon.png" 404s.
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
