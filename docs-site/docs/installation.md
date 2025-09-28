# Installation

## Package Installation

React Unified Storage is available as two packages:

### React Package (Recommended)

The main package includes React hooks and components:

```bash
# npm
npm install @sitharaj08/react-unified-storage

# pnpm
pnpm add @sitharaj08/react-unified-storage

# yarn
yarn add @sitharaj08/react-unified-storage
```

### Core Package Only

For framework-agnostic usage or custom React integrations:

```bash
# npm
npm install @sitharaj08/react-unified-storage-core

# pnpm
pnpm add @sitharaj08/react-unified-storage-core

# yarn
yarn add @sitharaj08/react-unified-storage-core
```

:::info Peer Dependencies

When using the core package, you'll also need:

```bash
npm install zod
```

The React package includes all necessary dependencies.
:::

## Version Compatibility

| React Unified Storage | React | Node.js | TypeScript |
|----------------------|-------|---------|------------|
| 1.x | 16.8+ | 18+ | 4.5+ |
| 0.x | 16.8+ | 16+ | 4.0+ |

## Bundle Size

| Package | Minified | Gzipped |
|---------|----------|---------|
| `@sitharaj08/react-unified-storage` | ~10KB | ~3.5KB |
| `@sitharaj08/react-unified-storage-core` | ~6KB | ~2KB |

## CDN Usage

You can also use the library via CDN for quick prototyping:

```html
<!-- Core library -->
<script src="https://unpkg.com/@sitharaj08/react-unified-storage-core@1.0.0/dist/index.mjs"></script>

<!-- React bindings -->
<script src="https://unpkg.com/@sitharaj08/react-unified-storage@1.0.0/dist/index.mjs"></script>
```

## Development Setup

For contributing or local development:

```bash
# Clone the repository
git clone https://github.com/sitharaj88/react-unified-storage.git
cd react-unified-storage

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Start development
pnpm dev
```

## TypeScript Configuration

Add these settings to your `tsconfig.json` for optimal TypeScript support:

```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "moduleResolution": "node"
  }
}
```

## Framework Integration

### Next.js

```tsx
// pages/_app.tsx
import { StorageProvider } from '@sitharaj08/react-unified-storage';

export default function App({ Component, pageProps }) {
  return (
    <StorageProvider config={{ driver: 'auto' }}>
      <Component {...pageProps} />
    </StorageProvider>
  );
}
```

### Vite

```tsx
// main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { StorageProvider } from '@sitharaj08/react-unified-storage';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StorageProvider config={{ driver: 'auto' }}>
      <App />
    </StorageProvider>
  </React.StrictMode>
);
```

### Create React App

```tsx
// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { StorageProvider } from '@sitharaj08/react-unified-storage';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <StorageProvider config={{ driver: 'auto' }}>
      <App />
    </StorageProvider>
  </React.StrictMode>
);
```

## Troubleshooting

### Build Errors

If you encounter TypeScript errors:

1. Ensure you're using TypeScript 4.5+
2. Check that React types are installed
3. Verify peer dependencies are installed

### Runtime Errors

Common runtime issues:

- **"Storage not initialized"**: Ensure `StorageProvider` wraps your components
- **"Broadcasting not enabled"**: Enable broadcasting in your config
- **SSR hydration mismatch**: Use memory driver for SSR-critical data

For more help, check the GitHub repository issues or discussions.