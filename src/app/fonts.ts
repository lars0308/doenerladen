import localFont from "next/font/local";

export const fraunces = localFont({
  src: [
    { path: "../fonts/fraunces-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/fraunces-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../fonts/fraunces-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../fonts/fraunces-latin-600-italic.woff2", weight: "600", style: "italic" },
    { path: "../fonts/fraunces-latin-700-normal.woff2", weight: "700", style: "normal" },
    { path: "../fonts/fraunces-latin-900-normal.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-fraunces",
  display: "swap",
});

export const karla = localFont({
  src: [
    { path: "../fonts/karla-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/karla-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../fonts/karla-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../fonts/karla-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-karla",
  display: "swap",
});
