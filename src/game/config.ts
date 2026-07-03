// Game configuration. Edit here to swap illustrations, missions, or team names.
// Illustration images live in /public/images/illustrations/ and are referenced
// as absolute paths — replace those files directly to change art.

export type Illustration = {
  id: string;
  src: string;
  audioSrc: string;
  /** English sentence hint (shown small under the image for the teacher). */
  hint: string;
};

export const ILLUSTRATIONS: Illustration[] = [
  { id: "apple", src: "/images/illustrations/illust1.PNG", audioSrc: "/audio/1.mp3", hint: "This is an apple." },
  { id: "dog", src: "/images/illustrations/illust2.PNG", audioSrc: "/audio/2.mp3", hint: "I have a dog." },
  { id: "house", src: "/images/illustrations/illust3.PNG", audioSrc: "/audio/3.mp3", hint: "This is my house." },
  { id: "sun", src: "/images/illustrations/illust4.PNG", audioSrc: "/audio/4.mp3", hint: "The sun is bright." },
  { id: "book", src: "/images/illustrations/illust5.PNG", audioSrc: "/audio/5.mp3", hint: "I read a book." },
  { id: "star", src: "/images/illustrations/illust6.PNG", audioSrc: "/audio/6.mp3", hint: "Look at the star!" },
  { id: "tree", src: "/images/illustrations/illust7.PNG", audioSrc: "/audio/7.mp3", hint: "The tree is tall." },
];

export const MISSIONS: string[] = [
  "팀 전체가 동물 소리를 내며 하이파이브하기",
  "가장 큰 목소리로 오늘 배운 성경 구절 한 줄 외치기",
  "팀원 모두 제자리에서 5번 점프하기",
  "상대팀에게 윙크하며 인사하기",
  "팀 이름을 영어로 3번 외치기",
  "팀원 모두 손을 잡고 'Hallelujah!' 외치기",
  "팀장이 춤 동작 하나, 팀원들이 따라하기",
];

export const BOARD_SIZE = 20; // total tiles around the square (5 per side)
export const SIDE = 5;

export type TileKind = "illustration" | "key";
export type Tile = {
  index: number;
  kind: TileKind;
  illustration?: Illustration;
};

/** Build a stable board: every 5th tile (0, 5, 10, 15) is a key tile. */
export function buildBoard(): Tile[] {
  const tiles: Tile[] = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    if (i % SIDE === 0) {
      tiles.push({ index: i, kind: "key" });
    } else {
      const ill = ILLUSTRATIONS[i % ILLUSTRATIONS.length];
      tiles.push({ index: i, kind: "illustration", illustration: ill });
    }
  }
  return tiles;
}

export type TeamId = "faith" | "soccer";
export const TEAMS: Record<TeamId, { name: string; emoji: string }> = {
  faith: { name: "Faith", emoji: "🔥" },
  soccer: { name: "Soccer", emoji: "⚽" },
};

export const TEAM_IDS: TeamId[] = ["faith", "soccer"];
