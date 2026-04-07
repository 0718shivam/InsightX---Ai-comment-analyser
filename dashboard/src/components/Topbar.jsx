import { useState, useRef, useEffect } from 'react';
import { LogOut, Settings, User, ChevronDown, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Topbar({ onLogout, onOpenProfile, onOpenSettings }) {
  const { theme, toggle } = useTheme();
  const [showProfile, setShowProfile] = useState(false);
  const dropRef = useRef(null);
  const email = localStorage.getItem('insightx_email') || 'unknown@insightx.ai';
  const displayName = email.split('@')[0] || 'User';
  const initial = displayName[0]?.toUpperCase() || 'U';

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="topbar">
      <div />

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={toggle}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            color: 'var(--muted)',
          }}
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        <div style={{ position: 'relative' }} ref={dropRef}>
          <button
            onClick={() => setShowProfile((p) => !p)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px 6px 6px',
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563eb, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 700,
                color: '#fff',
                flexShrink: 0,
              }}
            >
              {initial}
            </div>
            <ChevronDown
              size={13}
              strokeWidth={2.5}
              style={{
                color: 'var(--muted)',
                transform: showProfile ? 'rotate(180deg)' : 'rotate(0)',
                transition: 'transform 0.2s',
              }}
            />
          </button>

          {showProfile && (
            <div className="dropdown anim-scale-in" style={{ minWidth: '220px', right: 0, left: 'auto' }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #2563eb, #8b5cf6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#fff',
                    }}
                  >
                    {initial}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{displayName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{email}</div>
                  </div>
                </div>
              </div>

              <div style={{ padding: '6px' }}>
                {[
                  { icon: User, label: 'My Profile' },
                  { icon: Settings, label: 'Settings' },
                ].map(({ icon, label }) => {
                  const Icon = icon;
                  return (
                    <button
                      key={label}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        width: '100%',
                        padding: '9px 10px',
                        borderRadius: '6px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text)',
                        fontSize: '13px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--bg2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                      onClick={() => {
                        setShowProfile(false);
                        if (label === 'My Profile') onOpenProfile?.();
                        if (label === 'Settings') onOpenSettings?.();
                      }}
                    >
                      <Icon size={14} strokeWidth={2} />
                      {label}
                    </button>
                  );
                })}

                <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />

                <button
                  onClick={onLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '9px 10px',
                    borderRadius: '6px',
                    background: 'transparent',
                    border: 'none',
                    color: '#f43f5e',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(244,63,94,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <LogOut size={14} strokeWidth={2} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
