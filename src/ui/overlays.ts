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
  layer.replaceChildren(picture('images/ui/game-paused.svg'), picture(`images/ui/violation-${kebab(kind)}.svg`));
}

/** 보행자 시점 안내 규칙 카드: 그림(소리 없이도 뜻이 전해지게, FR-070) + 보호자용 글(textContent) */
export function showRuleCard(rule: RuleId): void {
  const text = Object.assign(document.createElement('p'), { textContent: SAFETY_RULES.find((r) => r.id === rule)!.text });
  layer.dataset.kind = 'card';
  layer.replaceChildren(picture(`images/rules/${rule}.svg`), text);
}

/** 안전 행동 칭찬(빠르기가 아니라 안전 행동, FR-036) */
export function showPraise(): void {
  layer.dataset.kind = 'praise';
  layer.replaceChildren(picture('images/ui/praise.svg'));
}

/** 세 연습을 처음 다 마친 순간 레이싱 열림 축하(FR-047, 음성은 T081) */
export function showRaceUnlocked(): void {
  layer.dataset.kind = 'unlocked';
  layer.replaceChildren(picture('images/ui/race-unlocked.svg'));
}

/** 저장 불가 안내: 그림 + 보호자용 짧은 글 + 닫기. 화면이 바뀌어도 남되, 닫거나 잠시 뒤 저절로 사라지고 터치를 막지 않음(FR-080) */
export function showStorageNotice(onClose: () => void): void {
  const notice = Object.assign(document.createElement('div'), { className: 'storage-notice' });
  const close = Object.assign(document.createElement('button'), { className: 'notice-close' });
  close.setAttribute('aria-label', '닫기');
  close.append(picture('images/ui/close.svg'));
  const hide = () => {
    if (!notice.isConnected) return;
    notice.remove();
    onClose();
  };
  close.addEventListener('click', hide);
  notice.addEventListener('animationend', hide); // CSS notice-out
  notice.append(
    picture('images/ui/storage-notice.svg'),
    Object.assign(document.createElement('p'), { textContent: '이 브라우저에서는 저장을 쓸 수 없어 진행 기록이 남지 않습니다. 게임은 그대로 할 수 있습니다.' }),
    close,
  );
  document.body.append(notice);
}

/** 세로 안내: 돌리기 그림 + 보호자용 회전 잠금 해제 글. 1번 붙이고 CSS가 data-overlays의 rotate로 보임(FR-007) */
export function mountRotateNotice(): void {
  const notice = Object.assign(document.createElement('div'), { className: 'rotate-notice' });
  notice.append(
    picture('images/ui/rotate-device.svg'),
    Object.assign(document.createElement('p'), { textContent: '기기를 가로로 돌려 주세요. 돌려도 그대로라면 화면 회전 잠금을 풀어 주세요.' }),
  );
  document.body.append(notice);
}

export function hideOverlay(): void {
  delete layer.dataset.kind;
  layer.replaceChildren();
}
