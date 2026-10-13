import { type AiProfile, TRACK } from '../content/track';
import type { VehicleKindId } from '../content/vehicles';
import { pointOnTrack, projectOnTrack, trackLength } from '../sim/collision';
import { DRIVING_SPEC, type DriveState, type Pose, type Vec2 } from '../sim/vehicle';

export const STUCK_TICKS = 300; // 자리값(5초): 진행도가 늘지 않으면 복귀. 레이싱 조정(T118)에서 확정

export type Slot = 0 | 1 | 2 | 3;
export type RaceCar = {
  slot: Slot;
  isPlayer: boolean;
  vehicle: VehicleKindId;
  drive: DriveState;
  lapsDone: number;
  nextCheckpoint: number;
  status: 'normal' | 'contactSlow' | 'finished';
  slowTicks: number;
  stuckTicks: number;
  finish: { tick: number; overshoot: number } | null;
  ai: AiProfile | null;
};

const CP = TRACK.checkpoints;
const L = trackLength(TRACK);

/** 마지막으로 정상 통과한 체크포인트 번호 */
const lastCheckpoint = (car: RaceCar) => (car.nextCheckpoint - 1 + CP.length) % CP.length;

/** lapsDone × L + 마지막 통과 체크포인트 arc + 그 구간 안으로 제한한 투영 거리(data-model.md 7장) → 가로지르기·복귀로 늘지 않음 */
export function progressValue(car: RaceCar): number {
  const last = lastCheckpoint(car);
  const to = last + 1 < CP.length ? CP[last + 1].arc : L;
  return car.lapsDone * L + projectOnTrack(TRACK, car.drive, CP[last].arc, to).arc;
}

// 동점이면 플레이어 앞 → slot 작은 순
const tie = (a: RaceCar, b: RaceCar) => Number(b.isPlayer) - Number(a.isPlayer) || a.slot - b.slot;

/** 1위부터 slot 목록: 완주한 차(finish.tick 작은 순 → overshoot 큰 순) → 미완주(진행도 큰 순) (FR-057) */
export function rankCars(cars: readonly RaceCar[]): readonly Slot[] {
  const progress = new Map(cars.map((c) => [c.slot, c.finish ? 0 : progressValue(c)]));
  return [...cars]
    .sort((a, b) => {
      if (a.finish && b.finish) return a.finish.tick - b.finish.tick || b.finish.overshoot - a.finish.overshoot || tie(a, b);
      if (a.finish || b.finish) return a.finish ? -1 : 1;
      return progress.get(b.slot)! - progress.get(a.slot)! || tie(a, b);
    })
    .map((c) => c.slot);
}

/**
 * race.ts 내부용: prev → car.drive 이동이 다음 차례 체크포인트를 정방향으로 넘었으면 넘어선 거리(m), 아니면 null.
 * 통과선은 그 지점에서 중심선에 수직인 트랙 폭만큼의 선분(FR-059: 역방향·차례 아닌 체크포인트는 무시)
 */
export function crossedNext(car: RaceCar, prev: Vec2): number | null {
  const { p, t } = pointOnTrack(TRACK, CP[car.nextCheckpoint].arc);
  const before = (prev.x - p.x) * t.x + (prev.z - p.z) * t.z;
  const after = (car.drive.x - p.x) * t.x + (car.drive.z - p.z) * t.z;
  if (!(before < 0 && after >= 0)) return null;
  const k = before / (before - after);
  const side = (prev.x + (car.drive.x - prev.x) * k - p.x) * t.z - (prev.z + (car.drive.z - prev.z) * k - p.z) * t.x;
  return Math.abs(side) <= TRACK.width / 2 ? after : null;
}

/**
 * race.ts 내부용: 복귀 자세(data-model.md 7장). 마지막 통과 체크포인트의 중심·좌·우(width/3)와 접선 반대로 직선 5 × bodyRadius 뒤,
 * 이 순서로 다른 차와 겹치지 않는 첫 후보. 후보끼리 4 × bodyRadius보다 멀어 다른 3대가 모두 막을 수 없음(트랙 검사 #18)
 */
export function respawnPose(car: RaceCar, others: readonly Vec2[]): Pose {
  const r = DRIVING_SPEC.bodyRadius;
  const { p, t } = pointOnTrack(TRACK, CP[lastCheckpoint(car)].arc);
  const side = TRACK.width / 3;
  const candidates = [
    p,
    { x: p.x + t.z * side, z: p.z - t.x * side },
    { x: p.x - t.z * side, z: p.z + t.x * side },
    { x: p.x - t.x * 5 * r, z: p.z - t.z * 5 * r },
  ];
  const free = candidates.find((c) => others.every((o) => Math.hypot(o.x - c.x, o.z - c.z) >= 2 * r)) ?? candidates[3];
  return { ...free, heading: Math.atan2(t.x, t.z) };
}
