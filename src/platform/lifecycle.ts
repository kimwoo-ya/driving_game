export type LifecycleSignal = 'hidden' | 'visible' | 'portrait' | 'landscape' | 'layout' | 'blur';

// ponytail: "너무 작은 가로 영역" 기준 자리값(CSS px). 초기 기기 점검(T113, plan O6)에서 확정
const MIN_WIDTH = 480;
const MIN_HEIGHT = 280;

const isPortrait = () =>
  window.innerHeight > window.innerWidth || window.innerWidth < MIN_WIDTH || window.innerHeight < MIN_HEIGHT;

const prevent = (e: Event) => e.preventDefault();

/** 리스너를 달고 브라우저 기본 제스처를 막는다. 시작할 때 세로면 portrait를 한 번 알림. 방향 고정 API는 쓰지 않음(FR-007) */
export function watchLifecycle(on: (signal: LifecycleSignal) => void): void {
  let portrait = isPortrait();
  const onLayout = () => {
    const now = isPortrait();
    if (now !== portrait) {
      portrait = now;
      on(now ? 'portrait' : 'landscape');
    } else if (!now) on('layout'); // 가로 유지 중 크기 변화·180° 뒤집기
  };
  document.addEventListener('visibilitychange', () => on(document.hidden ? 'hidden' : 'visible'));
  window.addEventListener('resize', onLayout);
  screen.orientation?.addEventListener('change', onLayout); // 180° 뒤집기는 크기가 같아 resize가 없음
  window.addEventListener('blur', () => on('blur'));
  for (const type of ['gesturestart', 'dblclick', 'contextmenu']) document.addEventListener(type, prevent);
  document.addEventListener('touchmove', prevent, { passive: false });
  if (portrait) on('portrait');
}
