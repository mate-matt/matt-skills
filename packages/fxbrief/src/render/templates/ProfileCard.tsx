import type { RenderOptions, SocialAuthor, SocialPost, SocialProfile } from '../../types.js';
import { compactUrl, formatMetric, formatPostDate } from '../../utils/format.js';
import { Avatar } from './components/Avatar.js';
import { MediaGrid } from './components/MediaGrid.js';
import { PostText } from './components/PostText.js';
import { QuotedPost } from './components/QuotedPost.js';
import { VerificationBadge } from './components/VerificationBadge.js';

interface ProfileCardProps {
  profile: SocialProfile;
  options: RenderOptions;
  timelinePosts?: SocialPost[] | undefined;
}

export function ProfileCard({ profile, options, timelinePosts = [] }: ProfileCardProps) {
  const author = profileToAuthor(profile);
  const banner = profile.bannerAssetUrl ?? profile.bannerUrl;
  const joined = formatJoined(profile.joined);
  const website = profile.website ? compactUrl(profile.website) : undefined;

  return (
    <section className="capture profile-card" data-capture>
      <div
        className="profile-banner"
        style={banner ? { backgroundImage: `url("${banner}")` } : undefined}
      />
      <div className="profile-content">
        <div className="profile-avatar-wrap">
          <Avatar author={author} />
        </div>

        <div className="profile-identity">
          <div className="profile-name-row">
            <h1>{profile.name}</h1>
            <VerificationBadge author={author} />
          </div>
          <div className="profile-handle">@{profile.handle}</div>
        </div>

        {profile.description ? <p className="profile-description">{profile.description}</p> : null}

        <div className="profile-meta-grid">
          {profile.location ? <ProfileMetaItem icon="pin" label={profile.location} /> : null}
          {joined ? <ProfileMetaItem icon="calendar" label={joined} /> : null}
          {website ? <ProfileMetaItem icon="link" label={website} /> : null}
        </div>

        <div className="profile-stats">
          <Stat label="Following" value={profile.metrics.following} />
          <Stat label="Followers" value={profile.metrics.followers} />
        </div>

        {timelinePosts.length > 0 ? <ProfileTabs /> : null}

        {timelinePosts.length > 0 ? (
          <div className="profile-timeline">
            {timelinePosts.map((post) => <ProfileTimelinePost key={post.id} post={post} options={options} />)}
          </div>
        ) : null}

        {options.showSourceFooter ? (
          <div className="source-footer">
            Source: X / @{profile.handle} · {compactUrl(profile.url)}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number | undefined }) {
  if (value === undefined) return null;
  return (
    <div className="profile-stat">
      <strong>{formatMetric(value)}</strong>
      <span>{label}</span>
    </div>
  );
}

function ProfileMetaItem({ icon, label }: { icon: 'calendar' | 'link' | 'pin'; label: string }) {
  return (
    <span className="profile-meta-item">
      <MetaIcon name={icon} />
      {label}
    </span>
  );
}

function ProfileTabs() {
  const tabs = ['Posts', 'Replies', 'Highlights', 'Articles', 'Media', 'Likes'];
  return (
    <nav className="profile-tabs" aria-label="Profile timeline tabs">
      {tabs.map((tab, index) => (
        <span className={index === 0 ? 'active' : undefined} key={tab}>{tab}</span>
      ))}
    </nav>
  );
}

function ProfileTimelinePost({ post, options }: { post: SocialPost; options: RenderOptions }) {
  return (
    <article className="profile-timeline-post">
      {post.isPinned ? <div className="profile-pinned"><PinIcon /> Pinned</div> : null}
      <div className="profile-post-main">
        <Avatar author={post.author} />
        <div className="profile-post-body">
          <div className="profile-post-header">
            <div className="profile-post-author">
              <span className="profile-post-name">{post.author.name}</span>
              <VerificationBadge author={post.author} />
              <span className="profile-post-meta">@{post.author.handle} · {formatPostDate(post.createdAt, options.timezone, 'short')}</span>
            </div>
            <div className="profile-post-actions-top">
              <GrokIcon />
              <MoreIcon />
            </div>
          </div>
          <PostText post={post} className="profile-post-text" showTranslation={options.showTranslation} translatedText={options.translatedText} />
          <QuotedPost post={post.quote} timezone={options.timezone} mediaMode={options.mediaMode} translatedText={options.translatedText} />
          <MediaGrid media={post.media} mode={options.mediaMode} />
          <ProfilePostActionRow post={post} />
        </div>
      </div>
    </article>
  );
}

function ProfilePostActionRow({ post }: { post: SocialPost }) {
  return (
    <div className="profile-post-action-row">
      <ActionMetric icon="reply" value={post.metrics?.replies} />
      <ActionMetric icon="repost" value={(post.metrics?.reposts ?? 0) + (post.metrics?.quotes ?? 0) || undefined} />
      <ActionMetric icon="like" value={post.metrics?.likes} />
      <ActionMetric icon="views" value={post.metrics?.views} />
      <ActionMetric icon="bookmark" />
      <ActionMetric icon="share" />
    </div>
  );
}

function ActionMetric({ icon, value }: { icon: 'reply' | 'repost' | 'like' | 'views' | 'bookmark' | 'share'; value?: number | undefined }) {
  return (
    <span className="profile-post-action">
      <ActionIcon name={icon} />
      {value !== undefined ? <span>{formatMetric(value)}</span> : null}
    </span>
  );
}

function ActionIcon({ name }: { name: 'reply' | 'repost' | 'like' | 'views' | 'bookmark' | 'share' }) {
  if (name === 'reply') return <svg viewBox="0 0 24 24"><path d="M20 12a7.5 7.5 0 0 1-7.9 7.5 8.3 8.3 0 0 1-3.2-.8L4 20l1.4-4.4A7.3 7.3 0 0 1 4 12a7.5 7.5 0 0 1 8-7.5 7.5 7.5 0 0 1 8 7.5Z" /></svg>;
  if (name === 'repost') return <svg viewBox="0 0 24 24"><path d="M17 3l3 3-3 3" /><path d="M4 11V8a2 2 0 0 1 2-2h14" /><path d="M7 21l-3-3 3-3" /><path d="M20 13v3a2 2 0 0 1-2 2H4" /></svg>;
  if (name === 'like') return <svg viewBox="0 0 24 24"><path d="M20.5 8.9c0 5.1-8.5 10.2-8.5 10.2S3.5 14 3.5 8.9A4.4 4.4 0 0 1 8 4.5a5 5 0 0 1 4 2 5 5 0 0 1 4-2 4.4 4.4 0 0 1 4.5 4.4Z" /></svg>;
  if (name === 'views') return <svg viewBox="0 0 24 24"><path d="M5 20V10M12 20V4M19 20v-7" /></svg>;
  if (name === 'bookmark') return <svg viewBox="0 0 24 24"><path d="M6 4.8A1.8 1.8 0 0 1 7.8 3h8.4A1.8 1.8 0 0 1 18 4.8V21l-6-4-6 4V4.8Z" /></svg>;
  return <svg viewBox="0 0 24 24"><path d="M12 3v12" /><path d="m7 8 5-5 5 5" /><path d="M5 14v4a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-4" /></svg>;
}

function GrokIcon() {
  return (
    <svg viewBox="0 0 33 32" aria-hidden="true">
      <path d="M12.745 20.54l10.97-8.19c.539-.4 1.307-.244 1.564.38 1.349 3.288.746 7.241-1.938 9.955-2.683 2.714-6.417 3.31-9.83 1.954l-3.728 1.745c5.347 3.697 11.84 2.782 15.898-1.324 3.219-3.255 4.216-7.692 3.284-11.693l.008.009c-1.351-5.878.332-8.227 3.782-13.031L33 0l-4.54 4.59v-.014L12.743 20.544m-2.263 1.987c-3.837-3.707-3.175-9.446.1-12.755 2.42-2.449 6.388-3.448 9.852-1.979l3.72-1.737c-.67-.49-1.53-1.017-2.515-1.387-4.455-1.854-9.789-.931-13.41 2.728-3.483 3.523-4.579 8.94-2.697 13.561 1.405 3.454-.899 5.898-3.22 8.364C1.49 30.2.666 31.074 0 32l10.478-9.466" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <span className="profile-more-icon" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

function PinIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3h8l-1.1 6.2 3.1 3.1V15H6v-2.7l3.1-3.1L8 3Z" /><path d="M12 15v6" /></svg>;
}

function MetaIcon({ name }: { name: 'calendar' | 'link' | 'pin' }) {
  if (name === 'calendar') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 3v3M17 3v3M4.5 9h15M6.5 5h11A2.5 2.5 0 0 1 20 7.5v10A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-10A2.5 2.5 0 0 1 6.5 5Z" />
      </svg>
    );
  }
  if (name === 'link') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9.5 14.5 14.5 9.5M10 7.5l1.2-1.2a4.2 4.2 0 0 1 5.9 5.9L16 13.4M14 16.5l-1.2 1.2a4.2 4.2 0 0 1-5.9-5.9L8 10.6" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 10c0 5.2-7 10.5-7 10.5S5 15.2 5 10a7 7 0 1 1 14 0Z" />
      <path d="M12 12.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z" />
    </svg>
  );
}

function profileToAuthor(profile: SocialProfile): SocialAuthor {
  return {
    name: profile.name,
    handle: profile.handle,
    ...(profile.id ? { id: profile.id } : {}),
    ...(profile.avatarUrl ? { avatarUrl: profile.avatarUrl } : {}),
    ...(profile.avatarAssetUrl ? { avatarAssetUrl: profile.avatarAssetUrl } : {}),
    ...(profile.verified !== undefined ? { verified: profile.verified } : {}),
    ...(profile.verificationType !== undefined ? { verificationType: profile.verificationType } : {}),
  };
}

function formatJoined(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return `Joined ${new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date)}`;
  }
  return value.startsWith('Joined ') ? value : `Joined ${value}`;
}
