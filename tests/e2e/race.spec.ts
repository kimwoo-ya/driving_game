import { expect, type Page, test } from '@playwright/test';

// 3D가 필요한 spec(T005 규칙): records/tooling-and-render.md에서 두 엔진 모두 WebGL2 true라 둘 다 실행
const SAVE_KEY = 'driving_game:save';
const DONE = JSON.stringify({ v: 1, tutorialDone: true, best: null, sound: { music: true, voiceSfx: true } });
const VEHICLES = ['버기', '지프', '트럭', '왜건', '바나나 자동차'];

const screen = (page: Page) => expect(page.locator('body'));
const e2e = (page: Page) => page.evaluate(() => ({ ...window.__e2e! }));

test.beforeEach(async ({ page }) => {
  await page.addInitScript(([k, v]) => localStorage.setItem(k, v), [SAVE_KEY, DONE]);
});

/** 시작 → 레이싱 → 차량 → Chicken Guy까지(마지막 "다음"은 누르지 않음) */
async function toPickCharacter(page: Page, vehicle: string) {
  await page.goto('./?e2e');
  await screen(page).toHaveAttribute('data-screen', 'start', { timeout: 30_000 });
  await page.getByRole('button', { name: '레이싱' }).click();
  await page.getByRole('button', { name: vehicle, exact: true }).click();
  await page.getByRole('button', { name: '다음' }).click();
  await page.getByRole('button', { name: 'Chicken Guy', exact: true }).click();
}

test('완료 기록이 있으면 차량 5종 각각 레이싱 경기에 들어가고, 순위가 1~4, 아이 차에 고른 인물 (SC-001 레이싱, FR-053·056)', async ({ page }) => {
  test.setTimeout(180_000);
  for (const vehicle of VEHICLES) {
    await toPickCharacter(page, vehicle);
    await page.getByRole('button', { name: '다음' }).click();
    await screen(page).toHaveAttribute('data-screen', 'race');
    await expect.poll(async () => (await e2e(page)).passenger).toBe('chicken-guy');
    const { raceTicks, playerRank } = await e2e(page);
    expect(raceTicks).not.toBeNull();
    expect([1, 2, 3, 4]).toContain(playerRank);
    await expect(page.locator('.race-stat')).toHaveCount(3);
    await expect(page.locator('#controls')).toBeVisible();
  }
});

test('카운트다운 동안 경기 시간 0, 출발 신호 뒤부터 늘어남 (FR-055, page.clock)', async ({ page }) => {
  await page.clock.install();
  await toPickCharacter(page, '버기');
  await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 1000); // 여기부터 게임 시간은 runFor로만 흐름
  await page.getByRole('button', { name: '다음' }).click();
  await screen(page).toHaveAttribute('data-screen', 'race');
  expect((await e2e(page)).raceTicks).toBe(0);
  await page.clock.runFor(2500); // 카운트다운 3초 안
  expect((await e2e(page)).raceTicks).toBe(0);
  await page.clock.runFor(1500); // 출발 신호 지나 약 1초
  const { raceTicks, playerRank } = await e2e(page);
  expect(raceTicks).toBeGreaterThan(0);
  expect([1, 2, 3, 4]).toContain(playerRank);
});
