import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Home, Pause, Play, Square, X } from "lucide-react";
import { LESSON30_STORY as ITEMS, type StoryItem } from "@/game/lesson30Story";

export const Route = createFileRoute("/bingo-answers")({
  component: BingoAnswers,
});

function BingoAnswers() {
  const [selected, setSelected] = useState<StoryItem | null>(null);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [maskEnabled, setMaskEnabled] = useState(false);
  const [revealedIds, setRevealedIds] = useState<Set<number>>(new Set());
  const [rangeStart, setRangeStart] = useState(1);
  const [rangeEnd, setRangeEnd] = useState(ITEMS.length);
  const [repeatCount, setRepeatCount] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);
  const playIndexRef = useRef(0);
  const playStartIndexRef = useRef(0);
  const playEndIndexRef = useRef(ITEMS.length - 1);
  const repeatRemainingRef = useRef(1);
  const playModeRef = useRef<"sequential" | "single">("sequential");

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  const stopPlayback = () => {
    playIndexRef.current = ITEMS.length;
    setPlayingId(null);
    audioRef.current?.pause();
  };

  const playFrom = (index: number) => {
    const item = ITEMS[index];
    if (!item || !audioRef.current) {
      stopPlayback();
      return;
    }
    playIndexRef.current = index;
    setPlayingId(item.id);
    audioRef.current.src = item.audio;
    audioRef.current.currentTime = 0;
    void audioRef.current.play();
  };

  const startPlayback = () => {
    playModeRef.current = "sequential";
    playStartIndexRef.current = 0;
    playEndIndexRef.current = ITEMS.length - 1;
    repeatRemainingRef.current = 1;
    playFrom(0);
  };

  const startRangePlayback = () => {
    const start = Math.min(rangeStart, rangeEnd);
    const end = Math.max(rangeStart, rangeEnd);
    playModeRef.current = "sequential";
    playStartIndexRef.current = start - 1;
    playEndIndexRef.current = end - 1;
    repeatRemainingRef.current = Math.max(1, repeatCount);
    playFrom(start - 1);
  };

  const playSingle = (item: StoryItem) => {
    if (!audioRef.current) return;
    playModeRef.current = "single";
    setPlayingId(item.id);
    audioRef.current.src = item.audio;
    audioRef.current.currentTime = 0;
    void audioRef.current.play();
  };

  const handleAudioEnded = () => {
    if (playModeRef.current !== "sequential") {
      setPlayingId(null);
      return;
    }
    const nextIndex = playIndexRef.current + 1;
    if (nextIndex <= playEndIndexRef.current) {
      playFrom(nextIndex);
      return;
    }
    repeatRemainingRef.current -= 1;
    if (repeatRemainingRef.current > 0) {
      playFrom(playStartIndexRef.current);
    } else {
      stopPlayback();
    }
  };

  const toggleMaskAll = () => {
    setMaskEnabled((prev) => !prev);
    setRevealedIds(new Set());
  };

  const toggleReveal = (id: number) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-muted/30 p-3 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2 sm:mb-6 sm:justify-between">
        <h1 className="order-first w-full text-center text-lg font-black text-foreground sm:order-none sm:w-auto sm:text-xl">
          📖 그림 빙고 정답표
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          {playingId === null ? (
            <>
              <button
                onClick={startPlayback}
                className="flex items-center gap-1 rounded-full bg-[oklch(0.6_0.19_270)] px-3 py-2 text-sm font-bold text-white shadow-md transition hover:opacity-90"
              >
                <Play className="size-4" />
                <span>전체 재생</span>
              </button>
              <div className="flex items-center gap-1 rounded-full bg-white px-2 py-1 shadow-md">
                <select
                  value={rangeStart}
                  onChange={(e) => setRangeStart(Number(e.target.value))}
                  className="rounded-md bg-muted px-1.5 py-1 text-sm font-bold text-foreground"
                >
                  {ITEMS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.id}
                    </option>
                  ))}
                </select>
                <span className="text-sm font-bold text-foreground">~</span>
                <select
                  value={rangeEnd}
                  onChange={(e) => setRangeEnd(Number(e.target.value))}
                  className="rounded-md bg-muted px-1.5 py-1 text-sm font-bold text-foreground"
                >
                  {ITEMS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.id}
                    </option>
                  ))}
                </select>
                <span className="text-sm font-bold text-foreground">×</span>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={repeatCount}
                  onChange={(e) => setRepeatCount(Math.max(1, Number(e.target.value) || 1))}
                  className="w-12 rounded-md bg-muted px-1.5 py-1 text-center text-sm font-bold text-foreground"
                />
                <span className="text-sm font-bold text-foreground">회</span>
                <button
                  onClick={startRangePlayback}
                  className="flex items-center gap-1 rounded-full bg-[oklch(0.6_0.19_270)] px-3 py-1.5 text-sm font-bold text-white transition hover:opacity-90"
                >
                  <Play className="size-4" />
                  <span>구간 재생</span>
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={stopPlayback}
              className="flex items-center gap-1 rounded-full bg-[oklch(0.6_0.19_270)] px-3 py-2 text-sm font-bold text-white shadow-md transition hover:opacity-90"
            >
              <Square className="size-4" />
              <span>정지</span>
            </button>
          )}
          <button
            onClick={toggleMaskAll}
            className="flex items-center gap-1 rounded-full bg-white px-3 py-2 text-sm font-bold text-foreground shadow-md transition hover:bg-muted"
          >
            {maskEnabled ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
            <span>{maskEnabled ? "전체 보이기" : "전체 가리기"}</span>
          </button>
          <Link
            to="/"
            className="flex items-center gap-1 rounded-full bg-white px-3 py-2 text-sm font-bold text-foreground shadow-md transition hover:bg-muted"
          >
            <Home className="size-4" />
            <span>홈으로</span>
          </Link>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl gap-3 sm:grid-cols-2 sm:gap-4">
        {ITEMS.map((item) => (
          <div
            key={item.id}
            className={`flex items-center gap-3 rounded-2xl border p-3 shadow-sm transition sm:gap-4 sm:p-4 ${
              playingId === item.id
                ? "border-[oklch(0.6_0.19_270)] bg-[oklch(0.6_0.19_270)]/10"
                : "border-border bg-white"
            }`}
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-black text-foreground sm:size-10">
              {item.id}
            </div>
            <button
              onClick={() => setSelected(item)}
              className="size-16 shrink-0 overflow-hidden rounded-xl border-2 border-border transition hover:-translate-y-0.5 hover:border-[oklch(0.6_0.19_270)] sm:size-20"
            >
              <img src={item.img} alt="" className="size-full object-cover" />
            </button>
            {(() => {
              const isHidden = maskEnabled && !revealedIds.has(item.id);
              return (
                <button
                  onClick={() => maskEnabled && toggleReveal(item.id)}
                  disabled={!maskEnabled}
                  className={`min-w-0 flex-1 rounded-lg text-left text-sm font-semibold text-foreground sm:text-base ${
                    isHidden
                      ? "cursor-pointer select-none rounded-md bg-foreground/80 py-1 text-transparent"
                      : ""
                  }`}
                >
                  {item.caption}
                </button>
              );
            })()}
            <button
              onClick={() => (playingId === item.id ? stopPlayback() : playSingle(item))}
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-foreground transition hover:bg-[oklch(0.6_0.19_270)] hover:text-white sm:size-10"
            >
              {playingId === item.id ? <Pause className="size-4" /> : <Play className="size-4" />}
            </button>
          </div>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-6"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative flex max-h-full w-full max-w-[95vw] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-w-6xl"
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

      <audio ref={audioRef} onEnded={handleAudioEnded} />
    </div>
  );
}
