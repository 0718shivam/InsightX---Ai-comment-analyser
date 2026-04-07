// Section 6 – Top Comments
import { useState } from 'react';
import { ThumbsUp, MessageCircle, TrendingUp, TrendingDown } from 'lucide-react';

const TABS = [
  { key: 'mostLiked', label: 'Most Liked', icon: ThumbsUp, color: '#3b82f6' },
  { key: 'mostReplied', label: 'Most Replied', icon: MessageCircle, color: '#8b5cf6' },
  { key: 'mostPositive', label: 'Most Positive', icon: TrendingUp, color: '#22c55e' },
  { key: 'mostNegative', label: 'Most Negative', icon: TrendingDown, color: '#f43f5e' },
];

function CommentCard({ comment }) {
  const sentColors = {
    positive: { bg: 'var(--positive-bg)', color: '#22c55e' },
    negative: { bg: 'var(--negative-bg)', color: '#f43f5e' },
    neutral: { bg: 'var(--neutral-bg)', color: 'var(--neutral-c)' },
  };
  const sc = sentColors[comment.sentiment] || sentColors.neutral;

  return (
    <div className="comment-card" style={{ display: 'flex', gap: '12px' }}>
      {/* Avatar */}
      <div style={{
        width: '36px', height: '36px', borderRadius: '50%',
        background: `linear-gradient(135deg, ${sc.color}40, ${sc.color}20)`,
        border: `2px solid ${sc.color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '13px', fontWeight: 700, color: sc.color, flexShrink: 0,
      }}>
        {comment.avatar}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Author + sentiment */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{comment.author}</span>
          <span className="badge" style={{ background: sc.bg, color: sc.color, fontSize: '10px', textTransform: 'capitalize' }}>
            {comment.sentiment}
          </span>
        </div>

        {/* Comment text */}
        <p style={{
          fontSize: '13px', color: 'var(--text2)', lineHeight: 1.55, marginBottom: '10px',
        }}>
          "{comment.text}"
        </p>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--muted)', fontWeight: 500 }}>
            <ThumbsUp size={12} strokeWidth={2} />
            {comment.likes.toLocaleString()}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--muted)', fontWeight: 500 }}>
            <MessageCircle size={12} strokeWidth={2} />
            {comment.replies.toLocaleString()} replies
          </span>
        </div>
      </div>
    </div>
  );
}

export default function TopCommentsSection({ video }) {
  const [activeTab, setActiveTab] = useState('mostLiked');
  const comments = video.topComments?.[activeTab] || [];

  return (
    <div className="anim-fade-up">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <span className="section-label">Section 6</span>
        <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--muted)' }} />
        <h3 className="section-title" style={{ marginBottom: 0 }}>Top Comments</h3>
      </div>

      {/* Tab pills */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '7px 14px', borderRadius: '99px',
                fontSize: '12px', fontWeight: 600,
                border: `1px solid ${isActive ? tab.color : 'var(--border)'}`,
                background: isActive ? tab.color + '18' : 'var(--card)',
                color: isActive ? tab.color : 'var(--muted)',
                cursor: 'pointer', transition: 'all 0.18s',
              }}
              onMouseEnter={e => {
                if (!isActive) { e.currentTarget.style.borderColor = tab.color; e.currentTarget.style.color = tab.color; }
              }}
              onMouseLeave={e => {
                if (!isActive) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; }
              }}
            >
              <tab.icon size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Comment cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {comments.map((comment, i) => (
          <CommentCard key={i} comment={comment} />
        ))}
        {comments.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)', fontSize: '13px' }}>
            Not enough data in this category
          </div>
        )}
      </div>
    </div>
  );
}
