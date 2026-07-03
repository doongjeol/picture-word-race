import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { TeamId } from "./config";
import { BOARD_SIZE, MISSIONS, buildBoard } from "./config";

export type ModalState =
  | { kind: "idle" }
  | { kind: "illustration"; tileIndex: number; team: TeamId }
  | { kind: "key"; mission: string; team: TeamId }
  | { kind: "win"; team: TeamId };

export type GameState = {
  faith_pos: number;
  soccer_pos: number;
  current_turn: TeamId;
  last_dice: number | null;
  rolling: boolean;
  modal: ModalState;
  winner: TeamId | null;
  reveal_dice_at: number | null;
};

export const INITIAL_STATE: GameState = {
  faith_pos: 0,
  soccer_pos: 0,
  current_turn: "faith",
  last_dice: null,
  rolling: false,
  modal: { kind: "idle" },
  winner: null,
  reveal_dice_at: null,
};

/** Subscribe to the shared game state row via Supabase Realtime. */
export function useGameState(): { state: GameState | null; loading: boolean } {
  const [state, setState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data } = await supabase
        .from("game_state")
        .select("*")
        .eq("id", 1)
        .maybeSingle();
      if (!mounted) return;
      if (data) setState(rowToState(data));
      setLoading(false);
    };
    void load();

    const channel = supabase
      .channel("game_state_room")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "game_state", filter: "id=eq.1" },
        (payload) => {
          const row = (payload.new ?? payload.old) as Record<string, unknown> | null;
          if (row) setState(rowToState(row));
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      void supabase.removeChannel(channel);
    };
  }, []);

  return { state, loading };
}

function rowToState(row: Record<string, unknown>): GameState {
  const modalRaw = row.modal as ModalState | null;
  return {
    faith_pos: (row.faith_pos as number) ?? 0,
    soccer_pos: (row.soccer_pos as number) ?? 0,
    current_turn: ((row.current_turn as TeamId) ?? "faith") as TeamId,
    last_dice: (row.last_dice as number | null) ?? null,
    rolling: (row.rolling as boolean) ?? false,
    modal: modalRaw && (modalRaw as ModalState).kind ? (modalRaw as ModalState) : { kind: "idle" },
    winner: (row.winner as TeamId | null) ?? null,
    reveal_dice_at: (row.reveal_dice_at as number | null) ?? null,
  };
}

/** Merge patch to the single game state row. */
export async function patchGame(patch: Partial<GameState>) {
  const payload: Record<string, unknown> = { ...patch };
  await supabase.from("game_state").update(payload).eq("id", 1);
}

export async function resetGame() {
  await patchGame({ ...INITIAL_STATE });
}

/** Utility: pick a random mission string. */
export function randomMission(): string {
  return MISSIONS[Math.floor(Math.random() * MISSIONS.length)];
}

/** Board tiles, memo-safe (pure). */
export const BOARD_TILES = buildBoard();

export function positionOf(state: GameState, team: TeamId): number {
  return team === "faith" ? state.faith_pos : state.soccer_pos;
}

export function positionField(team: TeamId): "faith_pos" | "soccer_pos" {
  return team === "faith" ? "faith_pos" : "soccer_pos";
}

export function otherTeam(t: TeamId): TeamId {
  return t === "faith" ? "soccer" : "faith";
}

export { BOARD_SIZE };