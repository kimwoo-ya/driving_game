# 브라우저 저장 계약

- 대상: `src/storage/save.ts`(localStorage를 만지는 유일한 파일)와 그 호출자 `src/app/flow.ts`, `src/main.ts`.
- 필드·검사 표·합치기 규칙의 기준은 [data-model.md](../data-model.md) 5장입니다. 이 문서는 키·버전·바깥 함수 모양·실패 동작·시험 기대 결과를 정합니다.
- 저장하는 것은 세 가지뿐입니다: 튜토리얼 전체 완료 여부, 레이싱 최고 기록, 소리 설정(FR-078). 선택 차량·인물, 미완료 연습, 경기 중 위치, 보여 준 추가 규칙, 개인정보·기기 식별 값은 저장하지 않습니다(FR-078, FR-084, FR-091).

## 1. 키와 형식 버전

| 항목 | 값 |
|---|---|
| 저장소 | `window.localStorage`(출처 = `https://kimwoo-ya.github.io`, 같은 소유자의 다른 Pages 저장소와 공유) |
| 키 | `driving_game:save` (프로젝트 이름을 붙여 같은 출처의 다른 게임과 섞이지 않게 함) |
| 시험 키 | `driving_game:probe` — `loadSave` 때 `'1'`을 쓰고 바로 지움. 값이 남지 않음 |
| 형식 버전 | `v: 1`. 다른 값(없음·문자열·2 이상)은 "모르는 형식" → 3항목 기본값, 다음 저장 때 `v: 1`로 덮어씀(data-model.md 5.7) |
| 값 | `JSON.stringify(SaveDataV1)` 한 줄 |

정상 예:

```json
{ "v": 1, "tutorialDone": true, "best": { "trackConfigKey": "main:1:2", "timeCs": 29520 }, "sound": { "music": true, "voiceSfx": false } }
```

- `timeCs` 29520 = 4분 55초 20(`formatRecord` → `4:55.20`). 단위는 1/100초 정수(02 결정 B3).
- `trackConfigKey` = `trackConfigKey(TRACK)` = `"<id>:<revision>:<laps>"`. 지금 트랙 구성과 다르면 그 기록은 "기록 없음"으로 보고 비교하지 않습니다(FR-082).
- 첫 방문 예: 키 없음(`getItem` → `null`) → 3항목 기본값, 안내 없음.

## 2. 함수

```ts
export const MAX_RECORD_CS = 35_999_999; // 99:59:59.99

export function parseSave(raw: string | null, trackConfigKey: string):
  { tutorialDone: boolean; best: BestRecord | null; sound: SoundSettings | null };

export function loadSave(trackConfigKey: string): { data: SaveDataV1; ok: boolean };

export function commitSave(
  current: Omit<SaveDataV1, 'v'>,            // 보통 RunState의 tutorialDone·best·sound
  changed: 'tutorial' | 'best' | 'sound',
  trackConfigKey: string,
): boolean;
```

| 함수 | 하는 일 | 돌려주는 것 | 던지나 |
|---|---|---|---|
| `parseSave` | 순수 함수. `JSON.parse`(try) → 객체 ∧ `v === 1` 확인 → 항목별 검사(data-model.md 5.2). 알려진 필드만 새 객체로 옮김 | 통과한 항목은 값, 틀린 `best`는 `null`, 틀린 `sound`는 `null`(합치기에서 "저장값 없음"으로 쓰기 위해) | 아니요 |
| `loadSave` | `localStorage.getItem` → `parseSave` → 틀린 `sound`를 `{ music: true, voiceSfx: true }`로 채움 → `setItem(probe, '1')`·`removeItem(probe)` | `data`: 기본값이 채워진 `SaveDataV1`. `ok`: 저장소 API(접근·읽기·시험 쓰기·지우기) 중 하나라도 예외면 `false` | 아니요(모든 접근이 `try` 안) |
| `commitSave` | **최신 값 다시 읽기 → `parseSave` → 항목별 합치기 → `setItem`** 한 경로 | 쓰기에 성공하면 `true`, 저장소 API 예외면 `false` | 아니요 |

- 호출자는 결과를 기다리지 않습니다. 모두 동기라 그 틱 안에서 끝납니다(FR-077, FR-080 "레이싱 열림·결과 화면이 늦어지지 않음").
- `commitSave`는 안내를 직접 띄우지 않습니다. `false`를 받은 flow가 `run.storageNoticeShown`이 거짓일 때만 `storageNotice` 겹침을 켜고 `storageNoticeShown = true`로 둡니다(실행당 1회, SC-017).
- 시험: Vitest(node)에서 `vi.stubGlobal('localStorage', 가짜)`로 바꿔 끼웁니다. 접근 예외는 getter가 `DOMException('…', 'SecurityError')`를 던지게, 쓰기 예외는 `setItem`이 `QuotaExceededError`를 던지게 만듭니다. 그래서 함수에 저장소 매개변수를 두지 않습니다.

## 3. 합치기 규칙 (FR-083, SC-019)

| 항목 | 합친 값 | 이유 |
|---|---|---|
| `tutorialDone` | `저장값 \|\| current.tutorialDone` | 게임 동작으로 미완료로 되돌아가지 않음 |
| `best` | 같은 구성끼리 더 짧은 쪽(같으면 저장값 유지). 저장값이 다른 구성이면 `parseSave`에서 이미 `null` → `current.best` | 더 나쁜 기록이 좋은 기록을 덮지 않음(FR-064) |
| `sound` | `changed === 'sound'` 또는 저장값이 `null`이면 `current.sound`, 아니면 저장값 | 소리 설정은 마지막 변경을 따름. 다른 탭의 변경을 덮지 않음 |

- 다른 탭이 남긴 `tutorialDone: true`를 이 탭의 레이싱 열림에 바로 반영하지 않습니다(다음 새로 고침 때 반영, data-model.md 5.5). `storage` 이벤트는 듣지 않습니다.
- 한계(받아들임): 읽기와 쓰기 사이의 아주 짧은 틈에 다른 탭이 쓰면 그 값이 덮일 수 있습니다. 브라우저가 탭 사이 잠금을 주지 않기 때문이며, 문제가 보이면 "쓴 뒤 다시 읽어 비교" 단계를 더합니다.

## 4. 읽기·쓰기 시점

| 시점 | 호출 | 근거 |
|---|---|---|
| 부팅(`boot` → `loading`) | `loadSave(trackConfigKey(TRACK))` → `createRunState(data)`. `ok === false`면 `storageNotice` 1회 | FR-079, FR-080, US3-8 |
| 세 번째 상황 완료 순간 | `commitSave(run, 'tutorial', key)` | FR-047 |
| 플레이어 완주 순간 | `loadSave(key).data.best`로 최신 기록을 읽어 `finishResult` 계산 → `isNewBest`일 때만 `commitSave(run, 'best', key)` | FR-063, FR-064 |
| 소리 설정 변경 순간 | `commitSave(run, 'sound', key)` | FR-069 |
| 그 밖 | 읽지도 쓰지도 않음(매 틱 저장 없음) | — |

## 5. 실패 동작 (FR-080, 02 결정 B9)

| 상황 | 동작 | 안내 |
|---|---|---|
| 저장소 접근 자체가 막힘(`SecurityError`, 사생활 보호·차단) | 3항목 기본값으로 시작, 이번 실행 값(`RunState`)으로 계속 | `storageNotice` 실행당 1회 |
| 읽기는 되지만 시험 쓰기 실패(공간 부족 등) | 읽은 값 사용, 이번 실행 값으로 계속 | 1회 |
| 처음에는 되다가 나중 `commitSave` 실패 | 메모리 값 그대로 진행, 다음 저장 때 다시 시도 | 아직 안 보였으면 1회 |
| 값 손상·변조·모르는 형식(저장소 API는 정상) | 틀린 항목만 기본값, 정상 항목은 그대로 | **없음**(조용히) |
| 완료 여부를 `true`로 바꾼 변조 | 정상 값으로 받아 레이싱 열림(다른 사람에게 영향 없음) | 없음 |

- 저장이 안 되는 실행에서도 이번 실행에서 세 상황을 마치면 레이싱이 열리고, 최고 기록·소리 설정이 이번 실행 동안 유지됩니다(`RunState`가 늘 진짜 값, 저장소는 사본). 새로 고침 뒤에는 다시 잠깁니다(US3-8).
- 저장 값을 화면에 내보내는 것은 검사를 통과한 정수 `timeCs`를 `formatRecord`로 바꾼 글자뿐이고 `textContent`로 넣습니다. `trackConfigKey` 문자열은 비교에만 씁니다(FR-081).

## 6. 손상·변조 시험 6종 (SC-018)

현재 트랙 구성 키를 `"main:1:2"`로 두고 `loadSave`의 `data`를 봅니다. 모든 경우 `ok === true`(저장소 API는 정상), 멈춤·빈 화면·이상한 값 표시 0건이어야 합니다.

| # | 시험 | 저장 원문(`driving_game:save` 값) | 기대 `data` |
|---|---|---|---|
| 1 | 빈 값 | `""` | `{ v: 1, tutorialDone: false, best: null, sound: { music: true, voiceSfx: true } }` (파싱 실패) |
| 1b | 빈 객체 | `{}` | 위와 같음(`v` 없음 → 모르는 형식) |
| 2 | 잘못된 형식 | `abc`, `[1,2]`, `{"v":1,"tutorialDone":tr` | 3항목 기본값 |
| 3 | 숫자가 아닌 기록 | `{"v":1,"tutorialDone":true,"best":{"trackConfigKey":"main:1:2","timeCs":"29520"},"sound":{"music":false,"voiceSfx":true}}` | `tutorialDone: true`, `best: null`, `sound: { music: false, voiceSfx: true }` (기록만 버림) |
| 4 | 0 이하 기록 | 위에서 `"timeCs":0` 또는 `"timeCs":-5` | `best: null`, 나머지 유지 |
| 5 | 무한대 기록 | 위에서 `"timeCs":1e999`(파싱 결과 `Infinity`) | `best: null`, 나머지 유지(`Number.isSafeInteger` 거짓) |
| 6 | 모르는 형식 | `{"v":2,"tutorialDone":true}` 또는 `v` 없는 객체 | 3항목 기본값 |

추가로 확인할 경계(같은 테스트 파일):

| 경우 | 기대 |
|---|---|
| `"timeCs":35999999`(= `MAX_RECORD_CS`) | 유지 |
| `"timeCs":36000000`, `"timeCs":295.2` | `best: null` |
| `"trackConfigKey":"main:1:1"`(바퀴 수가 다른 구성) | `best: null`(비교 안 함, FR-082) |
| `"tutorialDone":"true"`(문자열) | `tutorialDone: false` |
| `"sound":{"music":1,"voiceSfx":true}` | `sound` 기본값, 나머지 유지 |
| 알려지지 않은 필드 `"__proto__":{"x":1}`, `"extra":1` | 무시, 다음 `commitSave` 때 사라짐 |

## 7. 두 탭 시험 (SC-019)

| 순서 | 기대 저장 결과 |
|---|---|
| 탭 A 기록 30000 저장 → 탭 B(시작 때 기록 없음)가 31000으로 완주 | 탭 B의 `finishResult`: `storedBest = 30000` → `isNewBest = false`, 저장 안 함. 저장값 30000 유지 |
| 탭 A `tutorialDone: true` 저장 → 탭 B(시작 때 미완료)가 소리 설정 변경 | 합친 값 `tutorialDone: true` 유지, `sound`는 탭 B 값 |
| 탭 A가 소리 끔 → 탭 B가 기록 저장 | 합친 값 `sound`는 탭 A 값(소리 변경이 아닌 저장은 저장값 유지) |
