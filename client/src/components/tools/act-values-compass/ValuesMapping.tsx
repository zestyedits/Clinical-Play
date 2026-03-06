import React from "react";
import { AgeMode, LIFE_DOMAINS, VALUE_PROMPTS } from "./compass-data";

interface DomainState {
  domainId: string;
  values: string[];
  alignment: number;
}

interface ValuesMappingProps {
  domains: DomainState[];
  onUpdateValue: (domainId: string, values: string[]) => void;
  ageMode: AgeMode;
}

export function ValuesMapping({
  domains,
  onUpdateValue,
  ageMode,
}: ValuesMappingProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(min(240px, 100%), 1fr))",
        gap: 16,
      }}
    >
      {LIFE_DOMAINS.map((domain) => {
        const domainState = domains.find((d) => d.domainId === domain.id);
        const currentValue = domainState?.values?.[0] ?? "";
        const placeholder = VALUE_PROMPTS[domain.id]?.[ageMode] ?? "";

        return (
          <div
            key={domain.id}
            style={{
              background: "rgba(15, 22, 28, 0.6)",
              backgroundImage:
                "repeating-radial-gradient(circle at 50% 50%, transparent 0px, transparent 18px, rgba(200, 200, 200, 0.015) 19px, transparent 20px)",
              border: `1px solid ${domain.color}25`,
              borderLeft: `3px solid ${domain.color}`,
              borderRadius: 12,
              padding: 16,
              transition: "transform 0.2s ease",
              cursor: "default",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform =
                "scale(1.02)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: `${domain.color}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              <svg
                viewBox="0 0 24 24"
                width={32}
                height={32}
                style={{ display: "block" }}
              >
                <path d={domain.iconPath} fill={domain.color} />
              </svg>
            </div>

            {/* Domain name */}
            <div
              style={{
                fontWeight: 700,
                color: "#e8dcc8",
                fontSize: 16,
                marginBottom: 4,
              }}
            >
              {domain.name}
            </div>

            {/* Description */}
            <div
              style={{
                fontSize: 13,
                color: "rgba(232, 220, 200, 0.55)",
                lineHeight: 1.4,
                marginBottom: 12,
              }}
            >
              {domain.description[ageMode]}
            </div>

            {/* Value input */}
            <textarea
              rows={2}
              placeholder={placeholder}
              value={currentValue}
              onChange={(e) => onUpdateValue(domain.id, [e.target.value])}
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: "rgba(15, 10, 25, 0.7)",
                color: "#e8dcc8",
                border: "1px solid rgba(45, 138, 138, 0.3)",
                borderRadius: 8,
                padding: "8px 10px",
                fontSize: 14,
                fontFamily: "inherit",
                resize: "vertical",
                outline: "none",
                transition: "border-color 0.2s ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#2d8a8a";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(45, 138, 138, 0.3)";
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
