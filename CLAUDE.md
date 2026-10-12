> **driving_game 프로젝트 적용 규칙:** 이 파일의 공통 지침이나 스킬·역할을 적용하기 전에 저장소 루트의 `AGENTS.md`를 읽습니다. IVI 전용 기술 규칙의 적용 여부와 프로젝트 기준은 그 파일에서 관리하며, 아래 예전 배포 본문·관리 블록과 연결된 원본을 읽을 때도 같은 기준을 적용합니다. 이미 읽은 파일은 반복해서 읽지 않습니다.

# CLAUDE.md (IVI 스펙 주도 개발)

> 이 파일은 `ivi-agent-guide/update-guide.sh`에 의해 프로젝트 루트에 배포됩니다.
> 현재 공통 규칙은 이 원본에서 관리합니다. 재배포는 프로젝트 CLAUDE.md/AGENTS.md의 연결 블록만 갱신하며, 블록 밖의 프로젝트 추가 규칙과 피처 정보를 보존합니다.

## 스펙 주도 개발 활성화 조건

**아래 조건이 충족될 때만 이 문서의 모든 규칙을 적용:**
- 현재 작업 디렉토리에 `.specify` 디렉토리가 존재할 것 (세션 시작 시 1회 확인)

조건이 충족되지 않으면 이 문서 전체를 무시한다.

## 헌법 참조 의무

세션 시작 시 `.specify/memory/constitution.md`가 존재하면:
1. 파일을 직접 읽는다 (기억에 의존 금지, 반드시 파일 읽기 도구 사용).
2. 응답 상단에 아래 형식으로 대분류 요약을 출력하여 이해를 증명한다:
   ```
   [Constitution] loaded
     ├ 섹션1: 핵심키워드
     ├ 섹션2: 핵심키워드
     └ 섹션N: 핵심키워드
   ```
3. 요약 출력 없이 작업을 시작하면 해당 세션의 산출물은 신뢰할 수 없는 것으로 간주한다.

## 세션 시작 절차

- 확인: "Spec-driven development mode active." (한 줄, 추가 설명 없이)
- 사용자가 작업 중인 spec-kit 단계를 컨텍스트에서 식별하거나 질문한다.
- Claude Code는 프로젝트에 설치된 `/speckit.*` 또는 `/speckit-*`, Codex는 `$speckit-<단계>`를 사용한다. 단계별 필수 원문과 승인 조건은 동일하다.
- Codex의 analyze/implement는 `.agents/skills/spec-<단계>-orchestrator/SKILL.md`를 읽는다. Spec Kit 기본 스킬과 별개다. specify/plan의 기존 역할 정의는 `ivi-agent-guide/claude-config/skills/`에서 읽고 현재 도구의 에이전트 기능으로 수행한다. 해당 기능이 없으면 같은 역할을 순차 수행하며 새 검증자를 추가하지 않는다.

## 단계별 필수 컨텍스트 (누적)

각 단계의 에이전트는 작업 시작 전 해당 범위의 모든 산출물을 Read하고, 이해를 증명하는 요약을 출력한 후 진행한다.

| 단계 | 필수 산출물 |
|------|-----------|
| constitution | 현재 도구의 글로벌/레포 지침 (CLAUDE.md 또는 AGENTS.md), ivi-agent-guide/*.md |
| specify | + .specify/memory/constitution.md |
| clarify | + specs/${current_feature}/spec.md |
| plan | (clarify와 동일) |
| tasks | + specs/${current_feature}/plan.md, specs/${current_feature}/contracts/, specs/${current_feature}/data-model.md |
| analyze | + specs/${current_feature}/tasks.md |
| implement | (analyze와 동일) |

> `${current_feature}`는 현재 작업 중인 피처의 디렉토리명입니다. (예: `specs/001-coupon-crud/`)

## 단계별 규칙

### constitution
- 결과물은 일회성 설정이 아닌, 살아있는 거버넌스 문서로 취급한다.
- 필수 포함: 코드 품질 표준, 테스트 전략, UX 일관성, 성능 목표, 보안 정책.

### specify
- **에이전트 팀**: `spec-specify-orchestrator` 스킬 사용 (functional-analyst, domain-analyst, edge-analyst로 구성).
- 사용자 입력을 최소 프레임워크로 취급, 완성된 스펙으로 보지 않는다.
- PM 관점에서 **엣지 케이스, 에러 처리, 데이터 검증, 보안 제약**을 능동적으로 도출한다.
- 구조: 요약 → 배경 → 기능 요구사항 → 엣지 케이스 → 데이터 모델.
- 구현 세부사항 포함 금지 (기술 선택, 아키텍처 없음).

### clarify
- 스펙에서 모호하거나 모순되거나 누락된 영역을 식별한다.
- 각 이슈를 구체적 질문으로 제시 (막연한 우려 금지).
- 이슈 유형 분류: `[AMBIGUOUS]`, `[CONTRADICTORY]`, `[MISSING]`, `[ASSUMPTION]`.
- 각 이슈에 대해 추천순으로 2~3개 해결안을 제시한다.
- 출력 형식 예시:
  ```
  [MISSING] FR-003: 만료된 쿠폰의 에러 처리
  - 이슈: 스펙에서 쿠폰 만료를 정의했지만 사용 시도 시 동작이 없음.
  - 옵션 A (권장): 특정 코드와 함께 에러 반환.
  - 옵션 B: 조용히 무시.
  ```

### plan
- **에이전트 팀**: `spec-plan-orchestrator` 스킬 사용 (architect, contract-designer, data-modeler로 구성).
- **고정 기술 스택**: 프로젝트(또는 constitution.md)에 이미 명시된 것만 사용. 새 의존성이 필요하면 이유를 명시한다.
- **기존 아키텍처 준수**: 프로젝트의 폴더 구조와 패턴을 정확히 따른다.
- **데이터 흐름 필수**: 데이터의 기원, 저장 방식, UI까지의 전달 경로를 기술한다.
- **보안 & 에러 처리**: 인증/인가 전략과 에러 처리를 명시한다.

### tasks
- **의존성 우선 정렬**: 기반 작업(스키마, 의존성)이 먼저.
- **원자적**: 각 태스크는 최대 1~2개 파일만 수정. "프론트엔드와 백엔드 구현" 같은 메가 태스크 금지.
- **검증 가능한 목표**: 모든 태스크에 구체적 검증 방법 포함 (테스트 커맨드, 빌드 체크, 수동 검증 단계).

### analyze
- **에이전트 팀**: `spec-analyze-orchestrator` 스킬 사용 (artifact-reviewer, code-reviewer, boundary-reviewer로 구성).
- **Orca 교차 검증**: `ivi-agent-guide/orca-cross-review.md`에 따라 세 역할을 실제 반대 도구 세션으로 실행한다. 같은 검증 세션에서 질문·답변·수정·재검증을 이어간다. 세 COMPLETE 보고서와 동일 revision을 확인하기 전에는 통과시키지 않는다.
- 교차 산출물 일관성 검증: spec ↔ plan ↔ tasks.
- 갭, 모순, 미커버 요구사항을 플래그한다.

### implement
- **에이전트 팀**: `spec-implement-orchestrator` 스킬 사용 (implementer, validator, reviewer로 구성).
- **Orca 교차 검증**: validator와 reviewer는 실제 반대 도구의 지속 세션이다. 같은 revision의 PASS와 APPROVE가 모두 필요하며, 수정 후 validator부터 재검증한다. 호출 실패·미수신·환경 문제는 BLOCKED이고 리더가 대신 승인하지 않는다.
- **수술적 변경만**: 태스크 목표 달성에 필요한 최소한의 코드만 수정. 관련 없는 파일/로직 터치 금지.
- **고아 코드 금지**: 변경으로 인해 미사용된 import/변수/함수는 정리한다.
- **추측 금지**: 스펙이나 태스크가 모호하면 멈추고 질문한다. 누락된 요구사항을 추론하지 않는다.
- **검증까지 루프**: 각 태스크 후 지정된 검증 방법을 실행. 확인 후에만 다음 태스크로 진행한다.


<!-- IVI-AGENT-GUIDE:BEGIN -->
이 블록은 update-guide.sh가 관리합니다. 프로젝트 추가 규칙은 블록 밖에 작성합니다.
현재 작업 디렉토리에 .specify가 있으면 `ivi-agent-guide/claude-config/CLAUDE.md`를 직접 읽고 적용합니다.
이 파일에 예전 배포본의 공통 규칙이 남아 있으면 연결된 현재 공통 규칙으로 대체하여 해석합니다.
프로젝트에서 추가한 규칙과 현재 피처 정보는 계속 적용합니다. 프로젝트 규칙과 충돌하면 내용을 보고하고 확인합니다.
analyze/implement에서는 현재 공통 규칙이 연결한 스킬과 `ivi-agent-guide/orca-cross-review.md`를 따릅니다.
<!-- IVI-AGENT-GUIDE:END -->
