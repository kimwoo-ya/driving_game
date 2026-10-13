import { describe, expect, it, vi } from 'vitest';
import { type ScenarioDef, SCENARIOS, type ScenarioId } from '../../src/content/scenarios';
import { TOWN } from '../../src/content/town';
import { pickRules } from '../../src/practice/ruleRotation';
import {
  DEMO_AFTER_FAILS,
  EXPLAIN_TICKS,
  IDLE_HINT_TICKS,
  type ScenarioAttempt,
  type ScenarioEvent,
  startScenario,
  stepScenario,
} from '../../src/practice/scenario';
import { initActors } from '../../src/practice/townActors';
import { overlaps } from '../../src/sim/collision';
import { DRIVING_SPEC, type DriveInput, type DriveState, restingAt, type Vec2 } from '../../src/sim/vehicle';

const IDLE: DriveInput = { steer: 0, throttle: false, brake: false };
const GAS: DriveInput = { steer: 0, throttle: true, brake: false };
const BRAKE: DriveInput = { steer: 0, throttle: false, brake: true };
const RIGHT_GAS: DriveInput = { steer: -1, throttle: true, brake: false };

const SW = SCENARIOS[0]; // signal-wait: x = −2에서 +Z로 곧게 뻗은 경로
const SEG = SW.segments[0];
const HALF = DRIVING_SPEC.bodyLength / 2;
const frontS = (s: ScenarioAttempt) => s.drive.z + HALF; // 곧은 경로, heading 0
const corners = ({ drive: d }: ScenarioAttempt) =>
  [1, -1].map((k) => ({
    x: d.x + Math.sin(d.heading) * HALF + k * Math.cos(d.heading) * DRIVING_SPEC.bodyRadius,
    z: d.z + Math.cos(d.heading) * HALF - k * Math.sin(d.heading) * DRIVING_SPEC.bodyRadius,
  })); // 차체 앞쪽 두 모서리

type Driver = (s: ScenarioAttempt, tick: number) => { input: DriveInput; tap?: boolean };
type Tick = { before: ScenarioAttempt; after: ScenarioAttempt; events: ScenarioEvent[] };

function run(state: ScenarioAttempt, ticks: number, driver: Driver, until?: (s: ScenarioAttempt) => boolean) {
  const log: Tick[] = [];
  for (let t = 0; t < ticks && !until?.(state); t++) {
    const { input, tap = false } = driver(state, t);
    const r = stepScenario(state, input, tap);
    log.push({ before: state, after: r.state, events: r.events });
    state = r.state;
  }
  return { state, log, events: log.flatMap((l) => l.events) };
}
const start = (id: ScenarioId = SW.id) => startScenario(id, pickRules(id, false, 0)).state;
const hold = (input: DriveInput): Driver => () => ({ input });
const actionOf = (s: ScenarioAttempt) => SW.segments[s.segment].steps[s.step].action;

// 경로(꺾은선) 위 거리 s ↔ 점
function pathS(path: readonly Vec2[], p: Vec2): number {
  let best = { s: 0, off: Infinity };
  let acc = 0;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1];
    const b = path[i];
    const len = Math.hypot(b.x - a.x, b.z - a.z);
    const t = Math.min(Math.max(((p.x - a.x) * (b.x - a.x) + (p.z - a.z) * (b.z - a.z)) / (len * len), 0), 1);
    const off = Math.hypot(p.x - (a.x + (b.x - a.x) * t), p.z - (a.z + (b.z - a.z) * t));
    if (off < best.off) best = { s: acc + t * len, off };
    acc += len;
  }
  return best.s;
}
function pointAt(path: readonly Vec2[], s: number): Vec2 {
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1];
    const b = path[i];
    const len = Math.hypot(b.x - a.x, b.z - a.z);
    if (s <= len || i === path.length - 1) return { x: a.x + ((b.x - a.x) * s) / len, z: a.z + ((b.z - a.z) * s) / len };
    s -= len;
  }
  return path[path.length - 1];
}
const frontOf = (d: DriveState) => ({ x: d.x + Math.sin(d.heading) * HALF, z: d.z + Math.cos(d.heading) * HALF });

/** 경로의 4 m 앞 점을 향해 조향 */
function steerAlong(path: readonly Vec2[], d: DriveState): number {
  const aim = pointAt(path, pathS(path, frontOf(d)) + 4);
  const turn = Math.atan2(aim.x - d.x, aim.z - d.z) - d.heading;
  return Math.min(Math.max(Math.atan2(Math.sin(turn), Math.cos(turn)) * 3, -1), 1);
}

/** 어느 상황이든 올바른 행동: 경로를 따라 조향, 정지 구역 가운데(또는 stopAt)에 멈춤 → 기다림 → 출발 */
const correctFor =
  (def: ScenarioDef, stopAt?: number): Driver =>
  (s) => {
    if (s.phase !== 'driving') return { input: IDLE };
    const seg = def.segments[s.segment];
    const fs = pathS(seg.path, frontOf(s.drive));
    const steer = steerAlong(seg.path, s.drive);
    const a = seg.steps[s.step].action;
    if (a === 'wait') return { input: BRAKE };
    if (a === 'go') return { input: { steer, throttle: true, brake: false } };
    const brakeDist = s.drive.speed ** 2 / (2 * DRIVING_SPEC.brakeDeceleration);
    const goOn = fs + brakeDist < (stopAt ?? (seg.stopZone.fromS + seg.stopZone.toS) / 2);
    return { input: { steer, throttle: goOn, brake: !goOn } };
  };

/** 신호 기다리기 올바른 행동: 정지 구역에서 멈춤 → 진행 신호까지 브레이크 → 출발 */
const correct: Driver = (s) => {
  if (s.phase !== 'driving') return { input: IDLE };
  const a = actionOf(s);
  if (a === 'stop') return { input: frontS(s) < 28 ? GAS : BRAKE };
  return { input: a === 'wait' ? BRAKE : GAS };
};

describe('안전 상황 운전 단계 (modules.md 4.4, events.md 7.1, T048)', () => {
  it('시작: 첫 구간 시작 자세·신호·보행자, 첫 단계 hint', () => {
    const { state, events } = startScenario('signal-wait', pickRules('signal-wait', false, 0));
    expect(events).toEqual([{ type: 'hint', cue: 'stop', repeat: false }]);
    expect(state).toMatchObject({ phase: 'driving', segment: 0, step: 0, viewDone: false, failStreak: 0 });
    expect(state.drive).toEqual(restingAt(SEG.start));
    expect({ signals: state.signals, pedestrians: state.pedestrians }).toEqual(initActors(SEG));
  });

  it('SC-008: 세 상황 × 무입력·액셀만·브레이크만·후진만 × 36,000틱 동안 완료 0', () => {
    const drivers: Driver[] = [hold(IDLE), hold(GAS), hold(BRAKE), (_, t) => ({ input: IDLE, tap: t % 30 === 0 })];
    for (const { id } of SCENARIOS) {
      for (const d of drivers) {
        const r = run(start(id), 36_000, d);
        expect(r.events.some((e) => e.type === 'scenarioCompleted')).toBe(false);
        expect(r.state.phase).not.toBe('done');
      }
    }
  });

  it('끝 지점에 있어도, 다음 단계 조건이 먼저 맞아도 지금 단계를 하지 않으면 넘어가지 않음 (FR-032)', () => {
    // 시작 때 차 신호는 초록(wait 조건)이고 차는 멈춰 있지만 지금 단계는 stop
    expect(run(start(), 1, hold(IDLE)).state.step).toBe(0);
    // 경로 끝에 세워 둬도(go 조건) 완료 아님
    const atEnd = { ...start(), drive: restingAt({ x: -2, z: 70, heading: 0 }) };
    const r = run(atEnd, 600, hold(BRAKE));
    expect(r.events.some((e) => e.type === 'scenarioCompleted')).toBe(false);
  });

  it('무입력은 IDLE_HINT_TICKS마다 지금 단계 hint(repeat), 실패 아님 (FR-031)', () => {
    const r = run(start(), IDLE_HINT_TICKS * 3, hold(IDLE));
    expect(r.events).toEqual(Array(3).fill({ type: 'hint', cue: 'stop', repeat: true }));
    expect(r.state).toMatchObject({ phase: 'driving', failStreak: 0 });
  });

  it('후진 탭은 driving에서 멈췄을 때만 기어를 바꿈', () => {
    expect(stepScenario(start(), IDLE, true).state.drive.gear).toBe('reverse');
    const moving = run(start(), 30, hold(GAS)).state;
    expect(stepScenario(moving, GAS, true).state.drive.gear).toBe('forward');
  });
});

describe('잘못된 행동 → 위험 직전 멈춤 → 구간 다시 (T049)', () => {
  const firstViolation = (s: ScenarioAttempt, d: Driver) => run(s, 5000, d, (x) => x.phase === 'explaining');

  it('signal-wait의 4종: ranRed, earlyStart, overStopLine, enteredSidewalk → violation, EXPLAIN_TICKS 뒤 segmentReset (SC-010)', () => {
    const kinds: Record<string, Driver> = {
      ranRed: hold(GAS),
      earlyStart: (s) => ({ input: actionOf(s) === 'stop' ? correct(s, 0).input : GAS }),
      // 정지 구역보다 앞에서 한 번 멈춘 뒤 빨강에 정지선을 넘음
      overStopLine: (s) => ({ input: s.stoppedOnce ? GAS : frontS(s) < 18 ? GAS : BRAKE }),
      enteredSidewalk: hold(RIGHT_GAS),
    };
    for (const [kind, driver] of Object.entries(kinds)) {
      const v = firstViolation(start(), driver);
      expect([kind, v.events.at(-1)]).toEqual([kind, { type: 'violation', kind }]);
      expect(v.state).toMatchObject({ phase: 'explaining', violation: kind });
      const reset = run(v.state, EXPLAIN_TICKS, () => ({ input: GAS, tap: true }));
      expect(reset.events).toEqual([{ type: 'segmentReset' }, { type: 'hint', cue: 'stop', repeat: false }]);
      expect(reset.log.slice(0, -1).every((l) => l.after.drive === v.state.drive)).toBe(true); // 설명 중 차 멈춤·입력 무시
    }
  });

  it('어느 틱에도 앞 끝이 정지선을 넘거나 차체가 보도에 들어가지 않음 (FR-036)', () => {
    const sidewalks = TOWN.areas.filter((a) => a.kind === 'sidewalk').map((a) => a.rect);
    const drivers = [hold(GAS), hold(RIGHT_GAS), hold({ steer: 1, throttle: true, brake: false }), hold({ steer: 0.02, throttle: true, brake: false })];
    for (const d of drivers) {
      for (const { after } of run(start(), 6000, d).log) {
        if (actionOf(after) !== 'go') expect(corners(after).every((c) => c.z <= SEG.stopLineS + 1e-9)).toBe(true);
        expect(sidewalks.some((r) => overlaps(after.drive, r))).toBe(false);
      }
    }
  });

  it('위반 틱의 이벤트 순서: 신호 변화 뒤 violation이 마지막, 그 틱에 차는 이전 자리에 speed 0 (events.md 7.1-4)', () => {
    const v = firstViolation(start(), hold(GAS));
    const last = v.log.at(-1)!;
    expect(last.events.at(-1)).toEqual({ type: 'violation', kind: 'ranRed' });
    expect(last.events.slice(0, -1).every((e) => e.type === 'signalChanged')).toBe(true);
    expect(last.after.drive).toEqual({ ...last.before.drive, speed: 0 });
  });

  it('구간 다시: restingAt(start)·신호·보행자 처음, viewDone 유지, failStreak + 1, DEMO_AFTER_FAILS부터 demoReplay', () => {
    let s: ScenarioAttempt = { ...start(), viewDone: true };
    for (let n = 1; n <= DEMO_AFTER_FAILS + 1; n++) {
      const v = firstViolation(s, hold(GAS));
      const r = run(v.state, EXPLAIN_TICKS, hold(IDLE));
      s = r.state;
      expect(s).toMatchObject({ phase: 'driving', segment: 0, step: 0, viewDone: true, failStreak: n, violation: null });
      expect(s.drive).toEqual(restingAt(SEG.start));
      expect({ signals: s.signals, pedestrians: s.pedestrians }).toEqual(initActors(SEG));
      const demo = r.events.some((e) => e.type === 'demoReplay');
      expect(demo).toBe(n >= DEMO_AFTER_FAILS);
      if (demo) expect(r.events.slice(-2)).toEqual([{ type: 'demoReplay', cue: 'stop' }, { type: 'hint', cue: 'stop', repeat: false }]);
    }
  });
});

describe('경로 문제는 실패가 아님 (T050, FR-034, FR-035)', () => {
  it('stoppedTooFar: 정지 구역 앞에서 멈추면 hint closer, 단계·failStreak 그대로', () => {
    const r = run(start(), 2000, (s) => ({ input: frontS(s) < 18 ? GAS : BRAKE }), (s) => s.drive.speed === 0 && s.stoppedOnce);
    expect(r.events.filter((e) => e.type === 'hint')).toEqual([{ type: 'hint', cue: 'closer', repeat: false }]);
    expect(r.state).toMatchObject({ phase: 'driving', step: 0, failStreak: 0 });
  });

  it('wrongWay: 회전 대신 직진해 경로에서 벗어나기 시작한 틱에 hint way 1번', () => {
    const r = run(start('turning-car'), 2000, hold(GAS), (s) => s.drive.z > 54);
    expect(r.events.filter((e) => e.type === 'hint')).toEqual([{ type: 'hint', cue: 'way', repeat: false }]);
    expect(r.state).toMatchObject({ phase: 'driving', failStreak: 0 });
    // 계속 직진하면 경로에서 더 벗어나 구간 다시(leftPath)
    expect(run(r.state, 600, hold(GAS)).events).toContainEqual({ type: 'redirect', issue: 'leftPath' });
  });

  it('leftPath: 후진으로 구간 시작 뒤로 벗어나면 redirect, 구간 처음, failStreak 그대로', () => {
    const backed = run(start(), 1, () => ({ input: IDLE, tap: true })).state;
    const r = run({ ...backed, failStreak: 2 }, 600, hold(GAS), (s) => s.drive.gear === 'forward');
    expect(r.events.at(-1)).toEqual({ type: 'redirect', issue: 'leftPath' });
    expect(r.state).toMatchObject({ phase: 'driving', step: 0, failStreak: 2 });
    expect(r.state.drive).toEqual(restingAt(SEG.start));
  });

  it('blocked: 건물에 닿은 채 IDLE_HINT_TICKS 동안 진행이 없으면 redirect', async () => {
    // 실제 구간은 모두 보도로 둘러싸여 보도 진입(위반)이 먼저라, 판정 목록을 비운 시험용 signal-wait로 건물(x ≤ −8)까지 감
    vi.resetModules();
    vi.doMock('../../src/content/scenarios', async (original) => {
      const m = await original<typeof import('../../src/content/scenarios')>();
      const seg = { ...m.SCENARIOS[0].segments[0], violations: [] };
      return { ...m, SCENARIOS: [{ ...m.SCENARIOS[0], segments: [seg] }, ...m.SCENARIOS.slice(1)] };
    });
    const sc = await import('../../src/practice/scenario');
    let s = sc.startScenario('signal-wait', pickRules('signal-wait', false, 0)).state;
    let blockedBefore = 0;
    let redirect: ScenarioEvent | undefined;
    for (let t = 0; t < 2000 && !redirect; t++) {
      blockedBefore = s.blockedTicks;
      const r = sc.stepScenario(s, RIGHT_GAS, false);
      redirect = r.events.find((e) => e.type === 'redirect');
      s = r.state;
    }
    vi.doUnmock('../../src/content/scenarios');
    vi.resetModules();
    expect(redirect).toEqual({ type: 'redirect', issue: 'blocked' });
    expect(blockedBefore).toBe(IDLE_HINT_TICKS - 1); // 닿은 채 진행 없는 틱이 이어져 IDLE_HINT_TICKS번째에
    expect(s.drive).toEqual(restingAt(SEG.start));
  });
});

describe('세 상황 완료와 남은 잘못된 행동 2종 (T056)', () => {
  it('SC-009: 세 상황 모두 올바른 행동 스크립트로 완료 3/3', () => {
    for (const def of SCENARIOS) {
      const r = run(start(def.id), 30_000, correctFor(def), (s) => s.phase === 'done');
      expect([def.id, r.state.phase]).toEqual([def.id, 'done']);
      expect(r.events.filter((e) => e.type === 'violation' || e.type === 'redirect')).toEqual([]);
      expect(r.events.at(-1)).toEqual({ type: 'scenarioCompleted', scenario: def.id });
    }
  });

  it('SC-010: 보행자가 건너는 중 횡단보도로 들어가려 하면 enteredCrosswalkWithPedestrian·turnedIntoCrossingPedestrian', () => {
    const cases = [
      ['crossing-check', 'enteredCrosswalkWithPedestrian'],
      ['turning-car', 'turnedIntoCrossingPedestrian'],
    ] as const;
    for (const [id, kind] of cases) {
      const def = SCENARIOS.find((d) => d.id === id)!;
      // 올바르게 멈춘 뒤, 보행자가 건너기 시작하면 액셀
      const crossing = run(start(id), 30_000, correctFor(def), (s) => s.pedestrians.some((p) => p.state === 'crossing')).state;
      const gas: Driver = (s) => ({ input: { steer: steerAlong(def.segments[0].path, s.drive), throttle: true, brake: false } });
      const v = run(crossing, 600, gas, (s) => s.phase === 'explaining');
      expect(v.events.at(-1)).toEqual({ type: 'violation', kind });
      const reset = run(v.state, EXPLAIN_TICKS, hold(IDLE));
      expect(reset.events).toEqual([{ type: 'segmentReset' }, { type: 'hint', cue: 'stop', repeat: false }]);
    }
  });
});

describe('B7 검증 지적 재현 (사용자 결정 2026-10-12)', () => {
  const ok = (r: { events: ScenarioEvent[] }) => r.events.filter((e) => e.type === 'violation' || e.type === 'redirect');

  it('crossing-check: 횡단보도 3 m 앞에서 멈춘 뒤 살짝 움직이기를 반복해도, 기다리면 보행자가 다 건너고 완료 (FR-045, FR-031)', () => {
    const def = SCENARIOS.find((d) => d.id === 'crossing-check')!;
    const fine = correctFor(def, 37);
    // 멈춘 뒤 1.5초마다 액셀 3틱(5번) → 그 뒤로는 기다림
    const creep: Driver = (s, t) =>
      s.phase === 'driving' && s.step > 0 && s.stoppedTicks <= 450 && s.stoppedTicks % 90 < 3 ? { input: GAS } : fine(s, t);
    const r = run(start('crossing-check'), 30_000, creep, (s) => s.phase === 'done');
    expect(r.state.phase).toBe('done');
    expect(ok(r)).toEqual([]);
  });

  it('turning-car: 회전하기 전(교차로 앞)에 멈춰도 정지로 인정하고 완료 (FR-046, US2-7)', () => {
    const def = SCENARIOS.find((d) => d.id === 'turning-car')!;
    const r = run(start('turning-car'), 30_000, correctFor(def, 44), (s) => s.phase === 'done');
    expect(r.state.phase).toBe('done');
    expect(ok(r)).toEqual([]);
    expect(r.events).not.toContainEqual({ type: 'hint', cue: 'closer', repeat: false });
  });

  it('turning-car: 차선 안 어느 자리에서 곧장 가도 실패가 아니라 방향 안내 → 구간 다시 (FR-034)', () => {
    // 차체 원(반지름 1 m)이 오른쪽 보도(x ≤ 116)에 닿지 않는 차선 안 + 교차로 안에서 오른쪽으로 쏠린 차(116.6, 44)
    for (const [x, z] of [[117.05, 0], [117.3, 0], [118, 0], [119, 0], [116.6, 44]]) {
      const s = { ...start('turning-car'), drive: restingAt({ x, z, heading: 0 }) };
      const r = run(s, 1500, hold(GAS), (st) => st.drive.z < 1 && st !== s && st.drive.speed === 0);
      expect([x, r.events.filter((e) => e.type === 'violation')]).toEqual([x, []]);
      expect(r.events).toContainEqual({ type: 'hint', cue: 'way', repeat: false });
      expect(r.events).toContainEqual({ type: 'redirect', issue: 'leftPath' });
    }
  });
});

describe('보행자 시점 안내 연결 (T051)', () => {
  it('signal-wait 올바른 행동: 멈춤 → 기다림 → 안내 끝까지 → 출발 → 완료', () => {
    const r = run(start(), 20_000, correct, (s) => s.phase === 'done');
    expect(r.state.phase).toBe('done');
    const types = r.events.filter((e) => e.type !== 'signalChanged' && e.type !== 'cardShown').map((e) => e.type);
    expect(types).toEqual(['hint', 'pedestrianViewStart', 'ended', 'hint', 'scenarioCompleted']);
    expect(r.events.filter((e) => e.type === 'hint')).toEqual([
      { type: 'hint', cue: 'wait', repeat: false },
      { type: 'hint', cue: 'go', repeat: false },
    ]);
    const viewStart = r.log.find((l) => l.events.some((e) => e.type === 'pedestrianViewStart'))!;
    expect(viewStart.after.drive.speed).toBe(0);
    expect(r.events.filter((e) => e.type === 'cardShown')).toHaveLength(pickRules('signal-wait', false, 0).rules.length);
    const carLight = (s: ScenarioAttempt) => s.signals.find((x) => x.id === SEG.signal)!.light;
    expect(carLight(viewStart.after)).toBe('green'); // wait는 진행 신호 뒤에만 끝남
    expect(carLight(r.state)).toBe('green'); // 출발 뒤에도 다시 노랑이 되지 않음(stoppedTicks가 줄지 않음)
    expect(frontS(r.state)).toBeGreaterThanOrEqual(SEG.path.at(-1)!.z); // 경로 끝에 닿아야 완료
    expect(stepScenario(r.state, GAS, true)).toEqual({ state: r.state, events: [] }); // done은 no-op
  });

  it('안내 중에는 운전 입력·후진 탭을 무시 (FR-041, US2-14)', () => {
    const inView = run(start(), 20_000, correct, (s) => s.phase === 'pedestrianView').state;
    const r = run(inView, 30, () => ({ input: GAS, tap: true }));
    expect(r.log.every((l) => l.after.drive === inView.drive)).toBe(true);
    expect(r.state.phase).toBe('pedestrianView');
  });

  it('운전 행동을 다 해도 안내를 끝까지 보기 전에는 완료가 아님 (US2-15)', () => {
    const r = run(start(), 20_000, correct, (s) => s.phase === 'pedestrianView');
    const mid = run(r.state, SW.pedestrianView.introTicks + 10, hold(IDLE));
    expect([...r.events, ...mid.events].some((e) => e.type === 'scenarioCompleted')).toBe(false);
    expect(mid.state.viewDone).toBe(false);
  });

  it('구간을 다시 해도 이미 끝낸 안내는 다시 나오지 않음 (B10)', () => {
    const after = run(start(), 20_000, correct, (s) => s.viewDone).state;
    expect(after).toMatchObject({ step: 2, viewDone: true });
    const v = run(after, 3000, hold(RIGHT_GAS), (s) => s.phase === 'explaining');
    const again = run(run(v.state, EXPLAIN_TICKS, hold(IDLE)).state, 20_000, correct, (s) => s.phase === 'done');
    expect(again.events.some((e) => e.type === 'pedestrianViewStart')).toBe(false);
    expect(again.state.phase).toBe('done');
  });
});
