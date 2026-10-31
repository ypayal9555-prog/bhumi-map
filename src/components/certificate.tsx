/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

/**
 * Paper palette for the certificates.
 *
 * Everything inside a certificate reads colour from these variables, so the
 * screen theme and the printed sheet stay independent: on screen the card
 * follows dark mode, on paper it is always cream. Printing a dark-mode
 * dashboard would otherwise dump a full page of ink.
 */
export const PAPER_LIGHT = {
  '--paper': '#FBF7EC',
  '--paper-2': '#F4EEE0',
  '--ink': '#1A1713',
  '--ink-soft': '#4E473A',
  '--ink-faint': '#8A8070',
  '--rule': '#E0D5BC',
  '--rule-strong': '#B08D4C',
  '--seal': '#0A4B37',
} as React.CSSProperties;

export const PAPER_DARK = {
  '--paper': '#17140F',
  '--paper-2': '#201C16',
  '--ink': '#F5F2E9',
  '--ink-soft': '#D4CCB9',
  '--ink-faint': '#948B77',
  '--rule': '#3A342A',
  '--rule-strong': '#C8A96C',
  '--seal': '#86BCA5',
} as React.CSSProperties;

/** Brass rule that fades out at both ends — used to separate certificate bands. */
export function Hairline({ strong = false }: { strong?: boolean }) {
  return (
    <div
      className="h-px w-full"
      style={{
        background: strong
          ? 'linear-gradient(to right, transparent, var(--rule-strong), transparent)'
          : 'linear-gradient(to right, transparent, var(--rule), transparent)',
      }}
    />
  );
}

/** Circular revenue-style stamp, drawn rather than typed so it stays crisp in print. */
export function Seal() {
  // Both report modals can be mounted in one document, and a duplicated SVG id
  // would point every seal at the first arc path. Give each instance its own.
  const arcId = `bm-seal-arc-${React.useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  return (
    <svg viewBox="0 0 96 96" className="w-[76px] h-[76px]" aria-hidden="true">
      <circle cx="48" cy="48" r="45.5" fill="none" stroke="var(--rule-strong)" strokeWidth="1.4" />
      <circle cx="48" cy="48" r="41" fill="none" stroke="var(--rule-strong)" strokeWidth="0.5" />
      <circle
        cx="48"
        cy="48"
        r="30"
        fill="none"
        stroke="var(--rule-strong)"
        strokeWidth="0.7"
        strokeDasharray="2 2.4"
      />
      {/* Text sits on a 35-unit radius arc; the string is kept short so it cannot
          run past the 180° of the top arc and collide with the inner ring. */}
      <path id={arcId} d="M 13,48 A 35,35 0 0 1 83,48" fill="none" />
      <text
        fontSize="6.8"
        letterSpacing="2"
        fontWeight="700"
        fill="var(--rule-strong)"
        fontFamily="Inter, sans-serif"
      >
        <textPath href={`#${arcId}`} startOffset="50%" textAnchor="middle">
          BHUMI MAP
        </textPath>
      </text>
      <text
        x="48"
        y="53"
        textAnchor="middle"
        fontSize="19"
        fontWeight="600"
        fill="var(--seal)"
        fontFamily="Fraunces, Georgia, serif"
      >
        भूमि
      </text>
      <rect x="36" y="59" width="24" height="0.7" fill="var(--rule-strong)" opacity="0.6" />
      <text
        x="48"
        y="68"
        textAnchor="middle"
        fontSize="5.2"
        letterSpacing="1.6"
        fill="var(--ink-faint)"
        fontFamily="Inter, sans-serif"
      >
        VERIFIED
      </text>
    </svg>
  );
}

/**
 * Brass double-rule frame with corner ornaments, drawn inside the paper card.
 *
 * On screen the rules hug the card edge; on paper the card becomes a full-bleed
 * A4 sheet and the print stylesheet pushes the whole set 6mm inward, out of the
 * dead zone most printers cannot reach. The ids carry the certificate prefix so
 * two certificates can share a document.
 */
export function CertificateFrame({ prefix }: { prefix: string }) {
  return (
    <>
      <div
        id={`${prefix}-frame-outer`}
        className="absolute inset-0 border border-[var(--rule-strong)]/70 pointer-events-none"
      />
      <div
        id={`${prefix}-frame-inner`}
        className="absolute inset-[5px] border border-[var(--rule)] pointer-events-none"
      />
      <div id={`${prefix}-frame-corners`} className="absolute inset-[10px] pointer-events-none">
        {[
          'top-0 left-0 border-t border-l',
          'top-0 right-0 border-t border-r',
          'bottom-0 left-0 border-b border-l',
          'bottom-0 right-0 border-b border-r',
        ].map((pos) => (
          <span key={pos} className={`absolute w-4 h-4 border-[var(--rule-strong)] ${pos}`} />
        ))}
      </div>
    </>
  );
}

/**
 * One print stylesheet for every certificate.
 *
 * `prefix` is the id namespace the certificate renders with: the card must be
 * `<prefix>-print-card`, its overlay `<prefix>-overlay`, the scroll shell
 * `<prefix>-shell`, the scroll area `<prefix>-print-area`, the padded column
 * `<prefix>-body`, and the frame parts `<prefix>-frame-*`. `extra` is
 * appended inside the print block for rules specific to one certificate.
 */
export function certificatePrintCss(prefix: string, extra = ''): string {
  const card = `#${prefix}-print-card`;

  return `
        @media print {
          /* The sheet is the card, edge to edge: no page margin, so the cream
             paper reaches the paper edge and the frame is positioned inside. */
          @page { size: A4 portrait; margin: 0; }

          /*
           * The dashboard behind the modal is only made invisible, not removed:
           * it still occupies its full flow height, and Chrome paginates on
           * that, emitting blank sheets after the certificate. Pinning the root
           * box to one A4 page keeps the job at a single sheet.
           */
          html, body {
            background: #fff !important;
            margin: 0 !important;
            padding: 0 !important;
            height: 297mm !important;
            overflow: hidden !important;
          }

          body { visibility: hidden; }
          ${card}, ${card} * { visibility: visible; }

          /*
           * Unwind the app shell before printing. The modal is a fixed overlay
           * with a max-height and two scroll containers; every one of those
           * clips, and clipped content is silently lost on paper instead of
           * flowing onto a second sheet.
           */
          #${prefix}-overlay {
            position: static !important;
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
            background: none !important;
            backdrop-filter: none !important;
          }
          #${prefix}-shell {
            display: block !important;
            max-height: none !important;
            height: auto !important;
            overflow: visible !important;
            max-width: none !important;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
          }
          #${prefix}-print-area {
            overflow: visible !important;
            max-height: none !important;
            padding: 0 !important;
            background: none !important;
          }

          ${card} {
            /* Overrides the inline theme variables with the paper palette. */
            --paper: #FBF7EC !important;
            --paper-2: #F4EEE0 !important;
            --ink: #1A1713 !important;
            --ink-soft: #4E473A !important;
            --ink-faint: #807665 !important;
            --rule: #DDD1B6 !important;
            --rule-strong: #A8843F !important;
            --seal: #0A4B37 !important;

            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            max-width: none !important;
            min-height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: var(--paper) !important;
            color: var(--ink) !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* 6mm keeps the frame clear of the dead zone most printers cannot
             reach; the body padding keeps the type off the frame. */
          #${prefix}-frame-outer { inset: 6mm !important; }
          #${prefix}-frame-inner { inset: calc(6mm + 5px) !important; }
          #${prefix}-frame-corners { inset: calc(6mm + 10px) !important; }

          /* On screen the body carries the modal's padding; on paper it carries
             the sheet's own margins instead. 8mm/9mm leaves 726px of type width
             on a 794px sheet — the width the layout was measured at. */
          #${prefix}-body { padding: 8mm 9mm !important; }

          ${card} svg { display: block !important; visibility: visible !important; }

          .no-print, button { display: none !important; }

          /* Keep drawings and tables whole on the sheet. */
          ${card} table, ${card} svg { break-inside: avoid; }

          ${extra}
        }
      `;
}
