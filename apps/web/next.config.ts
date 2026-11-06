import type { NextConfig } from 'next';
import { publicApiUrl } from './lib/publicApiUrl';

// This URL is inlined into the browser bundle; never put credentials in it.
const publicApiBaseUrl = publicApiUrl({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  API_BASE_URL: process.env.API_BASE_URL,
});

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  env: { NEXT_PUBLIC_API_BASE_URL: publicApiBaseUrl },
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }
      ]
    }];
  }
};

export default nextConfig;
