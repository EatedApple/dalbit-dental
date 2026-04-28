/* ─────────────────────────────────────────
   달빛치과 CMS — 관리자 UI 로직
   Phase 2: schema.yml 기반 자동 폼 + 이미지 업로드
   ───────────────────────────────────────── */

const ENDPOINT = 'https://script.google.com/macros/s/AKfycbxPFKNgkYUbny2tfBBnTRGeXvI2Qtrg580o5-RitaIMYQ0-ceFRn-RMvTt69-OqVzICUQ/exec';

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

// 파일별 기본 프리뷰 페이지
const FILE_TO_PAGE = {
  'content/site/brand.json':         'index.html',
  'content/site/contact.json':       'index.html',
  'content/site/navigation.json':    'index.html',
  'content/site/popups.json':        'index.html',
  'content/home/hero.json':          'index.html',
  'content/home/focus.json':         'index.html',
  'content/home/banners.json':       'index.html',
  'content/home/blog.json':          'index.html',
  'content/pages/about.json':        'about.html',
  'content/pages/conservation.json': 'conservation.html',
  'content/pages/equipment.json':    'equipment.html',
  'content/pages/implant.json':      'implant.html',
  'content/pages/laminate.json':     'laminate.html',
  'content/pages/ortho.json':        'ortho.html',
  'content/pages/wisdom.json':       'wisdom.html',
};

// ─────────────────────────────────────────
// 상태
// ─────────────────────────────────────────
const state = {
  password: null,
  files: [],
  schema: null,           // 파싱된 config.yml
  fileSchemas: {},        // filename -> { fields, label }
  allContent: {},         // filename -> JSON object (시트의 모든 파일 캐시)
  currentFile: null,
  originalContent: null,  // 변경 취소용
  formContent: null,      // 폼이 편집 중인 내용
  previewPage: 'index.html',
  refreshTimer: null,
};

// ─────────────────────────────────────────
// API
// ─────────────────────────────────────────

async function api(action, extra = {}) {
  if (!state.password && action !== 'auth') throw new Error('not authenticated');
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
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

// 이미지 업로드: File -> base64 -> Apps Script -> GitHub
window.uploadImage = async function (file) {
  const base64 = await fileToBase64(file);
  // 파일명 정리: 한글/공백/특수문자 제거
  const safeName = file.name
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  const ts = Date.now();
  const path = 'imgs/' + ts + '-' + safeName;
  const data = await api('upload', { path, base64 });
  return data.url; // 예: "/imgs/1234-foo.png"
};

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result; // "data:image/png;base64,XXXX"
      const idx = result.indexOf(',');
      resolve(idx >= 0 ? result.slice(idx + 1) : result);
    };
    reader.onerror = () => reject(new Error('파일 읽기 실패'));
    reader.readAsDataURL(file);
  });
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
  Object.assign(state, { password: null, currentFile: null, originalContent: null, formContent: null });
  $('#login-password').value = '';
  $('#login-error').textContent = '';
  showScreen('login-screen');
});

// 자동 로그인
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
  } catch (e) { /* 무시 */ }
})();

// ─────────────────────────────────────────
// 스키마 로드
// ─────────────────────────────────────────

async function loadSchema() {
  if (state.schema) return state.schema;
  const res = await fetch('/admin/schema.yml');
  if (!res.ok) throw new Error('schema.yml 로드 실패');
  const text = await res.text();
  const parsed = jsyaml.load(text);
  state.schema = parsed;

  // filename -> fileSchema 매핑
  if (parsed.collections) {
    parsed.collections.forEach(col => {
      (col.files || []).forEach(f => {
        if (f.file) {
          state.fileSchemas[f.file] = {
            label: f.label,
            fields: f.fields || [],
          };
        }
      });
    });
  }
  return parsed;
}

// ─────────────────────────────────────────
// 에디터 진입
// ─────────────────────────────────────────

async function enterEditor() {
  showScreen('editor-screen');
  document.querySelector('.layout').classList.add('no-file'); // 파일 선택 전 폼 패널 숨김
  setStatus('스키마 + 콘텐츠 불러오는 중...', 'saving');
  try {
    await loadSchema();
    const [listData, allData] = await Promise.all([
      api('list'),
      api('readAll'),
    ]);
    state.files = listData.files || [];
    state.allContent = allData.files || {};
    renderFileList();
    setupPreviewListeners();
    refreshPreview(); // 파일 선택 전이라도 홈 미리보기 즉시 표시
    setStatus('대기 중', 'idle');
  } catch (err) {
    setStatus('초기화 실패: ' + err.message, 'error');
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
      if (!filenames.has(filename)) return;
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

  setStatus('불러오는 중...', 'saving');
  try {
    // 캐시 우선 (readAll에서 이미 받음). 없으면 API.
    let content = state.allContent[filename];
    if (!content) {
      const data = await api('read', { file: filename });
      content = data.content;
      state.allContent[filename] = content;
    }
    state.currentFile = filename;
    state.originalContent = JSON.stringify(content);
    state.formContent = JSON.parse(state.originalContent);

    document.querySelectorAll('#file-list li').forEach(li => li.classList.remove('active'));
    const activeLi = document.querySelector('#file-list li[data-filename="' + filename + '"]');
    if (activeLi) activeLi.classList.add('active');

    document.querySelector('.layout').classList.remove('no-file');
    $('#form-empty').hidden = true;
    $('#form-container').hidden = false;
    $('#editor-filename').textContent = (state.fileSchemas[filename] && state.fileSchemas[filename].label) || filename;
    $('#save-btn').disabled = false;
    $('#reset-btn').disabled = false;

    renderForm();
    // 파일에 맞는 페이지로 프리뷰 변경
    const targetPage = FILE_TO_PAGE[filename] || 'index.html';
    state.previewPage = targetPage;
    $('#preview-page').value = targetPage;
    refreshPreview();
    setStatus('대기 중', 'idle');
  } catch (err) {
    setStatus('로드 실패: ' + err.message, 'error');
    console.error(err);
  }
}

function renderForm() {
  const container = $('#form-container');
  container.innerHTML = '';

  const sch = state.fileSchemas[state.currentFile];
  if (!sch) {
    container.innerHTML = '<p class="error-message">이 파일의 스키마를 찾을 수 없습니다 (config.yml 확인).</p>';
    return;
  }

  sch.fields.forEach(field => {
    const fieldEl = window.WidgetRenderer.renderField(
      field,
      state.formContent[field.name],
      (newVal) => {
        state.formContent[field.name] = newVal;
        markUnsaved();
      }
    );
    if (fieldEl) container.appendChild(fieldEl);
  });
}

function markUnsaved() {
  if (hasUnsavedChanges()) setStatus('변경됨 (저장 안 됨)', 'saving');
  else setStatus('대기 중', 'idle');
  schedulePreviewUpdate();
}

// ─────────────────────────────────────────
// 프리뷰
// ─────────────────────────────────────────

function buildEffectiveFiles() {
  // 모든 파일의 현재 효과적 내용 (편집 중인 파일은 formContent로 덮어씀)
  const out = Object.assign({}, state.allContent);
  if (state.currentFile && state.formContent) {
    out[state.currentFile] = state.formContent;
  }
  return out;
}

function refreshPreview() {
  const iframe = $('#preview-iframe');
  if (!iframe) return;
  const url = '/' + state.previewPage + '?preview=admin&t=' + Date.now();
  iframe.src = url;
  // 새 탭 링크 동기화 (저장된 데이터 기준 미리보기)
  $('#preview-newtab').href = '/' + state.previewPage;
}

function schedulePreviewUpdate() {
  // 디바운스 — 마지막 입력 후 800ms 뒤 iframe 리로드
  clearTimeout(state.refreshTimer);
  state.refreshTimer = setTimeout(refreshPreview, 800);
}

function setupPreviewListeners() {
  // iframe이 "준비됐어" 신호 보내면 현재 데이터 응답
  window.addEventListener('message', (event) => {
    if (!event.data || event.data.type !== 'cms-preview-ready') return;
    const iframe = $('#preview-iframe');
    if (!iframe || !iframe.contentWindow) return;
    iframe.contentWindow.postMessage({
      type: 'cms-preview',
      files: buildEffectiveFiles(),
    }, '*');
  });

  // 페이지 셀렉터 변경 시 프리뷰 갱신
  $('#preview-page').addEventListener('change', (e) => {
    state.previewPage = e.target.value;
    refreshPreview();
  });
  $('#preview-refresh').addEventListener('click', refreshPreview);
}

function hasUnsavedChanges() {
  if (!state.formContent) return false;
  return JSON.stringify(state.formContent) !== state.originalContent;
}

// ─────────────────────────────────────────
// 저장 / 취소
// ─────────────────────────────────────────

$('#save-btn').addEventListener('click', async () => {
  if (!state.currentFile) return;
  $('#save-btn').disabled = true;
  setStatus('저장 중...', 'saving');
  try {
    await api('write', { file: state.currentFile, content: state.formContent });
    state.originalContent = JSON.stringify(state.formContent);
    state.allContent[state.currentFile] = JSON.parse(state.originalContent);
    setStatus('저장 완료', 'saved');
    setTimeout(() => { if ($('#status-indicator').textContent === '저장 완료') setStatus('대기 중', 'idle'); }, 3000);
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
    state.formContent = JSON.parse(state.originalContent);
    renderForm();
    setStatus('대기 중', 'idle');
  }
});

window.addEventListener('beforeunload', (e) => {
  if (hasUnsavedChanges()) {
    e.preventDefault();
    e.returnValue = '';
  }
});
