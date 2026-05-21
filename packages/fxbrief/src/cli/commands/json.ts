import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { normalizePostResponse, normalizeQuotesResponse, normalizeThreadResponse } from '../../normalize/socialPost.js';
import { FxTwitterClient } from '../../providers/fxTwitter.js';
import { parseSocialUrl } from '../../providers/parseUrl.js';
import { ensureParentDir, toAbsolutePath } from '../../utils/fs.js';
import { readJsonFixture } from '../options.js';

export type JsonFetchKind = 'post' | 'thread' | 'quotes';

export interface JsonCliOptions {
  kind?: JsonFetchKind;
  out?: string;
  lang?: string;
  count?: string | number;
  cursor?: string;
  aboutAccount?: boolean;
  fixture?: string;
  normalized?: boolean;
  compact?: boolean;
}

export interface JsonCommandResult {
  type: 'stdout' | 'file';
  value: string;
}

export async function fetchJsonCommand(input: string, rawOptions: JsonCliOptions & Record<string, unknown>): Promise<JsonCommandResult> {
  const parsed = parseSocialUrl(input);
  if (parsed.provider !== 'x') throw new Error('First version supports X/Twitter JSON fetching only.');

  const kind = parseKind(rawOptions.kind);
  const raw = rawOptions.fixture ? await readJsonFixture(rawOptions.fixture) : await fetchRawJson(parsed.id, kind, rawOptions);
  const data = rawOptions.normalized ? normalizeJson(raw, kind) : raw;
  const json = `${JSON.stringify(data, null, rawOptions.compact ? 0 : 2)}\n`;

  if (!rawOptions.out) {
    return {
      type: 'stdout',
      value: json,
    };
  }

  const outPath = resolveJsonOutputPath(kind, parsed.id, rawOptions.out);
  await ensureParentDir(outPath);
  await writeFile(outPath, json, 'utf8');
  return {
    type: 'file',
    value: outPath,
  };
}

async function fetchRawJson(id: string, kind: JsonFetchKind, options: JsonCliOptions): Promise<unknown> {
  const client = new FxTwitterClient();
  const lang = typeof options.lang === 'string' && options.lang ? options.lang : undefined;
  const aboutAccount = options.aboutAccount !== false;

  if (kind === 'thread') {
    return client.getThread(id, { lang, aboutAccount });
  }

  if (kind === 'quotes') {
    return client.getQuotes(id, {
      lang,
      count: parseCount(options.count, 20),
      cursor: typeof options.cursor === 'string' && options.cursor ? options.cursor : undefined,
    });
  }

  return client.getPost(id, { lang, aboutAccount });
}

function normalizeJson(raw: unknown, kind: JsonFetchKind): unknown {
  if (kind === 'thread') return normalizeThreadResponse(raw, 'x');
  if (kind === 'quotes') return normalizeQuotesResponse(raw, 'x');
  return normalizePostResponse(raw, 'x');
}

function parseKind(value: unknown): JsonFetchKind {
  if (value === 'thread' || value === 'quotes') return value;
  return 'post';
}

function parseCount(value: unknown, fallback: number): number {
  const number = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : fallback;
  if (!Number.isFinite(number) || number <= 0) return fallback;
  return Math.min(Math.round(number), 100);
}

function resolveJsonOutputPath(kind: JsonFetchKind, id: string, requested: string): string {
  const absolute = toAbsolutePath(requested);
  const ext = path.extname(absolute);
  if (ext) return absolute;
  return path.join(absolute, `fxembed-${kind}-${id}.json`);
}
