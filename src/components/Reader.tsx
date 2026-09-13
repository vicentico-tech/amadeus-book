 import { useEffect, useState } from "react";
  import { Document, Page, pdfjs } from "react-pdf";
  import "react-pdf/dist/Page/TextLayer.css";
  import "react-pdf/dist/Page/AnnotationLayer.css";
  import { getBookFile, updateProgress } from "../lib/library";
  import type { Book } from "../types/book";

  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.js",
    import.meta.url,
  ).toString();

  export function Reader({ book, onBack }: { book: Book; onBack: () => void }) {
    const [file, setFile] = useState<Blob | null>(null);
    const [pageNumber, setPageNumber] = useState(book.currentPage);

    useEffect(() => {
      getBookFile(book.id).then((blob) => setFile(blob ?? null));
    }, [book.id]);

    function goTo(page: number) {
      const clamped = Math.min(Math.max(page, 1), book.pageCount);
      setPageNumber(clamped);
      updateProgress(book.id, clamped);
    }

    return (
      <div className="min-h-screen bg-canvas text-ink">
        <header className="flex items-center justify-between border-b border-line px-[var(--pad-container)] py-4">
          <button onClick={onBack} className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">
            ← Biblioteca
          </button>
          <h2 className="font-serif text-lg">{book.title}</h2>
          <span className="font-mono text-[11px] text-ink-muted">
            {pageNumber} / {book.pageCount}
          </span>
        </header>

        <main className="flex flex-col items-center gap-4 py-8">
          {file ? (
            <Document file={file}>
              <Page pageNumber={pageNumber} width={560} />
            </Document>
          ) : (
            <p className="text-ink-muted">Cargando...</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => goTo(pageNumber - 1)}
              className="rounded-sm bg-surface px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em]"
            >
              Anterior
            </button>
            <button
              onClick={() => goTo(pageNumber + 1)}
              className="rounded-sm bg-accent px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em]"
            >
              Siguiente
            </button>
          </div>
        </main>
      </div>
    );
  }