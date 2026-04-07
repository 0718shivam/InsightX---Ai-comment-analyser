import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = { praise: '#10b981', question: '#3b82f6', concern: '#f59e0b', general: '#6b7280' };

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-ix-card border border-ix-border rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs text-ix-muted mb-1">{label}</p>
        <p className="text-sm font-bold text-ix-text">{payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

export default function CommentTypeBar({ data }) {
  const chartData = [
    { name: 'Praise', value: data.praise, fill: COLORS.praise },
    { name: 'Questions', value: data.question, fill: COLORS.question },
    { name: 'Concerns', value: data.concern, fill: COLORS.concern },
    { name: 'General', value: data.general, fill: COLORS.general },
  ];

  return (
    <div className="bg-ix-card border border-ix-border rounded-xl p-5 hover:border-ix-border-light transition-colors">
      <h4 className="text-sm font-bold text-ix-text mb-1">Comment Types</h4>
      <p className="text-xs text-ix-muted mb-4">Distribution by comment intent</p>
      
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="%" />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={800}>
              {chartData.map((entry, i) => (
                <BarChart key={i}>
                  <Bar dataKey="value" fill={entry.fill} />
                </BarChart>
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend chips */}
      <div className="flex flex-wrap gap-2 mt-3">
        {chartData.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-ix-bg2 border border-ix-border text-ix-text">
            <span className="w-2 h-2 rounded-full" style={{ background: item.fill }} />
            {item.name}: {item.value}%
          </span>
        ))}
      </div>
    </div>
  );
}
