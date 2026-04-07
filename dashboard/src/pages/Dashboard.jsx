import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Topbar from '../components/Topbar';
import Sidebar from '../components/Sidebar';
import VideoContextHeader from '../components/dashboard/VideoContextHeader';
import OverviewCards from '../components/dashboard/OverviewCards';
import SentimentSection from '../components/dashboard/SentimentSection';
import TopicsSection from '../components/dashboard/TopicsSection';
import StructuredInsightsSection from '../components/dashboard/StructuredInsightsSection';
import TopCommentsSection from '../components/dashboard/TopCommentsSection';
import EngagementSection from '../components/dashboard/EngagementSection';
import AISummarySection from '../components/dashboard/AISummarySection';
import { analyzeVideo, fetchHistory } from '../data/mockData';
import { BarChart2, Sparkles, AlertCircle, Link2, ArrowRight, PlayCircle } from 'lucide-react';

const HISTORY_LIMIT = 10;
const LOCAL_HISTORY_KEY = 'insightx_saved_videos';

/**
 * Mapping helper to bridge real backend JSON to existing UI component props
 */
const mapBackendToUi = (raw) => {
  if (!raw) return null;

  const analyzedCount = Number(
    raw.analyzed_comment_count
      ?? ((raw.sentiment?.positive_count || 0) + (raw.sentiment?.neutral_count || 0) + (raw.sentiment?.negative_count || 0))
  );
  const fetchedCount = Number(raw.comment_count ?? analyzedCount);
  const coveragePct = fetchedCount > 0 ? Math.min(100, Math.round((analyzedCount / fetchedCount) * 100)) : 0;

  const categoryCounts = {
    praise: Number(raw.categories?.praise || 0),
    question: Number(raw.categories?.questions || 0),
    concern: Number(raw.categories?.concerns || raw.categories?.complaints || 0),
    general: Number(raw.categories?.general || 0),
  };
  const categoriesTotal = Object.values(categoryCounts).reduce((sum, v) => sum + v, 0) || 1;
  const categoryPercents = {
    praise: Math.round((categoryCounts.praise / categoriesTotal) * 100),
    question: Math.round((categoryCounts.question / categoriesTotal) * 100),
    concern: Math.round((categoryCounts.concern / categoriesTotal) * 100),
    general: Math.max(
      0,
      100
        - Math.round((categoryCounts.praise / categoriesTotal) * 100)
        - Math.round((categoryCounts.question / categoriesTotal) * 100)
        - Math.round((categoryCounts.concern / categoriesTotal) * 100)
    ),
  };

  const sentimentTrend = (raw.sentiment_batches || []).map((b) => ({
    day: b.batch,
    positive: Number(b.positive || 0),
    neutral: Number(b.neutral || 0),
    negative: Number(b.negative || 0),
  }));

  const themes = (raw.discussion_themes || []).map((t, i) => ({
    name: t.theme || `Topic ${i + 1}`,
    count: Number(t.count || 0),
    sentiment: Number(t.positive_percent || 0),
    color: ['#3b82f6', '#8b5cf6', '#f59e0b', '#22c55e', '#f43f5e'][i % 5],
  }));

  // 3. Map Structured Insights (real extracted lists)
  const mappedInsights = {
    questions: (raw.question_comments || []).map((text) => ({ text, author: 'Viewer', likes: 0, severity: 'medium' })),
    complaints: (raw.concern_comments || []).map((text) => ({ text, author: 'Viewer', likes: 0, severity: 'high' })),
    praise: (raw.praise_comments || []).map((text) => ({ text, author: 'Viewer', likes: 0, severity: 'low' })),
    suggestions: (raw.content_demand?.high_demand ? Object.keys(raw.content_demand.high_demand) : []).map(t => ({
      text: `Request for more content on: ${t}`, author: 'System', likes: 0
    }))
  };

  const normalizeComment = (c, defaultSentiment = 'neutral') => ({
    author: c.author || 'Viewer',
    text: c.text || '',
    likes: Number(c.likes || 0),
    replies: Number(c.replies || 0),
    sentiment: c.sentiment || defaultSentiment,
    avatar: (c.author || 'V')[0]?.toUpperCase() || 'V',
  });

  // 4. Top Comments (real backend rankings)
  const topComments = {
    mostLiked: (raw.most_liked_comments || []).map((c) => normalizeComment(c, c.type === 'concern' ? 'negative' : 'positive')),
    mostReplied: (raw.top_replied_comments || []).map((c) => normalizeComment(c)),
    mostPositive: (raw.top_positive_comments || []).map((c) => normalizeComment(c, 'positive')),
    mostNegative: (raw.top_negative_comments || []).map((c) => normalizeComment(c, 'negative')),
  };

  const likesDistribution = (raw.likes_distribution || []).map((d) => ({
    range: d.range,
    count: Number(d.count || 0),
  }));
  const repliesDistribution = (raw.replies_distribution || []).map((d) => ({
    range: d.range,
    count: Number(d.count || 0),
  }));

  const maxLikesCount = Math.max(1, ...likesDistribution.map((d) => d.count));
  const maxRepliesCount = Math.max(1, ...repliesDistribution.map((d) => d.count));

  const engagementData = likesDistribution.map((d) => ({
    ...d,
    fill: d.count === maxLikesCount ? '#3b82f6' : '#334155',
  }));
  const repliesData = repliesDistribution.map((d) => ({
    ...d,
    fill: d.count === maxRepliesCount ? '#f59e0b' : '#334155',
  }));

  const replyHeavy = repliesDistribution.reduce((sum, d) => {
    if (d.range === '3-5' || d.range === '6+') return sum + d.count;
    return sum;
  }, 0);
  const engagementRatio = analyzedCount > 0 ? (replyHeavy / analyzedCount) : 0;
  const engagementLevel = engagementRatio >= 0.2 ? 'Very High' : engagementRatio >= 0.12 ? 'High' : engagementRatio >= 0.06 ? 'Medium' : 'Low';

  return {
    id: raw.video_id,
    videoId: raw.video_id,
    title: raw.video_title,
    thumbnail: raw.thumbnail || `https://img.youtube.com/vi/${raw.video_id}/mqdefault.jpg`,
    channel: raw.channel_name,
    duration: "—",
    uploadDate: new Date().toISOString(),
    views: raw.view_count_display || raw.view_count,
    likes: "—",
    commentCount: analyzedCount,
    totalCommentsFetched: fetchedCount,
    coveragePercent: coveragePct,
    language: "English",
    sentiment: {
      positive: raw.sentiment?.positive_percent || 0,
      neutral: raw.sentiment?.neutral_percent || 0,
      negative: raw.sentiment?.negative_percent || 0
    },
    sentimentScore: Number(raw.sentiment?.positive_percent || 0),
    totalLikesOnComments: raw.sentiment?.positive_count || 0, // Fallback to count for display
    sentimentTrend,
    topTopic: themes[0]?.name || "N/A",
    themes,
    engagementLevel,
    structuredInsights: mappedInsights,
    topComments,
    engagementData,
    repliesData,
    commentTypes: {
      praise: categoryCounts.praise,
      question: categoryCounts.question,
      concern: categoryCounts.concern,
      general: categoryCounts.general,
      percentages: categoryPercents,
    },
    aiSummary: {
      finalTakeaway: raw.summary,
      audienceVerdict: raw.audience_reaction,
      executiveSummaryParas: raw.executive_summary_paras || [],
      creatorActions: raw.creator_actions || [],
    },
  };
};

function extractVideoId(input) {
  if (!input) return null;
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  try {
    const url = new URL(trimmed);
    if (url.searchParams.get('v')) return url.searchParams.get('v');
    if (url.hostname === 'youtu.be') return url.pathname.slice(1).split('/')[0];
    const shorts = url.pathname.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (shorts) return shorts[1];
    const embed = url.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embed) return embed[1];
  } catch { /* not a URL */ }
  return null;
}

function EmptyState({ onAnalyze }) {
  const [url, setUrl] = useState('');
  const [err, setErr] = useState('');
  const [focused, setFocused] = useState(false);

  const handleGo = () => {
    const id = extractVideoId(url);
    if (!id) { setErr('Enter a valid YouTube URL or video ID'); return; }
    setErr('');
    onAnalyze(id);
  };

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      padding: '0 24px',
    }}>
      {/* icon */}
      <div style={{
        width: '72px', height: '72px', borderRadius: '20px',
        background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(139,92,246,0.1))',
        border: '1px solid rgba(59,130,246,0.18)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '20px',
      }}>
        <PlayCircle size={30} style={{ color: 'var(--accent2)' }} />
      </div>

      <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text)', marginBottom: '6px' }}>
        Paste a YouTube link & start analyzing
      </h2>
      <p style={{ fontSize: '14px', color: 'var(--muted)', maxWidth: '400px', lineHeight: 1.55, marginBottom: '24px' }}>
        Drop any YouTube video URL below to see sentiment, topics, and audience insights.
      </p>

      {/* compact input bar */}
      <div style={{
        width: '100%', maxWidth: '480px',
        display: 'flex', alignItems: 'center',
        background: 'var(--card)',
        border: `1.5px solid ${err ? '#f43f5e' : focused ? 'var(--accent2)' : 'var(--border)'}`,
        borderRadius: '12px',
        padding: '4px 5px 4px 14px',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: focused ? '0 0 0 3px var(--accent-glow)' : 'none',
      }}>
        <Link2 size={16} style={{ color: 'var(--muted)', flexShrink: 0, marginRight: '8px' }} />
        <input
          type="text"
          value={url}
          onChange={(e) => { setUrl(e.target.value); setErr(''); }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => e.key === 'Enter' && handleGo()}
          placeholder="https://youtube.com/watch?v=..."
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            fontSize: '13.5px', color: 'var(--text)', fontFamily: 'var(--font)',
            padding: '9px 0', minWidth: 0,
          }}
        />
        <button
          onClick={handleGo}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            padding: '8px 18px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            color: '#fff', fontSize: '13px', fontWeight: 700,
            border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
            transition: 'opacity 0.15s, transform 0.15s',
            boxShadow: '0 2px 10px rgba(37,99,235,0.25)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          Analyze <ArrowRight size={13} />
        </button>
      </div>

      {err && (
        <p style={{ color: '#f43f5e', fontSize: '12px', marginTop: '8px', fontWeight: 500 }}>{err}</p>
      )}

      {/* subtle hint */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        marginTop: '24px', color: 'var(--light)', fontSize: '12px',
      }}>
        <span style={{ width: '24px', height: '1px', background: 'var(--border)' }} />
        or use the Chrome extension
        <span style={{ width: '24px', height: '1px', background: 'var(--border)' }} />
      </div>
    </div>
  );
}

function LoadingState({ videoId }) {
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center',
    }}>
      <div style={{
        width: '60px', height: '60px',
        border: '3px solid var(--border)',
        borderTopColor: 'var(--accent2)',
        borderRadius: '50%',
        marginBottom: '24px'
      }} className="animate-spin" />
      <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)', marginBottom: '6px' }}>
        Analyzing Video...
      </h3>
      <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
        Processing {videoId} through our AI pipeline
      </p>
      <p style={{ fontSize: '12px', color: 'var(--light)', marginTop: '20px' }}>
        This usually takes 3-5 seconds depending on comment volume
      </p>
    </div>
  );
}

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [activeAnalysis, setActiveAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeVideoId, setActiveVideoId] = useState(null);
  const [savedVideos, setSavedVideos] = useState([]);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [showBottomFooter, setShowBottomFooter] = useState(false);
  const contentRef = useRef(null);

  const videoIdFromUrl = searchParams.get('videoId') || searchParams.get('v');

  const hydrateHistoryEntry = useCallback((raw, explicitVideoId) => {
    const videoId = explicitVideoId || raw?.video_id;
    if (!videoId) return null;

    return {
      id: videoId,
      video_id: videoId,
      title: raw?.video_title || 'Untitled video',
      channel_name: raw?.channel_name || 'Unknown channel',
      thumbnail_url: raw?.thumbnail || `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      analyzed_at: new Date().toISOString(),
    };
  }, []);

  const pushHistoryVideo = useCallback((newVideo) => {
    if (!newVideo?.video_id) return;

    setSavedVideos((prev) => {
      const updated = [newVideo, ...prev.filter((v) => v.video_id !== newVideo.video_id)];
      const trimmed = updated.slice(0, HISTORY_LIMIT);
      localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(trimmed));
      return trimmed;
    });
  }, []);

  // Centralized analysis function (single entry point)
  const performAnalysis = useCallback(async (videoId) => {
    if (!videoId) return;
    try {
      setLoading(true);
      setError(null);
      const rawData = await analyzeVideo(videoId);
      const mapped = mapBackendToUi(rawData);
      setActiveAnalysis(mapped);
      const historyItem = hydrateHistoryEntry(rawData, videoId);
      if (historyItem) pushHistoryVideo(historyItem);
    } catch (err) {
      console.error("Analysis failed:", err);
      // If it's an auth error, clear token and redirect to login
      if (err.message?.includes('401') || err.message?.toLowerCase().includes('auth')) {
        localStorage.removeItem('insightx_token');
        const redirectUrl = videoIdFromUrl
          ? `/login?next=/dashboard?videoId=${videoIdFromUrl}`
          : '/login';
        navigate(redirectUrl);
      } else {
        setError(err.message || "Something went wrong during analysis");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, videoIdFromUrl, hydrateHistoryEntry, pushHistoryVideo]);

  // Click handlers ONLY update state (never call analysis directly)
  const handleSidebarSelect = (vId) => {
    setActiveVideoId(vId);
  };

  // Token Absorption from extension – must happen before auth guard
  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    if (token) {
      localStorage.setItem('insightx_token', token);
      if (email) localStorage.setItem('insightx_email', email);
      
      // Clean up URL to hide token
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('token');
      newParams.delete('email');
      const cleanUrl = `/?${newParams.toString()}`;
      navigate(cleanUrl, { replace: true });
    }
  }, [searchParams, navigate]);

  // Auth Guard — preserve the videoId so we redirect back after login
  useEffect(() => {
    const token = localStorage.getItem('insightx_token');
    const incomingToken = searchParams.get('token');
    // If no token in storage AND no token incoming in URL, then redirect
    if (!token && !incomingToken) {
      const redirectUrl = videoIdFromUrl
        ? `/login?next=/dashboard?videoId=${videoIdFromUrl}`
        : '/login';
      navigate(redirectUrl);
    }
  }, [navigate, videoIdFromUrl, searchParams]);

  // Initial load: take active videoId from URL (extension entry)
  useEffect(() => {
    if (videoIdFromUrl) {
      setActiveVideoId(videoIdFromUrl);
    }
  }, [videoIdFromUrl]);

  // Trigger analysis on active video change (single source of truth)
  useEffect(() => {
    if (!activeVideoId) return;
    console.log("Active Video ID:", activeVideoId);
    performAnalysis(activeVideoId);
  }, [activeVideoId, performAnalysis]);

  // Hydrate lightweight history from local cache + backend minimal list
  useEffect(() => {
    const cachedRaw = localStorage.getItem(LOCAL_HISTORY_KEY);
    if (cachedRaw) {
      try {
        const cached = JSON.parse(cachedRaw);
        if (Array.isArray(cached)) {
          setSavedVideos(cached.slice(0, HISTORY_LIMIT));
        }
      } catch {
        // ignore malformed cache
      }
    }

    async function syncHistory() {
      try {
        const apiVideos = await fetchHistory();
        const minimal = (apiVideos || [])
          .map((v) => ({
            id: v.id || v.video_id,
            video_id: v.video_id,
            title: v.title || 'Untitled video',
            channel_name: v.channel_name || 'Unknown channel',
            thumbnail_url: v.thumbnail_url || `https://img.youtube.com/vi/${v.video_id}/mqdefault.jpg`,
            analyzed_at: v.analyzed_at || new Date().toISOString(),
          }))
          .filter((v) => v.video_id);

        setSavedVideos((prev) => {
          const mergedMap = new Map();
          [...minimal, ...prev].forEach((v) => {
            if (!mergedMap.has(v.video_id)) mergedMap.set(v.video_id, v);
          });

          const merged = Array.from(mergedMap.values())
            .sort((a, b) => new Date(b.analyzed_at) - new Date(a.analyzed_at))
            .slice(0, HISTORY_LIMIT);

          localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(merged));
          return merged;
        });
      } catch {
        // non-blocking: keep local history
      }
    }

    syncHistory();
  }, []);

  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const updateFooterVisibility = () => {
      const threshold = 8;
      const atBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - threshold;
      setShowBottomFooter(atBottom);
    };

    updateFooterVisibility();
    container.addEventListener('scroll', updateFooterVisibility);
    window.addEventListener('resize', updateFooterVisibility);
    return () => {
      container.removeEventListener('scroll', updateFooterVisibility);
      window.removeEventListener('resize', updateFooterVisibility);
    };
  }, [activeAnalysis, loading, error]);

  const handleLogout = () => {
    localStorage.removeItem('insightx_token');
    localStorage.removeItem('insightx_email');
    navigate('/login');
  };

  const retryVideoId = useMemo(() => activeVideoId || videoIdFromUrl, [activeVideoId, videoIdFromUrl]);

  return (
    <div className="dashboard-shell">
      {/* Sidebar - Shows ONLY saved videos */}
      <Sidebar
        selectedVideoId={activeVideoId}
        savedVideos={savedVideos}
        onSelectVideo={handleSidebarSelect}
      />

      {/* Main Container */}
      <div className="main-content">
        <Topbar
          onLogout={handleLogout}
          onOpenProfile={() => setProfileModalOpen(true)}
          onOpenSettings={() => setSettingsModalOpen(true)}
        />

        <div className="content-area" ref={contentRef}>
          {error ? (
             <div style={{ 
               height: '100%', display: 'flex', flexDirection: 'column', 
               alignItems: 'center', justifyContent: 'center', textAlign: 'center' 
             }}>
               <div style={{ background: 'rgba(244,63,94,0.1)', padding: '24px', borderRadius: '24px', border: '1px solid #f43f5e' }}>
                 <AlertCircle size={40} style={{ color: '#f43f5e', marginBottom: '16px' }} />
                 <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)', marginBottom: '8px' }}>Analysis Error</h2>
                 <p style={{ color: 'var(--muted)', fontSize: '14px', maxWidth: '300px' }}>{error}</p>
                 <button 
                  onClick={() => performAnalysis(retryVideoId)}
                  className="btn-primary" 
                  style={{ marginTop: '20px', width: '100%' }}
                 >
                   Try Again
                 </button>
               </div>
             </div>
          ) : loading ? (
            <LoadingState videoId={activeVideoId || videoIdFromUrl} />
          ) : activeAnalysis ? (
            <div style={{ maxWidth: '1100px', margin: '0 auto', animation: 'fadeUp 0.6s ease' }}>
              {/* Section 1 – Header / Context */}
              <div className="section-gap">
                <VideoContextHeader video={activeAnalysis} />
              </div>

              {/* Section 2 – Overview Cards */}
              <div className="section-gap">
                <OverviewCards video={activeAnalysis} />
              </div>

              {/* Section 3 – Sentiment Analysis */}
              <div className="section-gap">
                <SentimentSection video={activeAnalysis} />
              </div>

              {/* Section 4 – Topics & Discussion (CORE) */}
              <div className="section-gap">
                <TopicsSection video={activeAnalysis} />
              </div>

              {/* Section 5 – Structured Insights (GOLD) */}
              <div className="section-gap">
                <StructuredInsightsSection video={activeAnalysis} />
              </div>

              {/* Section 6 – Top Comments */}
              <div className="section-gap">
                <TopCommentsSection video={activeAnalysis} />
              </div>

              {/* Section 7 – Engagement Insights */}
              <div className="section-gap">
                <EngagementSection video={activeAnalysis} />
              </div>

              {/* Section 8 – AI Summary */}
              <div className="section-gap">
                <AISummarySection video={activeAnalysis} />
              </div>

            </div>
          ) : (
            <EmptyState onAnalyze={(videoId) => setActiveVideoId(videoId)} />
          )}

          {/* Footer appears at bottom end of scroll */}
          <div
            style={{
              textAlign: 'center',
              padding: '30px 0 12px',
              marginTop: '28px',
              opacity: showBottomFooter ? 1 : 0,
              transition: 'opacity 0.22s ease',
            }}
          >
            <p style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 500 }}>
              Made with ❤️ by Shivam
            </p>
          </div>
        </div>
      </div>

      {profileModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
          }}
          onClick={() => setProfileModalOpen(false)}
        >
          <div
            className="card"
            style={{ width: 'min(92vw, 420px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>My Profile</h3>
            <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '18px' }}>
              Signed in as {localStorage.getItem('insightx_email') || 'unknown user'}
            </p>
            <button className="btn-primary" onClick={() => setProfileModalOpen(false)}>Close</button>
          </div>
        </div>
      )}

      {settingsModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
          }}
          onClick={() => setSettingsModalOpen(false)}
        >
          <div
            className="card"
            style={{ width: 'min(92vw, 420px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Settings</h3>
            <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '18px' }}>
              Settings panel is ready for preferences.
            </p>
            <button className="btn-primary" onClick={() => setSettingsModalOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
