import { openDB, type DBSchema } from 'idb';
import type { Book } from '../types/book';

interface AmadeusDB extends DBSchema {
    books: {
        key: string;
        value: Book;
        indexes: {
            "by-addedAt": number;
        }
    }
}

export const dbPromise = openDB<AmadeusDB>('amadeus-db', 2, {
    upgrade(db, oldVersion) {
        if (oldVersion < 1) {
            const books = db.createObjectStore('books', { keyPath: 'id' });
            books.createIndex('by-addedAt', 'addedAt');
        }
        const rawDb = db as unknown as IDBDatabase;
        if (oldVersion < 2 && rawDb.objectStoreNames.contains('files')) {
            rawDb.deleteObjectStore('files');
        }
    }
});
