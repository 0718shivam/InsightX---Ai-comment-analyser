// Section 3 – Sentiment Analysis
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = { positive: '#22c55e', neutral: '#38bdf8', negative: '#f43f5e' };

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: '10px', padding: '10px 14px', boxShadow: 'var(--shadow)',
    }}>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: '12px', color: p.color || 'var(--text)', marginBottom: '2px' }}>
          <span style={{ fontWeight: 600 }}>{p.name || p.dataKey}</span>: {p.value}%
        </div>
      ))}
    </div>
  );
}

export default function SentimentSection({ video }) {
  const pieData = [
    { name: 'Positive', value: video.sentiment.positive, color: COLORS.positive },
    { name: 'Neutral', value: video.sentiment.neutral, color: COLORS.neutral },
    { name: 'Negative', value: video.sentiment.negative, color: COLORS.negative },
  ];

  return (
    <div className="anim-fade-up">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <span className="section-label">Section 3</span>
        <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--muted)' }} />
        <h3 className="section-title" style={{ marginBottom: 0 }}>Sentiment Analysis</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '16px' }}>
        {/* Pie Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p className="section-label" style={{ marginBottom: '12px', alignSelf: 'flex-start' }}>Distribution</p>
          <div style={{ width: '200px', height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
            {pieData.map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  width: '10px', height: '10px', borderRadius: '3px',
                  background: d.color, display: 'inline-block',
                }} />
                <span style={{ fontSize: '12px', color: 'var(--text2)' }}>{d.name}</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: d.color }}>{d.value}%</span>
              </div>
            ))}
          </div>
          <p style={{ marginTop: '14px', fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5, textAlign: 'center' }}>
            {video.sentiment.neutral >= video.sentiment.positive && video.sentiment.neutral >= video.sentiment.negative
              ? 'Most comments are neutral, which suggests informational or non-opinionated responses.'
              : video.sentiment.positive > video.sentiment.negative
                ? 'Positive sentiment leads, indicating the audience is mostly satisfied with the video.'
                : 'Negative sentiment is elevated, indicating notable audience dissatisfaction.'}
          </p>
        </div>

        {/* Sentiment variation by comment batches */}
        <div className="card">
          <p className="section-label" style={{ marginBottom: '12px' }}>Sentiment Variation by Comment Batch</p>
          <p style={{ marginBottom: '10px', fontSize: '12px', color: 'var(--muted)' }}>
            This represents sentiment variation across sequential comment batches, not a timeline trend.
          </p>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={video.sentimentTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradPos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradNeg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="5 5" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="positive" stroke="#22c55e" fill="url(#gradPos)" strokeWidth={2} name="Positive" />
                <Area type="monotone" dataKey="neutral" stroke="#94a3b8" fill="transparent" strokeWidth={1.5} strokeDasharray="4 4" name="Neutral" />
                <Area type="monotone" dataKey="negative" stroke="#f43f5e" fill="url(#gradNeg)" strokeWidth={2} name="Negative" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
