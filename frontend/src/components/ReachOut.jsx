/**
 * ReachOut — Gentle nudge to contact someone you trust.
 * Opens pre-drafted message in default messaging app. Never auto-sends.
 */

export default function ReachOut({ contact, onDismiss }) {
  const handleMessage = () => {
    const msg = encodeURIComponent("Hey, just checking in. How are you doing?");
    if (contact.type === "phone") {
      window.open(`sms:${contact.value}?body=${msg}`, "_blank");
    } else {
      window.open(`mailto:${contact.value}?body=${msg}`, "_blank");
    }
  };

  return (
    <div className="rounded-2xl p-6 flex items-start gap-5" style={{ background: "#FAF7F2", border: "1px solid #E5E0D8", borderLeft: "3px solid #C17B3A" }}>
      <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(193,123,58,0.08)", fontSize: "1.2rem" }}>
        🤝
      </div>
      <div className="flex-1">
        <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 300, fontStyle: "italic", fontSize: "0.95rem", color: "#1C1B1A", marginBottom: "0.5rem" }}>
          Might be worth reaching out to {contact.name}.
        </p>
        <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: "0.75rem", color: "#7A756E", marginBottom: "0.75rem" }}>
          Your pattern has been different for a few days. Sometimes a quick message to someone who cares can help.
        </p>
        <div className="flex gap-3">
          <button onClick={handleMessage} className="px-5 py-2.5 rounded-full cursor-pointer transition-all" style={{ background: "linear-gradient(135deg, #C17B3A, #B5533C)", color: "#FAF7F2", border: "none", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: 400, letterSpacing: "0.1em" }}>
            Message {contact.name}
          </button>
          <button onClick={onDismiss} className="px-5 py-2.5 rounded-full cursor-pointer transition-all" style={{ background: "transparent", color: "#D5D0C8", border: "none", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem" }}>
            not now
          </button>
        </div>
      </div>
    </div>
  );
}
