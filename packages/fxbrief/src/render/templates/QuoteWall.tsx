import type { CSSProperties } from 'react';
import type { RenderOptions, SocialPost } from '../../types.js';
import { Metrics } from './components/Metrics.js';
import { PostHeader } from './components/PostHeader.js';
import { PostText } from './components/PostText.js';
import { SourceFooter } from './components/SourceFooter.js';
import { postBodyText } from './components/displayText.js';

interface QuoteWallProps {
  sourcePost: SocialPost;
  quotes: SocialPost[];
  options: RenderOptions;
}

export function QuoteWall({ sourcePost, quotes, options }: QuoteWallProps) {
  const columns = options.columns ?? (options.width <= 560 ? 1 : 2);
  const style = { '--wall-columns': columns } as CSSProperties;
  const sourceText = postBodyText(sourcePost, options.translatedText);

  return (
    <section className="capture quote-wall" style={style} data-capture>
      <h1 className="wall-title">Quoted reactions</h1>
      <p className="wall-subtitle">
        Responses quoting @{sourcePost.author.handle}: {sourceText.slice(0, 120)}
        {sourceText.length > 120 ? '...' : ''}
      </p>
      {quotes.length > 0 ? (
        <div className="wall-grid">
          {quotes.map((quote) => (
            <article className="wall-card" key={quote.id}>
              <PostHeader post={quote} timezone={options.timezone} showTimestamp={options.showTimestamp} compact />
              <PostText post={quote} showTranslation={options.showTranslation} translatedText={options.translatedText} />
              {options.showStats ? <Metrics metrics={quote.metrics} /> : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">No quote posts were returned for this source post.</div>
      )}
      {options.showSourceFooter ? <SourceFooter post={sourcePost} /> : null}
    </section>
  );
}
