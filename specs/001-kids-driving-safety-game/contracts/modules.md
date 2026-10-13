# 모듈 인터페이스 계약

- 기준: `_workspace/02_plan_decisions.md` C절 이름표, [data-model.md](../data-model.md)(필드 상세), [plan.md](../plan.md)(파일 구조). 공통 규칙은 [overview.md](./overview.md).
- 이 문서는 **함수 시그니처, 소속 파일, 전제·보장(불변식), 오류 동작**만 정합니다. 타입의 필드는 data-model.md를 따르며 여기서는 `/* data-model.md … */`로 가리킵니다.
- TypeScript 선언 모양(본문 없음)입니다. `(신규)` 표시는 02 결정 C 표에 없어 이 문서에서 처음 정한 이름입니다(리더 확인 항목, `_workspace/01_contract-designer_api.md`).
- 이벤트 타입(`ScenarioEvent` 등)의 각 항목·발생 조건·순서는 [events.md](./events.md)가 정합니다.

---

## 1. `src/core/loop.ts` — 고정 시간 간격 루프

```ts
export const TICK_HZ = 60;
export const MAX_TICKS_PER_FRAME = 8;

/** (신규) 순수 함수. 프레임 간격을 이번에 돌릴 틱 수로 바꾼다. */
export function ticksForFrame(accSec: number, frameSec: number): { ticks: number; accSec: number };

/** requestAnimationFrame 루프 시작. 프레임마다 tick()을 `ticks`번, 그다음 draw()를 1번 부른다. */
export function startLoop(tick: () => void, draw: () => void): void;

/** (신규) false면 틱을 돌리지 않는다(draw는 계속). true로 바뀌는 순간 기준 시각을 지금으로, 누적을 0으로. */
export function setTicking(on: boolean): void;
```

| 항목 | 약속 |
|---|---|
| 보장 | `frameSec`은 0.25초로 자릅니다. `ticks ≤ MAX_TICKS_PER_FRAME`. 상한에 걸리면 남은 누적 시간을 버립니다(7.5 fps 미만 기기에서 게임 시간이 느려짐, 02 결정 B7). |
| 보장 | 틱마다 입력을 그 시점의 눌림 상태로 읽으므로, 같은 틱별 입력이면 프레임 간격(8.3/16.7/33.3 ms·불규칙)과 무관하게 결과가 같습니다(FR-022, SC-002). |
| 보장 | `setTicking(false)` 동안 흐른 시간은 어디에도 더해지지 않습니다(FR-074, SC-007). 시간은 `performance.now()`로만 잽니다(기기 시계 변경 무관). |
| 전제 | 순수 모듈이 `TICK_HZ`를 import하므로 이 파일은 모듈 최상위에서 `window`·`performance`·`requestAnimationFrame`을 건드리지 않습니다. |
| 오류 | 없음. `tick()` 안의 예외는 잡지 않습니다(프로그램 오류). |

## 2. `src/input/controls.ts` — 조작 버튼

```ts
export type ControlButton = 'left' | 'right' | 'accel' | 'brake' | 'reverse' | 'pause';
export type HoldButton = 'left' | 'right' | 'accel' | 'brake';          // (신규) 누르고 있는 버튼
export type ScreenPoint = { x: number; y: number };                     // (신규) CSS px
export type ScreenRect = { left: number; top: number; right: number; bottom: number }; // (신규)

// 순수 함수 (Vitest 대상)
export function pressedButtons(
  points: Iterable<ScreenPoint>,
  rects: Readonly<Record<HoldButton, ScreenRect>>,
): ReadonlySet<HoldButton>;
export function toDriveInput(pressed: ReadonlySet<HoldButton>): DriveInput;

// DOM 쪽 (조작 층 하나, 모듈 안 상태)
export function mountControls(layer: HTMLElement, onTap: (button: 'reverse' | 'pause') => void): void; // (신규)
export function readDriveInput(): DriveInput;                                                          // (신규)
export function releaseAll(): void;
```

| 항목 | 약속 |
|---|---|
| `pressedButtons` | 버튼 사각형 안(경계 포함)에 점이 하나라도 있으면 눌림. 버튼 밖 점은 무시. 점이 몇 개든 같은 규칙(손바닥·보호자 손가락, Edge "터치 조작"). |
| `toDriveInput` | `steer = (left ? 1 : 0) − (right ? 1 : 0)`(+1 = 왼쪽, 좌우 동시 = 0 직진), `brake = brake`, `throttle = accel ∧ ¬brake`(브레이크 우선). FR-015, SC-004. |
| `mountControls` | `layer` 하나에 `pointerdown/move/up/cancel`을 달고 손가락(`pointerId`)마다 좌표를 기록합니다. 이벤트 대상이 아니라 **좌표**로 판정합니다(터치는 처음 누른 요소에 포인터가 잡히므로, FR-016). 버튼 사각형은 붙일 때와 `resize` 때 다시 잽니다. `reverse`·`pause`는 그 사각형 안 `pointerdown` 순간 1회 `onTap`. 키보드(FR-098): `window`의 `keydown`/`keyup`을 `e.code`로 받아 `ArrowLeft`·`KeyA` = left, `ArrowRight`·`KeyD` = right, `ArrowUp`·`KeyW` = accel, `ArrowDown`·`KeyS` = brake를 키 집합에 넣고 빼며, `KeyR`은 `keydown` 순간 `onTap('reverse')`. `layer.hidden`이거나 Ctrl·Cmd·Alt와 함께 누른 키(`e.ctrlKey`·`e.metaKey`·`e.altKey`)면 `keydown`을 무시하고(브라우저 단축키로 둠, 예: Ctrl+R 새로 고침), `e.repeat`인 `keydown`은 새로 누름으로 보지 않습니다. |
| `readDriveInput` | 지금 좌표 표 → `pressedButtons`에 키 집합을 합침 → `toDriveInput`. 틱마다 flow가 부릅니다. |
| `releaseAll` | 좌표 표와 키 집합을 비우고, 그 순간 닿아 있던 손가락은 뗄 때(`pointerup`/`pointercancel`)까지, 누르고 있던 키는 뗐다가 다시 누를 때까지 무시합니다 → "새로 눌러야 반영"(FR-017, SC-003). `pointercancel`이 온 손가락은 즉시 제거(FR-016). |
| 부르는 시점 | flow가 부름: 일시정지, 숨김, `blur`, 회전·크기 변화(가로 180° 포함), `pedestrianViewStart`, `segmentReset`, `redirect`, 플레이어 `respawned`, 경기 화면 진입, `violation`. **카운트다운이 끝나는 `go`에서는 부르지 않습니다**(카운트다운 중 새로 누른 액셀이 출발 순간 반영, FR-017 단서). |
| 오류 | 없음. `mountControls` 두 번 호출은 프로그램 오류. |

## 3. `src/sim/` — 주행·충돌

### 3.1 `src/sim/vehicle.ts`

```ts
export type Vec2 = /* data-model.md 0장 */;
export type Vec3 = /* data-model.md 0장 */;
export type Pose = /* data-model.md 0장 */;
export type Gear = 'forward' | 'reverse';
export type DriveInput = { steer: number; throttle: boolean; brake: boolean }; // data-model.md 2.2
export type DriveState = /* data-model.md 2.2: x, z, heading, speed(≥0), gear */;
export type DrivingSpec = /* data-model.md 2.1 */;
export const DRIVING_SPEC: DrivingSpec;

/** 1틱(1/TICK_HZ초) 진행. 차량 종류·성능 매개변수가 없다. */
export function stepVehicle(state: DriveState, input: DriveInput): DriveState;

/** speed === 0일 때만 gear를 뒤집는다. 거절된 요청은 기억하지 않는다. */
export function requestGearToggle(state: DriveState): { state: DriveState; accepted: boolean };

/** (신규) 전진·정지 상태로 그 자세에 세운다(구간 재시도·복귀·경기 시작 공용). */
export function restingAt(pose: Pose): DriveState;
```

| 항목 | 약속 |
|---|---|
| FR-011 보장 | `stepVehicle`·`requestGearToggle`의 매개변수에 `VehicleKindId`·`DrivingSpec`이 없고 `DRIVING_SPEC` 하나만 씁니다. 그래서 차종·컴퓨터 차량 사이 성능 차이가 구조상 생길 수 없습니다(FR-011, FR-054, SC-001, SC-002). |
| 결정성 | 무작위·시각·전역 가변 상태를 쓰지 않습니다. 같은 `(state, input)`이면 결과가 비트 단위로 같습니다(FR-022, SC-002). |
| 입력 방어 | `brake`와 `throttle`이 함께 참이면 브레이크로 처리, `steer`는 [−1, 1]로 자릅니다(컴퓨터 차량 입력도 같은 규칙). |
| 정지 | 액셀이 없고 속도가 `stopSnapSpeed` 아래면 `speed = 0`으로 맞춥니다. 멈춤 = `speed === 0`(자연 감속으로 선 것도 포함, 02 결정 B4). 속도는 0 이상, 방향 한도(`maxForwardSpeed`/`maxReverseSpeed`) 이하. |
| 후진 | `requestGearToggle`: `accepted === (state.speed === 0)`. 거절 시 state 그대로(FR-018, SC-004). 연타해도 누를 때마다 바뀝니다. |
| `restingAt` | `{ ...pose, speed: 0, gear: 'forward' }`(FR-019). |
| 충돌 | 하지 않습니다(3.2). |
| 오류 | 던지지 않습니다. |

### 3.2 `src/sim/collision.ts`

```ts
/** 마을 건물 구역(Rect)에 차체 원이 들어가면 막고 감속한다. */
export function blockByAreas(prev: DriveState, next: DriveState, blockers: readonly Rect[]): { state: DriveState; hit: boolean };
/** (신규) 차체 원(bodyRadius)과 사각형이 겹치는지. 보도 진입 판정(scenario.ts)에서도 씁니다. */
export function overlaps(s: DriveState, r: Rect): boolean;
/** 트랙 중심선에서 폭 밖으로 나가는 이동을 벽에서 막고 감속한다. */
export function blockByTrackWalls(prev: DriveState, next: DriveState, track: TrackDef): { state: DriveState; hit: boolean };
/** 차체 원끼리 겹친 만큼 떼어 놓고, 닿은 차를 표시한다. */
export function separateCars(states: readonly DriveState[]): { states: DriveState[]; touching: readonly boolean[] };
/** (신규) 트랙 닫힌 중심선 계산(벽·진행도·컴퓨터 차량·트랙 그리기 공용). arc = 중심선 시작점부터 거리(m) */
export function trackLength(track: TrackDef): number;
export function pointOnTrack(track: TrackDef, arc: number): { p: Vec2; t: Vec2 };            // 꼭짓점에서는 다음 선분 방향
export function projectOnTrack(track: TrackDef, p: Vec2, from?: number, to?: number): { arc: number; p: Vec2; t: Vec2; dist: number }; // [from, to]로 제한 가능
```

| 항목 | 약속 |
|---|---|
| 판정 크기 | 차체 원 반지름은 `DRIVING_SPEC.bodyRadius` 하나뿐. 모델 크기·탑승객은 들어오지 않습니다(FR-011). |
| 표현 | 튕김·회전·뒤집힘 없음. 막히면 위치를 경계 앞에 두고 속도만 줄입니다(FR-035, FR-060). `separateCars`는 `heading`을 바꾸지 않고, 감속(`contactSlow`)은 race가 `touching`을 보고 적용합니다. |
| 트랙 벽 | 중심선에서 `width/2 − bodyRadius`를 넘는 자리는 그 거리로 당겨 벽 앞에 두고, 속도는 벽을 따라가는 성분만 남깁니다(`speed` × 진행 방향과 벽 방향 내적의 절댓값, 정면이면 멈춤). 겹친 차는 둘이 반씩 떨어집니다(같은 자리면 +X 쪽). |
| 결정성 | 입력 배열 순서대로 처리하며 같은 입력이면 같은 결과. |
| 이름 | 세 함수 이름은 (신규). |

## 4. `src/practice/` — 조작 익히기·안전 연습

### 4.1 `src/practice/ruleRotation.ts`

```ts
export const EXTRAS_PER_VIEW: number;
export function isReplay(scenario: ScenarioId, run: Pick<RunState, 'completedThisRun' | 'tutorialDone'>): boolean;
export function pickRules(scenario: ScenarioId, replay: boolean, cursor: number): { rules: readonly RuleId[]; extrasCount: number };
/** (신규) 안내를 끝까지 본 뒤의 다음 순환 위치. */
export function advanceExtraCursor(scenario: ScenarioId, cursor: number, extrasCount: number): number;
```

| 항목 | 약속 |
|---|---|
| `isReplay` | `run.completedThisRun.has(scenario) ∨ run.tutorialDone`(02 결정 A3, FR-091). |
| `pickRules` | 그 상황의 핵심 규칙 전부(배열 순서) + `replay`이면 추가 규칙을 `cursor`부터 `k = min(EXTRAS_PER_VIEW, 추가 수)`개(끝에 닿으면 처음으로). 한 안내 안에 같은 규칙이 두 번 나오지 않습니다. `replay`가 거짓이면 `extrasCount = 0`. (SC-031) |
| `advanceExtraCursor` | `(cursor + extrasCount) % 추가 수`(추가 수가 0이면 0). flow가 `ended` 때만 부릅니다(중간에 나가면 이동 없음, data-model.md 8장). |
| 의존 | `SAFETY_RULES`를 직접 읽습니다. `RunState`는 `import type`. |

### 4.2 `src/practice/townActors.ts` — 신호·등장 보행자 (scenario.ts 내부용, 시험용으로 내보냄)

```ts
export type SignalState = /* data-model.md 2.2 */;
export type TownPedestrian = /* data-model.md 2.2 */;
export function initActors(segment: SegmentDef): { signals: SignalState[]; pedestrians: TownPedestrian[] }; // (신규)
export function stepTownActors(a: {                                                                         // (신규)
  segment: SegmentDef; signals: readonly SignalState[]; pedestrians: readonly TownPedestrian[];
  frontS: number; stoppedTicks: number; drive: DriveState;
}): { signals: SignalState[]; pedestrians: TownPedestrian[]; events: ScenarioEvent[] };
```

| 항목 | 약속 |
|---|---|
| 시그니처 | 확정(T043). `ActorPlan`에 `pedestrianSignal`을 더했습니다(data-model.md 2.1, Open Issues 1 해결). |
| `stoppedTicks` | stop 단계를 마친(stopZone에서 멈춘) 뒤 지난 운전 틱. 한 구간 시도 안에서 줄지 않아야 합니다(줄면 진행 신호 뒤 차 신호가 다시 노랑이 됨). scenario.ts가 `ScenarioAttempt.stoppedTicks`로 넘깁니다. |
| FR-040 | 신호 변화는 주기가 아니라 플레이어 상태(`frontS`, `stoppedTicks`)로만 일어납니다. 멈출지 지나갈지 애매한 순간이 없습니다. |
| FR-039, FR-036 | 보행자는 플레이어가 멈췄거나(`speed === 0`) 멈출 수 있는 거리(최고 속도 제동 거리 + 여유)일 때만 `crossing`을 시작합니다. |
| FR-042 | 같은 횡단보도를 직진으로 지나는 차량 신호 초록과 보행자 신호 초록은 동시에 켜지지 않습니다. |
| FR-094 | 보행자 행동은 `CharacterPose`(`idle`, `walk`, `lookLeft`, `lookRight`, `raiseHand`)뿐이라 뛰기·뛰어들기를 만들 수 없습니다. 보행자는 언제나 Chicken Guy(인물 필드 없음). |
| 이벤트 | `signalChanged`(events.md). 보행자 출발은 이벤트 없이 state(`TownPedestrian.state`)로 렌더러가 그립니다. |

### 4.3 `src/practice/drivingLesson.ts` — 조작 익히기

```ts
export type DrivingLessonState = {               // data-model.md 2.2 + drive
  step: 'steer' | 'accel' | 'brake' | 'reverse';
  idleTicks: number;
  drive: DriveState;                             // (신규 필드) 연습 차. 시작 = restingAt(SCENARIOS[0].segments[0].start)
};
export type DrivingLessonEvent =
  | Extract<ScenarioEvent, { type: 'hint' }>      // cue: 'steer' | 'accel' | 'brake' | 'reverse'
  | { type: 'lessonDone' };                       // (신규)
export function startDrivingLesson(): { state: DrivingLessonState; events: DrivingLessonEvent[] };          // (신규)
export function stepDrivingLesson(state: DrivingLessonState, input: DriveInput, gearTap: boolean): { state: DrivingLessonState; events: DrivingLessonEvent[] };
```

| 항목 | 약속 |
|---|---|
| 순서 | `steer → accel → brake → reverse` 고정. 각 단계는 그 조작을 직접 했을 때만 넘어갑니다: 조향 `input.steer ≠ 0`, 액셀 `speed > 0`, 브레이크 움직이던 차가 브레이크로 `speed === 0`, 후진 `requestGearToggle` 수락(FR-027). |
| 안내 | 시작과 단계가 바뀔 때 `hint`(repeat: false), 무입력이 `IDLE_HINT_TICKS`마다 `hint`(repeat: true). 실패·시간제한 없음(FR-031, FR-038). |
| 끝 | 마지막 단계를 마친 틱에 `lessonDone` 1회. 그 뒤 step은 no-op. flow가 `RunState.drivingLessonDone = true`. 레이싱 열림과 무관(FR-027). |
| 후진 탭 | 후진 단계 전에는 `gearTap`을 받지 않습니다(멈춰 있어도 기어 그대로, 요청을 기억하지 않음). 움직이는 중 탭이면 어느 단계든 flow가 "먼저 멈춰요"를 보입니다(events.md 6장). 조작 익히기에서는 data-model.md 4.6 일반 전이보다 이 약속이 우선합니다. |

### 4.4 `src/practice/scenario.ts` — 안전 상황

```ts
export const IDLE_HINT_TICKS: number;
export const DEMO_AFTER_FAILS: number;
export const EXPLAIN_TICKS: number;
export type HintCue = 'stop' | 'wait' | 'go' | 'closer' | 'way' | 'steer' | 'accel' | 'brake' | 'reverse'; // (신규)
export type ScenarioAttempt = /* data-model.md 2.2 */ & {
  picked: { rules: readonly RuleId[]; extrasCount: number };  // (신규 필드) 시작 때 pickRules 결과
};
export type ScenarioEvent = /* events.md 2장 */;

export function startScenario(                                // (신규)
  scenario: ScenarioId,
  picked: { rules: readonly RuleId[]; extrasCount: number },  // = pickRules(scenario, isReplay(scenario, run), run.extraCursor[scenario])
): { state: ScenarioAttempt; events: ScenarioEvent[] };
export function stepScenario(state: ScenarioAttempt, input: DriveInput, gearTap: boolean): { state: ScenarioAttempt; events: ScenarioEvent[] };
```

| 항목 | 약속 |
|---|---|
| 완료 | `phase`가 `done`이 되는 것은 "모든 구간의 모든 `SafetyActionStep` 충족 ∧ `viewDone`"일 때뿐입니다. 끝 지점 도착·시간 경과·무입력·한 버튼만 계속 누르기로는 완료되지 않습니다(FR-032, SC-008). |
| 위험 직전 멈춤 | 틱마다 `stepVehicle` 결과를 **후보**로 만들고, 후보에서 잘못된 행동이 판정되면 후보를 버립니다(차는 이전 자리, `speed = 0`, `phase = 'explaining'`). 그래서 차체가 정지선·횡단보도·보도 안으로 실제로 들어가는 틱이 없습니다(FR-033, FR-036, FR-037). 정지선·횡단보도 판정점은 차체 앞쪽 두 모서리(`DRIVING_SPEC.bodyLength`, `bodyRadius` 기준)이며 회전 중에도 같은 규칙입니다. 한 틱에 여럿이면 data-model.md 2.1 `ViolationKind` 표의 위쪽 하나만. |
| `explaining` | `EXPLAIN_TICKS` 동안 차·신호·보행자가 움직이지 않고 입력·`gearTap`을 무시합니다. 끝나면 data-model.md 4.4대로 같은 구간 처음부터(`failStreak + 1`). |
| 경로 문제 | 실패가 아닙니다: `stoppedTooFar` → `hint`(cue `closer`), `wrongWay` → `hint`(cue `way`), `leftPath` → `redirect`, `blocked`(건물·연석에 닿은 채 `IDLE_HINT_TICKS` 동안 경로 진행 없음) → `redirect`. `redirect`는 구간을 처음부터 다시 놓되 `failStreak`를 올리지 않습니다(FR-034, FR-035). 메모: `blocked` 판정 시간에 `IDLE_HINT_TICKS`(무입력 재안내 간격)를 재사용합니다 — 의미가 다른 두 값을 한 상수로 묶은 것이며, 플레이 점검에서 따로 조정할 필요가 생기면 분리합니다. |
| `pedestrianView` | 시작 틱에 `drive.speed = 0`(gear 유지), 그 뒤 입력·`gearTap` 무시(FR-041, US2-14). 같은 시도 안에서는 한 번만(`viewDone`, 02 결정 B10). 주인공은 언제나 Chicken Guy. |
| 후진 | `gearTap`은 `phase === 'driving'`일 때만 `requestGearToggle`로 처리합니다. |
| 재시도 상태 | 구간 재시도·`redirect` 뒤 차는 `restingAt(segment.start)`(FR-019). |
| 끝난 뒤 | `phase === 'done'`이면 같은 state·빈 이벤트(같은 프레임의 남은 틱이 결과를 바꾸지 않음). |
| 의존 | `SCENARIOS`, `TOWN`, `SAFETY_RULES`, `DRIVING_SPEC`을 직접 읽습니다(시험도 실제 콘텐츠 데이터로). |
| 오류 | 던지지 않습니다. |

## 5. `src/pedestrianView/pedestrianView.ts` — 보행자 시점 안내

```ts
export type PedestrianViewState = /* data-model.md 2.2: rules, extrasCount, card(-1 = 카메라 이동), cardTicks */;
export type PedestrianViewEvent = /* events.md 3장: cardShown, ended */;
export function startPedestrianView(picked: { rules: readonly RuleId[]; extrasCount: number }): PedestrianViewState; // (신규)
export function stepPedestrianView(state: PedestrianViewState, def: PedestrianViewDef): { state: PedestrianViewState; events: PedestrianViewEvent[] };
/** (신규) 'card' = 지금 카드를 0틱부터, 'intro' = 카메라 이동부터 같은 rules로. */
export function rewindPedestrianView(state: PedestrianViewState, to: 'card' | 'intro'): PedestrianViewState;
```

| 항목 | 약속 |
|---|---|
| FR-041 | `stepPedestrianView`에 운전 입력 매개변수가 없고, 건너뛰는 함수가 없습니다 → 안내 중 운전 입력 반영 0, 건너뛰기 0. |
| FR-070, B13 | 진행은 `def.introTicks`와 규칙의 `durationTicks`(틱)로만 합니다. 음성 재생·완료와 무관합니다(SC-021). |
| 이벤트 | 카드의 첫 틱(`cardTicks`가 0인 틱)에 `cardShown`, 마지막 카드가 끝나는 틱에 `ended` 1회. `rewindPedestrianView` 뒤에는 그 카드의 `cardShown`이 다시 나옵니다. |
| 되감기 | 사용자 일시정지 → 재개 때 `'card'`, 자동 일시정지(숨김·세로·컨텍스트 손실) → 재개 때 `'intro'`(FR-041, FR-076, data-model.md 4.5). flow가 `{ ...attempt, view: rewindPedestrianView(attempt.view, to) }`로 바꿉니다. |
| 주인공 | 인물 매개변수가 없습니다. 주인공은 Chicken Guy 고정(02 결정 A1). 자세·날씨는 지금 카드 규칙의 `poses`·`weather`에서 렌더러가 읽습니다. |

## 6. `src/race/` — 레이싱

### 6.1 `src/race/race.ts`

```ts
export const COUNTDOWN_TICKS: number;
export const CONTACT_SLOW_TICKS: number;
export type RaceState = /* data-model.md 2.2 */;
export type FinishResult = { timeCs: number; rank: number; isNewBest: boolean; best: BestRecord | null }; // data-model.md 7장
export type RaceEvent = /* events.md 4장 */;

export function trackConfigKey(track: TrackDef): string;                 // `${id}:${revision}:${laps}`
export function createRace(playerVehicle: VehicleKindId): RaceState;      // (신규)
export function stepRace(state: RaceState, input: DriveInput, gearTap: boolean): { state: RaceState; events: RaceEvent[] };
/** (신규) 완주 결과 계산. flow가 playerFinished 때 최신 저장 값을 읽어 넘긴다. */
export function finishResult(p: {
  timeCs: number; rank: number; runBest: BestRecord | null; storedBest: BestRecord | null; trackConfigKey: string;
}): FinishResult;
export function formatRecord(timeCs: number): string;                    // m:ss.cc, 1시간 이상 h:mm:ss.cc
```

| 항목 | 약속 |
|---|---|
| `createRace` | 4대 모두 `restingAt(TRACK.grid[slot])`, 플레이어는 `TRACK.playerSlot`, 컴퓨터 차량 외형은 `VEHICLES` 순서에서 플레이어 차를 뺀 앞 3종, `phase = 'countdown'`, `countdownTicks = COUNTDOWN_TICKS`, `raceTicks = 0`, `result = null`. 재도전은 새로 만듭니다 → 이전 위치·바퀴·순위·시간·후진 상태가 남지 않음(FR-065). |
| `countdown` | 어떤 차도 움직이지 않고 `gearTap`은 무시(FR-019 "경기 시작 때 전진·정지"). 부정 출발 벌칙 없음. `countdownTicks`가 0이 되는 틱에 `phase = 'running'`(FR-055). 자리값 `COUNTDOWN_TICKS = 3 × TICK_HZ`(T118). |
| 접촉 감속 | `touching`인 미완주 차는 `contactSlow`, `slowTicks = CONTACT_SLOW_TICKS`(자리값 30, T118). 그동안 그 차의 액셀 입력이 듣지 않아 자연 감속(`coastDeceleration`)으로 줄어듦 — 성능 한도·`stepVehicle`은 그대로, 모든 차 같은 규칙(FR-054, FR-060). 완주한 차는 계속 달리며 떼어 놓기만 함 |
| `running` | 틱마다 `raceTicks + 1`(출발 신호부터 셈). 네 대 모두 같은 `stepVehicle`(플레이어 입력은 `input`, 컴퓨터 차량은 `aiInput`). 시간 경과로 끝나지 않습니다(FR-062, SC-012). |
| 바퀴·순위 | data-model.md 4.8의 "다음 차례 체크포인트만 정방향 인정" 규칙(FR-059, SC-013), 7장 순위·동점 규칙(FR-057). |
| 끼임·이탈 | `stuckTicks ≥ STUCK_TICKS`이면 복귀 자세로(진행도 오르지 않음, 겹치지 않는 칸), 컴퓨터 차량도 같은 규칙(FR-061, SC-014). |
| 완주 | 플레이어가 마지막 바퀴 결승선을 정방향으로 넘는 틱에 `phase = 'finished'`, 그 틱 정렬로 순위 확정, `timeCs = Math.round(raceTicks × 100 / TICK_HZ)` 1회 변환(02 결정 B3). 이후 step은 no-op. |
| `RaceState.result` | step은 채우지 않습니다. 최신 저장 값이 필요해 순수 함수 밖이므로 flow가 `finishResult(...)` 결과를 넣습니다(data-model.md 7장 계산과 같음). |
| `finishResult` | `기존 = 더 짧은 쪽(runBest, storedBest)`, `isNewBest = timeCs ≤ MAX_RECORD_CS ∧ (기존 === null ∨ timeCs < 기존.timeCs)`(엄격히 짧을 때만), `best = isNewBest ? { trackConfigKey, timeCs } : 기존`(FR-064, SC-015). |
| `formatRecord` | 정수 `timeCs`만 받아 1/100초까지 그대로 표시(반올림 없음 → "같은 숫자인데 새 기록" 없음). 1시간 미만 `m:ss.cc`, 이상 `h:mm:ss.cc`(FR-062, FR-064). |

### 6.2 `src/race/progress.ts`

```ts
export const STUCK_TICKS: number;
export type RaceCar = /* data-model.md 2.2 */;
export function progressValue(car: RaceCar): number;                     // data-model.md 7장 식
export function rankCars(cars: readonly RaceCar[]): readonly (0 | 1 | 2 | 3)[]; // 1위부터 slot 목록
```

- 진행도는 마지막 정상 통과 체크포인트의 다음 구간 끝을 넘지 못합니다 → 가로지르기·복귀로 늘지 않음(FR-059, FR-061).
- 체크포인트 통과(`crossedNext`)·복귀 자세(`respawnPose`) 계산은 race.ts만 쓰는 내부 함수입니다(내보내지만 계약 밖, 시험은 `stepRace`로). 통과선은 체크포인트 지점에서 중심선에 수직인 트랙 폭 선분, 정방향 = 그 지점 진행 방향 성분이 음수 → 0 이상.
- `STUCK_TICKS` 자리값 300(5초, T118). `Slot = 0 | 1 | 2 | 3`도 여기서 내보냅니다.

### 6.3 `src/race/ai.ts`

```ts
/** (신규) 컴퓨터 차량 한 대의 이번 틱 입력. */
export function aiInput(car: RaceCar, cars: readonly RaceCar[], raceTicks: number): DriveInput;
```

- 돌려주는 것은 `DriveInput`뿐입니다. 성능 한도를 바꿀 길이 없고, 난이도는 `car.ai`(`AiProfile`)의 주행선(`laneOffset`)·목표 속도 비율(`targetSpeedRatio`)·반응 지연(`reactionTicks`)으로만 정합니다. 목표 속도 비율은 "액셀을 언제 떼는지"라는 주행 방식이며 `DRIVING_SPEC` 한도는 같으므로 FR-054에 맞습니다(리더 결정 B17).
- 모든 차가 틱 시작 시점의 같은 `cars` 스냅숏을 보고 입력을 만듭니다(처리 순서와 무관). 무작위 없음.
- 앞이 막히면 옆 주행선으로 비키고, 그래도 막히면 복귀 규칙을 따릅니다(FR-060, FR-061). 막힘 = 앞 8 m 안의 차가 내 주행선에서 `2 × bodyRadius` 안. 그때는 `[−width/3, 0, width/3]` 중 막은 차들에서 가장 먼 주행선.
- 주행: 중심선 위 8 m 앞 점(주행선만큼 옆)을 향해 핸들, `speed < targetSpeedRatio × maxForwardSpeed`일 때만 액셀, 브레이크는 쓰지 않음.
- `reactionTicks`: `aiInput`이 상태를 갖지 않으므로(위 시그니처) "출발 신호에 반응하는 지연"으로 씁니다 — `raceTicks < reactionTicks`이면 액셀을 누르지 않음(구현 판단, US4 검토 때 확인).

## 7. `src/storage/save.ts` — 저장

```ts
export const MAX_RECORD_CS = 35_999_999;
export type SoundSettings = /* data-model.md 5.1 */;
export type BestRecord = /* data-model.md 5.1 */;
export type SaveDataV1 = /* data-model.md 5.1 */;
export function parseSave(raw: string | null, trackConfigKey: string): { tutorialDone: boolean; best: BestRecord | null; sound: SoundSettings | null };
export function loadSave(trackConfigKey: string): { data: SaveDataV1; ok: boolean };
export function commitSave(current: Omit<SaveDataV1, 'v'>, changed: 'tutorial' | 'best' | 'sound', trackConfigKey: string): boolean;
```

상세(검사·합치기·실패·시점)는 [storage.md](./storage.md). 세 함수 모두 **던지지 않습니다**.

## 8. `src/app/` — 실행 상태·로딩·화면 흐름

### 8.1 `src/app/session.ts`

```ts
export type RunState = /* data-model.md 2.2 */;
/** (신규) loadSave 결과로 실행 상태를 만든다. */
export function createRunState(saved: SaveDataV1): RunState;
```

- `tutorialDone`·`best`·`sound`는 저장 값(검사 통과분), 나머지는 data-model.md의 시작값. `RunState`를 바꾸는 것은 `app/flow.ts`뿐입니다(overview 공통 규칙 10).

### 8.2 `src/app/loader.ts`

```ts
export type AssetId = `models/${string}.glb` | `images/${string}.svg` | `audio/${string}.mp3`; // assets.md
export const ASSET_URLS: Readonly<Partial<Record<AssetId, string>>>;                            // (신규) import.meta.glob 결과
export type LoadResult =                                                                          // (신규)
  | { ok: true; files: ReadonlyMap<AssetId, ArrayBuffer> }
  | { ok: false; files: ReadonlyMap<AssetId, ArrayBuffer>; failed: readonly AssetId[]; reloadNeeded: boolean };
export function loadRequired(onProgress: (ratio: number) => void): Promise<LoadResult>;
export function retryFailed(prev: Extract<LoadResult, { ok: false }>, onProgress: (ratio: number) => void): Promise<LoadResult>;
/** (신규) 소리 파일 전부를 백그라운드로 받는다. 같은 Promise를 돌려준다(한 번만 받음). */
export function loadSounds(): Promise<ReadonlyMap<AssetId, ArrayBuffer>>;
```

| 항목 | 약속 |
|---|---|
| 대상 | `loadRequired`: GLB 8개(`models/<VehicleKindId 또는 CharacterKindId>.glb`)만. 그림은 번들 안에 있어 받을 것이 없고(assets.md), 소리는 `loadSounds`. |
| 진행률 | `ratio`는 0 → 1로만 늘어납니다(바이트 기준, 크기를 모르는 파일은 개수 기준으로 섞음). 바이트가 늘면 그때마다 부릅니다 → 느린 네트워크에서도 움직임이 보임(FR-003, Edge "로딩·배포"). |
| 실패 | Promise는 **reject하지 않습니다**. HTTP 404가 하나라도 있으면 `reloadNeeded: true`(새 배포로 이전 파일이 사라짐, 02 결정 A5). 일정 시간 바이트가 늘지 않으면 `AbortController`로 끊고 `failed`에 넣습니다(실제 시간 기준, 게임 시간 아님). 그 밖의 네트워크 오류도 `failed`. |
| 다시 시도 | 자동 재시도 없음. `retryFailed`는 `prev.failed`만 다시 받고 `prev.files`는 유지합니다(FR-004). `reloadNeeded`이면 flow가 `retryFailed` 대신 `location.reload()`를 부릅니다(저장 유지). 진행 중 중복 호출은 flow가 막습니다(버튼 비활성, 연타 Edge). |
| 요청 대상 | `ASSET_URLS`의 같은 출처 주소만. 코드에 경로 문자열을 쓰지 않습니다(static-paths.md). |
| `loadSounds` | 실패한 파일은 Map에서 빠질 뿐 오류가 아닙니다(FR-070). main이 필수 파일을 다 받은 뒤 시작해 대역폭을 다투지 않게 합니다. |

### 8.3 `src/app/flow.ts`

```ts
export type Screen = ScreenState['screen'];
export type ScreenState = /* data-model.md 2.2 */;
export type PlaySession = /* data-model.md 2.2 */;
/** (신규) 3D 확인이 끝난 뒤 main이 1번 부른다. 이후 화면 흐름 전체를 맡는다. */
export function startFlow(stage: Stage, run: RunState, storageOk: boolean): void;
```

| 항목 | 약속 |
|---|---|
| 역할 | 화면 상태 기계(data-model.md 4.1), 틱마다 지금 화면에 맞는 step을 부르고 이벤트를 [events.md](./events.md)대로 처리합니다. `RunState`·`ScreenState`를 바꾸는 유일한 곳. |
| 틱 | 플레이 화면(`drivingLesson`, `practice`, `race`)에서만 step을 부릅니다. 입력은 `readDriveInput()`, `gearTap`은 지난 틱 이후 `reverse` 탭이 있었으면 그 틱 1번만 참(탭이 여럿이면 틱마다 하나씩 소비). |
| 연타 | 지금 화면·상태와 맞지 않는 버튼 입력은 무시합니다 → 화면 전환·경기가 두 번 일어나지 않음(spec Edge "앱 전환·생명주기"). |
| 관찰 | 화면이 바뀔 때마다 `document.body.dataset.screen = screen`, 겹침이 바뀔 때마다 `document.body.dataset.overlays`(켜진 이름을 공백으로 이음: `paused`, `rotate`, `storageNotice`, `contextLost`, `confirmExit`). `?e2e`이면 `window.__e2e`(static-paths.md). |

### 8.4 `src/main.ts` (내보내는 것 없음)

순서: `document.body.dataset.screen = 'boot'` → `createStage(canvas, …)`가 `null`이면 `unsupported` 화면(끝) → `loadSave(trackConfigKey(TRACK))` → `createRunState` → `startFlow`(→ `loading`). 부팅 가드 해제 조건은 static-paths.md.

## 9. `src/render/` — 렌더러 진입점

렌더러 내부 구조는 구현 재량입니다. flow가 부르는 진입점과 지켜야 할 불변식만 적습니다.

```ts
// stage.ts
export type Stage = {                                             // (신규)
  readonly scene: THREE.Scene;
  resize(): void;
  draw(): void;                                                   // 매 프레임 1번
};
export function createStage(canvas: HTMLCanvasElement, onContext: (lost: boolean) => void): Stage | null; // (신규)

// models.ts
export type PreparedModel = { root: THREE.Object3D; clips: readonly THREE.AnimationClip[] };             // (신규)
export function prepareModel(glb: ArrayBuffer, kind: VehicleKind | CharacterKind): Promise<PreparedModel>;
export function cloneModel(model: PreparedModel): THREE.Object3D;                                         // (신규)

// showroom.ts, townView.ts, trackView.ts — 화면별 동기화 (모두 신규)
export function renderShowroom(stage: Stage, list: 'vehicles' | 'characters', selected: number | null): void;
export function renderTown(stage: Stage, play: PlaySession, scene: ScenarioAttempt | DrivingLessonState): void;
export function renderTrack(stage: Stage, play: PlaySession, race: RaceState): void;
export function racePassenger(): CharacterKindId | null;                                       // (신규) E2E 관찰용, 레이싱 화면 탑승객
```

- `renderTrack`: 모래 바닥·짙은 남색 노면·빨강/흰 줄무늬 벽·체크무늬 결승선과 문(마을과 구별, FR-052), 아이 차 = 고른 차 + 탑승객 + 바닥 노란 고리(뒤따르는 카메라에서 앞차와 겹쳐 보이지 않게, FR-053), 카메라는 아이 차를 따라감.

| 항목 | 약속 |
|---|---|
| `createStage` | WebGL2 컨텍스트가 없거나 `WebGLRenderer` 생성이 예외면 `null`(→ `unsupported`, FR-005). 던지지 않습니다. `webglcontextlost`/`restored`를 `onContext(true/false)`로 알립니다(three.js가 `preventDefault`·복구를 처리, FR-006). `?perf`이면 측정 표시. |
| `prepareModel` | GLTFLoader로 파싱 후 assets.md "모델 정규화"의 순서·결과를 보장합니다. 손상된 GLB면 reject → flow는 그 파일을 `loadFailed`의 실패로 다룹니다(다시 시도 = 다시 받기). |
| `cloneModel` | 차량 5종은 `clone()`(geometry 공유), 뼈대가 있는 캐릭터 3종은 모두 `SkeletonUtils.clone`. 캐릭터의 geometry·관절·가중치를 합치거나 제거하지 않음(03 리깅 기록). |
| `render*` | 순수 상태를 **읽기만** 합니다. 카메라는 `DRIVING_SPEC` 기준 고정 오프셋(모델 크기 무관, FR-011). 아이 차는 `play.vehicle` 모델 + `seats[0]`에 `play.character`(FR-097). 등장 보행자·보행자 시점 안내 주인공은 Chicken Guy(FR-096). 보행자 시점 안내 중에는 `def.camera`, 지금 카드의 `poses`·`weather`를 씁니다. |
| Chicken Guy 자세 | `Armature|Walk`·`Armature|Idle` 클립을 갱신한 **뒤에** `Head`·`HandL`·`HandR`(three.js 안의 이름, assets.md) 자세를 덮어씁니다. `Armature|Sprint`·`Armature|Jump`는 재생하지 않습니다(FR-094). |
| 시간 | 클립 재생·확대 효과 같은 꾸밈에는 실제 시간을 써도 됩니다. 위치·신호·판정은 순수 상태 값만 그립니다. |
| 금지 | 렌더러 값(모델 상자 크기, 애니메이션 위치)을 순수 상태에 되돌려 넣지 않습니다(FR-011). 3D 화면 터치에 반응하지 않습니다(FR-023). |

## 10. `src/audio/audio.ts` — 소리

```ts
export type SfxId = 'tap' | 'signal-change' | 'gentle-stop' | 'success' | 'countdown' | 'go' | 'lap'; // (신규) 허용 목록
/** (신규) 사용자 동작(click·pointerdown) 처리 안에서만 부른다. 여러 번 불러도 안전. */
export function unlockAudio(): Promise<boolean>;
export function applySoundSettings(s: SoundSettings): void;   // (신규)
export function playVoice(id: VoiceLineId | RuleId): void;     // (신규) audio/voice/<id>.mp3
export function stopVoice(): void;                             // (신규)
export function playSfx(id: SfxId): void;                      // (신규) audio/sfx/<id>.mp3
export function pauseAudio(): void;                            // (신규)
export function resumeAudio(): void;                           // (신규)
```

| 항목 | 약속 |
|---|---|
| FR-066 | `AudioContext`는 첫 `unlockAudio()` 안에서 만듭니다(그 전에는 만들지 않음, SC-020). `resume()` 결과가 `running`이면 `true`. 아니면 `false`이고, flow가 다음 사용자 동작마다 다시 부릅니다(iOS `interrupted` 포함). 첫 성공 때 `loadSounds()`를 받아 디코딩하고, 배경음(`audio/bgm/main.mp3`)을 반복 재생합니다. |
| FR-068 | 안내 음성은 한 번에 하나: 새 `playVoice`가 이전 음성을 끊고 처음부터. 음성 중 배경음을 낮추고 끝나면 되돌립니다. 효과음은 음성 중 낮게. |
| FR-069 | `applySoundSettings`는 재생 중인 소리에 바로 반영합니다(배경음 / 안내·효과음 두 묶음). |
| FR-071, FR-076 | `pauseAudio`: 모든 소리 멈춤(`suspend`). `resumeAudio`: 배경음은 이어서, **끊긴 안내 음성은 처음부터 다시**. 보행자 시점 안내 중이면 flow가 일시정지 전에 `stopVoice()`를 불러 되살릴 음성이 없게 합니다(카드 음성은 `cardShown`이 다시 틂, events.md 6장). |
| FR-070, FR-036 | 파일이 없거나 디코딩·재생이 실패하면 조용히 넘어갑니다(던지지 않음, Promise reject 없음). 진행이 음성 완료를 기다리지 않습니다. 효과음은 `SfxId` 목록 밖을 틀 수 없습니다(위협적인 소리 금지는 콘텐츠 검토). |

## 11. `src/platform/lifecycle.ts` — 브라우저 신호

```ts
export type LifecycleSignal = 'hidden' | 'visible' | 'portrait' | 'landscape' | 'layout' | 'blur'; // (신규)
/** (신규) 리스너를 달고, 브라우저 기본 제스처(확대·스크롤·길게 누르기 메뉴·당겨서 새로 고침)를 막는다. */
export function watchLifecycle(on: (signal: LifecycleSignal) => void): void;
/** (신규, FR-099) 전체화면 → 가로 고정 시도. 사용자 탭 처리 안에서 부름. 이미 전체화면이면 고정만 시도. 거절·미지원은 조용히 무시 */
export function enterFullscreen(): void;
/** (신규, FR-099) 전체화면이면 나가고, 아니면 enterFullscreen */
export function toggleFullscreen(): void;
```

| 신호 | 언제 |
|---|---|
| `hidden` / `visible` | `visibilitychange`(앱 전환·화면 잠금, FR-073) |
| `portrait` | 세로 방향이거나 가로라도 너무 작은 영역(기준 상수는 기기 점검, plan O6) |
| `landscape` | `portrait` 상태에서 가로로 돌아옴 |
| `layout` | 가로 유지 중 크기 변화(가로 180° 뒤집기, 주소창, 화면 분할) |
| `blur` | `window` `blur` |

- 방향 고정은 `enterFullscreen`이 시도만 하고 결과에 기대지 않습니다(FR-007, FR-099). 세로 판정·안내는 고정 여부와 상관없이 그대로. flow의 반응은 events.md 6장.
- `gesturestart`·`dblclick`·`contextmenu`·`touchmove`(passive: false) `preventDefault`(FR-020, SC-005).

---

## 12. 타입·상수 소속 파일

| 파일 | 내보내는 타입·상수 |
|---|---|
| `src/core/loop.ts` | `TICK_HZ`, `MAX_TICKS_PER_FRAME` |
| `src/sim/vehicle.ts` | `Vec2`, `Vec3`, `Pose`, `Gear`, `DriveInput`, `DriveState`, `DrivingSpec`, `DRIVING_SPEC` |
| `src/content/vehicles.ts` | `VehicleKind`, `VehicleKindId`, `SeatDef`, `VEHICLES` |
| `src/content/characters.ts` | `CharacterKind`, `CharacterKindId`, `CharacterPose`, `CHARACTERS` |
| `src/content/rules.ts` | `SafetyRule`, `RuleId`, `PictureElementId`, `SAFETY_RULES` |
| `src/content/scenarios.ts` | `ScenarioDef`, `ScenarioId`, `SegmentDef`, `SafetyActionStep`, `ActorPlan`, `PedestrianViewDef`, `ViolationKind`, `RouteIssue`, `SCENARIOS` |
| `src/content/town.ts` | `TownDef`, `Rect`, `AreaId`, `SignalId`, `SignalDef`, `SceneElementId`, `ScenePropPlacement`, `TOWN` |
| `src/content/track.ts` | `TrackDef`, `Checkpoint`, `AiProfile`, `TRACK` |
| `src/content/voice.ts` | `VoiceLineId`, `VOICE_LINES`, `VIOLATION_LINES` |
| `src/content/credits.ts` | `Credit`, `CreditId`, `CREDITS` |
| `src/practice/townActors.ts` | `SignalState`, `TownPedestrian`, `POSE_TICKS`, `WALK_SPEED`, `FLASH_TICKS`, `STOP_MARGIN` |
| `src/practice/drivingLesson.ts` | `DrivingLessonState`, `DrivingLessonEvent` |
| `src/practice/scenario.ts` | `ScenarioAttempt`, `ScenarioEvent`, `HintCue`, `IDLE_HINT_TICKS`, `DEMO_AFTER_FAILS`, `EXPLAIN_TICKS` |
| `src/practice/ruleRotation.ts` | `EXTRAS_PER_VIEW` |
| `src/pedestrianView/pedestrianView.ts` | `PedestrianViewState`, `PedestrianViewEvent` |
| `src/race/race.ts` | `RaceState`, `RaceEvent`, `FinishResult`, `COUNTDOWN_TICKS`, `CONTACT_SLOW_TICKS` |
| `src/race/progress.ts` | `RaceCar`, `Slot`, `STUCK_TICKS` |
| `src/storage/save.ts` | `SaveDataV1`, `BestRecord`, `SoundSettings`, `MAX_RECORD_CS` |
| `src/app/session.ts` | `RunState` |
| `src/app/loader.ts` | `AssetId`, `ASSET_URLS`, `LoadResult` |
| `src/app/flow.ts` | `ScreenState`, `Screen`, `PlaySession` |
| `src/render/stage.ts`, `models.ts` | `Stage`, `PreparedModel` |
| `src/audio/audio.ts` | `SfxId` |
| `src/platform/lifecycle.ts` | `LifecycleSignal` |
| `src/input/controls.ts` | `ControlButton`, `HoldButton`, `ScreenPoint`, `ScreenRect` |

콘텐츠 파일이 다른 폴더의 타입(`Pose`, `AssetId` 등)을 쓸 때는 `import type`만 씁니다.
