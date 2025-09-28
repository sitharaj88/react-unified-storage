# React Unified Storage

*One unified, secure, and modern storage solution for React.*

[![npm version](https://badge.fury.io/js/%40sitharaj08%2Freact-unified-storage.svg)](https://badge.fury.io/js/%40sitharaj08%2Freact-unified-storage)
[![Build Status](https://github.com/sitharaj08/react-unified-storage/workflows/CI/badge.svg)](https://github.com/sitharaj08/react-unified-storage/actions)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@sitharaj08/react-unified-storage)](https://bundlephobia.com/package/@sitharaj08/react-unified-storage)

## Why React Unified Storage?

Compared to `reactjs-localstorage`, this library provides:

- ✅ **TypeScript-first** with strict typing and generics
- ✅ **SSR-safe** with automatic fallback to in-memory storage
- ✅ **Multiple drivers**: IndexedDB, localStorage, sessionStorage, memory
- ✅ **Envelope format** with versioning, timestamps, and TTL
- ✅ **Schema validation** with Zod
- ✅ **Migrations** for version upgrades
- ✅ **Encryption at rest** with AES-GCM
- ✅ **Compression** with fflate
- ✅ **Cross-tab synchronization** via BroadcastChannel
- ✅ **React hooks** with Suspense support
- ✅ **Tiny bundle** (<6KB gzipped core)

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

MIT