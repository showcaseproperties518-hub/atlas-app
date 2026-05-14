"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ATLAS_BUILD_PREFILL_STORAGE_KEY,
  ATLAS_BUILD_STORAGE_KEY,
} from "@/app/lib/atlas-trip";
import { createClient } from "@/app/lib/supabase-client";

type ProfileJourney = {
  id: string;
  title: string;
  destination: string;
  image: string;
  duration: string;
  budget: string;
  travelers: string;
  tripStyle: string;
  energyLevel: string;
  gemsPreference: string;
  travelPace: string;
  stayType: string;
  transportType: string;
  flightOrigin: string;
  interests: string[];
  tags: string[];
  dateRange: string;
  description: string;
  published: boolean;
  photoCount: number;
  remixes: number;
  saves: number;
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

const fallbackCreatorJourneys: ProfileJourney[] = [
  {
    id: "costa-rica-waterfalls-coast",
    title: "Costa Rica Waterfalls + Coast",
    destination: "Costa Rica",
    image:
      "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=1600&q=80",
    duration: "7 days",
    budget: "$2,500-$4,500",
    travelers: "Friends",
    tripStyle: "Adventure",
    energyLevel: "Balanced",
    gemsPreference: "Mix of both",
    travelPace: "Flexible",
    stayType: "Best value mix",
    transportType: "Rental car",
    flightOrigin: "Albany, NY",
    interests: ["Nature", "Food", "Adventure", "Photo spots"],
    tags: ["Published", "Tropical", "Adventure", "Photo route"],
    dateRange: "Apr 2026",
    description:
      "A high-reward route with jungle, waterfalls, food, and coastal energy built for a trip that feels big without being chaotic.",
    published: true,
    photoCount: 18,
    remixes: 214,
    saves: 91,
  },
  {
    id: "iceland-photo-route",
    title: "Iceland Photo-First Escape",
    destination: "Iceland",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
    duration: "5 days",
    budget: "$2,000-$4,000",
    travelers: "Couple",
    tripStyle: "Adventure",
    energyLevel: "Balanced",
    gemsPreference: "Top spots",
    travelPace: "Planner",
    stayType: "Hotel",
    transportType: "Rental car",
    flightOrigin: "Albany, NY",
    interests: ["Nature", "Scenic drives", "Photo spots"],
    tags: ["Published", "Roadtrip", "Bucket list", "Scenic"],
    dateRange: "Past trip",
    description:
      "Waterfalls, black sand, glacier views, hot springs, and a clean route that feels cinematic from start to finish.",
    published: true,
    photoCount: 32,
    remixes: 326,
    saves: 144,
  },
  {
    id: "hudson-valley-hidden-weekend",
    title: "Hudson Valley Hidden Weekend",
    destination: "Hudson Valley, NY",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80",
    duration: "Weekend",
    budget: "$700-$1,200",
    travelers: "Couple",
    tripStyle: "Culture-first",
    energyLevel: "Easygoing",
    gemsPreference: "Hidden gems",
    travelPace: "Flexible",
    stayType: "Boutique",
    transportType: "Rental car",
    flightOrigin: "",
    interests: ["Food", "Nature", "Culture", "Scenic drives"],
    tags: ["Local", "Weekend", "Hidden gems", "Near you"],
    dateRange: "Local idea",
    description:
      "Small towns, waterfall stops, cozy stays, and local food anchors close enough to feel easy but memorable enough to share.",
    published: true,
    photoCount: 9,
    remixes: 119,
    saves: 51,
  },
];


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

function sanitizeUsername(value?: string) {
  return (
    (value || "")
      .toLowerCase()
      .replace(/^@/, "")
      .replace(/[^a-z0-9]+/g, "")
      .trim() || "atlascreator"
  );
}

function getStoredAtlasProfile() {
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

function mapDbProfileToAtlasProfile(row: any): AtlasProfile {
  return {
    name: row?.name || "",
    username: sanitizeUsername(row?.username || ""),
    bio: row?.bio || "",
    avatar: row?.avatar || "",
    bannerImage: row?.banner_image || "",
    location: row?.location || "",
    travelerType: row?.traveler_type || "Adventure Traveler",
    countriesVisited: row?.countries_visited || 0,
    instagram: row?.instagram || "",
    tiktok: row?.tiktok || "",
    youtube: row?.youtube || "",
    facebook: row?.facebook || "",
    joinedAt: row?.joined_at || "2026",
  };
}

function normalizeDateRange(startDate?: string | null, endDate?: string | null) {
  if (startDate && endDate) return `${startDate} → ${endDate}`;
  if (startDate) return startDate;
  if (endDate) return endDate;
  return "Published journey";
}

function mapDbJourneyToProfileJourney(journey: any, index: number): ProfileJourney {
  const form = journey.form || {};
  const trip = journey.trip || {};

  return {
    id: journey.id,
    title: journey.title || trip.title || "Untitled Atlas Journey",
    destination: journey.destination || form.destination || "Unknown destination",
    image:
      journey.cover_image ||
      form.coverImage ||
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
    duration: journey.duration || form.duration || "Flexible",
    budget: journey.budget || form.budget || "Mid-range",
    travelers: journey.travelers || form.travelers || "Travelers",
    tripStyle: journey.trip_style || form.tripStyle || "Adventure",
    energyLevel: journey.energy_level || form.energyLevel || "Balanced",
    gemsPreference: form.gemsPreference || "Mix of both",
    travelPace: form.travelPace || "Flexible",
    stayType: journey.stay_type || form.stayType || "Best value mix",
    transportType: journey.transport_type || form.transportType || "Mixed",
    flightOrigin: journey.flight_origin || form.flightOrigin || "Albany, NY",
    interests: Array.isArray(form.interests) ? form.interests : [],
    tags: [
      "Published",
      journey.trip_style || form.tripStyle || "Atlas trip",
      journey.energy_level || form.energyLevel || "Balanced",
      journey.cover_image ? "Photo route" : "AI route",
    ].filter(Boolean),
    dateRange: normalizeDateRange(journey.start_date, journey.end_date),
    description:
      journey.vibe_summary ||
      trip.vibeSummary ||
      journey.subtitle ||
      trip.subtitle ||
      "A published Atlas journey ready to view, save, remix, and build from.",
    published: Boolean(journey.is_published ?? true),
    photoCount: journey.cover_image ? 1 : 0,
    remixes: 42 + index * 17,
    saves: 18 + index * 11,
  };
}

function formatUsername(raw?: string | string[]) {
  const username = Array.isArray(raw) ? raw[0] : raw;
  const clean = username || "atlascreator";
  return clean.replace(/^@/, "");
}

function getDisplayName(username: string) {
  if (username.toLowerCase() === "daniel") return "Daniel";
  return username
    .split(/[-_.]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getCreatorBio(username: string) {
  if (username.toLowerCase() === "daniel") {
    return "Building Atlas through real trips, family memories, visual routes, and AI-powered travel planning.";
  }

  return "Building journeys, capturing moments, and mapping the world through Atlas.";
}

function normalizeHandle(value?: string) {
  return (value || "").trim().replace(/^@/, "");
}

function getProfileDisplayName(profile: AtlasProfile, username: string) {
  return profile.name?.trim() || getDisplayName(username) || "Atlas Traveler";
}

function getProfileBio(profile: AtlasProfile, username: string) {
  return (
    profile.bio?.trim() ||
    getCreatorBio(username) ||
    "Real journeys, visual stories, and buildable travel routes on Atlas."
  );
}

function getInitialLetter(name: string, username: string) {
  const source = name.trim() || username.trim() || "A";
  return source.charAt(0).toUpperCase();
}

function ProfileAvatar({
  avatar,
  name,
  username,
  size = "large",
}: {
  avatar?: string;
  name: string;
  username: string;
  size?: "small" | "medium" | "large";
}) {
  const sizeClass =
    size === "small"
      ? "h-12 w-12 text-lg"
      : size === "medium"
        ? "h-20 w-20 text-2xl"
        : "h-28 w-28 text-4xl";

  return (
    <div className={`${sizeClass} overflow-hidden rounded-full shadow-lg ring-4 ring-white/80`}>
      {avatar ? (
        <img src={avatar} alt={name} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#d6b98c,#4f8ef7)] font-semibold text-white">
          {getInitialLetter(name, username)}
        </div>
      )}
    </div>
  );
}

function IdentityPill({ label }: { label?: string | number }) {
  if (!label) return null;

  return (
    <span className="rounded-full border border-neutral-200 bg-white/85 px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-sm">
      {label}
    </span>
  );
}

function SocialPill({ label, value }: { label: string; value?: string }) {
  if (!value) return null;

  return (
    <span className="rounded-full border border-neutral-200 bg-white/85 px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-sm">
      {label} @{normalizeHandle(value)}
    </span>
  );
}


function buildResultsPayload(journey: ProfileJourney) {
  return {
    destination: journey.destination,
    duration: journey.duration,
    budget: journey.budget,
    travelers: journey.travelers,
    tripStyle: journey.tripStyle,
    energyLevel: journey.energyLevel,
    gemsPreference: journey.gemsPreference,
    travelPace: journey.travelPace,
    stayType: journey.stayType,
    transportType: journey.transportType,
    flightOrigin: journey.flightOrigin,
    interests: journey.interests,
    startDate: "",
    endDate: "",
    coverImage: journey.image,
  };
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[22px] border border-white/70 bg-white/76 p-4 shadow-[0_12px_30px_rgba(0,0,0,0.06)] backdrop-blur">
      <p className="text-2xl font-semibold text-neutral-950">{value}</p>
      <p className="mt-1 text-xs font-medium uppercase tracking-[0.22em] text-neutral-500">
        {label}
      </p>
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-white/20 bg-white/18 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur">
      {label}
    </span>
  );
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = formatUsername(params?.username);
  const [profile, setProfile] = useState<AtlasProfile>(defaultAtlasProfile);
  const [creatorJourneys, setCreatorJourneys] = useState<ProfileJourney[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingJourneys, setIsLoadingJourneys] = useState(true);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [profileWasFound, setProfileWasFound] = useState(false);

  const profileMatchesRoute = sanitizeUsername(profile.username) === sanitizeUsername(username);
  const displayName =
    profileWasFound || profileMatchesRoute
      ? getProfileDisplayName(profile, username)
      : getDisplayName(username);
  const profileBio =
    profileWasFound || profileMatchesRoute
      ? getProfileBio(profile, username)
      : getCreatorBio(username);
  const profileAvatar = profileWasFound || profileMatchesRoute ? profile.avatar : "";
  const travelerType =
    profileWasFound || profileMatchesRoute
      ? profile.travelerType || "Adventure Traveler"
      : "Atlas Traveler";
  const profileLocation = profileWasFound || profileMatchesRoute ? profile.location || "" : "";
  const profileCountries = profileWasFound || profileMatchesRoute ? profile.countriesVisited || 0 : 0;
  const joinedAt = profileWasFound || profileMatchesRoute ? profile.joinedAt || "2026" : "2026";
  const profileInstagram = profileWasFound || profileMatchesRoute ? profile.instagram : "";
  const profileTiktok = profileWasFound || profileMatchesRoute ? profile.tiktok : "";
  const profileYoutube = profileWasFound || profileMatchesRoute ? profile.youtube : "";
  const profileFacebook = profileWasFound || profileMatchesRoute ? profile.facebook : "";

  useEffect(() => {
    let cancelled = false;

    async function loadPublicProfile() {
      try {
        setIsLoadingProfile(true);

        const routeUsername = sanitizeUsername(username);
        const localProfile = getStoredAtlasProfile();

        if (sanitizeUsername(localProfile.username) === routeUsername) {
          setProfile(localProfile);
        }

        const supabase = createClient();

        const { data, error } = await supabase
          .from("atlas_profiles")
          .select("*")
          .eq("username", routeUsername)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          console.error("Failed to load public Atlas profile", error);
          setProfileWasFound(false);
          return;
        }

        if (data) {
          const publicProfile = mapDbProfileToAtlasProfile(data);

          setProfile(publicProfile);
          setProfileUserId(data.id || null);
          setProfileWasFound(true);
        } else {
          setProfileWasFound(false);
          setProfileUserId(null);
        }
      } catch (error) {
        console.error("Failed to load public Atlas profile", error);
        if (!cancelled) {
          setProfileWasFound(false);
          setProfileUserId(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingProfile(false);
        }
      }
    }

    loadPublicProfile();

    return () => {
      cancelled = true;
    };
  }, [username]);

  useEffect(() => {
    let cancelled = false;

    async function loadCreatorJourneys() {
      try {
        setIsLoadingJourneys(true);
        const supabase = createClient();
        const routeUsername = sanitizeUsername(username);

        let query = supabase
          .from("journeys")
          .select("*")
          .eq("is_published", true)
          .order("updated_at", { ascending: false });

        if (profileUserId) {
          query = query.or(
            `user_id.eq.${profileUserId},profile_id.eq.${profileUserId},creator_username.eq.${routeUsername}`
          );
        } else {
          query = query.eq("creator_username", routeUsername);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Failed to load profile journeys", error);
          if (!cancelled) setCreatorJourneys([]);
          return;
        }

        const mapped = ((data || []) as any[]).map(mapDbJourneyToProfileJourney);

        if (!cancelled) {
          setCreatorJourneys(mapped);
        }
      } catch (error) {
        console.error("Failed to load profile journeys", error);
        if (!cancelled) setCreatorJourneys([]);
      } finally {
        if (!cancelled) setIsLoadingJourneys(false);
      }
    }

    if (!isLoadingProfile) {
      loadCreatorJourneys();
    }

    return () => {
      cancelled = true;
    };
  }, [isLoadingProfile, profileUserId, username]);

  const visibleJourneys = creatorJourneys.length > 0 ? creatorJourneys : [];

  const heroJourneys = visibleJourneys.length > 0 ? visibleJourneys : fallbackCreatorJourneys.slice(0, 3);

  const stats = useMemo(() => {
    const published = visibleJourneys.filter((journey) => journey.published).length;
    const photos = visibleJourneys.reduce((sum, journey) => sum + journey.photoCount, 0);
    const remixes = visibleJourneys.reduce((sum, journey) => sum + journey.remixes, 0);
    const saves = visibleJourneys.reduce((sum, journey) => sum + journey.saves, 0);

    return {
      published,
      photos,
      remixes,
      saves,
    };
  }, [visibleJourneys]);

  function handleViewJourney(journey: ProfileJourney) {
    window.localStorage.removeItem(ATLAS_BUILD_PREFILL_STORAGE_KEY);
    window.localStorage.setItem(ATLAS_BUILD_STORAGE_KEY, JSON.stringify(buildResultsPayload(journey)));
    router.push("/results");
  }

  function handleBuildMyVersion(journey: ProfileJourney) {
    window.localStorage.setItem(
      ATLAS_BUILD_PREFILL_STORAGE_KEY,
      JSON.stringify(buildResultsPayload(journey))
    );
    router.push("/build");
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f4efe7] text-neutral-950">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(214,185,140,0.46),transparent_34%),radial-gradient(circle_at_top_right,rgba(79,142,247,0.20),transparent_32%),linear-gradient(180deg,#fbf3e7_0%,#f4efe7_58%,#fbfaf7_100%)]" />
        <div className="absolute left-[-120px] top-[-100px] h-80 w-80 rounded-full bg-white/45 blur-3xl" />
        <div className="absolute right-[-120px] top-20 h-80 w-80 rounded-full bg-[#d6b98c]/25 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-5 sm:px-6 lg:px-8 lg:pb-14 lg:pt-8">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/feed"
              className="rounded-full border border-neutral-300/70 bg-white/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-700 backdrop-blur"
            >
              Atlas World
            </Link>

            <Link
              href="/build"
              className="rounded-full bg-neutral-950 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white shadow-[0_14px_34px_rgba(0,0,0,0.16)]"
            >
              Build Trip
            </Link>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
            <div className="rounded-[34px] border border-white/70 bg-white/58 p-5 shadow-[0_26px_80px_rgba(0,0,0,0.10)] backdrop-blur sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <ProfileAvatar
                  avatar={profileAvatar}
                  name={displayName}
                  username={username}
                  size="large"
                />

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-4xl font-semibold tracking-[-0.04em] text-neutral-950">
                      {displayName}
                    </h1>
                    <span className="rounded-full bg-[#d6b98c] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-950">
                      {travelerType}
                    </span>
                  </div>

                  <p className="mt-1 text-neutral-500">@{username}</p>
                  <p className="mt-4 max-w-xl text-sm leading-6 text-neutral-700">
                    {profileBio}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <IdentityPill label={profileLocation} />
                    {profileCountries ? (
                      <IdentityPill label={`${profileCountries} countries visited`} />
                    ) : null}
                    <IdentityPill label={`Atlas since ${joinedAt}`} />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <SocialPill label="IG" value={profileInstagram} />
                    <SocialPill label="TikTok" value={profileTiktok} />
                    <SocialPill label="FB" value={profileFacebook} />
                    {profileYoutube ? <IdentityPill label="YouTube" /> : null}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard label="Trips" value={visibleJourneys.length} />
                <StatCard label="Published" value={stats.published} />
                <StatCard label="Photos" value={stats.photos} />
                <StatCard label="Remixes" value={stats.remixes} />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Link
                  href="/atlas"
                  className="rounded-2xl border border-neutral-300 bg-white px-5 py-4 text-center text-sm font-semibold text-neutral-900 transition hover:-translate-y-0.5"
                >
                  Open My Atlas
                </Link>
                <Link
                  href="/atlas/add"
                  className="rounded-2xl bg-neutral-950 px-5 py-4 text-center text-sm font-semibold text-white shadow-[0_16px_36px_rgba(0,0,0,0.16)] transition hover:-translate-y-0.5"
                >
                  Add Past Journey
                </Link>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[36px] border border-white/70 bg-neutral-900 shadow-[0_30px_90px_rgba(0,0,0,0.18)]">
              <div className="grid h-[520px] grid-cols-2 gap-1">
                <div className="relative overflow-hidden">
                  <img
                    src={heroJourneys[0]?.image || fallbackCreatorJourneys[0].image}
                    alt={heroJourneys[0]?.title || fallbackCreatorJourneys[0].title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="grid gap-1">
                  <img
                    src={heroJourneys[1]?.image || fallbackCreatorJourneys[1].image}
                    alt={heroJourneys[1]?.title || fallbackCreatorJourneys[1].title}
                    className="h-full w-full object-cover"
                  />
                  <img
                    src={heroJourneys[2]?.image || fallbackCreatorJourneys[2].image}
                    alt={heroJourneys[2]?.title || fallbackCreatorJourneys[2].title}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/18 to-transparent" />

              <div className="absolute left-5 top-5 rounded-full border border-white/20 bg-white/16 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-white backdrop-blur">
                Travel Identity
              </div>

              <div className="absolute bottom-5 left-5 right-5 text-white">
                <p className="text-[11px] uppercase tracking-[0.32em] text-[#f5d7a1]">
                  Travel identity
                </p>
                <h2 className="mt-2 max-w-2xl text-4xl font-semibold leading-tight">
                  Real journeys. Real memories. Buildable travel stories.
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/78">
                  This is where travel memories become useful: photos, future reels, real routes,
                  and journeys other people can save, remix, and build into their own version.
                </p>
                <div className="mt-5 rounded-[24px] border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/55">
                    Watch Trips
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/78">
                    Short-form travel clips, creator reels, and trip videos will live here as Atlas evolves.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_330px] lg:px-8">
        <div className="space-y-6">
          <div className="rounded-[30px] border border-white/70 bg-white/82 p-5 shadow-[0_18px_55px_rgba(0,0,0,0.07)] backdrop-blur sm:p-6">
            <p className="text-[11px] uppercase tracking-[0.34em] text-neutral-500">
              Creator journeys
            </p>
            <h2 className="mt-2 text-3xl font-semibold leading-tight">
              {isLoadingProfile || isLoadingJourneys
                ? "Loading public Atlas profile"
                : visibleJourneys.length > 0
                  ? "Trips worth watching, saving, and remixing"
                  : "No public trips yet"}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-700">
              {isLoadingProfile || isLoadingJourneys
                ? "Pulling this creator profile and published journeys from Atlas."
                : visibleJourneys.length > 0
                  ? "Creator profiles make Atlas feel alive. Every trip below can open into a usable route, inspire a future reel, or become the starting point for someone else’s version."
                  : "Publish a journey from My Atlas and it will appear here as part of your public travel profile."}
            </p>
          </div>

          {!isLoadingProfile && !isLoadingJourneys && visibleJourneys.length === 0 ? (
            <div className="rounded-[34px] border border-white/70 bg-white/84 p-8 text-center shadow-[0_20px_62px_rgba(0,0,0,0.09)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-neutral-500">
                Public profile
              </p>
              <h3 className="mt-2 text-3xl font-semibold text-neutral-950">
                No published journeys yet
              </h3>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-600">
                Save and publish a journey from My Atlas. Once published, it will show here and become part of this creator profile.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  href="/atlas"
                  className="rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white"
                >
                  Open My Atlas
                </Link>
                <Link
                  href="/build"
                  className="rounded-2xl border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-neutral-900"
                >
                  Build a Trip
                </Link>
              </div>
            </div>
          ) : null}

          {visibleJourneys.map((journey, index) => (
            <article
              key={journey.id}
              className="group overflow-hidden rounded-[34px] border border-white/70 bg-white/84 shadow-[0_20px_62px_rgba(0,0,0,0.09)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_82px_rgba(0,0,0,0.14)]"
            >
              <div className={`relative ${index === 0 ? "h-[560px]" : "h-[460px]"} overflow-hidden bg-neutral-900`}>
                <img
                  src={journey.image}
                  alt={journey.title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04)_0%,rgba(0,0,0,0.18)_38%,rgba(0,0,0,0.88)_100%)]" />

                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  {journey.tags.slice(0, 4).map((tag) => (
                    <Badge key={tag} label={tag} />
                  ))}
                </div>

                <div className="absolute right-4 top-4 rounded-full bg-black/34 px-3 py-2 text-xs font-semibold text-white backdrop-blur">
                  ♡ {journey.saves}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-5 text-white sm:p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/68">
                    Posted by @{username} · {journey.dateRange}
                  </p>
                  <h2 className="mt-2 max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl">
                    {journey.title}
                  </h2>
                  <p className="mt-2 text-sm text-white/84">
                    {journey.destination}
                  </p>
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-white/78 sm:text-base">
                    {journey.description}
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-5">
                <div className="grid grid-cols-3 gap-2">
                  <StatCard label="Length" value={journey.duration} />
                  <StatCard label="Remixes" value={journey.remixes} />
                  <StatCard label="Photos" value={journey.photoCount} />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => handleViewJourney(journey)}
                    className="rounded-2xl bg-neutral-950 px-5 py-4 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(0,0,0,0.16)] transition hover:translate-y-[-1px]"
                  >
                    View Journey
                  </button>

                  <button
                    type="button"
                    onClick={() => handleBuildMyVersion(journey)}
                    className="rounded-2xl border border-neutral-300 bg-white px-5 py-4 text-sm font-semibold text-neutral-900 transition hover:translate-y-[-1px]"
                  >
                    Build My Version
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="hidden space-y-5 lg:block lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-[30px] border border-white/70 bg-white/82 p-5 shadow-[0_18px_55px_rgba(0,0,0,0.08)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-neutral-500">
              Trust layer
            </p>
            <h2 className="mt-2 text-2xl font-semibold leading-tight text-neutral-950">
              Real profiles make trips believable.
            </h2>
            <p className="mt-3 text-sm leading-6 text-neutral-700">
              A journey feels stronger when it belongs to someone. This page becomes the public home
              for trips, photos, short videos, remixes, and future social sharing.
            </p>
          </div>

          <div className="rounded-[30px] border border-[#eadbc5] bg-[linear-gradient(180deg,#fffaf2,#f3e6d2)] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.08)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#8a6631]">
              Atlas loop
            </p>
            <div className="mt-4 space-y-3">
              {[
                ["Discover", "Open a creator trip"],
                ["Experience", "Watch + scan the route"],
                ["Remix", "Build your version"],
                ["Share", "Post it outward"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-2xl border border-[#eadbc5] bg-white/80 px-4 py-3"
                >
                  <span className="text-sm text-neutral-600">{label}</span>
                  <span className="text-sm font-semibold text-neutral-950">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/feed"
            className="block rounded-[30px] bg-neutral-950 p-5 text-white shadow-[0_18px_55px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5"
          >
            <p className="text-[11px] uppercase tracking-[0.34em] text-white/55">
              Explore more
            </p>
            <h3 className="mt-2 text-2xl font-semibold">Open Atlas World</h3>
            <p className="mt-3 text-sm leading-6 text-white/70">
              Browse more journeys, AI ideas, and published trips from the Atlas network.
            </p>
          </Link>
        </aside>
      </section>
    </main>
  );
}
