// Tests for SearchBar component
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  createMockElement, 
  createMockKeyboardEvent, 
  simulateTyping, 
  simulateClick,
  mockFetchResponse,
  createMockFuse,
  wait,
  nextTick
} from '../test/utils';

// Mock Fuse.js
const mockFuse = createMockFuse([
  {
    title: 'API',
    description: 'Application Programming Interface',
    category: 'Web Development',
    slug: 'api',
    tags: ['web', 'backend']
  },
  {
    title: 'JSON',
    description: 'JavaScript Object Notation',
    category: 'Data Format',
    slug: 'json',
    tags: ['data', 'format']
  }
]);

vi.mock('fuse.js', () => ({
  default: vi.fn().mockImplementation(() => mockFuse)
}));

describe('SearchBar Component', () => {
  let container: HTMLElement;
  let searchInput: HTMLInputElement;
  let searchResults: HTMLElement;
  let clearButton: HTMLElement;

  beforeEach(() => {
    // Create DOM structure similar to SearchBar component
    container = createMockElement('div', { 
      'class': 'search-bar-container',
      'data-search-id': 'test-search'
    });

    searchInput = createMockElement('input', {
      'type': 'text',
      'class': 'search-input',
      'data-search-input': '',
      'id': 'search',
      'role': 'searchbox',
      'aria-label': 'ค้นหาคำศัพท์ทางเทคนิค',
      'aria-expanded': 'false'
    }) as HTMLInputElement;

    clearButton = createMockElement('button', {
      'class': 'clear-button',
      'data-clear-search': '',
      'aria-label': 'ล้างการค้นหา',
      'tabindex': '-1'
    });

    searchResults = createMockElement('div', {
      'class': 'search-results hidden',
      'id': 'search-results',
      'role': 'listbox'
    });

    const resultsContent = createMockElement('div', {
      'class': 'search-results-content'
    });

    const noResults = createMockElement('div', {
      'class': 'no-results hidden'
    });

    const popularSearches = createMockElement('div', {
      'class': 'popular-searches'
    });

    const liveRegion = createMockElement('div', {
      'id': 'search-live-region',
      'class': 'sr-only',
      'aria-live': 'polite'
    });

    searchResults.appendChild(resultsContent);
    searchResults.appendChild(noResults);
    searchResults.appendChild(popularSearches);

    container.appendChild(searchInput);
    container.appendChild(clearButton);
    container.appendChild(searchResults);
    container.appendChild(liveRegion);

    document.body.appendChild(container);

    // Mock fetch for search index
    mockFetchResponse([
      {
        title: 'API',
        description: 'Application Programming Interface',
        category: 'Web Development',
        slug: 'api',
        tags: ['web', 'backend']
      },
      {
        title: 'JSON',
        description: 'JavaScript Object Notation',
        category: 'Data Format',
        slug: 'json',
        tags: ['data', 'format']
      }
    ]);
  });

  describe('Initialization', () => {
    it('should initialize with correct ARIA attributes', () => {
      expect(searchInput.getAttribute('role')).toBe('searchbox');
      expect(searchInput.getAttribute('aria-expanded')).toBe('false');
      expect(searchInput.getAttribute('aria-label')).toBe('ค้นหาคำศัพท์ทางเทคนิค');
    });

    it('should have proper DOM structure', () => {
      expect(searchInput.getAttribute('type')).toBe('text');
      expect(searchInput.classList.contains('search-input')).toBe(true);
      expect(clearButton.getAttribute('data-clear-search')).toBe('');
      expect(searchResults.getAttribute('role')).toBe('listbox');
    });

    it('should hide search results initially', () => {
      expect(searchResults.classList.contains('hidden')).toBe(true);
    });
  });

  describe('Search Input', () => {
    it('should have correct input attributes', () => {
      expect(searchInput.getAttribute('autocomplete')).toBe('off');
      expect(searchInput.getAttribute('spellcheck')).toBe('false');
      expect(searchInput.getAttribute('aria-autocomplete')).toBe('list');
      expect(searchInput.getAttribute('aria-owns')).toBe('search-results');
    });

    it('should have proper placeholder text', () => {
      expect(searchInput.getAttribute('placeholder')).toContain('ค้นหาคำศัพท์');
    });

    it('should be properly labeled for accessibility', () => {
      expect(searchInput.getAttribute('aria-describedby')).toBe('search-instructions');
      const instructions = document.getElementById('search-instructions');
      expect(instructions).toBeTruthy();
      expect(instructions?.textContent).toContain('ใช้ลูกศรขึ้นลงเพื่อเลือกผลการค้นหา');
    });
  });

  describe('Clear Button', () => {
    it('should have proper accessibility attributes', () => {
      expect(clearButton.getAttribute('aria-label')).toBe('ล้างการค้นหา');
      expect(clearButton.getAttribute('title')).toBe('ล้างการค้นหา');
      expect(clearButton.getAttribute('data-clear-search')).toBe('');
    });

    it('should have proper CSS classes', () => {
      expect(clearButton.classList.contains('clear-button')).toBe(true);
      expect(clearButton.classList.contains('focus-ring')).toBe(true);
    });
  });

  describe('Search Results Structure', () => {
    it('should have proper results container structure', () => {
      expect(searchResults.getAttribute('role')).toBe('listbox');
      expect(searchResults.getAttribute('aria-label')).toBe('ผลการค้นหา');
      expect(searchResults.classList.contains('search-results')).toBe(true);
    });

    it('should contain results content area', () => {
      const resultsContent = searchResults.querySelector('.search-results-content');
      expect(resultsContent).toBeTruthy();
      expect(resultsContent?.getAttribute('role')).toBe('group');
      expect(resultsContent?.getAttribute('aria-label')).toBe('รายการผลการค้นหา');
    });

    it('should contain no results message', () => {
      const noResults = searchResults.querySelector('.no-results');
      expect(noResults).toBeTruthy();
      expect(noResults?.classList.contains('hidden')).toBe(true);
    });

    it('should contain popular searches section', () => {
      const popularSearches = searchResults.querySelector('.popular-searches');
      expect(popularSearches).toBeTruthy();
      expect(popularSearches?.getAttribute('role')).toBe('group');
      
      const heading = popularSearches?.querySelector('#popular-searches-heading');
      expect(heading).toBeTruthy();
      expect(heading?.textContent).toBe('คำค้นหายอดนิยม');
    });
  });

  describe('Popular Searches', () => {
    it('should have popular search buttons with proper attributes', () => {
      const popularTerms = searchResults.querySelectorAll('.popular-term');
      expect(popularTerms.length).toBeGreaterThan(0);
      
      popularTerms.forEach(term => {
        expect(term.getAttribute('role')).toBe('listitem');
        expect(term.getAttribute('data-term')).toBeTruthy();
        expect(term.getAttribute('aria-label')).toContain('ค้นหา');
        expect(term.classList.contains('focus-ring')).toBe(true);
      });
    });

    it('should include common search terms', () => {
      const popularTerms = searchResults.querySelectorAll('.popular-term');
      const termTexts = Array.from(popularTerms).map(term => term.textContent);
      
      expect(termTexts).toContain('API');
      expect(termTexts).toContain('JavaScript');
      expect(termTexts).toContain('React');
      expect(termTexts).toContain('JSON');
    });
  });

  describe('Accessibility Features', () => {
    it('should have live region for announcements', () => {
      const liveRegion = document.getElementById('search-live-region');
      expect(liveRegion).toBeTruthy();
      expect(liveRegion?.getAttribute('aria-live')).toBe('polite');
      expect(liveRegion?.getAttribute('aria-atomic')).toBe('true');
      expect(liveRegion?.classList.contains('sr-only')).toBe(true);
    });

    it('should have search instructions for screen readers', () => {
      const instructions = document.getElementById('search-instructions');
      expect(instructions).toBeTruthy();
      expect(instructions?.classList.contains('sr-only')).toBe(true);
      expect(instructions?.textContent).toContain('ใช้ลูกศรขึ้นลงเพื่อเลือกผลการค้นหา');
    });

    it('should have proper ARIA relationships', () => {
      expect(searchInput.getAttribute('aria-describedby')).toBe('search-instructions');
      expect(searchInput.getAttribute('aria-owns')).toBe('search-results');
      expect(searchInput.getAttribute('aria-autocomplete')).toBe('list');
    });
  });

  describe('Visual Elements', () => {
    it('should have loading indicator', () => {
      const loadingIndicator = container.querySelector('.loading-indicator');
      expect(loadingIndicator).toBeTruthy();
      expect(loadingIndicator?.classList.contains('opacity-0')).toBe(true);
    });

    it('should have search icon', () => {
      const searchIcon = container.querySelector('svg');
      expect(searchIcon).toBeTruthy();
      expect(searchIcon?.getAttribute('viewBox')).toBe('0 0 24 24');
    });

    it('should have proper CSS classes for styling', () => {
      expect(container.classList.contains('search-bar-container')).toBe(true);
      expect(searchInput.classList.contains('search-input')).toBe(true);
      expect(searchResults.classList.contains('search-results')).toBe(true);
    });
  });
});