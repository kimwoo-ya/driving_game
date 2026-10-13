# Task US2 Validation Report — 시도 2/2

- run / task / dispatch / 실제 도구 / 세션 handle: Orca 미사용 — Claude Code 서브에이전트 spec-implement-validator, 사용자 결정 2026-10-12. 시도 1과 같은 서브에이전트 세션(조율자 재검증 요청)
- FEATURE_DIR / 단계 / 검토 태스크: `/Users/kyw/Documents/git/mine/driving_game/specs/001-kids-driving-safety-game` / implement / US2 묶음 T053~T062, 시도 1 FAIL 1~4 재검증
- revision 요청값 / 읽기 전 / 테스트 후: `d4947e6cf21b2cfd4cfa2721940c11f0857532186e0a8b663e51927ae8c18567` / `d4947e6cf21b2cfd4cfa2721940c11f0857532186e0a8b663e51927ae8c18567` / `d4947e6cf21b2cfd4cfa2721940c11f0857532186e0a8b663e51927ae8c18567` (세 값 같음, `git status --porcelain` 34줄 그대로)
  - 시도 1 이후 바뀐 범위: 시도 1 복사본(`scratchpad/us2val/copy`)과 `diff -rq` → `src/content/scenarios.ts`, `src/style.css`, `src/ui/hud.ts`, `src/app/flow.ts`뿐(복사본에만 넣은 점검 진입점 제외). 기록 `records/tooling-and-render.md`, `records/play-check.md`, 그림 `records/img/t061-card-screens.png`. 구현 로그 "attempt 2" 목록과 같음
- 원문 및 코드 근거 (파일:라인): 아래 표. 새로 읽은 원문 = 00_context.md 승인 기록 "US2 validator FAIL 질문 2건"(:56), task-B8_impl.md attempt 2(:41-56), 두 기록 파일의 새 절, 새 그림
- 실행한 테스트 명령 / 종료 코드 / 결과 (PROJECT_ROOT에서):

| 명령 | 종료 코드 | 결과 |
|---|---|---|
| snapshot (읽기 전) | 0 | 요청값과 같음 |
| `npm run typecheck` | 0 | 오류 없음 |
| `npm test` | 0 | 14 files, 129 passed |
| `npm run build` | 0 | 성공(500 kB 청크 경고 기존과 같음) |
| `npm run test:e2e` | 0 | 22 passed(chromium·webkit). 조작 버튼 터치 시험 포함 — 새 `.hud-fade`(화면 전체 덮개)가 터치를 막지 않음(`#ui`가 `pointer-events: none`, `style.css:24-32`) |
| 시도 1과 같은 카드 화면 확인(저장소 밖 새 복사본 `scratchpad/us2val/copy2`, 진입점만 더함, 세 상황으로 넓힘): crossing-check A11 10·90틱, A14-A15 10틱, signal-wait·turning-car 첫 카드 × 932×430·1180×820 | 0 | 10장, 브라우저 오류 0. 아래 FAIL 1 |
| snapshot (테스트·확인 뒤) | 0 | 요청값과 같음 |

- 검증 상태: COMPLETE
- 역할 판정: **PASS** — T053~T062 모두 PASS
- 미해결 질문·지적: 없음. Q1은 문서대로 되돌려 질문이 필요 없어짐, Q2·Q3는 사용자 결정(2026-10-13)대로 반영됨
- 이전 지적 처리 결과: 시도 1 FAIL 1~4 모두 해소(아래 표). 시도 1 "이후 태스크로 넘길 것" 1~5는 그대로 넘김 + 아래 6

## 판정: PASS
## 시도: 2/2

### 시도 1 FAIL 처리 결과

| # | 지적 | 처리 | 확인 근거 | 결과 |
|---|---|---|---|---|
| 1 | (T058·T061) 안내 카메라가 문서의 아이 눈높이와 다르고 카드가 주인공 행동을 가림 | 세 상황 카메라 높이 1 m, 주인공 오른쪽 어깨 뒤(걷는 방향 뒤 2.2 m·오른쪽 1.2 m), turning-car는 (107, 0.8, 50)을 봄(`scenarios.ts:73`, `:162`, `:203`). 카드 겹침은 화면 오른쪽, 글 최대 48vw(`style.css:368-374`) | data-model.md:225 "같은 장소, 아이 눈높이"·plan.md:232 "아이 눈높이의 보행자 위치(Chicken Guy 어깨 뒤)"와 맞음. 오른쪽 계산: 주인공 진행 방향 −X(signal-wait·crossing-check)면 오른쪽 = −Z → 카메라 z −1.2, turning-car는 진행 −Z라 오른쪽 = +X → x +1.2, 모두 맞음. 내 확인: 932×430에서 카드 그림 x 695~895·글 x 432~895, 1180×820에서 그림 x 933~1133·글 x 670~1133이고 주인공은 화면 왼쪽(약 x 100~350)에 크게 보임. A11 왼쪽 보기와 오른쪽 보기는 눈·부리 방향이 분명히 다름, A14-A15 든 손이 머리 옆 위로 보이고 가리지 않음. signal-wait·turning-car 첫 카드도 주인공 왼쪽·보행자 신호 보임 | **해소** |
| 2 | (T059) 안전 연습 버튼 강조 없음, demoReplay 시범이 같은 틱 hint에 지워짐 | 강조 규칙에 stop·wait → 브레이크, go → 액셀(`style.css:136-137`). `showCue`가 repeat 아닌 hint라도 같은 cue면 `data-demo`를 지우지 않음(`hud.ts:46-49`) | wait = 브레이크는 사용자 결정 Q2 옵션 B(00_context.md:56). 사건 순서 segmentReset → demoReplay(cue) → hint(cue, false)(`scenario.ts:293-295`)에서 `showDemo`가 `data-cue`를 그 cue로 둔 뒤 hint가 같은 cue라 시범 유지. 다른 단계로 바뀌면(cue 다름) 시범 해제. 무입력 repeat는 `restart`로 다시 시작. 기록 play-check.md 2026-10-13(브레이크 테두리, 무입력 시범, 세 번째 실패 뒤 시범 유지 — 자동 브라우저, wait·go는 "코드 확인"으로 정직하게 구분) | **해소** |
| 3 | (T060) redirect 짧은 화면 전환 효과 없음 | `flashRedirect()` = 하늘색 덮개 0.5초 페이드(`hud.ts:59-61`, `style.css:182-201`), redirect 때 호출(`flow.ts:156-158`) | events.md:38 "짧은 화면 전환 효과", FR-034 "부드럽게"와 맞음. 덮개가 처음 불투명해 순간 이동을 가리고 0.5초에 사라짐. 터치 막지 않음(e2e 통과) | **해소** |
| 4 | (T061) 실제 A11·A14-A15 카드 화면 기록 없음 | `records/tooling-and-render.md` "실제 안내 카드 화면" 절 + `t061-card-screens.png`(A11 세 자세·A14-A15, 932×430) | 그림 네 칸이 내 확인 그림과 같고 표가 3/3. 처음 기록의 한계와 고친 내용도 적음. 등장 보행자 대기 자세는 처음 기록대로(운전 화면에서 작아 따로 찍음) — 태스크의 "브라우저에서 확인"은 채움 | **해소** |

### 태스크별 판정

| 태스크 | 판정 | 근거 |
|---|---|---|
| T053~T056 | PASS(유지) | 이번에 바뀐 데이터는 `pedestrianView.camera`뿐이고 렌더러만 읽음. content·scenario·townActors 시험 통과 |
| T057 | PASS | `characters.ts` 바뀌지 않음(시도 1 판정 그대로) |
| T058 | PASS | 카메라가 문서와 맞음(FAIL 1). 나머지는 시도 1 확인 그대로. 날씨는 하늘색만(사용자 결정 Q3, T101·T110에서 판단) |
| T059 | PASS | FAIL 2 해소. 겹침·카드·칭찬은 시도 1 확인 그대로, 카드만 오른쪽으로 |
| T060 | PASS | FAIL 3 해소. 나머지 연결은 시도 1 확인 그대로 |
| T061 | PASS | FAIL 4 해소, 실제 카드 화면 3/3 |
| T062 | PASS | 시도 1 판정 그대로 + 2026-10-13 추가 확인표(자동 브라우저와 코드 확인 구분) |

### 이후 태스크로 넘길 것 (추가분, 비필수)

6. **cue → 버튼 대응 문서화**: stop·wait → 브레이크, go → 액셀(사용자 결정 2026-10-13)이 `style.css` 주석과 00_context.md에만 있음. events.md 2장 hint 행이나 modules.md에 한 줄 적어 두면 이후 UI 변경(T075 등) 때 같은 기준을 씀
7. **turning-car 안내 화면의 아이 차**(시도 1 넘김 3 일부): 새 카메라 (105.7, 1, 62.2) → (107, 0.8, 50)에서 정지 구역 앞 끝 40 m~정지선에 선 아이 차가 어떻게 보이는지는 이번 확인(차는 구간 시작 자리)에서 보지 않음. T110 플레이 점검 때 확인 권장

---

# (아래는 시도 1 보고서, 그대로 보존)

# Task US2 Validation Report — 시도 1/2

- run / task / dispatch / 실제 도구 / 세션 handle: Orca 미사용 — Claude Code 서브에이전트 spec-implement-validator, 사용자 결정 2026-10-12(00_context.md 승인 기록 "B5 이후 검증 방식", "검증 방식 재조정"). 깊이 = 스펙 대조 + 테스트 실행, 탐색은 의심 1건만 저장소 밖 복사본에서
- FEATURE_DIR / 단계 / 검토 태스크: `/Users/kyw/Documents/git/mine/driving_game/specs/001-kids-driving-safety-game` / implement / US2 묶음 = T053~T056(47ac5fd3에서 PASS, 유지 확인) + T057~T062(신규)
- revision 요청값 / 읽기 전 / 테스트 후: `613a0df640e4a7cc2dfc3442d56d05c72815d70c30414cee36dfcfbca9db75f3` / `613a0df640e4a7cc2dfc3442d56d05c72815d70c30414cee36dfcfbca9db75f3` / `613a0df640e4a7cc2dfc3442d56d05c72815d70c30414cee36dfcfbca9db75f3` (세 값 같음, `git status --porcelain` 34줄)
- 원문 및 코드 근거 (파일:라인): 아래 표. 읽은 원문 = AGENTS.md, 역할 파일, orca-cross-review.md(머리 필드·snapshot), spec.md(US2 수용 1~19, Edge :278-288, FR-024·025, FR-031~046, FR-070, FR-092~096, SC-008~010, SC-032), plan.md:232, data-model.md(2.1 PedestrianViewDef·SafetyRule·TownDef, 2.2, 4.1, 4.3, 4.4, 4.12), contracts/modules.md(8.3, 9장), events.md(1·2·3·6·8장), assets.md(5·6장), tasks.md T053~T062, quickstart.md S2, 00_context.md 승인 기록, task-B7_validation.md(시도 2 PASS·넘김 항목), task-B8_impl.md, records/tooling-and-render.md(O3), records/play-check.md, records/img 두 장
- 실행한 테스트 명령 / 종료 코드 / 결과 (PROJECT_ROOT에서):

| 명령 | 종료 코드 | 결과 |
|---|---|---|
| `python3 ivi-agent-guide/scripts/review-snapshot.py <PROJECT_ROOT> <FEATURE_DIR>` (읽기 전) | 0 | 요청값과 같음 |
| `npm run typecheck` | 0 | 오류 없음 |
| `npm test` | 0 | 14 files, 129 passed |
| `npm run build` | 0 | 성공, 500 kB 청크 경고(기존과 같음) |
| `npm run test:e2e` | 0 | 22 passed(chromium·webkit) |
| 의심 1건 확인(저장소 밖 복사본 `scratchpad/us2val/copy`, Vite `cacheDir`도 복사본 안): 복사본 `flow.ts`에 `?check` 진입점만 더해 crossing-check 보행자 시점 안내의 A11·A14-A15 카드 화면을 바로 띄우고 Playwright Chromium 932×430으로 찍음(`node shot.mjs`) | 0 | 5장 촬영, 브라우저 오류 0. 결과는 아래 "의심 확인" |
| snapshot (테스트·확인 뒤) | 0 | 요청값과 같음 |

- 검증 상태: COMPLETE
- 역할 판정: **FAIL** — T053~T057 PASS, **T058 FAIL**, **T059 FAIL**, **T060 FAIL**, **T061 FAIL**, T062 PASS
- 미해결 질문·지적: 질문 3건(아래 "미해결 질문"). FAIL 피드백 4건
- 이전 지적 처리 결과: B7 시도 2 "이후 태스크로 넘길 것" 4·5는 T058 범위 — 신호 방향(4 일부)은 처리됨(`town.ts:86-90`, 렌더러만 씀). 모퉁이 빈 땅·도로 겹침·turning-car 안내 카메라(4 나머지, 5)는 아래 "이후 태스크로 넘길 것"에 그대로 남김

```
[Speckit-Context] implement phase
  ├ constitution: 빈 양식(사용자 결정, 규칙 없음). 기준은 AGENTS.md·PRD·GLOSSARY
  ├ spec: US2 세 연습. 다음 행동 그림은 그 행동까지 남고 무입력이면 눌러야 할 버튼 강조 시범(FR-031, US2-11),
  │       연속 실패면 시범 다시(US2-8), 경로 문제는 부드럽게 되돌림(FR-034), 위험 직전 멈춤은 게임 전체 멈춤으로(FR-037),
  │       보행자 시점 안내는 같은 장소를 보행자 입장에서(FR-041), 주인공 Chicken Guy가 좌우 보기·손 들기를 직접(US2-19, SC-032, FR-096),
  │       차/보행자 신호 구분·강조(FR-024·025·042), 비·어두운 날 카드는 그 날씨 모습(FR-092)
  ├ plan: 보행자 시점 안내 카메라 = 아이 눈높이 Chicken Guy 어깨 뒤(plan.md:232, data-model 2.1 camera "같은 장소, 아이 눈높이"),
  │       렌더러는 상태를 읽기만, 클립 갱신 뒤 Head·HandL/HandR 덮어쓰기(assets.md 5장), 그림 없으면 자리표시 도형(D4)
  └ tasks: T057 Chicken Guy 동작, T058 마을 신호·횡단보도·정지선·보행자·안내 카메라·날씨, T059 HUD 시범·겹침,
          T060 flow 연결(events.md 2·3장, 소리·저장 제외), T061 자세 점검 기록, T062 플레이 확인 기록.
          사용자 결정: B8 다시 시작하면 세 연습 처음부터(T063·T065 전 임시)
```

## 판정: FAIL
## 시도: 1/2

## 태스크별 판정

| 태스크 | 판정 | 계약·원문 | 코드·기록 근거 |
|---|---|---|---|
| T053 crossing-check 데이터 | PASS(유지) | tasks.md:139, B7 시도 2 PASS | 47ac5fd3 뒤 바뀐 값은 `scenarios.ts:162` 안내 카메라, `town.ts:87·89` 보행자 신호 방향뿐(B8 로그). 둘 다 렌더러만 읽음(`grep`: `townView.ts:125-128`, `:169-177` 외 사용처 없음). content·scenario·townActors 시험 통과 |
| T054 turning-car 데이터 | PASS(유지) | tasks.md:140 | 바뀐 값 `scenarios.ts:203` 카메라((105, 1, 61) → (101.5, 2.2, 63.5)), `town.ts:90` 신호 방향. 판정과 무관, 시험 통과 |
| T055 콘텐츠 검사 #15·#17 | PASS(유지) | tasks.md:141 | `content.test.ts` 통과(129건 중) |
| T056 SC-009·SC-010 시험 | PASS(유지) | tasks.md:142 | `scenario.test.ts` 통과 |
| T057 Chicken Guy 동작 | PASS | tasks.md:143, assets.md 5장(:83-95), modules.md 9장 "Chicken Guy 자세", FR-094·096 | `pedestrianObject()`는 chicken-guy 고정, Idle·Walk 두 동작만 만듦(`characters.ts:53-75`) → Sprint·Jump 재생 없음. `updateRig`가 쉬는 자세로 되돌린 뒤 `mixer.update` → `Head` Y축 ±60°·든 손 위치 덮어쓰기(`:89-102`), 관절 이름 `Head`·`HandL`(`:14`, `:60-61`). 등장 보행자는 `TownPedestrian` 위치·방향·pose대로(`townView.ts:152-163`), 주인공은 카드 poses를 durationTicks를 나눠 차례로(`:182-191`). 참고: 손 회전은 덮어쓰지 않음(INFO, 넘김 1) |
| T058 마을 표현·안내 카메라·날씨 | **FAIL** | tasks.md:144, data-model.md:225(camera "같은 장소, 아이 눈높이"), plan.md:232("아이 눈높이의 보행자 위치(Chicken Guy 어깨 뒤)"), FR-041, US2-19, SC-032 | 맞는 부분: 차 신호(가로, 빨강 네모·노랑 마름모·초록 동그라미)와 보행자 신호(세로, 빨강 막대·초록 세모) 따로(`townView.ts:52-74`), 운전 중 차 신호·안내 중 보행자 신호 1.4배(`:136-150`, `:214`), 횡단보도 줄·정지선·보도(`:96-123`), 등장 보행자(`:152-163`), introTicks 동안 차에서 `def.camera`로 이동(`:170-178`), 카드 weather면 배경색(`:192-193`). **FAIL**: 세 상황 안내 카메라가 높이 2.2 m, 주인공 약 4.6 m 뒤(`scenarios.ts:73`, `:162`, `:203`)로 바뀌어 문서의 "아이 눈높이(어깨 뒤)"와 다르고, 문서 변경·사용자 결정 기록이 없음. 이 카메라에서 주인공이 화면 가운데 아래(카드 겹침 자리)에 와서 행동이 가려짐(아래 "의심 확인", 피드백 1) |
| T059 HUD 시범·겹침 | **FAIL** | tasks.md:145("repeat·demoReplay 버튼 강조 시범"), events.md:37(hint "`repeat`이면 눌러야 할 버튼 강조 시범"), :41(demoReplay "그 단계의 버튼 시범 애니메이션(US2-8)"), FR-031, US2-8, US2-11 | 맞는 부분: cue 그림은 다음 hint까지 남음(`hud.ts:42-47`). 위반 겹침 = 화면 전체 반투명 + `game-paused` + `violation-<kebab>`(`overlays.ts:16-19`, `style.css:326-341`), 규칙 카드 `images/rules/<RuleId>.svg` + 글(`overlays.ts:22-26`), 칭찬(`:29-32`), 그림 없으면 자리표시(`screens.ts:4-16`). **FAIL 두 가지**: ① 버튼 강조 CSS가 `steer`·`accel`·`brake`·`reverse`에만 있음(`style.css:131-137`). 안전 연습 cue `stop`·`wait`·`go`는 `data-cue`만 붙고 어떤 버튼도 강조·시범되지 않음(T062 그림 위 오른쪽·아래 오른쪽에서도 브레이크·액셀 테두리 없음) ② `demoReplay` 바로 뒤 같은 틱에 `hint(repeat: false)`가 옴(`scenario.ts:293-295`, 시험 `scenario.test.ts:201`이 이 순서를 고정). flow가 `showDemo` → `showCue(cue, false)` 순서로 부르고 `showCue`가 `data-demo`를 바로 지움(`hud.ts:46`) → 시범 애니메이션이 한 번도 보이지 않음(조작 익히기 cue였어도 같음) |
| T060 flow 연결 | **FAIL** | tasks.md:146, events.md 2·3장, data-model 4.1, 00_context "B8 첫 배포 다시 하기" | 맞는 부분: 처음 이용 흐름 → (조건이면 조작 익히기) → signal-wait(`flow.ts:108-117`, `:119`), 조작 익히기 끝 → 다음 상황(`:130-139`), `startScenario(id, pickRules(id, isReplay(id, run), run.extraCursor[id]))`(`:147`), hint → HUD, violation·segmentReset·pedestrianViewStart·redirect → `releaseAll`, 안내 중 조작 버튼 숨김, cardShown → 카드, ended → 겹침 닫기·버튼 복귀·`advanceExtraCursor`, scenarioCompleted → `completedThisRun`·칭찬 120틱 뒤 다음 상황(`:153-190`). 다시 시작하면 세 상황 처음부터(`sequenceDone.clear()`, `:114`)는 사용자 결정대로. **FAIL**: events.md:38 redirect의 화면 반응 "짧은 화면 전환 효과"가 없음(`flow.ts:156-159`는 `releaseAll`과 cue 그림만). 차가 구간 시작으로 순간 이동해 FR-034 "구간 시작 위치로 부드럽게 되돌려야"를 채우지 못함. 소리·저장 제외 범위에도 해당하지 않음 |
| T061 자세 점검 기록 | **FAIL** | tasks.md:147("A11·A14-A15 카드와 등장 보행자 대기 자세를 브라우저에서 확인"), SC-032, US2-19 | 기록(`records/tooling-and-render.md:35-50`)은 별도 점검 페이지에서 인물만 가까이 찍은 것으로 3/3(그림 `t061-chicken-guy-poses.png`에서 좌우 보기·손 들기 확인됨). 그러나 태스크가 말한 **실제 A11·A14-A15 카드 화면**은 확인하지 않았고, 실제 카드 화면에서는 고개 돌리기가 카드 글에 가려 거의 보이지 않음(아래 "의심 확인"). 그래서 "주인공이 그 행동을 직접 보여 줌"을 실제 화면 기준으로 기록하지 못함. 들 손(인물의 오른손 = `HandL`) 결정·FR-095 문구는 맞음 |
| T062 플레이 확인 기록 | PASS | tasks.md:148(검증: 항목별 예/아니오와 날짜), quickstart S2 4~6단계, AGENTS.md:31(자동·브라우저·실제 기기 구분) | `records/play-check.md`: 날짜 2026-10-12, 신호 기다리기 완료·정지선 넘기 멈춤 겹침·같은 구간 처음부터·누르던 버튼 풀림·소리 없이 카드 자동 진행·조작 익히기 → 연습 바로 이어짐 모두 "예", 그림 `t062-play-check.png`가 네 장면과 맞음. "자동 브라우저 확인(Playwright)"이고 사람·어린이·실제 기기 확인은 아직 안 했다고 분명히 구분함. 하지 않은 것(소리 비교, 15조합 실제 기기, 나머지 두 연습 브라우저 주행, 다시 시작 흐름)도 적음. 참고: 점검 스크립트가 저장소 밖이라 다시 돌릴 수 없음(INFO) |

## 의심 확인 (저장소 밖 복사본, 1건)

- 의심: T062 그림 아래 왼쪽(신호 기다리기 카드)에서 주인공이 카드 글 밑에 반쯤 가려 있음. crossing-check 카메라도 같은 배치(주인공 뒤 4.5 m, 높이 2.2 m)라 A11·A14-A15에서 행동이 가려질 수 있음
- 방법: 복사본 `flow.ts`에 `?check&rule=<id>&t=<틱>`이면 crossing-check 시도를 만들어 보행자 시점 안내 그 카드·그 틱에 멈추고 카드 겹침을 띄우는 코드만 더함(렌더러·겹침·CSS·데이터는 저장소와 같음). 932×430(T062와 같은 크기)
- 결과(겹침 요소 위치는 `getBoundingClientRect`):
  - 카드 그림 y 114~254, 카드 글 y 278~316(A11 x 340~592, A14-A15 x 258~674). 주인공은 화면 가운데 x 약 470~525, y 약 250~345 → 머리·몸 위쪽이 카드 글 뒤
  - A11 lookLeft·lookRight·다시 lookLeft: 머리가 글 상자에 가려 세 장의 차이가 글 위로 삐져나온 부리 몇 픽셀뿐. 뒤에서 찍혀 얼굴도 보이지 않음 → 좌우 보기를 알아보기 어려움
  - A14-A15 raiseHand: 든 손이 그림 아래·글 위 틈에 작게 보임. 카드 없이 찍으면 손이 머리 위로 보이나 뒷모습이고 작음
- 판단: 실제 카드 화면에서 US2-19·SC-032(주인공이 고개를 돌리고 손을 듦)를 확인할 수 없음 → T058·T061 FAIL 근거. 복사본·스크린샷은 `scratchpad/us2val/copy/shots/`에만 있음

## FAIL 피드백

1. **(T058·T061, 필요하면 T059 겹침 배치) 보행자 시점 안내에서 주인공 행동이 보이게, 카메라는 문서대로**
   - 근거: data-model.md:225 `camera` "같은 장소, 아이 눈높이", plan.md:232 "아이 눈높이의 보행자 위치(Chicken Guy 어깨 뒤)", US2-19, SC-032, tasks.md:147
   - 지금: `scenarios.ts:73`, `:162`, `:203` 카메라 높이 2.2 m·주인공 약 4.6 m 뒤. 카드 겹침(`style.css:326-351`, 가운데 정렬 그림 + 글)이 주인공 머리를 가림
   - 기대: A11(왼쪽·오른쪽·다시 왼쪽 보기)·A14-A15(손 들기) 카드가 실제로 나오는 화면에서, 카드 그림·글에 가리지 않고 고개 돌리기와 든 손을 알아볼 수 있음. 카메라 높이는 문서대로 아이 눈높이이거나, 바꾸려면 사용자 확인 후 data-model.md 2.1·plan.md를 같이 고침(질문 Q1). 카메라 위치나 카드 배치 중 어디를 고칠지는 구현 재량
   - 기록: `records/tooling-and-render.md` O3에 **실제 카드 화면** 스크린샷(A11 세 자세, A14-A15)과 3/3 결과를 더함
2. **(T059) 안전 연습 버튼 강조 시범**
   - 근거: events.md:37, :41, FR-031, US2-8, US2-11, tasks.md:145
   - 지금: `style.css:131-137`에 `stop`·`wait`·`go` 강조 규칙 없음. `hud.ts:46`이 demoReplay 직후 같은 틱의 `hint(repeat: false)`에서 `data-demo`를 지움
   - 기대: 안전 연습 무입력 재안내(`repeat: true`)와 `demoReplay`에서 그 단계의 버튼이 강조되고 누르는 시범이 실제로 보임. `stop` → 브레이크, `go` → 액셀은 문서 뜻대로, `wait`는 질문 Q2 답을 따름. demoReplay 뒤 같은 cue의 hint가 시범을 지우지 않게(예: hint 처리에서 같은 cue면 data-demo 유지, 또는 flow가 demoReplay가 있으면 그 틱 hint의 시범 해제를 건너뜀)
3. **(T060) 경로 문제 되돌림 화면 효과**
   - 근거: events.md:38 redirect 화면 반응 "짧은 화면 전환 효과", FR-034 "부드럽게 되돌려야"
   - 지금: `flow.ts:156-159`에 효과 없음, 차가 구간 시작으로 바로 바뀜
   - 기대: `redirect` 때 짧은 화면 전환(예: 짧은 페이드)이 보임. `releaseAll`과 cue 그림 처리는 그대로
4. **(T061) 기록 범위** — 1번 수정 뒤 실제 카드 화면 기준으로 다시 기록. 등장 보행자 대기 자세는 "운전 화면에서 작아서 따로 찍음"으로 둔 것을 그대로 둘지 실제 운전 화면 그림을 더할지는 1번과 함께 정함

## 미해결 질문 (추측하지 않음, 리더 → 사용자)

- **Q1 [CONTRADICTORY] 보행자 시점 안내 카메라 높이**: 문서는 "아이 눈높이(어깨 뒤)", 구현은 2.2 m 뒤·위(주인공 머리와 겹치지 않게 바꾼 것, B8 로그).
  - 옵션 A(권장): 문서대로 아이 눈높이로 두고, 주인공을 화면 한쪽(카드 밖)에 두는 위치·방향으로 다시 잡음 — 보행자 입장 시점과 SC-032를 함께 채움
  - 옵션 B: 지금처럼 높은 뒤쪽 시점을 쓰기로 하고 data-model.md 2.1·plan.md:232 문구를 바꿈. 이때도 카드에 가리지 않게 배치는 고쳐야 함
- **Q2 [MISSING] `wait` 단계의 버튼 시범**: 기다리기는 누를 버튼이 없고, 올바르게 기다리는 중에도 무입력 재안내(`repeat: true`)가 300틱마다 나옴(`scenario.ts:276-279`).
  - 옵션 A(권장): `wait`는 버튼 강조 없이 기다리기 그림만 다시 강조 — 버튼을 강조하면 지금 눌러 출발하라는 뜻으로 오해할 수 있음
  - 옵션 B: 브레이크 버튼을 강조(멈춘 채 기다리기를 버튼으로 보여 줌)
- **Q3 [AMBIGUOUS] 날씨 표현 수준(FR-092)**: 지금은 비 = 회색 하늘, 어두운 날 = 남색 하늘만 바뀌고 조명·비 표현은 없음(`townView.ts:28`, `:192-193`). 해당 카드는 B13(signal-wait 추가)·B14(turning-car 추가) 등 다시 하기 때만 나옴.
  - 옵션 A(권장): 첫 배포는 하늘색만으로 두고 콘텐츠 확정·점검(T101, T110)에서 "그 날씨 모습"인지 판단
  - 옵션 B: 지금 T058에서 조명 어둡게·빗줄기 같은 표현을 더함

## 이후 태스크로 넘길 것 (비필수, 판정과 별개)

1. **손 회전**(T057, assets.md:89 "위치·회전"): 든 손은 위치만 덮어씀(`characters.ts:96-101`). 손 모양이 손 든 모습으로 보이면 계약 문구를 "위치"로 맞추거나 회전을 더하기
2. **설명 중 멈춤 표현**(FR-037, T110 플레이 점검 때): `explaining` 동안 상태는 멈추지만 건너는 보행자의 Walk 클립이 제자리에서 계속 돌고(`characters.ts:105-113`, 실제 시간), 보행자 초록 깜빡임도 실제 시간으로 계속됨(`townView.ts:137`). 반투명 겹침 아래라 "게임 전체가 멈춤"이 분명한지 확인 권장
3. **B7 넘김 그대로**: 교차로 `turn-road`·`turn-side-road`가 같은 높이(0.02 m) 상자로 겹쳐 그려짐(`townView.ts:111-114`) — 깜빡임(z-fighting) 확인, 회전 안쪽·북서쪽 모퉁이 빈 땅 표현(T099), turning-car 안내 카메라에서 앞 끝 40 m에 멈춘 차가 어떻게 보이는지(Q1 수정 때 함께)
4. **걷기 뒤 다른 자세**(T101 poses 확정 때): `walk` 칸이 끝난 뒤 다른 자세가 오면 주인공이 경로 첫 점으로 되돌아감(`townView.ts:186-189`). 지금은 A19-A20이 `['walk']` 하나라 드러나지 않음
5. **B7 넘김 8(같은 cue 두 번)**: 그대로
