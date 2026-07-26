export type ChantLine = {
  en: string;
  pron: string;
  ko: string;
};

export type Chant = {
  id: string;
  title: string;
  composer: string;
  youtubeId: string;
  lines: ChantLine[];
};

export const CHANTS: Chant[] = [
  {
    id: "break-the-chains",
    title: "Break the Chains",
    composer: "Yeoul J.",
    youtubeId: "7gJcDSEh0NY",
    lines: [
      {
        en: "Break the chains! Jesus makes us free!",
        pron: "브레이크 더 체인즈! 지저스 메익스 어스 프리!",
        ko: "사슬을 끊어요! 예수님이 우리를 자유케 하세요!",
      },
      {
        en: "Every wall falls down when You're with me.",
        pron: "에브리 월 폴즈 다운 웬 유어 위드 미",
        ko: "주님과 함께라면 모든 벽이 무너져요.",
      },
      {
        en: "Nothing in this world can steal my peace -",
        pron: "나띵 인 디스 월드 캔 스틸 마이 피스",
        ko: "이 세상 그 무엇도 내 평안을 빼앗을 수 없어요 -",
      },
      {
        en: "Break the chains! Jesus makes us free!",
        pron: "브레이크 더 체인즈! 지저스 메익스 어스 프리!",
        ko: "사슬을 끊어요! 예수님이 우리를 자유케 하세요!",
      },
    ],
  },
  {
    id: "anchor-up",
    title: "Anchor Up!",
    composer: "Yeoul J.",
    youtubeId: "D8sezfh1fuE",
    lines: [
      {
        en: "Step! Step! Step on the deck!",
        pron: "스텝! 스텝! 스텝 온 더 덱!",
        ko: "갑판 위를 걸어라! 걸어라! 걸어라!",
      },
      {
        en: "Shaking knees But I won't step back",
        pron: "쉐이킹 니즈 벗 아이 원트 스텝 백",
        ko: "무릎은 떨려도 뒤로 물러서지 않을 거야",
      },
      {
        en: "Hold! Hold Your position!",
        pron: "홀드! 홀드 유어 포지션!",
        ko: "지켜라! 네 자리를 지켜라!",
      },
      {
        en: "Sailors, Get ready!",
        pron: "세일러즈, 겟 레디!",
        ko: "선원들이여, 준비하라!",
      },
      {
        en: "Put the anchor up! Set sail with faith!",
        pron: "풋 디 앵커 업! 셋 세일 위드 페이스!",
        ko: "닻을 올려요! 믿음으로 항해를 시작해요!",
      },
      {
        en: "Fear NOT! Jesus is on board!",
        pron: "피어 낫! 지저스 이즈 온 보드!",
        ko: "두려워 마세요! 예수님이 함께 타고 계세요!",
      },
      {
        en: "Put the anchor up! Set sail with faith!",
        pron: "풋 디 앵커 업! 셋 세일 위드 페이스!",
        ko: "닻을 올려요! 믿음으로 항해를 시작해요!",
      },
      {
        en: "Fear NOT! Jesus is on board! (Hey!)",
        pron: "피어 낫! 지저스 이즈 온 보드! (헤이!)",
        ko: "두려워 마세요! 예수님이 함께 타고 계세요! (헤이!)",
      },
    ],
  },
];
