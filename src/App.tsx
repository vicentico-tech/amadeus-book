import { useState } from "react";
import { Library } from "./components/Library";
import { Reader } from "./components/Reader";
import type { Book } from "./types/book";
import { AnimatePresence, motion } from "framer-motion";

function App() {
  const [openBook, setOpenBook] = useState<Book | null>(null);

  return (
    <AnimatePresence>
      {openBook ? (
        <motion.div key="reader" initial={{ opacity: 0}} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <Reader book={openBook} onBack={() => setOpenBook(null)}></Reader>
        </motion.div>
      ) : (
        <motion.div key="library" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <Library onOpenBook={setOpenBook}></Library>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default App
