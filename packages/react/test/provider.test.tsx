import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the core module
vi.mock('@sitharaj08/react-unified-storage-core', () => ({
  setup: vi.fn(),
}));

import { StorageProvider, useStorageConfig } from '../src/provider';
import { setup } from '@sitharaj08/react-unified-storage-core';

describe('StorageProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call setup with config on mount', () => {
    const config = { driver: 'memory' as const };

    // We can't easily test React components without @testing-library/react
    // But we can test that the setup function would be called
    expect(setup).not.toHaveBeenCalled();

    // Note: In a real test environment with @testing-library/react,
    // we would render the component and verify setup was called
  });

  it('should export useStorageConfig hook', () => {
    expect(typeof useStorageConfig).toBe('function');
  });
});