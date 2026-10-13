import type { CharacterKindId } from './characters';
import type { VehicleKindId } from './vehicles';

// 외부 자료 출처(FR-088~090). 주소는 화면에 누를 수 없는 글자로만 표시. 음원은 채택할 때 행을 더함(지금 0행)
export type CreditId = VehicleKindId | CharacterKindId;
export type Credit = {
  id: CreditId;
  kind: 'vehicleModel' | 'characterModel' | 'musicComposition' | 'musicRecording' | 'sfx' | 'voice' | 'font' | 'icon';
  title: string;
  author: string;
  sourceUrl: string;
  license: string;
  licenseUrl: string;
  changes: string | null;
  checkedOn: string; // YYYY-MM-DD 사용조건 확인일
};

const CC_BY = { license: 'CC BY 3.0', licenseUrl: 'https://creativecommons.org/licenses/by/3.0/deed.ko' } as const;
const CC0 = { license: 'CC0 1.0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/deed.ko' } as const;
const CHECKED_ON = '2026-10-12';

// 변경 사실 문구(contracts/assets.md 7장)
const VEHICLE_CHANGES =
  'poly.pizza가 원작 파일을 GLB 형식으로 변환해 배포한 파일을 사용했습니다. 게임에서 크기·방향·바닥 위치를 맞추고, 여러 부분을 재질별로 합쳐 표시합니다.';
const RIGGED_CHANGES =
  'poly.pizza가 변환한 GLB를 바탕으로 방향·크기·바닥 위치를 맞추고, 팔꿈치·손목 주변에 면을 나누는 선과 뼈대를 추가했습니다. 기본 자세·손 들기·좌우 보기·앉기 동작을 추가했으며 원래 재질을 유지했습니다.';
const CHICKEN_CHANGES =
  'poly.pizza가 원작 파일을 GLB 형식으로 변환해 배포한 파일을 사용했습니다. 게임에서 크기·방향·바닥 위치를 맞추고, 포함된 걷기·서 있기 동작을 사용하며, 머리·손 관절을 움직여 왼쪽·오른쪽 보기와 손 들기를 표현합니다.';

const vehicle = (id: VehicleKindId, title: string, author: string, sourceUrl: string): Credit => ({
  id,
  kind: 'vehicleModel',
  title,
  author,
  sourceUrl,
  ...CC_BY,
  changes: VEHICLE_CHANGES,
  checkedOn: CHECKED_ON,
});

export const CREDITS: readonly Credit[] = [
  vehicle('buggy', 'Buggy', 'Nick Slough', 'https://poly.pizza/m/eZ_13w7qZh7'),
  vehicle('jeep', 'Jeep', 'Zsky', 'https://poly.pizza/m/AcSdGGrgYP'),
  vehicle('truck', 'Truck', 'sugamo', 'https://poly.pizza/m/fbDxapxkwY9'),
  vehicle('wagon', 'Wagon', 'Poly by Google', 'https://poly.pizza/m/8HnKzYQeRYD'),
  vehicle('banana-car', 'cartoon banana car', 'Felipe Lujan-Bear', 'https://poly.pizza/m/1RjuCX8gI9w'),
  {
    id: 'chicken-guy',
    kind: 'characterModel',
    title: 'Chicken Guy',
    author: 'J-Toastie',
    sourceUrl: 'https://poly.pizza/m/b2hbNsaTN0',
    ...CC_BY,
    changes: CHICKEN_CHANGES,
    checkedOn: CHECKED_ON,
  },
  {
    id: 'cool-banana-guy',
    kind: 'characterModel',
    title: 'Cool Bannana Guy',
    author: 'Polygonal Mind',
    sourceUrl: 'https://poly.pizza/m/TFlEjNafR1',
    ...CC0,
    changes: RIGGED_CHANGES,
    checkedOn: CHECKED_ON,
  },
  {
    id: 'turtle',
    kind: 'characterModel',
    title: 'Turtle',
    author: 'marioba',
    sourceUrl: 'https://poly.pizza/m/RvTg4XTOUH',
    ...CC_BY,
    changes: RIGGED_CHANGES,
    checkedOn: CHECKED_ON,
  },
];
