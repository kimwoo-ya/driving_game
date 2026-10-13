# Task B8 Implementation Log (US2 나머지 T057~T062)

- 작성: 2026-10-12, 구현자 = 조율자 Claude Code(Opus 5.5) 세션
- 범위: T057 Chicken Guy 동작, T058 마을 신호·횡단보도·정지선·등장 보행자·보행자 시점 카메라·날씨, T059 HUD 시범·겹침 화면, T060 안전 연습 화면 연결, T061 자세 점검, T062 플레이 확인
- 검증 방식: 사용자 결정(00_context.md 승인 기록 "검증 방식 재조정") — US2 덩어리 끝에 검증자 1번 + 리뷰어 1번, 스펙 대조 + 테스트 실행만. B7(T053~T056)은 validator PASS(47ac5fd3…) 뒤 리뷰를 여기 합침

## 변경 파일

| 태스크 | 파일 | 내용 |
|---|---|---|
| T057·T061 | `src/render/characters.ts` | `pedestrianObject()`(Chicken Guy 1.2 m, Idle·Walk 클립만), `setPose`, 클립 갱신 뒤 Head 회전(±60°)·든 손 위치 덮어쓰기. T061에서 들 손 = 인물의 오른손(이 모델은 손 이름이 거울 방향이라 `HandL`), 손을 인물 좌표 키 0.92·옆 1.4배로 |
| T058 | `src/render/townView.ts` | 차 신호(가로, 빨강 네모·노랑 마름모·초록 동그라미)·보행자 신호(세로, 빨강 막대·초록 세모) 색 + 모양, 운전 중 차 신호·안내 중 보행자 신호 1.4배 강조, 보행자 초록 깜빡임(실제 시간 400 ms), 횡단보도 줄, 구간마다 정지선, 등장 보행자, 보행자 시점 카메라(introTicks 동안 차에서 옮겨 감)·주인공이 카드 poses를 durationTicks 동안 차례로·카드 weather(rain/dark) 배경색 |
| T058 | `src/content/scenarios.ts` | 세 상황 `pedestrianView.camera`를 주인공 뒤·위(높이 2.2 m)로 — 처음 값은 카메라가 주인공 머리와 겹침 |
| T058 | `src/content/town.ts` | 보행자 신호 세 개를 길 건너편에서 기다리는 보행자 쪽을 보게(main·cross: x −5·35, heading +π/2 / turn: (107, 47), heading 0) — B7 validator "이후 태스크" 5. 판정에는 안 쓰는 값 |
| T059 | `src/ui/overlays.ts`(신설) | 위반 멈춤(반투명 + 멈춤 그림 + `violation-<kebab>` 그림), 규칙 카드(그림 + 글), 칭찬. 그림 파일이 없으면 기존 `picture()`의 도형 자리표시(plan D4) |
| T059 | `src/ui/hud.ts` | `showDemo(cue)`(연속 실패 뒤 그 단계 버튼 시범) |
| T059 | `src/style.css` | 겹침·카드·칭찬·자리표시 도형 |
| T060 | `src/app/flow.ts` | 조작 익히기 → 연습, `startScenario(…, pickRules(…, isReplay, extraCursor))`, 사건별 화면·입력 반응(events.md 2·3장), 칭찬 120틱 뒤 다음 상황. 사용자 결정(00_context "B8 첫 배포 다시 하기"): practiceMenu(T063) 전까지 다시 시작하면 세 상황을 처음부터(`sequenceDone`, `completedThisRun`은 그대로 두어 추가 규칙 순환 유지) |
| T061 | `records/tooling-and-render.md`, `records/img/t061-chicken-guy-poses.png` | 자세 점검 3/3 |
| T062 | `records/play-check.md`(신설), `records/img/t062-play-check.png` | 자동 브라우저 플레이 확인 8항목 예 |

## 판단 메모(검토 요청)

1. 보행자 시점 카메라·신호 방향은 데이터 값(scenarios.ts·town.ts)을 고쳤음. 판정에 쓰이지 않음(단위 테스트 그대로 통과).
2. 규칙 카드·위반·칭찬 그림은 파일이 없어 자리표시 도형(그림은 T102·T103, 첫 배포 뒤). 카드 글은 함께 나옴.
3. 소리 관련(칭찬 음성, 카드 읽기)은 T081 몫이라 없음.
4. 세 번째 완료 처리(tutorialDone 저장·레이싱 열림)는 T065 몫. 지금은 세 상황 뒤 시작 화면.

## 자체 검증

| 명령 | 종료 코드 | 결과 |
|---|---|---|
| `npm run typecheck` | 0 | 오류 없음 |
| `npm test` | 0 | 14 files, 129 passed |
| `npm run build` | 0 | 성공(500 kB 청크 경고 기존과 같음) |
| `npm run test:e2e` | 0 | 22 passed |
| 자세 점검·플레이 확인(저장소 밖 점검 페이지·스크립트) | 0 | records 두 파일 참고 |

## 피드백 반영 이력

### attempt 2 (task-US2_validation.md 시도 1/2 FAIL 반영)

사용자 결정 2026-10-13(00_context.md 승인 기록 "US2 validator FAIL 질문 2건"): 기다리기 = 브레이크 강조, 날씨 = 하늘색만. 카메라 높이(Q1)는 문서대로라 묻지 않음.

| 지적 | 파일 | 내용 |
|---|---|---|
| 1 (T058·T061) 안내 카메라·카드 가림 | `src/content/scenarios.ts`, `src/style.css` | 카메라를 아이 눈높이 1 m·주인공 오른쪽 어깨 뒤(걷는 방향 뒤 2.2 m, 오른쪽 1.2 m)로, turning-car는 걷는 쪽 + 도는 차 쪽(107, 0.8, 50)을 봄. 카드 겹침을 화면 오른쪽(`justify-items: end`, 글 최대 48vw) |
| 2 (T059) 안전 연습 버튼 강조·시범 | `src/style.css`, `src/ui/hud.ts` | 강조 규칙에 stop·wait → 브레이크, go → 액셀. `showCue`가 같은 cue의 repeat 아닌 hint에서는 시범(`data-demo`)을 지우지 않음 → demoReplay 직후 hint가 시범을 지우지 않음 |
| 3 (T060) 되돌림 화면 전환 | `src/ui/hud.ts`, `src/app/flow.ts`, `src/style.css` | `flashRedirect()`(하늘색 덮개 0.5초 페이드), redirect 때 호출 |
| 4 (T061) 기록 범위 | `records/tooling-and-render.md`, `records/img/t061-card-screens.png` | 실제 A11·A14-A15 카드 화면 3/3 |
| 확인 | `records/play-check.md` | 2026-10-13 추가 확인 5항목 |

| 명령 | 종료 코드 | 결과 |
|---|---|---|
| `npm run typecheck` | 0 | 오류 없음 |
| `npm test` | 0 | 14 files, 129 passed |
