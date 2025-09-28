import type { Envelope, Driver } from './types';

/**
 * Web Storage API driver implementation for localStorage and sessionStorage.
 *
 * This driver provides access to the browser's Web Storage APIs (localStorage
 * and sessionStorage). It handles JSON serialization/deserialization and provides
 * error handling for storage quota exceeded or other storage-related errors.
 *
 * Key characteristics:
 * - localStorage: Persistent across browser sessions, ~5-10MB storage limit
 * - sessionStorage: Data lost when tab/window is closed, ~5-10MB storage limit
 * - Synchronous API wrapped in async methods for Driver interface compatibility
 * - Automatic JSON serialization of complex data types
 *
 * @implements {Driver}
 *
 * @example
 * ```typescript
 * // Using localStorage driver
 * const driver = new WebStorageDriver(window.localStorage);
 * await driver.write('user', { v: 1, data: { name: 'John' }, createdAt: Date.now(), updatedAt: Date.now() });
 *
 * // Using sessionStorage driver
 * const sessionDriver = new WebStorageDriver(window.sessionStorage);
 * ```
 */
export class WebStorageDriver implements Driver {
  /**
   * Creates a new Web Storage driver instance.
   *
   * @param storage The Storage object to use (localStorage or sessionStorage)
   * @param type The type identifier for this driver
   */
  constructor(private storage: Storage, private type: string) {}

  /**
   * Reads data from Web Storage by key.
   *
   * Attempts to retrieve and parse JSON data from storage. Returns null if
   * the key doesn't exist or if parsing fails.
   *
   * @template T The expected type of the stored data
   * @param key The unique key to read data for
   * @returns Promise resolving to the envelope if found and valid, null otherwise
   */
  async read<T>(key: string): Promise<Envelope<T> | null> {
    try {
      const item = this.storage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  /**
   * Writes data to Web Storage.
   *
   * Serializes the envelope to JSON and stores it. Silently ignores write
   * errors (e.g., quota exceeded) to maintain API consistency.
   *
   * @template T The type of data being stored
   * @param key The unique key to store the data under
   * @param envelope The envelope containing the data and metadata
   * @returns Promise that resolves when the write operation completes (or fails silently)
   */
  async write<T>(key: string, envelope: Envelope<T>): Promise<void> {
    try {
      this.storage.setItem(key, JSON.stringify(envelope));
    } catch {
      // Ignore write errors
    }
  }

  /**
   * Removes data from Web Storage by key.
   *
   * @param key The unique key to remove
   * @returns Promise that resolves when the removal is complete
   */
  async remove(key: string): Promise<void> {
    this.storage.removeItem(key);
  }

  /**
   * Gets all keys in Web Storage, optionally filtered by prefix.
   *
   * Iterates through all storage keys and returns those matching the optional prefix.
   *
   * @param prefix Optional prefix to filter keys by
   * @returns Promise resolving to an array of matching keys
   */
  async keys(prefix?: string): Promise<string[]> {
    const keys: string[] = [];
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key && (!prefix || key.startsWith(prefix))) {
        keys.push(key);
      }
    }
    return keys;
  }

  /**
   * Clears all data from Web Storage.
   *
   * @returns Promise that resolves when all data has been cleared
   */
  async clearAll(): Promise<void> {
    this.storage.clear();
  }

  /**
   * Returns the driver identifier based on the storage type.
   *
   * @returns 'local' for localStorage, 'session' for sessionStorage
   */
  driverId(): string {
    return this.type;
  }
}

/**
 * Pre-configured localStorage driver instance.
 *
 * This is a singleton instance of WebStorageDriver configured for localStorage.
 * Only available in browser environments - will be null in Node.js/SSR contexts.
 *
 * @example
 * ```typescript
 * if (localDriver) {
 *   await localDriver.write('key', envelope);
 * }
 * ```
 */
export const localDriver = typeof window !== 'undefined' ? new WebStorageDriver(window.localStorage, 'local') : null;

/**
 * Pre-configured sessionStorage driver instance.
 *
 * This is a singleton instance of WebStorageDriver configured for sessionStorage.
 * Only available in browser environments - will be null in Node.js/SSR contexts.
 *
 * @example
 * ```typescript
 * if (sessionDriver) {
 *   await sessionDriver.write('session-key', envelope);
 * }
 * ```
 */
export const sessionDriver = typeof window !== 'undefined' ? new WebStorageDriver(window.sessionStorage, 'session') : null;