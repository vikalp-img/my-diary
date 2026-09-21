# My Diary

A single-user personal digital notebook — notes that look like handwritten diary entries, with PDF export. No login, no cloud. All data stays in your browser (IndexedDB).

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Tiptap rich-text editor styled with handwriting fonts (Kalam, Caveat, Shadows Into Light)
- IndexedDB via `idb` for storage, Zustand for UI state
- html2canvas + jsPDF for PDF export, framer-motion page turns

## Run it

```bash
npm install
npm run dev -- --port 5174
```

Open http://localhost:5174

## Features

- Pen toolbar: 4 ink colors, 3 handwriting fonts, 3 nib sizes, hand-drawn bold/underline, highlighter
- Multiple notebooks with covers, ruled/grid/dotted/blank pages, add/delete/reorder
- Debounced autosave to IndexedDB
- Export single page or full notebook to PDF
