# Specification Quality Checklist: 아동용 3D 운전·보행 안전 게임 — 첫 버전

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-10-12
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Notes

- 1차 검증(2026-10-12)
  - 기술 용어 검사: 언어·엔진·라이브러리·저장 수단·파일 형식 이름은 본문에 없습니다. Assumptions에 "기술 선택은 plan 단계에서 정함"이라는 문장만 있습니다. SC-022의 배포 서비스 이름은 "실제 공개 주소"로 바꿨습니다.
  - [NEEDS CLARIFICATION] 1건 남음: FR-090 크레딧 외부 링크 처리 방식.
- 2차 검증(2026-10-12, 사용자 답변 반영)
  - Q1 답변 C: 크레딧의 원출처·라이선스 주소는 누를 수 없는 글자로만 표시합니다. FR-090을 확정하고, FR-086·SC-026·User Story 8 수용 시나리오 1을 "게임 전체에 눌러서 나가는 외부 링크 없음"으로 맞췄습니다.
  - constitution: 새로 시작한 토이 프로젝트라 정해진 표준이 없어 현재 두지 않는다는 사용자 결정을 Assumptions에 기록했습니다. 남아 있는 빈 양식은 원칙으로 쓰지 않으며, 이 체크리스트도 원칙 준수 여부를 판정하지 않습니다.
  - 전체 16개 항목 통과.
- 3차 검증(2026-10-12, 보행 안전 규칙 확대 반영)
  - 사용자 결정: 레이싱 열림 조건 유지(세 연습 완료), 새 내용은 기존 세 연습의 보행자 시점 안내와 마을 장면에 추가, 장면이 필요한 규칙 15개 모두 포함, 핵심 규칙은 매번·추가 규칙은 다시 할 때마다, PRD 함께 수정.
  - 반영: Clarifications 섹션, User Story 2 수용 시나리오 16~18, 예외 상황 3개, FR-039·FR-044~046 수정, FR-091~095 추가, "보행 안전 규칙 배정" 표(38개 문구 = 조사 규칙 41개, 조사 ID로 출처 추적), 핵심 엔티티 2개 추가, SC-027 확장·SC-030~031 추가, 가정과 범위 밖 갱신.
  - 확인: 남은 [NEEDS CLARIFICATION] 0건, FR 95개·SC 31개 번호 중복 없음, 조사 ID A 26개·B 15개 모두 표에 있음, 기술 이름 없음.
  - 규칙 문구는 공공기관 자료 기준이며, 2014년 단일 출처 규칙 3개(A18, A23, B3)와 출처 간 표현 차이 처리 방식은 Assumptions에 적었습니다.
  - 전체 16개 항목 통과.
- PRD 변경: `docs/PRD.md`의 범위 표, 플레이 흐름 6, 안전 연습 표와 근거 출처, 교육 표현 원칙, 연습의 완료 기준, 완성 기준 표, 개발 중 결정할 항목 표를 같은 결정으로 고쳤습니다.
- 4차 검증(2026-10-12, 사람 모델 3종 추가 반영)
  - 사용자 결정: `modeling/`에 추가된 사람 모델 3종(Chicken Guy, Cool Bannana Guy, Turtle)을 마을 보행자·차 안 탑승객·보행자 시점 안내의 주인공에 사용, 주인공은 차량 선택 뒤 아이가 고름(저장하지 않음), plan 전에 PRD·spec·용어집 함께 수정.
  - 반영: Clarifications, 요약, User Story 1(설명·독립 테스트·시나리오 12), User Story 2 시나리오 19, User Story 3·7·8, 예외 상황 1개, FR-002·004·011·049·078·088 수정, FR-096~097 추가, 핵심 엔티티(인물 종류 추가, 등장 보행자·보행자 시점 안내·현재 실행 상태·자료 출처 보강), 화면 흐름, SC-026 수정·SC-032 추가, 가정 2개 추가. 용어집에 "인물 종류", "탑승객" 추가.
  - 확인: 남은 [NEEDS CLARIFICATION] 0건, FR 97개·SC 32개 번호 중복 없음, 기술 이름 없음. 차량만 언급하는 남은 문장(FR-009, SC-001·002, User Story 1 시나리오 2·11)은 차량 선택·성능에 관한 것이라 그대로 둡니다.
  - 라이선스: poly.pizza 배포 페이지 확인(2026-10-12) — Chicken Guy·Turtle CC BY 3.0, Cool Bannana Guy CC0.
  - 전체 16개 항목 통과.
- 5차 검증(2026-10-12, plan 단계 사용자 결정 반영)
  - 사용자 결정: 등장 보행자와 보행자 시점 안내의 주인공은 Chicken Guy로 고정(손·머리 관절로 손 들기·좌우 보기), 인물 선택은 아이 차에 태울 탑승객으로 변경, "다시 하는 연습"은 이번 실행에서 완료했거나 튜토리얼 전체 완료 기록이 있는 연습, 규칙 표에만 있던 장면 요소 중 공·물건은 마을 장면 요소로·사람과 옷차림은 그림으로, 배포 직후 이전 파일이 사라진 로딩 실패는 다시 시도가 페이지를 새로 엶, 게임에는 poly.pizza 변환 파일 사용.
  - 반영: Clarifications "Session 2026-10-12 (plan 단계)" 7개, 요약, User Story 1(설명·시나리오 13 추가), User Story 2 시나리오 19 변경, User Story 3 시나리오 1(시작 버튼 전이면 그림만), 예외 상황 1개, FR-004·048·091·092·096·097 수정, SC-032 문구 정정("세 연습마다"가 아니라 해당 규칙 장면 모두), 핵심 엔티티(인물 종류·등장 보행자·장면 요소·보행자 시점 안내), SC-032 변경, 가정 1개 수정. 용어집 "인물 종류" 수정.
  - 확인: 남은 [NEEDS CLARIFICATION] 0건, FR 97개·SC 32개 번호 중복 없음, 기술 이름 없음(파일 형식 이름도 plan으로 넘김), 바뀌기 전 주인공 문구 잔존 0건.
  - 전체 16개 항목 통과.
- PRD 변경(4차): 맨 위 변경 줄, 범위 표(인물 행), 플레이 흐름 2·6, "제공된 차량·사람 모델" 섹션(사람 모델 표·라이선스·개발 시 확인할 사항), 완성 기준 표(인물 선택 행, 자료 사용), 개발 중 결정할 항목 표(사람 모델 역할과 동작).
- PRD 변경(5차, plan 단계): 맨 위 변경 줄, 범위 표 "인물" 행, 플레이 흐름 2, 제공 모델 섹션(poly.pizza 변환 파일 사용 문장, 개발 시 확인할 사항 2개), 완성 기준 "인물 선택" 행, 개발 중 결정할 항목 "사람 모델 역할과 동작" 행.
- 남은 의존 항목(불합격 사유 아님)
  - 성능 수치(로딩 시간, 화면 갱신)는 PRD가 초기 기기 점검으로 미뤘으므로 SC-024가 그 결과에 따릅니다.
  - SC-011의 "4분 30초~5분 30초"는 edge 분석가의 제안 허용 범위이며 트랙 플레이 점검에서 확정합니다.
- 분석 원본: `../_workspace/01_functional-analyst_analysis.md`, `../_workspace/01_domain-analyst_analysis.md`, `../_workspace/01_edge-analyst_analysis.md`, `../_workspace/02_pedestrian-safety-rules-research.md`
