import { CHARACTERS, type CharacterKindId } from '../content/characters';
import { SCENARIOS, type ScenarioId } from '../content/scenarios';
import { VEHICLES, type VehicleKindId } from '../content/vehicles';
import { startLoop } from '../core/loop';
import { mountControls, readDriveInput, releaseAll } from '../input/controls';
import { watchLifecycle } from '../platform/lifecycle';
import { type DrivingLessonEvent, type DrivingLessonState, startDrivingLesson, stepDrivingLesson } from '../practice/drivingLesson';
import { advanceExtraCursor, isReplay, pickRules } from '../practice/ruleRotation';
import { type ScenarioAttempt, type ScenarioEvent, startScenario, stepScenario } from '../practice/scenario';
import { prepareModel } from '../render/models';
import { renderShowroom } from '../render/showroom';
import type { Stage } from '../render/stage';
import { renderTown, seatedPassenger } from '../render/townView';
import { requestGearToggle } from '../sim/vehicle';
import { flashRedirect, flashStopFirst, showCue, showDemo, showHud, updateGear } from '../ui/hud';
import { hideOverlay, mountOverlay, showPraise, showRuleCard, showViolation } from '../ui/overlays';
import { showCredits, showPick, showStart } from '../ui/screens';
import { loadRequired } from './loader';
import type { RunState } from './session';

export type ScreenState = {
  screen:
    | 'boot'
    | 'unsupported'
    | 'loading'
    | 'loadFailed'
    | 'start'
    | 'credits'
    | 'pickVehicle'
    | 'pickCharacter'
    | 'drivingLesson'
    | 'practiceMenu'
    | 'practice'
    | 'race'
    | 'raceResult'
    | 'fatal';
  paused: null | 'user' | 'auto';
  rotate: boolean;
  storageNotice: boolean;
  contextLost: boolean;
  confirmExit: boolean;
};
export type Screen = ScreenState['screen'];
export type PlaySession = { vehicle: VehicleKindId; character: CharacterKindId } & (
  | { mode: 'race' }
  | { mode: 'practice'; flow: 'sequence' | 'menu' }
);

declare global {
  interface Window {
    __e2e?: { readonly ticks: number; readonly passenger: CharacterKindId | null };
  }
}

const PLAY_SCREENS: readonly Screen[] = ['drivingLesson', 'practice', 'race'];
const PRAISE_TICKS = 120; // 자리값: 완료 칭찬 그림을 보이는 틱(T117)

/** 3D 확인이 끝난 뒤 main이 1번 부른다. storageOk는 이후 태스크(T065)에서 씀 */
export function startFlow(stage: Stage, run: RunState, storageOk: boolean): void {
  const ui = document.getElementById('ui')!;
  const controls = document.getElementById('controls')!;
  const state: ScreenState = {
    screen: 'boot',
    paused: null,
    rotate: false,
    storageNotice: false,
    contextLost: false,
    confirmExit: false,
  };
  let ticks = 0;
  let picking: number | null = null; // 선택 화면에서 지금 강조된 항목
  let play: PlaySession | null = null;
  let lesson: DrivingLessonState | null = null;
  let attempt: ScenarioAttempt | null = null;
  let praiseTicks = 0;
  const sequenceDone = new Set<ScenarioId>(); // 이번 차례로 하기에서 마친 상황
  let gearTaps = 0; // 지난 틱 이후 후진 탭 수. 틱마다 하나씩 소비

  const syncOverlays = () => {
    const on = [state.paused !== null && 'paused', state.rotate && 'rotate', state.storageNotice && 'storageNotice', state.contextLost && 'contextLost', state.confirmExit && 'confirmExit'];
    document.body.dataset.overlays = on.filter(Boolean).join(' ');
  };
  const setScreen = (screen: Screen) => {
    state.screen = screen;
    document.body.dataset.screen = screen;
    controls.hidden = !PLAY_SCREENS.includes(screen);
    if (screen === 'start') showStart(ui, onStart, onCredits);
    if (screen === 'credits') showCredits(ui, onCreditsBack);
    if (screen === 'pickVehicle') {
      picking = run.selectedVehicle === null ? null : VEHICLES.findIndex((v) => v.id === run.selectedVehicle);
      showPick(ui, VEHICLES.map((v) => v.label), picking, (i) => (picking = i), onVehicleNext);
    }
    if (screen === 'pickCharacter') {
      picking = run.selectedCharacter === null ? null : CHARACTERS.findIndex((c) => c.id === run.selectedCharacter);
      showPick(ui, CHARACTERS.map((c) => c.label), picking, (i) => (picking = i), onCharacterNext);
    }
  };

  // 버튼 처리는 지금 화면과 맞을 때만 → 연타해도 전환은 1번(spec Edge "앱 전환·생명주기")
  const onStart = () => {
    if (state.screen !== 'start') return;
    setScreen('pickVehicle'); // mode practice. 레이싱 버튼·소리 활성화는 T065·T081
  };
  const onCredits = () => state.screen === 'start' && setScreen('credits');
  const onCreditsBack = () => state.screen === 'credits' && setScreen('start');
  const onVehicleNext = () => {
    if (state.screen !== 'pickVehicle' || picking === null) return;
    run.selectedVehicle = VEHICLES[picking].id;
    setScreen('pickCharacter');
  };
  const onCharacterNext = () => {
    if (state.screen !== 'pickCharacter' || picking === null || run.selectedVehicle === null) return;
    run.selectedCharacter = CHARACTERS[picking].id;
    play = { vehicle: run.selectedVehicle, character: run.selectedCharacter, mode: 'practice', flow: 'sequence' };
    // 처음 이용 흐름(data-model.md 4.1). 다시 시작하면 practiceMenu(T063·T065) 전까지 임시로 세 상황을 처음부터(사용자 결정 2026-10-12)
    run.practiceStarted = true;
    sequenceDone.clear();
    if (!run.tutorialDone && !run.drivingLessonDone) enterLesson();
    else enterPractice(nextScenario()!);
  };
  // 이번 차례로 하기에서 순서상 다음 상황
  const nextScenario = (): ScenarioId | undefined => SCENARIOS.find((s) => !sequenceDone.has(s.id))?.id;

  const enterLesson = () => {
    releaseAll();
    gearTaps = 0;
    showHud(ui, controls);
    const r = startDrivingLesson();
    lesson = r.state;
    setScreen('drivingLesson');
    handleLesson(r.events);
  };
  const handleLesson = (events: readonly DrivingLessonEvent[]) => {
    for (const e of events) {
      if (e.type === 'hint') showCue(e.cue, e.repeat);
      else {
        run.drivingLessonDone = true;
        lesson = null;
        enterPractice(nextScenario()!);
      }
    }
  };

  const enterPractice = (id: ScenarioId) => {
    releaseAll();
    gearTaps = 0;
    praiseTicks = 0;
    showHud(ui, controls);
    mountOverlay(ui);
    const r = startScenario(id, pickRules(id, isReplay(id, run), run.extraCursor[id]));
    attempt = r.state;
    setScreen('practice');
    handleScenario(r.events);
  };
  // events.md 2·3장 화면·입력 반응(소리는 T081, 세 번째 완료 처리는 T065)
  const handleScenario = (events: readonly ScenarioEvent[]) => {
    for (const e of events) {
      if (e.type === 'hint') showCue(e.cue, e.repeat);
      else if (e.type === 'redirect') {
        releaseAll();
        flashRedirect();
        const seg = SCENARIOS.find((s) => s.id === attempt!.scenario)!.segments[attempt!.segment];
        showCue(seg.steps[attempt!.step].action, false); // 구간을 처음부터 다시 놓았으니 그 단계 그림으로(HUD는 단계 변화까지 남김)
      } else if (e.type === 'violation') {
        releaseAll();
        showViolation(e.kind);
      } else if (e.type === 'segmentReset') {
        releaseAll();
        hideOverlay();
      } else if (e.type === 'demoReplay') showDemo(e.cue);
      else if (e.type === 'pedestrianViewStart') {
        releaseAll();
        controls.hidden = true;
      } else if (e.type === 'cardShown') showRuleCard(e.rule);
      else if (e.type === 'ended') {
        hideOverlay();
        controls.hidden = false;
        const id = attempt!.scenario;
        run.extraCursor[id] = advanceExtraCursor(id, run.extraCursor[id], e.extrasCount);
      } else if (e.type === 'scenarioCompleted') {
        run.completedThisRun.add(e.scenario);
        sequenceDone.add(e.scenario);
        showPraise();
      }
    }
  };
  // 칭찬을 PRAISE_TICKS 동안 보인 뒤 순서상 다음 미완료 상황, 없으면 start
  const afterPraise = () => {
    if (++praiseTicks < PRAISE_TICKS) return;
    attempt = null;
    const next = nextScenario();
    if (next) enterPractice(next);
    else setScreen('start');
  };

  const tick = () => {
    ticks++;
    if (state.screen === 'practice' && attempt?.phase === 'done') return afterPraise();
    const playing = state.screen === 'drivingLesson' ? lesson : state.screen === 'practice' ? attempt : null;
    if (playing === null) return;
    const gearTap = gearTaps > 0;
    if (gearTap) {
      gearTaps--;
      // 운전을 받는 상태에서 움직이는 중이면 "먼저 멈춰요"(FR-018, events.md 6장)
      const driving = state.screen === 'drivingLesson' || attempt?.phase === 'driving';
      if (driving && !requestGearToggle(playing.drive).accepted) flashStopFirst();
    }
    if (state.screen === 'drivingLesson') {
      const r = stepDrivingLesson(lesson!, readDriveInput(), gearTap);
      lesson = r.state;
      handleLesson(r.events);
    } else {
      const r = stepScenario(attempt!, readDriveInput(), gearTap);
      attempt = r.state;
      handleScenario(r.events);
    }
  };
  const draw = () => {
    if (state.screen === 'pickVehicle') renderShowroom(stage, 'vehicles', picking);
    if (state.screen === 'pickCharacter') renderShowroom(stage, 'characters', picking);
    const playing = state.screen === 'drivingLesson' ? lesson : state.screen === 'practice' ? attempt : null;
    if (play && playing) {
      renderTown(stage, play, playing);
      updateGear(playing.drive.gear);
    }
    stage.draw();
  };

  const load = async () => {
    const result = await loadRequired(() => {}); // 진행률 표시는 T090
    if (!result.ok) return setScreen('loadFailed'); // 안내·다시 시도는 T089·T090
    try {
      await Promise.all([...VEHICLES, ...CHARACTERS].map((k) => prepareModel(result.files.get(`models/${k.id}.glb`)!, k)));
    } catch {
      return setScreen('loadFailed');
    }
    setScreen('start');
  };

  if (new URLSearchParams(location.search).has('e2e')) {
    window.__e2e = {
      get ticks() {
        return ticks;
      },
      get passenger() {
        return PLAY_SCREENS.includes(state.screen) ? seatedPassenger() : null;
      },
    };
  }
  mountControls(controls, (button) => {
    if (button === 'reverse' && PLAY_SCREENS.includes(state.screen)) gearTaps++; // 일시정지는 T084
  });
  watchLifecycle((signal) => {
    if (signal === 'layout' || signal === 'blur') releaseAll(); // 나머지 신호는 T086
  });
  syncOverlays();
  setScreen('loading');
  void load();
  startLoop(tick, draw);
}
