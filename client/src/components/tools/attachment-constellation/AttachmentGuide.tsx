import { AnimatePresence, motion } from "framer-motion";

interface AttachmentGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const PARCHMENT = "#e8dcc8";
const BG = "#06080f";
const GOLD = "#c4a84c";

const SECTIONS = [
  {
    id: "legacy",
    icon: "📚",
    title: "Bowlby & Ainsworth's Legacy",
    color: "#80a8d4",
    body: "John Bowlby proposed that humans have an innate need to form close emotional bonds with caregivers — this is attachment. Mary Ainsworth's Strange Situation experiments revealed how early caregiving shapes distinct attachment patterns. Their work transformed developmental psychology and continues to inform therapy today.",
  },
  {
    id: "styles",
    icon: "⭐",
    title: "The Four Attachment Styles",
    color: "#c4a84c",
    body: "Secure attachment develops when caregivers are consistently responsive. Anxious (preoccupied) attachment forms when care is inconsistent. Avoidant (dismissive) attachment develops when emotional needs are regularly ignored. Disorganized (fearful) attachment arises when the caregiver is also a source of fear — creating an irresolvable dilemma for the child.",
  },
  {
    id: "earned",
    icon: "🌟",
    title: "Earned Secure Attachment",
    color: "#60c480",
    body: "Research by Mary Main and others found that adults can move toward secure attachment even if their early experiences were difficult. This 'earned security' often develops through meaningful relationships, therapy, and the capacity to reflect on and make sense of one's own history. The Adult Attachment Interview (AAI) measures not what happened, but how coherently a person narrates their story.",
  },
  {
    id: "young",
    icon: "🧒",
    title: "For Young People",
    color: "#a080d4",
    body: "Children and teens can also understand attachment concepts in age-appropriate ways. Feeling safe and secure with at least one reliable adult is the foundation of healthy development. Helping young people identify their safe people, safe places, and calming activities builds the same secure base that attachment theory describes.",
  },
];

export function AttachmentGuide({ isOpen, onClose }: AttachmentGuideProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="ac-guide-overlay"
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
            background: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(6px)",
            zIndex: 60,
            padding: 16,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            key="ac-guide-modal"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{
              background: `linear-gradient(180deg, ${BG} 0%, #04060c 100%)`,
              borderRadius: 18,
              maxWidth: 520,
              width: "100%",
              maxHeight: "90vh",
              border: "1px solid rgba(196, 168, 76, 0.2)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 40px rgba(196,168,76,0.08)",
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
                borderBottom: "1px solid rgba(196, 168, 76, 0.15)",
                flexShrink: 0,
              }}
            >
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: PARCHMENT, fontFamily: "'Lora', Georgia, serif" }}>
                ✨ Attachment Theory
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
                  border: "1px solid rgba(196, 168, 76, 0.2)",
                  borderRadius: 8,
                  color: "rgba(232, 220, 200, 0.6)",
                  fontSize: 18,
                  cursor: "pointer",
                  transition: "background 0.15s, color 0.15s",
                  fontFamily: "Inter, sans-serif",
                  lineHeight: 1,
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "rgba(232,220,200,0.9)"; }}
                onMouseOut={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(232,220,200,0.6)"; }}
              >
                ✕
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
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: "rgba(232,220,200,0.7)" }}>
                Attachment theory explores how early relationships with caregivers shape our patterns of connection throughout life — and how we can build greater security at any age.
              </p>

              {SECTIONS.map((section) => (
                <div
                  key={section.id}
                  style={{
                    background: "linear-gradient(135deg, rgba(10,12,25,0.9) 0%, rgba(6,8,15,0.95) 100%)",
                    borderRadius: 14,
                    padding: "16px 18px",
                    border: `1px solid rgba(${section.color.replace('#','').match(/.{2}/g)?.map(x=>parseInt(x,16)).join(',') || '196,168,76'}, 0.12)`,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 22 }}>{section.icon}</span>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 650, color: section.color }}>
                      {section.title}
                    </h3>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: "rgba(232,220,200,0.8)" }}>
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