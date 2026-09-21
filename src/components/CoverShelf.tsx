"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { COVER_COLORS } from "@/lib/pens";
import { useDiaryStore } from "@/store/useDiaryStore";

export default function CoverShelf() {
  const notebooks = useDiaryStore((s) => s.notebooks);
  const selectNotebook = useDiaryStore((s) => s.selectNotebook);
  const createNotebook = useDiaryStore((s) => s.createNotebook);
  const deleteNotebook = useDiaryStore((s) => s.deleteNotebook);

  const [title, setTitle] = useState("");
  const [cover, setCover] = useState(COVER_COLORS[0]);

  const add = () => {
    if (!title.trim()) return;
    void createNotebook(title.trim(), cover);
    setTitle("");
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-10 sm:px-8">
      <header className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-[#8a7355]">
          A personal handwritten notebook
        </p>
        <h1
          className="mt-2 text-5xl text-[#2b2118] sm:text-6xl"
          style={{ fontFamily: "var(--font-caveat)" }}
        >
          My Diary
        </h1>
        <div className="gold-rule mx-auto mt-4 max-w-xs" />
        <p className="mx-auto mt-3 max-w-md text-sm text-[#6b5a45]">
          Pick a book from the shelf to start writing. Everything is stored
          privately in your browser — no login, no cloud.
        </p>
      </header>

      <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3">
        {notebooks.map((nb, i) => (
          <motion.div
            key={nb.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="group relative"
          >
            <button
              onClick={() => void selectNotebook(nb.id)}
              className="block w-full rounded-r-lg rounded-l-sm text-left shadow-book transition-transform hover:-translate-y-1.5"
              style={{
                background: `linear-gradient(135deg, ${nb.coverColor} 0%, rgba(0,0,0,.35) 130%), linear-gradient(to right, rgba(0,0,0,.35) 0, transparent 14px), ${nb.coverColor}`,
              }}
            >
              <div className="flex h-56 flex-col justify-between p-5">
                <div className="rounded border border-[#c9a227]/50 px-2 py-3 text-center">
                  <div
                    className="truncate text-2xl text-[#f7f1e3]"
                    style={{ fontFamily: "var(--font-caveat)" }}
                  >
                    {nb.title}
                  </div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.24em] text-[#e9d48a]">
                    My Diary
                  </div>
                </div>
                <div className="text-center text-[11px] uppercase tracking-[0.2em] text-white/60 opacity-0 transition group-hover:opacity-100">
                  Open →
                </div>
              </div>
              <div className="absolute inset-y-0 left-0 w-2.5 rounded-l-sm bg-black/30" />
            </button>
            <button
              onClick={() => {
                if (confirm(`Delete “${nb.title}” and all its pages?`))
                  void deleteNotebook(nb.id);
              }}
              className="absolute right-2 top-2 rounded-full bg-black/40 px-2 py-0.5 text-xs text-white/80 opacity-0 transition hover:bg-black/60 group-hover:opacity-100"
            >
              ✕
            </button>
          </motion.div>
        ))}

        {/* new book card */}
        <div className="rounded-xl border border-dashed border-[#8a7355]/60 bg-[#fffdf6]/60 p-5">
          <div className="text-sm font-semibold text-[#2b2118]">New notebook</div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="e.g. Travel, Recipes…"
            className="mt-2 w-full rounded-lg border border-[#e5d9bd] bg-white/70 px-3 py-2 text-sm outline-none placeholder:text-[#8a7355]/60 focus:border-[#c9a227]"
          />
          <div className="mt-3 flex gap-2">
            {COVER_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setCover(c)}
                className={`h-6 w-6 rounded-full border ${
                  cover === c ? "ring-2 ring-[#c9a227] ring-offset-2" : "border-black/20"
                }`}
                style={{ backgroundColor: c }}
                aria-label={c}
              />
            ))}
          </div>
          <button
            onClick={add}
            disabled={!title.trim()}
            className="mt-4 w-full rounded-lg bg-[#2b2118] py-2 text-sm text-[#f7f1e3] transition disabled:opacity-40 hover:bg-[#3e2723]"
          >
            + Add book
          </button>
        </div>
      </div>

      <div className="shelf-wood mt-8 h-5 rounded-sm" />
      <div className="mx-auto h-8 w-[92%] rounded-b-xl bg-black/20 blur-[6px]" />
    </div>
  );
}
