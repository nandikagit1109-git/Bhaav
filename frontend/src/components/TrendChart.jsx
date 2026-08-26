import { useMemo } from "react";

/**
 * TrendChart — A clean, colored trend line showing deviation over sessions.
 */

export default function TrendChart({ sessions }) {
  const { points, pathD, areaD, gradientId } = useMemo(() => {
    if (!sessions.length) return { points: [], pathD: "", areaD: "", gradientId: "tcg" };

    const values = sessions.map((s) => {
      const f = s.features;
      const avg = (f.words_per_minute + f.pause_frequency * 10 + f.backspace_rate * 10 + f.avg_inter_keystroke_interval / 10 + f.typing_speed_variance) / 5;
      return avg;
    });

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const std = Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length) || 1;
    const normalized = values.map((v) => (v - mean) / std);

    const w = 700, h = 180, pad = 40, innerW = w - pad * 2, innerH = h - 60;
    const maxAbs = Math.max(...normalized.map(Math.abs), 1);
    const midY = 100;

    const pts = normalized.map((v, i) => ({
      x: pad + (i / Math.max(normalized.length - 1, 1)) * innerW,
      y: midY - (v / maxAbs) * (innerH / 2.5),
      value: v,
    }));

    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const cp1x = pts[i - 1].x + (pts[i].x - pts[i - 1].x) * 0.4;
      const cp2x = pts[i].x - (pts[i].x - pts[i - 1].x) * 0.4;
      d += ` C ${cp1x},${pts[i - 1].y} ${cp2x},${pts[i].y} ${pts[i].x},${pts[i].y}`;
    }

    const area = d + ` L ${pts[pts.length - 1].x},${midY + innerH / 2} L ${pts[0].x},${midY + innerH / 2} Z`;

    return { points: pts, pathD: d, areaD: area, gradientId: "tcg" };
  }, [sessions]);

  if (!points.length) return null;

  return (
    <svg viewBox="0 0 700 180" className="w-full h-auto">
      <defs>
        <linearGradient id={`${gradientId}-area`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(43,58,103,0.05)" />
          <stop offset="100%" stopColor="rgba(43,58,103,0)" />
        </linearGradient>
        <linearGradient id={`${gradientId}-line`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#B0AAA2" />
          <stop offset="30%" stopColor="#2B3A67" />
          <stop offset="60%" stopColor="#4A7FB5" />
          <stop offset="100%" stopColor="#B5533C" />
        </linearGradient>
      </defs>
      {/* Grid */}
      <line x1="30" y1="60" x2="670" y2="60" stroke="#E5E0D8" strokeWidth="0.5" />
      <line x1="30" y1="100" x2="670" y2="100" stroke="#E5E0D8" strokeWidth="0.5" />
      <line x1="30" y1="140" x2="670" y2="140" stroke="#E5E0D8" strokeWidth="0.5" />
      <text x="8" y="63" fill="#D5D0C8" fontSize="8" fontFamily="JetBrains Mono, monospace">+2σ</text>
      <text x="8" y="103" fill="#D5D0C8" fontSize="8" fontFamily="JetBrains Mono, monospace">0</text>
      <text x="8" y="143" fill="#D5D0C8" fontSize="8" fontFamily="JetBrains Mono, monospace">-2σ</text>
      {/* Area */}
      <path d={areaD} fill={`url(#${gradientId}-area)`} />
      {/* Line */}
      <path d={pathD} fill="none" stroke={`url(#${gradientId}-line)`} strokeWidth="2" strokeLinecap="round" />
      {/* Points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 ? 4 : 2.5}
          fill={Math.abs(p.value) > 2 ? "#B5533C" : i === points.length - 1 ? "#4A7FB5" : "#2B3A67"} />
      ))}
    </svg>
  );
}
