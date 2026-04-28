(function() {
  if (!window.CMS || !window.h || !window.createClass) return;

  var h = window.h;
  var createClass = window.createClass;
  var IMAGE_RE = /\.(png|jpe?g|gif|svg|webp|avif|bmp|tiff)(\?.*)?$/i;

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
      return asset && asset.toString ? asset.toString() : value;
    } catch (error) {
      return value;
    }
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

  var SiteBrandPreview = createClass({
    render: function() {
      var data = getData(this.props.entry);
      var brand = data.brand || {};
      var quick = data.quick || [];
      var footer = data.footer || {};
      return shell(brand.name || '병원 기본정보', brand.addrTagline || '상단 헤더와 푸터에 들어가는 핵심 정보입니다.',
        h('div', { className: 'cms-preview__section' }, [
          h('section', { className: 'cms-mini-header', key: 'header' }, [
            h('div', { className: 'cms-mini-header__addr' }, brand.addrTagline || '주소 문구를 입력하세요'),
            h('div', { className: 'cms-mini-header__brand' }, [
              brand.logo ? h('img', { src: assetUrl(brand.logo, this.props.getAsset), alt: brand.name || 'logo' }) : null,
              h('strong', {}, brand.headerName || brand.name || '달빛치과'),
            ]),
            h('div', { className: 'cms-mini-header__phone' }, brand.phoneText || brand.phone || '전화번호'),
          ]),
          h('div', { className: 'cms-preview__grid', key: 'body' }, [
            h('div', { className: 'cms-preview__card cms-preview__card--flat', key: 'quick' }, [
              h('p', { className: 'cms-preview__label' }, '빠른 버튼'),
              h('div', { className: 'cms-pill-list' }, quick.map(function(item, index) {
                return h('span', { className: 'cms-preview__pill', key: index }, item.label || '버튼');
              })),
            ]),
            h('div', { className: 'cms-preview__card cms-preview__card--flat', key: 'footer' }, [
              h('p', { className: 'cms-preview__label' }, '하단 푸터'),
              textBlock(footer.addrLine1 || ''),
              textBlock(footer.addrLine2 || ''),
              textBlock(footer.copyright || '', 'cms-preview__text cms-preview__muted'),
            ]),
          ]),
        ])
      );
    },
  });

  var SiteNavigationPreview = createClass({
    render: function() {
      var nav = getData(this.props.entry).nav || [];
      return shell('상단 메뉴 미리보기', '메뉴명과 서브메뉴 흐름이 실제 헤더처럼 보입니다.',
        h('div', { className: 'cms-nav-list' }, nav.map(function(item, index) {
          return h('div', { className: 'cms-preview__card cms-preview__card--flat', key: index }, [
            h('h3', { className: 'cms-preview__title cms-preview__title--sm' }, item.label || '메뉴'),
            textBlock(item.href || ''),
            h('div', { className: 'cms-pill-list' }, (item.sub || []).map(function(sub, subIndex) {
              return h('span', { className: 'cms-preview__pill', key: subIndex }, sub.label || '서브메뉴');
            })),
          ]);
        }))
      );
    },
  });

  var SiteContactPreview = createClass({
    render: function() {
      var data = getData(this.props.entry);
      var hours = data.hours || [];
      var directions = data.directions || {};
      var bus = directions.bus || {};
      var car = directions.car || {};
      return shell('진료시간 / 오시는 길 / 상담', '방문 정보와 상담 팝업 내용을 바로 확인할 수 있습니다.',
        h('div', { className: 'cms-preview__grid' }, [
          h('section', { className: 'cms-preview__card cms-preview__card--flat', key: 'hours' }, [
            h('p', { className: 'cms-preview__label' }, '진료시간'),
            h('div', { className: 'cms-hours-list' }, hours.map(function(row, index) {
              return h('div', { className: 'cms-hours-row', key: index }, [
                h('strong', {}, row.day || '요일'),
                htmlBlock(row.time || ''),
              ]);
            })),
            textBlock(data.hoursClosed || '', 'cms-preview__text cms-preview__muted'),
          ]),
          h('section', { className: 'cms-preview__card', key: 'map' }, [
            directions.mapImage ? h('img', { className: 'cms-preview__image', src: assetUrl(directions.mapImage, this.props.getAsset), alt: '지도 이미지' }) : null,
            h('div', { className: 'cms-preview__body' }, [
              h('p', { className: 'cms-preview__label' }, '오시는 길'),
              textBlock(directions.address || ''),
              h('div', { className: 'cms-preview__split' }, [
                h('div', {}, [h('strong', {}, bus.label || '버스 안내'), textBlock(bus.desc || '')]),
                h('div', {}, [h('strong', {}, car.label || '주차 안내'), car.desc ? h('img', { className: 'cms-preview__image cms-preview__image--small', src: assetUrl(car.desc, this.props.getAsset), alt: car.label || '주차 안내' }) : textBlock('팝업 이미지 없음')]),
              ]),
            ]),
          ]),
        ])
      );
    },
  });

  var SitePopupsPreview = createClass({
    render: function() {
      var data = getData(this.props.entry);
      var intro = data.intro || {};
      var popups = data.noticePopups || [];
      return shell('인트로 / 홈 팝업', '홈 첫 진입 화면과 팝업 카드가 어떻게 보일지 빠르게 확인합니다.',
        h('div', { className: 'cms-preview__section' }, [
          h('section', { className: 'cms-intro-card', key: 'intro' }, [
            h('p', { className: 'cms-preview__label' }, '인트로 애니메이션'),
            h('div', { className: 'cms-intro-card__lines' }, [
              h('strong', {}, (intro.line1 || []).join(' ')),
              h('strong', {}, (intro.line2 || []).join(' ')),
            ]),
            htmlBlock(intro.tagHTML || '', 'cms-preview__html cms-preview__html--light'),
          ]),
          h('div', { className: 'cms-preview__grid', key: 'popups' }, popups.map(function(item, index) {
            return h('section', { className: 'cms-preview__card', key: index }, [
              item.image ? h('img', { className: 'cms-preview__image', src: assetUrl(item.image, this.props.getAsset), alt: item.title || '팝업 이미지' }) : null,
              h('div', { className: 'cms-preview__body' }, [
                h('p', { className: 'cms-preview__label' }, '팝업'),
                h('h3', { className: 'cms-preview__title cms-preview__title--sm' }, item.title || '팝업 제목'),
                textBlock(item.storageKey || '', 'cms-preview__text cms-preview__muted'),
              ]),
            ]);
          }, this)),
        ])
      );
    },
  });

  var HomeHeroPreview = createClass({
    render: function() {
      var slides = getData(this.props.entry).hero || [];
      return shell('메인 상단 비주얼', '슬라이드가 실제 홈페이지 히어로처럼 카드로 보입니다.',
        h('div', { className: 'cms-hero-slides' }, slides.map(function(slide, index) {
          return h('article', {
            className: 'cms-hero-slide',
            key: index,
            style: slide.bgImage ? { backgroundImage: 'linear-gradient(120deg, rgba(10,20,40,.82), rgba(28,49,104,.65)), url(' + assetUrl(slide.bgImage, this.props.getAsset) + ')' } : {},
          }, [
            h('span', { className: 'cms-preview__pill' }, '슬라이드 ' + (index + 1)),
            slide.h3 ? htmlBlock(slide.h3, 'cms-preview__hero-copy') : null,
            slide.h2 ? htmlBlock(slide.h2, 'cms-preview__hero-title') : null,
            (slide.list || []).length ? h('ul', { className: 'cms-preview__bullet-list' }, (slide.list || []).map(function(item, idx) {
              return h('li', { key: idx }, item);
            })) : null,
            slide.desc ? htmlBlock(slide.desc, 'cms-preview__hero-copy') : null,
            (slide.paragraphs || []).length ? h('div', { className: 'cms-preview__stack' }, slide.paragraphs.map(function(line, idx) {
              return htmlBlock(line, 'cms-preview__hero-copy');
            })) : null,
            slide.sign ? h('p', { className: 'cms-preview__text cms-preview__muted' }, slide.sign) : null,
          ]);
        }, this))
      );
    },
  });

  var HomeFocusPreview = createClass({
    render: function() {
      var data = getData(this.props.entry);
      var focusTitle = data.focusTitle || {};
      var items = data.focus || [];
      return shell(focusTitle.h2Html || '진료과목 카드', '카드형 메뉴가 실제 메인 섹션처럼 보입니다.',
        h('div', { className: 'cms-focus-grid' }, items.map(function(item, index) {
          return h('article', { className: 'cms-preview__card', key: index }, [
            item.img ? h('img', { className: 'cms-preview__image', src: assetUrl(item.img, this.props.getAsset), alt: item.title || '진료 이미지' }) : null,
            h('div', { className: 'cms-preview__body' }, [
              item.small ? h('p', { className: 'cms-preview__label' }, item.small) : null,
              h('h3', { className: 'cms-preview__title cms-preview__title--sm' }, item.title || '카드 제목'),
              textBlock(item.desc || ''),
              h('span', { className: 'cms-preview__pill' }, item.href || '#'),
            ]),
          ]);
        }, this))
      );
    },
  });

  var HomeBannersPreview = createClass({
    render: function() {
      var data = getData(this.props.entry);
      var checklist = data.checklist || {};
      var point = data.point || {};
      return shell('메인 강조 배너', '배경 이미지와 문구 흐름을 실제 배너처럼 보여줍니다.',
        h('div', { className: 'cms-banner-stack' }, [
          h('section', {
            className: 'cms-banner-card',
            key: 'checklist',
            style: checklist.bgImage ? { backgroundImage: 'linear-gradient(120deg, rgba(10,20,40,.82), rgba(28,49,104,.62)), url(' + assetUrl(checklist.bgImage, this.props.getAsset) + ')' } : {},
          }, [
            htmlBlock(checklist.titleHTML || '', 'cms-banner-card__title'),
            h('ul', { className: 'cms-preview__bullet-list' }, (checklist.items || []).map(function(item, index) {
              return h('li', { key: index }, item);
            })),
            htmlBlock(checklist.closingHTML || '', 'cms-banner-card__closing'),
          ]),
          h('section', {
            className: 'cms-banner-card cms-banner-card--secondary',
            key: 'point',
            style: point.bgImage ? { backgroundImage: 'linear-gradient(120deg, rgba(15,24,48,.9), rgba(28,49,104,.75)), url(' + assetUrl(point.bgImage, this.props.getAsset) + ')' } : {},
          }, [
            htmlBlock(point.titleHTML || '', 'cms-banner-card__title'),
            htmlBlock(point.descHTML || '', 'cms-preview__hero-copy'),
            htmlBlock(point.closingHTML || '', 'cms-banner-card__closing'),
          ]),
        ])
      );
    },
  });

  var HomeBlogPreview = createClass({
    render: function() {
      var data = getData(this.props.entry);
      var title = data.blogTitle || {};
      var posts = data.blog || [];
      return shell(title.h2Html || '건강정보 카드', '실제 메인 하단 카드처럼 미리 볼 수 있습니다.',
        h('div', { className: 'cms-blog-grid' }, posts.map(function(item, index) {
          return h('article', { className: 'cms-preview__card', key: index }, [
            item.img ? h('img', { className: 'cms-preview__image', src: assetUrl(item.img, this.props.getAsset), alt: item.title || '건강정보 이미지' }) : null,
            h('div', { className: 'cms-preview__body' }, [
              item.tag ? h('span', { className: 'cms-preview__pill' }, item.tag) : null,
              h('h3', { className: 'cms-preview__title cms-preview__title--sm' }, item.title || '카드 제목'),
              textBlock(item.href || '', 'cms-preview__text cms-preview__muted'),
            ]),
          ]);
        }, this))
      );
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
