/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.astro'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        '.astro/',
      ],
    },
    // Mock Astro-specific imports
    alias: {
      'astro:content': './src/test/mocks/astro-content.ts',
      'astro:assets': './src/test/mocks/astro-assets.ts',
    },
  },
  resolve: {
    alias: {
      '@': './src',
      '@components': './src/components',
      '@utils': './src/utils',
      '@layouts': './src/layouts',
      '@content': './src/content',
    },
  },
});