import type { Config } from "tailwindcss";
import { iconsPlugin, getIconCollections } from "@egoist/tailwindcss-icons";
import daisyui from "daisyui";

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
} satisfies Config;
