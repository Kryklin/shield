// @ts-check
const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = defineConfig([
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": "error",
      "no-restricted-imports": [
        "error",
        {
          "patterns": [
            {
              "group": ["@angular/material/*", "@angular/cdk/*"],
              "message": "Please import 'MaterialModule' from 'src/app/modules/material/material-module' instead of individual Material/CDK modules."
            }
          ]
        }
      ]
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
    ],
    rules: {},
  },
  {
    files: ["src/app/modules/material/material-module.ts"],
    rules: {
      "no-restricted-imports": "off"
    }
  },
  {
    files: ["src/app/services/*.ts", "src/app/components/topnav/topnav.component.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off"
    }
  }
]);
