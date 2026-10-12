# 캐릭터 리깅 추가 및 도구 설치 기록

- 작업일: 2026-10-12
- 사용자 요청: Blender 설치, 공식 Blender MCP 설치, 캐릭터 리깅 추가, GLB 저장, 관련 스펙 문서 수정.
- 완료 범위: Blender와 공식 MCP 설치·연결 확인, 정적 캐릭터 2종 리깅, 캐릭터 GLB 3종 준비, 모델 단위 검증.
- 제품 범위: 등장 보행자·교육 안내 주인공은 Chicken Guy, 선택 인물은 아이 차의 탑승객이라는 기존 결정을 유지합니다. 리깅이 추가되었다고 보행자 선택 기능을 추가하지 않습니다.

## 설치 결과

| 항목 | 확인 결과 |
|---|---|
| Blender | 공식 배포 파일을 Homebrew로 설치했습니다. `/Applications/Blender.app`, `blender --version` → `5.2.2 LTS`, 종료 코드 0입니다. |
| 공식 MCP 원본 | [Blender Lab 안내](https://www.blender.org/lab/mcp-server/)가 연결한 [공식 저장소](https://projects.blender.org/lab/blender_mcp)를 사용했습니다. 커뮤니티의 동명 패키지와 구분합니다. |
| 설치 위치 | `~/.local/share/blender-mcp-official/`, 원본 커밋 `dbbf836ad4b1025f14a2b3b504c43903f39e0b04`입니다. 서버 패키지 버전은 `1.0.2`, 이 커밋의 애드온 버전은 `1.0.0`입니다. |
| Blender 애드온 | 공식 소스로 확장 ZIP을 빌드하여 `bl_ext.user_default.mcp`로 설치·활성화했습니다. |
| Codex 연결 | `~/.codex/config.toml`의 `mcp_servers.blender-official`에 전용 가상환경의 서버 실행 파일을 등록했습니다. 기존 다른 MCP 설정은 유지했습니다. |
| 통신 범위 | Blender 애드온은 `127.0.0.1:9876`에서만 연결을 받습니다. Blender 실행 시 자동 시작하도록 설정했습니다. |
| 동작 확인 | MCP 초기 연결, 도구 26개 조회, `execute_blender_code`로 Blender 버전·애드온 조회를 수행했습니다. 이후 실제 리깅·렌더링도 이 도구로 실행했습니다. [연결 결과](rigging/mcp-smoke.json) |

Codex의 다음 세션에서 `blender-official` 도구를 불러올 수 있습니다. 현재 세션에서는 MCP 클라이언트로 공식 서버에 직접 연결해 검증했습니다. Blender가 실행 중이어야 일반 MCP 도구를 사용할 수 있습니다.

화면 없이 연결할 때 사용할 명령입니다. 같은 포트의 Blender가 이미 실행 중이면 중복 실행하지 않습니다.

```sh
blender --background --online-mode --command blender_mcp --host 127.0.0.1 --port 9876
```

## 저장한 모델

| 캐릭터 | 결과 | 파일 |
|---|---|---|
| Cool Bannana Guy | 새 뼈대 16개, 스킨 1개, 동작 5개. 650,360바이트입니다. | [게임용 GLB](../../../src/assets/models/cool-banana-guy.glb), [편집용 Blender 파일](../../../assets-source/characters/cool-banana-guy.blend) |
| Turtle | 새 뼈대 16개, 스킨 1개, 동작 5개. 145,472바이트입니다. | [게임용 GLB](../../../src/assets/models/turtle.glb), [편집용 Blender 파일](../../../assets-source/characters/turtle.blend) |
| Chicken Guy | 기존 뼈대·스킨 2개·동작 5개를 보존했습니다. 원본 GLB와 SHA-256이 같습니다. 282,604바이트입니다. | [게임용 GLB](../../../src/assets/models/chicken-guy.glb) |

두 새 리그의 뼈대는 `Root`, `Pelvis`, `Spine`, `Head`, 좌우 `UpperArm`, `Forearm`, `Hand`, `Thigh`, `Shin`, `Foot`입니다. 좌우 접미사는 `.L`, `.R`입니다. `Root`는 전체 조작용이며 나머지 15개가 몸을 변형합니다. 손가락별 관절은 추가하지 않았습니다.

수정본의 기준 자세는 키 2 m, 바닥 높이 0, GLB에서 위쪽 +Y·앞쪽 +Z입니다. 게임에서 정한 인물 기준 키 1 m로 바꾸는 기존 로딩 단계는 그대로 적용합니다. 수정본 두 캐릭터의 `yawDeg`는 0입니다.

### 동작

| 이름 | 내용 |
|---|---|
| `Idle` | 팔을 내린 기본 자세입니다. |
| `RaiseHand` | 왼팔과 팔꿈치를 움직여 손을 올렸다가 기본 자세로 돌아옵니다. |
| `LookLeft`, `LookRight` | 머리를 좌우로 25도 돌렸다가 돌아옵니다. 바나나는 얼굴이 붙은 몸 윗부분이 함께 돌아갑니다. |
| `Sit` | 양쪽 고관절·무릎을 굽혔다가 돌아오는 자세 확인용 동작입니다. |

동작은 24 fps, 1~48프레임이며 16~32프레임에서 목표 자세를 유지합니다. 좌석에 앉힌 자세를 계속 유지하려면 이 구간의 자세를 고정하는 처리가 필요합니다. 차량별 좌석 배치와 게임 코드 연결은 후속 구현 범위입니다. 두 캐릭터의 걷기 동작은 제작하지 않았습니다. 기존 콘텐츠 타입에는 두 모델의 `clips.idle = 'Idle'`만 연결하고, 나머지 클립은 에셋에 포함된 동작으로 기록합니다.

### 미리보기

| 캐릭터 | 손 들기 | 좌우 보기 | 앉기 |
|---|---|---|---|
| Cool Bannana Guy | [보기](rigging/cool-banana-guy-RaiseHand.png) | [보기](rigging/cool-banana-guy-LookLeft.png) | [보기](rigging/cool-banana-guy-Sit.png) |
| Turtle | [보기](rigging/turtle-RaiseHand.png) | [보기](rigging/turtle-LookLeft.png) | [보기](rigging/turtle-Sit.png) |

## 원본 보존과 출처

- `modeling/` ZIP은 추출·수정·교체하지 않았습니다. 입력은 poly.pizza의 GLB 3개이며 작업용 임시 폴더에 따로 받았습니다.
- 입력 GLB 해시는 [생성 기록](rigging/build-report.json)의 `source_sha256`, 최종 GLB 해시는 [SHA256SUMS](../../../src/assets/models/SHA256SUMS)에 있습니다.
- 수정본과 함께 [출처·라이선스·변경 내역](../../../src/assets/models/CREDITS.md)을 저장했습니다. 기존 작품명·제작자·라이선스에 리깅과 자세 추가 사실을 덧붙였습니다.
- 과거 `_workspace/01_*` 보고서의 “바나나·거북이는 정적 메시”는 원본 조사 당시 사실입니다. 게임에 넣을 수정본의 현재 상태는 이 기록과 갱신한 `contracts/assets.md`를 따릅니다.

## 검증 결과

| 검사 | 결과와 근거 |
|---|---|
| 뼈대 연결 | 변형용 뼈대 15개를 각각 회전시켜 실제 정점 이동을 확인했습니다. 모든 정점의 가중치 합이 1이며 영향을 주는 뼈대는 최대 4개입니다. [생성 기록](rigging/build-report.json) |
| 잘못된 변형 방지 | 팔 끝 전체가 움직이고, 팔을 올려도 몸통이 끌려가지 않는지 검사했습니다. 초기 잘못된 연결을 재현한 뒤 모델별 연결 범위를 수정했습니다. |
| GLB 재로딩 | 별도 Blender 프로세스에서 완성 GLB 3개를 다시 열었습니다. 새 리그 2종의 5개 클립, 손 상승, 머리 회전, 다리의 전방 이동과 재질·이미지 내장을 확인했습니다. 종료 코드 0입니다. [재로딩 검사](rigging/roundtrip-report.json) |
| glTF 표준 검사 | Khronos `gltf-validator` 2.0.0-dev.3.10으로 검사했습니다. 새 리그 2종은 오류 0·경고 0입니다. Turtle에는 사용하지 않는 텍스처 좌표 정보 4건이 있습니다. [검사 원문](rigging/gltf-validator-report.json) |
| Chicken Guy | 원본을 그대로 보존했으며 오류 0·기존 경고 4입니다. 스킨 메시의 부모·로컬 변환에 관한 경고로, 실제 게임에서 전체 크기 조절과 복제를 확인해야 합니다. |
| 육안 확인 | 새 리그의 기본 자세·손 들기·좌우 보기·앉기 이미지를 렌더링해 늘어짐과 몸통 끌림을 확인했습니다. |

Blender 내보내기는 부모가 없는 스킨 메시의 뼈대를 이름으로 찾는다는 경고를 출력합니다. 모델마다 뼈대가 하나이고, 실제 내보낸 GLB를 다시 불러와 연결과 동작을 검사했습니다. 수정본은 GLB의 메시·뼈대를 장면 루트에 두어 스킨 메시 부모 변환 경고를 피합니다.

실행 명령:

```sh
blender --background --python-exit-code 1 --python scripts/verify-character-rigs.py
(cd src/assets/models && shasum -a 256 -c SHA256SUMS)
```

검증은 모델 단위입니다. 게임 실행, three.js에서의 복제·애니메이션 재생, 인물 3종 × 차량 5종의 좌석 배치, 모바일 성능, 어린이 플레이 관찰을 통과했다는 의미는 아닙니다.

## 다시 생성하기

[생성 스크립트](../../../scripts/rig-characters.py)는 원본 GLB 3개가 들어 있는 폴더를 입력받습니다. 원본 해시가 다르면 중단합니다. 원본 다운로드 주소는 [에셋 목록](../contracts/assets.md)에 있으며, 반드시 게임용 수정본과 다른 폴더에 받습니다.

```sh
blender --background --python-exit-code 1 --python scripts/rig-characters.py -- /path/to/original-glbs
```

생성 스크립트는 `src/assets/models/`, `assets-source/characters/`, 이 폴더의 `rigging/`에 만든 결과물을 교체합니다. 수작업으로 수정한 결과가 있으면 먼저 별도로 보관합니다. 다시 생성한 뒤에는 재로딩 검사와 표준 검사를 다시 수행하고 체크섬 기록을 맞춥니다.
