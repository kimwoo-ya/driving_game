# Task US8 Implementation Log (크레딧 T094~T096)

- 작성: 2026-10-13, 구현자 = 조율자 Claude Code(Opus 5.5) 세션
- 범위: T094 `CREDITS` 모델 8행 + 콘텐츠 검사 #19, T095 크레딧 화면·start ⇄ credits, T096 E2E 2건. 첫 공개 배포 범위(사용자 결정 "안전 연습까지 완성 후 배포", 크레딧은 공개 배포 필수 조건)
- 함께 넣은 것: US2 reviewer 비필수 제안 ②(task-US2_review.md) — `#controls[data-demo]` 애니메이션 뒤 강조 깜빡임 이어지게 `style.css` 한 줄
- 검증 방식: 사용자 결정(검증 방식 재조정) — 덩어리 끝에 검증자·리뷰어 1번씩, 스펙 대조 + 테스트 실행

## 변경 파일

| 태스크 | 파일 | 내용 |
|---|---|---|
| T094 | `src/content/credits.ts`(신설) | `Credit`, `CreditId`(= 차량·인물 ID), `CREDITS` 8행: data-model.md 2.1 표의 작품명·제작자·원출처·라이선스, licenseUrl(CC BY 3.0 / CC0 deed.ko), `changes` = assets.md 7장 문구 세 가지, `checkedOn: '2026-10-12'`. 음원 0행(02 결정 B15) |
| T094 | `tests/unit/content.test.ts` | #19: 모델 행의 ID 집합 = 차량 5 + 인물 3, kind 맞음, 필수 필드 비어 있지 않음, checkedOn 형식, 라이선스가 PRD 표(cool-banana-guy만 CC0 1.0, 나머지 CC BY 3.0) |
| T095 | `src/ui/screens.ts` | `showStart(ui, onStart, onCredits)`(시작 + 오른쪽 위 작은 크레딧 버튼, 보호자용), `showCredits(ui, onBack)`(행마다 작품명 — 제작자 / 원출처 / 라이선스(주소) / 변경, 모두 `textContent`, `<a>` 없음, 돌아가기 버튼). 버튼 만드는 작은 도우미 `button()` |
| T095 | `src/app/flow.ts` | `start` ⇄ `credits`(지금 화면이 맞을 때만, 연타 무시 규칙과 같음) |
| T095 | `src/style.css` | 작은 버튼(`.corner-button`), 자리표시 도형 `info`·`back`, 크레딧 목록(이 목록만 세로로 넘겨 보기 `touch-action: pan-y`, 주소를 골라 볼 수 있게 `user-select: text`) |
| T096 | `tests/e2e/credits.spec.ts`(신설) | ① 시작 → 크레딧 8행의 작품명·라이선스·원출처·변경 문구 → 돌아가기 → start ② start·credits·pickVehicle·pickCharacter에서 `a[href]` 0 |

## 판단 메모(검토 요청)

1. T096의 `practiceMenu`(저장값 주입) 화면은 T063(첫 배포 뒤)이라 아직 없음 → 이번 E2E에서 뺐고, 화면이 생기면 같은 시험에 더함(시험 안 주석).
2. 크레딧 버튼·돌아가기 그림 파일은 없어 자리표시 도형(plan D4). 그림은 T103.
3. 원출처·라이선스 주소는 글자로만 보여 주고, 보호자가 옮겨 적을 수 있게 목록 안만 글자 선택을 허용함(나머지 화면은 선택 막힘 그대로).

## 자체 검증

| 명령 | 종료 코드 | 결과 |
|---|---|---|
| `npm run typecheck` | 0 | 오류 없음 |
| `npm test` | 0 | 14 files, 130 passed |
| `npm run build` | 0 | 성공(500 kB 청크 경고 기존과 같음) |
| `npm run test:e2e` | 0 | 26 passed(크레딧 2건 × 두 엔진 추가) |
| 화면 확인(저장소 밖 스크립트, 932×430) | 0 | 시작 화면 오른쪽 위 크레딧 버튼, 크레딧 목록 8행·돌아가기 |
