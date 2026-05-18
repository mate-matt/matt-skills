import type { SocialPoll } from '../../../types.js';
import { formatCount } from '../../../utils/format.js';

interface PollProps {
  poll?: SocialPoll | undefined;
}

export function Poll({ poll }: PollProps) {
  if (!poll) return null;

  return (
    <div className="poll">
      {poll.choices.map((choice) => (
        <div className="poll-choice" key={choice.label}>
          <div className="poll-fill" style={{ width: `${Math.max(0, Math.min(100, choice.percentage))}%` }} />
          <div className="poll-label">
            <span>{choice.label}</span>
            <span>{Math.round(choice.percentage)}%</span>
          </div>
        </div>
      ))}
      <div className="poll-total">
        {formatCount(poll.totalVotes)} votes{poll.timeLeft ? ` · ${poll.timeLeft}` : null}
      </div>
    </div>
  );
}
