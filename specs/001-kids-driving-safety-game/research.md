# Research: 아동용 3D 운전·보행 안전 게임 — 첫 버전

- 작성일: 2026-10-12 | 관련: [plan.md](./plan.md), [spec.md](./spec.md), [data-model.md](./data-model.md), [contracts/](./contracts/overview.md)
- 조사 방법:
  - npm 레지스트리 조회(`npm view <pkg> time --json`, `npm view <pkg>@<ver> peerDependencies engines`, 설치 없음)
  - GitHub API 조회(액션 릴리스, 저장소 상태)
  - 공식 문서(vite.dev, docs.github.com, MDN, playwright.dev, three.js 위키·r186 소스)
  - poly.pizza GLB 8개 헤더 직접 판독(세션 임시 폴더에서 하고, 저장소에는 넣지 않음)
  - GitHub Pages 응답 헤더 실측(`curl -sI`)
- 버전 선택 기준: 2026-10-12 기준 2주 이상 지난 정식 버전(게시일 2026-09-28 이전).
- 최종 결정은 plan.md와 같습니다. 처음 가정에서 바뀐 항목은 바뀐 결과만 적습니다.
- 후속 작업(2026-10-12): Blender 5.2.2 LTS와 Blender Lab 공식 MCP를 설치하고 Cool Bannana Guy·Turtle 리깅 및 GLB 저장을 완료했습니다. 모델 단위 검사·파일·원본 해시는 [리깅 작업 기록](_workspace/03_character-rigging.md)을 따릅니다.

---

## 1. 기술 선택

### 1.1 3D 엔진

- **Decision**: three.js `three` 0.186.1(WebGLRenderer, WebGL2). GLTFLoader·SkeletonUtils·BufferGeometryUtils는 같은 패키지의 `three/addons/*`를 씁니다. 타입은 `@types/three` 0.186.0.
- **Rationale**:
  - 사용자 승인 스택입니다(2026-10-12).
  - 0.186.1은 2026-09-24 게시로 2주 기준을 충족합니다.
  - package.json `exports`에 `./addons/*`가 있어 추가 의존성이 필요 없습니다(jsdelivr `three@0.186.1/package.json`).
  - three는 자체 타입이 없습니다(`npm view three@0.186.1 types` 결과 없음). `@types/three` 0.186.0(2026-09-11)이 짝입니다.
  - r163부터 WebGL1 지원이 빠져 WebGL2가 필수입니다.
- **Alternatives considered**: WebGPURenderer(모바일 Safari·Chrome 지원 폭이 WebGL2보다 좁아 첫 버전 목표에 맞지 않음), 0.186.0(같은 줄기의 이전 수정판).

### 1.2 언어·빌드

- **Decision**: TypeScript 7.0.2(타입 검사 `tsc --noEmit` 전용, 막히면 6.0.3) + Vite 8.3.1. 빌드 도구는 Node.js 24 LTS로 실행합니다. 2026-10-20 이후 Vite 8.3.3 이상으로 올리기 전까지 `--host`는 금지합니다.
- **Rationale**:
  - TypeScript 7.0.2는 2026-07-08 게시이며 `latest` 태그입니다. Go 기반 네이티브 컴파일러라 공개 JS API가 없습니다(`npm view typescript@7.0.2`에 `main` 필드가 없고 플랫폼별 바이너리 패키지만 의존). 이 프로젝트는 API를 쓰는 도구(타입 기반 eslint 규칙, vue-tsc 등)를 쓰지 않으므로 타입 검사만으로 충분합니다.
  - Vite 8.3.1은 2026-09-24 게시입니다. 8.3.2(10-01), 8.3.3(10-06), 8.3.4(10-08)는 2주 미만입니다.
  - 8.3.3에는 개발 서버 전용 보안 수정 3건이 들어 있습니다(2026-10-06 게시). 이 중 GHSA-rq7h-c2jc-7f22는 `--host`나 `server.host`로 개발 서버를 네트워크에 열었을 때만 해당하고, 배포 빌드에 대한 언급은 없습니다. 그래서 8.3.1로 시작하고 `--host`만 막습니다.
  - Vite 8 기본 빌드 대상은 `baseline-widely-available`(chrome111, edge111, firefox114, safari16.4, ios16.4)입니다.
  - Node 24: 로컬 v24.19.0, Vitest 5 engines `^22.12.0 || ^24.0.0 || >=26.0.0`, Vite 8 engines `^20.19.0 || >=22.12.0`.
- **Alternatives considered**: TypeScript 6.0.3(2026-04-16, JS API 있음, 7에서 막히면 사용), TypeScript 5.9.3, Vite 8.3.3(보안 수정이 들어 있지만 2주 미만이고 영향은 개발 서버뿐), Vite 7.3.x 줄기(이전 주 버전).

### 1.3 테스트 도구

- **Decision**: Vitest 5.0.2(node 환경) + @playwright/test 1.63.0(Chromium·WebKit). jsdom·happy-dom·`@types/node`는 넣지 않습니다. 설정 파일은 tsc 대상에서 빼고 `skipLibCheck: true`로 시작하며, 막히면 그때 `@types/node`를 추가합니다.
- **Rationale**:
  - Vitest 5.0.2: 2026-09-25 게시, peer `vite ^6.4.0 || ^7.0.0 || ^8.0.0` 충족. 5.0.3(09-30)은 2주 미만입니다.
  - Playwright 1.63.0: 2026-09-04 게시, engines `node >=20`. 1.64.0(10-07)은 2주 미만입니다.
  - 순수 로직은 DOM 없이 시험하므로 jsdom이 필요 없습니다. DOM과 3D는 Playwright가 맡습니다.
  - Playwright `page.clock`은 `requestAnimationFrame`, `performance`, 타이머를 제어할 수 있어 일시정지 시간 제외 시험(SC-007)에 쓸 수 있습니다.
- **Alternatives considered**: Vitest 브라우저 모드(`@vitest/browser-playwright` 추가 필요), jsdom(three.js 렌더링 불가, 이득 적음), Vitest 4.1.11.

### 1.4 배포

- **Decision**: GitHub 공식 Pages 워크플로입니다. Vite `base: '/driving_game/'`로 빌드하고 모든 에셋을 import해 해시 파일 이름을 씁니다. 액션 버전:
  - `actions/checkout@v7.0.1`
  - `actions/setup-node@v7.0.0`(node-version `24`)
  - `actions/configure-pages@v6.0.0`
  - `actions/upload-pages-artifact@v5.0.0`
  - `actions/deploy-pages@v5.0.1`

  CI는 `npm ci` → `npm test` → `npm run build`이고 Playwright는 넣지 않습니다. 배포 직후 이전 파일이 404이면 다시 시도가 페이지를 새로 엽니다(저장 유지).
- **Rationale**:
  - 사용자 승인 스택입니다.
  - 원격 `https://github.com/kimwoo-ya/driving_game.git`이므로 주소는 `https://kimwoo-ya.github.io/driving_game/`이고, Vite 공식 가이드대로 `base`는 `'/<REPO>/'`입니다.
  - 권한 `pages: write`, `id-token: write`가 필요합니다(docs.github.com).
  - 액션 버전 근거(GitHub API 2026-10-12 조회): checkout v7.0.1(07-20), setup-node v7.0.0(07-14), configure-pages v6.0.0(03-25), upload-pages-artifact v5.0.0(04-10), deploy-pages v5.0.1(09-01). setup-node v7.1.0은 10-08 게시로 2주 미만이라 `@v7` 대신 정확한 태그로 고정합니다. 주 버전은 Vite 공식 예시와 같고, docs.github.com 예시는 한 단계 낮은 주 버전(v5/v4/v4)을 보여 줍니다.
  - GitHub Pages 응답은 `cache-control: max-age=600`입니다(실측). 해시 이름으로 새 배포와 캐시가 섞이지 않고, 이전 `index.html`이 남아 생기는 404는 새로 고침으로 해결합니다.
  - 저장소는 public이고 Pages가 꺼져 있습니다(`has_pages: false`) → 사용자가 Source를 "GitHub Actions"로 켜야 합니다.
- **Alternatives considered**: `base: './'` 상대 경로(어느 경로에서도 동작하지만 하위 경로 E2E 검증이 덜 직접적), `public/` 고정 이름(이전 JS와 새 모델이 섞일 수 있음), `gh-pages` 브랜치 배포(승인 방식 아님), 서비스 워커 캐시(오프라인은 범위 밖), 커밋 SHA 고정(더 엄격하지만 정확한 태그로 충분).

### 1.5 모델 파일

- **Decision**: poly.pizza GLB를 바탕으로 `src/assets/models/`에서 같은 출처로 제공합니다. `modeling/` ZIP은 보존합니다. 캐릭터 3종은 준비되었으며 Cool Bannana Guy·Turtle은 리깅 수정본, Chicken Guy는 기존 뼈대·동작을 보존한 원본입니다. 차량 5종은 후속 준비 작업에서 내려받습니다. 캐릭터 수정본은 원본 다운로드로 덮어쓰지 않습니다.
- **Rationale**:
  - 사용자 결정 A6입니다.
  - ZIP 안에는 GLB/glTF가 없습니다(PRD).
  - 8개 모두 glTF 2.0 GLB이고 `extensionsUsed`가 없으며(Draco·meshopt 없음), 버퍼와 이미지가 파일 안에 들어 있어 기본 GLTFLoader로 추가 요청 없이 읽힙니다(직접 판독).
  - 실행 중 외부 주소로 요청하지 않으므로 FR-085와 가용성 기준을 지킵니다.
  - `.gitignore`에 `modeling/`이 있어 ZIP은 GitHub에 올라가지 않지만, 빌드는 GLB만 씁니다(B16).
- **Alternatives considered**: ZIP의 OBJ/FBX를 직접 변환(Blender 등 새 도구 필요), 실행 중 poly.pizza에서 직접 읽기(외부 요청, 가용성 위험).

### 1.6 화면 UI

- **Decision**: 일반 HTML/CSS(DOM) 겹침 화면으로 만들고 UI 프레임워크는 쓰지 않습니다. 글은 `textContent`로만 넣습니다.
- **Rationale**: 화면 수가 적고(상태 14 + 겹침 5), 버튼·그림 중심이며, 의존성을 늘리지 않습니다(리더 기본값). `textContent`만 쓰므로 저장 값이 화면 내용으로 해석되지 않습니다(FR-081).
- **Alternatives considered**: React·Preact 등(의존성 추가, 이득 적음), three.js 안에 UI 그리기(접근성·배치 비용 큼).

### 1.7 주행 계산

- **Decision**: 물리 엔진 없이 고정 시간 간격(`TICK_HZ = 60`, `MAX_TICKS_PER_FRAME = 8`)으로 직접 계산합니다. 차량 종류는 시뮬레이션 입력이 아니고 성능은 `DRIVING_SPEC` 하나뿐입니다. 무작위 값은 쓰지 않습니다.
- **Rationale**:
  - 입력을 틱마다 읽으므로 화면 갱신 속도와 관계없이 결과가 비트 단위로 같습니다(FR-022, SC-002).
  - 함수 시그니처에 차량 종류가 없어 FR-011·FR-054가 구조로 보장됩니다.
  - 아이용 장난감 주행에 정밀 물리는 필요 없습니다(PRD 범위 밖).
- **Alternatives considered**: cannon-es·rapier 같은 물리 엔진(결정성·동일 성능 보장이 어렵고 의존성 추가), 가변 시간 간격(결정성 없음).

### 1.8 소리

- **Decision**: Web Audio API와 MP3를 씁니다. 시작 버튼 click 안에서 AudioContext를 만들고 `resume()`하며, `running`이 아니면 다음 사용자 동작마다 다시 시도합니다. 배경음은 30~60초 반복 구간입니다.
- **Rationale**:
  - 자동재생 제한을 지킵니다(PRD가 인용한 MDN Audio for Web Games).
  - iOS Safari는 화면 이탈·화면 꺼짐 뒤 `interrupted` 상태가 되어 다시 resume해야 합니다(MDN BaseAudioContext/state).
  - MP3는 Safari·Chrome 모두 `decodeAudioData`로 디코딩됩니다. 다만 실제 기기에서 확인해야 합니다.
  - 긴 곡 전체를 디코딩하면 수십 MB가 되므로 짧은 반복 구간으로 메모리를 줄입니다.
- **Alternatives considered**: HTMLAudioElement + MediaElementSource(긴 곡 스트리밍은 가능하지만 iOS 동작 미확인, 경로가 둘로 나뉨), 실행 중 `speechSynthesis`(기기마다 한국어 음성 유무·품질이 다르고 gain 제어 밖이라 비권장, B15).

### 1.9 저장

- **Decision**: localStorage 키 `driving_game:save` 하나에 JSON을 저장합니다. 손상된 값은 조용히 항목별 기본값을 쓰고, 저장소 API 예외에만 저장 불가 안내를 1회 보여 줍니다. 형식·검사·합치기는 [data-model.md](./data-model.md)를 따릅니다.
- **Rationale**:
  - localStorage 접근은 SecurityError를 낼 수 있습니다(MDN Window/localStorage). 그래서 모든 접근을 try/catch로 감쌉니다.
  - GitHub Pages 프로젝트 사이트들은 출처 하나를 함께 쓰므로 키에 프로젝트 이름을 붙입니다(data-model.md).
  - 리더 결정 B9입니다.
- **Alternatives considered**: IndexedDB(3항목에 과함), 쿠키(서버로 전송됨).

### 1.10 외부 연결과 보안

- **Decision**: 실행 중 외부 요청과 외부 링크(`<a href>`)가 없습니다. 웹 글꼴 대신 시스템 글꼴을 쓰고, CSP 메타는 넣지 않습니다.
- **Rationale**:
  - FR-084~086을 구조 규칙으로 지키고, Playwright로 요청 호스트와 `a[href]` 0개를 검사합니다.
  - CSP는 외부 코드가 없어 이득이 작고, 개발 서버(HMR)·GLTFLoader blob URL과 충돌할 여지가 있습니다.
- **Alternatives considered**: CSP 메타(외부 스크립트가 생기면 추가), 웹 글꼴(외부 요청 또는 라이선스 표시 필요).

---

## 2. 열린 항목 결정 (00_plan_context.md §5의 8개)

### R1. 모델 정규화 방법

- **Decision**: 실행 시 `prepareModel` 한 함수로 모든 모델을 처리합니다.
  - ① world 행렬 갱신
  - ② 차량 5종은 재질별로 geometry를 합침(`mergeGeometries`, 실패하면 원래 메시 유지). 캐릭터 3종은 모두 뼈대가 있어 합치지 않음.
  - ③ 카탈로그의 회전값으로 앞을 +Z로
  - ④ `Box3` 기준 균일 비율로 차량은 공통 표시 길이, 인물은 역할별 키에 맞춤
  - ⑤ 바닥을 0, 가로 중심을 원점으로
  - ⑥ 원본은 메모리에 두고 차량은 `clone()`, 캐릭터 3종은 `SkeletonUtils.clone`으로 복제

  왜건은 GLTFLoader의 자동 `flatShading`을 씁니다. 충돌·정지선·카메라는 `DRIVING_SPEC`만 씁니다. 캐릭터 리깅 제작에는 Blender를 사용했고, 게임 실행·빌드에는 Blender가 필요하지 않습니다.
- **Rationale**:
  - 실행 중 모델 처리에는 three addons만 사용합니다. 캐릭터의 뼈대 추가는 사용자 요청으로 별도의 Blender 제작 작업에서 완료했습니다.
  - 모델마다 원시 좌표 크기가 크게 다릅니다(바나나 자동차 약 800, 지프 약 0.05). 긴 축도 다릅니다(버기·트럭은 x, 바나나 자동차·왜건은 z).
  - 모델 안의 프리미티브는 속성 묶음이 같아 합치기가 실패하지 않습니다. 버기는 프리미티브 162개가 재질 수 12 이하로 줄어듭니다.
  - GLTFLoader r186은 노멀 없는 geometry의 재질에 `flatShading = true`를 자동 적용합니다(GLTFLoader.js 3500·3559행). 어색하면 `computeVertexNormals()`로 바꿉니다.
  - 판정을 모델 크기와 분리해 FR-011을 보장합니다.
- **Alternatives considered**: gltf-transform CLI로 미리 처리(새 dev 도구), Blender 수작업(재현 어려움, 원본 변경 증가), 합치지 않음(버기 한 대 162 그리기 호출).

### R2. 바퀴 수·약 5분 맞추기, SC-024 측정, 바퀴 회전 표현

- **Decision**:
  - 바퀴 수는 2바퀴 잠정이며 트랙 플레이 점검에서 확정합니다. 트랙 길이·컴퓨터 차량 설정은 `src/content/track.ts` 데이터입니다. 결정적 시뮬레이션의 기준 운전자로 경기 시간이 4:30~5:30에 드는지 Vitest로 먼저 맞추고, 실제 플레이 점검으로 확정합니다.
  - SC-024는 `?perf` 측정 표시와 기기별 기록으로 재고, 목표 수치는 초기 기기 점검 결과로 정합니다.
  - 바퀴 회전 표현은 첫 버전에 넣지 않습니다(5종 동일).
- **Rationale**:
  - 2바퀴면 바퀴 진행 표시에 의미가 있고 트랙을 짧게 만들 수 있습니다.
  - 바퀴 노드가 이름으로 분리된 것은 바나나 자동차(`tire` 등)뿐입니다. 지프·왜건은 단일 메시이고, 버기·트럭은 이름 없는 그룹입니다.
  - 뒤에서 내려다보는 카메라에서는 바퀴 회전이 잘 보이지 않고, 한 차량만 바퀴가 돌면 표현이 달라집니다(B2).
- **Alternatives considered**: 1바퀴(트랙이 길어져 장면 제작량 증가), 바나나 자동차만 이름 기반 회전(약 10줄, 표현 불균일), Blender로 다른 차량 바퀴 분리(새 도구).

### R3. "정지" 판정, 고정 시간 간격 주행, 허용 오차

- **Decision**:
  - 자연 감속으로 선 것도 정지입니다. 페달을 떼면 자연 감속하고, 아주 느려지면 속도를 정확히 0으로 맞추며, `speed === 0`을 "완전히 멈춤"으로 판정합니다.
  - 틱은 1/60초 고정이고 한 프레임 최대 8틱입니다.
  - SC-002 허용 오차: 자동 테스트는 완전 일치, 실제 기기는 ±0.05초·±0.1 m.
  - 7.5 fps 미만 기기에서는 게임 시간이 느려지므로 SC-012는 지원 기기(초기 기기 점검 선정) 기준으로 확인합니다.
- **Rationale**:
  - 3~5세가 손을 떼는 것만으로도 멈출 수 있습니다.
  - 0으로 맞추므로 "눈에 보이는 움직임 없음"과 판정이 일치합니다(spec Assumptions).
  - 실제 기기에서는 입력 시작이 1틱 어긋날 수 있습니다. 같은 기기 안에서는 결과가 비트 단위로 같고, 기기 사이에는 `Math.sin/cos` 구현 차이가 있을 수 있지만 SC-002는 기기 사이 비교를 요구하지 않습니다(B4, B6, B7).
- **Alternatives considered**: 브레이크로만 정지 인정(어린아이에게 어려움), 자동 정지 유지(현실 운전과 다른 인상), 가변 시간 간격(결정성 없음), 한 프레임 틱 상한 없음(저사양에서 처리 지연이 쌓임).

### R4. 배포 직후 파일 섞임, 하위 경로 로딩, 로딩 실패·다시 시도

- **Decision**:
  - `base: '/driving_game/'`, 모든 에셋 import(해시 이름), 라우터 없음.
  - `index.html` 부팅 가드가 앱 부팅 완료 전 스크립트·CSS 불러오기 실패와 구형 브라우저 구문 오류를 잡아 "다시 시도(새로 고침)"를 표시합니다.
  - loader는 바이트 진행률을 보여 주고, 정체되면 중단합니다. 다시 시도는 사용자가 누를 때만 하며, 실패한 파일만 다시 받고 성공하면 페이지를 유지합니다. 자동 반복은 없습니다.
  - 새 버전 배포로 이전 파일이 404이면 다시 시도가 페이지를 새로 엽니다(저장 유지).
- **Rationale**:
  - Vite 공식 GitHub Pages 방식입니다. 해시 이름이라 새 배포가 이전 캐시와 섞이지 않습니다.
  - URL이 바뀌지 않으므로 새로 고침이 항상 같은 `index.html`을 엽니다(FR-002).
  - Pages의 `max-age=600` 때문에 이전 `index.html`이 남으면, 다시 받아도 성공할 수 없는 404가 생깁니다. 그래서 그때만 새로 고칩니다(사용자 결정 A5, FR-004).
- **Alternatives considered**: `base: './'`, `public/` 고정 이름, 서비스 워커, 자동 재시도(FR-004 위반).

### R5. 사람 모델 동작 표현 (최종: 사용자 결정 A1)

- **Decision**: 교육용 마을의 등장 보행자와 보행자 시점 안내의 주인공은 Chicken Guy로 고정합니다.
  - 걷기·서 있기는 들어 있는 `Armature|Walk`, `Armature|Idle` 클립을 씁니다.
  - 클립을 갱신한 **뒤에** 관절 자세를 덮어씁니다. `Head` 회전으로 왼쪽·오른쪽 보기, `Hand.L`/`Hand.R`의 위치·회전으로 손 들기를 실제로 보여 줍니다. 코드에서는 three.js 안 이름 `HandL`/`HandR`로 찾습니다(아래 Rationale).
  - 자세 종류는 `CharacterPose = 'idle' | 'walk' | 'lookLeft' | 'lookRight' | 'raiseHand'`이고 뛰기는 없습니다.
  - `Armature|Sprint`·`Armature|Jump`는 쓰지 않습니다.
  - 들어 올릴 손은 콘텐츠 데이터에서 한쪽으로 정하고, 안내 문구에는 어느 손인지 말하지 않습니다(FR-095).
  - 구현 위치는 `src/render/characters.ts`입니다.
- **Rationale**:
  - 원본 중 뼈대와 동작이 있는 것은 Chicken Guy뿐이었습니다(스킨 2개, 클립 `Armature|Grounded`, `Armature|Idle`, `Armature|Jump`, `Armature|Sprint`, `Armature|Walk`). 후속 리깅으로 나머지 2종에도 뼈대 16개와 동작 5개를 추가했습니다. 교육용 주인공은 기존 사용자 결정대로 유지합니다.
  - 판독해 보니 `Head`는 `Body`의 자식이고, `Hand.L`·`Hand.R`은 팔 없이 `CORE` 바로 아래에 있는 손 관절입니다. 그래서 손은 위치 이동만으로 들어 올릴 수 있습니다.
  - `Walk`·`Idle` 클립이 `Head`·`Hand.L`·`Hand.R`을 매 프레임 움직이므로, 자세는 클립 갱신 뒤에 덮어써야 합니다.
  - three.js r186 GLTFLoader는 노드 이름을 `PropertyBinding.sanitizeNodeName`으로 바꿔 `[ ] . : /`를 지웁니다(`GLTFLoader.js` 3757~3771행 `createUniqueName`, `PropertyBinding.js` 3·185~187행). 그래서 GLB의 `Hand.L`/`Hand.R`은 불러온 뒤 `HandL`/`HandR`이 되고, `getObjectByName('Hand.L')`은 찾지 못합니다. `Head`와 동작 이름(`Armature|Walk` 등)은 그대로입니다(4130행).
  - 주인공을 고정하면 세 연습의 규칙 행동이 같은 모습으로 보이고, 위험한 행동은 자세 종류에 없어 데이터로 넣을 수 없습니다(FR-094).
  - 자연스러운지는 모델 렌더링 점검에서 확인합니다.
- **Alternatives considered**: 세 인물 공통 몸 전체 동작 + 그림 카드 중심, 아이가 주인공을 고르는 방식. 원래 대안이었던 정적 모델 둘의 Blender 리깅은 후속 사용자 요청으로 실행했으며, 이것이 보행자 역할 변경을 뜻하지는 않습니다.

### R6. 인물 선택 화면, 탑승객 배치 (최종: 사용자 결정 A2)

- **Decision**:
  - 차량 선택 뒤 인물 선택에서는 내 차에 태울 탑승객을 3종(Chicken Guy, Cool Bannana Guy, Turtle) 중에서 고릅니다. 고른 인물은 안전 연습·레이싱 내내 아이 차에 타 있고, 저장하지 않습니다.
  - 선택 화면은 `src/render/showroom.ts`의 3D 진열 장면 위에 투명 DOM 버튼 열을 겹친 것입니다. 고르면 해당 모델을 확대·회전합니다.
  - 탑승객은 `VehicleKind.seats`의 좌석에 차량 표시 객체의 자식으로 앉힙니다. 5종 모두 뒤에서 내려다보는 카메라에서 보이는 좌석이 1개 이상 필요합니다. 지붕 있는 차량(왜건, 트럭 운전석)에서 안 보이면 장난감 같은 표현(열린 칸, 지붕 위 좌석 등)으로 콘텐츠 설계에서 조정합니다.
  - 탑승객 Chicken Guy는 `Armature|Idle`을 재생합니다.
  - Cool Bannana Guy·Turtle 수정본에는 `Idle` 기본 자세와 `Sit` 등 확인용 동작이 있습니다. 뼈대는 유지하며, 차량 좌석에 맞춘 자세 고정은 후속 구현에서 확인합니다.
  - 다른 차의 탑승객은 콘텐츠 설계에서 정합니다.
- **Rationale**:
  - 보행자를 Chicken Guy로 고정했기 때문에, 인물 선택은 아이 차 탑승객으로 쓰는 것이 맞습니다(FR-097, SC-032 = 인물 3 × 차량 5 = 15조합).
  - 탑승객은 자식 객체일 뿐이라 판정·카메라·성능에 영향이 없습니다(FR-011).
  - 3D 진열은 썸네일 제작과 그에 따른 라이선스 변경 표시가 필요 없습니다.
- **Alternatives considered**: 미리 렌더링한 썸네일 그림(콘텐츠 작업 증가), 실행 중 오프스크린 렌더 썸네일(코드 증가), 탑승객을 보이지 않는 차종 허용(SC-032 15/15 불충족).

### R7. 테스트 방법 구분과 실제 명령

- **Decision**:
  - 테스트 층은 자동 테스트(Vitest) / 브라우저 확인(Playwright) / 실제 기기 / 콘텐츠 검토 / 어린이 관찰의 5층입니다.
  - npm scripts: `dev`=`vite`, `typecheck`=`tsc --noEmit`, `test`=`vitest run`, `build`=`tsc --noEmit && vite build`, `preview`=`vite preview`, `test:e2e`=`playwright test`(webServer `npm run build && npm run preview -- --port 4173 --strictPort`, baseURL `http://localhost:4173/driving_game/`).
  - CI는 `npm test` + `npm run build`입니다. SC별 담당은 plan.md "테스트 전략".
- **Rationale**:
  - 순수 로직을 분리해 두었으므로 대부분의 SC를 node에서 빠르고 결정적으로 시험할 수 있습니다.
  - 터치·소리·성능은 실제 기기에서만 의미가 있습니다(AGENTS.md 테스트 층 구분).
  - Vitest 기본 포함 패턴은 `*.spec.ts`도 잡으므로 `test.include: ['tests/unit/**/*.test.ts']`로 E2E와 분리합니다.
- **Alternatives considered**: Vitest 브라우저 모드, jsdom, CI에서 Playwright(나중에 필요하면).

### R8. 콘텐츠 작업 분리

- **Decision**:
  - 코드 단계는 자리표시 콘텐츠(단순 도형 그림, 음성 없음, 최소 장면 요소)로 기능을 완성합니다.
  - 콘텐츠는 별도 단계에서 `src/content/*.ts` 데이터(`VEHICLES`, `CHARACTERS`, `SAFETY_RULES`, `SCENARIOS`, `TOWN`, `TRACK`, `VOICE_LINES`·`VIOLATION_LINES`, `CREDITS`)와 `src/assets/**` 파일만 채웁니다. 음성 줄 ID 26개는 코드가 부르므로 코드 단계에서 고정하고, 콘텐츠 단계는 대본과 파일을 채웁니다(`contracts/content-data.md` 3장).
  - 콘텐츠 검증 Vitest가 두 단계의 연결을 지킵니다: 규칙 38줄, 줄마다 그림·음성 파일 존재, 보행자 경로가 위반 경계의 차 반대편에 사람 반지름 + 여유 이상 떨어져 있는지, 차량마다 좌석 1개 이상. 장면 요소 배치·그림·음성 파일 검사는 콘텐츠 완성 단계에서 켭니다(`contracts/content-data.md` 4장).
  - 그림은 SVG로 만들어 빌드 때 JS 번들에 인라인합니다(`build.assetsInlineLimit` 함수). 플레이 중 네트워크가 끊겨도 규칙 카드 그림이 비지 않고, 필수 다운로드는 GLB 8개로 유지됩니다. 큰 래스터 그림(PNG 등)을 쓰기로 하면(B15) 그림을 필수 다운로드로 옮깁니다.
  - 콘텐츠 단계의 사용자 결정(B15): 안내 음성 제작 방법(직접 녹음 / 미리 만든 TTS 파일, 실행 중 `speechSynthesis` 비권장), 규칙 그림 38장·UI 그림 제작 방법, 배경음악 곡·녹음 선정.
- **Rationale**: 규칙 38문구 그림, 음성, 배경음 사용조건 확인, 마을 장면 요소는 작업량이 크고 사용자 결정이 필요합니다. 분리해 두면 코드 진행이 막히지 않습니다.
- **Alternatives considered**: 기능마다 최종 콘텐츠까지 함께 완성(콘텐츠 결정 대기로 코드가 멈춤).

---

## 3. 사용자 결정·리더 결정 반영 결과

R4~R6과 겹치지 않는 결정만 적습니다. 전체 목록은 plan.md "사용자 결정 기록"·"리더 결정 기본값".

### 3.1 "다시 하는 연습" (사용자 결정 A3)

- **Decision**: `isReplay` = 이번 실행에서 그 연습을 이미 완료 ∨ 튜토리얼 전체 완료 기록 있음. 완료 기록이 있으면 새 방문의 첫 연습부터 추가 규칙이 나옵니다. `pickRules`는 핵심 규칙 전부에, 다시 하는 연습이면 아직 안 보인 추가 규칙 `EXTRAS_PER_VIEW`개를 더하고, 다 보여 주면 처음부터 돌아갑니다(저장 안 함).
- **Rationale**: FR-091 사용자 결정 문구입니다. 레이싱이 열린 뒤 새로 방문해도 새 규칙을 배울 수 있습니다.
- **Alternatives considered**: 이번 실행에서 완료한 경우만(재방문 첫 연습에 추가 규칙이 안 나옴), 본 추가 규칙을 저장(사용자 결정 범위 밖).

### 3.2 장면 요소 표현 (사용자 결정 A4)

- **Decision**:
  - 굴러가는 공과 주차된 차 밑의 물건은 마을 장면 요소(기본 도형)로 둡니다.
  - 버스, 통학버스와 정류장, 골목길, 보도 없는 길, 신호등 없는 횡단보도, 노란 대기선, 육교 또는 지하도도 기본 도형으로 직접 만듭니다.
  - 주차된 차·후진하는 차는 차량 모델 복제로, 트럭은 트럭 모델로 표현합니다.
  - 건너편·친구·어른 인물과 우산·밝은 옷(A2, A25, A26, B13, B14)은 보행자 시점 안내의 규칙 그림으로만 보여 줍니다.
  - 비 오는 날·어두운 날은 보행자 시점 안내 장면의 날씨로 표현합니다.
- **Rationale**: 제공 모델에 버스·통학버스가 없습니다. 기본 도형을 쓰면 외부 자료가 늘지 않아 사용조건 확인이 필요 없습니다. 보행자는 Chicken Guy 하나라 다른 인물은 그림이 적합합니다(FR-092).
- **Alternatives considered**: 외부 무료 모델 추가(사용자 승인과 사용조건 확인 필요), 다른 사람 모델을 보행자로 사용. 원본의 관절 부재는 리깅으로 해소했지만 보행자 역할은 기존 사용자 결정대로 Chicken Guy를 유지합니다.

### 3.3 최고 기록 단위 (B3)

- **Decision**: 1/100초 정수 `timeCs`로 저장·비교·표시하고, 표시는 `m:ss.cc`입니다. 틱(1/60초)에서 완주 순간 한 번만 바꿉니다.
- **Rationale**: FR-064가 저장·비교·표시의 정밀도를 같게 요구합니다. 한 번만 바꾸면 "같은 숫자인데 새 기록"이 생기지 않습니다(data-model.md).
- **Alternatives considered**: 1/10초(동점이 늘어남), 틱 수 그대로 저장(표시 단위와 어긋남).

### 3.4 처음 이용 흐름 (B8)

- **Decision**: 저장된 완료 기록이 없고 이번 실행에서 처음 시작할 때만 세 연습을 순서대로 이어 갑니다. 그 밖에는 연습 목록을 보여 줍니다. 조작 익히기는 저장된 완료 기록이 없고 이번 실행에서 아직 통과하지 않았을 때 연습에 들어가기 전에 거칩니다.
- **Rationale**: FR-029·FR-049, US3 시나리오 2·6을 함께 만족하는 가장 단순한 규칙입니다.
- **Alternatives considered**: 완료 전에는 항상 순서대로(목록에서 고르는 FR-029 후반과 충돌), 항상 목록(처음 이용 시 순서 안내 FR-029와 충돌).

### 3.5 손상된 저장 값과 저장 불가 안내 (B9)

- **Decision**: 손상된 저장 값은 조용히 항목별 기본값을 씁니다(안내 없음). 저장소 API 예외(읽기·쓰기 실패)에만 저장 불가 안내를 실행당 1회 보여 줍니다.
- **Rationale**: 손상 값은 FR-081대로 처리하면 플레이에 영향이 없습니다. "기록이 남지 않는다"는 안내(FR-080)는 실제로 저장이 안 될 때만 맞는 말입니다.
- **Alternatives considered**: 손상 값에도 안내(보호자에게 잘못된 정보).

### 3.6 구간 재시도와 보행자 시점 안내 (B10)

- **Decision**: 같은 시도 안에서 이미 끝낸 보행자 시점 안내는 구간 재시도 뒤 다시 보여 주지 않습니다.
- **Rationale**: 같은 안내가 반복되지 않아 3~5세 집중 시간을 아낍니다. 완료 조건(FR-032)은 이미 충족된 상태입니다.
- **Alternatives considered**: 재시도마다 다시 보여 주기(반복 피로).

### 3.7 가로 180° 뒤집기 (B11)

- **Decision**: 입력을 해제하고 일시정지는 하지 않습니다.
- **Rationale**: FR-017(화면 회전 시 입력 해제)과 spec Edge "화면"(180° 뒤집기에 일시정지 안 함)을 함께 만족합니다.
- **Alternatives considered**: 일시정지(Edge Case와 충돌).

### 3.8 잘못된 행동 종류 (B12)

- **Decision**: FR-033과 SC-010의 합집합 6종 `ViolationKind`를 씁니다: `overStopLine`, `ranRed`, `earlyStart`, `enteredCrosswalkWithPedestrian`, `turnedIntoCrossingPedestrian`, `enteredSidewalk`. 경로 문제는 별도 `RouteIssue`이며 실패가 아닙니다.
- **Rationale**: 두 목록이 서로 다른 항목을 담고 있어(SC-010에는 보도 진입이 없음) 합집합이면 둘 다 만족합니다.
- **Alternatives considered**: FR-033 5종만(SC-010 회전 경우가 묶여 시험이 흐려짐).

### 3.9 보행자 시점 안내 진행과 게임 안 시간 (B13, B14)

- **Decision**: 보행자 시점 안내는 카드 길이(틱)로 자동 진행하고 음성 완료를 기다리지 않습니다. 게임 안의 시간은 모두 틱이며 상수 이름은 `*_TICKS`입니다(밀리초 상수를 쓰지 않음, UI 꾸밈 애니메이션 제외).
- **Rationale**: FR-070(소리 없이도 진행), FR-074(숨김 시간 제외), 기기 시계 변경 Edge Case를 구조로 해결합니다.
- **Alternatives considered**: 음성 끝에 진행(소리 끔·실패 시 멈춤), 밀리초 타이머(숨김 시간이 섞임).

### 3.10 컴퓨터 차량 목표 속도 비율 (B17)

- **Decision**: `AiProfile.targetSpeedRatio`를 유지합니다. 이것은 "액셀을 언제 떼는지"라는 주행 방식이고, 컴퓨터 차량도 같은 `stepVehicle`·`DRIVING_SPEC` 한도를 씁니다.
- **Rationale**: FR-054는 성능 한도는 같게 하고 난이도는 주행 경로와 반응으로 조절하라고 합니다. 액셀을 떼는 시점은 운전 방식(반응)이며 한도를 바꾸지 않습니다. 컴퓨터 차량 입력은 `aiInput`이 만든 `DriveInput`(액셀 켬/끔)뿐이라 한도를 넘을 길이 없습니다.
- **Alternatives considered**: 필드를 지우고 주행선(`laneOffset`)·반응 지연(`reactionTicks`)만 남김(약 5분 경기 시간 맞추기가 어려워짐).

---

## 4. 확인한 사실

| 사실 | 근거 |
|---|---|
| GLB 8개: glTF 2.0, `extensionsUsed` 없음, 버퍼 GLB 내장, 이미지 bufferView 내장(PNG 1024×1024: 바나나 자동차, Cool Bannana Guy, Chicken Guy) | GLB JSON 청크 직접 판독(2026-10-12) |
| 왜건 프리미티브 속성 `POSITION, TEXCOORD_0`(노멀 없음), Chicken Guy `JOINTS_0, NORMAL, POSITION, TEXCOORD_0, WEIGHTS_0`, 나머지 `NORMAL, POSITION, TEXCOORD_0`. 모델 안에서 모두 같음 | 같은 판독 |
| Chicken Guy 계층: `RootNode/Armature/CORE/Body/Head`, `RootNode/Armature/CORE/Hand.L`, `RootNode/Armature/CORE/Hand.R`, `Foot.L`, `Foot.R`. 스킨 2개(관절 27개씩). `Walk`·`Idle` 클립이 `Head`·`Hand.L`·`Hand.R`을 움직임 | 같은 판독 |
| GLTFLoader r186은 노드 이름에서 `[ ] . : /`를 지움 → three.js 안 이름은 `HandL`/`HandR`(동작 이름은 그대로) | `GLTFLoader.js` 3757~3771·4130행, `src/animation/PropertyBinding.js` 3·185~187행(2026-10-12 판독) |
| Vite 8.3.1 `build.assetsInlineLimit`: `number \| ((filePath, content) => boolean \| undefined)`, 기본 4096 → SVG를 항상 인라인할 수 있음 | vite v8.3.1 `docs/config/build-options.md` |
| GLB 8개 SHA-256 다시 계산 → quickstart.md 값과 8/8 일치, 합계 2,486,368바이트 | 2026-10-12 contract-designer 재내려받기(저장소에는 넣지 않음) |
| GLTFLoader r186: 노멀 없으면 `flatShading = true` | `three@0.186.1/examples/jsm/loaders/GLTFLoader.js` 3500·3559행 |
| WebGLRenderer r186: `webglcontextlost`에서 `preventDefault()`, `webglcontextrestored`에서 상태 재생성 | `three@0.186.1/src/renderers/WebGLRenderer.js` 1113~1127행 |
| `SkeletonUtils.clone`, `BufferGeometryUtils.mergeGeometries`, `GLTFLoader.parseAsync` 존재 | r186 addons 소스 |
| GitHub Pages 응답 `cache-control: max-age=600` | `curl -sI https://mrdoob.github.io/stats.js/`(2026-10-12). 공식 문서 명시는 미확인 |
| 저장소 public, Pages 꺼짐, 기본 브랜치 `main` | `gh api repos/kimwoo-ya/driving_game` |
| `.gitignore`에 `modeling/` | 저장소 `.gitignore` |

GLB SHA-256 값은 [quickstart.md](./quickstart.md)에 있습니다.

## 5. 미확인 (구현 첫 단계·실제 기기에서 확인)

- TypeScript 7 공식 발표 글(2차 출처만 확인: https://infoq.com/news/2026/08/typescript-7-released/)
- Playwright WebKit headless에서 WebGL2 동작 여부
- `vite preview`가 `base` 하위 경로로 제공하는지
- iOS Safari의 확대·두 번 탭 차단 동작, 화면 잠금 때 `visibilitychange` 발생, AudioContext `interrupted` 뒤 재개, MP3 디코딩, iOS 컨텍스트 손실 복구
- Safari에서 새로 고침할 때 캐시된 `index.html`을 다시 확인하는지
- Chicken Guy 관절 자세의 자연스러움, 차종별 탑승객 좌석 보임
- Vitest(node)에서 `import.meta.glob` + `?url`이 동작하는지(안 되면 콘텐츠 파일 존재 검사를 `node:fs`로)

## 6. 출처

- 3D 엔진: [three.js Migration Guide](https://github.com/mrdoob/three.js/wiki/Migration-Guide)(r163 WebGL1 제거), [three@0.186.1 패키지](https://cdn.jsdelivr.net/npm/three@0.186.1/package.json), [GLTFLoader 소스](https://cdn.jsdelivr.net/npm/three@0.186.1/examples/jsm/loaders/GLTFLoader.js), [WebGLRenderer 소스](https://cdn.jsdelivr.net/npm/three@0.186.1/src/renderers/WebGLRenderer.js)
- Vite: [GitHub Pages 배포](https://vite.dev/guide/static-deploy#github-pages), [build.target](https://vite.dev/config/build-options#build-target), [Static Asset Handling](https://vite.dev/guide/assets)
- Vite 보안 권고: [GHSA-rq7h-c2jc-7f22](https://github.com/vitejs/vite/security/advisories/GHSA-rq7h-c2jc-7f22), [GHSA-9jrq-w75r-8gcw](https://github.com/vitejs/vite/security/advisories/GHSA-9jrq-w75r-8gcw), [권고 목록](https://github.com/vitejs/vite/security/advisories)
- GitHub Pages: [Using custom workflows with GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), [What is GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
- 브라우저 API(MDN): [Pointer events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events), [touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action), [overscroll-behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior), [BaseAudioContext.state](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/state), [Audio for Web Games — autoplay](https://developer.mozilla.org/en-US/docs/Games/Techniques/Audio_for_Web_Games#autoplay), [visibilitychange](https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event), [Window.localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage), [webglcontextlost](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextlost_event)
- Playwright: [Clock](https://playwright.dev/docs/clock), [Emulation](https://playwright.dev/docs/emulation)
- TypeScript 7(2차 출처): [InfoQ: TypeScript 7 released](https://infoq.com/news/2026/08/typescript-7-released/)
- 모델 원출처: PRD "제공된 차량·사람 모델" 표의 poly.pizza 페이지, GLB 주소는 [quickstart.md](./quickstart.md)
