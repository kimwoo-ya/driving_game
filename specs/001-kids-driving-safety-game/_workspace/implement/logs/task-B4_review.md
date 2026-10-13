# Task B4 Code Review Report

- run / task / dispatch / 실제 도구 / 세션 handle: Orca 미사용 — Claude Code 서브에이전트 spec-implement-reviewer, 사용자 예외 결정 2026-10-12("이번엔 예외적으로 그럼 클로드 에이전트로 검증해", 00_context.md:43). Codex reviewer 세션(term_f9cb362f…)은 사용 한도로 미수신
- FEATURE_DIR / 단계 / 검토 태스크: `/Users/kyw/Documents/git/mine/driving_game/specs/001-kids-driving-safety-game` / implement / B4 = T030~T042 + B3 reviewer 비필수 제안 1건(loader.test.ts loadSounds 확인 방식)
- revision 요청값 / 읽기 전 / 테스트 후: `bc724ea78bf1d1c6f27c057df26771f17e063bb820c0fbef2d660a6acbad39a0` / `bc724ea78bf1d1c6f27c057df26771f17e063bb820c0fbef2d660a6acbad39a0` / `bc724ea78bf1d1c6f27c057df26771f17e063bb820c0fbef2d660a6acbad39a0` (세 값 같음)
  - 검토 중 사고 1건(아래 "검토 중 사고" 절): 저장소 파일 1줄을 실수로 바꿨다가 곧바로 원래대로 되돌림. 되돌린 직후 snapshot = 요청값, 빌드 JS 해시도 사고 전과 같음(`index-CzJGAWP4.js`). 판정은 요청 revision 그대로의 코드에 대한 것
- validator 보고서 / 판정 / revision: `_workspace/implement/logs/task-B4_validation.md` / COMPLETE·PASS(T030~T042 + B3 제안 모두 PASS, 미해결 질문 0, Q1 해결) / `bc724ea7…39a0`(요청값과 같음) → 리뷰 시작 조건 충족
- 원문 및 코드 근거 (파일:라인): 아래 태스크별 표·항목별 절. 소스는 PROJECT_ROOT, 피처 문서는 FEATURE_DIR 기준
- 실행한 테스트 명령 / 종료 코드 / 결과: 아래 "직접 실행 기록". typecheck 0, 전체 단위 9 files 84 passed, build 0(사고 전후 두 번씩 실행). E2E는 실행하지 않음(이유는 실행 기록 절)
- 검증 상태: **COMPLETE**
- 역할 판정: **APPROVE with comments** — T030~T042·B3 제안 14건 모두 APPROVE. 필수 수정 0건, 비필수 제안 3건(1번은 테스트 보강, 우선 권장)
- 미해결 질문·지적 / 이전 지적 처리 결과: 미해결 질문 0건. B3 reviewer 비필수 제안(loader.test.ts 소리 목록 고정)은 반영 확인(`tests/unit/loader.test.ts:64-81`). 이번 REJECT 없음

## 판정: APPROVE with comments
## 시도: 1/2

```
[Speckit-Context] implement phase
  ├ constitution: 빈 양식(사용자 결정, 규칙 없음). 프로젝트 기준은 AGENTS.md·PRD·GLOSSARY
  ├ spec: US1(차량 5·인물 3 선택, 터치 조작, 조작 익히기). FR-013~027 조작·화면, FR-097 탑승객
  ├ plan: 서버 없는 정적 웹게임. 순수 폴더(sim·practice·…)는 DOM/three 금지, step(state)→{state,events}.
  │       화면 폴더(render·ui·audio·platform)는 상태를 읽기만. 시그니처 최종 기준은 contracts/modules.md
  └ tasks: Phase 3 T030~T042(+ D3 data-pressed, D4 그림 없으면 CSS 도형, D8 records 미산정)
```

## 적용 기준과 범위

- AGENTS.md를 역할 파일보다 먼저 읽고 그 치환표를 적용함. TypeScript 7 + three.js 0.186 + Vite + Vitest + Playwright 정적 게임(`package.json`).
- **적용하지 않은 IVI 전용 항목**: Lombok 패턴, DTO/Entity/Service/Repository 계층, SQL Injection(파라미터 바인딩), Mass Assignment(DTO 필드 제한), 인증·인가 — 서버·DB·REST가 없음(`contracts/overview.md:4`, AGENTS.md "역할별 프로젝트 기준"). "컨벤션 파악 불가 시 Spring Boot 관행" 규칙도 적용하지 않음.
- **대신 적용한 기준**: 기존 B1~B3 코드의 모양(짧은 한국어 주석 + FR 근거, 모듈 안 캐시 싱글턴 — `render/models.ts:12` 같은, `ponytail:` 표시 — `render/stage.ts:16`), overview 공통 규칙 3·4·5·8·10, 모듈 의존 방향, three.js/DOM 자원 정리, 테스트가 로직 파손을 실제로 잡는지(변이 시험).
- prettier/eslint 설정 파일 없음 → 줄 길이·포맷은 기존 코드 기준(B3의 `loader.ts:67` 169자 등 긴 줄이 이미 있음). `tsconfig.json`에 `noUnusedLocals`가 없어 별도로 `tsc --noUnusedLocals --noUnusedParameters`를 돌려 확인.
- 스펙 정합성은 validator PASS를 존중하여 다시 판정하지 않음. data-model.md는 필드 수준 정합성 확인용이라 modules.md·validator 보고서의 참조로만 봄. 범위 밖(T060 안전 상황 진입, T084 일시정지, T086 나머지 신호, T081 소리, T058 신호·횡단보도, T113 실제 기기)은 없다는 이유로 지적하지 않음.

## 태스크별 판정

| 태스크 | 판정 | 코드 품질 근거 |
|---|---|---|
| T030 controls 순수 | APPROVE | `src/input/controls.ts:9-30` 계약 시그니처 그대로, 경계 판정 `inside` 하나(`:11`)를 순수·DOM 양쪽이 같이 씀(중복 없음). 테스트가 브레이크 우선·경계 포함 변이를 잡음(아래 변이 시험 m3·m4) |
| T031 lifecycle | APPROVE | `src/platform/lifecycle.ts` 29줄, 방향 고정 API 없음. 기준 상수 자리값에 `ponytail:` 표시(`:3`, stage.ts:16과 같은 관례). `screen.orientation?.`(`:24`)로 구형 Safari 안전. 리스너 해제 없음은 앱 수명 동안 1번 다는 설계(flow.ts:175)라 문제 아님 |
| T032 controls DOM + CSS | APPROVE (제안 2·3) | 좌표 표 하나(`controls.ts:43`)와 `releaseAll` = 표 비우기(`:100-103`)로 "닿아 있던 손가락 무시"를 별도 무시 목록 없이 해결 — 단순함. 버튼 만들기는 DOM API + `setAttribute('aria-label')`(`:64-68`), 글 삽입 없음. `input → ui/screens.picture` import(`:2`)는 overview 의존 표에 `input` 자리가 없을 뿐 규칙 위반 아님(순수 폴더 아님, 새 파일보다 기존 도우미 재사용이 나음). CSS는 기존 `#ui`·`.big-button` 구역 아래에 구역 주석으로 정리(`style.css:56`, `:151`, `:205`, `:236`) |
| T033 탑승객 | APPROVE | `src/render/characters.ts` 38줄. 복제는 `cloneModel` 재사용(`:12`), 믹서는 객체 `userData`에 둬 객체와 함께 수거됨(`:17-19`). 실제 시간은 꾸밈 전용(`:6-7`, modules.md 9장) |
| T034 showroom | APPROVE | 목록별 Group을 한 번만 만들고 캐시(`showroom.ts:19`, `:38`). 진열 상수에 단위 주석(`:10-17`). 프레임마다 새 객체 할당 없음 |
| T035 pick 화면 | APPROVE | `src/ui/screens.ts:31-60` DOM API·`aria-pressed`, `replaceChildren`로 교체(B3 `showStart`와 같은 방식). 콜백 하나로 강조·다음 버튼 활성 처리 |
| T036 drivingLesson | APPROVE (제안 1) | `src/practice/drivingLesson.ts` 52줄 순수 함수, 받은 state를 고치지 않음. 단계 표 `NEXT`(`:12`)로 분기 단순. 다만 테스트가 두 분기를 잡지 못함(변이 m1·m2 생존) → 제안 1 |
| T037 townView | APPROVE | 마을 Group 한 번 생성(`townView.ts:43`), 차는 차종·인물이 바뀔 때만 다시 만듦(`:46-53`). 버린 차를 `dispose`하지 않는 것이 맞음: `cloneModel`이 geometry·재질을 원본과 공유하므로 dispose하면 준비된 원본이 깨짐 |
| T038 HUD | APPROVE | `src/ui/hud.ts` 52줄. 애니메이션 재시작용 강제 reflow(`:14-18`)에 이유 주석. 기어 표시는 바뀔 때만 다시 그림(`:35`) |
| T039 flow 연결 | APPROVE | 화면과 맞지 않는 입력 무시가 각 처리기 첫 줄 가드로 일관(`flow.ts:92`, `:96`, `:101`, `:173`). `requestGearToggle`을 flow와 lesson이 두 번 부르는 것(`:135`, drivingLesson.ts:32)은 events.md 6장이 flow에 "accepted === false 판단"을 맡긴 결과이며 순수 함수라 부작용 없음. 새 import 모두 사용됨(`tsc --noUnusedLocals` 결과 B4 파일 지적 0) |
| T040 E2E flow | APPROVE | `tests/e2e/flow.spec.ts` 화면 기록 관찰을 boot.spec.ts와 같은 방식으로 재사용(`:13-24`). 연타는 `evaluate` 안 동기 click 3번으로 실제 경쟁 조건을 만듦(`:58-62`) |
| T041 E2E touch | APPROVE | 계산된 스타일·합성 포인터·겹침 검사(`touch.spec.ts:34-106`). 해제 뒤 move 무시·새로 누름까지 한 흐름으로 확인(`:71-80`). 헤드리스 `env()` = 0 한계를 주석으로 밝힘(`:92`) |
| T042 렌더링 점검 | APPROVE | 콘텐츠 값 확정(`content/vehicles.ts:7-17`, `content/characters.ts:10-15`)에 결정 근거 주석. **파일 목록 밖 `src/render/models.ts:23-24`, `:27`** 변경은 T042 점검에서 드러난 T025 보장("차량 Z 길이 = bodyLength", assets.md 4장) 위반을 고친 최소 수정(인자 1개 + 주석 1줄)이고, 정점 순회는 모델 준비 때 8번뿐이라 실행 중 비용 없음. 구현 로그·기록에 이유가 있음 → 정당 |
| B3 제안 loader.test | APPROVE | `tests/unit/loader.test.ts:64-81` 임시 두 항목만 `has`로 확인, `finally`에서 `ASSET_URLS` 원복 → 다른 시험에 새지 않음 |

## 보안 (overview 공통 규칙 4·5)

| 검사 | 결과 |
|---|---|
| `src/**/*.ts|css`에서 `innerHTML|outerHTML|insertAdjacentHTML|eval(|new Function|getUserMedia|geolocation|requestPermission|DeviceMotionEvent|https?://|fetch(|<a |createElement('a')|.href` | `src/app/loader.ts:36` `fetch` 1건뿐(B3, `ASSET_URLS` 같은 출처 주소만). B4 파일 0건 |
| `index.html`에서 `<a`·`innerHTML`·`eval(`·외부 주소 | 0건 |
| `style.css`의 `url(`·`@import` | 0건(외부 글꼴·그림 요청 없음) |
| 화면 글 | B4는 글을 넣지 않음. 접근성 이름은 상수 문자열을 `setAttribute('aria-label')`로(`controls.ts:67`, `screens.ts:47`). `img.src`는 빌드 표의 주소만(`screens.ts:12`) |
| 순수 폴더(`sim·practice·pedestrianView·race·storage·content`)의 `three`·`document.`·`window.`·`performance.`·`Date.now`·타이머·`Math.random` | 0건. `practice/drivingLesson.ts`는 content·sim·practice만 import |
| 순수 폴더 → `input|ui|render|app|audio|platform` import | 0건 |
| 권한 API·기기 식별 | 없음 |

## 불필요 코드

- `tsc --noEmit --noUnusedLocals --noUnusedParameters`: 지적 2건 모두 B4 이전 코드 — `src/app/flow.ts:54` `storageOk`(T065에서 쓴다고 주석, B3 reviewer가 이미 판단), `tests/unit/content.test.ts:163`(B3). B4 파일의 미사용 import·변수 0건.
- 디버그 코드: `console.`·`debugger`·`TODO|FIXME` — B4 파일 0건(`tests/e2e/boot.spec.ts:58` console.log는 B3 기존).
- 주석 처리된 코드 없음. 새 도우미는 `hud.ts:11` `div`(파일 안 3번 사용), `controls.ts:11` `inside`(2곳 사용) 둘뿐이고 src의 기존 도우미와 겹치지 않음. 그림 도우미는 기존 `ui/screens.ts:4` `picture`를 재사용.
- 사소: `style.css:68-70` `#controls[hidden] { display: none; }`은 `#controls`가 `display`를 정하지 않아 브라우저 기본 `[hidden]` 규칙과 같은 효과(제안 3).

## 변경 범위

| 파일 | 태스크 | 판단 |
|---|---|---|
| 신설 11개(controls·lifecycle·drivingLesson·characters·showroom·townView·hud·테스트 4) | T030~T041 | 태스크 파일 목록 그대로 |
| `src/app/flow.ts`, `src/ui/screens.ts`, `src/style.css` | T039, T035, T032 | 목록 그대로. screens.ts는 B3의 `picture`·`showStart`(`:4-25`)를 건드리지 않고 `showPick`만 추가 |
| `src/render/stage.ts:10-13`, `:41`, `:55`, `:64-68` | T034·T037이 쓰는 렌더러 내부 진입점(구현 로그 "T024 보충") | modules.md 9장 "렌더러 내부 구조는 구현 재량", 계약 세 멤버 그대로, flow는 부르지 않음. B3의 `follow`와 같은 방식 → 정당 |
| `src/render/models.ts:23-24`, `:27` | T042가 찾은 T025 결함 수정 | 위 표 T042 → 정당 |
| `src/content/vehicles.ts`, `src/content/characters.ts` | T042 | 목록 그대로 |
| `tests/unit/loader.test.ts` | B3 제안 | 정당 |
| `contracts/modules.md` 178행 1줄 | Q1 사용자 결정 | `git diff` 확인 1줄 추가뿐 |
| `tasks.md` | B3까지 체크 | `git diff` 확인: T001~T029 체크 표시 29줄만, 다른 내용 변경 0 |
| `.gitignore`, `SHA256SUMS` diff | B1(T006 등) | B4 변경 아님 |
| `records/tooling-and-render.md` O2 절, `records/img/t042-*.png` 2장 | T042 기록(D1·D8) | 정당 |

## 자원 정리 (three.js·DOM)

- 리스너: `mountControls`(`controls.ts:73-92`), `watchLifecycle`(`lifecycle.ts:22-27`), `createStage`(B3)는 앱 수명 동안 1번만 붙임(계약 "두 번 호출은 프로그램 오류", flow.ts:172-177). 해제가 없어도 누수 아님.
- 버리는 3D 객체는 townView의 이전 차·탑승객뿐(`townView.ts:47`). geometry·재질은 준비된 원본과 공유 → dispose하지 않는 것이 맞음. AnimationMixer는 `userData`에만 있어 객체와 함께 수거됨.
- 캐시: 진열 Group 2개·마을 Group 1개를 한 번 만들고 `stage.show`가 `visible`만 바꿈(`stage.ts:64-68`). 화면을 오가도 늘지 않음.
- 프레임마다: `stage.follow`는 `lookAt` 벡터 재사용(B3). `renderShowroom`·`renderTown`은 숫자 대입과 짧은 문자열 키(`townView.ts:45`) 정도라 GC 부담 없음. `animateCharacters`의 `traverse`는 지금 마을 규모에서 문제없음.

## 테스트 품질 — 변이 시험

저장소 밖 복사본(`scratchpad/mut-*`, node_modules는 심볼릭 링크)에서 한 줄씩 바꿔 해당 단위 테스트를 돌림.

| # | 바꾼 곳 | 의미 | 결과 |
|---|---|---|---|
| m1 | `drivingLesson.ts:31-34` 앞 단계에서도 멈춘 채 탭이면 기어 전환(lessonDone은 후진 단계에서만) | modules.md 4.3 "후진 탭" 행(Q1 결정) 위반 | **생존** — 5 passed |
| m2 | `drivingLesson.ts:40`에서 `state.drive.speed > 0` 제거 | "움직이던 차를 브레이크로 0" 위반(멈춘 뒤 브레이크만 눌러도 통과) | **생존** — 5 passed |
| m3 | `controls.ts:27` `&& !brake` 제거 | 브레이크 우선 위반 | 잡힘 — 1 failed(SC-004 20회) |
| m4 | `controls.ts:11` 경계 미포함 | 경계 포함 위반 | 잡힘 — 1 failed |

- m1이 중요한 이유: `drivingLesson.ts:21-22`의 끝 판별 "후진 단계 ∧ 기어 reverse"는 "앞 단계에서 기어가 안 바뀐다"는 불변식에 기댐(주석에도 적혀 있음). 이 불변식이 깨지면 후진 단계에 들어서자마자 끝난 것으로 판별되어 `lessonDone` 없이 멈춤(아이가 빠져나올 수 없음). 지금 코드는 맞고 validator가 저장소 밖 임시 시험으로 확인했지만, 그 확인이 저장소 테스트에 남아 있지 않음. 기존 `drivingLesson.test.ts:73`, `:75`는 탭을 매 틱 주거나(짝수 번 전환으로 가려짐) 단계 값만 봐서 이 경우를 잡지 못함.
- 그 밖: tasks.md T036이 요구한 시험 항목(시작 hint, 순서, lessonDone 1회 뒤 no-op, 무입력 repeat, 실패·시간제한 없음)은 모두 있음. 그래서 필수 수정이 아니라 제안 1로 둠.

## 개선 제안 — 승인 조건 아님

1. **(우선 권장) `tests/unit/drivingLesson.test.ts` 두 분기 고정.** "그 단계의 조작이 없으면 넘어가지 않는다" 시험(`:71-84`)에 아래 정도를 더하면 m1·m2가 잡힘. 소스 변경 없음.
   ```ts
   // 후진 단계 전 멈춘 채 후진 탭 1번 → 기어 그대로 (modules.md 4.3 "후진 탭")
   expect(stepDrivingLesson(startDrivingLesson().state, IDLE, true).state.drive.gear).toBe('forward');
   // 자연 감속으로 선 뒤 브레이크만 → 통과 아님 ("움직이던 차를 브레이크로 0")
   expect(run(coasted, BRAKE, 1).state.step).toBe('brake');
   ```
   (가능하면 액셀·브레이크 단계에서도 멈춘 채 탭 1번 → `forward` 확인.) 다음 묶음에 함께 넣어도 됨.
2. **`src/input/controls.ts:47-52` 사각형 측정이 CSS transform을 포함함.** `getBoundingClientRect`는 눌린 버튼의 `translateY(3px)`(`style.css:95`)와 재안내 시범의 `scale(0.9)`(`style.css:147`)까지 반영함. 시범 애니메이션 도중 누르면 줄어든 사각형이 다음 `pointerdown`까지 쓰여 가장자리 몇 px가 빠질 수 있음. `#controls`가 `inset: 0` 고정이라 `el.offsetLeft/offsetTop/offsetWidth/offsetHeight`(transform 무시한 배치 상자)로 재면 같은 줄 수로 해결됨. 영향이 작아 T113 기기 점검 때 판단해도 됨.
3. **`src/style.css:68-70` `#controls[hidden]` 규칙은 브라우저 기본 동작과 같아 지워도 됨.** 해는 없음(방어용으로 둬도 무방).

참고(조치 불필요): `render/townView.ts:2`의 `import type { PlaySession } from '../app/flow'`는 계약(modules.md 9장 `renderTown` 시그니처, 12장 소속)이 정한 타입이고 `import type`이라 실행 순환 없음.

## 검토 중 사고 (보고)

- 무엇: 첫 변이 시험 명령에서 `rm -rf <scratch>`가 실패해 `&&`로 이어진 `cd <scratch>`가 실행되지 않았고, 다음 줄의 m2 변이 스크립트가 PROJECT_ROOT에서 실행되어 **`src/practice/drivingLesson.ts:40` 한 줄이 m2 내용으로 바뀜**. 같은 명령의 첫 vitest 결과(5 passed)는 바뀌기 전 저장소에서 돈 것이라 변이 결과로 쓰지 않음.
- 조치: 다음 명령에서 m2 문자열이 정확히 1번 있고 원래 문자열이 없음을 확인한 뒤 원래 줄로 되돌림 → `review-snapshot.py` = `bc724ea7…39a0`(요청값) → 바이트 단위로 원상 복구 확인. 이후 변이 시험은 경로가 `/private/tmp/`로 시작하는지 단언하는 스크립트로만 복사본에서 실행했고, 매번 저장소 snapshot이 그대로임을 확인함. typecheck·전체 단위·build를 다시 돌려 통과, 빌드 JS 해시가 사고 전 빌드와 같음(`index-CzJGAWP4.js`).
- 영향: 바뀐 상태는 약 1분 동안 있었고 그 사이 다른 작업자가 이 파일을 쓰지 않았다는 것은 리더가 확인해 주기 바람. 이 보고서의 판정은 요청 revision의 코드에 대한 것.

## 직접 실행 기록 (PROJECT_ROOT)

| 명령 | 종료 코드 | 결과 |
|---|---|---|
| `python3 ivi-agent-guide/scripts/review-snapshot.py <PROJECT_ROOT> <FEATURE_DIR>` (읽기 전) | 0 | `bc724ea7…39a0` = 요청값 |
| `npm run typecheck` | 0 | 오류 없음 |
| `npm test` | 0 | 9 files, 84 passed |
| `npm run build` | 0 | JS 647.49 kB(gzip 165.39 kB), 500 kB 청크 경고(승인된 단일 청크 결정, B3와 같음) |
| `npx tsc --noEmit --noUnusedLocals --noUnusedParameters -p tsconfig.json` | 1 | 2건, 모두 B4 이전 코드(위 "불필요 코드") |
| 위 "보안" 표의 grep 묶음 | — | 기대대로(B4 파일 0건) |
| `git diff -- .gitignore SHA256SUMS contracts/modules.md` / `git diff tasks.md` 줄 요약 | 0 | 위 "변경 범위" |
| `python3 -I scratchpad/mutate.py`(저장소 밖 복사본, `npx vitest run <파일>`) | — | m1·m2 생존, m3·m4 잡힘 |
| snapshot (사고 복구 직후, 변이 시험 뒤) | 0 | 둘 다 `bc724ea7…39a0` |
| `npm run typecheck` / `npm test` / `npm run build` (복구 뒤 재실행) | 0 / 0 / 0 | 오류 없음 / 9 files 84 passed / 같은 JS 해시 `index-CzJGAWP4.js` |
| snapshot (테스트 후) | 0 | `bc724ea7…39a0` = 요청값 |

- E2E(`npm run test:e2e`)는 실행하지 않음: 요청서상 선택 항목이고, 코드 품질 판단(리스너 수명·자원 공유·테스트 구성)에 브라우저 실행이 필요하지 않았음. validator가 같은 코드로 flow 4 passed·touch 10 passed를 기록함(task-B4_validation.md:22-23).
- 검토자가 쓴 파일: 이 보고서 하나(사고로 바뀐 1줄은 원래대로 되돌림). 저장소 밖 임시 파일: `scratchpad/mutate.py`, `scratchpad/mut-*`, `scratchpad/*.log`.
