---

description: "아동용 3D 운전·보행 안전 게임 첫 버전 구현 태스크 목록"
---

# Tasks: 아동용 3D 운전·보행 안전 게임 — 첫 버전

**Input**: `specs/001-kids-driving-safety-game/`의 설계 문서

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/overview.md), [quickstart.md](./quickstart.md), 캐릭터 리깅 기록 [_workspace/03_character-rigging.md](./_workspace/03_character-rigging.md)

**기준**: 파일 경로·함수 이름·이벤트·저장 키는 data-model.md와 contracts/가 최종 기준입니다. `_workspace/01_*` 보고서는 결정 전 기록이라 쓰지 않습니다. constitution은 사용자 결정(2026-10-12)으로 없고, 프로젝트 기준은 `AGENTS.md`·`docs/PRD.md`·`GLOSSARY.md`입니다.

**Tests**: plan.md "테스트 전략"이 5층 시험(Vitest·Playwright·실제 기기·콘텐츠 검토·어린이 관찰)과 SC별 담당을 정했으므로 테스트 태스크를 포함합니다. 동작을 바꾸는 코드 태스크는 짝 테스트 파일을 "신설" 또는 "N건 추가"로 적습니다. 테스트가 없는 태스크는 설정·타입 선언·문서·에셋·브라우저 전용 화면처럼 Vitest로 검사할 동작이 없는 것뿐이며, 그 경우 확인할 Playwright 태스크나 기록을 함께 적습니다.

**Organization**: 사용자 이야기(spec.md US1~US8, 우선순위 순)별로 묶었습니다. 각 이야기는 끝에 독립 확인 기준이 있습니다.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 같은 단계 안에서 다른 파일만 고치고, 끝나지 않은 태스크에 기대지 않아 동시에 진행할 수 있음
- **[Story]**: 해당 사용자 이야기(US1~US8). 준비·기반·콘텐츠·마무리 단계에는 붙이지 않음
- **[승인 필요]**: 설치·내려받기·커밋·푸시처럼 사용자 승인 뒤에만 실행(AGENTS.md, plan 단계 0)
- **[사용자 작업]** / **[사용자 결정]**: 사용자가 직접 하거나 정해야 하는 항목
- 모든 태스크는 고치는 파일과 **검증** 명령(또는 기록)을 적습니다. 검증이 종료 코드 0으로 끝나거나 기록이 채워진 뒤에만 체크합니다. 실행하지 못한 검사는 통과로 적지 않습니다.

## Path Conventions

- 저장소 루트 단일 프로젝트: `src/`, `tests/unit/`(Vitest), `tests/e2e/`(Playwright)
- 점검 기록(이 tasks 단계에서 정함, plan "기록 위치는 tasks 단계에서"): `specs/001-kids-driving-safety-game/records/`
  - `tooling-and-render.md`: 도구 동작 확인(plan O8), 모델 렌더링 점검(O2·O3)
  - `play-check.md`: 플레이 확인, 트랙·조정 상수(O5)
  - `device-check.md`: 공개 주소·실제 기기·성능 측정(O6·O7, SC-023·024)
  - `content-review.md`: 콘텐츠 결정(O1·O4)과 검토(SC-026·027·030·031·032)
  - `child-observation.md`: 어린이 관찰(SC-028·029)
- 명령: `npm test -- <파일>`(vitest run), `npm run typecheck`, `npm run build`, `npm run test:e2e -- <파일>`

## tasks 단계에서 정한 기본값

| # | 내용 | 이유 |
|---|---|---|
| D1 | 점검 기록은 위 `records/` 5개 파일에 남김 | plan이 기록 위치를 tasks 단계로 미룸 |
| D2 | `.gitignore`에 `assets-source/**/*.blend1`(Blender 자동 백업) 추가 | 편집용 `.blend`만 보관하면 재생성 가능 |
| D3 | 조작 버튼이 눌리면 `data-pressed` 속성을 붙임 | 아이에게 눌림 표시, 입력 해제(SC-003)를 Playwright로 관찰 |
| D4 | 코드 단계의 그림은 `ASSET_URLS['images/…']`로 찾고 없으면 CSS 도형 자리표시 | 그림 파일 없이도 빌드·흐름 진행, 콘텐츠 단계에서 같은 이름으로 넣기만 하면 됨(assets.md 1장은 직접 import를 선택 사항으로 둠) |
| D5 | 콘텐츠 "완성" 검사(content-data 4장 #8·#21·#22·#23)는 콘텐츠 단계 시작 때 `it.skip`으로 넣고 해당 콘텐츠 태스크에서 하나씩 켬 | content-data.md "켜는 시점은 tasks 단계" |
| D6 | 세 안전 상황의 자리표시 데이터를 기반 단계에 두고 US2에서 실제 구간으로 교체 | 조작 익히기 시작 위치(`SCENARIOS[0].segments[0].start`)와 실행 상태 타입이 상황 ID를 씀 |
| D7 | 연습·보행자 시점 안내의 타입 선언만 기반 단계에 먼저 둠(T020·T021) | 조작 익히기 이벤트 타입이 `ScenarioEvent`에 기댐(modules.md 4.3) |
| D8 | 태스크당 1~2파일 규칙에서 점검 기록 파일(`records/*.md`)은 세지 않고, 같은 종류의 에셋 묶음(GLB 여러 개 + `SHA256SUMS`, 규칙 그림 38장, 음성 파일 묶음 등)은 한 단위로 셈 | analyze X-08, 사용자 결정 2026-10-12 |

---

## Phase 1: Setup (단계 0 — 준비)

**Purpose**: 패키지·설정·브라우저·모델 파일 준비. 설치·내려받기는 사용자 승인 뒤에만 합니다.

- [X] T001 **[승인 필요]** `package.json` 생성(name `driving_game`, `private: true`, `type: "module"`, scripts는 plan "실행 명령" 표 그대로 `dev`·`typecheck`·`test`·`build`·`preview`·`test:e2e`) 후 quickstart 2.1 명령으로 정확한 버전 설치 → `package-lock.json` 생성. 파일: `package.json`, `package-lock.json`. 검증: `npm ci` 종료 0, `npm ls --depth=0` 결과가 three@0.186.1, @types/three@0.186.0, typescript@7.0.2, vite@8.3.1, vitest@5.0.2, @playwright/test@1.63.0 6개뿐
- [X] T002 [P] `.gitignore`에 `node_modules/`, `dist/`, `test-results/`, `playwright-report/`, `assets-source/**/*.blend1` 추가(기존 줄 유지, D2). 파일: `.gitignore`. 검증: `git check-ignore -q node_modules dist assets-source/characters/turtle.blend1` 종료 0, `git check-ignore -q src/assets/models/turtle.glb assets-source/characters/turtle.blend` 종료 1
- [X] T003 `tsconfig.json`(strict, noEmit, target ES2022, module ESNext, moduleResolution bundler, lib DOM·DOM.Iterable·ES2023, types `["vite/client"]`, include `["src", "tests"]`, skipLibCheck true, `*.config.ts`는 include 밖)과 `src/main.ts` 자리표시(`document.body.dataset.screen = 'boot';` 한 줄) 생성. plan O8 "TypeScript 7.0.2 + tsconfig 조합"을 확인합니다. 파일: `tsconfig.json`, `src/main.ts`. 검증: `npm run typecheck` 종료 0. 실패하면 멈추고 사용자 승인 뒤 typescript 6.0.3으로 바꿈(plan B1). 명령·종료 코드를 `records/tooling-and-render.md`(신설)에 기록
- [X] T004 `vite.config.ts`(`vitest/config`의 `defineConfig`, `base: '/driving_game/'`, `build.assetsInlineLimit: (file) => file.endsWith('.svg') ? true : undefined`, `test.include: ['tests/unit/**/*.test.ts']`, `test.environment: 'node'`)와 `index.html` 셸(static-paths.md 4장 viewport 메타, `<canvas id="stage">`, `<div id="ui">`, `<div id="controls">`, 글 없는 CSS 로딩 그림, `<script type="module" src="/src/main.ts">`; 부팅 가드·nomodule은 T088) 생성. 파일: `vite.config.ts`, `index.html`. 검증: `npm run build` 종료 0, `grep -c '/driving_game/assets/index-' dist/index.html` 결과 1 이상
- [X] T005 **[승인 필요: 브라우저 설치]** `npx playwright install chromium webkit` 실행 후 `playwright.config.ts`(testDir `tests/e2e`, projects `chromium` = `devices['Pixel 7 landscape']`·`webkit` = `devices['iPhone 14 landscape']`(둘 다 hasTouch), webServer `npm run build && npm run preview -- --port 4173 --strictPort`, baseURL `http://localhost:4173/driving_game/`)와 `tests/e2e/boot.spec.ts` 신설(2건: ① baseURL을 열면 `document.body.dataset.screen === 'boot'`이고 404 응답 없음 ② 엔진별 `getContext('webgl2')` 가능 여부 출력). plan O8의 WebKit headless WebGL2와 `vite preview` 하위 경로 제공을 확인하고, WebKit에서 WebGL2가 안 되면 3D가 필요한 spec은 `test.skip(browserName === 'webkit', …)`로 Chromium만 돌리는 규칙을 config 주석에 적음(plan 테스트 전략). 파일: `playwright.config.ts`, `tests/e2e/boot.spec.ts`. 검증: `npm run test:e2e` 종료 0(두 프로젝트), 결과를 `records/tooling-and-render.md`에 기록
- [X] T006 [P] **[승인 필요: 내려받기]** quickstart 2.3의 curl 5줄로 차량 GLB 5개(buggy·jeep·truck·wagon·banana-car)를 `src/assets/models/`에 받고(이미 있는 캐릭터 3개는 덮어쓰지 않음, assets.md 3장) `src/assets/models/SHA256SUMS`를 quickstart의 8줄로 확장. 파일: `src/assets/models/{buggy,jeep,truck,wagon,banana-car}.glb`, `src/assets/models/SHA256SUMS`. 검증: `(cd src/assets/models && shasum -a 256 -c SHA256SUMS)` 8줄 OK·종료 0, `ls src/assets/models/*.glb | wc -l` 결과 8. FAILED가 하나라도 있으면 커밋하지 말고 멈춰 보고
- [X] T007 **[사용자 작업]** GitHub 저장소 Settings → Pages → Source를 "GitHub Actions"로 켬(quickstart 2.4-1, plan O10). 검증: `gh api repos/kimwoo-ya/driving_game/pages --jq .build_type` 결과 `workflow`(또는 Settings 화면 확인)

---

## Phase 2: Foundational (단계 1 일부 — 모든 이야기의 선행)

**Purpose**: 루프·주행·콘텐츠 타입·저장·실행 상태·로더·렌더러·화면 흐름 골격·배포 워크플로 파일. 부팅부터 시작 화면까지 열립니다(공개 배포는 크레딧 뒤 T093).

**⚠️ CRITICAL**: 이 단계가 끝나기 전에는 사용자 이야기 작업을 시작하지 않습니다.

- [X] T008 [P] `src/core/loop.ts`: modules.md 1장(`TICK_HZ = 60`, `MAX_TICKS_PER_FRAME = 8`, `ticksForFrame`, `startLoop`, `setTicking`; 모듈 최상위에서 `window`·`performance`·`requestAnimationFrame`을 건드리지 않음). 테스트: `tests/unit/loop.test.ts` 신설 — 프레임 간격 0.25초 자르기, 틱 8개 상한과 남은 누적 버림, 8.3/16.7/33.3 ms·불규칙 간격으로 같은 시간을 돌리면 총 틱 수가 같음(FR-022, FR-074). 검증: `npm test -- tests/unit/loop.test.ts`
- [X] T009 `src/content/vehicles.ts`(`VehicleKindId`, `SeatDef`, `VehicleKind`, `VEHICLES` 5종 순서 buggy·jeep·truck·wagon·banana-car, 한국어 label, `yawDeg` 자리값 0, `seats` 자리값 1개, 성능 필드 없음)와 `src/content/characters.ts`(`CharacterKindId`, `CharacterPose`, `CharacterKind`, `CHARACTERS` 3종: chicken-guy `clips: { idle: 'Armature|Idle', walk: 'Armature|Walk' }`, cool-banana-guy·turtle `clips: { idle: 'Idle' }`·`yawDeg: 0`) 생성. 형식은 `as const satisfies`(content-data.md 머리말). 근거: data-model.md 2.1, assets.md 3·4장(리깅 수정본). 선행: T011(`SeatDef.pos`의 `Vec3`는 `src/sim/vehicle.ts` 소속, modules.md 12장 — 이 파일에 따로 선언하지 않고 `import type`). 타입·데이터만이라 테스트는 T010. 검증: `npm run typecheck`
- [X] T010 `tests/unit/content.test.ts` 신설 — content-data.md 4장 #11(차량 5·인물 3 ID가 타입과 일치), #13(차량마다 `seats.length ≥ 1`, `height > 0`), #14 데이터 부분(chicken-guy는 `Armature|Idle`·`Armature|Walk`, 나머지 둘은 `Idle`; GLB 안 실제 존재 확인은 T023). 파일: `tests/unit/content.test.ts`. 검증: `npm test -- tests/unit/content.test.ts`
- [X] T011 `src/sim/vehicle.ts`: modules.md 3.1(`Vec2`, `Vec3`, `Pose`, `Gear`, `DriveInput`, `DriveState`, `DrivingSpec`, `DRIVING_SPEC` 자리값, `stepVehicle`, `requestGearToggle`, `restingAt`; 차종 매개변수 없음, 무작위·시각 없음). 테스트: `tests/unit/vehicle.test.ts` 신설 — 액셀·브레이크 동시 = 브레이크, steer [−1, 1] 자르기, 페달을 떼면 감속하다 `stopSnapSpeed` 아래에서 정확히 0, 방향별 최고 속도 한도, 정지 중 전환 20회 연타 20/20·주행 중 20회 0/20(SC-004), 거절 요청을 기억하지 않음(FR-018), `restingAt`은 전진·정지(FR-019), SC-002: 틱 번호 입력 스크립트를 `ticksForFrame`로 프레임 간격 4종(8.3/16.7/33.3 ms·불규칙)에 돌려 최고속도·정지 거리·회전 반경·후진 속도·기준 구간 통과 틱이 `toEqual` 완전 일치. 검증: `npm test -- tests/unit/vehicle.test.ts`
- [X] T012 `tests/unit/content.test.ts`에 #20(`DRIVING_SPEC` 값 모두 유한 양수, `maxReverseSpeed < maxForwardSpeed`, `stopSnapSpeed < maxReverseSpeed`) 1건 추가. 검증: `npm test -- tests/unit/content.test.ts`
- [X] T013 `src/content/town.ts`(`TownDef`, `Rect`, `AreaId`, `SignalId`, `SignalDef`, `SceneElementId` 12종, `ScenePropPlacement`, `TOWN`)와 `src/content/scenarios.ts`(`ScenarioDef`, `ScenarioId`, `SegmentDef`, `SafetyActionStep`, `ActorPlan`(잠정 형식), `PedestrianViewDef`, `ViolationKind` 6종, `RouteIssue`, `SCENARIOS` 3개 순서 signal-wait·crossing-check·turning-car) 생성. 데이터는 자리표시(D6): 기본 도형 마을 한 구역(도로·보도·횡단보도·건물 구역, 차량·보행자 신호 1개씩, `props: []`), signal-wait는 연습 엔진을 시험할 수 있는 구간 1개(정지선·정지 범위·steps stop → wait(vehicleGreen) → go·violations(overStopLine, ranRed, earlyStart, enteredSidewalk)·ActorPlan·pedestrianView), 나머지 둘은 구간 1개짜리 자리표시(T053·T054에서 교체). 근거: data-model.md 2.1, content-data.md 2장. 검증: `npm run typecheck`
- [X] T014 `tests/unit/content.test.ts`에 #16(구간 형식: `stopZone.toS ≤ stopLineS`, steps 1개 이상, `pedestrianView.segment`·`afterStep`이 실제 구간·단계를 가리킴) 1건 추가. 검증: `npm test -- tests/unit/content.test.ts`
- [X] T015 `src/content/rules.ts`(`SafetyRule`, `RuleId`, `PictureElementId`, `SAFETY_RULES` 38행: data-model.md 6.2 표의 순서·scenario·tier·sceneElements·pictureElements·weather, `text`는 spec.md "보행 안전 규칙 배정" 표 원문, `researchIds`, 정해진 poses A11 = lookLeft·lookRight·lookLeft, A14-A15 = raiseHand, A19-A20 = walk, `durationTicks` 자리값) 생성 + `tests/unit/content.test.ts`에 #1~#7, #9 8건 추가(규칙 38·중복 0, researchIds 합집합 41, 상황별 핵심·추가 4·12/5·7/3·7, 네 행동 core, 횡단 다섯 단계 순서, 핵심 poses에 lookLeft·lookRight·raiseHand, 그림 전용 규칙 정확히 A2·A25·A26·B13·B14, durationTicks 정수 > 0·introTicks ≥ 0). 파일: `src/content/rules.ts`, `tests/unit/content.test.ts`. 검증: `npm test -- tests/unit/content.test.ts`
- [X] T016 [P] `src/storage/save.ts`: storage.md 전체(`driving_game:save`, 시험 키 `driving_game:probe`, `MAX_RECORD_CS`, `SoundSettings`, `BestRecord`, `SaveDataV1`, `parseSave`, `loadSave`, `commitSave`; 셋 다 던지지 않음; 전역 `localStorage`는 try 안에서만). 테스트: `tests/unit/save.test.ts` 신설(`vi.stubGlobal('localStorage', 가짜)`) — storage.md 6장 손상 6종과 경계 6건(SC-018), 7장 두 탭 중 2·3번째 2건(SC-019 일부; 첫 번째 `finishResult` 사례는 T073), 5장 실패(getter `SecurityError` → `ok: false`·`data` 기본값, 읽기는 되고 시험 쓰기 `setItem` 예외 → `ok: false`·`data`는 읽은 값, `commitSave`의 `setItem` `QuotaExceededError` → `false`), 저장·복원 왕복 3항목(SC-016), 완주 기록 5개를 차례로 저장하면 저장값 = 최솟값(SC-015). 검증: `npm test -- tests/unit/save.test.ts`
- [X] T017 `src/content/track.ts`(`TrackDef`, `Checkpoint`, `AiProfile`, `TRACK` 자리표시: id `'main'`, revision 1, laps 2, 닫힌 고리 중심선, width, 체크포인트 3개 이상·arc 오름차순·0번 결승선, 출발 칸 4개는 결승선 뒤 첫 구간, playerSlot, aiProfiles 3개) 생성 + `tests/unit/content.test.ts`에 #18 1건 추가. 근거: data-model.md 2.1 TrackDef. 파일: `src/content/track.ts`, `tests/unit/content.test.ts`. 검증: `npm test -- tests/unit/content.test.ts`
- [X] T018 `src/race/race.ts` 첫 부분: `trackConfigKey`, `formatRecord`(modules.md 6.1). 테스트: `tests/unit/race.test.ts` 신설 — 테스트용 트랙 값(`{ ...TRACK, id: 'main', revision: 1, laps: 2 }`)으로 `trackConfigKey` = `'main:1:2'`(실제 `TRACK` 값을 고정하지 않아 T115 조정 뒤에도 유지), `formatRecord` 29520 → `4:55.20`, 0 → `0:00.00`, 359999 → `59:59.99`, 360000 → `1:00:00.00`, 반올림 없음(FR-064). 검증: `npm test -- tests/unit/race.test.ts`
- [X] T019 `src/app/session.ts`(`RunState`, `createRunState`; data-model.md 2.2 시작값). 테스트: `tests/unit/session.test.ts` 신설 — 기본값, 저장값의 tutorialDone·best·sound 반영, extraCursor 세 상황 0, completedThisRun 빈 집합. 검증: `npm test -- tests/unit/session.test.ts`
- [X] T020 타입 골격 1(D7): `src/practice/townActors.ts`에 `SignalState`·`TownPedestrian` 타입만, `src/pedestrianView/pedestrianView.ts`에 `PedestrianViewState`·`PedestrianViewEvent` 타입만 선언(data-model.md 2.2, events.md 3장). 함수는 T043·T045. 동작이 없는 타입 선언이라 테스트 없음. 검증: `npm run typecheck`
- [X] T021 타입 골격 2(D7): `src/practice/scenario.ts`에 `IDLE_HINT_TICKS`·`DEMO_AFTER_FAILS`·`EXPLAIN_TICKS`(자리값, plan O5), `HintCue`, `ScenarioAttempt`, `ScenarioEvent`(events.md 2장) 선언. 함수는 T048~T051. 검증: `npm run typecheck`
- [X] T022 `src/app/loader.ts`: modules.md 8.2(`AssetId`, `ASSET_URLS` = `import.meta.glob('/src/assets/**/*.{glb,svg,mp3}', { query: '?url', import: 'default', eager: true })`에서 앞의 `/src/assets/`를 뗀 표, `LoadResult`, `loadRequired`(GLB 8개만, 바이트 진행률, 일정 시간 바이트가 늘지 않으면 `AbortController`로 끊음 — 실제 시간), `retryFailed`, `loadSounds`; Promise reject 없음). 테스트: `tests/unit/loader.test.ts` 신설(`fetch` 바꿔 끼움) — 진행률 0 → 1 단조 증가, 404 → `reloadNeeded: true`, 네트워크 오류 → failed, 정체 → failed(가짜 타이머), `retryFailed`는 실패 파일만 다시 받고 기존 files 유지, `loadSounds` 실패 파일은 빠짐, `ASSET_URLS`에 모델 8개 키. content-data.md의 미확인 사항 "Vitest에서 `import.meta.glob` + `?url` 동작"을 여기서 확인해 `records/tooling-and-render.md`에 기록(안 되면 멈추고 대안과 `@types/node` 필요 여부를 사용자에게 보고). 선행: T006. 검증: `npm test -- tests/unit/loader.test.ts`
- [X] T023 `tests/unit/content.test.ts`에 #12(모델 8개가 `ASSET_URLS`에 있음), #14 GLB 부분(캐릭터 3개 GLB의 JSON 청크 animations 이름에 `clips` 값이 실제로 있음; 파일 읽기는 T022에서 확인한 방법) 2건 추가. 검증: `npm test -- tests/unit/content.test.ts`
- [X] T024 [P] `src/render/stage.ts`: modules.md 9장 `Stage`, `createStage`(WebGL2 컨텍스트 없음·`WebGLRenderer` 생성 예외면 `null`, 던지지 않음; 조명; `DRIVING_SPEC` 기준 고정 오프셋 추적 카메라; 리사이즈; 픽셀 비율 `min(devicePixelRatio, 2)` 상수; `webglcontextlost`/`restored` → `onContext`). `?perf`는 T111. WebGL이라 Vitest 없음 → T028·T091에서 브라우저 확인. 검증: `npm run typecheck`
- [X] T025 `src/render/models.ts`: assets.md 4장(갱신본) `prepareModel`(GLTFLoader 파싱, world 행렬 갱신, **차량 5종만** 재질별 `mergeGeometries`(실패하면 원래 메시), `yawDeg`로 앞을 +Z, 차량 Z 길이 = `DRIVING_SPEC.bodyLength`·인물 키 1 m, 바닥 0·가로 중심 원점, 손상 GLB면 reject)와 `cloneModel`(차량 `clone()`, **캐릭터 3종 모두** `SkeletonUtils.clone`, 캐릭터 geometry·관절·가중치를 합치거나 지우지 않음, modules.md 9장), 준비한 모델을 id별로 모듈 안에 보관하는 내부 함수(렌더러 내부는 구현 재량). three.js 파싱이 브라우저 이미지 디코딩을 써서 Vitest 없음 → T028(8개 준비 뒤 start 도달)·T042(렌더링 점검)에서 확인. 검증: `npm run typecheck`
- [X] T026 [P] `src/ui/screens.ts` 시작 화면(시작 버튼; 글은 `textContent`만; 그림은 D4 규칙)과 `src/style.css` 기본(캔버스 전체 화면, `#ui` 겹침 층, 시스템 글꼴). 파일: `src/ui/screens.ts`, `src/style.css`. 검증: `npm run typecheck`
- [X] T027 `src/app/flow.ts` 골격(`Screen`, `ScreenState`, `PlaySession`, `startFlow`: `loading` → `loadRequired` → 8개 `prepareModel` → `start`; 실패하면 `loadFailed`로만 전이(화면·다시 시도는 T089·T090); 화면·겹침이 바뀔 때마다 `document.body.dataset.screen`·`dataset.overlays`; `startLoop(tick, draw)`; `?e2e`면 `window.__e2e.ticks`)와 `src/main.ts`(modules.md 8.4 순서: `dataset.screen = 'boot'` → `createStage`가 null이면 `dataset.screen = 'unsupported'`로 두고 멈춤(안내 화면은 T089·T090) → `loadSave(trackConfigKey(TRACK))` → `createRunState` → `startFlow`; `style.css` import). 파일: `src/app/flow.ts`, `src/main.ts`. 검증: `npm run build` 종료 0
- [X] T028 `tests/e2e/boot.spec.ts`: T005의 ①을 "`loading`을 거쳐 `start` 도달"로 바꾸고 2건 추가 — `start`에서 `page.reload()`하면 `loading`부터 다시 `start`(FR-002), 모든 요청의 출처가 테스트 서버·`data:`·`blob:`뿐(FR-085, SC-025 일부). 검증: `npm run test:e2e -- tests/e2e/boot.spec.ts`
- [X] T029 `.github/workflows/deploy.yml`(plan "배포": `main` 푸시·`workflow_dispatch`, 권한 contents read·pages write·id-token write, concurrency `pages`, `actions/checkout@v7.0.1` → `actions/setup-node@v7.0.0`(node 24, npm 캐시) → `npm ci` → `npm test` → `npm run build` → `actions/configure-pages@v6.0.0` → `actions/upload-pages-artifact@v5.0.0`(`./dist`) → `actions/deploy-pages@v5.0.1`) 작성까지만 하고 푸시하지 않음. 크레딧은 공개 배포의 필수 조건이라(spec US8, 사용자 결정 2026-10-12) 첫 공개 배포는 크레딧 뒤 T093에서 함. 트리거가 `main` 푸시이므로 T093 전에는 `main`을 원격에 푸시하지 않음. 선행: T028. 파일: `.github/workflows/deploy.yml`. 검증: 로컬 `npm ci && npm test && npm run build` 종료 0

**Checkpoint**: 하위 경로(로컬 미리보기)에서 로딩 → 시작 화면, 배포 워크플로 파일 준비 완료(공개 배포는 크레딧 뒤 T093).

---

## Phase 3: User Story 1 — 링크로 접속해 차량과 인물을 고르고 기본 운전 조작을 익힌다 (Priority: P1) 🎯 MVP

**Goal**: 시작 → 차량 5종 → 탑승객 3종 선택 → 교육용 마을에서 조향·액셀·브레이크·후진 시범과 직접 해 보기. 고른 인물이 아이 차에 탐.

**Independent Test**: 가로 화면에서 시작 → 5종·3종 각각 선택 → 조작 익히기에서 두 손 조작, 브레이크 우선, 정차 후 후진 전환, 터치 취소 뒤 입력 해제(spec US1 Independent Test, quickstart S2 1~3단계). 자동: T040·T041.

- [X] T030 [P] [US1] `src/input/controls.ts` 순수 부분: `ControlButton`, `HoldButton`, `ScreenPoint`, `ScreenRect`, `pressedButtons`, `toDriveInput`(modules.md 2장). 테스트: `tests/unit/controls.test.ts` 신설 — 사각형 경계 포함·밖의 점 무시·점 여러 개(손바닥) 같은 규칙, 좌우 동시 steer 0(FR-015), 액셀+브레이크 20회 모두 throttle false·brake true(SC-004), 액셀만 → throttle true. 검증: `npm test -- tests/unit/controls.test.ts`
- [X] T031 [P] [US1] `src/platform/lifecycle.ts`: modules.md 11장 `LifecycleSignal`, `watchLifecycle`(visibilitychange → hidden/visible, 세로이거나 너무 작은 영역 → portrait(기준 상수 자리값, O6), 가로 복귀 → landscape, 가로 유지 중 크기 변화 → layout, window blur → blur; `gesturestart`·`dblclick`·`contextmenu`·`touchmove`(passive false) `preventDefault`; 방향 고정 API 없음, FR-007·020). DOM 이벤트라 Vitest 없음 → T041·T087. 검증: `npm run typecheck`
- [X] T032 [US1] `src/input/controls.ts` DOM 부분(`mountControls`: `#controls` 층 하나에 버튼 6개 — 왼쪽 좌·우 조향, 오른쪽 액셀·브레이크, 구분된 후진 전환, 일시정지; pointerId별 좌표 표와 좌표 기준 판정; 붙일 때·resize 때 사각형 재측정; reverse·pause는 pointerdown 순간 `onTap` 1회; `readDriveInput`; `releaseAll`은 표를 비우고 그때 닿아 있던 손가락은 up/cancel까지 무시; pointercancel 즉시 제거; 눌린 버튼에 `data-pressed`(D3))와 `src/style.css` 조작 버튼(큰 터치 영역·간격, 화면 가장자리·`env(safe-area-inset-*)`에서 떨어뜨림, `touch-action: none`, `user-select: none`, `-webkit-touch-callout: none`, html·body `overscroll-behavior: none`, 3D 캔버스 `pointer-events: none`). FR-013·014·016·017·020·021·023. 선행: T030. 파일: `src/input/controls.ts`, `src/style.css`. 검증: `npm run typecheck`, 동작은 T041
- [X] T033 [P] [US1] `src/render/characters.ts` 탑승객 부분: `cloneModel`로 인물 복제 → `SeatDef.height`로 크기 맞춤 → 차량 표시 객체의 자식으로 `seats[0].pos`에 앉힘 → `clips.idle` 재생(AnimationMixer, 꾸밈이라 실제 시간 사용 가능). 판정·카메라에 값을 되돌리지 않음(FR-011, FR-097). 검증: `npm run typecheck`, 화면은 T042
- [X] T034 [P] [US1] `src/render/showroom.ts`: `renderShowroom(stage, list, selected)` — 차량 5종 또는 인물 3종을 한 줄로 진열, 고른 것만 확대·회전(research R6). 검증: `npm run typecheck`, 화면은 T040
- [X] T035 [P] [US1] `src/ui/screens.ts`에 `pickVehicle`·`pickCharacter` 화면: 3D 진열 위 투명 DOM 버튼 열(접근성 이름 = label), 고른 항목 강조, 그림으로 된 다음 버튼, 잠긴 항목 없음, 이번 실행의 이전 선택을 기본 강조(FR-009, FR-010, FR-012, FR-097). 검증: `npm run typecheck`
- [X] T036 [US1] `src/practice/drivingLesson.ts`: modules.md 4.3(`DrivingLessonState`, `DrivingLessonEvent`, `startDrivingLesson`, `stepDrivingLesson`; 시작 자세 `restingAt(SCENARIOS[0].segments[0].start)`). 테스트: `tests/unit/drivingLesson.test.ts` 신설 — 시작 hint `steer`, 네 단계 통과 조건(조향 steer ≠ 0, 액셀 speed > 0, 움직이던 차를 브레이크로 0, 후진 전환 수락), 그 조작이 없으면 넘어가지 않음, 무입력 `IDLE_HINT_TICKS`마다 repeat hint, `lessonDone` 1회 뒤 no-op, 실패·시간제한 없음(FR-027, FR-031, FR-038). 검증: `npm test -- tests/unit/drivingLesson.test.ts`
- [X] T037 [US1] `src/render/townView.ts` 기본: `renderTown(stage, play, scene)` — `TOWN.areas`를 기본 도형(도로·보도·건물)으로, 아이 차(`play.vehicle` 모델) + 탑승객(characters.ts), 카메라 추적(FR-023). 신호·보행자·횡단보도 표시는 T058. 검증: `npm run typecheck`
- [X] T038 [P] [US1] `src/ui/hud.ts`: 전진·후진 표시(색 + 모양, 늘 보임, FR-019·025), 조작 익히기 cue(눌러야 할 버튼 강조, repeat면 시범 애니메이션), "먼저 멈춰요" 그림(FR-018). 검증: `npm run typecheck`
- [X] T039 [US1] `src/app/flow.ts` US1 연결: start 시작 → `pickVehicle`(mode practice) → `pickCharacter` → `drivingLesson`(저장된 완료 기록 없음 ∧ 이번 실행 조작 익히기 미통과일 때), `mountControls` 1회, 틱마다 `readDriveInput`과 gearTap(탭 하나당 한 틱), 거절된 후진 탭 → HUD "먼저 멈춰요"(events.md 6장), 진입 때 `releaseAll`, `watchLifecycle` 연결 중 `layout`·`blur` → `releaseAll`(나머지 신호는 T086), 프레임마다 `renderShowroom`/`renderTown`, `lessonDone` → `drivingLessonDone = true` 뒤 다음 화면(T060 전까지는 `start`), 연타 무시(현재 화면과 맞지 않는 입력 무시), `window.__e2e.passenger`. 검증: `npm run build`, 동작은 T040
- [X] T040 [US1] `tests/e2e/flow.spec.ts` 신설 — 시작 → 차량 5종 각각·인물 3종 각각 선택 가능(US1-2·3·12), 고른 뒤 `drivingLesson` 진입과 `__e2e.passenger` = 고른 인물(US1-13, SC-032 일부), 15조합 진입 스크린샷 저장(SC-032 브라우저), 차량 5종 각각 연습 진입(SC-001 일부), 시작·선택 버튼 빠른 연타에도 화면 전환 1번. 3D가 필요하므로 T005 규칙 적용. 검증: `npm run test:e2e -- tests/e2e/flow.spec.ts`
- [X] T041 [US1] `tests/e2e/touch.spec.ts` 신설 — body·조작 버튼의 계산된 `touch-action`·`user-select`(SC-005), 합성 포인터로 액셀 누름 → `data-pressed`, 버튼 밖으로 미끄러짐·pointercancel·window blur → 해제(FR-016·017, SC-003 일부), 가로 viewport 3종(844×390, 932×430, 1180×820)에서 조작 버튼끼리·안전 영역과 겹침 0과 스크린샷(SC-023 브라우저). 검증: `npm run test:e2e -- tests/e2e/touch.spec.ts`
- [X] T042 [US1] 모델 렌더링 점검(plan 단계 1, O2): 8종 방향·크기, 왜건 음영, 버기 합치기 뒤 그리기 호출(`renderer.info.render.calls`), 캐릭터 3종의 `SkeletonUtils.clone`·크기 조절·`Idle` 재생(리깅 기록의 "Chicken Guy 기존 경고 4건" 확인 포함), 차량 5 × 인물 3 탑승객 보임을 확인해 `src/content/vehicles.ts`의 `yawDeg`·`seats`와 `src/content/characters.ts`의 chicken-guy `yawDeg`를 확정. `Idle` 자세로 좌석에서 안 보이면 장난감 같은 좌석 표현으로 조정하고, `Sit` 자세 고정이 필요하다고 판단되면 계약(`clips` 타입)에 없으므로 멈추고 사용자에게 확인. 파일: `src/content/vehicles.ts`, `src/content/characters.ts`. 기록: `records/tooling-and-render.md`(조합별 결과·스크린샷 경로). 검증: `npm test -- tests/unit/content.test.ts`, 기록 15/15

- [X] T124 [US1] 키보드 조작(사용자 요청 2026-10-13, spec FR-098, modules.md 2장): `src/input/controls.ts`에 방향키·WASD = 누르고 있는 버튼, R = 후진 전환 탭, 조작 버튼이 보일 때만, 반복 입력 무시, `releaseAll`이 키도 비움. `tests/e2e/touch.spec.ts` 2건 추가(키 8개 눌림 표시·동시 입력·blur 뒤 반복 입력 무시 / R 앞뒤 바꾸기·조작 버튼 없는 화면에서 무시). 검증: `npm run test:e2e -- tests/e2e/touch.spec.ts`. 검토는 다음 덩어리(US4) 검증·리뷰 때 함께

**Checkpoint**: US1 단독으로 "골라서 운전해 보는" 시연 가능.

---

## Phase 4: User Story 2 — 세 가지 안전 연습을 직접 수행하고 보행자 시점 안내를 본다 (Priority: P1)

**Goal**: 신호 기다리기·횡단 전 주변 차량 확인하기·교차로의 회전 차량 주의하기를 운전으로 수행하고, 위험 직전 멈춤·구간 재시도, Chicken Guy가 주인공인 보행자 시점 안내, 다시 할 때 추가 규칙.

**Independent Test**: 연습 하나를 시작해 올바른 행동으로 완료, 잘못된 행동에서 사고 장면 없이 같은 구간 재시도, 끝 지점·시간 경과·한 버튼만으로 완료 안 됨(spec US2). 자동: SC-008·009·010·031 Vitest(T048~T056), 수동: T061·T062.

- [X] T043 [P] [US2] `src/practice/townActors.ts` 함수(`initActors`, `stepTownActors`; modules.md 4.2, 시그니처 잠정·보장 확정). 테스트: `tests/unit/townActors.test.ts` 신설 — 신호는 frontS·stoppedTicks로만 바뀜(주기 없음, FR-040), redAtS를 지나면 빨강, 멈춘 뒤 greenAfterStoppedTicks 지나면 초록, 보행자는 speed 0이거나 최고 속도 제동 거리 + 여유 안쪽일 때만 crossing(FR-039), 같은 횡단보도 직진 차량 초록과 보행자 초록 동시 0(FR-042), 보행자 pose는 `CharacterPose`뿐, `signalChanged` 이벤트. ActorPlan으로 세 상황을 표현할 수 있는지 확인(data-model Open Issues 1, 결과 반영은 T052). 검증: `npm test -- tests/unit/townActors.test.ts`
- [X] T044 [P] [US2] `src/sim/collision.ts`에 `blockByAreas`(modules.md 3.2). 테스트: `tests/unit/collision.test.ts` 신설 — 건물 구역에 들어가면 경계 앞에 두고 감속, heading 그대로, `hit` 표시, `bodyRadius`만 사용(FR-035, FR-011). 검증: `npm test -- tests/unit/collision.test.ts`
- [X] T045 [P] [US2] `src/pedestrianView/pedestrianView.ts` 함수(`startPedestrianView`, `stepPedestrianView`, `rewindPedestrianView`; modules.md 5장). 테스트: `tests/unit/pedestrianView.test.ts` 신설 — introTicks 뒤 카드마다 첫 틱에 `cardShown`, 마지막 카드 durationTicks 뒤 `ended` 1회, 운전 입력 매개변수·건너뛰기 없음(FR-041), 진행이 음성 재생과 무관(SC-021 자동), rewind `'card'`는 그 카드 `cardShown`을 다시, `'intro'`는 card −1부터 같은 rules. 검증: `npm test -- tests/unit/pedestrianView.test.ts`
- [X] T046 [P] [US2] `src/practice/ruleRotation.ts`(`EXTRAS_PER_VIEW` 자리값, `isReplay`, `pickRules`, `advanceExtraCursor`; modules.md 4.1). 테스트: `tests/unit/ruleRotation.test.ts` 신설 — isReplay 두 조건(FR-091), 핵심 전부 배열 순서 + 추가는 cursor부터 k개·끝에서 처음으로·중복 없음, replay 거짓이면 추가 0, advance = (cursor + k) % 추가 수, 추가 0개면 0. 검증: `npm test -- tests/unit/ruleRotation.test.ts`
- [X] T047 [US2] `tests/unit/content.test.ts`에 #10(상황마다 `ceil(추가 수 / k)`번 순환하면 추가 규칙이 모두 1번 이상, 매번 핵심 전부, isReplay 거짓이면 추가 0, SC-031) 1건 추가. 선행: T046. 검증: `npm test -- tests/unit/content.test.ts`
- [X] T048 [US2] `src/practice/scenario.ts` `startScenario`·`stepScenario` 운전 단계: 차체 앞 끝을 경로에 투영한 s, steps stop(stopZone 안 speed 0)·wait(조건까지 정지 유지)·go(조건 뒤 path 끝), 시작·단계 변경 hint(repeat false), 무입력 `IDLE_HINT_TICKS`마다 repeat hint, `stepTownActors`·`blockByAreas` 사용, gearTap은 driving일 때만, 완료는 "모든 구간·단계 ∧ viewDone"뿐, done이면 no-op(events.md 7.1의 1·2·3·5·6·7번). 테스트: `tests/unit/scenario.test.ts` 신설 — SC-008(세 상황(자리표시 포함) × 무입력·액셀만·브레이크만·후진만 × 36,000틱 완료 0), 끝 지점 도달만으로 완료 0, 단계 순서대로만 인정(FR-032). 선행: T043, T044. 검증: `npm test -- tests/unit/scenario.test.ts`
- [X] T049 [US2] `src/practice/scenario.ts` 잘못된 행동: 6종을 다음 틱 후보 위치에서 판정(정지선·횡단보도 판정점 = 차체 앞쪽 두 모서리), 한 틱에 여럿이면 data-model ViolationKind 표 위쪽 하나, 후보 버림·speed 0·`explaining`, `EXPLAIN_TICKS` 동안 정지·입력 무시, `segmentReset`(data-model 4.4 복원 표), failStreak + 1, `DEMO_AFTER_FAILS`면 `demoReplay` 뒤 hint. 테스트: `tests/unit/scenario.test.ts`에 추가 — signal-wait 구간의 4종(overStopLine, ranRed, earlyStart, enteredSidewalk) 각각 violation → segmentReset(SC-010 일부; 나머지 2종은 T056), 어느 틱에도 판정점이 경계를 넘지 않음(FR-036), 이벤트 순서(events.md 7.1-4), 재시도 뒤 restingAt·신호·보행자 초기화·viewDone 유지 — 5건. 검증: `npm test -- tests/unit/scenario.test.ts`
- [X] T050 [US2] `src/practice/scenario.ts` 경로 문제: stoppedTooFar → hint `closer`, wrongWay → hint `way`, leftPath·blocked(건물에 닿은 채 `IDLE_HINT_TICKS` 동안 진행 없음) → `redirect`(구간 다시, failStreak 그대로)(FR-034, FR-035). 테스트: `tests/unit/scenario.test.ts`에 4건 추가. 검증: `npm test -- tests/unit/scenario.test.ts`
- [X] T051 [US2] `src/practice/scenario.ts` 보행자 시점 안내 연결: `(segment, afterStep)`를 마친 틱에 같은 시도 처음일 때만 `pedestrianViewStart`(speed 0, gear 유지), 안내 중 입력·gearTap 무시, `cardShown`·`ended` 전달, ended → viewDone, 남은 단계가 있으면 driving + hint, 다 마쳤으면 `done` + `scenarioCompleted`, 구간 재시도 뒤 다시 보이지 않음(B10). 테스트: `tests/unit/scenario.test.ts`에 3건 추가 — signal-wait 올바른 행동 스크립트로 완료, 안내 중 입력 무시(US2-14), 안내를 끝내기 전 시도를 버리면 완료 아님(US2-15). 선행: T045. 검증: `npm test -- tests/unit/scenario.test.ts`
- [X] T052 [US2] ActorPlan 확정 반영(문서): T043·T051 결과 형식이나 `stepTownActors` 시그니처가 바뀌었으면 `data-model.md`(2.1 ActorPlan, Open Issues 1)와 `contracts/modules.md`(4.2)를 실제 코드에 맞춤. 바뀌지 않았으면 "잠정"을 "확정(T043)"으로만 고침. 파일: `specs/001-kids-driving-safety-game/data-model.md`, `specs/001-kids-driving-safety-game/contracts/modules.md`. 검증(문구 검사): data-model.md의 ActorPlan 블록·Open Issues 1과 modules.md 4.2 시그니처 행에서 "잠정"이 사라짐(바퀴 수 "2 잠정" 등 다른 "잠정"은 남는 것이 정상)
- [X] T053 [US2] crossing-check 데이터: `src/content/town.ts`에 횡단보도 지점 구역·보행자 신호, `src/content/scenarios.ts`에 구간(접근 → stop → wait(pedestriansClear) → go), violations(enteredCrosswalkWithPedestrian 포함), ActorPlan(보행자 poses lookLeft·lookRight·lookLeft·raiseHand, start playerStopped), pedestrianView(afterStep·camera·protagonistPath·introTicks). 배치는 기본 도형 자리표시. 검증: `npm test -- tests/unit/content.test.ts tests/unit/scenario.test.ts`
- [X] T054 [US2] turning-car 데이터: `src/content/town.ts`에 교차로·회전 방향 횡단보도, `src/content/scenarios.ts`에 회전 경로 구간(회전 전 stop → wait(pedestriansClear) → go), violations(turnedIntoCrossingPedestrian 포함), 회전 방향 보행자 계획, pedestrianView. 선행: T053. 검증: `npm test -- tests/unit/content.test.ts tests/unit/scenario.test.ts`
- [X] T055 [US2] `tests/unit/content.test.ts`에 #15(잘못된 행동 6종 각각 어떤 구간 violations에 1번 이상), #17(사고 장면 방지 거리: 보행자 경로 모든 점이 위반 경계의 차 반대편이고 거리 ≥ 사람 반지름 + 여유 1 m, FR-036) 2건 추가. 선행: T054. 검증: `npm test -- tests/unit/content.test.ts`
- [X] T056 [US2] `tests/unit/scenario.test.ts`에 2건 추가 — SC-009 세 상황 올바른 행동 스크립트로 3/3 완료, SC-010 남은 2종(enteredCrosswalkWithPedestrian, turnedIntoCrossingPedestrian) violation → segmentReset. 선행: T054. 검증: `npm test -- tests/unit/scenario.test.ts`
- [X] T057 [P] [US2] `src/render/characters.ts` Chicken Guy 동작: `clips.walk`/`idle` 재생 뒤 같은 프레임에 `Head`(lookLeft/lookRight 회전)·`HandL`/`HandR`(raiseHand 위치·회전, 들 손은 코드 상수 한쪽) 덮어쓰기(assets.md 5장, GLTFLoader 이름 규칙), `Armature|Sprint`·`Armature|Jump` 재생 안 함(FR-094), `TownPedestrian` 상태·pose대로 그림, 보행자 시점 안내 주인공은 카드 poses를 durationTicks 동안 차례로. 등장 보행자·주인공은 항상 chicken-guy(FR-096). 검증: `npm run typecheck`, 화면은 T061
- [X] T058 [US2] `src/render/townView.ts`: 차량 신호·보행자 신호를 따로(색 + 모양, 운전 중 차량 신호·안내 중 보행자 신호 강조, FR-024·025·042), 횡단보도·정지선·보도, 등장 보행자(characters.ts), 보행자 시점 안내 카메라(`def.camera`)와 지금 카드 `weather`(rain/dark) 표현(FR-092 날씨). 선행: T057. 검증: `npm run typecheck`
- [X] T059 [P] [US2] `src/ui/hud.ts`(cue 그림을 다음 hint까지 유지(FR-031), repeat·demoReplay 버튼 강조 시범)와 `src/ui/overlays.ts` 신설(위험 직전 멈춤: 화면 전체 반투명 + 멈춤 그림 + 종류 그림 `images/ui/violation-<kebab>.svg`(FR-037), 보행자 시점 안내 규칙 카드 `images/rules/<RuleId>.svg`, 칭찬 그림; 그림은 D4 규칙). 파일: `src/ui/hud.ts`, `src/ui/overlays.ts`. 검증: `npm run typecheck`
- [X] T060 [US2] `src/app/flow.ts` 안전 연습 연결(소리·저장 제외): pickCharacter에서 practice ∧ !tutorialDone ∧ !practiceStarted면 flow `sequence`·practiceStarted true → (조작 익히기 조건이면 `drivingLesson`) → `practice('signal-wait')`, T039의 임시 "lessonDone → start"를 다음 상황으로 교체, `startScenario(scenario, pickRules(scenario, isReplay(…), run.extraCursor[scenario]))`, events.md 2·3장 화면·입력 반응(hint → HUD, redirect·violation·segmentReset·pedestrianViewStart → `releaseAll`, 안내 중 조작 버튼 숨김·안내 카메라, cardShown → 카드, ended → `extraCursor` 이동, scenarioCompleted → completedThisRun 추가 → 순서상 다음 미완료 상황). 세 번째 완료 처리는 T065. 선행: T051, T058, T059. 검증: `npm run build`, 동작은 T062
- [X] T061 [US2] Chicken Guy 자세 점검(O3): A11(왼쪽·오른쪽·다시 왼쪽 보기)·A14-A15(손 들기) 카드와 등장 보행자 대기 자세를 브라우저에서 확인하고 들 손을 정해 `src/render/characters.ts` 상수 확정. 기록: `records/tooling-and-render.md`(스크린샷 경로). 검증: 기록에 왼쪽 보기·오른쪽 보기·손 들기 3/3(SC-032 렌더링 점검)
- [X] T062 [US2] 플레이 확인(quickstart S2 4~6단계): 신호 기다리기 완료, 정지선 넘기 → 멈춤 겹침·같은 구간 처음부터·누르던 버튼 풀림, 소리 없이 카드 자동 진행(US2-13), 조작 익히기 → 연습 바로 이어짐(US3-2). 기록: `records/play-check.md` 신설. 검증: 항목별 예/아니오와 날짜

- [x] T126 [US2] 연습 길 표시·3단계 우회전 화살표 신호(사용자 지적 2026-10-13 "튜토리얼에서 완료를 어떻게 해야 되는건지 막연 … 완료 지점에 대한 표식이 없음 … 3단계는 차량 입장 신호등이 멈추라는건지 가라는건지 안 나옴" → 선택지 중 "우회전 화살표 신호등"·"멈출 곳 노란 칸"·"우회전 길 화살표", 도착 깃발 문은 기본으로 넣음. 이어서 "빨간 화살표면 모퉁이 앞에서 멈춤", 건너는 중에 정지선을 넘으면 "건너는 사람 쪽으로 돌기" 설명; spec FR-024·FR-046, data-model 2.1·4.12·Open Issues 1, modules.md 9장): `src/content/town.ts` `turn-vehicle` 신호(`SignalDef.arrow`), `src/content/scenarios.ts` turning-car(signal `turn-vehicle`, 단계 stop → wait(pedestriansClear) → wait(vehicleGreen) → go, violations에 `ranRed`, 정지선 40·정지 구역 32~40, 보행자 시점 안내 `afterStep` 0), `src/practice/scenario.ts` 판정 한 줄(회전 구간 정지선 + 건너는 사람 → `turnedIntoCrossingPedestrian`), `src/render/townView.ts`(노란 칸·길 화살표·도착 문·화살표 판)와 `src/render/trackView.ts`(`finishGate` 공용), `src/assets/images/ui/cue-go.svg`(깃발 추가). 테스트: `tests/unit/content.test.ts` 1건 추가(아이 차를 마주 보는 차량 신호), `tests/unit/scenario.test.ts` 2건 추가(화살표 신호 2건)·1건 바꿈(예전 "돌기 전~횡단보도 앞 정지 인정" → 모퉁이 앞 정지선)·3건 고침(직진 방향 안내 2건은 초록 화살표 뒤부터, SC-010은 회전 구간 정지선 기준). 기록: `records/play-check.md` 2026-10-13 절. 검증: `npm test`, `npm run build`, `npm run test:e2e`

**Checkpoint**: P1 범위(US1 + US2) 완료 — 교육 핵심을 시연할 수 있음.

---

## Phase 5: User Story 3 — 안전 연습을 마치면 레이싱이 열리고, 같은 브라우저에서는 열린 상태가 유지된다 (Priority: P2)

**Goal**: 레이싱 잠김 표시, 세 번째 완료 순간 열림·저장, 재방문 유지, 연습 목록, 저장 불가 환경 처리.

**Independent Test**: 기록 없는 브라우저에서 잠김 → 세 연습 완료 → 열림 → 새로 고침·재방문 뒤 유지 → 데이터 삭제 뒤 잠김, 저장 막힘 환경에서 안내 1회와 이번 실행 중 열림(spec US3). 자동: T066.

- [X] T063 [P] [US3] `src/ui/screens.ts`: 시작 화면 레이싱 버튼(잠김 그림 / 열림), `practiceMenu`(상황 그림 3개 `images/ui/scenario-<ScenarioId>.svg`, 이번 실행 완료 표시, 모두 선택 가능)(FR-030, FR-048, FR-049). 함께: T096이 첫 배포 때 화면이 없어 남긴 검사 — `tests/e2e/credits.spec.ts`의 `a[href]` 0 시험에 `practiceMenu`(저장값 주입) 추가. 검증: `npm run typecheck`
- [X] T064 [P] [US3] `src/ui/overlays.ts`: storageNotice(그림 + 보호자용 짧은 글 + 닫기, FR-080), 레이싱 열림 축하(FR-047). 검증: `npm run typecheck`
- [X] T065 [US3] `src/app/flow.ts`: 잠긴 레이싱 누름 → 그림 안내만·레이싱 진입 안 함(음성은 T081), 열림이면 레이싱 → `pickVehicle`(mode race) → `pickCharacter` → `race`(경기는 T077), B8 목록 흐름(그 밖의 practice → `practiceMenu`, 메뉴에서 고를 때 조작 익히기 조건), 세 번째 완료 → `tutorialDone = true` → `commitSave(…, 'tutorial', …)` → 축하 → `start`(events.md 2장, FR-047), `commitSave` false와 부팅 `loadSave` `ok: false`면 storageNotice 실행당 1회(`storageNoticeShown`, FR-080). 레이싱 열림은 다시 잠기지 않음(FR-050). 검증: `npm run build`, 동작은 T066
- [X] T066 [US3] `tests/e2e/storage.spec.ts` 신설 — 기록 없음: 레이싱 잠김 그림, 누르면 `start` 그대로(US3-1); 초기화 스크립트로 `tutorialDone: true` 저장값 주입 → 레이싱 열림·`pickVehicle` 진입(US3-4); localStorage getter 예외 → `start` 도달·`data-overlays`에 storageNotice 1회(SC-017 일부); 손상 값 `{` → 기본값·storageNotice 없음(quickstart S4-3); 열림 상태에서 새로 고침 뒤 유지(SC-016 일부) — 5건. 검증: `npm run test:e2e -- tests/e2e/storage.spec.ts`
- [X] T067 [US3] 플레이 확인(quickstart S3 1~2단계, S5): 세 연습 완료 → 축하 → 레이싱 열림·`driving_game:save` 기록, 새로 고침 뒤 유지; 저장 막힘 환경에서 세 연습 완료로 열림·새로 고침 뒤 잠김(US3-8). 기록: `records/play-check.md`. 검증: 항목별 예/아니오와 날짜

**Checkpoint**: 교육(안전 연습)과 보상(레이싱 열림)이 이어짐.

---

## Phase 6: User Story 4 — 전용 트랙에서 컴퓨터 차량 3대와 경주해 순위와 완주 시간을 확인한다 (Priority: P2)

**Goal**: 카운트다운, 4대 경주, 순위·바퀴·시간, 접촉 감속·끼임 복귀, 부정 완주 방지, 완주 결과·최고 기록, 재도전.

**Independent Test**: 완료 기록이 있는 브라우저에서 정상 완주(순위·시간·최고 기록 저장), 접촉·이탈·끼임 복귀, 후진 결승선·역주행 미인정, 약 5분 지나도 종료되지 않음(spec US4). 자동: SC-012~015 Vitest(T068~T073), T078.

- [X] T068 [P] [US4] `src/race/progress.ts`(`STUCK_TICKS` 자리값, `RaceCar`, `progressValue`, `rankCars`, 체크포인트 통과·복귀 자세 계산 내부 함수; modules.md 6.2, data-model 7장). 테스트(공개 함수만, modules.md 6.2): `tests/unit/progress.test.ts` 신설 — 진행도 식(투영을 현재 구간으로 제한 → 안쪽 가로지르기로 진행도가 늘지 않음, FR-059), 순위 규칙과 동점(완주 tick → overshoot → 플레이어 → slot, FR-057). 체크포인트 통과·복귀 자세 내부 함수는 계약대로 `stepRace`를 거쳐 T071·T072에서 시험. 검증: `npm test -- tests/unit/progress.test.ts`
- [X] T069 [P] [US4] `src/sim/collision.ts`에 `blockByTrackWalls`·`separateCars`. 테스트: `tests/unit/collision.test.ts`에 3건 추가 — 벽에서 막고 감속·튕김 없음, 겹친 만큼 떼어 놓기·heading 그대로·touching 표시, 입력 순서대로 결정적(FR-060). 검증: `npm test -- tests/unit/collision.test.ts`
- [X] T070 [US4] `src/race/ai.ts` `aiInput`(modules.md 6.3). 테스트: `tests/unit/ai.test.ts` 신설 — `DriveInput`만 반환, 무작위 없음·같은 스냅숏이면 처리 순서와 무관, laneOffset 주행선을 따라감, targetSpeedRatio를 넘으면 액셀을 뗌, reactionTicks 지연, 앞이 막히면 옆 주행선(FR-054, FR-060). 선행: T068. 검증: `npm test -- tests/unit/ai.test.ts`
- [X] T071 [US4] `src/race/race.ts` `createRace`·`stepRace` 기본: modules.md 6.1(4대 `restingAt(grid)`, playerSlot, 컴퓨터 외형 = VEHICLES에서 플레이어 차를 뺀 앞 3종, countdown 중 정지·gearTap 무시·초마다 countdownTick, 0이 되는 틱 `go` + 첫 `rankChanged`, running에서 raceTicks + 1, 네 대 같은 `stepVehicle` → `blockByTrackWalls` → `separateCars`, `lapCompleted`, 플레이어 완주 틱 `finished`·`timeCs = Math.round(raceTicks × 100 / TICK_HZ)`·`playerFinished`는 그 틱 마지막, 이후 no-op; events.md 7.2 순서). 테스트: `tests/unit/race.test.ts`에 추가 — 위 항목, 카운트다운 중 누른 액셀이 go 다음 틱부터 반영(FR-017 단서), 재도전 = 새 상태로 모든 값 처음(FR-065), 차종을 바꿔도 같은 입력이면 같은 결과(US4-11), 다음 차례 체크포인트만 정방향 인정·결승선 후진 왕복·역방향 불인정(FR-059, progress 내부 함수를 `stepRace`로 시험) — 7건. 선행: T068~T070. 검증: `npm test -- tests/unit/race.test.ts`
- [X] T072 [US4] `src/race/race.ts` 끼임·접촉: `stuckTicks ≥ STUCK_TICKS` → 복귀·`respawned`(완주한 차 제외, 컴퓨터도 같음), touching → `contactSlow` `CONTACT_SLOW_TICKS` 감속. 테스트: `tests/unit/race.test.ts`에 4건 추가 — SC-014 끼임 10회 자동 복귀·재시작 0, SC-013 결승선 후진 왕복 20·역주행 1바퀴·가로지르기·복귀 10회에서 바퀴 증가 0·순위 상승 0, SC-012 30분 이상(108,000틱 이상) 느린 주행 강제 종료 0·시간 = 틱 ÷ 60, 복귀 자세(data-model.md 7장 후보 4곳): 진행도 ≤ 복귀 전·다른 차와 겹치지 않음, 옆 3칸이 다른 3대로 막혀도 네 번째 후보로 복귀, 곡선 체크포인트에서 다른 차 한 대가 두 후보를 함께 막지 못함(FR-061, 사용자 결정 2026-10-12). 검증: `npm test -- tests/unit/race.test.ts`
- [X] T073 [US4] `src/race/race.ts` `finishResult`. 테스트: `tests/unit/race.test.ts`에 5건 추가 — 엄격히 짧을 때만 새 기록(같으면 아님), runBest·storedBest 중 짧은 쪽 기준, `MAX_RECORD_CS` 초과는 후보 제외, 완주 5회의 최솟값 = 최고 기록(SC-015, FR-064), storage.md 7장 두 탭 첫 사례의 결과 부분(다른 탭 저장값 30000, 이 탭 runBest 없음·31000 완주 → `finishResult`의 `isNewBest` false·`best` 30000, SC-019). 그 결과로 `commitSave`를 부르지 않는 것은 T077의 flow 동작(events.md 5장 `playerFinished`). 검증: `npm test -- tests/unit/race.test.ts`
- [X] T074 [P] [US4] `src/render/trackView.ts` `renderTrack`: 노면·벽·결승선(마을과 다른 색·모양, FR-052), 4대 차량 모델, 아이 차 구별 표시(FR-053), 아이 차 탑승객, 카메라 추적. 검증: `npm run typecheck`
- [X] T075 [P] [US4] `src/ui/hud.ts` 레이싱: 순위 n/4, 바퀴 `min(lapsDone + 1, laps)/laps`, 경기 시간 `formatRecord`, 카운트다운 큰 숫자·출발 그림(FR-055, FR-056). 검증: `npm run typecheck`
- [X] T076 [P] [US4] `src/ui/screens.ts` `raceResult`: 순위·`formatRecord(timeCs)`·최고 기록·새 기록 표시, 순위와 상관없는 칭찬, 재도전·시작 화면으로(FR-063, FR-065). 검증: `npm run typecheck`
- [X] T077 [US4] `src/app/flow.ts` 레이싱 연결: race 진입 때 `createRace` + `releaseAll`, 틱마다 `stepRace`, events.md 5장 반응(go 때 `releaseAll` 안 함, rankChanged·lapCompleted → HUD, 플레이어 respawned → `releaseAll`, playerFinished → `loadSave(key)`(`ok`가 거짓이면 storageNotice 1회, FR-080) → 그 `data.best`로 `finishResult` → `race.result`·`run.best` → isNewBest면 `commitSave(…, 'best', …)` → false면 storageNotice 1회 → `raceResult`), 재도전은 새 경기, `__e2e.raceTicks`·`__e2e.playerRank`. 선행: T065, T071~T076. 검증: `npm run build`, 동작은 T078
- [X] T078 [US4] `tests/e2e/race.spec.ts` 신설 — `tutorialDone: true` 저장값 주입 → 차량 5종 각각 레이싱 진입(SC-001 레이싱), 카운트다운 동안 raceTicks 0 → go 뒤 증가(`page.clock`), playerRank가 1~4. 3D 필요 → T005 규칙. 검증: `npm run test:e2e -- tests/e2e/race.spec.ts`

**Checkpoint**: 열린 레이싱을 처음부터 결과·재도전까지 플레이 가능.

---

## Phase 7: User Story 5 — 소리 안내를 듣고, 소리를 끄거나 켤 수 있다 (Priority: P2)

**Goal**: 시작 버튼 뒤 소리 활성화, 안내 하나만·배경음 낮춤, 위협적이지 않은 효과음, 두 묶음 소리 설정 저장, 소리 실패에도 진행.

**Independent Test**: 시작 버튼 전 무음 → 뒤 재생, 안내 중 배경음 낮아짐, 설정 끄기·켜기와 재방문 유지, 음원 실패에도 진행(spec US5). 자동: T080, T083.

- [ ] T079 [P] [US5] `src/content/voice.ts`: `VoiceLineId`(content-data.md 3장 26개 ID 합집합), `VOICE_LINES`(쓰는 곳 설명을 바탕으로 한 자리 대본 한 줄씩, 최종 대본은 T104), `VIOLATION_LINES` 6종(`violation-<kebab>`). `Record`라 빠지면 타입 검사 실패(content-data.md 1장). 검증: `npm run typecheck`
- [ ] T080 [US5] `src/audio/audio.ts`: modules.md 10장(`SfxId`, `unlockAudio`, `applySoundSettings`, `playVoice`, `stopVoice`, `playSfx`, `pauseAudio`, `resumeAudio`; 첫 `unlockAudio` 안에서만 AudioContext 생성, 첫 성공 때 `loadSounds` 디코딩·`audio/bgm/main.mp3` 반복, 안내는 하나만·새 안내가 앞을 끊고 처음부터, 안내 중 배경음 낮춤, 효과음은 음성 중 낮게, 실패는 조용히). 테스트: `tests/unit/audio.test.ts` 신설(가짜 AudioContext를 `vi.stubGlobal`) — unlock 전 생성 0(SC-020), resume 결과 running이면 true·아니면 false, playVoice 두 번 → 앞 음성 stop(FR-068), 음성 중 배경음 gain 낮음·끝나면 원래, voiceSfx 끔 → 음성 없음, applySoundSettings 즉시 반영(FR-069), pause → suspend·resume → 끊긴 음성 처음부터(FR-076), 버퍼 없음·디코딩 실패에도 던지지 않음(FR-070). 선행: T022, T079. 검증: `npm test -- tests/unit/audio.test.ts`
- [ ] T081 [US5] `src/app/flow.ts` 소리 연결: 시작 버튼 click 안에서 `unlockAudio`, `audioUnlocked`가 거짓이면 이후 사용자 동작마다 다시(FR-066), events.md 2~6장의 `playVoice`·`playSfx` 전부, 잠긴 레이싱 음성은 `audioUnlocked`일 때만(FR-048), `pickVehicle`·`pickCharacter`·`practiceMenu` 진입 음성(FR-012), `pedestrianViewStart` 때 `stopVoice`, 부팅·unlock 때 `applySoundSettings(run.sound)`. 선행: T077, T080. 검증: `npm run build`, 동작은 T083
- [ ] T082 [US5] `src/ui/screens.ts` 시작 화면 소리 설정 버튼 2개(배경음 / 안내·효과음, 켜짐·꺼짐을 모양으로 구분, FR-025)와 `src/app/flow.ts` 처리(`run.sound` 갱신 → `applySoundSettings` → `commitSave(…, 'sound', …)` → false면 storageNotice 1회, FR-069). 파일: `src/ui/screens.ts`, `src/app/flow.ts`. 검증: `npm run build`
- [ ] T083 [US5] `tests/e2e/audio.spec.ts` 신설 — 초기화 스크립트로 AudioContext 생성자 감시: 시작 버튼 전 0·뒤 1 이상(SC-020), `**/*.mp3` 차단해도 `drivingLesson` 진입(SC-021 일부), 배경음을 끄고 새로 고침 → 꺼짐 유지(US5-5, SC-016 일부) — 3건. 검증: `npm run test:e2e -- tests/e2e/audio.spec.ts`

**Checkpoint**: 소리가 붙어도 소리 없이 진행 가능한 상태 유지.

---

## Phase 8: User Story 6 — 언제든 멈췄다가 이어 할 수 있고, 다른 앱으로 가도 게임이 저절로 진행되지 않는다 (Priority: P2)

**Goal**: 일시정지·계속하기·나가기 확인, 숨김·세로·컨텍스트 손실 자동 일시정지, 숨김 시간 미반영, 끊긴 안내 처음부터.

**Independent Test**: 안전 연습·레이싱에서 일시정지·계속하기, 액셀을 누른 채 앱 전환 뒤 복귀, 세로 전환 뒤 복귀, 오래 비운 뒤 복귀, 일시정지 화면에서 나가기(spec US6). 자동: T087.

- [ ] T084 [P] [US6] `src/ui/overlays.ts` 일시정지(계속하기를 가장 크게, 소리 설정 2개, 시작 화면으로 → confirmExit 확인·취소)(FR-069, FR-072, FR-075). 함께: 이 화면의 글자 없는 그림(계속하기 등)을 T103과 같은 방식으로 `src/assets/images/ui/`에 그려 넣음(T103에서 옮김, 사용자 결정 2026-10-13 "버튼·안내 그림만"). 검증: `npm run typecheck`
- [ ] T085 [US6] `src/app/flow.ts` 일시정지: `onTap('pause')`(플레이 화면만) → `paused = 'user'`, `setTicking(false)`, `releaseAll`, 안내 중이면 `stopVoice`, `pauseAudio`; 계속하기 가드(보임 ∧ !rotate ∧ !contextLost) → 안내 중이면 `rewindPedestrianView(view, paused === 'user' ? 'card' : 'intro')`, `paused = null`, `setTicking(true)`, `resumeAudio`; confirmExit 확인 → 시도·경기 버림 → `start`(완료 표시·최고 기록 반영 없음, FR-075); 일시정지 화면 소리 설정은 T082 처리 재사용(events.md 6장). 선행: T082, T084. 검증: `npm run build`
- [ ] T086 [US6] `src/app/flow.ts` 생명주기 반응(events.md 6장): hidden → 플레이 화면이면 `paused = 'auto'`·`setTicking(false)`·`releaseAll`·안내 중 `stopVoice`·`pauseAudio`, 아니면 `pauseAudio`; visible → 플레이 화면은 그대로(FR-073), 아니면 `resumeAudio`; portrait → `rotate = true` + 플레이 화면 자동 일시정지; landscape → `rotate = false`·일시정지 유지; 컨텍스트 손실 → `contextLost = true` + 자동 일시정지, 복구 → `contextLost = false`·일시정지 유지(`fatal`은 T090). 검증: `npm run build`
- [ ] T087 [US6] `tests/e2e/pause.spec.ts` 신설 — 레이싱(저장값 주입) 일시정지 → `page.clock`으로 60초 → raceTicks 변화 0, 계속하기 → 증가(SC-007); `document.hidden`·visibilitychange 흉내 → `data-overlays`에 paused(FR-073); 플레이 중 세로 viewport → rotate·paused, 가로 복귀 → paused 유지(SC-006); 액셀을 누른 채 일시정지 → `data-pressed` 해제(SC-003 일부); 시작 화면으로 확인 → `start`(US6-6) — 5건. 검증: `npm run test:e2e -- tests/e2e/pause.spec.ts`

**Checkpoint**: 중단이 잦은 아이 플레이에서도 결과가 공정하게 유지됨.

---

## Phase 9: User Story 7 — 화면 방향·로딩 실패·3D 불가 환경에서 빈 화면 대신 알기 쉬운 안내를 본다 (Priority: P3)

**Goal**: 세로 안내, 로딩 진행·실패·다시 시도, 3D 불가 안내, 부팅 가드, 컨텍스트 복구 실패 안내, 하위 경로 공개 주소 확인.

**Independent Test**: 공개 주소(하위 경로)에서 세로로 열기, 네트워크를 끊고 로딩 뒤 복구·다시 시도, 3D 불가 환경에서 열기(spec US7). 자동: T091, T092.

- [ ] T088 [P] [US7] `index.html` 부팅 가드(인라인 `<script>`, capture `error` 리스너, `document.body.dataset.screen`이 없을 때만 그림 + 보호자용 글 + "다시 시도" `<button>` → `location.reload()`)와 `<script nomodule>` 안내(Safari·Chrome)(static-paths.md 4장, FR-001, FR-004, FR-005). 검증: `npm run build`, 동작은 T091
- [ ] T089 [P] [US7] `src/ui/overlays.ts`: 로딩(움직이는 진행 그림 + 비율, FR-003), loadFailed(그림 + 보호자용 글 + 다시 시도, 연속 실패 시 인터넷 연결 확인 글, FR-004), unsupported(그림 + 보호자용 글 + Safari·Chrome, FR-005), 세로 안내(돌리기 그림 + 회전 잠금 해제 안내, FR-007), contextLost·fatal(새로 고침 안내, FR-006). 함께: 이 화면들의 글자 없는 그림(로딩·실패·3D 불가·세로 안내 등)을 T103과 같은 방식으로 `src/assets/images/ui/`에 그려 넣음(T103에서 옮김). 검증: `npm run typecheck`
- [ ] T090 [US7] `src/app/flow.ts`·`src/main.ts` 오류 흐름: 로딩 진행률 표시, loadFailed 다시 시도(진행 중 버튼 비활성, `reloadNeeded`면 `location.reload()`, 아니면 `retryFailed`, `prepareModel` reject는 그 파일 실패로 처리), main의 unsupported → 안내 화면, 플레이 밖에서 세로면 rotate 안내(`start` 포함), 컨텍스트가 일정 실제 시간 안에 복구되지 않으면 `fatal`. 파일: `src/app/flow.ts`, `src/main.ts`. 선행: T086, T089. 검증: `npm run build`, 동작은 T091
- [ ] T091 [US7] `tests/e2e/failures.spec.ts` 신설 — `**/*.glb` abort → `loadFailed`·다시 시도 버튼, 60초 동안 자동 재요청 0(`page.clock`), 경로 복구 뒤 다시 시도 → 문서 요청 없이 `start`(quickstart S7-1); `**/buggy-*.glb` 404 → 다시 시도가 페이지를 새로 엶(`load` 이벤트, A5); `getContext('webgl2')` null → `unsupported`·빈 화면 아님(S6); 세로 viewport로 열면 로딩 뒤 rotate 안내, 가로로 바꾸면 `start`(US7-1); 메인 JS 404 → 부팅 가드 다시 시도 버튼(FR-001) — 5건. 선행: T088, T090. 검증: `npm run test:e2e -- tests/e2e/failures.spec.ts`
- [ ] T092 [US7] `tests/e2e/boot.spec.ts`에 1건 추가 — 권한 API(`getUserMedia`, `geolocation.*`, `Notification.requestPermission`, `DeviceMotionEvent.requestPermission`) 호출 0(FR-084, SC-025). 검증: `npm run test:e2e -- tests/e2e/boot.spec.ts`
- [X] T125 [US7] 화면 방향·전체화면(사용자 요청 2026-10-13: 배포판을 폰에서 세로로 열어 당황, "모바일은 가로 고정", 전체화면 → 선택지 중 "자동 + 모서리 전체화면 버튼"; spec FR-007·FR-099, modules.md 11장): `src/platform/lifecycle.ts` `enterFullscreen`·`toggleFullscreen`, `src/ui/screens.ts` 시작 화면 왼쪽 위 전체화면 버튼(쓸 수 있을 때만, 켜기/끄기 그림), `src/ui/overlays.ts` 세로 안내(돌리기 그림 + 회전 잠금 해제 글), `src/app/flow.ts` 시작·열린 레이싱 탭에서 `enterFullscreen`, portrait/landscape → `rotate`·`releaseAll`·세로 중 틱 멈춤, 그림 3장(`rotate-device`·`fullscreen`·`fullscreen-exit`), `tests/e2e/orientation.spec.ts` 3건. T089의 세로 안내·T090의 "플레이 밖 세로 rotate"는 여기서 함. 가로 복귀 뒤 일시정지 유지(`paused = 'auto'`)는 T086. 검증: `npm run test:e2e -- tests/e2e/orientation.spec.ts`. 검토는 다음 덩어리(US4) 때 함께
- [X] T093 [US7] **[승인 필요: 커밋·푸시]** 첫 공개 배포와 공개 주소 확인(quickstart 2.4·S1-3): 사용자 승인 뒤 `main` 푸시 → Actions 성공 → `curl -sI https://kimwoo-ya.github.io/driving_game/` 200, 공개 주소에서 하위 경로 로딩·`start` 도달, 로딩·시작·연습 중 새로 고침, 404·외부 요청 0, 시작 화면에서 크레딧 열림. 선행: T007, T029, T096(크레딧은 공개 배포의 필수 조건, spec US8). 기록: `records/device-check.md` 신설. 검증: Actions 성공·curl 200과 항목별 예/아니오·날짜(SC-022)

**Checkpoint**: 실패 환경에서도 빈 화면이 없음.

---

## Phase 10: User Story 8 — 차량·사람 모델과 음원의 제작자·출처·라이선스를 확인할 수 있다 (Priority: P3)

**Goal**: 시작 화면에서 크레딧을 열어 모델 8종의 작품명·제작자·원출처·라이선스·변경 사실을 누를 수 없는 글자로 확인.

**Independent Test**: 시작 화면 → 크레딧에서 차량 5·사람 3 각각의 표시를 PRD 표와 대조(spec US8). 자동: T094, T096.

- [X] T094 [P] [US8] `src/content/credits.ts`(`Credit`, `CreditId`, `CREDITS` 모델 8행: data-model.md 2.1 표, licenseUrl, `changes`는 assets.md 7장 문구(차량 5종 / Cool Bannana Guy·Turtle 리깅 문구 / Chicken Guy), `checkedOn: '2026-10-12'`; 캐릭터 3종의 작품명·제작자·원출처·라이선스는 `src/assets/models/CREDITS.md`와 같음 — 변경 문구는 assets.md 7장 기준이며 CREDITS.md 제작 기록과 문장까지 같을 필요 없음) 생성 + `tests/unit/content.test.ts`에 #19 1건 추가(FR-088, SC-026 8/8). 파일: `src/content/credits.ts`, `tests/unit/content.test.ts`. 검증: `npm test -- tests/unit/content.test.ts`
- [X] T095 [US8] `src/ui/screens.ts` 크레딧 화면(행마다 작품명·제작자·원출처·라이선스·변경 사실, 주소는 `textContent` 글자, 돌아가기)과 `src/app/flow.ts` `start` ⇄ `credits`(FR-087~090). 파일: `src/ui/screens.ts`, `src/app/flow.ts`. 검증: `npm run build`
- [X] T096 [US8] `tests/e2e/credits.spec.ts` 신설 — 크레딧에 8행의 작품명·라이선스·변경 사실 표시(US8-1·2), `start`·`credits`·`pickVehicle`·`pickCharacter`·`practiceMenu`(저장값 주입)에서 `a[href]` 0(FR-086, SC-026) — 2건. 검증: `npm run test:e2e -- tests/e2e/credits.spec.ts`

**Checkpoint**: 코드 단계(plan 단계 1~4) 기능 완성 — 자리표시 콘텐츠로 전체 흐름이 동작.

---

## Phase 11: 콘텐츠 제작 (plan 단계 5 — 별도 단계, 사용자 결정 필요)

**Purpose**: 자리표시를 실제 콘텐츠로 바꾸고 콘텐츠 "완성" 검사를 켭니다. T097 다음의 T098(사용자 결정)이 끝나기 전에는 T099 이후를 시작하지 않습니다. 에셋 묶음 태스크(그림·소리 파일)는 코드 파일을 바꾸지 않으므로 파일 수 제한 대신 이름 규칙 검사로 확인합니다.

- [ ] T097 `tests/unit/content.test.ts`에 완성 단계 검사 #8(장면 요소 배치)·#22(음성 파일)·#23(배경음 출처)을 `it.skip`으로 추가(#21 규칙 그림은 T102를 앞당기며 켠 채로 넣음, 2026-10-13)(D5). 검증: `npm test -- tests/unit/content.test.ts` 통과, 4건 skipped 표시
- [ ] T098 **[사용자 결정]** plan O1·B15: 안내 음성 제작 방법(직접 녹음 / 미리 만든 TTS 파일), 규칙 그림 38장·UI 그림 제작 방법(래스터로 바꾸면 assets.md 2장의 그림 번들 결정을 먼저 다시 정함), 배경음악 곡·녹음 선정과 사용조건 확인. 기록: `records/content-review.md` 신설. 검증: 세 항목 결정 내용과 날짜
- [ ] T099 `src/content/town.ts` `TOWN.props`(규칙 sceneElements 12종을 같은 상황 `near`에 1개 이상)와 `src/render/townView.ts` 장면 요소(주차된 차·후진하는 차는 차량 모델 복제, 트럭은 트럭 모델, 버스·통학버스·정류장·골목길·보도 없는 길·신호등 없는 횡단보도·노란 대기선·육교/지하도·굴러가는 공·차 밑 물건은 기본 도형; plan "장면 요소")(FR-092). 판정·성능에 영향 없음. 선행: T098. 검증: `npm test -- tests/unit/content.test.ts tests/unit/scenario.test.ts`(#17 거리 검사 포함 통과)
- [ ] T100 `tests/unit/content.test.ts` #8 skip 해제. 선행: T099. 검증: `npm test -- tests/unit/content.test.ts`
- [ ] T101 `src/content/rules.ts` 콘텐츠 확정: `text` 다듬기(FR-093·095, SC-027 기준), 남은 규칙의 `poses`, `durationTicks`(음성 길이 이상), B14 날씨. 함께: 카드마다 보여 줄 보행자 신호 모습(예: A5 빨강 → 초록, A9 깜빡임에 기다림) — 지금은 안내 동안 신호가 멈춘 순간 상태(보행자 초록) 그대로라 카드 문구와 신호가 어긋날 수 있음. 걷는 동작(`walk`)은 보행자 초록일 때만(사용자 지적 2026-10-13). 검증: `npm test -- tests/unit/content.test.ts`
- [X] T102 규칙 그림 38장 `src/assets/images/rules/<RuleId>.svg`(T098 방법, 소리 없이 그림만으로 뜻 전달, A2·A25·A26·B13·B14의 사람·옷차림 포함, 위험 행동 본보기 없음, FR-094·095)와 `tests/unit/content.test.ts` #21 skip 해제. 선행: T100. 검증: `npm test -- tests/unit/content.test.ts`, `npm run build` — 2026-10-13 앞당겨 구현(사용자 지적 "안내문구 위 네모 박스는 왜 비어 있냐" → 선택지(지금 그리기 / 그림 생길 때까지 상자 숨기기) 중 "지금 그리기"): 38장, 그림이 다 생겨 `picture()`의 도형 대체 경로·`.shape-rule` 삭제, #21 켬. 검토는 다음 덩어리(US4) 때 함께
- [X] T103 [P] UI 그림 `src/assets/images/ui/*.svg`(assets.md 6장 이름 규칙: `scenario-<id>` 3, `violation-<kebab>` 6, `cue-<HintCue>` 9, 전진·후진·잠김·완료·일시정지 버튼·먼저 멈춰요 등, 지금 화면에 쓰이는 그림. 계속하기·세로 안내·로딩·실패·3D 불가는 그 화면을 만드는 T084·T089로 옮김 — 사용자 결정 2026-10-13 "버튼·안내 그림만"에 따라, US3 검증 Q1 권장안). 검증: `npm run build`, `ls src/assets/images/ui/cue-*.svg | wc -l` = 9, `violation-*` = 6, `scenario-*` = 3
- [ ] T104 `src/content/voice.ts` 최종 대본(SC-027 기준: "차가 스스로 멈춘다"로 읽히는 표현 없음, 손 들기는 멈춤 확인과 함께). 검증: `npm run typecheck`
- [ ] T105 안내 음성 파일 `src/assets/audio/voice/<RuleId 또는 VoiceLineId>.mp3`(규칙 38 + 줄 26)와 `tests/unit/content.test.ts` #22 skip 해제. 직접 만들지 않은 음성이면 크레딧 행은 T107에서 추가. 선행: T102, T104. 검증: `npm test -- tests/unit/content.test.ts`
- [ ] T106 [P] 효과음 7개 `src/assets/audio/sfx/<SfxId>.mp3`(충돌음·비명·사이렌·경적 연타 없음, FR-036). 검증: `ls src/assets/audio/sfx/*.mp3 | wc -l` = 7, 소리 검토는 T110
- [ ] T107 배경음 `src/assets/audio/bgm/main.mp3`(30~60초 반복 구간)와 `src/content/credits.ts`의 musicComposition·musicRecording 행(직접 만들지 않은 음성·효과음·글꼴·아이콘 행 포함, FR-089). 사용조건을 확인하지 않은 자료는 넣지 않음. 검증: `npm run typecheck`
- [ ] T108 `tests/unit/content.test.ts` #23 skip 해제. 선행: T105, T107. 검증: `npm test -- tests/unit/content.test.ts`
- [ ] T109 **[사용자 결정]** 다른 차(컴퓨터 차량·주차된 차)의 탑승객 배정(plan O4, data-model Open Issues 4). 태우기로 하면 data-model·계약에 `passengers` 필드를 먼저 반영한 뒤 구현 태스크를 이 목록에 추가. 기록: `records/content-review.md`. 검증: 결정 내용과 날짜
- [ ] T110 콘텐츠 검토 기록: SC-026(크레딧 8/8·채택 자료 100%), SC-027(문구·연출), SC-030(38/38 그림·문구), SC-031(정한 횟수 안에 추가 규칙 모두), SC-032(Chicken Guy 좌우 보기·손 들기 장면 100%), SC-010·FR-036(사고 장면·위협적인 소리 0). 기록: `records/content-review.md`. 검증: 항목별 통과/실패와 날짜

---

## Phase 12: Polish & 점검 (plan 단계 6)

**Purpose**: 측정 도구, 금지 패턴 검사, 기기 점검과 조정, 실제 기기·어린이 관찰, 문서 맞춤, 최종 확인.

- [ ] T111 [P] `src/render/stage.ts` `?perf` 표시(첫 화면까지 시간(`performance.timeOrigin` 기준), 평균 fps, 가장 긴 프레임, 그리기 호출, 삼각형; static-paths.md 6장, SC-024). 검증: `npm run build`, 브라우저에서 `?perf`를 붙이면 수치가 보이고 없으면 보이지 않음
- [ ] T112 금지 패턴 0건 검사(코드 파일만 — `src/`의 `*.ts`와 `index.html`, 문서·테스트·에셋 제외; contracts/overview.md 공통 규칙 1·3·5, FR-081·084~086, SC-025). 외부 링크 여부는 화면 DOM의 `a[href]` 0건 검사(T096)가 맡고, 여기서는 링크를 만드는 코드만 찾습니다(SVG 안의 `<use href="#…">` 같은 그림 내부 참조는 대상 아님). 검증: 아래 5개 명령 모두 출력 없음(grep은 일치가 없으면 종료 1이며 이것이 통과 — 공통 "종료 0" 규칙의 예외) — `grep -rnE --include='*.ts' "innerHTML|outerHTML|insertAdjacentHTML|eval\(|new Function|createElement\(['\"]a['\"]\)|\.href\b|setAttribute\(['\"]href" src/`, `grep -nE "<a[ >]|innerHTML|eval\(" index.html`, `grep -rnE --include='*.ts' "Date\.now|setTimeout|setInterval|Math\.random" src/sim src/practice src/pedestrianView src/race src/storage src/content`, `grep -rnE --include='*.ts' "from 'three|document\.|window\.|AudioContext" src/sim src/practice src/pedestrianView src/race src/storage src/content`, `grep -rnE --include='*.ts' "getUserMedia|geolocation|requestPermission|DeviceMotionEvent" src/`. 걸리면 그 코드를 고친 뒤 다시 확인
- [ ] T113 초기 기기 점검(plan O6·O7): 대표 기기·최소 OS/브라우저 버전 선정, SC-023·SC-024 목표 수치, "너무 작은 화면" 기준을 정해 `src/platform/lifecycle.ts` 기준 상수와 `src/render/stage.ts` 픽셀 비율 상수를 조정. 기록: `records/device-check.md`(`?perf` 측정: 로딩 시간, 마을 연습 60초·레이싱 60초 평균 fps·가장 긴 프레임·그리기 호출). 선행: T111. 검증: 기록, `npm run build`
- [ ] T114 **[승인 필요]** Vite 8.3.3 이상으로 올리기(plan O9; 2026-10-20 이후, 2주 기준 확인) — 실제 기기에서 `npm run dev -- --host`를 쓰기 전에. 파일: `package.json`, `package-lock.json`. 검증: `npm ci && npm test && npm run build && npm run test:e2e` 종료 0
- [ ] T115 트랙·주행 조정(plan O5, SC-011): `src/sim/vehicle.ts` `DRIVING_SPEC` 값, `src/content/track.ts` 중심선·폭·체크포인트·laps 확정(모양이나 바퀴 수가 바뀌면 revision + 1). 기록: `records/play-check.md`. 검증: `npm test`
- [ ] T116 `tests/unit/race.test.ts`에 SC-011 대리 지표 1건 추가 — 기준 운전자(정해 둔 입력 스크립트)로 경기 시간 4:30~5:30. 선행: T115. 검증: `npm test -- tests/unit/race.test.ts`
- [ ] T117 연습 조정 상수(plan O5): `src/practice/scenario.ts`(`IDLE_HINT_TICKS`, `DEMO_AFTER_FAILS`, `EXPLAIN_TICKS`; 꼭 기다려야 하는 시간은 기기 자동 잠금보다 충분히 짧게)와 `src/practice/ruleRotation.ts`(`EXTRAS_PER_VIEW`, 3~5세 안내 길이). 기록: `records/play-check.md`. 검증: `npm test`
- [ ] T118 레이싱 조정 상수(plan O5): `src/race/race.ts`(`COUNTDOWN_TICKS`, `CONTACT_SLOW_TICKS`)와 `src/race/progress.ts`(`STUCK_TICKS`). 기록: `records/play-check.md`. 검증: `npm test`
- [ ] T119 정지 인정 범위(`stopZone`)·ActorPlan 값 조정: `src/content/scenarios.ts`(3~5세 기준 넉넉하게). 함께: 3단계에서 돌아 나간 뒤 방향이 조금 틀어지면 오른쪽 보도에 닿는 문제(차선과 보도 사이 여유 1 m, `records/play-check.md` 2026-10-13 T126 절, 사용자 결정 2026-10-13 "지금은 그대로, 기록만"). 기록: `records/play-check.md`. 검증: `npm test`(#16·#17 포함)
- [ ] T120 실제 기기 시험: SC-002(±0.05초·±0.1 m), SC-003(7상황 × 10회), SC-004, SC-005(각 10회), SC-006, SC-007, SC-012(지원 기기 1회), SC-021(무음 상태와 음원 전부 차단 상태 각각 시작~레이싱 완주, 2/2), SC-023(선정 기기 전체), SC-024, SC-032(15조합 탑승객·Chicken Guy 3/3), plan O7 미확인 항목. 기록: `records/device-check.md`. 검증: SC별 결과·기기·날짜
- [ ] T121 어린이 플레이 관찰(SC-028, SC-029): 관찰 계획(그룹별 인원·통과 비율 기준)과 결과. 기록: `records/child-observation.md` 신설. 검증: 그룹별 비율과 날짜
- [ ] T122 문서 맞춤: 점검 결과(O2·O3·O5·O6·O8 등)를 `plan.md` Open Issues와 `research.md`에 함께 반영(plan 결정이 바뀌면 research도 같이). 파일: `specs/001-kids-driving-safety-game/plan.md`, `specs/001-kids-driving-safety-game/research.md`. 검증(문구 검사): 해결된 O 항목마다 결과와 날짜가 있음
- [ ] T123 최종 확인: `npm run typecheck && npm test && npm run build && npm run test:e2e` 종료 0, quickstart S1~S7 수동 확인. 기록: `records/play-check.md`·`records/device-check.md`. 검증: 명령 종료 코드와 시나리오별 결과

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 바로 시작. T001·T005·T006은 승인 뒤에만 실행. T007은 사용자 작업이며 T093(첫 공개 배포) 전에 끝나야 함
- **Foundational (Phase 2)**: Setup 완료 뒤. 모든 이야기를 막음
- **US1 (Phase 3)**: Foundational 뒤
- **US2 (Phase 4)**: US1 뒤(조작 버튼·흐름·마을 기본 장면·탑승객 렌더러를 씀)
- **US3 (Phase 5)**: US2 뒤(세 번째 완료 이벤트를 씀)
- **US4 (Phase 6)**: US3 뒤(시작 화면 레이싱 버튼·race 진입 경로). 순수 로직 T068~T073은 Foundational 뒤 언제든 가능
- **US5 (Phase 7)**: US4 뒤(모든 이벤트에 소리를 붙임). T079·T080은 Foundational 뒤 언제든 가능
- **US6 (Phase 8)**: US5 뒤(일시정지가 소리·보행자 시점 안내 되감기를 다룸)
- **US7 (Phase 9)**: US6 뒤(flow 오류 흐름이 생명주기 처리 위에 놓임). T088·T089는 Foundational 뒤 언제든 가능. T093(첫 공개 배포)은 US8의 T096 뒤(크레딧이 공개 배포의 필수 조건)
- **US8 (Phase 10)**: Foundational 뒤 언제든 가능하지만 `screens.ts`·`flow.ts`를 함께 고치므로 순서대로 진행 권장
- **콘텐츠 (Phase 11)**: US2·US4의 데이터 형식이 정해진 뒤(plan 작업 단계 5). T098(사용자 결정)이 T099 이후를 막음
- **Polish (Phase 12)**: 원하는 이야기가 끝난 뒤. T114는 2026-10-20 이후, 실제 기기에서 개발 서버를 열기 전

### 같은 파일을 여러 태스크가 고치는 곳 (동시 진행 금지)

- `src/app/flow.ts`: T027 → T039 → T060 → T065 → T077 → T081 → T082 → T085 → T086 → T090 → T095
- `src/ui/screens.ts`: T026 → T035 → T063 → T076 → T082 → T095
- `src/ui/hud.ts`: T038 → T059 → T075 / `src/ui/overlays.ts`: T059 → T064 → T084 → T089
- `src/render/characters.ts`: T033 → T057 → T061 / `src/render/townView.ts`: T037 → T058 → T126 → T099
- `src/practice/scenario.ts`·`tests/unit/scenario.test.ts`: T021 → T048 → T049 → T050 → T051 → T056 → T126 → T117
- `src/race/race.ts`·`tests/unit/race.test.ts`: T018 → T071 → T072 → T073 → T116(T118은 race.ts만)
- `tests/unit/content.test.ts`: T010 → T012 → T014 → T015 → T017 → T023 → T047 → T055 → T094 → T126 → T097 → T100 → T102 → T105 → T108
- `src/content/town.ts`·`scenarios.ts`: T013 → T053 → T054 → T126 → T099(town) / T119(scenarios)

### Within Each User Story

- 순수 로직(짝 Vitest 포함) → 렌더러·UI → flow 연결 → Playwright·수동 확인
- 각 태스크의 검증을 통과한 뒤 다음 태스크로

---

## Parallel Examples

### Phase 2 (Foundational)

```bash
Task: "T008 src/core/loop.ts + tests/unit/loop.test.ts"
Task: "T016 src/storage/save.ts + tests/unit/save.test.ts"
Task: "T026 src/ui/screens.ts 시작 화면 + src/style.css"
```

### User Story 1

```bash
Task: "T030 src/input/controls.ts 순수 부분 + tests/unit/controls.test.ts"
Task: "T031 src/platform/lifecycle.ts"
Task: "T033 src/render/characters.ts 탑승객"
Task: "T034 src/render/showroom.ts"
Task: "T035 src/ui/screens.ts 선택 화면"
Task: "T038 src/ui/hud.ts"
```

### User Story 2

```bash
Task: "T043 townActors.ts + townActors.test.ts"
Task: "T044 collision.ts blockByAreas + collision.test.ts"
Task: "T045 pedestrianView.ts + pedestrianView.test.ts"
Task: "T046 ruleRotation.ts + ruleRotation.test.ts"
# 엔진(T048~T051) 뒤
Task: "T057 render/characters.ts Chicken Guy"
Task: "T059 ui/hud.ts + ui/overlays.ts"
```

### User Story 4

```bash
Task: "T068 race/progress.ts + progress.test.ts"
Task: "T069 sim/collision.ts 벽·차끼리"
Task: "T074 render/trackView.ts"
Task: "T075 ui/hud.ts 레이싱"
Task: "T076 ui/screens.ts raceResult"
```

US3·US5·US6·US7·US8은 `flow.ts`·`screens.ts`·`overlays.ts`를 공유하므로 [P] 표시된 화면 태스크(T063·T064, T079, T084, T088·T089, T094)만 동시에 진행합니다.

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1 Setup(승인 항목 포함) → Phase 2 Foundational → Phase 3 US1
2. **멈추고 확인**: T040·T041 통과, T042 렌더링 점검 기록, 로컬 미리보기(`npm run preview`, 하위 경로)에서 "골라서 운전해 보기" 시연(공개 배포는 크레딧 뒤 T093)
3. 이어서 US2까지 마치면 P1 범위(교육 핵심) 완성

### Incremental Delivery

1. Setup + Foundational → 하위 경로 로컬 확인(배포 워크플로 파일만 준비)
2. US1 → US2(P1 완성) → US3 → US4 → US5 → US6(P2 완성) → US7 → US8(P3, 공개 배포 필수 조건 포함) → T093 첫 공개 배포
3. 콘텐츠 단계(사용자 결정 뒤) → 점검 단계
4. 각 이야기는 끝의 Checkpoint에서 독립 확인 기준으로 검사

### 진행 전 필요한 사용자 작업

- analyze·implement 단계의 교차 검증(`review-snapshot.py`)에는 Git HEAD가 필요합니다. 첫 커밋은 2026-10-12 사용자 승인으로 만들었습니다(`2739ec0`). 이후 커밋도 사용자 요청 때만 합니다(임의 커밋 금지).
- [승인 필요] 태스크(T001, T005, T006, T093, T114)는 각각 승인을 받은 뒤 실행합니다.

---

## Notes

- 구현자·검증자에게는 `AGENTS.md` 절대 경로, PRD·용어집, 이 FEATURE_DIR, 변경 범위, 실제 테스트 명령을 함께 전달합니다(AGENTS.md "Spec Kit와 Orca 작업자에게 전달할 내용").
- 짝 테스트는 구현과 같은 태스크에서 씁니다. 테스트를 먼저 써서 실패를 확인한 뒤 구현해도 됩니다.
- 0건 검사(T112)는 코드 파일만 대상으로 합니다. 문서·테스트에는 그 문자열이 정당하게 남을 수 있습니다.
- `modeling/` ZIP과 `ivi-agent-guide/`는 수정하지 않습니다. 캐릭터 GLB를 다시 만들 때는 `_workspace/03_character-rigging.md`의 재생성 절차를 따르고 체크섬을 맞춥니다.
- 커밋은 사용자가 요청할 때만 합니다. 커밋 메시지에 AI 표기를 넣지 않습니다.
- 스펙이나 태스크가 모호하면 멈추고 묻습니다. 계약에 없는 동작(예: 탑승객 `Sit` 자세 고정, 다른 차 탑승객)은 사용자 확인과 계약 갱신 뒤에 추가합니다.

## SC별 담당 태스크

| SC | 태스크 | SC | 태스크 |
|---|---|---|---|
| SC-001 | T040, T078, T120 | SC-017 | T016, T066, T067 |
| SC-002 | T011, T120 | SC-018 | T016 |
| SC-003 | T041, T087, T120 | SC-019 | T016, T073 |
| SC-004 | T011, T030, T120 | SC-020 | T080, T083 |
| SC-005 | T041, T120 | SC-021 | T045, T083, T120 |
| SC-006 | T087, T091, T120 | SC-022 | T028, T091, T093 |
| SC-007 | T087, T120 | SC-023 | T041, T113, T120 |
| SC-008 | T048 | SC-024 | T111, T113, T120 |
| SC-009 | T051, T056, T062, T067 | SC-025 | T028, T092, T112 |
| SC-010 | T049, T056, T110 | SC-026 | T094, T096, T110 |
| SC-011 | T115, T116 | SC-027 | T101, T104, T110 |
| SC-012 | T072, T120 | SC-028·029 | T121 |
| SC-013 | T068, T072 | SC-030 | T015, T102, T110 |
| SC-014 | T072 | SC-031 | T046, T047, T110 |
| SC-015 | T016, T073 | SC-032 | T015, T040, T042, T061, T110, T120 |
| SC-016 | T016, T066, T083 | | |
