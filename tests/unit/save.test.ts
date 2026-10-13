import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { commitSave, loadSave, MAX_RECORD_CS, type SaveDataV1 } from '../../src/storage/save';

const KEY = 'main:1:2';
const SAVE = 'driving_game:save';
const DEFAULTS: SaveDataV1 = { v: 1, tutorialDone: false, best: null, sound: { music: true, voiceSfx: true } };

function fakeStorage(init: Record<string, string> = {}) {
  const m = new Map(Object.entries(init));
  return {
    map: m,
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, String(v)),
    removeItem: (k: string) => void m.delete(k),
  };
}

let store: ReturnType<typeof fakeStorage>;
function useStore(init: Record<string, string> = {}) {
  store = fakeStorage(init);
  vi.stubGlobal('localStorage', store);
}
const raw = (v: string) => useStore({ [SAVE]: v });
const saved = () => JSON.parse(store.map.get(SAVE)!) as SaveDataV1;

beforeEach(() => useStore());
afterEach(() => vi.unstubAllGlobals());

const valid = (patch: string) =>
  `{"v":1,"tutorialDone":true,"best":{"trackConfigKey":"main:1:2","timeCs":${patch}},"sound":{"music":false,"voiceSfx":true}}`;

describe('loadSave 손상·변조 6종 (storage.md 6장, SC-018)', () => {
  it.each([
    ['1 빈 값', ''],
    ['1b 빈 객체', '{}'],
    ['2 잘못된 형식 abc', 'abc'],
    ['2 잘못된 형식 배열', '[1,2]'],
    ['2 잘린 JSON', '{"v":1,"tutorialDone":tr'],
    ['6 모르는 형식 v:2', '{"v":2,"tutorialDone":true}'],
    ['6 v 없음', '{"tutorialDone":true}'],
  ])('%s → 3항목 기본값, ok', (_, value) => {
    raw(value);
    expect(loadSave(KEY)).toEqual({ data: DEFAULTS, ok: true });
  });

  it.each([
    ['3 숫자가 아닌 기록', '"29520"'],
    ['4 0 기록', '0'],
    ['4 음수 기록', '-5'],
    ['5 무한대 기록', '1e999'],
  ])('%s → best만 null', (_, timeCs) => {
    raw(valid(timeCs));
    expect(loadSave(KEY)).toEqual({
      data: { v: 1, tutorialDone: true, best: null, sound: { music: false, voiceSfx: true } },
      ok: true,
    });
  });
});

describe('loadSave 경계 (storage.md 6장)', () => {
  it('MAX_RECORD_CS는 유지', () => {
    raw(valid(String(MAX_RECORD_CS)));
    expect(loadSave(KEY).data.best).toEqual({ trackConfigKey: KEY, timeCs: MAX_RECORD_CS });
  });

  it.each(['36000000', '295.2'])('timeCs %s → best null', (t) => {
    raw(valid(t));
    expect(loadSave(KEY).data.best).toBeNull();
  });

  it('다른 트랙 구성의 기록은 비교하지 않음 (FR-082)', () => {
    raw(valid('29520').replace('main:1:2', 'main:1:1'));
    expect(loadSave(KEY).data.best).toBeNull();
  });

  it('tutorialDone 문자열 "true" → false', () => {
    raw('{"v":1,"tutorialDone":"true"}');
    expect(loadSave(KEY).data.tutorialDone).toBe(false);
  });

  it('sound 항목이 틀리면 sound만 기본값', () => {
    raw('{"v":1,"tutorialDone":true,"sound":{"music":1,"voiceSfx":true}}');
    expect(loadSave(KEY).data).toEqual({ ...DEFAULTS, tutorialDone: true });
  });

  it('돌려준 기본값을 바꿔도 다음 호출의 기본값은 켜짐 그대로', () => {
    loadSave(KEY).data.sound.music = false;
    expect(loadSave(KEY).data.sound).toEqual({ music: true, voiceSfx: true });
    raw('{"v":1,"sound":{"music":1}}');
    loadSave(KEY).data.sound.voiceSfx = false;
    expect(loadSave(KEY).data.sound).toEqual({ music: true, voiceSfx: true });
  });

  it('알려지지 않은 필드는 무시하고 다음 저장 때 사라짐', () => {
    raw('{"v":1,"tutorialDone":true,"__proto__":{"x":1},"extra":1}');
    const { data } = loadSave(KEY);
    expect(data).toEqual({ ...DEFAULTS, tutorialDone: true });
    expect(commitSave(data, 'sound', KEY)).toBe(true);
    expect(Object.keys(saved()).sort()).toEqual(['best', 'sound', 'tutorialDone', 'v']);
  });
});

describe('저장소 실패 (storage.md 5장, FR-080)', () => {
  it('localStorage 접근이 SecurityError면 ok false·기본값', () => {
    vi.stubGlobal('localStorage', undefined);
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get() {
        throw new DOMException('blocked', 'SecurityError');
      },
    });
    expect(loadSave(KEY)).toEqual({ data: DEFAULTS, ok: false });
    expect(commitSave(DEFAULTS, 'sound', KEY)).toBe(false);
  });

  it('읽기는 되고 시험 쓰기가 실패하면 ok false·읽은 값', () => {
    raw(valid('29520'));
    store.setItem = () => {
      throw new DOMException('full', 'QuotaExceededError');
    };
    expect(loadSave(KEY)).toEqual({
      data: { v: 1, tutorialDone: true, best: { trackConfigKey: KEY, timeCs: 29520 }, sound: { music: false, voiceSfx: true } },
      ok: false,
    });
  });

  it('commitSave의 setItem이 QuotaExceededError면 false', () => {
    store.setItem = () => {
      throw new DOMException('full', 'QuotaExceededError');
    };
    expect(commitSave({ ...DEFAULTS, tutorialDone: true }, 'tutorial', KEY)).toBe(false);
  });
});

describe('저장·복원', () => {
  it('3항목 왕복 (SC-016)', () => {
    const data: SaveDataV1 = { v: 1, tutorialDone: true, best: { trackConfigKey: KEY, timeCs: 29520 }, sound: { music: false, voiceSfx: true } };
    expect(commitSave(data, 'sound', KEY)).toBe(true);
    expect(loadSave(KEY)).toEqual({ data, ok: true });
    expect(store.map.has('driving_game:probe')).toBe(false);
  });

  it('완주 기록 5개를 차례로 저장하면 저장값 = 최솟값 (SC-015)', () => {
    for (const t of [31000, 29520, 30500, 29521, 40000]) {
      commitSave({ ...DEFAULTS, best: { trackConfigKey: KEY, timeCs: t } }, 'best', KEY);
    }
    expect(saved().best).toEqual({ trackConfigKey: KEY, timeCs: 29520 });
  });
});

describe('두 탭 합치기 (storage.md 7장 2·3번째, SC-019)', () => {
  it('탭 A 완료 저장 뒤 탭 B(미완료)의 소리 변경 → 완료 유지·소리는 B 값', () => {
    commitSave({ ...DEFAULTS, tutorialDone: true }, 'tutorial', KEY);
    const tabB = { ...DEFAULTS, sound: { music: false, voiceSfx: false } };
    commitSave(tabB, 'sound', KEY);
    expect(saved()).toEqual({ v: 1, tutorialDone: true, best: null, sound: { music: false, voiceSfx: false } });
  });

  it('탭 A 소리 끔 뒤 탭 B 기록 저장 → 소리는 A 값', () => {
    commitSave({ ...DEFAULTS, sound: { music: false, voiceSfx: true } }, 'sound', KEY);
    commitSave({ ...DEFAULTS, best: { trackConfigKey: KEY, timeCs: 30000 } }, 'best', KEY);
    expect(saved()).toEqual({
      v: 1,
      tutorialDone: false,
      best: { trackConfigKey: KEY, timeCs: 30000 },
      sound: { music: false, voiceSfx: true },
    });
  });
});
