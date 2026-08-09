"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/components/auth-provider";
import {
  entriesCompletedToday,
  readEntries,
  type PracticeEntry,
  type PracticeKind,
} from "@/lib/practice-store";

const loops: Array<{
  href: string;
  kind: PracticeKind;
  step: string;
  title: string;
  description: string;
  color: string;
}> = [
  {
    href: "/leetcode",
    kind: "leetcode",
    step: "01",
    title: "Solve with intent",
    description: "Commit to an approach before opening the problem.",
    color: "bg-lime-300",
  },
  {
    href: "/hld",
    kind: "hld",
    step: "02",
    title: "Think in systems",
    description: "Random architecture prompt with a repeatable framework.",
    color: "bg-violet-300",
  },
  {
    href: "/lld",
    kind: "lld",
    step: "03",
    title: "Model the details",
    description: "Classes, interfaces, patterns, and trade-offs.",
    color: "bg-orange-300",
  },
  {
    href: "/behavioral",
    kind: "behavioral",
    step: "04",
    title: "Tell a crisp story",
    description: "Shape a STAR draft into a strong 60-second answer.",
    color: "bg-sky-300",
  },
];

export default function Home() {
  const { user, syncNow } = useAuth();
  const [entries, setEntries] = useState<PracticeEntry[]>([]);

  useEffect(() => {
    const refresh = () => setEntries(readEntries());
    const refreshFromCloud = () => {
      refresh();
      if (user) void syncNow();
    };
    refresh();
    window.addEventListener("preploop:updated", refresh);
    window.addEventListener("focus", refreshFromCloud);
    return () => {
      window.removeEventListener("preploop:updated", refresh);
      window.removeEventListener("focus", refreshFromCloud);
    };
  }, [syncNow, user]);

  const today = entriesCompletedToday(entries);

  return (
    <AppShell
      eyebrow="Today’s loop"
      title="Practice the part that matters."
      description="A focused workspace for coding, design, and behavioral interviews. Applications stay in Jobright."
    >
      <section className="grid gap-4 md:grid-cols-2">
        {loops.map((loop) => {
          const complete = today.some((entry) => entry.kind === loop.kind);
          return (
            <Link
              key={loop.href}
              href={loop.href}
              className="group relative min-h-56 overflow-hidden rounded-3xl border border-black/10 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.09)] sm:p-7"
            >
              <div className="flex items-start justify-between">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${loop.color}`}>
                  {loop.step}
                </span>
                <span
                  className={`text-xs font-semibold ${complete ? "text-emerald-600" : "text-black/30"}`}
                >
                  {complete ? "Complete ✓" : "Open ↗"}
                </span>
              </div>
              <div className="mt-12">
                <h2 className="text-2xl font-semibold tracking-[-0.03em]">
                  {loop.title}
                </h2>
                <p className="mt-2 max-w-sm text-sm leading-6 text-black/50">
                  {loop.description}
                </p>
              </div>
              <span
                className={`absolute -bottom-12 -right-10 size-32 rounded-full opacity-0 blur-2xl transition duration-300 group-hover:opacity-60 ${loop.color}`}
              />
            </Link>
          );
        })}
      </section>

      <section className="mt-5 grid gap-5 rounded-3xl bg-[#171713] p-6 text-white sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
        <div>
          <p className="text-sm font-medium text-lime-300">Daily momentum</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">
            {today.length === 0
              ? "One focused rep is enough to start."
              : `${today.length} practice ${today.length === 1 ? "session" : "sessions"} logged today.`}
          </p>
          <p className="mt-2 text-sm text-white/45">
            Your work is stored locally in this browser.
          </p>
        </div>
        <div className="flex gap-2">
          {loops.map((loop) => (
            <span
              key={loop.kind}
              title={loop.title}
              className={`size-3 rounded-full ${
                today.some((entry) => entry.kind === loop.kind)
                  ? loop.color
                  : "bg-white/15"
              }`}
            />
          ))}
        </div>
      </section>
    </AppShell>
  );
}
