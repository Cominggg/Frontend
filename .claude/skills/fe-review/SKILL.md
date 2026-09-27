---
name: fe-review
description: Coming 프론트엔드 코드 작성 후 커밋·PR 전 필수 실행하는 FE 전문 코드 리뷰 스킬. 반응형 breakpoint, CSS Modules 페어링, 목 데이터 잔존, 로그인 모달·AdminRoute 인증 패턴, 디자인 토큰·접근성, 테스트·lint 통과 여부를 검토한다. "fe-review 해줘", "FE 코드 리뷰해줘", "프론트 리뷰해줘" 또는 Frontend 코드 작성 완료 후 커밋 전 검토를 요청하는 모든 상황에서 반드시 이 스킬을 사용한다.
---

# fe-review

변경된 Frontend 코드를 `references/fe-checklist.md` 기준으로 검토하고 심각도별 이슈를 보고한다.

## 참조 파일

- `references/fe-checklist.md` — 검토 항목, 심각도 기준, 판단 방법

## 실행 순서

1. 검토 대상을 정한다
   - 대상 확장자는 `.js`, `.jsx`, `.css`다. 그 외(`.md`, `package-lock.json` 등)는 검토하지 않고 보고의 "제외 파일"에만 적는다.
   - 커밋 전 변경사항 중 대상 확장자 파일이 있으면 그것을 검토한다 (커밋 전 모드)
     ```bash
     git diff HEAD --name-only                  # staged + unstaged
     git ls-files --others --exclude-standard   # untracked
     git diff HEAD
     ```
     untracked 파일은 diff가 없으므로 **파일 전체를 추가 라인**으로 본다.
   - 없으면(대상 확장자 외 변경만 있어도) 현재 브랜치 전체를 검토한다 (PR 게이트 모드)
     ```bash
     git diff --name-only origin/main...HEAD
     git diff origin/main...HEAD
     ```
   - 사용자가 파일·범위를 지정하면 그것을 우선한다.
   - 테스트 파일(`*.test.*`)이 대상에 있으면 `.claude/agents/write-tests.md`도 읽는다 (7번 항목 판단 기준).

2. 프로젝트 규칙을 로드한다
   - 루트 `CLAUDE.md`의 "핵심 규칙" 섹션을 읽는다.

3. 자동 검사를 실행한다
   ```bash
   npm run test
   npx eslint {검토 대상 .js/.jsx 파일}
   ```
   - lint는 **검토 대상 파일만**(untracked 포함) 실행한다.
   - test는 전체를 실행하되, 실패한 테스트가 검토 대상 파일(또는 그 파일이 import하는 대상)과 무관하면 🔴로 집계하지 않고 "기존 실패"로 따로 적는다.

4. `references/fe-checklist.md`의 체크리스트를 기준으로 검토한다
   - **이번 변경에서 추가·수정된 라인의 위반만** 이슈로 보고한다. 체크리스트의 grep이 변경하지 않은 라인의 기존 위반을 잡아도 결과에 포함하지 않는다 (lint와 같은 원칙).
   - 한 라인·블록이 여러 항목을 위반하면 가장 높은 심각도로 **한 건**으로 묶고, 나머지 위반은 같은 이슈 안에 함께 적는다.
   - 체크리스트 7개 범주에 없지만 명백한 결함(스타일 cascade 충돌, 시각 회귀, 런타임 오류 등)을 발견하면 "기타"로 보고하고 심각도 기준표에 따라 판단한다.
   - 체크리스트 분류와 루트 `CLAUDE.md` 핵심 규칙이 어긋나 보이면 `CLAUDE.md`를 우선한다.

   검토 범주:
   1. 반응형 breakpoint
   2. CSS Modules 페어링
   3. 목 데이터 잔존
   4. 인증·권한 패턴
   5. API·상태 관리
   6. 디자인 토큰·접근성
   7. 테스트·lint

5. 심각도별로 이슈를 정리해 보고한다. 각 이슈에는 `파일:라인`, 위반 항목, 수정 방향을 포함한다.

6. 🔴 critical 이슈가 있으면 수정 후 재실행을 요청한다. 없으면 커밋 진행을 승인한다. 이 스킬은 코드를 직접 수정하지 않는다.

## 결과 보고

```
=== FE 코드 리뷰 결과 ===
검토 범위: {커밋 전 변경사항 | origin/main...HEAD}
검토 파일: {파일 목록}
제외 파일: {대상 확장자 외 파일 목록 | 없음}
자동 검사: test {통과|실패 N건 (+ 기존 실패 N건)} / lint(검토 파일) {통과|에러 N건}

🔴 critical: {N}건
🟡 warning:  {N}건
🔵 suggestion: {N}건

{이슈 상세 목록}

{🔴 없으면: "✅ 커밋 진행 가능"}
{🔴 있으면: "🚫 커밋 전 critical 이슈를 수정하세요"}
```
