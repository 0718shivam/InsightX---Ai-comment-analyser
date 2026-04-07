import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-ix-card border border-ix-border rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs font-semibold text-ix-text mb-1">{label}</p>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-ix-muted">{p.name}:</span>
            <span className="font-bold text-ix-text">{p.value}%</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function EpisodeChart({ episodes }) {
  if (!episodes || episodes.length === 0) {
    return (
      <div className="bg-ix-card border border-ix-border rounded-xl p-5">
        <h4 className="text-sm font-bold text-ix-text mb-1">Episode Reactions</h4>
        <p className="text-xs text-ix-muted">No chapter/episode data available</p>
      </div>
    );
  }

  return (
    <div className="bg-ix-card border border-ix-border rounded-xl p-5 hover:border-ix-border-light transition-colors">
      <h4 className="text-sm font-bold text-ix-text mb-1">Episode / Chapter Reactions</h4>
      <p className="text-xs text-ix-muted mb-4">Sentiment breakdown by chapter</p>
      
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={episodes} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="%" />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Legend
              wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
              iconType="circle"
              iconSize={8}
            />
            <Bar dataKey="positive" name="Positive" fill="#10b981" radius={[4, 4, 0, 0]} stackId="a" />
            <Bar dataKey="neutral" name="Neutral" fill="#6b7280" radius={[0, 0, 0, 0]} stackId="a" />
            <Bar dataKey="negative" name="Negative" fill="#ef4444" radius={[0, 0, 4, 4]} stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
