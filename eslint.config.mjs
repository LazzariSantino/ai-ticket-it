import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: ["**/node_modules/**", "**/.expo/**", "**/coverage/**"],
  },
  {
    files: ["packages/backend/**/*.js"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: { ...globals.node, ...globals.jest } },
  },
  {
    files: ["packages/mobile/**/*.{js,jsx}"],
    ...pluginReact.configs.flat.recommended,
    languageOptions: { globals: globals.browser },
    settings: { react: { version: "detect" } },
    rules: { "react/react-in-jsx-scope": "off", "react/prop-types": "off" },
  },
]);
