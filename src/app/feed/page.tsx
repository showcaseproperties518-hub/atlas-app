"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ATLAS_BUILD_PREFILL_STORAGE_KEY,
  ATLAS_BUILD_STORAGE_KEY,
} from "@/app/lib/atlas-trip";
import {
  AtlasStoredJourney,
  formatJourneyRange,
} from "@/app/lib/atlas-journeys";

type FeedTripCard = {
  id: string;
  title: string;
  location: string;
  image: string;
  tags: string[];
  likes: number;
  user: string;
  username: string;
  destination: string;
  length: string;
  budget: string;
  traveler: string;
  vibe: string;
  blend: string;
  energy: string;
  notes: string;
  source: "published" | "ai";
  publishedDate?: string;
  publishedJourney?: AtlasStoredJourney;
  dateRange?: string;
  photoCount?: number;
  isPastJourney?: boolean;
};

function getUsernameSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/^@/, "")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function getCreatorHref(trip: FeedTripCard) {
  return `/user/${getUsernameSlug(trip.username || trip.user || "atlastraveler")}`;
}

const aiIdeas: FeedTripCard[] = [
  {
    id: "ai-hudson-valley-weekend",
    title: "Hudson Valley Hidden Weekend",
    location: "Hudson Valley, NY",
    image:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80",
    tags: ["AI Idea", "Weekend", "Scenic"],
    likes: 812,
    user: "Atlas AI",
    username: "atlasai",
    destination: "Hudson Valley, NY",
    length: "3 days",
    budget: "$700-$1200",
    traveler: "Couple",
    vibe: "A scenic weekend with charming towns, waterfall stops, and local food.",
    blend: "Hidden Gems",
    energy: "Relaxed",
    notes: "Small towns, hidden trails, cozy stays, and the kind of food stops people actually remember.",
    source: "ai",
  },
  {
    id: "ai-costa-rica-route",
    title: "Costa Rica Waterfalls + Coast",
    location: "Costa Rica",
    image:
      "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=1600&q=80",
    tags: ["AI Idea", "Adventure", "Tropical"],
    likes: 1460,
    user: "Atlas AI",
    username: "atlasai",
    destination: "Costa Rica",
    length: "7 days",
    budget: "$2500-$4500",
    traveler: "Friends",
    vibe: "A high-reward route with jungle, waterfalls, food, and coastal energy.",
    blend: "Mix of both",
    energy: "Balanced",
    notes: "Built for the friend group that wants a real trip, not just a resort week.",
    source: "ai",
  },
  {
    id: "ai-iceland-photo-route",
    title: "Iceland Photo-First Escape",
    location: "Iceland",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
    tags: ["AI Idea", "Photo Spots", "Roadtrip"],
    likes: 2054,
    user: "Atlas AI",
    username: "atlasai",
    destination: "Iceland",
    length: "5 days",
    budget: "$2000-$4000",
    traveler: "Couple",
    vibe: "Built around cinematic stops, dramatic scenery, and unforgettable visual moments.",
    blend: "Top spots",
    energy: "Balanced",
    notes: "Waterfalls, black sand, glacier views, hot springs, and a route that feels like a movie.",
    source: "ai",
  },
];

const localFallbacks: FeedTripCard[] = [
  {
    id: "fallback-albany-waterfalls",
    title: "Hidden Waterfalls Near Albany",
    location: "Capital Region, NY",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80",
    tags: ["Near You", "Hidden Gems", "Weekend"],
    likes: 428,
    user: "Atlas Local",
    username: "atlaslocal",
    destination: "Albany, NY",
    length: "2 days",
    budget: "$300-$500",
    traveler: "Friends",
    vibe: "Scenic local adventure with hidden waterfalls and easy weekend energy.",
    blend: "Hidden Gems",
    energy: "Balanced",
    notes: "Less driving, scenic stops, local coffee, easy trails, memorable viewpoints.",
    source: "ai",
  },
  {
    id: "fallback-lake-george",
    title: "Lake George Easy Summer Day",
    location: "Lake George, NY",
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80",
    tags: ["Family", "Driveable", "Lake"],
    likes: 311,
    user: "Atlas Local",
    username: "atlaslocal",
    destination: "Lake George, NY",
    length: "1 day",
    budget: "$150-$300",
    traveler: "Family",
    vibe: "A low-friction day trip with lake views, simple fun, and food stops.",
    blend: "Local Favorites",
    energy: "Easygoing",
    notes: "Built as a close-to-home day with real payoff and easy logistics.",
    source: "ai",
  },
];

const locationPills = ["Published", "Near You", "Regional", "Global", "AI Ideas"];
const filterPills = ["Hidden Gems", "Food", "Scenic", "Family", "Adventure", "Photo Spots"];

type FeedSectionMode = "published" | "local" | "ai" | "mixed";

function getSectionMode(selectedLocation: string): FeedSectionMode {
  if (selectedLocation === "Published") return "published";
  if (selectedLocation === "Near You") return "local";
  if (selectedLocation === "AI Ideas") return "ai";
  return "mixed";
}

function getTripHook(trip: FeedTripCard) {
  if (trip.source === "published") return "Real trip you can copy";
  if (trip.location.toLowerCase().includes("iceland")) return "Built for unreal photos";
  if (trip.location.toLowerCase().includes("costa rica")) return "Jungle to coast route";
  if (trip.traveler === "Family") return "Easy win for the family";
  return "Worth building your version";
}

function mapPublishedJourneyToFeedCard(journey: AtlasStoredJourney, index: number): FeedTripCard {
  const username = journey.isPastJourney ? "danielmccann" : "atlascreator";

  return {
    id: journey.id,
    title: journey.trip.title,
    location: journey.destination,
    image: journey.coverImage,
    tags: [
      "Published",
      journey.form.gemsPreference || "Atlas Built",
      journey.form.tripStyle || "Trip Plan",
      journey.isPastJourney ? "Past Journey" : "Real Journey",
    ].slice(0, 4),
    likes: 240 + index * 67,
    user: username,
    username,
    destination: journey.destination,
    length: journey.form.duration || "Flexible",
    budget: journey.form.budget || "Flexible",
    traveler: journey.form.travelers || "Traveler",
    vibe: journey.trip.subtitle || journey.trip.vibeSummary,
    blend: journey.form.gemsPreference || "Mix of both",
    energy: journey.form.energyLevel || "Balanced",
    notes: journey.notes?.trim() || journey.trip.vibeSummary || journey.trip.subtitle,
    source: "published",
    publishedDate: journey.updatedAt,
    publishedJourney: journey,
    dateRange: formatJourneyRange(journey.startDate, journey.endDate),
    photoCount: journey.photos?.length ?? 0,
    isPastJourney: Boolean(journey.isPastJourney),
  };
}

export default function FeedPage() {
  const router = useRouter();
  const [selectedLocation, setSelectedLocation] = useState("Published");
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [publishedSourceJourneys, setPublishedSourceJourneys] = useState<AtlasStoredJourney[]>([]);
  const [loadingPublished, setLoadingPublished] = useState(true);
  const [publishedError, setPublishedError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPublishedJourneys() {
      try {
        setLoadingPublished(true);
        setPublishedError(null);

        const res = await fetch("/api/journeys/published");

        if (!res.ok) {
          throw new Error(`Failed to load published journeys: ${res.status}`);
        }

        const data = await res.json();
        const journeys = Array.isArray(data?.journeys) ? data.journeys : [];

        const mapped: AtlasStoredJourney[] = journeys.map((journey: any) => ({
          id: journey.id,
          destination: journey.destination,
          coverImage:
            journey.cover_image ||
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
          createdAt: journey.created_at || new Date().toISOString(),
          updatedAt: journey.updated_at || journey.created_at || new Date().toISOString(),
          publishedAt: journey.is_published
            ? journey.updated_at || journey.created_at || new Date().toISOString()
            : undefined,
          startDate: journey.start_date || undefined,
          endDate: journey.end_date || undefined,
          notes: journey.vibe_summary || "",
          photos: journey.cover_image
            ? [
                {
                  id: `${journey.id}-cover-photo`,
                  url: journey.cover_image,
                  caption: journey.title || journey.destination,
                  createdAt: journey.created_at || new Date().toISOString(),
                },
              ]
            : [],
          isPublished: Boolean(journey.is_published),
          isPastJourney: false,
          trip: {
            title: journey.title,
            subtitle: journey.subtitle || journey.destination,
            vibeSummary: journey.vibe_summary || journey.subtitle || journey.destination,
            highlights: [],
            staySuggestion: journey.stay_suggestion || "Best stay area will be refined by Atlas.",
            transportSuggestion:
              journey.transport_suggestion || "Transport flow will be refined by Atlas.",
          },
          form: {
            destination: journey.destination,
            startDate: journey.start_date || "",
            endDate: journey.end_date || "",
            duration: journey.duration || "Flexible",
            budget: journey.budget || "Flexible",
            travelers: journey.travelers || "Traveler",
            tripStyle: journey.trip_style || "Balanced",
            energyLevel: journey.energy_level || "Balanced",
            gemsPreference: "Mix of both",
            travelPace: "Flexible",
            interests: [],
            stayType: journey.stay_type || "",
            transportType: journey.transport_type || "",
            flightOrigin: journey.flight_origin || "",
          },
        }));

        setPublishedSourceJourneys(mapped);
      } catch (error) {
        console.error("Published journeys feed load failed", error);
        setPublishedError("Could not load published journeys right now.");
        setPublishedSourceJourneys([]);
      } finally {
        setLoadingPublished(false);
      }
    }

    loadPublishedJourneys();
  }, []);

  const publishedTrips = useMemo(() => {
    return publishedSourceJourneys.map(mapPublishedJourneyToFeedCard);
  }, [publishedSourceJourneys]);

  const featuredPublished = useMemo(() => publishedTrips[0] ?? null, [publishedTrips]);
  const publishedGrid = useMemo(() => publishedTrips.slice(1, 9), [publishedTrips]);
  const localIdeas = useMemo(() => localFallbacks, []);
  const aiIdeaCards = useMemo(() => aiIdeas, []);
  const sectionMode = useMemo(() => getSectionMode(selectedLocation), [selectedLocation]);

  const allVisibleTrips = useMemo(() => {
    if (sectionMode === "published") return publishedGrid;
    if (sectionMode === "local") return localIdeas;
    if (sectionMode === "ai") return aiIdeaCards;
    return [...publishedGrid, ...localIdeas, ...aiIdeaCards];
  }, [sectionMode, publishedGrid, localIdeas, aiIdeaCards]);

  const filteredTrips = useMemo(() => {
    if (!selectedFilter) return allVisibleTrips;
    return allVisibleTrips.filter((trip) =>
      [trip.blend, trip.vibe, trip.notes, ...trip.tags]
        .join(" ")
        .toLowerCase()
        .includes(selectedFilter.toLowerCase())
    );
  }, [allVisibleTrips, selectedFilter]);

  function buildPrefillFromTrip(trip: FeedTripCard) {
    return {
      destination: trip.destination,
      duration: trip.length,
      budget: trip.budget,
      travelers: trip.traveler,
      energyLevel:
        trip.energy === "Packed"
          ? "High-energy"
          : trip.energy === "Relaxed" || trip.energy === "Easygoing"
            ? "Easygoing"
            : "Balanced",
      tripStyle:
        trip.blend === "Food-Focused"
          ? "Food-focused"
          : trip.traveler === "Family"
            ? "Family"
            : trip.blend === "Top spots"
              ? "Luxury"
              : trip.blend === "Scenic Route"
                ? "Adventure"
                : "Adventure",
      gemsPreference:
        trip.blend === "Hidden Gems" || trip.blend === "Off the Beaten Path"
          ? "Hidden gems"
          : trip.blend === "Top spots"
            ? "Top spots"
            : "Mix of both",
      travelPace:
        trip.energy === "Relaxed" || trip.energy === "Easygoing"
          ? "Flexible"
          : trip.energy === "Packed"
            ? "Planner"
            : "Flexible",
      interests: deriveInterestsFromTrip(trip),
      stayType:
        trip.traveler === "Family"
          ? "Airbnb"
          : trip.blend === "Top spots"
            ? "Hotel"
            : "Best value mix",
      transportType:
        trip.energy === "Relaxed" || trip.energy === "Easygoing" ? "Mixed" : "Walkable",
      flightOrigin: "",
    };
  }

  function handleBuildMyVersion(trip: FeedTripCard) {
    const prefill = buildPrefillFromTrip(trip);
    window.localStorage.setItem(ATLAS_BUILD_PREFILL_STORAGE_KEY, JSON.stringify(prefill));
    router.push("/build");
  }

  function handleViewJourney(trip: FeedTripCard) {
    const prefill = buildPrefillFromTrip(trip);

    const resultsPayload = {
      ...prefill,
      coverImage: trip.image,
      startDate: trip.publishedJourney?.startDate || "",
      endDate: trip.publishedJourney?.endDate || "",
      creatorName: trip.user,
      creatorUsername: trip.username,
    };

    window.localStorage.removeItem(ATLAS_BUILD_PREFILL_STORAGE_KEY);
    window.localStorage.setItem(ATLAS_BUILD_STORAGE_KEY, JSON.stringify(resultsPayload));

    router.push("/results");
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f4efe7] text-neutral-950">
      <section className="relative overflow-hidden border-b border-white/60">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(214,185,140,0.45),transparent_34%),radial-gradient(circle_at_top_right,rgba(79,142,247,0.24),transparent_32%),linear-gradient(180deg,#f7efe4_0%,#f4efe7_58%,#fbfaf7_100%)]" />
        <div className="absolute left-[-120px] top-[-100px] h-80 w-80 rounded-full bg-white/45 blur-3xl" />
        <div className="absolute right-[-120px] top-20 h-80 w-80 rounded-full bg-[#d6b98c]/25 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 pb-8 pt-5 sm:px-6 lg:px-8 lg:pb-12 lg:pt-8">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/atlas"
              className="rounded-full border border-neutral-300/70 bg-white/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-700 backdrop-blur"
            >
              My Atlas
            </Link>
            <Link
              href="/build"
              className="rounded-full bg-neutral-950 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white shadow-[0_14px_34px_rgba(0,0,0,0.16)]"
            >
              Build Trip
            </Link>
          </div>

          <div className="mt-7 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-neutral-500">
                Atlas World Feed
              </p>
              <h1 className="mt-3 max-w-2xl text-[3.2rem] font-semibold leading-[0.92] tracking-[-0.06em] text-neutral-950 sm:text-[4.7rem] lg:text-[5.8rem]">
                Trips worth stealing.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-neutral-700 sm:text-lg">
                Scroll real journeys, photo-first routes, and AI trip ideas. View one, copy it,
                rebuild it, and make it yours.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {["Real trips", "Photo-first", "Buildable", "Shareable"].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/70 bg-white/70 px-4 py-2 text-xs font-medium text-neutral-700 shadow-sm backdrop-blur"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[34px] border border-white/70 bg-white/45 p-3 shadow-[0_30px_90px_rgba(0,0,0,0.12)] backdrop-blur">
              <div className="relative h-[430px] overflow-hidden rounded-[28px] bg-neutral-900 sm:h-[500px]">
                <img
                  src={featuredPublished?.image || aiIdeaCards[2].image}
                  alt={featuredPublished?.title || "Atlas feed hero"}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04)_0%,rgba(0,0,0,0.20)_42%,rgba(0,0,0,0.82)_100%)]" />

                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/18 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white backdrop-blur">
                    Start here
                  </span>
                  <span className="rounded-full bg-[#d6b98c] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-black">
                    Remix ready
                  </span>
                </div>

                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <Link
                    href={getCreatorHref(featuredPublished || aiIdeaCards[2])}
                    className="inline-flex rounded-full bg-white/14 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/82 backdrop-blur transition hover:bg-white/22 hover:text-white"
                  >
                    @{(featuredPublished || aiIdeaCards[2]).username}
                  </Link>
                  <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/75">
                    {featuredPublished ? getTripHook(featuredPublished) : "Featured route"}
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">
                    {featuredPublished?.title || aiIdeaCards[2].title}
                  </h2>
                  <p className="mt-2 max-w-lg text-sm leading-6 text-white/84">
                    {featuredPublished?.notes || aiIdeaCards[2].notes}
                  </p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => handleViewJourney(featuredPublished || aiIdeaCards[2])}
                      className="rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-black"
                    >
                      View Journey
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBuildMyVersion(featuredPublished || aiIdeaCards[2])}
                      className="rounded-2xl bg-[#d6b98c] px-5 py-4 text-sm font-semibold text-black"
                    >
                      Build My Version
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="sticky top-0 z-30 border-b border-white/70 bg-[#f4efe7]/86 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {locationPills.map((pill) => (
              <button
                key={pill}
                type="button"
                onClick={() => setSelectedLocation(pill)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  selectedLocation === pill
                    ? "bg-neutral-950 text-white shadow-[0_12px_28px_rgba(0,0,0,0.18)]"
                    : "border border-white/70 bg-white/75 text-neutral-700"
                }`}
              >
                {pill}
              </button>
            ))}
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {filterPills.map((pill) => (
              <button
                key={pill}
                type="button"
                onClick={() => setSelectedFilter((current) => (current === pill ? null : pill))}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                  selectedFilter === pill
                    ? "bg-[#d6b98c] text-black shadow-[0_10px_24px_rgba(214,185,140,0.34)]"
                    : "border border-[#e1d2bd] bg-[#fffaf2] text-neutral-700"
                }`}
              >
                {pill}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_330px] lg:px-8">
        <div className="space-y-6">
          {featuredPublished && sectionMode === "published" ? (
            <FeedFeatureCard
              trip={featuredPublished}
              onView={() => handleViewJourney(featuredPublished)}
              onBuild={() => handleBuildMyVersion(featuredPublished)}
            />
          ) : null}

          {filteredTrips.length > 0 ? (
            filteredTrips.map((trip, index) => (
              <FeedStoryCard
                key={`${trip.source}-${trip.id}`}
                trip={trip}
                index={index}
                onView={() => handleViewJourney(trip)}
                onBuild={() => handleBuildMyVersion(trip)}
              />
            ))
          ) : (
            <div className="rounded-[30px] border border-white/70 bg-white/82 p-6 text-neutral-700 shadow-[0_18px_55px_rgba(0,0,0,0.07)]">
              {loadingPublished
                ? "Loading published journeys..."
                : publishedError
                  ? publishedError
                  : "No journeys match this filter yet. Clear the filter or publish more trips to make Atlas World feel alive."}
            </div>
          )}
        </div>

        <aside className="hidden space-y-5 lg:block lg:sticky lg:top-36 lg:self-start">
          <div className="rounded-[30px] border border-white/70 bg-white/82 p-5 shadow-[0_18px_55px_rgba(0,0,0,0.08)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-neutral-500">
              Why it hooks
            </p>
            <h2 className="mt-2 text-2xl font-semibold leading-tight text-neutral-950">
              Every trip is a starting point.
            </h2>
            <p className="mt-3 text-sm leading-6 text-neutral-650">
              The feed is built to move people from curiosity to action: see the trip, trust the
              vibe, view the route, then build their own version.
            </p>
            <div className="mt-5 grid gap-3">
              <Link
                href="/build"
                className="rounded-2xl bg-neutral-950 px-5 py-4 text-center text-sm font-semibold text-white"
              >
                Build a New Trip
              </Link>
              <Link
                href="/atlas/add"
                className="rounded-2xl border border-neutral-300 bg-white px-5 py-4 text-center text-sm font-semibold text-neutral-900"
              >
                Add a Past Journey
              </Link>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(247,240,232,0.92))] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.08)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-neutral-500">
              Launch target
            </p>
            <div className="mt-4 space-y-3">
              <StatRow label="Seed trips" value="20–50" />
              <StatRow label="Your trips" value="15+" />
              <StatRow label="Main CTA" value="Build" />
              <StatRow label="Loop" value="View → Build" />
            </div>
          </div>
        </aside>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[34px] border border-white/70 bg-neutral-950 p-6 text-white shadow-[0_30px_90px_rgba(0,0,0,0.16)] sm:p-8">
          <p className="text-[11px] uppercase tracking-[0.34em] text-white/55">Atlas growth loop</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl">
            Real journeys create trust. AI ideas keep the scroll alive.
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/70 sm:text-base">
            The strongest Atlas feed combines your real trips, creator trips, photo-first memories,
            and AI-generated ideas. Every card should make someone think: I want to do that — then
            click Build My Version.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/build"
              className="rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-black"
            >
              Build a New Trip
            </Link>
            <Link
              href="/atlas/add"
              className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-sm font-semibold text-white"
            >
              Add a Past Journey
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function FeedFeatureCard({
  trip,
  onView,
  onBuild,
}: {
  trip: FeedTripCard;
  onView: () => void;
  onBuild: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-[34px] border border-white/70 bg-white/84 shadow-[0_24px_70px_rgba(0,0,0,0.10)]">
      <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative min-h-[430px]">
          <img src={trip.image} alt={trip.title} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.28)_44%,rgba(0,0,0,0.82)_100%)]" />
          <div className="absolute left-5 top-5 flex flex-wrap gap-2">
            <Badge label="Featured" tone="gold" />
            <Badge label="Published" />
            {trip.photoCount ? <Badge label={`${trip.photoCount} photos`} /> : null}
          </div>
          <div className="absolute bottom-5 left-5 right-5 text-white">
            <Link
              href={getCreatorHref(trip)}
              className="inline-flex rounded-full bg-white/14 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/82 backdrop-blur transition hover:bg-white/22 hover:text-white"
            >
              @{trip.username}
            </Link>
            <p className="mt-3 text-[11px] uppercase tracking-[0.28em] text-white/70">{getTripHook(trip)}</p>
            <h2 className="mt-2 text-4xl font-semibold leading-tight">{trip.title}</h2>
            <p className="mt-2 text-sm text-white/84">{trip.location}</p>
          </div>
        </div>
        <div className="p-6 sm:p-8">
          <p className="text-[11px] uppercase tracking-[0.34em] text-neutral-500">Featured journey</p>
          <h3 className="mt-2 text-2xl font-semibold leading-tight text-neutral-950">
            Open the route, then make your own version.
          </h3>
          <p className="mt-4 text-sm leading-7 text-neutral-700">{trip.notes}</p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            <MiniStat label="Length" value={trip.length} />
            <MiniStat label="Budget" value={trip.budget} />
            <MiniStat label="Travelers" value={trip.traveler} />
          </div>
          <div className="mt-6 grid gap-3">
            <button onClick={onBuild} className="rounded-2xl bg-neutral-950 px-5 py-4 text-sm font-semibold text-white">
              Build My Version
            </button>
            <button onClick={onView} className="rounded-2xl border border-neutral-300 bg-white px-5 py-4 text-sm font-semibold text-neutral-900">
              View Journey
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function FeedStoryCard({
  trip,
  index,
  onView,
  onBuild,
}: {
  trip: FeedTripCard;
  index: number;
  onView: () => void;
  onBuild: () => void;
}) {
  const tall = index % 3 === 0;

  return (
    <article className="group overflow-hidden rounded-[34px] border border-white/70 bg-white/84 shadow-[0_20px_62px_rgba(0,0,0,0.09)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_82px_rgba(0,0,0,0.14)]">
      <div className={`relative ${tall ? "h-[560px]" : "h-[460px]"} overflow-hidden bg-neutral-900`}>
        <img
          src={trip.image}
          alt={trip.title}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04)_0%,rgba(0,0,0,0.18)_38%,rgba(0,0,0,0.88)_100%)]" />

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <Badge label={trip.source === "published" ? "Real journey" : "AI idea"} tone={trip.source === "published" ? "green" : "glass"} />
          {trip.isPastJourney ? <Badge label="Past trip" /> : null}
          {trip.photoCount ? <Badge label={`📸 ${trip.photoCount}`} /> : null}
        </div>

        <div className="absolute right-4 top-4 rounded-full bg-black/34 px-3 py-2 text-xs font-semibold text-white backdrop-blur">
          ♡ {trip.likes}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5 text-white sm:p-6">
          <Link
            href={getCreatorHref(trip)}
            className="inline-flex rounded-full bg-white/14 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/82 backdrop-blur transition hover:bg-white/22 hover:text-white"
          >
            @{trip.username}
          </Link>

          <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/68">
            {getTripHook(trip)}
          </p>
          <h2 className="mt-2 max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl">
            {trip.title}
          </h2>
          <p className="mt-2 text-sm text-white/84">
            {trip.location}
            {trip.dateRange ? ` · ${trip.dateRange}` : ""}
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/78 sm:text-base">
            {trip.notes || trip.vibe}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {trip.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="rounded-full bg-white/14 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-3 gap-2">
          <MiniStat label="Length" value={trip.length} />
          <MiniStat label="Budget" value={trip.budget} />
          <MiniStat label="Vibe" value={trip.energy} />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onBuild}
            className="rounded-2xl bg-neutral-950 px-5 py-4 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(0,0,0,0.16)] transition hover:translate-y-[-1px]"
          >
            Build My Version
          </button>
          <button
            type="button"
            onClick={onView}
            className="rounded-2xl border border-neutral-300 bg-white px-5 py-4 text-sm font-semibold text-neutral-900 transition hover:translate-y-[-1px]"
          >
            View Journey
          </button>
        </div>
      </div>
    </article>
  );
}

function Badge({ label, tone = "glass" }: { label: string; tone?: "glass" | "gold" | "green" }) {
  const className =
    tone === "gold"
      ? "bg-[#d6b98c] text-black"
      : tone === "green"
        ? "bg-emerald-500 text-white"
        : "bg-white/18 text-white backdrop-blur";

  return (
    <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${className}`}>
      {label}
    </span>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200/70 bg-[#fbf7f0] p-3 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
      <p className="mt-1 truncate text-xs font-semibold text-neutral-950">{value || "Flexible"}</p>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-neutral-200/70 bg-white/82 px-4 py-3">
      <span className="text-sm text-neutral-600">{label}</span>
      <span className="text-sm font-semibold text-neutral-950">{value}</span>
    </div>
  );
}

function deriveInterestsFromTrip(trip: FeedTripCard) {
  const text = `${trip.title} ${trip.vibe} ${trip.notes} ${trip.tags.join(" ")}`.toLowerCase();
  const interests: string[] = [];

  if (text.includes("food") || text.includes("coffee") || text.includes("café")) {
    interests.push("Food");
  }

  if (
    text.includes("waterfall") ||
    text.includes("nature") ||
    text.includes("trail") ||
    text.includes("scenic") ||
    text.includes("view") ||
    text.includes("coast")
  ) {
    interests.push("Nature");
  }

  if (
    text.includes("nightlife") ||
    text.includes("rooftop") ||
    text.includes("late-night") ||
    text.includes("bar")
  ) {
    interests.push("Nightlife");
  }

  if (text.includes("family") || trip.traveler === "Family") {
    interests.push("Family");
  }

  if (
    trip.traveler === "Couple" ||
    text.includes("romantic") ||
    text.includes("cozy") ||
    text.includes("charming")
  ) {
    interests.push("Romance");
  }

  if (
    text.includes("town") ||
    text.includes("museum") ||
    text.includes("local") ||
    text.includes("culture")
  ) {
    interests.push("Culture");
  }

  if (text.includes("relax") || text.includes("reset") || text.includes("slow")) {
    interests.push("Wellness");
  }

  if (
    text.includes("drive") ||
    text.includes("roadtrip") ||
    text.includes("route") ||
    text.includes("pull-off")
  ) {
    interests.push("Scenic drives");
  }

  return interests.length > 0 ? interests : ["Food", "Nature", "Culture"];
}