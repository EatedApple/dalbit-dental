# Apps Script 백엔드 배포 가이드

이 폴더의 `Code.gs`는 `dalbit-cms-backend` Apps Script 프로젝트의 미러본입니다.
실제 코드는 Google 서버에서 실행되며, 이 파일은 버전관리용 사본.

## 배포 절차 (한 번만)

1. **Apps Script 편집기 열기**
   - `https://docs.google.com/spreadsheets/d/1M0bUtv30ZLHLfyB3JXHTUSeM2n-fZjkbU1Zu43IFwmo/edit`
   - 상단 메뉴: 확장 프로그램 → Apps Script

2. **코드 붙여넣기**
   - 기본 `function myFunction() {}` 다 지우고
   - 이 폴더 `Code.gs` 내용 전체 복붙
   - 디스크 모양 아이콘 클릭 (또는 Ctrl+S)으로 저장

3. **Script Properties 설정**
   - 왼쪽 톱니바퀴 (프로젝트 설정) → 스크립트 속성 → 스크립트 속성 추가
   - `PASSWORD` = 본인이 정한 admin 비번 (예: `dalbit2026!`)
   - `GITHUB_PAT` = GitHub PAT (나중에 추가해도 됨)

4. **권한 승인 (최초 1회)**
   - 상단 함수 드롭다운에서 `doGet` 선택 → 실행 버튼
   - 권한 요청 팝업 → "고급" → "안전하지 않은 페이지로 이동" → 허용
   - (시트 + 외부 fetch 권한 필요)

5. **웹 앱으로 배포**
   - 우측 상단 "배포" → "새 배포"
   - 유형: 웹 앱
   - 설명: `v1`
   - 실행: 본인(dalbitadmin@gmail.com)
   - 액세스: **모든 사용자** (인증은 PASSWORD로 자체 처리)
   - 배포 클릭 → 웹 앱 URL 복사
   - URL 형태: `https://script.google.com/macros/s/AKfyc.../exec`

## 헬스 체크

브라우저에서 위 URL 직접 열기 → `{"ok":true,"ping":"pong",...}` 보이면 정상.

## 코드 업데이트 시

1. `Code.gs` 수정
2. Apps Script 편집기에서도 같은 변경 적용
3. 배포 → 배포 관리 → 연필 아이콘 → 버전 "새 버전" → 배포
   (URL은 그대로 유지됨)
