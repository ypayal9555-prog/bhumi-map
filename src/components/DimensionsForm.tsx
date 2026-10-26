/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DimensionValues, MeasuringUnit } from '../types';
import { Ruler, Sparkles } from 'lucide-react';
import { Language } from '../locales';

interface DimensionsFormProps {
  dimensions: DimensionValues;
  unit: MeasuringUnit;
  onDimensionsChanged: (dims: DimensionValues) => void;
  darkMode: boolean;
  language: Language;
  t: any;
  /** True when the typed diagonal describes a noticeably different plot than the four sides do. */
  diagonalMismatch?: boolean;
  /** Diagonal implied by the four sides (used in the mismatch hint). */
  idealDiagonal?: number;
}

export default function DimensionsForm({
  dimensions,
  unit,
  onDimensionsChanged,
  darkMode,
  language,
  t,
  diagonalMismatch = false,
  idealDiagonal = 0,
}: DimensionsFormProps) {
  const getUnitName = () => {
    if (unit === 'links') return t.unitLinks;
    if (unit === 'lattha') return t.unitLattha;
    return t.unitFeet;
  };

  const getLengthSuffix = () => {
    if (unit === 'links') return t.shortLinks;
    if (unit === 'lattha') return t.shortLattha;
    return t.shortFeet;
  };

  const handleInputChange = (field: keyof DimensionValues, valueStr: string) => {
    const val = valueStr === '' ? 0 : parseFloat(valueStr);
    onDimensionsChanged({
      ...dimensions,
      [field]: isNaN(val) ? 0 : val,
    });
  };

  return (
    <div className={`p-5 md:p-6 rounded-2xl border shadow-sm space-y-5 transition-colors duration-300 ${
      darkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'
    }`}>
      {/* Title block */}
      <div className={`flex items-center justify-between border-b pb-3 ${
        darkMode ? 'border-stone-800' : 'border-stone-100'
      }`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-600">
            <Ruler className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className={`text-base font-bold leading-tight ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>
              {t.dimensionsTitle}
            </h2>
            <p className={`text-[11px] font-medium ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
              {t.dimensionsSubtitle} <span className="font-semibold text-brand-600 dark:text-brand-400">{getUnitName()}</span>
            </p>
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-md font-semibold font-mono ${
          darkMode ? 'bg-stone-800 text-stone-300' : 'bg-stone-100 text-stone-600'
        }`}>
          {t.unitLabel}: {getUnitName()}
        </span>
      </div>

      {/* Grid Inputs */}
      <div className="grid grid-cols-2 gap-4">
        {/* AB (East) */}
        <div className="space-y-1">
          <label className={`text-xs font-semibold flex justify-between items-center ${darkMode ? 'text-stone-300' : 'text-stone-700'}`}>
            <span className="flex items-center gap-1">
              <span className="text-brand-700 dark:text-brand-500 font-bold">AB</span> ({t.eastHindi})
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              darkMode ? 'bg-stone-800 text-stone-400' : 'bg-stone-100 text-stone-400'
            }`}>पूर्व</span>
          </label>
          <div className="relative">
            <input
              type="number"
              step="any"
              min="0"
              value={dimensions.sideAB || ''}
              onChange={(e) => handleInputChange('sideAB', e.target.value)}
              placeholder="0.00"
              className={`w-full border focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl p-3 text-sm font-semibold font-mono transition-all ${
                darkMode 
                  ? 'bg-stone-800 border-stone-700 focus:bg-stone-950 text-stone-100 placeholder-stone-600' 
                  : 'bg-stone-50 border-stone-200 focus:bg-white text-stone-900 placeholder-stone-400'
              }`}
            />
          </div>
        </div>

        {/* BC (North) */}
        <div className="space-y-1">
          <label className={`text-xs font-semibold flex justify-between items-center ${darkMode ? 'text-stone-300' : 'text-stone-700'}`}>
            <span className="flex items-center gap-1">
              <span className="text-brand-700 dark:text-brand-500 font-bold">BC</span> ({t.northHindi})
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              darkMode ? 'bg-stone-800 text-stone-400' : 'bg-stone-100 text-stone-400'
            }`}>उत्तर</span>
          </label>
          <div className="relative">
            <input
              type="number"
              step="any"
              min="0"
              value={dimensions.sideBC || ''}
              onChange={(e) => handleInputChange('sideBC', e.target.value)}
              placeholder="0.00"
              className={`w-full border focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl p-3 text-sm font-semibold font-mono transition-all ${
                darkMode 
                  ? 'bg-stone-800 border-stone-700 focus:bg-stone-950 text-stone-100 placeholder-stone-600' 
                  : 'bg-stone-50 border-stone-200 focus:bg-white text-stone-900 placeholder-stone-400'
              }`}
            />
          </div>
        </div>

        {/* CD (West) */}
        <div className="space-y-1">
          <label className={`text-xs font-semibold flex justify-between items-center ${darkMode ? 'text-stone-300' : 'text-stone-700'}`}>
            <span className="flex items-center gap-1">
              <span className="text-brand-700 dark:text-brand-500 font-bold">CD</span> ({t.westHindi})
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              darkMode ? 'bg-stone-800 text-stone-400' : 'bg-stone-100 text-stone-400'
            }`}>पश्चिम</span>
          </label>
          <div className="relative">
            <input
              type="number"
              step="any"
              min="0"
              value={dimensions.sideCD || ''}
              onChange={(e) => handleInputChange('sideCD', e.target.value)}
              placeholder="0.00"
              className={`w-full border focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl p-3 text-sm font-semibold font-mono transition-all ${
                darkMode 
                  ? 'bg-stone-800 border-stone-700 focus:bg-stone-950 text-stone-100 placeholder-stone-600' 
                  : 'bg-stone-50 border-stone-200 focus:bg-white text-stone-900 placeholder-stone-400'
              }`}
            />
          </div>
        </div>

        {/* DA (South) */}
        <div className="space-y-1">
          <label className={`text-xs font-semibold flex justify-between items-center ${darkMode ? 'text-stone-300' : 'text-stone-700'}`}>
            <span className="flex items-center gap-1">
              <span className="text-brand-700 dark:text-brand-500 font-bold">DA</span> ({t.southHindi})
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              darkMode ? 'bg-stone-800 text-stone-400' : 'bg-stone-100 text-stone-400'
            }`}>दक्षिण</span>
          </label>
          <div className="relative">
            <input
              type="number"
              step="any"
              min="0"
              value={dimensions.sideDA || ''}
              onChange={(e) => handleInputChange('sideDA', e.target.value)}
              placeholder="0.00"
              className={`w-full border focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl p-3 text-sm font-semibold font-mono transition-all ${
                darkMode 
                  ? 'bg-stone-800 border-stone-700 focus:bg-stone-950 text-stone-100 placeholder-stone-600' 
                  : 'bg-stone-50 border-stone-200 focus:bg-white text-stone-900 placeholder-stone-400'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Precision Diagonal (Option) */}
      <div className={`pt-4 border-t ${darkMode ? 'border-stone-800' : 'border-stone-100'}`}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-700 dark:text-brand-300">
            <Sparkles className="w-3 h-3" />
          </div>
          <span className="text-[10px] font-bold text-brand-800 dark:text-brand-400 uppercase tracking-wider">
            {t.precisionOption}
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-baseline">
            <label className={`text-xs font-semibold ${darkMode ? 'text-stone-300' : 'text-stone-700'}`}>
              {t.diagonalHindi} <span className={`font-normal ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>({t.diagonalLabel})</span>
            </label>
          </div>

          <div className="relative">
            <input
              type="number"
              step="any"
              min="0"
              value={dimensions.diagonalBD || ''}
              onChange={(e) => handleInputChange('diagonalBD', e.target.value)}
              placeholder={language === 'hi' ? 'विकर्ण की माप दर्ज करें (वैकल्पिक)' : 'Enter diagonal measurement (optional)'}
              className={`w-full border-2 border-dashed focus:border-solid focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl p-3 text-sm font-semibold font-mono transition-all ${
                darkMode 
                  ? 'bg-stone-800 border-stone-700 focus:bg-stone-950 text-stone-100 placeholder-stone-600' 
                  : 'bg-stone-50 border-stone-200 focus:bg-white text-stone-900 placeholder-stone-400'
              }`}
            />
          </div>
          <p className={`text-[10px] ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
            {t.precisionNotice}
          </p>

          {diagonalMismatch && (
            <div
              role="alert"
              className={`mt-2 p-3 rounded-xl border text-[11px] leading-relaxed ${
                darkMode
                  ? 'bg-warn-500/10 border-warn-500/35 text-warn-200'
                  : 'bg-warn-50 border-warn-300 text-warn-900'
              }`}
            >
              <p className="font-bold mb-0.5">⚠ {t.diagonalMismatchTitle}</p>
              <p>
                {t.diagonalMismatchBody}{' '}
                <span className="font-mono font-bold">
                  ≈ {idealDiagonal.toFixed(1)} {getLengthSuffix()}
                </span>
                . {t.diagonalMismatchHint}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
