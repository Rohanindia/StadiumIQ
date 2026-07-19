/**
 * @fileoverview Firebase Analytics event tracking for StadiumIQ.
 * All events are prefixed with the feature area and use snake_case.
 * Gracefully no-ops if Firebase Analytics is unavailable (offline / blocked).
 */

import { logEvent, type Analytics } from 'firebase/analytics';
import { analytics } from '@/services/firebase';

const IS_DEV = import.meta.env['VITE_IS_DEV'] === 'true';

type AnalyticsInstance = Analytics | null;

/**
 * Safe wrapper around logEvent — silently fails if analytics is null.
 */
function track(
  eventName: string,
  params?: Record<string, string | number | boolean>
): void {
  const a: AnalyticsInstance = analytics;
  if (!a) return;
  try {
    logEvent(a, eventName, params);
    if (IS_DEV) {
      console.info(`[Analytics] ${eventName}`, params ?? '');
    }
  } catch {
    // Analytics may be blocked by browser extensions — silently ignore
  }
}

// ── Page views ────────────────────────────────────────────────────────────────

export function trackPageView(page: string): void {
  track('page_view', { page_title: page });
}

// ── AI Assistant ──────────────────────────────────────────────────────────────

export function trackAiChatSent(messageLength: number): void {
  track('ai_chat_sent', { message_length: messageLength });
}

export function trackAiChatResponseReceived(isOffline: boolean): void {
  track('ai_chat_response', { is_offline: isOffline });
}

// ── Fan Hub ───────────────────────────────────────────────────────────────────

export function trackSeatSearched(section: string, found: boolean): void {
  track('seat_searched', { section, found });
}

// ── EcoScore ──────────────────────────────────────────────────────────────────

export function trackCarbonCalculated(
  transportMode: string,
  mealType: string,
  totalKgCO2: number
): void {
  track('carbon_calculated', {
    transport_mode: transportMode,
    meal_type: mealType,
    total_kg_co2: Math.round(totalKgCO2 * 10) / 10,
  });
}

// ── CrowdIQ ───────────────────────────────────────────────────────────────────

export function trackPAGenerated(zone: string): void {
  track('pa_announcement_generated', { zone });
}

// ── LinguaAssist ──────────────────────────────────────────────────────────────

export function trackTranslationRequested(targetLanguage: string): void {
  track('translation_requested', { target_language: targetLanguage });
}

// ── AccessPath ────────────────────────────────────────────────────────────────

export function trackAssistanceRequested(needType: string): void {
  track('assistance_requested', { need_type: needType });
}

// ── OpsCommand ────────────────────────────────────────────────────────────────

export function trackIncidentLogged(severity: string, type: string): void {
  track('incident_logged', { severity, incident_type: type });
}

export function trackCommsMessageSent(): void {
  track('comms_message_sent');
}
