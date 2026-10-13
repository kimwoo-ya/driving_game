import { describe, expect, it } from 'vitest';
import { createRunState } from '../../src/app/session';

describe('createRunState', () => {
  it('저장 기록이 없으면 data-model.md 2.2 시작값', () => {
    const run = createRunState({ v: 1, tutorialDone: false, best: null, sound: { music: true, voiceSfx: true } });
    expect(run).toEqual({
      selectedVehicle: null,
      selectedCharacter: null,
      tutorialDone: false,
      completedThisRun: new Set(),
      drivingLessonDone: false,
      practiceStarted: false,
      extraCursor: { 'signal-wait': 0, 'crossing-check': 0, 'turning-car': 0 },
      sound: { music: true, voiceSfx: true },
      best: null,
      storageNoticeShown: false,
      audioUnlocked: false,
    });
  });

  it('저장값의 tutorialDone·best·sound를 반영한다', () => {
    const best = { trackConfigKey: 'main:1:2', timeCs: 29520 };
    const run = createRunState({ v: 1, tutorialDone: true, best, sound: { music: false, voiceSfx: true } });
    expect(run.tutorialDone).toBe(true);
    expect(run.best).toEqual(best);
    expect(run.sound).toEqual({ music: false, voiceSfx: true });
  });

  it('실행마다 새 completedThisRun·extraCursor를 만든다', () => {
    const saved = { v: 1, tutorialDone: false, best: null, sound: { music: true, voiceSfx: true } } as const;
    const a = createRunState(saved);
    const b = createRunState(saved);
    expect(a.completedThisRun.size).toBe(0);
    expect(a.completedThisRun).not.toBe(b.completedThisRun);
    expect(Object.values(a.extraCursor)).toEqual([0, 0, 0]);
  });
});
