# Task T126 Validation Report (연습 길 표시·3단계 우회전 화살표 신호 + 이전 세션 미검토분)

# 시도 2 (최신)

## 판정: PASS
## 시도: 2/2

- 요청: 시도 1 PASS·리뷰 "APPROVE with comments" 뒤 사용자 결정 "2건 고친 뒤 커밋·배포". 고친 것 = 시도 1 참고 1(`town.ts:30` 주석)·참고 2(`tasks.md:152` 시험 개수 문구)
- revision 요청값 / 읽기 전 / 테스트 후: `ebe4defd91ba5fbfb1812447e502bafbbd953036dfebac8fe24bdfc714e32d2d` / 같음 / 같음(PROJECT_ROOT에서 `review-snapshot.py`, 두 번 모두 종료 0). 이전 revision `16458040…2ad6`
- 읽은 프로젝트 지침·기술 기준: 시도 1과 같음(`AGENTS.md` 먼저, IVI Java/Spring 기준 제외, TypeScript·three.js·Vite·npm 기준)

| 항목 | 값 |
|---|---|
| run / task / dispatch / 실제 도구 / 세션 handle | Orca 없음 — 시도 1과 같은 사용자 결정으로, 같은 Claude Code 서브에이전트 `spec-implement-validator`(Opus 5.5) 세션이 이어서 재검증 |
| FEATURE_DIR / 단계 / 검토 태스크 | `/Users/kyw/Documents/git/mine/driving_game/specs/001-kids-driving-safety-game` / implement / T126 시도 1 범위 전체. 이번에 바뀐 것은 주석 1줄·문서 1줄 |
| 검증 상태 | COMPLETE |
| 역할 판정 | PASS (FAIL 0, 사용자 질문 0) |

### 바뀐 범위 확인

- 시도 1 시작(20:44) 뒤 바뀐 파일을 저장소 전체(`node_modules`·`.git`·`dist`·시험 산출물 제외)에서 찾으면 `src/content/town.ts`, `specs/.../tasks.md`와 `_workspace` 기록 3개(구현 기록·리뷰·이 보고서)뿐. 나머지 변경 파일 14개의 수정 시각은 모두 20:26 이전 그대로
- `git diff --stat`은 시도 1과 같은 16 files, 232 insertions, 53 deletions(줄 안에서만 고침)
- `town.ts`: diff를 시도 1 때 본 것과 비교하면 30행 주석의 "신호등 위 화살표 판" → "신호등 아래 화살표 판"만 다름. 코드 줄은 같음. 이제 그리기(`townView.ts:56-61`, y −0.55)·data-model 234행·modules.md 395행과 맞음
- `tasks.md`: 바뀐 덩어리는 시도 1과 같은 네 곳(152행 추가, 292행, 322~326행). 152행을 시도 1 때 문구와 글자 단위로 비교하면 다른 곳은 "3건 추가(화살표 신호 2건, 모퉁이 앞 정지선 1건)" → "2건 추가(화살표 신호 2건)·1건 바꿈(예전 "돌기 전~횡단보도 앞 정지 인정" → 모퉁이 앞 정지선)"뿐. 292행·322~326행 내용은 시도 1과 같음

### 새 문구와 실제 시험 대조(`tests/unit/scenario.test.ts`)

| 문구 | 실제 시험 | 맞음 |
|---|---|---|
| 2건 추가(화살표 신호 2건) | `:333` 다가가면 화살표 빨강·보행자 초록 …, `:345` 보행자가 다 건넜어도 화살표 빨강에 돌아 나가면 `earlyStart` | 예 |
| 1건 바꿈(예전 "돌기 전~횡단보도 앞 정지 인정" → 모퉁이 앞 정지선) | 기준 커밋 `2cdd0bc`의 `:297` "turning-car: 회전하기 전(교차로 앞)에 멈춰도 정지로 인정하고 완료"가 지금 `:305` "빨간 화살표면 모퉁이 앞 정지선에서 멈춰야 함"으로 바뀜 | 예 |
| 3건 고침(직진 방향 안내 2건은 초록 화살표 뒤부터, SC-010은 회전 구간 정지선 기준) | `:219` wrongWay, `:315` 곧장 가도 방향 안내(둘 다 `turnGo()`에서 시작), `:271` SC-010(정지선 앞 확인 추가) | 예 |
| 개수 | `it` 23 → 25 = 23 − 1(바꾼 것의 옛것) + 1(새것) + 2(추가) | 예 |

### 실행한 테스트(시도 2)

| 명령 | 종료 코드 | 결과 |
|---|---|---|
| `npm run typecheck` | 0 | 오류 없음 |
| `npm test` | 0 | 16 files, 165 passed |

- `npm run build`·`npm run test:e2e`는 다시 돌리지 않음: 코드 변경이 주석 한 줄뿐이라 동작·번들 내용이 바뀌지 않고, 나머지는 문서 한 줄. 결과는 시도 1(build 성공, E2E 51 passed 1 skipped, 모두 종료 0) 그대로
- 4173 포트에 남은 서버 없음

### 이전 지적 처리 결과

| 시도 1 참고 | 처리 |
|---|---|
| 1 `town.ts:30` 주석 위/아래 | 해결 |
| 2 tasks.md 시험 개수 문구 | 해결(위 대조 표) |
| 3 "회전 전용 신호는 `SignalDef.arrow`" 시험 없음 | 그대로(그리기 전용, 차단 아님) |
| 4 FR-034에 "초록 화살표 뒤" 구절 | 그대로(다음에 spec을 손볼 때) |
| 5 교육 장면 변화 정보 | 그대로(어린이 관찰 T121 때 함께 보기) |

새로 발견한 것 없음.

# 시도 1

## 판정: PASS
## 시도: 1/2

- 프로젝트 지침: 역할 파일보다 먼저 `AGENTS.md`를 읽고 적용함. IVI 전용 기준(Java/Spring Boot·JPA·Lombok·Maven·REST Controller)은 이 프로젝트 기준이 아니므로 판정에 쓰지 않음. 기술 기준은 실제 설정(`package.json`: TypeScript·three.js·Vite·Vitest·Playwright)과 승인된 spec/plan/data-model/contracts. "API 계약"은 `contracts/modules.md`의 모듈 함수·`contracts/content-data.md`의 콘텐츠 데이터 조건으로, "데이터 모델"은 `data-model.md`의 게임 데이터(SegmentDef·ActorPlan·ViolationKind·TownDef)로 바꿔 읽음
- 테스트 명령(`package.json` scripts): `npm run typecheck`, `npm test`(vitest run), `npm run build`, `npm run test:e2e`(playwright test 전체)
- constitution: `.specify/memory/constitution.md`는 손대지 않은 템플릿이고 사용자 결정(2026-10-12)이 "constitution 없음"이라 원칙 없음으로 보고 판정에 쓰지 않음
- revision 요청값 / 읽기 전 / 테스트 후: `16458040cad93d905097275ec6916a5878535ff02a3f20525adf033274b52ad6` / 같음 / 같음 (PROJECT_ROOT에서 `review-snapshot.py`, 두 번 모두 종료 0). 테스트 뒤 `git status --short` 18줄로 읽기 전과 같음
- 읽은 것: `AGENTS.md`, 역할 파일 `ivi-agent-guide/claude-config/agents/spec-implement-validator.md`, `ivi-agent-guide/orca-cross-review.md`, `docs/PRD.md`, `GLOSSARY.md`, `_workspace/implement/logs/task-T126_impl.md`, `00_context.md` 승인 기록(57·58·66·72·73행), `spec.md` 문서 변경 전체(Clarifications 51~57, FR-024, FR-046)와 FR-033·034·036·039·040·042·043, US2-6·7, `data-model.md` 150~215·231~234·650~656·1009, `contracts/modules.md` 204~214·389~396, `contracts/content-data.md` 36~52, `contracts/assets.md`·`events.md`의 관련 줄, `tasks.md` 152·292·322~326, `records/play-check.md` 114~132와 사진 `records/img/t126-practice-marks.png`, 코드 diff 전체(16개 파일)와 `src/practice/scenario.ts`·`src/practice/townActors.ts` 전체, `src/render/townView.ts`의 정지선·`along`·`drawSignals`, `tests/unit/scenario.test.ts` 도우미와 관련 시험, `tests/unit/content.test.ts` #15·#16·#17·신호 계획 시험

| 항목 | 값 |
|---|---|
| run / task / dispatch / 실제 도구 / 세션 handle | Orca 없음 — 사용자 결정(Codex 사용 한도 해제 2026-10-19 전까지 검증·리뷰는 Claude 서브에이전트)에 따라 Claude Code 서브에이전트 `spec-implement-validator`(Opus 5.5) 한 세션 |
| FEATURE_DIR / 단계 / 검토 태스크 | `/Users/kyw/Documents/git/mine/driving_game/specs/001-kids-driving-safety-game` / implement / T126(기준 커밋 `2cdd0bc` 뒤 커밋하지 않은 변경 전체, 이전 세션 몫 town·townView·trackView·cue-go.svg·townActors 주석·화살표 시험 포함) |
| 원문 및 코드 근거 | 아래 판정 표의 파일:줄 |
| 실행한 테스트 | 아래 표 |
| 검증 상태 | COMPLETE |
| 역할 판정 | PASS (FAIL 0, 사용자 질문 0, 차단 아닌 참고 5건) |
| 미해결 질문·이전 지적 | 없음(첫 검증) |

```
[Speckit-Context] implement phase
  ├ constitution: 템플릿 그대로, 사용자 결정으로 원칙 없음(판정에 쓰지 않음)
  ├ spec: 3~8세 운전·보행 안전 게임. FR-024 연습 길 표시(노란 칸·정지선·회전 화살표·도착 깃발 문), FR-046 우회전 화살표 신호(빨간 화살표면 모퉁이 앞 정지선에서 멈춤, 보행자가 다 건너 초록 화살표가 된 뒤 회전), FR-033 보행자 관련 설명 우선, Clarifications 2026-10-13 네 문답
  ├ plan: TypeScript + three.js + Vite, 판정은 순수 함수(practice/scenario.ts), 그리기는 render/, 콘텐츠는 content/ 데이터
  └ tasks: T126 = town.ts turn-vehicle 신호·scenarios.ts turning-car(정지선 40·정지 구역 32~40·단계 4개·ranRed·afterStep 0)·scenario.ts 판정 한 줄·townView/trackView 길 표시·cue-go.svg 깃발, 시험 content 1건·scenario 추가/고침, play-check 기록
```

### 실행한 테스트

| 명령 | 종료 코드 | 결과 |
|---|---|---|
| `npm run typecheck` | 0 | 오류 없음 |
| `npm test` | 0 | 16 files, 165 passed |
| `npm run build` | 0 | 성공(500 kB 청크 경고는 기존과 같음) |
| `npm run test:e2e` | 0 | 51 passed, 1 skipped(`orientation.spec.ts:51` WebKit 전체화면 API 없음, 의도된 건너뜀) |

- E2E 뒤 4173 포트에 남은 서버 없음. 5173 포트의 `vite`(PID 6586)는 17:30에 이미 떠 있던 개발 서버로 이번 검증과 무관해 그대로 둠
- 변이 시험·대량 무작위 주행은 하지 않음(사용자 결정 "가벼운 검증", 의심 지점 없음). 판정 한 줄이 시험에 묶여 있는지는 코드로 확인: `scenario.ts:163`을 빼면 같은 틱 `found`에 `earlyStart`만 남아 SC-010 시험(`scenario.test.ts:271`)의 기대값 `turnedIntoCrossingPedestrian`과 달라짐

### 판정 표

| 확인 대상 | 판정 | 근거 |
|---|---|---|
| **데이터: `turn-vehicle` 신호** (data-model TownDef `signals.arrow`, content-data "아이 차를 마주 보는 차량 신호") | PASS | `town.ts:29` `SignalId`에 `turn-vehicle`, `:31` `arrow?: 'right'`, `:92` `(115, 41)`·heading π·`arrow: 'right'`. 위치는 `turn-sidewalk-right`(x 112~116, z −10~42, `town.ts:76`) 안 = 회전 전 오른쪽 보도, 정지선(z 40) 바로 뒤. heading π = 다가오는 아이 차 쪽. 시험 `content.test.ts:183`(세 연습 모두 vehicle 신호, 출발 방향의 반대를 봄) 통과 |
| **데이터: turning-car 구간** (FR-046, Clarifications 54·55, data-model Open Issues 1, tasks T126) | PASS | `scenarios.ts:176-177` 정지선 40·정지 구역 32~40(첫 직선 길이 47 = 모퉁이 앞, `scenario.test.ts:305`가 `stopLineS ≤ 첫 선분 길이` 확인), `:178-183` stop → wait(pedestriansClear) → wait(vehicleGreen) → go, `:184` violations에 `ranRed` 추가, `:185` `signal: 'turn-vehicle'`, `:188-189` `redAtS` 12·`greenAfterStoppedTicks` 600, `:206` `afterStep: 0`. 쓰이지 않게 된 `TURN_STOP_LINE` 삭제. 기존 시험 "신호·보행자 계획이 townActors의 전제를 지킴"(`content.test.ts`, 노랑 지점이 정지선에서 최고 속도 제동 거리 4.2 m 이상 앞: 40 − 12 = 28 m, 깜빡임 전 출발)이 이제 turning-car에도 적용되어 통과. #16(`stopZone.toS ≤ stopLineS`, `afterStep` 범위)·#15(6종 모두 쓰임)·#17(보행자 경로가 정지선·횡단보도 너머) 통과 |
| **판정: 건너는 사람이 있을 때 정지선 넘기 → `turnedIntoCrossingPedestrian`** (Clarifications 56, data-model ViolationKind 표 200행, FR-033 보행자 설명 우선) | PASS | `scenario.ts:155` `crossing`, `:161-163` `go` 전 단계에서 정지선을 넘으려 하고 건너는 사람이 있으면 추가. `:66-73` 우선순위 첫째 → 같은 틱의 `earlyStart`보다 먼저. 구간 `violations`로 거르므로(`:170`) 이 종류가 없는 signal-wait·crossing-check 판정은 그대로. 시험: SC-010(`scenario.test.ts:271-288`) turning-car → `turnedIntoCrossingPedestrian`, 차 모서리가 정지선 앞(`:284`) |
| **판정: 빨간 화살표 정지선** (Clarifications 55, data-model `ranRed` 행) | PASS | 멈추지 않고 정지선을 넘으면 `ranRed`(`scenario.ts:166`, 화살표 노랑·빨강 ∧ `!stoppedOnce`). 시험 `scenario.test.ts:305-313`(돌아 들어가 58에서 서려 하면 `ranRed`, 차는 정지선 앞) |
| **신호 순서: 다가가면 빨간 화살표·보행자 초록, 보행자가 다 건너면 초록 화살표·보행자 빨강** (Clarifications 54, FR-046, data-model 4.12 653·654행) | PASS | `townActors.ts:84-96`: 보행자 신호는 차 신호가 빨강일 때만 초록(`:85`), 차 신호는 보행자 신호 빨강 ∧ 건너는 사람 없음일 때만 초록(`:94`, 같은 틱의 `nextWalk`를 봄). 시험 `scenario.test.ts:333-343`(멈춘 첫 틱 red/green, 초록 화살표가 되는 틱에 보행자 모두 crossed·보행자 빨강, 초록 전에는 go 단계 없음), `:345-353`(보행자가 다 건넜어도 화살표 빨강에 돌아 나가면 `earlyStart`) |
| **안전 교육: 건너는 보행자 ⇔ 보행자 신호 초록** | PASS | 보행자는 보행자 신호가 초록일 때만 출발(`townActors.ts:112-113` `lightOk`), 건너는 중에는 깜빡임이 되어도 계속 걷고(FR-043) 보행자 신호는 건너는 사람이 없어야 빨강(`:87`). 그래서 빨강에 건너기 시작하는 보행자가 없음. turning-car는 `stoppedTicks > 0`(정지 구역에서 멈춘 뒤)에만 출발하고 그때는 화살표 빨강·보행자 초록 |
| **안전 교육: 화살표 초록과 보행자 초록이 동시에 켜지지 않음** | PASS | 위 두 조건이 서로를 막음. 화살표가 초록이 된 뒤에는 `stoppedTicks`가 줄지 않아 다시 노랑·빨강이 되지 않고(`:92` `stoppedTicks < goAt`), 보행자 신호는 차 빨강일 때만 초록이 되므로 그 시도 안에서 둘이 겹치지 않음. 시험 `scenario.test.ts:338-340` |
| **안전 교육: "빨간불에 건너는 장면 금지" 세 연습 모두** (content-data 47행, 사용자 지적 2026-10-13) | PASS | `scenario.test.ts:376-385` 통과. turning-car가 이제 차 신호를 가지므로 "차 신호가 초록이 아님" 확인이 실제로 작동함(안내 시작 = 멈춘 직후, 화살표 빨강·보행자 초록) |
| **방향 안내는 초록 화살표 뒤** (FR-034, data-model Open Issues 1) | PASS | 시험 `scenario.test.ts:219-225`, `:315-325`가 `turnGo()`(`:101-104`, 올바르게 기다려 go 단계)에서 시작. 빨간 화살표에 정지선을 넘는 것은 잘못된 행동이라는 점은 data-model Open Issues 1에 적혀 있음(참고 4) |
| **그리기: 노란 칸·정지선·회전 화살표·도착 문·화살표 판** (FR-024, modules.md 395행) | PASS | 정지선은 기존 코드(`townView.ts` 정지선 반복문, 구간마다 `stopLineS`). 노란 칸 `:145` `stopZone.fromS − bodyLength` ~ `toS`(= 계약 문구), 회전 화살표 `:146-153`(`turnSide` `:197`, 45° 넘게 꺾이는 구간만 → turning-car만, 오른쪽), 도착 문 `:155-158` 상황마다 마지막 구간 경로 끝·폭 4 m, `go` 완료 지점(`scenario.ts:178` 경로 끝)과 같음. 화살표 판 `:59-66`·`:89` 신호등 머리 아래(y −0.55). `trackView.ts:100` `finishGate(p, t, width)` export, 트랙은 `:91`에서 같은 함수 사용(폭만 인자로, 동작 같음). 모두 콘텐츠 데이터에서 그리고 판정에 쓰지 않음. 사진 `t126-practice-marks.png`에서 세 연습 노란 칸·도착 문, 3단계 우회전 길 화살표·파란 화살표 판 확인 |
| **그림: `cue-go.svg`** (FR-027 다음 행동 그림, 글자 없는 그림 결정) | PASS | 초록 신호등 + 위 화살표 + 체크무늬 깃발, `<text>` 없음. `hud.ts:41`의 연습 `hint` 그림으로만 쓰이고 레이싱 출발 표시는 별도(`flow.ts:300` `showGo`). `contracts/assets.md:104` 이름 규칙 그대로 |
| **주석: `townActors.ts:32`, data-model 187행** | PASS | "차 신호가 없는 구간은 초록 고정(지금 세 연습은 모두 차 신호가 있음)" — 코드 `:33`과 같음 |
| **문서끼리 맞음** (spec ↔ data-model ↔ modules ↔ content-data ↔ tasks) | PASS | 정지선 40·정지 구역 32~40·단계·신호 짝·판정 확장이 다섯 문서에서 같은 내용. 예전 결정("돌기 전~횡단보도 앞 인정", "turning-car 신호 없음·보행자 초록 고정")이 남은 곳을 spec·plan·data-model·contracts·quickstart에서 찾았으나 바뀐 이력 설명 말고는 없음. tasks.md T119 한 줄(292행)과 같은 파일 순서(322~326행)에 T126이 들어감 |
| **기록** (tasks T126 "기록: play-check.md 2026-10-13 절") | PASS | `records/play-check.md` 114~132행, 사진 있음. 보도 진입 발견은 사용자 결정("지금은 그대로, 기록만")대로 T119에 한 줄 — FAIL 사유 아님 |

### FAIL 항목

없음.

### 사용자에게 드릴 질문

없음(차단하는 질문 0).

### 참고(차단 아님)

1. **코드 주석 한 곳이 문서·코드와 반대**: `src/content/town.ts:30` 주석은 "신호등 **위** 화살표 판"인데, 실제 그리기(`townView.ts:56-61`, y −0.55)와 data-model 234행·modules.md 395행은 "신호등 **아래**". 동작에는 영향 없음. 다음에 이 파일을 만질 때 "아래"로 맞추기를 권함(리뷰어 영역과 겹치면 그쪽 판단에 맡김).
2. **tasks.md T126·구현 기록의 시험 개수 설명**: "3건 추가·3건 고침"이라 적혀 있으나 실제로는 예전 시험 "turning-car: 회전하기 전(교차로 앞)에 멈춰도 정지로 인정하고 완료"(2026-10-12 결정 기반)를 새 "모퉁이 앞 정지선" 시험으로 바꾼 것이라 `scenario.test.ts`의 `it` 수는 23 → 25(+2). 예전 결정이 2026-10-13 결정으로 바뀌었으니 바꾼 것 자체는 맞음. 설명에 "예전 '돌기 전~횡단보도 앞 인정' 시험을 바꿈"을 밝혀 두면 나중에 읽는 사람이 덜 헷갈림.
3. **content-data.md 새 조건의 "회전 전용 신호는 `SignalDef.arrow`"는 시험으로 묶이지 않음**: `content.test.ts:183`은 신호 종류와 바라보는 방향만 확인. 화살표 판은 그리기에만 쓰여 판정 영향이 없으므로 차단하지 않음.
4. **FR-034 문구 범위**: spec FR-034는 "회전 대신 직진은 실패가 아님"이라고만 적혀 있고, 빨간 화살표일 때 모퉁이 앞 정지선을 넘으면(직진이든 회전이든) 잘못된 행동이 된다는 점은 data-model Open Issues 1(1009행)과 Clarifications 55행(모퉁이 앞 정지선에서 멈춤)에서 나옴. 정지선이 모퉁이 앞이라 그 자리에서는 갈 방향을 알 수 없으므로 두 결정이 부딪히지 않는다고 판단함. 나중에 spec을 손볼 때 FR-034에 "초록 화살표 뒤" 한 구절을 더하면 더 분명해짐.
5. **교육 장면의 변화(정보)**: data-model 4.12에서 "회전 차량은 보행자 초록에도 횡단보도를 지날 수 있다는 점이 학습 대상" 문장이 빠지고 화살표·보행자 신호 짝으로 바뀌어, 연습 장면에서는 보행자 초록일 때 도는 차가 움직이는 모습이 더는 나오지 않음. 핵심 규칙 "초록불이어도 도는 차가 오는지 먼저 보고 멈췄는지 확인"은 보행자 시점 안내 카드로 그대로 전달되고, 사용자가 "우회전 화살표 신호등(보행자 신호와 짝)"을 직접 골랐으므로 판정 대상 아님. 어린이 관찰(T121) 때 이 규칙이 잘 전달되는지 함께 보면 좋음.
