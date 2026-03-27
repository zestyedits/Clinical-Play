import { AnimatePresence, motion } from "framer-motion";

interface MindfulnessGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const ACCENT = "#5ba8c4";
const PARCHMENT = "#e8dcc8";
const BG = "#0d1a28";

const SECTIONS = [
  {
    id: "mbsr",
    icon: "🌿",
    title: "What is MBSR?",
    body: "Mindfulness-Based Stress Reduction (MBSR) was developed by Jon Kabat-Zinn at the University of Massachusetts in 1979. It is defined as paying attention in a particular way: on purpose, in the present moment, and non-judgmentally. MBSR teaches people to become more aware of their thoughts, feelings, and bodily sensations without reacting to them automatically.",
  },
  {
    id: "practice",
    icon: "🫀",
    title: "The Practice",
    body: "MBSR typically includes: body scan meditation (systematically attending to each part of the body), breath awareness (using the breath as an anchor to the present moment), mindful movement such as gentle yoga or walking, and loving-kindness meditation (cultivating compassion toward self and others). Practices are usually brief — even 5–10 minutes can produce measurable benefits.",
  },
  {
    id: "research",
    icon: "📚",
    title: "Research Support",
    body: "Decades of research show that regular mindfulness practice can significantly reduce stress, anxiety, and depression. It has also been shown to help with chronic pain management, immune function, emotional regulation, and quality of life. Mindfulness-based interventions are now recommended by the NHS (UK) and APA for a range of mental health conditions.",
  },
  {
    id: "young",
    icon: "🌱",
    title: "For Young People",
    body: "Mindfulness programs in schools show strong results for improving emotional regulation, reducing anxiety, and building resilience. Research with children and adolescents demonstrates that even brief mindfulness practice can improve attention, reduce stress reactivity, and support wellbeing. Age-adapted language and exercises help young people connect with the practice meaningfully.",
  },
];

export function MindfulnessGuide({ isOpen, onClose }: MindfulnessGuideProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="mm-guide-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(6px)",
            zIndex: 9999,
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            key="mm-guide-modal"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{
              background: `linear-gradient(180deg, ${BG} 0%, #060d18 100%)`,
              borderRadius: 18,
              maxWidth: 520,
              width: "100%",
              maxHeight: "90vh",
              border: "1px solid rgba(91, 168, 196, 0.25)",
              boxShadow:
                "0 24px 80px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.04) inset, 0 0 40px rgba(91, 168, 196, 0.08)",
              fontFamily: "Inter, sans-serif",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column" as const,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 22px",
                borderBottom: "1px solid rgba(91, 168, 196, 0.15)",
                flexShrink: 0,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 700,
                  color: PARCHMENT,
                  letterSpacing: "-0.01em",
                }}
              >
                🌿 About Mindfulness (MBSR)
              </h2>
              <button
                onClick={onClose}
                aria-label="Close guide"
                style={{
                  minWidth: 44,
                  minHeight: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(91, 168, 196, 0.2)",
                  borderRadius: 8,
                  color: "rgba(232, 220, 200, 0.6)",
                  fontSize: 18,
                  cursor: "pointer",
                  transition: "background 0.15s, color 0.15s",
                  fontFamily: "Inter, sans-serif",
                  lineHeight: 1,
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)";
                  e.currentTarget.style.color = "rgba(232, 220, 200, 0.9)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
                  e.currentTarget.style.color = "rgba(232, 220, 200, 0.6)";
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                overflowY: "auto" as const,
                flex: 1,
                padding: "16px 22px 22px",
                display: "flex",
                flexDirection: "column" as const,
                gap: 14,
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  lineHeight: 1.7,
                  color: "rgba(232, 220, 200, 0.75)",
                }}
              >
                Mindfulness is the practice of bringing gentle, non-judgmental awareness to the
                present moment — noticing thoughts, sensations, and emotions as they arise, without
                getting caught in them. This tool is inspired by evidence-based MBSR and MBCT
                approaches.
              </p>

              {SECTIONS.map((section) => (
                <div
                  key={section.id}
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(8, 18, 28, 0.9) 0%, rgba(6, 12, 22, 0.95) 100%)",
                    borderRadius: 14,
                    padding: "16px 18px",
                    border: "1px solid rgba(91, 168, 196, 0.12)",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 10,
                    }}
                  >
                    <span style={{ fontSize: 22 }}>{section.icon}</span>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: 15,
                        fontWeight: 650,
                        color: ACCENT,
                      }}
                    >
                      {section.title}
                    </h3>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      lineHeight: 1.7,
                      color: "rgba(232, 220, 200, 0.82)",
                    }}
                  >
                    {section.body}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
