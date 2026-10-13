# Task B6 Code Review Report

- run / task / dispatch / 실제 도구 / 세션 handle: (Orca 미사용 — Claude Code 서브에이전트 spec-implement-reviewer, 사용자 결정 2026-10-12 "Codex 복구 전까지 Claude 에이전트", 00_context.md:47 승인 기록)
- FEATURE_DIR / 단계 / 검토 태스크: `/Users/kyw/Documents/git/mine/driving_game/specs/001-kids-driving-safety-game` / implement / B6 = T048~T052 + B5 reviewer 비필수 제안 1·2·3·5
- revision 요청값 / 읽기 전 / 테스트 후: `7b793710b69485b991cad387ff10770ecc16b03fd5d6d7081e3d0b805c847267` / `7b793710b69485b991cad387ff10770ecc16b03fd5d6d7081e3d0b805c847267` / `7b793710b69485b991cad387ff10770ecc16b03fd5d6d7081e3d0b805c847267` (세 값이 같습니다. `git status --porcelain` 34줄로 validator 보고와 같습니다)
- validator 보고서 / 판정 / revision: `_workspace/implement/logs/task-B6_validation.md` / COMPLETE·PASS(T048~T052, B5 제안 1·2·3·5 모두 PASS, 미해결 질문 0) / `7b793710…c847267`(요청값과 같음) → 리뷰 시작 조건을 충족합니다
- 원문 및 코드 근거 (파일:라인): 아래 표와 각 절. 소스는 PROJECT_ROOT, 문서는 FEATURE_DIR 기준입니다. 읽은 원문 = AGENTS.md(역할 파일보다 먼저), 역할 파일, orca-cross-review.md(머리 필드·snapshot 규칙), docs/PRD.md, GLOSSARY.md, contracts/overview.md(공통 규칙 1~10·의존 방향), contracts/modules.md(3.2·4.2·4.3·4.4·12장), contracts/events.md 7.1, tasks.md Phase 4(T043~T056), data-model.md 변경분 전체(`git diff`), 00_context.md, task-B6_impl.md(판단 메모 9건), task-B6_validation.md, task-B5_review.md. constitution은 빈 양식(사용자 결정, 규칙 없음)
- 실행한 테스트 명령 / 종료 코드 / 결과: 아래 "직접 실행 기록". typecheck 0, `npm test` 0(14 files 121 passed), build 0, 변이 시험 18건 × 2회(저장소 밖 복사본). E2E는 실행하지 않았습니다(화면·DOM 변경 없음, 요청서의 선택 항목)
- 검증 상태: **COMPLETE**
- 역할 판정: **APPROVE with comments** — T048~T052, B5 제안 1·2·3·5 모두 APPROVE. 필수 수정 0건, 비필수 제안 7건(제안 1 시험 고정이 우선 권장)
- 미해결 질문·지적 / 이전 지적 처리 결과:
  - 미해결 질문 0건. 리더 확인 요청 1건(제안 6, data-model.md:1009 문구가 00_context.md:51 사용자 결정과 다름 — 동작 영향 없음, 문서 정정 시점은 리더 판단)
  - B5 reviewer 비필수 제안 처리: 1(시험 다섯 곳) 반영 확인 — 같은 다섯 변이가 지금 시험에서 잡힘(validator 재현, 이 리뷰는 diff로 시험 줄 확인), 2(townActors 가독성) 반영 확인, 3(modules.md 12장 상수 4개) 반영 확인(`modules.md:451`), 4(T055 신호 종류 검사)는 이번 범위 밖으로 남음, 5(`60` → `TICK_HZ`) 반영 확인(`townActors.test.ts:13`, `:38`)
  - 이번 REJECT 없음

## 판정: APPROVE with comments
## 시도: 1/2

```
[Speckit-Context] implement phase
  ├ constitution: 빈 양식(사용자 결정, 규칙 없음). 프로젝트 기준은 AGENTS.md·PRD·GLOSSARY
  ├ spec: US2 세 안전 연습. 완료 = 안내된 정지·대기·출발을 직접 + 보행자 시점 안내 끝까지(FR-032, SC-008),
  │       잘못된 행동은 위험 직전 멈춤·구간 처음부터(FR-033·036·037), 경로 문제는 실패 아님(FR-034·035),
  │       무입력은 재안내만(FR-031), 안내 중 운전 입력 무시(FR-041), 신호·보행자는 차 위치·멈춘 시간으로만(FR-040)
  ├ plan: 순수 로직 폴더(sim·practice·pedestrianView·content)는 three·DOM·시각·무작위 없음, 틱 단위,
  │       step은 받은 state를 고치지 않음, 연결은 동기 함수 호출과 이벤트뿐, 콘텐츠는 실행 중 다시 검사하지 않음(규칙 9)
  └ tasks: B6 = T048 운전 단계, T049 잘못된 행동, T050 경로 문제, T051 보행자 시점 안내 연결, T052 ActorPlan 문서 확정
          + B5 제안 1·2·3·5. 자리표시 crossing-check·turning-car의 실제 데이터는 다음 묶음(T053·T054)
```

## 적용 기준과 범위

- AGENTS.md를 역할 파일보다 먼저 읽고 치환표(AGENTS.md:22-28)를 적용했습니다. TypeScript + three + Vite + Vitest 정적 게임이며 prettier·eslint 설정이 없어 포맷·줄 길이는 기존 코드를 기준으로 봤습니다.
- **적용하지 않은 IVI 전용 항목과 이유**: Lombok 패턴, DTO/Entity/Service/Repository 계층, SQL Injection(파라미터 바인딩), Mass Assignment(DTO 필드 제한), 인증·인가 — 이 게임에는 서버·DB·REST가 없습니다(`contracts/overview.md:4`, AGENTS.md:16·30). "컨벤션 파악 불가 시 Spring Boot 관행"도 쓰지 않았습니다(AGENTS.md:17). `mvn compile/test` 대신 `npm run typecheck`·`npm test`·`npm run build`(00_context.md:12-19)를 실행했습니다.
- **대신 적용한 기준**: 기존 B1~B5 코드 모양(짧은 한국어 주석 + FR 근거, 자리값 묶음 표기 `// 자리값(plan O5): …에서 확정` — `vehicle.ts:21`·`townActors.ts:8`, 단위 주석 `// m.` — `townActors.ts:12`, `find(…)!` 관례 — B5 리뷰), overview 공통 규칙 1·3·4·5·7·8·9, 모듈 의존 방향, 시험이 로직 파손을 실제로 잡는지(변이 시험).
- 스펙 정합성은 validator PASS를 존중하여 다시 판정하지 않았습니다. 판단 메모 5(redirect 뒤 hint 없음)·HUD cue 문제는 validator가 T059·T060으로 넘긴 그대로 둡니다.

## 태스크별 판정

| 태스크 | 판정 | 코드 품질 근거 |
|---|---|---|
| T048 운전 단계 | APPROVE (제안 1·2·3·4) | `src/practice/scenario.ts` 318줄. `stepDriving`(`:226-293`)의 번호 주석 1~7이 events.md 7.1 순서와 하나씩 맞아 계약과 대조하기 쉽습니다. 도우미가 한 가지 일씩(`front` `:84-96`, `project` `:99-116`, `stepDone` `:170-178`, `advance` `:181-196`, `next` `:199-224`)이고 각각 한 줄 설명이 있습니다. `Kept` 타입(`:120`)은 `startScenario`(`:145`)가 부분 객체로 `atSegmentStart`를 부르게 하면서, `ScenarioAttempt`에 필드가 늘면 `atSegmentStart`가 그 필드를 채우지 않을 때 컴파일 오류가 나게 해 줍니다(빠짐 방지 효과, 유지 권장). 결정성: 무작위·시각 0건, 모든 갱신이 전개 연산자로 새 객체이고 `push`는 함수 안 지역 배열에만 씁니다. 다만 ① `next()`의 `!s.viewDone` 가드(`:222`)는 도달할 수 없는 방어 코드(제안 2) ② 다음 구간 분기(`:206-220`)가 `atSegmentStart`의 초기화 목록을 손으로 복사했고 시험이 닿지 않음(제안 3) ③ `SCENARIOS.find`가 `defOf`(`:77`)와 `atSegmentStart`(`:124`)에 두 번 쓰임(제안 4) ④ wait 조건(`:176`)·go 끝(`:174`)·done no-op(`:297-298`)·`stoppedTicks` 유지(`:275`)를 저장소 시험이 고정하지 못함(제안 1) |
| T049 잘못된 행동 | APPROVE (제안 1·5) | `judge`(`:150-167`)는 후보 위치에서 찾은 종류를 모아 우선순위 표(`:66-73`)와 구간 `violations`로 하나를 고르는 구조라 사용자 결정(정지선 세 갈래, 00_context.md:49)이 `:158-164` 일곱 줄에 그대로 보입니다. 보도 판정에 `collision.ts`의 `overlaps`를 내보내 재사용했고 같은 일을 하는 함수를 새로 만들지 않았습니다. 다만 FR-036 시험의 `corners` 도우미(`scenario.test.ts:27-29`)가 이름과 달리 앞 끝 **가운데 한 점**만 계산해, "판정점 = 앞쪽 두 모서리"(modules.md 4.4)가 시험으로 고정되지 않습니다(변이 J1 생존 → 제안 1). 횡단보도 두 종류를 함께 넣고 구간 `violations`로 고르는 줄(`:156`)은 설명 한 줄이 있으면 좋겠습니다(제안 5) |
| T050 경로 문제 | APPROVE (제안 1) | 경로 문제 판정이 `:259-280` 한 곳에 모여 있고 자리값 3개가 단위 주석과 함께 위쪽 자리값 묶음(`:26-28`)에 있어 기존 관례와 같습니다. 파일 밖에서 쓰지 않으므로 내보내지 않은 것도 적절합니다(문서 기록은 data-model.md 6.4·Open Issues 2). leftPath 중 "옆으로 크게 벗어남"(`off > LEAVE_OFFSET`, `:265`)은 시험이 닿지 않습니다(변이 J13 생존 → 제안 1). wrongWay·blocked 시험이 자리표시 데이터에 기대는 점은 validator가 T053 항목으로 넘긴 그대로입니다 |
| T051 안내 연결 | APPROVE (제안 1) | 안내 시작(`advance`)과 안내 뒤 진행(`next`)이 나뉘어 있어 "안내가 끝난 틱에 다음 hint"(메모 7)가 `:313` 한 줄로 드러납니다. 안내 중에는 `stepPedestrianView`에 운전 입력을 넘기지 않아 입력 무시가 구조로 보장됩니다(`:308-313`). `state.view!`는 phase가 `pedestrianView`이면 항상 값이 있는 단언으로 기존 `!` 관례와 같습니다 |
| T052 문서 | APPROVE (제안 6) | `data-model.md` 변경 33줄은 모두 T052 문구, B5 validator "T052가 문서에 반영할 것" 1~7, 사용자 결정(ViolationKind 표 `:202-204`, 4.12)에서 나온 것이며 범위 밖 수정은 없습니다. `modules.md`는 3.2 `overlaps`(신규 표시), 4.2 두 행, 12장 상수 4개뿐입니다(B4의 4.3 "후진 탭" 행은 이전 묶음분). `tasks.md`는 체크 표시 외 글자 차이 0입니다. 다만 Open Issues 1 새 문구(`data-model.md:1009`)의 crossing-check·turning-car 설명이 00_context.md:51 사용자 결정과 다릅니다(제안 6) |
| B5 제안 1 | APPROVE | `townActors.test.ts:58-61`·`:144-152`·`:182`, `collision.test.ts:20` 추가가 B5 리뷰 제안 문구 그대로이며 기존 시험 모양(지역 `step`·`light` 도우미)을 따릅니다 |
| B5 제안 2 | APPROVE | `townActors.ts:78-99` — 이름 바꾸기(`carLight`·`walkLight`·`nextWalk`·`nextCar`), `!` 단언 → `?? s.light`, FR-042 순서 주석(`:88-89`). 동작 변화 없음(validator diff 확인, 시험 그대로 통과) |
| B5 제안 3 | APPROVE | `modules.md:451` 상수 4개가 코드 `townActors.ts:9-12`와 같습니다 |
| B5 제안 5 | APPROVE | `townActors.test.ts:13`, `:38` |

## 보안 (overview 공통 규칙 4·5·9)

| 검사 | 결과 |
|---|---|
| 바뀐 소스·시험 7개에서 `innerHTML\|outerHTML\|insertAdjacentHTML\|eval(\|new Function\|getUserMedia\|geolocation\|requestPermission\|https?://\|fetch(\|createElement('a')\|.href` | 0건 |
| 신뢰 경계 | `stepScenario`는 콘텐츠 상수, 엔진 내부 state, `DriveInput`(조향 값은 `stepVehicle`이 −1~1로 자름, `vehicle.ts:38`)만 받습니다. localStorage·네트워크 값을 받지 않으므로 실행 중 검사가 필요 없습니다(규칙 9) |

## 순수 폴더·의존 방향 (공통 규칙 3, 의존 방향)

- `src/practice/*.ts`, `src/sim/*.ts`, `src/pedestrianView/*.ts`, `src/content/*.ts`, `tests/unit/scenario.test.ts`에서 `from 'three'|document.|window.|globalThis|localStorage|Math.random|Date.|performance.|setTimeout|setInterval|console.` 0건입니다.
- `scenario.ts:1-20`의 import는 content, pedestrianView, sim, `./townActors`뿐입니다. practice → pedestrianView 값 import는 overview 그림에 없지만 events.md 7.1이 `stepScenario` 안에서 안내를 진행하도록 정하므로 계약이 요구하는 의존입니다(validator 참고와 같은 판단). `pedestrianView.ts`는 content만 import해 순환이 없습니다. `townActors.ts:6`은 `scenario`를 `import type`으로만 써 실행 시 순환이 없습니다.

## 불필요한 코드

- `npx tsc --noEmit --noUnusedLocals --noUnusedParameters`: 지적 2건 모두 B6 이전 코드(`src/app/flow.ts:54` `storageOk`, `tests/unit/content.test.ts:183`) — B5 리뷰에서 이미 판단한 것입니다. **B6 파일의 미사용 import·변수·매개변수 0건.** 주석 처리된 코드·디버그 출력 0건.
- `next()`의 `!s.viewDone` 가드(`scenario.ts:222`): **지금 데이터와 콘텐츠 검사 #16(`content.test.ts:118-121`)이 있으면 도달할 수 없습니다.** 안내 단계는 건너뛸 수 없고(단계는 `advance`로만 진행), 안내 중에는 위반·재시작이 없으며, `viewDone`은 재시작·redirect에도 유지되므로 마지막 단계를 마칠 때 `viewDone`은 언제나 참입니다(변이 S34 생존이 이를 뒷받침). 또 가드가 걸리면 같은 state를 돌려 매 틱 다시 같은 분기로 들어가므로, 시도가 안내도 완료도 없이 멈춰 버립니다. 공통 규칙 9("콘텐츠 데이터는 … 실행 중에는 다시 검사하지 않습니다")와 맞추려면 지우는 편이 낫습니다(제안 2, 비필수).
- 다음 구간 분기(`scenario.ts:206-220`): 계약(구간 1..N, data-model.md:155·540)이 요구하는 분기라 필요합니다. 다만 지금 세 상황이 모두 구간 1개라 어떤 시험도 닿지 않고(변이 J2 생존), 초기화할 필드 7개를 `atSegmentStart`에서 손으로 복사해 나중에 구간별 필드가 늘면 이 분기만 빠뜨려도 타입 검사가 잡지 못합니다(제안 3).
- `overlaps` 내보내기(`collision.ts:5`): 보도 판정에 같은 계산이 필요해 새 함수를 만들지 않고 기존 함수를 연 최소 변경입니다. modules.md 3.2에 "(신규)"로 적혀 있습니다.

## 가독성·성능

- **함수 나눔**: `stepScenario`(phase 분기) → `stepDriving`(7.1 순서) → `judge`/`stepDone`(순수 판정) → `advance`(안내 끼우기) → `next`(단계·구간·완료)로 한 방향이며 각 함수가 30줄 이하(`stepDriving`만 67줄, 계약 순서를 그대로 옮긴 것이라 나누지 않는 편이 대조에 유리)입니다. 유지 권장.
- **틱당 계산량**: `driving` 한 틱에 `project()`가 4번(`:234`, `:260`, `:261`, `:262`) + `go` 전 단계에서 판정용 최대 2번(`:159`), `go` 단계에서 `pathLength`(배열 복사 1개) 1번, `SCENARIOS.find`(항목 3개)가 5번 안팎입니다. `project`는 경로 선분 수에 비례하고 지금 경로는 선분 1개, 회전 경로도 몇 개 수준이라 한 틱에 수십 번의 곱셈·`hypot` 정도입니다. 60 Hz에서 한 프레임에 여러 틱을 따라잡아도 부담이 없는 양이므로 **조치 불필요**합니다. `prevS`·`prevOff`(직전 틱 값의 재계산)를 state에 저장해 아끼는 방법은 필드가 늘어 얻는 것보다 잃는 것이 커서 권하지 않습니다.
- **반복 `SCENARIOS.find`**: 성능 문제는 아니고 같은 조회가 두 모양으로 있는 중복입니다(제안 4).

## 변경 범위

- `src/` 변경은 요청서 목록 4개(`scenario.ts`, `collision.ts`, `townActors.ts`, `scenarios.ts`)뿐이며 B5 리뷰 복사본(`scratchpad/b5rev/src`)과 `diff -rq`로 확인했습니다. `scenarios.ts`는 주석 1줄(`:22`), `collision.ts`는 `export` 1단어입니다.
- `tests/`는 `scenario.test.ts` 신설과 `townActors.test.ts`(+14줄)·`collision.test.ts`(+1줄)뿐입니다.
- 문서 변경 범위는 위 T052 행과 같습니다.

## 테스트 품질 — 변이 시험 (저장소 밖 복사본, 한 번에 한 곳, 매번 원상 복구 확인, 대상 = scenario·townActors·collision 28건)

validator의 생존 8건을 같은 방식으로 재현했고(8/8 생존), 새 변이 10건을 더 걸었습니다. 이어서 아래 제안 1의 시험 줄을 **복사본에만** 넣고 같은 18건을 다시 돌려 각 줄이 실제로 변이를 잡는지 확인했습니다.

| # | 바꾼 곳 | 지금 시험 | 제안 1 넣은 뒤 | 고정할지 |
|---|---|---|---|---|
| S16 | wait의 `vehicleGreen`을 늘 참(`scenario.ts:176`) | 생존 | 잡힘 | **우선 권장**. 멈춘 뒤 바로 출발 안내가 나오고 빨간불에 그대로 지나도 완료됨 — 신호 기다리기의 핵심. T053 crossing-check도 같은 조건을 씀 |
| J1 | 정지선 판정점을 앞 끝 가운데 한 점으로(`:152`) | 생존 | 잡힘 | **우선 권장**. 계약의 "앞쪽 두 모서리, 회전 중에도 같은 규칙"이 고정되지 않음. 시험 도우미 이름 `corners`가 실제와 달라 읽는 사람이 고정됐다고 오해함(validator도 T049 근거로 이 시험을 듦). T054 회전 구간 전에 |
| S3 | 움직이면 `stoppedTicks` 0(`:275`) | 생존 | 잡힘 | 권장. B5부터 지적된 성질(출발 뒤 다시 노랑) |
| S17 | go 완료를 경로 끝 20 m 앞에서(`:174`) | 생존 | 잡힘 | 권장 |
| S18 | done에서도 운전(`:297-298`) | 생존 | 잡힘 | 권장(공통 규칙 7) |
| S9 | 설명 중 후진 탭 반영(`:301`) | 생존 | 잡힘 | 권장(modules.md 4.4 explaining) |
| S11 | demoReplay `≥` → `===`(`:305`) | 생존 | 잡힘 | 선택(메모 6의 해석 고정) |
| J13 | leftPath의 "옆으로 벗어남" 제거(`:265`) | 생존 | 잡힘 | 선택(자리표시 데이터에 기댐 — T053 때 옮길 시험과 같은 처지) |
| S20 | 위반 틱의 신호·보행자 진행 버림(`:254-255`) | 생존 | 생존 | 불필요. 위반과 신호 변화가 같은 틱에 겹치는 장면을 만들기 어렵고, 이벤트·state 불일치 1틱 |
| S34 | `next()` `viewDone` 가드 제거(`:222`) | 생존 | 생존 | 불필요 — 가드 자체를 지우기 권장(제안 2) |
| J2 | 다음 구간에서 `failStreak` 유지(`:213`) | 생존 | 생존 | 지금 데이터로 시험 불가(구간 1개). 제안 3으로 위험을 줄임 |
| J16 | `project` 중간 선분 자르기 제거(`:109`) | 생존 | 생존 | 지금 데이터로 시험 불가(경로 점 2개). T054 회전 경로와 T056 SC-009 완료 시험이 닿게 됨 |
| J5 | 안내 시작 `speed 0` 안 함(`:190`) | 생존 | 생존 | 지금 데이터로 시험 불가(안내가 wait 뒤라 이미 정지). 계약 행이라 코드는 유지 |
| J3 | closer를 stop 단계 밖에서도(`:279`) | 생존 | 생존 | 불필요(경미) |
| J4 | blocked의 "진행 없음" 조건 제거(`:264`) | 생존 | 생존 | 불필요(경미) |
| J6 | 무입력 판정에서 후진 탭 제외 안 함(`:287`) | 생존 | 생존 | 불필요(경미) |
| J11 | 입력해도 `idleTicks` 안 줄임(`:288`) | 잡힘 | 잡힘 | — |
| J17 | 구간 `violations` 무시(`:166`) | 잡힘 | 잡힘 | — |

- 생존 변이가 있어도 **승인을 막지 않습니다.** 코드는 계약대로 동작하고(validator 탐색 P1·P2가 무작위 조향 포함 수십만 틱에서 앞 모서리·wait 조건·`stoppedTicks`를 직접 확인), tasks.md T048~T051이 요구한 시험 항목은 모두 있으며, B4·B5와 같은 처리입니다. 다만 S16·J1은 이 연습이 가르치는 핵심(빨간불 기다리기, 위험 직전 멈춤)이라 **다음 묶음 첫 변경에 넣기를 강하게 권장**합니다. 넣을 줄은 아래 제안 1에 있고 모두 복사본에서 타입 검사와 변이 확인을 마쳤습니다.

## REJECT 수정 요청

없음.

## 개선 제안 — 승인 조건 아님

1. **(우선 권장) 생존 변이 고정 — 시험만, 소스 변경 없음. 다음 묶음(T053 데이터가 wait·회전을 늘리기 전)에.** 모두 복사본에서 확인했습니다(넣은 뒤 28 passed, 해당 변이는 각각 1 failed).
   - S16·S3·S17·S18 — `tests/unit/scenario.test.ts`의 "signal-wait 올바른 행동" 시험 끝(`:196` 다음)에:
     ```ts
     const carLight = (s: ScenarioAttempt) => s.signals.find((x) => x.id === SEG.signal)!.light;
     expect(carLight(viewStart.after)).toBe('green'); // wait는 진행 신호 뒤에만 끝남
     expect(carLight(r.state)).toBe('green'); // 출발 뒤에도 다시 노랑이 되지 않음(stoppedTicks가 줄지 않음)
     expect(frontS(r.state)).toBeGreaterThanOrEqual(SEG.path.at(-1)!.z); // 경로 끝에 닿아야 완료
     expect(stepScenario(r.state, GAS, true)).toEqual({ state: r.state, events: [] }); // done은 no-op
     ```
   - J1 — `:27-29`의 `corners`를 실제 앞쪽 두 모서리로 바꾸고, `:121` 운전 목록에 살짝 비스듬히 다가가는 운전 `hold({ steer: 0.02, throttle: true, brake: false })`를 더합니다:
     ```ts
     const corners = ({ drive: d }: ScenarioAttempt) =>
       [1, -1].map((k) => ({
         x: d.x + Math.sin(d.heading) * HALF + k * Math.cos(d.heading) * DRIVING_SPEC.bodyRadius,
         z: d.z + Math.cos(d.heading) * HALF - k * Math.sin(d.heading) * DRIVING_SPEC.bodyRadius,
       })); // 차체 앞쪽 두 모서리
     ```
   - S9 — `:113` `run(v.state, EXPLAIN_TICKS, hold(GAS))` → `run(v.state, EXPLAIN_TICKS, () => ({ input: GAS, tap: true }))`(`:115`의 같은 객체 확인이 기어 변화를 잡음)
   - S11(선택) — `:139` `n <= DEMO_AFTER_FAILS` → `n <= DEMO_AFTER_FAILS + 1`
   - J13(선택) — wrongWay 시험(`:163` 다음)에 `expect(run(r.state, 600, hold({ steer: 1, throttle: true, brake: false })).events).toContainEqual({ type: 'redirect', issue: 'leftPath' });` — 자리표시 데이터에 기대므로 T053에서 wrongWay·blocked 시험을 옮길 때 함께 옮깁니다.
2. **`scenario.ts:222` 가드 삭제.** 위 "불필요한 코드" 근거대로 도달 불가이고, 걸리면 시도가 조용히 멈춥니다. 한 줄 삭제로 공통 규칙 9와 맞춥니다. 남기려면 "콘텐츠 검사 #16이 막음, 도달 불가" 정도로 주석을 바꾸는 것도 가능합니다.
3. **다음 구간 분기(`scenario.ts:206-220`)를 `atSegmentStart` 재사용으로.** 동작은 같고(차 위치는 그대로, `failStreak` 0) 12줄이 2줄이 되며, 구간별 필드가 늘 때 빠뜨릴 곳이 하나로 줄어듭니다:
   ```ts
   const state = { ...atSegmentStart({ ...s, failStreak: 0 }, s.segment + 1), drive: s.drive };
   return { state, events: [...events, hint(cueOf(segOf(state), 0))] };
   ```
4. **`SCENARIOS.find` 한 곳으로.** `defOf`의 매개변수를 `(s: { scenario: ScenarioId })`로 넓히면 `atSegmentStart`(`:124`)가 `defOf(s).segments[segment]`로 같은 도우미를 씁니다. 성능과는 무관한 중복 정리입니다.
5. **`judge`의 횡단보도 줄(`:156`)에 한 줄 주석.** 두 종류를 함께 넣고 구간 `violations`가 직진·회전 중 하나를 고른다는 점이 지금은 `:166`까지 읽어야 보입니다. 예: `// 직진·회전 구분은 구간 violations가 정함(둘 중 하나만 둠)`.
6. **(리더 확인) `data-model.md:1009` Open Issues 1 문구.** "crossing-check = 신호 없음(`signal`·`pedestrianSignal` null)", "turning-car … 출발 `pedestrianGreen`"이 00_context.md:51 사용자 결정(crossing-check = 차·보행자 신호등 있음 + `playerStopped`, turning-car = `playerStopped` + 회전 방향 보행자 신호 초록 고정)과 다릅니다. 끝에 "실제 배치·출발 시점은 T053·T054 데이터에서 정합니다"가 있어 동작 영향은 없지만, T053·T054 구현자가 이 문구를 기준으로 읽을 수 있으니 T053 시작 때 결정대로 고치기를 권합니다. 스펙 정합 판단은 validator 영역이라 리더가 정정 시점을 정해 주십시오.
7. **(참고) 지금 데이터로 닿지 않는 코드.** `project`의 중간 선분 자르기(`:109-110`), 다음 구간 분기, 안내 시작 `speed 0`(`:190`)은 구간 1개·경로 점 2개·wait 뒤 안내라는 지금 데이터에서는 어떤 시험도 지나가지 않습니다. T054(회전 경로)와 T056(SC-009 세 상황 완료)이 앞의 둘에 닿는지 그때 확인하면 됩니다.

## 직접 실행 기록 (PROJECT_ROOT, 저장소 쓰기는 이 보고서와 아래 명령이 만드는 무시 대상 산출물뿐)

| 명령 | 종료 코드 | 결과 |
|---|---|---|
| `python3 ivi-agent-guide/scripts/review-snapshot.py <PROJECT_ROOT> <FEATURE_DIR>` (읽기 전) | 0 | `7b793710…c847267` = 요청값 |
| `npm run typecheck` | 0 | 오류 없음 |
| `npm test` | 0 | Test Files 14 passed, Tests 121 passed |
| `npm run build` | 0 | 성공, 500 kB 청크 경고(기존과 같음). `dist/`는 `.gitignore` 대상 |
| `npx tsc --noEmit --noUnusedLocals --noUnusedParameters` | 1 | 지적 2건 모두 B6 이전 코드(위 "불필요한 코드") |
| `python3 -I scratchpad/b6rev_mutate.py` (복사본 `scratchpad/b6rev/`, 스크립트가 경로가 `/private/tmp/`이고 저장소 밖인지·작업 위치가 복사본인지 단언, 바꾼 파일을 매번 되돌리고 같음을 단언, `npx vitest run <3개 시험>`) | 0 | 18건: 잡힘 2, 생존 16(위 표 "지금 시험"). 끝에 복사본 `src`와 저장소 `src` 같음(`diff -rq` 출력 없음) |
| `python3 -I scratchpad/b6rev_pins.py` → 복사본 `npx tsc --noEmit` → 같은 변이 스크립트 | 0 / 0 / 0 | 제안 1의 시험 줄을 **복사본 시험 파일에만** 넣음. 타입 오류 없음, 기준 28 passed, 18건 중 잡힘 10·생존 8(위 표 "제안 1 넣은 뒤"). 끝에 복사본 `src`와 저장소 `src` 같음 |
| snapshot (테스트·변이 시험 뒤) | 0 | `7b793710…c847267` = 요청값, `git status --porcelain` 34줄(시작과 같음) |

- E2E(`npm run test:e2e`)는 B6에 화면·DOM 변경이 없어 실행하지 않았습니다. 구현자 결과(22 passed)는 확인하지 않은 값으로 둡니다.
- 복사본의 Vite 캐시는 복사본 `vite.config.ts`의 `cacheDir`를 복사본 안(`b6rev/.vitecache`)으로 돌려 저장소 `node_modules`에 쓰지 않았습니다. 다른 작업 폴더(`b6`, `b7`, `b6val`)는 건드리지 않았습니다.
- 복사본·스크립트·로그 위치: `/private/tmp/claude-502/-Users-kyw-Documents-git-mine-driving-game/2642adfa-eec0-4a82-a7b1-33ae4d479b80/scratchpad/`(`b6rev/`, `b6rev_mutate.py`, `b6rev_pins.py`, `b6rev_mutate.log`, `b6rev_mutate_pinned.log`). 저장소 안 파일은 이 보고서 외에 만들거나 고치지 않았습니다.
