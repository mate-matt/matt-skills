import type { ProviderName } from '../types.js';

export interface ParsedSocialUrl {
  provider: ProviderName;
  id: string;
  originalUrl: string;
}

export interface ParsedProfileUrl {
  provider: ProviderName;
  handle: string;
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

export function parseProfileUrl(input: string): ParsedProfileUrl {
  const directHandle = normalizeHandle(input);
  if (directHandle) {
    return { provider: 'x', handle: directHandle, originalUrl: input };
  }

  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new Error(`Expected an X/Twitter profile URL or handle, got: ${input}`);
  }

  const host = url.hostname.toLowerCase();
  if (!X_HOSTS.has(host)) {
    throw new Error(`Unsupported provider host "${url.hostname}". First version supports X/Twitter via FxEmbed.`);
  }

  const [firstSegment, secondSegment] = url.pathname.split('/').filter(Boolean);
  if (!firstSegment || secondSegment === 'status' || secondSegment === 'statuses') {
    throw new Error(`Could not find a profile handle in URL: ${input}`);
  }

  const handle = normalizeHandle(firstSegment);
  if (!handle) {
    throw new Error(`Could not find a profile handle in URL: ${input}`);
  }

  return { provider: 'x', handle, originalUrl: input };
}

function normalizeHandle(value: string): string | undefined {
  const handle = value.trim().replace(/^@/, '');
  if (/^[A-Za-z0-9_]{1,15}$/.test(handle)) return handle;
  return undefined;
}
