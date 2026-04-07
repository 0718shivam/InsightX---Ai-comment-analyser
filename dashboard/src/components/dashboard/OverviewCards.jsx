// Section 2 – Overview Cards
import { MessageSquare, Smile, Zap, Hash } from 'lucide-react';

function ScoreRing({ score, color }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <svg width="68" height="68" viewBox="0 0 68 68" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="34" cy="34" r={r} fill="none" stroke="var(--border)" strokeWidth="6" />
      <circle
        cx="34" cy="34" r={r} fill="none"
        stroke={color} strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
      <text
        x="34" y="34"
        dominantBaseline="middle"
        textAnchor="middle"
        style={{ transform: 'rotate(90deg)', transformOrigin: '34px 34px' }}
        fill="var(--text)"
        fontSize="13"
        fontWeight="800"
        fontFamily="Inter, sans-serif"
      >
        {score}
      </text>
    </svg>
  );
}

const CARDS = [
  {
    key: 'sentimentScore',
    label: 'Sentiment Score',
    icon: Smile,
    color: '#22c55e',
    bg: 'var(--positive-bg)',
    render: (v) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <ScoreRing score={v.sentimentScore} color="#22c55e" />
        <div>
          <div className="stat-number">{v.sentimentScore}</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>out of 100</div>
        </div>
      </div>
    ),
  },
  {
    key: 'commentCount',
    label: 'Total Comments',
    icon: MessageSquare,
    color: '#3b82f6',
    bg: 'var(--accent-bg)',
    render: (v) => (
      <div>
        <div className="stat-number">{v.commentCount.toLocaleString()}</div>
        <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>comments analyzed</div>
        <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '3px' }}>
          Analyzed {v.commentCount.toLocaleString()} out of {v.totalCommentsFetched.toLocaleString()} comments
        </div>
        <div style={{ marginTop: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>
            <span>Coverage</span><span>{v.coveragePercent}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${v.coveragePercent}%`, background: 'var(--accent2)' }} />
          </div>
        </div>
      </div>
    ),
  },
  {
    key: 'topTopic',
    label: 'Top Topic',
    icon: Hash,
    color: '#8b5cf6',
    bg: 'var(--purple-bg)',
    render: (v) => (
      <div>
        <div style={{ fontSize: '22px', fontWeight: 800, color: '#8b5cf6', lineHeight: 1.2, marginBottom: '8px' }}>
          {v.topTopic}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
          {v.themes.slice(0, 3).map(t => (
            <span key={t.name} className="badge badge-purple" style={{ fontSize: '10px' }}>
              {t.name}
            </span>
          ))}
        </div>
      </div>
    ),
  },
  {
    key: 'engagementLevel',
    label: 'Engagement Level',
    icon: Zap,
    color: '#f59e0b',
    bg: 'var(--warning-bg)',
    render: (v) => {
      const levels = ['Low', 'Medium', 'High', 'Very High'];
      const idx = levels.indexOf(v.engagementLevel);
      return (
        <div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#f59e0b', lineHeight: 1.2, marginBottom: '12px' }}>
            {v.engagementLevel}
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {levels.map((l, i) => (
              <div key={l} style={{
                flex: 1, height: '6px', borderRadius: '3px',
                background: i <= idx ? '#f59e0b' : 'var(--border)',
                transition: 'background 0.3s ease',
              }} />
            ))}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '6px' }}>
            Based on replies & like distribution
          </div>
        </div>
      );
    },
  },
];

export default function OverviewCards({ video }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
      {CARDS.map(({ key, label, icon, color, bg, render }, i) => {
        const Icon = icon;
        return (
        <div
          key={key}
          className={`card card-hover anim-fade-up delay-${i + 1}`}
          style={{ background: 'var(--card)', position: 'relative', overflow: 'hidden' }}
        >
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
            background: color, borderRadius: '16px 16px 0 0',
          }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: bg, display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon size={15} style={{ color }} strokeWidth={2} />
            </div>
            <span className="section-label">{label}</span>
          </div>
          {render(video)}
        </div>
      );
      })}
    </div>
  );
}
