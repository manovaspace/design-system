/**
 * AUTO-GENERATED from default.json — do not edit by hand.
 */

export const mnvColors = {
  primary: {
    50: "#fafafa",
    100: "#f4f4f4",
    200: "#e7e7e7",
    300: "#d4d4d4",
    400: "#9f9f9f",
    500: "#727272",
    600: "#545454",
    700: "#404040",
    800: "#292929",
    900: "#0a0a0a",
    950: "#070707",
  },
  secondary: {
    50: "#fafafa",
    100: "#f4f4f4",
    200: "#e7e7e7",
    300: "#d4d4d4",
    400: "#9f9f9f",
    500: "#727272",
    600: "#545454",
    700: "#404040",
    800: "#525252",
    900: "#181818",
    950: "#070707",
  },
  action: {
    50: "#dcfbff",
    100: "#d6f5ff",
    200: "#98e2ff",
    300: "#86ceff",
    400: "#5497ff",
    500: "#2563eb",
    600: "#0441c8",
    700: "#0026af",
    800: "#000090",
    900: "#0a0079",
    950: "#0f0055",
  },
  tertiary: {
    50: "#ddfaff",
    100: "#d7f4ff",
    200: "#9de0ff",
    300: "#8bccff",
    400: "#5995ff",
    500: "#2e64ef",
    600: "#1240c9",
    700: "#1d4ed8",
    800: "#050091",
    900: "#0e007a",
    950: "#100056",
  },
  content: {
    50: "#fafafa",
    100: "#f4f4f4",
    200: "#e5e5e5",
    300: "#d4d4d4",
    400: "#9f9f9f",
    500: "#727272",
    600: "#545454",
    700: "#404040",
    800: "#292929",
    900: "#181818",
    950: "#070707",
  },
  supporting: {
    50: "#ddfcff",
    100: "#d7f6ff",
    200: "#9ae6ff",
    300: "#87d2ff",
    400: "#549cff",
    500: "#3b82f6",
    600: "#004ab9",
    700: "#0032a1",
    800: "#000c82",
    900: "#00006c",
    950: "#07004b",
  },
} as const;

export type MnvColorFamily = keyof typeof mnvColors;
export type MnvColorStep = keyof (typeof mnvColors)["primary"];

export { validateMnvColors } from "./validate-tokens.js";
