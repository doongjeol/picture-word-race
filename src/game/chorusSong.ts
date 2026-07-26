export type ChorusLine = {
  en: string;
  pron: string;
  ko: string;
};

export type ChorusSong = {
  title: string;
  channel: string;
  youtubeId: string;
  /** Playback is restricted to this segment, in seconds. */
  segmentStart: number;
  segmentEnd: number;
  lines: ChorusLine[];
};

export const CHORUS_SONG: ChorusSong = {
  title: "You Are",
  channel: "총회어린이영어비전캠프",
  youtubeId: "xfbofLKu06A",
  segmentStart: 71,
  segmentEnd: 110,
  lines: [
    {
      en: "You are the goodness that lights up my life",
      pron: "유 아 더 굿니스 댓 라이츠 업 마이 라이프",
      ko: "당신은 제 삶을 밝혀주는 선함이에요",
    },
    {
      en: "I will remember that Your way is better",
      pron: "아 윌 리멤버 댓 유어 웨이 이즈 베터",
      ko: "저는 당신의 길이 더 낫다는 것을 기억할게요",
    },
    {
      en: "You are the one that still shows me what's right",
      pron: "유 아 더 원 댓 스틸 쇼우즈 미 왓츠 라이트",
      ko: "당신은 여전히 제게 옳은 것을 보여주시는 분이에요",
    },
    {
      en: "I will remember that Your way is better",
      pron: "아 윌 리멤버 댓 유어 웨이 이즈 베터",
      ko: "저는 당신의 길이 더 낫다는 것을 기억할게요",
    },
    {
      en: "La la la la la la",
      pron: "라 라 라 라 라 라",
      ko: "라 라 라 라 라 라",
    },
    {
      en: "You shows me what's right and which way to go",
      pron: "유 쇼우즈 미 왓츠 라이트 앤 위치 웨이 투 고",
      ko: "당신은 제게 옳은 것과 가야 할 길을 보여주세요",
    },
  ],
};
