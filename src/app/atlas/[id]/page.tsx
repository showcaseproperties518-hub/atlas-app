"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const ATLAS_BUILD_PREFILL_STORAGE_KEY = "ATLAS_BUILD_PREFILL";
const ATLAS_BUILD_STORAGE_KEY = "ATLAS_BUILD_TRIP";

type Day = {
  day: number;
  title: string;
  summary?: string;
  morning?: string;
  afternoon?: string;
  evening?: string;
};

type Journey = {
  id: string;
  title: string;
  subtitle?: string;
  destination: string;
  coverImage: string;
  duration?: string;
  budget?: string;
  travelers?: string;
  tripStyle?: string;
  energyLevel?: string;
  vibeSummary?: string;
  days?: Day[];
  creatorName?: string;
  creatorUsername?: string;
  creatorAvatar?: string;
  remixCount?: number;
  saveCount?: number;
  shareCount?: number;
};

const fallbackJourneys: Record<string, Journey> = {
  "iceland-ring-road": {
    id: "iceland-ring-road",
    title: "Iceland Ring Road",
    subtitle: "Waterfalls, black sand, glacier views, and cinematic road-trip days.",
    destination: "Iceland",
    coverImage:
      "https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&w=1800&q=80",
    duration: "5 days",
    budget: "$2,000 - $4,000",
    travelers: "Couple",
    tripStyle: "Adventure",
    energyLevel: "Balanced",
    creatorName: "Atlas Traveler",
    creatorUsername: "atlasroutes",
    remixCount: 184,
    saveCount: 642,
    shareCount: 91,
    days: [
      {
        day: 1,
        title: "Arrival + Reykjavik Reset",
        summary: "Land, settle in, eat well, and ease into the Iceland mood.",
        morning: "Arrive and pick up your rental car.",
        afternoon: "Explore Reykjavik, grab coffee, and walk the waterfront.",
        evening: "Dinner in town and early night before the big scenery days.",
      },
      {
        day: 2,
        title: "Golden Circle + Hot Springs",
        summary: "Classic Iceland anchors with a warm, memorable finish.",
        morning: "Thingvellir National Park and scenic pull-offs.",
        afternoon: "Geysir and Gullfoss with time for photos.",
        evening: "Hot spring soak and relaxed dinner.",
      },
      {
        day: 3,
        title: "South Coast Waterfalls",
        summary: "The day that feels like the movie trailer.",
        morning: "Seljalandsfoss and nearby hidden falls.",
        afternoon: "Skogafoss and dramatic cliffside views.",
        evening: "Vik dinner and black-sand coastline mood.",
      },
    ],
  },
  "costa-rica-volcano": {
    id: "costa-rica-volcano",
    title: "Costa Rica Volcano Trip",
    subtitle: "Rainforest roads, waterfalls, hot springs, and coastal energy.",
    destination: "Costa Rica",
    coverImage:
      "https://images.unsplash.com/photo-1518182170546-07661fd94144?auto=format&fit=crop&w=1800&q=80",
    duration: "7 days",
    budget: "$2,500 - $4,500",
    travelers: "Friends",
    tripStyle: "Adventure",
    energyLevel: "Balanced",
    creatorName: "Atlas Clips",
    creatorUsername: "atlasworld",
    remixCount: 214,
    saveCount: 711,
    shareCount: 108,
    days: [
      {
        day: 1,
        title: "Arrive + La Fortuna Base",
        summary: "Get settled near Arenal and start with an easy local dinner.",
        morning: "Arrive, pick up car, and drive toward La Fortuna.",
        afternoon: "Check in and walk town.",
        evening: "Dinner with volcano views if weather cooperates.",
      },
      {
        day: 2,
        title: "Waterfalls + Hot Springs",
        summary: "The classic Costa Rica payoff day.",
        morning: "La Fortuna Waterfall early before crowds.",
        afternoon: "Arenal area scenic stops and lunch.",
        evening: "Hot springs and relaxed dinner.",
      },
    ],
  },
  "hudson-valley-waterfalls": {
    id: "hudson-valley-waterfalls",
    title: "Hudson Valley Waterfalls",
    subtitle: "A close-to-home route with scenic drives, short hikes, and food stops.",
    destination: "Hudson Valley, NY",
    coverImage:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1800&q=80",
    duration: "2 days",
    budget: "Under $1,500",
    travelers: "Couple",
    tripStyle: "Hidden gems",
    energyLevel: "Easygoing",
    creatorName: "Atlas Local",
    creatorUsername: "atlaslocal",
    remixCount: 94,
    saveCount: 288,
    shareCount: 43,
    days: [
      {
        day: 1,
        title: "Waterfalls + Small Towns",
        summary: "Easy scenic stops, coffee, and a simple local route.",
        morning: "Start with coffee and a short waterfall walk.",
        afternoon: "Scenic drive and small-town lunch.",
        evening: "Cozy dinner and overnight stay.",
      },
      {
        day: 2,
        title: "Views + Slow Finish",
        summary: "A relaxed second day that still feels worth the drive.",
        morning: "Breakfast and one scenic overlook.",
        afternoon: "Local shops, farm stop, or short trail.",
        evening: "Drive home without feeling rushed.",
      },
    ],
  },
};

function getSlug(value?: string) {
  return (value || "atlascreator")
    .toLowerCase()
    .replace(/^@/, "")
    .replace(/[^a-z0-9]+/g, "")
    .trim() || "atlascreator";
}

function getFallbackImage(destination: string) {
  const d = destination.toLowerCase();

  if (d.includes("iceland")) {
    return "https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&w=1800&q=80";
  }

  if (d.includes("costa")) {
    return "https://images.unsplash.com/photo-1518182170546-07661fd94144?auto=format&fit=crop&w=1800&q=80";
  }

  if (d.includes("new york") || d.includes("nyc")) {
    return "https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?auto=format&fit=crop&w=1800&q=80";
  }

  return "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80";
}

function normalizeStoredJourney(parsed: any, id: string): Journey {
  const trip = parsed?.trip || parsed;
  const destination = parsed?.destination || trip?.destination || "Your trip";
  const title = trip?.title || parsed?.title || `${destination} Journey`;

  return {
    id,
    title,
    subtitle:
      trip?.subtitle ||
      parsed?.subtitle ||
      parsed?.vibeSummary ||
      trip?.vibeSummary ||
      "A real journey you can view, save, remix, and build your version from.",
    destination,
    coverImage: parsed?.coverImage || parsed?.cover_image || getFallbackImage(destination),
    duration: parsed?.duration || parsed?.form?.duration || "Flexible",
    budget: parsed?.budget || parsed?.form?.budget || "Flexible",
    travelers: parsed?.travelers || parsed?.form?.travelers || "Travelers",
    tripStyle: parsed?.tripStyle || parsed?.form?.tripStyle || "Balanced",
    energyLevel: parsed?.energyLevel || parsed?.form?.energyLevel || "Balanced",
    vibeSummary: trip?.vibeSummary || parsed?.vibeSummary || trip?.subtitle || parsed?.subtitle,
    creatorName: parsed?.creatorName || parsed?.creator_name || "Atlas Creator",
    creatorUsername: getSlug(parsed?.creatorUsername || parsed?.creator_username || "atlascreator"),
    creatorAvatar: parsed?.creatorAvatar || parsed?.creator_avatar || parsed?.coverImage || getFallbackImage(destination),
    remixCount: parsed?.remixCount || 124,
    saveCount: parsed?.saveCount || 438,
    shareCount: parsed?.shareCount || 57,
    days:
      trip?.days?.map((d: any, i: number) => ({
        day: d.day || i + 1,
        title: d.title || `Day ${i + 1}`,
        summary: d.summary || "",
        morning: d.morning || "",
        afternoon: d.afternoon || "",
        evening: d.evening || "",
      })) || [],
  };
}

function buildShareCaption(journey: Journey) {
  return `${journey.title}

${journey.duration || "Flexible"} in ${journey.destination}
${journey.subtitle || "A trip worth saving."}

Posted by @${getSlug(journey.creatorUsername)}
Built on Atlas — view it, save it, or build your version.`;
}

function getPhotoStrip(journey: Journey) {
  const base = journey.coverImage;

  const destination = journey.destination.toLowerCase();

  if (destination.includes("iceland")) {
    return [
      base,
      "https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1529963183134-61a90db47eaf?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=900&q=80",
    ];
  }

  if (destination.includes("costa")) {
    return [
      base,
      "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1518182170546-07661fd94144?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1503435824048-a799a3a84bf7?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1525874684015-58379d421a52?auto=format&fit=crop&w=900&q=80",
    ];
  }

  if (destination.includes("new york") || destination.includes("nyc")) {
    return [
      base,
      "https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80",
    ];
  }

  return [
    base,
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
  ];
}

function getTripMoments(journey: Journey) {
  const destination = journey.destination || "this trip";

  return [
    {
      label: "Photo moment",
      title: "The shot people save",
      text: `This is the kind of ${destination} moment that makes someone stop scrolling and want the route.`,
    },
    {
      label: "Local anchor",
      title: "The stop that makes it feel real",
      text: "Atlas works best when the trip has a real-world anchor: food, views, a walkable area, or a simple experience people can picture themselves doing.",
    },
    {
      label: "Remix trigger",
      title: "Easy to make your own",
      text: "This journey is built to be copied, adjusted, made cheaper, made more luxury, or rebuilt around a totally different travel style.",
    },
  ];
}

export default function JourneyPage() {
  const params = useParams();
  const router = useRouter();
  const [journey, setJourney] = useState<Journey | null>(null);
  const [shareMessage, setShareMessage] = useState("");

  const id = useMemo(() => {
    const raw = params?.id;
    return Array.isArray(raw) ? raw[0] : raw || "journey";
  }, [params]);

  useEffect(() => {
    const fallback = fallbackJourneys[id];

    try {
      const savedResults = window.localStorage.getItem(ATLAS_BUILD_STORAGE_KEY);
      const savedPrefill = window.localStorage.getItem(ATLAS_BUILD_PREFILL_STORAGE_KEY);
      const legacyBuild = window.localStorage.getItem("atlasBuildData");
      const legacyPrefill = window.localStorage.getItem("atlasBuildPrefill");

      const raw = savedResults || savedPrefill || legacyBuild || legacyPrefill;

      if (raw) {
        const parsed = JSON.parse(raw);
        const normalized = normalizeStoredJourney(parsed, id);
        setJourney({
          ...fallback,
          ...normalized,
          id,
        });
        return;
      }
    } catch (error) {
      console.error("Could not load Atlas journey", error);
    }

    setJourney(
      fallback || {
        id,
        title: "Atlas Journey",
        subtitle: "A travel route built to be viewed, saved, remixed, and shared.",
        destination: "Atlas World",
        coverImage: getFallbackImage("Atlas"),
        duration: "Flexible",
        budget: "Flexible",
        travelers: "Travelers",
        tripStyle: "Balanced",
        energyLevel: "Balanced",
        creatorName: "Atlas Creator",
        creatorUsername: "atlascreator",
        remixCount: 124,
        saveCount: 438,
        shareCount: 57,
        days: [
          {
            day: 1,
            title: "Start the Journey",
            summary: "Open the route, feel the trip, then build your own version.",
            morning: "Explore the trip overview.",
            afternoon: "Review the route and key experiences.",
            evening: "Save it or build your version.",
          },
        ],
      }
    );
  }, [id]);

  const creatorUsername = getSlug(journey?.creatorUsername);
  const creatorHref = `/user/${creatorUsername}`;
  const heroImage = journey?.coverImage || getFallbackImage(journey?.destination || "");
  const avatar = journey?.creatorAvatar || heroImage;

  async function handleShare() {
    if (!journey) return;

    const caption = buildShareCaption(journey);

    try {
      if (navigator.share) {
        await navigator.share({
          title: journey.title,
          text: caption,
          url: window.location.href,
        });
        setShareMessage("Share sheet opened.");
        window.setTimeout(() => setShareMessage(""), 2200);
        return;
      }

      await navigator.clipboard.writeText(caption);
      setShareMessage("Caption copied — ready to post.");
      window.setTimeout(() => setShareMessage(""), 2600);
    } catch {
      setShareMessage("Share canceled.");
      window.setTimeout(() => setShareMessage(""), 2200);
    }
  }

  function handleCopyCaption() {
    if (!journey) return;

    navigator.clipboard
      .writeText(buildShareCaption(journey))
      .then(() => {
        setShareMessage("Caption copied — ready for IG, TikTok, Facebook, or text.");
        window.setTimeout(() => setShareMessage(""), 2600);
      })
      .catch(() => {
        setShareMessage("Could not copy caption.");
        window.setTimeout(() => setShareMessage(""), 2200);
      });
  }

  function handleBuildMyVersion() {
    if (!journey) return;

    const prefill = {
      destination: journey.destination,
      duration: journey.duration || "Flexible",
      budget: journey.budget || "Flexible",
      travelers: journey.travelers || "Travelers",
      tripStyle: journey.tripStyle || "Balanced",
      energyLevel: journey.energyLevel || "Balanced",
      coverImage: journey.coverImage,
      creatorName: journey.creatorName,
      creatorUsername: journey.creatorUsername,
      sourceJourneyId: journey.id,
    };

    window.localStorage.setItem(ATLAS_BUILD_PREFILL_STORAGE_KEY, JSON.stringify(prefill));
    router.push("/build");
  }

  if (!journey) {
    return (
      <main className="min-h-screen bg-[#08111f] text-white">
        <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-6 text-center">
          <div>
            <p className="text-[11px] uppercase tracking-[0.34em] text-white/50">Atlas</p>
            <h1 className="mt-3 text-2xl font-semibold">Loading journey…</h1>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f4efe7] pb-28 text-neutral-950">
      <section className="relative min-h-[78vh] overflow-hidden bg-neutral-950 text-white">
        <img src={heroImage} alt={journey.title} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.28)_0%,rgba(0,0,0,0.30)_34%,rgba(0,0,0,0.88)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(214,185,140,0.28),transparent_36%)]" />

        <div className="relative z-10 mx-auto flex min-h-[78vh] max-w-6xl flex-col px-5 pb-8 pt-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/map"
              className="rounded-full border border-white/20 bg-white/12 px-4 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              ← Atlas World
            </Link>

            <Link
              href={creatorHref}
              className="flex items-center gap-2 rounded-full border border-white/20 bg-black/18 px-3 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-black/30"
            >
              <span className="h-6 w-6 rounded-full bg-cover bg-center ring-1 ring-white/35" style={{ backgroundImage: `url('${avatar}')` }} />
              @{creatorUsername}
            </Link>
          </div>

          <div className="mt-auto max-w-4xl">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[#d6b98c] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-black">
                View Journey
              </span>
              <span className="rounded-full border border-white/20 bg-white/14 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur">
                {journey.duration}
              </span>
              <span className="rounded-full border border-white/20 bg-white/14 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur">
                {journey.destination}
              </span>
            </div>

            <h1 className="mt-4 max-w-4xl text-[3rem] font-semibold leading-[0.92] tracking-[-0.06em] sm:text-[4.6rem] lg:text-[5.7rem]">
              {journey.title}
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-white/84 sm:text-lg">
              {journey.subtitle}
            </p>

            <Link
              href={creatorHref}
              className="mt-5 inline-flex items-center gap-3 rounded-full border border-white/18 bg-white/14 px-4 py-3 text-sm font-semibold text-white/88 backdrop-blur transition hover:bg-white/22 hover:text-white"
            >
              <span className="h-9 w-9 rounded-full bg-cover bg-center ring-1 ring-white/40" style={{ backgroundImage: `url('${avatar}')` }} />
              Posted by @{creatorUsername}
            </Link>

            <div className="mt-6 grid max-w-2xl grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/15 bg-white/12 p-4 backdrop-blur">
                <p className="text-2xl font-semibold">{journey.saveCount || 438}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/55">Saves</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/12 p-4 backdrop-blur">
                <p className="text-2xl font-semibold">{journey.remixCount || 124}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/55">Built</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/12 p-4 backdrop-blur">
                <p className="text-2xl font-semibold">{journey.shareCount || 57}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/55">Shares</p>
              </div>
            </div>

            <div className="mt-6 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={handleBuildMyVersion}
                className="rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-black shadow-[0_18px_50px_rgba(0,0,0,0.24)] transition hover:-translate-y-0.5"
              >
                Build My Version
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="rounded-2xl border border-white/25 bg-white/14 px-5 py-4 text-sm font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/22"
              >
                Post This Trip
              </button>
              <button
                type="button"
                onClick={() => router.push("/results")}
                className="rounded-2xl border border-[#d6b98c]/40 bg-[#d6b98c]/18 px-5 py-4 text-sm font-semibold text-[#ffe6bd] backdrop-blur transition hover:-translate-y-0.5"
              >
                Open Results
              </button>
            </div>

            {shareMessage ? (
              <div className="mt-4 rounded-2xl border border-white/15 bg-black/25 px-4 py-3 text-sm text-white/82 backdrop-blur">
                {shareMessage}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mx-auto mt-6 max-w-6xl px-5 sm:px-6 lg:px-8">
        <div className="rounded-[24px] border border-[#d6b98c]/30 bg-[#d6b98c]/10 p-4">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[#d6b98c]">
            Share this trip
          </p>
          <p className="mt-2 text-sm text-white/80">
            People are posting this trip on TikTok, Instagram, and Facebook.
          </p>

          <div className="mt-3 rounded-xl bg-black/40 p-3 text-xs text-white whitespace-pre-wrap">
{`${'${journey.title}'}

${'${journey.duration || "Flexible"}'} in ${'${journey.destination}'}
${'${journey.subtitle || ""}'}

Built on Atlas
Build your version ↓`}
          </div>
        </div>
      </div>


      <section className="mx-auto max-w-6xl px-5 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-white/70 bg-white/82 p-4 shadow-[0_20px_70px_rgba(0,0,0,0.08)]">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-neutral-500">
                Photo layer
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-neutral-950">
                The trip starts to feel real here
              </h2>
            </div>
            <span className="hidden rounded-full bg-[#f4eadb] px-3 py-1.5 text-xs font-semibold text-[#8a6631] sm:inline-flex">
              Scroll the moments
            </span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {getPhotoStrip(journey).map((photo, index) => (
              <div
                key={`${photo}-${index}`}
                className={`relative h-48 min-w-[230px] overflow-hidden rounded-[26px] border border-white bg-neutral-900 shadow-[0_16px_40px_rgba(0,0,0,0.12)] sm:h-56 sm:min-w-[285px] ${
                  index % 2 === 0 ? "rotate-[-1deg]" : "rotate-[1deg]"
                }`}
              >
                <img src={photo} alt={`${journey.destination} moment ${index + 1}`} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#f5d7a1]">
                    Moment {index + 1}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {index === 0 ? "Cover moment" : index === 1 ? "Save-worthy stop" : index === 2 ? "Route energy" : "Trip texture"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-5 py-7 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8">
        <div className="space-y-5">
          <div className="rounded-[32px] border border-white/70 bg-white/88 p-5 shadow-[0_20px_70px_rgba(0,0,0,0.10)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-neutral-500">
              Why this trip hits
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-neutral-950">
              This is built to be copied, not just viewed.
            </h2>
            <p className="mt-3 text-sm leading-7 text-neutral-700">
              The strongest Atlas journeys combine visual pull, simple pacing, clear route logic,
              and a one-tap path to build your own version. This page is designed to make someone
              feel the trip first, then act.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <MiniCard label="Route" value={journey.duration || "Flexible"} />
              <MiniCard label="Budget" value={journey.budget || "Flexible"} />
              <MiniCard label="Travelers" value={journey.travelers || "Travelers"} />
            </div>
          </div>

          <div className="rounded-[32px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(246,240,232,0.95))] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.08)]">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-neutral-500">
                  Itinerary
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                  The trip flow
                </h2>
              </div>
              <span className="rounded-full bg-neutral-950 px-3 py-1.5 text-xs font-semibold text-white">
                {journey.days?.length || 1} days
              </span>
            </div>

            <div className="mt-6 space-y-5">
              {(journey.days && journey.days.length > 0 ? journey.days : []).map((day) => (
                <article key={day.day} className="overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-[0_14px_38px_rgba(0,0,0,0.05)]">
                  <div className="h-1.5 bg-[linear-gradient(90deg,#d6b98c,#f5efe4,#d6b98c)]" />
                  <div className="p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8a6631]">
                      Day {day.day}
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                      {day.title}
                    </h3>
                    {day.summary ? (
                      <p className="mt-2 text-sm leading-6 text-neutral-600">{day.summary}</p>
                    ) : null}

                    <div className="mt-4 grid gap-3">
                      {day.morning ? <Moment label="Morning" text={day.morning} /> : null}
                      {day.afternoon ? <Moment label="Afternoon" text={day.afternoon} /> : null}
                      {day.evening ? <Moment label="Evening" text={day.evening} /> : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/70 bg-neutral-950 p-5 text-white shadow-[0_22px_80px_rgba(0,0,0,0.16)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#d6b98c]">
              Trip moments
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
              The parts people remember
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/70">
              These moments make the page feel less like a plan and more like a trip someone can picture themselves taking.
            </p>

            <div className="mt-5 grid gap-3">
              {getTripMoments(journey).map((moment) => (
                <div
                  key={moment.title}
                  className="rounded-[24px] border border-white/10 bg-white/[0.07] p-4 backdrop-blur"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d6b98c]">
                    {moment.label}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-white">{moment.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/70">{moment.text}</p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleBuildMyVersion}
              className="mt-5 w-full rounded-2xl bg-[#d6b98c] px-5 py-4 text-sm font-semibold text-black shadow-[0_16px_42px_rgba(214,185,140,0.20)] transition hover:-translate-y-0.5"
            >
              Build My Version From These Moments
            </button>
          </div>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-5 lg:self-start">
          <div className="overflow-hidden rounded-[32px] border border-white/70 bg-neutral-950 text-white shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
            <div className="relative h-64">
              <img src={heroImage} alt={journey.title} className="h-full w-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#d6b98c]">
                  Share-ready
                </p>
                <h3 className="mt-1 text-2xl font-semibold leading-tight">{journey.title}</h3>
              </div>
            </div>

            <div className="space-y-3 p-5">
              <button
                type="button"
                onClick={handleBuildMyVersion}
                className="w-full rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-black"
              >
                Build My Version
              </button>
              <button
                type="button"
                onClick={handleCopyCaption}
                className="w-full rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-sm font-semibold text-white"
              >
                Copy Viral Caption
              </button>
              <Link
                href="/map"
                className="flex w-full items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-sm font-semibold text-white"
              >
                Back to Map
              </Link>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/70 bg-white/88 p-5 shadow-[0_20px_70px_rgba(0,0,0,0.08)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-neutral-500">
              Creator
            </p>
            <Link href={creatorHref} className="mt-4 flex items-center gap-4 rounded-[24px] bg-[#f7f2eb] p-4 transition hover:bg-[#efe4d4]">
              <span className="h-16 w-16 rounded-full bg-cover bg-center ring-2 ring-white" style={{ backgroundImage: `url('${avatar}')` }} />
              <span>
                <span className="block text-lg font-semibold text-neutral-950">
                  {journey.creatorName || "Atlas Creator"}
                </span>
                <span className="mt-1 block text-sm font-medium text-neutral-500">
                  @{creatorUsername}
                </span>
              </span>
            </Link>
          </div>
        </aside>
      </section>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/15 bg-neutral-950/92 p-3 text-white shadow-[0_-18px_50px_rgba(0,0,0,0.25)] backdrop-blur">
        <div className="mx-auto grid max-w-3xl grid-cols-3 gap-2">
          <button
            type="button"
            onClick={handleBuildMyVersion}
            className="rounded-2xl bg-[#d6b98c] px-3 py-3 text-sm font-semibold text-black"
          >
            Build
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="rounded-2xl border border-white/15 bg-white/10 px-3 py-3 text-sm font-semibold text-white"
          >
            Share
          </button>
          <Link
            href="/map"
            className="flex items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-3 py-3 text-sm font-semibold text-white"
          >
            Map
          </Link>
        </div>
      </div>
    </main>
  );
}

function MiniCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-[#fbf7f1] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-neutral-950">{value}</p>
    </div>
  );
}

function Moment({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-[#fbf7f1] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-neutral-500">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-neutral-700">{text}</p>
    </div>
  );
}
