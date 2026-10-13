# Task T126 Implementation Log (연습 길 표시·3단계 우회전 화살표 신호)

- 작성: 2026-10-13, 구현자 = 조율자 Claude Code(Opus 5.5) 세션 두 번(handoff 7 → 8에 걸쳐)
- 범위: tasks.md T126(152행). 사용자 지적·결정 원문은 `00_context.md` 승인 기록 마지막 두 줄("2026-10-13 사용자 지적(배포판 세 연습)", "2026-10-13 사용자 결정(위 지적 이어서, 새 세션)")
- 기준 커밋: `2cdd0bc`(공개 배포판, 이 변경 전). 이 변경은 아직 커밋 안 함
- 검증 방식: 사용자 결정(검증 방식 재조정·B5 이후) — validator 1번 + reviewer 1번, 스펙 대조 + 테스트 실행. Codex 한도 해제(2026-10-19) 전이라 Claude 서브에이전트

## 변경 파일

| 구분 | 파일 | 내용 |
|---|---|---|
| 데이터 | `src/content/town.ts` | `SignalId`에 `turn-vehicle`, `SignalDef.arrow?: 'right'`, 신호 `turn-vehicle`(x 115, z 41, heading π — 다가오는 아이 차 쪽) |
| 데이터 | `src/content/scenarios.ts` | turning-car: `signal: 'turn-vehicle'`, 단계 stop → wait(pedestriansClear) → wait(vehicleGreen) → go, violations에 `ranRed`, `stopLineS` 40·`stopZone` 32~40(모퉁이 앞), plan `redAtS` 12·`greenAfterStoppedTicks` 600, 보행자 시점 안내 `afterStep` 0. 쓰이지 않게 된 `TURN_STOP_LINE` 삭제 |
| 판정 | `src/practice/scenario.ts` | `judge`: 정지선 넘기 후보 틱에 건너는 보행자가 있으면 `turnedIntoCrossingPedestrian` 추가(회전 구간은 정지선이 횡단보도보다 앞이라) |
| 주석 | `src/practice/townActors.ts` | 차 신호 없는 구간 주석만 고침(지금 세 연습은 모두 차 신호 있음) |
| 그리기 | `src/render/townView.ts` | 멈출 곳 노란 칸(`paintAlong`, `stopZone.fromS − bodyLength` ~ `toS`), 회전 길 화살표(`turnSide`·`turnArrow`, 노란 칸 9 m 앞), 세 연습 경로 끝 도착 문(`finishGate`, 폭 4 m), 회전 신호 아래 파란 화살표 판(`arrowPlate`), `signalView`가 `SignalDef`를 받음 |
| 그리기 | `src/render/trackView.ts` | 결승선 그리기를 `finishGate(p, t, width)`로 꺼내 export(트랙·연습 공용), 동작 같음 |
| 그림 | `src/assets/images/ui/cue-go.svg` | 초록 신호등 + 위 화살표 + 체크무늬 깃발("깃발까지 가요") |
| 테스트 | `tests/unit/content.test.ts` | 1건 추가: 세 연습 모두 아이 차를 마주 보는 차량 신호 |
| 테스트 | `tests/unit/scenario.test.ts` | `turnGo()` 도우미, 2건 추가(화살표 신호 — 빨강→보행자 다 건넌 뒤 초록 / 빨간 화살표에 돌아 나가면 earlyStart), 1건 바꿈(예전 "돌기 전~횡단보도 앞 정지 인정" → 모퉁이 앞 정지선: 돌아 들어가면 ranRed·차는 정지선 앞), 3건 고침(직진 방향 안내 2건은 초록 화살표 뒤부터, SC-010에 "정지선 앞에서 멈춤" 확인) |
| 문서 | `spec.md` 51~57행(Clarifications Session 2026-10-13 implement), 343행(FR-024), 371행(FR-046) | 우회전 화살표 신호·멈출 곳·길 표시·도착 문, 모퉁이 앞 정지, 건너는 사람 쪽으로 돌기 |
| 문서 | `data-model.md` 187·200·234·653·1009행 | ActorPlan `pedestrianSignal` 주석(187), ViolationKind `turnedIntoCrossingPedestrian`(200), TownDef `signals.arrow`(234), 4.12 화살표 초록·보행자 초록 동시 금지(653), Open Issues 1 turning-car(1009) |
| 문서 | `contracts/modules.md` 395행, `contracts/content-data.md` 48행 | `renderTown` 연습 길 표시·`finishGate` / turning-car 신호 조건 한 줄 |
| 문서 | `tasks.md` 152행(T126), 292행(T119 한 줄), 322~326행(같은 파일 순서) | |
| 기록 | `records/play-check.md` 114~132행, `records/img/t126-practice-marks.png` | 세 연습 끝까지 주행·촬영 결과, 보도 진입 발견 |

## 사용자 결정으로 미룬 것 (FAIL 사유 아님)

- 3단계에서 돌아 나간 뒤 방향이 1~2° 더 꺾이면 남쪽 보도에 닿아 `enteredSidewalk`(저장소 밖 자동 운전 5번 중 3번). 판정은 문서대로 맞음. 사용자 결정 "지금은 그대로, 기록만" → T119에 한 줄

## 함께 검토받는 것

- handoff 7 세션 몫(town/townView/trackView/cue-go.svg/townActors 주석/content.test·scenario.test 화살표 시험)은 아직 아무 검토도 받지 않아 이번에 함께 검토

## 테스트 (마지막 실행: 이전 세션, 이 작업 트리 그대로)

| 명령 | 종료 코드 | 결과 |
|---|---|---|
| `npm run typecheck` | 0 | 오류 0 |
| `npm test` | 0 | 165 passed |
| `npm run build` | 0 | 빌드 성공 |
| `npm run test:e2e` | 0 | 51 passed, 1 skipped |

- 시험 먼저: 모퉁이 앞 정지선 시험·SC-010 추가 확인이 RED인 것을 확인한 뒤 구현
- 저장소 밖 복사본 주행·촬영으로 세 연습 모두 끝까지 완료, 오류 0(사진 = `records/img/t126-practice-marks.png`)

## attempt 2 (validator PASS·reviewer APPROVE with comments 뒤, 사용자 결정 "2건 고친 뒤 커밋·배포")

| 파일 | 바뀐 것 | 근거 |
|---|---|---|
| `src/content/town.ts:30` | 주석 "신호등 위 화살표 판" → "신호등 아래 화살표 판"(동작 영향 없음) | reviewer "지금 확인 권장" 1, validator 참고 1 |
| `tasks.md` 152행 | scenario.test 개수 문구 "3건 추가·3건 고침" → "2건 추가·1건 바꿈·3건 고침"(실제 it 수 +2) | reviewer "이후" 4, validator 참고 2 |

- 이 구현 기록의 같은 문구도 맞춤(`_workspace`라 revision 밖)
