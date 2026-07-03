import { useEffect, useRef, useState } from "react";
import { Dices } from "lucide-react";
import { TEAMS, type TeamId } from "./config";
import { patchGame, useGameState } from "./state";

const DICE_FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export default function ControllerScreen() {
  const { state, loading } = useGameState();
  const [localRolling, setLocalRolling] = useState(false);
  const [revealValue, setRevealValue] = useState<number | null>(null);
  const revealTimer = useRef<number | null>(null);

  // When a new dice value arrives, briefly show it big.
  useEffect(() => {
    if (!state) return;
    if (state.last_dice != null && !state.rolling) {
      setRevealValue(state.last_dice);
      if (revealTimer.current) window.clearTimeout(revealTimer.current);
      revealTimer.current = window.setTimeout(() => setRevealValue(null), 2500);
    }
    return () => {
      if (revealTimer.current) window.clearTimeout(revealTimer.current);
    };
  }, [state?.last_dice, state?.rolling]);

  if (loading || !state) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background p-6 text-lg">
        연결 중…
      </div>
    );
  }

  const turn: TeamId = state.current_turn;
  const t = TEAMS[turn];
  const teamBg = turn === "faith" ? "bg-team-faith-soft" : "bg-team-soccer-soft";
  const teamAccent = turn === "faith" ? "bg-team-faith" : "bg-team-soccer";

  const isBusy =
    state.rolling || localRolling || state.modal.kind !== "idle" || state.winner != null;

  const handleRoll = async () => {
    if (isBusy) return;
    setLocalRolling(true);
    await patchGame({ rolling: true, last_dice: null, reveal_dice_at: null });
    // Show a fake spinning animation for ~1s, then commit result.
    await new Promise((r) => setTimeout(r, 900));
    const value = 1 + Math.floor(Math.random() * 6);
    await patchGame({ rolling: false, last_dice: value, reveal_dice_at: createRollSeed(value) });
    setLocalRolling(false);
  };

  return (
    <div
      className={`flex min-h-[100dvh] flex-col ${teamBg} transition-colors duration-500 p-6`}
    >
      <header className="flex flex-col items-center gap-2 pt-6 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-foreground/60">
          JEBS Controller
        </p>
        <div
          key={turn}
          className={`animate-pop-in ${teamAccent} rounded-full px-6 py-3 text-white shadow-[var(--shadow-pop)]`}
        >
          <span className="text-2xl">{t.emoji}</span>{" "}
          <span className="text-xl font-bold">{t.name} 팀 차례</span>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center">
        {revealValue != null && !state.rolling && !localRolling ? (
          <div className="animate-pop-in flex flex-col items-center gap-4 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-foreground/60">
              결과
            </p>
            <div className="flex h-64 w-64 items-center justify-center rounded-[2.5rem] bg-white text-[10rem] leading-none shadow-[var(--shadow-pop)]">
              {DICE_FACES[revealValue - 1]}
            </div>
            <p className="text-3xl font-black text-foreground">{revealValue}칸 이동!</p>
          </div>
        ) : (
          <button
            onClick={handleRoll}
            disabled={isBusy}
            className={`relative flex h-[45vh] max-h-[520px] w-full max-w-md flex-col items-center justify-center gap-4 rounded-[2.5rem] text-white shadow-[var(--shadow-pop)] transition
              ${teamAccent}
              ${isBusy ? "opacity-70" : "hover:-translate-y-1 active:scale-95"}
            `}
          >
            {state.rolling || localRolling ? (
              <>
                <div className="animate-dice-roll text-[8rem] leading-none">🎲</div>
                <p className="text-2xl font-bold">굴리는 중…</p>
              </>
            ) : state.winner ? (
              <>
                <div className="text-8xl">🏆</div>
                <p className="text-2xl font-bold">게임 종료!</p>
                <p className="text-base opacity-90">진행자 화면에서 초기화하세요</p>
              </>
            ) : state.modal.kind !== "idle" ? (
              <>
                <div className="text-8xl">⏳</div>
                <p className="text-2xl font-bold">진행자 판정 대기 중</p>
                <p className="text-base opacity-90">PC 화면을 확인하세요</p>
              </>
            ) : (
              <>
                <Dices className="h-24 w-24" strokeWidth={2.4} />
                <p className="text-3xl font-black">주사위 굴리기</p>
                <p className="text-base opacity-90">화면을 눌러주세요</p>
              </>
            )}
          </button>
        )}
      </div>

      <footer className="pb-4 pt-6 text-center text-xs text-foreground/50">
        📱 이 화면은 진행자용 컨트롤러입니다
      </footer>
    </div>
  );
}

function createRollSeed(dice: number) {
  return Date.now() * 10 + dice;
}
