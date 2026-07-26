import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import confetti from "canvas-confetti";
import { CheckCircle2, Home, RotateCcw, Trophy, XCircle } from "lucide-react";
import { SAILING_WORDS, type SailingWord } from "@/game/sailingVocab";

export const Route = createFileRoute("/sailing-quiz")({
  component: SailingVocabQuiz,
});

type Direction = "en2ko" | "ko2en";

type Question = {
  word: SailingWord;
  direction: Direction;
  correct: string;
  options: string[];
};

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildQuestions(): Question[] {
  return shuffle(SAILING_WORDS).map((word) => {
    const direction: Direction = Math.random() < 0.5 ? "en2ko" : "ko2en";
    const field = direction === "en2ko" ? "ko" : "en";
    const correct = word[field];
    const distractors = shuffle(
      SAILING_WORDS.filter((w) => w.en !== word.en).map((w) => w[field]),
    ).slice(0, 3);
    return { word, direction, correct, options: shuffle([correct, ...distractors]) };
  });
}

function fireConfetti() {
  confetti({
    particleCount: 60,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#5b8def", "#f4a340", "#7bd389", "#f76d6d"],
  });
}

function SailingVocabQuiz() {
  const [questions, setQuestions] = useState<Question[]>(buildQuestions);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  const total = questions.length;
  const finished = index >= total;
  const current = !finished ? questions[index] : null;

  const resetQuiz = () => {
    setQuestions(buildQuestions());
    setIndex(0);
    setScore(0);
    setSelected(null);
    setAnswered(false);
  };

  const selectOption = (option: string) => {
    if (answered || !current) return;
    setSelected(option);
    setAnswered(true);
    if (option === current.correct) {
      setScore((s) => s + 1);
      fireConfetti();
    }
  };

  const nextQuestion = () => {
    setIndex((i) => i + 1);
    setSelected(null);
    setAnswered(false);
  };

  const percent = total > 0 ? Math.round((score / total) * 100) : 0;
  const resultMessage =
    percent === 100
      ? "완벽해요! 최고예요! 🌟"
      : percent >= 70
        ? "정말 잘했어요! 👏"
        : percent >= 40
          ? "잘하고 있어요, 조금만 더!"
          : "다시 한번 도전해봐요!";

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[oklch(0.92_0.09_250)] via-[oklch(0.95_0.06_220)] to-[oklch(0.96_0.05_95)] p-6">
      <Link
        to="/"
        className="absolute left-4 top-4 z-20 flex items-center gap-1 rounded-full bg-white/70 px-3 py-2 text-sm font-bold text-foreground shadow-md backdrop-blur transition hover:bg-white"
      >
        <Home className="size-4" />
        <span className="hidden sm:inline">홈으로</span>
      </Link>

      {!finished && (
        <div className="absolute inset-x-0 top-0 h-2 bg-white/40">
          <div
            className="h-full bg-[oklch(0.68_0.18_250)] transition-all duration-300"
            style={{ width: `${(index / total) * 100}%` }}
          />
        </div>
      )}

      <div className="z-10 w-full max-w-2xl animate-pop-in rounded-[2rem] bg-white/85 p-10 text-center shadow-[var(--shadow-pop)] backdrop-blur">
        {current && (
          <>
            <div className="flex items-center justify-between text-[34px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              <span>
                문제 {index + 1} / {total}
              </span>
              <span>점수 {score}</span>
            </div>

            <p className="mt-6 text-[38px] font-bold text-muted-foreground">
              {current.direction === "en2ko" ? "이 단어는 무슨 뜻일까요?" : "영어로 뭐라고 할까요?"}
            </p>
            <h1 className="mt-3 text-[68px] font-black tracking-tight text-foreground sm:text-[80px]">
              {current.direction === "en2ko" ? current.word.en : current.word.ko}
            </h1>
            {current.direction === "en2ko" && (
              <p className="mt-2 text-[38px] font-bold text-muted-foreground">
                [{current.word.pron}]
              </p>
            )}

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {current.options.map((option) => {
                const isCorrect = option === current.correct;
                const isSelected = option === selected;
                const showState = answered && (isCorrect || isSelected);
                return (
                  <button
                    key={option}
                    onClick={() => selectOption(option)}
                    disabled={answered}
                    className={`flex items-center justify-between gap-2 rounded-2xl border-2 px-5 py-4 text-left text-[38px] font-bold shadow-sm transition ${
                      showState
                        ? isCorrect
                          ? "border-[oklch(0.7_0.18_145)] bg-[oklch(0.94_0.08_145)] text-[oklch(0.35_0.12_145)]"
                          : "border-[oklch(0.68_0.22_25)] bg-[oklch(0.95_0.08_25)] text-[oklch(0.4_0.18_25)]"
                        : "border-transparent bg-muted text-foreground hover:-translate-y-0.5 hover:bg-muted/70"
                    } ${answered && !showState ? "opacity-50" : ""}`}
                  >
                    <span>{option}</span>
                    {showState && isCorrect && <CheckCircle2 className="size-5 shrink-0" />}
                    {showState && !isCorrect && isSelected && (
                      <XCircle className="size-5 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {answered && (
              <div className="mt-6 animate-pop-in rounded-2xl bg-muted px-5 py-4">
                <p className="text-2xl">{current.word.emoji}</p>
                <p className="mt-1 text-[36px] font-medium text-foreground">
                  {current.word.sentence}
                </p>
                <button
                  onClick={nextQuestion}
                  className="mt-4 rounded-2xl bg-gradient-to-br from-[oklch(0.75_0.14_250)] to-[oklch(0.6_0.19_270)] px-6 py-3 text-[38px] font-bold text-white shadow-lg transition hover:-translate-y-0.5"
                >
                  {index + 1 === total ? "결과 보기 🏁" : "다음 문제 →"}
                </button>
              </div>
            )}
          </>
        )}

        {finished && (
          <>
            <Trophy className="mx-auto mt-2 size-20 text-[oklch(0.75_0.16_85)]" />
            <h1 className="mt-6 text-[56px] font-black text-foreground sm:text-[68px]">
              퀴즈 완료!
            </h1>
            <p className="mt-4 text-[44px] font-bold text-[oklch(0.6_0.19_270)]">
              {score} / {total} 점 ({percent}%)
            </p>
            <p className="mt-2 text-[38px] text-muted-foreground">{resultMessage}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                onClick={resetQuiz}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-br from-[oklch(0.75_0.14_250)] to-[oklch(0.6_0.19_270)] px-6 py-3 text-[38px] font-bold text-white shadow-lg transition hover:-translate-y-0.5"
              >
                <RotateCcw className="size-5" />
                다시 풀기
              </button>
              <Link
                to="/sailing-vocab"
                className="rounded-2xl bg-gradient-to-br from-[oklch(0.75_0.12_200)] to-[oklch(0.6_0.16_230)] px-6 py-3 text-[38px] font-bold text-white shadow-lg transition hover:-translate-y-0.5"
              >
                📖 단어 다시 보기
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
