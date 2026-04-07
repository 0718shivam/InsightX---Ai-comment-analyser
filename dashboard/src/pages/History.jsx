import { Clock3, Eye, MessageSquare } from 'lucide-react';
import { mockVideos } from '../data/mockData';

const historyVideos = [...mockVideos].sort(
  (left, right) => new Date(right.analyzedAt) - new Date(left.analyzedAt),
);

export default function History() {
  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">History</p>
        <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950">Previously analyzed videos</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          This route is ready for the history view you asked for. For now it lists the analyzed videos in a cleaner, more professional card layout.
        </p>
      </div>

      <div className="grid gap-5">
        {historyVideos.map((video) => (
          <article
            key={video.id}
            className="overflow-hidden rounded-[30px] border border-white/70 bg-white/85 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl"
          >
            <div className="grid gap-0 lg:grid-cols-[260px_1fr]">
              <img src={video.thumbnail} alt={video.title} className="h-full min-h-[210px] w-full object-cover" />

              <div className="p-6 sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-3xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Analysis record</p>
                    <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950">{video.title}</h3>
                    <p className="mt-3 text-sm font-semibold text-slate-600">Channel name: {video.channel}</p>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
                    <Clock3 className="h-4 w-4" />
                    {new Date(video.analyzedAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
                    <Eye className="h-4 w-4 text-teal-700" />
                    {video.views} views
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
                    <MessageSquare className="h-4 w-4 text-teal-700" />
                    {video.commentCount.toLocaleString()} comments
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
