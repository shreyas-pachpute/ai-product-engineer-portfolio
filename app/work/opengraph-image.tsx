import { renderOgImage } from "@/lib/og/render-og-image";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Work — Systems I've designed, built, and shipped";

export default function Image() {
  return renderOgImage({
    eyebrow: "Work",
    title: "Systems I've designed, built, and shipped.",
    description:
      "Full engineering reviews — the problem, the architecture, the trade-offs.",
  });
}
