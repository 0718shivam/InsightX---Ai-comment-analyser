import { useState, useMemo } from 'react';
import { History, PlayCircle, Search, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockVideos } from '../data/mockData';

function InsightXLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="10" fill="#0d1b3e" />
        <rect x="6" y="15" width="28" height="10" rx="5" fill="#1e6fe0" transform="rotate(-45 20 20)" />
        <rect x="6" y="15" width="28" height="10" rx="5" fill="#60a5fa" transform="rotate(45 20 20)" />
      </svg>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '1px', lineHeight: 1 }}>
        <span
          style={{
            fontFamily: 'var(--font)',
            fontSize: '20px',
            fontWeight: 800,
            color: 'var(--text)',
            letterSpacing: '-0.5px',
          }}
        >
          Insight
        </span>
        <span
          style={{
            fontFamily: 'var(--font)',
            fontSize: '20px',
            fontWeight: 800,
            color: '#1d6fe0',
            letterSpacing: '-0.5px',
          }}
        >
          X
        </span>
      </div>
    </div>
  );
}

function normalizeDemoVideos(list) {
  return list
    .map((v) => {
      const videoId = v.videoId ?? v.video_id ?? v.video_id ?? null;
      if (!videoId) return null;

      const sentiment = v.sentiment || {};
      const pos = sentiment.positive_percent ?? sentiment.positive ?? 0;
      const neu = sentiment.neutral_percent ?? sentiment.neutral ?? 0;
      const neg = sentiment.negative_percent ?? sentiment.negative ?? 0;

      return {
        id: v.id,
        video_id: videoId,
        title: v.title || 'Demo Video',
        channel_name: v.channel ?? v.channel_name ?? 'Unknown Channel',
        thumbnail_url:
          v.thumbnail ??
          v.thumbnail_url ??
          `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        analyzed_at: v.analyzedAt ?? v.analyzed_at ?? new Date().toISOString(),
        comment_count: Number(v.commentCount ?? v.comment_count ?? 0),
        sentiment_summary: { positive_percent: Number(pos), neutral_percent: Number(neu), negative_percent: Number(neg) },
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.analyzed_at) - new Date(a.analyzed_at));
}

function SidebarVideoItem({ video, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        padding: '8px 9px',
        borderRadius: '10px',
        border: `1px solid ${isActive ? 'var(--accent2)' : 'var(--border)'}`,
        background: isActive ? 'var(--accent-bg)' : 'var(--card)',
        cursor: 'pointer',
        transition: 'all 0.16s ease',
        textAlign: 'left',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.borderColor = 'var(--accent2)';
          e.currentTarget.style.transform = 'translateY(-0.5px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      <div style={{ position: 'relative', flexShrink: 0, width: '58px' }}>
        <img
          src={video.thumbnail_url || `https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`}
          alt={video.title}
          style={{
            width: '58px',
            height: '36px',
            borderRadius: '5px',
            objectFit: 'cover',
            display: 'block',
            background: 'var(--bg2)',
          }}
        />
        {isActive && (
          <div
            style={{
              position: 'absolute',
              inset: -1,
              borderRadius: '5px',
              border: '2px solid var(--accent2)',
            }}
          />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: isActive ? 'var(--accent2)' : 'var(--text)',
            lineHeight: 1.25,
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            marginBottom: '4px',
          }}
        >
          {video.title}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontSize: '9px',
              color: 'var(--light)',
              fontWeight: 600,
            }}
          >
            {new Date(video.analyzed_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>
    </button>
  );
}

export default function Sidebar({ selectedVideoId, onSelectVideo, savedVideos = [] }) {
  const [search, setSearch] = useState('');

  const filteredSaved = useMemo(() => {
    if (!search.trim()) return savedVideos;
    const q = search.toLowerCase();
    return savedVideos.filter(
      (v) => v.title?.toLowerCase().includes(q) || v.channel_name?.toLowerCase().includes(q)
    );
  }, [search, savedVideos]);

  const demoVideos = useMemo(() => normalizeDemoVideos(mockVideos), []);

  const showNoHistoryYet = savedVideos.length === 0;

  return (
    <aside className="sidebar">
      {/* Logo (top-left) */}
      <div
        style={{
          padding: '16px 16px 10px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg2)',
        }}
      >
        <Link
          to="/home"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, opacity 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.92';
            e.currentTarget.style.transform = 'translateY(-0.5px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <InsightXLogo />
        </Link>
      </div>

      {/* Scroll area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 12px' }}>
        {/* ── Section 1: Saved Videos ─────────── */}
        <section style={{ marginBottom: '18px' }}>
          <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
              <div>
                <h3
                  style={{
                    fontSize: '14px',
                    fontWeight: 800,
                    color: 'var(--text)',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <History size={15} style={{ color: 'var(--accent2)' }} />
                  Saved Videos
                </h3>
                <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>Last 10 analyzed videos</p>
              </div>

              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  background: 'var(--accent-bg)',
                  color: 'var(--accent2)',
                  padding: '2px 8px',
                  borderRadius: '99px',
                  height: 'fit-content',
                }}
              >
                {savedVideos.length}
              </span>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginTop: '12px' }}>
              <Search
                size={13}
                strokeWidth={2}
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--muted)',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search saved analyses..."
                className="ix-input"
                style={{ paddingLeft: '32px', fontSize: '12px' }}
              />
            </div>
          </div>

          {showNoHistoryYet ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
              <History size={24} strokeWidth={1.5} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p style={{ fontSize: '13px', fontWeight: 500 }}>No history yet</p>
              <p style={{ fontSize: '11px', marginTop: '4px' }}>Analyze a video from the extension to see it here.</p>
            </div>
          ) : filteredSaved.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--muted)' }}>
              <History size={20} strokeWidth={1.5} style={{ opacity: 0.3, marginBottom: '10px' }} />
              <p style={{ fontSize: '12px', fontWeight: 600 }}>No matching history</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredSaved.map((video) => {
                const isActive = video.video_id === selectedVideoId;
                return (
                  <SidebarVideoItem
                    key={video.id}
                    video={video}
                    isActive={isActive}
                    onClick={() => onSelectVideo(video.video_id)}
                  />
                );
              })}
            </div>
          )}
        </section>

        <div style={{ height: '1px', background: 'var(--border)', margin: '18px 0' }} />

        {/* ── Section 2: Explore/Demo Videos ─────────── */}
        <section>
          <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
              <div>
                <h3
                  style={{
                    fontSize: '14px',
                    fontWeight: 800,
                    color: 'var(--text)',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <PlayCircle size={15} style={{ color: 'var(--accent2)' }} />
                  Explore Videos
                </h3>
                <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>Try these sample videos</p>
              </div>

              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  background: 'var(--accent-bg)',
                  color: 'var(--accent2)',
                  padding: '2px 8px',
                  borderRadius: '99px',
                  height: 'fit-content',
                }}
              >
                {demoVideos.length}
              </span>
            </div>
          </div>

          {demoVideos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
              <PlayCircle size={24} strokeWidth={1.5} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p style={{ fontSize: '13px', fontWeight: 500 }}>No demo videos available</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {demoVideos.map((video) => {
                const isActive = video.video_id === selectedVideoId;
                return (
                  <SidebarVideoItem
                    key={video.id}
                    video={video}
                    isActive={isActive}
                    onClick={() => onSelectVideo(video.video_id)}
                  />
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* ── Sidebar Footer ─────────── */}
      <div
        style={{
          padding: '14px 16px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--card2)',
        }}
      >
        <Clock size={12} style={{ color: 'var(--muted)' }} />
        <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 500 }}>Turning comments into actionable insights</span>
      </div>
    </aside>
  );
}
