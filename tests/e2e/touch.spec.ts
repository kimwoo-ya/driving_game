import { expect, type Page, test } from '@playwright/test';

const BUTTONS = ['left', 'right', 'accel', 'brake', 'reverse', 'pause'] as const;

async function toLesson(page: Page) {
  await page.goto('./?e2e');
  await expect(page.locator('body')).toHaveAttribute('data-screen', 'start', { timeout: 30_000 });
  await page.getByRole('button', { name: '시작' }).click();
  await page.getByRole('button', { name: '버기', exact: true }).click();
  await page.getByRole('button', { name: '다음' }).click();
  await page.getByRole('button', { name: 'Chicken Guy', exact: true }).click();
  await page.getByRole('button', { name: '다음' }).click();
  await expect(page.locator('body')).toHaveAttribute('data-screen', 'drivingLesson');
}

// 조작 층(#controls)에 손가락 하나의 포인터 이벤트를 보냄. 버튼 판정은 좌표로 하므로 대상은 층
async function finger(page: Page, type: string, id: number, at: { x: number; y: number }) {
  await page.evaluate(
    ([type, id, x, y]) =>
      document
        .getElementById('controls')!
        .dispatchEvent(new PointerEvent(type, { pointerId: id, pointerType: 'touch', clientX: x, clientY: y, bubbles: true })),
    [type, id, at.x, at.y] as const,
  );
}

async function center(page: Page, button: string) {
  const box = (await page.locator(`.control-${button}`).boundingBox())!;
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

const pressed = (page: Page, button: string) => page.locator(`.control-${button}`);

test('body와 조작 버튼은 touch-action·user-select가 none (SC-005)', async ({ page }) => {
  await toLesson(page);
  for (const sel of ['body', ...BUTTONS.map((b) => `.control-${b}`)]) {
    const style = await page.locator(sel).evaluate((el) => {
      const s = getComputedStyle(el) as CSSStyleDeclaration & { webkitUserSelect?: string };
      return { touchAction: s.touchAction, userSelect: s.userSelect || s.webkitUserSelect };
    });
    expect(style, sel).toEqual({ touchAction: 'none', userSelect: 'none' });
  }
});

test('누름 → data-pressed, 미끄러짐·pointercancel·blur → 해제, 해제 뒤엔 새로 눌러야 반영 (FR-016·017, SC-003)', async ({
  page,
}) => {
  await toLesson(page);
  const accel = await center(page, 'accel');
  const left = await center(page, 'left');

  // 두 손 동시(FR-014)
  await finger(page, 'pointerdown', 1, left);
  await finger(page, 'pointerdown', 2, accel);
  await expect(pressed(page, 'left')).toHaveAttribute('data-pressed');
  await expect(pressed(page, 'accel')).toHaveAttribute('data-pressed');
  await finger(page, 'pointerup', 1, left);
  await expect(pressed(page, 'left')).not.toHaveAttribute('data-pressed');

  // 버튼 밖으로 미끄러짐
  await finger(page, 'pointermove', 2, { x: accel.x - 300, y: accel.y - 150 });
  await expect(pressed(page, 'accel')).not.toHaveAttribute('data-pressed');
  await finger(page, 'pointerup', 2, accel);

  // 터치 취소
  await finger(page, 'pointerdown', 3, accel);
  await expect(pressed(page, 'accel')).toHaveAttribute('data-pressed');
  await finger(page, 'pointercancel', 3, accel);
  await expect(pressed(page, 'accel')).not.toHaveAttribute('data-pressed');

  // 창 blur → 모두 해제, 닿아 있던 손가락은 떼기 전까지 무시
  await finger(page, 'pointerdown', 4, accel);
  await expect(pressed(page, 'accel')).toHaveAttribute('data-pressed');
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect(pressed(page, 'accel')).not.toHaveAttribute('data-pressed');
  await finger(page, 'pointermove', 4, { x: accel.x + 1, y: accel.y });
  await expect(pressed(page, 'accel')).not.toHaveAttribute('data-pressed');
  await finger(page, 'pointerup', 4, accel);
  await finger(page, 'pointerdown', 5, accel);
  await expect(pressed(page, 'accel')).toHaveAttribute('data-pressed');
});

for (const [width, height] of [
  [844, 390],
  [932, 430],
  [1180, 820],
] as const) {
  test(`가로 ${width}×${height}: 조작 버튼끼리·화면 가장자리와 겹치지 않음 (FR-021, SC-023 브라우저)`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height });
    await toLesson(page);
    const boxes = await Promise.all(BUTTONS.map(async (b) => (await page.locator(`.control-${b}`).boundingBox())!));
    const MARGIN = 16; // 헤드리스에는 안전 영역(env)이 0이라 화면 가장자리에서 떨어졌는지로 확인
    for (const [i, a] of boxes.entries()) {
      expect(a.x, BUTTONS[i]).toBeGreaterThanOrEqual(MARGIN);
      expect(a.y, BUTTONS[i]).toBeGreaterThanOrEqual(MARGIN);
      expect(a.x + a.width, BUTTONS[i]).toBeLessThanOrEqual(width - MARGIN);
      expect(a.y + a.height, BUTTONS[i]).toBeLessThanOrEqual(height - MARGIN);
      for (const [j, b] of boxes.entries()) {
        if (j <= i) continue;
        const apart = a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y;
        expect(apart, `${BUTTONS[i]}·${BUTTONS[j]}`).toBe(true);
      }
    }
    await page.screenshot({ path: testInfo.outputPath(`controls-${width}x${height}.png`) });
  });
}
