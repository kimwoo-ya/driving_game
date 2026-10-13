import { ASSET_URLS, type AssetId } from '../app/loader';
import { CREDITS } from '../content/credits';

/** 그림 파일이 있으면 <img>, 아직 없으면 CSS 도형 자리표시(tasks D4) */
export function picture(id: AssetId, shape: string): HTMLElement {
  const url = ASSET_URLS[id];
  if (url === undefined) {
    const span = document.createElement('span');
    span.className = `shape shape-${shape}`;
    return span;
  }
  const img = document.createElement('img');
  img.src = url;
  img.alt = '';
  img.draggable = false;
  return img;
}

const button = (className: string, label: string, image: AssetId, shape: string, onClick: () => void) => {
  const b = document.createElement('button');
  b.className = className;
  b.setAttribute('aria-label', label);
  b.append(picture(image, shape));
  b.addEventListener('click', onClick);
  return b;
};

export function showStart(ui: HTMLElement, onStart: () => void, onCredits: () => void): void {
  ui.replaceChildren(
    button('big-button', '시작', 'images/ui/start.svg', 'play', onStart),
    button('corner-button', '크레딧', 'images/ui/credits.svg', 'info', onCredits), // 보호자용
  );
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
  ui.replaceChildren(list, button('corner-button', '돌아가기', 'images/ui/back.svg', 'back', onBack));
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
  const next = document.createElement('button');
  next.className = 'big-button pick-next';
  next.setAttribute('aria-label', '다음');
  next.append(picture('images/ui/next.svg', 'play'));
  next.disabled = selected === null;
  next.addEventListener('click', onNext);
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
