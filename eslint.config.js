import sonarjs from "eslint-plugin-sonarjs";
import importPlugin from "eslint-plugin-import";
import js from "@eslint/js";
import globals from "globals";

export default [
    js.configs.recommended,
    {
        files: ["src/**/*.js"],
        ignores: ["**/*.config.js", "!**/eslint.config.js"],
        plugins: { importPlugin, sonarjs, js },
        rules: {
            semi: ["error", "always"],
            "prefer-const": "error",
            "brace-style": ["error", "1tbs"],
            "indent": ["error", 4],
            "sonarjs/cognitive-complexity": ["error", 15],
            "sonarjs/max-switch-cases": ["error", 10],
            "sonarjs/no-duplicate-string": ["error", { "threshold": 5 }],
            "sonarjs/no-identical-expressions": "error"
        },
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.jest,
                ...globals.es2021
            }
        }
    }
];