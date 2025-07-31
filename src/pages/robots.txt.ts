import type { APIRoute } from 'astro';

const siteUrl = 'https://techgloss.dev'; // Replace with actual domain

export const GET: APIRoute = async () => {
  const robotsTxt = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${siteUrl}/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Block access to admin or private areas (if any)
Disallow: /admin/
Disallow: /.well-known/
Disallow: /api/

# Allow all search engines to index the glossary
Allow: /glossary/

# Cache policy hint for crawlers
# This is not standard but some crawlers respect it
Cache-delay: 86400`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
    },
  });
};