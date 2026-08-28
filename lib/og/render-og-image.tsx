/* eslint-disable no-restricted-syntax -- satori has no CSS custom property access; the palette below is a one-time hand copy of app/globals.css's @theme values (see comment below). */
import { ImageResponse } from "next/og";
import { ogFonts } from "./fonts";

/**
 * One parameterized template behind every route's OG image, not eight
 * hand-built layouts — "avoid generic templates" means don't look like
 * every other portfolio's default social card, not "invent a unique
 * visual language per page." The brand identity (dark canvas, the accent
 * glow, the node-graph mark from the Logo, Space Grotesk for the
 * headline) is what makes this feel like *this* site regardless of which
 * route calls it.
 *
 * Values below are literal hex/px, not design-token references — satori
 * (the renderer behind `ImageResponse`) has no CSS custom property
 * support and no access to the app's actual stylesheet, so the palette
 * is hand-copied from app/globals.css's `@theme` block. If those tokens
 * change, this needs a manual update; there's no way to share them
 * automatically across a browser-CSS engine and satori's isolated one.
 *
 * Every container below has an explicit `display: "flex"` — satori's
 * layout engine only understands flexbox, there's no block-flow fallback
 * the way a real browser has.
 */

const WIDTH = 1200;
const HEIGHT = 630;

const COLOR = {
  surfaceBase: "#07090a",
  textPrimary: "#f6f7f8",
  textSecondary: "#9298a1",
  textTertiary: "#5c6169",
  accentPrimary: "#3861fb",
  borderSubtle: "#22262c",
};

type RenderOgImageOptions = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function renderOgImage({
  eyebrow,
  title,
  description,
}: RenderOgImageOptions) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px",
        backgroundColor: COLOR.surfaceBase,
        position: "relative",
        fontFamily: "Inter",
      }}
    >
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: -220,
          right: -180,
          width: 700,
          height: 700,
          borderRadius: "50%",
          backgroundImage:
            "radial-gradient(circle, rgba(56,97,251,0.35), rgba(56,97,251,0) 70%)",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <path
            d="M7.6 16.6L10.6 7.8M16.4 16.6L13.4 7.8M8.3 18H15.7"
            stroke={COLOR.textPrimary}
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          <circle cx="6" cy="18" r="2.1" fill={COLOR.textPrimary} />
          <circle cx="18" cy="18" r="2.1" fill={COLOR.textPrimary} />
          <circle cx="12" cy="6" r="2.1" fill={COLOR.textPrimary} />
        </svg>
        <span
          style={{
            fontFamily: "JetBrains Mono",
            fontSize: 22,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: COLOR.accentPrimary,
          }}
        >
          {eyebrow}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          maxWidth: 980,
        }}
      >
        <span
          style={{
            fontFamily: "Space Grotesk",
            fontWeight: 700,
            fontSize: 62,
            lineHeight: 1.12,
            letterSpacing: -2,
            color: COLOR.textPrimary,
          }}
        >
          {title}
        </span>
        {description ? (
          <span
            style={{
              fontFamily: "Inter",
              fontWeight: 400,
              fontSize: 27,
              lineHeight: 1.45,
              color: COLOR.textSecondary,
            }}
          >
            {description}
          </span>
        ) : null}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: `1px solid ${COLOR.borderSubtle}`,
          paddingTop: 28,
        }}
      >
        <span
          style={{
            display: "flex",
            fontFamily: "Inter",
            fontWeight: 500,
            fontSize: 22,
            color: COLOR.textTertiary,
          }}
        >
          AI Product Engineer
        </span>
      </div>
    </div>,
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        {
          name: "Space Grotesk",
          data: ogFonts.spaceGroteskBold,
          weight: 700,
          style: "normal",
        },
        {
          name: "Inter",
          data: ogFonts.interRegular,
          weight: 400,
          style: "normal",
        },
        {
          name: "Inter",
          data: ogFonts.interMedium,
          weight: 500,
          style: "normal",
        },
        {
          name: "JetBrains Mono",
          data: ogFonts.jetbrainsMono,
          weight: 500,
          style: "normal",
        },
      ],
    },
  );
}
