# @sitharaj08/react-unified-storage-core

[![npm version](https://badge.fury.io/js/%40sitharaj08%2Freact-unified-storage-core.svg)](https://badge.fury.io/js/%40sitharaj08%2Freact-unified-storage-core)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

**Framework-agnostic core storage library** - One unified, secure, and modern storage solution.

## ✨ Features

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
- 🎯 **Tiny bundle** (<6KB gzipped)
- 🧪 **Comprehensive testing** with Vitest

## 📦 Installation

```bash
# Core package only (framework-agnostic)
npm install @sitharaj08/react-unified-storage-core

# Peer dependencies
npm install zod
```

## 🚀 Quick Start

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

## 🏗️ Storage Drivers

| Driver | Description | SSR Safe | Persistence | Size Limit | Best For |
|--------|-------------|----------|-------------|------------|----------|
| `auto` | Auto-selects best available | ✅ | ✅ | Varies | General use |
| `idb` | IndexedDB | ❌ | ✅ | ~50MB+ | Large datasets |
| `local` | localStorage | ❌ | ✅ | ~5-10MB | Small data |
| `session` | sessionStorage | ❌ | Tab-only | ~5-10MB | Temporary data |
| `memory` | In-memory | ✅ | Tab-only | Unlimited | SSR/Caching |

## 📚 API Reference

### Setup & Configuration

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

### Data Operations

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

### Collections API

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

```typescript
setup({
  encryption: {
    key: 'your-32-character-secret-key-here!',
    salt: 'optional-salt-for-key-derivation'
  }
});
```

**Security Notes:**
- Uses PBKDF2 for key derivation (100,000 iterations)
- AES-GCM for encryption with random IVs
- Keys are derived per storage operation for security

### Schema Validation & Migrations

```typescript
import { z } from 'zod';

const userSchemaV1 = z.object({
  name: z.string(),
  email: z.string()
});

setup({
  schema: userSchemaV1,
  version: 1,
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

```typescript
// Enable broadcasting
setup({ broadcast: true });

// Manual subscription
import { subscribe } from '@sitharaj08/react-unified-storage-core';

const unsubscribe = subscribe((key, envelope) => {
  console.log(`Key ${key} changed:`, envelope?.data);
});
```

### TTL (Time To Live)

```typescript
// Expires in 1 hour
await write('temp-token', token, { ttlMs: 60 * 60 * 1000 });

// Check expiration
const [data, meta] = await readWithMeta('temp-token');
if (meta?.expiresAt && Date.now() > meta.expiresAt) {
  console.log('Token expired');
}
```

## 🧪 Testing

```typescript
import { setup, read, write } from '@sitharaj08/react-unified-storage-core';

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

- **Bundle Size:** <6KB gzipped
- **Operations:** ~1-2ms for localStorage, ~5-10ms for IndexedDB
- **Memory Usage:** Minimal overhead, efficient data structures
- **Compression:** Up to 70% size reduction for text data

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/sitharaj88/react-unified-storage/blob/main/CONTRIBUTING.md) for details.

## 📄 License

Apache License 2.0 © [Sitharaj Seenivasan](https://github.com/sitharaj88)