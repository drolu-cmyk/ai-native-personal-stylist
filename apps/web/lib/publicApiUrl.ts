type ApiUrlEnvironment = { NEXT_PUBLIC_API_BASE_URL?: string; API_BASE_URL?: string };

export function publicApiUrl(environment: ApiUrlEnvironment): string {
  const value = environment.NEXT_PUBLIC_API_BASE_URL || environment.API_BASE_URL || 'http://localhost:4000';
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || /[?#]/.test(value)) {
    throw new Error('The public API base URL must be an HTTP(S) URL without credentials, a query, or a fragment.');
  }
  return url.toString().replace(/\/+$/, '');
}
