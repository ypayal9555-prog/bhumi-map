/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Point, DimensionValues, MeasuringUnit } from '../types';
import { getDistance, getCoordinatesFromDimensions, isPlottable } from '../geometryUtils';
import { RotateCcw, HelpCircle, Move, X } from 'lucide-react';

interface PlotCanvasProps {
  dimensions: DimensionValues;
  unit: MeasuringUnit;
  onDimensionsChanged: (dims: DimensionValues) => void;
  darkMode: boolean;
  t: any;
}

export default function PlotCanvas({ dimensions, unit, onDimensionsChanged, darkMode, t }: PlotCanvasProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [draggingPointId, setDraggingPointId] = useState<string | null>(null);
  const [showHelper, setShowHelper] = useState<boolean>(true);

  // Automatically hide the helper guide notice after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHelper(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Re-generate coordinates whenever dimensions change from external inputs
  useEffect(() => {
    if (!draggingPointId) {
      const coords = getCoordinatesFromDimensions(dimensions, 400, 300);
      setPoints(coords);
    }
  }, [dimensions, draggingPointId]);

  // Handle pointer down (mouse or touch)
  const handlePointerDown = (pointId: string, e: React.PointerEvent) => {
    e.preventDefault();
    setDraggingPointId(pointId);
    if (svgRef.current) {
      svgRef.current.setPointerCapture(e.pointerId);
    }
  };

  // Handle pointer move with viewbox scaling correction
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingPointId || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    
    // Scale standard screen pixels to the 400x300 SVG ViewBox coordinates
    const viewboxX = (e.clientX - rect.left) * (400 / rect.width);
    const viewboxY = (e.clientY - rect.top) * (300 / rect.height);

    const x = Math.max(15, Math.min(viewboxX, 385));
    const y = Math.max(15, Math.min(viewboxY, 285));

    // Update the dragged point coordinate in local state
    const updatedPoints = points.map((p) => (p.id === draggingPointId ? { ...p, x, y } : p));
    setPoints(updatedPoints);

    // Calculate dynamic scaling from current pixel geometry and current dimensions
    const pA = updatedPoints.find((p) => p.id === 'A')!;
    const pB = updatedPoints.find((p) => p.id === 'B')!;
    const pC = updatedPoints.find((p) => p.id === 'C')!;
    const pD = updatedPoints.find((p) => p.id === 'D')!;

    const pixAB = getDistance(pA, pB);
    const pixBC = getDistance(pB, pC);
    const pixCD = getDistance(pC, pD);
    const pixDA = getDistance(pD, pA);
    const pixBD = getDistance(pB, pD);

    // Estimate scale based on previous sum of dimensions, or default to 2.0 pixels/unit if not defined
    const currentTypedSum =
      (dimensions.sideAB || 80) +
      (dimensions.sideBC || 80) +
      (dimensions.sideCD || 80) +
      (dimensions.sideDA || 80);
    const currentPixelSum = pixAB + pixBC + pixCD + pixDA;

    const scale = currentTypedSum > 0 ? currentPixelSum / currentTypedSum : 2.0;

    // Report back calculated dimensions rounded to 1 decimal place
    onDimensionsChanged({
      sideAB: parseFloat((pixAB / scale).toFixed(1)),
      sideBC: parseFloat((pixBC / scale).toFixed(1)),
      sideCD: parseFloat((pixCD / scale).toFixed(1)),
      sideDA: parseFloat((pixDA / scale).toFixed(1)),
      diagonalBD: parseFloat((pixBD / scale).toFixed(1)),
    });
  };

  // Handle pointer up
  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingPointId) {
      setDraggingPointId(null);
      if (svgRef.current) {
        svgRef.current.releasePointerCapture(e.pointerId);
      }
    }
  };

  // Reset to ideal layout
  const handleReset = () => {
    onDimensionsChanged({
      sideAB: 80,
      sideBC: 80,
      sideCD: 80,
      sideDA: 80,
      diagonalBD: 113.1, // standard diagonal for 80x80 square
    });
  };

  const getUnitSuffix = () => {
    if (unit === 'links') return t.shortLinks;
    if (unit === 'lattha') return t.shortLattha;
    return t.shortFeet;
  };

  const pA = points.find((p) => p.id === 'A');
  const pB = points.find((p) => p.id === 'B');
  const pC = points.find((p) => p.id === 'C');
  const pD = points.find((p) => p.id === 'D');

  // Side midpoints for length labels
  const getMidpoint = (pt1: Point | undefined, pt2: Point | undefined) => {
    if (!pt1 || !pt2) return { x: 0, y: 0 };
    return { x: (pt1.x + pt2.x) / 2, y: (pt1.y + pt2.y) / 2 };
  };

  const midAB = getMidpoint(pA, pB);
  const midBC = getMidpoint(pB, pC);
  const midCD = getMidpoint(pC, pD);
  const midDA = getMidpoint(pD, pA);
  const midBD = getMidpoint(pB, pD);

  const suffix = getUnitSuffix();

  // If the numbers cannot form a closed quadrilateral, drawing a placeholder outline
  // would show a shape that has nothing to do with the typed values. Show an
  // explanation instead.
  const drawable = isPlottable(dimensions);

  return (
    <div className={`border rounded-2xl overflow-hidden shadow-sm flex flex-col relative group transition-colors duration-300 ${
      darkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'
    }`}>
      {/* Top Controls */}
      <div className={`px-4 py-3 border-b flex items-center justify-between transition-colors ${
        darkMode ? 'bg-stone-800/50 border-stone-800 text-stone-100' : 'bg-stone-50 border-stone-100 text-stone-700'
      }`}>
        <div className="flex items-center gap-1.5">
          <Move className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-bold tracking-wide uppercase">{t.visualizerTitle}</span>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => setShowHelper(!showHelper)}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            className={`transition-colors p-1 rounded hover:bg-stone-200 dark:hover:bg-stone-700 cursor-pointer ${
              darkMode ? 'text-stone-400 hover:text-stone-100' : 'text-stone-500 hover:text-stone-800'
            }`}
            title="Show Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </motion.button>
          <motion.button
            onClick={handleReset}
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.02 }}
            className={`transition-colors p-1 rounded hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center gap-1 text-xs font-semibold cursor-pointer ${
              darkMode ? 'text-stone-400 hover:text-stone-100' : 'text-stone-500 hover:text-stone-800'
            }`}
            title="Reset to square"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.reset}</span>
          </motion.button>
        </div>
      </div>

      {/* Helper notice placed inline, outside of the aspect ratio container so it never overlaps the shape */}
      <AnimatePresence>
        {showHelper && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className={`border-b text-xs leading-relaxed overflow-hidden relative ${
              darkMode 
                ? 'bg-amber-950/20 border-stone-800 text-amber-200' 
                : 'bg-amber-500/5 border-stone-100 text-amber-900'
            }`}
          >
            <div className="p-3.5">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-0.5">
                  <p className={`font-semibold ${darkMode ? 'text-amber-400' : 'text-amber-950'}`}>{t.visualizerHelpTitle}</p>
                  <p className={darkMode ? 'text-stone-400' : 'text-stone-600'}>{t.visualizerHelpBody}</p>
                </div>
                <motion.button
                  onClick={() => setShowHelper(false)}
                  whileTap={{ scale: 0.9 }}
                  className={`p-1 rounded hover:bg-stone-200/50 dark:hover:bg-stone-800/50 cursor-pointer text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors shrink-0`}
                  title="Close guide"
                >
                  <X className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Canvas */}
      <div className={`relative aspect-[4/3] flex-1 ${darkMode ? 'bg-stone-950' : 'bg-stone-50/50'}`}>
        <div className={`absolute inset-0 pointer-events-none transition-opacity ${
          darkMode ? 'canvas-grid-dark opacity-100' : 'canvas-grid opacity-30'
        }`}></div>

        <svg
          ref={svgRef}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="absolute inset-0 w-full h-full drop-shadow-sm select-none"
          viewBox="0 0 400 300"
        >
          {drawable && pA && pB && pC && pD && (
            <>
              {/* Outer Polygon Shade */}
              <polygon
                points={`${pA.x},${pA.y} ${pB.x},${pB.y} ${pC.x},${pC.y} ${pD.x},${pD.y}`}
                fill={darkMode ? "rgba(245, 158, 11, 0.08)" : "rgba(245, 158, 11, 0.04)"}
                stroke="#d97706"
                strokeWidth="2.5"
                strokeLinejoin="round"
                className="transition-all duration-150"
              />

              {/* Diagonal Line */}
              <line
                x1={pB.x}
                y1={pB.y}
                x2={pD.x}
                y2={pD.y}
                stroke={darkMode ? "#78716c" : "#6b7280"}
                strokeWidth="1.5"
                strokeDasharray="4 4"
                className="opacity-60"
              />

              {/* Length Labels along the Edges */}
              {/* Side AB */}
              <g transform={`translate(${midAB.x}, ${midAB.y - 8})`}>
                <rect x="-24" y="-10" width="48" height="16" rx="4" fill={darkMode ? "#292524" : "white"} stroke={darkMode ? "#44403c" : "#e5e7eb"} strokeWidth="1" />
                <text fill={darkMode ? "#f5f5f4" : "#1f2937"} fontSize="10" fontWeight="bold" textAnchor="middle" y="2" fontFamily="monospace">
                  {dimensions.sideAB}
                  {suffix}
                </text>
              </g>

              {/* Side BC */}
              <g transform={`translate(${midBC.x + 12}, ${midBC.y})`}>
                <rect x="-24" y="-10" width="48" height="16" rx="4" fill={darkMode ? "#292524" : "white"} stroke={darkMode ? "#44403c" : "#e5e7eb"} strokeWidth="1" />
                <text fill={darkMode ? "#f5f5f4" : "#1f2937"} fontSize="10" fontWeight="bold" textAnchor="middle" y="2" fontFamily="monospace">
                  {dimensions.sideBC}
                  {suffix}
                </text>
              </g>

              {/* Side CD */}
              <g transform={`translate(${midCD.x}, ${midCD.y + 12})`}>
                <rect x="-24" y="-10" width="48" height="16" rx="4" fill={darkMode ? "#292524" : "white"} stroke={darkMode ? "#44403c" : "#e5e7eb"} strokeWidth="1" />
                <text fill={darkMode ? "#f5f5f4" : "#1f2937"} fontSize="10" fontWeight="bold" textAnchor="middle" y="2" fontFamily="monospace">
                  {dimensions.sideCD}
                  {suffix}
                </text>
              </g>

              {/* Side DA */}
              <g transform={`translate(${midDA.x - 24}, ${midDA.y})`}>
                <rect x="-24" y="-10" width="48" height="16" rx="4" fill={darkMode ? "#292524" : "white"} stroke={darkMode ? "#44403c" : "#e5e7eb"} strokeWidth="1" />
                <text fill={darkMode ? "#f5f5f4" : "#1f2937"} fontSize="10" fontWeight="bold" textAnchor="middle" y="2" fontFamily="monospace">
                  {dimensions.sideDA}
                  {suffix}
                </text>
              </g>

              {/* Diagonal BD */}
              {dimensions.diagonalBD > 0 && (
                <g transform={`translate(${midBD.x}, ${midBD.y})`}>
                  <rect x="-30" y="-10" width="60" height="16" rx="4" fill={darkMode ? "#451a03" : "#fef3c7"} stroke={darkMode ? "#78350f" : "#fcd34d"} strokeWidth="1" />
                  <text fill={darkMode ? "#fde047" : "#b45309"} fontSize="9" fontWeight="bold" textAnchor="middle" y="2" fontFamily="monospace">
                    {t.diagShort} {dimensions.diagonalBD}
                    {suffix}
                  </text>
                </g>
              )}

              {/* Draggable Point Handles */}
              {[pA, pB, pC, pD].map((pt) => (
                <g
                  key={pt.id}
                  className="cursor-move group/handle select-none"
                  onPointerDown={(e) => handlePointerDown(pt.id, e)}
                >
                  {/* Glowing touch target */}
                  <circle cx={pt.x} cy={pt.y} r="16" fill="transparent" className="hover:fill-amber-500/10 transition-colors" />
                  {/* Center Dot */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="7"
                    fill="#d97706"
                    stroke={darkMode ? "#292524" : "#ffffff"}
                    strokeWidth="2"
                    className="group-hover/handle:scale-125 transition-transform shadow-md"
                  />
                  {/* Point Label */}
                  <text
                    x={pt.x + (pt.id === 'A' || pt.id === 'D' ? -15 : 15)}
                    y={pt.y + (pt.id === 'A' || pt.id === 'B' ? -12 : 15)}
                    fill={darkMode ? "#f5f5f4" : "#1c1917"}
                    fontSize="13"
                    fontWeight="800"
                    textAnchor="middle"
                    className="font-sans select-none"
                  >
                    {pt.label}
                  </text>
                </g>
              ))}
            </>
          )}
        </svg>

        {/* Cannot-draw state: replaces the plot instead of showing a placeholder shape */}
        {!drawable && (
          <div
            className={`absolute inset-0 flex items-center justify-center p-6 ${
              darkMode ? 'bg-stone-950/90' : 'bg-white/90'
            }`}
          >
            <div className="text-center max-w-[260px]">
              <div className="mx-auto mb-2 w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-600">
                <X className="w-5 h-5" />
              </div>
              <p className={`text-sm font-bold mb-1 ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>
                {t.cannotDrawTitle}
              </p>
              <p className={`text-[11px] leading-relaxed ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                {t.cannotDrawBody}
              </p>
            </div>
          </div>
        )}

        {/* Live Geometry Badge */}
        <div className={`absolute bottom-4 right-4 backdrop-blur-md px-3 py-1.5 rounded-full border shadow-sm flex items-center gap-2 transition-colors ${
          darkMode ? 'bg-stone-900/90 border-stone-800' : 'bg-white/90 border-stone-200'
        }`}>
          <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${drawable ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          <span className={`text-[11px] font-bold uppercase tracking-wider ${darkMode ? 'text-stone-300' : 'text-stone-700'}`}>{t.liveGeometry}</span>
        </div>
      </div>
    </div>
  );
}
