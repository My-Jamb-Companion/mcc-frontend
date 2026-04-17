import boundaries from "eslint-plugin-boundaries";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import reactHooks from "eslint-plugin-react-hooks";
import importPlugin from "eslint-plugin-import";

export default [
    {
        ignores: ["node_modules", "dist", ".next", "**/.next/**"],
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
                { type: "feature", pattern: "packages/features/*" },
                { type: "ui", pattern: "packages/ui/*" },
                { type: "store", pattern: "packages/store/*" },
                { type: "api", pattern: "packages/api/*" },
            ],
        },

        rules: {
            "boundaries/dependencies": [
                "error",
                {
                    default: "disallow",
                    rules: [
                        { from: "app", allow: ["feature", "ui", "store", "api"] },
                        { from: "feature", allow: ["ui", "store", "api"] },
                        { from: "ui", allow: ["ui", "external"] },
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
            "@typescript-eslint/no-explicit-any": [
                "error",
                {
                    ignoreRestArgs: false,
                },
            ],
            "no-console": [
                "error",
                {
                    allow: ["error"],
                },
            ],

            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn",
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
            "**/tailwind.config.{ts,js}",
            "**/postcss.config.{js,ts}",
            "**/vite.config.{ts,js}",
        ],
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