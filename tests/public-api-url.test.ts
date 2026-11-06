import assert from 'node:assert/strict';
import test from 'node:test';
import { publicApiUrl } from '../apps/web/lib/publicApiUrl';

test('uses the browser override, then the API URL, then the local default', () => {
  assert.equal(publicApiUrl({ API_BASE_URL: 'https://api.example.test/' }), 'https://api.example.test');
  assert.equal(publicApiUrl({ API_BASE_URL: 'https://api.example.test', NEXT_PUBLIC_API_BASE_URL: 'https://browser.example.test/base/' }), 'https://browser.example.test/base');
  assert.equal(publicApiUrl({}), 'http://localhost:4000');
});

test('rejects credentials, queries, fragments, and non-HTTP schemes', () => {
  for (const value of ['https://user:pass@api.example.test', 'https://api.example.test?token=secret',
    'https://api.example.test?', 'https://api.example.test#secret', 'https://api.example.test#',
    'file:///tmp/api']) {
    assert.throws(() => publicApiUrl({ API_BASE_URL: value }));
    assert.throws(() => publicApiUrl({ NEXT_PUBLIC_API_BASE_URL: value }));
  }
});
