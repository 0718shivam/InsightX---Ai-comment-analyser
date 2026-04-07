import { LogIn, UserCircle2 } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

function BrandLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f766e,#14b8a6)] shadow-[0_18px_45px_rgba(20,184,166,0.24)]">
        <svg viewBox="0 0 40 40" className="h-6 w-6" fill="none" aria-hidden="true">
          <path
            d="M8 30L14.5 22.5L19.5 27.5L31 13"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M24 13H31V20"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div>
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-slate-500">InsightX</p>
        <h1 className="text-lg font-extrabold tracking-tight text-slate-950">Creator Dashboard</h1>
      </div>
    </div>
  );
}

function SidebarLink({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-2xl px-4 py-3 text-sm font-semibold transition ${
          isActive
            ? 'bg-slate-950 text-white shadow-[0_16px_40px_rgba(15,23,42,0.18)]'
            : 'text-slate-600 hover:bg-white hover:text-slate-950'
        }`
      }
    >
      {label}
    </NavLink>
  );
}

export default function AppShell() {
  const hasToken = Boolean(localStorage.getItem('insightx_token'));

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.18),_transparent_32%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_48%,#f8fafc_100%)] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <BrandLogo />

          {hasToken ? (
            <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white">
              <UserCircle2 className="h-5 w-5 text-slate-500" />
              <span className="hidden sm:inline">Profile</span>
            </button>
          ) : (
            <NavLink
              to="/login"
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <LogIn className="h-4 w-4" />
              Login
            </NavLink>
          )}
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-8">
        <aside className="lg:sticky lg:top-[96px] lg:h-[calc(100vh-120px)] lg:w-72 lg:flex-shrink-0">
          <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white/80 p-3 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="mb-4 px-3 pt-3">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Navigation</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Move between your latest creator summary and the full analysis history.
              </p>
            </div>

            <nav className="flex gap-3 overflow-x-auto px-1 pb-2 lg:flex-col lg:overflow-visible">
              <SidebarLink to="/creator-insights" label="Creator Insights" />
              <SidebarLink to="/history" label="History" />
            </nav>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
