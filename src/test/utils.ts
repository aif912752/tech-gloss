// Test utilities
import { vi } from 'vitest';

/**
 * Create a mock DOM element with specified attributes
 */
export function createMockElement(tagName: string, attributes: Record<string, string> = {}): HTMLElement {
  const element = document.createElement(tagName);
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  return element;
}

/**
 * Create a mock event
 */
export function createMockEvent(type: string, properties: Record<string, any> = {}): Event {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.assign(event, properties);
  return event;
}

/**
 * Create a mock keyboard event
 */
export function createMockKeyboardEvent(type: string, key: string, properties: Record<string, any> = {}): KeyboardEvent {
  const event = new KeyboardEvent(type, { 
    key, 
    bubbles: true, 
    cancelable: true,
    ...properties 
  });
  return event;
}

/**
 * Create a mock mouse event
 */
export function createMockMouseEvent(type: string, properties: Record<string, any> = {}): MouseEvent {
  const event = new MouseEvent(type, { 
    bubbles: true, 
    cancelable: true,
    ...properties 
  });
  return event;
}

/**
 * Wait for next tick
 */
export function nextTick(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}

/**
 * Wait for specified time
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Mock fetch response
 */
export function mockFetchResponse(data: any, status: number = 200): void {
  (global.fetch as any).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  });
}

/**
 * Mock fetch error
 */
export function mockFetchError(error: Error): void {
  (global.fetch as any).mockRejectedValueOnce(error);
}

/**
 * Create a mock Fuse.js instance
 */
export function createMockFuse(searchResults: any[] = []) {
  return {
    search: vi.fn().mockReturnValue(searchResults.map(item => ({ item }))),
  };
}

/**
 * Mock localStorage
 */
export function mockLocalStorage() {
  const store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    get store() {
      return { ...store };
    },
  };
}

/**
 * Mock IntersectionObserver
 */
export function mockIntersectionObserver() {
  const mockObserver = {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  };
  
  global.IntersectionObserver = vi.fn().mockImplementation(() => mockObserver);
  
  return mockObserver;
}

/**
 * Simulate user typing
 */
export async function simulateTyping(element: HTMLInputElement, text: string, delay: number = 50): Promise<void> {
  element.focus();
  
  for (const char of text) {
    element.value += char;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    await wait(delay);
  }
}

/**
 * Simulate user clicking
 */
export function simulateClick(element: HTMLElement): void {
  element.dispatchEvent(createMockMouseEvent('click'));
}

/**
 * Simulate keyboard navigation
 */
export function simulateKeyPress(element: HTMLElement, key: string, properties: Record<string, any> = {}): void {
  element.dispatchEvent(createMockKeyboardEvent('keydown', key, properties));
  element.dispatchEvent(createMockKeyboardEvent('keyup', key, properties));
}

/**
 * Get all text content from element (including hidden elements)
 */
export function getAllTextContent(element: HTMLElement): string {
  return element.textContent || '';
}

/**
 * Check if element is visible
 */
export function isElementVisible(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  return style.display !== 'none' && 
         style.visibility !== 'hidden' && 
         style.opacity !== '0' &&
         !element.hidden;
}

/**
 * Find element by text content
 */
export function findByText(container: HTMLElement, text: string): HTMLElement | null {
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    null
  );
  
  let node;
  while (node = walker.nextNode()) {
    if (node.textContent?.includes(text)) {
      return node.parentElement;
    }
  }
  
  return null;
}

/**
 * Wait for element to appear
 */
export async function waitForElement(
  selector: string, 
  container: HTMLElement = document.body,
  timeout: number = 1000
): Promise<HTMLElement> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const element = container.querySelector(selector) as HTMLElement;
    if (element) {
      return element;
    }
    await wait(10);
  }
  
  throw new Error(`Element with selector "${selector}" not found within ${timeout}ms`);
}