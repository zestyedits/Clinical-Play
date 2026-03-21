import { useState, useCallback } from "react";
import { HouseCanvas } from "./HouseCanvas";
import { LayerPanel } from "./LayerPanel";
import { PromptDialog } from "./PromptDialog";
import { FeelingsWheel } from "./FeelingsWheel";
import { WelcomeScreen } from "./WelcomeScreen";
import { useAudio } from "../../../lib/stores/useAudio";
import { FurtherReading } from "../shared/FurtherReading";
import { DBT_REFERENCES } from "../shared/references-data";

export interface HouseLayer {
  id: string;
  floor: number;
  name: string;
  subtitle: string;
  icon: string;
  color: string;
  accentColor: string;
  placed: boolean;
  completed: boolean;
  items: LayerItem[];
}

export interface LayerItem {
  id: string;
  name: string;
  icon: string;
  prompt: string;
  image: string;
  completed: boolean;
}

const INITIAL_LAYERS: HouseLayer[] = [
  {
    id: "foundation",
    floor: 0,
    name: "The Foundation",
    subtitle: "Crisis Survival & Distress Tolerance",
    icon: "\u{1F3E0}",
    color: "#8b7d6b",
    accentColor: "#ffaa44",
    placed: false,
    completed: false,
    items: [
      {
        id: "safety-box",
        name: "Safety Box",
        icon: "\u{1F4E6}",
        image: "/images/safety-box.png",
        prompt:
          "TIPP Skills: When in crisis, try Temperature (hold ice), Intense exercise, Paced breathing, or Progressive relaxation. Talk together about which of these strategies feels most accessible right now and why.",
        completed: false,
      },
      {
        id: "grounding-mat",
        name: "Grounding Mat",
        icon: "\u{1F9D8}",
        image: "/images/grounding-mat.png",
        prompt:
          "5-4-3-2-1 Grounding: Try this together \u2014 name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste. Discuss what you noticed and how it changed your focus.",
        completed: false,
      },
      {
        id: "crisis-toolkit",
        name: "Crisis Toolkit",
        icon: "\u{1F9F0}",
        image: "/images/crisis-toolkit.png",
        prompt:
          "Distress Tolerance: Discuss one thing you could do right now to survive a difficult moment without making it worse. Remember: you don\u2019t have to fix everything \u2014 just get through this moment.",
        completed: false,
      },
    ],
  },
  {
    id: "living-room",
    floor: 1,
    name: "The Living Room",
    subtitle: "Mindfulness & Emotional Regulation",
    icon: "\u{1FAB4}",
    color: "#7a8b7a",
    accentColor: "#aaddff",
    placed: false,
    completed: false,
    items: [
      {
        id: "meditation-cushion",
        name: "Meditation Cushion",
        icon: "\u{1F9D8}",
        image: "/images/meditation-cushion.png",
        prompt:
          "Mindfulness Practice: Close your eyes for 30 seconds. Focus only on your breath. When thoughts come, notice them without judgment and return to your breath. Discuss what came up.",
        completed: false,
      },
      {
        id: "stress-ball",
        name: "Stress Ball",
        icon: "\u{1F534}",
        image: "/images/stress-ball.png",
        prompt:
          "Emotion Regulation: On a scale of 1\u201310, how intense is the emotion you\u2019re feeling right now? Can you name it? Emotions are like waves \u2014 they rise and fall. Talk about what wave you\u2019re riding.",
        completed: false,
      },
      {
        id: "feelings-wheel",
        name: "Feelings Wheel",
        icon: "\u{1F3A1}",
        image: "/images/dbt-feelings-wheel.png",
        prompt:
          "Opposite Action: Identify the emotion you\u2019re feeling. Now think of an action that is the OPPOSITE of what that emotion urges you to do. Discuss together what that opposite action might look like.",
        completed: false,
      },
    ],
  },
  {
    id: "study",
    floor: 2,
    name: "The Study",
    subtitle: "Interpersonal Effectiveness",
    icon: "\u{1F4D6}",
    color: "#8b7a6a",
    accentColor: "#ffbb77",
    placed: false,
    completed: false,
    items: [
      {
        id: "mirror",
        name: "Mirror of Validation",
        icon: "\u{1FA9E}",
        image: "/images/mirror.png",
        prompt:
          "Self-Validation: Look at yourself with compassion. Try completing this sentence together: \u2018It makes sense that I feel ___ because ___.\u2019 Validation doesn\u2019t mean agreement \u2014 it means understanding.",
        completed: false,
      },
      {
        id: "dear-man-desk",
        name: "DEAR MAN Desk",
        icon: "\u{1F4DD}",
        image: "/images/dear-man-desk.png",
        prompt:
          "DEAR MAN: Think of a request you need to make. Describe the situation, Express how you feel, Assert what you need, Reinforce why it matters. Practice talking through your script together.",
        completed: false,
      },
      {
        id: "boundary-blocks",
        name: "Boundary Blocks",
        icon: "\u{1F9F1}",
        image: "/images/boundary-blocks.png",
        prompt:
          "FAST Skills: Be Fair to yourself and others, no Apologies for being alive, Stick to your values, be Truthful. Discuss what boundary you might need to set or maintain.",
        completed: false,
      },
    ],
  },
  {
    id: "zen-space",
    floor: 3,
    name: "The Zen Space",
    subtitle: "Reaching Wise Mind",
    icon: "\u{1F33F}",
    color: "#6b8b6b",
    accentColor: "#88ffaa",
    placed: false,
    completed: false,
    items: [
      {
        id: "wise-mind",
        name: "Wise Mind Garden",
        icon: "\u{1F331}",
        image: "/images/wise-mind.png",
        prompt:
          "Wise Mind: Imagine a Venn diagram \u2014 one circle is your Emotional Mind, the other is your Rational Mind. Wise Mind is where they overlap. Talk about what your Wise Mind might be telling you right now.",
        completed: false,
      },
      {
        id: "peace-plant",
        name: "Peace Plant",
        icon: "\u{1F33F}",
        image: "/images/peace-plant.png",
        prompt:
          "Radical Acceptance: \u2018This moment is exactly as it should be.\u2019 Discuss one thing in your life right now that you\u2019re struggling to accept, and what might shift if you practiced acceptance.",
        completed: false,
      },
      {
        id: "gratitude-board",
        name: "Gratitude Board",
        icon: "\u2728",
        image: "/images/gratitude-board.png",
        prompt:
          "Turning the Mind: Think of three things you\u2019re grateful for today, no matter how small. Gratitude is a practice of turning toward what is good, even when things are hard. Share them together.",
        completed: false,
      },
    ],
  },
];

export function DBTHouseBuilder() {
  const [started, setStarted] = useState(false);
  const [layers, setLayers] = useState<HouseLayer[]>(INITIAL_LAYERS);
  const [activePrompt, setActivePrompt] = useState<{
    id: string;
    prompt: string;
    itemName: string;
    image: string;
    alreadyDiscussed: boolean;
  } | null>(null);
  const [feelingsWheelOpen, setFeelingsWheelOpen] = useState(false);
  const { isMuted, toggleMute, playSuccess } = useAudio();

  const nextUnplacedFloor = layers.findIndex((l) => !l.placed);
  const allCompleted = layers.every((l) => l.completed);
  const discussedCount = layers
    .flatMap((l) => l.items)
    .filter((i) => i.completed).length;
  const totalItems = layers.flatMap((l) => l.items).length;

  const handlePlaceLayer = useCallback(
    (layerId: string) => {
      setLayers((prev) =>
        prev.map((l) => (l.id === layerId ? { ...l, placed: true } : l))
      );
      playSuccess();
    },
    [playSuccess]
  );

  const handleItemClick = useCallback(
    (layerId: string, itemId: string) => {
      const layer = layers.find((l) => l.id === layerId);
      if (!layer || !layer.placed) return;
      const item = layer.items.find((i) => i.id === itemId);
      if (!item) return;
      setActivePrompt({
        id: item.id,
        prompt: item.prompt,
        itemName: item.name,
        image: item.image,
        alreadyDiscussed: item.completed,
      });
    },
    [layers]
  );

  const handleMarkDiscussed = useCallback(() => {
    if (!activePrompt) return;
    const itemId = activePrompt.id;
    setLayers((prev) =>
      prev.map((layer) => {
        const updatedItems = layer.items.map((item) =>
          item.id === itemId ? { ...item, completed: true } : item
        );
        const allDone = updatedItems.every((i) => i.completed);
        return { ...layer, items: updatedItems, completed: allDone };
      })
    );
    setActivePrompt(null);
    playSuccess();
  }, [activePrompt, playSuccess]);

  if (!started) {
    return <WelcomeScreen onStart={() => setStarted(true)} />;
  }

  return (
    <div
      data-testid="tool-dbt-house"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background:
          "linear-gradient(170deg, #dce8dc 0%, #c8d8c4 30%, #b8c8b0 60%, #a8bca0 100%)",
        fontFamily: "Inter, sans-serif",
        overflow: "hidden",
        position: "relative",
        borderRadius: 12,
        ["--game-panel-border" as string]: "rgba(160, 146, 107, 0.15)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          background: "rgba(45, 40, 35, 0.92)",
          borderBottom: "1px solid rgba(160, 146, 107, 0.3)",
          zIndex: 10,
          flexShrink: 0,
          backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>{"\u{1F3E1}"}</span>
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#f0e8d8",
                lineHeight: 1.2,
              }}
            >
              The DBT House
            </div>
            <div
              style={{
                fontSize: 10,
                color: "rgba(240, 232, 216, 0.5)",
              }}
            >
              Build your skills, layer by layer
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              fontSize: 11,
              color: "rgba(240, 232, 216, 0.5)",
            }}
          >
            {discussedCount}/{totalItems} discussed
          </div>
          <FurtherReading
            references={DBT_REFERENCES}
            accentColor="rgba(160,146,107,0.6)"
            textColor="#f0e8d8"
            bgColor="rgba(45,40,35,0.97)"
          />
          <button
            onClick={toggleMute}
            data-testid="button-dbt-mute"
            type="button"
            style={{
              background: "rgba(240, 232, 216, 0.1)",
              border: "1px solid rgba(160, 146, 107, 0.3)",
              borderRadius: 8,
              padding: "8px 12px",
              minWidth: 44,
              minHeight: 44,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#f0e8d8",
              fontSize: 16,
              cursor: "pointer",
              boxSizing: "border-box",
            }}
          >
            {isMuted ? "\u{1F507}" : "\u{1F50A}"}
          </button>
        </div>
      </div>

      <div className="tool-game-split">
        <FeelingsWheel
          isOpen={feelingsWheelOpen}
          onToggle={() => setFeelingsWheelOpen((v) => !v)}
        />

        <div className="tool-game-split-canvas">
          <HouseCanvas
            layers={layers}
            onItemClick={handleItemClick}
            allCompleted={allCompleted}
          />
        </div>

        <LayerPanel
          layers={layers}
          nextUnplacedFloor={nextUnplacedFloor}
          onPlaceLayer={handlePlaceLayer}
          onItemClick={handleItemClick}
        />
      </div>

      {activePrompt && (
        <PromptDialog
          prompt={activePrompt.prompt}
          itemName={activePrompt.itemName}
          image={activePrompt.image}
          alreadyDiscussed={activePrompt.alreadyDiscussed}
          onMarkDiscussed={handleMarkDiscussed}
          onDismiss={() => setActivePrompt(null)}
        />
      )}

      {allCompleted && (
        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            background:
              "linear-gradient(135deg, rgba(107, 139, 107, 0.95), rgba(90, 122, 90, 0.95))",
            color: "#f0e8d8",
            padding: "14px 28px",
            borderRadius: 14,
            fontSize: 15,
            fontWeight: 600,
            textAlign: "center",
            boxShadow:
              "0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1) inset",
            zIndex: 5,
            backdropFilter: "blur(10px)",
            whiteSpace: "normal",
            maxWidth: "min(calc(100vw - 32px), 360px)",
            lineHeight: 1.35,
          }}
          data-testid="text-dbt-complete"
        >
          {"\u{1F389}"} Your DBT House is complete! All skills discussed.
        </div>
      )}

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gentlePulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
