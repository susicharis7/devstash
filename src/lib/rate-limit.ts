import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

type Window = Parameters<typeof Ratelimit.slidingWindow>[1];

type RateLimitPolicy =
  | "signIn"
  | "register"
  | "passwordResetRequest"
  | "passwordResetConfirm"
  | "verificationResend";

const POLICIES: Record<RateLimitPolicy, { tokens: number; window: Window }> = {
  signIn: { tokens: 5, window: "15 m" },
  register: { tokens: 3, window: "1 h" },
  passwordResetRequest: { tokens: 3, window: "1 h" },
  passwordResetConfirm: { tokens: 5, window: "15 m" },
  verificationResend: { tokens: 3, window: "15 m" },
};

const FALLBACK_IP = "127.0.0.1";

const LIMIT_TIMEOUT_MS = 1500;

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
  retryAfterSeconds: number;
}

let redis: Redis | null = null;

function getRedis() {
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  redis = new Redis({ url, token });
  return redis;
}

const limiters = new Map<RateLimitPolicy, Ratelimit>();

function getLimiter(policy: RateLimitPolicy) {
  const existing = limiters.get(policy);
  if (existing) return existing;

  const client = getRedis();
  if (!client) return null;

  const { tokens, window } = POLICIES[policy];
  const limiter = new Ratelimit({
    redis: client,
    limiter: Ratelimit.slidingWindow(tokens, window),
    prefix: `devstash:ratelimit:${policy}`,
    timeout: LIMIT_TIMEOUT_MS,
  });

  limiters.set(policy, limiter);
  return limiter;
}

function allow(policy: RateLimitPolicy): RateLimitResult {
  return {
    success: true,
    remaining: POLICIES[policy].tokens,
    reset: 0,
    retryAfterSeconds: 0,
  };
}

export async function checkRateLimit(
  policy: RateLimitPolicy,
  identifier: string
): Promise<RateLimitResult> {
  const limiter = getLimiter(policy);
  if (!limiter) return allow(policy);

  try {
    const { success, remaining, reset } = await limiter.limit(identifier);

    return {
      success,
      remaining,
      reset,
      retryAfterSeconds: Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
    };
  } catch (error) {
    console.error(
      `[rate-limit] ${policy} check failed, allowing the request`,
      error
    );
    return allow(policy);
  }
}

export async function clearRateLimit(
  policy: RateLimitPolicy,
  identifier: string
) {
  const limiter = getLimiter(policy);
  if (!limiter) return;

  try {
    await limiter.resetUsedTokens(identifier);
  } catch (error) {
    console.error(`[rate-limit] could not reset ${policy}`, error);
  }
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const first = forwardedFor?.split(",")[0].trim();
  if (first) return first;

  return request.headers.get("x-real-ip")?.trim() || FALLBACK_IP;
}

export function rateLimitMessage(retryAfterSeconds: number) {
  const minutes = Math.ceil(retryAfterSeconds / 60);
  const unit = minutes === 1 ? "minute" : "minutes";

  return `Too many attempts. Please try again in ${minutes} ${unit}.`;
}

export function rateLimitResponse(result: RateLimitResult) {
  return NextResponse.json(
    { success: false, error: rateLimitMessage(result.retryAfterSeconds) },
    {
      status: 429,
      headers: { "Retry-After": String(result.retryAfterSeconds) },
    }
  );
}
