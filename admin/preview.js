(function() {
  if (!window.CMS || !window.h || !window.createClass) return;

  var h = window.h;
  var createClass = window.createClass;
  var IMAGE_RE = /\.(png|jpe?g|gif|svg|webp|avif|bmp|tiff)(\?.*)?$/i;

  var ICONS = {
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    kakao: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.48 3 2 6.48 2 10.78c0 2.74 1.83 5.15 4.6 6.55-.2.7-.71 2.5-.81 2.89-.13.49.18.48.38.35.16-.1 2.5-1.7 3.51-2.39.76.11 1.54.18 2.32.18 5.52 0 10-3.48 10-7.78S17.52 3 12 3z"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z"/></svg>',
    arrow: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
    bus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="16" rx="2"/><path d="M8 19v2"/><path d="M16 19v2"/><circle cx="8.5" cy="14.5" r="1"/><circle cx="15.5" cy="14.5" r="1"/></svg>',
    car: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></svg>',
  };

  var DEFAULTS = {
    brand: {
      logo: 'imgs/logo.png',
      name: '달빛치과의원',
      headerName: '달빛치과',
      nameEn: 'DALBIT DENTAL CLINIC',
      phone: '054-705-0101',
      phoneText: '054.705.0101',
      addrTagline: '포항시청 앞 · 포항시 남구 대이로 39 2층',
    },
    nav: [
      { label: '병원소개', href: 'about.html', sub: [{ label: '달빛치과 소개', href: 'about.html' }, { label: '의료진 소개', href: 'about.html#doctors' }] },
      { label: '임플란트', href: 'implant.html', sub: [{ label: '네비게이션 임플란트', href: 'implant.html#points' }] },
      { label: '투명교정', href: 'ortho.html', sub: [{ label: '투명교정 안내', href: 'ortho.html' }] },
      { label: '심미치료', href: 'laminate.html', sub: [{ label: '라미네이트', href: 'laminate.html' }] },
      { label: '일반치료', href: 'conservation.html', sub: [{ label: '보존 · 치주치료', href: 'conservation.html' }] },
    ],
    quick: [
      { label: '전화상담', href: 'tel:054-705-0101', primary: true, icon: 'phone' },
      { label: '네이버톡톡', href: '#', icon: 'chat' },
    ],
    hours: [
      { day: '평 일', time: '오전 10:00 ~ 오후 7:00<span class="hours-break">휴식 오후 1:30 ~ 2:30</span>' },
      { day: '토요일', time: '오전 10:00 ~ 오후 4:00<span class="hours-break">휴식 오후 1:30 ~ 2:00</span>' },
    ],
    hoursClosed: '※ 일요일, 공휴일은 휴진입니다',
    directions: {
      address: '포항시청 앞 · 포항시 남구 대이로 39 2층',
      mapImage: 'imgs/directions-info.png',
      bus: { label: '정류소 · 버스 안내', desc: '정류소명: 시청 / 버스 111, 216, 306, 700' },
      car: { label: '오시는 길 · 주차 안내', desc: 'imgs/directions-info-car.png', isImage: true, popupOnly: true },
    },
    footer: {
      addrLine1: '달빛치과의원 · 대표자 김은주 · 사업자등록번호 5752602201',
      addrLine2: '포항시청 앞 · 포항시 남구 대이로 39 2층 · TEL 054.705.0101',
      copyright: 'COPYRIGHT © 2026 달빛치과의원 ALL RIGHTS RESERVED.',
    },
    focusTitle: {
      small: 'TREATMENTS',
      h2Html: '달빛치과 <b>진료과목</b>',
    },
    blogTitle: {
      small: 'DENTAL COLUMN',
      h2Html: '치아 건강 <b>정보</b>',
    },
  };

  function getData(entry) {
    return entry && entry.get('data') && entry.get('data').toJS ? entry.get('data').toJS() : {};
  }

  function isObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value);
  }

  function isImageLike(key, value) {
    return typeof value === 'string' && value && (IMAGE_RE.test(value) || /(img|image|photo|logo|map|bg)$/i.test(String(key || '')));
  }

  function assetUrl(value, getAsset) {
    if (!value) return '';
    if (/^https?:\/\//i.test(value) || value.charAt(0) === '/') return value;
    try {
      var asset = getAsset(value);
      if (asset && asset.toString) return asset.toString();
    } catch (error) {}
    return '/' + String(value).replace(/^\.?\//, '');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function htmlBlock(value, className) {
    return h('div', {
      className: className || 'cms-preview__html',
      dangerouslySetInnerHTML: { __html: value || '' },
    });
  }

  function textBlock(value, className) {
    return h('p', { className: className || 'cms-preview__text' }, value || '—');
  }

  function shell(title, subtitle, body) {
    return h('div', { className: 'cms-preview' }, [
      h('section', { className: 'cms-preview__hero', key: 'hero' }, [
        h('span', { className: 'cms-preview__eyebrow' }, 'DALBIT CMS PREVIEW'),
        h('h1', { dangerouslySetInnerHTML: { __html: title || '달빛치과 콘텐츠' } }),
        h('p', {}, subtitle || '수정한 내용이 실제 섹션처럼 보이도록 정리한 미리보기입니다.'),
      ]),
      body,
    ]);
  }

  function genericSection(label, content) {
    return h('section', { className: 'cms-preview__section', key: label }, [
      h('p', { className: 'cms-preview__label' }, label),
      content,
    ]);
  }

  function renderPrimitive(key, value, getAsset) {
    if (typeof value === 'boolean') return textBlock(value ? '예' : '아니오');
    if (typeof value === 'number') return textBlock(String(value));
    if (typeof value === 'string') {
      if (isImageLike(key, value)) {
        return h('img', { className: 'cms-preview__image', src: assetUrl(value, getAsset), alt: key || 'preview image' });
      }
      if (/[<][a-z][\s\S]*[>]/i.test(value)) return htmlBlock(value);
      return textBlock(value);
    }
    return textBlock('값 없음', 'cms-preview__text cms-preview__muted');
  }

  function renderGenericObject(data, getAsset) {
    return h('div', { className: 'cms-preview__object cms-preview__section' },
      Object.keys(data || {}).map(function(key) {
        var value = data[key];
        var label = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
        if (Array.isArray(value)) {
          return genericSection(label, h('div', { className: 'cms-preview__grid' },
            value.map(function(item, index) {
              return h('div', { className: 'cms-preview__card cms-preview__card--flat', key: index },
                isObject(item) ? renderGenericObject(item, getAsset) : renderPrimitive(key, item, getAsset)
              );
            })
          ));
        }
        if (isObject(value)) {
          return genericSection(label, h('div', { className: 'cms-preview__card cms-preview__card--flat' }, renderGenericObject(value, getAsset)));
        }
        return genericSection(label, h('div', { className: 'cms-preview__card cms-preview__card--flat' }, renderPrimitive(key, value, getAsset)));
      })
    );
  }

  function actualPreview(html) {
    return h('div', {
      className: 'cms-site-preview',
      dangerouslySetInnerHTML: { __html: html },
    });
  }

  function renderSectionTitleHtml(data) {
    if (!data) return '';
    return '' +
      '<div class="sec-title">' +
        '<small>' + escapeHtml(data.small || '') + '</small>' +
        '<h2>' + (data.h2Html || '') + '</h2>' +
        '<div class="bar"></div>' +
        (data.lead ? '<p class="lead">' + data.lead + '</p>' : '') +
      '</div>';
  }

  function renderQuickHtml(quick) {
    return '' +
      '<aside class="quick" aria-label="빠른 메뉴">' +
        (quick || []).map(function(item) {
          var cls = item.primary ? ' class="is-primary"' : '';
          return '<a' + cls + ' href="' + escapeHtml(item.href || '#') + '">' +
            (ICONS[item.icon] || '') +
            escapeHtml(item.label || '') +
          '</a>';
        }).join('') +
      '</aside>';
  }

  function renderHeaderHtml(data, getAsset) {
    var brand = data.brand || DEFAULTS.brand;
    var nav = data.nav || DEFAULTS.nav;
    return '' +
      '<header class="header">' +
        '<div class="header__top">' +
          '<div class="header__addr">' + escapeHtml(brand.addrTagline || '') + '</div>' +
          '<a href="index.html" class="brand">' +
            '<img class="brand__img" src="' + escapeHtml(assetUrl(brand.logo || DEFAULTS.brand.logo, getAsset)) + '" alt="' + escapeHtml(brand.name || DEFAULTS.brand.name) + '">' +
          '</a>' +
          '<a href="tel:' + escapeHtml((brand.phone || '').replace(/[^\d+]/g, '')) + '" class="header__call">' +
            ICONS.phone +
            '<span>' + escapeHtml(brand.phoneText || brand.phone || DEFAULTS.brand.phoneText) + '</span>' +
          '</a>' +
        '</div>' +
        '<div class="header__nav">' +
          '<nav class="gnb" aria-label="주메뉴">' +
            '<ul>' +
              nav.map(function(item) {
                return '<li>' +
                  '<a href="' + escapeHtml(item.href || '#') + '">' + escapeHtml(item.label || '') + '</a>' +
                  ((item.sub || []).length ? '<ul class="gnb__sub">' + item.sub.map(function(sub) {
                    return '<li><a href="' + escapeHtml(sub.href || '#') + '">' + escapeHtml(sub.label || '') + '</a></li>';
                  }).join('') + '</ul>' : '') +
                '</li>';
              }).join('') +
            '</ul>' +
          '</nav>' +
        '</div>' +
      '</header>';
  }

  function renderCopyHtml(data, getAsset) {
    var brand = data.brand || DEFAULTS.brand;
    var footer = data.footer || DEFAULTS.footer;
    return '' +
      '<footer class="copy">' +
        '<div class="container">' +
          '<div class="copy__brand">' +
            '<span style="display:inline-block;padding:10px 16px;background:#fff;border-radius:10px">' +
              '<img class="brand__img" src="' + escapeHtml(assetUrl(brand.logo || DEFAULTS.brand.logo, getAsset)) + '" alt="' + escapeHtml(brand.name || DEFAULTS.brand.name) + '" style="height:36px;display:block">' +
            '</span>' +
          '</div>' +
          '<address class="copy__addr">' +
            '<p>' + escapeHtml(footer.addrLine1 || '') + '</p>' +
            '<p>' + escapeHtml(footer.addrLine2 || '') + '</p>' +
            '<p>' + escapeHtml(footer.copyright || '') + '</p>' +
          '</address>' +
        '</div>' +
      '</footer>';
  }

  function renderContactHtml(data, getAsset) {
    var hours = data.hours || DEFAULTS.hours;
    var directions = data.directions || DEFAULTS.directions;
    return '' +
      '<section class="foot-board" id="info">' +
        '<div class="foot-board__grid">' +
          '<div class="foot-card foot-card--hours">' +
            '<h4>' + ICONS.phone + '진료시간</h4>' +
            '<div class="hours">' +
              hours.map(function(row) {
                return '<dl><dt>' + escapeHtml(row.day || '') + '</dt><dd>' + (row.time || '') + '</dd></dl>';
              }).join('') +
              (data.hoursClosed ? '<p class="closed">' + escapeHtml(data.hoursClosed) + '</p>' : '') +
            '</div>' +
          '</div>' +
          '<div class="foot-card foot-card--map">' +
            '<div class="map-image">' +
              '<img src="' + escapeHtml(assetUrl(directions.mapImage || DEFAULTS.directions.mapImage, getAsset)) + '" alt="' + escapeHtml(directions.address || DEFAULTS.directions.address) + '">' +
              '<p class="map-address">' + escapeHtml(directions.address || DEFAULTS.directions.address) + '</p>' +
            '</div>' +
            '<div class="directions">' +
              (directions.bus ? '<div><h6>' + ICONS.bus + escapeHtml(directions.bus.label || '') + '</h6><p>' + escapeHtml(directions.bus.desc || '') + '</p></div>' : '') +
              (directions.car ? '<div><h6>' + ICONS.car + escapeHtml(directions.car.label || '') + '</h6>' + (
                directions.car.isImage && directions.car.desc
                  ? '<div class="directions-image"><img src="' + escapeHtml(assetUrl(directions.car.desc, getAsset)) + '" alt="' + escapeHtml(directions.car.label || '') + '"></div>'
                  : '<p>' + escapeHtml(directions.car.desc || '') + '</p>'
              ) + '</div>' : '') +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>';
  }

  function renderHeroHtml(slides, getAsset) {
    return '' +
      '<section class="hero" aria-label="메인 비주얼">' +
        '<div class="hero__track">' +
          (slides || []).map(function(slide, index) {
            if (slide.type === 'photo') {
              return '' +
                '<article class="hero__slide hero__slide--2" data-slide="' + index + '"' +
                  (slide.bgImage ? ' style="background:linear-gradient(110deg, rgba(10,20,40,.85) 30%, rgba(28,49,104,.6) 100%), url(\'' + escapeHtml(assetUrl(slide.bgImage, getAsset)) + '\') center/cover no-repeat"' : '') +
                '>' +
                  '<div class="hero__text">' +
                    (slide.h3 ? '<h3>' + slide.h3 + '</h3>' : '') +
                    (slide.paragraphs || []).map(function(line) { return '<p>' + line + '</p>'; }).join('') +
                    (slide.sign ? '<div class="sign">' + escapeHtml(slide.sign) + '</div>' : '') +
                  '</div>' +
                '</article>';
            }
            return '' +
              '<article class="hero__slide hero__slide--1" data-slide="' + index + '">' +
                '<div class="hero__text">' +
                  (slide.h3 ? '<h3>' + slide.h3 + '</h3>' : '') +
                  (slide.h2 ? '<h2>' + slide.h2 + '</h2>' : '') +
                  ((slide.list || []).length ? '<ul>' + slide.list.map(function(item) { return '<li>' + escapeHtml(item) + '</li>'; }).join('') + '</ul>' : '') +
                  (slide.desc ? '<p>' + slide.desc + '</p>' : '') +
                '</div>' +
                '<div class="hero__moon" aria-hidden="true"></div>' +
              '</article>';
          }).join('') +
        '</div>' +
      '</section>';
  }

  function renderFocusHtml(data, getAsset) {
    var title = data.focusTitle || DEFAULTS.focusTitle;
    var items = data.focus || [];
    return '' +
      '<section class="focus" id="treatments">' +
        '<div class="container">' +
          renderSectionTitleHtml(title) +
          '<div class="focus__grid">' +
            items.map(function(item) {
              return '' +
                '<a class="focus__card" href="' + escapeHtml(item.href || '#') + '">' +
                  '<img src="' + escapeHtml(assetUrl(item.img, getAsset)) + '" alt="' + escapeHtml(item.title || '') + '">' +
                  '<div class="focus__inner">' +
                    '<h5>' + escapeHtml(item.small || '') + '</h5>' +
                    '<h4>' + escapeHtml(item.title || '') + '</h4>' +
                    '<p>' + escapeHtml(item.desc || '') + '</p>' +
                    '<span class="arrow">' + ICONS.arrow + '</span>' +
                  '</div>' +
                '</a>';
            }).join('') +
          '</div>' +
        '</div>' +
      '</section>';
  }

  function renderChecklistHtml(checklist, getAsset) {
    if (!checklist) return '';
    var style = checklist.bgImage
      ? ' style="background:linear-gradient(120deg, rgba(10,20,40,.82) 40%, rgba(28,49,104,.6) 100%), url(\'' + escapeHtml(assetUrl(checklist.bgImage, getAsset)) + '\') center/cover no-repeat"'
      : '';
    return '' +
      '<section class="banner-checklist"' + style + '>' +
        '<div class="container">' +
          '<h3>' + (checklist.titleHTML || '') + '</h3>' +
          '<ul class="banner-checklist__list">' +
            (checklist.items || []).map(function(item) { return '<li>' + escapeHtml(item) + '</li>'; }).join('') +
          '</ul>' +
          '<h4>' + (checklist.closingHTML || '') + '</h4>' +
        '</div>' +
      '</section>';
  }

  function renderPointHtml(point, getAsset) {
    if (!point) return '';
    var style = point.bgImage
      ? ' style="background:linear-gradient(180deg, rgba(28,49,104,.85) 0%, rgba(10,20,40,.92) 100%), url(\'' + escapeHtml(assetUrl(point.bgImage, getAsset)) + '\') center/cover no-repeat"'
      : '';
    return '' +
      '<section class="banner-point"' + style + '>' +
        '<div class="container">' +
          '<h3>' + (point.titleHTML || '') + '</h3>' +
          '<div class="divider"></div>' +
          '<h5>' + (point.descHTML || '') + '</h5>' +
          '<h4>' + (point.closingHTML || '') + '</h4>' +
        '</div>' +
      '</section>';
  }

  function renderBlogHtml(data, getAsset) {
    var title = data.blogTitle || DEFAULTS.blogTitle;
    var posts = data.blog || [];
    return '' +
      '<section class="blog" id="community">' +
        '<div class="container">' +
          renderSectionTitleHtml(title) +
          '<div class="blog__grid">' +
            posts.map(function(post) {
              return '' +
                '<a class="blog__card" href="' + escapeHtml(post.href || '#') + '">' +
                  '<div class="blog__thumb"><img src="' + escapeHtml(assetUrl(post.img, getAsset)) + '" alt="' + escapeHtml(post.title || '') + '"></div>' +
                  '<div class="blog__body">' +
                    (post.tag ? '<span class="blog__tag">' + escapeHtml(post.tag) + '</span>' : '') +
                    '<h5 class="blog__title">' + escapeHtml(post.title || '') + '</h5>' +
                  '</div>' +
                '</a>';
            }).join('') +
          '</div>' +
        '</div>' +
      '</section>';
  }

  function renderIntroHtml(intro) {
    return '' +
      '<section class="cms-intro-preview">' +
        '<div class="cms-intro-preview__lines">' +
          '<div class="cms-intro-preview__line">' + escapeHtml((intro.line1 || []).join(' ')) + '</div>' +
          '<div class="cms-intro-preview__line">' + escapeHtml((intro.line2 || []).join(' ')) + '</div>' +
        '</div>' +
        '<div class="cms-intro-preview__tag">' + (intro.tagHTML || '') + '</div>' +
      '</section>';
  }

  function renderPopupsHtml(popups, getAsset) {
    if (!popups.length) return '';
    return '' +
      '<div class="notice-popups">' +
        popups.map(function(item, index) {
          return '' +
            '<div class="notice-popup is-open" style="--notice-offset:' + index + ';--notice-z:' + (popups.length - index) + '">' +
              '<div class="notice-popup__head">' +
                '<h4>' + escapeHtml(item.title || '안내') + '</h4>' +
                '<button class="notice-popup__close" type="button" aria-label="닫기">&times;</button>' +
              '</div>' +
              '<div class="notice-popup__body">' +
                (item.image ? '<img src="' + escapeHtml(assetUrl(item.image, getAsset)) + '" alt="' + escapeHtml(item.title || '팝업 이미지') + '">' : '') +
              '</div>' +
              '<div class="notice-popup__foot">' +
                '<button class="notice-popup__dismiss" type="button">닫기</button>' +
                '<button class="notice-popup__hide-day" type="button">하루동안 보지 않기</button>' +
              '</div>' +
            '</div>';
        }).join('') +
      '</div>';
  }

  function renderSiteFrame(bodyHtml, options, getAsset) {
    options = options || {};
    var ctx = {
      brand: options.brand || DEFAULTS.brand,
      nav: options.nav || DEFAULTS.nav,
      quick: options.quick || DEFAULTS.quick,
      footer: options.footer || DEFAULTS.footer,
    };
    return '' +
      '<div class="cms-site-preview__page">' +
        (options.showQuick === false ? '' : renderQuickHtml(ctx.quick)) +
        (options.showHeader === false ? '' : renderHeaderHtml(ctx, getAsset)) +
        '<main class="cms-site-preview__main">' + (bodyHtml || '') + '</main>' +
        (options.contact ? renderContactHtml(options.contact, getAsset) : '') +
        (options.showCopy === false ? '' : renderCopyHtml(ctx, getAsset)) +
      '</div>';
  }

  var SiteBrandPreview = createClass({
    render: function() {
      var data = getData(this.props.entry);
      return actualPreview(renderSiteFrame('', {
        brand: data.brand || DEFAULTS.brand,
        quick: data.quick || DEFAULTS.quick,
        footer: data.footer || DEFAULTS.footer,
      }, this.props.getAsset));
    },
  });

  var SiteNavigationPreview = createClass({
    render: function() {
      var data = getData(this.props.entry);
      return actualPreview(renderSiteFrame('', {
        nav: data.nav || DEFAULTS.nav,
      }, this.props.getAsset));
    },
  });

  var SiteContactPreview = createClass({
    render: function() {
      var data = getData(this.props.entry);
      return actualPreview(renderSiteFrame('', {
        contact: data,
      }, this.props.getAsset));
    },
  });

  var SitePopupsPreview = createClass({
    render: function() {
      var data = getData(this.props.entry);
      var body = '' +
        '<section class="cms-popups-preview">' +
          renderIntroHtml(data.intro || {}) +
          renderPopupsHtml(data.noticePopups || [], this.props.getAsset) +
        '</section>';
      return actualPreview(renderSiteFrame(body, {
        showQuick: false,
        showCopy: false,
      }, this.props.getAsset));
    },
  });

  var HomeHeroPreview = createClass({
    render: function() {
      var data = getData(this.props.entry);
      return actualPreview(renderSiteFrame(renderHeroHtml(data.hero || [], this.props.getAsset), {}, this.props.getAsset));
    },
  });

  var HomeFocusPreview = createClass({
    render: function() {
      var data = getData(this.props.entry);
      return actualPreview(renderSiteFrame(renderFocusHtml(data, this.props.getAsset), {}, this.props.getAsset));
    },
  });

  var HomeBannersPreview = createClass({
    render: function() {
      var data = getData(this.props.entry);
      return actualPreview(renderSiteFrame(
        renderChecklistHtml(data.checklist || {}, this.props.getAsset) +
        renderPointHtml(data.point || {}, this.props.getAsset),
        { showQuick: false },
        this.props.getAsset
      ));
    },
  });

  var HomeBlogPreview = createClass({
    render: function() {
      var data = getData(this.props.entry);
      return actualPreview(renderSiteFrame(renderBlogHtml(data, this.props.getAsset), {}, this.props.getAsset));
    },
  });

  var GenericPagePreview = createClass({
    render: function() {
      var data = getData(this.props.entry);
      var hero = data.hero || {};
      return shell(hero.title || data.pageTitle || '서브페이지 미리보기', hero.subtitle || '페이지 상단과 섹션 구성이 카드형으로 보입니다.',
        h('div', { className: 'cms-preview__section' }, [
          hero.bg ? h('section', {
            className: 'cms-page-hero-card',
            key: 'hero',
            style: { backgroundImage: 'linear-gradient(120deg, rgba(10,20,40,.82), rgba(28,49,104,.62)), url(' + assetUrl(hero.bg, this.props.getAsset) + ')' },
          }, [
            hero.crumb ? h('span', { className: 'cms-preview__eyebrow' }, hero.crumb) : null,
            hero.title ? htmlBlock(hero.title, 'cms-page-hero-card__title') : null,
            hero.subtitle ? textBlock(hero.subtitle, 'cms-page-hero-card__text') : null,
          ]) : null,
          renderGenericObject(data, this.props.getAsset),
        ])
      );
    },
  });

  CMS.registerPreviewStyle('/common.css');
  CMS.registerPreviewStyle('/page.css');
  CMS.registerPreviewStyle('/admin/home-preview.css');
  CMS.registerPreviewStyle('/admin/editor.css');

  CMS.registerPreviewTemplate('site-brand', SiteBrandPreview);
  CMS.registerPreviewTemplate('site-navigation', SiteNavigationPreview);
  CMS.registerPreviewTemplate('site-contact', SiteContactPreview);
  CMS.registerPreviewTemplate('site-popups', SitePopupsPreview);
  CMS.registerPreviewTemplate('home-hero', HomeHeroPreview);
  CMS.registerPreviewTemplate('home-focus', HomeFocusPreview);
  CMS.registerPreviewTemplate('home-banners', HomeBannersPreview);
  CMS.registerPreviewTemplate('home-blog', HomeBlogPreview);
  ['about', 'conservation', 'equipment', 'implant', 'laminate', 'ortho', 'wisdom'].forEach(function(name) {
    CMS.registerPreviewTemplate(name, GenericPagePreview);
  });
})();
