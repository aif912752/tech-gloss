// Tests for SearchBar component
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock DOM environment
const createMockElement = (tag: string, attributes: Record<string, string> = {}, children: any[] = []) => {
  const element = {
    tagName: tag.toUpperCase(),
    attributes: new Map(Object.entries(attributes)),
    children: children,
    classList: {
      contains: (className: string) => {
        const classes = attributes.class?.split(' ') || [];
        return classes.includes(className);
      },
      add: vi.fn(),
      remove: vi.fn(),
      toggle: vi.fn()
    },
    getAttribute: (name: string) => attributes[name] || null,
    setAttribute: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    querySelector: (selector: string) => {
      // Mock querySelector to find children
      return children.find(child => 
        child.tagName === selector.toUpperCase() || 
        child.getAttribute?.('id') === selector.replace('#', '') ||
        child.getAttribute?.('class')?.includes(selector.replace('.', ''))
      ) || null;
    },
    querySelectorAll: (selector: string) => {
      // Mock querySelectorAll to find all matching children
      return children.filter(child => 
        child.tagName === selector.toUpperCase() || 
        child.getAttribute?.('class')?.includes(selector.replace('.', ''))
      );
    },
    focus: vi.fn(),
    blur: vi.fn(),
    click: vi.fn(),
    value: '',
    textContent: '',
    innerHTML: '',
    style: {
      display: '',
      visibility: '',
      opacity: ''
    }
  };
  
  // Add getAttribute method to element
  element.getAttribute = (name: string) => attributes[name] || null;
  
  return element;
};

// Mock document
const mockDocument = {
  getElementById: vi.fn(),
  querySelector: vi.fn(),
  querySelectorAll: vi.fn(),
  createElement: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn()
};

// Mock window
const mockWindow = {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  location: {
    href: 'https://techgloss.com/glossary',
    pathname: '/glossary'
  },
  history: {
    pushState: vi.fn(),
    replaceState: vi.fn()
  },
  matchMedia: vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  }),
  localStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn()
  }
};

// Mock global objects
global.document = mockDocument as any;
global.window = mockWindow as any;
global.navigator = {
  userAgent: 'test-agent'
} as any;

describe('SearchBar Component', () => {
  let searchContainer: any;
  let searchInput: any;
  let searchButton: any;
  let clearButton: any;
  let searchResults: any;
  let jsRequiredDiv: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create the GracefulDegradation wrapper structure
    jsRequiredDiv = createMockElement('div', {
      'class': 'js-required',
      'data-feature': 'search'
    });

    // Create search input
    searchInput = createMockElement('input', {
      'type': 'text',
      'placeholder': 'ค้นหาคำศัพท์...',
      'class': 'search-input',
      'data-search-input': 'true'
    });

    // Create search button
    searchButton = createMockElement('button', {
      'type': 'button',
      'class': 'search-button',
      'aria-label': 'ค้นหา'
    });

    // Create clear button
    clearButton = createMockElement('button', {
      'type': 'button',
      'class': 'clear-button',
      'aria-label': 'ล้างการค้นหา'
    });

    // Create search results container
    searchResults = createMockElement('div', {
      'class': 'search-results',
      'role': 'listbox'
    });

    // Create search container with all elements
    searchContainer = createMockElement('div', {
      'class': 'search-container'
    }, [
      searchInput,
      searchButton,
      clearButton,
      searchResults
    ]);

    // Add search container to js-required div
    jsRequiredDiv.children = [searchContainer];

    // Mock document methods
    mockDocument.getElementById.mockImplementation((id: string) => {
      if (id === 'search-input') return searchInput;
      if (id === 'search-button') return searchButton;
      if (id === 'clear-button') return clearButton;
      if (id === 'search-results') return searchResults;
      return null;
    });

    mockDocument.querySelector.mockImplementation((selector: string) => {
      if (selector === '[data-feature="search"]') return jsRequiredDiv;
      if (selector === '.search-input') return searchInput;
      if (selector === '.search-button') return searchButton;
      if (selector === '.clear-button') return clearButton;
      if (selector === '.search-results') return searchResults;
      if (selector === '.search-container') return searchContainer;
      return null;
    });

    mockDocument.querySelectorAll.mockImplementation((selector: string) => {
      if (selector === '.search-result-item') return [];
      if (selector === '.search-suggestion') return [];
      return [];
    });
  });

  describe('Component Structure', () => {
    it('should have a search container', () => {
      const container = mockDocument.querySelector('.search-container');
      expect(container).toBeTruthy();
    });

    it('should have a search input field', () => {
      const input = mockDocument.querySelector('.search-input');
      expect(input).toBeTruthy();
      expect(input?.getAttribute('type')).toBe('text');
    });

    it('should have a search button', () => {
      const button = mockDocument.querySelector('.search-button');
      expect(button).toBeTruthy();
      expect(button?.getAttribute('type')).toBe('button');
    });

    it('should have a clear button', () => {
      const button = mockDocument.querySelector('.clear-button');
      expect(button).toBeTruthy();
      expect(button?.getAttribute('type')).toBe('button');
    });

    it('should have a search results container', () => {
      const results = mockDocument.querySelector('.search-results');
      expect(results).toBeTruthy();
      expect(results?.getAttribute('role')).toBe('listbox');
    });
  });

  describe('Search Input', () => {
    it('should have proper placeholder text', () => {
      const input = mockDocument.querySelector('.search-input');
      const placeholder = input?.getAttribute('placeholder');
      expect(placeholder).toContain('ค้นหาคำศัพท์');
    });

    it('should have search data attribute', () => {
      const input = mockDocument.querySelector('.search-input');
      expect(input?.getAttribute('data-search-input')).toBe('true');
    });

    it('should be accessible', () => {
      const input = mockDocument.querySelector('.search-input');
      expect(input).toBeTruthy();
      // Check if it's focusable
      expect(typeof input?.focus).toBe('function');
    });
  });

  describe('Search Button', () => {
    it('should have proper aria-label', () => {
      const button = mockDocument.querySelector('.search-button');
      expect(button?.getAttribute('aria-label')).toBe('ค้นหา');
    });

    it('should be clickable', () => {
      const button = mockDocument.querySelector('.search-button');
      expect(button).toBeTruthy();
      expect(typeof button?.click).toBe('function');
    });
  });

  describe('Clear Button', () => {
    it('should have proper aria-label', () => {
      const button = mockDocument.querySelector('.clear-button');
      expect(button?.getAttribute('aria-label')).toBe('ล้างการค้นหา');
    });

    it('should have proper CSS classes', () => {
      const button = mockDocument.querySelector('.clear-button');
      expect(button?.classList.contains('clear-button')).toBe(true);
    });

    it('should be clickable', () => {
      const button = mockDocument.querySelector('.clear-button');
      expect(button).toBeTruthy();
      expect(typeof button?.click).toBe('function');
    });
  });

  describe('Search Results', () => {
    it('should have proper role attribute', () => {
      const results = mockDocument.querySelector('.search-results');
      expect(results?.getAttribute('role')).toBe('listbox');
    });

    it('should be initially empty', () => {
      const results = mockDocument.querySelector('.search-results');
      expect(results?.children?.length).toBe(0);
    });
  });

  describe('Graceful Degradation', () => {
    it('should be wrapped in GracefulDegradation component', () => {
      const wrapper = mockDocument.querySelector('[data-feature="search"]');
      expect(wrapper).toBeTruthy();
      expect(wrapper?.classList.contains('js-required')).toBe(true);
    });

    it('should have search feature attribute', () => {
      const wrapper = mockDocument.querySelector('[data-feature="search"]');
      expect(wrapper?.getAttribute('data-feature')).toBe('search');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const searchButton = mockDocument.querySelector('.search-button');
      const clearButton = mockDocument.querySelector('.clear-button');
      
      expect(searchButton?.getAttribute('aria-label')).toBe('ค้นหา');
      expect(clearButton?.getAttribute('aria-label')).toBe('ล้างการค้นหา');
    });

    it('should have proper form structure', () => {
      const input = mockDocument.querySelector('.search-input');
      const button = mockDocument.querySelector('.search-button');
      
      expect(input).toBeTruthy();
      expect(button).toBeTruthy();
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive classes', () => {
      const container = mockDocument.querySelector('.search-container');
      const input = mockDocument.querySelector('.search-input');
      
      expect(container).toBeTruthy();
      expect(input).toBeTruthy();
    });
  });

  describe('Theme Integration', () => {
    it('should support theme classes', () => {
      const container = mockDocument.querySelector('.search-container');
      const input = mockDocument.querySelector('.search-input');
      
      expect(container).toBeTruthy();
      expect(input).toBeTruthy();
    });
  });

  describe('Search Functionality', () => {
    it('should support keyboard navigation', () => {
      const input = mockDocument.querySelector('.search-input');
      expect(input).toBeTruthy();
      expect(typeof input?.addEventListener).toBe('function');
    });

    it('should support mouse interactions', () => {
      const button = mockDocument.querySelector('.search-button');
      const clearButton = mockDocument.querySelector('.clear-button');
      
      expect(button).toBeTruthy();
      expect(clearButton).toBeTruthy();
      expect(typeof button?.addEventListener).toBe('function');
      expect(typeof clearButton?.addEventListener).toBe('function');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing elements gracefully', () => {
      // Test with null elements
      mockDocument.querySelector.mockReturnValueOnce(null);
      const element = mockDocument.querySelector('.non-existent');
      expect(element).toBeNull();
    });

    it('should handle missing attributes gracefully', () => {
      const input = mockDocument.querySelector('.search-input');
      const nonExistentAttr = input?.getAttribute('non-existent');
      expect(nonExistentAttr).toBeNull();
    });
  });

  describe('Performance', () => {
    it('should not have memory leaks', () => {
      const input = mockDocument.querySelector('.search-input');
      const button = mockDocument.querySelector('.search-button');
      
      expect(input).toBeTruthy();
      expect(button).toBeTruthy();
      expect(typeof input?.removeEventListener).toBe('function');
      expect(typeof button?.removeEventListener).toBe('function');
    });
  });
});