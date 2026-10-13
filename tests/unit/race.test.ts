import { afterEach, describe, expect, it, vi } from 'vitest';
import { TRACK, type TrackDef } from '../../src/content/track';
import { VEHICLES } from '../../src/content/vehicles';
import { TICK_HZ } from '../../src/core/loop';
import { progressValue, type RaceCar, rankCars, STUCK_TICKS } from '../../src/race/progress';
import {
  CONTACT_SLOW_TICKS,
  COUNTDOWN_TICKS,
  createRace,
  finishResult,
  formatRecord,
  type RaceEvent,
  type RaceState,
  stepRace,
  trackConfigKey,
} from '../../src/race/race';
import { pointOnTrack, projectOnTrack, trackLength } from '../../src/sim/collision';
import { DRIVING_SPEC, type DriveInput, type DriveState, restingAt } from '../../src/sim/vehicle';
import { MAX_RECORD_CS } from '../../src/storage/save';

const IDLE: DriveInput = { steer: 0, throttle: false, brake: false };
const GAS: DriveInput = { steer: 0, throttle: true, brake: false };
const BRAKE: DriveInput = { steer: 0, throttle: false, brake: true };
const P = TRACK.playerSlot;
const CP = TRACK.checkpoints.map((c) => c.arc);
const L = trackLength(TRACK);
const R = DRIVING_SPEC.bodyRadius;
const KEY = trackConfigKey(TRACK);

afterEach(() => {
  vi.doUnmock('../../src/content/track');
  vi.resetModules();
});

const moving = (x: number, z: number, heading: number, speed: number): DriveState => ({ ...restingAt({ x, z, heading }), speed });
const player = (s: RaceState) => s.cars[P];
const rankOf = (cars: readonly RaceCar[]) => rankCars(cars).indexOf(P) + 1;
/** 카운트다운을 입력 없이 보내 running으로 */
function started(s: RaceState): RaceState {
  while (s.phase === 'countdown') s = stepRace(s, IDLE, false).state;
  return s;
}
/** slot의 차를 바꾼 새 상태(시험용 배치) */
const withCar = (s: RaceState, slot: number, more: Partial<RaceCar>): RaceState =>
  ({ ...s, cars: s.cars.map((c) => (c.slot === slot ? { ...c, ...more } : c)) }) as unknown as RaceState;
/** 컴퓨터 차량을 그 자리에 세워 둠(액셀을 누르지 않는 반응 지연, 끼임 복귀도 하지 않게) */
const parkAi = (s: RaceState): RaceState =>
  ({ ...s, cars: s.cars.map((c) => (c.ai ? { ...c, stuckTicks: -Infinity, ai: { ...c.ai, reactionTicks: Infinity } } : c)) }) as unknown as RaceState;

type Log = { before: RaceState; after: RaceState; events: RaceEvent[] }[];
function run(s: RaceState, ticks: number, driver: (s: RaceState) => { input: DriveInput; tap?: boolean }, until?: (s: RaceState) => boolean) {
  const log: Log = [];
  for (let t = 0; t < ticks && !until?.(s); t++) {
    const { input, tap = false } = driver(s);
    const r = stepRace(s, input, tap);
    log.push({ before: s, after: r.state, events: r.events });
    s = r.state;
  }
  return { state: s, log, events: log.flatMap((l) => l.events) };
}

describe('trackConfigKey', () => {
  it('id:revision:laps', () => {
    expect(trackConfigKey({ ...TRACK, id: 'main', revision: 1, laps: 2 })).toBe('main:1:2');
  });
});

describe('formatRecord (FR-064)', () => {
  it.each([
    [29520, '4:55.20'],
    [0, '0:00.00'],
    [359999, '59:59.99'],
    [360000, '1:00:00.00'],
    [29599, '4:55.99'], // 반올림 없음
  ])('%i → %s', (cs, text) => {
    expect(formatRecord(cs)).toBe(text);
  });
});

describe('createRace·stepRace 기본 (modules.md 6.1, events.md 7.2)', () => {
  it('4대 출발 칸 restingAt, 플레이어 칸·차, 컴퓨터 차 = VEHICLES에서 플레이어 차를 뺀 앞 3종, countdown·raceTicks 0·result null', () => {
    const s = createRace('jeep');
    expect(s).toMatchObject({ phase: 'countdown', countdownTicks: COUNTDOWN_TICKS, raceTicks: 0, trackConfigKey: KEY, result: null });
    expect(s.cars.map((c) => c.slot)).toEqual([0, 1, 2, 3]);
    expect(s.cars.map((c) => c.drive)).toEqual(TRACK.grid.map(restingAt));
    expect(player(s)).toMatchObject({ isPlayer: true, vehicle: 'jeep', ai: null, lapsDone: 0, nextCheckpoint: 1, status: 'normal', finish: null });
    const ai = s.cars.filter((c) => !c.isPlayer);
    expect(ai.map((c) => c.vehicle)).toEqual(VEHICLES.map((v) => v.id).filter((id) => id !== 'jeep').slice(0, 3));
    expect(ai.map((c) => c.ai)).toEqual(TRACK.aiProfiles);
  });

  it('카운트다운: 어느 차도 움직이지 않고 후진 탭 무시, 초마다 countdownTick 3·2·1, 0이 되는 틱에 running + go + 첫 rankChanged (FR-055)', () => {
    const { state, log, events } = run(createRace('buggy'), COUNTDOWN_TICKS, () => ({ input: { steer: 1, throttle: true, brake: false }, tap: true }));
    for (const l of log) expect(l.after.cars.map((c) => c.drive)).toEqual(TRACK.grid.map(restingAt)); // 후진 탭도 무시(gear forward)
    expect(events).toEqual([
      { type: 'countdownTick', secondsLeft: 3 },
      { type: 'countdownTick', secondsLeft: 2 },
      { type: 'countdownTick', secondsLeft: 1 },
      { type: 'go' },
      { type: 'rankChanged', rank: rankOf(state.cars) },
    ]);
    expect(log.findIndex((l) => l.events.some((e) => e.type === 'countdownTick' && e.secondsLeft === 2))).toBe(TICK_HZ - 1);
    expect(state).toMatchObject({ phase: 'running', countdownTicks: 0, raceTicks: 0 });
  });

  it('카운트다운 중 누르고 있던 액셀은 go 다음 틱부터 반영, 경기 시간도 그 틱부터 1씩 (FR-017 단서)', () => {
    const { state } = run(createRace('wagon'), COUNTDOWN_TICKS, () => ({ input: GAS }));
    expect(player(state).drive.speed).toBe(0);
    const next = stepRace(state, GAS, false).state;
    expect(next.raceTicks).toBe(1);
    expect(player(next).drive.speed).toBeGreaterThan(0);
  });

  it('재도전 = 새 상태: 달리던 경기와 상관없이 모든 값이 처음 (FR-065)', () => {
    const fresh = createRace('truck');
    const ran = run(fresh, COUNTDOWN_TICKS + 400, () => ({ input: { steer: 0.2, throttle: true, brake: false }, tap: false })).state;
    expect(ran).not.toEqual(fresh);
    expect(createRace('truck')).toEqual(fresh);
  });

  it('차종을 바꿔도 같은 입력이면 모든 차 위치·이벤트가 같음 (US4-11, FR-011·054)', () => {
    const driver = (s: RaceState) => ({ input: { steer: Math.sin(s.raceTicks / 40) * 0.6, throttle: s.raceTicks % 90 < 70, brake: false } });
    const a = run(createRace('buggy'), COUNTDOWN_TICKS + 1500, driver);
    const b = run(createRace('banana-car'), COUNTDOWN_TICKS + 1500, driver);
    expect(b.log.map((l) => l.after.cars.map((c) => c.drive))).toEqual(a.log.map((l) => l.after.cars.map((c) => c.drive)));
    expect(b.events).toEqual(a.events);
  });

  it('다음 차례 체크포인트만 정방향 인정: 차례인 1번 통과 → 2, 차례 아닌 2번·결승선, 역방향은 그대로 (FR-059)', () => {
    const s = parkAi(started(createRace('buggy')));
    const top = pointOnTrack(TRACK, CP[1]).p; // 위 직선, +X 방향
    // 1번 바로 앞에서 정방향으로 넘음
    let r = run(withCar(s, P, { drive: moving(top.x - 0.5, top.z, Math.PI / 2, 6) }), 10, () => ({ input: GAS }));
    expect(player(r.state).nextCheckpoint).toBe(2);
    // 1번 차례가 아닐 때(이미 지남) 후진으로 거꾸로 넘어도 그대로
    r = run(withCar(s, P, { nextCheckpoint: 2, drive: { ...moving(top.x + 0.5, top.z, Math.PI / 2, 2.5), gear: 'reverse' } }), 30, () => ({ input: GAS }));
    expect(r.state.cars[P].drive.x).toBeLessThan(top.x);
    expect(player(r.state).nextCheckpoint).toBe(2);
    // 2번 차례가 아닌데(1번 차례) 2번을 넘음 → 그대로
    const right = pointOnTrack(TRACK, CP[2]).p; // 오른쪽 직선, −Z 방향
    r = run(withCar(s, P, { drive: moving(right.x, right.z + 0.5, Math.PI, 6) }), 10, () => ({ input: GAS }));
    expect(player(r.state).nextCheckpoint).toBe(1);
    // 결승선: 마지막 체크포인트 뒤(차례 0)면 바퀴 인정 → lapCompleted, 1번 차례면 넘어도 그대로
    r = run(withCar(s, P, { nextCheckpoint: 0, drive: moving(0, -0.5, 0, 6) }), 10, () => ({ input: GAS }));
    expect(player(r.state)).toMatchObject({ lapsDone: 1, nextCheckpoint: 1 });
    expect(r.events).toContainEqual({ type: 'lapCompleted', slot: P, lapsDone: 1 });
    r = run(withCar(s, P, { drive: moving(0, -0.5, 0, 6) }), 10, () => ({ input: GAS }));
    expect(player(r.state)).toMatchObject({ lapsDone: 0, nextCheckpoint: 1 });
  });

  it('플레이어 마지막 바퀴 결승선 정방향 통과 틱: finished, timeCs = round(raceTicks × 100 / TICK_HZ), playerFinished가 그 틱 마지막, 이후 no-op (FR-063)', () => {
    let s = started(createRace('buggy'));
    s = run(s, 1234, () => ({ input: IDLE })).state;
    s = withCar(s, P, { lapsDone: TRACK.laps - 1, nextCheckpoint: 0, drive: moving(0, -0.05, 0, 6) });
    const r = stepRace(s, GAS, false);
    const ticks = s.raceTicks + 1;
    expect(r.state.phase).toBe('finished');
    expect(r.state.raceTicks).toBe(ticks);
    expect(player(r.state).finish).toEqual({ tick: ticks, overshoot: expect.closeTo(-0.05 + 6.0667 / TICK_HZ, 3) });
    expect(r.events.at(-1)).toEqual({ type: 'playerFinished', timeCs: Math.round((ticks * 100) / TICK_HZ), rank: rankOf(r.state.cars) });
    expect(rankOf(r.state.cars)).toBe(1); // 컴퓨터 차는 아직 1바퀴째
    expect(r.state.result).toBeNull(); // result는 flow가 넣음
    const after = stepRace(r.state, GAS, true);
    expect(after).toEqual({ state: r.state, events: [] });
  });
});

describe('끼임·접촉·부정 완주 (FR-060·061·062, SC-012·013·014)', () => {
  it('SC-014: 벽에 정면으로 끼이면 STUCK_TICKS 뒤 자동 복귀 10/10, 경기는 이어지고 재시작 0, 복귀로 진행도·순위가 오르지 않음', () => {
    let s = started(createRace('jeep'));
    const edge = TRACK.width / 2 - R;
    const respawns: Log = [];
    for (let k = 0; k < 10; k++) {
      // 출발 직선 왼쪽 벽(+X)을 정면으로 보고 액셀
      s = withCar(s, P, { drive: moving(edge - 0.5, 25, Math.PI / 2, 2) });
      const r = run(s, STUCK_TICKS + 30, () => ({ input: GAS }), (x) => x.cars[P].drive.speed === 0 && x.cars[P].drive.x < edge - 0.6);
      const hit = r.log.find((l) => l.events.some((e) => e.type === 'respawned' && e.slot === P))!;
      expect(hit).toBeDefined();
      respawns.push(hit);
      expect(r.log.every((l) => l.after.raceTicks === l.before.raceTicks + 1 && l.after.phase === 'running')).toBe(true);
      s = r.state;
    }
    expect(respawns).toHaveLength(10);
    for (const { before, after } of respawns) {
      expect(after.cars[P].drive).toEqual(restingAt({ ...after.cars[P].drive })); // 전진·정지
      expect(progressValue(after.cars[P])).toBeLessThanOrEqual(progressValue(before.cars[P]) + 1e-9);
      expect(rankOf(after.cars)).toBeGreaterThanOrEqual(rankOf(before.cars));
      expect(after.cars[P].lapsDone).toBe(before.cars[P].lapsDone);
    }
  });

  it('SC-013: 결승선 후진 왕복 20회·역주행 1바퀴·안쪽 가로지르기에서 바퀴 증가 0', () => {
    const base = parkAi(started(createRace('buggy')));
    const laps = (events: RaceEvent[]) => events.filter((e) => e.type === 'lapCompleted' && e.slot === P);
    // 결승선 후진 왕복 20회(후진으로 결승선 뒤 1.5 m → 멈춤 → 전진으로 1.5 m 앞 → 멈춤)
    let s = withCar(base, P, { drive: restingAt({ x: 0, z: 1.5, heading: 0 }) });
    const all: RaceEvent[] = [];
    const go = (driver: Parameters<typeof run>[2], until: (s: RaceState) => boolean) => {
      const r = run(s, 600, driver, until);
      all.push(...r.events);
      s = r.state;
    };
    const stopped = (x: RaceState) => x.cars[P].drive.speed === 0;
    for (let k = 0; k < 20; k++) {
      go(() => ({ input: IDLE, tap: true }), (x) => x.cars[P].drive.gear === 'reverse');
      go(() => ({ input: GAS }), (x) => x.cars[P].drive.z < -1.5);
      go(() => ({ input: BRAKE }), stopped);
      go(() => ({ input: IDLE, tap: true }), (x) => x.cars[P].drive.gear === 'forward');
      go(() => ({ input: GAS }), (x) => x.cars[P].drive.z > 1.5);
      go(() => ({ input: BRAKE }), stopped);
    }
    expect(all.some((e) => e.type === 'respawned')).toBe(false);
    expect(laps(all)).toEqual([]);
    expect(player(s)).toMatchObject({ lapsDone: 0, nextCheckpoint: 1 });

    // 역주행 1바퀴: 돌아서서 중심선을 거꾸로 따라 한 바퀴(끼임 복귀는 빼고 체크포인트 규칙만 봄)
    s = withCar(base, P, { drive: restingAt({ x: 0, z: 1.5, heading: Math.PI }) });
    const reverse: RaceEvent[] = [];
    let back = 0;
    let arc = projectOnTrack(TRACK, player(s).drive).arc;
    for (let k = 0; k < 8000 && back <= L + 2; k++) {
      // 6 m 뒤쪽 중심선을 향하게 방향만 맞추고 액셀. 끼임 복귀는 빼서(stuckTicks 0) 체크포인트 규칙만 봄
      const d = player(s).drive;
      const t = pointOnTrack(TRACK, projectOnTrack(TRACK, d).arc - 6).p;
      s = withCar(s, P, { stuckTicks: 0, drive: { ...d, heading: Math.atan2(t.x - d.x, t.z - d.z) } });
      const r = stepRace(s, GAS, false);
      reverse.push(...r.events);
      s = r.state;
      const now = projectOnTrack(TRACK, player(s).drive).arc;
      const moved = (arc - now + L) % L;
      if (moved < L / 2) back += moved;
      arc = now;
    }
    expect(back).toBeGreaterThan(L);
    expect(laps(reverse)).toEqual([]);
    expect(reverse.some((e) => e.type === 'respawned')).toBe(false);
    expect(player(s)).toMatchObject({ lapsDone: 0, nextCheckpoint: 1 });

    // 가로지르기: 1번을 지나지 않고 2번 앞·결승선 앞에 나타나 정방향으로 넘음 → 그대로, 진행도는 1번 체크포인트를 넘지 않음
    const right = pointOnTrack(TRACK, CP[2]).p;
    for (const drive of [moving(right.x, right.z + 0.5, Math.PI, 6), moving(0, -0.5, 0, 6), moving(30, 0, 0, 6)]) {
      const r = run(withCar(base, P, { drive }), 60, () => ({ input: GAS }));
      expect(laps(r.events)).toEqual([]);
      expect(player(r.state)).toMatchObject({ lapsDone: 0, nextCheckpoint: 1 });
      expect(r.log.every((l) => progressValue(l.after.cars[P]) <= CP[1] + 1e-9)).toBe(true);
    }
  });

  it('SC-012: 30분(108,000틱) 넘게 아주 느리게 달려도 강제 종료 없음, 경기 시간 = 진행한 틱, 컴퓨터 차는 모두 완주하고 플레이어 완주를 기다림', () => {
    const N = 30 * 60 * TICK_HZ + 600;
    // 20틱에 한 번만 액셀(조금씩 앞으로 → 끼임 아님)
    const r = run(started(createRace('wagon')), N, (s) => ({ input: { ...IDLE, throttle: s.raceTicks % 20 === 0 } }));
    expect(r.state.phase).toBe('running');
    expect(r.state.raceTicks).toBe(N);
    expect(r.state.cars.filter((c) => !c.isPlayer).every((c) => c.status === 'finished')).toBe(true);
    expect(rankOf(r.state.cars)).toBe(4);
    expect(r.events.some((e) => e.type === 'playerFinished')).toBe(false);
    expect(formatRecord(Math.round((N * 100) / TICK_HZ))).toBe('30:10.00');
  });

  it('접촉: 겹친 차는 떼어 놓고 둘 다 CONTACT_SLOW_TICKS 동안 contactSlow(액셀 무시로 감속), 끝나면 normal (FR-060)', () => {
    let s = parkAi(started(createRace('buggy')));
    // 플레이어가 출발 칸 slot 1(3, 12) 바로 뒤에서 들이받음
    s = withCar(s, P, { drive: moving(3, 9.9, 0, 6) });
    const hit = stepRace(s, GAS, false).state;
    expect(hit.cars[P]).toMatchObject({ status: 'contactSlow', slowTicks: CONTACT_SLOW_TICKS });
    expect(hit.cars[1]).toMatchObject({ status: 'contactSlow', slowTicks: CONTACT_SLOW_TICKS });
    expect(Math.hypot(hit.cars[P].drive.x - hit.cars[1].drive.x, hit.cars[P].drive.z - hit.cars[1].drive.z)).toBeCloseTo(2 * R);
    expect(hit.cars[P].drive.heading).toBe(0);
    // 옆으로 빼 두면 액셀을 눌러도 속도가 줄다가, 끝나면 normal
    let t = withCar(hit, P, { drive: { ...hit.cars[P].drive, x: -5.9 } });
    const speeds: number[] = [];
    for (let k = 0; k < CONTACT_SLOW_TICKS; k++) {
      t = stepRace(t, GAS, false).state;
      speeds.push(t.cars[P].drive.speed);
    }
    expect(speeds.every((v, i) => i === 0 || v < speeds[i - 1])).toBe(true);
    expect(t.cars[P]).toMatchObject({ status: 'normal', slowTicks: 0 });
    expect(stepRace(t, GAS, false).state.cars[P].drive.speed).toBeGreaterThan(t.cars[P].drive.speed);
  });

  it('복귀 자세 후보 4곳(data-model.md 7장): 옆 3칸이 다른 3대로 막히면 뒤 후보, 진행도 ≤ 복귀 전, 겹치지 않음', () => {
    const side = TRACK.width / 3;
    let s = parkAi(started(createRace('buggy')));
    // 결승선(마지막 통과 체크포인트 0)의 중심·좌(+X)·우를 컴퓨터 차 3대가 막음, 플레이어는 출발 직선에서 끼임 직전
    s = withCar(s, 0, { drive: restingAt({ x: 0, z: 0, heading: 0 }) });
    s = withCar(s, 1, { drive: restingAt({ x: side, z: 0, heading: 0 }) });
    s = withCar(s, 2, { drive: restingAt({ x: -side, z: 0, heading: 0 }) });
    s = withCar(s, P, { drive: restingAt({ x: 5, z: 30, heading: 0 }), stuckTicks: STUCK_TICKS - 1 });
    const r = stepRace(s, IDLE, false);
    expect(r.events).toContainEqual({ type: 'respawned', slot: P });
    expect(r.state.cars[P].drive).toEqual(restingAt({ x: 0, z: -5 * R, heading: 0 }));
    expect(progressValue(r.state.cars[P])).toBeLessThanOrEqual(progressValue(s.cars[P]));
    // 하나만 비우면 그 칸으로(중심 → 좌 → 우 순서)
    const r2 = stepRace(withCar(s, 1, { drive: restingAt({ x: 30, z: 60, heading: 0 }) }), IDLE, false);
    expect(r2.state.cars[P].drive).toEqual(restingAt({ x: side, z: 0, heading: 0 }));
  });

  it('곡선 체크포인트에서도 다른 차 한 대는 두 후보를 함께 막지 못함(뒤 후보는 직선거리 5 × bodyRadius)', async () => {
    const curved = { ...TRACK, revision: 99, checkpoints: [{ arc: 0 }, { arc: 50 }, ...TRACK.checkpoints.slice(2)] }; // 1번 = 깎은 모서리 시작 꼭짓점
    vi.resetModules();
    vi.doMock('../../src/content/track', () => ({ TRACK: curved }));
    const race = await import('../../src/race/race');
    const progress = await import('../../src/race/progress');
    const { t } = pointOnTrack(curved, 50);
    const c0 = { x: 0, z: 50 };
    const c1 = { x: t.z * side(curved), z: 50 - t.x * side(curved) };
    let s = race.createRace('buggy');
    while (s.phase === 'countdown') s = race.stepRace(s, IDLE, false).state;
    s = parkAi(s);
    s = withCar(s, 0, { drive: restingAt({ x: 0, z: -40, heading: 0 }) });
    s = withCar(s, 2, { drive: restingAt({ x: 0, z: -30, heading: 0 }) });
    s = withCar(s, P, { nextCheckpoint: 2, drive: restingAt({ x: -5, z: 30, heading: 0 }), stuckTicks: progress.STUCK_TICKS - 1 });
    let tried = 0;
    for (let dx = -3; dx <= 3; dx += 0.5) {
      for (let dz = -6; dz <= 3; dz += 0.5) {
        const blocker = { x: c0.x + dx, z: c0.z + dz };
        const r = race.stepRace(withCar(s, 1, { drive: restingAt({ ...blocker, heading: 0 }) }), IDLE, false);
        const p = r.state.cars[P].drive;
        const b = r.state.cars[1].drive; // 트랙 밖에 놓였으면 벽 앞으로 옮겨진 자리
        expect(Math.hypot(p.x - b.x, p.z - b.z)).toBeGreaterThanOrEqual(2 * R - 1e-9);
        const at = (c: { x: number; z: number }) => Math.hypot(p.x - c.x, p.z - c.z) < 1e-9;
        expect(at(c0) || at(c1)).toBe(true);
        tried++;
      }
    }
    expect(tried).toBeGreaterThan(200);
  });
});

const side = (track: TrackDef) => track.width / 3;

describe('finishResult (data-model.md 7장, FR-064, SC-015·019)', () => {
  const best = (timeCs: number) => ({ trackConfigKey: KEY, timeCs });
  const res = (timeCs: number, runBest: ReturnType<typeof best> | null, storedBest: ReturnType<typeof best> | null) =>
    finishResult({ timeCs, rank: 2, runBest, storedBest, trackConfigKey: KEY });

  it('엄격히 짧을 때만 새 기록(같으면 아님), 처음 완주는 새 기록', () => {
    expect(res(30000, null, best(30000))).toEqual({ timeCs: 30000, rank: 2, isNewBest: false, best: best(30000) });
    expect(res(29999, null, best(30000))).toEqual({ timeCs: 29999, rank: 2, isNewBest: true, best: best(29999) });
    expect(res(40000, null, null)).toEqual({ timeCs: 40000, rank: 2, isNewBest: true, best: best(40000) });
  });

  it('기준은 runBest·storedBest 중 짧은 쪽', () => {
    expect(res(29000, best(28000), best(30000))).toMatchObject({ isNewBest: false, best: best(28000) });
    expect(res(29000, best(30000), best(28000))).toMatchObject({ isNewBest: false, best: best(28000) });
    expect(res(27000, best(30000), best(28000))).toMatchObject({ isNewBest: true, best: best(27000) });
  });

  it('MAX_RECORD_CS를 넘는 시간은 후보에서 빠짐(기록 없음이어도)', () => {
    expect(res(MAX_RECORD_CS + 1, null, null)).toMatchObject({ isNewBest: false, best: null });
    expect(res(MAX_RECORD_CS, null, null)).toMatchObject({ isNewBest: true, best: best(MAX_RECORD_CS) });
  });

  it('SC-015: 정상 완주 5회를 차례로 넣으면 최고 기록 = 최솟값', () => {
    let runBest: ReturnType<typeof best> | null = null;
    for (const t of [31000, 29500, 30200, 29500, 33000]) runBest = res(t, runBest, null).best;
    expect(runBest).toEqual(best(29500));
  });

  it('SC-019 두 탭 첫 사례: 다른 탭 저장값 30000, 이 탭 runBest 없음·31000 완주 → 새 기록 아님, best 30000', () => {
    expect(res(31000, null, best(30000))).toEqual({ timeCs: 31000, rank: 2, isNewBest: false, best: best(30000) });
  });
});
