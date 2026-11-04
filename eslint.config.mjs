import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Deliberate in places (e.g. the import/export configs); reported as a
      // warning until those are typed properly.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    // Email templates are rendered to HTML for an inbox, where next/link does
    // not apply; plain <a> links are correct there.
    files: ["components/emails/**"],
    rules: { "@next/next/no-html-link-for-pages": "off" },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "test-results/**",
    "playwright-report/**",
    "vendor/**",
  ]),
]);

export default eslintConfig;
