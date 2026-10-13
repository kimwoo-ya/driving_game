import { describe, expect, it } from 'vitest';
import { MAX_TICKS_PER_FRAME, ticksForFrame } from '../../src/core/loop';

function totalTicks(frames: readonly number[]): number {
  let acc = 0;
  let total = 0;
  for (const f of frames) {
    const r = ticksForFrame(acc, f);
    acc = r.accSec;
    total += r.ticks;
  }
  return total;
}

const repeat = (pattern: readonly number[], times: number) =>
  Array.from({ length: times }, () => pattern).flat();

describe('ticksForFrame', () => {
  it('프레임 간격을 0.25초로 자른다', () => {
    expect(ticksForFrame(0, 0.25)).toEqual(ticksForFrame(0, 5));
    expect(ticksForFrame(0, 0.1).ticks).toBe(6);
  });

  it('틱은 8개가 상한이고 넘친 누적 시간은 버린다', () => {
    const r = ticksForFrame(0, 0.25); // 15틱 분량
    expect(r).toEqual({ ticks: MAX_TICKS_PER_FRAME, accSec: 0 });
  });

  it('남은 누적 시간은 다음 프레임으로 넘긴다', () => {
    const a = ticksForFrame(0, 0.01); // 0.6틱
    expect(a.ticks).toBe(0);
    const b = ticksForFrame(a.accSec, 0.01); // 1.2틱
    expect(b.ticks).toBe(1);
  });

  it('간격 8.3/16.7/33.3 ms와 불규칙 간격으로 같은 2초를 돌리면 총 틱 수가 같다 (FR-022, FR-074)', () => {
    const results = [
      totalTicks(repeat([1 / 120], 240)),
      totalTicks(repeat([1 / 60], 120)),
      totalTicks(repeat([1 / 30], 60)),
      totalTicks(repeat([0.005, 0.015, 0.03], 40)), // 0.05초 × 40
    ];
    expect(results).toEqual([120, 120, 120, 120]);
  });
});
