import { a2 as Capacitor } from "./index-BNptM8td.js";
const getProxiedImageUrl = (url) => {
  if (!url) return void 0;
  if (url.startsWith("/") || url.startsWith("data:") || url.startsWith("blob:") || url.startsWith("http://localhost") || url.startsWith("https://localhost")) {
    return url;
  }
  if (Capacitor.isNativePlatform()) {
    return url;
  }
  return `/api/local-image?url=${encodeURIComponent(url)}`;
};
export {
  getProxiedImageUrl as g
};
