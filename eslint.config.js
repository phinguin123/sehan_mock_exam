import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import prettierPluginRecommended from 'eslint-plugin-prettier/recommended';
import { fixupPluginRules } from '@eslint/compat';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tailwindPlugin from 'eslint-plugin-tailwindcss';

/** @type {import('eslint').Linter.Config[]} */
export default tseslint.config(
  pluginJs.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  ...tailwindPlugin.configs['flat/recommended'],
  prettierPluginRecommended,

  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    extends: [tseslint.configs.disableTypeChecked], // javascript no need type check
  },
  { languageOptions: { globals: globals.browser } },
  {
    plugins: {
      react: pluginReact,
      'react-hooks': fixupPluginRules(reactHooksPlugin),
      'react-refresh': reactRefresh,
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...pluginReact.configs['recommended'].rules,
      ...pluginReact.configs['jsx-runtime'].rules,
      ...reactHooksPlugin.configs.recommended.rules,

      'prettier/prettier': 'warn',
      'react-refresh/only-export-components': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      camelcase: 'off',
    },
  }
);
