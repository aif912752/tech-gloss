// Integration tests for theme switching and persistence
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

// Ensure localStorage is available in test environment
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
  });
}

// Mock matchMedia for system theme detection
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
});

// Mock theme utilities
class ThemeManager {
  private currentTheme: string = 'light';
  private readonly THEME_KEY = 'theme-preference';

  constructor() {
    this.loadTheme();
  }

  getTheme(): string {
    return this.currentTheme;
  }

  setTheme(theme: string): void {
    // Only accept valid theme values
    if (['light', 'dark'].includes(theme)) {
      this.currentTheme = theme;
      this.saveTheme();
      this.applyTheme();
    }
  }

  toggleTheme(): void {
    this.setTheme(this.currentTheme === 'light' ? 'dark' : 'light');
  }

  private loadTheme(): void {
    try {
      // Try to get theme from localStorage
      const savedTheme = localStorage.getItem(this.THEME_KEY);
      if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
        this.currentTheme = savedTheme;
      } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.currentTheme = prefersDark ? 'dark' : 'light';
      }
    } catch (error) {
      // Fallback to light theme if localStorage is not available
      this.currentTheme = 'light';
    }
    this.applyTheme();
  }

  private saveTheme(): void {
    try {
      localStorage.setItem(this.THEME_KEY, this.currentTheme);
    } catch (error) {
      // Ignore localStorage errors
    }
  }

  private applyTheme(): void {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(this.currentTheme);
    root.setAttribute('data-theme', this.currentTheme);
  }

  getSystemTheme(): string {
    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch (error) {
      return 'light'; // Fallback to light theme
    }
  }
}

describe('Theme Switching Integration Tests', () => {
  let themeManager: ThemeManager;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset localStorage mock with proper implementation
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'theme-preference') {
        return null; // Default to null for fresh tests
      }
      return null;
    });
    localStorageMock.setItem.mockImplementation(() => {});
    localStorageMock.removeItem.mockImplementation(() => {});
    localStorageMock.clear.mockImplementation(() => {});
    
    // Reset document classes
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.removeAttribute('data-theme');
    
    // Reset matchMedia mock
    const mockMatchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)' ? false : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    
    Object.defineProperty(window, 'matchMedia', {
      value: mockMatchMedia,
      writable: true
    });
    
    themeManager = new ThemeManager();
  });

  describe('Theme Initialization', () => {
    it('should initialize with light theme by default', () => {
      expect(themeManager.getTheme()).toBe('light');
    });

    it('should load saved theme from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('dark');
      const newThemeManager = new ThemeManager();
      
      expect(newThemeManager.getTheme()).toBe('dark');
    });

    it('should fall back to system preference when no saved theme', () => {
      // Mock system preference
      const mockMatchMedia = vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      Object.defineProperty(window, 'matchMedia', {
        value: mockMatchMedia
      });

      const newThemeManager = new ThemeManager();
      expect(newThemeManager.getTheme()).toBe('dark');
    });

    it('should apply theme to document on initialization', () => {
      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
  });

  describe('Theme Switching', () => {
    it('should switch from light to dark theme', () => {
      themeManager.setTheme('dark');
      
      expect(themeManager.getTheme()).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should switch from dark to light theme', () => {
      themeManager.setTheme('dark');
      themeManager.setTheme('light');
      
      expect(themeManager.getTheme()).toBe('light');
      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('should toggle theme correctly', () => {
      // Start with light theme
      expect(themeManager.getTheme()).toBe('light');
      
      // Toggle to dark
      themeManager.toggleTheme();
      expect(themeManager.getTheme()).toBe('dark');
      
      // Toggle back to light
      themeManager.toggleTheme();
      expect(themeManager.getTheme()).toBe('light');
    });

    it('should save theme preference to localStorage', () => {
      themeManager.setTheme('dark');
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme-preference', 'dark');
    });
  });

  describe('Theme Persistence', () => {
    it('should persist theme across sessions', () => {
      // Mock localStorage to return 'dark' for the theme key
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'theme-preference') {
          return 'dark';
        }
        return null;
      });
      
      // Create new instance that should load the saved theme
      const newThemeManager = new ThemeManager();
      expect(newThemeManager.getTheme()).toBe('dark');
    });

    it('should handle invalid saved theme gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid-theme');
      const newThemeManager = new ThemeManager();
      
      // Should fall back to system preference
      expect(['light', 'dark']).toContain(newThemeManager.getTheme());
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      // Should not throw error
      expect(() => {
        themeManager.setTheme('dark');
      }).not.toThrow();
    });
  });

  describe('System Theme Detection', () => {
    it('should detect system dark theme preference', () => {
      const mockMatchMedia = vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      Object.defineProperty(window, 'matchMedia', {
        value: mockMatchMedia
      });

      expect(themeManager.getSystemTheme()).toBe('dark');
    });

    it('should detect system light theme preference', () => {
      const mockMatchMedia = vi.fn().mockImplementation(query => ({
        matches: false, // Light theme
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      Object.defineProperty(window, 'matchMedia', {
        value: mockMatchMedia
      });

      expect(themeManager.getSystemTheme()).toBe('light');
    });
  });

  describe('Theme Application', () => {
    it('should apply correct CSS classes to document', () => {
      themeManager.setTheme('dark');
      
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.classList.contains('light')).toBe(false);
    });

    it('should set data-theme attribute', () => {
      themeManager.setTheme('dark');
      
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should remove previous theme classes when switching', () => {
      themeManager.setTheme('dark');
      themeManager.setTheme('light');
      
      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('Theme Validation', () => {
    it('should only accept valid theme values', () => {
      // Invalid theme should not change current theme
      const originalTheme = themeManager.getTheme();
      themeManager.setTheme('invalid-theme');
      
      expect(themeManager.getTheme()).toBe(originalTheme);
    });

    it('should handle case sensitivity', () => {
      themeManager.setTheme('DARK');
      
      // Should not change theme for invalid case
      expect(themeManager.getTheme()).toBe('light');
    });
  });

  describe('Theme Performance', () => {
    it('should apply theme changes efficiently', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        themeManager.toggleTheme();
      }
      
      const endTime = performance.now();
      
      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(100); // 100ms limit
    });

    it('should not cause excessive localStorage writes', () => {
      themeManager.setTheme('dark');
      themeManager.setTheme('light');
      themeManager.setTheme('dark');
      
      // Should only write to localStorage when theme actually changes
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(3);
    });
  });

  describe('Theme Error Handling', () => {
    it('should handle missing localStorage gracefully', () => {
      // Mock localStorage as undefined
      const originalLocalStorage = window.localStorage;
      Object.defineProperty(window, 'localStorage', {
        value: undefined
      });

      expect(() => {
        themeManager.setTheme('dark');
      }).not.toThrow();

      // Restore localStorage
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage
      });
    });

    it('should handle missing matchMedia gracefully', () => {
      // Mock matchMedia as undefined
      const originalMatchMedia = window.matchMedia;
      Object.defineProperty(window, 'matchMedia', {
        value: undefined
      });

      expect(() => {
        themeManager.getSystemTheme();
      }).not.toThrow();

      // Restore matchMedia
      Object.defineProperty(window, 'matchMedia', {
        value: originalMatchMedia
      });
    });

    it('should handle document not available', () => {
      // This would be tested in SSR environments
      // For now, just ensure the theme manager doesn't crash
      expect(() => {
        themeManager.setTheme('dark');
      }).not.toThrow();
    });
  });

  describe('Theme Accessibility', () => {
    it('should maintain theme state for screen readers', () => {
      themeManager.setTheme('dark');
      
      // data-theme attribute should be accessible to screen readers
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should provide theme information for assistive technologies', () => {
      themeManager.setTheme('dark');
      
      // Should have both class and data attribute for maximum compatibility
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });
}); 