import type { Envelope, Driver } from './types';

/**
 * IndexedDB storage driver implementation.
 *
 * This driver provides access to the browser's IndexedDB API, offering persistent
 * client-side storage with large capacity (typically hundreds of MB to GB).
 * It handles database initialization, schema management, and provides async
 * wrappers around IndexedDB's event-driven API.
 *
 * Key characteristics:
 * - Persistent storage across browser sessions
 * - Large storage capacity (limited by available disk space)
 * - Asynchronous API with proper transaction handling
 * - Automatic database schema creation and versioning
 * - Namespace support for isolating different applications
 *
 * @implements {Driver}
 *
 * @example
 * ```typescript
 * // Create a namespaced IndexedDB driver
 * const driver = new IndexedDBDriver('my-app-db', 'user-data');
 *
 * // Store and retrieve data
 * await driver.write('user-profile', {
 *   v: 1,
 *   data: { name: 'John', email: 'john@example.com' },
 *   createdAt: Date.now(),
 *   updatedAt: Date.now()
 * });
 *
 * const profile = await driver.read('user-profile');
 * ```
 */
export class IndexedDBDriver implements Driver {
  /** The IndexedDB database instance */
  private db: IDBDatabase | null = null;

  /** The name of the IndexedDB database */
  private dbName: string;

  /** The name of the object store within the database */
  private storeName: string;

  /**
   * Creates a new IndexedDB driver instance.
   *
   * @param dbName The name of the IndexedDB database (default: 'react-unified-storage')
   * @param storeName The name of the object store within the database (default: 'store')
   *
   * @example
   * ```typescript
   * // Default configuration
   * const driver = new IndexedDBDriver();
   *
   * // Custom database and store names
   * const customDriver = new IndexedDBDriver('my-app', 'cache');
   * ```
   */
  constructor(dbName = 'react-unified-storage', storeName = 'store') {
    this.dbName = dbName;
    this.storeName = storeName;
  }

  /**
   * Ensures the IndexedDB database is initialized and ready for use.
   *
   * This method lazily initializes the database connection and creates the
   * required object store if it doesn't exist. It handles database versioning
   * and schema upgrades automatically.
   *
   * @private
   * @returns Promise resolving to the initialized IDBDatabase instance
   * @throws {Error} If database initialization fails
   */
  private async ensureDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }

  /**
   * Reads data from IndexedDB by key.
   *
   * @template T The expected type of the stored data
   * @param key The unique key to read data for
   * @returns Promise resolving to the envelope if found, null otherwise
   */
  async read<T>(key: string): Promise<Envelope<T> | null> {
    const db = await this.ensureDB();
    return new Promise((resolve) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  }

  /**
   * Writes data to IndexedDB.
   *
   * @template T The type of data being stored
   * @param key The unique key to store the data under
   * @param envelope The envelope containing the data and metadata
   * @returns Promise that resolves when the write operation completes
   * @throws {Error} If the write operation fails
   */
  async write<T>(key: string, envelope: Envelope<T>): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(envelope, key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Removes data from IndexedDB by key.
   *
   * @param key The unique key to remove
   * @returns Promise that resolves when the removal is complete
   * @throws {Error} If the removal operation fails
   */
  async remove(key: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Gets all keys in IndexedDB, optionally filtered by prefix.
   *
   * Uses a cursor to iterate through all keys in the object store.
   *
   * @param prefix Optional prefix to filter keys by
   * @returns Promise resolving to an array of matching keys
   */
  async keys(prefix?: string): Promise<string[]> {
    const db = await this.ensureDB();
    return new Promise((resolve) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.openKeyCursor();
      const keys: string[] = [];

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          const key = cursor.key as string;
          if (!prefix || key.startsWith(prefix)) {
            keys.push(key);
          }
          cursor.continue();
        } else {
          resolve(keys);
        }
      };
      request.onerror = () => resolve([]);
    });
  }

  /**
   * Clears all data from the IndexedDB object store.
   *
   * @returns Promise that resolves when all data has been cleared
   * @throws {Error} If the clear operation fails
   */
  async clearAll(): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Returns the driver identifier.
   *
   * @returns The string identifier for this driver type
   */
  driverId(): string {
    return 'idb';
  }
}