import { dbPromise } from "./db";
import type { Book, Bookmark } from "../types/book";
import * as pdfjs from "pdfjs-dist";
import pdfWorkerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

export async function addBook(file: File, onProgress?: (fraction: number) => void,): Promise<Book> {
  const db = await dbPromise;
  onProgress?.(0.1);
  async function extractPdfInfo(file: File): Promise<{ pageCount: number, coverThumbnail: string }> {
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: buffer }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 0.5 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;

    await page.render({ canvasContext: ctx, viewport, canvas }).promise;

    return {
      pageCount: pdf.numPages,
      coverThumbnail: canvas.toDataURL("image/png")
    }
  }

  const { pageCount, coverThumbnail } = await extractPdfInfo(file);
  onProgress?.(0.7);

  const book: Book = {
    id: crypto.randomUUID(),
    title: file.name.replace(/\.pdf$/i, ""),
    filename: file.name,
    fileSize: file.size,
    pageCount,
    coverThumbnail,
    addedAt: Date.now(),
    currentPage: 1,
    progress: 0,
  };

  const tx = db.transaction(["books", "files"], "readwrite");
  await Promise.all([
    tx.objectStore("books").add(book),
    tx.objectStore("files").add({ id: book.id, blob: file }),
    tx.done,
  ]);
  onProgress?.(1);
  return book;
}

export async function listBooks(): Promise<Book[]> {
  const db = await dbPromise;
  const books = await db.getAllFromIndex("books", "by-addedAt");
  return books.reverse();
}

export async function getBookFile(id: string): Promise<Blob | undefined> {
  const db = await dbPromise;
  const record = await db.get("files", id);
  return record?.blob;
}

export async function updateProgress(
  id: string,
  currentPage: number,
): Promise<void> {
  const db = await dbPromise;
  const book = await db.get("books", id);
  if (!book) return;

  book.currentPage = currentPage;
  book.progress = book.pageCount > 0 ? currentPage / book.pageCount : 0;
  book.lastOpenedAt = Date.now();

  await db.put("books", book);
}

export async function addBookmark(id: string, bookmark: Bookmark): Promise<void> {
  const db = await dbPromise;
  const book = await db.get("books", id);
  if (!book) return;

  book.bookmarks = [...(book.bookmarks ?? []), bookmark];
  await db.put("books", book);
}

export async function deleteBook(id: string): Promise<void> {
  const db = await dbPromise;
  const tx = db.transaction(["books", "files"], "readwrite");
  await Promise.all([
    tx.objectStore("books").delete(id),
    tx.objectStore("files").delete(id),
    tx.done,
  ]);
}
