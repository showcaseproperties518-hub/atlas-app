"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ATLAS_BUILD_STORAGE_KEY,
  AtlasTripFormData,
  createAtlasTripOutput,
  defaultAtlasTripForm,
} from "@/app/lib/atlas-trip";
import {
  AtlasStoredJourney,
  publishExistingJourney,
  upsertSavedJourneyFromTrip,
} from "@/app/lib/atlas-journeys";

const destinationHeroMap: Record<string, string> = {
  iceland:
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80",
  "costa rica":
    "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=1800&q=80",
  japan:
    "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1800&q=80",
  tokyo:
    "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1800&q=80",
  italy:
    "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1800&q=80",
  paris:
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1800&q=80",
  greece:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=80",
  quebec:
    "https://images.unsplash.com/photo-1519181245277-cffeb31da2e3?auto=format&fit=crop&w=1800&q=80",
  alaska:
    "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1800&q=80",
};

function getDestinationImage(destination: string) {
  const normalized = destination.trim().toLowerCase();

  if (!normalized) {
    return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=80";
  }

  const directMatch = destinationHeroMap[normalized];
  if (directMatch) return directMatch;

  const partialMatch = Object.entries(destinationHeroMap).find(([key]) =>
    normalized.includes(key)
  );

  if (partialMatch) return partialMatch[1];

  return "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1800&q=80";
}

function getVibeLabel(form: AtlasTripFormData) {
  const style =
    form.tripStyle === "Food-focused"
      ? "Food-led"
      : form.tripStyle === "Culture-first"
      ? "Culture-led"
      : form.tripStyle;

  return `${style} · ${form.energyLevel}`;
}

function getMomentCards(form: AtlasTripFormData) {
  const interestLine =
    form.interests.length > 0
      ? form.interests.slice(0, 3).join(" · ")
      : "Food · Nature · Culture";

  return [
    {
      eyebrow: "Hidden gems",
      title:
        form.gemsPreference === "Hidden gems"
          ? "Atlas is leaning local-first"
          : form.gemsPreference === "Mix of both"
          ? "Atlas is blending icons + local finds"
          : "Atlas is protecting the essentials",
      text:
        form.gemsPreference === "Hidden gems"
          ? "Expect quieter viewpoints, local neighborhoods, and stops that feel discovered instead of overdone."
          : form.gemsPreference === "Mix of both"
          ? "You’ll get the major moments without losing the smaller places that make a trip feel personal."
          : "This version is built around the signature places that define the destination and make the trip feel complete.",
    },
    {
      eyebrow: "Best moments",
      title: "The flow is designed, not random",
      text: `Atlas is shaping the trip around ${form.tripStyle.toLowerCase()} energy with ${interestLine.toLowerCase()} woven through the experience.`,
    },
    {
      eyebrow: "Why this version works",
      title: "Built for your travel identity",
      text: `This plan fits ${form.travelers.toLowerCase()} travel, ${form.travelPace.toLowerCase()} pacing, and a ${form.budget.toLowerCase()} budget lane.`,
    },
  ];
}

function getBookingLayer(form: AtlasTripFormData) {
  const stay =
    form.tripStyle === "Luxury"
      ? "Stay in a design-forward or boutique area that feels elevated, walkable, and close to your best dining windows."
      : form.tripStyle === "Romantic"
      ? "Stay somewhere scenic, charming, and evening-friendly so the trip keeps its mood even after the daytime route ends."
      : form.tripStyle === "Family"
      ? "Stay in a practical base with easier parking, flexible dining nearby, and enough room to keep the trip low-stress."
      : form.tripStyle === "Adventure"
      ? "Stay near the route out of town so early departures, scenic drives, and outdoor days feel smoother."
      : "Stay in a central area with strong local character, easy access, and a good balance of walkability and convenience.";

  const gettingAround =
    form.tripStyle === "Adventure" || form.interests.includes("Scenic drives")
      ? "A rental car is likely worth it here so Atlas can build in scenic pull-offs, hidden detours, and flexible timing."
      : form.energyLevel === "Easygoing"
      ? "A walkable base plus short rides should keep the trip easy, soft, and low-friction."
      : "A mix of walking, transit, and short rideshares likely gives the best mix of freedom and simplicity.";

  const futureHook =
    "Later, Atlas can connect this exact version of your trip to hotels, flights, cars, and experiences so the plan becomes bookable, not just inspiring.";

  return { stay, gettingAround, futureHook };
}

export default function ResultsPage() {
  const [form, setForm] = useState<AtlasTripFormData | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [savedJourney, setSavedJourney] = useState<AtlasStoredJourney | null>(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [publishMessage, setPublishMessage] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(ATLAS_BUILD_STORAGE_KEY);

    if (saved) {
      try {
        const parsed = JSON.parse(saved) as AtlasTripFormData;
        setForm({
          ...defaultAtlasTripForm,
          ...parsed,
        });
      } catch {
        setForm(null);
      }
    } else {
      setForm(null);
    }

    setIsReady(true);
  }, []);

  const trip = useMemo(() => {
    if (!form) return null;
    return createAtlasTripOutput(form);
  }, [form]);

  const heroImage = useMemo(() => {
    if (!form) return "";
    return getDestinationImage(form.destination);
  }, [form]);

  const vibeLabel = useMemo(() => {
    if (!form) return "";
    return getVibeLabel(form);
  }, [form]);

  const momentCards = useMemo(() => {
    if (!form) return [];
    return getMomentCards(form);
  }, [form]);

  const bookingLayer = useMemo(() => {
    if (!form) return null;
    return getBookingLayer(form);
  }, [form]);

  function handleSave() {
    if (!form || !trip) return;

    const journey = upsertSavedJourneyFromTrip({
      id: savedJourney?.id,
      destination: form.destination.trim() || "Your trip",
      coverImage: heroImage,
      form,
      trip,
    });

    setSavedJourney(journey);
    setSaveMessage("Saved to My Atlas");
    window.setTimeout(() => setSaveMessage(""), 2200);
  }

  function handlePublish() {
    if (!form || !trip) return;

    const journey =
      savedJourney ??
      upsertSavedJourneyFromTrip({
        destination: form.destination.trim() || "Your trip",
        coverImage: heroImage,
        form,
        trip,
      });

    const published = publishExistingJourney(journey);
    setSavedJourney(published);
    setPublishMessage("Published to Atlas World");
    window.setTimeout(() => setPublishMessage(""), 2200);
  }

  if (!isReady) {
    return (
      <main className="min-h-screen bg-[#f4efe7] text-neutral-900">
        <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-6">
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.34em] text-neutral-500">Atlas</p>
            <h1 className="mt-3 text-2xl font-semibold">Building your Atlas trip…</h1>
          </div>
        </div>
      </main>
    );
  }

  if (!form || !trip || !bookingLayer) {
    return (
      <main className="min-h-screen bg-[#f4efe7] text-neutral-900">
        <div className="mx-auto max-w-md px-4 pb-16 pt-10">
          <div className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.08)] backdrop-blur">
            <p className="text-[11px] uppercase tracking-[0.34em] text-neutral-500">Atlas</p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight">
              Your trip is not ready yet
            </h1>
            <p className="mt-4 text-sm leading-6 text-neutral-600">
              Start from Build so Atlas can shape the destination, pace, vibe, and route around
              you.
            </p>

            <Link
              href="/build"
              className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-neutral-900 px-5 py-4 text-sm font-medium text-white shadow-[0_18px_45px_rgba(0,0,0,0.18)]"
            >
              Go to Build
            </Link>
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
        <div className="absolute left-[12%] top-[45%] h-44 w-44 rounded-full bg-[#efe5d8] blur-3xl" />
        <div className="absolute right-[5%] top-[58%] h-44 w-44 rounded-full bg-white/25 blur-3xl" />

        <div className="relative mx-auto w-full max-w-md px-4 pb-28 pt-4 md:max-w-2xl md:px-6 lg:max-w-5xl lg:px-8 xl:max-w-6xl">
          <div className="space-y-5">
            <div className="overflow-hidden rounded-[38px] border border-white/60 bg-white/30 shadow-[0_28px_90px_rgba(0,0,0,0.11)] backdrop-blur">
              <div
                className="relative min-h-[470px] bg-cover bg-center lg:min-h-[620px]"
                style={{ backgroundImage: `url('${heroImage}')` }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.06)_0%,rgba(10,10,10,0.22)_32%,rgba(10,10,10,0.80)_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.36),transparent_30%)]" />

                <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-white/14 px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-white backdrop-blur">
                  Your Atlas Trip
                </div>

                <div className="absolute right-4 top-4 rounded-full border border-white/20 bg-black/15 px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-white backdrop-blur">
                  Agent Built
                </div>

                <div className="relative flex min-h-[470px] flex-col justify-end p-5 text-white lg:min-h-[620px] lg:p-8">
                  <p className="text-[11px] uppercase tracking-[0.34em] text-white/80">
                    Personal Layer
                  </p>

                  <h1 className="mt-3 text-[2.2rem] font-semibold leading-[1.02] lg:max-w-[72%] lg:text-[3.5rem]">
                    {trip.title}
                  </h1>

                  <p className="mt-3 max-w-[92%] text-sm leading-6 text-white/85 lg:max-w-[60%] lg:text-base">
                    {trip.subtitle}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/20 bg-white/14 px-3 py-2 text-[11px] text-white backdrop-blur">
                      {form.duration}
                    </span>
                    <span className="rounded-full border border-white/20 bg-white/14 px-3 py-2 text-[11px] text-white backdrop-blur">
                      {form.budget}
                    </span>
                    <span className="rounded-full border border-white/20 bg-white/14 px-3 py-2 text-[11px] text-white backdrop-blur">
                      {form.travelers}
                    </span>
                    <span className="rounded-full border border-white/20 bg-white/14 px-3 py-2 text-[11px] text-white backdrop-blur">
                      {vibeLabel}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
              <div className="space-y-5">
                <div className="rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,243,236,0.93))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.12)] backdrop-blur lg:p-6">
                  <p className="text-[11px] uppercase tracking-[0.34em] text-neutral-500">
                    Atlas readback
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold leading-tight lg:text-3xl">
                    This feels like a real trip because it was built around you
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-neutral-700 lg:text-base">
                    {trip.vibeSummary}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-[22px] border border-neutral-200/70 bg-white/88 p-4 shadow-[0_8px_24px_rgba(0,0,0,0.03)]">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                        Days
                      </p>
                      <p className="mt-2 text-lg font-semibold text-neutral-900">
                        {form.duration}
                      </p>
                    </div>

                    <div className="rounded-[22px] border border-neutral-200/70 bg-white/88 p-4 shadow-[0_8px_24px_rgba(0,0,0,0.03)]">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                        Budget
                      </p>
                      <p className="mt-2 text-lg font-semibold text-neutral-900">{form.budget}</p>
                    </div>

                    <div className="rounded-[22px] border border-neutral-200/70 bg-white/88 p-4 shadow-[0_8px_24px_rgba(0,0,0,0.03)]">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                        Traveler
                      </p>
                      <p className="mt-2 text-lg font-semibold text-neutral-900">
                        {form.travelers}
                      </p>
                    </div>

                    <div className="rounded-[22px] border border-neutral-200/70 bg-white/88 p-4 shadow-[0_8px_24px_rgba(0,0,0,0.03)]">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                        Vibe
                      </p>
                      <p className="mt-2 text-lg font-semibold text-neutral-900">{vibeLabel}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(244,237,228,0.93))] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.08)] lg:p-6">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.34em] text-neutral-500">
                      Trip flow
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold leading-tight lg:text-3xl">
                      A high-end itinerary, not a dump of suggestions
                    </h2>
                  </div>

                  <div className="mt-5 space-y-4">
                    {trip.days.map((day, index) => (
                      <article
                        key={day.day}
                        className="overflow-hidden rounded-[28px] border border-neutral-200/70 bg-white/90 shadow-[0_14px_38px_rgba(0,0,0,0.05)]"
                      >
                        <div className="relative border-b border-neutral-200/70 bg-[linear-gradient(180deg,rgba(251,248,243,1),rgba(255,255,255,0.96))] px-4 py-4">
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
                            <div className="flex items-center gap-2">
                              <div className="h-2.5 w-2.5 rounded-full bg-neutral-900" />
                              <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                                Morning
                              </p>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-neutral-700">
                              {day.morning}
                            </p>
                          </div>

                          <div className="rounded-[20px] bg-[#f7f1e9] px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
                              <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                                Afternoon
                              </p>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-neutral-700">
                              {day.afternoon}
                            </p>
                          </div>

                          <div className="rounded-[20px] bg-[#f1ebe3] px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="h-2.5 w-2.5 rounded-full bg-neutral-500" />
                              <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                                Evening
                              </p>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-neutral-700">
                              {day.evening}
                            </p>
                          </div>

                          {index === 0 ? (
                            <div className="rounded-[20px] border border-dashed border-neutral-300 bg-[rgba(250,246,240,0.95)] px-4 py-3">
                              <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                                Atlas note
                              </p>
                              <p className="mt-2 text-sm leading-6 text-neutral-700">
                                This first day is intentionally smooth. Atlas starts with
                                confidence, rhythm, and a feeling of arrival instead of trying to
                                overpack the trip.
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
                    Highlights
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold leading-tight">
                    The emotional hook behind this version
                  </h2>

                  <div className="mt-5 space-y-3">
                    {momentCards.map((card) => (
                      <div
                        key={card.title}
                        className="overflow-hidden rounded-[24px] border border-neutral-200/70 bg-white/90 shadow-[0_10px_28px_rgba(0,0,0,0.04)]"
                      >
                        <div className="h-1.5 w-full bg-[linear-gradient(90deg,#d8ccb9,#f1e7da,#d8ccb9)]" />
                        <div className="p-4">
                          <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                            {card.eyebrow}
                          </p>
                          <h3 className="mt-2 text-base font-semibold text-neutral-900">
                            {card.title}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-neutral-600">{card.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="overflow-hidden rounded-[30px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.97),rgba(239,231,221,0.95))] shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
                  <div className="border-b border-white/60 bg-[linear-gradient(135deg,rgba(251,248,243,0.96),rgba(238,230,220,0.92))] p-5 lg:p-6">
                    <p className="text-[11px] uppercase tracking-[0.34em] text-neutral-500">
                      Booking layer
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold leading-tight">
                      Beautiful now. Bookable next.
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-neutral-600">
                      This is where Atlas starts turning trip planning into action.
                    </p>
                  </div>

                  <div className="grid gap-3 p-5 lg:p-6">
                    <div className="rounded-[24px] border border-neutral-200/70 bg-white/90 p-4">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                        Where to stay
                      </p>
                      <p className="mt-2 text-sm leading-6 text-neutral-700">
                        {bookingLayer.stay}
                      </p>
                    </div>

                    <div className="rounded-[24px] border border-neutral-200/70 bg-white/90 p-4">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                        Getting around
                      </p>
                      <p className="mt-2 text-sm leading-6 text-neutral-700">
                        {bookingLayer.gettingAround}
                      </p>
                    </div>

                    <div className="rounded-[24px] border border-neutral-200/70 bg-white/90 p-4">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                        Book this exact trip
                      </p>
                      <p className="mt-2 text-sm leading-6 text-neutral-700">
                        {bookingLayer.futureHook}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(246,240,232,0.94))] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.08)] lg:p-6">
                  <p className="text-[11px] uppercase tracking-[0.34em] text-neutral-500">
                    Atlas actions
                  </p>

                  {(saveMessage || publishMessage) && (
                    <div className="mt-4 rounded-2xl border border-neutral-200 bg-white/90 px-4 py-3 text-sm text-neutral-700">
                      {publishMessage || saveMessage}
                    </div>
                  )}

                  <div className="mt-4 grid grid-cols-1 gap-3">
                    <button
                      type="button"
                      onClick={handleSave}
                      className="rounded-2xl bg-neutral-900 px-5 py-4 text-sm font-medium text-white shadow-[0_18px_45px_rgba(0,0,0,0.18)] transition hover:translate-y-[-1px]"
                    >
                      Save to My Atlas
                    </button>

                    <button
                      type="button"
                      onClick={handlePublish}
                      className="rounded-2xl border border-neutral-300/90 bg-white/92 px-5 py-4 text-sm font-medium text-neutral-900 transition hover:translate-y-[-1px]"
                    >
                      Publish Journey
                    </button>

                    <Link
                      href="/build"
                      className="inline-flex items-center justify-center rounded-2xl border border-neutral-300/90 bg-[#f7f2eb] px-5 py-4 text-sm font-medium text-neutral-900 transition hover:translate-y-[-1px]"
                    >
                      Build Another Version
                    </Link>

                    <Link
                      href="/atlas"
                      className="inline-flex items-center justify-center rounded-2xl border border-neutral-300/90 bg-white/92 px-5 py-4 text-sm font-medium text-neutral-900 transition hover:translate-y-[-1px]"
                    >
                      Open My Atlas
                    </Link>

                    <Link
                      href="/feed"
                      className="inline-flex items-center justify-center rounded-2xl border border-neutral-300/90 bg-white/92 px-5 py-4 text-sm font-medium text-neutral-900 transition hover:translate-y-[-1px]"
                    >
                      View Atlas World
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}