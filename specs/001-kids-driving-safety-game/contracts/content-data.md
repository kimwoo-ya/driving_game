# 콘텐츠 데이터 계약

- 대상: 콘텐츠 작업(레벨 설계, 규칙 문구·그림·음성, 크레딧)과 코드 사이의 약속. `src/content/*.ts` 상수와 `src/sim/vehicle.ts`의 `DRIVING_SPEC`, 그리고 이를 지키는지 보는 Vitest 콘텐츠 무결성 검사.
- 필드 정의는 [data-model.md](../data-model.md) 2장·6장이 기준입니다. 이 문서는 **각 상수가 갖춰야 할 조건**과 **검사로 보장할 내용**을 정합니다.
- 형식: 타입 검사가 되는 TypeScript 데이터 모듈(`export const X = [...] as const satisfies readonly T[]`). 콘텐츠 작업자는 이 파일들과 `src/assets/**`만 고칩니다(plan.md 설계 원칙 5). 다른 코드는 ID로만 가리키므로 그림·음성이 없는 자리표시 상태로도 게임 흐름이 돌아갑니다.

## 1. 상수 목록

| 상수 | 파일 | 타입 | 개수 | 필수 내용(요약) | 주로 채우는 사람 | data-model.md |
|---|---|---|---|---|---|---|
| `VEHICLES` | `src/content/vehicles.ts` | `readonly VehicleKind[]` | 5 | `id`, `label`, `yawDeg`, `seats`(1개 이상). 배열 순서 = 선택 화면 순서 = 컴퓨터 차량 외형 순서. 성능 필드 **없음** | 코드 + 렌더링 점검 | 2.1 VehicleKind |
| `CHARACTERS` | `src/content/characters.ts` | `readonly CharacterKind[]` | 3 | `id`, `label`, `yawDeg`, `clips`(세 캐릭터 모두 `idle`, Chicken Guy만 `walk`) | 코드 + 렌더링 점검 | 2.1 CharacterKind |
| `SAFETY_RULES` | `src/content/rules.ts` | `readonly SafetyRule[]` | 38 | `id`, `scenario`, `tier`, `text`, `researchIds`, `sceneElements`, `pictureElements`, `weather`, `poses`, `durationTicks` | **콘텐츠** | 2.1 SafetyRule, 6.2 |
| `SCENARIOS` | `src/content/scenarios.ts` | `readonly ScenarioDef[]` | 3 | 순서 `signal-wait`, `crossing-check`, `turning-car`. 상황마다 `segments`(1+), `pedestrianView` | 코드 + 레벨 설계 | 2.1 ScenarioDef·SegmentDef·PedestrianViewDef |
| `TOWN` | `src/content/town.ts` | `TownDef` | 1 | 판정 구역(`areas`), 신호(`signals`, 차량·보행자 구분), 장면 요소 배치(`props`) | 레벨 설계 | 2.1 TownDef |
| `TRACK` | `src/content/track.ts` | `TrackDef` | 1 | `id`, `revision`, `laps`(2 잠정), `centerline`, `width`, `checkpoints`(0번 = 결승선), `grid`(4), `playerSlot`, `aiProfiles`(3) | 레벨 설계 + 플레이 점검 | 2.1 TrackDef |
| `VOICE_LINES` | `src/content/voice.ts` | `Readonly<Record<VoiceLineId, string>>` | 26 | 3장의 줄 ID마다 대본 한 줄 | 콘텐츠 | 2.1 안내 음성 줄 |
| `VIOLATION_LINES` | `src/content/voice.ts` | `Readonly<Record<ViolationKind, VoiceLineId>>` | 6 | 잘못된 행동 6종 → 설명 음성 줄 | 콘텐츠 | 2.1 VoiceLine |
| `CREDITS` | `src/content/credits.ts` | `readonly Credit[]` | 8 + 채택 음원 | 모델 8행(assets.md 7장 문구), 채택한 음원·글꼴·아이콘 | 콘텐츠 | 2.1 Credit |
| `DRIVING_SPEC` | `src/sim/vehicle.ts` | `DrivingSpec` | 1 | 성능·판정 차체 값. 차종·컴퓨터 차량 공통 단 하나 | 플레이 점검 | 2.1 DrivingSpec |

- `DRIVING_SPEC`은 콘텐츠처럼 플레이 점검에서 값을 고치지만 파일은 `src/sim/vehicle.ts`입니다(plan.md·data-model.md 6.1). 차종별 값을 둘 자리가 타입에 없습니다(FR-011).
- `VOICE_LINES`를 배열이 아닌 `Record`로 두는 이유: 코드가 부르는 줄이 하나라도 빠지면 **타입 검사에서 빌드가 실패**해 별도 시험이 필요 없습니다. 규칙 카드 음성은 `SafetyRule.text`·`RuleId`를 쓰므로 여기 넣지 않습니다.

## 2. 상수별 조건

### `VEHICLES`, `CHARACTERS`

- ID는 `VehicleKindId`·`CharacterKindId` 전부를 정확히 한 번씩(5종, 3종).
- 모델 파일 `models/<id>.glb`가 `ASSET_URLS`에 있음(필수 파일 8/8, assets.md 3장).
- `seats[0]`은 뒤에서 조금 내려다보는 카메라에서 탑승객이 보이는 자리. 지붕 있는 차량은 장난감 같은 좌석 표현으로 조정(02 결정 A2, 렌더링 점검에서 확인). `SeatDef.pos`·`height`는 정규화된 차량 좌표(m)이고 `height > 0`.
- `chicken-guy.clips = { idle: 'Armature|Idle', walk: 'Armature|Walk' }`, 리깅한 나머지 둘은 `{ idle: 'Idle' }`입니다. 두 수정본의 `yawDeg = 0`이며 에셋에 포함된 추가 자세는 assets.md의 리깅 결과를 따릅니다.

### `SAFETY_RULES`

- 38행, `scenario`·`tier` 배정은 spec.md "보행 안전 규칙 배정" 표 = data-model.md 6.2 표 그대로. `text`는 spec 표 원문에서 시작해 콘텐츠 설계가 다듬음(FR-095).
- **그림 전용 규칙**: `pictureElements`가 비어 있지 않은 규칙은 정확히 `A2`, `A25`, `A26`, `B13`, `B14`이고, 이 사람·옷차림(`adult-person`, `person-across-street`, `friend-person`, `umbrella`, `bright-clothes`)은 3D로 만들지 않고 규칙 그림에만 그립니다(02 결정 A4, FR-092).
- 같은 상황·같은 `tier` 안에서 배열 순서 = 안내 순서 = 추가 규칙 순환 순서. `crossing-check` 핵심 순서는 FR-045의 다섯 단계 `A10, A11, A14-A15, A16-A17, A19-A20`.
- `poses`는 `CharacterPose`(`idle`, `walk`, `lookLeft`, `lookRight`, `raiseHand`)만 — 뛰기·점프는 타입에 없어 넣을 수 없음(FR-094). 정해진 값: `A11` = `lookLeft, lookRight, lookLeft`, `A14-A15` = `raiseHand`, `A19-A20` = `walk`(SC-032).
- `durationTicks`는 그 카드 음성 길이 이상(틱). 진행은 음성을 기다리지 않음(02 결정 B13).

### `SCENARIOS`, `TOWN`

- 각 구간: `stopZone.toS ≤ stopLineS`, `steps` 1개 이상, `violations`는 그 구간에서 실제로 판정할 것만.
- 잘못된 행동 6종 각각이 적어도 한 구간의 `violations`에 들어 있음(SC-010을 시험할 수 있게).
- `pedestrianView.segment`·`afterStep`은 실제 구간·단계를 가리킴. `introTicks ≥ 0`. 올바른 운전으로 안내가 시작되는 순간 그 구간의 보행자 신호는 초록, 차 신호는 초록이 아님(`tests/unit/scenario.test.ts` "빨간불에 건너는 장면 금지", 사용자 지적 2026-10-13).
- 신호 변화·보행자 출발은 `ActorPlan`(잠정 형식)으로 플레이어 위치·정지에 맞춰 일어나게 적음(FR-039, FR-040).
- `TOWN.props`: 규칙이 요구하는 `sceneElements`마다 같은 상황 근처(`near`)에 1개 이상. 버스·통학버스·정류장·육교/지하도·굴러가는 공·차 밑 물건은 기본 도형(외부 자료 없음, 02 결정 A4).

### `TRACK`

- `laps ∈ {1, 2}`, 체크포인트 3개 이상·`arc` 오름차순·0번 = 결승선, 출발 칸 4개는 결승선과 1번 체크포인트 사이, `aiProfiles` 3개.
- 코스 모양(중심선·폭·체크포인트)이나 바퀴 수를 바꾸면 `revision`을 1 올림 → 이전 최고 기록과 비교하지 않음(FR-082, storage.md).
- `AiProfile`에 성능 한도를 올리는 필드가 없음(FR-054).

### `CREDITS`

- 차량 5·인물 3 ID마다 같은 `id`의 `Credit` 1행: `title`, `author`, `sourceUrl`(poly.pizza 모델 페이지), `license`(`CC BY 3.0` / Cool Bannana Guy만 `CC0 1.0`), `licenseUrl`, `changes`(assets.md 7장 문구), `checkedOn`이 모두 채워짐(FR-088, SC-026 8/8).
- 배경음악은 곡(`musicComposition`)과 녹음(`musicRecording`)을 따로 1행씩. 직접 만들지 않은 안내 음성·효과음·글꼴·아이콘도 행을 더함. 사용조건을 확인하지 않은 자료는 행도 파일도 넣지 않음(FR-089).
- 주소는 화면에서 누를 수 없는 글자(FR-090). 데이터에 HTML을 넣지 않음.

## 3. 코드가 부르는 음성 줄 (`VoiceLineId`)

`src/content/voice.ts`가 아래 ID의 합집합 타입 `VoiceLineId`와 `VOICE_LINES`(ID → 대본)를 내보냅니다. 파일은 `audio/voice/<id>.mp3`(없으면 무음, 화면 안내로 진행). 대본은 콘텐츠 단계에서 정하고 SC-027 기준(차가 스스로 멈춘다는 표현 금지, 손 들기는 멈춤 확인과 함께 등)으로 검토합니다.

| ID | 쓰는 곳(flow) | 근거 |
|---|---|---|
| `hint-stop`, `hint-wait`, `hint-go` | `hint` 이벤트(`cue`) — 다음 안전 행동 | FR-031 |
| `hint-closer` | `hint`(`stoppedTooFar`) — "조금 더 앞으로" | FR-034 |
| `hint-way` | `hint`(`wrongWay`) — 가야 할 방향 | FR-034 |
| `hint-steer`, `hint-accel`, `hint-brake`, `hint-reverse` | 조작 익히기 `hint` | FR-027 |
| `stop-first` | 움직이는 중 후진 전환 거절 | FR-018 |
| `route-reset` | `redirect` — 처음 자리로 다시 | FR-034, FR-035 |
| `violation-over-stop-line`, `violation-ran-red`, `violation-early-start`, `violation-entered-crosswalk-with-pedestrian`, `violation-turned-into-crossing-pedestrian`, `violation-entered-sidewalk` | `violation` → `VIOLATION_LINES[kind]` | FR-033, FR-037 |
| `lesson-done` | `lessonDone` | FR-027 |
| `scenario-done` | `scenarioCompleted` — 안전 행동 칭찬 | FR-036 |
| `race-locked` | 시작 화면에서 잠긴 레이싱을 누름 — "안전 연습을 모두 마치면 열려요". 소리 활성화(시작 버튼) 전이면 틀지 않고 그림만(FR-066 우선, 사용자 결정 2026-10-12) | FR-048, FR-066 |
| `race-unlocked` | 세 번째 완료 축하 | FR-047 |
| `race-finish` | `playerFinished` — 순위와 관계없이 완주 칭찬 | FR-063 |
| `new-best` | 새 최고 기록 | FR-063 |
| `pick-vehicle`, `pick-character`, `practice-menu` | 그 화면에 들어올 때(글을 몰라도 진행, 소리 활성화 뒤) | FR-012 |

- 줄을 더하려면 코드가 그 줄을 부르는 곳도 함께 더해야 합니다(ID만 늘리면 쓰이지 않음).
- `VIOLATION_LINES`는 `violation-<kebab>` 줄과 1:1입니다(`overStopLine` → `violation-over-stop-line`).

## 4. 콘텐츠 무결성 검사 (Vitest, `tests/unit/content.test.ts`)

데이터만 읽는 순수 검사입니다. "항상"은 코드 단계부터 `npm test`에 들어가고, "완성"은 콘텐츠 단계가 끝날 때 켭니다(그 전에는 건너뜀 표시, 켜는 시점은 tasks 단계).

| # | 검사 | 기대 | 단계 | 근거 |
|---|---|---|---|---|
| 1 | 규칙 수·ID | 38, 중복 0 | 항상 | SC-030 |
| 2 | `researchIds` 합집합 | 41, 중복 0 | 항상 | SC-030 |
| 3 | 상황별 핵심·추가 수 | `signal-wait` 4·12, `crossing-check` 5·7, `turning-car` 3·7 | 항상 | spec 규칙 배정 표, FR-091 |
| 4 | 사용자가 고른 네 행동 | `A9`, `A10`, `A11`, `A14-A15`가 `core` | 항상 | spec 규칙 배정 안내문 |
| 5 | 횡단 다섯 단계 순서 | `crossing-check` 핵심 = `A10, A11, A14-A15, A16-A17, A19-A20`(손 들기 바로 뒤 멈춤 확인) | 항상 | FR-045, FR-093, SC-027 |
| 6 | 주인공 행동 | 핵심 규칙 `poses` 합집합에 `lookLeft`, `lookRight`, `raiseHand` 모두 | 항상 | SC-032 |
| 7 | 그림 전용 규칙 | `pictureElements`가 비지 않은 규칙 = 정확히 `A2, A25, A26, B13, B14` | 항상 | FR-092, 02 결정 A4 |
| 8 | 장면 요소 배치 | 규칙의 `sceneElements`마다 `TOWN.props`에 같은 상황 `near` 배치 1개 이상 | 완성 | FR-092 |
| 9 | 카드 길이 | 모든 `durationTicks > 0`(정수), 모든 `introTicks ≥ 0` | 항상 | FR-070, B13 |
| 10 | 순환으로 모두 보임 | 각 상황을 `ceil(추가 수 / k)`번 `pickRules`(+ `advanceExtraCursor`)로 돌리면 추가 규칙이 모두 1번 이상, 매번 핵심 전부 포함. `isReplay`가 거짓이면 추가 0 | 항상 | SC-031, FR-091 |
| 11 | 차량·인물 ID | `VEHICLES` 5종·`CHARACTERS` 3종이 ID 타입 전부와 일치 | 항상 | FR-009, FR-097 |
| 12 | 모델 파일 | `models/<id>.glb` 8개가 `ASSET_URLS`에 있음 | 항상(GLB 커밋 뒤) | FR-004 |
| 13 | 좌석 | 차량 5종 모두 `seats.length ≥ 1`, `height > 0` | 항상 | FR-097, SC-032 |
| 14 | 인물 동작 | Chicken Guy는 `Armature\|Idle`·`Armature\|Walk`, 나머지 둘은 `Idle`. 해당 클립이 실제 GLB에 있음 | 항상 | 02 결정 A1, 03 리깅 기록 |
| 15 | 잘못된 행동 범위 | 6종 각각이 어떤 구간의 `violations`에 1번 이상 | 항상 | SC-010 |
| 16 | 구간 형식 | `stopZone.toS ≤ stopLineS`, `steps` 1+, `pedestrianView.segment`·`afterStep`이 유효 | 항상 | FR-032, FR-033 |
| 17 | **사고 장면 방지 거리** | 각 구간에서 보행자 경로(대기 위치 포함)의 모든 점이 그 구간 위반 경계(정지선, 횡단보도의 차 쪽 가장자리, 보도 가장자리)의 **차가 오는 쪽 반대편**에 있고, 경계까지 거리 ≥ 여유(사람 반지름 + 여유, 테스트 상수 1 m 제안). 위반은 후보 위치에서 판정해 차체가 경계를 넘지 않으므로(modules.md 4.4) 이 거리면 차와 보행자가 닿지 않음 | 항상 | FR-036 |
| 18 | 트랙 | 체크포인트 3+·`arc` 오름차순, `laps ∈ {1,2}`, 출발 칸 4개가 결승선과 1번 체크포인트 사이, `aiProfiles` 3개, 복귀 후보 간격 `width / 3 > 4 × DRIVING_SPEC.bodyRadius`, 체크포인트마다 뒤 후보(접선 반대 방향 직선 `5 × bodyRadius`)가 트랙 안(중심선까지 거리 ≤ `width / 2 − bodyRadius`)(data-model.md 7장 "복귀 자세", 빈 후보가 늘 남음) | 항상 | FR-058, FR-059, FR-061 |
| 19 | 모델 크레딧 | 8 ID마다 `Credit` 1행, 필수 필드 모두 비어 있지 않음, 라이선스가 PRD 표와 같음 | 항상 | FR-088, SC-026 |
| 20 | 운전 성능 | `DRIVING_SPEC` 값이 모두 유한한 양수, `maxReverseSpeed < maxForwardSpeed`, `stopSnapSpeed < maxReverseSpeed` | 항상 | FR-011, 02 결정 B4 |
| 21 | 규칙 그림 | `images/rules/<id>.svg` 38/38이 `ASSET_URLS`에 있음 | 완성 | SC-030, FR-070 |
| 22 | 음성 파일 | 규칙 38개와 `VoiceLineId` 전부의 `audio/voice/<id>.mp3`가 있음(음성 제작 방법 결정 B15 뒤) | 완성 | FR-067 |
| 23 | 배경음 출처 | `audio/bgm/*.mp3`가 있으면 `CREDITS`에 `musicComposition`·`musicRecording`이 각각 1행 이상 | 완성 | FR-089, SC-026 |

- `VOICE_LINES`·`VIOLATION_LINES`의 빠짐은 타입 검사(`npm run typecheck`)가 잡으므로 Vitest 항목이 없습니다.
- `ASSET_URLS`를 Vitest(node)에서 읽을 때 `import.meta.glob` + `?url`이 동작하는지는 미확인입니다. 첫 콘텐츠 검사 태스크에서 확인하고, 안 되면 12·21·22번은 `node:fs`로 파일 존재를 봅니다(그때 `@types/node` 추가 필요 여부도 함께, plan.md 의존성 원칙).
- 이 검사로 보장하지 않는 것(검토 기록으로 확인): 문구 표현(SC-027), 그림이 뜻을 전하는지(SC-030 그림 검토), 소리가 위협적이지 않은지(FR-036), 탑승객이 실제로 보이는지(SC-032 렌더링 점검).
