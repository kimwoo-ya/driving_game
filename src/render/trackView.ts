import * as THREE from 'three';
import type { PlaySession } from '../app/flow';
import type { CharacterKindId } from '../content/characters';
import { TRACK } from '../content/track';
import type { RaceState } from '../race/race';
import { pointOnTrack } from '../sim/collision';
import { DRIVING_SPEC, type Vec2 } from '../sim/vehicle';
import { animateCharacters, seatPassenger } from './characters';
import { cloneModel, preparedModel } from './models';
import type { Stage } from './stage';

// 마을(풀밭·회색 길·주황 건물)과 뚜렷이 다르게: 모래 바닥, 짙은 남색 노면, 빨강·흰 줄무늬 벽, 체크무늬 결승선(FR-052)
const SAND = 0xe9c46a;
const ASPHALT = 0x3d405b;
const STRIPES = [0xe5383b, 0xffffff];
const WALL = { height: 0.6, thick: 0.4, piece: 2 }; // m, 줄무늬 한 칸 길이 piece
const CHECK = 1; // 결승선 칸(m)
const ARCH_HEIGHT = 4;
// 아이 차 바닥의 노란 고리(FR-053). 뒤따르는 카메라에서 앞차와 겹쳐 보이지 않게 바닥에 둠. 크기는 모델이 아니라 DRIVING_SPEC 기준
const RING = { inner: DRIVING_SPEC.bodyLength * 0.65, outer: DRIVING_SPEC.bodyLength * 0.8 };
const SKY = new THREE.Color(0x9fd8ff);

let group: THREE.Group | null = null;
let marker: THREE.Object3D;
let cars: THREE.Object3D[] = [];
let carsKey = '';
let seated: CharacterKindId | null = null;

const lambert = (color: number) => new THREE.MeshLambertMaterial({ color });
const unitBox = new THREE.BoxGeometry(1, 1, 1);
const box = (w: number, h: number, d: number, material: THREE.Material) => {
  const m = new THREE.Mesh(unitBox, material);
  m.scale.set(w, h, d);
  return m;
};

// 중심선을 왼쪽으로 d만큼 민 닫힌 꺾은선(꼭짓점은 양쪽 선분에서 같은 거리, miter)
function offsetLoop(d: number): Vec2[] {
  const pts = TRACK.centerline;
  const left = (a: Vec2, b: Vec2) => {
    const len = Math.hypot(b.x - a.x, b.z - a.z);
    return { x: (b.z - a.z) / len, z: -(b.x - a.x) / len };
  };
  return pts.map((p, i) => {
    const n1 = left(pts[(i - 1 + pts.length) % pts.length], p);
    const n2 = left(p, pts[(i + 1) % pts.length]);
    const k = d / (1 + n1.x * n2.x + n1.z * n2.z);
    return { x: p.x + (n1.x + n2.x) * k, z: p.z + (n1.z + n2.z) * k };
  });
}

// 바닥 평면 위 도형: (x, z)를 Vector2(x, −z)로 두고 −90° 눕힘(위를 향함)
const flat = (loop: Vec2[]) => loop.map((p) => new THREE.Vector2(p.x, -p.z));

function buildTrack(): THREE.Group {
  const g = new THREE.Group();
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), lambert(SAND));
  ground.rotation.x = -Math.PI / 2;
  g.add(ground);

  // 노면: 바깥 고리에서 안쪽 고리를 뺀 모양(넓이가 큰 쪽이 바깥)
  const [a, b] = [flat(offsetLoop(TRACK.width / 2)), flat(offsetLoop(-TRACK.width / 2))];
  const [outer, inner] = Math.abs(THREE.ShapeUtils.area(a)) > Math.abs(THREE.ShapeUtils.area(b)) ? [a, b] : [b, a];
  const shape = new THREE.Shape(outer);
  shape.holes.push(new THREE.Path(inner));
  const road = new THREE.Mesh(new THREE.ShapeGeometry(shape), lambert(ASPHALT));
  road.rotation.x = -Math.PI / 2;
  road.position.y = 0.02;
  g.add(road);

  // 양쪽 벽: 줄무늬 칸으로 나눈 낮은 상자(판정 벽은 collision.ts의 폭 기준, 이건 보이는 표시)
  const stripe = STRIPES.map(lambert);
  for (const side of [1, -1]) {
    const loop = offsetLoop(side * (TRACK.width / 2 + WALL.thick / 2));
    loop.forEach((p, i) => {
      const q = loop[(i + 1) % loop.length];
      const len = Math.hypot(q.x - p.x, q.z - p.z);
      const n = Math.max(1, Math.round(len / WALL.piece));
      for (let k = 0; k < n; k++) {
        const piece = box(WALL.thick, WALL.height, len / n, stripe[(i + k) % 2]);
        const t = (k + 0.5) / n;
        piece.position.set(p.x + (q.x - p.x) * t, WALL.height / 2, p.z + (q.z - p.z) * t);
        piece.rotation.y = Math.atan2(q.x - p.x, q.z - p.z);
        g.add(piece);
      }
    });
  }

  // 결승선(체크포인트 0)
  const { p, t } = pointOnTrack(TRACK, TRACK.checkpoints[0].arc);
  g.add(finishGate(p, t, TRACK.width));

  marker = new THREE.Mesh(new THREE.RingGeometry(RING.inner, RING.outer, 32), new THREE.MeshBasicMaterial({ color: 0xffd23f }));
  marker.rotation.x = -Math.PI / 2;
  g.add(marker);
  return g;
}

/** 바닥 체크무늬 두 줄 + 같은 무늬의 문. p = 가운데, t = 진행 방향(단위 벡터), width = 폭(m). 트랙 결승선·연습 도착 지점 공용 */
export function finishGate(p: Vec2, t: Vec2, width: number): THREE.Group {
  const g = new THREE.Group();
  const nrm = { x: t.z, z: -t.x };
  const check = [lambert(0x111111), lambert(0xffffff)];
  const heading = Math.atan2(t.x, t.z);
  const cols = Math.round(width / CHECK);
  for (let row = 0; row < 2; row++) {
    for (let c = 0; c < cols; c++) {
      const across = -width / 2 + (c + 0.5) * CHECK;
      const along = (row - 0.5) * CHECK;
      const tile = box(CHECK, 0.02, CHECK, check[(row + c) % 2]);
      tile.position.set(p.x + nrm.x * across + t.x * along, 0.04, p.z + nrm.z * across + t.z * along);
      tile.rotation.y = heading;
      g.add(tile);
      const top = box(CHECK, CHECK / 2, 0.3, check[(row + c) % 2]); // 문 위 띠
      top.position.set(p.x + nrm.x * across, ARCH_HEIGHT + row * (CHECK / 2), p.z + nrm.z * across);
      top.rotation.y = heading;
      g.add(top);
    }
  }
  for (const side of [1, -1]) {
    const post = box(0.3, ARCH_HEIGHT + CHECK, 0.3, check[0]);
    const off = side * (width / 2 + WALL.thick);
    post.position.set(p.x + nrm.x * off, (ARCH_HEIGHT + CHECK) / 2, p.z + nrm.z * off);
    g.add(post);
  }
  return g;
}

/** 트랙 + 4대 + 아이 차 탑승객·바닥 고리 + 아이 차를 따라가는 카메라. 상태는 읽기만 함 */
export function renderTrack(stage: Stage, play: PlaySession, race: RaceState): void {
  group ??= buildTrack();
  stage.show(group);
  const key = `${play.character}:${race.cars.map((c) => c.vehicle).join()}`;
  if (key !== carsKey) {
    for (const c of cars) group.remove(c);
    cars = race.cars.map((c) => {
      const obj = cloneModel(preparedModel(c.vehicle)!);
      if (c.isPlayer) seatPassenger(obj, c.vehicle, play.character);
      group!.add(obj);
      return obj;
    });
    carsKey = key;
    seated = play.character;
  }
  race.cars.forEach((c, i) => {
    cars[i].position.set(c.drive.x, 0, c.drive.z);
    cars[i].rotation.y = c.drive.heading;
  });
  const me = race.cars.find((c) => c.isPlayer)!.drive;
  marker.position.set(me.x, 0.06, me.z);
  stage.scene.background = SKY;
  stage.follow(me);
  animateCharacters(group);
}

/** E2E 관찰용(static-paths.md 6장 `__e2e.passenger`): 레이싱 화면 아이 차 탑승객 */
export function racePassenger(): CharacterKindId | null {
  return seated;
}
