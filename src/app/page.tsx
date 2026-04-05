"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  Compass,
  Heart,
  MapPin,
  Menu,
  Search,
  UserCircle2,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [destination, setDestination] = useState("");

  const nearbyTrips = [
    {
      title: "NYC Family Adventure",
      subtitle: "Parks, skyline views, and city fun",
      image:
        "https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "Hudson Valley Waterfalls",
      subtitle: "Scenic stops and short hikes",
      image:
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    },
  ];

  const travelerStories = [
    {
      title: "Epic Iceland Adventure",
      subtitle: "Waterfalls, coastlines, and dramatic views",
      image:
        "https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&w=1200&q=80",
    },
  ];

  const saveDestinationPrefill = (value: string) => {
    const trimmed = value.trim();

    if (typeof window === "undefined") return;

    localStorage.setItem("atlasDestinationPrefill", trimmed);
    localStorage.setItem("atlas_destination_prefill", trimmed);
    localStorage.setItem("build_prefill_destination", trimmed);
    localStorage.setItem(
      "atlasBuildPrefill",
      JSON.stringify({
        destination: trimmed,
      })
    );
  };

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    saveDestinationPrefill(destination);
    router.push("/build");
  };

  const handleCreateTrip = () => {
    saveDestinationPrefill(destination);
    router.push("/build");
  };

  const handleExploreMap = () => {
    router.push("/map");
  };

  const handleTopSearch = () => {
    saveDestinationPrefill(destination);
    router.push("/build");
  };

  const handleProfile = () => {
    router.push("/atlas");
  };

  const handleMenu = () => {
    router.push("/map");
  };

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-slate-900">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80"
            alt="Atlas landscape"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/20 to-black/35" />
        </div>

        <div className="relative z-10 px-5 pb-10 pt-6">
          <div className="mb-12 flex items-center justify-between text-white">
            <div className="text-2xl font-bold tracking-tight">Atlas</div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Search"
                onClick={handleTopSearch}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur transition hover:bg-white/15"
              >
                <Search className="h-5 w-5" strokeWidth={2.2} />
              </button>
              <button
                type="button"
                aria-label="Profile"
                onClick={handleProfile}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur transition hover:bg-white/15"
              >
                <UserCircle2 className="h-5 w-5" strokeWidth={2.1} />
              </button>
              <button
                type="button"
                aria-label="Menu"
                onClick={handleMenu}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur transition hover:bg-white/15"
              >
                <Menu className="h-5 w-5" strokeWidth={2.2} />
              </button>
            </div>
          </div>

          <div className="mx-auto flex min-h-[470px] max-w-xl flex-col items-center justify-center text-center">
            <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
              Atlas
            </h1>

            <p className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
              Your Odyssey Starts Here
            </p>

            <div className="mt-5 max-w-md text-base leading-7 text-white/95 sm:text-lg">
              <p>Discover unique adventures.</p>
              <p>Create your personal travel itinerary.</p>
              <p>Share your journey across the map.</p>
            </div>

            <form
              onSubmit={handleSearchSubmit}
              className="mt-8 flex w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-xl"
            >
              <div className="flex items-center px-4 text-slate-500">
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
                className="bg-[#677184] px-5 text-white transition hover:opacity-95"
              >
                <Search className="h-5 w-5" strokeWidth={2.4} />
              </button>
            </form>

            <div className="mt-5 flex w-full max-w-xl gap-3">
              <button
                type="button"
                onClick={handleCreateTrip}
                className="flex-1 rounded-xl bg-[#c9a15f] px-4 py-4 text-center text-lg font-semibold text-white shadow-lg transition hover:opacity-95"
              >
                Create Your Trip
              </button>

              <button
                type="button"
                onClick={handleExploreMap}
                className="flex-1 rounded-xl bg-[#677184] px-4 py-4 text-center text-lg font-semibold text-white shadow-lg transition hover:opacity-95"
              >
                Explore the Map
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Adventures Nearby */}
      <section className="bg-[#f7f7f5] px-5 py-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-2xl font-semibold text-slate-900">
            Adventures Nearby
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {nearbyTrips.map((trip) => (
              <Link
                key={trip.title}
                href="/map"
                className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="h-44 w-full">
                  <img
                    src={trip.image}
                    alt={trip.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold">{trip.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{trip.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Traveler Stories */}
      <section className="bg-[#f7f7f5] px-5 pb-8 pt-2">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-2xl font-semibold text-slate-900">
            Traveler Stories
          </h2>

          <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-[1.5fr_0.9fr]">
              <Link
                href="/map"
                className="relative min-h-[260px] overflow-hidden"
              >
                <img
                  src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?auto=format&fit=crop&w=1400&q=80"
                  alt="World map"
                  className="h-full w-full object-cover"
                />

                <div className="absolute left-[12%] top-[38%] text-white">
                  <MapPin
                    className="h-7 w-7 drop-shadow-md"
                    fill="currentColor"
                    strokeWidth={1.8}
                  />
                </div>
                <div className="absolute left-[34%] top-[33%] text-white">
                  <MapPin
                    className="h-7 w-7 drop-shadow-md"
                    fill="currentColor"
                    strokeWidth={1.8}
                  />
                </div>
                <div className="absolute left-[58%] top-[28%] text-white">
                  <MapPin
                    className="h-7 w-7 drop-shadow-md"
                    fill="currentColor"
                    strokeWidth={1.8}
                  />
                </div>
                <div className="absolute left-[72%] top-[36%] text-white">
                  <MapPin
                    className="h-7 w-7 drop-shadow-md"
                    fill="currentColor"
                    strokeWidth={1.8}
                  />
                </div>
                <div className="absolute left-[18%] top-[72%] text-white">
                  <MapPin
                    className="h-7 w-7 drop-shadow-md"
                    fill="currentColor"
                    strokeWidth={1.8}
                  />
                </div>
              </Link>

              <div className="p-4">
                {travelerStories.map((story) => (
                  <Link
                    key={story.title}
                    href="/atlas"
                    className="block rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:bg-slate-100"
                  >
                    <div className="h-36 overflow-hidden rounded-xl">
                      <img
                        src={story.image}
                        alt={story.title}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="pt-3">
                      <h3 className="text-xl font-semibold">{story.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {story.subtitle}
                      </p>

                      <div className="mt-4 h-1 w-full rounded-full bg-[#d8c29b]" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom nav */}
      <nav className="sticky bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center justify-around px-4 py-3">
          <Link href="/" className="flex flex-col items-center text-slate-600">
            <Compass className="h-6 w-6" strokeWidth={2.1} />
            <span className="mt-1 text-sm">Discover</span>
          </Link>

          <Link href="/build" className="flex flex-col items-center text-slate-900">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#c9a15f] text-white shadow-md">
              <span className="text-3xl leading-none">+</span>
            </span>
            <span className="mt-1 text-sm font-semibold text-[#a98346]">
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