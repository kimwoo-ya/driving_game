import { describe, expect, it } from 'vitest';
import { SAFETY_RULES, type RuleId } from '../../src/content/rules';
import { SCENARIOS } from '../../src/content/scenarios';
import * as pv from '../../src/pedestrianView/pedestrianView';
import { rewindPedestrianView, startPedestrianView, stepPedestrianView } from '../../src/pedestrianView/pedestrianView';

const DEF = SCENARIOS[0].pedestrianView;
const RULES: readonly RuleId[] = ['A6', 'A7', 'A5'];
const duration = (id: RuleId) => SAFETY_RULES.find((r) => r.id === id)!.durationTicks;

// n틱 진행하며 (몇 번째 틱, 이벤트)를 모음
function run(state: pv.PedestrianViewState, ticks: number) {
  const events: { tick: number; e: pv.PedestrianViewEvent }[] = [];
  for (let t = 1; t <= ticks; t++) {
    const r = stepPedestrianView(state, DEF);
    state = r.state;
    for (const e of r.events) events.push({ tick: t, e });
  }
  return { state, events };
}

describe('보행자 시점 안내 (modules.md 5장, events.md 3장)', () => {
  it('introTicks 뒤 카드마다 첫 틱에 cardShown, 마지막 카드 durationTicks 뒤 ended 1회 (SC-021: 틱으로만 진행)', () => {
    const total = DEF.introTicks + RULES.reduce((a, id) => a + duration(id), 0);
    const { events } = run(startPedestrianView({ rules: RULES, extrasCount: 1 }), total + 600);
    let at = DEF.introTicks;
    const expected = RULES.map((rule, index) => {
      const ev = { tick: at, e: { type: 'cardShown', rule, index } };
      at += duration(rule);
      return ev;
    });
    expect(events).toEqual([...expected, { tick: total, e: { type: 'ended', extrasCount: 1 } }]);
  });

  it('운전 입력 매개변수와 건너뛰는 함수가 없다 (FR-041)', () => {
    expect(stepPedestrianView.length).toBe(2);
    expect(Object.keys(pv).sort()).toEqual(['rewindPedestrianView', 'startPedestrianView', 'stepPedestrianView']);
  });

  it("rewind 'card'는 그 카드를 0틱부터 다시(cardShown 다시), 'intro'는 카메라 이동부터 같은 rules", () => {
    const mid = run(startPedestrianView({ rules: RULES, extrasCount: 0 }), DEF.introTicks + duration('A6') + 10).state;
    expect(mid.card).toBe(1);

    // 되감은 뒤 첫 틱이 그 카드의 0틱 → durationTicks 동안 보이고 다음 카드
    const card = run(rewindPedestrianView(mid, 'card'), duration('A7') + 1);
    expect(card.events).toEqual([
      { tick: 1, e: { type: 'cardShown', rule: 'A7', index: 1 } },
      { tick: duration('A7') + 1, e: { type: 'cardShown', rule: 'A5', index: 2 } },
    ]);

    const intro = rewindPedestrianView(mid, 'intro');
    expect(intro).toEqual({ rules: RULES, extrasCount: 0, card: -1, cardTicks: 0 });
    expect(run(intro, DEF.introTicks).events).toEqual([{ tick: DEF.introTicks, e: { type: 'cardShown', rule: 'A6', index: 0 } }]);
  });
});
