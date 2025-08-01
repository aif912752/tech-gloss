// Tests for accessibility utilities
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  announceToScreenReader,
  manageFocus,
  isFocusable,
  getAccessibleText,
  addKeyboardSupport
} from './accessibility';
import { createMockElement, createMockKeyboardEvent, nextTick } from '../test/utils';

describe('Accessibility Utils', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('announceToScreenReader', () => {
    it('should create and remove announcement element', async () => {
      announceToScreenReader('Test announcement');

      // Check that announcement element was created
      const announcement = document.querySelector('[aria-live="polite"]');
      expect(announcement).toBeTruthy();
      expect(announcement?.textContent).toBe('Test announcement');
      expect(announcement?.classList.contains('sr-only')).toBe(true);

      // Wait for cleanup
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      // Check that element was removed
      const removedAnnouncement = document.querySelector('[aria-live="polite"]');
      expect(removedAnnouncement).toBeFalsy();
    });

    it('should support assertive priority', () => {
      announceToScreenReader('Urgent message', 'assertive');

      const announcement = document.querySelector('[aria-live="assertive"]');
      expect(announcement).toBeTruthy();
      expect(announcement?.textContent).toBe('Urgent message');
    });
  });

  describe('manageFocus', () => {
    it('should focus element and scroll to it', () => {
      const element = createMockElement('div');
      document.body.appendChild(element);

      manageFocus(element);

      expect(element.focus).toHaveBeenCalled();
      expect(element.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start'
      });
    });

    it('should make non-focusable elements focusable temporarily', async () => {
      const element = createMockElement('div');
      document.body.appendChild(element);

      manageFocus(element);

      expect(element.getAttribute('tabindex')).toBe('-1');
      expect(element.focus).toHaveBeenCalled();

      // Wait for cleanup
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(element.hasAttribute('tabindex')).toBe(false);
    });

    it('should not modify tabindex of naturally focusable elements', () => {
      const element = createMockElement('button');
      document.body.appendChild(element);

      manageFocus(element);

      expect(element.hasAttribute('tabindex')).toBe(false);
      expect(element.focus).toHaveBeenCalled();
    });

    it('should announce to screen reader when requested', () => {
      const element = createMockElement('div');
      element.textContent = 'Test content';
      document.body.appendChild(element);

      manageFocus(element, { announceToScreenReader: true });

      const announcement = document.querySelector('[aria-live="polite"]');
      expect(announcement?.textContent).toBe('โฟกัสไปที่ Test content');
    });
  });

  describe('isFocusable', () => {
    it('should identify focusable elements', () => {
      const button = createMockElement('button');
      const input = createMockElement('input');
      const link = createMockElement('a', { href: '#' });
      const div = createMockElement('div');
      const tabindexDiv = createMockElement('div', { tabindex: '0' });

      expect(isFocusable(button)).toBe(true);
      expect(isFocusable(input)).toBe(true);
      expect(isFocusable(link)).toBe(true);
      expect(isFocusable(div)).toBe(false);
      expect(isFocusable(tabindexDiv)).toBe(true);
    });
  });

  describe('getAccessibleText', () => {
    it('should get aria-label first', () => {
      const element = createMockElement('div', { 
        'aria-label': 'Aria label',
        'title': 'Title text'
      });
      element.textContent = 'Text content';

      expect(getAccessibleText(element)).toBe('Aria label');
    });

    it('should fall back to aria-labelledby', () => {
      const labelElement = createMockElement('div', { id: 'label' });
      labelElement.textContent = 'Label text';
      document.body.appendChild(labelElement);

      const element = createMockElement('div', { 
        'aria-labelledby': 'label',
        'title': 'Title text'
      });
      element.textContent = 'Text content';

      expect(getAccessibleText(element)).toBe('Label text');
    });

    it('should fall back to title attribute', () => {
      const element = createMockElement('div', { 
        'title': 'Title text'
      });
      element.textContent = 'Text content';

      expect(getAccessibleText(element)).toBe('Title text');
    });

    it('should fall back to text content', () => {
      const element = createMockElement('div');
      element.textContent = 'Text content';

      expect(getAccessibleText(element)).toBe('Text content');
    });
  });

  describe('addKeyboardSupport', () => {
    it('should handle Enter key', () => {
      const element = createMockElement('div');
      const onEnter = vi.fn();
      
      addKeyboardSupport(element, { onEnter });

      const enterEvent = createMockKeyboardEvent('keydown', 'Enter');
      element.dispatchEvent(enterEvent);

      expect(onEnter).toHaveBeenCalled();
      expect(enterEvent.defaultPrevented).toBe(true);
    });

    it('should handle Space key', () => {
      const element = createMockElement('div');
      const onSpace = vi.fn();
      
      addKeyboardSupport(element, { onSpace });

      const spaceEvent = createMockKeyboardEvent('keydown', ' ');
      element.dispatchEvent(spaceEvent);

      expect(onSpace).toHaveBeenCalled();
      expect(spaceEvent.defaultPrevented).toBe(true);
    });

    it('should handle Escape key', () => {
      const element = createMockElement('div');
      const onEscape = vi.fn();
      
      addKeyboardSupport(element, { onEscape });

      const escapeEvent = createMockKeyboardEvent('keydown', 'Escape');
      element.dispatchEvent(escapeEvent);

      expect(onEscape).toHaveBeenCalled();
      expect(escapeEvent.defaultPrevented).toBe(true);
    });

    it('should handle arrow keys', () => {
      const element = createMockElement('div');
      const onArrowUp = vi.fn();
      const onArrowDown = vi.fn();
      const onArrowLeft = vi.fn();
      const onArrowRight = vi.fn();
      
      addKeyboardSupport(element, { 
        onArrowUp, 
        onArrowDown, 
        onArrowLeft, 
        onArrowRight 
      });

      element.dispatchEvent(createMockKeyboardEvent('keydown', 'ArrowUp'));
      element.dispatchEvent(createMockKeyboardEvent('keydown', 'ArrowDown'));
      element.dispatchEvent(createMockKeyboardEvent('keydown', 'ArrowLeft'));
      element.dispatchEvent(createMockKeyboardEvent('keydown', 'ArrowRight'));

      expect(onArrowUp).toHaveBeenCalled();
      expect(onArrowDown).toHaveBeenCalled();
      expect(onArrowLeft).toHaveBeenCalled();
      expect(onArrowRight).toHaveBeenCalled();
    });

    it('should not handle keys without handlers', () => {
      const element = createMockElement('div');
      const onEnter = vi.fn();
      
      addKeyboardSupport(element, { onEnter });

      const tabEvent = createMockKeyboardEvent('keydown', 'Tab');
      element.dispatchEvent(tabEvent);

      expect(onEnter).not.toHaveBeenCalled();
      expect(tabEvent.defaultPrevented).toBe(false);
    });
  });
});