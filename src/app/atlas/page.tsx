"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
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
import { createClient } from "@/app/lib/supabase-client";

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
  bannerImage?: string;
  location?: string;
  travelerType?: string;
  countriesVisited?: number;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  facebook?: string;
  joinedAt?: string;
};


const ATLAS_PROFILE_STORAGE_KEY = "atlas_profile";

const defaultAtlasProfile: AtlasProfile = {
  name: "",
  username: "",
  bio: "",
  avatar: "",
  bannerImage: "",
  location: "",
  travelerType: "Adventure Traveler",
  countriesVisited: 0,
  instagram: "",
  tiktok: "",
  youtube: "",
  facebook: "",
  joinedAt: "2026",
};

function sanitizeUsername(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/^@/, "")
      .replace(/[^a-z0-9]+/g, "")
      .trim() || ""
  );
}

function getInitialProfile() {
  if (typeof window === "undefined") return defaultAtlasProfile;

  try {
    const stored = window.localStorage.getItem(ATLAS_PROFILE_STORAGE_KEY);
    if (!stored) return defaultAtlasProfile;

    const parsed = JSON.parse(stored) as Partial<AtlasProfile>;

    return {
      name: parsed.name || "",
      username: sanitizeUsername(parsed.username || ""),
      bio: parsed.bio || "",
      avatar: parsed.avatar || "",
      bannerImage: parsed.bannerImage || "",
      location: parsed.location || "",
      travelerType: parsed.travelerType || "Adventure Traveler",
      countriesVisited: parsed.countriesVisited || 0,
      instagram: parsed.instagram || "",
      tiktok: parsed.tiktok || "",
      youtube: parsed.youtube || "",
      facebook: parsed.facebook || "",
      joinedAt: parsed.joinedAt || "2026",
    };
  } catch {
    return defaultAtlasProfile;
  }
}


function getDisplayName(profile: AtlasProfile) {
  return profile.name.trim() || "Add your name";
}

function getDisplayUsername(profile: AtlasProfile) {
  return sanitizeUsername(profile.username) || "chooseusername";
}

function getInitialLetter(profile: AtlasProfile) {
  const source = profile.name.trim() || profile.username.trim() || "A";
  return source.charAt(0).toUpperCase();
}

function normalizeHandle(value?: string) {
  return (value || "").trim().replace(/^@/, "");
}

function ProfileAvatar({
  profile,
  size = "large",
}: {
  profile: AtlasProfile;
  size?: "small" | "medium" | "large";
}) {
  const sizeClass =
    size === "small" ? "h-14 w-14 text-xl" : size === "medium" ? "h-24 w-24 text-3xl" : "h-28 w-28 text-4xl";

  return (
    <div className={`${sizeClass} overflow-hidden rounded-full shadow-md ring-4 ring-white/80`}>
      {profile.avatar ? (
        <img
          src={profile.avatar}
          alt={`${getDisplayName(profile)} profile`}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#d6b98c,#4f8ef7)] font-semibold text-white">
          {getInitialLetter(profile)}
        </div>
      )}
    </div>
  );
}

function SocialLink({ label, value }: { label: string; value?: string }) {
  if (!value) return null;

  return (
    <span className="rounded-full border border-slate-200 bg-white/85 px-3 py-1.5 text-xs font-semibold text-slate-700">
      {label} @{normalizeHandle(value)}
    </span>
  );
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
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [authMessage, setAuthMessage] = useState("");

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

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setAuthUser(data.user ?? null);
      setIsAuthReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null);
      setIsAuthReady(true);
    });

    return () => {
      subscription.unsubscribe();
    };
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
  const isLoggedIn = Boolean(authUser);
  const loginRedirect = "/login";
  const accountEmail = authUser?.email || "";

  async function handleSignOut() {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setAuthUser(null);
      setAuthMessage("Signed out of Atlas");
      window.setTimeout(() => setAuthMessage(""), 2200);
    } catch (error) {
      console.error("Sign out failed", error);
      setAuthMessage("Could not sign out. Try again.");
      window.setTimeout(() => setAuthMessage(""), 2600);
    }
  }

  function handleOpenEditProfile() {
    setDraftProfile(profile);
    setIsEditingProfile(true);
    setProfileMessage("");
  }

  function handleProfileImageUpload(file: File | null) {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      if (typeof result === "string") {
        setDraftProfile((current) => ({
          ...current,
          avatar: result,
        }));
      }
    };

    reader.readAsDataURL(file);
  }

  function handleSaveProfile() {
    const nextProfile: AtlasProfile = {
      name: draftProfile.name.trim(),
      username: sanitizeUsername(draftProfile.username),
      bio: draftProfile.bio.trim(),
      avatar: draftProfile.avatar.trim(),
      bannerImage: draftProfile.bannerImage?.trim() || "",
      location: draftProfile.location?.trim() || "",
      travelerType: draftProfile.travelerType?.trim() || "Adventure Traveler",
      countriesVisited: Number(draftProfile.countriesVisited || 0),
      instagram: normalizeHandle(draftProfile.instagram),
      tiktok: normalizeHandle(draftProfile.tiktok),
      youtube: draftProfile.youtube?.trim() || "",
      facebook: normalizeHandle(draftProfile.facebook),
      joinedAt: draftProfile.joinedAt?.trim() || "2026",
    };

    setProfile(nextProfile);
    setDraftProfile(nextProfile);
    window.localStorage.setItem(ATLAS_PROFILE_STORAGE_KEY, JSON.stringify(nextProfile));
    setIsEditingProfile(false);
    setProfileMessage(isLoggedIn ? "Profile saved locally — Supabase profile sync is next" : "Profile saved locally — log in to keep it across devices") ;
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
          src={
            profile.bannerImage ||
            publishedCards[0]?.image ||
            privateCards[0]?.image ||
            "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1800&q=80"
          }
          alt="Atlas profile banner"
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
        <section className="mt-6 rounded-[28px] border border-white/70 bg-white/75 p-5 shadow-xl backdrop-blur-xl sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8a6631]">
                Atlas account
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                {isLoggedIn ? "Your Atlas Log is active" : "Start your Atlas Log"}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                {isLoggedIn
                  ? `Signed in${accountEmail ? ` as ${accountEmail}` : ""}. Your next step is syncing this profile and your journeys to Supabase so they work across devices.`
                  : "Build trips for free. Log in when you want to save your profile, publish journeys, upload memories, and keep your travel captain’s log across devices."}
              </p>
              {!isAuthReady ? (
                <p className="mt-2 text-xs font-semibold text-slate-500">Checking account session...</p>
              ) : null}
              {authMessage ? (
                <p className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                  {authMessage}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              {isLoggedIn ? (
                <>
                  <button
                    type="button"
                    onClick={handleOpenEditProfile}
                    className="rounded-full bg-slate-900 px-6 py-3 text-center text-sm font-semibold text-white shadow transition hover:-translate-y-0.5"
                  >
                    Edit Travel Identity
                  </button>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="rounded-full border border-slate-200 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href={loginRedirect}
                    className="rounded-full bg-slate-900 px-6 py-3 text-center text-sm font-semibold text-white shadow transition hover:-translate-y-0.5"
                  >
                    Start My Atlas
                  </Link>
                  <Link
                    href="/build"
                    className="rounded-full border border-slate-200 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5"
                  >
                    Build Without Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-white/70 bg-white/75 p-6 shadow-xl backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative">
                <ProfileAvatar profile={profile} size="medium" />
                {!profile.avatar ? (
                  <button
                    type="button"
                    onClick={handleOpenEditProfile}
                    className="absolute -bottom-2 left-1/2 w-max -translate-x-1/2 rounded-full bg-slate-950 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white shadow-lg"
                  >
                    Add photo
                  </button>
                ) : null}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-3xl font-bold">{getDisplayName(profile)}</h2>
                  <span className="rounded-full bg-[#d6b98c] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-950">
                    {profile.travelerType || "Traveler"}
                  </span>
                </div>
                <p className="mt-1 text-slate-500">@{getDisplayUsername(profile)} · Travel identity</p>

                <p className="mt-3 max-w-2xl text-slate-600">
                  {profile.bio || "Add a short bio so your trips feel personal, real, and worth following."}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {profile.location ? (
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
                      {profile.location}
                    </span>
                  ) : null}

                  {profile.countriesVisited ? (
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
                      {profile.countriesVisited} countries visited
                    </span>
                  ) : null}

                  {profile.joinedAt ? (
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
                      Atlas since {profile.joinedAt}
                    </span>
                  ) : null}

                  {!profile.location && !profile.countriesVisited ? (
                    <span className="rounded-full border border-dashed border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-500">
                      Add location + travel style
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <SocialLink label="IG" value={profile.instagram} />
                  <SocialLink label="TikTok" value={profile.tiktok} />
                  <SocialLink label="FB" value={profile.facebook} />
                  {profile.youtube ? (
                    <span className="rounded-full border border-slate-200 bg-white/85 px-3 py-1.5 text-xs font-semibold text-slate-700">
                      YouTube
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleOpenEditProfile}
                    className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    Edit Profile
                  </button>

                  <Link
                    href={`/user/${getDisplayUsername(profile)}`}
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
            <h3 className="text-lg font-semibold">Your travel identity should feel alive</h3>
            <p className="mt-2 text-slate-600">
              Atlas gets stronger when your real trips, photos, videos, and memories become part of your profile and the world map. Past journeys should be easy to add, visual to browse, and ready to remix.
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
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 px-3 pb-3 pt-6 backdrop-blur-sm sm:items-center sm:px-4 sm:pb-0">
          <div className="max-h-[94vh] w-full max-w-xl overflow-hidden rounded-[32px] border border-white/70 bg-white shadow-[0_30px_120px_rgba(15,23,42,0.35)]">
            <div className="border-b border-slate-100 bg-[#f8f1e6] px-6 py-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8a6631]">
                Atlas Profile
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                Edit your profile
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Build your Atlas identity. Add your photo, travel style, location, and social handles.
              </p>
            </div>

            <div className="max-h-[68vh] space-y-4 overflow-y-auto p-6">
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

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Location</span>
                  <input
                    value={draftProfile.location || ""}
                    onChange={(e) =>
                      setDraftProfile((current) => ({
                        ...current,
                        location: e.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#d6b98c] focus:ring-4 focus:ring-[#d6b98c]/15"
                    placeholder="Albany, NY"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Traveler type</span>
                  <input
                    value={draftProfile.travelerType || ""}
                    onChange={(e) =>
                      setDraftProfile((current) => ({
                        ...current,
                        travelerType: e.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#d6b98c] focus:ring-4 focus:ring-[#d6b98c]/15"
                    placeholder="Adventure Traveler"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Countries visited</span>
                  <input
                    type="number"
                    min="0"
                    value={draftProfile.countriesVisited || 0}
                    onChange={(e) =>
                      setDraftProfile((current) => ({
                        ...current,
                        countriesVisited: Number(e.target.value || 0),
                      }))
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#d6b98c] focus:ring-4 focus:ring-[#d6b98c]/15"
                    placeholder="7"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Atlas since</span>
                  <input
                    value={draftProfile.joinedAt || ""}
                    onChange={(e) =>
                      setDraftProfile((current) => ({
                        ...current,
                        joinedAt: e.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#d6b98c] focus:ring-4 focus:ring-[#d6b98c]/15"
                    placeholder="2026"
                  />
                </label>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <span className="text-sm font-semibold text-slate-700">Social handles</span>
                <p className="mt-1 text-xs text-slate-500">
                  These prepare Atlas for the future social share layer.
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <input
                    value={draftProfile.instagram || ""}
                    onChange={(e) =>
                      setDraftProfile((current) => ({
                        ...current,
                        instagram: normalizeHandle(e.target.value),
                      }))
                    }
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                    placeholder="Instagram handle"
                  />

                  <input
                    value={draftProfile.tiktok || ""}
                    onChange={(e) =>
                      setDraftProfile((current) => ({
                        ...current,
                        tiktok: normalizeHandle(e.target.value),
                      }))
                    }
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                    placeholder="TikTok handle"
                  />

                  <input
                    value={draftProfile.facebook || ""}
                    onChange={(e) =>
                      setDraftProfile((current) => ({
                        ...current,
                        facebook: normalizeHandle(e.target.value),
                      }))
                    }
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                    placeholder="Facebook profile/page"
                  />

                  <input
                    value={draftProfile.youtube || ""}
                    onChange={(e) =>
                      setDraftProfile((current) => ({
                        ...current,
                        youtube: e.target.value,
                      }))
                    }
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                    placeholder="YouTube channel URL"
                  />
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <span className="text-sm font-semibold text-slate-700">Profile photo</span>

                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <ProfileAvatar profile={draftProfile} size="medium" />

                  <div className="flex-1">
                    <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                      Add Your Photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleProfileImageUpload(e.target.files?.[0] || null)}
                      />
                    </label>

                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      No fake avatar. Add a real photo or keep the clean initials placeholder.
                    </p>

                    {draftProfile.avatar ? (
                      <button
                        type="button"
                        onClick={() =>
                          setDraftProfile((current) => ({
                            ...current,
                            avatar: "",
                          }))
                        }
                        className="mt-3 text-xs font-semibold text-slate-500 underline decoration-slate-300 underline-offset-4"
                      >
                        Remove photo
                      </button>
                    ) : null}
                  </div>
                </div>

                <details className="mt-4 rounded-2xl bg-white p-3">
                  <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Or paste image URL
                  </summary>
                  <input
                    value={draftProfile.avatar}
                    onChange={(e) =>
                      setDraftProfile((current) => ({
                        ...current,
                        avatar: e.target.value,
                      }))
                    }
                    className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#d6b98c] focus:ring-4 focus:ring-[#d6b98c]/15"
                    placeholder="https://..."
                  />
                </details>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                <ProfileAvatar profile={draftProfile} size="small" />
                <div>
                  <p className="font-semibold text-slate-950">
                    {getDisplayName(draftProfile)}
                  </p>
                  <p className="text-sm text-slate-500">
                    @{getDisplayUsername(draftProfile)} · {draftProfile.travelerType || "Traveler"}
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