import { renderOgImage } from "@/lib/og/render-og-image";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Shreyas Pachpute — AI Product Engineer";

export default function Image() {
  return renderOgImage({
    eyebrow: "AI Product Engineer",
    title: "Most AI prototypes never ship. I build the ones that do.",
    description:
      "Applied AI engineer and product builder — from working model to shipped product.",
  });
}
