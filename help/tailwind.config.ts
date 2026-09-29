import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#faf8fc",
          100: "#f3eef8",
          200: "#e7ddf0",
          300: "#d7c8e3",
          400: "#bba6cd",
          500: "#9d82b3",
          600: "#947eb3",
          700: "#80689d",
          800: "#6b5487",
          900: "#57436f",
        },
      },
    },
  },
  plugins: [],
};
export default config;
