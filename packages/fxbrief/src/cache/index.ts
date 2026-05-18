import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ensureDir } from '../utils/fs.js';

export interface AssetCacheOptions {
  cacheDir: string;
  userAgent?: string;
}

export class AssetCache {
  private readonly cacheDir: string;
  private readonly userAgent: string;

  constructor(options: AssetCacheOptions) {
    this.cacheDir = options.cacheDir;
    this.userAgent = options.userAgent ?? 'fx-brief/0.1';
  }

  async resolveImage(url: string, fallbackLabel = 'media'): Promise<string> {
    if (url.startsWith('data:')) return url;
    if (url.startsWith('file:')) return fileUrlToDataUrl(url);

    try {
      const cached = await this.getOrFetch(url);
      return `data:${cached.contentType};base64,${cached.bytes.toString('base64')}`;
    } catch {
      return placeholderDataUrl(fallbackLabel);
    }
  }

  private async getOrFetch(url: string): Promise<{ bytes: Buffer; contentType: string }> {
    await ensureDir(this.cacheDir);
    const key = createHash('sha256').update(url).digest('hex');
    const ext = extensionFromUrl(url);
    const dataPath = path.join(this.cacheDir, `${key}${ext}`);
    const metaPath = path.join(this.cacheDir, `${key}.json`);

    try {
      const [bytes, metaRaw] = await Promise.all([readFile(dataPath), readFile(metaPath, 'utf8')]);
      const meta = JSON.parse(metaRaw) as { contentType?: string };
      return { bytes, contentType: meta.contentType ?? mimeFromExtension(ext) };
    } catch {
      // Cache miss.
    }

    const response = await fetch(url, {
      headers: {
        accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'user-agent': this.userAgent,
      },
    });

    if (!response.ok) {
      throw new Error(`Could not fetch asset ${url}: ${response.status}`);
    }

    const contentType = response.headers.get('content-type')?.split(';')[0]?.trim() || mimeFromExtension(ext);
    const bytes = Buffer.from(await response.arrayBuffer());
    await Promise.all([
      writeFile(dataPath, bytes),
      writeFile(metaPath, JSON.stringify({ url, contentType }, null, 2)),
    ]);
    return { bytes, contentType };
  }
}

async function fileUrlToDataUrl(url: string): Promise<string> {
  const parsed = new URL(url);
  const filePath = decodeURIComponent(parsed.pathname);
  const bytes = await readFile(filePath);
  const contentType = mimeFromExtension(path.extname(filePath));
  return `data:${contentType};base64,${bytes.toString('base64')}`;
}

function extensionFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const ext = path.extname(parsed.pathname).toLowerCase();
    return ext && ext.length <= 6 ? ext : '.bin';
  } catch {
    return '.bin';
  }
}

function mimeFromExtension(ext: string): string {
  switch (ext.toLowerCase()) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.gif':
      return 'image/gif';
    case '.svg':
      return 'image/svg+xml';
    case '.avif':
      return 'image/avif';
    default:
      return 'application/octet-stream';
  }
}

function placeholderDataUrl(label: string): string {
  const safeLabel = escapeXml(label.slice(0, 24));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
  <rect width="800" height="500" fill="#e6ecf0"/>
  <rect x="32" y="32" width="736" height="436" rx="28" fill="#d1dbe3"/>
  <text x="400" y="258" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif" font-size="34" font-weight="700" fill="#536471">${safeLabel}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function escapeXml(value: string): string {
  return value.replace(/[<>&"']/g, (char) => {
    switch (char) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case '"':
        return '&quot;';
      case "'":
        return '&apos;';
      default:
        return char;
    }
  });
}
