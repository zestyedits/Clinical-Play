import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { TheaterStage } from "./theater-stage";
import { PartPalette } from "./part-palette";
import { PartDetailPanel } from "./part-detail-panel";
import { ClinicianControls } from "./clinician-controls";
import { playTheaterSound } from "@/lib/audio-feedback";

export interface TheaterPartData {
  id: string;
  name: string | null;
  x: number;
  y: number;
  size: string;
  color: string;
  note: string | null;
  isContained: boolean;
  placedBy: string | null;
}

export interface TheaterConnectionData {
  id: string;
  fromPartId: string;
  toPartId: string;
  style: string;
  createdBy: string | null;
}

export interface TheaterSettings {
  frozen: boolean;
  dimInactive: boolean;
  metaphor: string;
  partLimit: number;
}

interface PartsTheaterProps {
  parts: TheaterPartData[];
  connections: TheaterConnectionData[];
  theaterSettings: TheaterSettings;
  isClinician: boolean;
  onAddPart: (name: string | null, color: string, size: string, x: number, y: number) => void;
  onMovePart: (partId: string, x: number, y: number) => void;
  onUpdatePart: (partId: string, fields: Record<string, any>) => void;
  onRemovePart: (partId: string) => void;
  onAddConnection: (fromPartId: string, toPartId: string, style: string) => void;
  onRemoveConnection: (connectionId: string) => void;
  onClear: () => void;
  onUpdateSettings: (updates: Partial<TheaterSettings>) => void;
}

export function PartsTheater({
  parts, connections, theaterSettings, isClinician,
  onAddPart, onMovePart, onUpdatePart, onRemovePart,
  onAddConnection, onRemoveConnection, onClear, onUpdateSettings,
}: PartsTheaterProps) {
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [connectingFromId, setConnectingFromId] = useState<string | null>(null);

  const selectedPart = parts.find(p => p.id === selectedPartId) || null;

  const handleAddPart = useCallback((name: string | null, color: string, size: string) => {
    // Place at center with slight random offset
    const x = 0.5 + (Math.random() - 0.5) * 0.1;
    const y = 0.45 + (Math.random() - 0.5) * 0.1;
    onAddPart(name, color, size, x, y);
    playTheaterSound();
  }, [onAddPart]);

  const handleSelectPart = useCallback((id: string | null) => {
    setSelectedPartId(id);
    setConnectingFromId(null);
  }, []);

  const handleMovePart = useCallback((id: string, x: number, y: number) => {
    onMovePart(id, x, y);
  }, [onMovePart]);

  const handleStartConnection = useCallback((partId: string) => {
    setConnectingFromId(partId);
  }, []);

  const handleCompleteConnection = useCallback((toPartId: string) => {
    if (connectingFromId && connectingFromId !== toPartId) {
      // Check for duplicate
      const exists = connections.some(
        c => (c.fromPartId === connectingFromId && c.toPartId === toPartId) ||
             (c.fromPartId === toPartId && c.toPartId === connectingFromId)
      );
      if (!exists) {
        onAddConnection(connectingFromId, toPartId, "solid");
        playTheaterSound();
      }
    }
    setConnectingFromId(null);
  }, [connectingFromId, connections, onAddConnection]);

  const handleCancelConnection = useCallback(() => {
    setConnectingFromId(null);
  }, []);

  const handleRemovePart = useCallback((partId: string) => {
    // Also remove connections involving this part
    connections
      .filter(c => c.fromPartId === partId || c.toPartId === partId)
      .forEach(c => onRemoveConnection(c.id));
    onRemovePart(partId);
    setSelectedPartId(null);
  }, [connections, onRemoveConnection, onRemovePart]);

  const handleClear = useCallback(() => {
    onClear();
    setSelectedPartId(null);
    setConnectingFromId(null);
  }, [onClear]);

  return (
    <div className="w-full h-full flex flex-col relative bg-gradient-to-b from-[#FAF8F5] via-[#F5F0EA] to-[#EDE8E0]">
      {/* Stage */}
      <div className="flex-1 relative">
        <TheaterStage
          parts={parts}
          connections={connections}
          selectedPartId={selectedPartId}
          connectingFromId={connectingFromId}
          frozen={theaterSettings.frozen}
          dimInactive={theaterSettings.dimInactive}
          metaphor={theaterSettings.metaphor}
          isClinician={isClinician}
          onSelectPart={handleSelectPart}
          onMovePart={handleMovePart}
          onCompleteConnection={handleCompleteConnection}
          onCancelConnection={handleCancelConnection}
        />

        {/* Detail panel */}
        <AnimatePresence>
          {selectedPart && !connectingFromId && (
            <PartDetailPanel
              part={selectedPart}
              metaphor={theaterSettings.metaphor}
              onUpdate={(partId, fields) => onUpdatePart(partId, fields)}
              onRemove={handleRemovePart}
              onStartConnection={handleStartConnection}
              onClose={() => setSelectedPartId(null)}
            />
          )}
        </AnimatePresence>

        {/* Clinician controls */}
        <AnimatePresence>
          {isClinician && (
            <ClinicianControls
              settings={theaterSettings}
              onUpdateSettings={onUpdateSettings}
              onClear={handleClear}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Bottom palette */}
      <PartPalette
        onAddPart={handleAddPart}
        metaphor={theaterSettings.metaphor}
        partCount={parts.length}
        partLimit={theaterSettings.partLimit}
        frozen={theaterSettings.frozen}
        isClinician={isClinician}
      />
    </div>
  );
}
