
import type { Envelope } from './types';

/**
 * Callback function type for broadcast events.
 *
 * @param key The storage key that was updated
 * @param envelope The new envelope data, or null if the key was removed
 */
type BroadcastCallback = (key: string, envelope: Envelope<unknown> | null) => void;

/**
 * Cross-tab synchronization manager using BroadcastChannel API.
 *
 * This class enables real-time synchronization of storage changes across
 * multiple browser tabs/windows. It uses the BroadcastChannel API when
 * available, with a fallback to the storage event mechanism.
 *
 * Key features:
 * - Real-time cross-tab synchronization
 * - Automatic fallback for older browsers
 * - Namespace isolation for different applications
 * - Memory-efficient listener management
 *
 * @example
 * ```typescript
 * const broadcast = new BroadcastManager('my-app');
 *
 * // Subscribe to storage changes
 * const unsubscribe = broadcast.subscribe((key, data) => {
 *   console.log(`Key ${key} changed:`, data);
 * });
 *
 * // Broadcast a change
 * broadcast.broadcast('user-settings', updatedData);
 *
 * // Clean up when done
 * unsubscribe();
 * broadcast.destroy();
 * ```
 */
export class BroadcastManager {
  /** The BroadcastChannel instance for cross-tab communication */
  private channel: BroadcastChannel | null = null;

  /** Set of registered listener callbacks */
  private listeners = new Set<BroadcastCallback>();

  /**
   * Creates a new broadcast manager instance.
   *
   * @param namespace Optional namespace for isolating broadcast channels between different applications
   */
  constructor(private namespace = 'react-unified-storage') {
    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel(`${namespace}-broadcast`);
      this.channel.onmessage = (event) => {
        const { key, envelope } = event.data;
        this.listeners.forEach(cb => cb(key, envelope));
      };
    } else if (typeof window !== 'undefined') {
      // Fallback to storage event
      window.addEventListener('storage', (event) => {
        if (event.key?.startsWith(`${namespace}:`)) {
          const key = event.key.slice(namespace.length + 1);
          const envelope = event.newValue ? JSON.parse(event.newValue) : null;
          this.listeners.forEach(cb => cb(key, envelope));
        }
      });
    }
  }

  /**
   * Subscribes to broadcast events.
   *
   * Registers a callback function that will be invoked whenever storage
   * changes are broadcast from other tabs.
   *
   * @param callback Function to call when broadcast events occur
   * @returns Unsubscribe function to remove the listener
   *
   * @example
   * ```typescript
   * const unsubscribe = broadcast.subscribe((key, envelope) => {
   *   if (envelope) {
   *     console.log(`Key ${key} was updated`);
   *   } else {
   *     console.log(`Key ${key} was removed`);
   *   }
   * });
   *
   * // Later: unsubscribe()
   * ```
   */
  subscribe(callback: BroadcastCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Broadcasts a storage change to other tabs.
   *
   * Notifies all other tabs/windows about a storage change. Uses BroadcastChannel
   * when available, otherwise falls back to triggering storage events.
   *
   * @param key The storage key that changed
   * @param envelope The new envelope data, or null if the key was removed
   *
   * @example
   * ```typescript
   * // Broadcast an update
   * broadcast.broadcast('user-preferences', {
   *   v: 1,
   *   data: { theme: 'dark' },
   *   createdAt: Date.now(),
   *   updatedAt: Date.now()
   * });
   *
   * // Broadcast a removal
   * broadcast.broadcast('temp-data', null);
   * ```
   */
  broadcast(key: string, envelope: Envelope<unknown> | null): void {
    if (this.channel) {
      this.channel.postMessage({ key, envelope });
    } else if (typeof window !== 'undefined') {
      // Fallback: use localStorage to trigger storage event
      const storageKey = `${this.namespace}:${key}`;
      window.localStorage.setItem(storageKey, JSON.stringify(envelope));
      // Clean up immediately to avoid polluting storage
      setTimeout(() => window.localStorage.removeItem(storageKey), 0);
    }
  }

  /**
   * Destroys the broadcast manager and cleans up resources.
   *
   * Closes the BroadcastChannel (if open) and removes all listeners.
   * Should be called when the broadcast manager is no longer needed.
   *
   * @example
   * ```typescript
   * const broadcast = new BroadcastManager();
   * // ... use broadcast ...
   * broadcast.destroy(); // Clean up
   * ```
   */
  destroy(): void {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.listeners.clear();
  }
}