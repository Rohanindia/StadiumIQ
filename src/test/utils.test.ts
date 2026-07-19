/**
 * @fileoverview Comprehensive utility tests — carbon, format, rateLimit, sanitize.
 */
import { describe, it, expect } from 'vitest';
import {
  calculateTravelCarbon,
  calculateFoodCarbon,
  toCarEquivalentKm,
  computeCarbonFootprint,
  generateOffsetOptions,
  getCarbonLabel,
  getCarbonHexColor,
} from '@/utils/carbon';
import {
  formatTime,
  formatDate,
  formatRelativeTime,
  formatPercent,
  formatCarbon,
  formatEta,
  getOccupancyStatus,
  generateId,
  clamp,
} from '@/utils/format';
import {
  createTokenBucket,
  refillTokens,
  consumeToken,
  getWaitTimeMs,
} from '@/utils/rateLimit';
import { sanitizeAndTruncate } from '@/utils/sanitize';

// ── Carbon utility tests ──────────────────────────────────────────────────────

describe('calculateTravelCarbon', () => {
  it('calculates round-trip car emissions correctly', () => {
    const result = calculateTravelCarbon('car', 25);
    // 25 * 2 * 0.171 = 8.55
    expect(result).toBeCloseTo(8.55, 2);
  });

  it('returns 0 for walking mode', () => {
    expect(calculateTravelCarbon('walk', 10)).toBe(0);
  });

  it('returns 0 for biking mode', () => {
    expect(calculateTravelCarbon('bike', 100)).toBe(0);
  });

  it('returns 0 for negative distance', () => {
    expect(calculateTravelCarbon('car', -5)).toBe(0);
  });

  it('calculates bus emissions', () => {
    const result = calculateTravelCarbon('bus', 20);
    expect(result).toBeCloseTo(3.56, 2);
  });

  it('calculates metro emissions', () => {
    const result = calculateTravelCarbon('metro', 10);
    expect(result).toBeCloseTo(0.82, 2);
  });

  it('calculates flight emissions', () => {
    const result = calculateTravelCarbon('flight', 500);
    expect(result).toBeCloseTo(255, 0);
  });

  it('falls back to car factor for unknown mode', () => {
    const result = calculateTravelCarbon('helicopter', 10);
    // should fall back to car: 10 * 2 * 0.171 = 3.42
    expect(result).toBeCloseTo(3.42, 2);
  });
});

describe('calculateFoodCarbon', () => {
  it('calculates meat meal emissions', () => {
    expect(calculateFoodCarbon('meat', 2)).toBeCloseTo(13.22, 2);
  });

  it('calculates vegetarian meal emissions', () => {
    expect(calculateFoodCarbon('vegetarian', 1)).toBeCloseTo(2.85, 2);
  });

  it('calculates vegan meal emissions', () => {
    expect(calculateFoodCarbon('vegan', 3)).toBeCloseTo(4.71, 2);
  });

  it('returns 0 for zero meals', () => {
    expect(calculateFoodCarbon('meat', 0)).toBe(0);
  });

  it('returns 0 for negative meals', () => {
    expect(calculateFoodCarbon('meat', -1)).toBe(0);
  });
});

describe('toCarEquivalentKm', () => {
  it('converts kg CO2 to car equivalent km', () => {
    // 3.42 / 0.171 = 20km
    expect(toCarEquivalentKm(3.42)).toBeCloseTo(20, 0);
  });

  it('returns 0 for zero or negative values', () => {
    expect(toCarEquivalentKm(0)).toBe(0);
    expect(toCarEquivalentKm(-5)).toBe(0);
  });
});

describe('computeCarbonFootprint', () => {
  it('computes full footprint correctly', () => {
    const result = computeCarbonFootprint({
      transportMode: 'car',
      distanceKm: 30,
      mealType: 'meat',
      numberOfMeals: 2,
    });
    expect(result.travelKgCO2).toBeGreaterThan(0);
    expect(result.foodKgCO2).toBeGreaterThan(0);
    expect(result.totalKgCO2).toBeCloseTo(result.travelKgCO2 + result.foodKgCO2, 2);
    expect(result.equivalentKm).toBeGreaterThan(0);
    expect(result.offsetOptions.length).toBeGreaterThan(0);
  });

  it('generates zero-carbon footprint for walk + vegan', () => {
    const result = computeCarbonFootprint({
      transportMode: 'walk',
      distanceKm: 10,
      mealType: 'vegan',
      numberOfMeals: 0,
    });
    expect(result.travelKgCO2).toBe(0);
    expect(result.totalKgCO2).toBe(0);
  });
});

describe('generateOffsetOptions', () => {
  it('returns zero-emission message for 0 kg CO2', () => {
    const options = generateOffsetOptions(0);
    expect(options[0]).toContain('zero');
  });

  it('returns offset options for positive footprint', () => {
    const options = generateOffsetOptions(10);
    expect(options.length).toBeGreaterThanOrEqual(3);
    expect(options[0]).toContain('tree');
  });

  it('includes plant-based tip for very high footprint', () => {
    const options = generateOffsetOptions(20);
    expect(options.some((o) => o.includes('plant-based'))).toBe(true);
  });
});

describe('getCarbonLabel', () => {
  it.each([
    [0, 'Minimal'],
    [1, 'Low'],
    [5, 'Moderate'],
    [12, 'High'],
    [20, 'Very High'],
  ])('returns %s for %s kg CO2', (kg, label) => {
    expect(getCarbonLabel(kg)).toBe(label);
  });
});

describe('getCarbonHexColor', () => {
  it('returns green for low footprint', () => {
    expect(getCarbonHexColor(0)).toBe('#4ade80');
    expect(getCarbonHexColor(2)).toBe('#4ade80');
  });

  it('returns yellow for moderate footprint', () => {
    expect(getCarbonHexColor(5)).toBe('#fbbf24');
  });

  it('returns orange for high footprint', () => {
    expect(getCarbonHexColor(12)).toBe('#fb923c');
  });

  it('returns red for very high footprint', () => {
    expect(getCarbonHexColor(20)).toBe('#f87171');
  });
});

// ── Format utility tests ──────────────────────────────────────────────────────

describe('formatTime', () => {
  it('formats a timestamp as time', () => {
    const ts = new Date('2026-07-19T18:00:00Z').getTime();
    const result = formatTime(ts);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('returns em-dash for invalid timestamp', () => {
    expect(formatTime(NaN)).toBe('—');
    expect(formatTime(-1)).toBe('—');
  });
});

describe('formatDate', () => {
  it('formats a timestamp as date string', () => {
    const ts = new Date('2026-07-19').getTime();
    const result = formatDate(ts);
    expect(result).toContain('2026');
  });

  it('returns em-dash for invalid input', () => {
    expect(formatDate(NaN)).toBe('—');
  });
});

describe('formatRelativeTime', () => {
  it('returns relative time string', () => {
    const result = formatRelativeTime(Date.now() - 120_000);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('returns em-dash for NaN', () => {
    expect(formatRelativeTime(NaN)).toBe('—');
  });
});

describe('formatPercent', () => {
  it('formats 0.75 as 75%', () => {
    expect(formatPercent(0.75)).toBe('75%');
  });

  it('formats with decimals', () => {
    expect(formatPercent(0.753, 1)).toBe('75.3%');
  });

  it('clamps values above 1 to 100%', () => {
    expect(formatPercent(1.5)).toBe('100%');
  });

  it('clamps negative values to 0%', () => {
    expect(formatPercent(-0.5)).toBe('0%');
  });

  it('returns em-dash for NaN', () => {
    expect(formatPercent(NaN)).toBe('—');
  });
});

describe('formatCarbon', () => {
  it('formats small values in kg', () => {
    expect(formatCarbon(1.5)).toBe('1.5 kg CO₂');
  });

  it('formats large values in tonnes', () => {
    expect(formatCarbon(1500)).toBe('1.50 t CO₂');
  });

  it('returns 0 for negative values', () => {
    expect(formatCarbon(-5)).toBe('0 kg CO₂');
  });
});

describe('formatEta', () => {
  it('returns Now for 0 minutes', () => {
    expect(formatEta(0)).toBe('Now');
  });

  it('formats minutes under 60', () => {
    expect(formatEta(8)).toBe('8 min');
  });

  it('formats hours and minutes', () => {
    expect(formatEta(90)).toBe('1 hr 30 min');
  });

  it('formats exact hours', () => {
    expect(formatEta(120)).toBe('2 hr');
  });

  it('returns Unknown for negative', () => {
    expect(formatEta(-1)).toBe('Unknown');
  });
});

describe('getOccupancyStatus', () => {
  it.each([
    [0.1, 'Empty'],
    [0.4, 'Available'],
    [0.7, 'Busy'],
    [0.95, 'Full'],
  ])('returns correct status for %s occupancy', (occ, status) => {
    expect(getOccupancyStatus(occ)).toBe(status);
  });
});

describe('generateId', () => {
  it('generates unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it('uses custom prefix', () => {
    const id = generateId('msg');
    expect(id.startsWith('msg-')).toBe(true);
  });
});

describe('clamp', () => {
  it('clamps value above max to max', () => {
    expect(clamp(150, 0, 100)).toBe(100);
  });

  it('clamps value below min to min', () => {
    expect(clamp(-5, 0, 100)).toBe(0);
  });

  it('leaves value within range unchanged', () => {
    expect(clamp(50, 0, 100)).toBe(50);
  });
});

// ── Rate limiter tests ────────────────────────────────────────────────────────

describe('createTokenBucket', () => {
  it('creates bucket with correct initial tokens', () => {
    const bucket = createTokenBucket(10, 60_000);
    expect(bucket.tokens).toBe(10);
  });

  it('initializes lastRefill to current time', () => {
    const before = Date.now();
    const bucket = createTokenBucket(5, 60_000);
    const after = Date.now();
    expect(bucket.lastRefill).toBeGreaterThanOrEqual(before);
    expect(bucket.lastRefill).toBeLessThanOrEqual(after);
  });
});

describe('refillTokens', () => {
  it('refills tokens after full window elapsed', () => {
    const oldState = { tokens: 0, lastRefill: Date.now() - 70_000 };
    const newState = refillTokens(oldState, 10, 60_000);
    expect(newState.tokens).toBe(10);
  });

  it('returns same state if no time has passed', () => {
    const state = { tokens: 5, lastRefill: Date.now() };
    const result = refillTokens(state, 10, 60_000);
    expect(result.tokens).toBe(5);
  });
});

describe('consumeToken', () => {
  it('returns true and decrements tokens', () => {
    const bucket = createTokenBucket(5, 60_000);
    const result = consumeToken(bucket);
    expect(result).toBe(true);
    expect(bucket.tokens).toBe(4);
  });

  it('returns false when tokens exhausted', () => {
    const bucket = { tokens: 0, lastRefill: Date.now() };
    const result = consumeToken(bucket, 5, 60_000);
    expect(result).toBe(false);
  });

  it('allows consuming all tokens one by one', () => {
    const bucket = createTokenBucket(3, 60_000);
    expect(consumeToken(bucket)).toBe(true);
    expect(consumeToken(bucket)).toBe(true);
    expect(consumeToken(bucket)).toBe(true);
    expect(consumeToken(bucket)).toBe(false);
  });
});

describe('getWaitTimeMs', () => {
  it('returns 0 when tokens are available', () => {
    const bucket = createTokenBucket(5, 60_000);
    expect(getWaitTimeMs(bucket)).toBe(0);
  });

  it('returns positive ms when tokens are exhausted', () => {
    const bucket = { tokens: 0, lastRefill: Date.now() };
    const wait = getWaitTimeMs(bucket, 60_000);
    expect(wait).toBeGreaterThan(0);
    expect(wait).toBeLessThanOrEqual(60_000);
  });
});

// ── Sanitize utility tests ────────────────────────────────────────────────────

describe('sanitizeAndTruncate', () => {
  it('removes script tags', () => {
    const result = sanitizeAndTruncate('<script>alert("xss")</script>Hello', 200);
    expect(result).not.toContain('<script>');
    expect(result).toContain('Hello');
  });

  it('truncates long strings', () => {
    const longStr = 'a'.repeat(600);
    const result = sanitizeAndTruncate(longStr, 100);
    expect(result.length).toBeLessThanOrEqual(100);
  });

  it('returns empty string for empty input', () => {
    expect(sanitizeAndTruncate('', 100)).toBe('');
  });

  it('does not truncate short strings', () => {
    const short = 'Hello World';
    expect(sanitizeAndTruncate(short, 200)).toBe(short);
  });
});
