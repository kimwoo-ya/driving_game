import { describe, expect, it } from 'vitest';
import { aiInput } from '../../src/race/ai';
import type { RaceCar } from '../../src/race/progress';
import { DRIVING_SPEC, type DriveState, restingAt, stepVehicle } from '../../src/sim/vehicle';

// 출발 직선: 중심선 x = 0, +Z 방향. 왼쪽(steer +) = +X, 주행선 laneOffset도 +가 +X
const PROFILE = { laneOffset: 3, targetSpeedRatio: 0.75, reactionTicks: 20 };
const car = (slot: 0 | 1 | 2 | 3, drive: DriveState, ai = PROFILE): RaceCar => ({
  slot,
  isPlayer: false,
  vehicle: 'jeep',
  drive,
  lapsDone: 0,
  nextCheckpoint: 1,
  status: 'normal',
  slowTicks: 0,
  stuckTicks: 0,
  finish: null,
  ai,
});
const moving = (x: number, z: number, speed: number, heading = 0): DriveState => ({ ...restingAt({ x, z, heading }), speed });

describe('aiInput (modules.md 6.3, FR-054·060)', () => {
  it('DriveInput 세 필드만 돌려주고, 같은 스냅숏이면 같은 결과·차 순서와 무관(무작위 없음)', () => {
    const me = car(0, moving(0, 10, 3, 0.2));
    const cars = [me, car(1, moving(3, 14, 0)), car(2, moving(-2, 30, 5))];
    const a = aiInput(me, cars, 100);
    expect(Object.keys(a).sort()).toEqual(['brake', 'steer', 'throttle']);
    expect(aiInput(me, cars, 100)).toEqual(a);
    expect(aiInput(me, [...cars].reverse(), 100)).toEqual(a);
  });

  it('reactionTicks 전에는 액셀을 누르지 않고, 그 뒤 목표 속도(targetSpeedRatio × 최고 속도) 아래면 누르고 넘으면 뗌', () => {
    const target = PROFILE.targetSpeedRatio * DRIVING_SPEC.maxForwardSpeed;
    expect(aiInput(car(0, moving(3, 6, 0)), [], PROFILE.reactionTicks - 1).throttle).toBe(false);
    expect(aiInput(car(0, moving(3, 6, 0)), [], PROFILE.reactionTicks).throttle).toBe(true);
    expect(aiInput(car(0, moving(3, 20, target - 0.1)), [], 500).throttle).toBe(true);
    expect(aiInput(car(0, moving(3, 20, target + 0.1)), [], 500).throttle).toBe(false);
    expect(aiInput(car(0, moving(3, 20, target + 0.1)), [], 500).brake).toBe(false);
  });

  it('laneOffset 주행선을 따라감: 중심선에서 출발해도 몇 초 뒤 x ≈ laneOffset, 속도 ≤ 목표', () => {
    for (const laneOffset of [-3, 0, 3]) {
      let me = car(0, restingAt({ x: 0, z: 2, heading: 0 }), { ...PROFILE, laneOffset, reactionTicks: 0 });
      for (let t = 0; t < 240; t++) me = { ...me, drive: stepVehicle(me.drive, aiInput(me, [me], t)) };
      expect(me.drive.z).toBeLessThan(50); // 아직 출발 직선
      expect(me.drive.x).toBeCloseTo(laneOffset, 0);
      expect(me.drive.speed).toBeLessThanOrEqual(PROFILE.targetSpeedRatio * DRIVING_SPEC.maxForwardSpeed + 0.1);
    }
  });

  it('앞 주행선이 막히면 옆 주행선으로 핸들을 꺾음(막은 차에서 먼 쪽)', () => {
    const me = car(0, moving(3, 10, 5));
    const free = aiInput(me, [me], 500).steer;
    expect(Math.abs(free)).toBeLessThan(0.05); // 제 주행선 위라 거의 직진
    const blockedAhead = car(1, moving(3, 15, 0));
    expect(aiInput(me, [me, blockedAhead], 500).steer).toBeLessThan(-0.3); // 막은 차가 +X 쪽 → 오른쪽(−)
    const blockedLeft = car(1, moving(-3, 15, 0));
    expect(aiInput({ ...me, drive: moving(-3, 10, 5), ai: { ...PROFILE, laneOffset: -3 } }, [blockedLeft], 500).steer).toBeGreaterThan(0.3);
    // 뒤에 있거나 멀리 있는 차는 막힘이 아님
    expect(aiInput(me, [me, car(1, moving(3, 6, 0)), car(2, moving(3, 40, 0))], 500).steer).toBeCloseTo(free);
  });
});
