import { openDB, type DBSchema } from 'idb';
import type { Book, BookFile } from '../types/book';

interface AmadeusDB extends DBSchema {
    books: {
        key: string;
        value: Book;
        indexes: {
            "by-addedAt": number;
        }
    }
    files: {
        key: string;
        value: BookFile;
    }

}

export const dbPromise = openDB<AmadeusDB>('amadeus-db', 1, {
    upgrade(db) {
        const books = db.createObjectStore('books', { keyPath: 'id' });
        books.createIndex('by-addedAt', 'addedAt');
        db.createObjectStore('files', { keyPath: 'id' });
    }
});