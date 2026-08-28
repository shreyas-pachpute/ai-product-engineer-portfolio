/* eslint-disable no-restricted-syntax -- satori (ImageResponse's renderer) has no CSS custom property access; colors are a one-time hand copy of app/globals.css's @theme values, same as lib/og/render-og-image.tsx. */
import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Solid background, no transparency — iOS applies its own rounded-corner mask over whatever's here, and a transparent apple-touch-icon renders with visible artifacts under that mask. */
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#07090a",
      }}
    >
      <svg width="108" height="108" viewBox="0 0 24 24" fill="none">
        <path
          d="M7.6 16.6L10.6 7.8M16.4 16.6L13.4 7.8M8.3 18H15.7"
          stroke="#f6f7f8"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <circle cx="6" cy="18" r="2.3" fill="#3861fb" />
        <circle cx="18" cy="18" r="2.3" fill="#3861fb" />
        <circle cx="12" cy="6" r="2.3" fill="#3861fb" />
      </svg>
    </div>,
    size,
  );
}
