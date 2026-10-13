# Task T126 Code Review Report (연습 길 표시·3단계 우회전 화살표 신호 + 이전 세션 미검토분)

# 시도 2 (최신)

## 판정: APPROVE
## 시도: 2/2 (시도 1 "지금 확인 권장" 1 + "이후" 4 반영 재확인)

- revision 요청값 / 읽기 전 / 테스트 후: `ebe4defd91ba5fbfb1812447e502bafbbd953036dfebac8fe24bdfc714e32d2d` / `ebe4defd…2d2d` / `ebe4defd…2d2d` (세 값 일치, PROJECT_ROOT에서 같은 `review-snapshot.py` 명령, 두 번 모두 종료 0). validator PASS(`task-T126_validation.md` "시도 2")와 같은 revision. 테스트 뒤 `git status --short` 20줄(시도 1 보고서 포함)로 시작 때와 같음, 4173·4273 포트에 남은 서버 없음, 5173 개발 서버는 그대로 둠
- 읽은 지침·기준: 시도 1과 같음(`AGENTS.md` 먼저 → 역할 파일 → `orca-cross-review.md`). IVI Java/Spring 기준 적용하지 않음. 추가로 조율자 재검토 요청(사용자 결정 "2건 고친 뒤 커밋·배포")을 읽음
- 실행 도구: Claude Code 서브에이전트 `spec-implement-reviewer`(Opus 5.5), 시도 1과 같은 세션. Orca Dispatch·handle 없음(사용자 결정)
- 검증 상태: COMPLETE

### 바뀐 것이 두 줄뿐인지 확인한 방법

| 확인 | 결과 |
|---|---|
| 시도 1 보고서를 쓴 시각(20:57:05)보다 새로 바뀐 파일(`find -newer`, node_modules·.git·dist·test-results 제외) | `src/content/town.ts`, `tasks.md`, `_workspace`의 구현 기록·검증 보고서뿐 |
| 시도 1 때 만든 저장소 밖 복사본(`scratchpad/reviewer-t126/copy/`)과 `src`·`tests` 비교(`diff -rq`) | `town.ts` 30행 한 줄("위" → "아래")만 다름. `scenario.ts` 차이는 복사본에 남은 내 변이 B 쪽이고 저장소 파일은 시도 1에서 본 그대로 |
| 저장소 밖 두 번째 복사본(`scratchpad/reviewer-t126/revert-check/`, .git 포함)에서 두 수정을 원래 문구로 되돌린 뒤 같은 snapshot 명령 | `16458040…2ad6` = 시도 1 revision과 정확히 같음 → 두 문구 말고 바뀐 것 없음 |

### 바뀐 내용

| 파일 | 바뀐 내용 | 판단 |
|---|---|---|
| `src/content/town.ts:30` | 주석 "신호등 위 화살표 판" → "신호등 아래 화살표 판" | 제안 1 그대로. 그리기(`townView.ts:57-64`)·data-model 234행·modules.md 395행과 맞음. 코드 동작 변화 없음 |
| `tasks.md:152` | 시험 개수 설명 "3건 추가(화살표 신호 2건, 모퉁이 앞 정지선 1건)" → "2건 추가(화살표 신호 2건)·1건 바꿈(예전 "돌기 전~횡단보도 앞 정지 인정" → 모퉁이 앞 정지선)" | 제안 4 그대로. 실제 `it` 변화(+2, 1건 교체, 3건 고침)와 맞음 |

### 실행한 테스트

| 명령 | 종료 코드 | 결과 |
|---|---|---|
| `review-snapshot.py` (읽기 전) | 0 | `ebe4defd…2d2d` = 요청값 |
| `npm run typecheck` | 0 | 오류 없음 |
| `npm test` | 0 | 16 files, 165 passed |
| (복사본) 두 수정 되돌린 뒤 `review-snapshot.py` | 0 | `16458040…2ad6` = 시도 1 revision |
| `review-snapshot.py` (테스트 후) | 0 | `ebe4defd…2d2d` = 요청값 |

- 주석 한 단어와 문서 문구만 바뀌어 build·E2E·변이 시험은 다시 돌리지 않음(시도 1의 결과와 validator 시도 2의 결과가 그대로 유효)

### 이전 지적 처리 결과

| 시도 1 제안 | 결과 |
|---|---|
| 1 `town.ts:30` 주석 방향 | 해소 |
| 2 `paintAlong` 꺾인 곳 처리·각도 정규화 | 반영하지 않음(조율자 전달대로 나중에). 지금 데이터에서는 실행되지 않는 경로라 승인에 영향 없음 |
| 3 `turnGo()` 조용한 실패 | 반영하지 않음(나중에). 기존 시험 모양과 같아 승인에 영향 없음 |
| 4 tasks.md 시험 개수 설명 | 해소 |

### 새로 발견한 것
- 없음

### REJECT 수정 요청
- 없음

---

# 시도 1

## 판정: APPROVE with comments
## 시도: 1/2

- 읽은 지침과 적용 기준(이 순서): `AGENTS.md`를 가장 먼저 읽고 적용 → 역할 파일 `ivi-agent-guide/claude-config/agents/spec-implement-reviewer.md`(AGENTS.md 치환 기준으로) → `ivi-agent-guide/orca-cross-review.md`(보고서 필드·snapshot 규칙). IVI Java/Spring·JPA·Lombok·Maven·REST Controller 기준은 적용하지 않음. 기준 = TypeScript + three.js + Vite + npm 웹게임의 기존 코드 컨벤션(`src/render/townView.ts`·`trackView.ts`, `src/content/*.ts`, `src/practice/*.ts`, `tests/unit/*`)과 `package.json` 스크립트, `contracts/modules.md` 395행(`finishGate` 공용 약속), plan.md 모듈 표(render 206~210행)
- constitution: `.specify/memory/constitution.md`는 템플릿 자리표시자 그대로(사용자 결정 2026-10-12 "constitution 없음") — 판정 근거로 쓰지 않음. `docs/PRD.md`·`GLOSSARY.md`는 이번 검토에 필요한 용어가 없어 읽지 않음
- revision 요청값 / 읽기 전 / 테스트 후: `16458040cad93d905097275ec6916a5878535ff02a3f20525adf033274b52ad6` / 같음 / 같음 (PROJECT_ROOT에서 `python3 ivi-agent-guide/scripts/review-snapshot.py "$PWD" "$PWD/specs/001-kids-driving-safety-game"`, 두 번 모두 종료 0). validator PASS(`task-T126_validation.md`, 시도 1/2)와 같은 revision. 테스트 뒤 `git status --short` 19줄로 이 세션 시작 때와 같음(이 보고서 제외). 5173 포트 개발 서버(PID 6586)는 원래 떠 있던 것이라 그대로 둠, 4173·4273 포트에 남은 서버 없음
- 읽은 것: `tasks.md` 152행(T126), `00_context.md` 승인 기록 마지막 줄들(70~73행), `task-T126_impl.md`, `task-T126_validation.md`, `task-US4_review.md`(형식), `git diff HEAD` 전체(코드 9개 파일 + spec·data-model·contracts 문서 변경), `src/render/townView.ts` 전체, `src/render/trackView.ts` 1~140행, `src/practice/scenario.ts` 50~185행, `tests/unit/scenario.test.ts` 1~104·255~355행, `src/practice/townActors.ts` 신호 관련 줄, 새 그림 `cue-go.svg`(저장소 밖에서 그림으로 바꿔 확인)와 사진 `records/img/t126-practice-marks.png`

| 항목 | 값 |
|---|---|
| run / task / dispatch / 실제 도구 / 세션 handle | Orca 없음 — 사용자 결정(Codex 사용 한도 해제 2026-10-19 전까지 검증·리뷰는 Claude 에이전트)에 따라 Claude Code 서브에이전트 `spec-implement-reviewer`(Opus 5.5) 한 세션. Dispatch·handle 없음 |
| FEATURE_DIR / 단계 / 검토 태스크 | `/Users/kyw/Documents/git/mine/driving_game/specs/001-kids-driving-safety-game` / implement / T126(기준 커밋 `2cdd0bc` 뒤 커밋하지 않은 변경 전체, 이전 세션 몫 town·townView·trackView·cue-go.svg·townActors 주석·화살표 시험 포함) |
| validator 보고서 / 판정 | `_workspace/implement/logs/task-T126_validation.md` / COMPLETE · PASS, 같은 revision |
| 검토 깊이 | 가벼운 검증(사용자 결정): 변경 코드 읽기 + `typecheck`·`npm test` + 미사용 변수 검사. 판정 로직 한 줄만 **저장소 밖 복사본**(`scratchpad/reviewer-t126/copy/`, node_modules 심볼릭 링크)에서 변이 2건. 저장소 안에는 이 보고서만 씀 |
| 검토 상태 | COMPLETE |
| 역할 판정 | APPROVE with comments (필수 수정 없음, "지금 확인 권장" 1건 + "이후" 3건) |
| 미해결 질문 / 이전 지적 | 없음(첫 리뷰) |

```
[Speckit-Context] implement phase
  ├ constitution: 템플릿 그대로, 사용자 결정으로 원칙 없음(판정에 쓰지 않음)
  ├ spec: FR-024 연습 길 표시(노란 칸·정지선·회전 화살표·도착 깃발 문), FR-046 우회전 화살표 신호(빨간 화살표면 모퉁이 앞 정지선에서 멈춤), Clarifications 2026-10-13 네 문답
  ├ plan: TypeScript + three.js + Vite, 판정은 practice/ 순수 함수, 그리기는 render/(townView 마을·trackView 트랙), 콘텐츠는 content/ 데이터
  └ tasks: T126 = turn-vehicle 신호·turning-car 구간 값·judge 한 줄·townView/trackView 길 표시와 finishGate 공용·cue-go.svg 깃발·시험 추가/고침·play-check 기록
```

### 실행한 테스트

| 명령 | 종료 코드 | 결과 |
|---|---|---|
| `review-snapshot.py` (읽기 전) | 0 | `16458040…2ad6` = 요청값 |
| `npm run typecheck` | 0 | 오류 없음 |
| `npm test` | 0 | 16 files, 165 passed |
| `npx tsc --noEmit --noUnusedLocals --noUnusedParameters` | 1 | 남은 것은 `tests/unit/content.test.ts:272` `s` 1건뿐 = 기준 커밋부터 있던 것(기준 260행, 시험 12줄 추가로 밀림). 이번 변경이 남긴 미사용 변수·import 없음 |
| SVG 검사: 위험 요소 grep(`<script`·`href`·`<text`·`foreignObject`·`on…=`·`url(`·`<style`·`<image`) + XML 파싱 | 0 | 해당 0건, 요소는 `svg`·`g`·`path`·`rect`·`circle`뿐 |
| (복사본) 변이 A: `scenario.ts:163` 새 줄 삭제 → `npx vitest run tests/unit/scenario.test.ts` | 1 | SC-010 시험 실패(기대 `turnedIntoCrossingPedestrian`) → 새 판정 줄이 시험에 묶여 있음 |
| (복사본) 변이 B: 같은 줄의 `if (crossing)` 조건 제거(항상 추가) → 같은 명령 | 1 | "빨간 화살표면 모퉁이 앞 정지선…ranRed"·"보행자가 다 건넜어도…earlyStart" 2건 실패 → 조건 쪽도 묶여 있음 |
| `review-snapshot.py` (테스트 후) | 0 | `16458040…2ad6` = 요청값 |

- build·E2E는 validator가 같은 revision에서 종료 0으로 실행(51 passed, 1 skipped)했고, 이번 검토에서 다시 돌릴 이유(그리기 코드의 실행 오류 의심 등)를 찾지 못해 재실행하지 않음

### 관점별 확인

- 코딩 컨벤션 [✓]
  - 상수 이름·단위 주석(`ZONE_WIDTH`·`GATE_WIDTH`·`TURN_ARROW_GAP`, `townView.ts:27-30`)이 기존 `STRIPE`·`LANE_HALF`·`EMPHASIS` 모양과 같음. 함수는 작은 지역 함수(`arrowPlate`·`paintAlong`·`turnSide`·`turnArrow`)로 기존 `lamp`·`along`과 같은 단위
  - 데이터 값 옆 "왜 + 사용자 결정 날짜" 주석(`scenarios.ts:89-92`·`:206`, `town.ts:91`)이 기존 관례와 같음. `afterStep: 0` 주석은 crossing-check(`:160`)의 같은 주석 모양을 따름
  - `signalView`가 `SignalDef`를 받도록 바뀐 것은 `arrow`를 넘기기 위한 최소 변경이고 부르는 곳은 `buildTown` 한 곳뿐
  - `townView → trackView`의 `finishGate` import는 `contracts/modules.md` 395행에 약속된 모양. `flow.ts:16-17`이 두 모듈을 이미 정적으로 함께 불러 번들 나눔에 영향 없음
- 보안 [✓]
  - 새 DOM·외부 요청·저장값 없음. `cue-go.svg`는 위 검사대로 스크립트·외부 참조·글자 없음(글자 없는 그림 규칙도 지킴). 사진 PNG는 950×946 화면 기록으로 기존 `records/img/*.png`와 같은 종류
- 불필요한 코드 [✓]
  - 쓰이지 않게 된 `TURN_STOP_LINE` 삭제, 남은 참조 없음(코드·시험·문서 grep). 새 import(`SignalDef`, `DRIVING_SPEC`, `finishGate`) 모두 사용. 디버그 코드·주석 처리된 코드 없음
  - `trackView.ts`는 결승선 코드를 `finishGate(p, t, width)`로 꺼내며 `TRACK.width` → `width`만 바꿈, `marker` 줄은 위치만 옮김(동작 같음)
- 변경 최소성 [✓]
  - 바뀐 줄이 모두 T126으로 이어짐. `scenario.ts:155`의 `crossing` 변수는 기존 조건식을 새 줄과 함께 쓰려고 꺼낸 것. `townActors.ts:32`은 turning-car가 차 신호를 갖게 되어 틀려진 주석만 고침
- three.js 자원 처리 [✓]
  - 새 도형은 모두 `buildTown` 안에서 한 번 만들고(`group ??= buildTown()`), townView의 나머지처럼 해제하지 않는 방식 그대로. 노란 칸 재질 `zone`은 구간들이 함께 씀. `finishGate`는 trackView의 공용 `unitBox`를 쓰고 부를 때마다 재질 2개(마을에서 3번 = 6개)라 부담 없음
- 테스트 품질 [✓]
  - 새 판정 줄은 변이 A·B로 양쪽(있어야 할 때·없어야 할 때)이 모두 시험에 걸림을 확인. 화살표 신호 시험은 `r.log.find(...)!`가 못 찾으면 바로 오류가 나 조용히 통과하지 않음. content 시험의 `[def.id, …]` 비교는 기존 시험(`scenario.test.ts:320`)과 같은 실패 메시지 모양

### 지금 확인 권장 (커밋 전에 고치기를 권함)

1. **`src/content/town.ts:30` 주석이 실제와 반대** — "신호등 **위** 화살표 판"이라 적혀 있으나 그리기(`townView.ts:57-64`, `plate.position` y −0.55)와 문서(data-model 234행, modules.md 395행)는 "신호등 **아래**"이고, `townView.ts:57` 주석은 "위에 두면 가까이 갈 때 화면 위로 잘림"이라고 아래에 둔 이유까지 적어 둠. 새로 쓴 주석이 코드와 반대라 다음에 읽는 사람이 판 위치를 잘못 옮길 수 있음(validator 참고 1과 같은 지점). 고치는 방법: `town.ts:30`의 "신호등 위 화살표 판"을 "신호등 아래 화살표 판"으로 한 단어만 바꿈. 동작·시험 영향 없음

### 이후 (선택, 다음에 이 파일을 만질 때)

2. **`src/render/townView.ts:171-194` `paintAlong`의 꺾인 곳 처리는 지금 쓰이지 않음** — 세 연습의 노란 칸(30~38, 32~40, 32~40에서 차 길이 2.4 m만큼 뒤까지)은 모두 첫 직선 위라 중간 꼭짓점 처리(`marks`에 꼭짓점 넣기, 양쪽 방향 가운데로 벌리기)가 한 번도 실행되지 않음. 또 그 경로에는 각도 차를 정규화하지 않는 곳이 있어(`:186` `Math.cos((fwd - back) / 2)`), 앞으로 진행 방향이 ±180°를 넘나드는 꼭짓점에 칸을 걸치면 띠 폭이 음수가 되어 뒤집힘. 지금 데이터에서는 문제 없음. 다음에 손볼 때 둘 중 하나: (가) 정지선처럼 한 직선 위 평면 하나로 줄임(`along(path, (a + b) / 2)` 위치·방향, `PlaneGeometry(ZONE_WIDTH, b − a)`에 `zone` 재질) 또는 (나) 꺾인 곳을 남길 거면 `const d = Math.atan2(Math.sin(fwd - back), Math.cos(fwd - back))`로 정규화한 뒤 `Math.cos(d / 2)`
3. **`tests/unit/scenario.test.ts:101-104` `turnGo()`가 목표 상태에 못 가도 조용히 돌려줌** — 30 000틱 안에 '출발' 단계가 안 되면 그 전 상태를 돌려주고, 이를 쓰는 시험 2건은 "위반이 없어야 함" 같은 간접 메시지로 실패함. SC-010의 `crossing = run(...).state`와 같은 기존 모양이라 지금 고칠 사유는 아님. 원하면 `turnGo` 안에서 `expect(def.segments[0].steps[state.step].action).toBe('go')` 한 줄로 실패 위치를 분명히 할 수 있음
4. **문서의 시험 개수 설명**(validator 참고 2 재인용) — `tasks.md` 152행·구현 기록의 "3건 추가·3건 고침"은 실제로 예전 "돌기 전~횡단보도 앞 인정" 시험을 새 "모퉁이 앞 정지선" 시험으로 바꾼 것이 섞여 `it` 수는 +2. 코드 문제는 아니며, 커밋 전에 tasks.md 문구를 손볼 일이 있으면 함께 맞추면 됨

### 참고 (판정과 무관)

- 차 신호가 없는 구간 처리(`townActors.ts:31·33`의 `signal ? … : 'green'`, `SegmentDef.signal: SignalId | null`)는 이제 세 연습 어디서도 쓰이지 않음. 타입과 data-model 4.12가 여전히 허용하는 경우라 지우지 않고 주석만 고친 판단이 맞음. 나중에 차 신호 없는 연습을 새로 넣으면 그때 시험이 필요함
- `finishGate`의 기둥은 `width / 2 + WALL.thick`(트랙 벽 두께 0.4 m) 바깥에 섬. 마을에서도 사진상 문제 없어 그대로 둬도 됨
- 사용자 결정 사항(돈 뒤 1~2° 더 꺾이면 보도 진입 — 기록만, `judge` 확장, 모퉁이 앞 정지선, 글자 없는 그림)은 판정 사유로 쓰지 않음

### REJECT 수정 요청
- 없음
