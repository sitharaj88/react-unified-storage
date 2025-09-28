import { describe, it, expect, beforeEach } from 'vitest';
import { createCollection } from '../src/collections';
import { setup } from '../src/core';

describe('Collections', () => {
  beforeEach(() => {
    setup({ driver: 'memory' });
  });

  it('should create a collection and perform CRUD operations', async () => {
    const users = createCollection<{ name: string; age: number }>('users');

    // Add items
    await users.add({ name: 'Alice', age: 30 });
    await users.add({ name: 'Bob', age: 25 });

    // List all items
    const allUsers = await users.list();
    expect(allUsers).toHaveLength(2);
    expect(allUsers.some(u => u.name === 'Alice')).toBe(true);
    expect(allUsers.some(u => u.name === 'Bob')).toBe(true);

    // Get count
    const count = await users.count();
    expect(count).toBe(2);

    // Find items
    const adults = await users.find(user => user.age >= 30);
    expect(adults).toHaveLength(1);
    expect(adults[0].name).toBe('Alice');

    // Clear collection
    await users.clear();
    const emptyList = await users.list();
    expect(emptyList).toHaveLength(0);
  });

  it('should handle different data types', async () => {
    const strings = createCollection<string>('strings');
    const numbers = createCollection<number>('numbers');
    const objects = createCollection<{ key: string }>('objects');

    await strings.add('hello');
    await numbers.add(42);
    await objects.add({ key: 'value' });

    expect(await strings.count()).toBe(1);
    expect(await numbers.count()).toBe(1);
    expect(await objects.count()).toBe(1);
  });
});