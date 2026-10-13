import type { Rect } from '../content/town';
import { DRIVING_SPEC, type DriveState } from './vehicle';

// 차체 원(반지름 bodyRadius)과 사각형이 겹치는지: 원 중심에서 사각형의 가장 가까운 점까지 거리
export function overlaps(s: DriveState, r: Rect): boolean {
  const dx = s.x - Math.min(Math.max(s.x, r.minX), r.maxX);
  const dz = s.z - Math.min(Math.max(s.z, r.minZ), r.maxZ);
  return dx * dx + dz * dz < DRIVING_SPEC.bodyRadius ** 2;
}

/** 마을 건물 구역(Rect)에 차체 원이 들어가면 이전 자리(경계 앞)에 두고 멈춤. heading은 바꾸지 않음(FR-035) */
export function blockByAreas(prev: DriveState, next: DriveState, blockers: readonly Rect[]): { state: DriveState; hit: boolean } {
  if (!blockers.some((r) => overlaps(next, r))) return { state: next, hit: false };
  return { state: { ...next, x: prev.x, z: prev.z, speed: 0 }, hit: true };
}
