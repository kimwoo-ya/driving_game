import type { TrackDef } from '../content/track';

export function trackConfigKey(track: TrackDef): string {
  return `${track.id}:${track.revision}:${track.laps}`;
}

const pad2 = (n: number) => String(n).padStart(2, '0');

export function formatRecord(timeCs: number): string {
  const cs = timeCs % 100;
  const totalSec = Math.floor(timeCs / 100);
  const s = totalSec % 60;
  const totalMin = Math.floor(totalSec / 60);
  if (totalMin < 60) return `${totalMin}:${pad2(s)}.${pad2(cs)}`;
  return `${Math.floor(totalMin / 60)}:${pad2(totalMin % 60)}:${pad2(s)}.${pad2(cs)}`;
}
