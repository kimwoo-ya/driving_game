# Task US4 Code Review Report (레이싱 경기 T068~T078 + 미검토 4건: T124·보행자 시점 신호 수정·T102·T125 + 넘겨받은 반영분)

# 시도 2 (최신)

## 판정: APPROVE
## 시도: 2/2 (시도 1 "지금 확인 권장" 1~3 반영 재확인)

- revision 요청값 / 읽기 전 / 테스트 후: `13d3e093f3ff1beac71921bc7fa43d26e9d4fdc08eaeb20d1b9bce25751f2049` / `13d3e093…2049` / `13d3e093…2049` (세 값 일치, PROJECT_ROOT에서 같은 `review-snapshot.py` 명령, 두 번 모두 종료 0). validator PASS(`task-US4_validation.md` 맨 위 시도 2)와 같은 revision. 테스트 뒤 `git status --short` 46줄(시도 1 보고서 포함)로 시작 때와 같음, 4173·4273 포트에 남은 서버 없음
- 읽은 지침·기준: 시도 1과 같음(`AGENTS.md` 먼저 → 역할 파일 → `orca-cross-review.md` → PRD·용어집·`contracts/overview.md`). IVI Java/Spring 기준 적용하지 않음. 추가로 `task-US4_impl.md` "attempt 2" 절, `00_context.md` 승인 기록 맨 아래(2026-10-13 "3건 고친 뒤 커밋·배포")를 읽음
- 실행 도구: Claude Code 서브에이전트 `spec-implement-reviewer`(Opus 5.5), 시도 1과 같은 세션. Orca Dispatch·handle 없음(사용자 결정)
- 검증 상태: COMPLETE
- 검토 방법: 시도 1 revision의 저장소 밖 복사본(`scratchpad/reviewer-us4/copy/`)과 새 revision을 `diff -rq`로 비교해 바뀐 파일을 확정한 뒤 그 줄만 읽음. 변이 2건은 복사본에서만(포트 4273)

### 바뀐 파일 (시도 1 revision 대비, `_workspace` 제외)

| 파일 | 바뀐 내용 | 판단 |
|---|---|---|
| `src/input/controls.ts:108-118` | keydown 조건에 `\|\| e.ctrlKey \|\| e.metaKey \|\| e.altKey`, 주석 한 줄(브라우저 단축키로 둠, macOS keyup 미발생 이유) | 제안 1 그대로. keyup은 그대로라 조합 중 뗀 키도 지워짐(해 없음). `releaseAll`·`blur` 해제 경로 그대로 |
| `tests/e2e/touch.spec.ts:140-147` | 첫 키보드 시험 끝에 Meta·Control·Alt 각각 + `KeyA` → 왼쪽 버튼 눌림 없음, 실패 메시지에 조합 키 이름 | 기존 `pressed()` 도우미·`expect(…, key)` 모양 재사용 |
| `tests/e2e/touch.spec.ts:157-159` | 시작 화면에서 `keyboard.down('ArrowUp')` → 액셀 `data-pressed` 없음 → `up` | 제안 3 그대로 |
| `tests/unit/ai.test.ts:2` | `TRACK` import 삭제 | 제안 2 그대로 |
| `contracts/modules.md:59` | `mountControls` 행 키보드 문장에 "Ctrl·Cmd·Alt와 함께 누른 키면 keydown 무시(브라우저 단축키로 둠)" | 코드와 같은 내용. 문서 한 구절 |
| `tasks.md` | T068~T078·T102·T124·T125 체크 `[ ]` → `[X]`만(체크 칸을 빼고 비교하면 차이 없음) | 아래 참고 |

### 실행한 테스트

| 명령 | 종료 코드 | 결과 |
|---|---|---|
| `review-snapshot.py` (읽기 전) | 0 | `13d3e093…2049` = 요청값 |
| `npm run typecheck` | 0 | 오류 없음 |
| `npm test` | 0 | 16 files, 162 passed |
| `npm run build` | 0 | 성공(500 kB 청크 경고는 기존과 같음) |
| `npm run test:e2e` | 0 | 51 passed, 1 skipped(WebKit 전체화면, 의도) |
| `npx tsc --noEmit --noUnusedLocals --noUnusedParameters` | 1 | 남은 것은 HEAD부터 있던 `content.test.ts:260` `s` 1건뿐 → `ai.test.ts` 미사용 import 해소 확인 |
| (복사본) 변이 A: 조합 키 조건 제거 → `npx playwright test tests/e2e/touch.spec.ts -g 키보드 --project=chromium` | 1 | 첫 키보드 시험이 `not.toHaveAttribute`에서 실패 → 새 시험이 제안 1의 회귀를 잡음 |
| (복사본) 변이 B: `layer.hidden` 조건 제거 → 같은 명령 | 1 | 두 번째 키보드 시험이 실패(시도 1에서는 전체 e2e가 통과하던 변이) → 제안 3 해소 |
| `review-snapshot.py` (테스트 후) | 0 | `13d3e093…2049` = 요청값 |

### 이전 지적 처리 결과

| 시도 1 제안 | 결과 |
|---|---|
| 1 키보드 조합 키 | 해소 — 코드·주석·계약 문장·시험 모두 반영, 변이 A로 시험이 실제로 잡는 것 확인. macOS 실기 keyup 동작은 여전히 실기 미확인이나, 조합 키를 아예 받지 않으므로 그 경로로 눌림이 남을 일은 없음 |
| 2 `ai.test.ts` 미사용 import | 해소 |
| 3 키 무시 시험 약함 | 해소 — 제안한 형태 그대로, 변이 B로 확인 |
| 4~13 "이후" 제안 | 반영하지 않음(요청대로, 아래 시도 1의 반영 시점 그대로 유효) |

### 관점별 확인 (새 변경만)
- 기존 패턴: [✓] 조건 한 줄 추가로 끝나 새 추상화 없음. 주석은 "왜"만 적음. 시험은 기존 도우미·메시지 모양을 따름
- 보안: [✓] 새 DOM·외부 요청 없음. 조합 키를 받지 않아 브라우저 단축키를 가로채지 않음
- 불필요한 코드: [✓] 미사용 import 해소, 새 고아 없음
- 변경 최소성: [✓] 코드 1줄 + 주석 1줄, 시험 11줄, 문서 1구절. 지적 범위 밖 변경 없음
- 테스트 품질: [✓] 두 시험 모두 변이로 실패를 확인

### 참고 (판정과 무관)
- `tasks.md`의 체크 표시(`[X]`)가 리뷰 대상 revision 안에 들어 있음. 이번 리뷰가 승인이라 결과적으로 맞지만, 앞으로 리뷰가 거절될 수 있는 묶음에서는 체크를 승인 뒤에 하거나, 거절되면 되돌린다는 점만 리더가 기억해 주십시오

### REJECT 수정 요청
- 없음

---

# 시도 1

## 판정: APPROVE (with comments)
## 시도: 1/2

- revision 요청값 / 읽기 전 / 테스트 후: `d7f7100f697652bbfd4836923e127e235e54c18973b58c7e5669b85ee0a3301e` / `d7f7100f…301e` / `d7f7100f…301e` (세 값 일치, PROJECT_ROOT에서 `python3 ivi-agent-guide/scripts/review-snapshot.py "$PWD" "$PWD/specs/001-kids-driving-safety-game"`, 두 번 모두 종료 0). validator PASS(`task-US4_validation.md`, 시도 1/2)와 같은 revision. 테스트 뒤 `git status --short` 45줄로 시작 때와 같음, 4173·4273 포트에 남은 서버 없음
- 읽은 프로젝트 지침과 적용 기준(이 순서): `AGENTS.md`를 가장 먼저 읽고 적용 → 역할 파일 `ivi-agent-guide/claude-config/agents/spec-implement-reviewer.md`(AGENTS.md 치환 기준으로) → `ivi-agent-guide/orca-cross-review.md`(보고서 필드·snapshot 규칙) → `docs/PRD.md`, `GLOSSARY.md`, `contracts/overview.md` 공통 규칙. IVI Java/Spring·Lombok·JPA·필드 주입·Controller 반환 타입·`mvn` 기준은 적용하지 않음. 기준 = TypeScript + three.js + Vite 웹게임의 기존 코드 컨벤션(`src/render/townView.ts`, `src/ui/*.ts`, `src/app/flow.ts`, `tests/unit/*`, `tests/e2e/*`), overview 공통 규칙 3·4·5·7·10(순수 폴더·외부 요청·`textContent`·step 모양·상태 쓰는 곳), `contracts/modules.md` 3.2·6장·9장·11장 시그니처, plan.md "성능 초기 예산", npm 스크립트
- constitution: `.specify/memory/constitution.md`는 템플릿 자리표시자뿐(사용자 결정: 확정 규칙 없음) — 판정 근거로 쓰지 않음

| 항목 | 값 |
|---|---|
| run / task / dispatch / 실제 도구 / 세션 handle | Orca 없음 — 사용자 결정(Codex 한도 해제 2026-10-19 전까지 Claude 에이전트)으로 Claude Code 서브에이전트 `spec-implement-reviewer`(Opus 5.5)가 실행. Dispatch·handle 없음 |
| FEATURE_DIR / 단계 / 검토 태스크 | `/Users/kyw/Documents/git/mine/driving_game/specs/001-kids-driving-safety-game` / implement / T068~T078, T124, 보행자 시점 신호 수정(번호 없음), T102, T125, US3 reviewer 제안 3·5·9①③ 반영분 |
| validator 보고서 / 판정 | `_workspace/implement/logs/task-US4_validation.md` / COMPLETE · PASS, 같은 revision |
| 검토 범위 | `git diff HEAD`(`ca07433`)의 위 태스크 파일 + 새 파일 `src/race/progress.ts`·`ai.ts`, `src/render/trackView.ts`, `src/assets/images/{ui,rules}/*.svg` 90개, `tests/unit/progress.test.ts`·`ai.test.ts`, `tests/e2e/race.spec.ts`·`orientation.spec.ts`. US3 덩어리(T063~T067·T103)는 이미 APPROVE라 반영분만 확인. 문서는 변경 범위만 확인 |
| 검토 깊이 | 변경 코드 읽기 + 필수 테스트 4종. 의심 3곳만 **저장소 밖 복사본**(`scratchpad/reviewer-us4/copy/`, node_modules 심볼릭 링크, 포트 4273)에서 변이·측정. 저장소 안에는 이 보고서만 씀 |
| 검증 상태 | COMPLETE |
| 역할 판정 | APPROVE with comments (필수 수정 없음, "지금 확인 권장" 3건 + "이후" 10건) |
| 미해결 질문·지적 / 이전 지적 처리 | 미해결 질문 없음. US3 제안 3·5·9①·9③ 반영 확인(아래), 9②는 계획대로 남음. validator 참고 8(키보드 조합 키)은 아래 제안 1로 이어 받음 |

### 실행한 테스트

| 명령 (PROJECT_ROOT, 별도 표시 없으면 저장소) | 종료 코드 | 결과 |
|---|---|---|
| `review-snapshot.py` (읽기 전) | 0 | `d7f7100f…301e` = 요청값 |
| `npm run typecheck` | 0 | `tsc --noEmit` 오류 없음 |
| `npm test` | 0 | 16 files, 162 passed (race.test의 SC-012 108,600틱 시험 608 ms) |
| `npm run build` | 0 | 성공. 500 kB 넘는 청크 경고는 기존과 같음 |
| `npm run test:e2e` | 0 | 51 passed, 1 skipped(WebKit 전체화면 — 그 환경에 API 없음, 의도) |
| `npx tsc --noEmit --noUnusedLocals --noUnusedParameters` (읽기 전용 검사) | 1 | `tests/unit/ai.test.ts:2` `TRACK` 미사용(**이번 신설 파일**), `tests/unit/content.test.ts:260` `s` 미사용(HEAD부터 있던 것). tsconfig에 이 옵션이 없어 `npm run typecheck`는 미사용 import를 잡지 못함 |
| SVG 검사 `grep -liE '<script\|href\|foreignObject\|\bon[a-z]+\s*=\|<image\|<text\|@import\|data:\|javascript:\|<style\|<iframe\|<embed\|<object\|<use\|<a[ >]\|<animate\|<set' src/assets/images/rules/*.svg src/assets/images/ui/*.svg` | 1 | 일치 없음(90개). 쓰인 태그는 `svg`·`g`·`path`·`rect`·`circle`·`ellipse`·`clipPath`뿐, `url(...)`은 파일 안 `url(#c)` 47개뿐, `xmlns`는 SVG 이름공간 하나. Python `xml.etree`로 90개 모두 파싱 성공. 규칙 38장 152 KB, 이번 UI 12장(레이싱 9 + 방향·전체화면 3) 60 KB |
| `grep -rnE 'innerHTML\|outerHTML\|insertAdjacentHTML\|eval\(\|new Function\|createElement\(.a.\)\|\.href\|window\.open\|console\.(log\|debug)\|debugger\|TODO\|FIXME\|document\.write' src tests/e2e tests/unit` | 0 | `tests/e2e/boot.spec.ts:58`의 `console.log` 1건뿐(HEAD부터 있던 WebGL2 기록용, 이번 변경 아님) |
| 그림 이름 대조: 코드의 `images/...svg` 리터럴·템플릿 30종 ↔ `ls src/assets/images/ui`(52) | — | 모두 있음. 쓰이지 않는 그림 없음 |
| CSS 클래스 대조: `src/style.css`의 클래스 ↔ `src/**/*.ts`·`index.html` | — | 고아 CSS 없음(`control-*`는 `` `control-${b}` ``로 씀). `.shape-*`는 모두 지워짐 |
| (복사본) 변이 ①: `controls.ts:111`에서 `\|\| layer.hidden` 제거 → `npx playwright test --project=chromium` | 0 | **26 passed — 변이가 살아남음**(제안 3 근거) |
| (복사본) 변이 ①에 대해 시험 1건(시작 화면에서 `keyboard.down('ArrowUp')` → `.control-accel`에 `data-pressed` 없음) | 1 / 0 | 변이에서 실패, 원본에서 통과 → 제안 3의 고칠 방향이 변이를 잡음 |
| (복사본) 측정: `stage.ts` draw에 `renderer.info.render.calls` 기록 → 레이싱(버기·지프)·마을 연습 진입 | 0 | 레이싱 **157 calls**(보이는 메시 428, 카운트다운·주행 같음), 마을 신호 기다리기 64 calls(메시 86). Pixel 7 가로(Chromium) — 제안 4 근거 |
| (복사본) T115 흉내: `DRIVING_SPEC.acceleration` 4 → 2 → `npx vitest run tests/unit/race.test.ts` | 1 | 1 failed / 23 passed — 실패는 `race.test.ts:159`의 overshoot 기대값 하나뿐(로직은 맞음) → 제안 5 근거 |
| `review-snapshot.py` (테스트 후) | 0 | `d7f7100f…301e` = 요청값. `dist/`·`test-results/`는 Git 무시 대상 |

---

### 코딩 컨벤션(기존 패턴)
- [✓] 순수 모듈 경계: `src/race/progress.ts`·`ai.ts`·`race.ts`, `src/sim/collision.ts`는 `three`·DOM·Web Audio를 import하지 않음(공통 규칙 3). `race.ts`의 `storage/save` import는 `BestRecord` 타입과 `MAX_RECORD_CS` 상수뿐이며 modules.md 6.1 `finishResult` 시그니처가 요구하는 것
- [✓] step 모양: `stepRace`는 받은 `state`를 고치지 않음 — 지역 배열 `cars`만 칸 단위로 바꾸고 새 상태를 돌려줌, `finished`는 같은 state·빈 이벤트(공통 규칙 7). 무작위·시각 없음
- [✓] 중심선 계산 재사용: `trackLength`·`pointOnTrack`·`projectOnTrack`을 `collision.ts` 한 곳에 두고(트랙별 `WeakMap` 캐시) 벽·진행도·체크포인트·복귀·컴퓨터 차·트랙 그리기(`trackView.ts:90`)가 모두 이것을 씀. "+ = 진행 방향 왼쪽 = 출발 직선 +X" 법선 `(t.z, −t.x)`가 `ai.ts:18·37`, `progress.ts:75-76`, `trackView.ts:42`에서 같은 부호. 마을용 열린 경로 도우미(`practice/scenario.ts`, `townView.ts` `along`)와는 닫힌 고리·캐시가 달라 겹치지 않음. `trackView.ts`의 `offsetLoop`(꼭짓점 맞춤 평행 고리)는 그리기 전용이라 판정 모듈에 둘 이유 없음
- [✓] 그리기 짜임: `renderTrack`(`trackView.ts:123-147`)이 `renderTown`과 같은 모양 — `group ??= build…()`, `stage.show`, 차·인물 키가 바뀔 때만 모델 다시 만듦, `seatPassenger`·`animateCharacters`·`stage.follow` 재사용, 관찰 함수 `racePassenger()`는 `seatedPassenger()`와 같은 짜임. 상자는 공용 `unitBox` 하나를 크기만 바꿔 씀(마을보다 나음)
- [✓] HUD·화면: `showRaceHud`가 기존 `showHud`를 불러 기어·"먼저 멈춰요"를 그대로 쓰고 칸만 더함. 카운트다운 애니메이션은 기존 `flash` 키프레임·`restart()` 재사용. `showRaceResult`는 기존 `button()`·`picture()` 도우미와 `ui.replaceChildren` 모양
- [✓] flow 연결: 새 버튼 처리(`onRace`·`onRetry`·`onHome`·`onFullscreen`, `flow.ts:146-167`)가 "지금 화면이 맞을 때만" 규칙을 `if` 모양으로 따름. `RunState`(`best`·`storageNoticeShown`)와 `race.result`는 flow에서만 씀(공통 규칙 10)
- [✓] 자리값 상수: `STUCK_TICKS`·`COUNTDOWN_TICKS`·`CONTACT_SLOW_TICKS`·`UNLOCK_TICKS`, `ai.ts`의 `LOOK_AHEAD` 등이 모두 "자리값(T115/T117/T118)" 주석을 붙임 — 기존 `PRAISE_TICKS`와 같음
- [i] 같은 계산이 두 곳: 순위 `rankCars(cars).indexOf(playerSlot) + 1`이 `race.ts:38`(비공개 `playerRank`)와 `flow.ts:286`(`rankNow`), 경기 시간 `Math.round(raceTicks × 100 / TICK_HZ)`가 `race.ts:115`와 `flow.ts:371`, `.race-stat` 칸 만들기가 `hud.ts:65-70`과 `screens.ts:137-142` → 제안 6
- [i] `&&` 모양이 새로 두 곳: `flow.ts:417`(`fullscreenchange`), `hud.ts:83`(`setText`). 처음 쓰는 `return void (…)` 모양이 두 곳: `race.ts:106`, `lifecycle.ts:36` → 제안 7
- [i] `blockByTrackWalls(_prev, …)`(`collision.ts:79`)는 계약 시그니처(modules.md:108)를 맞추려 받기만 하고 쓰지 않음 → 제안 8

### 보안 (contracts/overview.md 공통 규칙 4·5)
- [✓] 글은 `textContent`만: 레이싱 HUD 숫자(`hud.ts:83`), 결과 칸(`screens.ts:140`), 세로 안내·저장 불가 안내(`overlays.ts`). 카운트다운의 `replaceChildren(String(n))`은 Text 노드를 만들어 `textContent`와 같은 안전성. HTML 주입 경로 0건(위 검색)
- [✓] 링크·외부 요청 없음: 새 화면에 `<a>` 없음. 그림은 모두 같은 번들의 `ASSET_URLS`에서 오는 `<img src>`로만 쓰여 SVG 안의 스크립트가 있더라도 실행되지 않는 방식이며, 90개 모두 스크립트·이벤트 속성·외부 참조·`<text>`가 없음
- [✓] 권한 API 없음: 전체화면·`screen.orientation.lock`은 권한 창이 없는 API이고 탭 처리 안에서만 부르며, 거절·미지원은 `.catch(() => {})`로 조용히 넘어감(`lifecycle.ts:34-43`, FR-099). 시험용 `__e2e`는 `?e2e`일 때만, 읽기 전용 getter(`flow.ts:388-404`)
- [✓] 저장: `finishRace`(`flow.ts:310-319`)는 던지지 않는 `loadSave`·`commitSave`의 `ok`/`boolean`만 보고, 저장 값은 메모리의 세 값뿐 — 외부 입력을 그대로 쓰는 곳 없음
- [i] 키보드가 Cmd/Ctrl/Alt 조합 키까지 가로챔(validator 참고 8) — 보안 문제는 아니고 입력이 남을 수 있는 문제 → 제안 1

### 불필요한 코드
- [✗(경미)] `tests/unit/ai.test.ts:2` `import { TRACK }` — 쓰이지 않음(이번 신설 파일). `npm run typecheck`는 tsconfig에 `noUnusedLocals`가 없어 못 잡음 → 제안 2
- [✓] 그 밖의 새 import·지역 변수는 모두 쓰임(`--noUnusedLocals` 검사 결과 위 1건 + HEAD부터 있던 `content.test.ts:260` 1건뿐)
- [✓] 자리표시 정리(US3 제안 5 반영): 규칙 그림 38장이 생겨 `picture()`의 도형 대체 경로·`shape` 인자·`.shape-*` CSS가 모두 사라짐(`screens.ts:7-9`, `style.css`에 `shape` 0건). 호출 쪽 `picture(id, shape)` 두 번째 인자도 전부 정리(`hud.ts`·`overlays.ts`·`controls.ts`)
- [✓] 임시 흐름 정리: `hud.ts`의 `restart()`는 `screens.ts`로 옮긴 뒤 원래 자리에서 지움. 고아 CSS·쓰이지 않는 그림 없음(위 대조)
- [✓] 주석 처리된 코드·디버그 로그 없음. T078 점검용 진입점은 코드에 남지 않음

### 변경 최소성
- [✓] 코드 변경이 T068~T078·T124·T102·T125·신호 수정 범위에 한정됨. `collision.ts`는 기존 `overlaps`·`blockByAreas`를 건드리지 않고 아래·위에 더하기만 함
- [✓] `scenarios.ts`는 `afterStep` 값 두 개와 이유 주석 한 줄, `scenario.test.ts`는 바뀐 순서에 맞춘 기대값 3곳 + 안전 조건 시험 1건(`:337-346`, 세 연습 모두 "안내 시작 순간 보행자 초록·차 초록 아님")
- [✓] 넘겨받은 반영분만 손댐: US3 제안 3 `begin(id)`(`flow.ts:195-199`), 9① `onCredits`·`onCreditsBack` `if` 모양(`flow.ts:153-161`), 9③ `showPick` 다음 버튼 `button()`(`screens.ts:112`). 9② `credits.spec.ts:21` `c.changes!`는 그대로(계획대로)
- [✓] 문서 변경은 modules.md(새 함수·자리값·`Slot`·전체화면), data-model 4.11·storage.md 4장(저장 불가 안내 시점), spec FR-007·098·099(앞 세션 승인 기록), 기록 파일뿐
- [✓] 하지 않은 것(소리 T081, 일시정지 T084~T086, 상수 조정 T115·T118)을 미리 만들지 않음

### 테스트 품질
- [✓] `withCar`·`parkAi`(`race.test.ts:44-48`): 이름과 한 줄 주석으로 무엇을 바꾸는지 드러나고 slot으로 골라 바꿔 읽기 쉬움. `parkAi`의 `stuckTicks: -Infinity`(더해도 그대로라 복귀 안 함) + `reactionTicks: Infinity`(액셀 안 누름)는 영리한 쪽이지만 주석이 이유를 밝힘. `as unknown as RaceState`는 `.map`이 4칸 튜플 타입을 잃어서라 시험 코드에서는 받아들일 만함
- [✓] 실패를 잡는지: 역주행 1바퀴 시험(`:216-237`)은 정방향 판정(`before < 0 ∧ after ≥ 0`)을 양방향으로 바꾸면 1번 체크포인트를 거꾸로 넘을 때 `nextCheckpoint`가 2가 되어 실패. 가로지르기 3자리(`:240-246`)는 투영 구간 제한을 빼면 진행도 단언에서 실패. 끼임 10회(`:169-190`)는 복귀 뒤 진행도·순위·바퀴가 오르지 않는지를 매번 확인
- [✓] `vi.doMock`(`:299-328`): `vi.resetModules()` → `doMock` → 동적 import 순서가 맞고 `afterEach`에서 `doUnmock`·`resetModules`로 되돌려 다른 시험에 새지 않음. `pointOnTrack(curved, …)`은 트랙을 인자로 받는 순수 함수라 원래 모듈을 써도 됨
- [✓] e2e: `race.spec.ts`는 `page.clock.pauseAt` → `runFor`로 카운트다운 2.5초에 `raceTicks` 0, 4초에 증가를 확인(실제 시간에 기대지 않음). `orientation.spec.ts`는 세로 전환 때 눌림 해제·틱 멈춤을 모두 확인. 키보드 시험의 "누르고 있던 키의 반복 입력 무시"는 Playwright가 이미 눌린 키의 `down`을 `repeat: true`로 보내는 동작을 이용해 맞게 짬
- [✗(경미)] `touch.spec.ts:148-150` "조작 버튼이 없는 화면에서는 무시"는 화면이 `start`로 남는지만 봐서 `layer.hidden` 가드를 지워도 통과함(복사본 변이로 확인, 전체 Chromium e2e 26건도 모두 통과) → 제안 3
- [i] `race.test.ts:159`의 `6.0667`은 `DRIVING_SPEC.acceleration`(자리값 4)을 손으로 계산한 값이라 T115 조정만으로 깨짐(복사본 확인) → 제안 5
- [i] `race.test.ts:299` 시험 이름의 "뒤 후보는 직선거리 5 × bodyRadius"는 막는 차가 하나뿐이라 결과가 늘 중심·왼쪽 후보여서 이 시험에서는 확인되지 않음(뒤 후보 자리는 `:292`의 직선 시험과 `content.test.ts` #18이 확인). 같은 파일에서 `side`가 `:283`에서는 숫자, `:331`에서는 함수 → 제안 9
- [i] 레이싱 완주 뒤 flow(최신 저장 값 읽기 → `finishResult` → 새 기록 저장 → 안내 1회 → 결과 화면 → 다시 달리기·시작 화면으로)는 자동 시험이 없고 `records/play-check.md` 사람 확인만 있음. T078 문구 범위 밖이라 지금 요구하지 않음 → 제안 10

### US3 리뷰 제안 반영 확인
| 제안 | 결과 |
|---|---|
| 3 "조작 익히기 먼저" 분기 하나로 | 맞게 반영: `begin(id)`(`flow.ts:195-199`) 하나를 `onCharacterNext`(처음 이용 흐름)·`onScenarioPick`이 씀. 조작 익히기 뒤 갈 곳은 `chosen`으로 넘김(`:218`) |
| 5 자리표시 경로 정리 | 맞게 반영(위 "불필요한 코드") |
| 9① `&&` 버튼 처리 → `if` | 버튼 처리 세 개는 맞게 반영. 다만 새 `fullscreenchange` 처리(`flow.ts:417`)가 다시 `&&` 모양 → 제안 7 |
| 9③ `showPick` 다음 버튼 `button()` | 맞게 반영(`screens.ts:112`, `aria-label`·그림·`click` 같음, `disabled`는 그대로) |
| 9② `credits.spec.ts:21` `c.changes!` | 이번에 고치지 않음(요청대로 남김) |

### REJECT 수정 요청
- 없음

---

### 개선 제안 (비필수)

**지금 확인 권장** (다음 커밋·공개 배포 전에, 각각 한두 줄)

1. **키보드 조합 키를 그냥 두기**(`src/input/controls.ts:111`, validator 참고 8): 지금은 Cmd/Ctrl/Alt와 함께 누른 R·WASD·방향키도 `preventDefault`하고 운전 입력으로 받음 → PC에서 플레이 중 Ctrl+R/Cmd+R 새로 고침이 막히고 앞뒤가 바뀌며, Ctrl+S·Cmd+A 같은 조합도 막힘. 또 macOS 브라우저는 Cmd를 누른 채 누른 글자 키의 `keyup`을 보내지 않는 것으로 알려져 있어, Cmd+A 뒤 왼쪽 조향이 눌린 채 남을 수 있음(FR-017 "누른 상태가 남지 않음"과 같은 성격, 실기 미확인). 고칠 방향(한 줄): `if (b === undefined || layer.hidden || e.ctrlKey || e.metaKey || e.altKey) return;`. 시험은 `touch.spec.ts` 첫 키보드 시험 끝에 `keyboard.down('Meta')` → `keyboard.down('KeyA')` → `.control-left`에 `data-pressed` 없음 → 둘 다 `up` 정도면 충분
2. **미사용 import 지우기**: `tests/unit/ai.test.ts:2`의 `import { TRACK } from '../../src/content/track';` 한 줄 삭제
3. **"조작 버튼 없는 화면에서는 무시" 시험 강하게**(`tests/e2e/touch.spec.ts:148-150`): `keyboard.press` 두 줄 대신 `await page.keyboard.down('ArrowUp'); await expect(page.locator('.control-accel')).not.toHaveAttribute('data-pressed'); await page.keyboard.up('ArrowUp');`(R 확인은 그대로 두어도 됨). 복사본에서 이 형태가 가드 제거 변이를 잡고 원본에서는 통과함을 확인함

**이후 태스크로**

4. **트랙 그리기 호출 수**(`src/render/trackView.ts:72-87` 벽, `:95-108` 결승선 칸): 벽 줄무늬가 상자 약 336개, 결승선 칸이 56개라 레이싱 화면이 157 calls(마을 연습 64). plan.md "성능 초기 예산" 제안값(트랙 60 이하, 마을 120 이하)의 약 2.6배. 예산이 아직 확정값이 아니고 측정은 T111·T113이라 지금 막지 않음. 고칠 방향: 색마다 `THREE.InstancedMesh` 하나(줄무늬 2 + 체크 2)로 바꾸거나, 이미 `models.ts`가 쓰는 `mergeGeometries`로 색별 합치기 → 10 calls 안팎 예상. 시점: T111(`?perf`) 전, 늦어도 T113 기기 점검 전
5. **T115 조정에 깨지지 않게**(`tests/unit/race.test.ts:159`): `overshoot: expect.closeTo(-0.05 + 6.0667 / TICK_HZ, 3)` → `overshoot: expect.closeTo(player(r.state).drive.z, 9)`(결승선이 z = 0이고 +Z 방향이라 넘어선 거리 = 새 z). 같은 이유로 `progress.test.ts:7-8`의 한 바퀴 길이 손계산과 race.test의 좌표(`x: 5, z: 30`, 출발 칸 `(3, 12)` 바로 뒤 등)도 자리표시 트랙에 묶여 있음 — T115에서 트랙을 바꿀 때 이 파일들을 `vi.doMock` 고정 시험 트랙(이미 `:299`에서 쓰는 방식)으로 옮길지 함께 정하기를 권함. 시점: T115 또는 race.test를 다시 여는 T116
6. **같은 계산 한 곳으로**: ① `race.ts:38` `playerRank`를 내보내고 `flow.ts:286` `rankNow`를 `playerRank(race!.cars)`로, ② 경기 시간 식(`race.ts:115`, `flow.ts:371`)을 `race.ts`의 작은 함수 하나로(HUD 시간과 결과 시간이 따로 바뀌는 일을 막음), ③ `.race-stat` 칸 만들기(`hud.ts:65-70`, `screens.ts:137-142`)를 `screens.ts` 하나로(hud가 이미 `picture`·`restart`를 거기서 가져옴). 시점: 다음에 flow.ts를 고치는 T081 때 함께
7. **모양 맞추기**: `flow.ts:417` → `document.addEventListener('fullscreenchange', () => { if (state.screen === 'start') setScreen('start'); });`, `hud.ts:83` `setText`도 `if` 모양. `race.ts:106`·`lifecycle.ts:36`의 `return void (…)`는 `{ …; return; }`로(지금까지 코드에 없던 모양). 또 이 `fullscreenchange`는 flow.ts에 처음 생긴 직접 DOM 이벤트라, 브라우저 이벤트를 모으는 `platform/lifecycle.ts`로 옮길지 T086(생명주기 반응 정리) 때 함께 보기를 권함
8. **쓰지 않는 인자**: `blockByTrackWalls`의 `prev`는 계약(modules.md:108)에만 있고 쓰이지 않음. 계약과 함께 빼거나(호출 `race.ts:81`도 한 인자 줄어듦), `blockByAreas`와 모양을 맞추려 남길지 리더 판단. 시점: T115에서 트랙·벽을 다시 볼 때
9. **곡선 체크포인트 시험 이름·이름 겹침**(`race.test.ts:299`, `:283`/`:331`): 이름에서 "뒤 후보는 직선거리 5 × bodyRadius"를 빼거나, 다른 두 차로 중심·왼쪽을 막고 남은 한 대를 훑는 경우를 더해 뒤 후보까지 닿게 하기. `:331`의 함수 `side`는 `sideOf` 등으로 바꿔 `:283`의 숫자 `side`와 구분. 시점: T116 때
10. **레이싱 완주 흐름의 자동 확인**: `flow.ts:310-319`(+ 다시 달리기·시작 화면으로 `:163-168`)는 사람 확인 기록만 있음(US3 제안 6과 같은 성격). 두 바퀴를 e2e로 다 달리기는 무거우므로, 마무리 점검(T120) 때 사람 확인 기록으로 충분한지 아니면 `?e2e`에서만 쓰는 작은 진입점이 필요한지 리더가 정하기를 권함
11. **e2e 저장값 한 곳으로**: 같은 `{ v: 1, tutorialDone: true, … }` JSON이 `touch.spec.ts:144`, `race.spec.ts:5`, `storage.spec.ts:4`, `credits.spec.ts:30` 네 곳에 있음. 저장 형식 버전이 바뀌면 네 곳을 고쳐야 하므로, 다음에 저장 형식을 건드릴 때 공용 상수 파일 하나로
12. **미사용 검사 켜기(선택)**: `tsconfig.json`에 `noUnusedLocals`·`noUnusedParameters`가 없어 `npm run typecheck`가 고아 import를 잡지 못함(US3 리뷰의 "typecheck 통과 = 미사용 없음" 판단도 이 검사로는 근거가 안 됨 — 이번에 별도 플래그로 다시 확인함). 제안 2와 HEAD부터 있던 `content.test.ts:260`의 `s`(→ `_s`)를 고친 뒤 켜면 이후 자동으로 잡힘. 같은 파일 `content.test.ts:253-275`의 닫힌 중심선 도우미는 이제 `collision.ts`에 같은 함수가 있지만, 콘텐츠 검사를 구현과 따로 두는 것도 근거가 있어 그대로 둬도 됨. 시점: 리더 판단(설정 변경이라 사용자 확인 필요할 수 있음)
13. **그림 경로 오타 대비(선택)**: `picture()`가 `ASSET_URLS[id]!`(`screens.ts:8`)로 대체 경로 없이 바뀌었고 `AssetId`가 `images/${string}.svg` 템플릿 타입이라, 경로 오타는 타입 검사로 안 잡히고 깨진 그림(같은 출처 404)으로만 드러남. 이번에는 52개를 손으로 대조해 문제없음. 그림이 더 늘어나는 T084·T089 때 e2e에서 방문한 화면의 `img`가 모두 `naturalWidth > 0`인지 보는 한 줄 검사를 검토
