/**
 * InsightX - Data Layer
 * Handles real API calls to the backend and provides structure for analysis data.
 */

const API_BASE = "http://localhost:8000";

// --- API FETCHERS ---

/**
 * Fetch all previously analyzed videos (History)
 */
export async function fetchHistory() {
  const token = localStorage.getItem('insightx_token');
  // If no token at all, just return empty (user not logged in to dashboard yet)
  if (!token) return [];
  
  let resp;
  try {
    resp = await fetch(`${API_BASE}/dashboard/videos`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  } catch {
    // Backend is not running — throw a network error (not auth)
    throw new Error('Network error: backend not reachable');
  }
  
  if (resp.status === 401 || resp.status === 403) {
    throw new Error('401: Authentication failed');
  }
  if (!resp.ok) {
    throw new Error(`Server error: ${resp.status}`);
  }
  
  const data = await resp.json();
  return data.videos || [];
}

/**
 * Trigger analysis for a new video
 */
export async function analyzeVideo(videoId, commentLimit = 500) {
  const token = localStorage.getItem('insightx_token');
  const resp = await fetch(`${API_BASE}/analyze/video`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ video_id: videoId, comment_limit: commentLimit })
  });
  if (!resp.ok) {
    let errDetail = "Analysis failed";
    try {
      const err = await resp.json();
      errDetail = err.detail || errDetail;
    } catch (parseErr) {
      // Ignore JSON parse errors; keep the default message
      void parseErr;
    }
    throw new Error(errDetail);
  }
  return await resp.json();
}

/**
 * Fetch detailed analysis for a historical record
 */
export async function fetchAnalysisDetails(analysisId) {
  const token = localStorage.getItem('insightx_token');
  const resp = await fetch(`${API_BASE}/dashboard/video/${analysisId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!resp.ok) throw new Error("Failed to fetch analysis details");
  return await resp.json();
}

// --- MOCK DATA (Preloaded/demo videos for Explore section) ---
// These are intentionally static so users can explore without the extension.
// They only drive UI previews + trigger the same backend analysis when clicked.
export const mockVideos = [
  {
    id: 1,
    videoId: 'M7lc1UVf-VE',
    title: 'YouTube Developers Live',
    channel: 'YouTube',
    thumbnail: 'https://img.youtube.com/vi/M7lc1UVf-VE/hqdefault.jpg',
    analyzedAt: '2026-03-28T12:10:00.000Z',
    views: 2140000,
    commentCount: 48210,
    duration: '—',
    sentiment: { positive: 62, neutral: 24, negative: 14 },
  },
  {
    id: 2,
    videoId: 'kJQP7kiw5Fk',
    title: 'Despacito',
    channel: 'Luis Fonsi',
    thumbnail: 'https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
    analyzedAt: '2026-03-22T09:40:00.000Z',
    views: 765000000,
    commentCount: 1895000,
    duration: '3:47',
    sentiment: { positive: 71, neutral: 19, negative: 10 },
  },
  {
    id: 3,
    videoId: 'dQw4w9WgXcQ',
    title: 'Rick Astley - Never Gonna Give You Up',
    channel: 'Rick Astley',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    analyzedAt: '2026-03-18T16:05:00.000Z',
    views: 1005000000,
    commentCount: 1205000,
    duration: '3:33',
    sentiment: { positive: 55, neutral: 28, negative: 17 },
  },
  {
    id: 4,
    videoId: 'fJ9rUzIMcZQ',
    title: 'Baby - Justin Bieber',
    channel: 'Justin Bieber',
    thumbnail: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/hqdefault.jpg',
    analyzedAt: '2026-03-12T11:25:00.000Z',
    views: 1350000000,
    commentCount: 860000,
    duration: '3:36',
    sentiment: { positive: 60, neutral: 26, negative: 14 },
  },
  {
    id: 5,
    videoId: 'ysz5S6PUM-U',
    title: 'Google Developers - I/O Teaser',
    channel: 'Google Developers',
    thumbnail: 'https://img.youtube.com/vi/ysz5S6PUM-U/hqdefault.jpg',
    analyzedAt: '2026-03-07T08:50:00.000Z',
    views: 23000000,
    commentCount: 110000,
    duration: '—',
    sentiment: { positive: 64, neutral: 22, negative: 14 },
  },
  {
    id: 6,
    videoId: 'DLzxrzFCyOs',
    title: '— Demo Video',
    channel: 'Music',
    thumbnail: 'https://img.youtube.com/vi/DLzxrzFCyOs/hqdefault.jpg',
    analyzedAt: '2026-03-01T14:15:00.000Z',
    views: 54000000,
    commentCount: 220000,
    duration: '—',
    sentiment: { positive: 58, neutral: 27, negative: 15 },
  },
];

export const getVideoById = (id) => mockVideos.find((v) => v.id === id) || null;
