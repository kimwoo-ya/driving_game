# Task B5 Validation Report

- run / task / dispatch / 실제 도구 / 세션 handle: Orca 미사용 — Claude Code 서브에이전트 spec-implement-validator, 사용자 결정 2026-10-12 "Codex 복구 전까지 Claude 에이전트"(00_context.md 승인 기록)
- FEATURE_DIR / 단계 / 검토 태스크: `/Users/kyw/Documents/git/mine/driving_game/specs/001-kids-driving-safety-game` / implement / B5 = T043~T047 + B4 reviewer 비필수 제안 1번(drivingLesson.test.ts 두 분기 고정)
- revision 요청값 / 읽기 전 / 테스트 후: `f63003dfded3ded6e62537d3b9dcc9e1c014bb2afbd8fff1a0bc3a9f65783e5a` / `f63003dfded3ded6e62537d3b9dcc9e1c014bb2afbd8fff1a0bc3a9f65783e5a` / `f63003dfded3ded6e62537d3b9dcc9e1c014bb2afbd8fff1a0bc3a9f65783e5a` (세 값 같음. 변이 시험 뒤와 보고서 작성 직전에도 다시 계산해 같음)
  - `git status --porcelain` 33줄이 시작 때와 같은 목록. `tasks.md`의 HEAD 대비 차이는 T001~T042 체크 표시 42줄뿐(T043~T047은 아직 `[ ]`)
  - `dist/`(build)는 `.gitignore:7`로 무시되어 snapshot 밖
- 원문 및 코드 근거 (파일:라인): 아래 태스크별 표. 읽은 원문 = AGENTS.md, 역할 파일, orca-cross-review.md(머리 필드·snapshot 규칙), docs/PRD.md, GLOSSARY.md, spec.md(US2, Edge Cases 안전 연습, FR-031~FR-046, FR-091~FR-097, 규칙 배정 표, Key Entities, SC-008~010·021·030·031, Assumptions), data-model.md(0, 2.1 ScenarioDef·SegmentDef·ActorPlan·ViolationKind·PedestrianViewDef·TownDef, 2.2 DriveState·ScenarioAttempt·PedestrianViewState·SignalState/TownPedestrian, 4.3~4.5, 4.10~4.13, 6.3·6.4, 8, Open Issues), contracts/overview.md(공통 규칙·의존 방향), contracts/modules.md(3.1, 3.2, 4.1~4.4, 5, 12), contracts/events.md(1~4, 7.1), contracts/content-data.md(4장), tasks.md(머리말·D1~D8·Phase 4 T043~T060), task-B5_impl.md, 00_context.md, task-B4_review.md 개선 제안 1, task-B4_validation.md(형식). constitution은 빈 양식(사용자 결정, 규칙 없음)
- 실행한 테스트 명령 / 종료 코드 / 결과 (모두 PROJECT_ROOT에서 실행):

| 명령 | 종료 코드 | 결과 |
|---|---|---|
| `python3 ivi-agent-guide/scripts/review-snapshot.py <PROJECT_ROOT> <FEATURE_DIR>` (읽기 전) | 0 | 요청값과 같음 |
| `npm run typecheck` | 0 | 오류 없음 |
| `npm test -- tests/unit/townActors.test.ts` | 0 | 8 passed |
| `npm test -- tests/unit/collision.test.ts` | 0 | 3 passed |
| `npm test -- tests/unit/pedestrianView.test.ts` | 0 | 3 passed |
| `npm test -- tests/unit/ruleRotation.test.ts` | 0 | 5 passed |
| `npm test -- tests/unit/content.test.ts` | 0 | 17 passed |
| `npm test -- tests/unit/drivingLesson.test.ts` | 0 | 5 passed |
| `npm test` | 0 | 13 files, 104 passed |
| `npm run build` | 0 | 성공, 500 kB 청크 경고(기존과 같음) |
| 탐색 시험(저장소 밖 복사본 `scratchpad/b5val/tests/unit/zz_probe.test.ts`, `npx vitest run`) | 0 | 7 passed, 결과는 아래 "탐색 시험" |
| 변이 시험(저장소 밖 복사본, `python3 -I scratchpad/b5val_mutate.py`, 경로가 `/private/tmp/`인지 단언 후 한 군데씩 바꾸고 원래대로 되돌림) | 0 | 20건 중 13건 잡힘, 7건 생존(아래 "변이 시험") |
| snapshot (테스트·변이 시험 뒤) | 0 | 요청값과 같음 |

  - E2E(`npm run test:e2e`)는 화면 변경이 없어 돌리지 않음(요청서의 선택 항목). 구현자 결과 22 passed는 확인하지 않은 값으로 둠

- 검증 상태: COMPLETE
- 역할 판정: PASS (T043·T044·T045·T046·T047·B4 제안 1번 모두 PASS)
- 미해결 질문·지적 / 이전 지적 처리 결과:
  - 이번 묶음 판정을 막는 미해결 질문 0건. 스펙이 콘텐츠 설계로 미룬 결정 2건은 아래 "이후 태스크에서 정할 것"에 적음(T053·T054 몫)
  - 이전 지적: B4는 FAIL 없음. B4 reviewer 비필수 제안 1번은 반영됨(아래 표)

[Speckit-Context] implement phase
  ├ constitution: 빈 양식, 사용자 결정으로 규칙 없음. 기준은 AGENTS.md·PRD·GLOSSARY
  ├ spec: US2 세 안전 연습. 신호·보행자는 차 위치·정지로만 변함(FR-040), 보행자는 멈췄거나 멈출 수 있을 때만 출발·잘못된 행동 본보기 없음(FR-039, FR-094), 차·보행자 신호 구분(FR-042), 깜빡임 안내는 건너기 전만(FR-043), 안내는 틱으로만·입력·건너뛰기 없음(FR-041, SC-021), 추가 규칙 순환(FR-091, SC-031), 건물에 닿으면 멈춤·감속(FR-035)
  ├ plan: 순수 로직 폴더는 three·DOM 없음, 틱 단위, step 함수는 state를 고치지 않음, 계약은 modules.md·events.md
  └ tasks: Phase 4 순수 함수 T043~T047(신호·보행자, 건물 막기, 안내 진행, 규칙 순환, 콘텐츠 #10). 연습 엔진 T048~T051, 문서 맞춤 T052는 다음

## 판정: PASS
## 시도: 1/2 (FAIL 없음)

## 태스크별 판정

| 태스크 | 판정 | 계약·원문 | 코드·테스트 근거 |
|---|---|---|---|
| T043 신호·등장 보행자 | PASS | tasks.md:129, modules.md:137-156(4.2), data-model.md:184-193·389-390·649-651, events.md:36, 사용자 결정(00_context.md 승인 기록 "T043 신호 모습") | 시그니처가 modules.md:142-147과 같음(`townActors.ts:28`, `:65-72`). 신호는 `frontS`·`stoppedTicks`·`drive.speed`·건너는 사람 여부로만 바뀜(`:82-92`), 시각·타이머 없음(grep 0건). 차 초록 → 노랑(`frontS ≥ redAtS`, `:90`) → 빨강(`:91`) → 초록(`stoppedTicks ≥ greenAfterStoppedTicks` ∧ 보행자 신호 빨강·없음 ∧ 건너는 사람 없음, `:92`), 보행자 빨강 → 초록 → 깜빡임 → 빨강(`:84-86`). 보행자 출발은 출발 조건 ∧ 보행자 신호 초록(또는 없음) ∧ (`speed === 0` ∨ 정지선까지 거리 ≥ 최고 속도 제동 거리 + 1 m)(`:103`, `:108-109`, `:25`). 건너는 사람은 신호와 무관하게 계속 걸음(`:107`). 자세는 `CharacterPose`만(`:20`, `:38`, `:54`, `:58`, `:113`). `signalChanged`는 바뀐 신호마다(`:95-100`). 테스트 8건: 신호 순서·이벤트(`townActors.test.ts:47-64`), FR-042(`:66-72`), 자세·출발 시점(`:74-88`), 주기 없음 36,000틱(`:90-114`), 제동 거리 경계(`:116-139`), FR-043(`:141-157`), 보행자 신호 없는 구간(`:159-169`), 차 신호 없는 구간·깜빡임 시작(`:171-181`). 무작위 탐색 1,500회 × 3,000틱에서 불변식 위반 0(아래 P1). "redAtS를 지나면 빨강"은 사용자 결정대로 노랑을 거침 |
| T043 확인 항목 "ActorPlan으로 세 상황 표현" | PASS(확인 완료, 문서 반영은 T052) | data-model.md:1000(Open Issues 1), tasks.md:129·138 | 형식 변경은 `ActorPlan.pedestrianSignal: SignalId \| null` 하나(`scenarios.ts:26`), 데이터는 signal-wait `'main-pedestrian'`(`:119`), 자리표시 둘 `null`(`:94`). `stepTownActors` 시그니처는 그대로. 세 상황 대응(구현 메모 2): signal-wait = 차 신호 + 짝 보행자 신호·`pedestrianGreen`, crossing-check = 신호 없음·`playerStopped`, turning-car = 보행자 신호만(초록 고정, `townActors.ts:33`)·`pedestrianGreen`. 탐색 시험 P3·P4로 세 형태 모두 동작 확인. 판단: 구간의 차 신호와 짝인 보행자 신호를 가리킬 곳이 없던 빈칸을 한 필드로 메운 것이라 타당함. 다만 crossing-check·turning-car 실제 데이터(T053·T054)에서 정할 것이 남음(아래 "이후 태스크에서 정할 것") |
| T044 `blockByAreas` | PASS | tasks.md:130, modules.md:100-116(3.2), FR-035, FR-011 | 시그니처가 modules.md:104와 같음(`collision.ts:12`). 차체 원(`DRIVING_SPEC.bodyRadius`)과 사각형 겹침만 봄(`:5-9`), 길이·모델 크기·탑승객 없음. 겹치면 이전 자리 + `speed = 0` + `hit: true`, heading은 `next` 값 그대로(충돌이 회전을 더하지 않음, `:14`). 튕김·회전 없음. 테스트 3건(`collision.test.ts:11-25`): 막힘·heading·hit, 안 닿음, 반지름 경계 ±0.01 m. 변이 M17(heading을 prev로)·M18(속도 유지) 잡힘 |
| T045 보행자 시점 안내 함수 | PASS | tasks.md:131, modules.md:212-229(5장), events.md:46-57(3장), data-model.md:374-383·560-571(4.5) | 시그니처 3개가 modules.md:217-220과 같음(`pedestrianView.ts:17`, `:22-25`, `:40`). `introTicks`·`durationTicks`(틱)로만 진행, 음성과 무관(`:29`). 카드 첫 틱에 `cardShown`(`:35`), 마지막 카드 끝 틱에 `ended` 1회 후 no-op(`:26`, `:34`). 운전 입력 매개변수 없음, 내보내는 함수는 start·step·rewind뿐. rewind `'card'`는 다음 틱에 그 카드 `cardShown` 다시(`:41`), `'intro'`는 `card −1`부터 같은 rules·extrasCount. 테스트 3건(`pedestrianView.test.ts:23-54`). 변이 M14~M16 잡힘 |
| T046 규칙 순환 | PASS | tasks.md:132, modules.md:120-135(4.1), data-model.md:967-994(8장), FR-091 | 시그니처가 modules.md:123-127과 같음(`ruleRotation.ts:6`, `:11`, `:16-20`, `:29`). `isReplay` = 이번 실행 완료 ∨ 저장된 완료(`:12`). `pickRules` = 핵심 전부(배열 순서) + replay면 cursor부터 `k = min(EXTRAS_PER_VIEW, 추가 수)`개, 끝에서 처음으로, 한 안내에 중복 없음(`:21-25`). `advanceExtraCursor` = `(cursor + extrasCount) % 추가 수`, 추가 0개면 0(`:30-31`). `RunState`는 `import type`(`:1`). `EXTRAS_PER_VIEW = 2`는 자리값(data-model Open Issues 2). 테스트 5건(`ruleRotation.test.ts:13-55`, 추가 0개는 `vi.doMock`). 변이 M19·M20 잡힘 |
| T047 콘텐츠 #10 | PASS | tasks.md:133, content-data.md:101(#10), SC-031 | `content.test.ts:62-79`: 세 상황 각각 처음(isReplay 거짓) = 핵심만·추가 0, `ceil(추가 수 / k)`번 순환하면 매번 핵심 전부 앞에 있고 추가 규칙 전부가 1번 이상 |
| B4 reviewer 제안 1번 | PASS(반영됨) | task-B4_review.md 개선 제안 1, modules.md:178("후진 탭") | `drivingLesson.test.ts:72-85`: 조향·액셀·브레이크 단계에서 멈춘 채 후진 탭 1번 → `forward`(`:75`, `:78`, `:84`), 자연 감속으로 선 것은 브레이크 단계 통과 아님(`:81-83`), 선 뒤 브레이크 1틱도 통과 아님(`:85`). B4 변이 m1·m2가 잡히는 시험. 소스(`drivingLesson.ts`)는 바꾸지 않음 |

## 구현 판단 메모 9건 확인

| # | 메모 | 계약과 충돌 | 판단 |
|---|---|---|---|
| 1 | 신호 모습과 바뀌는 조건 | 없음 | 사용자 결정(차 초록 → 노랑 → 빨강 → 초록, 보행자 빨강 → 초록 → 깜빡임 → 빨강, 위치·멈춘 시간·보행자 상태로만)과 data-model.md:649-650 순서대로. 노랑 구간은 `redAtS`(정지선까지 제동 거리 + 여유 이상 앞)에서 정지 구역 시작까지라 멈출 수 있는 거리에서만 노랑이 됨. 탐색 P1에서 노랑인 채 정지선을 넘은 틱 0 |
| 2 | `ActorPlan.pedestrianSignal` 추가 | 없음(형식 변경은 T043 확인 항목이 허용, 문서 반영은 T052) | 타당. 이후 정할 것은 아래 |
| 3 | `TownPedestrian.ticks` 추가 | data-model.md:390 표에 없는 필드 | 동작에 필요한 내부 경과값. T052에서 표에 더하면 됨 |
| 4 | 보행자 출발 조건, 기준점 `stopLineS` | 없음 | modules.md:153 "멈췄거나 멈출 수 있는 거리(최고 속도 제동 거리 + 여유)"와 같음. 출발 직전까지 매 틱 다시 확인하고, 조건이 깨지면 `idle`로 돌아가 처음부터(건너는 도중 멈춤 없음, FR-043). 기준점이 정지선인 것은 잘못된 행동을 정지선에서 판정하는 계약(modules.md 4.4)과 맞음 |
| 5 | `stoppedTicks`는 한 시도 안에서 줄지 않아야 함(T048에 넘김) | 계약에 정의 없음 | **이 약속이 깨지면 실제로 문제가 생김**: 탐색 P5에서 `stoppedTicks`를 "움직이면 0"으로 넣으면 진행 신호 뒤 다시 노랑이 되는 경우 26건. T048이 따라야 하고 T052에서 modules.md 4.2에 적어야 함 |
| 6 | 구간이 쓰지 않는 신호는 state에 없음 | 없음 | data-model.md:369 "구간 시작 상태"와 맞음. 기본 표시는 T058 |
| 7 | 막히면 이전 자리 + `speed = 0` | 없음 | modules.md:114 "위치를 경계 앞에 두고 속도만 줄임", FR-035 "멈추거나 감속"과 맞음 |
| 8 | `card = rules.length`(끝남), `cardTicks = -1`(되감기 직후) | data-model.md:380-381 설명 범위 밖의 값 | 동작은 계약대로. 렌더러·HUD(T058·T059)가 이 두 값을 만나므로 T052에서 적는 것을 권장 |
| 9 | 변이 시험 | — | 검증자 변이 시험 결과는 아래. 구현자 보고와 달리 보행자 출발 쪽 1건(M8)이 생존 |

## 탐색 시험 (저장소 밖 복사본, 판정 근거 보강용)

| # | 내용 | 결과 |
|---|---|---|
| P1 | signal-wait, 무작위 주행 1,500회 × 3,000틱(속도·브레이크 위치·대기 길이·잠깐 굴러가기를 섞음, `stoppedTicks`는 정지 구역에서 처음 멈춘 뒤 계속 증가) | 보행자 출발 1,276회. 차 초록 ∧ 보행자 초록 0, 차 초록 중 건너는 사람 0, 노랑인 채 정지선 통과 0, 출발 시 (멈춤 ∨ 제동 거리 + 여유 밖) 위반 0, 초록 아닐 때 출발 0, 건너다 멈추거나 대기로 돌아감 0 |
| P2 | 차 신호만 있고 보행자 신호가 없는 구간 + `playerStopped` | 정상 흐름은 건너기 끝난 뒤 차 초록. 다만 차 초록인 상태에서 기다리는 보행자가 있으면 바로 건너기 시작함(P2b). 지금 데이터·계획(메모 2)에는 이 조합이 없음 → T052·T055 확인 사항 |
| P3 | turning-car 형태(차 신호 없음, 보행자 초록 고정, `pedestrianGreen`), 차가 3 m/s로 접근 | 구간 시작 직후 보행자가 행동을 시작해 180틱 뒤(차 위치 s = 10.3) 건너기 시작. 차가 천천히 오면 도착 전에 다 건넘 → T054 확인 사항 |
| P4 | crossing-check 형태(신호 없음, `playerStopped`) | 차가 움직이는 동안 대기, 정지 구역에서 멈춘 뒤 180틱(행동 4개)에 건너기 시작, 끝까지 건넘 |
| P5 | `stoppedTicks`가 움직이면 0으로 돌아가는 경우 | 진행 신호 뒤 다시 노랑 26건(메모 5의 약속이 꼭 필요함) |
| P6 | `introTicks = 0` | 첫 `cardShown`이 1번째 틱(카메라 이동 상태가 최소 1틱 있음). 데이터가 0을 쓸 때만 해당, 영향 작음 |
| P7 | 보행자 경로 점 1개 | `initActors`가 예외를 던짐(`townActors.ts:37`). 콘텐츠 검사로 막으면 됨 |

## 변이 시험 (저장소 밖 복사본, 한 번에 한 곳)

잡힘 13건: M7 깜빡임에도 출발, M9 제동 여유 제거, M10 건너다 멈춤, M11 진행 신호 뒤 다시 노랑, M12 초기 보행자 신호 초록, M13 건너는 중 차 초록, M14~M16 안내 진행, M17·M18 막기, M19·M20 규칙 순환.

생존 7건(모두 `townActors.ts`, 판정에는 영향 없음 — 코드는 계약대로 동작하고 tasks.md:129가 요구한 시험 항목은 모두 있음. 시험을 더 촘촘히 할 여지로 reviewer에게 넘김):

| # | 바꾼 것 | 왜 안 잡히나 | 영향 |
|---|---|---|---|
| M1 | 차 초록 조건 `goAt` → `goAt − 100`(`:92`) | 보행자 신호 있는 구간은 보행자 신호가 막아 주고, 보행자 신호 없는 구간 시험(`test:166-168`)은 `stoppedTicks = GO_AT` 한 점만 봄 | "멈춘 뒤 greenAfterStoppedTicks 전에는 초록 아님" 아래쪽 경계가 고정되지 않음 |
| M2 | 깜빡임 → 빨강 `goAt` → `goAt − 1`(`:86`) | 시험 흐름에서 보행자가 goAt 뒤까지 건너고 있어 가려짐 | 위와 같은 경계 |
| M3 | 깜빡임 → 빨강에서 "건너는 사람 없음" 제거(`:86`) | 차 초록은 건너는 사람 조건이 따로 막음 | 스펙 위반 아님(건너는 사람은 계속 걸음) |
| M4 | 보행자 빨강 → 초록에서 `stoppedTicks < goAt` 제거(`:84`) | 다른 조건 때문에 중복 | 영향 없음 |
| M5 | 노랑 → 빨강에서 `speed === 0` 제거(`:91`) | 시험이 정지 구역 밖에서 멈추는 경우를 안 봄 | 정지 구역 앞에서 멈추면 노랑이 오래 남음 |
| M6 | 노랑 → 빨강 지점 `stopZone.fromS` → `stopLineS`(`:91`) | 시험 `:56`은 "fromS 이후"만 봄 | 빨강 시점이 늦어짐 |
| M8 | `playerStopped` 출발 조건 `stoppedTicks > 0` → `≥ 0`(`:109`) | `playerStopped` 보행자가 "차가 멈추기 전에는 출발 안 함"을 보는 시험이 없음 | crossing-check(T053)가 기댈 조건이 고정되지 않음 |

## 이후 태스크에서 정할 것 (스펙이 콘텐츠 설계로 미룬 결정, 이번 판정과 무관)

1. **crossing-check의 신호 구성(T053)**: tasks.md:139는 "town.ts에 횡단보도 지점 구역·보행자 신호"를 더한다고 적었고, 구현 메모 2는 crossing-check를 "신호 없음"으로 그림. 보행자 신호를 둘 경우 (가) 차 신호와 짝으로 두면 `wait` 조건을 `vehicleGreen`으로 하지 않는 한 "보행자는 다 건넜지만 차 신호는 아직 빨강"인 때 출발이 인정될 수 있음(crossing-check의 잘못된 행동 목록에 `ranRed`·`earlyStart`가 없으면), (나) 차 신호 없이 두면 보행자 초록 고정. spec Assumptions가 "신호 구성은 콘텐츠 설계에서 정함"으로 두었으므로 T053에서 정할 일
2. **turning-car 보행자 출발 시점(T054)**: `pedestrianGreen` + 초록 고정이면 구간 시작 직후 보행자가 건너기 시작해, 차가 느리면 도착 전에 다 건넘(P3). US2-6("보행자가 회전 방향 횡단보도를 건너는 중 들어가려 하면")을 재현하려면 `playerStopped`를 쓰거나 위치·거리를 맞춰야 함. 지금 형식에는 "차가 어디까지 오면 출발" 같은 접근 거리 조건이 없음

## T052가 문서에 반영할 것

1. data-model.md 2.1 `ActorPlan`(:184-193): `pedestrianSignal: SignalId | null` 추가와 뜻(구간 차 신호와 짝, 차 신호가 없으면 초록 고정), "잠정 형식" 표시 제거
2. data-model.md Open Issues 1(:1000): 확인 결과(세 상황 대응 표)로 해결 처리
3. data-model.md 2.2 `TownPedestrian`(:390): `ticks` 필드 추가
4. data-model.md 2.2 `PedestrianViewState`(:380-381): `card = rules.length`(끝남), `cardTicks = −1`(`'card'` 되감기 직후) 값 설명(구현 메모 8)
5. data-model.md 4.12(:649-651): 노랑을 거치는 차 신호 조건(노랑 = `redAtS` 통과, 빨강 = 멈춤 ∨ 정지 구역 진입, 초록 = `greenAfterStoppedTicks` ∧ 보행자 신호 빨강 ∧ 건너는 사람 없음), 보행자 신호 조건(`FLASH_TICKS` 전부터 깜빡임), 보행자 행동 준비가 조건이 깨지면 처음부터라는 점
6. modules.md 4.2(:151): 시그니처 "잠정" → 확정. `stoppedTicks`의 뜻("정지 구역에서 처음 멈춘 뒤 지난 틱, 한 시도·구간 안에서 줄지 않음")을 계약에 적기 — T048이 이를 따라야 함(P5)
7. data-model.md 6.4 상수 표·Open Issues 2: 새 자리값 `POSE_TICKS`(45), `WALK_SPEED`(1.2 m/s), `FLASH_TICKS`(180), `STOP_MARGIN`(1 m) 추가
8. (T052 또는 T055) 콘텐츠 검사 후보: 차 신호가 있으면 `redAtS`·`greenAfterStoppedTicks`가 null 아님, `stopLineS − redAtS ≥ 최고 속도 제동 거리 + STOP_MARGIN`, `redAtS ≤ stopZone.fromS`, `greenAfterStoppedTicks − FLASH_TICKS > poses 수 × POSE_TICKS`(보행자가 깜빡임 전에 출발할 수 있음), 보행자 경로 점 2개 이상(P7), 보행자가 있는 구간에서 "차 신호만 있고 보행자 신호 없음" 조합 피하기(P2)
9. (참고) tasks.md:129 문구 "최고 속도 제동 거리 + 여유 **안쪽**일 때만 crossing"은 반대로 읽힐 수 있음. 계약(modules.md:153 "멈출 수 있는 거리")이 기준이며 구현은 계약대로. 고칠지는 리더 판단

## 참고 (조치 불필요)

- `SignalState.light`가 차·보행자 값을 합친 한 타입인 것은 B2(T020)에서 이미 PASS된 선언 그대로
- `blockByAreas`가 `next.heading`을 유지하므로 막힌 채 조향·액셀을 누르면 제자리에서 아주 조금씩 방향이 바뀜(틱당 약 0.0002 rad). 충돌이 회전을 만드는 것은 아니며 시험(`collision.test.ts:14`)이 이 동작을 고정함
- 순수 로직 폴더 규칙(overview.md 공통 규칙 1·3·7): 변경 파일에 `Date.now`·`setTimeout`·`Math.random`·`three`·DOM 사용 0건, 받은 state를 고치지 않음

## FAIL 피드백

없음.
