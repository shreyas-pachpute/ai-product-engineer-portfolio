import { renderOgImage } from "@/lib/og/render-og-image";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "About — What changed my mind";

export default function Image() {
  return renderOgImage({
    eyebrow: "About",
    title: "What changed my mind.",
    description:
      "Beliefs about building AI products that turned out to be wrong.",
  });
}
