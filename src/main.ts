import './style.css';
import { startFlow } from './app/flow';
import { createRunState } from './app/session';
import { TRACK } from './content/track';
import { trackConfigKey } from './race/race';
import { createStage } from './render/stage';
import { loadSave } from './storage/save';

document.body.dataset.screen = 'boot';
const stage = createStage(document.getElementById('stage') as HTMLCanvasElement, () => {}); // 컨텍스트 손실 반응은 T086
if (stage === null) {
  document.body.dataset.screen = 'unsupported'; // 안내 화면은 T089·T090
} else {
  const { data, ok } = loadSave(trackConfigKey(TRACK));
  startFlow(stage, createRunState(data), ok);
}
