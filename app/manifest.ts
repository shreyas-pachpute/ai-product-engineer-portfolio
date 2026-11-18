import type { MetadataRoute } from "next";
import { DESCRIPTION, IDENTITY } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${IDENTITY.name} — ${IDENTITY.role}`,
    short_name: IDENTITY.name,
    description: DESCRIPTION,
    start_url: "/",
    display: "standalone",
    // The brand's paper and vermilion. Literal here because a manifest
    // cannot read CSS custom properties.
    background_color: "#fbf3e4",
    theme_color: "#ff4b2b",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
