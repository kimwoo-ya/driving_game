# Implementation Plan: 아동용 3D 운전·보행 안전 게임 — 첫 버전

**Branch**: `001-kids-driving-safety-game` (스펙 폴더 이름입니다. Git 브랜치는 만들지 않았습니다. 첫 커밋은 2026-10-12에 만들었습니다(`2739ec0`).) | **Date**: 2026-10-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-kids-driving-safety-game/spec.md`

**캐릭터 제작 진행(2026-10-12)**: Blender 5.2.2 LTS와 Blender Lab 공식 MCP를 설치하고 Cool Bannana Guy·Turtle에 리깅을 추가했습니다. `src/assets/models/`의 캐릭터 GLB 3종, `assets-source/characters/`의 편집본, 생성·검증 스크립트를 준비했습니다. [작업 기록](_workspace/03_character-rigging.md)은 모델 단위 완료 근거이며 게임 실행 코드·차량 좌석 배치·모바일 성능의 완료를 뜻하지 않습니다.

**함께 읽을 문서**: [research.md](./research.md)(기술 선택과 결정 근거), [data-model.md](./data-model.md)(게임 state·엔티티·저장 형식), [contracts/](./contracts/overview.md)(모듈 인터페이스·이벤트·저장·에셋·콘텐츠 데이터·정적 경로), [quickstart.md](./quickstart.md)(준비·실행·검증 명령). 타입 필드·함수 시그니처·저장 JSON 모양은 data-model.md와 contracts/가 기준이며 이 문서에 복제하지 않습니다.

## Summary

3~8세 아이가 차량 5종 중 하나와 자기 차에 태울 인물 3종 중 하나를 골라, 교육용 마을에서 세 가지 안전 연습을 운전으로 수행하고 Chicken Guy가 주인공인 보행자 시점 안내로 보행 안전 규칙 38문구를 배우며, 세 연습을 마치면 전용 트랙에서 컴퓨터 차량 3대와 경주하는 한국어 모바일 웹게임입니다(spec.md 요약).

기술 접근: three.js(WebGL2) + TypeScript + Vite로 만든 정적 단일 페이지를 GitHub Pages 하위 경로 `/driving_game/`에 GitHub Actions로 배포합니다. 주행·판정·진행도·저장 검증은 DOM과 렌더러 없이 1/60초 고정 시간 간격(틱)으로 도는 순수 함수로 두어 Vitest로 결정적으로 시험하고, three.js·DOM·Web Audio·localStorage는 그 결과를 그리고 들려주고 저장하는 얇은 층으로 둡니다. 콘텐츠(규칙 문구·그림·음성, 마을·트랙 배치, 차량·인물 목록, 크레딧)는 `src/content/` 데이터와 `src/assets/` 파일로 코드와 분리해 별도 단계에서 채웁니다.

## Technical Context

**Language/Version**: TypeScript 7.0.2(타입 검사 `tsc --noEmit` 전용, 막히면 6.0.3), 빌드 도구 실행 Node.js 24 LTS. 브라우저 출력은 Vite 8 기본 대상 `baseline-widely-available`(chrome111, edge111, firefox114, safari16.4, ios16.4)

**Primary Dependencies**: `three` 0.186.1(GLTFLoader·SkeletonUtils·BufferGeometryUtils는 같은 패키지의 `three/addons/*`). 개발 의존성 `@types/three` 0.186.0, `typescript` 7.0.2, `vite` 8.3.1, `vitest` 5.0.2, `@playwright/test` 1.63.0. 버전 근거와 2주 기준은 [research.md](./research.md) "기술 선택". UI 프레임워크·물리 엔진·상태 관리 라이브러리·jsdom·웹 글꼴은 넣지 않습니다.

**Storage**: 브라우저 localStorage 키 `driving_game:save` 하나에 JSON(형식 버전 + 튜토리얼 전체 완료 여부·최고 기록·소리 설정). 형식·검사·합치기 규칙은 [data-model.md](./data-model.md)와 [contracts/storage.md](./contracts/storage.md). 서버·DB 없음.

**Testing**: Vitest 5.0.2(node 환경, 순수 로직·콘텐츠 데이터 검증), Playwright 1.63.0(Chromium·WebKit, 모바일 가로 화면 흉내, 하위 경로 로딩), 실제 기기 확인, 콘텐츠 검토 기록, 어린이 플레이 관찰의 5층. 아래 "테스트 전략".

**Target Platform**: iOS/iPadOS Safari 16.4 이상, Android Chrome 111 이상(Vite 기본 빌드 대상과 맞춘 잠정값). WebGL2 필수(three.js r163부터 WebGL1 미지원). 최소 버전·대표 기기는 초기 기기 점검에서 확정(PRD "개발 중 결정할 항목").

**Project Type**: 정적 단일 페이지 웹게임. 저장소 루트 단일 프로젝트, 서버·API 없음.

**Performance Goals**: 목표 수치는 초기 기기 점검에서 확정(SC-024). 점검 시작용 초기 예산은 아래 "성능 초기 예산".

**Constraints**: 정적 파일만, 실행 중 같은 출처 요청만(poly.pizza 등 외부 주소 요청 없음), 터치 전용·가로 화면, 개인정보 입력·권한 요청 없음, 필수 파일 전송량 약 4 MB 이하(제안), 게임 안의 시간은 모두 틱(상수 이름 `*_TICKS`).

**Scale/Scope**: 교육용 마을 1, 전용 트랙 1(2바퀴 잠정), 안전 상황 3 + 조작 익히기, 차량 모델 5, 사람 모델 3, 보행 안전 규칙 38문구, 화면 상태 14 + 겹침 안내 5, 소스 파일 약 35개, 사용자는 개별 가정(동시 접속 개념 없음).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**해당 없음 — 사용자 결정 2026-10-12, 토이 프로젝트.** `.specify/memory/constitution.md`는 빈 양식이며 자리표시자를 규칙으로 쓰지 않습니다(spec.md Clarifications, Assumptions). 대신 `AGENTS.md`의 프로젝트 기준으로 점검합니다.

| AGENTS.md 기준 | plan 반영 | 결과 |
|---|---|---|
| PRD·용어집을 기준으로 하고 문서 사이 실제 모순은 사용자에게 확인 | PRD·GLOSSARY·spec을 읽고, plan 단계 모순·공백은 사용자 결정으로 해소(아래 "사용자 결정 기록") | 통과 |
| 기술 스택은 승인된 설계와 실제 설정으로 정하고, 역할 예시로 확정하거나 의존성을 설치하지 않음 | 사용자 승인 게임 스택과 리더 기본값을 사용. 게임 의존성 설치·`npm init`은 아직 없으며, 후속 사용자 요청에 따라 Blender·공식 MCP와 리깅 검증 도구를 설치함 | 통과 |
| constitution 자리표시자를 규칙으로 쓰지 않음 | 위와 같이 "해당 없음" | 통과 |
| IVI 기술 규칙(Java/Spring, JPA, REST, Maven) 미적용, 기능에 없는 서버·DB·REST 추가 안 함 | 정적 웹게임, 모듈 인터페이스는 TypeScript 함수·이벤트 | 통과 |
| 테스트 명령을 정하고 자동 테스트·브라우저 확인·실제 기기·어린이 관찰을 구분, 실행 못 한 검사를 통과로 보고 안 함 | "테스트 전략"의 5층 구분과 npm scripts | 통과(명령 실행은 구현 후) |
| `modeling/` 제공 원본 보존, 변환 결과 별도 관리 | ZIP은 건드리지 않고 GLB는 `src/assets/models/`에 별도 보관 | 통과 |
| 모델·음원 사용과 출처 표시는 PRD 기준 | 크레딧 데이터에 작품명·제작자·원출처·라이선스·변경 사실 | 통과 |
| `ivi-agent-guide/`와 공용 실수 기록 수정 안 함 | 수정 없음 | 통과 |

Phase 1 설계 뒤 재점검: 위 표의 결과는 바뀌지 않습니다.

## Project Structure

### Documentation (this feature)

```text
specs/001-kids-driving-safety-game/
├── plan.md              # 이 파일
├── research.md          # 기술 선택·열린 항목 결정 근거
├── data-model.md        # 게임 state·엔티티·저장 형식
├── quickstart.md        # 준비·실행·검증 명령과 끝에서 끝까지 확인 시나리오
├── contracts/
│   ├── overview.md      # 모듈 관계 개요
│   ├── modules.md       # 모듈 인터페이스(TypeScript 시그니처)
│   ├── events.md        # step 함수가 반환하는 게임 이벤트
│   ├── storage.md       # 브라우저 저장 형식
│   ├── assets.md        # 에셋 목록·형식
│   ├── content-data.md  # 정적 콘텐츠 데이터 형식
│   └── static-paths.md  # GitHub Pages 하위 경로·파일 경로
├── checklists/
├── _workspace/          # 단계별 작업 보고서
└── tasks.md             # /speckit-tasks 산출물(이 단계에서 만들지 않음)
```

### Source Code (repository root)

```text
driving_game/
├── index.html                    # 셸, 부팅 가드(인라인 스크립트), nomodule 안내, viewport 메타
├── package.json
├── package-lock.json
├── tsconfig.json                 # strict, noEmit, moduleResolution bundler, types vite/client, include src·tests, skipLibCheck
├── vite.config.ts                # base '/driving_game/', test.include tests/unit/**/*.test.ts
├── playwright.config.ts          # Chromium·WebKit 모바일 가로, webServer = build + preview
├── .github/workflows/deploy.yml  # GitHub Pages 배포
├── modeling/                     # 제공 ZIP 원본(보존, .gitignore 대상)
├── src/
│   ├── main.ts
│   ├── style.css
│   ├── app/
│   │   ├── flow.ts               # 화면 흐름 상태 기계(ScreenState), 겹침 안내, PlaySession
│   │   ├── session.ts            # RunState
│   │   └── loader.ts             # loadRequired, retryFailed, 에셋 URL 표
│   ├── core/
│   │   └── loop.ts               # 고정 시간 간격 루프(TICK_HZ, MAX_TICKS_PER_FRAME)
│   ├── input/
│   │   └── controls.ts           # pressedButtons, toDriveInput, releaseAll
│   ├── sim/
│   │   ├── vehicle.ts            # DRIVING_SPEC, DriveState, stepVehicle, requestGearToggle
│   │   └── collision.ts          # 공통 차체 충돌, 구역 판정
│   ├── practice/
│   │   ├── drivingLesson.ts      # stepDrivingLesson
│   │   ├── scenario.ts           # stepScenario, 판정, 위험 직전 멈춤
│   │   ├── townActors.ts         # 신호·등장 보행자(Chicken Guy) 진행
│   │   └── ruleRotation.ts       # isReplay, pickRules
│   ├── pedestrianView/
│   │   └── pedestrianView.ts     # stepPedestrianView
│   ├── race/
│   │   ├── race.ts               # stepRace, trackConfigKey, formatRecord
│   │   ├── progress.ts           # progressValue, rankCars, 끼임·복귀
│   │   └── ai.ts                 # 컴퓨터 차량 입력
│   ├── render/
│   │   ├── stage.ts              # 렌더러·카메라·리사이즈·컨텍스트 손실·?perf
│   │   ├── models.ts             # prepareModel
│   │   ├── townView.ts           # 마을·장면 요소(기본 도형)
│   │   ├── trackView.ts          # 트랙
│   │   ├── characters.ts         # Chicken Guy 클립 + Head/Hand 관절 자세, 탑승객 배치
│   │   └── showroom.ts           # 차량·인물 선택 진열 장면
│   ├── ui/
│   │   ├── screens.ts            # 시작·선택·연습 목록·결과·크레딧
│   │   ├── hud.ts                # 운전 화면 표시
│   │   └── overlays.ts           # 일시정지·세로·저장 불가·로딩·3D 불가·컨텍스트 손실
│   ├── audio/
│   │   └── audio.ts              # Web Audio
│   ├── storage/
│   │   └── save.ts               # parseSave, loadSave, commitSave
│   ├── platform/
│   │   └── lifecycle.ts          # 숨김·방향·크기·blur·브라우저 제스처 차단
│   ├── content/                  # 정적 콘텐츠 데이터(코드와 분리, 타입 있는 TS 데이터)
│   │   ├── vehicles.ts           # VEHICLES (VehicleKind, seats)
│   │   ├── characters.ts         # CHARACTERS (CharacterKind)
│   │   ├── rules.ts              # SAFETY_RULES (38문구)
│   │   ├── scenarios.ts          # SCENARIOS (ScenarioDef, SegmentDef, PedestrianViewDef)
│   │   ├── town.ts               # TOWN (구역·신호·장면 요소 배치)
│   │   ├── track.ts              # TRACK (TrackDef, Checkpoint, AiProfile)
│   │   ├── voice.ts              # VOICE_LINES, VIOLATION_LINES (음성 줄 ID 26개)
│   │   └── credits.ts            # CREDITS
│   └── assets/                   # 바이너리 에셋(import로 해시 이름)
│       ├── models/               # GLB 8개 + SHA256SUMS
│       ├── images/
│       │   ├── rules/            # 규칙 그림
│       │   └── ui/               # 버튼·잠김·완료·전진·후진·회전 안내 등
│       └── audio/
│           ├── voice/
│           ├── sfx/
│           └── bgm/
└── tests/
    ├── unit/                     # Vitest: sim·practice·pedestrianView·race·storage·input·content 검증
    └── e2e/                      # Playwright: 하위 경로·모바일 가로·오류 환경·외부 요청
```

**Structure Decision**: 서버가 없는 정적 웹게임이라 저장소 루트 단일 프로젝트로 둡니다. 순수 로직 폴더(`sim`, `practice`, `pedestrianView`, `race`, `storage`)는 DOM·WebGL·Web Audio를 import하지 않고 `step(state, input) → { state, events }` 형태로 동작합니다. 화면 폴더(`render`, `ui`, `audio`, `platform`)는 순수 로직의 상태와 이벤트만 사용합니다. 콘텐츠는 `content`(데이터)와 `assets`(파일)로 코드와 분리합니다. 함수별 소속 모듈과 시그니처의 최종 기준은 [contracts/modules.md](./contracts/modules.md)입니다.

## Complexity Tracking

없음. constitution이 없고, 승인 스택 밖 의존성도 추가하지 않습니다(`@types/three`는 three 타입용).

의도적으로 단순화한 부분과 한계(필요해지면 추가):

| 단순화 | 한계 | 추가할 때 |
|---|---|---|
| 렌더링 보간 없음 | 120 Hz 기기에서 움직임이 덜 부드러울 수 있음 | 실제 기기에서 끊김이 보일 때 |
| 한 프레임 최대 8틱(`MAX_TICKS_PER_FRAME`) | 7.5 fps 미만 기기에서는 게임 시간이 느려짐. SC-012는 지원 기기(초기 기기 점검 선정) 기준으로 확인 | 그런 기기가 지원 대상이 될 때 |
| CSP 메타 없음 | 외부 코드가 없어 위험이 낮음 | 외부 스크립트를 넣게 될 때 |
| CI에 Playwright 없음 | 브라우저 확인은 로컬 실행 | 회귀가 잦아질 때 |
| 바퀴 회전 없음 | 5종 같은 표현 | 사용자 요청 시 |
| 다른 탭 실시간 동기화 없음 | 쓰기 때 합치기만(FR-083 충족) | 요구사항이 생길 때 |

---

## 컴포넌트와 책임

### 설계 원칙

1. **순수 로직과 화면 분리**: 판정·계산 함수는 다음 상태와 이벤트 목록을 반환합니다. 이벤트 버스·DI·하나뿐인 구현을 위한 인터페이스는 두지 않습니다.
2. **시간은 틱으로**: 경기 시간, 신호 주기, 보행자 이동, 안내 대기, 카운트다운, 보행자 시점 안내 진행은 모두 틱 수로 셉니다. `Date.now()`·`setTimeout`은 게임 진행에 쓰지 않습니다(UI 꾸밈 애니메이션 제외). FR-022, FR-074, 기기 시계 변경 Edge Case가 구조로 해결됩니다.
3. **차량 종류는 시뮬레이션 입력이 아님**: `stepVehicle`에 차량 종류 매개변수가 없고 `VehicleKind`에는 성능 필드가 없습니다. 성능은 `DRIVING_SPEC` 하나뿐입니다(FR-011, FR-054).
4. **인물은 외형만**: 탑승객과 보행자 Chicken Guy는 표시 객체일 뿐 판정·카메라·성능에 들어가지 않습니다(FR-011).
5. **콘텐츠는 데이터**: 콘텐츠 작업자는 `src/content/*.ts`와 `src/assets/**`만 고칩니다.

### 모듈 표

| 모듈 | 책임 | 맡는 FR |
|---|---|---|
| `index.html` | 셸, 부팅 가드(앱 부팅 완료 전 스크립트·CSS 불러오기 실패와 구형 브라우저 구문 오류를 잡아 "다시 시도(새로 고침)" 표시), `<script nomodule>` 안내, viewport 메타 | FR-001, FR-005 |
| `src/main.ts` | WebGL2 확인 → 렌더러 생성(실패 시 3D 불가 안내) → 저장 읽기 → 로더 → 흐름 시작 → 부팅 가드 해제 | FR-001, FR-005 |
| `app/flow.ts` | 화면 흐름 상태 기계, 겹침 안내, 연타 방지, step 이벤트를 받아 UI·소리·저장 호출, `PlaySession`(고른 차량·인물) | FR-008, FR-029, FR-030, FR-047~050, FR-065, FR-071~077, FR-087 |
| `app/session.ts` | `RunState`(레이싱 열림, 이번 실행 연습별 완료, 조작 익히기 통과, 추가 규칙 순환 위치, 저장 사용 가능 여부, 소리 활성화, 이번 실행의 최고 기록·소리 설정) | FR-010, FR-027, FR-050, FR-051, FR-080, FR-091, FR-097 |
| `app/loader.ts` | 필수 GLB 8개 내려받기(바이트 진행률, 정체 시 중단), 실패 파일만 다시 받기, 404면 새로 고침, 소리 파일 백그라운드 로딩(실패 무시), `import.meta.glob` 에셋 URL 표 | FR-002~004, FR-070 |
| `core/loop.ts` | requestAnimationFrame + 누적기, `TICK_HZ = 60`, `MAX_TICKS_PER_FRAME = 8`, 프레임 간격 상한, 일시정지 중 틱 없음, 재개 시 기준 시각 초기화 | FR-022, FR-071, FR-074 |
| `input/controls.ts` | 조작 버튼 DOM, 손가락 좌표 표, `pressedButtons`(좌표 기반 판정), `toDriveInput`(브레이크 우선·좌우 동시 직진), 후진·일시정지 1회 이벤트, `releaseAll` | FR-013~017, FR-021 |
| `sim/vehicle.ts` | `DRIVING_SPEC`, `DriveState`, `stepVehicle`, `requestGearToggle`(속도 0일 때만, 거절 여부 반환) | FR-011, FR-018, FR-019, FR-022, FR-054 |
| `sim/collision.ts` | 공통 차체로 차-차 겹침 해소 + 감속(튕김 없음), 차-구역 판정(도로·보도·건물·트랙 벽) | FR-011, FR-035, FR-060 |
| `practice/drivingLesson.ts` | `startDrivingLesson`·`stepDrivingLesson`: 연습 차(`drive`)로 조향 → 액셀 → 브레이크 → 후진 전환 시범과 직접 해 보기, 끝나면 이벤트 `lessonDone` | FR-027 |
| `practice/scenario.ts` | `startScenario`·`stepScenario`: 안전 상황·연습 구간 진행, 정지·대기·출발 판정(`SafetyActionStep`), 잘못된 행동(`ViolationKind`)을 다음 틱 후보 위치에서 판정 → 위험 직전 멈춤 → 구간 재시도, 경로 문제(`RouteIssue`) 안내(`hint`)·되돌림(`redirect`), 무입력 재안내, 연속 실패 시 시범, 완료 조건 | FR-028, FR-031~038, FR-044~046 |
| `practice/townActors.ts` | 신호(차량·보행자 구분)와 등장 보행자 Chicken Guy 진행. 플레이어 위치·정지 여부에 맞춰 신호 변화·횡단 시작(멈출 수 있는 거리일 때만) | FR-039, FR-040, FR-042 |
| `practice/ruleRotation.ts` | `isReplay`(이번 실행에서 그 연습 완료 ∨ 저장된 튜토리얼 완료), `pickRules`(핵심 전부 + 다시 하는 연습이면 아직 안 보인 추가 규칙 `EXTRAS_PER_VIEW`개, 끝나면 처음부터) | FR-091 |
| `pedestrianView/pedestrianView.ts` | `stepPedestrianView`: 카메라 이동 → 규칙 카드(그림 + 음성 + Chicken Guy 자세) 순서 → 끝. 입력 무시, 건너뛰기 없음, 카드 길이(틱)로 자동 진행, 숨김 복귀 시 처음부터 | FR-041~043, FR-070, FR-092, FR-093, FR-094, FR-096 |
| `race/race.ts` | `createRace`·`stepRace`: 카운트다운(`COUNTDOWN_TICKS`) → 진행 → 플레이어 완주, 경기 틱 시계, 출발 전 입력은 출발 순간 반영, 완주 순간 순위·시간 확정. `FinishResult`는 순수 함수 `finishResult`로 계산하되 최신 저장 값이 필요해 flow가 부르고 `RaceState.result`에 넣음. 재도전 초기화, `trackConfigKey`, `formatRecord` | FR-053, FR-055, FR-056, FR-058, FR-062~065, FR-077 |
| `race/progress.ts` | 체크포인트 순서 진행, 정방향 결승선 통과만 바퀴 인정, `progressValue`, `rankCars`, 끼임·이탈(`STUCK_TICKS`) 복귀(겹침 피해 옆 칸, 진행도 증가 없음) | FR-057, FR-059, FR-061 |
| `race/ai.ts` | `aiInput`: 컴퓨터 차량이 같은 `DriveInput`으로 같은 `stepVehicle` 사용, `AiProfile`(주행선·목표 속도 비율·반응)으로만 난이도(성능 한도는 같음, B17), 막히면 옆 주행선 | FR-054, FR-060, FR-061 |
| `render/stage.ts` | WebGLRenderer·조명, 뒤에서 내려다보는 고정 오프셋 추적 카메라(`DRIVING_SPEC` 기준), 리사이즈, 컨텍스트 손실·복구 감지, `?perf` 측정 표시 | FR-006, FR-011, FR-023, FR-026 |
| `render/models.ts` | `prepareModel`: GLB 파싱, 재질별 합치기, 방향·크기·바닥 정규화, 복제 | FR-009, FR-011, FR-096 |
| `render/townView.ts` | 마을 배치 데이터로 기본 도형 장면, 신호등(색 + 모양 표시), 장면 요소 | FR-024, FR-025, FR-028, FR-092 |
| `render/trackView.ts` | 노면·벽·결승선(마을과 다른 색·모양) | FR-052 |
| `render/characters.ts` | Chicken Guy `Armature|Walk`·`Armature|Idle` 재생과 `Head`·`Hand.L`·`Hand.R`(three.js 안 이름 `Head`·`HandL`·`HandR`) 관절 자세 조정(`CharacterPose`), 아이 차 탑승객 배치(`seats`) | FR-039, FR-096, FR-097 |
| `render/showroom.ts` | 차량·인물 선택 화면의 3D 진열(고르면 확대·회전) | FR-009, FR-097 |
| `ui/screens.ts` | 시작, 차량 선택, 인물 선택, 연습 목록, 완주 결과, 크레딧(DOM, `textContent`만) | FR-008, FR-009, FR-012, FR-030, FR-048, FR-063, FR-065, FR-087~090, FR-097 |
| `ui/hud.ts` | 전진·후진 그림, 다음 행동 그림(행동할 때까지 유지), 멈추라는 안내, 순위·바퀴·시간 | FR-018, FR-019, FR-025, FR-031, FR-056 |
| `ui/overlays.ts` | 일시정지(계속하기 가장 크게, 소리 설정, 나가기 확인), 세로 안내, 저장 불가 안내, 로딩·로딩 실패, 3D 불가, 컨텍스트 손실 | FR-004~007, FR-069, FR-072, FR-075, FR-080 |
| `audio/audio.ts` | 시작 버튼에서 AudioContext 생성·resume, 실패 시 다음 동작마다 재시도, 배경음/안내/효과음 gain, 안내 하나만 재생, 안내 중 배경음 낮춤, 일시정지 suspend, 재개 시 끊긴 안내 처음부터, 효과음 허용 목록 | FR-036, FR-066~070, FR-076 |
| `storage/save.ts` | `parseSave`(항목별 검사, 틀린 항목은 조용히 기본값), `loadSave`(→ `{ data, ok }`), `commitSave`(최신 값 다시 읽기 → 합치기 → 쓰기, → 성공 여부 `boolean`). 셋 다 던지지 않고, 저장 불가 안내는 flow가 띄움 | FR-047, FR-064, FR-078~083 |
| `platform/lifecycle.ts` | `visibilitychange`, 방향·크기 변화, `blur`, 브라우저 제스처 차단(`gesturestart`·`touchmove`·`dblclick`·`contextmenu` preventDefault) | FR-006, FR-007, FR-017, FR-020, FR-073 |
| `src/content/*.ts` | `VEHICLES`, `CHARACTERS`, `SAFETY_RULES`, `SCENARIOS`, `TOWN`, `TRACK`, `VOICE_LINES`·`VIOLATION_LINES`, `CREDITS` | FR-009, FR-044~046, FR-052, FR-058, FR-088~097 |

전체 범위 규칙(FR-084 개인정보·권한 없음, FR-085 외부 전송·광고 없음, FR-086 외부 링크 없음)은 "외부 요청 코드·`<a href>`·권한 API를 쓰지 않는다"는 구조 규칙과 Playwright 검사로 지킵니다. FR-095(문구·그림을 새로 만든다)는 콘텐츠 제작 단계의 기준입니다.

### 핵심 동작

**게임 루프**: rAF마다 `frameDt = min(now − last, 0.25초)`를 누적해 `step()`을 반복합니다(한 프레임 최대 8틱, 넘는 시간은 버림). 입력은 틱마다 그 시점의 눌림 상태를 읽으므로 화면 갱신 속도가 달라도 같은 틱 입력이면 결과가 비트 단위로 같습니다. 일시정지·숨김 중에는 틱을 돌리지 않고, 재개할 때 기준 시각을 다시 잡아 숨김 시간이 반영되지 않습니다(FR-074). 시간 측정은 `performance.now()`. 일시정지 요청은 프레임 사이에 처리되므로 그 전에 끝난 step의 결승선 통과·연습 완료는 결과 표시와 저장까지 마칩니다(FR-077).

**입력**: 조작 층 하나에서 손가락마다 좌표를 기록하고, 버튼 눌림은 "버튼 영역 안에 손가락 좌표가 하나라도 있는가"로 계산합니다. 터치는 처음 누른 요소에 포인터가 암묵적으로 잡히므로(MDN Pointer events) 이벤트 대상이 아닌 좌표로 판정해야 "지금 손가락이 있는 버튼"을 따릅니다(FR-016). `releaseAll`은 좌표 표를 비우고 그때 닿아 있던 손가락은 뗄 때까지 무시합니다(FR-017). 호출 시점은 일시정지, 숨김, `blur`, 회전·크기 변화(가로 180° 뒤집기 포함, 일시정지는 안 함), 보행자 시점 안내 시작, 구간 재시도, 코스 복귀, 경기 화면 진입, 위험 직전 멈춤입니다. 카운트다운 중 새로 누른 액셀은 출발 순간 그대로 반영합니다.

**주행**: `DriveState`(위치, 방향, 속도, `Gear`). 페달을 떼면 자연 감속하고 아주 느려지면 속도를 정확히 0으로 맞춥니다. "완전히 멈춤" = `speed === 0`이며 자연 감속으로 선 것도 정지입니다. 판정용 차체·정지선 판정 점(차체 앞 끝)·카메라 오프셋은 모두 `DRIVING_SPEC` 값입니다. 무작위 값은 쓰지 않습니다.

**안전 연습 판정**: 연습 구간마다 차선 중심 경로와 정지선·정지 인정 범위·신호 변화 지점·신호와 보행자 계획을 데이터로 두고, 차체 앞 끝을 경로에 투영한 거리로 판정합니다. 접근 → 정지 범위 안에서 정지 → 안전 조건까지 정지 유지 → 출발 → 보행자 시점 안내 → 완료 순서이며, 행동 단계를 모두 거친 경우에만 완료됩니다(FR-032). 잘못된 행동 6종(`overStopLine`, `ranRed`, `earlyStart`, `enteredCrosswalkWithPedestrian`, `turnedIntoCrossingPedestrian`, `enteredSidewalk`)은 다음 틱 **후보 위치**에서 판정하고, 걸리면 후보를 버려 차를 선 앞에 세웁니다. 그 뒤 `violation` 이벤트 → 시뮬레이션 전체 멈춤과 설명 카드(화면 전체 반투명 + 멈춤 그림, FR-037) → `segmentReset`. 경로 문제는 실패가 아니며, 정지 위치보다 멀리 섬·방향이 틀림은 `hint`, 경로 이탈·막힘은 구간을 다시 놓는 `redirect`입니다(FR-034, FR-035). 같은 시도 안에서 이미 끝낸 보행자 시점 안내는 구간 재시도 뒤 다시 보여 주지 않습니다. 차체가 경계를 넘는 틱이 없으므로, 보행자 경로가 위반 경계(정지선, 횡단보도의 차 쪽 가장자리, 보도 가장자리)의 차 반대편에 있고 사람 반지름 + 여유 이상 떨어져 있는지만 콘텐츠 검증 테스트로 확인해 차가 보행자에게 닿는 장면을 막습니다(FR-036).

**보행자 시점 안내**: 카메라를 아이 눈높이의 보행자 위치(Chicken Guy 어깨 뒤)로 옮기고, `pickRules`가 고른 카드를 카드 길이(틱)대로 자동 진행합니다. 음성은 함께 재생하되 기다리지 않습니다. 카드마다 Chicken Guy 자세(`CharacterPose = 'idle' | 'walk' | 'lookLeft' | 'lookRight' | 'raiseHand'`, 뛰기 없음)를 지정하고, 비 오는 날·어두운 날 카드는 장면 날씨를 바꿉니다. 일시정지 중 정지, 재개 시 현재 카드 음성은 처음부터, 숨김 복귀 시 처음부터.

**레이싱**: 체크포인트 0번이 결승선이며, 다음 차례 체크포인트를 정방향으로 넘을 때만 진행합니다. 마지막 체크포인트 뒤 결승선을 정방향으로 넘을 때만 바퀴를 인정합니다(FR-059). 순위는 완주 순서, 그다음 `progressValue` 순입니다(FR-057). 동점 규칙은 data-model.md. 트랙에는 벽이 있고, 진행도가 `STUCK_TICKS` 동안 늘지 않으면 마지막으로 지난 체크포인트의 복귀 위치로 옮깁니다. 이때 진행도는 오르지 않습니다(FR-061). 경기 시간은 출발 신호 이후 틱 수이며, 완주 순간 한 번 1/100초 정수 `timeCs`로 바꿉니다. 표시는 `m:ss.cc`입니다.

**소리**: 시작 버튼 click 안에서 AudioContext를 만들고 `resume()`합니다. `running`이 아니면 다음 사용자 동작마다 다시 시도합니다(iOS Safari는 화면 이탈 뒤 `interrupted` 상태가 됨). 설정은 배경음, 안내·효과음 두 묶음입니다. 형식은 MP3로 하고, 배경음은 30~60초 반복 구간으로 만들어 디코딩 메모리를 줄입니다. 소리 실패는 무시하고 진행합니다.

**저장**: 상세는 [data-model.md](./data-model.md)·[contracts/storage.md](./contracts/storage.md). 손상된 값은 조용히 항목별 기본값을 쓰고 안내는 없습니다. 저장소 API 예외(읽기·쓰기 실패)일 때만 저장 불가 안내를 실행당 1회 보여 줍니다. 저장 시점은 세 번째 연습 완료 순간, 정상 완주에서 기록이 더 짧을 때, 소리 설정 변경입니다.

## 화면 흐름 상태 기계

`ScreenState`(`app/flow.ts`). 전이 가드의 상세 표는 [data-model.md](./data-model.md)를 따릅니다.

| 상태 | 들어오는 조건 | 나가는 곳 |
|---|---|---|
| `boot` | 페이지 열림 | `unsupported` / `loading` |
| `unsupported` | WebGL2 없음 또는 렌더러 생성 실패 | (끝, 보호자용 안내) |
| `loading` | 부팅 성공 | `start` / `loadFailed` |
| `loadFailed` | 필수 파일 실패·정체 | 다시 시도 → `loading`(실패 파일만), 404면 새로 고침(저장 유지) |
| `start` | 로딩 완료, 결과·나가기에서 복귀 | `pickVehicle`(안전 연습 또는 레이싱 선택 기억), `credits`. 레이싱 잠김이면 잠김 안내만(소리 활성화 전이면 그림만 — 사용자 결정 2026-10-12) |
| `credits` | 시작 화면에서 | `start` |
| `pickVehicle` | 시작 | `pickCharacter` |
| `pickCharacter` | 차량 고름 | 레이싱 → `race`. 안전 연습: 저장된 완료 기록이 없고 이번 실행에서 처음 시작할 때만 순서대로 이어 감(`drivingLesson` → 첫 연습). 그 밖에는 `practiceMenu` |
| `drivingLesson` | 저장된 완료 기록이 없고 이번 실행에서 조작 익히기를 아직 통과하지 않았을 때, 연습에 들어가기 전 | `practice` |
| `practiceMenu` | 연습 목록 | `practice`(조작 익히기 조건이면 `drivingLesson` 먼저) |
| `practice`(내부 `driving` → `explaining` → `pedestrianView` → `done`) | 연습 시작 | 순서 흐름이면 다음 미완료 연습 / 목록 흐름이면 `practiceMenu` / 세 번째 완료 시 축하 → `start` |
| `race`(내부 `countdown` → `running` → `finished`) | 레이싱 열림 상태에서 선택 | `raceResult` |
| `raceResult` | 플레이어 완주 | 재도전 → `race`, 시작 화면으로 → `start` |
| `fatal` | 컨텍스트 복구 실패 | 새로 고침(저장 유지) |

겹침 안내 플래그: `paused`, `rotate`, `storageNotice`, `contextLost`, `confirmExit`. 숨김·세로·컨텍스트 손실은 `paused`를 켜고 자동으로 끄지 않습니다(FR-073). 현재 상태와 맞지 않는 버튼 입력은 무시하므로 연타해도 전환이 두 번 일어나지 않습니다. 현재 화면 상태는 `document.body.dataset.screen`에, 켜진 겹침 안내 이름은 `document.body.dataset.overlays`(공백으로 이음)에 적어 Playwright가 읽습니다.

## 데이터 흐름

```text
[빌드 시]
src/content/*.ts ──Vite 번들──▶ dist/assets/index-<hash>.js (읽기 전용 데이터)
src/assets/** (GLB·MP3) ──import·import.meta.glob──▶ dist/assets/<이름>-<hash>.<확장자> (같은 출처, /driving_game/ 아래)
src/assets/images/**.svg ──빌드 때 인라인(assetsInlineLimit)──▶ index-<hash>.js 안의 data: URI (따로 받지 않음)

[실행 시: 들어오는 방향]
GitHub Pages ─HTTPS 같은 출처─▶ app/loader ─ArrayBuffer─▶ render/models(파싱·합치기·정규화) ─▶ 메모리의 모델 원본 ─복제─▶ 장면
                                          └─ArrayBuffer─▶ audio(decodeAudioData) ─▶ AudioBuffer
localStorage ─문자열─▶ storage/save(parseSave: 항목별 검사·기본값) ─▶ app/session(RunState)
                                                                    ─▶ ui: 레이싱 잠김 그림, 소리 설정, 결과 화면 최고 기록
선택 화면 ─▶ app/flow(PlaySession: 차량 종류, 인물 종류) ─▶ render/models·characters(아이 차 외형 + seats에 탑승객)
터치 ─pointer 이벤트─▶ input/controls(손가락 좌표 표) ─틱마다 pressedButtons─▶ DriveInput
     ─▶ stepVehicle·stepScenario·stepPedestrianView·stepRace ─▶ 다음 상태 + 이벤트
           상태 ─▶ render(위치·카메라·Chicken Guy 자세), ui/hud(전진·후진, 순위, 바퀴, 시간)
           이벤트 ─▶ app/flow ─▶ ui(화면 전환·안내 그림) / audio(음성·효과음) / storage(완료·최고 기록·소리 설정)
브라우저 신호(visibilitychange, resize·방향, blur, webglcontextlost/restored) ─▶ platform/lifecycle·render/stage ─▶ app/flow(일시정지·입력 해제)

[실행 시: 나가는 방향]
storage/save ─commitSave: 다시 읽기·합치기─▶ localStorage(이 브라우저에만)
외부로 나가는 요청: 없음
```

| 데이터 | 기원 | 저장 방식 | 화면까지 전달 경로 |
|---|---|---|---|
| 정적 콘텐츠(규칙, 연습, 마을, 트랙, 차량·인물 목록, 크레딧) | 저장소의 `src/content/*.ts` | 번들 JS | import → 순수 로직·화면 모듈 → UI·장면 |
| GLB 모델 8개 | poly.pizza 배포 파일. Cool Bannana Guy·Turtle은 리깅 수정본 사용 | `dist/assets` 해시 파일 | loader → models → 장면 복제(캐릭터 3종은 뼈대 보존) |
| 그림(SVG) | 콘텐츠 제작 단계 결과물 | 빌드 때 JS 번들에 인라인(별도 파일·요청 없음) | `ASSET_URLS`의 `data:` URI → UI(`<img>`). 플레이 중 네트워크가 끊겨도 그림이 비지 않음 |
| 소리(MP3) | 콘텐츠 제작 단계 결과물 | `dist/assets` 해시 파일 | `loadSounds`(백그라운드, 실패 무시) → audio |
| 저장 3항목 | 게임 이벤트(세 번째 완료, 정상 완주, 소리 변경) | localStorage 키 하나 | `parseSave` → `RunState` → UI |
| 선택 차량·인물 | 아이의 선택 | 메모리(`PlaySession`, 저장 안 함) | flow → render(아이 차, 탑승객) |
| 입력 | 터치 | 메모리 좌표 표(저장 안 함) | controls → step → render·hud |
| 경기·연습 진행 | step 함수 | 메모리(저장 안 함) | step → flow → UI·audio·storage |

## 에셋 파이프라인

상세 목록·형식은 [contracts/assets.md](./contracts/assets.md), 경로는 [contracts/static-paths.md](./contracts/static-paths.md).

- **위치**: GLB는 `src/assets/models/`(`buggy.glb`, `jeep.glb`, `truck.glb`, `wagon.glb`, `banana-car.glb`, `chicken-guy.glb`, `cool-banana-guy.glb`, `turtle.glb`, 합계 약 2.5 MB)에 두고 git에 커밋합니다. 그림은 `src/assets/images/`(SVG), 소리는 `src/assets/audio/`(MP3)에 둡니다. `public/`은 쓰지 않습니다. 모두 import해 해시 이름을 받고, GLB는 `?url` 접미사, 여러 파일은 `import.meta.glob`으로 가져옵니다. 그림 SVG는 `vite.config.ts`의 `build.assetsInlineLimit`를 함수로 두어 항상 JS 번들에 인라인합니다. 그래서 미리 받아야 하는 필수 파일은 GLB 8개뿐이고, 그림은 플레이 중 따로 실패할 일이 없습니다(Edge "로딩을 마친 뒤 네트워크가 끊겨도 플레이 계속", FR-070). 큰 래스터 그림(PNG 등)을 쓰기로 하면(B15) 그림을 필수 다운로드로 옮깁니다. 필수·선택 구분과 이름 규칙은 [contracts/assets.md](./contracts/assets.md).
- **원본 보존**: `modeling/` ZIP은 건드리지 않습니다. `.gitignore`에 `modeling/`이 있어 ZIP은 GitHub에 올라가지 않으며, 빌드는 GLB만 쓰므로 배포에는 영향이 없습니다.
- **내려받기·리깅 재현**: 캐릭터 3종은 준비되었고, 차량 5종만 후속 준비 작업에서 **사용자 승인 후** 받습니다. 캐릭터 수정본을 원본 GLB로 덮어쓰지 않습니다. 체크섬은 `src/assets/models/SHA256SUMS`, 차량 다운로드 명령은 [quickstart.md](./quickstart.md)를 따릅니다. 캐릭터 재생성에는 `scripts/rig-characters.py`와 별도 폴더에 받은 원본 GLB 3종을 사용합니다([리깅 작업 기록](_workspace/03_character-rigging.md)).
- **GLB 판독 사실(2026-10-12)**: 8개 모두 glTF 2.0 GLB입니다. 압축 확장이 없고 버퍼·이미지가 파일 안에 들어 있어(PNG 1024×1024: 바나나 자동차, Cool Bannana Guy, Chicken Guy) 추가 요청이 없습니다. 모델 안의 프리미티브는 속성 묶음이 모두 같습니다. 왜건만 노멀이 없고, 모델마다 긴 축(앞뒤 방향)이 다릅니다.
- **정규화(실행 시, `prepareModel`)**: ① world 행렬 갱신 ② 차량 5종만 재질별로 geometry를 합칩니다(`mergeGeometries`, 실패하면 원래 메시 유지). 버기 프리미티브 162 → 재질 수 12 이하가 됩니다. 캐릭터 3종은 모두 뼈대가 있어 합치지 않습니다. ③ 카탈로그의 회전값으로 앞을 +Z로(새 리깅 수정본 2종은 `yawDeg = 0`) ④ `Box3` 기준 균일 비율로 차량은 공통 표시 길이, 인물은 역할별 키에 맞춤 ⑤ 바닥을 0, 가로 중심을 원점으로 ⑥ 원본은 메모리에 두고 차량은 `clone()`, 캐릭터 3종은 `SkeletonUtils.clone`으로 복제합니다. 캐릭터 리깅 제작에는 Blender를 사용했으며 게임 실행·빌드에는 필요하지 않습니다.
- **왜건 노멀**: three.js r186 GLTFLoader가 노멀 없는 geometry의 재질에 `flatShading`을 자동으로 켜므로 코드가 필요 없습니다. 렌더링 점검에서 어색하면 `computeVertexNormals()`로 바꿉니다.
- **버기 그리기 호출**: 재질별 합치기로 줄입니다(위 ②).
- **바퀴**: 회전 표현은 없습니다(5종 동일). 바퀴 노드가 이름으로 분리된 것은 바나나 자동차뿐입니다.
- **Chicken Guy 동작**: `Armature|Walk`·`Armature|Idle` 클립을 재생하고, 클립을 갱신한 **뒤에** 관절 자세를 덮어씁니다. `Head`(`Body`의 자식) 회전으로 왼쪽·오른쪽 보기, `Hand.L`/`Hand.R`(팔 없이 `CORE` 바로 아래에 있는 손 관절)의 위치·회전으로 손 들기를 만듭니다. GLTFLoader가 노드 이름에서 `.`을 지우므로 코드에서는 `HandL`/`HandR`로 찾습니다(`getObjectByName('Hand.L')`은 찾지 못함, [contracts/assets.md](./contracts/assets.md) 5장). 들어 올릴 손은 콘텐츠 데이터에서 한쪽으로 정하고, 안내 문구에는 어느 손인지 말하지 않습니다(FR-095). `Armature|Sprint`·`Armature|Jump`는 쓰지 않습니다(FR-094).
- **탑승객**: 아이가 고른 인물을 `VehicleKind.seats`의 좌석에 차량 표시 객체의 자식으로 앉힙니다. 5종 모두 뒤에서 내려다보는 카메라에서 보이는 좌석이 1개 이상 필요합니다. 지붕 있는 차량(왜건, 트럭 운전석)에서 안 보이면 장난감 같은 표현(열린 칸, 지붕 위 좌석 등)으로 콘텐츠 설계에서 조정합니다. 탑승객으로 쓰는 Chicken Guy는 `Armature|Idle`을 재생합니다.
- **리깅 수정본**: Cool Bannana Guy·Turtle은 각각 뼈대 16개와 `Idle`, `RaiseHand`, `LookLeft`, `LookRight`, `Sit` 클립을 갖습니다. 현재 콘텐츠 타입에는 `idle: 'Idle'`을 연결합니다. 추가 클립은 16~32프레임에서 목표 자세를 유지하는 확인용 동작이며, 차량 좌석에 맞춘 자세 고정과 three.js 재생·복제는 후속 구현에서 확인합니다.
- **외형과 무관한 동일 판정(FR-011)**: 충돌·정지선·카메라는 `DRIVING_SPEC`만 씁니다. 모델 상자 크기는 표시 비율에만 쓰입니다.
- **장면 요소(FR-092)**: 주차된 차·후진하는 차는 차량 모델 복제로, 트럭은 트럭 모델로 표현합니다. 버스, 통학버스와 정류장, 골목길, 보도 없는 길, 신호등 없는 횡단보도, 노란 대기선, 육교 또는 지하도, 굴러가는 공, 주차된 차 밑의 물건은 기본 도형으로 직접 만듭니다(외부 자료 추가 없음). 비 오는 날·어두운 날은 보행자 시점 안내 장면의 날씨로 표현합니다. 건너편·친구·어른 인물과 우산·밝은 옷(A2, A25, A26, B13, B14)은 보행자 시점 안내의 규칙 그림으로만 보여 줍니다.
- **크레딧 "변경 사실"(FR-088)**:
  - 차량 5종: "poly.pizza가 원작 파일을 GLB 형식으로 변환해 배포한 파일을 사용했습니다. 게임에서 크기·방향·바닥 위치를 맞추고, 여러 부분을 재질별로 합쳐 표시합니다."
  - Cool Bannana Guy·Turtle: "poly.pizza가 변환한 GLB를 바탕으로 방향·크기·바닥 위치를 맞추고, 팔꿈치·손목 주변에 면을 나누는 선과 뼈대를 추가했습니다. 기본 자세·손 들기·좌우 보기·앉기 동작을 추가했으며 원래 재질을 유지했습니다."
  - Chicken Guy: "poly.pizza가 원작 파일을 GLB 형식으로 변환해 배포한 파일을 사용했습니다. 게임에서 크기·방향·바닥 위치를 맞추고, 포함된 걷기·서 있기 동작을 사용하며, 머리·손 관절을 움직여 왼쪽·오른쪽 보기와 손 들기를 표현합니다."
  - 원출처는 poly.pizza 모델 페이지(PRD 표)로 하고, 누를 수 없는 글자로 표시합니다.

## 배포

- **Vite `base`**: `'/driving_game/'`. 원격 `https://github.com/kimwoo-ya/driving_game.git` → `https://kimwoo-ya.github.io/driving_game/`(Vite 공식 GitHub Pages 설정). 화면 이동이 URL을 바꾸지 않으므로 어느 시점에 새로 고쳐도 같은 `index.html`이 열립니다(FR-002).
- **해시 파일 이름**: JS·CSS·GLB·소리·그림 모두 `dist/assets/<이름>-<hash>.<확장자>`이므로 새 배포가 이전 캐시와 섞이지 않습니다.
- **배포 직후 이전 파일 404**: GitHub Pages는 `cache-control: max-age=600`(실측)이라 이전 `index.html`이 최대 10분 남을 수 있습니다. 이전 해시 파일이 404이면 JS·CSS는 부팅 가드가, GLB는 loader가 감지하고, 다시 시도는 페이지를 새로 엽니다(저장 유지, FR-004).
- **워크플로** `.github/workflows/deploy.yml`:
  - 트리거: `main` 푸시, `workflow_dispatch`.
  - 권한: `contents: read`, `pages: write`, `id-token: write`. 동시 실행 그룹: `pages`.
  - 단계: `actions/checkout@v7.0.1` → `actions/setup-node@v7.0.0`(node-version `24`, npm 캐시) → `npm ci` → `npm test` → `npm run build` → `actions/configure-pages@v6.0.0` → `actions/upload-pages-artifact@v5.0.0`(path `./dist`) → `actions/deploy-pages@v5.0.1`(environment `github-pages`).
  - 액션 버전 근거는 research.md에 있습니다. CI에는 Playwright를 넣지 않습니다.
- **사전 조건(사용자 작업)**: 저장소는 public이고 Pages가 꺼져 있습니다(`has_pages: false`). Settings → Pages → Source를 "GitHub Actions"로 켜야 합니다. 첫 커밋은 있습니다(2026-10-12).
- **공개 시점**: 크레딧이 공개 배포의 필수 조건(spec User Story 8)이므로 워크플로 파일은 단계 1에서 만들어 로컬로만 확인하고, 첫 `main` 푸시(= 첫 공개 배포)는 크레딧 화면이 갖춰진 뒤 합니다(사용자 결정 2026-10-12). 트리거가 `main` 푸시라 그 전에는 원격 `main`에 푸시하지 않습니다.

## 오류 처리와 보안·개인정보

| 상황 | 처리 | FR |
|---|---|---|
| 필수 GLB 실패·정체 | 그림 + 보호자용 짧은 글 + 다시 시도(실패 파일만, 사용자가 누를 때만, 자동 반복 없음), 성공 시 페이지 유지. 계속 실패하면 인터넷 연결 확인 안내 | FR-004 |
| 새 버전 배포로 이전 파일 404 | 다시 시도가 페이지를 새로 엶, 저장 유지 | FR-004 |
| JS·CSS 불러오기 실패, 구형 브라우저 | 부팅 가드, `<script nomodule>` 안내 | FR-001, FR-005 |
| WebGL2 없음·렌더러 생성 실패 | 3D 불가 안내(그림, 보호자용 글, Safari·Chrome 안내) | FR-005 |
| 플레이 중 컨텍스트 손실 | three.js r186이 `preventDefault`와 복구를 처리. 앱은 일시정지와 안내를 띄우고, 복구되면 일시정지를 유지(계속하기로 재개), 복구 안 되면 `fatal`(새로 고침 안내, 저장 유지) | FR-006 |
| 저장소 API 예외 | 이번 실행 값으로 계속, 안내 실행당 1회, 레이싱 열림·결과 표시 지연 없음 | FR-080 |
| 저장 값 손상·변조 | 조용히 항목별 기본값(안내 없음) | FR-081 |
| 소리 로딩·재생 실패 | 무시하고 진행, 진행은 음성 완료를 기다리지 않음 | FR-070 |
| 3D 화면 터치 | 아무 동작 없음 | FR-023 |

보안·개인정보:

- 외부 요청은 없습니다. 모든 파일은 같은 출처의 해시 파일이며, 외부 글꼴·CDN·분석·광고 코드가 없습니다(FR-085).
- 외부 링크는 없습니다. `<a href>`를 만들지 않고, 크레딧 주소는 글자로만 표시합니다(FR-086, FR-090).
- 개인정보·권한: 입력 칸, 기기 식별 값, 카메라·마이크·위치·알림·동작 센서 API가 없습니다(FR-084).
- 저장 값 해석: `JSON.parse` 결과는 타입 검사를 거친 숫자·불리언·정해진 문자열만 씁니다. 화면에는 `textContent`로만 넣고, `innerHTML`·`eval`·`new Function`은 금지합니다(FR-081).
- CSP 메타는 넣지 않습니다. 외부 코드가 없고 Playwright 검사로 확인하기 때문입니다.

## 테스트 전략

### 5층 구분

| 층 | 도구·장소 | 대상 |
|---|---|---|
| 자동 테스트 | Vitest(node 환경), `tests/unit/` | 순수 로직(sim, practice, pedestrianView, race, storage, input 판정, 규칙 순환), 콘텐츠 데이터 검증(규칙 38줄, 줄마다 그림·음성 파일 존재, 위반 선과 보행자 경로 거리, 차량마다 좌석 1개 이상) |
| 브라우저 확인 | Playwright(Chromium·WebKit, 모바일 가로 viewport + `hasTouch`), `tests/e2e/`, `vite preview`로 `/driving_game/` 제공 | 하위 경로 로딩·새로 고침, 로딩 실패 다시 시도(경로 차단·404), 3D 불가(초기화 스크립트로 `getContext('webgl2')`를 null로), 저장 불가(localStorage 예외), 세로 안내, 외부 요청 0·외부 링크 0, 시작 전 AudioContext 미생성 |
| 실제 기기 | 선정 스마트폰·태블릿(iPhone/iPad Safari, Android Chrome), 배포 주소 | 터치 취소·앱 전환·화면 잠금, 확대·스크롤 차단, 소리 잠금·무음, 노치·홈 바, 성능, 5분 경기, 탑승객 보임 |
| 콘텐츠 검토 | 검토 기록 | 문구·연출(SC-027), 38문구 반영(SC-030), 위협적 소리 여부, Chicken Guy 자세 |
| 어린이 관찰 | 보호자 동반 3~5세, 6~8세 | SC-028, SC-029 |

Playwright WebKit은 iOS Safari와 같지 않습니다. WebKit headless에서 WebGL2가 동작하는지는 첫 E2E에서 확인하고, 안 되면 3D가 필요한 시험은 Chromium만, DOM 흐름은 두 엔진 모두로 나눕니다.

### SC별 담당

| SC | 자동(Vitest) | 브라우저(Playwright) | 실제 기기 | 검토·관찰 |
|---|---|---|---|---|
| SC-001 | 흐름이 5종 × 2모드 허용, `stepVehicle`에 차량 종류 매개변수 없음 | 5종 각각 연습·레이싱 진입(저장 값 주입으로 열림) | 일부 조합 | |
| SC-002 | 5종 × 같은 틱 입력 × 프레임 간격 4종(8.3/16.7/33.3 ms, 불규칙) → 최고속도·정지 거리·회전 반경·후진 속도·기준 구간 통과 틱 완전 일치 | | 일반·저전력 모드 기준 구간 시간 ±0.05초, 거리 ±0.1 m | |
| SC-003 | 7가지 계기에서 `releaseAll`, `pointercancel` 처리 | 합성 포인터 이벤트로 취소·숨김 | 7상황 × 10회 | |
| SC-004 | 브레이크 우선 20회, 주행 중 전환 거절 20회, 정지 중 전환 20회(연타) | | 같은 횟수 | |
| SC-005 | | 계산된 스타일(`touch-action`, `user-select`) | 각 10회 | |
| SC-006 | | 세로 viewport에서 가로 안내·틱 정지, 가로 복귀 후 자동 재개 없음 | 회전 시험 | |
| SC-007 | 일시정지 60초 동안 경기 틱·컴퓨터 차량·신호 변화 0 | `page.clock`으로 60초 진행 | 60초 일시정지·앱 전환 | |
| SC-008 | 3연습 × 4패턴 × 36,000틱 완료 0, 끝 지점 도달만으로 완료 0 | | | |
| SC-009 | 올바른 행동 스크립트로 3/3 완료, 직후 열림 | | 통과 플레이 | |
| SC-010 | 잘못된 행동 → `violation` + 구간 재시도, 효과음 id가 허용 목록 안 | | | 소리 검토 |
| SC-011 | 기준 운전자로 경기 시간 4:30~5:30(트랙 조정 대리 지표) | | 트랙 플레이 점검으로 확정 | |
| SC-012 | 30분 이상 느린 주행: 강제 종료 0, 시간 = 틱 ÷ 60 | | 지원 기기 1회 | |
| SC-013, SC-014 | 후진 왕복 20, 역주행 1바퀴, 가로지르기, 복귀 10 / 끼임 10 | | | |
| SC-015, SC-018, SC-019 | 최고 기록 = 최솟값, 손상 6종, 두 탭 합치기 | | | |
| SC-016 | 저장·복원 왕복 | 새로 고침 후 3항목 복원 | | |
| SC-017 | 저장 실패 시 `RunState` 값 사용 | localStorage 예외 환경에서 시작~완주, 안내 1회 | | |
| SC-020 | 안내 하나만 재생·배경음 낮춤 정책 | AudioContext 생성이 시작 버튼 뒤에만 | 실제 청취 | |
| SC-021 | 보행자 시점 안내가 음성 완료를 기다리지 않음 | 소리 파일 경로 차단 후 조작 익히기 진입(일부) | 무음 상태와 음원 전부 차단 상태 각각 시작~레이싱 완주 | |
| SC-022 | | `/driving_game/` 로딩, 새로 고침, GLB 실패 → 다시 시도, 404 → 새로 고침, 3D 불가 안내 | 실제 공개 주소 | |
| SC-023 | | 가로 viewport 여러 개에서 조작 버튼끼리, 그리고 안전 영역과 겹치지 않음, 스크린샷 | 선정 기기 전체 | |
| SC-024 | | | `?perf` 측정 기록 | |
| SC-025 | 금지 API 미사용(코드 검토) | 요청 호스트 전부 같은 출처, 권한 API 호출 0 | | |
| SC-026 | 크레딧 데이터 8/8 필드 완비 | `a[href]` 0 | | 크레딧 검토 |
| SC-027 | | | | 문구·연출 검토 기록 |
| SC-028, SC-029 | | | | 어린이 관찰 |
| SC-030 | 규칙 38줄, 줄마다 그림·음성 파일 존재 | | | 그림·문구 검토 |
| SC-031 | 순환이 정한 횟수 안에 추가 규칙을 모두 포함, 핵심 규칙 매번, `isReplay` 조건 | | | 검토 |
| SC-032 | `PlaySession.character`가 아이 차 탑승객으로 전달됨, 보행자·주인공은 항상 `chicken-guy`, 좌우 보기·손 들기 규칙 카드(예: `A11`, `A14-A15`)에 `lookLeft`·`lookRight`·`raiseHand` 자세가 지정됨 | 15조합(인물 3 × 차량 5) 진입 스크린샷 | 15조합에서 탑승객이 보이는지, Chicken Guy의 왼쪽 보기·오른쪽 보기·손 들기 3/3 | 렌더링 점검 |

### 실행 명령(npm scripts)

| 스크립트 | 명령 | 용도 |
|---|---|---|
| `dev` | `vite` | 개발 서버(Vite 8.3.3 이상으로 올리기 전 `--host` 금지) |
| `typecheck` | `tsc --noEmit` | 타입 검사 |
| `test` | `vitest run` | 자동 테스트(CI 포함) |
| `build` | `tsc --noEmit && vite build` | 타입 검사 + 배포 빌드 |
| `preview` | `vite preview` | 빌드 결과를 `/driving_game/`로 제공 |
| `test:e2e` | `playwright test` | 브라우저 확인(webServer: `npm run build && npm run preview -- --port 4173 --strictPort`, baseURL `http://localhost:4173/driving_game/`) |

- Vitest는 `vite.config.ts`의 `test.include: ['tests/unit/**/*.test.ts']`로 E2E 파일과 분리합니다(`vitest/config`의 `defineConfig`).
- E2E 관찰용으로 `document.body.dataset.screen`(화면 상태)과 `document.body.dataset.overlays`(켜진 겹침 안내: `paused`, `rotate`, `storageNotice`, `contextLost`, `confirmExit`)를 항상 쓰고, `?e2e`일 때만 `window.__e2e`(틱 수, 경기 틱, 플레이어 순위, 아이 차 탑승객 id 읽기 전용)를 엽니다. 상세는 [contracts/static-paths.md](./contracts/static-paths.md).
- 결정적 주행 테스트(SC-002): 틱 번호로 짠 입력 스크립트를 루프 드라이버에 넣고 프레임 간격 4종 × 차량 id 5개로 돌려 `toEqual` 완전 일치를 확인합니다. 같은 기기 안에서는 비트 단위로 같고, 기기 사이는 `Math.sin/cos` 구현 차이로 마지막 자리가 다를 수 있습니다(SC-002는 기기 사이 비교를 요구하지 않음).

## 성능 초기 예산

SC-024 목표 수치는 초기 기기 점검에서 정합니다. 아래 값은 점검을 시작하기 위한 제안이며 확정값이 아닙니다.

| 항목 | 초기 예산(제안) | 측정 방법 |
|---|---|---|
| 필수 파일 전송량 | 약 4 MB 이하(GLB 약 2.5 MB + JS(인라인된 SVG 그림 포함)·CSS). 그림이 JS 안에 들어가 JS 크기가 그만큼 늘어남 | `dist/` 크기, 기기 브라우저 개발 도구 네트워크 탭 |
| 첫 화면까지 시간 | 기기 점검에서 확정 | `?perf`: `performance.timeOrigin`부터 시작 화면 준비까지 |
| 그리기 호출 | 마을 장면 120 이하, 트랙 장면 60 이하 | `renderer.info.render.calls` |
| 삼각형 | 프레임당 15만 이하 | `renderer.info.render.triangles` |
| 텍스처 | 장당 1024² 이하, 합계 8장 이하(현재 GLB 1024² 3장) | `renderer.info.memory.textures` |
| 픽셀 비율 | `min(devicePixelRatio, 2)`, 저사양에서 낮출 상수 하나 | 기기 점검에서 조정 |
| 그림자 | 그림자 맵 없음(바닥 원형 그림자) | |
| 프레임 | 60 fps 목표, 판정 기준(평균, 5초 구간 최저)은 기기 점검에서 | `?perf`: 평균 fps, 가장 긴 프레임 |
| 소리 메모리 | 배경음 30~60초 반복 구간 | |

측정 절차: 선정 기기마다 배포 주소를 `?perf`로 열어 로딩 시간과, 마을 연습 60초·레이싱 60초(버기 포함 4대)의 평균 fps·가장 긴 프레임·그리기 호출을 기록합니다. 기록 위치는 tasks 단계에서 정합니다.

## 작업 단계

| 단계 | 내용 | 완료 확인 |
|---|---|---|
| 0. 준비 — **사용자 승인 필요** | `package.json`·잠금 파일·설정 파일 생성과 의존성 설치(`npm install`), 미준비 차량 GLB 5개 내려받기와 `SHA256SUMS` 확장(캐릭터 3종은 준비됨), Playwright 브라우저 설치(`npx playwright install chromium webkit`), 사용자의 Pages 소스 "GitHub Actions" 켜기(첫 커밋은 완료, `main` 푸시는 단계 4의 크레딧 뒤) | `npm ci`, `shasum -a 256 -c` |
| 1. 코드 기반 | 부팅·로더·3D 불가·로딩 실패, stage·models, **모델 렌더링 점검**(8종 방향·크기, 왜건 음영, 버기 합치기, 차종별 탑승객 좌석 보임, Chicken Guy 클립과 `Head`·`Hand` 자세 시제품), 루프, 입력, 차량 sim·충돌, 화면 흐름(시작·선택·연습 목록 뼈대), 일시정지·생명주기·세로 안내, 저장 모듈, **배포 워크플로 파일 먼저 준비**(하위 경로는 로컬 미리보기로 확인, 공개 배포는 크레딧 뒤) | `npm test`, `npm run build`, `npm run test:e2e`(하위 경로·3D 불가·저장 불가), 로컬 미리보기 하위 경로 |
| 2. 안전 연습 | 조작 익히기, 연습 판정 엔진(자리표시 마을 배치로 1개 상황 → 3개), 신호·Chicken Guy 보행자, 위험 직전 멈춤, 보행자 시점 안내 타임라인(자리표시 카드), 규칙 순환, 레이싱 열림 저장 | SC-008·009·010·031 Vitest, 플레이 확인 |
| 3. 레이싱 | 트랙 데이터(자리표시), 체크포인트·바퀴·순위, 컴퓨터 차량, 접촉·끼임 복귀, 카운트다운, 결과·최고 기록, 재도전 | SC-012~015 Vitest, SC-011 대리 지표 |
| 4. 소리·저장 마무리 | 오디오 엔진(잠금 해제, 안내 하나만, 배경음 낮춤, 일시정지·재개, 설정), 저장 불가 안내 흐름, 크레딧 화면, **첫 공개 배포**(크레딧 뒤, 사용자 승인 후 `main` 푸시) | SC-016~021, 실제 배포 주소 |
| 5. 콘텐츠 제작(별도 단계) | 마을 장면 요소(FR-092), 규칙 38문구 그림, 안내 음성, 효과음, 배경음 선정·사용조건 확인, UI 그림, 다른 차 탑승객 배정, 크레딧 최종. **사용자 결정 B15 필요** | 콘텐츠 Vitest(SC-030), 검토 기록(SC-026·027·030·031) |
| 6. 점검 | 초기 기기 점검(대표 기기 선정, SC-023·024 목표 확정), 트랙 플레이 점검(바퀴 수·5분, SC-011), 실제 기기 시험(SC-003~007, SC-032), 어린이 관찰(SC-028) | 기록 |

2와 3은 1이 끝나면 나란히 진행할 수 있습니다. 5는 2·3에서 데이터 형식이 정해진 뒤 시작합니다. 코드 단계는 자리표시 콘텐츠(단순 도형 그림, 음성 없음)로 기능을 완성합니다.

## 사용자 결정 기록 (2026-10-12, plan 단계)

spec·PRD·용어집에 이미 반영되었습니다(spec.md Clarifications "Session 2026-10-12 (plan 단계)").

| # | 결정 | 반영 위치 |
|---|---|---|
| A1 | 교육용 마을의 등장 보행자와 보행자 시점 안내의 주인공은 Chicken Guy로 고정합니다. 손 들기·왼쪽/오른쪽 보기는 `Hand.L`/`Hand.R`/`Head` 관절(three.js 안 이름 `HandL`/`HandR`/`Head`) 자세 조정으로 실제로 보여 줍니다. 걷기·서 있기는 `Armature|Walk`, `Armature|Idle`을 쓰고, `Sprint`·`Jump`는 쓰지 않습니다. | FR-096, US2-19, SC-032, `render/characters.ts` |
| A2 | 인물 선택은 내 차에 태울 탑승객을 고르는 것입니다. 고른 인물은 안전 연습·레이싱 내내 아이 차에 타 있고 저장하지 않습니다. 5종 모두 카메라에서 보이는 좌석이 1개 이상 필요합니다. | FR-097, FR-011, US1-12·13, SC-032, `VehicleKind.seats` |
| A3 | "다시 하는 연습"은 이번 실행에서 그 연습을 이미 완료했거나 튜토리얼 전체 완료 기록이 있는 경우입니다. | FR-091, `isReplay` |
| A4 | 굴러가는 공과 차 밑 물건은 마을 장면 요소(기본 도형)로 둡니다. 건너편·친구·어른 인물, 우산·밝은 옷은 규칙 그림으로만 보여 줍니다. 버스·통학버스·정류장·육교/지하도도 기본 도형으로 만듭니다. | FR-092 |
| A5 | 배포 직후 이전 파일 404일 때 다시 시도는 페이지를 새로 엽니다(저장 유지). | FR-004 |
| A6 | poly.pizza GLB 8개를 사용하고 ZIP 원본은 보존합니다. | PRD "제공된 차량·사람 모델" |

## 리더 결정 기본값

사용자에게 기본값으로 보고한 기술·해석 결정입니다. 바꾸려면 사용자 확인이 필요합니다.

| # | 항목 | 결정 |
|---|---|---|
| B1 | 버전 | three 0.186.1, @types/three 0.186.0, typescript 7.0.2(막히면 6.0.3), vite 8.3.1(2026-10-20 이후 8.3.3 이상으로 올리기 전 `--host` 금지), vitest 5.0.2, @playwright/test 1.63.0, Node 24 |
| B2 | 바퀴 회전 | 첫 버전 없음(5종 동일) |
| B3 | 최고 기록 단위 | 1/100초 정수 `timeCs`, 표시 `m:ss.cc`. 틱(1/60초)에서 완주 순간 1회 변환 |
| B4 | 정지 판정 | 자연 감속으로 선 것도 정지. `speed === 0` |
| B5 | 바퀴 수 | 2바퀴 잠정(트랙 플레이 점검에서 확정) |
| B6 | SC-002 허용 오차 | 자동 테스트 완전 일치, 실제 기기 ±0.05초·±0.1 m |
| B7 | 한 프레임 최대 틱 | 8틱. 7.5 fps 미만 기기에서는 게임 시간이 느려짐. SC-012는 지원 기기(초기 기기 점검 선정) 기준으로 확인 |
| B8 | 처음 이용 흐름 | 저장된 완료 기록이 없고 이번 실행에서 처음 시작할 때만 세 연습을 순서대로 이어 감. 그 밖에는 연습 목록 |
| B9 | 손상된 저장 값 | 조용히 항목별 기본값(안내 없음). 저장소 API 예외(읽기·쓰기 실패)에만 저장 불가 안내 1회 |
| B10 | 구간 재시도와 보행자 시점 안내 | 같은 시도 안에서 이미 끝낸 안내는 구간 재시도 뒤 다시 보여 주지 않음 |
| B11 | 가로 180° 뒤집기 | 입력 해제, 일시정지 안 함 |
| B12 | 잘못된 행동 종류 | FR-033과 SC-010의 합집합 6종: `overStopLine`, `ranRed`, `earlyStart`, `enteredCrosswalkWithPedestrian`, `turnedIntoCrossingPedestrian`, `enteredSidewalk` |
| B13 | 보행자 시점 안내 진행 | 카드 길이(틱)로 자동 진행, 음성 완료를 기다리지 않음 |
| B14 | 게임 안 시간 | 모두 틱. 상수 이름은 `*_TICKS`(밀리초 상수 쓰지 않음, UI 꾸밈 애니메이션 제외) |
| B15 | 콘텐츠 단계에서 사용자 결정 | 안내 음성 제작 방법(직접 녹음 / 미리 만든 TTS 파일, 실행 중 `speechSynthesis` 비권장), 규칙 그림 38장·UI 그림 제작 방법, 배경음악 곡·녹음 선정 |
| B16 | 저장소 사실 | `.gitignore`에 `modeling/`이 있어 ZIP은 GitHub에 올라가지 않음(배포 영향 없음) |
| B17 | 컴퓨터 차량 목표 속도 비율 | `AiProfile.targetSpeedRatio`는 "액셀을 언제 떼는지"라는 주행 방식이고 성능 한도(`DRIVING_SPEC`)는 모든 차가 같으므로 FR-054(난이도는 주행 경로와 반응으로 조절)에 맞음. 필드 유지 |

## Open Issues

아직 남은 항목만 적습니다.

| # | 항목 | 정할·확인할 시점 |
|---|---|---|
| O1 | 콘텐츠 단계 사용자 결정(B15): 안내 음성 제작 방법, 규칙 그림 38장·UI 그림 제작 방법, 배경음악 곡·녹음 선정과 사용조건 확인 | 콘텐츠 제작 단계 시작 전 |
| O2 | 차종별 탑승객 좌석 보임: 왜건·트럭 운전석처럼 지붕 있는 차량에서 고른 인물이 보이는지, 안 보이면 장난감 같은 좌석 표현 | 모델 렌더링 점검(단계 1) → 콘텐츠 설계 |
| O3 | Chicken Guy 관절 자세(`Head` 회전, 떠 있는 `Hand` 위치)로 만든 좌우 보기·손 들기가 자연스러운지, 들어 올릴 손 | 모델 렌더링 점검 |
| O4 | 다른 차(컴퓨터 차량, 주차된 차)의 탑승객 배정 | 콘텐츠 설계 |
| O5 | 바퀴 수(2바퀴 잠정)와 약 5분 허용 범위, 조정 상수 값(`EXTRAS_PER_VIEW`, `IDLE_HINT_TICKS`, `DEMO_AFTER_FAILS`, `EXPLAIN_TICKS`, `STUCK_TICKS`, `CONTACT_SLOW_TICKS`, `COUNTDOWN_TICKS`), 정지 인정 범위 크기. `IDLE_HINT_TICKS`는 무입력 재안내 간격과 연습 중 막힘 판정 시간을 함께 맡음 — 의미가 다른 두 값을 한 상수로 묶었으므로 따로 조정할 필요가 생기면 분리 | 트랙·플레이 점검 |
| O6 | 대표 기기·최소 OS/브라우저 버전, SC-023·SC-024 목표 수치, "너무 작은 화면 영역" 기준 | 초기 기기 점검 |
| O7 | 실제 기기에서만 확인 가능한 미확인 사항: iOS Safari의 확대·두 번 탭 차단 동작, 화면 잠금 때 `visibilitychange` 발생, AudioContext `interrupted` 뒤 재개, MP3 디코딩, 시스템 제스처의 터치 취소, iOS 컨텍스트 손실 복구, 새로 고침 때 캐시된 `index.html`을 다시 확인하는지 | 단계 1·6 실제 기기 |
| O8 | 도구 동작 확인: Playwright WebKit headless의 WebGL2, `vite preview`의 `base` 하위 경로 제공, TypeScript 7.0.2와 tsconfig 조합 | 단계 1 첫 태스크 |
| O9 | Vite 8.3.3 이상으로 올리기(2026-10-20 이후, 개발 서버 보안 수정) | 실제 기기에서 개발 서버를 열기 전 |
| O10 | GitHub Pages 켜기(사용자 작업). 첫 커밋은 완료(2026-10-12). 첫 `main` 푸시는 크레딧 화면 뒤 | 단계 0(켜기), 단계 4(푸시) |
| O11 | GitHub Pages 캐시 헤더(`max-age=600`)의 공식 문서 근거(실측만 있음) | 참고용, 동작에는 부팅 가드로 대비 |
| O12 | **해결(사용자 결정 2026-10-12)**: 시작 버튼보다 잠긴 레이싱을 먼저 누르면 소리 활성화 전이므로 잠김 안내를 그림으로만 보여 줌(FR-066 우선, spec FR-048에 반영) | — |
