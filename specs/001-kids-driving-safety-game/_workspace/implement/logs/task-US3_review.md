# Task US3 Code Review Report (연습 고르기·레이싱 열림 T063~T067 + UI 그림 T103)

## 판정: APPROVE (with comments)
## 시도: 1/2

- revision 요청값 / 읽기 전 / 테스트 후: `1d0665f202c79e07f161564ab88991c42a29f7bdb04cfac18f5e89f50a060936` / `1d0665f2…0936` / `1d0665f2…0936` (세 값 일치, PROJECT_ROOT에서 `python3 ivi-agent-guide/scripts/review-snapshot.py "$PWD" "$PWD/specs/001-kids-driving-safety-game"`)
- 읽은 프로젝트 지침과 적용 기준: `AGENTS.md`를 가장 먼저 읽고 적용 → 역할 파일 `ivi-agent-guide/claude-config/agents/spec-implement-reviewer.md`, `ivi-agent-guide/orca-cross-review.md`(보고서 필드·snapshot 규칙). IVI Java/Spring·Lombok·JPA·`mvn` 기준은 적용하지 않음. 기준 = TypeScript + three.js + Vite 프로젝트의 기존 코드 컨벤션(`src/ui/*.ts`, `src/app/flow.ts`, `tests/e2e/*.spec.ts`), `contracts/overview.md` 공통 규칙(글은 `textContent`만, 링크 없음, `RunState`는 flow만 바꿈), `contracts/modules.md` 6.1·7·8.3·12장(함수 소속·시그니처), npm 스크립트
- constitution: `.specify/memory/constitution.md`는 템플릿 자리표시자뿐(사용자 결정: 이 프로젝트는 확정 규칙 없음) — 판정 근거로 쓰지 않음

| 항목 | 값 |
|---|---|
| run / task / dispatch / 실제 도구 / 세션 handle | Orca 없음 — 사용자 결정(Codex 복구 전까지 Claude 에이전트, 2026-10-12)으로 Claude Code 서브에이전트 `spec-implement-reviewer`(Opus 5.5)가 실행. Dispatch·handle 없음 |
| FEATURE_DIR / 단계 / 검토 태스크 | `/Users/kyw/Documents/git/mine/driving_game/specs/001-kids-driving-safety-game` / implement / T063·T064·T065·T066·T067·T103 |
| validator 보고서 / 판정 | `_workspace/implement/logs/task-US3_validation.md` 맨 위 "시도 2" / COMPLETE · PASS, 같은 revision `1d0665f2…0936` |
| 검토 범위 | `git diff HEAD`의 `src/app/flow.ts`, `src/ui/screens.ts`, `src/ui/hud.ts`, `src/ui/overlays.ts`, `src/style.css`, `tests/e2e/credits.spec.ts` + 새 파일 `tests/e2e/storage.spec.ts`, `src/assets/images/ui/*.svg` 40개. 문서(`tasks.md`·`00_context.md`·`records/play-check.md`)는 변경 범위 확인만 |
| 검토 깊이 | 사용자 결정 "가벼운 리뷰": 변경 코드 읽기 + 테스트 실행. 의심 지점이 테스트 설계로 이미 막혀 있어 변이 시험·임시 수정은 하지 않음(저장소 안에는 이 보고서만 씀) |
| 검증 상태 | COMPLETE |
| 역할 판정 | APPROVE with comments (필수 수정 없음, 비필수 제안 9건) |
| 미해결 질문·지적 / 이전 지적 처리 | 미해결 질문 없음. 이전 US8 리뷰 비필수 제안 ①②③은 이번 변경 줄과 겹치지 않아 그대로 남음(아래 제안 9) |

### 실행한 테스트

| 명령 (PROJECT_ROOT) | 종료 코드 | 결과 |
|---|---|---|
| `review-snapshot.py` (읽기 전) | 0 | `1d0665f2…0936` = 요청값 |
| `npm run typecheck` | 0 | `tsc --noEmit` 오류 없음 |
| `npm test` | 0 | 14 files, 130 passed |
| `npm run build` | 0 | 성공(500 kB 청크 경고는 기존과 같음) |
| `npm run test:e2e -- tests/e2e/storage.spec.ts tests/e2e/credits.spec.ts` | 0 | 16 passed(storage 6건 + credits 2건 × Chromium Pixel 7 가로·WebKit iPhone 14 가로). 저절로 사라짐 시험이 엔진마다 약 11초 |
| SVG 검사: `grep -liE '<script\|href\|foreignObject\|\bon[a-z]+\s*=\|<image\|<text\|@import\|data:\|javascript:\|<style\|<iframe\|<embed\|<object\|<use' src/assets/images/ui/*.svg` | 1 | 일치 없음. 쓰인 태그는 `svg`·`g`·`path`·`rect`·`circle`·`clipPath`뿐, `url(...)`은 파일 안 `url(#c)` 9개뿐(외부 주소 아님). 40개 모두 XML 파싱 성공, 합계 41,846바이트 |
| `grep -rnE 'innerHTML\|outerHTML\|insertAdjacentHTML\|eval\(\|new Function\|createElement\('a'\)\|\.href\|window\.open\|console\.(log\|debug)\|debugger\|TODO\|FIXME' src tests/e2e/storage.spec.ts tests/e2e/credits.spec.ts` | 1 | 일치 없음 |
| `grep -rn "done=\|has('done')\|get('done')" src` | 1 | T067 점검용 진입점(`?done=`)이 저장소 코드에 없음 확인 |
| `review-snapshot.py` (테스트 후) | 0 | `1d0665f2…0936` = 요청값. `dist/`·`test-results/`는 Git 무시 대상 |

---

### 코딩 컨벤션
- [✓] 화면 함수 모양: `showStart`·`showPracticeMenu`(`src/ui/screens.ts:39-80`)가 기존 `showPick`·`showCredits`처럼 `ui.replaceChildren(...)`, 그림은 기존 `picture()`, 버튼은 기존 `button()` 도우미(`screens.ts:20-27`)를 재사용하고 `aria-label`로 이름을 붙임. `menu-row` 만드는 방식도 `showPick`의 `pick-row`와 같음
- [✓] 모듈 상태: `let raceHint`(`screens.ts:36`) + `flashRaceLocked()`는 `hud.ts`의 `let stopEl` + `flashStopFirst()`와 같은 짜임
- [✓] `restart()`를 `hud.ts`에서 `screens.ts`로 옮겨 export(`screens.ts:29-34`): 두 파일이 같이 쓰게 되었고, `hud.ts`가 이미 `picture`를 `screens.ts`에서 가져오므로 반대 방향 import(순환)를 피한 자리. 본문은 한 글자도 바뀌지 않음(주석만 `//` → `/** */`)
- [✓] 화면 전환 처리: `onRace`(`flow.ts:114-119`)·`onScenarioPick`(`flow.ts:146-151`)이 "지금 화면이 맞을 때만" 규칙(`flow.ts:107` 주석)의 `if (state.screen !== …) return;` 모양을 따름. `return setScreen(...)` / `return flashRaceLocked()`도 기존 `load()`의 `return setScreen('loadFailed')`와 같은 모양
- [✓] 함수 소속: `trackConfigKey`는 `race/race.ts`(modules.md 6.1), `commitSave(current, 'tutorial', key)`는 modules.md 7장 시그니처 그대로(`flow.ts:217`). `startFlow(stage, run, storageOk)` 시그니처는 그대로 두고 키를 flow 안에서 다시 계산(`flow.ts:83`) — 계약을 바꾸지 않는 쪽이 맞음
- [✓] `RunState` 쓰기는 `flow.ts`에서만(`tutorialDone`·`storageNoticeShown`·`practiceStarted`), UI 파일은 읽기 전용 값(`raceOpen`, `ReadonlySet<ScenarioId>`)만 받음(overview 공통 규칙 10)
- [✓] 타입: `PlaySession['mode']`(`flow.ts:80`)를 다시 써 새 타입을 만들지 않음. `mode === 'race'` 분기에서 좁혀진 값으로 `play`를 만들어 `as` 없이 타입 통과
- [✓] 자리값 상수: `UNLOCK_TICKS`(`flow.ts:60`)와 CSS `notice-out` 10초(`style.css:175`)가 기존 `PRAISE_TICKS`처럼 "자리값(T117)" 주석을 붙임
- [i] `SCENARIO_LABELS`(`screens.ts:58-62`)는 차량·인물이 이름을 콘텐츠 데이터의 `label` 필드에 두는 기존 방식과 다름. 다만 `ScenarioDef`에는 계약상 `label`이 없어(content-data.md 14행, data-model.md 150행) 넣으려면 계약 변경이 필요하고, `Record<ScenarioId, string>`이라 빠짐은 타입이 막음. 지금은 쓰는 곳이 하나(접근성 이름)라 그대로 두는 것이 맞음 → 제안 4
- [i] 같은 규칙 "조작 익히기를 먼저 할지"가 두 곳에 다른 모양으로 있음: `flow.ts:142-144`(`if (run.drivingLessonDone) enterPractice(chosen); else enterLesson();`)와 `flow.ts:148-150`(`if (!run.tutorialDone && !run.drivingLessonDone) enterLesson(); else enterPractice(id);`). 앞쪽은 `tutorialDone`이 거짓인 분기 안이라 결과는 같음 → 제안 3

### 보안 (contracts/overview.md 공통 규칙 4·5)
- [✓] 글은 `textContent`만: 저장 불가 안내 문구 `overlays.ts:55`. `innerHTML` 등 HTML 주입 경로 0건(위 검색)
- [✓] 링크 없음: 새 화면에 `<a>` 없음, E2E가 `practiceMenu`까지 `a[href]` 0 확인(`credits.spec.ts:27-50`)
- [✓] SVG 40개: 스크립트·이벤트 속성·외부 참조·`<image>`·`<text>`·`<style>` 없음. 모두 `<img src>`로만 쓰여 문서와 분리됨(`screens.ts:13-17`). `clipPath id="c"`가 여러 파일에 같지만 `<img>`마다 따로 된 문서라 충돌 없음
- [✓] 저장: `commitSave`·`loadSave`는 던지지 않는 계약(modules.md 7장)이고 flow는 `boolean`만 봄. 저장하는 값은 메모리 값 세 개(`tutorialDone`·`best`·`sound`)뿐 — 외부 입력을 그대로 쓰는 곳 없음
- [✓] 터치 통과: `.storage-notice`는 `pointer-events: none`, 닫기 버튼만 `auto`(`style.css:173`, `194`). `.race-hint`는 `#ui`의 `pointer-events: none`을 물려받아 가운데에 떠도 시작·레이싱 버튼을 막지 않음

### 불필요한 코드
- [✓] 쓰이지 않는 import·변수 없음(typecheck 통과, 새 import `TRACK`·`trackConfigKey`·`commitSave`·`showRaceUnlocked`·`showStorageNotice`·`flashRaceLocked`·`showPracticeMenu`·`SCENARIOS` 모두 사용)
- [✓] 임시 흐름 정리: 첫 배포 때 임시로 둔 `sequenceDone` 집합과 그 주석, "세 번째 완료 처리는 T065" 주석, `storageOk`가 "이후 태스크에서 씀"이라던 주석이 모두 사라지고 실제 처리로 바뀜(`flow.ts:62`, `153`, `186`)
- [✓] 자리표시 도형 CSS: 그림 파일이 생겨 안 쓰이게 된 `.shape-play`·`.shape-info`·`.shape-back`·`.shape-control-*`·`.shape-cue-*`·`.shape-gear-*`·`.shape-stop-first`·`.shape-game-paused`·`.shape-praise`·`.shape-violation`을 모두 지움. 남은 `.shape-rule`(`style.css:490-498`)은 규칙 그림(T102) 전이라 실제로 쓰임(`overlays.ts:25`). 코드의 `picture()` 호출 24곳이 가리키는 그림이 모두 있어(`ls src/assets/images/ui` 40개와 대조) 스타일 없는 빈 자리표시가 나오는 곳 없음
- [✓] 그림 40장 모두 코드에서 쓰임(쓰이지 않는 파일 없음 — validator 확인과 같음)
- [✓] 주석 처리된 코드·디버그 로그 없음. T067의 점검 진입점은 저장소 밖 복사본에만 있었고 코드에 남지 않음(`records/play-check.md`에 밝힘)
- [i] `picture(id, shape)`의 자리표시 경로(`screens.ts:8-12`)와 모든 호출의 `shape` 인자는 지금 `rule` 하나만 의미가 있음. 구현 메모 5대로 T102 전까지 필요하므로 남기는 것이 맞음 → 제안 5

### 변경 최소성
- [✓] 코드 변경이 T063~T065·T103 범위에 한정됨: 시작 화면 레이싱 버튼·잠김 안내, 연습 목록, 저장 불가 안내·축하, flow 연결, 그림 크기 CSS
- [✓] `hud.ts`는 `restart` 이동에 따른 import 한 줄 + 함수 삭제뿐
- [✓] `style.css:23-26` 3D 캔버스 숨김(시작·크레딧·연습 목록)은 이번 변경으로 새로 생긴 전환(연습 → 축하 → 시작, 인물 고르기 → 연습 목록)에서 직전 3D가 비치던 문제를 막는 것이라 범위 안. `play-check.md`에 발견 경위가 기록됨
- [✓] `tasks.md` 변경은 T084·T089·T103 문구 세 줄(validator Q1 처리, 체크 상태는 그대로)
- [✓] 레이싱 화면(`flow.ts:131-134`)은 tasks T065 "→ `race`(경기는 T077)"까지만 — 경기를 미리 만들지 않음. 다만 배포 관점의 주의가 있음 → 제안 1

### 테스트 품질
- [✓] `storage.spec.ts`의 저장소 예외 시험(30-68행)은 안내를 닫지 않은 채 `elementFromPoint`로 "다음"·조작 버튼 6개를 확인 → 띠가 다시 버튼 위로 오거나 `pointer-events: none`이 빠지면 실패함. `MutationObserver`로 `storageNotice`가 켜진 횟수(상승 횟수)를 세어 "실행당 1회"를 직접 확인. 62행에서 띠가 아직 보이는지 먼저 확인해 "이미 사라져서 통과"하는 경우도 막음
- [✓] 저절로 사라짐 시험(70-82행)이 DOM 제거와 `data-overlays` 해제를 둘 다 확인 → `animationend` → `onClose` 연결이 끊기면 잡힘
- [✓] 새로 고침 시험(92-110행)은 두 번 새로 고침 뒤 저장값이 그대로인지(덮어쓰기 없음)까지 확인
- [✓] `credits.spec.ts` 링크 시험은 화면 전환(`data-screen`)을 확인한 뒤 `a[href]` 0을 확인해 "화면이 안 바뀌어서 통과"를 막는 기존 방식 그대로 `practiceMenu`를 더함
- [i] 이번 덩어리에서 가장 중요한 새 흐름 "세 번째 완료 → 같은 틱 저장 → 칭찬 → 축하 → 시작"(`flow.ts:211-235`)은 자동 시험이 없고 T067 수동 확인(저장소 밖 진입점)으로만 확인됨. tasks T066이 정한 5건 범위 밖이라 지금 요구하지 않음 → 제안 6
- [i] 같은 형 변환 `(window as unknown as { __noticeOn: number })`이 세 번 반복(`storage.spec.ts:39`, `42`, `66`) → 제안 8

### REJECT 수정 요청
- 없음

---

### 개선 제안 (비필수)

**지금 확인 권장**

1. **레이싱 화면은 T077 전까지 막다른 곳**: 열린 레이싱 → 차량·인물 고르기 → `setScreen('race')`(`flow.ts:133`)는 `#ui`를 바꾸지 않아 인물 고르기 화면(눌러도 반응 없는 "다음" 버튼)과 조작 버튼만 보이고, 되돌아갈 버튼도 없음(일시정지는 T084). `.github/workflows/deploy.yml`이 `main` 푸시마다 공개 배포하므로, 이 덩어리를 커밋하더라도 **US4 경기 연결(T077) 전에는 `main`에 푸시하지 않는 것**을 리더가 확인해 주십시오(구현 메모 3과 같은 판단). 코드 수정 요청은 아님

**이후 태스크로**

2. **저장 불가 띠 자리**(validator 참고 사항 1과 같은 내용 + 하나 더): 띠가 보이는 최대 10초 동안 위쪽 가운데 "다음 행동 그림"(`.hud-cue`)을 덮고, 낮은 가로 화면에서는 연습 목록 카드 윗부분을 덮음. 또 `max-width: calc(100vw - 208px)`(`style.css:167`)에 화면 가장자리 안전 영역(`env(safe-area-inset-left/right)`)이 빠져 있어 노치가 있는 아이폰 가로 화면에서는 왼쪽 위 기어 표시와 약 40px 겹칠 수 있음(Playwright는 안전 영역을 흉내 내지 않아 시험에 안 잡힘). 자리값을 다듬는 T117 때 ① `max-width: calc(100vw - 208px - env(safe-area-inset-left) - env(safe-area-inset-right))`, ② `showStorageNotice`가 자기 `hide`를 돌려주고 flow가 플레이 화면(`PLAY_SCREENS`)에 들어갈 때 부르는 식(시작 화면·고르기 화면에서는 그대로 보임)을 검토하기를 권함
3. **"조작 익히기 먼저" 분기 한 곳으로**: `flow.ts:142-144`와 `148-150`을 작은 도우미 하나로 합치면 규칙이 한 군데에만 남음. 예: `const begin = (id: ScenarioId) => { chosen = id; if (!run.tutorialDone && !run.drivingLessonDone) enterLesson(); else enterPractice(id); };` → `onCharacterNext`의 처음 이용 흐름은 `begin(nextScenario()!)`, `onScenarioPick`은 화면 확인 뒤 `begin(id)`. 다음에 `flow.ts`를 만지는 T077 때 함께
4. **연습 이름 위치**: `SCENARIO_LABELS`(`screens.ts:58-62`)를 쓰는 곳이 둘이 되면(예: 음성 T081, 결과 화면) 차량·인물처럼 `content/scenarios.ts`로 옮기는 것을 검토(그때는 contracts/content-data.md·data-model.md `ScenarioDef`에 `label`을 함께 적어야 함)
5. **자리표시 경로 정리**: 규칙 그림 38장(T102)이 들어오면 `picture()`의 `ASSET_URLS[id] === undefined` 분기(`screens.ts:8-12`), 모든 호출의 `shape` 인자, `.shape-rule` CSS가 모두 쓰이지 않게 됨. T102(또는 T084·T089에서 남은 UI 그림까지 생긴 뒤)에서 함께 지우기를 권함
6. **세 번째 완료 흐름의 자동 확인**: `flow.ts:211-235`(같은 틱 저장, 저장 실패 시 안내 1회, 칭찬 → 축하 → `start`, 처음 이용 흐름의 다음 상황)는 지금 사람 확인 기록만 있음. 레이싱 E2E(T078)나 마무리 점검 때 이 경로를 자동으로 다시 확인할 방법(예: 이미 있는 `?e2e` 관찰 범위 안에서)을 검토하기를 권함
7. **`animationend` 대상 한정**: `overlays.ts:52`의 `animationend`는 자식 요소의 애니메이션 끝에서도 올라와(버블링) 불림. 지금은 띠 안에 애니메이션이 있는 자식이 없어 문제없지만, 나중에 닫기 버튼에 눌림 애니메이션 등을 넣으면 띠가 먼저 닫힘. 이 파일을 다시 만지는 T084·T089 때 `notice.addEventListener('animationend', (e) => e.target === notice && hide());`처럼 띠 자신의 애니메이션만 받게 하기를 권함
8. **시험 코드 형 변환 한 번만**: `storage.spec.ts:39·42·66`의 `(window as unknown as { __noticeOn: number })`를 파일 위쪽 `type NoticeWindow = Window & { __noticeOn: number };` 하나로 묶으면 읽기 쉬움. 아주 작은 정리라 다음에 이 파일을 고칠 때
9. **이전 묶음(US8) 리뷰 제안 그대로 남음**: ① `flow.ts:120-121` `onCredits`·`onCreditsBack`의 `&&` 모양 — 이번에 바로 위에 `if` 모양의 `onRace`가 생겨 차이가 더 눈에 띔. ② `credits.spec.ts:21` `c.changes!`. ③ `showPick`의 다음 버튼도 `button()` 도우미로. 이번 변경 줄이 아니므로 손대지 않은 것이 변경 최소성 원칙에 맞음. 다음에 이 파일들을 고칠 때(T077·T082) 함께

### 참고 — validator 참고 사항 2(문서 문구)
- 안내가 뜨는 때가 코드에서는 "시작 화면이 처음 나올 때"(`flow.ts:62` 주석, `flow.ts:291`)이고 `data-model.md:646-647`·`contracts/storage.md:69`는 "부팅/실행 시작 때"로 적혀 있음. 코드 주석이 이유(로딩이 길면 보호자가 보기 전에 저절로 사라짐)까지 밝혀 읽기에는 문제없음. 문서 한 줄 맞추기는 스펙 문서 담당(리더) 판단으로 넘김
