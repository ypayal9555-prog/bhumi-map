/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { getCoordinatesFromDimensions } from '../geometryUtils';
import { Info, Compass, Ruler, HelpCircle } from 'lucide-react';

interface GuniyaRulerVisualizerProps {
  instrument: string;
  scale: '1/4000' | '16inch' | '32inch';
  darkMode: boolean;
  language: 'hi' | 'en';
}

export function GuniyaRulerVisualizer({
  instrument,
  scale,
  darkMode,
  language,
}: GuniyaRulerVisualizerProps) {
  const [reading, setReading] = useState<number>(15);

  const getInstrumentInfo = () => {
    switch (instrument) {
      case 'meterGuniya':
        return {
          name: language === 'hi' ? 'मीटर गुनिया (Meter Guniya)' : 'Meter Guniya',
          desc: language === 'hi' ? '1 खाना = 4 मीटर वास्तविक ज़मीन दूरी' : '1 division = 4 meters ground distance',
          unit: language === 'hi' ? 'खाने (divisions)' : 'divisions',
          max: 50,
          calc: (r: number) => {
            const m = r * 4;
            return {
              m: m,
              ft: m * 3.28084,
              kadi: m / 0.201168,
            };
          },
        };
      case 'kadiGuniya25':
        return {
          name: language === 'hi' ? 'कड़ी गुनिया - 25 ज़ीरो (Kadi Guniya)' : 'Kadi Guniya (25 Zero)',
          desc: scale === '32inch'
            ? (language === 'hi' ? '1 खाना = 10 कड़ी' : '1 division = 10 links')
            : (language === 'hi' ? '1 खाना = 20 कड़ी (प्रत्येक खंड = 100 कड़ी)' : '1 division = 20 links (each segment = 100 links)'),
          unit: language === 'hi' ? 'खाने (divisions)' : 'divisions',
          max: 50,
          calc: (r: number) => {
            const kadi = scale === '32inch' ? r * 10 : r * 20;
            const m = kadi * 0.201168;
            return {
              m: m,
              ft: m * 3.28084,
              kadi: kadi,
            };
          },
        };
      case 'kadiGuniya20':
        return {
          name: language === 'hi' ? 'कड़ी गुनिया - 20 ज़ीरो (Kadi Guniya)' : 'Kadi Guniya (20 Zero)',
          desc: scale === '32inch'
            ? (language === 'hi' ? '1 खाना = 12.5 कड़ी' : '1 division = 12.5 links')
            : (language === 'hi' ? '1 खाना = 25 कड़ी (प्रत्येक खंड = 100 कड़ी)' : '1 division = 25 links (each segment = 100 links)'),
          unit: language === 'hi' ? 'खाने (divisions)' : 'divisions',
          max: 40,
          calc: (r: number) => {
            const kadi = scale === '32inch' ? r * 12.5 : r * 25;
            const m = kadi * 0.201168;
            return {
              m: m,
              ft: m * 3.28084,
              kadi: kadi,
            };
          },
        };
      case 'kadiGuniya50':
        return {
          name: language === 'hi' ? 'कड़ी गुनिया - 50 ज़ीरो (Kadi Guniya)' : 'Kadi Guniya (50 Zero)',
          desc: language === 'hi' ? '1 खाना = 10 कड़ी (प्रत्येक खंड = 100 कड़ी)' : '1 division = 10 links (each segment = 100 links)',
          unit: language === 'hi' ? 'खाने (divisions)' : 'divisions',
          max: 100,
          calc: (r: number) => {
            const kadi = r * 10;
            const m = kadi * 0.201168;
            return {
              m: m,
              ft: m * 3.28084,
              kadi: kadi,
            };
          },
        };
      case 'plasticScaleCm':
        return {
          name: language === 'hi' ? 'प्लास्टिक पैमाना (Plastic Ruler - cm)' : 'Plastic Ruler (cm)',
          desc: scale === '1/4000'
            ? (language === 'hi' ? '1 सेमी = 40 मीटर ज़मीन (1:4000 स्केल)' : '1 cm = 40 meters ground (1:4000)')
            : scale === '32inch'
              ? (language === 'hi' ? '1 सेमी = 98.425 कड़ी (19.8 मीटर ज़मीन)' : '1 cm = 98.425 links (19.8m ground)')
              : (language === 'hi' ? '1 सेमी = 196.85 कड़ी (39.6 मीटर ज़मीन)' : '1 cm = 196.85 links (39.6m ground)'),
          unit: 'cm',
          max: 15,
          calc: (r: number) => {
            const ratio = scale === '1/4000' ? 40 : scale === '32inch' ? (98.425 * 0.201168) : 39.6;
            const m = r * ratio;
            return {
              m: m,
              ft: m * 3.28084,
              kadi: m / 0.201168,
            };
          },
        };
      case 'plasticScaleMm':
        return {
          name: language === 'hi' ? 'प्लास्टिक पैमाना (Plastic Ruler - mm)' : 'Plastic Ruler (mm)',
          desc: scale === '1/4000'
            ? (language === 'hi' ? '1 मिमी = 4 मीटर ज़मीन (1:4000 स्केल)' : '1 mm = 4 meters ground (1:4000)')
            : scale === '32inch'
              ? (language === 'hi' ? '1 मिमी = 9.8425 कड़ी (1.98 मीटर ज़मीन)' : '1 mm = 9.8425 links (1.98m ground)')
              : (language === 'hi' ? '1 मिमी = 19.685 कड़ी (3.96 मीटर ज़मीन)' : '1 mm = 19.685 links (3.96m ground)'),
          unit: 'mm',
          max: 100,
          calc: (r: number) => {
            const ratio = scale === '1/4000' ? 4 : scale === '32inch' ? (9.8425 * 0.201168) : 3.96;
            const m = r * ratio;
            return {
              m: m,
              ft: m * 3.28084,
              kadi: m / 0.201168,
            };
          },
        };
      default:
        // Ground mode fallbacks
        return {
          name: language === 'hi' ? 'सीधा फीता मापन (Tape Measure)' : 'Ground Tape Measure',
          desc: language === 'hi' ? 'सीधे ज़मीन पर लिया गया मापन' : 'Direct measurements taken on actual ground',
          unit: instrument === 'fitaFeet' ? 'feet' : instrument === 'kadiDirect' ? 'kadi' : 'meters',
          max: 100,
          calc: (r: number) => {
            const m = instrument === 'fitaFeet' ? r * 0.3048 : instrument === 'kadiDirect' ? r * 0.201168 : r;
            return {
              m: m,
              ft: m * 3.28084,
              kadi: m / 0.201168,
            };
          },
        };
    }
  };

  const info = getInstrumentInfo();
  const results = info.calc(reading);

  // Generate ticks for drawing the Guniya / Ruler
  const ticks = [];
  const tickCount = info.max;
  for (let i = 0; i <= tickCount; i++) {
    let type = 'minor';
    if (i === 0 || i === tickCount) type = 'major-edge';
    else if (i % 10 === 0) type = 'major';
    else if (i % 5 === 0) type = 'medium';

    ticks.push({ value: i, type });
  }

  // Calculate sliding hair-line percentage
  const hairLinePct = (reading / info.max) * 100;

  return (
    <div className={`p-5 rounded-2xl border transition-all duration-300 space-y-4 ${
      darkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'
    }`}>
      {/* Title block */}
      <div className="flex items-center justify-between border-b pb-3 border-stone-250 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <Ruler className="w-4 h-4 text-brand-600" />
          <span className="text-xs font-bold uppercase tracking-wider">
            {language === 'hi' ? 'पारंपरिक सर्वगुनिया स्केल सिम्युलेटर' : 'Patwari Sarvguniya Scale Simulator'}
          </span>
        </div>
        <div className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-brand-500/10 text-brand-600 dark:text-brand-500 border border-brand-500/20">
          {scale === '1/4000' ? '1:4000' : scale === '32inch' ? '32" = 1 Mile' : '16" = 1 Mile'}
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
        {language === 'hi' 
          ? `सर्वगुनिया (गुनिया) नक्शे पर दूरी मापने का पारदर्शी छोटा स्केल होता है। नीचे दिए गए पारंपरिक पैमाने को स्लाइड करके देखें कि नक्शे के खाने ज़मीन पर कितनी दूरी में बदलते हैं:`
          : `Sarvguniya (Guniya) is a high-precision mini ruler used by Amins/Patwaris on maps. Adjust the ruler slider below to see how divisions convert to actual ground distances:`}
      </p>

      {/* Authentic Map & Ruler Visual Area */}
      <div className="relative rounded-xl overflow-hidden p-4 bg-gradient-to-b from-stone-50 to-stone-100 dark:from-stone-950 dark:to-stone-900 border border-stone-250 dark:border-stone-850 h-44 flex flex-col justify-center select-none">
        
        {/* Subtle Cadastral Map Watermark Background */}
        <div className="absolute inset-0 text-stone-600 dark:text-stone-400 opacity-[0.12] dark:opacity-[0.04] pointer-events-none flex items-center justify-center font-serif text-[10px]">
          <svg width="100%" height="100%" className="absolute inset-0">
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
            {/* Simulated Village Plot Outlines */}
            <path d="M50,30 L180,20 L150,110 L40,90 Z" fill="none" stroke="currentColor" strokeWidth="1" />
            <path d="M180,20 L320,40 L290,120 L150,110 Z" fill="none" stroke="currentColor" strokeWidth="1" />
            <path d="M150,110 L290,120 L260,170 L120,150 Z" fill="none" stroke="currentColor" strokeWidth="1" />
            <text x="90" y="65" fill="currentColor">खसरा 102</text>
            <text x="230" y="75" fill="currentColor">खसरा 103</text>
            <text x="180" y="140" fill="currentColor">खसरा 104</text>
          </svg>
        </div>

        {/* The Guniya Ruler Drawing */}
        <div className="relative mx-auto w-full max-w-[460px] h-16 bg-gradient-to-b from-brand-100/90 to-brand-200/95 dark:from-brand-950 dark:to-stone-900 border-y-2 border-x-4 border-brand-600/40 dark:border-brand-500/30 rounded-sm backdrop-blur-md shadow-lg shadow-brand-600/5 flex flex-col justify-between p-0.5 relative">
          
          {/* Glassmorphism glaze highlight line */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-white/40"></div>
          
          {/* Brass Rivets on Left and Right Ends (Traditional detail) */}
          <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-yellow-300 via-brand-500 to-brand-700 shadow-sm border border-yellow-200"></div>
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-yellow-300 via-brand-500 to-brand-700 shadow-sm border border-yellow-200"></div>

          {/* Top Ticks */}
          <div className="flex justify-between items-start px-8 h-5">
            {ticks.map((t, idx) => {
              let h = 'h-1.5';
              if (t.type === 'major-edge' || t.type === 'major') h = 'h-3.5';
              else if (t.type === 'medium') h = 'h-2.5';

              return (
                <div key={`top-${idx}`} className="flex flex-col items-center">
                  <div className={`w-[1px] bg-brand-950/80 dark:bg-brand-100 ${h}`}></div>
                  {t.type === 'major' && (
                    <span className="text-[7px] font-bold font-mono text-brand-950 dark:text-brand-200 mt-0.5">
                      {t.value}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Instrument Branding in middle */}
          <div className="text-center text-[8px] font-black tracking-widest text-brand-900 dark:text-brand-300 uppercase opacity-80">
            {info.name}
          </div>

          {/* Bottom Ticks */}
          <div className="flex justify-between items-end px-8 h-5">
            {ticks.map((t, idx) => {
              let h = 'h-1.5';
              if (t.type === 'major-edge' || t.type === 'major') h = 'h-3.5';
              else if (t.type === 'medium') h = 'h-2.5';

              return (
                <div key={`bottom-${idx}`} className="flex flex-col items-center justify-end">
                  {t.type === 'major' && (
                    <span className="text-[7px] font-bold font-mono text-brand-950 dark:text-brand-200 mb-0.5">
                      {t.value}
                    </span>
                  )}
                  <div className={`w-[1px] bg-brand-950/80 dark:bg-brand-100 ${h}`}></div>
                </div>
              );
            })}
          </div>

          {/* Hair-line Sliding Overlay indicator */}
          <div 
            className="absolute top-0 bottom-0 w-[2px] bg-red-500 dark:bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.8)] pointer-events-none transition-all duration-75"
            style={{ left: `calc(32px + (100% - 64px) * ${hairLinePct / 100})` }}
          >
            {/* Sliding hair-line glass indicator window */}
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1.5 w-3.5 h-8 border border-red-500/30 bg-red-500/10 rounded-sm"></div>
          </div>
        </div>

        {/* Real-time slider reading label */}
        <div className="text-center mt-3 font-mono text-xs font-bold text-stone-800 dark:text-stone-200">
          {language === 'hi' ? 'पाठ्यांक (Reading):' : 'Measured:'} <span className="text-brand-600 text-sm font-extrabold">{reading} {info.unit}</span>
        </div>
      </div>

      {/* Interactive slider control */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-stone-400 font-bold font-mono">
          <span>0 {info.unit}</span>
          <span>{info.max} {info.unit}</span>
        </div>
        <input
          type="range"
          min="0"
          max={info.max}
          value={reading}
          onChange={(e) => setReading(parseInt(e.target.value))}
          className="w-full h-2 bg-stone-200 dark:bg-stone-800 rounded-lg appearance-none cursor-ew-resize accent-brand-600"
        />
      </div>

      {/* Converted values display */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className={`p-2.5 rounded-xl border text-center ${
          darkMode ? 'bg-stone-950/40 border-stone-800' : 'bg-stone-50 border-stone-200'
        }`}>
          <span className={`text-[9px] font-bold uppercase tracking-wider block ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}>{language === 'hi' ? 'मीटर' : 'Meters'}</span>
          <span className={`text-sm font-extrabold font-mono ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>{results.m.toFixed(2)} m</span>
        </div>

        <div className={`p-2.5 rounded-xl border text-center ${
          darkMode ? 'bg-stone-950/40 border-stone-800' : 'bg-stone-50 border-stone-200'
        }`}>
          <span className={`text-[9px] font-bold uppercase tracking-wider block ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}>{language === 'hi' ? 'फीट' : 'Feet'}</span>
          <span className={`text-sm font-extrabold font-mono ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>{results.ft.toFixed(1)} ft</span>
        </div>

        <div className={`p-2.5 rounded-xl border text-center ${
          darkMode ? 'bg-stone-950/40 border-stone-800' : 'bg-stone-50 border-stone-200'
        }`}>
          <span className={`text-[9px] font-bold uppercase tracking-wider block ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}>{language === 'hi' ? 'कड़ी' : 'Kadi (Links)'}</span>
          <span className={`text-sm font-extrabold font-mono ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>{results.kadi.toFixed(1)} k</span>
        </div>
      </div>

      {/* Calibration note */}
      <div className="flex items-start gap-2 text-[10px] text-stone-600 dark:text-stone-400 bg-brand-500/10 dark:bg-brand-500/5 p-2.5 border border-brand-500/20 dark:border-brand-500/10 rounded-xl leading-normal">
        <Info className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
        <span>
          {info.desc}. {language === 'hi' ? 'गाँव के भू-अभिलेखों (Sajra Map) में इसी स्केल के माध्यम से रकबा निकाला जाता है।' : 'Amins use this exact scale overlay for calculating fields on maps.'}
        </span>
      </div>
    </div>
  );
}


interface SarvguniyaPlotVisualizerProps {
  sideAB: number;
  sideBC: number;
  sideCD: number;
  sideDA: number;
  results: any;
  darkMode: boolean;
  language: 'hi' | 'en';
}

export function SarvguniyaPlotVisualizer({
  sideAB,
  sideBC,
  sideCD,
  sideDA,
  results,
  darkMode,
  language,
}: SarvguniyaPlotVisualizerProps) {
  // Solve standard coordinates representing our field.
  // We estimate coordinates using dimensions converted to standard meters (results.distances values)
  const [points, setPoints] = useState<any[]>([]);

  useEffect(() => {
    if (results && results.distances) {
      const d = results.distances;
      const dims = {
        sideAB: d.BC.meters, // North (Top side)
        sideBC: d.AB.meters, // East (Right side)
        sideCD: d.DA.meters, // South (Bottom side)
        sideDA: d.CD.meters, // West (Left side)
        diagonalBD: 0, // Solves internally with estimates
      };
      const coords = getCoordinatesFromDimensions(dims, 320, 240);
      setPoints(coords);
    }
  }, [results]);

  if (!results || !results.distances || points.length < 4) return null;

  const pA = points.find((p) => p.id === 'A')!;
  const pB = points.find((p) => p.id === 'B')!;
  const pC = points.find((p) => p.id === 'C')!;
  const pD = points.find((p) => p.id === 'D')!;

  // Midpoints of sides for average formula lines drawing
  const getMidpoint = (p1: any, p2: any) => ({
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  });

  const midAB = getMidpoint(pA, pB);
  const midBC = getMidpoint(pB, pC);
  const midCD = getMidpoint(pC, pD);
  const midDA = getMidpoint(pD, pA);

  const lengthUnitLabel = language === 'hi' ? 'मीटर' : 'm';

  const renderSvgLabel = (x: number, y: number, labelText: string) => {
    const charWidth = 5.8;
    const paddingX = 8;
    const rectW = Math.max(50, labelText.length * charWidth + paddingX);
    const rectH = 15;
    return (
      <g className="select-none">
        <rect
          x={x - rectW / 2}
          y={y - rectH / 2}
          width={rectW}
          height={rectH}
          rx={3.5}
          ry={3.5}
          className="fill-stone-900/95 dark:fill-stone-850/95 stroke-stone-700/80 dark:stroke-stone-700/60 stroke-[0.75]"
        />
        <text
          x={x}
          y={y + 3.5}
          textAnchor="middle"
          className="text-[8px] font-mono font-bold fill-white dark:fill-stone-100"
        >
          {labelText}
        </text>
      </g>
    );
  };

  return (
    <div className={`p-5 rounded-2xl border transition-all duration-300 space-y-4 ${
      darkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'
    }`}>
      {/* Visualizer header */}
      <div className="flex items-center justify-between border-b pb-3 border-stone-250 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-brand-600 animate-spin-slow" />
          <span className="text-xs font-bold uppercase tracking-wider">
            {language === 'hi' ? 'भू-मानचित्र आकृति विज़ुअलाइज़र' : 'Ground Shape & Formula Outline'}
          </span>
        </div>
        <div className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase">
          {language === 'hi' ? 'विलेज अमीन विधि' : 'Village Formula'}
        </div>
      </div>

      {/* SVG Canvas depicting the plotted shape */}
      <div className="relative rounded-xl border border-stone-250 dark:border-stone-850 overflow-hidden bg-gradient-to-b from-stone-50 to-stone-100 dark:from-stone-950 dark:to-stone-900 p-4 h-[260px] flex items-center justify-center select-none">
        
        {/* Plot Details watermark paper */}
        <div className="absolute top-2.5 left-3 text-[9px] font-bold font-mono text-stone-500/90 dark:text-stone-400/80 uppercase space-y-0.5">
          <p>QUAD PLOT: ABCD</p>
          <p>LAW: PATWARI AVERAGE AXES</p>
        </div>

        <svg width="100%" height="100%" viewBox="0 0 320 240" className="w-full h-full">
          {/* Faint Gridlines */}
          <g className="stroke-stone-300 dark:stroke-stone-800 stroke-[0.5] opacity-50">
            <line x1="0" y1="40" x2="320" y2="40" />
            <line x1="0" y1="80" x2="320" y2="80" />
            <line x1="0" y1="120" x2="320" y2="120" />
            <line x1="0" y1="160" x2="320" y2="160" />
            <line x1="0" y1="200" x2="320" y2="200" />
            <line x1="40" y1="0" x2="40" y2="240" />
            <line x1="80" y1="0" x2="80" y2="240" />
            <line x1="120" y1="0" x2="120" y2="240" />
            <line x1="160" y1="0" x2="160" y2="240" />
            <line x1="200" y1="0" x2="200" y2="240" />
            <line x1="240" y1="0" x2="240" y2="240" />
            <line x1="280" y1="0" x2="280" y2="240" />
          </g>

          {/* Polygon Shade Area */}
          <polygon
            points={`${pA.x},${pA.y} ${pB.x},${pB.y} ${pC.x},${pC.y} ${pD.x},${pD.y}`}
            className="fill-brand-500/10 stroke-brand-600 dark:stroke-brand-500 stroke-2"
          />

          {/* Average length formula axes drawing (midpoint lines) */}
          {/* Average Length Axis (midBC to midDA) */}
          <line
            x1={midBC.x}
            y1={midBC.y}
            x2={midDA.x}
            y2={midDA.y}
            className="stroke-stone-500/70 dark:stroke-stone-400/60 stroke-1.5 stroke-dasharray-[4_4]"
            strokeDasharray="4,4"
          />
          {/* Average Width Axis (midAB to midCD) */}
          <line
            x1={midAB.x}
            y1={midAB.y}
            x2={midCD.x}
            y2={midCD.y}
            className="stroke-stone-500/70 dark:stroke-stone-400/60 stroke-1.5 stroke-dasharray-[4_4]"
            strokeDasharray="4,4"
          />

          {/* Vertices Corner Dots & Labels */}
          {points.map((p) => {
            let label = p.id;
            if (p.id === 'A') label = 'C'; // Top-Left Northwest is C
            if (p.id === 'B') label = 'B'; // Top-Right Northeast is B
            if (p.id === 'C') label = 'A'; // Bottom-Right Southeast is A
            if (p.id === 'D') label = 'D'; // Bottom-Left Southwest is D
            return (
              <g key={p.id}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="4.5"
                  className="fill-brand-600 dark:fill-brand-500 stroke-white dark:stroke-stone-900 stroke-2"
                />
                <text
                  x={p.id === 'A' || p.id === 'D' ? p.x - 12 : p.x + 12}
                  y={p.id === 'A' || p.id === 'B' ? p.y - 6 : p.y + 12}
                  textAnchor="middle"
                  className="text-[10px] font-extrabold fill-stone-900 dark:fill-stone-200 font-sans"
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* Midpoint labels (Averages values) */}
          <circle cx={midDA.x + (midBC.x - midDA.x) / 3} cy={midDA.y + (midBC.y - midDA.y) / 3} r="1.5" className="fill-brand-600" />
          <circle cx={midAB.x + (midCD.x - midAB.x) / 3} cy={midAB.y + (midCD.y - midAB.y) / 3} r="1.5" className="fill-brand-600" />

          {/* SVG side labels centered exactly on side lines */}
          {renderSvgLabel(midAB.x, midAB.y - 12, `BC: ${results.distances.BC.meters.toFixed(1)}${lengthUnitLabel}`)}
          {renderSvgLabel(midBC.x + 26, midBC.y, `AB: ${results.distances.AB.meters.toFixed(1)}${lengthUnitLabel}`)}
          {renderSvgLabel(midCD.x, midCD.y + 12, `DA: ${results.distances.DA.meters.toFixed(1)}${lengthUnitLabel}`)}
          {renderSvgLabel(midDA.x - 26, midDA.y, `CD: ${results.distances.CD.meters.toFixed(1)}${lengthUnitLabel}`)}
        </svg>
      </div>

      {/* Dedicated Total Calculated Area Badge (Outside Canvas to prevent overlap) */}
      <div className={`p-3.5 rounded-xl border flex items-center justify-between transition-all duration-300 ${
        darkMode ? 'bg-brand-500/5 border-brand-500/10 text-stone-300' : 'bg-brand-50/60 border-brand-500/15 text-stone-800'
      }`}>
        <div className="space-y-0.5">
          <span className="text-[9px] font-bold text-brand-600 dark:text-brand-500 uppercase tracking-widest block">
            {language === 'hi' ? 'कुल रकबा (Total Area)' : 'Total Calculated Area'}
          </span>
          <p className="text-[10px] text-stone-500 dark:text-stone-400">
            {language === 'hi' ? 'पटवारी औसत लंबाई × चौड़ाई विधि द्वारा' : 'Using standard Patwari average formula'}
          </p>
        </div>
        <div className="text-right">
          <span className="text-sm font-black font-mono text-brand-600 dark:text-brand-500 block">
            {results.area.sqF.toLocaleString(undefined, { maximumFractionDigits: 1 })} sq ft
          </span>
          <span className="text-[10px] font-bold font-mono text-stone-500 dark:text-stone-400 block">
            ≈ {results.area.sqM.toLocaleString(undefined, { maximumFractionDigits: 2 })} sq m
          </span>
        </div>
      </div>

      {/* Axis Information explaining Patwari Calculation */}
      <div className="grid grid-cols-2 gap-2 text-[10px] font-medium bg-brand-500/10 dark:bg-brand-500/5 p-3 border border-brand-500/20 dark:border-brand-500/10 rounded-xl leading-normal">
        <div>
          <span className="text-stone-500 dark:text-stone-400 font-bold uppercase block text-[8px] mb-0.5">
            {language === 'hi' ? 'औसत लंबाई (Avg Axis L)' : 'Average Length Axis'}
          </span>
          <p className="font-bold text-stone-700 dark:text-stone-300">
            (AB + CD) ÷ 2 = <span className="font-mono text-brand-600 font-black">{results.averages.lengthM.toFixed(1)} m</span>
          </p>
        </div>
        <div>
          <span className="text-stone-500 dark:text-stone-400 font-bold uppercase block text-[8px] mb-0.5">
            {language === 'hi' ? 'औसत चौड़ाई (Avg Axis W)' : 'Average Width Axis'}
          </span>
          <p className="font-bold text-stone-700 dark:text-stone-300">
            (BC + DA) ÷ 2 = <span className="font-mono text-brand-600 font-black">{results.averages.widthM.toFixed(1)} m</span>
          </p>
        </div>
      </div>
    </div>
  );
}
