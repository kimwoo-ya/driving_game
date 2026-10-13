# 도구 동작·모델 렌더링 점검 기록

- 대상: plan O8(도구 동작 확인), O2·O3(모델 렌더링 점검)
- 환경: macOS (Darwin 25.6.0), Node v24.19.0, npm 11.17.0

## O8 도구 동작 확인

| 날짜 | 태스크 | 확인 항목 | 명령 | 종료 코드 | 결과 |
|---|---|---|---|---|---|
| 2026-10-12 | T003 | TypeScript 7.0.2 + tsconfig 조합 | `npm run typecheck` (`tsc --noEmit`, `npx tsc --version` = 7.0.2) | 0 | 통과. 6.0.3으로 내릴 필요 없음 |
| 2026-10-12 | T004 | `base: '/driving_game/'` 빌드 | `npm run build`, `grep -c '/driving_game/assets/index-' dist/index.html` | 0, 0 | 빌드 통과, 일치 1줄 |
| 2026-10-12 | T005 | `vite preview` 하위 경로 제공 | `npm run test:e2e` (`boot.spec.ts` ①, 두 프로젝트) | 0 | `http://localhost:4173/driving_game/`에서 `data-screen=boot`, 404 없음 |
| 2026-10-12 | T005 | Playwright WebKit headless WebGL2 | `npm run test:e2e` (`boot.spec.ts` ②) | 0 | chromium: true, webkit: true. 3D 시험을 Chromium으로 제한하는 규칙은 필요 없음 |
| 2026-10-12 | T022 | Vitest(node)에서 `import.meta.glob` + `?url` | `npm test -- tests/unit/loader.test.ts` | 0 | 동작함. 키 8개 모두 있고 값은 Vite 개발 서버 경로 문자열. 대안·`@types/node` 불필요 |
| 2026-10-12 | T023 | GLB 내용 읽기(#14) | `npm test -- tests/unit/content.test.ts` | 0 | `?inline`은 .glb에서 Vite가 거부. 같은 `import.meta.glob`을 `?raw`로 읽고 JSON 청크를 괄호 짝으로 잘라 animations 이름 확인(새 의존성 없음) |
| 2026-10-12 | T028 | 하위 경로 로딩 → 시작 화면 | `npm run test:e2e -- tests/e2e/boot.spec.ts` | 0 | 두 엔진 모두 boot → loading → start, 새로 고침 뒤 같은 순서, 외부 요청 0. 8 passed |

## O2 모델 렌더링 점검 (T042)

- 날짜: 2026-10-12. 방법: Vite 개발 서버 + Playwright Chromium에서 준비된 모델(`preparedModel`)을 정사영 위 시점·옆·운전 카메라 시점으로 그려 직접 봄(검사 스크립트는 저장소 밖 임시 폴더). 탑승객 15조합은 `npm run test:e2e -- tests/e2e/flow.spec.ts`가 남기는 `test-results/flow-*/passenger-<차량>-<인물>.png`(실행마다 새로 만듦)를 잘라 모은 [t042-passengers-15.png](img/t042-passengers-15.png)로 확인
- 정한 값: `src/content/vehicles.ts`의 `yawDeg`·`seats`, `src/content/characters.ts`의 chicken-guy `yawDeg`

| 항목 | 결과 |
|---|---|
| 차량 방향(`yawDeg`) | 버기 90(원본 앞쪽 −X, 엔진·큰 바퀴가 뒤), 트럭 73(원본이 X축에서 약 17° 비스듬함. 정점 기준 상자 폭/길이 최소 각 0.5° 간격 탐색 = 73°), 지프·왜건·바나나 자동차 0(원본 앞쪽 +Z, 운전대·손잡이 위치로 확인). 위 시점: [t042-vehicles-top.png](img/t042-vehicles-top.png)(화면 위 = 앞) |
| 차량 크기 | 다섯 대 모두 Z 길이 = `DRIVING_SPEC.bodyLength` 2.4 m. 트럭처럼 비스듬한 원본은 geometry 상자로 재면 길이·중심이 어긋나 `src/render/models.ts`에서 차량만 정점 기준 상자(`setFromObject(root, true)`)로 바꿈 |
| 인물 방향·크기 | 세 인물 모두 원본 앞쪽 +Z(부리·안경·얼굴 위치) → `yawDeg` 0 확정. 키 1 m 정규화, 탑승객 0.8 m·진열 1.6 m로 크기 조절 |
| 왜건 음영 | 노멀이 없어 GLTFLoader가 재질 3개 모두 `flatShading: true`로 켬. 조명 아래 면이 구분되어 보임 |
| 버기 합치기 | 원본 오브젝트 101개 → 재질별 합친 뒤 메시 12개, 그리기 호출 12(검사용 축·격자 제외) |
| 캐릭터 복제·동작 | 세 인물 모두 `SkeletonUtils.clone` 복제본에 `clips.idle` 재생: 팔을 내린 기본 자세로 움직임(묶기 전 T자세 아님). 차량 위 탑승객·진열 모두 같은 결과 |
| Chicken Guy 기존 경고 4건 | 리깅 기록의 glTF 검사 경고(스킨 메시 부모·로컬 변환)는 게임에서 0.8 m·1.6 m 크기 조절, 복제, `Armature|Idle` 재생 중 모양 깨짐 없음. 조작 익히기 진입 후 2초 동안 브라우저 콘솔 경고·오류 0(드라이버 성능 메시지 제외) |
| 탑승객 좌석(`seats[0]`) | 운전석이 있는 차는 옆자리: 버기 (−0.17, 0.3, 0.15), 지프 (0.18, 0.4, −0.18). 왜건·바나나 자동차는 가운데 (0, 0.6, 0). 트럭은 운전석이 막혀 안에 앉히면 보이지 않음 → 사용자 결정(2026-10-12, 선택지: 유리 반투명 / 짐칸 / 지붕 위)으로 **머리가 지붕 위로 보이게** 가운데 (0, 0.6, 0). 키는 모두 0.8 m |
| 차량 5 × 인물 3 탑승객 보임 | **15/15** — 운전 카메라 시점에서 모두 고른 인물이 보임(지프는 스페어 타이어·롤바 너머로 머리·몸 위쪽). `Sit` 자세 고정은 필요 없다고 판단 |

## O3 Chicken Guy 자세 점검 (T061, SC-032 렌더링 점검)

- 날짜: 2026-10-12. 방법: Vite 개발 서버 + Playwright Chromium에서 `pedestrianObject()`(키 1.2 m) 두 개를 앞모습·옆모습으로 가까이 그리고 `setPose`로 자세를 바꿔 찍음(점검 페이지는 저장소 밖 임시 폴더). 운전 화면에서는 보행자가 작아 자세 판단이 어려워 따로 찍음
- 결과 그림: [t061-chicken-guy-poses.png](img/t061-chicken-guy-poses.png) — 위 왼쪽 가만히(idle), 위 오른쪽 왼쪽 보기, 아래 왼쪽 오른쪽 보기, 아래 오른쪽 손 들기. 각 칸 왼쪽 = 앞모습, 오른쪽 = 옆모습
- 정한 값(`src/render/characters.ts`): `LOOK_YAW` π/3, 들 손 = 인물의 오른손(`RAISED_HAND = 'HandL'`), `RAISED_Y` 0.92, `RAISE_OUT` 1.4

| 항목 | 결과 |
|---|---|
| 관절 구조 | 팔 없이 `HandL`·`HandR`·`FootL`·`FootR`가 `CORE`에 바로, `Head`는 `Body` 아래. 손 이름은 거울 방향: 앞을 +Z로 둘 때 `HandR`이 +X = 인물의 왼손 |
| 왼쪽 보기 | 예 — `Head` Y축 +60°, 앞모습에서 얼굴이 인물의 왼쪽(화면 오른쪽)으로 돌아감 |
| 오른쪽 보기 | 예 — `Head` Y축 −60°, 얼굴이 인물의 오른쪽(화면 왼쪽)으로 |
| 손 들기 | 예 — 처음 자리값(손 높이를 머리 관절 국소 좌표와 비교)은 손이 가슴 높이에 그쳐 손 든 모습으로 안 보였음. 손 위치를 인물 좌표 키의 0.92(머리 상자 위)·옆으로 1.4배로 옮기도록 고친 뒤 앞·옆 모두 머리 위로 든 손이 보임 |
| 들 손 | 인물의 오른손으로 정함. 안내 문구는 어느 손인지 말하지 않음(FR-095) |
| 클립 | `Armature|Idle`·`Armature|Walk`만 재생, `Sprint`·`Jump` 재생 없음(FR-094). 점검 중 브라우저 오류 0 |
| SC-032 렌더링 점검 | **왼쪽 보기·오른쪽 보기·손 들기 3/3** |

### 실제 안내 카드 화면 (2026-10-13, US2 검증 지적 반영)

- 처음 기록은 인물만 따로 찍어 태스크가 요구한 A11·A14-A15 카드 화면이 아니었음. 그 화면에서는 카메라(높이 2.2 m, 주인공 4.6 m 뒤)가 주인공을 카드 글 밑에 두어 고개 돌리기가 거의 가려졌음(task-US2_validation.md)
- 고친 것: 안내 카메라를 문서대로 아이 눈높이 1 m, 주인공 오른쪽 어깨 뒤(걷는 방향 뒤 2.2 m·오른쪽 1.2 m)로(`scenarios.ts` 세 상황), 카드 겹침을 화면 오른쪽으로(`style.css`) → 주인공은 화면 왼쪽
- 방법: 저장소 밖 복사본에만 "그 상황·카드·틱에 멈추는" 진입점을 더해 932×430(T062와 같은 크기)으로 crossing-check 안내를 찍음. 렌더러·겹침·CSS·데이터는 저장소와 같음
- 결과 그림: [t061-card-screens.png](img/t061-card-screens.png) — 위 왼쪽 A11 왼쪽 보기(10틱), 위 오른쪽 A11 오른쪽 보기(90틱), 아래 왼쪽 A11 다시 왼쪽 보기(170틱), 아래 오른쪽 A14-A15 손 들기

| 항목 | 결과 |
|---|---|
| A11 왼쪽 보기 → 오른쪽 보기 → 다시 왼쪽 보기 | 예 — 카드에 가리지 않음. 왼쪽 보기는 머리 왼쪽 옆면의 눈, 오른쪽 보기는 눈·부리가 카메라 쪽으로 보임 |
| A14-A15 손 들기 | 예 — 인물의 오른손이 머리 옆 위로 보이고 카드에 가리지 않음 |
| 다른 두 상황 안내 화면 | signal-wait(A6)·turning-car(A22)도 주인공이 화면 왼쪽, 보행자 신호가 보임 |
| SC-032 실제 카드 화면 | **3/3** |
