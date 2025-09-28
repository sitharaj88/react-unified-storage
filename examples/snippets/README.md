# React Unified Storage Examples

This directory contains example code snippets demonstrating various features of React Unified Storage.

## Table of Contents

- [Basic Usage](./basic-usage.tsx)
- [Schema Validation](./schema-validation.tsx)
- [Collections](./collections.tsx)
- [Encryption](./encryption.tsx)
- [Cross-tab Sync](./cross-tab-sync.tsx)
- [SSR Support](./ssr-support.tsx)
- [Error Handling](./error-handling.tsx)
- [Migration](./migration.tsx)

## Running Examples

These examples are designed to be copied into your React application. Make sure you have the library installed:

```bash
npm install @sitharaj08/react-unified-storage
# or
pnpm add @sitharaj08/react-unified-storage
```

Then wrap your app with `StorageProvider`:

```tsx
import { StorageProvider } from '@sitharaj08/react-unified-storage';

function App() {
  return (
    <StorageProvider config={{ driver: 'auto' }}>
      {/* Your components here */}
    </StorageProvider>
  );
}
```

## Core Library Examples

For framework-agnostic usage, see the [core examples](../core-examples/).</content>
<parameter name="filePath">/Users/admin/Documents/react-unified-storage/examples/snippets/README.md