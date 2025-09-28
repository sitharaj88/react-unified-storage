import type { Driver, StorageDriver } from './types';
import { MemoryDriver } from './memory';
import { localDriver, sessionDriver } from './webstorage';
import { IndexedDBDriver } from './indexeddb';

const isSSR = typeof window === 'undefined';

/**
 * Creates a storage driver instance based on the specified driver type.
 *
 * This factory function instantiates the appropriate storage driver implementation
 * based on the requested driver type. It handles automatic driver selection,
 * availability checks, and fallbacks for different environments (browser vs SSR).
 *
 * @param driver The type of storage driver to create
 * @param namespace Optional namespace for drivers that support namespacing (currently only IndexedDB)
 * @returns A configured storage driver instance
 * @throws {Error} If the requested driver is unknown or unavailable in the current environment
 *
 * @example
 * ```typescript
 * // Create a memory driver
 * const memoryDriver = createDriver('memory');
 *
 * // Create an IndexedDB driver with namespace
 * const idbDriver = createDriver('idb', 'my-app');
 *
 * // Auto-select the best available driver
 * const autoDriver = createDriver('auto');
 * ```
 *
 * @remarks
 * - In SSR environments, only 'memory' driver is available
 * - 'auto' driver tries IndexedDB first, then localStorage, then falls back to memory
 * - Web Storage drivers (local/session) are only available in browser environments
 */
export function createDriver(driver: StorageDriver, namespace?: string): Driver {
  switch (driver) {
    case 'memory':
      return new MemoryDriver();
    case 'local':
      if (isSSR || !localDriver) throw new Error('localStorage not available');
      return localDriver;
    case 'session':
      if (isSSR || !sessionDriver) throw new Error('sessionStorage not available');
      return sessionDriver;
    case 'idb':
      if (isSSR) throw new Error('IndexedDB not available in SSR');
      return new IndexedDBDriver(namespace);
    case 'auto':
      if (isSSR) return new MemoryDriver();
      try {
        return new IndexedDBDriver(namespace);
      } catch {
        try {
          if (localDriver) return localDriver;
        } catch {
          return new MemoryDriver();
        }
      }
      return new MemoryDriver();
    default:
      throw new Error(`Unknown driver: ${driver}`);
  }
}