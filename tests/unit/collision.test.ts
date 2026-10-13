import { describe, expect, it } from 'vitest';
import type { Rect } from '../../src/content/town';
import { TRACK } from '../../src/content/track';
import { blockByAreas, blockByTrackWalls, separateCars } from '../../src/sim/collision';
import { DRIVING_SPEC, type DriveState } from '../../src/sim/vehicle';

const R = DRIVING_SPEC.bodyRadius;
const WALL: Rect = { minX: 8, minZ: 0, maxX: 20, maxZ: 30 };
const at = (x: number, heading = Math.PI / 2): DriveState => ({ x, z: 10, heading, speed: 5, gear: 'forward' });

describe('blockByAreas (modules.md 3.2, FR-035)', () => {
  it('건물 구역에 차체 원이 들어가면 이전 자리(경계 앞)에 두고 멈춤, heading은 그대로, hit', () => {
    const prev = at(6.5);
    const next = { ...at(7.2), heading: 1.7 };
    expect(blockByAreas(prev, next, [WALL])).toEqual({ state: { ...next, x: prev.x, z: prev.z, speed: 0 }, hit: true });
  });

  it('닿지 않으면 next 그대로, hit 없음', () => {
    const next = at(6.5);
    expect(blockByAreas(at(6), next, [WALL])).toEqual({ state: next, hit: false });
    expect(blockByAreas(at(6), at(7.2), [{ minX: 100, minZ: 0, maxX: 110, maxZ: 1 }, WALL]).hit).toBe(true); // 닿은 구역이 둘째여도
  });

  it('판정 크기는 DRIVING_SPEC.bodyRadius 하나뿐(경계까지 거리가 반지름보다 조금 크면 통과, 작으면 막힘)', () => {
    expect(blockByAreas(at(6), at(WALL.minX - R - 0.01), [WALL]).hit).toBe(false);
    expect(blockByAreas(at(6), at(WALL.minX - R + 0.01), [WALL]).hit).toBe(true);
  });
});

describe('blockByTrackWalls (modules.md 3.2, FR-060·061)', () => {
  // 출발 직선(중심선 x = 0, +Z 방향, 폭 14): 차 중심은 |x| ≤ 7 − R 까지
  const EDGE = TRACK.width / 2 - R;
  const car = (x: number, heading: number, speed = 6): DriveState => ({ x, z: 20, heading, speed, gear: 'forward' });

  it('벽 밖으로 나가는 이동은 벽 앞에 두고 감속, heading은 그대로(튕김·회전 없음), hit', () => {
    const next = car(EDGE + 0.3, 0.5);
    const r = blockByTrackWalls(car(EDGE - 0.2, 0.5), next, TRACK);
    expect(r.hit).toBe(true);
    expect(r.state.x).toBeCloseTo(EDGE);
    expect(r.state.z).toBe(next.z);
    expect(r.state.heading).toBe(next.heading);
    expect(r.state.speed).toBeGreaterThan(0);
    expect(r.state.speed).toBeLessThan(next.speed);
    // 벽을 정면으로 향하면 멈춤, 벽과 나란할수록 덜 줄어듦
    expect(blockByTrackWalls(car(EDGE, Math.PI / 2), car(EDGE + 0.1, Math.PI / 2), TRACK).state.speed).toBeCloseTo(0);
    expect(blockByTrackWalls(car(EDGE, 0.1), car(EDGE + 0.1, 0.1), TRACK).state.speed).toBeGreaterThan(r.state.speed);
  });

  it('폭 안이면 next 그대로, hit 없음', () => {
    const next = car(EDGE - 0.01, 0.5);
    expect(blockByTrackWalls(car(0, 0.5), next, TRACK)).toEqual({ state: next, hit: false });
  });
});

describe('separateCars (modules.md 3.2, FR-060)', () => {
  const at = (x: number, z: number, heading = 0): DriveState => ({ x, z, heading, speed: 5, gear: 'forward' });

  it('겹친 만큼 둘을 반씩 떼어 놓고 heading·speed는 그대로, 닿은 차만 touching', () => {
    const r = separateCars([at(0, 0, 0.3), at(1.2, 0, 1), at(10, 10)]);
    expect(r.states[0]).toEqual({ ...at(-0.4, 0, 0.3) });
    expect(r.states[1]).toEqual({ ...at(1.6, 0, 1) });
    expect(Math.hypot(r.states[1].x - r.states[0].x, r.states[1].z - r.states[0].z)).toBeCloseTo(2 * R);
    expect(r.states[2]).toEqual(at(10, 10));
    expect(r.touching).toEqual([true, true, false]);
  });

  it('입력 배열 순서대로 처리, 같은 입력이면 같은 결과(겹친 자리가 같아도 정해진 방향)', () => {
    const input = [at(0, 0), at(0, 0), at(0.5, 1.5)];
    const a = separateCars(input);
    expect(separateCars(input)).toEqual(a);
    expect(a.states[0]).not.toEqual(a.states[1]);
    expect(a.touching).toEqual([true, true, true]);
    expect(input).toEqual([at(0, 0), at(0, 0), at(0.5, 1.5)]); // 입력은 바꾸지 않음
  });
});
