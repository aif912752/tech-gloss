// Tests for validation utilities
import { describe, it, expect, beforeEach } from 'vitest';
import { 
  validateRelatedTerms, 
  validateRequiredFields, 
  validateContentStructure,
  validateAll 
} from './validation';
import type { CollectionEntry } from 'astro:content';

// Mock glossary entries for testing
const createMockEntry = (slug: string, data: any, body: string = ''): CollectionEntry<'glossary'> => ({
  slug,
  data,
  body,
  render: async () => ({ Content: () => 'Mock content' }),
});

describe('Validation Utils', () => {
  describe('validateRelatedTerms', () => {
    it('should pass validation when all related terms exist', () => {
      const entries = [
        createMockEntry('api', { 
          title: 'API', 
          description: 'Test', 
          category: 'Web',
          related: ['json', 'rest'] 
        }),
        createMockEntry('json', { 
          title: 'JSON', 
          description: 'Test', 
          category: 'Data' 
        }),
        createMockEntry('rest', { 
          title: 'REST', 
          description: 'Test', 
          category: 'Web' 
        }),
      ];

      const result = validateRelatedTerms(entries);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should detect invalid related terms', () => {
      const entries = [
        createMockEntry('api', { 
          title: 'API', 
          description: 'Test', 
          category: 'Web',
          related: ['nonexistent', 'json'] 
        }),
        createMockEntry('json', { 
          title: 'JSON', 
          description: 'Test', 
          category: 'Data' 
        }),
      ];

      const result = validateRelatedTerms(entries);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('invalid-related-term');
      expect(result.errors[0].entry).toBe('api');
      expect(result.errors[0].value).toBe('nonexistent');
    });

    it('should detect self-references', () => {
      const entries = [
        createMockEntry('api', { 
          title: 'API', 
          description: 'Test', 
          category: 'Web',
          related: ['api', 'json'] 
        }),
        createMockEntry('json', { 
          title: 'JSON', 
          description: 'Test', 
          category: 'Data' 
        }),
      ];

      const result = validateRelatedTerms(entries);

      expect(result.isValid).toBe(true); // Self-reference is a warning, not error
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe('self-reference');
      expect(result.warnings[0].entry).toBe('api');
    });

    it('should detect duplicate references', () => {
      const entries = [
        createMockEntry('api', { 
          title: 'API', 
          description: 'Test', 
          category: 'Web',
          related: ['json', 'json'] 
        }),
        createMockEntry('json', { 
          title: 'JSON', 
          description: 'Test', 
          category: 'Data' 
        }),
      ];

      const result = validateRelatedTerms(entries);

      expect(result.isValid).toBe(true); // Duplicates are warnings, not errors
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe('duplicate-reference');
      expect(result.warnings[0].entry).toBe('api');
    });
  });

  describe('validateRequiredFields', () => {
    it('should pass validation when all required fields are present', () => {
      const entries = [
        createMockEntry('api', { 
          title: 'API', 
          description: 'Application Programming Interface', 
          category: 'Web Development' 
        }),
      ];

      const result = validateRequiredFields(entries);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing title', () => {
      const entries = [
        createMockEntry('api', { 
          title: '', 
          description: 'Test', 
          category: 'Web' 
        }),
      ];

      const result = validateRequiredFields(entries);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('missing-required-field');
      expect(result.errors[0].field).toBe('title');
    });

    it('should detect missing description', () => {
      const entries = [
        createMockEntry('api', { 
          title: 'API', 
          description: '', 
          category: 'Web' 
        }),
      ];

      const result = validateRequiredFields(entries);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('description');
    });

    it('should detect missing category', () => {
      const entries = [
        createMockEntry('api', { 
          title: 'API', 
          description: 'Test', 
          category: '' 
        }),
      ];

      const result = validateRequiredFields(entries);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('category');
    });

    it('should warn about long titles', () => {
      const longTitle = 'A'.repeat(150);
      const entries = [
        createMockEntry('api', { 
          title: longTitle, 
          description: 'Test', 
          category: 'Web' 
        }),
      ];

      const result = validateRequiredFields(entries);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe('field-too-long');
      expect(result.warnings[0].field).toBe('title');
    });

    it('should warn about long descriptions', () => {
      const longDescription = 'A'.repeat(600);
      const entries = [
        createMockEntry('api', { 
          title: 'API', 
          description: longDescription, 
          category: 'Web' 
        }),
      ];

      const result = validateRequiredFields(entries);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe('field-too-long');
      expect(result.warnings[0].field).toBe('description');
    });
  });

  describe('validateContentStructure', () => {
    it('should pass validation for well-structured content', () => {
      const entries = [
        createMockEntry('api', { 
          title: 'API', 
          description: 'Test', 
          category: 'Web' 
        }, 'This is good content with proper structure.'),
      ];

      const result = validateContentStructure(entries);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should warn about empty content', () => {
      const entries = [
        createMockEntry('api', { 
          title: 'API', 
          description: 'Test', 
          category: 'Web' 
        }, ''),
      ];

      const result = validateContentStructure(entries);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe('empty-content');
    });

    it('should detect broken internal links', () => {
      const entries = [
        createMockEntry('api', { 
          title: 'API', 
          description: 'Test', 
          category: 'Web' 
        }, 'See also [JSON](/glossary/nonexistent) for more info.'),
        createMockEntry('json', { 
          title: 'JSON', 
          description: 'Test', 
          category: 'Data' 
        }),
      ];

      const result = validateContentStructure(entries);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('broken-internal-link');
      expect(result.errors[0].value).toBe('nonexistent');
    });

    it('should warn about code blocks without language specification', () => {
      const entries = [
        createMockEntry('api', { 
          title: 'API', 
          description: 'Test', 
          category: 'Web' 
        }, 'Example code:\n```\nconst api = "test";\n```'),
      ];

      const result = validateContentStructure(entries);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe('missing-code-language');
    });
  });

  describe('validateAll', () => {
    it('should run all validations and combine results', () => {
      const entries = [
        createMockEntry('api', { 
          title: '', // Missing title (error)
          description: 'Test', 
          category: 'Web',
          related: ['nonexistent'] // Invalid related term (error)
        }, ''), // Empty content (warning)
      ];

      const result = validateAll(entries);

      expect(result.isValid).toBe(false);
      expect(result.totalErrors).toBe(2); // Missing title + invalid related term
      expect(result.totalWarnings).toBe(1); // Empty content
      expect(result.results.requiredFields.isValid).toBe(false);
      expect(result.results.relatedTerms.isValid).toBe(false);
      expect(result.results.contentStructure.isValid).toBe(true);
    });

    it('should pass when all validations pass', () => {
      const entries = [
        createMockEntry('api', { 
          title: 'API', 
          description: 'Application Programming Interface', 
          category: 'Web Development',
          related: ['json']
        }, 'This is good content about APIs.'),
        createMockEntry('json', { 
          title: 'JSON', 
          description: 'JavaScript Object Notation', 
          category: 'Data Format'
        }, 'This is good content about JSON.'),
      ];

      const result = validateAll(entries);

      expect(result.isValid).toBe(true);
      expect(result.totalErrors).toBe(0);
      expect(result.totalWarnings).toBe(0);
    });
  });
});