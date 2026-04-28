/* ─────────────────────────────────────────
   달빛치과 CMS — Decap 호환 위젯 렌더러
   지원 위젯: string / text / number / boolean / image / object / list / hidden
   ───────────────────────────────────────── */

(function () {
  'use strict';

  // 메인 디스패처
  function renderField(field, value, onChange) {
    const widget = field.widget || 'string';
    if (widget === 'hidden') return null;

    const wrap = document.createElement('div');
    wrap.className = 'field field-' + widget;

    // 라벨
    if (field.label) {
      const label = document.createElement('label');
      label.className = 'field-label';
      label.textContent = field.label;
      if (field.required === false) {
        const opt = document.createElement('span');
        opt.className = 'field-optional';
        opt.textContent = ' (선택)';
        label.appendChild(opt);
      }
      wrap.appendChild(label);
    }
    if (field.hint) {
      const hint = document.createElement('p');
      hint.className = 'field-hint';
      hint.textContent = field.hint;
      wrap.appendChild(hint);
    }

    let inputEl;
    switch (widget) {
      case 'string':
        inputEl = stringInput(value, onChange);
        break;
      case 'text':
        inputEl = textInput(value, onChange);
        break;
      case 'number':
        inputEl = numberInput(value, onChange);
        break;
      case 'boolean':
        inputEl = booleanInput(value, onChange);
        break;
      case 'image':
        inputEl = imageInput(value, onChange);
        break;
      case 'object':
        inputEl = objectInput(field.fields || [], value || {}, onChange);
        break;
      case 'list':
        inputEl = listInput(field, Array.isArray(value) ? value : [], onChange);
        break;
      default:
        inputEl = document.createElement('div');
        inputEl.className = 'unsupported-widget';
        inputEl.textContent = '[미지원 위젯: ' + widget + ']';
    }

    if (inputEl) wrap.appendChild(inputEl);
    return wrap;
  }

  // ─────────────────────────────────────────
  // 기본 위젯
  // ─────────────────────────────────────────

  function stringInput(value, onChange) {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'input-string';
    input.value = value == null ? '' : String(value);
    input.addEventListener('input', () => onChange(input.value));
    return input;
  }

  function textInput(value, onChange) {
    const ta = document.createElement('textarea');
    ta.className = 'input-text';
    ta.rows = 4;
    ta.value = value == null ? '' : String(value);
    ta.addEventListener('input', () => onChange(ta.value));
    return ta;
  }

  function numberInput(value, onChange) {
    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'input-number';
    input.value = value == null ? '' : value;
    input.addEventListener('input', () => {
      const v = input.value;
      onChange(v === '' ? null : Number(v));
    });
    return input;
  }

  function booleanInput(value, onChange) {
    const wrap = document.createElement('label');
    wrap.className = 'input-boolean';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = !!value;
    input.addEventListener('change', () => onChange(input.checked));
    const span = document.createElement('span');
    span.textContent = ' 활성화';
    wrap.appendChild(input);
    wrap.appendChild(span);
    return wrap;
  }

  // ─────────────────────────────────────────
  // 이미지 위젯 (URL + 업로드)
  // ─────────────────────────────────────────

  function imageInput(value, onChange) {
    const wrap = document.createElement('div');
    wrap.className = 'input-image';

    const preview = document.createElement('img');
    preview.className = 'image-preview';
    preview.alt = '';
    if (value) preview.src = value;
    preview.style.display = value ? 'block' : 'none';
    preview.addEventListener('error', () => { preview.style.display = 'none'; });

    const row = document.createElement('div');
    row.className = 'image-row';

    const urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.className = 'input-string';
    urlInput.placeholder = '이미지 경로 (예: imgs/foo.png) 또는 URL';
    urlInput.value = value == null ? '' : String(value);

    const updateValue = (v) => {
      onChange(v);
      if (v) { preview.src = v; preview.style.display = 'block'; }
      else { preview.style.display = 'none'; }
    };
    urlInput.addEventListener('input', () => updateValue(urlInput.value));

    const fileBtn = document.createElement('label');
    fileBtn.className = 'btn-secondary btn-upload';
    fileBtn.textContent = '📁 파일 업로드';
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    fileBtn.appendChild(fileInput);

    fileInput.addEventListener('change', async () => {
      const file = fileInput.files[0];
      if (!file) return;
      if (!window.uploadImage) {
        alert('업로드 함수가 준비되지 않았습니다.');
        return;
      }
      fileBtn.textContent = '⏳ 업로드 중...';
      try {
        const url = await window.uploadImage(file);
        urlInput.value = url;
        updateValue(url);
      } catch (err) {
        alert('업로드 실패: ' + err.message);
      } finally {
        fileBtn.textContent = '📁 파일 업로드';
        fileInput.value = '';
      }
    });

    row.appendChild(urlInput);
    row.appendChild(fileBtn);
    wrap.appendChild(preview);
    wrap.appendChild(row);
    return wrap;
  }

  // ─────────────────────────────────────────
  // 객체 위젯 (중첩 fields)
  // ─────────────────────────────────────────

  function objectInput(fields, value, onChange) {
    const wrap = document.createElement('div');
    wrap.className = 'input-object';
    const obj = Object.assign({}, value);

    fields.forEach((field) => {
      const fieldEl = renderField(field, obj[field.name], (newVal) => {
        obj[field.name] = newVal;
        onChange(obj);
      });
      if (fieldEl) wrap.appendChild(fieldEl);
    });

    return wrap;
  }

  // ─────────────────────────────────────────
  // 리스트 위젯 (배열)
  // 지원: list of strings (single field), list of objects (fields), polymorphic (types)
  // ─────────────────────────────────────────

  function listInput(field, value, onChange) {
    const wrap = document.createElement('div');
    wrap.className = 'input-list';
    const items = value.slice();

    function rebuild() {
      wrap.innerHTML = '';

      items.forEach((item, i) => {
        const itemWrap = document.createElement('div');
        itemWrap.className = 'list-item';

        const header = document.createElement('div');
        header.className = 'list-item-header';
        const idx = document.createElement('span');
        idx.className = 'list-item-idx';
        idx.textContent = '#' + (i + 1);
        header.appendChild(idx);

        const upBtn = makeIconBtn('▲', '위로', () => {
          if (i === 0) return;
          [items[i - 1], items[i]] = [items[i], items[i - 1]];
          onChange(items.slice());
          rebuild();
        });
        const downBtn = makeIconBtn('▼', '아래로', () => {
          if (i === items.length - 1) return;
          [items[i + 1], items[i]] = [items[i], items[i + 1]];
          onChange(items.slice());
          rebuild();
        });
        const rmBtn = makeIconBtn('✕', '삭제', () => {
          if (!confirm('이 항목을 삭제할까요?')) return;
          items.splice(i, 1);
          onChange(items.slice());
          rebuild();
        });
        rmBtn.classList.add('btn-danger');

        header.appendChild(upBtn);
        header.appendChild(downBtn);
        header.appendChild(rmBtn);
        itemWrap.appendChild(header);

        let itemEl;
        if (field.types) {
          itemEl = polymorphicItem(field.types, item, (newItem) => {
            items[i] = newItem;
            onChange(items.slice());
          });
        } else if (field.fields) {
          itemEl = objectInput(field.fields, item || {}, (newItem) => {
            items[i] = newItem;
            onChange(items.slice());
          });
        } else if (field.field) {
          itemEl = renderField(field.field, item, (newItem) => {
            items[i] = newItem;
            onChange(items.slice());
          });
        } else {
          // 단순 string 배열
          itemEl = stringInput(item, (newItem) => {
            items[i] = newItem;
            onChange(items.slice());
          });
        }
        itemWrap.appendChild(itemEl);
        wrap.appendChild(itemWrap);
      });

      const addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.className = 'btn-secondary btn-add';
      addBtn.textContent = '+ 항목 추가';
      addBtn.addEventListener('click', () => {
        let newItem;
        if (field.types && field.types.length) {
          newItem = { type: field.types[0].name };
        } else if (field.fields) {
          newItem = {};
        } else if (field.field) {
          newItem = field.field.widget === 'number' ? 0
                  : field.field.widget === 'boolean' ? false
                  : '';
        } else {
          newItem = '';
        }
        items.push(newItem);
        onChange(items.slice());
        rebuild();
      });
      wrap.appendChild(addBtn);
    }

    rebuild();
    return wrap;
  }

  function makeIconBtn(text, title, onClick) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn-icon';
    b.textContent = text;
    b.title = title;
    b.addEventListener('click', onClick);
    return b;
  }

  // 다형성 list (Decap의 types: 사용)
  function polymorphicItem(types, value, onChange) {
    const wrap = document.createElement('div');
    wrap.className = 'polymorphic-item';

    const v = Object.assign({}, value);
    if (!v.type && types[0]) v.type = types[0].name;

    const typeRow = document.createElement('div');
    typeRow.className = 'field';
    const lab = document.createElement('label');
    lab.className = 'field-label';
    lab.textContent = '타입';
    typeRow.appendChild(lab);
    const sel = document.createElement('select');
    sel.className = 'input-string';
    types.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.name;
      opt.textContent = t.label || t.name;
      if (v.type === t.name) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', () => {
      v.type = sel.value;
      // 새 타입에 맞게 객체 리셋
      const newObj = { type: v.type };
      onChange(newObj);
      // 다시 그리려면 부모가 처리. 여기선 일단 patch만.
      renderTypeFields(v.type);
    });
    typeRow.appendChild(sel);
    wrap.appendChild(typeRow);

    const fieldsHost = document.createElement('div');
    wrap.appendChild(fieldsHost);

    function renderTypeFields(typeName) {
      fieldsHost.innerHTML = '';
      const t = types.find(x => x.name === typeName);
      if (!t || !t.fields) return;
      t.fields.forEach(f => {
        const el = renderField(f, v[f.name], (newVal) => {
          v[f.name] = newVal;
          onChange(Object.assign({}, v));
        });
        if (el) fieldsHost.appendChild(el);
      });
    }
    renderTypeFields(v.type);

    return wrap;
  }

  // 외부 노출
  window.WidgetRenderer = { renderField };
})();
