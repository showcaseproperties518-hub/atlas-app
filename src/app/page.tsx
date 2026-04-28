"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  ATLAS_BUILD_PREFILL_STORAGE_KEY,
  ATLAS_BUILD_STORAGE_KEY,
} from "@/app/lib/atlas-trip";
import {
  Compass,
  Heart,
  MapPin,
  Menu,
  Search,
  Sparkles,
  UserCircle2,
} from "lucide-react";

type TripPrefill = {
  destination: string;
  duration?: string;
  budget?: string;
  travelers?: string;
  tripStyle?: string;
  energyLevel?: string;
  gemsPreference?: string;
  travelPace?: string;
  stayType?: string;
  transportType?: string;
  flightOrigin?: string;
  interests?: string[];
};

type HomeTripCard = {
  title: string;
  subtitle: string;
  image: string;
  tag: string;
  stats: string;
  label?: string;
  meta?: string;
  prefill: TripPrefill;
};

const localTripIdeas: HomeTripCard[] = [
  {
    title: "Hudson Valley Waterfalls",
    subtitle: "Scenic drives, short hikes, small towns, and easy photo stops",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    tag: "Local escape",
    stats: "2 days · easy weekend",
    label: "Waterfalls",
    meta: "2 days · local reset",
    prefill: {
      destination: "Hudson Valley waterfalls road trip",
      duration: "Weekend",
      budget: "Mid-range",
      travelers: "Family",
      tripStyle: "Scenic local adventure",
      energyLevel: "Balanced",
      gemsPreference: "Mix of iconic and local",
      travelPace: "Balanced",
      stayType: "Hotel",
      transportType: "Rental car",
      flightOrigin: "Albany, NY",
      interests: ["Nature", "Family", "Scenic drives", "Food"],
    },
  },
  {
    title: "Lake George Family Weekend",
    subtitle: "Lake views, easy hikes, kid-friendly stops, and relaxed dinners",
    image:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
    tag: "Near Albany",
    stats: "3 days · family friendly",
    label: "Lake trip",
    meta: "3 days · family",
    prefill: {
      destination: "Lake George family weekend",
      duration: "3 days",
      budget: "Mid-range",
      travelers: "Family",
      tripStyle: "Family friendly lake weekend",
      energyLevel: "Balanced",
      gemsPreference: "Mix of iconic and local",
      travelPace: "Relaxed",
      stayType: "Hotel",
      transportType: "Rental car",
      flightOrigin: "Albany, NY",
      interests: ["Family", "Nature", "Food", "Wellness"],
    },
  },
  {
    title: "NYC Family Adventure",
    subtitle: "Skyline views, parks, pizza stops, museums, and city moments",
    image:
      "https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?auto=format&fit=crop&w=1200&q=80",
    tag: "Family favorite",
    stats: "3 days · city energy",
    label: "City trip",
    meta: "3 days · 18 saves",
    prefill: {
      destination: "New York City family adventure",
      duration: "3 days",
      budget: "Mid-range",
      travelers: "Family",
      tripStyle: "Family friendly city adventure",
      energyLevel: "Balanced",
      gemsPreference: "Mix of iconic and local",
      travelPace: "Balanced",
      stayType: "Hotel",
      transportType: "Walk + subway + taxi",
      flightOrigin: "Albany, NY",
      interests: ["Family", "Food", "Culture", "Photo spots"],
    },
  },
];

const epicTripIdeas: HomeTripCard[] = [
  {
    title: "Iceland Ring Road",
    subtitle: "Waterfalls, glaciers, black sand beaches, and dramatic drives",
    image:
      "https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&w=900&q=80",
    tag: "Epic route",
    stats: "7 days · bucket list",
    label: "Waterfalls",
    meta: "7 days · epic route",
    prefill: {
      destination: "Iceland Ring Road waterfalls glaciers black sand beaches",
      duration: "7 days",
      budget: "Premium",
      travelers: "Couple",
      tripStyle: "Adventure + nature",
      energyLevel: "Active",
      gemsPreference: "Mix of iconic and local",
      travelPace: "Balanced",
      stayType: "Hotels + cabins",
      transportType: "Rental car",
      flightOrigin: "Albany, NY",
      interests: ["Nature", "Scenic drives", "Adventure", "Photo spots"],
    },
  },
  {
    title: "Costa Rica Volcano Trip",
    subtitle: "Rainforest, hot springs, volcano views, wildlife, and beaches",
    image:
      "https://images.unsplash.com/photo-1518182170546-07661fd94144?auto=format&fit=crop&w=900&q=80",
    tag: "Trending now",
    stats: "7 days · rainforest",
    label: "Rainforest",
    meta: "7 days · trending",
    prefill: {
      destination: "Costa Rica volcano rainforest adventure",
      duration: "7 days",
      budget: "Mid-range",
      travelers: "Couple",
      tripStyle: "Adventure + beach + rainforest",
      energyLevel: "Balanced",
      gemsPreference: "Mix of iconic and local",
      travelPace: "Balanced",
      stayType: "Hotel + eco lodge",
      transportType: "Rental car",
      flightOrigin: "Albany, NY",
      interests: ["Nature", "Adventure", "Food", "Wellness"],
    },
  },
  {
    title: "Peru Sacred Valley",
    subtitle: "Machu Picchu energy, mountain towns, markets, and big views",
    image:
      "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=900&q=80",
    tag: "2026 watchlist",
    stats: "8 days · culture + views",
    label: "Mountains",
    meta: "8 days · rising",
    prefill: {
      destination: "Peru Sacred Valley Machu Picchu culture adventure",
      duration: "7 days",
      budget: "Mid-range",
      travelers: "Couple",
      tripStyle: "Culture + adventure",
      energyLevel: "Active",
      gemsPreference: "Mix of iconic and local",
      travelPace: "Planned",
      stayType: "Boutique hotels",
      transportType: "Guided transfers + train",
      flightOrigin: "Albany, NY",
      interests: ["Culture", "Adventure", "Nature", "Food"],
    },
  },
];

export default function HomePage() {
  const router = useRouter();
  const [destination, setDestination] = useState("");

  const rotatingLocalTrip = useMemo(() => {
    const index = new Date().getDate() % localTripIdeas.length;
    return localTripIdeas[index];
  }, []);

  const rotatingEpicTrip = useMemo(() => {
    const index = new Date().getDate() % epicTripIdeas.length;
    return epicTripIdeas[index];
  }, []);

  const nearbyTrips = useMemo(() => {
    return [rotatingLocalTrip, localTripIdeas[(new Date().getDate() + 1) % localTripIdeas.length]];
  }, [rotatingLocalTrip]);

  const heroTrips = useMemo(() => {
    return [
      rotatingEpicTrip,
      rotatingLocalTrip,
      epicTripIdeas[(new Date().getDate() + 1) % epicTripIdeas.length],
    ];
  }, [rotatingEpicTrip, rotatingLocalTrip]);

  const travelerStories = useMemo(() => {
    return [
      {
        title: rotatingEpicTrip.title,
        subtitle: rotatingEpicTrip.subtitle,
        image: rotatingEpicTrip.image,
        prefill: rotatingEpicTrip.prefill,
      },
    ];
  }, [rotatingEpicTrip]);

  const normalizeTripForm = (prefill: TripPrefill) => {
    const destinationValue = prefill.destination.trim();

    return {
      destination: destinationValue,
      startDate: "",
      endDate: "",
      duration: prefill.duration || "Flexible",
      budget: prefill.budget || "Mid-range",
      travelers: prefill.travelers || "Couple",
      tripStyle: prefill.tripStyle || "Balanced",
      energyLevel: prefill.energyLevel || "Balanced",
      gemsPreference: prefill.gemsPreference || "Mix of iconic and local",
      travelPace: prefill.travelPace || "Balanced",
      stayType: prefill.stayType || "",
      transportType: prefill.transportType || "",
      flightOrigin: prefill.flightOrigin || "Albany, NY",
      interests: prefill.interests || [],
    };
  };

  const saveBuildPrefill = (prefill: TripPrefill) => {
    if (typeof window === "undefined") return;

    const destinationValue = prefill.destination.trim();
    if (!destinationValue) return;

    const fullForm = normalizeTripForm(prefill);

    window.localStorage.setItem(
      ATLAS_BUILD_PREFILL_STORAGE_KEY,
      JSON.stringify(fullForm)
    );

    window.localStorage.setItem("atlasDestinationPrefill", destinationValue);
    window.localStorage.setItem("atlas_destination_prefill", destinationValue);
    window.localStorage.setItem("build_prefill_destination", destinationValue);
    window.localStorage.setItem(
      "atlasBuildPrefill",
      JSON.stringify({
        destination: destinationValue,
      })
    );
  };

  const saveResultsTrip = (prefill: TripPrefill) => {
    if (typeof window === "undefined") return;

    const destinationValue = prefill.destination.trim();
    if (!destinationValue) return;

    const fullForm = normalizeTripForm(prefill);

    window.localStorage.removeItem(ATLAS_BUILD_PREFILL_STORAGE_KEY);
    window.localStorage.setItem(ATLAS_BUILD_STORAGE_KEY, JSON.stringify(fullForm));
  };

  const goToResultsWithTrip = (prefill: TripPrefill) => {
    saveResultsTrip(prefill);
    router.push("/results");
  };

  const goToBuildWithPrefill = (prefill: TripPrefill) => {
    saveBuildPrefill(prefill);
    router.push("/build");
  };

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    goToBuildWithPrefill({
      destination,
      duration: "Flexible duration",
      budget: "Mid-range",
      travelers: "Couple",
      tripStyle: "Custom Atlas trip",
      energyLevel: "Balanced",
      gemsPreference: "Mix of iconic and local",
      travelPace: "Balanced",
      stayType: "",
      transportType: "",
      flightOrigin: "Albany, NY",
      interests: [],
    });
  };

  const handleCreateTrip = () => {
    goToBuildWithPrefill({
      destination,
      duration: "Flexible duration",
      budget: "Mid-range",
      travelers: "Couple",
      tripStyle: "Custom Atlas trip",
      energyLevel: "Balanced",
      gemsPreference: "Mix of iconic and local",
      travelPace: "Balanced",
      stayType: "",
      transportType: "",
      flightOrigin: "Albany, NY",
      interests: [],
    });
  };

  const handleExploreMap = () => {
    router.push("/map");
  };

  const handleTopSearch = () => {
    goToBuildWithPrefill({
      destination,
      duration: "Flexible duration",
      budget: "Mid-range",
      travelers: "Couple",
      tripStyle: "Custom Atlas trip",
      energyLevel: "Balanced",
      gemsPreference: "Mix of iconic and local",
      travelPace: "Balanced",
      stayType: "",
      transportType: "",
      flightOrigin: "Albany, NY",
      interests: [],
    });
  };

  const handleProfile = () => {
    router.push("/atlas");
  };

  const handleMenu = () => {
    router.push("/map");
  };

  return (
    <main className="min-h-screen bg-[#f5efe4] text-[#1f2933]">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80"
            alt="Atlas landscape"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/30 to-[#1f2933]/85" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#f5efe4] to-transparent" />
        </div>

        <div className="relative z-10 px-5 pb-10 pt-6">
          <div className="mb-10 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d6b98c]/25 ring-1 ring-white/25 backdrop-blur">
                <Compass className="h-5 w-5 text-[#f5d7a1]" strokeWidth={2.2} />
              </div>
              <div className="text-2xl font-bold tracking-tight">Atlas</div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Search"
                onClick={handleTopSearch}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/12 text-white backdrop-blur transition hover:bg-white/20"
              >
                <Search className="h-5 w-5" strokeWidth={2.2} />
              </button>
              <button
                type="button"
                aria-label="Profile"
                onClick={handleProfile}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/12 text-white backdrop-blur transition hover:bg-white/20"
              >
                <UserCircle2 className="h-5 w-5" strokeWidth={2.1} />
              </button>
              <button
                type="button"
                aria-label="Menu"
                onClick={handleMenu}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/12 text-white backdrop-blur transition hover:bg-white/20"
              >
                <Menu className="h-5 w-5" strokeWidth={2.2} />
              </button>
            </div>
          </div>

          <div className="mx-auto flex min-h-[565px] max-w-xl flex-col justify-center">
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/12 px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur">
              <Sparkles className="h-4 w-4 text-[#f5d7a1]" />
              Fresh AI-curated trip ideas
            </div>

            <h1 className="max-w-lg text-5xl font-bold leading-[0.95] tracking-tight text-white sm:text-6xl">
              Find a trip worth taking.
            </h1>

            <p className="mt-5 max-w-md text-lg leading-7 text-white/92">
              Explore fresh local escapes and epic travel ideas, build your own
              with AI, and share the moments that make it yours.
            </p>

            <form
              onSubmit={handleSearchSubmit}
              className="mt-7 flex w-full overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl"
            >
              <div className="flex items-center px-4 text-[#b99054]">
                <MapPin className="h-5 w-5" strokeWidth={2.2} />
              </div>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Where do you want to go?"
                className="w-full px-2 py-4 text-base text-slate-900 outline-none placeholder:text-slate-500"
              />
              <button
                type="submit"
                aria-label="Submit destination search"
                className="bg-[#1f2933] px-5 text-white transition hover:bg-[#111827]"
              >
                <Search className="h-5 w-5" strokeWidth={2.4} />
              </button>
            </form>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={handleCreateTrip}
                className="flex-1 rounded-xl bg-[#d6b98c] px-4 py-4 text-center text-base font-bold text-[#1f2933] shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:bg-[#e4c798]"
              >
                Build My Trip
              </button>

              <button
                type="button"
                onClick={handleExploreMap}
                className="flex-1 rounded-xl border border-white/25 bg-white/14 px-4 py-4 text-center text-base font-bold text-white shadow-xl backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/22"
              >
                Explore Trips
              </button>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm font-semibold text-white/90">
                Today’s trip starters
              </p>
              <button
                type="button"
                onClick={handleExploreMap}
                className="text-sm font-semibold text-[#f5d7a1]"
              >
                View map
              </button>
            </div>

            <div className="mt-3 flex gap-3 overflow-x-auto pb-3">
              {heroTrips.map((trip) => (
                <button
                  key={trip.title}
                  type="button"
                  onClick={() => goToResultsWithTrip(trip.prefill)}
                  className="group min-w-[220px] cursor-pointer overflow-hidden rounded-2xl border border-white/20 bg-white/14 text-left shadow-xl backdrop-blur transition hover:-translate-y-1 hover:bg-white/20"
                >
                  <div className="relative h-32 overflow-hidden">
                    <img
                      src={trip.image}
                      alt={trip.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                    <div className="absolute left-3 top-3 rounded-full bg-[#d6b98c] px-2.5 py-1 text-xs font-bold text-[#1f2933]">
                      {trip.label ?? trip.tag}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-sm font-bold text-white">
                        {trip.title}
                      </p>
                      <p className="mt-1 text-xs text-white/75">
                        {trip.meta ?? trip.stats}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3">
                    <p className="text-xs font-semibold text-white/75">
                      Tap to view trip
                    </p>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        goToBuildWithPrefill(trip.prefill);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.stopPropagation();
                          goToBuildWithPrefill(trip.prefill);
                        }
                      }}
                      className="rounded-full bg-white/18 px-2.5 py-1 text-xs font-bold text-white transition hover:bg-white/28"
                    >
                      Build My Version
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Adventures Nearby */}
      <section className="bg-[#f5efe4] px-5 py-7">
        <div className="mx-auto max-w-6xl">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#b99054]">
                Local right now
              </p>
              <h2 className="mt-1 text-3xl font-bold tracking-tight text-[#1f2933]">
                Easy trips near you
              </h2>
            </div>

            <Link
              href="/map"
              className="hidden rounded-full bg-[#1f2933] px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-[#111827] sm:inline-flex"
            >
              View map
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {nearbyTrips.map((trip) => (
              <button
                key={trip.title}
                type="button"
                onClick={() => goToResultsWithTrip(trip.prefill)}
                className="group cursor-pointer overflow-hidden rounded-[1.75rem] border border-[#e2d3bd] bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="relative h-56 w-full overflow-hidden">
                  <img
                    src={trip.image}
                    alt={trip.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />

                  <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#1f2933] shadow-md backdrop-blur">
                    {trip.tag}
                  </div>

                  <div className="absolute right-4 top-4 rounded-full bg-[#d6b98c] px-3 py-1 text-xs font-bold text-[#1f2933] shadow-md">
                    Fresh idea
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white">
                      {trip.title}
                    </h3>
                    <p className="mt-1 text-sm text-white/88">
                      {trip.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4">
                  <p className="text-sm font-semibold text-slate-600">
                    {trip.stats}
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        goToBuildWithPrefill(trip.prefill);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.stopPropagation();
                          goToBuildWithPrefill(trip.prefill);
                        }
                      }}
                      className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#8a6631] ring-1 ring-[#e2d3bd] transition hover:bg-[#fff7eb]"
                    >
                      Build My Version
                    </span>
                    <span className="rounded-full bg-[#f1dfc4] px-3 py-1.5 text-sm font-bold text-[#8a6631] transition group-hover:bg-[#d6b98c] group-hover:text-[#1f2933]">
                      View Trip
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-[1.75rem] border border-[#e2d3bd] bg-[#1f2933] p-5 text-white shadow-xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#f5d7a1]">
              Coming next
            </p>
            <h3 className="mt-2 text-2xl font-bold">
              Local ideas, trending places, and real journeys will blend together.
            </h3>
            <p className="mt-2 text-sm leading-6 text-white/75">
              Today these are smart Atlas starter trips. Next, Atlas can refresh
              these from an AI endpoint using seasonality, user location, and
              published journeys.
            </p>
          </div>
        </div>
      </section>

      {/* Traveler Stories */}
      <section className="bg-[#f5efe4] px-5 pb-9 pt-2">
        <div className="mx-auto max-w-6xl">
          <div className="mb-4">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#b99054]">
              Epic right now
            </p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight text-[#1f2933]">
              One idea can become your version
            </h2>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-[#e2d3bd] bg-white shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-[1.45fr_0.9fr]">
              <Link
                href="/map"
                className="group relative min-h-[380px] overflow-hidden bg-[#17212b]"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(214,185,140,0.26),transparent_18%),radial-gradient(circle_at_75%_38%,rgba(79,142,247,0.18),transparent_18%),radial-gradient(circle_at_45%_70%,rgba(214,185,140,0.20),transparent_16%),linear-gradient(135deg,#101820_0%,#1f2933_45%,#2b3540_100%)]" />

                <div className="absolute inset-0 opacity-[0.18]">
                  <div className="absolute left-[-10%] top-[18%] h-px w-[125%] rotate-[8deg] bg-white" />
                  <div className="absolute left-[-8%] top-[38%] h-px w-[120%] rotate-[-5deg] bg-white" />
                  <div className="absolute left-[-12%] top-[58%] h-px w-[130%] rotate-[6deg] bg-white" />
                  <div className="absolute left-[-4%] top-[78%] h-px w-[120%] rotate-[-7deg] bg-white" />
                  <div className="absolute left-[18%] top-[-15%] h-[130%] w-px rotate-[8deg] bg-white" />
                  <div className="absolute left-[42%] top-[-15%] h-[130%] w-px rotate-[-4deg] bg-white" />
                  <div className="absolute left-[66%] top-[-15%] h-[130%] w-px rotate-[5deg] bg-white" />
                  <div className="absolute left-[84%] top-[-15%] h-[130%] w-px rotate-[-8deg] bg-white" />
                </div>

                <svg
                  className="absolute inset-0 h-full w-full"
                  viewBox="0 0 900 520"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M85 330 C180 250, 245 292, 325 214 S510 112, 628 190 S760 270, 820 154"
                    fill="none"
                    stroke="rgba(245,215,161,0.68)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="8 10"
                  />
                  <path
                    d="M120 405 C210 360, 300 378, 410 312 S602 252, 735 320"
                    fill="none"
                    stroke="rgba(255,255,255,0.24)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="5 12"
                  />
                  <path
                    d="M235 135 C320 108, 382 142, 474 96 S645 82, 770 126"
                    fill="none"
                    stroke="rgba(79,142,247,0.30)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="7 12"
                  />
                </svg>

                <div className="absolute left-[7%] top-[17%] h-28 w-44 rounded-[45%] border border-white/12 bg-white/8 blur-[1px]" />
                <div className="absolute right-[7%] top-[18%] h-32 w-52 rounded-[48%] border border-white/12 bg-white/8 blur-[1px]" />
                <div className="absolute left-[28%] top-[48%] h-36 w-60 rounded-[48%] border border-white/10 bg-white/7 blur-[1px]" />
                <div className="absolute right-[20%] bottom-[8%] h-24 w-44 rounded-[48%] border border-white/10 bg-white/7 blur-[1px]" />

                <div className="absolute left-[10%] top-[58%]">
                  <div className="relative">
                    <span className="absolute -inset-3 animate-ping rounded-full bg-[#d6b98c]/25" />
                    <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#d6b98c] text-[#1f2933] shadow-[0_0_32px_rgba(214,185,140,0.55)]">
                      <MapPin className="h-5 w-5" fill="currentColor" strokeWidth={1.8} />
                    </span>
                    <div className="absolute left-9 top-1 min-w-[145px] rounded-2xl border border-white/16 bg-white/14 px-3 py-2 text-white shadow-xl backdrop-blur transition group-hover:bg-white/20">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f5d7a1]">
                        Local
                      </p>
                      <p className="mt-0.5 text-sm font-bold">Hudson Valley</p>
                    </div>
                  </div>
                </div>

                <div className="absolute left-[34%] top-[38%]">
                  <div className="relative">
                    <span className="absolute -inset-3 animate-pulse rounded-full bg-[#d6b98c]/30" />
                    <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#f5d7a1] text-[#1f2933] shadow-[0_0_32px_rgba(245,215,161,0.50)]">
                      <MapPin className="h-5 w-5" fill="currentColor" strokeWidth={1.8} />
                    </span>
                    <div className="absolute left-9 top-1 min-w-[135px] rounded-2xl border border-white/16 bg-white/14 px-3 py-2 text-white shadow-xl backdrop-blur transition group-hover:bg-white/20">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f5d7a1]">
                        Epic
                      </p>
                      <p className="mt-0.5 text-sm font-bold">Iceland</p>
                    </div>
                  </div>
                </div>

                <div className="absolute right-[17%] top-[31%]">
                  <div className="relative">
                    <span className="absolute -inset-3 animate-ping rounded-full bg-[#4f8ef7]/20" />
                    <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#d6b98c] text-[#1f2933] shadow-[0_0_32px_rgba(214,185,140,0.55)]">
                      <MapPin className="h-5 w-5" fill="currentColor" strokeWidth={1.8} />
                    </span>
                    <div className="absolute right-9 top-1 min-w-[145px] rounded-2xl border border-white/16 bg-white/14 px-3 py-2 text-right text-white shadow-xl backdrop-blur transition group-hover:bg-white/20">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f5d7a1]">
                        Trending
                      </p>
                      <p className="mt-0.5 text-sm font-bold">Costa Rica</p>
                    </div>
                  </div>
                </div>

                <div className="absolute right-[25%] bottom-[22%]">
                  <div className="relative">
                    <span className="absolute -inset-3 animate-pulse rounded-full bg-[#d6b98c]/25" />
                    <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#f5d7a1] text-[#1f2933] shadow-[0_0_32px_rgba(245,215,161,0.45)]">
                      <MapPin className="h-5 w-5" fill="currentColor" strokeWidth={1.8} />
                    </span>
                    <div className="absolute right-9 top-1 min-w-[120px] rounded-2xl border border-white/16 bg-white/14 px-3 py-2 text-right text-white shadow-xl backdrop-blur transition group-hover:bg-white/20">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f5d7a1]">
                        City
                      </p>
                      <p className="mt-0.5 text-sm font-bold">NYC</p>
                    </div>
                  </div>
                </div>

                <div className="absolute left-5 top-5 rounded-full border border-white/20 bg-white/14 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white shadow-xl backdrop-blur">
                  Live Atlas World
                </div>

                <div className="absolute right-5 top-5 rounded-full border border-[#d6b98c]/35 bg-[#d6b98c]/18 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#f5d7a1] shadow-xl backdrop-blur">
                  Tap the map
                </div>

                <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#111827] via-[#111827]/82 to-transparent" />

                <div className="absolute bottom-5 left-5 right-5">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#f5d7a1]">
                    Atlas World
                  </p>
                  <h3 className="mt-1 text-3xl font-bold text-white">
                    Explore the living map of trips
                  </h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-white/85">
                    Every pin opens a real or AI-built journey. View it instantly,
                    save it, publish it, or build your own version.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/14 px-3 py-2 text-xs font-bold text-white backdrop-blur">
                      Interactive pins
                    </span>
                    <span className="rounded-full bg-[#d6b98c] px-3 py-2 text-xs font-bold text-[#1f2933]">
                      Remix with AI
                    </span>
                  </div>
                </div>
              </Link>

              <div className="bg-[#fffaf2] p-4">
                {travelerStories.map((story) => (
                  <button
                    key={story.title}
                    type="button"
                    onClick={() => goToResultsWithTrip(story.prefill)}
                    className="group block w-full cursor-pointer rounded-[1.5rem] border border-[#e2d3bd] bg-white p-3 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="h-44 overflow-hidden rounded-[1.2rem]">
                      <img
                        src={story.image}
                        alt={story.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>

                    <div className="pt-4">
                      <div className="mb-2 inline-flex rounded-full bg-[#f1dfc4] px-3 py-1 text-xs font-bold text-[#8a6631]">
                        AI starter trip
                      </div>

                      <h3 className="text-2xl font-bold text-[#1f2933]">
                        {story.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {story.subtitle}
                      </p>

                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-500">
                          {rotatingEpicTrip.stats}
                        </p>
                        <div className="flex items-center gap-2">
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              goToBuildWithPrefill(story.prefill);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.stopPropagation();
                                goToBuildWithPrefill(story.prefill);
                              }
                            }}
                            className="rounded-full bg-[#f1dfc4] px-3 py-1.5 text-xs font-bold text-[#8a6631] transition hover:bg-[#d6b98c] hover:text-[#1f2933]"
                          >
                            Build My Version
                          </span>
                          <span className="rounded-full bg-[#1f2933] px-3 py-1.5 text-sm font-bold text-white">
                            View Trip
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 h-1 w-full rounded-full bg-[#d6b98c]" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom nav */}
      <nav className="sticky bottom-0 z-20 border-t border-[#e2d3bd] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center justify-around px-4 py-3">
          <Link href="/" className="flex flex-col items-center text-[#1f2933]">
            <Compass className="h-6 w-6" strokeWidth={2.1} />
            <span className="mt-1 text-sm font-semibold">Discover</span>
          </Link>

          <Link href="/build" className="flex flex-col items-center text-slate-900">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d6b98c] text-[#1f2933] shadow-md">
              <span className="text-3xl leading-none">+</span>
            </span>
            <span className="mt-1 text-sm font-semibold text-[#8a6631]">
              Build
            </span>
          </Link>

          <Link href="/atlas" className="flex flex-col items-center text-slate-600">
            <Heart className="h-6 w-6" strokeWidth={2.1} />
            <span className="mt-1 text-sm">Share</span>
          </Link>
        </div>
      </nav>
    </main>
  );
}