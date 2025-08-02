// Optimized API endpoint to generate search index with compression and caching
// Make this endpoint server-rendered to access request headers
export const prerender = false;

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { generateSearchIndex } from '../../utils/search';

// Cache the search index in memory for better performance
let cachedIndex: any = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

export const GET: APIRoute = async ({ request }) => {
  try {
    const now = Date.now();
    
    // Check if we have a valid cached index
    if (cachedIndex && (now - cacheTimestamp) < CACHE_DURATION) {
      return createResponse(cachedIndex, request);
    }
    
    // Get all glossary entries
    const glossaryEntries = await getCollection('glossary');
    
    // Generate optimized search index
    const searchIndex = generateSearchIndex(glossaryEntries);
    
    // Cache the index
    cachedIndex = searchIndex;
    cacheTimestamp = now;
    
    return createResponse(searchIndex, request);
  } catch (error) {
    console.error('Error generating search index:', error);
    
    return new Response(JSON.stringify({ error: 'Failed to generate search index' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

function createResponse(data: any, request: Request) {
  const jsonString = JSON.stringify(data);
  
  // Check if client accepts gzip compression
  const acceptEncoding = request.headers.get('accept-encoding') || '';
  const supportsGzip = acceptEncoding.includes('gzip');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    'ETag': `"${generateETag(jsonString)}"`,
    'Vary': 'Accept-Encoding',
  };
  
  // Add performance hints
  headers['X-Content-Type-Options'] = 'nosniff';
  headers['X-Frame-Options'] = 'DENY';
  
  // Check if client has cached version
  const ifNoneMatch = request.headers.get('if-none-match');
  if (ifNoneMatch === headers['ETag']) {
    return new Response(null, {
      status: 304,
      headers: {
        'Cache-Control': headers['Cache-Control'],
        'ETag': headers['ETag'],
      },
    });
  }
  
  return new Response(jsonString, {
    status: 200,
    headers,
  });
}

function generateETag(content: string): string {
  // Simple hash function for ETag generation
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}