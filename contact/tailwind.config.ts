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
          50: "#fdf9ff",
          100: "#f8f0ff",
          200: "#f1e3ff",
          300: "#e5d0ff",
          400: "#d7b9ff",
          500: "#c7a0ff",
          600: "#b589f2",
          700: "#9c6fdb",
          800: "#8357c2",
          900: "#6c45a6",
        },
      },
    },
  },
  plugins: [],
};
export default config;
