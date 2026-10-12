# Architecture Design — 001-kids-driving-safety-game

- 작성: spec-plan-architect, 2026-10-12
- 읽은 원문: `AGENTS.md`, `docs/PRD.md`, `GLOSSARY.md`, `specs/001-kids-driving-safety-game/spec.md`(1~639줄 전체), `.specify/memory/constitution.md`(빈 템플릿), `.specify/templates/plan-template.md`, `_workspace/00_plan_context.md`
- 적용 기준: AGENTS.md의 프로젝트 기준. IVI 기술 규칙(Java/Spring, JPA, REST, Maven)은 적용하지 않음. constitution은 사용자 결정(2026-10-12)으로 없음(spec.md:28, spec.md:577).
- 조사 방법: npm 레지스트리 조회만(설치·`npm init` 없음), 공식 문서(vite.dev, docs.github.com, MDN, playwright.dev, three.js 위키·r186 소스), GitHub API 조회, GLB 8종 헤더 직접 판독(파일은 세션 scratchpad에만 두고 저장소에는 넣지 않음).
- 기존 소스 코드·빌드 설정 없음(새 프로젝트). `specs/.../plan.md`는 아직 빈 양식.

---

## Summary

three.js(WebGL2) + TypeScript + Vite로 만든 정적 단일 페이지 게임을 GitHub Pages 하위 경로(`/driving_game/`)에 배포합니다. 주행·판정·진행도·저장 검증은 DOM과 렌더러 없이 고정 시간 간격(1/60초 틱)으로 도는 순수 함수로 두어 Vitest로 결정적으로 시험하고, three.js·DOM·Web Audio·localStorage는 그 결과를 그리고 들려주고 저장하는 얇은 층으로 둡니다. 콘텐츠(규칙 38문구, 마을·트랙 배치, 차량·인물 목록, 크레딧)는 `src/content/` 데이터와 `src/assets/` 파일로 코드와 분리합니다.

---

## Technical Context

**Language/Version**: TypeScript 7.0.2(타입 검사 `tsc --noEmit` 전용), 빌드 도구 실행용 Node.js 24 LTS(로컬 확인 v24.19.0). 브라우저 출력은 Vite 8 기본 대상(`baseline-widely-available` = chrome111, edge111, firefox114, safari16.4, ios16.4) [vite.dev/config/build-options#build-target].

**Primary Dependencies**: three 0.186.1 (GLTFLoader·SkeletonUtils·BufferGeometryUtils는 같은 패키지의 `three/addons/*`라 추가 의존성 없음)

| 패키지 | 정확한 버전 | 게시일(npm) | 구분 | 이유와 근거 |
|---|---|---|---|---|
| `three` | 0.186.1 | 2026-09-24 (18일 경과) | dependencies | 승인된 3D 엔진. 최신 0.186.1이 2주 기준 충족. package.json `exports`에 `./addons/*` 있음(jsdelivr three@0.186.1/package.json) |
| `@types/three` | 0.186.0 | 2026-09-11 | devDependencies | three는 자체 타입이 없음(`npm view three@0.186.1 types` 결과 없음). 0.186.x 짝 |
| `typescript` | 7.0.2 | 2026-07-08 | devDependencies | 타입 검사만. 7.0은 Go 기반 네이티브 컴파일러로 공개 JS API가 없음(`npm view typescript@7.0.2`에 `main` 없음, 플랫폼별 바이너리 패키지만 의존). 이 프로젝트는 API를 쓰는 도구(타입 기반 eslint 규칙, vue-tsc 등)를 쓰지 않으므로 문제없음. 대안: 6.0.3(2026-04-16, JS API 있음). 공식 발표 글은 직접 확인 못 함(미확인, 2차 출처: https://infoq.com/news/2026/08/typescript-7-released/) |
| `vite` | 8.3.1 | 2026-09-24 | devDependencies | 승인된 빌드 도구. 8.3.2(10-01), 8.3.3·8.3.4(10-06, 10-08)는 2주 미만. **주의**: 8.3.3에 개발 서버 전용 보안 수정 3건(GHSA-rq7h-c2jc-7f22 등, 10-06 게시) 포함. `--host`로 개발 서버를 네트워크에 열 때만 영향 → 2026-10-20 이후 8.3.3 이상으로 올리기 전까지 `--host` 사용 금지 |
| `vitest` | 5.0.2 | 2026-09-25 | devDependencies | peer `vite ^6.4.0 \|\| ^7 \|\| ^8`, engines `node ^22.12 \|\| ^24 \|\| >=26` 충족. 5.0.3(09-30)은 2주 미만 |
| `@playwright/test` | 1.63.0 | 2026-09-04 | devDependencies | 1.64.0(10-07)은 2주 미만. engines `node >=20` |

- 넣지 않는 것: UI 프레임워크, 물리 엔진, 상태 관리 라이브러리, jsdom/happy-dom(순수 로직은 node 환경에서 시험, DOM이 필요한 시험은 Playwright), `@types/node`(설정 파일을 tsc 대상에서 빼고 `skipLibCheck: true`로 시작 — 막히면 그때 추가), 웹 글꼴(시스템 글꼴만 → 외부 요청·라이선스 표시 없음), CSP 메타(아래 "보안" 참조).
- 조회 명령: `npm view <pkg> time --json`, `npm view <pkg>@<ver> peerDependencies engines` (2026-10-12 실행, 설치 없음).

**Storage**: 브라우저 localStorage 한 키에 JSON(형식 버전 + 저장 3항목). 서버·DB 없음. 형식 세부는 data-modeler 몫.

**Testing**: Vitest 5.0.2(node 환경, 순수 로직·콘텐츠 데이터 검증), Playwright 1.63.0(Chromium·WebKit, 모바일 가로 화면 흉내, 하위 경로 로딩), 실제 기기 확인(iPhone/iPad Safari, Android Chrome), 콘텐츠 검토 기록, 어린이 플레이 관찰. 상세는 "테스트 전략".

**Target Platform**: iOS/iPadOS Safari 16.4 이상, Android Chrome 111 이상(Vite 기본 빌드 대상과 일치하는 잠정값). three.js r163부터 WebGL1 지원이 빠져 WebGL2 필수 [github.com/mrdoob/three.js/wiki/Migration-Guide "r163: WebGLRenderer no longer supports WebGL 1"]. 최소 버전·대표 기기는 PRD대로 초기 기기 점검에서 확정.

**Project Type**: 정적 단일 페이지 웹게임(서버·API 없음). 저장소 루트 단일 프로젝트.

**Performance Goals**: 수치 목표는 초기 기기 점검에서 확정(SC-024, PRD "개발 중 결정할 항목"). 초기 예산 제안은 "성능" 절.

**Constraints**: 정적 파일만, 같은 출처 요청만(실행 중 poly.pizza 등 외부 주소 요청 없음), 터치 전용·가로 화면, 개인정보·권한 요청 없음, 필수 파일 전송량 약 4 MB 이하 제안, 게임 안 시간은 모두 틱으로 계산.

**Scale/Scope**: 교육용 마을 1, 전용 트랙 1, 안전 상황 3(+조작 익히기), 차량 모델 5, 사람 모델 3, 규칙 문구 38, 화면·겹침 안내 약 14개, 소스 파일 약 35개, 사용자는 개별 가정(동시 접속 개념 없음).

### Constitution Check

해당 없음(사용자 결정 2026-10-12, spec.md:28·577). 빈 양식의 자리표시자를 규칙으로 쓰지 않음. 대신 AGENTS.md 기준(원본 보존, 최소 변경, 실제 테스트 근거, 테스트 층 구분)을 지킴.

---

## Component Structure

### 설계 원칙

1. **순수 로직과 화면 분리**: `sim/`, `practice/`, `pedestrianView/`, `race/`, `storage/`의 판정·검증 함수는 DOM·WebGL·Web Audio를 import하지 않습니다. `stepXxx(state, input) → { state, events }` 형태로 다음 상태와 이벤트 목록을 반환합니다. 이벤트 버스·DI·인터페이스 계층은 두지 않습니다(구현이 하나뿐).
2. **시간은 틱으로**: 경기 시간, 신호 주기, 보행자 이동, 안내 대기, 카운트다운, 보행자 시점 안내 진행은 모두 틱 수로 셉니다. `Date.now()`·`setTimeout`은 게임 진행에 쓰지 않습니다(UI 꾸밈 애니메이션 제외). → FR-022, FR-074, 기기 시계 변경 Edge Case가 구조적으로 해결됩니다.
3. **차량 종류는 시뮬레이션 입력이 아님**: `stepVehicle`의 매개변수에 차량 종류가 없습니다. 외형(모델)은 렌더링에만 쓰입니다. → FR-011을 함수 시그니처로 보장.
4. **콘텐츠는 데이터**: 규칙·장면·트랙·크레딧은 `src/content/*.ts`의 타입 있는 데이터, 그림·소리·모델은 `src/assets/`. 콘텐츠 작업자가 코드를 고치지 않고 채울 수 있게 합니다.

### 모듈 목록과 책임

| 모듈(파일) | 책임 | 맡는 FR |
|---|---|---|
| `index.html` | 셸, 부팅 가드(인라인 스크립트: 모듈 스크립트·CSS 불러오기 실패 시 "다시 시도" 표시), `<script nomodule>` 미지원 안내, viewport 메타 | FR-001, FR-005(구형), Edge "새 버전 배포 직후" |
| `src/main.ts` | 부팅: WebGL2 확인 → 렌더러 생성(실패 시 3D 불가 안내) → 저장 읽기 → 로더 시작 → 흐름 시작, 부팅 가드 해제 | FR-001, FR-005 |
| `src/app/flow.ts` | 화면 흐름 상태 기계(아래 표), 겹침 안내(일시정지·세로·저장 불가·컨텍스트 손실·나가기 확인), 연타 방지(현재 상태와 맞지 않는 입력 무시), step 이벤트를 받아 UI·소리·저장 호출 | FR-008, FR-029, FR-030, FR-047~050, FR-065, FR-071~077, FR-087, FR-097 |
| `src/app/session.ts` | 현재 실행 상태(RunState): 선택 차량·인물, 레이싱 열림, 연습별 완료, 조작 익히기 통과, 연습별 추가 규칙 위치, 저장 사용 가능 여부, 소리 활성화 여부, 저장 실패 시 이번 실행 값 | FR-010, FR-027, FR-050, FR-051, FR-080, FR-091, FR-097 |
| `src/app/loader.ts` | 필수 파일(GLB 8) 내려받기(fetch + 진행률 + 정체 감지 AbortController), 실패한 파일만 다시 받기, HTTP 404면 새 버전 배포로 보고 새로 고침 안내, 소리 파일 백그라운드 로딩(실패 무시), 에셋 URL 표(`import.meta.glob`) | FR-002~004, FR-070 |
| `src/core/loop.ts` | 고정 시간 간격 루프(requestAnimationFrame + 누적기, 틱 1/60초, 프레임 간격 상한, 한 프레임 최대 8틱), 일시정지 중 틱 없음, 재개 시 기준 시각 초기화 | FR-022, FR-071, FR-074 |
| `src/input/controls.ts` | 조작 버튼 DOM, 포인터 위치 표(pointerId → 좌표), 순수 함수 `pressedButtons(pointers, rects)`, `toDriveInput(pressed)`(브레이크 우선·좌우 동시=직진), 후진·일시정지 버튼은 누르는 순간 1회 이벤트, `releaseAll()`(누르고 있던 손가락은 뗄 때까지 무시) | FR-013~017, FR-021 |
| `src/sim/vehicle.ts` | 공통 운전 성능 상수 `DRIVE_SPEC`(최고속도·가속·제동·자연 감속·조향·후진·판정용 차체 크기), `stepVehicle(state, input, dt)`, `requestGearToggle(state)`(속도 0일 때만, 거절 여부 반환) | FR-011, FR-018, FR-019, FR-022, FR-054 |
| `src/sim/collision.ts` | 공통 차체 원(반지름 하나)으로 차-차 겹침 해소 + 감속(튕김 없음), 차-구역 판정(도로·보도·건물·트랙 벽) | FR-011, FR-035, FR-060 |
| `src/practice/drivingLesson.ts` | 조작 익히기 단계 진행(조향 → 액셀 → 브레이크 → 후진 전환, 시범 → 직접 해 보면 다음) | FR-027 |
| `src/practice/practice.ts` | 안전 상황·연습 구간 진행 상태 기계, 정지·대기·출발 판정, 잘못된 행동 감지 → 위험 직전 멈춤 이벤트 → 구간 시작으로 되돌림, 경로 문제 안내(실패 아님), 무입력 재안내, 연속 실패 시 시범 재표시, 완료 조건(행동 플래그 + 보행자 시점 안내 끝) | FR-028, FR-031~038, FR-044~046 |
| `src/practice/townActors.ts` | 신호(차량·보행자 구분)와 등장 보행자 진행. 플레이어 위치·정지 여부에 맞춰 신호 변화·횡단 시작(멈출 수 있는 거리일 때만) | FR-039, FR-040, FR-042 |
| `src/practice/ruleRotation.ts` | 연습별 핵심 규칙 전부 + 이번 실행에서 아직 안 보인 추가 규칙 N개 선택, 끝나면 처음부터 순환(저장 안 함) | FR-091, FR-044~046 |
| `src/pedestrianView/pedestrianView.ts` | 보행자 시점 안내 타임라인(틱 기반): 카메라 이동 → 규칙 카드 순서(그림 + 음성 + 주인공 몸짓) → 끝. 입력 무시, 건너뛰기 없음, 숨김 복귀 시 처음부터, 음성 끝을 기다리지 않음(카드 길이는 데이터) | FR-041~043, FR-070, FR-092(날씨), FR-093, FR-094, FR-097 |
| `src/race/race.ts` | 경기 상태 기계(카운트다운 → 진행 → 플레이어 완주), 틱 시계, 출발 전 입력은 저장만 하고 출발 순간 반영, 완주 순간 순위·시간 확정, 재도전 시 전체 초기화 | FR-053, FR-055, FR-056, FR-058, FR-062~065, FR-077 |
| `src/race/progress.ts` | 코스 진행도(바퀴, 순서대로 지난 구간 문, 구간 안 위치), 정방향 결승선 통과만 바퀴 인정, 순위 계산(완주 순서 → 진행도), 끼임·이탈 감지와 복귀 위치(겹침 피해 옆 칸 선택), 복귀로 진행도 증가 없음 | FR-057, FR-059, FR-061 |
| `src/race/ai.ts` | 컴퓨터 차량이 플레이어와 같은 `DriveInput`을 만들어 같은 `stepVehicle`로 달림. 차선 오프셋·목표 속도 비율·반응 지연으로만 난이도 조절, 앞이 막히면 옆 차선으로, 그래도 막히면 복귀 규칙 | FR-054, FR-060, FR-061 |
| `src/render/stage.ts` | WebGLRenderer·카메라·조명, 뒤에서 내려다보는 고정 오프셋 추적 카메라(오프셋은 `DRIVE_SPEC` 기준, 모델 크기 무관), 리사이즈, 컨텍스트 손실·복구 감지, `?perf` 측정 표시 | FR-006, FR-011, FR-023, FR-026 |
| `src/render/models.ts` | GLB 파싱(`GLTFLoader.parseAsync`), 정규화(방향·크기·바닥), 정적 모델의 재질별 합치기, 복제(정적은 `clone()`, Chicken Guy는 `SkeletonUtils.clone`) | FR-009, FR-011, FR-096 |
| `src/render/townView.ts` | 마을 배치 데이터로 기본 도형(상자·원기둥·평면) 장면 생성, 정적 부분 재질별 합치기, 신호등(색 + 모양 표시), 장면 요소 | FR-024, FR-025, FR-028, FR-092 |
| `src/render/trackView.ts` | 트랙 정의로 노면·벽·결승선 생성(마을과 다른 색·모양) | FR-052 |
| `src/render/people.ts` | 인물 몸짓(걷기 = 이동 + 통통 튐, 좌우 보기 = 몸·머리 돌리기, 손 들기 표시), Chicken Guy는 `Walk`/`Idle` 클립 재생 | FR-039, FR-096 |
| `src/render/showroom.ts` | 차량·인물 선택 화면의 3D 진열(모델을 화면 열에 맞춰 배치, 고르면 확대·회전) | FR-009, FR-097 |
| `src/ui/screens.ts` | DOM 화면: 시작, 차량 선택, 인물 선택, 연습 목록, 완주 결과, 크레딧. 글은 `textContent`로만 넣음 | FR-008, FR-009, FR-012, FR-030, FR-048, FR-063, FR-065, FR-087~090, FR-097 |
| `src/ui/hud.ts` | 운전 화면 표시: 전진·후진 그림, 다음 행동 그림(행동할 때까지 남김), 멈추라는 안내, 순위·바퀴·시간 | FR-018, FR-019, FR-025, FR-031, FR-056 |
| `src/ui/overlays.ts` | 일시정지(계속하기 가장 크게, 소리 설정, 나가기 확인), 세로 안내, 저장 불가 안내(실행당 1회), 로딩·로딩 실패, 3D 불가, 컨텍스트 손실 | FR-004~007, FR-069, FR-072, FR-075, FR-080 |
| `src/audio/audio.ts` | Web Audio: 시작 버튼에서 AudioContext 생성·resume, 다음 사용자 동작마다 재시도, 배경음/안내/효과음 gain, 안내는 한 번에 하나(새 안내가 이전 안내를 끊음), 안내 중 배경음 낮춤, 일시정지 시 suspend, 재개 시 현재 안내 처음부터 | FR-036, FR-066~070, FR-076 |
| `src/storage/save.ts` | localStorage 읽기(try/catch) → 항목별 검사 → 기본값 대체, 쓰기 때 최신 값 다시 읽고 합치기(완료 OR, 최고 기록 최솟값, 소리 마지막 값), 실패 시 사용 불가 표시 | FR-047, FR-064, FR-078~083 |
| `src/platform/lifecycle.ts` | `visibilitychange`, 화면 방향·크기 변화, `blur`, 브라우저 제스처 차단(`gesturestart`·`dblclick`·`contextmenu`·`touchmove` preventDefault) → flow에 신호 | FR-006, FR-007, FR-017, FR-020, FR-073 |
| `src/content/*.ts` | 정적 콘텐츠 데이터(아래 Project Structure) | FR-009, FR-044~046, FR-052, FR-058, FR-088~097 |

전체 범위 규칙(FR-084 개인정보·권한 없음, FR-085 외부 전송·광고 없음, FR-086 외부 링크 없음)은 특정 모듈이 아니라 "외부 요청 코드·`<a href>`·권한 API를 쓰지 않는다"는 구조 규칙과 Playwright 검사로 지킵니다.

### 화면 흐름 상태 기계 (`app/flow.ts`)

| 상태 | 들어오는 조건 | 나가는 곳 |
|---|---|---|
| `boot` | 페이지 열림 | `unsupported` / `loading` |
| `unsupported` | WebGL2 없음 또는 렌더러 생성 실패 | (끝, 보호자용 안내) |
| `loading` | 부팅 성공 | `start` / `loadFailed` |
| `loadFailed` | 필수 파일 실패·정체 | 다시 시도 → `loading`(실패 파일만) 또는 새로 고침(404) |
| `start` | 로딩 완료, 결과·나가기에서 복귀 | `pickVehicle`(시작·안전 연습·레이싱 선택 기억), `credits` |
| `credits` | 시작 화면에서 | `start` |
| `pickVehicle` → `pickPerson` | 시작 | `drivingLesson`(첫 이용 흐름) / `practiceMenu` / `race` |
| `drivingLesson` | 이번 실행에서 아직 안 거침 + 완료 기록 없음 | `practice`(첫 연습) |
| `practiceMenu` | 연습 선택 | `practice` |
| `practice` (내부 단계: `driving` → `explaining`(위험 직전 멈춤 설명) → `pedestrianView` → `done`) | 연습 시작 | 다음 연습(첫 이용 흐름) / `practiceMenu` / 세 번째 완료 시 축하 → `start` |
| `race` (내부: `countdown` → `running`) | 레이싱 열림 상태에서 선택 | `raceResult` |
| `raceResult` | 플레이어 완주 | 재도전 → `race`, 시작 화면으로 → `start` |
| `fatal` | 컨텍스트 복구 실패 | 새로 고침(저장 기록 유지) |

겹침 안내는 상태와 별도 플래그입니다: `paused`(일시정지 화면), `rotate`(세로), `storageNotice`, `contextLost`, `confirmExit`. 숨김·세로·컨텍스트 손실은 `paused`를 켜고 자동으로 끄지 않습니다(FR-073). 현재 상태를 `document.body.dataset.screen`에 적어 Playwright가 읽습니다.

### 게임 루프 (`core/loop.ts`)

- 틱 `TICK = 1/60초`. rAF 콜백마다 `frameDt = min(now − last, 0.25초)`, 누적기에서 틱만큼 `step()`을 반복(한 프레임 최대 8틱, 넘으면 남은 시간을 버려 게임이 느려지는 쪽을 택함 → 7.5 fps 미만 기기에서만 발생).
- 입력은 틱마다 그 시점의 눌림 상태를 읽습니다. 그래서 화면 갱신 속도가 30·60·120 Hz로 달라도 같은 틱 입력이면 결과가 비트 단위로 같습니다(SC-002 자동 시험 근거).
- 일시정지·숨김: 틱을 돌리지 않고, 재개할 때 `last = now`, 누적기 0. 숨김 동안 rAF가 멈춰도 복귀 첫 프레임의 큰 간격이 반영되지 않습니다(FR-074, CONC-004).
- 시간 측정은 `performance.now()`(단조 시계) → 기기 시계 변경 무관.
- 렌더링 보간은 넣지 않음. 120 Hz 기기에서 끊김이 보이면 그때 추가합니다.
- 결정적 사건과 일시정지가 겹칠 때(FR-077, CONC-003): JS는 단일 스레드라 step과 그 이벤트 처리는 한 프레임 안에서 끝나고, 일시정지 버튼 이벤트는 프레임 사이에 처리됩니다. 따라서 "일시정지 전에 일어난 사건은 결과 표시와 저장까지 마침"이 구조적으로 성립합니다. 경기 시간은 틱을 더 세지 않으므로 요청 시점에 멈춥니다.

### 입력 (`input/controls.ts`)

- 조작 층 하나에 `pointerdown/pointermove/pointerup/pointercancel` 리스너를 두고 손가락마다 좌표를 기록합니다. 버튼 눌림은 "그 버튼 영역 안에 손가락 좌표가 하나라도 있는가"를 좌표로 계산합니다(`pressedButtons(pointers, rects)`, 순수 함수).
- 터치는 `pointerdown` 때 처음 누른 요소에 암묵적으로 포인터가 잡힙니다(implicit pointer capture) [MDN Pointer events]. 이벤트 대상(target) 대신 좌표로 판정하므로 손가락이 다른 버튼으로 미끄러져도 "지금 손가락이 있는 버튼"을 따릅니다(FR-016).
- 버튼 영역(rect)은 리사이즈 때만 다시 잽니다. 세 개 이상 손가락, 버튼 밖 터치도 같은 규칙.
- `releaseAll()`: 좌표 표를 비우고, 그때 닿아 있던 손가락 id는 뗄 때까지 무시 목록에 둡니다 → "새로 눌러야 반영"(FR-017). 호출 시점: 일시정지, 숨김, `blur`, 회전·크기 변화, 보행자 시점 안내 시작, 구간 재시도, 코스 복귀, 경기 화면 진입, 위험 직전 멈춤. 예외: 카운트다운 중 새로 누른 액셀은 출발 순간 그대로 반영(경기 화면 진입 때만 해제하고 GO 때는 해제하지 않음).
- `pointercancel`이 오면 그 손가락 제거. `pointerup`이 누락되는 드문 경우는 숨김·blur·회전 때 일괄 해제로 막습니다(CONC-002).
- 후진 전환·일시정지는 영역 안 `pointerdown` 순간 1회 이벤트. 메뉴 화면 버튼은 일반 `click`.
- CSS: 게임 루트 `touch-action: none`, `user-select: none`, `-webkit-user-select: none`, `-webkit-touch-callout: none`, `overscroll-behavior: none`, `position: fixed`; viewport 메타 `width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover`; 버튼은 `env(safe-area-inset-*)` 안쪽(FR-020, FR-021). iOS의 확대·두 번 탭 동작은 실제 기기 확인 대상(SC-005).

### 주행·충돌 (`sim/`)

- 상태 `VehicleState { x, z, heading, speed, gear: 'forward' | 'reverse' }`, 단위 1 = 1 m.
- 입력 `DriveInput { steer: -1..1, throttle: boolean, brake: boolean }`. 플레이어는 -1/0/1, 컴퓨터 차량은 같은 범위의 값.
- 페달을 떼면 자연 감속, 속도가 아주 작아지고 액셀이 없으면 정확히 0으로 맞춤 → "완전히 멈춤" = `speed === 0`(열린 항목 3).
- 판정용 차체: 모든 차량이 `DRIVE_SPEC`의 같은 길이·반지름 사용. 정지선 판정은 "차체 앞 끝 점"(위치 + 진행 방향 × 반길이)으로 계산.
- 차-차 접촉: 겹친 만큼 밀어 떼고 두 차 속도에 감속 계수만 곱함(튕김·회전 없음).
- 차-구역: 마을은 축 정렬 사각형 구역(도로·횡단보도·보도·건물), 트랙은 중심선 + 폭 + 벽. 건물·벽에 닿으면 이동 차단 + 감속(FR-035), 보도 진입은 안전 연습에서 잘못된 행동(FR-033).
- 무작위 없음(컴퓨터 차량 포함) → 재현 가능.

### 조작 익히기·안전 연습 판정·위험 직전 멈춤 (`practice/`)

- 판정 좌표: 각 연습 구간은 차선 중심 경로(polyline)를 갖고, 차체 앞 끝을 경로에 투영한 거리 `s`와 옆 거리로 판정합니다. 데이터(구간마다): 시작 자세, 경로, 정지선 `s`, 넉넉한 정지 인정 범위, 신호가 바뀌는 지점(최대 속도 제동 거리 + 여유만큼 앞), 신호·보행자 계획, 보행자 시점 안내 위치·카메라, 연결 규칙.
- 진행: 접근 → 정지 범위 안에서 `speed === 0` → 조건(진행 신호, 보행자 건너기 끝) 충족까지 정지 유지 → 출발 → 보행자 시점 안내 → 완료. 완료 플래그는 행동 단계를 모두 거친 경우에만 켜짐(끝 지점 도착·시간 경과·한 버튼만 누르기로는 불가, FR-032, SC-008).
- 잘못된 행동 판정(틱마다, 순수 함수): 정지선 넘어 멈춤, 정지 신호에 멈추지 않고 정지선 통과, 진행 신호 전 출발, 보행자 횡단 중 횡단보도 진입·회전, 보도 진입. 판정되면 `violation` 이벤트 → 흐름이 시뮬레이션 전체를 멈추고 설명 카드(그림·음성) → `segmentReset`(차 전진·정지, 신호·보행자 처음부터, 입력 해제).
- 사고 장면이 생기지 않는 보장: 위반 선(정지선·횡단보도 가장자리)과 보행자 경로 사이 거리가 차체 길이 + 여유 이상이 되도록 콘텐츠 데이터를 만들고, 이 조건을 Vitest 콘텐츠 검증으로 확인합니다(FR-036). 보행자는 차가 멈췄거나 멈출 수 있는 거리일 때만 출발(FR-039).
- 경로 문제(정지 위치보다 멀리서 멈춤 → "조금 더 앞으로", 회전 대신 직진·후진 이탈 → 방향 안내 또는 구간 시작으로)는 실패가 아님(FR-034).
- 무입력 재안내, 연속 실패 시 시범 재표시는 틱 카운터(간격·횟수는 플레이 점검에서 정하는 상수).
- 위험 직전 멈춤 연출은 "게임 전체 멈춤"으로 보이게 화면 전체 반투명 + 멈춤 그림(차만 멈춘 것처럼 보이지 않게, FR-037). 문구는 콘텐츠 검토(SC-027).

### 보행자 시점 안내 (`pedestrianView/`)

- 타임라인: 카메라를 보행자 위치(아이 눈높이, 주인공 어깨 뒤)로 옮김 → `ruleRotation`이 고른 규칙 카드 순서대로 표시 → 끝. 카드마다 `durationTicks`(데이터), 그림(DOM 겹침), 음성 줄 id, 주인공 몸짓, 필요하면 날씨(비·어두운 날).
- 음성은 같이 재생하지만 진행은 카드 길이로만 정합니다(음성 실패·소리 끔과 무관, FR-070, CONC-007). 카드 길이는 콘텐츠 제작 때 음성 길이 이상으로 정합니다.
- 일시정지 시 타임라인 정지(틱), 재개 시 현재 카드 음성은 처음부터(FR-076). 숨김 복귀 시 타임라인 0부터(FR-041).
- 주인공 = `session.selectedPerson`(FR-097, SC-032).

### 레이싱 (`race/`)

- 트랙 데이터: 닫힌 중심선, 폭, 순서 있는 구간 문, 결승선(문 0), 구간별 복귀 위치(옆 칸 3개), 바퀴 수(1 또는 2), 출발 격자, 컴퓨터 차량 3대 설정(차선 오프셋·목표 속도 비율·반응 지연), 트랙 구성 키(최고 기록 비교용, FR-082).
- 진행도: 다음 문을 정방향으로 지날 때만 증가. 마지막 문 뒤 결승선을 정방향으로 넘을 때만 바퀴 +1. 후진 왕복·역주행·가로지르기는 진행도·바퀴 증가 없음(FR-059, SC-013). 벽이 있어 트랙 안쪽 가로지르기는 물리적으로도 막힘.
- 순위: 완주 차량은 완주 틱 순(같은 틱이면 결승선을 더 넘은 차, 그래도 같으면 플레이어 앞, spec Assumptions), 나머지는 진행도 순(FR-057).
- 끼임·이탈: 정해진 틱 동안 진행도가 거의 늘지 않으면 마지막으로 지난 문의 복귀 위치로, 정방향, 속도 0, 전진, 비어 있는 옆 칸에. 진행도는 그 문 값으로 두어 오르지 않음(FR-061). 컴퓨터 차량도 같은 함수.
- 경기 시간 = 출발 신호 이후 틱 수. 30분·60분 넘어도 정수 틱이라 정확(FR-062).
- 완주 순간 `playerFinished` 이벤트 → 흐름이 결과 화면을 바로 띄우고 최고 기록 비교·저장.

### 소리 (`audio/`)

- 시작 버튼 click 안에서 AudioContext 생성 + `resume()`. 상태가 `running`이 아니면 다음 사용자 동작(pointerdown)마다 다시 `resume()`(FR-066). iOS Safari는 화면 이탈·화면 꺼짐 때 `interrupted` 상태가 되어 다시 resume해야 함 [MDN BaseAudioContext/state].
- gain 묶음: 배경음 / 안내 / 효과음. 설정은 PRD대로 두 묶음(배경음, 안내·효과음) → 안내와 효과음 gain을 같이 켜고 끔. 설정 변경은 gain에 바로 반영(FR-069).
- 안내 음성은 소스 하나만: 새 안내가 오면 이전 소스 `stop()` 후 재생. 재생 중 배경음 gain을 낮추고 끝나면 복귀. 효과음은 안내 중 낮게.
- 일시정지 = `ctx.suspend()`, 재개 = `ctx.resume()` + 끊긴 안내 처음부터.
- 효과음 id는 콘텐츠 목록(위협적이지 않은 소리만)으로 제한(FR-036).
- 형식: MP3(사파리·크롬 모두 `decodeAudioData` 지원, 실제 기기 확인 대상). 배경음은 30~60초 반복 구간으로 만들어 디코딩 메모리를 줄임(긴 곡 전체를 디코딩하면 수십 MB).
- 모든 소리 실패는 조용히 무시하고 진행(FR-070).

### 저장 (`storage/`)

- 읽기: `localStorage` 접근 자체를 try/catch(SecurityError 가능 [MDN Window/localStorage]) → JSON.parse try/catch → 형식 버전 확인 → 항목별 검사(완료 `=== true`, 최고 기록은 유한한 양수이고 상한 이하, 소리 설정은 정해진 값) → 틀린 항목만 기본값(FR-081, SC-018).
- 쓰기: 쓸 때마다 최신 값을 다시 읽어 합침(완료는 OR, 최고 기록은 같은 트랙 구성끼리 더 짧은 값, 소리는 이번 값) → `setItem`. 실패하면 `session`의 이번 실행 값으로 계속하고 저장 불가 안내 1회(FR-080, FR-083). 다른 탭과의 실시간 동기화(`storage` 이벤트)는 요구사항에 없어 넣지 않음.
- 저장 시점: 세 번째 연습 완료 순간, 정상 완주 순간(더 짧을 때), 소리 설정 변경.

### 로딩·오류 (`app/loader.ts`)

- 필수: GLB 8개(FR-004). 소리는 필수 아님(FR-070) → 시작 화면 뒤 백그라운드.
- `fetch` + `ReadableStream`으로 바이트 진행률, 일정 시간 바이트가 늘지 않으면 `AbortController`로 끊고 실패 처리("오랫동안 진행이 없으면 다시 시도"). 받은 `ArrayBuffer`는 `GLTFLoader.parseAsync(buffer, '')`로 파싱(GLB 8개 모두 이미지·버퍼가 파일 안에 있음을 확인 → 추가 요청 없음).
- 다시 시도: 사용자가 누를 때만, 실패한 파일만 다시 받음, 성공 시 페이지 유지(FR-004). 자동 재시도 없음. 계속 실패하면 보호자용 글 "인터넷 연결을 확인해 주세요".
- HTTP 404: 새 버전 배포로 이전 파일 이름이 사라진 경우 → 다시 받아도 성공할 수 없으므로 "다시 시도" 버튼이 페이지를 새로 엶(리더에게 넘길 항목 참조).
- 부팅 가드(`index.html` 인라인): 앱 부팅 완료 전 `window` capture 단계 `error`(스크립트·CSS 불러오기 실패, 구형 브라우저 구문 오류)를 잡아 "다시 시도(새로 고침)" 화면을 그림 + 짧은 글로 표시. 부팅 완료 후 리스너 제거.
- 3D 불가: `canvas.getContext('webgl2')`가 null이거나 `WebGLRenderer` 생성이 예외 → 그림 + 보호자용 글 + "Safari, Chrome에서 열어 주세요"(FR-005).
- 컨텍스트 손실: three.js r186 `WebGLRenderer`가 `webglcontextlost`에서 `preventDefault()`를 호출하고 `webglcontextrestored`에서 내부 상태를 다시 만듦(소스 WebGLRenderer.js 1113~1127행). 앱은 같은 이벤트로 일시정지 + 안내, 복구되면 일시정지 유지(계속하기로 재개), 일정 시간 안에 복구 안 되면 `fatal`(새로 고침 안내, 저장 유지)(FR-006).

### 크레딧

`content/credits.ts`의 항목(자료 종류, 작품명, 제작자, 원출처 주소, 라이선스 이름·주소, 변경 내용, 사용조건 확인일)을 `textContent`로 표시. 주소는 링크가 아닌 글자(FR-086, FR-090). 변경 내용은 "에셋 파이프라인" 절의 문구.

---

## 데이터 흐름

```text
[빌드 시]
src/content/*.ts ──Vite 번들──▶ dist/assets/index-<hash>.js (읽기 전용 데이터, 코드와 함께 배포)
src/assets/**    ──import / import.meta.glob──▶ dist/assets/<name>-<hash>.<ext> (같은 출처, /driving_game/ 아래)

[실행 시: 들어오는 방향]
GitHub Pages ─HTTPS 같은 출처─▶ app/loader ─ArrayBuffer─▶ render/models(파싱·정규화·합치기) ─▶ 메모리의 모델 원본 ─clone─▶ 장면
                                          └─ArrayBuffer─▶ audio(decodeAudioData) ─▶ AudioBuffer
localStorage ─문자열─▶ storage/save(파싱·항목별 검사·기본값) ─▶ app/session(RunState)
                                                              ─▶ ui: 레이싱 잠김 그림, 소리 설정, 결과 화면 최고 기록
터치 ─pointer 이벤트─▶ input/controls(손가락 좌표 표) ─틱마다 pressedButtons─▶ DriveInput
     ─▶ sim·practice·race step ─▶ 다음 상태 + 이벤트
           상태 ─▶ render(Object3D 위치·카메라), ui/hud(전진·후진, 순위, 바퀴, 시간)
           이벤트 ─▶ app/flow ─▶ ui(화면 전환·안내 그림) / audio(음성·효과음) / storage(완료·최고 기록)
브라우저 신호(visibilitychange, resize·방향, blur, webglcontextlost/restored) ─▶ platform/lifecycle·render/stage ─▶ app/flow(일시정지·입력 해제)

[실행 시: 나가는 방향]
storage/save ─합친 JSON─▶ localStorage (이 브라우저에만)
외부로 나가는 요청: 없음 (분석·추적·광고·외부 글꼴·외부 링크 없음)
```

- 정적 콘텐츠: 기원은 저장소의 TS 데이터 파일, 저장은 번들 JS, 화면 전달은 import → 모듈 → UI/장면.
- GLB: 기원은 poly.pizza 배포 파일(사람이 한 번 받아 저장소에 커밋), 저장은 `dist/assets` 해시 파일, 전달은 loader → models → 장면.
- 저장 3항목: 기원은 게임 이벤트, 저장은 localStorage 한 키, 전달은 save → session → UI.
- 입력: 기원은 터치, 저장 안 함(메모리 좌표 표), 전달은 controls → step → render/hud.

---

## Integration Points

| 연결 대상 | 방식 | 처리 | 근거 |
|---|---|---|---|
| 정적 파일(GitHub Pages 하위 경로) | Vite `base: '/driving_game/'`, 모든 에셋을 import해 해시 이름 URL 사용 | 화면 이동이 URL을 바꾸지 않음(라우터 없음) → 어느 때 새로 고쳐도 같은 `index.html` → "찾을 수 없음" 없음(FR-002) | vite.dev/guide/static-deploy#github-pages("set base to '/<REPO>/'"), vite.dev/guide/assets(가져온 에셋은 해시 이름) |
| GitHub Pages 캐시 | 응답 헤더 `cache-control: max-age=600` | 이전 `index.html`이 최대 10분 남을 수 있음 → 부팅 가드 + 404 시 새로 고침 | 실측 `curl -sI https://mrdoob.github.io/stats.js/`(2026-10-12). 공식 문서 명시는 미확인 |
| localStorage | 동기 API, 한 키 | 접근·쓰기 모두 try/catch, 사생활 보호 모드·차단 시 사용 불가 처리 | MDN Window/localStorage(SecurityError, 사생활 보호 모드 데이터 삭제) |
| Web Audio 자동재생 제한 | 사용자 동작 안에서 생성·resume | 시작 버튼 전 무음, 실패 시 다음 동작마다 재시도, iOS `interrupted` 대응 | PRD가 인용한 MDN Audio_for_Web_Games#autoplay, MDN BaseAudioContext/state |
| 화면 숨김 | `document` `visibilitychange` | `hidden`이면 일시정지 + 입력 해제 + 보행자 시점 안내 처음부터 표시 | MDN Document/visibilitychange_event(모바일 앱 전환 포함). 화면 잠금 시 발생은 문서에 없음 → 실제 기기 확인(SC-003) |
| WebGL 컨텍스트 손실 | canvas `webglcontextlost` / `webglcontextrestored` | three.js가 복구 처리, 앱은 일시정지·안내·복구 실패 시 새로 고침 안내 | three@0.186.1 src/renderers/WebGLRenderer.js 1113~1127행, MDN webglcontextlost_event |
| 화면 방향·크기 | `resize` + `matchMedia('(orientation: portrait)')` | 세로 또는 너무 작은 영역이면 가로 안내 + 일시정지(플레이 중), 가로 180° 뒤집기는 입력만 해제하고 일시정지 안 함, 방향 고정 API는 쓰지 않음 | FR-007, spec Edge "화면" |
| 브라우저 기본 제스처 | CSS `touch-action: none` 등 + `gesturestart`·`touchmove`(passive: false)·`dblclick`·`contextmenu` preventDefault | 확대·스크롤·길게 누르기 메뉴·당겨서 새로 고침 차단 | MDN touch-action, MDN overscroll-behavior. iOS 세부 동작은 실제 기기 확인(SC-005) |
| 기기 시계 | `performance.now()` + 틱 | 시계 변경·시간대 이동 무관 | spec Edge "기기 시계" |
| 외부 서비스 | 없음 | poly.pizza 등 외부 주소로 실행 중 요청하지 않음 | 00_plan_context.md §3 |

모듈 사이 연동은 함수 호출과 step 반환 이벤트뿐입니다(메시징·서버 API 없음). 동기 호출만 있고 비동기는 파일 로딩·오디오 디코딩 두 곳입니다.

---

## 에셋 파이프라인

### 위치와 이름

- 게임용 GLB: `src/assets/models/` 아래 8개 — `buggy.glb`, `jeep.glb`, `truck.glb`, `wagon.glb`, `banana-car.glb`, `chicken-guy.glb`, `cool-banana-guy.glb`, `turtle.glb`. git에 커밋(합계 약 2.5 MB).
- `modeling/` ZIP 원본은 건드리지 않음(AGENTS.md). **사실**: 현재 `.gitignore`에 `modeling/`이 있어 ZIP은 GitHub에 올라가지 않습니다. 게임 빌드는 GLB만 쓰므로 배포에는 영향 없음.
- 그림: `src/assets/images/rules/<규칙ID>.svg`(38문구), `src/assets/images/ui/*.svg`(버튼·잠김·완료·전진·후진·회전 안내 등).
- 소리: `src/assets/audio/voice/<줄ID>.mp3`, `src/assets/audio/sfx/*.mp3`, `src/assets/audio/bgm/*.mp3`.
- `public/`은 쓰지 않음(해시 이름을 받기 위해 모두 import, Vite 권장 방식 [vite.dev/guide/assets "prefer importing assets"]). GLB는 Vite 기본 에셋 확장자 목록에 없으므로 `?url` 접미사로 가져옴(vite.dev/guide/assets "explicitly imported as a URL using the ?url suffix"). 여러 파일은 `import.meta.glob('…', { query: '?url', import: 'default', eager: true })`.

### 내려받기 재현

- 방식: **한 번만 하는 수동 작업**(스크립트 파일 만들지 않음). implement 단계 첫 태스크에서 **사용자 승인 후** 실행합니다(외부 파일을 저장소에 넣는 일이므로 승인 필요, AGENTS.md·CLAUDE.md).
- quickstart.md에 `curl -o src/assets/models/<이름>.glb <GLB 주소>` 8줄과 확인 명령 `shasum -a 256 -c src/assets/models/SHA256SUMS`를 적습니다. 체크섬 파일 하나(`SHA256SUMS`)만 추가합니다.
- 2026-10-12 받은 파일의 SHA-256(아키텍트 scratchpad에서 계산):

| 파일 | GLB 주소 | SHA-256 |
|---|---|---|
| buggy.glb | https://static.poly.pizza/8036e526-b08a-4d8c-a4b3-0214097cbc18.glb | 3f17aa7cbdd7509fb56b1e2e6b4b5a4d384fbffa15e0bb2c0f5a87cc8f509d5c |
| jeep.glb | https://static.poly.pizza/1c0f14fb-d3db-41e8-941b-f10fb7aa9681.glb | edb8d57bb7ec61358a34d53d2e484fa9fcdfb8f9b90ddecd576ed272b48a1e50 |
| truck.glb | https://static.poly.pizza/0674a45b-d617-4e7d-91c2-56bbed93230b.glb | 634c5bd06c236044c1254474187218961db45a007cdd73a4cf51db7965d721c4 |
| wagon.glb | https://static.poly.pizza/34b817d5-a238-4720-bc18-f065367eacda.glb | 3441207d0eca5181ec20de64c877f3386e4ef38cfd441d1577b31e94642b40f6 |
| banana-car.glb | https://static.poly.pizza/834b3d40-b61f-411b-b63b-2adf51bc15c9.glb | 05d4dc8e88cb33ae3ed5cd3077a7eb607bb717b916f57408f5c48a11427d25ca |
| chicken-guy.glb | https://static.poly.pizza/356751e5-10d4-4fec-8b35-68e2f09cab47.glb | 85d4f3671a9383f810a53bbac55da34b890e3eb0f16769c63d6643a1a436fae3 |
| cool-banana-guy.glb | https://static.poly.pizza/0be17c6d-4b23-4dbf-b5fa-ea0ed7ad58b8.glb | d12abda5c80a2fd9988c6a50be941134e765d673ca2aa8d7c52e324b49da07c6 |
| turtle.glb | https://static.poly.pizza/230aeead-8c15-470e-8feb-778cbae907a9.glb | a068045dde8482f7781eb6b1433c827db1762d051395f15899ad987431df60fc |

### GLB 직접 판독 결과(리더 실측 보완)

- 8개 모두 glTF 2.0 GLB, `extensionsUsed` 없음(Draco·meshopt 없음), 버퍼는 GLB 내장, 이미지는 bufferView 내장(바나나 자동차·Cool Bannana Guy·Chicken Guy 각 PNG 1024×1024 1장). → 기본 GLTFLoader로 추가 요청 없이 파싱.
- 모델마다 모든 프리미티브의 속성 묶음이 같음(왜건 `POSITION, TEXCOORD_0`, Chicken Guy `JOINTS_0, NORMAL, POSITION, TEXCOORD_0, WEIGHTS_0`, 나머지 `NORMAL, POSITION, TEXCOORD_0`) → 재질별 합치기(`mergeGeometries`)가 속성 불일치로 실패하지 않음.
- 긴 축이 모델마다 다름(버기·트럭은 x축, 바나나 자동차·왜건은 z축이 김, 원시 좌표 기준) → 모델별 회전값 데이터가 필요하고 앞뒤 방향은 렌더링 점검에서 눈으로 정함.
- Chicken Guy 동작 이름: `Armature|Grounded`, `Armature|Idle`, `Armature|Jump`, `Armature|Sprint`, `Armature|Walk`, 스킨 2.

### 정규화(실행 시, 도구 추가 없음)

`render/models.ts`의 `prepareModel(gltfScene, entry)` 한 함수가 모든 모델에 같은 순서를 적용합니다.

1. `updateMatrixWorld(true)`.
2. 정적 모델(차량 5, Cool Bannana Guy, Turtle): 메시마다 geometry를 복제해 world 행렬을 적용하고, 재질별로 `BufferGeometryUtils.mergeGeometries`로 합쳐 재질당 메시 1개로 만듦. 합치기 결과가 null이면 원래 메시 유지. 버기 프리미티브 162 → 재질 수 12 이하로 그리기 호출 감소(트럭 28 → 6, 바나나 자동차 19 → 8). Chicken Guy(뼈대 있음)는 합치지 않음.
3. 카탈로그 데이터의 `yawDeg`로 앞이 +Z를 향하게 회전.
4. `Box3.setFromObject`로 크기를 재고 균일 비율로 맞춤: 차량은 길이를 공통 표시 길이로, 사람은 키를 역할별 키로.
5. 바닥(`min.y`)을 0, 가로 중심을 원점으로 이동.
6. 결과를 메모리에 원본으로 보관하고 장면에는 복제본 사용(정적은 `clone()`이 geometry 공유, Chicken Guy는 `SkeletonUtils.clone`).

- **왜건 노멀**: GLTFLoader r186은 노멀 없는 geometry의 재질에 `flatShading = true`를 자동 적용합니다(GLTFLoader.js 3500·3559행 `useFlatShading = geometry.attributes.normal === undefined`). 코드 추가 없이 조명 아래 평면 음영으로 보입니다. 렌더링 점검에서 어색하면 `computeVertexNormals()` 한 줄로 바꿉니다.
- **외형과 무관한 동일 판정(FR-011)**: 충돌·정지선·카메라는 모두 `DRIVE_SPEC`의 공통 차체 값을 씁니다. 모델 상자 크기는 표시 비율 계산에만 쓰고 시뮬레이션으로 들어가지 않습니다. 탑승객·주인공 인물도 차량 표시 객체의 자식일 뿐 판정에 들어가지 않습니다.
- 사전 처리(gltf-transform CLI, Blender)는 쓰지 않습니다: 새 도구가 필요하고, 8개 모델을 한 번 처리하는 실행 시 비용이 무시할 만한 수준이기 때문입니다.

### 크레딧 "변경 사실" 표시 제안(FR-088)

- 공통(8종): "poly.pizza가 원작 파일을 GLB 형식으로 변환해 배포한 파일을 사용했습니다. 게임에서 크기·방향·바닥 위치를 맞추고, 여러 부분을 재질별로 합쳐 표시합니다."
- Chicken Guy: 위 문구에서 "합쳐" 대신 "포함된 걷기·서 있기 동작을 사용하고 몸 전체를 움직여 행동을 표현합니다."
- 원출처 주소는 poly.pizza 모델 페이지(`https://poly.pizza/m/<id>`, PRD 표)로 하고 누를 수 없는 글자로 표시.

---

## 배포

- **Vite `base`**: `'/driving_game/'`. 근거: 원격 `https://github.com/kimwoo-ya/driving_game.git`(git remote 확인) → Pages 주소 `https://kimwoo-ya.github.io/driving_game/`, Vite 공식 가이드의 GitHub Pages 설정 [vite.dev/guide/static-deploy#github-pages]. 저장소 이름이 바뀌면 이 한 줄을 고칩니다.
- **해시 파일 이름**: JS·CSS·GLB·소리·그림 모두 `dist/assets/<이름>-<hash>.<확장자>`. 새 배포는 새 이름이라 이전 캐시와 섞이지 않습니다. 이전 `index.html`이 캐시(max-age=600)에 남아 이미 지워진 이전 해시 파일을 요청하면 404 → JS/CSS는 부팅 가드, GLB는 loader가 감지해 "다시 시도(새로 고침)"를 보여 줍니다(Edge "새 버전 배포 직후"). 새로 고침이 `index.html`을 다시 검증하는지는 Safari에서 미확인 → 실제 기기 확인.
- **GitHub Pages 캐시 동작**: 실측 `cache-control: max-age=600`(GitHub Pages 응답, 2026-10-12). 공식 문서 명시는 미확인.
- **Actions 워크플로 개요**(`.github/workflows/deploy.yml`, Vite 공식 예시 구조 따름):
  - 트리거: `main` 푸시, 수동 실행(`workflow_dispatch`).
  - 권한: `contents: read`, `pages: write`, `id-token: write`(docs.github.com 사용자 정의 워크플로 문서 "minimum of pages: write and id-token: write").
  - 동시 실행: `group: pages`.
  - 단계: `actions/checkout@v7.0.1` → `actions/setup-node@v7.0.0`(node-version `24`, npm 캐시) → `npm ci` → `npm test` → `npm run build` → `actions/configure-pages@v6.0.0` → `actions/upload-pages-artifact@v5.0.0`(path `./dist`) → `actions/deploy-pages@v5.0.1`(environment `github-pages`).
  - 액션 버전 근거(GitHub API releases 조회 2026-10-12): checkout v7.0.1(07-20), setup-node v7.0.0(07-14; v7.1.0은 10-08로 2주 미만이라 `@v7` 대신 정확한 태그 고정), configure-pages v6.0.0(03-25), upload-pages-artifact v5.0.0(04-10), deploy-pages v5.0.1(09-01). Vite 예시와 같은 주 버전. docs.github.com 문서의 예시는 한 단계 낮은 주 버전(v5/v4/v4)을 보여 주며 문서가 늦게 갱신된 것으로 봅니다. 더 엄격히 하려면 태그 대신 커밋 SHA 고정(Vite 예시 방식).
  - Playwright는 CI에 넣지 않음(브라우저 내려받기 시간, CI의 WebGL 동작 미확인). 배포 전 로컬 실행, 필요해지면 추가.
- **사전 조건(사용자 작업)**: 저장소는 public이고 Pages가 아직 꺼져 있음(`gh api repos/kimwoo-ya/driving_game` → `has_pages: false`). Settings → Pages → Source를 "GitHub Actions"로 켜야 합니다. 저장소에 아직 커밋이 없음.

---

## 오류 처리와 보안·개인정보

| 상황 | 처리 | FR |
|---|---|---|
| 필수 GLB 실패·정체 | 그림 + 보호자용 짧은 글 + 다시 시도(실패 파일만, 사용자가 누를 때만, 자동 반복 없음), 성공 시 페이지 유지 | FR-004 |
| 이전 배포 파일 404 | 다시 시도 = 새로 고침 | Edge "새 버전 배포 직후" |
| JS·CSS 불러오기 실패, 구형 브라우저 | 부팅 가드 인라인 스크립트, `<script nomodule>` 안내 | FR-001, FR-005 |
| WebGL2 없음 | 3D 불가 안내(그림·글·지원 브라우저) | FR-005 |
| 플레이 중 컨텍스트 손실 | 일시정지 → 복구 대기 → 실패 시 새로 고침 안내, 저장 유지 | FR-006 |
| 저장 접근·쓰기 실패 | 이번 실행 값으로 계속, 안내 실행당 1회, 레이싱 열림·결과 표시 지연 없음(쓰기가 동기 try/catch라 막히지 않음) | FR-080 |
| 저장 값 손상·변조 | 항목별 검사 후 틀린 항목만 기본값 | FR-081 |
| 소리 실패 | 무시하고 진행, 진행은 소리 완료에 의존하지 않음 | FR-070 |
| 나중에 필요한 파일 실패 | 첫 버전은 필수 파일을 시작 전에 모두 받으므로 해당 없음. 소리만 나중에 받고 실패는 무시 | Edge "로딩·배포" |

보안·개인정보:

- 외부 요청 없음: 모든 파일은 같은 출처의 해시 파일. 외부 글꼴·CDN·분석·광고 코드 없음(FR-085). Playwright에서 모든 요청의 호스트가 테스트 서버와 같은지 검사(SC-025).
- 외부 링크 없음: `<a href>`를 만들지 않음. 크레딧 주소는 글자(FR-086, FR-090). Playwright에서 `a[href]` 0개 검사.
- 개인정보·권한: 입력 칸 없음, 기기 식별 값 없음, `getUserMedia`·위치·알림·동작 센서 API 호출 없음(FR-084).
- 저장 값 해석: `JSON.parse` 결과를 타입 검사 후 숫자·불리언·정해진 문자열만 사용. 화면에는 숫자를 직접 포맷해 `textContent`로만 표시. `innerHTML`·`eval`·`new Function` 사용 금지(FR-081).
- CSP 메타는 넣지 않음: 외부 코드가 없고 위 검사로 충분하며, 개발 서버(HMR)·GLTFLoader의 blob URL과 충돌할 여지가 있어서입니다. 외부 스크립트가 생기면 그때 추가합니다.

---

## 테스트 전략

### 층 구분

| 층 | 도구·장소 | 대상 |
|---|---|---|
| 자동 테스트 | Vitest(node 환경), `tests/unit/` | 순수 로직(sim, practice, pedestrianView 타임라인, race, storage 검증·합치기, input 판정, 규칙 순환), 콘텐츠 데이터 검증(규칙 38줄, 에셋 존재, 위반 선과 보행자 경로 거리) |
| 브라우저 확인 | Playwright(Chromium·WebKit, 모바일 가로 viewport + `hasTouch`), `tests/e2e/`, `vite preview`로 `/driving_game/` 하위 경로 제공 | 하위 경로 로딩·새로 고침, 로딩 실패 다시 시도(경로 차단), 3D 불가(`getContext('webgl2')`를 null로 바꾸는 초기화 스크립트), 저장 불가(localStorage 예외 초기화 스크립트), 세로 안내, 외부 요청 0·외부 링크 0, 시작 전 AudioContext 미생성 |
| 실제 기기 | 선정 스마트폰·태블릿(iPhone/iPad Safari, Android Chrome), 배포 주소 또는 개발 서버(Vite 8.3.3 이상으로 올린 뒤 `--host`) | 터치 취소·앱 전환·화면 잠금, 확대·스크롤 차단, 소리 잠금·무음, 노치·홈 바, 성능, 5분 경기 |
| 콘텐츠 검토 | 검토 기록 | 문구 표현(SC-027), 38문구 반영(SC-030), 위협적 소리 여부 |
| 어린이 관찰 | 보호자 동반 3~5세, 6~8세 | SC-028, SC-029 |

Playwright WebKit은 iOS Safari와 같지 않습니다(데스크톱 WebKit 빌드). WebKit headless에서 WebGL2가 동작하는지는 미확인 → 코드 기반 단계 첫 E2E에서 확인하고, 안 되면 3D가 필요한 시험은 Chromium만, DOM 흐름은 두 엔진 모두로 나눕니다.

### SC별 담당

| SC | 자동(Vitest) | 브라우저(Playwright) | 실제 기기 | 콘텐츠 검토 / 관찰 |
|---|---|---|---|---|
| SC-001 | 흐름이 5종 × 2모드 허용, `stepVehicle`에 차량 종류 매개변수 없음 | 5종 각각 연습·레이싱 진입(저장 값 주입으로 열림) | 일부 조합 확인 | |
| SC-002 | 5종 × 같은 틱 입력 × 프레임 간격 4종(8.3/16.7/33.3 ms, 불규칙) → 최고속도·정지 거리·회전 반경·후진 속도·기준 구간 통과 틱이 완전히 같음 | | 일반·저전력 모드에서 기준 구간 시간 비교 | |
| SC-003 | 7가지 계기에서 `releaseAll` 호출, `pointercancel` 처리 | 합성 포인터 이벤트로 취소·숨김 시나리오 | 7상황 × 10회 | |
| SC-004 | 브레이크 우선 20회, 주행 중 전환 20회 거절, 정지 중 전환 20회(연타) | | 같은 횟수 | |
| SC-005 | | 계산된 스타일(`touch-action`, `user-select`) 확인 | 각 10회 | |
| SC-006 | | 세로 viewport에서 가로 안내·틱 정지, 가로 복귀 후 자동 재개 없음 | 회전 시험 | |
| SC-007 | 일시정지 60초 동안 경기 틱·컴퓨터 차량·신호 변화 0 | `page.clock`(rAF·performance 제어)로 60초 진행 | 60초 일시정지·앱 전환 | |
| SC-008 | 3연습 × 4패턴 × 36,000틱(10분) 완료 0, 끝 지점 도달만으로 완료 0 | | | |
| SC-009 | 올바른 행동 스크립트로 3/3 완료, 직후 열림 | | 통과 플레이 | |
| SC-010 | 5실패 유형 → `violation` + 구간 재시도, 효과음 id가 허용 목록 안 | | | 소리 검토 |
| SC-011 | 기준 운전자(보통 아이 속도 프로필)로 경기 시간 4:30~5:30 확인(트랙 조정용 대리 지표) | | 실제 플레이 점검으로 확정 | |
| SC-012 | 30분 이상 느린 주행 시뮬레이션: 강제 종료 0, 시간 = 틱 × 1/60 | | 1회 | |
| SC-013, SC-014 | 후진 왕복 20, 역주행 1바퀴, 가로지르기, 복귀 10 / 끼임 10 | | | |
| SC-015, SC-018, SC-019 | 최고 기록 = 최솟값, 손상 6종, 두 탭 합치기 | | | |
| SC-016 | 저장·복원 왕복 | 새로 고침 후 3항목 복원 | | |
| SC-017 | 저장 실패 시 session 값 사용 | localStorage 예외 환경에서 시작~완주, 안내 1회 | | |
| SC-020 | 안내 단일 재생·배경음 낮춤 정책(순수 부분) | AudioContext 생성이 시작 버튼 뒤에만 | 실제 청취 | |
| SC-021 | 보행자 시점 안내 진행이 음성 완료를 기다리지 않음 | 소리 파일 경로 차단 후 완주까지 | 무음 상태 | |
| SC-022 | | `/driving_game/` 로딩, 새로 고침, GLB 실패 → 다시 시도, 3D 불가 안내 | 실제 공개 주소 | |
| SC-023 | | 가로 viewport 여러 개에서 조작 버튼 사각형이 서로·화면 가장자리 안전 영역과 겹치지 않음, 스크린샷 | 선정 기기 전체 | |
| SC-024 | | | `?perf` 측정 기록 | |
| SC-025 | 금지 API 사용 없음(코드 검토) | 요청 호스트 전부 같은 출처, 권한 API 호출 0 | | |
| SC-026 | 크레딧 데이터 8/8 필드 완비 | `a[href]` 0 | | 크레딧 검토 |
| SC-027 | | | | 문구·연출 검토 기록 |
| SC-028, SC-029 | | | | 어린이 관찰 |
| SC-030 | 규칙 표 38줄, 줄마다 그림·음성 파일 존재 | | | 그림·문구 검토 |
| SC-031 | 순환이 정한 횟수 안에 추가 규칙을 모두 1회 이상 포함, 핵심 규칙 매번 포함 | | | 검토 |
| SC-032 | 선택 인물 id가 보행자 시점 안내 주인공으로 전달 | 3 × 3 조합 스크린샷 | 확인 | |

### 결정적 주행 테스트(SC-002) 방법

- `tests/unit/determinism.test.ts`: 틱 번호로 짠 입력 스크립트(5초 가속 → 브레이크 정지 → 최대 조향 한 바퀴 → 정지 후 후진 3초 → 기준 구간 통과)를 루프 드라이버에 넣고, 프레임 간격 일정(16.7 ms), 저속(33.3 ms), 고속(8.3 ms), 불규칙 목록으로 각각 돌립니다. 5개 차량 id로 반복해 최종 상태와 측정값이 `toEqual`로 완전히 같아야 통과합니다.
- 허용 오차 제안: 자동 테스트는 0(완전 일치). 실제 기기 측정은 입력 시작 시점이 1틱 어긋날 수 있으므로 시간 ±0.05초(3틱), 거리 ±0.1 m. 같은 기기 안에서는 같은 코드 경로라 비트 단위로 같고, 기기 사이에는 `Math.sin/cos` 엔진 구현 차이로 마지막 자리가 다를 수 있습니다(SC-002는 기기 사이 비교를 요구하지 않음).

### 실행 명령(npm scripts 확정 제안)

| 스크립트 | 명령 | 용도 |
|---|---|---|
| `dev` | `vite` | 개발 서버(8.3.3 이상으로 올리기 전 `--host` 금지) |
| `typecheck` | `tsc --noEmit` | 타입 검사 |
| `test` | `vitest run` | 자동 테스트(CI에서도 실행) |
| `build` | `tsc --noEmit && vite build` | 타입 검사 + 배포 빌드 |
| `preview` | `vite preview` | 빌드 결과를 `/driving_game/`로 제공 |
| `test:e2e` | `playwright test` | 브라우저 확인(webServer가 `npm run build && npm run preview -- --port 4173 --strictPort` 실행, baseURL `http://localhost:4173/driving_game/`) |

- Vitest 설정은 `vite.config.ts`의 `test.include: ['tests/unit/**/*.test.ts']`(Vitest 기본 포함 패턴이 `*.spec.ts`도 잡으므로 E2E 파일과 분리). `vitest/config`의 `defineConfig` 사용.
- Playwright 첫 실행 전 `npx playwright install chromium webkit`(브라우저 내려받기 → 사용자 승인 필요).
- `vite preview`가 `base` 하위 경로로 제공하는지는 첫 E2E 태스크에서 확인(미확인).
- E2E 관찰용: `document.body.dataset.screen`(항상), `?e2e`일 때만 `window.__e2e`(틱 수·경기 틱·플레이어 순위 읽기 전용).

---

## 성능

SC-024 목표 수치는 초기 기기 점검에서 정합니다(PRD). 아래는 그 점검을 시작할 **초기 예산 제안**이며 확정값이 아닙니다.

| 항목 | 초기 예산(제안) | 측정 방법 |
|---|---|---|
| 필수 파일 전송량 | 약 4 MB 이하(GLB 약 2.5 MB + JS·CSS·UI 그림) | `vite build` 결과 `dist/` 크기, 기기 브라우저 개발 도구 네트워크 탭 |
| 첫 화면까지 시간 | 기기 점검에서 확정 | `?perf`: 페이지 시작(`performance.timeOrigin`)부터 시작 화면 준비까지 |
| 그리기 호출 | 마을 장면 120 이하, 트랙 장면 60 이하 | `renderer.info.render.calls` |
| 삼각형 | 프레임당 15만 이하 | `renderer.info.render.triangles` |
| 텍스처 | 장당 1024² 이하, 합계 8장 이하(현재 GLB 1024² 3장) | `renderer.info.memory.textures` |
| 픽셀 비율 | `min(devicePixelRatio, 2)`, 저사양에서 낮출 상수 하나 | 기기 점검에서 조정 |
| 그림자 | 그림자 맵 없음(바닥 원형 그림자만) | |
| 프레임 | 60 fps 목표, 판정 기준(평균·5초 구간 최저)은 기기 점검에서 | `?perf`: 평균 fps, 가장 긴 프레임 |
| 소리 메모리 | 배경음 30~60초 반복 구간 | |

- `?perf`는 `render/stage.ts` 안의 작은 표시(같은 출처 쿼리 문자열이라 외부 연결 아님).
- 측정 절차: 선정 기기마다 배포 주소 `?perf`로 열어 로딩 시간, 마을 연습 60초와 레이싱 60초(버기를 포함한 4대)의 평균 fps·가장 긴 프레임·그리기 호출을 기록. 기록 위치는 tasks 단계에서 정함.
- 부하 줄이는 장치: 정적 모델·마을 정적 부분 재질별 합치기, 모델 원본 공유 복제, 그림자 맵 없음, 픽셀 비율 상한.

---

## 열린 항목 결정안 (research.md용)

### 1. 모델 정규화 방법

- **Decision**: 실행 시 `prepareModel` 한 함수로 모든 모델 처리(재질별 합치기 → 데이터 `yawDeg` 회전 → `Box3` 기준 균일 비율 → 바닥 0·중심 원점). 왜건은 GLTFLoader 자동 평면 음영으로 처리. 충돌·정지선·카메라는 공통 `DRIVE_SPEC` 값만 사용.
- **Rationale**: 새 도구 없이 승인 스택(three addons)만으로 가능. 8개 모델을 한 번 처리하는 비용이 작음. 판정이 모델 크기와 분리되어 FR-011이 구조적으로 보장됨. GLB 판독 결과 속성 묶음이 모델 안에서 같아 합치기가 실패하지 않음.
- **Alternatives considered**: gltf-transform CLI로 미리 처리(새 dev 도구·파일 관리 증가), Blender 수작업(재현 어려움, 원본 변경 범위 증가), 합치지 않음(버기 한 대 162 그리기 호출, 레이싱에서 버기가 여러 대면 부담).

### 2. 바퀴 수·약 5분 맞추기, SC-024 측정, 바퀴 회전 표현

- **Decision(트랙)**: 바퀴 수는 2바퀴 권장(바퀴 진행 표시가 의미 있고 트랙을 짧게 만들 수 있음). 트랙 길이·속도·컴퓨터 차량 설정은 `content/track.ts` 데이터. 결정적 시뮬레이션으로 "보통 아이" 기준 운전자의 경기 시간을 Vitest에서 계산해 4:30~5:30에 들도록 조정한 뒤, 실제 플레이 점검으로 확정.
- **Decision(SC-024)**: `?perf` 측정 표시 + 기기별 기록, 목표 수치는 첫 기기 점검 결과로.
- **Decision(바퀴 회전)**: 첫 버전은 **바퀴 회전 표현 없음**(5종 모두 같은 표현) 권장.
- **Rationale**: 바퀴 분리는 바나나 자동차만 확실(`tire` 이름 노드). 지프·왜건은 단일 메시라 불가, 버기·트럭은 이름 없는 그룹이라 수작업 식별 필요. 뒤에서 내려다보는 카메라에서 바퀴 회전은 잘 보이지 않음. 한 차량만 바퀴가 돌면 차량 간 표현 차이가 생김.
- **Alternatives considered**: 바나나 자동차만 이름 기반 회전(약 10줄, 합치기에서 `tire*` 제외 필요, 표현 불균일), Blender로 다른 차량 바퀴 분리(새 도구·모델 변경 증가), 1바퀴(트랙이 길어져 장면 제작량 증가).

### 3. "정지" 판정, 고정 시간 간격 주행, 허용 오차

- **Decision**: 페달을 떼면 자연 감속해 서서히 멈춤. 속도가 아주 작고 액셀이 없으면 정확히 0으로 맞추고 `speed === 0`을 "완전히 멈춤"으로 판정. 브레이크로 세우든 저절로 서든 정지로 인정. 틱 1/60초 고정. 허용 오차: 자동 0, 실제 기기 시간 ±0.05초·거리 ±0.1 m.
- **Rationale**: 3~5세가 "손을 떼면 선다"로 멈출 수 있음. 0으로 맞춤이 있어 "눈에 보이는 움직임 없음"과 판정이 일치. 틱 기반이라 화면 갱신 속도와 무관하게 같은 결과.
- **Alternatives considered**: 브레이크로만 정지 인정(어린아이에게 어려움, 플레이 점검에서 문제가 보이면 재검토), 자동 정지 유지(현실 운전과 다른 인상), 가변 시간 간격(결정성 없음).

### 4. 배포 직후 파일 섞임, 하위 경로 로딩, 로딩 실패·다시 시도

- **Decision**: `base: '/driving_game/'`, 모든 에셋 import(해시 이름), 라우터 없음, 부팅 가드 인라인 스크립트, 로더의 바이트 진행률·정체 시간 초과·실패 파일만 다시 받기, 404면 새로 고침.
- **Rationale**: Vite 공식 GitHub Pages 방식. 해시 이름으로 새 배포가 이전 캐시와 섞이지 않음. URL이 바뀌지 않으므로 새로 고침이 항상 같은 `index.html`. Pages의 `max-age=600` 때문에 생기는 이전 `index.html` 문제를 404 감지로 처리.
- **Alternatives considered**: `base: './'` 상대 경로(어느 경로에서도 동작하지만 E2E에서 하위 경로 검증이 덜 직접적), `public/` 고정 이름(이전 JS와 새 모델이 섞여 방향·크기 데이터가 어긋날 수 있음), 서비스 워커 캐시(오프라인 범위 밖, 갱신 처리 복잡).

### 5. 사람 모델 동작 표현(FR-039, FR-096)

| 선택지 | 내용 | 장점 | 단점 |
|---|---|---|---|
| A. Chicken Guy 관절 자세 조정 + 다른 둘은 정적 | Chicken Guy는 `Head` 회전·팔 관절로 손 들기·좌우 보기, 나머지 둘은 몸 전체 이동 | Chicken Guy 동작이 가장 그럴듯함 | 아이가 고른 주인공에 따라 같은 규칙의 표현이 달라짐(SC-032 9조합 표현 불균일), 관절 조정 코드는 Chicken Guy 전용 |
| B. 세 인물 공통 몸짓 + 그림 카드 중심(권장) | 3D는 세 인물 모두 같은 몸 전체 동작(걷기 = 이동 + 통통 튐, 좌우 보기 = 몸 돌리기, 멈춤), 손 들기는 인물 머리 위 손 그림 표시 + 규칙 카드 그림이 정확한 행동을 보여 줌. Chicken Guy는 있는 `Walk`/`Idle` 클립만 재생 | 주인공과 무관하게 같은 교육 표현, 코드 한 경로, 보행자 시점 안내가 원래 "그림과 음성"(FR-041) | 3D 인물이 실제로 팔을 들지는 않음 |
| C. 정적 모델 둘에 뼈대 추가(Blender) | 세 인물 모두 관절 동작 | 가장 풍부한 표현 | 새 도구, 모델 변경 범위·크레딧 변경 증가, 작업량 큼 |

- **Decision(권장)**: B. 모델 렌더링 점검에서 어색하면 A를 Chicken Guy에 한해 추가 검토.
- **Rationale**: 교육 내용의 정확성은 규칙 카드 그림이 맡고, 3D 인물은 "고른 인물이 그 장소에 있다"를 보여 주는 역할. 위험 행동을 본보기로 보이지 않는 원칙(FR-094)도 몸짓 목록을 올바른 행동으로만 제한해 지킬 수 있음.
- **Alternatives considered**: 위 표의 A, C.
- 이 선택은 FR-096이 "기술 설계와 모델 렌더링 점검에서 정한다"고 둔 항목이라 **사용자 확인 권장**(리더에게 넘길 항목).

### 6. 인물 선택 화면, 탑승객 배치, 아이 차량 탑승객

- **Decision**: 차량·인물 선택은 `render/showroom.ts` 3D 진열 장면 위에 투명 DOM 버튼 열(모델 수만큼 같은 폭)을 겹침. 고르면 해당 모델 확대·회전 + 버튼 테두리 강조. 미리 만든 썸네일 그림은 없음. 탑승객은 차량 카탈로그의 `seats`(좌석 위치·크기 목록, 0개 허용) 데이터로 차량 표시 객체의 자식으로 배치. Chicken Guy 탑승객은 `SkeletonUtils.clone` + `Idle`.
- **기술 제약**: 탑승객은 판정·카메라에 영향 없음(자식 객체일 뿐). 뚜껑이 있는 차량(왜건·트럭 운전석)은 뒤에서 내려다보는 카메라에서 탑승객이 거의 안 보일 수 있어 `seats: []`도 허용. 인물 크기는 좌석에 맞춰 역할별 키로 정규화. 아이 차량에 탑승객을 보일지는 콘텐츠 설계 몫(카메라가 차 뒤 위쪽이라 보여도 작게 보임).
- **Rationale**: 썸네일 제작·라이선스 변경 표시가 필요 없고, 같은 렌더러를 재사용.
- **Alternatives considered**: 미리 렌더링한 썸네일 이미지(콘텐츠 작업 증가, 모델이 바뀌면 다시 만들어야 함), 실행 중 오프스크린 렌더 썸네일(코드 증가).

### 7. 테스트 방법 구분과 실제 명령

- **Decision**: 자동 테스트(Vitest) / 브라우저 확인(Playwright) / 실제 기기 / 콘텐츠 검토 / 어린이 관찰 5층. 명령은 위 npm scripts 표. CI는 `npm test` + `npm run build`.
- **Rationale**: 순수 로직 분리로 대부분 SC를 node에서 빠르게 결정적으로 시험. 터치·소리·성능은 실제 기기에서만 의미가 있음(AGENTS.md 테스트 층 구분).
- **Alternatives considered**: Vitest 브라우저 모드(추가 패키지 `@vitest/browser-playwright` 필요), jsdom(three.js 렌더링 불가, 이득 적음), CI에서 Playwright(나중에 필요하면).

### 8. 콘텐츠 작업 분리

- **Decision**: 코드 단계는 자리표시 콘텐츠(단순 도형 그림, 음성 없음, 최소 장면 요소)로 기능을 완성하고, 콘텐츠는 별도 단계에서 `src/content/*.ts` 데이터와 `src/assets/**` 파일만 채움. 콘텐츠 검증 Vitest(38줄, 파일 존재, 거리 조건)가 두 단계의 연결을 지킴.
- **Rationale**: 규칙 38문구 그림, 음성, 배경음 선정·사용조건 확인, 마을 장면 요소 15종은 작업량이 크고 사용자 결정(제작 방법·곡 선정)이 필요해 코드 진행을 막지 않게 분리.
- **Alternatives considered**: 기능마다 최종 콘텐츠까지 함께 완성(콘텐츠 결정 대기로 코드가 멈춤).

---

## 작업 단계 제안

| 단계 | 내용 | 완료 확인 |
|---|---|---|
| 0. 준비(사용자 승인 필요) | `package.json`·잠금 파일·설정 파일 생성과 의존성 설치, GLB 8개 내려받기·체크섬, Playwright 브라우저 설치, Pages 소스를 GitHub Actions로 켜기, 첫 커밋·푸시 | `npm ci`, `shasum -a 256 -c` |
| 1. 코드 기반 | 부팅·로더·3D 불가·로딩 실패, stage·models(**모델 8종 실제 렌더링 점검**: 방향·크기·왜건 음영·버기 합치기), 루프, 입력, 차량 sim·충돌, 화면 흐름(시작·선택·연습 목록 뼈대), 일시정지·생명주기·세로 안내, 저장 모듈(3항목 검증·합치기), **배포 파이프라인을 이 단계에서 먼저 연결**해 하위 경로 확인 | `npm test`, `npm run build`, `npm run test:e2e`(하위 경로·3D 불가·저장 불가), 실제 배포 주소 열기 |
| 2. 안전 연습 | 조작 익히기, 연습 판정 엔진(자리표시 마을 배치로 1개 상황 → 3개), 신호·보행자 진행, 위험 직전 멈춤, 보행자 시점 안내 타임라인(자리표시 카드), 규칙 순환, 레이싱 열림 저장 | SC-008·009·010·031 Vitest, 플레이 확인 |
| 3. 레이싱 | 트랙 데이터(자리표시), 진행도·바퀴·순위, 컴퓨터 차량, 접촉·끼임 복귀, 카운트다운, 결과·최고 기록, 재도전 | SC-012~015 Vitest, SC-011 대리 지표 |
| 4. 소리·저장 마무리 | 오디오 엔진(잠금 해제, 단일 안내, 덕킹, 일시정지·재개, 설정), 저장 불가 안내 흐름 | SC-016~021 Vitest·Playwright |
| 5. 콘텐츠 제작 | 마을 장면 요소(FR-092: 주차된 차, 후진하는 차, 버스·트럭, 통학버스·정류장, 골목길, 보도 없는 길, 신호등 없는 횡단보도, 노란 대기선, 육교 또는 지하도, 비·어두운 날 연출), 규칙 38문구 그림, 안내 음성, 효과음, 배경음 선정·사용조건 확인, UI 그림, 크레딧 최종 | 콘텐츠 Vitest(SC-030), 검토 기록(SC-026·027·030·031) |
| 6. 점검 | 초기 기기 점검(SC-023·024 목표 확정), 트랙 플레이 점검(바퀴 수·5분, SC-011), 실제 기기 시험(SC-003~007), 어린이 관찰(SC-028) | 기록 |

2와 3은 1이 끝나면 나란히 진행 가능합니다. 5는 2·3에서 데이터 형식이 정해진 뒤 시작합니다.

---

## Project Structure

### Documentation (this feature)

```text
specs/001-kids-driving-safety-game/
├── plan.md              # /speckit-plan 산출물
├── research.md          # 위 "열린 항목 결정안"
├── data-model.md        # 게임 state·엔티티·저장 형식(data-modeler)
├── quickstart.md        # 설치·GLB 내려받기·실행·테스트 명령
├── contracts/           # 모듈 인터페이스·이벤트·저장 형식·에셋 목록·정적 경로(contract-designer)
├── checklists/
└── tasks.md             # /speckit-tasks 산출물
```

### Source Code (repository root)

```text
driving_game/
├── index.html                    # 셸, 부팅 가드(인라인), nomodule 안내, viewport 메타
├── package.json
├── package-lock.json
├── tsconfig.json                 # strict, noEmit, moduleResolution bundler, types: vite/client, include: src, tests
├── vite.config.ts                # base '/driving_game/', test.include tests/unit
├── playwright.config.ts          # Chromium·WebKit 모바일 가로, webServer = build + preview
├── .github/workflows/deploy.yml  # Pages 배포
├── modeling/                     # 제공 ZIP 원본(보존, .gitignore 대상)
├── src/
│   ├── main.ts
│   ├── style.css
│   ├── app/
│   │   ├── flow.ts
│   │   ├── session.ts
│   │   └── loader.ts
│   ├── core/
│   │   └── loop.ts
│   ├── input/
│   │   └── controls.ts
│   ├── sim/
│   │   ├── vehicle.ts
│   │   └── collision.ts
│   ├── practice/
│   │   ├── drivingLesson.ts
│   │   ├── practice.ts
│   │   ├── townActors.ts
│   │   └── ruleRotation.ts
│   ├── pedestrianView/
│   │   └── pedestrianView.ts
│   ├── race/
│   │   ├── race.ts
│   │   ├── progress.ts
│   │   └── ai.ts
│   ├── render/
│   │   ├── stage.ts
│   │   ├── models.ts
│   │   ├── townView.ts
│   │   ├── trackView.ts
│   │   ├── people.ts
│   │   └── showroom.ts
│   ├── ui/
│   │   ├── screens.ts
│   │   ├── hud.ts
│   │   └── overlays.ts
│   ├── audio/
│   │   └── audio.ts
│   ├── storage/
│   │   └── save.ts
│   ├── platform/
│   │   └── lifecycle.ts
│   ├── content/                  # 정적 콘텐츠 데이터(코드와 분리)
│   │   ├── vehicles.ts           # 차량 5종: id, 표시 그림, 모델 파일 키, yawDeg, seats
│   │   ├── people.ts             # 인물 3종: id, 표시 그림, 모델 파일 키, yawDeg, 역할별 키
│   │   ├── rules.ts              # 규칙 38문구: id, 연습, 핵심/추가, 문구, 그림 키, 음성 키, 장면 요소, 조사 ID
│   │   ├── scenarios.ts          # 세 안전 상황: 구간, 정지선, 신호·보행자 계획, 보행자 시점 안내 설정
│   │   ├── town.ts               # 마을 배치: 구역, 도로, 횡단보도, 신호등, 장면 요소
│   │   ├── track.ts              # 트랙: 중심선, 폭, 구간 문, 복귀 위치, 바퀴 수, 구성 키, 컴퓨터 차량 설정
│   │   ├── voice.ts              # 안내 음성 줄 목록(줄 id, 문구, 파일 키)
│   │   └── credits.ts            # 자료 출처: 종류, 작품명, 제작자, 원출처, 라이선스, 변경 내용, 확인일
│   └── assets/                   # 바이너리 에셋(import로 해시 이름)
│       ├── models/               # GLB 8개 + SHA256SUMS
│       ├── images/
│       │   ├── rules/            # 규칙 그림(38)
│       │   └── ui/
│       └── audio/
│           ├── voice/
│           ├── sfx/
│           └── bgm/
└── tests/
    ├── unit/                     # Vitest: sim·practice·race·storage·input·content 검증
    └── e2e/                      # Playwright: 하위 경로·모바일 가로·오류 환경·외부 요청
```

**Structure Decision**: 서버가 없는 정적 웹게임이라 단일 프로젝트(저장소 루트)로 둡니다. 순수 로직 폴더(`sim`, `practice`, `pedestrianView`, `race`, `storage`)는 DOM·WebGL·Web Audio를 import하지 않고, 화면 폴더(`render`, `ui`, `audio`, `platform`)는 순수 로직 결과만 사용합니다. 콘텐츠는 `content`(데이터)와 `assets`(파일)로 코드와 분리합니다.

---

## Complexity Tracking

없음(constitution 없음, 승인 스택 밖 의존성 추가 없음 — `@types/three`는 three 타입용으로 승인 메모가 예시로 든 항목).

의도적으로 단순화한 부분과 한계(필요해지면 추가):

- 렌더링 보간 없음 → 120 Hz 기기에서 끊김이 보이면 추가.
- 한 프레임 최대 8틱 → 7.5 fps 미만 기기에서는 게임이 느려짐(시간 동일성 깨짐). 점검 결과 그런 기기가 지원 대상이면 재검토.
- CSP 메타 없음 → 외부 스크립트를 넣게 되면 추가.
- Playwright CI 미포함 → 회귀가 잦아지면 추가.
- 바퀴 회전 없음 → 렌더링 점검에서 어색하면 바나나 자동차부터.
- 다른 탭 실시간 동기화 없음(쓰기 때 합치기만) → 요구사항 범위.

---

## Technical Risks

| 리스크 | 영향 | 완화 |
|---|---|---|
| iOS Safari 터치: 시스템 제스처·알림으로 터치 취소, `pointerup` 누락, 가장자리 쓸기 | 입력이 남음(FR-016) | 좌표 기반 판정, `pointercancel`·`blur`·숨김 때 일괄 해제, 버튼을 가장자리에서 떨어뜨림, SC-003 실제 기기 70회 |
| iOS 확대 방지: `user-scalable=no` 무시 가능성, 두 번 탭 확대 | 조작 방해(FR-020) | `touch-action: none`, `gesturestart`·`touchmove`·`dblclick` preventDefault, 실제 기기 SC-005. iOS 버전별 동작 미확인 |
| iOS 오디오 잠금: 사용자 동작 필요, 앱 전환·통화 뒤 `interrupted`, 무음 스위치 감지 불가 | 소리 안 남 | 시작 버튼에서 resume, 이후 동작마다 재시도, 핵심 안내는 그림 |
| 화면 방향: iOS는 방향 고정 불가 | 세로에서 진행 | 세로 안내 + 일시정지(방향 고정에 의존 안 함) |
| 백그라운드에서 페이지 정리·컨텍스트 손실 | 복귀 시 처음부터 | 로딩부터 다시(저장 유지), 컨텍스트 손실 처리 |
| 저사양 기기: 채우기 비용(픽셀 비율), 그리기 호출 | 프레임 저하 | 픽셀 비율 상한, 합치기, 그림자 맵 없음, `?perf` 측정 후 조정 |
| 모델 크기·방향 제각각(좌표 단위 0.05~800) | 표시 오류 | `Box3` 정규화 + 데이터 회전값, 렌더링 점검 |
| 버기 그리기 호출(162) | 레이싱 부하 | 재질별 합치기(12 이하) |
| Playwright WebKit headless WebGL 미확인 | 3D E2E 불가 가능 | 첫 E2E에서 확인, 안 되면 3D 시험은 Chromium |
| Vite 8.3.1 개발 서버 보안 권고(10-06) | `--host` 사용 시 파일 노출 가능 | 10-20 이후 8.3.3 이상으로 올리기 전 `--host` 금지, 실제 기기는 배포 주소로 확인 |
| TypeScript 7 공개 API 없음 | API 쓰는 도구와 호환 안 됨 | 그런 도구를 쓰지 않음, 필요해지면 6.0.3 |
| GitHub Pages `max-age=600` | 배포 직후 이전 `index.html` | 해시 이름 + 부팅 가드 + 404 새로 고침 |
| Safari 오래 방문 안 한 사이트 저장 데이터 삭제 | 기록 사라짐 | spec이 "브라우저 데이터 삭제"와 같게 봄(결함 아님) |
| 기기 자동 잠금 | 긴 대기 중 화면 꺼짐 | 연습 대기 시간을 짧게(콘텐츠), 잠금은 숨김과 같은 일시정지 |
| 콘텐츠 분량(그림 38, 음성, 배경음 사용조건) | 일정 지연 | 별도 단계, 자리표시로 코드 완성, 사용자 결정 조기 요청 |
| 배경음 디코딩 메모리 | 저사양 메모리 부족 | 30~60초 반복 구간 |

---

## 리더에게 넘길 항목

### spec·PRD 공백·모순

1. **PRD의 "ZIP 원본 → 변환" 문구와 GLB 사용**: PRD "제공된 차량·사람 모델"·"개발 시 확인할 사항"(PRD.md:138, 158)은 ZIP을 변환한다고 전제합니다. 실제로는 poly.pizza가 배포하는 GLB를 받아 씁니다. PRD 보완 문구 제안: "게임에는 poly.pizza 배포 페이지가 제공하는 GLB(원작자 파일을 poly.pizza가 형식 변환한 파일)를 받아 사용하고, ZIP 원본은 `modeling/`에 보존합니다." 또 `.gitignore`에 `modeling/`이 있어 ZIP은 GitHub에 올라가지 않는다는 사실도 함께 알릴 것.
2. **버스·통학버스 모델 없음**: FR-092는 버스·트럭·통학버스를 요구하지만 제공 모델은 트럭뿐입니다. 제안: 버스·통학버스·정류장·육교 등은 기본 도형으로 직접 만듦(외부 자료 추가 없음 → 라이선스 확인 불필요). 다른 외부 모델을 쓰려면 사용자 승인과 사용조건 확인이 필요.
3. **처음 이용 흐름과 연습 목록의 진입 조건**: FR-029·FR-049, US3 시나리오 2·6은 "처음 이용 시 순서대로 이어짐"과 "완료 전에도 연습 목록에서 고름"을 모두 요구하지만, 이번 실행에서 연습 하나를 마치고 시작 화면으로 나간 뒤 다시 시작하면 순서대로 이어 가는지 목록을 보여 주는지가 정해져 있지 않습니다. 제안: "저장된 완료 기록이 없고 이번 실행에서 처음 시작할 때만 순서대로, 그 밖에는 연습 목록".
4. **FR-004 "다시 시도 성공 시 페이지를 새로 열지 않음"과 배포 직후 404**: 이전 해시 파일이 지워진 경우 다시 받아도 성공할 수 없습니다. 제안: 실패 원인이 404면 다시 시도 버튼이 페이지를 새로 엶(그 밖의 네트워크 실패는 FR-004대로 페이지 유지).
5. **잘못된 행동 종류 목록 차이**: FR-033(정지 위치 넘어 진입, 멈추지 않고 통과, 안전 전 출발, 보행자 건너는 횡단보도 진입·회전, 보도 진입)과 SC-010(정지선 초과, 멈추지 않고 통과, 정지 신호 중 출발, 보행자 횡단 중 출발, 회전 시 기다리지 않음)의 다섯 가지가 서로 다릅니다(SC-010에 보도 진입 없음). 모순은 아니지만 판정 이벤트 종류를 둘의 합집합으로 정할 것을 제안: `overStopLine`, `ranRed`, `earlyStart`, `enteredCrosswalkWithPedestrian`, `turnedIntoCrossingPedestrian`, `enteredSidewalk`.
6. **최고 기록 정밀도**: FR-064는 저장·비교·표시를 같은 정밀도로 요구하지만 단위가 없습니다. 제안: 1/10초 정수(틱에서 변환). data-modeler와 확정 필요.
7. **가로 180° 뒤집기**: spec Edge "화면"은 일시정지하지 않는다고 하고 FR-017은 화면 회전 때 입력 해제를 요구합니다. 해석: 입력은 해제하고 일시정지는 하지 않음.
8. **"너무 작은 영역" 기준**(spec Edge "화면", 태블릿 화면 분할)의 크기 값이 없음 → 기기 점검에서 정하는 상수로 둠.

### 사용자 결정 필요(승인 범위를 넘는 항목)

1. **사람 모델 동작 표현**: 권장 B(세 인물 공통 몸짓 + 그림 카드 + 머리 위 손 그림, Chicken Guy는 기존 걷기·서 있기 클립만). A(Chicken Guy 관절 조정)·C(Blender 뼈대 추가)와의 선택.
2. **바퀴 회전 없음**(첫 버전 5종 동일) 동의 여부.
3. **안내 음성 제작 방법**: 직접 녹음 / TTS 서비스로 미리 만든 파일(서비스 이용조건 확인과 크레딧 표시 필요, FR-089). 실행 중 브라우저 음성 합성(`speechSynthesis`)은 기기마다 한국어 음성 유무·품질이 달라 권장하지 않음.
4. **규칙 그림 38장·UI 그림 제작 방법**(직접 그림, 생성 도구 사용 여부, 외부 제작) — FR-095 "새로 만든다"와 사용조건 기준.
5. **배경음악 곡과 녹음 음원 선정**(저작권 만료 곡 + 직접 연주 또는 CC0 녹음 등).
6. **도구 버전**: TypeScript 7.0.2(권장) vs 6.0.3, Vite 8.3.1로 시작해 2026-10-20 이후 8.3.3 이상으로 올리기(보안 수정) 동의.
7. **바퀴 수 2 권장**(트랙 플레이 점검에서 확정), **정지 판정**(자연 감속으로 선 것도 정지 인정), **SC-002 허용 오차**(자동 0, 기기 ±0.05초·±0.1 m).

### 사용자 승인이 필요한 작업(implement 전)

- `package.json` 생성·의존성 설치(`npm install`), Playwright 브라우저 설치(`npx playwright install chromium webkit`).
- GLB 8개를 `src/assets/models/`에 내려받아 커밋, `SHA256SUMS` 추가.
- GitHub 저장소 Settings → Pages → Source "GitHub Actions" 켜기(현재 `has_pages: false`), 첫 커밋·`main` 푸시(현재 커밋 없음).

### data-modeler·contract-designer와 맞출 이름

- 모듈 경로: 위 Project Structure의 `src/**` 파일 이름 그대로.
- 화면 상태: `boot`, `unsupported`, `loading`, `loadFailed`, `start`, `credits`, `pickVehicle`, `pickPerson`, `drivingLesson`, `practiceMenu`, `practice`, `race`, `raceResult`, `fatal`. 겹침 플래그: `paused`, `rotate`, `storageNotice`, `contextLost`, `confirmExit`. 연습 내부 단계: `driving`, `explaining`, `pedestrianView`, `done`. 경기 내부 단계: `countdown`, `running`, `finished`.
- 타입: `DriveInput`, `ControlButton`(`left`, `right`, `accel`, `brake`, `reverse`, `pause`), `VehicleState`, `Gear`(`forward` | `reverse`), `DRIVE_SPEC`, `RunState`, `SaveData`, `PracticeState`, `PracticeEvent`, `ViolationKind`, `PedestrianViewState`, `RaceState`, `RaceEvent`, `Progress`, `ScenarioId`, `RuleId`, `VehicleId`, `PersonId`, `TrackConfigKey`.
- 함수: `stepVehicle`, `requestGearToggle`, `pressedButtons`, `toDriveInput`, `releaseAll`, `stepPractice`, `stepDrivingLesson`, `pickRules`, `stepPedestrianView`, `stepRace`, `computeRanks`, `loadSave`, `commitSave`, `prepareModel`, `loadRequired`, `retryFailed`.
- 이벤트(제안): 연습 `signalChanged`, `pedestrianStarted`, `hint`, `redirect`, `violation`, `segmentReset`, `demoReplay`, `pedestrianViewStart`, `scenarioCompleted` / 보행자 시점 안내 `cardShown`, `ended` / 경기 `countdownTick`, `go`, `rankChanged`, `lapCompleted`, `respawned`, `carFinished`, `playerFinished`.
- 콘텐츠 상수: `VEHICLES`, `PEOPLE`, `RULES`, `SCENARIOS`, `TOWN`, `TRACK`, `VOICE_LINES`, `CREDITS`.
- ID 제안: 차량 `buggy`, `jeep`, `truck`, `wagon`, `banana-car` / 인물 `chicken-guy`, `cool-banana-guy`, `turtle` / 연습 `signal-wait`, `crossing-check`, `turning-car` / 규칙은 조사 ID(예: `A6`, `A14-A15`처럼 묶음은 하이픈).
- data-modeler에게 넘길 경계: 저장 형식은 `storage/save.ts` 하나만 다룸(한 키, 형식 버전 필드), 최고 기록은 `TrackConfigKey`(트랙 id + 바퀴 수 + 트랙 버전)와 함께 저장, 시뮬레이션 상태는 저장하지 않음, `RunState`는 메모리만.
- contract-designer에게 넘길 통합 패턴: 모든 모듈 연결은 동기 함수 호출 + step 반환 이벤트(이벤트 버스·비동기 메시지 없음), 비동기는 `loadRequired`·`retryFailed`·소리 디코딩뿐, 외부 API·REST 없음, 정적 경로는 `/driving_game/assets/<이름>-<hash>.<확장자>`(빌드가 정함, 코드에 경로 문자열을 쓰지 않음).
