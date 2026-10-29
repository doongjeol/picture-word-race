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
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-1 rounded-full bg-white px-3 py-2 text-sm font-bold text-foreground shadow-md transition hover:bg-muted"
        >
          <Home className="size-4" />
          <span>홈으로</span>
        </Link>
        <h1 className="text-xl font-black text-foreground">📖 그림 빙고 정답표</h1>
        <span className="w-[88px]" />
      </div>

      <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2">
        {ITEMS.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 rounded-2xl border border-border bg-white p-4 shadow-sm"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-black text-foreground">
              {item.id}
            </div>
            <button
              onClick={() => setSelected(item)}
              className="size-20 shrink-0 overflow-hidden rounded-xl border-2 border-border transition hover:-translate-y-0.5 hover:border-[oklch(0.6_0.19_270)]"
            >
              <img src={item.img} alt="" className="size-full object-cover" />
            </button>
            <p className="text-base font-semibold text-foreground">{item.caption}</p>
          </div>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative flex max-h-full w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute right-4 top-4 z-10 flex size-12 items-center justify-center rounded-full bg-white/90 text-foreground shadow-md transition hover:bg-white"
            >
              <X className="size-7" />
            </button>
            <img src={selected.img} alt="" className="max-h-[75vh] w-full object-contain" />
            <p className="p-6 text-center text-6xl font-black text-foreground">{selected.caption}</p>
          </div>
        </div>
      )}
    </div>
  );
}
