/**
 * @fileoverview Carbon footprint calculation utilities for StadiumIQ EcoScore.
 * All functions are pure with no side effects.
 *
 * Emission factors sourced from:
 * - DEFRA 2023 GHG Conversion Factors
 * - Our World in Data transport emissions data
 */

import type { CarbonFootprint, CarbonInputs } from '@/types';

// ── Emission factors (kg CO2e per km per person) ──────────────────────────────

const TRANSPORT_EMISSION_FACTORS: Record<string, number> = {
  car: 0.171,      // average petrol car, single occupant
  bus: 0.089,      // average diesel bus (urban)
  metro: 0.041,    // electric metro/subway
  walk: 0.0,       // zero emissions
  bike: 0.0,       // zero emissions
  flight: 0.255,   // average short-haul flight per km
};

// ── Emission factors (kg CO2e per meal) ──────────────────────────────────────

const MEAL_EMISSION_FACTORS: Record<string, number> = {
  meat: 6.61,        // beef-based meal average
  vegetarian: 2.85,  // cheese/egg-based meal
  vegan: 1.57,       // fully plant-based
};

// ── Car equivalent conversion ─────────────────────────────────────────────────

const KG_CO2_PER_KM_CAR = 0.171;

/**
 * Calculates the carbon footprint from a given travel mode and distance.
 *
 * @param mode - Transport mode (car, bus, metro, walk, bike, flight)
 * @param distanceKm - One-way distance in kilometers
 * @returns Carbon footprint in kg CO2e (round trip × 2)
 *
 * @example
 * calculateTravelCarbon('car', 25) // => 8.55 (25km × 2 × 0.171)
 */
export function calculateTravelCarbon(mode: string, distanceKm: number): number {
  if (distanceKm < 0) return 0;
  const factor = TRANSPORT_EMISSION_FACTORS[mode] ?? TRANSPORT_EMISSION_FACTORS['car'] ?? 0.171;
  return parseFloat((factor * distanceKm * 2).toFixed(3)); // round trip
}

/**
 * Calculates the carbon footprint from food consumption.
 *
 * @param mealType - Type of meal (meat, vegetarian, vegan)
 * @param numberOfMeals - Number of meals consumed
 * @returns Carbon footprint in kg CO2e
 *
 * @example
 * calculateFoodCarbon('meat', 2) // => 13.22 (6.61 × 2)
 */
export function calculateFoodCarbon(mealType: string, numberOfMeals: number): number {
  if (numberOfMeals < 0) return 0;
  const factor = MEAL_EMISSION_FACTORS[mealType] ?? MEAL_EMISSION_FACTORS['meat'] ?? 6.61;
  return parseFloat((factor * numberOfMeals).toFixed(3));
}

/**
 * Converts kg CO2e to equivalent kilometers driven by car.
 *
 * @param kgCO2 - Carbon footprint in kg CO2e
 * @returns Equivalent car kilometers
 *
 * @example
 * toCarEquivalentKm(3.42) // => 20 km
 */
export function toCarEquivalentKm(kgCO2: number): number {
  if (kgCO2 <= 0) return 0;
  return parseFloat((kgCO2 / KG_CO2_PER_KM_CAR).toFixed(1));
}

/**
 * Computes full carbon footprint from user inputs.
 *
 * @param inputs - User-provided travel and food data
 * @returns Complete CarbonFootprint breakdown
 *
 * @example
 * computeCarbonFootprint({ transportMode: 'car', distanceKm: 30, mealType: 'meat', numberOfMeals: 2 })
 */
export function computeCarbonFootprint(inputs: CarbonInputs): CarbonFootprint {
  const travelKgCO2 = calculateTravelCarbon(inputs.transportMode, inputs.distanceKm);
  const foodKgCO2 = calculateFoodCarbon(inputs.mealType, inputs.numberOfMeals);
  const totalKgCO2 = parseFloat((travelKgCO2 + foodKgCO2).toFixed(3));
  const equivalentKm = toCarEquivalentKm(totalKgCO2);

  const offsetOptions = generateOffsetOptions(totalKgCO2);

  return {
    travelKgCO2,
    foodKgCO2,
    totalKgCO2,
    equivalentKm,
    offsetOptions,
  };
}

/**
 * Generates carbon offset suggestions based on total footprint.
 *
 * @param totalKgCO2 - Total carbon footprint in kg CO2e
 * @returns Array of offset option strings
 *
 * @example
 * generateOffsetOptions(5.0) // => ['Plant 1 tree...', ...]
 */
export function generateOffsetOptions(totalKgCO2: number): string[] {
  if (totalKgCO2 <= 0) {
    return ['You have zero carbon emissions — great job!'];
  }

  const treesNeeded = Math.ceil(totalKgCO2 / 21.7); // avg tree absorbs 21.7 kg CO2/year
  const options: string[] = [
    `Plant ${treesNeeded} tree${treesNeeded > 1 ? 's' : ''} to offset this trip's emissions`,
    `Donate to a verified carbon offset project (~$${(totalKgCO2 * 0.15).toFixed(2)})`,
    'Choose metro/bus for your next match visit',
  ];

  if (totalKgCO2 > 10) {
    options.push('Consider a plant-based meal to cut food emissions by 75%');
  }

  return options;
}

/**
 * Returns a descriptive label for a carbon footprint level.
 *
 * @param kgCO2 - Total carbon in kg CO2e
 * @returns Human-readable label
 *
 * @example
 * getCarbonLabel(2.5) // => 'Low'
 */
export function getCarbonLabel(kgCO2: number): 'Minimal' | 'Low' | 'Moderate' | 'High' | 'Very High' {
  if (kgCO2 <= 0) return 'Minimal';
  if (kgCO2 <= 3) return 'Low';
  if (kgCO2 <= 8) return 'Moderate';
  if (kgCO2 <= 15) return 'High';
  return 'Very High';
}

/**
 * Returns a color class for a carbon level (used in EcoScore UI).
 *
 * @param kgCO2 - Total carbon in kg CO2e
 * @returns Tailwind color class string
 *
 * @example
 * getCarbonColor(2.0) // => 'text-green-400'
 */
export function getCarbonColor(kgCO2: number): string {
  if (kgCO2 <= 0) return 'text-green-400';
  if (kgCO2 <= 3) return 'text-green-400';
  if (kgCO2 <= 8) return 'text-yellow-400';
  if (kgCO2 <= 15) return 'text-orange-400';
  return 'text-red-400';
}
