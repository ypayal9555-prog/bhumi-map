/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Point, DimensionValues } from './types';

export function getDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

/**
 * Solve for circle-circle intersection.
 * Returns the intersection point closest to a reference or matching preferred layout.
 */
function getCircleIntersection(
  cx1: number,
  cy1: number,
  r1: number,
  cx2: number,
  cy2: number,
  r2: number,
  preferUpperY: boolean
): { x: number; y: number } | null {
  const dx = cx2 - cx1;
  const dy = cy2 - cy1;
  const d = Math.hypot(dx, dy);

  if (d > r1 + r2 || d < Math.abs(r1 - r2) || d === 0) {
    return null;
  }

  const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, r1 * r1 - a * a));

  const x3 = cx1 + (a * dx) / d;
  const y3 = cy1 + (a * dy) / d;

  // Two candidate points:
  // p1 = (x3 + h*dy/d, y3 - h*dx/d)
  // p2 = (x3 - h*dy/d, y3 + h*dx/d)
  const p1x = x3 + (h * dy) / d;
  const p1y = y3 - (h * dx) / d;
  const p2x = x3 - (h * dy) / d;
  const p2y = y3 + (h * dx) / d;

  if (preferUpperY) {
    return p1y < p2y ? { x: p1x, y: p1y } : { x: p2x, y: p2y };
  } else {
    return p1y > p2y ? { x: p1x, y: p1y } : { x: p2x, y: p2y };
  }
}

/**
 * Reconstructs points A, B, C, D from physical dimensions.
 * Maps them to SVG coordinate space of width and height.
 */
export function getCoordinatesFromDimensions(
  dimensions: DimensionValues,
  width: number = 400,
  height: number = 300
): Point[] {
  const { sideAB, sideBC, sideCD, sideDA, diagonalBD } = dimensions;

  // Fallback default coordinates if inputs are invalid or 0
  const defaultPoints: Point[] = [
    { id: 'A', x: width * 0.25, y: height * 0.25, label: 'A' },
    { id: 'B', x: width * 0.75, y: height * 0.2, label: 'B' },
    { id: 'C', x: width * 0.8, y: height * 0.75, label: 'C' },
    { id: 'D', x: width * 0.2, y: height * 0.8, label: 'D' },
  ];

  if (!sideAB || !sideBC || !sideCD || !sideDA) {
    return defaultPoints;
  }

  // Calculate default diagonal if none provided
  const diag = diagonalBD || Math.sqrt(sideCD * sideCD + sideDA * sideDA) || (sideAB + sideCD) / 1.35;

  // Place D at cartesian origin (0, 0)
  const Dx = 0;
  const Dy = 0;

  // Place C along the positive X axis (sideCD, 0)
  const Cx = sideCD;
  const Cy = 0;

  // Solve for B as circle-circle intersection between D (radius diag) and C (radius sideBC)
  // We prefer the upper intersection (positive Y)
  const bIntersect = getCircleIntersection(Dx, Dy, diag, Cx, Cy, sideBC, true);
  if (!bIntersect) {
    return defaultPoints;
  }
  const Bx = bIntersect.x;
  const By = bIntersect.y;

  // Solve for A as circle-circle intersection between D (radius sideDA) and B (radius sideAB)
  // We prefer the upper intersection relative to line DB (positive Y in standard orientation)
  const aIntersect = getCircleIntersection(Dx, Dy, sideDA, Bx, By, sideAB, true);
  if (!aIntersect) {
    return defaultPoints;
  }
  const Ax = aIntersect.x;
  const Ay = aIntersect.y;

  // List raw cartesian coordinates (inverting Y-axis to match standard SVG rendering orientation where Y increases downwards)
  // We do -Ay, -By, -Cy, -Dy to map positive Y upwards in Cartesian space
  const rawPoints = [
    { id: 'A', x: Ax, y: -Ay },
    { id: 'B', x: Bx, y: -By },
    { id: 'C', x: Cx, y: -Cy },
    { id: 'D', x: Dx, y: -Dy },
  ];

  // Calculate bounding box of raw shape
  const xs = rawPoints.map((p) => p.x);
  const ys = rawPoints.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const rawWidth = maxX - minX || 1;
  const rawHeight = maxY - minY || 1;

  // Apply standard padding inside the SVG viewBox with extra room at the bottom
  const paddingX = Math.round(width * 0.12);
  const paddingTop = Math.round(height * 0.15);
  const paddingBottom = Math.round(height * 0.28); // Give 28% vertical room at the bottom for labels and badges
  const targetWidth = width - paddingX * 2;
  const targetHeight = height - (paddingTop + paddingBottom);

  // Scale to fit viewport perfectly
  const scale = Math.min(targetWidth / rawWidth, targetHeight / rawHeight);

  // Center the scaled shape in the viewport
  const scaledWidth = rawWidth * scale;
  const scaledHeight = rawHeight * scale;

  const offsetX = (width - scaledWidth) / 2 - minX * scale;
  const offsetY = paddingTop + (targetHeight - scaledHeight) / 2 - minY * scale;

  return [
    { id: 'A', x: Ax * scale + offsetX, y: -Ay * scale + offsetY, label: 'A' },
    { id: 'B', x: Bx * scale + offsetX, y: -By * scale + offsetY, label: 'B' },
    { id: 'C', x: Cx * scale + offsetX, y: -Cy * scale + offsetY, label: 'C' },
    { id: 'D', x: Dx * scale + offsetX, y: -Dy * scale + offsetY, label: 'D' },
  ];
}

/**
 * Calculates area of a general quadrilateral using Heron's formula on two triangles (split by BD).
 */
export function calculateTriangularArea(dimensions: DimensionValues): number {
  const { sideAB, sideBC, sideCD, sideDA, diagonalBD } = dimensions;

  if (!sideAB || !sideBC || !sideCD || !sideDA || !diagonalBD) {
    return 0;
  }

  // Triangle 1: ABD
  const s1 = (sideAB + sideDA + diagonalBD) / 2;
  const term1 = s1 * (s1 - sideAB) * (s1 - sideDA) * (s1 - diagonalBD);
  if (term1 < 0) return 0; // Invalid triangle
  const area1 = Math.sqrt(term1);

  // Triangle 2: BCD
  const s2 = (sideBC + sideCD + diagonalBD) / 2;
  const term2 = s2 * (s2 - sideBC) * (s2 - sideCD) * (s2 - diagonalBD);
  if (term2 < 0) return 0; // Invalid triangle
  const area2 = Math.sqrt(term2);

  return area1 + area2;
}

/**
 * Calculates area using the Village Average Method (rural averaging):
 * Area = ((AB + CD) / 2) * ((BC + DA) / 2)
 */
export function calculateAverageArea(dimensions: DimensionValues): number {
  const { sideAB, sideBC, sideCD, sideDA } = dimensions;
  const avgWidth = (sideAB + sideCD) / 2;
  const avgHeight = (sideBC + sideDA) / 2;
  return avgWidth * avgHeight;
}
