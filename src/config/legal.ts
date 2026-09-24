/**
 * Legal & Compliance Configuration
 * Authoritative document versions and endpoints.
 */

export const TERMS_VERSION = 'v1.0';
export const PRIVACY_VERSION = 'v1.0';

const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : ({} as Record<string, string>);

export const TERMS_URL: string = env.VITE_TERMS_URL || '/terms';
export const PRIVACY_URL: string = env.VITE_PRIVACY_URL || '/privacy';
