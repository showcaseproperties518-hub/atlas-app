"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ATLAS_BUILD_PREFILL_STORAGE_KEY,
  ATLAS_BUILD_STORAGE_KEY,
  AtlasTripFormData,
  createAtlasTripOutput,
  defaultAtlasTripForm,
} from "@/app/lib/atlas-trip";
import {
  AtlasStoredJourney,
  formatJourneyRange,
  publishExistingJourney,
  upsertSavedJourneyFromTrip,
} from "@/app/lib/atlas-journeys";

const ATLAS_BOOKING_INTENT_STORAGE_KEY = "ATLAS_BOOKING_INTENT";
const ATLAS_BOOKING_CLICK_STORAGE_KEY = "ATLAS_BOOKING_CLICKS";

type ResultsTripFormData = AtlasTripFormData & {
  tripStyle?: string;
  energyLevel?: string;
  stayType?: string;
  transportType?: string;
  excursionType?: string;
  flightOrigin?: string;
  coverImage?: string;
  creatorName?: string;
  creatorUsername?: string;
  creatorAvatar?: string;
};

type AtlasBookingIntent = {
  destination?: string;
  startDate?: string;
  endDate?: string;
  travelers?: string;
  budget?: string;
  duration?: string;
  tripStyle?: string;
  energyLevel?: string;
  stayType?: string;
  transportType?: string;
  excursionType?: string;
  flightOrigin?: string;
  staySuggestion?: string;
  transportSuggestion?: string;
  title?: string;
  subtitle?: string;
  vibeSummary?: string;
  coverImage?: string;
  sourceJourneyId?: string;
  creatorName?: string;
  creatorUsername?: string;
  creatorAvatar?: string;
};

type BookingCategory = "flight" | "stay" | "transport" | "experience";

type BookingProvider =
  | "google_flights"
  | "booking"
  | "airbnb"
  | "rentalcars"
  | "expedia"
  | "hotels"
  | "priceline"
  | "google";

type AtlasBookingClickEvent = {
  id: string;
  timestamp: string;
  category: BookingCategory;
  provider: BookingProvider;
  destination: string;
  startDate?: string;
  endDate?: string;
  flightOrigin?: string;
  stayType?: string;
  transportType?: string;
  budget?: string;
  travelers?: string;
  tripStyle?: string;
  label: string;
  url: string;
};

type RankedProvidersResponse = {
  primaryProvider?: BookingProvider;
  backupProvider?: BookingProvider;
  primaryReason?: string;
  backupReason?: string;
  rankedProviders?: Array<{
    provider: BookingProvider;
    score: number;
    reason: string;
  }>;
};


type AtlasAITripDay = {
  day: number;
  title: string;
  summary: string;
  morning: string;
  afternoon: string;
  evening: string;
};

type AtlasAITripOutput = {
  title: string;
  subtitle: string;
  vibeSummary: string;
  flightSuggestion: string;
  transportSuggestion: string;
  days: AtlasAITripDay[];
};

function getUsernameSlug(value?: string) {
  const clean = (value || "atlascreator")
    .toLowerCase()
    .replace(/^@/, "")
    .replace(/[^a-z0-9]+/g, "")
    .trim();

  return clean || "atlascreator";
}

function getCreatorUsername(
  form: ResultsTripFormData | null,
  bookingIntent: AtlasBookingIntent | null
) {
  return getUsernameSlug(form?.creatorUsername || bookingIntent?.creatorUsername || "atlascreator");
}

function getCreatorIdentity(
  form: ResultsTripFormData | null,
  bookingIntent: AtlasBookingIntent | null
) {
  const creatorUsername = getCreatorUsername(form, bookingIntent);

  return {
    name: form?.creatorName || bookingIntent?.creatorName || "Atlas Creator",
    username: creatorUsername,
    avatar:
      form?.creatorAvatar ||
      bookingIntent?.creatorAvatar ||
      form?.coverImage ||
      bookingIntent?.coverImage ||
      getDestinationImage(form?.destination || bookingIntent?.destination || ""),
    href: `/user/${creatorUsername}`,
  };
}

function isValidAtlasAITrip(value: unknown): value is AtlasAITripOutput {
  if (!value || typeof value !== "object") return false;

  const trip = value as Partial<AtlasAITripOutput>;

  return (
    typeof trip.title === "string" &&
    typeof trip.subtitle === "string" &&
    typeof trip.vibeSummary === "string" &&
    typeof trip.flightSuggestion === "string" &&
    typeof trip.transportSuggestion === "string" &&
    Array.isArray(trip.days) &&
    trip.days.length > 0
  );
}

function getProviderLabel(provider: BookingProvider) {
  if (provider === "google_flights") return "Google Flights";
  if (provider === "booking") return "Booking.com";
  if (provider === "airbnb") return "Airbnb";
  if (provider === "rentalcars") return "Rentalcars.com";
  if (provider === "expedia") return "Expedia";
  if (provider === "hotels") return "Hotels.com";
  if (provider === "priceline") return "Priceline";
  if (provider === "google") return "Google";
  return "Priceline";
}

function getTripVideo(destination?: string) {
  const d = destination?.toLowerCase() || "";

  if (d.includes("costa rica") || d.includes("arenal") || d.includes("la fortuna")) {
    return "https://www.youtube.com/embed/LJ6XwPZ3p4M";
  }

  if (d.includes("iceland") || d.includes("ring road")) {
    return "https://www.youtube.com/embed/1w7OgIMMRc4";
  }

  if (d.includes("new york") || d.includes("nyc") || d.includes("manhattan")) {
    return "https://www.youtube.com/embed/HiZXABM7p9g";
  }

  if (d.includes("peru") || d.includes("machu") || d.includes("sacred valley")) {
    return "https://www.youtube.com/embed/lNIEZ61PyG0";
  }

  if (d.includes("alaska")) {
    return "https://www.youtube.com/embed/I-6en5zRgCY";
  }

  if (d.includes("italy")) {
    return "https://www.youtube.com/embed/FlRwssZYRM0";
  }

  return "https://www.youtube.com/embed/Scxs7L0vhZ4";
}

function getTripVideoSearchUrl(destination?: string) {
  const query = `${destination || "travel"} travel itinerary vlog`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

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
  "hudson valley":
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1800&q=80",
  "lake george":
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1800&q=80",
  "new york city":
    "https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?auto=format&fit=crop&w=1800&q=80",
  peru:
    "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1800&q=80",
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

function getVibeLabel(form: ResultsTripFormData) {
  const style =
    form.tripStyle === "Food-focused"
      ? "Food-led"
      : form.tripStyle === "Culture-first"
        ? "Culture-led"
        : form.tripStyle || "Balanced";

  return `${style} · ${form.energyLevel || "Moderate"}`;
}

function getMomentCards(form: ResultsTripFormData) {
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
      text: `Atlas is shaping the trip around ${(form.tripStyle || "balanced").toLowerCase()} energy with ${interestLine.toLowerCase()} woven through the experience.`,
    },
    {
      eyebrow: "Why this version works",
      title: "Built for your travel identity",
      text: `This plan fits ${form.travelers.toLowerCase()} travel, ${form.travelPace.toLowerCase()} pacing, and a ${form.budget.toLowerCase()} budget lane.`,
    },
  ];
}

function getPrimaryStayCard(form: ResultsTripFormData) {
  const stayType = form.stayType || "Best value mix";

  if (stayType === "Luxury") {
    return {
      title: "Luxury Hotel",
      label: "Best for premium comfort",
      description:
        "Best if you want elevated service, a polished base, and a more premium travel feel close to the core of the trip.",
      price: "$320/night",
      image:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    };
  }

  if (stayType === "Boutique") {
    return {
      title: "Boutique Hotel",
      label: "Best for character + walkability",
      description:
        "Great fit if you want a polished stay close to restaurants, evening plans, and the core of the trip.",
      price: "$210/night",
      image:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    };
  }

  if (stayType === "Airbnb") {
    return {
      title: "Airbnb Stay",
      label: "Best for space + privacy",
      description:
        "Better if you want a more local feel, extra room, or a base that feels more personal than a hotel.",
      price: "$165/night",
      image:
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
    };
  }

  if (stayType === "Hotel") {
    return {
      title: "Central Hotel",
      label: "Best for simplicity",
      description:
        "A reliable central hotel works well when you want smoother logistics, cleaner planning, and an easy base for the whole trip.",
      price: "$195/night",
      image:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    };
  }

  return {
    title: "Best Value Stay",
    label: "Best balance of comfort + cost",
    description:
      "A blended stay strategy keeps the trip feeling elevated without overspending, giving you the best overall value.",
    price: "$185/night",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
  };
}

function getSecondaryStayCard(form: ResultsTripFormData) {
  const stayType = form.stayType || "Best value mix";

  if (stayType === "Airbnb") {
    return {
      title: "Boutique Hotel",
      label: "Cleaner city-center option",
      description:
        "A boutique hotel gives you a more polished, walkable base if you want less setup and more convenience.",
      price: "$210/night",
      image:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    };
  }

  return {
    title: "Airbnb Stay",
    label: "More space + privacy",
    description:
      "A strong alternative if you want a more local feel, extra room, or a base that feels more personal than a hotel.",
      price: "$165/night",
      image:
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
  };
}

function getTransportCard(form: ResultsTripFormData) {
  const transportType = form.transportType || "Mixed";

  if (transportType === "Walkable") {
    return {
      title: "Walkable city routing",
      label: "Best for compact days",
      price: "Minimal transit",
    };
  }

  if (transportType === "Public transit") {
    return {
      title: "Public transit recommended",
      label: "Best for efficient city movement",
      price: "$18/day",
    };
  }

  if (transportType === "Uber / taxi") {
    return {
      title: "Uber / taxi recommended",
      label: "Best for flexible city movement",
      price: "$35-$80/day",
    };
  }

  if (transportType === "Rental car") {
    return {
      title: "Rental car recommended",
      label: "Best for flexibility + scenic routes",
      price: "$58/day",
    };
  }

  return {
    title: "Mixed transport recommended",
    label: "Best for flexibility",
    price: "Varies by day",
  };
}

function getLocalExcursionCards(form: ResultsTripFormData) {
  const destination = form.destination || "this area";
  const interests = form.interests.length > 0 ? form.interests : ["Food", "Nature", "Culture"];
  const excursionType = form.excursionType || "Local finds";

  const scenicInterest =
    interests.find((item) =>
      ["Nature", "Scenic drives", "Adventure", "Photo spots", "Wellness"].includes(item)
    ) || "Scenic moments";

  const foodInterest =
    interests.find((item) => ["Food", "Culture", "Family"].includes(item)) || "Local flavor";

  return [
    {
      eyebrow: "Local find",
      title: `${destination} hidden-gem stops`,
      description: `Atlas will look for smaller local places, viewpoints, neighborhoods, and low-friction stops that make ${destination} feel personal instead of generic.`,
      query: `${destination} hidden gems local spots scenic stops`,
      tag: scenicInterest,
    },
    {
      eyebrow: "Bookable moment",
      title: `${excursionType} experiences`,
      description: `This is where Atlas turns the itinerary into something you can actually do: tours, activities, short adventures, guided experiences, and local wins near the route.`,
      query: `${destination} ${excursionType} tours activities experiences`,
      tag: excursionType,
    },
    {
      eyebrow: "Food + night",
      title: `Restaurants and evening anchors`,
      description: `Atlas adds the real-life glue: food stops, sunset plans, easy evening ideas, and places worth planning around after the main daytime experience.`,
      query: `${destination} best restaurants sunset evening things to do`,
      tag: foodInterest,
    },
  ];
}

function safelyParseBookingIntent(value: string | null): AtlasBookingIntent | null {
  if (!value) return null;

  try {
    return JSON.parse(value) as AtlasBookingIntent;
  } catch {
    return null;
  }
}

function safelyParseBookingClicks(value: string | null): AtlasBookingClickEvent[] {
  if (!value) return [];

  try {
    return JSON.parse(value) as AtlasBookingClickEvent[];
  } catch {
    return [];
  }
}

function mergeFormWithBookingIntent(
  baseForm: ResultsTripFormData,
  bookingIntent: AtlasBookingIntent | null
): ResultsTripFormData {
  if (!bookingIntent) return baseForm;

  return {
    ...baseForm,
    destination: bookingIntent.destination || baseForm.destination,
    startDate: bookingIntent.startDate ?? baseForm.startDate,
    endDate: bookingIntent.endDate ?? baseForm.endDate,
    travelers: bookingIntent.travelers || baseForm.travelers,
    budget: bookingIntent.budget || baseForm.budget,
    duration: bookingIntent.duration || baseForm.duration,
    ...(bookingIntent.tripStyle
      ? ({ tripStyle: bookingIntent.tripStyle } as Partial<ResultsTripFormData>)
      : {}),
    ...(bookingIntent.energyLevel
      ? ({ energyLevel: bookingIntent.energyLevel } as Partial<ResultsTripFormData>)
      : {}),
    ...(bookingIntent.stayType
      ? ({ stayType: bookingIntent.stayType } as Partial<ResultsTripFormData>)
      : {}),
    ...(bookingIntent.transportType
      ? ({ transportType: bookingIntent.transportType } as Partial<ResultsTripFormData>)
      : {}),
    ...(bookingIntent.flightOrigin
      ? ({ flightOrigin: bookingIntent.flightOrigin } as Partial<ResultsTripFormData>)
      : {}),
    ...(bookingIntent.excursionType
      ? ({ excursionType: bookingIntent.excursionType } as Partial<ResultsTripFormData>)
      : {}),
    ...(bookingIntent.creatorName
      ? ({ creatorName: bookingIntent.creatorName } as Partial<ResultsTripFormData>)
      : {}),
    ...(bookingIntent.creatorUsername
      ? ({ creatorUsername: bookingIntent.creatorUsername } as Partial<ResultsTripFormData>)
      : {}),
    ...(bookingIntent.creatorAvatar
      ? ({ creatorAvatar: bookingIntent.creatorAvatar } as Partial<ResultsTripFormData>)
      : {}),
  } as ResultsTripFormData;
}

function appendQueryParams(url: string, params: Record<string, string | undefined>) {
  const [base, existingQuery] = url.split("?");
  const searchParams = new URLSearchParams(existingQuery || "");

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${base}?${queryString}` : base;
}

function getAffiliateParams(provider: BookingProvider) {
  return {
    utm_source: "atlas",
    utm_medium: "results_page",
    utm_campaign: "booking_layer",
    atlas_provider: provider,
  };
}

function buildFlightLink({
  origin,
  destination,
  startDate,
  endDate,
}: {
  origin?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
}) {
  const from = origin || "ALB";
  const to = destination || "";
  const depart = startDate || "";
  const returnDate = endDate || "";

  const baseUrl = `https://www.google.com/travel/flights?q=Flights%20from%20${encodeURIComponent(
    from
  )}%20to%20${encodeURIComponent(to)}%20on%20${depart}%20return%20${returnDate}`;

  return appendQueryParams(baseUrl, getAffiliateParams("google_flights"));
}

function buildStayLink({
  destination,
  startDate,
  endDate,
  provider = "booking",
}: {
  destination?: string;
  startDate?: string;
  endDate?: string;
  provider?: "booking" | "hotels" | "expedia" | "priceline";
}) {
  if (provider === "hotels") {
    return appendQueryParams(
      `https://www.hotels.com/Hotel-Search?destination=${encodeURIComponent(
        destination || ""
      )}&startDate=${startDate || ""}&endDate=${endDate || ""}`,
      getAffiliateParams("hotels")
    );
  }

  if (provider === "expedia") {
    return appendQueryParams(
      `https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(
        destination || ""
      )}&startDate=${startDate || ""}&endDate=${endDate || ""}`,
      getAffiliateParams("expedia")
    );
  }

  if (provider === "priceline") {
    return appendQueryParams(
      `https://www.priceline.com/relax/in/${encodeURIComponent(destination || "")}`,
      getAffiliateParams("priceline")
    );
  }

  return appendQueryParams(
    `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(
      destination || ""
    )}&checkin=${startDate || ""}&checkout=${endDate || ""}`,
    getAffiliateParams("booking")
  );
}

function buildAirbnbLink({
  destination,
  startDate,
  endDate,
}: {
  destination?: string;
  startDate?: string;
  endDate?: string;
}) {
  return appendQueryParams(
    `https://www.airbnb.com/s/${encodeURIComponent(
      destination || ""
    )}/homes?checkin=${startDate || ""}&checkout=${endDate || ""}`,
    getAffiliateParams("airbnb")
  );
}

function buildCarLink({
  destination,
  startDate,
  endDate,
}: {
  destination?: string;
  startDate?: string;
  endDate?: string;
}) {
  return appendQueryParams(
    `https://www.rentalcars.com/SearchResults.do?dropLocation=${encodeURIComponent(
      destination || ""
    )}&pickupDateTime=${startDate || ""}&dropoffDateTime=${endDate || ""}`,
    getAffiliateParams("rentalcars")
  );
}

function buildExperiencesLink({
  destination,
  excursionType,
  interests,
  dayPart,
  dayText,
}: {
  destination?: string;
  excursionType?: string;
  interests?: string[];
  dayPart?: "morning" | "afternoon" | "evening" | "general";
  dayText?: string;
}) {
  const normalizedDayPart = dayPart || "general";
  const activitySignal =
    excursionType && excursionType !== "None" && excursionType !== "Open"
      ? excursionType
      : "things to do";
  const interestSignal =
    interests && interests.length > 0 ? interests.slice(0, 3).join(" ") : "activities";

  const timeOfDaySignal =
    normalizedDayPart === "morning"
      ? "breakfast coffee scenic morning activities"
      : normalizedDayPart === "afternoon"
        ? "afternoon outdoor activities tours attractions"
        : normalizedDayPart === "evening"
          ? "dinner sunset evening activities restaurants"
          : "things to do excursions tours activities";

  const itinerarySignal = dayText
    ? dayText
        .replace(/[^a-zA-Z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 3)
        .slice(0, 8)
        .join(" ")
    : "";

  return appendQueryParams(
    `https://www.google.com/search?q=${encodeURIComponent(
      `${destination || "travel destination"} ${timeOfDaySignal} ${activitySignal} ${interestSignal} ${itinerarySignal}`
    )}`,
    getAffiliateParams("google")
  );
}

function getMomentImage({
  destination,
  text,
  dayPart,
}: {
  destination?: string;
  text: string;
  dayPart: "morning" | "afternoon" | "evening";
}) {
  const normalized = `${destination || ""} ${text} ${dayPart}`.toLowerCase();
  const part = dayPart || "morning";

  const imageLibrary = {
    costaRica: {
      hotSprings:
        "https://images.unsplash.com/photo-1519821172141-b5d8ccbd8b93?auto=format&fit=crop&w=1200&q=80",
      waterfall:
        "https://images.unsplash.com/photo-1503435824048-a799a3a84bf7?auto=format&fit=crop&w=1200&q=80",
      rainforest:
        "https://images.unsplash.com/photo-1518182170546-07661fd94144?auto=format&fit=crop&w=1200&q=80",
      beach:
        "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=1200&q=80",
      wildlife:
        "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1200&q=80",
      evening:
        "https://images.unsplash.com/photo-1525874684015-58379d421a52?auto=format&fit=crop&w=1200&q=80",
    },
    iceland: {
      waterfall:
        "https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&w=1200&q=80",
      glacier:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      blackSand:
        "https://images.unsplash.com/photo-1529963183134-61a90db47eaf?auto=format&fit=crop&w=1200&q=80",
      lagoon:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      drive:
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
      evening:
        "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1200&q=80",
    },
    hudson: {
      waterfall:
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
      lake:
        "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
      forest:
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80",
      town:
        "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80",
      food:
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
      evening:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    },
    nyc: {
      skyline:
        "https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?auto=format&fit=crop&w=1200&q=80",
      park:
        "https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=1200&q=80",
      museum:
        "https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=1200&q=80",
      food:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=80",
      evening:
        "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80",
    },
    peru: {
      machu:
        "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1200&q=80",
      mountain:
        "https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&w=1200&q=80",
      market:
        "https://images.unsplash.com/photo-1531968455001-5c5272a41129?auto=format&fit=crop&w=1200&q=80",
      train:
        "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1200&q=80",
      evening:
        "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1200&q=80",
    },
    general: {
      breakfast:
        "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80",
      coffee:
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
      food:
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
      hike:
        "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200&q=80",
      beach:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      city:
        "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=80",
      sunset:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      defaultMorning:
        "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
      defaultAfternoon:
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
      defaultEvening:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    },
  };

  const has = (...terms: string[]) => terms.some((term) => normalized.includes(term));

  if (has("costa rica", "arenal", "la fortuna", "rainforest", "volcano")) {
    if (has("hot spring", "thermal", "spa")) return imageLibrary.costaRica.hotSprings;
    if (has("waterfall", "la fortuna falls", "cascade")) return imageLibrary.costaRica.waterfall;
    if (has("beach", "jaco", "manuel antonio", "coast", "ocean")) return imageLibrary.costaRica.beach;
    if (has("wildlife", "sloth", "monkey", "toucan")) return imageLibrary.costaRica.wildlife;
    if (part === "evening" || has("dinner", "sunset", "night")) return imageLibrary.costaRica.evening;
    return imageLibrary.costaRica.rainforest;
  }

  if (has("iceland", "ring road", "reykjavik", "vik", "glacier", "waterfall", "black sand")) {
    if (has("black sand", "reynisfjara", "beach")) return imageLibrary.iceland.blackSand;
    if (has("glacier", "ice cave", "lagoon", "jokulsarlon")) return imageLibrary.iceland.glacier;
    if (has("waterfall", "skogafoss", "seljalandsfoss")) return imageLibrary.iceland.waterfall;
    if (has("blue lagoon", "lagoon", "hot spring")) return imageLibrary.iceland.lagoon;
    if (part === "evening" || has("northern lights", "aurora", "sunset")) return imageLibrary.iceland.evening;
    return imageLibrary.iceland.drive;
  }

  if (has("hudson", "lake george", "upstate", "adirondack", "waterfalls road trip")) {
    if (has("waterfall", "falls", "cascade")) return imageLibrary.hudson.waterfall;
    if (has("lake", "boat", "shore", "water")) return imageLibrary.hudson.lake;
    if (has("forest", "hike", "trail", "mountain")) return imageLibrary.hudson.forest;
    if (has("town", "village", "main street", "shops")) return imageLibrary.hudson.town;
    if (has("food", "restaurant", "dinner", "coffee", "breakfast")) return imageLibrary.hudson.food;
    return part === "evening" ? imageLibrary.hudson.evening : imageLibrary.hudson.waterfall;
  }

  if (has("new york", "nyc", "manhattan", "brooklyn", "central park", "times square")) {
    if (has("park", "central park", "playground")) return imageLibrary.nyc.park;
    if (has("museum", "gallery", "culture")) return imageLibrary.nyc.museum;
    if (has("pizza", "food", "restaurant", "breakfast", "dinner")) return imageLibrary.nyc.food;
    if (part === "evening" || has("night", "skyline", "rooftop", "lights")) return imageLibrary.nyc.evening;
    return imageLibrary.nyc.skyline;
  }

  if (has("peru", "machu", "sacred valley", "cusco", "inca")) {
    if (has("market", "village", "artisan", "food")) return imageLibrary.peru.market;
    if (has("train", "rail")) return imageLibrary.peru.train;
    if (has("mountain", "valley", "hike", "view")) return imageLibrary.peru.mountain;
    return imageLibrary.peru.machu;
  }

  if (has("breakfast", "brunch")) return imageLibrary.general.breakfast;
  if (has("coffee", "cafe")) return imageLibrary.general.coffee;
  if (has("food", "restaurant", "dinner", "lunch")) return imageLibrary.general.food;
  if (has("hike", "trail", "mountain", "walk")) return imageLibrary.general.hike;
  if (has("beach", "ocean", "coast")) return imageLibrary.general.beach;
  if (has("city", "downtown", "museum")) return imageLibrary.general.city;
  if (part === "evening" || has("sunset", "night")) return imageLibrary.general.sunset;

  if (part === "morning") return imageLibrary.general.defaultMorning;
  if (part === "afternoon") return imageLibrary.general.defaultAfternoon;
  return imageLibrary.general.defaultEvening;
}

function getItineraryMomentImage({
  form,
  day,
  text,
  dayPart,
}: {
  form: ResultsTripFormData;
  day: AtlasAITripDay;
  text: string;
  dayPart: "morning" | "afternoon" | "evening";
}) {
  const uploadedCover = form.coverImage;

  if (uploadedCover && day.day === 1 && dayPart === "morning") {
    return uploadedCover;
  }

  return getMomentImage({
    destination: form.destination,
    text,
    dayPart,
  });
}

function getMomentImageLabel({
  form,
  day,
  dayPart,
}: {
  form: ResultsTripFormData;
  day: AtlasAITripDay;
  dayPart: "morning" | "afternoon" | "evening";
}) {
  if (form.coverImage && day.day === 1 && dayPart === "morning") {
    return "Your uploaded photo";
  }

  if (dayPart === "morning") return "Start the day";
  if (dayPart === "afternoon") return "Main experience";
  return "Night anchor";
}

function getBestMoment(day: AtlasAITripDay) {
  const source = day.evening || day.afternoon || day.morning || day.title;
  const firstSentence = source.split(/[.!?]/)[0]?.trim();
  const moment = firstSentence || day.title;

  if (moment.length <= 118) return moment;
  return `${moment.slice(0, 115).trim()}...`;
}

function getWhyThisDayWorks(form: ResultsTripFormData, day: AtlasAITripDay) {
  const pace = form.travelPace?.toLowerCase() || "balanced";
  const style = form.tripStyle?.toLowerCase() || "balanced";
  const energy = form.energyLevel?.toLowerCase() || "moderate";
  const interests =
    form.interests.length > 0
      ? form.interests.slice(0, 2).join(" + ").toLowerCase()
      : "local discovery";

  return `This day works because Atlas keeps the ${pace} pace, ${style} style, and ${energy} energy aligned around ${interests} without overpacking the route.`;
}


function buildOutboundUrl({
  category,
  provider,
  label,
  targetUrl,
  form,
  flightOrigin,
  stayType,
  transportType,
}: {
  category: BookingCategory;
  provider: BookingProvider;
  label: string;
  targetUrl: string;
  form: ResultsTripFormData;
  flightOrigin?: string;
  stayType?: string;
  transportType?: string;
  excursionType?: string;
}) {
  const params = new URLSearchParams({
    category,
    provider,
    label,
    targetUrl,
    destination: form.destination || "",
    startDate: form.startDate || "",
    endDate: form.endDate || "",
    flightOrigin: flightOrigin || "",
    stayType: stayType || "",
    transportType: transportType || "",
    excursionType: form.excursionType || "",
    budget: form.budget || "",
    travelers: form.travelers || "",
    tripStyle: form.tripStyle || "",
  });

  return `/api/outbound?${params.toString()}`;
}

function trackBookingClick(event: AtlasBookingClickEvent) {
  if (typeof window === "undefined") return;

  const existing = safelyParseBookingClicks(
    window.localStorage.getItem(ATLAS_BOOKING_CLICK_STORAGE_KEY)
  );

  const nextEvents = [event, ...existing].slice(0, 150);
  window.localStorage.setItem(ATLAS_BOOKING_CLICK_STORAGE_KEY, JSON.stringify(nextEvents));
}

export default function ResultsPage() {
  const router = useRouter();
  const [form, setForm] = useState<ResultsTripFormData | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [savedJourney, setSavedJourney] = useState<AtlasStoredJourney | null>(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [publishMessage, setPublishMessage] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [bookingIntent, setBookingIntent] = useState<AtlasBookingIntent | null>(null);
  const [rankedProviders, setRankedProviders] = useState<RankedProvidersResponse | null>(null);
  const [aiTrip, setAiTrip] = useState<AtlasAITripOutput | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [viralPrompt, setViralPrompt] = useState<"share" | "remix" | "publish">("share");

  useEffect(() => {
    const saved = window.localStorage.getItem(ATLAS_BUILD_STORAGE_KEY);
    const storedBookingIntent = safelyParseBookingIntent(
      window.localStorage.getItem(ATLAS_BOOKING_INTENT_STORAGE_KEY)
    );

    setBookingIntent(storedBookingIntent);

    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ResultsTripFormData;
        setForm(
          mergeFormWithBookingIntent(
            {
              ...(defaultAtlasTripForm as ResultsTripFormData),
              ...parsed,
            },
            storedBookingIntent
          )
        );
      } catch {
        setForm(
          mergeFormWithBookingIntent(
            {
              ...(defaultAtlasTripForm as ResultsTripFormData),
            },
            storedBookingIntent
          )
        );
      }
    } else {
      setForm(
        mergeFormWithBookingIntent(
          {
            ...(defaultAtlasTripForm as ResultsTripFormData),
          },
          storedBookingIntent
        )
      );
    }

    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!form) return;

    async function fetchRanking() {
      try {
        const res = await fetch("/api/rank-stay", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        });

        if (!res.ok) {
          setRankedProviders(null);
          return;
        }

        const data = (await res.json()) as RankedProvidersResponse;
        setRankedProviders(data);
      } catch {
        setRankedProviders(null);
      }
    }

    fetchRanking();
  }, [form]);

  useEffect(() => {
    if (!form) return;

    let cancelled = false;

    async function fetchAITrip() {
      try {
        setIsAiLoading(true);

        const res = await fetch("/api/itinerary", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        });

        if (!res.ok) {
          if (!cancelled) setAiTrip(null);
          return;
        }

        const data = await res.json();
        const possibleTrip = data?.trip ?? data;

        if (!cancelled && isValidAtlasAITrip(possibleTrip)) {
          setAiTrip(possibleTrip);
        }
      } catch {
        if (!cancelled) setAiTrip(null);
      } finally {
        if (!cancelled) setIsAiLoading(false);
      }
    }

    fetchAITrip();

    return () => {
      cancelled = true;
    };
  }, [form]);

  const trip = useMemo(() => {
    if (!form) return null;

    if (aiTrip) {
      return aiTrip;
    }

    return createAtlasTripOutput(form as AtlasTripFormData);
  }, [form, aiTrip]);

  const heroImage = useMemo(() => {
    if (!form) return "";

    return form.coverImage || bookingIntent?.coverImage || getDestinationImage(form.destination);
  }, [form, bookingIntent]);

  const hasUploadedCoverImage = useMemo(() => {
    if (!form) return false;
    return Boolean(form.coverImage || bookingIntent?.coverImage);
  }, [form, bookingIntent]);

  const vibeLabel = useMemo(() => {
    if (!form) return "";
    return getVibeLabel(form);
  }, [form]);

  const momentCards = useMemo(() => {
    if (!form) return [];
    return getMomentCards(form);
  }, [form]);

  const tripDateRange = useMemo(() => {
    if (!form) return "";
    return formatJourneyRange(form.startDate, form.endDate);
  }, [form]);

  const shareCaption = useMemo(() => {
    if (!form || !trip) return "";

    const destination = form.destination || "my next trip";
    const dateLine = tripDateRange ? `\n${tripDateRange}` : "";
    const interestLine =
      form.interests.length > 0
        ? `\nBuilt around ${form.interests.slice(0, 3).join(", ").toLowerCase()}.`
        : "";

    const creatorLine = `\nPosted by @${getCreatorUsername(form, bookingIntent)}.`;

    return `${trip.title}${dateLine}\n${vibeLabel} · ${form.duration} · ${form.budget}${interestLine}${creatorLine}\n\nBuilt on Atlas — my personal travel agent + shared world of real journeys.\n#AtlasWorld #TravelPlan #${destination.replace(/\s+/g, "")}`;
  }, [form, trip, tripDateRange, vibeLabel, bookingIntent]);

  const primaryStayCard = useMemo(() => {
    if (!form) return null;
    return getPrimaryStayCard(form);
  }, [form]);

  const secondaryStayCard = useMemo(() => {
    if (!form) return null;
    return getSecondaryStayCard(form);
  }, [form]);

  const transportCard = useMemo(() => {
    if (!form) return null;
    return getTransportCard(form);
  }, [form]);

  const excursionCards = useMemo(() => {
    if (!form) return [];
    return getLocalExcursionCards(form);
  }, [form]);

  const flightOriginDisplay = useMemo(() => {
    if (!form) return "ALB";
    return form.flightOrigin || bookingIntent?.flightOrigin || "ALB";
  }, [form, bookingIntent]);

  const stayTypeDisplay = useMemo(() => {
    if (!form) return "Best value mix";
    return form.stayType || bookingIntent?.stayType || "Best value mix";
  }, [form, bookingIntent]);

  const transportTypeDisplay = useMemo(() => {
    if (!form) return "Mixed";
    return form.transportType || bookingIntent?.transportType || "Mixed";
  }, [form, bookingIntent]);

  const excursionTypeDisplay = useMemo(() => {
    if (!form) return "Open";
    return form.excursionType || bookingIntent?.excursionType || "Open";
  }, [form, bookingIntent]);

  const creatorIdentity = useMemo(() => {
    return getCreatorIdentity(form, bookingIntent);
  }, [form, bookingIntent]);


  const primaryStayProvider = useMemo<BookingProvider>(() => {
    return (
      rankedProviders?.primaryProvider ||
      (stayTypeDisplay === "Airbnb" ? "airbnb" : "booking")
    );
  }, [rankedProviders, stayTypeDisplay]);

  const secondaryStayProvider = useMemo<BookingProvider>(() => {
    return (
      rankedProviders?.backupProvider ||
      (secondaryStayCard?.title.toLowerCase().includes("airbnb") ? "airbnb" : "booking")
    );
  }, [rankedProviders, secondaryStayCard]);

  const primaryStayUrl = useMemo(() => {
    if (!form) return "#";

    if (primaryStayProvider === "airbnb") {
      return buildAirbnbLink({
        destination: form.destination,
        startDate: form.startDate,
        endDate: form.endDate,
      });
    }

    return buildStayLink({
      destination: form.destination,
      startDate: form.startDate,
      endDate: form.endDate,
      provider:
        primaryStayProvider === "booking" ||
        primaryStayProvider === "expedia" ||
        primaryStayProvider === "hotels" ||
        primaryStayProvider === "priceline"
          ? primaryStayProvider
          : "booking",
    });
  }, [form, primaryStayProvider]);

  const secondaryStayUrl = useMemo(() => {
    if (!form || !secondaryStayCard) return "#";

    if (secondaryStayProvider === "airbnb") {
      return buildAirbnbLink({
        destination: form.destination,
        startDate: form.startDate,
        endDate: form.endDate,
      });
    }

    return buildStayLink({
      destination: form.destination,
      startDate: form.startDate,
      endDate: form.endDate,
      provider:
        secondaryStayProvider === "booking" ||
        secondaryStayProvider === "expedia" ||
        secondaryStayProvider === "hotels" ||
        secondaryStayProvider === "priceline"
          ? secondaryStayProvider
          : "booking",
    });
  }, [form, secondaryStayCard, secondaryStayProvider]);

  const primaryStayReason = useMemo(() => {
    return (
      rankedProviders?.primaryReason ||
      "Atlas is using live ranking signals from similar trips and recent booking behavior to choose the strongest provider."
    );
  }, [rankedProviders]);

  const secondaryStayReason = useMemo(() => {
    return (
      rankedProviders?.backupReason ||
      "Atlas is keeping this as a backup based on the next strongest provider match for this trip setup."
    );
  }, [rankedProviders]);

  async function handleSave() {
    if (!form || !trip) return;

    try {
      const journey = upsertSavedJourneyFromTrip({
        id: savedJourney?.id,
        destination: form.destination.trim() || "Your trip",
        coverImage: heroImage,
        form: form as AtlasTripFormData,
          trip: trip as ReturnType<typeof createAtlasTripOutput>,
        startDate: form.startDate,
        endDate: form.endDate,
      });

      setSavedJourney(journey);

      const saveResponse = await fetch("/api/journeys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: trip.title,
          subtitle: trip.subtitle,
          destination: form.destination,
          vibe_summary: trip.vibeSummary,
          cover_image: heroImage,
          start_date: form.startDate,
          end_date: form.endDate,
          duration: form.duration,
          budget: form.budget,
          travelers: form.travelers,
          trip_style: form.tripStyle,
          energy_level: form.energyLevel,
          stay_type: form.stayType,
          transport_type: form.transportType,
          excursion_type: form.excursionType,
          flight_origin: form.flightOrigin,
          is_published: false,
          source_journey_id: bookingIntent?.sourceJourneyId ?? null,
          creator_name: creatorIdentity.name,
          creator_username: creatorIdentity.username,
          creator_avatar: creatorIdentity.avatar,
          days: trip.days.map((d) => ({
            day: d.day,
            title: d.title,
            summary: d.summary,
            morning: d.morning,
            afternoon: d.afternoon,
            evening: d.evening,
          })),
        }),
      });

      if (!saveResponse.ok) {
        throw new Error("Failed to save AI journey to database");
      }

      setSaveMessage("Saved to My Atlas");
      window.setTimeout(() => setSaveMessage(""), 2200);
    } catch (err) {
      console.error("Save failed", err);
      setSaveMessage("Error saving");
      window.setTimeout(() => setSaveMessage(""), 2200);
    }
  }

  async function handlePublish() {
    if (!form || !trip) return;

    try {
      const journey =
        savedJourney ??
        upsertSavedJourneyFromTrip({
          destination: form.destination.trim() || "Your trip",
          coverImage: heroImage,
          form: form as AtlasTripFormData,
          trip: trip as ReturnType<typeof createAtlasTripOutput>,
          startDate: form.startDate,
          endDate: form.endDate,
        });

      const published = publishExistingJourney(journey);
      setSavedJourney(published);

      const publishResponse = await fetch("/api/journeys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: trip.title,
          subtitle: trip.subtitle,
          destination: form.destination,
          vibe_summary: trip.vibeSummary,
          cover_image: heroImage,
          start_date: form.startDate,
          end_date: form.endDate,
          duration: form.duration,
          budget: form.budget,
          travelers: form.travelers,
          trip_style: form.tripStyle,
          energy_level: form.energyLevel,
          stay_type: form.stayType,
          transport_type: form.transportType,
          excursion_type: form.excursionType,
          flight_origin: form.flightOrigin,
          is_published: true,
          source_journey_id: bookingIntent?.sourceJourneyId ?? null,
          creator_name: creatorIdentity.name,
          creator_username: creatorIdentity.username,
          creator_avatar: creatorIdentity.avatar,
          days: trip.days.map((d) => ({
            day: d.day,
            title: d.title,
            summary: d.summary,
            morning: d.morning,
            afternoon: d.afternoon,
            evening: d.evening,
          })),
        }),
      });

      if (!publishResponse.ok) {
        throw new Error("Failed to publish AI journey to database");
      }

      setPublishMessage("Published to Atlas World");
      window.setTimeout(() => setPublishMessage(""), 2200);
    } catch (err) {
      console.error("Publish failed", err);
      setPublishMessage("Error publishing");
      window.setTimeout(() => setPublishMessage(""), 2200);
    }
  }

  function handleBuildMyVersion() {
    if (!form) return;

    window.localStorage.setItem(ATLAS_BUILD_PREFILL_STORAGE_KEY, JSON.stringify(form));
    router.push("/build");
  }

  async function handleCopyShareCaption() {
    if (!shareCaption) return;

    try {
      await navigator.clipboard.writeText(shareCaption);
      setShareMessage("Caption copied — ready for IG, TikTok, Facebook, or text.");
      window.setTimeout(() => setShareMessage(""), 2600);
    } catch (error) {
      console.error("Copy share caption failed", error);
      setShareMessage("Could not copy caption");
      window.setTimeout(() => setShareMessage(""), 2600);
    }
  }

  async function handleNativeShare() {
    if (!form || !trip || !shareCaption) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: trip.title,
          text: shareCaption,
        });
        setShareMessage("Share sheet opened");
        window.setTimeout(() => setShareMessage(""), 2200);
        return;
      }

      await handleCopyShareCaption();
    } catch (error) {
      console.error("Native share failed", error);
      setShareMessage("Share canceled");
      window.setTimeout(() => setShareMessage(""), 2200);
    }
  }

  function handleOpenVideoSearch() {
    if (!form) return;
    window.open(getTripVideoSearchUrl(form.destination), "_blank", "noopener,noreferrer");
  }

  function handleQuickRemix(prompt: "cheaper" | "luxury" | "family" | "adventure") {
    if (!form) return;

    const remixForm: ResultsTripFormData = {
      ...form,
      budget:
        prompt === "cheaper"
          ? "Budget"
          : prompt === "luxury"
            ? "Luxury"
            : form.budget,
      travelers: prompt === "family" ? "Family" : form.travelers,
      tripStyle:
        prompt === "luxury"
          ? "Luxury"
          : prompt === "adventure"
            ? "Adventure"
            : form.tripStyle,
      energyLevel: prompt === "adventure" ? "High-energy" : form.energyLevel,
    };

    window.localStorage.setItem(ATLAS_BUILD_PREFILL_STORAGE_KEY, JSON.stringify(remixForm));
    router.push("/build");
  }

  function handleOutboundBookingClick({
    category,
    provider,
    label,
    url,
  }: {
    category: BookingCategory;
    provider: BookingProvider;
    label: string;
    url: string;
  }) {
    if (!form) return;

    trackBookingClick({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp: new Date().toISOString(),
      category,
      provider,
      destination: form.destination || "",
      startDate: form.startDate,
      endDate: form.endDate,
      flightOrigin: flightOriginDisplay,
      stayType: stayTypeDisplay,
      transportType: transportTypeDisplay,
      budget: form.budget,
      travelers: form.travelers,
      tripStyle: form.tripStyle,
      label,
      url,
    });

    window.open(url, "_blank", "noopener,noreferrer");
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

  if (isAiLoading && !aiTrip) {
    return (
      <main className="min-h-screen bg-[#f4efe7] text-neutral-900">
        <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-6">
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.34em] text-neutral-500">Atlas AI</p>
            <h1 className="mt-3 text-2xl font-semibold">Building your real itinerary…</h1>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Atlas is turning your build answers into a custom day-by-day trip.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!form || !trip) {
    return (
      <main className="min-h-screen bg-[#f4efe7] text-neutral-900">
        <div className="mx-auto max-w-md px-4 pb-16 pt-10">
          <div className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.08)] backdrop-blur">
            <p className="text-[11px] uppercase tracking-[0.34em] text-neutral-500">Atlas</p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight">
              Your trip is not ready yet
            </h1>
            <p className="mt-4 text-sm leading-6 text-neutral-600">
              Start from Build so Atlas can shape the destination, dates, pace, vibe, and route
              around you.
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

                <Link
                  href={creatorIdentity.href}
                  className="absolute right-4 top-4 flex items-center gap-2 rounded-full border border-white/20 bg-black/15 px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-white backdrop-blur transition hover:bg-black/25"
                >
                  <span
                    className="h-5 w-5 rounded-full bg-cover bg-center ring-1 ring-white/35"
                    style={{ backgroundImage: `url('${creatorIdentity.avatar}')` }}
                  />
                  @{creatorIdentity.username}
                </Link>

                <div className="relative flex min-h-[470px] flex-col justify-end p-5 text-white lg:min-h-[620px] lg:p-8">
                  <p className="text-[11px] uppercase tracking-[0.34em] text-white/80">
                    Your Atlas Trip
                  </p>

                  <p className="mt-3 max-w-[520px] text-sm text-white/80">
                    Built around how you actually travel — not a generic itinerary.
                  </p>

                  <h1 className="mt-2 text-[2.2rem] font-semibold leading-[1.02] lg:max-w-[72%] lg:text-[3.5rem]">
                    {trip.title}
                  </h1>

                  <Link
                    href={creatorIdentity.href}
                    className="mt-3 inline-flex w-fit items-center gap-3 rounded-full border border-white/18 bg-white/14 px-3 py-2 text-sm font-medium text-white/88 backdrop-blur transition hover:bg-white/22 hover:text-white"
                  >
                    <span
                      className="h-8 w-8 rounded-full bg-cover bg-center ring-1 ring-white/40"
                      style={{ backgroundImage: `url('${creatorIdentity.avatar}')` }}
                    />
                    <span>
                      Posted by <span className="font-semibold">@{creatorIdentity.username}</span>
                    </span>
                  </Link>

                  <p className="mt-3 max-w-[92%] text-base leading-6 text-white/90 lg:max-w-[60%] lg:text-lg">
                    {trip.subtitle}
                  </p>

                  <p className="mt-2 max-w-[520px] text-sm text-white/70">
                    This trip flows day-by-day with real timing, real places, and real decisions.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/20 bg-white/14 px-3 py-2 text-[11px] text-white backdrop-blur">
                      {form.duration}
                    </span>
                    {tripDateRange ? (
                      <span className="rounded-full border border-white/20 bg-white/14 px-3 py-2 text-[11px] text-white backdrop-blur">
                        {tripDateRange}
                      </span>
                    ) : null}
                    <span className="rounded-full border border-white/20 bg-white/14 px-3 py-2 text-[11px] text-white backdrop-blur">
                      {form.budget}
                    </span>
                    <span className="rounded-full border border-white/20 bg-white/14 px-3 py-2 text-[11px] text-white backdrop-blur">
                      {form.travelers}
                    </span>
                    <span className="rounded-full border border-white/20 bg-white/14 px-3 py-2 text-[11px] text-white backdrop-blur">
                      {vibeLabel}
                    </span>
                    {hasUploadedCoverImage ? (
                      <span className="rounded-full border border-white/20 bg-white/14 px-3 py-2 text-[11px] text-white backdrop-blur">
                        Uploaded cover
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-3 sm:max-w-xl sm:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => {
                        const itinerarySection = document.getElementById("atlas-itinerary");
                        itinerarySection?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-neutral-900 shadow-[0_16px_44px_rgba(0,0,0,0.20)] transition hover:-translate-y-0.5"
                    >
                      View My Trip
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const excursionSection = document.getElementById("atlas-excursions");
                        excursionSection?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="rounded-2xl border border-white/25 bg-white/14 px-4 py-3 text-sm font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/22"
                    >
                      See What I’ll Do
                    </button>

                    <button
                      type="button"
                      onClick={handleBuildMyVersion}
                      className="rounded-2xl border border-white/25 bg-black/20 px-4 py-3 text-sm font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-black/30"
                    >
                      Build My Version
                    </button>
                  </div>

                  <p className="mt-4 max-w-[520px] text-sm text-white/75">
                    Most people never get past planning. This one is ready to go.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/70 bg-white/82 p-4 shadow-[0_18px_55px_rgba(0,0,0,0.08)] backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <Link href={creatorIdentity.href} className="group flex items-center gap-4">
                  <span
                    className="h-14 w-14 rounded-full bg-cover bg-center ring-2 ring-white shadow-[0_12px_28px_rgba(0,0,0,0.12)]"
                    style={{ backgroundImage: `url('${creatorIdentity.avatar}')` }}
                  />
                  <span>
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-500">
                      Posted by
                    </span>
                    <span className="mt-1 block text-base font-semibold text-neutral-950 group-hover:underline">
                      {creatorIdentity.name} · @{creatorIdentity.username}
                    </span>
                  </span>
                </Link>

                <Link
                  href={creatorIdentity.href}
                  className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 transition hover:-translate-y-0.5"
                >
                  View Profile
                </Link>
              </div>
            </div>

            <div className="rounded-[30px] border border-[#eadbc5] bg-[linear-gradient(135deg,#fffaf2,#f3e6d2)] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.08)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#8a6631]">
                Why this trip hits
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-[22px] bg-white/75 p-4">
                  <p className="text-sm font-semibold text-neutral-950">It has a real flow</p>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    The days connect naturally instead of feeling like random suggestions.
                  </p>
                </div>
                <div className="rounded-[22px] bg-white/75 p-4">
                  <p className="text-sm font-semibold text-neutral-950">It feels visual</p>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    The trip is built around moments people can picture, save, and share.
                  </p>
                </div>
                <div className="rounded-[22px] bg-white/75 p-4">
                  <p className="text-sm font-semibold text-neutral-950">It is remixable</p>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    Anyone can take this route and build a cheaper, luxury, family, or adventure version.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="overflow-hidden rounded-[32px] border border-white/70 bg-black shadow-[0_24px_70px_rgba(0,0,0,0.16)]">
                <div className="relative">
                  <iframe
                    className="h-[245px] w-full md:h-[360px]"
                    src={getTripVideo(form.destination)}
                    title={`${form.destination} trip video`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/20 bg-black/35 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-white backdrop-blur">
                    Watch this trip
                  </div>
                </div>

                <div className="border-t border-white/10 bg-[#111827] p-5 text-white">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.3em] text-[#f5d7a1]">
                        Video hook
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold leading-tight">
                        Feel the trip before you read the plan
                      </h2>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-white/72">
                        Atlas turns travel content into a usable itinerary: watch the vibe, scan the route,
                        then save it, publish it, or build your own version.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenVideoSearch}
                      className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-neutral-900 transition hover:-translate-y-0.5"
                    >
                      More videos
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-[32px] border border-[#eadbc5] bg-[linear-gradient(180deg,#fffaf2,#f3e6d2)] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.10)]">
                <p className="text-[11px] uppercase tracking-[0.34em] text-[#8a6631]">
                  Viral loop
                </p>
                <h2 className="mt-2 text-2xl font-semibold leading-tight text-neutral-900">
                  Share it, remix it, publish it
                </h2>
                <p className="mt-3 text-sm leading-6 text-neutral-700">
                  This is the Atlas growth loop: a trip becomes content, content becomes a journey,
                  and every journey can become someone else’s version.
                </p>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[
                    { key: "share", label: "Share" },
                    { key: "remix", label: "Remix" },
                    { key: "publish", label: "Publish" },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setViralPrompt(item.key as "share" | "remix" | "publish")}
                      className={`rounded-2xl px-3 py-3 text-xs font-bold transition ${
                        viralPrompt === item.key
                          ? "bg-neutral-900 text-white shadow-[0_14px_34px_rgba(0,0,0,0.18)]"
                          : "bg-white/80 text-neutral-700 ring-1 ring-[#eadbc5]"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="mt-4 rounded-[24px] border border-[#eadbc5] bg-white/82 p-4">
                  {viralPrompt === "share" ? (
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.26em] text-neutral-500">
                        Step 01
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-neutral-900">
                        Post the journey outward
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-neutral-600">
                        Copy the caption or open the share sheet. This is built for IG, TikTok,
                        Facebook, group chats, and travel planning threads.
                      </p>
                    </div>
                  ) : viralPrompt === "remix" ? (
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.26em] text-neutral-500">
                        Step 02
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-neutral-900">
                        Let people build their version
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-neutral-600">
                        The trip is not static. Anyone can make it cheaper, more luxury,
                        family-friendly, or more adventurous.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.26em] text-neutral-500">
                        Step 03
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-neutral-900">
                        Publish it to Atlas World
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-neutral-600">
                        Once published, this journey can appear in the feed, map, profile, and future
                        social sharing flows.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3">
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="rounded-2xl bg-neutral-900 px-5 py-4 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(0,0,0,0.16)] transition hover:-translate-y-0.5"
                  >
                    Share This Trip
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleQuickRemix("cheaper")}
                      className="rounded-2xl border border-[#eadbc5] bg-white px-4 py-3 text-xs font-bold text-neutral-900 transition hover:-translate-y-0.5"
                    >
                      Make cheaper
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickRemix("luxury")}
                      className="rounded-2xl border border-[#eadbc5] bg-white px-4 py-3 text-xs font-bold text-neutral-900 transition hover:-translate-y-0.5"
                    >
                      Make luxury
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickRemix("family")}
                      className="rounded-2xl border border-[#eadbc5] bg-white px-4 py-3 text-xs font-bold text-neutral-900 transition hover:-translate-y-0.5"
                    >
                      Family version
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickRemix("adventure")}
                      className="rounded-2xl border border-[#eadbc5] bg-white px-4 py-3 text-xs font-bold text-neutral-900 transition hover:-translate-y-0.5"
                    >
                      More adventure
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handlePublish}
                    className="rounded-2xl border border-neutral-300/90 bg-white/90 px-5 py-4 text-sm font-semibold text-neutral-900 transition hover:-translate-y-0.5"
                  >
                    Publish to Atlas World
                  </button>
                </div>

                {shareMessage || publishMessage ? (
                  <div className="mt-4 rounded-2xl border border-[#eadbc5] bg-white/85 px-4 py-3 text-sm text-neutral-700">
                    {publishMessage || shareMessage}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
              <div className="space-y-5">
                <div className="rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,243,236,0.93))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.12)] backdrop-blur lg:p-6">
                  <p className="text-[11px] uppercase tracking-[0.34em] text-neutral-500">
                    Atlas readback
                  </p>

                  <div className="mt-4 overflow-hidden rounded-[30px] border border-neutral-200/70 bg-white shadow-[0_24px_70px_rgba(0,0,0,0.13)]">
                    <div
                      className="relative min-h-[360px] bg-cover bg-center md:min-h-[430px]"
                      style={{ backgroundImage: `url('${heroImage}')` }}
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.05)_0%,rgba(10,10,10,0.26)_38%,rgba(10,10,10,0.82)_100%)]" />
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.28),transparent_36%)]" />

                      <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-white/15 px-3 py-2 text-[10px] uppercase tracking-[0.28em] text-white backdrop-blur">
                        {hasUploadedCoverImage ? "Your real cover" : "Atlas cover"}
                      </div>

                      <Link
                        href={creatorIdentity.href}
                        className="absolute right-4 top-4 flex items-center gap-2 rounded-full border border-white/20 bg-black/15 px-3 py-2 text-[10px] uppercase tracking-[0.20em] text-white backdrop-blur transition hover:bg-black/25"
                      >
                        <span
                          className="h-5 w-5 rounded-full bg-cover bg-center ring-1 ring-white/35"
                          style={{ backgroundImage: `url('${creatorIdentity.avatar}')` }}
                        />
                        @{creatorIdentity.username}
                      </Link>

                      <div className="absolute bottom-0 left-0 right-0 p-5 text-white md:p-6">
                        <Link
                          href={creatorIdentity.href}
                          className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/14 px-3 py-1.5 text-[11px] font-semibold text-white/85 backdrop-blur transition hover:bg-white/22 hover:text-white"
                        >
                          <span
                            className="h-5 w-5 rounded-full bg-cover bg-center ring-1 ring-white/35"
                            style={{ backgroundImage: `url('${creatorIdentity.avatar}')` }}
                          />
                          Posted by @{creatorIdentity.username}
                        </Link>
                        <p className="text-[10px] uppercase tracking-[0.32em] text-white/75">
                          Your Atlas trip
                        </p>
                        <h3 className="mt-2 text-2xl font-semibold leading-tight md:text-3xl">
                          {trip.title}
                        </h3>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-white/86 md:text-base">
                          {trip.subtitle}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                          <span className="rounded-full border border-white/20 bg-white/18 px-3 py-1.5 backdrop-blur">
                            {form.duration}
                          </span>
                          {tripDateRange ? (
                            <span className="rounded-full border border-white/20 bg-white/18 px-3 py-1.5 backdrop-blur">
                              {tripDateRange}
                            </span>
                          ) : null}
                          <span className="rounded-full border border-white/20 bg-white/18 px-3 py-1.5 backdrop-blur">
                            {form.travelers}
                          </span>
                          <span className="rounded-full border border-white/20 bg-white/18 px-3 py-1.5 backdrop-blur">
                            {vibeLabel}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-neutral-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(249,244,237,0.96))] p-4 md:p-5">
                      <div className="rounded-[22px] bg-[#f7f2eb] p-4 text-sm leading-6 text-neutral-700">
                        <span className="font-semibold text-neutral-900">Why this one works:</span>{" "}
                        Atlas shaped this for <span className="font-semibold text-neutral-900">{form.travelers}</span> who want a{" "}
                        <span className="font-semibold text-neutral-900">{form.tripStyle?.toLowerCase()}</span> experience with{" "}
                        <span className="font-semibold text-neutral-900">{form.energyLevel?.toLowerCase()}</span> energy. It balances the big anchors with local texture, realistic pacing, food moments, and excursions you can actually search, compare, and book.
                        {hasUploadedCoverImage ? (
                          <> Your uploaded cover now makes this feel personal across results, save, publish, feed, map, and the journey page.</>
                        ) : (
                          <> Atlas is using a destination cover until the traveler adds their own photo.</>
                        )}
                      </div>

                      {hasUploadedCoverImage ? (
                        <div className="mt-4 overflow-hidden rounded-[24px] border border-[#eadbc5] bg-white shadow-[0_14px_38px_rgba(0,0,0,0.06)]">
                          <div
                            className="h-44 bg-cover bg-center"
                            style={{ backgroundImage: `url('${heroImage}')` }}
                          />
                          <div className="p-4">
                            <p className="text-[11px] uppercase tracking-[0.30em] text-[#8a6631]">
                              Personal photo layer
                            </p>
                            <h3 className="mt-2 text-lg font-semibold leading-tight text-neutral-900">
                              Your uploaded photo now anchors the trip
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-neutral-600">
                              Atlas uses your real cover as the first itinerary moment, then blends it
                              with destination visuals for the rest of the journey. This is the first step
                              toward photo-first published trips.
                            </p>
                          </div>
                        </div>
                      ) : null}

                      <div className="mt-4 rounded-[22px] border border-neutral-200/80 bg-white/92 p-4 shadow-[0_10px_28px_rgba(0,0,0,0.04)]">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.30em] text-neutral-500">
                              Auto caption
                            </p>
                            <h3 className="mt-2 text-lg font-semibold leading-tight text-neutral-900">
                              Ready for Instagram, TikTok, Facebook, stories, or group chat
                            </h3>
                          </div>
                          <span className="rounded-full bg-neutral-900 px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-white">
                            Viral loop
                          </span>
                        </div>

                        <div className="mt-3 rounded-[18px] bg-[#fbf7f1] p-4 text-sm leading-6 text-neutral-700">
                          <p className="whitespace-pre-line">{shareCaption}</p>
                        </div>

                        {shareMessage ? (
                          <div className="mt-3 rounded-2xl border border-neutral-200 bg-[#f7f2eb] px-4 py-3 text-sm text-neutral-700">
                            {shareMessage}
                          </div>
                        ) : null}

                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <button
                            type="button"
                            onClick={handleNativeShare}
                            className="rounded-2xl bg-neutral-900 px-5 py-4 text-sm font-medium text-white shadow-[0_18px_45px_rgba(0,0,0,0.16)] transition hover:translate-y-[-1px]"
                          >
                            Share This Trip
                          </button>

                          <button
                            type="button"
                            onClick={handleCopyShareCaption}
                            className="rounded-2xl border border-neutral-300/90 bg-white px-5 py-4 text-sm font-medium text-neutral-900 transition hover:translate-y-[-1px]"
                          >
                            Copy Viral Caption
                          </button>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {["Instagram", "TikTok", "Facebook", "Pinterest", "Text"].map((platform) => (
                            <span
                              key={platform}
                              className="rounded-full border border-neutral-200 bg-white px-3 py-2 text-[11px] font-medium text-neutral-600"
                            >
                              {platform}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <h2 className="mt-5 text-2xl font-semibold leading-tight lg:text-3xl">
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
                        Dates
                      </p>
                      <p className="mt-2 text-lg font-semibold text-neutral-900">
                        {tripDateRange || "Flexible"}
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
                  </div>

                  <div className="mt-5 rounded-[28px] border border-[#e8d8bf] bg-[linear-gradient(135deg,#fffaf2,#f3e6d2)] p-5 shadow-[0_18px_44px_rgba(0,0,0,0.06)]">
                    <p className="text-[11px] uppercase tracking-[0.34em] text-[#8a6631]">
                      Trip confidence
                    </p>
                    <h3 className="mt-2 text-xl font-semibold leading-tight text-neutral-900">
                      This is ready to use, not just admire.
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-neutral-700">
                      The route, stay style, transportation, daily rhythm, and local experiences are all connected. You can use this as the plan, remix it, save it, or jump straight into flights, stays, cars, and excursions.
                    </p>

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl bg-white/75 p-3">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-neutral-500">Itinerary</p>
                        <p className="mt-1 text-sm font-semibold text-neutral-900">{trip.days.length} day flow</p>
                      </div>
                      <div className="rounded-2xl bg-white/75 p-3">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-neutral-500">Excursions</p>
                        <p className="mt-1 text-sm font-semibold text-neutral-900">{excursionTypeDisplay}</p>
                      </div>
                      <div className="rounded-2xl bg-white/75 p-3">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-neutral-500">Booking</p>
                        <p className="mt-1 text-sm font-semibold text-neutral-900">Flights · stay · car</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  id="atlas-itinerary"
                  className="rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(244,237,228,0.93))] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.08)] lg:p-6"
                >
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.34em] text-neutral-500">
                      Trip flow
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold leading-tight lg:text-3xl">
                      A high-end itinerary, not a dump of suggestions
                    </h2>
                  </div>

                  <div className="mt-8 space-y-10">
                    {trip.days.map((day, index) => (
                      <article key={day.day} className="relative">
                        <div className="absolute bottom-0 left-[7px] top-2 hidden w-[2px] bg-gradient-to-b from-neutral-900 via-neutral-200 to-transparent md:block" />

                        <div className="flex gap-5">
                          <div className="relative z-10 hidden flex-col items-center md:flex">
                            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 shadow-[0_0_0_6px_rgba(24,24,27,0.08)]" />
                            <div className="mt-3 rounded-full bg-[#f1e7d8] px-2 py-1 text-[10px] font-semibold text-neutral-700">
                              {String(day.day).padStart(2, "0")}
                            </div>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="mb-4 rounded-[26px] border border-neutral-200/80 bg-white/90 p-4 shadow-[0_14px_38px_rgba(0,0,0,0.05)]">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                                    Day {day.day}
                                  </p>
                                  <h3 className="mt-1 text-xl font-semibold leading-tight text-neutral-900">
                                    {day.title}
                                  </h3>
                                  <p className="mt-3 text-sm leading-6 text-neutral-600">
                                    {day.summary}
                                  </p>
                                </div>

                                <div className="hidden rounded-2xl bg-[#f7f2eb] px-4 py-3 text-right md:block">
                                  <p className="text-[10px] uppercase tracking-[0.24em] text-neutral-500">
                                    Best moment
                                  </p>
                                  <p className="mt-1 max-w-[180px] text-xs font-semibold leading-5 text-neutral-900">
                                    {getBestMoment(day)}
                                  </p>
                                </div>
                              </div>

                              <p className="mt-3 rounded-[18px] bg-[#fbf6ee] px-4 py-3 text-xs leading-5 text-neutral-600">
                                {getWhyThisDayWorks(form, day)}
                              </p>
                            </div>

                            <div className="grid gap-4">
                              <div className="group relative overflow-hidden rounded-[28px] border border-white/70 bg-neutral-900 shadow-[0_18px_46px_rgba(0,0,0,0.12)]">
                                <img
                                  src={getItineraryMomentImage({
                                    form,
                                    day,
                                    text: day.morning,
                                    dayPart: "morning",
                                  })}
                                  alt={`${form.destination} morning travel moment`}
                                  className="h-72 w-full object-cover transition duration-700 group-hover:scale-105 md:h-80"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/18 to-transparent" />
                                <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-white/14 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-white backdrop-blur">
                                  Morning
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-4 text-white md:p-5">
                                  <p className="text-[11px] uppercase tracking-[0.28em] text-[#f5d7a1]">
                                    {getMomentImageLabel({
                                      form,
                                      day,
                                      dayPart: "morning",
                                    })}
                                  </p>
                                  <p className="mt-2 text-sm leading-6 text-white/88 md:text-base">
                                    {day.morning}
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleOutboundBookingClick({
                                        category: "experience",
                                        provider: "google",
                                        label: "Morning Activities",
                                        url: buildExperiencesLink({
                                          destination: form.destination,
                                          excursionType: excursionTypeDisplay,
                                          interests: form.interests,
                                          dayPart: "morning",
                                          dayText: day.morning,
                                        }),
                                      })
                                    }
                                    className="mt-4 rounded-full border border-white/20 bg-white/16 px-4 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/24"
                                  >
                                    View Morning Activities
                                  </button>
                                </div>
                              </div>

                              <div className="group relative overflow-hidden rounded-[28px] border border-white/70 bg-neutral-900 shadow-[0_18px_46px_rgba(0,0,0,0.12)]">
                                <img
                                  src={getItineraryMomentImage({
                                    form,
                                    day,
                                    text: day.afternoon,
                                    dayPart: "afternoon",
                                  })}
                                  alt={`${form.destination} afternoon travel moment`}
                                  className="h-72 w-full object-cover transition duration-700 group-hover:scale-105 md:h-80"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/18 to-transparent" />
                                <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-white/14 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-white backdrop-blur">
                                  Afternoon
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-4 text-white md:p-5">
                                  <p className="text-[11px] uppercase tracking-[0.28em] text-[#f5d7a1]">
                                    {getMomentImageLabel({
                                      form,
                                      day,
                                      dayPart: "afternoon",
                                    })}
                                  </p>
                                  <p className="mt-2 text-sm leading-6 text-white/88 md:text-base">
                                    {day.afternoon}
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleOutboundBookingClick({
                                        category: "experience",
                                        provider: "google",
                                        label: "Afternoon Activities",
                                        url: buildExperiencesLink({
                                          destination: form.destination,
                                          excursionType: excursionTypeDisplay,
                                          interests: form.interests,
                                          dayPart: "afternoon",
                                          dayText: day.afternoon,
                                        }),
                                      })
                                    }
                                    className="mt-4 rounded-full border border-white/20 bg-white/16 px-4 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/24"
                                  >
                                    View Afternoon Activities
                                  </button>
                                </div>
                              </div>

                              <div className="group relative overflow-hidden rounded-[28px] border border-white/70 bg-neutral-900 shadow-[0_18px_46px_rgba(0,0,0,0.12)]">
                                <img
                                  src={getItineraryMomentImage({
                                    form,
                                    day,
                                    text: day.evening,
                                    dayPart: "evening",
                                  })}
                                  alt={`${form.destination} evening travel moment`}
                                  className="h-72 w-full object-cover transition duration-700 group-hover:scale-105 md:h-80"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/18 to-transparent" />
                                <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-white/14 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-white backdrop-blur">
                                  Evening
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-4 text-white md:p-5">
                                  <p className="text-[11px] uppercase tracking-[0.28em] text-[#f5d7a1]">
                                    {getMomentImageLabel({
                                      form,
                                      day,
                                      dayPart: "evening",
                                    })}
                                  </p>
                                  <p className="mt-2 text-sm leading-6 text-white/88 md:text-base">
                                    {day.evening}
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleOutboundBookingClick({
                                        category: "experience",
                                        provider: "google",
                                        label: "Evening Activities",
                                        url: buildExperiencesLink({
                                          destination: form.destination,
                                          excursionType: excursionTypeDisplay,
                                          interests: form.interests,
                                          dayPart: "evening",
                                          dayText: day.evening,
                                        }),
                                      })
                                    }
                                    className="mt-4 rounded-full border border-white/20 bg-white/16 px-4 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/24"
                                  >
                                    View Evening Activities
                                  </button>
                                </div>
                              </div>

                              {index === 0 ? (
                                <div className="rounded-[24px] border border-dashed border-neutral-300 bg-[rgba(250,246,240,0.95)] px-4 py-4">
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
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>                  </div>
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

                <div
                  id="atlas-excursions"
                  className="overflow-hidden rounded-[30px] border border-white/70 bg-[linear-gradient(135deg,rgba(31,41,51,0.98),rgba(62,51,39,0.96))] text-white shadow-[0_24px_70px_rgba(0,0,0,0.18)]"
                >
                  <div className="border-b border-white/10 p-5 lg:p-6">
                    <p className="text-[11px] uppercase tracking-[0.34em] text-[#f5d7a1]">
                      Local excursions
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold leading-tight">
                      The part that makes someone say, “I want to do this.”
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-white/72">
                      Atlas adds searchable local experiences around the actual trip flow — not random tourist filler. Use these as the bookable moments that make the itinerary feel real.
                    </p>
                  </div>

                  <div className="grid gap-3 p-5 lg:p-6">
                    {excursionCards.map((card) => (
                      <div
                        key={card.title}
                        className="rounded-[24px] border border-white/10 bg-white/[0.08] p-4 shadow-[0_12px_34px_rgba(0,0,0,0.16)] backdrop-blur"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.28em] text-[#f5d7a1]">
                              {card.eyebrow}
                            </p>
                            <h3 className="mt-2 text-lg font-semibold leading-tight text-white">
                              {card.title}
                            </h3>
                          </div>
                          <span className="rounded-full bg-[#d6b98c] px-3 py-1.5 text-[11px] font-bold text-[#1f2933]">
                            {card.tag}
                          </span>
                        </div>

                        <p className="mt-3 text-sm leading-6 text-white/72">
                          {card.description}
                        </p>

                        <div className="mt-4 flex items-center justify-between gap-3">
                          <p className="text-xs text-white/50">Search live local options</p>
                          <button
                            type="button"
                            onClick={() =>
                              handleOutboundBookingClick({
                                category: "experience",
                                provider: "google",
                                label: card.title,
                                url: buildExperiencesLink({
                                  destination: form.destination,
                                  excursionType: excursionTypeDisplay,
                                  interests: form.interests,
                                  dayPart: "general",
                                  dayText: card.query,
                                }),
                              })
                            }
                            className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-neutral-900 transition hover:-translate-y-0.5"
                          >
                            Find options
                          </button>
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
                      Plan → Book → Go
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-neutral-600">
                      Atlas is now turning your plan into real, bookable decisions based on how you
                      travel.
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-[18px] border border-neutral-200/70 bg-white/85 p-3">
                        <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-500">
                          Flight origin
                        </p>
                        <p className="mt-2 text-sm font-semibold text-neutral-900">
                          {flightOriginDisplay}
                        </p>
                      </div>

                      <div className="rounded-[18px] border border-neutral-200/70 bg-white/85 p-3">
                        <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-500">
                          Stay style
                        </p>
                        <p className="mt-2 text-sm font-semibold text-neutral-900">
                          {stayTypeDisplay}
                        </p>
                      </div>

                      <div className="rounded-[18px] border border-neutral-200/70 bg-white/85 p-3">
                        <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-500">
                          Transport
                        </p>
                        <p className="mt-2 text-sm font-semibold text-neutral-900">
                          {transportTypeDisplay}
                        </p>
                      </div>

                      <div className="rounded-[18px] border border-neutral-200/70 bg-white/85 p-3">
                        <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-500">
                          Experiences
                        </p>
                        <p className="mt-2 text-sm font-semibold text-neutral-900">
                          {excursionTypeDisplay}
                        </p>
                      </div>
                    </div>

                    {bookingIntent?.sourceJourneyId ? (
                      <div className="mt-4 rounded-[20px] border border-[#e6d3b3] bg-[#fbf6ee] px-4 py-3 text-sm leading-6 text-neutral-700">
                        This booking view was launched from a saved journey, so Atlas is carrying
                        over the trip’s booking preferences and travel setup.
                      </div>
                    ) : null}
                  </div>

                  <div className="grid gap-4 p-5 lg:p-6">
                    <div className="rounded-[24px] border border-neutral-200/70 bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                            Flights
                          </p>
                          <p className="mt-1 text-[11px] uppercase tracking-[0.24em] text-neutral-400">
                            Google Flights
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 space-y-2">
                        <p className="text-sm font-medium text-neutral-900">
                          {flightOriginDisplay} → {form.destination}
                        </p>

                        <p className="text-xs text-neutral-500">
                          Best-fit routing based on your selected airport
                        </p>

                        <p className="text-sm leading-6 text-neutral-600">{trip.flightSuggestion}</p>

                        <div className="rounded-[18px] bg-[#f8f3ec] px-3 py-3 text-sm leading-6 text-neutral-700">
                          Atlas is prioritizing departure options from{" "}
                          <span className="font-medium text-neutral-900">{flightOriginDisplay}</span>{" "}
                          to keep this trip aligned with your actual starting point.
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-lg font-semibold text-neutral-900">$612</span>

                          <button
                            type="button"
                            onClick={() =>
                              handleOutboundBookingClick({
                                category: "flight",
                                provider: "google_flights",
                                label: "Book Flight",
                                url: buildFlightLink({
                                  origin: flightOriginDisplay,
                                  destination: form.destination,
                                  startDate: form.startDate,
                                  endDate: form.endDate,
                                }),
                              })
                            }
                            className="rounded-lg bg-neutral-900 px-3 py-2 text-xs text-white transition hover:translate-y-[-1px]"
                          >
                            Book Flight
                          </button>
                        </div>
                      </div>
                    </div>

                    {primaryStayCard ? (
                      <div className="space-y-3">
                        <div className="overflow-hidden rounded-[24px] border border-neutral-200/70 bg-white">
                          <div
                            className="h-32 bg-cover bg-center"
                            style={{
                              backgroundImage: `url('${primaryStayCard.image}')`,
                            }}
                          />
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-medium text-neutral-900">
                                  {primaryStayCard.title}
                                </p>
                                <p className="mt-1 text-xs text-neutral-500">
                                  {primaryStayCard.label}
                                </p>
                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                  <p className="text-[11px] uppercase tracking-[0.24em] text-neutral-400">
                                    {getProviderLabel(primaryStayProvider)}
                                  </p>
                                  <span className="rounded-full bg-[#f3e7d6] px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-700">
                                    Best match
                                  </span>
                                </div>
                              </div>
                            </div>

                            <p className="mt-2 text-sm leading-6 text-neutral-600">
                              {primaryStayCard.description}
                            </p>

                            <div className="mt-3 rounded-[18px] bg-[#f8f3ec] px-3 py-3 text-sm leading-6 text-neutral-700">
                              Atlas picked this as the lead stay because your trip is leaning{" "}
                              <span className="font-medium text-neutral-900">{stayTypeDisplay}</span>{" "}
                              and this option fits the current pace, layout, and travel style best.
                            </div>

                            <div className="mt-3 rounded-[18px] border border-[#eadbc5] bg-[#fcf8f2] px-3 py-3 text-sm leading-6 text-neutral-700">
                              {primaryStayReason}
                            </div>

                            <div className="mt-3 flex items-center justify-between">
                              <span className="font-semibold text-neutral-900">
                                {primaryStayCard.price}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleOutboundBookingClick({
                                    category: "stay",
                                    provider: primaryStayProvider,
                                    label: "View Primary Stay",
                                    url: primaryStayUrl,
                                  })
                                }
                                className="rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 transition hover:translate-y-[-1px]"
                              >
                                View Stay
                              </button>
                            </div>
                          </div>
                        </div>

                        {secondaryStayCard ? (
                          <div className="overflow-hidden rounded-[24px] border border-neutral-200/70 bg-white">
                            <div
                              className="h-32 bg-cover bg-center"
                              style={{
                                backgroundImage: `url('${secondaryStayCard.image}')`,
                              }}
                            />
                            <div className="p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-medium text-neutral-900">
                                    {secondaryStayCard.title}
                                  </p>
                                  <p className="mt-1 text-xs text-neutral-500">
                                    {secondaryStayCard.label}
                                  </p>
                                  <div className="mt-1 flex flex-wrap items-center gap-2">
                                    <p className="text-[11px] uppercase tracking-[0.24em] text-neutral-400">
                                      {getProviderLabel(secondaryStayProvider)}
                                    </p>
                                    <span className="rounded-full border border-neutral-200 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-600">
                                      Backup option
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <p className="mt-2 text-sm leading-6 text-neutral-600">
                                {secondaryStayCard.description}
                              </p>

                              <div className="mt-3 rounded-[18px] border border-[#eadbc5] bg-[#fcf8f2] px-3 py-3 text-sm leading-6 text-neutral-700">
                                {secondaryStayReason}
                              </div>

                              <div className="mt-3 flex items-center justify-between">
                                <span className="font-semibold text-neutral-900">
                                  {secondaryStayCard.price}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleOutboundBookingClick({
                                      category: "stay",
                                      provider: secondaryStayProvider,
                                      label: "View Secondary Stay",
                                      url: secondaryStayUrl,
                                    })
                                  }
                                  className="rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 transition hover:translate-y-[-1px]"
                                >
                                  View Stay
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    {transportCard ? (
                      <div className="rounded-[24px] border border-neutral-200/70 bg-white p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                              Transportation
                            </p>
                            <p className="mt-1 text-[11px] uppercase tracking-[0.24em] text-neutral-400">
                              Rentalcars.com
                            </p>
                          </div>
                        </div>

                        <p className="mt-2 text-sm font-medium text-neutral-900">
                          {transportCard.title}
                        </p>

                        <p className="mt-1 text-xs text-neutral-500">
                          {transportCard.label}
                        </p>

                        <p className="mt-2 text-sm leading-6 text-neutral-600">
                          {trip.transportSuggestion}
                        </p>

                        <div className="mt-3 rounded-[18px] bg-[#f8f3ec] px-3 py-3 text-sm leading-6 text-neutral-700">
                          This transport setup is tuned for a{" "}
                          <span className="font-medium text-neutral-900">
                            {transportTypeDisplay}
                          </span>{" "}
                          trip style so getting around feels consistent with how you actually want to
                          move.
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <span className="font-semibold text-neutral-900">
                            {transportCard.price}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleOutboundBookingClick({
                                category: "transport",
                                provider: "rentalcars",
                                label:
                                  transportTypeDisplay === "Rental car"
                                    ? "View Cars"
                                    : "View Transport Options",
                                url: buildCarLink({
                                  destination: form.destination,
                                  startDate: form.startDate,
                                  endDate: form.endDate,
                                }),
                              })
                            }
                            className="rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 transition hover:translate-y-[-1px]"
                          >
                            {transportTypeDisplay === "Rental car" ? "View Cars" : "View Options"}
                          </button>
                        </div>
                      </div>
                    ) : null}

                    <div className="rounded-[24px] border border-neutral-200/70 bg-white p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                            Things to Do
                          </p>
                          <p className="mt-1 text-[11px] uppercase tracking-[0.24em] text-neutral-400">
                            Google activity search
                          </p>
                        </div>
                      </div>

                      <p className="mt-2 text-sm font-medium text-neutral-900">
                        Activities, tours, and local excursions near {form.destination}
                      </p>

                      <p className="mt-2 text-sm leading-6 text-neutral-600">
                        Atlas is matching your interests, pace, daily itinerary, and excursion setting to real-world activity searches — local finds, guided tours, family wins, scenic stops, food moments, and bookable experiences.
                      </p>

                      <div className="mt-3 rounded-[18px] bg-[#f8f3ec] px-3 py-3 text-sm leading-6 text-neutral-700">
                        Current activity style: <span className="font-medium text-neutral-900">{excursionTypeDisplay}</span>.
                        Use this to find things to do, tours, local activities, and nearby experiences
                        that fit the trip before booking.
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="font-semibold text-neutral-900">Explore activities</span>
                        <button
                          type="button"
                          onClick={() =>
                            handleOutboundBookingClick({
                              category: "experience",
                              provider: "google",
                              label: "View Activities",
                              url: buildExperiencesLink({
                                destination: form.destination,
                                excursionType: excursionTypeDisplay,
                                interests: form.interests,
                                dayPart: "general",
                              }),
                            })
                          }
                          className="rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 transition hover:translate-y-[-1px]"
                        >
                          View Activities
                        </button>
                      </div>
                    </div>

                    <div className="rounded-[24px] bg-[#f7f2eb] p-4 text-sm text-neutral-700">
                      This is the first version of Atlas booking. Next: full real-time pricing +
                      one-click booking.
                    </div>
                  </div>
                </div>

                <div className="rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(246,240,232,0.94))] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.08)] lg:p-6">
                  <p className="text-[11px] uppercase tracking-[0.34em] text-neutral-500">
                    Atlas actions
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold leading-tight">
                    Save it, publish it, remix it, or keep refining it
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-neutral-600">
                    This trip can stay private in My Atlas, become a published journey in Atlas
                    World, and now be used as the starting point for your next version.
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
                      Publish to Atlas World
                    </button>

                    <button
                      type="button"
                      onClick={handleBuildMyVersion}
                      className="rounded-2xl border border-neutral-300/90 bg-[#f7f2eb] px-5 py-4 text-sm font-medium text-neutral-900 transition hover:translate-y-[-1px]"
                    >
                      Build My Version
                    </button>

                    <Link
                      href="/build"
                      className="inline-flex items-center justify-center rounded-2xl border border-neutral-300/90 bg-white/92 px-5 py-4 text-sm font-medium text-neutral-900 transition hover:translate-y-[-1px]"
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
      </section>
    </main>
  );
}
