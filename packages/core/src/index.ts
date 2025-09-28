/**
 * @packageDocumentation
 * @module @sitharaj08/react-unified-storage-core
 *
 * # React Unified Storage Core
 *
 * A comprehensive, type-safe storage library for React applications with support for
 * multiple storage drivers, encryption, compression, and cross-tab synchronization.
 *
 * ## Features
 *
 * - **Multiple Storage Drivers**: Memory, localStorage, sessionStorage, IndexedDB
 * - **Type Safety**: Full TypeScript support with generics and schema validation
 * - **Encryption**: AES-GCM encryption with PBKDF2 key derivation
 * - **Compression**: Gzip compression to reduce storage size
 * - **Cross-tab Sync**: Real-time synchronization across browser tabs
 * - **Collections API**: High-level CRUD operations for managing data collections
 * - **TTL Support**: Automatic expiration of stored data
 * - **Namespace Isolation**: Separate data for different application parts
 *
 * ## Quick Start
 *
 * ```typescript
 * import { setup, write, read } from '@sitharaj08/react-unified-storage-core';
 *
 * // Initialize storage
 * setup({
 *   driver: 'auto', // Automatically selects best available driver
 *   encryption: { key: 'my-secret-password' },
 *   compression: true
 * });
 *
 * // Store and retrieve data
 * await write('user-settings', { theme: 'dark', language: 'en' });
 * const settings = await read('user-settings');
 *
 * // Use collections for structured data
 * import { createCollection } from '@sitharaj08/react-unified-storage-core';
 *
 * const todos = createCollection('todos');
 * await todos.add({ title: 'Learn TypeScript', completed: false });
 * const allTodos = await todos.list();
 * ```
 *
 * ## API Overview
 *
 * ### Core Storage API
 * - {@link setup} - Initialize storage configuration
 * - {@link read} - Read data from storage
 * - {@link write} - Write data to storage
 * - {@link remove} - Remove data from storage
 * - {@link keys} - List storage keys
 * - {@link clearAll} - Clear all storage data
 * - {@link driverId} - Get current driver identifier
 * - {@link subscribe} - Subscribe to cross-tab changes
 *
 * ### Collections API
 * - {@link createCollection} - Create a typed collection
 * - {@link Collection} - Collection interface with CRUD operations
 *
 * ### Types and Configuration
 * - {@link StorageConfig} - Storage configuration options
 * - {@link StorageDriver} - Available storage driver types
 * - {@link Envelope} - Internal data envelope format
 * - {@link Driver} - Storage driver interface
 *
 * @see {@link https://github.com/sitharaj08/react-unified-storage|GitHub Repository}
 */

export * from './types';
export * from './core';
export * from './drivers';
export * from './collections';