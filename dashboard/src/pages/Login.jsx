import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    // For now, just navigate to dashboard
    setTimeout(() => {
      navigate('/home');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-ix-bg flex items-center justify-center relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-ix-blue/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-ix-purple/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo + Brand */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-ix-blue/20 to-ix-purple/20 border border-ix-border flex items-center justify-center">
            <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none">
              <path d="M20 4L8 16L14 16L4 28L16 28L10 40L32 20L24 20L36 8L22 8L28 4H20Z" 
                    fill="url(#login-logo-grad)" />
              <defs>
                <linearGradient id="login-logo-grad" x1="4" y1="4" x2="36" y2="40">
                  <stop stopColor="#38bdf8" />
                  <stop offset="0.5" stopColor="#667eea" />
                  <stop offset="1" stopColor="#764ba2" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-ix-blue to-ix-purple bg-clip-text text-transparent mb-2">
            InsightX
          </h1>
          <p className="text-sm text-ix-muted">AI-Powered YouTube Comment Analytics</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-lg font-bold text-ix-text text-center mb-6">
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-ix-muted mb-1.5 uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-ix-bg2 border border-ix-border text-sm text-ix-text placeholder-ix-light focus:outline-none focus:border-ix-purple/50 focus:ring-1 focus:ring-ix-purple/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ix-muted mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-ix-bg2 border border-ix-border text-sm text-ix-text placeholder-ix-light focus:outline-none focus:border-ix-purple/50 focus:ring-1 focus:ring-ix-purple/20 transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ix-muted hover:text-ix-text transition-colors cursor-pointer"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-ix-blue to-ix-purple text-white text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 hover:shadow-lg hover:shadow-ix-purple/30 transition-all cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isSignup ? 'Create Account' : 'Sign In'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsSignup(!isSignup); setError(''); }}
              className="text-sm text-ix-muted hover:text-ix-purple-light transition-colors cursor-pointer"
            >
              {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-ix-light mt-6">
          © 2026 InsightX. AI-Powered YouTube Analytics.
        </p>
      </div>
    </div>
  );
}
