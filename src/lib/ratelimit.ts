import "@/env";
import { Ratelimit } from "@upstash/ratelimit";
import type { Redis } from "@upstash/redis";
import { redis } from "@/lib/redis";

const hasRedis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

/** When Redis is configured, use Upstash rate limit; otherwise allow all (Gemini works without Upstash). */
export const geminiRatelimit = hasRedis
  ? new Ratelimit({
      // `redis` widens to Pick<Redis, "get" | "set"> because of the no-op
      // fallback. This branch only runs when Upstash is configured, so the
      // value here is always a real client.
      redis: redis as Redis,
      limiter: Ratelimit.slidingWindow(10, "60 s"),
      analytics: true,
      prefix: "ratelimit:gemini",
    })
  : {
      limit: async () => ({ success: true, reset: Date.now() + 60_000 }),
    };
