// Integration tests for search functionality
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  generateSearchIndex,
  basicSearch,
  highlightSearchTerms,
  getSearchSuggestions,
  filterByCategory,
  getPopularSearchTerms
} from '../../utils/search';
import { mockGlossaryEntries } from '../mocks/astro-content';

// Mock search index data
const mockSearchIndex = [
  {
    id: 'api-1',
    title: 'API',
    slug: 'api',
    category: 'Web Development',
    description: 'Application Programming Interface - ชุดของกฎเกณฑ์และเครื่องมือสำหรับการสร้างแอปพลิเคชันซอฟต์แวร์',
    content: 'API คือ Application Programming Interface ซึ่งเป็นชุดของกฎเกณฑ์และเครื่องมือ',
    tags: ['web', 'backend', 'integration', 'interface']
  },
  {
    id: 'json-1',
    title: 'JSON',
    slug: 'json',
    category: 'Data Format',
    description: 'JavaScript Object Notation - รูปแบบการแลกเปลี่ยนข้อมูลที่เบาและอ่านง่าย',
    content: 'JSON ย่อมาจาก JavaScript Object Notation',
    tags: ['data', 'format', 'javascript', 'web']
  },
  {
    id: 'react-1',
    title: 'React',
    slug: 'react',
    category: 'JavaScript',
    description: 'JavaScript library สำหรับสร้าง user interfaces',
    content: 'React เป็น JavaScript library ที่พัฒนาโดย Facebook',
    tags: ['javascript', 'frontend', 'library', 'ui']
  },
  {
    id: 'nodejs-1',
    title: 'Node.js',
    slug: 'nodejs',
    category: 'JavaScript',
    description: 'JavaScript runtime environment สำหรับ server-side development',
    content: 'Node.js ช่วยให้เราสามารถรัน JavaScript บน server ได้',
    tags: ['javascript', 'backend', 'server', 'runtime']
  }
];

describe('Search Integration Tests', () => {
  let searchIndex: any[];

  beforeEach(() => {
    searchIndex = mockSearchIndex;
  });

  describe('Complete Search Workflow', () => {
    it('should perform end-to-end search workflow', () => {
      // 1. Generate search index
      const index = generateSearchIndex(mockGlossaryEntries as any[]);
      expect(index.length).toBeGreaterThan(0);

      // 2. Perform search
      const results = basicSearch(index, 'JavaScript');
      expect(results.length).toBeGreaterThan(0);

      // 3. Highlight results
      if (results.length > 0) {
        const highlighted = highlightSearchTerms(results[0].item.description, 'JavaScript');
        expect(highlighted).toContain('<mark');
      }

      // 4. Get suggestions
      const suggestions = getSearchSuggestions(index, 'Java');
      expect(suggestions.length).toBeGreaterThan(0);

      // 5. Filter by category
      const jsItems = filterByCategory(index, 'JavaScript');
      expect(jsItems.length).toBeGreaterThan(0);
    });

    it('should handle search with no results gracefully', () => {
      const results = basicSearch(searchIndex, 'nonexistentterm');
      expect(results).toEqual([]);
    });

    it('should handle empty search query', () => {
      const results = basicSearch(searchIndex, '');
      expect(results).toEqual([]);
    });
  });

  describe('Search Across Different Languages', () => {
    it('should search in Thai language', () => {
      const results = basicSearch(searchIndex, 'ชุดของกฎเกณฑ์');
      expect(results.length).toBeGreaterThan(0);
      
      const apiResult = results.find(r => r.item.slug === 'api');
      expect(apiResult).toBeDefined();
    });

    it('should search in English language', () => {
      const results = basicSearch(searchIndex, 'Application Programming Interface');
      expect(results.length).toBeGreaterThan(0);
      
      const apiResult = results.find(r => r.item.slug === 'api');
      expect(apiResult).toBeDefined();
    });

    it('should handle mixed language search', () => {
      const results = basicSearch(searchIndex, 'JavaScript library');
      expect(results.length).toBeGreaterThan(0);
      
      const reactResult = results.find(r => r.item.slug === 'react');
      expect(reactResult).toBeDefined();
    });
  });

  describe('Search Result Ranking', () => {
    it('should prioritize title matches over content matches', () => {
      const results = basicSearch(searchIndex, 'React');
      
      // React title match should be first
      expect(results[0].item.slug).toBe('react');
      expect(results[0].score).toBeGreaterThan(5); // Title match gets higher score
    });

    it('should rank partial matches appropriately', () => {
      const results = basicSearch(searchIndex, 'Java');
      
      // Should find JavaScript-related entries
      const slugs = results.map(r => r.item.slug);
      expect(slugs).toContain('json');
      expect(slugs).toContain('react');
      expect(slugs).toContain('nodejs');
    });

    it('should sort results by relevance score', () => {
      const results = basicSearch(searchIndex, 'javascript');
      
      // Results should be sorted by score (descending)
      for (let i = 1; i < results.length; i++) {
        expect(results[i-1].score).toBeGreaterThanOrEqual(results[i].score || 0);
      }
    });
  });

  describe('Search Suggestions', () => {
    it('should provide relevant suggestions for partial queries', () => {
      const suggestions = getSearchSuggestions(searchIndex, 'AP');
      expect(suggestions).toContain('API');
    });

    it('should suggest based on category matches', () => {
      const suggestions = getSearchSuggestions(searchIndex, 'Web');
      expect(suggestions.some(s => s.includes('Web Development'))).toBe(true);
    });

    it('should suggest based on tag matches', () => {
      const suggestions = getSearchSuggestions(searchIndex, 'web');
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('should limit suggestions appropriately', () => {
      const suggestions = getSearchSuggestions(searchIndex, 'a', 2);
      expect(suggestions.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Category Filtering', () => {
    it('should filter by specific category', () => {
      const jsItems = filterByCategory(searchIndex, 'JavaScript');
      expect(jsItems.length).toBe(2); // React and Node.js
      
      const slugs = jsItems.map(item => item.slug);
      expect(slugs).toContain('react');
      expect(slugs).toContain('nodejs');
    });

    it('should return all items for "all" category', () => {
      const allItems = filterByCategory(searchIndex, 'all');
      expect(allItems).toEqual(searchIndex);
    });

    it('should handle non-existent categories', () => {
      const items = filterByCategory(searchIndex, 'NonExistent');
      expect(items).toEqual([]);
    });
  });

  describe('Search Highlighting', () => {
    it('should highlight search terms in results', () => {
      const text = 'API is an Application Programming Interface';
      const highlighted = highlightSearchTerms(text, 'API');
      
      expect(highlighted).toContain('<mark class="bg-primary/20 text-primary px-1 rounded">API</mark>');
    });

    it('should handle case insensitive highlighting', () => {
      const text = 'API and api are the same';
      const highlighted = highlightSearchTerms(text, 'api');
      
      expect(highlighted).toContain('<mark');
      expect(highlighted).toContain('API');
      expect(highlighted).toContain('api');
    });

    it('should handle Thai text highlighting', () => {
      const text = 'API คือ Application Programming Interface';
      const highlighted = highlightSearchTerms(text, 'คือ');
      
      expect(highlighted).toContain('<mark class="bg-primary/20 text-primary px-1 rounded">คือ</mark>');
    });
  });

  describe('Popular Search Terms', () => {
    it('should return consistent popular terms', () => {
      const terms1 = getPopularSearchTerms();
      const terms2 = getPopularSearchTerms();
      expect(terms1).toEqual(terms2);
    });

    it('should include common technical terms', () => {
      const popularTerms = getPopularSearchTerms();
      expect(popularTerms).toContain('API');
      expect(popularTerms).toContain('JavaScript');
      expect(popularTerms).toContain('React');
    });

    it('should return reasonable number of terms', () => {
      const popularTerms = getPopularSearchTerms();
      expect(popularTerms.length).toBeGreaterThan(5);
      expect(popularTerms.length).toBeLessThan(20);
    });
  });

  describe('Search Performance', () => {
    it('should handle large search index efficiently', () => {
      // Create a larger search index
      const largeIndex = Array.from({ length: 100 }, (_, i) => ({
        id: `term-${i}`,
        title: `Term ${i}`,
        slug: `term-${i}`,
        category: 'Test',
        description: `Description for term ${i}`,
        content: `Content for term ${i}`,
        tags: ['test', 'term']
      }));

      const startTime = performance.now();
      const results = basicSearch(largeIndex, 'term');
      const endTime = performance.now();

      expect(results.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
    });

    it('should handle complex queries efficiently', () => {
      const startTime = performance.now();
      const results = basicSearch(searchIndex, 'JavaScript library');
      const endTime = performance.now();

      expect(results.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(50); // Should complete within 50ms
    });
  });

  describe('Search Error Handling', () => {
    it('should handle malformed search index', () => {
      const malformedIndex = [
        {
          id: 'test',
          title: '',
          slug: '',
          category: '',
          description: '',
          content: '',
          tags: []
        }
      ];

      const results = basicSearch(malformedIndex, 'test');
      expect(results).toEqual([]);
    });

    it('should handle special characters in search query', () => {
      const results = basicSearch(searchIndex, 'API & JSON');
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle very long search queries', () => {
      const longQuery = 'a'.repeat(1000);
      const results = basicSearch(searchIndex, longQuery);
      expect(Array.isArray(results)).toBe(true);
    });
  });
}); 