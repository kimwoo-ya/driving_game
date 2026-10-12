# Analysis — 001-kids-driving-safety-game (speckit analyze, 구현 전)

- 작성: 2026-10-12, 조율자 Claude Code(Opus 5.5) 세션 `term_abc41cac-b371-4664-b4aa-3449f16ef095`
- PROJECT_ROOT `/Users/kyw/Documents/git/mine/driving_game`, FEATURE_DIR `specs/001-kids-driving-safety-game`
- 단계: speckit analyze, tasks 작성 직후·구현 전 사전 분석. 게임 소스·package.json 없음(캐릭터 GLB 3·CREDITS.md·SHA256SUMS·리깅 스크립트·.blend만 존재)
- HEAD `2739ec03cb19385b4b0bc4494550a594f976fa01`(사용자 승인 첫 커밋). 수정은 작업 트리에만 있고 커밋하지 않음
- **최종 revision `4a8a3979824b2f2b22e6082f8875e3cdd58854a51cc308e92f1a8d92372d7355`** — 재검증 2 요청값 = 세 검증자의 읽기 전·검사 후 = 조율자 통합 직전 재계산
- 이력: 최초 검토 `6c044bc5…f17e2` → 재검증 1 `8d50a4d5…ed12f` → 재검증 2 `4a8a3979…7355`
- 검토 범위: AGENTS.md, docs/PRD.md, GLOSSARY.md, constitution(빈 양식, 사용자 결정으로 규칙 없음), spec.md, plan.md, research.md, data-model.md, contracts/ 7개, quickstart.md, tasks.md(T001~T123), checklists/requirements.md, _workspace/03_character-rigging.md, src/assets/models/*, scripts/*. 참고 교훈 ivi-agent-guide/mistake.md 3장(읽기만)
- 제외: npm/Vitest/Playwright(package.json 없음), Blender 재검증(증거 파일을 다시 씀), 실제 기기·어린이 관찰(구현 후)

## 진행 판정: **PASSED** (재검증 2, revision `4a8a3979…7355`)

- 세 역할 모두 COMPLETE, 같은 revision, 실제 반대 도구(Codex) 세션, 현재 CRITICAL 0 / WARNING 0 / INFO 0, 미해결 질문 0, 미응답 공유 0.
- 최초 검토(revision `6c044bc5…`)는 고유 CRITICAL 7·WARNING 5·INFO 3으로 BLOCKED였습니다. 사용자 결정 5건(X-04~X-08)과 승인된 수정으로 문서를 고쳤고, 재검증 1에서 수정이 새로 만든 3건(SF-8~SF-10)을 다시 고쳐 재검증 2에서 모두 해소되었습니다(아래 "수정·재검증 이력").
- 이 판정은 구현 전 문서·에셋 분석입니다. npm·브라우저·실제 기기 검사는 구현 단계에서 합니다.

## 실행 세션

| 역할 | 도구·모델 | task / dispatch | handle | 보고서 | 최초 | 재검증 1 | 재검증 2(최종) |
|---|---|---|---|---|---|---|---|
| artifact-reviewer | Codex gpt-6-astra | task_2e92c394c097 / ctx_caf3c85bb6c2 | term_7bd64555-ff4f-4065-b3c4-3b4beb90fb63 | `01_artifact-reviewer_report.md` | COMPLETE · C7 / W4 / I1 | COMPLETE · C3 / W0 / I0 | **COMPLETE · C0 / W0 / I0** |
| code-reviewer | Codex gpt-6-astra | task_a7256fc40397 / ctx_c1df0f445fe0 | term_c4c9b2a2-3174-4af5-b77d-77ab8b8c4e81 | `01_code-reviewer_report.md` | COMPLETE · C3 / W2 / I2 | COMPLETE · C2 / W0 / I0 | **COMPLETE · C0 / W0 / I0** |
| boundary-reviewer | Codex gpt-6-astra | task_bf0ff6aee96c / ctx_f7c9914369a0 | term_9ede193f-c1b1-4c2a-96dc-484817c5fae6 | `01_boundary-reviewer_report.md` | COMPLETE · C7 / W2 / I1 | COMPLETE · C3 / W0 / I0 | **COMPLETE · C0 / W0 / I0** |

Run `run_18857b1c119f`. 판정은 각 Dispatch가 보낸 Orca status로 받았고(최초 `msg_72a01746d609`·`msg_76b7ff124e9c`·`msg_a30ba12d2957`, 재검증 1 `msg_72a98b205f87`·`msg_49dece80e035`·`msg_095f29f4fade`, 재검증 2 `msg_b12382fb1457`·`msg_0b7f4669769d`·`msg_83f9163075ee`), 보고서 머리의 dispatch·handle·revision과 대조했습니다.

## 건수 (최초 검토 기준 — 현재는 세 역할 모두 0)

| 구분 | CRITICAL | WARNING | INFO | 합계 |
|---|---|---|---|---|
| 문서(artifact) | 7 | 4 | 1 | 12 |
| 코드(code, 구현 전) | 3 | 2 | 2 | 7 |
| 경계(boundary) | 7 | 2 | 1 | 10 |
| 역할 합계(중복 포함) | 17 | 8 | 4 | 29 |
| **고유(아래 X-번호)** | **7** | **5** | **3** | **15** |

## 지적 목록 (최초 검토, revision `6c044bc5…`) — 모두 해소됨, 처리는 "수정·재검증 이력"

수정 우선순위: P1 = 구현 착수 전 반드시, P2 = 해당 태스크 착수 전, P3 = 문서 정리.

### CRITICAL

| # | 내용 | 한쪽 원문 | 다른 쪽 원문 | 영향 | 출처 역할 | 결정 | 우선 |
|---|---|---|---|---|---|---|---|
| X-01 | 차량 카탈로그 T009([P], typecheck)가 `SeatDef.pos: Vec3`를 쓰는데 `Vec3`는 T011의 `sim/vehicle.ts` 소속 | `data-model.md:80`, `contracts/modules.md:70`·`:438`·`:463` | `tasks.md:72`, `tasks.md:74` | T009 시점 typecheck 불가. 다른 파일에 중복 선언하면 소속 계약 위반 | A C-001, C C-001, B C-01 | tasks 순서 수정 | P1 |
| X-02 | T068이 progress 내부 함수(체크포인트 통과·복귀 자세)를 직접 시험하지만 계약은 "시험은 stepRace로", stepRace는 T068 선행인 T071 | `contracts/modules.md:269`·`:273` | `tasks.md:175`, `tasks.md:178`·`:179` | 계약과 순서를 함께 지키면 T068 일부 시험을 쓸 수 없음 | A C-003, C C-002, B C-02 | tasks 시험 배정 수정 | P1 |
| X-03 | T016이 두 탭 시험 3건 전부를 요구하지만 첫 건은 T073의 `finishResult` 필요 | `contracts/storage.md:113`~`:117`, `contracts/modules.md:245` | `tasks.md:79`, `tasks.md:180` | T016 시점 계약대로 시험 불가 | A C-002, C C-002, B C-03 | tasks 시험 배정 수정 | P1 |
| X-04 | 여러 탭 기록 악화 0건 요구 ↔ "읽기·쓰기 사이 틈의 덮어쓰기는 받아들임" | `spec.md:416`(FR-083), `spec.md:568`(SC-019) | `data-model.md:798`, `contracts/storage.md:63`, `:117`(순차 시험뿐) | 계약대로 구현해도 SC-019 0건 보장 불가 | A C-004, B C-06(SF-4b), C 공유 반영 | **사용자 결정** | P1 |
| X-05 | 저장 값은 읽혔고 시험 쓰기만 실패할 때: 기본값 ↔ 읽은 값 | `data-model.md:640`·`:642`, `spec.md:535` | `contracts/storage.md:47`·`:80`, `spec.md:412` | 같은 상황에서 레이싱 열림·최고 기록·소리 설정 복원 여부가 갈림 | A C-005, B C-04(SF-3), C 공유 반영 | **사용자 결정** | P1 |
| X-06 | 크레딧은 공개 배포 필수 조건인데 T029가 기반 단계에서 공개 배포, 크레딧은 T094~T096 | `spec.md:221`, `spec.md:427`, `docs/PRD.md:155` | `tasks.md:92`, `tasks.md:245`~`:247`, `plan.md:441` | 정해진 순서대로 하면 크레딧 없이 공개됨 | A C-006, C C-003, B C-07(SF-4a) | **사용자 결정** | P1 |
| X-07 | 복귀 후보 3칸을 나머지 3대가 모두 차지하면 복귀 위치가 없음 | `spec.md:293`, `spec.md:385`(FR-061) | `data-model.md:950`, `contracts/modules.md:257`, `tasks.md:175`·`:179` | "겹치지 않는 자동 복귀" 보장을 완성할 수 없음(폭 12·반지름 1 반례로 후보 0개 확인) | B C-05(SF-5), A C-007, C 공유 반영 | **사용자 결정** | P2 |

### WARNING

| # | 내용 | 한쪽 원문 | 다른 쪽 원문 | 영향 | 출처 | 우선 |
|---|---|---|---|---|---|---|
| X-08 | 태스크당 1~2파일 규칙을 넘는 태스크(기록 파일·에셋 묶음 포함): T003·T005·T022·T042·T113·T115·T117·T118(소스 2 + 기록), T006(GLB 5 + 체크섬), T102·T105(에셋 묶음 + 시험) | `ivi-agent-guide/claude-config/CLAUDE.md:84` | `tasks.md:57`·`:59`·`:60`·`:85`·`:116`·`:255`·`:262`·`:265`·`:280`·`:282`·`:284`·`:285` | 범위대로 하면 상위 규칙 초과. 예외를 둘지 나눌지 문서에 없음 | A W-001 | P2(**사용자 결정**) |
| X-09 | SC-021 "음원 전부 실패 상태로 레이싱 완주"가 조작 익히기 진입(T083)과 무음 상태(T120)로 줄어듦 | `spec.md:570`, `plan.md:391` | `tasks.md:201`, `tasks.md:287`, `tasks.md:290`, `quickstart.md:136`·`:199` | 음원 실패로 뒤 단계가 멈춰도 지정 검사가 통과할 수 있음 | A W-002, C 공유 반영(SF-7) | P2 |
| X-10 | T018이 실제 `TRACK`으로 `'main:1:2'`를 고정 검사, T115 트랙 확정으로 revision이 오르면 실패하는데 갱신 태스크 없음 | `contracts/content-data.md:53`, `contracts/modules.md:241` | `tasks.md:81`, `tasks.md:282`·`:283` | 정상 조정 뒤 시험 실패 | A W-003, C W-002 | P2 |
| X-11 | T112 0건 검사가 "코드 파일만"이라면서 `src/` 전체(Markdown·에셋 포함)를 훑고 `href` 문자열 자체를 금지 | `contracts/overview.md:26`, `contracts/static-paths.md:58`·`:66`, `contracts/assets.md:101` | `tasks.md:279`, `tasks.md:403` | SVG 내부 `<use href="#…">` 같은 정상 그림도 걸림(정규식 예제로 확인). grep 무일치 종료 코드 1도 "종료 0" 규칙과 다름 | C W-001, B W-02 | P2 |
| X-12 | 완주 때 `loadSave(key)`의 `ok:false`를 버려, 더 느린 완주 + 읽기만 실패하면 저장 불가 안내가 빠짐 | `spec.md:413`(FR-080), `plan.md:238` | `contracts/events.md:86`, `tasks.md:184` | 실행당 1회 안내 요구 누락 | B W-01, A W-004(SF-6), C 공유 반영 | P2 |

### INFO

| # | 내용 | 원문 | 출처 |
|---|---|---|---|
| X-13 | 개요 표의 타입 소속 표기(PlaySession을 session.ts, DriveInput을 controls.ts)가 최종 계약(flow.ts, sim/vehicle.ts)과 다름 | `plan.md:96`·`:192`·`:276`, `data-model.md:40` ↔ `contracts/modules.md:74`·`:340`·`:438`·`:457` | A I-001, B I-01 |
| X-14 | T094 "CREDITS.md와 내용 일치"의 비교 범위가 불명확(현재 파일은 캐릭터 3종 제작 기록) | `tasks.md:245` ↔ `src/assets/models/CREDITS.md:3`~`:9`, `contracts/assets.md:120`~`:122` | C I-001 |
| X-15 | "저장소에 커밋이 없다" 문구가 현재 HEAD와 다름 | `plan.md:3`·`:332`, `quickstart.md:91`, `tasks.md:394` | C I-002 |

## 작성자가 지목한 약한 곳의 결론

| 지점 | 결론 |
|---|---|
| D6·D7(자리표시 데이터·타입 골격 선행) ↔ modules.md 12장 | 소속 파일은 계약과 같음(세 역할 일치). 별도 문제는 X-01(Vec3) |
| content.test.ts 23항목 배정 | 1~23 누락·중복 없음. #14는 데이터/GLB 두 부분, #10·#20 선행 맞음, #8·#21·#22·#23 skip → T100·T102·T105·T108 해제(세 역할 일치) |
| T042 Sit·T052 "잠정"·T112 href | T042: 계약 밖 Sit을 강요하지 않음. T052: 검사 범위가 좁혀져 성립. T112: X-11 |
| D3 `data-pressed` | 공개 계약·저장 형식을 바꾸지 않는 UI 내부 관찰 속성, 결함 아님(세 역할 일치) |
| plan 단계 0·quickstart·T006 캐릭터 준비 반영 | 세 문서 모두 캐릭터 3종 보존·차량 5종만 받기. 캐릭터 체크섬 3/3 일치 |

## 역할 간 공유·회신 이력

| 공유 | 원 발견(메시지) | 전달 | 회신(반영) |
|---|---|---|---|
| SF-1 Vec3 순서 + T068 시험 경계 | artifact `msg_be83c842dde3` | boundary `msg_c83fe5ebfa47`, code `msg_e44be36e13ca` | boundary `msg_c4394fd67c83`, code `msg_f180a762c745`·`msg_b9500b25b9c1` |
| SF-2 T016 ↔ finishResult | code `msg_f180a762c745` | artifact `msg_65f139b475f1`, boundary `msg_910d07c22c7c` | artifact `msg_d7c0b380b8c5`, boundary `msg_c4394fd67c83` |
| SF-3 loadSave 시험 쓰기 실패 | boundary `msg_7638cd15dd10` | artifact `msg_c95c0cd3fc4c`, code `msg_4bdfa0fbdca4` | artifact `msg_d7c0b380b8c5`, code `msg_b9500b25b9c1` |
| SF-4a 크레딧 전 배포 / SF-4b 두 탭 0건 | artifact `msg_224de615d1b8` | boundary `msg_d8262646b67b`, code `msg_473fb923e59e` | boundary `msg_6d72619280b8`, code `msg_0ca5d06df422`(4a는 `msg_b9500b25b9c1`에서 독립 발견) |
| SF-5 복귀 3칸 점유 | boundary `msg_6d72619280b8` | artifact `msg_f4bdfa7419e3`, code `msg_99bdccc60ec7` | artifact `msg_3b55483b5389`, code `msg_be44c3b11efe` |
| SF-6 완주 시 읽기 실패 ok | boundary 보고서 W-01(`msg_a30ba12d2957`) | code `msg_4a8d7a683975`, artifact `msg_e3e2c043f066` | code `msg_251d0184fb35`, artifact `msg_72a01746d609`(W-004 추가) |
| SF-7 SC-021 음원 실패 완주 | artifact 보고서 W-002(`msg_2ecfc294439d`) | code `msg_9878a98e0734` | code `msg_6c055f2ff92b` |

| SF-8 재검증 1: 곡선에서 뒤 복귀 후보의 직선거리 < 4r | code `msg_4b9af5cc76aa` | boundary `msg_3fa1bd0920d5`, artifact `msg_44ae79cdfe4d` | boundary `msg_f364f6e3afce`·`msg_6ea79e66062f`, artifact `msg_baae0aab5f80`·`msg_a54ce67844a8`(둘 다 독립 재현) |
| SF-9 재검증 1: data-model.md:525 "저장 불가 → 잠김" 잔존 | boundary `msg_f364f6e3afce` | code `msg_3c3675307a2a`, artifact `msg_9f193412c929` | code `msg_b740476fafda`, artifact `msg_a54ce67844a8` |
| SF-10 재검증 1: T073 시험 문구에 T077 flow 동작 포함 | artifact `msg_baae0aab5f80` | code `msg_3c3675307a2a`, boundary `msg_b75dcdc5ec58` | code `msg_b740476fafda`, boundary `msg_6ea79e66062f` |

- 질문(ask): 2건 — boundary `msg_79eecc0af6d7`, artifact `msg_b54cfa8fed87`("close-review 할까요?", 사용자 결정 대기 중 발생) → 각각 `msg_99b7cce8789e`·`msg_c3aa6ecd4f66`로 "추가 검토 요청(recheck 1)" 답변. boundary escalation `msg_e15c85dc4568`(질문 미응답)도 같은 답변으로 해소.
- boundary가 최초 검토 중 언급한 `DrivingLessonState` 완료 상태 후보는 결함으로 확정하지 않고 T036 "lessonDone 1회 뒤 no-op" 시험으로 확인하도록 보고서에 주석으로 남겼습니다.

## 수정·재검증 이력

사용자 결정(2026-10-12): X-04 요구사항을 현실에 맞춤(짧은 틈 제외), X-05 읽은 값 사용, X-06 공개 배포를 크레딧 뒤로, X-07 복귀 후보 늘림, X-08 파일 수 예외 명시, 수정 1~7 반영 후 재검토. PRD는 바꾸지 않았습니다.

| # | 수정(파일) | 재검증 1 | 재검증 2 |
|---|---|---|---|
| X-01 | T009 [P] 제거·선행 T011, 병렬 예시 정리(tasks) | 해소 | 해소 |
| X-02 | T068은 공개 함수만, 체크포인트 시험 T071(7건)·복귀 시험 T072(tasks) | 해소 | 해소 |
| X-03 | T016 두 탭 2건, 첫 사례 T073, SC-019 = T016·T073(tasks) | 부분(SF-10: T073 문구가 T077 flow 포함) | 해소(T073은 결과값, 미호출은 T077) |
| X-04 | FR-083·SC-019·Edge에 짧은 틈 제외(spec), 한계 문단에 연결(data-model) | 해소 | 해소 |
| X-05 | 4.11 표 두 줄 분리(data-model), 상태 흐름 잠김 목록(spec), T016 시험 1건(tasks) | 부분(SF-9: data-model 4.2 표 잔존) | 해소 |
| X-06 | T029 로컬까지·T093 첫 공개 배포(선행 T007·T029·T096), 의존성·MVP 문구(tasks), 배포 공개 시점·단계 0/1/4·O10(plan), 2.4(quickstart) | 해소 | 해소 |
| X-07 | 복귀 후보 4곳(data-model 7장), #18 간격(content-data), T072 시험(tasks) | 부분(SF-8: 곡선 직선거리) | 해소(뒤 후보 접선 반대 직선 5r, 후보 간 > 4r, 트랙 안 검사) |
| X-08 | 기본값 D8 파일 수 예외(tasks) | 해소 | 해소 |
| X-09 | SC-021 담당(plan), T120 문구(tasks) | 해소 | 해소 |
| X-10 | T018 테스트용 트랙 값(tasks) | 해소 | 해소 |
| X-11 | T112 *.ts·index.html 한정, 링크 생성 패턴, 종료 1 = 통과(tasks) | 해소 | 해소 |
| X-12 | playerFinished 행(events), T077(tasks) | 해소 | 해소 |
| X-13 | PlaySession 소속(plan 트리·표·데이터 흐름), DriveInput 소속(data-model) | 해소 | 해소 |
| X-14 | T094 비교 범위(tasks) | 해소 | 해소 |
| X-15 | 커밋 문구(plan·quickstart·tasks) | 해소 | 해소 |

변경 파일(작업 트리, 커밋 안 함): spec.md, plan.md, data-model.md, contracts/events.md, contracts/content-data.md, quickstart.md, tasks.md. spec.md·data-model.md 줄 번호는 다른 문서의 줄 참조를 깨지 않게 유지했습니다(data-model.md는 642행 뒤 1줄 추가, 그 뒤 줄 번호를 인용하는 피처 문서는 없음).

## 실행한 검사

| 명령 | 종료 | 결과 |
|---|---|---|
| `python3 ivi-agent-guide/scripts/review-snapshot.py "$PROJECT_ROOT" "$FEATURE_DIR"` | 0 | 회차마다 조율자 요청 전·통합 직전과 세 검증자 읽기 전·검사 후가 같음: 최초 `6c044bc5…`, 재검증 1 `8d50a4d5…`, 재검증 2 `4a8a3979…` |
| `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` | 0 | FEATURE_DIR와 research·data-model·contracts·quickstart·tasks 반환(조율자·세 검증자) |
| `(cd src/assets/models && shasum -a 256 -c SHA256SUMS)` | 0 | 캐릭터 3/3 OK(조율자·세 검증자) |
| 검증자별 읽기 전용 Python(GLB JSON 청크, 문서 번호·표 대조, 복귀 후보 반례, href 정규식 예제) | 0 | 각 보고서 "실행 근거" 표 |
| npm typecheck/test/build/test:e2e | 미실행 | package.json·게임 소스 없음(구현 전 분석) |
| Blender `scripts/verify-character-rigs.py` | 미실행 | 증거 파일을 다시 씀. 기존 JSON 증거만 읽음 |

## 다음 단계

1. 세 검증 세션에 close-review → worker_done 확인 → release.
2. 수정된 7개 문서의 커밋 여부는 사용자 결정(임의 커밋 금지). implement는 사용자 요청으로 시작하며, 첫 태스크 묶음의 [승인 필요] 항목(T001 설치, T005 브라우저 설치, T006 차량 GLB 내려받기)은 각각 승인 뒤 실행합니다.
