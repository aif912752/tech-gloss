// Tests for search utility functions
import { describe, it, expect, beforeEach } from 'vitest';
import type { CollectionEntry } from 'astro:content';
import {
  generateSearchIndex,
  basicSearch,
  highlightSearchTerms,
  getSearchSuggestions,
  filterByCategory,
  getPopularSearchTerms,
  type SearchIndex
} from './search';

// Mock glossary entries for testing
const mockEntries: CollectionEntry<'glossary'>[] = [
  {
    slug: 'api',
    data: {
      title: 'API',
      description: 'Application Programming Interface - ชุดของกฎเกณฑ์และเครื่องมือสำหรับการสร้างแอปพลิเคชันซอฟต์แวร์',
      category: 'Web Development',
      tags: ['web', 'backend', 'integration', 'interface'],
      lastUpdated: new Date('2024-01-15'),
      related: ['rest', 'json'],
    },
    body: '# API\n\nAPI คือ Application Programming Interface ซึ่งเป็นชุดของกฎเกณฑ์และเครื่องมือ\n\n## ตัวอย่างการใช้งาน\n\n```javascript\nfetch("/api/users")\n  .then(response => response.json())\n  .then(data => console.log(data));\n```',
    render: async () => ({ Content: () => 'Mocked API content' }),
  },
  {
    slug: 'json',
    data: {
      title: 'JSON',
      description: 'JavaScript Object Notation - รูปแบบการแลกเปลี่ยนข้อมูลที่เบาและอ่านง่าย',
      category: 'Data Format',
      tags: ['data', 'format', 'javascript', 'web'],
      lastUpdated: new Date('2024-01-10'),
      related: ['api'],
    },
    body: '# JSON\n\nJSON ย่อมาจาก JavaScript Object Notation\n\n**ตัวอย่าง:**\n\n```json\n{\n  "name": "John",\n  "age": 30\n}\n```',
    render: async () => ({ Content: () => 'Mocked JSON content' }),
  },
  {
    slug: 'react',
    data: {
      title: 'React',
      description: 'JavaScript library สำหรับสร้าง user interfaces',
      category: 'JavaScript',
      tags: ['javascript', 'frontend', 'library', 'ui'],
      lastUpdated: new Date('2024-01-20'),
      related: [],
    },
    body: '# React\n\nReact เป็น JavaScript library ที่พัฒนาโดย Facebook\n\n*Component-based architecture*',
    render: async () => ({ Content: () => 'Mocked React content' }),
  },
  {
    slug: 'nodejs',
    data: {
      title: 'Node.js',
      description: 'JavaScript runtime environment สำหรับ server-side development',
      category: 'JavaScript',
      tags: ['javascript', 'backend', 'server', 'runtime'],
      lastUpdated: new Date('2024-01-18'),
      related: ['api'],
    },
    body: '# Node.js\n\nNode.js ช่วยให้เราสามารถรัน JavaScript บน server ได้',
    render: async () => ({ Content: () => 'Mocked Node.js content' }),
  }
];

describe('Search Utilities', () => {
  let searchIndex: SearchIndex[];

  beforeEach(() => {
    searchIndex = generateSearchIndex(mockEntries);
  });

  describe('generateSearchIndex', () => {
    it('should generate search index from glossary entries', () => {
      expect(searchIndex).toHaveLength(4);
      
      const apiIndex = searchIndex.find(item => item.slug === 'api');
      expect(apiIndex).toBeDefined();
      expect(apiIndex?.title).toBe('API');
      expect(apiIndex?.description).toBe('Application Programming Interface - ชุดของกฎเกณฑ์และเครื่องมือสำหรับการสร้างแอปพลิเคชันซอฟต์แวร์');
      expect(apiIndex?.category).toBe('Web Development');
      expect(apiIndex?.tags).toEqual(['web', 'backend', 'integration', 'interface']);
    });

    it('should clean markdown content from body', () => {
      const apiIndex = searchIndex.find(item => item.slug === 'api');
      expect(apiIndex?.content).toBeDefined();
      
      // Should remove markdown headers
      expect(apiIndex?.content).not.toContain('# API');
      expect(apiIndex?.content).not.toContain('## ตัวอย่างการใช้งาน');
      
      // Should remove code blocks
      expect(apiIndex?.content).not.toContain('```javascript');
      expect(apiIndex?.content).not.toContain('```');
      
      // Should contain cleaned text
      expect(apiIndex?.content).toContain('API คือ Application Programming Interface');
    });

    it('should handle entries without body content', () => {
      const entriesWithoutBody = [{
        ...mockEntries[0],
        body: ''
      }];
      
      const index = generateSearchIndex(entriesWithoutBody);
      expect(index[0].content).toBe('');
    });

    it('should handle entries without tags', () => {
      const entriesWithoutTags = [{
        ...mockEntries[0],
        data: {
          ...mockEntries[0].data,
          tags: undefined
        }
      }];
      
      const index = generateSearchIndex(entriesWithoutTags);
      expect(index[0].tags).toEqual([]);
    });

    it('should generate unique IDs for each entry', () => {
      const ids = searchIndex.map(item => item.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('basicSearch', () => {
    it('should return empty array for empty query', () => {
      const results = basicSearch(searchIndex, '');
      expect(results).toEqual([]);
    });

    it('should return empty array for whitespace-only query', () => {
      const results = basicSearch(searchIndex, '   ');
      expect(results).toEqual([]);
    });

    it('should find results by title match', () => {
      const results = basicSearch(searchIndex, 'API');
      expect(results.length).toBeGreaterThan(0);
      
      const apiResult = results.find(r => r.item.slug === 'api');
      expect(apiResult).toBeDefined();
      expect(apiResult?.score).toBeGreaterThan(0);
    });

    it('should find results by description match', () => {
      const results = basicSearch(searchIndex, 'JavaScript');
      expect(results.length).toBeGreaterThan(0);
      
      // Should find both JSON and React entries
      const slugs = results.map(r => r.item.slug);
      expect(slugs).toContain('json');
      expect(slugs).toContain('react');
    });

    it('should find results by category match', () => {
      const results = basicSearch(searchIndex, 'Web Development');
      expect(results.length).toBeGreaterThan(0);
      
      const apiResult = results.find(r => r.item.slug === 'api');
      expect(apiResult).toBeDefined();
    });

    it('should find results by tag match', () => {
      const results = basicSearch(searchIndex, 'backend');
      expect(results.length).toBeGreaterThan(0);
      
      const slugs = results.map(r => r.item.slug);
      expect(slugs).toContain('api');
      expect(slugs).toContain('nodejs');
    });

    it('should find results by content match', () => {
      const results = basicSearch(searchIndex, 'Facebook');
      expect(results.length).toBeGreaterThan(0);
      
      const reactResult = results.find(r => r.item.slug === 'react');
      expect(reactResult).toBeDefined();
    });

    it('should be case insensitive', () => {
      const upperResults = basicSearch(searchIndex, 'API');
      const lowerResults = basicSearch(searchIndex, 'api');
      const mixedResults = basicSearch(searchIndex, 'Api');
      
      expect(upperResults.length).toBe(lowerResults.length);
      expect(lowerResults.length).toBe(mixedResults.length);
    });

    it('should sort results by score (descending)', () => {
      const results = basicSearch(searchIndex, 'javascript');
      
      // Results should be sorted by score
      for (let i = 1; i < results.length; i++) {
        expect(results[i-1].score).toBeGreaterThanOrEqual(results[i].score || 0);
      }
    });

    it('should prioritize title matches over other matches', () => {
      const results = basicSearch(searchIndex, 'React');
      
      // React title match should score higher than content matches
      const reactResult = results.find(r => r.item.slug === 'react');
      expect(reactResult?.score).toBeGreaterThan(5); // Title match gets 10 points
    });

    it('should handle partial matches', () => {
      const results = basicSearch(searchIndex, 'Java');
      expect(results.length).toBeGreaterThan(0);
      
      // Should find JavaScript-related entries
      const slugs = results.map(r => r.item.slug);
      expect(slugs).toContain('json');
      expect(slugs).toContain('react');
      expect(slugs).toContain('nodejs');
    });

    it('should handle Thai language search', () => {
      const results = basicSearch(searchIndex, 'ชุดของกฎเกณฑ์');
      expect(results.length).toBeGreaterThan(0);
      
      const apiResult = results.find(r => r.item.slug === 'api');
      expect(apiResult).toBeDefined();
    });
  });

  describe('highlightSearchTerms', () => {
    it('should return original text for empty query', () => {
      const text = 'Hello world';
      const result = highlightSearchTerms(text, '');
      expect(result).toBe(text);
    });

    it('should return original text for whitespace-only query', () => {
      const text = 'Hello world';
      const result = highlightSearchTerms(text, '   ');
      expect(result).toBe(text);
    });

    it('should highlight single word matches', () => {
      const text = 'API is an Application Programming Interface';
      const result = highlightSearchTerms(text, 'API');
      
      expect(result).toContain('<mark class="bg-primary/20 text-primary px-1 rounded">API</mark>');
      expect(result).toContain('is an Application Programming Interface');
    });

    it('should highlight multiple matches', () => {
      const text = 'API and REST API are both APIs';
      const result = highlightSearchTerms(text, 'API');
      
      const matches = result.match(/<mark[^>]*>API<\/mark>/g);
      expect(matches).toHaveLength(3);
    });

    it('should be case insensitive', () => {
      const text = 'API and api are the same';
      const result = highlightSearchTerms(text, 'api');
      
      expect(result).toContain('<mark class="bg-primary/20 text-primary px-1 rounded">API</mark>');
      expect(result).toContain('<mark class="bg-primary/20 text-primary px-1 rounded">api</mark>');
    });

    it('should handle special regex characters', () => {
      const text = 'Use $1 and (test) for regex';
      const result = highlightSearchTerms(text, '$1');
      
      expect(result).toContain('<mark class="bg-primary/20 text-primary px-1 rounded">$1</mark>');
    });

    it('should handle Thai text highlighting', () => {
      const text = 'API คือ Application Programming Interface';
      const result = highlightSearchTerms(text, 'คือ');
      
      expect(result).toContain('<mark class="bg-primary/20 text-primary px-1 rounded">คือ</mark>');
    });

    it('should preserve HTML structure around highlights', () => {
      const text = 'The API documentation is comprehensive';
      const result = highlightSearchTerms(text, 'API');
      
      expect(result).toBe('The <mark class="bg-primary/20 text-primary px-1 rounded">API</mark> documentation is comprehensive');
    });
  });

  describe('getSearchSuggestions', () => {
    it('should return empty array for empty query', () => {
      const suggestions = getSearchSuggestions(searchIndex, '');
      expect(suggestions).toEqual([]);
    });

    it('should return empty array for short query', () => {
      const suggestions = getSearchSuggestions(searchIndex, 'A');
      expect(suggestions).toEqual([]);
    });

    it('should return suggestions for partial title matches', () => {
      const suggestions = getSearchSuggestions(searchIndex, 'AP');
      expect(suggestions).toContain('API');
    });

    it('should return suggestions for partial category matches', () => {
      const suggestions = getSearchSuggestions(searchIndex, 'Java');
      expect(suggestions).toContain('JavaScript');
    });

    it('should return suggestions for partial tag matches', () => {
      const suggestions = getSearchSuggestions(searchIndex, 'web');
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.includes('web'))).toBe(true);
    });

    it('should limit suggestions to specified limit', () => {
      const suggestions = getSearchSuggestions(searchIndex, 'a', 2);
      expect(suggestions.length).toBeLessThanOrEqual(2);
    });

    it('should return unique suggestions', () => {
      const suggestions = getSearchSuggestions(searchIndex, 'java');
      const uniqueSuggestions = new Set(suggestions);
      expect(uniqueSuggestions.size).toBe(suggestions.length);
    });

    it('should be case insensitive', () => {
      const lowerSuggestions = getSearchSuggestions(searchIndex, 'api');
      const upperSuggestions = getSearchSuggestions(searchIndex, 'API');
      
      expect(lowerSuggestions).toEqual(upperSuggestions);
    });
  });

  describe('filterByCategory', () => {
    it('should return all items for "all" category', () => {
      const filtered = filterByCategory(searchIndex, 'all');
      expect(filtered).toEqual(searchIndex);
    });

    it('should return all items for empty category', () => {
      const filtered = filterByCategory(searchIndex, '');
      expect(filtered).toEqual(searchIndex);
    });

    it('should filter by specific category', () => {
      const filtered = filterByCategory(searchIndex, 'JavaScript');
      expect(filtered.length).toBe(2); // React and Node.js
      
      const slugs = filtered.map(item => item.slug);
      expect(slugs).toContain('react');
      expect(slugs).toContain('nodejs');
    });

    it('should return empty array for non-existent category', () => {
      const filtered = filterByCategory(searchIndex, 'NonExistent');
      expect(filtered).toEqual([]);
    });

    it('should be case sensitive for category matching', () => {
      const filtered = filterByCategory(searchIndex, 'javascript'); // lowercase
      expect(filtered).toEqual([]);
    });

    it('should handle special characters in category names', () => {
      const indexWithSpecialCategory = [{
        ...searchIndex[0],
        category: 'Web/API Development'
      }];
      
      const filtered = filterByCategory(indexWithSpecialCategory, 'Web/API Development');
      expect(filtered).toHaveLength(1);
    });
  });

  describe('getPopularSearchTerms', () => {
    it('should return an array of popular terms', () => {
      const popularTerms = getPopularSearchTerms();
      expect(Array.isArray(popularTerms)).toBe(true);
      expect(popularTerms.length).toBeGreaterThan(0);
    });

    it('should return consistent results', () => {
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

    it('should return unique terms', () => {
      const popularTerms = getPopularSearchTerms();
      const uniqueTerms = new Set(popularTerms);
      expect(uniqueTerms.size).toBe(popularTerms.length);
    });

    it('should return reasonable number of terms', () => {
      const popularTerms = getPopularSearchTerms();
      expect(popularTerms.length).toBeGreaterThan(5);
      expect(popularTerms.length).toBeLessThan(20);
    });
  });

  describe('Integration Tests', () => {
    it('should work together for complete search workflow', () => {
      // Generate index
      const index = generateSearchIndex(mockEntries);
      
      // Perform search
      const results = basicSearch(index, 'JavaScript');
      expect(results.length).toBeGreaterThan(0);
      
      // Highlight results
      const firstResult = results[0];
      const highlighted = highlightSearchTerms(firstResult.item.description, 'JavaScript');
      expect(highlighted).toContain('<mark');
      
      // Get suggestions
      const suggestions = getSearchSuggestions(index, 'Java');
      expect(suggestions.length).toBeGreaterThan(0);
      
      // Filter by category
      const jsItems = filterByCategory(index, 'JavaScript');
      expect(jsItems.length).toBeGreaterThan(0);
    });

    it('should handle empty search index gracefully', () => {
      const emptyIndex: SearchIndex[] = [];
      
      expect(basicSearch(emptyIndex, 'test')).toEqual([]);
      expect(getSearchSuggestions(emptyIndex, 'test')).toEqual([]);
      expect(filterByCategory(emptyIndex, 'test')).toEqual([]);
    });

    it('should handle malformed search index entries', () => {
      const malformedIndex: SearchIndex[] = [
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
  });
});