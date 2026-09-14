import type { Book } from "../types/book";
import { motion } from "framer-motion";

export function BookCard({ book, onOpen }: { book: Book; onOpen: (book: Book) => void }) {
    return (
        <button onClick={() => onOpen(book)} className="w-36">
            <motion.div layoutId={`cover-${book.id}`} className="aspect-[3/4] overflow-hidden rounded-sm border border-line bg-paper">
                {book.coverThumbnail ? (
                    <img
                        src={book.coverThumbnail}
                        alt={book.title}
                        className="w-full h-full object-cover"
                    />
                ) : null}
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
                >

                </div>
            </div>
        </button>
    )
}