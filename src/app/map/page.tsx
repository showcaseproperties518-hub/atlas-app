"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatJourneyRange } from "@/app/lib/atlas-journeys";
import {
  ATLAS_BUILD_PREFILL_STORAGE_KEY,
  ATLAS_BUILD_STORAGE_KEY,
  AtlasTripFormData,
  AtlasTripOutput,
} from "@/app/lib/atlas-trip";
import { createClient } from "@/app/lib/supabase-client";

type MapJourney = {
  id: string;
  title: string;
  location: string;
  image: string;
  date: string;
  photos: number;
  type: string;
  source: "published" | "ai";
  x: string;
  y: string;
  destination: string;
  duration: string;
  budget: string;
  traveler: string;
  vibe: string;
  blend: string;
  energy: string;
  notes: string;
  remixCount: number;
  shareCount: number;
  trendingTag: string;
  videoUrl?: string;
  creatorName?: string;
  creatorHandle?: string;
  creatorPlatform?: "TikTok" | "Instagram" | "YouTube" | "Atlas";
};

type JourneyRow = {
  id: string;
  title: string | null;
  destination: string | null;
  cover_image: string | null;
  start_date: string | null;
  end_date: string | null;
  duration?: string | null;
  budget?: string | null;
  travelers?: string | null;
  trip_style?: string | null;
  energy_level?: string | null;
  vibe_summary?: string | null;
  subtitle?: string | null;
  is_published?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  creator_name?: string | null;
  creator_username?: string | null;
  creator_avatar?: string | null;
  form?: Partial<AtlasTripFormData> | null;
  trip?: Partial<AtlasTripOutput> | null;
};

const fallbackIdeas: MapJourney[] = [
  {
    id: "ai1",
    title: "Costa Rica Waterfalls + Coast",
    location: "Costa Rica",
    image:
      "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=1400&q=80",
    date: "",
    photos: 0,
    type: "AI Idea · Adventure",
    source: "ai",
    x: "22%",
    y: "50%",
    destination: "Costa Rica",
    duration: "7 days",
    budget: "$2,000 - $4,000",
    traveler: "Friends",
    vibe: "Waterfalls, coastlines, tropical energy, and scenic adventure.",
    blend: "Mix of both",
    energy: "Balanced",
    notes: "Atlas AI idea built for travelers who want a big-feeling tropical route.",
    remixCount: 214,
    shareCount: 91,
    trendingTag: "✨ Atlas idea",
    videoUrl: "https://www.youtube.com/results?search_query=Costa+Rica+waterfalls+coast+travel+vlog",
    creatorName: "Atlas Clips",
    creatorHandle: "@atlasworld",
    creatorPlatform: "YouTube",
  },
  {
    id: "ai2",
    title: "NYC Food + Rooftops",
    location: "New York City",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1400&q=80",
    date: "",
    photos: 0,
    type: "AI Idea · Food",
    source: "ai",
    x: "40%",
    y: "53%",
    destination: "New York City",
    duration: "3 days",
    budget: "$1,500 - $2,500",
    traveler: "Couple",
    vibe: "Food, rooftops, neighborhoods, and late-night city energy.",
    blend: "Top spots",
    energy: "High-energy",
    notes: "Atlas AI idea for a fast, high-reward city weekend.",
    remixCount: 178,
    shareCount: 74,
    trendingTag: "💡 Route idea",
    videoUrl: "https://www.tiktok.com/search?q=nyc%20food%20rooftop%20travel",
    creatorName: "Atlas City",
    creatorHandle: "@atlascity",
    creatorPlatform: "TikTok",
  },
  {
    id: "ai3",
    title: "Iceland Photo Route",
    location: "Iceland",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
    date: "",
    photos: 0,
    type: "AI Idea · Scenic",
    source: "ai",
    x: "60%",
    y: "48%",
    destination: "Iceland",
    duration: "5 days",
    budget: "$2,000 - $4,000",
    traveler: "Couple",
    vibe: "Big scenery, photo stops, dramatic landscapes, and clean route planning.",
    blend: "Top spots",
    energy: "Balanced",
    notes: "Atlas AI idea for a cinematic, photo-forward Iceland trip.",
    remixCount: 326,
    shareCount: 144,
    trendingTag: "📸 Photo route",
    videoUrl: "https://www.youtube.com/results?search_query=Iceland+photo+route+travel+vlog",
    creatorName: "Atlas Photo Route",
    creatorHandle: "@atlasroutes",
    creatorPlatform: "YouTube",
  },
  {
    id: "ai4",
    title: "Hudson Valley Escape",
    location: "Upstate New York",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=80",
    date: "",
    photos: 0,
    type: "AI Idea · Local",
    source: "ai",
    x: "82%",
    y: "43%",
    destination: "Hudson Valley, NY",
    duration: "Weekend",
    budget: "Under $1,500",
    traveler: "Couple",
    vibe: "Waterfalls, towns, scenic drives, and easy local adventure.",
    blend: "Hidden gems",
    energy: "Easygoing",
    notes: "Atlas AI idea for a local-first weekend with strong visual payoff.",
    remixCount: 119,
    shareCount: 51,
    trendingTag: "🌿 Local idea",
    videoUrl: "https://www.instagram.com/explore/search/keyword/?q=hudson%20valley%20travel",
    creatorName: "Atlas Local",
    creatorHandle: "@atlaslocal",
    creatorPlatform: "Instagram",
  },
  {
    id: "ai5",
    title: "Alaska Glacier Journey",
    location: "Alaska",
    image:
      "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1400&q=80",
    date: "",
    photos: 0,
    type: "AI Idea · Big Nature",
    source: "ai",
    x: "28%",
    y: "72%",
    destination: "Alaska",
    duration: "10 days",
    budget: "$4,000 - $7,000",
    traveler: "Family",
    vibe: "Glaciers, wildlife, big landscapes, and unforgettable route moments.",
    blend: "Mix of both",
    energy: "Balanced",
    notes: "Atlas AI idea for a big-feeling family nature route.",
    remixCount: 241,
    shareCount: 88,
    trendingTag: "🧭 Atlas pick",
    videoUrl: "https://www.youtube.com/results?search_query=Alaska+glacier+travel+vlog",
    creatorName: "Atlas Nature",
    creatorHandle: "@atlasnature",
    creatorPlatform: "YouTube",
  },
  {
    id: "ai6",
    title: "Italy Slow Romance",
    location: "Italy",
    image:
      "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1400&q=80",
    date: "",
    photos: 0,
    type: "AI Idea · Romantic",
    source: "ai",
    x: "68%",
    y: "66%",
    destination: "Italy",
    duration: "7 days",
    budget: "$4,000 - $7,000",
    traveler: "Couple",
    vibe: "Slow mornings, beautiful streets, unforgettable dinners, and romantic pacing.",
    blend: "Mix of both",
    energy: "Easygoing",
    notes: "Atlas AI idea for a slower, premium, romantic itinerary.",
    remixCount: 286,
    shareCount: 103,
    trendingTag: "💛 Couple route",
    videoUrl: "https://www.tiktok.com/search?q=italy%20romantic%20travel%20itinerary",
    creatorName: "Atlas Romance",
    creatorHandle: "@atlasromance",
    creatorPlatform: "TikTok",
  },
];


const aiIdeaPool: Array<Omit<MapJourney, "id" | "x" | "y" | "remixCount" | "shareCount">> = [
  ...fallbackIdeas.map(({ id, x, y, remixCount, shareCount, ...idea }) => idea),
  {
    title: "Arizona Desert Route",
    location: "Arizona",
    image:
      "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1400&q=80",
    date: "",
    photos: 0,
    type: "AI Idea · Desert",
    source: "ai",
    destination: "Arizona",
    duration: "5 days",
    budget: "$1,500 - $2,500",
    traveler: "Couple",
    vibe: "Red rocks, desert sunsets, scenic drives, and warm-weather adventure.",
    blend: "Mix of both",
    energy: "Balanced",
    notes: "Atlas AI idea for a cinematic Southwest route with strong photo payoff.",
    trendingTag: "🏜 Desert route",
    videoUrl: "https://www.youtube.com/results?search_query=Arizona+desert+road+trip+travel+vlog",
    creatorName: "Atlas Desert",
    creatorHandle: "@atlasdesert",
    creatorPlatform: "YouTube",
  },
  {
    title: "Maine Coast Weekend",
    location: "Maine",
    image:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=80",
    date: "",
    photos: 0,
    type: "AI Idea · Coastal",
    source: "ai",
    destination: "Maine Coast",
    duration: "Weekend",
    budget: "$1,500 - $2,500",
    traveler: "Family",
    vibe: "Lighthouses, seafood stops, rocky coastlines, and easy family pacing.",
    blend: "Mix of both",
    energy: "Easygoing",
    notes: "Atlas AI idea for a Northeast coastal escape that feels easy to copy.",
    trendingTag: "🌊 Coast idea",
    videoUrl: "https://www.youtube.com/results?search_query=Maine+coast+weekend+travel+vlog",
    creatorName: "Atlas Coast",
    creatorHandle: "@atlascoast",
    creatorPlatform: "YouTube",
  },
  {
    title: "Colorado Mountain Weekend",
    location: "Colorado",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
    date: "",
    photos: 0,
    type: "AI Idea · Mountains",
    source: "ai",
    destination: "Colorado",
    duration: "4 days",
    budget: "$2,000 - $4,000",
    traveler: "Friends",
    vibe: "Mountain towns, hikes, views, breweries, and high-altitude energy.",
    blend: "Hidden gems",
    energy: "High-energy",
    notes: "Atlas AI idea for a fast mountain trip with enough structure to feel bookable.",
    trendingTag: "⛰ Mountain idea",
    videoUrl: "https://www.tiktok.com/search?q=colorado%20mountain%20weekend%20travel",
    creatorName: "Atlas Peaks",
    creatorHandle: "@atlaspeaks",
    creatorPlatform: "TikTok",
  },
  {
    title: "San Diego Family Sun Trip",
    location: "San Diego",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
    date: "",
    photos: 0,
    type: "AI Idea · Family",
    source: "ai",
    destination: "San Diego",
    duration: "5 days",
    budget: "$2,000 - $4,000",
    traveler: "Family",
    vibe: "Beaches, easy food, zoo moments, coastal neighborhoods, and kid-friendly sunshine.",
    blend: "Top spots",
    energy: "Balanced",
    notes: "Atlas AI idea for families who want low-stress sunshine with big payoff.",
    trendingTag: "☀️ Family sun",
    videoUrl: "https://www.instagram.com/explore/search/keyword/?q=san%20diego%20family%20travel",
    creatorName: "Atlas Family",
    creatorHandle: "@atlasfamily",
    creatorPlatform: "Instagram",
  },
  {
    title: "New Orleans Food + Music",
    location: "New Orleans",
    image:
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1400&q=80",
    date: "",
    photos: 0,
    type: "AI Idea · Food",
    source: "ai",
    destination: "New Orleans",
    duration: "3 days",
    budget: "$1,500 - $2,500",
    traveler: "Friends",
    vibe: "Live music, food crawls, late nights, local streets, and culture everywhere.",
    blend: "Mix of both",
    energy: "High-energy",
    notes: "Atlas AI idea built for travelers who want a social, high-flavor weekend.",
    trendingTag: "🎺 Food route",
    videoUrl: "https://www.tiktok.com/search?q=new%20orleans%20food%20music%20travel",
    creatorName: "Atlas Food",
    creatorHandle: "@atlasfood",
    creatorPlatform: "TikTok",
  },
  {
    title: "California Coast Drive",
    location: "California",
    image:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=80",
    date: "",
    photos: 0,
    type: "AI Idea · Road Trip",
    source: "ai",
    destination: "California Coast",
    duration: "7 days",
    budget: "$4,000 - $7,000",
    traveler: "Couple",
    vibe: "Ocean cliffs, slow towns, sunset stops, food anchors, and scenic drive energy.",
    blend: "Mix of both",
    energy: "Balanced",
    notes: "Atlas AI idea for a classic coastal drive that is easy to remix.",
    trendingTag: "🚗 Scenic drive",
    videoUrl: "https://www.youtube.com/results?search_query=California+coast+road+trip+travel+vlog",
    creatorName: "Atlas Drives",
    creatorHandle: "@atlasdrives",
    creatorPlatform: "YouTube",
  },
  {
    title: "Montreal Food Weekend",
    location: "Montreal",
    image:
      "https://images.unsplash.com/photo-1519181245277-cffeb31da2e3?auto=format&fit=crop&w=1400&q=80",
    date: "",
    photos: 0,
    type: "AI Idea · Food",
    source: "ai",
    destination: "Montreal",
    duration: "Weekend",
    budget: "$1,500 - $2,500",
    traveler: "Couple",
    vibe: "Old streets, bagels, wine bars, markets, neighborhoods, and easy city energy.",
    blend: "Hidden gems",
    energy: "Balanced",
    notes: "Atlas AI idea for a quick international-feeling weekend from the Northeast.",
    trendingTag: "🥐 Food weekend",
    videoUrl: "https://www.instagram.com/explore/search/keyword/?q=montreal%20food%20travel",
    creatorName: "Atlas City",
    creatorHandle: "@atlascity",
    creatorPlatform: "Instagram",
  },
];

const filters = ["All", "Published", "AI Ideas", "Past Trips", "Photo Trips"];

function mapDbJourneyToStoredJourney(journey: JourneyRow): any {
  const formFromDb = (journey.form ?? {}) as Partial<AtlasTripFormData>;
  const tripFromDb = (journey.trip ?? {}) as Partial<AtlasTripOutput>;

  return {
    id: journey.id,
    destination: journey.destination ?? "Unknown destination",
    coverImage:
      journey.cover_image ||
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
    createdAt: journey.created_at ?? new Date().toISOString(),
    updatedAt: journey.updated_at ?? journey.created_at ?? new Date().toISOString(),
    source: "published",
    form: {
      destination: journey.destination ?? formFromDb.destination ?? "",
      startDate: journey.start_date ?? formFromDb.startDate ?? "",
      endDate: journey.end_date ?? formFromDb.endDate ?? "",
      duration: journey.duration ?? formFromDb.duration ?? "Flexible",
      budget: journey.budget ?? formFromDb.budget ?? "Mid-range",
      travelers: journey.travelers ?? formFromDb.travelers ?? "Couple",
      tripStyle: journey.trip_style ?? formFromDb.tripStyle ?? "Adventure",
      energyLevel: journey.energy_level ?? formFromDb.energyLevel ?? "Balanced",
      gemsPreference: formFromDb.gemsPreference ?? "Mix of both",
      travelPace: formFromDb.travelPace ?? "Flexible",
      interests: formFromDb.interests ?? [],
      stayType: formFromDb.stayType ?? "",
      transportType: formFromDb.transportType ?? "",
      flightOrigin: formFromDb.flightOrigin ?? "",
    },
    trip: {
      title: journey.title ?? tripFromDb.title ?? "Untitled Journey",
      subtitle:
        journey.subtitle ??
        tripFromDb.subtitle ??
        journey.vibe_summary ??
        "A published Atlas journey.",
      vibeSummary:
        journey.vibe_summary ??
        tripFromDb.vibeSummary ??
        "A published Atlas journey.",
      days: tripFromDb.days ?? [],
      staySuggestion: (tripFromDb as any).staySuggestion ?? "",
      transportSuggestion: (tripFromDb as any).transportSuggestion ?? "",
      flightSuggestion: (tripFromDb as any).flightSuggestion ?? "",
      titleTag: (tripFromDb as any).titleTag ?? "",
      highlights: (tripFromDb as any).highlights ?? [],
    },
    notes: journey.vibe_summary ?? "",
    moments: [],
    photos: journey.cover_image
      ? [
          {
            id: `${journey.id}-cover`,
            url: journey.cover_image,
            createdAt: journey.updated_at ?? journey.created_at ?? new Date().toISOString(),
          },
        ]
      : [],
    startDate: journey.start_date ?? undefined,
    endDate: journey.end_date ?? undefined,
    isPastJourney: false,
    creatorName: journey.creator_name ?? (tripFromDb as any).creatorName ?? "Atlas traveler",
    creatorUsername: journey.creator_username ?? (tripFromDb as any).creatorUsername ?? "atlasworld",
    creatorAvatar: journey.creator_avatar ?? (tripFromDb as any).creatorAvatar ?? "",
  };
}

function mapPublishedJourneyToMapCard(journey: any, index: number): MapJourney {
  const pinPositions = [
    { x: "18%", y: "52%" },
    { x: "34%", y: "47%" },
    { x: "51%", y: "44%" },
    { x: "72%", y: "54%" },
    { x: "27%", y: "72%" },
    { x: "63%", y: "68%" },
    { x: "84%", y: "40%" },
    { x: "46%", y: "61%" },
  ];

  const fallback = pinPositions[index % pinPositions.length];

  return {
    id: journey.id,
    title: journey.trip.title,
    location: journey.destination,
    image: journey.coverImage,
    date: formatJourneyRange(journey.startDate, journey.endDate),
    photos: journey.photos?.length ?? 0,
    type: `Published · ${journey.form.tripStyle}`,
    source: "published",
    x: fallback.x,
    y: fallback.y,
    destination: journey.destination,
    duration: journey.form.duration,
    budget: journey.form.budget,
    traveler: journey.form.travelers,
    vibe: journey.trip.subtitle,
    blend: journey.form.gemsPreference,
    energy: journey.form.energyLevel,
    notes: journey.notes?.trim() || journey.trip.vibeSummary,
    remixCount: 84 + index * 17,
    shareCount: 31 + index * 9,
    trendingTag: index % 3 === 0 ? "🌍 Published journey" : index % 3 === 1 ? "📸 Photo route" : "🧭 Atlas pick",
    videoUrl: (journey.trip as any)?.videoUrl || (journey.form as any)?.videoUrl || "",
    creatorName: journey.creatorName || (journey.trip as any)?.creatorName || "Atlas traveler",
    creatorHandle: `@${(journey.creatorUsername || (journey.trip as any)?.creatorUsername || "atlasworld")
      .toString()
      .replace(/^@/, "")}`,
    creatorPlatform: "Atlas",
  };
}

function deriveInterestsFromTrip(trip: MapJourney) {
  const text = `${trip.title} ${trip.vibe} ${trip.notes} ${trip.type}`.toLowerCase();
  const interests: string[] = [];

  if (text.includes("food") || text.includes("coffee") || text.includes("dining")) {
    interests.push("Food");
  }
  if (
    text.includes("waterfall") ||
    text.includes("nature") ||
    text.includes("scenic") ||
    text.includes("landscape") ||
    text.includes("coast") ||
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
  if (trip.traveler === "Family" || text.includes("family")) {
    interests.push("Family");
  }
  if (
    trip.traveler === "Couple" ||
    text.includes("romantic") ||
    text.includes("cozy")
  ) {
    interests.push("Romance");
  }
  if (text.includes("culture") || text.includes("town") || text.includes("museum")) {
    interests.push("Culture");
  }
  if (text.includes("relax") || text.includes("easygoing")) {
    interests.push("Wellness");
  }
  if (text.includes("drive") || text.includes("route") || text.includes("roadtrip")) {
    interests.push("Scenic drives");
  }

  return interests.length > 0 ? interests : ["Food", "Nature", "Culture"];
}

function getSocialProofForTrip(trip: MapJourney, index = 0) {
  if (trip.source === "published") {
    const base = Math.max(38, 74 + index * 17);
    return {
      remixCount: trip.remixCount || base,
      shareCount: trip.shareCount || Math.max(18, Math.floor(base * 0.42)),
      trendingTag: trip.trendingTag || (index % 2 === 0 ? "🌍 Published journey" : "📸 Photo route"),
    };
  }

  return {
    remixCount: trip.remixCount || 96 + index * 23,
    shareCount: trip.shareCount || 34 + index * 11,
    trendingTag: trip.trendingTag || "✨ Atlas idea",
  };
}

function buildShareCaption(trip: MapJourney) {
  const duration = trip.duration || "Flexible";
  const destination = trip.destination || trip.location;
  const title = trip.title || "Atlas journey";
  const vibe = trip.vibe || trip.notes || "A trip worth saving.";

  return `${title}

${duration} in ${destination}
${vibe}

Posted by ${getCreatorFallback(trip).handle}
Built on Atlas — discover it, save it, or build your version.`;
}

function buildEncodedShareCaption(trip: MapJourney) {
  return encodeURIComponent(buildShareCaption(trip));
}

function buildJourneyShareUrl(trip: MapJourney) {
  if (typeof window === "undefined") return `/map`;
  const path = trip.source === "published" ? `/atlas/${trip.id}` : `/build`;
  return `${window.location.origin}${path}`;
}

function buildPinterestShareUrl(trip: MapJourney) {
  const url =
    trip.source === "published"
      ? `/atlas/${trip.id}`
      : `/map`;
  const destinationUrl =
    typeof window === "undefined" ? url : `${window.location.origin}${url}`;

  return `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(
    destinationUrl
  )}&media=${encodeURIComponent(trip.image)}&description=${buildEncodedShareCaption(trip)}`;
}

function buildFacebookShareUrl(trip: MapJourney) {
  const url =
    typeof window === "undefined"
      ? `/map`
      : trip.source === "published"
        ? `${window.location.origin}/atlas/${trip.id}`
        : `${window.location.origin}/map`;

  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

function buildTikTokSearchUrl(trip: MapJourney) {
  return `https://www.tiktok.com/search?q=${encodeURIComponent(
    `${trip.destination} travel itinerary Atlas`
  )}`;
}

function buildInstagramSearchUrl(trip: MapJourney) {
  return `https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(
    `${trip.destination} travel`
  )}`;
}



function getCreatorFallback(trip: MapJourney) {
  if (trip.creatorName || trip.creatorHandle) {
    return {
      name: trip.creatorName || "Atlas creator",
      handle: trip.creatorHandle || "@atlasworld",
      platform: trip.creatorPlatform || "Atlas",
    };
  }

  if (trip.source === "published") {
    return {
      name: "Atlas traveler",
      handle: "@atlasworld",
      platform: "Atlas" as const,
    };
  }

  return {
    name: "Atlas AI route",
    handle: "@atlasworld",
    platform: "Atlas" as const,
  };
}

function getCreatorUsername(trip: MapJourney) {
  const creator = getCreatorFallback(trip);
  const cleanHandle = creator.handle
    .toLowerCase()
    .replace(/^@/, "")
    .replace(/[^a-z0-9]+/g, "")
    .trim();

  return cleanHandle || "atlasworld";
}

function getCreatorInitial(trip: MapJourney) {
  const creator = getCreatorFallback(trip);
  const source = creator.handle?.replace("@", "") || creator.name || "Atlas";
  return source.charAt(0).toUpperCase();
}

function getTripVideoUrl(trip: MapJourney) {
  if (trip.videoUrl) return trip.videoUrl;

  const destination = trip.destination || trip.location || "travel";
  const query = encodeURIComponent(`${destination} travel itinerary vlog`);

  if (trip.source === "published") {
    return `https://www.youtube.com/results?search_query=${query}`;
  }

  return `https://www.tiktok.com/search?q=${query}`;
}

function getVideoPlatformLabel(trip: MapJourney) {
  if (trip.creatorPlatform) return trip.creatorPlatform;
  if (trip.videoUrl?.includes("tiktok")) return "TikTok";
  if (trip.videoUrl?.includes("instagram")) return "Instagram";
  if (trip.videoUrl?.includes("youtube") || trip.videoUrl?.includes("youtu.be")) return "YouTube";
  return trip.source === "published" ? "Creator video" : "Travel video";
}

function getVideoHookLine(trip: MapJourney) {
  const destination = trip.destination || trip.location || "this trip";
  if (trip.source === "published") {
    return `Watch the trip energy before building your version of ${destination}.`;
  }

  return `Preview the vibe, then turn ${destination} into your own Atlas route.`;
}

function buildMapStayLink(trip: MapJourney) {
  return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(
    trip.destination || trip.location || ""
  )}`;
}

function buildMapFlightLink(trip: MapJourney) {
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(
    `Flights to ${trip.destination || trip.location || ""}`
  )}`;
}

function buildMapExperienceLink(trip: MapJourney) {
  return `https://www.getyourguide.com/s/?q=${encodeURIComponent(
    trip.destination || trip.location || ""
  )}`;
}

function getTrendingScore(trip: MapJourney) {
  return trip.remixCount * 2 + trip.shareCount * 3 + trip.photos * 5;
}

function getLiveTrendLabel(trip: MapJourney) {
  if (trip.source === "published") {
    return "🌍 Published journey";
  }

  if (trip.photos > 0) {
    return "📸 Photo route";
  }

  return "✨ Atlas idea";
}


function shuffleMapJourneys(items: MapJourney[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function getRotatingFallbackIdeas() {
  const pinPositions = [
    { x: "18%", y: "52%" },
    { x: "34%", y: "47%" },
    { x: "51%", y: "44%" },
    { x: "72%", y: "54%" },
    { x: "27%", y: "72%" },
    { x: "63%", y: "68%" },
    { x: "84%", y: "40%" },
    { x: "46%", y: "61%" },
  ];

  const visitSeed = Date.now();
  const selected = [...aiIdeaPool].sort(() => Math.random() - 0.5).slice(0, 8);

  return selected.map((journey, index) => {
    const position = pinPositions[index % pinPositions.length];
    const remixBase = 72 + Math.floor(Math.random() * 260);
    const shareBase = 24 + Math.floor(Math.random() * 120);

    return {
      ...journey,
      id: `ai-${visitSeed}-${index}-${journey.destination.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      x: position.x,
      y: position.y,
      remixCount: remixBase,
      shareCount: shareBase,
    };
  });
}


function getLocalPublishedJourneysForMap() {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem("ATLAS_PUBLISHED_JOURNEYS");
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function useIsMobile(breakpoint = 1024) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function update() {
      setIsMobile(window.innerWidth < breakpoint);
    }

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [breakpoint]);

  return isMobile;
}

export default function MapPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [hoveredPinId, setHoveredPinId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [publishedSourceJourneys, setPublishedSourceJourneys] = useState<any[]>([]);
  const [shareMessage, setShareMessage] = useState("");
  const [copiedTripId, setCopiedTripId] = useState<string | null>(null);
  const [highlightedJourneyId, setHighlightedJourneyId] = useState<string | null>(null);
  const [watchTrip, setWatchTrip] = useState<MapJourney | null>(null);
  const [rotatingFallbackIdeas] = useState(getRotatingFallbackIdeas);

  useEffect(() => {
    async function loadPublishedJourneys() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("journeys")
          .select("*")
          .eq("is_published", true)
          .order("updated_at", { ascending: false });

        if (error) {
          console.error("Failed to load published journeys for map", error);
          setPublishedSourceJourneys([]);
          return;
        }

        const mapped = ((data ?? []) as JourneyRow[]).map(mapDbJourneyToStoredJourney);
        const localPublished = getLocalPublishedJourneysForMap();
        const merged = [
          ...mapped,
          ...localPublished.filter(
            (localJourney: any) =>
              !mapped.some((dbJourney: any) => dbJourney.id === localJourney.id)
          ),
        ];

        setPublishedSourceJourneys(merged);
      } catch (error) {
        console.error("Failed to load published journeys for map", error);
        setPublishedSourceJourneys(getLocalPublishedJourneysForMap());
      }
    }

    loadPublishedJourneys();
  }, []);

  const allJourneys = useMemo(() => {
    const published = publishedSourceJourneys.map(mapPublishedJourneyToMapCard);
    const aiFill = rotatingFallbackIdeas.slice(0, Math.max(6, 10 - published.length));
    return [...published, ...aiFill];
  }, [publishedSourceJourneys, rotatingFallbackIdeas]);

  const journeys = useMemo(() => {
    if (activeFilter === "Published") {
      return allJourneys.filter((j) => j.source === "published");
    }

    if (activeFilter === "AI Ideas") {
      return allJourneys.filter((j) => j.source === "ai");
    }

    if (activeFilter === "Past Trips") {
      return allJourneys.filter(
        (j) => j.source === "published" && j.type.toLowerCase().includes("published")
      );
    }

    if (activeFilter === "Photo Trips") {
      return allJourneys.filter((j) => j.photos > 0);
    }

    return allJourneys;
  }, [activeFilter, allJourneys]);

  const featuredJourneys = useMemo(() => {
    const published = journeys.filter((journey) => journey.source === "published");
    const ai = journeys.filter((journey) => journey.source === "ai");
    return [...published.slice(0, 4), ...shuffleMapJourneys(ai)].slice(0, 6);
  }, [journeys]);

  const activeJourney = useMemo(() => {
    const activeId = hoveredPinId || selectedId;
    return featuredJourneys.find((journey) => journey.id === activeId) ?? null;
  }, [featuredJourneys, hoveredPinId, selectedId]);

  const trendingJourneys = useMemo(() => {
    return [...journeys]
      .sort((a, b) => b.remixCount + b.shareCount - (a.remixCount + a.shareCount))
      .slice(0, 3);
  }, [journeys]);

  const bucketListJourneys = useMemo(() => {
    return journeys.filter((journey) => journey.trendingTag || journey.photos > 0).slice(0, 4);
  }, [journeys]);

  const trendingNow = useMemo(() => {
    return [...journeys]
      .sort((a, b) => getTrendingScore(b) - getTrendingScore(a))
      .slice(0, 5);
  }, [journeys]);

  async function handleCopyShareCaption(trip: MapJourney) {
    const caption = buildShareCaption(trip);

    try {
      await navigator.clipboard.writeText(caption);
      setCopiedTripId(trip.id);
      setShareMessage("Caption copied — ready for TikTok, IG, Facebook, or text.");
      window.setTimeout(() => {
        setCopiedTripId(null);
        setShareMessage("");
      }, 2600);
    } catch (error) {
      console.error("Failed to copy share caption", error);
      setShareMessage("Could not copy caption. You can still share from the buttons.");
      window.setTimeout(() => setShareMessage(""), 2600);
    }
  }

  async function handleNativeShare(trip: MapJourney) {
    const caption = buildShareCaption(trip);
    const url = buildJourneyShareUrl(trip);

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: trip.title,
          text: caption,
          url,
        });
        setShareMessage("Shared from Atlas World.");
        window.setTimeout(() => setShareMessage(""), 2200);
        return;
      } catch {
        return;
      }
    }

    await handleCopyShareCaption(trip);
  }

  function handleWatchTrip(trip: MapJourney) {
    setWatchTrip(trip);
  }

  function handleOpenSocial(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function handleOpenCreator(trip: MapJourney) {
    router.push(`/user/${getCreatorUsername(trip)}`);
  }

  function handleShowOnMap(trip: MapJourney) {
    setSelectedId(trip.id);
    setHoveredPinId(trip.id);
    setHighlightedJourneyId(trip.id);

    const mapElement = document.getElementById("atlas-world-map");
    mapElement?.scrollIntoView({ behavior: "smooth", block: "center" });

    window.setTimeout(() => {
      setHighlightedJourneyId((current) => (current === trip.id ? null : current));
    }, 2400);
  }

  function handleBuildMyVersion(trip: MapJourney) {
    const prefill = getTripFormPayload(trip);

    window.localStorage.setItem(ATLAS_BUILD_PREFILL_STORAGE_KEY, JSON.stringify(prefill));
    router.push("/build");
  }

  function getTripFormPayload(trip: MapJourney) {
    return {
      destination: trip.destination,
      startDate: "",
      endDate: "",
      duration: trip.duration,
      budget: trip.budget,
      travelers: trip.traveler,

      energyLevel:
        trip.energy === "High-energy"
          ? "High-energy"
          : trip.energy === "Easygoing"
            ? "Easygoing"
            : "Balanced",

      tripStyle:
        trip.type.toLowerCase().includes("food")
          ? "Food-focused"
          : trip.traveler === "Family"
            ? "Family"
            : trip.type.toLowerCase().includes("romantic")
              ? "Romantic"
              : trip.type.toLowerCase().includes("luxury")
                ? "Luxury"
                : "Adventure",

      gemsPreference:
        trip.blend === "Hidden gems"
          ? "Hidden gems"
          : trip.blend === "Top spots"
            ? "Top spots"
            : "Mix of both",

      travelPace:
        trip.energy === "Easygoing"
          ? "Flexible"
          : trip.energy === "High-energy"
            ? "Planner"
            : "Flexible",

      interests: deriveInterestsFromTrip(trip),

      stayType:
        trip.type.toLowerCase().includes("luxury")
          ? "Hotel"
          : trip.traveler === "Family"
            ? "Airbnb"
            : "Best value mix",

      transportType:
        trip.energy === "High-energy"
          ? "Walkable"
          : trip.destination.toLowerCase().includes("alaska") ||
              trip.destination.toLowerCase().includes("iceland") ||
              trip.destination.toLowerCase().includes("costa rica")
            ? "Rental car"
            : "Mixed",

      flightOrigin: "",
      coverImage: trip.image,
      creatorName: getCreatorFallback(trip).name,
      creatorUsername: getCreatorUsername(trip),
    };
  }

  function handleViewJourney(trip: MapJourney) {
    const payload = getTripFormPayload(trip);

    window.localStorage.removeItem(ATLAS_BUILD_PREFILL_STORAGE_KEY);
    window.localStorage.setItem(ATLAS_BUILD_STORAGE_KEY, JSON.stringify(payload));

    router.push("/results");
  }

  function handlePinEnter(id: string) {
    if (isMobile) return;
    setHoveredPinId(id);
  }

  function handlePinLeave(id: string) {
    if (isMobile) return;
    setHoveredPinId((current) => (current === id ? null : current));
  }

  function handlePinClick(id: string) {
    setSelectedId((current) => (current === id ? null : id));
  }

  function closeMobileSheet() {
    setSelectedId(null);
    setHoveredPinId(null);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08111f] text-white">
      <div className="absolute inset-0 bg-gradient-to-b from-[#08111f] via-[#0b1324] to-[#101827]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(79,142,247,0.16),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(214,185,140,0.10),transparent_28%)]" />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-25">
        <div className="absolute left-[8%] top-[24%] h-28 w-56 rounded-[50%] bg-white/10 blur-[2px]" />
        <div className="absolute left-[24%] top-[44%] h-40 w-48 rounded-[45%] bg-white/10 blur-[2px]" />
        <div className="absolute left-[43%] top-[22%] h-28 w-40 rounded-[48%] bg-white/10 blur-[2px]" />
        <div className="absolute left-[52%] top-[42%] h-44 w-52 rounded-[45%] bg-white/10 blur-[2px]" />
        <div className="absolute right-[8%] top-[26%] h-32 w-52 rounded-[50%] bg-white/10 blur-[2px]" />
        <div className="absolute right-[18%] bottom-[22%] h-24 w-28 rounded-[48%] bg-white/10 blur-[2px]" />
      </div>

      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-70"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path
          d="M18,50 C25,47 31,48 39,53 C46,57 51,55 58,49 C66,43 74,42 82,44"
          stroke="rgba(255,255,255,0.72)"
          strokeWidth="0.35"
          fill="none"
          strokeDasharray="1.6 1.6"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to="12"
            dur="12s"
            repeatCount="indefinite"
          />
        </path>
        <path
          d="M39,53 C36,60 32,66 28,72"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="0.28"
          fill="none"
          strokeDasharray="1.4 1.4"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to="10"
            dur="10s"
            repeatCount="indefinite"
          />
        </path>
        <path
          d="M58,49 C61,57 64,62 68,66"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="0.28"
          fill="none"
          strokeDasharray="1.4 1.4"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to="10"
            dur="10s"
            repeatCount="indefinite"
          />
        </path>
      </svg>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/70">
              Atlas World Map
            </p>
            <h1 className="mt-2 text-4xl font-bold sm:text-5xl">
              Find trips you cannot stop thinking about.
            </h1>
            <p className="mt-3 text-base leading-7 text-white/80 sm:text-lg">
              This is Atlas World — photo-first journeys, real routes, bucket-list inspiration,
              and one-tap remixing so someone else’s trip can become your version.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              {filters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => {
                    setActiveFilter(filter);
                    setHoveredPinId(null);
                    setSelectedId(null);
                    setHighlightedJourneyId(null);
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-medium backdrop-blur ${
                    activeFilter === filter
                      ? "bg-white text-slate-900"
                      : "border border-white/15 bg-white/10 text-white/90"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href="/build"
              className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 font-semibold text-white backdrop-blur"
            >
              Build a Trip
            </Link>
            <Link
              href="/atlas"
              className="rounded-2xl bg-white px-5 py-3 font-semibold text-slate-900 shadow-lg"
            >
              My Atlas
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/55">
              Atlas World signal
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {journeys.length} trips live
            </p>
            <p className="mt-1 text-sm text-white/65">
              Published journeys plus AI ideas keep discovery moving.
            </p>
          </div>

          <div className="rounded-[24px] border border-[#d6b98c]/20 bg-[#d6b98c]/10 p-4 backdrop-blur">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#d6b98c]">
              Viral loop
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              Discover → Remix → Share
            </p>
            <p className="mt-1 text-sm text-white/65">
              Every trip can become someone else’s version.
            </p>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/55">
              Featured idea
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {trendingJourneys[0]?.destination || "Atlas"}
            </p>
            <p className="mt-1 text-sm text-white/65">
              Fresh route ideas rotate into view.
            </p>
          </div>
        </div>

        {shareMessage ? (
          <div className="mt-4 rounded-[22px] border border-[#d6b98c]/30 bg-[#d6b98c]/12 px-4 py-3 text-sm text-[#f6e6c8] backdrop-blur">
            {shareMessage}
          </div>
        ) : null}

        <div className="mt-4 rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(79,142,247,0.18),rgba(255,255,255,0.07))] p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#9fc2ff]">
                Video layer
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                Travel content becomes real trips here
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-white/72">
                TikToks, Reels, YouTube vlogs, and Atlas clips can point back to the exact journey,
                route, booking options, and Build My Version flow.
              </p>
            </div>

            <button
              type="button"
              onClick={() => trendingNow[0] ? handleWatchTrip(trendingNow[0]) : null}
              className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:translate-y-[-1px]"
            >
              Watch a Trip
            </button>
          </div>
        </div>

        <div
          id="atlas-world-map"
          className="relative mt-10 h-[460px] w-full overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.04] shadow-[0_32px_110px_rgba(0,0,0,0.46)] backdrop-blur md:h-[520px]"
        >
          {featuredJourneys.map((journey) => {
            const isActive = activeJourney?.id === journey.id;
            const isSelected = selectedId === journey.id;
            const isHighlighted = highlightedJourneyId === journey.id;

            return (
              <button
                key={journey.id}
                type="button"
                className={`absolute transition-all duration-300 ${
                  activeJourney && activeJourney.id !== journey.id
                    ? "opacity-45 scale-95"
                    : "opacity-100 scale-100"
                }`}
                style={{ left: journey.x, top: journey.y }}
                onMouseEnter={() => handlePinEnter(journey.id)}
                onMouseLeave={() => handlePinLeave(journey.id)}
                onClick={() => handlePinClick(journey.id)}
                aria-label={`Open ${journey.title}`}
              >
                <div className="group relative -translate-x-1/2 -translate-y-1/2">
                  <div
                    className={`absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full ${
                      isActive || isSelected || isHighlighted ? "bg-[#d6b98c]/80" : "bg-[#ff5a5a]/60"
                    } animate-ping`}
                  />
                  <div
                    className={`absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl transition-all duration-300 ${
                      isActive || isSelected || isHighlighted ? "bg-[#d6b98c]/40" : "bg-[#ff5a5a]/20"
                    }`}
                  />
                  <div
                    className={`relative z-10 overflow-hidden rounded-full border-2 transition-all duration-300 ease-out ${
                      isActive || isSelected || isHighlighted
                        ? "h-20 w-20 scale-110 border-[#d6b98c] shadow-[0_0_34px_rgba(214,185,140,0.58)]"
                        : "h-14 w-14 border-white/80 shadow-[0_0_24px_rgba(255,255,255,0.22)] group-hover:scale-110 group-hover:border-white"
                    }`}
                  >
                    <img
                      src={journey.image}
                      alt={journey.title}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="absolute -right-3 -top-3 z-20 rounded-full border border-white/20 bg-black/65 px-2 py-1 text-[10px] font-semibold text-white shadow-lg backdrop-blur">
                    {journey.trendingTag?.split(" ")[0] || "🔥"}
                  </div>
                  <div className="absolute -left-3 -top-3 z-20 rounded-full border border-white/20 bg-[#4f8ef7]/85 px-2 py-1 text-[10px] font-semibold text-white shadow-lg backdrop-blur">
                    ▶
                  </div>

                  {(isActive || isSelected) && (
                    <div className="absolute left-1/2 top-[calc(100%+10px)] z-20 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/15 bg-black/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur">
                      {journey.remixCount} remixes
                    </div>
                  )}
                </div>
              </button>
            );
          })}

          {!isMobile && activeJourney ? (
            <div
              className="absolute z-20 w-[390px] overflow-hidden rounded-[30px] border border-white/15 bg-[#0d1728]/96 shadow-[0_34px_110px_rgba(0,0,0,0.62)] backdrop-blur transition-all duration-300"
              style={{
                left: activeJourney.x,
                top: activeJourney.y,
                transform: "translate(-18%, -116%)",
              }}
              onMouseEnter={() => setHoveredPinId(activeJourney.id)}
              onMouseLeave={() => setHoveredPinId(null)}
            >
              <div className="relative h-52 w-full">
                <img
                  src={activeJourney.image}
                  alt={activeJourney.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/5" />

                <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur">
                    {activeJourney.source === "published" ? "🌍 Published Journey" : "⚡ AI Idea"}
                  </span>
                  {activeJourney.photos > 0 ? (
                    <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur">
                      📸 {activeJourney.photos}
                    </span>
                  ) : null}
                  {activeJourney.date ? (
                    <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur">
                      {activeJourney.date}
                    </span>
                  ) : null}
                  <span className="rounded-full bg-[#d6b98c]/25 px-3 py-1 text-[11px] font-semibold text-[#f8e6c7] backdrop-blur">
                    {activeJourney.trendingTag}
                  </span>
                  <span className="rounded-full bg-black/35 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur">
                    {getLiveTrendLabel(activeJourney)}
                  </span>
                  <span className="rounded-full bg-[#4f8ef7]/25 px-3 py-1 text-[11px] font-semibold text-[#d8e7ff] backdrop-blur">
                    ▶ {getVideoPlatformLabel(activeJourney)}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-2xl font-semibold leading-tight text-white">{activeJourney.title}</h3>
                  <p className="mt-1 text-sm text-white/80">{activeJourney.location}</p>
                  <button
                    type="button"
                    onClick={() => handleOpenCreator(activeJourney)}
                    className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-xs font-semibold text-white/82 backdrop-blur transition hover:bg-black/40 hover:text-white"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/18 text-[10px] font-bold text-white">
                      {getCreatorInitial(activeJourney)}
                    </span>
                    <span>Posted by <span className="text-[#d6b98c]">{getCreatorFallback(activeJourney).handle}</span></span>
                  </button>
                  <p className="mt-2 text-xs font-medium uppercase tracking-[0.22em] text-[#d6b98c]">
                    Bucket-list worthy
                  </p>
                </div>
              </div>

              <div className="space-y-4 p-4">
                <div className="flex flex-wrap gap-2 text-xs text-white/80">
                  <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">
                    {activeJourney.type}
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">
                    {activeJourney.duration}
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">
                    {activeJourney.budget}
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">
                    {activeJourney.traveler}
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">
                    {activeJourney.energy}
                  </span>
                </div>

                <p className="text-sm leading-6 text-white/75">{activeJourney.vibe}</p>

                <div className="rounded-2xl border border-[#d6b98c]/25 bg-[#d6b98c]/10 p-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[#d6b98c]">
                    Why people save this
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/78">
                    It looks like a trip worth copying — strong visuals, clear route energy, and a version you can make your own.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#4f8ef7]/25 bg-[#4f8ef7]/10 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-[#9fc2ff]">
                        Watch the trip
                      </p>
                      <p className="mt-2 text-sm leading-6 text-white/78">
                        {getVideoHookLine(activeJourney)}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleOpenCreator(activeJourney)}
                        className="mt-2 flex items-center gap-2 text-xs text-white/65 transition hover:text-white"
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-[10px] font-bold text-white">
                          {getCreatorInitial(activeJourney)}
                        </span>
                        <span>
                          Posted by <span className="font-semibold text-[#d6b98c]">{getCreatorFallback(activeJourney).handle}</span>
                        </span>
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleWatchTrip(activeJourney)}
                      className="shrink-0 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:opacity-90"
                    >
                      Watch ▶
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">
                      Remixes
                    </p>
                    <p className="mt-1 text-xl font-semibold text-white">
                      {activeJourney.remixCount}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">
                      Shares
                    </p>
                    <p className="mt-1 text-xl font-semibold text-white">
                      {activeJourney.shareCount}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">
                    Why this trip stands out
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/75">{activeJourney.notes}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">
                      Remix this trip
                    </p>
                    <p className="mt-1 text-sm text-white/70">
                      View it cleanly or build your own version fast.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleViewJourney(activeJourney)}
                    className="rounded-xl bg-white px-3 py-3 text-sm font-semibold text-slate-900 transition hover:opacity-90"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBuildMyVersion(activeJourney)}
                    className="rounded-xl border border-white/20 bg-white/10 px-3 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
                  >
                    Remix
                  </button>
                  <button
                    type="button"
                    onClick={() => handleWatchTrip(activeJourney)}
                    className="rounded-xl border border-[#4f8ef7]/35 bg-[#4f8ef7]/18 px-3 py-3 text-sm font-semibold text-[#d8e7ff] backdrop-blur transition hover:bg-[#4f8ef7]/25"
                  >
                    Watch
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleNativeShare(activeJourney)}
                    className="rounded-xl border border-[#d6b98c]/35 bg-[#d6b98c]/15 px-4 py-3 text-sm font-semibold text-[#f8e6c7] backdrop-blur transition hover:bg-[#d6b98c]/20"
                  >
                    Share Trip
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyShareCaption(activeJourney)}
                    className="rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
                  >
                    {copiedTripId === activeJourney.id ? "Copied" : "Copy Caption"}
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenSocial(buildTikTokSearchUrl(activeJourney))}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85 transition hover:bg-white/10"
                  >
                    TikTok
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenSocial(buildInstagramSearchUrl(activeJourney))}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85 transition hover:bg-white/10"
                  >
                    IG
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenSocial(buildFacebookShareUrl(activeJourney))}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85 transition hover:bg-white/10"
                  >
                    FB
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenSocial(buildPinterestShareUrl(activeJourney))}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85 transition hover:bg-white/10"
                  >
                    Pin
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenSocial(buildMapStayLink(activeJourney))}
                    className="rounded-xl bg-[#4f8ef7] px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                  >
                    View Stays
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenSocial(buildMapFlightLink(activeJourney))}
                    className="rounded-xl bg-[#4f8ef7] px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                  >
                    Find Flights
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenSocial(buildMapExperienceLink(activeJourney))}
                    className="rounded-xl bg-[#4f8ef7] px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                  >
                    Experiences
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="absolute left-5 top-5 max-w-md rounded-[24px] border border-white/10 bg-black/20 p-4 backdrop-blur">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/60">
              Atlas world layer
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              A map that feels like a travel feed
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/75">
              Tap into trips that feel worth saving, remixing, posting, and turning into your own
              route — not random pins, but real journey inspiration.
            </p>
          </div>

          <div className="absolute bottom-5 right-5 hidden rounded-[22px] border border-white/10 bg-black/20 p-4 backdrop-blur md:block">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/60">
              How to explore
            </p>
            <p className="mt-2 text-sm leading-6 text-white/75">
              Hover a photo pin to preview the trip, then jump into the journey or build your own
              version.
            </p>
          </div>

          <div className="absolute bottom-4 left-4 right-4 rounded-[22px] border border-white/10 bg-black/20 p-4 backdrop-blur md:hidden">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/60">
              Mobile map
            </p>
            <p className="mt-2 text-sm leading-6 text-white/75">
              Tap any photo pin to open the trip preview and jump into the journey fast.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-[30px] border border-white/10 bg-white/10 p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur sm:p-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#d6b98c]">
                Atlas picks
              </p>
              <h2 className="mt-2 text-2xl font-semibold">Fresh routes Atlas is surfacing</h2>
              <p className="mt-1 text-sm text-white/65">
                AI route ideas and published journeys, rotated on each fresh visit.
              </p>
            </div>
            <p className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
              Atlas discovery layer
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-5">
            {trendingNow.map((trip, index) => (
              <button
                key={trip.id}
                type="button"
                onClick={() => handleShowOnMap(trip)}
                className="group overflow-hidden rounded-[22px] border border-white/10 bg-black/20 text-left transition hover:-translate-y-1 hover:bg-black/30"
              >
                <div className="relative h-32">
                  <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-[22px] bg-white/12" />
                  <img
                    src={trip.image}
                    alt={trip.title}
                    className="relative h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute left-3 top-3 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur">
                    #{index + 1}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d6b98c]">
                      {getLiveTrendLabel(trip)} · ▶ {getVideoPlatformLabel(trip)}
                    </p>
                    <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-tight text-white">
                      {trip.title}
                    </h3>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 p-3 text-center">
                  <div className="rounded-2xl bg-white/10 px-2 py-2">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-white/40">
                      Remixes
                    </p>
                    <p className="text-sm font-semibold text-white">{trip.remixCount}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 px-2 py-2">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-white/40">
                      Score
                    </p>
                    <p className="text-sm font-semibold text-white">{getTrendingScore(trip)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-[30px] border border-white/10 bg-white/95 p-5 text-slate-900 shadow-[0_30px_80px_rgba(0,0,0,0.4)] sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Bucket-list journeys</h2>
              <p className="mt-1 text-sm text-slate-500">
                Route ideas and published journeys built to save, send, or remix.
              </p>
            </div>

            <Link
              href="/feed"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm"
            >
              Open Feed
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featuredJourneys.slice(0, 3).map((trip) => (
              <div
                key={trip.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-48 w-full">
                  <div className="absolute inset-0 translate-x-2 translate-y-2 scale-[0.98] rounded-2xl bg-white/25" />
                  <div className="absolute inset-0 translate-x-1 translate-y-1 scale-[0.99] rounded-2xl bg-white/20" />
                  <img
                    src={trip.image}
                    alt={trip.title}
                    className="relative h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30" />

                  <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur">
                      {trip.source === "published" ? "Published" : "AI Idea"}
                    </span>
                    {trip.photos > 0 ? (
                      <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur">
                        📸 {trip.photos}
                      </span>
                    ) : null}
                    <span className="rounded-full bg-[#4f8ef7]/25 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur">
                      ▶ {getVideoPlatformLabel(trip)}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d6b98c]">
                      Save-worthy route
                    </p>
                    <h3 className="text-lg font-semibold text-white">{trip.title}</h3>
                    <p className="text-sm text-white/80">{trip.location}</p>
                  </div>
                </div>

                <div className="space-y-3 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-slate-600">{trip.type}</p>
                    <button
                      type="button"
                      onClick={() => handleOpenCreator(trip)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm transition hover:bg-slate-900 hover:text-white"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[9px] font-bold text-slate-700">
                        {getCreatorInitial(trip)}
                      </span>
                      {getCreatorFallback(trip).handle}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      {trip.duration}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      {trip.budget}
                    </span>
                    {trip.date ? (
                      <span className="rounded-full bg-slate-100 px-3 py-1">{trip.date}</span>
                    ) : null}
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      {trip.traveler}
                    </span>
                  </div>

                  <p className="text-sm leading-6 text-slate-600">{trip.notes}</p>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-2xl bg-white px-3 py-2 text-center shadow-sm">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                        Remixes
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {trip.remixCount}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white px-3 py-2 text-center shadow-sm">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                        Shares
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {trip.shareCount}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#f4eadb] px-3 py-2 text-center shadow-sm">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                        Signal
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-900">
                        {trip.trendingTag}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleViewJourney(trip)}
                      className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                    >
                      View Journey
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBuildMyVersion(trip)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900"
                    >
                      Build My Version
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleNativeShare(trip)}
                      className="rounded-xl bg-[#f4eadb] px-4 py-2 text-sm font-semibold text-slate-900"
                    >
                      Share Trip
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyShareCaption(trip)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900"
                    >
                      {copiedTripId === trip.id ? "Copied" : "Copy Caption"}
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleShowOnMap(trip)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900"
                    >
                      Show on Map
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenSocial(buildMapStayLink(trip))}
                      className="rounded-xl bg-[#4f8ef7] px-3 py-2 text-xs font-semibold text-white"
                    >
                      View Stays
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenSocial(buildMapFlightLink(trip))}
                      className="rounded-xl bg-[#4f8ef7] px-3 py-2 text-xs font-semibold text-white"
                    >
                      Flights
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleWatchTrip(trip)}
                      className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Watch Trip ▶
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenCreator(trip)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900"
                    >
                      Open Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-[30px] border border-[#d6b98c]/20 bg-[linear-gradient(135deg,rgba(214,185,140,0.16),rgba(255,255,255,0.08))] p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#d6b98c]">
                Viral layer
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-white">
                Trips people can save, copy, post, and come back to build
              </h3>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/75">
                The map is now a discovery loop: see a photo or short trip video, open the journey,
                remix the route, copy the caption, share it outward, and bring people back into Atlas World.
              </p>
            </div>

            <Link
              href="/feed"
              className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg"
            >
              Open Social Feed
            </Link>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {trendingJourneys.map((trip, index) => (
              <button
                key={trip.id}
                type="button"
                onClick={() => setSelectedId(trip.id)}
                className="overflow-hidden rounded-[24px] border border-white/10 bg-black/20 text-left shadow-lg transition hover:-translate-y-1 hover:bg-black/28"
              >
                <div className="relative h-36">
                  <img src={trip.image} alt={trip.title} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute left-3 top-3 rounded-full bg-[#d6b98c]/25 px-3 py-1 text-[11px] font-semibold text-[#f8e6c7] backdrop-blur">
                    #{index + 1} {trip.trendingTag}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h4 className="text-base font-semibold text-white">{trip.title}</h4>
                    <p className="mt-1 text-xs text-white/75">{trip.destination}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 p-3 text-center">
                  <div className="rounded-2xl bg-white/10 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                      Remixes
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">{trip.remixCount}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                      Shares
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">{trip.shareCount}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-[28px] border border-white/10 bg-white/10 p-5 text-white/90 backdrop-blur">
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/60">
            Product direction
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">
            The remix loop starts here
          </h3>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/75">
            Atlas World should make people discover a trip, save it to a bucket list, remix the
            route, share the visual, and send others back into Atlas to build their version.
          </p>
        </div>
      </div>

      {isMobile && activeJourney ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Close preview"
            className="absolute inset-0 bg-black/45"
            onClick={closeMobileSheet}
          />
          <div className="absolute bottom-0 left-0 right-0 z-50 overflow-hidden rounded-t-[28px] border-t border-white/10 bg-[#0d1728]/98 shadow-[0_-20px_60px_rgba(0,0,0,0.45)] backdrop-blur">
            <div className="mx-auto mt-3 h-1.5 w-14 rounded-full bg-white/20" />
            <div className="relative mt-3 h-48 w-full">
              <img
                src={activeJourney.image}
                alt={activeJourney.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/75" />

              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur">
                  {activeJourney.source === "published" ? "Published Journey" : "AI Idea"}
                </span>
                {activeJourney.photos > 0 ? (
                  <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur">
                    📸 {activeJourney.photos}
                  </span>
                ) : null}
                <span className="rounded-full bg-[#4f8ef7]/25 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur">
                  ▶ {getVideoPlatformLabel(activeJourney)}
                </span>
              </div>

              <button
                type="button"
                onClick={closeMobileSheet}
                className="absolute right-4 top-4 rounded-full border border-white/15 bg-black/30 px-3 py-2 text-xs font-semibold text-white backdrop-blur"
              >
                Close
              </button>

              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-xl font-semibold text-white">{activeJourney.title}</h3>
                <p className="mt-1 text-sm text-white/80">{activeJourney.location}</p>
                <button
                  type="button"
                  onClick={() => handleOpenCreator(activeJourney)}
                  className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-xs font-semibold text-white/82 backdrop-blur"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/18 text-[10px] font-bold text-white">
                    {getCreatorInitial(activeJourney)}
                  </span>
                  <span>Posted by <span className="text-[#d6b98c]">{getCreatorFallback(activeJourney).handle}</span></span>
                </button>
              </div>
            </div>

            <div className="space-y-4 p-4 pb-6">
              <div className="flex flex-wrap gap-2 text-xs text-white/80">
                <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">
                  {activeJourney.type}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">
                  {activeJourney.duration}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">
                  {activeJourney.budget}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">
                  {activeJourney.traveler}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">
                  {activeJourney.energy}
                </span>
                {activeJourney.date ? (
                  <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">
                    {activeJourney.date}
                  </span>
                ) : null}
              </div>

              <p className="text-sm leading-6 text-white/75">{activeJourney.vibe}</p>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">
                  Why this belongs on your bucket list
                </p>
                <p className="mt-2 text-sm leading-6 text-white/75">{activeJourney.notes}</p>
              </div>

              <div className="rounded-2xl border border-[#4f8ef7]/25 bg-[#4f8ef7]/10 p-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#9fc2ff]">
                  Watch this trip
                </p>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  {getVideoHookLine(activeJourney)}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleWatchTrip(activeJourney)}
                    className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900"
                  >
                    Watch ▶
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenCreator(activeJourney)}
                    className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white"
                  >
                    Profile
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-white/45">
                    Remixes
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {activeJourney.remixCount}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-white/45">
                    Shares
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {activeJourney.shareCount}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#d6b98c]/25 bg-[#d6b98c]/10 p-3 text-center">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#d6b98c]">
                    Signal
                  </p>
                  <p className="mt-1 text-xs font-semibold text-white">
                    {activeJourney.trendingTag}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleNativeShare(activeJourney)}
                  className="rounded-xl border border-[#d6b98c]/35 bg-[#d6b98c]/15 px-4 py-3 text-sm font-semibold text-[#f8e6c7]"
                >
                  Share Trip
                </button>
                <button
                  type="button"
                  onClick={() => handleCopyShareCaption(activeJourney)}
                  className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur"
                >
                  {copiedTripId === activeJourney.id ? "Copied" : "Copy Caption"}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenSocial(buildMapStayLink(activeJourney))}
                  className="rounded-xl bg-[#4f8ef7] px-3 py-2 text-xs font-semibold text-white"
                >
                  View Stays
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenSocial(buildMapFlightLink(activeJourney))}
                  className="rounded-xl bg-[#4f8ef7] px-3 py-2 text-xs font-semibold text-white"
                >
                  Flights
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenSocial(buildMapExperienceLink(activeJourney))}
                  className="rounded-xl bg-[#4f8ef7] px-3 py-2 text-xs font-semibold text-white"
                >
                  Things To Do
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleViewJourney(activeJourney)}
                  className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900"
                >
                  View Journey
                </button>
                <button
                  type="button"
                  onClick={() => handleBuildMyVersion(activeJourney)}
                  className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur"
                >
                  Build My Version
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {watchTrip ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close watch trip"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setWatchTrip(null)}
          />
          <div className="absolute left-1/2 top-1/2 w-[calc(100%-32px)] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[34px] border border-white/15 bg-[#0d1728] shadow-[0_40px_140px_rgba(0,0,0,0.7)]">
            <div className="relative h-[360px] bg-black sm:h-[440px]">
              <img
                src={watchTrip.image}
                alt={watchTrip.title}
                className="h-full w-full object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/20" />

              <button
                type="button"
                onClick={() => setWatchTrip(null)}
                className="absolute right-4 top-4 rounded-full border border-white/15 bg-black/35 px-4 py-2 text-sm font-semibold text-white backdrop-blur"
              >
                Close
              </button>

              <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#4f8ef7]/25 px-3 py-1 text-[11px] font-semibold text-[#d8e7ff] backdrop-blur">
                  ▶ {getVideoPlatformLabel(watchTrip)}
                </span>
                <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur">
                  {watchTrip.trendingTag}
                </span>
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => handleOpenSocial(getTripVideoUrl(watchTrip))}
                  className="flex h-24 w-24 items-center justify-center rounded-full border border-white/25 bg-white/20 text-4xl text-white shadow-[0_20px_70px_rgba(0,0,0,0.45)] backdrop-blur transition hover:scale-105"
                >
                  ▶
                </button>
              </div>

              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#9fc2ff]">
                  Trip video preview
                </p>
                <h3 className="mt-2 text-3xl font-semibold leading-tight text-white">
                  {watchTrip.title}
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
                  {getVideoHookLine(watchTrip)}
                </p>
              </div>
            </div>

            <div className="grid gap-4 border-t border-white/10 bg-[#0d1728] p-5 sm:grid-cols-[1fr_0.85fr]">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">
                  Profile path
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenCreator(watchTrip)}
                  className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-2 text-sm text-white/80 transition hover:bg-white/14 hover:text-white"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-[11px] font-bold text-white">
                    {getCreatorInitial(watchTrip)}
                  </span>
                  <span>
                    Posted by <span className="font-semibold text-[#d6b98c]">{getCreatorFallback(watchTrip).handle}</span>
                  </span>
                </button>
                <p className="mt-3 text-sm leading-6 text-white/75">
                  {getCreatorFallback(watchTrip).name} can send people from TikTok, IG, YouTube, or blogs into this exact Atlas journey.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenSocial(getTripVideoUrl(watchTrip))}
                  className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900"
                >
                  Open Video
                </button>
                <button
                  type="button"
                  onClick={() => handleBuildMyVersion(watchTrip)}
                  className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white"
                >
                  Build Version
                </button>
                <button
                  type="button"
                  onClick={() => handleViewJourney(watchTrip)}
                  className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white"
                >
                  View Journey
                </button>
                <button
                  type="button"
                  onClick={() => handleCopyShareCaption(watchTrip)}
                  className="rounded-xl border border-[#d6b98c]/35 bg-[#d6b98c]/15 px-4 py-3 text-sm font-semibold text-[#f8e6c7]"
                >
                  Copy Caption
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

    </main>
  );
}