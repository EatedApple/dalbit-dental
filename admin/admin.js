/* ─────────────────────────────────────────
   달빛치과 CMS — 관리자 UI 로직
   Phase 2: schema.yml 기반 자동 폼 + 이미지 업로드
   ───────────────────────────────────────── */

const ENDPOINT = 'https://script.google.com/macros/s/AKfycbzqgDTDj4o6blquY52tTz8WsDBJtbZwUXXVqc-n6t4mGr1XIH5WbREaXReyc0kLJPxh/exec';
const MANAGED_FILE = 'content/site/popups.json';
const LIVE_SITE_ORIGIN = 'https://dalbitdent.com';
const GITHUB_RAW_ORIGIN = 'https://raw.githubusercontent.com/EatedApple/dalbit-dental/main';
const MANAGED_FIELDS = {
  [MANAGED_FILE]: ['noticePopups'],
};
const POPUP_PREVIEW_WIDTH = 1280;
const POPUP_PREVIEW_HEIGHT = 720;
const SYNC_POLL_INTERVAL = 4000;
const SYNC_POLL_TIMEOUT = 300000;

const FILE_LABELS = {
  [MANAGED_FILE]: '홈 팝업 관리',
};

const FILE_GROUPS = {
  '팝업 관리': [MANAGED_FILE],
};

// ─────────────────────────────────────────
// 상태
// ─────────────────────────────────────────
const state = {
  password: null,
  files: [],
  schema: null,           // 파싱된 config.yml
  fileSchemas: {},        // filename -> { fields, label }
  allContent: {},         // filename -> JSON object (실제 사이트 JSON 캐시)
  currentFile: null,
  originalContent: null,  // 변경 취소용
  formContent: null,      // 폼이 편집 중인 내용
  lastEditedTopField: null, // 수정한 최상위 필드명 (점프 타겟 결정용)
  previewLayoutTimer: null,
  selectedPreviewIndex: 0,
  liveContent: null,
  expectedSyncContent: null,
  syncPollTimer: null,
  syncChecking: false,
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

async function loadLiveManagedFile() {
  const response = await fetch(liveSiteUrl(MANAGED_FILE) + '?adminFresh=' + Date.now(), {
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(MANAGED_FILE + ' 로드 실패');
  return response.json();
}

async function loadPublishedManagedFile() {
  const response = await fetch(GITHUB_RAW_ORIGIN + '/' + MANAGED_FILE + '?adminFresh=' + Date.now(), {
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(MANAGED_FILE + ' 저장 확인 실패');
  return response.json();
}

window.CMS_IMAGE_PREVIEWS = window.CMS_IMAGE_PREVIEWS || {};
window.resolveCmsImagePreviewSrc = resolveCmsImagePreviewSrc;

// 이미지 업로드: File -> base64 -> Apps Script -> GitHub
window.uploadImage = async function (file) {
  // 파일명 정리: 한글/공백/특수문자 제거
  const safeName = file.name
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  const ts = Date.now();
  const path = 'imgs/' + ts + '-' + safeName;
  const localPreviewUrl = URL.createObjectURL(file);
  registerLocalImagePreview(path, localPreviewUrl);

  const base64 = await fileToBase64(file);
  const data = await api('upload', { path, base64 });
  registerLocalImagePreview(data.url || path, localPreviewUrl);
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

function setSyncStatus(kind, text, detail) {
  const badge = $('#sync-indicator');
  if (badge) {
    badge.textContent = text;
    badge.className = 'sync-indicator sync-' + kind;
  }

  const detailEl = $('#sync-detail');
  if (detailEl) {
    detailEl.textContent = detail || '기준일에 실제로 뜨는 팝업';
  }
}

function setSaveBusy(isBusy, label) {
  const btn = $('#save-btn');
  if (!btn) return;
  btn.disabled = !!isBusy || !state.currentFile || !hasUnsavedChanges();
  btn.textContent = label || '저장';
}

function setSaveOverlay(percent, title, message, isVisible = true, mode = 'progress') {
  const overlay = $('#save-overlay');
  if (!overlay) return;
  const safePercent = Math.max(0, Math.min(100, percent));
  const progress = overlay.querySelector('.save-progress');
  overlay.hidden = !isVisible;
  $('#save-overlay-title').textContent = title;
  $('#save-overlay-message').textContent = message;
  $('#save-overlay-state').textContent = mode === 'done' ? '완료' : '처리 중';
  if (progress) progress.classList.toggle('is-indeterminate', mode === 'checking');
  $('#save-overlay-bar').style.width = safePercent + '%';
}

function hideSaveOverlay(delay = 0) {
  if (!delay) {
    const overlay = $('#save-overlay');
    if (overlay) overlay.hidden = true;
    return;
  }
  setTimeout(() => hideSaveOverlay(), delay);
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $('#' + id).classList.add('active');
}

function cloneContent(value) {
  return JSON.parse(JSON.stringify(value || {}));
}

function stableStringify(value) {
  return JSON.stringify(sortForCompare(value == null ? {} : value));
}

function sortForCompare(value) {
  if (Array.isArray(value)) return value.map(sortForCompare);
  if (value && typeof value === 'object') {
    return Object.keys(value).sort().reduce((out, key) => {
      if (value[key] !== undefined) out[key] = sortForCompare(value[key]);
      return out;
    }, {});
  }
  return value;
}

function isSameContent(a, b) {
  return stableStringify(a) === stableStringify(b);
}

function stopSyncPolling() {
  if (state.syncPollTimer) {
    clearInterval(state.syncPollTimer);
    state.syncPollTimer = null;
  }
  state.syncChecking = false;
  state.expectedSyncContent = null;
}

function refreshSyncStatus() {
  if (state.syncChecking) return;
  if (hasUnsavedChanges()) {
    setSyncStatus('pending', '저장 전 변경 있음', '아직 실제 사이트에 저장되지 않았습니다.');
    return;
  }
  if (!state.liveContent) {
    setSyncStatus('unknown', '동기화 확인 전', '실제 사이트 데이터를 확인 중입니다.');
    return;
  }
  setSyncStatus('synced', '실제 사이트 기준', '현재 화면은 실제 사이트 popups.json을 기준으로 열렸습니다.');
}

function todayInputValue() {
  const now = new Date();
  const tzOffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - tzOffset).toISOString().slice(0, 10);
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, '&#96;');
}

function previewImageSrc(value) {
  return resolveCmsImagePreviewSrc(value);
}

function resolveCmsImagePreviewSrc(value) {
  const src = String(value || '');
  const preview = getLocalImagePreview(src);
  if (preview) return preview;
  if (/^(https?:|data:)/i.test(src)) return src;
  if (src.indexOf('/') === 0) return liveSiteUrl(src);
  if (src.indexOf('imgs/') === 0) return liveSiteUrl(src);
  return src;
}

function isLocalAdminOrigin() {
  return ['localhost', '127.0.0.1', '::1'].includes(location.hostname);
}

function liveSiteUrl(path) {
  const normalized = '/' + String(path || '').replace(/^\/+/, '');
  return isLocalAdminOrigin() ? LIVE_SITE_ORIGIN + normalized : normalized;
}

function registerLocalImagePreview(path, objectUrl) {
  const key = normalizeImagePreviewKey(path);
  if (!key || !objectUrl) return;
  window.CMS_IMAGE_PREVIEWS[key] = objectUrl;
  window.CMS_IMAGE_PREVIEWS['/' + key] = objectUrl;
}

function getLocalImagePreview(value) {
  const src = String(value || '');
  const key = normalizeImagePreviewKey(src);
  return window.CMS_IMAGE_PREVIEWS[src] || window.CMS_IMAGE_PREVIEWS[key] || window.CMS_IMAGE_PREVIEWS['/' + key] || '';
}

function normalizeImagePreviewKey(value) {
  const src = String(value || '').trim();
  if (!src || /^(https?:|data:|blob:)/i.test(src)) return src;
  return src.replace(/^\/+/, '');
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
  stopSyncPolling();
  sessionStorage.removeItem('cms-password');
  Object.assign(state, {
    password: null,
    currentFile: null,
    originalContent: null,
    formContent: null,
    liveContent: null,
  });
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
        if (f.file && MANAGED_FIELDS[f.file]) {
          const allowedFields = new Set(MANAGED_FIELDS[f.file]);
          state.fileSchemas[f.file] = {
            label: FILE_LABELS[f.file] || f.label,
            fields: (f.fields || [])
              .filter(field => allowedFields.has(field.name))
              .map(field => field.name === 'noticePopups'
                ? Object.assign({}, field, {
                    fields: (field.fields || []).filter(child => child.name !== 'storageKey'),
                  })
                : field),
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
    setupPopupPreviewControls();
    await loadSchema();
    state.files = [{ filename: MANAGED_FILE }];
    state.allContent = {};
    state.liveContent = cloneContent(await loadLiveManagedFile());
    state.allContent[MANAGED_FILE] = cloneContent(state.liveContent);
    renderFileList();
    await loadFile(MANAGED_FILE);
    renderPopupPreview();
    refreshSyncStatus();
    setStatus('대기 중', 'idle');
  } catch (err) {
    setStatus('초기화 실패: ' + err.message, 'error');
  }
}

function renderFileList() {
  const ul = $('#file-list');
  ul.innerHTML = '';
  const filenames = new Set(state.files.map(f => f.filename).filter(filename => filename === MANAGED_FILE));

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
    // 실제 사이트 JSON 캐시 우선. 없으면 같은 파일을 다시 불러온다.
    let content = state.allContent[filename];
    if (!content) {
      content = filename === MANAGED_FILE ? await loadLiveManagedFile() : {};
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
    setSaveBusy(false);
    $('#reset-btn').disabled = false;

    renderForm();
    renderPopupPreview();
    // 새 파일 로드 시 점프 타겟 초기화 (이전 파일의 수정 흔적 제거)
    state.lastEditedTopField = null;
    refreshSyncStatus();
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
        state.lastEditedTopField = field.name;
        markUnsaved();
      }
    );
    if (fieldEl) container.appendChild(fieldEl);
  });
}

function markUnsaved() {
  if (hasUnsavedChanges()) {
    if (state.syncChecking) stopSyncPolling();
    setSaveBusy(false);
    setStatus('변경됨 (저장 안 됨)', 'saving');
  } else {
    setStatus('대기 중', 'idle');
  }
  refreshSyncStatus();
  renderPopupPreview();
}

// ─────────────────────────────────────────
// 실제 팝업 전용 프리뷰
// ─────────────────────────────────────────

function setupPopupPreviewControls() {
  const dateInput = $('#preview-date');
  if (dateInput && !dateInput.dataset.bound) {
    dateInput.value = todayInputValue();
    dateInput.dataset.bound = '1';
    dateInput.addEventListener('input', () => {
      state.selectedPreviewIndex = 0;
      renderPopupPreview();
    });
  }

  const prevBtn = $('#popup-preview-prev');
  if (prevBtn && !prevBtn.dataset.bound) {
    prevBtn.dataset.bound = '1';
    prevBtn.addEventListener('click', () => {
      state.selectedPreviewIndex = Math.max(0, state.selectedPreviewIndex - 1);
      renderPopupPreview();
    });
  }

  const nextBtn = $('#popup-preview-next');
  if (nextBtn && !nextBtn.dataset.bound) {
    nextBtn.dataset.bound = '1';
    nextBtn.addEventListener('click', () => {
      state.selectedPreviewIndex += 1;
      renderPopupPreview();
    });
  }

  if (!document.body.dataset.popupPreviewResizeBound) {
    document.body.dataset.popupPreviewResizeBound = '1';
    window.addEventListener('resize', schedulePopupPreviewLayout);
  }
}

function getPopupPreviewSource() {
  if (state.currentFile === MANAGED_FILE && state.formContent) return state.formContent;
  return state.allContent[MANAGED_FILE] || {};
}

function getPopupPreviewNow() {
  const dateValue = $('#preview-date')?.value || todayInputValue();
  const now = new Date(dateValue + 'T12:00:00');
  return Number.isNaN(now.getTime()) ? new Date() : now;
}

function isNoticePopupActive(item, now) {
  if (!item) return false;
  const startDate = item.startDate ? new Date(item.startDate + 'T00:00:00') : null;
  const endDate = item.endDate ? new Date(item.endDate + 'T23:59:59') : null;
  if (startDate && Number.isNaN(startDate.getTime())) return true;
  if (endDate && Number.isNaN(endDate.getTime())) return true;
  if (startDate && now < startDate) return false;
  if (endDate && now > endDate) return false;
  return true;
}

function renderPopupPreview() {
  const wrap = $('#popup-preview');
  const empty = $('#popup-preview-empty');
  if (!wrap || !empty) return;
  updatePopupPreviewScale();

  const source = getPopupPreviewSource();
  const now = getPopupPreviewNow();
  const popups = Array.isArray(source.noticePopups) ? source.noticePopups : [];
  const activePopups = popups
    .map((item, originalIndex) => ({ item, originalIndex }))
    .filter(entry => isNoticePopupActive(entry.item, now));

  wrap.className = 'notice-popups';
  wrap.innerHTML = '';
  empty.hidden = activePopups.length > 0;

  if (!activePopups.length) {
    updatePopupPreviewControls(0, 0, '');
    return;
  }

  state.selectedPreviewIndex = Math.min(
    Math.max(state.selectedPreviewIndex, 0),
    activePopups.length - 1
  );

  const selected = activePopups[state.selectedPreviewIndex];
  const item = selected.item;
  const originalIndex = selected.originalIndex;
  updatePopupPreviewControls(activePopups.length, state.selectedPreviewIndex + 1, item.title || '안내');

  wrap.innerHTML = `
    <div class="notice-popup is-open" id="notice-popup-preview-${originalIndex}" aria-hidden="false" data-storage-key="${escapeAttr(item.storageKey || `notice-popup-hide-until-${originalIndex}`)}" style="--notice-offset:0;--notice-z:1">
      <div class="notice-popup__head">
        <h4>${escapeHtml(item.title || '안내')}</h4>
        <button class="notice-popup__close" type="button" aria-label="닫기" disabled>&times;</button>
      </div>
      <div class="notice-popup__body">
        ${item.image
          ? `<img src="${escapeAttr(previewImageSrc(item.image))}" alt="${escapeAttr(item.title || '안내 이미지')}">`
          : '<div class="notice-popup__empty">이미지를 선택하면 여기에 표시됩니다.</div>'}
      </div>
      <div class="notice-popup__foot">
        <button class="notice-popup__dismiss" type="button" disabled>닫기</button>
        <button class="notice-popup__hide-day" type="button" disabled>하루동안 보지 않기</button>
      </div>
    </div>
  `;

  const images = Array.from(wrap.querySelectorAll('.notice-popup__body img'));
  if (!images.length) {
    schedulePopupPreviewLayout();
    return;
  }
  images.forEach(img => {
    if (img.complete) schedulePopupPreviewLayout();
    else img.addEventListener('load', schedulePopupPreviewLayout, { once: true });
  });
  schedulePopupPreviewLayout();
}

function updatePopupPreviewControls(total, current, title) {
  const countEl = $('#popup-preview-count');
  const prevBtn = $('#popup-preview-prev');
  const nextBtn = $('#popup-preview-next');
  const label = $('#popup-preview-viewport-label');

  if (countEl) countEl.textContent = total ? `${current} / ${total}` : '0 / 0';
  if (prevBtn) prevBtn.disabled = total <= 1 || current <= 1;
  if (nextBtn) nextBtn.disabled = total <= 1 || current >= total;
  if (label) {
    label.textContent = total
      ? `메인 화면 1280 x 720 · ${current}/${total} ${title}`
      : '메인 화면 1280 x 720';
  }
}

function schedulePopupPreviewLayout() {
  clearTimeout(state.previewLayoutTimer);
  state.previewLayoutTimer = setTimeout(() => {
    updatePopupPreviewScale();
    layoutPopupPreview();
  }, 40);
}

function updatePopupPreviewScale() {
  const stage = $('#popup-preview-stage');
  const viewport = $('#popup-preview-viewport');
  if (!stage || !viewport) return;
  const toolbarSpace = 0;
  const scale = Math.min(
    1,
    (stage.clientWidth - 28) / POPUP_PREVIEW_WIDTH,
    (stage.clientHeight - 28 - toolbarSpace) / POPUP_PREVIEW_HEIGHT
  );
  viewport.style.setProperty('--popup-preview-scale', Math.max(.2, scale).toFixed(4));
}

function layoutPopupPreview() {
  const wrap = $('#popup-preview');
  const viewport = $('#popup-preview-viewport');
  if (!wrap || !viewport) return;
  const popups = Array.from(wrap.querySelectorAll('.notice-popup'));
  wrap.classList.remove('notice-popups--row', 'notice-popups--column', 'notice-popups--scroll');
  popups.forEach(popup => sizePopupPreview(popup));
  if (popups.length < 2) return;

  const isMobile = POPUP_PREVIEW_WIDTH <= 720;
  const gap = isMobile ? 12 : 18;
  const availableWidth = POPUP_PREVIEW_WIDTH - (isMobile ? 32 : 48);
  const availableHeight = POPUP_PREVIEW_HEIGHT - (isMobile ? 32 : 48);
  const widths = popups.map(popup => popup.getBoundingClientRect().width);
  const heights = popups.map(popup => popup.getBoundingClientRect().height);
  const rowFits = widths.reduce((sum, width) => sum + width, 0) + (gap * (popups.length - 1)) <= availableWidth
    && Math.max(...heights) <= availableHeight;
  const columnFits = Math.max(...widths) <= availableWidth
    && heights.reduce((sum, height) => sum + height, 0) + (gap * (popups.length - 1)) <= availableHeight;

  if (rowFits) wrap.classList.add('notice-popups--row');
  else if (columnFits) wrap.classList.add('notice-popups--column');
  else wrap.classList.add('notice-popups--scroll');
}

function sizePopupPreview(popup) {
  const img = popup.querySelector('.notice-popup__body img');
  if (!img) return;

  const naturalWidth = img.naturalWidth || img.width;
  const naturalHeight = img.naturalHeight || img.height;
  if (!naturalWidth || !naturalHeight) return;

  const isMobile = POPUP_PREVIEW_WIDTH <= 720;
  const ratio = naturalWidth / naturalHeight;
  const isLandscape = ratio >= 1.2;
  const viewportWidth = Math.max(260, POPUP_PREVIEW_WIDTH - (isMobile ? 32 : 48));
  const chromeHeight = isMobile ? 176 : (isLandscape ? 176 : 220);
  const viewportHeight = Math.max(180, POPUP_PREVIEW_HEIGHT - chromeHeight);
  const minWidth = Math.min(isMobile ? 260 : (isLandscape ? 520 : 320), viewportWidth);
  const maxWidth = isMobile ? viewportWidth : (isLandscape ? 920 : 560);
  const fittedWidth = Math.min(naturalWidth, viewportWidth, viewportHeight * ratio, maxWidth);
  const safeMinWidth = Math.min(minWidth, viewportWidth);
  const naturalCapWidth = Math.min(naturalWidth, viewportWidth, maxWidth);
  const popupWidth = Math.min(Math.max(safeMinWidth, fittedWidth), naturalCapWidth);

  popup.classList.toggle('is-landscape', isLandscape);
  popup.style.setProperty('--notice-width', Math.round(popupWidth) + 'px');
  popup.style.setProperty('--notice-image-max-height', Math.round(viewportHeight) + 'px');
}

function hasUnsavedChanges() {
  if (!state.formContent) return false;
  return JSON.stringify(state.formContent) !== state.originalContent;
}

function normalizeBeforeSave(content) {
  if (!content || !Array.isArray(content.noticePopups)) return content;
  const parsedOriginal = (() => {
    try { return JSON.parse(state.originalContent || '{}'); }
    catch (_) { return {}; }
  })();
  const originalPopups = Array.isArray(parsedOriginal.noticePopups) ? parsedOriginal.noticePopups : [];
  content.noticePopups = content.noticePopups.map((item, index) => {
    const popup = Object.assign({}, item);
    const original = originalPopups[index] || {};
    if (!popup.storageKey) {
      popup.storageKey = original.storageKey || makeStorageKey(popup, index);
    }
    return popup;
  });
  return content;
}

function makeStorageKey(item, index) {
  const raw = (item.title || 'popup-' + (index + 1)).toString().toLowerCase();
  const slug = raw
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || ('popup-' + (index + 1));
  return 'dalbit-notice-' + slug + '-' + Date.now().toString(36);
}

async function writeManagedFile(filename, content) {
  try {
    return await api('writeGithub', { file: filename, content });
  } catch (err) {
    if (/unknown action: writeGithub/i.test(err.message || '')) {
      throw new Error('Apps Script 새 버전 배포 필요: writeGithub 액션이 아직 없습니다.');
    }
    throw err;
  }
}

function startSyncPolling(expectedContent) {
  stopSyncPolling();
  state.syncChecking = true;
  state.expectedSyncContent = cloneContent(expectedContent);
  const deadline = Date.now() + SYNC_POLL_TIMEOUT;

  setSaveBusy(true, '반영 확인 중...');
  setSaveOverlay(65, '저장 확인 중', '저장된 내용이 제대로 올라갔는지 확인하고 있습니다.', true, 'checking');
  setSyncStatus('checking', '저장 확인 중', '저장된 내용이 제대로 올라갔는지 확인하고 있습니다.');

  const check = async () => {
    try {
      const published = cloneContent(await loadPublishedManagedFile());

      if (isSameContent(published, state.expectedSyncContent)) {
        state.allContent[MANAGED_FILE] = cloneContent(published);
        state.liveContent = cloneContent(published);
        if (state.currentFile === MANAGED_FILE && !hasUnsavedChanges()) {
          state.originalContent = JSON.stringify(published);
        }
        stopSyncPolling();
        setSaveBusy(false);
        setStatus('대기 중', 'idle');
        setSaveOverlay(100, '저장 완료', '변경사항은 저장됐습니다. 실제 사이트 반영은 몇 분 걸릴 수 있으니 잠시 후 확인하세요.', true, 'done');
        hideSaveOverlay(2600);
        setSyncStatus('synced', '저장 완료', '변경사항은 저장됐습니다. 실제 사이트 반영은 몇 분 걸릴 수 있으니 잠시 후 확인하세요.');
        return;
      }

      if (Date.now() > deadline) {
        stopSyncPolling();
        setSaveBusy(false);
        setStatus('저장 확인 대기', 'saving');
        setSaveOverlay(90, '저장 확인 대기', '저장은 요청됐습니다. 몇 분 뒤 새로고침해서 확인하세요.');
        hideSaveOverlay(3600);
        setSyncStatus('pending', '저장 확인 대기', '저장은 요청됐습니다. 몇 분 뒤 새로고침해서 확인하세요.');
        return;
      }

      setSaveOverlay(80, '저장 확인 중', '저장 처리 중입니다. 저장 버튼을 다시 누르지 않아도 됩니다.', true, 'checking');
      setSyncStatus('checking', '저장 확인 중', '저장 처리 중입니다. 저장 버튼을 다시 누르지 않아도 됩니다.');
    } catch (err) {
      if (Date.now() > deadline) {
        stopSyncPolling();
        setSaveBusy(false);
        setStatus('저장 확인 대기', 'saving');
        setSaveOverlay(90, '저장 확인 대기', '저장은 요청됐습니다. 몇 분 뒤 새로고침해서 확인하세요.');
        hideSaveOverlay(3600);
        setSyncStatus('pending', '저장 확인 대기', '저장은 요청됐습니다. 몇 분 뒤 새로고침해서 확인하세요.');
      }
    }
  };

  check();
  state.syncPollTimer = setInterval(check, SYNC_POLL_INTERVAL);
}

// ─────────────────────────────────────────
// 저장 / 취소
// ─────────────────────────────────────────

$('#save-btn').addEventListener('click', async () => {
  if (!state.currentFile) return;
  if (state.syncChecking) {
    setSyncStatus('checking', '저장 확인 중', '이미 저장 확인 중입니다. 다시 누르지 않아도 됩니다.');
    return;
  }
  setSaveBusy(true, '저장 중...');
  setStatus('저장 중...', 'saving');
  setSaveOverlay(15, '저장 준비 중', '팝업 데이터를 정리하고 있습니다.');
  try {
    state.formContent = normalizeBeforeSave(cloneContent(state.formContent));
    setSaveOverlay(35, '저장 중', '변경사항을 저장하고 있습니다.');
    await writeManagedFile(state.currentFile, state.formContent);
    setSaveOverlay(60, '저장 확인 중', '저장된 내용이 제대로 올라갔는지 확인하고 있습니다.', true, 'checking');
    state.originalContent = JSON.stringify(state.formContent);
    state.allContent[state.currentFile] = cloneContent(state.formContent);
    renderPopupPreview();
    setStatus('저장 확인 중', 'saving');
    startSyncPolling(state.formContent);
  } catch (err) {
    stopSyncPolling();
    hideSaveOverlay();
    setStatus('저장 실패: ' + err.message, 'error');
    refreshSyncStatus();
    alert('저장 실패: ' + err.message);
    setSaveBusy(false);
  } finally {
    if (!state.syncChecking) setSaveBusy(false);
  }
});

$('#reset-btn').addEventListener('click', () => {
  if (!hasUnsavedChanges()) return;
  if (confirm('변경 사항을 모두 취소합니다.')) {
    state.formContent = JSON.parse(state.originalContent);
    renderForm();
    renderPopupPreview();
    setStatus('대기 중', 'idle');
    refreshSyncStatus();
  }
});

window.addEventListener('beforeunload', (e) => {
  if (hasUnsavedChanges()) {
    e.preventDefault();
    e.returnValue = '';
  }
});
