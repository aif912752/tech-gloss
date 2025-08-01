import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { seoConfig } from '../config/seo.ts';

const siteUrl = seoConfig.siteUrl;

export const GET: APIRoute = async () => {
  // Get all glossary entries
  const glossaryEntries = await getCollection('glossary');
  
  // Sort by last updated date (newest first)
  const sortedEntries = glossaryEntries
    .filter(entry => entry.data.lastUpdated) // Only include entries with update dates
    .sort((a, b) => {
      const dateA = a.data.lastUpdated?.getTime() || 0;
      const dateB = b.data.lastUpdated?.getTime() || 0;
      return dateB - dateA;
    })
    .slice(0, 50); // Limit to 50 most recent entries

  // Generate RSS XML
  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:sy="http://purl.org/rss/1.0/modules/syndication/">
  <channel>
    <title>${seoConfig.rssTitle}</title>
    <description>${seoConfig.rssDescription}</description>
    <link>${siteUrl}</link>
    <language>${seoConfig.language}</language>
    <copyright>© ${new Date().getFullYear()} ${seoConfig.organizationName}</copyright>
    <managingEditor>hello@techgloss.dev (${seoConfig.organizationName})</managingEditor>
    <webMaster>hello@techgloss.dev (${seoConfig.organizationName})</webMaster>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <pubDate>${sortedEntries[0]?.data.lastUpdated?.toUTCString() || new Date().toUTCString()}</pubDate>
    <ttl>1440</ttl>
    <generator>Astro RSS Generator</generator>
    <docs>https://www.rssboard.org/rss-specification</docs>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    
    <!-- Channel Image -->
    <image>
      <url>${siteUrl}/logo.png</url>
      <title>${seoConfig.rssTitle}</title>
      <link>${siteUrl}</link>
      <width>144</width>
      <height>144</height>
      <description>TechGloss Logo</description>
    </image>
    
    <!-- Syndication Module -->
    <sy:updatePeriod>daily</sy:updatePeriod>
    <sy:updateFrequency>1</sy:updateFrequency>
    <sy:updateBase>2024-01-01T00:00:00Z</sy:updateBase>
    
${sortedEntries.map(entry => {
  const termUrl = `${siteUrl}/glossary/${entry.slug}`;
  const pubDate = entry.data.lastUpdated?.toUTCString() || new Date().toUTCString();
  
  // Create a rich description with category and tags
  const categoryInfo = entry.data.category ? `หมวดหมู่: ${entry.data.category}` : '';
  const tagsInfo = entry.data.tags && entry.data.tags.length > 0 
    ? `แท็ก: ${entry.data.tags.join(', ')}` 
    : '';
  
  const richDescription = [
    entry.data.description,
    categoryInfo,
    tagsInfo,
    `อ่านเพิ่มเติมได้ที่: ${termUrl}`
  ].filter(Boolean).join('\n\n');
  
  return `    <item>
      <title>${escapeXml(entry.data.title)}</title>
      <description>${escapeXml(richDescription)}</description>
      <link>${termUrl}</link>
      <guid isPermaLink="true">${termUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <dc:creator>${seoConfig.organizationName}</dc:creator>
      <category>${escapeXml(entry.data.category)}</category>
      ${entry.data.tags ? entry.data.tags.map(tag => `<category>${escapeXml(tag)}</category>`).join('\n      ') : ''}
      <content:encoded><![CDATA[
        <h2>${escapeXml(entry.data.title)}</h2>
        <p><strong>หมวดหมู่:</strong> ${escapeXml(entry.data.category)}</p>
        ${entry.data.tags && entry.data.tags.length > 0 ? `<p><strong>แท็ก:</strong> ${entry.data.tags.map(tag => escapeXml(tag)).join(', ')}</p>` : ''}
        <p>${escapeXml(entry.data.description)}</p>
        <p><a href="${termUrl}">อ่านเพิ่มเติม: ${escapeXml(entry.data.title)}</a></p>
      ]]></content:encoded>
    </item>`;
}).join('\n')}
  </channel>
</rss>`;

  return new Response(rssXml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=7200', // Cache for 1 hour, CDN for 2 hours
      'X-Robots-Tag': 'noindex', // Don't index the RSS feed itself
    },
  });
};

// Helper function to escape XML special characters
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}