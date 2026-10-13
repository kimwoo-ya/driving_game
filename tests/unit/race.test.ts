import { describe, expect, it } from 'vitest';
import { TRACK } from '../../src/content/track';
import { formatRecord, trackConfigKey } from '../../src/race/race';

describe('trackConfigKey', () => {
  it('id:revision:laps', () => {
    expect(trackConfigKey({ ...TRACK, id: 'main', revision: 1, laps: 2 })).toBe('main:1:2');
  });
});

describe('formatRecord (FR-064)', () => {
  it.each([
    [29520, '4:55.20'],
    [0, '0:00.00'],
    [359999, '59:59.99'],
    [360000, '1:00:00.00'],
    [29599, '4:55.99'], // 반올림 없음
  ])('%i → %s', (cs, text) => {
    expect(formatRecord(cs)).toBe(text);
  });
});
