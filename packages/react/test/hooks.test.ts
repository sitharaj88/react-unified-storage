import { describe, it, expect, vi } from 'vitest';

// Mock the core module
vi.mock('@sitharaj08/react-unified-storage-core', () => ({
  read: vi.fn(),
  write: vi.fn(),
  subscribe: vi.fn(() => vi.fn()), // Return unsubscribe function
}));

import { useStore, useStoreSuspense } from '../src/hooks';

describe('React Hooks', () => {
  it('should export useStore hook', () => {
    expect(typeof useStore).toBe('function');
  });

  it('should export useStoreSuspense hook', () => {
    expect(typeof useStoreSuspense).toBe('function');
  });

  // Note: Testing actual hook behavior requires @testing-library/react
  // These tests verify the exports exist and are functions
  // In a real testing environment, we would test:
  // - Hook returns correct initial values
  // - Hook updates when storage changes
  // - Hook calls write with correct parameters
  // - Suspense variant throws promise when data not ready
});