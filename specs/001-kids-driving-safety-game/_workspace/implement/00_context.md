# Implement Context — 001-kids-driving-safety-game

- 작성: 2026-10-12, 조율자 Claude Code(Opus 5.5) 세션 `term_abc41cac-b371-4664-b4aa-3449f16ef095`
- PROJECT_ROOT `/Users/kyw/Documents/git/mine/driving_game`
- FEATURE_DIR `/Users/kyw/Documents/git/mine/driving_game/specs/001-kids-driving-safety-game`
- 시작 HEAD `e30058a`(analyze 반영 커밋, 사용자 승인). 이후 커밋은 사용자 요청 때만
- 프로젝트 기준: `AGENTS.md`(IVI Java/Spring 규칙 → TypeScript/three.js·npm 치환), `docs/PRD.md`, `GLOSSARY.md`. constitution은 빈 양식(사용자 결정, 규칙 없음)
- 필수 원문: spec.md, plan.md, data-model.md, contracts/(overview·modules·events·storage·assets·content-data·static-paths), research.md, quickstart.md, tasks.md, checklists/requirements.md(16/16 완료)

## 실행 명령 (plan "실행 명령", tasks Path Conventions)

| 용도 | 명령 |
|---|---|
| 타입 검사 | `npm run typecheck` (`tsc --noEmit`, TypeScript 7.0.2) |
| 단위 테스트 | `npm test -- <파일>` (`vitest run`) |
| 빌드 | `npm run build` (`tsc --noEmit && vite build`) |
| 브라우저 테스트 | `npm run test:e2e -- <파일>` (`playwright test`, webServer = build + preview :4173) |
| 모델 체크섬 | `(cd src/assets/models && shasum -a 256 -c SHA256SUMS)` |
| snapshot | `python3 ivi-agent-guide/scripts/review-snapshot.py "$PROJECT_ROOT" "$FEATURE_DIR"` |

## Orca 세션 (Run `run_43739cd2a087`)

| 역할 | 도구 | task / dispatch | handle |
|---|---|---|---|
| validator | Codex | task_1b6723135279 / ctx_4831dedae27b | term_afd8a2fc-574b-4c26-affd-7a09efcd8c4e |
| reviewer | Codex | task_3690285f95db / ctx_dafb46e82e38 | term_f9cb362f-6bbc-44da-ae70-7ab4aab20534 |

## 검증 단위

검증자 요청은 태스크 묶음 단위로 보내고, 보고서에 태스크별 판정을 적습니다. 묶음 안 모든 태스크가 같은 revision에서 PASS·APPROVE여야 체크합니다.

| 묶음 | 태스크 | 상태 |
|---|---|---|
| B1 Setup | T001~T006 (T007은 사용자 작업, T093 전까지만 필요) | **완료** revision `2777fa40…6969d` validator PASS(msg_23b1d2150aed) + reviewer APPROVE(msg_f2abd4490243) → tasks.md 체크 |
| B2 순수 로직·콘텐츠 | T008~T021 (+ T007 사용자 작업 확인) | revision `bf0691e9…438a1` validator FAIL(T016 공유 기본값, msg_0a46958e82ba) → 수정 → revision `44a8ae51…8b826` validator PASS(msg_d4d395d615a5) + reviewer APPROVE with comments(msg_44817d2ce995, 비필수 제안 2건은 B3에 반영) → **완료**, tasks.md 체크 |
| B3 로더·렌더러·흐름·배포 파일 | T022~T029 (+ B2 비필수 제안 2건) | revision `6e692487…3684` validator 요청(msg_e4f6204e2dc1) → 질문 msg_b78bc32cbd0b(진행률 해석, 답: 바이트 기준으로 수정) → **FAIL**(msg_145744c4416d): T022 진행률만 FAIL → 수정(attempt 2) → revision `c9e9bbe7…b196d` validator PASS(msg_c7eb7328f47b) + reviewer APPROVE with comments(msg_76a0c63f0858, 비필수 1건: loader.test.ts:72 소리 목록 고정 → B4에 반영) → **완료**, tasks.md 체크 |
| B4 US1 선택·조작·조작 익히기 | T030~T042 (+ B3 비필수 제안 1건) | 구현 완료(attempt 1, 로그 task-B4_impl.md) → revision `ab1987de…03447` Codex validator 요청(msg_5d0d96eb3acd) → **Codex 두 세션 사용 한도로 미수신(BLOCKED)** → 사용자 결정으로 이번 묶음만 Claude 에이전트 검증 → validator 에이전트 시작 후 사용자 요청(일시중지·새 세션)으로 중단 → 새 세션에서 같은 revision으로 Claude validator 재시작 → PASS + 질문 Q1(조작 익히기 앞 단계 후진 탭) → 사용자 답 "지금처럼 무시 + 문서에 적기", contracts/modules.md 4.3 "후진 탭" 행 추가 → revision `bc724ea7…39a0` 같은 validator 재확인 PASS(task-B4_validation.md) + Claude reviewer APPROVE with comments(task-B4_review.md, 비필수 3건: ① drivingLesson.test.ts에 앞 단계 정지 중 후진 탭 1회·관성 정지 브레이크 미통과 분기 고정 → B5에 반영 권장 ② controls.ts 사각형 재측정을 offset* 기준으로 ③ style.css #controls[hidden] 중복 규칙) → **완료**, tasks.md 체크. 참고: reviewer가 변이 시험 중 drivingLesson.ts:40을 약 1분간 실수로 바꿨다가 되돌림 — 리더가 40행 원문 일치·snapshot `bc724ea7…` 재계산 일치 확인 |
| B5 US2 순수 함수 | T043~T047 (+ B4 비필수 제안 1번) | 구현 완료(attempt 1, 로그 task-B5_impl.md) → revision `f63003df…3e5a` Claude validator PASS(task-B5_validation.md; 이후 태스크 질문 2건: T053 crossing-check 신호 구성, T054 turning-car 보행자 출발 시점) + Claude reviewer APPROVE with comments(task-B5_review.md, 비필수 5건: ① townActors·collision 테스트 다섯 곳 고정 → B6에 반영 권장 ② townActors 가독성(`nv ?? s.light`, 변수 이름 p 겹침, 신호 순서 주석) ③ T052에서 modules.md에 새 상수 4개 ④ T055 후보: 신호 ID 종류 검사 ⑤ 테스트의 60 → TICK_HZ) → **완료**, tasks.md 체크 |
| B6 US2 연습 엔진·문서 맞춤 | T048~T052 (+ B5 비필수 제안 1·2·3·5) | 구현 완료(attempt 1, 로그 task-B6_impl.md) → revision `7b793710…7267` Claude validator PASS(task-B6_validation.md) + Claude reviewer APPROVE with comments(task-B6_review.md, 비필수 7건: ① 시험 고정 S16·S3·S17·S18·J1·S9(+S11·J13 선택) ② scenario.ts next()의 !viewDone 가드 삭제 ③ 다음 구간 분기 atSegmentStart 재사용 ④ defOf로 SCENARIOS.find 한 곳 ⑤ judge 횡단보도 줄 주석 ⑥ data-model.md Open Issues 1 문구를 T053·T054 사용자 결정대로 ⑦ 참고: 데이터로 닿지 않던 코드는 T054·T056에서 확인) → B7에 반영. **완료**, tasks.md 체크 |
| B7 US2 연습 데이터·시험 | T053~T056 (+ B6 비필수 제안 1~6) | 구현 완료(attempt 1, 로그 task-B7_impl.md) → revision `0fd4581b…ce8b` Claude validator **FAIL**(시도 1/2, task-B7_validation.md): T053 FAIL(멈춘 뒤 살짝 움직이기를 반복하면 보행자 신호가 깜빡여 보행자가 끝내 건너지 않고 wait(pedestriansClear)가 끝나지 않음, 무작위 400회 중 36회) / T054 FAIL 두 가지(① 스펙 "회전 전 멈춤"인데 회전 뒤 횡단보도 앞에서만 인정 ② 회전 대신 직진 때 맞은편 보도 진입 위반, 400회 중 146회 — FR-034는 실패 아님) / T055·T056·B6 제안 1~6 PASS. **사용자 확인 질문 3건**(보고서 "미해결 질문"): 회전 상황 멈출 곳, 직진 처리, crossing-check 막힘 해결 방식. → 사용자 답(모두 권장안, 승인 기록 "B7 validator FAIL 질문 3건") → attempt 2 수정(townActors 깜빡임 조건, turning-car 정지 구역 40~, 네거리·북서 모퉁이 비움, 재현 시험 4건; 로그 task-B7_impl.md attempt 2) → revision `47ac5fd3…95db` 새 Claude validator(시도 2/2) **PASS**(T053~T056·B6 제안 1~6 모두 PASS, task-B7_validation.md 맨 위) → 사용자 결정(검증 방식 재조정)으로 B7 리뷰는 US2 묶음 리뷰에 합침, 체크도 그때 |
| US2 덩어리(B7 + B8) | T053~T062 | 사용자 결정(검증 방식 재조정)으로 US2 덩어리 검증 1번: revision `613a0df6…75f3` Claude validator(가벼운 검증) **FAIL**(시도 1/2, task-US2_validation.md: T058 안내 카메라 문서와 다름·주인공 가림, T059 안전 연습 버튼 강조 없음·시범 지워짐, T060 되돌림 화면 전환 없음, T061 실제 카드 화면 미확인) → 사용자 결정(US2 validator FAIL 질문 2건) → attempt 2(task-B8_impl.md) → revision `d4947e6c…8567` 같은 validator **PASS**(시도 2/2) → 같은 revision Claude reviewer **APPROVE with comments**(task-US2_review.md, 비필수 3건: ① townView 경로 길이 계산을 scenario.ts `pathLength`로 ② 시범 2초 뒤 강조 깜빡임 이어지게 style.css:73 한 줄 → 크레딧 묶음에 반영 ③ scenario.test.ts:309 종료 조건 주석) → **완료**, T053~T062 체크 |
| US8 덩어리(크레딧) | T094~T096 (+ US2 reviewer 제안 ② style.css 한 줄) | 구현(task-US8_impl.md) → revision `e9de5df4…5540` Claude validator(가벼운 검증) PASS(조건: practiceMenu 링크 검사를 남길 곳) → tasks.md T063에 남은 검사 한 줄 → revision `b1cce070…6494` 같은 validator 재확인 PASS → 같은 revision Claude reviewer **APPROVE with comments**(task-US8_review.md, 비필수 3건: flow.ts:104-105 if 모양, credits.spec.ts:21 `changes!`, screens.ts 다음 버튼도 도우미로) → **완료**, T094~T096 체크 |

## 승인 기록

- 2026-10-12 사용자 승인: T001(npm 설치), T005(Playwright 브라우저 설치), T006(차량 GLB 내려받기)
- 2026-10-12 사용자 결정(T042): 트럭은 운전석이 막혀 탑승객이 안 보임 → 선택지(유리 반투명 / 짐칸 / 지붕 위) 중 "지붕 위로 보이게"
- 2026-10-12 사용자 결정(B4 검증): Codex validator·reviewer 두 세션이 모두 사용 한도("try again at Oct 19th, 2026 10:35 AM")에 걸려 B4 요청을 받지 못함. 선택지(gpt-6-luna 전환 / 크레딧 추가 / 보류)를 물었고 사용자가 "이번엔 예외적으로 그럼 클로드 에이전트로 검증해"라고 답함 → **B4에 한해** 반대 도구 대신 Claude Code 서브에이전트(spec-implement-validator, spec-implement-reviewer)로 같은 revision 검증. Codex 두 세션은 한도 안내 화면에서 멈춘 채 그대로 둠(닫지 않음)
- 2026-10-12 사용자 결정(B4 validator Q1): 조작 익히기 앞 단계(조향·액셀·브레이크)에서 멈춘 채 후진 탭 → 지금처럼 무시하고 계약에 적기("지금처럼 무시 + 문서에 적기"). contracts/modules.md 4.3 표에 "후진 탭" 행 추가, 코드 변경 없음 → 새 revision으로 같은 validator 에이전트 재확인
- 2026-10-12 사용자 결정(B5 이후 검증 방식): 선택지(Claude 에이전트 계속 / Codex 복구 후 일괄 / 크레딧 추가 / gpt-6-luna 전환) 중 "Codex 복구 전까지 Claude 에이전트" → Codex 한도 해제(2026-10-19 10:35) 전까지 validator·reviewer를 Claude Code 서브에이전트로 실행, 이후 Codex 세션으로 복귀. 요청문에 "변이 시험·임시 수정은 저장소 밖 복사본에서만, 저장소 안 파일은 보고서 외 쓰기 금지"를 명시(B4 reviewer 사고 재발 방지)
- 2026-10-12 사용자 결정(T043 신호 모습): 안전 연습 운전 장면의 신호도 data-model.md 4.12 순서대로 — 차 신호 초록 → 노랑 → 빨강 → 초록("보여 줌"), 보행자 신호 빨강 → 초록 → 깜빡임 → 빨강("깜빡임 넣음"). 바뀌는 때는 시간 주기가 아니라 차 위치(frontS)·멈춘 시간(stoppedTicks)·보행자 상태로만(FR-040). tasks.md T043 문구 "redAtS를 지나면 빨강"은 노랑을 거침
- 2026-10-12 사용자 결정(T049 정지선 설명): data-model.md ViolationKind 표의 overStopLine "정지선을 넘은 채 speed === 0"은 modules.md 4.4 "정지선 안으로 실제로 들어가는 틱이 없음"과 함께 성립할 수 없음 → "상황에 따라 나눔" 선택: 정지선을 넘으려는 후보 틱에 wait 단계면 earlyStart, stop 단계·차 신호 노랑/빨강·이 구간 시도에서 한 번도 멈추지 않았으면 ranRed, 그 밖은 overStopLine. data-model.md 해당 행을 이 기준으로 고침
- 2026-10-12 사용자 결정(첫 공개 배포 범위): "일단 배포 가능한 정도까지만" 요청 → 선택지(안전 연습까지 완성 후 / 지금 상태 + 크레딧 / 원래 계획 전부) 중 "안전 연습까지 완성 후 배포". 순서: Phase 4 남은 T053~T062 → US8 크레딧 T094~T096(원래 계획보다 앞당김, flow.ts·screens.ts 순서 주의) → T093 첫 공개 배포(커밋·main 푸시는 그때 다시 승인). US3~US7·콘텐츠·마무리 점검은 배포 뒤
- 2026-10-12 사용자 결정(T053·T054, B5 validator 이후 질문 2건): ① crossing-check 횡단보도 = "차·보행자 신호등 있음"(보행자가 다 건너고 차 신호도 초록이어야 출발) → 구간 단계를 stop → wait(pedestriansClear) → wait(vehicleGreen) → go로 두어 데이터만으로 표현(엔진 변경 없음), 보행자 출발 playerStopped. ② turning-car 보행자 출발 = "아이 차가 회전 전에 멈춘 뒤"(playerStopped, 회전 방향 보행자 신호는 초록 고정)
- 2026-10-12 사용자 결정(B7 validator FAIL 질문 3건, 모두 권장안): Q1 turning-car 멈출 곳 = "돌기 전~횡단보도 앞 다 인정"(정지 구역을 회전 전 접근 구간까지 넓힘, 스펙 "회전 전에 멈춤"과 맞음) / Q2 회전 대신 직진 = "길을 이어 늘 안내로 처리"(교차로 북쪽으로 도로를 이어 네거리로, 직진은 방향 안내 → leftPath 되돌림) / Q3 crossing-check 막힘 = "보행자가 출발할 때까지 신호 유지"(아직 건너기 시작하지 않은 보행자가 있으면 보행자 신호를 깜빡이지 않음, data-model 4.12 변경. "보행자가 다 건너고 차 신호도 초록이어야 출발"은 그대로, signal-wait에도 같은 규칙)
- 2026-10-12 사용자 결정(B8 첫 배포 다시 하기): 같은 실행에서 세 연습을 마친 뒤 '시작'을 다시 누르면 practiceMenu(T063)가 없어 시작 화면으로 돌아오는 문제 → 선택지(세 연습을 처음부터 다시 / T063 연습 고르기 화면을 첫 배포에 넣음 / 그대로) 중 "세 연습을 처음부터 다시"(권장). T063·T065 전까지 임시로 flow.ts에서 다시 시작하면 순서대로 세 상황(이번 실행 완료 기록 completedThisRun은 그대로 두어 추가 규칙 순환 유지)
- 2026-10-12 사용자 결정(검증 방식 재조정, 사용자 지적 "구현→검증 루프 단위가 너무 짧음", "Astra·xhigh라 한도 초과"): ① 검증 단위 = "기능 덩어리마다"(사용자 이야기 단위: 남은 첫 배포 범위는 US2 안전 연습 나머지 T057~T062 → 끝나면 US2 묶음 검증자 1번 + 리뷰어 1번(B7 리뷰도 여기 합침, T053~T056 체크도 그때), 그다음 US8 크레딧 T094~T096 검증·리뷰 1번). 그 사이에는 리더가 프로젝트 테스트만 돌리며 이어서 구현 ② 검증 깊이 = "스펙 대조 + 테스트 실행만": 검증자는 문서·코드 대조와 typecheck·단위·build·E2E, 일부러 오류 넣기(변이)·무작위 대량 주행은 의심 가는 곳이 있을 때만. 리더도 보내기 전 같은 탐색 시험을 겹쳐 하지 않음 ③ Codex 한도 해제(2026-10-19) 뒤 검증·리뷰 세션 = Sol 모델 + 사고량 high, 세션을 띄울 때 옵션으로만(전역 `~/.codex/config.toml`의 gpt-6-astra·xhigh는 사용자 설정이라 그대로). 이어서 사용자 지시("해당 세팅은 ~/Documents/git/ivi/co/ivi-agent-guide에 고치는게 맞아, update-guide.sh를 돌려서 수정") → 범위 질문에 "Codex 검증 모델·사고량"만, 모델 "gpt-6.1-sol" 선택 → 공용 원본 `orca-cross-review.md` 3행·50행에 `--model gpt-6.1-sol --effort high` 반영(Claude 검증 세션은 사용자 설정 그대로), 원본 tests 11개 OK, 프로젝트 루트에서 `update-guide.sh` 실행(종료 0, 배포 파일 변경 없음 — 이 문서는 심볼릭 링크로 바로 보임). 검증 단위·깊이(①②)는 이 프로젝트 기록에만 둠
- 2026-10-13 사용자 결정(US2 validator FAIL 질문 2건, task-US2_validation.md Q2·Q3): Q2 기다리기 단계 재안내·시범 = "브레이크 버튼 강조"(권장안 아님 — 멈춘 채 기다리기를 브레이크로 보여 줌) / Q3 날씨 표현 = "하늘색만으로 배포"(권장, T101·T110에서 판단). Q1 안내 카메라 높이는 문서(data-model.md:225 아이 눈높이, plan.md:232 어깨 뒤)대로라 묻지 않고 되돌림
- 2026-10-13 사용자 승인(T093 첫 공개 배포): 선택지(커밋·푸시하고 배포 / 커밋만 / 보류) 중 "커밋·푸시하고 배포" — 구현 결과를 main 커밋 하나로(AI 표기 없음) → origin/main 첫 푸시 → 배포 확인 → device-check.md·마지막 기록을 커밋 하나로 한 번 더 푸시
- T007(GitHub Pages 켜기): 2026-10-12 처음 `gh api repos/kimwoo-ya/driving_game/pages` → 404. 같은 날 사용자가 Source를 GitHub Actions로 켬 → `gh api … --jq .build_type` = `workflow`, html_url `https://kimwoo-ya.github.io/driving_game/`. 검증 통과(tasks.md 체크는 검토 고정 구간이 끝난 뒤)

## 기존 사용자 변경

- implement 시작 시 작업 트리 깨끗함(`e30058a`). `modeling/`, `ivi-agent-guide/`, 캐릭터 GLB 3개는 수정하지 않음
