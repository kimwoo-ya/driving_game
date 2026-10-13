# Task B5 Code Review Report

- run / task / dispatch / 실제 도구 / 세션 handle: (Orca 미사용 — Claude Code 서브에이전트 spec-implement-reviewer, 사용자 결정 2026-10-12 "Codex 복구 전까지 Claude 에이전트", 00_context.md 승인 기록)
- FEATURE_DIR / 단계 / 검토 태스크: `/Users/kyw/Documents/git/mine/driving_game/specs/001-kids-driving-safety-game` / implement / B5 = T043~T047 + B4 reviewer 비필수 제안 1번(drivingLesson.test.ts 두 분기 고정)
- revision 요청값 / 읽기 전 / 테스트 후: `f63003dfded3ded6e62537d3b9dcc9e1c014bb2afbd8fff1a0bc3a9f65783e5a` / `f63003dfded3ded6e62537d3b9dcc9e1c014bb2afbd8fff1a0bc3a9f65783e5a` / `f63003dfded3ded6e62537d3b9dcc9e1c014bb2afbd8fff1a0bc3a9f65783e5a` (세 값 같음. `git status --porcelain` 33줄, 시작 때와 같음)
- validator 보고서 / 판정 / revision: `_workspace/implement/logs/task-B5_validation.md` / COMPLETE·PASS(T043~T047 + B4 제안 1번 모두 PASS, 미해결 질문 0) / `f63003df…783e5a`(요청값과 같음) → 리뷰 시작 조건 충족
- 원문 및 코드 근거 (파일:라인): 아래 태스크별 표와 항목별 절. 소스는 PROJECT_ROOT, 피처 문서는 FEATURE_DIR 기준. 읽은 원문 = AGENTS.md, 역할 파일, orca-cross-review.md(머리 필드·snapshot 규칙), docs/PRD.md, GLOSSARY.md, contracts/overview.md(공통 규칙·의존 방향), contracts/modules.md(3.1·3.2·4.1~4.4·5·12장), tasks.md Phase 4(T043~T052), data-model.md(TownDef·SignalDef 행), 00_context.md, task-B5_impl.md, task-B5_validation.md, task-B4_review.md(형식·제안 1·변이 m1/m2 정의). constitution은 빈 양식(사용자 결정, 규칙 없음)
- 실행한 테스트 명령 / 종료 코드 / 결과: 아래 "직접 실행 기록". typecheck 0, `npm test` 0(13 files 104 passed), build 0, 변이 시험 20건(저장소 밖 복사본). E2E는 실행하지 않음(화면·DOM 변경 없음, 요청서의 선택 항목)
- 검증 상태: **COMPLETE**
- 역할 판정: **APPROVE with comments** — T043~T047·B4 제안 1번 6건 모두 APPROVE. 필수 수정 0건, 비필수 제안 5건(1번 테스트 보강이 우선 권장)
- 미해결 질문·지적 / 이전 지적 처리 결과: 미해결 질문 0건. B4 reviewer 비필수 제안 1번(drivingLesson.test.ts 두 분기 고정)은 반영 확인 — 같은 m1·m2 변이를 지금 소스에 다시 걸어 둘 다 잡힘(아래 변이 표). B4 제안 2·3(controls.ts 재측정 기준, style.css 중복 규칙)은 이번 묶음 범위가 아니어서 확인하지 않음. 이번 REJECT 없음

## 판정: APPROVE with comments
## 시도: 1/2

```
[Speckit-Context] implement phase
  ├ constitution: 빈 양식(사용자 결정, 규칙 없음). 프로젝트 기준은 AGENTS.md·PRD·GLOSSARY
  ├ spec: US2 세 안전 연습. 신호·보행자는 차 위치·멈춘 시간으로만 바뀜(FR-040), 보행자는 차가 멈췄거나
  │       멈출 수 있을 때만 출발(FR-039), 차·보행자 신호 동시 초록 없음(FR-042), 보행자 시점 안내는 틱으로만(FR-041·070),
  │       추가 규칙 순환(FR-091, SC-031), 건물에 닿으면 막고 감속(FR-035)
  ├ plan: 순수 폴더(sim·practice·pedestrianView·content…)는 three·DOM·시각·무작위 없음, step은 받은 state를 고치지 않음,
  │       시그니처 기준은 contracts/modules.md
  └ tasks: Phase 4 순수 함수 T043(townActors) T044(blockByAreas) T045(pedestrianView) T046(ruleRotation) T047(content #10).
          연습 엔진 T048~T051, 문서 맞춤 T052는 다음 묶음
```

## 적용 기준과 범위

- AGENTS.md를 역할 파일보다 먼저 읽고 치환표를 적용함. TypeScript 7.0.2 + three 0.186 + Vite 8 + Vitest 5 + Playwright 정적 게임(`package.json`). prettier·eslint 설정 없음 → 포맷·줄 길이는 기존 코드 기준.
- **적용하지 않은 IVI 전용 항목**: Lombok 패턴, DTO/Entity/Service/Repository 계층, SQL Injection(파라미터 바인딩), Mass Assignment(DTO 필드 제한), 인증·인가 — 서버·DB·REST가 없음(`contracts/overview.md:4`, AGENTS.md "역할별 프로젝트 기준"). "컨벤션 파악 불가 시 Spring Boot 관행"도 적용하지 않음. `mvn compile/test` 대신 `npm run typecheck`·`npm test`·`npm run build`.
- **대신 적용한 기준**: 기존 B1~B4 코드의 모양(짧은 한국어 주석 + FR 근거, 자리값 상수 묶음 표기 `// 자리값(plan O5): …에서 확정` — `src/sim/vehicle.ts:21`, `src/practice/scenario.ts:8`, find 뒤 `!` — `src/render/characters.ts:14`), overview 공통 규칙 1·3·4·5·7·8, 모듈 의존 방향, 테스트가 로직 파손을 실제로 잡는지(변이 시험).
- 스펙 정합성은 validator PASS를 존중하여 다시 판정하지 않음. data-model.md·modules.md에 `pedestrianSignal`·`TownPedestrian.ticks`·새 상수가 아직 없는 것은 T052 몫이라 지적하지 않음. T048~T062는 범위 밖.

## 태스크별 판정

| 태스크 | 판정 | 코드 품질 근거 |
|---|---|---|
| T043 townActors | APPROVE (제안 1·2·3·4) | `src/practice/townActors.ts` 117줄. 자리값 4개 표기가 기존 관례와 같음(`:8-12` ↔ `scenario.ts:8`). 제동 거리는 모듈 상수 하나(`:25`)로 한 번만 계산. 신호 상태 기계는 신호마다 if/else-if 한 줄 = 전이 하나(`:82-92`)이고 위에 전이 순서 요약 주석(`:81`, `:88`), `stoppedTicks`의 뜻과 깨지면 생기는 문제를 함수 주석에 적음(`:61-64`) — 읽기 쉬움. 바뀌지 않은 신호·보행자는 같은 객체를 돌려줌(`:97`, `:110`). 받은 state를 고치지 않음. `nv!`/`np!`(`:96`)는 안전함(그 id가 목록에 있으면 `v`/`p`가 정의되고 이후 문자열 값만 대입) — 다만 없앨 수 있음(제안 2). 변이 생존 7건은 아래 "테스트 품질" |
| T043 `scenarios.ts` 수정(파일 목록 밖) | APPROVE | 변경은 3줄: 타입 필드 1(`src/content/scenarios.ts:26`)과 값 2(`:94`, `:119`). tasks.md T043이 "ActorPlan으로 세 상황을 표현할 수 있는지 확인"을 요구했고, 파일 자체 주석(`:22` "잠정 형식 … 연습 엔진(T043·T052)에서 확정")이 이 자리의 형식 변경을 예정해 둠. `SignalDef`(`src/content/town.ts:13`)에 차·보행자 신호 짝을 가리킬 필드가 없어 기존 데이터로 대신할 수 없음을 확인 → 최소 변경이며 구현 로그 메모 2에 이유가 있음. 문서 반영은 T052 |
| T044 blockByAreas | APPROVE (제안 1) | `src/sim/collision.ts` 15줄. 원-사각형 최근접점 거리 하나(`:5-9`), 판정 크기는 `DRIVING_SPEC.bodyRadius`만. 막히면 `{ ...next, x: prev.x, z: prev.z, speed: 0 }`(`:14`) 한 줄. 다만 테스트가 사각형 1개로만 확인해 "여러 구역 중 아무거나"가 고정되지 않음(변이 C2 생존) → 제안 1 |
| T045 pedestrianView | APPROVE | `src/pedestrianView/pedestrianView.ts` 42줄. 진행은 `cardTicks`·`introTicks`·`durationTicks`만(`:28-32`), 운전 입력 매개변수 없음. 특수 값(`card = rules.length` 끝남, `cardTicks = -1` 되감기 직후)을 타입 필드 주석에 적음(`:7-8`). `SAFETY_RULES.find(…)!`(`:15`)는 `render/characters.ts:14`와 같은 관례(RuleId 타입이 존재를 보장). 테스트가 내보내는 이름 목록을 고정해 "건너뛰기 함수 없음"을 구조로 확인(`pedestrianView.test.ts:35-38`) |
| T046 ruleRotation | APPROVE | `src/practice/ruleRotation.ts` 32줄. `RunState`는 `import type`(`:1`)이라 순수 폴더 규칙을 지킴. 핵심/추가 고르기를 `rulesOf` 하나로 두 함수가 함께 씀(`:8-9`). 추가 0개일 때 0 나누기 방지(`:31`). 테스트의 `vi.doMock`은 `afterEach`에서 `doUnmock`+`resetModules`(`ruleRotation.test.ts:8-11`)로 다른 시험에 새지 않음 |
| T047 content #10 | APPROVE | `tests/unit/content.test.ts:62-79`. 실제 `isReplay`→`pickRules`→`advanceExtraCursor`를 flow 순서대로 이어 부르는 시험이라 세 함수의 연결을 함께 고정함. 기존 `rulesOf` 도우미(`:15-16`) 재사용 |
| B4 제안 1번 | APPROVE | `tests/unit/drivingLesson.test.ts:72-85`. 앞 세 단계에서 멈춘 채 탭 1번 → `forward`(`:75`, `:78`, `:84`), 자연 감속 정지·정지 뒤 브레이크는 통과 아님(`:81-85`). B4 m1·m2를 지금 소스에 다시 걸어 둘 다 잡힘. 소스 `drivingLesson.ts`는 B4 이후 수정 시각 변화 없음(아래 "변경 범위") |

## 보안 (overview 공통 규칙 4·5)

| 검사 | 결과 |
|---|---|
| `src/`에서 `innerHTML|outerHTML|insertAdjacentHTML|eval(|new Function|getUserMedia|geolocation|requestPermission|DeviceMotionEvent|https?://|fetch(|<a |createElement('a')|.href` | `src/app/loader.ts:36` `fetch` 1건(B3, 같은 출처)과 `src/assets/models/CREDITS.md`(문서) 뿐. **B5 파일 0건** |
| 순수 폴더·B5 시험에서 `from 'three'|document.|window.|globalThis|localStorage|Math.random|Date.|performance.|setTimeout|setInterval|console.` | 0건 |
| 신뢰 경계 | B5 함수는 콘텐츠 상수와 엔진 내부 state만 받음. 외부 입력(localStorage·네트워크)을 받지 않으므로 실행 중 검사 불필요(공통 규칙 9) |

## 순수 폴더·의존 방향 (공통 규칙 3, 의존 방향)

| 파일 | import | 판단 |
|---|---|---|
| `src/practice/townActors.ts:1-6` | content(type), `core/loop`(`TICK_HZ`), `sim/vehicle`, `./scenario`(type) | 허용. `core/loop`는 규칙 3이 순수 모듈의 `TICK_HZ` 사용을 명시. `scenario.ts`↔`townActors.ts`는 서로 `import type`뿐이라 실행 시 순환 없음(`drivingLesson.ts:3`과 같은 방식) |
| `src/practice/ruleRotation.ts:1-3` | `app/session`(type), content | `import type`이라 앱 코드가 번들 경로로 들어오지 않음. modules.md 4.1 "의존" 행과 같음 |
| `src/sim/collision.ts:1-2` | content(type), `./vehicle` | 허용 |
| `src/pedestrianView/pedestrianView.ts:1-2` | content | 허용 |

## 결정성 (공통 규칙 1·7)

- 시각·무작위·전역 가변 상태 0건(위 grep). 이벤트 순서는 입력 배열 순서(`townActors.ts:95-100`). `Infinity`(`:75`)는 `greenAfterStoppedTicks`가 없을 때 "바뀌지 않음"을 뜻하는 값으로 쓰였고 결과가 결정적임.
- step 함수가 받은 객체를 고치지 않음: 모든 갱신이 전개 연산자로 새 객체(`townActors.ts:54`, `:58`, `:99`, `:110`, `:113`; `pedestrianView.ts:33`, `:41`; `collision.ts:14`).

## 불필요한 코드

- `tsc --noEmit --noUnusedLocals --noUnusedParameters`: 지적 2건 모두 B5 이전 코드 — `src/app/flow.ts:54` `storageOk`(B3·B4 reviewer가 이미 판단, T065에서 씀), `tests/unit/content.test.ts:183`(B4 보고서의 `:163`이 #10 추가로 20줄 밀린 것). **B5 파일의 미사용 import·변수 0건.**
- 주석 처리된 코드·디버그 출력 0건.
- 내보낸 상수: `POSE_TICKS`·`FLASH_TICKS`·`STOP_MARGIN`은 시험이 기준값으로 씀(`townActors.test.ts:7`, `:5`, `:10`). `WALK_SPEED`는 파일 밖에서 쓰는 곳이 없지만 같은 자리값 묶음을 내보내는 기존 관례(`vehicle.ts:22`, `scenario.ts:9-11`)와 같고 T052가 상수 표에 올릴 예정이라 유지 가능(제안 3).
- 중복 도우미: `headingOf`(`townActors.ts:26`), 제동 거리(`:25`), `rulesOf`(`ruleRotation.ts:8`)와 같은 일을 하는 함수가 `src/`에 없음(grep `atan2`·`brakeDeceleration`·`.tier` 확인). 시험 쪽 `GAP`(`townActors.test.ts:18`)·`ids`(`ruleRotation.test.ts:5`)는 구현과 따로 계산하는 기준값이라 중복으로 보지 않음.
- `townActors.ts:84`의 `stoppedTicks < goAt`은 지금 흐름에서 다른 조건과 겹쳐 결과를 바꾸지 않음(변이 M4 생존). "진행 신호 뒤에는 보행자 초록을 다시 켜지 않음"이라는 의도를 드러내는 방어 조건이고 `:90`의 같은 조건과 짝이라 그대로 두는 것을 권장(조치 불필요).

## 변경 범위

- B4 리뷰 시각(21:45) 뒤 수정된 소스·시험 파일은 정확히 요청서 목록 11개: `src/practice/townActors.ts`, `src/practice/ruleRotation.ts`, `src/sim/collision.ts`, `src/pedestrianView/pedestrianView.ts`, `src/content/scenarios.ts`, `tests/unit/{townActors,collision,pedestrianView,ruleRotation,content,drivingLesson}.test.ts`(`find -newer` 결과). 다른 `src/` 파일 변경 없음.
- `tasks.md`의 HEAD 대비 차이는 T001~T042 체크 표시 42쌍뿐(체크 외 글자 차이 0, 직접 비교). `contracts/modules.md` 차이는 B4의 "후진 탭" 행 1줄(B4에서 확인된 것).
- `scenarios.ts` 파일 목록 밖 수정은 위 표대로 정당함.

## 테스트 품질 — 변이 시험 (저장소 밖 복사본, 한 번에 한 곳, 매번 원상 복구 확인)

| # | 바꾼 곳 | 결과 | 고정할지 |
|---|---|---|---|
| M1 | `townActors.ts:92` 차 초록 `goAt` → `goAt − 100` | 생존(8 passed) | **권장**(제안 1). 보행자 신호가 없는 구간에서 "진행 신호 전에는 차 초록 아님" 아래쪽 경계가 비어 있음. 기존 시험 `:166-168`에 한 줄 |
| M2 | `:86` 깜빡임 → 빨강 `goAt − 1` | 생존 | 불필요. 차 초록이 `:92`에서 따로 `goAt`을 보므로 바깥에 보이는 결과는 "둘 다 빨강" 1틱 |
| M3 | `:86` "건너는 사람 없음" 제거 | 생존 | 불필요. 차 초록은 `:92`가 건너는 사람을 따로 막음 |
| M4 | `:84` `stoppedTicks < goAt` 제거 | 생존 | 불필요(위 "불필요한 코드" 마지막 항목) |
| M5 | `:91` 노랑 → 빨강에서 `speed === 0` 제거 | 생존 | **권장**(제안 1). 정지 구역 앞에서 멈추면 노랑이 남고 보행자 초록도 안 켜짐 |
| M6 | `:91` 빨강 지점 `stopZone.fromS` → `stopLineS` | 생존 | **권장**(제안 1). 노랑 시점은 앞뒤 틱으로 고정했는데(`test:53-54`) 빨강은 한쪽만(`test:56`) |
| M8 | `:109` `playerStopped` 조건 `> 0` → `>= 0` | 생존 | **우선 권장**(제안 1). `playerStopped`의 뜻 자체("차가 멈추기 전에는 출발 안 함")가 고정되지 않음. crossing-check(T053)가 기댈 조건 |
| R1 | `:103` `>= BRAKE_GAP` → `>` | 생존 | 불필요. 부동소수 경계(38 − 33.8 = 4.200…003)라 의미 있는 차이 아님 |
| R2 | `:47` 걷는 속도 2배 | 생존 | 불필요. `WALK_SPEED`는 자리값 |
| R3 | `:112` 마지막 행동 1틱 짧게 | 생존 | 불필요(1/60초) |
| R4 | `:83` 차 신호 없을 때도 보행자 신호 변화 | 잡힘(1 failed) | — |
| R5 | `:76` 건너는 사람 판정 항상 거짓 | 잡힘(2 failed) | — |
| V1 | `pedestrianView.ts:41` 되감기 `cardTicks: -1` → `0` | 잡힘 | — |
| V2 | `pedestrianView.ts:41` intro 되감기 `card: -1` → `0` | 잡힘 | — |
| C1 | `collision.ts:8` `<` → `<=` | 생존 | 불필요(경계 같음 처리, 의미 있는 차이 아님) |
| C2 | `collision.ts:13` 첫 사각형만 검사 | 생존 | **권장**(제안 1). T048이 마을 건물 여러 개를 넘기면 둘째 건물부터 통과하는 실수를 잡지 못함 |
| Q1 | `ruleRotation.ts:25` 추가 규칙 2칸씩 건너뜀 | 잡힘(2 failed) | — |
| Q2 | `ruleRotation.ts:31` `extrasCount` 무시 | 잡힘(2 failed) | — |
| m1 | `drivingLesson.ts:31-34` 앞 단계에서도 멈춘 채 탭이면 기어 전환(B4 m1) | 잡힘(1 failed) | B4 제안 반영 확인 |
| m2 | `drivingLesson.ts:40` `state.drive.speed > 0` 제거(B4 m2) | 잡힘(1 failed) | B4 제안 반영 확인 |

- validator가 넘긴 생존 7건(M1~M6, M8)을 같은 방식으로 재현함. 모두 코드는 맞고 tasks.md T043이 요구한 시험 항목은 다 있으므로 **승인을 막지 않음**(B4 m1·m2와 같은 처리). 그중 M8·M6·M5·M1과 C2 다섯 곳은 시험 몇 줄로 고정할 가치가 있어 제안 1로 둠.

## REJECT 수정 요청

없음.

## 개선 제안 — 승인 조건 아님

1. **(우선 권장) 생존 변이 5곳 고정 — 시험만, 소스 변경 없음.** 다음 묶음(T048 연습 엔진이 이 함수들에 기대기 전)에 넣기를 권장.
   - M8 — `tests/unit/townActors.test.ts`의 "멈췄거나 … 밖일 때만" 시험(`:116-139`) 끝이나 새 `it`에:
     ```ts
     // playerStopped: 차가 멀리 있어도 멈추기 전(stoppedTicks 0)에는 준비하지 않음
     const quiet: SegmentDef = { ...SEG, signal: null, plan: { ...SEG.plan, pedestrianSignal: null, pedestrians: [{ ...SEG.plan.pedestrians[0], start: 'playerStopped' }] } };
     let q: Actors = initActors(quiet);
     for (let i = 0; i < 1000; i++) q = step(q, 0, 0, DRIVING_SPEC.maxForwardSpeed, quiet);
     expect([q.pedestrians[0].state, q.pedestrians[0].ticks]).toEqual(['waiting', 0]);
     ```
   - M6 — `:56` 다음 줄에 노랑과 같은 모양으로 `expect(log[redAt - 1].frontS).toBeLessThan(SEG.stopZone.fromS);`
   - M5 — 같은 시험이나 새 `it`에: `let y = step(initActors(SEG), RED_AT, 0, DRIVING_SPEC.maxForwardSpeed);` → `y = step(y, SEG.stopZone.fromS - 5, 0, 0);` → `expect(light(y, 'main-vehicle')).toBe('red');`(정지 구역 앞에서 멈춰도 빨강)
   - M1 — `:166`과 `:168` 사이에 `expect(light(step({ signals: red, pedestrians: [crossed] }, 37, GO_AT - 1, 0, seg), 'main-vehicle')).toBe('red');`
   - C2 — `tests/unit/collision.test.ts`에 `expect(blockByAreas(at(6), at(7.2), [{ minX: 100, minZ: 0, maxX: 110, maxZ: 1 }, WALL]).hit).toBe(true);`(닿은 구역이 둘째여도 막힘)
   - 위 다섯 줄을 복사본에 넣어 각 변이를 다시 돌리면 잡히는 것까지 확인하기를 권장(이번 검토에서는 시험을 추가하지 않았으므로 확인하지 않음).
2. **`townActors.ts` 가독성 소소한 정리(동작 동일).** (가) `:96` `nv!`·`np!` → `nv ?? s.light`·`np ?? s.light`로 단언 제거. (나) `:79`의 신호 값 `p`가 `:76` 화살표 매개변수 `p`(보행자)와 이름이 겹침 → 신호 값은 `carLight`/`walkLight`(또는 `v`→`car`, `p`→`walk`)처럼 구분. (다) `:88` 위에 "차 신호는 이번 틱에 정한 보행자 신호(np)를 보므로 같은 틱에 둘 다 초록이 될 수 없음(FR-042)" 한 줄 — 보행자 → 차 계산 순서가 동시 초록을 막는 핵심인데 지금은 코드 순서로만 드러남.
3. **T052 문서 맞춤 때 `contracts/modules.md` 12장 표도 함께.** `src/practice/townActors.ts` 행이 `SignalState`, `TownPedestrian`만 적고 있음 → 새 상수 `POSE_TICKS`·`WALK_SPEED`·`FLASH_TICKS`·`STOP_MARGIN` 추가(validator 목록 7번은 data-model.md 6.4만 적음). `WALK_SPEED`를 렌더러(T058)도 쓰지 않으면 T117 상수 확정 때 export를 빼는 것을 검토.
4. **T055 콘텐츠 검사 후보 보강.** `SignalId` 타입만으로는 신호 종류가 막히지 않음 → `segment.signal`은 `TOWN.signals`의 `kind: 'vehicle'`, `plan.pedestrianSignal`은 `kind: 'pedestrian'`을 가리키는지 확인(validator "T052가 문서에 반영할 것" 8번에 더할 항목). 보행자 경로 점 2개 이상(`initActors`가 `path[1]`을 읽음, `townActors.ts:37`)은 validator 목록에 이미 있음.
5. **(사소) `tests/unit/townActors.test.ts:37`** `DRIVING_SPEC.maxForwardSpeed / 60` → `/ TICK_HZ`(공통 규칙 1의 상수 이름 사용).

## 직접 실행 기록 (PROJECT_ROOT, 저장소 쓰기는 이 보고서와 아래 명령이 만드는 무시 대상 산출물뿐)

| 명령 | 종료 코드 | 결과 |
|---|---|---|
| `python3 ivi-agent-guide/scripts/review-snapshot.py <PROJECT_ROOT> <FEATURE_DIR>` (읽기 전) | 0 | `f63003df…783e5a` = 요청값 |
| `npm run typecheck` | 0 | 오류 없음 |
| `npm test` | 0 | Test Files 13 passed, Tests 104 passed |
| `npm run build` | 0 | 성공, 500 kB 청크 경고(기존과 같음). `dist/`는 `.gitignore` 대상이라 snapshot 밖 |
| `npx tsc --noEmit --noUnusedLocals --noUnusedParameters` | 1 | 지적 2건 모두 B5 이전 코드(위 "불필요한 코드") |
| `python3 -I scratchpad/b5rev_mutate.py` (복사본 `scratchpad/b5rev/`, 스크립트가 경로가 `/private/tmp/`로 시작하고 저장소 밖인지·작업 위치가 복사본인지 단언, `npx vitest run <해당 시험>`) | 0 | 20건: 잡힘 9, 생존 11(위 표). 끝에 복사본 `src`와 저장소 `src`가 같음을 `diff -rq`로 확인 |
| snapshot (테스트·변이 시험 뒤) | 0 | `f63003df…783e5a` = 요청값, `git status --porcelain` 33줄(시작과 같음) |

- E2E(`npm run test:e2e`)는 B5에 화면·DOM 변경이 없어 실행하지 않음. 구현자 결과(22 passed)는 확인하지 않은 값으로 둠.
- 복사본·스크립트·로그 위치: `/private/tmp/claude-502/-Users-kyw-Documents-git-mine-driving-game/2642adfa-eec0-4a82-a7b1-33ae4d479b80/scratchpad/`(`b5rev/`, `b5rev_mutate.py`, `b5rev_*.log`). 저장소 안 파일은 이 보고서 외에 만들거나 고치지 않음.
