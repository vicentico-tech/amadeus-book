export interface Book {
    id: string;
    title: string;
    author?: string;
    filename: string;
    fileSize: number;
    pageCount: number;
    addedAt: number;
    lastOpenedAt?: number;
    currentPage: number;
    progress: number;
    coverThumbnail?: string;
    bookmarks?: Bookmark[];
}

export type BookMeta = Omit<Book, "coverThumbnail">;

export interface BookFile {
    id: string;
    blob: Blob;
}

export interface Bookmark {
    label: string;
    page: number;
}
