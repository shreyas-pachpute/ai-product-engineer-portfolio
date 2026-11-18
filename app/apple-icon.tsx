import { ImageResponse } from "next/og";
import { MarkImage, PAINT } from "@/lib/share-image";

/**
 * Home-screen icon: the porthole badge without the porthole, because iOS
 * rounds the corners itself. The browser-tab icon is app/icon.svg.
 */

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: PAINT.vermilion,
      }}
    >
      <MarkImage size={118} line={PAINT.paper} sail={PAINT.sun} />
    </div>,
    size,
  );
}
