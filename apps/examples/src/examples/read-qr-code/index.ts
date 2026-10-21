import { defineExample } from "../define";
import { demo } from "./demo";
import code from "./demo.ts?raw";

export const readQrCodeExample = defineExample<Record<string, never>>({
  slug: "read-qr-code",
  title: "readQrCode",
  functions: ["readQrCode", "grayscale"],
  category: "detection",
  description:
    "Finds a QR code in a gray image and decodes it: its text, version, error correction level and the four corners of the symbol. Point the webcam at a code to read it live.",
  howItWorks: [
    "The image is thresholded, at Otsu's level and, if that fails, against the local mean. Rows are scanned for the finder patterns' dark-light-dark-light-dark runs in the ratio 1:1:3:1:1; each hit is confirmed down, across and diagonally, so codes at any rotation are found. The three patterns that form a right-angled corner become the top-left, top-right and bottom-left of the code.",
    "Their spacing gives the version. The alignment pattern near the fourth corner and the outer corners of the three finder patterns pin the perspective, and every module is sampled through it.",
    "The format information gives the error correction level and the mask; after unmasking, the codewords are read in their zigzag order, split into blocks and corrected with Reed–Solomon, so a damaged or partly covered code still reads. Numeric, alphanumeric and byte segments are decoded; bytes as UTF-8 when they are valid UTF-8. Versions 1 to 10 are read.",
  ],
  howToTest:
    'The sample holds "https://pixelvision.dev" as a version 2 code with level M, drawn as a 125-pixel square turned 8° about (160, 120). The decoded text, version and level must be exactly those, and each corner within 2 pixels of the drawn one: top-left (106.8, 49.4), top-right (230.6, 66.8), bottom-right (213.2, 190.6) and bottom-left (89.4, 173.2) (the centre plus (±62.5, ±62.5) turned 8°).',
  input: "image",
  sample: "qr-code",
  controls: [],
  code,
  demo,
  expectations: [
    { key: "text", label: 'Text "https://pixelvision.dev"', equals: "https://pixelvision.dev" },
    { key: "version", label: "Version 2", equals: 2 },
    { key: "level", label: "Error correction M", equals: "M" },
    { key: "cornerError", label: "Corners within 2 px of the drawn ones", min: 0, max: 2 },
  ],
});
