import { renderOgImage } from "@/lib/og/render-og-image";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Notes — An engineering notebook, not a blog";

export default function Image() {
  return renderOgImage({
    eyebrow: "Notes",
    title: "An engineering notebook, not a blog.",
    description: "Organized by what each piece is about, not by publish date.",
  });
}
