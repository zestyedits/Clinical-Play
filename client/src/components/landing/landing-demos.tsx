import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* Shared shell: light content surface + dark footer for WCAG-friendly contrast */

function DemoShell({
  accent,
  bgGradient,
  children,
  footerMeta,
}: {
  accent: string;
  bgGradient: string;
  children: React.ReactNode;
  footerMeta: string;
}) {
  return (
    <div className="relative rounded-3xl overflow-hidden ring-2 ring-slate-300/90 dark:ring-slate-600 shadow-[0_24px_56px_-18px_rgba(15,23,42,0.35)] dark:shadow-[0_24px_56px_-18px_rgba(0,0,0,0.5)]">
      <div className="absolute inset-0 bg-white dark:bg-slate-950" />
      <div className="absolute inset-0 pointer-events-none opacity-90" style={{ background: bgGradient }} />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 100% 70% at 100% 0%, ${accent}28, transparent 55%), radial-gradient(ellipse 80% 60% at 0% 100%, ${accent}18, transparent 50%)`,
        }}
      />
      <div className="relative z-10 text-slate-900 dark:text-slate-100">{children}</div>
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 px-4 py-3 bg-slate-900 text-slate-200 border-t border-slate-800">
        <div className="flex items-center gap-2 min-w-0">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">
            Live session preview
          </span>
        </div>
        <p className="text-[10px] text-slate-500 sm:text-right leading-snug">{footerMeta}</p>
      </div>
    </div>
  );
}

/* ── The DBT House (matches in-app metaphor) ── */

const DBT_LAYERS = [
  { id: "foundation", label: "Foundation", sub: "Distress tolerance & crisis skills", emoji: "\u{1F3E0}", color: "#4a6b4f" },
  { id: "living", label: "Living Room", sub: "Mindfulness & emotion regulation", emoji: "\u{1F9F1}", color: "#5d7d62" },
  { id: "study", label: "Study", sub: "Interpersonal effectiveness", emoji: "\u{1F4DA}", color: "#6e8f73" },
  { id: "zen", label: "Zen Space", sub: "Wise Mind & integration", emoji: "\u{2728}", color: "#7faf84" },
] as const;

export function DemoDBTHouse() {
  const [built, setBuilt] = useState(1);

  const addLayer = () => setBuilt((n) => Math.min(n + 1, DBT_LAYERS.length));
  const reset = () => setBuilt(1);

  return (
    <DemoShell
      accent="#3d5c42"
      bgGradient="linear-gradient(165deg, #f0f7f1 0%, #ffffff 45%, #e8f2ea 100%)"
      footerMeta="4 skill floors · prompts inside each room · same flow as the full game"
    >
      <div className="px-5 pt-5 pb-2">
        <div className="flex items-start justify-between gap-3 mb-1">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#2d4a32] dark:text-emerald-300/90">
              Game · The DBT House
            </p>
            <h3 className="text-lg sm:text-xl font-serif font-semibold text-slate-900 dark:text-white mt-0.5">
              Build the house, layer by layer
            </h3>
          </div>
          <button
            type="button"
            onClick={reset}
            className="text-xs font-semibold text-[#2d4a32] dark:text-emerald-300 underline-offset-2 hover:underline shrink-0 cursor-pointer"
          >
            Reset
          </button>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
          Each floor unlocks DBT skills your client explores with you — structured like a game, grounded in clinical DBT.
        </p>
      </div>

      <div className="px-5 py-6 flex flex-col items-center min-h-[280px] sm:min-h-[300px]">
        <div className="relative w-full max-w-[220px] flex flex-col-reverse items-stretch gap-2">
          <AnimatePresence initial={false}>
            {DBT_LAYERS.slice(0, built).map((layer, i) => (
              <motion.div
                key={layer.id}
                layout
                initial={{ opacity: 0, y: 28, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ type: "spring", stiffness: 380, damping: 28, delay: i * 0.04 }}
                className="rounded-xl px-4 py-3 shadow-md border-2 border-white/80 dark:border-slate-700/80"
                style={{
                  background: `linear-gradient(135deg, ${layer.color}e6 0%, ${layer.color}bb 100%)`,
                  boxShadow: `0 8px 24px -6px ${layer.color}66`,
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl drop-shadow-sm" aria-hidden>
                    {layer.emoji}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white leading-tight drop-shadow-sm">{layer.label}</p>
                    <p className="text-[11px] text-white/90 leading-snug">{layer.sub}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-8 flex flex-col items-center gap-2 w-full max-w-xs">
          {built < DBT_LAYERS.length ? (
            <button
              type="button"
              onClick={addLayer}
              className="w-full sm:w-auto min-h-[44px] px-8 rounded-xl text-sm font-bold text-white cursor-pointer transition-transform active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #3d5c42 0%, #2d4a32 100%)",
                boxShadow: "0 10px 28px -8px rgba(45,74,50,0.55)",
              }}
            >
              Add next floor ({built}/{DBT_LAYERS.length})
            </button>
          ) : (
            <p className="text-sm font-semibold text-[#2d4a32] dark:text-emerald-300 text-center">
              Wise Mind unlocked — explore prompts in each room in session.
            </p>
          )}
        </div>
      </div>
    </DemoShell>
  );
}

/* ── The Anxiety Ladder (exposure hierarchy) ── */

const LADDER_STEPS = [
  { label: "Read the email subject line", suds: 25 },
  { label: "Open the message", suds: 45 },
  { label: "Draft a two-sentence reply", suds: 60 },
  { label: "Send to a trusted person first", suds: 75 },
  { label: "Send the real reply", suds: 90 },
] as const;

export function DemoAnxietyLadder() {
  const [active, setActive] = useState(0);

  return (
    <DemoShell
      accent="#1d4ed8"
      bgGradient="linear-gradient(165deg, #eff6ff 0%, #ffffff 50%, #dbeafe 100%)"
      footerMeta="SUDS ratings · gradual steps · full ladder editor in the playroom"
    >
      <div className="px-5 pt-5 pb-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">
          Game · The Anxiety Ladder
        </p>
        <h3 className="text-lg sm:text-xl font-serif font-semibold text-slate-900 dark:text-white mt-0.5">
          Climb one rung at a time
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed max-w-xl">
          Clients rank steps, track distress, and plan exposures — visual hierarchy, not a static worksheet.
        </p>
      </div>

      <div className="px-5 py-6">
        <div className="max-w-md mx-auto relative pl-8">
          <div
            className="absolute left-[15px] top-3 bottom-3 w-1 rounded-full bg-blue-200 dark:bg-blue-900"
            aria-hidden
          />
          <ul className="space-y-3">
            {LADDER_STEPS.map((step, i) => {
              const isOn = i === active;
              return (
                <li key={step.label} className="relative">
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    className={`w-full text-left rounded-xl border-2 pl-4 pr-3 py-3 transition-all cursor-pointer ${
                      isOn
                        ? "border-blue-600 bg-white dark:bg-slate-900 shadow-lg ring-2 ring-blue-500/25"
                        : "border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="absolute -left-6 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md"
                        style={{
                          background: isOn ? "#1d4ed8" : "#94a3b8",
                        }}
                      >
                        {i + 1}
                      </span>
                      <p className={`text-sm font-semibold flex-1 ${isOn ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"}`}>
                        {step.label}
                      </p>
                      <span
                        className={`text-xs font-bold tabular-nums px-2 py-1 rounded-lg shrink-0 ${
                          isOn ? "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        SUDS {step.suds}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-5">
          Tap a rung to highlight the step you&apos;re processing in session.
        </p>
      </div>
    </DemoShell>
  );
}

/* ── The Thought Court (CBT restructuring) ── */

const COURT_SIDES = {
  prosecution: {
    title: "Hot thought",
    color: "#7f1d1d",
    bg: "#fef2f2",
    bullets: ["I'm going to fail everyone.", "They probably think I'm incompetent.", "I should just disappear."],
  },
  defense: {
    title: "Evidence & balance",
    color: "#14532d",
    bg: "#f0fdf4",
    bullets: ["I've handled hard days before.", "One rough hour ≠ my whole worth.", "I can ask for help — that's skill, not weakness."],
  },
} as const;

export function DemoThoughtCourt() {
  const [side, setSide] = useState<"prosecution" | "defense">("prosecution");

  return (
    <DemoShell
      accent="#5b21b6"
      bgGradient="linear-gradient(165deg, #f5f3ff 0%, #ffffff 50%, #ede9fe 100%)"
      footerMeta="Thought on trial · evidence columns · matches The Thought Court in-app"
    >
      <div className="px-5 pt-5 pb-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-violet-800 dark:text-violet-300">
          Game · The Thought Court
        </p>
        <h3 className="text-lg sm:text-xl font-serif font-semibold text-slate-900 dark:text-white mt-0.5">
          Put the thought on the stand
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed max-w-xl">
          Prosecution vs. defense — your client weighs evidence like a courtroom drama, not a boring worksheet.
        </p>
      </div>

      <div className="px-5 py-5 space-y-4">
        <div className="rounded-xl border-2 border-slate-800/10 dark:border-white/10 bg-slate-50 dark:bg-slate-900/80 px-4 py-3 text-center shadow-inner">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Thought on trial
          </p>
          <p className="text-base font-serif font-medium text-slate-900 dark:text-white">
            &ldquo;If I&apos;m not perfect, I&apos;m a burden.&rdquo;
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {( ["prosecution", "defense"] as const).map((key) => {
            const s = COURT_SIDES[key];
            const on = side === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSide(key)}
                className={`rounded-xl border-2 px-3 py-2.5 text-left transition-all cursor-pointer min-h-[52px] ${
                  on ? "" : "opacity-90 hover:opacity-100"
                }`}
                style={{
                  borderColor: on ? s.color : "rgba(15,23,42,0.12)",
                  background: on ? s.bg : "rgba(248,250,252,0.9)",
                  boxShadow: on ? `0 0 0 2px ${s.color}` : undefined,
                }}
              >
                <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: s.color }}>
                  {s.title}
                </p>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.ul
            key={side}
            initial={{ opacity: 0, x: side === "defense" ? 12 : -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-2 min-h-[120px]"
          >
            {COURT_SIDES[side].bullets.map((line, i) => (
              <motion.li
                key={line}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex gap-2 items-start rounded-lg px-3 py-2.5 text-sm font-medium leading-snug border text-slate-900 dark:text-slate-100"
                style={{
                  background: COURT_SIDES[side].bg,
                  borderColor: `${COURT_SIDES[side].color}33`,
                }}
              >
                <span className="text-lg leading-none shrink-0" aria-hidden>
                  {side === "prosecution" ? "\u2696\uFE0F" : "\u{1F9E0}"}
                </span>
                <span>{line}</span>
              </motion.li>
            ))}
          </motion.ul>
        </AnimatePresence>
      </div>
    </DemoShell>
  );
}
