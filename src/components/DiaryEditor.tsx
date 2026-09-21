"use client";

import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import type { Page } from "@/lib/types";
import { nibSpec, penFontCss } from "@/lib/pens";
import { useDiaryStore } from "@/store/useDiaryStore";

interface Props {
  page: Page;
  editorRef?: React.MutableRefObject<ReturnType<typeof useEditor> | null>;
}

export default function DiaryEditor({ page, editorRef }: Props) {
  const updatePageContent = useDiaryStore((s) => s.updatePageContent);
  const penColor = useDiaryStore((s) => s.penColor);
  const penFont = useDiaryStore((s) => s.penFont);
  const nib = useDiaryStore((s) => s.nib);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: {},
        italic: false,
        heading: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
    ],
    content: page.contentHTML || "<p></p>",
    editorProps: {
      attributes: {
        class: "handwriting tiptap ProseMirror",
        spellcheck: "true",
      },
    },
    onUpdate: ({ editor }) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      const html = editor.getHTML();
      const json = editor.getJSON();
      saveTimer.current = setTimeout(() => {
        void updatePageContent(page.id, html, json);
      }, 700);
    },
  });

  // expose editor to toolbar (bold/underline/highlight buttons)
  useEffect(() => {
    if (editorRef) editorRef.current = editor;
    return () => {
      if (editorRef) editorRef.current = null;
    };
  }, [editor, editorRef]);

  // New keystrokes should pick up the current pen color.
  useEffect(() => {
    if (!editor) return;
    editor.chain().focus().setColor(penColor).run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [penColor]);

  // Autosave flush on unmount / page switch
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (editor && !editor.isDestroyed) {
        void updatePageContent(page.id, editor.getHTML(), editor.getJSON());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.id]);

  const spec = nibSpec(nib);

  if (!editor) {
    return (
      <div
        className="handwriting opacity-40"
        style={{ fontFamily: penFontCss(penFont), fontSize: spec.px }}
      >
        Opening your diary…
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: penFontCss(penFont),
        fontSize: spec.px,
        fontWeight: spec.weight,
        color: penColor,
      }}
    >
      <EditorContent editor={editor} />
    </div>
  );
}
