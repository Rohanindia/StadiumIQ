/**
 * @fileoverview Service tests — maps helpers, gemini buildChatMessage.
 */
import { describe, it, expect } from 'vitest';
import {
  getMapEmbedUrl,
  getDirectionsEmbedUrl,
  getCoordinateMapUrl,
  getMapsLink,
  WC2026_VENUES,
} from '@/services/maps';
import { buildChatMessage } from '@/services/gemini';

// ── Maps service tests ────────────────────────────────────────────────────────

describe('getMapEmbedUrl', () => {
  it('generates a valid embed URL with location', () => {
    const url = getMapEmbedUrl('MetLife Stadium, New Jersey');
    expect(url).toContain('https://www.google.com/maps/embed/v1/place');
    expect(url).toContain('MetLife');
    expect(url).toContain('mock-maps-key');
  });

  it('includes zoom parameter', () => {
    const url = getMapEmbedUrl('SoFi Stadium', { zoom: 18 });
    expect(url).toContain('zoom=18');
  });

  it('includes maptype parameter', () => {
    const url = getMapEmbedUrl('AT&T Stadium', { maptype: 'satellite' });
    expect(url).toContain('maptype=satellite');
  });

  it('defaults to zoom=15 and roadmap', () => {
    const url = getMapEmbedUrl('Allegiant Stadium');
    expect(url).toContain('zoom=15');
    expect(url).toContain('maptype=roadmap');
  });
});

describe('getDirectionsEmbedUrl', () => {
  it('generates a directions embed URL', () => {
    const url = getDirectionsEmbedUrl('Gate A', 'Section 104');
    expect(url).toContain('https://www.google.com/maps/embed/v1/directions');
    expect(url).toContain('Gate');
    expect(url).toContain('Section');
  });

  it('includes travel mode', () => {
    const url = getDirectionsEmbedUrl('Parking', 'Gate B', 'driving');
    expect(url).toContain('mode=driving');
  });

  it('defaults to walking mode', () => {
    const url = getDirectionsEmbedUrl('A', 'B');
    expect(url).toContain('mode=walking');
  });
});

describe('getCoordinateMapUrl', () => {
  it('generates a view embed URL for coordinates', () => {
    const url = getCoordinateMapUrl({ lat: 40.8136, lng: -74.0744 }, 17);
    expect(url).toContain('https://www.google.com/maps/embed/v1/view');
    expect(url).toContain('40.8136');
    expect(url).toContain('-74.0744');
  });

  it('includes zoom level', () => {
    const url = getCoordinateMapUrl({ lat: 0, lng: 0 }, 12);
    expect(url).toContain('zoom=12');
  });
});

describe('getMapsLink', () => {
  it('generates a Google Maps search link', () => {
    const url = getMapsLink('MetLife Stadium');
    expect(url).toContain('https://www.google.com/maps/search');
    expect(url).toContain('MetLife');
  });
});

describe('WC2026_VENUES', () => {
  it('has 16 FIFA 2026 venues', () => {
    expect(Object.keys(WC2026_VENUES).length).toBe(16);
  });

  it('MetLife Stadium has correct coordinates', () => {
    const venue = WC2026_VENUES['metlife'];
    expect(venue).toBeDefined();
    expect(venue?.coordinates.lat).toBeCloseTo(40.8136, 2);
    expect(venue?.coordinates.lng).toBeCloseTo(-74.0744, 2);
  });

  it('includes venues from all 3 host countries', () => {
    const countries = Object.values(WC2026_VENUES).map((v) => v.country);
    expect(countries).toContain('USA');
    expect(countries).toContain('Canada');
    expect(countries).toContain('Mexico');
  });

  it('BMO Field is Toronto, Canada', () => {
    const bmo = WC2026_VENUES['bmo'];
    expect(bmo?.city).toBe('Toronto');
    expect(bmo?.country).toBe('Canada');
  });

  it('Estadio Azteca is in Mexico City', () => {
    const azteca = WC2026_VENUES['azteca'];
    expect(azteca?.city).toBe('Mexico City');
  });
});

// ── Gemini service helpers ────────────────────────────────────────────────────

describe('buildChatMessage', () => {
  it('creates a user message', () => {
    const msg = buildChatMessage('user', 'Hello!');
    expect(msg.role).toBe('user');
    expect(msg.content).toBe('Hello!');
    expect(typeof msg.id).toBe('string');
    expect(typeof msg.timestamp).toBe('number');
  });

  it('creates a model message', () => {
    const msg = buildChatMessage('model', 'Hi there!');
    expect(msg.role).toBe('model');
    expect(msg.content).toBe('Hi there!');
  });

  it('uses custom ID when provided', () => {
    const msg = buildChatMessage('user', 'Test', 'custom-id');
    expect(msg.id).toBe('custom-id');
  });

  it('generates unique IDs for different messages', () => {
    const msg1 = buildChatMessage('user', 'First');
    const msg2 = buildChatMessage('user', 'Second');
    expect(msg1.id).not.toBe(msg2.id);
  });

  it('timestamp is recent (within 5 seconds)', () => {
    const before = Date.now();
    const msg = buildChatMessage('user', 'Hi');
    const after = Date.now();
    expect(msg.timestamp).toBeGreaterThanOrEqual(before);
    expect(msg.timestamp).toBeLessThanOrEqual(after);
  });
});
