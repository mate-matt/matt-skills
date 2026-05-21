import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { fetchJsonCommand } from '../src/cli/commands/json.js';

describe('json command', () => {
  it('prints raw FxEmbed JSON from a fixture', async () => {
    const result = await fetchJsonCommand('1234567890123456789', {
      fixture: 'fixtures/post.json',
    });

    const json = JSON.parse(result.value) as { code: number; status: { id: string } };
    expect(result.type).toBe('stdout');
    expect(json.code).toBe(200);
    expect(json.status.id).toBe('1234567890123456789');
    expect(result.value).toContain('\n  "status":');
  });

  it('prints normalized JSON when requested', async () => {
    const result = await fetchJsonCommand('1234567890123456789', {
      fixture: 'fixtures/post.json',
      normalized: true,
    });

    const json = JSON.parse(result.value) as { provider: string; author: { handle: string }; media: unknown[] };
    expect(json.provider).toBe('x');
    expect(json.author.handle).toBe('example');
    expect(json.media).toHaveLength(1);
  });

  it('writes JSON to a directory with a stable generated name', async () => {
    const outputDir = await mkdtemp(path.join(os.tmpdir(), 'fxbrief-json-'));

    try {
      const result = await fetchJsonCommand('1234567890123456789', {
        fixture: 'fixtures/post.json',
        out: outputDir,
        compact: true,
      });

      expect(result.type).toBe('file');
      expect(result.value).toBe(path.join(outputDir, 'fxembed-post-1234567890123456789.json'));

      const json = JSON.parse(await readFile(result.value, 'utf8')) as { status: { id: string } };
      expect(json.status.id).toBe('1234567890123456789');
    } finally {
      await rm(outputDir, { recursive: true, force: true });
    }
  });

  it('normalizes thread fixture JSON', async () => {
    const result = await fetchJsonCommand('1234567890123456789', {
      fixture: 'fixtures/thread.json',
      kind: 'thread',
      normalized: true,
    });

    const json = JSON.parse(result.value) as { provider: string; posts: unknown[] };
    expect(json.provider).toBe('x');
    expect(json.posts).toHaveLength(3);
  });
});
