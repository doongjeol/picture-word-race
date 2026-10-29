import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Home, Play, Shuffle, RotateCcw, Eye, X, Repeat, Dices } from "lucide-react";
import { LESSON30_STORY as ITEMS, type StoryItem } from "@/game/lesson30Story";

export const Route = createFileRoute("/bingo-caller")({
  component: BingoCaller,
});

function shuffledIds(): number[] {
  const ids = ITEMS.map((it) => it.id);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids;
}

function BingoCaller() {
  const audioRef = useRef<HTMLAudioElement>(null);
  // assignment[position] = item id shown under the number (position + 1)
  const [assignment, setAssignment] = useState<number[]>(() => shuffledIds());
  const [calledPositions, setCalledPositions] = useState<number[]>([]);
  const [currentPos, setCurrentPos] = useState<number | null>(null);
  const [selected, setSelected] = useState<StoryItem | null>(null);

  const itemById = useMemo(() => new Map(ITEMS.map((it) => [it.id, it])), []);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  const remainingPositions = assignment
    .map((_, pos) => pos)
    .filter((pos) => !calledPositions.includes(pos));

  const playPosition = useCallback(
    (pos: number) => {
      const item = itemById.get(assignment[pos]);
      if (!item || !audioRef.current) return;
      audioRef.current.src = item.audio;
      audioRef.current.currentTime = 0;
      void audioRef.current.play();
      setCurrentPos(pos);
      setCalledPositions((prev) => (prev.includes(pos) ? prev : [...prev, pos]));
    },
    [assignment, itemById],
  );

  const callNext = useCallback(() => {
    if (remainingPositions.length === 0) return;
    const pick = remainingPositions[Math.floor(Math.random() * remainingPositions.length)];
    playPosition(pick);
  }, [remainingPositions, playPosition]);

  const replayCurrent = useCallback(() => {
    if (currentPos === null) return;
    playPosition(currentPos);
  }, [currentPos, playPosition]);

  const shuffleNumbers = useCallback(() => {
    setAssignment(shuffledIds());
    setCalledPositions([]);
    setCurrentPos(null);
  }, []);

  const reset = useCallback(() => {
    setCalledPositions([]);
    setCurrentPos(null);
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col overflow-y-auto bg-gradient-to-br from-[oklch(0.92_0.07_260)] via-[oklch(0.95_0.05_230)] to-[oklch(0.97_0.04_140)] p-3 sm:h-screen sm:w-screen sm:overflow-hidden sm:p-4">
      <audio ref={audioRef} />

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mb-3 flex shrink-0 flex-wrap items-center justify-center gap-2 sm:flex-nowrap sm:justify-between">
          <h1 className="order-first w-full text-center text-lg font-black text-foreground sm:order-none sm:w-auto sm:text-xl">
            🎧 빙고 음원 재생기
          </h1>
          <Link
            to="/"
            className="flex items-center gap-1 rounded-full bg-white/70 px-3 py-1.5 text-sm font-bold text-foreground shadow-md backdrop-blur transition hover:bg-white"
          >
            <Home className="size-4" />
            <span>홈으로</span>
          </Link>
          <button
            onClick={shuffleNumbers}
            className="flex items-center gap-1 rounded-full bg-white/70 px-3 py-1.5 text-sm font-bold text-foreground shadow-md backdrop-blur transition hover:bg-white"
          >
            <Dices className="size-4" />
            <span>번호 섞기</span>
          </button>
          <button
            onClick={reset}
            className="flex items-center gap-1 rounded-full bg-white/70 px-3 py-1.5 text-sm font-bold text-foreground shadow-md backdrop-blur transition hover:bg-white"
          >
            <RotateCcw className="size-4" />
            <span>다시 시작</span>
          </button>
        </div>

        <div className="mb-3 shrink-0 rounded-2xl bg-white/85 p-3 text-center shadow-[var(--shadow-pop)] backdrop-blur">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            {calledPositions.length} / {ITEMS.length} 재생됨
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={callNext}
              disabled={remainingPositions.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-[oklch(0.75_0.14_250)] to-[oklch(0.6_0.19_270)] px-4 py-2 text-base font-black text-white shadow-lg transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-40 sm:px-5 sm:py-2.5 sm:text-lg"
            >
              <Shuffle className="size-4 sm:size-5" />
              다음 문제 듣기
            </button>
            <button
              onClick={replayCurrent}
              disabled={currentPos === null}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-sm font-bold text-foreground shadow-md transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-40 sm:px-4 sm:py-2.5 sm:text-base"
            >
              <Repeat className="size-4" />
              다시 듣기
            </button>
            <button
              onClick={() =>
                currentPos !== null && setSelected(itemById.get(assignment[currentPos]) ?? null)
              }
              disabled={currentPos === null}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-sm font-bold text-foreground shadow-md transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-40 sm:px-4 sm:py-2.5 sm:text-base"
            >
              <Eye className="size-4" />
              삽화 보기
            </button>
          </div>
          {remainingPositions.length === 0 && (
            <p className="mt-2 text-sm font-bold text-muted-foreground">모든 문제를 다 들었어요!</p>
          )}
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-3 gap-2 sm:grid-cols-6 sm:grid-rows-3">
          {assignment.map((itemId, pos) => {
            const item = itemById.get(itemId);
            if (!item) return null;
            const called = calledPositions.includes(pos);
            const isCurrent = currentPos === pos;
            return (
              <div
                key={pos}
                className={`relative flex aspect-square min-h-0 flex-col items-center justify-center rounded-xl border-2 shadow-sm transition sm:aspect-auto ${
                  isCurrent
                    ? "border-[oklch(0.6_0.19_270)] bg-[oklch(0.6_0.19_270)]"
                    : called
                      ? "border-muted bg-muted"
                      : "border-white bg-white"
                }`}
              >
                <button
                  onClick={() => playPosition(pos)}
                  className={`flex size-full flex-col items-center justify-center text-2xl font-black transition hover:-translate-y-0.5 sm:text-3xl ${
                    isCurrent ? "text-white" : called ? "text-muted-foreground" : "text-foreground"
                  }`}
                >
                  <Play className="mb-1 size-6 sm:size-8" />
                  {pos + 1}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected(item);
                  }}
                  title="그림/문장 보기"
                  className={`absolute right-1 top-1 flex size-7 items-center justify-center rounded-full shadow transition hover:scale-110 sm:size-9 ${
                    isCurrent ? "bg-white/90 text-foreground" : "bg-foreground/10 text-foreground"
                  }`}
                >
                  <Eye className="size-4 sm:size-5" />
                </button>
              </div>
            );
          })}
        </div>

        <p className="mt-2 shrink-0 text-center text-xs text-muted-foreground">
          번호를 눌러 다시 들려줄 수도 있어요. 아이들이 직접 번호를 골라 들어볼 수도 있어요. 그림은
          보여주지 않으니 소리만 듣고 알맞은 그림에 X표를 하면 됩니다. &quot;번호 섞기&quot;를 누르면
          번호와 그림의 연결이 다시 섞여요. (👁 아이콘을 누르면 교사가 그림과 문장을 확인할 수 있어요.)
        </p>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-6"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative flex max-h-full w-full max-w-[95vw] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute right-2 top-2 z-10 flex size-9 items-center justify-center rounded-full bg-white/90 text-foreground shadow-md transition hover:bg-white sm:right-4 sm:top-4 sm:size-12"
            >
              <X className="size-5 sm:size-7" />
            </button>
            <img src={selected.img} alt="" className="max-h-[60vh] w-full object-contain sm:max-h-[75vh]" />
            <p className="p-4 text-center text-xl font-black text-foreground sm:p-6 sm:text-4xl md:text-6xl">
              {selected.caption}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
