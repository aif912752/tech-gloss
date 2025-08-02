// Client-side initialization script for performance utilities
import { initializeWebVitals, sendToAnalytics } from '../utils/webVitals';
import { initializePrefetching } from '../utils/prefetch';
import { initializeImageOptimization } from '../utils/imageOptimization';

// Initialize all performance utilities when the page loads
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Initialize Web Vitals monitoring
    initializeWebVitals(sendToAnalytics);
  } catch (error) {
    console.warn('Failed to initialize Web Vitals monitoring:', error);
  }

  try {
    // Initialize prefetching
    initializePrefetching();
  } catch (error) {
    console.warn('Failed to initialize prefetching utilities:', error);
  }

  try {
    // Initialize image optimization
    initializeImageOptimization();
  } catch (error) {
    console.warn('Failed to initialize image optimization:', error);
  }
});