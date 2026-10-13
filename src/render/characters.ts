import * as THREE from 'three';
import { CHARACTERS, type CharacterKindId, type CharacterPose } from '../content/characters';
import { VEHICLES, type VehicleKindId } from '../content/vehicles';
import { cloneModel, preparedModel } from './models';

// 꾸밈 애니메이션이라 실제 시간(modules.md 9장 "시간")
let last = performance.now();

// 등장 보행자·보행자 시점 안내 주인공은 Chicken Guy 고정(FR-096). 자세 값은 자세 점검(T061, records/tooling-and-render.md)에서 정함
const PEDESTRIAN_HEIGHT = 1.2; // m
const LOOK_YAW = Math.PI / 3; // lookLeft +, lookRight −(Head 관절 Y축)
// 들 손은 인물의 오른손 고정, 안내에서 어느 손인지 말하지 않음(FR-095). 이 모델의 손 이름은 거울 방향이라 오른손이 'HandL'.
// 팔 없이 손이 CORE에 바로 붙어 있어 손 위치를 머리 위로 옮김
const RAISED_HAND = 'HandL';
const RAISED_Y = 0.92; // 든 손 높이(키 1 기준, 머리 상자 위·볏 옆)
const RAISE_OUT = 1.4; // 머리 상자에 가리지 않게 옆으로 벌림

type Rig = {
  root: THREE.Object3D;
  mixer: THREE.AnimationMixer;
  idle: THREE.AnimationAction;
  walk: THREE.AnimationAction;
  head?: THREE.Object3D;
  hand?: THREE.Object3D;
  rest: { head?: THREE.Quaternion; hand?: THREE.Vector3 };
  pose: CharacterPose;
};

/** 인물을 복제해 키를 height(m)로 맞추고 clips.idle을 재생한다. 정규화된 키가 1 m라 scale = height */
export function characterObject(id: CharacterKindId, height: number): THREE.Object3D {
  const model = preparedModel(id)!;
  const obj = cloneModel(model);
  obj.scale.setScalar(height);
  const idle = CHARACTERS.find((c) => c.id === id)!.clips.idle;
  const clip = model.clips.find((c) => c.name === idle);
  if (clip) {
    const mixer = new THREE.AnimationMixer(obj);
    mixer.clipAction(clip).play();
    obj.userData.mixer = mixer;
  }
  return obj;
}

/** 차량 표시 객체의 자식으로 seats[0]에 탑승객을 앉힌다. 판정·카메라에 값을 되돌리지 않음(FR-011, FR-097) */
export function seatPassenger(car: THREE.Object3D, vehicle: VehicleKindId, character: CharacterKindId): void {
  const seat = VEHICLES.find((v) => v.id === vehicle)!.seats[0];
  const passenger = characterObject(character, seat.height);
  passenger.position.set(seat.pos.x, seat.pos.y, seat.pos.z);
  car.add(passenger);
}

/** Chicken Guy 보행자: Idle·Walk 두 클립만 씀(Sprint·Jump 재생 안 함, FR-094) */
export function pedestrianObject(): THREE.Object3D {
  const model = preparedModel('chicken-guy')!;
  const obj = cloneModel(model);
  obj.scale.setScalar(PEDESTRIAN_HEIGHT);
  const mixer = new THREE.AnimationMixer(obj);
  const { idle, walk } = CHARACTERS.find((c) => c.id === 'chicken-guy')!.clips;
  const action = (name: string) => mixer.clipAction(model.clips.find((c) => c.name === name)!);
  const head = obj.getObjectByName('Head');
  const hand = obj.getObjectByName(RAISED_HAND);
  const rig: Rig = {
    root: obj,
    mixer,
    idle: action(idle!),
    walk: action(walk!),
    head,
    hand,
    rest: { head: head?.quaternion.clone(), hand: hand?.position.clone() },
    pose: 'idle',
  };
  rig.idle.play();
  obj.userData.rig = rig;
  return obj;
}

/** 보행자 자세를 바꿈. 걷기만 Walk 클립, 나머지는 Idle 위에 관절 자세를 덮어씀 */
export function setPose(obj: THREE.Object3D, pose: CharacterPose): void {
  const rig = obj.userData.rig as Rig;
  if (pose === rig.pose) return;
  if ((pose === 'walk') !== (rig.pose === 'walk')) {
    (pose === 'walk' ? rig.idle : rig.walk).stop();
    (pose === 'walk' ? rig.walk : rig.idle).play();
  }
  rig.pose = pose;
}

// 클립 갱신 뒤에 Head·손 자세를 덮어씀(assets.md 5장). 클립이 그 관절을 움직이지 않아도 쌓이지 않게 먼저 쉬는 자세로 되돌림
function updateRig(rig: Rig, dt: number) {
  if (rig.head && rig.rest.head) rig.head.quaternion.copy(rig.rest.head);
  if (rig.hand && rig.rest.hand) rig.hand.position.copy(rig.rest.hand);
  rig.mixer.update(dt);
  if (rig.head && (rig.pose === 'lookLeft' || rig.pose === 'lookRight')) {
    rig.head.rotateY(rig.pose === 'lookLeft' ? LOOK_YAW : -LOOK_YAW);
  }
  if (rig.hand && rig.pose === 'raiseHand') {
    // 인물 좌표(크기 조절 전 키 1)에서 손을 머리 위로 옮긴 뒤 손의 부모(CORE) 좌표로
    const p = rig.root.worldToLocal(rig.hand.getWorldPosition(new THREE.Vector3()));
    p.set(p.x * RAISE_OUT, RAISED_Y, p.z);
    rig.hand.position.copy(rig.hand.parent!.worldToLocal(rig.root.localToWorld(p)));
  }
}

/** root 아래 인물의 클립을 지난 호출 이후 실제 시간만큼 진행. 화면마다 프레임당 1번 */
export function animateCharacters(root: THREE.Object3D): void {
  const now = performance.now();
  const dt = (now - last) / 1000;
  last = now;
  root.traverse((o) => {
    const rig = o.userData.rig as Rig | undefined;
    if (rig) updateRig(rig, dt);
    else (o.userData.mixer as THREE.AnimationMixer | undefined)?.update(dt);
  });
}
