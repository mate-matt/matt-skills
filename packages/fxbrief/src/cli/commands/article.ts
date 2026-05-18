import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { prepareArticleAssets } from '../../article/assets.js';
import { articleToMarkdown } from '../../article/markdown.js';
import { normalizeArticleResponse } from '../../normalize/socialArticle.js';
import { FxTwitterClient } from '../../providers/fxTwitter.js';
import { parseSocialUrl } from '../../providers/parseUrl.js';
import type { ArticleAssetMode, CommonCliOptions } from '../../types.js';
import { ensureDir, toAbsolutePath } from '../../utils/fs.js';
import { readJsonFixture } from '../options.js';

export interface ArticleCliOptions extends CommonCliOptions {
  assets?: ArticleAssetMode;
  raw?: boolean;
  metadata?: boolean;
  title?: boolean;
  cover?: boolean;
}

export async function exportArticleCommand(input: string, rawOptions: ArticleCliOptions & Record<string, unknown>): Promise<string> {
  const parsed = parseSocialUrl(input);
  if (parsed.provider !== 'x') throw new Error('First version supports X/Twitter article export only.');

  const raw = rawOptions.fixture
    ? await readJsonFixture(rawOptions.fixture)
    : await new FxTwitterClient().getPost(parsed.id, { lang: rawOptions.lang, aboutAccount: true });

  const article = normalizeArticleResponse(raw, 'x');
  const outDir = resolveArticleOutputDir(article.sourcePostId, rawOptions.out);
  await ensureDir(outDir);

  const assetMode = parseAssetMode(rawOptions.assets);
  const assetOutput = await prepareArticleAssets(article, {
    outDir,
    assetMode,
    assetsDirName: 'assets',
  });

  const markdown = articleToMarkdown(article, {
    assets: assetOutput.markdownAssets,
    includeTitle: rawOptions.title !== false,
    includeCover: rawOptions.cover !== false,
  });

  const articlePath = path.join(outDir, 'article.md');
  await writeFile(articlePath, markdown, 'utf8');

  if (rawOptions.metadata !== false) {
    await writeFile(path.join(outDir, 'metadata.json'), JSON.stringify(buildMetadata(article, assetMode, assetOutput.manifest), null, 2), 'utf8');
  }

  if (rawOptions.raw !== false) {
    await writeFile(path.join(outDir, 'raw.fxembed.json'), JSON.stringify(raw, null, 2), 'utf8');
  }

  return articlePath;
}

function resolveArticleOutputDir(id: string, requested?: string): string {
  if (!requested) return toAbsolutePath(path.join('output', 'articles', id));
  return toAbsolutePath(requested);
}

function parseAssetMode(value: unknown): ArticleAssetMode {
  if (value === 'remote' || value === 'none') return value;
  return 'local';
}

function buildMetadata(
  article: ReturnType<typeof normalizeArticleResponse>,
  assetMode: ArticleAssetMode,
  assets: Awaited<ReturnType<typeof prepareArticleAssets>>['manifest'],
) {
  return {
    provider: article.provider,
    source_url: article.sourceUrl,
    source_post_id: article.sourcePostId,
    article_id: article.articleId,
    title: article.title,
    preview_text: article.previewText,
    created_at: article.createdAt,
    modified_at: article.modifiedAt ?? null,
    source_created_at: article.sourceCreatedAt ?? null,
    source_metrics: article.sourceMetrics ?? null,
    author: {
      name: article.author.name,
      handle: article.author.handle,
      id: article.author.id ?? null,
      verified: article.author.verified ?? false,
      verification_type: article.author.verificationType ?? null,
    },
    block_count: article.blocks.length,
    asset_mode: assetMode,
    assets,
  };
}
