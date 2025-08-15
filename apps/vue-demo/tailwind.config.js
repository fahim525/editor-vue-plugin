/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{vue,ts,tsx,js,jsx}",
    // include library source when linked via alias for dev
    "../../packages/tiptap-vue/src/**/*.{vue,ts,tsx,js,jsx}",
  ],
  theme: { extend: {} },
  plugins: [require("@tailwindcss/typography")],
};
