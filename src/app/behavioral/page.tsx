"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { saveEntry } from "@/lib/practice-store";

type Review = {
  wordCount: number;
  feedback: string[];
  polished: string;
  source: "ai" | "local";
};

const starFields = [
  {
    key: "situation",
    letter: "S",
    label: "Situation",
    prompt: "Set the scene in one or two sentences. What made it difficult?",
  },
  {
    key: "task",
    letter: "T",
    label: "Task",
    prompt: "What outcome were you responsible for?",
  },
  {
    key: "action",
    letter: "A",
    label: "Action",
    prompt: "What did you decide and do? Be specific about your contribution.",
  },
  {
    key: "result",
    letter: "R",
    label: "Result",
    prompt: "What changed? Include a number and what you learned.",
  },
] as const;

export default function BehavioralPage() {
  const [title, setTitle] = useState("");
  const [story, setStory] = useState({
    situation: "",
    task: "",
    action: "",
    result: "",
  });
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const complete = title.trim() && Object.values(story).every((value) => value.trim());
  const combinedStory = starFields
    .map((field) => `${field.label}: ${story[field.key].trim()}`)
    .join("\n\n");

  async function proofread() {
    if (!complete) return;
    setLoading(true);
    setReview(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "behavioral",
          content: combinedStory,
          context: title,
        }),
      });
      if (!response.ok) throw new Error("Review failed");
      setReview((await response.json()) as Review);
    } finally {
      setLoading(false);
    }
  }

  function saveStory() {
    if (!review || saved) return;
    saveEntry({
      kind: "behavioral",
      title: title.trim(),
      detail: review.polished,
    });
    setSaved(true);
  }

  return (
    <AppShell
      eyebrow="Story studio"
      title="Make your impact memorable."
      description="Build a STAR story with enough context, clear ownership, and a result an interviewer can repeat."
      accent="sky"
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_18px_50px_rgba(0,0,0,0.06)] sm:p-8">
          <label className="block text-sm font-medium">
            Story title
            <input
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setReview(null);
                setSaved(false);
              }}
              className="mt-2 w-full rounded-2xl border border-black/10 bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
              placeholder="A production incident I turned into a safer release process"
            />
          </label>

          <div className="mt-7 space-y-4">
            {starFields.map((field) => (
              <label
                key={field.key}
                className="grid gap-3 rounded-2xl border border-black/10 p-4 sm:grid-cols-[42px_1fr]"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-sky-200 font-semibold text-sky-950">
                  {field.letter}
                </span>
                <span>
                  <span className="text-sm font-semibold">{field.label}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-black/40">
                    {field.prompt}
                  </span>
                  <textarea
                    value={story[field.key]}
                    onChange={(event) => {
                      setStory((current) => ({
                        ...current,
                        [field.key]: event.target.value,
                      }));
                      setReview(null);
                      setSaved(false);
                    }}
                    rows={3}
                    className="mt-3 w-full resize-y border-0 bg-transparent text-sm leading-6 outline-none placeholder:text-black/25"
                    placeholder={`Write the ${field.label.toLowerCase()}…`}
                  />
                </span>
              </label>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-black/40">
              {Object.values(story).filter((value) => value.trim()).length}/4 sections complete
            </p>
            <button
              type="button"
              onClick={proofread}
              disabled={!complete || loading}
              className="rounded-xl bg-sky-300 px-5 py-3 text-sm font-semibold text-sky-950 transition hover:bg-sky-200 disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-black/30"
            >
              {loading ? "Polishing story…" : "Proofread & polish"}
            </button>
          </div>
        </section>

        <aside>
          {review ? (
            <div className="sticky top-6 space-y-4">
              <section className="rounded-3xl bg-[#171713] p-6 text-white">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">
                    Coach notes
                  </p>
                  <span className="text-[10px] uppercase tracking-wider text-white/35">
                    {review.source === "ai" ? "AI" : "Local review"}
                  </span>
                </div>
                <p className="mt-3 text-sm text-white/45">
                  {review.wordCount} words · about {Math.max(1, Math.round(review.wordCount / 140))} min
                </p>
                <ul className="mt-5 space-y-4">
                  {review.feedback.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-6">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-sky-300" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
              <section className="rounded-3xl border border-black/10 bg-white p-6">
                <p className="text-sm font-semibold">Polished version</p>
                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-black/55">
                  {review.polished}
                </p>
                <button
                  type="button"
                  onClick={saveStory}
                  disabled={saved}
                  className="mt-5 w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm font-semibold hover:bg-black/5 disabled:text-emerald-600"
                >
                  {saved ? "Saved to today ✓" : "Save story"}
                </button>
              </section>
            </div>
          ) : (
            <div className="rounded-3xl bg-[#171713] p-6 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">
                60-second test
              </p>
              <p className="mt-4 text-xl font-medium leading-8">
                Can they repeat your decision and its impact after the interview?
              </p>
              <div className="mt-6 space-y-3 border-t border-white/10 pt-5 text-sm text-white/55">
                <p>✓ Keep setup under 20%</p>
                <p>✓ Say “I” for your actions</p>
                <p>✓ Quantify the result</p>
                <p>✓ End with the lesson</p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </AppShell>
  );
}
