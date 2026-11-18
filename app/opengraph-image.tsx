import { ImageResponse } from "next/og";
import { MarkImage, PAINT, loadFonts } from "@/lib/share-image";
import { IDENTITY } from "@/lib/site";

/**
 * The share card: what a link to the site looks like in a chat, a post or
 * a search result. It is the harbour scene as a flat poster — dawn sky,
 * the statement, and the mark itself sitting on the horizon as the boat.
 */

export const alt = `${IDENTITY.name}, ${IDENTITY.role}. Models are the sea. I build the ships.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const HORIZON = 410;

export default async function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        backgroundColor: PAINT.skyHorizon,
        backgroundImage: `linear-gradient(to bottom, ${PAINT.skyTop} 0px, ${PAINT.skyHorizon} ${HORIZON}px)`,
        color: PAINT.ink,
        fontFamily: "Fraunces",
      }}
    >
      {/* Sun: a halo ring and a disc, low on the right. */}
      <div
        style={{
          position: "absolute",
          left: 760,
          top: 96,
          width: 400,
          height: 400,
          borderRadius: 200,
          backgroundColor: PAINT.sunHalo,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 262,
            height: 262,
            borderRadius: 131,
            backgroundColor: PAINT.sunDisc,
            display: "flex",
          }}
        />
      </div>

      {/* Sea: three flat bands. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: HORIZON,
          width: 1200,
          height: 630 - HORIZON,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            height: 34,
            backgroundColor: PAINT.seaLight,
            display: "flex",
          }}
        />
        <div
          style={{ height: 76, backgroundColor: PAINT.seaMid, display: "flex" }}
        />
        <div
          style={{ flex: 1, backgroundColor: PAINT.seaDeep, display: "flex" }}
        />
      </div>

      {/* The mark is the boat: its wave lies along the horizon. */}
      <div
        style={{
          position: "absolute",
          left: 838,
          top: HORIZON - 208,
          display: "flex",
        }}
      >
        <MarkImage size={244} line={PAINT.ink} sail={PAINT.vermilion} />
      </div>

      <div
        style={{
          position: "absolute",
          left: 72,
          top: 64,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <MarkImage size={54} line={PAINT.ink} sail={PAINT.vermilion} />
          <div style={{ marginLeft: 16, fontSize: 34, letterSpacing: -0.7 }}>
            {IDENTITY.name}
          </div>
        </div>
        <div
          style={{
            marginTop: 62,
            display: "flex",
            flexDirection: "column",
            fontSize: 88,
            lineHeight: 0.98,
            letterSpacing: -2.2,
          }}
        >
          <div style={{ display: "flex" }}>Models are the sea.</div>
          <div style={{ display: "flex" }}>I build the ships.</div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 72,
          top: HORIZON + 126,
          display: "flex",
          fontFamily: "Mona Sans",
          fontSize: 30,
          color: PAINT.paper,
        }}
      >
        {IDENTITY.role}
      </div>
    </div>,
    { ...size, fonts: await loadFonts() },
  );
}
