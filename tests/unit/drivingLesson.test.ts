import { describe, expect, it } from 'vitest';
import { SCENARIOS } from '../../src/content/scenarios';
import {
  type DrivingLessonEvent,
  type DrivingLessonState,
  startDrivingLesson,
  stepDrivingLesson,
} from '../../src/practice/drivingLesson';
import { IDLE_HINT_TICKS } from '../../src/practice/scenario';
import { type DriveInput, restingAt } from '../../src/sim/vehicle';

const IDLE: DriveInput = { steer: 0, throttle: false, brake: false };
const LEFT: DriveInput = { steer: 1, throttle: false, brake: false };
const GAS: DriveInput = { steer: 0, throttle: true, brake: false };
const BRAKE: DriveInput = { steer: 0, throttle: false, brake: true };

function run(state: DrivingLessonState, input: DriveInput, ticks: number, gearTap = false) {
  const events: DrivingLessonEvent[] = [];
  for (let i = 0; i < ticks; i++) {
    const r = stepDrivingLesson(state, input, gearTap);
    state = r.state;
    events.push(...r.events);
  }
  return { state, events };
}

/** 네 단계를 차례로 마친 상태와 그동안의 이벤트 */
function completeLesson() {
  let { state } = startDrivingLesson();
  const events: DrivingLessonEvent[] = [];
  for (const [input, ticks, tap] of [
    [LEFT, 1, false],
    [GAS, 30, false],
    [BRAKE, 120, false],
    [IDLE, 1, true],
  ] as const) {
    const r = run(state, input, ticks, tap);
    state = r.state;
    events.push(...r.events);
  }
  return { state, events };
}

describe('조작 익히기 (modules.md 4.3, FR-027)', () => {
  it('시작은 steer 안내와 첫 연습 구간의 전진·정지 자세', () => {
    const { state, events } = startDrivingLesson();
    expect(events).toEqual([{ type: 'hint', cue: 'steer', repeat: false }]);
    expect(state).toEqual({ step: 'steer', idleTicks: 0, drive: restingAt(SCENARIOS[0].segments[0].start) });
  });

  it('조향 → 액셀 → 브레이크 → 후진 전환을 직접 하면 순서대로 넘어가고 lessonDone 1회', () => {
    const { state, events } = completeLesson();
    expect(events).toEqual([
      { type: 'hint', cue: 'accel', repeat: false },
      { type: 'hint', cue: 'brake', repeat: false },
      { type: 'hint', cue: 'reverse', repeat: false },
      { type: 'lessonDone' },
    ]);
    expect(state.drive.gear).toBe('reverse');
  });

  it('lessonDone 뒤에는 no-op', () => {
    const { state } = completeLesson();
    for (const [input, tap] of [[GAS, false], [IDLE, true], [IDLE, false]] as const) {
      const r = stepDrivingLesson(state, input, tap);
      expect(r.state).toBe(state);
      expect(r.events).toEqual([]);
    }
  });

  it('그 단계의 조작이 없으면 넘어가지 않는다', () => {
    // 후진 단계 전에는 멈춘 채 탭 1번도 기어 그대로 (modules.md 4.3 "후진 탭")
    const gearAfterTap = (s: DrivingLessonState) => stepDrivingLesson(s, IDLE, true).state.drive.gear;
    let { state } = startDrivingLesson();
    expect(gearAfterTap(state)).toBe('forward');
    expect(run(state, GAS, 60, true).state.step).toBe('steer'); // 액셀·후진 탭으로는 조향 단계 통과 안 함
    state = run(state, LEFT, 1).state;
    expect(gearAfterTap(state)).toBe('forward');
    expect(run(state, IDLE, 60, true).state.step).toBe('accel');
    state = run(state, GAS, 30).state;
    const coasted = run(state, IDLE, 600).state; // 자연 감속으로 선 것은 브레이크 단계 통과 아님
    expect(coasted.drive.speed).toBe(0);
    expect(coasted.step).toBe('brake');
    expect(gearAfterTap(coasted)).toBe('forward');
    expect(run(coasted, BRAKE, 1).state.step).toBe('brake'); // 선 뒤 브레이크만으로도 통과 아님
    state = run(state, BRAKE, 120).state;
    expect(state.step).toBe('reverse');
    state = run(state, GAS, 30).state; // 움직이는 중 후진 탭은 거절
    expect(run(state, GAS, 1, true).events).toEqual([]);
  });

  it('무입력이 IDLE_HINT_TICKS마다 repeat 안내, 실패·시간제한 없음 (FR-031, FR-038)', () => {
    const { state } = startDrivingLesson();
    const r = run(state, IDLE, 36_000);
    expect(r.events).toHaveLength(Math.floor(36_000 / IDLE_HINT_TICKS));
    expect(r.events.every((e) => e.type === 'hint' && e.cue === 'steer' && e.repeat)).toBe(true);
    expect(r.state.step).toBe('steer');
  });
});
