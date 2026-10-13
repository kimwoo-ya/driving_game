import { describe, expect, it } from 'vitest';
import type { Rect } from '../../src/content/town';
import { blockByAreas } from '../../src/sim/collision';
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
