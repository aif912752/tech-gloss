// Image optimization utilities for better performance
import { getImage } from 'astro:assets';

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'png' | 'jpg' | 'jpeg';
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
  sizes?: string;
  alt: string;
  class?: string;
}

/**
 * Generate optimized image with multiple formats and sizes
 */
export async function generateOptimizedImage(
  src: ImageMetadata | string,
  options: ImageOptimizationOptions
) {
  const {
    width = 800,
    height,
    quality = 80,
    format = 'webp',
    loading = 'lazy',
    decoding = 'async',
    sizes,
    alt,
    class: className
  } = options;

  try {
    // Generate WebP version
    const webpImage = await getImage({
      src,
      width,
      height,
      quality,
      format: 'webp'
    });

    // Generate fallback JPEG
    const jpegImage = await getImage({
      src,
      width,
      height,
      quality,
      format: 'jpeg'
    });

    // Generate different sizes for responsive images
    const sizes2x = await getImage({
      src,
      width: width * 2,
      height: height ? height * 2 : undefined,
      quality: quality - 10, // Slightly lower quality for 2x
      format: 'webp'
    });

    return {
      webp: webpImage,
      jpeg: jpegImage,
      webp2x: sizes2x,
      attributes: {
        loading,
        decoding,
        sizes,
        alt,
        class: className
      }
    };
  } catch (error) {
    console.error('Image optimization failed:', error);
    return null;
  }
}

/**
 * Generate responsive image HTML with picture element
 */
export function generateResponsiveImageHTML(optimizedImage: any): string {
  if (!optimizedImage) return '';

  const { webp, jpeg, webp2x, attributes } = optimizedImage;

  return `
    <picture>
      <source 
        srcset="${webp.src} 1x, ${webp2x.src} 2x" 
        type="image/webp"
        ${attributes.sizes ? `sizes="${attributes.sizes}"` : ''}
      />
      <img 
        src="${jpeg.src}"
        alt="${attributes.alt}"
        loading="${attributes.loading}"
        decoding="${attributes.decoding}"
        ${attributes.class ? `class="${attributes.class}"` : ''}
        ${attributes.sizes ? `sizes="${attributes.sizes}"` : ''}
      />
    </picture>
  `;
}

/**
 * Lazy load images with intersection observer
 */
export class LazyImageLoader {
  private observer: IntersectionObserver;
  private loadedImages = new Set<HTMLImageElement>();

  constructor() {
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        rootMargin: '50px 0px',
        threshold: 0.01
      }
    );

    this.init();
  }

  private init() {
    // Find all lazy images
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => {
      this.observer.observe(img);
    });
  }

  private handleIntersection(entries: IntersectionObserverEntry[]) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        this.loadImage(img);
        this.observer.unobserve(img);
      }
    });
  }

  private loadImage(img: HTMLImageElement) {
    if (this.loadedImages.has(img)) return;

    const src = img.dataset.src;
    const srcset = img.dataset.srcset;

    if (src) {
      // Create a new image to preload
      const imageLoader = new Image();
      
      imageLoader.onload = () => {
        // Apply the loaded image
        img.src = src;
        if (srcset) {
          img.srcset = srcset;
        }
        
        // Add loaded class for animations
        img.classList.add('loaded');
        
        // Remove data attributes
        delete img.dataset.src;
        delete img.dataset.srcset;
        
        this.loadedImages.add(img);
      };

      imageLoader.onerror = () => {
        // Handle error - maybe show placeholder
        img.classList.add('error');
      };

      // Start loading
      imageLoader.src = src;
      if (srcset) {
        imageLoader.srcset = srcset;
      }
    }
  }

  public destroy() {
    this.observer.disconnect();
    this.loadedImages.clear();
  }
}

/**
 * Progressive image loading with blur effect
 */
export class ProgressiveImageLoader {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  /**
   * Create a low-quality placeholder from image
   */
  async createPlaceholder(
    imageSrc: string,
    width: number = 40,
    height: number = 30
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        this.canvas.width = width;
        this.canvas.height = height;
        
        // Draw scaled down image
        this.ctx.drawImage(img, 0, 0, width, height);
        
        // Apply blur effect
        this.ctx.filter = 'blur(2px)';
        this.ctx.drawImage(this.canvas, 0, 0);
        
        // Convert to data URL
        const placeholder = this.canvas.toDataURL('image/jpeg', 0.1);
        resolve(placeholder);
      };
      
      img.onerror = reject;
      img.src = imageSrc;
    });
  }

  /**
   * Setup progressive loading for an image element
   */
  async setupProgressiveLoading(
    img: HTMLImageElement,
    highResSrc: string,
    placeholderSrc?: string
  ) {
    try {
      // Create or use provided placeholder
      const placeholder = placeholderSrc || 
        await this.createPlaceholder(highResSrc);
      
      // Set placeholder
      img.src = placeholder;
      img.classList.add('progressive-placeholder');
      
      // Load high-res image
      const highResImg = new Image();
      highResImg.onload = () => {
        // Replace with high-res
        img.src = highResSrc;
        img.classList.remove('progressive-placeholder');
        img.classList.add('progressive-loaded');
      };
      
      highResImg.src = highResSrc;
      
    } catch (error) {
      console.error('Progressive loading failed:', error);
      // Fallback to direct loading
      img.src = highResSrc;
    }
  }
}

/**
 * Image performance monitoring
 */
export class ImagePerformanceMonitor {
  private metrics = {
    totalImages: 0,
    loadedImages: 0,
    failedImages: 0,
    averageLoadTime: 0,
    totalLoadTime: 0
  };

  constructor() {
    this.init();
  }

  private init() {
    // Monitor all images
    const images = document.querySelectorAll('img');
    this.metrics.totalImages = images.length;

    images.forEach(img => {
      this.monitorImage(img);
    });

    // Monitor dynamically added images
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            const images = element.querySelectorAll('img');
            images.forEach(img => {
              this.metrics.totalImages++;
              this.monitorImage(img);
            });
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private monitorImage(img: HTMLImageElement) {
    const startTime = performance.now();

    const handleLoad = () => {
      const loadTime = performance.now() - startTime;
      this.metrics.loadedImages++;
      this.metrics.totalLoadTime += loadTime;
      this.metrics.averageLoadTime = 
        this.metrics.totalLoadTime / this.metrics.loadedImages;
      
      this.reportMetrics();
    };

    const handleError = () => {
      this.metrics.failedImages++;
      this.reportMetrics();
    };

    if (img.complete) {
      if (img.naturalWidth > 0) {
        handleLoad();
      } else {
        handleError();
      }
    } else {
      img.addEventListener('load', handleLoad, { once: true });
      img.addEventListener('error', handleError, { once: true });
    }
  }

  private reportMetrics() {
    // Report to analytics or console
    if (this.metrics.loadedImages % 10 === 0) {
      console.log('Image Performance Metrics:', {
        ...this.metrics,
        successRate: (this.metrics.loadedImages / this.metrics.totalImages) * 100
      });
    }
  }

  public getMetrics() {
    return { ...this.metrics };
  }
}

/**
 * Initialize image optimization features
 */
export function initializeImageOptimization() {
  // Initialize lazy loading
  new LazyImageLoader();
  
  // Initialize performance monitoring
  new ImagePerformanceMonitor();
  
  // Setup progressive loading for images with data-progressive attribute
  const progressiveLoader = new ProgressiveImageLoader();
  const progressiveImages = document.querySelectorAll('img[data-progressive]');
  
  progressiveImages.forEach(async (img) => {
    const htmlImg = img as HTMLImageElement;
    const highResSrc = htmlImg.dataset.progressive;
    if (highResSrc) {
      await progressiveLoader.setupProgressiveLoading(htmlImg, highResSrc);
    }
  });
}

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initializeImageOptimization);
}