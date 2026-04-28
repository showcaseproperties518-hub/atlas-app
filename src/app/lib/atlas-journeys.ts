import { AtlasTripFormData, AtlasTripOutput } from "@/app/lib/atlas-trip";

export const ATLAS_SAVED_JOURNEYS_KEY = "atlas-saved-journeys";
export const ATLAS_PUBLISHED_JOURNEYS_KEY = "atlas-published-journeys";

export type AtlasJourneyPhoto = {
  id: string;
  url: string;
  caption?: string;
  createdAt: string;
};

export type AtlasJourneyMoment = {
  id: string;
  text: string;
  createdAt: string;
};

export type AtlasStoredJourney = {
  id: string;
  destination: string;
  coverImage: string;
  createdAt: string;
  updatedAt: string;
  source: "saved" | "published";
  form: AtlasTripFormData;
  trip: AtlasTripOutput;
  notes?: string;
  moments?: AtlasJourneyMoment[];
  photos?: AtlasJourneyPhoto[];
  startDate?: string;
  endDate?: string;
  isPastJourney?: boolean;
};

function isBrowser() {
  return typeof window !== "undefined";
}

function safeRead<T>(key: string): T[] {
  if (!isBrowser()) return [];

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeWrite<T>(key: string, value: T[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function createJourneyId(destination: string) {
  const slug = destination
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `${slug || "trip"}-${Date.now()}`;
}

export function createJourneyPhotoId() {
  return `photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createJourneyMomentId() {
  return `moment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getSavedJourneys() {
  return safeRead<AtlasStoredJourney>(ATLAS_SAVED_JOURNEYS_KEY);
}

export function getPublishedJourneys() {
  return safeRead<AtlasStoredJourney>(ATLAS_PUBLISHED_JOURNEYS_KEY);
}

export function saveJourney(journey: AtlasStoredJourney) {
  const existing = getSavedJourneys();

  const existingMatch = existing.find((item) => item.id === journey.id);

  const nextJourney: AtlasStoredJourney = {
    ...journey,
    createdAt: existingMatch?.createdAt ?? journey.createdAt,
    updatedAt: journey.updatedAt || new Date().toISOString(),
    notes: journey.notes ?? existingMatch?.notes ?? "",
    moments: journey.moments ?? existingMatch?.moments ?? [],
    photos: journey.photos ?? existingMatch?.photos ?? [],
    startDate: journey.startDate ?? existingMatch?.startDate,
    endDate: journey.endDate ?? existingMatch?.endDate,
    isPastJourney: journey.isPastJourney ?? existingMatch?.isPastJourney ?? false,
  };

  const next = [nextJourney, ...existing.filter((item) => item.id !== journey.id)];
  safeWrite(ATLAS_SAVED_JOURNEYS_KEY, next);
  return next;
}

export function publishJourney(journey: AtlasStoredJourney) {
  const existing = getPublishedJourneys();
  const existingMatch = existing.find((item) => item.id === journey.id);

  const publishedVersion: AtlasStoredJourney = {
    ...journey,
    source: "published",
    createdAt: existingMatch?.createdAt ?? journey.createdAt,
    updatedAt: new Date().toISOString(),
    notes: journey.notes ?? existingMatch?.notes ?? "",
    moments: journey.moments ?? existingMatch?.moments ?? [],
    photos: journey.photos ?? existingMatch?.photos ?? [],
    startDate: journey.startDate ?? existingMatch?.startDate,
    endDate: journey.endDate ?? existingMatch?.endDate,
    isPastJourney: journey.isPastJourney ?? existingMatch?.isPastJourney ?? false,
  };

  const next = [
    publishedVersion,
    ...existing.filter((item) => item.id !== publishedVersion.id),
  ];

  safeWrite(ATLAS_PUBLISHED_JOURNEYS_KEY, next);
  return next;
}

export function upsertSavedJourneyFromTrip(args: {
  id?: string;
  destination: string;
  coverImage: string;
  form: AtlasTripFormData;
  trip: AtlasTripOutput;
  notes?: string;
  moments?: AtlasJourneyMoment[];
  photos?: AtlasJourneyPhoto[];
  startDate?: string;
  endDate?: string;
  isPastJourney?: boolean;
}) {
  const now = new Date().toISOString();
  const id = args.id ?? createJourneyId(args.destination);

  const existing = getSavedJourneys().find((item) => item.id === id);

  const journey: AtlasStoredJourney = {
    id,
    destination: args.destination,
    coverImage: args.coverImage,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    source: "saved",
    form: args.form,
    trip: args.trip,
    notes: args.notes ?? existing?.notes ?? "",
    moments: args.moments ?? existing?.moments ?? [],
    photos: args.photos ?? existing?.photos ?? [],
    startDate: args.startDate ?? existing?.startDate,
    endDate: args.endDate ?? existing?.endDate,
    isPastJourney: args.isPastJourney ?? existing?.isPastJourney ?? false,
  };

  saveJourney(journey);
  return journey;
}

export function publishExistingJourney(journey: AtlasStoredJourney) {
  publishJourney(journey);
  return {
    ...journey,
    source: "published" as const,
    updatedAt: new Date().toISOString(),
  };
}

export function formatJourneyDate(value: string) {
  try {
    return new Date(value).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

export function formatJourneyRange(startDate?: string, endDate?: string) {
  if (!startDate && !endDate) return "";

  try {
    const start = startDate
      ? new Date(startDate).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "";

    const end = endDate
      ? new Date(endDate).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "";

    if (start && end) return `${start} - ${end}`;
    return start || end;
  } catch {
    return [startDate, endDate].filter(Boolean).join(" - ");
  }
}