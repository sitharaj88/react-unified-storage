import type { Envelope, Driver } from './types';

/**
 * In-memory storage driver implementation.
 *
 * This driver stores data in a JavaScript Map, providing fast synchronous-like
 * access to data that persists only for the current session. Data is lost when
 * the page is reloaded or the JavaScript context is destroyed.
 *
 * Ideal for:
 * - Temporary data storage during a session
 * - Testing and development
 * - Server-side rendering (SSR) environments
 * - Caching frequently accessed data
 *
 * @implements {Driver}
 *
 * @example
 * ```typescript
 * const driver = new MemoryDriver();
 * await driver.write('key', { v: 1, data: 'value', createdAt: Date.now(), updatedAt: Date.now() });
 * const result = await driver.read('key');
 * console.log(result?.data); // 'value'
 * ```
 */
export class MemoryDriver implements Driver {
  /** Internal storage using JavaScript Map for O(1) access */
  private store = new Map<string, Envelope>();

  /**
   * Reads data from memory storage by key.
   *
   * @template T The expected type of the stored data
   * @param key The unique key to read data for
   * @returns Promise resolving to the envelope if found, null otherwise
   */
  async read<T>(key: string): Promise<Envelope<T> | null> {
    return (this.store.get(key) as Envelope<T>) || null;
  }

  /**
   * Writes data to memory storage.
   *
   * @template T The type of data being stored
   * @param key The unique key to store the data under
   * @param envelope The envelope containing the data and metadata
   * @returns Promise that resolves when the write operation completes
   */
  async write<T>(key: string, envelope: Envelope<T>): Promise<void> {
    this.store.set(key, envelope);
  }

  /**
   * Removes data from memory storage by key.
   *
   * @param key The unique key to remove
   * @returns Promise that resolves when the removal is complete
   */
  async remove(key: string): Promise<void> {
    this.store.delete(key);
  }

  /**
   * Gets all keys in memory storage, optionally filtered by prefix.
   *
   * @param prefix Optional prefix to filter keys by
   * @returns Promise resolving to an array of matching keys
   */
  async keys(prefix?: string): Promise<string[]> {
    const keys = Array.from(this.store.keys());
    return prefix ? keys.filter(k => k.startsWith(prefix)) : keys;
  }

  /**
   * Clears all data from memory storage.
   *
   * @returns Promise that resolves when all data has been cleared
   */
  async clearAll(): Promise<void> {
    this.store.clear();
  }

  /**
   * Returns the driver identifier.
   *
   * @returns The string identifier for this driver type
   */
  driverId(): string {
    return 'memory';
  }
}