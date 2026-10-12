# 에셋 목록 계약

- 대상: `src/assets/**` 파일, `src/app/loader.ts`(`AssetId`, `ASSET_URLS`, `loadRequired`, `loadSounds`), `src/render/models.ts`(`prepareModel`), `src/render/characters.ts`, `src/audio/audio.ts`, `src/content/credits.ts`.
- 콘텐츠 데이터에는 파일 경로 필드가 없습니다. 파일은 **ID로 이름을 정해** 찾습니다(data-model.md 0장). 이 문서가 그 이름 규칙과 `AssetId` 형식을 정합니다.
- 원본 조사: 아래 원본 GLB 8개는 2026-10-12 내려받아 SHA-256을 확인했습니다. 후속 리깅 작업에서 캐릭터 GLB 3개를 저장소에 준비했으며, Cool Bannana Guy·Turtle은 수정본입니다. [리깅 작업 기록](../_workspace/03_character-rigging.md)과 아래 최종 파일 표를 함께 따릅니다.

## 1. `AssetId`와 URL 표

```ts
// src/app/loader.ts
export type AssetId = `models/${string}.glb` | `images/${string}.svg` | `audio/${string}.mp3`;
export const ASSET_URLS: Readonly<Partial<Record<AssetId, string>>>;
```

- `AssetId` = `src/assets/` 아래 상대 경로(확장자 포함). 예: `models/banana-car.glb`, `images/rules/A14-A15.svg`, `audio/voice/hint-stop.mp3`.
- `ASSET_URLS`는 `import.meta.glob('/src/assets/**/*.{glb,svg,mp3}', { query: '?url', import: 'default', eager: true })` 결과의 키에서 앞의 `/src/assets/`를 뗀 표입니다. 값은 빌드가 정한 URL(해시 이름 또는 인라인 `data:` URI, static-paths.md)입니다. 코드는 경로 문자열을 직접 만들지 않고 이 표만 씁니다.
- 파일이 없으면 `ASSET_URLS[id]`가 `undefined`입니다. 필수 파일이 없으면 콘텐츠 무결성 검사가 실패하고(content-data.md), 선택 파일이 없으면 그 소리만 없이 진행합니다.
- UI 코드가 고정 이름으로 쓰는 그림(`images/ui/*`)은 `import url from '../assets/images/ui/<이름>.svg'`로 직접 가져와도 됩니다. 파일이 없으면 빌드가 실패하므로 빠진 그림을 일찍 잡습니다.

## 2. 필수·번들 포함·선택

| 구분 | 파일 | 받는 방법 | 실패하면 | 근거 |
|---|---|---|---|---|
| **필수** | GLB 8개 | `loadRequired`가 시작 화면 전에 받음(진행률 표시) | `loadFailed` → 다시 시도(실패 파일만), 404면 새로 고침 | FR-003, FR-004 |
| **번들 포함** | 그림 SVG 전부(`images/rules`, `images/ui`) | Vite가 JS 번들 안에 `data:` URI로 넣음(`build.assetsInlineLimit`에서 `.svg`는 항상 인라인, static-paths.md) → 따로 받지 않음 | JS 번들 실패 = 부팅 가드(static-paths.md). 그림만 따로 실패하는 일이 없음 | FR-070(핵심 안내는 그림), Edge "로딩을 마친 뒤 네트워크가 끊겨도 이미 받은 범위에서 플레이" |
| **선택** | 소리 MP3 전부(`audio/voice`, `audio/sfx`, `audio/bgm`) | `loadSounds`가 필수 파일 뒤 백그라운드로 받음, `unlockAudio` 뒤 디코딩 | 그 소리만 없이 진행. 다시 시도 없음 | FR-070, SC-021 |

- 그림을 번들에 넣는 이유: `<img>`가 필요할 때마다 받으면 플레이 중 네트워크가 끊겼을 때 규칙 카드 그림이 비고 다시 시도 경로도 없습니다. SVG를 인라인하면 실패 지점이 JS 번들 하나로 줄고 코드가 늘지 않습니다. 대가는 JS 크기 증가(그림 38장 + UI 그림). 그림을 PNG 같은 큰 래스터로 만들기로 하면(02 결정 B15) 이 결정을 다시 봅니다 — 그때는 그림도 `loadRequired` 대상으로 옮깁니다.

## 3. GLB 8개

파일 위치는 `src/assets/models/<id>.glb`, 체크섬 파일은 `src/assets/models/SHA256SUMS`입니다. 캐릭터 3종은 준비되었고 차량 5종은 후속 준비 작업에서 내려받습니다. 아래 표는 **수정 전 원본**의 주소·크기·해시입니다. 캐릭터 수정본을 원본 다운로드로 덮어쓰지 않습니다(quickstart.md).

| `AssetId` | 모델 | 원출처 페이지 | GLB 주소 | 크기(바이트) | SHA-256 |
|---|---|---|---|---|---|
| `models/buggy.glb` | Buggy — Nick Slough | https://poly.pizza/m/eZ_13w7qZh7 | https://static.poly.pizza/8036e526-b08a-4d8c-a4b3-0214097cbc18.glb | 614188 | `3f17aa7cbdd7509fb56b1e2e6b4b5a4d384fbffa15e0bb2c0f5a87cc8f509d5c` |
| `models/jeep.glb` | Jeep — Zsky | https://poly.pizza/m/AcSdGGrgYP | https://static.poly.pizza/1c0f14fb-d3db-41e8-941b-f10fb7aa9681.glb | 138740 | `edb8d57bb7ec61358a34d53d2e484fa9fcdfb8f9b90ddecd576ed272b48a1e50` |
| `models/truck.glb` | Truck — sugamo | https://poly.pizza/m/fbDxapxkwY9 | https://static.poly.pizza/0674a45b-d617-4e7d-91c2-56bbed93230b.glb | 266060 | `634c5bd06c236044c1254474187218961db45a007cdd73a4cf51db7965d721c4` |
| `models/wagon.glb` | Wagon — Poly by Google | https://poly.pizza/m/8HnKzYQeRYD | https://static.poly.pizza/34b817d5-a238-4720-bc18-f065367eacda.glb | 75336 | `3441207d0eca5181ec20de64c877f3386e4ef38cfd441d1577b31e94642b40f6` |
| `models/banana-car.glb` | cartoon banana car — Felipe Lujan-Bear | https://poly.pizza/m/1RjuCX8gI9w | https://static.poly.pizza/834b3d40-b61f-411b-b63b-2adf51bc15c9.glb | 259768 | `05d4dc8e88cb33ae3ed5cd3077a7eb607bb717b916f57408f5c48a11427d25ca` |
| `models/chicken-guy.glb` | Chicken Guy — J-Toastie | https://poly.pizza/m/b2hbNsaTN0 | https://static.poly.pizza/356751e5-10d4-4fec-8b35-68e2f09cab47.glb | 282604 | `85d4f3671a9383f810a53bbac55da34b890e3eb0f16769c63d6643a1a436fae3` |
| `models/cool-banana-guy.glb` | Cool Bannana Guy — Polygonal Mind | https://poly.pizza/m/TFlEjNafR1 | https://static.poly.pizza/0be17c6d-4b23-4dbf-b5fa-ea0ed7ad58b8.glb | 788968 | `d12abda5c80a2fd9988c6a50be941134e765d673ca2aa8d7c52e324b49da07c6` |
| `models/turtle.glb` | Turtle — marioba | https://poly.pizza/m/RvTg4XTOUH | https://static.poly.pizza/230aeead-8c15-470e-8feb-778cbae907a9.glb | 60704 | `a068045dde8482f7781eb6b1433c827db1762d051395f15899ad987431df60fc` |

- 원본 합계는 2,486,368바이트(약 2.5 MB)입니다. 새 리깅 파일 2개로 교체한 전체 8종의 예상 합계는 2,432,528바이트입니다. 원본·수정본 모두 glTF 2.0 GLB, `extensionsUsed` 없음, 버퍼·이미지 내장입니다.
- 실행 중 위 `static.poly.pizza` 주소로 요청하지 않습니다. 이 주소는 내려받기 재현용 기록입니다(FR-085).
- `modeling/` ZIP 원본은 건드리지 않습니다(AGENTS.md). `.gitignore` 대상이라 GitHub에 올라가지 않습니다(02 결정 B16).

### 준비된 캐릭터 최종 파일 (2026-10-12)

| 파일 | 크기(바이트) | 최종 SHA-256 |
|---|---|---|
| `chicken-guy.glb` | 282604 | `85d4f3671a9383f810a53bbac55da34b890e3eb0f16769c63d6643a1a436fae3` |
| `cool-banana-guy.glb` | 650360 | `f7592cb93e340a6ceeaf138d34d4673d11a3212532f8d911138690e8b2ee0f5a` |
| `turtle.glb` | 145472 | `c08f4dd1b5d28b425b55e275a5083e24a55d055381712b9ca99d4d85bd81ffd9` |

바나나·거북이는 각각 스킨 1개, 뼈대 16개, `Idle`·`RaiseHand`·`LookLeft`·`LookRight`·`Sit` 클립 5개입니다. 수정본 두 개는 키 2 m, +Y 위·+Z 앞·바닥 0으로 맞췄으며 `yawDeg = 0`입니다. 스킨·동작·재질을 유지해 불러옵니다. Blender 재로딩 검사와 glTF 표준 검사를 통과했으며 게임 안 로딩·복제는 후속 검사입니다.

## 4. 모델 정규화 (`prepareModel(glb, kind)`)

입력은 GLB 바이트와 콘텐츠 항목 하나(`VehicleKind` 또는 `CharacterKind`)입니다. 모든 모델에 같은 순서를 씁니다(plan.md "정규화").

| 입력 | 출처 | 쓰임 |
|---|---|---|
| `kind.yawDeg` | `VEHICLES`·`CHARACTERS` | 모델 앞쪽을 +Z로 돌리는 각(도). 렌더링 점검에서 눈으로 정함 |
| 차량 목표 길이 | `DRIVING_SPEC.bodyLength`(m) | 차량은 회전 후 Z축 길이를 이 값에 맞춤(균일 비율) → 표시 길이 = 판정 길이 |
| 인물 기준 키 | 1 m | 인물은 키(Y)를 1 m로 맞춤. 쓰는 곳에서 `scale`로 실제 키를 줌: 탑승객은 `SeatDef.height`, 등장 보행자·주인공은 렌더러 상수 |
| `kind.seats` | `VEHICLES` | `SeatDef.pos`는 **정규화된 차량 좌표(m)**: +Z 앞, 바닥 y = 0, 가로 중심 원점. `seats[0]`에 아이가 고른 인물을 차량 표시 객체의 자식으로 앉힘 |
| `kind.clips` | `CHARACTERS` | Chicken Guy는 `{ idle: 'Armature\|Idle', walk: 'Armature\|Walk' }`, 나머지 둘은 `{ idle: 'Idle' }` |

출력 보장(`PreparedModel.root`):

1. 차량 5종만 재질별로 geometry를 합칩니다(`mergeGeometries`, 실패하면 원래 메시 유지). 캐릭터 3종은 모두 뼈대가 있으므로 합치지 않고 `SkeletonUtils.clone`으로 복제합니다.
2. 앞쪽 +Z, 바닥(`Box3.min.y`) = 0, 가로 중심(Box3 x·z 중심) = 원점.
3. 차량은 Z 길이 = `DRIVING_SPEC.bodyLength`, 인물은 키 = 1 m.
4. 왜건(노멀 없음)은 GLTFLoader가 재질에 `flatShading`을 자동으로 켭니다(코드 없음).
5. 모델 상자 크기·모양은 표시에만 쓰이고 판정·카메라로 돌아가지 않습니다(FR-011).

## 5. Chicken Guy 동작·관절

GLB 판독(2026-10-12, 이 담당이 노드·동작 이름 직접 확인):

| 구분 | GLB 안 이름 | three.js r186에서 찾는 이름 | 쓰임 |
|---|---|---|---|
| 동작 | `Armature|Idle` | `Armature|Idle`(동작 이름은 바뀌지 않음) | 서 있기, 탑승객 |
| 동작 | `Armature|Walk` | `Armature|Walk` | 걷기(`CharacterPose` `walk`) |
| 동작(안 씀) | `Armature|Sprint`, `Armature|Jump`, `Armature|Grounded` | — | 재생하지 않음(FR-094) |
| 관절 | `Head` | `Head` | `lookLeft`·`lookRight`: 회전 |
| 관절 | `Hand.L` | **`HandL`** | `raiseHand`: 위치·회전(팔 없이 `CORE` 바로 아래) |
| 관절 | `Hand.R` | **`HandR`** | 〃 |

- **주의**: three.js `GLTFLoader`는 노드 이름을 `PropertyBinding.sanitizeNodeName`으로 바꿉니다(`[ ] . : /`를 지우고 공백을 `_`로). 그래서 `getObjectByName('Hand.L')`은 찾지 못하고 `'HandL'`로 찾아야 합니다. 근거: three@0.186.1 `examples/jsm/loaders/GLTFLoader.js` 3757~3771행 `createUniqueName`, `src/animation/PropertyBinding.js` 3행 `_RESERVED_CHARS_RE = '\\[\\]\\.:\\/'`, 185~187행 `sanitizeNodeName`. 동작 이름은 4130행에서 그대로 씁니다.
- 관절 이름은 `src/render/characters.ts`의 코드 상수입니다(콘텐츠 데이터 아님, data-model.md 2.1). 들어 올릴 손은 한쪽으로 고정하고 안내 문구에서 어느 손인지 말하지 않습니다(FR-095).
- 자세는 클립을 갱신한 **뒤에** 덮어씁니다(`Walk`·`Idle`이 `Head`·`Hand.*`를 매 프레임 움직임, research.md).
- 다른 두 인물(Cool Bannana Guy, Turtle)도 리깅된 수정본을 사용하지만 역할은 기존대로 탑승객입니다. 등장 보행자·주인공은 언제나 Chicken Guy입니다(FR-096). 새 클립은 24 fps·1~48프레임의 자세 확인용 동작이며 16~32프레임에서 목표 자세를 유지합니다. 차량 좌석에 맞는 자세 고정은 후속 렌더러 구현에서 확인합니다.

## 6. 그림·소리 파일 이름 규칙

| 종류 | 경로(`AssetId`) | 개수 | 형식 | 이름 규칙·쓰는 곳 |
|---|---|---|---|---|
| 규칙 그림 | `images/rules/<RuleId>.svg` | 38 | SVG | `RuleId` 그대로(`A6.svg`, `A14-A15.svg`). `cardShown` 때 표시 |
| 연습 목록 그림 | `images/ui/scenario-<ScenarioId>.svg` | 3 | SVG | 연습 목록(FR-030) |
| 잘못된 행동 설명 그림 | `images/ui/violation-<kebab>.svg` | 6 | SVG | `<kebab>` = `ViolationKind`를 kebab-case로(`overStopLine` → `over-stop-line`). 위험 직전 멈춤 겹침 |
| 다음 행동 그림 | `images/ui/cue-<HintCue>.svg` | 9 | SVG | `hint` 이벤트(`cue-stop.svg` … `cue-reverse.svg`) |
| 그 밖의 UI 그림 | `images/ui/<kebab>.svg` | — | SVG | 전진·후진, 잠김, 완료, 일시정지·계속하기, 세로 안내, 로딩·실패·3D 불가, 먼저 멈춰요 등. UI 코드가 직접 import |
| 안내 음성 | `audio/voice/<RuleId 또는 VoiceLineId>.mp3` | 38 + 줄 수 | MP3 | 규칙 음성은 `RuleId`, 그 밖은 content-data.md 3장 `VoiceLineId` |
| 효과음 | `audio/sfx/<SfxId>.mp3` | 7 | MP3 | `SfxId` 목록 밖 파일은 쓰지 않음(위협적인 소리 금지, FR-036) |
| 배경음 | `audio/bgm/main.mp3` | 1 | MP3 | 30~60초 반복 구간(디코딩 메모리, plan.md) |

- 모든 이름은 kebab-case 소문자(규칙 그림·음성의 `RuleId`만 대문자 그대로).
- 코드 단계는 자리표시 SVG(단순 도형)와 소리 없음으로 진행하고, 콘텐츠 단계에서 같은 이름으로 바꿔 넣습니다(plan.md 작업 단계 5). 그림·음성 제작 방법과 배경음 곡 선정은 사용자 결정 B15입니다.
- 직접 만들지 않은 소리·그림·글꼴을 채택하면 `CREDITS`에 행을 더합니다(FR-089). 사용조건을 확인하지 않은 파일은 넣지 않습니다.

## 7. 크레딧 "변경 사실" 문구 (FR-088)

`CREDITS`의 모델 8행 `changes`(data-model.md 2.1 Credit과 같은 문구):

| 대상 | 문구 |
|---|---|
| 차량 5종 | "poly.pizza가 원작 파일을 GLB 형식으로 변환해 배포한 파일을 사용했습니다. 게임에서 크기·방향·바닥 위치를 맞추고, 여러 부분을 재질별로 합쳐 표시합니다." |
| Cool Bannana Guy, Turtle | "poly.pizza가 변환한 GLB를 바탕으로 방향·크기·바닥 위치를 맞추고, 팔꿈치·손목 주변에 면을 나누는 선과 뼈대를 추가했습니다. 기본 자세·손 들기·좌우 보기·앉기 동작을 추가했으며 원래 재질을 유지했습니다." |
| Chicken Guy | "poly.pizza가 원작 파일을 GLB 형식으로 변환해 배포한 파일을 사용했습니다. 게임에서 크기·방향·바닥 위치를 맞추고, 포함된 걷기·서 있기 동작을 사용하며, 머리·손 관절을 움직여 왼쪽·오른쪽 보기와 손 들기를 표현합니다." |

- `sourceUrl`은 위 3장의 poly.pizza 모델 페이지, `licenseUrl`은 CC BY 3.0 `https://creativecommons.org/licenses/by/3.0/deed.ko`, CC0 `https://creativecommons.org/publicdomain/zero/1.0/deed.ko`. 모두 누를 수 없는 글자로 표시(FR-090).
- 라이선스: Cool Bannana Guy만 `CC0 1.0`, 나머지 7종 `CC BY 3.0`(2026-10-12 배포 페이지 표기, PRD).
