/**
 * Utility to process image URLs, proxying external images through the local 
 * server backend to ensure high cacheability and bypass CORS policies.
 */
export const getProxiedImageUrl = (url: string | undefined | null): string | undefined => {
  if (!url) return undefined;

  // Local uploads, SVG data, base64 datasets, and relative pointers can be loaded directly
  if (
    url.startsWith('/') || 
    url.startsWith('data:') || 
    url.startsWith('blob:') || 
    url.startsWith('http://localhost') || 
    url.startsWith('https://localhost')
  ) {
    return url;
  }

  // Any other external URLs are routed through our SQLite-friendly server proxy
  return `/api/local-image?url=${encodeURIComponent(url)}`;
};
