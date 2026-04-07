import { useState } from 'react';
import { Filter } from 'lucide-react';
import SentimentDonut from '../charts/SentimentDonut';
import CommentTypeBar from '../charts/CommentTypeBar';
import TopThemesBar from '../charts/TopThemesBar';
import EpisodeChart from '../charts/EpisodeChart';

const FILTER_GROUPS = [
  { label: 'All', value: 'all' },
  { label: 'Date', value: 'date' },
  { label: 'Sentiment', value: 'sentiment' },
  { label: 'Type', value: 'type' },
  { label: 'Language', value: 'language' },
];

export default function AnalyticsSection({ video }) {
  const [activeFilter, setActiveFilter] = useState('all');

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Section Header + Filters*/}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-ix-text">Analytics Overview</h3>
          <p className="text-xs text-ix-muted">YouTube Studio-style comment analysis</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Filter size={13} className="text-ix-muted" />
          {FILTER_GROUPS.map(f => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                activeFilter === f.value
                  ? 'bg-gradient-to-r from-ix-blue to-ix-purple text-white border-transparent'
                  : 'bg-ix-card border-ix-border text-ix-muted hover:text-ix-text hover:border-ix-border-light'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Charts Grid - 2×2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SentimentDonut data={video.sentiment} />
        <CommentTypeBar data={video.commentTypes} />
        <TopThemesBar themes={video.themes} />
        <EpisodeChart episodes={video.episodes} />
      </div>
    </div>
  );
}
