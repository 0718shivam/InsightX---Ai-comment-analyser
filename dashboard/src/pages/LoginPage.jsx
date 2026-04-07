import { useState, useEffect } from 'react';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function InsightXLogo() {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="10" fill="#0d1b3e"/>
        <rect x="6" y="15" width="28" height="10" rx="5" fill="#1e6fe0" transform="rotate(-45 20 20)"/>
        <rect x="6" y="15" width="28" height="10" rx="5" fill="#60a5fa" transform="rotate(45 20 20)"/>
      </svg>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '1px', lineHeight: 1 }}>
        <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px' }}>Insight</span>
        <span style={{ fontSize: '24px', fontWeight: 800, color: '#1d6fe0', letterSpacing: '-0.5px' }}>X</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Where to go after a successful login (default: dashboard root)
  const nextUrl = searchParams.get('next') || '/dashboard';

  // Token Absorption - if extension sends user here with token, just save and go next
  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    if (token) {
      localStorage.setItem('insightx_token', token);
      if (email) localStorage.setItem('insightx_email', email);
      navigate(nextUrl, { replace: true });
    }
  }, [searchParams, navigate, nextUrl]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
         const res = await fetch("http://localhost:8000/auth/signup", {
           method: "POST", headers:{"Content-Type": "application/json"},
           body: JSON.stringify({email, password})
         });
         if (!res.ok) throw new Error("Email already registered or invalid fields");
         const data = await res.json();
         localStorage.setItem('insightx_token', data.token);
         localStorage.setItem('insightx_email', email);
      } else {
         const res = await fetch("http://localhost:8000/auth/login", {
           method: "POST", headers:{"Content-Type": "application/json"},
           body: JSON.stringify({email, password})
         });
         if (!res.ok) throw new Error("Invalid credentials");
         const data = await res.json();
         localStorage.setItem('insightx_token', data.token);
         localStorage.setItem('insightx_email', email);
      }
      navigate(nextUrl);
    } catch(err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'var(--bg)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: '-150px',
        right: '-150px',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, var(--accent-bg), transparent 70%)',
        filter: 'blur(40px)',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-150px',
        left: '-150px',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, var(--purple-bg), transparent 70%)',
        filter: 'blur(40px)',
        zIndex: 0
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <InsightXLogo />
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
            Sign in to access your AI analytics workspace
          </p>
        </div>

        <div className="card anim-scale-in" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', marginBottom: '24px', textAlign: 'center' }}>
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </h2>

          {error && (
            <div style={{
              background: 'var(--negative-bg)',
              color: 'var(--negative)',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '20px',
              border: '1px solid var(--negative)'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text2)' }}>
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="ix-input"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text2)' }}>
                PASSWORD
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="ix-input"
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(c => !c)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--muted)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ padding: '12px', marginTop: '8px', justifyContent: 'center' }}
            >
              {loading ? (
                 <div style={{
                   width: '18px', height: '18px',
                   border: '2px solid rgba(255,255,255,0.3)',
                   borderTopColor: '#fff', borderRadius: '50%'
                 }} className="animate-spin" />
              ) : (
                <>
                  {isSignup ? 'Create Account' : 'Sign In'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <button
              onClick={() => { setIsSignup(c => !c); setError(''); }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--muted)',
                fontSize: '13px',
                cursor: 'pointer',
                fontWeight: 500
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent2)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
            >
              {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>

        <p style={{ marginTop: '32px', textAlign: 'center', fontSize: '12px', color: 'var(--muted)' }}>
          © 2026 InsightX. AI-powered YouTube analytics.
        </p>
      </div>
    </div>
  );
}
