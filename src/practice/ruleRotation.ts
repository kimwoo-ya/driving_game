import type { RunState } from '../app/session';
import { type RuleId, SAFETY_RULES } from '../content/rules';
import type { ScenarioId } from '../content/scenarios';

// 자리값(plan O5): 한 안내에 더할 추가 규칙 수. 콘텐츠 설계·플레이 점검에서 확정
export const EXTRAS_PER_VIEW = 2;

const rulesOf = (scenario: ScenarioId, tier: 'core' | 'extra') =>
  SAFETY_RULES.filter((r) => r.scenario === scenario && r.tier === tier);

export function isReplay(scenario: ScenarioId, run: Pick<RunState, 'completedThisRun' | 'tutorialDone'>): boolean {
  return run.completedThisRun.has(scenario) || run.tutorialDone;
}

/** 핵심 전부(배열 순서) + 다시 하는 연습이면 추가 규칙을 cursor부터 k개(끝에서 처음으로). 한 안내에 중복 없음(SC-031) */
export function pickRules(
  scenario: ScenarioId,
  replay: boolean,
  cursor: number,
): { rules: readonly RuleId[]; extrasCount: number } {
  const core = rulesOf(scenario, 'core').map((r) => r.id);
  if (!replay) return { rules: core, extrasCount: 0 };
  const extras = rulesOf(scenario, 'extra');
  const k = Math.min(EXTRAS_PER_VIEW, extras.length);
  return { rules: [...core, ...Array.from({ length: k }, (_, i) => extras[(cursor + i) % extras.length].id)], extrasCount: k };
}

/** 안내를 끝까지 본 뒤의 다음 순환 위치. flow가 ended 때만 부름(data-model.md 8장) */
export function advanceExtraCursor(scenario: ScenarioId, cursor: number, extrasCount: number): number {
  const n = rulesOf(scenario, 'extra').length;
  return n === 0 ? 0 : (cursor + extrasCount) % n;
}
