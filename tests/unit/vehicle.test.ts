import { describe, expect, it } from 'vitest';
import { ticksForFrame } from '../../src/core/loop';
import {
  DRIVING_SPEC,
  type DriveInput,
  type DriveState,
  requestGearToggle,
  restingAt,
  stepVehicle,
} from '../../src/sim/vehicle';

const IDLE: DriveInput = { steer: 0, throttle: false, brake: false };
const GAS: DriveInput = { steer: 0, throttle: true, brake: false };
const BRAKE: DriveInput = { steer: 0, throttle: false, brake: true };
const start = restingAt({ x: 0, z: 0, heading: 0 });

function run(state: DriveState, input: DriveInput, ticks: number): DriveState {
  for (let i = 0; i < ticks; i++) state = stepVehicle(state, input);
  return state;
}

describe('stepVehicle', () => {
  it('액셀·브레이크 동시 입력은 브레이크로 처리한다 (SC-004 20/20)', () => {
    const moving = run(start, GAS, 120);
    let both = moving;
    let brakeOnly = moving;
    for (let i = 0; i < 20; i++) {
      const next = stepVehicle(both, { steer: 0, throttle: true, brake: true });
      expect(next.speed).toBeLessThanOrEqual(both.speed);
      both = next;
      brakeOnly = stepVehicle(brakeOnly, BRAKE);
    }
    expect(both).toEqual(brakeOnly);
  });

  it('steer는 [-1, 1]로 자른다', () => {
    const moving = run(start, GAS, 60);
    expect(stepVehicle(moving, { ...GAS, steer: 5 })).toEqual(stepVehicle(moving, { ...GAS, steer: 1 }));
    expect(stepVehicle(moving, { ...GAS, steer: -5 })).toEqual(stepVehicle(moving, { ...GAS, steer: -1 }));
  });

  it('페달을 떼면 감속하다가 stopSnapSpeed 아래에서 정확히 0이 된다', () => {
    let s = run(start, GAS, 120);
    let prev = s.speed;
    let ticks = 0;
    while (s.speed > 0 && ticks < 10_000) {
      s = stepVehicle(s, IDLE);
      expect(s.speed).toBeLessThan(prev);
      if (s.speed > 0) expect(s.speed).toBeGreaterThanOrEqual(DRIVING_SPEC.stopSnapSpeed);
      prev = s.speed;
      ticks++;
    }
    expect(s.speed).toBe(0);
    expect(run(s, IDLE, 60)).toEqual(s);
  });

  it('방향별 최고 속도를 넘지 않는다', () => {
    expect(run(start, GAS, 3600).speed).toBe(DRIVING_SPEC.maxForwardSpeed);
    const reversed = requestGearToggle(start).state;
    expect(run(reversed, GAS, 3600).speed).toBe(DRIVING_SPEC.maxReverseSpeed);
  });

  it('후진은 뒤로 움직이고 전진은 앞(+Z)으로 움직인다', () => {
    expect(run(start, GAS, 60).z).toBeGreaterThan(0);
    expect(run(requestGearToggle(start).state, GAS, 60).z).toBeLessThan(0);
  });
});

describe('requestGearToggle', () => {
  it('정지 중 20회 연타는 20/20 전환되고 표시와 상태가 같다 (SC-004)', () => {
    let s = start;
    for (let i = 0; i < 20; i++) {
      const r = requestGearToggle(s);
      expect(r.accepted).toBe(true);
      expect(r.state.gear).toBe(i % 2 === 0 ? 'reverse' : 'forward');
      s = r.state;
    }
  });

  it('주행 중 20회는 0/20 전환되고 상태가 그대로다 (SC-004)', () => {
    const moving = run(start, GAS, 60);
    for (let i = 0; i < 20; i++) {
      const r = requestGearToggle(moving);
      expect(r.accepted).toBe(false);
      expect(r.state).toBe(moving);
    }
  });

  it('거절된 요청을 기억하지 않는다 (FR-018)', () => {
    const moving = run(start, GAS, 60);
    expect(requestGearToggle(moving).accepted).toBe(false);
    const stopped = run(moving, BRAKE, 600);
    expect(stopped.speed).toBe(0);
    expect(stopped.gear).toBe('forward');
  });
});

describe('restingAt', () => {
  it('전진·정지 상태로 세운다 (FR-019)', () => {
    expect(restingAt({ x: 3, z: -2, heading: 1 })).toEqual({ x: 3, z: -2, heading: 1, speed: 0, gear: 'forward' });
  });
});

describe('SC-002 프레임 간격과 무관한 결정성', () => {
  type Tick = { input: DriveInput; gearTap: boolean };
  // 틱 번호로 짠 입력: 가속 → 가속하며 왼쪽 회전 → 직진 → 제동 → 후진 전환 → 후진 가속
  function script(t: number): Tick {
    if (t < 300) return { input: GAS, gearTap: false };
    if (t < 420) return { input: { ...GAS, steer: 1 }, gearTap: false };
    if (t < 480) return { input: GAS, gearTap: false };
    if (t < 720) return { input: BRAKE, gearTap: false };
    if (t === 720) return { input: IDLE, gearTap: true };
    return { input: GAS, gearTap: false };
  }
  const TOTAL = 1200;

  function drive(frames: readonly number[]) {
    const trace: DriveState[] = [];
    let s = start;
    let acc = 0;
    let t = 0;
    for (let f = 0; t < TOTAL; f = (f + 1) % frames.length) {
      const r = ticksForFrame(acc, frames[f]);
      acc = r.accSec;
      for (let i = 0; i < r.ticks && t < TOTAL; i++, t++) {
        const { input, gearTap } = script(t);
        if (gearTap) s = requestGearToggle(s).state;
        s = stepVehicle(s, input);
        trace.push(s);
      }
    }
    return trace;
  }

  function measure(trace: readonly DriveState[]) {
    const dist = (a: DriveState, b: DriveState) => Math.hypot(b.x - a.x, b.z - a.z);
    const brakeStart = trace[479];
    const stopTick = trace.findIndex((s, i) => i >= 480 && s.speed === 0);
    const turn = trace.slice(300, 420);
    let turnDist = 0;
    for (let i = 1; i < turn.length; i++) turnDist += dist(turn[i - 1], turn[i]);
    return {
      maxForwardSpeed: Math.max(...trace.slice(0, 480).map((s) => s.speed)),
      stopDistance: dist(brakeStart, trace[stopTick]),
      turningRadius: turnDist / (turn[turn.length - 1].heading - turn[0].heading),
      maxReverseSpeed: Math.max(...trace.slice(721).map((s) => s.speed)),
      passTick: trace.findIndex((s) => s.z >= 20),
    };
  }

  it('8.3/16.7/33.3 ms·불규칙 간격에서 궤적과 측정값이 완전히 같다', () => {
    const intervals = [[1 / 120], [1 / 60], [1 / 30], [0.005, 0.015, 0.03, 0.011, 0.04]];
    const traces = intervals.map(drive);
    const metrics = traces.map(measure);
    for (let i = 1; i < traces.length; i++) {
      expect(traces[i]).toEqual(traces[0]);
      expect(metrics[i]).toEqual(metrics[0]);
    }
    expect(metrics[0].maxForwardSpeed).toBe(DRIVING_SPEC.maxForwardSpeed);
    expect(metrics[0].maxReverseSpeed).toBe(DRIVING_SPEC.maxReverseSpeed);
    expect(metrics[0].stopDistance).toBeGreaterThan(0);
    expect(metrics[0].turningRadius).toBeGreaterThan(0);
    expect(metrics[0].passTick).toBeGreaterThan(0);
  });
});
