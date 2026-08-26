/**
 * WeatherDisplay — Weather metaphor for deviation.
 * Calm / Breezy / Overcast / Rainy / Stormy
 */

const WEATHER = {
  calm: { icon: "☀️", label: "Calm", color: "#1A7A6D", desc: "Your rhythm is steady and familiar." },
  breezy: { icon: "🌤", label: "Breezy", color: "#4A7FB5", desc: "A gentle shift — nothing worrying." },
  overcast: { icon: "☁️", label: "Overcast", color: "#C17B3A", desc: "Things feel a little heavier than usual." },
  rainy: { icon: "🌧", label: "Rainy", color: "#7B6FA0", desc: "Some noticeable changes in your pattern." },
  stormy: { icon: "⛈", label: "Stormy", color: "#B5533C", desc: "Your rhythm is quite different from normal." },
};

export default function WeatherDisplay({ weather, deviation }) {
  const w = WEATHER[weather] || WEATHER.calm;
  return (
    <div className="rounded-2xl p-6 flex items-center gap-5" style={{ borderLeft: `3px solid ${w.color}`, background: "#FAF7F2", border: "1px solid #E5E0D8", borderLeftWidth: "3px", borderLeftColor: w.color }}>
      <div className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: `${w.color}10`, fontSize: "1.8rem" }}>
        {w.icon}
      </div>
      <div>
        <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400, fontSize: "1.1rem", color: w.color, marginBottom: "0.15rem" }}>
          {w.label}
        </p>
        <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: "0.8rem", color: "#7A756E" }}>
          {w.desc}
        </p>
        {deviation != null && (
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: w.color, marginTop: "0.3rem" }}>
            deviation: {deviation.toFixed(2)}
          </p>
        )}
      </div>
    </div>
  );
}
