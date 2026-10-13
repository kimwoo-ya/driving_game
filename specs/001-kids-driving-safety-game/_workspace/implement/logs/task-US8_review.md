# Task US8 Code Review Report (크레딧 T094~T096)

- run / task / dispatch / 실제 도구 / 세션 handle: 해당 없음 / 해당 없음 / 해당 없음 / Orca 미사용 — Claude Code 서브에이전트 spec-implement-reviewer, 사용자 결정 2026-10-12 / 해당 없음
- FEATURE_DIR / 단계 / 검토 태스크: `/Users/kyw/Documents/git/mine/driving_game/specs/001-kids-driving-safety-game` / implement / US8 덩어리 T094~T096 + `src/style.css` `#controls[data-demo]` 한 줄 + tasks.md T063 메모 한 줄
- validator 보고서 / 판정 / revision: `_workspace/implement/logs/task-US8_validation.md` 상단 "재확인" / COMPLETE · PASS(조건 없음) / `b1cce070a1ef48834974c19f8cac4bbf63132cc2017fb525c6f2fe0c5d486494`
- revision 요청값 / 읽기 전 / 테스트 후: `b1cce070a1ef48834974c19f8cac4bbf63132cc2017fb525c6f2fe0c5d486494` / `b1cce070a1ef48834974c19f8cac4bbf63132cc2017fb525c6f2fe0c5d486494` / `b1cce070a1ef48834974c19f8cac4bbf63132cc2017fb525c6f2fe0c5d486494` (세 값 일치)
- 검토 깊이: 가벼운 리뷰(사용자 결정 2026-10-12) — 변경 코드 읽기, 기존 패턴·보안·불필요 코드·변경 범위·테스트 품질 판단. 의심 지점이 없어 변이 시험·탐색은 하지 않음
- 읽은 원문: `AGENTS.md`, 역할 파일 `ivi-agent-guide/claude-config/agents/spec-implement-reviewer.md`(AGENTS.md 치환 — Java/Lombok/Spring 기준 대신 TypeScript·Vite 프로젝트의 기존 코드 컨벤션), `ivi-agent-guide/orca-cross-review.md`(보고서 필드·snapshot 규칙), `.specify/memory/constitution.md`(템플릿 자리표시자뿐 — 확정 규칙 없음, 판정 근거로 쓰지 않음), `contracts/overview.md` 공통 규칙 1~10(18~35행)·48행, `contracts/modules.md` 443~467행(파일별 공개 타입·`import type` 규칙), `task-US8_impl.md`, `task-US8_validation.md`
- 원문/코드 근거 (파일:라인): 아래 항목별
- 실행한 테스트 명령 / 종료 코드 / 결과:

| 명령 (PROJECT_ROOT) | 종료 코드 | 결과 |
|---|---|---|
| `python3 ivi-agent-guide/scripts/review-snapshot.py <PROJECT_ROOT> <FEATURE_DIR>` (읽기 전) | 0 | `b1cce070…6494` = 요청값 |
| `npm run typecheck` | 0 | `tsc --noEmit` 오류 없음 |
| `npm test` | 0 | 14 files, 130 passed |
| `npm run build` | 0 | 성공(500 kB 청크 경고는 기존과 같음) |
| `python3 ivi-agent-guide/scripts/review-snapshot.py <PROJECT_ROOT> <FEATURE_DIR>` (테스트 후) | 0 | `b1cce070…6494` = 요청값 |

  E2E(`npm run test:e2e`)는 요청 범위 밖이라 실행하지 않음. 구현 로그(26 passed)와 validator 보고서의 결과를 참고만 함

- 검증 상태: COMPLETE
- 역할 판정: APPROVE with comments
- 미해결 질문·지적 / 이전 지적 처리 결과: 미해결 질문 없음. 차단 지적 없음. 비차단 제안 3건(아래). 이전 지적 없음(US8 첫 리뷰)

## 판정: APPROVE (with comments)
## 시도: 1/2

### 코딩 컨벤션
- [✓] 폴더·파일 위치: `src/content/credits.ts`가 `Credit`, `CreditId`, `CREDITS`를 내보냄(modules.md 450행과 같음). 다른 폴더 타입은 `import type`만 사용(`credits.ts:1-2`, modules.md 467행)
- [✓] 순수 로직 폴더 규칙: `src/content/credits.ts`에 `three`·DOM·Web Audio import 없음(overview 공통 규칙 3)
- [✓] 콘텐츠 데이터 모양: 다른 콘텐츠 파일처럼 `export const X: readonly T[]`. 반복 값은 파일 안 상수(`CC_BY`, `CC0`, `CHECKED_ON`, 변경 문구 3개)와 작은 생성 함수 `vehicle()`로 묶어 8행이 짧고 읽기 쉬움(`credits.ts:18-77`)
- [✓] 화면 함수 모양: `showStart`·`showCredits`가 기존 `showPick`과 같이 `ui.replaceChildren(...)`, 그림은 기존 `picture()` 자리표시 규칙(`screens.ts:5-17`) 재사용, 버튼은 `aria-label`로 이름 붙임(`screens.ts:19-26`)
- [✓] 화면 전환: `flow.ts:87-88`이 기존 `setScreen` 분기 모양 그대로, `flow.ts:104-105`가 "지금 화면이 맞을 때만" 규칙(`flow.ts:98` 주석)을 따름. 상태를 바꾸는 곳은 `app/flow.ts`뿐(공통 규칙 10)
- [✓] 스타일: 새 클래스 `.corner-button`·`.shape-info`·`.shape-back`·`.credits`가 기존 `.big-button`·`.shape-play`와 같은 짜임, 주석 말투도 같음(`style.css:56-113`)
- [✓] E2E 짜임: `credits.spec.ts:4-9`의 `screen`·`toStart` 도우미는 `flow.spec.ts:11·26`과 같은 파일별 도우미 방식
- [i] 비차단 ① `flow.ts:104-105` `const onCredits = () => state.screen === 'start' && setScreen('credits');`는 바로 위 `onStart`(`flow.ts:100-103`)·아래 `onVehicleNext`의 `if (state.screen !== …) return;` 모양과 다름. 동작은 같음. 다음에 이 파일을 만질 때 `if` 모양으로 맞추면 읽기 쉬움

### 보안 (contracts/overview.md 공통 규칙 4·5)
- [✓] 글은 `textContent`만: `screens.ts:47` `Object.assign(document.createElement('p'), { textContent: t })`. `src/` 전체에서 `innerHTML`·`insertAdjacentHTML`·`outerHTML`·`eval(`·`new Function`·`createElement('a')`·`href` 검색 결과 0건
- [✓] 링크 없음: 원출처·라이선스 주소는 `<p>` 안 글자(`screens.ts:42-43`). E2E가 4개 화면에서 `a[href]` 0을 확인(`credits.spec.ts:28-43`)
- [✓] 외부 요청 없음: 주소는 문자열 데이터일 뿐 요청하는 코드 없음. 새 글꼴·CDN·외부 그림 없음(자리표시 도형은 CSS)
- [✓] 글자 선택 허용 범위: `user-select: text`는 `.credits` 목록 안에만(`style.css:101-102`). 나머지 화면은 `body`의 `user-select: none`(`style.css:10-11`) 그대로라 조작 중 글자 선택 막기(FR-020)에 영향 없음. `.credits`의 `pointer-events: auto`·`touch-action: pan-y`도 목록에만 적용되고 운전 화면에는 나오지 않음

### 불필요한 코드
- [✓] 쓰이지 않는 import·변수 없음(typecheck 통과, `credits.ts`·`screens.ts`·`credits.spec.ts` import 모두 사용)
- [✓] 주석 처리된 코드·디버그 로그 없음
- [✓] 새 도우미 `button()`(`screens.ts:19-26`)은 시작·크레딧·돌아가기 버튼 3곳에서 씀 — 한 번만 쓰는 추상화 아님
- [i] 비차단 ② `credits.spec.ts:21` `c.changes!` 느낌표 단언. 지금 8행은 모두 변경 문구가 있어 문제없지만, 나중에 음원처럼 `changes: null` 행이 생기면 시험이 엉뚱하게 깨짐. 그때 `if (c.changes)` 조건으로 바꾸면 됨

### 변경 최소성
- [✓] 변경이 T094~T096 범위에 한정됨: 새 파일 2개, `screens.ts`의 시작 화면 버튼 추가·크레딧 화면, `flow.ts` 3줄(분기 1 + 처리 함수 2), `content.test.ts` #19 한 건, 스타일 추가
- [✓] `style.css:131-133` `#controls[data-demo]` 한 줄은 US2 리뷰 비필수 제안을 받아들인 것으로 구현 로그에 기록됨. 다른 강조 선택자는 손대지 않음
- [✓] `tasks.md` T063 줄의 덧붙임 한 문장은 T096에서 남긴 `practiceMenu` 검사를 화면을 만드는 태스크에 옮겨 적은 것(validator 미해결 질문 해소용). 체크 상태는 바꾸지 않음
- [i] 비차단 ③ 같은 `screens.ts` 안 `showPick`의 다음 버튼(`screens.ts:64-69`)도 새 `button()` 도우미로 만들 수 있지만, `disabled` 처리가 더 있고 이번 범위 밖이라 그대로 두는 것이 맞음. 나중에 이 화면을 고칠 때 고려할 만함(지금 수정 요청 아님)

### 테스트 품질
- [✓] #19(`content.test.ts:205-218`)는 ID 집합을 차량·인물 목록 상수(`VEHICLE_IDS`, `CHARACTER_IDS` — 타입으로 빠짐 없음 보장, 15~16행)와 비교해 행 누락·중복을 잡고, 행마다 kind·필수 필드·날짜 형식·라이선스를 확인. 실패 시 어떤 ID인지 보이게 `[id, 값]` 쌍으로 비교
- [✓] E2E 1번은 화면 글자를 `CREDITS` 데이터에서 직접 가져와 비교 → 데이터와 화면이 따로 놀면 잡힘. 2번은 화면마다 `data-screen` 전환을 확인한 뒤 `a[href]` 0을 확인해 "화면이 안 바뀌어서 통과"하는 경우를 막음

### REJECT 수정 요청
- 없음

### 개선 제안 (선택 사항)
- [선택] ① `flow.ts:104-105` 처리 함수를 주변과 같은 `if (state.screen !== …) return;` 모양으로
- [선택] ② `credits.spec.ts:21` `c.changes!` 대신 변경 문구가 있을 때만 확인
- [선택] ③ 나중에 선택 화면을 고칠 때 `showPick`의 다음 버튼도 `button()` 도우미 사용 검토
