import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Home, Pause, Play, RotateCcw } from "lucide-react";
import { CHORUS_SONG } from "@/game/chorusSong";

export const Route = createFileRoute("/chorus")({
  component: ChorusScreen,
});

type YTPlayerState = {
  PLAYING: number;
  PAUSED: number;
  ENDED: number;
};

type YTPlayerEvent = { data: number };

type YTPlayer = {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  setPlaybackRate(rate: number): void;
  getCurrentTime(): number;
  destroy(): void;
};

type YTPlayerConfig = {
  videoId: string;
  playerVars?: Record<string, number>;
  events?: {
    onReady?: () => void;
    onStateChange?: (event: YTPlayerEvent) => void;
  };
};

declare global {
  interface Window {
    YT?: {
      Player: new (el: HTMLElement, config: YTPlayerConfig) => YTPlayer;
      PlayerState: YTPlayerState;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

const SPEEDS = [0.5, 0.75, 0.8, 0.9, 1, 1.25, 1.5];
const { segmentStart, segmentEnd } = CHORUS_SONG;

function ChorusScreen() {
  const mountRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    function createPlayer() {
      if (!mountRef.current || !window.YT) return;
      playerRef.current = new window.YT.Player(mountRef.current, {
        videoId: CHORUS_SONG.youtubeId,
        playerVars: { controls: 0, playsinline: 1, start: segmentStart, end: segmentEnd },
        events: {
          onStateChange: (event) => {
            setPlaying(event.data === window.YT?.PlayerState.PLAYING);
          },
        },
      });
    }

    if (window.YT?.Player) {
      createPlayer();
    } else {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
      window.onYouTubeIframeAPIReady = createPlayer;
    }

    return () => {
      playerRef.current?.destroy();
    };
  }, []);

  // Safety net: some browsers don't reliably honor the `end` playerVar, so
  // also stop playback once the segment boundary is reached.
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      if ((playerRef.current?.getCurrentTime() ?? 0) >= segmentEnd) {
        playerRef.current?.pauseVideo();
      }
    }, 250);
    return () => clearInterval(id);
  }, [playing]);

  const togglePlay = () => {
    if (playing) playerRef.current?.pauseVideo();
    else playerRef.current?.playVideo();
  };

  const restart = () => {
    playerRef.current?.seekTo(segmentStart, true);
    playerRef.current?.playVideo();
  };

  const changeSpeed = (rate: number) => {
    setSpeed(rate);
    playerRef.current?.setPlaybackRate(rate);
  };

  return (
    <div className="flex min-h-screen flex-col overflow-auto bg-gradient-to-br from-[oklch(0.95_0.06_20)] via-[oklch(0.96_0.05_60)] to-[oklch(0.95_0.05_260)] p-4 md:h-screen md:overflow-hidden">
      {/* YouTube player mounts here. Positioned off-screen at normal size (not shrunk to 0)
          since YouTube pauses playback if the player element collapses to near-zero size. */}
      <div
        ref={mountRef}
        className="pointer-events-none fixed -left-[2000px] top-0 h-[180px] w-[320px]"
      />

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col md:min-h-0">
        <div className="flex shrink-0 items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-1 rounded-full bg-white/70 px-3 py-1.5 text-sm font-bold text-foreground shadow-md backdrop-blur transition hover:bg-white"
          >
            <Home className="size-4" />
            <span className="hidden sm:inline">홈으로</span>
          </Link>
          <h1 className="text-xl font-black text-foreground sm:text-2xl">🎤 찬양 후렴 배우기</h1>
          <div className="w-10" />
        </div>

        <div className="mt-3 grid flex-1 grid-cols-1 gap-4 md:min-h-0 md:grid-cols-[220px_1fr] lg:grid-cols-[260px_1fr]">
          <div className="flex flex-col items-center justify-center gap-3 rounded-[2rem] bg-white/85 p-4 text-center shadow-[var(--shadow-pop)] backdrop-blur">
            <div>
              <p className="text-base font-black text-foreground">{CHORUS_SONG.title}</p>
              <p className="text-xs font-semibold text-muted-foreground">{CHORUS_SONG.channel}</p>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={restart}
                aria-label="처음부터 다시 재생"
                className="flex size-10 items-center justify-center rounded-full bg-white/80 text-foreground shadow-md transition hover:-translate-y-0.5 hover:bg-white"
              >
                <RotateCcw className="size-4" />
              </button>
              <button
                onClick={togglePlay}
                aria-label={playing ? "일시정지" : "재생"}
                className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-[oklch(0.75_0.14_25)] to-[oklch(0.62_0.2_20)] text-white shadow-lg transition hover:-translate-y-0.5"
              >
                {playing ? (
                  <Pause className="size-7" fill="currentColor" />
                ) : (
                  <Play className="size-7 translate-x-0.5" fill="currentColor" />
                )}
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {SPEEDS.map((rate) => (
                <button
                  key={rate}
                  onClick={() => changeSpeed(rate)}
                  className={`rounded-full px-2.5 py-1.5 text-xs font-bold shadow-sm transition ${
                    speed === rate
                      ? "bg-gradient-to-br from-[oklch(0.75_0.14_250)] to-[oklch(0.6_0.19_270)] text-white"
                      : "bg-muted text-foreground hover:bg-muted/70"
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          <div className="flex min-h-0 flex-col rounded-[2rem] bg-white/85 p-6 shadow-[var(--shadow-pop)] backdrop-blur">
            <p className="shrink-0 text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">
              가사 &amp; 발음
            </p>
            {CHORUS_SONG.lines.length === 0 ? (
              <div className="flex flex-1 items-center justify-center text-center text-lg font-medium text-muted-foreground">
                가사를 아직 준비 중이에요. 후렴 가사를 알려주시면 채워드릴게요!
              </div>
            ) : (
              <div
                className="mt-3 grid flex-1 gap-2"
                style={{ gridTemplateRows: `repeat(${CHORUS_SONG.lines.length}, minmax(0, 1fr))` }}
              >
                {CHORUS_SONG.lines.map((line, i) => (
                  <div
                    key={i}
                    className="flex min-h-0 flex-col justify-center overflow-hidden rounded-2xl bg-muted px-6"
                  >
                    <p className="text-[clamp(18px,3.6vh,42px)] leading-tight font-black text-foreground">
                      {line.en}
                    </p>
                    <p className="mt-1 text-[clamp(14px,2.6vh,30px)] leading-tight font-bold text-[oklch(0.6_0.19_270)]">
                      [{line.pron}]
                    </p>
                    <p className="mt-1 text-[clamp(12px,1.8vh,22px)] leading-tight text-muted-foreground">
                      {line.ko}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
