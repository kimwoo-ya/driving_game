import { describe, expect, it } from 'vitest';
import { ASSET_URLS } from '../../src/app/loader';
import { CHARACTERS, type CharacterKindId } from '../../src/content/characters';
import { CREDITS } from '../../src/content/credits';
import { SAFETY_RULES } from '../../src/content/rules';
import { SCENARIOS, type ScenarioId, type ViolationKind } from '../../src/content/scenarios';
import { type Rect, TOWN } from '../../src/content/town';
import { TRACK } from '../../src/content/track';
import { VEHICLES, type VehicleKindId } from '../../src/content/vehicles';
import { advanceExtraCursor, EXTRAS_PER_VIEW, isReplay, pickRules } from '../../src/practice/ruleRotation';
import { FLASH_TICKS, POSE_TICKS, STOP_MARGIN } from '../../src/practice/townActors';
import { DRIVING_SPEC, type Vec2 } from '../../src/sim/vehicle';

// Record라서 ID 타입의 모든 값이 빠짐없이 있어야 타입 검사를 통과함
const VEHICLE_IDS = { buggy: 1, jeep: 1, truck: 1, wagon: 1, 'banana-car': 1 } satisfies Record<VehicleKindId, 1>;
const CHARACTER_IDS = { 'chicken-guy': 1, 'cool-banana-guy': 1, turtle: 1 } satisfies Record<CharacterKindId, 1>;

const rulesOf = (s: ScenarioId, tier: 'core' | 'extra') =>
  SAFETY_RULES.filter((r) => r.scenario === s && r.tier === tier).map((r) => r.id);

describe('콘텐츠 무결성 (content-data.md 4장)', () => {
  it('#1 규칙 38개, ID 중복 0', () => {
    expect(SAFETY_RULES).toHaveLength(38);
    expect(new Set(SAFETY_RULES.map((r) => r.id)).size).toBe(38);
  });

  it('#2 researchIds 합집합 41, 중복 0', () => {
    const all = SAFETY_RULES.flatMap((r) => r.researchIds);
    expect(all).toHaveLength(41);
    expect(new Set(all).size).toBe(41);
  });

  it('#3 상황별 핵심·추가 수', () => {
    expect([rulesOf('signal-wait', 'core').length, rulesOf('signal-wait', 'extra').length]).toEqual([4, 12]);
    expect([rulesOf('crossing-check', 'core').length, rulesOf('crossing-check', 'extra').length]).toEqual([5, 7]);
    expect([rulesOf('turning-car', 'core').length, rulesOf('turning-car', 'extra').length]).toEqual([3, 7]);
  });

  it('#4 사용자가 고른 네 행동은 핵심', () => {
    const core = SAFETY_RULES.filter((r) => r.tier === 'core').map((r) => r.id);
    expect(core).toEqual(expect.arrayContaining(['A9', 'A10', 'A11', 'A14-A15']));
  });

  it('#5 횡단 다섯 단계 순서(손 들기 바로 뒤 멈춤 확인)', () => {
    expect(rulesOf('crossing-check', 'core')).toEqual(['A10', 'A11', 'A14-A15', 'A16-A17', 'A19-A20']);
  });

  it('#6 핵심 규칙 poses에 lookLeft·lookRight·raiseHand가 모두 있음', () => {
    const poses = new Set(SAFETY_RULES.filter((r) => r.tier === 'core').flatMap((r) => r.poses));
    expect([...poses]).toEqual(expect.arrayContaining(['lookLeft', 'lookRight', 'raiseHand']));
  });

  it('#7 그림 전용 규칙은 정확히 A2·A25·A26·B13·B14', () => {
    const ids = SAFETY_RULES.filter((r) => r.pictureElements.length > 0).map((r) => r.id);
    expect(ids.sort()).toEqual(['A2', 'A25', 'A26', 'B13', 'B14']);
  });

  it('#9 durationTicks는 양의 정수, introTicks ≥ 0', () => {
    for (const r of SAFETY_RULES) {
      expect(Number.isInteger(r.durationTicks) && r.durationTicks > 0).toBe(true);
    }
    for (const s of SCENARIOS) expect(s.pedestrianView.introTicks).toBeGreaterThanOrEqual(0);
  });

  it('#10 ceil(추가 수 / k)번 다시 하면 추가 규칙을 모두 1번 이상, 매번 핵심 전부, 처음이면 추가 0 (SC-031)', () => {
    for (const { id } of SCENARIOS) {
      const core = rulesOf(id, 'core');
      const extras = rulesOf(id, 'extra');
      const first = pickRules(id, isReplay(id, { completedThisRun: new Set(), tutorialDone: false }), 0);
      expect(first).toEqual({ rules: core, extrasCount: 0 });

      const seen = new Set<string>();
      let cursor = 0;
      for (let i = 0; i < Math.ceil(extras.length / Math.min(EXTRAS_PER_VIEW, extras.length)); i++) {
        const picked = pickRules(id, isReplay(id, { completedThisRun: new Set([id]), tutorialDone: false }), cursor);
        expect(picked.rules.slice(0, core.length)).toEqual(core);
        picked.rules.slice(core.length).forEach((r) => seen.add(r));
        cursor = advanceExtraCursor(id, cursor, picked.extrasCount);
      }
      expect([...seen].sort()).toEqual([...extras].sort());
    }
  });

  it('#11 차량 5종·인물 3종 ID가 타입과 일치', () => {
    expect(VEHICLES.map((v) => v.id)).toEqual(Object.keys(VEHICLE_IDS));
    expect(CHARACTERS.map((c) => c.id)).toEqual(Object.keys(CHARACTER_IDS));
  });

  it('#12 모델 8개가 ASSET_URLS에 있음', () => {
    for (const k of [...VEHICLES, ...CHARACTERS]) expect(ASSET_URLS[`models/${k.id}.glb`]).toEqual(expect.any(String));
  });

  it('#14 인물 동작 이름이 실제 GLB에 있음', () => {
    for (const c of CHARACTERS) {
      const names = (gltfJson(GLB_RAW[`/src/assets/models/${c.id}.glb`]).animations ?? []).map((a) => a.name);
      expect(names).toEqual(expect.arrayContaining(Object.values(c.clips)));
    }
  });

  it('#13 차량마다 좌석 1개 이상, height > 0', () => {
    for (const v of VEHICLES) {
      expect(v.seats.length).toBeGreaterThanOrEqual(1);
      for (const seat of v.seats) expect(seat.height).toBeGreaterThan(0);
    }
  });

  it('#14 인물 동작 이름(데이터 부분)', () => {
    expect(Object.fromEntries(CHARACTERS.map((c) => [c.id, c.clips]))).toEqual({
      'chicken-guy': { idle: 'Armature|Idle', walk: 'Armature|Walk' },
      'cool-banana-guy': { idle: 'Idle' },
      turtle: { idle: 'Idle' },
    });
  });

  it('#16 구간 형식', () => {
    for (const s of SCENARIOS) {
      for (const seg of s.segments) {
        expect(seg.stopZone.toS).toBeLessThanOrEqual(seg.stopLineS);
        expect(seg.steps.length).toBeGreaterThanOrEqual(1);
      }
      const { segment, afterStep } = s.pedestrianView;
      for (const i of [segment, afterStep]) expect(Number.isInteger(i) && i >= 0).toBe(true);
      expect(segment).toBeLessThan(s.segments.length);
      expect(afterStep).toBeLessThan(s.segments[segment].steps.length);
    }
  });

  it('#15 잘못된 행동 6종이 각각 어떤 구간의 violations에 1번 이상 (SC-010)', () => {
    const ALL = {
      turnedIntoCrossingPedestrian: 1,
      enteredCrosswalkWithPedestrian: 1,
      ranRed: 1,
      earlyStart: 1,
      overStopLine: 1,
      enteredSidewalk: 1,
    } satisfies Record<ViolationKind, 1>;
    const used = new Set(SCENARIOS.flatMap((s) => s.segments.flatMap((g) => g.violations)));
    expect([...used].sort()).toEqual(Object.keys(ALL).sort());
  });

  it('#17 사고 장면 방지 거리: 보행자 경로의 모든 점이 정지선·횡단보도 앞 가장자리 너머, 보도 위 차도에서 1 m 이상 (FR-036)', () => {
    const MARGIN = 1; // 사람 반지름 + 여유(content-data.md 4장 테스트 상수)
    const area = (kind: string) => TOWN.areas.filter((a) => a.kind === kind).map((a) => a.rect);
    const gap = (p: Vec2, r: Rect) => Math.hypot(Math.max(r.minX - p.x, 0, p.x - r.maxX), Math.max(r.minZ - p.z, 0, p.z - r.maxZ));
    const inside = (p: Vec2, r: Rect) => p.x >= r.minX && p.x <= r.maxX && p.z >= r.minZ && p.z <= r.maxZ;
    for (const s of SCENARIOS) {
      for (const seg of s.segments) {
        const cw = TOWN.areas.find((a) => a.id === seg.crosswalk)?.rect;
        const cwNear = cw
          ? Math.min(...[[cw.minX, cw.minZ], [cw.minX, cw.maxZ], [cw.maxX, cw.minZ], [cw.maxX, cw.maxZ]].map(([x, z]) => pathS(seg.path, { x, z })))
          : -Infinity;
        for (const p of seg.plan.pedestrians.flatMap((d) => d.path)) {
          expect(pathS(seg.path, p)).toBeGreaterThanOrEqual(Math.max(seg.stopLineS, cwNear) + MARGIN);
          expect(area('sidewalk').some((r) => inside(p, r))).toBe(true);
          expect(Math.min(...[...area('road'), ...area('crosswalk')].map((r) => gap(p, r)))).toBeGreaterThanOrEqual(MARGIN);
        }
      }
    }
  });

  it('신호·보행자 계획이 townActors의 전제를 지킴(신호 종류, 노랑 지점 제동 거리, 깜빡임 전 출발, 경로 점 2개 이상)', () => {
    const kindOf = (id: string | null) => TOWN.signals.find((x) => x.id === id)?.kind;
    const gap = DRIVING_SPEC.maxForwardSpeed ** 2 / (2 * DRIVING_SPEC.brakeDeceleration) + STOP_MARGIN;
    for (const s of SCENARIOS) {
      for (const seg of s.segments) {
        const { plan } = seg;
        if (seg.signal) {
          expect(kindOf(seg.signal)).toBe('vehicle');
          expect(plan.redAtS).not.toBeNull();
          expect(plan.greenAfterStoppedTicks).not.toBeNull();
          expect(plan.redAtS!).toBeLessThanOrEqual(seg.stopZone.fromS);
          expect(seg.stopLineS - plan.redAtS!).toBeGreaterThanOrEqual(gap);
          for (const d of plan.pedestrians) {
            expect(plan.greenAfterStoppedTicks! - FLASH_TICKS).toBeGreaterThan(d.poses.length * POSE_TICKS);
          }
        }
        if (plan.pedestrianSignal) expect(kindOf(plan.pedestrianSignal)).toBe('pedestrian');
        for (const d of plan.pedestrians) expect(d.path.length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('#18 트랙', () => {
    const r = DRIVING_SPEC.bodyRadius;
    const arcs = TRACK.checkpoints.map((c) => c.arc);
    expect(arcs.length).toBeGreaterThanOrEqual(3);
    expect(arcs[0]).toBe(0);
    expect([...arcs].sort((a, b) => a - b)).toEqual(arcs);
    expect(new Set(arcs).size).toBe(arcs.length);
    expect([1, 2]).toContain(TRACK.laps);
    expect(TRACK.aiProfiles).toHaveLength(3);
    expect(TRACK.width / 3).toBeGreaterThan(4 * r);
    for (const g of TRACK.grid) {
      const a = projectArc(g);
      expect(a).toBeGreaterThan(0);
      expect(a).toBeLessThan(arcs[1]);
    }
    for (const arc of arcs) {
      const { p, t } = pointAt(arc);
      const back = { x: p.x - t.x * 5 * r, z: p.z - t.z * 5 * r };
      expect(distToCenterline(back)).toBeLessThanOrEqual(TRACK.width / 2 - r);
    }
  });

  it('#19 모델 크레딧: 8 ID마다 1행, 필수 필드, 라이선스가 PRD 표와 같음 (FR-088, SC-026)', () => {
    const license = { 'cool-banana-guy': 'CC0 1.0' } as Record<string, string>; // 나머지 7종 CC BY 3.0(PRD)
    const models = [...Object.keys(VEHICLE_IDS), ...Object.keys(CHARACTER_IDS)];
    expect(CREDITS.filter((c) => c.kind === 'vehicleModel' || c.kind === 'characterModel').map((c) => c.id).sort()).toEqual(
      [...models].sort(),
    );
    for (const id of models) {
      const c = CREDITS.find((x) => x.id === id)!;
      expect([id, c.kind]).toEqual([id, id in VEHICLE_IDS ? 'vehicleModel' : 'characterModel']);
      for (const v of [c.title, c.author, c.sourceUrl, c.licenseUrl, c.changes]) expect(v).toBeTruthy();
      expect(c.checkedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect([id, c.license]).toEqual([id, license[id] ?? 'CC BY 3.0']);
    }
  });

  it('#20 운전 성능 값', () => {
    for (const v of Object.values(DRIVING_SPEC)) expect(Number.isFinite(v) && v > 0).toBe(true);
    expect(DRIVING_SPEC.maxReverseSpeed).toBeLessThan(DRIVING_SPEC.maxForwardSpeed);
    expect(DRIVING_SPEC.stopSnapSpeed).toBeLessThan(DRIVING_SPEC.maxReverseSpeed);
  });

  it('#21 규칙 그림 38장이 ASSET_URLS에 있음 (SC-030, FR-070)', () => {
    for (const r of SAFETY_RULES) expect([r.id, ASSET_URLS[`images/rules/${r.id}.svg`]]).toEqual([r.id, expect.any(String)]);
  });
});

// GLB 읽기 (#14): ?url은 주소만 주므로 같은 import.meta.glob을 ?raw로 써서 내용을 받음.
// 앞 20바이트(헤더) 뒤의 JSON 청크는 UTF-8 글자라 괄호 짝으로 잘라 읽음
const GLB_RAW = import.meta.glob<string>('/src/assets/models/*.glb', { query: '?raw', import: 'default', eager: true });

function gltfJson(raw: string): { animations?: { name?: string }[] } {
  const start = raw.indexOf('{');
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < raw.length; i++) {
    const c = raw[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
    } else if (c === '"') inStr = true;
    else if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return JSON.parse(raw.slice(start, i + 1));
  }
  throw new Error('GLB JSON 청크를 찾지 못함');
}

// 닫힌 중심선 도우미 (#18)
const pts: readonly Vec2[] = TRACK.centerline;
const segs = pts.map((a, i) => {
  const b = pts[(i + 1) % pts.length];
  const len = Math.hypot(b.x - a.x, b.z - a.z);
  return { a, b, len, t: { x: (b.x - a.x) / len, z: (b.z - a.z) / len } };
});
const starts = segs.reduce<number[]>((acc, s, i) => [...acc, i === 0 ? 0 : acc[i - 1] + segs[i - 1].len], []);

function pointAt(arc: number) {
  const i = segs.findIndex((s, k) => arc < starts[k] + s.len);
  const s = segs[i];
  const d = arc - starts[i];
  return { p: { x: s.a.x + s.t.x * d, z: s.a.z + s.t.z * d }, t: s.t };
}

function nearest(p: Vec2) {
  let best = { dist: Infinity, arc: 0 };
  segs.forEach((s, i) => {
    const d = Math.min(Math.max((p.x - s.a.x) * s.t.x + (p.z - s.a.z) * s.t.z, 0), s.len);
    const dist = Math.hypot(p.x - (s.a.x + s.t.x * d), p.z - (s.a.z + s.t.z * d));
    if (dist < best.dist) best = { dist, arc: starts[i] + d };
  });
  return best;
}
const projectArc = (p: Vec2) => nearest(p).arc;
const distToCenterline = (p: Vec2) => nearest(p).dist;

/** 연습 구간 경로(꺾은선)에 투영한 거리. 첫 선분 앞은 음수로 늘여 셈(scenario.ts와 같은 방식) */
function pathS(path: readonly Vec2[], p: Vec2): number {
  let best = { s: 0, off: Infinity };
  let acc = 0;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1];
    const b = path[i];
    const len = Math.hypot(b.x - a.x, b.z - a.z);
    let t = ((p.x - a.x) * (b.x - a.x) + (p.z - a.z) * (b.z - a.z)) / (len * len);
    if (i > 1) t = Math.max(t, 0);
    if (i < path.length - 1) t = Math.min(t, 1);
    const off = Math.hypot(p.x - (a.x + (b.x - a.x) * t), p.z - (a.z + (b.z - a.z) * t));
    if (off < best.off) best = { s: acc + t * len, off };
    acc += len;
  }
  return best.s;
}
