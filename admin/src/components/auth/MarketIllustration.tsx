/**
 * Line-art market stall in the spirit of the Figma login illustration:
 * awning, pole, produce crates with price tags, plants and outline clouds — ink on lime.
 */
export function MarketIllustration({ className }: { className?: string }) {
  const ink = '#15171A'
  const paper = '#E5EFF5'
  const crate = '#C9D6DD'
  const shade = '#2A9AD8'
  return (
    <svg viewBox="0 0 840 620" className={className} role="img" aria-label="A farmer’s produce stall under a market umbrella">
      {/* Clouds */}
      <g fill="none" stroke={ink} strokeWidth="2" strokeLinecap="round">
        <path d="M20 250 h150 a22 22 0 0 0 -28 -26 a34 34 0 0 0 -62 -8 a26 26 0 0 0 -44 20 a18 18 0 0 0 -16 14 z" />
        <path d="M560 240 h130 a18 18 0 0 0 -22 -20 a28 28 0 0 0 -52 -6 a22 22 0 0 0 -38 16 a14 14 0 0 0 -18 10 z" />
        <path d="M390 270 h92 a14 14 0 0 0 -16 -14 a20 20 0 0 0 -38 -4 a16 16 0 0 0 -30 12 z" opacity="0.6" />
      </g>

      {/* Background hills */}
      <path d="M120 520 C200 470 260 480 330 500 C420 440 520 450 600 500 C660 470 720 480 780 520 Z" fill={shade} opacity="0.7" />

      {/* Umbrella */}
      <path d="M140 150 L420 70 L700 150 Z" fill={ink} />
      <rect x="140" y="150" width="560" height="22" fill={paper} stroke={ink} strokeWidth="2" />
      <path
        d={Array.from({ length: 20 }, (_, i) => `M${140 + i * 28} 172 q14 18 28 0`).join(' ')}
        fill={paper}
        stroke={ink}
        strokeWidth="2"
      />
      <rect x="415" y="172" width="10" height="398" fill={ink} />

      {/* Crates — back row */}
      <g stroke={ink} strokeWidth="2">
        <rect x="180" y="398" width="160" height="70" fill={crate} />
        <rect x="340" y="398" width="160" height="70" fill={crate} />
        <rect x="500" y="398" width="160" height="70" fill={crate} />
        {[410, 425, 440, 455].map((y) => (
          <line key={y} x1="180" y1={y} x2="660" y2={y} strokeWidth="1" opacity="0.5" />
        ))}
      </g>
      {/* Produce — back row */}
      <g stroke={ink} strokeWidth="1.5">
        {Array.from({ length: 9 }, (_, i) => (
          <circle key={`o${i}`} cx={196 + i * 16} cy={392} r={11} fill="#F59E0B" />
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <ellipse key={`g${i}`} cx={358 + i * 18} cy={390} rx={10} ry={13} fill="#65A30D" />
        ))}
        {Array.from({ length: 9 }, (_, i) => (
          <path key={`c${i}`} d={`M${512 + i * 16} 400 l6 -26 l6 26 z`} fill="#EA580C" />
        ))}
      </g>

      {/* Crates — front row */}
      <g stroke={ink} strokeWidth="2">
        <rect x="160" y="488" width="170" height="82" fill={crate} />
        <rect x="330" y="488" width="170" height="82" fill={crate} />
        <rect x="500" y="488" width="170" height="82" fill={crate} />
        {[503, 520, 537, 554].map((y) => (
          <line key={y} x1="160" y1={y} x2="670" y2={y} strokeWidth="1" opacity="0.5" />
        ))}
      </g>
      <g stroke={ink} strokeWidth="1.5">
        {Array.from({ length: 10 }, (_, i) => (
          <ellipse key={`p${i}`} cx={176 + i * 16} cy={482} rx={10} ry={8} fill="#A3A36B" />
        ))}
        {Array.from({ length: 7 }, (_, i) => (
          <path key={`b${i}`} d={`M${346 + i * 22} 486 q10 -22 22 -6`} fill="none" stroke="#EAB308" strokeWidth="6" strokeLinecap="round" />
        ))}
        {Array.from({ length: 9 }, (_, i) => (
          <circle key={`l${i}`} cx={516 + i * 17} cy={480} r={10} fill="#16A34A" />
        ))}
      </g>

      {/* Price tags */}
      {[
        [210, 360, '₹29'],
        [440, 355, '₹34'],
        [520, 362, '₹42'],
        [215, 456, '₹18'],
        [395, 452, '₹25'],
        [600, 452, '₹31'],
      ].map(([x, y, t]) => (
        <g key={String(t) + x} transform={`translate(${x} ${y}) rotate(-6)`}>
          <rect x="0" y="0" width="48" height="30" fill={paper} stroke={ink} strokeWidth="2" />
          <text x="24" y="21" textAnchor="middle" fontSize="15" fontWeight="700" fill={ink} fontFamily="Inter, sans-serif">
            {t}
          </text>
        </g>
      ))}

      {/* Scale on the counter */}
      <g stroke={ink} strokeWidth="2" fill={paper}>
        <rect x="590" y="340" width="60" height="30" />
        <rect x="580" y="330" width="80" height="10" fill={ink} />
      </g>

      {/* Plants */}
      <g fill={ink}>
        <rect x="60" y="500" width="54" height="70" rx="4" fill={paper} stroke={ink} strokeWidth="2" />
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx={72 + i * 10} cy={522} r="4" />
        ))}
        <path d="M86 500 C60 440 30 430 40 400 C70 420 84 450 86 500 Z" />
        <path d="M88 500 C100 440 130 420 140 390 C150 430 110 460 90 500 Z" />
        <path d="M87 500 C80 450 84 420 95 380 C108 420 100 460 89 500 Z" />
        <path d="M740 500 q-30 60 0 70 h20 q30 -10 0 -70 z" fill={paper} stroke={ink} strokeWidth="2" />
        <path d="M750 500 C730 440 700 420 712 380 C740 410 752 450 752 500 Z" />
        <path d="M752 500 C770 440 800 430 806 396 C820 440 780 470 754 500 Z" />
        <path d="M751 500 C748 450 752 410 760 360 C774 410 764 460 753 500 Z" />
      </g>

      {/* Ground */}
      <line x1="40" y1="570" x2="800" y2="570" stroke={ink} strokeWidth="2" />
    </svg>
  )
}
