import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Home, X } from "lucide-react";
import { LESSON30_STORY as ITEMS, type StoryItem } from "@/game/lesson30Story";

export const Route = createFileRoute("/bingo-answers")({
  component: BingoAnswers,
});

function BingoAnswers() {
  const [selected, setSelected] = useState<StoryItem | null>(null);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-muted/30 p-3 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2 sm:mb-6 sm:justify-between">
        <h1 className="order-first w-full text-center text-lg font-black text-foreground sm:order-none sm:w-auto sm:text-xl">
          📖 그림 빙고 정답표
        </h1>
        <Link
          to="/"
          className="flex items-center gap-1 rounded-full bg-white px-3 py-2 text-sm font-bold text-foreground shadow-md transition hover:bg-muted"
        >
          <Home className="size-4" />
          <span>홈으로</span>
        </Link>
      </div>

      <div className="mx-auto grid max-w-5xl gap-3 sm:grid-cols-2 sm:gap-4">
        {ITEMS.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 rounded-2xl border border-border bg-white p-3 shadow-sm sm:gap-4 sm:p-4"
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
            <p className="min-w-0 text-sm font-semibold text-foreground sm:text-base">
              {item.caption}
            </p>
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
    </div>
  );
}
