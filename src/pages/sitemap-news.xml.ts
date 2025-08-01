import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { seoConfig } from '../config/seo.ts';

const siteUrl = seoConfig.siteUrl;

export const GET: APIRoute = async () => {
  // Get all glossary entries
  const glossaryEntries = await getCollection('glossary');
  
  // Filter entries updated in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentEntries = glossaryEntries
    .filter(entry => entry.data.lastUpdated && entry.data.lastUpdated >= thirtyDaysAgo)
    .sort((a, b) => (b.data.lastUpdated?.getTime() || 0) - (a.data.lastUpdated?.getTime() || 0))
    .slice(0, 1000); // Google News sitemap limit
  
  // Generate news sitemap XML
  const newsSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${recentEntries.map(entry => `  <url>
    <loc>${siteUrl}/glossary/${entry.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>TechGloss</news:name>
        <news:language>th</news:language>
      </news:publication>
      <news:publication_date>${entry.data.lastUpdated?.toISOString()}</news:publication_date>
      <news:title>${entry.data.title} - คำศัพท์ทางเทคนิค</news:title>
      <news:keywords>${[entry.data.category, ...(entry.data.tags || [])].join(', ')}</news:keywords>
    </news:news>
    <lastmod>${entry.data.lastUpdated?.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(newsSitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800, s-maxage=3600', // Cache for 30 minutes, CDN for 1 hour
      'X-Robots-Tag': 'noindex',
    },
  });
};