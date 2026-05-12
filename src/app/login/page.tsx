"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/app/lib/supabase-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/atlas`
              : undefined,
        },
      });

      if (error) {
        throw error;
      }

      setMessage(
        "Check your email for your Atlas magic link."
      );
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to send login link.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f1e7] px-4 py-10 text-slate-950">
      <div className="mx-auto flex min-h-[80vh] max-w-6xl items-center">
        <div className="grid w-full gap-10 lg:grid-cols-2">
          <div>
            <Link
              href="/"
              className="inline-flex rounded-full border border-neutral-300 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-neutral-700"
            >
              Atlas
            </Link>

            <p className="mt-10 text-xs font-semibold uppercase tracking-[0.34em] text-neutral-500">
              Your Atlas Log
            </p>

            <h1 className="mt-4 text-5xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-6xl">
              Save trips. Build your travel identity.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600">
              Atlas helps you build journeys, publish memories, remix trips,
              and create a visual travel log that grows over time.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                ["Build", "AI-powered travel planning"],
                ["Save", "Keep your Atlas log"],
                ["Share", "Publish journeys publicly"],
              ].map(([title, text]) => (
                <div
                  key={title}
                  className="rounded-[24px] border border-white/70 bg-white/80 p-4 shadow-sm"
                >
                  <p className="text-sm font-semibold">{title}</p>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.08)] sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-neutral-500">
              Start your Atlas
            </p>

            <h2 className="mt-3 text-3xl font-semibold">
              Continue with email
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              We’ll send you a magic login link instantly.
            </p>

            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Email address
                </label>

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white"
              >
                {loading ? "Sending..." : "Start My Atlas"}
              </button>
            </form>

            {message ? (
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {message}
              </div>
            ) : null}

            {error ? (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="mt-8 rounded-[28px] border border-[#eadbc5] bg-[linear-gradient(180deg,#fffaf2,#f3e6d2)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#8a6631]">
                Why create an Atlas?
              </p>

              <div className="mt-4 space-y-3">
                {[
                  "Save trips across devices",
                  "Publish journeys to Atlas World",
                  "Build your traveler profile",
                  "Upload photos and future reels",
                  "Create your travel captain’s log",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-[#eadbc5] bg-white/80 px-4 py-3 text-sm text-slate-700"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-slate-500">
              You can still explore Atlas and build trips without logging in.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}