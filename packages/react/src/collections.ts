import { useState, useCallback } from 'react';
import type { Collection } from '@sitharaj08/react-unified-storage-core';
import { createCollection, type StorageConfig } from '@sitharaj08/react-unified-storage-core';

/**
 * React hook for reactive collection management with loading states.
 *
 * Provides a reactive interface to collections with additional React-specific
 * features like loading states and manual refresh capability. All collection
 * operations are available with the same API as the core Collection interface.
 *
 * @template T The type of items stored in the collection
 * @param name The name of the collection (used for key namespacing)
 * @param config Optional storage configuration for this collection
 * @returns Enhanced collection with React-specific features
 *
 * @example
 * ```typescript
 * interface Todo {
 *   title: string;
 *   completed: boolean;
 * }
 *
 * function TodoList() {
 *   const todos = useCollection<Todo>('todos');
 *
 *   const addTodo = async () => {
 *     await todos.add({ title: 'New task', completed: false });
 *   };
 *
 *   return (
 *     <div>
 *       {todos.isLoading && <div>Loading...</div>}
 *       <button onClick={addTodo} disabled={todos.isLoading}>
 *         Add Todo
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @remarks
 * The returned object includes all {@link Collection} methods plus:
 * - `refresh()`: Manually refresh the collection data
 * - `isLoading`: Boolean indicating if a refresh operation is in progress
 */
export function useCollection<T = unknown>(
  name: string,
  config?: Partial<StorageConfig>
): Collection<T> & {
  refresh: () => Promise<void>;
  isLoading: boolean;
} {
  const [isLoading, setIsLoading] = useState(false);
  const [collection] = useState(() => createCollection<T>(name, config));

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      // Force a refresh by re-reading data
      await collection.list();
    } finally {
      setIsLoading(false);
    }
  }, [collection]);

  // Enhanced collection with React-specific features
  const enhancedCollection: Collection<T> & { refresh: () => Promise<void>; isLoading: boolean } = {
    ...collection,
    refresh,
    isLoading,
  };

  return enhancedCollection;
}