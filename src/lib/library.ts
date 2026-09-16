import { dbPromise } from "./db";
import type { Book, Bookmark } from "../types/book";
import { STATIC_BOOKS } from "../data/books";

const REMOVED_KEY = "amadeus:removedBookIds";

function getRemovedIds(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(REMOVED_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}

function markRemoved(id: string) {
  const ids = getRemovedIds();
  ids.add(id);
  localStorage.setItem(REMOVED_KEY, JSON.stringify([...ids]));
}

export async function syncStaticBooks(): Promise<void> {
  const db = await dbPromise;
  const removed = getRemovedIds();

  const allBooks = await db.getAll("books");
  for (const book of allBooks) {
    if (!("pdfUrl" in book)) {
      await db.delete("books", book.id);
    }
  }

  for (const entry of STATIC_BOOKS) {
    if (removed.has(entry.id)) continue;
    const existingBook = await db.get("books", entry.id);

    if (existingBook) {
      await db.put("books", {
        ...existingBook,
        title: entry.title,
        author: entry.author,
        pageCount: entry.pageCount,
        pdfUrl: entry.pdfUrl,
        coverUrl: entry.coverUrl,
      });
      continue;
    }

    const book: Book = {
      ...entry,
      addedAt: Date.now(),
      currentPage: 1,
      progress: 0,
    };
    await db.put("books", book);
  }
}

export async function listBooks(): Promise<Book[]> {
  const db = await dbPromise;
  const books = await db.getAllFromIndex("books", "by-addedAt");
  return books.reverse();
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
  markRemoved(id);
  await db.delete("books", id);
}
