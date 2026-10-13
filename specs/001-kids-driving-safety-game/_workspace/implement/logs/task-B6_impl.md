# Task B6 Implementation Log

- 작성: 2026-10-12, 구현자 = 조율자 Claude Code(Opus 5.5) 세션(순차 구현)
- 범위: tasks.md Phase 4 US2 T048~T052(안전 상황 운전 단계, 잘못된 행동, 경로 문제, 보행자 시점 안내 연결, ActorPlan 문서 맞춤) + B5 reviewer 비필수 제안 1·2·3·5
- 시작 상태: B1~B5 완료(T001~T047 체크), B5 완료 revision `f63003df…3e5a`
- 판정 엔진(T048~T051)은 B5 검토 중에 저장소 밖 복사본에서 테스트와 함께 먼저 쓰고, 변이 시험까지 마친 뒤 옮김

## 변경 파일

| 태스크 | 파일 | 내용 |
|---|---|---|
| T048~T051 | `src/practice/scenario.ts` | `startScenario`, `stepScenario`(phase별: driving / explaining / pedestrianView / done). `ScenarioAttempt`에 `stoppedTicks`·`stoppedOnce`·`blockedTicks` 추가. 자리값 `WAY_OFFSET` 2.5 m·`LEAVE_OFFSET` 6 m·`LEAVE_BACK` 2 m(내보내지 않음) |
| T048~T051 | `tests/unit/scenario.test.ts`(신설) | 17건: 운전 단계 5(T048), 잘못된 행동 4(T049), 경로 문제 4(T050), 안내 연결 4(T051) |
| T049 | `src/sim/collision.ts` | 내부 함수 `overlaps`를 내보냄(보도 진입 판정에 재사용) |
| T052 | `data-model.md` | ActorPlan `pedestrianSignal`·"형식 확정", SegmentDef `plan` 행, Open Issues 1 해결·2 상수, ScenarioAttempt 새 필드 3개, PedestrianViewState `card`·`cardTicks` 값, TownPedestrian `ticks`, 4.12 신호·보행자 조건, 6.4 상수 표, ViolationKind 표 `ranRed`·`earlyStart`·`overStopLine` 판정 문구(사용자 결정) |
| T052 | `contracts/modules.md` | 4.2 시그니처 "잠정" → 확정(T043), `stoppedTicks` 약속 행, 3.2 `overlaps`(신규), 12장 townActors 상수 4개(B5 제안 3) |
| T052 | `src/content/scenarios.ts` | ActorPlan 주석 "잠정" → "형식 확정(T043)" |
| B5 제안 2 | `src/practice/townActors.ts` | 동작 그대로: 신호 값 변수 `carLight`·`walkLight`·`nextCar`·`nextWalk`(보행자 변수·`walk` 함수와 이름 겹침 해소), `!` 단언 대신 `?? s.light`, 계산 순서가 동시 초록을 막는다는 주석 |
| B5 제안 1·5 | `tests/unit/townActors.test.ts`, `tests/unit/collision.test.ts` | 리뷰어 제안 다섯 곳 고정(M8 playerStopped는 멈추기 전 준비 안 함, M6 빨강 지점, M5 정지 구역 앞에서 멈춰도 빨강, M1 진행 신호 전 차 초록 아님, C2 둘째 건물도 막힘), `60` → `TICK_HZ` |

## 구현 판단 메모(검토 요청)

1. **정지선 판정(사용자 결정 2026-10-12, "상황에 따라 나눔")**: data-model.md의 `overStopLine` "정지선을 넘은 채 speed === 0"은 modules.md 4.4 "차체가 정지선 안으로 실제로 들어가는 틱이 없음"과 함께 성립하지 않아 사용자에게 물음. 후보 위치에서 앞쪽 두 모서리가 정지선을 넘으려는 틱에, `go` 전 단계면: `wait` 단계 → `earlyStart`, `stop` 단계 ∧ 차 신호 노랑/빨강 ∧ `!stoppedOnce` → `ranRed`, 그 밖 → `overStopLine`. 구간 `violations`에 있는 것 중 ViolationKind 표 순서 위쪽 하나(earlyStart·ranRed가 목록에 없으면 overStopLine으로 내려감). data-model.md 표 문구를 이 기준으로 고침.
2. **`ScenarioAttempt` 새 필드 3개**: `stoppedTicks`(townActors 입력, stop 단계를 마친 틱에 1, 그 뒤 운전 틱마다 +1, 구간 시도 안에서 줄지 않음 — B5 메모 5·validator 지적), `stoppedOnce`(ranRed "한 번도 멈추지 않고", 움직이다 멈춘 틱에 참, 시작 정지는 제외), `blockedTicks`(blocked). data-model.md 2.2에 반영.
3. **단계 판정**: stop = `speed 0 ∧ frontS ∈ stopZone`, wait = `speed 0 ∧ 조건`(vehicleGreen = 구간 차 신호 초록, pedestriansClear = 모든 등장 보행자 `crossed`), go = `frontS ≥ 경로 길이`. 지금 단계만 봄(다음 단계 조건이 먼저 맞아도 넘어가지 않음, FR-032). `frontS`는 차체 앞 끝 가운데를 경로 꺾은선에 투영한 거리(첫 선분 앞은 음수로 늘여 셈).
4. **경로 문제(T050)**: 경로에서 벗어난 거리는 차체 중심 기준(앞 끝 기준이면 건물에 닿기 전에 leftPath가 먼저 나옴). `stoppedTooFar` = stop 단계에서 움직이다 멈춘 틱에 `frontS < stopZone.fromS` → `hint closer`, `wrongWay` = 벗어난 거리가 `WAY_OFFSET`을 넘는 틱에 `hint way` 1번, `leftPath` = 벗어난 거리 > `LEAVE_OFFSET` ∨ `frontS < −LEAVE_BACK`, `blocked` = 건물에 닿고(`blockByAreas` hit) 경로 진행 없는 틱이 `IDLE_HINT_TICKS`번 이어짐. 둘 다 `redirect` 뒤 구간 처음(`failStreak` 그대로).
5. **redirect 뒤 hint 없음**: events.md 7.1-5 "redirect(구간 다시 놓고 여기서 끝)" 그대로. 그래서 HUD에는 직전 cue가 남을 수 있음(예: go 단계에서 후진 이탈 → stop 단계로 돌아갔는데 그림은 go). 다음 무입력 재안내(`IDLE_HINT_TICKS`) 때 맞는 cue가 나옴. flow 연결(T060) 때 redirect 반응에서 첫 단계 그림을 보일지 검토 필요 — 계약 변경이 필요하면 질문.
6. **explaining**: 위반 틱에 차는 `gearTap` 처리 뒤 이전 자리 `speed 0`, 그 틱의 신호·보행자 진행은 남김(7.1 순서 3 → 4). `EXPLAIN_TICKS`를 채운 틱에 `segmentReset` → `failStreak ≥ DEMO_AFTER_FAILS`면 `demoReplay`(첫 단계 cue) → `hint`(첫 단계). "닿은 틱"을 `≥`로 읽어 그 뒤 실패에도 계속 시범(US2-8 "연속 실패가 반복되면").
7. **보행자 시점 안내(T051)**: `(segment, afterStep)` 단계를 마친 틱에 `!viewDone`이면 `pedestrianViewStart`(speed 0, gear 유지), 다음 단계 hint는 안내가 끝난 틱에 냄. 안내 중 신호·보행자·`stoppedTicks`는 멈춤(7.1에 안내 중 진행 없음). `ended` 틱에 `viewDone = true` 뒤 남은 단계 hint 또는 `scenarioCompleted`.
8. **`afterStep` 뜻**: 0부터 센 단계 번호로 읽음(data-model.md "예: 정지·대기 뒤, 출발 전"과 자리표시 데이터 `afterStep: 1` = wait를 마친 뒤).
9. **변이 시험(저장소 밖 복사본만)**: scenario 9건(ranRed의 stoppedOnce, go 단계 정지선 판정, stoppedTicks 증가, 정지 구역, 안내 다시 보임, 위반 때 후보 버림, 보도 판정, 재안내 repeat, 안내 중 후진 탭) 모두 잡힘. B5 리뷰어 생존 변이 5건(M8·M6·M5·M1·C2)도 새 시험으로 모두 잡힘.

## 자체 검증 결과

| 태스크 | 명령 | 종료 코드 | 결과 |
|---|---|---|---|
| T048~T051 | `npm test -- tests/unit/scenario.test.ts` | 0 | 17 passed |
| B5 제안 | `npm test -- tests/unit/townActors.test.ts tests/unit/collision.test.ts` | 0 | 11 passed |
| T052 | `grep -n "잠정" data-model.md contracts/modules.md` | 0 | ActorPlan 블록·Open Issues 1·modules.md 4.2에서 사라짐. 남은 2곳은 바퀴 수 "2(잠정)"(정상) |
| 전체 | `npm run typecheck` / `npm test` / `npm run build` | 0 / 0 / 0 | — / 14 files 121 passed / 성공(500 kB 청크 경고 기존과 같음) |
| 전체 | `npm run test:e2e` | 0 | 22 passed |

## 피드백 반영 이력
