export const MAX_RECORD_CS = 35_999_999; // 99:59:59.99

export type SoundSettings = { music: boolean; voiceSfx: boolean };
export type BestRecord = { trackConfigKey: string; timeCs: number };
export type SaveDataV1 = { v: 1; tutorialDone: boolean; best: BestRecord | null; sound: SoundSettings };

const SAVE_KEY = 'driving_game:save';
const PROBE_KEY = 'driving_game:probe';

type Loaded = { tutorialDone: boolean; best: BestRecord | null; sound: SoundSettings | null };

const isObj = (x: unknown): x is Record<string, unknown> =>
  typeof x === 'object' && x !== null && !Array.isArray(x);

export function parseSave(raw: string | null, trackConfigKey: string): Loaded {
  const none: Loaded = { tutorialDone: false, best: null, sound: null };
  if (raw === null) return none;
  let d: unknown;
  try {
    d = JSON.parse(raw);
  } catch {
    return none;
  }
  if (!isObj(d) || d.v !== 1) return none;
  const b = d.best;
  const s = d.sound;
  const t = isObj(b) ? b.timeCs : undefined;
  return {
    tutorialDone: d.tutorialDone === true,
    best:
      isObj(b) && b.trackConfigKey === trackConfigKey && Number.isSafeInteger(t) && (t as number) >= 1 && (t as number) <= MAX_RECORD_CS
        ? { trackConfigKey, timeCs: t as number }
        : null,
    sound:
      isObj(s) && typeof s.music === 'boolean' && typeof s.voiceSfx === 'boolean'
        ? { music: s.music, voiceSfx: s.voiceSfx }
        : null,
  };
}

export function loadSave(trackConfigKey: string): { data: SaveDataV1; ok: boolean } {
  let loaded = parseSave(null, trackConfigKey);
  let ok = true;
  try {
    loaded = parseSave(localStorage.getItem(SAVE_KEY), trackConfigKey);
    localStorage.setItem(PROBE_KEY, '1');
    localStorage.removeItem(PROBE_KEY);
  } catch {
    ok = false;
  }
  return {
    data: { v: 1, tutorialDone: loaded.tutorialDone, best: loaded.best, sound: loaded.sound ?? { music: true, voiceSfx: true } },
    ok,
  };
}

const shorter = (a: BestRecord | null, b: BestRecord | null) =>
  a === null ? b : b === null ? a : b.timeCs < a.timeCs ? b : a;

export function commitSave(
  current: Omit<SaveDataV1, 'v'>,
  changed: 'tutorial' | 'best' | 'sound',
  trackConfigKey: string,
): boolean {
  try {
    const latest = parseSave(localStorage.getItem(SAVE_KEY), trackConfigKey);
    const merged: SaveDataV1 = {
      v: 1,
      tutorialDone: latest.tutorialDone || current.tutorialDone,
      best: shorter(latest.best, current.best),
      sound: changed === 'sound' || latest.sound === null ? current.sound : latest.sound,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(merged));
    return true;
  } catch {
    return false;
  }
}
