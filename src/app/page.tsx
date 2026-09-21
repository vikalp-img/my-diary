"use client";

import { useEffect } from "react";
import { useDiaryStore } from "@/store/useDiaryStore";
import CoverShelf from "@/components/CoverShelf";
import NotebookView from "@/components/NotebookView";

export default function Home() {
  const loaded = useDiaryStore((s) => s.loaded);
  const loadAll = useDiaryStore((s) => s.loadAll);
  const currentNotebookId = useDiaryStore((s) => s.currentNotebookId);

  useEffect(() => {
    void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!loaded) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div
          className="text-4xl text-[#5d4037]"
          style={{ fontFamily: "var(--font-caveat)" }}
        >
          Opening your diary…
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      {currentNotebookId ? <NotebookView /> : <CoverShelf />}
    </main>
  );
}
