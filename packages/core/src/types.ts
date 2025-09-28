/**
 * Available storage drivers for the unified storage system.
 *
 * - `'memory'`: In-memory storage (data lost on page reload)
 * - `'local'`: localStorage (persistent across browser sessions)
 * - `'session'`: sessionStorage (data lost when tab is closed)
 * - `'idb'`: IndexedDB (persistent, large storage capacity)
 * - `'auto'`: Automatically selects the best available driver
 */
export type StorageDriver = 'memory' | 'local' | 'session' | 'idb' | 'auto';

/**
 * Configuration options for the unified storage system.
 *
 * This interface defines all available configuration options that can be passed
 * to create a storage instance with specific behavior and features.
 */
export interface StorageConfig {
  /**
   * Optional namespace prefix for all keys.
   * Useful for isolating different parts of an application.
   * @default undefined
   */
  namespace?: string;

  /**
   * Storage driver to use. Can be a specific driver or 'auto' for automatic selection.
   * @default 'auto'
   */
  driver?: StorageDriver;

  /**
   * Enable cross-tab synchronization using BroadcastChannel API.
   * When enabled, changes in one tab will be reflected in other tabs.
   * @default false
   */
  broadcast?: boolean;

  /**
   * Encryption configuration for securing stored data.
   * When provided, all data will be encrypted using AES-GCM.
   * @default undefined
   */
  encryption?: {
    /** The encryption key (password) to use for data encryption */
    key: string;
    /** Optional salt for key derivation. If not provided, a default salt is used */
    salt?: string;
  };

  /**
   * Enable gzip compression for stored data.
   * Reduces storage size but adds CPU overhead for compression/decompression.
   * @default false
   */
  compression?: boolean;

  /**
   * Custom error handler for storage operations.
   * Called when storage operations fail (e.g., quota exceeded, driver unavailable).
   * @default undefined
   */
  errorHandler?: (error: Error) => void;
}

/**
 * Envelope wrapper for stored data with metadata.
 *
 * All data stored in the unified storage system is wrapped in an envelope
 * that contains the actual data along with metadata for versioning, timestamps,
 * and expiration handling.
 *
 * @template T The type of the stored data
 */
export interface Envelope<T = unknown> {
  /**
   * Version number of the envelope format.
   * Used for future migration and compatibility checks.
   */
  v: number;

  /** The actual data being stored */
  data: T;

  /** Timestamp when the data was first created (Unix timestamp in milliseconds) */
  createdAt: number;

  /** Timestamp when the data was last updated (Unix timestamp in milliseconds) */
  updatedAt: number;

  /**
   * Optional expiration timestamp.
   * If set, the data will be considered expired after this time.
   */
  expiresAt?: number;
}

/**
 * Metadata information about stored data.
 *
 * Provides information about when data was created/updated, which driver
 * was used, and other system-level information.
 */
export interface StorageMeta {
  /** Timestamp when the data was first created */
  createdAt: number;

  /** Timestamp when the data was last updated */
  updatedAt: number;

  /** Optional expiration timestamp */
  expiresAt?: number;

  /** The storage driver that was used to store this data */
  driver: StorageDriver;

  /** Version of the storage system that stored this data */
  version: number;
}

/**
 * Storage driver interface for implementing custom storage backends.
 *
 * This interface defines the contract that all storage drivers must implement.
 * Drivers handle the low-level storage operations for different storage mechanisms
 * like localStorage, IndexedDB, memory, etc.
 */
export interface Driver {
  /**
   * Read data from storage by key.
   *
   * @template T The expected type of the stored data
   * @param key The unique key to read data for
   * @returns Promise resolving to the envelope containing the data, or null if not found
   */
  read<T>(key: string): Promise<Envelope<T> | null>;

  /**
   * Write data to storage with the given key.
   *
   * @template T The type of data being stored
   * @param key The unique key to store the data under
   * @param envelope The envelope containing the data and metadata
   * @returns Promise that resolves when the write operation completes
   */
  write<T>(key: string, envelope: Envelope<T>): Promise<void>;

  /**
   * Remove data from storage by key.
   *
   * @param key The unique key to remove
   * @returns Promise that resolves when the removal is complete
   */
  remove(key: string): Promise<void>;

  /**
   * Get all keys in storage, optionally filtered by prefix.
   *
   * @param prefix Optional prefix to filter keys by
   * @returns Promise resolving to an array of matching keys
   */
  keys(prefix?: string): Promise<string[]>;

  /**
   * Clear all data from this storage driver.
   *
   * @returns Promise that resolves when all data has been cleared
   */
  clearAll(): Promise<void>;

  /**
   * Get a unique identifier for this driver type.
   *
   * @returns A string identifier for the driver (e.g., 'memory', 'localStorage')
   */
  driverId(): string;
}