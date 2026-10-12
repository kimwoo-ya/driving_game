# 01 Contract Designer — 계약 설계 보고서

- 작성: spec-plan-contract-designer, 2026-10-12, plan 단계
- 적용 기준: `AGENTS.md`의 프로젝트 기준. IVI 기술 규칙(Java/Spring, REST Controller, HTTP 상태 코드, 에러 코드 체계)은 적용하지 않음. 역할 양식의 "Endpoint/Request/Response/Error Codes"는 모듈 함수·이벤트·저장 형식·에셋·콘텐츠 데이터·정적 경로로 바꿔 씀(00_plan_context.md 2절).
- 읽은 원문(순서): `_workspace/00_plan_context.md`, `_workspace/02_plan_decisions.md`, `AGENTS.md`, `docs/PRD.md`, `GLOSSARY.md`, `spec.md`(1~650줄 전부), `.specify/memory/constitution.md`(빈 양식 = constitution 없음, 사용자 결정), `_workspace/01_architect_architecture.md`(전부), `_workspace/01_data-modeler_schema.md`(전부), 작성 중 새로 생긴 `data-model.md`(전부)·`plan.md`(전부, 리더 작성)·`research.md`(일부 검색).

```
[Speckit-Context] plan phase
  ├ constitution: 없음(빈 양식, 2026-10-12 사용자 결정). 대신 AGENTS.md 기준 — PRD·용어집 기준, 승인 스택만, 원본 보존, 실제 테스트 근거, IVI 규칙 미적용
  └ spec: FR-001~097, SC-001~032. 서버 없는 GitHub Pages 정적 3D 게임(three.js+TS+Vite). 차량 5·인물 3(탑승객 선택, 보행자·주인공은 Chicken Guy 고정), 안전 연습 3 + 조작 익히기, 규칙 38문구(핵심 매번·추가 순환), 레이싱 4대·2바퀴 잠정, 저장 3항목(localStorage), 시간은 틱, 외부 요청·외부 링크 없음
```

## 1. 산출물

| 파일 | 내용 |
|---|---|
| `contracts/overview.md` | 계약 목록 표(파일·경계·FR/SC), 공통 규칙 10개, 모듈 의존 방향 |
| `contracts/modules.md` | 모듈 11곳의 TypeScript 선언·전제·보장·오류 동작, 타입·상수 소속 파일 표 |
| `contracts/events.md` | 연습·안내·조작 익히기·레이싱 이벤트(payload·발생 조건·flow 반응), 이벤트가 아닌 신호(후진 탭·일시정지·숨김·회전·컨텍스트), 같은 틱 안 순서, 일시정지와 겹칠 때(FR-077) |
| `contracts/storage.md` | 키·버전, `parseSave`/`loadSave`/`commitSave` 모양, 합치기, 시점, 실패 동작, SC-018 6종과 경계값, 두 탭 시험 |
| `contracts/assets.md` | `AssetId`·`ASSET_URLS`, 필수·번들 포함·선택 구분, GLB 8개(주소·크기·SHA-256), 정규화 입력·출력, Chicken Guy 동작·관절(three.js 안 이름), 파일 이름 규칙, 크레딧 변경 문구 |
| `contracts/content-data.md` | 상수 10개의 조건, 코드가 부르는 음성 줄 26개, 콘텐츠 무결성 검사 23항목(항상/완성) |
| `contracts/static-paths.md` | `/driving_game/`·`base`, `dist/` 구조, SVG 인라인, 캐시·404, 셸·부팅 가드, Playwright 외부 요청·링크·권한 검사, `data-screen`·`data-overlays`·`?e2e`·`?perf` |

## 2. 설계 근거 (핵심)

1. **step 함수 + 이벤트 한 갈래**: 순수 모듈은 `{ state, events }`만 돌려주고, 입력 해제·화면·소리·저장은 이벤트를 받은 `app/flow.ts`만 합니다. 그래서 FR-077(일시정지 전 사건은 결과·저장까지)이 단일 스레드 + 동기 저장으로 구조적으로 성립합니다.
2. **FR-011을 시그니처로**: `stepVehicle(state, input)`에 차량 종류·성능 매개변수가 없고, 충돌도 `DRIVING_SPEC.bodyRadius` 하나뿐입니다. 렌더러 값은 순수 상태로 돌아가지 않습니다.
3. **FR-041을 시그니처로**: `stepPedestrianView`에 입력 매개변수가 없고 건너뛰기 함수가 없습니다. 진행은 틱(`introTicks`, `durationTicks`)으로만.
4. **위험 직전 멈춤 = 후보 위치 판정**: 틱마다 `stepVehicle` 결과를 후보로 보고, 잘못된 행동이면 후보를 버립니다. 차체가 경계를 실제로 넘는 틱이 없어 FR-036(차가 보행자에게 닿는 장면 0)을 데이터 거리 검사 하나로 지킬 수 있습니다.
5. **후진 거절은 이벤트가 아님**: flow가 `requestGearToggle(drive).accepted`로 미리 알고 "먼저 멈춰요"를 띄우며, 같은 함수를 step 안에서도 씁니다(규칙 한 곳). 02 표에 없는 이벤트를 만들지 않았습니다.
6. **저장 함수는 던지지 않고 결과만**: `loadSave → { data, ok }`, `commitSave → boolean`. 안내는 flow가 실행당 1회. 시험은 `vi.stubGlobal('localStorage', …)`로 하므로 저장소 매개변수를 두지 않았습니다.
7. **완주 결과는 flow가 조립**: 최신 저장 값을 읽어야 해서 순수 step 밖입니다. 계산 자체는 순수 함수 `finishResult`로 두어 SC-015를 Vitest로 봅니다.
8. **그림은 JS 번들에 인라인**(SVG, `build.assetsInlineLimit` 함수): 플레이 중 네트워크가 끊겨도 규칙 카드 그림이 비지 않고, 실패 지점이 JS 하나(부팅 가드)로 줄어듭니다. 필수 다운로드는 GLB 8개뿐, 소리는 선택.
9. **음성 줄은 닫힌 목록 + `Record`**: 코드가 부르는 줄 26개를 계약으로 고정하고 `VOICE_LINES: Record<VoiceLineId, string>`로 두어 빠짐을 타입 검사가 잡습니다.
10. **콘텐츠는 실행 중 검사하지 않음**: 신뢰 경계(localStorage, 네트워크)만 실행 중 검사하고, 콘텐츠는 타입 + Vitest 23항목으로 보장합니다.

## 3. 사실 확인 기록 (2026-10-12)

| 확인 | 방법 | 결과 |
|---|---|---|
| GLB 8개 SHA-256·크기 | scratchpad에 `curl -o`로 내려받아 `shasum -a 256` | architect 보고서 표와 8/8 일치. 합계 2,486,368바이트. 저장소에는 넣지 않음 |
| Chicken Guy 노드·동작 | GLB JSON 청크 직접 판독(`python3 -I`) | 노드 `Head`, `Hand.L`, `Hand.R`, `Foot.L/R` 등 31개, 동작 `Armature|Grounded/Idle/Jump/Sprint/Walk`, 스킨 2(관절 27씩), `extensionsUsed` 없음 |
| three.js가 노드 이름을 바꾸는지 | three@0.186.1 `GLTFLoader.js`·`PropertyBinding.js`(jsdelivr) 판독 | `createUniqueName`(3757~3771행)이 `sanitizeNodeName`(185~187행)으로 `[ ] . : /`를 지움 → **`Hand.L` → `HandL`, `Hand.R` → `HandR`**. 동작 이름은 그대로(4130행) |
| Vite 인라인 설정 | vite v8.3.1 `docs/config/build-options.md` | `build.assetsInlineLimit`: `number \| ((filePath, content) => boolean \| undefined)`, 기본 4096 |
| `?url`·`import.meta.glob` 쿼리 | vite v8.3.1 `docs/guide/assets.md`, `features.md` | `?url` 접미사, `query: '?url', import: 'default'` 문서에 있음 |
| Pages 캐시 | `curl -sI https://mrdoob.github.io/stats.js/` | `cache-control: max-age=600` |
| 미확인 | — | Vitest(node)에서 `import.meta.glob` + `?url` 동작, `vite preview`의 하위 경로, WebKit headless WebGL2, Safari 새로 고침 때 `index.html` 재확인 |

## 4. 02 결정·data-model과 다르게 쓴 곳

| # | 원안 | 계약 | 이유 | 맞출 문서 |
|---|---|---|---|---|
| D1 | plan.md 데이터 흐름 "그림·소리 → `dist/assets` 해시 파일, `<img>`(그림)" | 그림 SVG는 JS 번들에 인라인(`assetsInlineLimit` 함수). 필수 다운로드는 GLB 8개, 소리는 선택 | Edge "로딩을 마친 뒤 네트워크가 끊겨도 이미 받은 범위에서 플레이"와 FR-070(핵심 안내는 그림). `<img>`로 늦게 받으면 플레이 중 카드 그림이 비고 다시 시도 경로가 없음 | plan.md 데이터 흐름 표·성능 예산(JS 크기 증가), research.md |
| D2 | data-model.md 6.3 "정지선·횡단보도 가장자리와 보행자 경로 사이 거리 ≥ `bodyLength` + 여유" (plan.md 228행도 같음) | 보행자 경로가 위반 경계의 **차 반대편**에 있고 거리 ≥ 사람 반지름 + 여유(테스트 상수 1 m 제안) | 원안은 횡단보도 가장자리에서 성립할 수 없음(보행자는 횡단보도 위를 걸으므로 가장자리와의 거리가 차체 길이보다 짧음). 계약은 위반을 후보 위치에서 판정해 차체가 경계를 넘지 않으므로 이 거리로 충분 | data-model.md 6.3, plan.md "안전 연습 판정" |
| D3 | data-model.md `VOICE_LINES`: `VoiceLine[]`(`{ id, text }`), "나머지 줄 목록은 콘텐츠 단계에서 정함" | `VOICE_LINES: Record<VoiceLineId, string>`, `VoiceLineId` = 코드가 부르는 26개 닫힌 목록(content-data.md 3장). 대본은 콘텐츠 단계 | 코드가 ID로 부르므로 ID는 코드 단계에서 정해야 하고, `Record`면 빠짐을 타입 검사가 잡음 | data-model.md 2.1 VoiceLine |
| D4 | data-model.md `DrivingLessonState = { step, idleTicks }` | `drive: DriveState` 필드 추가(시작 = `restingAt(SCENARIOS[0].segments[0].start)`) | 조작 익히기도 차를 실제로 움직여야 함 | data-model.md 2.2 |
| D5 | data-model.md `ScenarioAttempt`(필드 13개) | `picked: { rules, extrasCount }` 필드 추가 — `startScenario`가 `pickRules` 결과를 받음 | 안내 규칙은 시도 동안 바뀌지 않으므로 시작 때 정하면 step에 실행 상태를 넘길 필요가 없음 | data-model.md 2.2 |
| D6 | data-model.md RouteIssue "나머지는 `hint` 또는 `redirect`" | `stoppedTooFar` → `hint`(`closer`), `wrongWay` → `hint`(`way`), `leftPath`·`blocked` → `redirect`(구간 다시 놓기, `failStreak` 그대로). `blocked` = 건물·연석에 닿은 채 `IDLE_HINT_TICKS` 동안 진행 없음 | 이벤트 하나가 하는 일을 하나로 고정 | data-model.md 2.1 |
| D7 | data-model.md 4.7 `countdownTick`을 매 틱 | 첫 틱과 남은 초가 바뀔 때만(`secondsLeft` 3·2·1) | 소리·숫자는 초마다 한 번이면 충분, 이벤트 180개 방지 | data-model.md 4.7 |
| D8 | data-model.md 4.7 "같은 틱에 `FinishResult` 계산·저장"(stepRace 안으로 읽힘) | `stepRace`는 `result`를 채우지 않고 `playerFinished { timeCs, rank }`만. flow가 `loadSave`로 최신 기록을 읽어 `finishResult()`로 계산해 `race.result`에 넣음(같은 틱) | 최신 저장 값 읽기는 순수 함수 밖 | data-model.md 4.7·7장 문구 |
| D9 | data-model.md 5.5 참고 구현 `commitSave(run, trackConfigKey, changed): void`(안에서 안내) | `commitSave(current, changed, trackConfigKey): boolean`, 안내는 flow | 저장 모듈이 UI를 부르지 않게(순수 폴더 규칙) | data-model.md 5.5 참고 구현(참고용이라 표시만) |
| D10 | plan.md·research.md·data-model.md "`Hand.L`/`Hand.R` 관절" | GLB 이름은 맞지만 three.js 안에서는 **`HandL`/`HandR`**로 찾아야 함 | 3장 사실 확인. 코드에서 `'Hand.L'`로 찾으면 `undefined` | plan.md 307행, research.md 186·193행, data-model.md 2.1 CharacterKind 설명(코드 상수 값) |
| D11 | data-model.md 6.3 "장면 요소 배치" 검사(항상) | "완성" 단계 검사 | 코드 단계는 최소 자리표시 장면 요소로 진행(plan.md 작업 단계) | data-model.md 6.3 |
| D12 | plan.md 크레딧 Chicken Guy 문구 "…좌우 보기·손 들기 자세를 만듭니다" | data-model.md 문구 "…왼쪽·오른쪽 보기와 손 들기를 표현합니다"를 따름 | 두 문서 문구가 다름 → 하나로 | plan.md 313행 |
| D13 | plan.md E2E 관찰 `document.body.dataset.screen`만 | `document.body.dataset.overlays` 추가(켜진 겹침 이름) | SC-006(세로 안내)·SC-017(저장 불가 안내 1회) E2E에 필요 | plan.md 259·409행 |

02 결정 C 이름표와 다르게 쓴 이름은 없습니다(모든 표의 이름 그대로). 이벤트 `lessonDone`만 표에 없는 새 이벤트입니다.

## 5. 이 단계에서 새로 정한 이름 (02 표에 없음)

- 루프·입력: `ticksForFrame`, `startLoop`, `setTicking`, `HoldButton`, `ScreenPoint`, `ScreenRect`, `mountControls`, `readDriveInput`
- 주행: `restingAt`, `blockByAreas`, `blockByTrackWalls`, `separateCars`
- 연습: `startDrivingLesson`, `DrivingLessonEvent`, 이벤트 `lessonDone`, `HintCue`, `startScenario`, `ScenarioEvent`, `advanceExtraCursor`, `initActors`, `stepTownActors`(잠정), `ScenarioAttempt.picked`, `DrivingLessonState.drive`
- 안내: `startPedestrianView`, `rewindPedestrianView`, `PedestrianViewEvent`
- 레이싱: `createRace`, `finishResult`, `RaceEvent`, `aiInput`
- 앱: `createRunState`, `ASSET_URLS`, `LoadResult`, `loadSounds`, `startFlow`, `Screen`
- 렌더러: `Stage`, `createStage`, `PreparedModel`, `cloneModel`, `renderShowroom`, `renderTown`, `renderTrack`
- 소리: `SfxId`(7개), `unlockAudio`, `applySoundSettings`, `playVoice`, `stopVoice`, `playSfx`, `pauseAudio`, `resumeAudio`
- 생명주기: `LifecycleSignal`, `watchLifecycle`
- 콘텐츠: `VoiceLineId` 26개(content-data.md 3장)
- 관찰: `data-overlays`, `window.__e2e`의 `ticks`·`raceTicks`·`playerRank`·`passenger`

data-model.md Open Issues 6의 신규 이름(`PictureElementId`, `SeatDef.pos/height`, `VoiceLineId`, `VIOLATION_LINES`, `EXPLAIN_TICKS`, `ActorPlan`, `AreaId`, `SignalId`, `Rect`, `drivingLessonDone`, `practiceStarted`, `music`/`voiceSfx`, `driving_game:probe`)은 계약에서 그대로 썼습니다.

## 6. 리더에게 넘길 항목

### 6.1 spec·PRD 공백·모순 (문서는 고치지 않음)

1. **FR-066과 US3-1이 겹치는 순간**: FR-066은 "시작 버튼 전에는 소리 없음", US3-1·FR-048은 "잠긴 레이싱을 누르면 그림·음성 안내". 실행 직후 시작 버튼보다 잠긴 레이싱을 먼저 누르면 둘 다 지킬 수 없습니다. 계약 기본값: 소리가 아직 활성화되지 않았으면 그림만(FR-066 우선), 이미 활성화된 뒤(시작 화면으로 돌아온 경우)에는 음성도. 다른 해석(레이싱 버튼도 소리 활성화로 봄)을 원하면 사용자 확인.
2. **FR-036 거리 검사 기준**(D2): data-model.md와 plan.md의 "차체 길이 + 여유"는 횡단보도 가장자리에 적용할 수 없습니다. 계약의 기준으로 바꿀지 확인.
3. **`blocked` 판정 시간**(D6): 연습에서 "진행할 수 없게 되면"(FR-035)을 `IDLE_HINT_TICKS` 재사용으로 정했습니다. 따로 상수를 원하면 이름 하나(`BLOCKED_TICKS`)가 늘어납니다.
4. **소비자 없는 이벤트**: `pedestrianStarted`, `carFinished`는 02 표에 있어 남겼지만 첫 버전 flow 반응이 없습니다(렌더러·HUD가 state로 처리). 빼도 계약상 문제없습니다.

### 6.2 사용자 결정과 묶인 기본값

1. **그림 형식 = SVG(번들 인라인)**(D1): 02 결정 B15(규칙 그림 38장·UI 그림 제작 방법)를 정할 때 형식 제약으로 함께 알려야 합니다. 큰 래스터(PNG)를 고르면 그림을 `loadRequired` 대상으로 옮기고 진행률에 넣습니다.
2. **음성 줄 26개**(content-data.md 3장): 안내 음성 제작 방법(B15)을 정할 때 이 목록이 녹음·TTS 대본 목록이 됩니다(규칙 38개 + 26줄).
3. **`AiProfile.targetSpeedRatio`**(data-model.md Open Issues 3): 계약상 `aiInput`은 `DriveInput`(액셀은 켬/끔)만 돌려주므로, 목표 속도 비율은 "액셀을 덜 밟는 반응"으로만 표현됩니다. 성능 한도는 바뀌지 않습니다. FR-054 해석 확인은 그대로 필요.

### 6.3 다른 문서에 반영할 것

- data-model.md: D2, D3, D4, D5, D6, D7, D8, D10(코드 상수 값 `HandL`/`HandR` 명시), D11.
- plan.md: D1(데이터 흐름 표 "그림" 줄, 성능 예산의 JS 크기), D2(228행), D10(307행), D12(313행), D13(259·409행).
- research.md: D10(186·193행에 "three.js 안 이름은 `HandL`/`HandR`" 한 줄).
- quickstart.md: E2E 관찰에 `data-overlays` 추가(D13). GLB 체크섬 값은 assets.md 3장과 같아야 함(이번에 8/8 다시 확인).

### 6.4 tasks 단계로 넘길 확인

- Vitest(node)에서 `import.meta.glob` + `?url`이 되는지(안 되면 콘텐츠 검사 12·21·22번을 `node:fs`로, `@types/node` 필요 여부).
- 콘텐츠 무결성 검사의 "완성" 항목을 켜는 시점(8·21·22·23번).
- `stepTownActors` 시그니처는 `ActorPlan`과 함께 연습 엔진 첫 태스크에서 확정.
- 실제 시간 상수 두 개(로더 정체 판정, 컨텍스트 복구 대기)의 값은 기기 점검에서.
