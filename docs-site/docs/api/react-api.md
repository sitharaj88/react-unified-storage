# React API Reference

This document provides comprehensive API documentation for the `@sitharaj08/react-unified-storage` package, which provides React bindings for the core storage library.

## Table of Contents

- [StorageProvider](#storageprovider)
- [useStore](#usestore)
- [useStoreSuspense](#usestoresuspense)
- [useCollection](#usecollection)
- [Type Definitions](#type-definitions)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

## StorageProvider

### Component Overview

The `StorageProvider` component provides the storage context to your React application. It must wrap any components that use storage hooks.

```tsx
import { StorageProvider } from '@sitharaj08/react-unified-storage';

function App() {
  return (
    <StorageProvider config={{ driver: 'auto' }}>
      <MyComponent />
    </StorageProvider>
  );
}
```

### Props

```typescript
interface StorageProviderProps {
  /** Storage configuration */
  config: StorageConfig;

  /** Child components */
  children: React.ReactNode;
}
```

### Configuration

The `config` prop accepts a `StorageConfig` object identical to the core library:

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

### Multiple Providers

You can use multiple providers with different configurations in the same app:

```tsx
function App() {
  return (
    <StorageProvider config={{ driver: 'memory', namespace: 'temp' }}>
      <TemporaryData />
    </StorageProvider>
    <StorageProvider config={{ driver: 'idb', namespace: 'persistent' }}>
      <PersistentData />
    </StorageProvider>
  );
}
```

## useStore

### Hook Signature

```typescript
const [value, setValue, meta] = useStore<T>(key, options?);
```

The primary hook for reading and writing storage data with automatic re-rendering.

### Parameters

- `key: string` - Storage key
- `options?: UseStoreOptions<T>` - Optional configuration

### Returns

- `value: T` - Current stored value (or defaultValue)
- `setValue: (value: T | ((prev: T) => T)) => Promise<void>` - Update function
- `meta?: StorageMeta` - Metadata (when `metadata: true`)

### Options

```typescript
interface UseStoreOptions<T> {
  /** Default value when no data is stored */
  defaultValue?: T;

  /** Zod schema for validation */
  schema?: z.ZodSchema<T>;

  /** Data version for migrations */
  version?: number;

  /** Include metadata in return value */
  metadata?: boolean;

  /** Time to live in milliseconds */
  ttlMs?: number;
}
```

### Basic Usage

```tsx
import { useStore } from '@sitharaj08/react-unified-storage';

function Counter() {
  const [count, setCount] = useStore('counter', { defaultValue: 0 });

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}
```

### Functional Updates

```tsx
function Counter() {
  const [count, setCount] = useStore('counter', { defaultValue: 0 });

  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => Math.max(0, prev - 1));

  return (
    <div>
      <button onClick={decrement}>-</button>
      <span>{count}</span>
      <button onClick={increment}>+</button>
    </div>
  );
}
```

### Schema Validation

```tsx
import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().min(0).max(150)
});

function UserProfile() {
  const [user, setUser] = useStore('user', {
    schema: userSchema,
    defaultValue: { name: '', email: '', age: 0 }
  });

  // TypeScript knows user has name, email, and age properties
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <p>Age: {user.age}</p>
    </div>
  );
}
```

### With Metadata

```tsx
function DataWithMeta() {
  const [data, setData, meta] = useStore('mydata', {
    metadata: true,
    defaultValue: 'Hello World'
  });

  return (
    <div>
      <p>Data: {data}</p>
      {meta && (
        <div>
          <p>Created: {new Date(meta.createdAt).toLocaleString()}</p>
          <p>Updated: {new Date(meta.updatedAt).toLocaleString()}</p>
          <p>Driver: {meta.driver}</p>
          <p>Version: {meta.version}</p>
        </div>
      )}
    </div>
  );
}
```

### TTL (Time To Live)

```tsx
function TempNotification() {
  const [message, setMessage] = useStore('notification', {
    ttlMs: 5000,  // Expires in 5 seconds
    defaultValue: null
  });

  const showNotification = (text: string) => {
    setMessage(text);
    // Message will automatically disappear after 5 seconds
  };

  return (
    <div>
      <button onClick={() => showNotification('Hello!')}>
        Show Notification
      </button>
      {message && <div className="notification">{message}</div>}
    </div>
  );
}
```

## useStoreSuspense

### Hook Signature

```typescript
const [value, setValue] = useStoreSuspense<T>(key, options);
```

Suspense-enabled version of `useStore` for integration with React Suspense.

### Parameters

Same as `useStore`, but `defaultValue` is required.

### Returns

- `value: T` - Current stored value
- `setValue: (value: T | ((prev: T) => T)) => Promise<void>` - Update function

### Usage with Suspense

```tsx
import { Suspense } from 'react';
import { useStoreSuspense } from '@sitharaj08/react-unified-storage';

function AsyncData() {
  const [data, setData] = useStoreSuspense('async-data', {
    defaultValue: 'Loading...'
  });

  return <div>{data}</div>;
}

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AsyncData />
    </Suspense>
  );
}
```

### When to Use

- When you want to leverage React's Suspense for loading states
- For server-side rendering with data fetching
- When integrating with data fetching libraries that support Suspense

## useCollection

### Hook Signature

```typescript
const collection = useCollection<T>(name, options?);
```

Hook for working with typed collections of data.

### Type Requirements

The generic type `T` must include an `id` field:

```typescript
interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
}
```

### Returns

A collection object with the following methods:

```typescript
interface CollectionHook<T extends { id: string | number }> {
  // Add a new item
  add(item: Omit<T, 'id'>): Promise<T>;

  // Get an item by ID
  get(id: string | number): Promise<T | null>;

  // Update an existing item
  update(id: string | number, updates: Partial<T>): Promise<T>;

  // Remove an item
  remove(id: string | number): Promise<void>;

  // List all items with optional filter
  list(filter?: (item: T) => boolean): Promise<T[]>;

  // Clear all items
  clear(): Promise<void>;
}
```

### Basic Usage

```tsx
import { useCollection } from '@sitharaj08/react-unified-storage';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

function TodoApp() {
  const todos = useCollection<Todo>('todos');
  const [todoList, setTodoList] = useState<Todo[]>([]);

  const loadTodos = async () => {
    const allTodos = await todos.list();
    setTodoList(allTodos);
  };

  const addTodo = async (title: string) => {
    await todos.add({ title, completed: false });
    loadTodos(); // Refresh list
  };

  const toggleTodo = async (id: number) => {
    const todo = await todos.get(id);
    if (todo) {
      await todos.update(id, { completed: !todo.completed });
      loadTodos();
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);

  return (
    <div>
      <button onClick={() => addTodo('New Todo')}>Add Todo</button>
      {todoList.map(todo => (
        <div key={todo.id}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => toggleTodo(todo.id)}
          />
          <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
            {todo.title}
          </span>
        </div>
      ))}
    </div>
  );
}
```

### Advanced Collection Usage

```tsx
function TodoApp() {
  const todos = useCollection<Todo>('todos');

  // Filter completed todos
  const [completedTodos, setCompletedTodos] = useState<Todo[]>([]);

  const loadCompleted = async () => {
    const completed = await todos.list(todo => todo.completed);
    setCompletedTodos(completed);
  };

  // Bulk operations
  const markAllComplete = async () => {
    const allTodos = await todos.list();
    await Promise.all(
      allTodos.map(todo =>
        todos.update(todo.id, { completed: true })
      )
    );
    loadCompleted();
  };

  const clearCompleted = async () => {
    const completed = await todos.list(todo => todo.completed);
    await Promise.all(
      completed.map(todo => todos.remove(todo.id))
    );
    loadCompleted();
  };

  return (
    <div>
      <button onClick={markAllComplete}>Mark All Complete</button>
      <button onClick={clearCompleted}>Clear Completed</button>
      <h3>Completed Todos ({completedTodos.length})</h3>
      {completedTodos.map(todo => (
        <div key={todo.id}>{todo.title}</div>
      ))}
    </div>
  );
}
```

## Type Definitions

### `UseStoreOptions<T>`

```typescript
interface UseStoreOptions<T> {
  defaultValue?: T;
  schema?: z.ZodSchema<T>;
  version?: number;
  metadata?: boolean;
  ttlMs?: number;
}
```

### `StorageMeta`

```typescript
interface StorageMeta {
  createdAt: number;
  updatedAt: number;
  expiresAt?: number;
  driver: StorageDriver;
  version: number;
}
```

### `StorageDriver`

```typescript
type StorageDriver = 'memory' | 'local' | 'session' | 'idb' | 'auto';
```

## Error Handling

### Hook Error Boundaries

```tsx
import { ErrorBoundary } from 'react-error-boundary';

function StorageErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div>
      <h2>Storage Error</h2>
      <p>{error.message}</p>
      <button onClick={resetErrorBoundary}>Retry</button>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={StorageErrorFallback}>
      <StorageProvider config={{ driver: 'auto' }}>
        <MyComponent />
      </StorageProvider>
    </ErrorBoundary>
  );
}
```

### Async Error Handling

```tsx
function UserProfile() {
  const [user, setUser] = useStore('user', {
    defaultValue: { name: 'Anonymous' }
  });

  const updateUser = async (newData) => {
    try {
      await setUser({ ...user, ...newData });
    } catch (error) {
      console.error('Failed to update user:', error);
      // Handle error (show toast, etc.)
    }
  };

  return (
    <div>
      <input
        value={user.name}
        onChange={(e) => updateUser({ name: e.target.value })}
      />
    </div>
  );
}
```

## Best Practices

### Provider Placement

Place `StorageProvider` high in your component tree:

```tsx
// ✅ Good
function App() {
  return (
    <StorageProvider config={{ driver: 'auto' }}>
      <Router>
        <Routes />
      </Router>
    </StorageProvider>
  );
}

// ❌ Avoid
function DeepComponent() {
  return (
    <StorageProvider config={{ driver: 'auto' }}>
      <div>Only this component has access</div>
    </StorageProvider>
  );
}
```

### Key Naming

Use consistent key naming conventions:

```tsx
// ✅ Good
const [user, setUser] = useStore('user-profile');
const [settings, setSettings] = useStore('app-settings');
const todos = useCollection('user-todos');

// ❌ Avoid
const [data, setData] = useStore('d');
const [stuff, setStuff] = useStore('myStuff123');
```

### Default Values

Always provide meaningful default values:

```tsx
// ✅ Good
const [user, setUser] = useStore('user', {
  defaultValue: { name: '', email: '', preferences: {} }
});

// ❌ Avoid
const [user, setUser] = useStore('user');  // user could be undefined
```

### Schema Validation

Use Zod schemas for type safety and validation:

```tsx
// ✅ Good
const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().min(0).max(150).optional()
});

const [user, setUser] = useStore('user', {
  schema: userSchema,
  defaultValue: { name: '', email: '' }
});

// TypeScript now knows the exact shape of user
```

### Performance Considerations

- Avoid storing large objects in hooks that re-render frequently
- Use `useMemo` for expensive computations on stored data
- Consider using `useCollection` for lists of items
- Use functional updates when depending on previous values

```tsx
// ✅ Good
const [count, setCount] = useStore('counter', { defaultValue: 0 });
const increment = () => setCount(prev => prev + 1);

// ❌ Avoid frequent re-renders with large objects
const [largeData, setLargeData] = useStore('large-dataset');
const processedData = useMemo(() => expensiveOperation(largeData), [largeData]);
```

### Cross-Tab Synchronization

Enable broadcasting for multi-tab applications:

```tsx
<StorageProvider config={{
  broadcast: true,  // Enable cross-tab sync
  driver: 'idb'     // Use a persistent driver
}}>
  <App />
</StorageProvider>
```

### Testing

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import { StorageProvider } from '@sitharaj08/react-unified-storage';

const renderWithStorage = (component, config = { driver: 'memory' }) => {
  return render(
    <StorageProvider config={config}>
      {component}
    </StorageProvider>
  );
};

test('loads and displays data', async () => {
  renderWithStorage(<MyComponent />);

  await waitFor(() => {
    expect(screen.getByText('Expected Content')).toBeInTheDocument();
  });
});
```

---

For core library APIs, see the [Core API Reference](./core-api.md).