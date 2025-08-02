// Core Web Vitals monitoring and optimization
export interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

export interface PerformanceMetrics {
  cls: number;
  fid: number;
  fcp: number;
  lcp: number;
  ttfb: number;
  inp: number;
}

/**
 * Core Web Vitals thresholds
 */
const THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 }
};

/**
 * Get rating for a metric value
 */
function getRating(name: WebVitalsMetric['name'], value: number): WebVitalsMetric['rating'] {
  const threshold = THRESHOLDS[name];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Web Vitals Monitor class
 */
export class WebVitalsMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];
  private onMetric?: (metric: WebVitalsMetric) => void;

  constructor(onMetric?: (metric: WebVitalsMetric) => void) {
    this.onMetric = onMetric;
    this.init();
  }

  private init() {
    // Initialize all metrics
    this.measureTTFB();
    this.measureFCP();
    this.measureLCP();
    this.measureFID();
    this.measureCLS();
    this.measureINP();
  }

  /**
   * Measure Time to First Byte (TTFB)
   */
  private measureTTFB() {
    try {
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
        this.reportMetric('TTFB', ttfb);
      }
    } catch (error) {
      console.warn('TTFB measurement failed:', error);
    }
  }

  /**
   * Measure First Contentful Paint (FCP)
   */
  private measureFCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          this.reportMetric('FCP', fcpEntry.startTime);
          observer.disconnect();
        }
      });

      observer.observe({ entryTypes: ['paint'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('FCP measurement failed:', error);
    }
  }

  /**
   * Measure Largest Contentful Paint (LCP)
   */
  private measureLCP() {
    try {
      let lcpValue = 0;
      
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          lcpValue = lastEntry.startTime;
        }
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(observer);

      // Report LCP when page becomes hidden or unloads
      const reportLCP = () => {
        if (lcpValue > 0) {
          this.reportMetric('LCP', lcpValue);
          observer.disconnect();
        }
      };

      ['visibilitychange', 'pagehide'].forEach(event => {
        addEventListener(event, reportLCP, { once: true });
      });
    } catch (error) {
      console.warn('LCP measurement failed:', error);
    }
  }

  /**
   * Measure First Input Delay (FID)
   */
  private measureFID() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === 'first-input') {
            const fid = entry.processingStart - entry.startTime;
            this.reportMetric('FID', fid);
            observer.disconnect();
          }
        });
      });

      observer.observe({ entryTypes: ['first-input'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('FID measurement failed:', error);
    }
  }

  /**
   * Measure Cumulative Layout Shift (CLS)
   */
  private measureCLS() {
    try {
      let clsValue = 0;
      let sessionValue = 0;
      let sessionEntries: PerformanceEntry[] = [];

      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach(entry => {
          // Only count layout shifts without recent user input
          if (!(entry as any).hadRecentInput) {
            const firstSessionEntry = sessionEntries[0];
            const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

            // If the entry occurred less than 1 second after the previous entry
            // and less than 5 seconds after the first entry in the session,
            // include it in the current session. Otherwise, start a new session.
            if (sessionValue &&
                entry.startTime - lastSessionEntry.startTime < 1000 &&
                entry.startTime - firstSessionEntry.startTime < 5000) {
              sessionValue += (entry as any).value;
              sessionEntries.push(entry);
            } else {
              sessionValue = (entry as any).value;
              sessionEntries = [entry];
            }

            // If the current session value is larger than the current CLS value,
            // update CLS and the entries contributing to it.
            if (sessionValue > clsValue) {
              clsValue = sessionValue;
            }
          }
        });
      });

      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);

      // Report CLS when page becomes hidden
      const reportCLS = () => {
        this.reportMetric('CLS', clsValue);
      };

      ['visibilitychange', 'pagehide'].forEach(event => {
        addEventListener(event, reportCLS, { once: true });
      });
    } catch (error) {
      console.warn('CLS measurement failed:', error);
    }
  }

  /**
   * Measure Interaction to Next Paint (INP)
   */
  private measureINP() {
    try {
      let longestInteraction = 0;

      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach(entry => {
          if (entry.entryType === 'event') {
            const eventEntry = entry as PerformanceEventTiming;
            const interactionTime = eventEntry.processingEnd - eventEntry.startTime;
            
            if (interactionTime > longestInteraction) {
              longestInteraction = interactionTime;
            }
          }
        });
      });

      // Observe event timing if supported
      if ('PerformanceEventTiming' in window) {
        observer.observe({ entryTypes: ['event'] });
        this.observers.push(observer);

        // Report INP when page becomes hidden
        const reportINP = () => {
          if (longestInteraction > 0) {
            this.reportMetric('INP', longestInteraction);
          }
        };

        ['visibilitychange', 'pagehide'].forEach(event => {
          addEventListener(event, reportINP, { once: true });
        });
      }
    } catch (error) {
      console.warn('INP measurement failed:', error);
    }
  }

  /**
   * Report a metric
   */
  private reportMetric(name: WebVitalsMetric['name'], value: number) {
    const metric: WebVitalsMetric = {
      name,
      value,
      rating: getRating(name, value),
      delta: value - (this.metrics[name.toLowerCase() as keyof PerformanceMetrics] || 0),
      id: this.generateId(),
      navigationType: this.getNavigationType()
    };

    // Store metric
    this.metrics[name.toLowerCase() as keyof PerformanceMetrics] = value;

    // Call callback if provided
    if (this.onMetric) {
      this.onMetric(metric);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`${name}: ${value.toFixed(2)}ms (${metric.rating})`);
    }
  }

  /**
   * Generate unique ID for metric
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get navigation type
   */
  private getNavigationType(): string {
    try {
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return navigationEntry?.type || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Get all current metrics
   */
  public getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  /**
   * Cleanup observers
   */
  public disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

/**
 * Performance optimization suggestions based on metrics
 */
export class PerformanceOptimizer {
  private metrics: Partial<PerformanceMetrics> = {};

  constructor(metrics: Partial<PerformanceMetrics>) {
    this.metrics = metrics;
  }

  /**
   * Get optimization suggestions
   */
  public getSuggestions(): string[] {
    const suggestions: string[] = [];

    // LCP optimizations
    if (this.metrics.lcp && this.metrics.lcp > THRESHOLDS.LCP.good) {
      suggestions.push('Consider optimizing images and preloading critical resources to improve LCP');
      suggestions.push('Minimize render-blocking resources');
      suggestions.push('Use a CDN for faster content delivery');
    }

    // FID optimizations
    if (this.metrics.fid && this.metrics.fid > THRESHOLDS.FID.good) {
      suggestions.push('Reduce JavaScript execution time');
      suggestions.push('Break up long tasks into smaller chunks');
      suggestions.push('Use web workers for heavy computations');
    }

    // CLS optimizations
    if (this.metrics.cls && this.metrics.cls > THRESHOLDS.CLS.good) {
      suggestions.push('Set explicit dimensions for images and videos');
      suggestions.push('Avoid inserting content above existing content');
      suggestions.push('Use CSS transforms instead of changing layout properties');
    }

    // FCP optimizations
    if (this.metrics.fcp && this.metrics.fcp > THRESHOLDS.FCP.good) {
      suggestions.push('Optimize critical rendering path');
      suggestions.push('Inline critical CSS');
      suggestions.push('Minimize server response times');
    }

    // TTFB optimizations
    if (this.metrics.ttfb && this.metrics.ttfb > THRESHOLDS.TTFB.good) {
      suggestions.push('Optimize server response times');
      suggestions.push('Use a CDN');
      suggestions.push('Enable compression');
    }

    return suggestions;
  }

  /**
   * Get performance score (0-100)
   */
  public getPerformanceScore(): number {
    let score = 100;
    let metricCount = 0;

    Object.entries(this.metrics).forEach(([name, value]) => {
      if (value !== undefined) {
        const metricName = name.toUpperCase() as keyof typeof THRESHOLDS;
        const threshold = THRESHOLDS[metricName];
        
        if (threshold) {
          metricCount++;
          
          if (value > threshold.poor) {
            score -= 30;
          } else if (value > threshold.good) {
            score -= 15;
          }
        }
      }
    });

    return Math.max(0, Math.round(score));
  }
}

/**
 * Initialize Web Vitals monitoring
 */
export function initializeWebVitals(
  onMetric?: (metric: WebVitalsMetric) => void
): WebVitalsMonitor {
  return new WebVitalsMonitor(onMetric);
}

/**
 * Send metrics to analytics
 */
export function sendToAnalytics(metric: WebVitalsMetric) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vitals Metric:', {
      name: metric.name,
      value: Math.round(metric.value),
      rating: metric.rating,
      delta: metric.delta
    });
  }

  // Example: Send to Google Analytics (if available)
  if (typeof gtag !== 'undefined') {
    gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.value),
      custom_map: {
        metric_rating: metric.rating,
        metric_delta: metric.delta
      }
    });
  }

  // Send to custom analytics endpoint only in production
  if (process.env.NODE_ENV === 'production') {
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metric),
    }).catch(error => {
      console.warn('Failed to send metric to analytics:', error);
    });
  }
}

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
  // Initialize monitoring when page loads
  window.addEventListener('load', () => {
    initializeWebVitals(sendToAnalytics);
  });
}