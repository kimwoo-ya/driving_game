import { describe, expect, it } from 'vitest';
import { SCENARIOS, type SegmentDef } from '../../src/content/scenarios';
import type { ScenarioEvent } from '../../src/practice/scenario';
import {
  FLASH_TICKS,
  initActors,
  POSE_TICKS,
  type SignalState,
  stepTownActors,
  STOP_MARGIN,
  type TownPedestrian,
} from '../../src/practice/townActors';
import { TICK_HZ } from '../../src/core/loop';
import { DRIVING_SPEC, type DriveState } from '../../src/sim/vehicle';

const SEG: SegmentDef = SCENARIOS[0].segments[0]; // signal-wait: 차 신호 + 짝 보행자 신호, 보행자 1명(pedestrianGreen)
const RED_AT = SEG.plan.redAtS!;
const GO_AT = SEG.plan.greenAfterStoppedTicks!;
const GAP = DRIVING_SPEC.maxForwardSpeed ** 2 / (2 * DRIVING_SPEC.brakeDeceleration) + STOP_MARGIN;
const POSES = new Set(['idle', 'walk', 'lookLeft', 'lookRight', 'raiseHand']);

type Actors = { signals: SignalState[]; pedestrians: TownPedestrian[] };
const drive = (speed: number): DriveState => ({ x: 0, z: 0, heading: 0, speed, gear: 'forward' });
const light = (a: Actors, id: string) => a.signals.find((s) => s.id === id)?.light;
const step = (a: Actors, frontS: number, stoppedTicks: number, speed: number, segment = SEG) =>
  stepTownActors({ segment, ...a, frontS, stoppedTicks, drive: drive(speed) });
const dedupe = <T>(xs: T[]) => xs.filter((x, i) => i === 0 || x !== xs[i - 1]);

/** 다가가기(최고 속도) → stopZone에서 멈춤 → 오래 기다림 → 출발. 틱마다 상태·이벤트 기록 */
function playSignalWait() {
  let a: Actors = initActors(SEG);
  const log: { a: Actors; events: ScenarioEvent[]; frontS: number; speed: number }[] = [];
  const tick = (frontS: number, stoppedTicks: number, speed: number) => {
    const r = step(a, frontS, stoppedTicks, speed);
    a = r;
    log.push({ a: r, events: r.events, frontS, speed });
  };
  const v = DRIVING_SPEC.maxForwardSpeed / TICK_HZ;
  let s = 0;
  for (; s < SEG.stopZone.toS - 1; s += v) tick(s, 0, DRIVING_SPEC.maxForwardSpeed);
  let stopped = 0;
  for (let i = 0; i < 2000; i++) tick(s, ++stopped, 0);
  for (; s < 70; s += v) tick(s, ++stopped, DRIVING_SPEC.maxForwardSpeed);
  return log;
}

describe('신호·등장 보행자 (modules.md 4.2)', () => {
  it('신호 기다리기 한 번: 차 초록 → 노랑 → 빨강 → 초록, 보행자 빨강 → 초록 → 깜빡임 → 빨강, 이벤트는 바뀐 틱마다', () => {
    const log = playSignalWait();
    expect(dedupe(log.map((t) => light(t.a, 'main-vehicle')))).toEqual(['green', 'yellow', 'red', 'green']);
    expect(dedupe(log.map((t) => light(t.a, 'main-pedestrian')))).toEqual(['red', 'green', 'flashing', 'red']);
    // 노랑은 redAtS를 지난 틱에, 빨강은 정지 구역에 들어온 틱에
    const yellowAt = log.findIndex((t) => light(t.a, 'main-vehicle') === 'yellow');
    expect(log[yellowAt].frontS).toBeGreaterThanOrEqual(RED_AT);
    expect(log[yellowAt - 1].frontS).toBeLessThan(RED_AT);
    const redAt = log.findIndex((t) => light(t.a, 'main-vehicle') === 'red');
    expect(log[redAt].frontS).toBeGreaterThanOrEqual(SEG.stopZone.fromS);
    expect(log[redAt - 1].frontS).toBeLessThan(SEG.stopZone.fromS);
    // 정지 구역 앞에서 멈춰도 노랑 → 빨강
    const early = step(step(initActors(SEG), RED_AT, 0, DRIVING_SPEC.maxForwardSpeed), SEG.stopZone.fromS - 5, 0, 0);
    expect(light(early, 'main-vehicle')).toBe('red');

    const changes = log.flatMap((t, i) =>
      t.a.signals
        .filter((s) => s.light !== (i === 0 ? initActors(SEG) : log[i - 1].a).signals.find((p) => p.id === s.id)!.light)
        .map((s) => ({ type: 'signalChanged', signal: s.id, light: s.light })),
    );
    expect(log.flatMap((t) => t.events)).toEqual(changes);
  });

  it('직진 차 신호 초록과 보행자 신호 초록은 같은 틱에 켜지지 않고, 차 초록은 건너는 사람이 없을 때만 (FR-042)', () => {
    for (const { a } of playSignalWait()) {
      const v = light(a, 'main-vehicle');
      expect(v === 'green' && light(a, 'main-pedestrian') === 'green').toBe(false);
      if (v === 'green') expect(a.pedestrians.some((p) => p.state === 'crossing')).toBe(false);
    }
  });

  it('보행자: 계획의 행동을 차례로 보인 뒤 걸어서 건너고, 자세는 CharacterPose뿐 (FR-039, FR-094)', () => {
    const log = playSignalWait();
    const peds = log.map((t) => t.a.pedestrians[0]);
    expect(dedupe(peds.map((p) => p.state))).toEqual(['waiting', 'crossing', 'crossed']);
    expect(peds.every((p) => POSES.has(p.pose))).toBe(true);
    // 건너기 직전에 계획의 행동을 끝까지 한 번(차가 가까이 달려오는 동안 시작했던 행동은 처음부터 다시), 행동 하나는 POSE_TICKS 동안
    const start = peds.findIndex((p) => p.state === 'crossing');
    const lastIdle = peds.slice(0, start).map((p) => p.pose).lastIndexOf('idle');
    expect(dedupe(peds.slice(lastIdle, start).map((p) => p.pose))).toEqual(['idle', ...SEG.plan.pedestrians[0].poses]);
    expect(peds.slice(lastIdle, start).filter((p) => p.pose === 'lookRight')).toHaveLength(POSE_TICKS);
    expect(dedupe(peds.slice(start).map((p) => p.pose))).toEqual(['walk', 'idle']);
    // 건너기 시작한 틱에 차는 멈췄거나 멈출 수 있는 거리
    expect(log[start].speed === 0 || SEG.stopLineS - log[start].frontS >= GAP).toBe(true);
    expect(peds.at(-1)!.pos).toEqual(SEG.plan.pedestrians[0].path.at(-1));
  });

  it('신호는 frontS·stoppedTicks로만 바뀐다: 같은 값이면 36,000틱 동안 그대로 (주기 없음, FR-040)', () => {
    let a: Actors = initActors(SEG);
    const events: ScenarioEvent[] = [];
    for (let i = 0; i < 36_000; i++) {
      const r = step(a, 0, 0, DRIVING_SPEC.maxForwardSpeed);
      a = r;
      events.push(...r.events);
    }
    expect(events).toEqual([]);

    // 정지 구역에서 멈춘 채 stoppedTicks가 그대로면: 노랑 → 빨강 → 보행자 초록 세 번만 바뀌고 끝
    a = initActors(SEG);
    const seen: ScenarioEvent[][] = [];
    for (let i = 0; i < 36_000; i++) {
      const r = step(a, SEG.stopZone.toS - 1, 1, 0);
      a = r;
      seen.push(r.events);
    }
    expect(seen.slice(0, 3).flat()).toEqual([
      { type: 'signalChanged', signal: 'main-vehicle', light: 'yellow' },
      { type: 'signalChanged', signal: 'main-vehicle', light: 'red' },
      { type: 'signalChanged', signal: 'main-pedestrian', light: 'green' },
    ]);
    expect(seen.slice(3).flat()).toEqual([]);
  });

  it('보행자는 차가 멈췄거나 최고 속도 제동 거리 + 여유 밖일 때만 건너기를 준비한다 (FR-039, FR-036)', () => {
    const green: Actors = {
      signals: [
        { id: 'main-vehicle', light: 'red' },
        { id: 'main-pedestrian', light: 'green' },
      ],
      pedestrians: initActors(SEG).pedestrians,
    };
    const after = (frontS: number, speed: number, ticks: number) => {
      let a = green;
      for (let i = 0; i < ticks; i++) a = { ...step(a, frontS, 0, speed), signals: green.signals };
      return a.pedestrians[0];
    };
    const near = after(SEG.stopLineS - GAP + 0.01, DRIVING_SPEC.maxForwardSpeed, 1000);
    expect([near.state, near.pose, near.ticks]).toEqual(['waiting', 'idle', 0]);
    expect(after(SEG.stopLineS - GAP, DRIVING_SPEC.maxForwardSpeed, 1).pose).toBe(SEG.plan.pedestrians[0].poses[0]);
    expect(after(SEG.stopLineS - 0.5, 0, 1).pose).toBe(SEG.plan.pedestrians[0].poses[0]);
    // 차가 다가와 가까워지면 준비하던 행동을 멈추고 처음부터 다시 기다림
    let a = green;
    for (let i = 0; i < POSE_TICKS * 2; i++) a = { ...step(a, 0, 0, 8), signals: green.signals };
    expect(a.pedestrians[0].ticks).toBe(POSE_TICKS * 2);
    a = step(a, SEG.stopLineS - 1, 0, 8);
    expect([a.pedestrians[0].state, a.pedestrians[0].pose, a.pedestrians[0].ticks]).toEqual(['waiting', 'idle', 0]);
    // playerStopped: 차가 멀리 있어도 멈추기 전(stoppedTicks 0)에는 준비하지 않음
    const quiet: SegmentDef = {
      ...SEG,
      signal: null,
      plan: { ...SEG.plan, pedestrianSignal: null, pedestrians: [{ ...SEG.plan.pedestrians[0], start: 'playerStopped' }] },
    };
    let q: Actors = initActors(quiet);
    for (let i = 0; i < 1000; i++) q = step(q, 0, 0, DRIVING_SPEC.maxForwardSpeed, quiet);
    expect([q.pedestrians[0].state, q.pedestrians[0].ticks]).toEqual(['waiting', 0]);
  });

  it('보행자 신호가 깜빡이면 새로 건너기 시작하지 않고, 이미 건너는 사람은 멈추지 않는다 (FR-043)', () => {
    const flashing = [
      { id: 'main-vehicle', light: 'red' },
      { id: 'main-pedestrian', light: 'flashing' },
    ] as SignalState[];
    for (const start of ['pedestrianGreen', 'playerStopped'] as const) {
      const seg: SegmentDef = { ...SEG, plan: { ...SEG.plan, pedestrians: [{ ...SEG.plan.pedestrians[0], start }] } };
      let a: Actors = { signals: flashing, pedestrians: initActors(seg).pedestrians };
      for (let i = 0; i < 1000; i++) a = { ...step(a, SEG.stopLineS - 1, 1, 0, seg), signals: flashing };
      expect(a.pedestrians[0].state).toBe('waiting');
    }

    const walking = { ...initActors(SEG).pedestrians[0], state: 'crossing' as const, pose: 'walk' as const, ticks: 10 };
    const r = step({ signals: flashing, pedestrians: [walking] }, SEG.stopLineS - 1, 1, 0);
    expect(r.pedestrians[0].state).toBe('crossing');
    expect(r.pedestrians[0].ticks).toBe(11);
  });

  it('보행자 신호가 없는 구간도 건너는 사람이 있으면 차 신호는 빨강 그대로', () => {
    const seg: SegmentDef = {
      ...SEG,
      plan: { ...SEG.plan, pedestrianSignal: null, pedestrians: [{ ...SEG.plan.pedestrians[0], start: 'playerStopped' }] },
    };
    const walking = { ...initActors(seg).pedestrians[0], state: 'crossing' as const, pose: 'walk' as const, ticks: 10 };
    const red: SignalState[] = [{ id: 'main-vehicle', light: 'red' }];
    expect(light(step({ signals: red, pedestrians: [walking] }, 37, GO_AT, 0, seg), 'main-vehicle')).toBe('red');
    const crossed = { ...walking, state: 'crossed' as const, pose: 'idle' as const, ticks: 0 };
    expect(light(step({ signals: red, pedestrians: [crossed] }, 37, GO_AT - 1, 0, seg), 'main-vehicle')).toBe('red');
    expect(light(step({ signals: red, pedestrians: [crossed] }, 37, GO_AT, 0, seg), 'main-vehicle')).toBe('green');
  });

  it('차 신호가 없는 구간의 보행자 신호는 초록 그대로, 보행자 신호 깜빡임은 진행 신호 FLASH_TICKS 전부터(건너기 전인 보행자가 있으면 미룸)', () => {
    const turning: SegmentDef = { ...SEG, signal: null };
    let a: Actors = initActors(turning);
    expect(a.signals).toEqual([{ id: 'main-pedestrian', light: 'green' }]);
    for (let i = 0; i < 2000; i++) a = step(a, 30, i, 0, turning);
    expect(light(a, 'main-pedestrian')).toBe('green');

    const red: Actors = { signals: [{ id: 'main-vehicle', light: 'red' }, { id: 'main-pedestrian', light: 'green' }], pedestrians: [] };
    expect(light(step(red, 30, GO_AT - FLASH_TICKS - 1, 0), 'main-pedestrian')).toBe('green');
    expect(light(step(red, 30, GO_AT - FLASH_TICKS, 0), 'main-pedestrian')).toBe('flashing');
    // 차가 살짝 움직여 보행자가 아직 출발하지 못했으면 깜빡이지 않음(깜빡임에는 새로 출발하지 않으므로, 사용자 결정 2026-10-12)
    const waiting: Actors = { ...red, pedestrians: initActors(SEG).pedestrians };
    expect(light(step(waiting, SEG.stopLineS - 1, GO_AT, 1), 'main-pedestrian')).toBe('green');
  });
});
