/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Point {
  id: 'A' | 'B' | 'C' | 'D';
  x: number;
  y: number;
  label: string;
}

export type MeasuringUnit = 'feet' | 'links' | 'lattha';

export type CalculationMethod = 'average' | 'triangular';

export interface DimensionValues {
  sideAB: number;
  sideBC: number;
  sideCD: number;
  sideDA: number;
  diagonalBD: number;
}

export interface LandUnitDefinition {
  id: string;
  name: string;
  hindiName: string;
  region: string;
  sqFtValue: number; // How many sq ft in 1 unit
}

export interface CalculationRecord {
  id: string;
  timestamp: string;
  name: string; // e.g. "Rampur Plot A"
  unit: MeasuringUnit;
  method: CalculationMethod;
  dimensions: DimensionValues;
  areaInSqFt: number;
  shares: number;
}

export const LAND_UNITS: LandUnitDefinition[] = [
  {
    id: 'biswa',
    name: 'Biswa',
    hindiName: 'बिस्वा',
    region: 'North India (UP, HR, PB)',
    sqFtValue: 1220,
  },
  {
    id: 'bigha',
    name: 'Bigha',
    hindiName: 'बीघा',
    region: 'North/West India',
    sqFtValue: 24400,
  },
  {
    id: 'acre',
    name: 'Acre',
    hindiName: 'एकड़',
    region: 'International / India Standard',
    sqFtValue: 43560,
  },
  {
    id: 'kanal',
    name: 'Kanal',
    hindiName: 'कनाल',
    region: 'Punjab & Haryana',
    sqFtValue: 5445,
  },
  {
    id: 'marla',
    name: 'Marla',
    hindiName: 'मरला',
    region: 'Punjab & Haryana',
    sqFtValue: 272.25,
  },
  {
    id: 'decimal',
    name: 'Decimal / Cent',
    hindiName: 'डिसिमिल / सेंट',
    region: 'East & South India',
    sqFtValue: 435.6,
  },
  {
    id: 'guntha',
    name: 'Guntha',
    hindiName: 'गुंठा',
    region: 'Maharashtra & Gujarat',
    sqFtValue: 1089,
  },
  {
    id: 'hectare',
    name: 'Hectare',
    hindiName: 'हेक्टेयर',
    region: 'Standard',
    sqFtValue: 107639,
  },
];
