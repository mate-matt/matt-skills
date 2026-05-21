import type { ProviderName, SocialProfile } from '../types.js';

export function normalizeProfileResponse(raw: unknown, provider: ProviderName = 'x'): SocialProfile {
  const envelope = asRecord(raw);
  const source = asRecord(envelope.user ?? envelope.profile ?? raw);
  const handle = stripAt(asString(source.screen_name) ?? asString(source.handle) ?? asString(source.username) ?? '');

  if (!handle) {
    throw new Error('FxEmbed profile payload is missing a handle.');
  }

  const profile: SocialProfile = {
    provider,
    url: asString(source.url) ?? `https://x.com/${handle}`,
    name: asString(source.name) ?? handle,
    handle,
    metrics: {
      ...definedNumber('followers', source.followers),
      ...definedNumber('following', source.following),
      ...definedNumber('posts', source.statuses),
      ...definedNumber('media', source.media_count),
      ...definedNumber('likes', source.likes),
    },
  };

  const id = asString(source.id);
  if (id !== undefined) profile.id = id;

  const avatarUrl = normalizeAvatarUrl(asString(source.avatar_url) ?? asString(source.avatar) ?? asString(source.avatarUrl));
  if (avatarUrl !== undefined) profile.avatarUrl = avatarUrl;

  const bannerUrl = normalizeBannerUrl(asString(source.banner_url) ?? asString(source.bannerUrl));
  if (bannerUrl !== undefined) profile.bannerUrl = bannerUrl;

  const description = asString(source.description) ?? asString(asRecord(source.raw_description).text);
  if (description !== undefined) profile.description = description;

  const location = asString(source.location);
  if (location !== undefined) profile.location = location;

  const joined = asString(source.joined);
  if (joined !== undefined) profile.joined = joined;

  const website = normalizeWebsite(source.website);
  if (website !== undefined) profile.website = website;

  const verification = asRecord(source.verification);
  const verified = asBoolean(verification.verified);
  if (verified !== undefined) profile.verified = verified;

  const verificationType = asString(verification.type);
  if (verificationType === 'organization' || verificationType === 'government' || verificationType === 'individual') {
    profile.verificationType = verificationType;
  } else if (verification.type === null) {
    profile.verificationType = null;
  }

  const about = asRecord(source.about_account);
  const basedIn = asString(about.based_in);
  const sourceStore = asString(about.source);
  const usernameChanges = asNumber(asRecord(about.username_changes).count);
  if (basedIn !== undefined || sourceStore !== undefined || usernameChanges !== undefined) {
    profile.aboutAccount = {
      ...(basedIn !== undefined ? { basedIn } : {}),
      ...(sourceStore !== undefined ? { source: sourceStore } : {}),
      ...(usernameChanges !== undefined ? { usernameChanges } : {}),
    };
  }

  return profile;
}

function normalizeAvatarUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  return url.replace(/_normal(\.[a-zA-Z0-9]+)(?:\?.*)?$/, '_400x400$1');
}

function normalizeBannerUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  if (/pbs\.twimg\.com\/profile_banners\/[^/]+\/[^/]+$/i.test(url)) {
    return `${url}/1500x500`;
  }
  return url;
}

function normalizeWebsite(raw: unknown): string | undefined {
  if (typeof raw === 'string') return raw;
  const record = asRecord(raw);
  return asString(record.expanded_url) ?? asString(record.display_url) ?? asString(record.url);
}

function stripAt(value: string): string {
  return value.replace(/^@/, '');
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function definedNumber<K extends string>(key: K, value: unknown): Record<K, number> | Record<string, never> {
  const number = asNumber(value);
  return number === undefined ? {} : { [key]: number } as Record<K, number>;
}
