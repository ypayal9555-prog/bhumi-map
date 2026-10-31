/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Printer, X, FileSpreadsheet, Compass, Share2, Copy, Check, Send } from 'lucide-react';
import { SQFT_PER_BISWA, SQFT_PER_DISMIL, BISWA_PER_BIGHA } from '../units';
import {
  PAPER_LIGHT,
  PAPER_DARK,
  Hairline,
  Seal,
  CertificateFrame,
  certificatePrintCss,
} from './certificate';

interface SarvguniyaReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    mode: 'map' | 'ground';
    scale: '1/4000' | '16inch' | '32inch';
    instrument: string;
    sideAB: string;
    sideBC: string;
    sideCD: string;
    sideDA: string;
    results: any;
  } | null;
  darkMode: boolean;
  language: 'en' | 'hi';
}

export default function SarvguniyaReportModal({
  isOpen,
  onClose,
  data,
  darkMode,
  language,
}: SarvguniyaReportModalProps) {
  const printAreaRef = useRef<HTMLDivElement | null>(null);
  const [copied, setCopied] = useState(false);
  // Stable report number: a fresh value on every render would change the
  // certificate under the user's eyes and reprint with a different number.
  const [surveyId] = useState(
    () => `SG-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`
  );

  const paper = darkMode ? PAPER_DARK : PAPER_LIGHT;

  if (!isOpen) return null;

  const handlePrint = () => {
    if (data && data.results) {
      window.print();
    }
  };

  const today = new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    // Hindi renders the time as "… को 02:28 pm बजे"; a 24-hour clock reads as
    // "… को 14:28 बजे" and drops the stray am/pm from the Devanagari line.
    hour12: language !== 'hi',
  });

  const { results = null, mode = 'map', scale = '1/4000', instrument = 'meterGuniya', sideAB = '', sideBC = '', sideCD = '', sideDA = '' } = data || {};

  const getShareText = () => {
    if (!results || !results.isComplete) return '';
    
    const instrumentName = getInstrumentName();
    const scaleName = scale;
    const areaObj = results.area;
    const avgObj = results.averages;
    
    if (language === 'hi') {
      return `🌾 *सर्वगुनिया भू-मापन रिपोर्ट* 🌾
----------------------------------
📅 दिनांक: ${today}
🛠️ मापन उपकरण: ${instrumentName}
📏 पैमाना (Scale): ${scaleName}
📐 कुल क्षेत्रफल: *${areaObj.sqF.toLocaleString(undefined, { maximumFractionDigits: 1 })} वर्ग फीट*
≈ *${areaObj.sqM.toLocaleString(undefined, { maximumFractionDigits: 2 })} वर्ग मीटर*

🗺️ *क्षेत्रफल रूपांतरण (Land Units):*
• बीघा (Bigha): *${areaObj.bigha.toFixed(3)}*
• बिस्वा (Biswa): *${areaObj.biswa.toFixed(2)}*
• डिसमिल (Dismil): *${areaObj.dismil.toFixed(2)}*
• एकड़ (Acre): *${areaObj.acre.toFixed(3)}*
• हेक्टेयर (Hectare): *${areaObj.hectare.toFixed(4)}*

📏 *औसत मान (Averages):*
• औसत लंबाई: ${avgObj.lengthM.toFixed(2)} मी (≈ ${avgObj.lengthFt.toFixed(2)} फीट)
• औसत चौड़ाई: ${avgObj.widthM.toFixed(2)} मी (≈ ${avgObj.widthFt.toFixed(2)} फीट)

📱 *सर्वगुनिया भू-मापक द्वारा मापा गया*
🌐 इस टूल का उपयोग करें: ${window.location.origin}`;
    } else {
      return `🌾 *Sarvguniya Land Survey Report* 🌾
----------------------------------
📅 Date: ${today}
🛠️ Instrument: ${instrumentName}
📏 Scale: ${scale}
📐 Total Ground Area: *${areaObj.sqF.toLocaleString(undefined, { maximumFractionDigits: 1 })} Sq. Ft.*
≈ *${areaObj.sqM.toLocaleString(undefined, { maximumFractionDigits: 2 })} Sq. Meters*

🗺️ *Regional Land Units:*
• Bigha: *${areaObj.bigha.toFixed(3)}*
• Biswa: *${areaObj.biswa.toFixed(2)}*
• Dismil: *${areaObj.dismil.toFixed(2)}*
• Acre: *${areaObj.acre.toFixed(3)}*
• Hectare: *${areaObj.hectare.toFixed(4)}*

📏 *Averages (Patwari Formula):*
• Avg Length: ${avgObj.lengthM.toFixed(2)} m (≈ ${avgObj.lengthFt.toFixed(2)} ft)
• Avg Width: ${avgObj.widthM.toFixed(2)} m (≈ ${avgObj.widthFt.toFixed(2)} ft)

📱 *Measured using Sarvguniya Land Survey tool*
🌐 Try the app here: ${window.location.origin}`;
    }
  };

  const handleShare = async () => {
    const text = getShareText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: language === 'hi' ? 'सर्वगुनिया भू-मापन रिपोर्ट' : 'Sarvguniya Land Survey Report',
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

  // Local translations for Sarvguniya PDF layout
  const l = {
    hi: {
      reportTitle: 'सर्वगुनिया ज़मीन मापन रिपोर्ट',
      certTitle: 'सर्वगुनिया भूमि प्रमाण पत्र',
      officialMapAssessment: 'अमीन व लेखपाल राजस्व मापदंड',
      subTitle: 'पारंपरिक गाँव अमीन विधि एवं डिजिटल गुनिया-फीता गणना रिपोर्ट',
      dateLabel: 'मापन की तिथि',
      idLabel: 'रिपोर्ट संख्या',
      modeLabel: 'मापन का प्रकार',
      modeMap: 'नक्शा मापन (गुनिया/स्केल)',
      modeGround: 'सीधी ज़मीन नाप (फीता/टेप)',
      instrumentLabel: 'सर्वेक्षण यंत्र',
      scaleLabel: 'मानचित्र पैमाना',
      recordedSides: 'अंकित भुजाओं की दूरी',
      sideCol: 'भूखंड भुजा',
      directionCol: 'दिशा',
      enteredCol: 'दर्ज मान',
      metersCol: 'वास्तविक (मीटर)',
      feetCol: 'वास्तविक (फीट/कड़ी/गज)',
      east: 'पूर्व (Side AB)',
      north: 'उत्तर (Side BC)',
      west: 'पश्चिम (Side CD)',
      south: 'दक्षिण (Side DA)',
      dirE: 'पूर्व',
      dirN: 'उत्तर',
      dirW: 'पश्चिम',
      dirS: 'दक्षिण',
      averagesLabel: 'औसत भुजा मापन (पटवारी सूत्र)',
      avgLength: 'औसत लंबाई (AB + CD) / 2',
      avgWidth: 'औसत चौड़ाई (BC + DA) / 2',
      calculatedArea: 'क्षेत्रफल गणना विवरण',
      landUnits: 'क्षेत्रीय राजस्व रूपांतरण',
      printBtn: 'प्रिंट / PDF डाउनलोड',
      closeBtn: 'बंद करें',
      villageAverage: 'गाँव औसत विधि',
      notFilled: 'अंकित नहीं',
      warnTitle: 'मापन अपूर्ण है',
      warnDesc: 'कृपया प्रमाण पत्र रिपोर्ट देखने और प्रिंट करने के लिए सर्वगुनिया भू-मापन टूल में चारों भुजाओं (Side AB, BC, CD और DA) का मान दर्ज करें।',
      warnAction: 'मापन टूल पर वापस जाएं'
    },
    en: {
      reportTitle: 'Sarvguniya Land Survey Report',
      certTitle: 'Sarvguniya Land Certificate',
      officialMapAssessment: 'Amin & Revenue Survey Standards',
      subTitle: 'Traditional Village Formula & Digital Guniya-Tape Calculation Report',
      dateLabel: 'Date of Survey',
      idLabel: 'Report No.',
      modeLabel: 'Survey Type',
      modeMap: 'Map Measure (Guniya/Scale)',
      modeGround: 'Ground Measure (Tape/Chain)',
      instrumentLabel: 'Survey Instrument',
      scaleLabel: 'Map Scale',
      recordedSides: 'Recorded Side Distances',
      sideCol: 'Plot Side',
      directionCol: 'Direction',
      enteredCol: 'Entered Value',
      metersCol: 'Ground Metric (m)',
      feetCol: 'Ground Imperial (ft / kadi / gaj)',
      east: 'East (Side AB)',
      north: 'North (Side BC)',
      west: 'West (Side CD)',
      south: 'South (Side DA)',
      dirE: 'East',
      dirN: 'North',
      dirW: 'West',
      dirS: 'South',
      averagesLabel: 'Opposite Side Averages (Amin Formula)',
      avgLength: 'Average Length (AB + CD) / 2',
      avgWidth: 'Average Width (BC + DA) / 2',
      calculatedArea: 'Calculated Area Breakdown',
      landUnits: 'Regional Revenue Conversions',
      printBtn: 'Print / Download PDF',
      closeBtn: 'Close',
      villageAverage: 'Village Average Formula',
      notFilled: 'Not Entered',
      warnTitle: 'Incomplete Measurements',
      warnDesc: 'Please enter all four side measurements (Side AB, BC, CD, and DA) in the Sarvguniya tool first to generate and print the official certificate report.',
      warnAction: 'Return to Measurer'
    }
  }[language];

  const getInstrumentName = () => {
    const instNames: any = {
      meterGuniya: language === 'hi' ? 'मीटर गुनिया (1 खाना = 4m)' : 'Meter Guniya (1 div = 4m)',
      kadiGuniya25: scale === '32inch'
        ? (language === 'hi' ? 'कड़ी गुनिया - 25 ज़ीरो (1 खाना = 10 कड़ी)' : 'Kadi Guniya - 25 Zero (1 div = 10 links)')
        : (language === 'hi' ? 'कड़ी गुनिया - 25 ज़ीरो (1 खाना = 20 कड़ी)' : 'Kadi Guniya - 25 Zero (1 div = 20 links)'),
      kadiGuniya20: scale === '32inch'
        ? (language === 'hi' ? 'कड़ी गुनिया - 20 ज़ीरो (1 खाना = 12.5 कड़ी)' : 'Kadi Guniya - 20 Zero (1 div = 12.5 links)')
        : (language === 'hi' ? 'कड़ी गुनिया - 20 ज़ीरो (1 खाना = 25 कड़ी)' : 'Kadi Guniya - 20 Zero (1 div = 25 links)'),
      kadiGuniya50: language === 'hi' ? 'कड़ी गुनिया - 50 ज़ीरो (1 खाना = 10 कड़ी)' : 'Kadi Guniya - 50 Zero (1 div = 10 links)',
      plasticScaleCm: language === 'hi' ? 'प्लास्टिक स्केल (cm)' : 'Plastic Ruler (cm)',
      plasticScaleMm: language === 'hi' ? 'प्लास्टिक स्केल (mm)' : 'Plastic Ruler (mm)',
      fitaMeter: language === 'hi' ? 'फीता / टेप (मीटर)' : 'Tape Measure (meters)',
      fitaFeet: language === 'hi' ? 'फीता / टेप (फीट)' : 'Tape Measure (feet)',
      kadiDirect: language === 'hi' ? 'जरीब / कड़ी (सीधी कड़ी)' : 'Gunter\'s Chain (links)',
    };
    return instNames[instrument] || instrument;
  };

  const getUnitName = () => {
    switch (instrument) {
      case 'meterGuniya':
      case 'kadiGuniya25':
      case 'kadiGuniya20':
      case 'kadiGuniya50':
        return language === 'hi' ? 'खाने' : 'divs';
      case 'plasticScaleCm':
        return 'cm';
      case 'plasticScaleMm':
        return 'mm';
      case 'fitaMeter':
        return language === 'hi' ? 'मीटर' : 'meters';
      case 'fitaFeet':
        return language === 'hi' ? 'फीट' : 'feet';
      case 'kadiDirect':
        return language === 'hi' ? 'कड़ी' : 'links';
      default:
        return '';
    }
  };

  return (
    <div
      id="sg-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex justify-center items-center p-2 sm:p-4 animate-fadeIn"
    >
      {/*
       * Print stylesheet shared with the standard certificate, namespaced "sg".
       * The extra block pins the meta and unit bands to their wide layout: an A4
       * content box at 9mm margins is 726px, just under Tailwind's 768px `md`
       * breakpoint, so they would otherwise collapse to 2 columns and push the
       * certificate onto a second sheet.
       */}
      <style
        dangerouslySetInnerHTML={{
          __html: certificatePrintCss(
            'sg',
            `#sg-meta { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
             #sg-units { grid-template-columns: repeat(5, minmax(0, 1fr)) !important; }
             /* This certificate carries fewer rows than the standard report, so
                it would otherwise end ~200px above the foot of the sheet. A flex
                column plus the spacer before the signatures lets the bands keep
                their natural rhythm and pins only the footer to the sheet foot. */
             #sg-body {
               display: flex !important;
               flex-direction: column !important;
               min-height: 297mm !important;
               padding: 8mm 9mm 14mm !important;
             }`
          ),
        }}
      />

      <div
        id="sg-shell"
        className={`rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden border ${
          darkMode ? 'bg-stone-900 border-stone-850' : 'bg-white border-stone-200'
        }`}
      >
        {/* Modal Top Control Bar */}
        <div className={`px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center ${
          darkMode ? 'bg-stone-950 text-stone-100 border-b border-stone-800' : 'bg-stone-900 text-white'
        }`}>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5 text-brand-500" />
            <h2 className="font-bold text-xs sm:text-sm tracking-wide uppercase truncate max-w-[180px] sm:max-w-none">{l.reportTitle}</h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <motion.button
              onClick={handlePrint}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              className="bg-brand-600 hover:bg-brand-700 text-white px-2.5 py-1.5 sm:px-4 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer select-none"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{l.printBtn}</span>
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
        {results && results.isComplete && (
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
        )}

        {/* Modal Body / Report Content Container */}
        <div className={`flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 transition-colors duration-300 ${
          darkMode ? 'bg-stone-950' : 'bg-stone-100'
        }`} id="sg-print-area" ref={printAreaRef}>
          {/* ================= CERTIFICATE ================= */}
          <div
            id="sg-print-card"
            style={paper}
            className="relative max-w-3xl mx-auto bg-[var(--paper)] text-[var(--ink)] shadow-sm print:shadow-none"
          >
            <CertificateFrame prefix="sg" />

            <div id="sg-body" className="relative px-6 sm:px-9 md:px-12 py-8 sm:py-10 md:py-12 space-y-5">
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
                  {l.certTitle}
                </h1>

                <p className="text-[10px] sm:text-[11px] font-medium tracking-[0.2em] uppercase text-[var(--ink-faint)]">
                  {l.subTitle}
                </p>

                <div className="pt-1">
                  <span className="inline-block text-[8.5px] font-semibold tracking-[0.2em] uppercase text-[var(--rule-strong)] border-y border-[var(--rule)] px-3 py-1">
                    {l.officialMapAssessment}
                  </span>
                </div>
              </header>

              {/* ---------- Record meta ---------- */}
              <section id="sg-meta" className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: l.dateLabel, value: today, mono: true },
                  { label: l.idLabel, value: surveyId, mono: true },
                  {
                    label: l.modeLabel,
                    value: mode === 'map' ? l.modeMap : l.modeGround,
                    mono: false,
                  },
                  { label: l.instrumentLabel, value: getInstrumentName(), mono: false },
                ].map((item, i) => (
                  <div
                    key={item.label}
                    className={`space-y-1 ${i > 0 ? 'border-l border-[var(--rule)] pl-4' : ''}`}
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

              {!results || !results.isComplete ? (
                /* Nothing measured yet: the certificate stays on the sheet but
                   cannot carry figures, so it asks for the four sides instead. */
                <div className="py-12 text-center space-y-3">
                  <Compass className="w-8 h-8 mx-auto text-[var(--rule-strong)]" aria-hidden="true" />
                  <h3 className="font-serif text-lg font-medium text-[var(--ink)]">{l.warnTitle}</h3>
                  <p className="text-[10px] text-[var(--ink-faint)] leading-relaxed max-w-sm mx-auto">
                    {l.warnDesc}
                  </p>
                  <button
                    onClick={onClose}
                    className="inline-block mt-1 px-4 py-2 rounded-lg bg-brand-700 hover:bg-brand-800 text-white text-[11px] font-semibold transition-colors cursor-pointer select-none"
                  >
                    {l.warnAction}
                  </button>
                </div>
              ) : (
                <>
                  {/* ---------- Recorded sides ---------- */}
                  <section className="space-y-2">
                    <span className="block text-[7.5px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-faint)]">
                      {l.recordedSides}
                    </span>
                    <table className="w-full text-[9.5px]">
                      <thead>
                        <tr className="border-b border-[var(--rule-strong)]/60">
                          <th className="py-1.5 text-left font-semibold uppercase tracking-[0.12em] text-[7.5px] text-[var(--ink-faint)]">
                            {l.sideCol}
                          </th>
                          <th className="py-1.5 text-left font-semibold uppercase tracking-[0.12em] text-[7.5px] text-[var(--ink-faint)]">
                            {l.directionCol}
                          </th>
                          <th className="py-1.5 text-right font-semibold uppercase tracking-[0.12em] text-[7.5px] text-[var(--ink-faint)]">
                            {l.enteredCol}
                          </th>
                          <th className="py-1.5 text-right font-semibold uppercase tracking-[0.12em] text-[7.5px] text-[var(--ink-faint)]">
                            {l.metersCol}
                          </th>
                          <th className="py-1.5 text-right font-semibold uppercase tracking-[0.12em] text-[7.5px] text-[var(--ink-faint)]">
                            {l.feetCol}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {['AB', 'BC', 'CD', 'DA'].map((sideKey) => {
                          const distObj = results.distances[sideKey];
                          const valStr =
                            sideKey === 'AB' ? sideAB : sideKey === 'BC' ? sideBC : sideKey === 'CD' ? sideCD : sideDA;
                          const dirKey = sideKey === 'AB' ? 'dirE' : sideKey === 'BC' ? 'dirN' : sideKey === 'CD' ? 'dirW' : 'dirS';

                          return (
                            <tr key={sideKey} className="border-b border-[var(--rule)]/70">
                              <td className="py-1.5 font-semibold text-[var(--ink)]">Side {sideKey}</td>
                              <td className="py-1.5 text-[var(--ink-soft)]">{(l as any)[dirKey]}</td>
                              <td className="py-1.5 text-right text-[var(--ink-soft)]">
                                {valStr ? `${parseFloat(valStr)} ${getUnitName()}` : l.notFilled}
                              </td>
                              <td className="py-1.5 text-right font-mono font-medium text-[var(--ink)]">
                                {distObj ? `${distObj.meters.toFixed(2)} m` : '—'}
                              </td>
                              <td className="py-1.5 text-right font-mono">
                                {distObj ? (
                                  <>
                                    <span className="block text-[var(--ink)]">{distObj.feet.toFixed(1)} ft</span>
                                    <span className="block text-[7.5px] text-[var(--ink-faint)]">
                                      {distObj.kadi.toFixed(0)} कड़ी · {distObj.gaj.toFixed(0)} गज
                                    </span>
                                  </>
                                ) : (
                                  '—'
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </section>

                  <Hairline strong />

                  {/* ---------- Hero figure ---------- */}
                  <section className="text-center">
                    <span className="block text-[7.5px] font-semibold uppercase tracking-[0.3em] text-[var(--ink-faint)]">
                      {l.calculatedArea}
                    </span>
                    <div className="mt-1.5 flex items-baseline justify-center gap-2.5">
                      <span className="font-serif text-[2.1rem] sm:text-[2.5rem] leading-none font-medium tabular-nums tracking-tight text-[var(--ink)]">
                        {results.area.sqF.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--rule-strong)]">
                        sq ft
                      </span>
                    </div>
                    <p className="mt-2 text-[9.5px] font-mono text-[var(--ink-faint)]">
                      ≈ {results.area.sqM.toLocaleString(undefined, { maximumFractionDigits: 2 })} sq m
                      <span className="mx-2 text-[var(--rule)]">|</span>
                      <span className="uppercase tracking-[0.1em]">{l.villageAverage}</span>
                    </p>
                  </section>

                  <Hairline strong />

                  {/* ---------- Averages ---------- */}
                  {results.averages && (
                    <section className="grid grid-cols-2 gap-4">
                      {[
                        {
                          label: l.avgLength,
                          m: results.averages.lengthM,
                          ft: results.averages.lengthFt,
                          kadi: results.averages.lengthKadi,
                        },
                        {
                          label: l.avgWidth,
                          m: results.averages.widthM,
                          ft: results.averages.widthFt,
                          kadi: results.averages.widthKadi,
                        },
                      ].map((avg) => (
                        <div key={avg.label} className="border-t border-[var(--rule)] pt-1.5">
                          <span className="block text-[7.5px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                            {avg.label}
                          </span>
                          <p className="font-mono text-[12px] font-semibold text-[var(--ink)] mt-0.5">
                            {avg.m.toFixed(2)} m
                          </p>
                          <p className="text-[8px] font-mono text-[var(--ink-faint)]">
                            ≈ {avg.ft.toFixed(2)} ft · {avg.kadi.toFixed(1)} कड़ी
                          </p>
                        </div>
                      ))}
                    </section>
                  )}

                  {/* ---------- Regional conversions ---------- */}
                  <section className="space-y-2">
                    <span className="block text-[7.5px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-faint)]">
                      {l.landUnits}
                    </span>
                    <div id="sg-units" className="grid grid-cols-2 md:grid-cols-5 gap-x-4 gap-y-2.5">
                      {[
                        { name: language === 'hi' ? 'बिस्वा' : 'Biswa', value: results.area.biswa.toFixed(2), basis: `${SQFT_PER_BISWA.toLocaleString('en-IN')} sq ft` },
                        { name: language === 'hi' ? 'बीघा' : 'Bigha', value: results.area.bigha.toFixed(3), basis: `${BISWA_PER_BIGHA} Biswa` },
                        { name: language === 'hi' ? 'डिसमिल' : 'Dismil', value: results.area.dismil.toFixed(2), basis: `${SQFT_PER_DISMIL.toLocaleString('en-IN')} sq ft` },
                        { name: language === 'hi' ? 'एकड़' : 'Acre', value: results.area.acre.toFixed(3), basis: '100 Dismil' },
                        { name: language === 'hi' ? 'हेक्टेयर' : 'Hectare', value: results.area.hectare.toFixed(4), basis: '10,000 sq m' },
                      ].map((u) => (
                        <div key={u.name} className="border-t border-[var(--rule)] pt-1.5">
                          <span className="block text-[9px] font-semibold text-[var(--ink)] truncate">
                            {u.name}
                          </span>
                          <p className="font-mono text-[11px] font-semibold text-[var(--ink)] mt-0.5">{u.value}</p>
                          <p className="text-[7.5px] text-[var(--ink-faint)] truncate">{u.basis}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* ---------- Signatures + seal ---------- */}
                  {/* Absorbs the leftover sheet height in print, so the bands
                      above keep their spacing and the signatures sit at the foot. */}
                  <div className="flex-1" aria-hidden="true" />
                  <footer className="pt-4 border-t border-[var(--rule)] space-y-3">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <span className="block text-[7.5px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-faint)]">
                          {language === 'hi' ? 'सर्वेक्षक हस्ताक्षर' : 'Surveyor Signature'}
                        </span>
                        <div className="h-8 w-4/5 border-b border-[var(--ink-faint)]/60" />
                        <p className="text-[9px] font-medium text-[var(--ink-soft)]">
                          {language === 'hi' ? 'लाइसेंस प्राप्त सर्वेक्षक अधिकारी' : 'Licensed Surveyor Officer'}
                        </p>
                      </div>

                      <div className="flex flex-col items-end justify-between">
                        <span className="block text-[7.5px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-faint)]">
                          {language === 'hi' ? 'अधिकारिक मूल्यांकन मुहर' : 'Official Assessment Seal'}
                        </span>
                        <div className="flex items-center gap-3">
                          <p className="text-[8px] text-[var(--ink-faint)] italic text-right leading-tight max-w-[80px]">
                            {language === 'hi' ? 'भूमि मानचित्र क्लाउड से डिजिटल सत्यापित' : 'Verified Digitally via Bhumi Map Cloud'}
                          </p>
                          <Seal />
                        </div>
                      </div>
                    </div>

                    <p className="text-[8px] text-[var(--ink-faint)] italic leading-snug">
                      {language === 'hi'
                        ? '* यह दस्तावेज़ केवल विलेज अमीन/पटवारी भू-लेख रिकॉर्ड्स के संदर्भ हेतु तैयार की गयी डिजिटल गणना रिपोर्ट है।'
                        : '* This report serves as a digital computation record compliant with traditional revenue/Patwari benchmarks.'}
                    </p>
                  </footer>
                </>
              )}
            </div>
          </div>
          {/* ================= /CERTIFICATE ================= */}
        </div>
      </div>
    </div>
  );
}
