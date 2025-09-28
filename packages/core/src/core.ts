import type { StorageConfig, Envelope, Driver } from './types';
import { createDriver } from './drivers';
import { makeAesKey, encrypt, decrypt } from './crypto';
import { compress, decompress } from './compress';
import { BroadcastManager } from './broadcast';
import type { z } from 'zod';

let globalConfig: StorageConfig | null = null;
let driver: Driver | null = null;
let broadcastManager: BroadcastManager | null = null;
let encryptionKey: CryptoKey | null = null;
let currentDriverName: string = 'auto';

/**
 * Initializes the unified storage system with the provided configuration.
 *
 * This function must be called before using any storage operations. It sets up
 * the storage driver, encryption (if configured), compression (if configured),
 * and cross-tab synchronization (if enabled).
 *
 * @param config Configuration object specifying storage behavior and features
 * @throws {Error} If the requested storage driver is not available
 *
 * @example
 * ```typescript
 * // Basic setup with automatic driver selection
 * setup({
 *   driver: 'auto',
 *   namespace: 'my-app'
 * });
 *
 * // Advanced setup with encryption and compression
 * setup({
 *   driver: 'idb',
 *   namespace: 'secure-app',
 *   encryption: {
 *     key: 'my-secret-password',
 *     salt: 'optional-salt'
 *   },
 *   compression: true,
 *   broadcast: true
 * });
 * ```
 */
export function setup(config: StorageConfig): void {
  globalConfig = config;
  driver = createDriver(config.driver || 'auto', config.namespace);
  currentDriverName = driver.driverId();

  if (config.broadcast !== false) {
    broadcastManager = new BroadcastManager(config.namespace);
  }

  if (config.encryption) {
    // Initialize encryption key asynchronously
    makeAesKey(config.encryption.key, config.encryption.salt).then(key => {
      encryptionKey = key;
    }).catch(error => {
      console.error('Failed to initialize encryption key:', error);
      globalConfig?.errorHandler?.(error);
    });
  }
}

/**
 * Generates the full envelope key including namespace prefix.
 *
 * @private
 * @param key The base key
 * @returns The namespaced key
 */
function getEnvelopeKey(key: string): string {
  return globalConfig?.namespace ? `${globalConfig.namespace}:${key}` : key;
}

/**
 * Processes an envelope for reading, handling decryption and decompression.
 *
 * @private
 * @template T The expected data type
 * @param envelope The envelope to process
 * @returns The processed data, or null if expired
 */
async function processRead<T>(envelope: Envelope<T>): Promise<T | null> {
  // Check TTL
  if (envelope.expiresAt && Date.now() > envelope.expiresAt) {
    return null; // Expired
  }

  let data = envelope.data as string;

  // Decompress if needed
  if (globalConfig?.compression && envelope.v >= 2) { // Assume v2+ has compression
    const compressed = new Uint8Array(atob(data).split('').map(c => c.charCodeAt(0)));
    data = await decompress(compressed);
  }

  // Decrypt if needed
  if (encryptionKey && envelope.v >= 3) { // Assume v3+ has encryption
    data = await decrypt(data, encryptionKey);
  } else if (!encryptionKey && envelope.v >= 3) {
    // Encrypted data but key not ready - return null
    console.warn('Encrypted data found but encryption key not initialized');
    return null;
  }

  return JSON.parse(data);
}

/**
 * Processes data for writing, handling encryption and compression.
 *
 * @private
 * @template T The data type
 * @param data The data to process
 * @param version The envelope version
 * @param ttlMs Optional time-to-live in milliseconds
 * @returns The processed envelope
 */
async function processWrite<T>(data: T, version = 1, ttlMs?: number): Promise<Envelope<T>> {
  const now = Date.now();
  let processedData = JSON.stringify(data);

  // Encrypt if enabled
  if (encryptionKey) {
    processedData = await encrypt(processedData, encryptionKey);
    version = Math.max(version, 3);
  } else if (globalConfig?.encryption && !encryptionKey) {
    // Encryption enabled but key not ready - store without encryption for now
    console.warn('Encryption enabled but key not initialized - storing without encryption');
  }

  // Compress if enabled
  if (globalConfig?.compression) {
    const compressed = await compress(processedData);
    processedData = btoa(String.fromCharCode(...compressed));
    version = Math.max(version, 2);
  }

  const envelope: Envelope<T> = {
    v: version,
    data: processedData as T, // Store the processed string directly
    createdAt: now,
    updatedAt: now,
    expiresAt: ttlMs ? now + ttlMs : undefined,
  };

  return envelope;
}

/**
 * Reads data from storage by key with optional schema validation.
 *
 * Retrieves and processes data from storage, automatically handling decryption,
 * decompression, and TTL expiration. Optionally validates the data against
 * a Zod schema for type safety.
 *
 * @template T The expected return type
 * @param key The storage key to read
 * @param schema Optional Zod schema for data validation
 * @returns The stored data, or null if not found or expired
 * @throws {Error} If storage is not initialized or schema validation fails
 *
 * @example
 * ```typescript
 * // Simple read
 * const user = await read<User>('user-profile');
 *
 * // Read with schema validation
 * const userSchema = z.object({ name: z.string(), age: z.number() });
 * const validatedUser = await read('user-profile', userSchema);
 * ```
 */
export async function read<T>(key: string, schema?: z.ZodSchema<T>): Promise<T | null> {
  if (!driver) throw new Error('Storage not initialized. Call setup() first.');

  const envelopeKey = getEnvelopeKey(key);
  const envelope = await driver.read<T>(envelopeKey);

  if (!envelope) return null;

  try {
    const data = await processRead(envelope);

    // Validate schema if provided
    if (schema) {
      return schema.parse(data);
    }

    return data;
  } catch (error) {
    globalConfig?.errorHandler?.(error as Error);
    return null;
  }
}

/**
 * Writes data to storage with optional versioning and TTL.
 *
 * Stores data in the configured storage driver, automatically handling
 * encryption and compression if enabled. Updates cross-tab synchronization
 * if broadcasting is configured.
 *
 * @template T The data type being stored
 * @param key The storage key
 * @param data The data to store
 * @param options Additional options for the write operation
 * @param options.v Custom envelope version (auto-detected based on features)
 * @param options.ttlMs Time-to-live in milliseconds from now
 * @throws {Error} If storage is not initialized
 *
 * @example
 * ```typescript
 * // Basic write
 * await write('user-settings', { theme: 'dark', language: 'en' });
 *
 * // Write with TTL (expires in 1 hour)
 * await write('temp-token', token, { ttlMs: 60 * 60 * 1000 });
 *
 * // Write with custom version
 * await write('data', payload, { v: 5 });
 * ```
 */
export async function write<T>(key: string, data: T, options: { v?: number; ttlMs?: number } = {}): Promise<void> {
  if (!driver) throw new Error('Storage not initialized. Call setup() first.');

  const envelope = await processWrite(data, options.v, options.ttlMs);
  const envelopeKey = getEnvelopeKey(key);

  await driver.write(envelopeKey, envelope);
  broadcastManager?.broadcast(key, envelope);
}

/**
 * Removes data from storage by key.
 *
 * Deletes the specified key from storage and broadcasts the removal
 * to other tabs if cross-tab synchronization is enabled.
 *
 * @param key The storage key to remove
 * @throws {Error} If storage is not initialized
 *
 * @example
 * ```typescript
 * await remove('user-session');
 * ```
 */
export async function remove(key: string): Promise<void> {
  if (!driver) throw new Error('Storage not initialized. Call setup() first.');

  const envelopeKey = getEnvelopeKey(key);
  await driver.remove(envelopeKey);
  broadcastManager?.broadcast(key, null);
}

/**
 * Gets all storage keys, optionally filtered by prefix.
 *
 * Returns a list of all keys in storage, with namespace prefixes removed
 * for user-friendly access. Keys can be filtered by prefix for more
 * targeted queries.
 *
 * @param prefix Optional prefix to filter keys by
 * @returns Array of storage keys (without namespace prefixes)
 * @throws {Error} If storage is not initialized
 *
 * @example
 * ```typescript
 * // Get all keys
 * const allKeys = await keys();
 *
 * // Get keys starting with 'user-'
 * const userKeys = await keys('user-');
 * ```
 */
export async function keys(prefix?: string): Promise<string[]> {
  if (!driver) throw new Error('Storage not initialized. Call setup() first.');

  const allKeys = await driver.keys(globalConfig?.namespace ? `${globalConfig.namespace}:` : undefined);
  const strippedKeys = allKeys.map(k => globalConfig?.namespace ? k.slice(globalConfig.namespace.length + 1) : k);
  return prefix ? strippedKeys.filter(k => k.startsWith(prefix)) : strippedKeys;
}

/**
 * Clears all data from storage.
 *
 * Removes all keys and data from the current storage driver.
 * This operation cannot be undone.
 *
 * @throws {Error} If storage is not initialized
 *
 * @example
 * ```typescript
 * await clearAll(); // Removes everything!
 * ```
 */
export async function clearAll(): Promise<void> {
  if (!driver) throw new Error('Storage not initialized. Call setup() first.');

  await driver.clearAll();
}

/**
 * Gets the identifier of the currently active storage driver.
 *
 * @returns The driver identifier string, or 'none' if not initialized
 *
 * @example
 * ```typescript
 * console.log(driverId()); // 'idb', 'local', 'memory', etc.
 * ```
 */
export function driverId(): string {
  return driver?.driverId() || 'none';
}

/**
 * Subscribes to storage change events for cross-tab synchronization.
 *
 * Registers a callback that will be invoked when storage changes occur
 * in other browser tabs/windows. Only works if broadcasting is enabled
 * in the configuration.
 *
 * @param callback Function called when storage changes occur in other tabs
 * @returns Unsubscribe function to remove the listener
 *
 * @example
 * ```typescript
 * const unsubscribe = subscribe((key, envelope) => {
 *   if (envelope) {
 *     console.log(`Key ${key} was updated in another tab`);
 *   } else {
 *     console.log(`Key ${key} was removed in another tab`);
 *   }
 * });
 *
 * // Later: unsubscribe()
 * ```
 */
export function getCurrentDriver(): string {
  return currentDriverName;
}