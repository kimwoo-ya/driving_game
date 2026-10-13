export const TICK_HZ = 60;
export const MAX_TICKS_PER_FRAME = 8;

const MAX_FRAME_SEC = 0.25;
// 1/60·1/120 같은 간격을 더할 때 생기는 부동소수 오차로 틱이 한 프레임 밀리지 않게 함
const EPSILON_TICKS = 1e-6;

export function ticksForFrame(accSec: number, frameSec: number): { ticks: number; accSec: number } {
  const acc = accSec + Math.min(Math.max(frameSec, 0), MAX_FRAME_SEC);
  const ticks = Math.floor(acc * TICK_HZ + EPSILON_TICKS);
  if (ticks > MAX_TICKS_PER_FRAME) return { ticks: MAX_TICKS_PER_FRAME, accSec: 0 };
  return { ticks, accSec: Math.max(acc - ticks / TICK_HZ, 0) };
}

let ticking = true;
let acc = 0;
let last = 0;

export function startLoop(tick: () => void, draw: () => void): void {
  last = performance.now();
  const frame = (now: number) => {
    const frameSec = (now - last) / 1000;
    last = now;
    if (ticking) {
      const r = ticksForFrame(acc, frameSec);
      acc = r.accSec;
      for (let i = 0; i < r.ticks; i++) tick();
    }
    draw();
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

export function setTicking(on: boolean): void {
  if (on && !ticking) {
    last = performance.now();
    acc = 0;
  }
  ticking = on;
}
