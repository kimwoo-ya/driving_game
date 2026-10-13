import { type RuleId, SAFETY_RULES } from '../content/rules';
import type { ViolationKind } from '../content/scenarios';
import { picture } from './screens';

let layer: HTMLElement;

const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/** 플레이 화면 겹침 층을 #ui 끝에 붙임(HUD 위). 비어 있으면 보이지 않음 */
export function mountOverlay(ui: HTMLElement): void {
  layer = Object.assign(document.createElement('div'), { className: 'overlay' });
  ui.append(layer);
}

/** 위험 직전 멈춤: 화면 전체 반투명 + 멈춤 그림 + 잘못된 행동 그림. 게임 전체가 멈춘 것으로 보이게(FR-037) */
export function showViolation(kind: ViolationKind): void {
  layer.dataset.kind = 'violation';
  layer.replaceChildren(picture('images/ui/game-paused.svg', 'game-paused'), picture(`images/ui/violation-${kebab(kind)}.svg`, 'violation'));
}

/** 보행자 시점 안내 규칙 카드: 그림(소리 없이도 뜻이 전해지게, FR-070) + 보호자용 글(textContent) */
export function showRuleCard(rule: RuleId): void {
  const text = Object.assign(document.createElement('p'), { textContent: SAFETY_RULES.find((r) => r.id === rule)!.text });
  layer.dataset.kind = 'card';
  layer.replaceChildren(picture(`images/rules/${rule}.svg`, 'rule'), text);
}

/** 안전 행동 칭찬(빠르기가 아니라 안전 행동, FR-036) */
export function showPraise(): void {
  layer.dataset.kind = 'praise';
  layer.replaceChildren(picture('images/ui/praise.svg', 'praise'));
}

export function hideOverlay(): void {
  delete layer.dataset.kind;
  layer.replaceChildren();
}
