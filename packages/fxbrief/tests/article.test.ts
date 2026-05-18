import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { prepareArticleAssets } from '../src/article/assets.js';
import { articleToMarkdown } from '../src/article/markdown.js';
import { exportArticleCommand } from '../src/cli/commands/article.js';
import { normalizeArticleResponse } from '../src/normalize/socialArticle.js';

describe('article export', () => {
  it('normalizes and converts an X Article to Markdown', async () => {
    const raw = JSON.parse(await readFile('fixtures/article.json', 'utf8')) as unknown;
    const article = normalizeArticleResponse(raw, 'x');
    const outputDir = await mkdtemp(path.join(os.tmpdir(), 'fx-brief-article-'));

    try {
      const assets = await prepareArticleAssets(article, {
        outDir: outputDir,
        assetMode: 'local',
        assetsDirName: 'assets',
      });
      const markdown = articleToMarkdown(article, {
        assets: assets.markdownAssets,
        includeTitle: true,
        includeCover: true,
      });

      expect(markdown).toContain('# Synthetic X Article');
      expect(markdown).toContain('![cover](assets/cover.svg)');
      expect(markdown).toContain('**bold words**');
      expect(markdown).toContain('- First item\n- Second item');
      expect(markdown).toContain('[project repository](https://github.com/example/repo)');
      expect(markdown).toContain('![Inline fixture image](assets/image-01.svg)');
      expect(markdown).toContain('```shell\necho hello\n```');
      expect(markdown).toContain('> Do not rewrite source text.');
    } finally {
      await rm(outputDir, { recursive: true, force: true });
    }
  });

  it('writes article.md, metadata, raw JSON, and local assets', async () => {
    const outputDir = await mkdtemp(path.join(os.tmpdir(), 'fx-brief-article-cli-'));

    try {
      const articlePath = await exportArticleCommand('3333333333333333333', {
        fixture: 'fixtures/article.json',
        out: outputDir,
        assets: 'local',
      });

      const markdown = await readFile(articlePath, 'utf8');
      const metadata = JSON.parse(await readFile(path.join(outputDir, 'metadata.json'), 'utf8')) as { title: string; assets: unknown[] };
      const raw = JSON.parse(await readFile(path.join(outputDir, 'raw.fxembed.json'), 'utf8')) as { code: number };

      expect(markdown).toContain('# Synthetic X Article');
      expect(metadata.title).toBe('Synthetic X Article');
      expect(metadata.assets).toHaveLength(2);
      expect(raw.code).toBe(200);
    } finally {
      await rm(outputDir, { recursive: true, force: true });
    }
  });
});
