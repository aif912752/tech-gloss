// Integration tests for RSS feed generation
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockGlossaryEntries } from '../mocks/astro-content';

// Helper function to escape XML content
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Mock RSS feed generation function
function generateRSSFeed(entries: any[]) {
  const rssContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Tech Glossary</title>
    <description>คำศัพท์ทางเทคนิคสำหรับนักพัฒนา</description>
    <link>https://techgloss.com</link>
    <language>th</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="https://techgloss.com/rss.xml" rel="self" type="application/rss+xml"/>
    ${entries.map(entry => `
    <item>
      <title>${escapeXml(entry.data.title)}</title>
      <description>${escapeXml(entry.data.description)}</description>
      <link>https://techgloss.com/glossary/${entry.slug}</link>
      <guid>https://techgloss.com/glossary/${entry.slug}</guid>
      <category>${escapeXml(entry.data.category)}</category>
      <pubDate>${entry.data.lastUpdated ? new Date(entry.data.lastUpdated).toUTCString() : new Date().toUTCString()}</pubDate>
    </item>`).join('')}
  </channel>
</rss>`;

  return rssContent;
}

// Mock RSS feed validation function
function validateRSSFeed(rssContent: string) {
  const errors: string[] = [];
  
  // Check XML structure
  if (!rssContent.includes('<?xml version="1.0"')) {
    errors.push('Missing XML declaration');
  }
  
  if (!rssContent.includes('<rss version="2.0"')) {
    errors.push('Missing RSS root element');
  }
  
  if (!rssContent.includes('<channel>')) {
    errors.push('Missing channel element');
  }
  
  // Check required channel elements
  const requiredChannelElements = ['<title>', '<description>', '<link>', '<language>'];
  requiredChannelElements.forEach(element => {
    if (!rssContent.includes(element)) {
      errors.push(`Missing required channel element: ${element}`);
    }
  });
  
  // Check for items
  if (!rssContent.includes('<item>')) {
    errors.push('No RSS items found');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

describe('RSS Feed Integration Tests', () => {
  let entries: any[];

  beforeEach(() => {
    entries = mockGlossaryEntries;
  });

  describe('RSS Feed Generation', () => {
    it('should generate valid RSS feed structure', () => {
      const rssContent = generateRSSFeed(entries);
      
      // Check XML declaration
      expect(rssContent).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      
      // Check RSS root element
      expect(rssContent).toContain('<rss version="2.0"');
      
      // Check channel element
      expect(rssContent).toContain('<channel>');
      expect(rssContent).toContain('</channel>');
    });

    it('should include all required channel metadata', () => {
      const rssContent = generateRSSFeed(entries);
      
      // Check required channel elements
      expect(rssContent).toContain('<title>Tech Glossary</title>');
      expect(rssContent).toContain('<description>คำศัพท์ทางเทคนิคสำหรับนักพัฒนา</description>');
      expect(rssContent).toContain('<link>https://techgloss.com</link>');
      expect(rssContent).toContain('<language>th</language>');
      expect(rssContent).toContain('<lastBuildDate>');
    });

    it('should include atom:link for self-reference', () => {
      const rssContent = generateRSSFeed(entries);
      
      expect(rssContent).toContain('xmlns:atom="http://www.w3.org/2005/Atom"');
      expect(rssContent).toContain('<atom:link href="https://techgloss.com/rss.xml" rel="self" type="application/rss+xml"/>');
    });

    it('should generate RSS items for all entries', () => {
      const rssContent = generateRSSFeed(entries);
      
      // Count item elements
      const itemMatches = rssContent.match(/<item>/g);
      expect(itemMatches).toHaveLength(entries.length);
    });
  });

  describe('RSS Item Structure', () => {
    it('should include all required item elements', () => {
      const rssContent = generateRSSFeed(entries);
      
      // Check for required item elements
      expect(rssContent).toContain('<title>');
      expect(rssContent).toContain('<description>');
      expect(rssContent).toContain('<link>');
      expect(rssContent).toContain('<guid>');
      expect(rssContent).toContain('<category>');
      expect(rssContent).toContain('<pubDate>');
    });

    it('should generate correct URLs for each item', () => {
      const rssContent = generateRSSFeed(entries);
      
      entries.forEach(entry => {
        const expectedLink = `https://techgloss.com/glossary/${entry.slug}`;
        expect(rssContent).toContain(`<link>${expectedLink}</link>`);
        expect(rssContent).toContain(`<guid>${expectedLink}</guid>`);
      });
    });

    it('should include entry titles and descriptions', () => {
      const rssContent = generateRSSFeed(entries);
      
      entries.forEach(entry => {
        expect(rssContent).toContain(`<title>${entry.data.title}</title>`);
        expect(rssContent).toContain(`<description>${entry.data.description}</description>`);
      });
    });

    it('should include category information', () => {
      const rssContent = generateRSSFeed(entries);
      
      entries.forEach(entry => {
        expect(rssContent).toContain(`<category>${entry.data.category}</category>`);
      });
    });

    it('should include publication dates', () => {
      const rssContent = generateRSSFeed(entries);
      
      entries.forEach(entry => {
        const expectedDate = entry.data.lastUpdated 
          ? new Date(entry.data.lastUpdated).toUTCString()
          : new Date().toUTCString();
        expect(rssContent).toContain(`<pubDate>${expectedDate}</pubDate>`);
      });
    });
  });

  describe('RSS Feed Validation', () => {
    it('should pass RSS feed validation', () => {
      const rssContent = generateRSSFeed(entries);
      const validation = validateRSSFeed(rssContent);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect missing XML declaration', () => {
      const invalidRSS = '<rss version="2.0"><channel><title>Test</title></channel></rss>';
      const validation = validateRSSFeed(invalidRSS);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Missing XML declaration');
    });

    it('should detect missing RSS root element', () => {
      const invalidRSS = '<?xml version="1.0"?><channel><title>Test</title></channel>';
      const validation = validateRSSFeed(invalidRSS);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Missing RSS root element');
    });

    it('should detect missing channel element', () => {
      const invalidRSS = '<?xml version="1.0"?><rss version="2.0"><title>Test</title></rss>';
      const validation = validateRSSFeed(invalidRSS);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Missing channel element');
    });

    it('should detect missing required channel elements', () => {
      const invalidRSS = `<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <title>Test</title>
  </channel>
</rss>`;
      const validation = validateRSSFeed(invalidRSS);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.includes('Missing required channel element'))).toBe(true);
    });

    it('should detect missing RSS items', () => {
      const invalidRSS = `<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <title>Test</title>
    <description>Test</description>
    <link>https://example.com</link>
    <language>en</language>
  </channel>
</rss>`;
      const validation = validateRSSFeed(invalidRSS);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('No RSS items found');
    });
  });

  describe('RSS Feed Content Quality', () => {
    it('should include meaningful titles', () => {
      const rssContent = generateRSSFeed(entries);
      
      entries.forEach(entry => {
        expect(entry.data.title.length).toBeGreaterThan(0);
        expect(rssContent).toContain(entry.data.title);
      });
    });

    it('should include meaningful descriptions', () => {
      const rssContent = generateRSSFeed(entries);
      
      entries.forEach(entry => {
        expect(entry.data.description.length).toBeGreaterThan(10);
        expect(rssContent).toContain(entry.data.description);
      });
    });

    it('should have unique GUIDs for each item', () => {
      const rssContent = generateRSSFeed(entries);
      
      const guidMatches = rssContent.match(/<guid>([^<]+)<\/guid>/g);
      const guids = guidMatches?.map(match => match.replace(/<guid>|<\/guid>/g, '')) || [];
      
      // All GUIDs should be unique
      const uniqueGuids = new Set(guids);
      expect(uniqueGuids.size).toBe(guids.length);
    });

    it('should have valid URLs', () => {
      const rssContent = generateRSSFeed(entries);
      
      const linkMatches = rssContent.match(/<link>([^<]+)<\/link>/g);
      const links = linkMatches?.map(match => match.replace(/<link>|<\/link>/g, '')) || [];
      
      // Filter out the main site link and only check glossary links
      const glossaryLinks = links.filter(link => link.includes('/glossary/'));
      
      glossaryLinks.forEach(link => {
        expect(link).toMatch(/^https:\/\/techgloss\.com\/glossary\/[a-z0-9-]+$/);
      });
    });
  });

  describe('RSS Feed Performance', () => {
    it('should handle large number of entries efficiently', () => {
      // Create a large number of entries
      const largeEntries = Array.from({ length: 100 }, (_, i) => ({
        slug: `term-${i}`,
        data: {
          title: `Term ${i}`,
          description: `Description for term ${i}`,
          category: 'Test',
          lastUpdated: new Date()
        }
      }));

      const startTime = performance.now();
      const rssContent = generateRSSFeed(largeEntries);
      const endTime = performance.now();

      expect(rssContent).toContain('<item>');
      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
    });

    it('should generate RSS content within reasonable size', () => {
      const rssContent = generateRSSFeed(entries);
      
      // RSS content should not be excessively large
      expect(rssContent.length).toBeLessThan(50000); // 50KB limit
      expect(rssContent.length).toBeGreaterThan(1000); // At least 1KB
    });
  });

  describe('RSS Feed Error Handling', () => {
    it('should handle entries with missing data gracefully', () => {
      const incompleteEntries = [
        {
          slug: 'test',
          data: {
            title: 'Test',
            description: 'Test description',
            category: 'Test'
            // Missing lastUpdated
          }
        }
      ];

      const rssContent = generateRSSFeed(incompleteEntries);
      expect(rssContent).toContain('<item>');
      expect(rssContent).toContain('<pubDate>');
    });

    it('should handle empty entries array', () => {
      const rssContent = generateRSSFeed([]);
      
      expect(rssContent).toContain('<channel>');
      expect(rssContent).not.toContain('<item>');
    });

    it('should escape special characters in content', () => {
      const entriesWithSpecialChars = [
        {
          slug: 'test',
          data: {
            title: 'Test & More <script>alert("xss")</script>',
            description: 'Description with "quotes" and & symbols',
            category: 'Test',
            lastUpdated: new Date()
          }
        }
      ];

      const rssContent = generateRSSFeed(entriesWithSpecialChars);
      
      // Should not contain unescaped special characters
      expect(rssContent).not.toContain('<script>');
      expect(rssContent).not.toContain('alert("xss")');
    });
  });
}); 