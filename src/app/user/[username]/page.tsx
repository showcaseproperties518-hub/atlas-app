"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ATLAS_BUILD_PREFILL_STORAGE_KEY,
  ATLAS_BUILD_STORAGE_KEY,
} from "@/app/lib/atlas-trip";

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

const creatorJourneys: ProfileJourney[] = [
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

function formatUsername(raw?: string | string[]) {
  const username = Array.isArray(raw) ? raw[0] : raw;
  const clean = username || "alex";
  return clean.replace(/^@/, "");
}

function getDisplayName(username: string) {
  if (username.toLowerCase() === "daniel") return "Daniel";
  if (username.toLowerCase() === "alex") return "Alex Johnson";

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

  return "Exploring hidden gems, local flavors, and unforgettable places. Saving journeys, refining them, and sharing the best ones with Atlas.";
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
  const displayName = getDisplayName(username);

  const stats = useMemo(() => {
    const published = creatorJourneys.filter((journey) => journey.published).length;
    const photos = creatorJourneys.reduce((sum, journey) => sum + journey.photoCount, 0);
    const remixes = creatorJourneys.reduce((sum, journey) => sum + journey.remixes, 0);
    const saves = creatorJourneys.reduce((sum, journey) => sum + journey.saves, 0);

    return {
      published,
      photos,
      remixes,
      saves,
    };
  }, []);

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
                <div className="h-28 w-28 overflow-hidden rounded-full shadow-lg ring-4 ring-white/80">
                  <img
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80"
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-4xl font-semibold tracking-[-0.04em] text-neutral-950">
                      {displayName}
                    </h1>
                    <span className="rounded-full bg-[#d6b98c] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-950">
                      Atlas Creator
                    </span>
                  </div>

                  <p className="mt-1 text-neutral-500">@{username}</p>
                  <p className="mt-4 max-w-xl text-sm leading-6 text-neutral-700">
                    {getCreatorBio(username)}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard label="Trips" value={creatorJourneys.length} />
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
                    src={creatorJourneys[0].image}
                    alt={creatorJourneys[0].title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="grid gap-1">
                  <img
                    src={creatorJourneys[1].image}
                    alt={creatorJourneys[1].title}
                    className="h-full w-full object-cover"
                  />
                  <img
                    src={creatorJourneys[2].image}
                    alt={creatorJourneys[2].title}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/18 to-transparent" />

              <div className="absolute left-5 top-5 rounded-full border border-white/20 bg-white/16 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-white backdrop-blur">
                Creator Map Preview
              </div>

              <div className="absolute bottom-5 left-5 right-5 text-white">
                <p className="text-[11px] uppercase tracking-[0.32em] text-[#f5d7a1]">
                  Travel identity
                </p>
                <h2 className="mt-2 max-w-2xl text-4xl font-semibold leading-tight">
                  Trips, photos, routes, and remixes in one place
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/78">
                  This profile is the start of the Atlas social layer: every creator can publish
                  journeys, build credibility, and turn their travel history into routes other people can use.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_330px] lg:px-8">
        <div className="space-y-6">
          <div className="rounded-[30px] border border-white/70 bg-white/82 p-5 shadow-[0_18px_55px_rgba(0,0,0,0.07)] backdrop-blur sm:p-6">
            <p className="text-[11px] uppercase tracking-[0.34em] text-neutral-500">
              Published journeys
            </p>
            <h2 className="mt-2 text-3xl font-semibold leading-tight">
              Trips worth opening, saving, and remixing
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-700">
              Creator profiles make Atlas feel alive. Every trip below can open into the full Results
              experience or become the starting point for someone else’s version.
            </p>
          </div>

          {creatorJourneys.map((journey, index) => (
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
              Creator signal
            </p>
            <h2 className="mt-2 text-2xl font-semibold leading-tight text-neutral-950">
              Profiles make trips trustworthy.
            </h2>
            <p className="mt-3 text-sm leading-6 text-neutral-700">
              A journey feels stronger when it belongs to someone. This page becomes the public home
              for trips, photos, remixes, and future social posting.
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
