import type { APIRoute } from 'astro';
import { seoConfig } from '../config/seo.ts';

const siteUrl = seoConfig.siteUrl;

export const GET: APIRoute = async () => {
  const robotsTxt = `# Robots.txt for TechGloss
# Generated automatically - do not edit manually

User-agent: *
${seoConfig.robots.allowAll ? 'Allow: /' : 'Disallow: /'}

# Sitemap location
Sitemap: ${siteUrl}/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: ${seoConfig.robots.crawlDelay}

# Block access to admin or private areas
${seoConfig.robots.disallowPaths.map(path => `Disallow: ${path}`).join('\n')}

# Explicitly allow important paths
${seoConfig.robots.allowPaths.map(path => `Allow: ${path}`).join('\n')}

# Search engine specific rules
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 2

User-agent: Slurp
Allow: /
Crawl-delay: 3

User-agent: DuckDuckBot
Allow: /
Crawl-delay: 1

User-agent: Baiduspider
Allow: /
Crawl-delay: 5

# Block problematic bots
User-agent: AhrefsBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: DotBot
Disallow: /

# Cache policy hint for crawlers
# This is not standard but some crawlers respect it
Cache-delay: 86400

# Host directive (helps with canonicalization)
Host: ${new URL(siteUrl).hostname}`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=172800', // Cache for 24 hours, CDN for 48 hours
      'X-Robots-Tag': 'noindex, nofollow', // Don't index robots.txt itself
    },
  });
};