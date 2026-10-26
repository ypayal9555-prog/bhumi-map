/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CalculationRecord, LAND_UNITS } from '../types';
import { Trash2, Calendar, CheckCircle, Save, Layers } from 'lucide-react';

interface HistoryListProps {
  records: CalculationRecord[];
  onSaveCurrent: (name: string) => void;
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
  darkMode: boolean;
  t: any;
}

export default function HistoryList({
  records,
  onSaveCurrent,
  onDeleteRecord,
  onClearAll,
  darkMode,
  t,
}: HistoryListProps) {
  const [plotName, setPlotName] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = plotName.trim() || `Plot #${records.length + 1}`;
    onSaveCurrent(finalName);
    setPlotName('');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  // Format date helper
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className={`p-5 md:p-6 rounded-2xl border shadow-sm space-y-5 transition-colors duration-300 ${
      darkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'
    }`}>
      <div className={`flex items-center justify-between border-b pb-3 ${
        darkMode ? 'border-stone-850' : 'border-stone-100'
      }`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-600">
            <Layers className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className={`text-base font-bold leading-tight ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>
              {t.savedComputations}
            </h2>
            <p className={`text-[11px] font-medium ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
              {t.historyLogs}
            </p>
          </div>
        </div>
        {records.length > 0 && (
          <motion.button
            onClick={onClearAll}
            whileTap={{ scale: 0.95 }}
            className="text-xs text-red-600 dark:text-red-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer select-none"
          >
            <Trash2 className="w-3 h-3" />
            <span>{t.clearAll}</span>
          </motion.button>
        )}
      </div>

      {/* Save current formulation */}
      <form onSubmit={handleSave} className={`p-4 rounded-xl border space-y-3 ${
        darkMode ? 'bg-stone-850 border-stone-800' : 'bg-stone-50 border-stone-200/60'
      }`}>
        <div className="space-y-1">
          <label className={`text-xs font-semibold ${darkMode ? 'text-stone-300' : 'text-stone-700'}`}>
            {t.savePlotLabel}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={plotName}
              onChange={(e) => setPlotName(e.target.value)}
              placeholder={t.plotPlaceholder}
              className={`flex-1 border rounded-lg p-2 text-xs font-semibold transition-all ${
                darkMode
                  ? 'bg-stone-800 border-stone-700 text-stone-100 focus:border-brand-500 placeholder-stone-600'
                  : 'bg-white border-stone-200 text-stone-900 focus:border-brand-500 placeholder-stone-400'
              }`}
            />
            <motion.button
              type="submit"
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              className="bg-brand-600 text-white px-3 py-2 rounded-lg font-bold text-xs hover:bg-brand-700 transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer shadow-sm select-none"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{t.savedButton}</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{t.saveButton}</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </form>

      {/* History Items List */}
      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
        {records.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <p className="text-stone-400 text-xs font-medium">{t.noSavedCalculations}</p>
            <p className="text-stone-400 text-[10px]">{t.noSavedSubtitle}</p>
          </div>
        ) : (
          records.map((rec) => {
            // Find converted Indian units for history card
            const biswaDef = LAND_UNITS.find((u) => u.id === 'biswa')!;
            const bighaDef = LAND_UNITS.find((u) => u.id === 'bigha')!;
            const biswaVal = rec.areaInSqFt / biswaDef.sqFtValue;
            const bighaVal = rec.areaInSqFt / bighaDef.sqFtValue;

            return (
              <div
                key={rec.id}
                className={`p-4 rounded-xl border transition-all space-y-3 relative group/item shadow-sm ${
                  darkMode 
                    ? 'border-stone-800 bg-stone-850 hover:border-brand-500/50 hover:bg-stone-800/80' 
                    : 'border-stone-200 bg-white hover:border-brand-500/50 hover:bg-stone-50/40'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className={`font-bold text-sm ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>{rec.name}</h4>
                    <p className="text-[10px] text-stone-400 flex items-center gap-1 font-medium mt-0.5">
                      <Calendar className="w-3 h-3 text-stone-400" />
                      {formatDate(rec.timestamp)}
                    </p>
                  </div>
                  <motion.button
                    onClick={() => onDeleteRecord(rec.id)}
                    whileTap={{ scale: 0.85 }}
                    className={`p-1.5 rounded transition-all cursor-pointer select-none md:opacity-0 md:group-hover/item:opacity-100 ${
                      darkMode ? 'text-stone-500 hover:text-red-400 hover:bg-red-950/25' : 'text-stone-400 hover:text-red-600 hover:bg-red-50'
                    }`}
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </motion.button>
                </div>

                {/* Dimensions display */}
                <div className={`grid grid-cols-4 gap-1.5 text-[10px] font-mono border p-2 rounded-lg ${
                  darkMode 
                    ? 'text-stone-400 bg-stone-900 border-stone-800' 
                    : 'text-stone-500 bg-stone-50 border-stone-100'
                }`}>
                  <div>
                    <span className={`font-sans font-bold ${darkMode ? 'text-stone-300' : 'text-stone-700'}`}>AB:</span> {rec.dimensions.sideAB}
                  </div>
                  <div>
                    <span className={`font-sans font-bold ${darkMode ? 'text-stone-300' : 'text-stone-700'}`}>BC:</span> {rec.dimensions.sideBC}
                  </div>
                  <div>
                    <span className={`font-sans font-bold ${darkMode ? 'text-stone-300' : 'text-stone-700'}`}>CD:</span> {rec.dimensions.sideCD}
                  </div>
                  <div>
                    <span className={`font-sans font-bold ${darkMode ? 'text-stone-300' : 'text-stone-700'}`}>DA:</span> {rec.dimensions.sideDA}
                  </div>
                  {rec.dimensions.diagonalBD > 0 && (
                    <div className={`col-span-4 border-t pt-1 mt-0.5 ${darkMode ? 'border-stone-800' : 'border-stone-200/60'}`}>
                      <span className={`font-sans font-bold ${darkMode ? 'text-stone-300' : 'text-stone-700'}`}>Diag BD:</span> {rec.dimensions.diagonalBD}
                    </div>
                  )}
                </div>

                {/* Calculation Details */}
                <div className={`flex justify-between items-end border-t pt-2.5 ${darkMode ? 'border-stone-800' : 'border-stone-100'}`}>
                  <div className="space-y-0.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider ${
                      darkMode ? 'bg-stone-800 text-stone-300' : 'bg-stone-100 text-stone-600'
                    }`}>
                      {rec.method === 'average' ? t.averageBadge : t.diagonalBadge}
                    </span>
                    <span className="text-[10px] text-stone-500 ml-1.5 font-medium">{t.unitLabel}: {rec.unit}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-stone-500 text-[10px] font-medium block">{t.totalCalculatedArea}:</span>
                    <span className={`font-bold text-sm font-mono ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>
                      {rec.areaInSqFt.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                      <span className="text-[10px] font-normal text-stone-500 ml-0.5">sq ft</span>
                    </span>
                    <div className="text-[10px] text-brand-700 dark:text-brand-400 font-semibold font-mono mt-0.5">
                      {biswaVal.toFixed(2)} {t.biswa} • {bighaVal.toFixed(2)} {t.bigha}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
