import { Redis } from '@upstash/redis';
import { Ratelimit, type Duration } from '@upstash/ratelimit';
import { NextResponse } from 'next/server';

interface Limiter {
  limit(key: string): Promise<{ success: boolean; reset: number }>;
}

const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

if (!redis) {
  console.warn('[ratelimit] Upstash is not configured: rate limiting is disabled.');
}

// Without Upstash (local dev, previews) or when Redis errors, requests go
// through: a Redis outage must not lock everybody out of their account.
function createLimiter(prefix: string, requests: number, window: Duration): Limiter {
  if (!redis) return { limit: async () => ({ success: true, reset: 0 }) };

  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix,
    analytics: true,
  });

  return {
    async limit(key) {
      try {
        const { success, reset } = await ratelimit.limit(key);
        return { success, reset };
      } catch (error) {
        console.error(`[ratelimit] ${prefix} failed, letting the request through`, error);
        return { success: true, reset: 0 };
      }
    },
  };
}

export const registerLimit = createLimiter('rl:register', 5, '5 m');
export const loginLimit = createLimiter('rl:login', 10, '5 m');
// Anything that sends an email (password reset, verification resend).
export const emailLimit = createLimiter('rl:email', 5, '15 m');
// Actions that check the current password of a logged-in user, keyed by user id.
export const accountLimit = createLimiter('rl:account', 10, '15 m');

export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

export function tooManyRequests(reset: number, message = 'Trop de tentatives. Réessayez dans quelques minutes.') {
  const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
  return NextResponse.json(
    { error: message },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } },
  );
}
