# Task B7 Validation Report — 시도 2/2

- run / task / dispatch / 실제 도구 / 세션 handle: (Orca 미사용 — Claude Code 서브에이전트 spec-implement-validator, 사용자 결정 2026-10-12 "Codex 복구 전까지 Claude 에이전트", 00_context.md 승인 기록). 시도 1과 다른 새 서브에이전트 세션
- FEATURE_DIR / 단계 / 검토 태스크: `/Users/kyw/Documents/git/mine/driving_game/specs/001-kids-driving-safety-game` / implement / B7 = T053~T056 + B6 reviewer 비필수 제안 1~6, 시도 1 FAIL 1~3 재검증
- revision 요청값 / 읽기 전 / 테스트 후: `47ac5fd3b8131f510f59f8b913914c51e223f475f9c9715272c92184607495db` / `47ac5fd3b8131f510f59f8b913914c51e223f475f9c9715272c92184607495db` / `47ac5fd3b8131f510f59f8b913914c51e223f475f9c9715272c92184607495db` (세 값 같음)
  - `git status --porcelain` 34줄(시작·끝 같음). `tasks.md`의 HEAD 대비 차이는 체크 표시뿐(체크 칸을 지우고 비교한 `diff` 0줄), 체크 52개 = T001~T052, T053~T056은 `[ ]`
  - 시도 1 이후 바뀐 범위: 시도 1 검증 복사본(`2642adfa…/scratchpad/b7val`)과 `diff -rq` → `src/content/scenarios.ts`, `src/content/town.ts`, `src/practice/townActors.ts`, `tests/unit/scenario.test.ts`, `tests/unit/townActors.test.ts`뿐(복사본에만 있는 `scenarioB6.ts`·`zz_probe*.test.ts`, 복사본 vite `cacheDir` 한 줄 제외). `package.json`·`tsconfig.json` 같음. 구현 로그 "attempt 2" 변경 목록과 같음. 코드 차이는 `townActors.ts` 3줄(:77, :82 주석, :86), `scenarios.ts` 1줄(:178), `town.ts` 구역 4개 추가·2개 변경과 주석(:24-26, :54-55, :70, :76-80). 엔진 `scenario.ts`는 바뀌지 않음
  - 문서: `data-model.md` 4.12(:654)와 Open Issues 1(:1009)이 attempt 2 결정을 반영함(HEAD 대비 diff로 확인)
- 원문 및 코드 근거 (파일:라인): 아래 표. 읽은 원문 = AGENTS.md, 역할 파일, orca-cross-review.md(머리 필드·snapshot 규칙), docs/PRD.md(:83-112), GLOSSARY.md, spec.md(US2 수용 1~19 특히 4~7, Edge Cases :277-288, FR-031~036, FR-039~046, SC-008~010), data-model.md(2.1 ScenarioDef·SegmentDef·ActorPlan·ViolationKind·PedestrianViewDef·TownDef, 2.2 ScenarioAttempt·SignalState/TownPedestrian, 4.3, 4.4, 4.12, 6.3, 6.4, Open Issues), contracts/content-data.md(2장 SCENARIOS·TOWN, 4장 #15~#17), contracts/modules.md(4.2, 4.4), contracts/events.md(2장, 7.1), tasks.md(Phase 4 T053~T056), task-B7_impl.md(attempt 2 절 포함), 00_context.md(승인 기록, 특히 "B7 validator FAIL 질문 3건"), 시도 1 보고서(아래 원문). constitution은 빈 양식(사용자 결정, 규칙 없음)
- 실행한 테스트 명령 / 종료 코드 / 결과 (저장소 명령은 모두 PROJECT_ROOT에서, `set -o pipefail`):

| 명령 | 종료 코드 | 결과 |
|---|---|---|
| `python3 ivi-agent-guide/scripts/review-snapshot.py <PROJECT_ROOT> <FEATURE_DIR>` (읽기 전) | 0 | 요청값과 같음 |
| `npm run typecheck` | 0 | 오류 없음 |
| `npm test -- tests/unit/content.test.ts tests/unit/scenario.test.ts tests/unit/townActors.test.ts` | 0 | 3 files, 50 passed |
| `npm test` | 0 | 14 files, 129 passed |
| `npm run build` | 0 | 성공, 500 kB 청크 경고(기존과 같음). `dist/`는 git 무시 대상 |
| `npm run test:e2e` | 0 | 22 passed(chromium·webkit) |
| 탐색 시험(저장소 밖 복사본 `scratchpad/b7val2`, 시도 1 탐색 파일 `zz_probe*.test.ts` 재실행 + 새 `zz_val2.test.ts`·`zz_val3.test.ts`, `npx vitest run … --silent=false`) | 0 | 17 passed. 결과는 아래 "탐색 시험" |
| 변이 시험(복사본, `python3 -I scratchpad/b7val2_mutate.py`, 스크립트가 작업 위치 = 복사본임을 단언하고 한 곳씩 바꾸고 되돌림, 대상 시험 = content·scenario·townActors) | 0 | 31건 중 28건 잡힘, 3건 생존(아래 "변이 시험"). 끝난 뒤 복사본 `src`·`tests`가 저장소와 같음(내가 더한 비교용·탐색용 파일만 복사본에 있음) |
| snapshot (테스트·탐색·변이 시험 뒤) | 0 | 요청값과 같음 |

  - 복사본 = 저장소의 `src tests package.json tsconfig.json vite.config.ts` 복사 + `node_modules` 심볼릭 링크, Vite 캐시는 복사본 안(`b7val2/.vitecache`). 저장소 안에는 이 보고서 말고 아무것도 쓰지 않음(`npm run build`의 `dist/`, e2e의 `test-results/`는 요청된 명령의 git 무시 산출물)

- 검증 상태: COMPLETE
- 역할 판정: **PASS** (T053 PASS, T054 PASS, T055 PASS, T056 PASS, B6 제안 1~6 모두 PASS)
- 미해결 질문·지적: 없음. 비필수 권장 사항은 아래 "이후 태스크로 넘길 것"
- 이전 지적 처리 결과: 시도 1 FAIL 1~3 모두 사용자 결정대로 해결되고 저장소 시험으로 고정됨(아래 "이전 지적 처리 결과"). 시도 1 "이후 태스크로 넘길 것" 1은 처리됨, 2~8은 이번 범위 밖·비필수라 그대로 넘김

```
[Speckit-Context] implement phase
  ├ constitution: 빈 양식(사용자 결정, 규칙 없음). 기준은 AGENTS.md·PRD·GLOSSARY
  ├ spec: US2 세 안전 연습. 완료 = 안내된 정지·대기·출발을 직접 + 보행자 시점 안내 끝까지(FR-032, SC-008/009).
  │       crossing-check = 횡단보도 앞 완전히 멈춤 → 보행자가 다 건널 때까지 기다림 → 출발(FR-045, US2-4),
  │       turning-car = 회전 전에 멈춰 보행자 확인 → 건너는 동안 기다림 → 회전(FR-046, US2-6·7),
  │       잘못된 행동은 직전 멈춤·구간 처음부터(FR-033), 회전 대신 직진 등 경로 문제는 실패 아님(FR-034),
  │       무입력은 재안내만·오래 기다린 것은 실패 아님(FR-031), 보행자는 멈췄거나 멈출 수 있을 때만 출발(FR-039),
  │       신호는 플레이어 위치·정지로 바뀜(FR-040), 깜빡임에는 새로 출발 안 함(FR-043)
  ├ plan: 순수 로직(three·DOM·무작위 없음), 틱 단위, 후보 위치 판정, 보도는 차체 원, 정지선·횡단보도는 앞쪽 두 모서리
  └ tasks: B7 = T053 crossing-check 데이터, T054 turning-car 데이터, T055 콘텐츠 검사 #15·#17,
          T056 SC-009 3/3·SC-010 남은 2종 + B6 reviewer 제안 1~6.
          시도 2 사용자 결정(2026-10-12, 모두 권장안): Q1 turning-car 멈출 곳 = 돌기 전~횡단보도 앞 다 인정,
          Q2 회전 대신 직진 = 길을 이어(네거리) 늘 방향 안내 → 구간 다시, Q3 crossing-check 막힘 = 아직 건너기 시작하지 않은
          보행자가 있으면 보행자 신호를 깜빡이지 않음("다 건너고 차 신호도 초록이어야 출발"은 그대로, signal-wait도 같은 규칙)
```

## 판정: PASS
## 시도: 2/2

## 태스크별 판정

| 태스크 | 판정 | 계약·원문 | 코드·테스트 근거 |
|---|---|---|---|
| T053 crossing-check 데이터 | **PASS** | tasks.md:139, 00_context.md 승인 기록 "T053·T054" ①·"B7 validator FAIL 질문 3건" Q3, spec US2-4(:92), FR-045(:363), FR-031(:346), FR-033(:348), FR-039(:354), FR-042(:357), FR-043(:358), data-model.md 4.12(:654-655) | 데이터는 시도 1과 같음(`scenarios.ts:124-169`, `town.ts:64-69`, `:87-88`) — 시도 1에서 맞다고 본 부분(구역 배치, 단계 stop → wait(pedestriansClear) → wait(vehicleGreen) → go, 정지선 40 = 횡단보도 앞 가장자리, violations, playerStopped, LOOKS, pedestrianView)은 그대로. **FAIL 1 해소**: 보행자 신호 초록 → 깜빡임에 "건너기 전(`waiting`)인 보행자가 없음" 조건이 더해짐(`townActors.ts:77`, `:86`). 그래서 아이가 멈춘 뒤 살짝 움직여 보행자가 아직 출발하지 못했으면 신호가 초록 그대로이고, 차가 멈춰 있으면 보행자가 행동 180틱 뒤 건넘 → 그 뒤 깜빡임 → 빨강 → 차 초록. 보행자 출발은 여전히 보행자 신호 초록에서만(`:112-113`, FR-043), 차 초록은 보행자 신호 빨강 ∧ 건너는 사람 없음일 때만(`:94`, FR-042). 재현 H: 37.06 m 멈춤 → 살짝 앞으로 5번 → 무입력 → 보행자 건넘·단계 3(go)·차 초록, 초록에 출발하면 위반 없음. A2 20가지 모두 막힘 0. 막힘 탐색 P2(무작위 주행 아무 때나 올바른 운전으로 바꿈 300회) 모두 완료. 저장소 시험 `scenario.test.ts:286-295`(37 m 멈춤 + 살짝 움직이기 → 위반 없이 done)·`townActors.test.ts:196-198`(건너기 전 보행자가 있으면 진행 신호 때도 초록)이 고정, 변이 N1·N9 잡힘 |
| T054 turning-car 데이터 | **PASS** | tasks.md:140, 00_context.md 승인 기록 "T053·T054" ②·"B7 validator FAIL 질문 3건" Q1·Q2, spec US2-6(:94)·US2-7(:95), FR-046(:364), FR-034(:349), Edge Cases(:280), PRD.md:91, data-model.md 2.1(RouteIssue 표), Open Issues 1(:1009) | 회전 경로·정지선 61.832(회전 방향 횡단보도 앞 가장자리)·steps·violations·`signal: null`·보행자 신호 초록 고정·playerStopped는 시도 1과 같음(`scenarios.ts:88-98`, `:170-209`, `townActors.ts:33`). **FAIL 2 해소**: 정지 구역 = 앞 끝 40 m(회전 시작 47 m보다 7 m 앞, 오른쪽 보도 모퉁이 z 42 직전) ~ 정지선(`scenarios.ts:178`). 탐색 F: 40·44·46·50·53 m 목표 모두 wait → 안내 → go(40 m는 첫 멈춤이 39.99라 closer 1번 뒤 진행). P6: 40.1~61.8 m를 0.5 m 간격 44곳 모두 위반·closer 없이 완료, 보행자 출발은 차가 멈췄거나 제동 거리 + 여유 밖일 때만. 저장소 시험 `scenario.test.ts:297-303`(앞 끝 44 m 멈춤 → closer 없이 done) 고정, 변이 N2·N8 잡힘. **FAIL 3 해소**: `turn-road`를 z 80까지 이어 네거리(`town.ts:70`), 북쪽 보도를 서쪽(x 76~112)·동쪽(x 124~140)으로 나누고 북쪽 길 양쪽 보도 추가, 북서쪽 모퉁이(x 112~116, z 58~62) 비움(`:76-80`). 탐색 B: 차선 안 x 117~120·122 모두 way → leftPath(116.8은 출발 자리부터 차체 원이 오른쪽 보도에 걸림 = 차선 밖). I(조향 흔들림 직진 400회): leftPath 357, enteredSidewalk 43(시도 1은 146) — P1로 43회 모두 교차로 앞 접근로(z 24.7~41.8)에서 `turn-sidewalk-right`에 닿은 것임을 확인(회전·직진과 무관한 진짜 보도 진입, 다른 두 상황 직선 도로와 같은 성격). 저장소 시험 `scenario.test.ts:305-315`(x 117.05·117.3·118·119와 교차로 안 (116.6, 44)에서 액셀만 → 위반 없이 way + leftPath) 고정, 변이 N4·N5·N7 잡힘 |
| T055 콘텐츠 검사 #15·#17 | PASS | tasks.md:141, content-data.md 4장 #15·#17 | `content.test.ts`는 시도 1과 같음(#15 `:127-138`, #17 `:140-158`, 전제 시험 `:160-180`). 새 마을에서도 통과: turning-car 대기 위치 (104, 60)은 나뉜 북쪽 보도(x 76~112) 안, 도로·횡단보도에서 2 m. 변이 D2·D5·D6·D9·D10·D11 잡힘. 전제 시험의 "깜빡임 전 출발"은 이번 수정으로 차가 살짝 움직이는 경우에도 막힘으로 이어지지 않음(깜빡임이 보행자 출발을 기다림) |
| T056 SC-009·SC-010 시험 | PASS | tasks.md:142, SC-008(:557), SC-009(:558), SC-010(:559) | SC-009 `scenario.test.ts:256-263`(turning-car 올바른 운전은 이제 정지 구역 가운데 = 약 50.9 m, 회전 중간에서 멈춤)·SC-010 `:265-280` 통과. SC-008 `:117` 통과(turning-car 액셀만은 이제 보도 실패가 아니라 way → leftPath 되풀이, 완료 0). `correctFor`에 멈출 위치 인자 추가(`:84-99`)는 시험 도우미 변경뿐. 변이 V1·V2·D1·D7·D8 잡힘. D3·D4 생존은 시도 1과 같음(비필수, 넘김 3) |
| B6 제안 1 (시험 고정) | PASS | task-B6_review.md 제안 1 | 시험 그대로, 같은 변이 8건(S16·S3·S17·S18·S9·S11·J1·J13) 지금 revision에서 모두 잡힘 |
| B6 제안 2~5 (`scenario.ts` 정리) | PASS | 제안 2~5 | `scenario.ts` 시도 1과 같음(diff 없음). 탐색 D(B6 엔진과 지금 엔진, 세 상황 1,800,000틱) 차이 0, G(2구간 시험용 데이터) 차이 0 |
| B6 제안 6 (Open Issues 1 문구) | PASS | 제안 6, 00_context.md 승인 기록 | data-model.md:1009가 코드와 같음 — 시도 1 내용 + "turning-car 정지 구역은 회전하기 전(차체 앞 끝 40 m, 모퉁이 직전)부터 정지선까지, 교차로는 네거리라 회전 대신 직진하면 방향 안내 → 구간 다시" |

## 문서·스펙 문구와 동작 맞춤 확인

| 문서 | 확인 | 결과 |
|---|---|---|
| data-model.md 4.12(:654) | 보행자 신호 깜빡임 "아직 건너기 시작하지 않은 보행자가 있으면 미룸", 차 초록 조건, 차 신호 없는 구간 초록 고정 | `townActors.ts:77-96`과 같음 |
| data-model.md Open Issues 1(:1009) | turning-car 정지 구역 40 m~, 네거리·직진 처리 | `scenarios.ts:178`, `town.ts:70-80`과 같음 |
| spec FR-046·US2-7, tasks T054 "회전 전 stop" | 회전 전 멈춤 인정 | 이제 맞음. 회전 중·회전 뒤 횡단보도 앞 멈춤도 인정하는 것은 사용자 결정 Q1("돌기 전~횡단보도 앞 다 인정")이며 스펙 문구와 어긋나지 않음 |
| spec FR-034·Edge Cases :280 | 회전 대신 직진은 실패 아님 | way → leftPath(redirect, failStreak 그대로)로 맞음 |
| spec FR-043·FR-039·FR-042 | 깜빡임에는 새로 출발 안 함, 출발은 멈췄거나 멈출 수 있을 때, 차 초록 ∧ 보행자 초록 없음 | 유지(탐색 C·P5·P6에서 위반 0) |
| data-model 4.12 신호 바뀌는 때(signal-wait 포함) | 올바른 주행에서 신호 바뀌는 틱이 그대로인지 | 탐색 P3: 세 상황 × 정지 위치 11곳 × 최고 속도 3가지 = 99가지에서 시도 1 townActors와 state·사건 차이 0. 무작위 주행 300회씩: signal-wait 차이 0, crossing-check 2회 차이 — 둘 다 "보행자가 대기 중일 때 깜빡임을 미룬" 틱뿐 |
| tasks T053 문구(stop → wait(pedestriansClear) → go) | 두 번째 wait(vehicleGreen) | 시도 1에서 이미 사용자 결정 ①로 받아들인 차이. 새로 어긋나는 문구 없음 |

## 이전 지적 처리 결과

### 시도 1 FAIL 피드백

| # | 지적 | 사용자 결정 | 처리 | 시험 고정 |
|---|---|---|---|---|
| 1 | T053 crossing-check에서 멈춘 뒤 살짝 움직이기를 반복하면 보행자가 끝내 건너지 않아 wait(pedestriansClear)가 영영 안 끝남 | Q3 "보행자가 출발할 때까지 신호 유지" | **해결**. `townActors.ts:77`, `:86`, data-model.md:654. H·A2·A·P2·P5에서 막힘 0, 기다리면 완료 | `scenario.test.ts:286-295`, `townActors.test.ts:196-198`. 변이 N1(되돌림)·N9(조건을 `!crossing`으로 잘못 씀) 잡힘 |
| 2 | T054 "회전 전에 멈춤"이 정지로 인정되지 않음 | Q1 "돌기 전~횡단보도 앞 다 인정" | **해결**. `scenarios.ts:178` 정지 구역 40 m~정지선, data-model.md:1009. F·P6 모두 완료 | `scenario.test.ts:297-303`. 변이 N2(되돌림)·N8(구역 시작 45 m) 잡힘 |
| 3 | T054 회전 대신 직진이 맞은편 보도 진입 실패로 끝나는 경우가 많음 | Q2 "길을 이어 늘 안내로 처리" | **해결**. `town.ts:70`, `:76-80`, data-model.md:1009. B: 차선 안 x 모두 way → leftPath, I: 교차로 쪽 보도 진입 0(남은 43회는 접근로 오른쪽 보도) | `scenario.test.ts:305-315`. 변이 N4(북쪽 보도 한 장)·N5(북서쪽 모퉁이 채움)·N7(마을 전체 시도 1로) 잡힘 |

### 시도 1 "이후 태스크로 넘길 것"

| # | 항목 | 결과 |
|---|---|---|
| 1 | FAIL 수정 뒤 재검증, 재현을 시험으로 고정 | 처리됨(위 표) |
| 2 | #17 보도 여유(앞 모서리 보도 걸침 최대 0.56 m) | 반영 안 됨(비필수). 이번 탐색 C도 최대 0.56 m, 지금 데이터(대기 위치가 경계에서 2 m)는 안전. 그대로 넘김 |
| 3 | #17 꼭짓점만 봄 | 반영 안 됨(비필수), 지금 데이터는 곧은 경로라 충분. 그대로 넘김 |
| 4 | crossing-check 사용자 결정(playerStopped, 두 번째 wait) 시험 고정 | 반영 안 됨(비필수). 변이 D3·D4 여전히 생존. 그대로 넘김 |
| 5 | T058 신호 방향(`SignalDef.pose.heading` 뜻) | 이번 범위 밖, 그대로 넘김 |
| 6 | T058·T099 회전 안쪽 모퉁이 빈 땅 | 이번 범위 밖, 그대로 넘김 + 북서쪽 모퉁이(x 112~116, z 58~62)도 빈 땅이 됨(아래 넘김 4) |
| 7 | T062·T099 건물 막힘(FR-035)이 데이터로 안 나옴 | 그대로(네거리 추가 뒤에도 모든 도로가 보도로 둘러싸임). 넘김 |
| 8 | T059·T060 같은 cue(`hint wait`) 두 번 | 그대로. 넘김 |

## 탐색 시험 (저장소 밖 복사본, 판정 근거)

| # | 내용 | 결과 |
|---|---|---|
| H | crossing-check 37.06 m 멈춤 → 1.5초마다 살짝 앞으로 5번 → 무입력 36,000틱 → 출발 | 430틱에 보행자 `waiting/lookRight`·보행자 신호 초록(깜빡임 안 함) → 보행자 건넘 → 단계 3(go)·차 초록·보행자 빨강, `hint wait` 3번, 출발 때 위반 없음 |
| A | crossing-check 35 m 멈춤 → 100틱마다 4틱 액셀 | 6,000틱 무입력 뒤 go까지 진행, 초록에 출발 위반 없음 |
| A2 | 정지 위치 33·35·36·37·38.5 m × 움직이는 간격 60·100·150·200틱 | 20가지 모두 보행자 건넘, 단계 1에 막힘 0 |
| B | turning-car 시작 x별 액셀만(직진) | 116.8 → 출발 자리부터 보도(차선 밖), 117~120 → way → leftPath, 122 → leftPath |
| I + P1 | 조향 20틱마다 ±0.03 흔들며 직진 400회 + 보도 진입 위치 분류 | leftPath 357, enteredSidewalk 43. 43회 모두 `turn-sidewalk-right`, z 24.7~41.8(교차로 앞 접근로), x 117.0, heading −2°~−4° |
| C | crossing-check·turning-car 각 400회 × 6,000틱 무작위·반쯤 올바른 주행 | 예외 0. 불변 조건 위반 0(go 전 앞 모서리 정지선 너머, 차체 원 보도·건물 겹침, 보행자 출발 때 신호 초록 아님, 출발 때 차가 움직이며 제동 거리 + 여유 안, 차 초록 ∧ 보행자 초록, 건너는 중 차 초록, 안내 없이 완료, 경로 끝 전 완료). 막힘 상태 0(시도 1은 crossing-check 36회). 차체 직사각형과 보행자 최소 1.566 m(건너는 중 2.017 m). 완료 crossing-check 69·turning-car 86 |
| D | B6 엔진과 지금 엔진, 같은 입력(세 상황 × 120회 × 5,000틱) | 1,800,000틱 차이 0 |
| E | turning-car 올바른 주행 변형: 앞보기 2.5~8 m × 정지 위치(구역 5·50·95%) × 최고 속도 2·4·8 m/s | 앞보기 2.5~6 m 45가지 모두 위반·redirect 없이 완료(보도까지 최소 0.24~1.0 m). 앞보기 8 m는 모퉁이를 크게 잘라 남쪽 보도(시도 1과 같음) |
| F | turning-car 앞 끝 40·44·46·50·53 m 목표로 멈춤 | 모두 wait → 안내 → go. heading 0°·−0.3°·−4°·−30°·−57° |
| G | 2구간 시험용 crossing-check에서 B6 엔진과 지금 엔진 | 차이 0, 구간 넘어감 1번, done |
| P2 | 세 상황 각 300회: 무작위·반쯤 올바른 주행(멈췄다 살짝 움직이기 포함) 0~5,000틱 아무 때에 올바른 운전으로 바꿔 40,000틱 | signal-wait 300/300, crossing-check 300/300(2회는 바꾼 직후 위반 1번 뒤), turning-car 300/300 완료. 끝나지 않는 상태 0 |
| P3 | 시도 1 townActors(`townActorsA1.ts`)와 지금 townActors를 같은 엔진·입력으로 비교 | 올바른 주행 99가지 차이 0(정지선 1 cm 앞을 노린 운전자 3가지는 두 엔진 모두 같은 ranRed/overStopLine 반복 — 운전자 문제, 별도 확인 `zz_val3`). 무작위 300회: signal-wait 0회, crossing-check 2회 차이 — 둘 다 보행자 대기 중 깜빡임을 미룬 틱 |
| P4 | turning-car 좌회전·일찍/늦게·크게 돌기(참고) | 교차로 안에서 좌회전 → way → leftPath. 교차로 앞(앞 끝 40~44 m)에서 일찍 좌회전 → 왼쪽 보도(x 124~128) 진입. 우회전을 너무 일찍/늦게 하면 보도 진입·정지선 초과(멈추지 않고 돎). 넘김 6 참고 |
| P5 | signal-wait·crossing-check: 정지 구역 앞쪽·가운데·정지선 1.2 m 앞에 멈춤 × 살짝 움직이는 간격 40·90·150틱을 1,500틱 동안 → 기다림 | 18가지 모두 위반 없이 done. 보행자 출발은 초록에서만, 단계 1 이후 보행자가 다 건너기 전 차 초록 0. 보행자가 대기하는 동안 보행자 신호 초록 유지(최대 stoppedTicks 약 1,680) |
| P6 | turning-car 정지 위치 40.1~61.8 m, 0.5 m 간격 44곳 | 44/44 위반·closer·way 없이 완료, 보행자 출발은 차가 멈췄거나 제동 거리 + 여유 밖 |

## 변이 시험 (저장소 밖 복사본, 한 번에 한 곳, 대상 시험 = content·scenario·townActors)

잡힘 28건:
- 시도 2 수정 되돌림·흔들기: N1 깜빡임 조건에서 `!waiting` 빼기, N2 정지 구역 = 정지선 − 8, N4 북쪽 보도 한 장(x 76~140), N5 북서쪽 모퉁이 채움, N7 마을 전체 시도 1로, N8 정지 구역 시작 45 m, N9 미룸 조건을 `!crossing`으로
- 시도 1 변이 21건 중 19건: S16, S3, S17, S18, S9, S11, J1, J13, V1, V2, D1, D2, D5, D6, D7, D8, D9, D10, D11

생존 3건(판정에 넣지 않음):
- N3 `turn-road`를 z 58로 되돌림, N6 북쪽 길 양쪽 보도 빼기: 도로 구역은 판정에 쓰이지 않고(`scenario.ts:74-75`는 건물·보도만, 횡단보도는 구간 `crosswalk`만) 그림(`render/townView.ts:28-37`)에만 쓰임. 북쪽 길 보도는 직진 차가 leftPath(경로에서 6 m)에 먼저 닿아 판정에 닿지 않음. 단위 시험으로 잡을 대상이 아님(구현 로그의 N3 생존 설명과 같음)
- D3·D4: 시도 1과 같음(넘김 3)

## 이후 태스크로 넘길 것 (비필수, 판정과 별개)

1. **T055 #17 보도 여유**(시도 1 넘김 2 그대로): 앞 모서리가 보도 안으로 최대 0.56 m 들어감. 시험 여유 1 m에 이 걸침을 더하거나 문서에 적기를 권장
2. **T055 #17 꼭짓점만**(시도 1 넘김 3 그대로): 굽은 경로·비스듬한 횡단이 생기면 선분을 나눠 보기
3. **T056 사용자 결정 고정**(시도 1 넘김 4 그대로): crossing-check playerStopped와 두 번째 wait(vehicleGreen)를 시험이 잡지 못함(D3·D4 생존)
4. **T058·T099 모퉁이와 그림**(시도 1 넘김 5·6 + 새 항목): 신호 `pose.heading` 뜻, 회전 안쪽 모퉁이(x 110~116, z 42~50)에 더해 북서쪽 모퉁이(x 112~116, z 58~62)도 도로도 보도도 아닌 빈 땅이 됨. 보행자 시점 안내 핵심 규칙 "길모퉁이에서는 차도에서 멀리"의 모퉁이 보도가 없으니 그림 표현을 정할 것. 또 교차로에서 `turn-road`와 `turn-side-road` 상자가 같은 높이(0.02 m)로 겹침(시도 1부터 있던 겹침, 이번에 길이만 늘어남) — 그릴 때 깜빡임(z-fighting)이 없는지 확인
5. **T058·T060 보행자 시점 안내 카메라**: 카메라(`scenarios.ts:203`, (105, 1, 61) → (112, 0.8, 52))는 그대로인데 이제 차가 회전 전(앞 끝 40 m, 차 중심 z 약 39)에도 멈출 수 있음. 그 위치의 아이 차가 안내 화면에 어떻게 보이는지 확인
6. **T062 플레이 확인 — 회전 방향 실수**(참고, P4): 교차로 안 좌회전은 방향 안내 → 구간 다시지만, 교차로 앞에서 일찍 꺾으면 보도 진입 실패. 스펙 FR-034는 "회전 대신 직진"만 적고 있어 지금 동작이 어긋나지는 않음. 아이 플레이에서 실패가 잦으면 그때 정할 것
7. **문서 다듬기(선택)**: data-model.md:655 "행동 중에 조건이 깨지면(… 보행자 신호 깜빡임)"은 이제 대기 중 보행자가 있으면 깜빡이지 않으므로 실제로는 일어나지 않음(코드의 안전장치로는 남아 있음, 틀린 문장은 아님). contracts/modules.md 4.2 FR-040 행 "플레이어 상태(`frontS`, `stoppedTicks`)로만"은 보행자 상태(건너는 중·대기 중)도 신호에 쓰인다는 점을 적지 않음(차 초록 조건은 시도 1부터 같았음). 둘 다 동작과 모순은 아님
8. **T062·T099 건물 막힘, T059·T060 같은 cue 두 번**(시도 1 넘김 7·8 그대로)

## 참고 (조치 불필요)

- 순수 로직 규칙: 바뀐 소스·시험에 `three`·DOM·`localStorage`·`Math.random`·`Date`·타이머 사용 0건
- signal-wait에도 같은 깜빡임 규칙이 적용됨(사용자 결정 Q3). 올바른 주행에서는 보행자가 깜빡임 시점(420틱) 전에 이미 건너는 중이라 신호 바뀌는 틱이 시도 1과 같음(P3). 아이가 멈춘 뒤 살짝 움직여 보행자가 출발하지 못한 경우에만 차 초록이 보행자가 건넌 뒤로 늦어짐(P5)

---

# 시도 1/2 보고서 (이전, 원문 보존)

# Task B7 Validation Report

- run / task / dispatch / 실제 도구 / 세션 handle: (Orca 미사용 — Claude Code 서브에이전트 spec-implement-validator, 사용자 결정 2026-10-12 "Codex 복구 전까지 Claude 에이전트", 00_context.md 승인 기록)
- FEATURE_DIR / 단계 / 검토 태스크: `/Users/kyw/Documents/git/mine/driving_game/specs/001-kids-driving-safety-game` / implement / B7 = T053~T056 + B6 reviewer 비필수 제안 1~6
- revision 요청값 / 읽기 전 / 테스트 후: `0fd4581b20fd99f71bcbdaab5e1b6f0cf7ccee6e6019ca841f1805525eb8ce8b` / `0fd4581b20fd99f71bcbdaab5e1b6f0cf7ccee6e6019ca841f1805525eb8ce8b` / `0fd4581b20fd99f71bcbdaab5e1b6f0cf7ccee6e6019ca841f1805525eb8ce8b` (세 값 같음)
  - `git status --porcelain` 34줄(시작·끝 같음). `tasks.md`의 HEAD 대비 차이는 체크 표시뿐(체크 칸을 지우고 비교한 `diff` 결과 0), 체크된 것은 T001~T052, T053~T056은 `[ ]`
  - `src/`·`tests/` 변경 범위: B6 검증 복사본(`scratchpad/b6val`)과 비교해 바뀐 파일은 `src/content/town.ts`, `src/content/scenarios.ts`, `src/practice/scenario.ts`, `tests/unit/content.test.ts`, `tests/unit/scenario.test.ts`뿐(`diff -rq`). 구현 로그의 변경 목록과 같음. `scenario.ts` 차이는 제안 2~5 네 곳뿐
- 원문 및 코드 근거 (파일:라인): 아래 표. 읽은 원문 = AGENTS.md, 역할 파일, orca-cross-review.md(머리 필드·snapshot 규칙), docs/PRD.md(:87-112), GLOSSARY.md, spec.md(US2 수용 1~19 특히 4~7·12, Edge Cases :278-282, FR-024·028·031~036·039~046, SC-008~010), data-model.md(2.1 TownDef·SegmentDef·ActorPlan·ViolationKind·PedestrianViewDef, 2.2, 4.3·4.4·4.12, 6.4, Open Issues 1), contracts/content-data.md(2장 SCENARIOS·TOWN, 4장 #15~#17), contracts/modules.md(4.2·4.4), contracts/events.md(2장, 7.1), tasks.md(Phase 4 T043~T062), task-B7_impl.md(판단 메모 9건·제안 표), 00_context.md(승인 기록 "T053·T054", "T049 정지선 설명", "T043 신호 모습", "첫 공개 배포 범위"), task-B6_validation.md(넘긴 항목 1~8), task-B6_review.md(개선 제안 1~7). constitution은 빈 양식(사용자 결정, 규칙 없음)
- 실행한 테스트 명령 / 종료 코드 / 결과 (모두 PROJECT_ROOT에서, `set -o pipefail`):

| 명령 | 종료 코드 | 결과 |
|---|---|---|
| `python3 ivi-agent-guide/scripts/review-snapshot.py <PROJECT_ROOT> <FEATURE_DIR>` (읽기 전) | 0 | 요청값과 같음 |
| `npm run typecheck` | 0 | 오류 없음 |
| `npm test -- tests/unit/content.test.ts tests/unit/scenario.test.ts` | 0 | 2 files, 39 passed |
| `npm test` | 0 | 14 files, 126 passed |
| `npm run build` | 0 | 성공, 500 kB 청크 경고(기존과 같음). `dist/`는 git 무시 대상 |
| 탐색 시험(저장소 밖 복사본 `scratchpad/b7val/tests/unit/zz_probe*.test.ts`, `npx vitest run … --testTimeout=300000 --silent=false`) | 0 | 10 passed. 결과는 아래 "탐색 시험" |
| 변이 시험(복사본, `python3 -I scratchpad/b7val_mutate.py`, 스크립트가 작업 위치 = 복사본임을 단언하고 한 곳씩 바꾸고 되돌림) | 0 | 21건 중 19건 잡힘, 2건 생존(아래 "변이 시험"). 끝에 복사본 `src`와 저장소 `src`가 같음(비교용으로 더한 `scenarioB6.ts`만 복사본에 있음) |
| snapshot (테스트·탐색·변이 시험 뒤) | 0 | 요청값과 같음 |

  - E2E(`npm run test:e2e`)는 실행하지 않음(요청서의 선택 항목, flow·UI 변경 없음). 구현자 결과 22 passed는 확인하지 않은 값으로 둠
  - 복사본의 Vite 캐시는 복사본 안(`b7val/.vitecache`)으로 돌림. 저장소 안에는 이 보고서 말고 아무것도 쓰지 않음

- 검증 상태: COMPLETE
- 역할 판정: **FAIL** (T053 FAIL, T054 FAIL, T055 PASS, T056 PASS, B6 제안 1~6 모두 PASS)
- 미해결 질문·지적 / 이전 지적 처리 결과:
  - FAIL 지적 3건(아래 "FAIL 피드백" 1~3). 1은 고치는 방법이 엔진·문서 동작 변경일 수 있어 리더 판단, 2·3은 데이터를 고치거나 사용자가 지금 해석을 승인하는 두 길이 있어 사용자 확인이 필요함(아래 "사용자 확인이 필요한 질문" Q1~Q3)
  - 이전 지적(task-B6_validation.md "이후 태스크로 넘길 것"): 1 처리됨, 2 처리됨, 3 확인함(지금 데이터는 안전, 시험 여유는 권장 사항 남음), 6 지금 데이터는 지킴, 7 처리됨. 1의 부가 권장(정지선 판정 "내려감" 한 줄)은 반영 안 됨(비필수). 자세한 것은 아래 "이전 지적 처리 결과"

```
[Speckit-Context] implement phase
  ├ constitution: 빈 양식(사용자 결정, 규칙 없음). 기준은 AGENTS.md·PRD·GLOSSARY
  ├ spec: US2 세 안전 연습. 완료 = 안내된 정지·대기·출발을 직접 + 보행자 시점 안내 끝까지(FR-032, SC-008/009).
  │       crossing-check = 횡단보도 앞 완전히 멈춤 → 보행자가 다 건널 때까지 기다림 → 출발(FR-045, US2-4),
  │       turning-car = 회전 전에 멈춰 보행자 확인 → 건너는 동안 기다림 → 회전(FR-046, US2-6·7),
  │       잘못된 행동은 직전 멈춤·구간 처음부터(FR-033), 경로 문제(회전 대신 직진 등)는 실패 아님(FR-034),
  │       무입력은 재안내만(FR-031), 보행자는 멈췄거나 멈출 수 있을 때만 출발(FR-039), 깜빡임에는 새로 출발 안 함(FR-043)
  ├ plan: 순수 로직(three·DOM·무작위 없음), 틱 단위, 후보 위치 판정, 구역 판정은 차체 원, 정지선·횡단보도는 앞쪽 두 모서리
  └ tasks: B7 = T053 crossing-check 데이터, T054 turning-car 데이터, T055 콘텐츠 검사 #15·#17,
          T056 SC-009 3/3·SC-010 남은 2종 + B6 reviewer 제안 1(시험 고정)·2~5(scenario.ts 정리)·6(data-model Open Issues 1)
          사용자 결정(2026-10-12): crossing-check 차·보행자 신호, stop → wait(pedestriansClear) → wait(vehicleGreen) → go,
          보행자 playerStopped / turning-car 보행자 playerStopped, 회전 방향 보행자 신호 초록 고정
```

## 판정: FAIL
## 시도: 1/2

## 태스크별 판정

| 태스크 | 판정 | 계약·원문 | 코드·테스트 근거 |
|---|---|---|---|
| T053 crossing-check 데이터 | **FAIL** (FAIL 피드백 1) | tasks.md:139, 00_context.md 승인 기록 "T053·T054" ①, spec US2-4(:90)·US2-5, FR-045(:363), FR-031(:346), FR-033(:348), FR-039·043, data-model.md 2.1·4.12(:654-655), content-data.md 2장 | 맞는 부분: 마을 구역이 서로 맞음 — 도로 x 36~44, 횡단보도 z 40~44, 양쪽 보도 4 m, 건물(`town.ts:60-65`), 차 신호 `cross-vehicle`(vehicle)·보행자 신호 `cross-pedestrian`(pedestrian)(`town.ts:79-80`). 구간이 사용자 결정대로 stop → wait(pedestriansClear) → wait(vehicleGreen) → go(`scenarios.ts:133-138`), 정지선 40 = 횡단보도 앞 가장자리, 정지 구역 32~40(`:131-132`), violations에 enteredCrosswalkWithPedestrian 포함·turnedInto 없음(`:139`), ActorPlan poses = lookLeft·lookRight·lookLeft·raiseHand, start playerStopped(`:58`, `:146-155`), pedestrianView afterStep 2 = 두 대기 뒤·출발 전, camera·protagonistPath·introTicks(`:159-168`). 탐색 시험 C(400회): 정지선 너머 0, 보도 겹침 0, 보행자 출발이 초록 아님 0, 너무 가까울 때 출발 0, 차 초록 ∧ 보행자 초록 0, 건너는 중 차 초록 0, 안내 없이 완료 0. **문제**: 정지 구역 뒷부분(앞 끝 35.8 m 넘어, 횡단보도에서 4.2 m 안)에서 멈춘 뒤 살짝 움직이기를 몇 번 하면 보행자가 끝내 건너지 않고 wait(pedestriansClear)를 영영 마칠 수 없음. 그 상태에서는 기다리기만 하면 끝나지 않고, 차 신호가 초록이고 아무도 건너지 않을 때 출발하면 earlyStart 실패가 됨(재현 H, A2, C) |
| T054 turning-car 데이터 | **FAIL** (FAIL 피드백 2·3) | tasks.md:140, 00_context.md 승인 기록 "T053·T054" ②, spec US2-6(:94)·US2-7(:95), FR-046(:364), FR-034(:349)·Edge Cases(:280), PRD.md:91, data-model.md 2.1 ViolationKind 표(:200), 4.12 | 맞는 부분: x 118 차선 → 반지름 5 m 우회전(중심 113, 47) → z 52 차선(`scenarios.ts:90-94`), 정지선 = 경로 꼭짓점 (106, 52)까지 경로 거리 61.832 m = 회전 방향 횡단보도(x 102~106) 앞 가장자리(`:95-98`, `:177`), steps stop → wait(pedestriansClear) → go(`:179`), violations turnedInto·earlyStart·overStopLine·enteredSidewalk(차 신호 없어 ranRed 없음 = "실제로 판정할 것만", `:180`), `signal: null`, 보행자 신호 `turn-pedestrian` 초록 고정(`townActors.ts:33`), 보행자 playerStopped(`:194`), 회전 안쪽 모퉁이 비움(`town.ts:69-73`), 건물 `town.ts:74`. 올바른 주행(앞보기 2.5~6 m × 정지 위치 3곳 × 최고 속도 3가지 = 45가지)이 모두 위반·redirect 없이 완료, 보도까지 최소 0.24~1.0 m(탐색 E). turnedInto·earlyStart·overStopLine·enteredSidewalk 모두 실제로 나옴(탐색 C). **문제 2**: 스펙의 "회전 전에 멈춤"이 인정되지 않음 — 정지 구역 53.832~61.832가 회전 호(47~54.83)의 마지막 1 m부터라, 회전 들어가기 전(앞 끝 40~46 m, heading 0°~−4°)이나 반쯤 돈 뒤(heading −30°~−57°)에 멈추면 `hint closer`만 나오고 stop 단계가 안 끝남(탐색 F). **문제 3**: 회전 대신 직진하면 차선 가운데보다 0.5 m 넘게 오른쪽일 때 맞은편 보도(z 58~62)에 먼저 닿아 enteredSidewalk 실패가 됨 — 조향이 조금 흔들리는 직진 400회 중 146회(36.5%)(탐색 B·I) |
| T055 콘텐츠 검사 #15·#17 | PASS | tasks.md:141, content-data.md 4장 #15·#17, data-model.md 6.3(:924) | #15(`content.test.ts:127-138`): 모든 구간 violations 합집합 = 6종, `satisfies Record<ViolationKind, 1>`로 종류가 늘면 타입 검사에서 잡힘. #17(`:140-158`): 보행자 경로 꼭짓점마다 ① 경로 투영 거리 ≥ max(정지선, 횡단보도 앞 가장자리) + 1 m, ② 보도 구역 안, ③ 도로·횡단보도 구역까지 ≥ 1 m. 계약의 "위반 경계(정지선, 횡단보도의 차 쪽 가장자리, 보도 가장자리)의 차가 오는 쪽 반대편 + 경계까지 ≥ 사람 반지름 + 여유(1 m 제안)"를 세 경계 각각으로 옮긴 것이라 해석(메모 6) 타당. 지금 데이터는 대기·도착 위치가 모두 경계에서 2 m(`scenarios.ts:67-68`, `:149-150`, `:190-191`). 변이 D2(대기 위치를 도로에서 0.5 m)·D5(횡단보도 앞 가장자리 너머 0.5 m) 잡힘. 덧붙인 전제 시험(`:160-180`, 메모 7): 신호 종류, redAtS ≤ 정지 구역 시작, 노랑 지점 제동 거리, 깜빡임 전 출발, 경로 점 2개 이상 — 변이 D9·D10·D11 잡힘. 권장 사항은 아래 "이후 태스크" 2·3 |
| T056 SC-009·SC-010 시험 | PASS | tasks.md:142, SC-009(:558), SC-010(:559) | SC-009(`scenario.test.ts:256-263`): 세 상황을 경로 따라 조향하는 올바른 운전으로 모두 `done`, 위반·redirect 0, 마지막 사건 `scenarioCompleted`. SC-010 남은 2종(`:265-280`): 보행자가 건너기 시작하면 액셀 → crossing-check `enteredCrosswalkWithPedestrian`, turning-car `turnedIntoCrossingPedestrian`, `EXPLAIN_TICKS` 뒤 `segmentReset` + `hint stop`. 자리표시에 기댄 시험 이동: wrongWay → turning-car 직진(`:213-219`), blocked → 판정 목록을 비운 시험용 signal-wait(`vi.doMock`, 마을 데이터는 실제, `:229-252`). 변이 V1(횡단보도 판정 없음)·V2(우선순위 바꿈)·D1(정지선을 횡단보도 앞으로)·D6·D7·D8 잡힘. 다만 crossing-check의 사용자 결정 두 가지(playerStopped, 두 번째 wait)는 시험이 고정하지 못함(변이 D3·D4 생존, 아래 "이후 태스크" 4) |
| B6 제안 1 (시험 고정) | PASS | task-B6_review.md 제안 1 | S16 `scenario.test.ts:297`, S3 `:298`, S17 `:299`, S18 `:300`, J1 `:27-31`(앞쪽 두 모서리)·`:173`(살짝 비스듬한 운전), S9 `:165`(설명 중 탭), S11 `:192`(`DEMO_AFTER_FAILS + 1`번째), J13 `:218`. 같은 변이 8건을 지금 코드에 다시 걸어 모두 잡힘(아래 변이 표) |
| B6 제안 2 (`!viewDone` 가드 삭제) | PASS(동작 같음) | task-B6_review.md 제안 2, data-model.md 4.3 "마지막 구간 마지막 단계 충족 ∧ viewDone" | 삭제 위치 = 이전 `next()`의 완료 직전 줄(B6 `scenario.ts:222`). 단계는 0부터 순서대로만 마치고 마칠 때마다 `advance()`가 (구간, 단계) = 안내 위치 ∧ `!viewDone`이면 안내를 시작하며(`:185`), #16이 안내 위치를 실제 구간·단계로 막으므로(`content.test.ts:114-125`) 마지막 단계에 닿을 때는 늘 `viewDone`. 실측: B6 엔진과 지금 엔진에 같은 입력을 넣어 세 상황 × 120회 × 5,000틱 = 1,800,000틱 동안 state·사건이 모두 같음(탐색 D) |
| B6 제안 3 (다음 구간 분기) | PASS(동작 같음) | 제안 3, data-model.md 4.3 "다음 구간, failStreak = 0" | `scenario.ts:207-211`. 이전 코드와 달라지는 필드는 `violation`(driving에서는 늘 null)·`phaseTicks`(driving·안내 중 늘 0)뿐이라 같음. 2구간 시험용 crossing-check(`vi.doMock`)로 두 엔진 비교: 구간 넘어감 1번 포함 끝까지 차이 0(탐색 G) |
| B6 제안 4 (`defOf`) | PASS | 제안 4 | `scenario.ts:77`, `:124` |
| B6 제안 5 (주석) | PASS | 제안 5 | `scenario.ts:155` |
| B6 제안 6 (Open Issues 1 문구) | PASS | 제안 6, 00_context.md 승인 기록 | data-model.md:1009가 코드와 같음(crossing-check 차·짝 보행자 신호, 네 단계, playerStopped / turning-car `signal: null`·초록 고정·playerStopped / 두 상황 정지선 = 횡단보도 앞 가장자리) |

## FAIL 피드백

1. **T053 — crossing-check에서 보행자가 끝내 건너지 않아 완료할 수 없는 상태가 생김**
   - 근거: spec US2-4(:90) "횡단보도 앞에서 차를 완전히 멈추고 보행자가 다 건널 때까지 기다린 뒤 출발 … 완료", FR-045(:363), FR-031(:346, 오래 기다린 것을 실패로 보지 않음), FR-033(:348, 잘못된 행동일 때만 멈춤·재시도).
   - 원인: 보행자 신호 깜빡임이 보행자 진행과 상관없이 `stoppedTicks ≥ greenAfterStoppedTicks − FLASH_TICKS`(420틱)에 시작함(`townActors.ts:85`). playerStopped 보행자는 차가 멈춰 있거나 정지선에서 제동 거리 + 여유(4.2 m) 밖일 때만 행동(180틱)을 이어 가고, 조건이 깨지면 처음부터 다시 하며(`townActors.ts:106`, `:111-113`, data-model.md 4.12), 깜빡임에는 새로 출발하지 않음(FR-043). 그래서 앞 끝이 35.8 m를 넘는 정지 구역 뒷부분(32~40 중 35.8~40)에서 멈춘 뒤 살짝 움직이기를 반복해 420틱 전에 행동 180틱을 못 채우면, 보행자는 다음 초록을 기다리며(올바른 보행 행동) 대기 위치에 남고 → 보행자 신호 빨강 → 차 신호 초록(`:93`). 그런데 단계는 `pedestriansClear` = 모든 보행자 `crossed`(`scenario.ts:178`)라 영영 끝나지 않음. 엔진 쪽은 B6에서 검증한 그대로이고, 이 조합(playerStopped + 짝 보행자 신호 + pedestriansClear 단계)을 처음 쓰는 것이 T053 데이터임.
   - 재현(탐색 H): 앞 끝 37.06 m(정지 구역 안, 횡단보도 3 m 앞)에 멈춤 → 1.5초마다 액셀 3틱 + 브레이크(5번, 모두 합쳐 0.04 m 이동) → `stoppedTicks` 430에 보행자 `waiting/idle`, 보행자 신호 깜빡임 → 무입력 36,000틱(10분): 단계 1(pedestriansClear) 그대로, 차 신호 초록·보행자 신호 빨강·보행자 대기, `hint wait` 120번 → 차 신호 초록·건너는 사람 없음에서 출발하면 `violation earlyStart`. 정지 위치 36·37·38.5 m × 움직이는 간격 60·100·150틱 9가지 모두 같은 막힘, 35 m 이하에서 멈추면 막힘 없음(탐색 A2). 무작위·반쯤 올바른 주행 400회 중 36회가 이 상태에 들어감(탐색 C).
   - 기대 동작: 정지 구역 안에서 멈춘 뒤 정지선을 넘지 않은 아이는, 계속 기다리면 실패 없이 완료할 수 있어야 함(보행자가 결국 건너거나, 건너지 않기로 한 경우 단계 조건이 성립해야 함). 차 신호 초록·건너는 사람 없음에서의 출발이 `earlyStart`가 되지 않아야 함.
   - 고치는 곳: 데이터 값만으로는 막을 수 없음(살짝 움직이기를 계속하면 어떤 `greenAfterStoppedTicks`도 넘김). 엔진 동작(`townActors.ts` 깜빡임 시점 또는 `scenario.ts` `pedestriansClear` 정의)과 문서(data-model.md 2.1 SafetyActionStep 주석·4.12)를 함께 바꿔야 할 가능성이 큼 → 방법은 리더가 정하고, 사용자 결정("보행자가 다 건너고 차 신호도 초록이어야 출발")의 뜻이 바뀌면 사용자 확인(Q3). 고친 뒤에는 위 재현을 시험으로 고정할 것.
   - T055 전제 시험의 "깜빡임 전 출발"(`content.test.ts:172-174`)은 차가 멈춘 채 있을 때만 성립함. 이 시험이 막힘이 없다는 보장은 아님.

2. **T054 — "회전 전에 멈춤"이 정지로 인정되지 않음**
   - 근거: FR-046(:364) "회전 전에 멈춰 보행자를 확인하고 보행자가 건너는 동안 기다린 뒤 회전", US2-7(:95) "회전 전에 멈추고 … 기다린 뒤 회전", tasks.md:140 "회전 전 stop", 사용자 결정 ②의 "아이 차가 회전 전에 멈춘 뒤", PRD.md:91 "회전하기 전 보행자를 확인".
   - 지금 동작: 정지 구역이 회전 호의 마지막 1 m(약 78° 돈 지점)부터 횡단보도 앞 가장자리까지라(`scenarios.ts:177-178`), 회전 전(앞 끝 40·44·46 m)이나 반쯤 돈 뒤 멈추면 `hint closer`("조금 더 앞으로")만 나오고 보행자도 출발하지 않음(탐색 F). 멈춘 뒤 다시 출발하는 것은 회전이 아니라 직진. 구현 메모 3은 이를 "회전 방향 횡단보도에 들어가기 전"으로 읽었다고 밝힘.
   - 판단: data-model.md(2.1 turnedInto "회전 경로에서 … 횡단보도에 차체 앞 끝이 들어감", Open Issues 1 "정지선 = 횡단보도 앞 가장자리")는 두 읽기 모두와 맞지만, spec·tasks·사용자 결정의 문구는 "회전 전에 멈춤 → 기다림 → 회전"으로 분명함. 횡단보도 위반이 나오려면 정지선이 횡단보도 앞 가장자리여야 한다는 제약(B6 넘긴 항목 1)과도 양립하는 배치가 있음 — 예: 회전 방향 횡단보도를 모퉁이 가까이 두어 앞 모서리가 회전 초반에 횡단보도에 닿게 하면 정지 구역 [정지선 − 8, 정지선]이 회전 전 접근 구간을 덮음(보도·모퉁이·반지름 조정 필요).
   - 해소 방법: (가) 위처럼 데이터를 다시 배치해 회전 전 멈춤을 인정, 또는 (나) 사용자가 "우회전 뒤 회전 방향 횡단보도 앞에서 멈춤"(실제 우회전 일시정지와 비슷) 해석을 승인하면 데이터는 그대로 두고 spec FR-046·US2-7·tasks T054 문구를 그 뜻으로 맞춤(Q1).

3. **T054 — 회전 대신 직진이 실패(보도 진입)로 끝나는 경우가 많음**
   - 근거: FR-034(:349) "회전 대신 직진 … 실패로 처리하지 않고 진행 방향을 안내하거나 구간 시작 위치로 되돌림", Edge Cases(:280).
   - 지금 동작: 교차로가 T자라 직진하면 맞은편 북쪽 보도(`town.ts:72`, z 58~62)에 닿음. 경로에서 2.5 m 벗어날 때 `hint way`는 나오지만, 그 뒤 `leftPath`(6 m)가 보도 닿기(차체 중심 z 57)보다 먼저 오는 것은 차선 가운데(x 118) 근처뿐 — x ≤ 117.3이면 `enteredSidewalk` 실패, x ≥ 117.5면 `leftPath`(탐색 B). 조향이 조금 흔들리는 직진 400회 중 146회가 실패(탐색 I). 실패라 `failStreak`가 오르고 3번이면 시범이 나옴. 저장소 시험 `scenario.test.ts:213-219`는 정확히 x 118로 곧게 가는 경우만 봄.
   - 기대 동작: 회전하지 않고 곧게 가면 차선 안 어느 위치든 방향 안내 뒤 `leftPath`(또는 계속 안내)로 끝나야 함.
   - 해소 방법: (가) 데이터로 — 교차로 북쪽으로 도로를 이어(네거리) 직진이 도로 위에 머물게 하거나, 북쪽 보도를 `leftPath`보다 멀리 두기. 고친 뒤 차선 안 여러 x·조향 흔들림으로 시험 고정. 또는 (나) 사용자가 "T자 교차로에서 직진해 맞은편 보도에 닿으면 보도 진입 실패"를 허용하면 FR-034에 그 예외를 적음(Q2).

## 사용자 확인이 필요한 질문 (리더가 사용자에게)

- **Q1 (FAIL 피드백 2)**: 교차로의 회전 차량 주의하기에서 아이가 멈춰야 하는 곳 — (가) 스펙 문구대로 "회전하기 전"(데이터 재배치) / (나) 지금 구현대로 "우회전한 뒤 회전 방향 횡단보도 바로 앞"(스펙·태스크 문구 수정)
- **Q2 (FAIL 피드백 3)**: 회전 대신 직진 — (가) 늘 실패가 아닌 방향 안내·처음 자리로 되돌림이 되도록 데이터 수정 / (나) T자 교차로라 직진해 맞은편 보도에 닿으면 보도 진입 실패로 보는 것을 허용(FR-034에 예외 명시)
- **Q3 (FAIL 피드백 1, 고치는 방법이 동작 규칙을 바꿀 때만)**: crossing-check에서 보행자가 깜빡이는 신호 때문에 건너지 않기로 한 경우 — 예: (가) 보행자가 다 건널 때까지 보행자 신호 깜빡임을 미룸(data-model 4.12 변경) / (나) "건너는 사람이 없고 보행자 신호가 초록이 아니면" 기다림이 끝난 것으로 봄(사용자 결정 "다 건너고"의 뜻이 넓어짐) / (다) 리더가 정하는 다른 방법

## 탐색 시험 (저장소 밖 복사본, 판정 근거)

| # | 내용 | 결과 |
|---|---|---|
| A2 | crossing-check: 정지 위치 33·35·36·37·38.5 m × 액셀 3틱을 60·100·150·200틱마다 | 36·37·38.5 m × 60·100·150틱 9가지 막힘(단계 1, 보행자 대기, 차 초록). 33·35 m와 200틱 간격은 막힘 없음 |
| H | 막힘 재현과 그 뒤(위 FAIL 1) | 10분 무입력에도 단계 1, `hint wait` 120번, 초록에 출발하면 `earlyStart` |
| B | turning-car: 시작 x를 바꿔 액셀만(직진) | x 117·117.3 → way 뒤 enteredSidewalk(z 57). x 117.5~120 → way 뒤 leftPath |
| I | turning-car: 조향을 20틱마다 ±0.03 흔들며 직진 400회 | leftPath 254, enteredSidewalk 146 |
| C | crossing-check·turning-car 각 400회 × 6,000틱(무작위 / 경로 따라 반쯤 올바른 주행) | 예외 0. go 전 앞 모서리 정지선 너머 0, 차체 원 보도·건물 겹침 0, 보행자 출발 때 보행자 신호가 초록 아님 0, 출발 때 차가 움직이며 4.2 m 안 0, 차 초록 ∧ 보행자 초록 0, 건너는 중 차 초록 0, 안내 없이 완료 0, 경로 끝 전 완료 0. 차체 직사각형(2.4 × 2 m)과 보행자 최소 거리 1.566 m(건너는 중 2.025 m), 앞 모서리의 보도 침범 최대 0.560 m. 위반 분포 crossing-check: enteredSidewalk 1,994·ranRed 203·overStopLine 101·earlyStart 47·enteredCrosswalkWithPedestrian 29(완료 54) / turning-car: enteredSidewalk 2,091·overStopLine 232·earlyStart 29·turnedIntoCrossingPedestrian 23(완료 62). crossing-check 막힘 상태 36회 |
| D | B6 엔진(B6 검증 복사본의 `scenario.ts`)과 지금 엔진, 같은 입력 | 세 상황 × 120회 × 5,000틱 = 1,800,000틱, state·사건 차이 0 |
| E | turning-car 올바른 주행 변형: 앞보기 2.5·3·4·5·6·8 m × 정지 위치(구역 5·50·95%) × 최고 속도 2·4·8 m/s | 앞보기 2.5~6 m 45가지 모두 위반·redirect·closer·way 없이 완료, 보도까지 최소 0.24~1.0 m. 앞보기 8 m(모퉁이를 크게 자름) 9가지는 남쪽 보도 진입 |
| F | turning-car: 앞 끝 40·44·46·50·53 m 목표로 멈춤 | 모두 `hint closer`, 단계 0, 보행자 대기(heading 0°·−0.3°·−4°·−30°·−57°). 정지 구역 53.832~61.832 |
| G | 2구간 시험용 crossing-check(`vi.doMock`)에서 B6 엔진과 지금 엔진 | 구간 넘어감 1번 포함 차이 0, 둘 다 done |

## 변이 시험 (저장소 밖 복사본, 한 번에 한 곳, 대상 시험 = content·scenario·townActors)

잡힘 19건: S16 vehicleGreen 늘 참, S3 움직이면 stoppedTicks 0, S17 go 20 m 일찍 완료, S18 done이 no-op 아님, S9 설명 중 후진 탭 반영, S11 demoReplay `===`, J1 판정점 = 앞 끝 가운데 한 점, J13 옆으로 벗어나도 leftPath 없음, V1 횡단보도 위반 판정 없음, V2 횡단보도 2종을 earlyStart 아래로, D1 crossing-check 정지선 38(횡단보도 앞), D2 대기 위치 도로에서 0.5 m, D5 turning-car 보행자가 횡단보도 앞 가장자리 너머 0.5 m, D6 turning-car violations에서 turnedInto 빼기, D7 turning-car 보행자 신호 빨강 시작, D8 회전 안쪽 모퉁이를 보도로 채움, D9 진행 신호 350틱(깜빡임이 출발보다 먼저), D10 차 신호 자리에 보행자 신호 id, D11 redAtS 38.

생존 2건(tasks.md가 요구한 시험 항목은 아니라 판정에는 넣지 않음, 아래 "이후 태스크" 4): D3 crossing-check 보행자 출발을 pedestrianGreen으로, D4 crossing-check에서 wait(vehicleGreen) 빼기(+ afterStep 1).

## 구현 판단 메모 9건 확인

| # | 메모 | 판단 |
|---|---|---|
| 1 | crossing-check 두 wait 단계 | 사용자 결정 ①과 같음. 두 번째 wait 때 `hint wait`가 한 번 더 나오는 것은 events.md 2장 "단계가 바뀐 틱"대로. 다만 FAIL 1의 막힘이 이 단계 구성에서 생김 |
| 2 | 정지선 = 횡단보도 앞 가장자리 | B6 넘긴 항목 1대로. crossing-check 40 = 40, turning-car 61.832 = 횡단보도 꼭짓점 투영 최소값(#17 `cwNear`와 같음). 두 위반 종류가 실제로 나옴(탐색 C, T056 시험) |
| 3 | turning-car "회전 전 stop" 읽기 | **스펙 문구와 다름 → FAIL 2 / Q1** |
| 4 | turning-car playerStopped, 보행자 신호 초록 고정 | 사용자 결정 ②·T043 규칙과 같음(`townActors.ts:33`, `:83-87`는 차 신호가 없으면 보행자 신호를 바꾸지 않음) |
| 5 | 회전 안쪽 모퉁이 비움 | 올바른 주행이 보도에 닿지 않음(탐색 E). 모퉁이를 보도로 채우면 SC-009가 깨짐(변이 D8)을 확인. 판정은 맞으나 그림 표현은 "이후 태스크" 6 |
| 6 | #17 해석 | 타당(T055 행). 권장 사항은 "이후 태스크" 2·3 |
| 7 | 콘텐츠 전제 시험 | B5 넘긴 후보(신호 종류, redAtS·greenAfterStoppedTicks, 경로 점 2개)를 반영. 깜빡임 전 출발 조건의 한계는 FAIL 1 끝 문단 |
| 8 | blocked 시험을 `vi.doMock`으로 | 타당. 실제 마을은 모든 도로가 보도로 둘러싸여 건물 막힘이 데이터로는 나오지 않음("이후 태스크" 7) |
| 9 | 구현자 변이 시험 | 검증자 변이 21건 중 19건 잡힘으로 확인 |

## 이전 지적 처리 결과 (task-B6_validation.md "이후 태스크로 넘길 것")

| # | 항목 | 결과 |
|---|---|---|
| 1 | 횡단보도 위반 2종이 나올 수 있는 배치 | 처리됨(두 상황 정지선 = 횡단보도 앞 가장자리, T056 시험 통과). 부가 권장(메모 1의 "구간 목록에 없으면 overStopLine으로 내려감"을 data-model ViolationKind 표 아래 한 줄)은 반영 안 됨 — 비필수 |
| 2 | 자리표시에 기댄 wrongWay·blocked 시험 | 처리됨(`scenario.test.ts:213-219`, `:229-252`) |
| 3 | 보도 앞 모서리 걸침(약 0.56 m)과 #17 거리 | 지금 데이터는 안전함: 대기 위치가 경계에서 2 m, 차체 직사각형과 보행자 최소 1.566 m(탐색 C). 다만 #17 시험의 여유 1 m에는 걸침 0.56 m가 들어 있지 않음("이후 태스크" 2) |
| 6 | 구간당 stop 단계 하나 | 새 두 구간 모두 stop 하나. 콘텐츠 검사로는 아직 없음(비필수) |
| 7 | B5에서 넘어온 콘텐츠 검사 후보 | 처리됨(`content.test.ts:160-180`) |
| 4·5·8 | T059·T060 HUD cue, T062 초록인데 earlyStart, T117 자리값 | 이번 범위 밖, 그대로 넘김 |

## 이후 태스크로 넘길 것 (이번 FAIL과 별개)

1. **FAIL 수정 뒤 재검증**: 위 FAIL 1~3을 고치면 validator부터 다시. FAIL 1 재현(탐색 H 순서)과 FAIL 3(차선 안 여러 x)을 저장소 시험으로 고정할 것을 권장
2. **T055 #17 — 보도 여유**: 보도 판정이 차체 원이라 앞 모서리가 보도 안으로 최대 0.56 m 들어감. 시험의 여유 1 m(사람 반지름 + 여유)에 이 걸침을 더하거나(예: 보도 쪽 1 + 0.56 m) 문서에 적어 두기를 권장. 지금 데이터(2 m)는 문제 없음
3. **T055 #17 — 꼭짓점만 봄**: 보행자가 걷는 선분 중간 점은 보지 않음. 지금 데이터는 곧은 경로·곧은 횡단이라 꼭짓점으로 충분함을 확인했으나, 굽은 경로와 비스듬한 횡단이 생기면 선분을 나눠 보기를 권장
4. **T056 — 사용자 결정 고정**: crossing-check의 보행자 출발 playerStopped와 두 번째 wait(vehicleGreen)를 시험이 잡지 못함(변이 D3·D4 생존). 예: "보행자는 차가 정지 구역에서 멈추기 전에는 출발하지 않음", "보행자가 다 건넌 뒤 차 신호가 초록이 되기 전 출발하면 earlyStart"
5. **T058 — 신호 방향**: `SignalDef.pose.heading`의 뜻(신호 얼굴이 보는 방향인지)이 문서에 없음. main·cross 보행자 신호는 −X(대기하는 보행자 반대쪽)를 보고 turn 보행자 신호만 +X(다가오는 차 쪽)를 봄(`town.ts:78-81`). 그릴 때 대기하는 보행자가 자기 신호를 볼 수 있는지 확인
6. **T058·T099 — 회전 안쪽 모퉁이**: x 110~116·z 42~50은 도로도 보도도 아닌 빈 땅이라 차가 판정 없이 지나갈 수 있고, turning-car 핵심 규칙 "길모퉁이에서는 차도에서 멀리"의 모퉁이 보도가 없음. 그림 표현과 회전 반지름(지금 경로 반지름 5 m = 최소 회전 반지름이라 끝까지 꺾어야 따라감, 1 m 넘게 일찍 꺾으면 남쪽 보도 진입)을 T117·T062 플레이 확인에서 볼 것
7. **T062·T099 — 건물 막힘(FR-035)**: 모든 도로가 보도로 둘러싸여 건물에 닿기 전에 보도 진입(실패)이 먼저 옴. `blocked` 경로 문제는 지금 데이터로 나오지 않음
8. **T059·T060 — 같은 cue 두 번**: crossing-check는 두 wait 단계가 이어져 `hint wait`가 두 번 나옴. HUD·음성이 같은 안내를 다시 틀지 정할 것

## 참고 (조치 불필요)

- 순수 로직 규칙: 바뀐 소스·시험에 `three`·DOM·`localStorage`·`Math.random`·`Date`·타이머 사용 0건(시험의 `vi.doMock`은 모듈 바꿔치기뿐)
- turning-car 정지선 값은 `TURN_PATH` 꼭짓점 사이 직선 거리 합(호를 6개 현으로 나눔, `scenarios.ts:90-98`)이고 엔진의 `project`도 같은 꺾은선으로 재므로 서로 맞음
