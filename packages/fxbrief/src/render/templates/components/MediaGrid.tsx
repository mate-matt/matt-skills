import type { MediaMode, SocialMedia } from '../../../types.js';

interface MediaGridProps {
  media: SocialMedia[];
  mode: MediaMode;
}

export function MediaGrid({ media, mode }: MediaGridProps) {
  const selected = selectMedia(media, mode);
  if (selected.length === 0) return null;

  return (
    <div className={`media-grid count-${Math.min(selected.length, 4)}`}>
      {selected.slice(0, 4).map((item, index) => {
        const imageSrc = item.thumbnailAssetUrl ?? item.assetUrl ?? item.thumbnailUrl ?? item.url;
        const badge = item.type === 'video' ? 'Video' : item.type === 'gif' ? 'GIF' : item.type === 'external' ? 'Link' : null;
        return (
          <div className="media-item" key={`${item.url}-${index}`}>
            <img src={imageSrc} alt={item.altText ?? ''} />
            {badge ? <span className="media-badge">{badge}</span> : null}
          </div>
        );
      })}
    </div>
  );
}

export function selectMedia(media: SocialMedia[], mode: MediaMode): SocialMedia[] {
  if (mode === 'none') return [];

  const nonMosaic = media.filter((item) => item.type !== 'mosaic');
  const mosaic = media.find((item) => item.type === 'mosaic');

  if (mode === 'mosaic') return mosaic ? [mosaic] : nonMosaic.slice(0, 4);
  if (mode === 'first') return nonMosaic.slice(0, 1);
  if (mode === 'full') return nonMosaic.length > 0 ? nonMosaic : media;
  return nonMosaic.length > 0 ? nonMosaic.slice(0, 4) : media.slice(0, 1);
}
