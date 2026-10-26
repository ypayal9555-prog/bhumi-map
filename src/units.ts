/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Single source of truth for land-area conversion factors.
 *
 * IMPORTANT: the actual numbers live in `LAND_UNITS` (src/types.ts) and are
 * tuned to the local revenue standard used by this app. Do not duplicate a
 * factor anywhere else — import it from here. That way a local-standard change
 * stays in exactly one place.
 */

import { LAND_UNITS } from './types';

const sqFtOf = (id: string): number => {
  const found = LAND_UNITS.find((u) => u.id === id);
  if (!found) throw new Error(`Unknown land unit: ${id}`);
  return found.sqFtValue;
};

/** Square feet in 1 Biswa (local standard). */
export const SQFT_PER_BISWA = sqFtOf('biswa');

/** Square feet in 1 Bigha (local standard). */
export const SQFT_PER_BIGHA = sqFtOf('bigha');

/** How many Biswa make one Bigha (derived, so the two can never drift apart). */
export const BISWA_PER_BIGHA = SQFT_PER_BIGHA / SQFT_PER_BISWA;

/** Square feet in 1 Acre. */
export const SQFT_PER_ACRE = sqFtOf('acre');

/** Square feet in 1 Decimal / Cent (1/100 acre). */
export const SQFT_PER_DISMIL = sqFtOf('decimal');

/** Square feet in 1 Kanal (Punjab / Haryana). */
export const SQFT_PER_KANAL = sqFtOf('kanal');

/** Square feet in 1 Marla (Punjab / Haryana). */
export const SQFT_PER_MARLA = sqFtOf('marla');

/** Square feet in 1 Guntha (Maharashtra / Gujarat). */
export const SQFT_PER_GUNTHA = sqFtOf('guntha');

/** Square feet in 1 Hectare. */
export const SQFT_PER_HECTARE = sqFtOf('hectare');

/** Square feet in 1 square metre. */
export const SQFT_PER_SQ_METER = 10.7639;

/** Feet in 1 Gunter's link. */
export const FEET_PER_LINK = 0.66;

/** Feet in 1 Lattha (local standard). */
export const FEET_PER_LATTHA = 6.6;

/** Square feet in 1 square Link. */
export const SQFT_PER_SQ_LINK = FEET_PER_LINK * FEET_PER_LINK;

/** Square feet in 1 square Lattha. */
export const SQFT_PER_SQ_LATTHA = FEET_PER_LATTHA * FEET_PER_LATTHA;
