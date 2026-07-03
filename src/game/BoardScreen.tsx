import { useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { QRCodeSVG } from "qrcode.react";
import { Dices, Key, RotateCcw, Trophy, Volume2 } from "lucide-react";
import { TEAMS, type TeamId } from "./config";
import { indexToCell } from "./positions";
import {
  BOARD_SIZE,
  BOARD_TILES,
  patchGame,
  positionField,
  positionOf,
  otherTeam,
  randomMission,
  resetGame,
  useGameState,
  type GameState,
  type ModalState,
} from "./state";
import { BoardVisual } from "./BoardVisual";

const DICE_FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export default function BoardScreen() {
  const { state, loading } = useGameState();
  const [animPositions, setAnimPositions] = useState<Record<TeamId, number> | null>(null);
  const [localRolling, setLocalRolling] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const animatingRef = useRef(false);
  const pendingAnimPositionsRef = useRef<Record<TeamId, number> | null>(null);
  const lastProcessedRoll = useRef<{ dice: number; turn: TeamId } | null>(null);
  const winFiredRef = useRef(false);

  // React to new dice rolls: animate the current-turn pawn.
  useEffect(() => {
    if (!state || state.winner) return;
    if (state.rolling) return; // still rolling on controller
    if (state.last_dice == null) return;
    if (state.modal.kind !== "idle") return;

    const sig = { dice: state.last_dice, turn: state.current_turn };
    if (
      lastProcessedRoll.current &&
      lastProcessedRoll.current.dice === sig.dice &&
      lastProcessedRoll.current.turn === sig.turn
    )
      return;
    if (animatingRef.current) return;
    animatingRef.current = true;
    lastProcessedRoll.current = sig;
    void runAdvance(state, sig.dice, sig.turn).finally(() => {
      animatingRef.current = false;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.last_dice, state?.rolling, state?.current_turn, state?.modal.kind, state?.winner]);

  useEffect(() => {
    if (!state || !pendingAnimPositionsRef.current) return;
    const pending = pendingAnimPositionsRef.current;
    if (state.faith_pos === pending.faith && state.soccer_pos === pending.soccer) {
      pendingAnimPositionsRef.current = null;
      setAnimPositions(null);
    }
  }, [state?.faith_pos, state?.soccer_pos]);

  // Win-screen confetti.
  useEffect(() => {
    if (state?.modal.kind === "win" && !winFiredRef.current) {
      winFiredRef.current = true;
      fireConfetti();
    }
    if (state?.modal.kind !== "win") winFiredRef.current = false;
  }, [state?.modal.kind]);

  const runAdvance = async (base: GameState, steps: number, team: TeamId) => {
    const start = positionOf(base, team);
    let raw = start;
    const other: Record<TeamId, number> = {
      faith: base.faith_pos,
      soccer: base.soccer_pos,
    };
    for (let i = 0; i < steps; i++) {
      raw += 1;
      const wrapped = raw % BOARD_SIZE;
      other[team] = wrapped;
      setAnimPositions({ ...other });
      if (raw >= BOARD_SIZE) {
        // winner
        pendingAnimPositionsRef.current = { ...other };
        await patchGame({
          [positionField(team)]: wrapped,
          winner: team,
          modal: { kind: "win", team },
          last_dice: null,
          rolling: false,
        } as Partial<GameState>);
        return;
      }
      await sleep(240);
    }
    const landedIndex = raw;
    const tile = BOARD_TILES[landedIndex];
    const modal: ModalState =
      tile.kind === "illustration"
        ? { kind: "illustration", tileIndex: landedIndex, team }
        : { kind: "key", mission: randomMission(), team };
    pendingAnimPositionsRef.current = { ...other };
    await patchGame({
      [positionField(team)]: landedIndex,
      modal,
      last_dice: null,
      rolling: false,
    } as Partial<GameState>);
  };

  const handleModalResult = async (bonus: boolean) => {
    if (!state) return;
    const team = state.current_turn;
    if (!bonus) {
      await patchGame({ modal: { kind: "idle" }, current_turn: otherTeam(team) });
      return;
    }
    // +1 bonus advance
    await patchGame({ modal: { kind: "idle" } });
    const start = positionOf(state, team);
    const raw = start + 1;
    const wrapped = raw % BOARD_SIZE;
    if (raw >= BOARD_SIZE) {
      await patchGame({
        [positionField(team)]: wrapped,
        winner: team,
        modal: { kind: "win", team },
      } as Partial<GameState>);
      return;
    }
    // Show local hop animation
    setAnimPositions({
      faith: state.faith_pos,
      soccer: state.soccer_pos,
      [team]: wrapped,
    } as Record<TeamId, number>);
    await sleep(240);
    pendingAnimPositionsRef.current = {
      faith: state.faith_pos,
      soccer: state.soccer_pos,
      [team]: wrapped,
    } as Record<TeamId, number>;
    await patchGame({
      [positionField(team)]: wrapped,
      current_turn: otherTeam(team),
    } as Partial<GameState>);
  };

  const isRollBusy =
    !state ||
    state.rolling ||
    localRolling ||
    state.modal.kind !== "idle" ||
    state.winner != null ||
    animatingRef.current;

  const handleRoll = async () => {
    if (manualMode || isRollBusy) return;
    setLocalRolling(true);
    await patchGame({ rolling: true, last_dice: null });
    await sleep(900);
    const value = 1 + Math.floor(Math.random() * 6);
    await patchGame({ rolling: false, last_dice: value });
    setLocalRolling(false);
  };

  const handleManualAdvance = async (team: TeamId, steps: number) => {
    if (!state || state.rolling || state.modal.kind !== "idle" || animatingRef.current) return;
    const clampedSteps = Math.min(BOARD_SIZE, Math.max(1, Math.round(steps)));
    animatingRef.current = true;
    lastProcessedRoll.current = null;
    setAnimPositions(null);
    await patchGame({
      current_turn: team,
      winner: null,
      modal: { kind: "idle" },
      last_dice: null,
      rolling: false,
    });
    const base: GameState = {
      ...state,
      current_turn: team,
      winner: null,
      modal: { kind: "idle" },
      last_dice: null,
      rolling: false,
    };
    await runAdvance(base, clampedSteps, team).finally(() => {
      animatingRef.current = false;
    });
  };

  const handleSetPosition = async (team: TeamId, tileNumber: number) => {
    if (!state) return;
    const clamped = Math.min(BOARD_SIZE, Math.max(1, Math.round(tileNumber)));
    const nextPositions: Record<TeamId, number> = {
      faith: state.faith_pos,
      soccer: state.soccer_pos,
      [team]: clamped - 1,
    };
    if (state.faith_pos !== nextPositions.faith || state.soccer_pos !== nextPositions.soccer) {
      pendingAnimPositionsRef.current = nextPositions;
      setAnimPositions(nextPositions);
    } else {
      pendingAnimPositionsRef.current = null;
      setAnimPositions(null);
    }
    lastProcessedRoll.current = null;
    await patchGame({
      [positionField(team)]: clamped - 1,
      winner: null,
      modal: { kind: "idle" },
      last_dice: null,
      rolling: false,
    } as Partial<GameState>);
  };

  const controllerUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/controller`;
  }, []);

  if (loading || !state) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <p className="text-lg">게임을 불러오는 중…</p>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-[oklch(0.97_0.04_200)] via-[oklch(0.98_0.03_95)] to-[oklch(0.95_0.06_320)] p-2 sm:p-3 lg:p-4">
      <div className="mx-auto flex h-full max-w-[1400px] flex-col">
        <Header turn={state.current_turn} rolling={state.rolling} dice={state.last_dice} />

        <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
          <BoardVisual state={state} animatedPositions={animPositions ?? undefined} />
          <Sidebar
            state={state}
            controllerUrl={controllerUrl}
            manualMode={manualMode}
            rollBusy={manualMode || isRollBusy}
            onManualModeChange={setManualMode}
            onRoll={handleRoll}
            onManualAdvance={handleManualAdvance}
            onSetPosition={handleSetPosition}
            onReset={() => {
              pendingAnimPositionsRef.current = null;
              setAnimPositions(null);
              lastProcessedRoll.current = null;
              winFiredRef.current = false;
              void resetGame();
            }}
          />
        </div>
      </div>

      {state.modal.kind === "illustration" && (
        <IllustrationModal
          tileIndex={state.modal.tileIndex}
          team={state.modal.team}
          onAnswer={handleModalResult}
        />
      )}
      {state.modal.kind === "key" && (
        <MissionModal
          mission={state.modal.mission}
          team={state.modal.team}
          onResult={handleModalResult}
        />
      )}
      {state.modal.kind === "win" && (
        <WinModal
          team={state.modal.team}
          onReset={() => {
            pendingAnimPositionsRef.current = null;
            setAnimPositions(null);
            lastProcessedRoll.current = null;
            winFiredRef.current = false;
            void resetGame();
          }}
        />
      )}
    </div>
  );
}

function Header({
  turn,
  rolling,
  dice,
}: {
  turn: TeamId;
  rolling: boolean;
  dice: number | null;
}) {
  const t = TEAMS[turn];
  const color = turn === "faith" ? "bg-team-faith" : "bg-team-soccer";
  return (
    <header className="pointer-events-none absolute right-2 top-2 z-20 flex items-center justify-end gap-2 sm:right-3 sm:top-3 lg:right-4 lg:top-4">
      <div className="flex items-center gap-2 sm:gap-3">
        {(rolling || dice != null) && (
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white text-2xl shadow-inner sm:h-12 sm:w-12 sm:text-3xl ${
              rolling ? "animate-dice-roll" : "animate-pop-in"
            }`}
            key={`${rolling}-${dice}`}
          >
            {rolling || dice == null ? "🎲" : DICE_FACES[dice - 1]}
          </div>
        )}
        <div
          key={turn}
          className={`animate-pop-in flex items-center gap-2 rounded-full ${color} px-4 py-2 text-white shadow-[var(--shadow-pop)] sm:px-5`}
        >
          <span className="text-lg sm:text-xl">{t.emoji}</span>
          <span className="text-sm font-bold sm:text-base">지금은 {t.name} 팀 차례!</span>
        </div>
      </div>
    </header>
  );
}

function Sidebar({
  state,
  controllerUrl,
  manualMode,
  rollBusy,
  onManualModeChange,
  onRoll,
  onManualAdvance,
  onSetPosition,
  onReset,
}: {
  state: GameState;
  controllerUrl: string;
  manualMode: boolean;
  rollBusy: boolean;
  onManualModeChange: (manual: boolean) => void;
  onRoll: () => void;
  onManualAdvance: (team: TeamId, steps: number) => void;
  onSetPosition: (team: TeamId, tileNumber: number) => void;
  onReset: () => void;
}) {
  const [showManualControls, setShowManualControls] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [manualSteps, setManualSteps] = useState("1");
  const [manualPositions, setManualPositions] = useState<Record<TeamId, string>>({
    faith: String(positionOf(state, "faith") + 1),
    soccer: String(positionOf(state, "soccer") + 1),
  });

  useEffect(() => {
    setManualPositions({
      faith: String(positionOf(state, "faith") + 1),
      soccer: String(positionOf(state, "soccer") + 1),
    });
  }, [state.faith_pos, state.soccer_pos]);

  const applyManualPosition = (team: TeamId) => {
    const parsed = Number.parseInt(manualPositions[team], 10);
    if (!Number.isFinite(parsed)) return;
    onSetPosition(team, parsed);
  };

  const applyManualAdvance = (team: TeamId) => {
    const parsed = Number.parseInt(manualSteps, 10);
    if (!Number.isFinite(parsed)) return;
    onManualAdvance(team, parsed);
  };
  const rollButtonColor =
    state.current_turn === "faith"
      ? "bg-gradient-to-br from-[#ff8177] to-[#f65454]"
      : "bg-gradient-to-br from-[#5fa5ff] to-[#5b6ff2]";

  return (
    <aside className="flex min-h-0 flex-col gap-3">
      <div className="rounded-2xl bg-white/90 p-3 shadow-[var(--shadow-soft)]">
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
          <button
            type="button"
            onClick={() => onManualModeChange(false)}
            className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
              !manualMode ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            자동
          </button>
          <button
            type="button"
            onClick={() => onManualModeChange(true)}
            className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
              manualMode ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            수동
          </button>
        </div>

        {manualMode && (
          <div className="mt-3 space-y-2">
            <div className="grid grid-cols-[1fr_72px] items-center gap-2">
              <span className="text-sm font-bold text-foreground">이동 칸 수</span>
              <input
                type="number"
                min={1}
                max={BOARD_SIZE}
                value={manualSteps}
                onChange={(event) => setManualSteps(event.target.value)}
                className="h-9 rounded-xl border border-input bg-white px-2 text-center text-sm font-bold text-foreground outline-none ring-ring transition focus:ring-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(["faith", "soccer"] as TeamId[]).map((team) => (
                <button
                  key={team}
                  type="button"
                  onClick={() => applyManualAdvance(team)}
                  className={`rounded-xl px-3 py-2 text-sm font-black text-white shadow transition hover:-translate-y-0.5 ${
                    team === "faith" ? "bg-team-faith" : "bg-team-soccer"
                  }`}
                >
                  {TEAMS[team].name} 이동
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onRoll}
        disabled={rollBusy}
        className={`${manualMode ? "hidden" : "flex"} items-center justify-center gap-2 rounded-2xl px-4 py-3 text-base font-black text-white shadow-[var(--shadow-pop)] transition ${
          rollBusy
            ? "cursor-not-allowed bg-muted-foreground/50"
            : `${rollButtonColor} hover:-translate-y-0.5 active:scale-95`
        }`}
      >
        <Dices className="h-5 w-5" />
        주사위 굴리기
      </button>

      <div className="rounded-2xl bg-white/80 p-4 shadow-[var(--shadow-soft)] backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Progress
        </p>
        <div className="mt-2 space-y-2">
          {(["faith", "soccer"] as TeamId[]).map((t) => {
            const pos = positionOf(state, t);
            const pct = (pos / BOARD_SIZE) * 100;
            const color = t === "faith" ? "bg-team-faith" : "bg-team-soccer";
            return (
              <div key={t}>
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>
                    {TEAMS[t].emoji} {TEAMS[t].name}
                  </span>
                  <span className="text-muted-foreground">
                    {pos + 1}/{BOARD_SIZE}
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

      <div className="rounded-2xl bg-white/90 p-3 shadow-[var(--shadow-soft)]">
        <button
          type="button"
          onClick={() => setShowManualControls((open) => !open)}
          className="flex w-full items-center justify-between gap-2 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground"
        >
          <span>말 위치 설정</span>
          <span className="text-base leading-none">{showManualControls ? "−" : "+"}</span>
        </button>
        {showManualControls && (
          <div className="mt-2 space-y-2">
            {(["faith", "soccer"] as TeamId[]).map((team) => (
              <div key={team} className="grid grid-cols-[1fr_68px_54px] items-center gap-2">
                <label className="text-sm font-bold text-foreground">
                  {TEAMS[team].emoji} {TEAMS[team].name}
                </label>
                <input
                  type="number"
                  min={1}
                  max={BOARD_SIZE}
                  value={manualPositions[team]}
                  onChange={(event) =>
                    setManualPositions((current) => ({
                      ...current,
                      [team]: event.target.value,
                    }))
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") applyManualPosition(team);
                  }}
                  className="h-9 rounded-xl border border-input bg-white px-2 text-center text-sm font-bold text-foreground outline-none ring-ring transition focus:ring-2"
                />
                <button
                  type="button"
                  onClick={() => applyManualPosition(team)}
                  className="h-9 rounded-xl bg-foreground px-2 text-xs font-bold text-background transition hover:-translate-y-0.5"
                >
                  적용
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {controllerUrl && (
        <div className="rounded-2xl bg-white/90 p-3 shadow-[var(--shadow-soft)]">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            📱 컨트롤러 QR
          </p>
          <div className="mt-2 flex items-center gap-3">
            <div className="rounded-xl bg-white p-2 ring-1 ring-black/5">
              <QRCodeSVG value={controllerUrl} size={88} />
            </div>
            <div className="min-w-0 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">스마트폰으로 스캔</p>
              <p className="mt-1 break-all">{controllerUrl}</p>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setShowResetConfirm(true)}
        className="flex items-center justify-center gap-2 rounded-2xl border-2 border-foreground/10 bg-white/70 px-4 py-2.5 text-base font-bold text-foreground transition hover:-translate-y-0.5 hover:bg-white"
      >
        <RotateCcw className="h-5 w-5" />
        게임 초기화 / 다시하기
      </button>
      {showResetConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="animate-pop-in w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-[var(--shadow-pop)]">
            <RotateCcw className="mx-auto h-10 w-10 text-destructive" />
            <h2 className="mt-3 text-xl font-black text-foreground">게임을 다시 시작할까요?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              현재 말 위치와 진행 상태가 처음으로 돌아갑니다.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="rounded-2xl bg-muted px-4 py-3 text-base font-bold text-foreground transition hover:-translate-y-0.5"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowResetConfirm(false);
                  onReset();
                }}
                className="rounded-2xl bg-destructive px-4 py-3 text-base font-bold text-white shadow transition hover:-translate-y-0.5"
              >
                다시하기
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

function ModalShell({ team, children }: { team: TeamId; children: React.ReactNode }) {
  const accent =
    team === "faith" ? "from-team-faith-soft to-white" : "from-team-soccer-soft to-white";
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
  tileIndex,
  team,
  onAnswer,
}: {
  tileIndex: number;
  team: TeamId;
  onAnswer: (correct: boolean) => void;
}) {
  const tile = BOARD_TILES[tileIndex];
  const t = TEAMS[team];
  const audioRef = useRef<HTMLAudioElement>(null);
  if (!tile.illustration) return null;
  return (
    <ModalShell team={team}>
      <div className="flex flex-col items-center text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
          {t.emoji} {t.name} · 문장을 외쳐보세요!
        </p>
        <div className="mt-4 aspect-square w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-inner">
          <img
            src={tile.illustration.src}
            alt={tile.illustration.hint}
            className="h-full w-full object-cover"
          />
        </div>
        <audio ref={audioRef} src={tile.illustration.audioSrc} preload="auto" />
        <button
          onClick={() => {
            const audio = audioRef.current;
            if (!audio) return;
            audio.currentTime = 0;
            void audio.play();
          }}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-base font-bold text-foreground shadow ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:bg-white/90"
        >
          <Volume2 className="h-5 w-5" />
          문장 듣기
        </button>
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
  const color =
    team === "faith"
      ? "from-team-faith to-[oklch(0.6_0.22_25)]"
      : "from-team-soccer to-[oklch(0.55_0.2_250)]";
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
          {t.emoji} {t.name} 팀 승리!
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
