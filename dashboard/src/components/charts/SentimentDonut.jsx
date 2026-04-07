import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#10b981', '#6b7280', '#ef4444'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-ix-card border border-ix-border rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs font-semibold text-ix-text">{payload[0].name}</p>
        <p className="text-sm font-bold" style={{ color: payload[0].payload.fill }}>{payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

export default function SentimentDonut({ data }) {
  const chartData = [
    { name: 'Positive', value: data.positive, fill: COLORS[0] },
    { name: 'Neutral', value: data.neutral, fill: COLORS[1] },
    { name: 'Negative', value: data.negative, fill: COLORS[2] },
  ];

  return (
    <div className="bg-ix-card border border-ix-border rounded-xl p-5 hover:border-ix-border-light transition-colors">
      <h4 className="text-sm font-bold text-ix-text mb-1">Sentiment Distribution</h4>
      <p className="text-xs text-ix-muted mb-4">Overall comment sentiment breakdown</p>
      
      <div className="relative h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
              animationBegin={0}
              animationDuration={800}
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-ix-positive">{data.positive}%</span>
          <span className="text-[10px] text-ix-muted uppercase tracking-wider">positive</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-5 mt-3">
        {chartData.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.fill }} />
            <span className="text-[11px] text-ix-muted">{item.name}</span>
            <span className="text-[11px] font-bold text-ix-text">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
