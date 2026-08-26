/**
 * Privacy — The quiet reassurance section.
 */

export default function Privacy() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14">
      <div>
        <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 300, fontSize: "clamp(1.5rem, 3.5vw, 2.5rem)", lineHeight: 1.1, background: "linear-gradient(135deg, #1C1B1A, #2B3A67)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: "0.5rem" }}>
          We read your rhythm.
        </p>
        <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 300, fontSize: "clamp(1.5rem, 3.5vw, 2.5rem)", lineHeight: 1.1, color: "#E5E0D8" }}>
          Not your words.
        </p>
      </div>
      <div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: "0.85rem", color: "#3D3A36", lineHeight: 1.8, marginBottom: "1.25rem" }}>
          Bhaav observes typing behavior — timing between keystrokes, frequency of pauses, correction patterns — to build a personal behavioral baseline.
        </p>
        <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: "0.85rem", color: "#7A756E", lineHeight: 1.8, marginBottom: "1.25rem" }}>
          Your actual writing never leaves your device for analysis. The system understands <em>how</em> you type, not <em>what</em> you type.
        </p>
        <div className="rounded-xl p-4" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", background: "linear-gradient(135deg, rgba(43,58,103,0.03), rgba(26,122,109,0.03))", border: "1px solid rgba(43,58,103,0.08)", lineHeight: 1.8, color: "#7A756E" }}>
          This is a self-awareness tool, not a clinical diagnostic. Deviation scores reflect change from your own baseline — never a judgment.
        </div>
      </div>
    </div>
  );
}
