import { TICK_HZ } from '../core/loop';

export type Vec2 = { x: number; z: number };
export type Vec3 = { x: number; y: number; z: number };
export type Pose = { x: number; z: number; heading: number };
export type Gear = 'forward' | 'reverse';
export type DriveInput = { steer: number; throttle: boolean; brake: boolean };
export type DriveState = { x: number; z: number; heading: number; speed: number; gear: Gear };
export type DrivingSpec = {
  maxForwardSpeed: number;
  maxReverseSpeed: number;
  acceleration: number;
  brakeDeceleration: number;
  coastDeceleration: number;
  stopSnapSpeed: number;
  maxSteerRate: number;
  bodyLength: number;
  bodyRadius: number;
};

// 자리값(plan O5): 트랙·주행 조정(T115)에서 확정
export const DRIVING_SPEC: DrivingSpec = {
  maxForwardSpeed: 8,
  maxReverseSpeed: 3,
  acceleration: 4,
  brakeDeceleration: 10,
  coastDeceleration: 2,
  stopSnapSpeed: 0.3,
  maxSteerRate: 1.6,
  bodyLength: 2.4,
  bodyRadius: 1,
};

const DT = 1 / TICK_HZ;

export function stepVehicle(state: DriveState, input: DriveInput): DriveState {
  const s = DRIVING_SPEC;
  const steer = Math.min(Math.max(input.steer, -1), 1);
  const throttle = input.throttle && !input.brake;
  const maxSpeed = state.gear === 'forward' ? s.maxForwardSpeed : s.maxReverseSpeed;
  const delta = input.brake ? -s.brakeDeceleration : throttle ? s.acceleration : -s.coastDeceleration;
  let speed = Math.min(Math.max(state.speed + delta * DT, 0), maxSpeed);
  if (!throttle && speed < s.stopSnapSpeed) speed = 0;
  const dir = state.gear === 'forward' ? 1 : -1;
  // steer +1 = 왼쪽(heading 증가). 회전 반경이 속도와 무관하게 maxForwardSpeed / maxSteerRate로 같음
  const heading = state.heading + steer * s.maxSteerRate * (speed / s.maxForwardSpeed) * dir * DT;
  return {
    x: state.x + Math.sin(heading) * speed * dir * DT,
    z: state.z + Math.cos(heading) * speed * dir * DT,
    heading,
    speed,
    gear: state.gear,
  };
}

export function requestGearToggle(state: DriveState): { state: DriveState; accepted: boolean } {
  if (state.speed !== 0) return { state, accepted: false };
  return { state: { ...state, gear: state.gear === 'forward' ? 'reverse' : 'forward' }, accepted: true };
}

export function restingAt(pose: Pose): DriveState {
  return { x: pose.x, z: pose.z, heading: pose.heading, speed: 0, gear: 'forward' };
}
