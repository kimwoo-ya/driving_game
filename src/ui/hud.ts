import type { HintCue } from '../practice/scenario';
import type { Gear } from '../sim/vehicle';
import { picture } from './screens';

let controls: HTMLElement;
let gearEl: HTMLElement;
let cueEl: HTMLElement;
let stopEl: HTMLElement;
let fadeEl: HTMLElement;
let shownGear: Gear | null = null;

const div = (className: string) => Object.assign(document.createElement('div'), { className });

// 애니메이션을 처음부터 다시 틀기(같은 속성을 다시 붙여도 CSS 애니메이션은 재시작되지 않음)
function restart(el: HTMLElement, attr: string) {
  delete el.dataset[attr];
  void el.offsetWidth;
  el.dataset[attr] = '';
}

/** 운전 화면 HUD를 #ui에 붙임. 눌러야 할 버튼 강조는 #controls의 data-cue로 CSS가 그림 */
export function showHud(ui: HTMLElement, controlsLayer: HTMLElement): void {
  controls = controlsLayer;
  delete controls.dataset.cue;
  delete controls.dataset.demo;
  gearEl = div('hud-gear');
  cueEl = div('hud-cue');
  stopEl = div('hud-stop-first');
  stopEl.append(picture('images/ui/stop-first.svg', 'stop-first'));
  fadeEl = div('hud-fade');
  shownGear = null;
  ui.replaceChildren(fadeEl, gearEl, cueEl, stopEl);
}

/** 전진·후진을 색 + 모양으로 늘 보여 줌(FR-019, FR-025). 바뀔 때만 다시 그림 */
export function updateGear(gear: Gear): void {
  if (gear === shownGear) return;
  shownGear = gear;
  gearEl.dataset.gear = gear;
  gearEl.replaceChildren(picture(`images/ui/gear-${gear}.svg`, `gear-${gear}`));
}

/** 다음 행동 그림 + 해당 버튼 강조. repeat이면 누르는 시범 애니메이션(FR-027, FR-031) */
export function showCue(cue: HintCue, repeat: boolean): void {
  cueEl.replaceChildren(picture(`images/ui/cue-${cue}.svg`, `cue-${cue}`));
  const same = controls.dataset.cue === cue;
  controls.dataset.cue = cue;
  if (repeat) restart(controls, 'demo');
  else if (!same) delete controls.dataset.demo; // demoReplay 바로 뒤 같은 cue의 hint가 시범을 지우지 않게
}

/** 연속 실패 뒤 그 단계의 버튼 시범을 다시(US2-8). 그림은 뒤따르는 hint가 바꿈 */
export function showDemo(cue: HintCue): void {
  controls.dataset.cue = cue;
  restart(controls, 'demo');
}

/** 경로 문제로 구간을 처음부터 다시 놓을 때 짧은 화면 전환(events.md 2장 redirect, FR-034) */
export function flashRedirect(): void {
  restart(fadeEl, 'show');
}

/** 움직이는 중 후진 전환을 누르면 "먼저 멈춰요" 그림을 잠깐 보여 줌(FR-018) */
export function flashStopFirst(): void {
  restart(stopEl, 'show');
}
