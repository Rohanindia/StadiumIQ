/**
 * @fileoverview Token bucket rate limiter for Gemini API calls.
 * Limits to N calls per time window per session (in-memory, no storage).
 * All functions are pure with no side effects on external state.
 */

import type { TokenBucketState } from '@/types';

/**
 * Creates a new token bucket state object.
 *
 * @param maxTokens - Maximum number of tokens (calls allowed per window)
 * @param windowMs - Time window in milliseconds
 * @returns Initial token bucket state
 *
 * @example
 * const bucket = createTokenBucket(10, 60_000); // 10 calls per minute
 */
export function createTokenBucket(maxTokens: number, _windowMs: number): TokenBucketState {
  return {
    tokens: maxTokens,
    lastRefill: Date.now(),
  };
}

/**
 * Refills tokens based on elapsed time since last refill.
 * Returns a new state object (pure function — does not mutate input).
 *
 * @param state - Current token bucket state
 * @param maxTokens - Maximum number of tokens
 * @param windowMs - Time window in milliseconds
 * @returns Updated token bucket state with refilled tokens
 *
 * @example
 * const newState = refillTokens(bucket, 10, 60_000);
 */
export function refillTokens(
  state: TokenBucketState,
  maxTokens: number,
  windowMs: number
): TokenBucketState {
  const now = Date.now();
  const elapsed = now - state.lastRefill;

  if (elapsed >= windowMs) {
    return { tokens: maxTokens, lastRefill: now };
  }

  // Gradually refill proportional to elapsed time
  const refillAmount = Math.floor((elapsed / windowMs) * maxTokens);
  const newTokens = Math.min(maxTokens, state.tokens + refillAmount);

  if (refillAmount > 0) {
    return { tokens: newTokens, lastRefill: now };
  }

  return state;
}

/**
 * Attempts to consume one token from the bucket.
 * Mutates the provided state object in place (intended for singleton bucket use).
 *
 * @param state - Token bucket state to consume from (mutated)
 * @param maxTokens - Maximum tokens (for refill calculation)
 * @param windowMs - Time window in milliseconds (default: 60000)
 * @returns true if a token was consumed, false if rate limit exceeded
 *
 * @example
 * const allowed = consumeToken(bucket); // returns false when limit exceeded
 */
export function consumeToken(
  state: TokenBucketState,
  maxTokens = 10,
  windowMs = 60_000
): boolean {
  const refilled = refillTokens(state, maxTokens, windowMs);
  state.tokens = refilled.tokens;
  state.lastRefill = refilled.lastRefill;

  if (state.tokens <= 0) {
    return false;
  }

  state.tokens -= 1;
  return true;
}

/**
 * Returns the number of milliseconds until the next token is available.
 *
 * @param state - Current token bucket state
 * @param windowMs - Time window in milliseconds
 * @returns Milliseconds to wait, or 0 if tokens are available
 *
 * @example
 * const waitMs = getWaitTimeMs(bucket, 60_000); // e.g. 5432
 */
export function getWaitTimeMs(state: TokenBucketState, windowMs = 60_000): number {
  if (state.tokens > 0) return 0;
  const elapsed = Date.now() - state.lastRefill;
  return Math.max(0, windowMs - elapsed);
}
