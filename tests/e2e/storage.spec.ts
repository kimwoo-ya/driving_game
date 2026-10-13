import { expect, type Page, test } from '@playwright/test';

const SAVE_KEY = 'driving_game:save';
const DONE = JSON.stringify({ v: 1, tutorialDone: true, best: null, sound: { music: true, voiceSfx: true } });

const screen = (page: Page) => expect(page.locator('body'));
const race = (page: Page) => page.getByRole('button', { name: '레이싱' });

async function toStart(page: Page) {
  await page.goto('./?e2e');
  await screen(page).toHaveAttribute('data-screen', 'start', { timeout: 30_000 });
}

test('기록 없음: 레이싱 잠김 그림, 누르면 그림 안내만 나오고 start 그대로 (US3-1, FR-048)', async ({ page }) => {
  await toStart(page);
  await expect(race(page)).toHaveAttribute('data-locked', '');
  await race(page).click();
  await expect(page.locator('.race-hint')).toHaveAttribute('data-show', '');
  await screen(page).toHaveAttribute('data-screen', 'start');
});

test('완료 기록 주입: 레이싱 열림, 누르면 차량 고르기로 (US3-4, FR-049)', async ({ page }) => {
  await page.addInitScript(([k, v]) => localStorage.setItem(k, v), [SAVE_KEY, DONE]);
  await toStart(page);
  await expect(race(page)).not.toHaveAttribute('data-locked');
  await race(page).click();
  await screen(page).toHaveAttribute('data-screen', 'pickVehicle');
});

test('저장소 접근 예외: start에 도달하고 저장 불가 안내가 1번 켜짐, 닫지 않아도 다음·조작 버튼이 눌림 (US3-8, FR-080, SC-017 일부)', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('blocked', 'SecurityError');
      },
    });
    // data-overlays에 storageNotice가 켜진 횟수
    let on = false;
    (window as unknown as { __noticeOn: number }).__noticeOn = 0;
    new MutationObserver(() => {
      const now = (document.body?.dataset.overlays ?? '').split(' ').includes('storageNotice');
      if (now && !on) (window as unknown as { __noticeOn: number }).__noticeOn++;
      on = now;
    }).observe(document, { attributes: true, subtree: true, attributeFilter: ['data-overlays'] });
  });
  await toStart(page);
  await expect(page.locator('.storage-notice')).toBeVisible();
  await expect(race(page)).toHaveAttribute('data-locked', '');
  // 안내를 닫지 않은 채로 진행: 다음 버튼·조작 버튼 가운데를 누르면 그 버튼이 받음(FR-080 플레이를 막지 않음)
  const hit = (selector: string) =>
    page.locator(selector).evaluate((el) => {
      const r = el.getBoundingClientRect();
      return el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
    });
  await page.getByRole('button', { name: '시작' }).click();
  await page.getByRole('button', { name: '버기', exact: true }).click();
  expect(await hit('.pick-next')).toBe(true);
  await page.getByRole('button', { name: '다음' }).click();
  await page.getByRole('button', { name: 'Chicken Guy', exact: true }).click();
  await page.getByRole('button', { name: '다음' }).click();
  await screen(page).toHaveAttribute('data-screen', 'drivingLesson');
  await expect(page.locator('.storage-notice')).toBeVisible();
  for (const b of ['left', 'right', 'brake', 'accel', 'reverse', 'pause']) expect(await hit(`.control-${b}`), b).toBe(true);
  await page.getByRole('button', { name: '닫기' }).click();
  await expect(page.locator('.storage-notice')).toHaveCount(0);
  expect(await page.evaluate(() => (window as unknown as { __noticeOn: number }).__noticeOn)).toBe(1);
  await screen(page).not.toHaveAttribute('data-overlays', /storageNotice/);
});

test('저장 불가 안내는 닫지 않아도 잠시 뒤 저절로 사라짐 (FR-080)', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('blocked', 'SecurityError');
      },
    });
  });
  await toStart(page);
  await expect(page.locator('.storage-notice')).toBeVisible();
  await expect(page.locator('.storage-notice')).toHaveCount(0, { timeout: 15_000 });
  await screen(page).not.toHaveAttribute('data-overlays', /storageNotice/);
});

test('손상 값 "{": 기본값(레이싱 잠김)으로 시작하고 저장 불가 안내는 없음 (US3-9, quickstart S4-3)', async ({ page }) => {
  await page.addInitScript((k) => localStorage.setItem(k, '{'), SAVE_KEY);
  await toStart(page);
  await expect(race(page)).toHaveAttribute('data-locked', '');
  await screen(page).not.toHaveAttribute('data-overlays', /storageNotice/);
  await expect(page.locator('.storage-notice')).toHaveCount(0);
});

test('열림 상태에서 새로 고침해도 유지, 안전 연습은 연습 목록에서 바로 고름 (SC-016 일부, US3-4)', async ({ page }) => {
  await toStart(page);
  await page.evaluate(([k, v]) => localStorage.setItem(k, v), [SAVE_KEY, DONE]);
  for (let i = 0; i < 2; i++) {
    await page.reload();
    await screen(page).toHaveAttribute('data-screen', 'start', { timeout: 30_000 });
    await expect(race(page)).not.toHaveAttribute('data-locked');
  }
  expect(JSON.parse((await page.evaluate((k) => localStorage.getItem(k), SAVE_KEY))!).tutorialDone).toBe(true);
  await page.getByRole('button', { name: '시작' }).click();
  await page.getByRole('button', { name: '지프', exact: true }).click();
  await page.getByRole('button', { name: '다음' }).click();
  await page.getByRole('button', { name: 'Turtle', exact: true }).click();
  await page.getByRole('button', { name: '다음' }).click();
  await screen(page).toHaveAttribute('data-screen', 'practiceMenu');
  await expect(page.locator('.menu-item')).toHaveCount(3);
  await page.getByRole('button', { name: '신호 기다리기' }).click();
  await screen(page).toHaveAttribute('data-screen', 'practice');
});
