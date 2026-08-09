export type DesignQuestion = {
  id: string;
  title: string;
  prompts: string[];
};

/** Curated high-level system design prompts */
export const HLD_QUESTIONS: DesignQuestion[] = [
  {
    id: "hld-url-shortener",
    title: "Design a URL shortener",
    prompts: ["Scale to 100M URLs", "Custom aliases", "Analytics clicks"],
  },
  {
    id: "hld-rate-limiter",
    title: "Design a rate limiter",
    prompts: ["Per-user and per-IP", "Distributed", "Token bucket vs sliding window"],
  },
  {
    id: "hld-chat",
    title: "Design a chat application",
    prompts: ["1:1 and group", "Online presence", "Message delivery guarantees"],
  },
  {
    id: "hld-news-feed",
    title: "Design a news feed",
    prompts: ["Fan-out on write vs read", "Ranking", "Media uploads"],
  },
  {
    id: "hld-ride-share",
    title: "Design a ride-sharing service",
    prompts: ["Matching drivers", "ETA", "Surge pricing sketch"],
  },
  {
    id: "hld-video-streaming",
    title: "Design a video streaming platform",
    prompts: ["CDN", "Adaptive bitrate", "Upload pipeline"],
  },
  {
    id: "hld-search",
    title: "Design a search autocomplete",
    prompts: ["Prefix index", "Ranking", "Personalization"],
  },
  {
    id: "hld-notification",
    title: "Design a notification system",
    prompts: ["Push/email/SMS", "Preferences", "At-least-once delivery"],
  },
];

export function randomHldQuestion(): DesignQuestion {
  return HLD_QUESTIONS[Math.floor(Math.random() * HLD_QUESTIONS.length)]!;
}
