import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setup, read, write, remove, keys, clearAll } from '../src/core';

describe('Core API', () => {
  beforeEach(() => {
    setup({ driver: 'memory' });
  });

  it('should read/write/remove', async () => {
    await write('test', 'hello');
    expect(await read('test')).toBe('hello');
    await remove('test');
    expect(await read('test')).toBeNull();
  });

  it('should handle TTL', async () => {
    await write('test', 'hello', { ttlMs: 100 });
    expect(await read('test')).toBe('hello');

    // Mock Date.now to simulate expiry
    const originalNow = Date.now;
    Date.now = vi.fn(() => originalNow() + 200);
    expect(await read('test')).toBeNull();
    Date.now = originalNow;
  });

  it('should list keys', async () => {
    await write('a', 1);
    await write('b', 2);
    expect(await keys()).toEqual(['a', 'b']);
    expect(await keys('a')).toEqual(['a']);
  });

  it('should clear all', async () => {
    await write('test', 'hello');
    await clearAll();
    expect(await keys()).toEqual([]);
  });
});