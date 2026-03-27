import { motion } from "framer-motion";
import type { AgeMode } from "./grief-data";

interface MeaningMakingProps {
  whatTaught: string;
  howChanged: string;
  whatTheyWant: string;
  onSetWhatTaught: (t: string) => void;
  onSetHowChanged: (t: string) => void;
  onSetWhatTheyWant: (t: string) => void;
  ageMode: AgeMode;
}

interface PromptSection {
  id: string;
  question: Record<AgeMode, string>;
  placeholder: Record<AgeMode, string>;
  value: string;
  onChange: (t: string) => void;
}

const INTRO: Record<AgeMode, string> = {
  child: "Even sad things can teach us important lessons. Take your time with each question.",
  teen: "Grief often changes how we see the world and ourselves. Reflect on these questions at your own pace.",
  adult:
    "Meaning-making is central to post-traumatic growth research (Tedeschi & Calhoun) and Worden's fourth task. Take time with each prompt.",
};

export function MeaningMaking({
  whatTaught,
  howChanged,
  whatTheyWant,
  onSetWhatTaught,
  onSetHowChanged,
  onSetWhatTheyWant,
  ageMode,
}: MeaningMakingProps) {
  const sections: PromptSection[] = [
    {
      id: "taught",
      question: {
        child: "What has this loss taught you about what is most important?",
        teen: "What has this loss taught you about what matters most to you?",
        adult: "What has this loss taught you about what matters most?",
      },
      placeholder: {
        child: "Maybe it showed me that...",
        teen: "This experience showed me that...",
        adult: "This loss has illuminated...",
      },
      value: whatTaught,
      onChange: onSetWhatTaught,
    },
    {
      id: "changed",
      question: {
        child: "How are you different because of this?",
        teen: "How has this experience changed who you are?",
        adult: "How has this experience changed who you are?",
      },
      placeholder: {
        child: "I think I am now...",
        teen: "I've noticed that I...",
        adult: "This loss has shifted...",
      },
      value: howChanged,
      onChange: onSetHowChanged,
    },
    {
      id: "theywant",
      question: {
        child: "What do you think they would want for you now?",
        teen: "What would the person or thing you lost want for you going forward?",
        adult: "What would the person or thing you lost want for you now?",
      },
      placeholder: {
        child: "I think they would want me to...",
        teen: "They would probably want me to...",
        adult: "Continuing bonds theory suggests...",
      },
      value: whatTheyWant,
      onChange: onSetWhatTheyWant,
    },
  ];

  const answeredCount = [whatTaught, howChanged, whatTheyWant].filter(
    (t) => t.trim().length >= 20,
  ).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: "rgba(160,144,212,0.05)",
          borderRadius: 12,
          padding: "12px 14px",
          borderLeft: "3px solid rgba(160,144,212,0.25)",
        }}
      >
        <p style={{ margin: 0, fontSize: 13, color: "rgba(232,220,200,0.65)", lineHeight: 1.65 }}>
          {INTRO[ageMode]}
        </p>
      </motion.div>

      {sections.map((section, i) => {
        const hasContent = section.value.trim().length >= 20;
        return (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.1 }}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              padding: "14px 16px",
              borderRadius: 12,
              background: hasContent
                ? "rgba(160,144,212,0.06)"
                : "rgba(232,220,200,0.03)",
              borderLeft: `3px solid ${hasContent ? "rgba(160,144,212,0.45)" : "rgba(160,144,212,0.15)"}`,
              transition: "background 0.3s, border-color 0.3s",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 13,
                fontWeight: 600,
                color: hasContent ? "#a090d4" : "rgba(232,220,200,0.6)",
                lineHeight: 1.45,
                transition: "color 0.3s",
              }}
            >
              {section.question[ageMode]}
            </p>
            <textarea
              value={section.value}
              onChange={(e) => section.onChange(e.target.value)}
              rows={3}
              placeholder={section.placeholder[ageMode]}
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: 13,
                fontFamily: "Inter, sans-serif",
                lineHeight: 1.65,
                background: "rgba(232,220,200,0.04)",
                border: "1px solid rgba(160,144,212,0.15)",
                borderRadius: 8,
                color: "#e8dcc8",
                outline: "none",
                resize: "vertical",
                minHeight: 72,
                boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(160,144,212,0.4)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(160,144,212,0.15)";
              }}
            />
          </motion.div>
        );
      })}

      <div
        style={{
          textAlign: "center",
          fontSize: 11,
          color:
            answeredCount >= 1
              ? "rgba(160,144,212,0.65)"
              : "rgba(232,220,200,0.28)",
        }}
      >
        {answeredCount} of 3 reflections answered
        {answeredCount === 0 ? " \u00B7 answer at least one to continue" : ""}
      </div>
    </div>
  );
}
