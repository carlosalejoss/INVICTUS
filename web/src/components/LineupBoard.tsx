"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { assignPair } from "@/app/panel/partidos/actions";

type Position = "REVES" | "DERECHA";
type Player = { id: string; name: string; position: Position | null };
type Slot = "reves" | "derecha";
type SlotState = { reves: string | null; derecha: string | null };

const SLOT_LABEL: Record<Slot, string> = { reves: "Revés", derecha: "Derecha" };

export function LineupBoard({
  fixtureId,
  categories,
  ageRestricted,
  initialSlots,
  availablePlayers,
}: {
  fixtureId: string;
  categories: string[];
  ageRestricted: boolean;
  initialSlots: Record<string, SlotState>;
  availablePlayers: Player[];
}) {
  const router = useRouter();
  const [slots, setSlots] = useState<Record<string, SlotState>>(initialSlots);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const playersById = new Map(availablePlayers.map((p) => [p.id, p]));
  const assignedIds = new Set(
    Object.values(slots)
      .flatMap((s) => [s.reves, s.derecha])
      .filter((v): v is string => Boolean(v))
  );
  const pool = availablePlayers.filter((p) => !assignedIds.has(p.id));
  const poolReves = pool.filter((p) => p.position === "REVES");
  const poolDerecha = pool.filter((p) => p.position === "DERECHA");
  const poolOther = pool.filter((p) => p.position !== "REVES" && p.position !== "DERECHA");

  function findOrigin(playerId: string): { category: string; slot: Slot } | null {
    for (const [category, s] of Object.entries(slots)) {
      if (s.reves === playerId) return { category, slot: "reves" };
      if (s.derecha === playerId) return { category, slot: "derecha" };
    }
    return null;
  }

  function persist(
    category: string,
    slot: Slot,
    playerId: string | null,
    origin?: { category: string; slot: Slot } | null
  ) {
    startTransition(async () => {
      try {
        if (origin && (origin.category !== category || origin.slot !== slot)) {
          await assignPair(fixtureId, origin.category, origin.slot, null);
        }
        await assignPair(fixtureId, category, slot, playerId);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo guardar el cambio.");
        router.refresh();
      }
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    setError(null);
    const { active, over } = event;
    if (!over) return;

    const playerId = String(active.id);
    const player = playersById.get(playerId);
    if (!player) return;

    const origin = findOrigin(playerId);

    if (over.id === "pool") {
      if (!origin) return;
      setSlots((prev) => ({ ...prev, [origin.category]: { ...prev[origin.category], [origin.slot]: null } }));
      persist(origin.category, origin.slot, null);
      return;
    }

    const [category, slot] = String(over.id).split("::") as [string, Slot];
    const expectedPosition: Position = slot === "reves" ? "REVES" : "DERECHA";
    if (player.position && player.position !== expectedPosition) {
      setError(
        `${player.name} juega de ${player.position === "REVES" ? "revés" : "derecha"}; no puede ir en el hueco de ${SLOT_LABEL[slot]}.`
      );
      return;
    }

    setSlots((prev) => {
      const next = { ...prev };
      if (origin) next[origin.category] = { ...next[origin.category], [origin.slot]: null };
      next[category] = { ...next[category], [slot]: playerId };
      return next;
    });

    persist(category, slot, playerId, origin);
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {error && (
        <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
        <PoolPanel poolReves={poolReves} poolDerecha={poolDerecha} poolOther={poolOther} />

        <div className="space-y-4">
          {categories.map((category) => {
            const s = slots[category] ?? { reves: null, derecha: null };
            const revesPlayer = s.reves ? playersById.get(s.reves) ?? null : null;
            const derechaPlayer = s.derecha ? playersById.get(s.derecha) ?? null : null;
            return (
              <div key={category} className="card-surface rounded-2xl p-5">
                <p className="mb-3 font-display text-lg text-gold-100">
                  {category}
                  {ageRestricted && <span className="ml-2 text-xs font-normal text-white/40">mín. combinada requerida</span>}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <SlotDropzone id={`${category}::reves`} label="Revés" player={revesPlayer} />
                  <SlotDropzone id={`${category}::derecha`} label="Derecha" player={derechaPlayer} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DndContext>
  );
}

function PoolPanel({ poolReves, poolDerecha, poolOther }: { poolReves: Player[]; poolDerecha: Player[]; poolOther: Player[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: "pool" });
  return (
    <div
      ref={setNodeRef}
      className={`card-surface rounded-2xl p-5 transition-colors ${isOver ? "border-gold-500/40 bg-gold-500/[0.03]" : ""}`}
    >
      <p className="mb-3 text-xs uppercase tracking-wide text-white/40">Disponibles</p>

      <p className="mb-2 text-xs font-semibold text-sky-300">Revés</p>
      <div className="mb-4 flex flex-wrap gap-2">
        {poolReves.length === 0 && <span className="text-xs text-white/30">—</span>}
        {poolReves.map((p) => (
          <PlayerChip key={p.id} id={p.id} name={p.name} position={p.position} />
        ))}
      </div>

      <p className="mb-2 text-xs font-semibold text-amber-300">Derecha</p>
      <div className="flex flex-wrap gap-2">
        {poolDerecha.length === 0 && <span className="text-xs text-white/30">—</span>}
        {poolDerecha.map((p) => (
          <PlayerChip key={p.id} id={p.id} name={p.name} position={p.position} />
        ))}
      </div>

      {poolOther.length > 0 && (
        <>
          <p className="mb-2 mt-4 text-xs font-semibold text-white/40">Sin posición</p>
          <div className="flex flex-wrap gap-2">
            {poolOther.map((p) => (
              <PlayerChip key={p.id} id={p.id} name={p.name} position={p.position} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function PlayerChip({ id, name, position }: { id: string; name: string; position: Position | null }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`cursor-grab touch-none select-none rounded-lg border px-3 py-2 text-xs font-medium active:cursor-grabbing ${
        isDragging ? "z-50 opacity-50" : ""
      } ${
        position === "REVES"
          ? "border-sky-500/30 bg-sky-500/10 text-sky-200"
          : position === "DERECHA"
            ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
            : "border-white/15 bg-white/5 text-white/70"
      }`}
    >
      {name}
    </div>
  );
}

function SlotDropzone({ id, label, player }: { id: string; label: string; player: Player | null }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[3.5rem] items-center justify-center rounded-lg border-2 border-dashed p-2 text-center transition-colors ${
        isOver ? "border-gold-400 bg-gold-500/10" : "border-white/10"
      }`}
    >
      {player ? <PlayerChip id={player.id} name={player.name} position={player.position} /> : <span className="text-xs text-white/30">{label}</span>}
    </div>
  );
}
