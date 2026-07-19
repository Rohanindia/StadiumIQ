/**
 * @fileoverview Pure formatting utility functions for StadiumIQ.
 * All functions are side-effect free and return new values.
 */

/**
 * Formats a Unix timestamp (ms) to a human-readable time string.
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @param locale - BCP 47 locale tag (default: 'en-US')
 * @returns Formatted time string (e.g., '3:45 PM')
 *
 * @example
 * formatTime(1720000000000, 'en-US') // => '10:26 PM'
 */
export function formatTime(timestamp: number, locale = 'en-US'): string {
  if (!Number.isFinite(timestamp) || timestamp < 0) return '—';
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(timestamp));
}

/**
 * Formats a Unix timestamp (ms) to a short date string.
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @param locale - BCP 47 locale tag (default: 'en-US')
 * @returns Formatted date string (e.g., 'Jul 19, 2026')
 *
 * @example
 * formatDate(1720000000000) // => 'Jul 19, 2026'
 */
export function formatDate(timestamp: number, locale = 'en-US'): string {
  if (!Number.isFinite(timestamp) || timestamp < 0) return '—';
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(timestamp));
}

/**
 * Returns a relative time string (e.g., '2 minutes ago').
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @param locale - BCP 47 locale tag (default: 'en-US')
 * @returns Relative time string
 *
 * @example
 * formatRelativeTime(Date.now() - 120_000) // => '2 minutes ago'
 */
export function formatRelativeTime(timestamp: number, locale = 'en-US'): string {
  if (!Number.isFinite(timestamp)) return '—';
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const diffMs = timestamp - Date.now();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr = Math.round(diffMin / 60);

  if (Math.abs(diffSec) < 60) return rtf.format(diffSec, 'second');
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute');
  return rtf.format(diffHr, 'hour');
}

/**
 * Formats a percentage number to a display string.
 *
 * @param value - Number between 0 and 1 (0 = 0%, 1 = 100%)
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted percentage string (e.g., '75%')
 *
 * @example
 * formatPercent(0.753) // => '75%'
 * formatPercent(0.753, 1) // => '75.3%'
 */
export function formatPercent(value: number, decimals = 0): string {
  if (!Number.isFinite(value)) return '—';
  const clamped = Math.max(0, Math.min(1, value));
  return `${(clamped * 100).toFixed(decimals)}%`;
}

/**
 * Formats a carbon footprint number with appropriate units.
 *
 * @param kgCO2 - Carbon amount in kg CO2e
 * @returns Formatted string with units (e.g., '1.5 kg CO₂' or '1.2 t CO₂')
 *
 * @example
 * formatCarbon(1.5) // => '1.5 kg CO₂'
 * formatCarbon(1500) // => '1.5 t CO₂'
 */
export function formatCarbon(kgCO2: number): string {
  if (!Number.isFinite(kgCO2) || kgCO2 < 0) return '0 kg CO₂';
  if (kgCO2 >= 1000) {
    return `${(kgCO2 / 1000).toFixed(2)} t CO₂`;
  }
  return `${kgCO2.toFixed(1)} kg CO₂`;
}

/**
 * Formats ETA minutes to a human-readable string.
 *
 * @param minutes - Number of minutes
 * @returns ETA string (e.g., '5 min', '1 hr 30 min')
 *
 * @example
 * formatEta(5) // => '5 min'
 * formatEta(90) // => '1 hr 30 min'
 */
export function formatEta(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes < 0) return 'Unknown';
  if (minutes === 0) return 'Now';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours} hr ${mins} min` : `${hours} hr`;
}

/**
 * Formats an occupancy fraction to a color-coded status.
 *
 * @param occupancy - Value between 0 and 1
 * @returns Status label string
 *
 * @example
 * getOccupancyStatus(0.9) // => 'Full'
 */
export function getOccupancyStatus(occupancy: number): 'Empty' | 'Available' | 'Busy' | 'Full' {
  if (occupancy <= 0.25) return 'Empty';
  if (occupancy <= 0.6) return 'Available';
  if (occupancy <= 0.85) return 'Busy';
  return 'Full';
}

/**
 * Generates a unique ID string (not cryptographically secure — for UI keys only).
 *
 * @param prefix - Optional prefix string
 * @returns Unique ID string
 *
 * @example
 * generateId('msg') // => 'msg-abc123'
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Clamps a number between min and max bounds.
 *
 * @param value - Input value
 * @param min - Minimum bound
 * @param max - Maximum bound
 * @returns Clamped value
 *
 * @example
 * clamp(150, 0, 100) // => 100
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
