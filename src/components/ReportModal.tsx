/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { DimensionValues, MeasuringUnit, CalculationMethod, LAND_UNITS } from '../types';
import { Printer, X, Award, FileSpreadsheet, Share2, Copy, Check, Send } from 'lucide-react';
import { getCoordinatesFromDimensions } from '../geometryUtils';
import { SQFT_PER_BISWA, SQFT_PER_BIGHA, SQFT_PER_ACRE } from '../units';
import { Language } from '../locales';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  dimensions: DimensionValues;
  unit: MeasuringUnit;
  method: CalculationMethod;
  areaInSqFt: number;
  calculatedAreaInUnit: number;
  sharesCount: number;
  darkMode: boolean;
  language: Language;
  t: any;
}

export default function ReportModal({
  isOpen,
  onClose,
  dimensions,
  unit,
  method,
  areaInSqFt,
  calculatedAreaInUnit,
  sharesCount,
  darkMode,
  language,
  t,
}: ReportModalProps) {
  const printAreaRef = useRef<HTMLDivElement | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const today = new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const getUnitSuffix = () => {
    if (unit === 'feet') return 'sq ft';
    if (unit === 'links') return 'sq links';
    return 'sq lattha';
  };

  const getUnitLabel = () => {
    if (unit === 'feet') return 'Feet';
    if (unit === 'links') return 'Links';
    return 'Lattha';
  };

  const getShareText = () => {
    const biswaVal = areaInSqFt / SQFT_PER_BISWA;
    const bighaVal = areaInSqFt / SQFT_PER_BIGHA;
    const acreVal = areaInSqFt / SQFT_PER_ACRE;
    const unitSuffix = getUnitSuffix();
    const unitLabel = getUnitLabel();
    
    if (language === 'hi') {
      return `🌾 *भू-मापन प्रमाण पत्र रिपोर्ट* 🌾
----------------------------------
📅 दिनांक: ${today}
🛠️ मापन विधि: ${method === 'average' ? 'ग्राम पंचायत औसत विधि' : 'त्रिकोणीय सटीक विधि (100% सटीक)'}
📐 कुल क्षेत्रफल: *${calculatedAreaInUnit.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${unitSuffix}*
${unit !== 'feet' ? `≈ ${areaInSqFt.toLocaleString(undefined, { maximumFractionDigits: 1 })} वर्ग फीट` : ''}

🗺️ *क्षेत्रफल रूपांतरण (Land Units):*
• बीघा (Bigha): *${bighaVal.toFixed(3)}*
• बिस्वा (Biswa): *${biswaVal.toFixed(2)}*
• एकड़ (Acre): *${acreVal.toFixed(3)}*

📏 *भुजाओं का माप (Dimensions):*
• Side AB: ${dimensions.sideAB} ${unitLabel}
• Side BC: ${dimensions.sideBC} ${unitLabel}
• Side CD: ${dimensions.sideCD} ${unitLabel}
• Side DA: ${dimensions.sideDA} ${unitLabel}
${dimensions.diagonalBD ? `• Diagonal BD: ${dimensions.diagonalBD} ${unitLabel}` : ''}

👥 *हिस्सा विभाजन (${sharesCount} हिस्सेदार):*
• प्रति व्यक्ति हिस्सा: *${(calculatedAreaInUnit / sharesCount).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${unitSuffix}*

📱 *भूमि मानचित्र भू-मापक द्वारा मापा गया*
🌐 इस टूल का उपयोग करें: ${window.location.origin}`;
    } else {
      return `🌾 *Land Survey Report* 🌾
----------------------------------
📅 Date: ${today}
🛠️ Method: ${method === 'average' ? 'Village Average Formula' : 'Triangular Method (Exact)'}
📐 Total Area: *${calculatedAreaInUnit.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${unitSuffix}*
${unit !== 'feet' ? `≈ ${areaInSqFt.toLocaleString(undefined, { maximumFractionDigits: 1 })} sq ft` : ''}

🗺️ *Regional Land Units:*
• Bigha: *${bighaVal.toFixed(3)}*
• Biswa: *${biswaVal.toFixed(2)}*
• Acre: *${acreVal.toFixed(3)}*

📏 *Dimensions:*
• Side AB: ${dimensions.sideAB} ${unitLabel}
• Side BC: ${dimensions.sideBC} ${unitLabel}
• Side CD: ${dimensions.sideCD} ${unitLabel}
• Side DA: ${dimensions.sideDA} ${unitLabel}
${dimensions.diagonalBD ? `• Diagonal BD: ${dimensions.diagonalBD} ${unitLabel}` : ''}

👥 *Partition / Division (${sharesCount} Share(s)):*
• Area per person: *${(calculatedAreaInUnit / sharesCount).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${unitSuffix}*

📱 *Measured using Bhumi Map tool*
🌐 Try the app here: ${window.location.origin}`;
    }
  };

  const handleShare = async () => {
    const text = getShareText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: language === 'hi' ? 'भू-मापन रिपोर्ट (Land Survey Report)' : 'Land Survey Report',
          text: text,
        });
      } catch (err) {
        console.log('Share error/cancel:', err);
      }
    } else {
      handleCopy();
    }
  };

  const handleCopy = () => {
    const text = getShareText();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      });
    } else {
      // Fallback text area copy
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch (err) {
        console.error('Fallback copy failed', err);
      }
      document.body.removeChild(textArea);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Calculate coordinates for the SVG visualization
  const points = getCoordinatesFromDimensions(dimensions, 300, 220);
  const pA = points.find((p) => p.id === 'A')!;
  const pB = points.find((p) => p.id === 'B')!;
  const pC = points.find((p) => p.id === 'C')!;
  const pD = points.find((p) => p.id === 'D')!;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex justify-center items-center p-2 sm:p-4 animate-fadeIn">
      {/* Dynamic Printing Style overrides to print ONLY the certificate and hide everything else */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background: white !important;
            color: black !important;
            visibility: hidden;
          }
          #standard-print-card, #standard-print-card * {
            visibility: visible;
          }
          #standard-print-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print, button, [role="dialog"] button, svg {
            display: none !important;
          }
          #standard-print-card svg {
            display: block !important;
            visibility: visible !important;
          }
        }
      `}} />

      <div className={`rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden border ${
        darkMode ? 'bg-stone-900 border-stone-850' : 'bg-white border-stone-200'
      }`}>
        {/* Modal Top Control Bar */}
        <div className={`px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center ${
          darkMode ? 'bg-stone-950 text-stone-100 border-b border-stone-800' : 'bg-stone-900 text-white'
        }`}>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5 text-brand-500" />
            <h2 className="font-bold text-xs sm:text-sm tracking-wide uppercase truncate max-w-[180px] sm:max-w-none">{t.surveyReportTitle}</h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <motion.button
              onClick={handlePrint}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              className="bg-brand-600 hover:bg-brand-700 text-white px-2.5 py-1.5 sm:px-4 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer select-none"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t.printPDF}</span>
            </motion.button>
            <motion.button 
              onClick={onClose} 
              whileTap={{ scale: 0.9 }}
              className={`p-1 rounded transition-colors cursor-pointer select-none ${
                darkMode ? 'hover:bg-stone-800 text-stone-400 hover:text-white' : 'hover:bg-stone-800 text-stone-400 hover:text-white'
              }`}
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Share Banner (Excluded during print) */}
        <div className="no-print px-4 sm:px-6 py-3 sm:py-4 border-b transition-colors duration-300 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-brand-500/5 border-brand-500/10">
          <div className="space-y-0.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-800 dark:text-brand-400">
              {language === 'hi' ? 'रिपोर्ट शेयर करें' : 'Share Survey Report'}
            </h3>
            <p className="text-[10px] sm:text-[11px] text-stone-500 dark:text-stone-400">
              {language === 'hi' 
                ? 'इस गणना रिपोर्ट को व्हाट्सएप या अन्य किसी भी ऐप पर तुरंत साझा करें।' 
                : 'Send this land survey report directly to WhatsApp or other apps.'}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Direct WhatsApp Share Link */}
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(getShareText())}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer select-none shadow-sm shadow-emerald-600/10"
            >
              <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5 rotate-45 text-white" />
              <span>{language === 'hi' ? 'व्हाट्सएप (WhatsApp)' : 'WhatsApp'}</span>
            </a>

            {/* Clipboard Copy */}
            <button
              onClick={handleCopy}
              className={`px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer select-none border ${
                copied
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : 'bg-stone-800 hover:bg-stone-700 border-stone-700 text-stone-200'
              }`}
            >
              {copied ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500" /> : <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
              <span>{copied ? (language === 'hi' ? 'कॉपी हो गया!' : 'Copied!') : (language === 'hi' ? 'रिपोर्ट कॉपी करें' : 'Copy Report')}</span>
            </button>

            {/* Native / System Share */}
            <button
              onClick={handleShare}
              className="bg-brand-600 hover:bg-brand-700 text-white px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer select-none shadow-sm shadow-brand-600/10"
            >
              <Share2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>{language === 'hi' ? 'अन्य ऐप्स' : 'Share Direct'}</span>
            </button>
          </div>
        </div>

        {/* Modal Body / Report Content Container */}
        <div className={`flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 transition-colors duration-300 ${
          darkMode ? 'bg-stone-950' : 'bg-stone-100'
        }`} id="print-area" ref={printAreaRef}>
          {/* Main report card */}
          <div 
            id="standard-print-card"
            className={`border-4 border-double rounded-lg p-4 sm:p-6 md:p-10 shadow-sm max-w-3xl mx-auto space-y-6 sm:space-y-8 relative overflow-hidden print:border-none print:shadow-none transition-colors duration-300 ${
              darkMode 
                ? 'bg-stone-900 border-stone-800 text-stone-300' 
                : 'bg-white border-stone-300 text-stone-700'
            }`}
          >
            {/* Elegant watermark background pattern for printing authenticity */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-stone-50/10 pointer-events-none"></div>

            {/* Certificate Header */}
            <div className={`text-center space-y-2 border-b pb-6 relative ${darkMode ? 'border-stone-800' : 'border-stone-200'}`}>
              <span className="text-xs tracking-widest text-brand-600 dark:text-brand-500 font-bold uppercase block">{t.officialMapAssessment}</span>
              <h1 className={`text-2xl md:text-3xl font-extrabold tracking-tight font-serif uppercase ${darkMode ? 'text-stone-100' : 'text-stone-950'}`}>{t.bhumiMapCertificate}</h1>
              <p className={`text-xs font-medium tracking-wide ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                {t.landBoundaryReport}
              </p>
              <div className="flex justify-center items-center gap-2 mt-3">
                <span className="h-0.5 w-12 bg-brand-600"></span>
                <Award className="w-5 h-5 text-brand-600" />
                <span className="h-0.5 w-12 bg-brand-600"></span>
              </div>
            </div>

            {/* Report Metadata */}
            <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 text-xs border-b pb-5 ${darkMode ? 'border-stone-800' : 'border-stone-100'}`}>
              <div className="space-y-1">
                <span className="text-stone-400 font-semibold uppercase text-[9px] block">{t.dateOfAssessment}</span>
                <span className={`font-bold font-mono ${darkMode ? 'text-stone-200' : 'text-stone-800'}`}>{today}</span>
              </div>
              <div className="space-y-1">
                <span className="text-stone-400 font-semibold uppercase text-[9px] block">{t.surveyId}</span>
                <span className={`font-bold font-mono uppercase ${darkMode ? 'text-stone-200' : 'text-stone-800'}`}>BM-{Math.floor(100000 + Math.random() * 900000)}</span>
              </div>
              <div className="space-y-1 col-span-2 md:col-span-1">
                <span className="text-stone-400 font-semibold uppercase text-[9px] block">{t.verificationStandard}</span>
                <span className={`font-bold ${darkMode ? 'text-stone-200' : 'text-stone-800'}`}>{t.standardIndianRevenue}</span>
              </div>
            </div>

            {/* Geometry and Dimensions side-by-side */}
            <div className={`grid grid-cols-1 md:grid-cols-12 gap-8 items-center border-b pb-6 ${darkMode ? 'border-stone-800' : 'border-stone-100'}`}>
              {/* Left Column: Scaled Plot Drawing */}
              <div className={`col-span-1 md:col-span-5 rounded-xl p-4 border flex flex-col items-center ${
                darkMode ? 'bg-stone-800 border-stone-800' : 'bg-stone-50 border-stone-200'
              }`}>
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block mb-2">{t.registeredBoundaryLayout}</span>
                <div className={`relative w-full aspect-[4/3] border rounded-lg overflow-hidden flex items-center justify-center ${
                  darkMode ? 'bg-stone-950 border-stone-800' : 'bg-white border-stone-100'
                }`}>
                  {pA && pB && pC && pD && (
                    <svg className="w-full h-full p-2" viewBox="0 0 300 220">
                      <polygon
                        points={`${pA.x * 0.75},${pA.y * 0.75} ${pB.x * 0.75},${pB.y * 0.75} ${pC.x * 0.75},${pC.y * 0.75} ${pD.x * 0.75},${pD.y * 0.75}`}
                        fill={darkMode ? "rgba(200, 169, 108, 0.10)" : "rgba(12, 91, 66, 0.04)"}
                        stroke={darkMode ? "#559b80" : "#0c5b42"}
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                      <line
                        x1={pB.x * 0.75}
                        y1={pB.y * 0.75}
                        x2={pD.x * 0.75}
                        y2={pD.y * 0.75}
                        stroke={darkMode ? "#6b6353" : "#c6bda8"}
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                      {/* Vertex points */}
                      {[pA, pB, pC, pD].map((pt) => (
                        <g key={pt.id}>
                          <circle cx={pt.x * 0.75} cy={pt.y * 0.75} r="4" fill="#b08d4c" stroke={darkMode ? "#100e0b" : "white"} strokeWidth="1" />
                          <text
                            x={pt.x * 0.75 + (pt.id === 'A' || pt.id === 'D' ? -8 : 8)}
                            y={pt.y * 0.75 + (pt.id === 'A' || pt.id === 'B' ? -6 : 8)}
                            fontSize="9"
                            fontWeight="bold"
                            fill={darkMode ? "#f5f2e9" : "#1a1713"}
                            textAnchor="middle"
                          >
                            {pt.label}
                          </text>
                        </g>
                      ))}
                    </svg>
                  )}
                </div>
              </div>

              {/* Right Column: Dimensions Table */}
              <div className="col-span-1 md:col-span-7 space-y-4">
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block">{t.registeredLengths}</span>
                <div className={`overflow-hidden border rounded-xl ${darkMode ? 'border-stone-800' : 'border-stone-200'}`}>
                  <table className="min-w-full divide-y divide-stone-200 text-xs">
                    <thead className={darkMode ? 'bg-stone-800 text-stone-300 uppercase font-semibold' : 'bg-stone-50 text-stone-500 uppercase font-semibold'}>
                      <tr>
                        <th className="px-4 py-2 text-left">{t.boundarySide}</th>
                        <th className="px-4 py-2 text-right">{t.direction}</th>
                        <th className="px-4 py-2 text-right">{t.lengthUnit} ({getUnitLabel()})</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y font-mono text-stone-700 ${
                      darkMode ? 'divide-stone-800 text-stone-300 bg-stone-900/40' : 'divide-stone-100 text-stone-700 bg-white'
                    }`}>
                      <tr>
                        <td className="px-4 py-2 font-bold font-sans">Side AB</td>
                        <td className="px-4 py-2 text-right font-sans">{t.eastHindi}</td>
                        <td className="px-4 py-2 text-right">{dimensions.sideAB.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-bold font-sans">Side BC</td>
                        <td className="px-4 py-2 text-right font-sans">{t.northHindi}</td>
                        <td className="px-4 py-2 text-right">{dimensions.sideBC.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-bold font-sans">Side CD</td>
                        <td className="px-4 py-2 text-right font-sans">{t.westHindi}</td>
                        <td className="px-4 py-2 text-right">{dimensions.sideCD.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-bold font-sans">Side DA</td>
                        <td className="px-4 py-2 text-right font-sans">{t.southHindi}</td>
                        <td className="px-4 py-2 text-right">{dimensions.sideDA.toFixed(2)}</td>
                      </tr>
                      {dimensions.diagonalBD > 0 && (
                        <tr className="bg-brand-500/5 font-sans">
                          <td className="px-4 py-2 font-bold text-brand-900 dark:text-brand-400">{t.diagonalHindi}</td>
                          <td className="px-4 py-2 text-right font-medium text-brand-800 dark:text-brand-500">{t.precisionLine}</td>
                          <td className="px-4 py-2 text-right font-bold text-brand-900 dark:text-brand-400 font-mono">{dimensions.diagonalBD.toFixed(2)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Areas Table */}
            <div className="space-y-3">
              <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block">Calculation & Area Outputs</span>
              <div className="bg-stone-900 text-white rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-[10px] text-brand-400 font-bold uppercase tracking-wider">
                    Computed Area ({method === 'average' ? t.methodAverageMode : t.methodTriangularMode})
                  </span>
                  <div className="text-2xl md:text-3xl font-extrabold tracking-tight font-mono text-white flex items-baseline justify-center sm:justify-start gap-1">
                    {calculatedAreaInUnit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    <span className="text-sm font-normal text-stone-300 uppercase">{getUnitSuffix()}</span>
                  </div>
                </div>

                <div className="h-px sm:h-12 w-full sm:w-px bg-stone-800"></div>

                <div className="text-center sm:text-right space-y-1">
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">{t.equivalentIndiaBaseline}</span>
                  <div className="text-xl font-bold font-mono text-brand-400">
                    {areaInSqFt.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                    <span className="text-xs font-normal text-stone-300 ml-1">sq ft</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Regional conversions list */}
            <div className="space-y-3">
              <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block">{t.regionalLandConversions}</span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {LAND_UNITS.map((unitDef) => {
                  const converted = areaInSqFt / unitDef.sqFtValue;
                  return (
                    <div key={unitDef.id} className={`p-3 border rounded-lg space-y-1 ${
                      darkMode ? 'bg-stone-800 border-stone-800 text-stone-300' : 'bg-stone-50 border-stone-200 text-stone-700'
                    }`}>
                      <div className="flex justify-between items-baseline text-stone-500 font-semibold">
                        <span className={darkMode ? 'text-stone-300 font-bold' : 'text-stone-700'}>{unitDef.name}</span>
                        <span className="text-[9px] text-stone-400">{unitDef.hindiName}</span>
                      </div>
                      <p className={`font-bold text-sm font-mono ${darkMode ? 'text-stone-100' : 'text-stone-800'}`}>{converted.toFixed(3)}</p>
                      <p className="text-[9px] text-stone-400 truncate">{unitDef.region}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Partners Splits if any */}
            {sharesCount > 1 && (
              <div className={`rounded-xl p-4 border text-xs space-y-2 ${
                darkMode ? 'bg-stone-800 border-stone-800' : 'bg-stone-50 border-stone-200'
              }`}>
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block">{t.inheritancePartnerDivisions} ({sharesCount} Shares)</span>
                <div className={`grid grid-cols-3 gap-2 py-1 font-semibold border-b ${
                  darkMode ? 'text-stone-300 border-stone-800' : 'text-stone-600 border-stone-200'
                }`}>
                  <span>{t.shareId}</span>
                  <span className="text-right">{t.shareAreaUnit} ({getUnitLabel()})</span>
                  <span className="text-right">{t.shareAreaSqFt}</span>
                </div>
                {Array.from({ length: Math.min(sharesCount, 6) }).map((_, idx) => (
                  <div key={idx} className={`grid grid-cols-3 gap-2 font-mono ${darkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                    <span>Partner #{idx + 1}</span>
                    <span className="text-right">{(calculatedAreaInUnit / sharesCount).toFixed(2)}</span>
                    <span className="text-right">{(areaInSqFt / sharesCount).toFixed(1)}</span>
                  </div>
                ))}
                {sharesCount > 6 && (
                  <p className="text-[10px] text-stone-400 italic mt-1">+ {sharesCount - 6} {t.otherPartnersSplit}</p>
                )}
              </div>
            )}

            {/* Footer Signatures */}
            <div className={`grid grid-cols-2 gap-8 pt-10 border-t text-xs ${darkMode ? 'border-stone-800' : 'border-stone-200'}`}>
              <div className="space-y-4">
                <span className="text-stone-400 font-semibold uppercase text-[9px] block">{t.surveyorSignature}</span>
                <div className={`h-10 border-b w-3/4 ${darkMode ? 'border-stone-800' : 'border-stone-300'}`}></div>
                <p className="text-[10px] text-stone-500 font-medium">{t.licensedSurveyorOfficer}</p>
              </div>

              <div className="space-y-4 text-right flex flex-col items-end">
                <span className="text-stone-400 font-semibold uppercase text-[9px] block">{t.officialAssessmentSeal}</span>
                <div className="w-16 h-16 rounded-full bg-brand-500/5 border-2 border-dashed border-brand-600/30 flex items-center justify-center text-brand-700 font-serif font-extrabold tracking-tighter text-sm transform rotate-12">
                  BHUMI MAP
                </div>
                <p className="text-[9px] text-stone-400 font-medium italic">{t.verifiedDigitally}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
