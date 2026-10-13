import type { Pose } from '../sim/vehicle';
import type { ScenarioId } from './scenarios';

export type Rect = { minX: number; minZ: number; maxX: number; maxZ: number };
export type AreaId =
  | 'main-road'
  | 'main-crosswalk'
  | 'main-sidewalk-left'
  | 'main-sidewalk-right'
  | 'main-building-left'
  | 'main-building-right'
  | 'cross-road'
  | 'cross-crosswalk'
  | 'cross-sidewalk-left'
  | 'cross-sidewalk-right'
  | 'cross-building-left'
  | 'cross-building-right'
  | 'turn-road'
  | 'turn-side-road'
  | 'turn-crosswalk'
  | 'turn-sidewalk-left'
  | 'turn-sidewalk-right'
  | 'turn-sidewalk-north'
  | 'turn-sidewalk-north-east'
  | 'turn-sidewalk-north-left'
  | 'turn-sidewalk-north-right'
  | 'turn-sidewalk-south'
  | 'turn-building';
export type SignalId = 'main-vehicle' | 'main-pedestrian' | 'cross-vehicle' | 'cross-pedestrian' | 'turn-pedestrian';
export type SignalDef = { id: SignalId; kind: 'vehicle' | 'pedestrian'; pose: Pose };
export type SceneElementId =
  | 'parked-cars'
  | 'reversing-car'
  | 'large-vehicle'
  | 'school-bus'
  | 'bus-stop'
  | 'alley'
  | 'no-sidewalk-road'
  | 'unsignalized-crosswalk'
  | 'yellow-wait-line'
  | 'overpass-or-underpass'
  | 'rolling-ball'
  | 'object-under-car';
export type ScenePropPlacement = { element: SceneElementId; near: ScenarioId; pose: Pose };
export type TownDef = {
  areas: readonly { id: AreaId; kind: 'road' | 'crosswalk' | 'sidewalk' | 'building'; rect: Rect }[];
  signals: readonly SignalDef[];
  props: readonly ScenePropPlacement[];
};

// 자리표시(D6). 차는 오른쪽 차선(진행 방향 오른쪽 = +Z로 갈 때 −X)으로 달림
// - main(신호 기다리기): x 0 중심 +Z 직선 도로, 차선 x = −2
// - cross(횡단 전 주변 차량 확인하기): x 40 중심 +Z 직선 도로, 차선 x = 38, 정지선 = 횡단보도 앞 가장자리
// - turn(교차로의 회전 차량 주의하기): x 120 중심 +Z 도로 → z 54 중심 옆길로 우회전, 회전 방향 횡단보도.
//   네거리라 회전 대신 직진해도 도로 위(방향 안내 → 구간 다시, FR-034)
export const TOWN = {
  areas: [
    { id: 'main-road', kind: 'road', rect: { minX: -4, minZ: -10, maxX: 4, maxZ: 80 } },
    { id: 'main-crosswalk', kind: 'crosswalk', rect: { minX: -4, minZ: 40, maxX: 4, maxZ: 44 } },
    { id: 'main-sidewalk-left', kind: 'sidewalk', rect: { minX: 4, minZ: -10, maxX: 8, maxZ: 80 } },
    { id: 'main-sidewalk-right', kind: 'sidewalk', rect: { minX: -8, minZ: -10, maxX: -4, maxZ: 80 } },
    { id: 'main-building-left', kind: 'building', rect: { minX: 8, minZ: 0, maxX: 20, maxZ: 30 } },
    { id: 'main-building-right', kind: 'building', rect: { minX: -20, minZ: 0, maxX: -8, maxZ: 30 } },
    { id: 'cross-road', kind: 'road', rect: { minX: 36, minZ: -10, maxX: 44, maxZ: 80 } },
    { id: 'cross-crosswalk', kind: 'crosswalk', rect: { minX: 36, minZ: 40, maxX: 44, maxZ: 44 } },
    { id: 'cross-sidewalk-left', kind: 'sidewalk', rect: { minX: 44, minZ: -10, maxX: 48, maxZ: 80 } },
    { id: 'cross-sidewalk-right', kind: 'sidewalk', rect: { minX: 32, minZ: -10, maxX: 36, maxZ: 80 } },
    { id: 'cross-building-left', kind: 'building', rect: { minX: 48, minZ: 0, maxX: 60, maxZ: 30 } },
    { id: 'cross-building-right', kind: 'building', rect: { minX: 20, minZ: 0, maxX: 32, maxZ: 30 } },
    { id: 'turn-road', kind: 'road', rect: { minX: 116, minZ: -10, maxX: 124, maxZ: 80 } },
    { id: 'turn-side-road', kind: 'road', rect: { minX: 76, minZ: 50, maxX: 140, maxZ: 58 } },
    { id: 'turn-crosswalk', kind: 'crosswalk', rect: { minX: 102, minZ: 50, maxX: 106, maxZ: 58 } },
    // 회전 안쪽 모퉁이(x 110~116, z 42~50)는 비워 둠: 반지름 5 m 우회전에서 차체가 보도에 닿지 않게
    { id: 'turn-sidewalk-left', kind: 'sidewalk', rect: { minX: 124, minZ: -10, maxX: 128, maxZ: 50 } },
    { id: 'turn-sidewalk-right', kind: 'sidewalk', rect: { minX: 112, minZ: -10, maxX: 116, maxZ: 42 } },
    // 북서쪽 모퉁이(x 112~116, z 58~62)도 비워 둠: 교차로에서 오른쪽으로 쏠려 직진한 차가 보도보다 구간 다시(leftPath)에 먼저 닿게
    { id: 'turn-sidewalk-north', kind: 'sidewalk', rect: { minX: 76, minZ: 58, maxX: 112, maxZ: 62 } },
    { id: 'turn-sidewalk-north-east', kind: 'sidewalk', rect: { minX: 124, minZ: 58, maxX: 140, maxZ: 62 } },
    { id: 'turn-sidewalk-north-left', kind: 'sidewalk', rect: { minX: 124, minZ: 62, maxX: 128, maxZ: 80 } },
    { id: 'turn-sidewalk-north-right', kind: 'sidewalk', rect: { minX: 112, minZ: 62, maxX: 116, maxZ: 80 } },
    { id: 'turn-sidewalk-south', kind: 'sidewalk', rect: { minX: 76, minZ: 46, maxX: 110, maxZ: 50 } },
    { id: 'turn-building', kind: 'building', rect: { minX: 96, minZ: 0, maxX: 108, maxZ: 40 } },
  ],
  signals: [
    { id: 'main-vehicle', kind: 'vehicle', pose: { x: -5, z: 39, heading: Math.PI } },
    // 보행자 신호는 길 건너편에서 기다리는 보행자 쪽(+X)을 봄
    { id: 'main-pedestrian', kind: 'pedestrian', pose: { x: -5, z: 45, heading: Math.PI / 2 } },
    { id: 'cross-vehicle', kind: 'vehicle', pose: { x: 35, z: 39, heading: Math.PI } },
    { id: 'cross-pedestrian', kind: 'pedestrian', pose: { x: 35, z: 45, heading: Math.PI / 2 } },
    { id: 'turn-pedestrian', kind: 'pedestrian', pose: { x: 107, z: 47, heading: 0 } }, // 북쪽에서 기다리는 보행자 쪽(+Z)
  ],
  props: [],
} as const satisfies TownDef;
