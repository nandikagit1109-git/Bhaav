import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { chat } from "../services/api";

/**
 * Companion — A warm AI chat companion. NOT a therapist.
 */

export default function Companion({ userId, onBack }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hey, I'm here if you want to talk. Not a therapist — just someone to listen. What's on your mind?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await chat(userId, newMessages);
      setMessages([...newMessages, { role: "assistant", content: res.reply }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "I'm having a moment — could you try again?" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col"
      style={{ background: "#F6F3EE" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <header className="px-5 md:px-16 py-5 flex items-center gap-4" style={{ borderBottom: "1px solid #E5E0D8" }}>
        <button onClick={onBack} className="cursor-pointer" style={{ background: "none", border: "none", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "#7A756E" }}>
          ← Back
        </button>
        <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 300, fontSize: "1rem", background: "linear-gradient(135deg, #2B3A67, #1A7A6D)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
          Companion
        </span>
      </header>

      {/* Disclaimer */}
      <div className="px-5 md:px-16 py-3 text-center" style={{ background: "rgba(43,58,103,0.03)" }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: "0.7rem", color: "#B0AAA2" }}>
          Bhaav is a companion, not a therapist — if you're struggling, please also talk to a real person. 💛
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 md:px-16 py-6">
        <div className="max-w-2xl mx-auto flex flex-col gap-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[80%] rounded-2xl px-5 py-3" style={{
                background: m.role === "user" ? "#2B3A67" : "#FAF7F2",
                color: m.role === "user" ? "#FAF7F2" : "#3D3A36",
                border: m.role === "user" ? "none" : "1px solid #E5E0D8",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 300,
                fontSize: "0.85rem",
                lineHeight: 1.65,
                fontStyle: m.role === "assistant" ? "normal" : "normal",
              }}>
                {m.role === "assistant" ? (
                  <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic" }}>{m.content}</span>
                ) : m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl px-5 py-3" style={{ background: "#FAF7F2", border: "1px solid #E5E0D8" }}>
                <span className="inline-flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: "#B0AAA2", animation: `pulse-warm 1.4s ease-in-out ${i * 0.2}s infinite` }} />
                  ))}
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="px-5 md:px-16 py-4" style={{ borderTop: "1px solid #E5E0D8" }}>
        <div className="max-w-2xl mx-auto flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Say something..."
            className="flex-1 rounded-full px-5 py-3 outline-none"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: "0.85rem", background: "#FAF7F2", border: "1px solid #E5E0D8", color: "#3D3A36" }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="px-6 py-3 rounded-full cursor-pointer transition-all"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.7rem",
              fontWeight: 400,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: input.trim() && !loading ? "#FAF7F2" : "#D5D0C8",
              background: input.trim() && !loading ? "#2B3A67" : "#E5E0D8",
              border: "none",
            }}
          >
            Send
          </button>
        </div>
      </div>
    </motion.div>
  );
}
