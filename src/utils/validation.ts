// Validation utilities for build-time checks
import type { CollectionEntry } from 'astro:content';

/**
 * Validate related term references
 */
export function validateRelatedTerms(
  entries: CollectionEntry<'glossary'>[]
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  // Create a map of all valid slugs
  const validSlugs = new Set(entries.map(entry => entry.slug));
  
  entries.forEach(entry => {
    const { related } = entry.data;
    
    if (related && Array.isArray(related)) {
      related.forEach(relatedSlug => {
        if (!validSlugs.has(relatedSlug)) {
          errors.push({
            type: 'invalid-related-term',
            entry: entry.slug,
            field: 'related',
            value: relatedSlug,
            message: `Related term "${relatedSlug}" does not exist`,
            suggestion: findSimilarSlugs(relatedSlug, validSlugs)
          });
        }
      });
      
      // Check for self-references
      if (related.includes(entry.slug)) {
        warnings.push({
          type: 'self-reference',
          entry: entry.slug,
          field: 'related',
          message: `Term "${entry.slug}" references itself in related terms`
        });
      }
      
      // Check for duplicate references
      const duplicates = related.filter((slug, index) => related.indexOf(slug) !== index);
      if (duplicates.length > 0) {
        warnings.push({
          type: 'duplicate-reference',
          entry: entry.slug,
          field: 'related',
          message: `Duplicate related terms found: ${duplicates.join(', ')}`
        });
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    summary: {
      totalEntries: entries.length,
      entriesWithRelated: entries.filter(e => e.data.related?.length).length,
      totalErrors: errors.length,
      totalWarnings: warnings.length
    }
  };
}

/**
 * Validate required fields
 */
export function validateRequiredFields(
  entries: CollectionEntry<'glossary'>[]
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  entries.forEach(entry => {
    const { title, description, category } = entry.data;
    
    // Check required fields
    if (!title || title.trim() === '') {
      errors.push({
        type: 'missing-required-field',
        entry: entry.slug,
        field: 'title',
        message: 'Title is required'
      });
    }
    
    if (!description || description.trim() === '') {
      errors.push({
        type: 'missing-required-field',
        entry: entry.slug,
        field: 'description',
        message: 'Description is required'
      });
    }
    
    if (!category || category.trim() === '') {
      errors.push({
        type: 'missing-required-field',
        entry: entry.slug,
        field: 'category',
        message: 'Category is required'
      });
    }
    
    // Check field lengths
    if (title && title.length > 100) {
      warnings.push({
        type: 'field-too-long',
        entry: entry.slug,
        field: 'title',
        message: `Title is ${title.length} characters (recommended: < 100)`
      });
    }
    
    if (description && description.length > 500) {
      warnings.push({
        type: 'field-too-long',
        entry: entry.slug,
        field: 'description',
        message: `Description is ${description.length} characters (recommended: < 500)`
      });
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    summary: {
      totalEntries: entries.length,
      entriesWithRelated: 0,
      totalErrors: errors.length,
      totalWarnings: warnings.length
    }
  };
}

/**
 * Validate content structure
 */
export function validateContentStructure(
  entries: CollectionEntry<'glossary'>[]
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  entries.forEach(entry => {
    // Check for common content issues
    const content = entry.body;
    
    // Check for empty content
    if (!content || content.trim() === '') {
      warnings.push({
        type: 'empty-content',
        entry: entry.slug,
        field: 'body',
        message: 'Entry has no content body'
      });
    }
    
    // Check for broken internal links
    const internalLinkRegex = /\[([^\]]+)\]\(\/glossary\/([^)]+)\)/g;
    let match;
    const validSlugs = new Set(entries.map(e => e.slug));
    
    while ((match = internalLinkRegex.exec(content)) !== null) {
      const linkedSlug = match[2];
      if (!validSlugs.has(linkedSlug)) {
        errors.push({
          type: 'broken-internal-link',
          entry: entry.slug,
          field: 'body',
          value: linkedSlug,
          message: `Broken internal link to "/glossary/${linkedSlug}"`,
          suggestion: findSimilarSlugs(linkedSlug, validSlugs)
        });
      }
    }
    
    // Check for missing code blocks language specification
    const codeBlockRegex = /```(\w*)\n/g;
    let codeMatch;
    while ((codeMatch = codeBlockRegex.exec(content)) !== null) {
      if (!codeMatch[1]) {
        warnings.push({
          type: 'missing-code-language',
          entry: entry.slug,
          field: 'body',
          message: 'Code block without language specification found'
        });
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    summary: {
      totalEntries: entries.length,
      entriesWithRelated: 0,
      totalErrors: errors.length,
      totalWarnings: warnings.length
    }
  };
}

/**
 * Find similar slugs for suggestions
 */
function findSimilarSlugs(target: string, validSlugs: Set<string>): string[] {
  const suggestions: string[] = [];
  const targetLower = target.toLowerCase();
  
  for (const slug of validSlugs) {
    const slugLower = slug.toLowerCase();
    
    // Exact match (shouldn't happen, but just in case)
    if (slugLower === targetLower) continue;
    
    // Contains target
    if (slugLower.includes(targetLower) || targetLower.includes(slugLower)) {
      suggestions.push(slug);
    }
    
    // Levenshtein distance check (simple version)
    if (suggestions.length < 3 && levenshteinDistance(targetLower, slugLower) <= 2) {
      suggestions.push(slug);
    }
  }
  
  return suggestions.slice(0, 3); // Return max 3 suggestions
}

/**
 * Simple Levenshtein distance calculation
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Run all validations
 */
export function validateAll(entries: CollectionEntry<'glossary'>[]): ValidationSummary {
  const relatedTermsResult = validateRelatedTerms(entries);
  const requiredFieldsResult = validateRequiredFields(entries);
  const contentStructureResult = validateContentStructure(entries);
  
  const allErrors = [
    ...relatedTermsResult.errors,
    ...requiredFieldsResult.errors,
    ...contentStructureResult.errors
  ];
  
  const allWarnings = [
    ...relatedTermsResult.warnings,
    ...requiredFieldsResult.warnings,
    ...contentStructureResult.warnings
  ];
  
  return {
    isValid: allErrors.length === 0,
    totalEntries: entries.length,
    totalErrors: allErrors.length,
    totalWarnings: allWarnings.length,
    results: {
      relatedTerms: relatedTermsResult,
      requiredFields: requiredFieldsResult,
      contentStructure: contentStructureResult
    },
    errors: allErrors,
    warnings: allWarnings
  };
}

// Type definitions
export interface ValidationError {
  type: string;
  entry: string;
  field: string;
  value?: string;
  message: string;
  suggestion?: string[];
}

export interface ValidationWarning {
  type: string;
  entry: string;
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  summary: {
    totalEntries: number;
    entriesWithRelated: number;
    totalErrors: number;
    totalWarnings: number;
  };
}

export interface ValidationSummary {
  isValid: boolean;
  totalEntries: number;
  totalErrors: number;
  totalWarnings: number;
  results: {
    relatedTerms: ValidationResult;
    requiredFields: ValidationResult;
    contentStructure: ValidationResult;
  };
  errors: ValidationError[];
  warnings: ValidationWarning[];
}