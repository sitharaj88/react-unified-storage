import type { StorageConfig } from './types';
import { setup, read, write, remove, keys } from './core';

/**
 * Interface for collection-based data management.
 *
 * A Collection provides high-level CRUD operations for managing arrays/objects
 * as collections of items with unique IDs. Each item is stored with an
 * auto-generated UUID and can be accessed, modified, or removed individually.
 *
 * Collections are built on top of the core storage API and inherit all
 * configured features like encryption, compression, and cross-tab sync.
 *
 * @template T The type of items stored in the collection
 *
 * @example
 * ```typescript
 * interface Todo {
 *   title: string;
 *   completed: boolean;
 * }
 *
 * const todos = createCollection<Todo>('todos');
 *
 * // Add items
 * await todos.add({ title: 'Buy milk', completed: false });
 *
 * // List all items
 * const allTodos = await todos.list();
 *
 * // Find specific items
 * const completedTodos = await todos.find(todo => todo.completed);
 * ```
 */
export interface Collection<T = unknown> {
  /**
   * Adds a new item to the collection with an auto-generated UUID.
   *
   * @param item The item to add to the collection
   * @returns Promise that resolves when the item is added
   */
  add(item: T): Promise<void>;

  /**
   * Retrieves an item from the collection by its ID.
   *
   * @param id The unique identifier of the item
   * @returns Promise resolving to the item, or null if not found
   */
  get(id: string): Promise<T | null>;

  /**
   * Updates an existing item in the collection.
   *
   * @param id The unique identifier of the item to update
   * @param item The new item data
   * @returns Promise that resolves when the item is updated
   */
  update(id: string, item: T): Promise<void>;

  /**
   * Removes an item from the collection by its ID.
   *
   * @param id The unique identifier of the item to remove
   * @returns Promise that resolves when the item is removed
   */
  remove(id: string): Promise<void>;

  /**
   * Lists all items in the collection.
   *
   * @returns Promise resolving to an array of all items in the collection
   */
  list(): Promise<T[]>;

  /**
   * Removes all items from the collection.
   *
   * @returns Promise that resolves when all items are removed
   */
  clear(): Promise<void>;

  /**
   * Finds items in the collection that match a predicate function.
   *
   * @param predicate Function that returns true for items to include in results
   * @returns Promise resolving to an array of matching items
   */
  find(predicate: (item: T) => boolean): Promise<T[]>;

  /**
   * Returns the total number of items in the collection.
   *
   * @returns Promise resolving to the count of items
   */
  count(): Promise<number>;
}

/**
 * Creates a new collection for managing structured data.
 *
 * Collections provide a higher-level API for managing arrays/objects as
 * collections of items with unique IDs. Each collection is namespaced
 * and can have its own storage configuration.
 *
 * @template T The type of items that will be stored in the collection
 * @param name The name of the collection (used for key namespacing)
 * @param config Optional storage configuration for this collection. If provided, initializes storage with these settings
 * @returns A Collection instance for the specified type
 *
 * @example
 * ```typescript
 * // Create a simple collection
 * const users = createCollection<User>('users');
 *
 * // Create a collection with custom storage config
 * const secureTodos = createCollection<Todo>('todos', {
 *   driver: 'idb',
 *   encryption: { key: 'secret-password' },
 *   compression: true
 * });
 *
 * // Use the collection
 * await secureTodos.add({ title: 'Learn TypeScript', completed: false });
 * const todos = await secureTodos.list();
 * ```
 */
export function createCollection<T = unknown>(
  name: string,
  config?: Partial<StorageConfig>
): Collection<T> {
  // Initialize storage if not already done
  if (config) {
    setup(config);
  }

  const getKey = (id: string) => `${name}:${id}`;

  return {
    async add(item: T): Promise<void> {
      const id = crypto.randomUUID();
      await write(getKey(id), item);
    },

    async get(id: string): Promise<T | null> {
      return await read<T>(getKey(id));
    },

    async update(id: string, item: T): Promise<void> {
      await write(getKey(id), item);
    },

    async remove(id: string): Promise<void> {
      await remove(getKey(id));
    },

    async list(): Promise<T[]> {
      const allKeys = await keys(`${name}:`);
      const items: T[] = [];

      for (const key of allKeys) {
        const item = await read<T>(key);
        if (item !== null) {
          items.push(item);
        }
      }

      return items;
    },

    async clear(): Promise<void> {
      const allKeys = await keys(`${name}:`);
      await Promise.all(allKeys.map(key => remove(key)));
    },

    async find(predicate: (item: T) => boolean): Promise<T[]> {
      const allItems = await this.list();
      return allItems.filter(predicate);
    },

    async count(): Promise<number> {
      const allKeys = await keys(`${name}:`);
      return allKeys.length;
    }
  };
}