/**
 * Utility to handle image URLs, specifically for Storj-hosted images
 * that might need to be proxied through the server to avoid CORS or 
 * private bucket access issues.
 */
export const getProxiedImageUrl = (url: string | undefined | null): string | undefined => {
  if (!url) return undefined;

  // Check if it's a Storj URL
  // Common Storj gateway domains
  const isStorj = url.includes('storjshare.io') || url.includes('storj.io');
  
  if (isStorj) {
    // Proxy through our server endpoint
    return `/api/storj-image?url=${encodeURIComponent(url)}`;
  }

  return url;
};
