import { useEffect, useState, useRef } from "react";
import { addBook, listBooks } from "../lib/library";
import type { Book } from "../types/book";
import { BookCard } from "./BookCard";


export function Library({ onOpenBook }: { onOpenBook: (book: Book) => void }) {
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState<"todos" | "leyendo" | "terminados">("todos");
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

    const filteredBooks = books.filter((book) => {
        const matchesQuery = book.title.toLowerCase().includes(query.toLowerCase());
        const matchesFilter =
            filter === "todos" ? true :
                filter === "leyendo" ? book.progress > 0 && book.progress < 1 :
                    book.progress >= 1;
        return matchesQuery && matchesFilter;
    });

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
            <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar"
                className="w-full rounded-sm border border-line bg-surface px-3 py-1.5 text-ink placeholder:text-ink-muted sm:max-w-xs">
            </input>

            <div className="flex gap-2">
                {(["todos", "leyendo", "terminados"] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-[0.1em] ${filter === f ? "bg-accent text-accent-lift" : "bg-surface text-ink-muted"
                            }`}>
                                {f}
                    </button>
                ))}
            </div>

            <main className="px-[var(--pad-container)] py-8">
                {filteredBooks.length === 0 ? (
                    <p className="text-ink-muted">
                        Aún no agregaste ningún PDF .
                    </p>
                ) : (
                    <div className="grid grid-cols-2 gap-[18px] sm:grid-cols-3 sm:gap-[20px] lg:grid-cols-4 xl:grid-cols-6 xl:gap-[26px]">
                        {filteredBooks.map((book) => (
                            <BookCard key={book.id} book={book} onOpen={onOpenBook} />
                        ))}

                    </div>
                )}
            </main>
        </div>
    )
}
