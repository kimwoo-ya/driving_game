import type { Rect } from '../content/town';
import type { TrackDef } from '../content/track';
import { DRIVING_SPEC, type DriveState, type Vec2 } from './vehicle';

// 트랙 닫힌 중심선 계산(벽·진행도·컴퓨터 차량 공용). arc = 중심선 시작점부터 거리(m)
type TrackSeg = { a: Vec2; t: Vec2; len: number; start: number };
const segCache = new WeakMap<TrackDef, readonly TrackSeg[]>();

function segments(track: TrackDef): readonly TrackSeg[] {
  let segs = segCache.get(track);
  if (!segs) {
    let start = 0;
    segs = track.centerline.map((a, i) => {
      const b = track.centerline[(i + 1) % track.centerline.length];
      const len = Math.hypot(b.x - a.x, b.z - a.z);
      const seg = { a, t: { x: (b.x - a.x) / len, z: (b.z - a.z) / len }, len, start };
      start += len;
      return seg;
    });
    segCache.set(track, segs);
  }
  return segs;
}

export function trackLength(track: TrackDef): number {
  const last = segments(track).at(-1)!;
  return last.start + last.len;
}

/** arc 지점(한 바퀴로 접음)과 그 자리 진행 방향 단위 벡터. 꼭짓점에서는 다음 선분 방향 */
export function pointOnTrack(track: TrackDef, arc: number): { p: Vec2; t: Vec2 } {
  const L = trackLength(track);
  const s = ((arc % L) + L) % L;
  const segs = segments(track);
  const seg = segs.find((g) => s < g.start + g.len) ?? segs[0];
  const d = s - seg.start;
  return { p: { x: seg.a.x + seg.t.x * d, z: seg.a.z + seg.t.z * d }, t: seg.t };
}

/**
 * 중심선에서 p에 가장 가까운 점. [from, to] 구간(to가 한 바퀴를 넘으면 이어서)으로 제한할 수 있음.
 * arc는 제한 구간 안의 값(from ≤ arc ≤ to), dist는 중심선까지 거리
 */
export function projectOnTrack(track: TrackDef, p: Vec2, from = 0, to = trackLength(track)): { arc: number; p: Vec2; t: Vec2; dist: number } {
  const L = trackLength(track);
  let best = { arc: from, p: { x: 0, z: 0 }, t: { x: 0, z: 1 }, dist: Infinity };
  for (const shift of [0, L]) {
    for (const g of segments(track)) {
      const lo = Math.max(from, g.start + shift);
      const hi = Math.min(to, g.start + g.len + shift);
      if (lo > hi) continue;
      const base = g.start + shift;
      const d = Math.min(Math.max((p.x - g.a.x) * g.t.x + (p.z - g.a.z) * g.t.z, lo - base), hi - base);
      const q = { x: g.a.x + g.t.x * d, z: g.a.z + g.t.z * d };
      const dist = Math.hypot(p.x - q.x, p.z - q.z);
      if (dist < best.dist) best = { arc: base + d, p: q, t: g.t, dist };
    }
  }
  return best;
}

// 차체 원(반지름 bodyRadius)과 사각형이 겹치는지: 원 중심에서 사각형의 가장 가까운 점까지 거리
export function overlaps(s: DriveState, r: Rect): boolean {
  const dx = s.x - Math.min(Math.max(s.x, r.minX), r.maxX);
  const dz = s.z - Math.min(Math.max(s.z, r.minZ), r.maxZ);
  return dx * dx + dz * dz < DRIVING_SPEC.bodyRadius ** 2;
}

/** 마을 건물 구역(Rect)에 차체 원이 들어가면 이전 자리(경계 앞)에 두고 멈춤. heading은 바꾸지 않음(FR-035) */
export function blockByAreas(prev: DriveState, next: DriveState, blockers: readonly Rect[]): { state: DriveState; hit: boolean } {
  if (!blockers.some((r) => overlaps(next, r))) return { state: next, hit: false };
  return { state: { ...next, x: prev.x, z: prev.z, speed: 0 }, hit: true };
}

/**
 * 트랙 폭 밖(중심선에서 width/2 − bodyRadius 넘게)으로 나가는 이동을 벽 앞에서 막음. 벽을 따라가는 만큼만 속도를 남겨
 * 감속(정면이면 멈춤). heading은 그대로 → 튕김·회전 없음(FR-060). prev는 쓰지 않음(벽 앞 자리를 중심선에서 계산)
 */
export function blockByTrackWalls(_prev: DriveState, next: DriveState, track: TrackDef): { state: DriveState; hit: boolean } {
  const q = projectOnTrack(track, next);
  const max = track.width / 2 - DRIVING_SPEC.bodyRadius;
  if (q.dist <= max) return { state: next, hit: false };
  const k = max / q.dist;
  const along = Math.abs(Math.sin(next.heading) * q.t.x + Math.cos(next.heading) * q.t.z);
  return { state: { ...next, x: q.p.x + (next.x - q.p.x) * k, z: q.p.z + (next.z - q.p.z) * k, speed: next.speed * along }, hit: true };
}

/** 차체 원끼리 겹친 만큼 둘을 반씩 떼어 놓음(입력 순서대로, 같은 자리면 +X 방향). heading·speed는 그대로, 감속은 race가 touching으로 */
export function separateCars(states: readonly DriveState[]): { states: DriveState[]; touching: readonly boolean[] } {
  const out = states.map((s) => ({ ...s }));
  const touching = states.map(() => false);
  const min = 2 * DRIVING_SPEC.bodyRadius;
  for (let i = 0; i < out.length; i++) {
    for (let j = i + 1; j < out.length; j++) {
      const dx = out[j].x - out[i].x;
      const dz = out[j].z - out[i].z;
      const d = Math.hypot(dx, dz);
      if (d >= min) continue;
      const [ux, uz] = d > 0 ? [dx / d, dz / d] : [1, 0];
      const push = (min - d) / 2;
      out[i].x -= ux * push;
      out[i].z -= uz * push;
      out[j].x += ux * push;
      out[j].z += uz * push;
      touching[i] = touching[j] = true;
    }
  }
  return { states: out, touching };
}
