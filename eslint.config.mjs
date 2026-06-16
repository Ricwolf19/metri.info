import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import react from "eslint-plugin-react";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Arrow-function style everywhere — mirrors the mobile app's convention.
  {
    plugins: { react },
    settings: { react: { version: "detect" } },
    rules: {
      "func-style": ["error", "expression", { allowArrowFunctions: true }],
      "react/function-component-definition": [
        "error",
        {
          namedComponents: "arrow-function",
          unnamedComponents: "arrow-function",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Hand-rolled service worker — plain JS with SW globals, not bundled by Next.
    "public/sw.js",
  ]),
]);

export default eslintConfig;
