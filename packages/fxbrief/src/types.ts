export type ProviderName = 'x' | 'bluesky';

export type RenderTemplate =
  | 'post-mobile'
  | 'post-clean'
  | 'thread-vertical'
  | 'quote-wall';

export type ArticleShotStyle = 'article-x' | 'article-clean';
export type OutputFormat = 'png' | 'webp';
export type ThemeName = 'light' | 'dark';
export type MediaMode = 'none' | 'first' | 'grid' | 'mosaic' | 'full';

export interface SocialAuthor {
  id?: string;
  name: string;
  handle: string;
  avatarUrl?: string;
  avatarAssetUrl?: string;
  bannerUrl?: string;
  description?: string;
  verified?: boolean;
  verificationType?: 'organization' | 'government' | 'individual' | null;
  followers?: number;
  following?: number;
  location?: string;
  joined?: string;
}

export interface SocialMedia {
  id?: string;
  type: 'photo' | 'video' | 'gif' | 'mosaic' | 'external';
  url: string;
  assetUrl?: string;
  thumbnailUrl?: string;
  thumbnailAssetUrl?: string;
  width?: number;
  height?: number;
  altText?: string;
  duration?: number;
}

export interface SocialPollChoice {
  label: string;
  count: number;
  percentage: number;
}

export interface SocialPoll {
  choices: SocialPollChoice[];
  totalVotes: number;
  endsAt?: string;
  timeLeft?: string;
}

export interface SocialMetrics {
  replies?: number;
  reposts?: number;
  quotes?: number;
  likes?: number;
  views?: number;
  bookmarks?: number;
}

export interface SocialTranslation {
  text: string;
  sourceLang?: string;
  targetLang?: string;
  provider?: string;
}

export interface SocialPost {
  provider: ProviderName;
  id: string;
  url: string;
  text: string;
  createdAt: string;
  createdTimestamp?: number;
  author: SocialAuthor;
  media: SocialMedia[];
  metrics?: SocialMetrics;
  quote?: SocialPost;
  poll?: SocialPoll;
  translation?: SocialTranslation;
  lang?: string | null;
  source?: string;
  sourceLabel?: string;
  possiblySensitive?: boolean;
  communityNote?: {
    text: string;
  } | null;
}

export interface ArticleInlineStyleRange {
  offset: number;
  length: number;
  style: string;
}

export interface ArticleEntityRange {
  offset: number;
  length: number;
  key: number;
}

export interface ArticleBlock {
  key?: string;
  type: string;
  text: string;
  inlineStyleRanges: ArticleInlineStyleRange[];
  entityRanges: ArticleEntityRange[];
  data: Record<string, unknown>;
}

export interface ArticleEntity {
  key: string;
  type: string;
  data: Record<string, unknown>;
}

export interface ArticleMedia {
  id?: string;
  mediaId: string;
  mediaKey?: string;
  type: 'image' | 'video' | 'gif';
  url: string;
  assetUrl?: string;
  width?: number;
  height?: number;
  altText?: string;
}

export interface SocialArticle {
  provider: ProviderName;
  sourcePostId: string;
  sourceUrl: string;
  articleId: string;
  title: string;
  previewText: string;
  createdAt: string;
  modifiedAt?: string;
  author: SocialAuthor;
  sourceCreatedAt?: string;
  sourceMetrics?: SocialMetrics;
  cover?: ArticleMedia;
  blocks: ArticleBlock[];
  entities: ArticleEntity[];
  media: ArticleMedia[];
}

export interface SocialThread {
  provider: ProviderName;
  root: SocialPost;
  posts: SocialPost[];
  author?: SocialAuthor;
}

export interface RenderOptions {
  template: RenderTemplate;
  width: number;
  theme: ThemeName;
  timezone: string;
  mediaMode: MediaMode;
  showStats: boolean;
  showSourceFooter: boolean;
  showTimestamp: boolean;
  showTranslation: boolean;
  translatedText: boolean;
  columns?: number;
  maxPosts?: number;
}

export interface ArticleShotRenderOptions {
  style: ArticleShotStyle;
  width: number;
  theme: ThemeName;
  timezone: string;
  showSourceFooter: boolean;
  showCover: boolean;
  showActions: boolean;
}

export interface ScreenshotOptions {
  width: number;
  scale: number;
  format: OutputFormat;
  quality: number;
  transparent: boolean;
  outPath: string;
  debugHtmlPath?: string | undefined;
}

export interface LongScreenshotOptions extends ScreenshotOptions {
  sliceHeight?: number | undefined;
  slicePathForIndex?: ((index: number) => string) | undefined;
  writeLong: boolean;
}

export interface LongScreenshotResult {
  outPath?: string | undefined;
  slicePaths: string[];
  cssHeight: number;
}

export interface CommonCliOptions {
  out?: string;
  format?: OutputFormat;
  width?: string | number;
  scale?: string | number;
  theme?: ThemeName;
  timezone?: string;
  lang?: string | undefined;
  quality?: string | number;
  transparent?: boolean;
  cacheDir?: string;
  debugHtml?: boolean;
  hideSourceFooter?: boolean;
  hideStats?: boolean;
  stats?: boolean;
  media?: MediaMode;
  showTranslation?: boolean;
  translatedText?: boolean;
  fixture?: string | undefined;
}

export type ArticleAssetMode = 'local' | 'remote' | 'none';
