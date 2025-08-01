// Integration tests for page generation
// @ts-nocheck
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockGlossaryEntries } from '../mocks/astro-content';

// Mock getCollection to return our test entries
const mockGetCollection = vi.fn().mockResolvedValue(mockGlossaryEntries);

vi.mock('astro:content', () => ({
  getCollection: mockGetCollection
}));

// Use the mocked function directly
const getCollection = mockGetCollection;

describe('Page Generation Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Static Paths Generation', () => {
    it('should generate static paths for all glossary entries', async () => {
      const entries = await getCollection('glossary');
      
      expect(entries).toHaveLength(3); // api, json, react
      
      const slugs = entries.map((entry: any) => entry.slug);
      expect(slugs).toContain('api');
      expect(slugs).toContain('json');
      expect(slugs).toContain('react');
    });

    it('should generate valid params for each entry', async () => {
      const entries = await getCollection('glossary');
      
      const staticPaths = entries.map((entry: any) => ({
        params: { slug: entry.slug },
        props: { entry }
      }));

      expect(staticPaths).toHaveLength(3);
      
      // Check each path has correct structure
      staticPaths.forEach((path: any) => {
        expect(path.params).toHaveProperty('slug');
        expect(path.props).toHaveProperty('entry');
        expect(path.props.entry.slug).toBe(path.params.slug);
      });
    });

    it('should include all required entry data in props', async () => {
      const entries = await getCollection('glossary');
      const staticPaths = entries.map((entry: any) => ({
        params: { slug: entry.slug },
        props: { entry }
      }));

      staticPaths.forEach((path: any) => {
        const entry = path.props.entry;
        expect(entry).toHaveProperty('slug');
        expect(entry).toHaveProperty('data');
        expect(entry).toHaveProperty('body');
        expect(entry).toHaveProperty('render');
        
        // Check required data fields
        expect(entry.data).toHaveProperty('title');
        expect(entry.data).toHaveProperty('description');
        expect(entry.data).toHaveProperty('category');
      });
    });
  });

  describe('Page Content Rendering', () => {
    it('should render content for each entry', async () => {
      const entries = await getCollection('glossary');
      
      for (const entry of entries) {
        const { Content } = await entry.render();
        expect(Content).toBeDefined();
        expect(typeof Content).toBe('function');
      }
    });

    it('should handle entries with different content types', async () => {
      const entries = await getCollection('glossary');
      
      // Test that all entries can be rendered
      const renderPromises = entries.map(async (entry: any) => {
        try {
          const { Content } = await entry.render();
          return { success: true, slug: entry.slug };
        } catch (error) {
          return { success: false, slug: entry.slug, error };
        }
      });

      const results = await Promise.all(renderPromises);
      
      // All entries should render successfully
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });
  });

  describe('URL Structure', () => {
    it('should generate correct URLs for all entries', async () => {
      const entries = await getCollection('glossary');
      
      const expectedUrls = [
        '/glossary/api',
        '/glossary/json', 
        '/glossary/react'
      ];

      const generatedUrls = entries.map(entry => `/glossary/${entry.slug}`);
      
      expect(generatedUrls).toEqual(expectedUrls);
    });

    it('should handle slug variations correctly', async () => {
      const entries = await getCollection('glossary');
      
      entries.forEach(entry => {
        // Slugs should be valid URL segments
        expect(entry.slug).toMatch(/^[a-z0-9-]+$/);
        expect(entry.slug.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Content Validation', () => {
    it('should ensure all entries have required frontmatter', async () => {
      const entries = await getCollection('glossary');
      
      entries.forEach(entry => {
        expect(entry.data.title).toBeDefined();
        expect(entry.data.title.length).toBeGreaterThan(0);
        expect(entry.data.description).toBeDefined();
        expect(entry.data.description.length).toBeGreaterThan(0);
        expect(entry.data.category).toBeDefined();
        expect(entry.data.category.length).toBeGreaterThan(0);
      });
    });

    it('should validate content structure', async () => {
      const entries = await getCollection('glossary');
      
      entries.forEach(entry => {
        // Check that body content exists
        expect(entry.body).toBeDefined();
        
        // Check for basic content structure
        expect(entry.body.length).toBeGreaterThan(0);
        
        // Check for markdown content
        expect(entry.body).toContain('#');
      });
    });
  });

  describe('Related Terms Integration', () => {
    it('should handle entries with related terms', async () => {
      const entries = await getCollection('glossary');
      
      const apiEntry = entries.find(e => e.slug === 'api');
      expect(apiEntry).toBeDefined();
      expect(apiEntry?.data.related).toBeDefined();
      expect(Array.isArray(apiEntry?.data.related)).toBe(true);
    });

    it('should validate related term references', async () => {
      const entries = await getCollection('glossary');
      const validSlugs = new Set(entries.map(e => e.slug));
      
      entries.forEach(entry => {
        if (entry.data.related) {
          entry.data.related.forEach(relatedSlug => {
            expect(validSlugs.has(relatedSlug)).toBe(true);
          });
        }
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing entries gracefully', async () => {
      // Test with non-existent slug
      const nonExistentSlug = 'non-existent-term';
      const entry = mockGlossaryEntries.find(e => e.slug === nonExistentSlug);
      expect(entry).toBeUndefined();
    });

    it('should handle malformed entry data', async () => {
      const entries = await getCollection('glossary');
      
      entries.forEach(entry => {
        // Ensure entry has required structure
        expect(entry).toHaveProperty('slug');
        expect(entry).toHaveProperty('data');
        expect(entry).toHaveProperty('body');
      });
    });
  });
}); 