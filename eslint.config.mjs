import eslintConfigNext from "eslint-config-next";

const config = [
  ...eslintConfigNext,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "next-env.d.ts",
    ],
    rules: {
      "@next/next/no-img-element": "warn",
      "react/no-unescaped-entities": "off",
      "react-hooks/immutability": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default config;
