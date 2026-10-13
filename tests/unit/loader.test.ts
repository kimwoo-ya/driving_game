import { afterEach, describe, expect, it, vi } from 'vitest';
import { ASSET_URLS, type AssetId, loadRequired, loadSounds, retryFailed } from '../../src/app/loader';

const MODELS: readonly AssetId[] = [
  'models/buggy.glb',
  'models/jeep.glb',
  'models/truck.glb',
  'models/wagon.glb',
  'models/banana-car.glb',
  'models/chicken-guy.glb',
  'models/cool-banana-guy.glb',
  'models/turtle.glb',
];
const idOf = (url: string) => (Object.keys(ASSET_URLS) as AssetId[]).find((id) => ASSET_URLS[id] === url);

// 청크 3개로 나눠 보내는 정상 응답
function okResponse(chunks = 3, size = 30): Response {
  const body = new ReadableStream<Uint8Array>({
    start(c) {
      for (let i = 0; i < chunks; i++) c.enqueue(new Uint8Array(size / chunks).fill(i));
      c.close();
    },
  });
  return new Response(body, { headers: { 'content-length': String(size) } });
}

// 실제 fetch처럼 signal이 끊기면 본문 읽기가 실패함
function stalledResponse(signal: AbortSignal | undefined): Response {
  const body = new ReadableStream<Uint8Array>({
    start(c) {
      c.enqueue(new Uint8Array(5));
      signal?.addEventListener('abort', () => c.error(new DOMException('aborted', 'AbortError')));
    },
  });
  return new Response(body, { headers: { 'content-length': '30' } });
}

type Behavior = 'ok' | 'notFound' | 'netError' | 'stall';
function stubFetch(behavior: (id: AssetId) => Behavior) {
  const calls: AssetId[] = [];
  vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
    const id = idOf(url)!;
    calls.push(id);
    const b = behavior(id);
    if (b === 'netError') throw new TypeError('Failed to fetch');
    if (b === 'notFound') return new Response(null, { status: 404 });
    if (b === 'stall') return stalledResponse(init?.signal ?? undefined);
    return okResponse();
  });
  return calls;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('ASSET_URLS', () => {
  it('모델 8개 키가 있다', () => {
    for (const id of MODELS) expect(ASSET_URLS[id]).toEqual(expect.any(String));
  });
});

describe('loadSounds', () => {
  it('실패한 소리 파일은 결과에서 빠지고 Promise는 reject하지 않는다 (FR-070)', async () => {
    const urls = ASSET_URLS as Record<string, string>;
    urls['audio/sfx/ok.mp3'] = '/test/ok.mp3';
    urls['audio/sfx/bad.mp3'] = '/test/bad.mp3';
    stubFetch((id) => (id === 'audio/sfx/bad.mp3' ? 'netError' : 'ok'));
    try {
      const map = await loadSounds();
      // 실제 소리 파일이 추가돼도 깨지지 않게 임시로 넣은 두 항목만 확인
      expect(map.has('audio/sfx/ok.mp3')).toBe(true);
      expect(map.has('audio/sfx/bad.mp3')).toBe(false);
      expect(loadSounds()).toBe(loadSounds());
    } finally {
      delete urls['audio/sfx/ok.mp3'];
      delete urls['audio/sfx/bad.mp3'];
    }
  });
});

describe('loadRequired', () => {
  it('GLB 8개만 받고 진행률은 0 → 1로만 늘어난다 (FR-003)', async () => {
    const calls = stubFetch(() => 'ok');
    const ratios: number[] = [];
    const r = await loadRequired((x) => ratios.push(x));
    expect(r.ok).toBe(true);
    expect([...r.files.keys()].sort()).toEqual([...MODELS].sort());
    expect(calls.sort()).toEqual([...MODELS].sort());
    expect(ratios.length).toBeGreaterThan(MODELS.length);
    expect([...ratios].sort((a, b) => a - b)).toEqual(ratios);
    expect(new Set(ratios).size).toBe(ratios.length);
    expect(ratios.at(-1)).toBe(1);
  });

  // 큰 파일 1개(본문 대기) + 1바이트 7개(완료). 크기를 알면 바이트 기준, 모르면 개수 기준(modules.md 8.2)
  it.each([
    ['1000', 7 / 1007],
    [null, 7 / 8],
  ])('진행률은 바이트 기준이다 (buggy 크기 %s)', async (size, expected) => {
    let send!: () => void;
    vi.stubGlobal('fetch', async (url: string) => {
      if (idOf(url) !== 'models/buggy.glb') {
        await new Promise((r) => setTimeout(r)); // 큰 파일 헤더가 먼저 오게 함
        return okResponse(1, 1);
      }
      const body = new ReadableStream<Uint8Array>({
        start(c) {
          send = () => {
            c.enqueue(new Uint8Array(1000));
            c.close();
          };
        },
      });
      return new Response(body, size === null ? {} : { headers: { 'content-length': size } });
    });
    const ratios: number[] = [];
    const p = loadRequired((x) => ratios.push(x));
    await vi.waitFor(() => expect(ratios.at(-1)).toBeCloseTo(expected, 12));
    send();
    expect((await p).ok).toBe(true);
    expect(ratios.at(-1)).toBe(1);
  });

  it('404가 하나라도 있으면 reloadNeeded (FR-004, A5)', async () => {
    stubFetch((id) => (id === 'models/buggy.glb' ? 'notFound' : 'ok'));
    const r = await loadRequired(() => {});
    expect(r).toMatchObject({ ok: false, failed: ['models/buggy.glb'], reloadNeeded: true });
  });

  it('네트워크 오류는 failed이고 reject하지 않는다', async () => {
    stubFetch((id) => (id === 'models/jeep.glb' ? 'netError' : 'ok'));
    const r = await loadRequired(() => {});
    expect(r).toMatchObject({ ok: false, failed: ['models/jeep.glb'], reloadNeeded: false });
    expect(r.files.size).toBe(7);
  });

  it('바이트가 늘지 않으면 끊고 failed에 넣는다', async () => {
    vi.useFakeTimers();
    stubFetch((id) => (id === 'models/truck.glb' ? 'stall' : 'ok'));
    const p = loadRequired(() => {});
    await vi.advanceTimersByTimeAsync(15_000);
    expect(await p).toMatchObject({ ok: false, failed: ['models/truck.glb'], reloadNeeded: false });
  });
});

describe('retryFailed', () => {
  it('실패한 파일만 다시 받고 기존 files를 유지한다 (FR-004)', async () => {
    stubFetch((id) => (id === 'models/wagon.glb' || id === 'models/turtle.glb' ? 'netError' : 'ok'));
    const first = await loadRequired(() => {});
    if (first.ok) throw new Error('첫 로딩은 실패해야 함');
    const calls = stubFetch(() => 'ok');
    const ratios: number[] = [];
    const second = await retryFailed(first, (x) => ratios.push(x));
    expect(calls.sort()).toEqual(['models/turtle.glb', 'models/wagon.glb']);
    expect(second.ok).toBe(true);
    expect(second.files.size).toBe(8);
    for (const [id, buf] of first.files) expect(second.files.get(id)).toBe(buf);
    expect(ratios.at(-1)).toBe(1);
  });
});
