import { AtlasTripFormData, AtlasTripOutput } from "@/app/lib/atlas-trip";

export const ATLAS_SAVED_JOURNEYS_KEY = "atlas-saved-journeys";
export const ATLAS_PUBLISHED_JOURNEYS_KEY = "atlas-published-journeys";

export type AtlasStoredJourney = {
  id: string;
  destination: string;
  coverImage: string;
  createdAt: string;
  updatedAt: string;
  source: "saved" | "published";
  form: AtlasTripFormData;
  trip: AtlasTripOutput;
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

export function getSavedJourneys() {
  return safeRead<AtlasStoredJourney>(ATLAS_SAVED_JOURNEYS_KEY);
}

export function getPublishedJourneys() {
  return safeRead<AtlasStoredJourney>(ATLAS_PUBLISHED_JOURNEYS_KEY);
}

export function saveJourney(journey: AtlasStoredJourney) {
  const existing = getSavedJourneys();
  const next = [journey, ...existing.filter((item) => item.id !== journey.id)];
  safeWrite(ATLAS_SAVED_JOURNEYS_KEY, next);
  return next;
}

export function publishJourney(journey: AtlasStoredJourney) {
  const existing = getPublishedJourneys();
  const publishedVersion = {
    ...journey,
    source: "published" as const,
    updatedAt: new Date().toISOString(),
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
}) {
  const now = new Date().toISOString();
  const id = args.id ?? createJourneyId(args.destination);

  const journey: AtlasStoredJourney = {
    id,
    destination: args.destination,
    coverImage: args.coverImage,
    createdAt: now,
    updatedAt: now,
    source: "saved",
    form: args.form,
    trip: args.trip,
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