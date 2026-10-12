# 게임 이벤트 계약

- step 함수(`startDrivingLesson`/`stepDrivingLesson`, `startScenario`/`stepScenario`, `stepPedestrianView`, `stepRace`)가 `{ state, events }`로 돌려주는 이벤트의 이름·payload·발생 조건과, 그 이벤트를 받는 `src/app/flow.ts`의 반응을 정합니다.
- 이벤트 이름은 `_workspace/02_plan_decisions.md` C절 그대로입니다. `lessonDone`만 (신규)입니다(조작 익히기의 끝을 알릴 이름이 표에 없음). C절에 있던 보행자 출발·컴퓨터 차 완주 이벤트는 받는 곳이 없어 리더 결정으로 뺐습니다(필요해지면 추가). 보행자 위치와 순위는 렌더러·HUD가 state로 그립니다.
- 시그니처는 [modules.md](./modules.md), 상태 전이 표는 [data-model.md](../data-model.md) 4장.

## 1. 공통 약속

| # | 약속 |
|---|---|
| 1 | 이벤트는 `{ type: '<이름>', ...payload }` 모양의 일반 객체입니다. 이미 일어난 사실을 알리며 명령이 아닙니다. |
| 2 | 배열 순서 = 그 틱 안에서 일어난 순서입니다(5장). |
| 3 | 받는 쪽은 `app/flow.ts` 하나입니다. flow는 한 틱의 이벤트를 **모두 동기적으로 처리한 뒤** 다음 틱을 돌립니다. 저장(`commitSave`)도 동기 호출이라 그 틱 안에서 끝납니다(FR-077). |
| 4 | 순수 모듈은 입력 해제·화면·소리·저장을 직접 하지 않습니다. 이벤트를 받은 flow가 `releaseAll()`·UI·`audio`·`commitSave`를 부릅니다. |
| 5 | 이벤트가 없어도 렌더러·HUD는 state를 매 프레임 읽어 그립니다(신호 색, 보행자 위치, 순위 숫자 등). 이벤트는 "그 순간 한 번" 해야 하는 일(소리, 입력 해제, 저장, 화면 전환)을 위한 것입니다. |
| 6 | 소리 이름: 음성 줄은 `VoiceLineId`(content-data.md 3장), 효과음은 `SfxId`(modules.md 10장). 소리가 꺼졌거나 실패해도 화면 반응만으로 진행됩니다(FR-070). |

## 2. 안전 연습 이벤트 (`ScenarioEvent`, `src/practice/scenario.ts`)

```ts
type ScenarioEvent =
  | { type: 'signalChanged'; signal: SignalId; light: SignalState['light'] }
  | { type: 'hint'; cue: HintCue; repeat: boolean }
  | { type: 'redirect'; issue: 'leftPath' | 'blocked' }
  | { type: 'violation'; kind: ViolationKind }
  | { type: 'segmentReset' }
  | { type: 'demoReplay'; cue: 'stop' | 'wait' | 'go' }
  | { type: 'pedestrianViewStart'; rules: readonly RuleId[] }
  | PedestrianViewEvent                                               // 3장, 안내 중 그대로 전달
  | { type: 'scenarioCompleted'; scenario: ScenarioId };
type HintCue = 'stop' | 'wait' | 'go' | 'closer' | 'way' | 'steer' | 'accel' | 'brake' | 'reverse';
```

| 이벤트 | 발생 조건 | flow 반응: 화면 | 소리 | 입력·저장·상태 |
|---|---|---|---|---|
| `signalChanged` | 신호가 바뀐 틱(플레이어 위치·정지로만 바뀜, FR-040) | (렌더러가 state로 신호 색·모양을 바꿈) | `playSfx('signal-change')`(FR-040 "그림·소리로 분명히") | — |
| `hint` | `cue`가 `stop`/`wait`/`go`: 시작·단계가 바뀐 틱(`repeat: false`), 같은 단계에서 무입력 `IDLE_HINT_TICKS`마다(`repeat: true`). `closer`: `stoppedTooFar`. `way`: `wrongWay`. | HUD 다음 행동 그림을 `cue` 그림으로 바꾸고 **다음 `hint`·단계 변화까지 남김**(FR-031). `repeat`이면 눌러야 할 버튼 강조 시범 | `playVoice('hint-' + cue)` | 실패 아님(FR-031, FR-034) |
| `redirect` | `leftPath`(후진 등으로 구간 경로 이탈) 또는 `blocked`(건물·연석에 닿은 채 `IDLE_HINT_TICKS` 동안 진행 없음). 구간을 처음부터 다시 놓음(`failStreak` 그대로) | 짧은 화면 전환 효과 | `playVoice('route-reset')` | `releaseAll()`(FR-017 코스 복귀). 실패 아님(FR-034, FR-035) |
| `violation` | 잘못된 행동 6종 중 하나가 **후보 위치에서** 판정된 틱. 차는 선 앞에 멈춰 있음 | 화면 전체 반투명 + 멈춤 그림 + `kind` 설명 그림(차만 멈춘 것처럼 보이지 않게, FR-037) | `playSfx('gentle-stop')`, `playVoice(VIOLATION_LINES[kind])`. 충돌음·사이렌·비명·경적 없음(FR-036) | `releaseAll()`(FR-017). 저장 없음 |
| `segmentReset` | `explaining`이 `EXPLAIN_TICKS`를 채운 틱. 같은 구간을 시작 위치에서 신호·보행자부터 다시(data-model.md 4.4) | 멈춤 겹침 닫기, 전진 그림 | — | `releaseAll()`(FR-017 구간 재시도) |
| `demoReplay` | `segmentReset` 직후 같은 구간 연속 실패가 `DEMO_AFTER_FAILS`에 닿은 틱 | 그 단계의 버튼 시범 애니메이션(US2-8) | (뒤따르는 `hint`가 음성 담당) | — |
| `pedestrianViewStart` | 안내 위치 단계(`afterStep`)를 마친 틱, 같은 시도에서 처음일 때만(02 결정 B10). 차 `speed = 0` | 조작 버튼 숨김, 보행자 시점 카메라(`def.camera`), 규칙 카드 겹침 준비 | `stopVoice()` | `releaseAll()`(FR-017, US2-14) |
| `cardShown`, `ended` | 3장 | | | |
| `scenarioCompleted` | 마지막 단계 충족 ∧ `viewDone`인 틱(FR-032) | 칭찬 그림 → 아래 다음 화면 | `playSfx('success')`, `playVoice('scenario-done')`(빠르기가 아닌 안전 행동 칭찬, FR-036) | `run.completedThisRun.add(scenario)`. 이번 완료로 세 상황이 처음 다 찼고 `!run.tutorialDone`이면: `run.tutorialDone = true` → `commitSave(…, 'tutorial', …)` → 축하 겹침 + `playVoice('race-unlocked')` → `start`(FR-047, spec Assumptions). 저장이 `false`면 아직 안 보였을 때 `storageNotice` 1회, 열림·축하는 늦추지 않음(FR-080). 그 밖에는 처음 이용 흐름이면 다음 미완료 상황, 목록 흐름이면 `practiceMenu`(data-model.md 4.1) |

## 3. 보행자 시점 안내 이벤트 (`PedestrianViewEvent`, `src/pedestrianView/pedestrianView.ts`)

```ts
type PedestrianViewEvent =
  | { type: 'cardShown'; rule: RuleId; index: number }   // index = view.rules 안 순번
  | { type: 'ended'; extrasCount: number };
```

| 이벤트 | 발생 조건 | flow 반응: 화면 | 소리 | 상태 |
|---|---|---|---|---|
| `cardShown` | 카드의 첫 틱. `rewindPedestrianView` 뒤에도 그 카드에서 다시 나옴 | 규칙 그림 `images/rules/<rule>.svg` 표시(소리 없이도 뜻이 전해지는 그림, FR-070). 렌더러가 지금 카드의 `poses`(Chicken Guy 행동)·`weather`를 보여 줌(FR-092, FR-096) | `playVoice(rule)` — 진행은 기다리지 않음(02 결정 B13) | — |
| `ended` | 마지막 카드의 `durationTicks`를 채운 틱, 1회 | 카드 겹침 닫기, 운전 카메라·조작 버튼 복귀 | — | `run.extraCursor[scenario] = advanceExtraCursor(scenario, cursor, extrasCount)`(FR-091). 같은 틱에 scenario가 `scenarioCompleted` 또는 다음 단계 `hint`를 이어서 냄 |

## 4. 조작 익히기 이벤트 (`DrivingLessonEvent`, `src/practice/drivingLesson.ts`)

| 이벤트 | 발생 조건 | flow 반응 |
|---|---|---|
| `hint` (`cue`: `steer`/`accel`/`brake`/`reverse`) | 시작·단계가 바뀐 틱(`repeat: false`), 무입력 `IDLE_HINT_TICKS`마다(`repeat: true`) | 해당 버튼 강조 시범 그림, `playVoice('hint-' + cue)`(FR-027, FR-031) |
| `lessonDone` (신규) | 네 조작을 모두 직접 해 본 틱, 1회 | `run.drivingLessonDone = true`, `playVoice('lesson-done')`, 다음 상황으로(data-model.md 4.1). 레이싱 열림과 무관(FR-027) |

## 5. 레이싱 이벤트 (`RaceEvent`, `src/race/race.ts`)

```ts
type Slot = 0 | 1 | 2 | 3;
type RaceEvent =
  | { type: 'countdownTick'; secondsLeft: number }       // 3, 2, 1
  | { type: 'go' }
  | { type: 'rankChanged'; rank: 1 | 2 | 3 | 4 }         // 플레이어 순위
  | { type: 'lapCompleted'; slot: Slot; lapsDone: number }
  | { type: 'respawned'; slot: Slot }
  | { type: 'playerFinished'; timeCs: number; rank: 1 | 2 | 3 | 4 };
```

| 이벤트 | 발생 조건 | flow 반응: 화면 | 소리 | 입력·저장·상태 |
|---|---|---|---|---|
| `countdownTick` | 첫 카운트다운 틱과, `ceil(countdownTicks / TICK_HZ)`가 바뀌는 틱(초마다 1번) | HUD 큰 숫자 그림 | `playSfx('countdown')` | — |
| `go` | `countdownTicks`가 0이 된 틱(→ `running`). 경기 시간은 다음 틱부터 셈(FR-055) | HUD 출발 그림 | `playSfx('go')` | **`releaseAll()` 하지 않음**(카운트다운 중 누른 액셀이 출발 순간 반영, FR-017 단서) |
| `rankChanged` | `go` 틱에 1번, 그 뒤 플레이어 순위가 바뀐 틱(FR-056) | HUD 순위 | — | — |
| `lapCompleted` | 어느 차든 결승선을 정방향으로 넘어 바퀴가 인정된 틱(마지막 바퀴 제외, FR-059) | 플레이어 slot이면 HUD 바퀴 표시 | 플레이어면 `playSfx('lap')` | — |
| `respawned` | 끼임·이탈로 `STUCK_TICKS`를 채워 복귀한 틱(FR-061) | (렌더러가 state로 위치 표시) | — | 플레이어 slot이면 `releaseAll()`(FR-017 코스 복귀) |
| `playerFinished` | 플레이어가 마지막 바퀴 결승선을 정방향으로 넘은 틱(→ `finished`, 그 틱의 순위로 확정, FR-063) | 결과 화면 `raceResult`(순위·`formatRecord(timeCs)`·최고 기록·새 기록 표시). 마지막 순위여도 칭찬만(FR-063) | `playSfx('success')`, `playVoice('race-finish')`, 새 기록이면 이어서 `playVoice('new-best')` | `saved = loadSave(key)` → `saved.ok`가 거짓이면 아직 안 보였을 때 안내 1회(FR-080) → `result = finishResult({ timeCs, rank, runBest: run.best, storedBest: saved.data.best, trackConfigKey: key })` → `race.result = result`, `run.best = result.best` → `result.isNewBest`이면 `commitSave(…, 'best', …)`(FR-064, FR-083). 저장 실패면 안내 1회(읽기 실패 안내와 합쳐 실행당 1회), 결과 화면은 늦추지 않음(FR-080) |

## 6. 이벤트가 아닌 신호와 flow 반응

step 이벤트는 아니지만 같은 flow가 처리하며 입력 해제·일시정지 규칙(FR-017, FR-071~077)과 묶여 있어 함께 적습니다.

| 신호 | 출처 | flow 반응 |
|---|---|---|
| 후진 버튼 탭 | `mountControls`의 `onTap('reverse')` | 다음 틱에 `gearTap = true`. 지금 단계가 운전을 받는 상태(`drivingLesson`, `practice`의 `driving`, `race`의 `running`)이고 `requestGearToggle(지금 플레이어 drive).accepted === false`면 HUD "먼저 멈춰요" 그림 + `playVoice('stop-first')`(FR-018, US1-8). 요청은 기억하지 않음 |
| 일시정지 버튼 탭 | `onTap('pause')` | 플레이 화면에서만: `paused = 'user'`, `setTicking(false)`, `releaseAll()`, 보행자 시점 안내 중이면 `stopVoice()`, `pauseAudio()` |
| `hidden` | `watchLifecycle` | 플레이 화면: `paused = 'auto'`, `setTicking(false)`, `releaseAll()`, 안내 중이면 `stopVoice()`, `pauseAudio()`. 플레이 화면이 아니면 `pauseAudio()`만 |
| `visible` | 〃 | 플레이 화면: 아무것도 안 함(일시정지 유지, FR-073). 아니면 `resumeAudio()` |
| `portrait` | 〃 | `rotate = true`. 플레이 화면이면 `hidden`과 같은 자동 일시정지(FR-007, FR-073, SC-006) |
| `landscape` | 〃 | `rotate = false`. 일시정지는 유지(자동 재개 없음) |
| `layout` | 〃 | `releaseAll()`, 배치 다시 맞춤. 일시정지 안 함(02 결정 B11) |
| `blur` | 〃 | `releaseAll()` |
| 컨텍스트 손실 / 복구 | `createStage`의 `onContext(true/false)` | 손실: `contextLost = true`, 플레이 화면이면 자동 일시정지. 복구: `contextLost = false`, 일시정지 유지. 일정 시간(실제 시간) 안에 복구되지 않으면 `fatal`(새로 고침 안내, 저장 유지, FR-006) |
| 계속하기 | 일시정지 화면 버튼 | 가드: 보임 ∧ `!rotate` ∧ `!contextLost`. 보행자 시점 안내 중이면 `view = rewindPedestrianView(view, paused === 'user' ? 'card' : 'intro')`. `paused = null`, `setTicking(true)`(기준 시각 초기화, FR-074), `resumeAudio()`(배경음 이어서, 끊긴 안내 음성은 처음부터, FR-076) |
| 시작 화면으로 → 확인 | 일시정지 화면 → `confirmExit` | 시도·경기 버림(완료 표시·최고 기록 반영 없음, FR-075) → `start` |
| 소리 설정 변경 | 시작 화면·일시정지 화면 | `run.sound` 갱신 → `applySoundSettings(run.sound)` → `commitSave(…, 'sound', …)`(FR-069) |
| 사용자 동작(click·pointerdown) | 시작 버튼 이후 모든 동작 | `run.audioUnlocked`가 거짓이면 `unlockAudio()`를 다시 부르고 결과를 저장(FR-066) |
| 잠긴 레이싱 버튼 | 시작 화면, `!run.tutorialDone` | 레이싱으로 들어가지 않고 잠김 그림 안내. `run.audioUnlocked`면 `playVoice('race-locked')`도. 시작 버튼 전(소리 활성화 전)이면 **그림만**(FR-066 우선, FR-048) — 사용자 결정 2026-10-12 |

## 7. 같은 틱 안 순서

### 7.1 `stepScenario` (`phase === 'driving'`)

1. `gearTap`이면 `requestGearToggle`.
2. 후보 = `stepVehicle(drive, input)` → `blockByAreas`(건물).
3. 신호·보행자 진행 → `signalChanged`*.
4. 후보에서 잘못된 행동 판정 → 있으면 `violation` 1개를 내고 **여기서 끝**(후보 버림, `phase = 'explaining'`).
5. 후보 적용. 경로 문제 → `hint`(`closer`/`way`) 또는 `redirect`(구간 다시 놓고 여기서 끝).
6. 단계 판정 → 다음 단계면 `hint`(`repeat: false`), 안내 위치면 `pedestrianViewStart`(→ `pedestrianView`), 마지막이고 `viewDone`이면 `scenarioCompleted`(→ `done`).
7. 무입력 `IDLE_HINT_TICKS` → `hint`(`repeat: true`).

`phase === 'explaining'`: 틱만 셈 → 다 차면 `segmentReset` → (연속 실패 도달 시) `demoReplay` → `hint`(첫 단계).
`phase === 'pedestrianView'`: `cardShown` 또는 `ended` → (`ended`면) `scenarioCompleted` 또는 `hint`(남은 단계).

### 7.2 `stepRace` (`phase === 'running'`)

1. `raceTicks + 1`.
2. 입력: 플레이어 `input`, 컴퓨터 차량 `aiInput`(틱 시작 스냅숏).
3. 네 대 `stepVehicle` → `blockByTrackWalls` → `separateCars`(닿은 차 `contactSlow`).
4. slot 순서로 체크포인트 판정 → `lapCompleted`*.
5. 끼임·이탈 복귀 → `respawned`*(완주한 차는 대상 아님).
6. 완주 기록(`finish = { tick, overshoot }`)을 정하고 순위 다시 계산 → 플레이어 순위가 바뀌었으면 `rankChanged`.
7. 플레이어가 완주했으면 **마지막에** `playerFinished`(→ `finished`).

`phase === 'countdown'`: `countdownTick`(초가 바뀔 때) → 0이 되면 `go`(+ 첫 `rankChanged`).

## 8. 일시정지와 겹칠 때 (FR-077)

| 경우 | 결과 |
|---|---|
| 같은 프레임에 틱 k에서 `playerFinished`·`lapCompleted`·`scenarioCompleted`가 나고, 일시정지 버튼이 눌림 | JS는 단일 스레드라 일시정지 처리는 그 프레임의 틱·이벤트 처리가 모두 끝난 뒤에 실행됩니다. 이미 난 사건은 취소되지 않고 결과 표시·저장까지 끝납니다. 이후 화면은 결과·축하이므로 일시정지 대상이 아닙니다(data-model.md 4.13). |
| 틱 k에서 끝난(`finished`·`done`) 뒤 같은 프레임의 남은 틱 | step이 no-op이라 결과가 바뀌지 않습니다(modules.md). flow도 플레이 화면이 아니면 step을 부르지 않습니다. |
| 경기 시간 | 일시정지 요청 뒤에는 틱이 돌지 않으므로 `raceTicks`는 요청 시점(1틱 이내)에서 멈춥니다. 남은 누적 시간은 버립니다. |
| `violation`과 같은 프레임의 일시정지 | 둘 다 멈춤. 재개하면 설명 단계가 남은 틱부터 이어지고, 설명 음성은 `resumeAudio()`가 처음부터 다시 틉니다(data-model.md 4.13-5). |
| 보행자 시점 안내 중 일시정지 | 일시정지 때 `stopVoice()`, 재개 때 사용자 일시정지면 지금 카드를, 자동 일시정지면 카메라 이동부터 다시(`rewindPedestrianView`). 다시 나오는 `cardShown`이 그림·음성을 처음부터 틉니다(FR-041, FR-076). 순환 위치는 `ended` 때만 움직이므로 되감기로 규칙을 건너뛰지 않습니다(FR-091). |
| 세 번째 완료와 저장 실패 | 메모리에서 먼저 열고(`tutorialDone = true`) 저장을 시도합니다. 실패는 안내 1회뿐, 축하·열림을 늦추지 않습니다(FR-080). |
| 카운트다운 중 일시정지 | 카운트다운 틱도 멈춥니다(FR-071). 재개 뒤 남은 카운트다운부터. |
