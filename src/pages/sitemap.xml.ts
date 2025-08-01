import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { seoConfig } from '../config/seo.ts';

const siteUrl = seoConfig.siteUrl;

export const GET: APIRoute = async () => {
  // Get all glossary entries
  const glossaryEntries = await getCollection('glossary');
  
  // Get unique categories for category pages
  const categories = [...new Set(glossaryEntries.map(entry => entry.data.category))];
  
  // Generate sitemap entries
  const sitemapEntries = [
    // Homepage
    {
      url: siteUrl,
      lastmod: new Date().toISOString(),
      changefreq: seoConfig.sitemap.changefreq.home,
      priority: seoConfig.sitemap.priority.home.toString(),
      images: [
        {
          url: `${siteUrl}/og-default.png`,
          title: 'TechGloss - คลังคำศัพท์ทางเทคนิคสำหรับนักพัฒนา',
          caption: 'TechGloss homepage'
        }
      ]
    },
    // Category filter pages (virtual pages for SEO)
    ...categories.map(category => {
      const categoryTerms = glossaryEntries.filter(entry => entry.data.category === category);
      const latestUpdate = categoryTerms
        .filter(entry => entry.data.lastUpdated)
        .sort((a, b) => (b.data.lastUpdated?.getTime() || 0) - (a.data.lastUpdated?.getTime() || 0))[0];
      
      return {
        url: `${siteUrl}/?category=${encodeURIComponent(category)}`,
        lastmod: latestUpdate?.data.lastUpdated?.toISOString() || new Date().toISOString(),
        changefreq: seoConfig.sitemap.changefreq.glossary,
        priority: '0.7'
      };
    }),
    // Glossary terms
    ...glossaryEntries.map(entry => ({
      url: `${siteUrl}/glossary/${entry.slug}`,
      lastmod: entry.data.lastUpdated ? entry.data.lastUpdated.toISOString() : new Date().toISOString(),
      changefreq: seoConfig.sitemap.changefreq.glossary,
      priority: seoConfig.sitemap.priority.glossary.toString(),
      // Add images if the term has any (placeholder for future image support)
      ...(entry.data.category && {
        images: [
          {
            url: `${siteUrl}/og-term-${entry.slug}.png`,
            title: `${entry.data.title} - ${entry.data.category}`,
            caption: entry.data.description
          }
        ]
      })
    })),
    // Static pages
    {
      url: `${siteUrl}/about`,
      lastmod: new Date().toISOString(),
      changefreq: seoConfig.sitemap.changefreq.static,
      priority: seoConfig.sitemap.priority.static.toString()
    },
    // RSS feed
    {
      url: `${siteUrl}/rss.xml`,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: '0.5'
    }
  ];

  // Generate XML with enhanced features
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
    <mobile:mobile/>
${entry.images ? entry.images.map(img => `    <image:image>
      <image:loc>${img.url}</image:loc>
      <image:title>${img.title}</image:title>
      <image:caption>${img.caption}</image:caption>
    </image:image>`).join('\n') : ''}
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=7200', // Cache for 1 hour, CDN for 2 hours
      'X-Robots-Tag': 'noindex', // Don't index the sitemap itself
    },
  });
};