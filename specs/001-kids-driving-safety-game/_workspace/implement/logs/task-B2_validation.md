# Task B2 Validation Report

- 검토일: 2026-10-12
- run: `run_43739cd2a087`
- task: `task_1b6723135279`
- dispatch: `ctx_4831dedae27b`
- 실제 도구 / 세션 handle: Codex / `term_afd8a2fc-574b-4c26-affd-7a09efcd8c4e` (B1과 같은 실제 세션)
- PROJECT_ROOT: `/Users/kyw/Documents/git/mine/driving_game`
- FEATURE_DIR: `/Users/kyw/Documents/git/mine/driving_game/specs/001-kids-driving-safety-game`
- 단계 / 검토 태스크: speckit implement / B2, T007~T021
- revision 요청값: `44a8ae51636ddd2b55873e97d2ab58b4767696783f20f8951bd71d2773b8b826`
- revision 읽기 전: `44a8ae51636ddd2b55873e97d2ab58b4767696783f20f8951bd71d2773b8b826`
- revision 테스트 후: `44a8ae51636ddd2b55873e97d2ab58b4767696783f20f8951bd71d2773b8b826`
- 검증 상태: **COMPLETE**
- 역할 판정: **PASS** — T007~T021 각 PASS. 저장 기본값 결함 수정 확인.
- 시도: 검증 2회 / 수정 재시도 1회 / T016 FAIL 이력 1회(해결).
- 원문 및 코드 근거: 아래 태스크별 표와 FAIL 상세(경로는 PROJECT_ROOT 기준, 피처 문서는 FEATURE_DIR 기준).
- 실행한 테스트 명령 / 종료 코드 / 결과: 최신 재검증에서 저장 26/26·전체 63/63·typecheck·build·독립 재현 assert 모두 종료 0. 최초 실패 증거는 아래 보존.
- 미해결 질문·지적 / 이전 지적 처리 결과: 없음. T016 공유 기본값 1건 해결. B1의 검증 명령 결함 판단은 task-B1_validation.md 그대로이며 B2에서 새 구현 결함으로 계산하지 않음.

## 최신 재검증 — 수정 뒤 PASS

재검증 요청 `msg_329e67bf0888`을 같은 세션에서 수신하고 `msg_0b8536e9d979`로 수신·revision 일치를 회신했습니다. 수정은 `src/storage/save.ts`의 공유 DEFAULT_SOUND 제거와 `:52`의 호출별 새 fallback 객체, `tests/unit/save.test.ts:86`의 1개 테스트 추가입니다. 저장 모듈 전체와 추가 테스트를 다시 읽었고, 나머지 태스크는 이전 원문·코드 근거와 새 revision의 전체 테스트·타입 검사 결과로 PASS를 유지합니다.

| 재검증 명령 | 종료 코드 | 결과 |
|---|---|---|
| snapshot 표준 명령(읽기 전 / 테스트 후) | 0 / 0 | 상단 새 revision과 일치 |
| `npm run typecheck` | 0 | 통과 |
| `npm test -- tests/unit/save.test.ts` | 0 | 26 passed |
| `npm test` | 0 | 6 files, 63 passed |
| `npm run build` | 0 | 통과 |
| `node --input-type=module` 독립 재현 assert | 0 | 처음 반환한 sound를 수정해도 다음 빈 저장소와 손상 sound 호출은 모두 `{ music: true, voiceSfx: true }`; 반환 객체도 서로 다름 |

초기 revision `bf0691e92ab096b622c56186b125ec20e4f151dc6f465868f701c406649438a1`의 최초 판정은 COMPLETE/FAIL이었고, 당시 요청·읽기 전·테스트 후 값도 모두 같았습니다. 아래 최초 검사 기록과 실패 재현은 처리 이력이며 현재 미해결 항목이 아닙니다.

## 원문과 범위

AGENTS.md·PRD·GLOSSARY·교차 검증 절차·validator 역할·빈 constitution 처리 및 전체 필수 원문은 B1에서 읽은 같은 세션의 맥락을 유지했습니다. B2 요청 `msg_b3805a296d94`, 구현 로그 `task-B2_impl.md`, 새 소스와 테스트 전부를 직접 읽었으며, tasks.md 변경은 T001~T006의 완료 표시뿐임을 확인했습니다. 수신 status는 `msg_ae1f4890a4f2`입니다.

TypeScript/three.js 정적 게임의 실제 모듈·state·localStorage 계약을 기준으로 하며 Java/Spring/JPA/REST/Maven 기준은 적용하지 않았습니다. T013·T017 및 운전 성능·시간 상수는 승인된 자리값 단계로 평가합니다. GLB 내용 확인(#12·#14 후반)은 T023, 실제 렌더링과 콘텐츠 완성·기기 검사는 이후 태스크입니다.

## 태스크별 판정

| 태스크 | 판정 | 원문 근거 | 코드·테스트 근거 |
|---|---|---|---|
| T007 Pages 설정 | PASS | tasks.md:62, quickstart.md:89 | 읽기 전용 `gh api repos/kimwoo-ya/driving_game/pages --jq .build_type` → `workflow`, 종료 0. 공개 배포 성공을 뜻하지 않음. |
| T008 고정 시간 루프 | PASS | tasks.md:72, contracts/modules.md:10 | `src/core/loop.ts:1` 상수, `:8` 간격/8틱 상한/누적, `:19` rAF, `:35` 재개 초기화. `tests/unit/loop.test.ts:18` 4건 통과. 추가 가짜 rAF 검사에서 60초 정지 동안 tick 0, draw 유지, 재개 뒤 1틱 확인. |
| T009 차량·인물 목록 | PASS | tasks.md:73, data-model.md:71, contracts/modules.md 타입 소속 표 | `src/content/vehicles.ts:1` Vec3 import type, `:10` 5종 순서·한국어 이름·좌석·성능 필드 없음. `src/content/characters.ts:1` 3종·pose, `:11` 요구 clips·yawDeg. 타입 검사 통과. |
| T010 목록·좌석·클립 데이터 검사 | PASS | tasks.md:74, contracts/content-data.md:103 | `tests/unit/content.test.ts:60`, `:65`, `:72`에서 ID 전체·좌석·동작 이름 직접 검사. GLB 파일 안 클립은 아직 범위 아님. |
| T011 주행 | PASS | tasks.md:75, contracts/modules.md:73 | `src/sim/vehicle.ts:3` 타입, `:22` 공통 성능, `:36` 브레이크 우선·조향 제한·자연 감속·방향별 속도 제한, `:56` 정차 전환, `:61` 전진·정지 초기화. `tests/unit/vehicle.test.ts:22`~164의 10건 통과. 틱 입력 스크립트/4가지 프레임 간격에서 궤적·최고 속도·정지 거리·회전 반경·후진 속도·통과 틱 일치. 함수가 차량 종류를 받지 않아 외형별 계산 경로 없음. |
| T012 성능 데이터 검사 | PASS | tasks.md:76, contracts/content-data.md #20 | `tests/unit/content.test.ts:114` 유한 양수·후진 속도·정지 기준 범위 검사 통과. |
| T013 마을·안전 상황 자리표시 | PASS | tasks.md:77, data-model.md 2.1 | `src/content/town.ts:4` 요구 타입, `:35` 도로/보도/건물/횡단보도/신호·빈 props. `src/content/scenarios.ts:5` 타입과 `:96` 3상황 순서, 신호 기다리기 stop→wait→go·위반 4종·ActorPlan·안내. 나머지 두 상황은 요청대로 자리표시. |
| T014 구간 데이터 검사 | PASS | tasks.md:78, contracts/content-data.md #16 | `tests/unit/content.test.ts:80` 정지 인정 범위, 단계 존재, 안내 segment/afterStep 검사 통과. 현재 데이터도 유효한 비음수 정수 인덱스임을 코드에서 확인. |
| T015 규칙 38문구 | PASS | tasks.md:79, spec.md 보행 안전 규칙 배정, data-model.md 6.2 | `src/content/rules.ts:29`~68의 38행. Node 추가 비교로 문구·순서·배정·researchIds가 spec 38행과 완전 일치, sceneElements/pictureElements/weather/poses가 data-model 38행과 완전 일치 확인. `tests/unit/content.test.ts:17`~58에서 #1~#7·#9 검사 통과. |
| T016 저장 | **PASS (수정 후)** | tasks.md:80, contracts/storage.md:25, `:47`, `:94`, `:110`; spec FR-069·FR-081 | `src/storage/save.ts:52`에서 호출별 새 기본값 객체를 반환. `tests/unit/save.test.ts:86`의 빈 저장소·손상 sound 재현 테스트와 독립 assert 통과. 저장 테스트 26/26. 최초 공유 객체 결함은 아래 이력에 보존. |
| T017 트랙 자리표시·검사 | PASS | tasks.md:81, data-model.md TrackDef 및 계산값, contracts/content-data.md #18 | `src/content/track.ts:5` 타입, `:20` 닫힌 고리/폭/4개 체크포인트/4칸/3개 AI. `tests/unit/content.test.ts:92` 체크포인트·바퀴·격자·복귀 간격·뒤 후보가 트랙 안인지 검사 통과. |
| T018 트랙 키·시간 표시 | PASS | tasks.md:82, contracts/modules.md 6.1 | `src/race/race.ts:3` 구성 키, `:9` 정수 1/100초를 m:ss.cc/h:mm:ss.cc로 표시. `tests/unit/race.test.ts:5` 구성 키, `:11` 5경계값: 6건 통과. |
| T019 실행 상태 | PASS | tasks.md:83, data-model.md 2.2 RunState, contracts/modules.md 8.1 | `src/app/session.ts:6` 전 필드, `:20` 저장값과 초기 선택/집합/순환 위치/플래그 일치. `tests/unit/session.test.ts:4` 3건 통과. T016은 이 함수의 입력이 되는 저장 모듈의 결함이며 별도 원인으로 이중 계산하지 않음. |
| T020 보행자·안내 타입 | PASS | tasks.md:84, data-model.md 2.2, contracts/events.md:51 | `src/practice/townActors.ts:6` 신호/보행자 필드, `src/pedestrianView/pedestrianView.ts:3` 안내 state와 `:10` 이벤트 일치. 함수 추가 없이 타입만 선언, 타입 검사 통과. |
| T021 연습 타입·상수 | PASS | tasks.md:85, contracts/modules.md 4.4, contracts/events.md:22 | `src/practice/scenario.ts:9` 자리 상수, `:13` HintCue, `:15` ScenarioAttempt 전 필드, `:32` ScenarioEvent와 PedestrianViewEvent 합집합 일치. 타입 검사 통과. |

## 최초 FAIL 이력 (해결) — 반환값 수정이 소리 기본값까지 바꿈

- 위치: `src/storage/save.ts:9`, `src/storage/save.ts:53`.
- 요구: `loadSave`는 저장값이 없거나 `sound`가 잘못되었을 때 `{ music: true, voiceSfx: true }`로 채웁니다(contracts/storage.md:25, :47, :94, :110; spec FR-069·FR-081).
- 원인: 모듈 안 `DEFAULT_SOUND`를 복사 없이 반환합니다. `SoundSettings`와 반환 `SaveDataV1`은 수정 가능한 타입이며, `createRunState`도 그 객체를 실행 상태에 전달합니다(`src/app/session.ts:29`). 호출자가 반환된 `sound.music`을 수정하면 모듈의 기본값 객체 자체가 바뀝니다.
- 직접 재현: 빈 가짜 localStorage에서 `loadSave` → 반환값의 `music = false` → 저장소가 여전히 빈 상태에서 `loadSave`를 다시 호출했습니다. 두 반환값의 sound 객체가 같고, 두 번째 결과는 `music: false`였습니다. 기본값을 기대한 assert가 종료 1로 실패했습니다.
- 영향 범위: 저장 모듈의 공개 함수 계약 위반입니다. 현재 게임 UI 호출자는 아직 구현 전이므로 실제 화면에서 발생했다고 주장하지 않습니다. 정상적으로 반환된 실행 설정을 바꿀 수 있다는 현재 타입·상태 소유 약속 안에서 재현됩니다.
- 필요한 수정: fallback sound를 호출별 새 객체로 반환하여 내부 기본값이 호출자에게 공유되지 않게 하고, `tests/unit/save.test.ts`에 위 재현 및 손상 sound 기본값이 다시 켜짐을 확인하는 작은 테스트를 추가하십시오. 객체 전체 동결이나 추가 추상화는 필요하지 않습니다.

재현 명령(PROJECT_ROOT, 파일을 만들거나 바꾸지 않음):

```sh
node --input-type=module - <<'JS'
import assert from 'node:assert/strict';
import { loadSave } from './src/storage/save.ts';
const entries = new Map();
globalThis.localStorage = {
  getItem: (k) => entries.get(k) ?? null,
  setItem: (k, v) => entries.set(k, v),
  removeItem: (k) => entries.delete(k),
};
const first = loadSave('main:1:2');
first.data.sound.music = false;
const next = loadSave('main:1:2');
console.log('same sound object:', first.data.sound === next.data.sound);
console.log('next load from empty storage:', JSON.stringify(next));
assert.deepEqual(next.data.sound, { music: true, voiceSfx: true });
JS
```

출력: `same sound object: true`; 다음 결과 `sound: { music: false, voiceSfx: true }`; `AssertionError`, 종료 코드 **1**.

## 최초 검증 직접 실행 기록

| 명령 | 종료 코드 | 결과 |
|---|---|---|
| snapshot 표준 명령(읽기 전 / 테스트 후) | 0 / 0 | 요청 bf0691e…와 일치(상단 전체값) |
| `gh api repos/kimwoo-ya/driving_game/pages --jq .build_type` | 0 | workflow |
| `npm run typecheck` | 0 | 통과 |
| `npm test -- tests/unit/loop.test.ts` | 0 | 4 passed |
| `npm test -- tests/unit/content.test.ts` | 0 | 14 passed |
| `npm test -- tests/unit/vehicle.test.ts` | 0 | 10 passed |
| `npm test -- tests/unit/save.test.ts` | 0 | 25 passed |
| `npm test -- tests/unit/race.test.ts` | 0 | 6 passed |
| `npm test -- tests/unit/session.test.ts` | 0 | 3 passed |
| `npm test` | 0 | 6 files, 62 passed |
| `npm run build` | 0 | TypeScript 및 Vite 성공 |
| 위 저장 기본값 재현 Node assert | **1** | FAIL 상세와 같음 |
| Node 읽기 전용 원문 비교 assert | 0 | 규칙 38행의 spec 문구/순서/배정/researchIds와 data-model의 장면/그림/날씨/pose 전부 일치 |
| Node 가짜 rAF/시각 assert | 0 | 정지 중 60초 tick 증가 0, draw 유지, 재개 첫 정상 프레임 1틱 |
| `rg -n 'Date\.now\|setTimeout\|setInterval\|Math\.random\|from .three\|document\.\|window\.\|AudioContext' src/sim src/practice src/pedestrianView src/race src/storage src/content` | 1 | 일치 없음(각 대안은 실제 실행에서 정규식 OR로 검사). 순수 모듈에 금지 API 없음. |

snapshot 실제 명령:

```sh
python3 ivi-agent-guide/scripts/review-snapshot.py /Users/kyw/Documents/git/mine/driving_game /Users/kyw/Documents/git/mine/driving_game/specs/001-kids-driving-safety-game
```

## 남은 일과 한계

T016 수정 재검증을 마쳤으며 B2에 남은 구현 지적은 없습니다. 검증자는 이 보고서만 작성했으며 소스·테스트·명세·records는 수정하지 않았습니다. B2에서는 E2E·실제 모바일 기기·공개 페이지·모델 표시를 검사하지 않았습니다. 같은 Dispatch에서 다음 묶음·재검증 또는 close-review를 기다립니다.
