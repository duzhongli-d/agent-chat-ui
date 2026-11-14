import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", ".next"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    settings: {
      // Pinned, not "detect": eslint-plugin-react's auto-detection calls the
      // context.getFilename() API that ESLint 10 removed, which crashes the
      // rule. Track the react version in package.json when it changes.
      react: { version: "19.3" },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-hooks/refs": "warn",
      "react-hooks/set-state-in-effect": "warn",
      // Only this rule is enabled from the plugin. Its recommended set also
      // turns on prop-types and react-in-jsx-scope, which do not apply to a
      // TypeScript Next.js app.
      "react/no-unknown-property": "error",
      "@typescript-eslint/no-explicit-any": 0,
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { args: "none", argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
  {
    // Next.js route modules legitimately export `generateMetadata`,
    // `generateStaticParams`, `metadata`, `revalidate`, … next to their
    // component. Fast Refresh does not apply to route files, so the rule only
    // produces false positives there.
    files: ["src/app/**/layout.tsx", "src/app/**/page.tsx"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
);
