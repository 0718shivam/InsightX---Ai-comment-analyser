// Section 4 – Topic & Discussion Analysis (clickable topics with related comments)
import { useState } from 'react';
import { Hash, MessageSquare, TrendingUp, X } from 'lucide-react';

function SentimentBar({ value }) {
  const color = value >= 70 ? '#22c55e' : value >= 50 ? '#f59e0b' : '#f43f5e';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
      <div className="progress-bar" style={{ flex: 1 }}>
        <div className="progress-fill" style={{ width: `${value}%`, background: color }} />
      </div>
      <span style={{ fontSize: '11px', fontWeight: 600, color, minWidth: '28px', textAlign: 'right' }}>
        {value}%
      </span>
    </div>
  );
}

export default function TopicsSection({ video }) {
  const [activeTopic, setActiveTopic] = useState(null);

  // Simulate comments for the selected topic
  const getTopicComments = (topicName) => {
    const si = video.structuredInsights;
    const all = [
      ...(si.praise || []).map(c => ({ ...c, type: 'praise' })),
      ...(si.questions || []).map(c => ({ ...c, type: 'question' })),
      ...(si.complaints || []).map(c => ({ ...c, type: 'complaint' })),
      ...(si.suggestions || []).map(c => ({ ...c, type: 'suggestion' })),
    ];
    // Return first 4 comments as "related" for the topic
    const hash = topicName.length;
    return all.slice(hash % 3, (hash % 3) + 4);
  };

  const selectedTheme = video.themes.find(t => t.name === activeTopic);
  const relatedComments = activeTopic ? getTopicComments(activeTopic) : [];

  return (
    <div className="anim-fade-up">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <span className="section-label">Section 4</span>
        <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--muted)' }} />
        <h3 className="section-title" style={{ marginBottom: 0 }}>Topics & Discussion</h3>
        <span className="badge badge-blue" style={{ marginLeft: '8px' }}>Core Feature</span>
      </div>

      {/* Topic tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
        {video.themes.map(theme => (
          <button
            key={theme.name}
            className={`topic-tag ${activeTopic === theme.name ? 'active' : ''}`}
            onClick={() => setActiveTopic(activeTopic === theme.name ? null : theme.name)}
          >
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: theme.color, display: 'inline-block', flexShrink: 0,
            }} />
            {theme.name}
            <span style={{
              fontSize: '11px', fontWeight: 700,
              color: activeTopic === theme.name ? 'var(--accent2)' : 'var(--muted)',
              background: activeTopic === theme.name ? 'transparent' : 'var(--bg2)',
              padding: '1px 6px', borderRadius: '99px',
            }}>
              {theme.count}
            </span>
          </button>
        ))}
      </div>

      {/* Topic detail grid */}
      <div style={{ display: 'grid', gridTemplateColumns: activeTopic ? '1fr 1fr' : '1fr', gap: '16px' }}>

        {/* All topics as cards */}
        <div className="card">
          <p className="section-label" style={{ marginBottom: '14px' }}>
            <Hash size={12} style={{ display: 'inline', marginRight: '4px' }} />
            All Topics ({video.themes.length})
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {video.themes.map(theme => (
              <button
                key={theme.name}
                onClick={() => setActiveTopic(activeTopic === theme.name ? null : theme.name)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 14px', borderRadius: '10px',
                  border: `1px solid ${activeTopic === theme.name ? 'var(--accent2)' : 'var(--border)'}`,
                  background: activeTopic === theme.name ? 'var(--accent-bg)' : 'var(--bg2)',
                  cursor: 'pointer', transition: 'all 0.18s', width: '100%',
                  textAlign: 'left',
                }}
                onMouseEnter={e => {
                  if (activeTopic !== theme.name) e.currentTarget.style.borderColor = 'var(--accent2)';
                }}
                onMouseLeave={e => {
                  if (activeTopic !== theme.name) e.currentTarget.style.borderColor = 'var(--border)';
                }}
              >
                <span style={{
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: theme.color, flexShrink: 0,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '13px', fontWeight: 600,
                    color: activeTopic === theme.name ? 'var(--accent2)' : 'var(--text)',
                    marginBottom: '6px',
                  }}>
                    {theme.name}
                  </div>
                  <SentimentBar value={theme.sentiment} />
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>
                    {theme.count}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--muted)' }}>mentions</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Related comments panel */}
        {activeTopic && (
          <div className="card anim-slide-left" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div>
                <p className="section-label" style={{ marginBottom: '4px' }}>
                  <MessageSquare size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  Related Comments
                </p>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent2)' }}>
                  {activeTopic}
                </p>
              </div>
              <button
                onClick={() => setActiveTopic(null)}
                style={{
                  width: '28px', height: '28px', borderRadius: '6px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--bg2)', border: '1px solid var(--border)',
                  color: 'var(--muted)', cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; }}
              >
                <X size={13} />
              </button>
            </div>

            {/* Sentiment badge for selected topic */}
            {selectedTheme && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                marginBottom: '16px', padding: '10px 12px',
                borderRadius: '8px', background: 'var(--bg2)', border: '1px solid var(--border)',
              }}>
                <TrendingUp size={13} style={{ color: 'var(--muted)' }} />
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  Sentiment: <span style={{
                    fontWeight: 700,
                    color: selectedTheme.sentiment >= 70 ? '#22c55e' : selectedTheme.sentiment >= 50 ? '#f59e0b' : '#f43f5e',
                  }}>{selectedTheme.sentiment}% positive</span>
                  <span style={{ margin: '0 6px' }}>•</span>
                  {selectedTheme.count} mentions
                </span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {relatedComments.map((c, i) => {
                const typeColors = {
                  praise: { bg: 'var(--positive-bg)', color: '#22c55e', label: 'Praise' },
                  question: { bg: 'var(--accent-bg)', color: 'var(--accent2)', label: 'Question' },
                  complaint: { bg: 'var(--negative-bg)', color: '#f43f5e', label: 'Complaint' },
                  suggestion: { bg: 'var(--purple-bg)', color: '#8b5cf6', label: 'Suggestion' },
                };
                const t = typeColors[c.type] || typeColors.praise;
                return (
                  <div key={i} className="comment-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span className="badge" style={{ background: t.bg, color: t.color, fontSize: '10px' }}>
                        {t.label}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--muted)' }}>by {c.author}</span>
                      <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--muted)' }}>
                        ❤️ {c.likes?.toLocaleString()}
                      </span>
                    </div>
                    <p style={{
                      fontSize: '13px', color: 'var(--text2)', lineHeight: 1.5,
                      display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      "{c.text}"
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
