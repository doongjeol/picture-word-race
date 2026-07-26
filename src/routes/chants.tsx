import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import { CHANTS } from "@/game/chants";

export const Route = createFileRoute("/chants")({
  component: ChantsScreen,
});

const LINES_PER_PAGE = 4;

function ChantsScreen() {
  const [chantId, setChantId] = useState(CHANTS[0].id);
  const [page, setPage] = useState(0);
  const chant = CHANTS.find((c) => c.id === chantId) ?? CHANTS[0];

  const totalPages = Math.ceil(chant.lines.length / LINES_PER_PAGE);
  const safePage = Math.min(page, totalPages - 1);
  const pageLines = chant.lines.slice(
    safePage * LINES_PER_PAGE,
    safePage * LINES_PER_PAGE + LINES_PER_PAGE,
  );

  const selectChant = (id: string) => {
    setChantId(id);
    setPage(0);
  };

  return (
    <div className="flex min-h-screen flex-col overflow-auto bg-gradient-to-br from-[oklch(0.95_0.05_260)] via-[oklch(0.96_0.04_230)] to-[oklch(0.97_0.04_95)] p-4 md:h-screen md:overflow-hidden">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col md:min-h-0">
        <div className="flex shrink-0 items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-1 rounded-full bg-white/70 px-3 py-1.5 text-sm font-bold text-foreground shadow-md backdrop-blur transition hover:bg-white"
          >
            <Home className="size-4" />
            <span className="hidden sm:inline">홈으로</span>
          </Link>
          <h1 className="text-xl font-black text-foreground sm:text-2xl">🎶 챈트 배우기</h1>
          <div className="w-10" />
        </div>

        <div className="mt-2 flex shrink-0 justify-center gap-2">
          {CHANTS.map((c) => (
            <button
              key={c.id}
              onClick={() => selectChant(c.id)}
              className={`rounded-2xl px-4 py-2 text-base font-bold shadow-md transition ${
                c.id === chant.id
                  ? "bg-gradient-to-br from-[oklch(0.75_0.14_250)] to-[oklch(0.6_0.19_270)] text-white"
                  : "bg-white/70 text-foreground hover:bg-white"
              }`}
            >
              {c.title}
            </button>
          ))}
        </div>

        <div className="mt-3 grid flex-1 grid-cols-1 gap-4 md:min-h-0 md:grid-cols-[220px_1fr] lg:grid-cols-[260px_1fr]">
          <div className="flex flex-col items-center justify-center gap-2 rounded-[2rem] bg-white/85 p-4 shadow-[var(--shadow-pop)] backdrop-blur">
            <div className="aspect-[9/16] w-full max-w-[220px] overflow-hidden rounded-2xl bg-black">
              <iframe
                key={chant.youtubeId}
                className="size-full"
                src={`https://www.youtube.com/embed/${chant.youtubeId}`}
                title={chant.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p className="text-center text-base font-black text-foreground">{chant.title}</p>
            <p className="text-center text-xs font-semibold text-muted-foreground">
              {chant.composer}
            </p>
          </div>

          <div className="flex min-h-0 flex-col rounded-[2rem] bg-white/85 p-6 shadow-[var(--shadow-pop)] backdrop-blur">
            <div className="flex shrink-0 items-center justify-between">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">
                가사 &amp; 발음
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 0))}
                    disabled={safePage === 0}
                    aria-label="이전 가사 페이지"
                    className="flex size-8 items-center justify-center rounded-full bg-muted text-foreground transition hover:bg-muted/70 disabled:pointer-events-none disabled:opacity-30"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <span className="text-sm font-bold text-muted-foreground">
                    {safePage + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                    disabled={safePage === totalPages - 1}
                    aria-label="다음 가사 페이지"
                    className="flex size-8 items-center justify-center rounded-full bg-muted text-foreground transition hover:bg-muted/70 disabled:pointer-events-none disabled:opacity-30"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              )}
            </div>
            <div
              className="mt-3 grid flex-1 gap-3 md:min-h-0"
              style={{ gridTemplateRows: `repeat(${pageLines.length}, minmax(0, 1fr))` }}
            >
              {pageLines.map((line, i) => (
                <div
                  key={i}
                  className="flex min-h-0 flex-col justify-center overflow-hidden rounded-2xl bg-muted px-6"
                >
                  <p className="text-[clamp(18px,3.4vh,38px)] leading-tight font-black text-foreground">
                    {line.en}
                  </p>
                  <p className="mt-1 text-[clamp(14px,2.4vh,28px)] leading-tight font-bold text-[oklch(0.6_0.19_270)]">
                    [{line.pron}]
                  </p>
                  <p className="mt-1 text-[clamp(12px,1.8vh,20px)] leading-tight text-muted-foreground">
                    {line.ko}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
