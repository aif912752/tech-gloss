// Search utilities for TechGloss
import type { CollectionEntry } from 'astro:content';

export interface SearchIndex {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  content: string;
  tags: string[];
}

export interface SearchResult {
  item: SearchIndex;
  score?: number;
  matches?: any[];
}

/**
 * Generate search index from glossary entries
 */
export function generateSearchIndex(entries: CollectionEntry<'glossary'>[]): SearchIndex[] {
  return entries.map(entry => {
    // Extract text content from markdown (basic extraction)
    const content = entry.body || '';
    
    // Clean content - remove markdown syntax for better search
    const cleanContent = content
      .replace(/#{1,6}\s+/g, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/`(.*?)`/g, '$1') // Remove inline code
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim();

    return {
      id: entry.slug,
      title: entry.data.title,
      slug: entry.slug,
      category: entry.data.category,
      description: entry.data.description,
      content: cleanContent,
      tags: entry.data.tags || []
    };
  });
}

/**
 * Basic search function (fallback when Fuse.js is not available)
 */
export function basicSearch(index: SearchIndex[], query: string): SearchResult[] {
  if (!query.trim()) return [];
  
  const searchTerm = query.toLowerCase();
  const results: SearchResult[] = [];
  
  index.forEach(item => {
    let score = 0;
    
    // Title match (highest priority)
    if (item.title.toLowerCase().includes(searchTerm)) {
      score += 10;
    }
    
    // Description match
    if (item.description.toLowerCase().includes(searchTerm)) {
      score += 5;
    }
    
    // Category match
    if (item.category.toLowerCase().includes(searchTerm)) {
      score += 3;
    }
    
    // Tags match
    if (item.tags.some(tag => tag.toLowerCase().includes(searchTerm))) {
      score += 2;
    }
    
    // Content match (lowest priority)
    if (item.content.toLowerCase().includes(searchTerm)) {
      score += 1;
    }
    
    if (score > 0) {
      results.push({ item, score });
    }
  });
  
  // Sort by score (descending)
  return results.sort((a, b) => (b.score || 0) - (a.score || 0));
}

/**
 * Highlight search terms in text
 */
export function highlightSearchTerms(text: string, query: string): string {
  if (!query.trim()) return text;
  
  const searchTerm = query.trim();
  // Escape special regex characters
  const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedTerm})`, 'gi');
  
  return text.replace(regex, '<mark class="bg-primary/20 text-primary px-1 rounded">$1</mark>');
}

/**
 * Get search suggestions based on partial input
 */
export function getSearchSuggestions(index: SearchIndex[], query: string, limit = 5): string[] {
  if (!query.trim() || query.length < 2) return [];
  
  const searchTerm = query.toLowerCase();
  const suggestions = new Set<string>();
  
  index.forEach(item => {
    // Add title if it starts with or contains the search term
    if (item.title.toLowerCase().includes(searchTerm)) {
      suggestions.add(item.title);
    }
    
    // Add category if it matches
    if (item.category.toLowerCase().includes(searchTerm)) {
      suggestions.add(item.category);
    }
    
    // Add matching tags
    item.tags.forEach(tag => {
      if (tag.toLowerCase().includes(searchTerm)) {
        suggestions.add(tag);
      }
    });
  });
  
  return Array.from(suggestions).slice(0, limit);
}

/**
 * Filter index by category
 */
export function filterByCategory(index: SearchIndex[], category: string): SearchIndex[] {
  if (!category || category === 'all') return index;
  return index.filter(item => item.category === category);
}

/**
 * Get popular search terms (mock implementation)
 */
export function getPopularSearchTerms(): string[] {
  return [
    'API',
    'JavaScript',
    'React',
    'Node.js',
    'Database',
    'Authentication',
    'REST',
    'GraphQL',
    'TypeScript',
    'Git'
  ];
}