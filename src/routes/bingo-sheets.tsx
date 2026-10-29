import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Home, Printer } from "lucide-react";
import { LESSON30_STORY as ITEMS } from "@/game/lesson30Story";

export const Route = createFileRoute("/bingo-sheets")({
  component: BingoSheets,
});

const SHEET_COUNT = 20;
const GRID_SIZE = 9;

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function makeSheets() {
  return Array.from({ length: SHEET_COUNT }, () => shuffle(ITEMS).slice(0, GRID_SIZE));
}

function BingoSheets() {
  const sheets = useMemo(() => makeSheets(), []);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-muted/30 p-3 sm:p-6 print:bg-white print:p-0">
      <style>{`@page { size: A4 landscape; margin: 6mm; }`}</style>
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2 sm:justify-between print:hidden">
        <h1 className="order-first w-full text-center text-lg font-black text-foreground sm:order-none sm:w-auto sm:text-xl">
          🖨️ 그림 빙고 학습지 ({SHEET_COUNT}장)
        </h1>
        <Link
          to="/"
          className="flex items-center gap-1 rounded-full bg-white px-3 py-2 text-sm font-bold text-foreground shadow-md transition hover:bg-muted"
        >
          <Home className="size-4" />
          <span>홈으로</span>
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1 rounded-full bg-gradient-to-br from-[oklch(0.75_0.14_250)] to-[oklch(0.6_0.19_270)] px-4 py-2 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5"
        >
          <Printer className="size-4" />
          <span>인쇄하기</span>
        </button>
      </div>

      <p className="mb-4 text-center text-xs text-muted-foreground sm:hidden print:hidden">
        실제 인쇄물은 A4 가로 비율로 출력돼요. 이 보기는 화면 확인용입니다.
      </p>

      {sheets.map((sheet, idx) => (
        <div
          key={idx}
          className="mx-auto mb-4 flex w-full max-w-[1040px] flex-col rounded-2xl border border-border bg-white p-3 shadow-sm sm:aspect-[297/210] print:mb-0 print:aspect-auto print:h-[198mm] print:w-[285mm] print:max-w-none print:rounded-none print:border-0 print:shadow-none print:break-after-page"
        >
          <div className="grid min-h-0 flex-1 grid-cols-2 gap-2 sm:grid-cols-3 sm:grid-rows-3">
            {sheet.map((item, cellIdx) => (
              <div key={cellIdx} className="flex min-h-0 flex-col gap-1">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl border-2 border-border bg-muted/20 sm:aspect-auto sm:min-h-0 sm:flex-1">
                  <img src={item.img} alt="" className="size-full object-cover" />
                  <span className="absolute left-1.5 top-1.5 size-5 rounded border-2 border-foreground bg-white" />
                </div>
                <p className="text-center text-[13px] font-semibold leading-tight text-foreground sm:text-[15.6px]">
                  {item.caption}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
