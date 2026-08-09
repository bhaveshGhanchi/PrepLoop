"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/components/auth-provider";
import {
  deleteEntry,
  readEntries,
  type PracticeEntry,
  type PracticeKind,
} from "@/lib/practice-store";

const kinds: Array<{
  value: "all" | PracticeKind;
  label: string;
  color: string;
}> = [
  { value: "all", label: "All work", color: "bg-[#171713] text-white" },
  { value: "leetcode", label: "LeetCode", color: "bg-lime-200 text-lime-950" },
  { value: "hld", label: "HLD", color: "bg-violet-200 text-violet-950" },
  { value: "lld", label: "LLD", color: "bg-orange-200 text-orange-950" },
  { value: "behavioral", label: "Behavioral", color: "bg-sky-200 text-sky-950" },
];

const kindDetails: Record<
  PracticeKind,
  { label: string; color: string; initial: string }
> = {
  leetcode: { label: "LeetCode", color: "bg-lime-200", initial: "LC" },
  hld: { label: "High-level design", color: "bg-violet-200", initial: "H" },
  lld: { label: "Low-level design", color: "bg-orange-200", initial: "L" },
  behavioral: { label: "Behavioral", color: "bg-sky-200", initial: "B" },
};

function dayKey(date: string) {
  const value = new Date(date);
  return `${value.getFullYear()}-${value.getMonth()}-${value.getDate()}`;
}

function dayLabel(date: string) {
  const value = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (value.toDateString() === today.toDateString()) return "Today";
  if (value.toDateString() === yesterday.toDateString()) return "Yesterday";

  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: value.getFullYear() === today.getFullYear() ? undefined : "numeric",
  }).format(value);
}

export default function HistoryPage() {
  const { user, syncNow } = useAuth();
  const [entries, setEntries] = useState<PracticeEntry[]>([]);
  const [filter, setFilter] = useState<"all" | PracticeKind>("all");
  const [query, setQuery] = useState("");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

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

  const visibleEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return entries.filter((entry) => {
      const matchesKind = filter === "all" || entry.kind === filter;
      const matchesQuery =
        !normalizedQuery ||
        entry.title.toLowerCase().includes(normalizedQuery) ||
        entry.detail.toLowerCase().includes(normalizedQuery) ||
        entry.difficulty?.toLowerCase().includes(normalizedQuery) ||
        entry.tags?.some((tag) => tag.toLowerCase().includes(normalizedQuery)) ||
        entry.approach?.toLowerCase().includes(normalizedQuery) ||
        entry.code?.toLowerCase().includes(normalizedQuery);
      return matchesKind && matchesQuery;
    });
  }, [entries, filter, query]);

  const groups = useMemo(() => {
    const grouped = new Map<string, PracticeEntry[]>();
    visibleEntries.forEach((entry) => {
      const key = dayKey(entry.createdAt);
      grouped.set(key, [...(grouped.get(key) ?? []), entry]);
    });
    return [...grouped.values()];
  }, [visibleEntries]);

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);
  const thisWeek = entries.filter(
    (entry) => new Date(entry.createdAt) >= weekStart,
  ).length;
  const categories = new Set(entries.map((entry) => entry.kind)).size;

  function removeEntry(id: string) {
    deleteEntry(id);
    setPendingDelete(null);
  }

  return (
    <AppShell
      eyebrow="Practice log"
      title="Your work, in one place."
      description="Review every coding, design, and behavioral session, synced across your devices."
    >
      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Total sessions", value: entries.length },
          { label: "Last 7 days", value: thisWeek },
          { label: "Areas practiced", value: categories },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-black/10 bg-white px-5 py-4"
          >
            <p className="text-xs font-medium text-black/40">{stat.label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      <section className="mt-5 rounded-3xl border border-black/10 bg-white p-5 shadow-[0_18px_50px_rgba(0,0,0,0.05)] sm:p-7">
        <div className="flex flex-col gap-4 border-b border-black/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {kinds.map((kind) => {
              const active = filter === kind.value;
              return (
                <button
                  key={kind.value}
                  type="button"
                  onClick={() => setFilter(kind.value)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? kind.color
                      : "bg-[#f4f3ee] text-black/45 hover:text-black"
                  }`}
                >
                  {kind.label}
                </button>
              );
            })}
          </div>
          <label className="relative block lg:w-64">
            <span className="sr-only">Search practice history</span>
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-black/30">
              ⌕
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full rounded-xl border border-black/10 bg-[#fbfaf7] py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-lime-500 focus:ring-4 focus:ring-lime-500/10"
              placeholder="Search your work"
            />
          </label>
        </div>

        {groups.length > 0 ? (
          <div className="mt-7 space-y-9">
            {groups.map((group) => (
              <div key={dayKey(group[0]!.createdAt)}>
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-semibold">
                    {dayLabel(group[0]!.createdAt)}
                  </h2>
                  <span className="text-xs text-black/35">
                    {group.length} {group.length === 1 ? "session" : "sessions"}
                  </span>
                  <span className="h-px flex-1 bg-black/10" />
                </div>
                <div className="mt-3 divide-y divide-black/10">
                  {group.map((entry) => {
                    const detail = kindDetails[entry.kind];
                    const deleting = pendingDelete === entry.id;
                    return (
                      <article
                        key={entry.id}
                        className="grid gap-3 py-5 sm:grid-cols-[48px_1fr_auto] sm:items-start"
                      >
                        <span
                          className={`grid size-11 place-items-center rounded-xl text-xs font-bold ${detail.color}`}
                        >
                          {detail.initial}
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <h3 className="font-semibold">{entry.title}</h3>
                            <span className="text-xs text-black/35">
                              {new Intl.DateTimeFormat("en", {
                                hour: "numeric",
                                minute: "2-digit",
                              }).format(new Date(entry.createdAt))}
                            </span>
                          </div>
                          <p className="mt-1 text-xs font-medium text-black/35">
                            {detail.label}
                          </p>
                          {(entry.difficulty || entry.tags?.length) && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {entry.difficulty && (
                                <span className="rounded-full bg-black/5 px-2.5 py-1 text-xs font-semibold">
                                  {entry.difficulty}
                                </span>
                              )}
                              {entry.tags?.map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full bg-lime-100 px-2.5 py-1 text-xs text-lime-900"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-black/55">
                            {entry.detail}
                          </p>
                          {(entry.approach || entry.code) && (
                            <details className="mt-4 overflow-hidden rounded-2xl border border-black/10 bg-[#fbfaf7]">
                              <summary className="cursor-pointer px-4 py-3 text-sm font-semibold marker:text-black/30">
                                Review approach & code
                              </summary>
                              <div className="space-y-5 border-t border-black/10 p-4">
                                {entry.approach && (
                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/35">
                                      Approach
                                    </p>
                                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-black/65">
                                      {entry.approach}
                                    </p>
                                  </div>
                                )}
                                {entry.code && (
                                  <div>
                                    <div className="flex items-center justify-between">
                                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/35">
                                        Accepted code
                                      </p>
                                      {entry.language && (
                                        <span className="text-xs text-black/35">
                                          {entry.language}
                                        </span>
                                      )}
                                    </div>
                                    <pre className="mt-2 max-h-96 overflow-auto rounded-xl bg-[#171713] p-4 text-xs leading-5 text-white/80">
                                      <code>{entry.code}</code>
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </details>
                          )}
                          {entry.problemUrl && /^https?:\/\//i.test(entry.problemUrl) && (
                            <a
                              href={entry.problemUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-3 inline-flex text-xs font-semibold underline underline-offset-4"
                            >
                              Open problem ↗
                            </a>
                          )}
                        </div>
                        <div className="flex justify-end gap-2">
                          {deleting ? (
                            <>
                              <button
                                type="button"
                                onClick={() => setPendingDelete(null)}
                                className="rounded-lg px-2.5 py-1.5 text-xs text-black/45 hover:bg-black/5"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => removeEntry(entry.id)}
                                className="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                              >
                                Delete
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setPendingDelete(entry.id)}
                              className="rounded-lg px-2.5 py-1.5 text-xs text-black/30 hover:bg-red-50 hover:text-red-700"
                              aria-label={`Delete ${entry.title}`}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid min-h-72 place-items-center text-center">
            <div>
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-lime-200 font-semibold">
                P
              </span>
              <h2 className="mt-4 font-semibold">
                {entries.length ? "No matching work" : "Your practice log is empty"}
              </h2>
              <p className="mt-2 text-sm text-black/45">
                {entries.length
                  ? "Try another filter or search."
                  : "Complete and save a practice session to see it here."}
              </p>
              {!entries.length && (
                <Link
                  href="/"
                  className="mt-5 inline-flex rounded-xl bg-[#171713] px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Start today’s loop
                </Link>
              )}
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
}
