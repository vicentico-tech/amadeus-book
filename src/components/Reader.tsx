  import { useEffect, useRef, useState } from "react";
  import { Document, Page, pdfjs } from "react-pdf";
  import "react-pdf/dist/Page/TextLayer.css";
  import "react-pdf/dist/Page/AnnotationLayer.css";
  import { getBookFile, updateProgress, addBookmark } from "../lib/library";
  import type { Book } from "../types/book";
  import { motion, AnimatePresence } from "framer-motion";
  import pdfWorkerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

  type TocEntry = { title: string; page: number | null };

  type PdfDocumentLike = {
    getOutline: () => Promise<Array<{ title: string; dest: unknown }> | null>;
    getDestination: (id: string) => Promise<unknown[] | null>;
    getPageIndex: (ref: unknown) => Promise<number>;
  };

  async function extractToc(pdf: PdfDocumentLike): Promise<TocEntry[]> {
    const outline = await pdf.getOutline();
    if (!outline || outline.length === 0) return [];

    const entries: TocEntry[] = [];
    for (const item of outline) {
      let page: number | null = null;
      try {
        let dest = item.dest;
        if (typeof dest === "string") {
          dest = await pdf.getDestination(dest);
        }
        if (Array.isArray(dest) && dest[0] != null) {
          page = (await pdf.getPageIndex(dest[0])) + 1;
        }
      } catch {
        page = null;
      }
      entries.push({ title: item.title, page });
    }
    return entries;
  }

  export function Reader({ book, onBack }: { book: Book; onBack: () => void }) {
    const [file, setFile] = useState<Blob | null>(null);
    const [pageNumber, setPageNumber] = useState(book.currentPage);
    const [direction, setDirection] = useState(0);
    const [isSpread, setIsSpread] = useState(() => window.matchMedia("(min-width: 1024px)").matches);
    const [toc, setToc] = useState<TocEntry[] | null>(null);
    const [showToc, setShowToc] = useState(false);
    const [controlsVisible, setControlsVisible] = useState(true);
    const hideTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
      getBookFile(book.id).then((blob) => setFile(blob ?? null));
    }, [book.id]);

    useEffect(() => {
      const mql = window.matchMedia("(min-width: 1024px)");
      const handler = (e: MediaQueryListEvent) => setIsSpread(e.matches);
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    }, []);

    useEffect(() => {
      function showControls() {
        setControlsVisible(true);
        if (hideTimeoutRef.current) window.clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = window.setTimeout(() => setControlsVisible(false), 2500);
      }

      showControls();
      const events = ["mousemove", "touchstart", "keydown", "click"] as const;
      events.forEach((e) => window.addEventListener(e, showControls));
      return () => {
        events.forEach((e) => window.removeEventListener(e, showControls));
        if (hideTimeoutRef.current) window.clearTimeout(hideTimeoutRef.current);
      };
    }, []);

    const step = isSpread ? 2 : 1;

    function goTo(page: number) {
      const clamped = Math.min(Math.max(page, 1), book.pageCount);
      setDirection(clamped > pageNumber ? 1 : -1);
      setPageNumber(clamped);
      updateProgress(book.id, clamped);
    }

    useEffect(() => {
      function handleKeyDown(e: KeyboardEvent) {
        if (e.key === "ArrowRight" || e.key === " ") {
          e.preventDefault();
          goTo(pageNumber + step);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          goTo(pageNumber - step);
        } else if (e.key === "Escape") {
          onBack();
        }
      }
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [pageNumber, step]);

    function handleAddBookmark() {
      addBookmark(book.id, { label: `Página ${pageNumber}`, page: pageNumber });
    }

    const showSecondPage = isSpread && pageNumber + 1 <= book.pageCount;

    return (
      <div className="min-h-screen bg-canvas text-ink">
        <header
          className={`flex items-center justify-between border-b border-line px-[var(--pad-container)] py-4 transition-opacity duration-200 ${
            controlsVisible ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <button onClick={onBack} className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">
            ← Biblioteca
          </button>
          <h2 className="font-serif text-lg">{book.title}</h2>
          <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">
            <span>
              {pageNumber}
              {showSecondPage ? `-${pageNumber + 1}` : ""} / {book.pageCount}
            </span>
            <button onClick={() => setShowToc(true)}>Índice</button>
            <button onClick={handleAddBookmark}>Marcador</button>
          </div>
        </header>

        <main className="flex flex-col items-center gap-4 py-8">
          <motion.div
            layoutId={`cover-${book.id}`}
            className={
              isSpread
                ? "flex w-[1120px] max-w-full gap-px overflow-hidden rounded-sm"
                : "aspect-[2/3] w-[560px] max-w-full overflow-hidden rounded-sm"
            }
          >
            {file ? (
              <Document
                file={file}
                onLoadSuccess={(pdf) => {
                  extractToc(pdf as unknown as PdfDocumentLike).then(setToc);
                }}
              >
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={pageNumber}
                    custom={direction}
                    initial={{ opacity: 0, x: direction >= 0 ? 40 : -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction >= 0 ? -40 : 40 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.6}
                    onDragEnd={(_, info) => {
                      if (info.offset.x < -80) goTo(pageNumber + step);
                      else if (info.offset.x > 80) goTo(pageNumber - step);
                    }}
                    className="flex gap-px"
                  >
                    <Page
                      pageNumber={pageNumber}
                      width={560}
                      loading={
                        <div className="flex aspect-[2/3] w-full items-center justify-center border border-dashed border-line bg-surface font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">
                          Renderizando
                        </div>
                      }
                    />
                    {showSecondPage && (
                      <Page
                        pageNumber={pageNumber + 1}
                        width={560}
                        loading={
                          <div className="flex aspect-[2/3] w-full items-center justify-center border border-dashed border-line bg-surface font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">
                            Renderizando
                          </div>
                        }
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </Document>
            ) : (
              <p className="text-ink-muted">Cargando...</p>
            )}
          </motion.div>

          <div
            className={`flex w-full max-w-[560px] flex-col items-center gap-3 px-[var(--pad-container)] transition-opacity duration-200 ${
              controlsVisible ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <div className="flex gap-3">
              <button
                onClick={() => goTo(pageNumber - step)}
                className="rounded-sm bg-surface px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em]"
              >
                Anterior
              </button>
              <button
                onClick={() => goTo(pageNumber + step)}
                className="rounded-sm bg-accent px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em]"
              >
                Siguiente
              </button>
            </div>

            <div className="flex w-full items-center gap-3 font-mono text-[11px] text-ink-muted">
              <span>{pageNumber}</span>
              <input
                type="range"
                min={1}
                max={book.pageCount}
                value={pageNumber}
                onChange={(e) => goTo(Number(e.target.value))}
                className="flex-1 accent-accent-lift"
              />
              <span>{book.pageCount}</span>
            </div>
          </div>
        </main>

        {showToc && (
          <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-canvas/80" onClick={() => setShowToc(false)} />
            <aside className="relative flex h-full w-full max-w-[300px] flex-col gap-1 overflow-y-auto border-r border-line bg-app px-4 py-6">
              <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">Contenido</p>
              {toc === null ? (
                <p className="text-sm text-ink-muted">Cargando índice...</p>
              ) : toc.length === 0 ? (
                <p className="text-sm text-ink-muted">Este PDF no tiene índice.</p>
              ) : (
                toc.map((entry, i) => (
                  <button
                    key={i}
                    disabled={entry.page === null}
                    onClick={() => {
                      if (entry.page !== null) {
                        goTo(entry.page);
                        setShowToc(false);
                      }
                    }}
                    className={`flex items-center justify-between rounded-sm px-2 py-2 text-left text-sm disabled:text-ink-muted ${
                      entry.page !== null && (pageNumber === entry.page || pageNumber + 1 === entry.page)
                        ? "bg-accent text-accent-lift"
                        : "text-ink"
                    }`}
                  >
                    <span className="truncate">{entry.title}</span>
                    {entry.page !== null && <span className="font-mono text-[11px] text-ink-muted">{entry.page}</span>}
                  </button>
                ))
              )}
            </aside>
          </div>
        )}
      </div>
    );
  }