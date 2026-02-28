import { LegalDisclaimer } from "@/components/shared/legal-disclaimer";
import { LogoMark } from "@/components/shared/logo-mark";
import { ArrowRight, CheckCircle2, Shield, Lock, Mail, ArrowUp, Heart } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { useEffect, useState, useRef, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

/* ── Interactive Demo: Emotion Explorer ── */

/* Emotion data — subset of the full 170-emotion tree */
const DEMO_EMOTIONS = [
  {
    id: "joy", label: "Joy", emoji: "\u{1F60A}", color: "#f59e0b", colorDark: "#b45309",
    bg: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 40%, #fde68a44 100%)",
    bgSolid: "#fef9ee",
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
    id: "sadness", label: "Sadness", emoji: "\u{1F622}", color: "#3b82f6", colorDark: "#1d4ed8",
    bg: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 40%, #bfdbfe44 100%)",
    bgSolid: "#f0f5ff",
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
    id: "anger", label: "Anger", emoji: "\u{1F621}", color: "#ef4444", colorDark: "#b91c1c",
    bg: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 40%, #fecaca44 100%)",
    bgSolid: "#fef2f2",
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
    id: "fear", label: "Fear", emoji: "\u{1F628}", color: "#8b5cf6", colorDark: "#6d28d9",
    bg: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 40%, #ddd6fe44 100%)",
    bgSolid: "#f5f3ff",
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
    id: "surprise", label: "Surprise", emoji: "\u{1F62E}", color: "#f97316", colorDark: "#c2410c",
    bg: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 40%, #fed7aa44 100%)",
    bgSolid: "#fff7ed",
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
    id: "love", label: "Love", emoji: "\u{2764}\uFE0F", color: "#ec4899", colorDark: "#be185d",
    bg: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 40%, #fbcfe844 100%)",
    bgSolid: "#fdf2f8",
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
    id: "shame", label: "Shame", emoji: "\u{1F636}", color: "#a855f7", colorDark: "#7c3aed",
    bg: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 40%, #e9d5ff44 100%)",
    bgSolid: "#faf5ff",
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
    id: "disgust", label: "Disgust", emoji: "\u{1F922}", color: "#22c55e", colorDark: "#15803d",
    bg: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 40%, #bbf7d044 100%)",
    bgSolid: "#f0fdf4",
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

/* Burst particles on selection */
function SelectionBurst({ color, active }: { color: string; active: boolean }) {
  if (!active) return null;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * 360;
        const dist = 80 + Math.random() * 60;
        return (
          <div
            key={i}
            className="demo-burst-dot absolute left-1/2 top-1/2"
            style={{
              width: 6 + Math.random() * 6,
              height: 6 + Math.random() * 6,
              borderRadius: "50%",
              background: color,
              opacity: 0.6 + Math.random() * 0.4,
              ["--burst-x" as string]: `${Math.cos((angle * Math.PI) / 180) * dist}px`,
              ["--burst-y" as string]: `${Math.sin((angle * Math.PI) / 180) * dist}px`,
              animationDelay: `${i * 20}ms`,
            }}
          />
        );
      })}
    </div>
  );
}

function DemoEmotionExplorer() {
  const [tier, setTier] = useState<"primary" | "secondary" | "tertiary">("primary");
  const [activePrimary, setActivePrimary] = useState<DemoEmotionType | null>(null);
  const [activeSecondary, setActiveSecondary] = useState<DemoChild | null>(null);
  const [selectedTertiary, setSelectedTertiary] = useState<DemoGrandchild | null>(null);
  const [animKey, setAnimKey] = useState(0);
  const [burstKey, setBurstKey] = useState(0);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const completed = !!selectedTertiary;
  const activeColor = activePrimary?.color || "#6366f1";
  const activeColorDark = activePrimary?.colorDark || "#4338ca";

  const reset = useCallback(() => {
    setTier("primary");
    setActivePrimary(null);
    setActiveSecondary(null);
    setSelectedTertiary(null);
    setAnimKey(k => k + 1);
    setHoveredIdx(null);
  }, []);

  const pickPrimary = (e: DemoEmotionType) => {
    setActivePrimary(e);
    setActiveSecondary(null);
    setSelectedTertiary(null);
    setTier("secondary");
    setAnimKey(k => k + 1);
    setBurstKey(k => k + 1);
    setHoveredIdx(null);
  };

  const pickSecondary = (c: DemoChild) => {
    setActiveSecondary(c);
    setSelectedTertiary(null);
    setTier("tertiary");
    setAnimKey(k => k + 1);
    setBurstKey(k => k + 1);
  };

  const pickTertiary = (c: DemoGrandchild) => {
    setSelectedTertiary(c);
    setAnimKey(k => k + 1);
    setBurstKey(k => k + 1);
  };

  const goBack = () => {
    if (completed) { setSelectedTertiary(null); setTier("tertiary"); setAnimKey(k => k + 1); return; }
    if (tier === "tertiary") { setActiveSecondary(null); setTier("secondary"); setAnimKey(k => k + 1); return; }
    if (tier === "secondary") { reset(); return; }
  };

  const crumbs: { emoji: string; label: string; onClick?: () => void }[] = [];
  if (activePrimary) crumbs.push({ emoji: activePrimary.emoji, label: activePrimary.label, onClick: () => { setActiveSecondary(null); setSelectedTertiary(null); setTier("secondary"); setAnimKey(k => k + 1); } });
  if (activeSecondary) crumbs.push({ emoji: activeSecondary.emoji, label: activeSecondary.label, onClick: () => { setSelectedTertiary(null); setTier("tertiary"); setAnimKey(k => k + 1); } });
  if (selectedTertiary) crumbs.push({ emoji: selectedTertiary.emoji, label: selectedTertiary.label });

  return (
    <div className="relative rounded-3xl overflow-hidden" style={{ boxShadow: `0 25px 60px -12px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)` }}>

      {/* ── Immersive background ── */}
      <div
        className="absolute inset-0 transition-all duration-700 ease-out"
        style={{
          background: tier === "primary"
            ? "linear-gradient(135deg, #fafbff 0%, #f0f2f8 30%, #e8eaf5 60%, #f5f3ff 100%)"
            : activePrimary?.bg || "",
        }}
      />
      {/* Animated mesh overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="demo-mesh-blob absolute" style={{ width: 400, height: 400, top: "-15%", right: "-10%", background: `radial-gradient(circle, ${activeColor}14 0%, transparent 65%)`, filter: "blur(60px)" }} />
        <div className="demo-mesh-blob-2 absolute" style={{ width: 350, height: 350, bottom: "-10%", left: "-8%", background: `radial-gradient(circle, ${activeColor}10 0%, transparent 65%)`, filter: "blur(50px)" }} />
        <div className="demo-mesh-blob-3 absolute" style={{ width: 200, height: 200, top: "30%", left: "50%", background: `radial-gradient(circle, ${activeColor}0c 0%, transparent 65%)`, filter: "blur(40px)" }} />
        {/* Floating micro-particles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="demo-micro-particle absolute rounded-full"
            style={{
              width: 3 + (i % 3) * 2,
              height: 3 + (i % 3) * 2,
              left: `${12 + i * 11}%`,
              top: `${15 + (i * 17) % 70}%`,
              background: `${activeColor}${20 + (i % 3) * 10}`,
              animationDelay: `${i * 1.5}s`,
              animationDuration: `${8 + i * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Burst particles */}
      <SelectionBurst key={burstKey} color={activeColor} active={tier !== "primary"} />

      {/* ── Content ── */}
      <div className="relative z-10">

        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-2.5">
          <div className="flex items-center gap-4">
            {tier !== "primary" && (
              <button onClick={goBack} className="demo-fade-in flex items-center gap-1 text-xs font-medium transition-colors cursor-pointer" style={{ color: `${activeColor}99` }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
            )}
            {crumbs.length > 0 && (
              <div className="flex items-center gap-1.5 demo-fade-in">
                {crumbs.map((crumb, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    {i > 0 && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={`${activeColor}40`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
                    )}
                    <button
                      onClick={crumb.onClick}
                      disabled={!crumb.onClick}
                      className="flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-0.5 transition-all"
                      style={{ color: activeColor, cursor: crumb.onClick ? "pointer" : "default", background: i === crumbs.length - 1 ? `${activeColor}12` : "transparent" }}
                    >
                      {crumb.emoji} {crumb.label}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#22c55e", boxShadow: "0 0 6px #22c55e88" }} />
            <span className="text-[10px] font-medium text-muted-foreground/50">Live</span>
            {tier !== "primary" && (
              <button onClick={reset} className="text-[10px] font-medium text-muted-foreground/40 hover:text-foreground ml-2 cursor-pointer transition-colors">
                Reset
              </button>
            )}
          </div>
        </div>

        {/* ── PRIMARY: The big grid ── */}
        {tier === "primary" && (
          <div key={`p-${animKey}`} className="px-5 pt-6 pb-10 md:px-8 md:pt-10 md:pb-14">
            <div className="text-center mb-8">
              <p className="text-xl md:text-2xl font-serif text-foreground/80 mb-1">How are you feeling?</p>
              <p className="text-xs text-muted-foreground/50">Tap to explore</p>
            </div>
            <div className="grid grid-cols-4 gap-3 sm:gap-4 max-w-lg mx-auto">
              {DEMO_EMOTIONS.map((emotion, i) => (
                <button
                  key={emotion.id}
                  onClick={() => pickPrimary(emotion)}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className="demo-card-enter group relative flex flex-col items-center justify-center rounded-2xl sm:rounded-3xl cursor-pointer transition-all duration-300"
                  style={{
                    aspectRatio: "1",
                    background: `linear-gradient(145deg, ${emotion.bgSolid} 0%, white 100%)`,
                    border: `2px solid ${emotion.color}${hoveredIdx === i ? "55" : "18"}`,
                    boxShadow: hoveredIdx === i
                      ? `0 12px 32px ${emotion.color}25, 0 0 0 4px ${emotion.color}10, inset 0 1px 0 rgba(255,255,255,0.8)`
                      : `0 2px 12px ${emotion.color}10, inset 0 1px 0 rgba(255,255,255,0.6)`,
                    transform: hoveredIdx === i ? "translateY(-4px) scale(1.05)" : hoveredIdx !== null ? "scale(0.97)" : "",
                    opacity: hoveredIdx !== null && hoveredIdx !== i ? 0.6 : 1,
                    animationDelay: `${i * 50}ms`,
                  }}
                >
                  {/* Glow ring on hover */}
                  <div
                    className="absolute inset-0 rounded-2xl sm:rounded-3xl transition-opacity duration-300"
                    style={{
                      opacity: hoveredIdx === i ? 1 : 0,
                      background: `radial-gradient(circle at 50% 40%, ${emotion.color}15 0%, transparent 70%)`,
                    }}
                  />
                  <span className="relative text-4xl sm:text-5xl md:text-[3.5rem] transition-transform duration-300 will-change-transform group-active:scale-90 select-none" style={{ transform: hoveredIdx === i ? "scale(1.15)" : "", filter: hoveredIdx === i ? `drop-shadow(0 4px 12px ${emotion.color}40)` : "" }}>
                    {emotion.emoji}
                  </span>
                  <span className="relative text-[10px] sm:text-xs font-bold mt-1.5 tracking-wide transition-colors duration-200" style={{ color: hoveredIdx === i ? emotion.colorDark : `${emotion.color}cc` }}>
                    {emotion.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── SECONDARY: Emotion hero + children ── */}
        {tier === "secondary" && activePrimary && (
          <div key={`s-${animKey}`} className="px-5 pt-4 pb-10 md:px-8 md:pb-14">
            {/* Big emotion hero */}
            <div className="text-center mb-8 demo-fade-in">
              <span className="text-6xl md:text-7xl block mb-3" style={{ filter: `drop-shadow(0 6px 20px ${activeColor}30)` }}>{activePrimary.emoji}</span>
              <p className="text-lg md:text-xl font-serif italic leading-relaxed max-w-xs mx-auto" style={{ color: activeColorDark }}>
                {activePrimary.question}
              </p>
            </div>
            {/* Children */}
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
              {activePrimary.children.map((child, i) => (
                <button
                  key={child.id}
                  onClick={() => pickSecondary(child)}
                  className="demo-card-enter group relative flex items-center gap-3 p-4 sm:p-5 rounded-2xl cursor-pointer transition-all duration-250 text-left"
                  style={{
                    background: "rgba(255,255,255,0.85)",
                    backdropFilter: "blur(8px)",
                    border: `2px solid ${activeColor}18`,
                    boxShadow: `0 2px 12px ${activeColor}08`,
                    animationDelay: `${i * 70 + 150}ms`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${activeColor}40`;
                    e.currentTarget.style.boxShadow = `0 12px 28px ${activeColor}18, 0 0 0 3px ${activeColor}08`;
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.background = `rgba(255,255,255,0.95)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${activeColor}18`;
                    e.currentTarget.style.boxShadow = `0 2px 12px ${activeColor}08`;
                    e.currentTarget.style.transform = "";
                    e.currentTarget.style.background = `rgba(255,255,255,0.85)`;
                  }}
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 group-active:scale-90" style={{ background: `${activeColor}12` }}>
                    <span className="text-2xl">{child.emoji}</span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-foreground block">{child.label}</span>
                    <span className="text-[10px] font-medium" style={{ color: `${activeColor}88` }}>{child.children.length} feelings inside</span>
                  </div>
                  <svg className="ml-auto shrink-0 opacity-30 group-hover:opacity-60 transition-all duration-200 group-hover:translate-x-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={activeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── TERTIARY: Final picks ── */}
        {tier === "tertiary" && activeSecondary && !completed && (
          <div key={`t-${animKey}`} className="px-5 pt-4 pb-10 md:px-8 md:pb-14">
            <div className="text-center mb-8 demo-fade-in">
              <span className="text-5xl md:text-6xl block mb-3" style={{ filter: `drop-shadow(0 4px 16px ${activeColor}25)` }}>{activeSecondary.emoji}</span>
              <p className="text-base md:text-lg font-serif italic" style={{ color: activeColorDark }}>
                Which one hits closest?
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 max-w-md mx-auto">
              {activeSecondary.children.map((child, i) => (
                <button
                  key={child.id}
                  onClick={() => pickTertiary(child)}
                  className="demo-card-enter group flex items-center gap-3 px-6 py-4 rounded-2xl cursor-pointer transition-all duration-250"
                  style={{
                    background: "rgba(255,255,255,0.85)",
                    backdropFilter: "blur(8px)",
                    border: `2px solid ${activeColor}18`,
                    boxShadow: `0 2px 12px ${activeColor}08`,
                    animationDelay: `${i * 80 + 150}ms`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${activeColor}45`;
                    e.currentTarget.style.boxShadow = `0 10px 24px ${activeColor}20, 0 0 0 3px ${activeColor}08`;
                    e.currentTarget.style.transform = "translateY(-3px) scale(1.03)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${activeColor}18`;
                    e.currentTarget.style.boxShadow = `0 2px 12px ${activeColor}08`;
                    e.currentTarget.style.transform = "";
                  }}
                >
                  <span className="text-2xl sm:text-3xl transition-transform duration-200 group-hover:scale-110 group-active:scale-90">{child.emoji}</span>
                  <span className="text-sm sm:text-base font-bold text-foreground">{child.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── COMPLETED ── */}
        {completed && (
          <div key={`done-${animKey}`} className="px-5 pt-4 pb-10 md:px-8 md:pb-14 demo-fade-in">
            {/* Big celebration */}
            <div className="text-center mb-2">
              <div className="demo-celebration-emoji inline-block text-7xl md:text-8xl mb-4" style={{ filter: `drop-shadow(0 8px 24px ${activeColor}35)` }}>
                {selectedTertiary?.emoji}
              </div>
              <p className="text-2xl md:text-3xl font-serif font-medium text-foreground mb-2">
                {selectedTertiary?.label}
              </p>
            </div>

            {/* Journey path */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {crumbs.map((crumb, i) => (
                <div key={i} className="flex items-center gap-2">
                  {i > 0 && (
                    <div className="w-6 h-0.5 rounded-full" style={{ background: `linear-gradient(90deg, ${activeColor}20, ${activeColor}50)` }} />
                  )}
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: `${activeColor}${i === crumbs.length - 1 ? "18" : "0a"}`, color: activeColor }}>
                    {crumb.emoji} {crumb.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Callout */}
            <div className="max-w-sm mx-auto rounded-2xl p-4 mb-6" style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)", border: `1px solid ${activeColor}15` }}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white" style={{ background: activeColor }}>C</div>
                <div>
                  <p className="text-xs font-semibold text-foreground mb-0.5">Clinician sees this in real-time</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">Every selection syncs live, opening the door for deeper conversation right when it matters.</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 text-sm font-bold px-7 py-3 rounded-full transition-all duration-250 hover:-translate-y-0.5 cursor-pointer"
                style={{
                  background: `linear-gradient(135deg, ${activeColor} 0%, ${activeColorDark} 100%)`,
                  color: "white",
                  boxShadow: `0 6px 20px ${activeColor}35, inset 0 1px 0 rgba(255,255,255,0.2)`,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/></svg>
                Try another
              </button>
            </div>
          </div>
        )}

        {/* ── Bottom bar ── */}
        <div className="flex items-center justify-between px-5 py-2.5" style={{ background: "rgba(255,255,255,0.5)", backdropFilter: "blur(4px)" }}>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-1.5">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white ring-2 ring-white" style={{ background: activeColor }}>C</div>
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ring-2 ring-white" style={{ background: `${activeColor}30`, color: activeColor }}>P</div>
            </div>
            <span className="text-[10px] text-muted-foreground/40">2 in session</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-muted-foreground/30">170 emotions</span>
            <span className="text-[10px] text-muted-foreground/30">&middot;</span>
            <span className="text-[10px] text-muted-foreground/30">3 tiers</span>
            <span className="text-[10px] text-muted-foreground/30">&middot;</span>
            <span className="text-[10px] text-muted-foreground/30">real-time sync</span>
          </div>
        </div>

      </div>

      {/* Inline keyframes */}
      <style>{`
        .demo-mesh-blob { animation: demo-mesh-1 18s ease-in-out infinite; }
        .demo-mesh-blob-2 { animation: demo-mesh-2 22s ease-in-out infinite; }
        .demo-mesh-blob-3 { animation: demo-mesh-3 14s ease-in-out infinite; }
        @keyframes demo-mesh-1 { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(-30px, 25px) scale(1.15); } 66% { transform: translate(20px, -15px) scale(0.95); } }
        @keyframes demo-mesh-2 { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(25px, -20px) scale(1.1); } 66% { transform: translate(-15px, 30px) scale(0.9); } }
        @keyframes demo-mesh-3 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-20px, -25px) scale(1.2); } }
        .demo-micro-particle { animation: demo-drift linear infinite; }
        @keyframes demo-drift { 0% { transform: translateY(0) translateX(0); opacity: 0; } 10% { opacity: 0.4; } 90% { opacity: 0.4; } 100% { transform: translateY(-80px) translateX(20px); opacity: 0; } }
        .demo-card-enter { animation: demo-card-pop 400ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        @keyframes demo-card-pop { 0% { opacity: 0; transform: scale(0.8) translateY(12px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
        .demo-fade-in { animation: demo-fade 350ms ease-out both; }
        @keyframes demo-fade { 0% { opacity: 0; transform: translateY(8px); } 100% { opacity: 1; transform: translateY(0); } }
        .demo-burst-dot { animation: demo-burst 500ms cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        @keyframes demo-burst { 0% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; } 100% { transform: translate(calc(-50% + var(--burst-x)), calc(-50% + var(--burst-y))) scale(0); opacity: 0; } }
        .demo-celebration-emoji { animation: demo-celebrate 600ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        @keyframes demo-celebrate { 0% { transform: scale(0.3) rotate(-10deg); opacity: 0; } 60% { transform: scale(1.1) rotate(3deg); } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
      `}</style>
    </div>
  );
}

/* ── Interactive Demo: Breathing Pacer ── */

const BREATHING_PATTERNS = [
  { id: "box", label: "Box Breathing", phases: [4, 4, 4, 4], color: "#0ea5e9", phaseLabels: ["Breathe in…", "Hold…", "Breathe out…", "Hold…"] },
  { id: "calm478", label: "4-7-8 Calm", phases: [4, 7, 8, 0], color: "#8b5cf6", phaseLabels: ["Breathe in…", "Hold…", "Breathe out…", ""] },
  { id: "calm55", label: "Calm Breathing", phases: [5, 5, 0, 0], color: "#10b981", phaseLabels: ["Breathe in…", "Breathe out…", "", ""] },
  { id: "energize", label: "Energize", phases: [2, 4, 0, 0], color: "#f59e0b", phaseLabels: ["Breathe in…", "Breathe out…", "", ""] },
] as const;

type BreathingPattern = (typeof BREATHING_PATTERNS)[number];

function DemoBreathingPacer() {
  const [activePattern, setActivePattern] = useState<BreathingPattern>(BREATHING_PATTERNS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState(0);
  const [cycle, setCycle] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const circleRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef(0);
  const phaseStartRef = useRef(0);
  const totalCycles = 4;

  const activePhases = activePattern.phases.filter(p => p > 0) as number[];
  const activeLabels = activePattern.phaseLabels.filter((_, i) => activePattern.phases[i] > 0) as string[];
  const cycleDuration = activePhases.reduce((a: number, b: number) => a + b, 0);

  const reset = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setIsPlaying(false);
    setPhase(0);
    setCycle(1);
    setCompleted(false);
    setCountdown(0);
    setElapsedTime(0);
    if (circleRef.current) circleRef.current.style.transform = "scale(0.6)";
  }, []);

  const selectPattern = (p: BreathingPattern) => {
    reset();
    setActivePattern(p);
  };

  useEffect(() => {
    if (!isPlaying) return;

    let currentPhase = phase;
    let currentCycle = cycle;
    let phaseDuration = activePhases[currentPhase] * 1000;
    phaseStartRef.current = performance.now();
    startTimeRef.current = performance.now() - elapsedTime * 1000;

    const tick = (now: number) => {
      const phaseElapsed = now - phaseStartRef.current;
      const progress = Math.min(phaseElapsed / phaseDuration, 1);
      const totalElapsed = (now - startTimeRef.current) / 1000;
      setElapsedTime(totalElapsed);

      // Determine scale based on phase type
      const isInhale = currentPhase === 0;
      const isExhale = activePhases.length === 2 ? currentPhase === 1 : currentPhase === 2;

      if (circleRef.current) {
        let scale = 0.6;
        if (isInhale) {
          const eased = 0.5 - 0.5 * Math.cos(progress * Math.PI);
          scale = 0.6 + 0.4 * eased;
        } else if (isExhale) {
          const eased = 0.5 - 0.5 * Math.cos(progress * Math.PI);
          scale = 1.0 - 0.4 * eased;
        } else {
          // Hold — keep current
          scale = currentPhase < 2 ? 1.0 : 0.6;
        }
        circleRef.current.style.transform = `scale(${scale})`;
      }

      setCountdown(Math.ceil(activePhases[currentPhase] - phaseElapsed / 1000));

      if (progress >= 1) {
        currentPhase++;
        if (currentPhase >= activePhases.length) {
          currentPhase = 0;
          currentCycle++;
          if (currentCycle > totalCycles) {
            setCompleted(true);
            setIsPlaying(false);
            setPhase(0);
            setCycle(totalCycles);
            return;
          }
          setCycle(currentCycle);
        }
        setPhase(currentPhase);
        phaseDuration = activePhases[currentPhase] * 1000;
        phaseStartRef.current = now;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, activePattern]);

  const progressAngle = isPlaying || completed
    ? ((cycle - 1) * cycleDuration * 1000 + (completed ? cycleDuration * 1000 : 0)) / (totalCycles * cycleDuration * 1000) * 360
    : 0;

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <div className="relative rounded-3xl overflow-hidden" style={{ boxShadow: "0 25px 60px -12px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)" }}>
      {/* Background */}
      <div className="absolute inset-0 transition-all duration-700 ease-out" style={{
        background: `linear-gradient(135deg, ${activePattern.color}08 0%, ${activePattern.color}12 50%, ${activePattern.color}06 100%)`,
      }} />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="demo-mesh-blob absolute" style={{ width: 400, height: 400, top: "-15%", right: "-10%", background: `radial-gradient(circle, ${activePattern.color}14 0%, transparent 65%)`, filter: "blur(60px)" }} />
        <div className="demo-mesh-blob-2 absolute" style={{ width: 350, height: 350, bottom: "-10%", left: "-8%", background: `radial-gradient(circle, ${activePattern.color}10 0%, transparent 65%)`, filter: "blur(50px)" }} />
      </div>

      <div className="relative z-10">
        {/* Pattern selector */}
        <div className="flex items-center justify-center gap-2 px-4 pt-5 pb-2 flex-wrap">
          {BREATHING_PATTERNS.map(p => (
            <button
              key={p.id}
              onClick={() => selectPattern(p)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer"
              style={{
                background: activePattern.id === p.id ? `${p.color}18` : "rgba(255,255,255,0.6)",
                color: activePattern.id === p.id ? p.color : "#666",
                border: `1.5px solid ${activePattern.id === p.id ? `${p.color}40` : "transparent"}`,
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Breathing circle */}
        <div className="flex flex-col items-center justify-center px-5 pt-6 pb-4 md:pt-10 md:pb-6">
          {!completed ? (
            <>
              <div className="relative" style={{ width: 200, height: 200 }}>
                {/* SVG progress ring */}
                <svg className="absolute inset-0" width="200" height="200" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="92" fill="none" stroke={`${activePattern.color}15`} strokeWidth="4" />
                  <circle
                    cx="100" cy="100" r="92"
                    fill="none"
                    stroke={activePattern.color}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 92}`}
                    strokeDashoffset={`${2 * Math.PI * 92 * (1 - progressAngle / 360)}`}
                    style={{ transform: "rotate(-90deg)", transformOrigin: "center", transition: "stroke-dashoffset 0.3s ease" }}
                  />
                </svg>
                {/* Breathing circle */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    ref={circleRef}
                    className="flex flex-col items-center justify-center rounded-full"
                    style={{
                      width: 160,
                      height: 160,
                      background: `radial-gradient(circle at 40% 35%, ${activePattern.color}30 0%, ${activePattern.color}18 60%, ${activePattern.color}08 100%)`,
                      border: `2px solid ${activePattern.color}25`,
                      transform: "scale(0.6)",
                      transition: isPlaying ? "none" : "transform 0.5s ease",
                    }}
                  >
                    <span className="text-2xl font-bold" style={{ color: activePattern.color }}>
                      {isPlaying ? countdown : ""}
                    </span>
                    <span className="text-xs font-medium mt-1" style={{ color: `${activePattern.color}aa` }}>
                      {isPlaying ? activeLabels[phase] : "Ready"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <button
                onClick={() => {
                  if (isPlaying) {
                    cancelAnimationFrame(rafRef.current);
                    setIsPlaying(false);
                  } else {
                    setIsPlaying(true);
                  }
                }}
                className="mt-6 flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all hover:-translate-y-0.5 cursor-pointer"
                style={{
                  background: `linear-gradient(135deg, ${activePattern.color} 0%, ${activePattern.color}cc 100%)`,
                  color: "white",
                  boxShadow: `0 6px 20px ${activePattern.color}35`,
                }}
              >
                {isPlaying ? (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg> Pause</>
                ) : (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg> {elapsedTime > 0 ? "Resume" : "Start"}</>
                )}
              </button>

              {/* Cycle counter */}
              <p className="mt-3 text-xs font-medium" style={{ color: `${activePattern.color}80` }}>
                Cycle {cycle} of {totalCycles}
              </p>
            </>
          ) : (
            /* Completion state */
            <div className="text-center demo-fade-in py-6">
              <div className="text-6xl mb-4">✨</div>
              <p className="text-xl font-serif font-medium text-foreground mb-2">Well done</p>
              <p className="text-sm text-muted-foreground mb-6">
                {totalCycles} cycles · {formatTime(elapsedTime)} total
              </p>
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 text-sm font-bold px-6 py-2.5 rounded-full transition-all hover:-translate-y-0.5 cursor-pointer"
                style={{
                  background: `linear-gradient(135deg, ${activePattern.color} 0%, ${activePattern.color}cc 100%)`,
                  color: "white",
                  boxShadow: `0 6px 20px ${activePattern.color}35`,
                }}
              >
                Try another pattern
              </button>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between px-5 py-2.5" style={{ background: "rgba(255,255,255,0.5)", backdropFilter: "blur(4px)" }}>
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#22c55e", boxShadow: "0 0 6px #22c55e88" }} />
            <span className="text-[10px] font-medium text-muted-foreground/50">Live</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-muted-foreground/30">4 patterns</span>
            <span className="text-[10px] text-muted-foreground/30">&middot;</span>
            <span className="text-[10px] text-muted-foreground/30">guided pacing</span>
            <span className="text-[10px] text-muted-foreground/30">&middot;</span>
            <span className="text-[10px] text-muted-foreground/30">real-time sync</span>
          </div>
        </div>
      </div>

      <style>{`
        .demo-mesh-blob { animation: demo-mesh-1 18s ease-in-out infinite; }
        .demo-mesh-blob-2 { animation: demo-mesh-2 22s ease-in-out infinite; }
        @keyframes demo-mesh-1 { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(-30px, 25px) scale(1.15); } 66% { transform: translate(20px, -15px) scale(0.95); } }
        @keyframes demo-mesh-2 { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(25px, -20px) scale(1.1); } 66% { transform: translate(-15px, 30px) scale(0.9); } }
        .demo-fade-in { animation: demo-fade 350ms ease-out both; }
        @keyframes demo-fade { 0% { opacity: 0; transform: translateY(8px); } 100% { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

/* ── Interactive Demo: Coping Deck ── */

const COPING_CATEGORIES = [
  { id: "grounding", label: "Grounding", color: "#22c55e" },
  { id: "breathing", label: "Breathing", color: "#0ea5e9" },
  { id: "movement", label: "Movement", color: "#f97316" },
  { id: "cognitive", label: "Cognitive", color: "#8b5cf6" },
  { id: "sensory", label: "Sensory", color: "#ec4899" },
  { id: "social", label: "Social", color: "#14b8a6" },
] as const;

type CopingCategory = (typeof COPING_CATEGORIES)[number]["id"];

interface CopingCard {
  id: string;
  name: string;
  emoji: string;
  category: CopingCategory;
  description: string;
  tryWhen: string;
}

const COPING_CARDS: CopingCard[] = [
  { id: "54321", name: "5-4-3-2-1", emoji: "🖐️", category: "grounding", description: "Name 5 things you see, 4 you hear, 3 you can touch, 2 you smell, and 1 you taste.", tryWhen: "You feel detached or dissociated from the present moment." },
  { id: "ice-cube", name: "Ice Cube Hold", emoji: "🧊", category: "grounding", description: "Hold an ice cube and focus on the intense sensation. Notice temperature, texture, and the water forming.", tryWhen: "Emotions feel overwhelming and you need a quick anchor." },
  { id: "name-it", name: "Name It to Tame It", emoji: "🏷️", category: "grounding", description: "Label your emotion out loud: 'I notice I'm feeling anxious.' Naming activates the prefrontal cortex.", tryWhen: "Big feelings are taking over and you need some distance." },
  { id: "tree-roots", name: "Tree Roots", emoji: "🌳", category: "grounding", description: "Stand firm, imagine roots growing from your feet deep into the earth. Feel gravity holding you steady.", tryWhen: "You feel unsteady, shaky, or like things are spinning." },
  { id: "square-breath", name: "Square Breathing", emoji: "⬜", category: "breathing", description: "Inhale 4 counts, hold 4, exhale 4, hold 4. Repeat. The equal rhythm calms the nervous system.", tryWhen: "Anxiety is building and you need a structured reset." },
  { id: "belly-breath", name: "Belly Breathing", emoji: "🫁", category: "breathing", description: "Place a hand on your belly. Breathe in through your nose so your belly rises, then slowly exhale.", tryWhen: "You're breathing shallow and fast, or feel chest tightness." },
  { id: "mindful-walk", name: "Mindful Walk", emoji: "🚶", category: "movement", description: "Walk slowly and deliberately. Notice each foot lifting, moving, placing. Feel the ground beneath you.", tryWhen: "You're restless or stuck in your head and need to move." },
  { id: "squeeze-release", name: "Squeeze & Release", emoji: "✊", category: "movement", description: "Tense a muscle group for 5 seconds, then release. Work through hands, arms, shoulders, face.", tryWhen: "Your body feels tight or you're holding tension you can't let go of." },
  { id: "butterfly-taps", name: "Butterfly Taps", emoji: "🦋", category: "movement", description: "Cross arms over chest and alternately tap shoulders. The bilateral stimulation soothes the nervous system.", tryWhen: "You feel activated or distressed and need bilateral calming." },
  { id: "thought-record", name: "Thought Record", emoji: "📝", category: "cognitive", description: "Write the situation, automatic thought, emotion, evidence for/against, and a balanced alternative thought.", tryWhen: "A negative thought is stuck on repeat and feels absolutely true." },
  { id: "opposite-action", name: "Opposite Action", emoji: "🔄", category: "cognitive", description: "Identify what the emotion urges you to do, then deliberately do the opposite with full commitment.", tryWhen: "Your emotion is pushing you toward an action that won't help." },
  { id: "bwml", name: "Best/Worst/Most Likely", emoji: "📊", category: "cognitive", description: "For a worry, imagine the best outcome, worst outcome, and most likely outcome. Focus on most likely.", tryWhen: "Catastrophic thinking is spiraling and everything feels worst-case." },
  { id: "compassion", name: "Compassionate Script", emoji: "💌", category: "cognitive", description: "Write yourself a letter as you would to a dear friend going through the same situation.", tryWhen: "Your inner critic is loud and you need a kinder voice." },
  { id: "scent", name: "Scent Grounding", emoji: "🌸", category: "sensory", description: "Inhale a strong, pleasant scent — essential oil, coffee, citrus peel. Focus entirely on the aroma.", tryWhen: "You need a quick sensory anchor to the present moment." },
  { id: "music-reset", name: "Music Reset", emoji: "🎵", category: "sensory", description: "Put on a song that matches your desired mood. Close your eyes and let the music guide your state.", tryWhen: "Your emotional state feels stuck and needs a shift." },
  { id: "comfort-object", name: "Comfort Object", emoji: "🧸", category: "sensory", description: "Hold a meaningful object — a smooth stone, soft fabric, or keepsake. Focus on its weight and texture.", tryWhen: "You need physical comfort and something tangible to hold onto." },
  { id: "reach-out", name: "Reach Out", emoji: "📱", category: "social", description: "Send a message or make a call to someone you trust. You don't have to explain — just connect.", tryWhen: "You feel alone and isolation is making things harder." },
  { id: "safe-person", name: "Safe Person List", emoji: "👥", category: "social", description: "Write a list of 3-5 people you can reach in a crisis. Include name, number, and when to call them.", tryWhen: "You want to be prepared before a hard moment arrives." },
];

function DemoCopingDeck() {
  const [activeCategory, setActiveCategory] = useState<CopingCategory | "all">("all");
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffleAnim, setShuffleAnim] = useState(false);
  const touchStartRef = useRef<number>(0);

  const filteredCards = activeCategory === "all"
    ? COPING_CARDS
    : COPING_CARDS.filter(c => c.category === activeCategory);

  const currentCard = filteredCards[cardIndex] || filteredCards[0];
  const catInfo = COPING_CATEGORIES.find(c => c.id === currentCard?.category);
  const catColor = catInfo?.color || "#6366f1";

  const goTo = (idx: number) => {
    setIsFlipped(false);
    setCardIndex(Math.max(0, Math.min(idx, filteredCards.length - 1)));
  };

  const drawRandom = () => {
    setShuffleAnim(true);
    setIsFlipped(false);
    setTimeout(() => {
      const newIdx = Math.floor(Math.random() * filteredCards.length);
      setCardIndex(newIdx);
      setShuffleAnim(false);
    }, 400);
  };

  const handleCategoryChange = (cat: CopingCategory | "all") => {
    setActiveCategory(cat);
    setCardIndex(0);
    setIsFlipped(false);
  };

  const onTouchStart = (e: React.TouchEvent) => { touchStartRef.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartRef.current;
    if (Math.abs(dx) > 50) {
      if (dx < 0 && cardIndex < filteredCards.length - 1) goTo(cardIndex + 1);
      else if (dx > 0 && cardIndex > 0) goTo(cardIndex - 1);
    }
  };

  return (
    <div className="relative rounded-3xl overflow-hidden" style={{ boxShadow: "0 25px 60px -12px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)" }}>
      {/* Background */}
      <div className="absolute inset-0 transition-all duration-700 ease-out" style={{
        background: `linear-gradient(135deg, ${catColor}08 0%, ${catColor}12 50%, ${catColor}06 100%)`,
      }} />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="demo-mesh-blob absolute" style={{ width: 400, height: 400, top: "-15%", right: "-10%", background: `radial-gradient(circle, ${catColor}14 0%, transparent 65%)`, filter: "blur(60px)" }} />
        <div className="demo-mesh-blob-2 absolute" style={{ width: 350, height: 350, bottom: "-10%", left: "-8%", background: `radial-gradient(circle, ${catColor}10 0%, transparent 65%)`, filter: "blur(50px)" }} />
      </div>

      <div className="relative z-10">
        {/* Category filter */}
        <div className="flex items-center justify-center gap-1.5 px-4 pt-5 pb-2 flex-wrap">
          <button
            onClick={() => handleCategoryChange("all")}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all cursor-pointer"
            style={{
              background: activeCategory === "all" ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.6)",
              color: activeCategory === "all" ? "#6366f1" : "#666",
              border: `1.5px solid ${activeCategory === "all" ? "rgba(99,102,241,0.3)" : "transparent"}`,
            }}
          >
            All
          </button>
          {COPING_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all cursor-pointer"
              style={{
                background: activeCategory === cat.id ? `${cat.color}18` : "rgba(255,255,255,0.6)",
                color: activeCategory === cat.id ? cat.color : "#666",
                border: `1.5px solid ${activeCategory === cat.id ? `${cat.color}40` : "transparent"}`,
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Card area */}
        <div className="flex flex-col items-center px-5 pt-4 pb-4 md:pt-6 md:pb-6" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          {/* Card stack */}
          <div className="relative" style={{ width: 280, height: 360, perspective: 800 }}>
            {/* Decorative offset cards */}
            <div className="absolute rounded-2xl" style={{ width: 280, height: 360, top: 8, left: 8, background: `${catColor}08`, border: `1px solid ${catColor}10`, transform: "rotate(3deg)" }} />
            <div className="absolute rounded-2xl" style={{ width: 280, height: 360, top: 4, left: 4, background: `${catColor}0c`, border: `1px solid ${catColor}12`, transform: "rotate(1.5deg)" }} />

            {/* Active card */}
            <div
              onClick={() => setIsFlipped(f => !f)}
              className="absolute cursor-pointer rounded-2xl"
              style={{
                width: 280, height: 360,
                transformStyle: "preserve-3d",
                transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                transform: `${isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"} ${shuffleAnim ? "scale(0.9) rotate(5deg)" : ""}`,
              }}
            >
              {/* Front */}
              <div
                className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-6 text-center"
                style={{
                  backfaceVisibility: "hidden",
                  background: "rgba(255,255,255,0.95)",
                  border: `2px solid ${catColor}25`,
                  boxShadow: `0 8px 30px ${catColor}15`,
                }}
              >
                <span className="text-6xl mb-4">{currentCard?.emoji}</span>
                <h3 className="text-lg font-bold text-foreground mb-2">{currentCard?.name}</h3>
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full mb-6" style={{ background: `${catColor}15`, color: catColor }}>
                  {catInfo?.label}
                </span>
                <p className="text-xs text-muted-foreground/50 mt-auto">Tap to flip</p>
              </div>

              {/* Back */}
              <div
                className="absolute inset-0 rounded-2xl flex flex-col p-6"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  background: "rgba(255,255,255,0.95)",
                  border: `2px solid ${catColor}25`,
                  boxShadow: `0 8px 30px ${catColor}15`,
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">{currentCard?.emoji}</span>
                  <h3 className="text-base font-bold text-foreground">{currentCard?.name}</h3>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed mb-4">{currentCard?.description}</p>
                <div className="rounded-xl p-3 mt-auto" style={{ background: `${catColor}08`, border: `1px solid ${catColor}15` }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: catColor }}>Try this when…</p>
                  <p className="text-xs text-foreground/70 leading-relaxed">{currentCard?.tryWhen}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-4 mt-5">
            <button
              onClick={() => goTo(cardIndex - 1)}
              disabled={cardIndex === 0}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-default"
              style={{ background: "rgba(255,255,255,0.8)", border: `1.5px solid ${catColor}20` }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={catColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <span className="text-xs font-medium text-muted-foreground">
              Card {cardIndex + 1} of {filteredCards.length}
            </span>
            <button
              onClick={() => goTo(cardIndex + 1)}
              disabled={cardIndex >= filteredCards.length - 1}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-default"
              style={{ background: "rgba(255,255,255,0.8)", border: `1.5px solid ${catColor}20` }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={catColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
            </button>
          </div>

          {/* Draw random */}
          <button
            onClick={drawRandom}
            className="mt-3 flex items-center gap-2 text-xs font-bold px-5 py-2 rounded-full transition-all hover:-translate-y-0.5 cursor-pointer"
            style={{
              background: `linear-gradient(135deg, ${catColor} 0%, ${catColor}cc 100%)`,
              color: "white",
              boxShadow: `0 4px 14px ${catColor}30`,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/></svg>
            Draw Random
          </button>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between px-5 py-2.5" style={{ background: "rgba(255,255,255,0.5)", backdropFilter: "blur(4px)" }}>
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#22c55e", boxShadow: "0 0 6px #22c55e88" }} />
            <span className="text-[10px] font-medium text-muted-foreground/50">Live</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-muted-foreground/30">18 strategies</span>
            <span className="text-[10px] text-muted-foreground/30">&middot;</span>
            <span className="text-[10px] text-muted-foreground/30">6 categories</span>
            <span className="text-[10px] text-muted-foreground/30">&middot;</span>
            <span className="text-[10px] text-muted-foreground/30">real-time sync</span>
          </div>
        </div>
      </div>

      <style>{`
        .demo-mesh-blob { animation: demo-mesh-1 18s ease-in-out infinite; }
        .demo-mesh-blob-2 { animation: demo-mesh-2 22s ease-in-out infinite; }
        @keyframes demo-mesh-1 { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(-30px, 25px) scale(1.15); } 66% { transform: translate(20px, -15px) scale(0.95); } }
        @keyframes demo-mesh-2 { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(25px, -20px) scale(1.1); } 66% { transform: translate(-15px, 30px) scale(0.9); } }
        .demo-fade-in { animation: demo-fade 350ms ease-out both; }
        @keyframes demo-fade { 0% { opacity: 0; transform: translateY(8px); } 100% { opacity: 1; transform: translateY(0); } }
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
      if (!res.ok) {
        let message = "Failed to join waitlist";
        try {
          const body = await res.json();
          if (body?.message && typeof body.message === "string") {
            message = body.message;
          }
        } catch {
          // ignore JSON parse errors and use default message
        }
        throw new Error(message);
      }
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
  { name: "Communication Board", desc: "Customizable AAC-style visual communication board for nonverbal or limited-speech clients.", tags: ["SLP", "AAC", "Autism"], emoji: "💬" },
  { name: "Social Story Builder", desc: "Visual storyboard editor for creating personalized social stories.", tags: ["Autism", "Pediatric"], emoji: "📖" },
];

/* ── Demo Tab Switcher ── */

const DEMO_TABS = [
  { id: "emotion" as const, emoji: "🎯", label: "Emotion Explorer", color: "#6366f1", heading: "Go ahead, pick a feeling." },
  { id: "breathing" as const, emoji: "🌬️", label: "Breathing Pacer", color: "#0ea5e9", heading: "Breathe with your client." },
  { id: "coping" as const, emoji: "🃏", label: "Coping Cards", color: "#8b5cf6", heading: "Draw a coping strategy." },
] as const;

type DemoTabId = (typeof DEMO_TABS)[number]["id"];

/* ── Main Component ── */

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeDemo, setActiveDemo] = useState<DemoTabId>("emotion");

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
      <section className="pt-28 md:pt-36 lg:pt-40 pb-16 md:pb-24 lg:pb-28 px-4 sm:px-6 lg:px-10 xl:px-16">
        <div className="max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-medium leading-[1.08] text-foreground mb-6" data-testid="text-hero-heading">
            Therapy tools<br />
            <span className="text-primary">that connect.</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">
            Interactive digital tools for clinicians who want telehealth sessions that actually engage.
          </p>
          <div className="max-w-md mx-auto mb-14">
            <WaitlistForm />
          </div>
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground/50 font-medium">
            <span className="flex items-center gap-1.5"><Shield size={12} className="text-primary/40" /> HIPAA-ready</span>
            <span className="flex items-center gap-1.5"><Lock size={12} className="text-primary/40" /> End-to-end encrypted</span>
            <span className="flex items-center gap-1.5"><Heart size={12} className="text-primary/40" /> Built by a clinician</span>
          </div>
        </div>
      </section>

      {/* ── Interactive Demos ── */}
      <section className="pb-16 md:pb-24 lg:pb-28 px-4 sm:px-6 lg:px-10 xl:px-16" id="features">
        <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto">
          <div className="text-center mb-6 md:mb-8">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary/50 mb-2">See what a session feels like</p>
            <h2 className="text-2xl md:text-3xl font-serif text-foreground">
              {DEMO_TABS.find(t => t.id === activeDemo)?.heading}
            </h2>
          </div>

          {/* Tab pills */}
          <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
            {DEMO_TABS.map(tab => {
              const isActive = activeDemo === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveDemo(tab.id)}
                  className="relative flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer"
                  style={{
                    background: isActive ? `${tab.color}14` : "transparent",
                    color: isActive ? tab.color : "#999",
                    border: `1.5px solid ${isActive ? `${tab.color}30` : "transparent"}`,
                  }}
                >
                  <span>{tab.emoji}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                  {isActive && (
                    <span
                      className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
                      style={{ background: tab.color }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Demo container with enter animation */}
          <div key={activeDemo} className="demo-tab-enter">
            {activeDemo === "emotion" && <DemoEmotionExplorer />}
            {activeDemo === "breathing" && <DemoBreathingPacer />}
            {activeDemo === "coping" && <DemoCopingDeck />}
          </div>
        </div>

        {/* Tab enter animation */}
        <style>{`
          .demo-tab-enter { animation: demoTabIn 400ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
          @keyframes demoTabIn { 0% { opacity: 0; transform: scale(0.97) translateY(10px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
        `}</style>
      </section>

      {/* ── What's Coming ── */}
      <section className="py-20 md:py-28 lg:py-32 px-4 sm:px-6 lg:px-10 xl:px-16">
        <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary/50 mb-2">Coming soon</p>
            <h2 className="text-2xl md:text-3xl font-serif text-foreground mb-3">More tools on the way</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Every tool included with your plan at launch.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            {upcomingTools.map((tool) => (
              <div key={tool.name} className="flex items-start gap-4 p-4 rounded-xl bg-card/60 border border-border/60 hover:border-border transition-colors duration-200" data-testid={`card-tool-${tool.name.toLowerCase().replace(/\s+/g, '-')}`}>
                <span className="text-2xl shrink-0 mt-0.5">{tool.emoji}</span>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-foreground mb-0.5">{tool.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{tool.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quote ── */}
      <section className="py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-10 xl:px-16">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-lg md:text-xl font-serif italic text-foreground/70 leading-relaxed mb-4" data-testid="text-founder-quote">
            "I got tired of boring telehealth sessions, so I built us a digital playroom."
          </p>
          <p className="text-xs text-muted-foreground/50 font-medium uppercase tracking-wider">
            — Licensed Clinical Social Worker &amp; Founder
          </p>
        </div>
      </section>

      {/* ── Bottom Waitlist CTA ── */}
      <section className="py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-10 xl:px-16" id="waitlist">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-xl md:text-2xl font-serif text-foreground mb-2">Be the first to know</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Early supporters get founding member pricing.
          </p>
          <WaitlistForm variant="bottom" />
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/60 py-8 px-4 sm:px-6 lg:px-10 xl:px-16">
        <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LogoMark size="sm" />
            <span className="text-xs text-muted-foreground/50">&copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/login" className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors no-underline" data-testid="link-footer-signin">Sign In</Link>
            <Link href="/privacy" className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors no-underline" data-testid="link-footer-privacy">Privacy</Link>
            <Link href="/terms" className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors no-underline" data-testid="link-footer-terms">Terms</Link>
            <Link href="/cookies" className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors no-underline" data-testid="link-footer-cookies">Cookies</Link>
          </div>
        </div>
        <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto mt-4">
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
