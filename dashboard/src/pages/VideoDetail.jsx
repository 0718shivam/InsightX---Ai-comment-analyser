import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dashboardAPI } from '../services/api';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

function VideoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getVideoData(id)
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="container" style={{ paddingTop: '40px' }}>Loading analysis...</div>;
  if (!data) return <div className="container" style={{ paddingTop: '40px' }}>Failed to load data.</div>;

  const sentimentData = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [{
      data: [data.sentiment.positive_percent, data.sentiment.neutral_percent, data.sentiment.negative_percent],
      backgroundColor: ['#10b981', '#6b7280', '#ef4444'],
      borderWidth: 0
    }]
  };

  const categoriesData = {
    labels: ['Praise', 'Questions', 'Complaints', 'Suggestions'],
    datasets: [{
      label: 'Comments',
      data: [data.categories.praise, data.categories.questions, data.categories.complaints, data.categories.suggestions],
      backgroundColor: '#667eea',
      borderRadius: 4
    }]
  };

  return (
    <div style={{ paddingBottom: '60px' }}>
      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="btn secondary-btn" onClick={() => navigate('/home')}>← Back</button>
          <div>
            <h3 style={{ margin: 0 }}>{data.video_title}</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{data.channel_name}</span>
          </div>
        </div>
      </header>

      <main className="container pt-4" style={{ marginTop: '24px' }}>
        
        {/* Executive Summary */}
        <div className="card" style={{ borderLeft: '5px solid var(--secondary)', background: '#faf5ff' }}>
          <h4>AI Strategic Summary</h4>
          <p style={{ whiteSpace: 'pre-wrap', color: '#1e293b' }}>{data.summary}</p>
        </div>

        {/* Priority Actions */}
        <h3>Priority Action Dashboard</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
          
          {/* Urgent */}
          <div className="card" style={{ border: '1px solid var(--danger)', marginBottom: 0 }}>
            <h4 style={{ color: 'var(--danger)' }}>🔴 Urgent Fixes</h4>
            {data.recommended_actions.urgent.length > 0 ? (
              data.recommended_actions.urgent.map((u, i) => (
                <div key={i} style={{ padding: '12px 0', borderBottom: i < data.recommended_actions.urgent.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                  <strong>Action:</strong> {u.action} <br/>
                  <span style={{ color: 'var(--text-muted)' }}>Impact: {u.impact} | Effort: {u.effort}</span>
                </div>
              ))
            ) : <p>No urgent actions required.</p>}
          </div>

          {/* High Priority Video Ideas */}
          <div className="card" style={{ border: '1px solid var(--warning)', marginBottom: 0 }}>
            <h4 style={{ color: 'var(--warning)' }}>🟡 High Demand (Next Videos)</h4>
            {data.recommended_actions.next_video_ideas.length > 0 ? (
              data.recommended_actions.next_video_ideas.map((v, i) => (
                <div key={i} style={{ padding: '12px 0', borderBottom: i < data.recommended_actions.next_video_ideas.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                  <strong>Topic:</strong> {v.topic} ({v.estimated_views} views est.) <br/>
                  <span style={{ color: 'var(--text-muted)' }}>Audience wants: {v.suggested_structure.join(', ')}</span>
                </div>
              ))
            ) : <p>No clear strong demands right now.</p>}
          </div>
        </div>

        {/* Charts Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(400px, 2fr)', gap: '24px', marginBottom: '32px' }}>
          
          <div className="card">
            <h4>Sentiment Distribution</h4>
            <div style={{ width: '100%', maxWidth: '250px', margin: '0 auto' }}>
              <Doughnut data={sentimentData} />
            </div>
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <span style={{ fontSize: '24px' }}>{data.sentiment.positive_percent > 60 ? '😊' : data.sentiment.negative_percent > 30 ? '😕' : '😐'}</span>
            </div>
          </div>

          <div className="card">
            <h4>Comment Categories</h4>
            <div style={{ height: '250px' }}>
              <Bar 
                data={categoriesData} 
                options={{ maintainAspectRatio: false, indexAxis: 'y' }} 
              />
            </div>
          </div>

        </div>

        {/* Detailed Insights */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
          <div className="card">
            <h4>Top Questions Asked</h4>
            {data.top_questions.length > 0 ? (
              <ul style={{ paddingLeft: '20px' }}>
                {data.top_questions.slice(0, 5).map((q, i) => (
                  <li key={i} style={{ marginBottom: '12px' }}>
                    <strong>{q.question}</strong><br/>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Asked {q.frequency} times • {q.opportunity}</span>
                  </li>
                ))}
              </ul>
            ) : <p>No questions found.</p>}
          </div>

          <div className="card">
            <h4>What Viewers Loved</h4>
            {Object.keys(data.praise_breakdown).length > 0 && Object.values(data.praise_breakdown).some(v => v.count > 0) ? (
              <ul style={{ paddingLeft: '20px' }}>
                {Object.entries(data.praise_breakdown).filter(([, v]) => v.count > 0).map(([k, v], i) => (
                  <li key={i} style={{ marginBottom: '12px' }}>
                    <strong>{k.replace('_', ' ').toUpperCase()}</strong> ({v.count} mentions)<br/>
                    <span style={{ fontStyle: 'italic', fontSize: '13px', color: 'var(--text-muted)' }}>"{v.examples[0] || ''}"</span>
                  </li>
                ))}
              </ul>
            ) : <p>Not enough clear praise data.</p>}
          </div>
        </div>

        {/* Keywords */}
        <div className="card">
          <h4>Keywords Intelligence</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
            {data.keywords.map((kw, i) => (
              <span key={i} style={{ 
                background: `rgba(102, 126, 234, ${Math.max(0.2, kw.score/100)})`, 
                padding: '8px 16px', 
                borderRadius: '20px',
                fontSize: `${Math.max(12, 10 + (kw.score/100)*10)}px`,
                color: kw.score > 50 ? 'white' : 'var(--text-main)',
                fontWeight: kw.score > 50 ? '600' : '400'
              }}>
                {kw.keyword}
              </span>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}

export default VideoDetail;
