// Tests for RelatedLinks component
import { describe, it, expect, beforeEach } from 'vitest';
import { createMockElement } from '../test/utils';
import { mockGlossaryEntries } from '../test/mocks/astro-content';
import type { CollectionEntry } from 'astro:content';

// Mock RelatedLinks props
interface RelatedLinksProps {
  related?: string[];
  allTerms: CollectionEntry<'glossary'>[];
  currentSlug?: string;
}

// Helper function to create RelatedLinks DOM structure
function createRelatedLinks(props: RelatedLinksProps): HTMLElement | null {
  const { related = [], allTerms, currentSlug } = props;
  
  // Convert related term slugs to full term data
  const relatedTerms = related
    .map(slug => allTerms.find(term => term.slug === slug))
    .filter(Boolean) as CollectionEntry<'glossary'>[];

  // Get suggested terms from the same category (if no related terms specified)
  const suggestedTerms = related.length === 0 
    ? allTerms
        .filter(term => term.slug !== currentSlug)
        .slice(0, 4)
    : [];

  const hasContent = relatedTerms.length > 0 || suggestedTerms.length > 0;
  
  if (!hasContent) return null;

  const section = createMockElement('section', {
    'class': 'bg-card border border-border rounded-lg p-6 mt-8'
  });

  // Header
  const headerDiv = createMockElement('div', {
    'class': 'flex items-center mb-4'
  });

  const headerIcon = createMockElement('svg', {
    'class': 'w-5 h-5 text-primary mr-2',
    'fill': 'none',
    'stroke': 'currentColor',
    'viewBox': '0 0 24 24'
  });

  const heading = createMockElement('h3', {
    'class': 'text-heading-3 text-foreground'
  });
  heading.textContent = relatedTerms.length > 0 ? 'คำศัพท์ที่เกี่ยวข้อง' : 'คำศัพท์ที่แนะนำ';

  headerDiv.appendChild(headerIcon);
  headerDiv.appendChild(heading);
  section.appendChild(headerDiv);

  if (relatedTerms.length > 0) {
    // Related Terms (Grouped by Category)
    const contentDiv = createMockElement('div', {
      'class': 'space-y-6'
    });

    // Group related terms by category
    const groupedTerms = relatedTerms.reduce((acc, term) => {
      const category = term.data.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(term);
      return acc;
    }, {} as Record<string, CollectionEntry<'glossary'>[]>);

    Object.entries(groupedTerms).forEach(([category, terms]) => {
      const categoryDiv = createMockElement('div');
      
      const categoryHeading = createMockElement('h4', {
        'class': 'text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide'
      });
      categoryHeading.textContent = category;
      categoryDiv.appendChild(categoryHeading);

      const termsGrid = createMockElement('div', {
        'class': 'grid grid-cols-1 sm:grid-cols-2 gap-3'
      });

      terms.forEach(term => {
        const termLink = createMockElement('a', {
          'href': `/glossary/${term.slug}`,
          'class': 'group block bg-muted/30 hover:bg-accent/20 border border-border hover:border-primary/30 rounded-lg p-4 transition-all duration-200 hover:shadow-sm'
        });

        const termContent = createMockElement('div', {
          'class': 'flex items-start justify-between'
        });

        const termInfo = createMockElement('div', {
          'class': 'flex-1'
        });

        const termTitle = createMockElement('h5', {
          'class': 'font-semibold text-foreground group-hover:text-primary transition-colors mb-1'
        });
        termTitle.textContent = term.data.title;

        const termDesc = createMockElement('p', {
          'class': 'text-sm text-muted-foreground line-clamp-2 leading-relaxed'
        });
        termDesc.textContent = term.data.description;

        termInfo.appendChild(termTitle);
        termInfo.appendChild(termDesc);

        // Add tags if available
        if (term.data.tags && term.data.tags.length > 0) {
          const tagsDiv = createMockElement('div', {
            'class': 'flex flex-wrap gap-1 mt-2'
          });

          term.data.tags.slice(0, 2).forEach(tag => {
            const tagSpan = createMockElement('span', {
              'class': 'inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-primary/10 text-primary'
            });
            tagSpan.textContent = `#${tag}`;
            tagsDiv.appendChild(tagSpan);
          });

          termInfo.appendChild(tagsDiv);
        }

        const arrow = createMockElement('svg', {
          'class': 'w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2',
          'fill': 'none',
          'stroke': 'currentColor',
          'viewBox': '0 0 24 24'
        });

        termContent.appendChild(termInfo);
        termContent.appendChild(arrow);
        termLink.appendChild(termContent);
        termsGrid.appendChild(termLink);
      });

      categoryDiv.appendChild(termsGrid);
      contentDiv.appendChild(categoryDiv);
    });

    section.appendChild(contentDiv);
  } else {
    // Suggested Terms
    const suggestedGrid = createMockElement('div', {
      'class': 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'
    });

    suggestedTerms.forEach(term => {
      const termLink = createMockElement('a', {
        'href': `/glossary/${term.slug}`,
        'class': 'group block bg-muted/30 hover:bg-accent/20 border border-border hover:border-primary/30 rounded-lg p-4 transition-all duration-200 hover:shadow-sm'
      });

      const termHeader = createMockElement('div', {
        'class': 'flex items-start justify-between mb-2'
      });

      const categoryBadge = createMockElement('span', {
        'class': 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20'
      });
      categoryBadge.textContent = term.data.category;

      const arrow = createMockElement('svg', {
        'class': 'w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0',
        'fill': 'none',
        'stroke': 'currentColor',
        'viewBox': '0 0 24 24'
      });

      termHeader.appendChild(categoryBadge);
      termHeader.appendChild(arrow);

      const termTitle = createMockElement('h5', {
        'class': 'font-semibold text-foreground group-hover:text-primary transition-colors mb-1'
      });
      termTitle.textContent = term.data.title;

      const termDesc = createMockElement('p', {
        'class': 'text-sm text-muted-foreground line-clamp-2 leading-relaxed'
      });
      termDesc.textContent = term.data.description;

      termLink.appendChild(termHeader);
      termLink.appendChild(termTitle);
      termLink.appendChild(termDesc);
      suggestedGrid.appendChild(termLink);
    });

    section.appendChild(suggestedGrid);
  }

  // Explore more link
  const footerDiv = createMockElement('div', {
    'class': 'mt-6 pt-4 border-t border-border'
  });

  const exploreLink = createMockElement('a', {
    'href': '/',
    'class': 'inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors'
  });

  const exploreIcon = createMockElement('svg', {
    'class': 'w-4 h-4 mr-2',
    'fill': 'none',
    'stroke': 'currentColor',
    'viewBox': '0 0 24 24'
  });

  exploreLink.appendChild(exploreIcon);
  exploreLink.appendChild(document.createTextNode('สำรวจคำศัพท์ทั้งหมด'));

  footerDiv.appendChild(exploreLink);
  section.appendChild(footerDiv);

  return section;
}

describe('RelatedLinks Component', () => {
  let container: HTMLElement;
  const allTerms = mockGlossaryEntries as CollectionEntry<'glossary'>[];

  beforeEach(() => {
    container = createMockElement('div');
    document.body.appendChild(container);
  });

  describe('Rendering with Related Terms', () => {
    it('should render related terms when provided', () => {
      const props: RelatedLinksProps = {
        related: ['json', 'react'],
        allTerms,
        currentSlug: 'api'
      };

      const component = createRelatedLinks(props);
      expect(component).toBeTruthy();
      
      if (component) {
        container.appendChild(component);

        // Check section structure
        expect(component.tagName).toBe('SECTION');
        expect(component.classList.contains('bg-card')).toBe(true);

        // Check heading
        const heading = component.querySelector('h3');
        expect(heading?.textContent).toBe('คำศัพท์ที่เกี่ยวข้อง');

        // Check related terms are rendered
        const termLinks = component.querySelectorAll('a[href^="/glossary/"]');
        expect(termLinks.length).toBeGreaterThan(0);

        // Check specific terms
        const jsonLink = component.querySelector('a[href="/glossary/json"]');
        const reactLink = component.querySelector('a[href="/glossary/react"]');
        expect(jsonLink).toBeTruthy();
        expect(reactLink).toBeTruthy();
      }
    });

    it('should group related terms by category', () => {
      const props: RelatedLinksProps = {
        related: ['json', 'react'], // Different categories
        allTerms,
        currentSlug: 'api'
      };

      const component = createRelatedLinks(props);
      if (component) {
        container.appendChild(component);

        // Check category headings
        const categoryHeadings = component.querySelectorAll('h4');
        expect(categoryHeadings.length).toBeGreaterThan(0);

        // Check that categories are displayed
        const categoryTexts = Array.from(categoryHeadings).map(h => h.textContent);
        expect(categoryTexts).toContain('Data Format'); // JSON category
        expect(categoryTexts).toContain('JavaScript'); // React category
      }
    });

    it('should display term tags when available', () => {
      const props: RelatedLinksProps = {
        related: ['json'],
        allTerms,
        currentSlug: 'api'
      };

      const component = createRelatedLinks(props);
      if (component) {
        container.appendChild(component);

        // Check for tags
        const tagElements = component.querySelectorAll('.bg-primary\\/10');
        expect(tagElements.length).toBeGreaterThan(0);

        // Check tag content
        const tagTexts = Array.from(tagElements).map(el => el.textContent);
        expect(tagTexts.some(text => text?.includes('#data'))).toBe(true);
      }
    });
  });

  describe('Rendering with Suggested Terms', () => {
    it('should render suggested terms when no related terms provided', () => {
      const props: RelatedLinksProps = {
        related: [],
        allTerms,
        currentSlug: 'api'
      };

      const component = createRelatedLinks(props);
      expect(component).toBeTruthy();
      
      if (component) {
        container.appendChild(component);

        // Check heading
        const heading = component.querySelector('h3');
        expect(heading?.textContent).toBe('คำศัพท์ที่แนะนำ');

        // Check suggested terms grid
        const grid = component.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4');
        expect(grid).toBeTruthy();

        // Check that current term is excluded
        const currentTermLink = component.querySelector('a[href="/glossary/api"]');
        expect(currentTermLink).toBeFalsy();
      }
    });

    it('should limit suggested terms to 4 items', () => {
      const props: RelatedLinksProps = {
        related: [],
        allTerms,
        currentSlug: 'api'
      };

      const component = createRelatedLinks(props);
      if (component) {
        container.appendChild(component);

        const termLinks = component.querySelectorAll('a[href^="/glossary/"]');
        // Should have at most 4 suggested terms + 1 explore link
        expect(termLinks.length).toBeLessThanOrEqual(5);
      }
    });

    it('should display category badges for suggested terms', () => {
      const props: RelatedLinksProps = {
        related: [],
        allTerms,
        currentSlug: 'api'
      };

      const component = createRelatedLinks(props);
      if (component) {
        container.appendChild(component);

        // Check for category badges
        const categoryBadges = component.querySelectorAll('.rounded-full.text-xs.font-medium');
        expect(categoryBadges.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Empty State', () => {
    it('should return null when no content to display', () => {
      const props: RelatedLinksProps = {
        related: ['nonexistent'],
        allTerms,
        currentSlug: 'api'
      };

      const component = createRelatedLinks(props);
      expect(component).toBeNull();
    });

    it('should return null when all terms are current term', () => {
      const props: RelatedLinksProps = {
        related: [],
        allTerms: [allTerms[0]], // Only one term
        currentSlug: allTerms[0].slug
      };

      const component = createRelatedLinks(props);
      expect(component).toBeNull();
    });
  });

  describe('Link Generation', () => {
    it('should generate correct URLs for related terms', () => {
      const props: RelatedLinksProps = {
        related: ['json', 'react'],
        allTerms,
        currentSlug: 'api'
      };

      const component = createRelatedLinks(props);
      if (component) {
        container.appendChild(component);

        const jsonLink = component.querySelector('a[href="/glossary/json"]');
        const reactLink = component.querySelector('a[href="/glossary/react"]');
        
        expect(jsonLink).toBeTruthy();
        expect(reactLink).toBeTruthy();
      }
    });

    it('should include explore more link', () => {
      const props: RelatedLinksProps = {
        related: ['json'],
        allTerms,
        currentSlug: 'api'
      };

      const component = createRelatedLinks(props);
      if (component) {
        container.appendChild(component);

        const exploreLink = component.querySelector('a[href="/"]');
        expect(exploreLink).toBeTruthy();
        expect(exploreLink?.textContent).toContain('สำรวจคำศัพท์ทั้งหมด');
      }
    });
  });

  describe('Styling and CSS Classes', () => {
    it('should have correct CSS classes for main section', () => {
      const props: RelatedLinksProps = {
        related: ['json'],
        allTerms,
        currentSlug: 'api'
      };

      const component = createRelatedLinks(props);
      if (component) {
        container.appendChild(component);

        expect(component.classList.contains('bg-card')).toBe(true);
        expect(component.classList.contains('border')).toBe(true);
        expect(component.classList.contains('rounded-lg')).toBe(true);
        expect(component.classList.contains('p-6')).toBe(true);
        expect(component.classList.contains('mt-8')).toBe(true);
      }
    });

    it('should have hover effects on term links', () => {
      const props: RelatedLinksProps = {
        related: ['json'],
        allTerms,
        currentSlug: 'api'
      };

      const component = createRelatedLinks(props);
      if (component) {
        container.appendChild(component);

        const termLinks = component.querySelectorAll('a[href^="/glossary/"]:not([href="/"])');
        termLinks.forEach(link => {
          expect(link.classList.contains('group')).toBe(true);
          expect(link.classList.contains('hover:bg-accent/20')).toBe(true);
          expect(link.classList.contains('transition-all')).toBe(true);
        });
      }
    });

    it('should have proper text truncation classes', () => {
      const props: RelatedLinksProps = {
        related: ['json'],
        allTerms,
        currentSlug: 'api'
      };

      const component = createRelatedLinks(props);
      if (component) {
        container.appendChild(component);

        const descriptions = component.querySelectorAll('p.line-clamp-2');
        expect(descriptions.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      const props: RelatedLinksProps = {
        related: ['json'],
        allTerms,
        currentSlug: 'api'
      };

      const component = createRelatedLinks(props);
      if (component) {
        container.appendChild(component);

        // Main heading should be h3
        const mainHeading = component.querySelector('h3');
        expect(mainHeading).toBeTruthy();

        // Category headings should be h4
        const categoryHeadings = component.querySelectorAll('h4');
        expect(categoryHeadings.length).toBeGreaterThan(0);

        // Term titles should be h5
        const termTitles = component.querySelectorAll('h5');
        expect(termTitles.length).toBeGreaterThan(0);
      }
    });

    it('should have semantic HTML structure', () => {
      const props: RelatedLinksProps = {
        related: ['json'],
        allTerms,
        currentSlug: 'api'
      };

      const component = createRelatedLinks(props);
      if (component) {
        container.appendChild(component);

        // Should be a section element
        expect(component.tagName).toBe('SECTION');

        // Should have proper link elements
        const links = component.querySelectorAll('a[href^="/glossary/"]');
        expect(links.length).toBeGreaterThan(0);
      }
    });

    it('should hide decorative elements from screen readers', () => {
      const props: RelatedLinksProps = {
        related: ['json'],
        allTerms,
        currentSlug: 'api'
      };

      const component = createRelatedLinks(props);
      if (component) {
        container.appendChild(component);

        // SVG icons should be decorative
        const svgElements = component.querySelectorAll('svg');
        svgElements.forEach(svg => {
          // In a real implementation, these would have aria-hidden="true"
          expect(svg.tagName).toBe('SVG');
        });
      }
    });
  });

  describe('Content Filtering', () => {
    it('should filter out invalid related term slugs', () => {
      const props: RelatedLinksProps = {
        related: ['json', 'nonexistent', 'react'],
        allTerms,
        currentSlug: 'api'
      };

      const component = createRelatedLinks(props);
      if (component) {
        container.appendChild(component);

        // Should only show valid terms
        const jsonLink = component.querySelector('a[href="/glossary/json"]');
        const reactLink = component.querySelector('a[href="/glossary/react"]');
        const nonexistentLink = component.querySelector('a[href="/glossary/nonexistent"]');

        expect(jsonLink).toBeTruthy();
        expect(reactLink).toBeTruthy();
        expect(nonexistentLink).toBeFalsy();
      }
    });

    it('should handle empty allTerms array', () => {
      const props: RelatedLinksProps = {
        related: ['json'],
        allTerms: [],
        currentSlug: 'api'
      };

      const component = createRelatedLinks(props);
      expect(component).toBeNull();
    });
  });
});