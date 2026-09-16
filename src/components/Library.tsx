import { useEffect, useState } from "react";
import { deleteBook, listBooks, syncStaticBooks } from "../lib/library";
import type { Book } from "../types/book";
import { BookCard } from "./BookCard";
import { BookDetailPanel } from "./BookDetailPanel";


export function Library({ onOpenBook }: { onOpenBook: (book: Book) => void }) {
    const [detailBook, setDetailBook] = useState<Book | null>(null);
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState<"todos" | "leyendo" | "terminados">("todos");
    const [mobileTab, setMobileTab] = useState<"biblioteca" | "leyendo" | "ajustes">("biblioteca");
    const [books, setBooks] = useState<Book[]>([]);

    function selectMobileTab(tab: "biblioteca" | "leyendo" | "ajustes") {
        setMobileTab(tab);
        if (tab === "biblioteca") setFilter("todos");
        if (tab === "leyendo") setFilter("leyendo");
    }

    async function refresh() {
        setBooks(await listBooks());
    }

    useEffect(() => {
        // oxlint-disable-next-line react/set-state-in-effect -- carga inicial de libros al montar, patrón estándar de fetch-on-mount
        void syncStaticBooks().then(refresh);
    }, []);

    async function handleDeleteBook(book: Book) {
        await deleteBook(book.id);
        setDetailBook(null);
        await refresh();
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
        <div className="min-h-screen bg-app text-ink pb-16 sm:pb-0">
            <header className="flex items-center justify-between border-b border-line px-[var(--pad-container)] py-5">
                <h1 className="font-serif text-2xl leading-7">Biblioteca PDF</h1>
            </header>
            {mobileTab === "ajustes" ? (
                <main className="px-[var(--pad-container)] py-16 text-center">
                    <p className="font-serif text-lg">Ajustes</p>
                    <p className="mt-1 text-sm text-ink-muted">Próximamente.</p>
                </main>
            ) : (
                <>
                    <div className="flex flex-col gap-3 border-b border-line px-[var(--pad-container)] py-4 sm:flex-row sm:items-center sm:justify-between">
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Buscar"
                            className="w-full rounded-sm border border-line bg-surface px-3 py-1.5 text-ink placeholder:text-ink-muted sm:max-w-xs"
                        />

                        <div className="flex gap-2">
                            {(["todos", "leyendo", "terminados"] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-[0.1em] ${filter === f ? "bg-accent text-accent-lift" : "bg-surface text-ink-muted"
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <main className="px-[var(--pad-container)] py-8">
                        {books.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-4 rounded-sm border border-dashed border-line py-24 text-center">
                                <div className="h-12 w-9 rounded-sm border border-dashed border-line" />
                                <div>
                                    <p className="font-serif text-lg">Tu biblioteca está vacía</p>
                                    <p className="mt-1 text-sm text-ink-muted">
                                        Añade PDFs al catálogo estático del proyecto.
                                    </p>
                                </div>
                            </div>
                        ) : filteredBooks.length === 0 ? (
                            <p className="text-ink-muted">Sin resultados para tu búsqueda.</p>
                        ) : (
                            <div className="grid grid-cols-2 gap-[18px] sm:grid-cols-3 sm:gap-[20px] lg:grid-cols-4 xl:grid-cols-6 xl:gap-[26px]">
                                {filteredBooks.map((book) => (
                                    <BookCard key={book.id} book={book} onOpen={onOpenBook} onShowDetail={setDetailBook} />
                                ))}
                            </div>
                        )}
                    </main>
                </>
            )}
            <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-app sm:hidden">
                {(
                    [
                        { key: "biblioteca", label: "Biblioteca" },
                        { key: "leyendo", label: "Leyendo" },
                        { key: "ajustes", label: "Ajustes" },
                    ] as const
                ).map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => selectMobileTab(tab.key)}
                        className={`flex-1 py-3 text-center font-mono text-[11px] uppercase tracking-[0.1em] ${mobileTab === tab.key ? "text-accent-lift" : "text-ink-muted"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>
            {detailBook && (
                <BookDetailPanel
                    book={detailBook}
                    onClose={() => setDetailBook(null)}
                    onContinue={(book) => {
                        setDetailBook(null);
                        onOpenBook(book);
                    }}
                    onRestart={(book) => {
                        setDetailBook(null);
                        onOpenBook({ ...book, currentPage: 1 });
                    }}
                    onDelete={handleDeleteBook}
                />
            )}
        </div>
    )
}
