import type { InkColor, NibId, PageBackground, PenFontId } from "./types";

export const INK_COLORS: InkColor[] = [
  { id: "black", label: "Black", value: "#1a1a1a" },
  { id: "navy", label: "Navy blue", value: "#1e2a6b" },
  { id: "blueblack", label: "Blue-black", value: "#101d38" },
  { id: "maroon", label: "Maroon", value: "#6b1f2a" },
];

export const PEN_FONTS: { id: PenFontId; label: string; css: string }[] = [
  { id: "kalam", label: "Kalam", css: "var(--font-kalam)" },
  { id: "caveat", label: "Caveat", css: "var(--font-caveat)" },
  { id: "shadows", label: "Shadows", css: "var(--font-shadows)" },
];

export const NIBS: { id: NibId; label: string; px: number; weight: number }[] = [
  { id: "thin", label: "Fine nib", px: 19, weight: 300 },
  { id: "medium", label: "Medium nib", px: 23, weight: 400 },
  { id: "thick", label: "Bold nib", px: 29, weight: 400 },
];

export const HIGHLIGHT_COLORS = [
  { id: "yellow", label: "Yellow", value: "#ffd54f" },
  { id: "green", label: "Green", value: "#a5f3a5" },
  { id: "pink", label: "Pink", value: "#ffb3c1" },
  { id: "blue", label: "Blue", value: "#9fd8ff" },
];

export const PAGE_BACKGROUNDS: { id: PageBackground; label: string }[] = [
  { id: "ruled", label: "Ruled" },
  { id: "grid", label: "Grid" },
  { id: "dotted", label: "Dotted" },
  { id: "blank", label: "Blank" },
];

export const COVER_COLORS = [
  "#5d4037", // leather brown
  "#1b4332", // deep green
  "#3d2b3d", // plum
  "#1f3a5f", // midnight blue
  "#6b1f2a", // maroon
  "#8a6d2b", // antique gold-brown
];

export function penFontCss(font: PenFontId): string {
  return PEN_FONTS.find((f) => f.id === font)?.css ?? "var(--font-kalam)";
}

export function nibSpec(nib: NibId) {
  return NIBS.find((n) => n.id === nib) ?? NIBS[1];
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}
