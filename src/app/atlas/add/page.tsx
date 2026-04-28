"use client";

import Link from "next/link";
import { ChangeEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AtlasTripFormData,
  createAtlasTripOutput,
  defaultAtlasTripForm,
} from "@/app/lib/atlas-trip";
import {
  AtlasJourneyPhoto,
  createJourneyPhotoId,
  publishExistingJourney,
  upsertSavedJourneyFromTrip,
} from "@/app/lib/atlas-journeys";

const fallbackCoverImage =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80";

const MAX_PAST_JOURNEY_PHOTOS = 20;

const ATLAS_PROFILE_STORAGE_KEY = "atlas_profile";

type AtlasProfile = {
  name: string;
  username: string;
  bio: string;
  avatar: string;
};

const defaultAtlasProfile: AtlasProfile = {
  name: "Atlas Creator",
  username: "atlascreator",
  bio: "Building journeys, capturing moments, and mapping the world through Atlas.",
  avatar:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
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
      name: parsed.name || defaultAtlasProfile.name,
      username: sanitizeUsername(parsed.username || defaultAtlasProfile.username),
      bio: parsed.bio || defaultAtlasProfile.bio,
      avatar: parsed.avatar || defaultAtlasProfile.avatar,
    };
  } catch {
    return defaultAtlasProfile;
  }
}



const travelerOptions = [
  "Solo",
  "Couple",
  "Family",
  "Friends",
  "Parents + kids",
  "Group",
] as const;

const tripStyleOptions = [
  "Relaxed",
  "Adventure",
  "Luxury",
  "Romantic",
  "Family",
  "Food-focused",
  "Culture-first",
  "Spontaneous",
] as const;

function getDurationFromDates(startDate: string, endDate: string) {
  if (!startDate || !endDate) return defaultAtlasTripForm.duration;

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return defaultAtlasTripForm.duration;
  }

  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

  if (diffDays <= 2) return "Weekend";
  if (diffDays === 3) return "3 days";
  if (diffDays === 4) return "4 days";
  if (diffDays === 5) return "5 days";
  if (diffDays <= 7) return "7 days";
  if (diffDays <= 10) return "10 days";
  return "2 weeks";
}

function buildPastJourneyForm(args: {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: string;
  tripStyle: AtlasTripFormData["tripStyle"];
}): AtlasTripFormData {
  return {
    ...defaultAtlasTripForm,
    destination: args.destination,
    duration: getDurationFromDates(args.startDate, args.endDate),
    travelers: args.travelers,
    tripStyle: args.tripStyle,
    energyLevel: "Balanced",
    gemsPreference: "Mix of both",
    travelPace: "Flexible",
    interests: ["Food", "Nature", "Culture"],
  };
}

function compressImageToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    const image = new Image();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Could not read file"));
        return;
      }

      image.src = reader.result;
    };

    reader.onerror = () => reject(new Error("Could not read file"));

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const maxDimension = 900;
      const scale = Math.min(
        1,
        maxDimension / Math.max(image.width, image.height)
      );

      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));

      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Could not compress image"));
        return;
      }

      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      resolve(canvas.toDataURL("image/jpeg", 0.58));
    };

    image.onerror = () => reject(new Error("Could not load image"));
    reader.readAsDataURL(file);
  });
}

function getApproxStorageSizeMb(value: unknown) {
  try {
    return new Blob([JSON.stringify(value)]).size / 1024 / 1024;
  } catch {
    return 0;
  }
}

export default function AddPastJourneyPage() {
  const router = useRouter();

  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [travelers, setTravelers] = useState<(typeof travelerOptions)[number]>("Couple");
  const [tripStyle, setTripStyle] =
    useState<(typeof tripStyleOptions)[number]>("Adventure");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<AtlasJourneyPhoto[]>([]);
  const [postToAtlasWorld, setPostToAtlasWorld] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const canSave = useMemo(() => {
    return (
      destination.trim().length > 0 &&
      photos.length > 0 &&
      photos.length <= MAX_PAST_JOURNEY_PHOTOS &&
      !isUploading &&
      !isSaving
    );
  }, [destination, photos.length, isSaving, isUploading]);

  const dateSummary = useMemo(() => {
    if (startDate && endDate) return "Exact dates added";
    if (startDate || endDate) return "Partial dates added";
    return "Optional";
  }, [startDate, endDate]);

  async function handlePhotoUpload(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setIsUploading(true);
    setMessage("");

    try {
      const remainingSlots = Math.max(0, MAX_PAST_JOURNEY_PHOTOS - photos.length);

      if (remainingSlots === 0) {
        setMessage(`You can add up to ${MAX_PAST_JOURNEY_PHOTOS} photos per past journey.`);
        return;
      }

      const filesToUpload = files.slice(0, remainingSlots);

      const nextPhotos = await Promise.all(
        filesToUpload.map(async (file) => {
          const url = await compressImageToDataUrl(file);

          return {
            id: createJourneyPhotoId(),
            url,
            caption: "",
            createdAt: new Date().toISOString(),
          } satisfies AtlasJourneyPhoto;
        })
      );

      setPhotos((prev) => [...prev, ...nextPhotos]);

      if (files.length > remainingSlots) {
        setMessage(
          `Added ${filesToUpload.length} photos. Atlas supports up to ${MAX_PAST_JOURNEY_PHOTOS} photos per past journey for now.`
        );
      } else {
        setMessage(`${filesToUpload.length} photo${filesToUpload.length === 1 ? "" : "s"} added and compressed.`);
        window.setTimeout(() => setMessage(""), 2200);
      }
    } catch (error) {
      console.error("Photo upload failed", error);
      setMessage("Could not upload one or more photos. Try fewer photos or smaller images.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  }

  function updatePhotoCaption(photoId: string, caption: string) {
    setPhotos((prev) =>
      prev.map((photo) => (photo.id === photoId ? { ...photo, caption } : photo))
    );
  }

  function removePhoto(photoId: string) {
    setPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
  }

  async function handleSavePastJourney() {
    if (!canSave) {
      if (!destination.trim()) {
        setMessage("Add the destination first.");
        return;
      }

      if (photos.length === 0) {
        setMessage("Add at least one photo before saving.");
        return;
      }

      if (photos.length > MAX_PAST_JOURNEY_PHOTOS) {
        setMessage(`Remove ${photos.length - MAX_PAST_JOURNEY_PHOTOS} photo${photos.length - MAX_PAST_JOURNEY_PHOTOS === 1 ? "" : "s"} first. Atlas supports up to ${MAX_PAST_JOURNEY_PHOTOS} photos per past journey right now.`);
        return;
      }

      return;
    }

    setIsSaving(true);
    setMessage("Saving your trip...");

    try {
      const form = buildPastJourneyForm({
        destination: destination.trim(),
        startDate,
        endDate,
        travelers,
        tripStyle,
      });

      const generatedTrip = createAtlasTripOutput(form);

      const trip = {
        ...generatedTrip,
        title: `${destination.trim()}, remembered`,
        subtitle: `A past Atlas journey built from your photos, memories, and real trip story.`,
        vibeSummary:
          notes.trim().length > 0
            ? notes.trim()
            : "This past journey was added from real memories and photos so it can live on your Atlas map, stay visual, and be publishable later.",
      };

      const creatorProfile = getStoredAtlasProfile();

      const payloadPreview = {
        destination: destination.trim(),
        coverImage: photos[0]?.url || fallbackCoverImage,
        form,
        trip,
        notes: notes.trim(),
        photos,
        startDate,
        endDate,
        isPastJourney: true,
        isPublished: postToAtlasWorld,
        creatorName: creatorProfile.name,
        creatorUsername: creatorProfile.username,
        creatorAvatar: creatorProfile.avatar,
      };

      const approxSizeMb = getApproxStorageSizeMb(payloadPreview);

      if (approxSizeMb > 4.5) {
        setMessage(
          "This trip is still too large for browser storage. Remove a few photos or use smaller images. Cloud photo storage is the next upgrade."
        );
        setIsSaving(false);
        return;
      }

      const journey = upsertSavedJourneyFromTrip(payloadPreview);

      if (postToAtlasWorld) {
        publishExistingJourney(journey);

        try {
          const publishResponse = await fetch("/api/journeys", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: trip.title,
              subtitle: trip.subtitle,
              destination: destination.trim(),
              vibe_summary: trip.vibeSummary,
              cover_image: photos[0]?.url || fallbackCoverImage,
              start_date: startDate,
              end_date: endDate,
              duration: form.duration,
              budget: form.budget,
              travelers: form.travelers,
              trip_style: form.tripStyle,
              energy_level: form.energyLevel,
              stay_type: form.stayType,
              transport_type: form.transportType,
              flight_origin: form.flightOrigin,
              is_published: true,
              source_journey_id: journey.id,
              creator_name: creatorProfile.name,
              creator_username: creatorProfile.username,
              creator_avatar: creatorProfile.avatar,
              days: trip.days.map((day) => ({
                day: day.day,
                title: day.title,
                summary: day.summary,
                morning: day.morning,
                afternoon: day.afternoon,
                evening: day.evening,
              })),
            }),
          });

          if (!publishResponse.ok) {
            console.error("Public publish failed", await publishResponse.text());
            setMessage(
              "Saved locally, but public posting had an issue. Check Supabase/Vercel logs."
            );
          }
        } catch (error) {
          console.error("Public publish failed", error);
          setMessage(
            "Saved locally, but public posting had an issue. Check Supabase/Vercel logs."
          );
        }
      }

      setMessage(postToAtlasWorld ? "Saved and posted to Atlas World. Opening your trip page..." : "Saved privately. Opening your trip page...");
      router.push(`/atlas/${journey.id}`);
    } catch (error) {
      console.error("Save past journey failed", error);
      setMessage(
        "Could not save this trip. Try removing a few photos or uploading smaller images."
      );
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f4efe7] text-neutral-900">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),rgba(244,239,231,0.86),rgba(232,223,211,0.96))]" />
        <div className="absolute left-[-80px] top-10 h-60 w-60 rounded-full bg-white/35 blur-3xl" />
        <div className="absolute right-[-60px] top-0 h-72 w-72 rounded-full bg-[#e6dacb] blur-3xl" />
        <div className="absolute left-[10%] top-[35%] h-40 w-40 rounded-full bg-[#efe5d8] blur-3xl" />

        <div className="relative mx-auto w-full max-w-md px-4 pb-32 pt-4 md:max-w-2xl md:px-6 lg:max-w-5xl lg:px-8 xl:max-w-6xl">
          <div className="overflow-hidden rounded-[38px] border border-white/60 bg-white/30 shadow-[0_28px_90px_rgba(0,0,0,0.11)] backdrop-blur">
            <div
              className="relative min-h-[430px] bg-cover bg-center"
              style={{
                backgroundImage: `url('${photos[0]?.url || fallbackCoverImage}')`,
              }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.08)_0%,rgba(10,10,10,0.26)_34%,rgba(10,10,10,0.80)_100%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.30),transparent_30%)]" />

              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                <Link
                  href="/atlas"
                  className="rounded-full border border-white/20 bg-white/14 px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-white backdrop-blur"
                >
                  Back to My Atlas
                </Link>
                <div className="rounded-full border border-white/20 bg-black/15 px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-white backdrop-blur">
                  Add Past Journey
                </div>
              </div>

              <div className="relative flex min-h-[430px] flex-col justify-end p-5 text-white md:p-7 lg:min-h-[500px] lg:p-8">
                <p className="text-[11px] uppercase tracking-[0.34em] text-white/80">
                  Atlas Memories
                </p>
                <h1 className="mt-3 max-w-3xl text-[2.15rem] font-semibold leading-[1.02] md:text-[2.6rem] lg:text-[3.25rem]">
                  Turn your past trips into shareable Atlas journeys
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85 md:text-base">
                  Start with the destination and photos. Atlas turns your memories into a visual trip page people can view, save, and build from.
                </p>
              </div>
            </div>
          </div>

          <div className="-mt-12 relative z-10 rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,243,236,0.93))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.12)] backdrop-blur md:p-6 lg:max-w-3xl">
            <p className="text-[11px] uppercase tracking-[0.34em] text-neutral-500">
              Atlas direction
            </p>
            <h2 className="mt-2 text-2xl font-semibold leading-tight md:text-3xl">
              Seed your Atlas with real trips people can actually explore
            </h2>
            <p className="mt-3 text-sm leading-6 text-neutral-700 md:text-base">
              Start with where you went. Add up to 20 photos that define the trip. Save it into Atlas, then use the trip page as the link you post, send, and build from.
            </p>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
            <div className="space-y-5">
              <div className="rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(245,239,231,0.93))] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.08)] md:p-6">
                <label className="text-[11px] uppercase tracking-[0.30em] text-neutral-500">
                  Where did you go?
                </label>
                <input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Iceland, Costa Rica, Quebec City, Alaska..."
                  className="mt-3 w-full rounded-2xl border border-white/70 bg-white/90 px-4 py-4 text-base text-neutral-900 outline-none transition focus:border-neutral-400"
                />

                <div className="mt-4 rounded-[22px] border border-neutral-200/70 bg-[#faf5ef] p-4">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                    Fast flow
                  </p>
                  <p className="mt-2 text-sm leading-6 text-neutral-700">
                    Destination first. Photos next. You do not need perfection — you need real trips loaded into Atlas.
                  </p>
                </div>
              </div>

              <div className="rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,240,232,0.94))] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.08)] lg:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.34em] text-neutral-500">
                      Photos
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold leading-tight lg:text-3xl">
                      Upload the photos that make people stop
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-neutral-700">
                      The first photo becomes the cover. Atlas compresses uploads so you can save up to 20 photos in this version.
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-[26px] border border-dashed border-neutral-300 bg-white/80 p-5">
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-[22px] bg-[#faf5ef] px-5 py-10 text-center transition hover:bg-[#f5eee5]">
                    <span className="text-[11px] uppercase tracking-[0.30em] text-neutral-500">
                      Photo-first flow
                    </span>
                    <span className="mt-3 text-xl font-semibold text-neutral-900">
                      Tap to drop in the trip
                    </span>
                    <span className="mt-2 max-w-md text-sm leading-6 text-neutral-600">
                      Add up to 20 photos from your camera roll. This is the fastest way to turn a memory into something people can explore.
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="mt-4 rounded-[20px] border border-neutral-200 bg-white/90 px-4 py-3 text-sm text-neutral-700">
                  {photos.length}/{MAX_PAST_JOURNEY_PHOTOS} photos added. Uploads are compressed before saving so this works tonight without cloud storage.
                </div>

                {photos.length > MAX_PAST_JOURNEY_PHOTOS ? (
                  <div className="mt-4 rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    Remove {photos.length - MAX_PAST_JOURNEY_PHOTOS} photo{photos.length - MAX_PAST_JOURNEY_PHOTOS === 1 ? "" : "s"} before saving.
                  </div>
                ) : null}

                {isUploading ? (
                  <div className="mt-4 rounded-[20px] border border-neutral-200 bg-white/90 px-4 py-3 text-sm text-neutral-700">
                    Compressing and uploading photos...
                  </div>
                ) : null}

                {photos.length > 0 ? (
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {photos.map((photo, index) => (
                      <div
                        key={photo.id}
                        className="overflow-hidden rounded-[24px] border border-neutral-200/70 bg-white/92 shadow-[0_10px_28px_rgba(0,0,0,0.04)]"
                      >
                        <div className="relative h-52">
                          <img
                            src={photo.url}
                            alt={`Trip upload ${index + 1}`}
                            className="h-full w-full object-cover"
                          />

                          {index === 0 ? (
                            <div className="absolute left-3 top-3 rounded-full bg-black/55 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-white">
                              Cover photo
                            </div>
                          ) : null}

                          <button
                            type="button"
                            onClick={() => removePhoto(photo.id)}
                            className="absolute right-3 top-3 rounded-full bg-white/92 px-3 py-2 text-xs font-medium text-neutral-700 shadow"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="p-4">
                          <label className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                            Caption
                          </label>
                          <input
                            value={photo.caption ?? ""}
                            onChange={(e) => updatePhotoCaption(photo.id, e.target.value)}
                            placeholder="Sunrise at the black sand beach..."
                            className="mt-3 w-full rounded-2xl border border-neutral-200/80 bg-[#fcfaf7] px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-400"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 rounded-[24px] border border-dashed border-neutral-300 bg-[#faf5ef] px-4 py-5">
                    <p className="text-sm leading-6 text-neutral-600">
                      No photos yet. Add 1–20 strong photos and this starts feeling like a real trip immediately.
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(245,239,231,0.93))] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.08)] md:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.34em] text-neutral-500">
                      Optional details
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold leading-tight lg:text-3xl">
                      Add the basics if you want
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-neutral-700">
                      These help Atlas shape the saved journey, but they are intentionally lighter
                      than the normal build flow.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.30em] text-neutral-500">
                      Start date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="mt-3 w-full rounded-2xl border border-white/70 bg-white/90 px-4 py-4 text-base text-neutral-900 outline-none transition focus:border-neutral-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-[0.30em] text-neutral-500">
                      End date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="mt-3 w-full rounded-2xl border border-white/70 bg-white/90 px-4 py-4 text-base text-neutral-900 outline-none transition focus:border-neutral-400"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="text-[11px] uppercase tracking-[0.30em] text-neutral-500">
                    Who were you with?
                  </label>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {travelerOptions.map((option) => {
                      const active = travelers === option;

                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setTravelers(option)}
                          className={`rounded-full px-4 py-2.5 text-sm transition ${
                            active
                              ? "bg-neutral-900 text-white shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
                              : "border border-neutral-200/90 bg-white/85 text-neutral-700"
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6">
                  <label className="text-[11px] uppercase tracking-[0.30em] text-neutral-500">
                    What kind of trip was it?
                  </label>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tripStyleOptions.map((option) => {
                      const active = tripStyle === option;

                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setTripStyle(option)}
                          className={`rounded-full px-4 py-2.5 text-sm transition ${
                            active
                              ? "bg-neutral-900 text-white shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
                              : "border border-neutral-200/90 bg-white/85 text-neutral-700"
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(246,239,231,0.94))] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.08)] lg:p-6">
                <p className="text-[11px] uppercase tracking-[0.34em] text-neutral-500">
                  Story
                </p>
                <h2 className="mt-2 text-2xl font-semibold leading-tight lg:text-3xl">
                  What should someone know before they copy it?
                </h2>
                <p className="mt-3 text-sm leading-6 text-neutral-700">
                  Keep it simple. One honest paragraph is enough to make the trip feel personal, useful, and shareable.
                </p>

                <div className="mt-5">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Best moments, favorite stops, what you would tell someone else to do there, or why this trip was worth it..."
                    className="min-h-[180px] w-full rounded-[24px] border border-neutral-200/80 bg-white/90 px-4 py-4 text-sm leading-6 text-neutral-900 outline-none transition focus:border-neutral-400"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-5 lg:sticky lg:top-6">
              <div className="rounded-[30px] border border-neutral-900/10 bg-neutral-950 p-5 text-white shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
                <p className="text-[11px] uppercase tracking-[0.34em] text-white/55">
                  Viral loop
                </p>
                <h3 className="mt-2 text-2xl font-semibold leading-tight">
                  Add trip → view trip page → share link → someone builds their version
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/72">
                  This is the real Atlas growth loop. Every trip you add becomes content, proof, and a starting point for someone else.
                </p>

                <div className="mt-5 grid gap-3">
                  <div className="rounded-[22px] border border-white/10 bg-white/8 p-4">
                    <p className="text-[10px] uppercase tracking-[0.26em] text-white/45">Step 1</p>
                    <p className="mt-2 text-sm font-semibold">Save this past trip</p>
                  </div>
                  <div className="rounded-[22px] border border-white/10 bg-white/8 p-4">
                    <p className="text-[10px] uppercase tracking-[0.26em] text-white/45">Step 2</p>
                    <p className="mt-2 text-sm font-semibold">Open the trip page and copy the link</p>
                  </div>
                  <div className="rounded-[22px] border border-white/10 bg-white/8 p-4">
                    <p className="text-[10px] uppercase tracking-[0.26em] text-white/45">Step 3</p>
                    <p className="mt-2 text-sm font-semibold">Post one trip, not the homepage</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[30px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(240,233,224,0.94))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
                <p className="text-[11px] uppercase tracking-[0.34em] text-neutral-500">
                  Atlas preview
                </p>
                <h3 className="mt-2 text-xl font-semibold leading-tight md:text-2xl">
                  This becomes a shareable trip page after you save
                </h3>

                <p className="mt-3 text-sm leading-6 text-neutral-700">
                  {destination.trim() ? (
                    <>
                      Atlas will save <span className="font-medium">{destination.trim()}</span> as a{" "}
                      <span className="font-medium">{tripStyle.toLowerCase()}</span> past journey
                      for <span className="font-medium"> {travelers.toLowerCase()}</span> travel
                      with <span className="font-medium"> {photos.length}</span>{" "}
                      {photos.length === 1 ? "photo" : "photos"}.
                    </>
                  ) : (
                    <>Add the destination and a few photos. Then save, open the trip page, and share that direct link.</>
                  )}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-neutral-200/80 bg-white/85 p-4">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">
                      Photos
                    </p>
                    <p className="mt-2 text-sm font-medium text-neutral-900">{photos.length}</p>
                  </div>

                  <div className="rounded-2xl border border-neutral-200/80 bg-white/85 p-4">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">
                      Type
                    </p>
                    <p className="mt-2 text-sm font-medium text-neutral-900">{tripStyle}</p>
                  </div>

                  <div className="rounded-2xl border border-neutral-200/80 bg-white/85 p-4">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">
                      Travelers
                    </p>
                    <p className="mt-2 text-sm font-medium text-neutral-900">{travelers}</p>
                  </div>

                  <div className="rounded-2xl border border-neutral-200/80 bg-white/85 p-4">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">
                      Dates
                    </p>
                    <p className="mt-2 text-sm font-medium text-neutral-900">{dateSummary}</p>
                  </div>
                </div>

                <div className="mt-5 rounded-[22px] border border-[#d6b98c]/45 bg-[#fff8ed] p-4">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                    Seeding goal
                  </p>
                  <p className="mt-2 text-sm leading-6 text-neutral-700">
                    Goal before launch: 15–20 real trips. This page is built to help you load them fast.
                  </p>
                </div>

                <div className="mt-5 rounded-[22px] border border-[#d6b98c]/45 bg-[#fff8ed] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                        Publish setting
                      </p>
                      <h4 className="mt-1 text-base font-semibold text-neutral-950">
                        Post to Atlas World
                      </h4>
                      <p className="mt-2 text-sm leading-6 text-neutral-700">
                        When this is on, the trip is saved to My Atlas and also posted publicly so it can appear on the map and feed.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPostToAtlasWorld((current) => !current)}
                      className={`relative mt-1 h-8 w-14 rounded-full transition ${
                        postToAtlasWorld ? "bg-neutral-950" : "bg-neutral-300"
                      }`}
                      aria-pressed={postToAtlasWorld}
                    >
                      <span
                        className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${
                          postToAtlasWorld ? "left-7" : "left-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="mt-4 rounded-2xl bg-white/75 px-4 py-3 text-sm font-medium text-neutral-700">
                    {postToAtlasWorld
                      ? "Public: this journey can show on Atlas World after saving."
                      : "Private: this journey stays in My Atlas only."}
                  </div>
                </div>

                {message ? (
                  <div className="mt-4 rounded-2xl border border-neutral-200 bg-white/90 px-4 py-3 text-sm text-neutral-700">
                    {message}
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={handleSavePastJourney}
                  disabled={!canSave}
                  className={`mt-5 w-full rounded-2xl px-5 py-4 text-sm font-medium transition ${
                    canSave
                      ? "bg-neutral-900 text-white shadow-[0_18px_45px_rgba(0,0,0,0.18)] hover:translate-y-[-1px]"
                      : "cursor-not-allowed bg-neutral-200 text-neutral-500"
                  }`}
                >
                  {isSaving ? "Saving Journey..." : postToAtlasWorld ? "Save, Post & View Trip" : "Save Privately & View Trip"}
                </button>

                <Link
                  href="/atlas"
                  className="mt-3 inline-flex w-full items-center justify-center rounded-2xl border border-neutral-300 bg-white px-5 py-4 text-sm font-medium text-neutral-900"
                >
                  Cancel
                </Link>
              </div>

              <div className="rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(243,235,226,0.93))] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.08)] lg:p-6">
                <p className="text-[11px] uppercase tracking-[0.34em] text-neutral-500">
                  Why this grows
                </p>
                <h2 className="mt-2 text-2xl font-semibold">Every trip becomes a growth asset</h2>

                <div className="mt-5 space-y-3">
                  <div className="rounded-[24px] border border-neutral-200/60 bg-white/90 p-4">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                      Personal archive
                    </p>
                    <p className="mt-2 text-sm leading-6 text-neutral-700">
                      Your old trips become real pages that can be opened, shared, and copied.
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-neutral-200/60 bg-white/90 p-4">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                      Visual map
                    </p>
                    <p className="mt-2 text-sm leading-6 text-neutral-700">
                      Photos make Atlas feel believable. Real trips create trust faster than AI ideas alone.
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-neutral-200/60 bg-white/90 p-4">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                      Social layer
                    </p>
                    <p className="mt-2 text-sm leading-6 text-neutral-700">
                      The strongest launch move is posting direct trip links so people land on something specific and want to build their version.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/50 bg-[#f4efe7]/92 px-4 py-3 shadow-[0_-18px_45px_rgba(0,0,0,0.12)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto max-w-md">
          <button
            type="button"
            onClick={handleSavePastJourney}
            disabled={!canSave}
            className={`w-full rounded-2xl px-5 py-4 text-sm font-semibold transition ${
              canSave
                ? "bg-neutral-950 text-white shadow-[0_14px_35px_rgba(0,0,0,0.20)]"
                : "cursor-not-allowed bg-neutral-200 text-neutral-500"
            }`}
          >
            {isSaving ? "Saving Journey..." : postToAtlasWorld ? "Save, Post & View Trip" : "Save Privately & View Trip"}
          </button>
        </div>
      </div>
    </main>
  );
}