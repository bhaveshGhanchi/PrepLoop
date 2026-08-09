"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useAuth } from "@/components/auth-provider";

const nav = [
  { href: "/", label: "Today" },
  { href: "/leetcode", label: "LeetCode" },
  { href: "/hld", label: "HLD" },
  { href: "/lld", label: "LLD" },
  { href: "/behavioral", label: "Behavioral" },
  { href: "/history", label: "History" },
];

type AppShellProps = {
  children: ReactNode;
  eyebrow?: string;
  title: string;
  description: string;
  accent?: "lime" | "violet" | "orange" | "sky";
};

const accentClasses = {
  lime: "bg-lime-300 text-lime-950",
  violet: "bg-violet-300 text-violet-950",
  orange: "bg-orange-300 text-orange-950",
  sky: "bg-sky-300 text-sky-950",
};

export function AppShell({
  children,
  eyebrow,
  title,
  description,
  accent = "lime",
}: AppShellProps) {
  const { user, loading, syncStatus, signOut, syncNow } = useAuth();

  return (
    <div className="min-h-screen bg-[#f4f3ee] text-[#171713]">
      <header className="border-b border-black/10 bg-[#f4f3ee]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="grid size-8 place-items-center rounded-lg bg-[#171713] text-sm text-lime-300">
              P
            </span>
            PrepLoop
          </Link>
          <nav className="hidden items-center gap-1 rounded-full border border-black/10 bg-white/70 p-1 md:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-1.5 text-sm text-black/55 transition hover:bg-black/5 hover:text-black"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          {loading ? (
            <span className="text-xs font-medium text-black/35">Connecting…</span>
          ) : user ? (
            <div className="flex items-center gap-2 text-xs font-medium">
              <button
                type="button"
                onClick={() => {
                  if (syncStatus === "error") void syncNow();
                }}
                className={`flex items-center gap-2 ${
                  syncStatus === "error" ? "text-red-600" : "text-black/45"
                }`}
                title={
                  syncStatus === "error"
                    ? "Sync failed. Click to retry."
                    : user.email
                }
              >
                <span
                  className={`size-2 rounded-full ${
                    syncStatus === "error"
                      ? "bg-red-500"
                      : syncStatus === "syncing"
                        ? "animate-pulse bg-amber-500"
                        : "bg-lime-500"
                  }`}
                />
                {syncStatus === "syncing"
                  ? "Syncing"
                  : syncStatus === "error"
                    ? "Retry sync"
                    : "Cloud synced"}
              </button>
              <span className="text-black/15">·</span>
              <button
                type="button"
                onClick={() => void signOut()}
                className="text-black/40 hover:text-black"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-full bg-[#171713] px-3 py-2 text-xs font-semibold text-white"
            >
              <span className="size-2 rounded-full bg-white/35" />
              Sign in to sync
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 lg:px-8 lg:py-14">
        <div className="max-w-3xl">
          {eyebrow && (
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${accentClasses[accent]}`}
            >
              {eyebrow}
            </span>
          )}
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-black/55">
            {description}
          </p>
        </div>
        <div className="mt-10">{children}</div>
      </main>

      <nav className="fixed inset-x-3 bottom-3 z-20 flex justify-around rounded-2xl border border-black/10 bg-[#171713] p-1.5 shadow-2xl md:hidden">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-xl px-2 py-2 text-[10px] font-medium text-white/60 hover:bg-white/10 hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
