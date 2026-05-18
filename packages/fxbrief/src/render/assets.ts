import type { SocialMedia, SocialPost, SocialThread } from '../types.js';
import { AssetCache } from '../cache/index.js';

export async function hydratePostAssets(post: SocialPost, cache: AssetCache): Promise<SocialPost> {
  const avatarAssetUrl = post.author.avatarUrl ? await cache.resolveImage(post.author.avatarUrl, post.author.handle) : undefined;
  const media = await Promise.all(post.media.map((item) => hydrateMedia(item, cache)));
  const quote = post.quote ? await hydratePostAssets(post.quote, cache) : undefined;

  return {
    ...post,
    author: avatarAssetUrl
      ? {
          ...post.author,
          avatarAssetUrl,
        }
      : post.author,
    media,
    ...(quote ? { quote } : {}),
  };
}

export async function hydrateThreadAssets(thread: SocialThread, cache: AssetCache): Promise<SocialThread> {
  const root = await hydratePostAssets(thread.root, cache);
  const posts = await Promise.all(thread.posts.map((post) => hydratePostAssets(post, cache)));
  return {
    ...thread,
    root,
    posts,
    author: root.author,
  };
}

export async function hydratePostsAssets(posts: SocialPost[], cache: AssetCache): Promise<SocialPost[]> {
  return Promise.all(posts.map((post) => hydratePostAssets(post, cache)));
}

async function hydrateMedia(media: SocialMedia, cache: AssetCache): Promise<SocialMedia> {
  if (media.type === 'video' || media.type === 'external') {
    const thumbnailSource = media.thumbnailUrl;
    if (thumbnailSource) {
      return {
        ...media,
        thumbnailAssetUrl: await cache.resolveImage(thumbnailSource, media.type),
      };
    }
    return {
      ...media,
      thumbnailAssetUrl: await cache.resolveImage(placeholderImageDataUrl(media.type), media.type),
    };
  }

  return {
    ...media,
    assetUrl: await cache.resolveImage(media.url, media.type),
  };
}

function placeholderImageDataUrl(label: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500">
    <rect width="800" height="500" fill="#e6ecf0"/>
    <text x="400" y="258" text-anchor="middle" font-family="sans-serif" font-size="34" font-weight="700" fill="#536471">${label}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
