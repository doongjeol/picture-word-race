export type SailingWord = {
  emoji: string;
  en: string;
  pron: string;
  ko: string;
  sentence: string;
};

export const SAILING_WORDS: SailingWord[] = [
  { emoji: "🚢", en: "ship", pron: "십", ko: "배", sentence: "The ship is very big." },
  { emoji: "🛶", en: "boat", pron: "보우트", ko: "보트, 배", sentence: "We ride a boat." },
  {
    emoji: "⛵",
    en: "sailboat",
    pron: "세일보우트",
    ko: "돛단배",
    sentence: "The sailboat has a sail.",
  },
  {
    emoji: "🧑‍✈️",
    en: "captain",
    pron: "캡틴",
    ko: "선장",
    sentence: "The captain leads the ship.",
  },
  {
    emoji: "⚓",
    en: "sailor",
    pron: "세일러",
    ko: "선원",
    sentence: "The sailor works on the ship.",
  },
  { emoji: "🌊", en: "sea", pron: "시", ko: "바다", sentence: "The sea is blue." },
  { emoji: "🐋", en: "ocean", pron: "오션", ko: "대양, 바다", sentence: "The ocean is very deep." },
  { emoji: "🗺️", en: "map", pron: "맵", ko: "지도", sentence: "Look at the map." },
  {
    emoji: "🧭",
    en: "compass",
    pron: "컴퍼스",
    ko: "나침반",
    sentence: "The compass points north.",
  },
  { emoji: "⛵", en: "sail", pron: "세일", ko: "항해하다", sentence: "We sail across the sea." },
  { emoji: "⚓", en: "anchor", pron: "앵커", ko: "닻", sentence: "Drop the anchor here." },
  { emoji: "🪢", en: "rope", pron: "로프", ko: "밧줄", sentence: "Pull the rope." },
  { emoji: "🌊", en: "wave", pron: "웨이브", ko: "파도", sentence: "The wave is so high." },
  { emoji: "💨", en: "wind", pron: "윈드", ko: "바람", sentence: "The wind is strong today." },
  { emoji: "⛈️", en: "storm", pron: "스톰", ko: "폭풍", sentence: "A storm is coming." },
  {
    emoji: "💰",
    en: "treasure",
    pron: "트레저",
    ko: "보물",
    sentence: "We found the treasure!",
  },
  { emoji: "🧳", en: "journey", pron: "저니", ko: "여행", sentence: "Enjoy your journey." },
];
