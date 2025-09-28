# Getting Started

Welcome to **React Unified Storage**! This guide will help you get up and running with the library in your React application.

## What is React Unified Storage?

React Unified Storage is a comprehensive, type-safe storage library that provides a modern API for managing application data with support for multiple storage backends, encryption, compression, and real-time cross-tab synchronization.

### Key Features

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

## Prerequisites

- **Node.js**: Version 18 or higher
- **React**: Version 16.8.0 or higher
- **TypeScript**: Version 4.5 or higher (recommended)

## Quick Start

### 1. Installation

```bash
# React package (includes everything)
npm install @sitharaj08/react-unified-storage

# Core package only (framework-agnostic)
npm install @sitharaj08/react-unified-storage-core
```

### 2. Basic Setup

Wrap your app with `StorageProvider`:

```tsx
import { StorageProvider } from '@sitharaj08/react-unified-storage';

function App() {
  return (
    <StorageProvider config={{ driver: 'auto' }}>
      <YourApp />
    </StorageProvider>
  );
}
```

### 3. Use Storage Hooks

```tsx
import { useStore } from '@sitharaj08/react-unified-storage';

function Counter() {
  const [count, setCount] = useStore('counter', { defaultValue: 0 });

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={() => setCount(count - 1)}>-</button>
    </div>
  );
}
```

That's it! Your data will be automatically persisted and synchronized across browser tabs.

## Next Steps

- Read the [Installation Guide](./installation.md)
- Check out the [Quick Start](./quick-start.md)
- Read the [API reference](./api/core-api.md)

## Need Help?

-  [GitHub Discussions](https://github.com/sitharaj88/react-unified-storage/discussions)
- 🐛 [GitHub Issues](https://github.com/sitharaj88/react-unified-storage/issues)