import { defineConfig } from 'vitest/config';
import { WxtVitest } from 'wxt/testing';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [WxtVitest()],
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    include: ['./tests/unit/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@analysis': resolve(__dirname, 'src/analysis'),
      '@interfaces': resolve(__dirname, 'src/interfaces'),
      '@services': resolve(__dirname, 'src/services'),
      '@ui': resolve(__dirname, 'src/ui'),
      '@utils': resolve(__dirname, 'src/utils'),
    },
  },
});
