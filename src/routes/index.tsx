import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[oklch(0.97_0.04_200)] via-[oklch(0.98_0.03_95)] to-[oklch(0.95_0.06_320)] p-6">
      <div className="w-full max-w-xl rounded-[2rem] bg-white/80 p-10 text-center shadow-[var(--shadow-soft)] backdrop-blur">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-muted-foreground">
          JEBS English Worship
        </p>
        <h1 className="mt-2 text-4xl font-black text-foreground sm:text-5xl">
          영어예배 보드게임 🎲
        </h1>
        <p className="mt-4 text-muted-foreground">
          Faith 팀과 WorldCup 팀이 겨루는 온라인 보드게임입니다.
          <br />
          말판은 큰 화면에, 컨트롤러는 스마트폰에서 열어주세요.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link
            to="/board"
            className="rounded-2xl bg-gradient-to-br from-[oklch(0.75_0.14_250)] to-[oklch(0.6_0.19_270)] px-6 py-5 text-lg font-bold text-white shadow-lg transition hover:-translate-y-0.5"
          >
            🖥️ 말판 열기 (/board)
          </Link>
          <Link
            to="/controller"
            className="rounded-2xl bg-gradient-to-br from-[oklch(0.78_0.16_30)] to-[oklch(0.65_0.2_25)] px-6 py-5 text-lg font-bold text-white shadow-lg transition hover:-translate-y-0.5"
          >
            📱 컨트롤러 열기 (/controller)
          </Link>
        </div>
      </div>
    </div>
  );
}
