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

export const TIMER_MISSIONS: string[] = [
  "Point to something yellow in the worship room within 10 seconds.\n예배실에서 노란색 10초 안에 가리키기",
  "Point to something green in the worship room within 10 seconds.\n예배실에서 초록색 10초 안에 가리키기",
  "Line up by height as a team within 10 seconds.\n10초안에 팀 전체가 키 순서대로 서기",
  "High-five an opponent whose name includes ㅎ.\n이름에 ㅎ들어가는 상대 팀원과 하이파이브 하고 오기",
  "High-five a teacher whose name includes ㅇ within 10 seconds.\n10초 안에 이름에 ㅇ들어가는 선생님과 하이파이브하고 오기",
];

export const MISSIONS: string[] = [
  "Raise your hands and shout 'Hallelujah!' together.\n팀원 모두 손을 들고 'Hallelujah!' 외치기",
  "Shout your team name three times.\n팀 이름을 3번 외치기",
  "Everyone on the team jumps in place three times.\n팀원 모두 제자리에서 3번 점프하기",
  "Strike a pose together on 'One, two, three!' for something that reminds you of Jesus. Everyone must make the same pose to succeed.\n팀원들과 예수님하면 생각나는 것 하나둘셋!하면 포즈취하기 (포즈가 모두 같아야 성공)",
  "Shout one sentence you have learned so far in your loudest voice.\n가장 큰 목소리로 그동안 배웠던 문장 하나 외치기",
  "Beat the lead teacher at rock-paper-scissors.\n부장 선생님과 가위바위보해서 이기기",
  "Choose the same rock-paper-scissors move as the pastor.\n전도사님과 가위 바위 보 같은 거 내기",
  "Give a sincere compliment to the person next to you.\n옆 사람에게 칭찬 한 가지 진심으로 해주기",
  'Shout "You are great!" to the other team.\n상대 팀에게 "You are great!" 외치기',
  "Go around and gently fist-bump every member of the other team.\n상대 팀 전원과 돌아가며 가볍게 주먹 인사 나누기",
  ...TIMER_MISSIONS,
];

export const BOARD_SIZE = 20; // total tiles around the square (5 per side)
export const SIDE = 5;
const KEY_TILE_INDICES = new Set([0, 2, 5, 8, 10, 13, 15, 18]);

export type TileKind = "illustration" | "key";
export type Tile = {
  index: number;
  kind: TileKind;
  illustration?: Illustration;
};

/** Build a stable board with key tiles at corners and one extra on each side. */
export function buildBoard(): Tile[] {
  const tiles: Tile[] = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    if (KEY_TILE_INDICES.has(i)) {
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
