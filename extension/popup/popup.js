const API_BASE = "http://localhost:8000";

let currentToken = null;
let currentVideoId = null;
let currentUserEmail = "";

// Stored analysis data
let storedPraiseComments = [];
let storedQuestionComments = [];
let storedConcernComments = [];
let storedSampleAll = []; // { text, type } for Details filter

const el = (id) => document.getElementById(id);

// ─── INIT ──────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  // Apply stored theme
  chrome.storage.local.get(["token", "userEmail", "theme"], (result) => {
    applyTheme(result.theme || "light");
    if (result.token) {
      currentToken = result.token;
      currentUserEmail = result.userEmail || "";
      setProfileAvatar(currentUserEmail);
      showScreen("screen-analysis");
      checkCurrentTab();
    } else {
      showScreen("screen-login");
    }
  });
});


// ─── DARK MODE ──────────────────────────────────────────────────────────────────
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const btn = el("btn-theme");
  if (btn) btn.textContent = theme === "dark" ? "☀️" : "🌙";
}

el("btn-theme").onclick = () => {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
  chrome.storage.local.set({ theme: next });
};

// ─── SCREEN ────────────────────────────────────────────────────────────────────
function showScreen(id) {
  ["screen-login", "screen-signup", "screen-analysis"].forEach(s => el(s).classList.add("hidden"));
  el(id).classList.remove("hidden");
}

function setLoading(on) {
  el("loading-overlay").classList.toggle("hidden", !on);
}

// ─── AUTH NAVIGATION ───────────────────────────────────────────────────────────
el("nav-to-signup").onclick = () => showScreen("screen-signup");
el("nav-to-login").onclick = () => showScreen("screen-login");

// ─── PROFILE ───────────────────────────────────────────────────────────────────
el("btn-profile").onclick = (e) => {
  e.stopPropagation();
  el("profile-dropdown").classList.toggle("hidden");
};

document.addEventListener("click", () => el("profile-dropdown").classList.add("hidden"));

el("dd-dashboard").onclick = () => {
  const tokenParam = currentToken ? `&token=${encodeURIComponent(currentToken)}` : "";
  const emailParam = currentUserEmail ? `&email=${encodeURIComponent(currentUserEmail)}` : "";
  const url = currentVideoId
    ? `http://localhost:5173?videoId=${currentVideoId}${tokenParam}${emailParam}`
    : `http://localhost:5173?noop=1${tokenParam}${emailParam}`;
  chrome.tabs.create({ url });
};
el("dd-logout").onclick = () => {
  chrome.storage.local.remove(["token", "userEmail"], () => {
    currentToken = null;
    currentUserEmail = "";
    el("profile-dropdown").classList.add("hidden");
    showScreen("screen-login");
  });
};

function setProfileAvatar(email) {
  const avatar = el("profile-avatar");
  const ddEmail = el("dropdown-email");
  if (email) {
    // Replace SVG with first letter
    avatar.innerHTML = `<span class="profile-letter">${email[0].toUpperCase()}</span>`;
    if (ddEmail) ddEmail.textContent = email;
  } else {
    // Keep default SVG
    avatar.innerHTML = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="default-avatar-icon"><circle cx="12" cy="8" r="4" fill="currentColor"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
    if (ddEmail) ddEmail.textContent = "Signed in";
  }
}

// ─── DEPTH PILLS ───────────────────────────────────────────────────────────────
document.querySelectorAll(".pill-btn").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".pill-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    el("analysis-depth").value = btn.dataset.value;
  };
});

// ─── TABS ──────────────────────────────────────────────────────────────────────
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.onclick = (e) => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.add("hidden"));
    e.target.classList.add("active");
    el(e.target.dataset.tab).classList.remove("hidden");
  };
});

// ─── AUTH FORMS ────────────────────────────────────────────────────────────────
el("form-login").onsubmit = async (e) => {
  e.preventDefault();
  const email = el("login-email").value;
  const password = el("login-password").value;
  try {
    setLoading(true);
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("Invalid credentials");
    const data = await res.json();
    currentToken = data.token;
    currentUserEmail = email;
    // Save to chrome.storage for extension session
    chrome.storage.local.set({ token: currentToken, userEmail: email });
    setProfileAvatar(email);
    showScreen("screen-analysis");
    checkCurrentTab();
  } catch (err) {
    el("login-error").textContent = err.message;
  } finally { setLoading(false); }
};

el("form-signup").onsubmit = async (e) => {
  e.preventDefault();
  const email = el("signup-email").value;
  const password = el("signup-password").value;
  const confirm = el("signup-confirm").value;
  if (password !== confirm) return (el("signup-error").textContent = "Passwords do not match");
  try {
    setLoading(true);
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    currentToken = data.token;
    currentUserEmail = email;
    chrome.storage.local.set({ token: currentToken, userEmail: email });
    setProfileAvatar(email);
    showScreen("screen-analysis");
    checkCurrentTab();
  } catch (err) {
    el("signup-error").textContent = err.message;
  } finally { setLoading(false); }
};

// ─── VIDEO CONTEXT ─────────────────────────────────────────────────────────────
function checkCurrentTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab && tab.url && tab.url.includes("youtube.com/watch")) {
      const urlParams = new URL(tab.url).searchParams;
      currentVideoId = urlParams.get("v");

      chrome.tabs.sendMessage(tab.id, { action: "getVideoInfo" }, (response) => {
        if (chrome.runtime.lastError || !response) {
          el("video-title").textContent = "YouTube Video Detected";
          el("channel-name").textContent = "Click Analyse to load details";
        } else {
          const cleanTitle = (response.title || "").replace(/ - YouTube$/, "").trim();
          el("video-title").textContent = cleanTitle || "YouTube Video Detected";
          el("channel-name").textContent = "Click Analyse to load full details";
        }
      });

      el("subscriber-count").textContent = "";
      el("view-count-display").textContent = "👁 — views";
      el("comment-count-display").textContent = "💬 — comments";
    } else {
      currentVideoId = null;
      el("video-title").textContent = "Not on YouTube";
      el("channel-name").textContent = "Please open a YouTube video.";
      el("subscriber-count").textContent = "";
      el("view-count-display").textContent = "";
      el("comment-count-display").textContent = "";
    }
  });
}

// ─── ANALYSE ───────────────────────────────────────────────────────────────────
el("btn-analyze").onclick = async () => {
  if (!currentVideoId) return alert("No YouTube video detected. Please navigate to a YouTube video first.");
  const limit = parseInt(el("analysis-depth").value, 10);
  setLoading(true);
  try {
    const res = await fetch(`${API_BASE}/analyze/video`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${currentToken}` },
      body: JSON.stringify({ video_id: currentVideoId, comment_limit: limit }),
    });
    if (!res.ok) {
      if (res.status === 401) { chrome.storage.local.remove(["token"]); showScreen("screen-login"); throw new Error("Session expired."); }
      throw new Error((await res.text()) || "Analysis Failed");
    }
    renderAnalysis(await res.json());
  } catch (err) {
    alert("Error: " + err.message);
  } finally { setLoading(false); }
};

el("btn-dashboard").onclick = () => {
  // Open dashboard and pass the current videoId AND token so it auto-analyzes and auto-signs in
  const tokenParam = currentToken ? `&token=${encodeURIComponent(currentToken)}` : "";
  const emailParam = currentUserEmail ? `&email=${encodeURIComponent(currentUserEmail)}` : "";
  const url = currentVideoId
    ? `http://localhost:5173?videoId=${currentVideoId}${tokenParam}${emailParam}`
    : `http://localhost:5173?noop=1${tokenParam}${emailParam}`;
  chrome.tabs.create({ url });
};

// ─── RENDER ANALYSIS ───────────────────────────────────────────────────────────
function renderAnalysis(data) {
  // ── Header ──────────────────────────────────────────────────────────────────
  el("video-title").textContent = data.video_title || "Unknown Video";
  el("channel-name").textContent = data.channel_name || "";
  el("subscriber-count").textContent = data.subscriber_display || "";
  el("view-count-display").textContent = `👁 ${data.view_count_display || formatNum(data.view_count || 0)} views`;
  el("comment-count-display").textContent = `💬 ${data.comment_count_display || formatNum(data.comment_count || 0)} comments`;

  // ── Overview: Executive Summary ──────────────────────────────────────────────
  const summaryParas = el("exec-summary-paras");
  summaryParas.innerHTML = "";
  const paras = data.executive_summary_paras || [data.summary || "No summary available."];
  paras.forEach(p => {
    const div = document.createElement("p");
    div.className = "summary-para";
    div.textContent = p;
    summaryParas.appendChild(div);
  });

  // ── Overview: Audience Reaction ───────────────────────────────────────────────
  el("audience-reaction-text").textContent = data.audience_reaction || "";
  el("audience-reaction-text").classList.remove("muted");

  // ── Sentiment bars ────────────────────────────────────────────────────────────
  const s = data.sentiment;
  el("pct-pos").textContent = `${s.positive_percent}%`;
  el("pct-neu").textContent = `${s.neutral_percent}%`;
  el("pct-neg").textContent = `${s.negative_percent}%`;
  setTimeout(() => {
    el("bar-pos").style.width = `${s.positive_percent}%`;
    el("bar-neu").style.width = `${s.neutral_percent}%`;
    el("bar-neg").style.width = `${s.negative_percent}%`;
  }, 50);

  // ── Category cards ────────────────────────────────────────────────────────────
  const c = data.categories;
  el("cat-praise").textContent = c.praise ?? 0;
  el("cat-questions").textContent = c.questions ?? 0;
  el("cat-concerns").textContent = c.concerns ?? c.complaints ?? 0;

  // Store for modal
  storedPraiseComments = data.praise_comments || [];
  storedQuestionComments = data.question_comments || [];
  storedConcernComments = data.concern_comments || [];

  // Build sample-all for Details
  storedSampleAll = [
    ...(data.sample_praise || []).slice(0, 5).map(t => ({ text: t, type: "praise" })),
    ...(data.sample_questions || []).slice(0, 5).map(t => ({ text: t, type: "questions" })),
    ...(data.sample_concerns || []).slice(0, 5).map(t => ({ text: t, type: "concerns" })),
  ];

  // ── AI INSIGHTS TAB ───────────────────────────────────────────────────────────
  // Headline
  const aiHeadline = el("ai-headline");
  aiHeadline.textContent = data.ai_headline || "No AI summary available.";
  aiHeadline.classList.remove("muted");

  // Themes
  const themesList = el("themes-list");
  themesList.innerHTML = "";
  if (data.discussion_themes && data.discussion_themes.length > 0) {
    data.discussion_themes.forEach(t => {
      themesList.innerHTML += `<div class="theme-row">
        <span class="theme-name">📌 ${escapeHtml(t.theme)}</span>
        <span class="theme-count">${t.count} comments</span>
      </div>`;
    });
  } else {
    themesList.innerHTML = `<div class="muted-sm">No distinct themes detected.</div>`;
  }

  // Audience Intent
  const intentList = el("intent-list");
  intentList.innerHTML = "";
  const intentData = data.audience_intent || {};
  const intentConfig = [
    { key: "praising", label: "👏 Praising", cls: "fill-green" },
    { key: "asking", label: "❓ Asking Questions", cls: "fill-blue" },
    { key: "concerned", label: "⚠️ Concerned", cls: "fill-orange" },
    { key: "suggesting", label: "💡 Suggesting", cls: "fill-purple" },
  ];
  intentConfig.forEach(({ key, label, cls }) => {
    const pct = intentData[key] ?? 0;
    intentList.innerHTML += `<div class="intent-row">
      <div class="intent-label-row"><span>${label}</span><span>${pct}%</span></div>
      <div class="intent-track"><div class="intent-fill ${cls}" style="width:${pct}%"></div></div>
    </div>`;
  });

  // Emotion Mix
  const emotionList = el("emotion-list");
  emotionList.innerHTML = "";
  const emotionData = data.emotion_mix || {};
  const emotionConfig = [
    { key: "curious", label: "🤔 Curious" },
    { key: "satisfied", label: "😊 Satisfied" },
    { key: "excited", label: "🤩 Excited" },
    { key: "confused", label: "😕 Confused" },
    { key: "frustrated", label: "😤 Frustrated" },
  ];
  // Sort by value descending, show top 4
  const sortedEmotions = emotionConfig
    .map(e => ({ ...e, pct: emotionData[e.key] ?? 0 }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 4);

  if (sortedEmotions.some(e => e.pct > 0)) {
    sortedEmotions.forEach(({ label, pct }) => {
      emotionList.innerHTML += `<div class="emotion-chip">
        <span>${label}</span><span class="emotion-pct">${pct}%</span>
      </div>`;
    });
  } else {
    emotionList.innerHTML = `<div class="muted-sm">Not enough data.</div>`;
  }

  // Creator Actions
  const actionsList = el("creator-actions-list");
  actionsList.innerHTML = "";
  const actions = data.creator_actions || [];
  if (actions.length > 0) {
    actions.forEach((action, i) => {
      actionsList.innerHTML += `<div class="action-bullet">
        <div class="action-num">${i + 1}</div>
        <span>${escapeHtml(action)}</span>
      </div>`;
    });
  } else {
    actionsList.innerHTML = `<div class="muted-sm">No specific actions generated yet.</div>`;
  }

  // Content Gaps
  const gapsList = el("gaps-list");
  gapsList.innerHTML = "";
  const gaps = data.content_gaps || [];
  if (gaps.length > 0) {
    gaps.forEach(gap => {
      gapsList.innerHTML += `<div class="gap-item">🔸 "${escapeHtml(gap)}"</div>`;
    });
  } else {
    gapsList.innerHTML = `<div class="muted-sm">No clear content gaps detected. Viewers seem satisfied with the coverage.</div>`;
  }

  // ── DETAILS TAB ───────────────────────────────────────────────────────────────
  const totalAnalyzed = (s.positive_count + s.neutral_count + s.negative_count) || 0;
  el("det-total").textContent = formatNum(totalAnalyzed);
  el("det-pos").textContent = `${s.positive_percent}%`;
  el("det-neg").textContent = `${s.negative_percent}%`;
  el("det-unique").textContent = formatNum(data.comment_count || 0);

  // Breakdown
  const breakdownList = el("breakdown-list");
  breakdownList.innerHTML = "";
  const breakdownItems = [
    { name: "👏 Praises", count: c.praise ?? 0 },
    { name: "❓ Questions", count: c.questions ?? 0 },
    { name: "⚠️ Concerns", count: c.concerns ?? c.complaints ?? 0 },
    { name: "💡 Suggestions", count: c.suggestions ?? 0 },
    { name: "💬 General", count: c.general ?? 0 },
  ];
  breakdownItems.forEach(item => {
    breakdownList.innerHTML += `<div class="breakdown-item">
      <span class="breakdown-name">${item.name}</span>
      <span class="breakdown-count">${item.count}</span>
    </div>`;
  });

  // Keywords
  const kList = el("keywords-list");
  kList.innerHTML = "";
  (data.keywords || []).slice(0, 15).forEach(kw => {
    kList.innerHTML += `<span class="tag">${escapeHtml(kw.keyword)}</span>`;
  });
  if (!kList.children.length) kList.innerHTML = `<span class="muted-sm">No keywords yet.</span>`;

  // Common Phrases
  const pList = el("phrases-list");
  pList.innerHTML = "";
  (data.common_phrases || []).slice(0, 8).forEach(ph => {
    pList.innerHTML += `<span class="phrase-tag">${escapeHtml(ph.phrase)} <small style="opacity:.6">(${ph.count})</small></span>`;
  });
  if (!pList.children.length) pList.innerHTML = `<span class="muted-sm">No repeated phrases detected.</span>`;

  // Render sample comments (initially all)
  renderSampleComments("all");

  // Most Liked Comments
  const likedList = el("liked-comments-list");
  likedList.innerHTML = "";
  const liked = data.most_liked_comments || [];
  if (liked.length > 0) {
    liked.forEach(lc => {
      const badge = typeBadge(lc.type);
      likedList.innerHTML += `<div class="liked-comment">
        <div class="liked-meta">
          <span class="liked-heart">❤️</span>
          <span class="liked-count">${lc.likes} likes</span>
          <span class="liked-type-badge ${badge.cls}">${badge.label}</span>
        </div>
        <div class="liked-text">${escapeHtml(lc.text)}</div>
      </div>`;
    });
  } else {
    likedList.innerHTML = `<div class="muted-sm">No liked comments data available.</div>`;
  }
}

// ─── DETAILS FILTER ────────────────────────────────────────────────────────────
function renderSampleComments(filter) {
  const list = el("sample-comments-list");
  list.innerHTML = "";

  let items = storedSampleAll;
  if (filter !== "all") {
    items = storedSampleAll.filter(i => i.type === filter);
  }

  if (items.length === 0) {
    list.innerHTML = `<div class="muted-sm">No comments for this filter.</div>`;
    return;
  }

  items.forEach(item => {
    const badge = typeBadge(item.type);
    list.innerHTML += `<div class="sample-comment">
      <span class="sample-badge ${badge.cls}">${badge.label}</span>
      <span class="sample-text">${escapeHtml(item.text)}</span>
    </div>`;
  });
}

document.querySelectorAll(".filter-pill").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".filter-pill").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderSampleComments(btn.dataset.filter);
  };
});

// ─── CLICKABLE CARDS → MODAL ───────────────────────────────────────────────────
function openModal(type, count) {
  const config = {
    praise:    { title: `👏 Praise Comments (${count})`, list: storedPraiseComments,   empty: "No praise comments found." },
    questions: { title: `❓ Questions Asked (${count})`, list: storedQuestionComments, empty: "No questions found." },
    concerns:  { title: `⚠️ Concerns (${count})`,        list: storedConcernComments,  empty: "No concern comments found." },
  };
  const cfg = config[type];
  if (!cfg) return;

  el("modal-title").textContent = cfg.title;
  const body = el("modal-body");
  body.innerHTML = "";

  if (!cfg.list || cfg.list.length === 0) {
    body.innerHTML = `<div class="modal-empty">${cfg.empty}</div>`;
  } else {
    cfg.list.forEach((text, i) => {
      body.innerHTML += `<div class="modal-comment">
        <div class="modal-comment-num">${i + 1}</div>
        <div class="modal-comment-text">${escapeHtml(text)}</div>
      </div>`;
    });
  }
  el("comment-modal").classList.remove("hidden");
}

el("modal-close").onclick = () => el("comment-modal").classList.add("hidden");
el("comment-modal").onclick = (e) => { if (e.target === el("comment-modal")) el("comment-modal").classList.add("hidden"); };

document.querySelectorAll(".cat-card").forEach(card => {
  card.onclick = () => {
    const type = card.dataset.type;
    const countEl = { praise: "cat-praise", questions: "cat-questions", concerns: "cat-concerns" }[type];
    const count = parseInt(el(countEl)?.textContent || "0") || 0;
    openModal(type, count);
  };
});

// ─── UTILITIES ─────────────────────────────────────────────────────────────────
function formatNum(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function typeBadge(type) {
  return {
    praise:   { cls: "badge-praise",   label: "Praise" },
    question: { cls: "badge-question", label: "Question" },
    concern:  { cls: "badge-concern",  label: "Concern" },
    general:  { cls: "badge-general",  label: "General" },
  }[type] || { cls: "badge-general", label: type || "General" };
}
