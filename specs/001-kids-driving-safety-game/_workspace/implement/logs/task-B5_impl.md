# Task B5 Implementation Log

- 작성: 2026-10-12, 구현자 = 조율자 Claude Code(Opus 5.5) 세션(순차 구현)
- 범위: tasks.md Phase 4 US2 T043~T047(신호·등장 보행자, 건물 막기, 보행자 시점 안내 함수, 규칙 순환, 콘텐츠 #10) + B4 reviewer 비필수 제안 1번(drivingLesson.test.ts 두 분기 고정)
- 시작 상태: B1~B4 완료(T001~T042 체크), B4 완료 revision `bc724ea7…39a0`
- T044·T045·T046은 앞 세션에서 저장소 밖 초안으로 테스트 먼저 쓰고 실패 확인 뒤 구현해 둔 것을 다시 읽고 옮김

## 변경 파일

| 태스크 | 파일 | 내용 |
|---|---|---|
| T043 | `src/practice/townActors.ts` | `initActors`, `stepTownActors`(시그니처는 modules.md 4.2 그대로), 자리값 `POSE_TICKS` 45·`WALK_SPEED` 1.2 m/s·`FLASH_TICKS` 180·`STOP_MARGIN` 1 m, `TownPedestrian.ticks` 필드 추가 |
| T043 | `src/content/scenarios.ts` | `ActorPlan.pedestrianSignal: SignalId \| null` 추가(signal-wait = `'main-pedestrian'`, 자리표시 둘 = `null`) |
| T043 | `tests/unit/townActors.test.ts`(신설) | 8건: 신호 순서·이벤트, FR-042 동시 초록 0·건너는 중 차 초록 0, 보행자 행동 순서·자세 5종·건너기 시작 조건, 주기 없음 36,000틱, 제동 거리 + 여유, 깜빡임에 출발 안 함·건너는 사람은 계속, 보행자 신호 없는 구간의 차 초록 조건, 차 신호 없는 구간 보행자 초록 고정·깜빡임 시작 틱 |
| T044 | `src/sim/collision.ts`(신설) | `blockByAreas`: 차체 원(`bodyRadius`)과 사각형이 겹치면 이전 자리, `speed = 0`, heading 그대로, `hit: true` |
| T044 | `tests/unit/collision.test.ts`(신설) | 3건 |
| T045 | `src/pedestrianView/pedestrianView.ts` | `startPedestrianView`, `stepPedestrianView`, `rewindPedestrianView` |
| T045 | `tests/unit/pedestrianView.test.ts`(신설) | 3건 |
| T046 | `src/practice/ruleRotation.ts`(신설) | `EXTRAS_PER_VIEW` 2(자리값), `isReplay`, `pickRules`, `advanceExtraCursor` |
| T046 | `tests/unit/ruleRotation.test.ts`(신설) | 5건(추가 규칙 0개는 `vi.doMock`) |
| T047 | `tests/unit/content.test.ts` | #10 1건 |
| B4 제안 | `tests/unit/drivingLesson.test.ts` | "그 단계의 조작이 없으면 넘어가지 않는다"에 조향·액셀·브레이크 단계에서 멈춘 채 후진 탭 1번 → `forward`, 자연 감속으로 선 뒤 브레이크 1틱 → 브레이크 단계 그대로 |

## 구현 판단 메모(검토 요청)

1. **신호 모습(사용자 결정 2026-10-12, 00_context.md)**: 차 신호 초록 → 노랑 → 빨강 → 초록, 보행자 신호 빨강 → 초록 → 깜빡임 → 빨강(data-model.md 4.12 순서). 바뀌는 조건은 모두 차 위치·멈춘 시간·보행자 상태(FR-040):
   - 차: 초록 → 노랑 = `frontS ≥ redAtS`, 노랑 → 빨강 = `speed === 0 ∨ frontS ≥ stopZone.fromS`, 빨강 → 초록 = `stoppedTicks ≥ greenAfterStoppedTicks ∧ 보행자 신호 빨강(또는 없음) ∧ 건너는 사람 없음`
   - 보행자: 빨강 → 초록 = 차 빨강 ∧ `stoppedTicks < greenAfterStoppedTicks`, 초록 → 깜빡임 = `stoppedTicks ≥ greenAfterStoppedTicks − FLASH_TICKS`, 깜빡임 → 빨강 = `stoppedTicks ≥ greenAfterStoppedTicks ∧ 건너는 사람 없음`
   - tasks.md T043 문구 "redAtS를 지나면 빨강"은 노랑을 거쳐 빨강. 문구 정리는 T052(문서 맞춤)에서.
2. **`ActorPlan.pedestrianSignal` 추가(형식 확인 결과, Open Issues 1)**: 구간의 차 신호(`SegmentDef.signal`)와 짝인 보행자 신호를 데이터가 가리킬 곳이 없어 필드 하나를 더함. 세 상황 표현: signal-wait = 차 신호 + 짝 보행자 신호, 보행자 출발 `pedestrianGreen` / crossing-check = 신호 없음(`signal`·`pedestrianSignal` 모두 null), 출발 `playerStopped` / turning-car = 회전 방향 횡단보도 보행자 신호만(`signal: null`) → 초록 고정, 출발 `pedestrianGreen`. 회전 차는 보행자 초록에도 지날 수 있다는 학습 대상(data-model.md 4.12)과 맞고, 직진 차 신호와 짝인 보행자 신호는 동시 초록이 없음(FR-042). `stepTownActors` 시그니처는 그대로. data-model.md·modules.md 반영은 T052.
3. **`TownPedestrian.ticks` 추가**: 건너기 전 행동을 `POSE_TICKS`씩 차례로 보이고, 건널 때 걸은 거리를 재려고 state 안 경과 틱을 둠(data-model.md 2.2 표에 없는 필드 → T052에서 함께 반영).
4. **보행자 출발 조건(FR-039, FR-043)**: 출발 조건(`pedestrianGreen` = 보행자 신호 초록 / `playerStopped` = `stoppedTicks > 0`) ∧ 보행자 신호가 있으면 초록 ∧ `speed === 0 ∨ stopLineS − frontS ≥ 최고 속도 제동 거리(v²/2a) + STOP_MARGIN`. 조건이 깨지면 준비하던 행동을 그만두고 `idle`·`ticks 0`으로 돌아가 다시 기다림(건너기 직전에 좌우 살피기를 끝까지 보임). 깜빡임에는 새로 출발하지 않고, 건너는 사람은 신호가 바뀌어도 계속 걸음(도로 중간에 멈추지 않음). 기준점은 구간의 `stopLineS`(회전 구간도 회전 전 정지선이 횡단보도보다 앞).
5. **`stoppedTicks` 약속(T048에 넘김)**: "stopZone에서 멈춘 뒤 지난 틱"이며 한 시도 안에서 되돌아가지 않아야 함. 진행 신호 뒤 출발해도 차 신호가 다시 노랑이 되지 않는 근거(`stoppedTicks < greenAfterStoppedTicks`일 때만 초록 → 노랑). 함수 주석에 적음.
6. **state에 없는 신호**: 구간이 쓰지 않는 마을 신호는 `signals`에 넣지 않음. 렌더러의 기본 표시(차 초록·보행자 빨강 등)는 T058에서 정함.
7. **`blockByAreas` 감속**: "경계 앞에 두고 감속"을 이전 자리 + `speed = 0`으로 구현(튕김·회전 없음, modules.md 3.2 표현).
8. **pedestrianView 내부 값**: `card = rules.length`는 끝남(그 뒤 no-op), `cardTicks = -1`은 `'card'` 되감기 직후(다음 틱이 그 카드의 0틱이 되어 `cardShown`이 다시 나옴). data-model.md 2.2 `PedestrianViewState` 설명(`card −1` = 카메라 이동)에 없는 값 → T052 문서 맞춤 때 함께 적을지 검토 요청.
9. **변이 시험(저장소 밖 복사본만)**: townActors 9건(차 초록 조건 2, 보행자 출발 3, 깜빡임 시작 틱, 다시 노랑 막기, 보행자 초록 조건, 준비 취소), drivingLesson 2건(B4 reviewer m1·m2) 모두 테스트가 잡음. 처음 두 건이 살아남아 시험 2개를 더함(보행자 신호 없는 구간의 차 초록, `playerStopped` 보행자의 깜빡임 출발).

## 자체 검증 결과

| 태스크 | 명령 | 종료 코드 | 결과 |
|---|---|---|---|
| T043 | `npm test -- tests/unit/townActors.test.ts` | 0 | 8 passed |
| T044·T045·T046 | `npm test -- tests/unit/collision.test.ts tests/unit/pedestrianView.test.ts tests/unit/ruleRotation.test.ts` | 0 | 11 passed |
| T047 | `npm test -- tests/unit/content.test.ts` | 0 | 17 passed |
| B4 제안 | `npm test -- tests/unit/drivingLesson.test.ts` | 0 | 5 passed |
| 전체 | `npm run typecheck` / `npm test` / `npm run build` | 0 / 0 / 0 | — / 13 files 104 passed / 성공(500 kB 청크 경고 기존과 같음) |
| 전체 | `npm run test:e2e` | 0 | 22 passed |

## 피드백 반영 이력
