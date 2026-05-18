import { createHash } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { ArticleAssetMode, ArticleMedia, SocialArticle } from '../types.js';
import { ensureDir } from '../utils/fs.js';
import type { ArticleMarkdownAssets } from './markdown.js';

export interface ArticleAssetManifestItem {
  role: 'cover' | 'media';
  mediaId: string;
  sourceUrl: string;
  file?: string;
  markdownPath?: string;
  width?: number;
  height?: number;
  altText?: string;
}

export interface ArticleAssetOutput {
  markdownAssets: ArticleMarkdownAssets;
  manifest: ArticleAssetManifestItem[];
}

export interface WriteArticleAssetsOptions {
  outDir: string;
  assetMode: ArticleAssetMode;
  assetsDirName: string;
}

export async function prepareArticleAssets(article: SocialArticle, options: WriteArticleAssetsOptions): Promise<ArticleAssetOutput> {
  const mediaMap = new Map<string, { media: ArticleMedia; markdownPath: string }>();
  const manifest: ArticleAssetManifestItem[] = [];

  const coverRef = article.cover
    ? await prepareOneAsset(article.cover, 'cover', 0, options, manifest)
    : undefined;

  for (let index = 0; index < article.media.length; index += 1) {
    const media = article.media[index];
    if (!media) continue;
    const ref = await prepareOneAsset(media, 'media', index + 1, options, manifest);
    if (ref) mediaMap.set(media.mediaId, ref);
  }

  return {
    markdownAssets: {
      ...(coverRef ? { cover: coverRef } : {}),
      media: mediaMap,
    },
    manifest,
  };
}

async function prepareOneAsset(
  media: ArticleMedia,
  role: 'cover' | 'media',
  index: number,
  options: WriteArticleAssetsOptions,
  manifest: ArticleAssetManifestItem[],
): Promise<{ media: ArticleMedia; markdownPath: string } | undefined> {
  if (options.assetMode === 'none') {
    return undefined;
  }

  if (options.assetMode === 'remote') {
    manifest.push(toManifestItem(media, role, undefined, media.url));
    return { media, markdownPath: media.url };
  }

  const assetDir = path.join(options.outDir, options.assetsDirName);
  await ensureDir(assetDir);

  const asset = await readAsset(media.url);
  const extension = extensionForAsset(media.url, asset.contentType);
  const basename = role === 'cover' ? `cover${extension}` : `image-${String(index).padStart(2, '0')}${extension}`;
  const filePath = path.join(assetDir, basename);
  await writeFile(filePath, asset.bytes);

  const markdownPath = `${options.assetsDirName}/${basename}`;
  manifest.push(toManifestItem(media, role, filePath, markdownPath));
  return { media, markdownPath };
}

async function readAsset(url: string): Promise<{ bytes: Buffer; contentType: string }> {
  if (url.startsWith('data:')) {
    return readDataUrl(url);
  }

  const response = await fetch(url, {
    headers: {
      accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      'user-agent': 'fx-brief/0.1',
    },
  });

  if (!response.ok) {
    throw new Error(`Could not download article asset ${url}: ${response.status}`);
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get('content-type')?.split(';')[0]?.trim() || 'application/octet-stream';
  return { bytes, contentType };
}

function readDataUrl(url: string): { bytes: Buffer; contentType: string } {
  const match = url.match(/^data:([^,]*),(.*)$/);
  if (!match) throw new Error('Invalid data URL asset.');

  const metadata = match[1] || '';
  const parts = metadata.split(';').filter(Boolean);
  const contentType = parts[0] && parts[0].includes('/') ? parts[0] : 'application/octet-stream';
  const isBase64 = parts.includes('base64');
  const payload = match[2] ?? '';
  const bytes = isBase64 ? Buffer.from(payload, 'base64') : Buffer.from(decodeURIComponent(payload), 'utf8');
  return { bytes, contentType };
}

function extensionForAsset(url: string, contentType: string): string {
  const extFromUrl = extensionFromUrl(url);
  if (extFromUrl) return extFromUrl;

  switch (contentType) {
    case 'image/jpeg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/webp':
      return '.webp';
    case 'image/gif':
      return '.gif';
    case 'image/svg+xml':
      return '.svg';
    case 'image/avif':
      return '.avif';
    default:
      return `.${createHash('sha1').update(contentType).digest('hex').slice(0, 8)}.bin`;
  }
}

function extensionFromUrl(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    const ext = path.extname(parsed.pathname).toLowerCase();
    return ext && ext.length <= 6 ? ext : undefined;
  } catch {
    return undefined;
  }
}

function toManifestItem(
  media: ArticleMedia,
  role: 'cover' | 'media',
  file: string | undefined,
  markdownPath: string | undefined,
): ArticleAssetManifestItem {
  const item: ArticleAssetManifestItem = {
    role,
    mediaId: media.mediaId,
    sourceUrl: media.url,
  };

  if (file !== undefined) item.file = file;
  if (markdownPath !== undefined) item.markdownPath = markdownPath;
  if (media.width !== undefined) item.width = media.width;
  if (media.height !== undefined) item.height = media.height;
  if (media.altText !== undefined) item.altText = media.altText;
  return item;
}
