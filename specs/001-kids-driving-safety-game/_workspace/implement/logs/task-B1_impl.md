# Task B1 (T001~T006) Implementation Log

## 태스크

Phase 1 Setup: T001 package.json·설치, T002 .gitignore, T003 tsconfig·main 자리표시, T004 vite.config·index.html 셸, T005 Playwright 설정·boot.spec, T006 차량 GLB 5개·SHA256SUMS 8줄. T007(Pages 켜기)은 사용자 작업이라 범위 밖.

## 변경 파일

- `package.json` — name `driving_game`, private, type module, scripts 6개(plan "실행 명령" 표), 정확한 버전 의존성 6개(npm install --save-exact가 기록)
- `package-lock.json` — npm install 결과
- `.gitignore` — `node_modules/`, `dist/`, `test-results/`, `playwright-report/`, `assets-source/**/*.blend1` 추가(기존 5줄 유지)
- `tsconfig.json` — strict, noEmit, ES2022/ESNext/bundler, lib DOM·DOM.Iterable·ES2023, types vite/client, include src·tests, skipLibCheck
- `src/main.ts` — `document.body.dataset.screen = 'boot';` 한 줄
- `vite.config.ts` — `vitest/config` defineConfig, base `/driving_game/`, svg 항상 인라인, test.include `tests/unit/**/*.test.ts`, environment node
- `index.html` — viewport 메타(static-paths 4장), `<canvas id="stage">`, `<div id="ui">`(안에 글 없는 CSS 로딩 그림 — `#ui`를 화면이 다시 그리면 대체됨), `<div id="controls">`, `<script type="module" src="/src/main.ts">`. 부팅 가드·nomodule은 T088
- `playwright.config.ts` — testDir tests/e2e, chromium = Pixel 7 landscape, webkit = iPhone 14 landscape(둘 다 hasTouch), webServer build+preview :4173 strictPort, baseURL `/driving_game/`. WebKit WebGL2가 되어 skip 규칙 주석은 넣지 않음(T005 조건부 문구)
- `tests/e2e/boot.spec.ts` — ① data-screen=boot·404 없음 ② 엔진별 webgl2 출력
- `src/assets/models/{buggy,jeep,truck,wagon,banana-car}.glb` — quickstart 2.3 URL에서 받음(스크래치 폴더에 받아 체크섬 확인 후 `cp -n`, 캐릭터 3개 미변경)
- `src/assets/models/SHA256SUMS` — quickstart 2.3의 8줄
- `specs/001-kids-driving-safety-game/records/tooling-and-render.md` — 신설(O8 결과)

## 자체 검증 결과

| 태스크 | 명령 | 종료 코드 | 결과 |
|---|---|---|---|
| T001 | `npm ci` | 0 | |
| T001 | `npm ls --depth=0` | 0 | three@0.186.1, @types/three@0.186.0, typescript@7.0.2, vite@8.3.1, vitest@5.0.2, @playwright/test@1.63.0 6개뿐 |
| T002 | tasks.md 명령 `git check-ignore -q node_modules dist …` | 128 | git이 `-q`와 여러 경로를 함께 거부("--quiet is only valid with a single pathname"). 명령 자체 결함 → 경로별로 나눠 확인 |
| T002 | 경로별 `git check-ignore -q <p>` | node_modules 0, assets-source/characters/turtle.blend1 0, src/assets/models/turtle.glb 1, assets-source/characters/turtle.blend 1, dist 1(빌드 전 폴더 없음) → T004 빌드 뒤 dist 0 | 의도대로 |
| T003 | `npm run typecheck` | 0 | TypeScript 7.0.2 통과(6.0.3 불필요) |
| T004 | `npm run build` | 0 | |
| T004 | `grep -c '/driving_game/assets/index-' dist/index.html` | 0 | 1 |
| T005 | `npx playwright install chromium webkit` | 0 | |
| T005 | `npm run test:e2e` | 0 | 4 passed(2 tests × chromium·webkit), webgl2 chromium true·webkit true |
| T006 | `(cd src/assets/models && shasum -a 256 -c SHA256SUMS)` | 0 | 8줄 OK |
| T006 | `ls src/assets/models/*.glb \| wc -l` | 0 | 8 |

## 피드백 반영 이력

- attempt 1: 초기 구현
