/**
 * 달빛치과 CMS — Apps Script 백엔드
 *
 * 역할:
 *   1. /admin이 보낸 요청 수신 (인증, 콘텐츠 read/write, 이미지 업로드)
 *   2. 시트에 콘텐츠 저장 (단일 진실 소스)
 *   3. 이미지를 GitHub repo에 commit
 *   4. 변경 시 GH Action 트리거 (시트 -> JSON sync)
 *
 * 배포: Apps Script 편집기 -> 배포 -> 새 배포 -> 웹 앱
 *   - 액세스: "모든 사용자" (인증은 password로 자체 처리)
 *   - 실행: "본인 (dalbitadmin@gmail.com)"
 *
 * Script Properties (프로젝트 설정 -> 스크립트 속성)에 등록 필요:
 *   - PASSWORD : /admin 접근 비밀번호 (예: "dalbit2026!")
 *   - GITHUB_PAT : GitHub Personal Access Token (이미지 업로드 / GH Action 트리거용)
 *                  나중에 추가해도 됨. 없어도 텍스트 편집은 동작.
 */

const SHEET_ID = '1M0bUtv30ZLHLfyB3JXHTUSeM2n-fZjkbU1Zu43IFwmo';
const SHEET_TAB = 'content';
const GITHUB_REPO = 'EatedApple/dalbit-dental';
const BRANCH = 'main';

// ─────────────────────────────────────────
// HTTP 엔트리포인트
// ─────────────────────────────────────────

function doGet(e) {
  // 헬스체크 (브라우저로 URL 직접 열어 확인용)
  return jsonResponse({ ok: true, ping: 'pong', ts: new Date().toISOString() });
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    if (!verifyPassword(body.password)) {
      return jsonResponse({ ok: false, error: 'unauthorized' });
    }

    switch (action) {
      case 'auth':
        return jsonResponse({ ok: true });

      case 'list':
        return jsonResponse({ ok: true, files: listFiles() });

      case 'readAll':
        return jsonResponse({ ok: true, files: readAll() });

      case 'read':
        return jsonResponse({
          ok: true,
          file: body.file,
          content: readFile(body.file)
        });

      case 'write':
        writeFile(body.file, body.content);
        triggerSync(body.file, body.content); // 베스트 에포트 (실패해도 시트엔 저장됨)
        return jsonResponse({ ok: true, file: body.file });

      case 'upload':
        const url = uploadImage(body.path, body.base64);
        return jsonResponse({ ok: true, path: body.path, url: url });

      case 'init':
        // 최초 1회만 — content/*.json들을 시트에 채움
        initFiles(body.files);
        return jsonResponse({ ok: true, count: body.files.length });

      default:
        return jsonResponse({ ok: false, error: 'unknown action: ' + action });
    }
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err && err.message || err) });
  }
}

// ─────────────────────────────────────────
// 헬퍼
// ─────────────────────────────────────────

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function verifyPassword(password) {
  const stored = PropertiesService.getScriptProperties().getProperty('PASSWORD');
  return !!stored && password === stored;
}

function getSheet() {
  return SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_TAB);
}

function getPAT() {
  return PropertiesService.getScriptProperties().getProperty('GITHUB_PAT');
}

// ─────────────────────────────────────────
// 시트 read/write
// ─────────────────────────────────────────

function listFiles() {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  return data.slice(1)
    .filter(row => row[0])
    .map(row => ({ filename: row[0], updated_at: row[2] }));
}

function readAll() {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const out = {};
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      try {
        out[data[i][0]] = data[i][1] ? JSON.parse(data[i][1]) : {};
      } catch (e) {
        out[data[i][0]] = {};
      }
    }
  }
  return out;
}

function readFile(filename) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === filename) {
      return data[i][1] ? JSON.parse(data[i][1]) : {};
    }
  }
  return null;
}

function writeFile(filename, content) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const json = JSON.stringify(content, null, 2);
  const now = new Date().toISOString();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === filename) {
      sheet.getRange(i + 1, 2).setValue(json);
      sheet.getRange(i + 1, 3).setValue(now);
      return;
    }
  }
  sheet.appendRow([filename, json, now]);
}

function initFiles(files) {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) sheet.getRange(2, 1, lastRow - 1, 3).clearContent();
  const now = new Date().toISOString();
  files.forEach(f => {
    sheet.appendRow([f.filename, JSON.stringify(f.content, null, 2), now]);
  });
}

// ─────────────────────────────────────────
// GitHub 연동
// ─────────────────────────────────────────

function uploadImage(path, base64) {
  const pat = getPAT();
  if (!pat) throw new Error('GITHUB_PAT 미설정');

  const apiUrl = 'https://api.github.com/repos/' + GITHUB_REPO + '/contents/' + path;

  // 기존 파일 sha 확인 (있으면 update, 없으면 create)
  let sha = null;
  const existing = UrlFetchApp.fetch(apiUrl + '?ref=' + BRANCH, {
    method: 'get',
    headers: { Authorization: 'Bearer ' + pat },
    muteHttpExceptions: true
  });
  if (existing.getResponseCode() === 200) {
    sha = JSON.parse(existing.getContentText()).sha;
  }

  const payload = {
    message: 'chore(cms): upload ' + path,
    content: base64,
    branch: BRANCH
  };
  if (sha) payload.sha = sha;

  const res = UrlFetchApp.fetch(apiUrl, {
    method: 'put',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + pat },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  if (res.getResponseCode() >= 300) {
    throw new Error('GitHub upload failed: ' + res.getContentText());
  }
  return '/' + path;
}

function triggerSync(filename, content) {
  const pat = getPAT();
  if (!pat) { Logger.log('triggerSync: PAT 없음'); return; }

  // 디버그: 어떤 값이 들어오는지 기록
  Logger.log('triggerSync called: filename=' + filename + ', contentType=' + typeof content);

  const payloadObj = {
    event_type: 'content-updated',
    client_payload: { filename: filename, content: content }
  };
  Logger.log('Sending payload: ' + JSON.stringify(payloadObj).substring(0, 200));

  const res = UrlFetchApp.fetch('https://api.github.com/repos/' + GITHUB_REPO + '/dispatches', {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + pat },
    payload: JSON.stringify(payloadObj),
    muteHttpExceptions: true
  });
  Logger.log('GitHub dispatch response: ' + res.getResponseCode() + ' ' + res.getContentText().substring(0, 200));
}

// 편집기에서 직접 실행할 디버그 함수 — 새 버전이 실제로 활성화됐는지 확인용
function debugTriggerSync() {
  triggerSync('content/site/brand.json', { test: 'manual', ts: new Date().toISOString() });
}

// ─────────────────────────────────────────
// 1회용 헬퍼 — Apps Script 편집기에서 직접 실행
// ─────────────────────────────────────────

/**
 * 최초 시트 초기화: GitHub repo의 현재 content/*.json들을 시트에 가져와 채움.
 *
 * 사용법: Apps Script 편집기에서 함수 드롭다운 -> initFromGitHub -> 실행
 * (Web App 호출 아님. 본인 권한으로 직접 실행. 비번 불필요)
 */
function initFromGitHub() {
  const files = [
    'content/site/brand.json',
    'content/site/contact.json',
    'content/site/navigation.json',
    'content/site/popups.json',
    'content/home/banners.json',
    'content/home/blog.json',
    'content/home/focus.json',
    'content/home/hero.json',
    'content/pages/about.json',
    'content/pages/conservation.json',
    'content/pages/equipment.json',
    'content/pages/implant.json',
    'content/pages/laminate.json',
    'content/pages/ortho.json',
    'content/pages/wisdom.json'
  ];

  const pat = getPAT();
  if (!pat) throw new Error('GITHUB_PAT 미설정 (private repo는 인증 필요)');

  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) sheet.getRange(2, 1, lastRow - 1, 3).clearContent();

  const now = new Date().toISOString();
  let imported = 0;
  files.forEach(filename => {
    const url = 'https://raw.githubusercontent.com/' + GITHUB_REPO + '/' + BRANCH + '/' + filename;
    const res = UrlFetchApp.fetch(url, {
      method: 'get',
      headers: { Authorization: 'Bearer ' + pat },
      muteHttpExceptions: true
    });
    if (res.getResponseCode() === 200) {
      sheet.appendRow([filename, res.getContentText(), now]);
      imported++;
      Logger.log('imported: ' + filename);
    } else {
      Logger.log('SKIP ' + filename + ' (HTTP ' + res.getResponseCode() + ')');
    }
  });
  Logger.log('--- DONE. ' + imported + '/' + files.length + ' files imported ---');
}
