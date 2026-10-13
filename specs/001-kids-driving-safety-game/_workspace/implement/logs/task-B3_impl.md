# Task B3 (T022~T029) Implementation Log

## 태스크

Phase 2 Foundational 뒷부분: 로더·콘텐츠 GLB 검사·렌더러(stage·models)·시작 화면·흐름 골격·부팅 E2E·배포 워크플로 파일. 함께 B2 reviewer 비필수 제안 2건 반영(msg_44817d2ce995).

## 변경 파일

- `src/app/loader.ts` (T022) — `AssetId`, `ASSET_URLS`(`import.meta.glob` `?url` eager, 앞 `/src/assets/` 뗌), `LoadResult`, `loadRequired`(GLB 8개만), `retryFailed`(실패 파일만, 기존 files 유지), `loadSounds`(한 번만 받음, 실패 파일은 빠짐). reject 없음. 정체 판정 `STALL_MS` 15초(실제 시간, `AbortController`). 404면 `reloadNeeded`. 진행률 = 파일마다 같은 비중의 받은 바이트 비율 합(크기 모르는 파일은 끝날 때 1), 최댓값 유지로 단조 증가
- `tests/unit/loader.test.ts` (T022) 신설 7건 — 모델 8개 키, 진행률 0→1 단조, 404 → reloadNeeded, 네트워크 오류 → failed, 정체 → failed(가짜 타이머), retryFailed, loadSounds(테스트에서 ASSET_URLS에 소리 항목 2개를 임시로 넣어 확인 — 아직 소리 파일이 없어서)
- `tests/unit/content.test.ts` (T023) — #12(모델 8개 ASSET_URLS), #14 GLB(같은 `import.meta.glob`을 `?raw`로 읽어 JSON 청크의 animations 이름 확인) 2건 추가
- `src/render/stage.ts` (T024) — `Stage`(contract 3개 + 렌더러 내부용 `follow(pose)` 1개 추가: 뒤에서 내려다보는 고정 오프셋 카메라, 오프셋은 DRIVING_SPEC 기준), `createStage`(WebGLRenderer 생성 예외면 null, 조명, 픽셀 비율 `min(devicePixelRatio, MAX_PIXEL_RATIO=2)`, window resize, webglcontextlost/restored → onContext)
- `src/render/models.ts` (T025) — `PreparedModel`, `prepareModel`(GLTFLoader parseAsync, world 행렬 갱신, 차량만 재질별 mergeGeometries·실패하면 원래 메시, yawDeg 회전, 차량 Z 길이 = bodyLength·인물 키 1 m, 바닥 0·가로 중심 원점, id별 보관), `preparedModel(id)`(보관한 모델 조회), `cloneModel`(SkinnedMesh가 있으면 SkeletonUtils.clone, 아니면 clone())
- `src/ui/screens.ts` (T026) — `picture(id, shape)`(D4: ASSET_URLS에 그림이 있으면 img, 없으면 CSS 도형), `showStart`(큰 시작 버튼, aria-label, 글은 넣지 않음)
- `src/style.css` (T026) — 캔버스 전체 화면, `#ui` 겹침 층, 시스템 글꼴, 시작 버튼·재생 도형
- `src/app/flow.ts` (T027) — `ScreenState`·`Screen`·`PlaySession`, `startFlow`: loading → loadRequired → 8개 prepareModel → start, 실패면 loadFailed만, dataset.screen·dataset.overlays, `startLoop(tick, draw)`, `?e2e`면 `window.__e2e.ticks` getter. run·storageOk는 이후 태스크에서 씀(시작 버튼 연결은 T039)
- `src/main.ts` (T027) — modules.md 8.4 순서(boot → createStage null이면 unsupported → loadSave → createRunState → startFlow), style.css import
- `tests/e2e/boot.spec.ts` (T028) — ① boot → loading → start(MutationObserver로 화면 순서 기록)·404 없음 ② start에서 새로 고침 뒤 같은 순서 ③ 모든 요청이 테스트 서버·data:·blob: ④ WebGL2 출력(T005에서 유지)
- `.github/workflows/deploy.yml` (T029) — plan "배포" 그대로. **푸시 안 함**(T093)
- `specs/001-kids-driving-safety-game/records/tooling-and-render.md` — T022·T023·T028 행 추가
- B2 reviewer 제안: `src/content/rules.ts`의 `D` → `PLACEHOLDER_CARD_TICKS`(B14 `*_TICKS` 이름 규칙), `tests/unit/content.test.ts` #16에 `segment`·`afterStep` 정수·0 이상 검사 추가

## 구현 판단 메모(검토 요청)

- `Stage.follow`: modules.md 9장은 렌더러 내부를 구현 재량으로 두고 Stage를 3개 필드로 적었음. 렌더러(townView 등)가 카메라를 아이 차에 맞추려면 진입점이 필요해 메서드 1개를 더함. flow는 부르지 않음.
- `ui/screens.ts`가 `app/loader`의 `ASSET_URLS`를 import(D4 규칙). loader는 content만 import하므로 순환 없음.
- 진행률 계산은 파일 단위 같은 비중(파일 안은 바이트). 전체 바이트 합 방식은 응답 헤더가 오는 순서에 따라 비율이 줄 수 있어 택하지 않음.
- `npm run build`에서 JS 청크 500 kB 초과 경고(three 포함 약 620 kB)는 경고만이며, static-paths.md가 동적 import 없는 단일 청크를 정해 그대로 둠.

## 자체 검증 결과

| 태스크 | 명령 | 종료 코드 | 결과 |
|---|---|---|---|
| T022 | `npm test -- tests/unit/loader.test.ts` | 0 | 7 passed |
| T023 | `npm test -- tests/unit/content.test.ts` | 0 | 16 passed |
| T024, T025, T026 | `npm run typecheck` | 0 | |
| T027 | `npm run build` | 0 | dist에 index JS·CSS·GLB 8개 |
| T028 | `npm run test:e2e -- tests/e2e/boot.spec.ts` | 0 | 8 passed(4건 × chromium·webkit), webgl2 둘 다 true |
| T029 | `npm ci && npm test && npm run build` | 0 | |
| 전체 | `npm test` / `npm run test:e2e` | 0 / 0 | 72 passed / 8 passed |

## 피드백 반영 이력

- attempt 1: 초기 구현(+ B2 reviewer 비필수 제안 2건)
- attempt 2 (2026-10-12, validator FAIL msg_145744c4416d 반영, 질문 msg_b78bc32cbd0b / 재전달 msg_6f70c141d95a 답변대로): T022 진행률을 바이트 기준으로 수정
  - `src/app/loader.ts`: `fetchOne` 콜백을 비율(`onFraction`) → `onBytes(받은 바이트, 크기(모르면 0), 끝남)`으로 바꿈. 헤더를 받은 순간 `onBytes(0, 크기, false)`로 크기를 먼저 알림. `loadAll` 진행률 = (크기 아는 파일의 받은 바이트 합 / 크기 합 × 그 파일 수 + 크기 모르는 파일 중 끝난 수) / 전체 수. 모두 크기를 알면 전체 받은 바이트 / 전체 크기. 받은 바이트는 크기로 자름(압축 전송 대비), 끝난 파일은 크기만큼으로 셈. 최댓값 유지(단조 증가)는 그대로
  - `tests/unit/loader.test.ts`: 2건 추가(`it.each`) — buggy 1000바이트(본문 대기) + 1바이트 7개 완료 → 7/1007, buggy 크기 미상(본문 대기) + 7개 완료 → 7/8(개수 기준 섞기), 둘 다 본문을 보내면 ok·마지막 1. **수정 전 코드에서 1000바이트 사례 실패 확인**(0.875 ≠ 0.006951340615690168), 미상 사례는 수정 전에도 통과(회귀 방지용)
  - 구현 판단 메모 3(파일 단위 같은 비중)은 철회

| 명령 | 종료 코드 | 결과 |
|---|---|---|
| `npm test -- tests/unit/loader.test.ts`(수정 전 코드) | 1 | 1 failed(1000바이트 사례) / 8 passed |
| `npm test -- tests/unit/loader.test.ts` | 0 | 9 passed |
| `npm run typecheck` | 0 | |
| `npm test` | 0 | 7 files, 74 passed |
| `npm run build` | 0 | 500 kB 청크 경고(기존과 같음) |
| `npm run test:e2e -- tests/e2e/boot.spec.ts` | 0 | 8 passed, webgl2 chromium·webkit true |
