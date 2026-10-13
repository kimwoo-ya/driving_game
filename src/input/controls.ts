import type { DriveInput } from '../sim/vehicle';
import { picture } from '../ui/screens';

export type ControlButton = 'left' | 'right' | 'accel' | 'brake' | 'reverse' | 'pause';
export type HoldButton = 'left' | 'right' | 'accel' | 'brake';
export type ScreenPoint = { x: number; y: number };
export type ScreenRect = { left: number; top: number; right: number; bottom: number };

const HOLD: readonly HoldButton[] = ['left', 'right', 'accel', 'brake'];
const TAP = ['reverse', 'pause'] as const;
const inside = (p: ScreenPoint, r: ScreenRect) => p.x >= r.left && p.x <= r.right && p.y >= r.top && p.y <= r.bottom;

/** 버튼 사각형 안(경계 포함)에 점이 하나라도 있으면 눌림. 점 개수와 상관없이 같은 규칙 */
export function pressedButtons(
  points: Iterable<ScreenPoint>,
  rects: Readonly<Record<HoldButton, ScreenRect>>,
): ReadonlySet<HoldButton> {
  const pts = [...points];
  return new Set(HOLD.filter((b) => pts.some((p) => inside(p, rects[b]))));
}

/** 좌우 동시 = 직진, 액셀·브레이크 동시 = 브레이크(FR-015) */
export function toDriveInput(pressed: ReadonlySet<HoldButton>): DriveInput {
  const brake = pressed.has('brake');
  return {
    steer: (pressed.has('left') ? 1 : 0) - (pressed.has('right') ? 1 : 0),
    throttle: pressed.has('accel') && !brake,
    brake,
  };
}

// ---- DOM 쪽: 조작 층 하나, 손가락마다 좌표 표 ----

const LABELS: Record<ControlButton, string> = {
  left: '왼쪽',
  right: '오른쪽',
  accel: '앞으로',
  brake: '멈춤',
  reverse: '앞뒤 바꾸기',
  pause: '잠깐 멈춤',
};

const points = new Map<number, ScreenPoint>();
const buttons = new Map<ControlButton, HTMLElement>();
const rects = {} as Record<ControlButton, ScreenRect>;

function measure() {
  for (const [b, el] of buttons) {
    const r = el.getBoundingClientRect();
    rects[b] = { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
  }
}

function showPressed() {
  const pts = [...points.values()];
  for (const [b, el] of buttons) {
    if (pts.some((p) => inside(p, rects[b]))) el.dataset.pressed = '';
    else delete el.dataset.pressed;
  }
}

export function mountControls(layer: HTMLElement, onTap: (button: 'reverse' | 'pause') => void): void {
  for (const b of Object.keys(LABELS) as ControlButton[]) {
    const el = document.createElement('div');
    el.className = `control control-${b}`;
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', LABELS[b]);
    el.append(picture(`images/ui/control-${b}.svg`, `control-${b}`));
    layer.append(el);
    buttons.set(b, el);
  }
  measure();
  window.addEventListener('resize', measure);

  layer.addEventListener('pointerdown', (e) => {
    measure(); // 층이 숨겨져 있다가 보일 때도 최신 사각형으로 판정
    const p = { x: e.clientX, y: e.clientY };
    points.set(e.pointerId, p);
    for (const b of TAP) if (inside(p, rects[b])) onTap(b);
    showPressed();
  });
  layer.addEventListener('pointermove', (e) => {
    if (!points.has(e.pointerId)) return;
    points.set(e.pointerId, { x: e.clientX, y: e.clientY });
    showPressed();
  });
  const lift = (e: PointerEvent) => {
    points.delete(e.pointerId);
    showPressed();
  };
  layer.addEventListener('pointerup', lift);
  layer.addEventListener('pointercancel', lift);
}

export function readDriveInput(): DriveInput {
  return toDriveInput(pressedButtons(points.values(), rects));
}

/** 좌표 표를 비움. 닿아 있던 손가락은 표에 없으니 뗐다가 새로 눌러야 반영(pointermove는 표에 있는 손가락만 갱신) */
export function releaseAll(): void {
  points.clear();
  showPressed();
}
