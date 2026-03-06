import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AgeMode } from "./compass-data";
import { LIFE_DOMAINS, ACTION_OPTIONS } from "./compass-data";

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

export function CommittedAction({
  domains,
  committedActions,
  onUpdateAction,
}: CommittedActionProps) {
  const underservedDomains = domains.filter((d) => d.alignment <= 6);
  const displayDomains =
    underservedDomains.length > 0 ? underservedDomains : domains;

  const getDomainInfo = (domainId: string) =>
    LIFE_DOMAINS.find((d) => d.id === domainId);

  const getAction = (domainId: string) =>
    committedActions.find((a) => a.domainId === domainId)?.action || "";

  const handleChipTap = (domainId: string, actionText: string) => {
    const current = getAction(domainId);
    if (current === actionText) {
      onUpdateAction(domainId, "");
    } else {
      onUpdateAction(domainId, actionText);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        minHeight: "100%",
        flex: 1,
      }}
    >
      {/* Header context */}
      <div
        style={{
          textAlign: "center",
          color: "rgba(255, 255, 255, 0.7)",
          fontSize: "14px",
          lineHeight: "1.6",
          padding: "0 8px",
        }}
      >
        {underservedDomains.length > 0 ? (
          <span>
            These domains scored 6 or below — they could use some attention.
            Tap an action for each.
          </span>
        ) : (
          <span>
            All your domains are well-aligned! You can still pick actions to
            keep the momentum going.
          </span>
        )}
      </div>

      {/* Domain action sections */}
      {displayDomains.map((domainState) => {
        const domain = getDomainInfo(domainState.domainId);
        if (!domain) return null;

        const currentAction = getAction(domainState.domainId);
        const hasAction = currentAction.trim().length > 0;
        const options = ACTION_OPTIONS[domainState.domainId] || [];

        return (
          <div
            key={domainState.domainId}
            style={{
              background: "rgba(15, 22, 28, 0.55)",
              borderRadius: "14px",
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
                  marginBottom: "16px",
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

            {/* Action chips */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              {options.map((actionText) => {
                const isSelected = currentAction === actionText;

                return (
                  <button
                    key={actionText}
                    onClick={() =>
                      handleChipTap(domainState.domainId, actionText)
                    }
                    style={{
                      minHeight: "44px",
                      padding: "10px 16px",
                      borderRadius: "22px",
                      border: isSelected
                        ? "2px solid #2d8a8a"
                        : "1px solid rgba(201, 168, 76, 0.3)",
                      background: isSelected
                        ? "rgba(45, 138, 138, 0.25)"
                        : "rgba(15, 22, 28, 0.6)",
                      color: isSelected ? "#e8dcc8" : "rgba(232, 220, 200, 0.75)",
                      fontSize: "14px",
                      fontWeight: isSelected ? 600 : 400,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      lineHeight: "1.3",
                      transition: "all 0.2s ease",
                      boxShadow: isSelected
                        ? "0 0 12px rgba(45, 138, 138, 0.3)"
                        : "none",
                    }}
                  >
                    {actionText}
                  </button>
                );
              })}
            </div>

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
                    marginTop: "14px",
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
          background: "rgba(15, 22, 28, 0.4)",
          borderRadius: "14px",
          padding: "24px",
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
                {/* Domain icon above dot */}
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
