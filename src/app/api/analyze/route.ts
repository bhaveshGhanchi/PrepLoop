import { NextResponse } from "next/server";

type AnalyzeRequest = {
  kind?: "leetcode" | "behavioral";
  content?: string;
  context?: string;
};

function analyzeCode(code: string, approach: string) {
  const sample = `${code}\n${approach}`.toLowerCase();
  const nestedLoops = /for[\s\S]{0,240}for/.test(sample);
  const sorting = /\.sort\(|sorted\(/.test(sample);
  const recursion = /\b(dfs|bfs|recurse|backtrack)\b/.test(sample);
  const logarithmic = /\bbinary search\b|while\s*\([^)]*(left|right|lo|hi)/.test(sample);
  const hash = /\b(map|set|dict|hashmap|hashset|counter)\b/.test(sample);
  const dp = /\bdynamic programming\b|\bdp\[|memo/.test(sample);
  const heap = /\bheap|priorityqueue|priority_queue/.test(sample);

  let time = "O(n)";
  if (nestedLoops) time = "O(n²)";
  else if (sorting) time = "O(n log n)";
  else if (logarithmic) time = "O(log n)";

  let space = "O(1)";
  if (hash || dp || recursion || heap) space = "O(n)";

  const tags = [
    hash && "Hash table",
    dp && "Dynamic programming",
    heap && "Heap",
    recursion && "Graph / recursion",
    sorting && "Sorting",
    logarithmic && "Binary search",
  ].filter(Boolean) as string[];

  return {
    time,
    space,
    tags: tags.length ? tags.slice(0, 4) : ["Array"],
    explanation:
      "This is a local estimate based on recognizable control-flow and data-structure signals. Verify it against the final algorithm.",
  };
}

function reviewStory(story: string) {
  const words = story.trim().split(/\s+/).filter(Boolean);
  const lower = story.toLowerCase();
  const hasResult = /\b(result|impact|outcome|improved|reduced|increased|saved)\b/.test(lower);
  const hasMetric = /\b\d+([.%x]|\s*(percent|hours|days|users|ms|seconds))?\b/.test(lower);
  const firstPerson = (story.match(/\bI\b/g) ?? []).length;
  const feedback = [
    !hasResult && "Make the result explicit: what changed because of your work?",
    !hasMetric && "Add one concrete number to make the impact credible.",
    firstPerson < 2 && "Use “I” for your decisions and contribution, not only “we.”",
    words.length > 190 && "Trim setup details so the answer lands in about 60–90 seconds.",
    words.length < 70 && "Add the key decision, obstacle, and measurable outcome.",
  ].filter(Boolean) as string[];

  return {
    wordCount: words.length,
    feedback:
      feedback.length > 0
        ? feedback
        : ["Strong structure. Rehearse it aloud and trim any sentence that does not change the outcome."],
    polished: story
      .replace(/\b(very|really|basically|actually)\b\s*/gi, "")
      .replace(/\s{2,}/g, " ")
      .trim(),
  };
}

async function analyzeWithProvider(
  kind: NonNullable<AnalyzeRequest["kind"]>,
  content: string,
  context: string,
) {
  const apiKey = process.env.AI_API_KEY;
  const baseUrl = process.env.AI_BASE_URL;
  const model = process.env.AI_MODEL;
  if (!apiKey || !baseUrl || !model) return null;

  const instruction =
    kind === "leetcode"
      ? "Analyze the submitted algorithm. Return only JSON with time, space, tags (array of up to 4), and explanation. Be conservative and concise."
      : "Proofread this behavioral interview story. Return only JSON with wordCount, feedback (array of concise coaching points), and polished (a clear 60–90 second version preserving facts).";

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: instruction },
        { role: "user", content: `Context:\n${context}\n\nContent:\n${content}` },
      ],
    }),
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) throw new Error(`AI provider returned ${response.status}`);
  const payload = await response.json();
  const text = payload?.choices?.[0]?.message?.content;
  return typeof text === "string" ? JSON.parse(text) : null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AnalyzeRequest;
    if (
      (body.kind !== "leetcode" && body.kind !== "behavioral") ||
      typeof body.content !== "string" ||
      !body.content.trim() ||
      body.content.length > 20_000
    ) {
      return NextResponse.json({ error: "Invalid analysis request." }, { status: 400 });
    }

    const context = typeof body.context === "string" ? body.context.slice(0, 8_000) : "";
    const providerResult = await analyzeWithProvider(
      body.kind,
      body.content,
      context,
    ).catch(() => null);

    const result =
      providerResult ??
      (body.kind === "leetcode"
        ? analyzeCode(body.content, context)
        : reviewStory(body.content));

    return NextResponse.json({
      ...result,
      source: providerResult ? "ai" : "local",
    });
  } catch {
    return NextResponse.json({ error: "Could not analyze this draft." }, { status: 500 });
  }
}
