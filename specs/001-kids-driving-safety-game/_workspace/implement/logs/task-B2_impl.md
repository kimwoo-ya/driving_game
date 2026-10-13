# Task B2 (T008~T021, T007 확인) Implementation Log

## 태스크

Phase 2 Foundational 앞부분: 순수 로직(루프·주행·저장·기록 표시·실행 상태)과 콘텐츠 데이터·타입 골격. T007(사용자 작업, Pages 켜기)은 결과만 확인.

## 변경 파일

- `src/core/loop.ts` (T008) — `TICK_HZ`, `MAX_TICKS_PER_FRAME`, `ticksForFrame`(0.25초 자름, 8틱 상한·넘친 누적 버림, 부동소수 오차 보정 1e-6틱), `startLoop`, `setTicking`. 모듈 최상위에서 브라우저 전역 미사용
- `src/content/vehicles.ts` (T009) — 5종, 한국어 label, `yawDeg` 0·`seats` 1개 자리값, `Vec3`는 `import type`(sim/vehicle 소속)
- `src/content/characters.ts` (T009) — 3종, clips(chicken-guy `Armature|Idle`·`Armature|Walk`, 나머지 `Idle`), `CharacterPose`
- `src/sim/vehicle.ts` (T011) — 타입 8종, `DRIVING_SPEC` 자리값, `stepVehicle`(브레이크 우선, steer 자르기, 자연 감속·stopSnap, 방향별 최고 속도, 회전 반경 = maxForwardSpeed / maxSteerRate로 일정, steer +1 = 왼쪽 = heading 증가), `requestGearToggle`, `restingAt`
- `src/content/town.ts` (T013) — 타입 + 자리표시 마을(+Z 직선 도로 한 구역: 도로·횡단보도·보도 2·건물 2, 차량·보행자 신호 1개씩, props [])
- `src/content/scenarios.ts` (T013) — 타입 + `SCENARIOS` 3개. signal-wait 구간 1개(정지선 s=38, 정지 범위 30~38, stop → wait(vehicleGreen) → go, 위반 4종, ActorPlan, pedestrianView). 나머지 둘은 같은 도로의 구간 1개 자리표시(T053·T054에서 교체)
- `src/content/rules.ts` (T015) — 38행, spec 표 순서·원문, researchIds, sceneElements/pictureElements/weather는 data-model 6.2, poses A11·A14-A15·A19-A20, durationTicks 자리값 240
- `src/storage/save.ts` (T016) — storage.md 전체. data-model 5.5 참고 구현 그대로 + `loadSave`(읽기 실패면 기본값, 시험 쓰기만 실패하면 읽은 값, 둘 다 ok false)
- `src/content/track.ts` (T017) — 타입 + 자리표시 트랙(모서리 깎은 직사각형 고리, 폭 14, 체크포인트 4개 모두 직선 가운데, 출발 칸 4개 결승선 뒤, aiProfiles 3)
- `src/race/race.ts` (T018) — `trackConfigKey`, `formatRecord`
- `src/app/session.ts` (T019) — `RunState`, `createRunState`
- `src/practice/townActors.ts` (T020) — `SignalState`, `TownPedestrian` 타입만
- `src/pedestrianView/pedestrianView.ts` (T020) — `PedestrianViewState`, `PedestrianViewEvent` 타입만
- `src/practice/scenario.ts` (T021) — `IDLE_HINT_TICKS` 300·`DEMO_AFTER_FAILS` 3·`EXPLAIN_TICKS` 240(자리값), `HintCue`, `ScenarioAttempt`, `ScenarioEvent` 타입만
- `tests/unit/loop.test.ts` (T008) 신설 4건
- `tests/unit/vehicle.test.ts` (T011) 신설 10건
- `tests/unit/content.test.ts` 신설 — T010 #11·#13·#14(데이터), T012 #20, T014 #16, T015 #1~#7·#9, T017 #18 = 14건. #12·#14(GLB)는 로더가 필요해 B3(T023)
- `tests/unit/save.test.ts` (T016) 신설 25건
- `tests/unit/race.test.ts` (T018) 신설 6건
- `tests/unit/session.test.ts` (T019) 신설 3건

## 구현 판단 메모(검토 요청)

- `ticksForFrame`: 1/120초를 240번 더하면 부동소수 오차로 마지막 틱이 다음 프레임으로 밀릴 수 있어 `floor(acc × 60 + 1e-6)`로 보정. 시험은 4가지 간격으로 2초 = 120틱 일치.
- `stepVehicle` 조향 식은 data-model 2.1이 "vehicle.ts가 정함"으로 둔 부분. heading 변화 = steer × maxSteerRate × (speed / maxForwardSpeed) × 방향(후진이면 −1). 멈춘 차는 돌지 않음.
- 좌표: heading 0 = +Z, steer +1(왼쪽 버튼) = heading 증가 = +X 쪽. three.js에서 +Z를 보는 카메라의 화면 왼쪽이 +X라 왼쪽 버튼과 화면 방향이 맞음.
- `SignalState.light`는 차량·보행자 값의 합집합 `'green' | 'yellow' | 'red' | 'flashing'`(data-model 2.2에 신호 종류 필드가 없음).
- `AreaId`·`SignalId`는 자리표시 데이터의 문자열 합집합. T053·T054에서 구역을 더할 때 함께 늘림.
- content.test.ts #11은 `Record<VehicleKindId, 1>` `satisfies`로 ID 타입 전부를 적게 해 타입 검사와 함께 확인.

## 자체 검증 결과

| 태스크 | 명령 | 종료 코드 | 결과 |
|---|---|---|---|
| T007 | `gh api repos/kimwoo-ya/driving_game/pages --jq .build_type` | 0 | `workflow` |
| T008 | `npm test -- tests/unit/loop.test.ts` | 0 | 4 passed |
| T009, T013, T020, T021 | `npm run typecheck` | 0 | |
| T010, T012, T014, T015, T017 | `npm test -- tests/unit/content.test.ts` | 0 | 14 passed |
| T011 | `npm test -- tests/unit/vehicle.test.ts` | 0 | 10 passed |
| T016 | `npm test -- tests/unit/save.test.ts` | 0 | 25 passed |
| T018 | `npm test -- tests/unit/race.test.ts` | 0 | 6 passed |
| T019 | `npm test -- tests/unit/session.test.ts` | 0 | 3 passed |
| 전체 | `npm test` / `npm run build` | 0 / 0 | 62 passed |
| 구조 규칙 | `grep -rnE "Date\.now\|setTimeout\|setInterval\|Math\.random\|from 'three\|document\.\|window\.\|AudioContext" src/sim src/practice src/pedestrianView src/race src/storage src/content` | 1(일치 없음) | 통과 |

## 피드백 반영 이력

- attempt 1: 초기 구현
- attempt 2: validator FAIL(msg_0a46958e82ba, T016) 반영 — `src/storage/save.ts`의 공유 `DEFAULT_SOUND` 상수를 없애고 `loadSave`가 호출마다 새 `{ music: true, voiceSfx: true }`를 돌려주게 함. `tests/unit/save.test.ts`에 1건 추가(돌려준 기본값을 바꿔도 다음 호출은 켜짐 — 빈 저장소·손상 sound 두 경우). 예전 코드에서 이 테스트 실패 확인(같은 원인으로 뒤 테스트 2건도 연쇄 실패), 수정 뒤 `npm test -- tests/unit/save.test.ts` 종료 0·26 passed, `npm run typecheck`·`npm test`(63 passed)·`npm run build` 종료 0
