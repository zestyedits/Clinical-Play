import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AgeMode } from "./compass-data";
import { LIFE_DOMAINS, ACTION_PROMPTS } from "./compass-data";

interface DomainState {
  domainId: string;
  values: string[];
  alignment: number;
}

interface CommittedActionItem {
  domainId: string;
  action: string;
}

interface CommittedActionProps {
  domains: DomainState[];
  committedActions: CommittedActionItem[];
  onUpdateAction: (domainId: string, action: string) => void;
  ageMode: AgeMode;
}

const HELPER_PROMPTS: Record<AgeMode, string[]> = {
  child: ["When will you do it?", "Who will help you?"],
  teen: ["When?", "Where?", "What's the first step?"],
  adult: [
    "Specify: When, where, duration, and the smallest first step.",
  ],
};

export function CommittedAction({
  domains,
  committedActions,
  onUpdateAction,
  ageMode,
}: CommittedActionProps) {
  const [expandedHelpers, setExpandedHelpers] = useState<
    Record<string, boolean>
  >({});

  const underservedDomains = domains.filter((d) => d.alignment <= 6);
  const displayDomains =
    underservedDomains.length > 0 ? underservedDomains : domains;

  const getDomainInfo = (domainId: string) =>
    LIFE_DOMAINS.find((d) => d.id === domainId);

  const getAction = (domainId: string) =>
    committedActions.find((a) => a.domainId === domainId)?.action || "";

  const toggleHelper = (domainId: string) => {
    setExpandedHelpers((prev) => ({
      ...prev,
      [domainId]: !prev[domainId],
    }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header context */}
      <div
        style={{
          textAlign: "center",
          color: "rgba(255, 255, 255, 0.7)",
          fontSize: "14px",
          lineHeight: "1.5",
        }}
      >
        {underservedDomains.length > 0 ? (
          <span>
            These domains scored 6 or below — they could use some attention.
            Write one concrete action for each.
          </span>
        ) : (
          <span>
            All your domains are well-aligned! You can still plan actions to
            keep the momentum going.
          </span>
        )}
      </div>

      {/* Domain action sections */}
      {displayDomains.map((domainState) => {
        const domain = getDomainInfo(domainState.domainId);
        if (!domain) return null;

        const action = getAction(domainState.domainId);
        const hasAction = action.trim().length > 0;
        const placeholder =
          ACTION_PROMPTS[domainState.domainId]?.[ageMode] || "";
        const helperOpen = expandedHelpers[domainState.domainId] || false;

        return (
          <div
            key={domainState.domainId}
            style={{
              background: "rgba(15, 10, 25, 0.5)",
              borderRadius: "12px",
              padding: "20px",
              border: "1px solid rgba(45, 138, 138, 0.2)",
            }}
          >
            {/* Domain header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "8px",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill={domain.color}
                style={{ flexShrink: 0 }}
              >
                <path d={domain.iconPath} />
              </svg>
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#c9a84c",
                }}
              >
                {domain.name}
              </span>
            </div>

            {/* Values display */}
            {domainState.values.length > 0 && (
              <div
                style={{
                  fontSize: "13px",
                  color: "rgba(255, 255, 255, 0.6)",
                  marginBottom: "14px",
                  fontStyle: "italic",
                }}
              >
                Values:{" "}
                {domainState.values.map((v, i) => (
                  <span key={i}>
                    {i > 0 && ", "}
                    &ldquo;{v}&rdquo;
                  </span>
                ))}
              </div>
            )}

            {/* Action textarea */}
            <textarea
              value={action}
              onChange={(e) =>
                onUpdateAction(domainState.domainId, e.target.value)
              }
              placeholder={placeholder}
              rows={3}
              style={{
                width: "100%",
                background: "rgba(15, 10, 25, 0.7)",
                border: "1px solid rgba(45, 138, 138, 0.3)",
                borderRadius: "8px",
                padding: "12px",
                color: "#ffffff",
                fontSize: "14px",
                lineHeight: "1.5",
                resize: "vertical",
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#2d8a8a";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(45, 138, 138, 0.3)";
              }}
            />

            {/* Helper prompts (collapsible) */}
            <button
              onClick={() => toggleHelper(domainState.domainId)}
              style={{
                background: "none",
                border: "none",
                color: "rgba(45, 138, 138, 0.8)",
                fontSize: "12px",
                cursor: "pointer",
                padding: "6px 0",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                marginTop: "4px",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  transform: helperOpen ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                  fontSize: "10px",
                }}
              >
                &#9654;
              </span>
              Need help making it specific?
            </button>

            {helperOpen && (
              <div
                style={{
                  padding: "8px 12px",
                  background: "rgba(45, 138, 138, 0.08)",
                  borderRadius: "6px",
                  marginTop: "4px",
                }}
              >
                {HELPER_PROMPTS[ageMode].map((tip, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: "12px",
                      color: "rgba(255, 255, 255, 0.6)",
                      padding: "2px 0",
                    }}
                  >
                    &bull; {tip}
                  </div>
                ))}
              </div>
            )}

            {/* Waypoint indicator */}
            <AnimatePresence>
              {hasAction && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginTop: "10px",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    style={{ flexShrink: 0 }}
                  >
                    <circle cx="8" cy="8" r="7" fill="#2d8a8a" />
                    <path
                      d="M4.5 8L7 10.5L11.5 6"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#2d8a8a",
                      fontWeight: 500,
                    }}
                  >
                    Waypoint set
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Trail visualization */}
      <div
        style={{
          background: "rgba(15, 10, 25, 0.4)",
          borderRadius: "12px",
          padding: "20px 24px",
          marginTop: "8px",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            color: "rgba(255, 255, 255, 0.5)",
            textAlign: "center",
            marginBottom: "16px",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          Your Trail
        </div>

        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "24px 12px 0",
          }}
        >
          {/* Connecting line */}
          <div
            style={{
              position: "absolute",
              top: "calc(24px + 10px)",
              left: "12px",
              right: "12px",
              height: "2px",
              background: "rgba(45, 138, 138, 0.2)",
              zIndex: 0,
            }}
          />

          {LIFE_DOMAINS.map((domain) => {
            const action = getAction(domain.id);
            const filled = action.trim().length > 0;

            return (
              <div
                key={domain.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px",
                  zIndex: 1,
                  position: "relative",
                }}
              >
                {/* Domain icon or initial above dot */}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill={
                    filled
                      ? domain.color
                      : "rgba(255, 255, 255, 0.25)"
                  }
                  style={{ opacity: filled ? 1 : 0.5 }}
                >
                  <path d={domain.iconPath} />
                </svg>

                {/* Dot */}
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: filled
                      ? "#2d8a8a"
                      : "rgba(45, 138, 138, 0.2)",
                    border: filled
                      ? "2px solid #2d8a8a"
                      : "2px solid rgba(45, 138, 138, 0.3)",
                    transition: "all 0.3s",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
