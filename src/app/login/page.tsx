"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth-provider";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user) router.replace("/history");
  }, [loading, router, user]);

  async function sendMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!isSupabaseConfigured()) {
      setError("Supabase is not configured. Check .env.local and restart the app.");
      return;
    }

    setSubmitting(true);
    const { error: signInError } = await getSupabase().auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/history`,
      },
    });
    setSubmitting(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }
    setSent(true);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f3ee] px-5 py-12 text-[#171713]">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 font-semibold">
          <span className="grid size-9 place-items-center rounded-xl bg-[#171713] text-sm text-lime-300">
            P
          </span>
          PrepLoop
        </Link>

        <section className="mt-8 rounded-3xl border border-black/10 bg-white p-7 shadow-[0_20px_60px_rgba(0,0,0,0.08)] sm:p-9">
          {sent ? (
            <div className="text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-lime-200 text-xl">
                ✓
              </span>
              <h1 className="mt-5 text-2xl font-semibold tracking-tight">
                Check your email
              </h1>
              <p className="mt-3 text-sm leading-6 text-black/50">
                We sent a secure sign-in link to <strong>{email}</strong>. Open it
                on this device to finish signing in.
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="mt-6 text-sm font-semibold underline underline-offset-4"
              >
                Use another email
              </button>
            </div>
          ) : (
            <>
              <span className="inline-flex rounded-full bg-lime-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-lime-950">
                Cross-device sync
              </span>
              <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em]">
                Keep your progress with you.
              </h1>
              <p className="mt-3 text-sm leading-6 text-black/50">
                Sign in with a secure email link. No password needed.
              </p>

              <form onSubmit={sendMagicLink} className="mt-7">
                <label className="block text-sm font-medium">
                  Email address
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-black/10 bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-lime-500 focus:ring-4 focus:ring-lime-500/10"
                    placeholder="you@example.com"
                  />
                </label>
                {error && (
                  <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={submitting || !email.trim()}
                  className="mt-4 w-full rounded-xl bg-[#171713] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-black/20"
                >
                  {submitting ? "Sending link…" : "Email me a sign-in link"}
                </button>
              </form>
            </>
          )}
        </section>
        <p className="mt-5 text-center text-xs leading-5 text-black/35">
          Your cloud history is protected by per-user database policies.
        </p>
      </div>
    </main>
  );
}
