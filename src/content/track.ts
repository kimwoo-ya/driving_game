import type { Pose, Vec2 } from '../sim/vehicle';

export type Checkpoint = { arc: number };
export type AiProfile = { laneOffset: number; targetSpeedRatio: number; reactionTicks: number };
export type TrackDef = {
  id: string;
  revision: number;
  laps: 1 | 2;
  centerline: readonly Vec2[];
  width: number;
  checkpoints: readonly Checkpoint[];
  grid: readonly [Pose, Pose, Pose, Pose];
  playerSlot: 0 | 1 | 2 | 3;
  aiProfiles: readonly [AiProfile, AiProfile, AiProfile];
};

// 자리표시: 모서리를 깎은 직사각형 고리(한 바퀴 약 336.6 m). 트랙·주행 조정(T115)에서 확정
// 시작점 (0, 0)에서 +Z로 출발, 체크포인트는 모두 직선 가운데(복귀 후보가 트랙 안에 오도록)
const C = 10 * Math.SQRT2; // 깎은 모서리 길이
export const TRACK = {
  id: 'main',
  revision: 1,
  laps: 2,
  centerline: [
    { x: 0, z: 0 },
    { x: 0, z: 50 },
    { x: 10, z: 60 },
    { x: 50, z: 60 },
    { x: 60, z: 50 },
    { x: 60, z: -50 },
    { x: 50, z: -60 },
    { x: 10, z: -60 },
    { x: 0, z: -50 },
  ],
  width: 14,
  checkpoints: [{ arc: 0 }, { arc: 50 + C + 20 }, { arc: 50 + C + 40 + C + 50 }, { arc: 50 + C + 40 + C + 100 + C + 20 }],
  grid: [
    { x: -3, z: 12, heading: 0 },
    { x: 3, z: 12, heading: 0 },
    { x: -3, z: 6, heading: 0 },
    { x: 3, z: 6, heading: 0 },
  ],
  playerSlot: 3,
  aiProfiles: [
    { laneOffset: -3, targetSpeedRatio: 0.8, reactionTicks: 12 },
    { laneOffset: 3, targetSpeedRatio: 0.75, reactionTicks: 18 },
    { laneOffset: 0, targetSpeedRatio: 0.7, reactionTicks: 24 },
  ],
} as const satisfies TrackDef;
