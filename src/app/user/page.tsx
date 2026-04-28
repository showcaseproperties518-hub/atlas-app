import Link from "next/link";

export default function UserPage() {
  return (
    <main className="min-h-screen bg-[#f4efe7] px-5 py-10 text-neutral-950">
      <div className="mx-auto max-w-4xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-neutral-500">
          Atlas Profile
        </p>

        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
          Traveler Profiles
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
          This page is the base profile route. Individual creator profiles live under
          /user/[username].
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/user/atlasworld"
            className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8a6631]">
              Creator
            </p>
            <h2 className="mt-2 text-2xl font-semibold">@atlasworld</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Open the default Atlas creator profile.
            </p>
          </Link>

          <Link
            href="/map"
            className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8a6631]">
              Explore
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Atlas World Map</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Discover trips and creator journeys on the map.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}