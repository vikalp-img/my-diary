"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import type { useEditor } from "@tiptap/react";
import type { Page } from "@/lib/types";
import { useDiaryStore } from "@/store/useDiaryStore";
import DiaryEditor from "./DiaryEditor";

function bgClass(bg: Page["background"]) {
  switch (bg) {
    case "grid":
      return "page-grid";
    case "dotted":
      return "page-dotted";
    case "blank":
      return "page-blank";
    default:
      return "page-ruled";
  }
}

interface Props {
  page: Page;
  notebookTitle: string;
  direction: number;
  editorRef: React.MutableRefObject<ReturnType<typeof useEditor> | null>;
}

export default function DiaryPage({ page, notebookTitle, direction, editorRef }: Props) {
  const renamePage = useDiaryStore((s) => s.renamePage);
  const titleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onTitle = (v: string) => {
    if (titleTimer.current) clearTimeout(titleTimer.current);
    titleTimer.current = setTimeout(() => void renamePage(page.id, v), 600);
  };

  return (
    <motion.article
      key={page.id}
      id="diary-page"
      initial={{ opacity: 0, x: direction >= 0 ? 90 : -90, rotateY: direction >= 0 ? 8 : -8 }}
      animate={{ opacity: 1, x: 0, rotateY: 0 }}
      exit={{ opacity: 0, x: direction >= 0 ? -90 : 90, rotateY: direction >= 0 ? -8 : 8 }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      className={`paper-sheet ${bgClass(page.background)} relative mx-auto min-h-[560px] w-full max-w-3xl rounded-r-xl rounded-l-sm shadow-page`}
      style={{ transformOrigin: "left center", transformStyle: "preserve-3d" }}
    >
      {/* spine */}
      <div className="absolute inset-y-0 left-0 w-10 rounded-l-sm bg-gradient-to-r from-black/15 via-black/5 to-transparent" />
      <div className="relative py-8 pl-16 pr-8 sm:pl-20 sm:pr-12">
        <div className="mb-1 font-[Georgia,serif] text-[11px] uppercase tracking-[0.22em] text-[#8a7355]">
          {notebookTitle} · {new Date(page.updatedAt).toLocaleDateString()}
        </div>
        <input
          key={`title-${page.id}`}
          defaultValue={page.title}
          onChange={(e) => onTitle(e.target.value)}
          placeholder="Give this page a title…"
          className="mb-3 w-full bg-transparent font-[var(--font-caveat)] text-3xl text-[#2b2118] placeholder:text-[#2b2118]/30 focus:outline-none"
        />
        <div className="gold-rule mb-4 opacity-70" />
        <DiaryEditor key={page.id} page={page} editorRef={editorRef} />
      </div>
    </motion.article>
  );
}
