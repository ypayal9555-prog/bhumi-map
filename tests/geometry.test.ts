/**
 * Geometry + unit regressions.
 *
 * These lock down the numbers the app shows. If a future change moves a single
 * area or a single land-unit factor, this suite fails.
 *
 * Run: npm test
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  getCoordinatesFromDimensions,
  calculateTriangularArea,
  calculateAverageArea,
  isPlottable,
} from '../src/geometryUtils.ts';
import {
  SQFT_PER_BISWA,
  SQFT_PER_BIGHA,
  BISWA_PER_BIGHA,
  SQFT_PER_ACRE,
  SQFT_PER_DISMIL,
  SQFT_PER_KANAL,
  SQFT_PER_MARLA,
  SQFT_PER_GUNTHA,
  SQFT_PER_HECTARE,
  SQFT_PER_SQ_LINK,
  SQFT_PER_SQ_LATTHA,
} from '../src/units.ts';

const close = (actual: number, expected: number, tolerance = 0.01) =>
  Math.abs(actual - expected) <= tolerance;

// ---------------------------------------------------------------- area formulas

test('square 80x80 -> 6400 sq ft in both methods', () => {
  const d = { sideAB: 80, sideBC: 80, sideCD: 80, sideDA: 80, diagonalBD: Math.hypot(80, 80) };
  assert.ok(close(calculateTriangularArea(d), 6400));
  assert.ok(close(calculateAverageArea(d), 6400));
});

test('rectangle 100x80 -> 8000 sq ft in both methods', () => {
  const d = { sideAB: 100, sideBC: 80, sideCD: 100, sideDA: 80, diagonalBD: Math.hypot(100, 80) };
  assert.ok(close(calculateTriangularArea(d), 8000));
  assert.ok(close(calculateAverageArea(d), 8000));
});

test('irregular plot 120/90/100/80 with diagonal 130 -> Heron 9189.92', () => {
  const d = { sideAB: 120, sideBC: 90, sideCD: 100, sideDA: 80, diagonalBD: 130 };
  assert.ok(close(calculateTriangularArea(d), 9189.92, 0.01));
  assert.ok(close(calculateAverageArea(d), 9350, 0.01));
});

test('triangular method splits along BD: ABD(AB,DA,BD) + BCD(BC,CD,BD)', () => {
  // Pairs must be (AB,DA) and (BC,CD) — swapping them is a classic bug.
  const d = { sideAB: 30, sideBC: 50, sideCD: 40, sideDA: 20, diagonalBD: 45 };
  const s1 = (30 + 20 + 45) / 2;
  const s2 = (50 + 40 + 45) / 2;
  const expected =
    Math.sqrt(s1 * (s1 - 30) * (s1 - 20) * (s1 - 45)) +
    Math.sqrt(s2 * (s2 - 50) * (s2 - 40) * (s2 - 45));
  assert.ok(close(calculateTriangularArea(d), expected, 0.001));
});

test('impossible triangle returns 0 instead of NaN', () => {
  const d = { sideAB: 10, sideBC: 10, sideCD: 10, sideDA: 10, diagonalBD: 200 };
  assert.equal(calculateTriangularArea(d), 0);
});

test('thi sliver 200x5 still computes', () => {
  const d = { sideAB: 200, sideBC: 5, sideCD: 200, sideDA: 5, diagonalBD: Math.hypot(200, 5) };
  assert.ok(close(calculateTriangularArea(d), 1000, 0.5));
  assert.ok(close(calculateAverageArea(d), 1000, 0.5));
});

// ------------------------------------------------------------- land unit factors

test('local land-unit standards are unchanged', () => {
  assert.equal(SQFT_PER_BISWA, 1220);
  assert.equal(SQFT_PER_BIGHA, 24400);
  assert.equal(BISWA_PER_BIGHA, 20);
  assert.equal(SQFT_PER_ACRE, 43560);
  assert.equal(SQFT_PER_DISMIL, 435.6);
  assert.equal(SQFT_PER_KANAL, 5445);
  assert.equal(SQFT_PER_MARLA, 272.25);
  assert.equal(SQFT_PER_GUNTHA, 1089);
  assert.equal(SQFT_PER_HECTARE, 107639);
});

test('derived factors stay consistent', () => {
  assert.ok(close(SQFT_PER_SQ_LINK, 0.4356, 1e-9));
  assert.ok(close(SQFT_PER_SQ_LATTHA, 43.56, 1e-9));
  assert.ok(close(SQFT_PER_MARLA * 20, SQFT_PER_KANAL, 1e-6));
  assert.ok(close(SQFT_PER_GUNTHA * 40, SQFT_PER_ACRE, 1e-6));
  assert.ok(close(SQFT_PER_DISMIL * 100, SQFT_PER_ACRE, 1e-6));
  assert.ok(close(SQFT_PER_BISWA * BISWA_PER_BIGHA, SQFT_PER_BIGHA, 1e-6));
});

// ------------------------------------------------------------------- the drawing

const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(b.x - a.x, b.y - a.y);

function crosses(p1: any, p2: any, p3: any, p4: any) {
  const d = (p2.x - p1.x) * (p4.y - p3.y) - (p2.y - p1.y) * (p4.x - p3.x);
  if (Math.abs(d) < 1e-9) return false;
  const t = ((p3.x - p1.x) * (p4.y - p3.y) - (p3.y - p1.y) * (p4.x - p3.x)) / d;
  const u = ((p3.x - p1.x) * (p2.y - p1.y) - (p3.y - p1.y) * (p2.x - p1.x)) / d;
  return t > 1e-6 && t < 1 - 1e-6 && u > 1e-6 && u < 1 - 1e-6;
}

test('drawn outline keeps every side proportional to the typed value', () => {
  const cases = [
    { sideAB: 80, sideBC: 80, sideCD: 80, sideDA: 80, diagonalBD: 113.1 },
    { sideAB: 100, sideBC: 80, sideCD: 100, sideDA: 80, diagonalBD: 128.062 },
    { sideAB: 120, sideBC: 90, sideCD: 100, sideDA: 80, diagonalBD: 130 },
    { sideAB: 23, sideBC: 189, sideCD: 156, sideDA: 51, diagonalBD: 39 },
  ];
  for (const d of cases) {
    const [A, B, C, D] = getCoordinatesFromDimensions(d, 400, 300);
    const scales = [
      dist(A, B) / d.sideAB,
      dist(B, C) / d.sideBC,
      dist(C, D) / d.sideCD,
      dist(D, A) / d.sideDA,
    ];
    const mean = scales.reduce((a, b) => a + b, 0) / 4;
    for (const s of scales) {
      assert.ok(Math.abs(s - mean) / mean < 0.001, `side scaling drifted for ${JSON.stringify(d)}`);
    }
  }
});

test('outline is never self-intersecting (previously 14% of plots were bowties)', () => {
  const cases = [
    { sideAB: 38, sideBC: 109, sideCD: 58, sideDA: 74, diagonalBD: 56 },
    { sideAB: 23, sideBC: 189, sideCD: 156, sideDA: 51, diagonalBD: 39 },
    { sideAB: 107, sideBC: 160, sideCD: 106, sideDA: 176, diagonalBD: 78 },
    { sideAB: 133, sideBC: 98, sideCD: 34, sideDA: 136, diagonalBD: 87 },
    { sideAB: 23, sideBC: 199, sideCD: 145, sideDA: 126, diagonalBD: 129 },
    { sideAB: 77, sideBC: 183, sideCD: 70, sideDA: 59, diagonalBD: 119 },
  ];
  for (const d of cases) {
    const [A, B, C, D] = getCoordinatesFromDimensions(d, 400, 300);
    assert.equal(crosses(A, B, C, D) || crosses(B, C, D, A), false, `bowtie for ${JSON.stringify(d)}`);
  }
});

test('randomised sweep: no bowties, no distorted sides', () => {
  let seed = 424242;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  const rf = (a: number, b: number) => a + rnd() * (b - a);

  let checked = 0;
  for (let i = 0; i < 2000; i++) {
    const AB = rf(5, 300);
    const BC = rf(5, 300);
    const CD = rf(5, 300);
    const DA = rf(5, 300);
    const lo = Math.max(Math.abs(DA - AB), Math.abs(BC - CD));
    const hi = Math.min(DA + AB, BC + CD);
    if (!(hi > lo + 1e-6)) continue;
    const BD = rf(lo + (hi - lo) * 0.02, hi - (hi - lo) * 0.02);

    const d = { sideAB: AB, sideBC: BC, sideCD: CD, sideDA: DA, diagonalBD: BD };
    const [A, B, C, D] = getCoordinatesFromDimensions(d, 400, 300);
    assert.equal(crosses(A, B, C, D) || crosses(B, C, D, A), false, `bowtie for ${JSON.stringify(d)}`);
    checked++;
  }
  assert.ok(checked > 1500, `expected a large sample, got ${checked}`);
});

test('isPlottable rejects impossible input and accepts real plots', () => {
  assert.equal(isPlottable({ sideAB: 10, sideBC: 10, sideCD: 10, sideDA: 10, diagonalBD: 200 }), false);
  assert.equal(isPlottable({ sideAB: 80, sideBC: 80, sideCD: 80, sideDA: 80, diagonalBD: 113.1 }), true);
  assert.equal(isPlottable({ sideAB: 120, sideBC: 90, sideCD: 100, sideDA: 80, diagonalBD: 130 }), true);
  assert.equal(isPlottable({ sideAB: 0, sideBC: 80, sideCD: 80, sideDA: 80, diagonalBD: 113.1 }), false);
});
