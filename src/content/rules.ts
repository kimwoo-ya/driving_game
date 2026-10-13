import type { CharacterPose } from './characters';
import type { ScenarioId } from './scenarios';
import type { SceneElementId } from './town';

export type RuleId =
  | 'A6' | 'A7' | 'A5' | 'A9' | 'A1' | 'A2' | 'A3' | 'A4' | 'A8' | 'A25' | 'A26' | 'B4' | 'B8' | 'B12' | 'B13' | 'B15'
  | 'A10' | 'A11' | 'A14-A15' | 'A16-A17' | 'A19-A20' | 'A12' | 'A13' | 'A18' | 'B1' | 'B5' | 'B7' | 'B11'
  | 'A22' | 'A21' | 'A24' | 'A23' | 'B2' | 'B3' | 'B6' | 'B9' | 'B10' | 'B14';

export type PictureElementId = 'adult-person' | 'person-across-street' | 'friend-person' | 'umbrella' | 'bright-clothes';

export type SafetyRule = {
  id: RuleId;
  scenario: ScenarioId;
  tier: 'core' | 'extra';
  text: string;
  researchIds: readonly string[];
  sceneElements: readonly SceneElementId[];
  pictureElements: readonly PictureElementId[];
  weather: 'rain' | 'dark' | null;
  poses: readonly CharacterPose[];
  durationTicks: number;
};

// durationTicks는 자리값(4초). 콘텐츠 확정(T101)에서 음성 길이 이상으로 정함
const PLACEHOLDER_CARD_TICKS = 240;

// spec.md "보행 안전 규칙 배정" 표 순서·원문(data-model.md 6.2)
export const SAFETY_RULES = [
  { id: 'A6', scenario: 'signal-wait', tier: 'core', text: '횡단보도 앞에서는 우선 멈춰요.', researchIds: ['A6'], sceneElements: [], pictureElements: [], weather: null, poses: [], durationTicks: PLACEHOLDER_CARD_TICKS },
  { id: 'A7', scenario: 'signal-wait', tier: 'core', text: '한 발 뒤로 물러서서 신호를 기다려요.', researchIds: ['A7'], sceneElements: [], pictureElements: [], weather: null, poses: [], durationTicks: PLACEHOLDER_CARD_TICKS },
  { id: 'A5', scenario: 'signal-wait', tier: 'core', text: '빨간불에는 멈춰요. 초록불에 건너요.', researchIds: ['A5'], sceneElements: [], pictureElements: [], weather: null, poses: [], durationTicks: PLACEHOLDER_CARD_TICKS },
  { id: 'A9', scenario: 'signal-wait', tier: 'core', text: '깜빡이는 초록불에는 건너지 않아요. 다음 초록불을 기다려요.', researchIds: ['A9'], sceneElements: [], pictureElements: [], weather: null, poses: [], durationTicks: PLACEHOLDER_CARD_TICKS },
  { id: 'A1', scenario: 'signal-wait', tier: 'extra', text: '길은 보도로, 차도에서 먼 안쪽으로 걸어요.', researchIds: ['A1'], sceneElements: [], pictureElements: [], weather: null, poses: [], durationTicks: PLACEHOLDER_CARD_TICKS },
  { id: 'A2', scenario: 'signal-wait', tier: 'extra', text: '어른 손을 꼭 잡고 걸어요.', researchIds: ['A2'], sceneElements: [], pictureElements: ['adult-person'], weather: null, poses: [], durationTicks: PLACEHOLDER_CARD_TICKS },
  { id: 'A3', scenario: 'signal-wait', tier: 'extra', text: '길에서는 뛰지 않아요. 찻길로 뛰어들지 않아요.', researchIds: ['A3'], sceneElements: [], pictureElements: [], weather: null, poses: [], durationTicks: PLACEHOLDER_CARD_TICKS },
  { id: 'A4', scenario: 'signal-wait', tier: 'extra', text: '길은 횡단보도로 건너요. 아무 데서나 건너지 않아요.', researchIds: ['A4'], sceneElements: [], pictureElements: [], weather: null, poses: [], durationTicks: PLACEHOLDER_CARD_TICKS },
  { id: 'A8', scenario: 'signal-wait', tier: 'extra', text: '차가 나를 잘 보고, 내가 차를 잘 볼 수 있는 곳에 서요.', researchIds: ['A8'], sceneElements: [], pictureElements: [], weather: null, poses: [], durationTicks: PLACEHOLDER_CARD_TICKS },
  { id: 'A25', scenario: 'signal-wait', tier: 'extra', text: '길 건너편에서 누가 불러도 뛰어가지 않아요.', researchIds: ['A25'], sceneElements: [], pictureElements: ['person-across-street'], weather: null, poses: [], durationTicks: PLACEHOLDER_CARD_TICKS },
  { id: 'A26', scenario: 'signal-wait', tier: 'extra', text: '찻길 옆에서는 친구를 밀거나 장난치지 않아요.', researchIds: ['A26'], sceneElements: [], pictureElements: ['friend-person'], weather: null, poses: [], durationTicks: PLACEHOLDER_CARD_TICKS },
  { id: 'B4', scenario: 'signal-wait', tier: 'extra', text: '공이 찻길로 굴러가도 뛰어들지 않아요. 어른에게 도와 달라고 해요.', researchIds: ['B4'], sceneElements: ['rolling-ball'], pictureElements: [], weather: null, poses: [], durationTicks: PLACEHOLDER_CARD_TICKS },
  { id: 'B8', scenario: 'signal-wait', tier: 'extra', text: '통학버스에서 내리면 버스가 떠날 때까지 제자리에서 기다려요.', researchIds: ['B8'], sceneElements: ['school-bus', 'bus-stop'], pictureElements: [], weather: null, poses: [], durationTicks: PLACEHOLDER_CARD_TICKS },
  { id: 'B12', scenario: 'signal-wait', tier: 'extra', text: '노란 선 안쪽에서 기다려요.', researchIds: ['B12'], sceneElements: ['yellow-wait-line'], pictureElements: [], weather: null, poses: [], durationTicks: PLACEHOLDER_CARD_TICKS },
  { id: 'B13', scenario: 'signal-wait', tier: 'extra', text: '비 오는 날엔 앞이 보이게 우산을 들고, 평소보다 더 뒤에서 기다려요.', researchIds: ['B13'], sceneElements: [], pictureElements: ['umbrella'], weather: 'rain', poses: [], durationTicks: PLACEHOLDER_CARD_TICKS },
  { id: 'B15', scenario: 'signal-wait', tier: 'extra', text: '육교나 지하도가 있으면 그리로 건너요.', researchIds: ['B15'], sceneElements: ['overpass-or-underpass'], pictureElements: [], weather: null, poses: [], durationTicks: PLACEHOLDER_CARD_TICKS },
  { id: 'A10', scenario: 'crossing-check', tier: 'core', text: '초록불로 바뀌어도 바로 건너지 않아요. 멈춰서 살펴요.', researchIds: ['A10'], sceneElements: [], pictureElements: [], weather: null, poses: [], durationTicks: PLACEHOLDER_CARD_TICKS },
  { id: 'A11', scenario: 'crossing-check', tier: 'core', text: '왼쪽, 오른쪽, 다시 왼쪽을 봐요.', researchIds: ['A11'], sceneElements: [], pictureElements: [], weather: null, poses: ['lookLeft', 'lookRight', 'lookLeft'], durationTicks: PLACEHOLDER_CARD_TICKS },
  { id: 'A14-A15', scenario: 'crossing-check', tier: 'core', text: '운전자를 보며 손을 들어요. 운전자에게 내가 잘 보여요.', researchIds: ['A14', 'A15'], sceneElements: [], pictureElements: [], weather: null, poses: ['raiseHand'], durationTicks: PLACEHOLDER_CARD_TICKS },
  { id: 'A16-A17', scenario: 'crossing-check', tier: 'core', text: '손을 들어도, 초록불이어도 안 멈추는 차가 있어요. 차가 완전히 멈췄는지 확인해요.', researchIds: ['A16', 'A17'], sceneElements: [], pictureElements: [], weather: null, poses: [], durationTicks: PLACEHOLDER_CARD_TICKS },
  { id: 'A19-A20', scenario: 'crossing-check', tier: 'core', text: '뛰지 말고 걸어서 건너요. 건너는 동안에도 차를 봐요.', researchIds: ['A19', 'A20'], sceneElements: [], pictureElements: [], weather: null, poses: ['walk'], durationTicks: PLACEHOLDER_CARD_TICKS },
  { id: 'A12', scenario: 'crossing-check', tier: 'extra', text: '마음속으로 하나, 둘, 셋 세며 살펴요.', researchIds: ['A12'], sceneElements: [], pictureElements: [], weather: null, poses: [], durationTicks: PLACEHOLDER_CARD_TICKS },
  { id: 'A13', scenario: 'crossing-check', tier: 'extra', text: '횡단보도 오른쪽에 서요. 오른쪽으로 건너요.', researchIds: ['A13'], sceneElements: [], pictureElements: [], weather: null, poses: [], durationTicks: PLACEHOLDER_CARD_TICKS },
  { id: 'A18', scenario: 'crossing-check', tier: 'extra', text: '자동차는 금방 멈추지 못해요.', researchIds: ['A18'], sceneElements: [], pictureElements: [], weather: null, poses: [], durationTicks: PLACEHOLDER_CARD_TICKS },
  { id: 'B1', scenario: 'crossing-check', tier: 'extra', text: '주차된 차 사이로 다니지 않아요. 차 사이에서 뛰어나오지 않아요.', researchIds: ['B1'], sceneElements: ['parked-cars'], pictureElements: [], weather: null, poses: [], durationTicks: PLACEHOLDER_CARD_TICKS },
  { id: 'B5', scenario: 'crossing-check', tier: 'extra', text: '큰 차 앞에서 갑자기 뛰어나가지 않아요.', researchIds: ['B5'], sceneElements: ['large-vehicle'], pictureElements: [], weather: null, poses: [], durationTicks: PLACEHOLDER_CARD_TICKS },
  { id: 'B7', scenario: 'crossing-check', tier: 'extra', text: '통학버스 앞이나 뒤로 길을 건너지 않아요.', researchIds: ['B7'], sceneElements: ['school-bus'], pictureElements: [], weather: null, poses: [], durationTicks: PLACEHOLDER_CARD_TICKS },
  { id: 'B11', scenario: 'crossing-check', tier: 'extra', text: '신호등 없는 횡단보도에서도 오른쪽에 서서 손을 들고, 차가 멈춘 걸 확인한 뒤 차를 보며 천천히 건너요.', researchIds: ['B11'], sceneElements: ['unsignalized-crosswalk'], pictureElements: [], weather: null, poses: [], durationTicks: PLACEHOLDER_CARD_TICKS },
  { id: 'A22', scenario: 'turning-car', tier: 'core', text: '초록불이어도 도는 차가 오는지 먼저 보고, 멈췄는지 확인해요.', researchIds: ['A22'], sceneElements: [], pictureElements: [], weather: null, poses: [], durationTicks: PLACEHOLDER_CARD_TICKS },
  { id: 'A21', scenario: 'turning-car', tier: 'core', text: '운전자는 나를 못 볼 수도 있어요. 나는 키가 작거든요.', researchIds: ['A21'], sceneElements: [], pictureElements: [], weather: null, poses: [], durationTicks: PLACEHOLDER_CARD_TICKS },
  { id: 'A24', scenario: 'turning-car', tier: 'core', text: '길모퉁이에서는 차도에서 멀리 떨어져요. 차도에 내려서지 않아요.', researchIds: ['A24'], sceneElements: [], pictureElements: [], weather: null, poses: [], durationTicks: PLACEHOLDER_CARD_TICKS },
  { id: 'A23', scenario: 'turning-car', tier: 'extra', text: '차의 깜빡이를 봐요. 왼쪽 불이 깜빡이면 차는 왼쪽으로 가요.', researchIds: ['A23'], sceneElements: [], pictureElements: [], weather: null, poses: [], durationTicks: PLACEHOLDER_CARD_TICKS },
  { id: 'B2', scenario: 'turning-car', tier: 'extra', text: '자동차 주변이나 뒤에서 놀지 않아요. 서 있는 차도 뒤로 움직일 수 있어요.', researchIds: ['B2'], sceneElements: ['parked-cars', 'reversing-car'], pictureElements: [], weather: null, poses: [], durationTicks: PLACEHOLDER_CARD_TICKS },
  { id: 'B3', scenario: 'turning-car', tier: 'extra', text: '차 밑에 물건이 들어가면 직접 꺼내지 말고 어른에게 말해요.', researchIds: ['B3'], sceneElements: ['parked-cars', 'object-under-car'], pictureElements: [], weather: null, poses: [], durationTicks: PLACEHOLDER_CARD_TICKS },
  { id: 'B6', scenario: 'turning-car', tier: 'extra', text: '큰 차가 보이면 가까이서 놀지 않고, 옆을 지날 땐 멀리 떨어져요.', researchIds: ['B6'], sceneElements: ['large-vehicle'], pictureElements: [], weather: null, poses: [], durationTicks: PLACEHOLDER_CARD_TICKS },
  { id: 'B9', scenario: 'turning-car', tier: 'extra', text: '골목길 교차로에서는 일단 멈추고 좌우를 봐요.', researchIds: ['B9'], sceneElements: ['alley'], pictureElements: [], weather: null, poses: [], durationTicks: PLACEHOLDER_CARD_TICKS },
  { id: 'B10', scenario: 'turning-car', tier: 'extra', text: '보도가 없는 길에서는 길 가장자리로, 오는 차를 보며 걸어요. 차가 오면 멈춰서 벽 쪽에 붙어요.', researchIds: ['B10'], sceneElements: ['no-sidewalk-road'], pictureElements: [], weather: null, poses: [], durationTicks: PLACEHOLDER_CARD_TICKS },
  { id: 'B14', scenario: 'turning-car', tier: 'extra', text: '어두운 날·비 오는 날엔 밝은 옷을 입어요. 운전자 눈에 잘 띄어요.', researchIds: ['B14'], sceneElements: [], pictureElements: ['bright-clothes'], weather: 'dark', poses: [], durationTicks: PLACEHOLDER_CARD_TICKS },
] as const satisfies readonly SafetyRule[];
