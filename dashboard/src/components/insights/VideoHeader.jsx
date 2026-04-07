import { Play, MessageSquare, Globe, Clock, Eye, ThumbsUp, BookOpen } from 'lucide-react';

export default function VideoHeader({ video }) {
  const { title, channel, uploadDate, commentCount, language, thumbnail, views, likes, duration, aiSummary, snapshots } = video;
  const formattedDate = new Date(uploadDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Video Info Card */}
      <div className="bg-ix-card border border-ix-border rounded-xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Thumbnail */}
          <div className="relative w-full md:w-80 flex-shrink-0">
            <div className="aspect-video md:aspect-auto md:h-full bg-ix-bg2 overflow-hidden">
              <img src={thumbnail} alt={title} className="w-full h-full object-cover" 
                onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180"><rect fill="%231e1e35" width="320" height="180"/><text x="160" y="90" text-anchor="middle" fill="%2364748b" font-size="14">Video Thumbnail</text></svg>'; }}
              />
            </div>
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-bold px-2 py-0.5 rounded">
              {duration}
            </div>
          </div>

          {/* Meta */}
          <div className="p-5 flex flex-col justify-between flex-1">
            <div>
              <h2 className="text-lg font-bold text-ix-text leading-tight mb-2">{title}</h2>
              <p className="text-sm font-semibold text-ix-purple-light mb-3">{channel}</p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <Chip icon={<Clock size={12} />} text={formattedDate} />
                <Chip icon={<MessageSquare size={12} />} text={`${commentCount.toLocaleString()} comments`} />
                <Chip icon={<Globe size={12} />} text={language} />
                <Chip icon={<Eye size={12} />} text={views} />
                <Chip icon={<ThumbsUp size={12} />} text={likes} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Summary */}
      <div className="bg-ix-card border border-ix-border rounded-xl p-5 border-l-4 border-l-ix-purple">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-ix-blue to-ix-purple flex items-center justify-center">
            <BookOpen size={14} className="text-white" />
          </div>
          <h3 className="text-sm font-bold text-ix-text">AI Video Summary</h3>
          <span className="text-[10px] bg-ix-purple/20 text-ix-purple-light px-2 py-0.5 rounded-full font-semibold">AI Generated</span>
        </div>

        <p className="text-sm text-ix-text leading-relaxed mb-4">{aiSummary.about}</p>

        <h4 className="text-xs font-bold text-ix-muted uppercase tracking-wider mb-2">Key Points</h4>
        <ul className="space-y-1.5 mb-4">
          {aiSummary.mainPoints.map((point, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-ix-text">
              <span className="w-5 h-5 rounded-full bg-gradient-to-br from-ix-blue to-ix-purple text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              {point}
            </li>
          ))}
        </ul>

        {aiSummary.chapters?.length > 0 && (
          <>
            <h4 className="text-xs font-bold text-ix-muted uppercase tracking-wider mb-2">Chapters</h4>
            <div className="flex flex-wrap gap-2">
              {aiSummary.chapters.map((ch, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ix-bg2 border border-ix-border text-xs text-ix-text">
                  <Play size={10} className="text-ix-purple-light" />
                  <span className="text-ix-muted font-mono">{ch.timestamp}</span>
                  <span className="w-px h-3 bg-ix-border" />
                  {ch.title}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Comment Snapshots */}
      {snapshots?.length > 0 && (
        <div className="bg-ix-card border border-ix-border rounded-xl p-5">
          <h3 className="text-sm font-bold text-ix-text mb-3 flex items-center gap-2">
            <MessageSquare size={14} className="text-ix-purple-light" />
            Comment Snapshots
            <span className="text-[10px] bg-ix-bg2 text-ix-muted px-2 py-0.5 rounded-full border border-ix-border">{snapshots.length}</span>
          </h3>
          <div className="space-y-2">
            {snapshots.map((snap, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-ix-bg2/50 border border-ix-border/50 hover:border-ix-border transition-colors">
                <span className="text-lg flex-shrink-0">{['💬', '🔥', '❓', '🎯', '💡'][i % 5]}</span>
                <p className="text-sm text-ix-text leading-relaxed italic">{snap}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Chip({ icon, text }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ix-bg2 border border-ix-border text-xs text-ix-muted">
      {icon}
      {text}
    </span>
  );
}
