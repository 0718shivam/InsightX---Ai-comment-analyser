// Section 5 – Structured Insights (Questions / Complaints / Praise / Suggestions)
import { useState } from 'react';
import { HelpCircle, AlertTriangle, Heart, Lightbulb, ThumbsUp, Users } from 'lucide-react';

const TABS = [
  { key: 'questions', label: 'Questions', icon: HelpCircle, color: '#3b82f6', bg: 'var(--accent-bg)' },
  { key: 'complaints', label: 'Complaints', icon: AlertTriangle, color: '#f43f5e', bg: 'var(--negative-bg)' },
  { key: 'praise', label: 'Praise', icon: Heart, color: '#22c55e', bg: 'var(--positive-bg)' },
  { key: 'suggestions', label: 'Suggestions', icon: Lightbulb, color: '#8b5cf6', bg: 'var(--purple-bg)' },
];

function SeverityBadge({ severity }) {
  if (!severity) return null;
  const map = {
    high: { bg: 'var(--negative-bg)', color: '#f43f5e', label: 'High' },
    medium: { bg: 'var(--warning-bg)', color: '#f59e0b', label: 'Medium' },
    low: { bg: 'var(--positive-bg)', color: '#22c55e', label: 'Low' },
  };
  const s = map[severity] || map.low;
  return <span className="badge" style={{ background: s.bg, color: s.color, fontSize: '10px' }}>{s.label}</span>;
}

export default function StructuredInsightsSection({ video }) {
  const [activeTab, setActiveTab] = useState('questions');
  const insights = video.structuredInsights || {};
  const items = insights[activeTab] || [];
  const currentTabMeta = TABS.find(t => t.key === activeTab);

  return (
    <div className="anim-fade-up">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <span className="section-label">Section 5</span>
        <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--muted)' }} />
        <h3 className="section-title" style={{ marginBottom: 0 }}>Structured Insights</h3>
        <span className="badge badge-teal" style={{ marginLeft: '8px' }}>Gold Section</span>
      </div>

      {/* Tabs */}
      <div className="tab-bar" style={{ marginBottom: '16px' }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`tab-item ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <tab.icon size={13} style={{ display: 'inline', marginRight: '5px', verticalAlign: '-2px' }} />
            {tab.label}
            <span style={{
              marginLeft: '5px',
              fontSize: '11px',
              fontWeight: 700,
              opacity: activeTab === tab.key ? 1 : 0.6,
            }}>
              ({(insights[tab.key] || []).length})
            </span>
          </button>
        ))}
      </div>

      {/* Content cards */}
      <div className="card">
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted)', fontSize: '13px' }}>
            No {activeTab} found in the comments
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {items.map((item, i) => (
              <div
                key={i}
                className="comment-card"
                style={{
                  borderLeft: `3px solid ${currentTabMeta.color}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                  <span className="badge" style={{ background: currentTabMeta.bg, color: currentTabMeta.color, fontSize: '10px' }}>
                    <currentTabMeta.icon size={10} style={{ display: 'inline', marginRight: '3px' }} />
                    {currentTabMeta.label}
                  </span>
                  {item.severity && <SeverityBadge severity={item.severity} />}
                  <span style={{ fontSize: '11px', color: 'var(--muted)', marginLeft: 'auto' }}>
                    by {item.author}
                  </span>
                </div>

                <p style={{
                  fontSize: '13px', color: 'var(--text)', lineHeight: 1.6, marginBottom: '10px',
                  fontStyle: activeTab === 'praise' ? 'normal' : 'normal',
                }}>
                  "{item.text}"
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--muted)' }}>
                    <ThumbsUp size={11} /> {item.likes?.toLocaleString() || '—'}
                  </span>
                  {item.count && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--muted)' }}>
                      <Users size={11} /> {item.count.toLocaleString()} similar
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
