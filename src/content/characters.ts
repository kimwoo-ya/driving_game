export type CharacterKindId = 'chicken-guy' | 'cool-banana-guy' | 'turtle';
export type CharacterPose = 'idle' | 'walk' | 'lookLeft' | 'lookRight' | 'raiseHand';
export type CharacterKind = {
  id: CharacterKindId;
  label: string;
  yawDeg: number;
  clips: { idle?: string; walk?: string };
};

// yawDeg는 모델 렌더링 점검(T042)에서 확인: 세 인물 모두 원본 앞쪽이 +Z
export const CHARACTERS = [
  { id: 'chicken-guy', label: 'Chicken Guy', yawDeg: 0, clips: { idle: 'Armature|Idle', walk: 'Armature|Walk' } },
  { id: 'cool-banana-guy', label: 'Cool Bannana Guy', yawDeg: 0, clips: { idle: 'Idle' } },
  { id: 'turtle', label: 'Turtle', yawDeg: 0, clips: { idle: 'Idle' } },
] as const satisfies readonly CharacterKind[];
