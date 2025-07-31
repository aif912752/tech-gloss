// Utility functions for generating SEO meta data
import type { CollectionEntry } from 'astro:content';

/**
 * Generate optimized meta description for glossary terms
 */
export function generateTermMetaDescription(entry: CollectionEntry<'glossary'>): string {
  const { title, description, category } = entry.data;
  
  // Create a comprehensive meta description
  const baseDescription = `${title} คืออะไร? ${description}`;
  const categoryInfo = ` เรียนรู้เพิ่มเติมเกี่ยวกับ ${category} ใน TechGloss`;
  
  // Ensure description is within optimal length (150-160 characters)
  const fullDescription = baseDescription + categoryInfo;
  
  if (fullDescription.length <= 160) {
    return fullDescription;
  }
  
  // Truncate if too long, but keep it meaningful
  const truncated = baseDescription.substring(0, 150);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return truncated.substring(0, lastSpace) + '...';
}

/**
 * Generate meta title for glossary terms
 */
export function generateTermMetaTitle(entry: CollectionEntry<'glossary'>): string {
  const { title, category } = entry.data;
  
  // Optimal title format for SEO
  return `${title} คืออะไร? | ${category} | TechGloss`;
}

/**
 * Generate keywords from entry data
 */
export function generateKeywords(entry: CollectionEntry<'glossary'>): string[] {
  const { title, category, tags = [] } = entry.data;
  
  const keywords = [
    title,
    category,
    ...tags,
    'คำศัพท์เทคนิค',
    'นักพัฒนา',
    'โปรแกรมมิ่ง',
    'TechGloss'
  ];
  
  // Remove duplicates and return
  return [...new Set(keywords.map(k => k.toLowerCase()))];
}

/**
 * Generate canonical URL for a page
 */
export function generateCanonicalUrl(path: string): string {
  const baseUrl = 'https://techgloss.dev'; // Replace with actual domain
  return `${baseUrl}${path.startsWith('/') ? path : '/' + path}`;
}

/**
 * Generate breadcrumb data for structured markup
 */
export function generateBreadcrumbs(entry: CollectionEntry<'glossary'>) {
  const baseUrl = 'https://techgloss.dev'; // Replace with actual domain
  
  return [
    {
      name: 'หน้าแรก',
      url: baseUrl,
      position: 1
    },
    {
      name: entry.data.category,
      url: `${baseUrl}/?category=${encodeURIComponent(entry.data.category)}`,
      position: 2
    },
    {
      name: entry.data.title,
      url: `${baseUrl}/glossary/${entry.slug}`,
      position: 3
    }
  ];
}

/**
 * Validate and optimize meta description length
 */
export function optimizeMetaDescription(description: string, maxLength: number = 160): string {
  if (description.length <= maxLength) {
    return description;
  }
  
  // Find the last complete sentence or phrase within the limit
  const truncated = description.substring(0, maxLength - 3);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastSpace = truncated.lastIndexOf(' ');
  
  // Use period if available and reasonable, otherwise use space
  const cutPoint = lastPeriod > maxLength * 0.7 ? lastPeriod + 1 : lastSpace;
  
  return description.substring(0, cutPoint) + '...';
}

/**
 * Generate social media optimized title
 */
export function generateSocialTitle(title: string, siteName: string = 'TechGloss'): string {
  // Optimal length for social media is around 60 characters
  const maxLength = 60;
  const fullTitle = `${title} | ${siteName}`;
  
  if (fullTitle.length <= maxLength) {
    return fullTitle;
  }
  
  // If too long, just use the title
  return title.length <= maxLength ? title : title.substring(0, maxLength - 3) + '...';
}