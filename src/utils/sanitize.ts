/**
 * @fileoverview Input sanitization utilities using DOMPurify.
 * All user inputs must be sanitized before writing to Firestore or rendering.
 */

import DOMPurify from 'dompurify';

/**
 * Sanitizes a string to remove XSS payloads.
 * Strips all HTML tags and dangerous attributes.
 *
 * @param input - Raw user input string
 * @returns Sanitized plain text string
 *
 * @example
 * sanitizeText('<script>alert(1)</script>Hello') // => 'Hello'
 */
export function sanitizeText(input: string): string {
  if (typeof input !== 'string') return '';
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
}

/**
 * Sanitizes a string and limits its length.
 *
 * @param input - Raw user input
 * @param maxLength - Maximum allowed character count (default: 500)
 * @returns Sanitized, truncated string
 *
 * @example
 * sanitizeAndTruncate('Hello world', 5) // => 'Hello'
 */
export function sanitizeAndTruncate(input: string, maxLength = 500): string {
  const clean = sanitizeText(input);
  return clean.slice(0, maxLength);
}

/**
 * Validates and sanitizes an email address.
 *
 * @param email - Raw email input
 * @returns Sanitized email or empty string if invalid
 *
 * @example
 * sanitizeEmail('user@example.com') // => 'user@example.com'
 * sanitizeEmail('<script>x</script>@a.com') // => ''
 */
export function sanitizeEmail(email: string): string {
  const clean = sanitizeText(email).toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(clean) ? clean : '';
}

/**
 * Sanitizes an object's string values recursively.
 * Non-string values are passed through unchanged.
 *
 * @param obj - Object with potentially unsafe string values
 * @returns New object with all string values sanitized
 *
 * @example
 * sanitizeObject({ name: '<b>Alice</b>', count: 5 })
 * // => { name: 'Alice', count: 5 }
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizeText(value);
    } else {
      result[key] = value;
    }
  }
  return result as T;
}

/**
 * Checks if a string contains potentially dangerous content.
 *
 * @param input - String to check
 * @returns true if the string appears malicious
 *
 * @example
 * isPotentiallyMalicious('<script>alert(1)</script>') // => true
 */
export function isPotentiallyMalicious(input: string): boolean {
  const sanitized = DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  return sanitized !== input;
}
