import { createHighlighter, type Highlighter, type BundledLanguage, type BundledTheme } from 'shiki';

// This will hold our single highlighter instance.
let highlighter: Highlighter;

// Add any new themes or languages here
const themes: BundledTheme[] = ['github-light', 'night-owl'];
const langs: BundledLanguage[] = [
  'javascript', 'typescript', 'python', 'bash', 'json', 'yaml', 
  'html', 'css', 'markdown', 'sql', 'php', 'java', 'go', 'rust'
];

/**
 * Returns a singleton instance of the Shiki highlighter.
 * Creates the instance on the first call and returns it on subsequent calls.
 */
export async function getHighlighterInstance() {
  if (!highlighter) {
    highlighter = await createHighlighter({ themes, langs });
  }
  return highlighter;
}

