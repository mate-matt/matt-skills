import { z } from 'zod';

const ApiEnvelopeSchema = z
  .object({
    code: z.number(),
  })
  .passthrough();

export interface FxTwitterClientOptions {
  baseUrl?: string;
  userAgent?: string;
}

export interface FetchPostOptions {
  lang?: string | undefined;
  aboutAccount?: boolean;
}

export interface FetchListOptions extends FetchPostOptions {
  count?: number;
  cursor?: string | undefined;
  withReplies?: boolean;
  groupThreads?: boolean;
}

export class FxTwitterClient {
  private readonly baseUrl: string;
  private readonly userAgent: string;

  constructor(options: FxTwitterClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? 'https://api.fxtwitter.com';
    this.userAgent = options.userAgent ?? 'fx-brief/0.1 (+https://docs.fxembed.com/)';
  }

  async getPost(id: string, options: FetchPostOptions = {}): Promise<unknown> {
    return this.get(`/2/status/${id}`, {
      about_account: options.aboutAccount === false ? undefined : '1',
      lang: options.lang,
    });
  }

  async getThread(id: string, options: FetchPostOptions = {}): Promise<unknown> {
    return this.get(`/2/thread/${id}`, {
      about_account: options.aboutAccount === false ? undefined : '1',
      lang: options.lang,
    });
  }

  async getQuotes(id: string, options: FetchListOptions = {}): Promise<unknown> {
    return this.get(`/2/status/${id}/quotes`, {
      count: options.count,
      cursor: options.cursor,
      lang: options.lang,
    });
  }

  async getProfile(handle: string, options: FetchPostOptions = {}): Promise<unknown> {
    return this.get(`/2/profile/${encodeURIComponent(handle)}`, {
      about_account: options.aboutAccount === false ? undefined : '1',
    });
  }

  async getProfileStatuses(handle: string, options: FetchListOptions = {}): Promise<unknown> {
    return this.get(`/2/profile/${encodeURIComponent(handle)}/statuses`, {
      count: options.count,
      cursor: options.cursor,
      with_replies: options.withReplies ? '1' : undefined,
      groupthreads: options.groupThreads ? '1' : undefined,
      lang: options.lang,
    });
  }

  private async get(pathname: string, query: Record<string, string | number | undefined>): Promise<unknown> {
    const url = new URL(pathname, this.baseUrl);
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
    }

    const response = await fetch(url, {
      headers: {
        accept: 'application/json',
        'user-agent': this.userAgent,
      },
    });

    if (response.status === 204) {
      return { code: 204, results: [] };
    }

    const text = await response.text();
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(`FxEmbed returned non-JSON response (${response.status}) from ${url.toString()}`);
    }

    const envelope = ApiEnvelopeSchema.safeParse(json);
    if (!response.ok || !envelope.success || envelope.data.code < 200 || envelope.data.code >= 300) {
      const message = extractErrorMessage(json) ?? response.statusText;
      throw new Error(`FxEmbed request failed (${response.status}/${envelope.success ? envelope.data.code : 'unknown'}): ${message}`);
    }

    return json;
  }
}

function extractErrorMessage(value: unknown): string | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const record = value as Record<string, unknown>;
  const message = record.message ?? record.error ?? record.reason;
  return typeof message === 'string' ? message : undefined;
}
