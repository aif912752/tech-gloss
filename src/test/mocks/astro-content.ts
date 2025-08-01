// Mock for astro:content
import { vi } from 'vitest';

// Mock glossary entries for testing
export const mockGlossaryEntries = [
  {
    slug: 'api',
    data: {
      title: 'API',
      description: 'Application Programming Interface - ชุดของกฎเกณฑ์และเครื่องมือสำหรับการสร้างแอปพลิเคชันซอฟต์แวร์',
      category: 'Web Development',
      tags: ['web', 'backend', 'integration', 'interface'],
      lastUpdated: new Date('2024-01-15'),
      related: ['json'],
    },
    body: '# API\n\nAPI คือ Application Programming Interface ซึ่งเป็นชุดของกฎเกณฑ์และเครื่องมือ\n\n## ตัวอย่างการใช้งาน\n\n```javascript\nfetch("/api/users")\n  .then(response => response.json())\n  .then(data => console.log(data));\n```',
    render: vi.fn().mockResolvedValue({
      Content: () => 'Mocked API content',
    }),
  },
  {
    slug: 'json',
    data: {
      title: 'JSON',
      description: 'JavaScript Object Notation - รูปแบบการแลกเปลี่ยนข้อมูลที่เบาและอ่านง่าย',
      category: 'Data Format',
      tags: ['data', 'format', 'javascript', 'web'],
      lastUpdated: new Date('2024-01-10'),
      related: ['api'],
    },
    body: '# JSON\n\nJSON ย่อมาจาก JavaScript Object Notation\n\n## ตัวอย่างการใช้งาน\n\n```javascript\nconst data = {\n  "name": "John",\n  "age": 30\n};\n```',
    render: vi.fn().mockResolvedValue({
      Content: () => 'Mocked JSON content',
    }),
  },
  {
    slug: 'react',
    data: {
      title: 'React',
      description: 'JavaScript library สำหรับสร้าง user interfaces',
      category: 'JavaScript',
      tags: ['javascript', 'frontend', 'library', 'ui'],
      lastUpdated: new Date('2024-01-20'),
      related: [],
    },
    body: '# React\n\nReact เป็น JavaScript library ที่พัฒนาโดย Facebook\n\n## ตัวอย่างการใช้งาน\n\n```jsx\nfunction App() {\n  return <h1>Hello World</h1>;\n}\n```',
    render: vi.fn().mockResolvedValue({
      Content: () => 'Mocked React content',
    }),
  },
];

export const getCollection = vi.fn().mockImplementation((collection: string) => {
  if (collection === 'glossary') {
    return Promise.resolve(mockGlossaryEntries);
  }
  return Promise.resolve([]);
});

export const getEntry = vi.fn().mockImplementation((collection: string, slug: string) => {
  if (collection === 'glossary') {
    const entry = mockGlossaryEntries.find(e => e.slug === slug);
    return Promise.resolve(entry || null);
  }
  return Promise.resolve(null);
});

export const getEntries = vi.fn().mockImplementation((collection: string, slugs: string[]) => {
  if (collection === 'glossary') {
    const entries = mockGlossaryEntries.filter(e => slugs.includes(e.slug));
    return Promise.resolve(entries);
  }
  return Promise.resolve([]);
});

// Mock CollectionEntry type
export type CollectionEntry<T> = {
  slug: string;
  data: any;
  body: string;
  render: () => Promise<{ Content: () => string }>;
};