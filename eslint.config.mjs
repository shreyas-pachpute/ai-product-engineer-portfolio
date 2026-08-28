import nextConfig from "eslint-config-next";
import eslintConfigPrettier from "eslint-config-prettier";

/**
 * `eslint-config-next` ships a native ESLint 9+ flat config array (already
 * includes core-web-vitals + typescript-eslint rules) — no `FlatCompat`
 * legacy-shareable-config bridge needed, and that bridge does not survive
 * eslint-plugin-react's newer flat exports intact (a circular-reference
 * bug when it tries to validate/re-serialize them).
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
      // Design-system discipline: components must consume tokens, not
      // reintroduce raw color literals (see design tokens in globals.css).
      "no-restricted-syntax": [
        "warn",
        {
          selector: "Literal[value=/^#([0-9a-fA-F]{3}){1,2}$/]",
          message:
            "Hardcoded hex colors are not allowed in components. Use a design token from globals.css / Tailwind theme instead.",
        },
      ],
    },
  },
];

export default eslintConfig;
