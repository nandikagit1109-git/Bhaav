import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { getPreferences, updatePreferences, saveContact, getContact } from "../services/api";

/**
 * Settings — Support level, trusted contact, and disclaimers.
 */

const LEVELS = [
  { id: 1, label: "Just awareness", icon: "👁" },
  { id: 2, label: "Insights", icon: "💡" },
  { id: 3, label: "Connect", icon: "🤝" },
  { id: 4, label: "Companion", icon: "💬" },
];

export default function Settings({ userId, supportLevel, onBack, onUpdated }) {
  const [level, setLevel] = useState(supportLevel);
  const [contact, setContact] = useState({ name: "", value: "", type: "phone" });
  const [saved, setSaved] = useState(false);
  const [contactSaved, setContactSaved] = useState(false);

  useEffect(() => {
    getContact(userId).then((r) => {
      if (r.contact) setContact(r.contact);
    }).catch(() => {});
  }, [userId]);

  const saveLevel = async (newLevel) => {
    setLevel(newLevel);
    try {
      await updatePreferences(userId, { support_level: newLevel });
      onUpdated({ support_level: newLevel });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
  };

  const saveContactInfo = async () => {
    if (!contact.name || !contact.value) return;
    try {
      await saveContact(userId, contact);
      setContactSaved(true);
      setTimeout(() => setContactSaved(false), 2000);
    } catch {}
  };

  return (
    <motion.div
      className="min-h-screen px-5 md:px-16 py-12"
      style={{ background: "#F6F3EE" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <button onClick={onBack} className="cursor-pointer" style={{ background: "none", border: "none", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "#7A756E" }}>
            ← Back
          </button>
          <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 300, fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "#1C1B1A" }}>
            Settings
          </h1>
        </div>

        {/* Support Level */}
        <section className="mb-12">
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: "#B0AAA2", marginBottom: "1rem" }}>
            Support level
          </p>
          <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: "0.8rem", color: "#7A756E", marginBottom: "1.25rem" }}>
            You can change this anytime — there's no wrong choice.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {LEVELS.map((l) => (
              <button
                key={l.id}
                onClick={() => saveLevel(l.id)}
                className="rounded-2xl p-5 text-left cursor-pointer transition-all"
                style={{
                  background: level === l.id ? "rgba(43,58,103,0.04)" : "#FAF7F2",
                  border: `2px solid ${level === l.id ? "#2B3A67" : "#E5E0D8"}`,
                }}
              >
                <span style={{ fontSize: "1.3rem", display: "block", marginBottom: "0.5rem" }}>{l.icon}</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", fontWeight: level === l.id ? 500 : 400, color: level === l.id ? "#2B3A67" : "#7A756E" }}>
                  {l.label}
                </span>
              </button>
            ))}
          </div>
          {saved && (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "#1A7A6D", marginTop: "0.75rem" }}>
              ✓ Saved
            </p>
          )}
        </section>

        {/* Trusted Contact */}
        {level >= 3 && (
          <section className="mb-12">
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: "#B0AAA2", marginBottom: "1rem" }}>
              Trusted contact
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: "0.8rem", color: "#7A756E", marginBottom: "1.25rem" }}>
              Someone you trust — Bhaav will gently suggest reaching out when your pattern shifts.
            </p>
            <div className="flex flex-col gap-3">
              <input
                value={contact.name}
                onChange={(e) => setContact({ ...contact, name: e.target.value })}
                placeholder="Their name"
                className="rounded-xl px-5 py-3 outline-none"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: "0.85rem", background: "#FAF7F2", border: "1px solid #E5E0D8", color: "#3D3A36" }}
              />
              <input
                value={contact.value}
                onChange={(e) => setContact({ ...contact, value: e.target.value })}
                placeholder="Phone or email"
                className="rounded-xl px-5 py-3 outline-none"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: "0.85rem", background: "#FAF7F2", border: "1px solid #E5E0D8", color: "#3D3A36" }}
              />
              <div className="flex gap-3">
                {["phone", "email"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setContact({ ...contact, type: t })}
                    className="px-5 py-2.5 rounded-full cursor-pointer transition-all"
                    style={{
                      fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: 400, letterSpacing: "0.1em", textTransform: "uppercase",
                      color: contact.type === t ? "#FAF7F2" : "#7A756E",
                      background: contact.type === t ? "#2B3A67" : "transparent",
                      border: contact.type === t ? "none" : "1px solid #E5E0D8",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <button
                onClick={saveContactInfo}
                disabled={!contact.name || !contact.value}
                className="px-6 py-3 rounded-full cursor-pointer transition-all self-start"
                style={{
                  fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: 400, letterSpacing: "0.15em", textTransform: "uppercase",
                  color: contact.name && contact.value ? "#FAF7F2" : "#D5D0C8",
                  background: contact.name && contact.value ? "#2B3A67" : "#E5E0D8",
                  border: "none",
                }}
              >
                Save contact
              </button>
              {contactSaved && (
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "#1A7A6D" }}>
                  ✓ Contact saved
                </p>
              )}
            </div>
          </section>
        )}

        {/* Disclaimer */}
        <section>
          <div className="rounded-xl p-4" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", background: "linear-gradient(135deg, rgba(43,58,103,0.03), rgba(26,122,109,0.03))", border: "1px solid rgba(43,58,103,0.08)", lineHeight: 1.8, color: "#7A756E" }}>
            Bhaav is a self-awareness tool, not a therapist, counselor, or medical professional. Deviation scores reflect change from your own baseline — never a judgment or diagnosis. If you're struggling, please reach out to someone real.
          </div>
        </section>
      </div>
    </motion.div>
  );
}
