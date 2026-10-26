/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Users, Minus, Plus } from 'lucide-react';

interface SplitSharesProps {
  sharesCount: number;
  areaInSqFt: number;
  activeUnitLabel: string;
  onSharesChanged: (count: number) => void;
  darkMode: boolean;
  t: any;
}

export default function SplitShares({
  sharesCount,
  areaInSqFt,
  activeUnitLabel,
  onSharesChanged,
  darkMode,
  t,
}: SplitSharesProps) {
  const handleDecrement = () => {
    if (sharesCount > 1) {
      onSharesChanged(sharesCount - 1);
    }
  };

  const handleIncrement = () => {
    onSharesChanged(sharesCount + 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val > 0) {
      onSharesChanged(val);
    }
  };

  const shareValue = areaInSqFt / sharesCount;

  return (
    <div className={`p-5 rounded-2xl border shadow-sm relative group transition-colors duration-300 ${
      darkMode ? 'bg-stone-900 border-stone-800' : 'bg-stone-50 border-stone-200'
    }`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-700">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h3 className={`text-base font-bold ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>
            {t.splittingShares}
          </h3>
          <p className={`text-[11px] font-medium ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
            {t.splittingSubtitle}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <label className={`text-xs font-semibold ${darkMode ? 'text-stone-300' : 'text-stone-700'}`}>
            {t.numPartners} (साझेदारों की संख्या)
          </label>
          <div className="relative flex items-center">
            <motion.button
              onClick={handleDecrement}
              disabled={sharesCount <= 1}
              whileTap={{ scale: 0.9 }}
              className={`absolute left-3 w-8 h-8 rounded-full flex items-center justify-center border duration-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm ${
                darkMode 
                  ? 'bg-stone-800 border-stone-700 hover:bg-stone-700 text-stone-200' 
                  : 'bg-white border-stone-200 hover:bg-stone-50 text-stone-600'
              }`}
            >
              <Minus className="w-3.5 h-3.5" />
            </motion.button>
            <input
              type="number"
              min="1"
              value={sharesCount}
              onChange={handleInputChange}
              className={`w-full text-center border focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl p-3 text-sm font-semibold font-mono ${
                darkMode
                  ? 'bg-stone-850 border-stone-750 text-stone-100 focus:bg-stone-950'
                  : 'bg-white border-stone-200 text-stone-900 focus:bg-white'
              }`}
            />
            <motion.button
              onClick={handleIncrement}
              whileTap={{ scale: 0.9 }}
              className={`absolute right-3 w-8 h-8 rounded-full flex items-center justify-center border duration-100 cursor-pointer shadow-sm ${
                darkMode 
                  ? 'bg-stone-800 border-stone-700 hover:bg-stone-700 text-stone-200' 
                  : 'bg-white border-stone-200 hover:bg-stone-50 text-stone-600'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>

        <div className={`p-4 rounded-xl border flex justify-between items-center transition-all ${
          darkMode ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-505/5 bg-amber-500/5 border-amber-500/10'
        }`}>
          <div>
            <span className={`text-xs font-medium block ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
              {t.shareEach}
            </span>
            <span className="text-xl font-bold text-amber-700 dark:text-amber-400">
              {shareValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <span className="text-[10px] font-bold text-white bg-amber-600 px-2 py-1 rounded tracking-wide uppercase">
            {activeUnitLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
