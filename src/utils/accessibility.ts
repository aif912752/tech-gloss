// Accessibility utility functions
export interface AccessibilityOptions {
  announceToScreenReader?: boolean;
  focusTarget?: boolean;
  scrollToTarget?: boolean;
}

/**
 * Announce text to screen readers
 */
export function announceToScreenReader(
  message: string, 
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    if (document.body.contains(announcement)) {
      document.body.removeChild(announcement);
    }
  }, 1000);
}

/**
 * Manage focus for better keyboard navigation
 */
export function manageFocus(element: HTMLElement, options: AccessibilityOptions = {}): void {
  const {
    announceToScreenReader: announce = false,
    focusTarget = true,
    scrollToTarget = true
  } = options;
  
  if (scrollToTarget) {
    element.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  }
  
  if (focusTarget) {
    // Make element focusable if it's not already
    const originalTabIndex = element.getAttribute('tabindex');
    if (!element.hasAttribute('tabindex') && !isFocusable(element)) {
      element.setAttribute('tabindex', '-1');
    }
    
    // Focus the element
    element.focus();
    
    // Restore original tabindex after focus
    setTimeout(() => {
      if (originalTabIndex === null && element.getAttribute('tabindex') === '-1') {
        element.removeAttribute('tabindex');
      } else if (originalTabIndex !== null) {
        element.setAttribute('tabindex', originalTabIndex);
      }
    }, 100);
  }
  
  if (announce) {
    const elementText = getAccessibleText(element);
    announceToScreenReader(`โฟกัสไปที่ ${elementText}`);
  }
}

/**
 * Check if element is naturally focusable
 */
export function isFocusable(element: HTMLElement): boolean {
  const focusableElements = [
    'a[href]',
    'button',
    'input',
    'textarea',
    'select',
    'details',
    '[tabindex]:not([tabindex="-1"])'
  ];
  
  return focusableElements.some(selector => element.matches(selector));
}

/**
 * Get accessible text from element
 */
export function getAccessibleText(element: HTMLElement): string {
  // Try aria-label first
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel;
  
  // Try aria-labelledby
  const ariaLabelledBy = element.getAttribute('aria-labelledby');
  if (ariaLabelledBy) {
    const labelElement = document.getElementById(ariaLabelledBy);
    if (labelElement) return labelElement.textContent || '';
  }
  
  // Try title attribute
  const title = element.getAttribute('title');
  if (title) return title;
  
  // Fall back to text content
  return element.textContent || '';
}

/**
 * Create accessible button with proper ARIA attributes
 */
export function createAccessibleButton(
  text: string,
  onClick: () => void,
  options: {
    ariaLabel?: string;
    ariaDescribedBy?: string;
    disabled?: boolean;
    className?: string;
  } = {}
): HTMLButtonElement {
  const button = document.createElement('button');
  button.textContent = text;
  button.addEventListener('click', onClick);
  
  if (options.ariaLabel) {
    button.setAttribute('aria-label', options.ariaLabel);
  }
  
  if (options.ariaDescribedBy) {
    button.setAttribute('aria-describedby', options.ariaDescribedBy);
  }
  
  if (options.disabled) {
    button.disabled = true;
    button.setAttribute('aria-disabled', 'true');
  }
  
  if (options.className) {
    button.className = options.className;
  }
  
  return button;
}

/**
 * Handle keyboard navigation for custom components
 */
export function handleKeyboardNavigation(
  container: HTMLElement,
  options: {
    focusableSelector?: string;
    wrapAround?: boolean;
    orientation?: 'horizontal' | 'vertical' | 'both';
  } = {}
): void {
  const {
    focusableSelector = 'button, [role="button"], a, input, select, textarea, [tabindex]:not([tabindex="-1"])',
    wrapAround = true,
    orientation = 'both'
  } = options;
  
  container.addEventListener('keydown', (e) => {
    const focusableElements = Array.from(
      container.querySelectorAll(focusableSelector)
    ) as HTMLElement[];
    
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
    
    if (currentIndex === -1) return;
    
    let nextIndex = currentIndex;
    
    switch (e.key) {
      case 'ArrowDown':
        if (orientation === 'vertical' || orientation === 'both') {
          e.preventDefault();
          nextIndex = currentIndex + 1;
        }
        break;
        
      case 'ArrowUp':
        if (orientation === 'vertical' || orientation === 'both') {
          e.preventDefault();
          nextIndex = currentIndex - 1;
        }
        break;
        
      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'both') {
          e.preventDefault();
          nextIndex = currentIndex + 1;
        }
        break;
        
      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'both') {
          e.preventDefault();
          nextIndex = currentIndex - 1;
        }
        break;
        
      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;
        
      case 'End':
        e.preventDefault();
        nextIndex = focusableElements.length - 1;
        break;
        
      default:
        return;
    }
    
    // Handle wrap around
    if (wrapAround) {
      if (nextIndex >= focusableElements.length) {
        nextIndex = 0;
      } else if (nextIndex < 0) {
        nextIndex = focusableElements.length - 1;
      }
    } else {
      nextIndex = Math.max(0, Math.min(nextIndex, focusableElements.length - 1));
    }
    
    focusableElements[nextIndex]?.focus();
  });
}

/**
 * Create accessible live region for dynamic content updates
 */
export function createLiveRegion(
  id: string,
  priority: 'polite' | 'assertive' = 'polite'
): HTMLElement {
  let liveRegion = document.getElementById(id);
  
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = id;
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);
  }
  
  return liveRegion;
}

/**
 * Update live region with new content
 */
export function updateLiveRegion(id: string, message: string): void {
  const liveRegion = document.getElementById(id);
  if (liveRegion) {
    liveRegion.textContent = message;
  }
}

/**
 * Validate heading hierarchy
 */
export function validateHeadingHierarchy(): void {
  const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  const issues: string[] = [];
  
  let previousLevel = 0;
  
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.charAt(1));
    
    if (index === 0 && level !== 1) {
      issues.push(`First heading should be h1, found ${heading.tagName.toLowerCase()}`);
    }
    
    if (level > previousLevel + 1) {
      issues.push(`Heading level jumps from h${previousLevel} to h${level} (${heading.textContent?.substring(0, 50)}...)`);
    }
    
    previousLevel = level;
  });
  
  if (issues.length > 0) {
    console.warn('Heading hierarchy issues found:', issues);
  }
}

/**
 * Check color contrast (basic implementation)
 */
export function checkColorContrast(
  foreground: string,
  background: string,
  fontSize: number = 16
): { ratio: number; passes: boolean; level: string } {
  // This is a simplified implementation
  // In a real app, you'd use a proper color contrast library
  
  const getLuminance = (color: string): number => {
    // Simplified luminance calculation
    // This would need proper color parsing in production
    return 0.5; // Placeholder
  };
  
  const fgLuminance = getLuminance(foreground);
  const bgLuminance = getLuminance(background);
  
  const ratio = (Math.max(fgLuminance, bgLuminance) + 0.05) / 
                (Math.min(fgLuminance, bgLuminance) + 0.05);
  
  const isLargeText = fontSize >= 18 || fontSize >= 14; // Bold text
  const aaThreshold = isLargeText ? 3 : 4.5;
  const aaaThreshold = isLargeText ? 4.5 : 7;
  
  let level = 'fail';
  if (ratio >= aaaThreshold) level = 'AAA';
  else if (ratio >= aaThreshold) level = 'AA';
  
  return {
    ratio,
    passes: ratio >= aaThreshold,
    level
  };
}

/**
 * Add keyboard event listeners for common patterns
 */
export function addKeyboardSupport(
  element: HTMLElement,
  handlers: {
    onEnter?: () => void;
    onSpace?: () => void;
    onEscape?: () => void;
    onArrowUp?: () => void;
    onArrowDown?: () => void;
    onArrowLeft?: () => void;
    onArrowRight?: () => void;
  }
): void {
  element.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'Enter':
        if (handlers.onEnter) {
          e.preventDefault();
          handlers.onEnter();
        }
        break;
        
      case ' ':
        if (handlers.onSpace) {
          e.preventDefault();
          handlers.onSpace();
        }
        break;
        
      case 'Escape':
        if (handlers.onEscape) {
          e.preventDefault();
          handlers.onEscape();
        }
        break;
        
      case 'ArrowUp':
        if (handlers.onArrowUp) {
          e.preventDefault();
          handlers.onArrowUp();
        }
        break;
        
      case 'ArrowDown':
        if (handlers.onArrowDown) {
          e.preventDefault();
          handlers.onArrowDown();
        }
        break;
        
      case 'ArrowLeft':
        if (handlers.onArrowLeft) {
          e.preventDefault();
          handlers.onArrowLeft();
        }
        break;
        
      case 'ArrowRight':
        if (handlers.onArrowRight) {
          e.preventDefault();
          handlers.onArrowRight();
        }
        break;
    }
  });
}