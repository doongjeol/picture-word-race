# JEBS Picture Word Race

JEBS 영어예배 활동을 위한 팀 대항 주사위 보드게임입니다. Faith 팀과 WorldCup 팀이 ㅁ자 보드를 돌며, 삽화를 보고 알맞은 영어 문장을 말하는 방식으로 그림-문장 매칭을 연습합니다.

## 기술 스택

- React 19
- Vite
- TanStack Router / TanStack Start
- Tailwind CSS 4
- Supabase
- shadcn/ui 기반 Radix UI 컴포넌트
- Lucide React, canvas-confetti, qrcode.react

## 로컬 개발

1. 저장소를 클론합니다.

```bash
git clone <repository-url>
cd picture-word-race
```

2. 의존성을 설치합니다.

```bash
npm install
```

3. 개발 서버를 실행합니다.

```bash
npm run dev
```

4. 브라우저에서 접속합니다.

```text
http://localhost:5173
```

주요 화면은 `/board`와 `/controller`입니다.

## 환경변수

Supabase 연결을 위해 `.env.example`을 참고해 `.env`를 설정합니다. 실제 값은 저장소에 커밋하지 않습니다.

Cloudflare Pages에도 같은 Supabase 환경변수를 Production/Preview 환경에 등록해야 합니다.

## 배포

GitHub에 push하면 연결된 Cloudflare Pages 프로젝트에서 자동 배포됩니다.

권장 Cloudflare Pages 설정:

- Build command: `npm run build`
- Build output directory: `.output/public`
- Environment variables: `.env.example`의 Supabase 키 등록

이 프로젝트는 Lovable의 TanStack Start/Nitro 설정을 사용하므로 일반 Vite SPA의 기본 output인 `dist`가 아니라 `.output/public`이 생성됩니다. `vite.config.ts`에는 별도 `base`가 설정되어 있지 않아 루트 도메인 및 Pages 기본 경로에서 정적 자산 경로가 깨지지 않습니다.

## 폴더 구조

- `src/routes`: TanStack Router 라우트
- `src/game`: 보드, 컨트롤러, 게임 상태 및 설정
- `src/integrations/supabase`: Supabase 클라이언트와 인증 보조 코드
- `public/images/illustrations`: 앱에서 사용하는 삽화 이미지
- `images`: 원본 삽화 이미지 보관 위치
- `supabase`: Supabase 설정 및 마이그레이션

## 게임 규칙 요약

- 두 팀이 플레이합니다: Faith, WorldCup
- ㅁ자 형태의 보드에서 주사위를 굴려 이동합니다.
- 삽화 칸에 도착하면 그림을 보고 알맞은 영어 문장을 말합니다.
- 정답이면 보너스로 1칸 더 이동합니다.
- 열쇠 칸에 도착하면 미션을 수행합니다.
- 보드를 완주하는 팀이 승리합니다.
