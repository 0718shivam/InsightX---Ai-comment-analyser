// Section 7 – Engagement Insights
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: '10px', padding: '10px 14px', boxShadow: 'var(--shadow)',
    }}>
      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: '12px', color: 'var(--muted)' }}>
          {p.value.toLocaleString()} comments
        </div>
      ))}
    </div>
  );
}

export default function EngagementSection({ video }) {
  const likeTotal = (video.engagementData || []).reduce((sum, d) => sum + (d.count || 0), 0);
  const replyTotal = (video.repliesData || []).reduce((sum, d) => sum + (d.count || 0), 0);
  const likesUnder10 = (video.engagementData || []).find((d) => d.range === '0-10')?.count || 0;
  const likesAbove100 = (video.engagementData || []).find((d) => d.range === '100+')?.count || 0;
  const repliesLow = ((video.repliesData || []).find((d) => d.range === '0')?.count || 0)
    + ((video.repliesData || []).find((d) => d.range === '1-2')?.count || 0);
  const repliesHigh = (video.repliesData || []).find((d) => d.range === '6+')?.count || 0;

  const likesUnder10Pct = likeTotal ? Math.round((likesUnder10 / likeTotal) * 100) : 0;
  const likesAbove100Pct = likeTotal ? Math.round((likesAbove100 / likeTotal) * 100) : 0;
  const repliesLowPct = replyTotal ? Math.round((repliesLow / replyTotal) * 100) : 0;
  const repliesHighPct = replyTotal ? Math.round((repliesHigh / replyTotal) * 100) : 0;

  const typePercentages = video.commentTypes?.percentages || {};

  return (
    <div className="anim-fade-up">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <span className="section-label">Section 7</span>
        <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--muted)' }} />
        <h3 className="section-title" style={{ marginBottom: 0 }}>Engagement Insights</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Likes distribution */}
        <div className="card">
          <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
            Likes Distribution Across Comments
          </h4>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '12px' }}>
            Shows how audience attention is distributed across comments.
          </p>
          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={video.engagementData} layout="vertical" margin={{ top: 5, right: 10, left: 6, bottom: 2 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="5 5" horizontal={false} />
                <XAxis type="number" tick={{ fill: 'var(--muted)', fontSize: 10 }} axisLine={false} tickLine={false}>
                  <Label
                    value="Number of comments"
                    position="insideBottom"
                    offset={-2}
                    style={{ fill: 'var(--muted)', fontSize: 11 }}
                  />
                </XAxis>
                <YAxis dataKey="range" type="category" tick={{ fill: 'var(--muted)', fontSize: 10 }} axisLine={false} tickLine={false}>
                  <Label value="Likes per comment" angle={-90} position="insideLeft" offset={-4} style={{ fill: 'var(--muted)', fontSize: 11 }} />
                </YAxis>
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--accent-bg)' }} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={26} fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{
            marginTop: '12px', padding: '10px 12px', borderRadius: '8px',
            background: 'var(--bg2)', border: '1px solid var(--border)',
            fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5,
          }}>
            Most comments ({likesUnder10Pct}%) receive at most 10 likes, while only {likesAbove100Pct}% exceed 100 likes, indicating visibility is concentrated in a small set of comments.
          </div>
        </div>

        {/* Replies distribution */}
        <div className="card">
          <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
            Replies Distribution Across Comments
          </h4>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '12px' }}>
            Shows whether discussions are spread across comments or concentrated in a few threads.
          </p>
          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={video.repliesData} layout="vertical" margin={{ top: 5, right: 10, left: 6, bottom: 2 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="5 5" horizontal={false} />
                <XAxis type="number" tick={{ fill: 'var(--muted)', fontSize: 10 }} axisLine={false} tickLine={false}>
                  <Label
                    value="Number of comments"
                    position="insideBottom"
                    offset={-2}
                    style={{ fill: 'var(--muted)', fontSize: 11 }}
                  />
                </XAxis>
                <YAxis dataKey="range" type="category" tick={{ fill: 'var(--muted)', fontSize: 10 }} axisLine={false} tickLine={false}>
                  <Label value="Replies per comment" angle={-90} position="insideLeft" offset={-4} style={{ fill: 'var(--muted)', fontSize: 11 }} />
                </YAxis>
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--accent-bg)' }} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={26} fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{
            marginTop: '12px', padding: '10px 12px', borderRadius: '8px',
            background: 'var(--bg2)', border: '1px solid var(--border)',
            fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5,
          }}>
            {repliesLowPct}% of comments have 0-2 replies, while {repliesHighPct}% reach 6+ replies and drive deeper discussion threads.
          </div>
        </div>
      </div>

      {/* Comment type distribution */}
      <div className="card" style={{ marginTop: '16px' }}>
        <p className="section-label" style={{ marginBottom: '14px' }}>Comment Type Breakdown</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {[
            { key: 'praise', label: 'Praise', value: video.commentTypes.praise, color: '#22c55e', icon: '🙌' },
            { key: 'question', label: 'Questions', value: video.commentTypes.question, color: '#3b82f6', icon: '❓' },
            { key: 'concern', label: 'Concerns', value: video.commentTypes.concern, color: '#f43f5e', icon: '⚠️' },
            { key: 'general', label: 'General', value: video.commentTypes.general, color: '#94a3b8', icon: '💬' },
          ].map(item => (
            <div key={item.label} style={{
              padding: '14px', borderRadius: '10px',
              background: 'var(--bg2)', border: '1px solid var(--border)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '20px', marginBottom: '6px' }}>{item.icon}</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: item.color, lineHeight: 1 }}>
                {(typePercentages[item.key] ?? item.value)}%
              </div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', fontWeight: 500 }}>
                {item.label}
              </div>
              <div className="progress-bar" style={{ marginTop: '8px' }}>
                <div className="progress-fill" style={{ width: `${typePercentages[item.key] ?? item.value}%`, background: item.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
