import { describe, expect, it } from 'vitest';
import { type HoldButton, pressedButtons, type ScreenRect, toDriveInput } from '../../src/input/controls';

const RECTS: Record<HoldButton, ScreenRect> = {
  left: { left: 0, top: 100, right: 50, bottom: 150 },
  right: { left: 60, top: 100, right: 110, bottom: 150 },
  accel: { left: 300, top: 100, right: 350, bottom: 150 },
  brake: { left: 240, top: 100, right: 290, bottom: 150 },
};
const pressed = (...pts: [number, number][]) => pressedButtons(pts.map(([x, y]) => ({ x, y })), RECTS);

describe('pressedButtons', () => {
  it('사각형 경계를 포함하고 밖의 점은 무시한다', () => {
    expect([...pressed([0, 100])]).toEqual(['left']);
    expect([...pressed([50, 150])]).toEqual(['left']);
    expect([...pressed([55, 125], [200, 10])]).toEqual([]);
  });

  it('점이 여러 개(손바닥)여도 같은 규칙', () => {
    expect([...pressed([10, 110], [20, 120], [30, 130], [310, 110], [500, 500])].sort()).toEqual(['accel', 'left']);
  });
});

describe('toDriveInput', () => {
  it('좌우 동시는 steer 0 (FR-015)', () => {
    expect(toDriveInput(new Set(['left', 'right'])).steer).toBe(0);
    expect(toDriveInput(new Set(['left'])).steer).toBe(1);
    expect(toDriveInput(new Set(['right'])).steer).toBe(-1);
  });

  it('액셀+브레이크 20회 모두 throttle false·brake true (SC-004)', () => {
    for (let i = 0; i < 20; i++) {
      expect(toDriveInput(pressed([310, 110], [250, 110]))).toEqual({ steer: 0, throttle: false, brake: true });
    }
  });

  it('액셀만 누르면 throttle true', () => {
    expect(toDriveInput(new Set(['accel']))).toEqual({ steer: 0, throttle: true, brake: false });
  });
});
