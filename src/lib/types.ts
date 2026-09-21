export type PenFontId = "kalam" | "caveat" | "shadows";
export type NibId = "thin" | "medium" | "thick";
export type PageBackground = "ruled" | "grid" | "dotted" | "blank";

export interface InkColor {
  id: string;
  label: string;
  value: string;
}

export interface Notebook {
  id: string;
  title: string;
  coverColor: string;
  createdAt: number;
  updatedAt: number;
}

export interface Page {
  id: string;
  notebookId: string;
  title: string;
  /** Tiptap JSON (primary) */
  contentJSON: unknown | null;
  /** HTML fallback / for PDF + fast render */
  contentHTML: string;
  order: number;
  background: PageBackground;
  createdAt: number;
  updatedAt: number;
}

export interface PenState {
  color: string;
  font: PenFontId;
  nib: NibId;
  highlightColor: string | null;
}
