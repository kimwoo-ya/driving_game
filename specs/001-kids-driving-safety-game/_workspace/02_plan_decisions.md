# 02 Plan Decisions — 리더 통합 결정 (2026-10-12)

`01_architect_architecture.md`와 `01_data-modeler_schema.md`를 읽고 리더가 맞춘 결정입니다. 최종 산출물(plan.md, research.md, data-model.md, contracts/, quickstart.md)은 **이 파일이 두 보고서보다 우선**합니다.

**후속 사용자 요청 반영(2026-10-12)**: Blender·Blender Lab 공식 MCP 설치, Cool Bannana Guy·Turtle 리깅 추가와 GLB 저장을 완료했습니다. 두 수정본은 각각 뼈대 16개와 동작 5개를 갖고, Chicken Guy의 기존 GLB는 보존했습니다. 원본의 정적 메시라는 전제, 캐릭터 geometry 합치기·일반 `clone()` 사용, 세 캐릭터 원본을 다시 내려받는 절차는 [03 캐릭터 리깅 기록](03_character-rigging.md)과 갱신된 에셋 계약으로 대체합니다. 캐릭터 3종 모두 `SkeletonUtils.clone`을 쓰며, 두 새 수정본의 콘텐츠 `clips`는 `{ idle: 'Idle' }`입니다. 보행자·교육 주인공을 Chicken Guy로 고정한 기존 역할 결정은 유지합니다.

## A. 사용자 결정 (2026-10-12, plan 단계) — spec·PRD·용어집에 이미 반영됨

1. **보행자 = Chicken Guy 고정**: 교육용 마을의 등장 보행자와 보행자 시점 안내의 주인공은 모두 Chicken Guy. 손 들기·왼쪽/오른쪽 보기는 `Hand.L`/`Hand.R`/`Head` 관절을 코드로 자세 조정해 실제로 보여 줌. 걷기·서 있기는 들어 있는 `Armature|Walk`, `Armature|Idle` 클립. 뛰기·점프(`Sprint`, `Jump`)는 쓰지 않음(FR-094). (FR-096, US2-19, SC-032)
2. **인물 선택 = 내 차에 태울 탑승객**: 차량 선택 뒤 3종(Chicken Guy, Cool Bannana Guy, Turtle) 중 하나를 고르고, 고른 인물이 안전 연습·레이싱 내내 아이 차에 타 있음. 저장 안 함. 다른 차(컴퓨터 차량, 주차된 차 등)의 탑승객은 콘텐츠 설계. 탑승객은 판정·카메라·성능에 영향 없음. (FR-097, FR-011, US1-12·13, SC-032 = 인물 3 × 차량 5 = 15조합 + 주인공 행동 3/3)
   - 따라서 **차량 5종 모두 아이 차 탑승객이 뒤에서 내려다보는 카메라에서 보이는 좌석 위치가 1개 이상 필요**(`seats`). 지붕 있는 차량(왜건·트럭 운전석)에서 안 보이면 장난감 같은 표현(예: 열린 칸·지붕 위 좌석)으로 콘텐츠 설계에서 조정 → 모델 렌더링 점검 항목.
3. **"다시 하는 연습"** = 이번 실행에서 그 연습을 이미 완료 ∨ 튜토리얼 전체 완료 기록 있음. 완료 기록이 있으면 새 방문의 첫 연습부터 추가 규칙 포함. (FR-091, data-modeler `isReplay`)
4. **장면 요소**: 굴러가는 공, 차 밑 물건은 마을 장면 요소(기본 도형). 건너편·친구·어른 인물, 우산·밝은 옷(A2, A25, A26, B13, B14)은 보행자 시점 안내의 규칙 그림으로만. 버스·통학버스·정류장·육교/지하도 등도 기본 도형으로 직접 만듦(외부 자료 추가 없음). (FR-092)
5. **배포 직후 이전 파일 404** = 다시 시도가 페이지를 새로 엶(저장 유지). 그 밖의 네트워크 실패는 FR-004대로 페이지 유지. (FR-004, Edge "새 버전 배포 직후")
6. **모델**: poly.pizza GLB 8개 사용, ZIP 원본 보존. (PRD 반영)

## B. 리더 결정 (기술·해석, 사용자에게 기본값으로 보고)

| # | 항목 | 결정 |
|---|---|---|
| B1 | 버전 | three 0.186.1, @types/three 0.186.0, typescript 7.0.2(막히면 6.0.3), vite 8.3.1(2026-10-20 이후 8.3.3 이상으로 올리기 전 `--host` 금지), vitest 5.0.2, @playwright/test 1.63.0, Node 24 |
| B2 | 바퀴 회전 | 첫 버전 없음(5종 동일) |
| B3 | 최고 기록 단위 | 1/100초 정수 `timeCs`, 표시 `m:ss.cc`(data-modeler안). 틱(1/60초)에서 완주 순간 1회 변환 |
| B4 | 정지 판정 | 자연 감속으로 선 것도 정지. `speed === 0` |
| B5 | 바퀴 수 | 2바퀴 잠정(트랙 플레이 점검에서 확정) |
| B6 | SC-002 허용 오차 | 자동 테스트 완전 일치, 실제 기기 ±0.05초·±0.1 m |
| B7 | 한 프레임 최대 틱 | 8틱. 7.5 fps 미만 기기에서는 게임 시간이 느려짐 → SC-012는 지원 기기(초기 기기 점검 선정) 기준으로 확인한다고 plan에 명시 |
| B8 | 처음 이용 흐름 | 저장된 완료 기록이 없고 이번 실행에서 처음 시작할 때만 세 연습을 순서대로 이어 감. 그 밖에는 연습 목록 |
| B9 | 손상된 저장 값 | 조용히 항목별 기본값(안내 없음). 저장소 API 예외(읽기·쓰기 실패)에만 저장 불가 안내 1회 |
| B10 | 구간 재시도와 보행자 시점 안내 | 같은 시도 안에서 이미 끝낸 안내는 구간 재시도 뒤 다시 보여 주지 않음 |
| B11 | 가로 180° 뒤집기 | 입력 해제, 일시정지 안 함 |
| B12 | 잘못된 행동 종류 | FR-033과 SC-010의 합집합 6종(아래 이름) |
| B13 | 보행자 시점 안내 진행 | 카드 길이(틱)로 자동 진행, 음성 완료를 기다리지 않음 |
| B14 | 게임 안 시간 | 모두 틱. 상수 이름은 `*_TICKS`(밀리초 상수 쓰지 않음, UI 꾸밈 애니메이션 제외) |
| B15 | 콘텐츠 단계에서 사용자 결정 | 안내 음성 제작 방법(직접 녹음 / 미리 만든 TTS 파일, 실행 중 speechSynthesis 비권장), 규칙 그림 38장·UI 그림 제작 방법, 배경음악 곡·녹음 선정 → plan에는 "콘텐츠 단계 결정"으로 기록 |
| B16 | 저장소 사실 | `.gitignore`에 `modeling/` 있음 → ZIP은 GitHub에 안 올라감(배포 영향 없음, 사용자에게 알림) |

## C. 이름 통일표 (최종 산출물은 이 이름만 사용)

| 개념 | 최종 이름 | 버린 이름 |
|---|---|---|
| ID 형식 | 모두 kebab-case 문자열 | camelCase ID |
| 차량 종류 | `VehicleKind`, `VehicleKindId = 'buggy' \| 'jeep' \| 'truck' \| 'wagon' \| 'banana-car'`, 상수 `VEHICLES` | `VehicleId` |
| 인물 종류 | `CharacterKind`, `CharacterKindId = 'chicken-guy' \| 'cool-banana-guy' \| 'turtle'`, 상수 `CHARACTERS` | `PersonId`, `PEOPLE`, people |
| 좌석 | `VehicleKind.seats: SeatDef[]` | `passengerSeats` |
| 안전 상황 | `ScenarioDef`, `ScenarioId = 'signal-wait' \| 'crossing-check' \| 'turning-car'`, 상수 `SCENARIOS`, 시도 상태 `ScenarioAttempt` | `PracticeDef`, `PracticeId`, `PracticeAttempt`, `PRACTICES` |
| 연습 구간·행동 | `SegmentDef`, `SafetyActionStep` | |
| 규칙 | `SafetyRule`, `RuleId`(조사 ID, 묶음은 `A14-A15`), 상수 `SAFETY_RULES` | `RULES` |
| 장면 요소 | `SceneElementId`, `ScenePropPlacement` | |
| 운전 성능 | `DrivingSpec`, 상수 `DRIVING_SPEC` | `DRIVE_SPEC` |
| 주행 | `DriveInput`, `DriveState`, `Gear = 'forward' \| 'reverse'` | `VehicleState` |
| 실행·플레이 | `RunState`, `PlaySession`, `ScreenState` | |
| 보행자 시점 안내 | `PedestrianViewDef`, `PedestrianViewState` | |
| 신호·보행자 | `SignalDef`, `SignalState`, `TownPedestrian`, `CharacterPose = 'idle' \| 'walk' \| 'lookLeft' \| 'lookRight' \| 'raiseHand'`(뛰기 없음) | |
| 레이싱 | `TrackDef`, `Checkpoint`, `AiProfile`, `RaceState`, `RaceCar`, `FinishResult`, 상수 `TRACK` | `Progress` 타입 대신 `RaceCar` 필드 + `progressValue()` |
| 잘못된 행동 | `ViolationKind = 'overStopLine' \| 'ranRed' \| 'earlyStart' \| 'enteredCrosswalkWithPedestrian' \| 'turnedIntoCrossingPedestrian' \| 'enteredSidewalk'`, 경로 문제 `RouteIssue` | `FailureKind` |
| 저장 | `SaveDataV1`, `BestRecord`(`timeCs`, `trackConfigKey`), `SoundSettings`, 키 `driving_game:save` | `SaveData` |
| 크레딧·음성 | `Credit`, `CreditId`, 상수 `CREDITS`; `VoiceLine`, 상수 `VOICE_LINES` | |
| 에셋 | `AssetId` | |
| 화면 상태 | `boot`, `unsupported`, `loading`, `loadFailed`, `start`, `credits`, `pickVehicle`, `pickCharacter`, `drivingLesson`, `practiceMenu`, `practice`, `race`, `raceResult`, `fatal`; 겹침 `paused`, `rotate`, `storageNotice`, `contextLost`, `confirmExit`; 연습 내부 `driving`, `explaining`, `pedestrianView`, `done`; 경기 내부 `countdown`, `running`, `finished` | `pickPerson` |
| 함수 | `stepVehicle`, `requestGearToggle`, `pressedButtons`, `toDriveInput`, `releaseAll`, `stepDrivingLesson`, `stepScenario`, `isReplay`, `pickRules`, `stepPedestrianView`, `stepRace`, `progressValue`, `rankCars`, `trackConfigKey`, `formatRecord`, `parseSave`, `loadSave`, `commitSave`, `prepareModel`, `loadRequired`, `retryFailed` | `stepPractice`, `computeRanks`, `nextExtras`(내부 함수로만) |
| 이벤트 | 연습 `signalChanged`, `pedestrianStarted`, `hint`, `redirect`, `violation`, `segmentReset`, `demoReplay`, `pedestrianViewStart`, `scenarioCompleted` / 안내 `cardShown`, `ended` / 경기 `countdownTick`, `go`, `rankChanged`, `lapCompleted`, `respawned`, `carFinished`, `playerFinished` | |
| 상수 | `TICK_HZ = 60`, `MAX_TICKS_PER_FRAME = 8`, `EXTRAS_PER_VIEW`, `IDLE_HINT_TICKS`, `DEMO_AFTER_FAILS`, `STUCK_TICKS`, `CONTACT_SLOW_TICKS`, `COUNTDOWN_TICKS`, `MAX_RECORD_CS` | `*_MS` |

## D. 파일 구조 변경 (architect 트리 기준)

- `src/content/people.ts` → `src/content/characters.ts` (`CHARACTERS`)
- `src/render/people.ts` → `src/render/characters.ts` (Chicken Guy 클립 재생 + `Head`/`Hand.*` 관절 자세 조정, 탑승객 배치)
- `src/practice/practice.ts` → `src/practice/scenario.ts` (`stepScenario`)
- `src/content/rules.ts`는 `SAFETY_RULES`를 내보냄
- 그 밖은 architect 트리 그대로.
