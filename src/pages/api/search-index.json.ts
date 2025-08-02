// Optimized API endpoint to generate search index with compression and caching
// This endpoint will be pre-rendered at build time for better performance

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { generateSearchIndex } from '../../utils/search';



export const GET: APIRoute = async () => {
  try {
    // Get all glossary entries
    const glossaryEntries = await getCollection('glossary');
    
    // Generate optimized search index
    const searchIndex = generateSearchIndex(glossaryEntries);
    
    return new Response(JSON.stringify(searchIndex), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
    });
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

