/**
 * @fileoverview Google Maps embed helpers for StadiumIQ.
 * Provides typed utilities for generating Google Maps embed URLs.
 */

import type { GeoPoint } from '@/types';

const MAPS_KEY = import.meta.env['VITE_MAPS_KEY'] as string | undefined;

/**
 * Generates a Google Maps embed URL for a given location.
 *
 * @param location - Search query or place name
 * @param options - Optional map configuration
 * @returns Full embed URL string
 *
 * @example
 * getMapEmbedUrl('MetLife Stadium, New Jersey')
 * // => 'https://www.google.com/maps/embed/v1/place?key=...&q=MetLife+Stadium...'
 */
export function getMapEmbedUrl(
  location: string,
  options?: { zoom?: number; maptype?: 'roadmap' | 'satellite' }
): string {
  const key = MAPS_KEY ?? '';
  const params = new URLSearchParams({
    key,
    q: location,
    zoom: String(options?.zoom ?? 15),
    maptype: options?.maptype ?? 'roadmap',
  });
  return `https://www.google.com/maps/embed/v1/place?${params.toString()}`;
}

/**
 * Generates a Google Maps embed URL for directions between two points.
 *
 * @param origin - Starting location (address or lat,lng)
 * @param destination - Ending location (address or lat,lng)
 * @param mode - Travel mode
 * @returns Full directions embed URL string
 *
 * @example
 * getDirectionsEmbedUrl('Gate A', 'Section 104', 'walking')
 */
export function getDirectionsEmbedUrl(
  origin: string,
  destination: string,
  mode: 'driving' | 'walking' | 'transit' = 'walking'
): string {
  const key = MAPS_KEY ?? '';
  const params = new URLSearchParams({
    key,
    origin,
    destination,
    mode,
  });
  return `https://www.google.com/maps/embed/v1/directions?${params.toString()}`;
}

/**
 * Generates a Google Maps embed URL for a specific geographic coordinate.
 *
 * @param point - Latitude/longitude point
 * @param zoom - Zoom level (1–21)
 * @returns Full embed URL string
 *
 * @example
 * getCoordinateMapUrl({ lat: 40.8136, lng: -74.0744 }, 17)
 */
export function getCoordinateMapUrl(point: GeoPoint, zoom = 17): string {
  const key = MAPS_KEY ?? '';
  const params = new URLSearchParams({
    key,
    center: `${point.lat.toString()},${point.lng.toString()}`,
    zoom: String(zoom),
    maptype: 'roadmap',
  });
  return `https://www.google.com/maps/embed/v1/view?${params.toString()}`;
}

/**
 * Returns a Google Maps link (not embed) for opening in the Maps app.
 *
 * @param location - Location string or query
 * @returns Google Maps URL
 */
export function getMapsLink(location: string): string {
  const params = new URLSearchParams({ q: location });
  return `https://www.google.com/maps/search/?api=1&${params.toString()}`;
}

/**
 * FIFA World Cup 2026 host cities with stadium coordinates.
 * Source: FIFA official venue list.
 */
export const WC2026_VENUES: Record<string, { name: string; city: string; country: string; coordinates: GeoPoint }> = {
  'metlife': { name: 'MetLife Stadium', city: 'New York/New Jersey', country: 'USA', coordinates: { lat: 40.8136, lng: -74.0744 } },
  'sofi': { name: 'SoFi Stadium', city: 'Los Angeles', country: 'USA', coordinates: { lat: 33.9535, lng: -118.3392 } },
  'atandt': { name: 'AT&T Stadium', city: 'Dallas', country: 'USA', coordinates: { lat: 32.7473, lng: -97.0945 } },
  'hardrock': { name: 'Hard Rock Stadium', city: 'Miami', country: 'USA', coordinates: { lat: 25.9580, lng: -80.2389 } },
  'allegiant': { name: 'Allegiant Stadium', city: 'Las Vegas', country: 'USA', coordinates: { lat: 36.0909, lng: -115.1833 } },
  'lumen': { name: 'Lumen Field', city: 'Seattle', country: 'USA', coordinates: { lat: 47.5952, lng: -122.3316 } },
  'bof': { name: 'Bank of America Stadium', city: 'Charlotte', country: 'USA', coordinates: { lat: 35.2258, lng: -80.8528 } },
  'arrowhead': { name: 'Arrowhead Stadium', city: 'Kansas City', country: 'USA', coordinates: { lat: 39.0489, lng: -94.4839 } },
  'lincoln': { name: 'Lincoln Financial Field', city: 'Philadelphia', country: 'USA', coordinates: { lat: 39.9008, lng: -75.1675 } },
  'gillette': { name: 'Gillette Stadium', city: 'Boston', country: 'USA', coordinates: { lat: 42.0909, lng: -71.2643 } },
  'bmc': { name: 'BMC Software Field', city: 'Houston', country: 'USA', coordinates: { lat: 29.6847, lng: -95.4107 } },
  'sfba': { name: 'Levi\'s Stadium', city: 'San Francisco Bay Area', country: 'USA', coordinates: { lat: 37.4033, lng: -121.9694 } },
  'azteca': { name: 'Estadio Azteca', city: 'Mexico City', country: 'Mexico', coordinates: { lat: 19.3029, lng: -99.1505 } },
  'bbva': { name: 'Estadio BBVA', city: 'Guadalajara', country: 'Mexico', coordinates: { lat: 25.6694, lng: -100.2358 } },
  'akron': { name: 'Estadio Akron', city: 'Guadalajara', country: 'Mexico', coordinates: { lat: 20.6694, lng: -103.3539 } },
  'bmo': { name: 'BMO Field', city: 'Toronto', country: 'Canada', coordinates: { lat: 43.6333, lng: -79.4186 } },
};
