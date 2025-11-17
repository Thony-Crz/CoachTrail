/**
 * Cloudflare Worker to proxy Polar API requests and add CORS headers
 * 
 * Deployment instructions:
 * 1. Create a Cloudflare Workers account at https://workers.cloudflare.com/
 * 2. Create a new worker
 * 3. Copy this code into the worker script
 * 4. Deploy the worker
 * 5. Update the VITE_POLAR_PROXY_URL environment variable to point to your worker URL
 */

// Allowed origins - update this with your GitHub Pages URL
const ALLOWED_ORIGINS = [
  'https://thony-crz.github.io',
  'http://localhost:5173',
  'http://localhost:4173',
];

// Polar API base URL
const POLAR_API_BASE = 'https://www.polaraccesslink.com';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return handleCORS(request);
  }

  // Get the origin
  const origin = request.headers.get('Origin');
  
  // Check if origin is allowed
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
    return new Response('Forbidden', { status: 403 });
  }

  try {
    // Parse the request URL to get the path
    const url = new URL(request.url);
    const path = url.pathname.replace('/api', ''); // Remove /api prefix
    
    // Build the target URL
    const targetUrl = `${POLAR_API_BASE}${path}${url.search}`;
    
    // Copy headers from the original request, excluding host
    const headers = new Headers();
    for (const [key, value] of request.headers.entries()) {
      if (key.toLowerCase() !== 'host' && key.toLowerCase() !== 'origin') {
        headers.set(key, value);
      }
    }
    
    // Forward the request to Polar API
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.text() : undefined,
    });

    // Create a new response with CORS headers
    const newResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers(response.headers),
    });

    // Add CORS headers
    newResponse.headers.set('Access-Control-Allow-Origin', origin);
    newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    newResponse.headers.set('Access-Control-Max-Age', '86400');

    return newResponse;
  } catch (error) {
    return new Response(`Proxy error: ${error.message}`, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Content-Type': 'text/plain',
      }
    });
  }
}

function handleCORS(request) {
  const origin = request.headers.get('Origin');
  
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
    return new Response('Forbidden', { status: 403 });
  }

  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
