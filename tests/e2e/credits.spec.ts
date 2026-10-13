import { expect, type Page, test } from '@playwright/test';
import { CREDITS } from '../../src/content/credits';

const screen = (page: Page) => expect(page.locator('body'));

async function toStart(page: Page) {
  await page.goto('./?e2e');
  await screen(page).toHaveAttribute('data-screen', 'start', { timeout: 30_000 });
}

test('크레딧: 시작 화면에서 열어 8행의 작품명·라이선스·변경 사실을 보고 돌아감 (US8-1·2·4, FR-087·088)', async ({ page }) => {
  await toStart(page);
  await page.getByRole('button', { name: '크레딧' }).click();
  await screen(page).toHaveAttribute('data-screen', 'credits');
  const rows = page.locator('.credits li');
  await expect(rows).toHaveCount(8);
  for (const [i, c] of CREDITS.entries()) {
    await expect(rows.nth(i)).toContainText(c.title);
    await expect(rows.nth(i)).toContainText(c.license);
    await expect(rows.nth(i)).toContainText(c.sourceUrl);
    await expect(rows.nth(i)).toContainText(c.changes!);
  }
  await page.getByRole('button', { name: '돌아가기' }).click();
  await screen(page).toHaveAttribute('data-screen', 'start');
});

// practiceMenu(T063)는 첫 배포 뒤라 화면이 생기면 여기에 더함
test('누르면 게임 밖으로 나가는 링크 0: start·credits·pickVehicle·pickCharacter (FR-086, SC-026)', async ({ page }) => {
  await toStart(page);
  const links = () => expect(page.locator('a[href]')).toHaveCount(0);
  await links();
  await page.getByRole('button', { name: '크레딧' }).click();
  await screen(page).toHaveAttribute('data-screen', 'credits');
  await links();
  await page.getByRole('button', { name: '돌아가기' }).click();
  await page.getByRole('button', { name: '시작' }).click();
  await screen(page).toHaveAttribute('data-screen', 'pickVehicle');
  await links();
  await page.getByRole('button', { name: '버기', exact: true }).click();
  await page.getByRole('button', { name: '다음' }).click();
  await screen(page).toHaveAttribute('data-screen', 'pickCharacter');
  await links();
});
