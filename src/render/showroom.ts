import * as THREE from 'three';
import { CHARACTERS } from '../content/characters';
import { VEHICLES } from '../content/vehicles';
import { animateCharacters, characterObject } from './characters';
import { cloneModel, preparedModel } from './models';
import type { Stage } from './stage';

type List = 'vehicles' | 'characters';

// 진열 배치(꾸밈 값). 칸 간격(m), 카메라 높이(m), 쉬는 방향(rad, 차는 비스듬히 보이게)
const LAYOUT: Record<List, { spacing: number; eyeY: number; restYaw: number }> = {
  vehicles: { spacing: 3.2, eyeY: 0.6, restYaw: 0.6 },
  characters: { spacing: 2.4, eyeY: 0.8, restYaw: 0 },
};
const CHARACTER_SHOW_HEIGHT = 1.6; // m
const PICKED_SCALE = 1.25;
const SPIN_RAD_PER_SEC = 1;

const groups: Partial<Record<List, THREE.Group>> = {};

// 칸 i는 x = (i − (n−1)/2) × 간격. 카메라가 −Z를 보므로 왼쪽부터 0번 = DOM 버튼 열 순서와 같음
function build(list: List): THREE.Group {
  const items =
    list === 'vehicles'
      ? VEHICLES.map((v) => cloneModel(preparedModel(v.id)!))
      : CHARACTERS.map((c) => characterObject(c.id, CHARACTER_SHOW_HEIGHT));
  const g = new THREE.Group();
  items.forEach((item, i) => {
    const slot = new THREE.Group().add(item);
    slot.position.x = (i - (items.length - 1) / 2) * LAYOUT[list].spacing;
    g.add(slot);
  });
  return g;
}

/** 차량 5종 또는 인물 3종을 한 줄로 진열하고 고른 것만 확대·회전(research R6) */
export function renderShowroom(stage: Stage, list: List, selected: number | null): void {
  const g = (groups[list] ??= build(list));
  stage.show(g);
  const { spacing, eyeY, restYaw } = LAYOUT[list];
  const spin = (performance.now() / 1000) * SPIN_RAD_PER_SEC;
  g.children.forEach((slot, i) => {
    slot.scale.setScalar(i === selected ? PICKED_SCALE : 1);
    slot.rotation.y = i === selected ? spin : restYaw;
  });
  animateCharacters(g);

  // 줄 전체 폭이 화면 가로에 맞도록 거리를 정함 → 칸 중심이 같은 폭의 DOM 버튼 중심과 맞음
  const cam = stage.camera;
  const half = (g.children.length * spacing) / 2;
  const dist = half / (Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * cam.aspect);
  cam.position.set(0, eyeY, dist);
  cam.lookAt(0, eyeY, 0);
}
