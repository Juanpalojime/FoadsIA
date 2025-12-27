import { api } from './api';

export interface Asset {
    id?: number;
    type: 'image' | 'video';
    content: string; // Base64 or Blob URL
    prompt: string;
    createdAt: number;
}

const DB_NAME = 'FoadsIA_DB';
const STORE_NAME = 'assets';
const DB_VERSION = 1;

export const db = {
    open: (): Promise<IDBDatabase> => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                    store.createIndex('createdAt', 'createdAt', { unique: false });
                }
            };

            request.onsuccess = (event) => {
                resolve((event.target as IDBOpenDBRequest).result);
            };

            request.onerror = (event) => {
                reject((event.target as IDBOpenDBRequest).error);
            };
        });
    },

    addAsset: async (asset: Omit<Asset, 'id'>): Promise<number> => {
        const dbInstance = await db.open();
        const id = await new Promise<number>((resolve, reject) => {
            const transaction = dbInstance.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.add(asset);
            request.onsuccess = () => resolve(request.result as number);
            request.onerror = () => reject(request.error);
        });

        // Sync to Cloud (Phase 12 Real)
        api.syncAsset({ ...asset, id });

        return id;
    },

    syncToCloud: async (): Promise<void> => {
        const assets = await db.getAllAssets();
        for (const asset of assets) {
            await api.syncAsset(asset);
        }
    },

    getAllAssets: async (): Promise<Asset[]> => {
        const dbInstance = await db.open();
        return new Promise((resolve, reject) => {
            const transaction = dbInstance.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const index = store.index('createdAt');
            const request = index.getAll();

            request.onsuccess = () => resolve((request.result as Asset[]).reverse());
            request.onerror = () => reject(request.error);
        });
    },

    deleteAsset: async (id: number): Promise<void> => {
        const dbInstance = await db.open();
        return new Promise((resolve, reject) => {
            const transaction = dbInstance.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
};
