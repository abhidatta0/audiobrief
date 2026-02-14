import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from 'eslint-plugin-react-hooks';
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier/flat";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"], plugins: { js,'react-hooks': reactHooks }, extends: ["js/recommended",'react-hooks/recommended'], languageOptions: { globals: globals.browser } },
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  {...pluginReact.configs.flat.recommended,
    settings:{
      react:{
        version:'detect'
      }
    }
  },pluginReact.configs.flat['jsx-runtime'],
  eslintConfigPrettier,
  {
    rules:{
      'react-proptypes':'off',
    }
  }
]);
