/**
 * Environment configuration for API endpoints
 */

/**
 * Get the Polar API base URL
 * In development: Uses Vite proxy (/api/polar)
 * In production: Uses environment variable or direct URL (requires CORS proxy)
 */
export function getPolarApiBaseUrl(): string {
  // Check if we're in development mode
  if (import.meta.env.DEV) {
    // Use Vite's proxy in development
    return '/api/polar';
  }
  
  // In production, check for proxy URL environment variable
  const proxyUrl = import.meta.env.VITE_POLAR_PROXY_URL;
  if (proxyUrl) {
    return proxyUrl + '/api';
  }
  
  // Fallback to direct URL (will cause CORS errors without a proxy)
  // This should not be used in production without a CORS proxy
  return 'https://www.polaraccesslink.com';
}

/**
 * Get the full Polar API endpoint URL
 */
export function getPolarApiUrl(path: string): string {
  const baseUrl = getPolarApiBaseUrl();
  // Remove leading slash from path if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}
