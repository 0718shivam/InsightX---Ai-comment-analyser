import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-ix-card border border-ix-border rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs text-ix-muted mb-1">{label}</p>
        <p className="text-sm font-bold text-ix-text">{payload[0].value} mentions</p>
        <p className="text-xs text-ix-positive">{payload[0].payload.sentiment}% positive</p>
      </div>
    );
  }
  return null;
};

export default function TopThemesBar({ themes }) {
  const data = themes.map(t => ({
    name: t.name.length > 18 ? t.name.slice(0, 16) + '…' : t.name,
    fullName: t.name,
    count: t.count,
    sentiment: t.sentiment,
  }));

  return (
    <div className="bg-ix-card border border-ix-border rounded-xl p-5 hover:border-ix-border-light transition-colors">
      <h4 className="text-sm font-bold text-ix-text mb-1">Top Discussion Themes</h4>
      <p className="text-xs text-ix-muted mb-4">Most talked about topics in comments</p>
      
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" barCategoryGap="18%">
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar
              dataKey="count"
              fill="url(#themeGrad)"
              radius={[0, 6, 6, 0]}
              animationDuration={800}
            />
            <defs>
              <linearGradient id="themeGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#667eea" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
