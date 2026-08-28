import { renderOgImage } from "@/lib/og/render-og-image";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "AI Agents — Live, testable systems";

export default function Image() {
  return renderOgImage({
    eyebrow: "AI Agents",
    title: "Agents you can put to work.",
    description: "The architecture, the guardrails, and what's actually verified.",
  });
}
