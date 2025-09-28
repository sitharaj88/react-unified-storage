import React, { createContext, useContext, ReactNode } from 'react';
import type { StorageConfig } from '@sitharaj08/react-unified-storage-core';
import { setup } from '@sitharaj08/react-unified-storage-core';

const StorageContext = createContext<StorageConfig | null>(null);

/**
 * Props for the StorageProvider component.
 */
interface StorageProviderProps {
  /** Storage configuration to initialize the storage system */
  config: StorageConfig;
  /** Child components that will have access to the storage system */
  children: ReactNode;
}

/**
 * React context provider for unified storage configuration.
 *
 * This provider component initializes the storage system with the provided
 * configuration and makes the configuration available to child components
 * through the {@link useStorageConfig} hook. It's recommended to wrap your
 * entire application with this provider to ensure consistent storage setup.
 *
 * @param props The provider props containing configuration and children
 * @returns JSX element providing storage context to child components
 *
 * @example
 * ```tsx
 * function App() {
 *   const storageConfig = {
 *     driver: 'auto',
 *     namespace: 'my-app',
 *     encryption: { key: 'secret-password' },
 *     compression: true,
 *     broadcast: true
 *   };
 *
 *   return (
 *     <StorageProvider config={storageConfig}>
 *       <MyAppComponents />
 *     </StorageProvider>
 *   );
 * }
 * ```
 *
 * @remarks
 * The provider automatically calls {@link setup} with the provided configuration
 * when it mounts. If the configuration changes, the storage system will be
 * reinitialized.
 */
export function StorageProvider({ config, children }: StorageProviderProps) {
  // Initialize storage synchronously
  setup(config);

  // Re-initialize if config changes
  React.useEffect(() => {
    setup(config);
  }, [config]);

  return (
    <StorageContext.Provider value={config}>
      {children}
    </StorageContext.Provider>
  );
}

/**
 * Hook to access the current storage configuration.
 *
 * Provides access to the storage configuration that was passed to the
 * nearest {@link StorageProvider} ancestor. Returns null if no provider
 * is found in the component tree.
 *
 * @returns The current storage configuration, or null if no provider is present
 *
 * @example
 * ```tsx
 * function StorageStatus() {
 *   const config = useStorageConfig();
 *
 *   if (!config) {
 *     return <div>No storage provider found</div>;
 *   }
 *
 *   return (
 *     <div>
 *       <p>Driver: {config.driver}</p>
 *       <p>Namespace: {config.namespace}</p>
 *       <p>Encryption: {config.encryption ? 'Enabled' : 'Disabled'}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useStorageConfig(): StorageConfig | null {
  return useContext(StorageContext);
}