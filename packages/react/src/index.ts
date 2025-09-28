/**
 * @packageDocumentation
 * @module @sitharaj08/react-unified-storage
 *
 * # React Unified Storage
 *
 * React-specific bindings and hooks for the unified storage system.
 * Provides seamless integration with React applications through hooks,
 * context providers, and Suspense-compatible components.
 *
 * ## Features
 *
 * - **React Hooks**: Reactive storage access with automatic re-rendering
 * - **Suspense Support**: Compatible with React Suspense for data loading
 * - **Context Provider**: Application-wide storage configuration
 * - **Collection Hooks**: Reactive collection management
 * - **Loading States**: Built-in loading indicators for async operations
 * - **TypeScript**: Full type safety with generics and inference
 *
 * ## Quick Start
 *
 * ```tsx
 * import {
 *   StorageProvider,
 *   useStore,
 *   useCollection
 * } from '@sitharaj08/react-unified-storage';
 *
 * function App() {
 *   const config = {
 *     driver: 'auto',
 *     encryption: { key: 'my-secret' },
 *     compression: true
 *   };
 *
 *   return (
 *     <StorageProvider config={config}>
 *       <TodoApp />
 *     </StorageProvider>
 *   );
 * }
 *
 * function TodoApp() {
 *   // Reactive storage hook
 *   const [todos, setTodos] = useStore<Todo[]>('todos', {
 *     defaultValue: []
 *   });
 *
 *   // Collection management hook
 *   const todosCollection = useCollection<Todo>('todos');
 *
 *   return (
 *     <div>
 *       <button onClick={() => todosCollection.add({ text: 'New todo' })}>
 *         Add Todo
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * ## API Overview
 *
 * ### Provider Components
 * - {@link StorageProvider} - Context provider for storage configuration
 * - {@link useStorageConfig} - Hook to access current storage config
 *
 * ### Storage Hooks
 * - {@link useStore} - Reactive storage access with re-rendering
 * - {@link useStoreSuspense} - Suspense-compatible storage hook
 *
 * ### Collection Hooks
 * - {@link useCollection} - Reactive collection management
 *
 * @see {@link https://github.com/sitharaj08/react-unified-storage|GitHub Repository}
 */

export * from './provider';
export * from './hooks';
export * from './collections';