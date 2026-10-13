import { describe, expect, it } from 'vitest';
import { TRACK } from '../../src/content/track';
import { progressValue, type RaceCar, rankCars } from '../../src/race/progress';
import { restingAt } from '../../src/sim/vehicle';

// 자리표시 트랙(src/content/track.ts): (0,0)에서 +Z로 출발하는 모서리 깎은 직사각형 고리
const C = 10 * Math.SQRT2;
const L = 4 * C + 2 * 50 + 2 * 40 + 100; // 한 바퀴 길이
const CP = TRACK.checkpoints.map((c) => c.arc);

const car = (slot: 0 | 1 | 2 | 3, x: number, z: number, more: Partial<RaceCar> = {}): RaceCar => ({
  slot,
  isPlayer: slot === TRACK.playerSlot,
  vehicle: 'buggy',
  drive: restingAt({ x, z, heading: 0 }),
  lapsDone: 0,
  nextCheckpoint: 1,
  status: 'normal',
  slowTicks: 0,
  stuckTicks: 0,
  finish: null,
  ai: null,
  ...more,
});

describe('progressValue (data-model.md 7장, FR-057·059)', () => {
  it('lapsDone × L + 마지막 통과 체크포인트 arc + 그 구간 안 거리(옆으로 벗어나도 중심선에 투영)', () => {
    expect(progressValue(car(3, 3, 6))).toBeCloseTo(6);
    expect(progressValue(car(3, -3, 20, { lapsDone: 1 }))).toBeCloseTo(L + 20);
    // 1번 체크포인트(위 직선 가운데)를 지나 nextCheckpoint 2: 위 직선 (40, 60)은 arc 50 + C + 30
    expect(progressValue(car(0, 40, 61, { nextCheckpoint: 2 }))).toBeCloseTo(50 + C + 30);
    // 마지막 체크포인트를 지나 nextCheckpoint 0: 왼쪽 아래 깎은 모서리 뒤 (0, -20)은 arc L − 20
    expect(progressValue(car(0, 0, -20, { nextCheckpoint: 0 }))).toBeCloseTo(L - 20);
  });

  it('투영은 현재 구간(마지막 통과 체크포인트 → 다음 체크포인트)으로 제한 → 안쪽 가로지르기·결승선 뒤로는 늘지 않음 (FR-059)', () => {
    // 1번을 통과하지 않은 채 오른쪽 직선(arc 약 150)에 있어도 진행도는 1번 체크포인트를 넘지 않음
    expect(progressValue(car(0, 60, 18))).toBeLessThanOrEqual(CP[1] + 1e-9);
    // 2번 체크포인트 근처로 가로질러 와도 마찬가지
    expect(progressValue(car(0, 59, 0))).toBeLessThanOrEqual(CP[1] + 1e-9);
    // 출발 직후 결승선 뒤로 물러나면 L − 2가 아니라 0
    expect(progressValue(car(0, 0, -2))).toBeCloseTo(0);
  });
});

describe('rankCars (data-model.md 7장, FR-057)', () => {
  it('완주한 차가 앞, 완주끼리 finish.tick 작은 순 → overshoot 큰 순, 미완주는 진행도 큰 순', () => {
    const cars = [
      car(0, 0, 30),
      car(1, 0, 40),
      car(2, 0, 1, { status: 'finished', finish: { tick: 900, overshoot: 0.5 } }),
      car(3, 0, 1, { status: 'finished', finish: { tick: 900, overshoot: 0.7 } }),
    ];
    expect(rankCars(cars)).toEqual([3, 2, 1, 0]);
    cars[2] = { ...cars[2], finish: { tick: 899, overshoot: 0.1 } };
    expect(rankCars(cars)).toEqual([2, 3, 1, 0]);
  });

  it('그래도 같으면 플레이어 앞 → slot 작은 순', () => {
    // 플레이어 slot 3과 slot 0·1·2가 모두 같은 진행도
    expect(rankCars([car(0, -3, 6), car(1, 3, 6), car(2, 0, 6), car(3, 0, 6)])).toEqual([3, 0, 1, 2]);
    const done = { status: 'finished' as const, finish: { tick: 500, overshoot: 0.2 } };
    expect(rankCars([car(0, 0, 1, done), car(1, 0, 1, done), car(2, 0, 9), car(3, 0, 1, done)])).toEqual([3, 0, 1, 2]);
  });
});
