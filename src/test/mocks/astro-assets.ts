// Mock for astro:assets
import { vi } from 'vitest';

export const Image = vi.fn().mockImplementation(({ src, alt, ...props }) => {
  return `<img src="${src}" alt="${alt}" ${Object.entries(props).map(([key, value]) => `${key}="${value}"`).join(' ')} />`;
});

export const Picture = vi.fn().mockImplementation(({ src, alt, ...props }) => {
  return `<picture><img src="${src}" alt="${alt}" ${Object.entries(props).map(([key, value]) => `${key}="${value}"`).join(' ')} /></picture>`;
});

export const getImage = vi.fn().mockImplementation((options) => {
  return Promise.resolve({
    src: options.src || '/mock-image.jpg',
    width: options.width || 800,
    height: options.height || 600,
  });
});