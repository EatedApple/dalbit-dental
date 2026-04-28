(function() {
  if (!window.CMS || !window.h || !window.createClass) return;

  var h = window.h;
  var createClass = window.createClass;
  var IMAGE_RE = /\.(png|jpe?g|gif|svg|webp|avif|bmp|tiff)(\?.*)?$/i;

  function isObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value);
  }

  function isImageLike(key, value) {
    if (typeof value !== 'string' || !value) return false;
    return IMAGE_RE.test(value) || /(img|image|photo|logo|map|bg)$/i.test(String(key || ''));
  }

  function resolveImage(value, getAsset) {
    if (!value) return null;
    if (/^https?:\/\//i.test(value) || value.charAt(0) === '/') return value;
    try {
      var asset = getAsset(value);
      return asset && asset.toString ? asset.toString() : value;
    } catch (error) {
      return value;
    }
  }

  function renderHtmlBlock(value, className) {
    return h('div', {
      className: className || 'cms-preview__html',
      dangerouslySetInnerHTML: { __html: value || '' },
    });
  }

  function renderPrimitive(key, value, getAsset) {
    if (typeof value === 'boolean') {
      return h('p', { className: 'cms-preview__text' }, value ? '예' : '아니오');
    }

    if (typeof value === 'number') {
      return h('p', { className: 'cms-preview__text' }, String(value));
    }

    if (typeof value === 'string') {
      if (isImageLike(key, value)) {
        return h('img', {
          className: 'cms-preview__image',
          src: resolveImage(value, getAsset),
          alt: key || 'preview image',
        });
      }

      if (/[<][a-z][\s\S]*[>]/i.test(value)) {
        return renderHtmlBlock(value);
      }

      return h('p', { className: 'cms-preview__text' }, value || '—');
    }

    return h('p', { className: 'cms-preview__text cms-preview__muted' }, '값 없음');
  }

  function renderListItem(item, index, getAsset) {
    if (isObject(item)) {
      return h('div', { className: 'cms-preview__card cms-preview__card--flat', key: index }, renderObject(item, getAsset, true));
    }

    if (typeof item === 'string' && isImageLike('', item)) {
      return h('div', { className: 'cms-preview__card', key: index },
        h('img', { className: 'cms-preview__image', src: resolveImage(item, getAsset), alt: 'preview image ' + (index + 1) })
      );
    }

    return h('div', { className: 'cms-preview__card cms-preview__card--flat', key: index },
      h('p', { className: 'cms-preview__bullet' }, item == null ? '—' : String(item))
    );
  }

  function renderArray(key, list, getAsset) {
    return h('section', { className: 'cms-preview__section', key: key },
      h('div', {},
        h('p', { className: 'cms-preview__label' }, key),
        h('div', { className: 'cms-preview__grid' }, list.map(function(item, index) {
          return renderListItem(item, index, getAsset);
        }))
      )
    );
  }

  function renderObject(obj, getAsset, compact) {
    return h('div', { className: compact ? 'cms-preview__object' : 'cms-preview__object cms-preview__section' },
      Object.keys(obj || {}).map(function(key) {
        var value = obj[key];
        var pretty = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2');

        if (Array.isArray(value)) {
          return renderArray(pretty, value, getAsset);
        }

        if (isObject(value)) {
          return h('section', { className: 'cms-preview__card cms-preview__card--flat', key: key },
            h('p', { className: 'cms-preview__label' }, pretty),
            renderObject(value, getAsset, true)
          );
        }

        return h('section', { className: 'cms-preview__card cms-preview__card--flat', key: key },
          h('p', { className: 'cms-preview__label' }, pretty),
          renderPrimitive(key, value, getAsset)
        );
      })
    );
  }

  var GenericPreview = createClass({
    render: function() {
      var data = this.props.entry && this.props.entry.get('data') && this.props.entry.get('data').toJS
        ? this.props.entry.get('data').toJS()
        : {};

      var title = data.pageTitle
        || (data.brand && data.brand.name)
        || (data.hero && data.hero.title)
        || '달빛치과 콘텐츠 미리보기';

      var intro = data.brand && data.brand.addrTagline
        ? data.brand.addrTagline
        : (data.hero && data.hero.subtitle) || '수정 중인 내용을 카드형으로 빠르게 확인할 수 있습니다.';

      return h('div', { className: 'cms-preview' }, [
        h('section', { className: 'cms-preview__hero', key: 'hero' }, [
          h('span', { className: 'cms-preview__eyebrow' }, 'DALBIT CMS PREVIEW'),
          h('h1', { dangerouslySetInnerHTML: { __html: title } }),
          h('p', {}, intro),
        ]),
        renderObject(data, this.props.getAsset, false),
      ]);
    },
  });

  CMS.registerPreviewStyle('/admin/editor.css');
  [
    'site',
    'home',
    'about',
    'conservation',
    'equipment',
    'implant',
    'laminate',
    'ortho',
    'wisdom',
  ].forEach(function(name) {
    CMS.registerPreviewTemplate(name, GenericPreview);
  });
})();
