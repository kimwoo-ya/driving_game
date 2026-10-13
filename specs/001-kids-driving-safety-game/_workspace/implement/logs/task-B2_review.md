# Task B2 Code Review Report

- 검토일: 2026-10-12
- run / task / dispatch: `run_43739cd2a087` / `task_3690285f95db` / `ctx_dafb46e82e38`
- 실제 도구 / 세션 handle: Codex / `term_f9cb362f-6bbc-44da-ae70-7ab4aab20534` (B1과 같은 세션)
- PROJECT_ROOT: `/Users/kyw/Documents/git/mine/driving_game`
- FEATURE_DIR: `/Users/kyw/Documents/git/mine/driving_game/specs/001-kids-driving-safety-game`
- 단계 / 검토 태스크: speckit implement / B2 T007~T021
- revision 요청값: `44a8ae51636ddd2b55873e97d2ab58b4767696783f20f8951bd71d2773b8b826`
- revision 읽기 전: `44a8ae51636ddd2b55873e97d2ab58b4767696783f20f8951bd71d2773b8b826`
- revision 테스트 후: `44a8ae51636ddd2b55873e97d2ab58b4767696783f20f8951bd71d2773b8b826`
- 원문 및 코드 근거(파일:라인): 아래 태스크별 표와 개선 제안. 소스는 PROJECT_ROOT, 설계 문서는 FEATURE_DIR 기준.
- 실행한 테스트 명령 / 종료 코드 / 결과: 아래 실행 기록. 타입 검사·테스트 63건·빌드 직접 확인.
- 검증 상태: **COMPLETE**
- 역할 판정: **APPROVE with comments** — T007~T021 각 APPROVE. 필수 수정 0건, 비필수 개선 제안 2건.
- 미해결 질문·지적 / 이전 지적 처리 결과: 차단 질문·필수 지적 없음. validator의 T016 공유 기본값 문제는 수정과 재현 테스트를 직접 확인했으며 해결 상태입니다. 아래 제안은 승인 조건이 아닙니다.

## 판정: APPROVE with comments

## 시도: 1/2

같은 revision의 validator COMPLETE/PASS를 확인하고 새 코드·테스트 전부를 읽었습니다. 현재 구현에서 반드시 수정해야 할 코드 품질 문제를 발견하지 못했습니다. 기능 요구사항 전체를 다시 판정하지 않고 구조·보안·읽기 쉬움·불필요 코드·변경 범위를 검토했습니다.

## 적용한 기준

B1에서 역할 파일보다 먼저 읽은 AGENTS.md·PRD·GLOSSARY와 필수 원문(constitution, spec, plan, data-model, contracts 7종, research, quickstart, tasks)을 같은 세션에서 계속 적용했습니다. B2 구현 로그·validator 보고서의 수정 이력과 tasks.md의 실제 diff를 추가로 확인했습니다. constitution은 사용자 결정대로 확정 규칙으로 쓰지 않습니다.

TypeScript 정적 게임의 `import type`, 순수 로직과 브라우저 API의 분리, 동기 함수 호출, 저장 경계의 입력 검사, 상태 소유 규칙을 적용했습니다(`contracts/overview.md:24`, `:26`, `:28`, `:29`, `:30`, `:31`; `plan.md:156`, `:335`). 서버·DB·REST·Lombok·Spring 계층·SQL Injection 검사는 이 프로젝트에 해당하지 않습니다(`contracts/overview.md:4`).

운전 성능·시간·좌석·마을·트랙은 승인된 자리값 단계입니다. 실제 값 조정이나 아직 예정되지 않은 UI·렌더러 구현을 이 묶음의 승인 조건으로 추가하지 않았습니다. 검토자가 작성한 파일은 이 보고서뿐입니다.

## 태스크별 판정

| 태스크 | 판정 | 코드 품질 근거 |
|---|---|---|
| T007 Pages 소스 설정 | APPROVE | 소스 변경 없는 사용자 작업입니다. 읽기 전용 `gh api repos/kimwoo-ya/driving_game/pages --jq .build_type`가 종료 0·workflow였습니다. 배포·푸시 동작은 수행하지 않았습니다. |
| T008 고정 시간 루프 | APPROVE | `src/core/loop.ts:8`의 계산 부분과 `:19`의 브라우저 루프가 분리되어 있고, 브라우저 전역을 import 시점에 읽지 않습니다. 부동소수 보정 이유가 `:5`에 있습니다. 간격·상한·누적 검사는 `tests/unit/loop.test.ts:18`에서 확인했습니다. |
| T009 차량·인물 목록 | APPROVE | `src/content/vehicles.ts:1`은 공통 좌표 타입을 type import하고, 카탈로그는 `as const satisfies`로 검사합니다(`:10`, `src/content/characters.ts:11`). 별도 로딩·성능 로직이나 불필요한 카탈로그 클래스를 만들지 않았습니다. |
| T010 목록 검사 | APPROVE | `tests/unit/content.test.ts:10`의 Record가 ID 추가 시 빠진 기대값을 타입 검사에서 드러내고 `:60`, `:65`, `:72`가 목록·좌석·클립을 확인합니다. 데이터 검사를 런타임으로 중복시키지 않았습니다. |
| T011 차량 계산 | APPROVE | `src/sim/vehicle.ts:36`은 공통 성능으로 새 state를 반환하며 입력을 변경하지 않습니다. 브레이크 우선·속도 제한·정지·조향 범위 처리가 한 곳에 있고 `:56`의 후진 거절은 요청을 저장하지 않습니다. `tests/unit/vehicle.test.ts:22`, `:104`가 경계 동작과 여러 프레임 간격의 결과를 확인합니다. |
| T012 성능 데이터 검사 | APPROVE | `tests/unit/content.test.ts:114`가 유한 양수와 속도 관계를 검사해 자리값을 조정할 때 잘못된 데이터를 걸러냅니다. 외형별 성능 값을 새로 만들지 않았습니다. |
| T013 마을·연습 데이터 | APPROVE | `src/content/town.ts:1`, `src/content/scenarios.ts:1`의 의존성은 type import뿐입니다. `src/content/scenarios.ts:77`의 작은 자리표시 생성 함수는 실제 두 항목에 재사용하며 추가 설정 체계를 만들지 않았습니다. |
| T014 구간 데이터 검사 | APPROVE | `tests/unit/content.test.ts:80`에 현재 데이터의 범위 검사와 안내 위치 검사가 있습니다. 현재 값은 유효합니다. `afterStep`의 음수·소수까지 검사하도록 보완하는 비필수 제안을 아래에 적었습니다. |
| T015 규칙 콘텐츠 | APPROVE | `src/content/rules.ts:12`의 데이터 타입과 `:29`의 표 형식 데이터로 표현·게임 로직을 분리했습니다. 문자열을 HTML이나 코드로 실행하지 않습니다. `tests/unit/content.test.ts:17`부터 규칙 수·배정·필수 행동을 확인합니다. 상수 이름 제안은 아래에 있습니다. |
| T016 저장 | APPROVE | `src/storage/save.ts:15`에서 unknown을 항목별로 검사하고 허용 필드만 새 객체에 옮깁니다. localStorage 접근 전체가 `:44`, `:65`의 try 안에 있고 반환 실패를 UI와 분리합니다. `:52`의 기본 소리 설정은 호출별 새 객체입니다. `tests/unit/save.test.ts:86`, `:103`, `:151`의 수정 재현·저장 실패·탭 간 병합 검사를 확인했습니다. |
| T017 트랙 데이터 | APPROVE | `src/content/track.ts:5`에서 구조를 선언하고 `:20`에 자리표시 데이터만 둡니다. 원격 리소스나 렌더러 의존성이 없습니다. `tests/unit/content.test.ts:92`는 트랙 경계와 복귀 후보를 데이터 단계에서 검사합니다. |
| T018 기록 표시 | APPROVE | `src/race/race.ts:3`, `:9`는 구성 키와 시간 표시만 계산합니다. 작은 pad2 함수는 여러 자릿수에 재사용하며 날짜 API·상태·저장을 끌어오지 않습니다. `tests/unit/race.test.ts:11`에서 분·시간 경계와 소수 단위를 확인합니다. |
| T019 실행 상태 | APPROVE | `src/app/session.ts:20`은 저장값을 받아 실행 상태를 구성하고 `:25`, `:28`에서 실행별 집합·순환 위치를 새로 만듭니다. 전역 저장소를 다시 읽거나 화면을 변경하지 않습니다. `tests/unit/session.test.ts:4`의 세 검사를 확인했습니다. |
| T020 보행자·안내 타입 | APPROVE | `src/practice/townActors.ts:6`과 `src/pedestrianView/pedestrianView.ts:3`, `:10`은 type import와 타입 선언만으로 구성되어 동작 없는 골격을 임의 로직으로 채우지 않았습니다. |
| T021 연습 타입·상수 | APPROVE | `src/practice/scenario.ts:9`의 자리 상수 및 `:15`, `:32`의 state/event 타입만 추가했습니다. 관련 타입은 type import하고 이벤트 버스·화면 API·미사용 런타임 import를 추가하지 않았습니다. |

## 개선 제안 — 승인 조건 아님

1. **T015, `src/content/rules.ts:26`: `D`를 `DEFAULT_RULE_DURATION_TICKS`처럼 시간 단위가 드러나는 이름으로 바꾸면 좋겠습니다.** `contracts/overview.md:22`는 게임 시간 상수를 `*_TICKS`로 표기하며 같은 묶음의 연습 상수도 이 규칙을 따릅니다. 현재 동작에는 영향이 없는 이름 차이이므로 REJECT 사유로 보지 않습니다.
2. **T014, `tests/unit/content.test.ts:86`: 안내 인덱스의 정수·하한 검사도 추가하면 좋겠습니다.** 현재 `afterStep < steps.length`만 확인하여 `afterStep = -1`이나 `0.5`도 통과할 수 있습니다. 현재 세 항목의 값은 모두 `1`로 정상입니다. 콘텐츠를 바꿀 때 실수를 잡도록 `Number.isInteger(afterStep)` 및 `afterStep >= 0`을 검사하고 segment에도 같은 기준을 쓰면 의도가 명확합니다. 런타임 방어 코드를 추가할 필요는 없습니다(`contracts/overview.md:30`의 콘텐츠 검사는 빌드·테스트에서 수행한다는 기준).

제안을 반영하여 코드·테스트가 바뀌면 교차 검증 절차대로 새 revision의 validator 확인 후 reviewer에 전달하십시오. 그대로 진행해도 현재 APPROVE는 유효합니다.

## 보안·불필요 코드·변경 범위

- 저장값은 JSON으로 파싱한 뒤 객체·타입·유한한 정수 범위를 검사하고 알려진 필드만 반환합니다. 저장 예외는 호출자에게 성공 여부로 전달하며 기존 기록을 더 나쁜 값으로 대체하지 않도록 최신 값을 읽고 합칩니다(`src/storage/save.ts:24`, `:31`, `:65`).
- 순수 폴더에 DOM·three·AudioContext·무작위·실제 시간 타이머가 없습니다. loop는 런타임 브라우저 접근을 함수 안으로 제한합니다. 새 네트워크·권한·코드 삽입 API는 없습니다.
- 새 내보내기 중 아직 앱에서 호출하지 않는 함수·타입은 명시적으로 요청한 기반 모듈입니다. 이후 연결 태스크를 위한 요구사항이므로 불필요 코드로 판단하지 않았습니다. `src/main.ts`는 여전히 부팅 자리표시입니다.
- 변경은 지정된 소스·테스트와 이미 승인한 여섯 준비 태스크의 완료 표시에 한정됩니다. 의존성 추가·기존 에셋 변경·무관한 정리는 없습니다.

## 직접 실행 기록

| 명령 | 종료 코드 | 결과 |
|---|---|---|
| 표준 snapshot 명령(원문 읽기 전 / 테스트 후) | 0 / 0 | 모두 상단 요청 revision과 같음 |
| `gh api repos/kimwoo-ya/driving_game/pages --jq .build_type` | 0 | workflow |
| `npm run typecheck` | 0 | 통과 |
| `npm test` | 0 | 6개 파일, 63개 테스트 통과 |
| `npm run build` | 0 | TypeScript·Vite 통과 |
| 아래 순수 폴더 금지 패턴 `rg` | 1 | 일치 0건(기대 결과) |
| 아래 소스 보안 패턴 `rg` | 1 | 일치 0건(기대 결과) |
| `git diff -- specs/001-kids-driving-safety-game/tasks.md`, `git status --short` | 0 | tasks 변경은 T001~T006 체크뿐, 새 소스·테스트 범위 확인 |

```sh
python3 ivi-agent-guide/scripts/review-snapshot.py /Users/kyw/Documents/git/mine/driving_game /Users/kyw/Documents/git/mine/driving_game/specs/001-kids-driving-safety-game
rg -n 'Date\.now|setTimeout|setInterval|Math\.random|from .three|document\.|window\.|AudioContext' src/sim src/practice src/pedestrianView src/race src/storage src/content
rg -n 'innerHTML|outerHTML|insertAdjacentHTML|eval\(|new Function|getUserMedia|geolocation|requestPermission|DeviceMotionEvent|fetch\(|https?://' src --glob '*.ts'
```

전체 테스트에 여섯 대상 파일이 모두 포함되므로 파일별 테스트를 중복 실행하지 않았습니다. 현재 빌드의 앱 진입점에는 이 모듈들이 아직 연결되지 않았으므로 빌드 성공을 게임 플레이 성공으로 해석하지 않습니다. 이번에는 E2E·실제 기기·모델 화면·공개 배포를 검사하지 않았습니다.

## 조율 이력

- B2 요청: `msg_8bdeccd6a0e1`, 수신 응답: `msg_94e1b9d99d45`.
- validator 저장 기본값 수정 이력은 `task-B2_validation.md`에 있으며 해당 테스트를 포함한 최신 63건을 직접 실행했습니다.
- 새 필수 수정 요청과 질문은 없습니다. 같은 Dispatch에서 다음 검토·재검토 또는 close-review를 기다립니다.
