"use client";

import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Notebook, Page } from "./types";
import { uid } from "./pens";

interface DiaryDB extends DBSchema {
  notebooks: {
    key: string;
    value: Notebook;
  };
  pages: {
    key: string;
    value: Page;
    indexes: { "by-notebook": string };
  };
}

const DB_NAME = "my-diary-db";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<DiaryDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<DiaryDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("notebooks")) {
          db.createObjectStore("notebooks", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("pages")) {
          const store = db.createObjectStore("pages", { keyPath: "id" });
          store.createIndex("by-notebook", "notebookId", { unique: false });
        }
      },
    });
  }
  return dbPromise;
}

const DEFAULT_NOTEBOOKS: { title: string; coverColor: string }[] = [
  { title: "Journal", coverColor: "#5d4037" },
  { title: "Work", coverColor: "#1b4332" },
  { title: "Ideas", coverColor: "#1f3a5f" },
];

export async function seedIfEmpty(): Promise<void> {
  const db = await getDB();
  const count = await db.count("notebooks");
  if (count > 0) return;
  const now = Date.now();
  for (let i = 0; i < DEFAULT_NOTEBOOKS.length; i++) {
    const n = DEFAULT_NOTEBOOKS[i];
    const nb: Notebook = {
      id: uid("nb"),
      title: n.title,
      coverColor: n.coverColor,
      createdAt: now + i,
      updatedAt: now + i,
    };
    await db.put("notebooks", nb);
    const page: Page = {
      id: uid("pg"),
      notebookId: nb.id,
      title: "Page 1",
      contentJSON: null,
      contentHTML: "<p></p>",
      order: 0,
      background: "ruled",
      createdAt: now + i,
      updatedAt: now + i,
    };
    await db.put("pages", page);
  }
}

export async function listNotebooks(): Promise<Notebook[]> {
  const db = await getDB();
  const all = await db.getAll("notebooks");
  return all.sort((a, b) => a.createdAt - b.createdAt);
}

export async function putNotebook(nb: Notebook): Promise<void> {
  const db = await getDB();
  await db.put("notebooks", nb);
}

export async function removeNotebook(id: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(["notebooks", "pages"], "readwrite");
  await tx.objectStore("notebooks").delete(id);
  const pages = await tx.objectStore("pages").index("by-notebook").getAll(id);
  await Promise.all(pages.map((p) => tx.objectStore("pages").delete(p.id)));
  await tx.done;
}

export async function listPages(notebookId: string): Promise<Page[]> {
  const db = await getDB();
  const pages = await db.getAllFromIndex("pages", "by-notebook", notebookId);
  return pages.sort((a, b) => a.order - b.order);
}

export async function putPage(page: Page): Promise<void> {
  const db = await getDB();
  await db.put("pages", page);
}

export async function removePage(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("pages", id);
}

export { uid };
