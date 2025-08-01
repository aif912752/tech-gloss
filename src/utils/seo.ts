// SEO utility functions for TechGloss
import type { CollectionEntry } from 'astro:content';
import { seoConfig } from '../config/seo.ts';

/**
 * Generate dynamic Open Graph image URL for terms
 */
export function generateOGImageUrl(entry: CollectionEntry<'glossary'>): string {
  // For now, return default image. In the future, this could generate dynamic images
  // using services like Vercel OG, Cloudinary, or a custom image generation API
  const params = new URLSearchParams({
    title: entry.data.title,
    category: entry.data.category,
    description: entry.data.description.substring(0, 100)
  });
  
  // This would be a dynamic image generation endpoint
  return `${seoConfig.siteUrl}/api/og?${params.toString()}`;
}

/**
 * Generate comprehensive meta tags for a glossary term
 */
export function generateTermMetaTags(entry: CollectionEntry<'glossary'>) {
  const title = `${entry.data.title} คืออะไร? | ${entry.data.category} | TechGloss`;
  const description = `${entry.data.title} คืออะไร? ${entry.data.description} เรียนรู้เพิ่มเติมเกี่ยวกับ ${entry.data.category} ใน TechGloss`;
  const url = `${seoConfig.siteUrl}/glossary/${entry.slug}`;
  const image = generateOGImageUrl(entry);
  
  return {
    title,
    description: description.length > 160 ? description.substring(0, 157) + '...' : description,
    url,
    image,
    imageAlt: `${entry.data.title} - คำศัพท์ทางเทคนิคในหมวด ${entry.data.category}`,
    keywords: [
      entry.data.title,
      entry.data.category,
      ...(entry.data.tags || []),
      'คำศัพท์เทคนิค',
      'นักพัฒนา',
      'โปรแกรมมิ่ง',
      'TechGloss'
    ],
    type: 'article' as const,
    publishedTime: entry.data.lastUpdated,
    modifiedTime: entry.data.lastUpdated,
    category: entry.data.category,
    tags: entry.data.tags || []
  };
}

/**
 * Generate meta tags for the homepage
 */
export function generateHomeMetaTags(totalTerms: number, totalCategories: number) {
  return {
    title: seoConfig.pages.home.title,
    description: seoConfig.pages.home.description,
    url: seoConfig.siteUrl,
    image: `${seoConfig.siteUrl}${seoConfig.defaultOGImage}`,
    imageAlt: 'TechGloss - คลังคำศัพท์ทางเทคนิคสำหรับนักพัฒนา',
    keywords: [
      ...seoConfig.pages.home.keywords,
      `${totalTerms} คำศัพท์`,
      `${totalCategories} หมวดหมู่`
    ],
    type: 'website' as const
  };
}

/**
 * Generate category-specific meta tags
 */
export function generateCategoryMetaTags(category: string, terms: CollectionEntry<'glossary'>[]) {
  const title = `คำศัพท์ ${category} | TechGloss`;
  const description = `รวมคำศัพท์ทางเทคนิคในหมวด ${category} ทั้งหมด ${terms.length} คำ พร้อมคำอธิบายและตัวอย่างการใช้งาน`;
  
  return {
    title,
    description,
    url: `${seoConfig.siteUrl}/?category=${encodeURIComponent(category)}`,
    image: `${seoConfig.siteUrl}${seoConfig.defaultOGImage}`,
    imageAlt: `คำศัพท์ ${category} - TechGloss`,
    keywords: [
      category,
      'คำศัพท์เทคนิค',
      'นักพัฒนา',
      'โปรแกรมมิ่ง',
      'TechGloss',
      ...terms.slice(0, 5).map(term => term.data.title)
    ],
    type: 'website' as const
  };
}

/**
 * Validate and sanitize meta description
 */
export function sanitizeMetaDescription(description: string): string {
  // Remove HTML tags
  const cleanDescription = description.replace(/<[^>]*>/g, '');
  
  // Remove extra whitespace
  const trimmedDescription = cleanDescription.replace(/\s+/g, ' ').trim();
  
  // Ensure optimal length (150-160 characters)
  if (trimmedDescription.length <= 160) {
    return trimmedDescription;
  }
  
  // Truncate at word boundary
  const truncated = trimmedDescription.substring(0, 157);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return truncated.substring(0, lastSpace) + '...';
}

/**
 * Generate JSON-LD structured data for search results
 */
export function generateSearchResultsStructuredData(query: string, results: CollectionEntry<'glossary'>[]) {
  return {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    "url": `${seoConfig.siteUrl}/?search=${encodeURIComponent(query)}`,
    "name": `ผลการค้นหา: ${query} | TechGloss`,
    "description": `ผลการค้นหาคำศัพท์ "${query}" ใน TechGloss พบ ${results.length} รายการ`,
    "inLanguage": "th",
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": results.length,
      "itemListElement": results.map((result, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "DefinedTerm",
          "name": result.data.title,
          "url": `${seoConfig.siteUrl}/glossary/${result.slug}`,
          "description": result.data.description,
          "termCode": result.data.category
        }
      }))
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${seoConfig.siteUrl}/?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
}

/**
 * Generate hreflang tags for international SEO (future use)
 */
export function generateHreflangTags(currentPath: string) {
  const hreflangs = [
    { lang: 'th', url: `${seoConfig.siteUrl}${currentPath}` },
    { lang: 'en', url: `${seoConfig.siteUrl}/en${currentPath}` }, // Future English version
    { lang: 'x-default', url: `${seoConfig.siteUrl}${currentPath}` }
  ];
  
  return hreflangs;
}

/**
 * Calculate estimated reading time for content
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200; // Average reading speed for Thai text
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Generate social media sharing URLs
 */
export function generateSharingUrls(url: string, title: string, description: string) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  
  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    line: `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`
  };
}