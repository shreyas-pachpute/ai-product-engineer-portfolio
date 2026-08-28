import fs from "node:fs";
import path from "node:path";

/**
 * `ImageResponse` (satori under the hood) needs real font file bytes, not
 * a CSS `font-family` reference — there's no browser involved, so
 * next/font's usual mechanism doesn't apply here. Read directly from the
 * `@fontsource/*` packages' static per-weight `.woff` files at build
 * time: no runtime network fetch (Google Fonts CDN URLs used by some
 * `next/og` examples are a build-time network dependency and a moving
 * target), and no reliance on a variable font instancing correctly under
 * satori's limited font support — `@fontsource` already unpacks each
 * weight into its own static file, which is exactly what's needed here.
 */

function readFontFile(packageName: string, filename: string): Buffer {
  return fs.readFileSync(
    path.join(process.cwd(), "node_modules", packageName, "files", filename),
  );
}

export const ogFonts = {
  spaceGroteskBold: readFontFile(
    "@fontsource/space-grotesk",
    "space-grotesk-latin-700-normal.woff",
  ),
  spaceGroteskMedium: readFontFile(
    "@fontsource/space-grotesk",
    "space-grotesk-latin-500-normal.woff",
  ),
  interRegular: readFontFile(
    "@fontsource/inter",
    "inter-latin-400-normal.woff",
  ),
  interMedium: readFontFile("@fontsource/inter", "inter-latin-500-normal.woff"),
  jetbrainsMono: readFontFile(
    "@fontsource/jetbrains-mono",
    "jetbrains-mono-latin-500-normal.woff",
  ),
};
