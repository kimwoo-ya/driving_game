# Contracts Overview — 001 아동용 3D 운전·보행 안전 게임

- 작성: plan 단계, 2026-10-12. 기준: `_workspace/02_plan_decisions.md`(이름 통일표, 최우선), [data-model.md](../data-model.md)(타입 필드·저장 형식·콘텐츠 형식의 상세), [plan.md](../plan.md)(모듈 구조).
- 이 프로젝트에는 서버·REST API·DB가 없습니다(AGENTS.md). 여기서 "계약"은 **모듈 사이의 함수·타입 약속, step 함수가 돌려주는 게임 이벤트, 브라우저 저장 형식, 에셋 목록·형식, 콘텐츠 데이터 형식, 정적 파일 경로**입니다. 엔드포인트·HTTP 상태 코드는 없습니다.
- 타입 필드는 data-model.md가 기준이고 이 폴더는 **경계와 바깥 약속**(누가 무엇을 부르고, 무엇을 보장하고, 실패하면 어떻게 되는지)만 적습니다. 두 문서가 다르면 리더에게 알리고, 그 전까지는 02 결정 → data-model.md → contracts 순으로 따릅니다.

## 계약 목록

| 파일 | 대상 경계 | 맡는 FR / SC |
|---|---|---|
| [modules.md](./modules.md) | 모듈별 공개 함수·타입 시그니처, 전제·보장(불변식), 오류 동작, 타입 소속 파일 | FR-011, FR-014~019, FR-022, FR-027, FR-032~034, FR-041, FR-054~061, FR-066~070, FR-073~074, FR-091 / SC-001~004, SC-008, SC-012~014 |
| [events.md](./events.md) | step 함수가 돌려주는 이벤트(이름·payload·발생 조건·같은 틱 안 순서)와 `app/flow.ts`의 반응(화면·소리·저장·입력 해제), 일시정지와 겹칠 때 | FR-017, FR-031, FR-033~037, FR-040~041, FR-047, FR-055~057, FR-061, FR-063, FR-068, FR-071~077 / SC-003, SC-007, SC-009, SC-010, SC-020 |
| [storage.md](./storage.md) | localStorage 키 `driving_game:save`, 형식 버전, `parseSave`·`loadSave`·`commitSave`, 손상 6종 처리, 여러 탭 합치기, 저장 실패 | FR-047, FR-064, FR-078~084 / SC-015~019 |
| [assets.md](./assets.md) | `AssetId` 형식, 필수(GLB 8)·번들 포함(그림)·선택(소리) 구분, GLB 8개 원출처·SHA-256, 모델 정규화 입력, Chicken Guy 동작·관절 이름, 파일 이름 규칙, 크레딧 변경 문구 | FR-002~004, FR-009, FR-011, FR-039, FR-067, FR-070, FR-088~090, FR-094, FR-096~097 / SC-022, SC-026, SC-032 |
| [content-data.md](./content-data.md) | `src/content/*.ts` 상수와 `DRIVING_SPEC`의 필수 내용, 코드가 부르는 음성 줄 목록, 콘텐츠 무결성 검사(Vitest) | FR-011, FR-036, FR-044~046, FR-052, FR-058, FR-088, FR-091~097 / SC-026, SC-030~032 |
| [static-paths.md](./static-paths.md) | GitHub Pages 하위 경로 `/driving_game/`, Vite `base`, 해시 파일 이름, `dist/` 구조, 캐시, 배포 직후 404, 부팅 가드, 외부 요청 0·`a[href]` 0 검사, E2E 관찰 지점 | FR-001~005, FR-084~086 / SC-022, SC-025, SC-026 |

## 공통 규칙 (모든 계약에 적용)

| # | 규칙 | 근거 |
|---|---|---|
| 1 | **게임 안의 시간은 모두 틱**(`TICK_HZ = 60`, 1틱 = 1/60초). 경기 시간·신호·보행자·카운트다운·안내 카드·재안내·끼임 판정은 틱 수로 셉니다. 상수 이름은 `*_TICKS`. `Date.now()`·`setTimeout`·`setInterval`은 게임 진행에 쓰지 않습니다. 실제 시간(ms)은 UI 꾸밈 애니메이션, 네트워크 정체 판정, 컨텍스트 복구 대기에만 씁니다. | 02 결정 B14, FR-022, FR-074 |
| 2 | **ID는 kebab-case 문자열**(`'banana-car'`, `'signal-wait'`, `'hint-stop'`). 예외: 규칙 ID는 조사 ID 그대로(`'A6'`, 묶음 `'A14-A15'`). 상태·종류 값(`'loadFailed'`, `'overStopLine'`, `'lookLeft'`)은 02 결정 C의 camelCase 표기를 씁니다. | 02 결정 C, data-model.md 0장 |
| 3 | **순수 로직 폴더**(`src/sim`, `src/practice`, `src/pedestrianView`, `src/race`, `src/storage`, `src/content`)는 `three`, DOM, Web Audio를 import하지 않습니다. 브라우저 전역 객체에 닿는 곳은 `src/storage/save.ts`의 `localStorage` 하나뿐이며 반드시 `try` 안에서 접근합니다. `src/core/loop.ts`는 순수 모듈이 `TICK_HZ`를 가져가므로 **모듈 최상위에서** 브라우저 전역을 건드리지 않습니다. | plan.md "Structure Decision", FR-022 |
| 4 | **외부 요청 없음**: 실행 중 요청은 모두 같은 출처(`/driving_game/` 아래 해시 파일)입니다. 외부 글꼴·CDN·분석·광고 코드, poly.pizza 직접 요청, 권한 API(카메라·마이크·위치·알림·동작 센서), 기기 식별 값이 없습니다. | FR-084, FR-085, SC-025 |
| 5 | **외부 링크 없음**: `<a href>`를 만들지 않습니다. 크레딧 주소는 `textContent`로 넣은 글자입니다. 화면에 글을 넣을 때는 `textContent`만 쓰고 `innerHTML`·`eval`·`new Function`은 쓰지 않습니다. | FR-081, FR-086, FR-090, SC-026 |
| 6 | **좌표**: 판정은 바닥 2D(x, z), 1 = 1 m, `heading`은 라디안이고 0 = +Z. 높이(y)는 화면 표현에만 씁니다. | data-model.md 0장 |
| 7 | **step 함수 모양**: `step(state, …) → { state, events }`. 받은 `state`를 고치지 않고 새 값을 돌려줍니다. 같은 입력이면 같은 결과(무작위·시각 사용 없음). 끝난 단계(`done`, `finished`)에서는 같은 state와 빈 이벤트를 돌려줍니다. | 02 결정, plan.md 설계 원칙 1, FR-022 |
| 8 | **연결 방식**: 모듈 사이는 동기 함수 호출과 step이 돌려준 이벤트뿐입니다. 이벤트 버스·DI 컨테이너·구현 하나뿐인 인터페이스는 두지 않습니다. 비동기는 파일 내려받기(`loadRequired`, `retryFailed`, `loadSounds`), GLB 파싱(`prepareModel`), 소리 활성화·디코딩(`unlockAudio`)뿐입니다. | 01_architect "Integration Points" |
| 9 | **신뢰 경계에서만 실행 중 검사**: localStorage 값(`parseSave`)과 네트워크 응답(`loader`)만 실행 중에 검사합니다. 콘텐츠 데이터는 타입 검사와 Vitest 무결성 검사로 보장하고 실행 중에는 다시 검사하지 않습니다. | FR-081 |
| 10 | **게임 상태를 바꾸는 곳은 둘**: 순수 상태(시도·경기)는 step 함수만, 실행 상태(`RunState`)와 화면 상태(`ScreenState`)는 `app/flow.ts`만 바꿉니다. 렌더러·UI·소리는 상태를 읽기만 합니다. | FR-011, FR-077 |

## 모듈 의존 방향

```text
content ◀── sim ◀── practice, pedestrianView, race ◀── app(flow, session, loader) ──▶ render, ui, audio, platform, storage
   ▲         ▲                                              │
   └─────────┴── core/loop(TICK_HZ) ◀────────────────────────┘
```

- 화살표 머리 쪽이 import되는 모듈입니다(예: `sim`이 `content`를 import, `app`이 `render`를 import). `content`가 `sim`·`app/loader`의 타입을 쓰는 것은 `import type`뿐입니다.
- `storage`는 다른 게임 모듈을 import하지 않습니다(트랙 구성 키는 인자로 받음).
- `render`·`ui`·`audio`는 순수 상태를 읽기만 하고, 순수 모듈은 이들을 import하지 않습니다.

## 이 폴더에 없는 것

- 서버·REST API·DB·인증: 기능에 없습니다(PRD "기록과 배포", AGENTS.md).
- `ui/screens.ts`·`ui/hud.ts`·`ui/overlays.ts`의 세부 함수: `app/flow.ts`만 부르는 내부 함수라 계약으로 묶지 않습니다. 지켜야 할 약속은 위 공통 규칙 5(글은 `textContent`, 링크 없음)와 events.md의 화면 반응입니다.
