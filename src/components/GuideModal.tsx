/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { X, Book, HelpCircle, AlertTriangle, Sparkles } from 'lucide-react';
import { Language } from '../locales';
import {
  SQFT_PER_BISWA,
  SQFT_PER_BIGHA,
  SQFT_PER_ACRE,
  SQFT_PER_KANAL,
  SQFT_PER_MARLA,
  SQFT_PER_GUNTHA,
  SQFT_PER_DISMIL,
  BISWA_PER_BIGHA,
} from '../units';

/** "1,220" — the glossary must quote the same numbers the calculator uses. */
const fmt = (n: number) => n.toLocaleString('en-IN');
const SQFT = (n: number) => `${fmt(n)} sq ft`;

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  language: Language;
  t: any;
}

export default function GuideModal({ isOpen, onClose, darkMode, language, t }: GuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex justify-center items-center p-4">
      <div className={`rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-slideUp border ${
        darkMode ? 'bg-stone-900 border-stone-850 text-stone-300' : 'bg-white border-stone-200 text-stone-700'
      }`}>
        {/* Modal Top Control Bar */}
        <div className={`px-6 py-4 border-b flex justify-between items-center ${
          darkMode ? 'border-stone-800 bg-stone-850' : 'border-stone-200 bg-stone-50'
        }`}>
          <div className="flex items-center gap-2">
            <Book className="w-5 h-5 text-amber-600" />
            <h2 className={`font-bold text-sm tracking-wide uppercase ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>
              {t.bilingualFormulaGuide}
            </h2>
          </div>
          <motion.button 
            onClick={onClose} 
            whileTap={{ scale: 0.9 }}
            className={`p-1 rounded transition-colors cursor-pointer ${
              darkMode ? 'hover:bg-stone-800 text-stone-400 hover:text-stone-100' : 'hover:bg-stone-200 text-stone-500 hover:text-stone-800'
            }`}
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm leading-relaxed">
          {/* Section 1: Units Guide */}
          <div className="space-y-3">
            <h3 className={`font-bold text-base flex items-center gap-1.5 border-b pb-2 ${
              darkMode ? 'text-stone-100 border-stone-800' : 'text-stone-900 border-stone-100'
            }`}>
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>{t.baseSurveyUnits}</span>
            </h3>
            <p className={darkMode ? 'text-stone-450' : 'text-stone-650'}>
              {t.unitsGuideIntro}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-3 border rounded-xl space-y-1 ${
                darkMode ? 'bg-stone-850 border-stone-800' : 'bg-stone-50 border-stone-200'
              }`}>
                <span className={`font-bold block text-xs ${darkMode ? 'text-stone-200' : 'text-stone-900'}`}>
                  Feet (फीट)
                </span>
                <p className={`text-xs ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>{t.feetDesc}</p>
                <code className="block text-[11px] text-amber-500 font-mono font-bold mt-1">1 sq ft = 1 sq ft</code>
              </div>

              <div className={`p-3 border rounded-xl space-y-1 ${
                darkMode ? 'bg-stone-850 border-stone-800' : 'bg-stone-50 border-stone-200'
              }`}>
                <span className={`font-bold block text-xs ${darkMode ? 'text-stone-200' : 'text-stone-900'}`}>
                  Links (कड़ी)
                </span>
                <p className={`text-xs ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>{t.linksDesc}</p>
                <code className="block text-[11px] text-amber-500 font-mono font-bold mt-1">1 sq link = 0.4356 sq ft</code>
              </div>

              <div className={`p-3 border rounded-xl space-y-1 ${
                darkMode ? 'bg-stone-850 border-stone-800' : 'bg-stone-50 border-stone-200'
              }`}>
                <span className={`font-bold block text-xs ${darkMode ? 'text-stone-200' : 'text-stone-900'}`}>
                  Lattha (लाठ्ठा / गट्ठा)
                </span>
                <p className={`text-xs ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>{t.latthaDesc}</p>
                <code className="block text-[11px] text-amber-500 font-mono font-bold mt-1">1 sq Lattha = 43.56 sq ft</code>
              </div>
            </div>
          </div>

          {/* Section 2: Calculation Comparison */}
          <div className="space-y-3">
            <h3 className={`font-bold text-base flex items-center gap-1.5 border-b pb-2 ${
              darkMode ? 'text-stone-100 border-stone-800' : 'text-stone-900 border-stone-100'
            }`}>
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <span>{t.formulaMethodsCompared}</span>
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <p className={`font-bold text-xs ${darkMode ? 'text-stone-200' : 'text-stone-800'}`}>
                  {t.villageAverageMethodComparison}
                </p>
                <p className={`text-xs ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                  {t.villageAverageIntro}
                </p>
                <div className={`p-2.5 rounded-lg font-mono text-xs ${
                  darkMode ? 'bg-stone-950 text-amber-400' : 'bg-amber-500/5 text-amber-950'
                }`}>
                  {t.averageFormula}
                </div>
                <div className={`flex gap-2 items-start text-xs p-2.5 rounded-lg mt-1 border ${
                  darkMode ? 'bg-amber-950/20 border-amber-900 text-amber-300' : 'bg-amber-500/5 border-amber-200 text-amber-850'
                }`}>
                  <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                  <p>
                    <strong>{t.calculationBiasWarning}</strong> {t.biasWarningDesc}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <p className={`font-bold text-xs ${darkMode ? 'text-stone-200' : 'text-stone-800'}`}>
                  {t.exactTriangularComparison}
                </p>
                <p className={`text-xs ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                  {t.exactTriangularIntro}
                </p>
                <div className={`p-2.5 rounded-lg font-mono text-xs space-y-1 ${
                  darkMode ? 'bg-stone-950 text-amber-400' : 'bg-amber-500/5 text-amber-950'
                }`}>
                  <p>Semi-perimeter (s) = (a + b + c) / 2</p>
                  <p>Triangle Area = √[s × (s - a) × (s - b) × (s - c)]</p>
                  <p>{t.totalTriangularFormula}</p>
                </div>
                <p className={`text-xs ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                  {t.exactTriangularScaleDesc}
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Indian Land Units Definitions */}
          <div className="space-y-3">
            <h3 className={`font-bold text-base flex items-center gap-1.5 border-b pb-2 ${
              darkMode ? 'text-stone-100 border-stone-800' : 'text-stone-900 border-stone-100'
            }`}>
              <Book className="w-4 h-4 text-amber-600" />
              <span>{t.indianLandUnitsGlossary}</span>
            </h3>
            <p className={darkMode ? 'text-stone-450' : 'text-stone-650'}>
              {t.glossaryIntro}
            </p>

            <div className={`overflow-hidden border rounded-xl ${
              darkMode ? 'border-stone-800' : 'border-stone-200'
            }`}>
              <table className="min-w-full divide-y divide-stone-200 text-xs text-left">
                <thead className={darkMode ? 'bg-stone-850 font-semibold text-stone-300' : 'bg-stone-50 font-semibold text-stone-600'}>
                  <tr>
                    <th className="px-4 py-2">{t.tableUnit}</th>
                    <th className="px-4 py-2">{t.tableHindiName}</th>
                    <th className="px-4 py-2">{t.tableAreaEquivalent}</th>
                    <th className="px-4 py-2">{t.tablePrimaryRegions}</th>
                  </tr>
                </thead>
                <tbody className={`divide-y text-stone-700 font-medium ${
                  darkMode ? 'divide-stone-800 text-stone-300 bg-stone-900' : 'divide-stone-100 text-stone-700 bg-white'
                }`}>
                  <tr>
                    <td className={`px-4 py-2 font-bold ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>Bigha</td>
                    <td className="px-4 py-2">बीघा</td>
                    <td className="px-4 py-2">{SQFT(SQFT_PER_BIGHA)}</td>
                    <td className={`px-4 py-2 ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>UP, Rajasthan, Bihar, Bengal</td>
                  </tr>
                  <tr>
                    <td className={`px-4 py-2 font-bold ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>Biswa</td>
                    <td className="px-4 py-2">बिस्वा</td>
                    <td className="px-4 py-2">{SQFT(SQFT_PER_BISWA)} (1/{BISWA_PER_BIGHA} Bigha)</td>
                    <td className={`px-4 py-2 ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>Uttar Pradesh, Punjab, Haryana</td>
                  </tr>
                  <tr>
                    <td className={`px-4 py-2 font-bold ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>Acre</td>
                    <td className="px-4 py-2">एकड़</td>
                    <td className="px-4 py-2">{SQFT(SQFT_PER_ACRE)}</td>
                    <td className={`px-4 py-2 ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>All India standard</td>
                  </tr>
                  <tr>
                    <td className={`px-4 py-2 font-bold ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>Kanal</td>
                    <td className="px-4 py-2">कनाल</td>
                    <td className="px-4 py-2">{SQFT(SQFT_PER_KANAL)} (1/8 Acre)</td>
                    <td className={`px-4 py-2 ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>Punjab, Haryana, Jammu & Kashmir</td>
                  </tr>
                  <tr>
                    <td className={`px-4 py-2 font-bold ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>Marla</td>
                    <td className="px-4 py-2">मरला</td>
                    <td className="px-4 py-2">{SQFT(SQFT_PER_MARLA)} (1/20 Kanal)</td>
                    <td className={`px-4 py-2 ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>Punjab, Haryana</td>
                  </tr>
                  <tr>
                    <td className={`px-4 py-2 font-bold ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>Guntha</td>
                    <td className="px-4 py-2">गुंठा</td>
                    <td className="px-4 py-2">{SQFT(SQFT_PER_GUNTHA)} (1/40 Acre)</td>
                    <td className={`px-4 py-2 ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>Maharashtra, Gujarat, Karnataka</td>
                  </tr>
                  <tr>
                    <td className={`px-4 py-2 font-bold ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>Decimal / Cent</td>
                    <td className="px-4 py-2">डिसिमिल / सेंट</td>
                    <td className="px-4 py-2">{SQFT(SQFT_PER_DISMIL)} (1/100 Acre)</td>
                    <td className={`px-4 py-2 ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>West Bengal, Odisha, South India</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
