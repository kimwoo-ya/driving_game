# Code Consistency Report — 구현 전 사전 분석

- run: `run_18857b1c119f`
- task: `task_a7256fc40397`
- dispatch: `ctx_c1df0f445fe0`
- 실제 도구 / 세션 handle: Codex (`orca worker-show`의 provider `codex`, model `gpt-6-astra`) / `term_c4c9b2a2-3174-4af5-b77d-77ab8b8c4e81`
- PROJECT_ROOT: `/Users/kyw/Documents/git/mine/driving_game`
- FEATURE_DIR: `/Users/kyw/Documents/git/mine/driving_game/specs/001-kids-driving-safety-game`
- 단계 / 검토 태스크: speckit analyze, 구현 전·tasks 작성 직후 / T001~T123 전체
- revision 요청값: `4a8a3979824b2f2b22e6082f8875e3cdd58854a51cc308e92f1a8d92372d7355`
- revision 읽기 전: `4a8a3979824b2f2b22e6082f8875e3cdd58854a51cc308e92f1a8d92372d7355`
- revision 검사 후: `4a8a3979824b2f2b22e6082f8875e3cdd58854a51cc308e92f1a8d92372d7355`
- HEAD: `2739ec03cb19385b4b0bc4494550a594f976fa01`
- 검증 상태: **COMPLETE** — 요청된 사전 분석 완료이며 구현·출시 통과를 뜻하지 않습니다.
- 역할 판정(재검증 2, 최종): **CRITICAL 0 / WARNING 0 / INFO 0**. 이전 자체 발견 7건과 재검증 1의 추가 발견 R1-C001은 모두 해소되었습니다. 전달받은 공유 발견도 처리 완료했습니다. 이 판정은 구현 전 문서·에셋 분석에 한정됩니다.
- 원문 및 코드 근거: 아래 항목별 `파일:라인`, GLB JSON 청크 직접 판독, 체크섬 대조입니다. 이 보고서의 `spec.md`, `plan.md`, `tasks.md`, `contracts/*` 등은 FEATURE_DIR 기준이며 `src/*`, `scripts/*`, `AGENTS.md`, `docs/*`는 PROJECT_ROOT 기준입니다.
- 실행한 검사 / 종료 코드 / 결과: prerequisites `0`, SHA-256 `0`(3/3 OK), 읽기 전·검사 후 snapshot 각 `0`(요청값 일치), Python 읽기 전용 GLB·문서 검사 `0`. 전체 명령·범위는 아래 검사 기록에 있습니다.
- 실행하지 못한 검사: `package.json`·게임 TypeScript 소스가 없어 npm/Vitest/Playwright 미실행. Blender 검증 스크립트는 증거 파일을 다시 쓰므로 요청대로 미실행. 기존 Blender·glTF 검사 결과는 읽기만 했습니다.
- 미해결 질문 / 이전 지적 처리: 없음. 최초 지적·공유 발견과 수정 2회의 결과를 아래에 보존합니다. 현재 revision에 남은 자체 지적이나 미응답 공유는 없습니다.
- 변경 범위: 이 보고서 파일 하나만 작성합니다. 원문·소스·에셋·공용 가이드·다른 역할 보고서는 수정하지 않았습니다.

## 재검증 2 — 2026-10-12, 현재 판정

- 요청 메시지: `msg_815075105c12`, 수신 확인: `msg_afbd887bdbc7`.
- 최종 판정 전송: `msg_0b7f4669769d`. 리더의 동일 revision 판정 수락 및 close-review: `msg_fc9da1a9f160`(2026-10-12). 미처리 공유 없이 검토를 종료합니다.
- 이전 revision: `8d50a4d5195b805096bf98f9293d9d4de42881c485a61f215812ecfba6bed12f`의 판정은 아래 이력으로만 보존합니다.
- 변경 범위: `data-model.md:525`, `:951`, `contracts/content-data.md:109`, `tasks.md:180`~`:181`을 직접 읽고 관련 기존 계약·요구사항과 대조했습니다. 게임 소스·에셋·패키지 설정 변경은 없습니다.

| 남은 발견 | 결과 | 현재 양쪽 원문과 확인 내용 |
|---|---|---|
| R1-C001 / SF-8: 복귀 후보의 거리 보장 | **해소** | `data-model.md:951`은 네 번째 후보를 체크포인트 접선 반대 방향의 **직선 5r**로 정합니다. `contracts/content-data.md:109`는 폭 간격 `width/3 > 4r`와 뒤 후보의 트랙 안 조건 `중심선까지 거리 ≤ width/2 − r`를 검사합니다. 앞뒤 실제 거리는 5r, 좌우와 뒤의 거리는 직각삼각형의 빗변이라 5r보다 커서 모든 후보 쌍이 4r보다 멉니다. 두 후보를 동시에 반지름 2r 안에 넣는 다른 차량은 있을 수 없으므로 다른 3대가 4곳 모두를 막는 이전 반례가 해소됩니다. T072(`tasks.md:180`)에 곡선 체크포인트 시험도 추가되었습니다. |
| SF-9: 읽기 성공값을 버릴 수 있는 잠금 표 | **해소** | `data-model.md:525`는 “저장 불가” 일괄 가드를 제거하고 시험 쓰기 실패 시 읽은 값을 따른다고 명시합니다. `spec.md:535`, `data-model.md:643`, `contracts/storage.md:80`과 일치하며, 유효한 tutorialDone=true이면 앞 행(`data-model.md:524`)대로 열립니다. |
| C-002 잔여 / SF-10: T073의 미래 flow 시험 | **해소** | `tasks.md:181`의 시험은 finishResult의 isNewBest=false·best=30000까지입니다. commitSave 미호출은 T077의 flow 동작이라고 분리했으며 `tasks.md:185`, `contracts/events.md:86`의 isNewBest 조건부 저장과 일치합니다. T073 검사에 미래의 flow 연결을 요구하지 않습니다. |

추가 확인: 앞선 재검증에서 해소된 타입 선행 순서·공개 배포 순서·grep 범위·트랙 키 독립 테스트·크레딧 비교 범위·기존 커밋 문구는 유지되어 있습니다. 이번 3개 파일의 수정으로 패키지 버전·설정 값·에셋 경로·함수/타입 소속이 바뀌지는 않았습니다. 검토 범위에서 새 불일치를 찾지 못했습니다.

### 재검증 2 검사 기록

| 명령·검사 | 종료 코드 | 결과 |
|---|---|---|
| 기존 `review-snapshot.py` 명령(보고서 머리말의 PROJECT_ROOT·FEATURE_DIR) | 0, 읽기 전·검사 후 | 모두 `4a8a3979824b2f2b22e6082f8875e3cdd58854a51cc308e92f1a8d92372d7355` |
| `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` | 0 | 현재 피처·필수 문서 확인 |
| `(cd src/assets/models && shasum -a 256 -c SHA256SUMS)` | 0 | 캐릭터 GLB 3/3 OK |
| 읽기 전용 Python 거리 검사 | 0 | 반지름 0.25·1·10, 방향 0·0.3·π/2의 9조합에서 width=12.3r로 후보 쌍 최소 거리 >4r, 앞 3곳 점유 뒤 네 번째 사용 가능, 좌우 후보의 차체 반지름 여유 확인. 아래 코드입니다. |
| npm·Vitest·Playwright | 미실행 | package.json·게임 코드가 아직 없어 실행 대상 없음. 사전 분석을 구현 통과로 해석하지 않습니다. |
| Blender·실제 기기·어린이 관찰 | 미실행 | 요청 범위 밖이며 기존 증거 파일을 다시 쓰지 않았습니다. |

```python
import itertools, math
for r in (0.25, 1.0, 10.0):
    width = 12.3 * r
    for theta in (0, 0.3, math.pi / 2):
        forward = (math.sin(theta), math.cos(theta))
        side = (math.cos(theta), -math.sin(theta))
        candidates = [(0, 0), tuple(v * width / 3 for v in side),
                      tuple(-v * width / 3 for v in side),
                      tuple(-v * 5 * r for v in forward)]
        assert min(math.dist(a, b) for a, b in itertools.combinations(candidates, 2)) > 4 * r
        free = [p for p in candidates if all(math.dist(p, q) > 2 * r for q in candidates[:3])]
        assert free == [candidates[3]]
        assert width / 3 + r < width / 2
```

## 재검증 1 이력 — 2026-10-12

이 절의 부분 해소·CRITICAL 표기는 당시 revision의 기록입니다. 현재 상태는 위 재검증 2를 따릅니다.

- 요청 메시지: `msg_fbd7c8ee918b`, 수신 확인 `msg_f2f775373853`.
- 직전 revision: `6c044bc5e04ac429b6e8aca7cc96f965e33e934c79baf0ef9c05b669390f17e2`. 그 판정은 아래 역사 기록이며 현재 판정에 그대로 쓰지 않습니다.
- 변경 7개 파일의 diff와 관련 원문을 읽었습니다: spec, plan, data-model, contracts/events, contracts/content-data, quickstart, tasks. 변경하지 않은 modules·storage·assets·static-paths 계약도 해당 지점에서 다시 대조했습니다.
- 게임 코드·패키지는 여전히 없고 에셋 3개는 변경되지 않았습니다. prerequisites 종료 0, SHA256SUMS 3/3 OK 종료 0, 태스크 123개 연속·고유 검사 종료 0, 새 T112 grep 명령 5개의 `zsh -n -c` 구문 검사 종료 0입니다. npm·브라우저·Blender 실행은 여전히 하지 않았습니다.
- 사용자 결정으로 바뀐 두 탭 동시 쓰기 예외·읽기 성공값 보존·공개 배포 순서·4후보 복귀·에셋/기록 파일 수 예외를 새 기준으로 적용했습니다. 과거 기준을 다시 요구하지 않습니다.

### 이전 지적 처리 결과

| 이전 지적 | 결과 | 수정과 현재 원문 근거 |
|---|---|---|
| C-001 / SF-1: Vec3 선행 | 해소 | T009에서 [P] 제거, T011 선행·Vec3 import type 명시(`tasks.md:73`, `:75`). 실제 실행 순서는 T008 → T011 → T009 → T010이 가능하며 Vec3 소속(`contracts/modules.md:438`)을 지킵니다. 번호를 바꾸지 않아도 명시한 의존성을 따르면 순환하지 않습니다. |
| C-002: T016의 finishResult | 부분 해소 / CRITICAL 유지 | T016은 저장 모듈 검사 2·3번째만, finishResult 사례는 그 함수가 생성되는 T073로 이동(`tasks.md:80`, `:181`), SC-019 담당표도 T016·T073(`tasks.md:414`)입니다. 다만 T073의 새 시험 문구에 `flow가 commitSave를 부르지 않음`까지 포함되어 있어, T077(`tasks.md:185`) 이전에 아직 연결되지 않은 flow 동작을 검사하는 부분이 남았습니다(SF-10). 결과값 검사까지만 T073에 두고 flow 반응은 T077과 구분해야 합니다. |
| C-002 / SF-1: T068 내부 함수 시험 | 해소 | T068은 공개 progressValue·rankCars만 시험하고, 내부 동작은 stepRace를 만드는 T071·T072로 이동(`tasks.md:176`, `:179`~`:180` ↔ `contracts/modules.md:273`). |
| C-003 / SF-4a: 크레딧 전 배포 | 해소 | T029는 파일·로컬 확인만(`tasks.md:93`), 첫 푸시는 T096 뒤 T093(`tasks.md:234`). plan 공개 시점·단계와 quickstart도 같음(`plan.md:333`, `:441`~`:446`, `quickstart.md:91`). US7 안의 T093을 US8 뒤 수행하는 예외가 의존성·점진 배포 문구에 명시되어 있습니다(`tasks.md:307`, `:388`). |
| W-001: grep 범위·href | 해소 | `tasks.md:280`은 *.ts·index.html로 제한하고 문서·그림을 제외합니다. a[href]는 DOM 검사로 맡기고, grep 종료 1을 통과로 명시했습니다. 5개 명령의 셸 구문도 확인했습니다. |
| W-002: 실제 TRACK 초기 키 고정 | 해소 | `tasks.md:82`는 테스트 입력의 id/revision/laps를 명시해 실제 트랙의 T115 조정과 분리했습니다. |
| I-001: CREDITS 비교 범위 | 해소 | `tasks.md:246`은 캐릭터 3종의 작품명·제작자·출처·라이선스만 제작 기록과 비교하고 변경 문구는 assets 계약을 따르도록 구분했습니다. |
| I-002: 커밋 없음 문구 | 해소 | `plan.md:3`, `:332`, `quickstart.md:91`, `tasks.md:394`에 기존 커밋 완료가 반영되었습니다. |
| SF-3 / SF-9: 읽기 성공·시험 쓰기 실패 | 부분 해소(원 발견 boundary) | `data-model.md:642`~`:643`은 읽기 실패와 시험 쓰기/지우기 실패를 구분하며 `contracts/storage.md:79`~`:80`과 일치합니다. spec 흐름(`spec.md:535`)과 T016 검사(`tasks.md:80`)도 수정되었습니다. 그러나 `data-model.md:525`의 레이싱 잠금 가드에 `저장 불가`가 남아 시험 쓰기만 실패해도 잠긴다는 문구가 새 기준과 다릅니다. SF-9(`msg_3c3675307a2a`) 수신 후 해당 행을 직접 읽어 보존했습니다. |
| SF-4b: 두 탭 동시 쓰기 보장 | 해소(사용자 결정) | `spec.md:263`, `:416`, `:568`이 거의 동시 저장의 짧은 틈을 제외합니다. `data-model.md:799`, `contracts/storage.md:63`의 한계와 더는 충돌하지 않습니다. |
| SF-5: 복귀 후보 모두 점유 | 부분 해소 | 후보가 4개로 늘고 T072에 3칸 점유 시험이 추가되었습니다(`data-model.md:951`, `tasks.md:180`). 그러나 실제 후보 간 거리 조건과 검사 #18이 다르므로 아래 R1-C001이 남습니다. |
| SF-6: 완주 때 읽기 실패 안내 | 해소 | `contracts/events.md:86`, T077(`tasks.md:185`)이 loadSave.ok를 먼저 확인해 저장 여부와 무관하게 안내 1회를 처리합니다. |
| SF-7: 음원 전부 실패 완주 확인 | 해소 | `plan.md:392`, T120(`tasks.md:288`)이 무음·음원 전부 차단 각각 시작~완주 2/2를 실제 기기 확인에 명시했습니다. T083이 일부 확인이라는 구분도 일치합니다. |
| 소속 표기·파일 수 예외 | 해소·반영 | PlaySession은 `plan.md:95`, `:191`, `:276`, `:295`에서 flow.ts로 일치하며, DriveInput도 `data-model.md:40`에서 sim/vehicle.ts로 맞췄습니다. D8(`tasks.md:48`)은 사용자께서 승인한 기록·에셋 묶음 예외입니다. |

### R1-C001 (CRITICAL) — 도로 폭 검사만으로 실제 네 복귀 후보의 거리가 보장되지 않습니다

- 요구사항: 겹치지 않는 안전한 복귀를 요구합니다(`spec.md:293`, `spec.md:385`).
- 새 데이터 모델: 네 번째 후보를 **중심선을 따라** 4×bodyRadius 뒤에 두며, 후보끼리 실제 거리가 4×bodyRadius 이상이라 차 한 대가 두 후보를 함께 막지 못한다고 설명합니다(`data-model.md:951`).
- 검사 계약: #18은 `width / 3 ≥ 4 × DRIVING_SPEC.bodyRadius`만 추가합니다(`contracts/content-data.md:109`). 이것은 같은 체크포인트의 좌우 폭을 검사할 뿐, 뒤 후보와 앞 후보의 실제 직선 거리를 검사하지 않습니다. T017은 이 #18을 따르고(`tasks.md:81`), T072의 시험은 옆 3칸을 각각 막는 한 배치입니다(`tasks.md:180`).
- 재현(읽기 전용 Python 계산, 종료 0): r=1, width=12로 #18을 만족시켰습니다. 중심선은 `(0,0) → (0,-2) → (0.3472963553,-3.9696155060)`이며 두 선분 길이는 각각 2입니다. 마지막 점은 경로를 따라 4만큼 뒤지만 원점과의 직선 거리는 **3.9847787924 < 4**입니다. 원점·마지막 점의 중점에 차량 1대를 두면 두 후보까지 각각 **1.9923893962 < 2r**여서 둘 모두 겹칩니다. 다른 2대를 좌우 후보 `(-4,0)`, `(4,0)`에 두면 **사용 가능한 후보는 0개**입니다. 이 예는 실제 타입(`TrackDef.centerline: Vec2[]`, `data-model.md:245`)에 맞는 두 선분이므로 연속 곡선 보간을 가정하지 않습니다.
- 영향: 추가한 폭 검사와 후보 계산을 모두 따른 콘텐츠도 “빈 후보가 늘 있음”을 만족하지 못합니다. 게임 코드가 아직 없어 현재 동작 실패라고 주장하는 것이 아니라, 새 계약의 보장·검사가 충분하지 않다는 사전 분석입니다.
- 정리할 내용: 사용자께서 고른 네 후보 방식을 유지하면서 실제 후보 좌표 간 최소 거리 조건과 체크포인트 배치/뒤 후보 계산 조건을 같은 기준으로 적어야 합니다. 예를 들어 뒤쪽 경로가 휘는 경우를 거부할 것인지, 실제 거리 기준으로 위치를 정할 것인지는 설계에서 정해야 하며 검토자가 임의로 선택하지 않습니다.
- 공유: `msg_4b9af5cc76aa`로 리더에게 전달했습니다. 아래 재현 코드는 파일을 만들지 않습니다.

리더가 이 발견을 SF-8로 접수했습니다(`msg_ef83875f474c`). 후속 수정 제안인 “접선 반대 방향 직선 5r, 후보 간 실제 직선거리 >4r”는 이 반례를 제거할 수 있습니다. 트랙 안 검사에서는 후보 중심만이 아니라 판정용 차체 반지름까지 트랙 경계 안에 들어가는지도 함께 확인해야 안전한 복귀라는 요구와 맞습니다. 이 의견은 현재 revision의 승인이나 후속 수정의 선승인이 아닙니다.

```python
import math
r, width = 1.0, 12.0
a = math.radians(10)
back = (2 * math.sin(a), -2 - 2 * math.cos(a))
candidates = [(0, 0), (-width / 3, 0), (width / 3, 0), back]
cars = [(back[0] / 2, back[1] / 2), candidates[1], candidates[2]]
free = [p for p in candidates if all(math.dist(p, q) >= 2 * r for q in cars)]
assert width / 3 >= 4 * r
assert free == []
```

## 최초 검토 이력 — 이전 revision 기준

아래 본문은 최초 검토의 원문 위치·발견·검사 이력입니다. 현재 판정과 수정 후 위치는 위 “재검증 1” 및 보고서 머리말을 따릅니다.

### Summary

게임 소스와 패키지 설정은 아직 없습니다. 기능 요구사항 97개를 설계·태스크와 대조했으며 런타임 구현 완료로 판정한 요구사항은 0개입니다. 캐릭터 에셋 준비는 확인되지만 게임 안 복제·좌석 배치·동작 재생 검증을 대신하지 않습니다(`spec.md:9`, `spec.md:591`, `_workspace/03_character-rigging.md:85`).

기존 캐릭터 GLB 3개의 파일 이름·크기·SHA-256·스킨·동작 이름은 최종 계약과 일치합니다. 반면 기반 타입 생성 순서, 공개되지 않은 함수의 테스트 순서, 크레딧보다 앞선 공개 배포에는 구현 전 정리가 필요합니다. 패키지 버전·실행 명령·Vite 하위 경로·Actions 버전은 문서끼리 일치합니다.

## 읽은 원문과 적용 기준

- `AGENTS.md:7`을 먼저 읽고 PRD·용어집을 범위·용어 기준으로 삼았습니다. 역할 파일, 프로젝트·공용 CLAUDE.md, `orca-cross-review.md`, 설치된 analyze 오케스트레이터, Orca 실행 안내도 읽었습니다.
- 피처 원문: `spec.md` 전체, `plan.md` 전체, `research.md` 전체, `data-model.md` 전체, `contracts/{overview,modules,events,storage,content-data,assets,static-paths}.md` 전체, `quickstart.md` 전체, `tasks.md` 전체, `checklists/requirements.md` 전체입니다.
- 현재 에셋·제작 근거: `src/assets/models/{chicken-guy,cool-banana-guy,turtle}.glb`, `CREDITS.md`, `SHA256SUMS`, `scripts/rig-characters.py`, `scripts/verify-character-rigs.py`, `.blend` 2개의 존재·크기, `_workspace/03_character-rigging.md`와 `rigging/{build-report,roundtrip-report,gltf-validator-report}.json`입니다.
- `.gitignore`, `.specify` 파일 목록·constitution 템플릿·prerequisites 결과, 실제 Git HEAD를 확인했습니다. `ivi-agent-guide/mistake.md:61` 이후 tasks 교훈도 읽기만 했습니다.
- 과거 `_workspace/01_*`, `02_plan_decisions.md`, `00_*`와 최종 문서의 차이를 결함으로 세지 않았습니다. 이 보고서는 현재 최종 문서와 현재 저장소를 비교합니다.

## FR Implementation Matrix

`PRE-IMPLEMENTATION`은 대응 소스가 아직 없다는 뜻입니다. 미구현 자체를 이 단계의 CRITICAL로 세지 않았으며, 예정 작업의 성립 여부는 아래 지적으로 분리했습니다.

| FR | 범위와 원문 | 대응 예정 파일·태스크 근거 | 상태 |
|---|---|---|---|
| 001~007 | 접속·로딩·오류·화면 방향(`spec.md:304`) | `src/main.ts`, `app/loader.ts`, `render/stage.ts`, `ui/overlays.ts`; `tasks.md:85`, `tasks.md:90`, `tasks.md:228` | PRE-IMPLEMENTATION |
| 008~012 | 시작·차량 선택·동일 성능(`spec.md:314`) | `ui/screens.ts`, `render/showroom.ts`, `sim/vehicle.ts`; `tasks.md:74`, `tasks.md:108` | PRE-IMPLEMENTATION |
| 013~022 | 터치·해제·후진·고정 틱(`spec.md:322`) | `core/loop.ts`, `input/controls.ts`, `platform/lifecycle.ts`; `tasks.md:71`, `tasks.md:104` | PRE-IMPLEMENTATION |
| 023~026 | 3D 화면·카메라·시인성(`spec.md:335`) | `render/stage.ts`, `townView.ts`, `hud.ts`; `tasks.md:87`, `tasks.md:111`, `tasks.md:280` | PRE-IMPLEMENTATION |
| 027~038 | 조작 익히기·진행·위반·재시도(`spec.md:342`) | `practice/drivingLesson.ts`, `scenario.ts`; `tasks.md:110`, `tasks.md:133` | PRE-IMPLEMENTATION |
| 039~043 | 보행자·신호·보행자 시점(`spec.md:354`) | `townActors.ts`, `pedestrianView.ts`, `characters.ts`; `tasks.md:128`, `tasks.md:130`, `tasks.md:142` | PRE-IMPLEMENTATION |
| 044~046 | 세 안전 상황(`spec.md:362`) | `content/scenarios.ts`, `town.ts`; `tasks.md:76`, `tasks.md:138` | PRE-IMPLEMENTATION |
| 047~051 | 완료·레이싱 열림(`spec.md:368`) | `app/session.ts`, `app/flow.ts`, `storage/save.ts`; `tasks.md:79`, `tasks.md:82`, `tasks.md:161` | PRE-IMPLEMENTATION |
| 052~065 | 경기·진행도·복귀·기록(`spec.md:376`) | `race/{race,progress,ai}.ts`, `render/trackView.ts`; `tasks.md:175`, `tasks.md:184` | PRE-IMPLEMENTATION |
| 066~070 | 소리·설정·소리 실패(`spec.md:393`) | `audio/audio.ts`, `content/voice.ts`; `tasks.md:197`, `tasks.md:198`, `tasks.md:265` | PRE-IMPLEMENTATION |
| 071~077 | 일시정지·숨김·동시 사건(`spec.md:401`) | `app/flow.ts`, `core/loop.ts`, `ui/overlays.ts`; `tasks.md:213`~`tasks.md:216` | PRE-IMPLEMENTATION |
| 078~083 | 저장·검사·두 탭(`spec.md:411`) | `storage/save.ts`, `app/flow.ts`; `tasks.md:79`, `tasks.md:161`, `tasks.md:184` | PRE-IMPLEMENTATION; 공유 저장 발견 참조 |
| 084~086 | 개인정보·권한·외부 연결(`spec.md:420`) | `tests/e2e/boot.spec.ts`, `credits.spec.ts`, 금지 패턴 검사; `tasks.md:91`, `tasks.md:232`, `tasks.md:279` | PRE-IMPLEMENTATION |
| 087~090 | 크레딧·자료 표시(`spec.md:426`) | `content/credits.ts`, `ui/screens.ts`; `tasks.md:245`~`tasks.md:247`; 현재 `src/assets/models/CREDITS.md:5` | 에셋 출처 일부 준비, 게임 표시 PRE-IMPLEMENTATION |
| 091~095 | 규칙 순환·콘텐츠 표현(`spec.md:433`) | `content/rules.ts`, `ruleRotation.ts`, 콘텐츠 단계; `tasks.md:78`, `tasks.md:131`, `tasks.md:259` | PRE-IMPLEMENTATION |
| 096~097 | Chicken Guy 행동·탑승객 선택(`spec.md:441`) | 현재 GLB 3개와 `scripts/rig-characters.py:278`; 게임 연결은 `tasks.md:107`, `tasks.md:142` | 에셋 준비, 게임 동작 PRE-IMPLEMENTATION |

## Constitution Compliance

| 규칙 | 준수 여부 | 근거 |
|---|---|---|
| Constitution | **규칙 없음** | 사용자 결정(`spec.md:30`, `spec.md:590`, `plan.md:41`). `.specify/memory/constitution.md:5` 이하 자리표시자는 규칙으로 사용하지 않습니다. |

| AGENTS.md 프로젝트 기준 | 확인 결과 | 근거 |
|---|---|---|
| 프로젝트 범위와 용어 | 아동용 정적 운전·보행 안전 게임으로 검토했습니다. | `AGENTS.md:7`, `docs/PRD.md:30`, `GLOSSARY.md:14` |
| 채택 스택 기준 | TypeScript·Three.js·Vite·Vitest·Playwright 기준으로 대조했습니다. 설치하지 않았습니다. | `AGENTS.md:9`, `plan.md:19`~`plan.md:29` |
| DB·REST·Java 관행 | 항목별 해당 없음: 서버·DB·인증·Controller·JPA·Maven은 제품에 없습니다. state·저장·모듈·이벤트·에셋 계약으로 대신 검토했습니다. | `AGENTS.md:24`~`AGENTS.md:30`, `docs/PRD.md:172`, `plan.md:23`, `contracts/overview.md:4` |
| 원본·공용 가이드 보존 | 검사 중 원본·가이드 수정 없음. 모델 출력은 `src/assets`, 편집본은 `assets-source`로 분리되어 있습니다. | `AGENTS.md:18`, `AGENTS.md:32`, `scripts/rig-characters.py:280`~`scripts/rig-characters.py:287` |
| 자료 표시 | 기존 캐릭터 3종의 출처·라이선스·제작 변경 기록은 있습니다. 최초 공개 배포의 크레딧 선행 조건은 C-003입니다. | `docs/PRD.md:155`, `src/assets/models/CREDITS.md:7`~`src/assets/models/CREDITS.md:13` |
| 검사 증거 구분 | 자동 파일 검사, 과거 Blender 기록, 향후 게임·브라우저·기기·어린이 검사를 구분했습니다. | `AGENTS.md:31`, `plan.md:360`~`plan.md:368` |

## 기존 에셋과 준비 상태

| 실제 파일 | 직접 판독 결과 | 양쪽 근거·결론 |
|---|---|---|
| `chicken-guy.glb` | 282,604 bytes, 스킨 2개·각 27관절, `Armature\|Grounded`, `Armature\|Idle`, `Armature\|Jump`, `Armature\|Sprint`, `Armature\|Walk` | `contracts/assets.md:53`, `contracts/assets.md:85`~`contracts/assets.md:90`, `data-model.md:94`, `src/assets/models/SHA256SUMS:1`과 일치합니다. GLB `/animations/*/name`, `/skins`, `/nodes`를 읽었습니다. |
| `cool-banana-guy.glb` | 650,360 bytes, 스킨 1개·16관절, `Idle`, `RaiseHand`, `LookLeft`, `LookRight`, `Sit` | `contracts/assets.md:54`, `contracts/assets.md:57`, `data-model.md:96`, `src/assets/models/SHA256SUMS:2`와 일치합니다. |
| `turtle.glb` | 145,472 bytes, 스킨 1개·16관절, 위와 같은 5클립 | `contracts/assets.md:55`, `contracts/assets.md:57`, `data-model.md:96`, `src/assets/models/SHA256SUMS:3`과 일치합니다. |
| 캐릭터 공통 | glTF 2.0, 외부 buffer/image URI 없음, 압축 확장 없음 | `contracts/assets.md:45`와 일치합니다. 모든 참조 이미지가 bufferView에 내장되어 있습니다. |
| 생성·검증 스크립트 | 원본 SHA 확인, Chicken Guy 복사, 새 리그 2개 생성, 5클립 검사, `.blend`·SHA 저장 | `scripts/rig-characters.py:20`~`:25`, `:280`~`:287`, `:312`~`:330` ↔ `_workspace/03_character-rigging.md:87`~`:95`. Python 문법은 통과했으며 실행하지 않았습니다. |
| 편집본 | `cool-banana-guy.blend` 371,677 bytes, `turtle.blend` 156,720 bytes 존재 | `_workspace/03_character-rigging.md:32`~`:33` 및 `scripts/rig-characters.py:327`과 경로가 같습니다. Blender로 재개방하지 않았습니다. |
| 저장소 준비 | 현재 `src`에는 GLB 3개·CREDITS·SHA256SUMS만 존재, `package.json` 없음 | `quickstart.md:4`, `tasks.md:55`, `tasks.md:60`과 일치합니다. 차량 5개·게임 소스가 아직 없는 것은 예정 상태입니다. |
| ignore·Spec Kit | `.gitignore:4`의 `modeling/` 제외, GLB·`.blend`는 제외되지 않음. `.specify` 조회가 요청 FEATURE_DIR을 반환 | `plan.md:304`, `AGENTS.md:36`과 일치합니다. 추가 ignore는 `tasks.md:56`의 향후 작업입니다. |

현재 CREDITS의 작품명·제작자·원출처·라이선스는 `docs/PRD.md:151`~`:155`, `data-model.md:279`~`:284`와 일치합니다. CC0는 Cool Bannana Guy뿐이며 두 수정본의 리깅·자세 추가와 Chicken Guy 원본 보존이 기록되어 있습니다. 라이선스의 법적 재평가나 원출처 웹페이지 재조사는 이번 비교 범위가 아닙니다.

기존 `gltf-validator-report.json`의 새 리그 오류·경고 0, Chicken Guy 오류 0·경고 4와 재로딩 기록을 읽었습니다. 이것은 이번 실행의 Blender 재검사 결과가 아닙니다. Chicken Guy의 게임 안 크기 변경·복제는 `tasks.md:116`에서 확인하도록 되어 있습니다.

## CRITICAL Issues

### C-001 — 차량 타입 검사에 필요한 Vec3가 뒤 태스크에서 생성됩니다

- 태스크 쪽: `tasks.md:72`의 T009는 `VehicleKind`·`SeatDef`를 만들고 즉시 `npm run typecheck`를 통과해야 하며 [P]입니다. `Vec3`는 뒤의 T011(`tasks.md:74`)에서 만듭니다.
- 계약 쪽: `data-model.md:80`은 `SeatDef = { pos: Vec3; height: number }`이고 `contracts/modules.md:438`~`:439`은 `Vec3`의 소속을 `src/sim/vehicle.ts`로 정합니다. 콘텐츠에서 타 폴더 타입은 `import type`만 씁니다(`contracts/modules.md:463`).
- 영향: 지정된 소속을 지키면 T009 시점에 가져올 모듈이 없어 타입 검사를 마칠 수 없습니다. [P] 표시는 이 의존성을 더 숨깁니다. `tasks.md:24`, `tasks.md:325`의 검사 후 다음 작업 진행 조건과 함께 성립하지 않습니다.
- 정리할 내용: Vec3 선언을 먼저 준비하는 순서를 명시하거나 공용 주행 타입 준비를 분리해야 합니다. 임의 중복 타입 선언으로 통과시키면 계약 소속과 달라집니다. SF-1과 동일한 발견입니다.

### C-002 — 짝 테스트가 나중에 구현되는 함수에 기대는 두 구간이 있습니다

| 앞 태스크와 요구 검사 | 뒤 태스크·계약 | 영향 |
|---|---|---|
| T016: `tasks.md:79`, storage 7장 두 탭 검사 3건 모두 실행 | `contracts/storage.md:117` 첫 사례는 `finishResult`의 `isNewBest: false`·저장 안 함을 확인합니다. `finishResult` 구현은 T073(`tasks.md:180`)입니다. | T016 시점에는 해당 결과를 만들 함수가 없습니다. 낮은 기록을 `commitSave`로 합치는 테스트만으로 바꾸면 저장 안 함·결과 표시 검사를 대체하지 못합니다. |
| T068: `tasks.md:175`, 체크포인트 통과·복귀 자세 계산 내부 함수를 `progress.test.ts`에서 검사 | `contracts/modules.md:273`은 해당 내부 함수의 시험을 `stepRace`로 하도록 정합니다. `stepRace`는 T071~T072(`tasks.md:178`~`:179`)이며 선행은 다시 T068입니다. | 계약의 공개 함수 경계와 태스크 순서를 모두 지키면서 T068을 통과할 수 없습니다. 검사하려고 내부 함수를 공개하는 것도 계약 변경입니다. |

- 정리할 내용: 지금 존재하는 공개 함수의 단위 검사와 나중에 가능한 연결 검사를 구분하여 배정해야 합니다. 테스트를 생략하거나 만들어지지 않은 함수의 결과를 가짜로 고정하면 검증 근거가 되지 않습니다. progress 사례는 SF-1과 같습니다.

### C-003 — 크레딧이 준비되기 전에 첫 공개 배포를 요구합니다

- 요구사항 쪽: `spec.md:221`은 크레딧을 공개 배포의 필수 조건으로 정하고, `spec.md:426`~`:429`은 시작 화면에서 열 수 있는 모델 8종의 크레딧과 변경 표시를 요구합니다.
- 태스크·저장소 쪽: T029(`tasks.md:92`)는 T007·T028만 선행으로 삼아 모델 8종을 포함한 결과물을 main에 푸시하고 GitHub Pages 공개 주소의 성공을 검사합니다. 크레딧 데이터·화면·검사는 T094~T096(`tasks.md:245`~`:247`)에서야 생깁니다. 현재 `src/assets/models/CREDITS.md:3`~`:13`은 캐릭터 3종 제작 기록이며 게임 화면도, 차량 5종 표시도 아닙니다. 빌드 에셋 표는 GLB·SVG·MP3만 수집합니다(`tasks.md:85`).
- 영향: 정해진 순서의 첫 공개 배포에는 요구된 게임 크레딧이 없습니다. 배포 파이프라인을 일찍 연결하는 설계(`plan.md:441`)와 공개 배포 조건을 구분해야 합니다.
- 정리할 내용: 공개 주소 검증 전에 필요한 최소 크레딧을 준비하거나, 공개 배포 시점을 그 선행 조건 뒤로 명확히 옮기는 결정을 해야 합니다. 어느 문서를 우선할지는 이 검토가 임의로 정하지 않습니다. SF-4a와 같습니다.

## WARNING Issues

### W-001 — 금지 패턴 검사의 범위와 href 조건이 계약보다 넓습니다

- 태스크 쪽: T112(`tasks.md:279`)와 메모(`tasks.md:403`)는 “코드 파일만, 문서·테스트 제외”라고 하지만 실제 첫 명령은 `grep -rnE ... src/ index.html`로 확장자 제한 없이 에셋과 `src/assets/models/CREDITS.md`도 읽습니다. `href`라는 부분 문자열도 모두 금지합니다.
- 계약 쪽: 금지 대상은 게임 밖으로 나가는 링크와 `<a href>`입니다(`spec.md:422`, `contracts/overview.md:26`, `contracts/static-paths.md:58`, `:66`). SVG는 허용된 그림 형식입니다(`contracts/assets.md:101`~`:105`).
- 재현: 메모리 문자열 `<svg><use href="#icon"/></svg>`를 같은 `href` 패턴으로 검사하면 grep 종료 0·일치입니다. 외부 링크가 없는 같은 SVG 내부 참조도 탈락합니다. 현재 에셋의 해당 패턴 검색은 0건(종료 1)이므로 “이미 통과 불가능”이라고 단정하지 않습니다.
- 영향·정리: 정상적인 그림·문서 문자열 때문에 구현자가 불필요하게 에셋을 바꿀 수 있습니다. 검사 파일 범위를 실제 코드로 한정하고 외부 링크는 이미 계획된 `a[href]` 검사와 구분해야 합니다. 매치 없음의 grep 종료 코드는 1이므로 일반 “종료 0” 규칙(`tasks.md:24`)의 예외도 명시할 필요가 있습니다.

### W-002 — 트랙을 확정하면 초기 키 고정 테스트가 실패할 수 있습니다

- 앞 태스크: T018(`tasks.md:81`)은 실제 `TRACK`에 대해 `trackConfigKey(TRACK) === 'main:1:2'`를 검사합니다.
- 뒤 태스크·계약: T115(`tasks.md:282`)는 중심선·체크포인트·바퀴 수를 확정하고 모양이나 바퀴 수가 바뀌면 revision을 올린 뒤 `npm test`를 실행합니다. 같은 규칙이 `contracts/content-data.md:53`, `data-model.md:255`에 있습니다. T115의 변경 파일에는 `race.test.ts`가 없습니다.
- 영향: 예를 들어 정상적인 조정으로 revision 2가 되면 실제 키는 `main:2:2`인데 초기 테스트는 옛 키를 계속 요구합니다. 조정하지 않는 경우에만 문제가 드러나지 않습니다.
- 정리할 내용: 키 함수의 예시 검사는 독립적인 입력으로 두거나, 트랙 설정 변경 시 그 테스트도 함께 갱신하도록 작업 범위를 명시해야 합니다.

## INFO Issues

### I-001 — “CREDITS.md와 내용 일치”의 범위가 실제 파일과 다릅니다

- 태스크: T094(`tasks.md:245`)는 모델 8행을 생성하고 `src/assets/models/CREDITS.md`와 내용 일치를 요구하되 그 파일을 변경 대상으로 적지 않습니다.
- 실제 파일·계약: 현재 문서는 캐릭터 3종만 담고 차량은 아직 없다고 적습니다(`src/assets/models/CREDITS.md:3`~`:9`). Chicken Guy는 제작 단계에서 원본을 그대로 사용했다는 문구이고, 게임의 변경 문구는 정규화·관절 조작까지 포함합니다(`contracts/assets.md:120`~`:122`). 파일 이름·출처·라이선스 사실 자체는 서로 맞습니다.
- 영향·정리: 제작 기록과 게임 실행 시 변경을 섞어 전체 문장을 같게 만들 필요는 없습니다. 비교 대상이 공통 3종의 출처·라이선스·제작 변경 사실인지, 8종 전체 문서 갱신인지 적으면 불필요한 수정이나 거짓 완료를 막을 수 있습니다.

### I-002 — “저장소에 커밋이 없다”는 준비 문구가 현재 HEAD와 다릅니다

- 문서 쪽: `plan.md:3`, `plan.md:332`, `quickstart.md:91`, `tasks.md:394`는 첫 커밋을 아직 필요한 준비로 기술합니다.
- 저장소 쪽: `git rev-parse HEAD` 결과는 `2739ec03cb19385b4b0bc4494550a594f976fa01`이고 요청된 snapshot을 정상 계산했습니다. 저장소가 이미 커밋을 가진 상태라는 작업 요청과 같습니다.
- 영향·정리: 새로 초기 커밋을 만드는 작업으로 오해하지 않도록 현재 상태를 구분해 기록하면 됩니다. 이것을 이유로 검토를 BLOCKED로 하거나 임의 커밋을 만들지 않았습니다.

## 요청받은 집중 점검 결과

| 항목 | 결과 | 근거 |
|---|---|---|
| 세 상황 자리표시·타입 골격 | D6·D7이 타입의 **소속 파일**을 바꾸지는 않습니다. `ScenarioEvent`·`SignalState`·`PedestrianViewState`의 위치도 계약과 같습니다. 다만 전체 기반 타입 순서에는 C-001이 있습니다. | `tasks.md:46`~`:47`, `:76`, `:83`~`:84` ↔ `contracts/modules.md:442`~`:451`, `:164`~`:168` |
| 콘텐츠 검사 번호 | 1~23 모두 배정되어 있으며 누락 없음. #14의 데이터·GLB 분할은 의도적인 두 부분입니다. #10은 순환 함수 T046 뒤 T047, #20은 DRIVING_SPEC T011 뒤 T012라 맞습니다. | `contracts/content-data.md:92`~`:114` ↔ 아래 배정표 |
| 완성 검사 skip | #8·#21·#22·#23은 T097에서 skip, T100·T102·T105·T108에서 각각 해제합니다. 콘텐츠 전 존재하지 않는 그림·음성 때문에 앞 단계가 막히는 구조는 아닙니다. | `tasks.md:257`~`:268` ↔ `contracts/content-data.md:88`, `:99`, `:112`~`:114` |
| 좌석과 Sit | T042는 먼저 계약의 idle·좌석 배치를 검사하고 Sit 필요 시 확인하도록 합니다. Sit이 에셋에 있다고 자동으로 필수 기능이 되지는 않습니다. 불필요한 선행 조건이나 모순은 확인하지 못했습니다. | `tasks.md:107`, `:116` ↔ `data-model.md:94`~`:96`, `_workspace/03_character-rigging.md:47`~`:49` |
| ActorPlan 잠정 문구 | T052 검사는 ActorPlan·해당 Open Issue·시그니처 행으로 범위가 제한되어, 다른 “잠정”을 남길 수 있습니다. 문서 전체 0건 검색 문제는 없습니다. 시그니처를 실제로 바꾸면 관련 콘텐츠 계약도 별도 대조해야 합니다. | `tasks.md:137` ↔ `data-model.md:184`, `:999`, `contracts/modules.md:151`; 추가 참조 `contracts/content-data.md:47` |
| data-pressed | 모듈 반환값·상태·저장 형식을 바꾸지 않는 조작 UI 내부 속성입니다. 이 추가만으로 계약 위반이라고 보지 않습니다. 입력 해제의 실제 동작과 표시가 함께 변하는지는 구현 후 T041·T087·T120에서 확인해야 합니다. | `tasks.md:43`, `:106`, `:115`, `:216` ↔ `contracts/modules.md:49`~`:62`, `contracts/static-paths.md:78`~`:80` |
| 캐릭터 준비 완료 반영 | plan 준비 단계, quickstart, T006 모두 차량 5종만 받으며 캐릭터 3종은 덮어쓰지 않습니다. 최종 캐릭터 체크섬도 같습니다. | `plan.md:305`, `:440` ↔ `quickstart.md:46`~`:78` ↔ `tasks.md:60` |
| 금지 패턴 게이트 | 현재 src에서는 일치 없음. 미래 SVG 내부 href를 잘못 잡을 수 있고 실제 명령은 문서·바이너리를 제외하지 않아 W-001로 기록했습니다. | `tasks.md:279`, `:403` ↔ `contracts/assets.md:101`, `contracts/overview.md:26` |

| 콘텐츠 검사 번호 | 태스크 |
|---|---|
| 1~7, 9 | T015 |
| 8 | T097 skip → T100 해제 |
| 10 | T047 |
| 11, 13 | T010 |
| 12 | T023 |
| 14 | T010 데이터 / T023 실제 GLB |
| 15, 17 | T055 |
| 16 | T014 |
| 18 | T017 |
| 19 | T094 |
| 20 | T012 |
| 21 | T097 skip → T102 해제 |
| 22 | T097 skip → T105 해제 |
| 23 | T097 skip → T108 해제 |

## 명령·버전·파일 구조 대조

| 비교 대상 | 결과·근거 |
|---|---|
| 패키지 6개 | three 0.186.1, @types/three 0.186.0, TypeScript 7.0.2, Vite 8.3.1, Vitest 5.0.2, Playwright 1.63.0 일치(`plan.md:19`~`:25`, `research.md:20`~`:45`, `quickstart.md:26`~`:27`, `tasks.md:55`). 설치 가능 여부·최신성은 이번 검사에서 재조회하지 않았습니다. |
| npm scripts | dev/typecheck/test/build/preview/test:e2e 이름·명령이 일치(`plan.md:405`~`:412`, `research.md:220`, `quickstart.md:98`~`:103`, `tasks.md:35`, `:55`). |
| Vite·Vitest | `/driving_game/`, SVG 인라인, unit include, node 환경 일치(`tasks.md:58`, `plan.md:324`, `:414`, `contracts/static-paths.md:32`). |
| TypeScript 설정 | strict/noEmit/bundler/vite-client, src·tests include, config 제외·skipLibCheck가 계획과 충돌하지 않습니다(`tasks.md:57`, `plan.md:86`, `research.md:42`). 구체 target/lib는 T003에서 정하며 실제 설정 파일은 아직 없습니다. |
| Playwright | Chromium·WebKit 가로·hasTouch, build+preview·4173·strictPort·하위 baseURL 일치(`tasks.md:59`, `plan.md:363`, `:368`, `:412`). 두 기기 preset 이름은 tasks에서 구체화한 값으로, 다른 원문에 반대 값은 없습니다. 실제 preset 존재·WebGL2 동작은 실행 전입니다. |
| GitHub Actions | checkout v7.0.1 / setup-node v7.0.0 / configure-pages v6.0.0 / upload-pages-artifact v5.0.0 / deploy-pages v5.0.1 및 Node 24가 일치(`tasks.md:92`, `plan.md:328`~`:331`, `research.md:52`~`:59`). |
| 설정 변경 조건 | TypeScript 6.0.3 대안, Vite 8.3.3 이상 변경·그 전 --host 금지 조건 일치(`tasks.md:57`, `:281`, `plan.md:469`, `quickstart.md:105`). |
| 모듈·테스트 경로 | modules.md에 적힌 src TypeScript 경로가 모두 tasks에 있습니다. unit 파일은 `tests/unit/*.test.ts`, 브라우저 파일은 `tests/e2e/*.spec.ts`로 계획과 맞습니다(`plan.md:81`~`:153`, `contracts/modules.md:433`~`:463`, `tasks.md:71`~`:290`). 타입 소속은 modules.md가 최종 기준이며 계획의 session.ts 주석에 남은 PlaySession 표기(`plan.md:96`)는 계약·tasks의 flow.ts 소속과 다릅니다(`contracts/modules.md:340`, `:457`, `tasks.md:90`); 이 표기 차이는 별도 중대 결함으로 세지 않았습니다. |

## 실행 검사 기록

모든 명령은 PROJECT_ROOT에서 실행했습니다. 모델 체크섬만 아래처럼 하위 폴더에서 실행했습니다.

| 명령 | 종료 코드 | 결과·한계 |
|---|---|---|
| `python3 ivi-agent-guide/scripts/review-snapshot.py /Users/kyw/Documents/git/mine/driving_game /Users/kyw/Documents/git/mine/driving_game/specs/001-kids-driving-safety-game` | 0 (전·후) | 요청 revision과 일치. 보고서 디렉토리 제외는 기존 snapshot 도구 규칙입니다. |
| `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` | 0 | FEATURE_DIR 정확, research/data-model/contracts/quickstart/tasks 조회됨. |
| `(cd src/assets/models && shasum -a 256 -c SHA256SUMS)` | 0 | chicken-guy, cool-banana-guy, turtle 모두 OK. |
| `python3 - <<'PY'` 읽기 전용 GLB 검사 | 0 | struct/json으로 GLB 헤더·JSON 청크·animations·skins·내장 이미지 읽기, hashlib로 SHA 계산 후 계약·quickstart·기존 재로딩 해시 대조. AST로 두 Python 스크립트 구문 검사. `.blend` 존재·크기 확인. 게임 .ts·package.json 부재 확인. |
| `python3 - <<'PY'` 읽기 전용 문서 검사 | 0 | 태스크 123개가 T001~T123 연속·고유, 콘텐츠 23항목 배정, 계약 모듈 경로 전부 tasks에 존재, 버전·Actions 문자열 대조. 이 검사는 문서 검사이지 구현 테스트가 아닙니다. |
| `git status --short`, `git rev-parse HEAD` | 0 | 시작 시 작업 트리 변경 없음, 위 HEAD 확인. |
| `git check-ignore -v modeling/ src/assets/models/turtle.glb assets-source/characters/turtle.blend` | 0 | modeling/만 제외됨. 양성·음성 출력으로 경로별 결과 확인. |
| `grep -rnE "innerHTML\|outerHTML\|insertAdjacentHTML\|eval\(\|new Function\|href" src/` (표의 `\|`는 Markdown 구분자 이스케이프이며 실제 ERE는 `|`) | 1 | 현재 src에 해당 문자열 없음. `index.html`은 아직 없어 T112 전체 명령을 완료 검사로 실행하지 않았습니다. Python subprocess로 원문의 ERE를 그대로 전달했습니다. |
| `python3` 읽기 전용 복귀 좌표 예제 | 0 | width=12, bodyRadius=1, 후보 (0,0), (-4,0), (4,0)에 다른 차 3대를 각각 놓으면 사용 가능한 후보 0개입니다. SF-5를 독립 확인했습니다. 게임 코드 테스트는 아닙니다. |
| npm / Vitest / Playwright | 미실행 | package.json·의존성·게임 소스 없음. 이 단계의 예상 상태라 사전 분석을 BLOCKED로 만들지는 않으며, 게임 검사 통과로도 보고하지 않습니다. |
| Blender 재로딩·리깅 생성 | 미실행 | 요청된 읽기 전용 범위. 검증 스크립트도 `scripts/verify-character-rigs.py:95`~`:96`에서 증거 파일을 다시 씁니다. |
| 실제 기기·어린이 관찰 | 미실행 | 게임 구현 후 수행할 T120·T121이며 자동 파일 검사가 대체하지 않습니다. |

## 다른 역할과 공유한 발견·처리 이력

| 공유 | 원 메시지 / 수신 메시지 | 이 역할의 처리 |
|---|---|---|
| 시작 확인 | `msg_159b58b8e5ba` | AGENTS 선독·프로젝트 기술 기준 적용·동일 revision을 status로 회신했습니다. |
| 자체 순서 발견 | `msg_f180a762c745` | Vec3, T016의 finishResult, T068의 stepRace 의존을 리더에게 전달했습니다. |
| SF-1 | artifact `msg_be83c842dde3` / `msg_e44be36e13ca` | C-001·C-002와 동일. `msg_b9500b25b9c1`로 반영 응답했습니다. |
| SF-3 | boundary `msg_7638cd15dd10` / `msg_4bdfa0fbdca4` | `data-model.md:642`의 ok:false → 기본값과 `contracts/storage.md:80`의 읽기 성공·시험 쓰기 실패 → 읽은 값 유지가 다릅니다. T016의 실패 검사와 T065의 부팅 처리에 영향이 있습니다(`tasks.md:79`, `:161`). 어느 쪽을 선택하지 않고 boundary 발견으로 보존하며 `msg_b9500b25b9c1`로 응답했습니다. |
| SF-4a | artifact `msg_224de615d1b8` / `msg_473fb923e59e` | C-003과 동일. `msg_0ca5d06df422`로 반영 응답했습니다. |
| SF-4b | 위와 같음 | `spec.md:416`, `:568`의 두 탭 기록 악화 0건과 `data-model.md:798`, `contracts/storage.md:63`의 동시 쓰기 한계가 다릅니다. `contracts/storage.md:117`~`:119`의 순차 테스트만으로 두 탭이 동시에 읽고 쓰는 경우를 보장할 수 없습니다. 원 역할의 발견으로 보존하며 `msg_0ca5d06df422`로 응답했습니다. |
| SF-5 | boundary `msg_6d72619280b8` / `msg_99bdccc60ec7` | `data-model.md:950`의 복귀 후보 3칸이 다른 차 3대로 모두 차면 안전한 후보가 없음을 읽기 전용 계산으로 확인했습니다. `spec.md:293`, `:385`는 겹치지 않는 복귀를 요구하며 T068·T072(`tasks.md:175`, `:179`)에 이 경우의 결과·검사가 없습니다. 원 역할의 발견으로 보존하고 임의의 복귀 규칙은 만들지 않았습니다. |
| SF-6 | boundary `msg_a30ba12d2957` / `msg_4a8d7a683975` | `spec.md:413`, `plan.md:238`은 저장 읽기 실패에도 실행당 1회 안내를 요구합니다. 그런데 `contracts/events.md:86`, T077(`tasks.md:184`)은 완주 때 `loadSave(key).data.best`만 소비하고 ok:false를 확인하지 않습니다. 부팅 후 읽기만 실패하고 이번 기록이 run.best보다 느려 `isNewBest=false`이면 commitSave도 호출되지 않아 오류 안내에 도달하지 않는 경로입니다. T065(`tasks.md:161`)의 부팅 처리와 T077의 commitSave 실패 처리로는 이 경로를 검사할 수 없습니다. boundary의 W-01을 원 발견으로 보존합니다. |
| SF-7 | artifact `msg_2ecfc294439d` / `msg_9878a98e0734` | `spec.md:570`은 무음과 모든 음원 로딩 실패 각각에서 시작~레이싱 완주를 요구하며 `plan.md:391`은 음원 경로 차단 후 완주를 Playwright에 배정합니다. T083(`tasks.md:201`)은 drivingLesson 진입까지만, T120(`tasks.md:287`)은 무음 상태만 검사합니다. T123(`tasks.md:290`)이 참조하는 quickstart의 S2는 소리 끄기(`quickstart.md:136`), S7은 GLB 실패(`quickstart.md:199`)라 음원 전부 실패 상태 완주를 대체하지 않습니다. artifact W-002의 검증 누락을 보존합니다. |

검토자는 위 차이의 정답을 임의로 정하거나 원문을 수정하지 않았습니다. 문서·코드 수정이 이루어지면 새 revision으로 같은 세션에서 다시 확인해야 합니다.
