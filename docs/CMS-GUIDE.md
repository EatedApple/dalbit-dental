# 서버 없이 만드는 무료 CMS 가이드

> 정적 HTML 사이트에 **비개발자도 쉽게 쓰는 관리자 페이지(/admin)** 를 붙이고,
> **본인이 운영할 서버 0대 + 영구 무료**로 굴리는 방법.

이 문서는 달빛치과 홈페이지를 만들면서 실제 적용한 아키텍처를 정리한 것입니다.
외주 납품처럼 "운영비를 더 받기 어려운" 상황에 특히 적합합니다.

---

## 한 줄 요약

```
클라이언트가 /admin에서 글/이미지 수정 → 1분 안에 사이트 자동 반영
운영비: 0원 / 본인 서버: 0대 / 클라이언트 학습 곡선: 비번 하나
```

---

## 왜 이렇게 만들었나 (제약조건)

이 구조는 다음 상황을 동시에 만족시켜야 했습니다:

1. **운영비 0원** — 외주 납품물이라 월 비용 못 받음
2. **한도 사고 0** — 무료 플랜 한도 초과로 사이트 편집이 죽으면 안 됨 (Netlify Identity가 한도 초과로 막힌 게 시작점)
3. **클라이언트 = 컴퓨터 거의 모름** — 이메일+비번 외엔 학습 불가
4. **`/admin` URL 유지** — 기존 클라이언트 안내문/북마크 그대로
5. **private repo 유지** — 코드 노출 X (GitHub Pro)
6. **본인이 운영할 서버 0대** — 외주 납품 후 손 떼야 함

흔한 답들이 왜 안 되는지:
- **Netlify CMS / Netlify Identity** — 한도 사고 위험, Identity는 신규 가입 sunset
- **Decap CMS + Cloudflare Workers OAuth** — 클라이언트가 GitHub 계정 필요 (학습 부담)
- **TinaCloud / 다른 SaaS CMS** — 무료 한도 초과 또는 유료
- **자체 admin 서버** — 본인이 EC2/VPS 관리해야 함, 외주 납품 후에도

→ 결론: **Google Sheet (저장) + Apps Script (백엔드) + GitHub Action (배포)** 조합.

---

## 아키텍처 한 장

```
┌─ 클라이언트 (브라우저) ──────────────────────────────┐
│                                                      │
│   사이트.com/admin                                    │
│      ↓ 비번 로그인                                   │
│      ↓ 폼 편집                                        │
│      ↓ 저장 클릭                                      │
└──────┬───────────────────────────────────────────────┘
       │
       │ HTTPS POST (action=write, file, content)
       ▼
┌─ Google Apps Script (Google이 무료로 호스팅) ────────┐
│   - 비번 검증                                         │
│   - Google Sheet에 변경사항 기록                      │
│   - GitHub repository_dispatch 트리거                 │
│   - 이미지면 GitHub Contents API로 직접 commit        │
└──┬─────────────────────────────────┬─────────────────┘
   │                                 │
   ▼                                 ▼
┌─ Google Sheet ─┐         ┌─ GitHub Repo (private) ──┐
│ 단일 진실 소스  │         │  ↑ Action이 sheet 내용 받아  │
│ filename | json│  ←─────  │   content/*.json 으로 commit│
└────────────────┘         │  imgs/ 에 이미지 commit       │
                           └────────────┬─────────────────┘
                                        │
                                        ▼
                           ┌─ EC2 (정적 호스팅) ──────────┐
                           │  cron으로 1분마다 git pull   │
                           │  nginx/apache로 정적 서빙    │
                           └────────────┬─────────────────┘
                                        │
                                        ▼
                           ┌─ 방문자 (브라우저) ────────┐
                           │  사이트.com 에서 컨텐츠 봄  │
                           └─────────────────────────────┘
```

---

## 구성 요소 (각자 0원)

| 구성 요소 | 역할 | 비용 | 한도 |
|---|---|---|---|
| **EC2** (또는 GitHub Pages) | 정적 사이트 호스팅 | 기존 인프라 | — |
| **GitHub repo** | 소스 + 콘텐츠 저장 | $0 (Pro) | 무한 |
| **Google Sheet** | 콘텐츠 저장 | $0 | 사실상 무한 |
| **Google Apps Script** | 백엔드 API (인증/CRUD/GitHub 연동) | $0 | 일 6분 실행, 우리 용도엔 0.0001%도 안 씀 |
| **GitHub Action** | Sheet → repo 자동 sync | $0 | public repo 무한, private 월 2,000분 |
| **GitHub PAT** | Apps Script가 GitHub 쓸 때 인증 | $0 | API rate limit 5,000/hr (안 닿음) |

→ **모든 한도가 1인 운영 규모에서 사실상 무한**. Netlify Identity 같이 한도 초과로 사고날 일 없음.

---

## 데이터 흐름

### 1. 텍스트 저장 흐름

```
[클라이언트] 폼 수정 후 저장
  → fetch POST → [Apps Script]
  → Apps Script가 Google Sheet에 기록
  → Apps Script가 GitHub repository_dispatch 호출 (filename + content 페이로드)
  → [GitHub Action] sync-content.yml 실행
  → Action이 client_payload에서 받은 content를 content/*.json에 쓰고 commit
  → [EC2 cron] 1분 안에 git pull
  → 사이트 반영
```

소요 시간: **저장 ~ 반영까지 30초~1분 30초**.

### 2. 이미지 업로드 흐름

```
[클라이언트] /admin에서 사진 선택
  → 브라우저가 base64로 인코딩 → fetch POST → [Apps Script]
  → Apps Script가 GitHub Contents API에 직접 PUT (PAT 인증)
  → repo의 imgs/ 폴더에 이미지 commit
  → 응답으로 새 이미지 URL 반환 → 폼의 이미지 필드 자동 채움
  → 이후 텍스트 저장 흐름과 동일
```

이미지는 sheet 안 거치고 GitHub에 직접 commit (sheet는 텍스트 데이터만).

### 3. 라이브 프리뷰 흐름

```
[admin] 우측 iframe = /index.html?preview=admin (사이트 실제 페이지)
  ↓ data.js가 preview 파라미터 감지
  ↓ "준비됐어" 신호 → admin에게 postMessage
  ↓ admin이 현재 폼 데이터 + 수정 중인 섹션 셀렉터 전송
  ↓ data.js가 SITE_DATA에 주입 → render.js가 렌더링
  ↓ 수정한 섹션으로 부드럽게 자동 스크롤

폼 입력 시 800ms 디바운스 → iframe 리로드 → 위 과정 반복
```

저장 안 해도 미리보기는 즉시 반영. 저장해야 실제 사이트가 바뀜.

---

## 셋업 단계 (다른 프로젝트에 적용할 때)

### 0. 사전 준비
- 정적 HTML 사이트 (data.js + render.js 같이 JSON으로부터 렌더하는 구조 권장)
- GitHub repo (private 가능)
- Google 계정 1개 (납품 시 클라이언트에게 인계할 수 있는 별도 계정 권장)

### 1. Google Sheet 생성
1. sheets.google.com → 새 스프레드시트
2. 첫 탭 이름 `content`
3. 헤더: `filename | json | updated_at`
4. URL에서 Sheet ID 복사 (`https://docs.google.com/spreadsheets/d/{ID}/edit`)

### 2. Apps Script 백엔드 만들기
1. 시트 → 확장 프로그램 → Apps Script
2. `apps-script/Code.gs` 내용 전체 복붙 (이 repo 참조)
3. 파일 상단 상수 수정:
   ```js
   const SHEET_ID = '...본인 시트 ID...';
   const GITHUB_REPO = 'OWNER/REPO';
   ```
4. **⚙️ 프로젝트 설정 → 스크립트 속성**에 등록:
   - `PASSWORD` = admin 접근 비번
   - `GITHUB_PAT` = GitHub Fine-grained PAT (다음 단계에서 발급)
5. `doGet` 한 번 실행 → 권한 승인
6. **배포 → 새 배포 → 웹 앱**
   - 액세스: **모든 사용자** (반드시!)
   - 실행: **본인** (반드시!)
7. 받은 URL 복사 → admin.js의 `ENDPOINT` 상수에 박기

### 3. GitHub Fine-grained PAT 발급
- Settings → Developer settings → Personal access tokens → Fine-grained tokens
- Repository access: **이 repo만** 선택
- Permissions: **Contents: Read and write**, **Metadata: Read-only**
- 발급된 토큰 → Apps Script Properties의 `GITHUB_PAT`에 등록

### 4. GitHub Action 워크플로우 추가
- `.github/workflows/sync-content.yml` 복사 (이 repo 참조)
- `repository_dispatch` 이벤트로 트리거됨, content/*.json에 commit

### 5. /admin UI 배치
- `admin/index.html`, `admin/admin.css`, `admin/admin.js`, `admin/widgets.js`, `admin/schema.yml` 배치
- `schema.yml`은 Decap CMS 형식 (collections.files[].fields[]) — 이거 한 번 잘 짜면 폼이 자동 생성됨
- `admin.js` 상단의 `ENDPOINT` URL이 정확한지 확인

### 6. 사이트 측 data.js에 preview 모드 지원 추가
이 repo의 `data.js` 참조. 핵심:
```js
const isPreview = new URLSearchParams(location.search).get('preview') === 'admin';
if (isPreview) {
  // postMessage로 데이터 받기
} else {
  // 평소대로 fetch
}
```

### 7. 첫 시트 채우기 (1회용)
- Apps Script 편집기에서 `initFromGitHub` 함수 직접 실행
- 현재 repo의 content/*.json들을 시트에 import

### 8. EC2 자동 git pull (정적 호스팅용)
```bash
sudo crontab -e
# 다음 줄 추가:
* * * * * cd /var/www/html && /usr/bin/git pull origin main --quiet
```

GitHub Pages 쓰면 이 단계 불필요 (push 즉시 자동 배포).

### 9. 검증
- admin 로그인 → 텍스트 수정 → 저장
- ~30초 후 GitHub Actions에 워크플로우 run 떠야 함
- ~1분 후 사이트 반영

---

## 함정 (실제로 막혔던 것들)

### 1. Apps Script "기존 배포 편집 → 새 버전" 안 먹는 케이스
**증상:** 코드 갈고 "배포 관리 → 편집 → 새 버전 → 배포"했는데 옛 코드가 계속 실행됨.
**원인:** 정확한 원인 불명 (Apps Script 캐시 또는 UI 버그 추정).
**해결:** **"새 배포"** 만드세요. URL이 새로 발급되고 admin.js의 `ENDPOINT`도 갈아야 하지만, 새 코드가 100% 실행됨을 보장.
**검증:** `doGet`에 `version: 'vN'` 같은 마커를 박고, 배포된 URL을 GET으로 호출해서 마커 확인.

### 2. Web App 권한 설정 (배포 시 가장 흔한 실수)
- 액세스: `Google 계정이 있는 모든 사용자` 선택하면 **익명 호출 시 Google 로그인 강제** → admin이 막힘
- 반드시 **`모든 사용자`** 선택. 인증은 Apps Script가 PASSWORD로 자체 처리.

### 3. CSS `display: flex`가 HTML `hidden` 속성을 덮음
**증상:** `el.hidden = true` 했는데 안 사라짐.
**원인:** `[hidden]` UA 스타일 (display:none)과 본인 클래스의 `display:flex`가 specificity 동일 → 본인 게 이김.
**해결:** CSS 최상단에 `[hidden] { display: none !important; }` 한 줄.

### 4. Private repo + raw.githubusercontent.com
**증상:** Apps Script에서 raw URL fetch 시 404.
**해결:** raw URL 호출 시 `Authorization: Bearer {PAT}` 헤더 필요.

### 5. raw.githubusercontent.com 대역폭 한도
**증상:** "Bandwidth quota exceeded".
**원인:** 짧은 시간 안에 raw 호출 너무 많이 함 (예: initFromGitHub 반복 실행).
**해결:** 1시간 대기, 또는 GitHub Contents API로 전환 (rate limit 더 관대).

### 6. `git add -A`로 개인 메모 파일 실수 커밋
**증상:** 비번 적힌 메모 파일이 git에 들어감.
**해결:** `.gitignore`에 추가 + 노출된 비번 즉시 변경. 가능하면 git history에서도 scrub.
**예방:** `git status` 항상 먼저 확인. `git add -A` 대신 명시적으로 파일명 지정.

### 7. EC2 git pull "dubious ownership" 에러
**증상:** `fatal: detected dubious ownership in repository`
**해결:** `sudo git config --global --add safe.directory /var/www/html`

### 8. Cron `--quiet` 옵션 = 로그 비어있음 = 정상
변경사항 없으면 출력 없음. 동작 확인하고 싶으면 `date >> log` 같은 줄 추가.

---

## 보안 메모

- **PAT는 Apps Script Script Properties에만** 보관. 코드/repo에 절대 박지 않음.
- **Fine-grained PAT 사용** — 이 repo의 contents 권한만 줘서 유출 시 피해 최소화.
- **PAT 1년 만료** 권장. GitHub이 만료 30일 전 메일 알림.
- **PASSWORD도 Script Properties** — admin URL 자체는 비밀이 아니지만 비번이 보호.
- 이 사이트 콘텐츠는 어차피 공개라 보안 등급 낮아도 충분.

---

## 비용 (실제 운영 시)

| 항목 | 월 비용 |
|---|---|
| Google Sheet | $0 |
| Apps Script | $0 |
| GitHub Action (private repo) | $0 (월 2,000분 무료, 우리는 ~10분 사용) |
| GitHub PAT | $0 |
| EC2 (외주에서 받은 기존 인프라) | 변동 없음 |
| **추가 운영비** | **0원** |

---

## 클라이언트가 실제로 보는 것

```
사이트.com/admin
  ↓
[비밀번호 입력]
  ↓
[좌측: 편집 항목 목록]
[가운데: 폼]
[우측: 라이브 프리뷰]
  ↓
글/이미지 수정 → 저장
  ↓
"저장 완료" 메시지
```

GitHub, Sheet, Apps Script, Action 같은 단어는 **평생 안 봄**. 비번 1개만 외움.

---

## 유지보수 포인트

- **GitHub PAT 만료 시** (1년에 1번):
  - GitHub에서 새 PAT 발급
  - Apps Script Script Properties의 `GITHUB_PAT` 값 갱신
  - 5분 작업
- **Apps Script 코드 변경 시**:
  - Code.gs 수정 → 저장
  - **"새 배포"** 만들어서 URL 받음 (편집 트랩 회피)
  - admin.js의 `ENDPOINT` 갱신 → push
- **schema.yml 변경 시**:
  - Decap CMS 형식 그대로 → push
  - admin이 즉시 반영 (재배포 불필요)

---

## 한계

- **저장 ~ 반영까지 ~1분 지연** (GH Action + EC2 cron). 클라이언트엔 충분, 신문사처럼 즉시성 필요한 곳엔 부족.
- **Apps Script 일 실행시간 6분 한도** — 1인 admin엔 무관, 다중 동시 편집엔 빡빡할 수 있음.
- **이미지 repo에 commit** — repo 사이즈 증가. 수백 MB 이상 사용하면 LFS 검토.
- **위젯 종류 일부 미지원** — Decap의 `markdown`, `relation`, `code` 등은 본 admin에 안 구현. 필요 시 widgets.js에 추가.

---

## 참고 파일 (이 repo 안)

- `apps-script/Code.gs` — Apps Script 백엔드 전체 코드
- `apps-script/README.md` — Apps Script 배포 가이드
- `.github/workflows/sync-content.yml` — Sheet → repo sync workflow
- `admin/index.html` `admin/admin.js` `admin/admin.css` `admin/widgets.js` — admin UI
- `admin/schema.yml` — 폼 자동 생성용 스키마 (Decap CMS 호환)
- `data.js` — 사이트 데이터 로더 (preview 모드 지원 포함)

---

## 라이선스 / 사용

이 가이드와 코드를 자유롭게 가져다 쓰셔도 됩니다. 본인 프로젝트 환경에 맞게 변형 필요.
다음 부분만 갈아주면 다른 프로젝트에 그대로 이식 가능:
- `SHEET_ID`, `GITHUB_REPO` (Apps Script)
- `ENDPOINT` (admin.js)
- `schema.yml` (콘텐츠 구조)
- `data.js`, `render.js` (사이트 측 렌더링)
