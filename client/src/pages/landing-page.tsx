import { LegalDisclaimer } from "@/components/shared/legal-disclaimer";
import { LogoMark } from "@/components/shared/logo-mark";
import { ArrowRight, CheckCircle2, Shield, FileText, Lock, Cookie, Mail, ArrowUp, Sparkles, Heart } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { useEffect, useState, useRef, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

/* ── Interactive Demo: Feeling Wheel Explorer ── */

/* Emotion data for the demo — trimmed subset of the full 170-emotion tree */
const DEMO_EMOTIONS = [
  {
    id: "joy", label: "Joy", emoji: "\u{1F60A}", color: "#f59e0b", bg: "#fffbeb", bgDeep: "#fef3c7",
    question: "What shade of joy is it?",
    children: [
      { id: "happy", label: "Happy", emoji: "\u{1F604}", children: [
        { id: "playful", label: "Playful", emoji: "\u{1F938}" },
        { id: "content", label: "Content", emoji: "\u{263A}\uFE0F" },
        { id: "cheerful", label: "Cheerful", emoji: "\u{1F31E}" },
      ]},
      { id: "grateful", label: "Grateful", emoji: "\u{1F64F}", children: [
        { id: "thankful", label: "Thankful", emoji: "\u{1F49B}" },
        { id: "appreciative", label: "Appreciative", emoji: "\u{2728}" },
      ]},
      { id: "proud", label: "Proud", emoji: "\u{1F4AA}", children: [
        { id: "accomplished", label: "Accomplished", emoji: "\u{1F3C6}" },
        { id: "confident", label: "Confident", emoji: "\u{1F451}" },
      ]},
      { id: "peaceful", label: "Peaceful", emoji: "\u{1F54A}\uFE0F", children: [
        { id: "calm", label: "Calm", emoji: "\u{1F30A}" },
        { id: "serene", label: "Serene", emoji: "\u{1F338}" },
      ]},
    ],
  },
  {
    id: "sadness", label: "Sadness", emoji: "\u{1F622}", color: "#3b82f6", bg: "#eff6ff", bgDeep: "#dbeafe",
    question: "Heavy and deep, or a quiet ache?",
    children: [
      { id: "lonely", label: "Lonely", emoji: "\u{1F614}", children: [
        { id: "isolated", label: "Isolated", emoji: "\u{1F3DD}\uFE0F" },
        { id: "invisible", label: "Invisible", emoji: "\u{1F47B}" },
      ]},
      { id: "hurt", label: "Hurt", emoji: "\u{1F494}", children: [
        { id: "disappointed", label: "Disappointed", emoji: "\u{1F61E}" },
        { id: "let-down", label: "Let Down", emoji: "\u{1F4A7}" },
      ]},
      { id: "grief", label: "Grief", emoji: "\u{1F5A4}", children: [
        { id: "mourning", label: "Mourning", emoji: "\u{1F3B5}" },
        { id: "heartbroken", label: "Heartbroken", emoji: "\u{1F48D}" },
      ]},
    ],
  },
  {
    id: "anger", label: "Anger", emoji: "\u{1F621}", color: "#ef4444", bg: "#fef2f2", bgDeep: "#fee2e2",
    question: "Burning inside, or directed outward?",
    children: [
      { id: "frustrated", label: "Frustrated", emoji: "\u{1F624}", children: [
        { id: "annoyed", label: "Annoyed", emoji: "\u{1F612}" },
        { id: "stuck", label: "Stuck", emoji: "\u{1F9F1}" },
        { id: "exasperated", label: "Exasperated", emoji: "\u{1F62E}\u200D\u{1F4A8}" },
      ]},
      { id: "resentful", label: "Resentful", emoji: "\u{1F620}", children: [
        { id: "bitter", label: "Bitter", emoji: "\u{1F48A}" },
        { id: "jealous", label: "Jealous", emoji: "\u{1F49A}" },
      ]},
      { id: "furious", label: "Furious", emoji: "\u{1F525}", children: [
        { id: "enraged", label: "Enraged", emoji: "\u{1F4A2}" },
        { id: "hostile", label: "Hostile", emoji: "\u{26A1}" },
      ]},
    ],
  },
  {
    id: "fear", label: "Fear", emoji: "\u{1F628}", color: "#8b5cf6", bg: "#f5f3ff", bgDeep: "#ede9fe",
    question: "Something that might happen, or a feeling that won't leave?",
    children: [
      { id: "anxious", label: "Anxious", emoji: "\u{1F630}", children: [
        { id: "worried", label: "Worried", emoji: "\u{1F61F}" },
        { id: "overwhelmed", label: "Overwhelmed", emoji: "\u{1F32A}\uFE0F" },
      ]},
      { id: "insecure", label: "Insecure", emoji: "\u{1F616}", children: [
        { id: "inadequate", label: "Inadequate", emoji: "\u{1F4CF}" },
        { id: "vulnerable", label: "Vulnerable", emoji: "\u{1F90D}" },
      ]},
      { id: "scared", label: "Scared", emoji: "\u{1F631}", children: [
        { id: "terrified", label: "Terrified", emoji: "\u{1F480}" },
        { id: "panicked", label: "Panicked", emoji: "\u{1F6A8}" },
      ]},
    ],
  },
  {
    id: "surprise", label: "Surprise", emoji: "\u{1F62E}", color: "#f97316", bg: "#fff7ed", bgDeep: "#ffedd5",
    question: "A good surprise or an unsettling one?",
    children: [
      { id: "amazed", label: "Amazed", emoji: "\u{1F929}", children: [
        { id: "awestruck", label: "Awestruck", emoji: "\u{1F31F}" },
        { id: "astonished", label: "Astonished", emoji: "\u{1F4AB}" },
      ]},
      { id: "confused", label: "Confused", emoji: "\u{1F615}", children: [
        { id: "disoriented", label: "Disoriented", emoji: "\u{1F300}" },
        { id: "perplexed", label: "Perplexed", emoji: "\u{1F914}" },
      ]},
    ],
  },
  {
    id: "love", label: "Love", emoji: "\u{2764}\uFE0F", color: "#ec4899", bg: "#fdf2f8", bgDeep: "#fce7f3",
    question: "Warm and safe, or electric and new?",
    children: [
      { id: "affectionate", label: "Affectionate", emoji: "\u{1F917}", children: [
        { id: "warm", label: "Warm", emoji: "\u{2615}" },
        { id: "tender", label: "Tender", emoji: "\u{1F33C}" },
        { id: "caring", label: "Caring", emoji: "\u{1F49E}" },
      ]},
      { id: "connected", label: "Connected", emoji: "\u{1F91D}", children: [
        { id: "belonging", label: "Belonging", emoji: "\u{1F3E1}" },
        { id: "accepted", label: "Accepted", emoji: "\u{1F49C}" },
      ]},
    ],
  },
  {
    id: "shame", label: "Shame", emoji: "\u{1F636}", color: "#a855f7", bg: "#faf5ff", bgDeep: "#f3e8ff",
    question: "About being seen, or not measuring up?",
    children: [
      { id: "embarrassed", label: "Embarrassed", emoji: "\u{1F633}", children: [
        { id: "self-conscious", label: "Self-Conscious", emoji: "\u{1F648}" },
        { id: "exposed", label: "Exposed", emoji: "\u{1F4A2}" },
      ]},
      { id: "worthless", label: "Worthless", emoji: "\u{1F614}", children: [
        { id: "not-enough", label: "Not Enough", emoji: "\u{1F4A7}" },
        { id: "broken", label: "Broken", emoji: "\u{1FAE5}" },
      ]},
    ],
  },
  {
    id: "disgust", label: "Disgust", emoji: "\u{1F922}", color: "#22c55e", bg: "#f0fdf4", bgDeep: "#dcfce7",
    question: "A person, a situation, or a memory?",
    children: [
      { id: "repulsed", label: "Repulsed", emoji: "\u{1F92E}", children: [
        { id: "revolted", label: "Revolted", emoji: "\u{1F645}" },
        { id: "appalled", label: "Appalled", emoji: "\u{1F627}" },
      ]},
      { id: "contempt", label: "Contemptuous", emoji: "\u{1F612}", children: [
        { id: "judgmental", label: "Judgmental", emoji: "\u{2696}\uFE0F" },
        { id: "disdainful", label: "Disdainful", emoji: "\u{1F44E}" },
      ]},
    ],
  },
] as const;

type DemoEmotionType = (typeof DEMO_EMOTIONS)[number];
type DemoChild = DemoEmotionType["children"][number];
type DemoGrandchild = DemoChild["children"][number];

function DemoFeelingWheel() {
  const [tier, setTier] = useState<"primary" | "secondary" | "tertiary">("primary");
  const [activePrimary, setActivePrimary] = useState<DemoEmotionType | null>(null);
  const [activeSecondary, setActiveSecondary] = useState<DemoChild | null>(null);
  const [selectedTertiary, setSelectedTertiary] = useState<DemoGrandchild | null>(null);
  const [animKey, setAnimKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const completed = !!selectedTertiary;
  const activeColor = activePrimary?.color || "#4A7A56";
  const activeBg = activePrimary?.bg || "#fafbff";
  const activeBgDeep = activePrimary?.bgDeep || "#f0f2f8";

  const reset = useCallback(() => {
    setTier("primary");
    setActivePrimary(null);
    setActiveSecondary(null);
    setSelectedTertiary(null);
    setAnimKey(k => k + 1);
  }, []);

  const pickPrimary = (e: DemoEmotionType) => {
    setActivePrimary(e);
    setActiveSecondary(null);
    setSelectedTertiary(null);
    setTier("secondary");
    setAnimKey(k => k + 1);
  };

  const pickSecondary = (c: DemoChild) => {
    setActiveSecondary(c);
    setSelectedTertiary(null);
    setTier("tertiary");
    setAnimKey(k => k + 1);
  };

  const pickTertiary = (c: DemoGrandchild) => {
    setSelectedTertiary(c);
    setAnimKey(k => k + 1);
  };

  const goBack = () => {
    if (completed) { setSelectedTertiary(null); setTier("tertiary"); setAnimKey(k => k + 1); return; }
    if (tier === "tertiary") { setActiveSecondary(null); setTier("secondary"); setAnimKey(k => k + 1); return; }
    if (tier === "secondary") { reset(); return; }
  };

  /* Breadcrumb pieces */
  const crumbs: { emoji: string; label: string; onClick?: () => void }[] = [];
  if (activePrimary) crumbs.push({ emoji: activePrimary.emoji, label: activePrimary.label, onClick: () => { setActiveSecondary(null); setSelectedTertiary(null); setTier("secondary"); setAnimKey(k => k + 1); } });
  if (activeSecondary) crumbs.push({ emoji: activeSecondary.emoji, label: activeSecondary.label, onClick: () => { setSelectedTertiary(null); setTier("tertiary"); setAnimKey(k => k + 1); } });
  if (selectedTertiary) crumbs.push({ emoji: selectedTertiary.emoji, label: selectedTertiary.label });

  return (
    <div className="rounded-2xl shadow-2xl overflow-hidden border border-border/60" style={{ background: "#fff" }}>
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: `${activeColor}15`, background: `linear-gradient(90deg, ${activeBg}, white)` }}>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "#ffbd2e" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "#28c840" }} />
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" style={{ boxShadow: "0 0 6px rgba(40,200,64,0.5)" }} />
          <span className="text-[11px] font-medium" style={{ color: activeColor }}>Feeling Wheel</span>
          <span className="text-[10px] text-muted-foreground/60">|</span>
          <span className="text-[10px] text-muted-foreground/50">Demo Session</span>
        </div>
        <button onClick={reset} className="text-[10px] font-medium text-muted-foreground/50 hover:text-foreground px-2 py-0.5 rounded-md hover:bg-black/5 transition-all cursor-pointer">
          Reset
        </button>
      </div>

      {/* ── Main area with color-shifting background ── */}
      <div
        ref={containerRef}
        className="relative overflow-hidden"
        style={{
          background: tier === "primary"
            ? "radial-gradient(ellipse at 30% 20%, rgba(99,102,241,0.06) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(168,85,247,0.04) 0%, transparent 60%), linear-gradient(135deg, #fafbff 0%, #f5f6fa 100%)"
            : `radial-gradient(ellipse at 25% 15%, ${activeColor}18 0%, transparent 55%), radial-gradient(ellipse at 75% 85%, ${activeColor}0c 0%, transparent 55%), linear-gradient(135deg, ${activeBg} 0%, ${activeBgDeep}88 50%, ${activeBg} 100%)`,
          transition: "background 600ms ease",
          minHeight: 340,
        }}
      >
        {/* Floating ambient shapes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute rounded-full opacity-30"
            style={{
              width: 220, height: 220, top: "-40px", right: "-60px",
              background: `radial-gradient(circle, ${activeColor}20 0%, transparent 70%)`,
              filter: "blur(40px)",
              transition: "background 600ms ease",
              animation: "demo-float-1 12s ease-in-out infinite",
            }}
          />
          <div
            className="absolute rounded-full opacity-20"
            style={{
              width: 180, height: 180, bottom: "-30px", left: "-40px",
              background: `radial-gradient(circle, ${activeColor}18 0%, transparent 70%)`,
              filter: "blur(50px)",
              transition: "background 600ms ease",
              animation: "demo-float-2 15s ease-in-out infinite",
            }}
          />
          <div
            className="absolute rounded-full opacity-15"
            style={{
              width: 120, height: 120, top: "40%", left: "60%",
              background: `radial-gradient(circle, ${activeColor}15 0%, transparent 70%)`,
              filter: "blur(35px)",
              transition: "background 600ms ease",
              animation: "demo-float-3 10s ease-in-out infinite",
            }}
          />
        </div>

        <div className="relative z-10 p-5 md:p-7">
          {/* ── Breadcrumb trail ── */}
          {crumbs.length > 0 && (
            <div className="flex items-center gap-1 mb-5 demo-fade-in">
              <button onClick={goBack} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer mr-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                Back
              </button>
              {crumbs.map((crumb, i) => (
                <div key={i} className="flex items-center gap-1">
                  {i > 0 && <div className="w-4 h-0.5 rounded-full mx-0.5" style={{ background: `${activeColor}30` }} />}
                  <button
                    onClick={crumb.onClick}
                    disabled={!crumb.onClick}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: i === crumbs.length - 1 ? `${activeColor}15` : "transparent",
                      color: activeColor,
                      cursor: crumb.onClick ? "pointer" : "default",
                    }}
                  >
                    <span>{crumb.emoji}</span>
                    <span>{crumb.label}</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ── Question ── */}
          {tier !== "primary" && !completed && (
            <div key={`q-${animKey}`} className="text-center mb-6 demo-fade-in">
              <p className="text-base md:text-lg font-serif italic" style={{ color: `${activeColor}cc` }}>
                {tier === "secondary" && activePrimary?.question}
                {tier === "tertiary" && "Getting closer\u2026"}
              </p>
            </div>
          )}

          {/* ── PRIMARY GRID ── */}
          {tier === "primary" && (
            <div key={`p-${animKey}`}>
              <p className="text-center text-sm text-muted-foreground mb-5">How are you feeling right now?</p>
              <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-md mx-auto">
                {DEMO_EMOTIONS.map((emotion, i) => (
                  <button
                    key={emotion.id}
                    onClick={() => pickPrimary(emotion)}
                    className="demo-card-enter group relative flex flex-col items-center gap-1.5 py-4 px-2 rounded-2xl cursor-pointer transition-all duration-200 hover:-translate-y-1"
                    style={{
                      background: `linear-gradient(135deg, ${emotion.bg} 0%, white 100%)`,
                      border: `1.5px solid ${emotion.color}20`,
                      boxShadow: `0 2px 8px ${emotion.color}10`,
                      animationDelay: `${i * 40}ms`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = `${emotion.color}50`;
                      e.currentTarget.style.boxShadow = `0 8px 24px ${emotion.color}20, 0 0 0 1px ${emotion.color}15`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = `${emotion.color}20`;
                      e.currentTarget.style.boxShadow = `0 2px 8px ${emotion.color}10`;
                    }}
                  >
                    <span className="text-3xl sm:text-4xl transition-transform duration-200 group-hover:scale-110 group-active:scale-95 will-change-transform">{emotion.emoji}</span>
                    <span className="text-[11px] sm:text-xs font-semibold" style={{ color: emotion.color }}>{emotion.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── SECONDARY CARDS ── */}
          {tier === "secondary" && activePrimary && (
            <div key={`s-${animKey}`} className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
              {activePrimary.children.map((child, i) => (
                <button
                  key={child.id}
                  onClick={() => pickSecondary(child)}
                  className="demo-card-enter group relative flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5 text-left"
                  style={{
                    background: `linear-gradient(135deg, white 0%, ${activeBg} 100%)`,
                    border: `1.5px solid ${activeColor}20`,
                    boxShadow: `0 2px 8px ${activeColor}08`,
                    animationDelay: `${i * 60}ms`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${activeColor}45`;
                    e.currentTarget.style.boxShadow = `0 8px 20px ${activeColor}18`;
                    e.currentTarget.style.background = `linear-gradient(135deg, white 0%, ${activeBgDeep}88 100%)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${activeColor}20`;
                    e.currentTarget.style.boxShadow = `0 2px 8px ${activeColor}08`;
                    e.currentTarget.style.background = `linear-gradient(135deg, white 0%, ${activeBg} 100%)`;
                  }}
                >
                  <span className="text-2xl transition-transform duration-200 group-hover:scale-110 group-active:scale-90">{child.emoji}</span>
                  <div>
                    <span className="text-sm font-semibold text-foreground block">{child.label}</span>
                    <span className="text-[10px] text-muted-foreground/60">{child.children.length} deeper</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* ── TERTIARY CARDS ── */}
          {tier === "tertiary" && activeSecondary && !completed && (
            <div key={`t-${animKey}`} className="flex flex-wrap justify-center gap-2.5 max-w-md mx-auto">
              {activeSecondary.children.map((child, i) => (
                <button
                  key={child.id}
                  onClick={() => pickTertiary(child)}
                  className="demo-card-enter group flex items-center gap-2.5 px-5 py-3 rounded-full cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    background: `linear-gradient(135deg, white 0%, ${activeBg} 100%)`,
                    border: `1.5px solid ${activeColor}25`,
                    boxShadow: `0 2px 8px ${activeColor}08`,
                    animationDelay: `${i * 60}ms`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${activeColor}50`;
                    e.currentTarget.style.boxShadow = `0 6px 16px ${activeColor}20`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${activeColor}25`;
                    e.currentTarget.style.boxShadow = `0 2px 8px ${activeColor}08`;
                  }}
                >
                  <span className="text-xl transition-transform duration-200 group-hover:scale-110 group-active:scale-90">{child.emoji}</span>
                  <span className="text-sm font-medium text-foreground">{child.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* ── COMPLETED STATE ── */}
          {completed && (
            <div key={`done-${animKey}`} className="demo-fade-in text-center py-3">
              {/* Emotion journey */}
              <div className="flex items-center justify-center gap-3 mb-5">
                {crumbs.map((crumb, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {i > 0 && (
                      <div className="flex items-center gap-0.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: `${activeColor}30` }} />
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: `${activeColor}40` }} />
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: `${activeColor}50` }} />
                      </div>
                    )}
                    <div
                      className="flex flex-col items-center gap-1 px-4 py-3 rounded-2xl"
                      style={{
                        background: i === crumbs.length - 1
                          ? `linear-gradient(135deg, ${activeColor}18 0%, ${activeColor}08 100%)`
                          : `${activeColor}08`,
                        border: i === crumbs.length - 1 ? `2px solid ${activeColor}30` : `1px solid ${activeColor}15`,
                        boxShadow: i === crumbs.length - 1 ? `0 4px 16px ${activeColor}15` : "none",
                      }}
                    >
                      <span className={i === crumbs.length - 1 ? "text-3xl" : "text-xl"}>{crumb.emoji}</span>
                      <span className="text-[11px] font-semibold" style={{ color: activeColor }}>{crumb.label}</span>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-lg font-serif font-medium text-foreground mb-1">
                {selectedTertiary?.label}
              </p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto mb-5">
                In a live session, your clinician sees this in real-time — opening the door for deeper conversation.
              </p>
              <button
                onClick={reset}
                className="text-xs font-semibold px-5 py-2.5 rounded-full transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                style={{
                  background: `linear-gradient(135deg, ${activeColor} 0%, ${activeColor}dd 100%)`,
                  color: "white",
                  boxShadow: `0 4px 12px ${activeColor}30`,
                }}
              >
                Explore again
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom status bar ── */}
      <div className="flex items-center justify-between px-4 py-2 border-t" style={{ borderColor: `${activeColor}10`, background: `linear-gradient(90deg, ${activeBg}80, white)` }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: activeColor }}>C</div>
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border" style={{ borderColor: `${activeColor}30`, color: activeColor }}>P</div>
          </div>
          <span className="text-[10px] text-muted-foreground/50">2 participants</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground/40">170 emotions</span>
          <span className="text-[10px] text-muted-foreground/30">|</span>
          <span className="text-[10px] text-muted-foreground/40">3 tiers deep</span>
        </div>
      </div>

      {/* Inline keyframes for the demo */}
      <style>{`
        @keyframes demo-float-1 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-15px, 20px) scale(1.1); } }
        @keyframes demo-float-2 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(20px, -15px) scale(1.05); } }
        @keyframes demo-float-3 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-10px, -20px) scale(1.15); } }
        .demo-card-enter {
          animation: demo-card-pop 350ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        @keyframes demo-card-pop {
          0% { opacity: 0; transform: scale(0.85) translateY(8px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .demo-fade-in {
          animation: demo-fade 300ms ease-out both;
        }
        @keyframes demo-fade {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ── Waitlist Form ── */

function WaitlistForm({ variant = "default" }: { variant?: "default" | "bottom" }) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const waitlistMutation = useMutation({
    mutationFn: async ({ email, name }: { email: string; name: string }) => {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: name || null }),
      });
      if (res.status === 409) throw new Error("You're already on the waitlist!");
      if (!res.ok) throw new Error("Failed to join waitlist");
      return res.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      setEmail("");
      setName("");
    },
    onError: (err: Error) => {
      toast({ title: err.message, variant: "destructive" });
    },
  });

  if (submitted) {
    return (
      <div className="flex items-center gap-2 justify-center text-primary bg-primary/8 px-5 py-3.5 rounded-xl text-sm font-medium">
        <CheckCircle2 size={16} />
        You're on the list! We'll be in touch.
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (email.trim()) waitlistMutation.mutate({ email: email.trim(), name: name.trim() });
      }}
      className="space-y-3"
      data-testid="form-waitlist"
    >
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Your name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 h-11 px-4 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          data-testid="input-waitlist-name"
        />
        <div className="relative flex-1">
          <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
          <input
            type="email"
            required
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            data-testid="input-waitlist-email"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={waitlistMutation.isPending}
        className="w-full sm:w-auto h-11 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-medium btn-warm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        data-testid="button-waitlist-submit"
      >
        {waitlistMutation.isPending ? "Joining..." : (
          <>Join the Waitlist <ArrowRight size={15} /></>
        )}
      </button>
      <p className="text-xs text-muted-foreground/60 text-center sm:text-left">
        No spam, ever. Just a launch notification.
      </p>
    </form>
  );
}

/* ── Upcoming Tools Data ── */

const upcomingTools = [
  { name: "The DBT House", desc: "Room-by-room emotional regulation, distress tolerance, and mindfulness.", tags: ["DBT", "Skills Training"], emoji: "🏠" },
  { name: "Parts Puppet Theater", desc: "IFS-inspired stage for giving voice to internal parts through interactive puppets.", tags: ["IFS", "Parts Work"], emoji: "🎭" },
  { name: "Growth Garden", desc: "A living garden metaphor — plant seeds that grow across sessions as therapy progresses.", tags: ["Goals", "Rapport"], emoji: "🌱" },
  { name: "Fidget Toolbox", desc: "Calming sensory toolkit with interactive fidgets for regulation during talk therapy.", tags: ["Sensory", "ADHD"], emoji: "🧸" },
  { name: "Safety & Support Map", desc: "Interactive concentric-circle map for visualizing support networks and safety plans.", tags: ["Safety Planning", "Crisis"], emoji: "🗺️" },
  { name: "Coping Skills Deck", desc: "50+ evidence-based coping strategies organized by category. Build a personalized toolkit.", tags: ["CBT", "DBT"], emoji: "🃏" },
  { name: "Social Story Builder", desc: "Visual storyboard editor for creating personalized social stories.", tags: ["Autism", "Pediatric"], emoji: "📖" },
];

/* ── Main Component ── */

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 600);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero ── */}
      <section className="pt-28 md:pt-36 pb-16 md:pb-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 border border-primary/15 text-primary text-xs font-medium tracking-wide uppercase mb-6">
            <Sparkles size={12} />
            Built for Licensed Clinicians
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-medium leading-[1.1] text-foreground mb-5">
            Therapy tools<br />
            <span className="text-primary">that connect.</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto mb-10">
            Interactive tools designed for real therapeutic engagement. Share your screen, share an invite code, and start working together — wherever you are.
          </p>
          <div className="max-w-md mx-auto">
            <WaitlistForm />
          </div>
        </div>
      </section>

      {/* ── Interactive Demo ── */}
      <section className="pb-16 md:pb-24 px-6" id="features">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold tracking-widest uppercase text-primary/60 mb-3">Live Preview</p>
            <h2 className="text-2xl md:text-3xl font-serif text-foreground mb-2">See what a session feels like</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              This is an actual tool from ClinicalPlay. Tap an emotion, drill deeper, and watch the space transform around your selection.
            </p>
          </div>
          <DemoFeelingWheel />
        </div>
      </section>

      {/* ── What's Coming ── */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/8 border border-accent/15 text-accent text-xs font-medium tracking-wide uppercase mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Actively Building
            </div>
            <h2 className="text-2xl md:text-4xl font-serif text-foreground mb-3">What's coming next</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Our clinical library keeps growing. These tools are actively in development and will be included with every plan at launch.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingTools.map((tool) => (
              <div key={tool.name} className="bg-card border border-border rounded-2xl p-5 hover:shadow-md hover:border-border/80 transition-[box-shadow,border-color] duration-200">
                <div className="text-3xl mb-3">{tool.emoji}</div>
                <h3 className="text-base font-serif text-foreground mb-1.5">{tool.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{tool.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {tool.tags.map((tag) => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-muted text-muted-foreground border border-border">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border border-border rounded-2xl p-8 md:p-10 text-center">
            <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart size={24} className="text-primary" />
            </div>
            <h3 className="text-xl md:text-2xl font-serif text-foreground mb-3" data-testid="text-about-founder">About the Founder</h3>
            <p className="text-muted-foreground leading-relaxed max-w-lg mx-auto mb-3">
              Created by a licensed clinical social worker and veteran with a mission to make telehealth sessions more engaging, interactive, and clinically effective.
            </p>
            <p className="text-sm text-muted-foreground/70 italic">
              "I got tired of boring telehealth sessions, so I built us a digital playroom."
            </p>
          </div>
        </div>
      </section>

      {/* ── Bottom Waitlist CTA ── */}
      <section className="py-16 md:py-24 px-6 bg-secondary/30" id="waitlist">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-serif text-foreground mb-3">Be the first to know</h2>
          <p className="text-muted-foreground mb-8">
            Join our waitlist and get notified when ClinicalPlay launches. Early supporters get founding member pricing.
          </p>
          <WaitlistForm variant="bottom" />
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-muted/30 py-12 md:py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="mb-4">
                <LogoMark size="sm" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                Interactive therapy tools for evidence-based clinical engagement.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-medium tracking-[0.08em] uppercase text-muted-foreground mb-4">Legal</h4>
              <div className="space-y-3">
                <Link href="/privacy" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors no-underline" data-testid="link-footer-privacy">
                  <Shield size={13} className="shrink-0" />
                  Privacy Policy
                </Link>
                <Link href="/terms" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors no-underline" data-testid="link-footer-terms">
                  <FileText size={13} className="shrink-0" />
                  Terms of Service
                </Link>
                <Link href="/cookies" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors no-underline" data-testid="link-footer-cookies">
                  <Cookie size={13} className="shrink-0" />
                  Cookie Policy
                </Link>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-medium tracking-[0.08em] uppercase text-muted-foreground mb-4">Platform</h4>
              <div className="space-y-3">
                <Link href="/login" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors no-underline" data-testid="link-footer-signin">
                  Clinician Sign In
                </Link>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock size={13} className="shrink-0 text-muted-foreground/50" />
                  No PHI Collected
                </p>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield size={13} className="shrink-0 text-muted-foreground/50" />
                  256-bit TLS Encryption
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground/70">
              &copy; {new Date().getFullYear()} ClinicalPlay. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="text-xs text-muted-foreground/70 hover:text-foreground transition-colors no-underline">Privacy</Link>
              <Link href="/terms" className="text-xs text-muted-foreground/70 hover:text-foreground transition-colors no-underline">Terms</Link>
              <Link href="/cookies" className="text-xs text-muted-foreground/70 hover:text-foreground transition-colors no-underline">Cookies</Link>
            </div>
          </div>
          <LegalDisclaimer />
        </div>
      </footer>

      {/* Back to top */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-20 right-5 md:bottom-8 md:right-8 z-40 w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-md flex items-center justify-center hover:bg-primary/90 transition-colors cursor-pointer"
          data-testid="button-back-to-top"
        >
          <ArrowUp size={18} />
        </button>
      )}
    </div>
  );
}
