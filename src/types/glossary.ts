import type { CollectionEntry } from 'astro:content';

// Type definitions for the glossary content collection
export type GlossaryEntry = CollectionEntry<'glossary'>;

export interface GlossaryData {
  title: string;
  slug: string;
  category: string;
  description: string;
  related?: string[];
  tags?: string[];
  lastUpdated?: Date;
}

// Search related types
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

// Component prop types
export interface GlossaryCardProps {
  title: string;
  slug: string;
  category: string;
  description: string;
}

export interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

export interface RelatedLinksProps {
  related?: string[];
  allTerms: GlossaryEntry[];
}

export interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
}

// Layout prop types
export interface BaseLayoutProps {
  title: string;
  description?: string;
  ogImage?: string;
}

export interface GlossaryLayoutProps {
  entry: GlossaryEntry;
  allTerms: GlossaryEntry[];
}