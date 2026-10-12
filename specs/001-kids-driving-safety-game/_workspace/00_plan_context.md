# 00 Plan Context — plan 단계 공유 컨텍스트

- 작성일: 2026-10-12
- 단계: plan (Spec Kit `/speckit-plan`, 오케스트레이터 `spec-plan-orchestrator`)
- PROJECT_ROOT: `/Users/kyw/Documents/git/mine/driving_game`
- FEATURE_DIR: `specs/001-kids-driving-safety-game/`
- 이 파일은 리더가 작성한 공유 메모입니다. 아래 "먼저 읽을 원문"이 이 메모보다 우선합니다.

## 1. 먼저 읽을 원문 (역할 파일보다 우선)

1. `/Users/kyw/Documents/git/mine/driving_game/AGENTS.md` — 프로젝트 지침. **역할 파일(.claude/agents/*.md)을 적용하기 전에 읽는다.** IVI 전용 기술 규칙(Java/Spring, JPA, Lombok, Maven, REST Controller, 쿠폰 예제, repomix)은 이 프로젝트 기준이 아니다.
2. `/Users/kyw/Documents/git/mine/driving_game/docs/PRD.md` — 사용자 확인 완료 제품 범위. **수정 금지.**
3. `/Users/kyw/Documents/git/mine/driving_game/GLOSSARY.md` — 용어 기준.
4. `/Users/kyw/Documents/git/mine/driving_game/specs/001-kids-driving-safety-game/spec.md` — FR-001~097, SC-001~032, Key Entities, 주요 상태 흐름, "보행 안전 규칙 배정" 표(38문구). **수정 금지** (공백·모순은 보고서에 적어 리더에게 넘긴다).
5. `/Users/kyw/Documents/git/mine/driving_game/.specify/memory/constitution.md` — **빈 템플릿. 사용자 결정(2026-10-12, 토이 프로젝트)으로 constitution 없음.** Constitution Check는 "해당 없음(사용자 결정)"으로 적고, 자리표시자를 규칙으로 쓰지 않는다.
6. 참고(선택): `_workspace/01_domain-analyst_analysis.md`(엔티티 22·상태 전이 11·BR 45), `_workspace/01_edge-analyst_analysis.md`(EC 79·CONC 7), `_workspace/01_functional-analyst_analysis.md`, `_workspace/02_pedestrian-safety-rules-research.md`(규칙 출처 S1~S20).
7. plan 양식: `/Users/kyw/Documents/git/mine/driving_game/.specify/templates/plan-template.md`

## 2. 역할 파일 치환 기준

| 역할 파일의 전제 | 이 프로젝트에서 대신 할 것 |
|---|---|
| Java/Spring 계층(Controller/Service/Repository) | TypeScript 모듈 구조(아래 승인 스택), 실제 요구사항 |
| JPA 엔티티·DB 스키마·인덱스·마이그레이션 | 게임 state, 엔티티 관계, 브라우저 저장 형식(저장 3항목 + 형식 버전), 저장 형식 버전 변경 시 처리 |
| REST API·엔드포인트·HTTP 상태코드 | 모듈 인터페이스(TypeScript 타입 시그니처), 게임 이벤트, 에셋 목록·형식, 브라우저 저장 형식, 정적 파일 경로(GitHub Pages 하위 경로) |
| 인증/인가·OWASP | 개인정보 미수집, 외부 요청·외부 링크 없음, 저장 데이터 변조 시 동작, 출처·라이선스 표시 |
| `mvn compile`/`mvn test` | 아래 승인 스택의 실제 명령(예: `npm run build`, `npx vitest run`, `npx playwright test`) — plan에서 확정 |

서버·DB·REST를 양식에 맞추려고 추가하지 않는다.

## 3. 사용자가 승인한 기술 결정 (2026-10-12)

| 항목 | 결정 |
|---|---|
| 3D 엔진 | three.js |
| 언어·빌드 | TypeScript + Vite |
| 자동 테스트 | Vitest(규칙·계산 로직) + Playwright(브라우저: 하위 경로 로딩, 모바일 화면) |
| 배포 | GitHub 공식 Pages 워크플로(GitHub Actions) |
| 모델 | poly.pizza 배포 페이지가 제공하는 GLB를 받아서 사용. `modeling/` ZIP 원본은 그대로 보존 |

리더가 정한 기본값(추가 의존성 없음, 바꾸려면 사유를 적어 리더에게 제안):

- 화면 UI: 일반 HTML/CSS(DOM) 오버레이. UI 프레임워크 없음.
- 차량 움직임: 물리 엔진 없이 고정 시간 간격(fixed timestep)으로 직접 계산. FR-022·SC-002(화면 갱신 속도와 무관한 결정적 주행), FR-011(차량 간 동일 성능·판정)을 위해.
- 소리: Web Audio API. 저장: localStorage.
- 받은 GLB는 저장소에 넣어 같은 출처로 제공. **실행 중 poly.pizza 등 외부 주소로 요청하지 않는다**(FR-085, 가용성).

의존성 규칙: 새 라이브러리는 이유를 적는다. 버전은 정확한 버전으로 적고, 2주 이상 지난 버전을 고르며 근거(`npm view <pkg> time` 등)를 남긴다. **설치·스캐폴딩·`npm init`은 하지 않는다**(승인 전 금지, AGENTS.md).

## 4. GLB 실측 사실 (리더가 2026-10-12 내려받아 확인, 파일은 리더 scratchpad에만 있음)

| 모델 | GLB 주소 | 크기 | 만든 도구 | 노드/메시/프리미티브 | 정점 | 재질/이미지 | 뼈대·동작 | 기타 |
|---|---|---|---|---|---|---|---|---|
| 버기 | https://static.poly.pizza/8036e526-b08a-4d8c-a4b3-0214097cbc18.glb | 614 KB | obj2gltf | 101/101/162 | 12,818 | 12/0 | 없음 | 그리기 호출 많음, 바퀴 이름 없음 |
| 지프 | https://static.poly.pizza/1c0f14fb-d3db-41e8-941b-f10fb7aa9681.glb | 139 KB | FBX2glTF 0.9.7 | 2/1/8 | 3,642 | 8/0 | 없음 | 단일 메시, 바퀴 분리 안 됨 |
| 트럭 | https://static.poly.pizza/0674a45b-d617-4e7d-91c2-56bbed93230b.glb | 266 KB | obj2gltf | 21/21/28 | 6,800 | 6/0 | 없음 | 바퀴 이름 없음 |
| 왜건 | https://static.poly.pizza/34b817d5-a238-4720-bc18-f065367eacda.glb | 75 KB | obj2gltf | 1/1/3 | 2,768 | 3/0 | 없음 | **노멀 없음(3/3)**, 단일 메시 |
| 바나나 자동차 | https://static.poly.pizza/834b3d40-b61f-411b-b63b-2adf51bc15c9.glb | 260 KB | obj2gltf | 19/19/19 | 2,501 | 8/1 | 없음 | 바퀴 노드 `tire`,`tire_2`,`tire_3` 등 이름 있음 |
| Chicken Guy | https://static.poly.pizza/356751e5-10d4-4fec-8b35-68e2f09cab47.glb | 283 KB | FBX2glTF 0.9.7 | 31/2/2 | 2,825 | 1/1 | 뼈대 2, 동작 `Grounded`,`Idle`,`Jump`,`Sprint`,`Walk` | 관절 `Head`, `Hand.L`, `Hand.R`, `Foot.L/R` 등 → 손 들기·고개 돌리기를 코드로 자세 조정 가능 |
| Cool Bannana Guy | https://static.poly.pizza/0be17c6d-4b23-4dbf-b5fa-ea0ed7ad58b8.glb | 789 KB | FBX2glTF 0.9.7 | 2/1/1 | 2,824 | 1/1 | 없음 | 단일 정적 메시 |
| Turtle | https://static.poly.pizza/230aeead-8c15-470e-8feb-778cbae907a9.glb | 61 KB | obj2gltf | 1/1/4 | 1,586 | 4/0 | 없음 | 단일 정적 메시 |

- 8종 합계 약 2.5 MB. 압축 확장(Draco, meshopt) 사용 없음 → 기본 GLTFLoader로 읽힘.
- 메시 좌표 크기 단위가 모델마다 크게 다름(예: 바나나 자동차 약 800, 지프 약 0.05, 버기 약 3.6). 크기·방향·바닥 높이 정규화 필수(PRD "개발 시 확인할 사항").
- 라이선스(배포 페이지 표기, 2026-10-12): Cool Bannana Guy CC0, 나머지 7종 CC BY 3.0. poly.pizza GLB는 원작자 파일을 poly.pizza가 형식 변환한 것이므로 크레딧의 "변경 사실"에 형식 변환과 게임 내 크기·방향 조정을 적어야 한다(FR-088).
- spec·PRD는 "ZIP 원본"을 기준으로 적혀 있다. GLB 사용으로 PRD 문구 보완이 필요하면 보고서의 "리더에게 넘길 항목"에 적는다(직접 수정 금지).

## 5. plan에서 결정하거나 제안할 열린 항목

(PRD "개발 중 결정할 항목", spec Assumptions, 인수인계 메모에서 모음)

1. 모델 정규화 방법: 실행 시 계산(Box3 등) vs 미리 처리한 파일. 왜건 노멀, 버기 메시 합치기, 외형과 무관한 동일 충돌 판정(FR-011).
2. 바퀴 수(1/2)·약 5분 기준(SC-011)을 맞출 트랙 조정 방법, 모바일 성능 목표(SC-024) 측정 방법, 바퀴 회전 표현(바퀴 분리는 바나나 자동차만 확실).
3. "정지" 판정(페달을 떼면 자연 감속하는지), 고정 시간 간격 주행, 허용 오차(SC-002).
4. 배포 갱신 직후 파일 섞임 방지, 하위 경로 로딩(FR-002), 로딩 실패·다시 시도(FR-004).
5. 사람 모델 동작 표현: 걷기·손 들기·좌우 보기(FR-039, FR-096). Chicken Guy는 관절이 있고 나머지 둘은 정적 메시. 보행자 시점 안내는 "그림과 음성"(FR-041)이라는 점도 고려.
6. 인물 선택 화면(FR-097), 탑승객 배치(차종별 공간), 아이 차량에 탑승객을 보여 줄지(콘텐츠 설계 몫이지만 기술 제약을 적는다).
7. 테스트 방법 구분: 자동 테스트 / 브라우저 확인 / 실제 기기 / 어린이 관찰(AGENTS.md). 실제 명령 확정.
8. **콘텐츠 작업 분리**: 마을 장면 요소(FR-092), 규칙 문구 38개와 그림, 안내 음성, 배경음악 선정은 작업량이 크다. 코드 구조와 별도 단계·별도 데이터로 나누는 것을 권장(사용자에게도 안내됨).

결정이 구조에 영향을 주는데 위 승인 범위를 넘으면 **혼자 확정하지 말고** "사용자 결정 필요" 항목으로 보고서에 올린다(공용 실수 기록의 plan 단계 교훈).

## 6. 출력 규칙

- 한국어로 작성. 코드 식별자·라이브러리 이름은 원문 그대로.
- 각자 지정된 파일 하나만 `FEATURE_DIR/_workspace/`에 쓴다. 다른 파일은 만들거나 고치지 않는다.
- 응답 첫 줄에 "AGENTS.md를 읽었고 IVI 기술 규칙 대신 이 프로젝트 기준을 적용함"을 적고, 이어서 역할 파일이 요구하는 `[Speckit-Context]` 요약을 출력한다.
- 보고서 끝에 "리더에게 넘길 항목"(spec·PRD 공백, 사용자 결정 필요 사항, 다른 담당과 맞춰야 할 이름) 섹션을 둔다.
- 사실 주장에는 근거(파일 경로:줄, 공식 문서 URL)를 붙인다. 확인하지 못한 것은 "미확인"으로 적는다.
