/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Map, FileText, Info, Sun, Moon, Compass } from 'lucide-react';
import { Language } from '../locales';

interface HeaderProps {
  onExportPDF: () => void;
  onOpenGuide: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  t: any;
}

export default function Header({
  onExportPDF,
  onOpenGuide,
  language,
  setLanguage,
  darkMode,
  setDarkMode,
  t,
}: HeaderProps) {
  return (
    <header className={`sticky top-0 w-full z-40 border-b backdrop-blur-md transition-colors duration-300 ${
      darkMode 
        ? 'bg-stone-950/90 border-stone-850/80 text-stone-100' 
        : 'bg-stone-50/90 border-stone-200/80 text-stone-900'
    }`}>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold-400/45 to-transparent"></div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 h-16 sm:h-20 flex justify-between items-center gap-2">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Logo Badge */}
          <div className="relative shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-brand-800 dark:bg-brand-700 ring-1 ring-gold-400/35 flex items-center justify-center text-stone-50">
              <Map className="w-5 h-5 text-gold-200" />
            </div>
            {/* Compass Overlay Indicator */}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-stone-50 dark:bg-stone-850 border border-gold-400/40 rounded-full flex items-center justify-center text-gold-600 dark:text-gold-400">
              <Compass className="w-2.5 h-2.5" />
            </div>
          </div>

          {/* Title & Subtitle */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl md:text-[1.45rem] font-serif font-medium tracking-tight text-stone-900 dark:text-stone-50 leading-tight py-1 truncate">
                {t.title}
              </h1>
              {/* Premium v2.5 Badge */}
              <span className="hidden sm:inline-flex text-[8px] sm:text-[9px] bg-gold-500/10 dark:bg-gold-400/10 text-gold-700 dark:text-gold-300 px-2 py-0.5 rounded-full font-semibold border border-gold-500/25 dark:border-gold-400/25 tracking-[0.12em] uppercase shrink-0 items-center gap-1">
                v2.5
              </span>
            </div>
            <p className="hidden sm:block text-[10px] md:text-[11px] text-stone-500 dark:text-stone-400 font-medium tracking-wide truncate mt-1">
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3 shrink-0">
          {/* Single-Button Language Toggle (Saves huge horizontal space on mobile) */}
          <motion.button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border font-bold text-xs flex items-center justify-center transition-all cursor-pointer select-none ${
              darkMode 
                ? 'bg-stone-900 border-stone-800 text-stone-200 hover:bg-stone-850' 
                : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
            }`}
            title={language === 'en' ? "हिन्दी में बदलें" : "Switch to English"}
          >
            <span className={language === 'hi' ? 'font-sans' : 'font-serif tracking-wider font-extrabold'}>
              {language === 'en' ? 'हि' : 'EN'}
            </span>
          </motion.button>

          {/* Dark Mode Toggle Button */}
          <motion.button
            onClick={() => setDarkMode(!darkMode)}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
              darkMode 
                ? 'bg-stone-900 border-stone-800 text-brand-400 hover:bg-stone-850' 
                : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun className="w-4 h-4 sm:w-[18px] sm:h-[18px]" /> : <Moon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />}
          </motion.button>

          {/* Guide Button */}
          <motion.button
            onClick={onOpenGuide}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            className={`h-9 sm:h-10 px-3 rounded-xl border transition-all flex items-center gap-1.5 text-[10px] sm:text-xs font-bold cursor-pointer ${
              darkMode
                ? 'bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-850'
                : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
            }`}
            title="Formula Guide"
          >
            <Info className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-brand-500 shrink-0" />
            <span className="hidden sm:inline">{t.guide}</span>
          </motion.button>

          {/* Export PDF Button */}
          <motion.button
            onClick={onExportPDF}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            className="relative group h-9 sm:h-10 bg-brand-700 hover:bg-brand-800 dark:bg-brand-600 dark:hover:bg-brand-700 text-white px-3 sm:px-4 rounded-xl font-semibold text-[10px] sm:text-xs tracking-wide transition-colors flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0"
            title={t.pdfReport}
          >
            <FileText className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-brand-100 shrink-0" />
            <span className="hidden sm:inline">{t.pdfReport}</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
}

