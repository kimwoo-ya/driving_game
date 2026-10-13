import { ASSET_URLS, type AssetId } from '../app/loader';
import { CREDITS } from '../content/credits';
import { SCENARIOS, type ScenarioId } from '../content/scenarios';
import { type FinishResult, formatRecord } from '../race/race';

/** 글자 없는 그림(SVG, JS 번들 안에 들어 있음, assets.md 2장)을 <img>로 */
export function picture(id: AssetId): HTMLImageElement {
  return Object.assign(document.createElement('img'), { src: ASSET_URLS[id]!, alt: '', draggable: false });
}

const button = (className: string, label: string, image: AssetId, onClick: () => void) => {
  const b = document.createElement('button');
  b.className = className;
  b.setAttribute('aria-label', label);
  b.append(picture(image));
  b.addEventListener('click', onClick);
  return b;
};

/** 애니메이션을 처음부터 다시 틀기(같은 속성을 다시 붙여도 CSS 애니메이션은 재시작되지 않음) */
export function restart(el: HTMLElement, attr: string): void {
  delete el.dataset[attr];
  void el.offsetWidth;
  el.dataset[attr] = '';
}

let raceHint: HTMLElement;

/** 시작 화면: 안전 연습 시작, 레이싱(잠김이면 잠김 그림, FR-048), 보호자용 크레딧·전체화면(되는 브라우저만, FR-099) */
export function showStart(
  ui: HTMLElement,
  raceOpen: boolean,
  onStart: () => void,
  onRace: () => void,
  onCredits: () => void,
  onFullscreen: () => void,
): void {
  const lock = raceOpen ? '' : '-locked';
  const race = button('big-button', '레이싱', `images/ui/race${lock}.svg`, onRace);
  race.toggleAttribute('data-locked', !raceOpen);
  raceHint = Object.assign(document.createElement('div'), { className: 'race-hint' });
  raceHint.append(picture('images/ui/race-locked-hint.svg'));
  ui.replaceChildren(
    button('big-button', '시작', 'images/ui/start.svg', onStart),
    race,
    raceHint,
    button('corner-button', '크레딧', 'images/ui/credits.svg', onCredits), // 보호자용
  );
  if (document.fullscreenEnabled) {
    const exit = document.fullscreenElement ? '-exit' : '';
    ui.append(button('corner-button corner-left', '전체 화면', `images/ui/fullscreen${exit}.svg`, onFullscreen));
  }
}

/** 잠긴 레이싱을 누르면 "안전 연습을 모두 마치면 열려요" 그림을 잠깐(FR-048, 음성은 T081) */
export function flashRaceLocked(): void {
  restart(raceHint, 'show');
}

const SCENARIO_LABELS: Record<ScenarioId, string> = {
  'signal-wait': '신호 기다리기',
  'crossing-check': '횡단 전 주변 차량 확인하기',
  'turning-car': '교차로의 회전 차량 주의하기',
};

/** 연습 목록: 세 연습 그림, 이번 실행에서 완료한 연습에 완료 표시, 모두 고를 수 있음(FR-030) */
export function showPracticeMenu(ui: HTMLElement, done: ReadonlySet<ScenarioId>, onPick: (id: ScenarioId) => void): void {
  const row = document.createElement('div');
  row.className = 'menu-row';
  for (const { id } of SCENARIOS) {
    const b = button('menu-item', SCENARIO_LABELS[id], `images/ui/scenario-${id}.svg`, () => onPick(id));
    if (done.has(id)) {
      b.dataset.done = '';
      const mark = picture('images/ui/done.svg');
      mark.classList.add('menu-done');
      b.append(mark);
    }
    row.append(b);
  }
  ui.replaceChildren(row);
}

/** 크레딧: 행마다 작품명·제작자·원출처·라이선스·변경 사실. 주소는 누를 수 없는 글자(textContent, FR-086·FR-090) */
export function showCredits(ui: HTMLElement, onBack: () => void): void {
  const list = document.createElement('ul');
  list.className = 'credits';
  for (const c of CREDITS) {
    const lines = [
      `${c.title} — ${c.author}`,
      `원출처: ${c.sourceUrl}`,
      `라이선스: ${c.license} (${c.licenseUrl})`,
      ...(c.changes ? [`변경: ${c.changes}`] : []),
    ];
    const item = document.createElement('li');
    item.append(...lines.map((t) => Object.assign(document.createElement('p'), { textContent: t })));
    list.append(item);
  }
  ui.replaceChildren(list, button('corner-button', '돌아가기', 'images/ui/back.svg', onBack));
}

/**
 * 차량·인물 선택 화면: 3D 진열(showroom) 위에 같은 폭의 투명 버튼 열을 겹침(research R6).
 * 잠긴 항목 없음, 이번 실행의 이전 선택을 기본 강조, 그림으로 된 다음 버튼(FR-009, FR-010, FR-012, FR-097)
 */
export function showPick(
  ui: HTMLElement,
  labels: readonly string[],
  selected: number | null,
  onSelect: (i: number) => void,
  onNext: () => void,
): void {
  const next = button('big-button pick-next', '다음', 'images/ui/next.svg', onNext);
  next.disabled = selected === null;
  const items = labels.map((label, i) => {
    const b = document.createElement('button');
    b.className = 'pick-item';
    b.setAttribute('aria-label', label);
    b.setAttribute('aria-pressed', String(i === selected));
    b.addEventListener('click', () => {
      items.forEach((x, j) => x.setAttribute('aria-pressed', String(j === i)));
      next.disabled = false;
      onSelect(i);
    });
    return b;
  });
  const row = document.createElement('div');
  row.className = 'pick-row';
  row.append(...items);
  ui.replaceChildren(row, next);
}

/**
 * 레이싱 결과: 순위·완주 시간·최고 기록(새 기록이면 다른 그림과 강조), 순위와 상관없는 완주 칭찬,
 * 같은 차로 다시 달리기·시작 화면으로(FR-063, FR-065)
 */
export function showRaceResult(ui: HTMLElement, result: FinishResult, onRetry: () => void, onHome: () => void): void {
  const stat = (icon: AssetId, text: string) => {
    const el = document.createElement('div');
    el.className = 'race-stat';
    el.append(picture(icon), Object.assign(document.createElement('span'), { textContent: text }));
    return el;
  };
  const stats = document.createElement('div');
  stats.className = 'race-result-stats';
  stats.append(stat('images/ui/race-rank.svg', `${result.rank}/4`), stat('images/ui/race-time.svg', formatRecord(result.timeCs)));
  if (result.best) {
    const best = stat(`images/ui/race-${result.isNewBest ? 'new-best' : 'best'}.svg`, formatRecord(result.best.timeCs));
    best.toggleAttribute('data-new-best', result.isNewBest);
    stats.append(best);
  }
  const praise = picture('images/ui/race-finish.svg');
  praise.className = 'race-praise';
  const buttons = document.createElement('div');
  buttons.className = 'race-result-buttons';
  buttons.append(button('big-button', '다시 달리기', 'images/ui/race-retry.svg', onRetry), button('big-button', '시작 화면으로', 'images/ui/home.svg', onHome));
  const card = document.createElement('div');
  card.className = 'race-result';
  card.append(praise, stats, buttons);
  ui.replaceChildren(card);
}
