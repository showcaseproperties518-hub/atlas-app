"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AtlasStoredJourney,
  formatJourneyDate,
  formatJourneyRange,
  getPublishedJourneys,
  getSavedJourneys,
} from "@/app/lib/atlas-journeys";
import {
  ATLAS_BUILD_PREFILL_STORAGE_KEY,
  ATLAS_BUILD_STORAGE_KEY,
} from "@/app/lib/atlas-trip";

type AtlasJourneyCard = {
  id: string;
  title: string;
  location: string;
  image: string;
  tags: string[];
  published: boolean;
  updatedAt: string;
  source: "saved" | "published";
  isPastJourney: boolean;
  photoCount: number;
  dateRange: string;
  originalJourney: AtlasStoredJourney;
};

type AtlasProfile = {
  name: string;
  username: string;
  bio: string;
  avatar: string;
};


const ATLAS_PROFILE_STORAGE_KEY = "atlas_profile";

const defaultAtlasProfile: AtlasProfile = {
  name: "Your Name",
  username: "yourname",
  bio: "Building journeys, capturing moments, and mapping the world through Atlas.",
  avatar:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
};

function sanitizeUsername(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/^@/, "")
      .replace(/[^a-z0-9]+/g, "")
      .trim() || "yourname"
  );
}

function getInitialProfile() {
  if (typeof window === "undefined") return defaultAtlasProfile;

  try {
    const stored = window.localStorage.getItem(ATLAS_PROFILE_STORAGE_KEY);
    if (!stored) return defaultAtlasProfile;

    const parsed = JSON.parse(stored) as Partial<AtlasProfile>;

    return {
      name: parsed.name || defaultAtlasProfile.name,
      username: sanitizeUsername(parsed.username || defaultAtlasProfile.username),
      bio: parsed.bio || defaultAtlasProfile.bio,
      avatar: parsed.avatar || defaultAtlasProfile.avatar,
    };
  } catch {
    return defaultAtlasProfile;
  }
}

function mapJourneyToCard(
  journey: AtlasStoredJourney,
  fallbackPublished = false
): AtlasJourneyCard {
  return {
    id: journey.id,
    title: journey.trip.title,
    location: journey.destination,
    image: journey.coverImage,
    tags: [
      journey.form.gemsPreference,
      journey.form.tripStyle,
      journey.form.energyLevel,
    ].slice(0, 3),
    published: fallbackPublished || journey.source === "published",
    updatedAt: journey.updatedAt,
    source: fallbackPublished ? "published" : journey.source,
    isPastJourney: Boolean(journey.isPastJourney),
    photoCount: journey.photos?.length ?? 0,
    dateRange: formatJourneyRange(journey.startDate, journey.endDate),
    originalJourney: journey,
  };
}

export default function AtlasPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<AtlasProfile>(defaultAtlasProfile);
  const [draftProfile, setDraftProfile] = useState<AtlasProfile>(defaultAtlasProfile);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [savedJourneys, setSavedJourneys] = useState<AtlasStoredJourney[]>([]);
  const [publishedJourneys, setPublishedJourneys] = useState<AtlasStoredJourney[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadedProfile = getInitialProfile();
    const saved = getSavedJourneys();
    const published = getPublishedJourneys();

    setProfile(loadedProfile);
    setDraftProfile(loadedProfile);
    setSavedJourneys(saved);
    setPublishedJourneys(published);
    setIsReady(true);
  }, []);

  const publishedIds = useMemo(() => {
    return new Set(publishedJourneys.map((journey) => journey.id));
  }, [publishedJourneys]);

  const privateJourneys = useMemo(() => {
    return savedJourneys.filter((journey) => !publishedIds.has(journey.id));
  }, [publishedIds, savedJourneys]);

  const allJourneyCards = useMemo(() => {
    const privateCards = privateJourneys.map((journey) => mapJourneyToCard(journey, false));
    const publishedCards = publishedJourneys.map((journey) => mapJourneyToCard(journey, true));
    return [...publishedCards, ...privateCards];
  }, [privateJourneys, publishedJourneys]);

  const privateCards = useMemo(() => {
    return privateJourneys.map((journey) => mapJourneyToCard(journey, false));
  }, [privateJourneys]);

  const publishedCards = useMemo(() => {
    return publishedJourneys.map((journey) => mapJourneyToCard(journey, true));
  }, [publishedJourneys]);

  const pastJourneyCount = useMemo(() => {
    return allJourneyCards.filter((journey) => journey.isPastJourney).length;
  }, [allJourneyCards]);

  const destinationsCount = useMemo(() => {
    const unique = new Set(
      allJourneyCards
        .map((journey) => journey.location.trim())
        .filter(Boolean)
        .map((journey) => journey.toLowerCase())
    );

    return unique.size;
  }, [allJourneyCards]);

  const totalTripsCount = allJourneyCards.length;
  const publishedTripsCount = publishedCards.length;

  function handleOpenEditProfile() {
    setDraftProfile(profile);
    setIsEditingProfile(true);
    setProfileMessage("");
  }

  function handleSaveProfile() {
    const nextProfile: AtlasProfile = {
      name: draftProfile.name.trim() || "Atlas Creator",
      username: sanitizeUsername(draftProfile.username),
      bio:
        draftProfile.bio.trim() ||
        "Building journeys, capturing moments, and mapping the world through Atlas.",
      avatar: draftProfile.avatar.trim() || defaultAtlasProfile.avatar,
    };

    setProfile(nextProfile);
    setDraftProfile(nextProfile);
    window.localStorage.setItem(ATLAS_PROFILE_STORAGE_KEY, JSON.stringify(nextProfile));
    setIsEditingProfile(false);
    setProfileMessage("Profile saved");
    window.setTimeout(() => setProfileMessage(""), 2200);
  }

  function handleBuildMyVersion(journey: AtlasStoredJourney) {
    const prefill = {
      destination: journey.destination,
      duration: journey.form.duration,
      startDate: journey.form.startDate,
      endDate: journey.form.endDate,
      budget: journey.form.budget,
      travelers: journey.form.travelers,
      energyLevel: journey.form.energyLevel,
      tripStyle: journey.form.tripStyle,
      stayType: journey.form.stayType,
      transportType: journey.form.transportType,
      gemsPreference: journey.form.gemsPreference,
      travelPace: journey.form.travelPace,
      interests: journey.form.interests,
      flightOrigin: journey.form.flightOrigin,
      coverImage: journey.coverImage,
    };

    window.localStorage.setItem(
      ATLAS_BUILD_PREFILL_STORAGE_KEY,
      JSON.stringify(prefill)
    );

    router.push("/build");
  }

  function handleViewJourney(journey: AtlasJourneyCard) {
    const originalJourney = journey.originalJourney;

    const resultsPayload = {
      destination: originalJourney.destination,
      duration: originalJourney.form.duration,
      startDate: originalJourney.form.startDate,
      endDate: originalJourney.form.endDate,
      budget: originalJourney.form.budget,
      travelers: originalJourney.form.travelers,
      energyLevel: originalJourney.form.energyLevel,
      tripStyle: originalJourney.form.tripStyle,
      stayType: originalJourney.form.stayType,
      transportType: originalJourney.form.transportType,
      gemsPreference: originalJourney.form.gemsPreference,
      travelPace: originalJourney.form.travelPace,
      interests: originalJourney.form.interests,
      flightOrigin: originalJourney.form.flightOrigin,
      coverImage: originalJourney.coverImage,
    };

    window.localStorage.removeItem(ATLAS_BUILD_PREFILL_STORAGE_KEY);
    window.localStorage.setItem(ATLAS_BUILD_STORAGE_KEY, JSON.stringify(resultsPayload));

    router.push("/results");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f7fb] text-slate-900">
      <section className="relative h-[360px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1800&q=80"
          alt="Amalfi Coast"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-white/35" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-white/25 to-[#f5f7fb]" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(15,23,42,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.10)_1px,transparent_1px)] [background-size:40px_40px]" />

        <svg
          className="absolute inset-0 h-full w-full opacity-25"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            d="M0,55 C15,48 25,62 40,54 C52,48 65,62 78,55 C88,50 95,56 100,52"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="0.35"
            fill="none"
          />
          <path
            d="M0,62 C14,56 28,68 42,61 C54,55 68,68 82,61 C91,57 97,61 100,59"
            stroke="rgba(255,255,255,0.8)"
            strokeWidth="0.35"
            fill="none"
          />
          <path
            d="M0,70 C16,64 28,76 44,69 C58,63 72,76 86,69 C94,65 99,69 100,68"
            stroke="rgba(255,255,255,0.75)"
            strokeWidth="0.35"
            fill="none"
          />
        </svg>

        <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-end px-5 pb-10">
          <h1 className="text-5xl font-bold tracking-tight">My Atlas</h1>
          <p className="mt-2 max-w-2xl text-lg text-slate-700">
            Your personal travel map, saved journeys, and published stories
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 pb-12">
        <section className="mt-6 rounded-[28px] border border-white/70 bg-white/75 p-6 shadow-xl backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="h-24 w-24 overflow-hidden rounded-full shadow-md ring-4 ring-white/70">
                <img
                  src={profile.avatar}
                  alt={`${profile.name} profile`}
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-3xl font-bold">{profile.name}</h2>
                  <span className="rounded-full bg-[#d6b98c] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-950">
                    Atlas Creator
                  </span>
                </div>
                <p className="mt-1 text-slate-500">@{profile.username} · Posted by you</p>

                <p className="mt-3 max-w-2xl text-slate-600">{profile.bio}</p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleOpenEditProfile}
                    className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    Edit Profile
                  </button>

                  <Link
                    href={`/user/${profile.username}`}
                    className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    View Public Profile
                  </Link>

                  {profileMessage ? (
                    <span className="rounded-full bg-emerald-50 px-5 py-2 text-sm font-semibold text-emerald-700">
                      {profileMessage}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href="/build"
                className="rounded-full bg-slate-900 px-6 py-3 text-center font-semibold text-white shadow"
              >
                Build New Trip
              </Link>

              <Link
                href="/atlas/add"
                className="rounded-full border border-slate-200 bg-white px-6 py-3 text-center font-semibold text-slate-900"
              >
                Add Past Journey
              </Link>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl bg-white/85 p-4 shadow-sm">
              <p className="text-3xl font-bold">{destinationsCount}</p>
              <p className="text-sm text-slate-500">Destinations</p>
            </div>
            <div className="rounded-xl bg-white/85 p-4 shadow-sm">
              <p className="text-3xl font-bold">{totalTripsCount}</p>
              <p className="text-sm text-slate-500">Trips</p>
            </div>
            <div className="rounded-xl bg-white/85 p-4 shadow-sm">
              <p className="text-3xl font-bold">{publishedTripsCount}</p>
              <p className="text-sm text-slate-500">Published</p>
            </div>
            <div className="rounded-xl bg-white/85 p-4 shadow-sm">
              <p className="text-3xl font-bold">{pastJourneyCount}</p>
              <p className="text-sm text-slate-500">Past trips</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <Link
              href="/build"
              className="group overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(243,236,226,0.92))] p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
                Atlas Agent
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                Build a new trip
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Use Atlas as your travel agent to shape a new itinerary around your style,
                budget, pace, and destination.
              </p>
              <div className="mt-5 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                Start Building
              </div>
            </Link>

            <Link
              href="/atlas/add"
              className="group overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(236,244,250,0.92))] p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
                Atlas Memories
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                Add a past journey
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Start with where you went and your photos. Turn old adventures into visual Atlas
                journeys you can save, map, and publish.
              </p>
              <div className="mt-5 inline-flex rounded-full bg-[#2f6f94] px-4 py-2 text-sm font-semibold text-white">
                Upload Past Trip
              </div>
            </Link>
          </div>

          <div className="mt-8 rounded-[24px] bg-sky-50/90 p-5">
            <h3 className="text-lg font-semibold">Your map should feel alive</h3>
            <p className="mt-2 text-slate-600">
              Atlas gets stronger when your real trips, photos, and memories become part of the
              world map. Past journeys should be easy to add, visual to browse, and ready to remix.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/atlas/add"
                className="rounded-full bg-blue-600 px-5 py-2 font-semibold text-white"
              >
                Add Photos from a Past Trip
              </Link>

              <Link
                href="/feed"
                className="rounded-full border border-slate-300 px-5 py-2"
              >
                View Atlas World
              </Link>
            </div>
          </div>
        </section>

        {!isReady ? (
          <section className="mt-8 rounded-[28px] border border-white/70 bg-white/80 p-8 shadow-lg">
            <p className="text-sm text-slate-500">Loading your journeys...</p>
          </section>
        ) : totalTripsCount === 0 ? (
          <section className="mt-8 rounded-[28px] border border-white/70 bg-white/80 p-8 shadow-lg">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold">Your Atlas is empty for now</h2>
              <p className="mt-3 text-slate-600">
                Start with a new trip or add a past journey with photos to begin building your
                travel map.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/build"
                  className="rounded-full bg-slate-900 px-5 py-3 font-semibold text-white"
                >
                  Build Your First Trip
                </Link>
                <Link
                  href="/atlas/add"
                  className="rounded-full border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-900"
                >
                  Add a Past Journey
                </Link>
              </div>
            </div>
          </section>
        ) : (
          <>
            {privateCards.length > 0 ? (
              <section className="mt-8">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold">Saved Journeys</h2>
                    <p className="mt-2 text-sm text-slate-500">
                      Private versions saved inside your Atlas
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {privateCards.map((journey) => (
                    <div
                      key={journey.id}
                      className="group overflow-hidden rounded-[24px] bg-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <button
                        type="button"
                        onClick={() => handleViewJourney(journey)}
                        className="block w-full text-left"
                      >
                        <div className="relative h-72">
                          <img
                            src={journey.image}
                            alt={journey.title}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                          />

                          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.06),rgba(0,0,0,0.18),rgba(0,0,0,0.52))]" />

                          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                            <span className="rounded-full bg-black/45 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                              Private
                            </span>
                            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                              Posted by you
                            </span>

                            {journey.isPastJourney ? (
                              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                                Past Journey
                              </span>
                            ) : null}

                            {journey.photoCount > 0 ? (
                              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                                {journey.photoCount}{" "}
                                {journey.photoCount === 1 ? "Photo" : "Photos"}
                              </span>
                            ) : null}
                          </div>

                          <div className="absolute bottom-4 left-4 right-4 text-white">
                            <h3 className="text-xl font-bold">{journey.title}</h3>
                            <p className="mt-1 text-sm text-white/90">{journey.location}</p>

                            {journey.dateRange ? (
                              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/80">
                                {journey.dateRange}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </button>

                      <div className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {journey.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3">
                          <p className="text-sm text-slate-500">
                            Updated {formatJourneyDate(journey.updatedAt)}
                          </p>
                        </div>

                        <div className="mt-4 flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleViewJourney(journey)}
                            className="flex-1 rounded-full bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white transition hover:scale-[1.01]"
                          >
                            View Journey
                          </button>

                          <button
                            type="button"
                            onClick={() => handleBuildMyVersion(journey.originalJourney)}
                            className="flex-1 rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:scale-[1.01]"
                          >
                            Build My Version
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {publishedCards.length > 0 ? (
              <section className="mt-10">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold">Published Journeys</h2>
                    <p className="mt-2 text-sm text-slate-500">
                      Trips you’ve already shared to Atlas World
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {publishedCards.map((journey) => (
                    <div
                      key={journey.id}
                      className="group overflow-hidden rounded-[24px] bg-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <button
                        type="button"
                        onClick={() => handleViewJourney(journey)}
                        className="block w-full text-left"
                      >
                        <div className="relative h-72">
                          <img
                            src={journey.image}
                            alt={journey.title}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                          />

                          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.06),rgba(0,0,0,0.18),rgba(0,0,0,0.52))]" />

                          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                            <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-medium text-white">
                              Published
                            </span>
                            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                              Posted by you
                            </span>

                            {journey.isPastJourney ? (
                              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                                Past Journey
                              </span>
                            ) : null}

                            {journey.photoCount > 0 ? (
                              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                                {journey.photoCount}{" "}
                                {journey.photoCount === 1 ? "Photo" : "Photos"}
                              </span>
                            ) : null}
                          </div>

                          <div className="absolute bottom-4 left-4 right-4 text-white">
                            <h3 className="text-xl font-bold">{journey.title}</h3>
                            <p className="mt-1 text-sm text-white/90">{journey.location}</p>

                            {journey.dateRange ? (
                              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/80">
                                {journey.dateRange}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </button>

                      <div className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {journey.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3">
                          <p className="text-sm text-slate-500">
                            Published {formatJourneyDate(journey.updatedAt)}
                          </p>
                        </div>

                        <div className="mt-4 flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleViewJourney(journey)}
                            className="flex-1 rounded-full bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white transition hover:scale-[1.01]"
                          >
                            View Journey
                          </button>

                          <button
                            type="button"
                            onClick={() => handleBuildMyVersion(journey.originalJourney)}
                            className="flex-1 rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:scale-[1.01]"
                          >
                            Build My Version
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </>
        )}
      </div>

      {isEditingProfile ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 px-4 pb-4 backdrop-blur-sm sm:items-center sm:pb-0">
          <div className="w-full max-w-xl overflow-hidden rounded-[32px] border border-white/70 bg-white shadow-[0_30px_120px_rgba(15,23,42,0.35)]">
            <div className="border-b border-slate-100 bg-[#f8f1e6] px-6 py-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8a6631]">
                Atlas Profile
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                Edit your profile
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                This saves on this browser for tonight. Later we can sync it to Supabase accounts.
              </p>
            </div>

            <div className="space-y-4 p-6">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Name</span>
                <input
                  value={draftProfile.name}
                  onChange={(e) =>
                    setDraftProfile((current) => ({
                      ...current,
                      name: e.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#d6b98c] focus:ring-4 focus:ring-[#d6b98c]/15"
                  placeholder="Dan McCann"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Username</span>
                <div className="mt-2 flex overflow-hidden rounded-2xl border border-slate-200 bg-white focus-within:border-[#d6b98c] focus-within:ring-4 focus-within:ring-[#d6b98c]/15">
                  <span className="flex items-center bg-slate-50 px-4 text-sm font-semibold text-slate-500">
                    @
                  </span>
                  <input
                    value={draftProfile.username}
                    onChange={(e) =>
                      setDraftProfile((current) => ({
                        ...current,
                        username: sanitizeUsername(e.target.value),
                      }))
                    }
                    className="w-full px-4 py-3 text-sm outline-none"
                    placeholder="dansworld"
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Bio</span>
                <textarea
                  value={draftProfile.bio}
                  onChange={(e) =>
                    setDraftProfile((current) => ({
                      ...current,
                      bio: e.target.value,
                    }))
                  }
                  rows={4}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#d6b98c] focus:ring-4 focus:ring-[#d6b98c]/15"
                  placeholder="Real trips. Real builds. Mapping the world one journey at a time."
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Avatar image URL</span>
                <input
                  value={draftProfile.avatar}
                  onChange={(e) =>
                    setDraftProfile((current) => ({
                      ...current,
                      avatar: e.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#d6b98c] focus:ring-4 focus:ring-[#d6b98c]/15"
                  placeholder="https://..."
                />
              </label>

              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                <img
                  src={draftProfile.avatar || defaultAtlasProfile.avatar}
                  alt="Profile preview"
                  className="h-14 w-14 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-slate-950">
                    {draftProfile.name || "Atlas Creator"}
                  </p>
                  <p className="text-sm text-slate-500">
                    @{sanitizeUsername(draftProfile.username)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-slate-100 bg-slate-50 px-6 py-5">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      ) : null}

    </main>
  );
}