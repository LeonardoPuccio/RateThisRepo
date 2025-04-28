// tests/unit/environment.test.ts
/* eslint-disable no-console */
import { beforeAll, describe, expect, test } from 'vitest';

describe('Environment Sanity Checks', () => {
  // Move environment logging inside, ensuring jsdom is set up
  beforeAll(() => {
    console.log('--- Buffer Check (Inside Test Suite) ---');
    console.log('global.Buffer:', global?.Buffer?.name);
    // Safely access window now
    console.log('window.Buffer:', typeof window !== 'undefined' ? window.Buffer?.name : 'N/A');
    console.log('Uint8Array.prototype.constructor:', Uint8Array?.prototype?.constructor?.name);
    console.log(
      'global.Uint8Array.prototype.constructor:',
      global?.Uint8Array?.prototype?.constructor?.name
    );
    console.log(
      'window.Uint8Array.prototype.constructor:',
      typeof window !== 'undefined' ? window.Uint8Array?.prototype?.constructor?.name : 'N/A'
    );
    console.log('------------------------------------------');
  });

  test('TextEncoder should produce Uint8Array', () => {
    const encoder = new TextEncoder();
    const encoded = encoder.encode('');

    console.log('Type of encoded:', Object.prototype.toString.call(encoded));
    console.log('Uint8Array constructor name:', Uint8Array?.name);
    console.log('global.Uint8Array constructor name:', global?.Uint8Array?.name);
    console.log(
      'window.Uint8Array constructor name:',
      typeof window !== 'undefined' ? window?.Uint8Array?.name : 'N/A'
    );

    expect(encoded instanceof Uint8Array).toBe(true);
  });

  test('Global Uint8Array should be consistent', () => {
    if (typeof window !== 'undefined') {
      expect(global.Uint8Array).toBe(window.Uint8Array);
    }
    expect(global.Uint8Array).toBe(Uint8Array);
  });
});
