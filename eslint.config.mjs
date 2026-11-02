import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

// La app mobile está en TypeScript y se valida con `npm run typecheck --workspace=mobile`
export default defineConfig([
  {
    ignores: ["**/node_modules/**", "**/.expo/**", "**/coverage/**", "packages/mobile/**"],
  },
  {
    files: ["packages/backend/**/*.js"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: { ...globals.node, ...globals.jest } },
  },
]);
