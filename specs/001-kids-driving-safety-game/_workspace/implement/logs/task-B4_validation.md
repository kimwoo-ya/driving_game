# Task B4 Validation Report

- run / task / dispatch / 실제 도구 / 세션 handle: Orca 미사용 — Claude Code 서브에이전트 spec-implement-validator, 사용자 예외 결정 2026-10-12("이번엔 예외적으로 그럼 클로드 에이전트로 검증해", 00_context.md 승인 기록). Codex validator 세션(term_afd8a2fc…)은 사용 한도로 미수신
- FEATURE_DIR / 단계 / 검토 태스크: `/Users/kyw/Documents/git/mine/driving_game/specs/001-kids-driving-safety-game` / implement / B4 = T030~T042 + B3 reviewer 비필수 제안 1건(loader.test.ts loadSounds 확인 방식)
- revision 요청값 / 읽기 전 / 테스트 후: `bc724ea78bf1d1c6f27c057df26771f17e063bb820c0fbef2d660a6acbad39a0` / `bc724ea78bf1d1c6f27c057df26771f17e063bb820c0fbef2d660a6acbad39a0` / `bc724ea78bf1d1c6f27c057df26771f17e063bb820c0fbef2d660a6acbad39a0` (세 값 같음, 재확인 차례)
  - 이력: 첫 검증 revision `ab1987defd175ae7d1773f7b37668c4f3ae7027faaad5c6f99d19200bfe03447`(요청값·읽기 전·테스트 후 같음) → PASS + Q1. Q1 답 반영 뒤 새 revision으로 재확인(아래 "재확인" 절)
  - 두 revision 사이 바뀐 파일: `contracts/modules.md` 1줄 추가(178행), `_workspace/implement/00_context.md`(snapshot 밖). 이전 보고서 작성 시각 뒤에 바뀐 파일을 `find -newer`로 찾아 이 둘뿐임을 확인. 소스·테스트 변경 없음
  - snapshot 범위 확인: `review-snapshot.py` 28행이 `_workspace` 경로를 건너뜀 → 이 보고서는 revision에 영향 없음. 그래도 "테스트 후" 값은 보고서 작성 전에 계산함
  - `dist/`(build), `test-results/`(Playwright)는 `.gitignore` 7·8행으로 무시되고 FEATURE_DIR 밖이라 snapshot에 들어가지 않음(`git check-ignore -v` 확인, 테스트 후 값 불변)
- 원문 및 코드 근거 (파일:라인): 아래 태스크별 표. 읽은 원문 = AGENTS.md, 역할 파일, orca-cross-review.md, docs/PRD.md, GLOSSARY.md, spec.md(US1, FR-001~030, FR-096·097, SC-001·003·004·005·023·032), plan.md(구조·정규화·O2·O6), data-model.md(2.1, 2.2, 4.1, 4.6), contracts/overview.md(공통 규칙·의존 방향), contracts/modules.md(1·2·4.3·8·9·11·12장), contracts/events.md(1·2·4·6장), contracts/assets.md(4·5·6장), contracts/static-paths.md(6장), research.md R6, tasks.md(머리말, D1~D8, Phase 3), task-B4_impl.md, 00_context.md, records/tooling-and-render.md O2, records/img 두 장(직접 봄). constitution은 빈 양식(사용자 결정, 규칙 없음)
- 실행한 테스트 명령 / 종료 코드 / 결과: 재확인 차례(revision `bc724ea7…39a0`)에서 실행한 것은 "재확인" 절. 아래 표는 첫 검증 차례(revision `ab1987de…03447`)의 실행 결과이며, 그 뒤 소스·테스트 변경이 없어 그대로 유효. (모두 PROJECT_ROOT에서 실행)

| 명령 | 종료 코드 | 결과 |
|---|---|---|
| `npm run typecheck` | 0 | 오류 없음 |
| `npm test -- tests/unit/controls.test.ts` | 0 | 5 passed |
| `npm test -- tests/unit/drivingLesson.test.ts` | 0 | 5 passed |
| `npm test -- tests/unit/content.test.ts` | 0 | 16 passed |
| `npm test -- tests/unit/loader.test.ts` | 0 | 9 passed |
| `npm test` | 0 | 9 files, 84 passed |
| `npm run build` | 0 | 성공, 500 kB 청크 경고(기존과 같음) |
| `npm run test:e2e -- tests/e2e/flow.spec.ts` | 0 | 4 passed (2건 × chromium·webkit) |
| `npm run test:e2e -- tests/e2e/touch.spec.ts` | 0 | 10 passed (5건 × chromium·webkit) |
| 추가 브라우저 확인 ①(저장소 밖 임시 스크립트 `scratchpad/b4check/lesson.mjs`, `vite preview --port 4174`, chromium·webkit) | 0 | 아래 "추가 확인" |
| 추가 브라우저 확인 ②(`scratchpad/b4check/realtouch.mjs`, chromium CDP 실제 터치) | 0 | 아래 "추가 확인" |

- 검증 상태: COMPLETE
- 역할 판정: PASS (T030~T042 13건 + B3 제안 1건 모두 PASS, 시도 1/2)
- 미해결 질문·지적 / 이전 지적 처리 결과:
  - 미해결 질문 0건
  - Q1(조작 익히기 앞 단계의 후진 탭): **해결** — 사용자 답 A "지금처럼 무시 + 문서에 적기"(2026-10-12, 00_context.md:44). `contracts/modules.md` 4.3 표에 "후진 탭" 행 추가(178행). 코드 변경 없음. 추가 행과 구현·다른 원문의 일치는 "재확인" 절
  - 이전 지적: FAIL 지적 없음. B3 reviewer 비필수 제안(loader.test.ts:72 소리 목록 고정)은 반영됨(아래 표)

## 판정: PASS
## 시도: 1/2 (FAIL 없음. 재확인 차례는 Q1 답에 따른 계약 문서 변경 확인이며 FAIL 재시도가 아님)

## 재확인 (revision `bc724ea7…39a0`, Q1 답 반영)

### 실행한 명령

| 명령 | 종료 코드 | 결과 |
|---|---|---|
| `python3 ivi-agent-guide/scripts/review-snapshot.py <PROJECT_ROOT> <FEATURE_DIR>` (읽기 전) | 0 | `bc724ea78bf1d1c6f27c057df26771f17e063bb820c0fbef2d660a6acbad39a0` = 요청값 |
| `git diff -- specs/001-kids-driving-safety-game/contracts/modules.md` | 0 | 1줄 추가(178행 "후진 탭")만 |
| `find … -newer task-B4_validation.md`(node_modules·dist·test-results·.git 제외) | 0 | `contracts/modules.md`, `_workspace/implement/00_context.md` 둘뿐 |
| `npm run typecheck` | 0 | 오류 없음 |
| `npm test -- tests/unit/drivingLesson.test.ts` | 0 | 5 passed |
| `npx vitest run --config <scratchpad>/b4check/vt/vitest.config.mjs` (저장소 밖 임시 검사 1건) | 0 | 1 passed — 조향·액셀·브레이크 단계에서 각각 **멈춘 채 후진 탭 1번**(짝수 번 탭으로 가려지지 않게) → 단계·기어 `forward` 그대로·이벤트 없음, 후진 단계에서 멈춘 채 탭 → 기어 `reverse` + `lessonDone` |
| snapshot (확인 후, 보고서 갱신 전) | 0 | `bc724ea78bf1d1c6f27c057df26771f17e063bb820c0fbef2d660a6acbad39a0` = 요청값 |

E2E·전체 단위 테스트·빌드는 소스·테스트가 바뀌지 않아 다시 돌리지 않음(첫 차례 결과 유지).

### 추가 행과 구현의 일치

| 추가 행 내용 | 구현 근거 | 결과 |
|---|---|---|
| 후진 단계 전에는 `gearTap`을 받지 않음 | `src/practice/drivingLesson.ts:31` 후진 처리는 `step === 'reverse' && gearTap`일 때만 | 맞음 |
| 멈춰 있어도 기어 그대로 | 위 조건 밖에서는 `requestGearToggle`을 부르지 않음, `stepVehicle`은 기어를 바꾸지 않음(`sim/vehicle.ts:52`). 임시 검사로 세 단계 모두 확인. 첫 차례 브라우저 확인(두 엔진)도 같음 | 맞음 |
| 요청을 기억하지 않음 | 상태에 탭을 담는 필드 없음(`drivingLesson.ts:5-9`), flow도 탭 하나를 한 틱에 소비하고 버림(`flow.ts:132-136`) | 맞음 |
| 움직이는 중 탭이면 어느 단계든 flow가 "먼저 멈춰요" | `flow.ts:133-136`이 단계와 상관없이 `requestGearToggle(lesson.drive).accepted === false`면 `flashStopFirst()`. 첫 차례 브라우저 확인(브레이크 단계, 두 엔진) | 맞음 |
| 끝난 상태 판별(`drivingLesson.ts:22` "후진 단계 ∧ 기어 reverse") | 앞 단계에서 기어가 바뀌지 않는다는 이 행 덕분에 성립 | 맞음 |

- 참고: 앞 단계의 후진 탭은 무입력 재안내 카운터를 0으로 되돌림(`drivingLesson.ts:46`, 탭도 아이의 입력). 추가 행의 "받지 않음"은 괄호 안 설명대로 기어·요청에 대한 것이라 어긋나지 않음.

### 다른 원문과 새 모순 여부

| 원문 | 확인 | 결과 |
|---|---|---|
| events.md 4장 | `hint`·`lessonDone` 조건과 flow 반응만 정함. 후진 탭 처리와 겹치지 않음 | 모순 없음 |
| events.md 6장 "후진 버튼 탭" | "`accepted === false`면 먼저 멈춰요, 요청은 기억하지 않음" → 추가 행의 "움직이는 중 탭이면 어느 단계든"과 같은 말. 멈춘 상태 탭의 화면 반응은 6장이 정하지 않음 | 모순 없음 |
| data-model.md 4.6 | 일반 전이 "전진·멈춤 → 후진·멈춤"과 다르지만, 추가 행이 "조작 익히기에서는 4.6보다 이 약속이 우선"이라고 범위와 우선순위를 명시. tasks.md 머리말은 data-model.md와 contracts/를 함께 최종 기준으로 둠 | 명시된 예외라 모순 아님. 4.6 쪽에는 이 예외를 가리키는 말이 없어 4.6만 읽는 사람은 모를 수 있음(INFO, 문서 보완 선택 사항) |
| data-model.md 2.2 `DriveInput/DriveState/Gear` 아래 설명 | "`requestGearToggle`이 `speed === 0`일 때만 바꿈, 거절 요청 기억 안 함" → 정지가 필요조건일 뿐 "정지면 반드시 전환"이 아님 | 모순 없음 |
| spec US1-4 | "하나씩 시범 → 그 조작을 직접 하면 다음 조작" | 맞음 |
| spec US1-8 | 움직이는 중 후진 → 전환 안 됨 + 먼저 멈추라는 그림, 멈춘 뒤 자동 전환 없음 | 추가 행·구현과 같음 |
| spec US1-9 | 멈춘 상태에서 후진 → 후진 표시, 액셀로 뒤로. 조작 익히기 앞 단계는 사용자 결정 A로 예외. 후진 단계에서는 전환되지만 같은 틱에 `lessonDone` → 다음 화면이라 조작 익히기 안에서 후진 표시·뒤로 가기는 보이지 않음(첫 차례 "참고"와 같은, 계약이 만든 결과). US1-9 전체는 안전 연습·레이싱 화면(T060 이후)에서 관찰 가능 | 새 모순 없음(이미 알린 내용) |
| spec FR-018, SC-004 | FR-018은 "멈춘 상태에서만 허용"(허용 조건). SC-004 "정지 상태 전환 20/20"은 조작 익히기 앞 단계에서 재면 0/20이 되므로 최종 점검(T120)은 안전 연습·레이싱에서 재야 함 | 모순 없음(INFO: T120 측정 위치 참고) |

## 추가 확인 (자동 테스트가 직접 보지 않는 부분)

| 확인 | chromium | webkit |
|---|---|---|
| 조작 익히기 전체: 조향 → 액셀 → 브레이크(액셀+브레이크 동시로 정지) → 정지 후 후진 탭 → `lessonDone` → `start` | 통과 | 통과 |
| 움직이는 중 후진 탭 → `.hud-stop-first[data-show]`, 기어 표시 `forward` 유지 | 통과 | 통과 |
| `lessonDone` 뒤 `#controls` 숨김, `__e2e.passenger` = null(플레이 화면 아님) | 통과 | 통과 |
| 다시 시작 → 이전 차량·인물이 `aria-pressed=true`, 다음 버튼 활성(FR-010, FR-097) | 통과 | 통과 |
| 같은 실행에서 두 번째 선택 뒤 조작 익히기 다시 안 거침(FR-027) → `start`(T060 전 임시) | 통과 | 통과 |
| 3D 캔버스 `pointer-events: none`(FR-023) | 통과 | 통과 |
| 조향 단계에서 멈춘 채 후진 탭 → 기어 그대로·"먼저 멈춰요" 없음(구현 메모 1의 실제 동작) | 관찰 | 관찰 |
| 실제 터치(CDP `Input.dispatchTouchEvent`): 버튼 중심의 `elementFromPoint`가 `#controls` 안 요소, 두 손가락 동시 left+accel 눌림, 액셀 손가락이 버튼 밖으로 미끄러지면 해제, `touchCancel` → 전부 해제, 3D 영역 탭은 아무 변화 없음 | 통과 | (WebKit 다중 터치 주입 수단 없음 — 미실행) |

## 태스크별 판정

| 태스크 | 판정 | 근거 (파일:라인) | 테스트 |
|---|---|---|---|
| T030 controls 순수 부분 | PASS | 타입 4종 `src/input/controls.ts:4-7`(modules.md 2장 그대로). `pressedButtons` 경계 포함·점 개수 무관 `:11`, `:14-20`. `toDriveInput` steer = left − right, `throttle = accel ∧ ¬brake` `:23-30`(FR-015, SC-004) | `tests/unit/controls.test.ts` 5건(경계 포함·밖 무시 `:13-17`, 손바닥 `:19-21`, 좌우 동시 0 `:25-29`, 액셀+브레이크 20회 `:31-35`, 액셀만 `:37-39`) exit 0 |
| T031 lifecycle | PASS | `LifecycleSignal` `src/platform/lifecycle.ts:1`. 세로 또는 너무 작은 영역(자리값 480×280, O6 표시) `:3-8`. portrait/landscape 전환·가로 유지 중 크기 변화 → layout `:15-21`, `screen.orientation` change(180°) `:24`, visibilitychange `:22`, blur `:25`, `gesturestart`·`dblclick`·`contextmenu` `:26`, `touchmove` passive false `:27`. 방향 고정 API 없음(FR-007). 시작 때 세로면 portrait 1회 `:28`(계약 표와 어긋나지 않는 추가) | typecheck exit 0, blur→해제는 touch.spec `:74-75` |
| T032 controls DOM + CSS | PASS | `#controls` 하나에 버튼 6개, `role=button`·접근성 이름 `controls.ts:62-71`. 붙일 때·resize 때 재측정 `:72-73`(+ pointerdown 때 `:76`, 숨겨졌다 보일 때 대비). pointerId별 좌표 표 `:43`, `:75-86`, 좌표로 판정. reverse·pause는 pointerdown 순간 1회 `onTap` `:79`. up/cancel 즉시 제거 `:87-92`. `releaseAll`이 표를 비우고 표에 없는 손가락의 move는 무시 `:83`, `:100-103` → 새로 눌러야 반영(FR-017). `data-pressed`(D3) `:54-60`. 그림은 D4(`picture`) `:68`. CSS: html·body `touch-action`·`user-select`·`-webkit-touch-callout`·`overscroll-behavior` `src/style.css:1-14`, 캔버스 `pointer-events: none` `:16-21`, 버튼 크기 `clamp(64px,20vh,112px)`·간격 16px·가장자리 24px + `env(safe-area-inset-*)` `:57-128`, 왼쪽 좌·우 / 오른쪽 브레이크·액셀 / 액셀 위 둥근 후진 / 오른쪽 위 일시정지(FR-013) | typecheck exit 0, 동작은 T041 + 추가 확인(실제 터치) |
| T033 탑승객 | PASS | `cloneModel` → `scale = height`(정규화 키 1 m) → `clips.idle` AnimationMixer `src/render/characters.ts:10-22`. 차량 표시 객체의 자식으로 `seats[0].pos` `:25-30`. 실제 시간 꾸밈 `:6-7`, `:33-38`(modules.md 9장 "시간"). 판정·카메라로 값을 돌려주지 않음 | typecheck exit 0, 화면은 T042 기록 |
| T034 showroom | PASS | 한 줄 진열 `src/render/showroom.ts:22-34`, 고른 것만 1.25배·회전 `:42-45`, 인물 Idle `:26`, `:46`. 칸 중심과 같은 폭 DOM 버튼 중심이 맞도록 카메라 거리 계산 `:48-53`(research R6) | typecheck exit 0, flow.spec 진입 확인 |
| T035 pick 화면 | PASS | 같은 폭 투명 버튼 열, 접근성 이름 = label, `aria-pressed` 강조 `src/ui/screens.ts:31-60`, 그림 다음 버튼·선택 전 비활성 `:38-43`, 잠긴 항목 없음. 이전 선택 기본 강조는 flow가 넘김 `src/app/flow.ts:80-87`. 글자 노출 없음(FR-009·012·097) | typecheck exit 0, flow.spec(5개·3개 항목, aria-pressed), 추가 확인(다시 고를 때 이전 선택 강조) |
| T036 drivingLesson | PASS (Q1 해결 뒤 modules.md 4.3 "후진 탭" 행과도 일치, 재확인 절) | 타입·이벤트·시작 상태 `src/practice/drivingLesson.ts:5-19`(modules.md 4.3 그대로, 시작 `restingAt(SCENARIOS[0].segments[0].start)`). 순서 `steer→accel→brake→reverse` `:12`. 통과 조건: 조향 `input.steer ≠ 0`, 액셀 `speed > 0`, 브레이크 "움직이던 차가 브레이크로 0" `:36-40`, 후진 `requestGearToggle` 수락 `:31-34`. 단계 바뀔 때 `hint` repeat false `:41-44`, 무입력 `IDLE_HINT_TICKS`마다 repeat true `:46-50`. `lessonDone` 1회 뒤 같은 state·빈 이벤트 `:22`, `:29`(overview 공통 규칙 7). 순수 폴더 import 규칙 지킴(three·DOM 없음) | `tests/unit/drivingLesson.test.ts` 5건 exit 0(시작 hint, 순서·lessonDone 1회, 뒤 no-op `toBe(state)`, 조작 없으면 안 넘어감·자연 감속 정지는 불통과·움직이는 중 후진 탭 거절, 36,000틱 무입력 repeat만) |
| T037 townView | PASS | `TOWN.areas` 기본 도형(땅·도로·보도·건물, 횡단보도는 T058로 건너뜀) `src/render/townView.ts:23-39`. 아이 차 `play.vehicle` + `seats[0]`에 `play.character` `:45-53`. 카메라 `stage.follow(scene.drive)` `:57`(B3 고정 오프셋, `DRIVING_SPEC` 기준). 상태는 읽기만 함. 차 방향 `rotation.y = heading`이 `sim/vehicle.ts:48-49`의 전진 방향 (sin h, cos h)과 같음 | typecheck exit 0, flow.spec 진입 스크린샷 |
| T038 HUD | PASS | 전진·후진을 색 + 모양으로 늘 표시 `src/ui/hud.ts:34-39`, 자리표시 도형 초록 위 삼각형 / 주황 아래 삼각형 `src/style.css:251-265`(FR-019·025). cue: 그림 + `#controls[data-cue]` 버튼 강조, repeat면 `data-demo` 누르는 시범 `hud.ts:42-47`, CSS `style.css:130-149`. "먼저 멈춰요" 그림 `hud.ts:50-52`, `style.css:178-203`, `:307-323`(FR-018) | typecheck exit 0, 추가 확인(움직이는 중 탭 → data-show) |
| T039 flow 연결 | PASS | start → pickVehicle → pickCharacter, 화면과 맞지 않는 버튼 무시 `src/app/flow.ts:91-107`. 조작 익히기 조건 `!tutorialDone ∧ !drivingLessonDone` `:105`. 진입 때 `releaseAll`·HUD `:109-117`. 틱마다 `readDriveInput` + 후진 탭 하나당 한 틱 `gearTap`, 거절이면 `flashStopFirst` `:129-140`(modules.md 8.3 틱 규칙, events.md 6장). 후진 탭은 플레이 화면에서만 셈 `:172-174`. `watchLifecycle`의 layout·blur → `releaseAll` `:175-177`. 프레임마다 `renderShowroom`/`renderTown` + `updateGear` `:141-149`. `lessonDone` → `drivingLessonDone = true` → `start`(T060 전 임시) `:118-127`. `mountControls` 1회 `:172`. `__e2e.passenger`(`?e2e`일 때만, 읽기 전용 getter) `:162-171`. 조작 층은 플레이 화면에서만 보임 `:78` | build exit 0, flow.spec·touch.spec, 추가 확인(조작 익히기 끝까지·재선택) |
| T040 E2E flow | PASS | 15조합 각각 시작 → 차량(5개 항목) → 인물(3개) → `drivingLesson` → `__e2e.passenger` = 고른 인물 → 스크린샷 `tests/e2e/flow.spec.ts:31-54`(US1-2·3·12·13, SC-001 일부, SC-032 브라우저). 시작·다음 연타에도 화면 기록이 한 번씩만 `:56-85` | exit 0, 4 passed |
| T041 E2E touch | PASS | body·버튼 6개 계산된 `touch-action`·`user-select` none `tests/e2e/touch.spec.ts:34-43`(SC-005). 두 손 동시·미끄러짐·pointercancel·blur·해제 뒤 move 무시·새로 누름 `:45-81`(FR-014·016·017, SC-003 일부). 가로 3종에서 버튼끼리 겹침 0, 가장자리 16px 이상 + 스크린샷 `:83-106`(SC-023 브라우저; 헤드리스 `env()` = 0이라 실제 노치는 T113) | exit 0, 10 passed |
| T042 렌더링 점검 | PASS | `yawDeg`·`seats` 확정 `src/content/vehicles.ts:9-17`, chicken-guy `yawDeg` 0 `src/content/characters.ts:11-15`. 기록 `records/tooling-and-render.md` "O2 모델 렌더링 점검 (T042)": 8종 방향·크기, 왜건 flatShading, 버기 그리기 호출 12, 세 인물 `SkeletonUtils.clone`·크기·Idle, Chicken Guy 기존 경고 4건 확인, 15/15. 그림 `records/img/t042-passengers-15.png`(15칸 모두 고른 인물이 보임, 트럭은 지붕 위 — 사용자 결정 00_context.md:42), `t042-vehicles-top.png`(다섯 대 앞 = 화면 위) 직접 확인. `Sit` 고정 불필요로 판단(계약 밖 타입 변경 없음) | `npm test -- tests/unit/content.test.ts` exit 0(16 passed), 기록 15/15 |
| B3 제안 loader.test | PASS | `tests/unit/loader.test.ts:64-81`: 임시로 넣은 ok/bad 두 항목의 포함 여부만 확인 → 실제 소리 파일이 추가돼도 깨지지 않음. FR-070(실패 파일 제외, reject 없음)·같은 Promise 확인 유지 | exit 0, 9 passed |

## 구현 판단 메모 10건 점검

| # | 메모 | 판정 |
|---|---|---|
| 1 | 조작 익히기 앞 단계에서 후진 탭을 받지 않음 | 첫 차례: 계약 충돌 아님, data-model.md 4.6과의 긴장을 Q1로 보고. 재확인: 사용자 답 A에 따라 modules.md 4.3 "후진 탭" 행이 이 동작을 명시하고 4.6보다 우선함을 적음 → 해결 |
| 2 | Stage에 `camera`·`show` 추가 | 문제없음. modules.md 9장 "렌더러 내부 구조는 구현 재량", 계약의 세 멤버(`scene`·`resize`·`draw`)를 그대로 두고 더한 것뿐 `src/render/stage.ts:4-14`, flow는 `draw`만 부름(`flow.ts:148`). B3의 `follow`와 같은 방식 |
| 3 | `input/controls.ts`가 `ui/screens.ts`의 `picture` import | 계약 위반 아님. overview 공통 규칙 3의 순수 폴더 목록에 `input`은 없고, `pressedButtons`·`toDriveInput`은 여전히 DOM을 쓰지 않는 함수(Vitest가 node 환경에서 통과). D4 규칙을 지키기 위한 것. 모듈 배치의 좋고 나쁨은 reviewer 영역 |
| 4 | PlaySession `flow: 'sequence'` 고정, 조건 밖은 `start` | T039 범위 그대로("T060 전까지는 start"). `practiceStarted`·sequence/menu 판단은 T060 범위 |
| 5 | `__e2e.passenger`를 렌더러가 앉힌 인물로 | static-paths.md 6장 "아이 차 탑승객 CharacterKindId 또는 null"과 맞음. 플레이 화면 밖 null `flow.ts:167-169`, 실제로 앉힌 직후 기록 `townView.ts:46-53`. 게임 동작을 바꾸지 않음 |
| 6 | 애니메이션 시간에 `performance.now()` | modules.md 9장 "꾸밈에는 실제 시간을 써도 됩니다", overview 공통 규칙 1과 맞음 |
| 7 | E2E에서 `#controls`에 PointerEvent 직접 보냄 | 계약상 판정이 좌표 기준이라 유효. 실제 터치 경로(Chromium CDP)도 추가 확인에서 같은 결과 |
| 8 | 안전 영역은 가장자리 16px로 확인 | CSS가 모든 버튼에 `env(safe-area-inset-*)` + 여백 `style.css:78`, `:99-127`, `index.html` viewport-fit=cover. 실제 기기는 T113 범위 |
| 9 | 트럭 탑승객 지붕 위 | 사용자 결정 기록 00_context.md:42, research R6 "지붕 위 좌석 등" 허용 범위 |
| 10 | 일시정지 탭·나머지 신호·소리 미연결 | 범위 밖(T084, T086, T081) — 요청서의 범위 밖 목록과 같음 |

## 질문 이력

**Q1 — 해결(사용자 답 A, modules.md 4.3 행 추가).** 2026-10-12 사용자 답 "지금처럼 무시 + 문서에 적기" → `contracts/modules.md:178` "후진 탭" 행 추가, 코드 변경 없음, 새 revision `bc724ea7…39a0`에서 재확인 PASS. 아래는 첫 차례(revision `ab1987de…03447`)에 올린 질문 원문.

**Q1. 조작 익히기의 조향·액셀·브레이크 단계에서, 차가 멈춘 상태로 후진 버튼을 누르면 기어가 바뀌어야 하나요?**

- 현재 동작: 바뀌지 않고 아무 반응도 없음(기어 표시 `forward` 그대로, "먼저 멈춰요"도 안 나옴). 후진 단계에서만 전환을 받음 `src/practice/drivingLesson.ts:22`, `:31-34`. 브라우저에서 두 엔진 모두 이 동작을 관찰함.
- 이 동작을 지지하는 원문: modules.md 4.3이 상태를 `step`·`idleTicks`·`drive` 셋으로 고정하고 "끝난 뒤 no-op"을 요구 → 앞 단계에서 기어를 바꿀 수 있으면 끝난 상태를 구분할 필드가 없음. 4.3과 events.md 4장은 앞 단계의 후진 탭 처리를 따로 말하지 않음.
- 긴장 관계 원문: data-model.md 4.6(주행 방향) "전진·멈춤 → 후진 전환 누름, `speed === 0` → 후진·멈춤"은 조작 익히기를 예외로 두지 않음. spec US1-9 "완전히 멈춘 상태에서 후진 전환을 누르면 후진 상태가 표시". events.md 6장은 `drivingLesson`을 후진 탭을 처리하는 화면으로 적고, 수락될 때의 화면 반응(기어 표시 변화)을 기대하게 함. 액셀·브레이크·조향은 어느 단계에서나 동작하는데 후진만 막혀 있어 아이에게는 "버튼이 안 먹는" 것처럼 보일 수 있음.
- 참고(계약이 만든 결과, 구현 문제 아님): 후진 단계에서 전환이 수락된 그 틱에 `lessonDone` → 다음 화면이라, 조작 익히기 안에서는 후진 표시나 "액셀로 뒤로 가기"(US1-9 뒷부분)를 볼 수 없음(events.md 4장 `lessonDone` → 다음 상황).
- 선택지:
  - A(권장): 현재 동작 유지. 조작 익히기는 단계별 안내라 앞 단계의 후진 탭은 받지 않는 것으로 data-model.md 4.6 또는 modules.md 4.3에 한 줄 보충. → 추가 구현 없음, B4 PASS 그대로
  - B: 앞 단계에서도 멈춘 상태면 전환. → 끝 상태를 구분하는 방법(상태 필드 추가 등)을 계약에 정한 뒤 T036 재작업·재검증
- 판정 영향: 현재 계약(4.3)에 대한 구현 판정은 PASS. 답이 B면 스펙 변경에 따른 재작업이며 이번 판정의 오류가 아님. orca-cross-review.md 기준으로 Q1 답 전에는 수락하지 않기를 권함.

## 참고 (판정에 영향 없음)

- `src/render/models.ts:23-27` 차량만 정점 기준 상자로 바꾼 것은 T042 파일 목록 밖이지만 assets.md 4장 보장 "차량 Z 길이 = `DRIVING_SPEC.bodyLength`"(트럭처럼 비스듬한 원본)를 지키기 위한 최소 수정. 기록에 이유가 있음.
- `window.__e2e`에는 지금 `ticks`·`passenger`만 있음. `raceTicks`·`playerRank`(static-paths.md 6장)는 레이싱 태스크 범위.
- tasks.md 변경은 T001~T029 체크 표시 29줄뿐(체크 외 내용 변경 0), T030~T042는 미체크 상태.
