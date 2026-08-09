"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { saveEntry } from "@/lib/practice-store";

type Analysis = {
  time: string;
  space: string;
  tags: string[];
  explanation: string;
  source: "ai" | "local";
};

type ProblemMetadata = {
  title: string;
  difficulty: string;
  tags: string[];
  source: "leetcode" | "url";
};

function isLeetCodeProblemUrl(value: string) {
  try {
    const normalized = /^https?:\/\//i.test(value)
      ? value
      : `https://${value.replace(/^\/+/, "")}`;
    const url = new URL(normalized);
    return (
      ["leetcode.com", "www.leetcode.com"].includes(url.hostname.toLowerCase()) &&
      /^\/problems\/[a-z0-9-]+(?:\/.*)?$/i.test(url.pathname)
    );
  } catch {
    return false;
  }
}

export default function LeetcodePage() {
  const [problem, setProblem] = useState("");
  const [problemTitle, setProblemTitle] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [metadataStatus, setMetadataStatus] = useState("");
  const [approach, setApproach] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("TypeScript");
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [saved, setSaved] = useState(false);

  const resolvedTitle = problemTitle.trim() || problem.trim();
  const ready = resolvedTitle.length > 2 && approach.trim().length >= 30;

  async function extractMetadata(value = problem) {
    if (!isLeetCodeProblemUrl(value)) return;
    setMetadataLoading(true);
    setMetadataStatus("");
    try {
      const response = await fetch("/api/leetcode-problem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: value.trim() }),
      });
      if (!response.ok) throw new Error("Metadata lookup failed");
      const metadata = (await response.json()) as ProblemMetadata;
      setProblemTitle(metadata.title);
      setDifficulty(metadata.difficulty);
      setTagInput(metadata.tags.join(", "));
      setMetadataStatus(
        metadata.source === "leetcode"
          ? "Name, difficulty, and topics added from LeetCode."
          : "Name added from the URL. Add difficulty or topics if needed.",
      );
    } catch {
      setMetadataStatus("Could not fetch metadata. You can add it manually.");
    } finally {
      setMetadataLoading(false);
    }
  }

  function startProblem() {
    if (!ready) return;
    setStarted(true);
    if (/^https?:\/\//i.test(problem.trim())) {
      window.open(problem.trim(), "_blank", "noopener,noreferrer");
    }
  }

  async function analyzeSolution() {
    if (!code.trim()) return;
    setLoading(true);
    setAnalysis(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "leetcode",
          content: code,
          context: approach,
        }),
      });
      if (!response.ok) throw new Error("Analysis failed");
      setAnalysis((await response.json()) as Analysis);
    } finally {
      setLoading(false);
    }
  }

  function saveSession() {
    if (!analysis || saved) return;
    saveEntry({
      kind: "leetcode",
      title: resolvedTitle,
      detail: `${analysis.time} time · ${analysis.space} space`,
      difficulty: difficulty || undefined,
      tags: [
        ...new Set([
          ...tagInput
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          ...analysis.tags,
        ]),
      ],
      problemUrl: /^https?:\/\//i.test(problem.trim()) ? problem.trim() : undefined,
      approach: approach.trim(),
      code: code.trim(),
      language,
    });
    setSaved(true);
  }

  return (
    <AppShell
      eyebrow="Approach first"
      title="Solve deliberately."
      description="Write the idea before you reach for code. PrepLoop unlocks LeetCode only after your approach is concrete."
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_18px_50px_rgba(0,0,0,0.06)] sm:p-8">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-black/35">
            <span className={`grid size-6 place-items-center rounded-full ${started ? "bg-lime-300 text-black" : "bg-black text-white"}`}>
              1
            </span>
            Commit to the plan
          </div>
          <div className="mt-6 space-y-5">
            <label className="block text-sm font-medium">
              Problem URL or title
              <input
                value={problem}
                onChange={(event) => {
                  const value = event.target.value;
                  setProblem(value);
                  setSaved(false);
                  setMetadataStatus("");
                  if (!/^https?:\/\//i.test(value)) {
                    setProblemTitle(value);
                    setDifficulty("");
                    setTagInput("");
                  }
                }}
                onPaste={(event) => {
                  const value = event.clipboardData.getData("text");
                  if (isLeetCodeProblemUrl(value)) {
                    window.setTimeout(() => void extractMetadata(value), 0);
                  }
                }}
                onBlur={() => void extractMetadata()}
                disabled={started}
                className="mt-2 w-full rounded-2xl border border-black/10 bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-lime-500 focus:ring-4 focus:ring-lime-500/10 disabled:text-black/45"
                placeholder="Two Sum or https://leetcode.com/problems/..."
              />
            </label>
            {isLeetCodeProblemUrl(problem) && !started && (
              <div className="-mt-3 flex items-center justify-between gap-3">
                <span className="text-xs text-black/40">
                  {metadataLoading
                    ? "Reading LeetCode metadata…"
                    : metadataStatus || "Metadata will load when you leave the URL field."}
                </span>
                <button
                  type="button"
                  onClick={() => void extractMetadata()}
                  disabled={metadataLoading}
                  className="shrink-0 text-xs font-semibold underline underline-offset-4 disabled:text-black/30"
                >
                  Fetch now
                </button>
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-medium sm:col-span-2">
                Problem name
                <input
                  value={problemTitle}
                  onChange={(event) => setProblemTitle(event.target.value)}
                  disabled={started}
                  className="mt-2 w-full rounded-xl border border-black/10 bg-[#fbfaf7] px-3 py-2.5 text-sm outline-none focus:border-lime-500 disabled:text-black/45"
                  placeholder="Optional for non-LeetCode links"
                />
              </label>
              <label className="block text-sm font-medium">
                Difficulty <span className="font-normal text-black/35">· optional</span>
                <select
                  value={difficulty}
                  onChange={(event) => setDifficulty(event.target.value)}
                  disabled={started}
                  className="mt-2 w-full rounded-xl border border-black/10 bg-[#fbfaf7] px-3 py-2.5 text-sm outline-none focus:border-lime-500 disabled:text-black/45"
                >
                  <option value="">Not set</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </label>
              <label className="block text-sm font-medium">
                Type / topics <span className="font-normal text-black/35">· optional</span>
                <input
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  disabled={started}
                  className="mt-2 w-full rounded-xl border border-black/10 bg-[#fbfaf7] px-3 py-2.5 text-sm outline-none focus:border-lime-500 disabled:text-black/45"
                  placeholder="Array, Graph, Dynamic Programming"
                />
              </label>
            </div>
            <label className="block text-sm font-medium">
              Your approach
              <textarea
                value={approach}
                onChange={(event) => setApproach(event.target.value)}
                disabled={started}
                className="mt-2 min-h-40 w-full resize-y rounded-2xl border border-black/10 bg-[#fbfaf7] p-4 text-sm leading-6 outline-none transition focus:border-lime-500 focus:ring-4 focus:ring-lime-500/10 disabled:text-black/45"
                placeholder="Start with brute force, identify the bottleneck, then explain the key optimization and invariant…"
              />
            </label>
            {!started && (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-black/40">
                  {approach.trim().length < 30
                    ? `${30 - approach.trim().length} more characters to unlock`
                    : "Approach looks concrete"}
                </span>
                <button
                  type="button"
                  onClick={startProblem}
                  disabled={!ready}
                  className="rounded-xl bg-[#171713] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-black/15"
                >
                  Open problem ↗
                </button>
              </div>
            )}
          </div>

          {started && (
            <div className="mt-9 border-t border-black/10 pt-8">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-black/35">
                <span className="grid size-6 place-items-center rounded-full bg-black text-white">
                  2
                </span>
                Review the solution
              </div>
              <div className="mt-6 flex gap-3">
                <label className="block flex-1 text-sm font-medium">
                  Language
                  <select
                    value={language}
                    onChange={(event) => setLanguage(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-black/10 bg-[#fbfaf7] px-3 py-2.5 outline-none"
                  >
                    {["TypeScript", "JavaScript", "Python", "Java", "C++", "Go"].map(
                      (item) => (
                        <option key={item}>{item}</option>
                      ),
                    )}
                  </select>
                </label>
                <div className="flex flex-1 items-end">
                  <div className="w-full rounded-xl border border-dashed border-black/15 px-3 py-2.5 text-xs text-black/40">
                    Extension sync · later
                  </div>
                </div>
              </div>
              <label className="mt-5 block text-sm font-medium">
                Accepted code
                <textarea
                  value={code}
                  onChange={(event) => {
                    setCode(event.target.value);
                    setAnalysis(null);
                    setSaved(false);
                  }}
                  spellCheck={false}
                  className="mt-2 min-h-64 w-full resize-y rounded-2xl border border-black/10 bg-[#171713] p-4 font-mono text-[13px] leading-6 text-white/85 outline-none focus:border-lime-500"
                  placeholder={`// Paste your accepted ${language} solution`}
                />
              </label>
              <button
                type="button"
                onClick={analyzeSolution}
                disabled={!code.trim() || loading}
                className="mt-4 rounded-xl bg-lime-300 px-5 py-3 text-sm font-semibold text-lime-950 transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-black/30"
              >
                {loading ? "Analyzing…" : "Analyze complexity & tags"}
              </button>
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="rounded-3xl bg-[#171713] p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lime-300">
              Why the gate?
            </p>
            <p className="mt-4 text-lg font-medium leading-7">
              Retrieval builds skill. Recognition only builds confidence.
            </p>
            <p className="mt-3 text-sm leading-6 text-white/45">
              Writing first exposes the exact gap before the editor can hide it.
            </p>
          </div>

          {analysis ? (
            <div className="rounded-3xl border border-black/10 bg-white p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Complexity review</p>
                <span className="text-[10px] uppercase tracking-wider text-black/35">
                  {analysis.source === "ai" ? "AI" : "Local estimate"}
                </span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <div className="rounded-2xl bg-[#f4f3ee] p-4">
                  <p className="text-xs text-black/40">Time</p>
                  <p className="mt-1 font-mono text-lg font-semibold">{analysis.time}</p>
                </div>
                <div className="rounded-2xl bg-[#f4f3ee] p-4">
                  <p className="text-xs text-black/40">Space</p>
                  <p className="mt-1 font-mono text-lg font-semibold">{analysis.space}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {analysis.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-lime-100 px-2.5 py-1 text-xs font-medium text-lime-900">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-xs leading-5 text-black/45">{analysis.explanation}</p>
              <button
                type="button"
                onClick={saveSession}
                disabled={saved}
                className="mt-5 w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm font-semibold hover:bg-black/5 disabled:text-emerald-600"
              >
                {saved ? "Saved to today ✓" : "Save session"}
              </button>
            </div>
          ) : (
            <div className="rounded-3xl border border-black/10 p-6">
              <p className="text-sm font-semibold">Session flow</p>
              <ol className="mt-4 space-y-3 text-sm text-black/50">
                <li>1. Write the approach</li>
                <li>2. Solve on LeetCode</li>
                <li>3. Paste accepted code</li>
                <li>4. Review complexity & tags</li>
              </ol>
            </div>
          )}
        </aside>
      </div>
    </AppShell>
  );
}
