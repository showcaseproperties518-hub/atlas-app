"use client";

export default function AtlasPage() {
  const journeys = [
    {
      title: "Costa Rica Adventure",
      location: "Costa Rica",
      image:
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
      tags: ["Hidden Gems", "Local Favorites"],
      likes: 887,
      published: true,
    },
    {
      title: "NYC Exploration",
      location: "New York",
      image:
        "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80",
      tags: ["Food", "City"],
      likes: 314,
      published: false,
    },
    {
      title: "Iceland Nature Route",
      location: "Iceland",
      image:
        "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
      tags: ["Scenic", "Adventure"],
      likes: 405,
      published: true,
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f7fb] text-slate-900">
      {/* Hero */}
      <section className="relative h-[360px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1800&q=80"
          alt="Amalfi Coast"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* lighter travel overlay */}
        <div className="absolute inset-0 bg-white/35" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-white/25 to-[#f5f7fb]" />

        {/* topo / map feel */}
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(15,23,42,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.10)_1px,transparent_1px)] [background-size:40px_40px]" />

        <svg
          className="absolute inset-0 h-full w-full opacity-25"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            d="M0,55 C15,48 25,62 40,54 C52,48 65,62 78,55 C88,50 95,56 100,52"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="0.35"
            fill="none"
          />
          <path
            d="M0,62 C14,56 28,68 42,61 C54,55 68,68 82,61 C91,57 97,61 100,59"
            stroke="rgba(255,255,255,0.8)"
            strokeWidth="0.35"
            fill="none"
          />
          <path
            d="M0,70 C16,64 28,76 44,69 C58,63 72,76 86,69 C94,65 99,69 100,68"
            stroke="rgba(255,255,255,0.75)"
            strokeWidth="0.35"
            fill="none"
          />
        </svg>

        <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-end px-5 pb-10">
          <h1 className="text-5xl font-bold tracking-tight">My Atlas</h1>
          <p className="mt-2 max-w-2xl text-lg text-slate-700">
            Your personal travel map and shared journeys
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 pb-12">
        {/* Profile card */}
        <section className="mt-6 rounded-[28px] border border-white/70 bg-white/75 p-6 shadow-xl backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="h-24 w-24 overflow-hidden rounded-full shadow-md ring-4 ring-white/70">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80"
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <h2 className="text-3xl font-bold">Alex Johnson</h2>
                <p className="mt-1 text-slate-500">@alex</p>

                <p className="mt-3 max-w-2xl text-slate-600">
                  Exploring hidden gems, local flavors, and unforgettable places.
                  Saving journeys and sharing the best ones with Atlas.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <button className="rounded-full bg-slate-900 px-6 py-3 font-semibold text-white shadow">
                Share My Atlas
              </button>

              <button className="rounded-full border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-900">
                Copy Link
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-white/85 p-4 shadow-sm">
              <p className="text-3xl font-bold">7</p>
              <p className="text-sm text-slate-500">Countries</p>
            </div>
            <div className="rounded-xl bg-white/85 p-4 shadow-sm">
              <p className="text-3xl font-bold">12</p>
              <p className="text-sm text-slate-500">Trips</p>
            </div>
            <div className="rounded-xl bg-white/85 p-4 shadow-sm">
              <p className="text-3xl font-bold">3140</p>
              <p className="text-sm text-slate-500">Miles</p>
            </div>
          </div>

          {/* Publish */}
          <div className="mt-8 rounded-xl bg-sky-50/90 p-5">
            <h3 className="text-lg font-semibold">Publish your journey</h3>
            <p className="mt-2 text-slate-600">
              Share your routes, photos, and experiences with the Atlas community.
            </p>

            <div className="mt-4 flex gap-3 flex-wrap">
              <button className="rounded-full bg-blue-600 px-5 py-2 text-white font-semibold">
                Publish to Atlas
              </button>

              <button className="rounded-full border border-slate-300 px-5 py-2">
                Preview Profile
              </button>
            </div>
          </div>
        </section>

        {/* Journeys */}
        <section className="mt-8">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-3xl font-bold">My Journeys</h2>
            <button className="text-sm font-semibold text-slate-500">
              View All
            </button>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {journeys.map((journey) => (
              <div
                key={journey.title}
                className="overflow-hidden rounded-[20px] bg-white shadow-md transition hover:shadow-lg"
              >
                <div className="relative h-64">
                  <img
                    src={journey.image}
                    alt={journey.title}
                    className="h-full w-full object-cover"
                  />

                  <div className="absolute inset-0 bg-black/20" />

                  <div className="absolute right-4 top-4">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        journey.published
                          ? "bg-emerald-500 text-white"
                          : "bg-black/40 text-white"
                      }`}
                    >
                      {journey.published ? "Published" : "Private"}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-xl font-bold">{journey.title}</h3>
                    <p className="text-sm">{journey.location}</p>
                  </div>
                </div>

                <div className="p-4 flex gap-3 flex-wrap">
                  <button className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white">
                    Share
                  </button>
                  <button className="rounded-full border px-4 py-2 text-sm">
                    Copy Link
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}