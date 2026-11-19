import nextConfig from "eslint-config-next";
import eslintConfigPrettier from "eslint-config-prettier";

/**
 * `eslint-config-next` ships a native ESLint 9+ flat config array (already
 * includes core-web-vitals + typescript-eslint rules) — no `FlatCompat`
 * legacy-shareable-config bridge needed.
 */
const eslintConfig = [
  ...nextConfig,
  eslintConfigPrettier,
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "node_modules/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // Colour discipline: the brand is four colours, defined once. Page
      // code uses the tokens in app/globals.css, never a literal.
      "no-restricted-syntax": [
        "warn",
        {
          selector: "Literal[value=/^#([0-9a-fA-F]{3}){1,2}$/]",
          message:
            "Use a colour token from app/globals.css instead of a hex literal.",
        },
      ],
    },
  },
  {
    // The exceptions are the places that *define* colour, or hand it to
    // something that cannot read CSS: the 3D world's materials (numbers for
    // the GPU), and the browser-chrome colours in the manifest and viewport.
    files: ["components/world/sea/**", "app/manifest.ts", "app/layout.tsx"],
    rules: { "no-restricted-syntax": "off" },
  },
];

export default eslintConfig;
