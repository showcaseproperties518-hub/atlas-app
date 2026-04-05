"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ATLAS_BUILD_PREFILL_STORAGE_KEY,
  ATLAS_BUILD_STORAGE_KEY,
  AtlasInterest,
  AtlasTripFormData,
  budgetOptions,
  defaultAtlasTripForm,
  durationOptions,
  energyOptions,
  gemOptions,
  interestOptions,
  paceOptions,
  travelerOptions,
  tripStyleOptions,
} from "@/app/lib/atlas-trip";

const buildHeroImage =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=80";

const inspirationCards = [
  {
    title: "Weekend escapes",
    subtitle: "Fast resets with high payoff",
    image:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Hidden local gems",
    subtitle: "Stay local, go global",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Dream routes",
    subtitle: "Scenic drives, food, and moments",
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
  },
];

const destinationSuggestions = [
  "Iceland",
  "Costa Rica",
  "Quebec City",
  "Tokyo",
  "Italy",
  "Alaska",
];

export default function BuildPage() {
  const router = useRouter();
  const [form, setForm] = useState<AtlasTripFormData>(defaultAtlasTripForm);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(ATLAS_BUILD_STORAGE_KEY);
    const prefill = window.localStorage.getItem(ATLAS_BUILD_PREFILL_STORAGE_KEY);

    let nextForm = { ...defaultAtlasTripForm };

    if (saved) {
      try {
        nextForm = {
          ...nextForm,
          ...JSON.parse(saved),
        };
      } catch {}
    }

    if (prefill) {
      try {
        nextForm = {
          ...nextForm,
          ...JSON.parse(prefill),
        };
        window.localStorage.removeItem(ATLAS_BUILD_PREFILL_STORAGE_KEY);
      } catch {}
    }

    setForm(nextForm);
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    window.localStorage.setItem(ATLAS_BUILD_STORAGE_KEY, JSON.stringify(form));
  }, [form, isReady]);

  const canSubmit = useMemo(() => form.destination.trim().length > 0, [form.destination]);

  function updateField<K extends keyof AtlasTripFormData>(key: K, value: AtlasTripFormData[K]) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function toggleInterest(interest: AtlasInterest) {
    setForm((prev) => {
      const exists = prev.interests.includes(interest);

      return {
        ...prev,
        interests: exists
          ? prev.interests.filter((item) => item !== interest)
          : [...prev.interests, interest],
      };
    });
  }

  function handleSubmit() {
    if (!canSubmit) return;

    window.localStorage.setItem(ATLAS_BUILD_STORAGE_KEY, JSON.stringify(form));
    router.push("/results");
  }

  function applyDestinationSuggestion(destination: string) {
    updateField("destination", destination);
  }

  if (!isReady) {
    return (
      <main className="min-h-screen bg-[#f4efe7] text-neutral-900">
        <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-6">
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.34em] text-neutral-500">Atlas</p>
            <h1 className="mt-3 text-2xl font-semibold">Loading your travel profile…</h1>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f4efe7] text-neutral-900">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),rgba(244,239,231,0.86),rgba(232,223,211,0.96))]" />
        <div className="absolute left-[-80px] top-10 h-60 w-60 rounded-full bg-white/35 blur-3xl" />
        <div className="absolute right-[-60px] top-0 h-72 w-72 rounded-full bg-[#e6dacb] blur-3xl" />
        <div className="absolute left-[10%] top-[35%] h-40 w-40 rounded-full bg-[#efe5d8] blur-3xl" />

        <div className="relative mx-auto w-full max-w-md px-4 pb-28 pt-4 md:max-w-2xl md:px-6 lg:max-w-5xl lg:px-8 xl:max-w-6xl">
          <div className="overflow-hidden rounded-[36px] border border-white/60 bg-white/30 shadow-[0_28px_90px_rgba(0,0,0,0.11)] backdrop-blur">
            <div
              className="relative min-h-[430px] bg-cover bg-center"
              style={{ backgroundImage: `url('${buildHeroImage}')` }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.06)_0%,rgba(10,10,10,0.22)_32%,rgba(10,10,10,0.78)_100%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.35),transparent_30%)]" />

              <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-white/14 px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-white backdrop-blur">
                Your Agent
              </div>

              <div className="absolute right-4 top-4 rounded-full border border-white/20 bg-black/15 px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-white backdrop-blur">
                Atlas Build
              </div>

              <div className="relative flex min-h-[430px] flex-col justify-end p-5 text-white md:p-7 lg:min-h-[480px] lg:p-8">
                <p className="text-[11px] uppercase tracking-[0.34em] text-white/80">
                  Plan something unforgettable
                </p>
                <h1 className="mt-3 max-w-3xl text-[2.15rem] font-semibold leading-[1.02] md:text-[2.6rem] lg:text-[3.25rem]">
                  Build a trip that feels editorial, personal, and worth taking
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85 md:text-base">
                  Atlas turns a few smart choices into a premium trip plan shaped around your pace,
                  priorities, and travel identity.
                </p>
              </div>
            </div>
          </div>

          <div className="-mt-12 relative z-10 rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,243,236,0.93))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.12)] backdrop-blur md:p-6 lg:max-w-3xl">
            <p className="text-[11px] uppercase tracking-[0.34em] text-neutral-500">
              Atlas perspective
            </p>
            <h2 className="mt-2 text-2xl font-semibold leading-tight md:text-3xl">
              Not a chatbot. A travel agent with taste.
            </h2>
            <p className="mt-3 text-sm leading-6 text-neutral-700 md:text-base">
              Atlas should feel like part planner, part local guide, and part personal concierge.
              This is where your version of the trip begins.
            </p>
          </div>

          <div className="mt-5">
            <div className="mb-3 flex items-end justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.34em] text-neutral-500">
                  Inspiration
                </p>
                <h3 className="mt-1 text-xl font-semibold md:text-2xl">
                  Start in the mood of travel
                </h3>
              </div>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-1 lg:grid lg:grid-cols-3 lg:overflow-visible">
              {inspirationCards.map((card) => (
                <article
                  key={card.title}
                  className="relative min-w-[240px] overflow-hidden rounded-[26px] border border-white/60 bg-white/30 shadow-[0_18px_40px_rgba(0,0,0,0.08)] lg:min-w-0"
                >
                  <div
                    className="relative h-[180px] bg-cover bg-center md:h-[220px]"
                    style={{ backgroundImage: `url('${card.image}')` }}
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.10)_0%,rgba(10,10,10,0.58)_100%)]" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-white/75">
                        Atlas mood
                      </p>
                      <h4 className="mt-2 text-lg font-semibold">{card.title}</h4>
                      <p className="mt-1 text-sm text-white/85">{card.subtitle}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
            <div className="rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(245,239,231,0.93))] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.08)] md:p-6">
              <div>
                <label className="text-[11px] uppercase tracking-[0.30em] text-neutral-500">
                  Where do you want to go?
                </label>
                <input
                  value={form.destination}
                  onChange={(e) => updateField("destination", e.target.value)}
                  placeholder="Iceland, Costa Rica, Quebec City, Tokyo..."
                  className="mt-3 w-full rounded-2xl border border-white/70 bg-white/90 px-4 py-4 text-base text-neutral-900 outline-none transition focus:border-neutral-400"
                />
              </div>

              <div className="mt-4">
                <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                  Popular right now
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {destinationSuggestions.map((destination) => (
                    <button
                      key={destination}
                      type="button"
                      onClick={() => applyDestinationSuggestion(destination)}
                      className="rounded-full border border-neutral-200/90 bg-white/85 px-4 py-2.5 text-sm text-neutral-700 transition hover:bg-neutral-900 hover:text-white"
                    >
                      {destination}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <label className="text-[11px] uppercase tracking-[0.30em] text-neutral-500">
                  How long?
                </label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {durationOptions.map((option) => {
                    const active = form.duration === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => updateField("duration", option)}
                        className={`rounded-full px-4 py-2.5 text-sm transition ${
                          active
                            ? "bg-neutral-900 text-white shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
                            : "border border-neutral-200/90 bg-white/85 text-neutral-700"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6">
                <label className="text-[11px] uppercase tracking-[0.30em] text-neutral-500">
                  Budget
                </label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {budgetOptions.map((option) => {
                    const active = form.budget === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => updateField("budget", option)}
                        className={`rounded-full px-4 py-2.5 text-sm transition ${
                          active
                            ? "bg-neutral-900 text-white shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
                            : "border border-neutral-200/90 bg-white/85 text-neutral-700"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6">
                <label className="text-[11px] uppercase tracking-[0.30em] text-neutral-500">
                  Who are you traveling with?
                </label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {travelerOptions.map((option) => {
                    const active = form.travelers === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => updateField("travelers", option)}
                        className={`rounded-full px-4 py-2.5 text-sm transition ${
                          active
                            ? "bg-neutral-900 text-white shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
                            : "border border-neutral-200/90 bg-white/85 text-neutral-700"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6">
                <label className="text-[11px] uppercase tracking-[0.30em] text-neutral-500">
                  Energy level
                </label>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {energyOptions.map((option) => {
                    const active = form.energyLevel === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => updateField("energyLevel", option)}
                        className={`rounded-2xl px-3 py-3 text-sm transition ${
                          active
                            ? "bg-neutral-900 text-white shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
                            : "border border-neutral-200/90 bg-white/85 text-neutral-700"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6">
                <label className="text-[11px] uppercase tracking-[0.30em] text-neutral-500">
                  Trip style
                </label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {tripStyleOptions.map((option) => {
                    const active = form.tripStyle === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => updateField("tripStyle", option)}
                        className={`rounded-full px-4 py-2.5 text-sm transition ${
                          active
                            ? "bg-neutral-900 text-white shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
                            : "border border-neutral-200/90 bg-white/85 text-neutral-700"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6">
                <label className="text-[11px] uppercase tracking-[0.30em] text-neutral-500">
                  Hidden gems or top spots?
                </label>
                <div className="mt-3 grid grid-cols-1 gap-2">
                  {gemOptions.map((option) => {
                    const active = form.gemsPreference === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => updateField("gemsPreference", option)}
                        className={`rounded-2xl px-4 py-3 text-left text-sm transition ${
                          active
                            ? "bg-neutral-900 text-white shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
                            : "border border-neutral-200/90 bg-white/85 text-neutral-700"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6">
                <label className="text-[11px] uppercase tracking-[0.30em] text-neutral-500">
                  Planner or spontaneous?
                </label>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {paceOptions.map((option) => {
                    const active = form.travelPace === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => updateField("travelPace", option)}
                        className={`rounded-2xl px-3 py-3 text-sm transition ${
                          active
                            ? "bg-neutral-900 text-white shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
                            : "border border-neutral-200/90 bg-white/85 text-neutral-700"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6">
                <label className="text-[11px] uppercase tracking-[0.30em] text-neutral-500">
                  What matters most on this trip?
                </label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {interestOptions.map((option) => {
                    const active = form.interests.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => toggleInterest(option)}
                        className={`rounded-full px-4 py-2.5 text-sm transition ${
                          active
                            ? "bg-[rgba(24,24,27,0.92)] text-white shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
                            : "border border-neutral-200/90 bg-white/85 text-neutral-700"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(240,233,224,0.94))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.08)] lg:sticky lg:top-6">
              <p className="text-[11px] uppercase tracking-[0.34em] text-neutral-500">
                Atlas readback
              </p>
              <h3 className="mt-2 text-xl font-semibold leading-tight md:text-2xl">
                This should already feel like the start of a real trip
              </h3>

              <p className="mt-3 text-sm leading-6 text-neutral-700">
                {form.destination.trim() ? (
                  <>
                    Atlas is shaping a <span className="font-medium">{form.duration}</span> trip to{" "}
                    <span className="font-medium">{form.destination}</span> for{" "}
                    <span className="font-medium">{form.travelers}</span> travelers with a{" "}
                    <span className="font-medium">{form.tripStyle.toLowerCase()}</span> feel,{" "}
                    <span className="font-medium">{form.energyLevel.toLowerCase()}</span> energy, and a{" "}
                    <span className="font-medium">{form.gemsPreference.toLowerCase()}</span> balance.
                  </>
                ) : (
                  <>Type a destination above and Atlas will unlock the trip plan.</>
                )}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-neutral-200/80 bg-white/85 p-4">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">Style</p>
                  <p className="mt-2 text-sm font-medium text-neutral-900">{form.tripStyle}</p>
                </div>
                <div className="rounded-2xl border border-neutral-200/80 bg-white/85 p-4">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">Pace</p>
                  <p className="mt-2 text-sm font-medium text-neutral-900">{form.energyLevel}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`mt-5 w-full rounded-2xl px-5 py-4 text-sm font-medium transition ${
                  canSubmit
                    ? "bg-neutral-900 text-white shadow-[0_18px_45px_rgba(0,0,0,0.18)] hover:translate-y-[-1px]"
                    : "cursor-not-allowed bg-neutral-200 text-neutral-500"
                }`}
              >
                Plan My Trip
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}