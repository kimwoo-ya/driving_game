import { afterEach, describe, expect, it, vi } from 'vitest';
import { SAFETY_RULES } from '../../src/content/rules';
import { advanceExtraCursor, EXTRAS_PER_VIEW, isReplay, pickRules } from '../../src/practice/ruleRotation';

const ids = (scenario: string, tier: 'core' | 'extra') =>
  SAFETY_RULES.filter((r) => r.scenario === scenario && r.tier === tier).map((r) => r.id);

afterEach(() => {
  vi.doUnmock('../../src/content/rules');
  vi.resetModules();
});

describe('isReplay (FR-091)', () => {
  it('이번 실행에서 완료했거나 저장된 완료 기록이 있으면 참', () => {
    expect(isReplay('signal-wait', { completedThisRun: new Set(), tutorialDone: false })).toBe(false);
    expect(isReplay('signal-wait', { completedThisRun: new Set(['signal-wait']), tutorialDone: false })).toBe(true);
    expect(isReplay('signal-wait', { completedThisRun: new Set(['turning-car']), tutorialDone: false })).toBe(false);
    expect(isReplay('signal-wait', { completedThisRun: new Set(), tutorialDone: true })).toBe(true);
  });
});

describe('pickRules (SC-031)', () => {
  it('핵심 전부(배열 순서) + 커서부터 k개, 끝에서 처음으로 이어지고 중복 없음', () => {
    const core = ids('signal-wait', 'core');
    const extras = ids('signal-wait', 'extra');
    const k = Math.min(EXTRAS_PER_VIEW, extras.length);
    expect(pickRules('signal-wait', true, 0)).toEqual({ rules: [...core, ...extras.slice(0, k)], extrasCount: k });
    const last = extras.length - 1;
    const wrapped = pickRules('signal-wait', true, last).rules;
    expect(wrapped).toEqual([...core, ...[last, 0, 1].slice(0, k).map((i) => extras[i % extras.length])]);
    expect(new Set(wrapped).size).toBe(wrapped.length);
  });

  it('다시 하는 연습이 아니면 추가 규칙 0개', () => {
    expect(pickRules('crossing-check', false, 3)).toEqual({ rules: ids('crossing-check', 'core'), extrasCount: 0 });
  });
});

describe('advanceExtraCursor', () => {
  it('(cursor + extrasCount) % 추가 수', () => {
    const n = ids('turning-car', 'extra').length;
    expect(advanceExtraCursor('turning-car', 0, 2)).toBe(2 % n);
    expect(advanceExtraCursor('turning-car', n - 1, 2)).toBe((n + 1) % n);
    expect(advanceExtraCursor('turning-car', 3, 0)).toBe(3);
  });

  it('추가 규칙이 0개인 상황은 0 (나머지 연산 0 나누기 방지)', async () => {
    vi.resetModules();
    vi.doMock('../../src/content/rules', () => ({
      SAFETY_RULES: [{ id: 'A6', scenario: 'signal-wait', tier: 'core' }],
    }));
    const m = await import('../../src/practice/ruleRotation');
    expect(m.advanceExtraCursor('signal-wait', 3, 0)).toBe(0);
    expect(m.pickRules('signal-wait', true, 5)).toEqual({ rules: ['A6'], extrasCount: 0 });
  });
});
