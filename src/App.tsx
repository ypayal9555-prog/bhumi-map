/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DimensionValues, MeasuringUnit, CalculationMethod, CalculationRecord } from './types';
import Header from './components/Header';
import PlotCanvas from './components/PlotCanvas';
import DimensionsForm from './components/DimensionsForm';
import MethodAccordion from './components/MethodAccordion';
import SplitShares from './components/SplitShares';
import HistoryList from './components/HistoryList';
import ReportModal from './components/ReportModal';
import GuideModal from './components/GuideModal';
import { calculateAverageArea, calculateTriangularArea } from './geometryUtils';
import { SQFT_PER_BISWA, SQFT_PER_BIGHA, SQFT_PER_ACRE } from './units';
import { Calculator, Users, History, Compass, Ruler } from 'lucide-react';
import { translations, Language } from './locales';
import SarvguniyaMeasurer from './components/SarvguniyaMeasurer';
import SarvguniyaReportModal from './components/SarvguniyaReportModal';

export default function App() {
  // 1. Theme and Translation States
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('bhumi_language');
    return (saved === 'hi' || saved === 'en') ? saved : 'en';
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('bhumi_dark_mode');
    return saved === 'true';
  });

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('bhumi_language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('bhumi_dark_mode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const t = translations[language];

  // 2. Core Geometry States
  const [dimensions, setDimensions] = useState<DimensionValues>({
    sideAB: 80,
    sideBC: 80,
    sideCD: 80,
    sideDA: 80,
    diagonalBD: 113.1, // matches standard diagonal of 80x80 square
  });

  const [unit, setUnit] = useState<MeasuringUnit>('feet');
  const [sharesCount, setSharesCount] = useState<number>(4);
  const [records, setRecords] = useState<CalculationRecord[]>([]);

  // Derive calculation method automatically:
  // If diagonalBD is entered and > 0, we calculate via Exact Triangular method, else Village Average.
  const method: CalculationMethod = (dimensions.diagonalBD && dimensions.diagonalBD > 0) ? 'triangular' : 'average';

  // Modals
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isSarvguniyaReportOpen, setIsSarvguniyaReportOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [sarvguniyaData, setSarvguniyaData] = useState<any>(null);

  // Mobile Bottom Navigation Tabs ('calculator' | 'division' | 'history')
  const [currentTab, setCurrentTab] = useState<'calculator' | 'division' | 'history'>('calculator');

  // Active page tool switcher ('standard' | 'sarvguniya')
  const [activeTool, setActiveTool] = useState<'standard' | 'sarvguniya'>('standard');

  // Load records from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('bhumi_records');
    if (stored) {
      try {
        setRecords(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse bhumi_records', e);
      }
    }
  }, []);

  // Compute Area Values
  const getCalculatedAreaInUnit = (): number => {
    if (method === 'average') {
      return calculateAverageArea(dimensions);
    }
    const tri = calculateTriangularArea(dimensions);
    // Fallback to average method if triangular calculation returns 0 due to invalid math inputs
    return tri > 0 ? tri : calculateAverageArea(dimensions);
  };

  const calculatedAreaInUnit = getCalculatedAreaInUnit();

  // Convert area back to absolute square feet
  const getAreaInSqFt = (): number => {
    if (unit === 'feet') {
      return calculatedAreaInUnit;
    }
    if (unit === 'links') {
      // 1 link = 0.66 feet, 1 sq link = 0.4356 sq ft
      return calculatedAreaInUnit * 0.4356;
    }
    if (unit === 'lattha') {
      // 1 Lattha = 6.6 feet, 1 sq lattha = 43.56 sq ft
      return calculatedAreaInUnit * 43.56;
    }
    return calculatedAreaInUnit;
  };

  const areaInSqFt = getAreaInSqFt();

  // Standard Indian local converters (factors come from src/units.ts -> LAND_UNITS)
  const biswa = areaInSqFt / SQFT_PER_BISWA;
  const bigha = areaInSqFt / SQFT_PER_BIGHA;
  const acre = areaInSqFt / SQFT_PER_ACRE;

  // --- Method integrity -------------------------------------------------------
  // The method above is only *requested*. If the diagonal cannot form real triangles,
  // getCalculatedAreaInUnit() silently returns the Village Average value, so the UI
  // must not keep claiming "Exact Triangular".
  const triangularArea = calculateTriangularArea(dimensions);
  const averageArea = calculateAverageArea(dimensions);
  const isFallback = method === 'triangular' && triangularArea <= 0;

  // A diagonal that is mathematically possible but wildly inconsistent with the four
  // sides describes a completely different plot. Flag it instead of trusting it.
  const diagonalMismatch =
    method === 'triangular' &&
    triangularArea > 0 &&
    averageArea > 0 &&
    Math.abs(triangularArea - averageArea) / averageArea > 0.25;

  // Diagonal implied by the four sides, used only for the hint text.
  const idealDiagonal = Math.hypot(
    (dimensions.sideAB + dimensions.sideCD) / 2,
    (dimensions.sideBC + dimensions.sideDA) / 2
  );

  // Record Management Actions
  const handleSaveCurrent = (name: string) => {
    const newRecord: CalculationRecord = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      name,
      unit,
      method,
      dimensions,
      areaInSqFt,
      shares: sharesCount,
    };
    const updated = [newRecord, ...records];
    setRecords(updated);
    localStorage.setItem('bhumi_records', JSON.stringify(updated));
  };

  const handleDeleteRecord = (id: string) => {
    const updated = records.filter((r) => r.id !== id);
    setRecords(updated);
    localStorage.setItem('bhumi_records', JSON.stringify(updated));
  };

  const handleClearAll = () => {
    const msg = language === 'hi' 
      ? 'क्या आप वास्तव में सभी सहेजे गए भूमि रिकॉर्ड को हटाना चाहते हैं?' 
      : 'Are you sure you want to clear all saved land calculation records?';
    if (window.confirm(msg)) {
      setRecords([]);
      localStorage.removeItem('bhumi_records');
    }
  };

  const getUnitSuffix = () => {
    if (unit === 'feet') return language === 'hi' ? 'वर्ग फीट' : 'sq ft';
    if (unit === 'links') return language === 'hi' ? 'वर्ग कड़ी' : 'sq links';
    return language === 'hi' ? 'वर्ग लाठ्ठा' : 'sq lattha';
  };

  const getUnitDisplayName = (u: MeasuringUnit) => {
    if (u === 'feet') return language === 'hi' ? 'फीट' : 'Feet';
    if (u === 'links') return language === 'hi' ? 'कड़ी' : 'Links';
    return language === 'hi' ? 'लाठ्ठा' : 'Lattha';
  };

  return (
    <div className={`min-h-screen font-sans selection:bg-brand-500/30 selection:text-brand-950 pb-20 md:pb-10 transition-colors duration-300 ${
      darkMode ? 'bg-stone-950 text-stone-100' : 'bg-stone-100 text-stone-900'
    }`}>
      {/* Top Header */}
      <Header 
        onExportPDF={() => {
          if (activeTool === 'standard') {
            setIsReportOpen(true);
          } else {
            setIsSarvguniyaReportOpen(true);
          }
        }} 
        onOpenGuide={() => setIsGuideOpen(true)} 
        language={language}
        setLanguage={setLanguage}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        t={t}
      />

      {/* Main Container Grid */}
      <main className="pt-6 px-4 md:px-10 max-w-6xl mx-auto space-y-6">
        
        {/* Tool Selector Bar (Pill control) */}
        <div className="flex justify-center">
          <div className={`p-1 rounded-xl flex gap-1 w-full max-w-md shadow-inner border transition-colors duration-300 relative ${
            darkMode ? 'bg-stone-900 border-stone-800' : 'bg-stone-200 border-stone-300'
          }`}>
            <motion.button
              onClick={() => setActiveTool('standard')}
              whileTap={{ scale: 0.95 }}
              className={`relative flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer select-none outline-none ${
                activeTool === 'standard'
                  ? 'text-white z-10'
                  : darkMode 
                    ? 'text-stone-400 hover:text-stone-200' 
                    : 'text-stone-600 hover:text-stone-800'
              }`}
            >
              {activeTool === 'standard' && (
                <motion.div
                  layoutId="activeTool"
                  className="absolute inset-0 bg-brand-600 rounded-lg shadow-sm shadow-black/10"
                  style={{ zIndex: -1 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'चतुर्भुज मापक' : 'Quadrilateral'}</span>
              </span>
            </motion.button>
            <motion.button
              onClick={() => setActiveTool('sarvguniya')}
              whileTap={{ scale: 0.95 }}
              className={`relative flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer select-none outline-none ${
                activeTool === 'sarvguniya'
                  ? 'text-white z-10'
                  : darkMode 
                    ? 'text-stone-400 hover:text-stone-200' 
                    : 'text-stone-600 hover:text-stone-800'
              }`}
            >
              {activeTool === 'sarvguniya' && (
                <motion.div
                  layoutId="activeTool"
                  className="absolute inset-0 bg-brand-600 rounded-lg shadow-sm shadow-black/10"
                  style={{ zIndex: -1 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-1.5">
                <Ruler className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'सर्वगुनिया मापक' : 'Sarvguniya Scaler'}</span>
              </span>
            </motion.button>
          </div>
        </div>

        {/* Unit Selector Bar (Pill control) */}
        {activeTool === 'standard' && (
          <div className="flex justify-center">
            <div className={`p-1 rounded-xl flex gap-1 w-full max-w-md shadow-inner border transition-colors duration-300 relative ${
              darkMode ? 'bg-stone-900 border-stone-800' : 'bg-stone-200 border-stone-300'
            }`}>
              {(['feet', 'links', 'lattha'] as MeasuringUnit[]).map((u) => (
                <motion.button
                  key={u}
                  onClick={() => setUnit(u)}
                  whileTap={{ scale: 0.95 }}
                  className={`relative flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer select-none outline-none ${
                    unit === u
                      ? 'text-white z-10'
                      : darkMode 
                        ? 'text-stone-400 hover:text-stone-200' 
                        : 'text-stone-600 hover:text-stone-800'
                  }`}
                >
                  {unit === u && (
                    <motion.div
                      layoutId="activeUnit"
                      className="absolute inset-0 bg-brand-600 rounded-lg shadow-sm shadow-black/10"
                      style={{ zIndex: -1 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{getUnitDisplayName(u)}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Desktop Dual-Column Columns Layout (md+) */}
        <div className={`${activeTool === 'standard' ? 'hidden md:grid' : 'hidden'} grid-cols-12 gap-6 items-start`}>
          {/* Left Column: Input and drawing (7 cols) */}
          <div className="col-span-7 space-y-6">
            <PlotCanvas
              dimensions={dimensions}
              unit={unit}
              onDimensionsChanged={setDimensions}
              darkMode={darkMode}
              t={t}
            />
            <DimensionsForm
              dimensions={dimensions}
              unit={unit}
              onDimensionsChanged={setDimensions}
              darkMode={darkMode}
              language={language}
              t={t}
              diagonalMismatch={diagonalMismatch}
              idealDiagonal={idealDiagonal}
            />
            <MethodAccordion
              method={method}
              dimensions={dimensions}
              unit={unit}
              darkMode={darkMode}
              language={language}
              t={t}
              isFallback={isFallback}
            />
          </div>

          {/* Right Column: Calculations & persistence (5 cols) */}
          <div className="col-span-5 space-y-6">
            {/* Primary Calculations Output */}
            <div className="bg-brand-800 p-6 rounded-2xl text-white shadow-sm shadow-brand-950/20 flex flex-col items-center justify-center relative overflow-hidden border border-brand-700/60">
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-gold-500/0 via-gold-400 to-gold-500/0"></div>
              <div className="absolute -top-16 -right-10 w-40 h-40 bg-brand-400/10 rounded-full blur-2xl"></div>
              <span className="text-[9.5px] font-semibold text-brand-200 uppercase tracking-[0.2em] mb-2 text-center">
                {t.totalCalculatedArea}
              </span>
              <div className="flex items-baseline gap-2 justify-center">
                <span className="text-[2.6rem] leading-none font-serif font-medium tracking-tight tabular-nums">
                  {calculatedAreaInUnit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[11px] font-semibold text-gold-300 uppercase tracking-[0.14em]">{getUnitSuffix()}</span>
              </div>

              {/* Converted absolute Square Feet display */}
              {unit !== 'feet' && (
                <p className="text-[11px] text-brand-200 mt-2 font-mono">
                  ≈ {areaInSqFt.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} sq ft
                </p>
              )}

              <div className="mt-5 w-full bg-white/10 h-[3px] rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-gold-400/70 to-gold-200/70 h-full w-full"></div>
              </div>
            </div>

            {/* Indian local subdivisions conversions */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl border text-center space-y-0.5 transition-colors duration-300 ${
                darkMode ? 'bg-brand-500/10 border-brand-500/10' : 'bg-brand-50 border-brand-200/80'
              }`}>
                <span className="text-[10px] font-bold text-brand-900 dark:text-brand-400 uppercase tracking-widest block">{t.biswa}</span>
                <span className="text-2xl font-bold font-mono text-brand-950 dark:text-brand-300">{biswa.toFixed(2)}</span>
                <span className={`text-[9px] font-medium block ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}>{t.northUPRegion}</span>
              </div>
              <div className={`p-4 rounded-xl border text-center space-y-0.5 transition-colors duration-300 ${
                darkMode ? 'bg-brand-500/10 border-brand-500/10' : 'bg-brand-50 border-brand-200/80'
              }`}>
                <span className="text-[10px] font-bold text-brand-900 dark:text-brand-400 uppercase tracking-widest block">{t.bigha}</span>
                <span className="text-2xl font-bold font-mono text-brand-950 dark:text-brand-300">{bigha.toFixed(2)}</span>
                <span className={`text-[9px] font-medium block ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}>{t.standardRevenue}</span>
              </div>
              <div className={`p-3.5 rounded-xl border text-center space-y-0.5 col-span-2 flex items-center justify-between px-6 transition-colors duration-300 ${
                darkMode ? 'bg-brand-500/10 border-brand-500/10' : 'bg-brand-50 border-brand-200/80'
              }`}>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? 'text-brand-400' : 'text-brand-900'}`}>{t.acre}</span>
                <span className={`text-lg font-bold font-mono ${darkMode ? 'text-brand-300' : 'text-brand-950'}`}>{acre.toFixed(3)}</span>
              </div>
            </div>

            {/* Partition share calculations */}
            <SplitShares
              sharesCount={sharesCount}
              areaInUnit={calculatedAreaInUnit}
              activeUnitLabel={getUnitSuffix()}
              onSharesChanged={setSharesCount}
              darkMode={darkMode}
              t={t}
            />

            {/* History Logs */}
            <HistoryList
              records={records}
              onSaveCurrent={handleSaveCurrent}
              onDeleteRecord={handleDeleteRecord}
              onClearAll={handleClearAll}
              darkMode={darkMode}
              t={t}
            />

            {/* Atmospheric illustration */}
            <div className={`rounded-2xl overflow-hidden h-44 relative border shadow-sm transition-colors duration-300 ${
              darkMode ? 'border-stone-800' : 'border-stone-200'
            }`}>
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAz-FFHiAPkCyMjGQzG6LVzdx0DlgKaM-tz-xI3BSZ8F1V37HX3KyCy4HWZWCDE9Ao2iwJCFWwnpw7S0sP0ROnKq10RV0J9tOzaBCcoXSKs_QDeKd_PMa52JkPB2m5Ujks2FrynbEkWL9K70_nfcCOJ12ZRo--XqmbGB2Cnr4AeyXgIPn12BXMFuErMxVUIaReaDZSOirxmBuiNmtF5xJxnof6jJM3XhXQAgDZia3DOnitRfmy-Y-dWJx1J-zftWFEjPPNHOQP-568"
                alt="Agricultural fields"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/10 to-transparent flex items-end p-4">
                <p className="text-white text-xs font-medium italic leading-snug">
                  {t.precisionQuote}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-Friendly Stacked Layout (Hidden on md+) */}
        <div className={`${activeTool === 'standard' ? 'block md:hidden' : 'hidden'}`}>
          <AnimatePresence mode="wait">
            {currentTab === 'calculator' && (
              <motion.div
                key="calculator"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.18, ease: "easeInOut" }}
                className="space-y-5"
              >
                <PlotCanvas
                  dimensions={dimensions}
                  unit={unit}
                  onDimensionsChanged={setDimensions}
                  darkMode={darkMode}
                  t={t}
                />

                <DimensionsForm
                  dimensions={dimensions}
                  unit={unit}
                  onDimensionsChanged={setDimensions}
                  darkMode={darkMode}
                  language={language}
                  t={t}
                  diagonalMismatch={diagonalMismatch}
                  idealDiagonal={idealDiagonal}
                />

                <MethodAccordion
                  method={method}
                  dimensions={dimensions}
                  unit={unit}
                  darkMode={darkMode}
                  language={language}
                  t={t}
                  isFallback={isFallback}
                />

                {/* Mobile Primary Result Box */}
                <div className="bg-brand-800 p-5 rounded-2xl text-white flex flex-col items-center justify-center relative overflow-hidden border border-brand-700/60">
                  <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-gold-500/0 via-gold-400 to-gold-500/0"></div>
                  <span className="text-[9px] font-semibold text-brand-200 uppercase tracking-[0.2em] mb-2 text-center">
                    {t.totalCalculatedArea}
                  </span>
                  <div className="flex items-baseline gap-2 justify-center">
                    <span className="text-[2rem] leading-none font-serif font-medium tabular-nums">
                      {calculatedAreaInUnit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-gold-300 tracking-[0.12em]">{getUnitSuffix()}</span>
                  </div>
                  {unit !== 'feet' && (
                    <p className="text-[10px] text-brand-200 font-mono mt-1.5">
                      ≈ {areaInSqFt.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} sq ft
                    </p>
                  )}
                </div>

                {/* Mobile conversions */}
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-3 rounded-xl border text-center transition-colors duration-300 ${
                    darkMode ? 'bg-brand-500/10 border-brand-500/10' : 'bg-brand-50 border-brand-200/80'
                  }`}>
                    <span className="text-[9px] font-bold text-brand-900 dark:text-brand-400 uppercase block">{t.biswa}</span>
                    <span className="text-lg font-bold font-mono text-brand-950 dark:text-brand-300">{biswa.toFixed(2)}</span>
                  </div>
                  <div className={`p-3 rounded-xl border text-center transition-colors duration-300 ${
                    darkMode ? 'bg-brand-500/10 border-brand-500/10' : 'bg-brand-50 border-brand-200/80'
                  }`}>
                    <span className="text-[9px] font-bold text-brand-900 dark:text-brand-400 uppercase block">{t.bigha}</span>
                    <span className="text-lg font-bold font-mono text-brand-950 dark:text-brand-300">{bigha.toFixed(2)}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {currentTab === 'division' && (
              <motion.div
                key="division"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.18, ease: "easeInOut" }}
                className="space-y-5"
              >
                <div className="bg-brand-800 p-5 rounded-2xl text-white flex flex-col items-center justify-center relative overflow-hidden border border-brand-700/60">
                  <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-gold-500/0 via-gold-400 to-gold-500/0"></div>
                  <span className="text-[9px] font-semibold text-brand-200 uppercase tracking-[0.2em] mb-2">
                    {t.totalCalculatedArea}
                  </span>
                  <div className="flex items-baseline gap-2 justify-center">
                    <span className="text-[2rem] leading-none font-serif font-medium tabular-nums">
                      {calculatedAreaInUnit.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-gold-300 tracking-[0.12em]">{getUnitSuffix()}</span>
                  </div>
                </div>

                <SplitShares
                  sharesCount={sharesCount}
                  areaInUnit={calculatedAreaInUnit}
                  activeUnitLabel={getUnitSuffix()}
                  onSharesChanged={setSharesCount}
                  darkMode={darkMode}
                  t={t}
                />

                {/* Atmospheric illustration */}
                <div className={`rounded-2xl overflow-hidden h-36 relative border transition-colors duration-300 ${
                  darkMode ? 'border-stone-800' : 'border-stone-200'
                }`}>
                  <img
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAz-FFHiAPkCyMjGQzG6LVzdx0DlgKaM-tz-xI3BSZ8F1V37HX3KyCy4HWZWCDE9Ao2iwJCFWwnpw7S0sP0ROnKq10RV0J9tOzaBCcoXSKs_QDeKd_PMa52JkPB2m5Ujks2FrynbEkWL9K70_nfcCOJ12ZRo--XqmbGB2Cnr4AeyXgIPn12BXMFuErMxVUIaReaDZSOirxmBuiNmtF5xJxnof6jJM3XhXQAgDZia3DOnitRfmy-Y-dWJx1J-zftWFEjPPNHOQP-568"
                    alt="Agricultural fields"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 to-transparent flex items-end p-4">
                    <p className="text-white text-xs font-medium italic leading-snug">
                      {t.precisionQuote}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {currentTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.18, ease: "easeInOut" }}
                className="space-y-5"
              >
                <HistoryList
                  records={records}
                  onSaveCurrent={handleSaveCurrent}
                  onDeleteRecord={handleDeleteRecord}
                  onClearAll={handleClearAll}
                  darkMode={darkMode}
                  t={t}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sarvguniya Measurer Component */}
        <div className={activeTool === 'sarvguniya' ? 'block' : 'hidden'}>
          <SarvguniyaMeasurer 
            darkMode={darkMode} 
            language={language} 
            onDataChange={setSarvguniyaData} 
          />
        </div>
      </main>

      {/* Mobile Bottom Navigation Sticky Bar (Hidden on desktop md+) */}
      {activeTool === 'standard' && (
        <nav className={`fixed bottom-0 left-0 w-full z-45 flex justify-around items-center py-2.5 pb-safe border-t shadow-2xl md:hidden transition-colors duration-300 ${
          darkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'
        }`}>
          <motion.button
            onClick={() => setCurrentTab('calculator')}
            whileTap={{ scale: 0.9 }}
            className={`relative flex flex-col items-center justify-center py-1 transition-all flex-1 cursor-pointer select-none outline-none ${
              currentTab === 'calculator' 
                ? 'text-brand-600 font-extrabold' 
                : darkMode ? 'text-stone-400 hover:text-stone-200' : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            {currentTab === 'calculator' && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute -top-2.5 h-1 w-12 bg-brand-600 rounded-b-full"
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              />
            )}
            <Calculator className="w-5 h-5 mb-0.5 relative z-10" />
            <span className="text-[10px] tracking-wider font-bold relative z-10">{t.calculatorTab}</span>
          </motion.button>

          <motion.button
            onClick={() => setCurrentTab('division')}
            whileTap={{ scale: 0.9 }}
            className={`relative flex flex-col items-center justify-center py-1 transition-all flex-1 cursor-pointer select-none outline-none ${
              currentTab === 'division' 
                ? 'text-brand-600 font-extrabold' 
                : darkMode ? 'text-stone-400 hover:text-stone-200' : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            {currentTab === 'division' && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute -top-2.5 h-1 w-12 bg-brand-600 rounded-b-full"
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              />
            )}
            <Users className="w-5 h-5 mb-0.5 relative z-10" />
            <span className="text-[10px] tracking-wider font-bold relative z-10">{t.divisionTab}</span>
          </motion.button>

          <motion.button
            onClick={() => setCurrentTab('history')}
            whileTap={{ scale: 0.9 }}
            className={`relative flex flex-col items-center justify-center py-1 transition-all flex-1 cursor-pointer select-none outline-none ${
              currentTab === 'history' 
                ? 'text-brand-600 font-extrabold' 
                : darkMode ? 'text-stone-400 hover:text-stone-200' : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            {currentTab === 'history' && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute -top-2.5 h-1 w-12 bg-brand-600 rounded-b-full"
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              />
            )}
            <History className="w-5 h-5 mb-0.5 relative z-10" />
            <span className="text-[10px] tracking-wider font-bold relative z-10">{t.historyTab}</span>
          </motion.button>
        </nav>
      )}

      {/* 5. Report / PDF Certificate Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        dimensions={dimensions}
        unit={unit}
        method={method}
        areaInSqFt={areaInSqFt}
        calculatedAreaInUnit={calculatedAreaInUnit}
        sharesCount={sharesCount}
        darkMode={darkMode}
        language={language}
        t={t}
      />

      {/* Sarvguniya Specific PDF Certificate Modal */}
      <SarvguniyaReportModal
        isOpen={isSarvguniyaReportOpen}
        onClose={() => setIsSarvguniyaReportOpen(false)}
        data={sarvguniyaData}
        darkMode={darkMode}
        language={language}
      />

      {/* 6. Formula & Bilingual Guide Modal */}
      <GuideModal 
        isOpen={isGuideOpen} 
        onClose={() => setIsGuideOpen(false)} 
        darkMode={darkMode}
        language={language}
        t={t}
      />
    </div>
  );
}
