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
  stayTypeOptions,
  transportTypeOptions,
  travelerOptions,
  tripStyleOptions,
} from "@/app/lib/atlas-trip";
import { uploadPhoto } from "@/app/lib/upload-photo";

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

const buildPulseStats = [
  "Dates",
  "Stay",
  "Transport",
  "Pace",
  "World-ready",
];

const buildStoryCards = [
  {
    label: "Step 01",
    title: "Choose the place",
    text: "Start with any place, saved journey, map pin, or idea.",
  },
  {
    label: "Step 02",
    title: "Set the vibe",
    text: "Choose dates, budget, stay type, transport, pace, and must-do moments.",
  },
  {
    label: "Step 03",
    title: "Build your version",
    text: "Turn it into a journey you can save, publish, share, and remix.",
  },
];

const atlasWorldPreviewCards = [
  {
    title: "Personal agent",
    text: "Atlas learns the way you actually want to travel.",
  },
  {
    title: "Real journey",
    text: "Your plan can become a saved, published, remixable trip.",
  },
  {
    title: "World layer",
    text: "The best builds become inspiration for everyone else.",
  },
];

const sensoryPrompts = [
  "Food worth planning around",
  "Best photo moments",
  "Scenic drives",
  "Local neighborhoods",
  "Sunset spots",
  "Rainy-day backups",
  "One unforgettable splurge",
  "Easy kid-friendly wins",
  "Top excursions",
  "Guided tours",
  "Adventure activities",
];

const excursionOptions = [
  "None",
  "Light exploring",
  "Guided tours",
  "Adventure",
  "All-in activities",
];

const addictiveBuildSections = [
  "Destination",
  "Dates",
  "Travel style",
  "Stay",
  "Transport",
  "Moments",
];

function getDurationFromDates(startDate?: string, endDate?: string) {
  if (!startDate || !endDate) return "";

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "";
  if (end.getTime() < start.getTime()) return "";

  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

  if (diffDays <= 2) return "Weekend";
  if (diffDays === 3) return "3 days";
  if (diffDays === 4) return "4 days";
  if (diffDays === 5) return "5 days";
  if (diffDays <= 7) return "7 days";
  if (diffDays <= 10) return "10 days";
  return "2 weeks";
}

function formatDatePreview(dateValue?: string) {
  if (!dateValue) return "";

  try {
    return new Date(dateValue).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateValue;
  }
}

function sanitizePrefill(raw: unknown): Partial<AtlasTripFormData> {
  if (!raw || typeof raw !== "object") return {};

  const source = raw as Record<string, unknown>;
  const next: Record<string, unknown> = {};

  if (typeof source.destination === "string") next.destination = source.destination;
  if (typeof source.startDate === "string") next.startDate = source.startDate;
  if (typeof source.endDate === "string") next.endDate = source.endDate;
  if (typeof source.duration === "string") next.duration = source.duration;
  if (typeof source.budget === "string") next.budget = source.budget;
  if (typeof source.travelers === "string") next.travelers = source.travelers;
  if (typeof source.tripStyle === "string") next.tripStyle = source.tripStyle;
  if (typeof source.energyLevel === "string") next.energyLevel = source.energyLevel;
  if (typeof source.gemsPreference === "string") next.gemsPreference = source.gemsPreference;
  if (typeof source.travelPace === "string") next.travelPace = source.travelPace;
  if (typeof source.stayType === "string") next.stayType = source.stayType;
  if (typeof source.transportType === "string") next.transportType = source.transportType;
  if (typeof source.flightOrigin === "string") next.flightOrigin = source.flightOrigin;

  if (Array.isArray(source.interests)) {
    next.interests = source.interests.filter(
      (item): item is AtlasInterest => typeof item === "string"
    );
  }

  const startDate =
    typeof next.startDate === "string" ? next.startDate : undefined;
  const endDate =
    typeof next.endDate === "string" ? next.endDate : undefined;

  const calculatedDuration = getDurationFromDates(startDate, endDate);
  if (calculatedDuration) {
    next.duration = calculatedDuration;
  }

  return next as Partial<AtlasTripFormData>;
}

export default function BuildPage() {
  const router = useRouter();
  const [form, setForm] = useState<AtlasTripFormData>(defaultAtlasTripForm);
  const [isReady, setIsReady] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [excursionType, setExcursionType] = useState<string>("");

  useEffect(() => {
    const saved = window.localStorage.getItem(ATLAS_BUILD_STORAGE_KEY);
    const prefill = window.localStorage.getItem(ATLAS_BUILD_PREFILL_STORAGE_KEY);

    let nextForm: AtlasTripFormData = { ...defaultAtlasTripForm };
    let nextExcursionType = "";

    if (prefill) {
      try {
        const parsedPrefill = JSON.parse(prefill);

        nextForm = {
          ...defaultAtlasTripForm,
          ...sanitizePrefill(parsedPrefill),
        };

        if (typeof parsedPrefill.excursionType === "string") {
          nextExcursionType = parsedPrefill.excursionType;
        }

        window.localStorage.removeItem(ATLAS_BUILD_PREFILL_STORAGE_KEY);
      } catch {}
    } else if (saved) {
      try {
        const parsedSaved = JSON.parse(saved);

        nextForm = {
          ...nextForm,
          ...sanitizePrefill(parsedSaved),
        };

        if (typeof parsedSaved.excursionType === "string") {
          nextExcursionType = parsedSaved.excursionType;
        }
      } catch {}
    }

    const calculatedDuration = getDurationFromDates(nextForm.startDate, nextForm.endDate);
    if (calculatedDuration) {
      nextForm.duration = calculatedDuration;
    }

    setForm(nextForm);
    setExcursionType(nextExcursionType);
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    window.localStorage.setItem(
      ATLAS_BUILD_STORAGE_KEY,
      JSON.stringify({
        ...form,
        excursionType,
      })
    );
  }, [form, excursionType, isReady]);

  const canSubmit = useMemo(() => form.destination.trim().length > 0, [form.destination]);

  const autoDuration = useMemo(() => {
    return getDurationFromDates(form.startDate, form.endDate);
  }, [form.startDate, form.endDate]);

  const tripDatePreview = useMemo(() => {
    const start = formatDatePreview(form.startDate);
    const end = formatDatePreview(form.endDate);

    if (start && end) return `${start} - ${end}`;
    return start || end || "";
  }, [form.startDate, form.endDate]);

  const completionScore = useMemo(() => {
    const fields = [
      form.destination,
      form.startDate,
      form.endDate,
      form.duration,
      form.budget,
      form.travelers,
      form.tripStyle,
      form.energyLevel,
      form.gemsPreference,
      form.travelPace,
      form.stayType,
      form.transportType,
      form.flightOrigin,
      excursionType,
    ];

    const filledFields = fields.filter((item) => {
      return typeof item === "string" && item.trim().length > 0;
    }).length;

    const interestBoost = form.interests.length > 0 ? 1 : 0;
    return Math.min(100, Math.round(((filledFields + interestBoost) / 15) * 100));
  }, [
    form.destination,
    form.startDate,
    form.endDate,
    form.duration,
    form.budget,
    form.travelers,
    form.tripStyle,
    form.energyLevel,
    form.gemsPreference,
    form.travelPace,
    form.stayType,
    form.transportType,
    form.flightOrigin,
    form.interests,
    excursionType,
  ]);

  const buildStatusLine = useMemo(() => {
    if (!form.destination.trim()) return "Pick a place and the whole trip starts to unlock.";
    if (!tripDatePreview) return `Now give ${form.destination} real dates so it feels bookable.`;
    if (!form.stayType) return "Choose where you want to stay so Atlas can shape the right neighborhoods.";
    if (!form.transportType) return "Choose how you want to move so the route feels realistic.";
    if (form.interests.length === 0) return "Pick the moments that matter most and Atlas will build around them.";
    if (!excursionType) return "Choose how much you want Atlas to hunt for activities and excursions.";
    return "This is ready to become a real Atlas journey.";
  }, [
    form.destination,
    form.interests.length,
    form.stayType,
    form.transportType,
    tripDatePreview,
    excursionType,
  ]);

  function updateField<K extends keyof AtlasTripFormData>(key: K, value: AtlasTripFormData[K]) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function updateDateField(key: "startDate" | "endDate", value: string) {
    setForm((prev) => {
      const next: AtlasTripFormData = {
        ...prev,
        [key]: value,
      };

      const calculatedDuration = getDurationFromDates(next.startDate, next.endDate);
      if (calculatedDuration) {
        next.duration = calculatedDuration;
      }

      return next;
    });
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

  async function handleSubmit() {
    if (!canSubmit || uploading) return;

    try {
      setUploading(true);

      let uploadedCoverImageUrl = "";

      if (coverFile) {
        uploadedCoverImageUrl = await uploadPhoto(coverFile, "journey-covers");
      }

      const updatedPayload: Record<string, unknown> = {
        ...form,
        excursionType,
      };

      if (uploadedCoverImageUrl) {
        updatedPayload.coverImage = uploadedCoverImageUrl;
      }

      window.localStorage.setItem(
        ATLAS_BUILD_STORAGE_KEY,
        JSON.stringify(updatedPayload)
      );

      router.push("/results");
    } catch (error) {
      console.error("Cover upload failed", error);
      setUploading(false);
    }
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

        <div className="relative mx-auto w-full max-w-7xl px-4 pb-28 pt-4 md:max-w-2xl md:px-6 lg:max-w-5xl lg:px-8 xl:max-w-6xl">
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

              <div className="absolute bottom-5 right-5 hidden max-w-[220px] rounded-[26px] border border-white/25 bg-white/15 p-4 text-white shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur md:block">
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/70">Live build</p>
                <p className="mt-2 text-sm font-medium leading-5 text-white/95">
                  Every choice brings the trip closer to done.
                </p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-white/80 transition-all duration-500"
                    style={{ width: `${completionScore}%` }}
                  />
                </div>
              </div>

              <div className="relative flex min-h-[430px] flex-col justify-end p-5 text-white md:p-7 lg:min-h-[480px] lg:p-8">
                <p className="text-[11px] uppercase tracking-[0.34em] text-white/80">
                  Plan something unforgettable
                </p>
                <h1 className="mt-3 max-w-3xl text-[2.15rem] font-semibold leading-[1.02] md:text-[2.6rem] lg:text-[3.25rem]">
                  Build a trip worth sharing
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85 md:text-base">
                  Plan your trip your way. Atlas builds it into a complete, ready-to-book journey.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {buildPulseStats.map((stat) => (
                    <span
                      key={stat}
                      className="rounded-full border border-white/20 bg-white/14 px-3 py-2 text-[11px] text-white/85 backdrop-blur"
                    >
                      {stat}
                    </span>
                  ))}
                </div>

                <div className="mt-6 flex items-center gap-3 text-xs text-white/70">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10">
                    ↓
                  </span>
                  <span>Scroll, tap, and watch your trip take shape.</span>
                </div>
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
              Atlas is your personal travel agent. It learns your style and builds the trip around you.
            </p>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {buildStoryCards.map((card) => (
              <article
                key={card.title}
                className="rounded-[24px] border border-white/70 bg-white/55 p-4 shadow-[0_16px_35px_rgba(0,0,0,0.06)] backdrop-blur transition hover:-translate-y-1 hover:bg-white/80"
              >
                <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">{card.label}</p>
                <h3 className="mt-2 text-base font-semibold text-neutral-900">{card.title}</h3>
                <p className="mt-2 text-sm leading-5 text-neutral-600">{card.text}</p>
              </article>
            ))}
          </div>

          <div className="mt-5 rounded-[30px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.78),rgba(246,238,226,0.68))] p-4 shadow-[0_20px_55px_rgba(0,0,0,0.07)] backdrop-blur md:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.34em] text-neutral-500">
                  Scroll builder
                </p>
                <h3 className="mt-1 text-xl font-semibold md:text-2xl">
                  Unlock the trip, step by step
                </h3>
              </div>
              <div className="hidden rounded-full bg-neutral-900 px-4 py-2 text-xs font-medium text-white md:block">
                {completionScore}% alive
              </div>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {addictiveBuildSections.map((section, index) => {
                const active = completionScore >= (index + 1) * 14;

                return (
                  <div
                    key={section}
                    className={`min-w-[138px] rounded-2xl border px-4 py-3 transition ${
                      active
                        ? "border-neutral-900 bg-neutral-900 text-white shadow-[0_14px_34px_rgba(0,0,0,0.18)]"
                        : "border-neutral-200/80 bg-white/75 text-neutral-700"
                    }`}
                  >
                    <p className="text-[10px] uppercase tracking-[0.25em] opacity-70">
                      0{index + 1}
                    </p>
                    <p className="mt-1 text-sm font-medium">{section}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 rounded-[24px] border border-neutral-200/70 bg-white/75 p-4">
              <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-500">
                Atlas is building
              </p>
              <p className="mt-2 text-sm font-medium leading-6 text-neutral-800">
                {buildStatusLine}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-3 flex items-end justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.34em] text-neutral-500">
                  Inspiration
                </p>
                <h3 className="mt-1 text-xl font-semibold md:text-2xl">
                  Find the spark for your trip
                </h3>
              </div>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-1 lg:grid lg:grid-cols-3 lg:overflow-visible">
              {inspirationCards.map((card) => (
                <article
                  key={card.title}
                  className="relative min-w-[240px] overflow-hidden rounded-[26px] border border-white/60 bg-white/30 shadow-[0_18px_40px_rgba(0,0,0,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(0,0,0,0.14)] lg:min-w-0"
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

          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
            <div className="rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(245,239,231,0.93))] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.08)] md:p-6">
              <div className="mb-6 rounded-[24px] border border-neutral-200/70 bg-white/70 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">Build flow</p>
                    <h3 className="mt-1 text-lg font-semibold text-neutral-900">Make the trip yours</h3>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white">
                    {completionScore}%
                  </div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-200/80">
                  <div
                    className="h-full rounded-full bg-neutral-900 transition-all duration-500"
                    style={{ width: `${completionScore}%` }}
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-[0.30em] text-neutral-500">
                  Where do you want to go?
                </label>
                <input
                  value={form.destination}
                  onChange={(e) => updateField("destination", e.target.value)}
                  placeholder="Iceland, Costa Rica, Quebec City, Tokyo..."
                  className="mt-3 w-full rounded-2xl border border-white/70 bg-white/90 px-4 py-4 text-base text-neutral-900 outline-none transition focus:border-neutral-400 focus:bg-white focus:shadow-[0_12px_30px_rgba(0,0,0,0.08)]"
                />
              </div>

              <div className="mt-6">
                <label className="text-[11px] uppercase tracking-[0.30em] text-neutral-500">
                  Add a cover photo
                </label>

                <div className="mt-3 rounded-[24px] border border-white/70 bg-white/90 p-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setCoverFile(e.target.files[0]);
                      }
                    }}
                    className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700"
                  />

                  {coverFile ? (
                    <p className="mt-3 text-xs text-neutral-500">
                      Selected: {coverFile.name}
                    </p>
                  ) : (
                    <p className="mt-3 text-xs text-neutral-500">
                      Add a visual cover so your journey feels real in Atlas World.
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label className="text-[11px] uppercase tracking-[0.30em] text-neutral-500">
                  Flying from
                </label>
                <input
                  value={form.flightOrigin ?? ""}
                  onChange={(e) => updateField("flightOrigin", e.target.value)}
                  placeholder="Albany (ALB), NYC (JFK), Boston..."
                  className="mt-3 w-full rounded-2xl border border-white/70 bg-white/90 px-4 py-4 text-base text-neutral-900 outline-none transition focus:border-neutral-400 focus:bg-white focus:shadow-[0_12px_30px_rgba(0,0,0,0.08)]"
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
                      className="rounded-full border border-neutral-200/90 bg-white/85 px-4 py-2.5 text-sm text-neutral-700 transition hover:-translate-y-0.5 hover:bg-neutral-900 hover:text-white hover:shadow-[0_12px_26px_rgba(0,0,0,0.12)]"
                    >
                      {destination}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-[26px] border border-neutral-200/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(248,241,232,0.82))] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                      Trip texture
                    </p>
                    <h4 className="mt-1 text-base font-semibold text-neutral-900">
                      What should Atlas hunt for?
                    </h4>
                  </div>
                  <span className="rounded-full bg-[#efe5d8] px-3 py-1.5 text-xs text-neutral-700">
                    Swipe
                  </span>
                </div>

                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {sensoryPrompts.map((prompt) => (
                    <span
                      key={prompt}
                      className="min-w-fit rounded-full border border-neutral-200/90 bg-white/85 px-4 py-2.5 text-sm text-neutral-700 shadow-[0_10px_22px_rgba(0,0,0,0.04)]"
                    >
                      {prompt}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <label className="text-[11px] uppercase tracking-[0.30em] text-neutral-500">
                  Exact dates
                </label>

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="mb-2 text-[11px] uppercase tracking-[0.25em] text-neutral-500">
                      Start date
                    </p>
                    <input
                      type="date"
                      value={form.startDate ?? ""}
                      onChange={(e) => updateDateField("startDate", e.target.value)}
                      className="w-full rounded-2xl border border-white/70 bg-white/90 px-4 py-4 text-base text-neutral-900 outline-none transition focus:border-neutral-400 focus:bg-white focus:shadow-[0_12px_30px_rgba(0,0,0,0.08)]"
                    />
                  </div>

                  <div>
                    <p className="mb-2 text-[11px] uppercase tracking-[0.25em] text-neutral-500">
                      End date
                    </p>
                    <input
                      type="date"
                      value={form.endDate ?? ""}
                      onChange={(e) => updateDateField("endDate", e.target.value)}
                      className="w-full rounded-2xl border border-white/70 bg-white/90 px-4 py-4 text-base text-neutral-900 outline-none transition focus:border-neutral-400 focus:bg-white focus:shadow-[0_12px_30px_rgba(0,0,0,0.08)]"
                    />
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {tripDatePreview ? (
                    <span className="rounded-full border border-neutral-200/90 bg-white/85 px-4 py-2.5 text-sm text-neutral-700">
                      {tripDatePreview}
                    </span>
                  ) : (
                    <span className="rounded-full border border-dashed border-neutral-300 bg-[#faf5ef] px-4 py-2.5 text-sm text-neutral-600">
                      Add exact dates to make the trip bookable
                    </span>
                  )}

                  {autoDuration ? (
                    <span className="rounded-full bg-neutral-900 px-4 py-2.5 text-sm text-white">
                      Auto duration: {autoDuration}
                    </span>
                  ) : null}
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
                        className={`rounded-full px-4 py-2.5 text-sm transition hover:-translate-y-0.5 ${
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
                        className={`rounded-full px-4 py-2.5 text-sm transition hover:-translate-y-0.5 ${
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
                  Where do you want to stay?
                </label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {stayTypeOptions.map((option) => {
                    const active = form.stayType === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => updateField("stayType", option)}
                        className={`rounded-full px-4 py-2.5 text-sm transition hover:-translate-y-0.5 ${
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
                  How will you get around?
                </label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {transportTypeOptions.map((option) => {
                    const active = form.transportType === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => updateField("transportType", option)}
                        className={`rounded-full px-4 py-2.5 text-sm transition hover:-translate-y-0.5 ${
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
                        className={`rounded-full px-4 py-2.5 text-sm transition hover:-translate-y-0.5 ${
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
                        className={`rounded-2xl px-3 py-3 text-sm transition hover:-translate-y-0.5 ${
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
                        className={`rounded-full px-4 py-2.5 text-sm transition hover:-translate-y-0.5 ${
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
                        className={`rounded-2xl px-4 py-3 text-left text-sm transition hover:-translate-y-0.5 ${
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
                        className={`rounded-2xl px-3 py-3 text-sm transition hover:-translate-y-0.5 ${
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
                        className={`rounded-full px-4 py-2.5 text-sm transition hover:-translate-y-0.5 ${
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

              <div className="mt-6">
                <label className="text-[11px] uppercase tracking-[0.30em] text-neutral-500">
                  Excursions & Activities
                </label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {excursionOptions.map((option) => {
                    const active = excursionType === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setExcursionType(option)}
                        className={`rounded-full px-4 py-2.5 text-sm transition hover:-translate-y-0.5 ${
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
                <p className="mt-3 text-xs leading-5 text-neutral-500">
                  This helps Atlas decide whether to keep the trip simple or surface more activities, tours, and bookable moments.
                </p>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(240,233,224,0.94))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.08)] lg:sticky lg:top-6">
              <p className="text-[11px] uppercase tracking-[0.34em] text-neutral-500">
                Trip readback
              </p>
              <h3 className="mt-2 text-xl font-semibold leading-tight md:text-2xl">
                Your trip is taking shape
              </h3>

              <div className="mt-4 rounded-[22px] border border-neutral-200/80 bg-white/80 p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">Trip signal</p>
                  <p className="text-sm font-semibold text-neutral-900">{completionScore}%</p>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-200/80">
                  <div
                    className="h-full rounded-full bg-neutral-900 transition-all duration-500"
                    style={{ width: `${completionScore}%` }}
                  />
                </div>
                <p className="mt-3 text-xs leading-5 text-neutral-600">
                  The more choices you make, the sharper Atlas gets with the route, stay, pacing, and moments.
                </p>
              </div>

              <p className="mt-3 text-sm leading-6 text-neutral-700">
                {form.destination.trim() ? (
                  <>
                    Atlas is shaping a <span className="font-medium">{form.duration}</span> trip to{" "}
                    <span className="font-medium">{form.destination}</span> for{" "}
                    <span className="font-medium">{form.travelers}</span> travelers with a{" "}
                    <span className="font-medium">{form.tripStyle.toLowerCase()}</span> feel,{" "}
                    <span className="font-medium">{form.energyLevel.toLowerCase()}</span> energy, and a{" "}
                    <span className="font-medium">{form.gemsPreference.toLowerCase()}</span> balance.
                    {tripDatePreview ? (
                      <>
                        {" "}
                        The trip is timed for <span className="font-medium">{tripDatePreview}</span>.
                      </>
                    ) : null}
                    {form.flightOrigin ? (
                      <>
                        {" "}
                        Departure starts from{" "}
                        <span className="font-medium">{form.flightOrigin}</span>.
                      </>
                    ) : null}
                    {form.stayType ? (
                      <>
                        {" "}
                        Stay style is leaning <span className="font-medium">{form.stayType}</span>.
                      </>
                    ) : null}
                    {form.transportType ? (
                      <>
                        {" "}
                        Getting around is planned as{" "}
                        <span className="font-medium">{form.transportType.toLowerCase()}</span>.
                      </>
                    ) : null}
                    {excursionType ? (
                      <>
                        {" "}
                        Excursions are set to{" "}
                        <span className="font-medium">{excursionType.toLowerCase()}</span>.
                      </>
                    ) : null}
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
                <div className="rounded-2xl border border-neutral-200/80 bg-white/85 p-4">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">Duration</p>
                  <p className="mt-2 text-sm font-medium text-neutral-900">{form.duration}</p>
                </div>
                <div className="rounded-2xl border border-neutral-200/80 bg-white/85 p-4">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">Dates</p>
                  <p className="mt-2 text-sm font-medium text-neutral-900">
                    {tripDatePreview || "Flexible"}
                  </p>
                </div>
                <div className="rounded-2xl border border-neutral-200/80 bg-white/85 p-4">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">Stay</p>
                  <p className="mt-2 text-sm font-medium text-neutral-900">
                    {form.stayType || "Open"}
                  </p>
                </div>
                <div className="rounded-2xl border border-neutral-200/80 bg-white/85 p-4">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">
                    Transport
                  </p>
                  <p className="mt-2 text-sm font-medium text-neutral-900">
                    {form.transportType || "Flexible"}
                  </p>
                </div>
              </div>

              {form.flightOrigin ? (
                <div className="mt-3 rounded-2xl border border-neutral-200/80 bg-white/85 p-4">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">
                    Flight origin
                  </p>
                  <p className="mt-2 text-sm font-medium text-neutral-900">{form.flightOrigin}</p>
                </div>
              ) : null}

              <div className="mt-3 rounded-2xl border border-neutral-200/80 bg-white/85 p-4">
                <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">
                  Excursions
                </p>
                <p className="mt-2 text-sm font-medium text-neutral-900">
                  {excursionType || "Choose activity level"}
                </p>
              </div>

              <div className="mt-3 rounded-2xl border border-neutral-200/80 bg-white/85 p-4">
                <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">
                  Moments
                </p>
                {form.interests.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {form.interests.slice(0, 6).map((interest) => (
                      <span
                        key={interest}
                        className="rounded-full bg-neutral-900 px-3 py-1.5 text-xs text-white"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm font-medium text-neutral-900">Pick what matters most</p>
                )}
              </div>

              <div className="mt-3 overflow-hidden rounded-[24px] border border-neutral-200/80 bg-neutral-900 text-white shadow-[0_18px_44px_rgba(0,0,0,0.16)]">
                <div className="p-4">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-white/55">
                    Atlas World preview
                  </p>
                  <h4 className="mt-2 text-base font-semibold">
                    {form.destination.trim() ? `${form.destination} can become remixable` : "Your build can become remixable"}
                  </h4>
                  <p className="mt-2 text-sm leading-5 text-white/70">
                    Save it, publish it, and let other travelers build their version from yours.
                  </p>
                </div>

                <div className="grid border-t border-white/10">
                  {atlasWorldPreviewCards.map((card) => (
                    <div key={card.title} className="border-b border-white/10 px-4 py-3 last:border-b-0">
                      <p className="text-sm font-medium text-white">{card.title}</p>
                      <p className="mt-1 text-xs leading-5 text-white/60">{card.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit || uploading}
                className={`mt-5 w-full rounded-2xl px-5 py-4 text-sm font-medium transition ${
                  canSubmit && !uploading
                    ? "bg-neutral-900 text-white shadow-[0_18px_45px_rgba(0,0,0,0.18)] hover:translate-y-[-1px]"
                    : "cursor-not-allowed bg-neutral-200 text-neutral-500"
                }`}
              >
                {uploading ? "Uploading photo..." : "Plan My Trip"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="fixed bottom-3 left-0 right-0 z-30 px-4 lg:hidden">
        <div className="mx-auto max-w-md rounded-[24px] border border-white/70 bg-white/90 p-3 shadow-[0_18px_55px_rgba(0,0,0,0.18)] backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">
                {completionScore}% built
              </p>
              <p className="mt-1 line-clamp-1 text-sm font-medium text-neutral-900">
                {form.destination.trim() ? `${form.destination} is forming` : "Start your Atlas build"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit || uploading}
              className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                canSubmit && !uploading
                  ? "bg-neutral-900 text-white shadow-[0_14px_34px_rgba(0,0,0,0.18)]"
                  : "cursor-not-allowed bg-neutral-200 text-neutral-500"
              }`}
            >
              {uploading ? "Uploading" : "Plan"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}