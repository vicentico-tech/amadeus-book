import type { Book } from "../types/book";
import { motion } from "framer-motion";

export function BookCard({
    book,
    onOpen,
    onShowDetail,
}: {
    book: Book;
    onOpen: (book: Book) => void;
    onShowDetail: (book: Book) => void;
}) {
    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => onOpen(book)}
            onKeyDown={(e) => {
                if (e.key === "Enter") onOpen(book);
            }}
            className="w-full cursor-pointer text-left"
        >
            <motion.div layoutId={`cover-${book.id}`} className="relative aspect-[2/3] overflow-hidden rounded-sm border border-line bg-paper shadow-[0_18px_40px_-16px_rgba(0,0,0,.9),0_8px_30px_-12px_rgba(147,169,228,.28)]">
                <div className="absolute inset-y-0 left-0 w-1 bg-black/40" />
                {book.coverThumbnail ? (
                    <img
                        src={book.coverThumbnail}
                        alt={book.title}
                        className="w-full h-full object-cover"
                    />
                ) : null}
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(150deg,rgba(255,255,255,.12),transparent_46%)]" />

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onShowDetail(book);
                    }}
                    aria-label="Ver detalle del libro"
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-canvas/70 font-serif text-xs text-ink backdrop-blur-sm"
                >
                    i
                </button>
            </motion.div>

            <h3 className="mt-2 truncate font-serif text-sm leading-5">
                {book.title}
            </h3>

            <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted">
                {book.pageCount} pag · {Math.round(book.progress * 100)}%
            </p>

            <div className="mt-1 h-1 w-full rounded-full bg-surface">
                <div
                    className="h-1 rounded-full bg-accent-lift"
                    style={{ width: `${book.progress * 100}%` }}
                />
            </div>
        </div>
    )
}