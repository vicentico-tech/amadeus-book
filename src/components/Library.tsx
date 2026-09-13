import { useEffect, useState, useRef } from "react";
import { addBook, listBooks } from "../lib/library";
import type { Book } from "../types/book";
import { BookCard } from "./BookCard";


export function Library({ onOpenBook }: { onOpenBook: (book: Book) => void }) {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);

    async function refresh() {
        setBooks(await listBooks());
    }

    useEffect(() => {
        refresh();
    }, []);

    async function handleFiles(files: FileList | null) {
        if (!files || files.length === 0) return;
        setLoading(true);
        for (const file of Array.from(files)) {
            await addBook(file);
        }
        await refresh();
        setLoading(false);
        if (inputRef.current) inputRef.current.value = "";
    }

    return (
        <div className="min-h-screen bg-app text-ink">
            <header className="flex items-center justify-between border-b border-line px-[var(--pad-container)] py-5">
                <h1 className="font-serif text-2xl leading-7">Biblioteca PDF</h1>

                <label className="cursor-pointer rounded-sm bg-accent px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em]">
                    {loading ? "Cargando..." : "Agregar PDF"}
                    <input
                        type="file"
                        ref={inputRef}
                        accept="application/pdf"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFiles(e.target.files)}
                    />
                </label>
            </header>

            <main className="px-[var(--pad-container)] py-8">
                {books.length === 0 ? (
                    <p className="text-ink-muted">
                        Aún no agregaste ningún PDF .
                    </p>
                ) : (
                    <div className="flex flex-wrap gap-6">
                        {books.map((book) => (
                            <BookCard key={book.id} book={book} onOpen={onOpenBook} />
                        ))}

                    </div>
                )}
            </main>
        </div>
    )
}
