/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useId } from 'react';

/**
 * Decorative plot illustration used in the empty/history side panels.
 *
 * Drawn as inline SVG rather than loaded from a CDN: the app must not make any
 * network request, and shipping a third-party stock photo would drag its licence
 * into this repo. The shape echoes PlotCanvas — an aerial quadrilateral, its
 * diagonal, and brass corner markers — so the empty state still reads as
 * "land measurement".
 */
export default function FieldBanner({ className = '' }: { className?: string }) {
  const raw = useId();
  const uid = raw.replace(/[^a-zA-Z0-9_-]/g, '');

  const centre = { x: 440, y: 160 };
  const plot: Array<[number, number]> = [
    [258, 84],
    [628, 56],
    [688, 238],
    [198, 268],
  ];

  /** Push a polygon outward from its centre; used to draw the survey rings. */
  const ring = (k: number) =>
    plot
      .map(([x, y]) => `${(centre.x + (x - centre.x) * k).toFixed(1)},${(centre.y + (y - centre.y) * k).toFixed(1)}`)
      .join(' ');

  const points = ring(1);
  const [a, b, c, d] = plot;

  return (
    <svg
      className={className}
      viewBox="0 0 800 320"
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`sky-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#041c15" />
          <stop offset="62%" stopColor="#073024" />
          <stop offset="100%" stopColor="#0a4b37" />
        </linearGradient>
        <radialGradient id={`glow-${uid}`} cx="78%" cy="18%" r="58%">
          <stop offset="0%" stopColor="#dcc79a" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#dcc79a" stopOpacity="0" />
        </radialGradient>
        <pattern id={`grid-${uid}`} width="26" height="26" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="#c8a96c" fillOpacity="0.18" />
        </pattern>
      </defs>

      <rect width="800" height="320" fill={`url(#sky-${uid})`} />
      <rect width="800" height="320" fill={`url(#grid-${uid})`} />
      <rect width="800" height="320" fill={`url(#glow-${uid})`} />

      {/* Survey rings — the plot extrapolated outward, like contour lines */}
      {[1.28, 1.17, 1.09].map((k, i) => (
        <polygon
          key={k}
          points={ring(k)}
          fill="none"
          stroke="#c8a96c"
          strokeWidth="1"
          strokeOpacity={0.13 + i * 0.06}
          vectorEffect="non-scaling-stroke"
        />
      ))}

      {/* The measured plot */}
      <polygon
        points={points}
        fill="#c8a96c"
        fillOpacity="0.06"
        stroke="#dcc79a"
        strokeOpacity="0.62"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />

      {/* Diagonal, as drawn in the live canvas */}
      <line
        x1={b[0]}
        y1={b[1]}
        x2={d[0]}
        y2={d[1]}
        stroke="#dcc79a"
        strokeOpacity="0.38"
        strokeWidth="1.2"
        strokeDasharray="6 5"
        vectorEffect="non-scaling-stroke"
      />

      {/* Corner markers */}
      {plot.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="9" fill="#c8a96c" fillOpacity="0.16" />
          <circle cx={x} cy={y} r="3.6" fill="#eadcb8" />
        </g>
      ))}

      {/* Edge ticks, suggesting a measuring chain */}
      {[
        [a, b],
        [b, c],
      ].map(([from, to], i) => {
        const ticks = [0.25, 0.5, 0.75].map((t) => ({
          x: from[0] + (to[0] - from[0]) * t,
          y: from[1] + (to[1] - from[1]) * t,
        }));
        return ticks.map((p, j) => (
          <rect
            key={`${i}-${j}`}
            x={p.x - 0.75}
            y={p.y - 0.75}
            width="1.5"
            height="1.5"
            fill="#eadcb8"
            fillOpacity="0.5"
          />
        ));
      })}

      {/* Bottom shade so the overlaid quote keeps its contrast */}
      <rect x="0" y="178" width="800" height="142" fill="#041c15" fillOpacity="0.45" />
    </svg>
  );
}
