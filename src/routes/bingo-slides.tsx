import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Dices, Home, Pause, Play } from "lucide-react";
import { LESSON30_STORY as ITEMS, type StoryItem } from "@/game/lesson30Story";

export const Route = createFileRoute("/bingo-slides")({
  component: BingoSlides,
});

function shuffledItems(): StoryItem[] {
  const items = [...ITEMS];
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function BingoSlides() {
  const [order, setOrder] = useState<StoryItem[]>(() => shuffledItems());
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const current = order[index];

  const playCurrent = useCallback(() => {
    if (!audioRef.current || !current) return;
    audioRef.current.src = current.audio;
    audioRef.current.currentTime = 0;
    void audioRef.current.play();
  }, [current]);

  const goNext = useCallback(() => {
    audioRef.current?.pause();
    setIndex((i) => Math.min(i + 1, order.length - 1));
  }, [order.length]);

  const goPrev = useCallback(() => {
    audioRef.current?.pause();
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  const shuffleAgain = useCallback(() => {
    audioRef.current?.pause();
    setOrder(shuffledItems());
    setIndex(0);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === " ") {
        e.preventDefault();
        playCurrent();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, playCurrent]);

  if (!current) return null;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[oklch(0.9_0.08_220)] via-[oklch(0.95_0.05_200)] to-[oklch(0.97_0.04_95)] p-4 sm:p-6">
      <audio
        ref={audioRef}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="absolute left-4 top-4 z-20 flex items-center gap-2">
        <Link
          to="/"
          className="flex items-center gap-1 rounded-full bg-white/70 px-3 py-2 text-sm font-bold text-foreground shadow-md backdrop-blur transition hover:bg-white"
        >
          <Home className="size-4" />
          <span className="hidden sm:inline">홈으로</span>
        </Link>
        <button
          onClick={shuffleAgain}
          className="flex items-center gap-1 rounded-full bg-white/70 px-3 py-2 text-sm font-bold text-foreground shadow-md backdrop-blur transition hover:bg-white"
        >
          <Dices className="size-4" />
          <span className="hidden sm:inline">다시 섞기</span>
        </button>
      </div>

      <div className="absolute inset-x-0 top-0 h-2 bg-white/40">
        <div
          className="h-full bg-[oklch(0.68_0.18_250)] transition-all duration-300"
          style={{ width: `${((index + 1) / order.length) * 100}%` }}
        />
      </div>

      <button
        aria-label="이전 문장"
        onClick={goPrev}
        className="absolute inset-y-0 left-0 z-10 w-1/5 cursor-w-resize"
      />
      <button
        aria-label="다음 문장"
        onClick={goNext}
        className="absolute inset-y-0 right-0 z-10 w-1/5 cursor-e-resize"
      />

      <div
        key={current.id}
        className="z-10 w-full max-w-3xl animate-pop-in rounded-[2rem] bg-white/90 p-6 text-center shadow-[var(--shadow-pop)] backdrop-blur sm:p-10"
      >
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-muted-foreground">
          {index + 1} / {order.length}
        </p>
        <div className="mx-auto mt-4 aspect-square w-full max-w-md overflow-hidden rounded-2xl border-4 border-white shadow-lg">
          <img src={current.img} alt="" className="size-full object-cover" />
        </div>
        <p className="mt-6 text-xl font-black text-foreground sm:text-3xl md:text-4xl">
          {current.caption}
        </p>

        <button
          onClick={playCurrent}
          className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-[oklch(0.75_0.14_250)] to-[oklch(0.6_0.19_270)] px-6 py-3 text-lg font-black text-white shadow-lg transition hover:-translate-y-0.5 sm:px-8 sm:py-4 sm:text-xl"
        >
          {isPlaying ? <Pause className="size-6" /> : <Play className="size-6" />}
          {isPlaying ? "재생 중" : "듣기"}
        </button>
      </div>

      <div className="z-20 mt-8 flex items-center gap-4">
        <button
          onClick={goPrev}
          disabled={index === 0}
          className="flex size-14 items-center justify-center rounded-full bg-white/80 text-foreground shadow-md backdrop-blur transition hover:-translate-y-0.5 hover:bg-white disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft className="size-7" />
        </button>
        <span className="rounded-full bg-white/70 px-4 py-2 text-sm font-bold text-foreground shadow-sm backdrop-blur">
          {index + 1} / {order.length}
        </span>
        <button
          onClick={goNext}
          disabled={index === order.length - 1}
          className="flex size-14 items-center justify-center rounded-full bg-white/80 text-foreground shadow-md backdrop-blur transition hover:-translate-y-0.5 hover:bg-white disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronRight className="size-7" />
        </button>
      </div>
    </div>
  );
}
