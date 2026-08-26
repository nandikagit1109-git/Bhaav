/**
 * Insight — The weekly insight with optional suggestion (gated by support level).
 */

export default function Insight({ insight, supportLevel }) {
  if (!insight) return null;

  return (
    <div>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: "#B0AAA2", marginBottom: "1rem" }}>
        This week
      </p>
      <div className="rounded-2xl p-6 md:p-8 mb-5" style={{ borderLeft: "3px solid #7B6FA0", background: "#FAF7F2", border: "1px solid #E5E0D8", borderLeftWidth: "3px", borderLeftColor: "#7B6FA0" }}>
        <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 300, fontStyle: "italic", fontSize: "clamp(0.95rem, 1.8vw, 1.15rem)", lineHeight: 1.65, color: "#1C1B1A" }}>
          "{insight.observation}"
        </p>
      </div>

      {supportLevel >= 2 && insight.suggestion && (
        <div className="rounded-2xl p-6 md:p-8" style={{ background: "#F6F3EE", border: "1px solid #E5E0D8" }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: "#B0AAA2", marginBottom: "0.75rem" }}>
            Try this
          </p>
          <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: "0.85rem", color: "#7A756E", lineHeight: 1.7 }}>
            {insight.suggestion}
          </p>
          {insight.followup_check && (
            <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: "0.75rem", color: "#B0AAA2", marginTop: "0.75rem", fontStyle: "italic" }}>
              Next week: {insight.followup_check}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
