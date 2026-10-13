# Task US2 Code Review Report

- run / task / dispatch / 실제 도구 / 세션 handle: Orca 미사용 — Claude Code 서브에이전트 spec-implement-reviewer, 사용자 결정 2026-10-12(00_context.md 승인 기록 "B5 이후 검증 방식", "검증 방식 재조정"). 깊이 = 가벼운 리뷰(변이 시험·무작위 탐색 없음, 의심 가는 곳 없음)
- FEATURE_DIR / 단계 / 검토 태스크: `/Users/kyw/Documents/git/mine/driving_game/specs/001-kids-driving-safety-game` / implement / US2 묶음 T053~T062(B7 T053~T056 + B6 reviewer 제안 반영분, B8 T057~T062 attempt 2)
- validator 보고서 / 판정 / revision: `_workspace/implement/logs/task-US2_validation.md` 맨 위(시도 2/2) / COMPLETE·PASS(T053~T062 모두 PASS, 미해결 질문 0) / `d4947e6cf21b2cfd4cfa2721940c11f0857532186e0a8b663e51927ae8c18567`(요청값과 같음) → 리뷰 시작 조건 충족
- revision 요청값 / 읽기 전 / 테스트 후: `d4947e6cf21b2cfd4cfa2721940c11f0857532186e0a8b663e51927ae8c18567` / `d4947e6cf21b2cfd4cfa2721940c11f0857532186e0a8b663e51927ae8c18567` / `d4947e6cf21b2cfd4cfa2721940c11f0857532186e0a8b663e51927ae8c18567` (세 값 같음, `git status --porcelain` 34줄 그대로)
- 원문 및 코드 근거 (파일:라인): 아래 각 절. 읽은 원문 = AGENTS.md(역할 파일보다 먼저), 역할 파일, orca-cross-review.md(머리 필드·snapshot 규칙), contracts/overview.md(공통 규칙 1~10·의존 방향), 00_context.md(승인 기록), task-B7_impl.md, task-B8_impl.md, task-US2_validation.md, task-B6_review.md(이전 제안). 검토 파일 13개 전체(아래 "검토 대상")
- 실행한 테스트 명령 / 종료 코드 / 결과 (PROJECT_ROOT에서):

| 명령 | 종료 코드 | 결과 |
|---|---|---|
| `python3 ivi-agent-guide/scripts/review-snapshot.py <PROJECT_ROOT> <FEATURE_DIR>` (읽기 전) | 0 | 요청값과 같음 |
| `npm run typecheck` | 0 | 오류 없음 |
| `npm test` | 0 | 14 files, 129 passed |
| `npm run build` | 0 | 성공(500 kB 청크 경고, 기존과 같음) |
| `npx tsc --noEmit --noUnusedLocals --noUnusedParameters` | 2 | 지적 2건 모두 이전 묶음 코드(`flow.ts:59` `storageOk` — T065 몫으로 주석 있음, `content.test.ts:240` `s`) — B5·B6 리뷰에서 판단 끝. 이번 변경분의 미사용 0건 |
| 보안·순수 폴더·디버그 grep(아래) | — | 위반 0건 |
| snapshot (테스트 후) | 0 | 요청값과 같음 |

  E2E는 실행하지 않음(요청서 선택 항목, validator가 같은 revision에서 22 passed 기록).
- 검증 상태: **COMPLETE**
- 역할 판정: **APPROVE with comments** — 필수 수정 0건, 비필수 제안 3건
- 미해결 질문·지적 / 이전 지적 처리 결과: 미해결 질문 0건. B6 reviewer 제안 1~6은 B7에서 반영(task-B7_impl.md "제안 반영", validator 확인) — 코드에서 `scenario.ts:77` `defOf` 한 곳 사용 확인. 이번 REJECT 없음

## 판정: APPROVE with comments
## 시도: 1/2

```
[Speckit-Context] implement phase
  ├ constitution: 빈 양식(사용자 결정, 규칙 없음). 프로젝트 기준은 AGENTS.md·PRD·GLOSSARY·contracts/overview 공통 규칙
  ├ spec: US2 세 안전 연습(signal-wait·crossing-check·turning-car). 완료 = 안내된 정지·대기·출발 + 보행자 시점 안내 끝까지,
  │       잘못된 행동은 위험 직전 멈춤·구간 다시, 경로 문제는 실패 아님, 무입력은 재안내·연속 실패 뒤 시범
  ├ plan: 순수 폴더(sim·practice·pedestrianView·content 등)는 three·DOM·시각·무작위 없음, 틱 단위, step은 새 state,
  │       화면 상태는 app/flow.ts만 바꿈, 렌더러·UI는 읽기만, 글은 textContent·링크 없음
  └ tasks: T053~T056 마을·구간 데이터·콘텐츠 검사·SC-009/010 시험, T057 Chicken Guy 동작, T058 마을 그리기·안내 카메라,
          T059 겹침·시범, T060 연습 화면 연결, T061 자세·카드 화면 점검, T062 플레이 확인
```

## 적용 기준과 범위

- AGENTS.md 치환표(:22-28) 적용: TypeScript + three + Vite + Vitest 정적 게임. Lombok·DTO/Entity 계층·SQL Injection·Mass Assignment·인증은 서버·DB·REST가 없어 적용하지 않음(`contracts/overview.md:4`). 포맷 설정(prettier·eslint)이 없어 기존 코드 모양을 기준으로 봄.
- 스펙 정합성은 validator PASS를 존중해 다시 판정하지 않음.
- 검토 대상: `src/content/town.ts`, `src/content/scenarios.ts`, `src/practice/townActors.ts`, `src/render/characters.ts`, `src/render/townView.ts`, `src/ui/overlays.ts`, `src/ui/hud.ts`, `src/ui/screens.ts`, `src/style.css`, `src/app/flow.ts`, `tests/unit/scenario.test.ts`, `tests/unit/townActors.test.ts`, `tests/unit/content.test.ts`.

## 태스크별 판정

| 태스크 | 판정 | 코드 품질 근거 |
|---|---|---|
| T053·T054 마을·구간 데이터 | APPROVE | `town.ts:51-55`·`:73`·`:76`과 `scenarios.ts:81-98`·`:178`의 짧은 주석이 데이터 값의 이유(빈 모퉁이, 정지선 = 횡단보도 앞 가장자리, 사용자 결정)를 바로 옆에 적어 기존 관례와 같음. `as const satisfies TownDef`/`ScenarioDef[]`(`town.ts:93`, `scenarios.ts:211`)로 ID 오타가 타입 검사에서 걸림. `LOOKS`(`:58`) 공통 상수로 세 상황 중복 없음. `TURN_STOP_LINE`(`:95-98`)의 경로 길이 계산은 content가 sim·practice 값을 import할 수 없는 의존 방향(overview "content ◀── sim") 때문에 지역 계산이 맞음 |
| T055 콘텐츠 검사 | APPROVE | `content.test.ts:127-138` #15는 `satisfies Record<ViolationKind, 1>`로 종류가 늘면 타입 검사가 먼저 잡음(같은 파일 `:14-15` 관례). #17(`:140-158`)·전제 시험(`:160-180`)이 townActors 상수(`BRAKE_GAP`과 같은 식, `FLASH_TICKS`, `POSE_TICKS`)를 그대로 가져다 써 데이터·엔진 전제가 어긋나면 실패함 |
| T056 SC-009·SC-010 시험 | APPROVE (제안 3) | `correctFor`(`scenario.test.ts:85-98`)가 세 상황 공통 운전자라 상황별 복사가 없음. "B7 검증 지적 재현" 3건(`:283-315`)이 사용자 결정 3개를 하나씩 고정. `blocked` 시험의 `vi.doMock`(`:229-252`)은 실제 마을 데이터를 바꾸지 않고 판정 목록만 비워 범위가 좁음 |
| townActors 깜빡임 조건(B7 attempt 2) | APPROVE | `townActors.ts:77`·`:86` 한 줄 조건 추가 + `:82` 순서 주석 갱신뿐인 최소 변경. 시험 `townActors.test.ts:196-198`이 고정 |
| T057 Chicken Guy 동작 | APPROVE | `characters.ts:88-102`가 매 프레임 쉬는 자세로 되돌린 뒤 덮어써 회전·이동이 쌓이지 않음. 모델 고유 사정(거울 이름 `HandL`, 팔 없음)을 상수 옆 주석으로 남김(`:12-16`). Idle·Walk 두 클립만 `action()`으로 만듦(`:58-66`) |
| T058 마을 그리기 | APPROVE (제안 1) | 렌더러는 상태를 읽기만 함(공통 규칙 10): `drawSignals`·`drawWalkers`·`drawView`가 `ScenarioAttempt`를 바꾸지 않음. 실제 시간은 깜빡임 꾸밈(`townView.ts:137`)과 클립 진행(`characters.ts:106`)에만 써 공통 규칙 1과 맞음. 보행자·주인공 객체는 처음 한 번 만들고 다시 씀(`:155`, `:179`) |
| T059 겹침·시범 | APPROVE (제안 2) | `overlays.ts` 37줄, 글은 `textContent`만(`:23`), 그림은 기존 `picture()` 재사용(자리표시 도형 포함). `hud.ts:44-50` `same` 비교 한 줄로 demoReplay 직후 hint가 시범을 지우지 않게 고친 것은 최소 변경. 버튼 대응은 CSS 선택자 두 줄(`style.css:136-137`)로 JS 분기 없음 |
| T060 연습 화면 연결 | APPROVE | `flow.ts:153-183` 사건별 분기가 events.md 2·3장 순서대로 한 함수에 모여 대조하기 쉬움. `enterPractice`에서 `showHud`(자식 교체) 뒤 `mountOverlay`(덧붙임) 순서라 겹침 층이 지워지지 않음(`:145-146`). 화면 상태(`controls.hidden`)는 flow만 바꿈(`:170`, `:174`). `flashRedirect`는 `restart` 도우미 재사용(`hud.ts:59-61`) |
| T061·T062 기록 | APPROVE | 소스 변경 없음(records 파일). validator가 점검용으로 쓴 `?check` 진입점은 저장소 밖 복사본에만 있고 `flow.ts`에는 `?e2e`(`:237`)뿐임을 확인 |

## 보안 (공통 규칙 4·5·9)

| 검사 | 결과 |
|---|---|
| 검토 소스 10개에서 `innerHTML\|outerHTML\|insertAdjacentHTML\|eval(\|new Function\|getUserMedia\|geolocation\|requestPermission\|https?://\|fetch(\|createElement('a')\|.href` | 0건 |
| 화면 글 | `overlays.ts:23` `textContent`만. 그림 주소는 `ASSET_URLS`(빌드 때 정해진 같은 출처 해시 파일)에서만 옴(`screens.ts:5`) |
| 신뢰 경계 | 새 코드는 콘텐츠 상수·엔진 state·이벤트만 받음. localStorage·네트워크 값 없음 → 실행 중 검사 불필요(규칙 9) |

## 순수 폴더·의존 방향 (공통 규칙 3, 의존 방향)

- `src/sim`, `src/practice`, `src/pedestrianView`, `src/content`, `src/race`, `src/storage`에서 `from 'three'|document.|window.|globalThis|localStorage|Math.random|Date.|performance.|setTimeout|setInterval|console.` → `storage/save.ts`의 `localStorage`(규칙 3이 허용한 한 곳, 이전 묶음)뿐.
- `townActors.ts:1-6`은 content·core/loop·sim 값과 `scenario`의 `import type`만. `townView.ts`는 practice를 `import type`으로만 읽음(`:7-9`).

## 불필요한 코드

- 미사용 import·변수·매개변수: 이번 변경분 0건(위 `tsc` 결과). 주석 처리된 코드·`console`·`debugger`·`TODO` 0건.
- 자리값 상수는 기존 관례대로 이름·단위 주석과 함께 파일 위쪽에 모음(`townView.ts:15-28`, `characters.ts:10-16`, `flow.ts:56`).

## 변경 범위

- 바뀐 소스는 B7·B8 구현 로그의 표와 같음. `scenarios.ts`·`town.ts`의 B8 수정은 카메라·신호 방향 데이터 값뿐이고 판정 값은 그대로(단위 시험 그대로 통과). `screens.ts`는 바뀌지 않았고 `picture()`만 재사용.
- `flow.ts`의 다시 시작 처리(`sequenceDone`, `:76`, `:114`)는 사용자 결정(00_context "B8 첫 배포 다시 하기")에 따른 임시 처리이며 주석(`:112`)에 T063·T065까지라고 적혀 있음.

## 개선 제안 (비필수)

1. **[선택] 경로 길이 계산 중복**: `townView.ts:187`의 꺾은선 길이 계산이 `practice/scenario.ts:117-118` `pathLength`와 같은 식. `pathLength`를 내보내 `townView.ts`에서 쓰면 한 곳이 됨(render → practice 값 import는 의존 방향상 허용). `scenarios.ts:95-98`은 의존 방향 때문에 지금처럼 두는 것이 맞음. 동작 영향 없음.
2. **[선택] 시범이 끝난 뒤 깜빡임이 돌아오지 않음**: `style.css:72-74`에서 `data-demo`가 있으면 `--cue-anim`이 `cue-demo … 4`로 바뀌어 2초 뒤 애니메이션이 끝나고, 같은 단계가 이어지는 동안(이제 `hud.ts:49`가 시범을 유지하므로 demoReplay 뒤에도) 강조 버튼이 깜빡이지 않는 고정 테두리로 남음. 무입력 재안내(repeat) 때도 이전부터 같았음. CSS 한 줄로 해결 가능: `--cue-anim: cue-demo 0.5s ease-in-out 4, cue-pulse 1.2s ease-in-out 2s infinite;`(두 애니메이션이 다른 속성 transform·outline-color를 씀). 테두리 자체는 남아 기능 영향은 작음 — T075·T110 화면 점검 때 함께 봐도 됨.
3. **[선택] 시험 종료 조건 설명**: `scenario.test.ts:309`의 `st.drive.z < 1 && st !== s && st.drive.speed === 0`은 "redirect로 구간 시작에 다시 놓인 틱"을 뜻하는데 처음 읽으면 알기 어려움. 끝에 짧은 주석 한 줄(`// redirect로 구간 시작에 다시 놓일 때까지`) 권장.

- 참고(내 영역 아님): validator 넘김 6(cue → 버튼 대응 stop·wait → 브레이크, go → 액셀을 events.md나 modules.md에 한 줄 기록)은 `style.css:130-131` 주석에만 있으므로 문서에 남기는 것에 동의함.
