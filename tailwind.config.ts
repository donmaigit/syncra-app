import type { Config } from "tailwindcss";

const config: Config = {
  // CRITICAL FIX: Tell Tailwind to toggle based on the "class" attribute
  darkMode: "class", 
  
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;