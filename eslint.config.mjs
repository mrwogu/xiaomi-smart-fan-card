import eslint from "@eslint/js";
import prettier from "eslint-config-prettier";
import lit from "eslint-plugin-lit";
import prettierPlugin from "eslint-plugin-prettier";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  lit.configs["flat/recommended"],
  prettier,
  {
    files: ["**/*.ts"],
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
        },
      ],
      "prettier/prettier": [
        "error",
        {
          "endOfLine": "lf",
          "printWidth": 120,
          "singleQuote": false,
          "trailingComma": "all",
        },
      ],
    },
  },
);
