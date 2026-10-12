# Boundary Consistency Report — 모듈 경계·상태 전이·외부 계약

- run: `run_18857b1c119f`
- task / dispatch: `task_bf0ff6aee96c` / `ctx_f7c9914369a0`
- 실제 도구 / 세션 handle: **Codex** / `term_9ede193f-c1b1-4c2a-96dc-484817c5fae6`
- 조율자 handle: `term_abc41cac-b371-4664-b4aa-3449f16ef095`
- PROJECT_ROOT: `/Users/kyw/Documents/git/mine/driving_game`
- FEATURE_DIR: `/Users/kyw/Documents/git/mine/driving_game/specs/001-kids-driving-safety-game`
- 단계 / 검토 태스크: **speckit analyze, 구현 전·tasks 작성 직후 / T001~T123 전체와 근거 원문**
- revision 요청값: `4a8a3979824b2f2b22e6082f8875e3cdd58854a51cc308e92f1a8d92372d7355`
- revision 읽기 전: `4a8a3979824b2f2b22e6082f8875e3cdd58854a51cc308e92f1a8d92372d7355`
- revision 검사 후: `4a8a3979824b2f2b22e6082f8875e3cdd58854a51cc308e92f1a8d92372d7355`
- HEAD: `2739ec03`(요청에서 전달된 값). 판정 고정에는 HEAD가 아니라 위 snapshot SHA-256을 사용했습니다.
- 검증 상태: **COMPLETE** — 필수 원문과 현재 모델 파일을 확인한 구현 전 분석 완료이며, 게임 구현·실행 테스트의 통과 판정이 아닙니다.
- 역할 판정(재검증 2): **CRITICAL 0건 / WARNING 0건 / INFO 0건**. 이전 10건은 모두 문서상 해소했습니다. 현재 검토 범위에서 추가 불일치를 발견하지 않았습니다.
- 원문 및 코드 근거: 아래 경계 비교표·각 발견에 양쪽 `파일:라인`을 기록했습니다. `spec.md`, `plan.md`, `data-model.md`, `tasks.md`, `contracts/*`는 FEATURE_DIR 기준이며 나머지는 PROJECT_ROOT 기준입니다.
- 실행한 검사 / 종료 코드 / 결과: 아래 「실행 근거」 표. npm·Vitest·Playwright는 **package.json과 게임 소스가 없어 실행하지 않았습니다**. Blender 검증 스크립트는 증거 파일을 다시 쓰므로 요청대로 실행하지 않았습니다.
- 미해결 질문: **없음**. 문서가 다른 부분은 어느 쪽이 옳은지 선택하지 않고 양쪽을 보존했습니다. 변경 결정·구현은 조율자의 후속 범위입니다.
- 미해결 지적: **없음**. SF-8·SF-9·SF-10과 이전 지적별 처리 결과를 재검증 2에 기록했습니다. 이전 판정은 과거 이력으로 보존하며 현재 건수에 합산하지 않습니다.
- 수정 범위: **이 보고서 하나만 작성**. 소스·명세·PRD·가이드·리깅 증거·다른 보고서·analysis.md는 수정하지 않았습니다.

## 재검증 2 — 2026-10-12, 현재 판정

요청 `msg_482b35d5c8c8`의 revision `4a8a3979824b2f2b22e6082f8875e3cdd58854a51cc308e92f1a8d92372d7355`를 읽기 전·검사 후에 확인했습니다. 같은 Codex 세션에서 data-model·content-data·tasks의 변경 부분과 기존 모듈·이벤트·저장 계약을 다시 대조했습니다. **COMPLETE / CRITICAL 0·WARNING 0·INFO 0**입니다. 이는 구현 전 설계·태스크 경계 검토의 판정이며 아직 없는 게임 코드의 실행 통과를 의미하지 않습니다.

| 남았던 지적·공유 | 처리 | 현재 양쪽 근거 |
|---|---|---|
| C-03 / SF-10 — 완주 함수와 호출자 시험 경계 | **해소** | T073(`tasks.md:181`)은 `finishResult` 결과인 isNewBest=false·best=30000까지만 검사하고 저장을 부르지 않는 호출자 동작은 T077(`tasks.md:185`)로 구분했습니다. 생산자의 공개 함수 계약(`contracts/modules.md:245`)과 소비자 조건(`contracts/events.md:86`)이 연결되며, T073에서 아직 없는 flow 연결을 시험하라는 요구가 사라졌습니다. |
| C-04 / SF-9 — 저장 불가라는 잠금 조건 잔존 | **해소** | `data-model.md:525`에서 “저장 불가”를 제거하고 읽기는 됐고 시험 쓰기만 실패하면 읽은 값을 따르도록 명시했습니다. `data-model.md:643`, `spec.md:535`, `contracts/storage.md:80`, T016(`tasks.md:80`)과 같습니다. |
| C-05 / SF-8 — 굽은 중심선에서 복귀 후보 간격 | **해소** | `data-model.md:951`은 뒤 후보를 중심선을 따라가는 대신 체크포인트의 접선 반대 방향 **직선 5r**로 정했습니다. `contracts/content-data.md:109`는 width/3>4r과 각 뒤 후보가 트랙 폭 안에 있음을 검사합니다. T072(`tasks.md:180`)에는 곡선 체크포인트에서도 차 한 대가 두 후보를 동시에 막지 못하는 검사와 기존 진행도 증가 없음 검사가 있습니다. |

복귀 규칙의 해소 근거: 체크포인트를 원점, 접선을 한 축으로 두면 후보는 `(0,0),(-width/3,0),(width/3,0),(0,-5r)`입니다. width/3>4r이면 모든 후보 간 직선거리가 4r보다 큽니다. 반지름 r인 다른 차량이 후보를 막는 범위의 반지름은 2r이므로, 삼각부등식에 따라 한 대가 두 후보를 동시에 막을 수 없습니다. 후보 4개와 다른 차량 3대여서 최소 한 곳이 남습니다. 뒤 후보가 도로 밖인 배치는 콘텐츠 검사로 막으며, 이 조건은 실제 트랙 데이터가 생기면 구현된 검사로 확인해야 합니다.

이번 수정은 함수 시그니처·이벤트 payload·저장 JSON·에셋 경로를 바꾸지 않았습니다. 이전 재검증에서 해소한 C-01·C-02·C-06·C-07·W-01·W-02·I-01의 해소 상태를 유지하고, 새 태스크·선행 순환이나 새 경계 불일치는 발견하지 않았습니다. 최초부터 남은 지적은 0건입니다.

실행 근거:

| 검사 | 종료 코드 | 결과 |
|---|---:|---|
| 기존 snapshot 계산 명령 — 읽기 전·검사 후 | 0 | 둘 다 `4a8a3979824b2f2b22e6082f8875e3cdd58854a51cc308e92f1a8d92372d7355`로 일치했습니다. |
| `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` | 0 | 요청 피처와 필수 설계 문서를 반환했습니다. |
| `(cd src/assets/models && shasum -a 256 -c SHA256SUMS)` | 0 | 캐릭터 GLB 3/3 OK입니다. |
| 읽기 전용 `python3 - <<'PY'` — 새 복귀 공식·문구·태스크 검사 | 0 | r=1, width=12.03에서 최소 후보 직선거리 4.01>4r, 이전 반례의 차량 배치에 뒤 후보가 비어 있음을 확인했습니다. 변경 세 항목의 원문 조건과 태스크 ID 123/123도 확인했습니다. 일반적인 간격 보장은 위 기하학적 근거로 확인했으며 게임 실행 시험이 아닙니다. |
| npm·Vitest·Playwright·Blender·실제 기기 시험 | 미실행 | 게임 manifest·소스가 없고, Blender 증거 덮어쓰기는 금지되어 있습니다. 구현 뒤 검사가 필요합니다. |

재검증 수신 status는 `msg_359a013b28b9`이며 요청 Delivery는 처리·ack했습니다. 검토 질문 `msg_79eecc0af6d7`은 앞선 재검증 답변으로 해결되었고, 현재 미처리 공유 발견·검토 질문은 없습니다. 최종 판정 status `msg_83f9163075ee`를 제출했으며, 조율자의 수락·close-review `msg_d5183987447e`를 받았습니다. 마지막 수신함 확인 뒤 worker_done을 한 번 보내 세션 작업을 마칩니다.

## 재검증 1 — 2026-10-12, 이전 판정 이력

이 절의 요청·읽기 전·검사 후 revision은 모두 `8d50a4d5195b805096bf98f9293d9d4de42881c485a61f215812ecfba6bed12f`였습니다. 당시 판정은 CRITICAL 3·WARNING 0·INFO 0이며 현재 판정으로 사용하지 않습니다.

요청 `msg_51e29bff0837`에 따라 변경된 7개 파일의 diff와 해당 원문, 바뀌지 않은 계약의 반대편을 함께 읽었습니다. 당시 읽기 전·검사 후 값은 이 절에 적은 이전 revision과 같았습니다. 질문 `msg_79eecc0af6d7`에는 재검증 요청으로 답변이 도착하여 처리했으며 종료 요청은 아니었습니다.

### 이전 지적별 처리 결과

| 이전 지적 | 판정 | 현재 원문과 확인 내용 |
|---|---|---|
| C-01 타입 생성 순서 | 해소 | `tasks.md:73`의 T009가 T011을 명시적 선행으로 삼고 import type을 요구합니다. `contracts/modules.md:438`의 소속을 유지하여 T011→T009→T010 순서로 실행할 수 있습니다. |
| C-02 progress 내부 함수 시험 경계 | 해소 | `tasks.md:176`의 T068은 공개 함수만 검사하고 내부 체크포인트·복귀는 T071·T072(`tasks.md:179`, `tasks.md:180`)의 stepRace 검사로 옮겼습니다. `contracts/modules.md:273`과 맞습니다. |
| C-03 저장 시험 선행 함수 | **부분 해소** | T016에서 finishResult 사례를 뺐지만(`tasks.md:80`), 옮긴 T073(`tasks.md:181`)의 시험 문구에 여전히 **flow가 commitSave를 부르지 않음**이 포함됩니다. 그 flow의 완주 연결은 T077(`tasks.md:185`)에서 생깁니다. finishResult 반환값 검사는 가능하지만 호출자 동작까지 T073에서 검사할 수는 없습니다. SF-10과 같은 발견입니다. |
| C-04 저장 읽기 성공·시험 쓰기 실패 | **부분 해소** | `spec.md:535`, `data-model.md:643`, `contracts/storage.md:80`, T016(`tasks.md:80`)은 읽은 값 유지로 맞췄습니다. 그러나 `data-model.md:525` 레이싱 잠금 표에는 **저장 불가 → 잠김**이 남아 같은 문서의 적용값 설명과 다릅니다. 저장 가능 여부만으로 잠그는 것으로 읽히지 않도록 이전 열거를 제거해야 합니다. SF-9에 해당합니다. |
| C-05 복귀 후보 소진 | **부분 해소** | `data-model.md:951`은 후보를 4개로 늘렸으나, 뒤 후보를 **중심선을 따라** 4r 뒤에 놓습니다. 같은 행은 후보끼리 실제 거리 ≥4r을 주장하지만 `contracts/content-data.md:109`는 width/3만 검사합니다. 굽은 경로에서는 뒤 후보의 직선거리가 4r보다 짧아 차 한 대가 둘을 막을 수 있습니다. 아래 반례와 SF-8을 참조하십시오. |
| C-06 두 탭 동시 쓰기 보장 | 해소 | 사용자 결정이 `spec.md:263`, `spec.md:416`, `spec.md:568`, `data-model.md:799`에 반영되어 저장 read/write 사이 짧은 틈을 제외합니다. `contracts/storage.md:63`의 한계와 같아졌습니다. |
| C-07 크레딧 전 공개 배포 | 해소 | T029는 로컬 워크플로 준비만, 첫 푸시는 T096 뒤의 T093으로 이동했습니다(`tasks.md:93`, `tasks.md:234`, `tasks.md:307`). `plan.md:333`, `quickstart.md:91`도 맞췄습니다. 이후 번호의 태스크를 명시적 선행으로 지정했으므로 순환 의존은 아닙니다. |
| W-01 완주 시 loadSave.ok 누락 | 해소 | `contracts/events.md:86`과 T077(`tasks.md:185`)이 ok=false를 별도로 처리하고 쓰기 실패 안내와 합쳐 실행당 1회로 정합니다. 이번 판정은 문서상 오류 처리 연결의 해소이며 실행 검증은 아닙니다. |
| W-02 href 검색 범위 | 해소 | T112(`tasks.md:280`)가 *.ts·index.html만 검사하여 SVG·Markdown을 제외합니다. href 문자열 전체 대신 링크 생성 코드와 DOM a[href] 검사를 나누고 grep 무일치 종료 1을 통과로 명시했습니다. |
| I-01 타입 소속 설명 | 해소 | `plan.md:95`, `plan.md:191`, `plan.md:276`, `plan.md:295`와 `data-model.md:40`이 최종 `contracts/modules.md:438`, `contracts/modules.md:457`의 소속과 맞습니다. |

### C-05 반례 — 폭 검사만으로 네 번째 후보와의 간격은 보장되지 않습니다

차체 반지름 r=1, 트랙 폭=12로 두면 새 콘텐츠 검사 `width/3 ≥ 4r`를 통과합니다. 체크포인트 P=(0,0), 직전 중심선 꼭짓점 Q=(0,-2), 그 전 꼭짓점 R=(1.2,-3.6)으로 두면 중심선을 따라 P→Q→R의 길이는 2+2=4입니다. 따라서 네 후보는 `(0,0), (-4,0), (4,0), (1.2,-3.6)`입니다.

P와 R의 직선거리는 약 **3.794733**으로 4보다 작습니다. 다른 차 세 대를 `(.6,-1.8), (-4,0), (4,0)`에 두면 첫 차가 P·R을 모두 막고, 나머지 둘이 좌·우를 막습니다. 다른 세 차끼리는 겹치지 않으며, 네 후보 모두 다른 차와 겹칩니다. 읽기 전용 Python에서 실제 거리와 네 후보의 차단 여부를 assert로 확인했습니다. 이는 정의된 `Vec2[]` 중심선 형태에서 성립하는 문서 계산의 반례이며 게임 실행 테스트가 아닙니다.

양쪽 근거는 `data-model.md:951`의 후보 생성·빈 후보 보장과 `contracts/content-data.md:109`의 검사 조건, `spec.md:385`의 겹치지 않는 복귀 요구입니다. T072(`tasks.md:180`)가 새로 검사하는 **옆 3칸에 각각 한 대**의 경우만으로는 이 반례가 잡히지 않습니다.

조율자가 공유한 다음 수정안(아직 이번 revision에 반영되지 않음)은 뒤 후보를 체크포인트 접선의 반대 방향 **직선 5r** 지점으로 정하고 후보 간 실제 거리를 **4r 초과**로 검사하는 것입니다. 이 경우 하나의 반지름 r 차량이 두 후보를 함께 막을 수 없으므로 4후보·3차량 논리가 성립합니다. 뒤 후보가 트랙 안에 있는지도 검사하겠다는 계획은 적절하며, 기존 진행도 증가 없음 검사도 유지해야 합니다. 제안에 동의하는 것과 실제 수정본의 통과 판정은 구분합니다.

### 추가 변경과 실행 근거

- T018의 트랙 키는 테스트용 값으로 검사하게 바뀌어 뒤의 TRACK 조정과 충돌하지 않습니다(`tasks.md:82`).
- T094는 캐릭터 3종의 출처 사실과 문구 비교 범위를 구분하여 원본 제작 기록을 임의로 고치지 않아도 됩니다(`tasks.md:246` ↔ `src/assets/models/CREDITS.md:7`, `contracts/assets.md:120`).
- 소리 실패의 끝까지 진행 검사는 `plan.md:392`와 T120(`tasks.md:288`)에 무음·음원 차단 각각 완주로 맞춰졌습니다.
- prerequisites 재실행 **종료 0**, 캐릭터 체크섬 **3/3 OK·종료 0**, 전체 태스크 **123개 고유·순서 유지**, 위 굽은 중심선 반례의 읽기 전용 Python **종료 0**을 확인했습니다.
- npm·Vitest·Playwright는 package.json·게임 코드가 없어 계속 **미실행**입니다. Blender 재검증·파일 생성·다운로드도 하지 않았습니다.
- 재검증 시작 status `msg_f09569d5a842`, 자체 잔여 발견 status `msg_f364f6e3afce`, 공유 수신 SF-8 `msg_3fa1bd0920d5`·SF-9/10 `msg_b75dcdc5ec58`을 처리했습니다. SF-8·SF-10은 원문과 대조해 보고서에 반영하고 같은 Dispatch로 회신했습니다.

## 최초 검토 이력 — 이전 revision 전용

이 아래는 `6c044bc5e04ac429b6e8aca7cc96f965e33e934c79baf0ef9c05b669390f17e2`에서 확인한 최초 검토의 원문·근거입니다. 최초 판정은 CRITICAL 7·WARNING 2·INFO 1이었으며 현재 판정으로 사용하지 않습니다. 아래 파일 라인은 최초 revision 기준입니다.

## 적용 기준과 읽은 범위

먼저 `AGENTS.md`를 읽고 역할 파일을 적용했습니다. 이 프로젝트에는 서버·REST·DB가 없으므로 Controller↔Service↔Repository는 모듈 함수·타입·이벤트 생산자와 소비자로, DB 모델은 게임 state·localStorage로, Maven 검사는 승인된 npm 명령과 현재 실행 가능한 읽기 전용 검사로 바꿔 적용했습니다. 근거는 `AGENTS.md:24`, `docs/PRD.md:176`, `docs/PRD.md:182`, `plan.md:23`, `plan.md:29`, `contracts/overview.md:4`입니다. 없는 서버·인증·DB·에러 코드 등록 파일은 요구하지 않았으며 오류 코드 감사 대신 실제 실패 경로를 비교했습니다.

constitution은 직접 읽었고 빈 양식임을 확인했습니다. 사용자 결정과 `spec.md:30`, `spec.md:590`, `plan.md:41`에 따라 **규칙 없음**으로 보았습니다. 미작성 양식을 위반 근거나 BLOCKED 사유로 쓰지 않았습니다.

직접 읽은 원문은 `AGENTS.md`, `CLAUDE.md`, 공통 `ivi-agent-guide/claude-config/CLAUDE.md`, 경계 검토자 역할 파일, `ivi-agent-guide/orca-cross-review.md`, `ivi-agent-guide/mistake.md`의 tasks 교훈, `docs/PRD.md`, `GLOSSARY.md`, 피처의 `spec.md`, `plan.md`, `research.md`, `data-model.md`, 계약 7개, `quickstart.md`, `tasks.md`, `checklists/requirements.md` 전체입니다. 추가로 `_workspace/03_character-rigging.md`, 모델 `CREDITS.md`·`SHA256SUMS`, 생성·검증 스크립트 2개 전체, 기존 `rigging/roundtrip-report.json`과 표준 검사 결과를 확인했습니다. 캐릭터 GLB는 JSON 청크를 직접 읽었으며 `.blend` 두 파일은 존재·크기만 확인했습니다. Blender 안의 편집 상태나 화면을 새로 검사한 것은 아닙니다.

요약하면 spec은 세 안전 연습 완료로 레이싱을 열고 세 항목만 저장합니다. plan은 틱 기반 순수 로직과 화면·에셋·저장을 분리합니다. tasks는 설정·기반·8개 사용자 이야기·콘텐츠·점검까지 123개입니다. 과거 `_workspace/00_*`, `01_*`, `02_plan_decisions.md`가 최종 문서와 다른 것 자체는 결함으로 세지 않았습니다.

## 경계 비교표

검토 경계는 12개입니다. 아래의 일치는 **설계와 태스크 사이의 일치**이며 구현 검증이 아닙니다.

| 경계 | 양쪽 원문 | 결과 |
|---|---|---|
| 콘텐츠 타입 → 주행 타입 | `data-model.md:80`, `contracts/modules.md:438` ↔ `tasks.md:72`, `tasks.md:74` | C-01: 타입을 먼저 쓰고 뒤에서 만듭니다. |
| 입력 → 주행 계산 | `contracts/modules.md:43`, `contracts/modules.md:79`, `contracts/events.md:94` ↔ `tasks.md:74`, `tasks.md:104`, `tasks.md:106`, `tasks.md:113` | 입력 형태·브레이크 우선·후진 거절·releaseAll 연결은 일치합니다. |
| 조작 익히기 → 안전 연습 | `contracts/modules.md:161`, `data-model.md:506`, `contracts/events.md:64` ↔ `tasks.md:110`, `tasks.md:113`, `tasks.md:145`, `tasks.md:161` | 화면 전환·완료 이벤트·처음/목록 흐름이 연결됩니다. |
| 연습 엔진 → 신호·보행자·충돌 | `contracts/modules.md:142`, `contracts/modules.md:195`, `contracts/events.md:111` ↔ `tasks.md:128`, `tasks.md:129`, `tasks.md:133` | 시그니처·후보 위치 판정·이벤트 순서가 대응합니다. ActorPlan 확정은 명시적으로 뒤에 둔 작업입니다. |
| 연습 → 보행자 시점 안내 → flow | `contracts/modules.md:216`, `contracts/events.md:42`, `contracts/events.md:56`, `data-model.md:564` ↔ `tasks.md:130`, `tasks.md:136`, `tasks.md:145` | 시작·카드·종료·입력 해제·추가 규칙 커서 이동이 대응합니다. |
| 경기 → 진행도·복귀 계산 | `contracts/modules.md:269`, `contracts/modules.md:273`, `data-model.md:950` ↔ `tasks.md:175`, `tasks.md:178`, `tasks.md:179` | C-02: 내부 함수 시험 경계·순서, C-05: 복귀 후보가 모두 차면 다음 동작이 없습니다. |
| 경기 완주 → 저장·결과 화면 | `contracts/events.md:86`, `contracts/storage.md:71`, `contracts/storage.md:117` ↔ `tasks.md:79`, `tasks.md:180`, `tasks.md:184` | C-03: 시험 선행 순서, W-01: 최신 기록 읽기 실패 신호가 소비되지 않습니다. |
| 저장 파서 → 실행 상태 / 여러 탭 | `data-model.md:642`, `data-model.md:798`, `spec.md:416` ↔ `contracts/storage.md:47`, `contracts/storage.md:63`, `contracts/storage.md:80` | C-04·C-06: 실패 시 적용값과 동시에 쓰는 탭의 보장이 다릅니다. |
| 생명주기 → 화면·루프·소리 | `contracts/events.md:95`, `contracts/events.md:103`, `data-model.md:623` ↔ `tasks.md:213`, `tasks.md:214`, `tasks.md:215` | 자동 재개 금지·틱 정지·카드/안내 되감기·나가기 확인이 대응합니다. |
| 파일 로더 → 모델 준비 → 화면 | `contracts/modules.md:318`, `contracts/modules.md:330`, `contracts/modules.md:383` ↔ `tasks.md:85`, `tasks.md:88`, `tasks.md:230` | 404/네트워크/정체/GLB 파싱 실패가 loadFailed로 연결되고 재시도 방법이 구분됩니다. |
| 콘텐츠·에셋 → 렌더러·UI·오디오 | `contracts/assets.md:65`, `contracts/assets.md:99`, `contracts/content-data.md:92` ↔ `tasks.md:107`, `tasks.md:142`, `tasks.md:245`, `tasks.md:257` | ID·클립·38개 규칙·23개 검사 배정이 일치합니다. W-02: SVG를 포함하는 검색 범위가 과합니다. |
| 정적 경로·출처 표시 → 공개 배포 | `contracts/static-paths.md:10`, `contracts/static-paths.md:24`, `spec.md:221` ↔ `tasks.md:58`, `tasks.md:92`, `tasks.md:245` | 하위 경로·필수 GLB 수는 일치합니다. C-07: 크레딧보다 공개 배포가 먼저입니다. |

## 상태 전이 감사

| 상태 전이 | 정의와 태스크 | 결과 |
|---|---|---|
| boot → unsupported / loading → start 또는 loadFailed | `data-model.md:494`, `contracts/modules.md:354` ↔ `tasks.md:90`, `tasks.md:230` | 필요한 전이가 있습니다. 실패 화면의 완성 시점은 뒤의 오류 처리 태스크입니다. |
| loadFailed → loading / 페이지 새로 고침 | `data-model.md:497`, `contracts/modules.md:331` ↔ `tasks.md:230`, `tasks.md:231` | 404와 나머지 실패를 나눕니다. 자동 재요청은 없습니다. |
| start ↔ credits, start → 선택 → 연습/레이싱 | `data-model.md:500` ↔ `tasks.md:113`, `tasks.md:145`, `tasks.md:161`, `tasks.md:246` | 전이·가드가 대응합니다. |
| 연습 driving → explaining → 구간 재시도 | `data-model.md:539`, `data-model.md:553`, `contracts/events.md:121` ↔ `tasks.md:134` | 위치·기어·신호·입력 초기화와 viewDone 보존이 대응합니다. |
| 연습 driving → pedestrianView → driving/done | `data-model.md:534`, `data-model.md:538` ↔ `tasks.md:136` | 안내 1회·끝까지 본 뒤 완료 조건이 대응합니다. |
| 세 상황 완료 → tutorialDone=true → 저장 → 축하/start | `contracts/events.md:44`, `data-model.md:526` ↔ `tasks.md:161` | 저장 실패로 다시 잠기지 않는 규칙이 있습니다. |
| 경기 countdown → running → finished → 결과/재도전 | `data-model.md:588`, `contracts/events.md:82`, `contracts/events.md:86` ↔ `tasks.md:178`, `tasks.md:184` | go 때 입력 유지, 다음 틱부터 시간 증가, 완주 이벤트 마지막 처리와 새 경기 생성이 대응합니다. |
| 끼임 → 겹치지 않는 위치로 복귀 | `spec.md:385`, `data-model.md:603`, `data-model.md:950` ↔ `tasks.md:175`, `tasks.md:179` | **C-05: 모든 후보가 점유된 상태의 다음 동작이 없습니다.** |
| 플레이 → user/auto 일시정지 → 명시적 재개 | `contracts/events.md:95`, `contracts/events.md:103` ↔ `tasks.md:214`, `tasks.md:215` | 자동 재개 금지와 안내 되감기 구분이 있습니다. |
| contextLost → 복구 후 일시정지 유지 / fatal | `contracts/events.md:102` ↔ `tasks.md:215`, `tasks.md:230` | 복구·복구 실패 양쪽 경로가 있습니다. |

조작 익히기의 `DrivingLessonState`는 완료 전용 필드를 명시하지 않지만(`contracts/modules.md:161`), `lessonDone`을 받은 flow가 즉시 다음 화면으로 가는 계약이 있습니다(`contracts/events.md:64`). 현재 형식만으로 실제 중복 이벤트가 반드시 발생한다고 단정할 근거는 없어 별도 결함으로 세지 않았습니다. T036의 “lessonDone 1회 뒤 no-op” 테스트로 완료 후 상태 처리를 반드시 확인해야 합니다(`tasks.md:110`).

## 오류·실패 경로 감사

에러 코드 정의 파일은 없으므로 코드 등록 검사는 해당 없음입니다. 오류 경로 자체는 제외하지 않았습니다.

| 오류 | 양쪽 원문 | 결과 |
|---|---|---|
| 저장 JSON 손상·모르는 버전 | `data-model.md:694`, `contracts/storage.md:46` ↔ `tasks.md:79`, `tasks.md:162` | 항목별 기본값·안내 없음·알려진 필드만 사용이 일치합니다. |
| localStorage 접근 실패 | `contracts/storage.md:79` ↔ `tasks.md:79`, `tasks.md:161` | 기본값 + 메모리 진행 + 실행당 안내 1회가 있습니다. |
| 읽기 성공 뒤 시험 쓰기 실패 | `contracts/storage.md:80` ↔ `data-model.md:642` | C-04: 읽은 값 유지/전체 기본값이 충돌합니다. |
| 완주 시 최신 저장 읽기 실패 | `spec.md:413` ↔ `contracts/events.md:86`, `tasks.md:184` | W-01: ok:false 소비가 없습니다. |
| 파일 네트워크 실패·정체 / 404 | `contracts/modules.md:330` ↔ `tasks.md:85`, `tasks.md:230`, `tasks.md:231` | 실패 파일만 재시도 / 새로 고침으로 나뉩니다. |
| 손상 GLB 파싱 실패 | `contracts/modules.md:383` ↔ `tasks.md:88`, `tasks.md:230` | flow가 파일 실패로 변환합니다. |
| WebGL2 없음·렌더러 생성 실패 | `contracts/modules.md:382` ↔ `tasks.md:87`, `tasks.md:230` | null → unsupported 경로가 있습니다. |
| JS 로딩 실패 / 컨텍스트 복구 실패 | `contracts/static-paths.md:55`, `contracts/events.md:102` ↔ `tasks.md:228`, `tasks.md:230` | 부팅 가드 / fatal 안내를 맡는 곳이 정해져 있습니다. |
| 음성·효과음 파일 또는 재생 실패 | `contracts/modules.md:410` ↔ `tasks.md:198`, `tasks.md:201` | 진행을 막지 않으며 보행자 안내는 음성 완료를 기다리지 않습니다. |

## CRITICAL 발견

### C-01 — 좌석 타입이 아직 없는 Vec3 모듈에 의존합니다 (공유 SF-1 첫 항목)

- A측: `data-model.md:80`의 `SeatDef.pos`는 `Vec3`입니다. `contracts/modules.md:70`과 `contracts/modules.md:438`은 그 타입의 소속을 `src/sim/vehicle.ts`로 정합니다.
- B측: `tasks.md:72`의 T009는 `[P]`로 차량·좌석 타입을 만들고 즉시 `npm run typecheck`를 통과해야 합니다. 해당 Vec3 파일은 다음인 T011(`tasks.md:74`)에서 처음 만듭니다. 태스크마다 검증 뒤 다음으로 가야 합니다(`tasks.md:325`).
- 영향: 계약대로 import하면 T009 시점의 타입 검사를 통과하지 못합니다. 타입을 임의로 다른 파일에 중복 선언하면 소속 계약과 달라집니다.
- 필요한 결정: 타입 생성과 소비의 선행 순서를 맞추거나 타입 골격을 먼저 만드는 작업을 명시해야 합니다. 이 보고서에서 타입 소속을 바꾸지는 않습니다.

### C-02 — 외부에서 호출할 수 없는 진행도 내부 함수를 먼저 시험하도록 합니다 (공유 SF-1 둘째 항목)

- A측: `contracts/modules.md:269`의 공개 함수는 `progressValue`·`rankCars`이고, `contracts/modules.md:273`은 체크포인트 통과·복귀 자세 계산을 내부 함수로 두며 **시험은 stepRace로** 하도록 합니다.
- B측: T068(`tasks.md:175`)은 그 내부 동작까지 `progress.test.ts`에서 시험하고 통과해야 합니다. `stepRace`는 T068 완료를 선행 조건으로 하는 T071(`tasks.md:178`)에서 생기며 복귀 실행은 T072(`tasks.md:179`)에 있습니다.
- 영향: 현재 공개 인터페이스와 순서를 함께 지키면 T068의 검사 일부를 작성할 호출 대상이 없습니다. 시험을 위해 임의 export를 더하면 계약 변경입니다.
- 필요한 결정: 공개 함수 시험과 stepRace를 통한 통합 시험의 담당 태스크를 나누거나 계약과 순서를 함께 조정해야 합니다.

### C-03 — 저장 모듈 검사에 나중에 만들 완주 결과 함수가 필요합니다 (공유 SF-2)

- A측: `contracts/storage.md:117`의 두 탭 첫 시나리오는 `finishResult`가 최신 기록 30000을 읽어 `isNewBest=false`로 결정하고 저장하지 않는 결과를 요구합니다. `contracts/modules.md:245`에서 이 함수의 소속은 race입니다.
- B측: T016(`tasks.md:79`)은 저장 모듈과 짝 테스트만 만들며 두 탭 3건 전체를 검사하도록 합니다. `finishResult`는 T073(`tasks.md:180`), 실제 flow 연결은 T077(`tasks.md:184`)에서 생깁니다.
- 영향: T016에서 commitSave의 최솟값 합치기만 시험하면 “저장 자체를 하지 않음”이라는 첫 시나리오를 검증하지 않습니다. 뒤 함수에 직접 의존하면 순서상 검사가 불가능합니다.
- 필요한 결정: 저장 합치기 단위 검사와 완주 결과·쓰기 여부 검사의 실행 시점을 구분해야 합니다.

### C-04 — 저장값은 읽혔지만 시험 쓰기가 실패한 경우의 적용값이 다릅니다

- A측: `contracts/storage.md:47`은 읽기·파싱 뒤 시험 쓰기와 지우기를 하고, API 중 하나라도 실패하면 `ok=false`입니다. `contracts/storage.md:80`은 **읽은 값을 사용**하도록 합니다.
- B측: `data-model.md:642`는 `loadSave`가 `ok:false`이면 **기본값으로 시작**하도록 합니다. `spec.md:535`도 저장 불가를 잠김 쪽에 적고, 반대로 정상 저장값 적용 요구는 `spec.md:412`에 있습니다. T016은 storage 전체를, T019는 data-model 시작값을 기준으로 삼습니다(`tasks.md:79`, `tasks.md:82`).
- 재현 조건: 저장된 `tutorialDone=true`, 유효한 best, 소리 꺼짐은 정상적으로 읽히지만 probe setItem이 실패합니다.
- 영향: 같은 상황에서 레이싱이 열리거나 잠기고, 최고 기록·소리 설정 적용 여부가 달라집니다. 어느 쪽을 따를지 이 보고서에서는 선택하지 않습니다.
- 필요한 결정: 접근·읽기 실패와 읽은 뒤 시험 쓰기 실패를 구분할지 확정하고 반환값·상태 전이·짝 테스트를 맞춰야 합니다.

### C-05 — 복귀 후보 세 곳을 다른 세 차량이 모두 차지하면 복귀 전이가 정의되지 않습니다

- A측: `spec.md:293`, `spec.md:385`는 복귀 위치에 다른 차량이 있어도 겹치지 않게 조정하고 경기를 계속하도록 합니다. `contracts/modules.md:257`도 끼임 후 자동 복귀를 보장합니다.
- B측: `data-model.md:950`의 복귀 계산은 마지막 체크포인트의 **중심·좌·우 세 칸 중 겹치지 않는 첫 칸**뿐입니다. 참가 차량은 4대입니다(`data-model.md:400`). T068·T072는 이 계산을 구현·시험합니다(`tasks.md:175`, `tasks.md:179`).
- 반례: width=12, bodyRadius=1인 직선 체크포인트에서 후보 좌표를 `(0,0),(-4,0),(4,0)`으로 두고 다른 세 차량이 각각 차지하면 겹치지 않는 후보가 0개입니다. 읽기 전용 Python 계산으로 확인했습니다. 이는 게임 코드 테스트가 아니라 명시된 선택 규칙의 반례입니다.
- 영향: 빈 후보 반환, 겹침 강행, 복귀를 계속 미루는 동작 중 무엇이 일어나야 하는지 계약에 없습니다. 현재 “겹치지 않는 자동 복귀” 보장을 완성하지 못합니다.
- 필요한 결정: 세 후보가 모두 찬 경우에도 진행도 증가 없이 안전한 위치를 정하는 규칙과 그 경우의 테스트를 정의해야 합니다.

### C-06 — 여러 탭의 기록 악화 0건 요구와 저장 계약의 허용 한계가 다릅니다 (공유 SF-4b)

- A측: `spec.md:416`은 여러 탭에서도 기록이 나빠지지 않도록 하고, `spec.md:568`은 더 나쁜 최고 기록으로 덮어쓰는 경우 **0건**을 요구합니다.
- B측: `data-model.md:798`, `contracts/storage.md:63`은 읽기와 쓰기 사이에 다른 탭이 저장하면 그 값을 덮을 수 있다고 명시적으로 받아들입니다. `contracts/storage.md:117`의 시험은 순차 시나리오뿐이고 T016이 이를 따릅니다(`tasks.md:79`).
- 반례: 두 탭이 기록 없음 상태를 각각 읽은 뒤 A가 30000을 쓰고 B가 이미 계산한 31000을 쓰면 최종값이 31000입니다. 각 탭의 합치기 계산은 계약대로 수행했어도 더 좋은 값이 사라집니다.
- 영향: 구현이 계약을 지켜도 요구사항의 0건 보장은 성립하지 않습니다. “한계(받아들임)”을 사용자 요구 완화의 승인으로 간주하지 않았습니다.
- 필요한 결정: 동시 쓰기의 보장 수준과 허용 범위를 요구사항·설계·테스트에서 같은 뜻으로 정해야 합니다.

### C-07 — 모델을 공개 배포하는 시점에 게임 크레딧이 없습니다 (공유 SF-4a)

- A측: `spec.md:221`은 크레딧을 **공개 배포의 필수 조건**으로 정하고, `spec.md:427`은 모델 8종의 출처·라이선스·변경 사실을 게임에서 표시하도록 합니다. `contracts/content-data.md:58`도 같은 8행을 요구합니다.
- B측: T029(`tasks.md:92`)는 기반 단계에서 모델이 로드되는 start 화면을 main 푸시·GitHub Pages 공개 주소에서 확인합니다. 크레딧 데이터·화면·검사는 T094~T096(`tasks.md:245`, `tasks.md:246`, `tasks.md:247`)에야 생깁니다. 제공된 `src/assets/models/CREDITS.md:3`은 캐릭터 3종 문서이며 게임의 8종 크레딧 화면을 대신하지 않습니다.
- 영향: 현재 순서대로 실행하면 명세가 정한 공개 배포 전제 조건을 갖추기 전에 공개됩니다. 이는 법률 판단이 아니라 저장소의 명시적 제품·배포 조건 비교입니다.
- 필요한 결정: 공개 배포와 최소 크레딧의 선행 관계를 맞춰야 합니다.

## WARNING 발견

### W-01 — 완주 시 최신 기록 읽기에서 발생한 실패 신호가 사라집니다

- A측: `spec.md:413`, `plan.md:238`은 저장소 **읽기·쓰기** 실패에 실행당 안내 1회를 요구합니다. `contracts/storage.md:35`, `contracts/storage.md:47`은 `loadSave`가 `ok`를 반환합니다.
- B측: `contracts/events.md:86`과 T077(`tasks.md:184`)은 `loadSave(key).data.best`만 취하고, `commitSave`가 false일 때만 안내합니다. T065(`tasks.md:161`)의 loadSave 오류 처리는 **부팅** 결과입니다.
- 재현 조건: 부팅은 정상, 메모리 best=30000인 상태에서 31000으로 완주하며 최신 읽기가 실패하면 `isNewBest=false`여서 commitSave도 부르지 않습니다. 따라서 전달된 flow 절차에는 안내를 띄울 분기가 없습니다.
- 필요한 조정: 결과 화면을 늦추지 않으면서 완주 시 읽기 결과의 ok도 기존 안내 1회 처리에 연결하고, “읽기 실패 + 기록 미갱신” 검사를 포함해야 합니다.

### W-02 — 금지 패턴 검사가 코드·외부 링크의 범위를 넘습니다

- A측: `contracts/overview.md:26`은 외부 이동 링크와 HTML 문자열 실행을 막습니다. `contracts/static-paths.md:66`은 DOM의 `a[href]`를 검사하며, `contracts/assets.md:101`은 SVG 그림을 허용합니다.
- B측: T112(`tasks.md:279`)는 “코드 파일만, 문서·테스트 제외”라고 쓰면서 `grep ... src/ index.html`로 에셋·Markdown까지 모두 훑고 **href라는 문자열 자체**를 금지합니다. 콘텐츠 SVG는 T102·T103에서 그보다 먼저 생깁니다(`tasks.md:262`, `tasks.md:263`).
- 영향: 같은 SVG 안의 도형을 참조하는 `<use href="#arrow">`도 검출됩니다. 이는 외부 링크가 아닙니다. 현재 에셋에는 이 패턴이 반드시 남는다는 뜻이 아니며, **무조건 실패하는 게이트가 아니라 허용되는 콘텐츠까지 금지하는 검사 범위 오류**입니다. 읽기 전용 정규식 예제로 오탐을 확인했습니다.
- 필요한 조정: 코드 검색의 파일 범위와 실제 금지 대상을 계약에 맞추고, 화면 외부 링크 여부는 이미 계획된 DOM 검사를 사용해야 합니다.

## INFO 발견

### I-01 — 모듈 소속 설명 일부가 최종 타입 소속 표와 다릅니다

- A측: `plan.md:96`, `plan.md:192`, `plan.md:276`은 PlaySession을 app/session.ts에 두는 설명입니다. `data-model.md:40`은 DriveInput 위치를 input/controls.ts로 씁니다.
- B측: `contracts/modules.md:340`, `contracts/modules.md:457`과 `data-model.md:324`는 PlaySession을 app/flow.ts에, `contracts/modules.md:74`, `contracts/modules.md:438`은 DriveInput을 sim/vehicle.ts에 둡니다. tasks는 후자를 따릅니다(`tasks.md:74`, `tasks.md:90`).
- 영향: 최종 소속 기준은 명시되어 있어 구현을 막지 않지만, 구조 그림이나 개요만 읽은 구현자는 잘못된 import 경계를 만들 수 있습니다. 관련 설명을 최종 표와 맞추면 됩니다.

## 요청에서 특히 지목한 항목의 결론

| 항목 | 확인 결과와 근거 |
|---|---|
| 기반 단계의 세 상황 자리표시와 타입 골격 | D6·D7와 T013·T020·T021 자체의 **소속 파일은 일치**합니다(`tasks.md:46`, `tasks.md:76`, `tasks.md:83`, `tasks.md:84` ↔ `contracts/modules.md:442`, `contracts/modules.md:447`, `contracts/modules.md:449`, `contracts/modules.md:451`). T009의 더 앞선 Vec3 순서 문제는 C-01로 별도 기록했습니다. |
| 콘텐츠 검사 23개 배정 | 번호 누락은 없습니다. #14는 데이터 이름 검사와 실제 GLB 검사로 나뉘어 있어 중복 결함이 아닙니다(`tasks.md:73`, `tasks.md:86` ↔ `contracts/content-data.md:105`). #10은 함수 생성 T046 뒤의 T047, #20은 DRIVING_SPEC 생성 T011 뒤의 T012입니다. |
| 완성 검사 skip·해제 | #8·#21·#22·#23은 T097에서 skip, T100·T102·T105·T108에서 해제합니다(`tasks.md:257`, `tasks.md:260`, `tasks.md:262`, `tasks.md:265`, `tasks.md:268` ↔ `contracts/content-data.md:88`). 각 콘텐츠 공급 태스크가 앞서 있어 이 네 검사의 순서 문제는 없습니다. |
| 탑승객 좌석·Sit 점검 | T033의 Idle 렌더링 이후 T042에서 15조합을 보고 좌석을 조정합니다(`tasks.md:107`, `tasks.md:116`). `_workspace/03_character-rigging.md:49`, `data-model.md:94`는 clips.idle만 연결합니다. Sit이 필요하면 계약 확정 후 추가하도록 했으므로 현재 태스크가 계약 밖 Sit 재생을 강요하지 않습니다. |
| ActorPlan 잠정 문구 게이트 | T052는 data-model의 ActorPlan 블록·Open Issues 1과 modules의 해당 시그니처 행으로 검사 범위를 좁혔습니다(`tasks.md:137` ↔ `data-model.md:184`, `data-model.md:999`, `contracts/modules.md:151`). 트랙의 다른 “잠정”을 남겨도 통과할 수 있습니다. `contracts/content-data.md:47`의 잠정 설명은 문서 맞춤 때 함께 확인할 항목이나 이 게이트를 반드시 실패시키지는 않습니다. |
| href 포함 검색 게이트 | W-02. 실제 게임 소스가 없는 현재 시점에 미래 T112 명령을 통과했다고 보고하지 않았습니다. |
| data-pressed | T032의 생산자와 T041·T087의 소비자가 함께 정의됩니다(`tasks.md:43`, `tasks.md:106`, `tasks.md:115`, `tasks.md:216`). 공개 게임 함수·저장 형식을 바꾸는 값이 아닌 UI 내부 관찰값이므로 계약 문서에 없다는 이유만으로 결함 처리하지 않았습니다. |
| 캐릭터 완료·차량만 받기 | `plan.md:440`, `quickstart.md:46`, `quickstart.md:59`, `contracts/assets.md:32` ↔ T006(`tasks.md:60`)이 모두 캐릭터 3종 보존·차량 5종만 받기·체크섬 8개 확장을 따릅니다. |

콘텐츠 검사 번호별 담당: **1~7·9=T015, 8=T097→T100, 10=T047, 11·13=T010, 12=T023, 14=T010+T023, 15·17=T055, 16=T014, 18=T017, 19=T094, 20=T012, 21=T097→T102, 22=T097→T105, 23=T097→T108**입니다. 이 배정표는 원문을 직접 대조한 결과이며, 아직 존재하지 않는 content.test.ts의 실행 결과가 아닙니다.

## 실행 근거

| 명령·검사 | 종료 코드 | 결과 |
|---|---:|---|
| `python3 ivi-agent-guide/scripts/review-snapshot.py "/Users/kyw/Documents/git/mine/driving_game" "/Users/kyw/Documents/git/mine/driving_game/specs/001-kids-driving-safety-game"` — 읽기 전·검사 후 | 0 | 모두 요청 revision과 같았습니다. |
| `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` | 0 | 요청 FEATURE_DIR 및 research·data-model·contracts·quickstart·tasks를 반환했습니다. |
| `(cd src/assets/models && shasum -a 256 -c SHA256SUMS)` | 0 | chicken-guy, cool-banana-guy, turtle **3/3 OK**입니다. |
| `python3 - <<'PY'` 읽기 전용 GLB 헤더·JSON 검사 | 0 | GLB 2.0·전체 바이트 수 일치, 내장 buffer/image, extensionsUsed 없음. Chicken Guy 스킨 2·관절 27씩, 새 리그 2종 스킨 1·관절 16씩, 계약에서 쓰는 Idle/Walk 클립 존재를 확인했습니다. |
| 같은 읽기 전용 Python: 저장소 상태·태스크 ID | 0 | package.json 없음, src 아래 TypeScript 소스 없음, 태스크 번호 **123/123 고유·순서 일치**입니다. |
| 읽기 전용 Python: spec 규칙 표와 data-model 표 추출 비교 | 0 | 규칙 ID·상황·core/extra·순서 **38/38 일치**입니다. |
| 읽기 전용 Python: 복귀 후보 반례 | 0 | 세 후보가 다른 차량 세 대로 점유되면 비점유 후보 **0개**임을 assert로 확인했습니다(C-05). 게임 구현 테스트가 아닙니다. |
| 읽기 전용 Python: T112 정규식에 같은 SVG 내부 href 예시 적용 | 0 | 외부 이동이 없는 `<use href="#arrow">`가 매칭되었습니다(W-02). 실제 SVG 파일은 만들지 않았습니다. |
| `npm run typecheck`, `npm test`, `npm run build`, `npm run test:e2e` | 실행 안 함 | package.json·게임 소스·테스트 파일이 아직 없습니다. 설치하거나 자리표시 앱을 만들지 않았습니다. |
| `blender --background --python-exit-code 1 --python scripts/verify-character-rigs.py` | 실행 안 함 | 요청상 재실행 금지이며 `scripts/verify-character-rigs.py:95`가 기존 증거 파일을 다시 씁니다. 기존 결과의 새 리그 오류 0·경고 0, Chicken Guy 오류 0·기존 경고 4를 읽었을 뿐 이번 실행으로 재인증하지 않았습니다. |
| 실제 브라우저·기기·어린이 관찰·Blender 화면 | 실행 안 함 | 구현 전 문서 분석 범위 밖입니다. 탑승객 15조합·교육 행동·성능 통과를 주장하지 않습니다. |

## 통신·공유 발견 처리

| 이력 | 처리 |
|---|---|
| 시작 status `msg_ae78e2db9d4d` | AGENTS.md 확인, 역할 치환, 읽기 전 revision 일치를 조율자에게 보고했습니다. |
| 자체 발견 공유 `msg_7638cd15dd10` | 저장값 처리 불일치·복귀 후보 누락과 완료 상태 검토 후보를 알렸습니다. 완료 상태 후보는 실제 중복 실행이 필연적이라고 단정하지 않고 위 상태 감사 주석으로 정리했습니다. |
| SF-1·SF-2 수신 `msg_c83fe5ebfa47`, `msg_910d07c22c7c` | 양쪽 원문 확인 후 C-01·C-02·C-03에 반영했습니다. 회신 `msg_c4394fd67c83`, Delivery 처리·ack 완료입니다. |
| SF-4a·SF-4b 수신 `msg_d8262646b67b` | C-07·C-06에 반영했습니다. 회신 `msg_6d72619280b8`, Delivery 처리·ack 완료입니다. |
| 필수 원문 요약 status `msg_cef18885eccf` | 규칙 없음·제품 범위·분리된 모듈 구조·전체 태스크 범위를 보고했습니다. |

판정과 이 보고서 경로를 같은 Dispatch의 status로 제출하고, close-review가 오기 전까지 수정·재검증·추가 공유를 같은 세션에서 받습니다. worker_done은 close-review와 마지막 inbox 확인 뒤 한 번만 보냅니다.
