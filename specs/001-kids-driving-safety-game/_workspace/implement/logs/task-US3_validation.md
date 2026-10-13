# Task US3 Validation Report (연습 고르기·레이싱 열림 T063~T067 + UI 그림 T103)

# 시도 2 (최신)

## 판정: PASS
## 시도: 2/2

- revision 요청값 / 읽기 전 / 테스트 후: `1d0665f202c79e07f161564ab88991c42a29f7bdb04cfac18f5e89f50a060936` / 같음 / 같음 (PROJECT_ROOT에서 `$PWD` 확인 후 `review-snapshot.py` 재계산)
- 읽은 프로젝트 지침·기술 기준: 시도 1과 같음(`AGENTS.md` 먼저, IVI Java/Spring 기준 제외, TypeScript·three.js·Vite·npm 기준). 추가로 `task-US3_impl.md` "attempt 2" 절, `tasks.md` 변경, `records/play-check.md` T067 절·그림을 읽음
- 테스트 명령: `npm run typecheck`, `npm test`, `npm run build`, `npm run test:e2e`(전체)

| 항목 | 값 |
|---|---|
| run / task / dispatch / 실제 도구 / 세션 handle | Orca 없음 — 사용자 결정(Codex 복구 전까지 Claude 에이전트)으로 같은 Claude Code 서브에이전트 `spec-implement-validator`(Opus 5.5) 세션이 이어서 재검증 |
| FEATURE_DIR / 단계 / 검토 태스크 | `/Users/kyw/Documents/git/mine/driving_game/specs/001-kids-driving-safety-game` / implement / T063·T064·T065·T066·T067·T103 |
| 검증 상태 | COMPLETE |
| 역할 판정 | PASS (6개 태스크 모두 PASS, 남은 질문 없음) |

### 실행한 테스트(시도 2)

| 명령 | 종료 코드 | 결과 |
|---|---|---|
| `npm run typecheck` | 0 | 오류 없음 |
| `npm test` | 0 | 14 files, 130 passed |
| `npm run build` | 0 | 성공 |
| `npm run test:e2e` | 0 | 38 passed(`storage.spec.ts` 6건 × 두 엔진) |
| 저장소 밖 탐색 `scratchpad/validator/notice-v2.cjs`(빌드 결과를 `vite preview --port 4174`로 띄움, 끝난 뒤 종료) | 0 | 아래 T064 근거 |

### 태스크별 판정(시도 2)

| 태스크 | 판정 | 근거 |
|---|---|---|
| T063 | PASS | 시도 1 이후 바뀐 곳 없음(시도 1 근거 그대로) |
| T064 | PASS | 안내 띠가 위쪽 가운데로(`src/style.css:157-176`, 좌우 104px씩 비움), `pointer-events: none`이고 닫기만 받음(`style.css:173`, `194`), 10초 뒤 저절로 닫힘(`style.css:175-182`, `src/ui/overlays.ts:46-52`, 두 번 불려도 한 번만). 저장소 밖 확인: 932×430·Pixel 7 가로·iPhone 14 가로 세 크기 모두 띠를 닫지 않은 채 좌·우 조향·브레이크·액셀을 실제로 누르면 `data-pressed`가 붙음, 크레딧·일시정지·기어 표시와 겹치지 않음 |
| T065 | PASS | 안내를 부팅 직후 대신 시작 화면이 처음 나올 때 보여 줌(`src/app/flow.ts:290-291`). 세 번째 완료 때 저장 실패 처리(`flow.ts:217`)와 실행당 1회(`flow.ts:238-247`)는 그대로. 스펙 US3-8 "접속하면 … 실행마다 한 번"을 만족 |
| T066 | PASS | getter 예외 시험이 안내를 닫지 않은 채 차량 고르기 "다음"과 조작 버튼 6개 가운데를 `elementFromPoint`로 확인(`tests/e2e/storage.spec.ts:30-68`), 새 시험 "닫지 않아도 15초 안에 사라지고 `data-overlays`에서 빠짐"(`storage.spec.ts:70-82`). 두 엔진 통과 |
| T067 | PASS | 저장 막힘 열을 안내를 닫지 않은 채 다시 확인, "안내를 닫지 않아도 진행" 행 추가(`records/play-check.md` T067 절), 그림 `blocked-2-menu`에 위쪽 띠가 보이는 채로 연습 목록 |
| T103 | PASS | 그림 40장은 시도 1과 같음(이름 규칙·개수 9/6/3·금지 요소 없음). 원문에서 화면이 없는 5종을 T084(계속하기)·T089(로딩·실패·3D 불가·세로 안내)로 옮겨 맡는 태스크가 남음(`tasks.md` T084·T089·T103 행) |

### 이전 지적 처리 결과

| 시도 1 지적 | 처리 |
|---|---|
| FAIL 피드백 1: 안내 띠가 조작 버튼·"다음"을 가림(FR-080, SC-017) | 해결. 세 화면 크기에서 닫지 않은 채 버튼이 눌리는 것을 직접 확인 |
| FAIL 피드백 2: E2E로 고정 | 해결. 닫지 않은 채 "다음"·조작 버튼 6개 확인 + 저절로 사라짐 시험 |
| FAIL 피드백 3: T067 저장 막힘 열 다시 확인 | 해결. 닫지 않은 채 다시 확인한 값으로 갱신 |
| Q1: 화면이 없는 그림 5종 | 리더가 기존 사용자 결정("버튼·안내 그림만", 00_context 승인 기록)을 근거로 권장안 A를 적용. Q1에 대한 새 사용자 답 기록은 없음 — `tasks.md` 문구는 서로 맞고 맡는 태스크가 남으므로 검증상 문제는 없으나, 바뀐 T084·T089·T103 문구를 사용자 보고 때 함께 알리기를 권함 |

### 참고(차단 아님, 리뷰어·리더 판단)

- 띠가 떠 있는 최대 10초 동안 위쪽 가운데의 "다음 행동 그림"(`.hud-cue`)을 덮습니다(932×430에서 띠 `131~801 × 16~88`, 그림 `418~514 × 16~88`). CSS 크기로 계산하면 높이가 낮은 휴대폰 가로 화면(Pixel 7·iPhone 14)에서는 연습 목록 카드 윗부분과 완료 표시도 덮습니다. 스펙은 저장 불가 안내가 "어느 화면 위에도 겹쳐 나타날 수 있다"고 하고(spec.md:534), 터치를 막지 않으며 조작 버튼 강조는 보이므로 FAIL로 보지 않았습니다. 시작 화면을 지나 플레이 화면에 들어가면 띠를 바로 닫는 식의 작은 조정을 고려할 수 있습니다.
- 안내가 뜨는 때가 data-model.md 4.11·contracts/storage.md 4장의 "부팅 `loadSave` 때"에서 "시작 화면이 처음 나올 때"로 바뀌었습니다. 스펙과는 맞지만 문서 한 줄을 맞춰 두면 좋습니다. 로딩 실패 뒤 다시 시도(T090)도 같은 `load()` 경로로 시작 화면에 와야 안내가 나옵니다.

---

# 시도 1

## 판정: FAIL
## 시도: 1/2

- revision 요청값 / 읽기 전 / 테스트 후: `1ce4694fd861ffa836ee2cfe14bac6cb098fd8db9c28c6498f7f89a583652b64` / 같음 / 같음 (PROJECT_ROOT에서 `$PWD` 확인 후 `python3 ivi-agent-guide/scripts/review-snapshot.py "$PWD" "$PWD/specs/001-kids-driving-safety-game"`)
- 읽은 프로젝트 지침: `AGENTS.md`(가장 먼저), 역할 파일 `ivi-agent-guide/claude-config/agents/spec-implement-validator.md`, `ivi-agent-guide/orca-cross-review.md`, `docs/PRD.md`, `GLOSSARY.md`. constitution은 빈 양식(사용자 결정: 규칙 없음)
- 적용한 기술 기준: IVI Java/Spring·JPA·REST·`mvn` 기준은 적용하지 않음. TypeScript 7 + three.js + Vite, 화면 흐름·`RunState`·브라우저 저장 형식(data-model.md), 이벤트·저장·에셋·정적 경로 계약(contracts/), npm 스크립트로 판정
- 테스트 명령: `npm run typecheck`, `npm test`, `npm run build`, `npm run test:e2e`(전체)

| 항목 | 값 |
|---|---|
| run / task / dispatch / 실제 도구 / 세션 handle | Orca 없음 — 사용자 결정(2026-10-12 "Codex 복구 전까지 Claude 에이전트")으로 Claude Code 서브에이전트 `spec-implement-validator`(Opus 5.5)가 실행. Orca Dispatch·handle 없음 |
| FEATURE_DIR / 단계 / 검토 태스크 | `/Users/kyw/Documents/git/mine/driving_game/specs/001-kids-driving-safety-game` / implement / T063·T064·T065·T066·T067·T103 |
| 검증 상태 | COMPLETE |
| 역할 판정 | FAIL (T064 FAIL, T067 저장 막힘 열 FAIL, T103 체크 보류 질문 1건, 나머지 PASS) |
| 검증 깊이 | 사용자 결정 "스펙 대조 + 테스트 실행만". 의심 가는 곳 1곳(저장 불가 안내 띠 위치)만 저장소 밖 임시 스크립트로 확인 |

### 실행한 테스트

| 명령 | 종료 코드 | 결과 |
|---|---|---|
| `npm run typecheck` | 0 | 오류 없음 |
| `npm test` | 0 | 14 files, 130 passed |
| `npm run build` | 0 | 성공(500 kB 청크 경고는 기존과 같음) |
| `npm run test:e2e` | 0 | 36 passed(Chromium Pixel 7 가로·WebKit iPhone 14 가로, `storage.spec.ts` 5건 × 2, `credits.spec.ts` 링크 시험에 practiceMenu 포함) |
| `ls src/assets/images/ui/cue-*.svg \| wc -l` / `violation-*` / `scenario-*` | 0 | 9 / 6 / 3 (전체 40개) |
| `grep -liE '<text\|<script\|href\|foreignObject\|\bon[a-z]+=\|<image' src/assets/images/ui/*.svg` | 1 | 일치 없음(`url(#c)` 내부 클립 참조 9개만 있음 — 외부 주소 아님) |
| 저장소 밖 탐색 `scratchpad/validator/notice-overlap.cjs`, `notice-press.cjs`(빌드 결과를 `vite preview --port 4174`로 띄움, 끝난 뒤 종료) | 0 | 아래 T064 FAIL 근거 |

---

## 태스크별 판정

### T063 시작 화면 레이싱 버튼·연습 목록 — PASS

- [✓] FR-048 잠김 그림: `src/ui/screens.ts:39-51` 잠김이면 `race-locked.svg` + `data-locked`, 열림이면 `race.svg`. 누르면 `flashRaceLocked()`(`screens.ts:54-56`)로 `race-locked-hint.svg`만 잠깐(음성은 T081 — 아직 소리 활성화 전이므로 그림만이 맞음, FR-066 우선)
- [✓] FR-030 연습 목록: `screens.ts:65-79` 세 연습 그림 `images/ui/scenario-<ScenarioId>.svg`, `aria-label`은 FR-028 이름(`screens.ts:58-62`), 이번 실행 완료(`run.completedThisRun`)에 `data-done` + `done.svg`, 세 버튼 모두 누를 수 있음
- [✓] FR-049 시작 화면에서 안전 연습·레이싱 고르기: 시작·레이싱 두 버튼 + 크레딧
- [✓] T096이 남긴 검사: `tests/e2e/credits.spec.ts:27-50` 완료 저장값을 넣어 `practiceMenu`까지 `a[href]` 0 확인, 두 엔진 통과

### T064 저장 불가 안내·레이싱 열림 축하 — FAIL

- [✓] FR-047 축하 그림: `src/ui/overlays.ts:35-38` `race-unlocked.svg`(음성은 T081)
- [✓] 안내 구성(그림 + 보호자용 짧은 글 `textContent` + 닫기): `overlays.ts:41-56`
- [✗] **FR-080 "플레이를 막지 않아야", SC-017 "진행 차단 0건"**: 안내 띠(`src/style.css:156-173`, 아래쪽 가운데 고정, `z-index: 3`, 글이 한 줄로 길어 너비 약 669px)가 닫힐 때까지 남는데(`overlays.ts:40` 주석 "화면이 바뀌어도 닫을 때까지 남고"), 그 자리가 조작 버튼(`#controls`, `z-index: 1`)과 고르기 화면의 "다음" 버튼 위입니다. 띠를 닫지 않으면:
  - 가로 932×430(T067·touch.spec과 같은 크기), 조작 익히기 화면: 띠 `131,342,669×72`. 오른쪽 조향(`126,320,86×86`)과 **브레이크**(`720,320,86×86`) 가운데를 실제로 누르면 `data-pressed`가 붙지 않음(왼쪽 조향·액셀은 붙음) — `notice-press.cjs`
  - Pixel 7 가로(863×360, E2E chromium 기기): 오른쪽 조향·브레이크 가운데·아래쪽 모두 `elementFromPoint`가 안내 띠 — `notice-overlap.cjs`
  - iPhone 14 가로(750×340, E2E webkit 기기): 차량 고르기 화면 "다음"(`622,212,104×104`) 가운데·아래쪽이 안내 띠, 클릭 3초 시간 초과 → 띠를 닫기 전에는 다음 화면으로 갈 수 없음
  - 띠가 뜨는 때는 부팅 `loadSave` 실패(`flow.ts:310`)와 세 번째 완료 순간 저장 실패(`flow.ts:217`) 두 곳이라, 두 번째 경우에는 축하 → 시작 화면 → 다음 플레이(이후 레이싱 포함)까지 브레이크를 가린 채 남습니다. 3~5세는 글을 읽고 닫을 수 없다는 전제(PRD "읽기 능력")와도 맞지 않습니다.

### T065 flow 연결 — PASS

data-model.md 4.1·4.2·4.11, events.md 2장 `scenarioCompleted` 행과 대조.

- [✓] `start` 레이싱: `!tutorialDone`이면 그림 안내만·화면 그대로, 열림이면 `pickVehicle`(mode race) — `src/app/flow.ts:113-119`
- [✓] `pickCharacter`: race → `race`(경기는 T077) / practice ∧ `!tutorialDone` ∧ `!practiceStarted` → sequence, `practiceStarted = true`, `!drivingLessonDone`이면 조작 익히기 뒤 첫 미완료(=`signal-wait`, 이때 `completedThisRun`은 늘 비어 있음) / 그 밖 → menu → `practiceMenu` — `flow.ts:127-145`
- [✓] `practiceMenu` 고름: `!tutorialDone ∧ !drivingLessonDone`이면 조작 익히기 뒤 고른 상황, 그 밖은 바로 — `flow.ts:146-151`, `flow.ts:164-172`
- [✓] 세 번째 완료: `completedThisRun.add` → 처음 3개가 차고 `!tutorialDone`이면 같은 틱에 `tutorialDone = true` → `commitSave(…, 'tutorial', trackConfigKey(TRACK))` → `false`면 안내 1회, 열림·축하는 늦추지 않음 — `flow.ts:211-219`. 칭찬 → 축하 → `start` — `flow.ts:224-232`(quickstart "축하 안내 뒤 시작 화면")
- [✓] 그 밖의 완료: sequence면 순서상 다음 미완료, menu면 `practiceMenu` — `flow.ts:233-235`
- [✓] 저장 불가 안내 실행당 1회: `storageNoticeShown` 확인 후 `data-overlays`에 `storageNotice` — `flow.ts:238-247`, 부팅 `ok: false` — `flow.ts:310`, `main.ts:14-15`
- [✓] FR-050: `tutorialDone`을 `false`로 바꾸는 코드 없음(`grep tutorialDone src` — 쓰기는 `flow.ts:215` 한 곳)
- [✓] 연타 무시: 모든 버튼 처리에 현재 화면 확인

### T066 `tests/e2e/storage.spec.ts` 5건 — PASS

- [✓] 태스크가 정한 5건(기록 없음 잠김·`start` 그대로 / 완료 저장값 → `pickVehicle` / getter 예외 → `start`·안내 1회 / 손상 값 `{` → 기본값·안내 없음 / 열림 저장값 새로 고침 뒤 유지)이 모두 있고 두 엔진에서 통과(`storage.spec.ts:14-83`)
- 참고: getter 예외 시험(`storage.spec.ts:49`)은 안내를 **먼저 닫고** 진행해서 위 T064 문제를 잡지 못합니다. 수정 때 "닫지 않고 진행" 확인을 함께 넣기를 권합니다(FAIL 피드백 2).

### T067 플레이 확인 — FAIL(저장 막힘 열만)

- [✓] 정상 저장 열: 잠김 → 그림 안내 → 연습 목록 완료 표시 2 → 세 번째 완료 → 칭찬 → 축하 → `start`(열림), 완료 순간 `driving_game:save` 기록, 새로 고침 뒤 유지 — `records/play-check.md` "2026-10-13 (T067…)" 절, `records/img/t067-play-check.png`. 앞의 두 연습은 저장소 밖 진입점으로 완료 처리한 것과 "하지 않은 것"이 기록에 밝혀져 있음
- [✗] 저장 막힘 열 "예": 같은 932×430에서 안내 띠가 오른쪽 조향·브레이크를 가리는데(위 T064), 그림의 `blocked-4-start-open`에 띠가 그대로 남아 있어 닫지 않은 채 자동 입력으로 주행한 결과입니다. 실제 터치로는 브레이크를 누를 수 없으므로 SC-017 "진행 차단 0건"의 근거가 되지 못합니다. T064를 고친 뒤 이 열을 다시 확인해야 합니다.

### T103 UI 그림 — 이름·개수·금지 요소 PASS, 체크는 보류(미해결 질문 Q1)

- [✓] assets.md 6장 이름 규칙: `scenario-<ScenarioId>` 3(`signal-wait`·`crossing-check`·`turning-car`), `violation-<kebab>` 6(`ViolationKind` 6종을 kebab-case로, `overlays.ts:7` 변환과 일치), `cue-<HintCue>` 9(`practice/scenario.ts:30`의 9종과 일치). 모두 소문자 kebab-case
- [✓] 40개 모두 코드에서 쓰임(쓰이지 않는 파일 없음), `<text`·`<script`·`href`·`foreignObject`·이벤트 속성·`<image` 없음, 합계 41,846바이트, 빌드에서 인라인
- [✓] 모아 보기(`records/img/t103-ui-pictures.png`): 글자 없이 뜻이 대체로 전해짐(신호등·횡단보도·회전 화살표 연습 그림, 자물쇠/열린 자물쇠 + 체크 3개, 핸들·페달·후진 화살표). 구현자가 스스로 밝힌 약점 그대로 `violation-early-start`와 `violation-over-stop-line`이 비슷함(모래시계 하나 차이) — 콘텐츠 검토(T110)에서 볼 것
- [?] T103 원문(`tasks.md:264`)이 적은 "전진·후진·잠김·완료·일시정지·**계속하기·세로 안내·로딩·실패·3D 불가**·먼저 멈춰요 등" 중 굵게 쓴 5종이 없습니다. 이 그림을 쓸 화면(T084 일시정지, T089 로딩·실패·3D 불가·세로 안내)이 아직 없어서 생긴 차이로 보입니다. 이대로 T103을 체크하면 이 5종을 맡는 태스크가 없어지므로 Q1로 묻습니다.

---

## FAIL 피드백

1. **저장 불가 안내가 조작 버튼과 "다음" 버튼을 가리지 않게** — `src/style.css:156-173`(필요하면 `src/ui/overlays.ts:41-56`).
   - 근거: spec.md FR-080(spec.md:413) "기록이 남지 않는다는 짧은 안내를 … 보여 주되 플레이를 막지 않아야", SC-017(spec.md:566) "진행 차단 0건", PRD "글자를 읽지 못해도 … 진행할 수 있어야".
   - 기대 동작: 안내를 닫지 않은 상태에서도 고르기 화면의 "다음"과 운전 화면의 조작 버튼 6개(좌·우 조향, 액셀, 브레이크, 후진, 일시정지)가 보이고 눌려야 합니다. 최소한 E2E 두 기기(Pixel 7 가로 863×360, iPhone 14 가로 750×340)와 932×430에서.
   - 재현: 초기화 스크립트로 `localStorage` getter가 `SecurityError`를 던지게 하고, 안내를 닫지 않은 채 시작 → 버기 → 다음(iPhone 14 가로에서는 여기서 막힘) → Chicken Guy → 다음 → 조작 익히기에서 브레이크 가운데를 누르면 `data-pressed`가 붙지 않음.
   - 자리(위쪽·가운데 HUD 피하기 등)나 모양은 구현 판단이지만, 위쪽에도 기어·다음 행동 그림·일시정지 버튼이 있으니 겹침을 함께 확인해야 합니다.
2. **E2E로 고정** — `tests/e2e/storage.spec.ts`의 getter 예외 시험(또는 1건 추가): 안내를 닫지 않은 채 고르기 화면을 지나 조작 익히기까지 가서 조작 버튼 가운데가 그 버튼 자신인지(`elementFromPoint`) 또는 누르면 `data-pressed`가 붙는지 확인. 지금 시험은 49행에서 먼저 닫아 이 경우를 보지 못합니다.
3. **T067 저장 막힘 열 다시 확인** — 1을 고친 뒤 안내를 닫지 않은 채(또는 닫았는지 기록하고) 세 연습 완료 → 열림 → 새로 고침 뒤 잠김을 다시 적어 주세요(`records/play-check.md`).

## 미해결 질문

**Q1. T103 그림 중 아직 쓸 화면이 없는 5종(계속하기·세로 안내·로딩·실패·3D 불가)을 어떻게 할까요?**
- A (권장): 지금 그린 40장으로 T103을 체크하고, 남은 5종은 그 화면을 만드는 태스크(T084 일시정지 "계속하기", T089 로딩·실패·3D 불가·세로 안내) 문구에 "같은 방식의 글자 없는 그림 함께"로 옮겨 적기. 그림을 실제 화면과 함께 확인할 수 있음
- B: 지금 5종도 마저 그려 T103을 끝냄. 쓰는 화면이 없어 크기·뜻은 나중에 다시 봐야 함
- C: T103을 체크하지 않고 US6·US7 뒤에 마저 그림

## 이후 태스크로 넘길 것(필수 아님)

- 레이싱 화면(`race`)은 T077 전이라 들어가면 경기도 되돌아갈 방법도 없음(구현 기록 판단 메모 3과 같음). US4·일시정지 나가기(T085) 전에는 공개 배포하지 않기
- US3-6(세 연습을 다 마치기 전 연습 목록에서 완료 표시)은 지금 화면 흐름으로는 시작 화면으로 돌아갈 길(T085)이 없어 닿지 않음. 코드(`flow.ts:136-138`, `screens.ts:70-75`)는 맞으니 T085 뒤 E2E나 플레이 확인에서 한 번 보기
- 처음 이용 흐름 전체(조작 익히기 → 세 연습 순서대로 → 축하)는 E2E·플레이 확인 어느 쪽도 끝까지 지나지 않음. 코드 대조로는 맞음(`flow.ts:140-145`, `233-235`). 마무리 점검의 사람 플레이 때 확인 권장
- `violation-early-start` / `violation-over-stop-line` 구별, 후진 버튼(64px)에서 차 크기 — T110 콘텐츠 검토

## 이전 지적 처리 결과

- 이 덩어리의 첫 검증이라 이전 지적 없음. US8 검증이 남긴 "practiceMenu 링크 검사"는 T063에서 처리됨(위 T063 마지막 줄)
