import { useEffect, useState, useRef } from "react";
import { addBook, listBooks } from "../lib/library";
import type { Book } from "../types/book";
import { BookCard } from "./BookCard";
import { BookDetailPanel } from "./BookDetailPanel";


export function Library({ onOpenBook }: { onOpenBook: (book: Book) => void }) {
    type UploadItem = { name: string; progress: number; status: "en cola" | "subiendo" | "ok" };
    const [detailBook, setDetailBook] = useState<Book | null>(null);
    const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);
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
        const fileArray = Array.from(files);
        setLoading(true);
        setUploadQueue(fileArray.map((f) => ({ name: f.name, progress: 0, status: "en cola" })));

        for (let i = 0; i < fileArray.length; i++) {
            setUploadQueue((q) => q.map((item, idx) => (idx === i ? { ...item, status: "subiendo" } : item)));
            await addBook(fileArray[i], (fraction) => {
                setUploadQueue((q) => q.map((item, idx) => (idx === i ? { ...item, progress: fraction } : item)));
            });
            setUploadQueue((q) => q.map((item, idx) => (idx === i ? { ...item, status: "ok", progress: 1 } : item)));
        }

        await refresh();
        setLoading(false);
        setUploadQueue([]);
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
            {uploadQueue.length > 0 && (
                <div className="mx-[var(--pad-container)] mt-4 rounded-sm border border-dashed border-accent-lift/40 bg-surface p-4">
                    <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.1em] text-accent-lift">
                        Subiendo {Math.min(uploadQueue.filter((u) => u.status === "ok").length + 1, uploadQueue.length)} de {uploadQueue.length}
                    </p>
                    <ul className="flex flex-col gap-2">
                        {uploadQueue.map((item) => (
                            <li key={item.name} className="flex items-center gap-3">
                                <div className="flex-1">
                                    <p className="truncate text-sm">{item.name}</p>
                                    <div className="mt-1 h-0.5 w-full rounded-full bg-line">
                                        <div
                                            className="h-0.5 rounded-full bg-accent-lift transition-all"
                                            style={{ width: `${item.progress * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <span className="w-16 shrink-0 text-right font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted">
                                    {item.status === "ok" ? "OK" : item.status === "en cola" ? "En cola" : `${Math.round(item.progress * 100)}%`}
                                </span>
                            </li>
                        ))}
                    </ul>
                    <p className="mt-3 font-mono text-[10px] text-ink-muted">
                        La portada se toma de la primera página del PDF.
                    </p>
                </div>
            )}

            <main className="px-[var(--pad-container)] py-8">
                {books.length === 0 ? (
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault();
                            handleFiles(e.dataTransfer.files);
                        }}
                        className="flex flex-col items-center justify-center gap-4 rounded-sm border border-dashed border-line py-24 text-center"
                    >
                        <div className="h-12 w-9 rounded-sm border border-dashed border-line" />
                        <div>
                            <p className="font-serif text-lg">Tu biblioteca está vacía</p>
                            <p className="mt-1 text-sm text-ink-muted">
                                Arrastra archivos PDF aquí o añádelos desde la carpeta del proyecto.
                            </p>
                        </div>
                        <label className="cursor-pointer rounded-sm bg-accent px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em]">
                            Elegir archivos
                            <input
                                type="file"
                                accept="application/pdf"
                                multiple
                                className="hidden"
                                onChange={(e) => handleFiles(e.target.files)}
                            />
                        </label>
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
                />
            )}
        </div>
    )
}
