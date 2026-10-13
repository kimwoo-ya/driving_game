# Task B6 Validation Report

- run / task / dispatch / 실제 도구 / 세션 handle: (Orca 미사용 — Claude Code 서브에이전트 spec-implement-validator, 사용자 결정 2026-10-12 "Codex 복구 전까지 Claude 에이전트", 00_context.md 승인 기록)
- FEATURE_DIR / 단계 / 검토 태스크: `/Users/kyw/Documents/git/mine/driving_game/specs/001-kids-driving-safety-game` / implement / B6 = T048~T052 + B5 reviewer 비필수 제안 1·2·3·5
- revision 요청값 / 읽기 전 / 테스트 후: `7b793710b69485b991cad387ff10770ecc16b03fd5d6d7081e3d0b805c847267` / `7b793710b69485b991cad387ff10770ecc16b03fd5d6d7081e3d0b805c847267` / `7b793710b69485b991cad387ff10770ecc16b03fd5d6d7081e3d0b805c847267` (세 값 같음)
  - `git status --porcelain` 34줄, 시작 때와 같은 목록. `tasks.md`의 HEAD 대비 차이는 체크 표시뿐(체크 칸을 지우고 비교한 `diff` 결과 0), 체크된 것은 T001~T047(T048~T052는 아직 `[ ]`)
  - `src/` 변경 범위: B5 검증 복사본(`scratchpad/b5val/src`)과 비교해 바뀐 파일은 `src/practice/scenario.ts`, `src/practice/townActors.ts`, `src/sim/collision.ts`, `src/content/scenarios.ts` 4개뿐(`diff -rq`). `tests/`는 `scenario.test.ts` 신설과 `townActors.test.ts`·`collision.test.ts` 수정뿐. 구현 로그의 변경 목록과 같음
- 원문 및 코드 근거 (파일:라인): 아래 태스크별 표. 읽은 원문 = AGENTS.md, 역할 파일, orca-cross-review.md(머리 필드·snapshot 규칙), docs/PRD.md, GLOSSARY.md, spec.md(Clarifications, US2 수용 시나리오 1~19, Edge Cases 안전 연습, FR-017·019·031~043, SC-008·010), data-model.md(0장, 2.1 ScenarioDef·SegmentDef·ActorPlan·ViolationKind/RouteIssue·PedestrianViewDef·TownDef·DrivingSpec, 2.2 DriveState·ScenarioAttempt·PedestrianViewState·SignalState/TownPedestrian, 4.3·4.4·4.5·4.6·4.12, 6.3·6.4, Open Issues), contracts/overview.md(공통 규칙·의존 방향), contracts/modules.md(3.1·3.2·4.1~4.4·5·12장), contracts/events.md(1~3장·6장·7.1), contracts/content-data.md #17, plan.md(모듈 표), `_workspace/01_architect_architecture.md:76·303`, tasks.md(Phase 4 T043~T062), task-B6_impl.md(판단 메모 9건), 00_context.md(승인 기록 "T049 정지선 설명"·"T043 신호 모습"), task-B5_validation.md, task-B5_review.md. constitution은 빈 양식(사용자 결정, 규칙 없음)
- 실행한 테스트 명령 / 종료 코드 / 결과 (모두 PROJECT_ROOT에서, 종료 코드는 `set -o pipefail`로 확인):

| 명령 | 종료 코드 | 결과 |
|---|---|---|
| `python3 ivi-agent-guide/scripts/review-snapshot.py <PROJECT_ROOT> <FEATURE_DIR>` (읽기 전) | 0 | 요청값과 같음 |
| `npm run typecheck` | 0 | 오류 없음 |
| `npm test -- tests/unit/scenario.test.ts` | 0 | 1 file, 17 passed |
| `npm test -- tests/unit/townActors.test.ts tests/unit/collision.test.ts` | 0 | 2 files, 11 passed |
| `npm test` | 0 | 14 files, 121 passed |
| `npm run build` | 0 | 성공, 500 kB 청크 경고(기존과 같음). `dist/`는 `.gitignore:7` 대상 |
| 탐색 시험(저장소 밖 복사본 `scratchpad/b6val/tests/unit/zz_probe.test.ts`, `npx vitest run`) | 0 | 6 passed, 결과는 아래 "탐색 시험" |
| 변이 시험(복사본, `python3 -I scratchpad/b6val_mutate.py`, 경로가 `/private/tmp/`이고 저장소 밖인지·작업 위치가 복사본인지 단언, 한 곳씩 바꾸고 되돌림) | 0 | 33건 중 25건 잡힘, 8건 생존(아래 "변이 시험"). 끝에 복사본 `src`와 저장소 `src`가 같음(`diff -rq` 출력 없음) |
| snapshot (테스트·탐색·변이 시험 뒤) | 0 | 요청값과 같음 |

  - E2E(`npm run test:e2e`)는 실행하지 않음(요청서의 선택 항목, `src/app/flow.ts`·UI 변경 없음). 구현자 결과 22 passed는 확인하지 않은 값으로 둠
  - 복사본의 Vite 캐시는 복사본 안(`b6val/.vitecache`)으로 돌려 저장소 `node_modules`에 쓰지 않음

- 검증 상태: COMPLETE
- 역할 판정: PASS (T048·T049·T050·T051·T052, B5 제안 1·2·3·5 모두 PASS)
- 미해결 질문·지적 / 이전 지적 처리 결과:
  - 이번 묶음 판정을 막는 미해결 질문 0건. 판단 메모 5(redirect 뒤 hint 없음)는 지금 계약의 결함이 아니라 T059·T060 항목으로 봄(아래 "판단 메모 9건")
  - 이전 지적: B5 validator가 남긴 "`stoppedTicks`는 한 시도 안에서 줄지 않아야 함(T048이 따라야 함)" → 코드가 따름(`scenario.ts:275`, `:283`, 탐색 P1·P2 감소 0건), modules.md 4.2(`:154`)와 data-model.md 2.2(`:369`)에 적힘. 다만 저장소 시험은 이 성질을 고정하지 않음(변이 S3 생존, 비필수 제안 2)
  - B5 validation "T052가 문서에 반영할 것" 1~7은 모두 반영(아래 T052 행). 8(콘텐츠 검사 후보)은 T055 몫으로 아직 없음, 9(tasks.md:129 "안쪽" 문구)는 고치지 않음(리더 판단 사항, 계약 modules.md:156이 기준이라 동작 영향 없음)

```
[Speckit-Context] implement phase
  ├ constitution: 빈 양식(사용자 결정, 규칙 없음). 기준은 AGENTS.md·PRD·GLOSSARY
  ├ spec: US2 세 안전 연습. 완료 = 안내된 정지·대기·출발을 직접 + 보행자 시점 안내 끝까지(FR-032, SC-008),
  │       잘못된 행동은 직전 멈춤·구간 처음부터(FR-033, FR-036, FR-037), 경로 문제는 실패 아님(FR-034, FR-035),
  │       무입력은 재안내만(FR-031), 안내 중 운전 입력 무시·건너뛰기 없음(FR-041, US2-14), 신호·보행자는 차 위치·정지로만(FR-040)
  ├ plan: 순수 로직 폴더(three·DOM·시각·무작위 없음), 틱 단위, step은 받은 state를 고치지 않음, 구역 판정은 공통 차체 원
  └ tasks: B6 = T048 운전 단계, T049 잘못된 행동, T050 경로 문제, T051 보행자 시점 안내 연결, T052 ActorPlan 문서 확정
          + B5 제안 1(시험 다섯 곳)·2(townActors 가독성)·3(modules.md 12장 상수)·5(60 → TICK_HZ)
```

## 판정: PASS
## 시도: 1/2 (FAIL 없음)

## 태스크별 판정

| 태스크 | 판정 | 계약·원문 | 코드·테스트 근거 |
|---|---|---|---|
| T048 운전 단계 | PASS | tasks.md:134, modules.md:183-213(4.4), events.md:111-122(7.1의 1·2·3·5·6·7), data-model.md:533-551(4.3), FR-031·032, SC-008 | 시그니처가 modules.md:195-199와 같음(`scenario.ts:141-147`, `:295`). 상수 3개 내보냄(`:23-25`). 7.1 순서대로: 1 후진 탭(`:230`) → 2 후보 = `stepVehicle` → `blockByAreas`(`:232-234`) → 3 `stepTownActors`·`signalChanged`(`:236-244`) → 5 후보 적용·경로 문제(`:259-280`) → 6 단계 판정(`:282-285`) → 7 무입력 재안내(`:287-292`). `s`는 차체 앞 끝 가운데를 경로에 투영(`:84-96`, `:99-116`, `:234`). stop = `speed 0 ∧ stopZone 안`, wait = `speed 0 ∧ 조건`, go = 앞 끝이 경로 끝(`:170-178`), 지금 단계만 봄. 시작·단계 변경 hint(`:146`, `:204`, `:220`), 무입력 `IDLE_HINT_TICKS`마다 repeat hint(`:289-290`). gearTap은 driving에서만(`:230`, 다른 phase는 무시 `:297-314`). 완료는 `next()`의 마지막 구간·단계 ∧ `viewDone`(`:222-223`)뿐. done은 같은 state·빈 이벤트(`:297-298`). 시험 5건(`scenario.test.ts:57-95`): 시작 상태, SC-008 3상황 × 4패턴 × 36,000틱 완료 0, 끝 지점·다음 단계 조건만으로 진행 안 됨, 무입력 재안내 3번·실패 아님, 후진 탭 |
| T049 잘못된 행동 | PASS | tasks.md:135, modules.md:205-206·210, events.md:39-41·116·121, data-model.md:196-207(표, 사용자 결정 반영)·553-562(4.4), 00_context.md:49 사용자 결정, FR-033·036·037, SC-010 | 후보에서 판정(`:246`), 걸리면 후보 버림·이전 자리 `speed 0`·`explaining`·`violation`이 그 틱 마지막(`:247-257`). 정지선·횡단보도 판정점 = 앞쪽 두 모서리(`:84-96`, `:152`, `:155`, `:159`). 정지선 분류가 사용자 결정과 같음: go 전 단계에서 모서리가 정지선을 넘으려 할 때 wait → earlyStart, stop ∧ 차 신호 노랑·빨강 ∧ `!stoppedOnce` → ranRed, 그 밖 overStopLine(`:158-164`). 여럿이면 data-model 표 순서(`:66-73`)에서 그 구간 `violations`에 있는 위쪽 하나(`:166`). 보도는 차체 원(`overlaps`, `:165`) — 설계대로(`01_architect_architecture.md:76` "공통 차체 원 … 차-구역 판정(도로·보도·건물·트랙 벽)", plan.md:197). explaining은 틱만 세고 차·신호·보행자·입력·gearTap 그대로(`:299-301`), `EXPLAIN_TICKS`를 채운 틱에 4.4 복원(차 `restingAt(start)`·단계 0·신호·보행자 처음·`idleTicks`·`phaseTicks` 0, `viewDone`·`picked` 유지, `failStreak + 1`) → `segmentReset` → (`failStreak ≥ DEMO_AFTER_FAILS`) `demoReplay` → `hint`(첫 단계)(`:302-306`, `:123-139`). 시험 4개 `it`(`scenario.test.ts:101-150`)이 tasks.md의 다섯 항목(4종 각각 violation → segmentReset, 어느 틱에도 판정점이 경계를 넘지 않음, 위반 틱 이벤트 순서, 재시도 뒤 restingAt·신호·보행자·viewDone 유지, failStreak·demoReplay)을 모두 다룸 |
| T050 경로 문제 | PASS | tasks.md:136, modules.md:207, events.md:37-38·117, data-model.md:208-217·546·947, FR-034·035 | 실패 아님(failStreak 그대로). stoppedTooFar = stop 단계에서 움직이다 멈춘 틱 ∧ `s < stopZone.fromS` → `hint closer`(`:279`), wrongWay = 차체 중심이 경로에서 `WAY_OFFSET`을 넘어간 틱에 `hint way` 1번(`:280`), leftPath = 벗어남 > `LEAVE_OFFSET` ∨ `s < −LEAVE_BACK` → `redirect`, blocked = 건물에 닿고 진행 없는 틱이 `IDLE_HINT_TICKS`번 → `redirect`(`:264-269`). redirect는 4.4대로 구간 처음(`atSegmentStart`, failStreak 그대로) 뒤 그 틱 끝(7.1-5). 시험 4건(`scenario.test.ts:154-181`). 상수 3개는 data-model.md 6.4(`:947`)·Open Issues 2(`:1010`)에 적힘 |
| T051 보행자 시점 안내 연결 | PASS | tasks.md:137, modules.md:208, events.md:42-44·56-57·122, data-model.md:538·541-542·564-575(4.5), FR-032·041, US2-14·15, 02 결정 B10 | `(segment, afterStep)` 단계를 마친 틱 ∧ `!viewDone`이면 `pedestrianView`·`speed 0`(gear 유지)·`pedestrianViewStart(rules = picked.rules)`(`:184-194`). 안내 중 입력·gearTap 무시, `cardShown`·`ended`를 그대로 전달(`:308-313`). `ended` 틱에 `viewDone = true` 뒤 남은 단계 `hint` 또는 `done` + `scenarioCompleted`(`:313`, `:199-224`). `viewDone`은 구간 재시도·redirect에도 유지(`:123-126`) → 같은 시도에서 한 번만. `afterStep`은 0부터 센 "마친 단계" 번호(메모 8)이고 콘텐츠 검사 #16(`content.test.ts:118-121`)이 범위를 막음. 시험 4건(`scenario.test.ts:185-220`): 올바른 행동으로 완료와 이벤트 순서, 안내 중 입력·탭 무시(US2-14), 안내 끝 전 완료 아님(US2-15), 재시도 뒤 안내 다시 없음(B10) |
| T052 ActorPlan 문서 확정 | PASS | tasks.md:138, task-B5_validation.md "T052가 문서에 반영할 것" 1~7 | 문구 검사: `grep -n 잠정 data-model.md contracts/modules.md` → data-model.md:245(`laps` "2(잠정)")·:1010("바퀴 수(2 잠정)") 2곳만 남음 = 정상. ActorPlan 블록(`data-model.md:184-193`, `pedestrianSignal` 추가·"형식 확정"), SegmentDef `plan` 행(`:176`), Open Issues 1 해결(`:1009`), modules.md 4.2 시그니처 행 "확정(T043)"(`modules.md:153`)과 `stoppedTicks` 약속 행(`:154`). 그 밖에 ScenarioAttempt 새 필드 3개(`data-model.md:369-371`), PedestrianViewState `card`·`cardTicks` 값(`:384-385`), TownPedestrian `ticks`(`:394`), 4.12 신호·보행자 조건(`:654-655`, 코드 `townActors.ts:81-117`와 대조해 같음), 6.4 상수(`:943-947`), Open Issues 2 상수(`:1010`), ViolationKind 표 문구(`:202-204`, 사용자 결정과 같음), modules.md 3.2 `overlaps`(`:105-106`, 코드 `collision.ts:5`와 같음). 문서의 시그니처·필드가 코드와 같음(`scenarios.ts:23-32`, `townActors.ts:15-23`·`:65-72`, `scenario.ts:32-50`) |
| B5 제안 1 (시험 다섯 곳) | PASS(반영됨) | task-B5_review.md 개선 제안 1 | M8 `townActors.test.ts:144-152`, M6 `:58`, M5 `:59-61`, M1 `:182`, C2 `collision.test.ts:20`. 같은 다섯 변이를 지금 코드에 다시 걸어 모두 잡힘(아래 변이 표 M8·M6·M5·M1·C2) |
| B5 제안 2 (townActors 가독성) | PASS(동작 같음) | task-B5_review.md 개선 제안 2 | B5 검증 복사본과 `diff`: 이름 바꾸기(`carLight`·`walkLight`·`nextCar`·`nextWalk`, `townActors.ts:78-93`), `nv!`/`np!` → `(… ) ?? s.light`(`:99`), 계산 순서가 동시 초록을 막는다는 주석(`:88-89`)뿐. 같은 id면 이전 값이 반드시 정의되므로 결과가 같음. townActors 시험 8건 그대로 통과 |
| B5 제안 3 (modules.md 12장) | PASS | task-B5_review.md 개선 제안 3 | `modules.md:451`에 `POSE_TICKS`, `WALK_SPEED`, `FLASH_TICKS`, `STOP_MARGIN` 추가, 코드 `townActors.ts:9-12`와 같음 |
| B5 제안 5 (`60` → `TICK_HZ`) | PASS | task-B5_review.md 개선 제안 5 | `townActors.test.ts:13`, `:38` |

## 확인 요청 항목별 결과

| 항목 | 결과 | 근거 |
|---|---|---|
| events.md 7.1 틱 안 순서 | 맞음 | 위 T048 행. 위반 틱은 신호 변화 뒤 `violation`이 마지막(시험 `:129-135`, 탐색 P1 `violationNotLast` 0), redirect도 그 틱 마지막(P1·P2 `redirectNotLast` 0) |
| 완료 = 모든 단계 ∧ viewDone(FR-032, SC-008) | 맞음 | `scenario.ts:222-223`. 탐색 P1·P2 완료 102회 모두 `viewDone`·`done`이고 앞 끝이 경로 끝, 이벤트 없이 done 0 |
| 후보 판정으로 go 전 앞 모서리가 정지선 너머·차체가 보도에 있는 틱 0(FR-033, FR-036) | 맞음 | 시험 `:119-127`. 탐색 P1(signal-wait 400회 × 6,000틱)·P2(자리표시 300회): 정지선 너머 0, 차체 원이 보도와 겹친 틱 0 |
| explaining 중 멈춤·입력 무시 → 4.4 복원(viewDone 유지, failStreak + 1, demoReplay) | 맞음 | `:299-307`. 탐색: 설명 중 차·신호·보행자 변화 0, 설명 길이 `EXPLAIN_TICKS` 아닌 경우 0, 설명 중 기어 변화 0 |
| 경로 문제는 실패 아님(FR-034, FR-035) | 맞음 | `:259-280`. redirect는 failStreak 그대로(시험 `:166-172`) |
| 안내 중 운전 입력·gearTap 무시(FR-041, US2-14), 시도당 1번(B10), ended → 다음 hint 또는 scenarioCompleted | 맞음 | `:308-313`, 시험 `:199-220`. 탐색: 안내가 한 시도에 2번 이상 0, 안내 시작 틱에 움직임 0 |
| gearTap은 driving에서만, done이면 no-op | 맞음 | `:230`, `:297-298`. 탐색: driving 밖에서 기어 변화 0(구간 재시작의 전진 복귀 제외), done 뒤 변화 0 |
| 결정성·예외 없음·받은 state 불변 | 맞음 | 무작위·시각·DOM 사용 0건(grep). 탐색 P3(같은 씨앗 20회 이벤트 기록 같음), P4(8,000틱 동안 받은 state 직렬화 값 그대로), P1·P2 예외 0 |
| `stoppedTicks`가 구간 시도 안에서 줄지 않음(B5 지적) | 맞음 | `:275`(멈춘 뒤 운전 틱마다 +1), `:283`(stop 단계를 마친 틱에 1), 안내·설명 중에는 그대로. 탐색에서 재시작 없이 줄어든 틱 0 |
| T052 문구 검사 | 맞음 | 위 T052 행 |

## 구현 판단 메모 9건 확인

| # | 메모 | 계약과 충돌 | 판단 |
|---|---|---|---|
| 1 | 정지선 판정(사용자 결정) | 없음 | 분류는 00_context.md:49와 data-model.md:202-204대로. 덧붙인 "earlyStart·ranRed가 그 구간 목록에 없으면 overStopLine으로 내려감"은 4.3의 "그 구간 violations에 있음" 가드와 modules.md:205 "정지선 안으로 들어가는 틱이 없음"을 함께 지키는 유일한 방법이라 타당함. 다만 data-model.md 표에는 이 내려감이 적혀 있지 않음 → 아래 "이후 태스크" 1 |
| 2 | 새 필드 3개 | 없음 | data-model.md:369-371에 반영, 코드(`:42-44`)와 같음 |
| 3 | 단계 판정 | 없음 | SafetyActionStep 주석(data-model.md:180-182)과 같음. 지금 단계만 봄(FR-032). 탐색에서 stop 완료 740회 모두 정지 구역 안 `speed 0`, wait 완료 452회 모두 `speed 0 ∧ 조건`(차 초록 / 보행자 모두 건넘) |
| 4 | 경로 문제 판정 거리 | 없음 | data-model.md:947 "leftPath: 옆으로 / 시작 뒤로"와 같음 |
| 5 | redirect 뒤 hint 없음 | **지금 계약의 결함 아님 → T059·T060 항목** | events.md:117 "redirect(구간 다시 놓고 여기서 끝)", data-model.md:546 redirect 행에 hint 없음 → 코드가 계약 그대로. events.md:37 hint 행은 HUD 그림을 "다음 `hint`·**단계 변화**까지" 남기라고 하고 redirect는 단계를 0으로 되돌리는 단계 변화이며, events.md:15(1-5)가 HUD에 매 프레임 state 읽기를 허용하므로 T059·T060이 redirect 때 `state.step`의 cue로 그림을 바꾸면 계약 안에서 해결됨. 음성까지 다시 내려면(`hint-stop`) 계약 변경이라 T060에서 사용자 확인 필요. 탐색에서 leftPath redirect 712회 중 431회가 직전 cue와 새 단계가 다름 — 실제로 자주 생김. 같은 문제가 `closer`·`way` 뒤에도 있음(아래 "이후 태스크" 4) |
| 6 | explaining·demoReplay `≥` | 없음 | 7.1 순서 3 → 4대로 위반 틱의 신호 진행은 남김. "닿으면"을 `≥`로 읽은 것은 US2-8 "연속 실패가 반복되면 시범을 다시"와 맞음(질문으로 올리지 않음). 시험은 3번째까지만 봐서 `===`와 구분하지 못함(변이 S11) |
| 7 | 안내 중 신호·보행자·`stoppedTicks` 멈춤 | 없음 | 7.1 pedestrianView 줄에 진행이 없음. data-model 4.12·4.5와 어긋남 없음 |
| 8 | `afterStep` = 마친 단계 번호(0부터) | 없음 | data-model.md:224 예시("정지·대기 뒤, 출발 전")와 자리표시 데이터 `afterStep: 1`이 맞고, 콘텐츠 검사 #16이 범위를 막음 |
| 9 | 변이 시험 | — | 구현자 9건 + B5 생존 5건은 잡힘을 확인(B5 5건은 직접 재현). 다만 검증자 변이 33건 중 8건 생존(아래). 구현자의 "stoppedTicks 증가" 변이와 달리 "움직이면 0으로" 변이(S3)는 저장소 시험이 잡지 못함 |

## 탐색 시험 (저장소 밖 복사본, 판정 근거 보강용)

| # | 내용 | 결과 |
|---|---|---|
| P1 | signal-wait 400회 × 6,000틱(무작위 / 반쯤 올바른 주행 반반, 조향·액셀·브레이크·후진 탭 섞음) | 예외 0, go 전 앞 모서리가 정지선 너머 0, 차체 원 보도 겹침 0, `stoppedTicks` 감소 0, 잘못된 완료 0(완료 44회), 안내 2번 이상 0, 설명·안내 중 차·신호·보행자 변화 0, 위반 틱 차 이동 0, `ranRed`인데 이미 멈춘 적 있음 0, 차 초록 ∧ 보행자 초록 0, 차 초록 중 건너는 사람 0, 보행자 출발 시 (멈춤 ∨ 제동 거리 + 여유 밖) 위반 0, wait를 조건 없이 마침 0, stop을 정지 구역 밖에서 마침 0. 위반 분포 enteredSidewalk 1,331·ranRed 227·earlyStart 114·overStopLine 81, demoReplay 944 |
| P2 | crossing-check·turning-car 자리표시 각 150회 × 6,000틱 | 예외 0, 정지선 너머 0, 잘못된 완료 0(완료 58회), 설명 중 변화 0. blocked redirect 1회·leftPath 900회 |
| P3 | 같은 씨앗 두 번 | 이벤트 기록 20/20 같음 |
| P4 | 8,000틱 동안 넘긴 state를 고치는지 | 0건 |
| P5 | 메모 5 재현: go 단계에서 후진으로 시작 뒤 2 m 넘게 → `redirect(leftPath)`만, hint 없음, 단계 0 | 메모대로 |
| P6 | signal-wait 무입력 36,000틱 | `hint stop repeat` 120번뿐, 실패·완료 0 |
| 참고 | 차 신호 초록일 때 나온 `earlyStart` 6건(P1) | 모두 초록 전에 움직이기 시작해(속도 0 → 0.2 → 1.5 …) 초록이 된 뒤 정지선에 닿은 경우. wait는 "조건까지 speed 0 유지"(data-model.md:181)라 출발이 일렀다는 판정은 정의대로. 화면에는 초록인데 "일찍 출발" 설명이 나오므로 T062 플레이 확인 때 볼 것 |
| 참고 | 보도 판정이 차체 원이라 앞 모서리가 보도 안에 들어간 최대 깊이 | 0.5605 m(비스듬히 다가갈 때). 설계(차체 원)대로이며 판정 위반 아님 → 아래 "이후 태스크" 3 |

## 변이 시험 (저장소 밖 복사본, 한 번에 한 곳, 대상 시험 = scenario·townActors·collision 28건)

잡힘 25건: M8·M6·M5·M1·C2(B5 생존 5건), S2 재시도 뒤 안내 다시, S4 위반 때 후보 유지, S5 우선순위 바꿈, S6 ranRed가 stoppedOnce 무시, S7 go 단계에도 정지선 판정, S10 failStreak 증가 없음, S12 redirect를 실패로 셈, S13 안내 중 운전 입력 반영, S14 안내 중 후진 탭 반영, S15 정지 구역 밖 정지 인정, S19 stoppedOnce 안 바뀜, S21 정지 구역 안에서도 closer, S22 way 매 틱, S23 보도 판정 없음, S24 stop 뒤 stoppedTicks 시작 안 함, S25 ended 뒤 viewDone 안 바뀜, S26 재안내 `>`, S28 재시도 때 신호·보행자 그대로, S32 earlyStart 분기 없음, S33 안내 위치 한 칸 밀림.

생존 8건(코드는 계약대로 동작하고 tasks.md가 요구한 시험 항목은 모두 있으므로 **판정에 영향 없음**, B5와 같은 처리로 reviewer에게 넘김):

| # | 바꾼 것 | 탐색 시험 | 영향·제안 |
|---|---|---|---|
| S16 | wait의 `vehicleGreen` 조건을 늘 참으로(`scenario.ts:176`) | 잡힘(wait 조건 없이 마침 349건, 완료 129회) | **우선 권장**. FR-032·FR-044·US2-1 "진행 신호가 되어 안전해질 때까지 기다린 뒤 출발"의 핵심인데 저장소 시험이 고정하지 못함 — 올바른 행동 시험(`scenario.test.ts:185`)은 이 변이에서도 같은 이벤트 순서로 완료됨. 예: 정지 구역에서 멈춘 뒤 브레이크를 누른 채 몇 틱 진행해 차 신호가 초록이 아닌 동안 `step === 1`·`phase === 'driving'`이고, `pedestrianViewStart` 틱의 차 신호가 `'green'`인지 확인 |
| S3 | `stoppedTicks`가 움직이면 0으로(`:275`) | 잡힘 | **권장**. B5 지적 성질. 올바른 행동 기록에서 `stoppedTicks`가 줄지 않음, 또는 go 단계 동안 차 신호가 초록에서 바뀌지 않음을 확인 |
| S17 | go 완료를 경로 끝 20 m 앞에서(`:174`) | 잡힘 | 권장. 완료 틱의 앞 끝 `s ≥ 경로 길이` 확인 한 줄 |
| S18 | done에서도 운전 단계 진행(`:297-298`) | 잡힘 | 권장. 완료 뒤 `stepScenario(done, GAS, true)`가 같은 state·빈 이벤트(공통 규칙 7, modules.md:211) |
| S9 | 설명 중 후진 탭 반영(`:301`) | 잡힘 | 권장. modules.md:206 "입력·gearTap을 무시"의 탭 쪽. 시험 `:113`에 탭을 섞으면 됨 |
| S11 | demoReplay `≥` → `===`(`:305`) | 생존 | 선택. 메모 6의 `≥` 해석을 고정하려면 4번째 실패에도 demoReplay 확인 |
| S20 | 위반 틱에 신호·보행자 진행을 버림(`:254-255`) | 생존 | 선택. 그 틱에 낸 `signalChanged`와 state 신호가 어긋나는 변이. 위반 틱 state 신호 = 이벤트 신호 확인 |
| S34 | `next()`의 `viewDone` 가드 제거(`:222`) | 생존 | 불필요. 콘텐츠 검사 #16이 안내 위치를 단계 안으로 막아 지금 데이터에서는 같은 동작 |

## 이후 태스크로 넘길 것 (이번 판정과 무관)

1. **T053·T054·T056 — 횡단보도 위반 두 종류가 나올 수 있는 데이터 배치.** 판정은 go 전 모든 단계에서 정지선을 보고 그때 늘 `overStopLine`을 후보에 넣으며(`scenario.ts:159-164`), go 단계는 `pedestriansClear`를 지난 뒤라 건너는 사람이 없음. 그래서 `enteredCrosswalkWithPedestrian`·`turnedIntoCrossingPedestrian`(SC-010 "보행자 횡단 중 출발", "회전 시 기다리지 않음")은 경로상 횡단보도 차 쪽 가장자리가 `stopLineS`와 같거나 앞에 있어 같은 틱에 함께 걸릴 때만 나옴(표 순서상 횡단보도가 위). 지금 자리표시는 정지선 38 m, 횡단보도 40 m라 두 종류가 나올 수 없음. T053·T054 데이터에서 이 배치를 맞추고, 구간 `violations`에 무엇을 넣을지(메모 1의 내려감 포함)를 함께 정해야 T056 시험이 성립함. 메모 1의 내려감을 data-model.md ViolationKind 표 아래에 한 줄 적어 두는 것도 권장
2. **T053 — 자리표시에 기댄 시험.** `scenario.test.ts:160-164`(wrongWay)·`:174-181`(blocked)는 crossing-check 자리표시(보도 위반 없음, 직선 차선 x = −2, 건물 x ≤ −8)에 기댐. T053이 데이터를 바꾸면 이 두 시험을 시험용 구간으로 옮기거나 고쳐야 함
3. **T054·T055 #17·T062 — 보도 앞 모서리 걸침.** 보도 판정은 설계대로 차체 원(`01_architect_architecture.md:76`)이라, 비스듬히 다가가면 차체 앞 모서리(표시 길이 = 판정 길이, assets.md:66)가 보도 가장자리 안으로 최대 약 0.56 m 들어간 뒤 멈춤(탐색 측정 0.5605 m). turning-car처럼 길모퉁이 보도에 보행자가 기다리는 장면에서 #17의 거리(사람 반지름 + 여유 1 m)가 이 걸침을 감당하는지 T055에서 확인하고 T062에서 눈으로 볼 것. 판정 모양을 바꿀 필요가 생기면 설계 결정이라 사용자 확인 대상
4. **T059·T060 — HUD cue 갱신(메모 5).** redirect 뒤, 그리고 일시적인 `closer`·`way` cue 뒤에 HUD가 지금 단계(`state.step`)의 그림을 보이도록 연결. 음성까지 다시 내려면 redirect 뒤 `hint`를 내도록 events.md 7.1-5를 바꿔야 하므로 사용자 확인
5. **T062 — 초록인데 earlyStart.** 초록 전에 굴러가기 시작해 초록 뒤 정지선에 닿으면 earlyStart(정의대로). 설명 그림이 아이에게 헷갈리지 않는지 플레이 확인
6. **T053·T054·T055 — 구간당 stop 단계 하나.** `stoppedTicks`는 stop 단계를 마친 틱에 1로 놓으므로(`:283`) 한 구간에 stop이 둘이면 그때 줄어듦. 지금 데이터는 구간당 하나. 새 데이터도 하나로 두거나 콘텐츠 검사에 넣기
7. **T055 — B5에서 넘어온 콘텐츠 검사 후보**(task-B5_validation.md "T052가 문서에 반영할 것" 8, task-B5_review.md 제안 4): `redAtS`·`greenAfterStoppedTicks` 조건, 보행자 경로 점 2개 이상, 신호 종류 일치 등. 이번 묶음 범위 밖이라 아직 없음
8. **T117 — 자리값.** `WAY_OFFSET` 2.5 m·`LEAVE_OFFSET` 6 m·`LEAVE_BACK` 2 m(`scenario.ts:26-28`, 내보내지 않음). data-model.md 6.4·Open Issues 2에 적힘

## 참고 (조치 불필요)

- `scenario.ts`가 `pedestrianView`의 함수를 값으로 import함(`:4-9`). overview.md 의존 그림에는 practice → pedestrianView 화살표가 없지만, events.md:29 "PedestrianViewEvent … 안내 중 그대로 전달"과 events.md:122, data-model.md 4.3 `pedestrianView` 행이 `stepScenario` 안에서 안내를 진행하도록 정하므로 계약이 요구하는 의존임. 순환 없음(pedestrianView는 practice를 import하지 않음)
- 순수 로직 규칙(overview 공통 규칙 3·7): 바뀐 소스·시험에 `three`·DOM·`localStorage`·`Math.random`·`Date`·타이머·`innerHTML` 사용 0건
- tasks.md T043 문구의 "시그니처 잠정"은 태스크 설명(과거 기록)이라 T052 검사 대상이 아님

## FAIL 피드백

없음.
