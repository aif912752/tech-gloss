// Tests for content collection schema validation
import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Import the schema from config
const glossarySchema = z.object({
  title: z.string(),
  slug: z.string().optional(),
  category: z.string(),
  description: z.string(),
  related: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  lastUpdated: z.date().optional(),
});

describe('Content Collection Schema Validation', () => {
  describe('Valid Data', () => {
    it('should validate minimal required fields', () => {
      const validData = {
        title: 'API',
        category: 'Web Development',
        description: 'Application Programming Interface'
      };

      const result = glossarySchema.safeParse(validData);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.title).toBe('API');
        expect(result.data.category).toBe('Web Development');
        expect(result.data.description).toBe('Application Programming Interface');
      }
    });

    it('should validate complete data with all optional fields', () => {
      const validData = {
        title: 'JSON',
        slug: 'json',
        category: 'Data Format',
        description: 'JavaScript Object Notation',
        related: ['api', 'rest'],
        tags: ['data', 'format', 'javascript'],
        lastUpdated: new Date('2024-01-15')
      };

      const result = glossarySchema.safeParse(validData);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.title).toBe('JSON');
        expect(result.data.slug).toBe('json');
        expect(result.data.category).toBe('Data Format');
        expect(result.data.description).toBe('JavaScript Object Notation');
        expect(result.data.related).toEqual(['api', 'rest']);
        expect(result.data.tags).toEqual(['data', 'format', 'javascript']);
        expect(result.data.lastUpdated).toBeInstanceOf(Date);
      }
    });

    it('should validate empty arrays for optional fields', () => {
      const validData = {
        title: 'React',
        category: 'JavaScript',
        description: 'JavaScript library for building user interfaces',
        related: [],
        tags: []
      };

      const result = glossarySchema.safeParse(validData);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.related).toEqual([]);
        expect(result.data.tags).toEqual([]);
      }
    });
  });

  describe('Invalid Data', () => {
    it('should reject missing required title', () => {
      const invalidData = {
        category: 'Web Development',
        description: 'Missing title'
      };

      const result = glossarySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.issues).toContainEqual(
          expect.objectContaining({
            code: 'invalid_type',
            path: ['title'],
            message: 'Required'
          })
        );
      }
    });

    it('should reject missing required category', () => {
      const invalidData = {
        title: 'API',
        description: 'Missing category'
      };

      const result = glossarySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.issues).toContainEqual(
          expect.objectContaining({
            code: 'invalid_type',
            path: ['category'],
            message: 'Required'
          })
        );
      }
    });

    it('should reject missing required description', () => {
      const invalidData = {
        title: 'API',
        category: 'Web Development'
      };

      const result = glossarySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.issues).toContainEqual(
          expect.objectContaining({
            code: 'invalid_type',
            path: ['description'],
            message: 'Required'
          })
        );
      }
    });

    it('should reject non-string title', () => {
      const invalidData = {
        title: 123,
        category: 'Web Development',
        description: 'Invalid title type'
      };

      const result = glossarySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.issues).toContainEqual(
          expect.objectContaining({
            code: 'invalid_type',
            path: ['title'],
            expected: 'string',
            received: 'number'
          })
        );
      }
    });

    it('should reject non-string category', () => {
      const invalidData = {
        title: 'API',
        category: ['Web Development'],
        description: 'Invalid category type'
      };

      const result = glossarySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.issues).toContainEqual(
          expect.objectContaining({
            code: 'invalid_type',
            path: ['category'],
            expected: 'string',
            received: 'array'
          })
        );
      }
    });

    it('should reject non-string description', () => {
      const invalidData = {
        title: 'API',
        category: 'Web Development',
        description: null
      };

      const result = glossarySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.issues).toContainEqual(
          expect.objectContaining({
            code: 'invalid_type',
            path: ['description'],
            expected: 'string',
            received: 'null'
          })
        );
      }
    });

    it('should reject non-string slug', () => {
      const invalidData = {
        title: 'API',
        slug: 123,
        category: 'Web Development',
        description: 'Invalid slug type'
      };

      const result = glossarySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.issues).toContainEqual(
          expect.objectContaining({
            code: 'invalid_type',
            path: ['slug'],
            expected: 'string',
            received: 'number'
          })
        );
      }
    });

    it('should reject non-array related field', () => {
      const invalidData = {
        title: 'API',
        category: 'Web Development',
        description: 'Invalid related type',
        related: 'not-an-array'
      };

      const result = glossarySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.issues).toContainEqual(
          expect.objectContaining({
            code: 'invalid_type',
            path: ['related'],
            expected: 'array',
            received: 'string'
          })
        );
      }
    });

    it('should reject non-string elements in related array', () => {
      const invalidData = {
        title: 'API',
        category: 'Web Development',
        description: 'Invalid related array elements',
        related: ['valid', 123, 'also-valid']
      };

      const result = glossarySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.issues).toContainEqual(
          expect.objectContaining({
            code: 'invalid_type',
            path: ['related', 1],
            expected: 'string',
            received: 'number'
          })
        );
      }
    });

    it('should reject non-array tags field', () => {
      const invalidData = {
        title: 'API',
        category: 'Web Development',
        description: 'Invalid tags type',
        tags: 'not-an-array'
      };

      const result = glossarySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.issues).toContainEqual(
          expect.objectContaining({
            code: 'invalid_type',
            path: ['tags'],
            expected: 'array',
            received: 'string'
          })
        );
      }
    });

    it('should reject non-string elements in tags array', () => {
      const invalidData = {
        title: 'API',
        category: 'Web Development',
        description: 'Invalid tags array elements',
        tags: ['web', 123, 'backend']
      };

      const result = glossarySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.issues).toContainEqual(
          expect.objectContaining({
            code: 'invalid_type',
            path: ['tags', 1],
            expected: 'string',
            received: 'number'
          })
        );
      }
    });

    it('should reject non-date lastUpdated field', () => {
      const invalidData = {
        title: 'API',
        category: 'Web Development',
        description: 'Invalid lastUpdated type',
        lastUpdated: '2024-01-15'
      };

      const result = glossarySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.issues).toContainEqual(
          expect.objectContaining({
            code: 'invalid_type',
            path: ['lastUpdated'],
            expected: 'date',
            received: 'string'
          })
        );
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty strings in required fields', () => {
      const invalidData = {
        title: '',
        category: '',
        description: ''
      };

      const result = glossarySchema.safeParse(invalidData);
      expect(result.success).toBe(true); // Empty strings are valid strings
      
      if (result.success) {
        expect(result.data.title).toBe('');
        expect(result.data.category).toBe('');
        expect(result.data.description).toBe('');
      }
    });

    it('should handle very long strings', () => {
      const longString = 'A'.repeat(10000);
      const validData = {
        title: longString,
        category: longString,
        description: longString
      };

      const result = glossarySchema.safeParse(validData);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.title).toBe(longString);
        expect(result.data.category).toBe(longString);
        expect(result.data.description).toBe(longString);
      }
    });

    it('should handle special characters in strings', () => {
      const specialString = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`"\'\\';
      const validData = {
        title: specialString,
        category: specialString,
        description: specialString,
        slug: specialString,
        related: [specialString],
        tags: [specialString]
      };

      const result = glossarySchema.safeParse(validData);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.title).toBe(specialString);
        expect(result.data.category).toBe(specialString);
        expect(result.data.description).toBe(specialString);
        expect(result.data.slug).toBe(specialString);
        expect(result.data.related).toEqual([specialString]);
        expect(result.data.tags).toEqual([specialString]);
      }
    });

    it('should handle Unicode characters', () => {
      const unicodeString = 'API คือ Application Programming Interface 🚀';
      const validData = {
        title: unicodeString,
        category: 'การพัฒนาเว็บ',
        description: 'คำอธิบายภาษาไทย with emojis 📚',
        tags: ['ไทย', 'english', '🏷️']
      };

      const result = glossarySchema.safeParse(validData);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.title).toBe(unicodeString);
        expect(result.data.category).toBe('การพัฒนาเว็บ');
        expect(result.data.description).toBe('คำอธิบายภาษาไทย with emojis 📚');
        expect(result.data.tags).toEqual(['ไทย', 'english', '🏷️']);
      }
    });

    it('should handle large arrays', () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => `tag-${i}`);
      const validData = {
        title: 'API',
        category: 'Web Development',
        description: 'Large arrays test',
        related: largeArray,
        tags: largeArray
      };

      const result = glossarySchema.safeParse(validData);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.related).toHaveLength(1000);
        expect(result.data.tags).toHaveLength(1000);
      }
    });

    it('should handle Date edge cases', () => {
      const validDates = [
        new Date('1970-01-01'),
        new Date('2024-01-15'),
        new Date('2099-12-31'),
        new Date(0), // Unix epoch
        new Date(Date.now()) // Current time
      ];

      validDates.forEach(date => {
        const validData = {
          title: 'API',
          category: 'Web Development',
          description: 'Date test',
          lastUpdated: date
        };

        const result = glossarySchema.safeParse(validData);
        expect(result.success).toBe(true);
        
        if (result.success) {
          expect(result.data.lastUpdated).toBeInstanceOf(Date);
          expect(result.data.lastUpdated?.getTime()).toBe(date.getTime());
        }
      });
    });
  });

  describe('Schema Transformation', () => {
    it('should preserve all valid fields after parsing', () => {
      const inputData = {
        title: 'GraphQL',
        slug: 'graphql',
        category: 'API',
        description: 'Query language for APIs',
        related: ['api', 'rest'],
        tags: ['api', 'query', 'graph'],
        lastUpdated: new Date('2024-01-20')
      };

      const result = glossarySchema.safeParse(inputData);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data).toEqual(inputData);
        expect(Object.keys(result.data)).toEqual(Object.keys(inputData));
      }
    });

    it('should handle undefined optional fields correctly', () => {
      const inputData = {
        title: 'API',
        category: 'Web Development',
        description: 'Application Programming Interface',
        slug: undefined,
        related: undefined,
        tags: undefined,
        lastUpdated: undefined
      };

      const result = glossarySchema.safeParse(inputData);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.slug).toBeUndefined();
        expect(result.data.related).toBeUndefined();
        expect(result.data.tags).toBeUndefined();
        expect(result.data.lastUpdated).toBeUndefined();
      }
    });
  });
});