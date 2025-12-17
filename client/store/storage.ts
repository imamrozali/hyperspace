import { openDB, deleteDB, IDBPDatabase } from 'idb';

let dbPromise: Promise<IDBPDatabase> | null = null;

const getDB = () => {
  if (!dbPromise && typeof window !== 'undefined') {
    dbPromise = openDB('hyperspace', 1, {
      upgrade(db) {
        db.createObjectStore('app');
      },
    });
  }
  return dbPromise;
};

export const indexedDBStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const db = await getDB();
      if (!db) return null;
      const tx = db.transaction('app', 'readonly');
      const store = tx.objectStore('app');
      const value = await store.get(key);
      return value ?? null;
    } catch (error) {
      console.error('IndexedDB get error:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      const db = await getDB();
      if (!db) return;
      const tx = db.transaction('app', 'readwrite');
      const store = tx.objectStore('app');
      await store.put(value, key);
    } catch (error) {
      console.error('IndexedDB set error:', error);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      const db = await getDB();
      if (!db) return;
      const tx = db.transaction('app', 'readwrite');
      const store = tx.objectStore('app');
      await store.delete(key);
    } catch (error) {
      console.error('IndexedDB remove error:', error);
    }
  },
  clearAll: async (): Promise<void> => {
    try {
      const db = await getDB();
      if (!db) return;
      const tx = db.transaction('app', 'readwrite');
      const store = tx.objectStore('app');
      await store.clear();
    } catch (error) {
      console.error('IndexedDB clear error:', error);
    }
  },
  deleteDatabase: async (): Promise<void> => {
    try {
      if (typeof window !== 'undefined') {
        // Close any open DB
        if (dbPromise) {
          dbPromise = null;
        }
        await deleteDB('hyperspace');
      }
    } catch (error) {
      console.error('IndexedDB delete error:', error);
    }
  },
};