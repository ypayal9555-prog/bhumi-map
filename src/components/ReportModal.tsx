/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { DimensionValues, MeasuringUnit, CalculationMethod, LAND_UNITS } from '../types';
import { Printer, X, FileSpreadsheet, Share2, Copy, Check, Send } from 'lucide-react';
import { getCoordinatesFromDimensions } from '../geometryUtils';
import { SQFT_PER_BISWA, SQFT_PER_BIGHA, SQFT_PER_ACRE } from '../units';
import { Language } from '../locales';
import {
  PAPER_LIGHT,
  PAPER_DARK,
  Hairline,
  Seal,
  CertificateFrame,
  certificatePrintCss,
} from './certificate';

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

  // A survey number must not change while the certificate is on screen. Deriving
  // it on every render made it flicker whenever any state changed (copy, share).
  const [surveyId] = useState(() => `BM-${Math.floor(100000 + Math.random() * 900000)}`);

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

  const paper = darkMode ? PAPER_DARK : PAPER_LIGHT;

  return (
    <div
      id="cert-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex justify-center items-center p-2 sm:p-4 animate-fadeIn"
    >
      {/*
       * Print stylesheet shared with the Sarvguniya certificate. The extra block
       * pins the geometry band to two columns: an A4 content box at 9mm margins
       * is 726px wide, just under Tailwind's 768px md breakpoint, so the card
       * would otherwise collapse to one column and run almost two pages long.
       */}
      <style
        dangerouslySetInnerHTML={{
          __html: certificatePrintCss(
            'cert',
            `#cert-geometry {
               grid-template-columns: repeat(12, minmax(0, 1fr)) !important;
               gap: 1.25rem !important;
               align-items: center !important;
             }
             #cert-geometry > div:first-child { grid-column: span 5 / span 5 !important; }
             #cert-geometry > div:last-child { grid-column: span 7 / span 7 !important; }
             #cert-conversions { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }`
          ),
        }}
      />

      <div
        id="cert-shell"
        className={`rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden border ${
          darkMode ? 'bg-stone-900 border-stone-850' : 'bg-white border-stone-200'
        }`}
      >
        {/* Modal Top Control Bar */}
        <div
          className={`relative px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center ${
            darkMode ? 'bg-stone-950 text-stone-100 border-b border-stone-800' : 'bg-stone-900 text-white'
          }`}
        >
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold-400/50 to-transparent" />
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5 text-gold-400" />
            <h2 className="font-semibold text-xs sm:text-sm tracking-[0.14em] uppercase truncate max-w-[180px] sm:max-w-none">
              {t.surveyReportTitle}
            </h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <motion.button
              onClick={handlePrint}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              className="bg-brand-600 hover:bg-brand-500 text-white px-2.5 py-1.5 sm:px-4 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold tracking-wide transition-colors flex items-center gap-1 sm:gap-1.5 cursor-pointer select-none"
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
        <div
          className={`no-print px-4 sm:px-6 py-3 sm:py-4 border-b transition-colors duration-300 flex flex-col md:flex-row md:items-center justify-between gap-3 ${
            darkMode ? 'bg-stone-900 border-stone-800' : 'bg-stone-50 border-stone-200'
          }`}
        >
          <div className="space-y-0.5">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-700 dark:text-brand-300">
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
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold transition-colors flex items-center gap-1 sm:gap-1.5 cursor-pointer select-none"
            >
              <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5 rotate-45 text-white" />
              <span>{language === 'hi' ? 'व्हाट्सएप (WhatsApp)' : 'WhatsApp'}</span>
            </a>

            {/* Clipboard Copy */}
            <button
              onClick={handleCopy}
              className={`px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold transition-colors flex items-center gap-1 sm:gap-1.5 cursor-pointer select-none border ${
                copied
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                  : 'bg-white hover:bg-stone-100 border-stone-300 text-stone-700 dark:bg-stone-800 dark:hover:bg-stone-750 dark:border-stone-700 dark:text-stone-200'
              }`}
            >
              {copied ? (
                <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              )}
              <span>{copied ? (language === 'hi' ? 'कॉपी हो गया!' : 'Copied!') : language === 'hi' ? 'रिपोर्ट कॉपी करें' : 'Copy Report'}</span>
            </button>

            {/* Native / System Share */}
            <button
              onClick={handleShare}
              className="bg-brand-700 hover:bg-brand-800 dark:bg-brand-600 dark:hover:bg-brand-500 text-white px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold transition-colors flex items-center gap-1 sm:gap-1.5 cursor-pointer select-none"
            >
              <Share2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>{language === 'hi' ? 'अन्य ऐप्स' : 'Share Direct'}</span>
            </button>
          </div>
        </div>

        {/* Modal Body / Report Content Container */}
        <div
          className={`flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 transition-colors duration-300 ${
            darkMode ? 'bg-stone-950' : 'bg-stone-100'
          }`}
          id="cert-print-area"
          ref={printAreaRef}
        >
          {/* ================= CERTIFICATE ================= */}
          <div
            id="cert-print-card"
            style={paper}
            className="relative max-w-3xl mx-auto bg-[var(--paper)] text-[var(--ink)] shadow-sm print:shadow-none"
          >
            <CertificateFrame prefix="cert" />

            <div id="cert-body" className="relative px-6 sm:px-9 md:px-12 py-8 sm:py-10 md:py-12 space-y-5">
              {/* ---------- Letterhead ---------- */}
              <header className="text-center space-y-2.5">
                <div className="flex items-center justify-center gap-2.5">
                  <span className="w-1.5 h-1.5 rotate-45 bg-[var(--rule-strong)]" />
                  <span className="text-[9px] font-semibold tracking-[0.42em] uppercase text-[var(--ink-soft)]">
                    Bhumi Map
                  </span>
                  <span className="w-1.5 h-1.5 rotate-45 bg-[var(--rule-strong)]" />
                </div>

                <div className="flex items-center gap-3">
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[var(--rule-strong)]/70" />
                  <span className="w-1 h-1 rotate-45 bg-[var(--rule-strong)]" />
                  <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[var(--rule-strong)]/70" />
                </div>

                <h1 className="font-serif text-[1.55rem] sm:text-[1.85rem] md:text-[2rem] font-medium leading-[1.14] tracking-tight text-[var(--ink)]">
                  {t.bhumiMapCertificate}
                </h1>

                <p className="text-[10px] sm:text-[11px] font-medium tracking-[0.24em] uppercase text-[var(--ink-faint)]">
                  {t.landBoundaryReport}
                </p>

                <div className="pt-1">
                  <span className="inline-block text-[8.5px] font-semibold tracking-[0.2em] uppercase text-[var(--rule-strong)] border-y border-[var(--rule)] px-3 py-1">
                    {t.officialMapAssessment}
                  </span>
                </div>
              </header>

              {/* ---------- Record meta ---------- */}
              <section className="grid grid-cols-3 gap-4">
                {[
                  { label: t.dateOfAssessment, value: today, mono: true },
                  { label: t.surveyId, value: surveyId, mono: true },
                  { label: t.verificationStandard, value: t.standardIndianRevenue, mono: false },
                ].map((item, i) => (
                  <div
                    key={item.label}
                    className={`space-y-1 ${i === 1 ? 'text-center' : i === 2 ? 'text-right' : ''} ${
                      i > 0 ? 'border-l border-[var(--rule)] pl-4' : ''
                    }`}
                  >
                    <span className="block text-[7.5px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-faint)]">
                      {item.label}
                    </span>
                    <span
                      className={`block text-[10px] leading-snug text-[var(--ink)] ${
                        item.mono ? 'font-mono font-medium' : 'font-semibold'
                      }`}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </section>

              <Hairline strong />

              {/* ---------- Geometry + lengths ---------- */}
              <section id="cert-geometry" className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Scaled plot */}
                <div className="md:col-span-5">
                  <span className="block text-[7.5px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-faint)] mb-2">
                    {t.registeredBoundaryLayout}
                  </span>
                  {/* The frame matches the drawing's own 300×190 viewBox so the
                      plot is never letterboxed and takes less sheet height. */}
                  <div className="relative border border-[var(--rule)] bg-[var(--paper-2)] aspect-[300/190] overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle,var(--rule)_0.7px,transparent_0.7px)] bg-[length:14px_14px] opacity-70" />
                    {pA && pB && pC && pD && (
                      <svg className="relative w-full h-full p-3" viewBox="0 0 300 190">
                        <polygon
                          points={`${pA.x},${pA.y} ${pB.x},${pB.y} ${pC.x},${pC.y} ${pD.x},${pD.y}`}
                          fill="var(--seal)"
                          fillOpacity="0.07"
                          stroke="var(--seal)"
                          strokeWidth="2"
                          strokeLinejoin="round"
                        />
                        <line
                          x1={pB.x}
                          y1={pB.y}
                          x2={pD.x}
                          y2={pD.y}
                          stroke="var(--rule-strong)"
                          strokeWidth="1"
                          strokeDasharray="4 3"
                          opacity="0.75"
                        />
                        {[pA, pB, pC, pD].map((pt) => (
                          <g key={pt.id}>
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r="4.4"
                              fill="var(--rule-strong)"
                              stroke="var(--paper-2)"
                              strokeWidth="1.4"
                            />
                            <text
                              x={pt.x + (pt.id === 'A' || pt.id === 'D' ? -9 : 9)}
                              y={pt.y + (pt.id === 'A' || pt.id === 'B' ? -7 : 9)}
                              fontSize="9"
                              fontWeight="700"
                              fill="var(--ink)"
                              textAnchor="middle"
                              fontFamily="Inter, sans-serif"
                            >
                              {pt.label}
                            </text>
                          </g>
                        ))}
                      </svg>
                    )}
                  </div>
                </div>

                {/* Boundary lengths */}
                <div className="md:col-span-7">
                  <span className="block text-[7.5px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-faint)] mb-2">
                    {t.registeredLengths}
                  </span>
                  <table className="w-full text-[10px]">
                    <thead>
                      <tr className="border-b border-[var(--rule-strong)]/60">
                        <th className="py-1.5 text-left font-semibold uppercase tracking-[0.12em] text-[7.5px] text-[var(--ink-faint)]">
                          {t.boundarySide}
                        </th>
                        <th className="py-1.5 text-right font-semibold uppercase tracking-[0.12em] text-[7.5px] text-[var(--ink-faint)]">
                          {t.direction}
                        </th>
                        <th className="py-1.5 text-right font-semibold uppercase tracking-[0.12em] text-[7.5px] text-[var(--ink-faint)]">
                          {t.lengthUnit} ({getUnitLabel()})
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { side: 'AB', dir: t.eastHindi, val: dimensions.sideAB },
                        { side: 'BC', dir: t.northHindi, val: dimensions.sideBC },
                        { side: 'CD', dir: t.westHindi, val: dimensions.sideCD },
                        { side: 'DA', dir: t.southHindi, val: dimensions.sideDA },
                      ].map((row) => (
                        <tr key={row.side} className="border-b border-[var(--rule)]/70">
                          <td className="py-1.5 font-semibold text-[var(--ink)]">Side {row.side}</td>
                          <td className="py-1.5 text-right text-[var(--ink-soft)]">{row.dir}</td>
                          <td className="py-1.5 text-right font-mono font-medium text-[var(--ink)]">
                            {row.val.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      {dimensions.diagonalBD > 0 && (
                        <tr>
                          <td className="pt-1.5 font-semibold text-[var(--seal)]">{t.diagonalHindi}</td>
                          <td className="pt-1.5 text-right text-[var(--ink-faint)] italic">{t.precisionLine}</td>
                          <td className="pt-1.5 text-right font-mono font-semibold text-[var(--seal)]">
                            {dimensions.diagonalBD.toFixed(2)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <Hairline strong />

              {/* ---------- Hero figure ---------- */}
              <section className="text-center">
                <span className="block text-[7.5px] font-semibold uppercase tracking-[0.3em] text-[var(--ink-faint)]">
                  {language === 'hi' ? 'कुल परिकलित क्षेत्रफल' : 'Total Computed Area'}
                </span>
                <div className="mt-1.5 flex items-baseline justify-center gap-2.5">
                  <span className="font-serif text-[2.1rem] sm:text-[2.5rem] leading-none font-medium tabular-nums tracking-tight text-[var(--ink)]">
                    {calculatedAreaInUnit.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--rule-strong)]">
                    {getUnitSuffix()}
                  </span>
                </div>
                <p className="mt-2 text-[9.5px] font-mono text-[var(--ink-faint)]">
                  {unit !== 'feet' && (
                    <>
                      ≈{' '}
                      {areaInSqFt.toLocaleString(undefined, {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })}{' '}
                      sq ft
                      <span className="mx-2 text-[var(--rule)]">|</span>
                    </>
                  )}
                  <span className="uppercase tracking-[0.1em]">
                    {method === 'average' ? t.methodAverageMode : t.methodTriangularMode}
                  </span>
                </p>
              </section>

              <Hairline strong />

              {/* ---------- Regional conversions ---------- */}
              <section className="space-y-2.5">
                <span className="block text-[7.5px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-faint)]">
                  {t.regionalLandConversions}
                </span>
                <div id="cert-conversions" className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2.5">
                  {LAND_UNITS.map((unitDef) => {
                    const converted = areaInSqFt / unitDef.sqFtValue;
                    return (
                      <div key={unitDef.id} className="border-t border-[var(--rule)] pt-1.5">
                        <div className="flex items-baseline justify-between gap-1">
                          <span className="text-[9px] font-semibold text-[var(--ink)] truncate">{unitDef.name}</span>
                          <span className="text-[8px] text-[var(--ink-faint)] truncate">{unitDef.hindiName}</span>
                        </div>
                        <p className="font-mono text-[11px] font-semibold text-[var(--ink)] mt-0.5">
                          {converted.toFixed(3)}
                        </p>
                        <p className="text-[7.5px] text-[var(--ink-faint)] truncate">{unitDef.region}</p>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* ---------- Partner splits ---------- */}
              {sharesCount > 1 && (
                <section className="border border-[var(--rule)] bg-[var(--paper-2)]/70 px-4 py-3 space-y-1.5">
                  <span className="block text-[7.5px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-faint)]">
                    {t.inheritancePartnerDivisions} ({sharesCount}{' '}
                    {language === 'hi' ? 'साझेदार' : sharesCount === 1 ? 'Share' : 'Shares'})
                  </span>
                  <div className="grid grid-cols-3 gap-2 py-1 border-b border-[var(--rule)] text-[7.5px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-faint)]">
                    <span>{t.shareId}</span>
                    <span className="text-right">{t.shareAreaUnit} ({getUnitLabel()})</span>
                    <span className="text-right">{t.shareAreaSqFt}</span>
                  </div>
                  {Array.from({ length: Math.min(sharesCount, 6) }).map((_, idx) => (
                    <div key={idx} className="grid grid-cols-3 gap-2 font-mono text-[10px] text-[var(--ink)]">
                      <span className="font-sans font-medium">
                        {language === 'hi' ? `साझेदार #${idx + 1}` : `Partner #${idx + 1}`}
                      </span>
                      <span className="text-right">{(calculatedAreaInUnit / sharesCount).toFixed(2)}</span>
                      <span className="text-right">{(areaInSqFt / sharesCount).toFixed(1)}</span>
                    </div>
                  ))}
                  {sharesCount > 6 && (
                    <p className="text-[9px] text-[var(--ink-faint)] italic pt-0.5">
                      + {sharesCount - 6} {t.otherPartnersSplit}
                    </p>
                  )}
                </section>
              )}

              {/* ---------- Signatures ---------- */}
              <footer className="grid grid-cols-2 gap-8 pt-4 border-t border-[var(--rule)]">
                <div className="space-y-2">
                  <span className="block text-[7.5px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-faint)]">
                    {t.surveyorSignature}
                  </span>
                  <div className="h-8 w-4/5 border-b border-[var(--ink-faint)]/60" />
                  <p className="text-[9px] font-medium text-[var(--ink-soft)]">{t.licensedSurveyorOfficer}</p>
                </div>

                <div className="flex flex-col items-end justify-between">
                  <span className="block text-[7.5px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-faint)]">
                    {t.officialAssessmentSeal}
                  </span>
                  <div className="flex items-center gap-3">
                    <p className="text-[8px] text-[var(--ink-faint)] italic text-right leading-tight max-w-[80px]">
                      {t.verifiedDigitally}
                    </p>
                    <Seal />
                  </div>
                </div>
              </footer>
            </div>
          </div>
          {/* ================= /CERTIFICATE ================= */}
        </div>
      </div>
    </div>
  );
}
