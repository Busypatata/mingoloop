const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Uploaded files are served from the API server's origin, not under /api.
const SERVER_ORIGIN = API_URL.replace(/\/api\/?$/, '');

export function mediaUrl(path: string): string {
  return /^https?:\/\//i.test(path) ? path : `${SERVER_ORIGIN}${path}`;
}
