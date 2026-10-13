import type { CharacterKindId } from '../content/characters';
import type { ScenarioId } from '../content/scenarios';
import type { VehicleKindId } from '../content/vehicles';
import type { BestRecord, SaveDataV1, SoundSettings } from '../storage/save';

export type RunState = {
  selectedVehicle: VehicleKindId | null;
  selectedCharacter: CharacterKindId | null;
  tutorialDone: boolean;
  completedThisRun: Set<ScenarioId>;
  drivingLessonDone: boolean;
  practiceStarted: boolean;
  extraCursor: Record<ScenarioId, number>;
  sound: SoundSettings;
  best: BestRecord | null;
  storageNoticeShown: boolean;
  audioUnlocked: boolean;
};

export function createRunState(saved: SaveDataV1): RunState {
  return {
    selectedVehicle: null,
    selectedCharacter: null,
    tutorialDone: saved.tutorialDone,
    completedThisRun: new Set(),
    drivingLessonDone: false,
    practiceStarted: false,
    extraCursor: { 'signal-wait': 0, 'crossing-check': 0, 'turning-car': 0 },
    sound: saved.sound,
    best: saved.best,
    storageNoticeShown: false,
    audioUnlocked: false,
  };
}
