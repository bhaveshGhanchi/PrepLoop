"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth-provider";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!loading && user) router.replace("/history");
  }, [loading, router, user]);

  async function submitCredentials(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!isSupabaseConfigured()) {
      setError("Supabase is not configured. Check .env.local and restart the app.");
      return;
    }
    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    const result =
      mode === "signin"
        ? await getSupabase().auth.signInWithPassword({
            email: email.trim(),
            password,
          })
        : await getSupabase().auth.signUp({
            email: email.trim(),
            password,
          });
    setSubmitting(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }
    if (result.data.session) {
      router.replace("/history");
    } else {
      setMessage(
        "Account created. If email confirmation is enabled in Supabase, confirm your email before signing in.",
      );
      setMode("signin");
      setPassword("");
      setConfirmPassword("");
    }
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
          <span className="inline-flex rounded-full bg-lime-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-lime-950">
            Cross-device sync
          </span>
          <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em]">
            {mode === "signin" ? "Welcome back." : "Create your account."}
          </h1>
          <p className="mt-3 text-sm leading-6 text-black/50">
            Use your email and password. No sign-in link is required.
          </p>

          <div className="mt-6 grid grid-cols-2 rounded-xl bg-[#f4f3ee] p-1">
            {(["signin", "signup"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setMode(item);
                  setError("");
                  setMessage("");
                }}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  mode === item ? "bg-white shadow-sm" : "text-black/40"
                }`}
              >
                {item === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <form onSubmit={submitCredentials} className="mt-6 space-y-4">
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
            <label className="block text-sm font-medium">
              Password
              <input
                type="password"
                required
                minLength={8}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-black/10 bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-lime-500 focus:ring-4 focus:ring-lime-500/10"
                placeholder="At least 8 characters"
              />
            </label>
            {mode === "signup" && (
              <label className="block text-sm font-medium">
                Confirm password
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-lime-500 focus:ring-4 focus:ring-lime-500/10"
                  placeholder="Repeat your password"
                />
              </label>
            )}
            {error && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
            {message && (
              <p className="rounded-xl bg-lime-50 px-3 py-2 text-sm text-lime-800">
                {message}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting || !email.trim() || !password}
              className="w-full rounded-xl bg-[#171713] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-black/20"
            >
              {submitting
                ? mode === "signin"
                  ? "Signing in…"
                  : "Creating account…"
                : mode === "signin"
                  ? "Sign in"
                  : "Create account"}
            </button>
          </form>
        </section>
        <p className="mt-5 text-center text-xs leading-5 text-black/35">
          Your cloud history is protected by per-user database policies.
        </p>
      </div>
    </main>
  );
}
