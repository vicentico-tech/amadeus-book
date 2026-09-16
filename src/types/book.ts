export interface Book {
    id: string;
    title: string;
    author?: string;
    pdfUrl: string;
    coverUrl?: string;
    pageCount: number;
    addedAt: number;
    lastOpenedAt?: number;
    currentPage: number;
    progress: number;
    bookmarks?: Bookmark[];
}

export interface Bookmark {
    label: string;
    page: number;
}
