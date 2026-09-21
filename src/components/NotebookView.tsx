"use client";

import { useEffect, useRef, useState } from "react";
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
  const penStandOpen = useDiaryStore((s) => s.penStandOpen);
  const togglePenStand = useDiaryStore((s) => s.togglePenStand);
  const setPenStandOpen = useDiaryStore((s) => s.setPenStandOpen);

  const selectNotebook = useDiaryStore((s) => s.selectNotebook);
  const createPage = useDiaryStore((s) => s.createPage);
  const deletePage = useDiaryStore((s) => s.deletePage);
  const gotoPage = useDiaryStore((s) => s.gotoPage);
  const gotoPageId = useDiaryStore((s) => s.gotoPageId);
  const movePage = useDiaryStore((s) => s.movePage);
  const setPageBackground = useDiaryStore((s) => s.setPageBackground);

  const editorRef = useRef<ReturnType<typeof useEditor> | null>(null);
  const [exporting, setExporting] = useState<"page" | "book" | null>(null);

  // Esc closes the pen stand
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPenStandOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setPenStandOpen]);

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
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-3 pb-40 pt-4 sm:px-6 xl:pb-12">
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

      {/* pen stand — floating button that opens/closes the toolbar */}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex flex-col gap-3 px-4 xl:inset-x-auto xl:bottom-auto xl:right-8 xl:top-28 xl:flex-col-reverse xl:px-0">
        <AnimatePresence>
          {penStandOpen && (
            <motion.div
              key="pen-stand-panel"
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              className="pointer-events-auto w-full xl:w-auto"
            >
              <PenToolbar editorRef={editorRef} />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="pointer-events-auto flex items-center justify-end gap-2">
          {!penStandOpen && (
            <span className="rounded-full border border-[#e5d9bd] bg-[#fffdf6]/95 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#8a7355] shadow">
              Pen stand
            </span>
          )}
          <button
            onClick={togglePenStand}
            aria-expanded={penStandOpen}
            title={penStandOpen ? "Close pen stand (Esc)" : "Open pen stand"}
            aria-label={penStandOpen ? "Close pen stand" : "Open pen stand"}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2b2118] text-[#e9d48a] shadow-[0_12px_28px_-8px_rgba(43,33,24,.6)] ring-2 ring-[#c9a227]/70 transition hover:scale-105 hover:bg-[#3e2723]"
          >
            {penStandOpen ? <CloseIcon /> : <NibIcon />}
          </button>
        </div>
      </div>
    </div>
  );
}

function NibIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 2.5c1.8 2.6 2.7 5 2.7 7.3L12 21l-2.7-11.2c0-2.3.9-4.7 2.7-7.3z" />
      <circle cx="12" cy="13.2" r="1" fill="currentColor" stroke="none" />
      <path d="M12 16.5V21" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
