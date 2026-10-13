import type { CharacterPose } from '../content/characters';
import type { SegmentDef } from '../content/scenarios';
import type { SignalId } from '../content/town';
import { TICK_HZ } from '../core/loop';
import { DRIVING_SPEC, type DriveState, type Vec2 } from '../sim/vehicle';
import type { ScenarioEvent } from './scenario';

// 자리값(plan O5): 연습 조정 상수(T117)에서 확정
export const POSE_TICKS = 45; // 건너기 전 행동(lookLeft 등) 하나를 보여 주는 틱
export const WALK_SPEED = 1.2; // m/s
export const FLASH_TICKS = 180; // 진행 신호(greenAfterStoppedTicks) 이만큼 전부터 보행자 초록 깜빡임
export const STOP_MARGIN = 1; // m. 최고 속도 제동 거리에 더하는 여유

// 차량 신호 'green' | 'yellow' | 'red', 보행자 신호 'red' | 'green' | 'flashing'
export type SignalState = { id: SignalId; light: 'green' | 'yellow' | 'red' | 'flashing' };
export type TownPedestrian = {
  state: 'waiting' | 'crossing' | 'crossed';
  pos: Vec2;
  heading: number;
  pose: CharacterPose;
  plan: number; // ActorPlan.pedestrians 순번
  ticks: number; // 지금 state에서 지난 틱(건너기 전 행동 순서, 걸은 거리)
};

const BRAKE_GAP = DRIVING_SPEC.maxForwardSpeed ** 2 / (2 * DRIVING_SPEC.brakeDeceleration) + STOP_MARGIN;
const headingOf = (a: Vec2, b: Vec2) => Math.atan2(b.x - a.x, b.z - a.z);

export function initActors(segment: SegmentDef): { signals: SignalState[]; pedestrians: TownPedestrian[] } {
  const { signal, plan } = segment;
  const signals: SignalState[] = [];
  if (signal) signals.push({ id: signal, light: 'green' });
  // 차 신호가 없는 구간의 보행자 신호는 초록 그대로(지금 세 연습은 모두 차 신호가 있음)
  if (plan.pedestrianSignal) signals.push({ id: plan.pedestrianSignal, light: signal ? 'red' : 'green' });
  const pedestrians = plan.pedestrians.map((p, i): TownPedestrian => ({
    state: 'waiting',
    pos: p.path[0],
    heading: headingOf(p.path[0], p.path[1]),
    pose: 'idle',
    plan: i,
    ticks: 0,
  }));
  return { signals, pedestrians };
}

// 걸은 거리만큼 경로 위에 놓음. 끝에 닿으면 crossed
function walk(p: TownPedestrian, path: readonly Vec2[], ticks: number): TownPedestrian {
  let d = (ticks * WALK_SPEED) / TICK_HZ;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1];
    const b = path[i];
    const len = Math.hypot(b.x - a.x, b.z - a.z);
    if (d < len) {
      const pos = { x: a.x + ((b.x - a.x) * d) / len, z: a.z + ((b.z - a.z) * d) / len };
      return { ...p, state: 'crossing', pos, heading: headingOf(a, b), pose: 'walk', ticks };
    }
    d -= len;
  }
  return { ...p, state: 'crossed', pos: path[path.length - 1], pose: 'idle', ticks: 0 };
}

/**
 * 신호·보행자 1틱. 바뀌는 때는 차 위치(frontS)·멈춘 시간(stoppedTicks)·보행자 상태뿐(주기 없음, FR-040).
 * stoppedTicks = stopZone에서 멈춘 뒤 지난 틱. 한 시도 안에서 되돌아가지 않아야 진행 신호 뒤 다시 노랑이 되지 않음.
 */
export function stepTownActors(a: {
  segment: SegmentDef;
  signals: readonly SignalState[];
  pedestrians: readonly TownPedestrian[];
  frontS: number;
  stoppedTicks: number;
  drive: DriveState;
}): { signals: SignalState[]; pedestrians: TownPedestrian[]; events: ScenarioEvent[] } {
  const { segment, frontS, stoppedTicks, drive } = a;
  const { plan } = segment;
  const goAt = plan.greenAfterStoppedTicks ?? Infinity;
  const crossing = a.pedestrians.some((p) => p.state === 'crossing');
  const waiting = a.pedestrians.some((p) => p.state === 'waiting');
  const lightOf = (id: SignalId | null) => a.signals.find((s) => s.id === id)?.light;
  const carLight = lightOf(segment.signal);
  const walkLight = lightOf(plan.pedestrianSignal);

  // 보행자 신호: 빨강 → 초록(차 빨강일 때) → 깜빡임(건너기 전인 사람이 없을 때) → 빨강(건너는 사람이 없을 때)
  let nextWalk = walkLight;
  if (carLight !== undefined) {
    if (walkLight === 'red' && carLight === 'red' && stoppedTicks < goAt) nextWalk = 'green';
    else if (walkLight === 'green' && stoppedTicks >= goAt - FLASH_TICKS && !waiting) nextWalk = 'flashing';
    else if (walkLight === 'flashing' && stoppedTicks >= goAt && !crossing) nextWalk = 'red';
  }
  // 차 신호: 초록 → 노랑(redAtS) → 빨강(멈춤·정지 구역) → 초록(보행자 신호 빨강 ∧ 건너는 사람 없음).
  // 이번 틱에 정한 보행자 신호(nextWalk)를 보므로 같은 틱에 둘 다 초록이 될 수 없음(FR-042)
  let nextCar = carLight;
  if (carLight === 'green' && plan.redAtS !== null && frontS >= plan.redAtS && stoppedTicks < goAt) nextCar = 'yellow';
  else if (carLight === 'yellow' && (drive.speed === 0 || frontS >= segment.stopZone.fromS)) nextCar = 'red';
  else if (carLight === 'red' && stoppedTicks >= goAt && (nextWalk === undefined || nextWalk === 'red') && !crossing) {
    nextCar = 'green';
  }

  const events: ScenarioEvent[] = [];
  const signals = a.signals.map((s) => {
    const light = (s.id === segment.signal ? nextCar : s.id === plan.pedestrianSignal ? nextWalk : s.light) ?? s.light;
    if (light === s.light) return s;
    events.push({ type: 'signalChanged', signal: s.id, light });
    return { ...s, light };
  });

  // 보행자: 출발 조건 ∧ 차가 멈췄거나 멈출 수 있는 거리일 때만 계획의 행동을 차례로 보인 뒤 건넘(FR-039). 깜빡임에는 새로 출발 안 함(FR-043)
  const canStop = drive.speed === 0 || segment.stopLineS - frontS >= BRAKE_GAP;
  const pedestrians = a.pedestrians.map((ped): TownPedestrian => {
    const def = plan.pedestrians[ped.plan];
    if (ped.state === 'crossed') return ped;
    if (ped.state === 'crossing') return walk(ped, def.path, ped.ticks + 1);
    const lightOk = nextWalk === undefined || nextWalk === 'green';
    const ready = lightOk && (def.start === 'pedestrianGreen' ? nextWalk === 'green' : stoppedTicks > 0) && canStop;
    if (!ready) return ped.ticks === 0 && ped.pose === 'idle' ? ped : { ...ped, pose: 'idle', ticks: 0 };
    const ticks = ped.ticks + 1;
    if (ticks > def.poses.length * POSE_TICKS) return walk(ped, def.path, 0);
    return { ...ped, pose: def.poses[Math.floor((ticks - 1) / POSE_TICKS)], ticks };
  });

  return { signals, pedestrians, events };
}
