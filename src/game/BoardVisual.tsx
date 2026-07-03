import { Key } from "lucide-react";
import { BOARD_TILES, positionOf, type GameState } from "./state";
import { TEAMS, type TeamId, type Tile } from "./config";
import { indexToCell } from "./positions";

/** The projector-side square board with pawns rendered from shared state. */
export function BoardVisual({
  state,
  animatedPositions,
}: {
  state: GameState;
  /** Optional override positions used during local hop-by-hop animation. */
  animatedPositions?: Record<TeamId, number>;
}) {
  const positions: Record<TeamId, number> = animatedPositions ?? {
    faith: positionOf(state, "faith"),
    soccer: positionOf(state, "soccer"),
  };

  return (
    <div className="flex h-full min-h-0 w-full items-center justify-center rounded-[2rem] bg-board-bg p-2 shadow-[var(--shadow-soft)] sm:p-3">
      <div
        className="relative mx-auto grid aspect-square w-[min(100%,calc(100dvh-2.75rem))] max-w-[1040px]"
        style={{
          gridTemplateRows: "repeat(6, 1fr)",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: "0.5rem",
        }}
      >
        {BOARD_TILES.map((tile) => {
          const { row, col } = indexToCell(tile.index);
          const teamsHere: TeamId[] = (["faith", "soccer"] as TeamId[]).filter(
            (t) => positions[t] === tile.index,
          );
          return (
            <div
              key={tile.index}
              style={{ gridRow: row, gridColumn: col }}
              className="relative"
            >
              <TileCard tile={tile} teams={teamsHere} />
            </div>
          );
        })}

        <div
          style={{ gridRow: "2 / 6", gridColumn: "2 / 6" }}
          className="flex flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-[oklch(0.85_0.12_250)] to-[oklch(0.85_0.14_320)] p-6 text-center text-white shadow-inner"
        >
          <div className="animate-float-slow text-6xl sm:text-7xl">🎲</div>
          <p className="mt-3 text-sm font-semibold uppercase tracking-[0.3em] opacity-90">
            JEBS
          </p>
          <h2 className="mt-1 text-3xl font-bold sm:text-5xl">English Board</h2>
          <p className="mt-3 text-sm opacity-90 sm:text-base">
            Faith vs Soccer — 한 바퀴 완주하면 승리!
          </p>
        </div>
      </div>
    </div>
  );
}

function TileCard({ tile, teams }: { tile: Tile; teams: TeamId[] }) {
  const isKey = tile.kind === "key";
  const tileColors = [
    "bg-[var(--tile-1)]",
    "bg-[var(--tile-2)]",
    "bg-[var(--tile-3)]",
    "bg-[var(--tile-4)]",
  ];
  const bg = isKey ? "bg-key" : tileColors[tile.index % tileColors.length];
  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl ${bg} shadow-sm ring-1 ring-black/5`}
    >
      {isKey ? (
        <Key className="h-1/2 w-1/2 text-white drop-shadow" strokeWidth={2.5} />
      ) : (
        <img
          src={tile.illustration!.src}
          alt={tile.illustration!.hint}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      )}
      <span className="absolute left-1.5 top-1.5 rounded-md bg-black/40 px-1.5 py-0.5 text-[10px] font-bold text-white">
        {tile.index + 1}
      </span>
      {teams.length > 0 && (
        <div className="absolute inset-x-0 bottom-1 flex justify-center gap-1">
          {teams.map((t) => (
            <Pawn key={t} team={t} />
          ))}
        </div>
      )}
    </div>
  );
}

function Pawn({ team }: { team: TeamId }) {
  const color = team === "faith" ? "bg-team-faith" : "bg-team-soccer";
  return (
    <div
      className={`animate-pawn-hop flex h-8 w-8 items-center justify-center rounded-full ${color} text-lg shadow-lg ring-2 ring-white sm:h-10 sm:w-10 sm:text-xl`}
    >
      {TEAMS[team].emoji}
    </div>
  );
}
