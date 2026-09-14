import { useState } from "react";
import type { Book } from "../types/book";

function formatSize(bytes: number): string {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function BookDetailPanel({
    book,
    onClose,
    onContinue,
    onRestart,
    onDelete,
}: {
    book: Book;
    onClose: () => void;
    onContinue: (book: Book) => void;
    onRestart: (book: Book) => void;
    onDelete: (book: Book) => void;
}) {
    const percent = Math.round(book.progress * 100);
    const [confirmingDelete, setConfirmingDelete] = useState(false);

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-canvas/80" onClick={onClose} />

            <aside className="relative flex h-full w-full max-w-[520px] flex-col gap-6 overflow-y-auto border-l border-line bg-app px-6 py-8">
                <button
                    onClick={onClose}
                    className="self-end font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted"
                >
                    Cerrar ✕
                </button>

                <div className="aspect-[2/3] w-40 overflow-hidden rounded-sm border border-line bg-paper">
                    {book.coverThumbnail ? (
                        <img src={book.coverThumbnail} alt={book.title} className="h-full w-full object-cover" />
                    ) : null}
                </div>

                <div>
                    <h2 className="font-serif text-2xl leading-7">{book.title}</h2>
                    {book.author ? <p className="mt-1 text-sm text-ink-muted">{book.author}</p> : null}

                    <div className="mt-3 flex gap-2">
                        <span className="rounded-full bg-surface px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted">
                            {book.pageCount} pág.
                        </span>
                        <span className="rounded-full bg-surface px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted">
                            {formatSize(book.fileSize)}
                        </span>
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
                        <span>Progreso</span>
                        <span>pág. {book.currentPage} / {book.pageCount} · {percent}%</span>
                    </div>
                    <div className="mt-2 h-1 w-full rounded-full bg-surface">
                        <div className="h-1 rounded-full bg-accent-lift" style={{ width: `${percent}%` }} />
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => onContinue(book)}
                        className="flex-1 rounded-sm bg-accent px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em]"
                    >
                        Seguir leyendo
                    </button>
                    <button
                        onClick={() => onRestart(book)}
                        className="flex-1 rounded-sm bg-surface px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em]"
                    >
                        Desde el inicio
                    </button>
                </div>

                <div>
                    <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">Marcadores</p>
                    {book.bookmarks && book.bookmarks.length > 0 ? (
                        <ul className="flex flex-col divide-y divide-line">
                            {book.bookmarks.map((bookmark) => (
                                <li key={`${bookmark.page}-${bookmark.label}`} className="flex items-center justify-between py-2 text-sm">
                                    <span>{bookmark.label}</span>
                                    <span className="font-mono text-[11px] text-ink-muted">p. {bookmark.page}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-ink-muted">Sin marcadores todavía.</p>
                    )}
                </div>

                <div className="mt-auto border-t border-line pt-4">
                    {confirmingDelete ? (
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-sm text-ink-muted">¿Eliminar este libro definitivamente?</p>
                            <div className="flex shrink-0 gap-2">
                                <button
                                    onClick={() => setConfirmingDelete(false)}
                                    className="rounded-sm bg-surface px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em]"
                                >
                                    No
                                </button>
                                <button
                                    onClick={() => onDelete(book)}
                                    className="rounded-sm bg-red-900 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink"
                                >
                                    Sí, eliminar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setConfirmingDelete(true)}
                            className="font-mono text-[11px] uppercase tracking-[0.1em] text-red-400"
                        >
                            Eliminar libro
                        </button>
                    )}
                </div>
            </aside>
        </div>
    );
}