import { CHARACTERS } from '../content/characters';
import { VEHICLES } from '../content/vehicles';

export type AssetId = `models/${string}.glb` | `images/${string}.svg` | `audio/${string}.mp3`;

const PREFIX = '/src/assets/';
export const ASSET_URLS: Readonly<Partial<Record<AssetId, string>>> = Object.fromEntries(
  Object.entries(
    import.meta.glob<string>('/src/assets/**/*.{glb,svg,mp3}', { query: '?url', import: 'default', eager: true }),
  ).map(([path, url]) => [path.slice(PREFIX.length), url]),
);

export type LoadResult =
  | { ok: true; files: ReadonlyMap<AssetId, ArrayBuffer> }
  | { ok: false; files: ReadonlyMap<AssetId, ArrayBuffer>; failed: readonly AssetId[]; reloadNeeded: boolean };

// 실제 시간(게임 시간 아님). 이 시간 동안 받은 바이트가 늘지 않으면 끊음
// ponytail: 고정 15초. 느린 네트워크에서 너무 이르면 기기 점검(T113)에서 조정
const STALL_MS = 15_000;

const REQUIRED: readonly AssetId[] = [...VEHICLES, ...CHARACTERS].map((k): AssetId => `models/${k.id}.glb`);

type Fetched = { id: AssetId; buf: ArrayBuffer | null; notFound: boolean };

// onBytes(받은 바이트, 크기(모르면 0), 끝남)
async function fetchOne(id: AssetId, onBytes: (got: number, size: number, done: boolean) => void): Promise<Fetched> {
  const url = ASSET_URLS[id];
  if (url === undefined) return { id, buf: null, notFound: false };
  const ctrl = new AbortController();
  let timer = setTimeout(() => ctrl.abort(), STALL_MS);
  const bump = () => {
    clearTimeout(timer);
    timer = setTimeout(() => ctrl.abort(), STALL_MS);
  };
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (res.status === 404) return { id, buf: null, notFound: true };
    if (!res.ok || res.body === null) return { id, buf: null, notFound: false };
    const total = Number(res.headers.get('content-length')) || 0;
    onBytes(0, total, false);
    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.length;
      bump();
      onBytes(received, total, false);
    }
    const out = new Uint8Array(received);
    let at = 0;
    for (const c of chunks) {
      out.set(c, at);
      at += c.length;
    }
    onBytes(received, total, true);
    return { id, buf: out.buffer, notFound: false };
  } catch {
    return { id, buf: null, notFound: false };
  } finally {
    clearTimeout(timer);
  }
}

// 진행률 = 크기를 아는 파일의 (받은 바이트 합 / 크기 합) × (그 파일 수 / 전체 수) + 크기를 모르는 파일의 (끝난 수 / 전체 수).
// 모두 크기를 알면 전체 받은 바이트 / 전체 크기. 헤더가 늦게 오면 비율이 줄 수 있어 최댓값 유지
async function loadAll(
  ids: readonly AssetId[],
  base: ReadonlyMap<AssetId, ArrayBuffer>,
  onProgress: (ratio: number) => void,
): Promise<LoadResult> {
  const prog = ids.map(() => ({ got: 0, size: 0, done: false }));
  let shown = 0;
  const report = () => {
    let got = 0;
    let size = 0;
    let known = 0;
    let unknownDone = 0;
    for (const p of prog) {
      if (p.size > 0) {
        known++;
        got += p.done ? p.size : Math.min(p.got, p.size); // 압축 전송이면 받은 바이트가 크기를 넘을 수 있음
        size += p.size;
      } else if (p.done) unknownDone++;
    }
    const ratio = ((known > 0 ? (got / size) * known : 0) + unknownDone) / ids.length;
    if (ratio > shown) {
      shown = ratio;
      onProgress(ratio);
    }
  };
  const results = await Promise.all(
    ids.map((id, i) =>
      fetchOne(id, (got, size, done) => {
        prog[i] = { got, size, done };
        report();
      }),
    ),
  );
  const files = new Map(base);
  const failed: AssetId[] = [];
  let reloadNeeded = false;
  for (const r of results) {
    if (r.buf !== null) files.set(r.id, r.buf);
    else {
      failed.push(r.id);
      if (r.notFound) reloadNeeded = true;
    }
  }
  return failed.length === 0 ? { ok: true, files } : { ok: false, files, failed, reloadNeeded };
}

export function loadRequired(onProgress: (ratio: number) => void): Promise<LoadResult> {
  return loadAll(REQUIRED, new Map(), onProgress);
}

export function retryFailed(
  prev: Extract<LoadResult, { ok: false }>,
  onProgress: (ratio: number) => void,
): Promise<LoadResult> {
  return loadAll(prev.failed, prev.files, onProgress);
}

let sounds: Promise<ReadonlyMap<AssetId, ArrayBuffer>> | null = null;

export function loadSounds(): Promise<ReadonlyMap<AssetId, ArrayBuffer>> {
  sounds ??= (async () => {
    const ids = (Object.keys(ASSET_URLS) as AssetId[]).filter((id) => id.startsWith('audio/'));
    const results = await Promise.all(ids.map((id) => fetchOne(id, () => {})));
    return new Map(results.flatMap((r) => (r.buf === null ? [] : [[r.id, r.buf] as const])));
  })();
  return sounds;
}
