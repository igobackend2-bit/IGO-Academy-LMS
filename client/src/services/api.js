/**
 * Axios API client — base config for all IGo Platform HTTP calls
 * Handles: base URL, credentials, 401 redirect, error normalisation
 * @module services/api
 */
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // send httpOnly cookies
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

/** Attach auth token from memory if present */
api.interceptors.request.use((config) => {
  return config;
});

/** Pages where a 401 must NOT trigger a redirect (avoids reload loops) */
const PUBLIC_PATHS = ['/', '/courses', '/login', '/register', '/forgot-password', '/verify-otp', '/course-expired', '/verify', '/igo-brands'];

/** Handle session expiry globally */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const code = error.response?.data?.error;
    const onPublicPage = PUBLIC_PATHS.some((p) => window.location.pathname.startsWith(p));
    // The /auth/me probe runs on every page load — a 401 there just means "not logged in"
    const isMeProbe = error.config?.url?.includes('/auth/me');

    if (!onPublicPage && !isMeProbe) {
      if (code === 'COURSE_EXPIRED') {
        window.location.href = '/course-expired';
      } else if (code === 'SESSION_EXPIRED' || error.response?.status === 401) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
