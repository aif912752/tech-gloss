// Utility functions for Open Graph image generation
// This is a placeholder implementation - in production you might want to use
// a service like @vercel/og or generate images dynamically

export interface OGImageOptions {
  title: string;
  category?: string;
  description?: string;
  theme?: 'light' | 'dark';
}

/**
 * Generate Open Graph image URL for a glossary term
 * In production, this could generate dynamic images or use a service
 */
export function generateOGImageUrl(options: OGImageOptions): string {
  const { title, category, theme = 'light' } = options;
  
  // For now, return a placeholder image
  // In production, you might:
  // 1. Use @vercel/og to generate dynamic images
  // 2. Use a service like Bannerbear or Placid
  // 3. Pre-generate images at build time
  
  const baseUrl = 'https://techgloss.dev'; // Replace with actual domain
  
  // Example dynamic image generation URL (placeholder)
  const params = new URLSearchParams({
    title: title,
    category: category || 'General',
    theme: theme,
  });
  
  return `${baseUrl}/api/og?${params.toString()}`;
}

/**
 * Generate default Open Graph image for the homepage
 */
export function getDefaultOGImage(): string {
  return 'https://techgloss.dev/og-default.png'; // Replace with actual image
}

/**
 * Generate category-specific Open Graph image
 */
export function getCategoryOGImage(category: string): string {
  const baseUrl = 'https://techgloss.dev'; // Replace with actual domain
  return `${baseUrl}/og-category-${category.toLowerCase().replace(/\s+/g, '-')}.png`;
}

/**
 * Validate and sanitize image URLs
 */
export function sanitizeImageUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.href;
  } catch {
    // Return default image if URL is invalid
    return getDefaultOGImage();
  }
}