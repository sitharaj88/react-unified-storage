# @sitharaj08/react-unified-storage

[![npm version](https://badge.fury.io/js/%40sitharaj08%2Freact-unified-storage.svg)](https://badge.fury.io/js/%40sitharaj08%2Freact-unified-storage)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

**React bindings for unified storage** - One unified, secure, and modern storage solution for React applications.

## ✨ Features

- ⚡ **React hooks** with automatic re-rendering
- 🚀 **TypeScript-first** with strict typing and generics
- 🔒 **End-to-end encryption** with AES-GCM and PBKDF2
- 📦 **Automatic compression** with gzip
- 🔄 **Cross-tab synchronization** via BroadcastChannel API
- 💾 **Multiple storage drivers** (IndexedDB, localStorage, sessionStorage, memory)
- 🛡️ **SSR-safe** with automatic fallback to in-memory storage
- 📋 **Schema validation** with Zod integration
- ⏰ **TTL support** for automatic data expiration
- 🔄 **Versioning & migrations** for data evolution
- 📊 **Metadata tracking** (timestamps, driver info, versions)
- 🎯 **Tiny bundle** (<10KB gzipped)
- 🧪 **Comprehensive testing** with Vitest

## 📦 Installation

```bash
# React package (includes everything)
npm install @sitharaj08/react-unified-storage

# Peer dependencies
npm install react@^16.8.0
```

## 🚀 Quick Start

```tsx
import { StorageProvider, useStore } from '@sitharaj08/react-unified-storage';

function App() {
  return (
    <StorageProvider config={{ driver: 'auto' }}>
      <UserProfile />
    </StorageProvider>
  );
}

function UserProfile() {
  const [user, setUser] = useStore('user', {
    defaultValue: { name: 'Anonymous', theme: 'light' }
  });

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <button onClick={() => setUser({ ...user, theme: 'dark' })}>
        Toggle Theme
      </button>
    </div>
  );
}
```

## 🏗️ Architecture

This package provides React bindings for the core storage functionality. It includes:

- **`StorageProvider`** - Context provider for configuration
- **`useStore`** - Hook for individual key-value storage
- **`useStoreSuspense`** - Suspense-enabled version of useStore
- **`useCollection`** - Hook for collection-based storage

## 📚 API Reference

### StorageProvider

```tsx
<StorageProvider config={config}>
  <App />
</StorageProvider>
```

**Configuration Options:**
```typescript
interface StorageConfig {
  driver?: StorageDriver;
  namespace?: string;
  broadcast?: boolean;
  encryption?: {
    key: string;
    salt?: string;
  };
  compression?: boolean;
  errorHandler?: (error: Error) => void;
}
```

### useStore

```tsx
const [value, setValue, meta] = useStore<T>(key, options?);
```

**Parameters:**
- `key: string` - Storage key
- `options?: UseStoreOptions<T>`

**Returns:**
- `value: T` - Current stored value
- `setValue: (value: T) => Promise<void>` - Update function
- `meta?: StorageMeta` - Metadata (when `metadata: true`)

**Options:**
```typescript
interface UseStoreOptions<T> {
  defaultValue?: T;
  schema?: z.ZodSchema<T>;
  version?: number;
  metadata?: boolean;
  ttlMs?: number;
}
```

### useStoreSuspense

Suspense-enabled version of `useStore`:

```tsx
const [value, setValue] = useStoreSuspense<T>(key, options);
```

### useCollection

```tsx
const collection = useCollection<T>(name, options?);
```

Returns a collection instance with CRUD operations:

```tsx
await collection.add({ id: 1, name: 'Item' });
const items = await collection.list();
await collection.update(1, { name: 'Updated' });
await collection.remove(1);
```

## 🏗️ Storage Drivers

| Driver | Description | SSR Safe | Persistence | Size Limit | Best For |
|--------|-------------|----------|-------------|------------|----------|
| `auto` | Auto-selects best available | ✅ | ✅ | Varies | General use |
| `idb` | IndexedDB | ❌ | ✅ | ~50MB+ | Large datasets |
| `local` | localStorage | ❌ | ✅ | ~5-10MB | Small data |
| `session` | sessionStorage | ❌ | Tab-only | ~5-10MB | Temporary data |
| `memory` | In-memory | ✅ | Tab-only | Unlimited | SSR/Caching |

## 🔧 Advanced Usage

### Encryption Setup

```tsx
<StorageProvider config={{
  encryption: {
    key: 'your-32-character-secret-key-here!',
    salt: 'optional-salt-for-key-derivation'
  }
}}>
  <App />
</StorageProvider>
```

### Schema Validation & Migrations

```tsx
import { z } from 'zod';

const userSchemaV1 = z.object({
  name: z.string(),
  email: z.string()
});

const userSchemaV2 = z.object({
  name: z.string(),
  email: z.string(),
  avatar: z.string().optional()
});

const [user, setUser] = useStore('user', {
  schema: userSchemaV2,
  version: 2,
  // Migration function (if needed)
  migrate: (oldData, oldVersion) => {
    if (oldVersion === 1) {
      return { ...oldData, avatar: undefined };
    }
    return oldData;
  }
});
```

### Cross-Tab Synchronization

```tsx
// Automatic synchronization (enabled by default with broadcast: true)
<StorageProvider config={{ broadcast: true }}>
  <App />
</StorageProvider>
```

### TTL (Time To Live)

```tsx
// Expires in 1 hour
const [data, setData] = useStore('temp-token', {
  ttlMs: 60 * 60 * 1000
});
```

### Error Handling

```tsx
<StorageProvider config={{
  errorHandler: (error) => {
    console.error('Storage error:', error);
    // Send to error reporting service
  }
}}>
  <App />
</StorageProvider>
```

## 🌐 SSR & Server-Side Rendering

The library automatically detects SSR environments and falls back to memory storage:

```tsx
// This works in both SSR and client environments
<StorageProvider config={{ driver: 'auto' }}>
  <App />
</StorageProvider>
```

**SSR Behavior:**
- Server: Uses memory storage (no persistence)
- Client: Hydrates to chosen driver (IndexedDB/localStorage)
- Data consistency: Server and client data are isolated

## 🧪 Testing

```typescript
import { setup, read, write } from '@sitharaj08/react-unified-storage-core';
import { MemoryDriver } from '@sitharaj08/react-unified-storage-core';

// Use memory driver for testing
setup({ driver: 'memory' });

// Your tests here
test('should store and retrieve data', async () => {
  await write('test', { value: 42 });
  const result = await read('test');
  expect(result).toEqual({ value: 42 });
});
```

## 📊 Performance

- **Bundle Size:** <10KB gzipped (includes core functionality)
- **Operations:** ~1-2ms for localStorage, ~5-10ms for IndexedDB
- **Memory Usage:** Minimal overhead, efficient data structures
- **Compression:** Up to 70% size reduction for text data

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/sitharaj88/react-unified-storage/blob/main/CONTRIBUTING.md) for details.

## 📄 License

Apache License 2.0 © [Sitharaj Seenivasan](https://github.com/sitharaj88)