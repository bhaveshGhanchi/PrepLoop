"use client";

import { useState } from "react";
import type { DesignQuestion } from "@/data/hld-questions";
import { saveEntry, type PracticeKind } from "@/lib/practice-store";

type DesignPracticeProps = {
  questions: DesignQuestion[];
  kind: Extract<PracticeKind, "hld" | "lld">;
  notePlaceholder: string;
  accent: "violet" | "orange";
};

const accents = {
  violet: {
    button: "bg-violet-600 hover:bg-violet-500",
    soft: "bg-violet-100 text-violet-800",
    border: "focus:border-violet-500 focus:ring-violet-500/10",
  },
  orange: {
    button: "bg-orange-600 hover:bg-orange-500",
    soft: "bg-orange-100 text-orange-800",
    border: "focus:border-orange-500 focus:ring-orange-500/10",
  },
};

export function DesignPractice({
  questions,
  kind,
  notePlaceholder,
  accent,
}: DesignPracticeProps) {
  const [question, setQuestion] = useState<DesignQuestion>(questions[0]!);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const style = accents[accent];

  function drawQuestion() {
    const available = questions.filter((item) => item.id !== question.id);
    setQuestion(available[Math.floor(Math.random() * available.length)] ?? questions[0]!);
    setNotes("");
    setSaved(false);
  }

  function completePractice() {
    if (!notes.trim()) return;
    saveEntry({
      kind,
      title: question.title,
      detail: notes.trim(),
    });
    setSaved(true);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_18px_50px_rgba(0,0,0,0.06)] sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${style.soft}`}>
            Random prompt
          </span>
          <button
            type="button"
            onClick={drawQuestion}
            className="rounded-full border border-black/10 px-3 py-1.5 text-sm font-medium transition hover:bg-black/5"
          >
            Shuffle prompt ↻
          </button>
        </div>
        <h2 className="mt-7 text-2xl font-semibold tracking-tight">{question.title}</h2>
        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          {question.prompts.map((prompt, index) => (
            <div key={prompt} className="rounded-2xl bg-[#f4f3ee] p-4">
              <span className="text-xs font-semibold text-black/35">0{index + 1}</span>
              <p className="mt-2 text-sm leading-5">{prompt}</p>
            </div>
          ))}
        </div>
        <label className="mt-7 block text-sm font-medium">
          Your design outline
          <textarea
            value={notes}
            onChange={(event) => {
              setNotes(event.target.value);
              setSaved(false);
            }}
            className={`mt-2 min-h-64 w-full resize-y rounded-2xl border border-black/10 bg-[#fbfaf7] p-4 text-sm leading-6 outline-none transition focus:ring-4 ${style.border}`}
            placeholder={notePlaceholder}
          />
        </label>
        <div className="mt-4 flex items-center justify-between gap-4">
          <span className="text-xs text-black/40">
            {notes.trim() ? `${notes.trim().split(/\s+/).length} words` : "Start with requirements"}
          </span>
          <button
            type="button"
            onClick={completePractice}
            disabled={!notes.trim() || saved}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-black/15 ${style.button}`}
          >
            {saved ? "Saved to today ✓" : "Complete practice"}
          </button>
        </div>
      </section>

      <aside className="space-y-4">
        <div className="rounded-3xl bg-[#171713] p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
            Interview loop
          </p>
          <ol className="mt-5 space-y-4 text-sm">
            {[
              "Clarify requirements",
              kind === "hld" ? "Estimate scale" : "Name core objects",
              kind === "hld" ? "Sketch APIs & data" : "Define relationships",
              "Defend trade-offs",
            ].map((item, index) => (
              <li key={item} className="flex gap-3">
                <span className="text-white/35">{index + 1}</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-3xl border border-black/10 bg-transparent p-6">
          <p className="text-sm font-semibold">Practice tip</p>
          <p className="mt-2 text-sm leading-6 text-black/50">
            Time-box your first pass to 25 minutes, then spend five minutes naming
            the weakest assumption.
          </p>
        </div>
      </aside>
    </div>
  );
}
