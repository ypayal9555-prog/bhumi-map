/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Ruler, 
  Settings, 
  Map, 
  Layers, 
  Calculator, 
  RotateCcw, 
  ChevronRight, 
  Compass, 
  TrendingUp, 
  ShieldAlert 
} from 'lucide-react';
import { GuniyaRulerVisualizer, SarvguniyaPlotVisualizer } from './SarvguniyaVisualizer';

interface SarvguniyaMeasurerProps {
  darkMode: boolean;
  language: 'en' | 'hi';
  onDataChange?: (data: {
    mode: 'map' | 'ground';
    scale: '1/4000' | '16inch' | '32inch';
    instrument: string;
    sideAB: string;
    sideBC: string;
    sideCD: string;
    sideDA: string;
    results: any;
  } | null) => void;
}

// Conversions Constants
const KADI_TO_METER = 0.201168;
const METER_TO_FEET = 3.28084;
const FEET_TO_METER = 0.3048;
const SQFT_PER_DISMIL = 435.6;
const SQM_PER_HECTARE = 10000;
const SQFT_PER_BISWA = 1220;
const BISWA_PER_BIGHA = 20;

// Translation resources specifically for the Sarvguniya tool
const LOCAL_TXT = {
  hi: {
    title: 'सर्वगुनिया ज़मीन मापक',
    subtitle: 'नक्शा एवं सीधी ज़मीन मापक (गुनिया, फीता, कड़ी स्केल)',
    modeLabel: 'नापने का तरीका (Measurement Mode):',
    modeMap: '🗺️ नक्शे से नाप (गुनिया/स्केल)',
    modeGround: '⛰️ सीधी ज़मीन नाप (फ़ीता/कड़ी/टेप)',
    scaleLabel: 'नक्शे का पैमाना (Map Scale):',
    scaleSelectType: 'पैमाने का प्रकार:',
    scaleMetric: '1/4000 (मीट्रिक)',
    scaleTraditional: 'इंच = 1 मील (पारंपरिक)',
    scaleTraditionalSub: 'पारंपरिक पैमाना:',
    scale16: '16 इंच = 1 मील (खेत)',
    scale32: '32 इंच = 1 मील (आबादी)',
    instLabel: 'नापने का औज़ार (Survey Instrument):',
    sidesTitle: '📐 चारों भुजाएँ दर्ज करें',
    phAB: 'भुजा AB (पूर्व)',
    phBC: 'भुजा BC (उत्तर)',
    phCD: 'भुजा CD (पश्चिम)',
    phDA: 'भुजा DA (दक्षिण)',
    btnReset: 'रीसेट करें',
    btnCalc: 'मापन करें',
    footer: '1 बिस्वा = 1220 वर्ग फीट • 20 बिस्वा = 1 बीघा • विलेज अमीन फॉर्मूला',
    distTitle: '📏 ज़मीन पर वास्तविक दूरी (Actual Lengths)',
    avgTitle: '🔢 औसत गणना (Village Average)',
    areaTitle: '📐 कुल क्षेत्रफल (Total Area)',
    localTitle: '🏡 क्षेत्रीय भूमि रिकॉर्ड (Local Land Units)',
    east: 'पूर्व',
    north: 'उत्तर',
    west: 'पश्चिम',
    south: 'दक्षिण',
    avgL: 'औसत लंबाई (Avg Length)',
    avgW: 'औसत चौड़ाई (Avg Width)',
    sqM: 'वर्ग मीटर',
    sqF: 'वर्ग फीट',
    sqG: 'वर्ग गज',
    sqK: 'वर्ग कड़ी',
    dismil: 'डिसमिल',
    hect: 'हेक्टेयर',
    acre: 'एकड़',
    biswa: 'बिस्वा',
    bigha: 'बीघा',
    notFilled: 'अपूरित',
    noSidesMsg: 'कृपया भुजाओं के मान दर्ज करें।',
    incompleteMsg: 'पूरा क्षेत्रफल और क्षेत्रीय गणना जानने के लिए चारों भुजाएँ दर्ज करना आवश्यक है।',
    unitKhana: 'खाने',
    unitCm: 'सेमी (cm)',
    unitMm: 'मिमी (mm)',
    unitMeter: 'मीटर',
    unitFeet: 'फीट',
    unitKadi: 'कड़ी',
    iMG: 'मीटर गुनिया (1 खाना = 4m)',
    iK25: 'कड़ी गुनिया - 25 ज़ीरो (1 खाना = 20 कड़ी)',
    iK20: 'कड़ी गुनिया - 20 ज़ीरो (1 खाना = 25 कड़ी)',
    iK50: 'कड़ी गुनिया - 50 ज़ीरो (1 खाना = 10 कड़ी)',
    iK25_32: 'कड़ी गुनिया - 25 ज़ीरो (1 खाना = 10 कड़ी)',
    iK20_32: 'कड़ी गुनिया - 20 ज़ीरो (1 खाना = 12.5 कड़ी)',
    iPCm: 'प्लास्टिक स्केल (cm) (1 cm = 196.85 कड़ी)',
    iPMm: 'प्लास्टिक स्केल (mm) (1 mm = 19.685 कड़ी)',
    iPCm_4000: 'प्लास्टिक स्केल (cm) (1 cm = 40 मीटर)',
    iPMm_4000: 'प्लास्टिक स्केल (mm) (1 mm = 4 मीटर)',
    iPCm_32: 'प्लास्टिक स्केल (cm) (1 cm = 98.425 कड़ी)',
    iPMm_32: 'प्लास्टिक स्केल (mm) (1 mm = 9.8425 कड़ी)',
    iFM: 'फीता / टेप (मीटर)',
    iFF: 'फीता / टेप (फीट)',
    iKD: 'जरीब / कड़ी (सीधी कड़ी)',
    scaleCardTitle: 'चुने गए मापदंड',
    scaleCardDesc: 'ये गणना गाँव के पटवारी, लेखपाल और अमीन द्वारा स्वीकृत पारंपरिक पैमानों पर आधारित है।'
  },
  en: {
    title: 'Sarvguniya Land Measurer',
    subtitle: 'Map & Direct Ground Calculator (Guniya, Tape, Chain scale)',
    modeLabel: 'Measurement Mode:',
    modeMap: '🗺️ Map Survey (Guniya/Scale)',
    modeGround: '⛰️ Direct Ground (Tape/Chain)',
    scaleLabel: 'Map Scale:',
    scaleSelectType: 'Scale Type:',
    scaleMetric: '1/4000 (Metric)',
    scaleTraditional: 'Inch = 1 Mile (Traditional)',
    scaleTraditionalSub: 'Traditional Scale:',
    scale16: '16 Inch = 1 Mile (Fields)',
    scale32: '32 Inch = 1 Mile (Habitation)',
    instLabel: 'Survey Instrument:',
    sidesTitle: '📐 Enter Four Sides',
    phAB: 'Side AB (East)',
    phBC: 'Side BC (North)',
    phCD: 'Side CD (West)',
    phDA: 'Side DA (South)',
    btnReset: 'Reset',
    btnCalc: 'Calculate',
    footer: '1 Biswa = 1220 sq ft • 20 Biswa = 1 Bigha • Village Amin Formula',
    distTitle: '📏 Converted Ground Distances',
    avgTitle: '🔢 Opposite Side Averages',
    areaTitle: '📐 Total Area Outlines',
    localTitle: '🏡 Regional Revenue Conversion',
    east: 'East',
    north: 'North',
    west: 'West',
    south: 'South',
    avgL: 'Avg Length',
    avgW: 'Avg Width',
    sqM: 'Square Meter',
    sqF: 'Square Feet',
    sqG: 'Square Gaj',
    sqK: 'Square Kadi',
    dismil: 'Dismil',
    hect: 'Hectare',
    acre: 'Acre',
    biswa: 'Biswa',
    bigha: 'Bigha',
    notFilled: 'Not Entered',
    noSidesMsg: 'No side dimensions entered yet.',
    incompleteMsg: 'Fill all 4 side values for a complete area and village unit breakdown.',
    unitKhana: 'divisions',
    unitCm: 'cm',
    unitMm: 'mm',
    unitMeter: 'meters',
    unitFeet: 'feet',
    unitKadi: 'links',
    iMG: 'Meter Guniya (1 division = 4m)',
    iK25: 'Kadi Guniya - 25 Zero (1 division = 20 links)',
    iK20: 'Kadi Guniya - 20 Zero (1 division = 25 links)',
    iK50: 'Kadi Guniya - 50 Zero (1 division = 10 links)',
    iK25_32: 'Kadi Guniya - 25 Zero (1 division = 10 links)',
    iK20_32: 'Kadi Guniya - 20 Zero (1 division = 12.5 links)',
    iPCm: 'Plastic Ruler (cm) (1 cm = 196.85 links)',
    iPMm: 'Plastic Ruler (mm) (1 mm = 19.685 links)',
    iPCm_4000: 'Plastic Ruler (cm) (1 cm = 40 meters)',
    iPMm_4000: 'Plastic Ruler (mm) (1 mm = 4 meters)',
    iPCm_32: 'Plastic Ruler (cm) (1 cm = 98.425 links)',
    iPMm_32: 'Plastic Ruler (mm) (1 mm = 9.8425 links)',
    iFM: 'Tape Measure (meters)',
    iFF: 'Tape Measure (feet)',
    iKD: 'Gunter\'s Chain (links)',
    scaleCardTitle: 'Selected Criteria',
    scaleCardDesc: 'This calculation complies with standard rural land records used by Amin, Lekhpal, and Patwari.'
  }
};

export default function SarvguniyaMeasurer({ darkMode, language, onDataChange }: SarvguniyaMeasurerProps) {
  const t = LOCAL_TXT[language];

  // State values
  const [mode, setMode] = useState<'map' | 'ground'>('map');
  const [scale, setScale] = useState<'1/4000' | '16inch' | '32inch'>('1/4000');
  const [primaryScale, setPrimaryScale] = useState<'metric' | 'traditional'>('metric');
  const [instrument, setInstrument] = useState<string>('meterGuniya');

  const [sideAB, setSideAB] = useState<string>('');
  const [sideBC, setSideBC] = useState<string>('');
  const [sideCD, setSideCD] = useState<string>('');
  const [sideDA, setSideDA] = useState<string>('');

  const [results, setResults] = useState<any>(null);
  const [showIncomplete, setShowIncomplete] = useState<boolean>(false);

  // Sync default instrument when mode or scale changes to ensure valid options
  useEffect(() => {
    if (mode === 'map') {
      if (scale === '1/4000') {
        // Meter scale allows meterGuniya, plasticScaleCm, plasticScaleMm
        if (instrument !== 'meterGuniya' && instrument !== 'plasticScaleCm' && instrument !== 'plasticScaleMm') {
          setInstrument('meterGuniya');
        }
      } else if (scale === '16inch') {
        // 16inch (kadi scale) allows kadiGuniya25, kadiGuniya20, kadiGuniya50, plasticScaleCm, plasticScaleMm
        if (instrument !== 'kadiGuniya25' && instrument !== 'kadiGuniya20' && instrument !== 'kadiGuniya50' && instrument !== 'plasticScaleCm' && instrument !== 'plasticScaleMm') {
          setInstrument('kadiGuniya25');
        }
      } else if (scale === '32inch') {
        // 32inch (abadi scale) allows kadiGuniya25, kadiGuniya20, plasticScaleCm, plasticScaleMm
        if (instrument !== 'kadiGuniya25' && instrument !== 'kadiGuniya20' && instrument !== 'plasticScaleCm' && instrument !== 'plasticScaleMm') {
          setInstrument('kadiGuniya25');
        }
      }
    } else {
      // Ground mode allows fitaMeter, fitaFeet, kadiDirect
      if (instrument !== 'fitaMeter' && instrument !== 'fitaFeet' && instrument !== 'kadiDirect') {
        setInstrument('fitaMeter');
      }
    }
  }, [mode, scale, instrument]);

  const getUnitName = (inst: string) => {
    switch (inst) {
      case 'meterGuniya':
      case 'kadiGuniya25':
      case 'kadiGuniya20':
      case 'kadiGuniya50':
        return t.unitKhana;
      case 'plasticScaleCm':
        return t.unitCm;
      case 'plasticScaleMm':
        return t.unitMm;
      case 'fitaMeter':
        return t.unitMeter;
      case 'fitaFeet':
        return t.unitFeet;
      case 'kadiDirect':
        return t.unitKadi;
      default:
        return t.unitKhana;
    }
  };

  const convertToMetersValue = (val: number, inst: string, scl: string): number => {
    if (isNaN(val) || val <= 0) return 0;
    switch (inst) {
      case 'meterGuniya':
        return val * 4; // Meter Guniya per division = 4m
      case 'kadiGuniya25':
        return scl === '32inch' 
          ? val * 10 * KADI_TO_METER 
          : val * 20 * KADI_TO_METER;
      case 'kadiGuniya20':
        return scl === '32inch' 
          ? val * 12.5 * KADI_TO_METER 
          : val * 25 * KADI_TO_METER;
      case 'kadiGuniya50':
        return val * 10 * KADI_TO_METER;
      case 'plasticScaleCm':
        if (scl === '1/4000') return val * 40;
        if (scl === '32inch') return val * 98.425 * KADI_TO_METER;
        return val * 196.85 * KADI_TO_METER;
      case 'plasticScaleMm':
        if (scl === '1/4000') return val * 4;
        if (scl === '32inch') return val * 9.8425 * KADI_TO_METER;
        return val * 19.685 * KADI_TO_METER;
      case 'fitaMeter':
        return val;
      case 'fitaFeet':
        return val * FEET_TO_METER;
      case 'kadiDirect':
        return val * KADI_TO_METER;
      default:
        return 0;
    }
  };

  const getFullBreakdown = (m: number) => {
    if (m <= 0) return { meters: 0, feet: 0, kadi: 0, gaj: 0 };
    return {
      meters: m,
      feet: m * METER_TO_FEET,
      kadi: m / KADI_TO_METER,
      gaj: (m * METER_TO_FEET) / 3,
    };
  };

  const handleReset = () => {
    setSideAB('');
    setSideBC('');
    setSideCD('');
    setSideDA('');
    setResults(null);
    setShowIncomplete(false);
    setScale('1/4000');
    setPrimaryScale('metric');
  };

  const handleCalculate = () => {
    const abRaw = parseFloat(sideAB);
    const bcRaw = parseFloat(sideBC);
    const cdRaw = parseFloat(sideCD);
    const daRaw = parseFloat(sideDA);

    // Collect entered sides
    const inputs: any = {};
    if (!isNaN(abRaw) && abRaw > 0) inputs.AB = abRaw;
    if (!isNaN(bcRaw) && bcRaw > 0) inputs.BC = bcRaw;
    if (!isNaN(cdRaw) && cdRaw > 0) inputs.CD = cdRaw;
    if (!isNaN(daRaw) && daRaw > 0) inputs.DA = daRaw;

    const filledKeys = Object.keys(inputs);
    const isAllFour = filledKeys.length === 4;

    if (filledKeys.length === 0) {
      setResults(null);
      setShowIncomplete(true);
      return;
    }

    // Convert all filled sides to standard meters
    const sidesMeters: any = {};
    filledKeys.forEach(k => {
      sidesMeters[k] = convertToMetersValue(inputs[k], instrument, scale);
    });

    // 1. Compile Side Distances
    const abM = sidesMeters.AB || 0;
    const bcM = sidesMeters.BC || 0;
    const cdM = sidesMeters.CD || 0;
    const daM = sidesMeters.DA || 0;

    const distances = {
      AB: getFullBreakdown(abM),
      BC: getFullBreakdown(bcM),
      CD: getFullBreakdown(cdM),
      DA: getFullBreakdown(daM),
    };

    if (!isAllFour) {
      // Incomplete but can show side conversions
      setResults({
        isComplete: false,
        distances,
      });
      setShowIncomplete(true);
      return;
    }

    setShowIncomplete(false);

    // 2. Average Calculations (Village standard)
    const avgLengthM = (abM + cdM) / 2;
    const avgWidthM = (bcM + daM) / 2;

    const abKadi = abM / KADI_TO_METER;
    const bcKadi = bcM / KADI_TO_METER;
    const cdKadi = cdM / KADI_TO_METER;
    const daKadi = daM / KADI_TO_METER;
    const avgLengthKadi = (abKadi + cdKadi) / 2;
    const avgWidthKadi = (bcKadi + daKadi) / 2;

    const areaM2 = avgLengthM * avgWidthM;
    const areaSqFt = areaM2 * 10.7639;
    const areaSqGaj = areaSqFt / 9;
    const areaSqKadi = avgLengthKadi * avgWidthKadi;

    const dismil = areaSqFt / SQFT_PER_DISMIL;
    const hectare = areaM2 / SQM_PER_HECTARE;
    const acre = dismil / 100;
    const biswa = areaSqFt / SQFT_PER_BISWA;
    const bigha = biswa / BISWA_PER_BIGHA;

    setResults({
      isComplete: true,
      distances,
      averages: {
        lengthM: avgLengthM,
        lengthFt: avgLengthM * METER_TO_FEET,
        lengthKadi: avgLengthKadi,
        widthM: avgWidthM,
        widthFt: avgWidthM * METER_TO_FEET,
        widthKadi: avgWidthKadi,
      },
      area: {
        sqM: areaM2,
        sqF: areaSqFt,
        sqG: areaSqGaj,
        sqK: areaSqKadi,
        dismil,
        hectare,
        acre,
        biswa,
        bigha,
      }
    });
  };

  // Run automatically when any inputs change
  useEffect(() => {
    if (sideAB || sideBC || sideCD || sideDA) {
      handleCalculate();
    } else {
      setResults(null);
      setShowIncomplete(false);
    }
  }, [sideAB, sideBC, sideCD, sideDA, mode, scale, instrument]);

  // Sync state up to parent for PDF/Print report generation
  useEffect(() => {
    if (onDataChange) {
      if (sideAB || sideBC || sideCD || sideDA) {
        onDataChange({
          mode,
          scale,
          instrument,
          sideAB,
          sideBC,
          sideCD,
          sideDA,
          results
        });
      } else {
        onDataChange(null);
      }
    }
  }, [mode, scale, instrument, sideAB, sideBC, sideCD, sideDA, results, onDataChange]);

  return (
    <div className="space-y-6">
      {/* Introduction Card */}
      <div className={`p-5 rounded-2xl border transition-all duration-300 ${
        darkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight">{t.title}</h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{t.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Main Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Control and Inputs Column */}
        <div className="lg:col-span-5 space-y-5">
          {/* Controls Panel */}
          <div className={`p-5 rounded-2xl border space-y-4 transition-all duration-300 ${
            darkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'
          }`}>
            <div className="flex items-center gap-2 border-b pb-3 border-stone-250 dark:border-stone-800">
              <Settings className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold uppercase tracking-wider">{language === 'hi' ? 'सेटिंग्स' : 'Configuration'}</span>
            </div>

            {/* Mode selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-500 dark:text-stone-400">{t.modeLabel}</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMode('map')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    mode === 'map'
                      ? 'bg-amber-600 text-white border-amber-600'
                      : darkMode
                        ? 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:text-stone-800'
                  }`}
                >
                  {language === 'hi' ? '🗺️ नक्शे से' : '🗺️ Map'}
                </button>
                <button
                  onClick={() => setMode('ground')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    mode === 'ground'
                      ? 'bg-amber-600 text-white border-amber-600'
                      : darkMode
                        ? 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:text-stone-800'
                  }`}
                >
                  {language === 'hi' ? '⛰️ सीधी ज़मीन' : '⛰️ Tape/Chain'}
                </button>
              </div>
            </div>

            {/* Scale selection (Map only) */}
            {mode === 'map' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3"
              >
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 dark:text-stone-400">{t.scaleLabel}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPrimaryScale('metric');
                        setScale('1/4000');
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center ${
                        primaryScale === 'metric'
                          ? 'bg-amber-600 text-white border-amber-600 animate-press'
                          : darkMode
                            ? 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                            : 'bg-stone-50 border-stone-200 text-stone-600 hover:text-stone-800'
                      }`}
                    >
                      {t.scaleMetric}
                    </button>
                    
                    <div className="relative">
                      <select
                        value={primaryScale === 'traditional' ? scale : 'metric-placeholder'}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPrimaryScale('traditional');
                          if (val === '32inch') {
                            setScale('32inch');
                          } else {
                            setScale('16inch');
                          }
                        }}
                        className={`w-full py-2.5 pl-3 pr-8 rounded-xl text-xs font-bold border outline-none cursor-pointer appearance-none transition-all ${
                          primaryScale === 'traditional'
                            ? 'bg-amber-600 text-white border-amber-600 font-bold'
                            : darkMode
                              ? 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                              : 'bg-stone-50 border-stone-200 text-stone-600 hover:text-stone-800'
                        }`}
                      >
                        {primaryScale === 'metric' && (
                          <option value="metric-placeholder" disabled className="hidden">
                            {t.scale16}
                          </option>
                        )}
                        <option 
                          value="16inch" 
                          className={darkMode ? 'bg-stone-900 text-stone-200 font-semibold' : 'bg-white text-stone-850 font-semibold'}
                        >
                          {t.scale16}
                        </option>
                        <option 
                          value="32inch" 
                          className={darkMode ? 'bg-stone-900 text-stone-200 font-semibold' : 'bg-white text-stone-850 font-semibold'}
                        >
                          {t.scale32}
                        </option>
                      </select>
                      <div className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                        primaryScale === 'traditional' ? 'text-white' : 'text-stone-400'
                      }`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Instrument Selection dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-500 dark:text-stone-400">{t.instLabel}</label>
              <select
                value={instrument}
                onChange={(e) => setInstrument(e.target.value)}
                className={`w-full p-2.5 rounded-xl border text-xs font-bold outline-none cursor-pointer transition-colors ${
                  darkMode 
                    ? 'bg-stone-950 border-stone-800 text-stone-200 focus:border-amber-600' 
                    : 'bg-stone-50 border-stone-250 text-stone-800 focus:border-amber-600'
                }`}
              >
                {mode === 'map' ? (
                  scale === '1/4000' ? (
                    <>
                      <option value="meterGuniya">{t.iMG}</option>
                      <option value="plasticScaleCm">{t.iPCm_4000}</option>
                      <option value="plasticScaleMm">{t.iPMm_4000}</option>
                    </>
                  ) : scale === '32inch' ? (
                    <>
                      <option value="kadiGuniya25">{t.iK25_32}</option>
                      <option value="kadiGuniya20">{t.iK20_32}</option>
                      <option value="plasticScaleCm">{t.iPCm_32}</option>
                      <option value="plasticScaleMm">{t.iPMm_32}</option>
                    </>
                  ) : (
                    <>
                      <option value="kadiGuniya25">{t.iK25}</option>
                      <option value="kadiGuniya20">{t.iK20}</option>
                      <option value="kadiGuniya50">{t.iK50}</option>
                      <option value="plasticScaleCm">{t.iPCm}</option>
                      <option value="plasticScaleMm">{t.iPMm}</option>
                    </>
                  )
                ) : (
                  <>
                    <option value="fitaMeter">{t.iFM}</option>
                    <option value="fitaFeet">{t.iFF}</option>
                    <option value="kadiDirect">{t.iKD}</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Sides Dimensions Card */}
          <div className={`p-5 rounded-2xl border space-y-4 transition-all duration-300 ${
            darkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'
          }`}>
            <div className="flex items-center gap-2 border-b pb-3 border-stone-250 dark:border-stone-800">
              <Ruler className="w-4 h-4 text-amber-600 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider">{t.sidesTitle}</span>
            </div>

            <div className="space-y-3">
              {/* AB (East) */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={sideAB}
                    onChange={(e) => setSideAB(e.target.value)}
                    placeholder={t.phAB}
                    className={`w-full pl-3 pr-16 py-2.5 rounded-xl border text-sm font-semibold outline-none transition-colors ${
                      darkMode 
                        ? 'bg-stone-950 border-stone-850 text-stone-100 placeholder-stone-600 focus:border-amber-600' 
                        : 'bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400 focus:border-amber-600'
                    }`}
                  />
                  <span className={`absolute right-3.5 top-2.5 text-[10px] font-bold uppercase tracking-wider ${
                    darkMode ? 'text-amber-500/80' : 'text-amber-700/80'
                  }`}>
                    {getUnitName(instrument)}
                  </span>
                </div>
              </div>

              {/* BC (North) */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={sideBC}
                    onChange={(e) => setSideBC(e.target.value)}
                    placeholder={t.phBC}
                    className={`w-full pl-3 pr-16 py-2.5 rounded-xl border text-sm font-semibold outline-none transition-colors ${
                      darkMode 
                        ? 'bg-stone-950 border-stone-850 text-stone-100 placeholder-stone-600 focus:border-amber-600' 
                        : 'bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400 focus:border-amber-600'
                    }`}
                  />
                  <span className={`absolute right-3.5 top-2.5 text-[10px] font-bold uppercase tracking-wider ${
                    darkMode ? 'text-amber-500/80' : 'text-amber-700/80'
                  }`}>
                    {getUnitName(instrument)}
                  </span>
                </div>
              </div>

              {/* CD (West) */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={sideCD}
                    onChange={(e) => setSideCD(e.target.value)}
                    placeholder={t.phCD}
                    className={`w-full pl-3 pr-16 py-2.5 rounded-xl border text-sm font-semibold outline-none transition-colors ${
                      darkMode 
                        ? 'bg-stone-950 border-stone-850 text-stone-100 placeholder-stone-600 focus:border-amber-600' 
                        : 'bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400 focus:border-amber-600'
                    }`}
                  />
                  <span className={`absolute right-3.5 top-2.5 text-[10px] font-bold uppercase tracking-wider ${
                    darkMode ? 'text-amber-500/80' : 'text-amber-700/80'
                  }`}>
                    {getUnitName(instrument)}
                  </span>
                </div>
              </div>

              {/* DA (South) */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={sideDA}
                    onChange={(e) => setSideDA(e.target.value)}
                    placeholder={t.phDA}
                    className={`w-full pl-3 pr-16 py-2.5 rounded-xl border text-sm font-semibold outline-none transition-colors ${
                      darkMode 
                        ? 'bg-stone-950 border-stone-850 text-stone-100 placeholder-stone-600 focus:border-amber-600' 
                        : 'bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400 focus:border-amber-600'
                    }`}
                  />
                  <span className={`absolute right-3.5 top-2.5 text-[10px] font-bold uppercase tracking-wider ${
                    darkMode ? 'text-amber-500/80' : 'text-amber-700/80'
                  }`}>
                    {getUnitName(instrument)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleReset}
                className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none ${
                  darkMode 
                    ? 'bg-stone-850 hover:bg-stone-800 text-stone-300' 
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.btnReset}</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleCalculate}
                className="py-2 px-4 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none shadow-sm shadow-amber-600/15"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>{t.btnCalc}</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Right Output Column */}
        <div className="lg:col-span-7 space-y-5">
          <AnimatePresence mode="wait">
            {!results ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5 animate-fadeIn"
              >
                <div className={`p-10 rounded-3xl border text-center space-y-3 transition-all duration-300 ${
                  darkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'
                }`}>
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-2">
                    <Ruler className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold">{t.noSidesMsg}</h3>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">{t.incompleteMsg}</p>
                  
                  <div className="pt-4 max-w-xs mx-auto border-t border-stone-250 dark:border-stone-800">
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block mb-1">
                      {t.scaleCardTitle}
                    </span>
                    <p className="text-[10px] text-stone-400">
                      {t.scaleCardDesc}
                    </p>
                  </div>
                </div>

                {/* Guniya Scale Simulator in Empty State */}
                <GuniyaRulerVisualizer
                  instrument={instrument}
                  scale={scale}
                  darkMode={darkMode}
                  language={language}
                />
              </motion.div>
            ) : (
              <motion.div
                key="result-state"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-5"
              >
                {/* 1. Shape Visualizer representing the quadrilateral plot (Village Average setup) */}
                {results.isComplete && (
                  <SarvguniyaPlotVisualizer
                    sideAB={parseFloat(sideAB) || 0}
                    sideBC={parseFloat(sideBC) || 0}
                    sideCD={parseFloat(sideCD) || 0}
                    sideDA={parseFloat(sideDA) || 0}
                    results={results}
                    darkMode={darkMode}
                    language={language}
                  />
                )}

                {/* Converted Ground Distances (Section 1) */}
                <div className={`p-5 rounded-2xl border space-y-4 transition-all duration-300 ${
                  darkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'
                }`}>
                  <div className="flex items-center gap-2 border-b pb-3 border-stone-250 dark:border-stone-800">
                    <Compass className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold uppercase tracking-wider">{t.distTitle}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {Object.entries(results.distances).map(([sideKey, info]: any) => (
                      <div 
                        key={sideKey}
                        className={`p-3.5 rounded-xl border space-y-1 transition-colors duration-300 ${
                          darkMode ? 'bg-stone-950 border-stone-850' : 'bg-stone-50 border-stone-250/50'
                        }`}
                      >
                        <div className="flex items-center justify-between border-b pb-1.5 border-stone-200 dark:border-stone-850">
                          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-500">
                            {language === 'hi' 
                              ? `भुजा ${sideKey} (${sideKey === 'AB' ? t.east : sideKey === 'BC' ? t.north : sideKey === 'CD' ? t.west : t.south})`
                              : `Side ${sideKey} (${sideKey === 'AB' ? t.east : sideKey === 'BC' ? t.north : sideKey === 'CD' ? t.west : t.south})`
                            }
                          </span>
                          <span className="font-mono text-[10px] font-bold text-stone-500">
                            {sideKey === 'AB' ? 'AB' : sideKey === 'BC' ? 'BC' : sideKey === 'CD' ? 'CD' : 'DA'}
                          </span>
                        </div>
                        {info.meters > 0 ? (
                          <div className="space-y-1">
                            <p className={`text-base font-extrabold font-mono ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>
                              {info.meters.toFixed(2)} <span className="text-xs font-semibold uppercase text-stone-500">meters</span>
                            </p>
                            <p className="text-[10px] font-bold font-mono text-stone-500 space-x-1.5">
                              <span>≈ {info.feet.toFixed(2)} ft</span>
                              <span className="opacity-40">•</span>
                              <span>{info.kadi.toFixed(1)} kadi</span>
                              <span className="opacity-40">•</span>
                              <span>{info.gaj.toFixed(1)} gaj</span>
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-stone-500 italic block py-1">{t.notFilled}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {showIncomplete && !results.isComplete && (
                    <div className="bg-amber-600/10 p-3 rounded-xl border border-amber-600/20 text-[11px] text-amber-700 dark:text-amber-400 text-center font-medium">
                      {t.incompleteMsg}
                    </div>
                  )}
                </div>

                {/* Complete Results: Averages and Area Breakdown */}
                {results.isComplete && (
                  <>
                    {/* Averages Section */}
                    <div className={`p-5 rounded-2xl border space-y-4 transition-all duration-300 ${
                      darkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'
                    }`}>
                      <div className="flex items-center gap-2 border-b pb-3 border-stone-250 dark:border-stone-800">
                        <Layers className="w-4 h-4 text-amber-600" />
                        <span className="text-xs font-bold uppercase tracking-wider">{t.avgTitle}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className={`p-3.5 rounded-xl border space-y-1 ${
                          darkMode ? 'bg-stone-950 border-stone-850' : 'bg-stone-50 border-stone-200/80'
                        }`}>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">{t.avgL}</span>
                          <p className="text-base font-extrabold font-mono">
                            {results.averages.lengthM.toFixed(2)} m
                          </p>
                          <p className="text-[10px] font-medium text-stone-500 font-mono">
                            ≈ {results.averages.lengthFt.toFixed(2)} ft | {results.averages.lengthKadi.toFixed(1)} kadi
                          </p>
                        </div>

                        <div className={`p-3.5 rounded-xl border space-y-1 ${
                          darkMode ? 'bg-stone-950 border-stone-850' : 'bg-stone-50 border-stone-200/80'
                        }`}>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">{t.avgW}</span>
                          <p className="text-base font-extrabold font-mono">
                            {results.averages.widthM.toFixed(2)} m
                          </p>
                          <p className="text-[10px] font-medium text-stone-500 font-mono">
                            ≈ {results.averages.widthFt.toFixed(2)} ft | {results.averages.widthKadi.toFixed(1)} kadi
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Area Section */}
                    <div className={`p-5 rounded-2xl border space-y-4 transition-all duration-300 ${
                      darkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'
                    }`}>
                      <div className="flex items-center gap-2 border-b pb-3 border-stone-250 dark:border-stone-800">
                        <TrendingUp className="w-4 h-4 text-amber-600" />
                        <span className="text-xs font-bold uppercase tracking-wider">{t.areaTitle}</span>
                      </div>

                      {/* Area Bento Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className={`p-3 rounded-xl border text-center ${
                          darkMode ? 'bg-stone-950 border-stone-800' : 'bg-stone-50 border-stone-200'
                        }`}>
                          <span className="text-[10px] text-stone-500 font-bold uppercase tracking-tight block truncate">{t.sqM}</span>
                          <span className={`text-sm sm:text-base font-extrabold font-mono block mt-1 ${
                            darkMode ? 'text-stone-100' : 'text-stone-900'
                          }`}>
                            {results.area.sqM.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </span>
                        </div>

                        <div className={`p-3 rounded-xl border text-center ${
                          darkMode ? 'bg-stone-950 border-stone-800' : 'bg-stone-50 border-stone-200'
                        }`}>
                          <span className="text-[10px] text-stone-500 font-bold uppercase tracking-tight block truncate">{t.sqF}</span>
                          <span className={`text-sm sm:text-base font-extrabold font-mono block mt-1 ${
                            darkMode ? 'text-stone-100' : 'text-stone-900'
                          }`}>
                            {results.area.sqF.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                          </span>
                        </div>

                        <div className={`p-3 rounded-xl border text-center ${
                          darkMode ? 'bg-stone-950 border-stone-800' : 'bg-stone-50 border-stone-200'
                        }`}>
                          <span className="text-[10px] text-stone-500 font-bold uppercase tracking-tight block truncate">{t.sqG}</span>
                          <span className={`text-sm sm:text-base font-extrabold font-mono block mt-1 ${
                            darkMode ? 'text-stone-100' : 'text-stone-900'
                          }`}>
                            {results.area.sqG.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                          </span>
                        </div>

                        <div className={`p-3 rounded-xl border text-center ${
                          darkMode ? 'bg-stone-950 border-stone-800' : 'bg-stone-50 border-stone-200'
                        }`}>
                          <span className="text-[10px] text-stone-500 font-bold uppercase tracking-tight block truncate">{t.sqK}</span>
                          <span className={`text-sm sm:text-base font-extrabold font-mono block mt-1 ${
                            darkMode ? 'text-stone-100' : 'text-stone-900'
                          }`}>
                            {results.area.sqK.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </span>
                        </div>

                        <div className={`p-3 rounded-xl border text-center ${
                          darkMode ? 'bg-stone-950 border-stone-800' : 'bg-stone-50 border-stone-200'
                        }`}>
                          <span className="text-[10px] text-stone-500 font-bold uppercase tracking-tight block truncate">{t.dismil}</span>
                          <span className={`text-sm sm:text-base font-extrabold font-mono block mt-1 ${
                            darkMode ? 'text-stone-100' : 'text-stone-900'
                          }`}>
                            {results.area.dismil.toFixed(2)}
                          </span>
                        </div>

                        <div className={`p-3 rounded-xl border text-center ${
                          darkMode ? 'bg-stone-950 border-stone-800' : 'bg-stone-50 border-stone-200'
                        }`}>
                          <span className="text-[10px] text-stone-500 font-bold uppercase tracking-tight block truncate">{t.hect}</span>
                          <span className={`text-sm sm:text-base font-extrabold font-mono block mt-1 ${
                            darkMode ? 'text-stone-100' : 'text-stone-900'
                          }`}>
                            {results.area.hectare.toFixed(4)}
                          </span>
                        </div>

                        <div className={`p-3 rounded-xl border text-center col-span-2 ${
                          darkMode ? 'bg-stone-950 border-stone-800' : 'bg-stone-50 border-stone-200'
                        }`}>
                          <span className="text-[10px] text-stone-500 font-bold uppercase tracking-tight block truncate">{t.acre}</span>
                          <span className={`text-sm sm:text-base font-extrabold font-mono block mt-1 ${
                            darkMode ? 'text-stone-100' : 'text-stone-900'
                          }`}>
                            {results.area.acre.toFixed(3)} acres
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Local Regional Conversion Section */}
                    <div className={`p-5 rounded-2xl border space-y-4 transition-all duration-300 ${
                      darkMode ? 'bg-stone-900 border-stone-800 animate-fadeIn' : 'bg-white border-stone-200 animate-fadeIn'
                    }`}>
                      <div className="flex items-center gap-2 border-b pb-3 border-stone-250 dark:border-stone-800">
                        <Layers className="w-4 h-4 text-amber-600" />
                        <span className="text-xs font-bold uppercase tracking-wider">{t.localTitle}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className={`p-4 rounded-xl border text-center space-y-1 transition-colors duration-300 ${
                          darkMode ? 'bg-amber-500/10 border-amber-500/15' : 'bg-amber-50 border-amber-200/80'
                        }`}>
                          <span className="text-[10px] font-bold text-amber-900 dark:text-amber-400 uppercase tracking-widest block">{t.biswa} (बिस्वा)</span>
                          <span className="text-2xl font-bold font-mono text-amber-950 dark:text-amber-300">{results.area.biswa.toFixed(2)}</span>
                          <span className={`text-[9px] font-medium block ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}>{language === 'hi' ? '1220 वर्ग फीट' : '1220 sq ft'}</span>
                        </div>

                        <div className={`p-4 rounded-xl border text-center space-y-1 transition-colors duration-300 ${
                          darkMode ? 'bg-amber-500/10 border-amber-500/15' : 'bg-amber-50 border-amber-200/80'
                        }`}>
                          <span className="text-[10px] font-bold text-amber-900 dark:text-amber-400 uppercase tracking-widest block">{t.bigha} (बीघा)</span>
                          <span className="text-2xl font-bold font-mono text-amber-950 dark:text-amber-300">{results.area.bigha.toFixed(3)}</span>
                          <span className={`text-[9px] font-medium block ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}>{language === 'hi' ? '20 बिस्वा' : '20 Biswa'}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Guniya Scale Simulator at the bottom of results */}
                <GuniyaRulerVisualizer
                  instrument={instrument}
                  scale={scale}
                  darkMode={darkMode}
                  language={language}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="text-center pt-3">
        <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
          {t.footer}
        </p>
      </div>
    </div>
  );
}
