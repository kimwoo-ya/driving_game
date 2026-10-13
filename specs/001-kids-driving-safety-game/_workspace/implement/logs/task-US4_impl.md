# Task US4 Implementation Log (레이싱 경기 T068~T078 + 미검토 4건 함께)

- 작성: 2026-10-13, 구현자 = 조율자 Claude Code(Opus 5.5) 세션. 레이싱 그림 9장은 같은 세션의 보조 에이전트가 저장소 밖에서 그리고 리더가 검사 후 복사
- 범위: T068 진행도·순위, T069 트랙 벽·차끼리, T070 컴퓨터 차량, T071~T073 경기 진행·끼임·접촉·완주 결과, T074 트랙 그리기, T075 레이싱 HUD, T076 결과 화면, T077 flow 연결, T078 E2E. 넘겨받은 것: US3 reviewer 제안 3(조작 익히기 먼저 분기 하나로)·9 ①③, US3 validator 참고 2(저장 불가 안내 시점 문구)
- 함께 검토받는 미검토 4건(앞 세션 구현, 00_context 승인 기록 2026-10-13): T124 키보드 조작, 보행자 시점 안내 신호 수정(태스크 번호 없음), T102 규칙 그림 38장, T125 화면 방향·전체화면
- 검증 방식: 사용자 결정(검증 방식 재조정) — 덩어리 끝에 validator 1번 + reviewer 1번, 스펙 대조 + 테스트 실행. Codex 한도 해제(2026-10-19) 전이라 Claude 서브에이전트

## 변경 파일 (US4)

| 태스크 | 파일 | 내용 |
|---|---|---|
| T068 | `src/race/progress.ts`(신설) | `STUCK_TICKS` 300(자리값), `Slot`, `RaceCar`, `progressValue`(투영을 마지막 통과 체크포인트 → 다음 체크포인트 구간으로 제한), `rankCars`(완주 tick → overshoot → 진행도 → 플레이어 → slot). race.ts 내부용 `crossedNext`(다음 차례 체크포인트만, 정방향, 트랙 폭 안), `respawnPose`(후보 4곳 중심·좌·우·직선 뒤) |
| T068 | `tests/unit/progress.test.ts`(신설) | 진행도 식 2건, 순위·동점 2건 |
| T069 | `src/sim/collision.ts` | 중심선 계산 `trackLength`·`pointOnTrack`·`projectOnTrack`(벽·진행도·컴퓨터 차량·트랙 그리기 공용, 트랙별 선분 캐시), `blockByTrackWalls`(벽 앞으로 당기고 속도는 벽을 따르는 성분만, heading 그대로), `separateCars`(반씩 떼기, 같은 자리면 +X) |
| T069 | `tests/unit/collision.test.ts` | 벽 2건, 차끼리 2건 |
| T070 | `src/race/ai.ts`(신설) | `aiInput`: 8 m 앞 주행선 점으로 핸들, 목표 속도 아래에서만 액셀, `raceTicks < reactionTicks`면 액셀 없음, 앞 8 m 안 차가 주행선을 막으면 세 주행선 중 가장 먼 쪽 |
| T070 | `tests/unit/ai.test.ts`(신설) | 4건(세 필드만·순서 무관, 반응 지연·목표 속도, 주행선 따라가기, 막히면 비키기) |
| T071~T073 | `src/race/race.ts` | `COUNTDOWN_TICKS` 180·`CONTACT_SLOW_TICKS` 30(자리값), `RaceState`·`RaceEvent`·`FinishResult`, `createRace`, `stepRace`(events.md 7.2 순서), `finishResult`. `trackConfigKey`·`formatRecord`는 그대로 |
| T071~T073 | `tests/unit/race.test.ts` | 기본 7건(생성, 카운트다운, 출발 순간 액셀, 재도전, 차종 무관, 체크포인트 차례, 완주), 끼임·접촉·부정 완주 6건(SC-014 끼임 10회, SC-013 후진 왕복 20·역주행 1바퀴·가로지르기, SC-012 108,600틱, 접촉 감속, 복귀 후보, 곡선 체크포인트 — `vi.doMock`으로 꼭짓점 체크포인트 트랙), `finishResult` 5건 |
| T074 | `src/render/trackView.ts`(신설) | `renderTrack`: 모래 바닥, 남색 노면(바깥 고리 − 안쪽 고리), 빨강·흰 줄무늬 벽, 체크무늬 결승선과 문, 4대, 아이 차 탑승객 + 바닥 노란 고리, 아이 차를 따라가는 카메라. `racePassenger()`(E2E 관찰) |
| T075 | `src/ui/hud.ts` | `showRaceHud`, `showRaceRank`(n/4), `showRaceLap`(min(lapsDone+1, laps)/laps), `showRaceTime`(formatRecord, 바뀔 때만), `showCountdown`(큰 숫자), `showGo`(출발 그림) |
| T076 | `src/ui/screens.ts` | `showRaceResult`: 완주 칭찬 그림, 순위 n/4·완주 시간·최고 기록(새 기록이면 다른 그림 + `data-new-best` 강조), 다시 달리기·시작 화면으로. US3 제안 9③: `showPick`의 다음 버튼을 `button()` 도우미로 |
| T075·T076 | `src/style.css` | 레이싱 HUD 칸, 카운트다운, 결과 카드 |
| T074~T076 | `src/assets/images/ui/` 9장(신설) | `race-rank`·`race-lap`·`race-time`·`race-go`·`race-best`·`race-new-best`·`race-finish`·`race-retry`·`home`. 글자·스크립트·외부 참조 0(검사함), 합계 약 11 KB |
| T077 | `src/app/flow.ts` | `enterRace`(입력 해제, `createRace`, HUD), 틱마다 `stepRace`(후진 탭은 running에서 "먼저 멈춰요" 판정), `handleRace`(events.md 5장: go 때 입력 해제 없음, 플레이어 respawned → `releaseAll`, playerFinished → `loadSave` → `finishResult` → `race.result`·`run.best` → 새 기록이면 `commitSave(…, 'best', …)`, 읽기·저장 실패 안내 실행당 1회 → `raceResult`), 재도전·시작 화면으로, `__e2e.raceTicks`·`playerRank`, 레이싱 화면 탑승객. US3 제안 3: `begin(id)` 하나로, 제안 9①: `&&` 버튼 처리 세 개를 `if` 모양으로 |
| T078 | `tests/e2e/race.spec.ts`(신설) | ① 차량 5종 각각 레이싱 진입·순위 1~4·탑승객·HUD 3칸 ② `page.clock`으로 카운트다운 중 raceTicks 0 → 출발 뒤 증가 |
| 문서 | `contracts/modules.md` | 3.2 중심선 계산 함수·벽 규칙, 6.1 자리값·접촉 감속, 6.2 내부 함수·`Slot`, 6.3 주행·막힘·`reactionTicks` 해석, 9장 `racePassenger`·트랙 그리기, 12장 `Slot` |
| 문서 | `data-model.md` 4.11, `contracts/storage.md` 4장 | 저장 불가 안내 = 시작 화면이 처음 나올 때(US3 validator 참고 2, 코드와 맞춤) |
| 기록 | `records/play-check.md`, `records/img/t078-race.png` | 레이싱 화면·결과·재도전 확인 |

## 판단 메모(검토 요청)

1. **`reactionTicks`**: data-model "앞 상황에 반응하는 지연(틱)". `aiInput(car, cars, raceTicks)`는 상태가 없어 "막힘이 시작된 뒤 몇 틱"을 셀 수 없으므로 "출발 신호 뒤 액셀까지의 지연"으로 씀(modules.md 6.3에 적음). 막힘에는 바로 비킴.
2. **접촉 감속**: `contactSlow` 동안 그 차의 액셀 입력만 무시(자연 감속). `stepVehicle`·`DRIVING_SPEC`은 그대로라 FR-054와 맞음. 완주한 컴퓨터 차는 계속 달리되 상태는 `finished` 그대로(복귀·감속 대상 아님).
3. **트랙 벽**: `blockByAreas`처럼 이전 자리로 되돌려 멈추면 벽을 스치기만 해도 서므로, 벽 앞으로 당기고 벽 방향 속도 성분만 남김(정면이면 멈춤 → 끼임 복귀 대상). 계약 시그니처의 `prev`는 쓰지 않음(`_prev`).
4. **완주 때 `lapsDone`**: 마지막 결승선 통과에서도 `lapsDone + 1`(= laps). HUD 바퀴는 `min(lapsDone + 1, laps)`라 그대로.
5. **아이 차 구별(FR-053)**: 차 위에 띄운 원뿔은 뒤따르는 카메라에서 앞차 위에 있는 것처럼 보여(점검 사진) 바닥 고리로 바꿈. 크기는 `DRIVING_SPEC.bodyLength` 기준.
6. **카운트다운 숫자·순위·시간은 숫자 글자**: 그림 규칙(글자 없는 UI)은 이름표 글자를 막는 것으로 보고, 스펙이 요구한 숫자(순위 n/4, 바퀴, 시간, 카운트다운 큰 숫자)는 숫자로 둠. 각 칸 옆에 그림.
7. **결과 화면**: 순위·시간·최고 기록 세 칸(최고 기록은 `best`가 null이면 칸 없음 — `MAX_RECORD_CS` 초과 완주에서만 생김). 칭찬은 순위와 상관없이 같은 그림(FR-063).
8. 시험에서만 쓰는 상태 조작: `race.test.ts`의 `withCar`·`parkAi`(컴퓨터 차를 세워 두고 복귀하지 않게 `stuckTicks: -Infinity`), 역주행 시험은 매 틱 방향만 맞추고 `stuckTicks` 0(끼임 복귀를 빼고 체크포인트 규칙만 봄).
9. 하지 않은 것(태스크 범위 밖): 소리(T081), 일시정지·나가기(T084~T086), 트랙·주행·상수 조정(T115·T118), 결과 화면의 다음 경기 진입 연타 시험.

## 실행한 테스트 (저장소, 2026-10-13)

| 명령 | 종료 코드 | 결과 |
|---|---|---|
| `npx vitest run tests/unit/progress.test.ts`(구현 전) | 1 | 모듈 없음으로 실패 확인 → 구현 뒤 4 passed |
| `npx vitest run tests/unit/collision.test.ts`(구현 전) | 1 | 4 failed / 3 passed → 구현 뒤 7 passed |
| `npx vitest run tests/unit/race.test.ts`(구현 전) | 1 | 18 failed / 6 passed → 구현 뒤 24 passed |
| `npm run typecheck` | 0 | |
| `npm test` | 0 | 16 files, 162 passed |
| `npm run build` | 0 | 500 kB 경고는 기존 |
| `npm run test:e2e -- tests/e2e/race.spec.ts` | 0 | 4 passed(두 엔진) |
| `npm run test:e2e` | 0 | 51 passed, 1 skipped(WebKit 전체화면, 의도) |

## attempt 2 (US4 리뷰 "지금 확인 권장" 3건, 사용자 결정 "3건 고친 뒤 커밋·배포")

| 제안 | 파일 | 내용 |
|---|---|---|
| 1 키보드 조합 키 | `src/input/controls.ts` keydown | `e.ctrlKey \|\| e.metaKey \|\| e.altKey`면 그냥 둠(브라우저 단축키, preventDefault·입력 없음) |
| 1 시험 | `tests/e2e/touch.spec.ts` 첫 키보드 시험 끝 | Meta·Control·Alt 각각 + KeyA → 왼쪽 버튼 눌림 없음. 고치기 전 실행에서 `Meta`로 실패 확인(RED) → 고친 뒤 통과 |
| 2 미사용 import | `tests/unit/ai.test.ts` | `TRACK` import 삭제 |
| 3 키 무시 시험 | `tests/e2e/touch.spec.ts` 두 번째 키보드 시험 | 시작 화면에서 `ArrowUp`을 누른 채 액셀 버튼에 `data-pressed` 없음 확인(가드 제거 변이를 잡는 형태, 리뷰어가 복사본에서 확인) |

| 명령 | 종료 코드 | 결과 |
|---|---|---|
| `npm run test:e2e -- tests/e2e/touch.spec.ts -g "키보드" --project chromium`(고치기 전) | 1 | 1 failed(`Meta` — 눌림 생김), 1 passed |
| `npm run test:e2e -- tests/e2e/touch.spec.ts -g "키보드"` | 0 | 4 passed(두 엔진) |
| `npm run typecheck` | 0 | |
| `npm test` | 0 | 162 passed |
| `npm run build` | 0 | |
| `npm run test:e2e` | 0 | 51 passed, 1 skipped(의도) |
| `npx tsc --noEmit --noUnusedLocals --noUnusedParameters` | 2 | 이번 변경 0건. 남은 1건 `tests/unit/content.test.ts:260` `s`는 이전부터 있던 것(이번 범위 밖) |
