import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const siteUrl = 'https://techgloss.dev'; // Replace with actual domain

export const GET: APIRoute = async () => {
  // Get all glossary entries
  const glossaryEntries = await getCollection('glossary');
  
  // Generate sitemap entries
  const sitemapEntries = [
    // Homepage
    {
      url: siteUrl,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: '1.0'
    },
    // Glossary terms
    ...glossaryEntries.map(entry => ({
      url: `${siteUrl}/glossary/${entry.slug}`,
      lastmod: entry.data.lastUpdated ? entry.data.lastUpdated.toISOString() : new Date().toISOString(),
      changefreq: 'weekly',
      priority: '0.8'
    }))
  ];

  // Generate XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${sitemapEntries.map(entry => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
};