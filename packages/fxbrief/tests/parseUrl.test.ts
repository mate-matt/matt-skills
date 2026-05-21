import { describe, expect, it } from 'vitest';
import { parseProfileUrl, parseSocialUrl } from '../src/providers/parseUrl.js';

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

  it('parses x.com profile URLs and handles', () => {
    expect(parseProfileUrl('https://x.com/mate_mattt')).toEqual({
      provider: 'x',
      handle: 'mate_mattt',
      originalUrl: 'https://x.com/mate_mattt',
    });
    expect(parseProfileUrl('@mate_mattt').handle).toBe('mate_mattt');
  });

  it('rejects status URLs for profile parsing', () => {
    expect(() => parseProfileUrl('https://x.com/mate_mattt/status/1234567890123456789')).toThrow(/profile handle/);
  });
});
