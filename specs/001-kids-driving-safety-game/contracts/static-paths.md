# 정적 파일 경로 계약 (GitHub Pages)

- 대상: `index.html`, `vite.config.ts`, `.github/workflows/deploy.yml`, `src/app/loader.ts`, 부팅 가드, E2E(Playwright) 관찰 지점.
- 게임은 서버 없는 정적 사이트입니다. 요청은 모두 같은 출처의 파일 GET이고, 실행 중 다른 주소로 나가는 요청은 없습니다(FR-085).

## 1. 주소와 `base`

| 항목 | 값 | 근거 |
|---|---|---|
| 공개 주소 | `https://kimwoo-ya.github.io/driving_game/` | git 원격 `kimwoo-ya/driving_game`, GitHub Pages 프로젝트 사이트 |
| Vite `base` | `'/driving_game/'` | vite.dev/guide/static-deploy "set base to '/<REPO>/'". 저장소 이름이 바뀌면 이 한 줄만 고침 |
| 화면 이동 | URL을 바꾸지 않음(라우터·`history.pushState` 없음) | 어느 화면에서 새로 고쳐도 같은 `index.html` → "찾을 수 없음" 없음(FR-002) |
| 받아들이는 주소 | `/driving_game/`, `/driving_game/index.html`, 그리고 쿼리 `?e2e`, `?perf` | 그 밖의 경로를 만들지 않으므로 `404.html`도 두지 않음 |
| 코드 안 경로 | 경로 문자열·`import.meta.env.BASE_URL` 조합을 쓰지 않음. 모든 파일은 `import`/`import.meta.glob`으로 받은 URL만 | 하위 경로가 빌드에서 한 번에 정해짐(FR-002) |

## 2. 빌드 결과 (`npm run build` → `dist/`)

```text
dist/
├── index.html                      # 셸: viewport 메타, 정적 로딩 그림(CSS), 부팅 가드(인라인), nomodule 안내
└── assets/
    ├── index-<hash>.js             # 앱 + three + 콘텐츠 데이터 + 인라인 SVG 그림 전부
    ├── index-<hash>.css
    ├── buggy-<hash>.glb … turtle-<hash>.glb    # 8개 (필수)
    └── <id>-<hash>.mp3 …           # 음성·효과음·배경음 (선택, 4 KiB 미만은 JS에 인라인될 수 있음)
```

| 약속 | 내용 | 근거 |
|---|---|---|
| 해시 이름 | JS·CSS·GLB·MP3는 `assets/[name]-[hash][extname]`(Vite 기본). 내용이 바뀐 파일만 이름이 바뀌고, 안 바뀐 파일은 배포 사이에 같은 이름 | vite.dev/guide/assets "imported assets … hashed" |
| `public/` | 쓰지 않음(고정 이름이 생기면 이전·새 파일이 섞임) | plan.md 에셋 파이프라인 |
| SVG 인라인 | `vite.config.ts`의 `build.assetsInlineLimit`를 함수로 두어 `.svg`는 항상 인라인(`true`), 나머지는 기본 규칙(4096바이트 미만 인라인). → 그림은 별도 요청이 없음(assets.md 2장) | Vite 8.3.1 문서 `build.assetsInlineLimit`: 타입 `number \| ((filePath, content) => boolean \| undefined)`, 기본 4096 |
| 동적 import 없음 | 첫 버전은 JS 청크 1개. 부팅 뒤 늦게 받는 JS가 없어 "나중에 필요한 JS 실패" 경로가 생기지 않음 | Edge "로딩·배포" |
| GLB 가져오기 | `.glb`는 Vite 기본 에셋 확장자가 아니므로 `?url` 쿼리로 가져옴(`import.meta.glob(…, { query: '?url', import: 'default', eager: true })`) | vite.dev/guide/assets "?url suffix", features "Custom Queries" |
| 받는 쪽 | 브라우저 요청은 `/driving_game/index.html`, `/driving_game/assets/index-<hash>.{js,css}`, GLB 8개, MP3(있는 만큼)뿐 | SC-022, SC-025 |

## 3. 캐시와 새 버전 배포 직후

| 사실·약속 | 내용 |
|---|---|
| 캐시 헤더 | GitHub Pages 응답 `cache-control: max-age=600`(2026-10-12 `curl -sI https://mrdoob.github.io/stats.js/`로 다시 확인). 공식 문서 근거는 미확인(plan O11) |
| 생길 수 있는 일 | 새 배포 뒤 최대 10분 동안 이전 `index.html`(또는 이전 JS)이 캐시에 남아 **이미 지워진 이전 해시 파일**을 요청 → 404. 배포는 사이트 전체를 바꾸므로 이전 해시 파일은 남지 않습니다. 내용이 같은 파일은 이름도 같아 404가 나지 않습니다 |
| JS·CSS 404 | 부팅 가드가 잡아 "다시 시도" 화면. 버튼은 `location.reload()`(4장) |
| GLB 404 | `loadRequired`/`retryFailed` 결과 `reloadNeeded: true` → `loadFailed` 화면의 다시 시도가 **페이지를 새로 엶**(저장 유지, 02 결정 A5) |
| 그 밖의 실패(연결 끊김, 정체) | 다시 시도 = 실패한 파일만 다시 받음, 페이지 유지(FR-004). 자동 반복 없음, 계속 실패하면 보호자용 "인터넷 연결을 확인해 주세요" |
| MP3 실패 | 무시(선택 파일) |
| 미확인 | Safari에서 새로 고침이 캐시된 `index.html`을 다시 확인하는지(plan O7) → 실제 기기 확인 |

## 4. `index.html` 셸과 부팅 가드

| 요소 | 약속 | 근거 |
|---|---|---|
| viewport 메타 | `width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover` | FR-020, FR-021 |
| 정적 로딩 그림 | JS가 오기 전에도 보이는 CSS만의 움직이는 로딩 그림(글 없음). main이 `loading` 화면을 그리면 대체 | FR-003, Edge "네트워크가 느리면 진행 표시가 계속 움직임" |
| 부팅 가드 | 인라인 `<script>`가 `window`에 `error` 리스너(capture)를 달아 `<script>`·`<link>` 불러오기 실패와 구문 오류를 잡습니다. **`document.body.dataset.screen`이 아직 없을 때만** 반응해 그림 + 보호자용 짧은 글 + "다시 시도" 버튼(`<button>`, 누르면 `location.reload()`)을 보여 줍니다. main이 `dataset.screen = 'boot'`를 적는 순간부터 가드는 아무것도 하지 않습니다(따로 해제 함수 없음) | FR-001, FR-004, Edge "새 버전 배포 직후" |
| `<script nomodule>` | 모듈 스크립트를 모르는 아주 오래된 브라우저에 "이 브라우저에서는 실행할 수 없어요" + Safari·Chrome 안내 | FR-005 |
| 3D 불가 | main이 `createStage`에서 `null`을 받으면 `unsupported` 화면(그림 + 보호자용 글 + 지원 브라우저) | FR-005, SC-022 |
| 외부 참조 | `<a href>`, 외부 `<script src>`, 외부 글꼴 `<link>`가 없음. 글꼴은 시스템 글꼴 | FR-085, FR-086 |

## 5. 외부 요청·외부 링크 검사 (Playwright, `tests/e2e/`)

| 검사 | 방법 | 기대 | 근거 |
|---|---|---|---|
| 하위 경로 로딩 | `vite preview`로 `http://localhost:4173/driving_game/` 열기 → `data-screen`이 `loading` → `start`. 어느 화면에서 `page.reload()`해도 `loading`부터 다시 | 실패 요청 0, `start` 도달 | FR-002, SC-022 |
| 외부 요청 0 | `page.on('request')`로 모든 요청 URL 수집 | 출처가 테스트 서버와 같거나 `data:`·`blob:`뿐 | FR-085, SC-025 |
| 외부 링크 0 | 시작·크레딧·선택·연습 목록·결과 화면마다 `page.locator('a[href]').count()` | 0 | FR-086, SC-026 |
| 권한 요청 0 | 초기화 스크립트로 `navigator.mediaDevices.getUserMedia`, `navigator.geolocation.*`, `Notification.requestPermission`, `DeviceMotionEvent.requestPermission`을 감시 | 호출 0 | FR-084, SC-025 |
| 소리 시작 전 무음 | 초기화 스크립트로 `AudioContext` 생성자 감시 | 시작 버튼 전 생성 0 | FR-066, SC-020 |
| 필수 파일 실패 | `page.route('**/*.glb', r => r.abort())` 하나 이상 | `data-screen=loadFailed`, 다시 시도 버튼. 경로 복구 뒤 다시 시도 → 페이지 새로 열림 없이 `start` | FR-004, SC-022 |
| 이전 파일 404 | `page.route('**/buggy-*.glb', r => r.fulfill({ status: 404 }))` | 다시 시도가 페이지를 새로 엶(`load` 이벤트 발생) | 02 결정 A5 |
| 3D 불가 | 초기화 스크립트로 `HTMLCanvasElement.prototype.getContext`가 `'webgl2'`에 `null` | `data-screen=unsupported`, 빈 화면 아님 | FR-005, SC-022 |
| 저장 불가 | 초기화 스크립트로 `localStorage` getter가 예외 | 게임 진행, `data-overlays`에 `storageNotice` 1회 | FR-080, SC-017 |

## 6. E2E·측정 관찰 지점

| 지점 | 언제 | 내용 | 바깥 영향 |
|---|---|---|---|
| `document.body.dataset.screen` | 항상 | 지금 `Screen` 값(`boot`, `unsupported`, `loading`, `loadFailed`, `start`, `credits`, `pickVehicle`, `pickCharacter`, `drivingLesson`, `practiceMenu`, `practice`, `race`, `raceResult`, `fatal`) | 부팅 가드의 "부팅 완료" 표시도 겸함 |
| `document.body.dataset.overlays` | 항상 | 켜진 겹침 이름을 공백으로 이음(`paused`, `rotate`, `storageNotice`, `contextLost`, `confirmExit`). 없으면 빈 문자열 | SC-006·SC-017 E2E용 |
| `window.__e2e` | URL에 `?e2e`가 있을 때만 | 읽기 전용 getter: `ticks`(누적 틱), `raceTicks`(경기 중이 아니면 `null`), `playerRank`(`null` 가능), `passenger`(아이 차 탑승객 `CharacterKindId` 또는 `null`) | 게임 동작을 바꾸지 않음. 같은 출처 쿼리라 외부 연결 아님 |
| `?perf` | URL에 `?perf`가 있을 때만 | `render/stage.ts`의 작은 표시: 첫 화면까지 시간(`performance.timeOrigin` 기준), 평균 fps, 가장 긴 프레임, 그리기 호출 | SC-024 측정용. 게임 동작을 바꾸지 않음 |

- 쿼리 플래그는 부팅 때 `new URLSearchParams(location.search)`로 한 번 읽습니다. 그 밖의 쿼리는 무시합니다.
- `vite preview`가 `base` 하위 경로로 제공하는지, Playwright WebKit headless에서 WebGL2가 되는지는 첫 E2E 태스크에서 확인합니다(plan O8).
