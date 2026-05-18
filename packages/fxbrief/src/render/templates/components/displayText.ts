import type { SocialPost } from '../../../types.js';

export function postBodyText(post: SocialPost, translatedText: boolean): string {
  if (translatedText && post.translation?.text) return post.translation.text;
  return post.text || '[No text]';
}
