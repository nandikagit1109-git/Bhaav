/**
 * DeviationDisplay — Shows per-feature deviation as colored bars.
 */

const FEATURES = [
  { key: "backspace_rate", label: "Corrections", color: "#C17B3A" },
  { key: "words_per_minute", label: "Typing speed", color: "#2B3A67" },
  { key: "pause_frequency", label: "Pauses", color: "#1A7A6D" },
  { key: "avg_inter_keystroke_interval", label: "Key interval", color: "#4A7FB5" },
  { key: "typing_speed_variance", label: "Speed variance", color: "#7B6FA0" },
];

export default function DeviationDisplay({ deviation }) {
  if (!deviation?.per_feature) return null;

  const maxScore = Math.max(...Object.values(deviation.per_feature).map(Math.abs), 3);

  return (
    <div>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", color: "#B0AAA2", marginBottom: "1.25rem" }}>
        Feature deviation
      </p>
      <div className="flex flex-col gap-4">
        {FEATURES.map((f) => {
          const score = deviation.per_feature[f.key] || 0;
          const width = Math.min(Math.abs(score) / maxScore * 100, 100);
          return (
            <div key={f.key} className="flex items-center gap-3">
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", fontWeight: 400, color: "#3D3A36", minWidth: "100px" }}>
                {f.label}
              </p>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#E5E0D8" }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${width}%`, background: f.color }} />
              </div>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: f.color, minWidth: "50px", textAlign: "right" }}>
                {score > 0 ? "+" : ""}{score.toFixed(2)}σ
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
