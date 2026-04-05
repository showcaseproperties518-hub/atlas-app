"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ATLAS_BUILD_PREFILL_STORAGE_KEY } from "@/app/lib/atlas-trip";
import {
  AtlasStoredJourney,
  formatJourneyDate,
  getPublishedJourneys,
} from "@/app/lib/atlas-journeys";

type FeedTripCard = {
  id: string;
  title: string;
  location: string;
  image: string;
  tags: string[];
  likes: number;
  user: string;
  destination: string;
  length: string;
  budget: string;
  traveler: string;
  vibe: string;
  blend: string;
  energy: string;
  notes: string;
  source?: "published" | "fallback";
  publishedDate?: string;
  publishedJourney?: AtlasStoredJourney;
};

const nearYouFallback: FeedTripCard = {
  id: "near-you-hidden-waterfalls",
  title: "Hidden Waterfalls Near Albany",
  location: "Capital Region, NY",
  image:
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1800&q=80",
  tags: ["Near You", "Hidden Gems", "Weekend"],
  likes: 428,
  user: "Atlas Local",
  destination: "Albany, NY",
  length: "2 days",
  budget: "$300-$500",
  traveler: "Friends",
  vibe: "Scenic local adventure with hidden waterfalls and easy weekend energy",
  blend: "Hidden Gems",
  energy: "Balanced",
  notes: "Less driving, scenic stops, local coffee, easy trails, memorable viewpoints",
  source: "fallback",
};

const regionalTrips: FeedTripCard[] = [
  {
    id: "hudson-valley-scenic-escape",
    title: "Hudson Valley Scenic Escape",
    location: "Hudson Valley",
    image:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=80",
    tags: ["Regional", "Scenic", "Local Favorites"],
    likes: 612,
    user: "Nina",
    destination: "Hudson Valley, NY",
    length: "3 days",
    budget: "$700-$1200",
    traveler: "Couple",
    vibe: "Relaxed scenic escape with charming towns and great views",
    blend: "Scenic Route",
    energy: "Relaxed",
    notes: "Cute towns, overlooks, local food, cozy places to stay",
    source: "fallback",
  },
  {
    id: "lake-george-family-day",
    title: "Lake George Family Day",
    location: "Lake George",
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=80",
    tags: ["Family", "Weekend", "Driveable"],
    likes: 355,
    user: "Mark",
    destination: "Lake George, NY",
    length: "1 day",
    budget: "$150-$300",
    traveler: "Family",
    vibe: "Easy family day with views, food, and simple fun",
    blend: "Local Favorites",
    energy: "Balanced",
    notes: "Kid-friendly, minimal planning, easy parking, scenic spots",
    source: "fallback",
  },
];

const weekendEscapes: FeedTripCard[] = [
  {
    id: "catskills-cabin-route",
    title: "Catskills Cabin Route",
    location: "Catskills",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
    tags: ["Weekend", "Cabin", "Nature"],
    likes: 740,
    user: "Atlas Weekend",
    destination: "Catskills, NY",
    length: "2 days",
    budget: "$500-$900",
    traveler: "Couple",
    vibe: "Cozy cabin weekend with nature and slower pacing",
    blend: "Off the Beaten Path",
    energy: "Relaxed",
    notes: "Cabin feel, hikes, less crowded spots, one great dinner",
    source: "fallback",
  },
  {
    id: "vermont-fall-drive",
    title: "Vermont Fall Drive",
    location: "Vermont",
    image:
      "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1400&q=80",
    tags: ["Foliage", "Scenic", "Weekend"],
    likes: 593,
    user: "Atlas Weekend",
    destination: "Vermont",
    length: "3 days",
    budget: "$700-$1300",
    traveler: "Couple",
    vibe: "Beautiful foliage drive with scenic stops and local charm",
    blend: "Scenic Route",
    energy: "Relaxed",
    notes: "Leaf peeping, inns, short walks, scenic cafés",
    source: "fallback",
  },
  {
    id: "nyc-food-rooftops",
    title: "NYC Food + Rooftops",
    location: "New York City",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1400&q=80",
    tags: ["Food", "Nightlife", "City"],
    likes: 802,
    user: "Atlas Weekend",
    destination: "New York City",
    length: "2 days",
    budget: "$600-$1200",
    traveler: "Friends",
    vibe: "High-energy city trip with food, rooftops, and nightlife",
    blend: "Food-Focused",
    energy: "Packed",
    notes: "Best bites, rooftop bars, fun neighborhoods, late-night options",
    source: "fallback",
  },
];

const globalTrips: FeedTripCard[] = [
  {
    id: "amalfi-coast-road-trip",
    title: "Amalfi Coast Road Trip",
    location: "Italy",
    image:
      "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1600&q=80",
    tags: ["Global", "Coastal", "Luxury"],
    likes: 1243,
    user: "Marco",
    destination: "Amalfi Coast, Italy",
    length: "4 days",
    budget: "$1800-$3000",
    traveler: "Couple",
    vibe: "Dreamy coastal trip with stunning views and stylish moments",
    blend: "Iconic Spots",
    energy: "Relaxed",
    notes: "Sea views, elegant stays, beautiful towns, slower luxury pacing",
    source: "fallback",
  },
  {
    id: "iceland-ring-road",
    title: "Iceland Ring Road",
    location: "Iceland",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
    tags: ["Global", "Scenic", "Roadtrip"],
    likes: 2104,
    user: "Liam",
    destination: "Iceland",
    length: "7 days",
    budget: "$2500-$4500",
    traveler: "Friends",
    vibe: "Epic scenic roadtrip with waterfalls, landscapes, and wow moments",
    blend: "Scenic Route",
    energy: "Balanced",
    notes: "Best waterfalls, iconic stops, hidden scenic pull-offs, efficient routing",
    source: "fallback",
  },
];

const locationPills = ["Near You", "Capital Region", "New York", "Northeast", "Global"];
const filterPills = ["Hidden Gems", "Local Favorites", "Food", "Scenic", "Family", "Weekend"];

function mapPublishedJourneyToFeedCard(journey: AtlasStoredJourney, index: number): FeedTripCard {
  const tags = [
    "Published",
    journey.form.gemsPreference,
    journey.form.tripStyle,
  ].slice(0, 3);

  return {
    id: journey.id,
    title: journey.trip.title,
    location: journey.destination,
    image: journey.coverImage,
    tags,
    likes: 100 + index * 37,
    user: "Atlas Traveler",
    destination: journey.destination,
    length: journey.form.duration,
    budget: journey.form.budget,
    traveler: journey.form.travelers,
    vibe: journey.trip.subtitle,
    blend: journey.form.gemsPreference,
    energy: journey.form.energyLevel,
    notes: journey.trip.vibeSummary,
    source: "published",
    publishedDate: journey.updatedAt,
    publishedJourney: journey,
  };
}

export default function FeedPage() {
  const router = useRouter();
  const [selectedLocation, setSelectedLocation] = useState("Near You");
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const publishedTrips = useMemo(() => {
    return getPublishedJourneys().map(mapPublishedJourneyToFeedCard);
  }, []);

  const featuredNearYou = useMemo(() => {
    return publishedTrips[0] ?? nearYouFallback;
  }, [publishedTrips]);

  const publishedRegional = useMemo(() => {
    return publishedTrips.slice(1, 3);
  }, [publishedTrips]);

  const combinedRegionalTrips = useMemo(() => {
    return [...publishedRegional, ...regionalTrips].slice(0, 2);
  }, [publishedRegional]);

  const combinedWeekendEscapes = useMemo(() => {
    const publishedWeekend = publishedTrips.slice(3, 6);
    return [...publishedWeekend, ...weekendEscapes].slice(0, 4);
  }, [publishedTrips]);

  const combinedGlobalTrips = useMemo(() => {
    const publishedGlobal = publishedTrips.slice(6, 8);
    return [...publishedGlobal, ...globalTrips].slice(0, 4);
  }, [publishedTrips]);

  function handleBuildMyVersion(trip: FeedTripCard) {
    const prefill = {
      destination: trip.destination,
      duration: trip.length,
      budget: trip.budget,
      travelers: trip.traveler,
      energyLevel:
        trip.energy === "Packed"
          ? "High-energy"
          : trip.energy === "Relaxed"
          ? "Easygoing"
          : "Balanced",
      tripStyle:
        trip.blend === "Food-Focused"
          ? "Food-focused"
          : trip.traveler === "Family"
          ? "Family"
          : trip.blend === "Iconic Spots"
          ? "Luxury"
          : trip.blend === "Scenic Route"
          ? "Adventure"
          : "Adventure",
      gemsPreference:
        trip.blend === "Hidden Gems" || trip.blend === "Off the Beaten Path"
          ? "Hidden gems"
          : trip.blend === "Iconic Spots"
          ? "Top spots"
          : "Mix of both",
      travelPace:
        trip.energy === "Relaxed"
          ? "Flexible"
          : trip.energy === "Packed"
          ? "Planner"
          : "Flexible",
      interests: deriveInterestsFromTrip(trip),
    };

    window.localStorage.setItem(ATLAS_BUILD_PREFILL_STORAGE_KEY, JSON.stringify(prefill));
    router.push("/build");
  }

  function handleViewJourney(trip: FeedTripCard) {
    const prefill = {
      destination: trip.destination,
      duration: trip.length,
      budget: trip.budget,
      travelers: trip.traveler,
      energyLevel:
        trip.energy === "Packed"
          ? "High-energy"
          : trip.energy === "Relaxed"
          ? "Easygoing"
          : "Balanced",
      tripStyle:
        trip.blend === "Food-Focused"
          ? "Food-focused"
          : trip.traveler === "Family"
          ? "Family"
          : trip.blend === "Iconic Spots"
          ? "Luxury"
          : trip.blend === "Scenic Route"
          ? "Adventure"
          : "Adventure",
      gemsPreference:
        trip.blend === "Hidden Gems" || trip.blend === "Off the Beaten Path"
          ? "Hidden gems"
          : trip.blend === "Iconic Spots"
          ? "Top spots"
          : "Mix of both",
      travelPace:
        trip.energy === "Relaxed"
          ? "Flexible"
          : trip.energy === "Packed"
          ? "Planner"
          : "Flexible",
      interests: deriveInterestsFromTrip(trip),
    };

    window.localStorage.setItem(ATLAS_BUILD_PREFILL_STORAGE_KEY, JSON.stringify(prefill));
    router.push("/results");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#eef3f8] via-[#f7f4ef] to-[#fcfaf7] text-slate-900">
      <section className="relative h-[300px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1800&q=80"
          alt="Atlas feed hero"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-white/35" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/20 to-[#fcfaf7]" />

        <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-end px-5 pb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
            Atlas Feed
          </p>
          <h1 className="mt-2 text-5xl font-bold tracking-tight">
            Stay local. Go global.
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-slate-700">
            Discover nearby adventures first, then branch into regional escapes and global inspiration.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 pb-14">
        <section className="mt-6 rounded-[28px] border border-white/60 bg-white/65 p-5 shadow-lg backdrop-blur-xl">
          <div>
            <p className="text-sm font-semibold text-slate-500">Browse by area</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {locationPills.map((pill) => (
                <button
                  key={pill}
                  onClick={() => setSelectedLocation(pill)}
                  className={`rounded-full px-4 py-2 text-sm font-medium ${
                    selectedLocation === pill
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="text-sm font-semibold text-slate-500">Filter your vibe</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {filterPills.map((pill) => (
                <button
                  key={pill}
                  onClick={() => setSelectedFilter((current) => (current === pill ? null : pill))}
                  className={`rounded-full px-4 py-2 text-sm font-medium ${
                    selectedFilter === pill
                      ? "bg-sky-700 text-white"
                      : "border border-sky-100 bg-sky-50 text-sky-700"
                  }`}
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-3xl font-bold">Featured Near You</h2>
            <p className="mt-2 text-slate-600">
              The most relevant journeys should feel close, doable, and worth clicking.
            </p>
          </div>

          <div className="overflow-hidden rounded-[28px] bg-white shadow-lg">
            <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
              <div className="relative h-[360px]">
                <img
                  src={featuredNearYou.image}
                  alt={featuredNearYou.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />

                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <p className="text-sm font-medium text-white/85">@{featuredNearYou.user}</p>
                  <h3 className="mt-1 text-3xl font-bold">{featuredNearYou.title}</h3>
                  <p className="mt-1 text-white/90">{featuredNearYou.location}</p>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap gap-2">
                  {featuredNearYou.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <p className="mt-5 text-base leading-7 text-slate-600">
                  {featuredNearYou.notes}
                </p>

                {featuredNearYou.publishedDate ? (
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Published {formatJourneyDate(featuredNearYou.publishedDate)}
                  </p>
                ) : null}

                <div className="mt-6 flex items-center gap-4">
                  <span className="text-sm font-semibold text-slate-600">
                    ♡ {featuredNearYou.likes}
                  </span>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    onClick={() => handleViewJourney(featuredNearYou)}
                    className="rounded-full bg-slate-900 px-5 py-3 font-semibold text-white"
                  >
                    View Journey
                  </button>
                  <button
                    onClick={() => handleBuildMyVersion(featuredNearYou)}
                    className="rounded-full border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-900"
                  >
                    Build My Version
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold">Regional Favorites</h2>
              <p className="mt-2 text-slate-600">
                Close enough to do, different enough to feel like an escape.
              </p>
            </div>
            <button className="text-sm font-semibold text-slate-500">See More</button>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {combinedRegionalTrips.map((journey) => (
              <div
                key={journey.id}
                className="overflow-hidden rounded-[24px] bg-white shadow-md transition hover:shadow-lg"
              >
                <div className="relative h-72">
                  <img
                    src={journey.image}
                    alt={journey.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/22" />

                  <div className="absolute top-4 left-4 text-sm text-white/90">
                    @{journey.user}
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-2xl font-bold">{journey.title}</h3>
                    <p className="mt-1 text-sm">{journey.location}</p>
                  </div>
                </div>

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

                  {journey.publishedDate ? (
                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Published {formatJourneyDate(journey.publishedDate)}
                    </p>
                  ) : null}

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-600">
                      ♡ {journey.likes}
                    </span>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewJourney(journey)}
                        className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleBuildMyVersion(journey)}
                        className="rounded-full border border-slate-200 px-4 py-2 text-sm"
                      >
                        Build Similar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold">Weekend Escapes</h2>
              <p className="mt-2 text-slate-600">
                Scroll-worthy, lighter trips that are easy to imagine doing next.
              </p>
            </div>
          </div>

          <div className="flex gap-5 overflow-x-auto pb-3">
            {combinedWeekendEscapes.map((journey) => (
              <div
                key={journey.id}
                className="min-w-[300px] overflow-hidden rounded-[24px] bg-white shadow-md transition hover:shadow-lg"
              >
                <div className="relative h-72">
                  <img
                    src={journey.image}
                    alt={journey.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20" />

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-xl font-bold">{journey.title}</h3>
                    <p className="text-sm">{journey.location}</p>
                  </div>
                </div>

                <div className="p-4">
                  {journey.publishedDate ? (
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Published {formatJourneyDate(journey.publishedDate)}
                    </p>
                  ) : null}

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-600">
                      ♡ {journey.likes}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewJourney(journey)}
                        className="rounded-full border border-slate-200 px-4 py-2 text-sm"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleBuildMyVersion(journey)}
                        className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white"
                      >
                        Build My Version
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold">Global Inspiration</h2>
              <p className="mt-2 text-slate-600">
                When you want to go farther, Atlas still keeps the same personal feel.
              </p>
            </div>
            <button className="text-sm font-semibold text-slate-500">Explore Global</button>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {combinedGlobalTrips.map((journey) => (
              <div
                key={journey.id}
                className="overflow-hidden rounded-[24px] bg-white shadow-md transition hover:shadow-lg"
              >
                <div className="relative h-80">
                  <img
                    src={journey.image}
                    alt={journey.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/24" />

                  <div className="absolute top-4 left-4 text-sm text-white/90">
                    @{journey.user}
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-2xl font-bold">{journey.title}</h3>
                    <p className="mt-1 text-sm">{journey.location}</p>
                  </div>
                </div>

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

                  {journey.publishedDate ? (
                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Published {formatJourneyDate(journey.publishedDate)}
                    </p>
                  ) : null}

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-600">
                      ♡ {journey.likes}
                    </span>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewJourney(journey)}
                        className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleBuildMyVersion(journey)}
                        className="rounded-full border border-slate-200 px-4 py-2 text-sm"
                      >
                        Build My Version
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
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
    text.includes("view")
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