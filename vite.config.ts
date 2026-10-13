import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: '/driving_game/',
  build: {
    assetsInlineLimit: (file) => (file.endsWith('.svg') ? true : undefined),
  },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
  },
});
