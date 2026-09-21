"use client";

import { create } from "zustand";
import type { NibId, Notebook, Page, PenFontId } from "@/lib/types";
import {
  listNotebooks,
  listPages,
  putNotebook,
  putPage,
  removeNotebook,
  removePage,
  seedIfEmpty,
  uid,
} from "@/lib/db";

interface DiaryState {
  notebooks: Notebook[];
  pages: Page[];
  currentNotebookId: string | null;
  currentPageId: string | null;
  pageIndex: number;
  direction: number;

  penColor: string;
  penFont: PenFontId;
  nib: NibId;
  highlightColor: string | null;

  loaded: boolean;
  saving: boolean;
  lastSavedAt: number | null;

  loadAll: () => Promise<void>;
  selectNotebook: (id: string | null) => Promise<void>;
  createNotebook: (title: string, coverColor: string) => Promise<void>;
  deleteNotebook: (id: string) => Promise<void>;

  createPage: () => Promise<void>;
  deletePage: (id: string) => Promise<void>;
  gotoPage: (delta: number) => void;
  gotoPageId: (id: string) => void;
  movePage: (id: string, delta: number) => Promise<void>;
  updatePageContent: (id: string, html: string, json: unknown) => Promise<void>;
  renamePage: (id: string, title: string) => Promise<void>;
  setPageBackground: (id: string, bg: Page["background"]) => Promise<void>;

  setPenColor: (c: string) => void;
  setPenFont: (f: PenFontId) => void;
  setNib: (n: NibId) => void;
  setHighlightColor: (c: string | null) => void;
}

export const useDiaryStore = create<DiaryState>()((set, get) => ({
  notebooks: [],
  pages: [],
  currentNotebookId: null,
  currentPageId: null,
  pageIndex: 0,
  direction: 0,

  penColor: "#1e2a6b",
  penFont: "kalam",
  nib: "medium",
  highlightColor: null,

  loaded: false,
  saving: false,
  lastSavedAt: null,

  loadAll: async () => {
    await seedIfEmpty();
    const notebooks = await listNotebooks();
    set({ notebooks, loaded: true });
  },

  selectNotebook: async (id) => {
    if (!id) {
      set({ currentNotebookId: null, currentPageId: null, pages: [], pageIndex: 0 });
      return;
    }
    const pages = await listPages(id);
    set({
      currentNotebookId: id,
      pages,
      currentPageId: pages[0]?.id ?? null,
      pageIndex: 0,
      direction: 0,
    });
  },

  createNotebook: async (title, coverColor) => {
    const now = Date.now();
    const nb: Notebook = {
      id: uid("nb"),
      title: title.trim() || "Untitled",
      coverColor,
      createdAt: now,
      updatedAt: now,
    };
    await putNotebook(nb);
    const first: Page = {
      id: uid("pg"),
      notebookId: nb.id,
      title: "Page 1",
      contentJSON: null,
      contentHTML: "<p></p>",
      order: 0,
      background: "ruled",
      createdAt: now,
      updatedAt: now,
    };
    await putPage(first);
    set({ notebooks: [...get().notebooks, nb] });
    await get().selectNotebook(nb.id);
  },

  deleteNotebook: async (id) => {
    await removeNotebook(id);
    const notebooks = get().notebooks.filter((n) => n.id !== id);
    const wasCurrent = get().currentNotebookId === id;
    set({ notebooks });
    if (wasCurrent) await get().selectNotebook(null);
  },

  createPage: async () => {
    const { currentNotebookId, pages } = get();
    if (!currentNotebookId) return;
    const now = Date.now();
    const page: Page = {
      id: uid("pg"),
      notebookId: currentNotebookId,
      title: `Page ${pages.length + 1}`,
      contentJSON: null,
      contentHTML: "<p></p>",
      order: pages.length,
      background: pages[pages.length - 1]?.background ?? "ruled",
      createdAt: now,
      updatedAt: now,
    };
    await putPage(page);
    const next = [...pages, page];
    set({ pages: next, currentPageId: page.id, pageIndex: next.length - 1, direction: 1 });
  },

  deletePage: async (id) => {
    const { pages } = get();
    if (pages.length <= 1) return;
    const idx = pages.findIndex((p) => p.id === id);
    await removePage(id);
    const remaining = pages.filter((p) => p.id !== id).map((p, i) => ({ ...p, order: i }));
    // persist re-order
    await Promise.all(remaining.map((p) => putPage(p)));
    const nextIndex = Math.max(0, Math.min(idx, remaining.length - 1));
    set({
      pages: remaining,
      currentPageId: remaining[nextIndex]?.id ?? null,
      pageIndex: nextIndex,
      direction: -1,
    });
  },

  gotoPage: (delta) => {
    const { pages, pageIndex } = get();
    const next = pageIndex + delta;
    if (next < 0 || next >= pages.length) return;
    set({ pageIndex: next, currentPageId: pages[next].id, direction: delta });
  },

  gotoPageId: (id) => {
    const { pages, pageIndex } = get();
    const next = pages.findIndex((p) => p.id === id);
    if (next === -1) return;
    set({ pageIndex: next, currentPageId: id, direction: next > pageIndex ? 1 : -1 });
  },

  movePage: async (id, delta) => {
    const { pages } = get();
    const idx = pages.findIndex((p) => p.id === id);
    const j = idx + delta;
    if (idx === -1 || j < 0 || j >= pages.length) return;
    const next = [...pages];
    const [moved] = next.splice(idx, 1);
    next.splice(j, 0, moved);
    const ordered = next.map((p, i) => ({ ...p, order: i }));
    set({ pages: ordered, pageIndex: j, currentPageId: id, direction: delta });
    await Promise.all(ordered.map((p) => putPage(p)));
  },

  updatePageContent: async (id, html, json) => {
    const { pages } = get();
    const page = pages.find((p) => p.id === id);
    if (!page) return;
    const updated: Page = { ...page, contentHTML: html, contentJSON: json as Page["contentJSON"], updatedAt: Date.now() };
    set({
      pages: pages.map((p) => (p.id === id ? updated : p)),
      saving: true,
    });
    try {
      await putPage(updated);
      set({ lastSavedAt: Date.now() });
    } finally {
      set({ saving: false });
    }
  },

  renamePage: async (id, title) => {
    const { pages } = get();
    const page = pages.find((p) => p.id === id);
    if (!page) return;
    const updated = { ...page, title, updatedAt: Date.now() };
    set({ pages: pages.map((p) => (p.id === id ? updated : p)) });
    await putPage(updated);
  },

  setPageBackground: async (id, bg) => {
    const { pages } = get();
    const page = pages.find((p) => p.id === id);
    if (!page) return;
    const updated = { ...page, background: bg, updatedAt: Date.now() };
    set({ pages: pages.map((p) => (p.id === id ? updated : p)) });
    await putPage(updated);
  },

  setPenColor: (penColor) => set({ penColor }),
  setPenFont: (penFont) => set({ penFont }),
  setNib: (nib) => set({ nib }),
  setHighlightColor: (highlightColor) => set({ highlightColor }),
}));

export function useCurrentNotebook(): Notebook | null {
  const notebooks = useDiaryStore((s) => s.notebooks);
  const currentNotebookId = useDiaryStore((s) => s.currentNotebookId);
  return notebooks.find((n) => n.id === currentNotebookId) ?? null;
}

export function useCurrentPage(): Page | null {
  const pages = useDiaryStore((s) => s.pages);
  const currentPageId = useDiaryStore((s) => s.currentPageId);
  return pages.find((p) => p.id === currentPageId) ?? null;
}
