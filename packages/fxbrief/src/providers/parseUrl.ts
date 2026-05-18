import type { ProviderName } from '../types.js';

export interface ParsedSocialUrl {
  provider: ProviderName;
  id: string;
  originalUrl: string;
}

const X_HOSTS = new Set([
  'x.com',
  'www.x.com',
  'twitter.com',
  'www.twitter.com',
  'mobile.twitter.com',
  'fxtwitter.com',
  'www.fxtwitter.com',
  'fixupx.com',
  'www.fixupx.com',
  'twittpr.com',
  'www.twittpr.com',
]);

export function parseSocialUrl(input: string): ParsedSocialUrl {
  if (/^\d{2,20}$/.test(input)) {
    return { provider: 'x', id: input, originalUrl: input };
  }

  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new Error(`Expected an X/Twitter status URL or numeric status id, got: ${input}`);
  }

  const host = url.hostname.toLowerCase();
  if (X_HOSTS.has(host)) {
    const match = url.pathname.match(/\/status(?:es)?\/(\d{2,20})(?:\/|$)/);
    if (!match?.[1]) {
      throw new Error(`Could not find a numeric status id in URL: ${input}`);
    }
    return { provider: 'x', id: match[1], originalUrl: input };
  }

  throw new Error(`Unsupported provider host "${url.hostname}". First version supports X/Twitter via FxEmbed.`);
}
