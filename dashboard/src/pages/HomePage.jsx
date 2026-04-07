import { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sun,
  Moon,
  Smile,
  Layers,
  Users,
  MessageCircle,
  BarChart2,
  Sparkles,
  ArrowRight,
  Play,
  Zap,
  Shield,
  Globe,
  ChevronRight,
  Star,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/* ── Logo ── */
function LogoMark({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect width="40" height="40" rx="10" fill="#0d1b3e" />
      <rect x="6" y="15" width="28" height="10" rx="5" fill="#1e6fe0" transform="rotate(-45 20 20)" />
      <rect x="6" y="15" width="28" height="10" rx="5" fill="#60a5fa" transform="rotate(45 20 20)" />
    </svg>
  );
}

/* ── Fade-in on scroll ── */
function FadeIn({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.12, rootMargin: '0px 0px -30px 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className}`}
    >
      {children}
    </div>
  );
}

/* ── Feature card with border-glow on hover ── */
function FeatureCard({ icon: Icon, title, desc, isDark, delay }) {
  const cardRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  }, []);

  return (
    <FadeIn delay={delay}>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        className="feature-card-glow"
        style={{
          '--mouse-x': '50%',
          '--mouse-y': '50%',
        }}
      >
        <div className={`feature-card-inner ${isDark ? 'dark' : 'light'}`}>
          <div className="feature-icon-wrap">
            <Icon size={22} strokeWidth={1.8} />
          </div>
          <h3>{title}</h3>
          <p>{desc}</p>
        </div>
      </div>
    </FadeIn>
  );
}

/* ── Step card for "How it works" ── */
function StepCard({ step, title, body, icon: Icon, isDark, delay }) {
  return (
    <FadeIn delay={delay} className="step-card-wrap">
      <div className={`step-card ${isDark ? 'dark' : 'light'}`}>
        <div className="step-number">{step}</div>
        <div className="step-icon-wrap">
          <Icon size={28} strokeWidth={1.6} />
        </div>
        <h3>{title}</h3>
        <p>{body}</p>
      </div>
    </FadeIn>
  );
}

/* ── Data ── */
const FEATURES = [
  { icon: Smile, title: 'Sentiment Analysis', desc: 'See how viewers feel at a glance with comments scored from positive to negative.' },
  { icon: Layers, title: 'Topic Clustering', desc: 'Surface recurring themes so you know what the audience keeps talking about.' },
  { icon: Users, title: 'Audience Insights', desc: 'Understand tone, questions, and concerns to align your next video with real feedback.' },
  { icon: MessageCircle, title: 'Top Comments', desc: 'Spot the most liked, replied, and emotionally strong comments without scrolling.' },
  { icon: BarChart2, title: 'Engagement Analysis', desc: 'Histograms for likes and replies show where attention clusters across comments.' },
  { icon: Sparkles, title: 'AI Summary', desc: 'Short takeaways and creator-focused actions distilled from the full thread.' },
];

const STEPS = [
  { step: '1', icon: Play, title: 'Open or paste a YouTube video', body: 'Jump in from the Chrome extension or pick a demo video right in the app.' },
  { step: '2', icon: Zap, title: 'Analyze comments with AI', body: 'We fetch and score comments so every chart maps to real audience data.' },
  { step: '3', icon: Sparkles, title: 'Get insights instantly', body: 'Review sentiment, topics, engagement, and actionable next steps in one place.' },
];

const STATS = [
  { value: '10K+', label: 'Comments Analyzed' },
  { value: '50+', label: 'Videos Processed' },
  { value: '99%', label: 'Accuracy Rate' },
  { value: '<5s', label: 'Avg. Analysis Time' },
];

/* ── Animated background particles ── */
function FloatingOrbs({ isDark }) {
  return (
    <div className="orb-container" aria-hidden="true">
      <div className={`orb orb-1 ${isDark ? 'dark' : 'light'}`} />
      <div className={`orb orb-2 ${isDark ? 'dark' : 'light'}`} />
      <div className={`orb orb-3 ${isDark ? 'dark' : 'light'}`} />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   MAIN PAGE
────────────────────────────────────────────────────────────────── */
export default function HomePage() {
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  /* redirect extension payloads straight to dashboard */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('videoId') || params.get('v') || params.get('token')) {
      navigate(`/dashboard${location.search}`, { replace: true });
    }
  }, [location.search, navigate]);

  return (
    <div className={`homepage ${isDark ? 'dark' : 'light'}`}>
      <FloatingOrbs isDark={isDark} />

      {/* ───── Navbar ───── */}
      <header className="hp-navbar">
        <div className="hp-navbar-inner">
          <Link to="/home" className="hp-logo-link">
            <LogoMark size={32} />
            <span className="hp-logo-text">
              Insight<span className="accent">X</span>
            </span>
          </Link>

          <nav className="hp-nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
          </nav>

          <div className="hp-nav-actions">
            <button type="button" onClick={toggle} className="hp-theme-toggle" title={isDark ? 'Light mode' : 'Dark mode'}>
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <Link to="/login" className="hp-signin-btn">Sign In</Link>
            <Link to="/dashboard" className="hp-cta-btn-sm">
              Get Started <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ───── Hero ───── */}
        <section className="hp-hero">
          <div className="hp-hero-inner">
            <FadeIn>
              <div className="hp-hero-badge">
                <Zap size={14} />
                <span>Powered by AI • Free to use</span>
              </div>
            </FadeIn>

            <FadeIn delay={80}>
              <h1 className="hp-hero-title">
                Understand What Your<br />
                <span className="gradient-text-hero">YouTube Audience</span> Really Thinks
              </h1>
            </FadeIn>

            <FadeIn delay={160}>
              <p className="hp-hero-subtitle">
                InsightX analyzes YouTube comments to reveal sentiment, topics, and actionable
                insights — all in seconds, powered by intelligent NLP.
              </p>
            </FadeIn>

            <FadeIn delay={240}>
              <div className="hp-hero-cta-row">
                <Link to="/dashboard" className="hp-cta-primary">
                  <Play size={18} /> Analyze a Video
                </Link>
                <a href="#features" className="hp-cta-secondary">
                  Learn More <ChevronRight size={16} />
                </a>
              </div>
            </FadeIn>

            <FadeIn delay={320}>
              <div className="hp-hero-tags">
                {['Sentiment Analysis', 'Topic Detection', 'Audience Insights', 'Engagement Metrics'].map((t) => (
                  <span key={t} className="hp-tag">{t}</span>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ───── Stats bar ───── */}
        <section className="hp-stats-section">
          <div className="hp-stats-bar">
            {STATS.map((s, i) => (
              <FadeIn key={s.label} delay={i * 100}>
                <div className="hp-stat">
                  <span className="hp-stat-value">{s.value}</span>
                  <span className="hp-stat-label">{s.label}</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ───── Features ───── */}
        <section id="features" className="hp-features-section">
          <div className="hp-section-inner">
            <FadeIn>
              <div className="hp-section-header">
                <span className="hp-section-eyebrow">Features</span>
                <h2>Everything you need to read the room</h2>
                <p>Structured dashboards keep every signal tied to real comments — no guesswork, no filler metrics.</p>
              </div>
            </FadeIn>

            <div className="hp-features-grid">
              {FEATURES.map((f, i) => (
                <FeatureCard key={f.title} {...f} isDark={isDark} delay={i * 80} />
              ))}
            </div>
          </div>
        </section>

        {/* ───── How it works ───── */}
        <section id="how-it-works" className="hp-how-section">
          <div className="hp-section-inner">
            <FadeIn>
              <div className="hp-section-header">
                <span className="hp-section-eyebrow">How it works</span>
                <h2>Three steps to audience clarity</h2>
                <p>From raw comments to actionable intelligence in under a minute.</p>
              </div>
            </FadeIn>

            <div className="hp-steps-grid">
              {STEPS.map((s, i) => (
                <StepCard key={s.step} {...s} isDark={isDark} delay={i * 120} />
              ))}
            </div>
          </div>
        </section>

        {/* ───── Trust strip ───── */}
        <section className="hp-trust-section">
          <FadeIn>
            <div className="hp-trust-inner">
              <div className="hp-trust-item">
                <Shield size={20} />
                <span>Privacy-first — your data never leaves the session</span>
              </div>
              <div className="hp-trust-item">
                <Globe size={20} />
                <span>Works with any public YouTube video</span>
              </div>
              <div className="hp-trust-item">
                <Star size={20} />
                <span>No sign-up required to get started</span>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* ───── Final CTA ───── */}
        <section className="hp-final-cta-section">
          <FadeIn>
            <div className="hp-final-cta-card">
              <h2>Ready to decode your audience?</h2>
              <p>Start analyzing comments in seconds — no credit card, no setup, no fluff.</p>
              <Link to="/dashboard" className="hp-cta-primary large">
                Go to Dashboard <ArrowRight size={18} />
              </Link>
            </div>
          </FadeIn>
        </section>
      </main>

      {/* ───── Footer ───── */}
      <footer className="hp-footer">
        <div className="hp-footer-inner">

          {/* Row 1 — Brand + Links */}
          <div className="hp-footer-top">
            <div className="hp-footer-brand">
              <LogoMark size={26} />
              <span className="hp-logo-text small">Insight<span className="accent">X</span></span>
            </div>
            <div className="hp-footer-links">
              <a href="https://github.com/0718shivam" target="_blank" rel="noopener noreferrer" className="hp-footer-link">GitHub</a>
              <a href="https://x.com/Im_ShivamShrma" target="_blank" rel="noopener noreferrer" className="hp-footer-link">X</a>
            </div>
          </div>

          {/* Divider */}
          <div className="hp-footer-divider" />

          {/* Row 2 — Credit */}
          <p className="hp-footer-credit">Made with ❤️ by Shivam</p>

          {/* Row 3 — Copyright */}
          <p className="hp-footer-copy">© 2026 InsightX. All rights reserved.</p>

        </div>
      </footer>
    </div>
  );
}
