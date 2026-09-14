import { useEffect, useState, useRef } from "react";
import { addBook, deleteBook, listBooks } from "../lib/library";
import type { Book } from "../types/book";
import { BookCard } from "./BookCard";
import { BookDetailPanel } from "./BookDetailPanel";


export function Library({ onOpenBook }: { onOpenBook: (book: Book) => void }) {
    type UploadItem = { name: string; progress: number; status: "en cola" | "subiendo" | "ok" };
    const [detailBook, setDetailBook] = useState<Book | null>(null);
    const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState<"todos" | "leyendo" | "terminados">("todos");
    const [mobileTab, setMobileTab] = useState<"biblioteca" | "leyendo" | "ajustes">("biblioteca");
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [pendingPdf, setPendingPdf] = useState<File | null>(null);
    const [pendingCover, setPendingCover] = useState<File | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

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
        void refresh();
    }, []);

    async function handleFiles(files: FileList | null) {
        if (!files || files.length === 0) return;
        const fileArray = Array.from(files);
        setLoading(true);
        setUploadQueue(fileArray.map((f) => ({ name: f.name, progress: 0, status: "en cola" })));

        for (let i = 0; i < fileArray.length; i++) {
            setUploadQueue((q) => q.map((item, idx) => (idx === i ? { ...item, status: "subiendo" } : item)));
            await addBook(fileArray[i], null, (fraction) => {
                setUploadQueue((q) => q.map((item, idx) => (idx === i ? { ...item, progress: fraction } : item)));
            });
            setUploadQueue((q) => q.map((item, idx) => (idx === i ? { ...item, status: "ok", progress: 1 } : item)));
        }

        await refresh();
        setLoading(false);
        setUploadQueue([]);
        if (inputRef.current) inputRef.current.value = "";
    }

    async function handleAddSingleBook() {
        if (!pendingPdf) return;
        const file = pendingPdf;
        const cover = pendingCover;
        setLoading(true);
        setUploadQueue([{ name: file.name, progress: 0, status: "subiendo" }]);

        await addBook(file, cover, (fraction) => {
            setUploadQueue((q) => q.map((item) => ({ ...item, progress: fraction })));
        });

        await refresh();
        setLoading(false);
        setUploadQueue([]);
        setShowAddDialog(false);
        setPendingPdf(null);
        setPendingCover(null);
    }

    function closeAddDialog() {
        setShowAddDialog(false);
        setPendingPdf(null);
        setPendingCover(null);
    }

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
                <button
                    onClick={() => setShowAddDialog(true)}
                    className="rounded-sm bg-accent px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em]"
                >
                    {loading ? "Cargando..." : "Agregar PDF"}
                </button>
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
                                        ref={inputRef}
                                        accept="application/pdf"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => handleFiles(e.target.files)}
                                    />
                                </label>
                                <button
                                    onClick={() => setShowAddDialog(true)}
                                    className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted underline"
                                >
                                    o agrega uno con portada personalizada
                                </button>
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
            {showAddDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-canvas/80" onClick={closeAddDialog} />
                    <div className="relative flex w-full max-w-sm flex-col gap-4 rounded-sm border border-line bg-app p-6">
                        <h3 className="font-serif text-lg">Agregar libro</h3>

                        <label className="flex flex-col gap-1 text-sm text-ink-muted">
                            Archivo PDF
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={(e) => setPendingPdf(e.target.files?.[0] ?? null)}
                                className="text-ink file:mr-3 file:cursor-pointer file:rounded-sm file:border-0 file:bg-surface file:px-3 file:py-1.5 file:font-mono file:text-[11px] file:uppercase file:tracking-[0.1em] file:text-ink"
                            />
                        </label>

                        <label className="flex flex-col gap-1 text-sm text-ink-muted">
                            Portada (JPEG, opcional)
                            <input
                                type="file"
                                accept="image/jpeg"
                                onChange={(e) => setPendingCover(e.target.files?.[0] ?? null)}
                                className="text-ink file:mr-3 file:cursor-pointer file:rounded-sm file:border-0 file:bg-surface file:px-3 file:py-1.5 file:font-mono file:text-[11px] file:uppercase file:tracking-[0.1em] file:text-ink"
                            />
                        </label>
                        <p className="text-[11px] text-ink-muted">
                            Si no eliges portada, se genera automáticamente desde la primera página del PDF.
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={closeAddDialog}
                                className="rounded-sm bg-surface px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em]"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAddSingleBook}
                                disabled={!pendingPdf || loading}
                                className="rounded-sm bg-accent px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] disabled:opacity-40"
                            >
                                {loading ? "Agregando..." : "Agregar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
