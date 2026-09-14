import { Suspense, lazy, useState } from "react";
import { Library } from "./components/Library";
import type { Book } from "./types/book";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";

const Reader = lazy(() => import("./components/Reader").then((m) => ({ default: m.Reader })));

function App() {
  const [openBook, setOpenBook] = useState<Book | null>(null);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {openBook ? (
          <motion.div key="reader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Suspense fallback={null}>
              <Reader book={openBook} onBack={() => setOpenBook(null)}></Reader>
            </Suspense>
          </motion.div>
        ) : (
          <motion.div key="library" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Library onOpenBook={setOpenBook}></Library>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  )
}

export default App
