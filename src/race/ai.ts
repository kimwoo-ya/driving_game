import { TRACK } from '../content/track';
import { pointOnTrack, projectOnTrack, trackLength } from '../sim/collision';
import { DRIVING_SPEC, type DriveInput, type Vec2 } from '../sim/vehicle';
import type { RaceCar } from './progress';

// 자리값: 트랙·주행 조정(T115)에서 확정
const LOOK_AHEAD = 8; // 주행선 위 이만큼 앞 점을 향해 핸들(m)
const STEER_GAIN = 2; // 방향 차(rad) → steer
const BLOCK_AHEAD = 8; // 이 거리 안 앞차가 내 주행선을 막으면 옆 주행선으로(m)
const LANES = [-TRACK.width / 3, 0, TRACK.width / 3]; // 비킬 때 고르는 주행선

const L = trackLength(TRACK);
const r = DRIVING_SPEC.bodyRadius;

// 중심선 기준 자리: arc와 옆 거리(+ = 왼쪽 = 출발 직선의 +X)
function place(p: Vec2) {
  const q = projectOnTrack(TRACK, p);
  return { arc: q.arc, side: (p.x - q.p.x) * q.t.z - (p.z - q.p.z) * q.t.x };
}

/**
 * 컴퓨터 차량 한 대의 이번 틱 입력. 같은 stepVehicle 한도 안에서 주행선(laneOffset)·액셀을 떼는 속도(targetSpeedRatio)·
 * 출발 반응(reactionTicks)으로만 난이도(FR-054). 틱 시작 스냅숏만 보고 무작위가 없어 처리 순서와 무관
 */
export function aiInput(car: RaceCar, cars: readonly RaceCar[], raceTicks: number): DriveInput {
  const ai = car.ai!;
  const me = place(car.drive);
  // 앞 BLOCK_AHEAD 안에서 내 주행선을 막는 차들 → 그 차들에서 가장 먼 주행선(FR-060). 그래도 막히면 복귀 규칙
  const blockers = cars
    .filter((o) => o.slot !== car.slot)
    .map((o) => place(o.drive))
    .filter((o) => (o.arc - me.arc + L) % L < BLOCK_AHEAD && Math.abs(o.side - ai.laneOffset) < 2 * r);
  const lane = blockers.length
    ? LANES.reduce((best, l) => (gap(l, blockers) > gap(best, blockers) ? l : best))
    : ai.laneOffset;
  const { p, t } = pointOnTrack(TRACK, me.arc + LOOK_AHEAD);
  const target = { x: p.x + t.z * lane, z: p.z - t.x * lane };
  const turn = Math.atan2(target.x - car.drive.x, target.z - car.drive.z) - car.drive.heading;
  return {
    steer: Math.min(Math.max(Math.atan2(Math.sin(turn), Math.cos(turn)) * STEER_GAIN, -1), 1),
    throttle: raceTicks >= ai.reactionTicks && car.drive.speed < ai.targetSpeedRatio * DRIVING_SPEC.maxForwardSpeed,
    brake: false,
  };
}

const gap = (lane: number, blockers: readonly { side: number }[]) => Math.min(...blockers.map((b) => Math.abs(b.side - lane)));
