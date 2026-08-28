import { renderOgImage } from "@/lib/og/render-og-image";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Services — What it's like to work with me";

export default function Image() {
  return renderOgImage({
    eyebrow: "Services",
    title: "What it's like to work with me.",
    description:
      "Not a menu of packages — how scope, risk, and collaboration actually work.",
  });
}
