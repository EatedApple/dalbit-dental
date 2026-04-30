/* ============================================================
   달빛치과 — data.js 콘텐츠를 HTML DOM에 주입하는 렌더 스크립트
   ─────────────────────────────────────────────────────────────
   - 공통 쉘(헤더/푸터/퀵/모달) 렌더는 모든 페이지에서 실행
   - 서브페이지 콘텐츠는 body[data-page] 가 있을 때만 페이지별 렌더 실행
   - 어떤 에러가 나도 마지막에 'site:rendered' 이벤트는 반드시 발행
   ============================================================ */
(async function(){
  try {
  const D = window.loadSiteData ? await window.loadSiteData() : window.SITE_DATA;
  if(!D){ console.warn('SITE_DATA 가 로드되지 않았습니다.'); return; }

  const $  = (s, p=document) => p.querySelector(s);
  const $$ = (s, p=document) => Array.from(p.querySelectorAll(s));
  const withYoutubeEmbedParams = (url) => {
    try{
      const embed = new URL(url, window.location.href);
      if(embed.hostname.includes('youtube.com')){
        if(!embed.searchParams.has('playsinline')) embed.searchParams.set('playsinline', '1');
        if(!embed.searchParams.has('rel')) embed.searchParams.set('rel', '0');
        if(!embed.searchParams.has('enablejsapi')) embed.searchParams.set('enablejsapi', '1');
        if(window.location.origin && window.location.origin !== 'null' && !embed.searchParams.has('origin')){
          embed.searchParams.set('origin', window.location.origin);
        }
      }
      return embed.toString();
    } catch(e){
      return url;
    }
  };

  /* ---------------- 페이지 타이틀 ---------------- */
  const pageKey = document.body.dataset.page;
  const pageData = pageKey && D.pages && D.pages[pageKey];
  const isHomePage = !pageKey;
  if(pageData?.pageTitle)       document.title = pageData.pageTitle;
  else if(D.brand?.pageTitle)   document.title = D.brand.pageTitle;

  /* ---------------- 브랜드 ---------------- */
  $$('img.brand__img').forEach(img=>{
    if(D.brand?.logo) img.src = D.brand.logo;
    if(D.brand?.name) img.alt = D.brand.name;
  });
  $$('[data-bind="brand.name"]').forEach(el => el.textContent = D.brand.name);
  $$('[data-bind="brand.headerName"]').forEach(el => el.textContent = D.brand.headerName || D.brand.name);
  $$('[data-bind="brand.nameEn"]').forEach(el => el.textContent = D.brand.nameEn);
  $$('[data-bind="brand.phoneText"]').forEach(el => el.textContent = D.brand.phoneText);
  $$('[data-bind="brand.addrTagline"]').forEach(el => el.innerHTML = D.brand.addrTagline || '');
  $$('a[href^="tel:"]').forEach(a => {
    a.setAttribute('href', 'tel:' + (D.brand.phone || '').replace(/[^\d+]/g,''));
  });

  /* ---------------- 인트로 splash (home 전용) ---------------- */
  try{
    if(D.intro){
      const intro = $('#intro');
      if(intro){
        const buildLine = (chars, accents) => {
          const div = document.createElement('div');
          div.className = 'intro__line';
          (chars||[]).forEach((ch, i) => {
            const sp = document.createElement('span');
            if(ch === ''){ sp.className = 'sp'; }
            else{
              sp.textContent = ch;
              if(accents && accents[i]) sp.classList.add('is-accent');
              sp.style.animationDelay = (0.05 + i*0.05) + 's';
            }
            div.appendChild(sp);
          });
          return div;
        };
        const tagEl = $('.intro__tag', intro);
        $$('.intro__line', intro).forEach(el => el.remove());
        const l2 = buildLine(D.intro.line2, D.intro.line2Accent);
        const l1 = buildLine(D.intro.line1, D.intro.line1Accent);
        $$('span', l2).forEach((sp, i) => {
          if(!sp.classList.contains('sp')) sp.style.animationDelay = (0.55 + i*0.05) + 's';
        });
        if(tagEl){
          intro.insertBefore(l2, tagEl);
          intro.insertBefore(l1, l2);
          if(D.intro.tagHTML) tagEl.innerHTML = D.intro.tagHTML;
        } else {
          intro.appendChild(l1);
          intro.appendChild(l2);
        }
      }
    }
  } catch(e){ console.warn('intro render error:', e); }

  /* ---------------- 헤더 네비게이션 ---------------- */
  if(D.nav){
    const ul = $('.gnb > ul');
    if(ul){
      // pageKey → nav 상위 항목의 label을 역추적해 is-current 부여
      const currentTop = (()=>{
        if(!pageKey) return null;
        const map = {
          about:        "병원소개",
          equipment:    "병원소개",
          implant:      "임플란트",
          ortho:        "투명교정",
          laminate:     "심미치료",
          conservation: "일반치료",
          wisdom:       "일반치료",
        };
        return map[pageKey] || null;
      })();
      ul.innerHTML = D.nav.map(item => `
        <li class="${item.label === currentTop ? 'is-current' : ''}">
          <a href="${item.href}">${item.label}</a>
          ${item.sub && item.sub.length ? `
          <ul class="gnb__sub">
            ${item.sub.map(s => `<li><a href="${s.href}">${s.label}</a></li>`).join('')}
          </ul>` : ''}
        </li>
      `).join('');
    }
  }

  /* ---------------- 우측 퀵메뉴 ---------------- */
  const ICONS = {
    chat:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    doc:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    kakao:   '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.48 3 2 6.48 2 10.78c0 2.74 1.83 5.15 4.6 6.55-.2.7-.71 2.5-.81 2.89-.13.49.18.48.38.35.16-.1 2.5-1.7 3.51-2.39.76.11 1.54.18 2.32.18 5.52 0 10-3.48 10-7.78S17.52 3 12 3z"/></svg>',
    calendar:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    phone:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z"/></svg>',
    arrow:   '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
  };

  if(D.quick){
    const aside = $('.quick');
    if(aside){
      aside.innerHTML = D.quick.map(q => {
        const phoneText = (D.brand?.phoneText || '').replace(/[^\d]/g, '');
        const phoneTop = phoneText.length >= 3 ? phoneText.slice(0, 3) : (D.brand?.phoneText || '054');
        const phoneBottom = phoneText.length >= 10
          ? `${phoneText.slice(3, 6)} ${phoneText.slice(6)}`
          : (D.brand?.phoneText || q.label).replace(/^0?\d{2,3}[.\-\s]?/, '').replace(/[.\-]/g, ' ');
        const inner = q.phoneBtn
          ? `<span class="quick__phone-number"><span>${phoneTop}</span><span>${phoneBottom}</span></span>`
          : `${ICONS[q.icon] || ''}${q.label}`;
        const cls = `${q.primary ? 'is-primary' : ''}${q.hidden ? ' is-hidden' : ''}${q.phoneBtn ? ' quick__phone' : ''}`.trim();
        if(q.modal){
          return `<button class="${cls}" type="button" data-modal-open="${q.modal}" aria-label="${q.label}">${inner}</button>`;
        }
        return `<a class="${cls}" href="${q.href}" ${q.href.startsWith('http')?'target="_blank" rel="noopener"':''}>${inner}</a>`;
      }).join('');
    }
  }

  /* ---------------- 메인 비주얼 (home 전용) ---------------- */
  if(D.hero && Array.isArray(D.hero)){
    const track = $('#heroTrack');
    if(track){
      track.innerHTML = D.hero.map((s, i) => {
        if(s.type === 'moon'){
          return `
          <article class="hero__slide hero__slide--1" data-slide="${i}">
            <div class="hero__text">
              ${s.h3 ? `<h3>${s.h3}</h3>` : ''}
              ${s.h2 ? `<h2>${s.h2}</h2>` : ''}
              ${s.list && s.list.length ? `<ul>${s.list.map(li=>`<li>${li}</li>`).join('')}</ul>` : ''}
              ${s.desc ? `<p>${s.desc}</p>` : ''}
            </div>
            <div class="hero__moon" aria-hidden="true"></div>
          </article>`;
        }
        return `
          <article class="hero__slide hero__slide--2" data-slide="${i}">
            <div class="hero__text">
              ${s.h3 ? `<h3>${s.h3}</h3>` : ''}
              ${(s.paragraphs||[]).map(p=>`<p>${p}</p>`).join('')}
              ${s.sign ? `<div class="sign">${s.sign}</div>` : ''}
            </div>
          </article>`;
      }).join('');
      D.hero.forEach((s, i) => {
        if(s.bgImage){
          const slide = track.querySelector(`[data-slide="${i}"]`);
          if(slide){
            slide.style.background =
              `linear-gradient(110deg, rgba(10,20,40,.85) 30%, rgba(28,49,104,.6) 100%), url("${s.bgImage}") center/cover no-repeat`;
          }
        }
      });
    }
  }

  /* ---------------- 섹션 타이틀 헬퍼 ---------------- */
  const renderTitle = (el, t) => {
    if(!el || !t) return;
    el.innerHTML = `
      <small>${t.small || ''}</small>
      <h2>${t.h2Html || ''}</h2>
      <div class="bar"></div>
      ${t.lead ? `<p class="lead">${t.lead}</p>` : ''}`;
  };
  renderTitle($('#focus-title'), D.focusTitle);
  renderTitle($('#blog-title'),  D.blogTitle);

  /* ---------------- 홈 카드 ---------------- */
  if(D.focus){
    const grid = $('#focus-grid');
    if(grid){
      grid.innerHTML = D.focus.map(c => `
        <a class="focus__card" href="${c.href}">
          <img src="${c.img}" alt="${c.title}">
          <div class="focus__inner">
            <h5>${c.small}</h5>
            <h4>${c.title}</h4>
            <p>${c.desc}</p>
            <span class="arrow">${ICONS.arrow}</span>
          </div>
        </a>`).join('');
    }
  }
  if(D.checklist){
    const sec = $('.banner-checklist');
    if(sec){
      if(D.checklist.bgImage){
        sec.style.background =
          `linear-gradient(120deg, rgba(10,20,40,.82) 40%, rgba(28,49,104,.6) 100%), url('${D.checklist.bgImage}') center/cover no-repeat fixed`;
      }
      const c = $('.banner-checklist .container');
      if(c){
        c.innerHTML = `
          <h3>${D.checklist.titleHTML || ''}</h3>
          <ul class="banner-checklist__list">
            ${(D.checklist.items||[]).map(i=>`<li>${i}</li>`).join('')}
          </ul>
          <h4>${D.checklist.closingHTML || ''}</h4>`;
      }
    }
  }
  if(D.point){
    const sec = $('.banner-point');
    if(sec){
      if(D.point.bgImage){
        sec.style.background =
          `linear-gradient(180deg, rgba(28,49,104,.85) 0%, rgba(10,20,40,.92) 100%), url('${D.point.bgImage}') center/cover no-repeat fixed`;
      }
      const c = $('.banner-point .container');
      if(c){
        c.innerHTML = `
          <h3>${D.point.titleHTML || ''}</h3>
          <div class="divider"></div>
          <h5>${D.point.descHTML || ''}</h5>
          <h4>${D.point.closingHTML || ''}</h4>`;
      }
    }
  }
  if(D.blog){
    const grid = $('#blog-grid');
    if(grid){
      grid.innerHTML = D.blog.map(b => `
        <a class="blog__card" href="${b.href}">
          <div class="blog__thumb"><img src="${b.img}" alt="${b.title}"></div>
          <div class="blog__body">
            <span class="blog__tag">${b.tag}</span>
            <h5 class="blog__title">${b.title}</h5>
          </div>
        </a>`).join('');
    }
  }

  /* ---------------- 진료시간 ---------------- */
  if(D.hours){
    const wrap = $('#hours-list');
    if(wrap){
      const tableHtml = D.hours.map(h => {
        if(h.note) return `<dl class="is-note"><dt></dt><dd><span class="hours-break hours-break--note">${h.note}</span></dd></dl>`;
        return `<dl><dt>${h.day}</dt><dd>${h.time}${h.badge ? ` <span style="color:var(--c-primary);font-weight:700">${h.badge}</span>` : ''}</dd></dl>`;
      }).join('') + (D.hoursClosed ? `<p class="closed">${D.hoursClosed}</p>` : '');
      wrap.innerHTML = tableHtml;
    }
  }
  if(D.directions){
    const mapEl = $('#map-placeholder');
    const busText = D.directions.bus && !D.directions.bus.isImage ? D.directions.bus.desc : '';
    if(mapEl && D.directions.mapImage){
      mapEl.classList.remove('map-placeholder');
      mapEl.classList.remove('kakao-static-map');
      mapEl.classList.add('map-image');
      mapEl.removeAttribute('style');
      mapEl.innerHTML = `
        <img src="${D.directions.mapImage}" alt="${D.directions.address || '오시는 길 안내'}">
        ${(D.directions.address || busText) ? `<p class="map-address">${D.directions.address || ''}${busText ? `<span>${busText}</span>` : ''}</p>` : ''}`;
    } else if(mapEl && D.directions.kakaoMapStatic){
      const m = D.directions.kakaoMapStatic;
      const q = encodeURIComponent(m.placeName || '');
      mapEl.classList.remove('map-placeholder');
      mapEl.classList.add('kakao-static-map');
      mapEl.removeAttribute('style');
      mapEl.innerHTML = `
        <a class="kakao-static-map__img"
           href="https://map.kakao.com/?urlX=${m.urlX}&urlY=${m.urlY}&itemId=${m.itemId}&q=${q}&srcid=${m.itemId}&map_type=TYPE_MAP&from=roughmap"
           target="_blank" rel="noopener" title="카카오맵에서 보기">
          <img src="${m.imgSrc}" alt="${m.placeName || '지도'}">
        </a>`;
    } else if(mapEl){
      const span = mapEl.querySelector('span');
      if(span) span.textContent = D.directions.address || '';
    }
    const dirWrap = $('#directions');
    if(dirWrap){
      const items = [D.directions.car].filter(Boolean).filter(item => !item.popupOnly);
      const icons = {
        bus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="16" rx="2"/><path d="M8 19v2"/><path d="M16 19v2"/><circle cx="8.5" cy="14.5" r="1"/><circle cx="15.5" cy="14.5" r="1"/></svg>',
        car: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></svg>'
      };
      dirWrap.innerHTML = items.map((item, index) => `
        <div><h6>${index === 0 ? icons.bus : icons.car}${item.label}</h6>${item.isImage ? `<div class="directions-image"><img src="${item.desc}" alt="${item.label}"></div>` : `<p>${item.desc}</p>`}</div>
      `).join('');
    }
  }

  /* ---------------- 푸터 ---------------- */
  if(D.footer){
    const a = $('#copy-addr');
    if(a){
      a.innerHTML = `
        <p>${D.footer.addrLine1}</p>
        <p>${D.footer.addrLine2}</p>
        <p>${D.footer.copyright}</p>`;
    }
  }

  /* ---------------- 모달 ---------------- */
  if(D.counselModal){
    const ttl = $('#modal-counsel .modal__head h4');
    if(ttl) ttl.textContent = D.counselModal.title;
    const intro = $('#modal-counsel .intro-text');
    if(intro) intro.textContent = D.counselModal.intro;
  }

  const popupItems = Array.isArray(D.noticePopups)
    ? D.noticePopups
    : (D.noticePopup ? [D.noticePopup] : []);

  if(isHomePage && popupItems.length){
    if(!document.getElementById('notice-popup-styles')){
      const style = document.createElement('style');
      style.id = 'notice-popup-styles';
      style.textContent = `
        .notice-popups{position:fixed;inset:0;z-index:250;display:grid;place-items:center;pointer-events:none;padding:24px}
        .notice-popup{grid-area:1/1;position:relative;width:var(--notice-width,min(90vw,420px));max-width:calc(100vw - 48px);max-height:calc(100vh - 48px);background:#fff;border:1px solid #dfe5f1;border-radius:22px;overflow:hidden;box-shadow:0 18px 48px rgba(28,49,104,.2);opacity:0;visibility:hidden;transform:translateY(calc(18px + (var(--notice-offset,0) * 18px))) scale(calc(1 - (var(--notice-offset,0) * .04)));transition:opacity .25s ease,visibility .25s ease,transform .25s ease;width .2s ease;pointer-events:auto;z-index:var(--notice-z,1)}
        .notice-popup.is-open{opacity:1;visibility:visible;transform:translateY(calc(var(--notice-offset,0) * 18px)) scale(calc(1 - (var(--notice-offset,0) * .04)))}
        .notice-popup__head{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid #e6e8ee}
        .notice-popup__head h4{font-size:18px;color:#1a1f2e}
        .notice-popup__close{width:34px;height:34px;border-radius:50%;background:#f6f8fc;font-size:22px;line-height:1;color:#1a1f2e}
        .notice-popup__body{display:flex;align-items:center;justify-content:center;padding:0;background:#fff;overflow:hidden}
        .notice-popup__body img{display:block;width:100%;height:auto;object-fit:contain}
        .notice-popup__foot{display:flex;gap:10px;justify-content:flex-end;padding:14px 18px;border-top:1px solid #e6e8ee;background:#fff}
        .notice-popup__foot button{padding:11px 14px;border-radius:12px;font-weight:700}
        .notice-popup__hide-day{background:#1c3168;color:#fff}
        .notice-popup__dismiss{background:#f6f8fc;color:#1a1f2e}
        @media (max-width: 720px){.notice-popups{padding:16px}.notice-popup{width:var(--notice-width,min(92vw,340px));max-width:calc(100vw - 32px);max-height:calc(100vh - 32px);border-radius:16px}.notice-popup__head{padding:12px 14px}.notice-popup__head h4{font-size:17px}.notice-popup__foot{padding:12px 14px;flex-wrap:wrap}.notice-popup__foot button{flex:1 1 calc(50% - 5px);padding:10px 12px;font-size:14px}}
      `;
      document.head.appendChild(style);
    }
    const oldWrap = document.getElementById('notice-popups');
    if(oldWrap) oldWrap.remove();

    const wrap = document.createElement('div');
    wrap.className = 'notice-popups';
    wrap.id = 'notice-popups';
    wrap.innerHTML = popupItems.map((item, index) => `
      <div class="notice-popup" id="notice-popup-${item.id || index}" aria-hidden="true" data-storage-key="${item.storageKey || `notice-popup-hide-until-${index}`}" style="--notice-offset:${index};--notice-z:${popupItems.length - index}">
        <div class="notice-popup__head">
          <h4>${item.title || '안내'}</h4>
          <button class="notice-popup__close" type="button" aria-label="닫기" data-notice-close>&times;</button>
        </div>
        <div class="notice-popup__body">
          <img src="${item.image}" alt="${item.title || '안내 이미지'}">
        </div>
        <div class="notice-popup__foot">
          <button class="notice-popup__dismiss" type="button" data-notice-close>닫기</button>
          <button class="notice-popup__hide-day" type="button" data-notice-hide-day>하루동안 보지 않기</button>
        </div>
      </div>
    `).join('');
    document.body.appendChild(wrap);
  } else {
    const oldWrap = document.getElementById('notice-popups');
    if(oldWrap) oldWrap.remove();
  }

  /* ==========================================================
     서브페이지 렌더링
     body[data-page] 가 있을 때만 동작
     ========================================================== */
  if(pageData){
    renderSubPage(pageData, D, $, ICONS, withYoutubeEmbedParams);
  }

  } catch(err){
    console.error('[render] 렌더 도중 오류:', err);
  } finally {
    document.dispatchEvent(new Event('site:rendered'));
    console.log('[render] site:rendered 이벤트 발행 완료');
  }

  /* ============================================
     서브페이지 렌더 함수
     ============================================ */
  function renderSubPage(P, D, $, ICONS, withYoutubeEmbedParams){
    const $$ = (s, p=document) => Array.from(p.querySelectorAll(s));
    /* HERO */
    const hero = $('.page-hero');
    if(hero && P.hero){
      if(P.hero.bg){
        const bg = hero.querySelector('.page-hero__bg');
        if(bg) bg.style.backgroundImage = `url("${P.hero.bg}")`;
      }
      const inner = hero.querySelector('.page-hero__inner');
      if(inner){
        inner.innerHTML = `
          ${P.hero.crumb ? `<div class="page-hero__crumb"><span>${P.hero.crumb}</span></div>` : ''}
          <h1>${P.hero.title || ''}</h1>
          ${P.hero.subtitle ? `<p class="sub">${P.hero.subtitle}</p>` : ''}`;
      }
    }

    /* INTRO */
    const intro = $('[data-block="intro"]');
    if(intro){
      if(P.intro){
        intro.innerHTML = `
          <div class="container">
            ${P.intro.note ? `<div class="note">${P.intro.note}</div>` : ''}
            <h2>${P.intro.titleHTML || ''}</h2>
            ${P.intro.lead ? `<p class="lead" style="margin-top:16px;color:var(--c-muted);font-size:16px;line-height:1.8;">${P.intro.lead}</p>` : ''}
            ${P.intro.descHTML ? `<div class="desc">${P.intro.descHTML}</div>` : ''}
          </div>`;
      } else {
        intro.remove();
      }
    }

    /* CARDS blocks: points / target / features / strengths / tmj / reasons / maintenance / promises / treatments / symptoms / wisdom */
    ['points','target','features','prevention','malocclusion','general','strengths','tmj','reasons','maintenance','promises','treatments','symptoms','wisdom'].forEach(key => {
      const block = $(`[data-block="${key}"]`);
      const D = P[key];
      if(!block || !D) return;
      const useNum = ['points','features','prevention','malocclusion','general','tmj','reasons','maintenance','treatments','symptoms','wisdom'].includes(key);
      const useEmoji = ['target','strengths','promises'].includes(key);
      block.innerHTML = `
        <div class="container">
          <div class="sec-title">
            <small>${D.small || ''}</small>
            <h2>${D.h2Html || ''}</h2>
            <div class="bar"></div>
            ${D.quote ? `<p class="pg-quote">&ldquo;${D.quote}&rdquo;</p>` : ''}
            ${D.lead ? `<p class="lead">${D.lead}</p>` : ''}
          </div>
          ${D.intro ? `<div class="pg-intro-box">${D.intro}</div>` : ''}
          <div class="pg-cards__grid" data-cols="${D.cols || 3}">
            ${(D.items||[]).map(it => `
              <article class="pg-card">
                ${useNum && it.num ? `<div class="num">${it.num}</div>` : ''}
                ${useEmoji && it.emoji ? `<div class="emoji">${it.emoji}</div>` : ''}
                <h4>${it.title || ''}</h4>
                <p>${(it.desc || '').replace(/\n/g, '<br>')}</p>
              </article>`).join('')}
          </div>
          ${D.note ? `<p class="pg-cards__note">${D.note}</p>` : ''}
          ${D.img ? `<img src="${D.img}" alt="${D.imgAlt||''}" class="pg-cards__img">` : ''}
          ${D.types ? `
          <div class="pg-types">
            <h3 class="pg-types__title">부정교합의 종류</h3>
            <p class="pg-types__lead">부정교합은 위아래 턱의 맞물림이 정상적이지 않거나 치열이 고르지 못한 상태를 말합니다. 방치할 경우 턱관절 질환이나 안면 비대칭으로 이어질 수 있어 정확한 진단이 필요합니다.</p>
            <div class="pg-types__grid">
              ${D.types.map(t => `
                <div class="pg-type-item">
                  <strong>${t.title}</strong>
                  <span>${t.desc}</span>
                </div>`).join('')}
            </div>
          </div>` : ''}
        </div>`;
    });

    /* GUIDE IMAGE (implant) */
    const guide = $('[data-block="guide"]');
    if(guide && P.guide){
      guide.innerHTML = `
        <div class="container">
          <div class="sec-title">
            <small>${P.guide.small || ''}</small>
            <h2>${P.guide.h2Html || ''}</h2>
            <div class="bar"></div>
          </div>
          <img src="${P.guide.img}" alt="${P.guide.alt || ''}" style="width:100%;max-width:900px;margin:0 auto;display:block;border-radius:16px;">
        </div>`;
    }

    /* TIMELINE (implant / ortho) */
    const tl = $('[data-block="timeline"]');
    if(tl && P.timeline){
      tl.innerHTML = `
        <div class="container">
          <div class="sec-title">
            <small>${P.timeline.small || ''}</small>
            <h2>${P.timeline.h2Html || ''}</h2>
            <div class="bar"></div>
          </div>
          <div class="pg-timeline__list">
            ${(P.timeline.items||[]).map(it => `
              <article class="pg-timeline__row">
                <div class="pg-timeline__media">
                  <img src="${it.img}" alt="${it.title}" onerror="this.style.background='#eef1f8';this.style.objectFit='contain';this.style.padding='20%';">
                </div>
                <div class="pg-timeline__body">
                  <span class="step">${it.step || ''}</span>
                  <h3>${it.title || ''}</h3>
                  <p class="desc">${it.descHTML || ''}</p>
                  ${it.details && it.details.length ? `
                    <ul>${it.details.map(d => `<li>${d}</li>`).join('')}</ul>` : ''}
                </div>
              </article>`).join('')}
          </div>
        </div>`;
    }

    /* COMPARISON table */
    const cmp = $('[data-block="compare"]');
    if(cmp && P.compare){
      const head = P.compare.head || [];
      const rows = P.compare.rows || [];
      const cols = head.length;
      const gridCols = cols === 4 ? '140px 1fr 1fr 1fr' :
                       cols === 3 ? '140px 1fr 1fr'      :
                                    '140px 1fr 1fr';
      const valueHeads = head.slice(1);
      cmp.innerHTML = `
        <div class="container">
          <div class="sec-title">
            <small>${P.compare.small || ''}</small>
            <h2>${P.compare.h2Html || ''}</h2>
            <div class="bar"></div>
          </div>
          <div class="pg-compare__table">
            <div class="pg-compare__head" style="grid-template-columns:${gridCols}">
              ${head.map((h, i) => {
                const acc = (i === cols - 1) ? 'accent' : '';
                return `<div class="${acc}">${h}</div>`;
              }).join('')}
            </div>
            ${rows.map(r => {
              const values = r.cols || [r.a || '', r.b || ''];
              if(r.cols){
                return `<div class="pg-compare__row" style="grid-template-columns:${gridCols}">
                  <div class="pg-compare__subject">${r.label}</div>
                  ${values.map((c, i) => `
                    <div class="pg-compare__cell ${i === values.length - 1 ? 'accent' : ''}">
                      <span class="pg-compare__mobile-label">${valueHeads[i] || ''}</span>
                      <span class="pg-compare__value">${c}</span>
                    </div>
                  `).join('')}
                </div>`;
              }
              return `<div class="pg-compare__row" style="grid-template-columns:${gridCols}">
                <div class="pg-compare__subject">${r.label}</div>
                ${values.map((c, i) => `
                  <div class="pg-compare__cell ${i === values.length - 1 ? 'accent' : ''}">
                    <span class="pg-compare__mobile-label">${valueHeads[i] || ''}</span>
                    <span class="pg-compare__value">${c}</span>
                  </div>
                `).join('')}
              </div>`;
            }).join('')}
          </div>
        </div>`;
    }

    /* STAGES (conservation) */
    const stages = $('[data-block="stages"]');
    if(stages && P.stages){
      stages.innerHTML = `
        <div class="container">
          <div class="sec-title">
            <small>${P.stages.small || ''}</small>
            <h2>${P.stages.h2Html || ''}</h2>
            <div class="bar"></div>
            ${P.stages.lead ? `<p class="lead">${P.stages.lead}</p>` : ''}
          </div>
          ${P.stages.image ? `
            <div class="pg-stages__hero">
              <img src="${P.stages.image}" alt="충치 4단계 안내">
            </div>
          ` : ''}
        </div>`;
    }

    /* ENDO (conservation — 신경치료) */
    const endo = $('[data-block="endo"]');
    if(endo && P.endo){
      endo.id = P.endo.id || 'endo';
      endo.innerHTML = `
        <div class="container">
          <div class="pg-endo__wrap">
            <div class="pg-endo__body">
              <h2>${P.endo.titleHTML || ''}</h2>
            </div>
            <div class="pg-endo__media"><img src="${P.endo.img}" alt="신경치료"></div>
          </div>
        </div>`;
    }

    /* EQUIPMENT alternating items */
    const eq = $('[data-block="equipment"]');
    if(eq && (P.cards || P.items)){
      const cards = P.cards || P.items || [];
      const showEquipmentTitle = P.showTitle !== false;

      eq.innerHTML = `
        <div class="container">
          ${showEquipmentTitle ? `
            <div class="sec-title">
              <small>EQUIPMENT</small>
              <h2>달빛치과의 <b>첨단 장비</b></h2>
              <div class="bar"></div>
            </div>
          ` : ''}
          <div class="pg-equipment__slider">
            ${cards.length > 1 ? `
              <button type="button" class="pg-equipment__nav pg-equipment__nav--prev" data-eq-nav="prev" aria-label="이전 장비">&larr;</button>
              <button type="button" class="pg-equipment__nav pg-equipment__nav--next" data-eq-nav="next" aria-label="다음 장비">&rarr;</button>
            ` : ''}
            <div class="pg-equipment__viewport">
              <div class="pg-equipment__track" data-role="equipment-track">
                ${cards.map((it, index) => `
                  <article class="pg-equipment-slide ${index === 0 ? 'is-active' : ''}" data-eq-slide="${index}">
                    <div class="pg-equipment-slide__media">
                      <img src="${((it.images && it.images[0]) || it.main || '')}" alt="${it.tag || '장비 이미지'}">
                    </div>
                    <div class="pg-equipment-slide__body">
                      <span class="tag">${it.tag || ''}</span>
                      <h3>${it.titleHTML || ''}</h3>
                      <p class="desc">${it.desc || ''}</p>
                      ${it.points && it.points.length ? `<ul>${it.points.map(p => `<li>${p}</li>`).join('')}</ul>` : ''}
                    </div>
                  </article>
                `).join('')}
              </div>
            </div>
          </div>
          ${cards.length > 1 ? `
            <div class="pg-equipment__controls">
              <div class="pg-equipment__dots" data-role="equipment-dots"></div>
            </div>
          ` : ''}
        </div>`;

      const track = $('[data-role="equipment-track"]', eq);
      const viewport = $('.pg-equipment__viewport', eq);
      const dotsWrap = $('[data-role="equipment-dots"]', eq);
      let currentPage = 0;
      let visibleCount = 3;
      let autoTimer = null;

      const getVisibleCount = () => window.innerWidth <= 720 ? 1 : 3;
      const getPageCount = () => Math.max(1, cards.length - visibleCount + 1);

      const stopAuto = () => {
        if(autoTimer){
          clearInterval(autoTimer);
          autoTimer = null;
        }
      };

      const startAuto = () => {
        stopAuto();
        if(cards.length <= visibleCount) return;
        autoTimer = setInterval(() => {
          const pageCount = getPageCount();
          currentPage = (currentPage + 1) % pageCount;
          renderEquipmentSlider();
        }, 4500);
      };

      const buildDots = () => {
        if(!dotsWrap) return;
        const pageCount = getPageCount();
        dotsWrap.innerHTML = Array.from({ length: pageCount }, (_, index) => `
          <button type="button" class="${index === currentPage ? 'is-active' : ''}" data-eq-dot="${index}" aria-label="장비 페이지 ${index + 1}"></button>
        `).join('');
        $$('[data-eq-dot]', dotsWrap).forEach(dot => {
          dot.addEventListener('click', () => {
            currentPage = Number(dot.dataset.eqDot || 0);
            renderEquipmentSlider();
          });
        });
      };

      const renderEquipmentSlider = () => {
        if(!track || !viewport) return;
        visibleCount = getVisibleCount();
        const pageCount = getPageCount();
        currentPage = Math.min(currentPage, pageCount - 1);
        track.style.setProperty('--visible-count', String(visibleCount));
        const slide = $('[data-eq-slide]', eq);
        const gap = parseFloat(getComputedStyle(track).gap || '0') || 0;
        const slideWidth = slide ? slide.getBoundingClientRect().width : viewport.clientWidth;
        track.style.transform = `translateX(-${currentPage * (slideWidth + gap)}px)`;
        $$('[data-eq-slide]', eq).forEach((slide, index) => {
          const start = currentPage;
          const end = start + visibleCount;
          slide.classList.toggle('is-active', index >= start && index < end);
        });
        buildDots();
      };

      $$('[data-eq-nav]', eq).forEach(btn => {
        btn.addEventListener('click', () => {
          if(!cards.length) return;
          const pageCount = getPageCount();
          currentPage = btn.dataset.eqNav === 'next'
            ? (currentPage + 1) % pageCount
            : (currentPage - 1 + pageCount) % pageCount;
          renderEquipmentSlider();
          startAuto();
        });
      });

      viewport?.addEventListener('mouseenter', stopAuto);
      viewport?.addEventListener('mouseleave', startAuto);
      viewport?.addEventListener('touchstart', stopAuto, { passive: true });
      viewport?.addEventListener('touchend', startAuto, { passive: true });

      window.addEventListener('resize', renderEquipmentSlider);
      renderEquipmentSlider();
      startAuto();
    }

    /* LAMINATE minimal prep */
    const mn = $('[data-block="minimal"]');
    if(mn && P.minimal){
      mn.innerHTML = `
        <div class="container">
          <div class="sec-title">
            <small>${P.minimal.small || ''}</small>
            <h2>${P.minimal.h2Html || ''}</h2>
            <div class="bar"></div>
          </div>
          <div class="pg-minimal__wrap">
            <div class="pg-minimal__media"><img src="${P.minimal.img}" alt="최소 삭제"></div>
            <div class="pg-minimal__body">
              <p class="desc">${P.minimal.descHTML || ''}</p>
              <div class="pg-minimal__points">
                ${(P.minimal.points||[]).map(p => `
                  <div>
                    <h5>${p.title || ''}</h5>
                    <p>${p.text || ''}</p>
                  </div>`).join('')}
              </div>
            </div>
          </div>
        </div>`;
    }

    /* SELF WHITENING (laminate) */
    const selfWhitening = $('[data-block="self-whitening"]');
    if(selfWhitening && P.selfWhitening){
      const S = P.selfWhitening;
      selfWhitening.innerHTML = `
        <div class="container">
          <div class="sec-title">
            <small>${S.small || ''}</small>
            <h2>${S.h2Html || ''}</h2>
            <div class="bar"></div>
          </div>
          <div class="pg-self__wrap">
            <div class="pg-self__media"><img src="${S.img}" alt="뷰티스 홈 자가미백"></div>
            <div class="pg-self__body">
              <h3>${S.titleHTML || ''}</h3>
              <p class="desc">${S.descHTML || ''}</p>
              <div class="pg-self__block">
                <h4>뷰티스 홈의 특장점</h4>
                <ul>${(S.strengths || []).map(item => `<li>${item}</li>`).join('')}</ul>
              </div>
              <div class="pg-self__block">
                <h4>이런 분들께 추천합니다</h4>
                <ul>${(S.recommend || []).map(item => `<li>${item}</li>`).join('')}</ul>
              </div>
              <div class="pg-self__block caution">
                <h4>미백 기간 주의사항</h4>
                <ul>${(S.cautions || []).map(item => `<li>${item}</li>`).join('')}</ul>
              </div>
            </div>
          </div>
        </div>`;
    }

    /* TYPES grid (wisdom types / laminate types) */
    const types = $('[data-block="types"]');
    if(types && P.wisdomTypes){
      const T = P.wisdomTypes;
      types.innerHTML = `
        <div class="container">
          <div class="sec-title">
            <small>${T.small || ''}</small>
            <h2>${T.h2Html || ''}</h2>
            <div class="bar"></div>
            ${T.lead ? `<p class="lead">${T.lead}</p>` : ''}
          </div>
          ${T.image ? `
            <div class="pg-types__hero">
              <img src="${T.image}" alt="사랑니 유형별 난이도 안내">
            </div>
          ` : `
            <div class="pg-types__grid">
              ${(T.items||[]).map(t => `
                <article class="pg-type">
                  <div class="pg-type__img"><img src="${t.img}" alt="${t.title}"></div>
                  <div class="pg-type__body">
                    <h4>${t.title || ''}</h4>
                    <p>${t.desc || ''}</p>
                  </div>
                </article>`).join('')}
            </div>
          `}
        </div>`;
    } else if(types && P.types){
      const T = P.types;
      types.innerHTML = `
        <div class="container">
          <div class="sec-title">
            <small>${T.small || ''}</small>
            <h2>${T.h2Html || ''}</h2>
            <div class="bar"></div>
            ${T.lead ? `<p class="lead">${T.lead}</p>` : ''}
          </div>
          <div class="pg-types__grid">
            ${(T.items||[]).map(t => `
              <article class="pg-type">
                <div class="pg-type__img"><img src="${t.img}" alt="${t.title}"></div>
                <div class="pg-type__body">
                  <h4>${t.title || ''}</h4>
                  <p>${t.desc || ''}</p>
                </div>
              </article>`).join('')}
          </div>
        </div>`;
    }

    /* WISDOM (reasons) — used as list-num (id anchor) */
    const wisBlock = $('[data-block="wisdom"]');
    if(wisBlock && P.wisdom){
      const W = P.wisdom;
      wisBlock.id = W.id || 'wisdom';
      wisBlock.innerHTML = `
        <div class="container">
          <div class="sec-title">
            <small>${W.small || ''}</small>
            <h2>${W.h2Html || ''}</h2>
            <div class="bar"></div>
            ${W.lead ? `<p class="lead">${W.lead}</p>` : ''}
          </div>
          <div class="pg-list-num__grid" style="--cols:${W.cols || 3}">
            ${(W.items||[]).map(it => `
              <article class="pg-list-num__item">
                <div class="n">${it.num || ''}</div>
                <h4>${it.title || ''}</h4>
                <p>${it.desc || ''}</p>
              </article>`).join('')}
          </div>
        </div>`;
    }

    /* PRECAUTIONS (wisdom / laminate) */
    const pr = $('[data-block="precautions"]');
    if(pr && P.precautions){
      pr.innerHTML = `
        <div class="container">
          <div class="sec-title">
            <small>${P.precautions.small || ''}</small>
            <h2>${P.precautions.h2Html || ''}</h2>
            <div class="bar"></div>
            ${P.precautions.lead ? `<p class="lead" style="color:rgba(255,255,255,.92)">${P.precautions.lead}</p>` : ''}
          </div>
          <ul class="pg-precautions__list">
            ${(P.precautions.items||[]).map((item, i) => `
              <li><span class="pn">${String(i+1).padStart(2,'0')}</span><span>${item}</span></li>
            `).join('')}
          </ul>
        </div>`;
    }

    /* VIDEO (implant youtube / ortho local) */
    const vid = $('[data-block="video"]');
    if(vid && P.video){
      const V = P.video;
      const media = V.youtube
        ? `<iframe src="${withYoutubeEmbedParams(V.youtube)}" title="영상" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"></iframe>`
        : V.local
          ? `<video controls playsinline preload="metadata"><source src="${V.local}" type="video/mp4"></video>`
          : '';
      vid.innerHTML = `
        <div class="container">
          <div class="sec-title">
            <small>${V.small || ''}</small>
            <h2>${V.h2Html || ''}</h2>
            <div class="bar"></div>
          </div>
          <div class="pg-video__frame">${media}</div>
          ${V.caption ? `<div class="pg-video__caption">${V.caption}</div>` : ''}
        </div>`;
    }

    /* DOCTORS (about) */
    const doc = $('[data-block="doctors"]');
    if(doc && P.doctors){
      const DR = P.doctors;
      if(DR.id) doc.id = DR.id;
      doc.innerHTML = `
        <div class="container">
          <div class="sec-title">
            <small>${DR.small || ''}</small>
            <h2>${DR.h2Html || ''}</h2>
            <div class="bar"></div>
            ${DR.lead ? `<p class="lead">${DR.lead}</p>` : ''}
          </div>
          <div class="pg-doctors__grid">
            ${(DR.items||[]).map(d => `
              <article class="pg-doctor-card">
                <div class="pg-doctor-card__head">
                  <div class="pg-doctor-card__avatar">${d.photo ? `<img src="${d.photo}" alt="${d.name || ''}">` : (d.initial || '')}</div>
                  ${d.badge ? `<div class="badge">${d.badge}</div>` : ''}
                  <div class="name">${d.name || ''}${d.nameEn ? `<small>${d.nameEn}</small>` : ''}</div>
                  <div class="role">${d.roleKo || d.role || ''}</div>
                </div>
                <div class="pg-doctor-card__body">
                  <h5>MAJOR HISTORY</h5>
                  <ul>
                    ${(d.history||[]).map(h => `<li>${h}</li>`).join('')}
                  </ul>
                </div>
              </article>`).join('')}
          </div>
        </div>`;
    }

    /* GALLERY (about) */
    const gal = $('[data-block="gallery"]');
    if(gal && P.gallery){
      const G = P.gallery;
      if(G.id) gal.id = G.id;
      gal.innerHTML = `
        <div class="container">
          <div class="sec-title">
            <small>${G.small || ''}</small>
            <h2>${G.h2Html || ''}</h2>
            <div class="bar"></div>
            ${G.lead ? `<p class="lead">${G.lead}</p>` : ''}
          </div>
          <div class="pg-gallery__grid">
            ${(G.items||[]).map(it => it.ghost
              ? `<div class="pg-gallery__item is-ghost" aria-hidden="true"></div>`
              : `<figure class="pg-gallery__item${it.span ? ' is-'+it.span : ''}">
                <img src="${it.img}" alt="${it.text || ''}" loading="lazy">
                ${it.text ? `<figcaption>${it.text}</figcaption>` : ''}
              </figure>`).join('')}
          </div>
        </div>`;
    }

    /* CTA */
    const cta = $('[data-block="cta"]');
    if(cta && P.cta){
      const tel = (D.brand && D.brand.phoneText) || '054.705.0101';
      cta.innerHTML = `
        <div class="container">
          <h3>${P.cta.titleHTML || ''}</h3>
          <p>${P.cta.desc || ''}</p>
          <div class="pg-cta__btns">
            <a class="pg-cta__btn primary" href="tel:054-705-0101">
              ${ICONS.phone} 전화상담 ${tel}
            </a>
          </div>
        </div>`;
    }
  } /* end renderSubPage */

})();
