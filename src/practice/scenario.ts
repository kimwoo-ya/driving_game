import type { RuleId } from '../content/rules';
import { SCENARIOS, type ScenarioId, type SegmentDef, type ViolationKind } from '../content/scenarios';
import { type Rect, type SignalId, TOWN } from '../content/town';
import {
  type PedestrianViewEvent,
  type PedestrianViewState,
  startPedestrianView,
  stepPedestrianView,
} from '../pedestrianView/pedestrianView';
import { blockByAreas, overlaps } from '../sim/collision';
import {
  DRIVING_SPEC,
  type DriveInput,
  type DriveState,
  requestGearToggle,
  restingAt,
  stepVehicle,
  type Vec2,
} from '../sim/vehicle';
import { initActors, type SignalState, stepTownActors, type TownPedestrian } from './townActors';

// 자리값(plan O5): 연습 조정 상수(T117)에서 확정
export const IDLE_HINT_TICKS = 300;
export const DEMO_AFTER_FAILS = 3;
export const EXPLAIN_TICKS = 240;
const WAY_OFFSET = 2.5; // m. 경로에서 이만큼 벗어나면 방향 안내(wrongWay)
const LEAVE_OFFSET = 6; // m. 경로에서 이만큼 벗어나면 구간 다시(leftPath)
const LEAVE_BACK = 2; // m. 구간 시작보다 이만큼 뒤로 가면 구간 다시(leftPath)

export type HintCue = 'stop' | 'wait' | 'go' | 'closer' | 'way' | 'steer' | 'accel' | 'brake' | 'reverse';

export type ScenarioAttempt = {
  scenario: ScenarioId;
  phase: 'driving' | 'explaining' | 'pedestrianView' | 'done';
  segment: number;
  step: number;
  viewDone: boolean;
  violation: ViolationKind | null;
  phaseTicks: number;
  failStreak: number;
  idleTicks: number;
  stoppedTicks: number; // stopZone에서 멈춘(stop 단계 충족) 뒤 지난 틱. 구간 시도 안에서 되돌아가지 않음(townActors)
  stoppedOnce: boolean; // 이 구간 시도에서 움직이다 멈춘 적 있음(ranRed "한 번도 멈추지 않고")
  blockedTicks: number; // 건물에 닿은 채 경로 진행이 없는 틱(blocked)
  drive: DriveState;
  signals: SignalState[];
  pedestrians: TownPedestrian[];
  view: PedestrianViewState | null;
  picked: { rules: readonly RuleId[]; extrasCount: number };
};

export type ScenarioEvent =
  | { type: 'signalChanged'; signal: SignalId; light: SignalState['light'] }
  | { type: 'hint'; cue: HintCue; repeat: boolean }
  | { type: 'redirect'; issue: 'leftPath' | 'blocked' }
  | { type: 'violation'; kind: ViolationKind }
  | { type: 'segmentReset' }
  | { type: 'demoReplay'; cue: 'stop' | 'wait' | 'go' }
  | { type: 'pedestrianViewStart'; rules: readonly RuleId[] }
  | PedestrianViewEvent
  | { type: 'scenarioCompleted'; scenario: ScenarioId };

type Result = { state: ScenarioAttempt; events: ScenarioEvent[] };

// data-model.md 2.1 ViolationKind 표 순서 = 한 틱에 여럿일 때 우선순위
const VIOLATION_ORDER: readonly ViolationKind[] = [
  'turnedIntoCrossingPedestrian',
  'enteredCrosswalkWithPedestrian',
  'ranRed',
  'earlyStart',
  'overStopLine',
  'enteredSidewalk',
];
const BUILDINGS: readonly Rect[] = TOWN.areas.filter((a) => a.kind === 'building').map((a) => a.rect);
const SIDEWALKS: readonly Rect[] = TOWN.areas.filter((a) => a.kind === 'sidewalk').map((a) => a.rect);

const defOf = (s: { scenario: ScenarioId }) => SCENARIOS.find((d) => d.id === s.scenario)!;
const segOf = (s: ScenarioAttempt): SegmentDef => defOf(s).segments[s.segment];
const cueOf = (seg: SegmentDef, step: number) => seg.steps[step].action;
const hint = (cue: HintCue, repeat = false): ScenarioEvent => ({ type: 'hint', cue, repeat });
const inRect = (p: Vec2, r: Rect) => p.x >= r.minX && p.x <= r.maxX && p.z >= r.minZ && p.z <= r.maxZ;

/** 차체 앞 끝 가운데와 앞쪽 두 모서리(정지선·횡단보도 판정점, bodyLength·bodyRadius 기준) */
function front(d: DriveState): { center: Vec2; corners: Vec2[] } {
  const f = { x: Math.sin(d.heading), z: Math.cos(d.heading) };
  const half = DRIVING_SPEC.bodyLength / 2;
  const r = DRIVING_SPEC.bodyRadius;
  const center = { x: d.x + f.x * half, z: d.z + f.z * half };
  return {
    center,
    corners: [
      { x: center.x + f.z * r, z: center.z - f.x * r },
      { x: center.x - f.z * r, z: center.z + f.x * r },
    ],
  };
}

/** 경로(꺾은선)에 투영한 거리 s와 경로까지의 거리. 첫 선분 앞·마지막 선분 뒤는 늘여서 셈(시작 뒤는 s < 0) */
function project(path: readonly Vec2[], p: Vec2): { s: number; off: number } {
  let best = { s: 0, off: Infinity };
  let acc = 0;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1];
    const b = path[i];
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const len = Math.hypot(dx, dz);
    let t = ((p.x - a.x) * dx + (p.z - a.z) * dz) / (len * len);
    if (i > 1) t = Math.max(t, 0);
    if (i < path.length - 1) t = Math.min(t, 1);
    const off = Math.hypot(p.x - (a.x + dx * t), p.z - (a.z + dz * t));
    if (off < best.off) best = { s: acc + t * len, off };
    acc += len;
  }
  return best;
}
const pathLength = (path: readonly Vec2[]) =>
  path.slice(1).reduce((n, b, i) => n + Math.hypot(b.x - path[i].x, b.z - path[i].z), 0);

type Kept = Pick<ScenarioAttempt, 'scenario' | 'viewDone' | 'failStreak' | 'view' | 'picked'>;

/** 구간 처음 상태(data-model.md 4.4): 차·단계·신호·보행자·틱. viewDone·failStreak·picked는 그대로 */
function atSegmentStart(s: Kept, segment: number): ScenarioAttempt {
  const seg = defOf(s).segments[segment];
  return {
    ...s,
    phase: 'driving',
    segment,
    step: 0,
    violation: null,
    phaseTicks: 0,
    idleTicks: 0,
    stoppedTicks: 0,
    stoppedOnce: false,
    blockedTicks: 0,
    drive: restingAt(seg.start),
    ...initActors(seg),
  };
}

export function startScenario(
  scenario: ScenarioId,
  picked: { rules: readonly RuleId[]; extrasCount: number },
): Result {
  const state = atSegmentStart({ scenario, viewDone: false, failStreak: 0, view: null, picked }, 0);
  return { state, events: [hint(cueOf(segOf(state), 0))] };
}

/** 후보 위치에서 잘못된 행동 판정. 그 구간 violations에 있는 것 중 우선순위 위쪽 하나 */
function judge(s: ScenarioAttempt, cand: DriveState, signals: readonly SignalState[], peds: readonly TownPedestrian[]) {
  const seg = segOf(s);
  const { corners } = front(cand);
  const found: ViolationKind[] = [];
  const crosswalk = TOWN.areas.find((a) => a.id === seg.crosswalk)?.rect;
  const crossing = peds.some((p) => p.state === 'crossing');
  // 직진·회전 구분은 구간 violations가 정함(둘 중 하나만 둠)
  if (crosswalk && crossing && corners.some((c) => inRect(c, crosswalk))) {
    found.push('turnedIntoCrossingPedestrian', 'enteredCrosswalkWithPedestrian');
  }
  const action = cueOf(seg, s.step);
  if (action !== 'go' && corners.some((c) => project(seg.path, c).s > seg.stopLineS)) {
    // 회전 구간은 정지선(모퉁이 앞)이 횡단보도보다 먼저라, 건너는 사람이 있을 때 넘으면 그쪽으로 돌려는 것(사용자 결정 2026-10-13)
    if (crossing) found.push('turnedIntoCrossingPedestrian');
    const light = signals.find((x) => x.id === seg.signal)?.light;
    if (action === 'wait') found.push('earlyStart');
    else if ((light === 'yellow' || light === 'red') && !s.stoppedOnce) found.push('ranRed');
    found.push('overStopLine');
  }
  if (SIDEWALKS.some((r) => overlaps(cand, r))) found.push('enteredSidewalk');
  return VIOLATION_ORDER.find((k) => found.includes(k) && seg.violations.includes(k)) ?? null;
}

/** 지금 단계를 이 틱에 마쳤는지(FR-032: 그 행동을 직접 했을 때만) */
function stepDone(s: ScenarioAttempt, frontS: number): boolean {
  const seg = segOf(s);
  const step = seg.steps[s.step];
  if (step.action === 'stop') return s.drive.speed === 0 && frontS >= seg.stopZone.fromS && frontS <= seg.stopZone.toS;
  if (step.action === 'go') return frontS >= pathLength(seg.path);
  if (s.drive.speed !== 0) return false;
  if (step.until === 'vehicleGreen') return s.signals.some((x) => x.id === seg.signal && x.light === 'green');
  return s.pedestrians.every((p) => p.state === 'crossed');
}

/** 단계를 마친 뒤: 다음 단계·다음 구간·보행자 시점 안내·완료 */
function advance(s: ScenarioAttempt, events: ScenarioEvent[]): Result {
  const def = defOf(s);
  const view = def.pedestrianView;
  if (!s.viewDone && view.segment === s.segment && view.afterStep === s.step) {
    const state: ScenarioAttempt = {
      ...s,
      phase: 'pedestrianView',
      phaseTicks: 0,
      idleTicks: 0,
      drive: { ...s.drive, speed: 0 },
      view: startPedestrianView(s.picked),
    };
    return { state, events: [...events, { type: 'pedestrianViewStart', rules: s.picked.rules }] };
  }
  return next(s, events);
}

/** 안내가 없거나 끝난 뒤 다음 단계로 */
function next(s: ScenarioAttempt, events: ScenarioEvent[]): Result {
  const def = defOf(s);
  const seg = segOf(s);
  if (s.step + 1 < seg.steps.length) {
    const state = { ...s, phase: 'driving' as const, step: s.step + 1, idleTicks: 0 };
    return { state, events: [...events, hint(cueOf(seg, state.step))] };
  }
  if (s.segment + 1 < def.segments.length) {
    // 다음 구간은 지금 자리에서 이어 달림(차 위치 그대로), 연속 실패는 0부터
    const state = { ...atSegmentStart({ ...s, failStreak: 0 }, s.segment + 1), drive: s.drive };
    return { state, events: [...events, hint(cueOf(segOf(state), 0))] };
  }
  return { state: { ...s, phase: 'done' }, events: [...events, { type: 'scenarioCompleted', scenario: s.scenario }] };
}

function stepDriving(s: ScenarioAttempt, input: DriveInput, gearTap: boolean): Result {
  const seg = segOf(s);
  const events: ScenarioEvent[] = [];
  // 1. 후진 전환(멈췄을 때만)
  const drive = gearTap ? requestGearToggle(s.drive).state : s.drive;
  // 2. 후보 = 주행 → 건물 막기
  const blocked = blockByAreas(drive, stepVehicle(drive, input), BUILDINGS);
  const cand = blocked.state;
  const candS = project(seg.path, front(cand).center).s;
  // 3. 신호·보행자
  const actors = stepTownActors({
    segment: seg,
    signals: s.signals,
    pedestrians: s.pedestrians,
    frontS: candS,
    stoppedTicks: s.stoppedTicks,
    drive: cand,
  });
  events.push(...actors.events);
  // 4. 잘못된 행동 → 후보 버림, 그 자리에 멈춤
  const violation = judge(s, cand, actors.signals, actors.pedestrians);
  if (violation) {
    const state: ScenarioAttempt = {
      ...s,
      phase: 'explaining',
      violation,
      phaseTicks: 0,
      drive: { ...drive, speed: 0 },
      signals: actors.signals,
      pedestrians: actors.pedestrians,
    };
    return { state, events: [...events, { type: 'violation', kind: violation }] };
  }
  // 5. 후보 적용, 경로 문제
  const prevS = project(seg.path, front(s.drive).center).s;
  const off = project(seg.path, cand).off; // 경로에서 벗어난 정도는 차체 중심 기준
  const prevOff = project(seg.path, s.drive).off;
  const stoppedNow = s.drive.speed > 0 && cand.speed === 0;
  const blockedTicks = blocked.hit && candS <= prevS ? s.blockedTicks + 1 : 0;
  const leftPath = off > LEAVE_OFFSET || candS < -LEAVE_BACK;
  if (leftPath || blockedTicks >= IDLE_HINT_TICKS) {
    const state = atSegmentStart(s, s.segment);
    return { state, events: [...events, { type: 'redirect', issue: leftPath ? 'leftPath' : 'blocked' }] };
  }
  const state: ScenarioAttempt = {
    ...s,
    drive: cand,
    signals: actors.signals,
    pedestrians: actors.pedestrians,
    stoppedTicks: s.stoppedTicks > 0 ? s.stoppedTicks + 1 : 0,
    stoppedOnce: s.stoppedOnce || stoppedNow,
    blockedTicks,
  };
  if (stoppedNow && cueOf(seg, s.step) === 'stop' && candS < seg.stopZone.fromS) events.push(hint('closer'));
  if (off > WAY_OFFSET && prevOff <= WAY_OFFSET) events.push(hint('way'));
  // 6. 단계 판정
  if (stepDone(state, candS)) {
    const counted = cueOf(seg, s.step) === 'stop' ? { ...state, stoppedTicks: 1 } : state;
    return advance(counted, events);
  }
  // 7. 무입력 재안내(실패 아님)
  const idle = input.steer === 0 && !input.throttle && !input.brake && !gearTap;
  const idleTicks = idle ? s.idleTicks + 1 : 0;
  if (idleTicks >= IDLE_HINT_TICKS) {
    return { state: { ...state, idleTicks: 0 }, events: [...events, hint(cueOf(seg, s.step), true)] };
  }
  return { state: { ...state, idleTicks }, events };
}

export function stepScenario(state: ScenarioAttempt, input: DriveInput, gearTap: boolean): Result {
  switch (state.phase) {
    case 'done':
      return { state, events: [] };
    case 'explaining': {
      // 차·신호·보행자 멈춤, 입력 무시. 다 차면 같은 구간 처음부터(failStreak + 1)
      if (state.phaseTicks + 1 < EXPLAIN_TICKS) return { state: { ...state, phaseTicks: state.phaseTicks + 1 }, events: [] };
      const reset = { ...atSegmentStart(state, state.segment), failStreak: state.failStreak + 1 };
      const cue = cueOf(segOf(reset), 0);
      const events: ScenarioEvent[] = [{ type: 'segmentReset' }];
      if (reset.failStreak >= DEMO_AFTER_FAILS) events.push({ type: 'demoReplay', cue });
      return { state: reset, events: [...events, hint(cue)] };
    }
    case 'pedestrianView': {
      // 운전 입력·후진 탭 무시(FR-041, US2-14)
      const r = stepPedestrianView(state.view!, defOf(state).pedestrianView);
      const s = { ...state, view: r.state };
      if (!r.events.some((e) => e.type === 'ended')) return { state: s, events: r.events };
      return next({ ...s, viewDone: true }, r.events);
    }
    case 'driving':
      return stepDriving(state, input, gearTap);
  }
}
