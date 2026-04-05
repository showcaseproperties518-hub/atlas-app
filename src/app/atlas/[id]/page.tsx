"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AtlasStoredJourney,
  formatJourneyDate,
  getPublishedJourneys,
  getSavedJourneys,
} from "@/app/lib/atlas-journeys";

type JourneyDetailPageProps = {
  params: {
    id: string;
  };
};

export default function JourneyDetailPage({ params }: JourneyDetailPageProps) {
  const [journey, setJourney] = useState<AtlasStoredJourney | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const saved = getSavedJourneys();
    const published = getPublishedJourneys();
    const all = [...saved, ...published];

    const match = all.find((item) => item.id === params.id) ?? null;
    setJourney(match);
    setIsReady(true);
  }, [params.id]);

  const summaryChips = useMemo(() => {
    if (!journey) return [];
    return [
      journey.form.duration,
      journey.form.budget,
      journey.form.travelers,
      journey.form.tripStyle,
      journey.form.energyLevel,
    ];
  }, [journey]);

  if (!isReady) {
    return (
      <main className="min-h-screen bg-[#f4efe7] text-neutral-900">
        <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-6">
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.34em] text-neutral-500">Atlas</p>
            <h1 className="mt-3 text-2xl font-semibold">Loading journey…</h1>
          </div>
        </div>
      </main>
    );
  }

  if (!journey) {
    return (
      <main className="min-h-screen bg-[#f4efe7] text-neutral-900">
        <div className="mx-auto max-w-md px-4 pb-16 pt-10">
          <div className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.08)]">
            <p className="text-[11px] uppercase tracking-[0.34em] text-neutral-500">Atlas</p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight">Journey not found</h1>
            <p className="mt-4 text-sm leading-6 text-neutral-600">
              This journey may have been removed or has not been saved on this device.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/atlas"
                className="inline-flex items-center justify-center rounded-2xl bg-neutral-900 px-5 py-4 text-sm font-medium text-white"
              >
                Back to My Atlas
              </Link>
              <Link
                href="/build"
                className="inline-flex items-center justify-center rounded-2xl border border-neutral-300 bg-white px-5 py-4 text-sm font-medium text-neutral-900"
              >
                Build a Trip
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f4efe7] text-neutral-900">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.94),rgba(244,239,231,0.84),rgba(232,223,211,0.96))]" />
        <div className="absolute left-[-80px] top-10 h-60 w-60 rounded-full bg-white/35 blur-3xl" />
        <div className="absolute right-[-60px] top-0 h-72 w-72 rounded-full bg-[#e6dacb] blur-3xl" />

        <div className="relative mx-auto w-full max-w-md px-4 pb-24 pt-4 md:max-w-2xl md:px-6 lg:max-w-5xl lg:px-8 xl:max-w-6xl">
          <div className="overflow-hidden rounded-[38px] border border-white/60 bg-white/30 shadow-[0_28px_90px_rgba(0,0,0,0.11)]">
            <div
              className="relative min-h-[460px] bg-cover bg-center lg:min-h-[620px]"
              style={{ backgroundImage: `url('${journey.coverImage}')` }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.08)_0%,rgba(10,10,10,0.25)_36%,rgba(10,10,10,0.82)_100%)]" />

              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                <Link
                  href="/atlas"
                  className="rounded-full border border-white/20 bg-white/14 px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-white"
                >
                  Back to My Atlas
                </Link>
                <span className="rounded-full border border-white/20 bg-black/15 px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-white">
                  {journey.source === "published" ? "Published Journey" : "Saved Journey"}
                </span>
              </div>

              <div className="relative flex min-h-[460px] flex-col justify-end p-5 text-white lg:min-h-[620px] lg:p-8">
                <p className="text-[11px] uppercase tracking-[0.34em] text-white/80">
                  {journey.destination}
                </p>
                <h1 className="mt-3 text-[2.2rem] font-semibold leading-[1.02] lg:max-w-[70%] lg:text-[3.5rem]">
                  {journey.trip.title}
                </h1>
                <p className="mt-3 max-w-[92%] text-sm leading-6 text-white/85 lg:max-w-[60%] lg:text-base">
                  {journey.trip.subtitle}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {summaryChips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-white/20 bg-white/14 px-3 py-2 text-[11px] text-white"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div className="space-y-5">
              <div className="rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,243,236,0.93))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.10)] lg:p-6">
                <p className="text-[11px] uppercase tracking-[0.34em] text-neutral-500">
                  Journey summary
                </p>
                <h2 className="mt-2 text-2xl font-semibold leading-tight lg:text-3xl">
                  A saved Atlas version you can return to anytime
                </h2>
                <p className="mt-3 text-sm leading-6 text-neutral-700 lg:text-base">
                  {journey.trip.vibeSummary}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  {journey.trip.highlights.map((highlight) => (
                    <div
                      key={highlight}
                      className="rounded-[22px] border border-neutral-200/60 bg-[#faf5ef] p-4 text-sm text-neutral-700"
                    >
                      {highlight}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(244,237,228,0.93))] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.08)] lg:p-6">
                <p className="text-[11px] uppercase tracking-[0.34em] text-neutral-500">
                  Day by day
                </p>
                <h2 className="mt-2 text-2xl font-semibold leading-tight lg:text-3xl">
                  Your itinerary flow
                </h2>

                <div className="mt-5 space-y-4">
                  {journey.trip.days.map((day, index) => (
                    <article
                      key={day.day}
                      className="overflow-hidden rounded-[28px] border border-neutral-200/60 bg-white/90 shadow-[0_14px_38px_rgba(0,0,0,0.05)]"
                    >
                      <div className="relative border-b border-neutral-200/60 bg-[linear-gradient(180deg,rgba(251,248,243,1),rgba(255,255,255,0.96))] px-4 py-4">
                        <div className="absolute right-4 top-4 text-5xl font-semibold leading-none text-neutral-200">
                          {String(day.day).padStart(2, "0")}
                        </div>

                        <div className="relative z-10 max-w-[78%]">
                          <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                            Day {day.day}
                          </p>
                          <h3 className="mt-1 text-lg font-semibold text-neutral-900">
                            {day.title}
                          </h3>
                          <p className="mt-3 text-sm leading-6 text-neutral-600">
                            {day.summary}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3 p-4">
                        <div className="rounded-[20px] bg-[#fbf7f1] px-4 py-4">
                          <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                            Morning
                          </p>
                          <p className="mt-2 text-sm leading-6 text-neutral-700">{day.morning}</p>
                        </div>

                        <div className="rounded-[20px] bg-[#f7f1e9] px-4 py-4">
                          <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                            Afternoon
                          </p>
                          <p className="mt-2 text-sm leading-6 text-neutral-700">
                            {day.afternoon}
                          </p>
                        </div>

                        <div className="rounded-[20px] bg-[#f1ebe3] px-4 py-4">
                          <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                            Evening
                          </p>
                          <p className="mt-2 text-sm leading-6 text-neutral-700">{day.evening}</p>
                        </div>

                        {index === 0 ? (
                          <div className="rounded-[20px] border border-dashed border-neutral-300 bg-[#faf5ef] px-4 py-3">
                            <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                              Atlas note
                            </p>
                            <p className="mt-2 text-sm leading-6 text-neutral-700">
                              This version is saved exactly as one of your Atlas journeys, so you
                              can revisit it, refine it, or publish it later.
                            </p>
                          </div>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-5 lg:sticky lg:top-6">
              <div className="rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(243,235,226,0.93))] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.08)] lg:p-6">
                <p className="text-[11px] uppercase tracking-[0.34em] text-neutral-500">
                  Journey details
                </p>
                <h2 className="mt-2 text-2xl font-semibold">Saved inside your Atlas</h2>

                <div className="mt-5 space-y-3">
                  <div className="rounded-[24px] border border-neutral-200/60 bg-white/90 p-4">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                      Best area to stay
                    </p>
                    <p className="mt-2 text-sm leading-6 text-neutral-700">
                      {journey.trip.staySuggestion}
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-neutral-200/60 bg-white/90 p-4">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                      Getting around
                    </p>
                    <p className="mt-2 text-sm leading-6 text-neutral-700">
                      {journey.trip.transportSuggestion}
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-neutral-200/60 bg-white/90 p-4">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                      Last updated
                    </p>
                    <p className="mt-2 text-sm leading-6 text-neutral-700">
                      {formatJourneyDate(journey.updatedAt)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  <Link
                    href="/build"
                    className="inline-flex items-center justify-center rounded-2xl bg-neutral-900 px-5 py-4 text-sm font-medium text-white"
                  >
                    Build Another Version
                  </Link>
                  <Link
                    href="/atlas"
                    className="inline-flex items-center justify-center rounded-2xl border border-neutral-300 bg-white px-5 py-4 text-sm font-medium text-neutral-900"
                  >
                    Back to My Atlas
                  </Link>
                  <Link
                    href="/feed"
                    className="inline-flex items-center justify-center rounded-2xl border border-neutral-300 bg-white px-5 py-4 text-sm font-medium text-neutral-900"
                  >
                    Open Atlas World
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}