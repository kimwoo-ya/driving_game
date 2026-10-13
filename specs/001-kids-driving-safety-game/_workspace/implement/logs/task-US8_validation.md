# Task US8 Validation Report (크레딧 T094~T096)

## 재확인 (2026-10-13) — revision `b1cce070a1ef48834974c19f8cac4bbf63132cc2017fb525c6f2fe0c5d486494`

- 실제 도구: 같은 Claude Code 서브에이전트 spec-implement-validator 세션(Orca 미사용, 사용자 결정 2026-10-12)
- revision 요청값 / 읽기 전 / 테스트 후: `b1cce070…6494` / `b1cce070…6494` / `b1cce070…6494` (일치)
- 바뀐 범위 확인: 이전 보고서 작성 뒤 수정된 파일은 `tasks.md` 하나뿐(`find -newer` 보고서 파일, node_modules·.git·dist·test-results 제외). `git diff --stat`가 62/62 → 63/63으로 한 줄만 늘었고, 현재 T063 줄(160행)에서 추가 문장 "함께: T096이 첫 배포 때 화면이 없어 남긴 검사 — `tests/e2e/credits.spec.ts`의 `a[href]` 0 시험에 `practiceMenu`(저장값 주입) 추가."를 빼면 HEAD의 T063 줄과 같음(`diff` 종료 0). `src/`·`tests/` 변경 없음. T094~T096은 아직 미체크
- 조건 해소: 미해결 질문 1(practiceMenu 링크 0 검사 기록 위치)은 이 화면을 만드는 T063의 할 일로 기록되어 해소됨
- 테스트: `npm run typecheck` 종료 0(오류 없음), `npm test` 종료 0(14 files, 130 passed). E2E는 코드 변경이 없어 다시 돌리지 않음(조율자 요청)
- 검증 상태: COMPLETE / 역할 판정: **PASS**(조건 없음) / 미해결 질문: 없음

---

- run / task / dispatch / 실제 도구 / 세션 handle: 해당 없음 / 해당 없음 / 해당 없음 / Orca 미사용 — Claude Code 서브에이전트 spec-implement-validator, 사용자 결정 2026-10-12(00_context.md 승인 기록 "B5 이후 검증 방식", "검증 방식 재조정") / 해당 없음
- FEATURE_DIR / 단계 / 검토 태스크: `/Users/kyw/Documents/git/mine/driving_game/specs/001-kids-driving-safety-game` / implement / US8 덩어리 T094~T096 + `src/style.css` `#controls[data-demo]` 한 줄(US2 reviewer 비필수 제안 ②)
- revision 요청값 / 읽기 전 / 테스트 후: `e9de5df45573151875c0ef2a10505511307eaf81677355fdaf510124f0465540` / `e9de5df45573151875c0ef2a10505511307eaf81677355fdaf510124f0465540` / `e9de5df45573151875c0ef2a10505511307eaf81677355fdaf510124f0465540` (세 값 일치)
- 검증 깊이: 가벼운 검증(사용자 결정 2026-10-12) — 문서·코드 대조 + 프로젝트 테스트 실행. 변이 시험·무작위 탐색은 의심 지점이 없어 하지 않음
- 원문 및 코드 근거 (파일:라인): 아래 태스크별 표
- 실행한 테스트 명령 / 종료 코드 / 결과: 아래 "Test Pass Status"
- 검증 상태: COMPLETE
- 역할 판정: PASS
- 미해결 질문·지적 / 이전 지적 처리 결과: 질문 1건(T096 `practiceMenu` 기록 방법, 아래). 이전 지적 없음(US8 첫 검증)

## 판정: PASS
## 시도: 1/2

읽은 원문: `AGENTS.md`, 역할 파일 `ivi-agent-guide/claude-config/agents/spec-implement-validator.md`(AGENTS.md 치환 기준 적용 — Java/JPA/REST 항목은 이 프로젝트의 모듈 인터페이스·콘텐츠 데이터·화면 상태로 대체), `ivi-agent-guide/orca-cross-review.md`(보고서 필드·snapshot 규칙), `docs/PRD.md` 139~159행(모델 표), `spec.md` US8(219~230행)·FR-086~090(422~429행)·SC-026(575행), `data-model.md` 2.1 Credit(258~283행)·화면 전이(507행)·검사표(922행), `contracts/assets.md` 6·7장(97~123행), `contracts/content-data.md` 19행·#19(110행), `contracts/static-paths.md` 66·78행, `tasks.md` T094~T096(246~248행), `src/assets/models/CREDITS.md`, `_workspace/implement/logs/task-US8_impl.md`, `_workspace/implement/00_context.md` 승인 기록(52·55·56행).

## 태스크별 판정

| 태스크 | 판정 | 근거 (파일:라인) |
|---|---|---|
| T094 `CREDITS` 8행 + #19 | PASS | `src/content/credits.ts:5-16` 필드 9개·`kind` 8가지가 data-model 2.1과 같음. `:41-77` 8행의 id·kind·title·author·sourceUrl·license가 data-model 2.1 표(267~276행)·PRD 표(143~153행)와 한 글자씩 같음(Cool Bannana Guy만 `CC0 1.0`). `:18-19` licenseUrl = deed.ko 두 주소(data-model 278행, assets.md 120행). `:23-28` 변경 문구 3종을 큰따옴표 포함 전체 문자열로 assets.md 7장·data-model 2.1에서 각각 1회씩 찾음(아래 명령). `:20` checkedOn `2026-10-12`. 캐릭터 3종의 작품명·제작자·원출처·라이선스가 `CREDITS.md:7-9`와 같음. 음원 0행(data-model 282행, FR-089 — `src/assets`에는 모델 파일만 있고 그림·소리·글꼴 파일 없음). `tests/unit/content.test.ts:205-218` #19가 content-data.md #19(8 ID마다 1행·필수 필드 채움·라이선스 PRD 표와 같음)를 그대로 검사 |
| T095 크레딧 화면 + `start` ⇄ `credits` | PASS | `src/ui/screens.ts:28-33` 시작 화면에 크레딧 버튼(FR-087). `:36-51` 행마다 "작품명 — 제작자"·"원출처: 주소"·"라이선스: 이름 (주소)"·"변경: 문구"를 `<p>`의 `textContent`로만 넣음(`:47`), `<a>` 없음(FR-086·FR-090, US8-1·2), 돌아가기 버튼(`:50`, US8-4). `src/app/flow.ts:28` 화면 값 `credits`(static-paths.md 78행 목록과 같음), `:87-88` 화면 그리기, `:104-105` `start`→`credits`, `credits`→`start`만 허용(data-model 507행). `src/style.css:56-114` 작은 버튼·자리표시 도형·목록 스타일(코드 단계 자리표시 그림, assets.md 6장 "그 밖의 UI 그림" 이름 규칙 `images/ui/credits.svg`·`back.svg`) |
| T096 E2E 2건 | PASS(조건: 아래 질문의 기록) | `tests/e2e/credits.spec.ts:11-25` 8행 각각 작품명·라이선스·원출처·변경 문구 표시 → 돌아가기 → `start`(US8-1·2·4). `:28-43` `start`·`credits`·`pickVehicle`·`pickCharacter`에서 `a[href]` 0(FR-086, SC-026). `practiceMenu`는 빠짐(`:27` 주석) — 이 화면은 T063 담당이며 첫 공개 배포 뒤로 미룬 범위(00_context.md 52·55행)이고, 현재 코드에서 `practiceMenu`로 바꾸는 곳이 없어 화면에 나올 수 없음(`src/` 검색: 타입 선언 `flow.ts:32`와 주석 `:115`뿐). 존재하지 않는 화면은 검사할 수 없으므로 지금 빠진 것은 받아들일 수 있다고 판단. 다만 T096 문구에는 있으므로 체크할 때 남은 일로 기록해야 함(질문 1) |
| `style.css:131-133` `#controls[data-demo]` 한 줄 | PASS | 시범 `cue-demo 0.5s × 4회`(2초) 뒤 `cue-pulse`를 2초 지연으로 이어 붙임 → 시범이 끝나도 강조 깜빡임이 계속됨. US2 reviewer 비필수 제안 ②(00_context.md 41행)와 같고, 강조 대상 선택자(`:191-197`)는 바뀌지 않음. 전체 E2E 26건 통과로 기존 강조·시범 시험 영향 없음 확인 |

## Interface Conformance (모듈 인터페이스·콘텐츠 데이터 계약)
- [✓] `Credit` 필드·타입: data-model 2.1과 같음(`credits.ts:6-16`)
- [✓] `CREDITS: readonly Credit[]`, 위치 `src/content/credits.ts`(content-data.md 19행)
- [✓] `document.body.dataset.screen = 'credits'`(static-paths.md 78행, `flow.ts:84-85`의 기존 `setScreen`)
- [i] `CreditId`를 `string` 대신 `VehicleKindId | CharacterKindId`로 좁힘(`credits.ts:5`). 지금 8행은 모두 이 범위라 문제 없고 data-model도 "모델은 모델 ID와 같음"이라 어긋나지 않음. 음원 행을 더할 때 타입을 넓혀야 함 — 판정에 영향 없음

## Behavioral Fulfillment
- [✓] FR-086: `src/`에서 링크를 만드는 코드 0건(T112 첫 grep 명령 그대로 실행, 일치 없음 종료 1), `index.html`에 `<a`·외부 글꼴 0건, E2E로 4개 화면 `a[href]` 0
- [✓] FR-087 / US8-4: 시작 → 크레딧 → 돌아가기 → 시작(E2E 통과)
- [✓] FR-088 / US8-1·2 / SC-026: 차량 5/5·사람 3/3, 작품명·제작자·원출처·라이선스·변경 표시
- [✓] FR-089 / US8-3: 채택한 외부 음원·글꼴·아이콘 없음 → 0행이 맞음(배포 대상 `src/assets`에 모델만 있음)
- [✓] FR-090: 주소는 `textContent` 글자로만. 목록 안에서만 글자 선택 허용(`style.css:101-102`) — 보호자가 주소를 옮겨 적게 하는 보조이며 누를 수 있는 링크는 아님

## Data Model Compliance
- [✓] 8행 = data-model 2.1 표, 관계 `Credit.id === VehicleKind.id / CharacterKind.id`(data-model 435~436행)를 #19가 ID 집합 비교로 보장
- [✓] 검사표 "크레딧"(data-model 922행): license·licenseUrl·changes·checkedOn 채움을 #19가 검사

## Test Pass Status

| 명령 (PROJECT_ROOT) | 종료 코드 | 결과 |
|---|---|---|
| `python3 ivi-agent-guide/scripts/review-snapshot.py <PROJECT_ROOT> <FEATURE_DIR>` (읽기 전) | 0 | `e9de5df4…5540` = 요청값 |
| `npm run typecheck` | 0 | 오류 없음 |
| `npm test` | 0 | 14 files, 130 passed |
| `npm test -- tests/unit/content.test.ts --reporter=verbose` (T094 지정 검증) | 0 | 21 passed, #19 통과 표시 |
| `npm run build` (T095 지정 검증) | 0 | 성공(500 kB 청크 경고는 기존과 같음) |
| `npm run test:e2e -- tests/e2e/credits.spec.ts --reporter=list` (T096 지정 검증) | 0 | 4 passed(2건 × chromium·webkit) |
| `npm run test:e2e -- --reporter=line` (전체, 선택) | 0 | 26 passed |
| 변경 문구 대조: `credits.ts` 24·26·28행 문자열을 큰따옴표 포함으로 `grep -cF` (assets.md / data-model.md) | 0 | 3문구 모두 1 / 1 |
| `grep -rnE --include='*.ts' "innerHTML\|outerHTML\|insertAdjacentHTML\|createElement\(['\"]a['\"]\)\|\.href\b\|setAttribute\(['\"]href" src/` | 1 | 일치 없음(통과) |
| `python3 ivi-agent-guide/scripts/review-snapshot.py <PROJECT_ROOT> <FEATURE_DIR>` (테스트 후) | 0 | `e9de5df4…5540` = 요청값 |

구분: 위는 모두 자동 테스트(단위·브라우저 자동화). 실제 기기·사람이 직접 보는 화면 확인은 하지 않음(T093 첫 공개 배포의 기기 확인 범위).

## 참고 (판정 영향 없음)
1. PRD 155행은 "라이선스 링크를 표시"라고 쓰지만 spec 명확화(29행)·FR-090(사용자 결정 2026-10-12)이 "누를 수 없는 글자"로 정했고 구현은 spec을 따름. 사용자 결정으로 정리된 사항이라 모순으로 보지 않음.
2. `src/assets/models/CREDITS.md:3`의 "차량 모델 5종은 아직 준비하지 않았습니다"는 지금 상태(차량 GLB 5개 있음)와 맞지 않음. 이번 덩어리의 변경 파일이 아니고 T094 문구도 캐릭터 3종의 출처 값만 이 파일과 맞추라고 하므로 범위 밖. 정리 여부는 리더 판단.

## 미해결 질문
1. **T096 `practiceMenu` 기록 방법**: T096 문구의 `practiceMenu`(저장값 주입) 링크 0 검사는 화면(T063)이 생길 때까지 할 수 없습니다. T096을 체크할 때 이 남은 검사를 어디에 남길지(예: T096 체크 옆에 "practiceMenu는 T063 때 추가" 메모, 또는 T063 검증 항목에 덧붙이기)는 리더·사용자 결정이 필요합니다. 지금은 `credits.spec.ts:27` 주석에만 남아 있어 잊힐 수 있습니다. 판정은 이 기록을 남긴다는 조건의 PASS입니다.
