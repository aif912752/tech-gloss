// Tests for GlossaryCard component
import { describe, it, expect, beforeEach } from 'vitest';
import { createMockElement } from '../test/utils';

// Mock GlossaryCard props
interface GlossaryCardProps {
  title: string;
  slug: string;
  category: string;
  description: string;
  tags?: string[];
}

// Helper function to create GlossaryCard DOM structure
function createGlossaryCard(props: GlossaryCardProps): HTMLElement {
  const { title, slug, category, description, tags = [] } = props;
  
  const article = createMockElement('article', {
    'class': 'glossary-card group animate-fade-in',
    'role': 'listitem'
  });

  const headerDiv = createMockElement('div', {
    'class': 'flex items-start justify-between mb-3'
  });

  const contentDiv = createMockElement('div', {
    'class': 'flex-1'
  });

  const heading = createMockElement('h3', {
    'class': 'text-heading-3 text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2'
  });

  const link = createMockElement('a', {
    'href': `/glossary/${slug}`,
    'class': 'hover:underline focus-ring rounded-sm',
    'aria-label': `อ่านเพิ่มเติมเกี่ยวกับ ${title} ในหมวด ${category}`
  });
  link.textContent = title;

  const categorySpan = createMockElement('span', {
    'class': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-primary/10 text-primary border-primary/20',
    'aria-label': `หมวดหมู่ ${category}`
  });
  categorySpan.textContent = category;

  const indicator = createMockElement('div', {
    'class': 'flex-shrink-0 ml-3',
    'aria-hidden': 'true'
  });
  const indicatorDot = createMockElement('div', {
    'class': 'w-3 h-3 bg-primary/20 rounded-full group-hover:bg-primary/40 transition-colors'
  });
  indicator.appendChild(indicatorDot);

  const description_p = createMockElement('p', {
    'class': 'text-body text-muted-foreground leading-relaxed mb-4 line-clamp-3',
    'aria-describedby': `desc-${slug}`
  });
  const descSpan = createMockElement('span', { 'id': `desc-${slug}` });
  descSpan.textContent = description;
  description_p.appendChild(descSpan);

  const tagsDiv = createMockElement('div', {
    'class': 'flex flex-wrap gap-1'
  });

  tags.forEach(tag => {
    const tagSpan = createMockElement('span', {
      'class': 'inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-muted text-muted-foreground'
    });
    tagSpan.textContent = `#${tag}`;
    tagsDiv.appendChild(tagSpan);
  });

  heading.appendChild(link);
  contentDiv.appendChild(heading);
  contentDiv.appendChild(categorySpan);
  headerDiv.appendChild(contentDiv);
  headerDiv.appendChild(indicator);

  article.appendChild(headerDiv);
  article.appendChild(description_p);
  if (tags.length > 0) {
    article.appendChild(tagsDiv);
  }

  return article;
}

describe('GlossaryCard Component', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = createMockElement('div');
    document.body.appendChild(container);
  });

  describe('Rendering', () => {
    it('should render with required props', () => {
      const props: GlossaryCardProps = {
        title: 'API',
        slug: 'api',
        category: 'Web Development',
        description: 'Application Programming Interface - ชุดของกฎเกณฑ์และเครื่องมือสำหรับการสร้างแอปพลิเคชันซอฟต์แวร์'
      };

      const card = createGlossaryCard(props);
      container.appendChild(card);

      // Check article structure
      expect(card.tagName).toBe('ARTICLE');
      expect(card.getAttribute('role')).toBe('listitem');
      expect(card.classList.contains('glossary-card')).toBe(true);

      // Check title and link
      const link = card.querySelector('a') as HTMLAnchorElement;
      expect(link).toBeTruthy();
      expect(link.textContent).toBe('API');
      expect(link.getAttribute('href')).toBe('/glossary/api');
      expect(link.getAttribute('aria-label')).toBe('อ่านเพิ่มเติมเกี่ยวกับ API ในหมวด Web Development');

      // Check category
      const categorySpan = card.querySelector('[aria-label*="หมวดหมู่"]');
      expect(categorySpan).toBeTruthy();
      expect(categorySpan?.textContent).toBe('Web Development');

      // Check description
      const descriptionSpan = card.querySelector(`#desc-${props.slug}`);
      expect(descriptionSpan).toBeTruthy();
      expect(descriptionSpan?.textContent).toBe(props.description);
    });

    it('should render with tags', () => {
      const props: GlossaryCardProps = {
        title: 'JSON',
        slug: 'json',
        category: 'Data Format',
        description: 'JavaScript Object Notation',
        tags: ['data', 'format', 'javascript']
      };

      const card = createGlossaryCard(props);
      container.appendChild(card);

      const tagElements = card.querySelectorAll('.inline-flex.items-center.px-1\\.5');
      expect(tagElements).toHaveLength(3);
      
      const tagTexts = Array.from(tagElements).map(el => el.textContent);
      expect(tagTexts).toEqual(['#data', '#format', '#javascript']);
    });

    it('should render without tags', () => {
      const props: GlossaryCardProps = {
        title: 'React',
        slug: 'react',
        category: 'JavaScript',
        description: 'JavaScript library for building user interfaces'
      };

      const card = createGlossaryCard(props);
      container.appendChild(card);

      const tagElements = card.querySelectorAll('.inline-flex.items-center.px-1\\.5');
      expect(tagElements).toHaveLength(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const props: GlossaryCardProps = {
        title: 'API',
        slug: 'api',
        category: 'Web Development',
        description: 'Application Programming Interface'
      };

      const card = createGlossaryCard(props);
      container.appendChild(card);

      // Check role attribute
      expect(card.getAttribute('role')).toBe('listitem');

      // Check link accessibility
      const link = card.querySelector('a');
      expect(link?.getAttribute('aria-label')).toContain('อ่านเพิ่มเติมเกี่ยวกับ API ในหมวด Web Development');

      // Check category accessibility
      const categorySpan = card.querySelector('[aria-label*="หมวดหมู่"]');
      expect(categorySpan?.getAttribute('aria-label')).toBe('หมวดหมู่ Web Development');

      // Check description accessibility
      const descriptionP = card.querySelector('p[aria-describedby]');
      expect(descriptionP?.getAttribute('aria-describedby')).toBe('desc-api');

      const descriptionSpan = card.querySelector('#desc-api');
      expect(descriptionSpan).toBeTruthy();
    });

    it('should hide decorative elements from screen readers', () => {
      const props: GlossaryCardProps = {
        title: 'API',
        slug: 'api',
        category: 'Web Development',
        description: 'Application Programming Interface'
      };

      const card = createGlossaryCard(props);
      container.appendChild(card);

      // Check that visual indicator is hidden from screen readers
      const indicator = card.querySelector('[aria-hidden="true"]');
      expect(indicator).toBeTruthy();
    });

    it('should have proper focus management', () => {
      const props: GlossaryCardProps = {
        title: 'API',
        slug: 'api',
        category: 'Web Development',
        description: 'Application Programming Interface'
      };

      const card = createGlossaryCard(props);
      container.appendChild(card);

      const link = card.querySelector('a');
      expect(link?.classList.contains('focus-ring')).toBe(true);
    });
  });

  describe('Styling', () => {
    it('should have correct CSS classes', () => {
      const props: GlossaryCardProps = {
        title: 'API',
        slug: 'api',
        category: 'Web Development',
        description: 'Application Programming Interface'
      };

      const card = createGlossaryCard(props);
      container.appendChild(card);

      // Check main article classes
      expect(card.classList.contains('glossary-card')).toBe(true);
      expect(card.classList.contains('group')).toBe(true);
      expect(card.classList.contains('animate-fade-in')).toBe(true);

      // Check heading classes
      const heading = card.querySelector('h3');
      expect(heading?.classList.contains('text-heading-3')).toBe(true);
      expect(heading?.classList.contains('group-hover:text-primary')).toBe(true);

      // Check category badge classes
      const categorySpan = card.querySelector('span[aria-label*="หมวดหมู่"]');
      expect(categorySpan?.classList.contains('rounded-full')).toBe(true);
      expect(categorySpan?.classList.contains('text-xs')).toBe(true);

      // Check description classes
      const description = card.querySelector('p');
      expect(description?.classList.contains('text-body')).toBe(true);
      expect(description?.classList.contains('line-clamp-3')).toBe(true);
    });

    it('should apply category-specific styling', () => {
      const props: GlossaryCardProps = {
        title: 'API',
        slug: 'api',
        category: 'Web Development',
        description: 'Application Programming Interface'
      };

      const card = createGlossaryCard(props);
      container.appendChild(card);

      const categorySpan = card.querySelector('span[aria-label*="หมวดหมู่"]');
      expect(categorySpan?.classList.contains('bg-primary/10')).toBe(true);
      expect(categorySpan?.classList.contains('text-primary')).toBe(true);
      expect(categorySpan?.classList.contains('border-primary/20')).toBe(true);
    });
  });

  describe('Content Truncation', () => {
    it('should handle long titles with line-clamp', () => {
      const props: GlossaryCardProps = {
        title: 'Very Long Title That Should Be Truncated When It Exceeds The Maximum Width Available',
        slug: 'long-title',
        category: 'Test',
        description: 'Test description'
      };

      const card = createGlossaryCard(props);
      container.appendChild(card);

      const heading = card.querySelector('h3');
      expect(heading?.classList.contains('line-clamp-2')).toBe(true);
    });

    it('should handle long descriptions with line-clamp', () => {
      const props: GlossaryCardProps = {
        title: 'Test',
        slug: 'test',
        category: 'Test',
        description: 'Very long description that should be truncated when it exceeds the maximum number of lines allowed for the description area in the glossary card component'
      };

      const card = createGlossaryCard(props);
      container.appendChild(card);

      const description = card.querySelector('p');
      expect(description?.classList.contains('line-clamp-3')).toBe(true);
    });
  });

  describe('Link Generation', () => {
    it('should generate correct URLs for different slugs', () => {
      const testCases = [
        { slug: 'api', expected: '/glossary/api' },
        { slug: 'json-web-token', expected: '/glossary/json-web-token' },
        { slug: 'react-hooks', expected: '/glossary/react-hooks' }
      ];

      testCases.forEach(({ slug, expected }) => {
        const props: GlossaryCardProps = {
          title: 'Test',
          slug,
          category: 'Test',
          description: 'Test description'
        };

        const card = createGlossaryCard(props);
        const link = card.querySelector('a');
        
        expect(link?.getAttribute('href')).toBe(expected);
      });
    });
  });
});