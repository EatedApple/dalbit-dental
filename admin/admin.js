/* ─────────────────────────────────────────
   달빛치과 CMS — 관리자 UI 로직
   Phase 1: 로그인 + 파일 목록 + JSON 직접 편집
   ───────────────────────────────────────── */

const ENDPOINT = 'https://script.google.com/macros/s/AKfycbxPFKNgkYUbny2tfBBnTRGeXvI2Qtrg580o5-RitaIMYQ0-ceFRn-RMvTt69-OqVzICUQ/exec';

// 파일을 그룹화해서 사이드바에 표시할 때 쓰는 라벨
const FILE_LABELS = {
  'content/site/brand.json':         '병원 기본정보',
  'content/site/contact.json':       '연락처 · 위치',
  'content/site/navigation.json':    '내비게이션 메뉴',
  'content/site/popups.json':        '팝업 · 인트로',
  'content/home/hero.json':          '메인 · 히어로',
  'content/home/focus.json':         '메인 · 포커스 섹션',
  'content/home/banners.json':       '메인 · 배너',
  'content/home/blog.json':          '메인 · 블로그',
  'content/pages/about.json':        '병원 소개',
  'content/pages/conservation.json': '보존 치료',
  'content/pages/equipment.json':    '장비 안내',
  'content/pages/implant.json':      '임플란트',
  'content/pages/laminate.json':     '라미네이트',
  'content/pages/ortho.json':        '교정',
  'content/pages/wisdom.json':       '사랑니',
};

const FILE_GROUPS = {
  '공통 설정':   ['content/site/brand.json', 'content/site/contact.json', 'content/site/navigation.json', 'content/site/popups.json'],
  '메인 페이지': ['content/home/hero.json', 'content/home/focus.json', 'content/home/banners.json', 'content/home/blog.json'],
  '서브 페이지': ['content/pages/about.json', 'content/pages/conservation.json', 'content/pages/equipment.json', 'content/pages/implant.json', 'content/pages/laminate.json', 'content/pages/ortho.json', 'content/pages/wisdom.json'],
};

// ─────────────────────────────────────────
// 상태
// ─────────────────────────────────────────
const state = {
  password: null,
  files: [],
  currentFile: null,
  originalContent: null, // 변경 취소용
};

// ─────────────────────────────────────────
// API 클라이언트
// ─────────────────────────────────────────

async function api(action, extra = {}) {
  if (!state.password) throw new Error('not authenticated');
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' }, // CORS preflight 회피
    body: JSON.stringify({ action, password: state.password, ...extra }),
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'unknown error');
  return data;
}

async function authenticate(password) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action: 'auth', password }),
  });
  const data = await res.json();
  return !!data.ok;
}

// ─────────────────────────────────────────
// UI 헬퍼
// ─────────────────────────────────────────

function $(sel) { return document.querySelector(sel); }
function setStatus(text, kind = 'idle') {
  const el = $('#status-indicator');
  el.textContent = text;
  el.className = 'status-' + kind;
}
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $('#' + id).classList.add('active');
}

// ─────────────────────────────────────────
// 로그인
// ─────────────────────────────────────────

$('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const submitBtn = $('#login-submit');
  const errEl = $('#login-error');
  errEl.textContent = '';
  submitBtn.disabled = true;
  submitBtn.textContent = '확인 중...';

  const password = $('#login-password').value;
  try {
    const ok = await authenticate(password);
    if (ok) {
      state.password = password;
      sessionStorage.setItem('cms-password', password);
      enterEditor();
    } else {
      errEl.textContent = '비밀번호가 올바르지 않습니다.';
    }
  } catch (err) {
    errEl.textContent = '연결 오류: ' + err.message;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = '로그인';
  }
});

$('#logout-btn').addEventListener('click', () => {
  sessionStorage.removeItem('cms-password');
  state.password = null;
  state.currentFile = null;
  state.originalContent = null;
  $('#login-password').value = '';
  $('#login-error').textContent = '';
  showScreen('login-screen');
});

// 자동 로그인 (세션 유지)
(async function tryAutoLogin() {
  const saved = sessionStorage.getItem('cms-password');
  if (!saved) return;
  try {
    const ok = await authenticate(saved);
    if (ok) {
      state.password = saved;
      enterEditor();
    } else {
      sessionStorage.removeItem('cms-password');
    }
  } catch (e) {
    // 무시 (로그인 화면 그대로)
  }
})();

// ─────────────────────────────────────────
// 에디터
// ─────────────────────────────────────────

async function enterEditor() {
  showScreen('editor-screen');
  setStatus('파일 목록 불러오는 중...', 'saving');
  try {
    const data = await api('list');
    state.files = data.files || [];
    renderFileList();
    setStatus('대기 중', 'idle');
  } catch (err) {
    setStatus('파일 목록 로드 실패: ' + err.message, 'error');
  }
}

function renderFileList() {
  const ul = $('#file-list');
  ul.innerHTML = '';

  const filenames = new Set(state.files.map(f => f.filename));

  Object.entries(FILE_GROUPS).forEach(([group, files]) => {
    const headerLi = document.createElement('li');
    headerLi.className = 'group-label';
    headerLi.textContent = group;
    ul.appendChild(headerLi);

    files.forEach(filename => {
      if (!filenames.has(filename)) return; // 시트에 없는 파일은 표시 안 함
      const li = document.createElement('li');
      li.textContent = FILE_LABELS[filename] || filename;
      li.dataset.filename = filename;
      li.addEventListener('click', () => loadFile(filename));
      ul.appendChild(li);
    });
  });
}

async function loadFile(filename) {
  if (state.currentFile && hasUnsavedChanges()) {
    if (!confirm('저장하지 않은 변경 사항이 있습니다. 버리시겠어요?')) return;
  }

  setStatus(filename + ' 불러오는 중...', 'saving');
  try {
    const data = await api('read', { file: filename });
    state.currentFile = filename;
    state.originalContent = JSON.stringify(data.content, null, 2);

    document.querySelectorAll('#file-list li').forEach(li => li.classList.remove('active'));
    document.querySelector('#file-list li[data-filename="' + filename + '"]').classList.add('active');

    $('#editor-empty').hidden = true;
    $('#editor-content').hidden = false;
    $('#editor-filename').textContent = filename;
    $('#json-editor').value = state.originalContent;
    $('#json-editor').classList.remove('invalid');
    setStatus('대기 중', 'idle');
  } catch (err) {
    setStatus('로드 실패: ' + err.message, 'error');
  }
}

function hasUnsavedChanges() {
  return $('#json-editor').value !== state.originalContent;
}

// 입력 시 JSON 유효성 라이브 체크
$('#json-editor').addEventListener('input', () => {
  const ta = $('#json-editor');
  try {
    JSON.parse(ta.value);
    ta.classList.remove('invalid');
  } catch (e) {
    ta.classList.add('invalid');
  }
});

$('#save-btn').addEventListener('click', async () => {
  const ta = $('#json-editor');
  let parsed;
  try {
    parsed = JSON.parse(ta.value);
  } catch (e) {
    alert('JSON 형식이 올바르지 않습니다:\n' + e.message);
    return;
  }

  $('#save-btn').disabled = true;
  setStatus('저장 중...', 'saving');
  try {
    await api('write', { file: state.currentFile, content: parsed });
    state.originalContent = JSON.stringify(parsed, null, 2);
    ta.value = state.originalContent;
    setStatus('저장 완료', 'saved');
    setTimeout(() => setStatus('대기 중', 'idle'), 3000);
  } catch (err) {
    setStatus('저장 실패: ' + err.message, 'error');
    alert('저장 실패: ' + err.message);
  } finally {
    $('#save-btn').disabled = false;
  }
});

$('#reset-btn').addEventListener('click', () => {
  if (!hasUnsavedChanges()) return;
  if (confirm('변경 사항을 모두 취소합니다.')) {
    $('#json-editor').value = state.originalContent;
    $('#json-editor').classList.remove('invalid');
  }
});

// 페이지 떠날 때 미저장 경고
window.addEventListener('beforeunload', (e) => {
  if (hasUnsavedChanges()) {
    e.preventDefault();
    e.returnValue = '';
  }
});
