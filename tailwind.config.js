const {
  iconsPlugin,
  getIconCollections,
} = require("@egoist/tailwindcss-icons");
const daisyui = require("daisyui");

/** @type {import('tailwindcss').Config} */
export default {
  content: [],
  theme: {
    extend: {},
  },
  plugins: [
    daisyui,
    // https://icones.js.org/collection/carbon
    iconsPlugin({ collections: getIconCollections(["carbon"]) }),
  ],
};
