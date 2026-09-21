"use client";

import type { useEditor } from "@tiptap/react";
import {
  HIGHLIGHT_COLORS,
  INK_COLORS,
  NIBS,
  PEN_FONTS,
} from "@/lib/pens";
import { useDiaryStore } from "@/store/useDiaryStore";

interface Props {
  editorRef: React.MutableRefObject<ReturnType<typeof useEditor> | null>;
}

export default function PenToolbar({ editorRef }: Props) {
  const penColor = useDiaryStore((s) => s.penColor);
  const penFont = useDiaryStore((s) => s.penFont);
  const nib = useDiaryStore((s) => s.nib);
  const highlightColor = useDiaryStore((s) => s.highlightColor);
  const setPenColor = useDiaryStore((s) => s.setPenColor);
  const setPenFont = useDiaryStore((s) => s.setPenFont);
  const setNib = useDiaryStore((s) => s.setNib);
  const setHighlightColor = useDiaryStore((s) => s.setHighlightColor);

  const editor = editorRef.current;
  const boldActive = editor?.isActive("bold") ?? false;
  const underlineActive = editor?.isActive("underline") ?? false;

  const pickInk = (color: string) => {
    setPenColor(color);
    editorRef.current?.chain().focus().setColor(color).run();
  };

  const toggleBold = () => editorRef.current?.chain().focus().toggleBold().run();
  const toggleUnderline = () =>
    editorRef.current?.chain().focus().toggleUnderline().run();

  const pickHighlight = (color: string) => {
    if (highlightColor === color) {
      setHighlightColor(null);
      editorRef.current?.chain().focus().unsetHighlight().run();
    } else {
      setHighlightColor(color);
      editorRef.current?.chain().focus().setHighlight({ color }).run();
    }
  };

  return (
    <div className="pointer-events-auto w-full max-w-4xl rounded-2xl border border-[#e5d9bd] bg-[#fffdf6]/95 px-4 py-3 shadow-[0_16px_40px_-16px_rgba(62,39,35,.45)] backdrop-blur xl:w-52 xl:max-h-[80vh] xl:overflow-y-auto">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 xl:flex-col xl:flex-nowrap xl:items-stretch xl:gap-5">
        {/* rail header — desktop only */}
        <div className="hidden text-center xl:block">
          <div
            className="text-2xl leading-none text-[#2b2118]"
            style={{ fontFamily: "var(--font-caveat)" }}
          >
            Pen Stand
          </div>
          <div className="gold-rule mx-auto mt-2 w-16" />
        </div>
        {/* ink */}
        <div className="flex shrink-0 items-center gap-2 xl:flex-col xl:justify-center">
          <span className="text-[11px] uppercase tracking-[0.16em] text-[#8a7355] xl:w-full xl:text-center">
            Ink
          </span>
          {INK_COLORS.map((c) => (
            <button
              key={c.id}
              title={c.label}
              aria-label={c.label}
              onClick={() => pickInk(c.value)}
              className={`h-6 w-6 rounded-full border transition ${
                penColor === c.value
                  ? "scale-110 border-[#c9a227] ring-2 ring-[#c9a227]/50"
                  : "border-black/20 hover:scale-105"
              }`}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>

        <div className="hidden h-6 w-px bg-[#e5d9bd] sm:block xl:h-px xl:w-full" />

        {/* font */}
        <div className="flex shrink-0 items-center gap-1.5 xl:flex-col xl:items-stretch">
          <span className="text-[11px] uppercase tracking-[0.16em] text-[#8a7355] xl:w-full xl:text-center">
            Pen
          </span>
          {PEN_FONTS.map((f) => (
            <button
              key={f.id}
              onClick={() => setPenFont(f.id)}
              className={`rounded-full px-3 py-1 text-sm transition ${
                penFont === f.id
                  ? "bg-[#2b2118] text-[#f7f1e3]"
                  : "bg-[#f3ead3] text-[#5d4037] hover:bg-[#eadfc2]"
              }`}
              style={{ fontFamily: f.css }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="hidden h-6 w-px bg-[#e5d9bd] sm:block xl:h-px xl:w-full" />

        {/* nib */}
        <div className="flex shrink-0 items-center gap-1.5 xl:flex-col xl:justify-center">
          <span className="text-[11px] uppercase tracking-[0.16em] text-[#8a7355] xl:w-full xl:text-center">
            Nib
          </span>
          {NIBS.map((n) => (
            <button
              key={n.id}
              title={n.label}
              onClick={() => setNib(n.id)}
              className={`flex h-7 w-7 items-center justify-center rounded-full transition ${
                nib === n.id
                  ? "bg-[#2b2118] text-[#f7f1e3]"
                  : "bg-[#f3ead3] text-[#5d4037] hover:bg-[#eadfc2]"
              }`}
            >
              <span
                className="rounded-full bg-current"
                style={{
                  width: n.id === "thin" ? 4 : n.id === "medium" ? 7 : 10,
                  height: n.id === "thin" ? 4 : n.id === "medium" ? 7 : 10,
                }}
              />
            </button>
          ))}
        </div>

        <div className="hidden h-6 w-px bg-[#e5d9bd] sm:block xl:h-px xl:w-full" />

        {/* style — docked right on mobile, stacked in the rail on desktop */}
        <div className="ml-auto flex shrink-0 items-center gap-1.5 xl:ml-0 xl:flex-col xl:items-center">
          <button
            onClick={toggleBold}
            title="Bold (hand-drawn)"
            className={`rounded-lg px-2.5 py-1 font-bold transition ${
              boldActive ? "bg-[#2b2118] text-[#f7f1e3]" : "bg-[#f3ead3] hover:bg-[#eadfc2]"
            }`}
            style={{ fontFamily: "var(--font-kalam)" }}
          >
            B
          </button>
          <button
            onClick={toggleUnderline}
            title="Underline (hand-drawn)"
            className={`rounded-lg px-2.5 py-1 underline underline-offset-4 transition ${
              underlineActive
                ? "bg-[#2b2118] text-[#f7f1e3]"
                : "bg-[#f3ead3] hover:bg-[#eadfc2]"
            }`}
            style={{ fontFamily: "var(--font-kalam)" }}
          >
            U
          </button>
          <div className="ml-1 flex items-center gap-1 xl:ml-0">
            {HIGHLIGHT_COLORS.map((h) => (
              <button
                key={h.id}
                title={`Highlight ${h.label}`}
                aria-label={`Highlight ${h.label}`}
                onClick={() => pickHighlight(h.value)}
                className={`h-5 w-8 rounded-sm border transition ${
                  highlightColor === h.value
                    ? "scale-105 border-[#2b2118] ring-2 ring-[#c9a227]/60"
                    : "border-black/15 hover:scale-105"
                }`}
                style={{ backgroundColor: h.value, opacity: 0.75 }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
