# Core API Reference

This document provides comprehensive API documentation for the `@sitharaj08/react-unified-storage-core` package.

## Table of Contents

- [Setup & Configuration](#setup--configuration)
- [Data Operations](#data-operations)
- [Collections API](#collections-api)
- [Utilities](#utilities)
- [Types](#types)
- [Error Handling](#error-handling)

## Setup & Configuration

### `setup(config: StorageConfig): Promise<void>`

Initializes the storage system with the provided configuration. This must be called before using any other storage functions.

```typescript
import { setup } from '@sitharaj08/react-unified-storage-core';

await setup({
  driver: 'auto',
  namespace: 'myapp',
  encryption: { key: 'secret-key' },
  compression: true,
  broadcast: true
});
```

**Parameters:**
- `config: StorageConfig` - Configuration object

**Throws:**
- `Error` if storage initialization fails

### `StorageConfig`

Configuration interface for storage setup.

```typescript
interface StorageConfig {
  /** Storage driver to use */
  driver?: StorageDriver;

  /** Optional namespace prefix for all keys */
  namespace?: string;

  /** Enable cross-tab synchronization */
  broadcast?: boolean;

  /** Encryption configuration */
  encryption?: {
    /** The encryption key (password) */
    key: string;
    /** Optional salt for key derivation */
    salt?: string;
  };

  /** Enable gzip compression */
  compression?: boolean;

  /** Error handler for storage operations */
  errorHandler?: (error: Error) => void;
}
```

## Data Operations

### `read<T>(key: string): Promise<T | null>`

Reads data from storage by key.

```typescript
const user = await read<User>('user-profile');
// Returns: User object or null if not found
```

**Type Parameters:**
- `T` - Expected type of the stored data

**Parameters:**
- `key: string` - Storage key

**Returns:** `Promise<T | null>`

### `write<T>(key: string, value: T, options?: WriteOptions): Promise<void>`

Writes data to storage with optional metadata.

```typescript
await write('user-settings', {
  theme: 'dark',
  language: 'en'
}, {
  ttlMs: 60 * 60 * 1000  // Expires in 1 hour
});
```

**Type Parameters:**
- `T` - Type of data being stored

**Parameters:**
- `key: string` - Storage key
- `value: T` - Data to store
- `options?: WriteOptions` - Optional write configuration

### `WriteOptions`

Options for write operations.

```typescript
interface WriteOptions {
  /** Time to live in milliseconds */
  ttlMs?: number;

  /** Data version for migration support */
  version?: number;
}
```

### `remove(key: string): Promise<void>`

Removes data from storage by key.

```typescript
await remove('temporary-token');
```

**Parameters:**
- `key: string` - Storage key to remove

### `keys(prefix?: string): Promise<string[]>`

Lists all storage keys, optionally filtered by prefix.

```typescript
// Get all keys
const allKeys = await keys();

// Get keys with prefix
const userKeys = await keys('user-');
```

**Parameters:**
- `prefix?: string` - Optional prefix to filter keys

**Returns:** `Promise<string[]>`

### `clearAll(): Promise<void>`

Clears all data from storage.

```typescript
await clearAll();  // Removes everything
```

**⚠️ Warning:** This operation cannot be undone.

## Collections API

### `createCollection<T>(name: string): Collection<T>`

Creates a typed collection for structured data management.

```typescript
interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

const todos = createCollection<Todo>('todos');
```

**Type Parameters:**
- `T` - Collection item type (must include `id` field)

**Parameters:**
- `name: string` - Collection name

**Returns:** `Collection<T>` instance

### `Collection<T>`

Interface for collection operations.

```typescript
interface Collection<T extends { id: string | number }> {
  /** Add a new item to the collection */
  add(item: Omit<T, 'id'>): Promise<T>;

  /** Get an item by ID */
  get(id: string | number): Promise<T | null>;

  /** Update an existing item */
  update(id: string | number, updates: Partial<T>): Promise<T>;

  /** Remove an item by ID */
  remove(id: string | number): Promise<void>;

  /** List all items with optional filter */
  list(filter?: (item: T) => boolean): Promise<T[]>;

  /** Clear all items in the collection */
  clear(): Promise<void>;
}
```

**Example Usage:**

```typescript
// Add items
const newTodo = await todos.add({
  title: 'Learn TypeScript',
  completed: false
});
// Returns: { id: 1, title: 'Learn TypeScript', completed: false }

// Update items
const updated = await todos.update(1, { completed: true });

// Query items
const completedTodos = await todos.list(todo => todo.completed);

// Remove items
await todos.remove(1);
```

## Utilities

### `driverId(): string`

Gets the identifier of the currently active storage driver.

```typescript
const driver = driverId();  // 'idb', 'local', 'session', or 'memory'
```

**Returns:** `string` - Driver identifier

### `getCurrentDriver(): StorageDriver`

Gets the current storage driver type with proper typing.

```typescript
const driver = getCurrentDriver();  // 'idb' | 'local' | 'session' | 'memory'
```

**Returns:** `StorageDriver`

### `subscribe(callback: BroadcastCallback): () => void`

Subscribes to cross-tab storage change events.

```typescript
const unsubscribe = subscribe((key, envelope) => {
  if (envelope) {
    console.log(`Key ${key} updated:`, envelope.data);
  } else {
    console.log(`Key ${key} removed`);
  }
});

// Later: unsubscribe();
```

**Parameters:**
- `callback: BroadcastCallback` - Function called on storage changes

**Returns:** `() => void` - Unsubscribe function

### `BroadcastCallback`

Callback function type for broadcast events.

```typescript
type BroadcastCallback = (key: string, envelope: Envelope<unknown> | null) => void;
```

## Types

### `StorageDriver`

Available storage driver types.

```typescript
type StorageDriver = 'memory' | 'local' | 'session' | 'idb' | 'auto';
```

### `Envelope<T>`

Internal data envelope format.

```typescript
interface Envelope<T> {
  /** Version of the storage system */
  v: number;

  /** Actual data */
  data: T;

  /** Creation timestamp */
  createdAt: number;

  /** Last update timestamp */
  updatedAt: number;

  /** Optional expiration timestamp */
  expiresAt?: number;

  /** Data version for migrations */
  version?: number;

  /** Storage driver used */
  driver: StorageDriver;
}
```

### `StorageMeta`

Metadata associated with stored data.

```typescript
interface StorageMeta {
  /** Timestamp when data was created */
  createdAt: number;

  /** Timestamp when data was last updated */
  updatedAt: number;

  /** Optional expiration timestamp */
  expiresAt?: number;

  /** Storage driver used */
  driver: StorageDriver;

  /** Version of the storage system */
  version: number;
}
```

## Error Handling

The library throws typed errors for various failure conditions:

### `StorageError`

Base error class for storage operations.

```typescript
class StorageError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'StorageError';
  }
}
```

### Common Error Codes

- `'STORAGE_NOT_INITIALIZED'` - Storage not set up
- `'DRIVER_UNAVAILABLE'` - Requested driver not available
- `'ENCRYPTION_FAILED'` - Encryption/decryption error
- `'COMPRESSION_FAILED'` - Compression/decompression error
- `'QUOTA_EXCEEDED'` - Storage quota exceeded
- `'INVALID_DATA'` - Data validation failed
- `'BROADCAST_UNSUPPORTED'` - BroadcastChannel not supported

### Error Handling Example

```typescript
import { setup, StorageError } from '@sitharaj08/react-unified-storage-core';

try {
  await setup({ driver: 'idb' });
} catch (error) {
  if (error instanceof StorageError) {
    switch (error.code) {
      case 'DRIVER_UNAVAILABLE':
        console.log('Falling back to localStorage');
        await setup({ driver: 'local' });
        break;
      default:
        console.error('Storage setup failed:', error.message);
    }
  }
}
```

## Advanced Usage

### Custom Migration Functions

```typescript
// Define schema versions
const userSchemaV1 = z.object({
  name: z.string(),
  email: z.string()
});

const userSchemaV2 = z.object({
  name: z.string(),
  email: z.string(),
  avatar: z.string().optional()
});

// Read with migration
const user = await read('user');
if (user && user.version === 1) {
  // Migrate v1 to v2
  const migratedUser = {
    ...user,
    avatar: undefined,
    version: 2
  };
  await write('user', migratedUser);
}
```

### Batch Operations

```typescript
// Batch read multiple keys
const keys = ['user', 'settings', 'cache'];
const results = await Promise.all(
  keys.map(key => read(key))
);

// Batch write with error handling
const operations = [
  write('key1', data1),
  write('key2', data2),
  write('key3', data3)
];

const results = await Promise.allSettled(operations);
results.forEach((result, index) => {
  if (result.status === 'rejected') {
    console.error(`Write ${index} failed:`, result.reason);
  }
});
```

### Memory Management

```typescript
// Clear expired data
const allKeys = await keys();
const now = Date.now();

for (const key of allKeys) {
  const envelope = await read(key);
  if (envelope?.expiresAt && envelope.expiresAt < now) {
    await remove(key);
  }
}
```

---

For React-specific APIs, see the [React API Reference](./react-api.md).</content>
<parameter name="filePath">/Users/admin/Documents/react-unified-storage/docs/api/core-api.md