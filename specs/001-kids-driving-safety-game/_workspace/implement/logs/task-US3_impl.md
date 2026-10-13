# Task US3 Implementation Log (연습 고르기·레이싱 열림 T063~T067 + UI 그림 T103)

- 작성: 2026-10-13, 구현자 = 조율자 Claude Code(Opus 5.5) 세션. UI 그림 40장은 같은 세션의 보조 에이전트가 저장소 밖에서 그리고 리더가 검사 후 복사
- 범위: T063 시작 화면 레이싱 버튼·연습 목록(+ T096이 남긴 `practiceMenu` 링크 검사), T064 저장 불가 안내·레이싱 열림 축하, T065 flow 연결(임시 `sequenceDone` 흐름 → data-model.md 4.1 표대로), T066 E2E `storage.spec.ts` 5건, T067 플레이 확인, T103 UI 그림(사용자 결정 2026-10-13 "직접 그린 그림 · 버튼·안내 그림만", 00_context 승인 기록)
- 검증 방식: 사용자 결정(검증 방식 재조정) — 덩어리 끝에 검증자·리뷰어 1번씩, 스펙 대조 + 테스트 실행

## 변경 파일

| 태스크 | 파일 | 내용 |
|---|---|---|
| T063 | `src/ui/screens.ts` | `showStart(ui, raceOpen, onStart, onRace, onCredits)`: 시작 + 레이싱(잠김이면 `race-locked` 그림·`data-locked`) + 잠김 안내 그림 자리 + 크레딧. `flashRaceLocked()`(그림 잠깐, 음성은 T081). `showPracticeMenu(ui, done, onPick)`: 세 연습 그림 `images/ui/scenario-<id>.svg`, aria-label은 FR-028 이름, 이번 실행 완료면 `data-done` + `done.svg` 표시, 모두 선택 가능. `restart()`를 hud.ts에서 옮겨 export(두 곳에서 씀) |
| T063 | `src/ui/hud.ts` | `restart`를 screens.ts에서 가져옴(동작 같음) |
| T063 | `tests/e2e/credits.spec.ts` | `a[href]` 0 시험에 `practiceMenu`(완료 저장값 주입) 추가 |
| T064 | `src/ui/overlays.ts` | `showRaceUnlocked()`(연습 겹침 층, kind `unlocked`), `showStorageNotice(onClose)`: `body`에 붙는 아래쪽 띠(그림 + 보호자용 짧은 글 + 닫기). 화면이 바뀌어도 닫을 때까지 남고 플레이를 막지 않음 |
| T065 | `src/app/flow.ts` | `mode`(시작 화면에서 고른 것), `onRace`(잠김 → `flashRaceLocked`만, 열림 → `pickVehicle` mode race), `onCharacterNext`(race → `race`(경기는 T077) / `!tutorialDone ∧ !practiceStarted` → sequence: `!drivingLessonDone`이면 `drivingLesson` 아니면 첫 미완료 / 그 밖 → menu: `practiceMenu`), `onScenarioPick`(`!tutorialDone ∧ !drivingLessonDone`이면 조작 익히기 뒤 고른 상황), `nextScenario`는 `run.completedThisRun` 기준, `scenarioCompleted`에서 세 상황이 처음 다 차면 같은 틱에 `tutorialDone = true` → `commitSave(…, 'tutorial', trackConfigKey(TRACK))` → false면 안내 1회, 칭찬 `PRAISE_TICKS` 뒤 축하 `UNLOCK_TICKS`(자리값 180, T117) → `start`. 그 밖은 sequence면 다음 미완료, menu면 `practiceMenu`. 부팅 `storageOk` 거짓이면 안내 1회(`storageNoticeShown`, `data-overlays`) |
| T066 | `tests/e2e/storage.spec.ts`(신설) | ① 기록 없음: 잠김·누르면 그림 안내·`start` 그대로 ② 완료 저장값 주입: 열림·`pickVehicle` ③ localStorage getter 예외: `start` 도달·안내 1회·닫아도 진행 ④ 손상 값 `{`: 잠김·안내 없음 ⑤ 열림 저장값 → 새로 고침 2번 유지·저장값 그대로, 안전 연습은 연습 목록 → 고른 연습 바로 |
| T067 | `records/play-check.md`, `records/img/t067-play-check.png` | 정상·저장 막힘 두 환경 결과(아래) |
| T103 | `src/assets/images/ui/*.svg` 40개(신설) | 글자 없는 그림, 합계 41,846바이트. `scenario-*` 3, `violation-*` 6, `cue-*` 9, 시작·레이싱·잠김·잠김 안내·열림 축하·크레딧·돌아가기·다음·닫기·완료·저장 불가·조작 버튼 6·전진/후진·먼저 멈춰요·게임 멈춤·칭찬. 모아 보기 `records/img/t103-ui-pictures.png` |
| T063~T065, T103 | `src/style.css` | 그림 자리별 크기, 시작 화면 두 버튼 간격·잠김 버튼 색, 잠김 안내 그림, 연습 목록 카드·완료 표시, 저장 불가 띠, 3D가 없는 화면(시작·크레딧·연습 목록)에서 3D 캔버스 숨김(직전 진열 인물이 비치던 문제). 그림이 생겨 쓰이지 않게 된 자리표시 도형 CSS 삭제(규칙 그림용 `.shape-rule`만 남김) |

## 판단 메모(검토 요청)

1. 축하는 칭찬(`PRAISE_TICKS`) 뒤 같은 겹침 층에서 `UNLOCK_TICKS` 동안 보이고 `start`로 감. events.md "칭찬 그림 → 축하 겹침 → start"를 이렇게 읽음. 저장은 완료 틱에 바로(4.2 "같은 틱에").
2. 저장 불가 안내는 모달이 아니라 아래쪽 띠: FR-080 "플레이를 막지 않아야". 연습 겹침 층(`#ui` 안)은 화면이 바뀔 때 지워지므로 `body`에 따로 붙임.
3. 레이싱(`race`) 화면은 T077 전이라 들어가면 경기 없이 빈 상태(되돌아갈 버튼 없음, 일시정지는 T084). tasks T065 "→ `race`(경기는 T077)" 그대로. US4 전에는 공개 배포하지 않는 것이 맞음.
4. 연습 목록에서 시작 화면으로 돌아가는 버튼은 스펙·data-model 4.1에 없어 넣지 않음.
5. 그림 파일이 모두 생겨 UI 쪽 자리표시 도형은 쓰이지 않음. `picture(id, shape)`의 대체 경로는 규칙 그림(T102 전)과 이후 UI 그림(일시정지 등)을 위해 남김.
6. 그림 에이전트가 스스로 약하다고 꼽은 것: `violation-early-start`와 `violation-over-stop-line`이 비슷함(모래시계·움직임 선으로만 구분), 후진 버튼(64px)에서 차가 작음. `cue-way`(방향 안내)는 좌우 어느 버튼도 가리키지 않는 "길을 따라가요" 그림으로 다시 그림, `violation-ran-red`는 신호등을 키움.

## attempt 2 (US3 validator FAIL 시도 1 반영, task-US3_validation.md)

| 지적 | 파일 | 수정 |
|---|---|---|
| 1. 저장 불가 안내 띠가 닫힐 때까지 조작 버튼·"다음" 버튼을 가림(FR-080, SC-017) | `src/style.css`, `src/ui/overlays.ts` | 띠를 위쪽 가운데로(왼쪽 위 기어·오른쪽 위 버튼 자리 비움), `pointer-events: none`으로 터치를 아래로 통과(닫기 버튼만 받음), CSS `notice-out`(10초 뒤, 자리값 T117)이 끝나면 저절로 닫힘(`animationend` → 같은 닫기 처리, 두 번 불려도 한 번만) |
| 〃(보이는 때) | `src/app/flow.ts` | 부팅 직후(로딩 중)가 아니라 시작 화면이 처음 나올 때 안내 1회 — 로딩이 길면 보호자가 보기 전에 저절로 사라질 수 있어서 |
| 2. E2E로 고정 | `tests/e2e/storage.spec.ts` | getter 예외 시험: 안내를 닫지 않은 채 차량 고르기 "다음"·조작 익히기 조작 버튼 6개 가운데가 그 버튼인지(`elementFromPoint`) 확인 뒤 닫기. 새 시험 1건: 닫지 않아도 15초 안에 사라지고 `data-overlays`에서 빠짐(→ 6건 × 두 엔진) |
| 3. T067 저장 막힘 열 다시 확인 | `records/play-check.md`, `records/img/t067-play-check.png` | 안내를 닫지 않은 채 다시 주행, 결과 같음(아래) |
| Q1. 화면이 없는 그림 5종 | `tasks.md` T084·T089·T103 문구 | 권장안 A: 지금 40장으로 T103 완료, 계속하기는 T084, 로딩·실패·3D 불가·세로 안내는 T089에서 같은 방식으로 그림(사용자 결정 "버튼·안내 그림만"과 맞음) |

## 자체 검증

| 명령 | 종료 코드 | 결과 |
|---|---|---|
| `npm run typecheck` | 0 | 오류 없음 |
| `npm test` | 0 | 14 files, 130 passed |
| `npm run build` | 0 | 성공(500 kB 청크 경고 기존과 같음) |
| `npm run test:e2e` | 0 | attempt 1: 36 passed / attempt 2: 아래 |
| `ls src/assets/images/ui/cue-*.svg \| wc -l` / `violation-*` / `scenario-*` | 0 | 9 / 6 / 3 |
| `grep -lE '<text\|<script\|href\|foreignObject\|on[a-z]+=' src/assets/images/ui/*.svg` | 1(일치 없음) | 글자·스크립트·외부 주소 없음 |
| 플레이 확인(저장소 밖 복사본, T067) | 0 | 정상·저장 막힘 모두 기대대로, 브라우저 오류 0(`records/play-check.md`) |

### attempt 2 자체 검증

| 명령 | 종료 코드 | 결과 |
|---|---|---|
| `npm run typecheck` | 0 | 오류 없음 |
| `npm test` | 0 | 130 passed |
| `npm run build` | 0 | 성공 |
| `npm run test:e2e` | 0 | 38 passed(storage 6건 × 두 엔진) |
| 플레이 확인 저장 막힘(안내 닫지 않음) | 0 | 연습 목록에서 띠 보임 → 주행·완료·축하·열림, 새로 고침 뒤 잠김, 안내 1회, 브라우저 오류 0 |
