# React Unified Storage

[![npm version](https://badge.fury.io/js/%40sitharaj08%2Freact-unified-storage.svg)](https://badge.fury.io/js/%40sitharaj08%2Freact-unified-storage)
[![npm version](https://badge.fury.io/js/%40sitharaj08%2Freact-unified-storage-core.svg)](https://badge.fury.io/js/%40sitharaj08%2Freact-unified-storage-core)
[![Build Status](https://github.com/sitharaj08/react-unified-storage/workflows/CI/badge.svg)](https://github.com/sitharaj08/react-unified-storage/actions)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@sitharaj08/react-unified-storage)](https://bundlephobia.com/package/@sitharaj08/react-unified-storage)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

*One unified, secure, and modern storage solution for React applications.*

**React Unified Storage** is a comprehensive, type-safe storage library that provides a modern API for managing application data with support for multiple storage backends, encryption, compression, and real-time cross-tab synchronization.

## ✨ Features

- 🚀 **TypeScript-first** with strict typing and generics
- 🔒 **End-to-end encryption** with AES-GCM and PBKDF2
- 📦 **Automatic compression** with gzip
- 🔄 **Cross-tab synchronization** via BroadcastChannel API
- 💾 **Multiple storage drivers** (IndexedDB, localStorage, sessionStorage, memory)
- ⚡ **React hooks** with automatic re-rendering
- 🛡️ **SSR-safe** with automatic fallback to in-memory storage
- 📋 **Schema validation** with Zod integration
- ⏰ **TTL support** for automatic data expiration
- 🔄 **Versioning & migrations** for data evolution
- 📊 **Metadata tracking** (timestamps, driver info, versions)
- 🎯 **Tiny bundle** (<6KB gzipped core, <10KB React package)
- 🧪 **Comprehensive testing** with Vitest
- 📖 **Full TypeScript support** with generated .d.ts files

## 📦 Installation

```bash
# React package (includes everything)
pnpm add @sitharaj08/react-unified-storage

# Core package only (framework-agnostic)
pnpm add @sitharaj08/react-unified-storage-core

# Peer dependencies (if using core package)
pnpm add zod
```

## 🚀 Quick Start

### React Integration

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

### Framework-Agnostic Usage

```typescript
import { setup, read, write } from '@sitharaj08/react-unified-storage-core';

// Initialize storage
setup({
  driver: 'auto',
  encryption: { key: 'your-secret-key' },
  compression: true
});

// Store and retrieve data
await write('settings', { theme: 'dark', language: 'en' });
const settings = await read('settings');
```

## 🏗️ Architecture

### Packages

- **`@sitharaj08/react-unified-storage`** - React bindings with hooks and context provider
- **`@sitharaj08/react-unified-storage-core`** - Core storage functionality (framework-agnostic)

### Storage Drivers

| Driver | Description | SSR Safe | Persistence | Size Limit | Best For |
|--------|-------------|----------|-------------|------------|----------|
| `auto` | Auto-selects best available | ✅ | ✅ | Varies | General use |
| `idb` | IndexedDB | ❌ | ✅ | ~50MB+ | Large datasets |
| `local` | localStorage | ❌ | ✅ | ~5-10MB | Small data |
| `session` | sessionStorage | ❌ | Tab-only | ~5-10MB | Temporary data |
| `memory` | In-memory | ✅ | Tab-only | Unlimited | SSR/Caching |

## 📚 API Reference

### React Hooks

#### `useStore`

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

#### `useStoreSuspense`

Suspense-enabled version of `useStore`:

```tsx
const [value, setValue] = useStoreSuspense<T>(key, options);
```

#### `useCollection`

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

### Core API

#### Setup & Configuration

```typescript
setup(config: StorageConfig): Promise<void>
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

#### Data Operations

```typescript
// Basic operations
read<T>(key: string): Promise<T | null>
write<T>(key: string, value: T, options?: WriteOptions): Promise<void>
remove(key: string): Promise<void>

// Bulk operations
keys(prefix?: string): Promise<string[]>
clearAll(): Promise<void>

// Collections
createCollection<T>(name: string): Collection<T>

// Utilities
driverId(): string
getCurrentDriver(): StorageDriver
subscribe(callback: BroadcastCallback): () => void
```

#### Collections API

```typescript
interface Collection<T extends { id: string | number }> {
  add(item: Omit<T, 'id'>): Promise<T>;
  get(id: string | number): Promise<T | null>;
  update(id: string | number, updates: Partial<T>): Promise<T>;
  remove(id: string | number): Promise<void>;
  list(filter?: (item: T) => boolean): Promise<T[]>;
  clear(): Promise<void>;
}
```

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

**Security Notes:**
- Uses PBKDF2 for key derivation (100,000 iterations)
- AES-GCM for encryption with random IVs
- Keys are derived per storage operation for security

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

// Manual subscription (core API)
import { subscribe } from '@sitharaj08/react-unified-storage-core';

const unsubscribe = subscribe((key, envelope) => {
  console.log(`Key ${key} changed:`, envelope?.data);
});
```

### TTL (Time To Live)

```tsx
// Expires in 1 hour
await write('temp-token', token, { ttlMs: 60 * 60 * 1000 });

// Check expiration
const [data, meta] = await readWithMeta('temp-token');
if (meta?.expiresAt && Date.now() > meta.expiresAt) {
  console.log('Token expired');
}
```

### Error Handling

```tsx
<StorageProvider config={{
  errorHandler: (error) => {
    console.error('Storage error:', error);
    // Send to error reporting service
    reportError(error);
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

- **Bundle Size:** Core: <6KB, React: <10KB (gzipped)
- **Operations:** ~1-2ms for localStorage, ~5-10ms for IndexedDB
- **Memory Usage:** Minimal overhead, efficient data structures
- **Compression:** Up to 70% size reduction for text data

## 🔍 Troubleshooting

### Common Issues

**"Storage not initialized"**
```typescript
// Ensure StorageProvider wraps your components
<StorageProvider config={{ driver: 'auto' }}>
  <App />
</StorageProvider>
```

**"Broadcasting not enabled"**
```typescript
// Enable broadcasting in config
<StorageProvider config={{ broadcast: true }}>
  <App />
</StorageProvider>
```

**SSR hydration mismatch**
```typescript
// Use memory driver for SSR-critical data
<StorageProvider config={{ driver: 'memory' }}>
  <App />
</StorageProvider>
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/sitharaj08/react-unified-storage.git
cd react-unified-storage

# Install dependencies
pnpm install

# Start development
pnpm dev

# Run tests
pnpm test

# Build packages
pnpm build
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/sitharaj08/react-unified-storage.git
cd react-unified-storage

# Install dependencies
pnpm install

# Start development
pnpm dev

# Run tests
pnpm test

# Build packages
pnpm build
```

## 🙏 Acknowledgments

- [Zod](https://zod.dev/) for schema validation
- [fflate](https://github.com/101arrowz/fflate) for compression
- [BroadcastChannel API](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel) for cross-tab sync

## Roadmap

- [ ] RN/Expo AsyncStorage driver
- [ ] DevTools overlay
- [ ] Collection API for IndexedDB
- [ ] React Query integration

## License
```

## 📄 License

MIT © [Sitharaj Seenivasan](https://github.com/sitharaj08)

## 🙏 Acknowledgments

- [Zod](https://zod.dev/) for schema validation
- [fflate](https://github.com/101arrowz/fflate) for compression
- [BroadcastChannel API](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel) for cross-tab sync

---

Made with ❤️ by [Sitharaj Seenivasan](https://github.com/sitharaj08)

## Quickstart

```tsx
import { StorageProvider, useStore } from '@sitharaj08/react-unified-storage';

function App() {
  return (
    <StorageProvider config={{ driver: 'auto' }}>
      <Counter />
    </StorageProvider>
  );
}

function Counter() {
  const [count, setCount] = useStore('counter', { defaultValue: 0 });
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  );
}
```

## Installation

```bash
pnpm add @sitharaj08/react-unified-storage
# or
npm install @sitharaj08/react-unified-storage
# or
yarn add @sitharaj08/react-unified-storage
```

## Drivers

| Driver | Description | SSR | Persistence | Size Limit |
|--------|-------------|-----|-------------|------------|
| `auto` | Chooses best available (IndexedDB → localStorage → memory) | ✅ | ✅ | Varies |
| `idb` | IndexedDB (recommended for large data) | ❌ | ✅ | ~50MB |
| `local` | localStorage | ❌ | ✅ | ~5-10MB |
| `session` | sessionStorage | ❌ | Tab-only | ~5-10MB |
| `memory` | In-memory (fallback) | ✅ | Tab-only | Unlimited |

## Configuration

```tsx
<StorageProvider config={{
  driver: 'auto',           // Storage driver
  namespace: 'myapp',       // Key prefix
  broadcast: true,          // Cross-tab sync
  encryption: {             // AES-GCM encryption
    key: 'your-secret-key',
    salt: 'optional-salt'
  },
  compression: true,        // Gzip compression
  errorHandler: console.error
}}>
  <App />
</StorageProvider>
```

## Hooks

### useStore

```tsx
const [value, setValue, meta] = useStore(key, {
  defaultValue: 'default',
  schema: z.string(),       // Zod validation
  version: 1,               // Data version
  metadata: true            // Include metadata
});

// meta = { createdAt, updatedAt, expiresAt?, driver, version }
```

### Suspense Support

```tsx
const [value, setValue] = useStoreSuspense(key, options);
```

## TTL (Time To Live)

```tsx
// Expires in 1 hour
await write('temp', data, { ttlMs: 60 * 60 * 1000 });
```

## Schema Validation & Migrations

```tsx
import { z } from 'zod';

const userSchema = z.object({
  name: z.string(),
  age: z.number()
});

const [user, setUser] = useStore('user', {
  schema: userSchema,
  version: 2
});

// Automatic migration from v1 to v2
```

## Encryption

```tsx
<StorageProvider config={{
  encryption: {
    key: 'your-32-char-secret-key-here',
    salt: 'optional-salt-for-pbkdf2'
  }
}}>
```

Uses PBKDF2 key derivation and AES-GCM encryption.

## SSR Guide

The library automatically detects SSR and falls back to memory storage:

```tsx
// Server-side: uses memory
// Client-side: uses IndexedDB/localStorage
<StorageProvider config={{ driver: 'auto' }}>
```

## Roadmap

- [ ] RN/Expo AsyncStorage driver
- [ ] DevTools overlay
- [ ] Collection API for IndexedDB
- [ ] React Query integration

## License

Copyright 2025 Sitharaj Seenivasan

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.