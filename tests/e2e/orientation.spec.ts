import { expect, type Page, test } from '@playwright/test';

const PORTRAIT = { width: 390, height: 844 };
const LANDSCAPE = { width: 844, height: 390 };

const screen = (page: Page) => expect(page.locator('body'));
const ticks = (page: Page) => page.evaluate(() => window.__e2e!.ticks);
const fullscreen = (page: Page) => page.evaluate(() => document.fullscreenElement !== null);

async function toStart(page: Page) {
  await page.goto('./?e2e');
  await screen(page).toHaveAttribute('data-screen', 'start', { timeout: 30_000 });
}

test('세로로 열면 시작 화면부터 돌리기 안내, 가로로 돌리면 사라짐 (US7-1, FR-007)', async ({ page }) => {
  await page.setViewportSize(PORTRAIT);
  await toStart(page);
  await expect(page.locator('.rotate-notice')).toBeVisible();
  await screen(page).toHaveAttribute('data-overlays', /rotate/);
  await page.setViewportSize(LANDSCAPE);
  await expect(page.locator('.rotate-notice')).toBeHidden();
  await screen(page).not.toHaveAttribute('data-overlays', /rotate/);
});

test('운전 중 세로로 돌리면 진행이 멈추고 누르던 입력이 풀림, 가로로 돌아오면 이어짐 (FR-007, FR-017)', async ({ page }) => {
  await toStart(page);
  await page.getByRole('button', { name: '시작' }).click();
  await page.getByRole('button', { name: '버기', exact: true }).click();
  await page.getByRole('button', { name: '다음' }).click();
  await page.getByRole('button', { name: 'Chicken Guy', exact: true }).click();
  await page.getByRole('button', { name: '다음' }).click();
  await screen(page).toHaveAttribute('data-screen', 'drivingLesson');
  // 시작 탭이 전체화면으로 바꿈 → 시험 도구는 전체화면 창의 크기를 못 바꾸므로 먼저 나감
  await page.evaluate(() => document.fullscreenElement && document.exitFullscreen());
  await page.keyboard.down('ArrowUp');
  await expect(page.locator('.control-accel')).toHaveAttribute('data-pressed');
  await page.setViewportSize(PORTRAIT);
  await expect(page.locator('.rotate-notice')).toBeVisible();
  await expect(page.locator('.control-accel')).not.toHaveAttribute('data-pressed');
  const t = await ticks(page);
  await page.waitForTimeout(500);
  expect(await ticks(page)).toBe(t);
  await page.keyboard.up('ArrowUp');
  await page.setViewportSize(LANDSCAPE);
  await expect(page.locator('.rotate-notice')).toBeHidden();
  await expect.poll(() => ticks(page)).toBeGreaterThan(t);
});

test('전체화면: 시작을 누르면 들어가고, 시작 화면 모서리 버튼으로 켜고 끔 (FR-099)', async ({ page, browserName }) => {
  await toStart(page);
  test.skip(!(await page.evaluate(() => document.fullscreenEnabled)), `${browserName}: 전체화면 API 없음 → 세로 안내만`);
  const toggle = page.getByRole('button', { name: '전체 화면' });
  await toggle.click();
  await expect.poll(() => fullscreen(page)).toBe(true);
  await page.getByRole('button', { name: '전체 화면' }).click();
  await expect.poll(() => fullscreen(page)).toBe(false);
  await page.getByRole('button', { name: '시작' }).click();
  await screen(page).toHaveAttribute('data-screen', 'pickVehicle');
  await expect.poll(() => fullscreen(page)).toBe(true);
});
