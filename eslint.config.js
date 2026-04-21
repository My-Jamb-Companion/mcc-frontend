import boundaries from "eslint-plugin-boundaries";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import reactHooks from "eslint-plugin-react-hooks";
import importPlugin from "eslint-plugin-import";

export default [
  {
    ignores: [
      "node_modules",
      "dist",
      ".next",
      "**/.next/**",
      "**/*.d.ts",
      "**/dist/**",
      "**/build/**",
    ],
  },

  {
    files: ["**/*.{ts,tsx,js,jsx}"],

    languageOptions: {
      parser: tsParser,
    },

    plugins: {
      boundaries,
      "@typescript-eslint": tseslint,
      "react-hooks": reactHooks,
      import: importPlugin,
    },

    settings: {
      "boundaries/elements": [
        { type: "app", pattern: "apps/*" },
        { type: "feature", pattern: "packages/features/src/**" },
        { type: "ui", pattern: "packages/ui/src/**" },
        { type: "store", pattern: "packages/store/src/**" },
        { type: "api", pattern: "packages/api/src/**" },
        { type: "types", pattern: "packages/types/src/**" },
      ],
    },

    rules: {
      "boundaries/no-unknown": "off",

      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          rules: [
            { from: "app", allow: ["feature", "ui", "store", "api", "types"] },
            { from: "feature", allow: ["ui", "store", "api", "types"] },
            { from: "store", allow: ["types"] },
            { from: "ui", allow: ["ui", "types"] },
            { from: "types", allow: [] },
          ],
        },
      ],

      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@iconify/react",
              message:
                "Do not import Iconify directly. Use @mcc/ui/Icon instead.",
            },
          ],
          patterns: [
            {
              group: ["../../*"],
              message:
                "Do not use relative imports across packages. Use @mcc/* aliases.",
            },
          ],
        },
      ],

      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],

      "@typescript-eslint/no-explicit-any": "warn",

      "no-console": ["error", { allow: ["error"] }],

      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  {
    files: ["apps/*/src/**/*.{ts,tsx}", "packages/*/src/**/*.{ts,tsx}"],

    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: true,
      },
    },
  },

  {
    files: ["packages/features/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "framer-motion",
              message:
                "Do not use framer-motion in features. Use @mcc/ui instead.",
            },
          ],
        },
      ],
    },
  },

  {
    files: [
      "**/*.config.{js,ts}",
      "**/middleware.ts",
      "**/next.config.ts",
      "**/tailwind.config.ts",
      "eslint.config.js",
    ],
    languageOptions: {
      parserOptions: {
        project: null,
      },
    },
    rules: {
      "no-restricted-imports": "off",
    },
  },

  {
    files: ["packages/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
];
