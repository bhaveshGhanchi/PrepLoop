import { NextResponse } from "next/server";

type LeetCodeResponse = {
  data?: {
    question?: {
      title?: string;
      difficulty?: string;
      topicTags?: Array<{ name?: string }>;
    };
  };
};

function parseProblemUrl(value: string) {
  try {
    const url = new URL(value);
    if (!["leetcode.com", "www.leetcode.com"].includes(url.hostname.toLowerCase())) {
      return null;
    }
    const match = url.pathname.match(/^\/problems\/([a-z0-9-]+)\/?$/i);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { url?: string };
    const slug = typeof body.url === "string" ? parseProblemUrl(body.url) : null;
    if (!slug) {
      return NextResponse.json(
        { error: "Enter a valid LeetCode problem URL." },
        { status: 400 },
      );
    }

    const fallback = {
      title: titleFromSlug(slug),
      difficulty: "",
      tags: [] as string[],
      slug,
      source: "url" as const,
    };

    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Referer: `https://leetcode.com/problems/${slug}/`,
      },
      body: JSON.stringify({
        operationName: "questionData",
        variables: { titleSlug: slug },
        query: `
          query questionData($titleSlug: String!) {
            question(titleSlug: $titleSlug) {
              title
              difficulty
              topicTags { name }
            }
          }
        `,
      }),
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });

    if (!response.ok) return NextResponse.json(fallback);

    const payload = (await response.json()) as LeetCodeResponse;
    const question = payload.data?.question;
    if (!question?.title) return NextResponse.json(fallback);

    return NextResponse.json({
      title: question.title,
      difficulty: question.difficulty ?? "",
      tags: (question.topicTags ?? [])
        .map((tag) => tag.name)
        .filter((tag): tag is string => Boolean(tag))
        .slice(0, 8),
      slug,
      source: "leetcode",
    });
  } catch {
    return NextResponse.json(
      { error: "Could not read this LeetCode problem." },
      { status: 500 },
    );
  }
}
