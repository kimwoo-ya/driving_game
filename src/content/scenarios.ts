import type { Pose, Vec2, Vec3 } from '../sim/vehicle';
import type { CharacterPose } from './characters';
import type { AreaId, SignalId } from './town';

export type ScenarioId = 'signal-wait' | 'crossing-check' | 'turning-car';

export type SafetyActionStep =
  | { action: 'stop' }
  | { action: 'wait'; until: 'vehicleGreen' | 'pedestriansClear' }
  | { action: 'go' };

// 배열 순서 = 한 틱에 여럿일 때 고르는 우선순위(data-model.md 2.1 표 순서)
export type ViolationKind =
  | 'turnedIntoCrossingPedestrian'
  | 'enteredCrosswalkWithPedestrian'
  | 'ranRed'
  | 'earlyStart'
  | 'overStopLine'
  | 'enteredSidewalk';
export type RouteIssue = 'stoppedTooFar' | 'wrongWay' | 'leftPath' | 'blocked';

// 형식 확정(T043, data-model.md 2.1)
export type ActorPlan = {
  redAtS: number | null;
  greenAfterStoppedTicks: number | null;
  pedestrianSignal: SignalId | null; // 구간 차 신호(signal)와 짝인 보행자 신호. 차 신호가 없으면 초록 그대로
  pedestrians: readonly {
    path: readonly Vec2[];
    poses: readonly CharacterPose[];
    start: 'playerStopped' | 'pedestrianGreen';
  }[];
};

export type PedestrianViewDef = {
  segment: number;
  afterStep: number;
  camera: { pos: Vec3; lookAt: Vec3 };
  protagonistPath: readonly Vec2[];
  introTicks: number;
};

export type SegmentDef = {
  id: string;
  start: Pose;
  path: readonly Vec2[];
  stopLineS: number;
  stopZone: { fromS: number; toS: number };
  steps: readonly SafetyActionStep[];
  violations: readonly ViolationKind[];
  signal: SignalId | null;
  crosswalk: AreaId | null;
  plan: ActorPlan;
};

export type ScenarioDef = { id: ScenarioId; segments: readonly SegmentDef[]; pedestrianView: PedestrianViewDef };

// 자리표시(D6) 마을(town.ts) 위의 세 연습. 값(속도·틱·거리)은 연습 조정(T117)에서 확정
const LOOKS = ['lookLeft', 'lookRight', 'lookLeft', 'raiseHand'] as const; // 건너기 전 좌우 살피고 손 들기

// 신호 기다리기: 차 신호 + 짝 보행자 신호, 보행자는 보행자 신호 초록에 출발
const LANE_START: Pose = { x: -2, z: 0, heading: 0 };
const LANE_PATH: readonly Vec2[] = [
  { x: -2, z: 0 },
  { x: -2, z: 70 },
];
const CROSSING: readonly Vec2[] = [
  { x: 6, z: 42 },
  { x: -6, z: 42 },
];
// 보행자 시점 안내는 차가 멈춘 직후(차 빨강·보행자 초록 = 보행자 차례). 차 초록 뒤에 두면 주인공이 빨간불에 건너는 장면이 됨(사용자 지적 2026-10-13)
const VIEW: PedestrianViewDef = {
  segment: 0,
  afterStep: 0,
  camera: { pos: { x: 8.2, y: 1, z: 41.3 }, lookAt: { x: 0, y: 0.8, z: 42 } }, // 아이 눈높이, 주인공 오른쪽 어깨 뒤(주인공은 화면 왼쪽)
  protagonistPath: [
    { x: 6, z: 42.5 },
    { x: -6, z: 42.5 },
  ],
  introTicks: 60,
};

// 횡단 전 주변 차량 확인하기(사용자 결정 2026-10-12: 차·보행자 신호등 있음): 차가 멈추면 보행자가 살피고 건넘 →
// 다 건너고 차 신호도 초록이면 출발. 정지선 = 횡단보도 앞 가장자리(건너는 중 진입은 enteredCrosswalkWithPedestrian)
const CHECK_PATH: readonly Vec2[] = [
  { x: 38, z: 0 },
  { x: 38, z: 70 },
];

// 교차로의 회전 차량 주의하기: x 118 차선에서 반지름 5 m로 우회전(중심 113, 47) → z 52 차선. 회전 방향 횡단보도(x 102~106)의
// 보행자 신호는 초록 고정, 보행자는 아이 차가 회전 전 정지 구역에서 멈춘 뒤 출발(사용자 결정 2026-10-12). 정지선 = 횡단보도 앞 가장자리
const TURN_ARC: Vec2[] = Array.from({ length: 7 }, (_, i) => {
  const a = (i / 6) * (Math.PI / 2);
  return { x: 113 + 5 * Math.cos(a), z: 47 + 5 * Math.sin(a) };
});
const TURN_PATH: readonly Vec2[] = [{ x: 118, z: 0 }, ...TURN_ARC, { x: 106, z: 52 }, { x: 84, z: 52 }];
const TURN_STOP_LINE = TURN_PATH.slice(1, -1).reduce(
  (n, b, i) => n + Math.hypot(b.x - TURN_PATH[i].x, b.z - TURN_PATH[i].z),
  0,
); // 경로를 따라 (106, 52)까지 거리

export const SCENARIOS = [
  {
    id: 'signal-wait',
    segments: [
      {
        id: 'approach',
        start: LANE_START,
        path: LANE_PATH,
        stopLineS: 38,
        stopZone: { fromS: 30, toS: 38 },
        steps: [{ action: 'stop' }, { action: 'wait', until: 'vehicleGreen' }, { action: 'go' }],
        violations: ['overStopLine', 'ranRed', 'earlyStart', 'enteredSidewalk'],
        signal: 'main-vehicle',
        crosswalk: 'main-crosswalk',
        plan: {
          redAtS: 10,
          greenAfterStoppedTicks: 600,
          pedestrianSignal: 'main-pedestrian',
          pedestrians: [{ path: CROSSING, poses: LOOKS, start: 'pedestrianGreen' }],
        },
      },
    ],
    pedestrianView: VIEW,
  },
  {
    id: 'crossing-check',
    segments: [
      {
        id: 'crosswalk',
        start: { x: 38, z: 0, heading: 0 },
        path: CHECK_PATH,
        stopLineS: 40,
        stopZone: { fromS: 32, toS: 40 },
        steps: [
          { action: 'stop' },
          { action: 'wait', until: 'pedestriansClear' },
          { action: 'wait', until: 'vehicleGreen' },
          { action: 'go' },
        ],
        violations: ['enteredCrosswalkWithPedestrian', 'ranRed', 'earlyStart', 'overStopLine', 'enteredSidewalk'],
        signal: 'cross-vehicle',
        crosswalk: 'cross-crosswalk',
        plan: {
          redAtS: 12,
          greenAfterStoppedTicks: 600,
          pedestrianSignal: 'cross-pedestrian',
          pedestrians: [
            {
              path: [
                { x: 46, z: 42 },
                { x: 34, z: 42 },
              ],
              poses: LOOKS,
              start: 'playerStopped',
            },
          ],
        },
      },
    ],
    pedestrianView: {
      segment: 0,
      afterStep: 0, // 멈춘 직후 보행자 차례(VIEW 주석)
      camera: { pos: { x: 48.2, y: 1, z: 41.3 }, lookAt: { x: 40, y: 0.8, z: 42 } },
      protagonistPath: [
        { x: 46, z: 42.5 },
        { x: 34, z: 42.5 },
      ],
      introTicks: 60,
    },
  },
  {
    id: 'turning-car',
    segments: [
      {
        id: 'right-turn',
        start: { x: 118, z: 0, heading: 0 },
        path: TURN_PATH,
        stopLineS: TURN_STOP_LINE,
        stopZone: { fromS: 40, toS: TURN_STOP_LINE }, // 회전하기 전(앞 끝 40, 모퉁이 직전)부터 횡단보도 앞까지 인정(사용자 결정 2026-10-12)
        steps: [{ action: 'stop' }, { action: 'wait', until: 'pedestriansClear' }, { action: 'go' }],
        violations: ['turnedIntoCrossingPedestrian', 'earlyStart', 'overStopLine', 'enteredSidewalk'],
        signal: null,
        crosswalk: 'turn-crosswalk',
        plan: {
          redAtS: null,
          greenAfterStoppedTicks: null,
          pedestrianSignal: 'turn-pedestrian',
          pedestrians: [
            {
              path: [
                { x: 104, z: 60 },
                { x: 104, z: 48 },
              ],
              poses: LOOKS,
              start: 'playerStopped',
            },
          ],
        },
      },
    ],
    pedestrianView: {
      segment: 0,
      afterStep: 1,
      camera: { pos: { x: 105.7, y: 1, z: 62.2 }, lookAt: { x: 107, y: 0.8, z: 50 } }, // 걷는 쪽 + 도는 차가 오는 오른쪽
      protagonistPath: [
        { x: 104.5, z: 60 },
        { x: 104.5, z: 48 },
      ],
      introTicks: 60,
    },
  },
] as const satisfies readonly ScenarioDef[];
