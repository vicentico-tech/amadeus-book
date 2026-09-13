import { useState } from "react";
import { Library } from "./components/Library";
import { Reader } from "./components/Reader";
import type { Book } from "./types/book";

function App() {
  const [openBook, setOpenBook] = useState<Book | null>(null);

  if (openBook) {
    return <Reader book={openBook} onBack={() => setOpenBook(null)} />;
  }

  return <Library onOpenBook={setOpenBook} />;
}

export default App
