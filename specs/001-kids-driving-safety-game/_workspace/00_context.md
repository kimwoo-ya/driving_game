# 00 Context — specify 단계 공유 컨텍스트

- 작성일: 2026-10-12
- 단계: specify (Spec Kit 0.14.2)
- FEATURE_DIR: `specs/001-kids-driving-safety-game/`
- PROJECT_ROOT: `/Users/kyw/Documents/git/mine/driving_game`

## 반드시 먼저 읽을 원문 (역할 파일보다 우선)

1. `/Users/kyw/Documents/git/mine/driving_game/AGENTS.md` — 프로젝트 지침. IVI 전용 기술 규칙(Java/Spring, JPA, 쿠폰 도메인, repomix 등)은 이 프로젝트의 기준이 아님.
2. `/Users/kyw/Documents/git/mine/driving_game/docs/PRD.md` — 사용자 확인 완료(2026-10-12)된 제품 범위. 범위의 기준.
3. `/Users/kyw/Documents/git/mine/driving_game/GLOSSARY.md` — 용어 기준.
4. `/Users/kyw/Documents/git/mine/driving_game/.specify/memory/constitution.md` — **아직 템플릿 자리표시자 상태(미작성)**. 확정된 원칙으로 쓰지 말 것.

## 프로젝트 사실

- 제품: 3~8세 아동용 한국어 3D 운전·보행 안전 모바일 웹게임. GitHub Pages(정적 호스팅)로 배포.
- 코드베이스: 아직 소스 코드·빌드 설정·엔티티 없음. `docs/PRD.md`, `GLOSSARY.md`, `modeling/`(차량 모델 ZIP 5개)만 존재.
- 서버·DB·로그인·REST API 없음. 데이터는 브라우저에만 저장(튜토리얼 완료 여부, 레이싱 최고 기록, 소리 설정).
- 기술 스택(언어·3D 엔진·라이브러리) 미정 — plan 단계에서 결정. specify 산출물에 기술 선택을 넣지 않는다.

## 이번 피처 범위

PRD의 "첫 버전" 전체를 하나의 피처로 명세한다. 각 User Story는 우선순위가 있고 독립적으로 검증 가능한 단위여야 한다.

## 역할 파일 치환 기준

| 역할 파일의 전제 | 이 프로젝트에서 대신 볼 것 |
|---|---|
| 쿠폰 엔티티·Service2·Repository2·repomix | PRD의 게임 상태·진행 기록·브라우저 저장 데이터 |
| 쿠폰 위험(중복 발급·초과 사용·만료 경합) | 게임 위험(입력 고착, 탭 전환·일시정지, 저장 실패, 역주행·코스 생략, 에셋 로딩 실패, 어린이 오해 유발 표현) |
| OWASP·인증/인가 | 개인정보 미수집, 외부 링크·음원 라이선스, 저장 데이터 변조 시 동작 |
| Kafka·REST 연동 | 정적 파일 로딩(하위 경로 배포), 브라우저 저장소, 오디오 자동재생 제한 |

## 출력 규칙

- 한국어로 작성. 기술 구현(엔진·라이브러리·API·파일 형식 선택) 금지 — What/Why만.
- PRD를 수정하지 않는다. PRD와 충돌하는 제안은 "PRD와 다름"으로 표시.
- 불명확 항목은 `[NEEDS CLARIFICATION]`. 단, PRD의 "개발 중 결정할 항목"(배경음악 곡, 바퀴 수, 성능 목표, 3D 기술, 바퀴 표현)은 이미 사용자 확인을 거친 미정 항목이므로 질문 대상이 아니라 Assumptions/의존성으로 다룬다.
