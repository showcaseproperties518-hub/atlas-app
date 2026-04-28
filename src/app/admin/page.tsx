"use client";

import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[#f4efe7] px-5 py-10 text-neutral-950">
      <div className="mx-auto max-w-4xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-neutral-500">
          Atlas Admin
        </p>

        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
          Admin Dashboard
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
          Manage Atlas journeys, booking tools, published trips, and internal testing.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/admin/booking"
            className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8a6631]">
              Booking
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Booking Tools</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              View booking layer tests, provider routing, and outbound booking setup.
            </p>
          </Link>

          <Link
            href="/atlas"
            className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8a6631]">
              My Atlas
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Open My Atlas</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Review saved and published trips from the user-facing Atlas dashboard.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}