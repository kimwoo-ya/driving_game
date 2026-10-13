# Task B4 Implementation Log

- 작성: 2026-10-12, 구현자 = 조율자 Claude Code(Opus 5.5) 세션 `term_abc41cac-b371-4664-b4aa-3449f16ef095`(순차 구현)
- 범위: tasks.md Phase 3 US1 T030~T042(차량·인물 선택, 조작 버튼, 조작 익히기, 마을 기본 화면, 탑승객, 렌더링 점검) + B3 reviewer 비필수 제안 1건(msg_76a0c63f0858)
- 시작 상태: B1~B3 완료(T001~T029 체크), B3 완료 revision `c9e9bbe7…b196d`

## 변경 파일

| 태스크 | 파일 | 내용 |
|---|---|---|
| T030 | `src/input/controls.ts`(신설, 순수 부분) | `ControlButton`, `HoldButton`, `ScreenPoint`, `ScreenRect`, `pressedButtons`(경계 포함, 점 개수 무관), `toDriveInput`(좌우 동시 0, 브레이크 우선) |
| T030 | `tests/unit/controls.test.ts`(신설) | 5건: 경계 포함·밖 점 무시, 손바닥(점 여러 개), 좌우 동시 steer 0, 액셀+브레이크 20회, 액셀만 |
| T031 | `src/platform/lifecycle.ts`(신설) | `LifecycleSignal`, `watchLifecycle`: visibilitychange → hidden/visible, 세로·너무 작은 영역(자리값 480×280, O6) → portrait, 가로 복귀 → landscape, 가로 유지 중 크기 변화·`screen.orientation` change(180° 뒤집기) → layout, window blur → blur, 시작 때 세로면 portrait 1회, `gesturestart`·`dblclick`·`contextmenu`·`touchmove`(passive false) preventDefault, 방향 고정 API 없음 |
| T032 | `src/input/controls.ts`(DOM 부분) | `mountControls`: `#controls` 층 하나에 버튼 6개(`role=button`, 접근성 이름), 손가락(pointerId)별 좌표 표, 좌표로 판정, 붙일 때·resize·pointerdown 때 사각형 재측정, reverse·pause는 pointerdown 순간 `onTap` 1회, pointerup/cancel 즉시 제거, 눌린 버튼 `data-pressed`(D3). `readDriveInput`. `releaseAll`은 표를 비움 → 닿아 있던 손가락의 move는 표에 없어 무시, 떼고 새로 눌러야 반영. 버튼 그림은 D4(`images/ui/control-<버튼>.svg`, 없으면 CSS 도형) |
| T032 | `src/style.css` | html·body `touch-action`·`user-select`·`-webkit-touch-callout`: none, `overscroll-behavior: none`; 캔버스 `pointer-events: none`; `#ui`는 위 층(`z-index` 2)이지만 `pointer-events: none`, 안의 버튼만 auto → 운전 중 터치는 `#controls`(z 1)로 감; 조작 버튼 배치(왼쪽 좌·우, 오른쪽 브레이크·액셀, 액셀 위 둥근 후진 전환, 오른쪽 위 일시정지; 크기 `clamp(64px, 20vh, 112px)`, 간격 16px, 가장자리 24px + `env(safe-area-inset-*)`), 강조·시범 애니메이션, HUD, 선택 화면, 자리표시 도형 |
| T033 | `src/render/characters.ts`(신설, 탑승객 부분) | `characterObject`(복제 → 키를 `height`로 → `clips.idle` AnimationMixer 재생), `seatPassenger`(차량 표시 객체의 자식으로 `seats[0]`), `animateCharacters`(실제 시간, 프레임당 1번). 판정·카메라로 값을 되돌리지 않음 |
| T034 | `src/render/showroom.ts`(신설) | `renderShowroom(stage, list, selected)`: 한 줄 진열, 고른 것만 1.25배·회전, 인물은 Idle 재생. 줄 폭이 화면 가로에 맞도록 카메라 거리 계산 → 칸 중심이 같은 폭 DOM 버튼 중심과 맞음 |
| T035 | `src/ui/screens.ts` | `showPick`: 같은 폭 투명 버튼 열(접근성 이름 = label, `aria-pressed`로 강조), 그림 다음 버튼(선택 전 비활성), 잠긴 항목 없음, 이전 선택 기본 강조 |
| T036 | `src/practice/drivingLesson.ts`(신설) | modules.md 4.3 그대로. 시작 `restingAt(SCENARIOS[0].segments[0].start)` |
| T036 | `tests/unit/drivingLesson.test.ts`(신설) | 5건: 시작 hint, 네 단계 순서·lessonDone 1회, 뒤 no-op, 그 조작 없으면 안 넘어감(자연 감속 정지는 브레이크 단계 통과 아님, 움직이는 중 후진 탭 거절 포함), 무입력 36,000틱 동안 `IDLE_HINT_TICKS`마다 repeat·실패·시간제한 없음 |
| T037 | `src/render/townView.ts`(신설) | `renderTown(stage, play, scene)`: `TOWN.areas` 기본 도형(땅·도로·보도·건물; 횡단보도는 T058), 아이 차 + 탑승객(차종·인물이 바뀔 때만 다시 만듦), `stage.follow`로 카메라 추적. E2E용 `seatedPassenger()` |
| T038 | `src/ui/hud.ts`(신설) | `showHud`, `updateGear`(전진 초록 위 삼각형 / 후진 주황 아래 삼각형, 늘 보임), `showCue`(다음 행동 그림 + `#controls[data-cue]` 버튼 강조, repeat면 `data-demo` 누르는 시범), `flashStopFirst`("먼저 멈춰요" 그림 잠깐) |
| T039 | `src/app/flow.ts` | start 시작 → pickVehicle → pickCharacter → (저장된 완료 기록 없음 ∧ 조작 익히기 미통과) drivingLesson, 그 밖은 start(T060 전까지). `mountControls` 1회, 틱마다 `readDriveInput` + 후진 탭 하나당 한 틱 `gearTap`, 움직이는 중 탭 → `flashStopFirst`, 진입 때 `releaseAll`, `watchLifecycle`의 layout·blur → `releaseAll`, 프레임마다 `renderShowroom`/`renderTown` + `updateGear`, `lessonDone` → `drivingLessonDone = true` → start, 화면과 맞지 않는 버튼 입력 무시, 조작 층은 플레이 화면에서만 보임, `window.__e2e.passenger` |
| T040 | `tests/e2e/flow.spec.ts`(신설) | 2건(두 엔진): 차량 5 × 인물 3 = 15조합 각각 선택 → drivingLesson 진입 → `__e2e.passenger` = 고른 인물 → 스크린샷 저장, 시작·다음 버튼 연타에도 화면 전환 1번 |
| T041 | `tests/e2e/touch.spec.ts`(신설) | 5건(두 엔진): body·버튼 6개 `touch-action`·`user-select` none, 합성 포인터(두 손 동시·미끄러짐·pointercancel·blur·해제 뒤 move 무시·새로 누름), 가로 3종에서 버튼끼리·가장자리(16px) 겹침 0 + 스크린샷 |
| T042 | `src/content/vehicles.ts`, `src/content/characters.ts` | `yawDeg`(버기 90, 트럭 73, 나머지 0), `seats`(버기·지프 옆자리, 나머지 가운데, 트럭은 사용자 결정으로 머리가 지붕 위), chicken-guy `yawDeg` 0 확정 |
| T042 | `src/render/models.ts` | 차량만 정점 기준 상자(`setFromObject(root, true)`). 트럭 원본이 비스듬해 geometry 상자로는 길이·중심이 어긋남(assets.md 4장 "Z 길이 = bodyLength" 보장) |
| T042 | `records/tooling-and-render.md` + `records/img/t042-*.png` | 렌더링 점검 결과 표, 15조합 탑승객 모음·차량 위 시점 그림 |
| T024 보충 | `src/render/stage.ts` | 렌더러 내부용 `camera`(진열이 카메라를 직접 놓음), `show(group)`(화면마다 자기 Group만 보이게) 추가 |
| B3 제안 | `tests/unit/loader.test.ts` | `loadSounds` 시험이 임시로 넣은 ok/bad 두 항목의 포함 여부만 확인(실제 소리 파일이 추가돼도 깨지지 않음) |

## 구현 판단 메모(검토 요청)

1. **조작 익히기의 후진 탭**: 상태 모양이 계약대로 `step`·`idleTicks`·`drive` 셋뿐이라, 끝난 상태를 "reverse 단계 ∧ gear reverse"로 판단함. 그래서 앞 단계(조향·액셀·브레이크)에서는 후진 탭을 받지 않음(기어 그대로). flow는 events.md 6장대로 움직이는 중 탭이면 어느 단계든 "먼저 멈춰요"를 보임.
2. **Stage 확장**: B3의 `follow`와 같은 렌더러 내부 진입점으로 `camera`·`show` 추가(modules.md 9장 "렌더러 내부 구조는 구현 재량"). flow는 부르지 않음.
3. **조작 버튼 그림**: D4 규칙을 지키려고 `input/controls.ts`가 `ui/screens.ts`의 `picture`를 import. 순수 모듈 아님(DOM 쪽 파일).
4. **flow의 PlaySession**: practice는 `flow` 필드가 필수라 `'sequence'`를 넣음. `practiceStarted`·sequence/menu 판단과 안전 상황 진입은 T060 범위라 손대지 않음. 조작 익히기 조건이 아니면 지금은 start로 돌아감(T060 전까지).
5. **`__e2e.passenger`**: flow 변수 대신 townView가 실제로 앉힌 인물을 돌려줌(플레이 화면이 아니면 null) → SC-032 "아이 차에 탄 모습"을 렌더러 기준으로 관찰.
6. **애니메이션 시간**: three r183부터 `THREE.Clock`이 사용 중단 경고를 내서 `performance.now()` 차이로 계산(꾸밈 전용 실제 시간).
7. **E2E 포인터**: 버튼 판정이 좌표 기반이고 WebKit에는 다중 터치 주입 API가 없어 `#controls`에 `PointerEvent`를 직접 보냄(touch 타입, pointerId 지정).
8. **안전 영역 확인**: 헤드리스 브라우저의 `env(safe-area-inset-*)`는 0이라 "가장자리에서 16px 이상 떨어짐"으로 확인. 실제 노치·홈 바는 기기 점검(T113) 범위.
9. **트럭 탑승객**: 운전석이 막혀 보이지 않아 사용자에게 물음(유리 반투명 / 짐칸 / 지붕 위). 사용자 결정 "지붕 위로 보이게"(2026-10-12).
10. 일시정지 탭(T084), 나머지 생명주기 신호(T086), 소리(T081), 안내 음성은 뒤 태스크라 연결하지 않음.

## 자체 검증 결과

| 태스크 | 명령 | 종료 코드 | 결과 |
|---|---|---|---|
| T030 | `npm test -- tests/unit/controls.test.ts` | 0 | 5 passed |
| T036 | `npm test -- tests/unit/drivingLesson.test.ts` | 0 | 5 passed |
| T042 | `npm test -- tests/unit/content.test.ts` | 0 | 16 passed |
| B3 제안 | `npm test -- tests/unit/loader.test.ts` | 0 | 9 passed |
| T031~T035, T037, T038 | `npm run typecheck` | 0 | |
| T039 | `npm run build` | 0 | 500 kB 청크 경고(기존과 같음) |
| T040 | `npm run test:e2e -- tests/e2e/flow.spec.ts` | 0 | 4 passed(2건 × chromium·webkit) |
| T041 | `npm run test:e2e -- tests/e2e/touch.spec.ts` | 0 | 10 passed(5건 × 2) |
| T042 | 기록 | — | `records/tooling-and-render.md` "O2 모델 렌더링 점검" 15/15 |
| 전체 | `npm test` / `npm run test:e2e` | 0 / 0 | 9 files 84 passed / 22 passed |

## 피드백 반영 이력

- attempt 1: 초기 구현(+ B3 reviewer 비필수 제안 1건)
