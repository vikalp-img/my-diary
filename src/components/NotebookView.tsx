"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { useEditor } from "@tiptap/react";
import { PAGE_BACKGROUNDS, penFontCss } from "@/lib/pens";
import { exportNotebookToPdf, exportSinglePageToPdf } from "@/lib/pdf";
import {
  useCurrentNotebook,
  useCurrentPage,
  useDiaryStore,
} from "@/store/useDiaryStore";
import DiaryPage from "./DiaryPage";
import PenToolbar from "./PenToolbar";

export default function NotebookView() {
  const notebook = useCurrentNotebook();
  const page = useCurrentPage();
  const pages = useDiaryStore((s) => s.pages);
  const pageIndex = useDiaryStore((s) => s.pageIndex);
  const direction = useDiaryStore((s) => s.direction);
  const penFont = useDiaryStore((s) => s.penFont);
  const saving = useDiaryStore((s) => s.saving);
  const lastSavedAt = useDiaryStore((s) => s.lastSavedAt);

  const selectNotebook = useDiaryStore((s) => s.selectNotebook);
  const createPage = useDiaryStore((s) => s.createPage);
  const deletePage = useDiaryStore((s) => s.deletePage);
  const gotoPage = useDiaryStore((s) => s.gotoPage);
  const gotoPageId = useDiaryStore((s) => s.gotoPageId);
  const movePage = useDiaryStore((s) => s.movePage);
  const setPageBackground = useDiaryStore((s) => s.setPageBackground);

  const editorRef = useRef<ReturnType<typeof useEditor> | null>(null);
  const [exporting, setExporting] = useState<"page" | "book" | null>(null);

  if (!notebook || !page) return null;

  const doExportPage = async () => {
    setExporting("page");
    try {
      await exportSinglePageToPdf(`${notebook.title}-${page.title}.pdf`);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setExporting(null);
    }
  };

  const doExportBook = async () => {
    setExporting("book");
    try {
      await exportNotebookToPdf(notebook.title, pages, {
        font: penFontCss(penFont),
      });
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-3 pb-40 pt-4 sm:px-6">
      {/* top bar */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => void selectNotebook(null)}
          className="rounded-full bg-[#2b2118]/90 px-4 py-1.5 text-sm text-[#f7f1e3] hover:bg-[#3e2723]"
        >
          ← Shelf
        </button>
        <div
          className="text-3xl text-[#2b2118]"
          style={{ fontFamily: "var(--font-caveat)" }}
        >
          {notebook.title}
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs text-[#6b5a45]">
          {saving ? (
            <span className="animate-pulse">● Saving…</span>
          ) : lastSavedAt ? (
            <span>✓ Saved {new Date(lastSavedAt).toLocaleTimeString()}</span>
          ) : (
            <span>✓ Saved locally</span>
          )}
        </div>
      </div>

      {/* page controls */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 rounded-full border border-[#e5d9bd] bg-[#fffdf6]/90 px-2 py-1">
          <button
            onClick={() => gotoPage(-1)}
            disabled={pageIndex === 0}
            className="rounded-full px-3 py-1 text-sm disabled:opacity-30 hover:bg-[#f3ead3]"
          >
            ← Prev
          </button>
          <span className="px-1 text-xs text-[#8a7355]">
            {pageIndex + 1} / {pages.length}
          </span>
          <button
            onClick={() => gotoPage(1)}
            disabled={pageIndex === pages.length - 1}
            className="rounded-full px-3 py-1 text-sm disabled:opacity-30 hover:bg-[#f3ead3]"
          >
            Next →
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => void createPage()}
            className="rounded-full bg-[#1b4332] px-4 py-1.5 text-sm text-[#f7f1e3] hover:bg-[#102a1f]"
          >
            + Page
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete “${page.title}”?`)) void deletePage(page.id);
            }}
            disabled={pages.length <= 1}
            className="rounded-full border border-[#b23a48]/40 px-3 py-1.5 text-sm text-[#6b1f2a] disabled:opacity-30 hover:bg-[#b23a48]/10"
          >
            Delete
          </button>
          <button
            onClick={() => void movePage(page.id, -1)}
            disabled={pageIndex === 0}
            title="Move page earlier"
            className="rounded-full border border-[#e5d9bd] px-3 py-1.5 text-sm disabled:opacity-30 hover:bg-[#fffdf6]"
          >
            ⇤
          </button>
          <button
            onClick={() => void movePage(page.id, 1)}
            disabled={pageIndex === pages.length - 1}
            title="Move page later"
            className="rounded-full border border-[#e5d9bd] px-3 py-1.5 text-sm disabled:opacity-30 hover:bg-[#fffdf6]"
          >
            ⇥
          </button>
        </div>

        <div className="flex items-center gap-1 rounded-full border border-[#e5d9bd] bg-[#fffdf6]/90 px-2 py-1">
          {PAGE_BACKGROUNDS.map((b) => (
            <button
              key={b.id}
              onClick={() => void setPageBackground(page.id, b.id)}
              className={`rounded-full px-3 py-1 text-xs ${
                page.background === b.id
                  ? "bg-[#2b2118] text-[#f7f1e3]"
                  : "text-[#5d4037] hover:bg-[#f3ead3]"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={doExportPage}
            disabled={exporting !== null}
            className="rounded-full border border-[#c9a227] bg-[#fffdf6] px-4 py-1.5 text-sm text-[#5d4037] hover:bg-[#f7f1e3] disabled:opacity-50"
          >
            {exporting === "page" ? "Rendering…" : "⤓ Page PDF"}
          </button>
          <button
            onClick={doExportBook}
            disabled={exporting !== null}
            className="rounded-full bg-[#c9a227] px-4 py-1.5 text-sm font-semibold text-[#2b2118] hover:bg-[#e9d48a] disabled:opacity-50"
          >
            {exporting === "book" ? "Rendering…" : "⤓ Notebook PDF"}
          </button>
        </div>
      </div>

      {/* page dots */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {pages.map((p, i) => (
          <button
            key={p.id}
            title={p.title}
            onClick={() => gotoPageId(p.id)}
            className={`h-2.5 rounded-full transition-all ${
              p.id === page.id
                ? "w-8 bg-[#c9a227]"
                : "w-2.5 bg-[#8a7355]/40 hover:bg-[#8a7355]"
            }`}
          >
            <span className="sr-only">
              {i + 1}: {p.title}
            </span>
          </button>
        ))}
      </div>

      {/* the page */}
      <div className="mt-6" style={{ perspective: 1400 }}>
        <AnimatePresence mode="wait" custom={direction}>
          <DiaryPage
            key={page.id}
            page={page}
            notebookTitle={notebook.title}
            direction={direction}
            editorRef={editorRef}
          />
        </AnimatePresence>
      </div>

      {/* floating pen toolbar */}
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-3"
      >
        <PenToolbar editorRef={editorRef} />
      </motion.div>
    </div>
  );
}
