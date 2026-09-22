/**
 * API Configuration
 * Supports VITE_API_BASE_URL for production builds (Render backend).
 * Falls back to localhost in development.
 */
const rawBase = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.trim().replace(/\/$/, '')
  : (import.meta.env.DEV ? 'http://localhost:5000' : '');

export const API_BASE = rawBase ? `${rawBase}/api` : '/api';
