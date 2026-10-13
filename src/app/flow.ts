import { CHARACTERS, type CharacterKindId } from '../content/characters';
import { SCENARIOS, type ScenarioId } from '../content/scenarios';
import { TRACK } from '../content/track';
import { VEHICLES, type VehicleKindId } from '../content/vehicles';
import { startLoop, TICK_HZ } from '../core/loop';
import { mountControls, readDriveInput, releaseAll } from '../input/controls';
import { enterFullscreen, toggleFullscreen, watchLifecycle } from '../platform/lifecycle';
import { type DrivingLessonEvent, type DrivingLessonState, startDrivingLesson, stepDrivingLesson } from '../practice/drivingLesson';
import { advanceExtraCursor, isReplay, pickRules } from '../practice/ruleRotation';
import { type ScenarioAttempt, type ScenarioEvent, startScenario, stepScenario } from '../practice/scenario';
import { rankCars } from '../race/progress';
import { createRace, finishResult, type RaceEvent, type RaceState, stepRace, trackConfigKey } from '../race/race';
import { prepareModel } from '../render/models';
import { renderShowroom } from '../render/showroom';
import type { Stage } from '../render/stage';
import { renderTown, seatedPassenger } from '../render/townView';
import { racePassenger, renderTrack } from '../render/trackView';
import { requestGearToggle } from '../sim/vehicle';
import { commitSave, loadSave } from '../storage/save';
import {
  flashRedirect,
  flashStopFirst,
  showCountdown,
  showCue,
  showDemo,
  showGo,
  showHud,
  showRaceHud,
  showRaceLap,
  showRaceRank,
  showRaceTime,
  updateGear,
} from '../ui/hud';
import {
  hideOverlay,
  mountOverlay,
  mountRotateNotice,
  showPraise,
  showRaceUnlocked,
  showRuleCard,
  showStorageNotice,
  showViolation,
} from '../ui/overlays';
import { flashRaceLocked, showCredits, showPick, showPracticeMenu, showRaceResult, showStart } from '../ui/screens';
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
    __e2e?: {
      readonly ticks: number;
      readonly raceTicks: number | null;
      readonly playerRank: number | null;
      readonly passenger: CharacterKindId | null;
    };
  }
}

const PLAY_SCREENS: readonly Screen[] = ['drivingLesson', 'practice', 'race'];
const PRAISE_TICKS = 120; // 자리값: 완료 칭찬 그림을 보이는 틱(T117)
const UNLOCK_TICKS = 180; // 자리값: 레이싱 열림 축하를 보이는 틱(T117)

/** 3D 확인이 끝난 뒤 main이 1번 부른다. storageOk가 거짓이면(부팅 loadSave 실패) 시작 화면이 처음 나올 때 저장 불가 안내 1회 */
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
  let race: RaceState | null = null;
  let praiseTicks = 0;
  let mode: PlaySession['mode'] = 'practice'; // 시작 화면에서 고른 것
  let chosen: ScenarioId | null = null; // 조작 익히기 뒤에 할 상황
  let unlockedNow = false; // 이번 완료로 레이싱이 열림 → 칭찬 뒤 축하 → start
  const saveKey = trackConfigKey(TRACK);
  let gearTaps = 0; // 지난 틱 이후 후진 탭 수. 틱마다 하나씩 소비

  const syncOverlays = () => {
    const on = [state.paused !== null && 'paused', state.rotate && 'rotate', state.storageNotice && 'storageNotice', state.contextLost && 'contextLost', state.confirmExit && 'confirmExit'];
    document.body.dataset.overlays = on.filter(Boolean).join(' ');
  };
  const setScreen = (screen: Screen) => {
    state.screen = screen;
    document.body.dataset.screen = screen;
    controls.hidden = !PLAY_SCREENS.includes(screen);
    if (screen === 'start') showStart(ui, run.tutorialDone, onStart, onRace, onCredits, onFullscreen);
    if (screen === 'practiceMenu') showPracticeMenu(ui, run.completedThisRun, onScenarioPick);
    if (screen === 'credits') showCredits(ui, onCreditsBack);
    if (screen === 'raceResult') showRaceResult(ui, race!.result!, onRetry, onHome);
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
    enterFullscreen(); // 탭 안에서만 됨(FR-099)
    mode = 'practice';
    setScreen('pickVehicle'); // 소리 활성화는 T081
  };
  // 잠김이면 그림 안내만, 레이싱에 들어가지 않음(FR-048). 열림은 다시 잠기지 않음(FR-050)
  const onRace = () => {
    if (state.screen !== 'start') return;
    if (!run.tutorialDone) return flashRaceLocked();
    enterFullscreen();
    mode = 'race';
    setScreen('pickVehicle');
  };
  const onCredits = () => {
    if (state.screen === 'start') setScreen('credits');
  };
  const onFullscreen = () => {
    if (state.screen === 'start') toggleFullscreen();
  };
  const onCreditsBack = () => {
    if (state.screen === 'credits') setScreen('start');
  };
  // 결과 화면: 같은 차·인물로 새 경기(FR-065), 또는 시작 화면으로
  const onRetry = () => {
    if (state.screen === 'raceResult') enterRace();
  };
  const onHome = () => {
    if (state.screen === 'raceResult') setScreen('start');
  };
  const onVehicleNext = () => {
    if (state.screen !== 'pickVehicle' || picking === null) return;
    run.selectedVehicle = VEHICLES[picking].id;
    setScreen('pickCharacter');
  };
  const onCharacterNext = () => {
    if (state.screen !== 'pickCharacter' || picking === null || run.selectedVehicle === null) return;
    run.selectedCharacter = CHARACTERS[picking].id;
    const picked = { vehicle: run.selectedVehicle, character: run.selectedCharacter };
    if (mode === 'race') {
      play = { ...picked, mode };
      return enterRace();
    }
    // 처음 이용 흐름은 저장된 완료 기록 없이 이번 실행에서 처음 시작할 때만, 그 밖은 연습 목록(data-model.md 4.1)
    if (run.tutorialDone || run.practiceStarted) {
      play = { ...picked, mode, flow: 'menu' };
      return setScreen('practiceMenu');
    }
    play = { ...picked, mode, flow: 'sequence' };
    run.practiceStarted = true;
    begin(nextScenario()!);
  };
  const onScenarioPick = (id: ScenarioId) => {
    if (state.screen === 'practiceMenu') begin(id);
  };
  // 처음 이용 중 조작 익히기를 아직 안 했으면 먼저 조작 익히기, 그 뒤 고른 상황(data-model.md 4.1)
  const begin = (id: ScenarioId) => {
    chosen = id;
    if (!run.tutorialDone && !run.drivingLessonDone) enterLesson();
    else enterPractice(id);
  };
  // 처음 이용 흐름에서 순서상 다음 미완료 상황
  const nextScenario = (): ScenarioId | undefined => SCENARIOS.find((s) => !run.completedThisRun.has(s.id))?.id;

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
        enterPractice(chosen!);
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
  // events.md 2·3장 화면·입력 반응(소리는 T081)
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
        // 세 상황이 처음 다 참 → 같은 틱에 열림·저장. 저장 실패는 안내만, 열림·축하는 늦추지 않음(FR-047, FR-080)
        if (!run.tutorialDone && run.completedThisRun.size === SCENARIOS.length) {
          run.tutorialDone = true;
          unlockedNow = true;
          if (!commitSave({ tutorialDone: true, best: run.best, sound: run.sound }, 'tutorial', saveKey)) noticeOnce();
        }
        showPraise();
      }
    }
  };
  // 칭찬을 PRAISE_TICKS 동안 보인 뒤: 레이싱이 막 열렸으면 축하 → start, 처음 이용 흐름이면 다음 미완료 상황, 그 밖은 연습 목록
  const afterPraise = () => {
    praiseTicks++;
    if (unlockedNow && praiseTicks === PRAISE_TICKS) showRaceUnlocked();
    if (praiseTicks < PRAISE_TICKS + (unlockedNow ? UNLOCK_TICKS : 0)) return;
    attempt = null;
    if (unlockedNow) {
      unlockedNow = false;
      return setScreen('start');
    }
    const next = play?.mode === 'practice' && play.flow === 'sequence' ? nextScenario() : undefined;
    if (next) enterPractice(next);
    else setScreen('practiceMenu');
  };
  // 레이싱: 새 경기(재도전도 같음)는 모든 상태를 처음으로(FR-065), 진입 때 입력 해제(FR-017)
  const rankNow = () => rankCars(race!.cars).indexOf(TRACK.playerSlot) + 1;
  const enterRace = () => {
    releaseAll();
    gearTaps = 0;
    race = createRace(play!.vehicle);
    showRaceHud(ui, controls);
    setScreen('race');
    showRaceRank(rankNow());
    showRaceLap(0, TRACK.laps);
  };
  // events.md 5장 화면·입력·저장 반응(소리는 T081)
  const handleRace = (events: readonly RaceEvent[]) => {
    for (const e of events) {
      if (e.type === 'countdownTick') showCountdown(e.secondsLeft);
      else if (e.type === 'go') showGo(); // 입력은 놓지 않음: 카운트다운 중 누른 액셀이 출발 순간 반영(FR-017 단서)
      else if (e.type === 'rankChanged') showRaceRank(e.rank);
      else if (e.type === 'lapCompleted') {
        if (e.slot === TRACK.playerSlot) showRaceLap(e.lapsDone, TRACK.laps);
      } else if (e.type === 'respawned') {
        if (e.slot === TRACK.playerSlot) releaseAll();
      } else finishRace(e.timeCs, e.rank);
    }
  };
  // 완주 틱: 최신 저장 값으로 결과 → 새 기록이면 저장. 읽기·저장 실패는 안내 1회, 결과 화면은 늦추지 않음(FR-064, FR-080, FR-083)
  const finishRace = (timeCs: number, rank: number) => {
    const saved = loadSave(saveKey);
    if (!saved.ok) noticeOnce();
    const result = finishResult({ timeCs, rank, runBest: run.best, storedBest: saved.data.best, trackConfigKey: saveKey });
    race = { ...race!, result };
    run.best = result.best;
    if (result.isNewBest && !commitSave({ tutorialDone: run.tutorialDone, best: run.best, sound: run.sound }, 'best', saveKey)) noticeOnce();
    setScreen('raceResult');
  };

  // 저장 불가 안내는 실행당 1회(storageNoticeShown, SC-017)
  const noticeOnce = () => {
    if (run.storageNoticeShown) return;
    run.storageNoticeShown = true;
    state.storageNotice = true;
    syncOverlays();
    showStorageNotice(() => {
      state.storageNotice = false;
      syncOverlays();
    });
  };

  const tick = () => {
    if (state.rotate) return; // 세로에서는 진행하지 않음(FR-007). 가로 복귀 뒤 일시정지 유지는 T086
    ticks++;
    if (state.screen === 'practice' && attempt?.phase === 'done') return afterPraise();
    const s = state.screen;
    const drive = s === 'drivingLesson' ? lesson?.drive : s === 'practice' ? attempt?.drive : s === 'race' ? race?.cars[TRACK.playerSlot].drive : undefined;
    if (!drive) return;
    const gearTap = gearTaps > 0;
    if (gearTap) {
      gearTaps--;
      // 운전을 받는 상태에서 움직이는 중이면 "먼저 멈춰요"(FR-018, events.md 6장)
      const driving = s === 'drivingLesson' || (s === 'practice' && attempt!.phase === 'driving') || (s === 'race' && race!.phase === 'running');
      if (driving && !requestGearToggle(drive).accepted) flashStopFirst();
    }
    if (s === 'drivingLesson') {
      const r = stepDrivingLesson(lesson!, readDriveInput(), gearTap);
      lesson = r.state;
      handleLesson(r.events);
    } else if (s === 'practice') {
      const r = stepScenario(attempt!, readDriveInput(), gearTap);
      attempt = r.state;
      handleScenario(r.events);
    } else {
      const r = stepRace(race!, readDriveInput(), gearTap);
      race = r.state;
      handleRace(r.events);
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
    if (state.screen === 'race' && play && race) {
      renderTrack(stage, play, race);
      updateGear(race.cars[TRACK.playerSlot].drive.gear);
      showRaceTime(Math.round((race.raceTicks * 100) / TICK_HZ));
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
    if (!storageOk) noticeOnce(); // 로딩 중이 아니라 보호자가 볼 시작 화면에서
  };

  if (new URLSearchParams(location.search).has('e2e')) {
    window.__e2e = {
      get ticks() {
        return ticks;
      },
      get raceTicks() {
        return state.screen === 'race' && race ? race.raceTicks : null;
      },
      get playerRank() {
        return state.screen === 'race' && race ? rankNow() : null;
      },
      get passenger() {
        if (state.screen === 'race') return racePassenger();
        return PLAY_SCREENS.includes(state.screen) ? seatedPassenger() : null;
      },
    };
  }
  mountControls(controls, (button) => {
    if (button === 'reverse' && PLAY_SCREENS.includes(state.screen)) gearTaps++; // 일시정지는 T084
  });
  mountRotateNotice();
  watchLifecycle((signal) => {
    if (signal === 'portrait' || signal === 'landscape') {
      state.rotate = signal === 'portrait';
      syncOverlays();
    }
    if (signal !== 'hidden' && signal !== 'visible') releaseAll(); // 숨김 반응·일시정지는 T086
  });
  // 전체화면이 바뀌면 시작 화면 버튼 그림(켜기/끄기)을 다시
  document.addEventListener('fullscreenchange', () => state.screen === 'start' && setScreen('start'));
  syncOverlays();
  setScreen('loading');
  void load();
  startLoop(tick, draw);
}
