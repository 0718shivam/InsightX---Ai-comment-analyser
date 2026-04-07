import { X, CheckCircle, HelpCircle, RefreshCw, AlertTriangle, Lightbulb, BarChart3, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function CreatorPanel({ video, onClose }) {
  if (!video) return null;
  const ci = video.creatorInsights;

  return (
    <div className="fixed inset-0 z-[100] flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Panel */}
      <div className="relative ml-auto w-full max-w-2xl bg-ix-bg border-l border-ix-border flex flex-col shadow-2xl animate-slide-in" style={{ animationName: 'slideInRight' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ix-border bg-ix-bg2/80 backdrop-blur-md flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-ix-violet to-ix-purple flex items-center justify-center">
              <span className="text-lg">🎯</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-ix-text">Creator Insights</h2>
              <p className="text-xs text-ix-muted line-clamp-1">{video.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-ix-card border border-ix-border flex items-center justify-center text-ix-muted hover:text-red-400 hover:border-red-400/30 transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* 1. What performed well */}
          <Section
            icon={<CheckCircle size={16} />}
            emoji="✅"
            title="What Performed Well"
            borderColor="border-l-ix-positive"
            bgTint="bg-emerald-500/5"
          >
            <div className="space-y-2">
              {ci.performedWell.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-ix-bg2/50 border border-ix-border/50">
                  <span className="text-sm text-ix-text">{item.text}</span>
                  <span className="text-xs font-bold text-ix-positive bg-ix-positive/10 px-2 py-0.5 rounded-full flex-shrink-0 ml-3">{item.metric}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* 2. Viewer confusion */}
          <Section
            icon={<HelpCircle size={16} />}
            emoji="❓"
            title="Viewer Confusion / Concerns"
            borderColor="border-l-ix-amber"
            bgTint="bg-amber-500/5"
          >
            <div className="space-y-2">
              {ci.viewerConfusion.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-ix-bg2/50 border border-ix-border/50">
                  <span className="text-sm text-ix-text">{item.text}</span>
                  <span className="text-xs font-bold text-ix-amber bg-ix-amber/10 px-2 py-0.5 rounded-full flex-shrink-0 ml-3">{item.metric}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* 3. Repeat next time */}
          <Section
            icon={<RefreshCw size={16} />}
            emoji="🔄"
            title="Repeat Next Time"
            borderColor="border-l-ix-info"
            bgTint="bg-blue-500/5"
          >
            <ul className="space-y-2">
              {ci.repeatNextTime.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-ix-text p-2 rounded-lg bg-ix-bg2/30">
                  <span className="w-5 h-5 rounded-full bg-ix-info/20 text-ix-info text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          {/* 4. Improve */}
          <Section
            icon={<AlertTriangle size={16} />}
            emoji="⚠️"
            title="Areas to Improve"
            borderColor="border-l-ix-negative"
            bgTint="bg-red-500/5"
          >
            <div className="space-y-2">
              {ci.improve.map((item, i) => (
                <div key={i} className="p-3 rounded-lg bg-ix-bg2/50 border border-ix-border/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-ix-text">{item.text}</span>
                    <SeverityBadge severity={item.severity} />
                  </div>
                  <p className="text-xs text-ix-muted">{item.detail}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* 5. Next video ideas */}
          <Section
            icon={<Lightbulb size={16} />}
            emoji="💡"
            title="Next Video Ideas"
            borderColor="border-l-ix-violet"
            bgTint="bg-violet-500/5"
          >
            <div className="space-y-2">
              {ci.nextVideoIdeas.map((idea, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-ix-bg2/50 border border-ix-border/50 hover:border-ix-violet/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-base">💡</span>
                    <span className="text-sm text-ix-text">{idea.title}</span>
                  </div>
                  <span className="text-xs font-bold text-ix-violet bg-ix-violet/10 px-2 py-0.5 rounded-full flex-shrink-0 ml-3">{idea.demand}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* 6. Episode Performance Chart */}
          {video.episodes?.length > 0 && (
            <Section
              icon={<BarChart3 size={16} />}
              emoji="📈"
              title="Episode Performance"
              borderColor="border-l-ix-blue"
              bgTint="bg-blue-500/5"
            >
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={video.episodes} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="%" />
                    <Tooltip
                      contentStyle={{
                        background: '#1e1e35',
                        border: '1px solid #2d3748',
                        borderRadius: '8px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                      }}
                      labelStyle={{ color: '#94a3b8', fontSize: '11px' }}
                      itemStyle={{ color: '#e2e8f0', fontSize: '12px' }}
                    />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="positive" name="Positive" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="neutral" name="Neutral" fill="#6b7280" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="negative" name="Negative" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Episode summary below chart */}
              <div className="mt-3 space-y-1">
                {video.episodes.map((ep, i) => (
                  <div key={i} className="flex items-center justify-between text-xs text-ix-muted px-2 py-1.5 rounded bg-ix-bg2/30">
                    <span className="font-medium text-ix-text">{ep.name}</span>
                    <span>
                      <span className="text-ix-positive">{ep.positive}% pos</span>
                      <span className="mx-2 text-ix-border">·</span>
                      <span className="text-ix-muted">{ep.neutral}% neu</span>
                      <span className="mx-2 text-ix-border">·</span>
                      <span className="text-ix-negative">{ep.negative}% neg</span>
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* 7. Audience Behavior */}
          <Section
            icon={<Users size={16} />}
            emoji="👥"
            title="Audience Behavior Patterns"
            borderColor="border-l-ix-purple"
            bgTint="bg-purple-500/5"
          >
            <div className="space-y-2">
              {ci.audienceBehavior.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-ix-bg2/50 border border-ix-border/50">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm text-ix-text">{item.pattern}</span>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

function Section({ emoji, title, borderColor, bgTint, children }) {
  return (
    <div className={`rounded-xl border border-ix-border p-5 border-l-4 ${borderColor} ${bgTint}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{emoji}</span>
        <h3 className="text-sm font-bold text-ix-text">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function SeverityBadge({ severity }) {
  const styles = {
    high: 'bg-red-500/15 text-red-400 border-red-500/20',
    medium: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    low: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${styles[severity] || styles.medium}`}>
      {severity.toUpperCase()}
    </span>
  );
}
