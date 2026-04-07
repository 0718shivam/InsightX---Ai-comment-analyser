import { ArrowUpRight, Eye, MessageSquare, PlayCircle, Users } from 'lucide-react';
import { mockVideos } from '../data/mockData';

const featuredVideo = [...mockVideos].sort(
  (left, right) => new Date(right.analyzedAt) - new Date(left.analyzedAt),
)[0];

const quickStats = [
  { label: 'Views', value: featuredVideo.views, icon: Eye },
  { label: 'Comments', value: featuredVideo.commentCount.toLocaleString(), icon: MessageSquare },
  { label: 'Channel', value: featuredVideo.channel, icon: Users },
  { label: 'Duration', value: featuredVideo.duration, icon: PlayCircle },
];

export default function CreatorInsights() {
  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[32px] border border-white/70 bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_55%,#0f766e_100%)] p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.20)] sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-teal-200">Creator Insights</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              A cleaner home for your extension-powered YouTube analysis.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-200 sm:text-base">
              Your dashboard now opens into a focused workspace with the key video context visible first, so creators can understand performance without digging through clutter.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-100">Latest Analysis</p>
            <p className="mt-3 text-2xl font-bold">{featuredVideo.title}</p>
            <p className="mt-3 text-sm text-slate-200">
              {featuredVideo.channel} • analyzed on {new Date(featuredVideo.analyzedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <article className="overflow-hidden rounded-[32px] border border-white/70 bg-white/85 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="grid gap-0 lg:grid-cols-[360px_1fr]">
            <div className="relative min-h-[250px] overflow-hidden bg-slate-200">
              <img
                src={featuredVideo.thumbnail}
                alt={featuredVideo.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-200">Featured Video</p>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Video Summary</p>
                  <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950">{featuredVideo.title}</h3>
                  <p className="mt-3 text-sm font-semibold text-slate-600">Channel name: {featuredVideo.channel}</p>
                </div>

                <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                  Live dashboard shell
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {quickStats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-teal-700 shadow-sm">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                          {item.label}
                        </p>
                        <p className="mt-1 text-lg font-bold text-slate-950">{item.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Why this layout works</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  The most important creator context is now above the fold: the thumbnail, exact video title, channel name, view count, and comment count. This gives the dashboard a professional first impression and a clearer scan path.
                </p>
              </div>
            </div>
          </div>
        </article>

        <aside className="space-y-6">
          <div className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Recent Videos</p>
            <div className="mt-5 space-y-4">
              {mockVideos.slice(0, 3).map((video) => (
                <div key={video.id} className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-slate-50/80 p-3">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="h-20 w-28 rounded-2xl object-cover"
                  />
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-bold text-slate-900">{video.title}</p>
                    <p className="mt-2 text-xs font-medium text-slate-500">{video.channel}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {video.views} views • {video.commentCount.toLocaleString()} comments
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-emerald-200 bg-emerald-50/80 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">Next step</p>
            <p className="mt-3 text-sm leading-7 text-emerald-900">
              The shell is now in place. We can next connect this to real extension-selected video data and replace the mock featured card with the exact video the user opened from YouTube.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
