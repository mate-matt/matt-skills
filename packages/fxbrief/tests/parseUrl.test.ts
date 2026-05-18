import { describe, expect, it } from 'vitest';
import { parseSocialUrl } from '../src/providers/parseUrl.js';

describe('parseSocialUrl', () => {
  it('parses x.com status URLs', () => {
    expect(parseSocialUrl('https://x.com/openai/status/1234567890123456789')).toEqual({
      provider: 'x',
      id: '1234567890123456789',
      originalUrl: 'https://x.com/openai/status/1234567890123456789',
    });
  });

  it('parses numeric ids', () => {
    expect(parseSocialUrl('1234567890123456789').id).toBe('1234567890123456789');
  });

  it('rejects unsupported hosts', () => {
    expect(() => parseSocialUrl('https://example.com/post/123')).toThrow(/Unsupported provider/);
  });
});
