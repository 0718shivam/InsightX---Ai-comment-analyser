import { MessageSquare, Calendar } from 'lucide-react';

export default function VideoCard({ video, isActive, onClick }) {
  const { title, channel, analyzedAt, commentCount, sentiment, thumbnail } = video;
  const date = new Date(analyzedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border transition-all duration-200 cursor-pointer group ${
        isActive
          ? 'bg-ix-card-hover border-ix-purple/50 shadow-lg shadow-ix-purple/10'
          : 'bg-ix-card border-ix-border hover:border-ix-border-light hover:bg-ix-card-hover'
      }`}
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden rounded-t-xl">
        <div className="aspect-video bg-ix-bg2 overflow-hidden">
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180"><rect fill="%231e1e35" width="320" height="180"/><text x="160" y="95" text-anchor="middle" fill="%2364748b" font-size="14">No Thumbnail</text></svg>'; }}
          />
        </div>
        {isActive && (
          <div className="absolute inset-0 border-2 border-ix-purple/60 rounded-t-xl pointer-events-none" />
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <h4 className="text-sm font-semibold text-ix-text leading-tight line-clamp-2 group-hover:text-ix-purple-light transition-colors">
          {title}
        </h4>
        <p className="text-xs text-ix-purple-light font-medium">{channel}</p>
        
        <div className="flex items-center gap-3 text-[11px] text-ix-muted">
          <span className="flex items-center gap-1">
            <MessageSquare size={11} />
            {commentCount.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            {date}
          </span>
        </div>

        {/* Mini sentiment bar */}
        <div className="flex h-1.5 rounded-full overflow-hidden bg-ix-bg2">
          <div className="bg-ix-positive transition-all duration-500" style={{ width: `${sentiment.positive}%` }} />
          <div className="bg-ix-neutral transition-all duration-500" style={{ width: `${sentiment.neutral}%` }} />
          <div className="bg-ix-negative transition-all duration-500" style={{ width: `${sentiment.negative}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-ix-muted">
          <span className="text-ix-positive">{sentiment.positive}% pos</span>
          <span className="text-ix-negative">{sentiment.negative}% neg</span>
        </div>
      </div>
    </button>
  );
}
