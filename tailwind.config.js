import { iconsPlugin, getIconCollections } from "@egoist/tailwindcss-icons";
import daisyui from "daisyui";

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
