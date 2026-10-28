import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

/** Simulator functions the UI must read through @nodes/data-source instead of calling directly. */
const SIMULATOR = [
  "simulate", "nodeState", "scenarioNodeState", "nodeSeries", "densityAt", "simulateRunnerHeat",
  "trafficAt", "trafficTimesAt", "scenarioAlerts", "visibleAlerts", "buildReport", "scenarios", "getScenario", "findNode",
];

const serverOnly = {
  name: "server-only",
  message:
    "TanStack Start does not use the Next.js `server-only` package. Rename the module to `*.server.ts` or mark it with `@tanstack/react-start/server-only`.",
};

export default tseslint.config(
  { ignores: ["**/dist", "**/.output", "**/.vinxi", "**/.tanstack", "**/.wrangler", "**/routeTree.gen.ts", ".lovable", ".claude"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: { ecmaVersion: 2022 },
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
    },
  },

  // apps/web: React UI. Data comes from @nodes/data-source; core only for types and pure helpers.
  {
    files: ["apps/web/**/*.{ts,tsx}"],
    languageOptions: { globals: globals.browser },
    plugins: { "react-hooks": reactHooks, "react-refresh": reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "no-restricted-imports": ["error", { paths: [serverOnly], patterns: [{ group: ["@nodes/*/src/*"], message: "Import packages through their public entry point." }] }],
    },
  },
  {
    files: ["apps/web/src/components/**/*.{ts,tsx}", "apps/web/src/routes/**/*.{ts,tsx}"],
    ignores: ["**/*.test.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", {
        paths: [serverOnly, { name: "@nodes/core", importNames: SIMULATOR, message: "Read data through the DataSource hooks in @/data/hooks." }],
        patterns: [{ group: ["@nodes/*/src/*"], message: "Import packages through their public entry point." }],
      }],
    },
  },
  // Generated shadcn/ui components export variants next to components by design.
  {
    files: ["apps/web/src/components/ui/**/*.tsx"],
    rules: { "react-refresh/only-export-components": "off" },
  },

  // packages/data-source: no UI.
  {
    files: ["packages/data-source/**/*.ts"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [
        { group: ["react", "react-dom", "@tanstack/*", "maplibre-gl"], message: "data-source has no UI dependencies." },
        { group: ["@nodes/web", "@/*"], message: "Dependency direction is web → data-source → core." },
        { group: ["@nodes/*/src/*"], message: "Import packages through their public entry point." },
      ] }],
    },
  },

  // packages/core: pure TypeScript domain, runs in Node and the browser.
  {
    files: ["packages/core/**/*.ts"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [
        { group: ["react", "react-dom", "@tanstack/*", "maplibre-gl"], message: "core is pure TypeScript: no UI libraries." },
        { group: ["@nodes/*", "@/*"], message: "core imports nothing from the other workspaces." },
      ] }],
    },
  },
  {
    files: ["packages/core/src/**/*.ts"],
    rules: {
      "no-restricted-globals": ["error",
        ...["window", "document", "navigator", "localStorage", "sessionStorage", "fetch", "setTimeout", "setInterval", "requestAnimationFrame"]
          .map((name) => ({ name, message: "core has no DOM, network or timers; pass data and time in." })),
      ],
      "no-restricted-properties": ["error",
        { object: "Date", property: "now", message: "Time is always passed in." },
        { object: "Math", property: "random", message: "Use the seeded generator." },
      ],
    },
  },
  eslintConfigPrettier,
);
