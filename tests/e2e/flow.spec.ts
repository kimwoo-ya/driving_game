import { expect, type Page, test } from '@playwright/test';

// 3D가 필요한 spec(T005 규칙): records/tooling-and-render.md에서 두 엔진 모두 WebGL2 true라 둘 다 실행
const VEHICLES = ['버기', '지프', '트럭', '왜건', '바나나 자동차'];
const CHARACTERS = [
  ['Chicken Guy', 'chicken-guy'],
  ['Cool Bannana Guy', 'cool-banana-guy'],
  ['Turtle', 'turtle'],
] as const;

const screen = (page: Page) => expect(page.locator('body'));

// data-screen이 바뀔 때마다 기록(boot.spec.ts와 같은 방법)
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const seen: string[] = [];
    (window as unknown as { __screens: string[] }).__screens = seen;
    new MutationObserver((records) => {
      for (const m of records) if (m.oldValue && seen.at(-1) !== m.oldValue) seen.push(m.oldValue);
      const now = document.body?.dataset.screen;
      if (now && seen.at(-1) !== now) seen.push(now);
    }).observe(document, { attributes: true, subtree: true, attributeFilter: ['data-screen'], attributeOldValue: true });
  });
});

async function toStart(page: Page) {
  await page.goto('./?e2e');
  await screen(page).toHaveAttribute('data-screen', 'start', { timeout: 30_000 });
}

test('차량 5종 × 인물 3종 모두 골라 조작 익히기에 들어가고, 고른 인물이 아이 차에 탄다 (US1-2·3·12·13, SC-001·032)', async ({
  page,
}, testInfo) => {
  test.setTimeout(240_000);
  for (const vehicle of VEHICLES) {
    for (const [label, id] of CHARACTERS) {
      await toStart(page);
      await page.getByRole('button', { name: '시작' }).click();
      await screen(page).toHaveAttribute('data-screen', 'pickVehicle');
      await expect(page.getByRole('button', { name: '다음' })).toBeDisabled();
      await expect(page.locator('.pick-item')).toHaveCount(5);
      await page.getByRole('button', { name: vehicle, exact: true }).click();
      await expect(page.getByRole('button', { name: vehicle, exact: true })).toHaveAttribute('aria-pressed', 'true');
      await page.getByRole('button', { name: '다음' }).click();
      await screen(page).toHaveAttribute('data-screen', 'pickCharacter');
      await expect(page.locator('.pick-item')).toHaveCount(3);
      await page.getByRole('button', { name: label, exact: true }).click();
      await page.getByRole('button', { name: '다음' }).click();
      await screen(page).toHaveAttribute('data-screen', 'drivingLesson');
      await expect.poll(() => page.evaluate(() => window.__e2e?.passenger)).toBe(id);
      await page.screenshot({ path: testInfo.outputPath(`passenger-${vehicle}-${id}.png`) });
    }
  }
});

test('시작·다음 버튼을 빠르게 여러 번 눌러도 화면 전환은 1번 (spec Edge)', async ({ page }) => {
  await toStart(page);
  await page.getByRole('button', { name: '시작' }).evaluate((b: HTMLElement) => {
    b.click();
    b.click();
    b.click();
  });
  await screen(page).toHaveAttribute('data-screen', 'pickVehicle');
  await page.getByRole('button', { name: '지프', exact: true }).click();
  await page.getByRole('button', { name: '다음' }).evaluate((b: HTMLElement) => {
    b.click();
    b.click();
    b.click();
  });
  await screen(page).toHaveAttribute('data-screen', 'pickCharacter');
  await page.getByRole('button', { name: 'Chicken Guy', exact: true }).click();
  await page.getByRole('button', { name: '다음' }).evaluate((b: HTMLElement) => {
    b.click();
    b.click();
  });
  await screen(page).toHaveAttribute('data-screen', 'drivingLesson');
  expect(await page.evaluate(() => (window as unknown as { __screens: string[] }).__screens)).toEqual([
    'boot',
    'loading',
    'start',
    'pickVehicle',
    'pickCharacter',
    'drivingLesson',
  ]);
});
