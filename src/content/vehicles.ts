import type { Vec3 } from '../sim/vehicle';

export type VehicleKindId = 'buggy' | 'jeep' | 'truck' | 'wagon' | 'banana-car';
export type SeatDef = { pos: Vec3; height: number };
export type VehicleKind = { id: VehicleKindId; label: string; yawDeg: number; seats: readonly SeatDef[] };

// yawDeg·seats는 모델 렌더링 점검(T042)에서 정함(records/tooling-and-render.md). 운전석이 있는 차는 옆자리,
// 트럭은 운전석이 막혀 머리가 지붕 위로 보이게(사용자 결정 2026-10-12)
const CENTER: SeatDef = { pos: { x: 0, y: 0.6, z: 0 }, height: 0.8 };

export const VEHICLES = [
  { id: 'buggy', label: '버기', yawDeg: 90, seats: [{ pos: { x: -0.17, y: 0.3, z: 0.15 }, height: 0.8 }] },
  { id: 'jeep', label: '지프', yawDeg: 0, seats: [{ pos: { x: 0.18, y: 0.4, z: -0.18 }, height: 0.8 }] },
  { id: 'truck', label: '트럭', yawDeg: 73, seats: [CENTER] },
  { id: 'wagon', label: '왜건', yawDeg: 0, seats: [CENTER] },
  { id: 'banana-car', label: '바나나 자동차', yawDeg: 0, seats: [CENTER] },
] as const satisfies readonly VehicleKind[];
