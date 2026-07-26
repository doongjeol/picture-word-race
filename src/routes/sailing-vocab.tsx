import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import { SAILING_WORDS as WORDS } from "@/game/sailingVocab";

export const Route = createFileRoute("/sailing-vocab")({
  component: SailingVocabSlides,
});

const THEMES = [
  "from-[oklch(0.9_0.08_220)] via-[oklch(0.95_0.05_200)] to-[oklch(0.97_0.04_95)]",
  "from-[oklch(0.9_0.09_260)] via-[oklch(0.94_0.06_230)] to-[oklch(0.97_0.04_140)]",
  "from-[oklch(0.92_0.08_190)] via-[oklch(0.95_0.05_160)] to-[oklch(0.97_0.05_95)]",
  "from-[oklch(0.9_0.09_25)] via-[oklch(0.95_0.06_60)] to-[oklch(0.96_0.05_200)]",
];

// Slide 0 is the intro, slides 1..N are words, the last slide is the outro.
const TOTAL_SLIDES = WORDS.length + 2;

function SailingVocabSlides() {
  const [slide, setSlide] = useState(0);

  const goNext = useCallback(() => {
    setSlide((s) => Math.min(s + 1, TOTAL_SLIDES - 1));
  }, []);
  const goPrev = useCallback(() => {
    setSlide((s) => Math.max(s - 1, 0));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  const wordIndex = slide - 1;
  const word = wordIndex >= 0 && wordIndex < WORDS.length ? WORDS[wordIndex] : null;
  const theme = THEMES[Math.max(wordIndex, 0) % THEMES.length];

  return (
    <div
      className={`relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br p-6 transition-colors duration-500 ${theme}`}
    >
      <Link
        to="/"
        className="absolute left-4 top-4 z-20 flex items-center gap-1 rounded-full bg-white/70 px-3 py-2 text-sm font-bold text-foreground shadow-md backdrop-blur transition hover:bg-white"
      >
        <Home className="size-4" />
        <span className="hidden sm:inline">홈으로</span>
      </Link>

      {/* progress bar */}
      <div className="absolute inset-x-0 top-0 h-2 bg-white/40">
        <div
          className="h-full bg-[oklch(0.68_0.18_250)] transition-all duration-300"
          style={{ width: `${(slide / (TOTAL_SLIDES - 1)) * 100}%` }}
        />
      </div>

      {/* click zones for tap-to-advance */}
      <button
        aria-label="이전 슬라이드"
        onClick={goPrev}
        className="absolute inset-y-0 left-0 z-10 w-1/4 cursor-w-resize"
      />
      <button
        aria-label="다음 슬라이드"
        onClick={goNext}
        className="absolute inset-y-0 right-0 z-10 w-1/4 cursor-e-resize"
      />

      <div className="z-10 w-full max-w-2xl animate-pop-in rounded-[2rem] bg-white/85 p-10 text-center shadow-[var(--shadow-pop)] backdrop-blur">
        {slide === 0 && (
          <>
            <p className="text-[34px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
              Sailing Vocabulary
            </p>
            <div className="mt-6 animate-float-slow text-8xl">⛵</div>
            <h1 className="mt-6 text-[56px] font-black text-foreground sm:text-[68px]">
              항해 관련 영단어
            </h1>
            <p className="mt-4 text-[38px] text-muted-foreground">
              배를 타고 바다를 항해하며 배우는 영어 단어 {WORDS.length}개!
            </p>
            <p className="mt-8 text-[34px] font-semibold text-muted-foreground">
              화면을 클릭하거나 방향키 →를 눌러 시작하세요
            </p>
          </>
        )}

        {word && (
          <>
            <p className="text-[34px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
              {wordIndex + 1} / {WORDS.length}
            </p>
            <div className="mt-4 animate-float-slow text-9xl">{word.emoji}</div>
            <h1 className="mt-6 text-[68px] font-black tracking-tight text-foreground sm:text-[80px]">
              {word.en}
            </h1>
            <p className="mt-2 text-[40px] font-bold text-muted-foreground">[{word.pron}]</p>
            <p className="mt-3 text-[44px] font-bold text-[oklch(0.6_0.19_270)] sm:text-[50px]">
              {word.ko}
            </p>
            <p className="mt-6 rounded-2xl bg-muted px-5 py-4 text-[38px] font-medium text-foreground">
              {word.sentence}
            </p>
          </>
        )}

        {slide === TOTAL_SLIDES - 1 && (
          <>
            <div className="mt-2 text-8xl">🏆</div>
            <h1 className="mt-6 text-[56px] font-black text-foreground sm:text-[68px]">
              항해 완료!
            </h1>
            <p className="mt-4 text-[38px] text-muted-foreground">
              {WORDS.length}개 단어를 모두 배웠어요. 정말 잘했어요!
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {WORDS.map((w) => (
                <span
                  key={w.en}
                  className="rounded-full bg-muted px-3 py-1.5 text-[34px] font-bold text-foreground"
                >
                  {w.emoji} {w.en}{" "}
                  <span className="font-medium text-muted-foreground">[{w.pron}]</span>
                </span>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setSlide(0)}
                className="rounded-2xl bg-gradient-to-br from-[oklch(0.75_0.14_250)] to-[oklch(0.6_0.19_270)] px-6 py-3 text-[38px] font-bold text-white shadow-lg transition hover:-translate-y-0.5"
              >
                🔁 처음부터 다시 보기
              </button>
              <Link
                to="/sailing-quiz"
                className="rounded-2xl bg-gradient-to-br from-[oklch(0.75_0.14_25)] to-[oklch(0.62_0.2_20)] px-6 py-3 text-[38px] font-bold text-white shadow-lg transition hover:-translate-y-0.5"
              >
                🎯 퀴즈 풀러가기
              </Link>
            </div>
          </>
        )}
      </div>

      {/* nav controls */}
      <div className="z-20 mt-8 flex items-center gap-4">
        <button
          onClick={goPrev}
          disabled={slide === 0}
          className="flex size-14 items-center justify-center rounded-full bg-white/80 text-foreground shadow-md backdrop-blur transition hover:-translate-y-0.5 hover:bg-white disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft className="size-7" />
        </button>
        <span className="rounded-full bg-white/70 px-4 py-2 text-sm font-bold text-foreground shadow-sm backdrop-blur">
          {slide + 1} / {TOTAL_SLIDES}
        </span>
        <button
          onClick={goNext}
          disabled={slide === TOTAL_SLIDES - 1}
          className="flex size-14 items-center justify-center rounded-full bg-white/80 text-foreground shadow-md backdrop-blur transition hover:-translate-y-0.5 hover:bg-white disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronRight className="size-7" />
        </button>
      </div>
    </div>
  );
}
