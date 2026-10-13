# Task US4 Validation Report (레이싱 경기 T068~T078 + 미검토 4건: T124·보행자 시점 신호 수정·T102·T125 + 넘겨받은 반영분)

# 시도 2 (최신)

## 판정: PASS
## 시도: 2/2

### 재확인(revision `13d3e093f3ff1beac71921bc7fa43d26e9d4fdc08eaeb20d1b9bce25751f2049`) — 판정 PASS 유지

- revision 요청값 / 읽기 전 / 확인 뒤: `13d3e093…2049` / 같음 / 같음(`review-snapshot.py` 종료 0). `git status --short` 46줄로 시도 2와 같음
- 바뀐 것은 `contracts/modules.md:59`(`mountControls` 키보드 설명) 한 구절뿐임을 확인: 시도 2 확인 시각(18:58:06) 뒤에 바뀐 파일을 `src`·`tests`·`specs`(`_workspace` 제외)·설정 파일에서 찾으면 `contracts/modules.md` 하나뿐. 코드가 같다는 근거: 시도 1 복사본(`scratchpad/validator-us4/copy/`)과 `diff -r` 하면 다른 파일은 시도 2와 같은 세 파일(`controls.ts`·`touch.spec.ts`·`ai.test.ts`)이고 바뀐 줄 수도 시도 2 때 본 변경과 같은 18줄, 세 파일의 수정 시각(18:55~18:56)도 시도 2 확인 전 그대로
- 새 구절이 코드와 맞음: "`layer.hidden`이거나 Ctrl·Cmd·Alt와 함께 누른 키면 `keydown`을 무시(브라우저 단축키로 둠)" = `src/input/controls.ts:112`의 가드(그 경우 `preventDefault`도 하지 않음), "`e.repeat`인 `keydown`은 새로 누름으로 보지 않음" = `:114`. 시도 2 참고 1(커밋 전 계약 한 줄) 해결
- 테스트: 코드·시험이 시도 2 revision과 같아 다시 돌리지 않음(시도 2 결과 그대로: typecheck·`npm test` 162·build·E2E 51 passed 1 skipped, 모두 종료 0)

- revision 요청값 / 읽기 전 / 테스트 후: `49ba8f1c3e498fa38e48b362c97ce08206eeffc6ba15545508e3739fab1e9715` / 같음 / 같음 (PROJECT_ROOT에서 `review-snapshot.py` 재계산, 두 번 모두 종료 0). 테스트 뒤 `git status --short` 46줄로 읽기 전과 같음, 4173·4174 포트에 남은 서버 없음
- 읽은 프로젝트 지침·기술 기준: 시도 1과 같음(`AGENTS.md` 먼저, IVI Java/Spring 기준 제외, TypeScript·three.js·Vite·npm 기준). 추가로 `task-US4_impl.md` "attempt 2" 절, `task-US4_review.md` "지금 확인 권장" 1~3, `00_context.md` 승인 기록 맨 아래(사용자 결정 "3건 고친 뒤 커밋·배포")를 읽음
- 바뀐 범위 확인: 시도 1 revision 때 저장소 밖에 떠 둔 복사본(`scratchpad/validator-us4/copy/`)과 `src/`·`tests/`·설정 파일을 `diff -r`로 비교 → 다른 파일은 `src/input/controls.ts`, `tests/e2e/touch.spec.ts`, `tests/unit/ai.test.ts` 셋뿐(요청 내용과 같음). 명세 쪽은 `tasks.md` 체크 표시뿐이고, plan.md·events.md는 HEAD와 같음. 바뀐 세 파일은 새로 읽음
- 테스트 명령: `npm run typecheck`, `npm test`, `npm run build`, `npm run test:e2e`(전체)

| 항목 | 값 |
|---|---|
| run / task / dispatch / 실제 도구 / 세션 handle | Orca 없음 — 시도 1과 같은 사용자 결정으로, 같은 Claude Code 서브에이전트 `spec-implement-validator`(Opus 5.5) 세션이 이어서 재검증 |
| FEATURE_DIR / 단계 / 검토 태스크 | `/Users/kyw/Documents/git/mine/driving_game/specs/001-kids-driving-safety-game` / implement / 시도 1 범위 전체(T068~T078·T124·신호 수정·T102·T125·넘겨받은 반영분). 이번에 바뀐 것은 T124 키보드 처리와 시험 |
| 검증 상태 | COMPLETE |
| 역할 판정 | PASS (FAIL 0, 차단하는 질문 0, 커밋 전 문서 한 줄 권장 1건) |

### 실행한 테스트(시도 2)

| 명령 | 종료 코드 | 결과 |
|---|---|---|
| `npm run typecheck` | 0 | 오류 없음(`TRACK` import를 지운 `ai.test.ts` 포함) |
| `npm test` | 0 | 16 files, 162 passed |
| `npm run build` | 0 | 성공(500 kB 청크 경고는 기존과 같음) |
| `npm run test:e2e` | 0 | 51 passed, 1 skipped(WebKit 전체화면, 의도). 키보드 시험 2건 × 두 엔진 통과(`touch.spec.ts:108`, `:150`) |

변이(일부러 오류 넣기)는 다시 하지 않음: 새 시험 두 곳이 가드를 지우면 실패한다는 것은 구현 기록(조합 키 가드 없이 `Meta`에서 실패 확인)과 리뷰어 복사본 확인에 있고, 코드가 한 줄이라 의심할 곳이 없음.

### 바뀐 것 판정

| 바뀐 것 | 판정 | 근거 |
|---|---|---|
| 1 조합 키는 브라우저 단축키로 둠(`src/input/controls.ts:112`) | PASS | **FR-098**은 ←/A·→/D·↑/W·↓/S·R 키 하나를 누르는 것을 정하고 Ctrl·Cmd·Alt 조합은 정하지 않음 → 조합을 운전 입력으로 받지 않아도 어긋나지 않음. Shift는 빼지 않아 Shift를 누른 채여도 운전 입력(텍스트 선택 등 기본 동작은 계속 막힘, FR-020). **FR-016·017(누른 상태가 남지 않음)**: `keyup`(`:118-123`)은 조합 키 검사를 하지 않으므로, 키를 먼저 누르고 Ctrl 등을 더 눌렀다 떼도 그 키를 떼면 풀림. 조합과 함께 들어온 keydown은 키 집합에 넣지 않으니 남을 것이 없음. 조합 키만 먼저 떼고 글자 키를 계속 누르고 있으면 이어지는 keydown은 `e.repeat`라 무시 → 뗐다가 새로 눌러야 반영(FR-017과 같음). 시도 1 때 있던 "Cmd+A를 받아 왼쪽을 넣었는데 macOS가 keyup을 안 보내 왼쪽이 남는" 경로는 이번 변경으로 없어짐 → FR-017 쪽으로는 나아짐 |
| 기존 키보드 동작 유지 | PASS | 키 표(`:44-54`), `layer.hidden` 가드, `preventDefault`, `e.repeat` 무시, R = `onTap('reverse')`, keyup 해제, `readDriveInput`이 터치 점 + 키 합치기(`:126-128`), `releaseAll`이 키도 비움(`:133`) — 모두 시도 1과 같은 줄(복사본과 diff 결과 바뀐 줄은 `:112`와 주석뿐). modules.md 2장의 키 대응·hidden·repeat·releaseAll 문장 그대로 성립. 시험: 키 8개 눌림·동시 입력·blur 뒤 반복 무시(`touch.spec.ts:108-148`) + 조합 3종 무시(`:140-147`, 반복문 `:141`), 조작 버튼 없는 시작 화면에서 R·↑ 무시를 누른 채 `data-pressed` 없음으로 확인(`:156-159`, 누름 `:157`) + 연습 화면 R 앞뒤 바꾸기 — 두 엔진 통과 |
| 2 `tests/unit/ai.test.ts` 미사용 import 삭제 | PASS | 시험 4건 그대로 통과, typecheck 0 |
| 3 시험 강화(`touch.spec.ts` 두 곳) | PASS | 위 "기존 키보드 동작 유지" 행 |

### 이전 지적 처리 결과

| 시도 1 참고 | 처리 |
|---|---|
| 8 키보드 조합 키(리뷰 "지금 확인 권장" 1) | 해결. 위 판정 |
| 1·2 data-model 문서 한 줄(`afterStep`, `AiProfile`) | 이번 범위 밖이라 그대로 남음 — 다음에 문서를 만질 때 |
| 3 멈춰 있기만 해도 5초마다 되돌려짐 | 그대로(T118 때 사용자 확인 권장, 선택지는 시도 1 참고 3) |
| 4 T086 때 `orientation.spec.ts` 확인 바꾸기·hidden `releaseAll` | 그대로(T086) |
| 5 tasks.md T097 "4건 skipped" | 그대로 |
| 6·7 카드별 신호 모습(T101)·경기 길이(T115) | 그대로 |

### 참고(차단 아님)

1. **커밋 전 계약 한 줄 권장(`contracts/modules.md:59` `mountControls` 행)**: keydown을 무시하는 조건으로 `layer.hidden`과 `e.repeat`만 적혀 있음. 코드는 Ctrl·Cmd·Alt 조합도 무시하므로 "Ctrl·Cmd·Alt와 함께 누른 keydown은 브라우저 단축키로 두고 받지 않음" 한 구절을 더하기를 권함(사용자 결정이 "3건 고친 뒤 커밋·배포"라, 커밋 때 문서와 코드가 맞도록). 스펙 FR-098은 조합을 정하지 않아 고치지 않아도 됨. 계약에 적힌 다른 규칙은 모두 그대로 지켜져 FAIL로 보지 않음.
2. **남는 좁은 경우(운영체제 한계, 실제 기기 미확인)**: macOS에서 A를 **먼저** 누르고 그다음 Cmd를 눌러 A를 Cmd보다 먼저 떼면 A의 keyup이 오지 않아, A를 다시 누르거나 창이 포커스를 잃을 때(`blur` → `releaseAll`, Cmd+Tab 등)까지 왼쪽 눌림이 남을 수 있음. 시도 1부터 있던 것이고 이번 변경으로 생긴 것이 아님(코드 주석에도 적혀 있음). spec "지원 환경"은 데스크톱을 보장 대상으로 두지 않아 판정 대상은 아님. 막고 싶으면 Meta 키의 keyup 때 키 집합을 비우는 정도.
3. `tasks.md`의 T068~T078·T124·T125·T102 체크가 이번 revision에 이미 들어 있음 — 이번 PASS와 같은 revision의 reviewer APPROVE가 있어야 완료로 남길 수 있음(조율자 설명대로).

---

# 시도 1

## 판정: PASS
## 시도: 1/2

- revision 요청값 / 읽기 전 / 테스트 후: `d7f7100f697652bbfd4836923e127e235e54c18973b58c7e5669b85ee0a3301e` / 같음 / 같음 (PROJECT_ROOT에서 `python3 ivi-agent-guide/scripts/review-snapshot.py "$PWD" "$PWD/specs/001-kids-driving-safety-game"`, 두 번 모두 종료 0). 테스트 뒤 `git status --short` 44줄로 시작 때와 같음, 4173·4174 포트에 남은 서버 없음
- 읽은 프로젝트 지침(이 순서): `AGENTS.md` → 역할 파일 `ivi-agent-guide/claude-config/agents/spec-implement-validator.md`(AGENTS.md 치환 기준으로) → `ivi-agent-guide/orca-cross-review.md` → `docs/PRD.md`, `GLOSSARY.md`. constitution은 빈 양식(spec Clarifications "두지 않습니다", 사용자 결정) — 규칙 없음으로 보고 막지 않음
- 적용한 기술 기준: IVI Java/Spring·JPA·Lombok·REST·`mvn` 기준은 적용하지 않음. TypeScript 7 + three.js + Vite 웹게임 기준으로 data-model.md(게임 state·`RaceState`·`RaceCar`·`TrackDef`·저장 형식), contracts/(modules·events·storage·static-paths·assets·content-data)의 함수 시그니처·이벤트 순서·저장 시점과 코드를 대조
- 테스트 명령: `npm run typecheck`, `npm test`, `npm run build`, `npm run test:e2e`(전체). 탐색 확인 1건은 저장소 밖 복사본에서만(아래)
- 검증 깊이: 사용자 결정 "스펙 대조 + 테스트 실행". 일부러 오류 넣기(변이)·무작위 대량 주행은 하지 않음. 의심 1곳(컴퓨터 차량이 길을 막는 플레이어를 피해 경기를 끝내는지, FR-060)만 정해진 배치 8가지로 저장소 밖 복사본에서 한 번씩 돌려 봄

| 항목 | 값 |
|---|---|
| run / task / dispatch / 실제 도구 / 세션 handle | Orca 없음 — 사용자 결정(00_context 승인 기록 "B5 이후 검증 방식": Codex 한도 해제 2026-10-19 전까지 Claude 에이전트)으로 Claude Code 서브에이전트 `spec-implement-validator`(Opus 5.5)가 실행. Orca Dispatch·handle 없음 |
| FEATURE_DIR / 단계 / 검토 태스크 | `/Users/kyw/Documents/git/mine/driving_game/specs/001-kids-driving-safety-game` / implement / T068~T078, T124, 보행자 시점 안내 신호 수정(번호 없음), T102, T125, US3 reviewer 제안 3·9①③, US3 validator 참고 2 |
| 검증 상태 | COMPLETE |
| 역할 판정 | PASS (모든 항목 PASS, FAIL 0, 차단하는 미해결 질문 0, 문서 맞춤·다음 태스크 참고 8건) |

## 실행한 테스트

| 명령 | 종료 코드 | 결과 |
|---|---|---|
| `npm run typecheck` | 0 | 오류 없음 |
| `npm test` | 0 | 16 files, 162 passed |
| `npm run build` | 0 | 성공(500 kB 넘는 청크 경고는 기존과 같음) |
| `npm run test:e2e` | 0 | 51 passed, 1 skipped(WebKit 전체화면 시험 — 그 환경에 전체화면 기능이 없어 `test.skip`, 의도된 것) |
| 저장소 밖 복사본 `scratchpad/validator-us4/copy/tests/unit/zz-sim.test.ts`(`npx vitest run`, node_modules는 저장소 것을 심볼릭 링크) | 0 | 아래 "탐색 확인" |
| 저장소 밖 `scratchpad/validator-us4/sheet.cjs`(Playwright Chromium으로 규칙 그림 18장을 440×330으로 크게 캡처, 서버 없이 data URL) | 0 | T102 근거 |

### 탐색 확인(저장소 밖, 정해진 배치 8가지 × 1회)

| 배치 | 컴퓨터 차 3대 두 바퀴 완주(경기 시간) | 복귀 횟수(slot 0,1,2,플레이어) |
|---|---|---|
| 플레이어가 출발 칸에 계속 서 있음 | 107.0 s, 103.0 s, 118.2 s | 0,0,0,**23** |
| 플레이어를 중심선 위 arc 25·55·110·175·230·290 m에 세워 둠(6가지) | 모두 103~119 s | 0,0,0,0 |
| 플레이어가 중심선을 따라 거꾸로 달림 | 107.0 s, 103.3 s, 119.5 s | 0,0,0,0 |

→ 컴퓨터 차량은 서 있거나 거꾸로 오는 플레이어를 모두 비켜 가며 복귀 없이 완주(FR-060 "서로 막혀 영원히 멈추는 상황 없음"). 플레이어 23회는 아래 참고 3.

## 태스크별 판정

| 태스크 | 판정 | 근거(원문 ↔ 코드·시험) |
|---|---|---|
| T068 진행도·순위 | PASS | `progressValue`(`src/race/progress.ts:30-34`) = `lapsDone × L + 마지막 통과 체크포인트 arc + 그 구간으로 제한한 투영`(data-model 7장 식 그대로, `projectOnTrack(…, from, to)` 제한). `rankCars`(`progress.ts:40-49`) 완주 tick → overshoot 큰 순 → 진행도 → 플레이어 → slot(FR-057, spec Assumptions 동점). `STUCK_TICKS` 300 자리값·`Slot` 내보냄(modules 6.2·12장). `crossedNext`(`:55-63`)는 다음 차례 체크포인트만, 정방향(접선 성분 음수 → 0 이상), 통과선은 트랙 폭 안(data-model `Checkpoint`). `respawnPose`(`:69-81`) 후보 4곳 중심·좌·우(`width/3`)·직선 `5 × bodyRadius` 뒤, 방향 = 접선(data-model 7장 "복귀 자세"). 시험 `tests/unit/progress.test.ts` 4건(진행도 식 2·순위/동점 2) |
| T069 트랙 벽·차끼리 | PASS | `blockByTrackWalls`(`src/sim/collision.ts:79-86`): 중심선에서 `width/2 − bodyRadius` 넘으면 그 거리로 당기고 속도는 벽 방향 성분만, heading 그대로 → 튕김·회전 없음(FR-060, modules 3.2 "트랙 벽" 행과 같음). `separateCars`(`:89-109`) 반씩 떼기, 같은 자리면 +X, heading·speed 그대로, `touching` 표시. `trackLength`·`pointOnTrack`·`projectOnTrack`(`:25-60`)은 modules 3.2 시그니처 그대로. 시험 4건 추가(태스크는 3건 — 더 많음) |
| T070 컴퓨터 차량 | PASS | `aiInput(car, cars, raceTicks)`(`src/race/ai.ts:25-44`)은 `DriveInput` 세 필드만, 브레이크 없음, `speed < targetSpeedRatio × maxForwardSpeed`일 때만 액셀, 8 m 앞 주행선 점으로 핸들, 앞 8 m 안 차가 주행선에서 `2 × bodyRadius` 안이면 `[−w/3, 0, w/3]` 중 가장 먼 주행선(modules 6.3 문장과 같음), 무작위 없음. 같은 `stepVehicle`을 씀(`race.ts:80`) → 성능 한도 같음(FR-054). 시험 `tests/unit/ai.test.ts` 4건. 판단 메모 1은 아래 "판단 메모" |
| T071 경기 기본 | PASS | `createRace`(`src/race/race.ts:41-60`) 4대 `restingAt(grid)`, `playerSlot` 3, 컴퓨터 외형 = `VEHICLES`에서 플레이어 차를 뺀 앞 3종, 프로필은 slot 순(차종과 무관), `countdown`·`COUNTDOWN_TICKS`·`raceTicks 0`·`result null`. 카운트다운(`:65-71`) 차 정지·`gearTap` 무시, 첫 틱과 초가 바뀔 때 `countdownTick` 3·2·1, 0이 되는 틱 `go` + 첫 `rankChanged`(data-model 4.7). running(`:73-116`)은 events.md 7.2 순서(① `raceTicks + 1` ② 틱 시작 스냅숏 입력 ③ `stepVehicle` → 벽 → 차끼리 ④ slot 순 체크포인트·`lapCompleted` ⑤ 복귀 ⑥ 순위 ⑦ `playerFinished` 맨 뒤), `timeCs = Math.round(raceTicks × 100 / TICK_HZ)`, 끝난 뒤 no-op. 시험 7건(카운트다운 중 누른 액셀이 go 다음 틱부터 FR-017 단서, 재도전 = 새 상태 FR-065, 차종 바꿔도 모든 차 위치·이벤트 같음 US4-11, 체크포인트 차례·역방향·결승선) |
| T072 끼임·접촉 | PASS | 끼임(`race.ts:103-110`): 진행도가 `STUCK_TICKS` 동안 늘지 않으면 복귀, 완주한 차 제외, 컴퓨터 차도 같음, 앞 slot의 새 자리를 피함, 전진·정지(FR-019·061). 접촉(`:80`, `:86-87`): `touching`이면 `contactSlow`·`slowTicks = 30`, 그동안 액셀만 무시(modules 6.1 "접촉 감속" 행). 시험 6건: SC-014 끼임 10/10 복귀·재시작 0·순위 오르지 않음, SC-013 후진 왕복 20·역주행 1바퀴·가로지르기 3자리 바퀴 0, SC-012 108,600틱 강제 종료 0·컴퓨터 차 모두 완주 뒤 플레이어를 기다림, 접촉 감속, 후보 4곳(옆 3칸 막히면 뒤 후보), 곡선 체크포인트에서 한 대가 두 후보를 못 막음(`vi.doMock`, 막는 차 자리 247곳). 탐색 확인에서도 FR-060 만족 |
| T073 완주 결과 | PASS | `finishResult`(`race.ts:120-131`) = 기존 = 더 짧은 쪽(runBest, storedBest), `isNewBest = timeCs ≤ MAX_RECORD_CS ∧ (기존 없음 ∨ 엄격히 짧음)`, `best` 계산(data-model 7장·modules 6.1과 같음). 시험 5건(같으면 새 기록 아님, 짧은 쪽 기준, 상한 초과 제외, 5회 최솟값 SC-015, 두 탭 첫 사례 SC-019) |
| T074 트랙 그리기 | PASS | `renderTrack`(`src/render/trackView.ts:123-147`): 모래 바닥·남색 노면·빨강/흰 줄무늬 벽·체크무늬 결승선과 문 — 보행자·횡단보도·신호등 없음(FR-052, modules 9장 문장과 같음). 4대 모델, 아이 차만 탑승객 + 바닥 노란 고리(크기 `DRIVING_SPEC.bodyLength` 기준, FR-053·011), 카메라는 아이 차 추적, 상태는 읽기만. `racePassenger()`(`:150-152`) = static-paths `__e2e.passenger`. 기록 그림 `records/img/t078-race.png`에서 마을과 다른 모습·고리 확인 |
| T075 레이싱 HUD | PASS | `src/ui/hud.ts:73-111`: 위 가운데 순위 `n/4`·바퀴 `min(lapsDone + 1, laps)/laps`(data-model 7장 "바퀴 표시")·경기 시간 `formatRecord`, 카운트다운 큰 숫자, 출발 그림 `race-go.svg`(FR-055·056, T075 문구). 판단 메모 6은 아래 |
| T076 결과 화면 | PASS | `showRaceResult`(`src/ui/screens.ts:136-160`): 칭찬 그림(순위와 무관 — 마지막이어도 같은 그림, FR-063), 순위·완주 시간·최고 기록, 새 기록이면 다른 그림 + `data-new-best` 강조, 다시 달리기·시작 화면으로(FR-065). 기록 그림 r5·r6에서 새 기록 강조 있음/없음 확인 |
| T077 flow 연결 | PASS | `src/app/flow.ts`: 열린 레이싱 → `pickVehicle`(race) → `pickCharacter` → `enterRace`(`:287-295`, `releaseAll`·`createRace`·HUD) — FR-017 "경기 시작" 입력 해제. `handleRace`(`:297-308`): `go`에 `releaseAll` 없음(FR-017 단서), `rankChanged`·플레이어 `lapCompleted` → HUD, 플레이어 `respawned` → `releaseAll`. `finishRace`(`:310-318`) = events.md 5장 `playerFinished` 행 순서 그대로(`loadSave` → `ok` 거짓이면 안내 1회 → `finishResult` → `race.result`·`run.best` → 새 기록이면 `commitSave('best')` → 실패면 안내(실행당 1회 합침) → `raceResult`, 결과를 늦추지 않음). 후진 탭은 `running`에서만 "먼저 멈춰요"(`:343-344`, events.md 6장). 재도전 = `enterRace`(같은 차·인물, 새 상태), 시작 화면으로 `:163-168`. `__e2e.raceTicks`·`playerRank`(`:393-398`, 레이싱 화면 밖이면 null) |
| T078 E2E | PASS | `tests/e2e/race.spec.ts` 2건 × 두 엔진: 저장값 주입 → 차량 5종 각각 레이싱 진입·탑승객 `chicken-guy`·순위 1~4·HUD 3칸(SC-001 레이싱), `page.clock`으로 카운트다운 2.5초까지 `raceTicks` 0 → 출발 뒤 증가(FR-055). 태스크 문구 항목 모두 있음 |
| T124 키보드 조작 | PASS | `src/input/controls.ts:44-54`(키 표, `e.code`), `:109-124`(keydown/keyup): ←/A·→/D·↑/W·↓/S = 누르고 있는 버튼, R = `onTap('reverse')`, `layer.hidden`이면 keydown 무시, `e.repeat` 무시, 눌림 표시도 키를 반영(`showPressed`), `readDriveInput`이 터치 점 + 키 집합을 합쳐 `toDriveInput`(`:126-128` → 동시 입력·브레이크 우선 FR-014·015), `releaseAll`이 키도 비움(`:133`) → 누른 채 반복 입력으로는 다시 눌리지 않음(FR-017). spec FR-098·가정 문장("터치가 기본, 키보드가 있으면")·modules 2장 표와 같음. 시험 `tests/e2e/touch.spec.ts:108-166` 2건(키 8개·동시·blur 뒤 반복 무시 / R 앞뒤 바꾸기·조작 버튼 없는 시작 화면에서 무시) 두 엔진 통과 |
| 보행자 시점 안내 신호 수정 | PASS | `src/content/scenarios.ts:71-80`(신호 기다리기 `afterStep: 0`), `:162`(횡단 전 확인 `afterStep: 0`); 회전 차량은 그대로 `afterStep: 1`(`:203`, 회전 방향 보행자 신호는 초록 고정·차 신호 없음). 코드 경로로 확인한 것: 정지 단계는 `speed === 0 ∧ 정지 구역 안`(`src/practice/scenario.ts:174`)이고, 차가 멈추는 틱에는 위치가 바뀌지 않으므로(`src/sim/vehicle.ts` 속도 0 뒤 이동 0) 차 신호는 그보다 앞 틱(정지 구역 진입 `frontS ≥ fromS`)에 이미 빨강 → 보행자 신호는 늦어도 멈추는 틱에 초록(`townActors.ts:85`). 그래서 올바른 운전뿐 아니라 **어떤 운전으로 정지 단계를 마쳐도** 안내 시작 순간 보행자 초록·차 신호 빨강이고, 안내 동안 신호가 멈춰 있어 걷는 카드(A19-A20, 걷는 동작이 있는 유일한 카드 `rules.ts:50`)는 늘 보행자 초록에서만 나옴. 시험 `tests/unit/scenario.test.ts:337-346`(세 상황 모두 안내 시작 순간 보행자 초록·차 초록 아님) + 옛 시점 시험 2건 갱신. content-data.md 조건 문장, tasks T101 문구(카드별 신호 모습은 T101) 반영. 기록 그림 `view-signal-fix.png`·`t102-t125-screens.png`에서 보행자 신호 초록 확인. 문서 한 줄 어긋남은 참고 1 |
| T102 규칙 그림 38장 | PASS | `src/assets/images/rules/` 38장, `SAFETY_RULES` id 38개와 이름 같음, `<text>`·`<script>`·`href`·`<image>`·`<foreignObject>`·이벤트 속성 0(전수 검사), 합계 152 KB. `picture()`(`src/ui/screens.ts:7-9`)의 도형 대체 경로·`shape` 인자·`.shape-*` CSS 삭제(US3 reviewer 제안 5). `tests/unit/content.test.ts:226-228` #21 켬. 그림 내용(크게 다시 캡처한 18장 + 모아 보기 38장): 길을 건너는 사람은 보행자 초록일 때만(A4·A5 오른쪽 칸·A19-A20·B7), 신호 없는 B11은 차가 정지선 앞에 선 채 손 들고 차를 보며 건넘(규칙 문구 그대로), 빨강·깜빡임에는 보도에서 기다림(A5 왼쪽 칸·A7·A9·B12·B13), 손 들기는 운전자와 눈 맞추기(A14-A15)·멈춤 확인(A16-A17 돋보기·확인 표시)과 함께, 차 사이에서 뛰어나오기·차 주변 놀기·공 쫓기·차 밑에 손 넣기를 하는 모습 없음(B1은 보도에서 "차 사이 아님" 표시, B4·B3은 어른에게 알림, B2·B5·B6은 차에서 떨어져 섬, A21은 보도에 선 아이가 운전석에서 안 보이는 이유 장면) — FR-093·094·095와 승인 기록(2026-10-13 사용자 지적 "규칙 카드")의 세 조건 만족 |
| T125 화면 방향·전체화면 | PASS | `src/platform/lifecycle.ts:34-43` `enterFullscreen`(이미 전체화면이거나 못 쓰면 가로 고정만 시도, 거절은 조용히 무시)·`toggleFullscreen` — modules 11장 문장 그대로. 시작·열린 레이싱 탭에서 `enterFullscreen`(`flow.ts:141`, `:149`, 잠긴 레이싱은 들어가지 않음), 시작 화면 왼쪽 위 버튼은 `document.fullscreenEnabled`일 때만(`screens.ts:49-52`, 켜기/끄기 그림, `fullscreenchange`에 다시 그림 `flow.ts:417`) → FR-099. 세로 안내 = 돌리기 그림 + 회전 잠금 해제 글(`overlays.ts:62-69`, FR-007·012), `portrait`/`landscape` → `rotate`·`releaseAll`(`flow.ts:409-415`), 세로 동안 틱 멈춤(`flow.ts:333`) → FR-007 "세로 상태에서는 주행을 진행하지 않음". 가로 고정을 시도해도 세로 안내는 그대로(FR-007 보충). 가로 복귀 뒤 일시정지 유지는 태스크 문구대로 T086. 시험 `tests/e2e/orientation.spec.ts` 3건(WebKit 전체화면 1건 skip은 그 환경에 API가 없어서 = iPhone Safari와 같은 경우) |
| 넘겨받은 반영분 | PASS | US3 reviewer 제안 3: `begin(id)` 하나(`flow.ts:195-199`), `onCharacterNext`·`onScenarioPick`이 씀. 제안 9①: 버튼 처리 `if` 모양(`flow.ts:153-161`). 제안 9③: `showPick` 다음 버튼 `button()` 도우미(`screens.ts` showPick). US3 validator 참고 2: `data-model.md` 4.11 두 행·`contracts/storage.md` 4장 "시작 화면이 처음 나올 때"로 맞춤 — 코드 `flow.ts:385`와 같음 |

## 판단 메모(구현 기록 1·2·3·6) 판정

| 메모 | 판정 | 이유 |
|---|---|---|
| 1 `reactionTicks` = 출발 신호 반응 지연 | 원문에 맞음 | spec FR-054·PRD는 "난이도는 주행 경로와 **반응**으로 조절"까지만 정함. 계약 시그니처 `aiInput(car, cars, raceTicks)`에 상태가 없고 `RaceCar`(data-model 2.2)에도 반응 타이머 필드가 없어, "앞 상황마다 몇 틱 늦게 반응"을 담을 자리가 설계에 없음. 출발 지연은 "반응"의 한 형태이고 성능 한도는 같음. 해석을 modules 6.3에 적었으나 data-model `AiProfile` 줄은 아직 "앞 상황에 반응하는 지연" → 참고 2(문서 한 줄). 값은 T115 조정 대상이라 사용자 결정까지는 필요 없다고 판단 |
| 2 접촉 감속 = 액셀 무시 | 원문에 맞음 | FR-060 "파손·부상·튕겨 나감·뒤집힘 표현 없이 감속" — 0.5초 동안 액셀이 듣지 않아 자연 감속(최대 약 1 m/s), heading 그대로. `stepVehicle`·`DRIVING_SPEC`이 그대로라 FR-054 유지, 모든 차 같은 규칙. data-model 4.8·modules 6.1 문장과 같음. 계속 붙어 있어도 끼임 복귀가 풀어 줌(FR-060 "영원히 멈춤 없음") |
| 3 트랙 벽 미끄러짐 | 원문에 맞음 | 계약 3.2 "막히면 위치를 경계 앞에 두고 속도만 줄입니다"·"트랙 벽" 행과 같음. 정면이면 멈춤 → 끼임 복귀 대상(US4-5). 시그니처의 `prev`는 그대로 받되 쓰지 않음 — 계약 위반 아님 |
| 6 숫자 표시 | 원문에 맞음 | 원문이 숫자 값을 요구함: FR-056 순위·바퀴 진행, FR-062·063·064 완주 시간·최고 기록(data-model 7장 `formatRecord` = `m:ss.cc` 글자), T075 "순위 n/4 … 카운트다운 큰 숫자". 사용자 결정(00_context 2026-10-13 "UI 그림")은 이름표 글자·도형 자리표시를 그림으로 바꾸라는 것이고 칸마다 그림이 붙어 있음. FR-012는 "선택과 진행"을 글 없이 할 수 있으면 되는데, 출발은 그림(`race-go`), 버튼은 모두 그림이라 숫자를 못 읽어도 진행이 막히지 않음 |

## FAIL 피드백

없음.

## 미해결 질문

없음(판정을 막는 질문 없음). 참고 3은 T118 때 사용자에게 물을 만한 장면이라 선택지를 함께 적어 둠.

## 참고(차단 아님) — 문서 맞춤·이후 태스크로 넘길 것

1. **문서 한 줄(data-model.md:224 `afterStep`)**: "세 연습 모두 멈춘 직후"라고 적혀 있지만 회전 차량은 `afterStep: 1`(멈춤 → 보행자가 다 건널 때까지 기다림 → 안내, `scenarios.ts:203`). 승인 기록도 "두 연습 afterStep → 0"입니다. 안전 조건(안내 시작 순간 보행자 초록·차 신호 초록 아님)은 세 연습 모두 지켜지고 시험이 고정하므로 코드 문제는 아님. 예: "신호 기다리기·횡단 전 확인은 멈춘 직후, 회전 차량은 기다리기 뒤(보행자 신호 초록 고정)".
2. **문서 한 줄(data-model.md:255 `AiProfile`)**: `reactionTicks` 설명 "앞 상황에 반응하는 지연"을 modules.md:297과 같게 "출발 신호에 반응하는 지연(aiInput은 상태 없음)"으로 맞추기를 권함.
3. **멈춰 있기만 해도 되돌려짐(T118 레이싱 상수 때 사용자 확인 권장)**: 끼임 판정이 "진행도가 5초 동안 늘지 않음"(data-model 4.8, plan.md:234)이라, 아이가 일부러 페달에서 손을 떼고 서 있기만 해도 5초마다 마지막 체크포인트로 옮겨집니다(탐색 확인: 출발 칸에 서 있으면 118초 동안 23번). 체크포인트 간격이 약 84 m라 최대 그만큼 뒤로 갑니다. 문서대로라 FAIL은 아니고 spec FR-061 문구("끼여 한동안 진행할 수 **없으면**")보다 넓게 잡힌 상태입니다. 장면 중심 선택지(권장 먼저):
   - A (권장): 액셀을 누르는데도 앞으로 못 갈 때(벽·차에 막힘, 거꾸로 달림)만 되돌림 — 그냥 서 있으면 그 자리 그대로
   - B: 지금처럼 서 있어도 되돌리되, 기다리는 시간을 늘림(예: 10~15초)
   - C: 지금 그대로(5초)
4. **T086 때 바꿀 시험**: `tests/e2e/orientation.spec.ts:25-47`은 "가로로 돌아오면 이어짐"(틱 다시 증가)을 확인합니다. T086·T087에서 가로 복귀 뒤 일시정지 유지(SC-006 "자동 재개 0건", spec Edge "가로로 돌아와도 자동으로 재개하지 않음")를 넣으면 이 시험의 마지막 확인을 "paused 유지"로 바꿔야 합니다. 같은 T086에서 `hidden` 신호의 `releaseAll`(FR-017 "화면 숨김", 지금 `flow.ts:414`는 hidden을 뺌)도 함께.
5. **tasks.md:261 T097 검증 숫자**: #21을 켠 채 넣기로 바뀌었으니 skip은 #8·#22·#23 3건인데 검증 문구가 "4건 skipped"로 남아 있음.
6. **카드별 신호 모습(T101)**: 안내 동안 보행자 신호가 초록으로 멈춰 있어 "빨간불에는 멈춰요"(A5)·"깜빡이는 초록불에는 건너지 않아요"(A9) 카드 뒤 신호는 초록 그대로(기록 그림 view-signal-4). 건너는 장면이 빨강에 나오는 문제는 아니고, T101 문구에 이미 남아 있음.
7. **경기 길이·난이도(T115)**: 지금 자리값으로 컴퓨터 차 두 바퀴가 약 103~119초(목표 약 5분, SC-011). 목표 속도 비율이 가장 낮은 slot 1(0.75)이 가장 먼저 들어옴(주행선이 안쪽이라). 조정 때 참고.
8. **리뷰어 쪽(스펙 밖)**: 키보드 R·WASD는 조작 버튼이 보일 때 `preventDefault`하므로 PC에서 플레이 중 Cmd/Ctrl+R(새로 고침)·Ctrl+S 같은 조합도 막히고 R은 앞뒤 바꾸기로 들어갑니다. spec FR-098은 조합 키를 정하지 않아 판정 대상은 아님.
