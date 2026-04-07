// Section 1 – Video Header / Context
import { ThumbsUp, MessageSquare, Eye, TrendingUp, ExternalLink } from 'lucide-react';

function QuickStat({ label, value, color }) {
  return (
    <div style={{
      background: 'var(--card2)',
      border: '1px solid var(--border)',
      borderRadius: '10px',
      padding: '12px 16px',
    }}>
      <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 500, marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{ fontSize: '20px', fontWeight: 800, color: color || 'var(--text)', lineHeight: 1 }}>
        {value}
      </div>
    </div>
  );
}

export default function VideoContextHeader({ video }) {
  return (
    <div
      className="card anim-fade-up"
      style={{
        padding: 0,
        overflow: 'hidden',
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>

        {/* Thumbnail */}
        <div style={{
          position: 'relative',
          flexShrink: 0,
          width: '280px',
          minHeight: '160px',
          background: 'var(--bg2)',
        }}>
          <img
            src={video.thumbnail}
            alt={video.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={e => { e.currentTarget.style.display = 'none'; }}
          />
          {/* Duration badge */}
          <span style={{
            position: 'absolute', bottom: '8px', right: '8px',
            background: 'rgba(0,0,0,0.8)', color: '#fff',
            fontSize: '11px', fontWeight: 700,
            padding: '2px 7px', borderRadius: '4px',
          }}>
            {video.duration}
          </span>
        </div>

        {/* Info */}
        <div style={{ flex: 1, padding: '22px 24px', minWidth: '260px' }}>
          {/* Channel + language tag */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563eb, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>
              {video.channel[0]}
            </div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text2)' }}>
              {video.channel}
            </span>
            <span className="badge badge-blue" style={{ marginLeft: '4px' }}>
              {video.language}
            </span>
            <a
              href={`https://youtube.com/watch?v=${video.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginLeft: 'auto',
                display: 'flex', alignItems: 'center', gap: '4px',
                fontSize: '12px', color: 'var(--muted)', textDecoration: 'none',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent2)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; }}
            >
              <ExternalLink size={12} />
              Watch
            </a>
          </div>

          {/* Title */}
          <h2 style={{
            fontSize: '17px', fontWeight: 700, color: 'var(--text)',
            lineHeight: 1.4, marginBottom: '16px',
          }}>
            {video.title}
          </h2>

          {/* Video stats row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
            {[
              { icon: Eye, label: `${video.views} views` },
              { icon: ThumbsUp, label: `${video.likes} likes` },
              { icon: MessageSquare, label: `${video.commentCount.toLocaleString()} comments analyzed` },
              { icon: TrendingUp, label: `Uploaded ${new Date(video.uploadDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` },
            ].map(({ icon, label }) => {
              const Icon = icon;
              return (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                fontSize: '12px', color: 'var(--muted)', fontWeight: 500,
                padding: '4px 10px', borderRadius: '99px',
                border: '1px solid var(--border)', background: 'var(--bg2)',
              }}>
                <Icon size={11} strokeWidth={2} />
                {label}
              </div>
            );
            })}
          </div>

          {/* Quick sentiment stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <QuickStat label="% Positive" value={`${video.sentiment.positive}%`} color="#22c55e" />
            <QuickStat label="% Negative" value={`${video.sentiment.negative}%`} color="#f43f5e" />
            <QuickStat label="💬 Likes on Comments" value={video.totalLikesOnComments.toLocaleString()} />
          </div>
        </div>
      </div>
    </div>
  );
}
