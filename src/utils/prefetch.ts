// Prefetching utilities for better performance
import type { CollectionEntry } from 'astro:content';

interface PrefetchOptions {
  priority?: 'high' | 'low';
  as?: 'document' | 'script' | 'style' | 'image';
  crossorigin?: 'anonymous' | 'use-credentials';
}

/**
 * Prefetch a URL using link rel="prefetch"
 */
export function prefetchUrl(url: string, options: PrefetchOptions = {}) {
  // Check if prefetch is supported
  if (!('HTMLLinkElement' in window)) return;
  
  // Don't prefetch if user has data saver enabled
  if ('connection' in navigator && (navigator as any).connection?.saveData) {
    return;
  }
  
  // Check if already prefetched
  const existingLink = document.querySelector(`link[href="${url}"]`);
  if (existingLink) return;
  
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  
  if (options.priority) {
    link.setAttribute('importance', options.priority);
  }
  
  if (options.as) {
    link.as = options.as;
  }
  
  if (options.crossorigin) {
    link.crossOrigin = options.crossorigin;
  }
  
  document.head.appendChild(link);
}

/**
 * Prefetch related terms when hovering over a term
 */
export function setupRelatedTermsPrefetch() {
  // Use intersection observer for better performance
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target as HTMLElement;
        setupHoverPrefetch(element);
        observer.unobserve(element);
      }
    });
  }, {
    rootMargin: '50px'
  });
  
  // Observe all glossary cards and related links
  document.querySelectorAll('[data-prefetch-on-hover]').forEach(element => {
    observer.observe(element);
  });
}

/**
 * Setup hover prefetching for an element
 */
function setupHoverPrefetch(element: HTMLElement) {
  let prefetchTimer: number;
  let hasPrefetched = false;
  
  const handleMouseEnter = () => {
    if (hasPrefetched) return;
    
    // Delay prefetch slightly to avoid prefetching on quick mouse movements
    prefetchTimer = window.setTimeout(() => {
      const href = element.getAttribute('href') || element.dataset.prefetchUrl;
      if (href) {
        prefetchUrl(href, { priority: 'low', as: 'document' });
        hasPrefetched = true;
        
        // Also prefetch related resources
        prefetchRelatedResources(href);
      }
    }, 100);
  };
  
  const handleMouseLeave = () => {
    clearTimeout(prefetchTimer);
  };
  
  element.addEventListener('mouseenter', handleMouseEnter);
  element.addEventListener('mouseleave', handleMouseLeave);
  
  // Also prefetch on focus for keyboard users
  element.addEventListener('focus', () => {
    if (!hasPrefetched) {
      const href = element.getAttribute('href') || element.dataset.prefetchUrl;
      if (href) {
        prefetchUrl(href, { priority: 'low', as: 'document' });
        hasPrefetched = true;
        prefetchRelatedResources(href);
      }
    }
  });
}

/**
 * Prefetch related resources for a glossary term
 */
function prefetchRelatedResources(termUrl: string) {
  // Extract slug from URL
  const slug = termUrl.split('/').pop();
  if (!slug) return;
  
  // Prefetch search index if not already loaded
  prefetchUrl('/api/search-index.json', { priority: 'low' });
  
  // Prefetch common assets that might be needed
  const commonAssets = [
    '/api/related-terms.json',
    // Add other common resources here
  ];
  
  commonAssets.forEach(asset => {
    prefetchUrl(asset, { priority: 'low' });
  });
}

/**
 * Intelligent prefetching based on user behavior
 */
export class IntelligentPrefetcher {
  private prefetchedUrls = new Set<string>();
  private userBehavior = {
    scrollSpeed: 0,
    timeOnPage: 0,
    interactionCount: 0
  };
  
  constructor() {
    this.init();
  }
  
  private init() {
    this.trackUserBehavior();
    this.setupIntersectionObserver();
  }
  
  private trackUserBehavior() {
    let lastScrollY = window.scrollY;
    let lastScrollTime = Date.now();
    
    // Track scroll speed
    window.addEventListener('scroll', () => {
      const now = Date.now();
      const scrollY = window.scrollY;
      const timeDiff = now - lastScrollTime;
      const scrollDiff = Math.abs(scrollY - lastScrollY);
      
      if (timeDiff > 0) {
        this.userBehavior.scrollSpeed = scrollDiff / timeDiff;
      }
      
      lastScrollY = scrollY;
      lastScrollTime = now;
    }, { passive: true });
    
    // Track time on page
    const startTime = Date.now();
    window.addEventListener('beforeunload', () => {
      this.userBehavior.timeOnPage = Date.now() - startTime;
    });
    
    // Track interactions
    ['click', 'keydown', 'touchstart'].forEach(event => {
      document.addEventListener(event, () => {
        this.userBehavior.interactionCount++;
      }, { passive: true });
    });
  }
  
  private setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.considerPrefetch(entry.target as HTMLElement);
        }
      });
    }, {
      rootMargin: this.calculateRootMargin()
    });
    
    // Observe prefetchable elements
    document.querySelectorAll('[data-intelligent-prefetch]').forEach(element => {
      observer.observe(element);
    });
  }
  
  private calculateRootMargin(): string {
    // Adjust prefetch distance based on user behavior
    const baseMargin = 100;
    
    // If user scrolls slowly, prefetch earlier
    const scrollMultiplier = this.userBehavior.scrollSpeed < 0.5 ? 2 : 1;
    
    // If user has been on page longer, they're more engaged
    const timeMultiplier = this.userBehavior.timeOnPage > 30000 ? 1.5 : 1;
    
    const margin = Math.min(baseMargin * scrollMultiplier * timeMultiplier, 300);
    
    return `${margin}px`;
  }
  
  private considerPrefetch(element: HTMLElement) {
    const url = element.getAttribute('href') || element.dataset.prefetchUrl;
    if (!url || this.prefetchedUrls.has(url)) return;
    
    // Don't prefetch if user has data saver enabled
    if ('connection' in navigator && (navigator as any).connection?.saveData) {
      return;
    }
    
    // Consider user engagement level
    const engagementScore = this.calculateEngagementScore();
    
    if (engagementScore > 0.5) {
      prefetchUrl(url, { priority: 'low', as: 'document' });
      this.prefetchedUrls.add(url);
    }
  }
  
  private calculateEngagementScore(): number {
    let score = 0;
    
    // Time on page factor (0-0.4)
    score += Math.min(this.userBehavior.timeOnPage / 60000, 0.4);
    
    // Interaction factor (0-0.3)
    score += Math.min(this.userBehavior.interactionCount / 10, 0.3);
    
    // Scroll behavior factor (0-0.3)
    if (this.userBehavior.scrollSpeed < 1) {
      score += 0.3; // Slow, deliberate scrolling indicates engagement
    } else if (this.userBehavior.scrollSpeed < 3) {
      score += 0.15; // Medium scrolling
    }
    
    return Math.min(score, 1);
  }
}

/**
 * Preload critical resources
 */
export function preloadCriticalResources() {
  const criticalResources = [
    { href: '/api/search-index.json', as: 'fetch', crossorigin: 'anonymous' },
    // Add other critical resources
  ];
  
  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.href;
    link.as = resource.as;
    
    if (resource.crossorigin) {
      link.crossOrigin = resource.crossorigin;
    }
    
    document.head.appendChild(link);
  });
}

/**
 * Initialize all prefetching functionality
 */
export function initializePrefetching() {
  // Wait for page to be interactive
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setupPrefetching();
    });
  } else {
    setupPrefetching();
  }
}

function setupPrefetching() {
  // Setup basic prefetching
  setupRelatedTermsPrefetch();
  
  // Initialize intelligent prefetcher
  new IntelligentPrefetcher();
  
  // Preload critical resources
  preloadCriticalResources();
}

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
  initializePrefetching();
}