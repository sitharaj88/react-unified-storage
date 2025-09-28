import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryDriver } from '../src/memory';
import { localDriver, sessionDriver } from '../src/webstorage';
import { IndexedDBDriver } from '../src/indexeddb';
import { createDriver } from '../src/drivers';
import { setup, read, write, remove, keys, clearAll } from '../src/core';

describe('Drivers', () => {
  describe('MemoryDriver', () => {
    let driver: MemoryDriver;

    beforeEach(() => {
      driver = new MemoryDriver();
    });

    it('should read/write/remove', async () => {
      await driver.write('test', { v: 1, data: 'hello', createdAt: 1, updatedAt: 1 });
      expect(await driver.read('test')).toEqual({ v: 1, data: 'hello', createdAt: 1, updatedAt: 1 });
      await driver.remove('test');
      expect(await driver.read('test')).toBeNull();
    });

    it('should list keys', async () => {
      await driver.write('a', { v: 1, data: 1, createdAt: 1, updatedAt: 1 });
      await driver.write('b', { v: 1, data: 2, createdAt: 1, updatedAt: 1 });
      expect(await driver.keys()).toEqual(['a', 'b']);
      expect(await driver.keys('a')).toEqual(['a']);
    });

    it('should clear all', async () => {
      await driver.write('test', { v: 1, data: 'hello', createdAt: 1, updatedAt: 1 });
      await driver.clearAll();
      expect(await driver.keys()).toEqual([]);
    });
  });

  describe('WebStorageDriver', () => {
    it.skip('should work with localStorage', async () => {
      // Skip in test environment
    });
  });

  describe('IndexedDBDriver', () => {
    it('should create driver', () => {
      const driver = new IndexedDBDriver();
      expect(driver.driverId()).toBe('idb');
    });
  });

  describe('createDriver', () => {
    it('should create memory driver in SSR', () => {
      const originalWindow = global.window;
      delete (global as any).window;

      const driver = createDriver('auto');
      expect(driver.driverId()).toBe('memory');

      global.window = originalWindow;
    });

    it('should create auto driver', () => {
      const driver = createDriver('auto');
      // In test environment, should fallback to memory
      expect(['memory', 'idb']).toContain(driver.driverId());
    });
  });
});