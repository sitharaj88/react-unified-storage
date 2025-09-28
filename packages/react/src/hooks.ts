import { useState, useEffect, useCallback } from 'react';
import { read, write, subscribe, type StorageMeta, type Envelope, getCurrentDriver } from '@sitharaj08/react-unified-storage-core';

/**
 * Options for configuring the useStore hook behavior.
 *
 * @template T The type of data being stored
 */
interface UseStoreOptions<T> {
  /** Default value to use when no data is stored */
  defaultValue?: T;
  /** Optional schema for data validation (passed through to core storage) */
  schema?: any;
  /** Custom version number for the stored data */
  version?: number;
  /** Whether to include metadata in the return value */
  metadata?: boolean;
}

/**
 * React hook for reactive storage access with automatic re-rendering.
 *
 * Provides a reactive way to read from and write to storage, automatically
 * updating components when data changes. Supports cross-tab synchronization
 * and optional schema validation.
 *
 * @template T The type of data being stored and retrieved
 * @param key The storage key to monitor and update
 * @param options Configuration options for the hook
 * @returns A tuple containing [currentValue, setValue, metadata]
 *
 * @example
 * ```typescript
 * function UserProfile() {
 *   const [user, setUser, meta] = useStore<User>('user-profile', {
 *     defaultValue: { name: '', email: '' },
 *     metadata: true
 *   });
 *
 *   const updateName = async (name: string) => {
 *     await setUser({ ...user, name });
 *   };
 *
 *   return (
 *     <div>
 *       <h1>{user.name}</h1>
 *       <p>Last updated: {meta?.updatedAt}</p>
 *       <button onClick={() => updateName('John')}>Update Name</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useStore<T>(
  key: string,
  options: UseStoreOptions<T> = {}
): [T | undefined, (value: T) => Promise<void>, StorageMeta | undefined] {
  const [state, setState] = useState<T | undefined>(options.defaultValue);
  const [meta, setMeta] = useState<StorageMeta | undefined>();

  const setValue = useCallback(async (value: T) => {
    try {
      await write(key, value, { v: options.version });
      setState(value);
    } catch (error) {
      console.error('Failed to write to storage:', error);
      // Still update local state even if storage fails
      setState(value);
    }
  }, [key, options.version]);

  useEffect(() => {
    // Initial read
    read<T>(key, options.schema).then((data) => {
      if (data !== null) {
        setState(data as T);
      }
    });

    // Subscribe to changes
    const unsubscribe = subscribe((changedKey: string, envelope: Envelope<unknown> | null) => {
      if (changedKey === key) {
        if (envelope) {
          // Re-read to get processed data
          read<T>(key, options.schema).then((data) => {
            if (data !== null) {
              setState(data);
            }
            if (options.metadata) {
              setMeta({
                createdAt: envelope.createdAt,
                updatedAt: envelope.updatedAt,
                expiresAt: envelope.expiresAt,
                driver: getCurrentDriver(),
                version: envelope.v,
              });
            }
          }).catch((error) => {
            console.error('Failed to read on broadcast:', error);
          });
        } else {
          setState(options.defaultValue);
          setMeta(undefined);
        }
      }
    });

    return unsubscribe;
  }, [key, options.schema, options.defaultValue, options.metadata]);

  return [state, setValue, meta];
}

// Suspense-friendly variant
/**
 * Suspense-compatible variant of useStore that throws a promise on initial load.
 *
 * This hook is designed to work with React Suspense, throwing a promise during
 * the initial data load. Once the data is loaded, it behaves like useStore but
 * guarantees that the value is never undefined.
 *
 * @template T The type of data being stored and retrieved
 * @param key The storage key to monitor and update
 * @param options Configuration options for the hook
 * @returns A tuple containing [currentValue, setValue, metadata] where currentValue is never undefined
 * @throws {Promise} During initial load when data is being fetched
 *
 * @example
 * ```typescript
 * function UserProfile() {
 *   // This will suspend until data is loaded
 *   const [user, setUser] = useStoreSuspense<User>('user-profile', {
 *     defaultValue: { name: 'Anonymous', email: '' }
 *   });
 *
 *   // user is guaranteed to be defined here
 *   return <h1>Welcome, {user.name}!</h1>;
 * }
 *
 * // Wrap with Suspense boundary
 * function App() {
 *   return (
 *     <Suspense fallback={<div>Loading...</div>}>
 *     <UserProfile />
 *     </Suspense>
 *   );
 * }
 * ```
 */
export function useStoreSuspense<T>(
  key: string,
  options: UseStoreOptions<T> = {}
): [T, (value: T) => Promise<void>, StorageMeta | undefined] {
  const [state, setValue, meta] = useStore(key, options);

  if (state === undefined) {
    throw read(key, options.schema).then((data) => {
      if (data === null && options.defaultValue !== undefined) {
        return options.defaultValue;
      }
      return data;
    });
  }

  return [state, setValue, meta];
}