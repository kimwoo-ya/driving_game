import { expect, test } from '@playwright/test';

// data-screen이 바뀔 때마다 기록해 지나간 화면 순서를 확인함.
// 같은 작업 안에서 여러 번 바뀌면 콜백이 한 번에 받으므로 이전 값(oldValue)도 함께 기록
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const seen: string[] = [];
    const add = (s: string | null | undefined) => {
      if (s && seen.at(-1) !== s) seen.push(s);
    };
    (window as unknown as { __screens: string[] }).__screens = seen;
    new MutationObserver((records) => {
      for (const m of records) add(m.oldValue);
      add(document.body?.dataset.screen);
    }).observe(document, { attributes: true, subtree: true, attributeFilter: ['data-screen'], attributeOldValue: true });
  });
});

const screens = (page: import('@playwright/test').Page) =>
  page.evaluate(() => (window as unknown as { __screens: string[] }).__screens);

test('하위 경로에서 loading을 거쳐 start에 도달하고 404가 없다', async ({ page }) => {
  const notFound: string[] = [];
  page.on('response', (r) => {
    if (r.status() === 404) notFound.push(r.url());
  });
  await page.goto('./');
  await expect(page.locator('body')).toHaveAttribute('data-screen', 'start', { timeout: 30_000 });
  expect(await screens(page)).toEqual(['boot', 'loading', 'start']);
  expect(notFound).toEqual([]);
});

test('start에서 새로 고치면 loading부터 다시 start (FR-002)', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('body')).toHaveAttribute('data-screen', 'start', { timeout: 30_000 });
  await page.reload();
  await expect(page.locator('body')).toHaveAttribute('data-screen', 'start', { timeout: 30_000 });
  expect(await screens(page)).toEqual(['boot', 'loading', 'start']);
});

test('모든 요청이 테스트 서버·data:·blob:뿐이다 (FR-085)', async ({ page, baseURL }) => {
  const origin = new URL(baseURL!).origin;
  const outside: string[] = [];
  page.on('request', (r) => {
    const url = r.url();
    if (!url.startsWith('data:') && !url.startsWith('blob:') && new URL(url).origin !== origin) outside.push(url);
  });
  await page.goto('./');
  await expect(page.locator('body')).toHaveAttribute('data-screen', 'start', { timeout: 30_000 });
  expect(outside).toEqual([]);
});

test('WebGL2 가능 여부를 출력한다', async ({ page, browserName }) => {
  await page.goto('./');
  const webgl2 = await page.evaluate(
    () => document.createElement('canvas').getContext('webgl2') !== null,
  );
  console.log(`[webgl2] ${browserName}: ${webgl2}`);
});
