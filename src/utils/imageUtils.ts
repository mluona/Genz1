import { Capacitor } from '@capacitor/core';

/**
 * Utility to process image URLs, proxying external images through the local 
 * server backend on web to ensure high cacheability and bypass CORS policies,
 * while loading directly in native mobile builds (Capacitor Android/iOS).
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

  // Inside native Android/iOS APK, there is no local Node server at /api/local-image
  if (Capacitor.isNativePlatform()) {
    const apiBase = import.meta.env.VITE_API_BASE_URL;
    if (apiBase) {
      return `${apiBase.replace(/\/$/, '')}/api/local-image?url=${encodeURIComponent(url)}`;
    }
    return url;
  }

  // Any other external URLs on web are routed through our backend image proxy
  return `/api/local-image?url=${encodeURIComponent(url)}`;
};

