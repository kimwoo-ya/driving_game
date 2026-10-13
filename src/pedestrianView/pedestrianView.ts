import { type RuleId, SAFETY_RULES } from '../content/rules';
import type { PedestrianViewDef } from '../content/scenarios';

export type PedestrianViewState = {
  rules: readonly RuleId[];
  extrasCount: number;
  card: number; // -1 = 카메라 이동(introTicks), 0.. = 지금 카드, rules.length = 끝남
  cardTicks: number; // 지금 카드(또는 카메라 이동) 경과 틱. -1 = 되감기 직후(다음 틱이 그 카드의 0틱)
};

export type PedestrianViewEvent =
  | { type: 'cardShown'; rule: RuleId; index: number }
  | { type: 'ended'; extrasCount: number };

const durationOf = (id: RuleId) => SAFETY_RULES.find((r) => r.id === id)!.durationTicks;

export function startPedestrianView(picked: { rules: readonly RuleId[]; extrasCount: number }): PedestrianViewState {
  return { rules: picked.rules, extrasCount: picked.extrasCount, card: -1, cardTicks: 0 };
}

/** 틱으로만 진행(음성 재생과 무관, FR-070). 운전 입력 매개변수·건너뛰기 없음(FR-041) */
export function stepPedestrianView(
  state: PedestrianViewState,
  def: PedestrianViewDef,
): { state: PedestrianViewState; events: PedestrianViewEvent[] } {
  if (state.card >= state.rules.length) return { state, events: [] };
  let card = state.card;
  let cardTicks = state.cardTicks + 1;
  if (cardTicks >= (card < 0 ? def.introTicks : durationOf(state.rules[card]))) {
    card++;
    cardTicks = 0;
  }
  const next = { ...state, card, cardTicks };
  if (card === state.rules.length) return { state: next, events: [{ type: 'ended', extrasCount: state.extrasCount }] };
  if (card >= 0 && cardTicks === 0) return { state: next, events: [{ type: 'cardShown', rule: state.rules[card], index: card }] };
  return { state: next, events: [] };
}

/** 'card' = 지금 카드를 0틱부터(다음 틱에 cardShown 다시), 'intro' = 카메라 이동부터 같은 rules로(FR-041, FR-076) */
export function rewindPedestrianView(state: PedestrianViewState, to: 'card' | 'intro'): PedestrianViewState {
  return to === 'card' ? { ...state, cardTicks: -1 } : { ...state, card: -1, cardTicks: 0 };
}
