import Link from 'next/link';

export default function MapPage() {
  const trips = [
    {
      title: 'Costa Rica Adventure',
      location: 'Central America',
      type: 'Hidden Gems + Nature',
      image:
        'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
    },
    {
      title: 'NYC Urban Exploration',
      location: 'New York',
      type: 'Local Favorites + Family',
      image:
        'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
    },
    {
      title: 'Iceland Nature Route',
      location: 'Iceland',
      type: 'Scenic + Off the Beaten Path',
      image:
        'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80',
    },
    {
      title: 'Hudson Valley Escape',
      location: 'Upstate New York',
      type: 'Waterfalls + Local Stops',
      image:
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08111f] text-white">
      {/* Background world map feeling */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.12),transparent_28%),linear-gradient(to_bottom,#08111f,#0b1324,#101827)]" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      {/* Soft continent / map blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-25">
        <div className="absolute left-[8%] top-[24%] h-28 w-56 rounded-[50%] bg-white/10 blur-[2px]" />
        <div className="absolute left-[24%] top-[44%] h-40 w-48 rounded-[45%] bg-white/10 blur-[2px]" />
        <div className="absolute left-[43%] top-[22%] h-28 w-40 rounded-[48%] bg-white/10 blur-[2px]" />
        <div className="absolute left-[52%] top-[42%] h-44 w-52 rounded-[45%] bg-white/10 blur-[2px]" />
        <div className="absolute right-[8%] top-[26%] h-32 w-52 rounded-[50%] bg-white/10 blur-[2px]" />
        <div className="absolute right-[18%] bottom-[22%] h-24 w-28 rounded-[48%] bg-white/10 blur-[2px]" />
      </div>

      {/* Route lines */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-70"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path
          d="M18,42 C25,40 30,41 37,45 C44,49 48,47 54,42"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="0.35"
          fill="none"
          strokeDasharray="1.4 1.4"
        />
        <path
          d="M54,42 C62,37 70,35 80,39"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="0.35"
          fill="none"
          strokeDasharray="1.4 1.4"
        />
        <path
          d="M37,45 C34,56 29,65 24,73"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="0.3"
          fill="none"
          strokeDasharray="1.4 1.4"
        />
      </svg>

      {/* Pins */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[20%] top-[42%]">
          <div className="text-2xl drop-shadow-[0_0_12px_rgba(255,255,255,0.55)]">
            📍
          </div>
        </div>
        <div className="absolute left-[37%] top-[45%]">
          <div className="text-2xl drop-shadow-[0_0_12px_rgba(255,255,255,0.55)]">
            📍
          </div>
        </div>
        <div className="absolute left-[54%] top-[41%]">
          <div className="text-2xl drop-shadow-[0_0_12px_rgba(255,255,255,0.55)]">
            📍
          </div>
        </div>
        <div className="absolute left-[80%] top-[38%]">
          <div className="text-2xl drop-shadow-[0_0_12px_rgba(255,255,255,0.55)]">
            📍
          </div>
        </div>
        <div className="absolute left-[24%] top-[73%]">
          <div className="text-2xl drop-shadow-[0_0_12px_rgba(255,255,255,0.55)]">
            📍
          </div>
        </div>
      </div>

      <div className="relative z-10 flex min-h-screen flex-col px-5 py-8">
        {/* Header */}
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/70">
                Atlas World
              </p>
              <h1 className="mt-2 text-4xl font-bold sm:text-5xl">
                Explore Shared Journeys
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
                Discover routes, hidden spots, and published adventures from
                travelers building their story across Atlas.
              </p>
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
        </div>

        {/* Discovery panel */}
        <div className="mt-auto pt-10">
          <div className="mx-auto max-w-6xl rounded-[30px] border border-white/10 bg-white/95 p-5 text-slate-900 shadow-[0_30px_80px_rgba(0,0,0,0.4)] sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Discover Journeys</h2>
                <p className="mt-1 text-sm text-slate-500">
                  A preview of routes travelers are adding to Atlas World.
                </p>
              </div>

              <button className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                View All
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {trips.map((trip) => (
                <div
                  key={trip.title}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative h-40 w-full">
                    <img
                      src={trip.image}
                      alt={trip.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30" />

                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-lg font-semibold text-white">
                        {trip.title}
                      </h3>
                      <p className="text-sm text-white/80">{trip.location}</p>
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="text-sm text-slate-600">{trip.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}