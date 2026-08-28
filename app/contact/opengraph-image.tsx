import { renderOgImage } from "@/lib/og/render-og-image";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Contact — The next step is a conversation, not a form";

export default function Image() {
  return renderOgImage({
    eyebrow: "Contact",
    title: "The next step is a conversation, not a form.",
    description:
      "Reach out directly — what's useful to include, and what happens after.",
  });
}
