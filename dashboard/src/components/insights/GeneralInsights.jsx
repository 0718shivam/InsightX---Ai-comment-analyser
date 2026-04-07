import { Heart, HelpCircle, AlertTriangle, MessageCircle } from 'lucide-react';

const CARDS = [
  {
    key: 'liked',
    title: 'What Viewers Liked',
    icon: <Heart size={16} />,
    emoji: '🥰',
    borderColor: 'border-l-ix-positive',
    iconBg: 'from-emerald-500 to-emerald-600',
    chipBg: 'bg-emerald-500/10 text-emerald-400',
  },
  {
    key: 'asked',
    title: 'What Viewers Asked',
    icon: <HelpCircle size={16} />,
    emoji: '❓',
    borderColor: 'border-l-ix-info',
    iconBg: 'from-blue-500 to-blue-600',
    chipBg: 'bg-blue-500/10 text-blue-400',
  },
  {
    key: 'confused',
    title: 'What Confused Viewers',
    icon: <AlertTriangle size={16} />,
    emoji: '😕',
    borderColor: 'border-l-ix-amber',
    iconBg: 'from-amber-500 to-amber-600',
    chipBg: 'bg-amber-500/10 text-amber-400',
  },
  {
    key: 'realMessage',
    title: "Video's Real Message",
    icon: <MessageCircle size={16} />,
    emoji: '💬',
    borderColor: 'border-l-ix-violet',
    iconBg: 'from-violet-500 to-violet-600',
    chipBg: 'bg-violet-500/10 text-violet-400',
  }
];

export default function GeneralInsights({ insights }) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h3 className="text-base font-bold text-ix-text">General Insights</h3>
        <p className="text-xs text-ix-muted">AI-powered understanding of your audience</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 stagger-children">
        {CARDS.map(card => {
          const data = insights[card.key];
          const isList = Array.isArray(data);

          return (
            <div
              key={card.key}
              className={`bg-ix-card border border-ix-border rounded-xl p-5 border-l-4 ${card.borderColor} hover:border-ix-border-light transition-all ${
                card.key === 'realMessage' ? 'lg:col-span-2' : ''
              }`}
            >
              {/* Header */}
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${card.iconBg} flex items-center justify-center text-white`}>
                  {card.icon}
                </div>
                <h4 className="text-sm font-bold text-ix-text">{card.title}</h4>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${card.chipBg}`}>
                  {isList ? `${data.length} points` : 'Summary'}
                </span>
              </div>

              {/* Content */}
              {isList ? (
                <ul className="space-y-2">
                  {data.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-ix-text leading-relaxed">
                      <span className="text-base flex-shrink-0 mt-0.5">{['•', '•', '•', '•'][i % 4]}</span>
                      <span className="text-ix-text/90">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-ix-text/90 leading-relaxed">{data}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
