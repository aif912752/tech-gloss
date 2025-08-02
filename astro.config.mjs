import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
	integrations: [mdx()],
  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          // Code splitting for better performance
          manualChunks: {
            // Separate search functionality into its own chunk
            'search': ['fuse.js'],
            // Separate utilities
            'utils': ['src/utils/search.ts', 'src/utils/validation.ts'],
          }
        }
      }
    }
  },
  // Performance optimizations
  build: {
    inlineStylesheets: 'auto',
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover'
  },
  image: {
    // Enable image optimization
    service: {
      entrypoint: 'astro/assets/services/sharp'
    }
  }
});
