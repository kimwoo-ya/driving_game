import * as THREE from 'three';
import type { PlaySession } from '../app/flow';
import type { CharacterKindId } from '../content/characters';
import { SAFETY_RULES } from '../content/rules';
import { SCENARIOS, type SegmentDef } from '../content/scenarios';
import { type SignalId, TOWN } from '../content/town';
import type { DrivingLessonState } from '../practice/drivingLesson';
import type { ScenarioAttempt } from '../practice/scenario';
import type { SignalState } from '../practice/townActors';
import type { Vec2 } from '../sim/vehicle';
import { animateCharacters, pedestrianObject, seatPassenger, setPose } from './characters';
import { cloneModel, preparedModel } from './models';
import type { Stage } from './stage';

// 기본 도형 색·높이(m)
const LOOK = {
  road: { color: 0x555a60, height: 0.02 },
  sidewalk: { color: 0xd8d4cc, height: 0.15 },
  building: { color: 0xf2b880, height: 6 },
} as const;
const WHITE = 0xffffff;
const STRIPE = 0.5; // 횡단보도 줄 폭(m)
const LANE_HALF = 2; // 정지선 길이의 반(차선 폭 4 m)
const SIGNAL_HEIGHT = 3;
const EMPHASIS = 1.4; // 운전 중 차 신호, 안내 중 보행자 신호를 크게(FR-042)
const FLASH_MS = 400; // 보행자 초록 깜빡임(꾸밈, 실제 시간)
const SKY = new THREE.Color(0x9fd8ff);
const WEATHER = { rain: new THREE.Color(0x8a96a3), dark: new THREE.Color(0x1d2a44) } as const;

// 신호 등: 색 + 모양(FR-025). 차 신호는 가로로 빨강(네모)·노랑(마름모)·초록(동그라미),
// 보행자 신호는 세로로 빨강(서 있는 막대)·초록(걷는 세모). 켜진 등만 밝고 큼
type Lamp = { mesh: THREE.Mesh; on: THREE.Color };
type SignalView = { kind: 'vehicle' | 'pedestrian'; obj: THREE.Object3D; lamps: Partial<Record<SignalState['light'], Lamp>> };

let group: THREE.Group | null = null;
let signals = new Map<SignalId, SignalView>();
const walkers: THREE.Object3D[] = [];
let protagonist: THREE.Object3D | null = null;
let car: THREE.Object3D | null = null;
let carKey = '';
let seated: CharacterKindId | null = null;

const box = (w: number, h: number, d: number, color: number) =>
  new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ color }));

function lamp(geometry: THREE.BufferGeometry, on: number, x: number, y: number): Lamp {
  const mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: 0x333333 }));
  mesh.position.set(x, y, 0.2);
  return { mesh, on: new THREE.Color(on) };
}

function signalView(kind: 'vehicle' | 'pedestrian'): SignalView {
  const obj = new THREE.Group();
  const pole = box(0.15, SIGNAL_HEIGHT, 0.15, 0x444444);
  pole.position.y = SIGNAL_HEIGHT / 2;
  obj.add(pole);
  const head = new THREE.Group();
  head.position.y = SIGNAL_HEIGHT;
  obj.add(head);
  const lamps: SignalView['lamps'] =
    kind === 'vehicle'
      ? {
          red: lamp(new THREE.BoxGeometry(0.26, 0.26, 0.1), 0xff3b30, -0.4, 0),
          yellow: lamp(new THREE.OctahedronGeometry(0.17), 0xffcc00, 0, 0),
          green: lamp(new THREE.SphereGeometry(0.15), 0x34c759, 0.4, 0),
        }
      : {
          red: lamp(new THREE.BoxGeometry(0.12, 0.3, 0.1), 0xff3b30, 0, 0.25),
          green: lamp(new THREE.ConeGeometry(0.15, 0.3, 3), 0x34c759, 0, -0.2),
        };
  head.add(kind === 'vehicle' ? box(1.2, 0.4, 0.3, 0x222222) : box(0.45, 0.85, 0.3, 0x222222));
  for (const l of Object.values(lamps)) head.add(l.mesh);
  return { kind, obj, lamps };
}

// 경로(꺾은선) 위 거리 s의 점과 진행 방향
function along(path: readonly Vec2[], s: number): { p: Vec2; heading: number } {
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1];
    const b = path[i];
    const len = Math.hypot(b.x - a.x, b.z - a.z);
    if (s <= len || i === path.length - 1) {
      const t = s / len;
      return { p: { x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t }, heading: Math.atan2(b.x - a.x, b.z - a.z) };
    }
    s -= len;
  }
  return { p: path[0], heading: 0 };
}

function buildTown(): THREE.Group {
  const g = new THREE.Group();
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshLambertMaterial({ color: 0x8fd18f }));
  ground.rotation.x = -Math.PI / 2;
  g.add(ground);
  for (const { kind, rect } of TOWN.areas) {
    const w = rect.maxX - rect.minX;
    const d = rect.maxZ - rect.minZ;
    if (kind === 'crosswalk') {
      // 줄은 짧은 변 방향으로 길게, 긴 변을 따라 STRIPE 간격으로(차가 오는 쪽에서 보면 세로줄)
      const alongX = w >= d;
      const n = Math.floor((alongX ? w : d) / (STRIPE * 2));
      for (let i = 0; i < n; i++) {
        const stripe = alongX ? box(STRIPE, 0.03, d, WHITE) : box(w, 0.03, STRIPE, WHITE);
        const o = (i + 0.5) * STRIPE * 2;
        stripe.position.set(alongX ? rect.minX + o : (rect.minX + rect.maxX) / 2, 0.03, alongX ? (rect.minZ + rect.maxZ) / 2 : rect.minZ + o);
        g.add(stripe);
      }
      continue;
    }
    const { color, height } = LOOK[kind];
    const b = box(w, height, d, color);
    b.position.set((rect.minX + rect.maxX) / 2, height / 2, (rect.minZ + rect.maxZ) / 2);
    g.add(b);
  }
  // 정지선: 구간 경로의 stopLineS에서 차선을 가로지르는 흰 막대(FR-024)
  for (const seg of SCENARIOS.flatMap((s): readonly SegmentDef[] => s.segments)) {
    const { p, heading } = along(seg.path, seg.stopLineS);
    const line = box(LANE_HALF * 2, 0.03, 0.4, WHITE);
    line.position.set(p.x, 0.03, p.z);
    line.rotation.y = heading;
    g.add(line);
  }
  signals = new Map();
  for (const def of TOWN.signals) {
    const v = signalView(def.kind);
    v.obj.position.set(def.pose.x, 0, def.pose.z);
    v.obj.rotation.y = def.pose.heading;
    g.add(v.obj);
    signals.set(def.id, v);
  }
  return g;
}

// 구간이 다루지 않는 신호는 차 초록·보행자 빨강으로 둠
function drawSignals(states: readonly SignalState[], emphasize: 'vehicle' | 'pedestrian') {
  const blinkOff = Math.floor(performance.now() / FLASH_MS) % 2 === 1;
  for (const [id, v] of signals) {
    const light = states.find((s) => s.id === id)?.light ?? (v.kind === 'vehicle' ? 'green' : 'red');
    const lit = light === 'flashing' ? (blinkOff ? null : 'green') : light;
    for (const [name, l] of Object.entries(v.lamps) as [SignalState['light'], Lamp][]) {
      const on = name === lit;
      const m = l.mesh.material as THREE.MeshLambertMaterial;
      m.color.set(on ? l.on : 0x333333);
      m.emissive.set(on ? l.on : 0x000000);
      l.mesh.scale.setScalar(on ? 1.25 : 1);
    }
    v.obj.scale.setScalar(v.kind === emphasize ? EMPHASIS : 1);
  }
}

function drawWalkers(scene: ScenarioAttempt | null) {
  const list = scene && scene.phase !== 'pedestrianView' ? scene.pedestrians : [];
  list.forEach((p, i) => {
    if (!walkers[i]) group!.add((walkers[i] = pedestrianObject()));
    const w = walkers[i];
    w.visible = true;
    w.position.set(p.pos.x, 0, p.pos.z);
    w.rotation.y = p.heading;
    setPose(w, p.pose);
  });
  for (let i = list.length; i < walkers.length; i++) walkers[i].visible = false;
}

/** 보행자 시점 안내: 카메라를 def.camera로 옮기고(introTicks), 주인공이 지금 카드의 행동을 durationTicks 동안 차례로 */
function drawView(stage: Stage, scene: ScenarioAttempt) {
  const def = SCENARIOS.find((s) => s.id === scene.scenario)!.pedestrianView;
  const view = scene.view!;
  const { pos, lookAt } = def.camera;
  if (view.card < 0) {
    stage.follow(scene.drive);
    const t = Math.min(Math.max(view.cardTicks, 0) / Math.max(def.introTicks, 1), 1);
    stage.camera.position.lerp(new THREE.Vector3(pos.x, pos.y, pos.z), t);
    stage.camera.lookAt(new THREE.Vector3(scene.drive.x, 0, scene.drive.z).lerp(new THREE.Vector3(lookAt.x, lookAt.y, lookAt.z), t));
  } else {
    stage.camera.position.set(pos.x, pos.y, pos.z);
    stage.camera.lookAt(lookAt.x, lookAt.y, lookAt.z);
  }
  if (!protagonist) group!.add((protagonist = pedestrianObject()));
  protagonist.visible = true;
  const path = def.protagonistPath;
  const rule = view.card >= 0 && view.card < view.rules.length ? SAFETY_RULES.find((r) => r.id === view.rules[view.card]) : undefined;
  const poses = rule?.poses.length ? rule.poses : (['idle'] as const);
  const slot = (rule?.durationTicks ?? 1) / poses.length;
  const i = Math.min(Math.floor(Math.max(view.cardTicks, 0) / slot), poses.length - 1);
  const walkT = poses[i] === 'walk' ? (Math.max(view.cardTicks, 0) - i * slot) / slot : 0;
  const total = path.slice(1).reduce((n, b, k) => n + Math.hypot(b.x - path[k].x, b.z - path[k].z), 0);
  const at = along(path, walkT * total);
  protagonist.position.set(at.p.x, 0, at.p.z);
  protagonist.rotation.y = at.heading;
  setPose(protagonist, poses[i]);
  const weather = rule?.weather;
  stage.scene.background = weather ? WEATHER[weather] : SKY;
}

/** 마을(기본 도형) + 신호·횡단보도·정지선 + 등장 보행자 + 아이 차와 탑승객. 상태는 읽기만 함 */
export function renderTown(stage: Stage, play: PlaySession, scene: ScenarioAttempt | DrivingLessonState): void {
  group ??= buildTown();
  stage.show(group);
  const key = `${play.vehicle}:${play.character}`;
  if (key !== carKey) {
    if (car) group.remove(car);
    car = cloneModel(preparedModel(play.vehicle)!);
    seatPassenger(car, play.vehicle, play.character);
    group.add(car);
    carKey = key;
    seated = play.character;
  }
  const { x, z, heading } = scene.drive;
  car!.position.set(x, 0, z);
  car!.rotation.y = heading;
  const attempt = 'scenario' in scene ? scene : null;
  const inView = attempt?.phase === 'pedestrianView';
  drawSignals(attempt?.signals ?? [], inView ? 'pedestrian' : 'vehicle');
  drawWalkers(attempt);
  if (inView) drawView(stage, attempt);
  else {
    if (protagonist) protagonist.visible = false;
    stage.scene.background = SKY;
    stage.follow(scene.drive);
  }
  animateCharacters(group);
}

/** E2E 관찰용(static-paths.md 6장 `__e2e.passenger`): 마지막으로 앉힌 탑승객 */
export function seatedPassenger(): CharacterKindId | null {
  return seated;
}
