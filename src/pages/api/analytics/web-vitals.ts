import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    
    // Log web vitals data (in production, you might want to send this to a real analytics service)
    console.log('Web Vitals Data:', {
      name: data.name,
      value: data.value,
      rating: data.rating,
      delta: data.delta,
      id: data.id,
      navigationType: data.navigationType,
      timestamp: new Date().toISOString()
    });
    
    // In a real application, you would send this data to your analytics service
    // For example: Google Analytics, Mixpanel, or your own analytics backend
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error processing web vitals data:', error);
    
    return new Response(JSON.stringify({ error: 'Failed to process web vitals data' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};