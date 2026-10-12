# Quickstart: 준비·실행·검증 안내

- 작성일: 2026-10-12 | 관련: [plan.md](./plan.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/overview.md)
- 게임 실행 코드와 `package.json`은 아직 없습니다. 캐릭터 GLB 3종과 리깅 생성·검증 스크립트는 준비되어 모델 검사를 실행할 수 있습니다. 아래 npm 명령은 게임 환경 준비 뒤부터 쓸 수 있습니다.
- **[승인 필요]** 표시가 있는 작업은 사용자 승인 뒤에만 실행합니다(AGENTS.md: 승인 전 설치·스캐폴딩 금지).
- 저장 형식은 [contracts/storage.md](./contracts/storage.md), 파일 경로는 [contracts/static-paths.md](./contracts/static-paths.md), 에셋 목록은 [contracts/assets.md](./contracts/assets.md)를 따릅니다.

## 1. 사전 조건

| 항목 | 기준 | 확인 방법 |
|---|---|---|
| Node.js | 24 LTS(Vitest 5 engines `^22.12.0 \|\| ^24.0.0 \|\| >=26.0.0`) | `node --version` → `v24.x` |
| npm | Node 24에 포함된 버전 | `npm --version` |
| git | 저장소 `https://github.com/kimwoo-ya/driving_game.git` | `git remote -v` |
| curl, shasum | macOS 기본 포함(Linux는 `sha256sum`) | `curl --version`, `shasum --version` |
| 브라우저 | 확인용 Chrome 또는 Safari, 실제 기기는 iPhone/iPad Safari와 Android Chrome | — |
| GitHub Pages | 저장소 Settings에서 Source를 "GitHub Actions"로 켬 **[사용자 작업]** | 저장소 Settings → Pages |

## 2. 준비 (처음 한 번)

### 2.1 의존성 설치 **[승인 필요]**

implement 단계 0에서 `package.json`을 만든 뒤 정확한 버전으로 처음 설치합니다(버전 근거는 [research.md](./research.md) "기술 선택").

```sh
npm install --save-exact three@0.186.1
npm install --save-dev --save-exact @types/three@0.186.0 typescript@7.0.2 vite@8.3.1 vitest@5.0.2 @playwright/test@1.63.0
```

그 뒤로는 잠금 파일 기준으로 설치합니다.

```sh
npm ci
```

기대 결과: 종료 코드 0, `node_modules/`가 생깁니다. 위 6개 패키지 외의 직접 의존성은 없습니다.

### 2.2 Playwright 브라우저 **[승인 필요]**

```sh
npx playwright install chromium webkit
```

기대 결과: 종료 코드 0. 브라우저는 사용자 캐시 폴더에 내려받아지고 저장소에는 아무것도 추가되지 않습니다.

### 2.3 모델 준비 — 캐릭터 3종 완료, 차량 5종 다운로드는 **[승인 필요]**

`src/assets/models/`에는 리깅을 추가한 Cool Bannana Guy·Turtle과 기존 뼈대를 보존한 Chicken Guy가 준비되어 있습니다. 원본 다운로드로 캐릭터 수정본을 덮어쓰지 않습니다. 아래 명령은 아직 없는 차량 5종만 받습니다. `modeling/` ZIP은 보존합니다. [리깅 작업 기록](_workspace/03_character-rigging.md)

```sh
mkdir -p src/assets/models
curl -fsSL -o src/assets/models/buggy.glb           https://static.poly.pizza/8036e526-b08a-4d8c-a4b3-0214097cbc18.glb
curl -fsSL -o src/assets/models/jeep.glb            https://static.poly.pizza/1c0f14fb-d3db-41e8-941b-f10fb7aa9681.glb
curl -fsSL -o src/assets/models/truck.glb           https://static.poly.pizza/0674a45b-d617-4e7d-91c2-56bbed93230b.glb
curl -fsSL -o src/assets/models/wagon.glb           https://static.poly.pizza/34b817d5-a238-4720-bc18-f065367eacda.glb
curl -fsSL -o src/assets/models/banana-car.glb      https://static.poly.pizza/834b3d40-b61f-411b-b63b-2adf51bc15c9.glb
```

현재 `src/assets/models/SHA256SUMS`는 준비된 캐릭터 3개를 검사합니다. 차량 5개를 받은 뒤에는 아래 전체 8개 기준으로 확장합니다(2026-10-12 최종 파일 기준, 해시와 파일 이름 사이는 공백 두 칸). 캐릭터 원본과 수정본의 해시는 다릅니다.

```text
3f17aa7cbdd7509fb56b1e2e6b4b5a4d384fbffa15e0bb2c0f5a87cc8f509d5c  buggy.glb
edb8d57bb7ec61358a34d53d2e484fa9fcdfb8f9b90ddecd576ed272b48a1e50  jeep.glb
634c5bd06c236044c1254474187218961db45a007cdd73a4cf51db7965d721c4  truck.glb
3441207d0eca5181ec20de64c877f3386e4ef38cfd441d1577b31e94642b40f6  wagon.glb
05d4dc8e88cb33ae3ed5cd3077a7eb607bb717b916f57408f5c48a11427d25ca  banana-car.glb
85d4f3671a9383f810a53bbac55da34b890e3eb0f16769c63d6643a1a436fae3  chicken-guy.glb
f7592cb93e340a6ceeaf138d34d4673d11a3212532f8d911138690e8b2ee0f5a  cool-banana-guy.glb
c08f4dd1b5d28b425b55e275a5083e24a55d055381712b9ca99d4d85bd81ffd9  turtle.glb
```

확인 명령입니다.

```sh
(cd src/assets/models && shasum -a 256 -c SHA256SUMS)
```

현재 기대 결과는 캐릭터 3줄 모두 `OK`, 종료 코드 0입니다. 차량 준비와 체크섬 확장 후에는 8줄 모두 `OK`, 합계 약 2.43 MB입니다. `FAILED`이면 파일이 기록과 다른 것이므로 원본 다운로드와 수정본을 혼동했는지, 파일을 다시 생성했는지 확인합니다. 의도한 변경이면 출처·변경 표시·렌더링 검사를 확인한 뒤 체크섬을 갱신합니다.

리깅된 GLB를 새 Blender 프로세스에서 확인하는 명령입니다. 새 리그 2종의 동작과 가중치, 원본 Chicken Guy 보존을 검사합니다.

```sh
blender --background --python-exit-code 1 --python scripts/verify-character-rigs.py
```

Blender 5.2.2 LTS와 공식 MCP는 이번 작업 기기에 설치되어 있습니다. 다른 개발 기기의 게임 빌드에는 Blender가 필요하지 않으며, 리깅 수정·재생성 시에만 필요합니다. 편집용 파일은 `assets-source/characters/`, 재생성 절차는 [리깅 작업 기록](_workspace/03_character-rigging.md)을 따릅니다.

### 2.4 배포 켜기 **[사용자 작업]**

1. 저장소 Settings → Pages → Build and deployment → Source를 "GitHub Actions"로 바꿉니다.
2. 크레딧 화면(tasks T094~T096)이 갖춰진 뒤 사용자 승인을 받아 `main`을 푸시합니다(tasks T093). 크레딧은 공개 배포의 필수 조건이라 그 전에는 푸시하지 않습니다. 첫 커밋은 2026-10-12에 만들었습니다.
3. Actions의 배포 워크플로가 성공하면 `https://kimwoo-ya.github.io/driving_game/`이 열립니다.

## 3. 실행·빌드·테스트 명령

| 명령 | 하는 일 | 기대 결과 |
|---|---|---|
| `npm run dev` | 개발 서버(`vite`) | `http://localhost:5173/driving_game/`에서 게임이 열림. Vite 8.3.3 이상으로 올리기 전에는 `--host`를 붙이지 않음 |
| `npm run typecheck` | `tsc --noEmit` | 종료 코드 0 |
| `npm test` | `vitest run`(`tests/unit/`) | 모든 테스트 통과, 종료 코드 0 |
| `npm run build` | `tsc --noEmit && vite build` | `dist/index.html`과 `dist/assets/*-<hash>.*`(JS·CSS·GLB 8개·MP3) 생성, 종료 코드 0. 그림 SVG는 JS 안에 인라인되어 따로 파일이 생기지 않음 |
| `npm run preview` | `vite preview` | `http://localhost:4173/driving_game/`에서 빌드 결과가 열림 |
| `npm run test:e2e` | `playwright test`(`tests/e2e/`, 빌드 + preview 자동 실행) | Chromium·WebKit 프로젝트 모두 통과, 종료 코드 0 |

- 실제 기기 확인은 배포 주소에서 하는 것을 기본으로 합니다. 같은 와이파이의 기기에서 개발 서버를 열려면 Vite를 8.3.3 이상으로 올린 뒤 `npm run dev -- --host`를 씁니다(개발 서버 보안 수정 때문).
- 성능 측정: 주소 끝에 `?perf`를 붙이면 평균 fps, 가장 긴 프레임, 그리기 호출, 삼각형 수, 로딩 시간이 표시됩니다.
- E2E 관찰: `document.body.dataset.screen`에 현재 화면 상태가, `document.body.dataset.overlays`에 켜진 겹침 안내 이름(`paused`, `rotate`, `storageNotice`, `contextLost`, `confirmExit`, 공백으로 이음)이 들어 있습니다. `?e2e`를 붙이면 `window.__e2e`로 틱 수, 경기 틱, 플레이어 순위, 아이 차 탑승객 id를 읽을 수 있습니다.
- 실행하지 못한 검사는 통과로 기록하지 않습니다. 명령, 종료 코드, 결과를 남깁니다.

## 4. 끝에서 끝까지 확인 시나리오

준비 공통 사항:

- 빌드 결과를 `npm run build && npm run preview`로 열고 `http://localhost:4173/driving_game/`에 접속합니다.
- 기기 흉내는 브라우저 개발 도구의 모바일 화면을 쓰되 **가로 방향**으로 합니다. 기록이 없는 상태에서 시작하려면 개발 도구 Application → Storage → "Clear site data"를 누릅니다.
- 화면 상태 이름은 [plan.md](./plan.md) "화면 흐름 상태 기계"를 따릅니다.

### S1. 하위 경로 로딩 (FR-001~003, SC-022)

1. `http://localhost:4173/driving_game/`을 엽니다.
2. 로딩 중, 시작 화면, 연습 중에 각각 새로 고칩니다.
3. 배포 뒤 `https://kimwoo-ya.github.io/driving_game/`에서 같은 확인을 합니다.

기대 결과:
- 로그인·설치·입력 없이 로딩 진행 그림이 보이고, 끝나면 시작 화면이 나옵니다(`data-screen`: `loading` → `start`).
- 네트워크 탭의 모든 요청이 같은 출처의 `/driving_game/` 아래이며 404가 없습니다. 외부 주소 요청은 0건입니다.
- 어느 시점에 새로 고쳐도 "찾을 수 없음" 없이 로딩부터 다시 시작합니다.
- 자동화: Playwright(Chromium·WebKit).

### S2. 차량·인물 선택 → 안전 연습 1개 완료 (US1, US2, SC-009, SC-032)

1. 세로로 열어 가로 안내가 나오는지 보고, 가로로 돌립니다.
2. 시작 → 차량 5종 중 하나 → 인물 3종(Chicken Guy, Cool Bannana Guy, Turtle) 중 하나를 고릅니다.
3. 조작 익히기에서 조향·액셀·브레이크·후진 전환 시범을 보고 직접 해 봅니다.
4. 신호 기다리기 연습에서 정지 신호에 정해진 위치에 멈추고, 진행 신호가 되어 안전해질 때까지 기다린 뒤 출발합니다.
5. 보행자 시점 안내를 끝까지 봅니다. 한 번은 소리를 끈 상태로 합니다.
6. 별도 시도로, 정지 신호에서 멈추지 않고 정지선을 넘어 봅니다.

기대 결과:
- 차량 5종과 인물 3종 모두 잠김 없이 그림으로 고를 수 있고, 고른 것이 확대·강조됩니다.
- 운전 화면에서 고른 인물이 아이 차에 타 있습니다.
- 처음 이용 흐름이라 연습 목록 없이 조작 익히기 → 신호 기다리기로 바로 이어집니다.
- 보행자 시점 안내의 주인공은 Chicken Guy입니다. 카드는 소리를 꺼도 자동으로 넘어갑니다.
- 안내가 끝나면 칭찬 그림·음성과 완료 표시가 나오고, 다음 연습(횡단 전 주변 차량 확인하기)으로 이어집니다.
- 정지선을 넘으면 게임 전체가 멈춘 화면과 짧은 설명이 나옵니다. 사고 장면이나 위협적인 소리는 없습니다. 그 구간 시작 위치에서 전진·정지 상태로 다시 시작하며, 누르던 버튼은 풀려 있습니다.
- 15조합(인물 3 × 차량 5)은 실제 기기에서 탑승객이 보이는지 확인합니다.

### S3. 레이싱 열림과 완주 (US3, US4, SC-009, SC-015)

1. S2에 이어 세 연습을 모두 완료합니다.
2. 시작 화면에서 레이싱 → 차량 → 인물을 고릅니다.
3. 출발 신호 전에 액셀을 누르고 있다가, 정상 방향으로 바퀴를 모두 돌고 결승선을 통과합니다.
4. 재도전을 누릅니다.

기대 결과:
- 횡단 전 주변 차량 확인하기의 보행자 시점 안내에서 Chicken Guy가 고개를 왼쪽·오른쪽·다시 왼쪽으로 돌리고 손을 듭니다. 손 들기 바로 뒤에는 "차가 완전히 멈췄는지 확인" 카드가 나옵니다(FR-093, SC-032).
- 세 번째 완료 순간 레이싱이 열렸다는 축하 그림·음성이 나오고 시작 화면으로 돌아갑니다. 레이싱 버튼의 잠김 그림이 사라집니다.
- 개발 도구 Application → Local Storage의 `driving_game:save`에 튜토리얼 완료가 기록됩니다(형식은 [contracts/storage.md](./contracts/storage.md)).
- 출발 신호 전에는 어느 차도 움직이지 않고, 신호 순간 바로 출발합니다.
- 완주하면 순위, 완주 시간(`m:ss.cc`), 최고 기록, 새 기록 표시가 나옵니다.
- 재도전하면 위치·바퀴·순위·시간·입력·후진 상태가 모두 처음으로 돌아갑니다.

### S4. 저장 복원 (US3, US5, SC-016, SC-018)

1. S3 뒤 일시정지 화면이나 시작 화면에서 배경음을 끕니다.
2. 탭을 닫고 같은 브라우저로 다시 엽니다.
3. 개발 도구 콘솔에서 `localStorage.setItem('driving_game:save', '{')`를 실행하고 새로 고칩니다.

기대 결과:
- 2 이후: 레이싱이 열려 있고, 배경음이 꺼져 있으며, 결과 화면에 이전 최고 기록이 나옵니다(3/3 복원). 연습을 반복할 필요가 없습니다.
- 3 이후: 게임이 멈추거나 빈 화면이 되지 않습니다. 레이싱 잠김, 기록 없음, 소리 켜짐의 기본값으로 시작합니다. 손상 값은 조용히 처리하므로 저장 불가 안내는 나오지 않습니다.

### S5. 저장 불가 (US3-8, FR-080, SC-017)

1. 저장소 접근이 막힌 환경을 만듭니다.
   - 자동화: Playwright 초기화 스크립트로 localStorage 접근이 예외를 내게 합니다.
   - 수동: Chrome 설정 → 개인정보 보호 → 쿠키 설정에서 `http://localhost:4173`을 "쿠키를 사용할 수 없는 사이트"에 추가합니다(쿠키 차단 시 브라우저가 저장을 막는다고 MDN이 설명). 이 수동 방법이 실제로 localStorage를 막는지는 확인이 필요합니다.
2. 접속 → 세 연습 완료 → 레이싱 완주 → 새로 고침 순서로 진행합니다.

기대 결과:
- 게임이 실행되고, 기록이 남지 않는다는 짧은 안내가 실행마다 1번만 나옵니다(`data-overlays`에 `storageNotice`가 1번 켜짐).
- 이번 실행에서 세 연습을 마치면 레이싱을 이용할 수 있고, 결과 화면이 늦어지거나 막히지 않습니다.
- 새로 고치면 레이싱은 다시 잠겨 있습니다.

### S6. 3D 불가 (US7-3, FR-005, SC-022)

1. 3D를 쓸 수 없는 환경을 만듭니다.
   - 자동화: Playwright 초기화 스크립트로 `getContext('webgl2')`가 null을 돌려주게 합니다.
   - 수동 대안: Chrome을 3D API 비활성 실행 옵션으로 여는 방법이 있지만 확인이 필요해, 자동화를 우선합니다.
2. 게임 주소를 엽니다.

기대 결과:
- 빈 화면이 아니라, 이 기기·브라우저에서는 실행할 수 없다는 그림과 보호자용 짧은 글, 지원 브라우저(Safari, Chrome) 안내가 나옵니다(`data-screen=unsupported`).
- 저장된 기록은 지워지지 않습니다.

### S7. 로딩 실패와 다시 시도 (US7-2, FR-004, SC-022)

1. 네트워크 실패:
   1. 개발 도구 Network에서 요청 차단 규칙 `*.glb`를 켜거나 Offline으로 두고 주소를 엽니다.
   2. 1분 동안 아무것도 누르지 않습니다.
   3. 차단을 풀고 다시 시도를 누릅니다.
2. 이전 배포 파일 404:
   - 자동화: Playwright가 GLB 하나에 404를 돌려주게 하고 다시 시도를 누릅니다.
3. 느린 네트워크:
   - Network 제한(예: Slow 3G)에서 엽니다.

기대 결과:
- 1: 그림과 보호자용 짧은 글로 실패를 알리고 다시 시도 버튼이 나옵니다(`data-screen=loadFailed`).
- 1-2: 기다리는 동안 자동으로 다시 요청하지 않습니다(네트워크 탭 요청 수 변화 없음).
- 1-3: 실패한 파일만 다시 받고, 페이지를 새로 열지 않고 시작 화면까지 열립니다(문서 요청이 새로 생기지 않음).
- 2: 다시 시도가 페이지를 새로 엽니다(문서 요청 발생). 저장된 기록은 유지됩니다.
- 3: 진행 표시가 계속 움직이고, 오랫동안 진행이 없으면 다시 시도가 제공됩니다.

## 5. 다음에 볼 문서

- 모듈 구조, 테스트 전략(SC별 담당), 작업 단계: [plan.md](./plan.md)
- 결정 근거와 출처: [research.md](./research.md)
- 게임 state·저장 형식: [data-model.md](./data-model.md)
- 모듈 인터페이스·이벤트·에셋·콘텐츠 데이터·정적 경로: [contracts/overview.md](./contracts/overview.md), [contracts/modules.md](./contracts/modules.md), [contracts/events.md](./contracts/events.md), [contracts/storage.md](./contracts/storage.md), [contracts/assets.md](./contracts/assets.md), [contracts/content-data.md](./contracts/content-data.md), [contracts/static-paths.md](./contracts/static-paths.md)
