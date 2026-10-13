import { TRACK, type TrackDef } from '../content/track';
import { VEHICLES, type VehicleKindId } from '../content/vehicles';
import { TICK_HZ } from '../core/loop';
import { blockByTrackWalls, separateCars } from '../sim/collision';
import { type DriveInput, requestGearToggle, restingAt, stepVehicle } from '../sim/vehicle';
import { type BestRecord, MAX_RECORD_CS } from '../storage/save';
import { aiInput } from './ai';
import { crossedNext, progressValue, type RaceCar, rankCars, respawnPose, type Slot, STUCK_TICKS } from './progress';

// 자리값: 레이싱 조정(T118)에서 확정
export const COUNTDOWN_TICKS = 3 * TICK_HZ; // 3·2·1
export const CONTACT_SLOW_TICKS = 30; // 접촉하면 이만큼 액셀이 듣지 않아 서서히 감속

type Rank = 1 | 2 | 3 | 4;
type Cars = readonly [RaceCar, RaceCar, RaceCar, RaceCar];
export type FinishResult = { timeCs: number; rank: number; isNewBest: boolean; best: BestRecord | null };
export type RaceState = {
  phase: 'countdown' | 'running' | 'finished';
  countdownTicks: number;
  raceTicks: number;
  trackConfigKey: string;
  cars: Cars;
  result: FinishResult | null;
};
export type RaceEvent =
  | { type: 'countdownTick'; secondsLeft: number }
  | { type: 'go' }
  | { type: 'rankChanged'; rank: Rank }
  | { type: 'lapCompleted'; slot: Slot; lapsDone: number }
  | { type: 'respawned'; slot: Slot }
  | { type: 'playerFinished'; timeCs: number; rank: Rank };

export function trackConfigKey(track: TrackDef): string {
  return `${track.id}:${track.revision}:${track.laps}`;
}

const P = TRACK.playerSlot;
const playerRank = (cars: readonly RaceCar[]) => (rankCars(cars).indexOf(P) + 1) as Rank;

/** 4대 출발 칸에 전진·정지. 컴퓨터 차량은 slot 순서로 VEHICLES에서 플레이어 차를 뺀 앞 3종과 aiProfiles. 재도전도 새로 만듦(FR-065) */
export function createRace(playerVehicle: VehicleKindId): RaceState {
  const others = VEHICLES.map((v) => v.id).filter((id) => id !== playerVehicle);
  const cars = TRACK.grid.map((pose, i): RaceCar => {
    const k = i - Number(i > P); // 컴퓨터 차량 순번
    return {
      slot: i as Slot,
      isPlayer: i === P,
      vehicle: i === P ? playerVehicle : others[k],
      drive: restingAt(pose),
      lapsDone: 0,
      nextCheckpoint: 1,
      status: 'normal',
      slowTicks: 0,
      stuckTicks: 0,
      finish: null,
      ai: i === P ? null : TRACK.aiProfiles[k],
    };
  }) as unknown as Cars;
  return { phase: 'countdown', countdownTicks: COUNTDOWN_TICKS, raceTicks: 0, trackConfigKey: trackConfigKey(TRACK), cars, result: null };
}

/** 1틱 진행(events.md 7.2). 카운트다운 중에는 아무 차도 움직이지 않고, 끝난 경기는 그대로 */
export function stepRace(state: RaceState, input: DriveInput, gearTap: boolean): { state: RaceState; events: RaceEvent[] } {
  if (state.phase === 'finished') return { state, events: [] };
  if (state.phase === 'countdown') {
    const left = state.countdownTicks - 1;
    if (left === 0) return { state: { ...state, countdownTicks: 0, phase: 'running' }, events: [{ type: 'go' }, { type: 'rankChanged', rank: playerRank(state.cars) }] };
    const secondsLeft = Math.ceil(left / TICK_HZ);
    const tick = state.countdownTicks === COUNTDOWN_TICKS || secondsLeft !== Math.ceil(state.countdownTicks / TICK_HZ);
    return { state: { ...state, countdownTicks: left }, events: tick ? [{ type: 'countdownTick', secondsLeft }] : [] };
  }

  const events: RaceEvent[] = [];
  const raceTicks = state.raceTicks + 1;
  const before = state.cars;
  // 틱 시작 스냅숏으로 입력 → 네 대 같은 stepVehicle → 벽 → 차끼리. 접촉 감속 중엔 액셀이 듣지 않음
  const moved = before.map((c) => {
    const drive = c.isPlayer && gearTap ? requestGearToggle(c.drive).state : c.drive;
    const ctrl = c.isPlayer ? input : aiInput(c, before, raceTicks);
    const next = stepVehicle(drive, c.status === 'contactSlow' ? { ...ctrl, throttle: false } : ctrl);
    return blockByTrackWalls(drive, next, TRACK).state;
  });
  const sep = separateCars(moved);
  const cars: RaceCar[] = before.map((c, i) => {
    if (c.status === 'finished') return { ...c, drive: sep.states[i] };
    const slowTicks = sep.touching[i] ? CONTACT_SLOW_TICKS : Math.max(c.slowTicks - 1, 0);
    return { ...c, drive: sep.states[i], slowTicks, status: slowTicks > 0 ? 'contactSlow' : 'normal' };
  });

  // slot 순서로 다음 차례 체크포인트 정방향 통과만 인정(FR-059)
  cars.forEach((c, i) => {
    if (c.status === 'finished') return;
    const overshoot = crossedNext(c, before[i].drive);
    if (overshoot === null) return;
    if (c.nextCheckpoint !== 0) cars[i] = { ...c, nextCheckpoint: (c.nextCheckpoint + 1) % TRACK.checkpoints.length };
    else if (c.lapsDone + 1 < TRACK.laps) {
      cars[i] = { ...c, lapsDone: c.lapsDone + 1, nextCheckpoint: 1 };
      events.push({ type: 'lapCompleted', slot: c.slot, lapsDone: c.lapsDone + 1 });
    } else cars[i] = { ...c, lapsDone: c.lapsDone + 1, status: 'finished', finish: { tick: raceTicks, overshoot } };
  });

  // 진행도가 STUCK_TICKS 동안 늘지 않으면 복귀(완주한 차 제외, 컴퓨터 차량도 같음, FR-061). 앞 slot의 복귀 자리를 피함
  cars.forEach((c, i) => {
    if (c.status === 'finished') return;
    const stuckTicks = progressValue(c) > progressValue(before[i]) ? 0 : c.stuckTicks + 1;
    if (stuckTicks < STUCK_TICKS) return void (cars[i] = { ...c, stuckTicks });
    const others = cars.filter((_, j) => j !== i).map((o) => o.drive);
    cars[i] = { ...c, drive: restingAt(respawnPose(c, others)), stuckTicks: 0, slowTicks: 0, status: 'normal' };
    events.push({ type: 'respawned', slot: c.slot });
  });

  const rank = playerRank(cars);
  if (rank !== playerRank(before)) events.push({ type: 'rankChanged', rank });
  const done = cars[P].status === 'finished';
  if (done) events.push({ type: 'playerFinished', timeCs: Math.round((raceTicks * 100) / TICK_HZ), rank });
  return { state: { ...state, phase: done ? 'finished' : 'running', raceTicks, cars: cars as unknown as Cars }, events };
}

/** 완주 결과(data-model.md 7장). 기준 = runBest·storedBest 중 짧은 쪽, 엄격히 짧고 MAX_RECORD_CS 이하일 때만 새 기록(FR-064) */
export function finishResult(p: {
  timeCs: number;
  rank: number;
  runBest: BestRecord | null;
  storedBest: BestRecord | null;
  trackConfigKey: string;
}): FinishResult {
  const { runBest, storedBest } = p;
  const prev = runBest === null || (storedBest !== null && storedBest.timeCs < runBest.timeCs) ? storedBest : runBest;
  const isNewBest = p.timeCs <= MAX_RECORD_CS && (prev === null || p.timeCs < prev.timeCs);
  return { timeCs: p.timeCs, rank: p.rank, isNewBest, best: isNewBest ? { trackConfigKey: p.trackConfigKey, timeCs: p.timeCs } : prev };
}

const pad2 = (n: number) => String(n).padStart(2, '0');

export function formatRecord(timeCs: number): string {
  const cs = timeCs % 100;
  const totalSec = Math.floor(timeCs / 100);
  const s = totalSec % 60;
  const totalMin = Math.floor(totalSec / 60);
  if (totalMin < 60) return `${totalMin}:${pad2(s)}.${pad2(cs)}`;
  return `${Math.floor(totalMin / 60)}:${pad2(totalMin % 60)}:${pad2(s)}.${pad2(cs)}`;
}
