// Game configuration. Edit here to swap illustrations, missions, or team names.
// Files in /public are served from the site root by Vite.

export type Illustration = {
  id: string;
  src: string;
  audioSrc: string;
  /** English sentence hint used for image alt text. */
  hint: string;
};

export const ILLUSTRATIONS: Illustration[] = [
  {
    id: "apple",
    src: "/images/illustrations/illust1.PNG",
    audioSrc: "/audio/1.mp3",
    hint: "This is an apple.",
  },
  {
    id: "dog",
    src: "/images/illustrations/illust2.PNG",
    audioSrc: "/audio/2.mp3",
    hint: "I have a dog.",
  },
  {
    id: "house",
    src: "/images/illustrations/illust3.PNG",
    audioSrc: "/audio/3.mp3",
    hint: "This is my house.",
  },
  {
    id: "sun",
    src: "/images/illustrations/illust4.PNG",
    audioSrc: "/audio/4.mp3",
    hint: "The sun is bright.",
  },
  {
    id: "book",
    src: "/images/illustrations/illust5.PNG",
    audioSrc: "/audio/5.mp3",
    hint: "I read a book.",
  },
  {
    id: "star",
    src: "/images/illustrations/illust6.PNG",
    audioSrc: "/audio/6.mp3",
    hint: "Look at the star!",
  },
  {
    id: "tree",
    src: "/images/illustrations/illust7.PNG",
    audioSrc: "/audio/7.mp3",
    hint: "The tree is tall.",
  },
];

export const MISSIONS: string[] = [
  "팀 전체가 동물 소리를 내며 하이파이브하기",
  "팀원 모두 손을 들고 'Hallelujah!' 외치기",
  "팀 이름을 3번 외치기",
  "팀원 모두 제자리에서 3번 점프하기",
  "포즈 하나를 취하면, 팀원들이 따라하기",
  "가장 큰 목소리로 그동안 배웠던 문장 하나 외치기",
  "부장 권사님과 가위바위보해서 이기기",
  "전도사님과 참참참해서 이기기",
  "옆 사람에게 칭찬 한 가지 진심으로 해주기",
  '상대 팀에게 "You are great!" 외치기',
  "상대 팀 전원과 돌아가며 가볍게 하이파이브(또는 주먹 인사) 나누기",
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
  faith: { name: "Faith", emoji: "✝️" },
  soccer: { name: "WorldCup", emoji: "⚽" },
};

export const TEAM_IDS: TeamId[] = ["faith", "soccer"];
