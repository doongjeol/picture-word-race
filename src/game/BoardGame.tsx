import { useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { Key, Dices, RotateCcw, Trophy } from "lucide-react";
import { buildBoard, BOARD_SIZE, MISSIONS, TEAMS, type TeamId, type Tile } from "./config";
import { indexToCell } from "./positions";

type Modal =
  | { kind: "idle" }
  | { kind: "illustration"; tile: Tile; team: TeamId }
  | { kind: "key"; mission: string; team: TeamId }
  | { kind: "win"; team: TeamId };

const DICE_FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export default function BoardGame() {
  const tiles = useMemo(() => buildBoard(), []);
  const [positions, setPositions] = useState<Record<TeamId, number>>({ A: 0, B: 0 });
  const [turn, setTurn] = useState<TeamId>("A");
  const [dice, setDice] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [modal, setModal] = useState<Modal>({ kind: "idle" });
  const [busy, setBusy] = useState(false);
  const winFiredRef = useRef(false);

  const nextTurn = () => setTurn((t) => (t === "A" ? "B" : "A"));

  /** Advance a team by `steps`, hopping one tile at a time. */
  const advance = async (team: TeamId, steps: number): Promise<number> => {
    let current = positions[team];
    for (let i = 0; i < steps; i++) {
      current = current + 1;
      const wrapped = current % BOARD_SIZE;
      setPositions((p) => ({ ...p, [team]: wrapped }));
      // if we crossed/landed on start (index 0 after moving), win
      if (current >= BOARD_SIZE) {
        return -1; // sentinel: winner
      }
      await sleep(220);
    }
    return current;
  };

  const triggerWin = (team: TeamId) => {
    if (winFiredRef.current) return;
    winFiredRef.current = true;
    setModal({ kind: "win", team });
    fireConfetti();
  };

  const handleRoll = async () => {
    if (busy || rolling || modal.kind !== "idle") return;
    setBusy(true);
    setRolling(true);
    // spin the dice display
    let spins = 0;
    const spinInterval = setInterval(() => {
      setDice(Math.floor(Math.random() * 6) + 1);
      spins++;
    }, 90);
    await sleep(800);
    clearInterval(spinInterval);
    const roll = Math.floor(Math.random() * 6) + 1;
    setDice(roll);
    setRolling(false);
    void spins;

    const landed = await advance(turn, roll);
    if (landed === -1) {
      triggerWin(turn);
      setBusy(false);
      return;
    }
    const tile = tiles[landed];
    if (tile.kind === "illustration") {
      setModal({ kind: "illustration", tile, team: turn });
    } else {
      const mission = MISSIONS[Math.floor(Math.random() * MISSIONS.length)];
      setModal({ kind: "key", mission, team: turn });
    }
  };

  const closeAndAdvance = async (bonus: boolean) => {
    const team = turn;
    setModal({ kind: "idle" });
    if (bonus) {
      const landed = await advance(team, 1);
      if (landed === -1) {
        triggerWin(team);
        setBusy(false);
        return;
      }
    }
    nextTurn();
    setBusy(false);
  };

  const resetGame = () => {
    setPositions({ A: 0, B: 0 });
    setTurn("A");
    setDice(null);
    setRolling(false);
    setModal({ kind: "idle" });
    setBusy(false);
    winFiredRef.current = false;
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[oklch(0.97_0.04_200)] via-[oklch(0.98_0.03_95)] to-[oklch(0.95_0.06_320)] p-4 sm:p-8">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
        <Header turn={turn} />

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Board tiles={tiles} positions={positions} />

          <Sidebar
            turn={turn}
            dice={dice}
            rolling={rolling}
            onRoll={handleRoll}
            onReset={resetGame}
            disabled={busy || modal.kind !== "idle"}
            positions={positions}
          />
        </div>
      </div>

      {modal.kind === "illustration" && (
        <IllustrationModal
          tile={modal.tile}
          team={modal.team}
          onAnswer={(correct) => closeAndAdvance(correct)}
        />
      )}
      {modal.kind === "key" && (
        <MissionModal
          mission={modal.mission}
          team={modal.team}
          onResult={(success) => closeAndAdvance(success)}
        />
      )}
      {modal.kind === "win" && <WinModal team={modal.team} onReset={resetGame} />}
    </div>
  );
}

/* ---------- subcomponents ---------- */

function Header({ turn }: { turn: TeamId }) {
  const t = TEAMS[turn];
  const color = turn === "A" ? "bg-team-a" : "bg-team-b";
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white/70 px-6 py-4 shadow-[var(--shadow-soft)] backdrop-blur">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          JEBS English Worship
        </p>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">영어 보드게임</h1>
      </div>
      <div
        className={`animate-pop-in flex items-center gap-3 rounded-full ${color} px-6 py-3 text-white shadow-[var(--shadow-pop)]`}
        key={turn}
      >
        <span className="text-2xl">{t.emoji}</span>
        <span className="text-lg font-bold sm:text-xl">지금은 {t.name} 차례!</span>
      </div>
    </header>
  );
}

function Board({
  tiles,
  positions,
}: {
  tiles: Tile[];
  positions: Record<TeamId, number>;
}) {
  return (
    <div className="rounded-[2rem] bg-board-bg p-4 shadow-[var(--shadow-soft)] sm:p-6">
      <div
        className="relative mx-auto grid aspect-square w-full max-w-[900px]"
        style={{
          gridTemplateRows: "repeat(6, 1fr)",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: "0.5rem",
        }}
      >
        {tiles.map((tile) => {
          const { row, col } = indexToCell(tile.index);
          const teamsHere: TeamId[] = (["A", "B"] as TeamId[]).filter(
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

        {/* center title area */}
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
            주사위를 굴려서 한 바퀴 완주하면 승리!
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
      className={`relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl ${bg} shadow-sm ring-1 ring-black/5 transition-transform hover:scale-[1.02]`}
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
  const color = team === "A" ? "bg-team-a" : "bg-team-b";
  return (
    <div
      key={team + Math.random()}
      className={`animate-pawn-hop flex h-8 w-8 items-center justify-center rounded-full ${color} text-lg shadow-lg ring-2 ring-white sm:h-10 sm:w-10 sm:text-xl`}
    >
      {TEAMS[team].emoji}
    </div>
  );
}

function Sidebar({
  turn,
  dice,
  rolling,
  onRoll,
  onReset,
  disabled,
  positions,
}: {
  turn: TeamId;
  dice: number | null;
  rolling: boolean;
  onRoll: () => void;
  onReset: () => void;
  disabled: boolean;
  positions: Record<TeamId, number>;
}) {
  const bg = turn === "A" ? "from-team-a to-[oklch(0.55_0.2_250)]" : "from-team-b to-[oklch(0.6_0.22_25)]";
  return (
    <aside className="flex flex-col gap-4">
      <div className={`rounded-3xl bg-gradient-to-br ${bg} p-6 text-white shadow-[var(--shadow-pop)]`}>
        <p className="text-sm font-semibold uppercase tracking-widest opacity-90">Dice</p>
        <div className="mt-4 flex flex-col items-center gap-4">
          <div
            key={dice ?? "empty"}
            className={`flex h-32 w-32 items-center justify-center rounded-3xl bg-white text-7xl text-foreground shadow-inner ${
              rolling ? "animate-dice-roll" : "animate-pop-in"
            }`}
          >
            {dice ? DICE_FACES[dice - 1] : "🎲"}
          </div>
          <button
            onClick={onRoll}
            disabled={disabled}
            className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-white/95 px-6 py-4 text-xl font-bold text-foreground shadow-lg transition hover:-translate-y-0.5 hover:bg-white active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Dices className="h-6 w-6 transition group-hover:rotate-12" />
            주사위 굴리기
          </button>
        </div>
      </div>

      <div className="rounded-3xl bg-white/80 p-5 shadow-[var(--shadow-soft)] backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Progress
        </p>
        <div className="mt-3 space-y-3">
          {(["A", "B"] as TeamId[]).map((t) => {
            const pct = (positions[t] / BOARD_SIZE) * 100;
            const color = t === "A" ? "bg-team-a" : "bg-team-b";
            return (
              <div key={t}>
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>
                    {TEAMS[t].emoji} {TEAMS[t].name}
                  </span>
                  <span className="text-muted-foreground">
                    {positions[t]}/{BOARD_SIZE}
                  </span>
                </div>
                <div className="mt-1 h-3 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full ${color} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={onReset}
        className="flex items-center justify-center gap-2 rounded-2xl border-2 border-foreground/10 bg-white/70 px-4 py-3 text-base font-bold text-foreground transition hover:-translate-y-0.5 hover:bg-white"
      >
        <RotateCcw className="h-5 w-5" />
        게임 초기화 / 다시하기
      </button>
    </aside>
  );
}

function ModalShell({
  team,
  children,
}: {
  team: TeamId;
  children: React.ReactNode;
}) {
  const accent = team === "A" ? "from-team-a-soft to-white" : "from-team-b-soft to-white";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        className={`animate-pop-in w-full max-w-2xl rounded-[2rem] bg-gradient-to-br ${accent} p-8 shadow-[var(--shadow-pop)]`}
      >
        {children}
      </div>
    </div>
  );
}

function IllustrationModal({
  tile,
  team,
  onAnswer,
}: {
  tile: Tile;
  team: TeamId;
  onAnswer: (correct: boolean) => void;
}) {
  const t = TEAMS[team];
  return (
    <ModalShell team={team}>
      <div className="flex flex-col items-center text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
          {t.emoji} {t.name} · 문장을 외쳐보세요!
        </p>
        <div className="mt-4 aspect-square w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-inner">
          <img
            src={tile.illustration!.src}
            alt={tile.illustration!.hint}
            className="h-full w-full object-cover"
          />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          진행자용 힌트: <span className="font-semibold">{tile.illustration!.hint}</span>
        </p>
        <div className="mt-6 grid w-full grid-cols-2 gap-3">
          <button
            onClick={() => onAnswer(false)}
            className="rounded-2xl bg-white px-6 py-4 text-lg font-bold text-destructive shadow ring-2 ring-destructive/30 transition hover:-translate-y-0.5 hover:ring-destructive"
          >
            ✗ 오답
          </button>
          <button
            onClick={() => onAnswer(true)}
            className="rounded-2xl bg-gradient-to-br from-[oklch(0.75_0.18_150)] to-[oklch(0.6_0.2_150)] px-6 py-4 text-lg font-bold text-white shadow-lg transition hover:-translate-y-0.5"
          >
            ✓ 정답 (+1칸)
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function MissionModal({
  mission,
  team,
  onResult,
}: {
  mission: string;
  team: TeamId;
  onResult: (success: boolean) => void;
}) {
  const t = TEAMS[team];
  return (
    <ModalShell team={team}>
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center gap-2 rounded-full bg-key px-4 py-1.5 text-sm font-bold text-white shadow">
          <Key className="h-4 w-4" /> 열쇠 미션
        </div>
        <p className="mt-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">
          {t.emoji} {t.name}
        </p>
        <p className="mt-6 text-2xl font-bold leading-snug text-foreground sm:text-3xl">
          {mission}
        </p>
        <div className="mt-8 grid w-full grid-cols-2 gap-3">
          <button
            onClick={() => onResult(false)}
            className="rounded-2xl bg-white px-6 py-4 text-lg font-bold text-muted-foreground shadow ring-2 ring-muted transition hover:-translate-y-0.5"
          >
            실패
          </button>
          <button
            onClick={() => onResult(true)}
            className="rounded-2xl bg-gradient-to-br from-[oklch(0.8_0.17_90)] to-[oklch(0.68_0.2_60)] px-6 py-4 text-lg font-bold text-white shadow-lg transition hover:-translate-y-0.5"
          >
            성공 (+1칸)
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function WinModal({ team, onReset }: { team: TeamId; onReset: () => void }) {
  const t = TEAMS[team];
  const color = team === "A" ? "from-team-a to-[oklch(0.55_0.2_250)]" : "from-team-b to-[oklch(0.6_0.22_25)]";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div
        className={`animate-pop-in w-full max-w-xl rounded-[2rem] bg-gradient-to-br ${color} p-10 text-center text-white shadow-[var(--shadow-pop)]`}
      >
        <Trophy className="mx-auto h-20 w-20 animate-bounce drop-shadow-lg" />
        <p className="mt-4 text-lg font-semibold uppercase tracking-[0.3em] opacity-90">
          Winner!
        </p>
        <h2 className="mt-2 text-5xl font-black sm:text-6xl">
          {t.emoji} {t.name} 승리!
        </h2>
        <p className="mt-3 text-base opacity-90">한 바퀴 완주를 축하합니다 🎉</p>
        <button
          onClick={onReset}
          className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-lg font-bold text-foreground shadow-lg transition hover:-translate-y-0.5"
        >
          <RotateCcw className="h-5 w-5" />
          다시하기
        </button>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function fireConfetti() {
  const end = Date.now() + 2500;
  const colors = ["#60a5fa", "#f472b6", "#fbbf24", "#34d399", "#a78bfa"];
  (function frame() {
    confetti({ particleCount: 6, angle: 60, spread: 70, origin: { x: 0 }, colors });
    confetti({ particleCount: 6, angle: 120, spread: 70, origin: { x: 1 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}