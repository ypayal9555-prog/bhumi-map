/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DimensionValues, CalculationMethod, MeasuringUnit } from '../types';
import { BookOpen, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { Language } from '../locales';
import { SQFT_PER_BISWA, SQFT_PER_BIGHA } from '../units';

interface MethodAccordionProps {
  method: CalculationMethod;
  dimensions: DimensionValues;
  unit: MeasuringUnit;
  darkMode: boolean;
  language: Language;
  t: any;
  /**
   * True when the user supplied a diagonal but it cannot describe a real triangle,
   * so the headline area actually comes from the Village Average method. The badge
   * must say so instead of claiming "Exact Triangular".
   */
  isFallback?: boolean;
}

export default function MethodAccordion({ method, dimensions, unit, darkMode, language, t, isFallback = false }: MethodAccordionProps) {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const { sideAB, sideBC, sideCD, sideDA, diagonalBD } = dimensions;

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  // Determine if a math error exists (triangle inequality check)
  const isTriangularError = () => {
    if (method !== 'triangular' || !diagonalBD) return false;
    
    // Triangle 1: AB, DA, BD
    const t1Fail = (sideAB + sideDA <= diagonalBD) || (sideAB + diagonalBD <= sideDA) || (sideDA + diagonalBD <= sideAB);
    // Triangle 2: BC, CD, BD
    const t2Fail = (sideBC + sideCD <= diagonalBD) || (sideBC + diagonalBD <= sideCD) || (sideCD + diagonalBD <= sideBC);
    
    return t1Fail || t2Fail;
  };

  // What the headline number actually is (a bad diagonal silently falls back to average).
  const shownMethod: CalculationMethod = isFallback ? 'average' : method;

  const hasTriError = isTriangularError();

  const isHi = language === 'hi';

  // Unit translation & formatting
  let unitSuffix = isHi ? 'वर्ग फुट' : 'sq ft';
  let factor = 1;
  let factorExpression = '';

  if (unit === 'links') {
    factor = 0.4356;
    unitSuffix = isHi ? 'वर्ग कड़ी' : 'sq links';
    factorExpression = isHi 
      ? '1 वर्ग कड़ी = 0.4356 वर्ग फुट (0.66 फुट × 0.66 फुट)' 
      : '1 Sq Link = 0.4356 Sq Ft (0.66 ft × 0.66 ft)';
  } else if (unit === 'lattha') {
    factor = 43.56;
    unitSuffix = isHi ? 'वर्ग लाठ्ठा' : 'sq lattha';
    factorExpression = isHi 
      ? '1 वर्ग लाठ्ठा = 43.56 वर्ग फुट (6.6 फुट × 6.6 फुट)' 
      : '1 Sq Lattha = 43.56 Sq Ft (6.6 ft × 6.6 ft)';
  }

  // calculations
  const avgWidth = (sideAB + sideCD) / 2;
  const avgHeight = (sideBC + sideDA) / 2;
  const avgAreaInUnit = avgWidth * avgHeight;
  const avgAreaInSqFt = avgAreaInUnit * factor;
  const avgBiswa = avgAreaInSqFt / SQFT_PER_BISWA;
  const avgBigha = avgAreaInSqFt / SQFT_PER_BIGHA;

  // Triangle calculations
  const s1 = (sideAB + sideDA + (diagonalBD || 0)) / 2;
  const areaSq1 = s1 * (s1 - sideAB) * (s1 - sideDA) * (s1 - (diagonalBD || 0));
  const triArea1 = areaSq1 > 0 ? Math.sqrt(areaSq1) : 0;

  const s2 = (sideBC + sideCD + (diagonalBD || 0)) / 2;
  const areaSq2 = s2 * (s2 - sideBC) * (s2 - sideCD) * (s2 - (diagonalBD || 0));
  const triArea2 = areaSq2 > 0 ? Math.sqrt(areaSq2) : 0;

  const triTotalAreaInUnit = triArea1 + triArea2;
  const triAreaInSqFt = triTotalAreaInUnit * factor;
  const triBiswa = triAreaInSqFt / SQFT_PER_BISWA;
  const triBigha = triAreaInSqFt / SQFT_PER_BIGHA;

  return (
    <div className={`border rounded-2xl overflow-hidden shadow-sm transition-colors duration-300 ${
      darkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'
    }`}>
      {/* Accordion Trigger & Selector */}
      <div 
        className={`flex items-center justify-between p-4 border-b gap-3 cursor-pointer select-none transition-colors ${
          darkMode ? 'bg-stone-800/40 border-stone-800' : 'bg-stone-50 border-stone-100'
        }`} 
        onClick={toggleAccordion}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-700 shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className={`text-sm font-bold ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>
              {t.methodTitle}
            </h3>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              {shownMethod === 'triangular' ? `📐 ${t.methodTriangularMode}` : `🌾 ${t.methodAverageMode}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider hidden sm:inline-block bg-amber-500/10 text-amber-800 dark:text-amber-300">
            {shownMethod === 'triangular' ? t.diagonalBadge : t.averageBadge}
          </span>
          <button className={`p-1 ${darkMode ? 'text-stone-400 hover:text-stone-100' : 'text-stone-500 hover:text-stone-700'}`}>
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Accordion Content */}
      {isOpen && (
        <div className={`p-5 space-y-4 animate-slideDown ${darkMode ? 'text-stone-300' : 'text-stone-700'}`}>
          {isFallback && (
            <div
              role="alert"
              className={`p-3 rounded-xl border text-[11px] leading-relaxed font-semibold ${
                darkMode
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                  : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}
            >
              ⚠ {t.fallbackNote}
            </div>
          )}
          {shownMethod === 'average' ? (
            <div className="space-y-4">
              <p className="text-xs leading-relaxed">
                {t.averageMethodDesc}
              </p>
              
              {/* Formula Panel */}
              <div className={`p-3 rounded-xl font-mono text-xs font-bold ${
                darkMode ? 'bg-stone-950 text-amber-400' : 'bg-amber-500/5 text-amber-900 border border-amber-500/10'
              }`}>
                {t.averageFormula}
              </div>

              {/* Dynamic steps */}
              <div className="space-y-3 pt-2">
                <p className={`font-bold uppercase tracking-widest text-[9px] ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                  {t.mathBreakdown}
                </p>

                {/* Step 1: Average Width */}
                <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-stone-800 border-stone-800' : 'bg-stone-50 border-stone-100'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/15 flex items-center justify-center text-[10px] font-bold text-amber-700">1</span>
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${darkMode ? 'text-stone-200' : 'text-stone-800'}`}>
                      {t.stepAverageWidthTitle}
                    </span>
                  </div>
                  <div className="font-mono text-xs space-y-1 pl-7">
                    <p className="opacity-70">{t.formulaLabel}: (AB + CD) ÷ 2</p>
                    <p className="font-bold text-sm">
                      ({sideAB} + {sideCD}) ÷ 2 = <span className="text-amber-600 dark:text-amber-400">{avgWidth.toFixed(2)} {unit === 'feet' ? t.unitFeetLabel : unit === 'links' ? t.unitLinksLabel : t.unitLatthaLabel}</span>
                    </p>
                  </div>
                </div>

                {/* Step 2: Average Height */}
                <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-stone-800 border-stone-800' : 'bg-stone-50 border-stone-100'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/15 flex items-center justify-center text-[10px] font-bold text-amber-700">2</span>
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${darkMode ? 'text-stone-200' : 'text-stone-800'}`}>
                      {t.stepAverageHeightTitle}
                    </span>
                  </div>
                  <div className="font-mono text-xs space-y-1 pl-7">
                    <p className="opacity-70">{t.formulaLabel}: (BC + DA) ÷ 2</p>
                    <p className="font-bold text-sm">
                      ({sideBC} + {sideDA}) ÷ 2 = <span className="text-amber-600 dark:text-amber-400">{avgHeight.toFixed(2)} {unit === 'feet' ? t.unitFeetLabel : unit === 'links' ? t.unitLinksLabel : t.unitLatthaLabel}</span>
                    </p>
                  </div>
                </div>

                {/* Step 3: Area in Selected Unit */}
                <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-stone-800 border-stone-800' : 'bg-stone-50 border-stone-100'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/15 flex items-center justify-center text-[10px] font-bold text-amber-700">3</span>
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${darkMode ? 'text-stone-200' : 'text-stone-800'}`}>
                      {t.stepCalculatedAreaTitle}
                    </span>
                  </div>
                  <div className="font-mono text-xs space-y-1 pl-7">
                    <p className="opacity-70">{t.formulaLabel}: {t.stepAverageWidthTitle} × {t.stepAverageHeightTitle}</p>
                    <p className="font-bold text-sm">
                      {avgWidth.toFixed(2)} × {avgHeight.toFixed(2)} = <span className="text-amber-600 dark:text-amber-400">{avgAreaInUnit.toLocaleString(undefined, { maximumFractionDigits: 2 })} {unitSuffix}</span>
                    </p>
                  </div>
                </div>

                {/* Step 4: Convert to Standard Sq Ft */}
                {unit !== 'feet' && (
                  <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-stone-800 border-stone-800' : 'bg-stone-50 border-stone-100'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500/15 flex items-center justify-center text-[10px] font-bold text-amber-700">4</span>
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${darkMode ? 'text-stone-200' : 'text-stone-800'}`}>
                        {t.convertToSqFtTitle}
                      </span>
                    </div>
                    <div className="font-mono text-xs space-y-1 pl-7">
                      <p className="opacity-70">{factorExpression}</p>
                      <p className="font-bold text-sm">
                        {avgAreaInUnit.toFixed(2)} × {factor} = <span className="text-amber-600 dark:text-amber-400">{avgAreaInSqFt.toLocaleString(undefined, { maximumFractionDigits: 2 })} {isHi ? 'वर्ग फुट' : 'sq ft'}</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 5: Convert to Biswa */}
                <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-stone-800 border-stone-800' : 'bg-stone-50 border-stone-100'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/15 flex items-center justify-center text-[10px] font-bold text-amber-700">
                      {unit === 'feet' ? '4' : '5'}
                    </span>
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${darkMode ? 'text-stone-200' : 'text-stone-800'}`}>
                      {t.convertToBiswaTitle}
                    </span>
                  </div>
                  <div className="font-mono text-xs space-y-1 pl-7">
                    <p className="opacity-70">
                      {isHi ? '1 बिस्वा = 1,220 वर्ग फुट' : '1 Biswa = 1,220 Sq Ft'}
                    </p>
                    <p className="font-bold text-sm">
                      {avgAreaInSqFt.toFixed(2)} ÷ 1,220 = <span className="text-amber-600 dark:text-amber-400">{avgBiswa.toLocaleString(undefined, { maximumFractionDigits: 3 })} {t.biswa}</span>
                    </p>
                  </div>
                </div>

                {/* Step 6: Convert to Bigha */}
                <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-stone-800 border-stone-800' : 'bg-stone-50 border-stone-100'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/15 flex items-center justify-center text-[10px] font-bold text-amber-700">
                      {unit === 'feet' ? '5' : '6'}
                    </span>
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${darkMode ? 'text-stone-200' : 'text-stone-800'}`}>
                      {t.convertToBighaTitle}
                    </span>
                  </div>
                  <div className="font-mono text-xs space-y-1 pl-7">
                    <p className="opacity-70">
                      {isHi ? '1 बीघा = 20 बिस्वा = 24,400 वर्ग फुट' : '1 Bigha = 20 Biswa = 24,400 Sq Ft'}
                    </p>
                    <p className="font-bold text-sm">
                      {avgAreaInSqFt.toFixed(2)} ÷ 24,400 = <span className="text-amber-600 dark:text-amber-400">{avgBigha.toLocaleString(undefined, { maximumFractionDigits: 3 })} {t.bigha}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs leading-relaxed">
                {t.triangularMethodDesc}
              </p>

              {/* Formula Panel */}
              <div className={`p-3 rounded-xl font-mono text-xs space-y-1 ${
                darkMode ? 'bg-stone-950 text-amber-400' : 'bg-amber-500/5 text-amber-950 border border-amber-500/10'
              }`}>
                <p className="font-bold">{t.triangularFormula}</p>
                <p className="text-[10px] opacity-80">{t.totalTriangularFormula}</p>
              </div>

              {/* Error Warning if diagonal doesn't fit geometry */}
              {hasTriError ? (
                <div className="flex gap-2.5 items-start bg-red-500/5 border border-red-500/20 p-3 rounded-xl text-red-900 dark:text-red-400">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-500 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold">{t.invalidTriangle}</p>
                    <p className="opacity-90 mt-0.5">{t.invalidTriangleDesc}</p>
                  </div>
                </div>
              ) : (
                /* Dynamic Heron math steps */
                <div className="space-y-3 pt-2">
                  <p className={`font-bold uppercase tracking-widest text-[9px] ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                    {t.mathBreakdown}
                  </p>
                  
                  {/* Step 1: Triangle 1 math */}
                  <div className={`p-3.5 rounded-xl border ${
                    darkMode ? 'bg-stone-800 border-stone-800' : 'bg-stone-50 border-stone-100'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500/15 flex items-center justify-center text-[10px] font-bold text-amber-700">1</span>
                      <span className={`text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400`}>
                        🔺 {t.stepArea1Title}
                      </span>
                    </div>
                    <div className="font-mono text-xs space-y-1 pl-7 opacity-95">
                      <p className="opacity-70">{isHi ? 'भुजाएं' : 'Sides'}: a = {sideAB}, b = {sideDA}, c = {diagonalBD}</p>
                      <p>s1 ({t.stepSemiPerimeter}) = ({sideAB} + {sideDA} + {diagonalBD}) ÷ 2 = <strong>{s1.toFixed(2)}</strong></p>
                      <p className="leading-relaxed">
                        {isHi ? 'क्षेत्रफल १' : 'Area1'} = √[s1 × (s1-a) × (s1-b) × (s1-c)] <br />
                        = √[{s1.toFixed(1)} × {(s1 - sideAB).toFixed(1)} × {(s1 - sideDA).toFixed(1)} × {(s1 - (diagonalBD || 0)).toFixed(1)}] <br />
                        = √[{(s1 * (s1 - sideAB) * (s1 - sideDA) * (s1 - (diagonalBD || 0))).toFixed(1)}] <br />
                        = <span className="text-amber-600 dark:text-amber-400 font-bold text-sm">{triArea1.toLocaleString(undefined, { maximumFractionDigits: 2 })} {unitSuffix}</span>
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Triangle 2 math */}
                  <div className={`p-3.5 rounded-xl border ${
                    darkMode ? 'bg-stone-800 border-stone-800' : 'bg-stone-50 border-stone-100'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500/15 flex items-center justify-center text-[10px] font-bold text-amber-700">2</span>
                      <span className={`text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400`}>
                        🔺 {t.stepArea2Title}
                      </span>
                    </div>
                    <div className="font-mono text-xs space-y-1 pl-7 opacity-95">
                      <p className="opacity-70">{isHi ? 'भुजाएं' : 'Sides'}: a = {sideBC}, b = {sideCD}, c = {diagonalBD}</p>
                      <p>s2 ({t.stepSemiPerimeter}) = ({sideBC} + {sideCD} + {diagonalBD}) ÷ 2 = <strong>{s2.toFixed(2)}</strong></p>
                      <p className="leading-relaxed">
                        {isHi ? 'क्षेत्रफल २' : 'Area2'} = √[s2 × (s2-a) × (s2-b) × (s2-c)] <br />
                        = √[{s2.toFixed(1)} × {(s2 - sideBC).toFixed(1)} × {(s2 - sideCD).toFixed(1)} × {(s2 - (diagonalBD || 0)).toFixed(1)}] <br />
                        = √[{(s2 * (s2 - sideBC) * (s2 - sideCD) * (s2 - (diagonalBD || 0))).toFixed(1)}] <br />
                        = <span className="text-amber-600 dark:text-amber-400 font-bold text-sm">{triArea2.toLocaleString(undefined, { maximumFractionDigits: 2 })} {unitSuffix}</span>
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Total Area Summation */}
                  <div className={`p-3.5 rounded-xl border ${
                    darkMode ? 'bg-stone-800 border-stone-800' : 'bg-stone-50 border-stone-100'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500/15 flex items-center justify-center text-[10px] font-bold text-amber-700">3</span>
                      <span className={`text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400`}>
                        {t.stepTotalAreaTitle}
                      </span>
                    </div>
                    <div className="font-mono text-xs space-y-1 pl-7 opacity-95">
                      <p className="opacity-70">{t.formulaLabel}: {isHi ? 'क्षेत्रफल १' : 'Area1'} + {isHi ? 'क्षेत्रफल २' : 'Area2'}</p>
                      <p className="font-bold text-sm">
                        {triArea1.toFixed(2)} + {triArea2.toFixed(2)} = <span className="text-amber-600 dark:text-amber-400">{triTotalAreaInUnit.toLocaleString(undefined, { maximumFractionDigits: 2 })} {unitSuffix}</span>
                      </p>
                    </div>
                  </div>

                  {/* Step 4: Convert to Standard Sq Ft */}
                  {unit !== 'feet' && (
                    <div className={`p-3.5 rounded-xl border ${
                      darkMode ? 'bg-stone-800 border-stone-800' : 'bg-stone-50 border-stone-100'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-5 h-5 rounded-full bg-amber-500/15 flex items-center justify-center text-[10px] font-bold text-amber-700">4</span>
                        <span className={`text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400`}>
                          {t.convertToSqFtTitle}
                        </span>
                      </div>
                      <div className="font-mono text-xs space-y-1 pl-7 opacity-95">
                        <p className="opacity-70">{factorExpression}</p>
                        <p className="font-bold text-sm">
                          {triTotalAreaInUnit.toFixed(2)} × {factor} = <span className="text-amber-600 dark:text-amber-400">{triAreaInSqFt.toLocaleString(undefined, { maximumFractionDigits: 2 })} {isHi ? 'वर्ग फुट' : 'sq ft'}</span>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Step 5: Convert to Biswa */}
                  <div className={`p-3.5 rounded-xl border ${
                    darkMode ? 'bg-stone-800 border-stone-800' : 'bg-stone-50 border-stone-100'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500/15 flex items-center justify-center text-[10px] font-bold text-amber-700">
                        {unit === 'feet' ? '4' : '5'}
                      </span>
                      <span className={`text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400`}>
                        {t.convertToBiswaTitle}
                      </span>
                    </div>
                    <div className="font-mono text-xs space-y-1 pl-7 opacity-95">
                      <p className="opacity-70">
                        {isHi ? '1 बिस्वा = 1,220 वर्ग फुट' : '1 Biswa = 1,220 Sq Ft'}
                      </p>
                      <p className="font-bold text-sm">
                        {triAreaInSqFt.toFixed(2)} ÷ 1,220 = <span className="text-amber-600 dark:text-amber-400">{triBiswa.toLocaleString(undefined, { maximumFractionDigits: 3 })} {t.biswa}</span>
                      </p>
                    </div>
                  </div>

                  {/* Step 6: Convert to Bigha */}
                  <div className={`p-3.5 rounded-xl border ${
                    darkMode ? 'bg-stone-800 border-stone-800' : 'bg-stone-50 border-stone-100'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500/15 flex items-center justify-center text-[10px] font-bold text-amber-700">
                        {unit === 'feet' ? '5' : '6'}
                      </span>
                      <span className={`text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400`}>
                        {t.convertToBighaTitle}
                      </span>
                    </div>
                    <div className="font-mono text-xs space-y-1 pl-7 opacity-95">
                      <p className="opacity-70">
                        {isHi ? '1 बीघा = 20 बिस्वा = 24,400 वर्ग फुट' : '1 Bigha = 20 Biswa = 24,400 Sq Ft'}
                      </p>
                      <p className="font-bold text-sm">
                        {triAreaInSqFt.toFixed(2) } ÷ 24,400 = <span className="text-amber-600 dark:text-amber-400">{triBigha.toLocaleString(undefined, { maximumFractionDigits: 3 })} {t.bigha}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
