export interface StaticBookEntry {
  id: string;
  title: string;
  author?: string;
  pageCount: number;
  pdfUrl: string;
  coverUrl: string;
}

export const STATIC_BOOKS: StaticBookEntry[] = [
  {
    id: "distancia-y-arraigo",
    title: "Distancia y Arraigo",
    author: "Amadeus",
    pageCount: 8,
    pdfUrl: "/books/distancia-y-arraigo.pdf",
    coverUrl: "/books/distancia-y-arraigo.jpg",
  },
  {
    id: "la-ranita",
    title: "La ranita Aventurera",
    author: "Amadeus",
    pageCount: 5,
    pdfUrl: "/books/la-ranita.pdf",
    coverUrl: "/books/la-ranita.jpg",
  },
  {
    id: "tono-suarez",
    title: "La Promesa del Mitarero",
    author: "Amadeus",
    pageCount: 46,
    pdfUrl: "/books/tono-suarez.pdf",
    coverUrl: "/books/tono-suarez.jpg",
  },
  {
    id: "kilometro-57",
    title: "Kilómetro 57",
    author: "Amadeus",
    pageCount: 1,
    pdfUrl: "/books/kilometro-57.pdf",
    coverUrl: "/books/kilometro-57.jpg",
  },
];
