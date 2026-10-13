import type { AssetId } from '../app/loader';
import type { HintCue } from '../practice/scenario';
import { formatRecord } from '../race/race';
import type { Gear } from '../sim/vehicle';
import { picture, restart } from './screens';

let controls: HTMLElement;
let gearEl: HTMLElement;
let cueEl: HTMLElement;
let stopEl: HTMLElement;
let fadeEl: HTMLElement;
let shownGear: Gear | null = null;
let race: { rank: HTMLElement; lap: HTMLElement; time: HTMLElement; count: HTMLElement };

const div = (className: string) => Object.assign(document.createElement('div'), { className });

/** 운전 화면 HUD를 #ui에 붙임. 눌러야 할 버튼 강조는 #controls의 data-cue로 CSS가 그림 */
export function showHud(ui: HTMLElement, controlsLayer: HTMLElement): void {
  controls = controlsLayer;
  delete controls.dataset.cue;
  delete controls.dataset.demo;
  gearEl = div('hud-gear');
  cueEl = div('hud-cue');
  stopEl = div('hud-stop-first');
  stopEl.append(picture('images/ui/stop-first.svg'));
  fadeEl = div('hud-fade');
  shownGear = null;
  ui.replaceChildren(fadeEl, gearEl, cueEl, stopEl);
}

/** 전진·후진을 색 + 모양으로 늘 보여 줌(FR-019, FR-025). 바뀔 때만 다시 그림 */
export function updateGear(gear: Gear): void {
  if (gear === shownGear) return;
  shownGear = gear;
  gearEl.dataset.gear = gear;
  gearEl.replaceChildren(picture(`images/ui/gear-${gear}.svg`));
}

/** 다음 행동 그림 + 해당 버튼 강조. repeat이면 누르는 시범 애니메이션(FR-027, FR-031) */
export function showCue(cue: HintCue, repeat: boolean): void {
  cueEl.replaceChildren(picture(`images/ui/cue-${cue}.svg`));
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

// 그림 + 숫자 한 칸(숫자만 글자, 이름표 글자는 없음)
function stat(icon: AssetId): { el: HTMLElement; value: HTMLElement } {
  const el = div('race-stat');
  const value = document.createElement('span');
  el.append(picture(icon), value);
  return { el, value };
}

/** 레이싱 HUD: 기어 + 위 가운데 순위·바퀴·경기 시간 + 화면 가운데 카운트다운·출발 그림(FR-055, FR-056) */
export function showRaceHud(ui: HTMLElement, controlsLayer: HTMLElement): void {
  showHud(ui, controlsLayer);
  const [rank, lap, time] = (['rank', 'lap', 'time'] as const).map((k) => stat(`images/ui/race-${k}.svg`));
  const row = div('race-stats');
  row.append(rank.el, lap.el, time.el);
  const count = div('race-count');
  ui.append(row, count);
  race = { rank: rank.value, lap: lap.value, time: time.value, count };
}

const setText = (el: HTMLElement, text: string) => el.textContent !== text && (el.textContent = text);

/** 지금 순위 n/4 */
export function showRaceRank(rank: number): void {
  setText(race.rank, `${rank}/4`);
}

/** 바퀴 min(lapsDone + 1, laps)/laps (data-model.md 7장) */
export function showRaceLap(lapsDone: number, laps: number): void {
  setText(race.lap, `${Math.min(lapsDone + 1, laps)}/${laps}`);
}

/** 경기 시간(매 프레임, 바뀔 때만 다시 씀) */
export function showRaceTime(timeCs: number): void {
  setText(race.time, formatRecord(timeCs));
}

/** 카운트다운 큰 숫자 3·2·1 */
export function showCountdown(secondsLeft: number): void {
  race.count.replaceChildren(String(secondsLeft));
  restart(race.count, 'show');
}

/** 출발 그림을 잠깐 */
export function showGo(): void {
  race.count.replaceChildren(picture('images/ui/race-go.svg'));
  restart(race.count, 'show');
}
