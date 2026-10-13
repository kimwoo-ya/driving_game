# Task B3 Validation Report

- 검토일: 2026-10-12
- run / task / dispatch: `run_43739cd2a087` / `task_1b6723135279` / `ctx_4831dedae27b`
- 실제 도구 / 세션 handle: Codex / `term_afd8a2fc-574b-4c26-affd-7a09efcd8c4e` (B1·B2와 동일)
- PROJECT_ROOT: `/Users/kyw/Documents/git/mine/driving_game`
- FEATURE_DIR: `/Users/kyw/Documents/git/mine/driving_game/specs/001-kids-driving-safety-game`
- 단계 / 검토 태스크: speckit implement / B3 T022~T029 + B2 reviewer 비필수 제안 2건
- revision 요청값: `c9e9bbe74d401125e79175b37a72d0104a2871b6a43713acfac284b4d22b196d`
- revision 읽기 전: `c9e9bbe74d401125e79175b37a72d0104a2871b6a43713acfac284b4d22b196d`
- revision 테스트 후: `c9e9bbe74d401125e79175b37a72d0104a2871b6a43713acfac284b4d22b196d`
- 검증 상태: **COMPLETE**
- 역할 판정: **PASS** — T022~T029 각 PASS. 진행률 수정 확인.
- 시도: 검증 2회, 수정 재시도 1회, T022 FAIL 이력 1회(해결).
- 원문 및 코드 근거: 아래 태스크별 표 및 FAIL 상세(소스 경로는 PROJECT_ROOT, 피처 문서는 FEATURE_DIR 기준).
- 실행한 테스트 명령 / 종료 코드 / 결과: 최신 재검증에서 로더 9/9·전체 74/74·E2E 8/8·타입·빌드·진행률 독립 브라우저 assert 모두 종료 0. 최초 실패 기록은 아래 보존.
- 미해결 질문·지적 / 이전 지적 처리 결과: 없음. 질문 `msg_b78bc32cbd0b`의 답변대로 전체 바이트 기준 수정과 미상 크기 혼합을 확인했습니다. T022 지적 해결, B2 저장 수정도 전체 테스트에서 통과.

## 최신 재검증 — 진행률 수정 뒤 PASS

재검증 요청 `msg_fe1b038c7ea9`에 대해 `msg_ed8b305f0ecc`로 수신·revision 일치를 회신했습니다. 수정된 loader 전체와 추가 테스트를 직접 읽었습니다. `src/app/loader.ts:39`~40은 헤더 크기를 즉시 알리고, `:67`~98은 받은 바이트 합·크기 합·파일 수로 합의한 진행률을 계산합니다. `tests/unit/loader.test.ts:95`~122는 크기를 아는 큰 파일과 모르는 큰 파일의 두 경우를 추가했습니다.

| 새 revision에서 직접 실행 | 종료 코드 | 결과 |
|---|---|---|
| snapshot 표준 명령(읽기 전 / 테스트 후) | 0 / 0 | 상단 새 revision과 일치 |
| `npm run typecheck` | 0 | 통과 |
| `npm test -- tests/unit/loader.test.ts` | 0 | 9 passed |
| `npm test` | 0 | 7 files, 74 passed |
| `npm run build` | 0 | JS·CSS·GLB 8개. 기존 500 kB 청크 경고 유지 |
| `npm run test:e2e -- tests/e2e/boot.spec.ts` | 0 | 두 엔진 합계 8 passed (2.5s), WebGL2 둘 다 true |
| Node + Vite localhost:4174 + Playwright Chromium 독립 진행률 assert | 0 | 큰 파일 크기 1000: 7개 작은 파일 완료 때 7/1007 = 0.006951340615690168. 큰 파일 크기 미상: 7/8 = 0.875. 두 경우 모두 이후 큰 파일 본문 완료 시 ok·마지막 1·단조 증가 |

로더 반환 형식·URL 표·재시도·실패 처리 계약은 유지됐고, 전체 단위 테스트와 실제 모델 8개를 읽는 두 엔진 E2E가 새 revision에서도 통과했습니다. 따라서 T023~T029의 이전 PASS 근거도 유지합니다. npm ci는 최초 B3 검증에서 실행했으며 이번 수정에 manifest/lock 변경이 없어 반복하지 않았습니다.

최초 revision `6e6924879991703327da3d58f12a7e865312c3cd77d7b52efcc6dba17bfb3684`은 요청·읽기 전·테스트 후 모두 일치했으며 COMPLETE/FAIL이었습니다. 아래 실패 상세와 최초 실행 기록은 해결 이력입니다.

## 적용 원문과 범위

AGENTS.md·PRD·GLOSSARY, 빈 constitution 처리, 교차 검증 절차·validator 역할 및 B1에서 읽은 모든 필수 원문을 유지했습니다. B3 요청 `msg_e4f6204e2dc1`, 구현 로그 task-B3_impl.md, 변경 소스·테스트·기록·배포 파일을 직접 읽고 지정된 modules/static-paths/assets/content-data 계약 및 plan 배포·에셋 처리와 대조했습니다. 수신 status는 `msg_57dbcc50c4ff`입니다.

정적 TypeScript/three.js 게임 기준으로 검증했습니다. Java/Spring/JPA/REST/Maven 항목은 해당 없으며 서버·DB를 요구하지 않습니다. T029는 배포 파일 작성·로컬 확인만이며 원격 main 푸시를 하지 않았습니다. 시작 버튼 연결, 화면 안내·다시 시도, 실제 모델 렌더링 점검은 뒤 태스크 범위로 구분했습니다.

## 태스크별 판정

| 태스크 | 판정 | 원문 근거 | 코드·검사 근거 |
|---|---|---|---|
| T022 로더 | **PASS (수정 후)** | tasks.md:86, contracts/modules.md 8.2 진행률, contracts/assets.md:7 | `src/app/loader.ts:7` URL 표·`:21` 필수 8개·`:26` 실패/정체·`:67` 전체 바이트 진행률·`:119` 재시도·`:128` 소리 캐시. 로더 9건 및 두 크기 조건의 독립 브라우저 assert 통과. 최초 파일별 평균 문제는 아래 이력에 보존. |
| T023 GLB 콘텐츠 검사 | PASS | tasks.md:87, contracts/content-data.md #12·#14 | `tests/unit/content.test.ts:66` 모델 8개 URL, `:70` 캐릭터 실제 animation 이름 검사, `:134`~154 GLB JSON 추출. 콘텐츠 16건 통과. `records/tooling-and-render.md:14`~15에 glob 동작과 읽기 방법 기록. 추가 의존성 없음. |
| T024 Stage | PASS | tasks.md:88, contracts/modules.md 9장 | `src/render/stage.ts:19` WebGLRenderer 실패 null, `:26` 픽셀 비율 상한, `:28` 조명·카메라, `:38` 리사이즈, `:45` 컨텍스트 사건, `:52` 공통 성능 기준 카메라. 타입 검사·두 엔진 실제 부팅 성공. `follow` 추가는 문서가 허용한 렌더러 내부 진입점 재량이며 state·판정에 되돌려 쓰지 않음. |
| T025 모델 준비·복제 | PASS | tasks.md:89, contracts/assets.md:60, contracts/modules.md 9장 | `src/render/models.ts:15` GLTFLoader 파싱·world 갱신·차량만 합치기·회전/크기/바닥·보관, `:40` 뼈대 복제, `:49` 재질별 합치기와 실패 대안. E2E에서 8개 prepare 완료 후 start 도달. 별도 Chromium 확인에서 버기 12메시, 캐릭터 skins·clips 보존, 복제본의 뼈대가 원본과 공유되지 않음 확인. |
| T026 시작 화면 셸 | PASS | tasks.md:90, tasks.md:44 | `src/ui/screens.ts:4` D4 그림 URL/도형, `:18` 시작 버튼·접근성 이름, `src/style.css:1` 기본 화면·`:16` 겹침 층·`:24` 버튼. 타입 검사 및 시작 화면 진입 확인. 버튼 기능은 T039이므로 현재 빈 콜백은 범위에 맞음. |
| T027 부팅·흐름 골격 | PASS | tasks.md:91, contracts/modules.md 8.3·8.4 | `src/main.ts:9` boot→stage→저장→실행 state→flow, `src/app/flow.ts:10` 타입·`:57` 관찰 속성·`:67` 8개 준비/실패 처리·`:78` e2e getter·`:86` loading 및 루프. 실패 안내·재시도 구현은 T089·T090. 빌드 및 두 엔진 start 진입 성공. |
| T028 부팅 E2E | PASS | tasks.md:92, contracts/static-paths.md 5장 | `tests/e2e/boot.spec.ts:5` 화면 변경 관찰, `:22` loading→start·404 0, `:33` 새로 고침, `:41` 같은 출처 확인, `:53` WebGL2 출력. Chromium·WebKit 각각 4건, 합계 8 passed. |
| T029 배포 워크플로 파일 | PASS | tasks.md:93, plan.md:322 | `.github/workflows/deploy.yml:3` main/수동 실행, `:8` 권한, `:13` pages 동시 실행 그룹, `:24`~37 정확한 액션 버전·Node 24·npm ci/test/build·dist·github-pages 환경 일치. 로컬 재설치·전체 테스트·빌드 모두 0. 실제 Actions 실행·공개 배포는 검사하지 않음. |

B2 reviewer 제안 처리: `src/content/rules.ts`는 `PLACEHOLDER_CARD_TICKS`로 이름이 바뀌었고, `tests/unit/content.test.ts:99`에 segment/afterStep 정수·0 이상 검사가 추가되었습니다. 타입·콘텐츠·전체 테스트가 통과했고 기존 기능 판정을 바꿀 문제가 없습니다.

## 최초 FAIL 이력 (해결) — 파일 크기에 무관한 진행률

- 위치: `src/app/loader.ts:65`~78, 특히 `fractions.reduce(...) / ids.length`.
- 계약: modules.md 8.2는 진행률을 **바이트 기준**으로 계산하고 크기 미상 파일만 개수 기준으로 혼합한다고 명시합니다. 구현자는 모든 파일을 같은 비중으로 계산한다고 기록했습니다(task-B3_impl.md 구현 판단 메모 3).
- 재현: 브라우저에서 로더의 fetch를 알려진 크기의 응답 8개로 바꿨습니다. buggy는 Content-Length 1000이며 아직 본문을 보내지 않고, 다른 7개는 각각 Content-Length 1을 모두 보냈습니다. 실제 `onProgress`는 **0.875**를 보고했지만 받은 바이트는 7/1007, 기대값은 **0.006951340615690168**입니다. 값 비교 assert 종료 코드 1.
- 질문: `msg_b78bc32cbd0b`로 의미 확인을 요청했습니다. 조율자는 같은 질문에 reply로 “승인한 원문 없음, 파일별 같은 비중은 구현자 해석이며 계약과 맞지 않음, 전체 바이트 기준으로 수정”이라고 답했습니다. 질문 ID 재전달은 `msg_6f70c141d95a`입니다. 미해결 해석 질문은 없습니다.
- 필요한 수정: 크기를 아는 파일은 받은 바이트 합 / 아는 크기 합에 해당 파일 수 비중을 곱하고, 미상 파일은 완료 개수 / 전체 개수를 더합니다. 모든 크기를 알면 전체 받은 바이트 / 전체 크기가 되어야 합니다. 헤더 도착 순서 때문에 감소하지 않게 하는 처리는 유지하되, 위 1000+1×7 사례를 테스트에 추가하십시오. 완료 1, 단조 증가, 실패 및 재시도 유지도 함께 확인해야 합니다.
- 현재 기존 테스트는 모든 파일 크기를 30으로 만들어 이 차이를 검출하지 못합니다(`tests/unit/loader.test.ts:17`, `:82`).

추가 재현은 설치된 Vite의 `createServer`로 localhost:4174를 열고 설치된 Playwright Chromium에서 `/driving_game/`의 start를 기다린 뒤, `/driving_game/src/app/loader.ts`를 import해 수행했습니다. `loadRequired`가 0.875를 보고하면 아직 대기 중인 큰 파일을 마저 보내 호출을 끝냈고, 브라우저·서버를 finally에서 닫았습니다. source·테스트 파일을 만들거나 바꾸지 않았습니다.

## 최초 검증 실행 기록

| 명령 | 종료 코드 | 결과 |
|---|---|---|
| snapshot 표준 명령, 읽기 전 / 전체 테스트와 추가 재현 후 | 0 / 0 | 상단 요청값과 일치 |
| `npm ci` | 0 | 재설치 성공, 취약점 0. fsevents allowScripts 미지정 경고는 있었으나 후속 검사 성공 |
| `npm run typecheck` | 0 | 통과 |
| `npm test -- tests/unit/loader.test.ts` | 0 | 7 passed |
| `npm test -- tests/unit/content.test.ts` | 0 | 16 passed |
| `npm test` | 0 | 7 files, 72 passed |
| `npm run build` | 0 | JS 1개·CSS·GLB 8개 해시 파일, 621.40 kB JS 경고 있음 |
| `npm run test:e2e -- tests/e2e/boot.spec.ts` | 0 | 8 passed (2.5s), Chromium·WebKit WebGL2 true |
| `node --input-type=module` + Vite localhost:4174 + Playwright Chromium, 준비 모델·복제 assert | 0 | 8개 모델 보관됨, 버기 12메시, 캐릭터 skins Chicken Guy 2 / Cool Banana 1 / Turtle 4 유지, bones 27 / 16 / 16, 복제된 뼈대 원본 공유 없음, clips 보존 |
| 같은 방식의 진행률 불균등 파일 크기 assert | **1** | 실제 0.875 ≠ 기대 7/1007 |

T029의 `npm ci && npm test && npm run build`는 같은 작업 폴더에서 명령별로 순서대로 실행했고 각 종료 0을 확인했습니다. 빌드 청크 크기 경고는 계약의 단일 JS 청크 결정과 함께 기록하며, 경고만으로 FAIL을 추가하지 않습니다. 실제 성능은 기기 점검 범위입니다.

snapshot 명령:

```sh
python3 ivi-agent-guide/scripts/review-snapshot.py /Users/kyw/Documents/git/mine/driving_game /Users/kyw/Documents/git/mine/driving_game/specs/001-kids-driving-safety-game
```

## 남은 일과 범위 밖

T022 수정 재검증을 마쳤으며 B3에 남은 구현 지적은 없습니다. 검증자는 이 보고서만 작성했습니다. 모델의 실제 방향·그림자·탑승객 배치·기기 성능, 부팅 실패 안내와 재시도 화면, 공개 Actions 배포는 이번에 통과로 판정하지 않았습니다. 같은 Dispatch에서 다음 요청 또는 close-review를 기다립니다.
