import { SCENARIOS } from '../content/scenarios';
import { type DriveInput, type DriveState, requestGearToggle, restingAt, stepVehicle } from '../sim/vehicle';
import { IDLE_HINT_TICKS, type ScenarioEvent } from './scenario';

export type DrivingLessonState = {
  step: 'steer' | 'accel' | 'brake' | 'reverse';
  idleTicks: number;
  drive: DriveState;
};
export type DrivingLessonEvent = Extract<ScenarioEvent, { type: 'hint' }> | { type: 'lessonDone' };

const NEXT = { steer: 'accel', accel: 'brake', brake: 'reverse' } as const;

export function startDrivingLesson(): { state: DrivingLessonState; events: DrivingLessonEvent[] } {
  return {
    state: { step: 'steer', idleTicks: 0, drive: restingAt(SCENARIOS[0].segments[0].start) },
    events: [{ type: 'hint', cue: 'steer', repeat: false }],
  };
}

// 후진 전환은 마지막 단계에서만 받으므로, 후진 단계에서 기어가 reverse면 이미 끝난 상태
const finished = (s: DrivingLessonState) => s.step === 'reverse' && s.drive.gear === 'reverse';

export function stepDrivingLesson(
  state: DrivingLessonState,
  input: DriveInput,
  gearTap: boolean,
): { state: DrivingLessonState; events: DrivingLessonEvent[] } {
  if (finished(state)) return { state, events: [] };

  if (state.step === 'reverse' && gearTap) {
    const r = requestGearToggle(state.drive);
    if (r.accepted) return { state: { ...state, idleTicks: 0, drive: r.state }, events: [{ type: 'lessonDone' }] };
  }

  const drive = stepVehicle(state.drive, input);
  const done =
    (state.step === 'steer' && input.steer !== 0) ||
    (state.step === 'accel' && drive.speed > 0) ||
    (state.step === 'brake' && input.brake && state.drive.speed > 0 && drive.speed === 0);
  if (done && state.step !== 'reverse') {
    const step = NEXT[state.step];
    return { state: { step, idleTicks: 0, drive }, events: [{ type: 'hint', cue: step, repeat: false }] };
  }

  const idle = input.steer === 0 && !input.throttle && !input.brake && !gearTap;
  const idleTicks = idle ? state.idleTicks + 1 : 0;
  if (idleTicks >= IDLE_HINT_TICKS) {
    return { state: { ...state, idleTicks: 0, drive }, events: [{ type: 'hint', cue: state.step, repeat: true }] };
  }
  return { state: { ...state, idleTicks, drive }, events: [] };
}
