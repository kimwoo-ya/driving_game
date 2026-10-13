# Task B7 Implementation Log

- 작성: 2026-10-12, 구현자 = 조율자 Claude Code(Opus 5.5) 세션(순차 구현)
- 범위: tasks.md Phase 4 US2 T053~T056(crossing-check·turning-car 마을·구간 데이터, 콘텐츠 검사 #15·#17, SC-009 3/3·남은 위반 2종) + B6 reviewer 비필수 제안 1~6(아래 "제안 반영")
- 시작 상태: B1~B6 완료(T001~T052 체크)
- B6 검토 중에 저장소 밖 복사본에서 데이터·테스트를 먼저 쓰고, 변이 시험까지 마친 뒤 옮김

## 변경 파일

| 태스크 | 파일 | 내용 |
|---|---|---|
| T053·T054 | `src/content/town.ts` | `AreaId`·`SignalId` 확장, cross(x 40 중심 직선 도로·횡단보도 z 40~44·보도·건물)·turn(x 120 중심 도로 → z 54 중심 옆길, 회전 방향 횡단보도 x 102~106, 보도 4개·건물 1개, 회전 안쪽 모퉁이 비움) 구역, 신호 `cross-vehicle`·`cross-pedestrian`·`turn-pedestrian` |
| T053·T054 | `src/content/scenarios.ts` | 자리표시 함수 제거. crossing-check(stop → wait pedestriansClear → wait vehicleGreen → go, 정지선 40 = 횡단보도 앞 가장자리, 차·짝 보행자 신호, 보행자 playerStopped), turning-car(반지름 5 m 우회전 경로, 정지선 = 회전 방향 횡단보도 앞 가장자리까지 경로 거리, 차 신호 없음·보행자 신호 초록 고정, 보행자 playerStopped), 상황별 pedestrianView. 공통 행동 `LOOKS` |
| T055 | `tests/unit/content.test.ts` | #15(6종 모두 어떤 구간에), #17(보행자 경로 점이 정지선·횡단보도 앞 가장자리 너머 1 m 이상, 보도 위, 차도에서 1 m 이상) + 신호·보행자 계획 전제 1건 |
| T056 | `tests/unit/scenario.test.ts` | SC-009 세 상황 올바른 행동 3/3(경로 따라 조향하는 시험용 운전자), SC-010 enteredCrosswalkWithPedestrian·turnedIntoCrossingPedestrian → segmentReset. 자리표시에 기대던 wrongWay(→ turning-car 직진)·blocked(→ 판정 목록을 비운 시험용 데이터, `vi.doMock`) 시험 수정 |

## 구현 판단 메모(검토 요청)

1. **crossing-check 신호(사용자 결정 2026-10-12 "차·보행자 신호등 있음")**: "보행자가 다 건너고 차 신호도 초록이어야 출발"을 엔진 변경 없이 단계 데이터 `wait(pedestriansClear) → wait(vehicleGreen)`로 표현. tasks.md T053 문구(stop → wait(pedestriansClear) → go)보다 대기 단계가 하나 많음. 안내는 두 번째 wait 진입 때 `hint wait`가 한 번 더 나옴.
2. **정지선 = 횡단보도 앞 가장자리(crossing-check, turning-car)**: 정지선이 횡단보도보다 앞이면 정지선 위반이 먼저 걸려 횡단보도 위반 2종이 나올 수 없음(B6 validator 지적). 그래서 두 상황은 정지선을 횡단보도 앞 가장자리에 둠. turning-car는 경로 꼭짓점 (106, 52)까지 경로 거리를 계산해 `stopLineS`로 씀.
3. **turning-car "회전 전 stop"**: 정지 구역 `[정지선 − 8, 정지선]`이 회전 호 끝과 그 뒤 직선에 걸침 — 차는 회전을 시작한 뒤 회전 방향 횡단보도 앞에서 멈춤(우회전 때 횡단보도 앞 일시정지). tasks.md 문구 "회전 전"을 "회전 방향 횡단보도에 들어가기 전"으로 읽음.
4. **turning-car 보행자(사용자 결정 2026-10-12 "아이 차가 회전 전에 멈춘 뒤")**: `start: 'playerStopped'`, 보행자 신호 `turn-pedestrian`은 차 신호 없는 구간이라 초록 고정(T043 규칙).
5. **회전 안쪽 모퉁이**: 반지름 5 m 우회전에서 차체 원(반지름 1)이 모퉁이 보도에 닿지 않게 x 110~116·z 42~50을 비움(오른쪽 보도는 z 42까지, 남쪽 보도는 x 110까지).
6. **#17 해석**: "모든 점" = 보행자 계획 경로의 꼭짓점(대기·도착 위치). 셋 다 만족: 경로 투영 거리 ≥ max(정지선, 횡단보도 앞 가장자리) + 1 m, 보도 구역 안, 도로·횡단보도 구역까지 거리 ≥ 1 m. 여유 1 m = content-data.md 4장 테스트 상수 제안.
7. **콘텐츠 전제 시험 1건 추가**(B5 validator "T052가 문서에 반영할 것" 8번, B5 reviewer 제안 4): 신호 종류(vehicle/pedestrian), 차 신호가 있으면 `redAtS`·`greenAfterStoppedTicks` 존재·`redAtS ≤ stopZone.fromS`·`stopLineS − redAtS ≥ 최고 속도 제동 거리 + STOP_MARGIN`·`greenAfterStoppedTicks − FLASH_TICKS > poses × POSE_TICKS`, 보행자 경로 점 2개 이상.
8. **blocked 시험**: 실제 구간은 모두 보도에 둘러싸여 건물에 닿기 전에 보도 진입(위반)이 먼저라, 판정 목록을 비운 signal-wait를 `vi.doMock`으로 만들어 시험(마을 데이터는 실제 그대로).
9. **변이 시험(저장소 밖 복사본만)**: 보행자 대기 위치를 도로 쪽으로, turnedInto 누락, 정지선을 횡단보도 앞으로, 깜빡임이 보행자 출발보다 먼저, 회전 모퉁이 보도, 신호 종류 잘못 — 6건 모두 잡힘.

## 제안 반영 (B6 reviewer, task-B6_review.md 개선 제안)

| 제안 | 파일 | 내용 |
|---|---|---|
| 1 시험 고정 | `tests/unit/scenario.test.ts` | S16·S3·S17·S18(올바른 완료 시험 끝: 안내 시작 때 차 초록, 출발 뒤에도 초록, 경로 끝 도달, done no-op), J1(`corners`를 실제 앞쪽 두 모서리로 + 살짝 비스듬한 운전 추가), S9(설명 중 후진 탭도 무시), S11(`DEMO_AFTER_FAILS + 1`번째 실패에도 시범), J13(wrongWay 뒤 계속 직진하면 leftPath — turning-car로 옮긴 시험에서) |
| 2 | `src/practice/scenario.ts` | `next()`의 도달 불가 `!viewDone` 가드 삭제 |
| 3 | `src/practice/scenario.ts` | 다음 구간 분기를 `atSegmentStart({ ...s, failStreak: 0 }, …)` + 차 위치 그대로로 |
| 4 | `src/practice/scenario.ts` | `defOf(s: { scenario })`로 넓혀 `atSegmentStart`도 같은 도우미 사용 |
| 5 | `src/practice/scenario.ts` | `judge` 횡단보도 줄에 "직진·회전 구분은 구간 violations가 정함" 주석 |
| 6 | `data-model.md` | Open Issues 1 문구를 사용자 결정(crossing-check 차·보행자 신호, 두 wait 단계, playerStopped / turning-car playerStopped, 정지선 = 횡단보도 앞 가장자리)대로 |

- 변이 확인(저장소 밖 복사본 `scratchpad/b7m/`): 진행 신호 대기 무시, 판정점을 앞 끝 가운데 한 점으로, 움직이면 stoppedTicks 0으로, go 단계 일찍 완료, done이 no-op 아님, 설명 중 후진 탭 반영 — 6건 모두 잡힘.

## 자체 검증 결과

| 태스크 | 명령 | 종료 코드 | 결과 |
|---|---|---|---|
| T053~T056 | `npm test -- tests/unit/content.test.ts tests/unit/scenario.test.ts` | 0 | 39 passed(content 20, scenario 19) |
| 전체 | `npm run typecheck` / `npm test` / `npm run build` | 0 / 0 / 0 | — / 14 files 126 passed / 성공(500 kB 청크 경고 기존과 같음) |
| 전체 | `npm run test:e2e` | 0 | 22 passed |

## 피드백 반영 이력

### attempt 2 (validator FAIL 1~3 반영, task-B7_validation.md 시도 1/2)

사용자 결정 2026-10-12(00_context.md 승인 기록 "B7 validator FAIL 질문 3건", 모두 권장안)대로 고침.

| 지적 | 파일 | 내용 |
|---|---|---|
| FAIL 1 (T053 막힘, Q3 "보행자가 출발할 때까지 신호 유지") | `src/practice/townActors.ts` | 보행자 신호 초록 → 깜빡임 조건에 "건너기 전(`waiting`)인 보행자가 없음"을 더함. 아이 차가 살짝 움직여 보행자가 아직 출발하지 못했으면 깜빡이지 않아, 멈춰 기다리면 보행자가 결국 건너고 그 뒤 차 신호 초록. signal-wait에도 같은 규칙(바르게 멈춰 있으면 보행자가 180틱에 출발, 깜빡임 420틱이라 신호 바뀌는 때는 그대로) |
| FAIL 1 | `data-model.md` 4.12 | 깜빡임 문장에 "아직 건너기 시작하지 않은 보행자가 있으면 미룸" 추가 |
| FAIL 2 (T054 회전 전 멈춤, Q1 "돌기 전~횡단보도 앞 다 인정") | `src/content/scenarios.ts` | turning-car `stopZone.fromS` = 40(차체 앞 끝 40 m, 회전 시작 47 m·모퉁이 z 42 직전). 정지선(횡단보도 앞 가장자리 61.832)은 그대로라 횡단보도 위반 2종 판정은 바뀌지 않음. stopZone 크기는 데이터 값("3~5세 기준 넉넉하게", data-model.md:171) |
| FAIL 3 (T054 직진, Q2 "길을 이어 늘 안내로 처리") | `src/content/town.ts` | `turn-road`를 z 80까지 이어 네거리로, 북쪽 보도를 서쪽(x 76~112)·동쪽(x 124~140)으로 나누고 북쪽 길 양쪽 보도(`turn-sidewalk-north-left`·`-right`, z 62~80) 추가. 북서쪽 모퉁이(x 112~116, z 58~62)는 비움 — 교차로 안에서 오른쪽으로 쏠려 직진한 차가 보도(z 58)보다 leftPath(경로에서 6 m)에 먼저 닿게. `AreaId` 3개 추가 |
| FAIL 2·3 | `data-model.md` Open Issues 1 | turning-car 정지 구역(회전 전부터)·네거리(직진은 방향 안내 → 구간 다시) 한 문장 |
| 재현 고정 | `tests/unit/scenario.test.ts` | "B7 검증 지적 재현" 3건: ① crossing-check 37 m에서 멈춘 뒤 90틱마다 액셀 3틱 × 5번 → 기다리면 위반 없이 done ② turning-car 회전 전(앞 끝 44 m)에 멈춰도 closer 없이 done ③ x 117.05·117.3·118·119(z 0)와 교차로 안 오른쪽 쏠림(116.6, 44)에서 액셀만 → 위반 없이 way + leftPath. `correctFor`에 멈출 위치 `stopAt` 인자 추가 |
| 재현 고정 | `tests/unit/townActors.test.ts` | 깜빡임 시험에 "건너기 전 보행자가 있으면 GO_AT에도 초록" 한 줄 |

- 판단 메모 3(“회전 전”을 “회전 방향 횡단보도에 들어가기 전”으로 읽음)은 이번 결정으로 대체: 회전 전부터 횡단보도 앞까지 어디서 멈춰도 인정.
- 먼저 쓴 재현 시험 4건이 고치기 전 코드에서 실패함을 확인(crossing-check done 안 됨, turning-car 44 m 정지 done 안 됨, 직진 enteredSidewalk, 깜빡임 시험 flashing).

#### 탐색 시험·변이 시험 (저장소 밖 복사본 `<세션 scratchpad>/fix/`, B7 validator 탐색 파일 `zz_probe*.test.ts` 재사용)

| # | 내용 | 결과 |
|---|---|---|
| H | crossing-check 37.06 m 멈춤 → 살짝 앞으로 5번 → 무입력 36,000틱 | 보행자가 살피기 마친 뒤 건넘, 단계 3(go), 차 초록·보행자 빨강, 초록에 출발하면 위반 없음 |
| A2 | 정지 위치 33·35·36·37·38.5 m × 움직이는 간격 60·100·150·200틱 | 20가지 모두 보행자 건넘, 단계 1(pedestriansClear)에 막힌 경우 0 |
| F | turning-car 앞 끝 40·44·46·50·53 m 목표로 멈춤 | 모두 wait → 보행자 시점 안내 → go까지 진행(40.00 m 경계는 처음 멈춤이 39.99라 closer 1번 뒤 진행) |
| B | turning-car 시작 x별 직진 | x 116.8은 출발 자리부터 차체가 오른쪽 보도에 걸려 enteredSidewalk(차선 밖), x 117~120 모두 way → leftPath, 122는 leftPath |
| I | 조향 20틱마다 ±0.03 흔들며 직진 400회 | leftPath 357, enteredSidewalk 43(이전 146). 남은 43회는 모두 교차로 전 직선 접근로(z 24.7~41.8)에서 흔들려 오른쪽 보도로 올라간 경우 — 회전과 무관한 진짜 보도 진입. 북서쪽 모퉁이를 비우기 전에는 교차로 안 쏠림 32회가 z 57에서 보도에 닿았음 |
| C | 두 상황 각 400회 × 6,000틱 무작위·반쯤 올바른 주행 | 예외 0, 차체와 보행자 최소 1.566 m(건너는 중 2.017 m), 완료 crossing-check 69·turning-car 84 |
| D·G | B6 엔진과 지금 엔진, 같은 입력 | 차이 0(엔진 `scenario.ts`는 이번에 안 바뀜) |
| E | turning-car 앞보기 2.5~6 m × 정지 위치 × 최고 속도 | 45가지 모두 done(앞보기 8 m는 모퉁이를 크게 잘라 남쪽 보도, 이전과 같음) |

- 변이(복사본, `python3 -I mutate.py`, 작업 위치가 복사본인지 단언, 한 곳씩 바꾸고 되돌림; 대상 시험 = scenario·townActors·content): 깜빡임 조건 되돌림 → 잡힘(2건 실패), 정지 구역 되돌림 → 잡힘, 북쪽 보도 하나로 되돌림 → 잡힘, 북서쪽 모퉁이 채움 → 잡힘. `turn-road` z 58 되돌림만 생존 — 도로 구역은 판정에 쓰이지 않고(보도·건물·횡단보도만) 그림용이라 시험으로 잡을 수 없음.

#### 자체 검증 (attempt 2)

| 명령 | 종료 코드 | 결과 |
|---|---|---|
| `npm run typecheck` | 0 | 오류 없음 |
| `npm test` | 0 | 14 files, 129 passed |
| `npm run build` | 0 | 성공(500 kB 청크 경고 기존과 같음) |
| `npm run test:e2e` | 0 | 22 passed |
