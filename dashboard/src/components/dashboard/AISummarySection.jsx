// Section 8 – AI Summary (Final Conclusion)
import { Sparkles, Quote } from 'lucide-react';

export default function AISummarySection({ video }) {
  const summary = video.aiSummary;
  const shortSummary = summary.executiveSummaryParas?.slice(0, 2) || [];
  const insightBullets = [
    video.structuredInsights?.praise?.length
      ? `Audience liked: ${video.structuredInsights.praise[0].text}`
      : null,
    video.structuredInsights?.questions?.length
      ? `Audience questioned: ${video.structuredInsights.questions[0].text}`
      : null,
    video.structuredInsights?.complaints?.length
      ? `Audience concerns: ${video.structuredInsights.complaints[0].text}`
      : null,
  ].filter(Boolean);

  return (
    <div className="anim-fade-up">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <span className="section-label">Section 8</span>
        <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--muted)' }} />
        <h3 className="section-title" style={{ marginBottom: 0 }}>AI Summary</h3>
        <span className="badge badge-blue" style={{ marginLeft: '8px' }}>
          <Sparkles size={10} style={{ marginRight: '3px' }} />
          AI Generated
        </span>
      </div>

      <div
        className="card"
        style={{
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid var(--accent2)',
          background: 'linear-gradient(135deg, var(--card), var(--accent-bg))',
        }}
      >
        {/* Accent glow */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '200px', height: '200px',
          background: 'radial-gradient(circle, var(--accent-glow), transparent)',
          pointerEvents: 'none',
        }} />

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          marginBottom: '20px', position: 'relative',
        }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(37, 99, 235, 0.35)',
          }}>
            <Sparkles size={18} style={{ color: '#fff' }} />
          </div>
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
              Final Takeaway
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0 }}>
              AI-generated conclusion from {video.commentCount.toLocaleString()} comments
            </p>
          </div>
        </div>

        {/* Main summary text */}
        <div style={{
          position: 'relative',
          padding: '20px 24px',
          borderRadius: '12px',
          background: 'var(--bg2)',
          border: '1px solid var(--border)',
          marginBottom: '16px',
        }}>
          <Quote
            size={28}
            style={{
              position: 'absolute', top: '12px', left: '12px',
              color: 'var(--accent2)', opacity: 0.2,
            }}
          />
          {shortSummary.length > 0 ? (
            shortSummary.map((line, idx) => (
              <p
                key={idx}
                style={{
                  fontSize: '14px', lineHeight: 1.8, color: 'var(--text)',
                  position: 'relative', zIndex: 1, marginBottom: idx === shortSummary.length - 1 ? 0 : '8px',
                }}
              >
                {line}
              </p>
            ))
          ) : (
            <p style={{ fontSize: '14px', lineHeight: 1.8, color: 'var(--text)', position: 'relative', zIndex: 1 }}>
              {summary.finalTakeaway}
            </p>
          )}
        </div>

        {/* Key insights */}
        <div style={{ padding: '14px 16px', borderRadius: '12px', background: 'var(--bg2)', border: '1px solid var(--border)', marginBottom: '16px' }}>
          <p style={{ fontSize: '12px', color: 'var(--accent2)', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Key Insights
          </p>
          <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--text2)', fontSize: '13px', lineHeight: 1.7 }}>
            {(insightBullets.length ? insightBullets : ['Not enough category-specific evidence yet']).map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>

        {/* Audience verdict */}
        <div style={{
          padding: '16px 20px',
          borderRadius: '12px',
          background: 'var(--bg2)',
          border: '1px solid var(--border)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            marginBottom: '10px',
          }}>
            <span style={{ fontSize: '16px' }}>🎯</span>
            <span style={{
              fontSize: '13px', fontWeight: 700,
              color: 'var(--accent2)',
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              Audience Verdict
            </span>
          </div>
          <p style={{
            fontSize: '13px', lineHeight: 1.7, color: 'var(--text2)', margin: 0,
          }}>
            {summary.audienceVerdict}
          </p>
        </div>

        {/* Creator advice */}
        <div style={{ marginTop: '14px', padding: '14px 16px', borderRadius: '12px', background: 'var(--bg2)', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '12px', color: 'var(--accent2)', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            What Creator Should Do Next
          </p>
          <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--text2)', fontSize: '13px', lineHeight: 1.7 }}>
            {(summary.creatorActions?.length ? summary.creatorActions : ['No actionable guidance available yet']).map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>

        {/* Footer branding */}
        <div style={{
          marginTop: '20px', paddingTop: '16px',
          borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
            Powered by <span className="gradient-text" style={{ fontWeight: 700 }}>InsightX AI</span>
          </span>
        </div>
      </div>
    </div>
  );
}
