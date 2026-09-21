"use client";

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import type { Page } from "./types";
import { nibSpec, penFontCss } from "./pens";

function backgroundClass(bg: Page["background"]): string {
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

/** Export the currently visible page element (id="diary-page") to PDF. */
export async function exportSinglePageToPdf(filename = "diary-page.pdf") {
  const el = document.getElementById("diary-page");
  if (!el) throw new Error("Page element not found");
  const canvas = await html2canvas(el, {
    scale: 2,
    backgroundColor: "#fdfbf5",
    useCORS: true,
  });
  const img = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageW = 210;
  const pageH = 297;
  const ratio = canvas.height / canvas.width;
  let w = pageW - 16;
  let h = w * ratio;
  if (h > pageH - 16) {
    h = pageH - 16;
    w = h / ratio;
  }
  pdf.addImage(img, "PNG", (pageW - w) / 2, 8, w, h);
  pdf.save(filename);
}

/**
 * Export a full notebook: render each page's saved HTML off-screen with the
 * same diary styling, capture at 2x, and compile into one multi-page PDF.
 */
export async function exportNotebookToPdf(
  notebookTitle: string,
  pages: Page[],
  opts?: { font?: string; nibPx?: number }
) {
  if (pages.length === 0) throw new Error("No pages to export");

  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageW = 210;
  const pageH = 297;

  // Hidden staging container reusing the app's real CSS classes so the PDF
  // matches what you see (fonts, ink colors, ruled background).
  const stage = document.createElement("div");
  stage.style.position = "fixed";
  stage.style.left = "-10000px";
  stage.style.top = "0";
  stage.style.width = "794px"; // ~A4 ratio at 96dpi, good capture size
  document.body.appendChild(stage);

  try {
    // Ensure webfonts are ready for crisp capture
    try {
      await (document as Document).fonts?.ready;
    } catch {
      /* noop */
    }

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const nib = opts?.nibPx ?? 23;
      const fontCss =
        opts?.font ?? "var(--font-kalam), Kalam, Caveat, cursive";

      stage.innerHTML = "";
      const sheet = document.createElement("div");
      sheet.className = `paper-sheet ${backgroundClass(page.background)} handwriting`;
      sheet.style.width = "794px";
      sheet.style.minHeight = "1123px";
      sheet.style.padding = "64px 56px 64px 96px";
      sheet.style.fontFamily = fontCss;
      sheet.style.fontSize = `${nib}px`;
      sheet.style.color = "#1e2a6b";
      sheet.style.boxShadow = "none";
      sheet.innerHTML = `
        <div style="font-size:13px; letter-spacing:.18em; opacity:.55; margin-bottom:12px; font-family: Georgia, serif;">${escapeHtml(
          notebookTitle.toUpperCase()
        )} · ${escapeHtml(page.title.toUpperCase())}</div>
        <div>${page.contentHTML || "<p></p>"}</div>
      `;
      stage.appendChild(sheet);

      const canvas = await html2canvas(sheet, {
        scale: 2,
        backgroundColor: "#fdfbf5",
        useCORS: true,
      });
      const img = canvas.toDataURL("image/png");
      const ratio = canvas.height / canvas.width;
      let w = pageW - 16;
      let h = w * ratio;
      if (h > pageH - 16) {
        h = pageH - 16;
        w = h / ratio;
      }
      if (i > 0) pdf.addPage();
      pdf.addImage(img, "PNG", (pageW - w) / 2, 8, w, h);
    }
  } finally {
    stage.remove();
  }

  const safe = notebookTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "notebook";
  pdf.save(`${safe}-notebook.pdf`);
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export { nibSpec, penFontCss };
