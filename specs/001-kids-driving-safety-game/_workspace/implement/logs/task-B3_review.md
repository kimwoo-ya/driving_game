# Task B3 Code Review Report

- 검토일: 2026-10-12
- run / task / dispatch: `run_43739cd2a087` / `task_3690285f95db` / `ctx_dafb46e82e38`
- 실제 도구 / 세션 handle: Codex / `term_f9cb362f-6bbc-44da-ae70-7ab4aab20534` (B1·B2와 같은 세션)
- PROJECT_ROOT: `/Users/kyw/Documents/git/mine/driving_game`
- FEATURE_DIR: `/Users/kyw/Documents/git/mine/driving_game/specs/001-kids-driving-safety-game`
- 단계 / 검토 태스크: speckit implement / B3 T022~T029 및 B2 비필수 개선 제안 2건 반영
- revision 요청값: `c9e9bbe74d401125e79175b37a72d0104a2871b6a43713acfac284b4d22b196d`
- revision 읽기 전: `c9e9bbe74d401125e79175b37a72d0104a2871b6a43713acfac284b4d22b196d`
- revision 테스트 후: `c9e9bbe74d401125e79175b37a72d0104a2871b6a43713acfac284b4d22b196d`
- 원문 및 코드 근거(파일:라인): 아래 태스크별 표·검토 내용. 소스는 PROJECT_ROOT, 피처 문서는 FEATURE_DIR 기준.
- 실행한 테스트 명령 / 종료 코드 / 결과: 아래 직접 실행 기록. 타입 검사·재설치·전체 테스트 74건·빌드·E2E 8건 통과.
- 검증 상태: **COMPLETE**
- 역할 판정: **APPROVE with comments** — T022~T029 각각 APPROVE. 필수 수정 0건, 비필수 테스트 개선 제안 1건.
- 미해결 질문·지적 / 이전 지적 처리 결과: 차단 질문·필수 지적 없음. B2 제안 2건 반영 확인. validator가 지적한 T022 진행률 수정 및 추가 테스트 확인. 아래 신규 제안은 승인 조건이 아닙니다.

## 판정: APPROVE with comments

## 시도: 1/2

같은 revision의 validator COMPLETE/PASS를 확인한 후 변경 코드·테스트·배포 설정을 직접 검토했습니다. 현재 구현에서 반드시 수정해야 할 코드 품질 문제는 발견하지 못했습니다. 기능 요구사항 전체의 충족 여부는 다시 판정하지 않았습니다.

## 적용 기준과 범위

앞서 AGENTS.md를 역할 파일보다 먼저 읽은 같은 세션입니다. PRD·용어집·빈 constitution 처리 및 전체 필수 설계 원문을 유지하고, B3 구현 로그·validator의 질문/수정 이력·변경 파일을 추가로 읽었습니다. TypeScript/three.js 정적 게임의 구조·보안·에셋 규칙을 기준으로 했으며 Java/Spring/DB/REST 규칙은 해당하지 않습니다(`contracts/overview.md:4`, `:24`, `:25`, `:26`, `plan.md:156`, `:335`).

현재 부팅·로딩·시작 화면의 기반만 추가하는 묶음입니다. 시작 버튼의 게임 진입 연결, 저장 불가 안내, 로딩 실패 안내·재시도 화면, 앱 전환·컨텍스트 손실 시 흐름 제어는 명시된 후속 태스크 범위로 구분했습니다(`tasks.md:91`). 검토자가 작성한 파일은 이 보고서 하나이며 소스·명세·records·에셋을 수정하지 않았습니다.

## 태스크별 판정

| 태스크 | 판정 | 코드 품질 근거 |
|---|---|---|
| T022 로더 | APPROVE | `src/app/loader.ts:7`에서 빌드가 만든 URL만 사용하고, `:26`의 단일 다운로드 함수에 HTTP·본문·네트워크 실패 처리를 모았습니다. `:29`의 AbortController와 `:62`의 finally가 정체 타이머를 정리합니다. `:69`의 묶음 처리·`:119`의 실패 파일 재시도·`:128`의 소리 Promise 캐시가 역할별로 나뉘며 별도 이벤트 버스나 설정 체계를 추가하지 않았습니다. 로더 9건을 포함한 전체 테스트 통과. 아래 소리 테스트의 비필수 제안 1건이 있습니다. |
| T023 GLB 콘텐츠 검사 | APPROVE | `tests/unit/content.test.ts:66`의 모델 URL 검사와 `:70`의 실제 클립 이름 검사는 데이터와 파일의 연결을 확인합니다. `:138`의 JSON 추출은 테스트 안에만 있으며 런타임 로더를 복제하지 않습니다. 새 의존성을 추가하지 않았고 전체 콘텐츠 검사 16건이 통과했습니다. |
| T024 Stage | APPROVE | `src/render/stage.ts:19`에서 생성 실패를 null로 반환하고 조명·리사이즈·컨텍스트 통지를 렌더러 안에 모았습니다. `:52`의 follow는 공통 주행 크기와 받은 Pose만 사용하며 게임 state를 변경하지 않습니다. 이 메서드는 계약이 허용한 렌더러 내부 재량과 T024의 카메라 책임에 필요한 진입점으로 보았습니다(`contracts/modules.md` 9장). 앱마다 Stage 하나를 만드는 현재 수명에 맞는 단순한 구조입니다. |
| T025 모델 준비·복제 | APPROVE | `src/render/models.ts:15`의 파싱·정규화·보관 순서가 한 함수에 있고 차량 합치기는 `:49`의 내부 함수입니다. 합치기 전에 geometry를 복제해 원본을 수정하지 않고, 합치기 실패 시 `:68`에서 기존 재질의 메시를 보존합니다. `:40`은 스킨 유무에 따라 뼈대 복제를 선택합니다. 실제 모델 8개 준비가 두 브라우저의 start 진입으로 확인됐습니다. |
| T026 시작 화면 셸 | APPROVE | `src/ui/screens.ts:4`는 에셋 표의 URL 또는 CSS 도형을 사용하고, `:18`은 DOM API로 실제 button을 만들며 `aria-label`을 제공합니다. `replaceChildren`로 이전 UI를 교체하고 HTML 문자열을 실행하지 않습니다. `src/style.css:24`의 버튼은 명시적인 크기와 그림으로 표시합니다. |
| T027 부팅·흐름 골격 | APPROVE | `src/main.ts:9`에서 브라우저 진입점을 분리하고 `src/app/flow.ts:61`의 화면 전환이 DOM 관찰 속성을 함께 갱신합니다. `:67`의 준비 실패를 loadFailed로 처리하고 `:78`의 관찰 getter는 e2e 쿼리에서만 노출합니다. run/storageOk·빈 버튼 콜백은 후속 연결 작업임이 명시되어 있어 임의로 제거할 미사용 코드로 보지 않았습니다. |
| T028 부팅 E2E | APPROVE | `tests/e2e/boot.spec.ts:5`에서 페이지 스크립트 전에 상태 관찰을 설치하고 이전 속성값을 기록해 같은 작업 안의 boot→loading 전환을 놓치지 않습니다. `:22`, `:33`, `:41`에서 시작 화면·새로 고침·외부 요청을 검사합니다. 두 브라우저 8/8 통과입니다. |
| T029 배포 설정 | APPROVE | `.github/workflows/deploy.yml:3`의 트리거·`:8`의 필요한 권한·`:13`의 배포 동시 실행 제어·`:24`의 고정된 액션 버전이 승인된 설계와 맞습니다. 사용자 입력이나 이벤트 문자열을 shell 명령에 삽입하지 않습니다. 로컬 재설치·전체 테스트·빌드가 통과했으며 실제 푸시·배포는 수행하지 않았습니다. |

## 이전 제안과 validator 수정 확인

- B2 시간 상수 이름: `src/content/rules.ts:26`의 `PLACEHOLDER_CARD_TICKS`로 반영됐고 모든 규칙 행이 새 이름을 사용합니다.
- B2 콘텐츠 인덱스 검사: `tests/unit/content.test.ts:99`에서 segment·afterStep 모두 정수·0 이상을 확인한 뒤 배열 범위를 검사합니다.
- validator의 진행률 지적: `src/app/loader.ts:39`의 크기 통지와 `:76`의 받은 바이트 합 계산으로 바뀌었습니다. `tests/unit/loader.test.ts:95`에서 큰 파일의 크기를 아는 경우와 모르는 경우를 나눠 검사합니다. 같은 revision의 validator PASS와 이번 전체 테스트 74건으로 수정 상태를 확인했습니다.

## 개선 제안 — 승인 조건 아님

**T022, `tests/unit/loader.test.ts:72`: 소리 결과의 전체 키가 임시 파일 하나뿐이라고 가정하지 않으면 좋겠습니다.** 테스트는 실제 `ASSET_URLS`에 임시 소리 2개를 더하고 bad 파일 외에는 모두 성공하도록 fetch를 바꿉니다(`:66`~69). 현재 실제 소리 파일은 없어 통과하지만, 예정된 음원 파일을 추가하면 정상 파일이 Map에 더 들어와 이 기대값이 실패합니다. `map.has('audio/sfx/ok.mp3')`가 true, bad가 false인지 확인하거나 테스트의 소리 목록만 따로 고정하면 됩니다. 현재 런타임 결함은 아니므로 지금 반영하지 않아도 APPROVE이며, 음원 추가 때 함께 정리할 수 있습니다.

코드·테스트를 바꾸면 새 revision의 validator 확인 뒤 reviewer에 전달하는 기존 순서를 따릅니다.

## 보안·불필요 코드·변경 범위

- 앱의 fetch 입력은 저장값·사용자 문자열이 아닌 Vite 에셋 표에서만 가져옵니다(`src/app/loader.ts:27`, `:36`). 두 브라우저 부팅 검사에서 외부 요청은 0건입니다. DOM 생성에 innerHTML·eval·외부 링크·권한 API를 사용하지 않습니다.
- 모델 병합·정규화는 렌더링 데이터만 다룹니다. 렌더러를 순수 로직이 import하거나 모델 상자 크기를 게임 state에 되돌리는 경로가 없습니다.
- 모델 보관 Map, cloneModel, Stage.follow는 이후 화면 렌더링에서 사용할 명시된 기반이며 현재 작성 범위에 속합니다. 재시도·장면 교체 수명 관리가 추가되지 않은 단계에서 범용 자원 관리자나 추가 추상화를 요구하지 않았습니다.
- 기록 파일은 실제 도구 확인 결과를 추가하고 tasks.md는 이전 묶음 완료 표시를 반영했습니다. 제공 원본 모델·공용 가이드·의존성을 변경하지 않았습니다.

## 직접 실행 기록

| 명령 | 종료 코드 | 결과 |
|---|---|---|
| 표준 snapshot 명령(읽기 전 / 테스트 후) | 0 / 0 | 모두 상단 revision과 일치 |
| `npm run typecheck` | 0 | 통과 |
| `npm test` (최초 읽기 후) | 0 | 7 files, 74 passed |
| `npm ci` | 0 | 49 packages added, 50 audited, vulnerabilities 0. fsevents allowScripts 경고는 있었으며 이후 검사 정상 |
| `npm test` (재설치 후) | 0 | 7 files, 74 passed |
| `npm run build` | 0 | GLB 8개·CSS·단일 JS 생성. JS 621.56 kB, gzip 157.43 kB |
| `npm run test:e2e -- tests/e2e/boot.spec.ts` | 0 | 8 passed(2.5초), WebGL2 chromium·webkit 모두 true |
| 아래 순수 폴더·소스·HTML 금지 패턴 검사 | 1 각각 | 일치 0건(기대 결과) |

```sh
python3 ivi-agent-guide/scripts/review-snapshot.py /Users/kyw/Documents/git/mine/driving_game /Users/kyw/Documents/git/mine/driving_game/specs/001-kids-driving-safety-game
rg -n 'Date\.now|setTimeout|setInterval|Math\.random|from .three|document\.|window\.|AudioContext' src/sim src/practice src/pedestrianView src/race src/storage src/content
rg -n --glob '*.ts' 'innerHTML|outerHTML|insertAdjacentHTML|eval\(|new Function|getUserMedia|geolocation|requestPermission|DeviceMotionEvent|https?://' src
rg -n '<a[ >]|innerHTML|eval\(|https?://' index.html
```

재설치 뒤 전체 테스트와 빌드를 확인해 T029의 로컬 검사 조건도 충족했습니다. 500 kB 청크 경고는 승인된 단일 JS 청크 결정(`contracts/static-paths.md:33`)에 따라 기록하고 임의 코드 분할이나 경고 숨김 설정을 요구하지 않았습니다. 크기만으로 모바일 성능 통과를 판단하지 않습니다.

## 남은 확인과 조율 이력

- 실제 모델 방향·재질 표현·탑승객 배치, 실제 기기 성능, 교육 콘텐츠, GitHub Actions 실행·공개 배포는 이번에 확인하지 않았습니다. 아직 시작 버튼 이후 플레이 흐름은 후속 작업입니다.
- B3 요청 `msg_0491d7f67724`, 수신 status `msg_f898b4534ae9`입니다.
- B2 제안 2건은 처리 완료입니다. 새 필수 수정 요청과 미해결 질문은 없습니다. 같은 Dispatch에서 다음 묶음 또는 close-review를 기다립니다.
