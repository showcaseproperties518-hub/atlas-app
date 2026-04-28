"use client";

import Link from "next/link";

const socialPlatforms = [
  {
    name: "Instagram",
    handle: "@youratlas",
    status: "Coming soon",
    description:
      "Share published journeys, trip photos, and visual route stories outward from Atlas.",
    gradient:
      "from-[#fdf2f8] via-[#ffe4e6] to-[#fde68a]",
  },
  {
    name: "Facebook",
    handle: "Atlas Journeys",
    status: "Coming soon",
    description:
      "Post family trips, travel logs, and published journeys back to your network.",
    gradient:
      "from-[#eff6ff] via-[#dbeafe] to-[#e0f2fe]",
  },
  {
    name: "TikTok",
    handle: "@atlasworld",
    status: "Coming soon",
    description:
      "Turn photo-first journeys into short-form visual trip stories people can remix.",
    gradient:
      "from-[#f8fafc] via-[#e2e8f0] to-[#f1f5f9]",
  },
  {
    name: "Pinterest",
    handle: "Atlas Travel Boards",
    status: "Coming soon",
    description:
      "Push scenic routes, hidden gems, and itinerary inspiration into high-intent discovery.",
    gradient:
      "from-[#fef2f2] via-[#fee2e2] to-[#fecaca]",
  },
  {
    name: "X",
    handle: "@atlasbuilds",
    status: "Coming soon",
    description:
      "Share trip snapshots, links, and travel highlights that drive people back into Atlas.",
    gradient:
      "from-[#f8fafc] via-[#e5e7eb] to-[#f1f5f9]",
  },
];

export default function SettingsPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f4efe7] text-neutral-900">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),rgba(244,239,231,0.86),rgba(232,223,211,0.96))]" />
        <div className="absolute left-[-80px] top-10 h-60 w-60 rounded-full bg-white/35 blur-3xl" />
        <div className="absolute right-[-60px] top-0 h-72 w-72 rounded-full bg-[#e6dacb] blur-3xl" />
        <div className="absolute left-[10%] top-[35%] h-40 w-40 rounded-full bg-[#efe5d8] blur-3xl" />
        <div className="absolute right-[15%] top-[55%] h-40 w-40 rounded-full bg-white/30 blur-3xl" />

        <div className="relative mx-auto w-full max-w-md px-4 pb-24 pt-4 md:max-w-2xl md:px-6 lg:max-w-5xl lg:px-8 xl:max-w-6xl">
          <div className="overflow-hidden rounded-[38px] border border-white/60 bg-white/30 shadow-[0_28px_90px_rgba(0,0,0,0.11)] backdrop-blur">
            <div
              className="relative min-h-[430px] bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1800&q=80')",
              }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.08)_0%,rgba(10,10,10,0.24)_34%,rgba(10,10,10,0.80)_100%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.30),transparent_30%)]" />

              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                <Link
                  href="/atlas"
                  className="rounded-full border border-white/20 bg-white/14 px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-white backdrop-blur"
                >
                  Back to My Atlas
                </Link>

                <div className="rounded-full border border-white/20 bg-black/15 px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-white backdrop-blur">
                  Social Connections
                </div>
              </div>

              <div className="relative flex min-h-[430px] flex-col justify-end p-5 text-white md:p-7 lg:min-h-[500px] lg:p-8">
                <p className="text-[11px] uppercase tracking-[0.34em] text-white/80">
                  Atlas Growth Layer
                </p>
                <h1 className="mt-3 max-w-3xl text-[2.15rem] font-semibold leading-[1.02] md:text-[2.6rem] lg:text-[3.25rem]">
                  Connect your social accounts to turn journeys into growth
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85 md:text-base">
                  Atlas should not only help you build and save trips — it should help you share
                  them outward, drive people back into the map, and make every great journey a
                  source of discovery.
                </p>
              </div>
            </div>
          </div>

          <div className="-mt-12 relative z-10 rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,243,236,0.93))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.12)] backdrop-blur md:p-6 lg:max-w-3xl">
            <p className="text-[11px] uppercase tracking-[0.34em] text-neutral-500">
              Why this matters
            </p>
            <h2 className="mt-2 text-2xl font-semibold leading-tight md:text-3xl">
              The viral loop starts when journeys leave Atlas and bring people back
            </h2>
            <p className="mt-3 text-sm leading-6 text-neutral-700 md:text-base">
              Your best trips should become social content, travel inspiration, and clickable
              discovery. This is where Atlas eventually connects to the platforms people already
              use so published journeys can spread naturally.
            </p>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div className="space-y-5">
              <div className="rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(245,239,231,0.94))] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.08)] md:p-6">
                <p className="text-[11px] uppercase tracking-[0.34em] text-neutral-500">
                  Connected platforms
                </p>
                <h2 className="mt-2 text-2xl font-semibold leading-tight md:text-3xl">
                  Built for sharing visual journeys outward
                </h2>
                <p className="mt-3 text-sm leading-6 text-neutral-700">
                  These are the networks Atlas should eventually publish into directly. For now,
                  this page sets the product layer and the future workflow.
                </p>

                <div className="mt-5 grid gap-4">
                  {socialPlatforms.map((platform) => (
                    <div
                      key={platform.name}
                      className={`overflow-hidden rounded-[26px] border border-neutral-200/70 bg-gradient-to-br ${platform.gradient} shadow-[0_10px_28px_rgba(0,0,0,0.04)]`}
                    >
                      <div className="p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                              {platform.handle}
                            </p>
                            <h3 className="mt-2 text-xl font-semibold text-neutral-900">
                              {platform.name}
                            </h3>
                          </div>

                          <span className="rounded-full border border-neutral-300/80 bg-white/80 px-3 py-1 text-xs font-medium text-neutral-700">
                            {platform.status}
                          </span>
                        </div>

                        <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-700">
                          {platform.description}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-3">
                          <button
                            type="button"
                            disabled
                            className="cursor-not-allowed rounded-2xl bg-neutral-900/85 px-4 py-3 text-sm font-medium text-white/75"
                          >
                            Connect {platform.name}
                          </button>

                          <button
                            type="button"
                            disabled
                            className="cursor-not-allowed rounded-2xl border border-neutral-300/90 bg-white/70 px-4 py-3 text-sm font-medium text-neutral-500"
                          >
                            Learn how Atlas will use it
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(247,240,232,0.94))] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.08)] lg:p-6">
                <p className="text-[11px] uppercase tracking-[0.34em] text-neutral-500">
                  Future workflow
                </p>
                <h2 className="mt-2 text-2xl font-semibold leading-tight lg:text-3xl">
                  How Atlas should spread
                </h2>

                <div className="mt-5 grid gap-3">
                  <div className="rounded-[22px] border border-neutral-200/70 bg-white/90 p-4">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                      01 · Publish
                    </p>
                    <p className="mt-2 text-sm leading-6 text-neutral-700">
                      Save a real trip, add photos, notes, and moments, then publish it into Atlas
                      World.
                    </p>
                  </div>

                  <div className="rounded-[22px] border border-neutral-200/70 bg-white/90 p-4">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                      02 · Share outward
                    </p>
                    <p className="mt-2 text-sm leading-6 text-neutral-700">
                      Push that journey to connected social accounts as visual travel content with a
                      link back into Atlas.
                    </p>
                  </div>

                  <div className="rounded-[22px] border border-neutral-200/70 bg-white/90 p-4">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                      03 · Drive return traffic
                    </p>
                    <p className="mt-2 text-sm leading-6 text-neutral-700">
                      Friends and followers click through, land back in Atlas, explore the journey,
                      and build their own version.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-5 lg:sticky lg:top-6">
              <div className="rounded-[30px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.97),rgba(239,231,221,0.95))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
                <p className="text-[11px] uppercase tracking-[0.34em] text-neutral-500">
                  Atlas readback
                </p>
                <h3 className="mt-2 text-2xl font-semibold leading-tight text-neutral-900">
                  Why connect accounts?
                </h3>

                <div className="mt-5 grid gap-3">
                  <div className="rounded-[22px] border border-neutral-200/70 bg-white/90 p-4">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">
                      Visual distribution
                    </p>
                    <p className="mt-2 text-sm leading-6 text-neutral-700">
                      Your trip photos become discovery content instead of staying trapped in a
                      camera roll.
                    </p>
                  </div>

                  <div className="rounded-[22px] border border-neutral-200/70 bg-white/90 p-4">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">
                      Viral growth
                    </p>
                    <p className="mt-2 text-sm leading-6 text-neutral-700">
                      Every great post can send people back into your Atlas map, your journey page,
                      and the Build My Version loop.
                    </p>
                  </div>

                  <div className="rounded-[22px] border border-neutral-200/70 bg-white/90 p-4">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">
                      Future booking intent
                    </p>
                    <p className="mt-2 text-sm leading-6 text-neutral-700">
                      Atlas won’t just inspire people — it should help them navigate toward booking
                      the trip too.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  <Link
                    href="/atlas"
                    className="inline-flex items-center justify-center rounded-2xl bg-neutral-900 px-5 py-4 text-sm font-medium text-white shadow-[0_18px_45px_rgba(0,0,0,0.18)]"
                  >
                    Back to My Atlas
                  </Link>

                  <Link
                    href="/feed"
                    className="inline-flex items-center justify-center rounded-2xl border border-neutral-300 bg-white px-5 py-4 text-sm font-medium text-neutral-900"
                  >
                    Open Atlas World
                  </Link>

                  <Link
                    href="/build"
                    className="inline-flex items-center justify-center rounded-2xl border border-neutral-300 bg-white px-5 py-4 text-sm font-medium text-neutral-900"
                  >
                    Build a New Trip
                  </Link>
                </div>
              </div>

              <div className="rounded-[30px] border border-white/70 bg-sky-50/90 p-5 shadow-[0_18px_55px_rgba(0,0,0,0.06)]">
                <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
                  Product note
                </p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">
                  This page should feel like growth infrastructure
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  Not a boring settings screen. It should feel like Atlas is building a system for
                  turning real trips into social travel content, trusted inspiration, and future
                  bookings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}