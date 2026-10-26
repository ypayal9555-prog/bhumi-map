/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Printer, X, Award, FileSpreadsheet, Map, Compass, Share2, Copy, Check, Send } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex justify-center items-center p-2 sm:p-4 animate-fadeIn">
      {/* Dynamic Printing Style overrides to print ONLY the certificate and hide everything else */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background: white !important;
            color: black !important;
            visibility: hidden;
          }
          #sarvguniya-print-card, #sarvguniya-print-card * {
            visibility: visible;
          }
          #sarvguniya-print-card {
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
          #sarvguniya-print-card table {
            min-width: 100% !important;
            width: 100% !important;
            font-size: 10px !important;
          }
          #sarvguniya-print-card .px-3 {
            padding-left: 4px !important;
            padding-right: 4px !important;
          }
          .no-print, button, [role="dialog"] button, svg {
            display: none !important;
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
            <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
            <h2 className="font-bold text-xs sm:text-sm tracking-wide uppercase truncate max-w-[180px] sm:max-w-none">{l.reportTitle}</h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <motion.button
              onClick={handlePrint}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              className="bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1.5 sm:px-4 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer select-none"
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
          <div className="no-print px-4 sm:px-6 py-3 sm:py-4 border-b transition-colors duration-300 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-amber-500/5 border-amber-500/10">
            <div className="space-y-0.5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                {language === 'hi' ? '📱 रिपोर्ट शेयर करें' : '📱 Share Survey Report'}
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
                className="bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer select-none shadow-sm shadow-amber-600/10"
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
        }`} id="print-area" ref={printAreaRef}>
          {/* Main report card */}
          <div 
            id="sarvguniya-print-card"
            className={`border-4 border-double rounded-lg p-4 sm:p-6 md:p-10 shadow-sm max-w-3xl mx-auto space-y-6 sm:space-y-8 relative overflow-hidden print:border-none print:shadow-none transition-colors duration-300 ${
              darkMode 
                ? 'bg-stone-900 border-stone-800 text-stone-300' 
                : 'bg-white border-stone-300 text-stone-700'
            }`}
          >
            {/* Elegant watermark background pattern for printing authenticity */}
            <div className="absolute inset-0 bg-radial-gradient from-transparent to-stone-50/10 pointer-events-none"></div>

            {/* Certificate Header */}
            <div className={`text-center space-y-1.5 border-b pb-4 sm:pb-6 relative ${darkMode ? 'border-stone-800' : 'border-stone-200'}`}>
              <span className="text-[10px] sm:text-xs tracking-widest text-amber-650 dark:text-amber-500 font-bold uppercase block">{l.officialMapAssessment}</span>
              <h1 className={`text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight font-serif uppercase ${darkMode ? 'text-stone-100' : 'text-stone-950'}`}>{l.certTitle}</h1>
              <p className={`text-[10px] sm:text-xs font-medium tracking-wide leading-relaxed ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                {l.subTitle}
              </p>
              <div className="flex justify-center items-center gap-2 mt-2">
                <span className="h-0.5 w-10 sm:w-12 bg-amber-600"></span>
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                <span className="h-0.5 w-10 sm:w-12 bg-amber-600"></span>
              </div>
            </div>

            {/* Report Metadata */}
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-[11px] sm:text-xs border-b pb-4 sm:pb-5 ${darkMode ? 'border-stone-800' : 'border-stone-100'}`}>
              <div className="space-y-0.5">
                <span className="text-stone-400 font-semibold uppercase text-[9px] block">{l.dateLabel}</span>
                <span className={`font-bold font-mono block truncate ${darkMode ? 'text-stone-200' : 'text-stone-800'}`}>{today}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-stone-400 font-semibold uppercase text-[9px] block">{l.idLabel}</span>
                <span className={`font-bold font-mono uppercase block truncate ${darkMode ? 'text-stone-200' : 'text-stone-800'}`}>SG-{Math.floor(100000 + Math.random() * 900000)}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-stone-400 font-semibold uppercase text-[9px] block">{l.modeLabel}</span>
                <span className={`font-bold block truncate ${darkMode ? 'text-stone-200' : 'text-stone-800'}`}>
                  {mode === 'map' ? l.modeMap : l.modeGround}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-stone-400 font-semibold uppercase text-[9px] block">{l.instrumentLabel}</span>
                <span className={`font-bold block truncate ${darkMode ? 'text-stone-200' : 'text-stone-800'}`}>{getInstrumentName()}</span>
              </div>
            </div>

            {!results || !results.isComplete ? (
              <div className="py-8 sm:py-12 px-4 text-center max-w-md mx-auto space-y-4">
                <div className="inline-flex items-center justify-center p-3 bg-amber-500/10 text-amber-600 rounded-full">
                  <Compass className="w-8 h-8 animate-pulse" />
                </div>
                <h3 className={`text-base sm:text-lg font-bold tracking-tight ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>
                  {l.warnTitle}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                  {l.warnDesc}
                </p>
                <motion.button
                  onClick={onClose}
                  whileTap={{ scale: 0.95 }}
                  className="bg-stone-800 hover:bg-stone-700 dark:bg-stone-700 dark:hover:bg-stone-600 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer select-none inline-block"
                >
                  {l.warnAction}
                </motion.button>
              </div>
            ) : (
              <>
                {/* Scrollable Layout for Ground Distances Table (Prevents layout break on Mobile) */}
                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block">{l.recordedSides}</span>
                  <div className={`overflow-x-auto border rounded-xl scrollbar-thin ${darkMode ? 'border-stone-800' : 'border-stone-200'}`}>
                    <table className="min-w-[620px] w-full divide-y divide-stone-200 text-xs">
                      <thead className={darkMode ? 'bg-stone-850 text-stone-300 uppercase font-semibold' : 'bg-stone-50 text-stone-500 uppercase font-semibold'}>
                        <tr>
                          <th className="px-3 py-2 text-left">{l.sideCol}</th>
                          <th className="px-3 py-2 text-right">{l.directionCol}</th>
                          <th className="px-3 py-2 text-right">{l.enteredCol}</th>
                          <th className="px-3 py-2 text-right">{l.metersCol}</th>
                          <th className="px-3 py-2 text-right">{l.feetCol}</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y font-mono text-stone-700 ${
                        darkMode ? 'divide-stone-800 text-stone-300 bg-stone-900/40' : 'divide-stone-100 text-stone-700 bg-white'
                      }`}>
                        {['AB', 'BC', 'CD', 'DA'].map((sideKey) => {
                          const distObj = results.distances[sideKey];
                          const valStr = sideKey === 'AB' ? sideAB : sideKey === 'BC' ? sideBC : sideKey === 'CD' ? sideCD : sideDA;
                          const dirStr = sideKey === 'AB' ? l.east : sideKey === 'BC' ? l.north : sideKey === 'CD' ? l.west : l.south;

                          return (
                            <tr key={sideKey}>
                              <td className="px-3 py-2.5 font-bold font-sans">Side {sideKey}</td>
                              <td className="px-3 py-2.5 text-right font-sans">{dirStr}</td>
                              <td className="px-3 py-2.5 text-right font-bold">{valStr ? `${parseFloat(valStr)} ${getUnitName()}` : l.notFilled}</td>
                              <td className="px-3 py-2.5 text-right font-extrabold text-stone-900 dark:text-stone-100">
                                {distObj ? `${distObj.meters.toFixed(2)} m` : '-'}
                              </td>
                              <td className="px-3 py-2.5 text-right text-stone-500 font-semibold font-sans">
                                {distObj ? (
                                  <span className="text-[10px] space-x-1.5 block">
                                    <span>{distObj.feet.toFixed(1)} ft</span>
                                    <span className="opacity-40">•</span>
                                    <span>{distObj.kadi.toFixed(0)} कड़ी</span>
                                    <span className="opacity-40">•</span>
                                    <span>{distObj.gaj.toFixed(0)} गज</span>
                                  </span>
                                ) : '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Village Amin Averages */}
                {results.averages && (
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block">{l.averagesLabel}</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className={`p-3.5 border rounded-xl space-y-1 ${darkMode ? 'bg-stone-850/40 border-stone-800' : 'bg-stone-50 border-stone-200'}`}>
                        <span className="text-[9px] sm:text-[10px] text-stone-400 font-bold uppercase block">{l.avgLength}</span>
                        <p className="text-sm sm:text-base font-extrabold font-mono text-stone-900 dark:text-stone-100">
                          {results.averages.lengthM.toFixed(2)} meters
                        </p>
                        <p className="text-[10px] font-semibold text-stone-500 font-mono">
                          ≈ {results.averages.lengthFt.toFixed(2)} ft | {results.averages.lengthKadi.toFixed(1)} kadi
                        </p>
                      </div>

                      <div className={`p-3.5 border rounded-xl space-y-1 ${darkMode ? 'bg-stone-850/40 border-stone-800' : 'bg-stone-50 border-stone-200'}`}>
                        <span className="text-[9px] sm:text-[10px] text-stone-400 font-bold uppercase block">{l.avgWidth}</span>
                        <p className="text-sm sm:text-base font-extrabold font-mono text-stone-900 dark:text-stone-100">
                          {results.averages.widthM.toFixed(2)} meters
                        </p>
                        <p className="text-[10px] font-semibold text-stone-500 font-mono">
                          ≈ {results.averages.widthFt.toFixed(2)} ft | {results.averages.widthKadi.toFixed(1)} kadi
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Calculated Area Details */}
                {results.area && (
                  <>
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block">{l.calculatedArea}</span>
                      <div className="bg-stone-900 text-white rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                        <div className="space-y-1 text-center sm:text-left">
                          <span className="text-[9px] sm:text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                            {language === 'hi' ? 'कुल क्षेत्रफल (ग्राम औसत विधि)' : 'Total Ground Area (Village Avg)'}
                          </span>
                          <div className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight font-mono text-white flex items-baseline justify-center sm:justify-start gap-1">
                            {results.area.sqF.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                            <span className="text-xs sm:text-sm font-normal text-stone-300 uppercase">sq ft</span>
                          </div>
                        </div>

                        <div className="h-px sm:h-12 w-full sm:w-px bg-stone-800"></div>

                        <div className="text-center sm:text-right space-y-0.5">
                          <span className="text-[9px] sm:text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                            {language === 'hi' ? 'वर्ग मीटर रूपांतरण' : 'Square Meter Eq.'}
                          </span>
                          <div className="text-lg sm:text-xl font-bold font-mono text-amber-400">
                            {results.area.sqM.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            <span className="text-xs font-normal text-stone-300 ml-1">sq m</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Regional land record units */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block">{l.landUnits}</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 text-xs">
                        <div className={`p-2.5 sm:p-3.5 border rounded-xl text-center space-y-1 ${darkMode ? 'bg-stone-850 border-stone-800 text-stone-300' : 'bg-stone-50 border-stone-200'}`}>
                          <span className="text-[9px] sm:text-[10px] font-bold text-stone-400 block truncate">{language === 'hi' ? 'बिस्वा (Biswa)' : 'Biswa'}</span>
                          <p className="text-sm sm:text-base font-extrabold font-mono text-amber-600 dark:text-amber-500">{results.area.biswa.toFixed(2)}</p>
                          <span className="text-[8px] text-stone-400 font-medium">1220 sq ft</span>
                        </div>

                        <div className={`p-2.5 sm:p-3.5 border rounded-xl text-center space-y-1 ${darkMode ? 'bg-stone-850 border-stone-800 text-stone-300' : 'bg-stone-50 border-stone-200'}`}>
                          <span className="text-[9px] sm:text-[10px] font-bold text-stone-400 block truncate">{language === 'hi' ? 'बीघा (Bigha)' : 'Bigha'}</span>
                          <p className="text-sm sm:text-base font-extrabold font-mono text-amber-600 dark:text-amber-500">{results.area.bigha.toFixed(3)}</p>
                          <span className="text-[8px] text-stone-400 font-medium">20 Biswa</span>
                        </div>

                        <div className={`p-2.5 sm:p-3.5 border rounded-xl text-center space-y-1 ${darkMode ? 'bg-stone-850 border-stone-800 text-stone-300' : 'bg-stone-50 border-stone-200'}`}>
                          <span className="text-[9px] sm:text-[10px] font-bold text-stone-400 block truncate">{language === 'hi' ? 'डिसमिल (Dismil)' : 'Dismil'}</span>
                          <p className="text-sm sm:text-base font-extrabold font-mono text-stone-800 dark:text-stone-200">{results.area.dismil.toFixed(2)}</p>
                          <span className="text-[8px] text-stone-400 font-medium">435.6 sq ft</span>
                        </div>

                        <div className={`p-2.5 sm:p-3.5 border rounded-xl text-center space-y-1 ${darkMode ? 'bg-stone-850 border-stone-800 text-stone-300' : 'bg-stone-50 border-stone-200'}`}>
                          <span className="text-[9px] sm:text-[10px] font-bold text-stone-400 block truncate">{language === 'hi' ? 'एकड़ (Acre)' : 'Acre'}</span>
                          <p className="text-sm sm:text-base font-extrabold font-mono text-stone-800 dark:text-stone-200">{results.area.acre.toFixed(3)}</p>
                          <span className="text-[8px] text-stone-400 font-medium">100 Dismil</span>
                        </div>

                        <div className={`p-2.5 sm:p-3.5 border rounded-xl text-center space-y-1 col-span-2 sm:col-span-1 ${darkMode ? 'bg-stone-850 border-stone-800 text-stone-300' : 'bg-stone-50 border-stone-200'}`}>
                          <span className="text-[9px] sm:text-[10px] font-bold text-stone-400 block truncate">{language === 'hi' ? 'हेक्टेयर (Hectare)' : 'Hectare'}</span>
                          <p className="text-sm sm:text-base font-extrabold font-mono text-stone-800 dark:text-stone-200">{results.area.hectare.toFixed(4)}</p>
                          <span className="text-[8px] text-stone-400 font-medium">10,000 sq m</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Print Friendly Footer Signatures and Disclaimer */}
            <div className="pt-6 border-t border-dashed border-stone-300 dark:border-stone-800 flex flex-col sm:flex-row justify-between items-center text-[10px] text-stone-400 gap-4">
              <p className="text-center sm:text-left">
                {language === 'hi' 
                  ? '* यह दस्तावेज़ केवल विलेज अमीन/पटवारी भू-लेख रिकॉर्ड्स के संदर्भ हेतु तैयार की गयी डिजिटल गणना रिपोर्ट है।' 
                  : '* This report serves as a digital computation record compliant with traditional revenue/Patwari benchmarks.'}
              </p>
              <div className="flex gap-2">
                <span className="px-2 py-0.5 border rounded font-mono font-bold">1 BISWA = 1220 SQFT</span>
                <span className="px-2 py-0.5 border rounded font-mono font-bold">20 BISWA = 1 BIGHA</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
