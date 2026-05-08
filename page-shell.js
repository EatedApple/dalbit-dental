/* ============================================================
   달빛치과 — 서브페이지 공통 인터랙션
   (햄버거 메뉴 / 모달 / 바텀바 / 폼 검증)
   데이터 주입 전에 listener 를 등록해 site:rendered 이벤트를 받음.
   ============================================================ */

/* ────────────────────────────────────────────────────────────
   공용 마크업 자동 주입 (서브페이지 전용)
   - header, quick aside, page-hero 스켈레톤,
     foot-board(진료시간/오시는길), copy footer, bottom-bar, modal
   - index.html 처럼 이미 .header 가 존재하면 건드리지 않음
   ──────────────────────────────────────────────────────────── */
(function injectShell(){
  if(!document.body) return;
  if(document.querySelector('header.header')) return; // 이미 정적 마크업이 있는 페이지(index)

  const HEAD_HTML = `
<aside class="quick" aria-label="빠른 메뉴"></aside>

<header class="header">
  <div class="header__top">
    <div class="header__addr" data-bind="brand.addrTagline"></div>
    <a href="index.html" class="brand">
      <img class="brand__img" src="imgs/logo.png" alt="달빛치과의원">
    </a>
    <a href="tel:054-705-0101" class="header__call">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z"/></svg>
      <span data-bind="brand.phoneText">054.705.0101</span>
    </a>
    <button class="menu-btn" type="button" aria-label="메뉴 열기" id="menuBtn">
      <span></span><span></span><span></span>
    </button>
  </div>
  <div class="header__nav">
    <nav class="gnb" aria-label="주메뉴">
      <ul id="gnb-list"></ul>
    </nav>
  </div>
</header>

<section class="page-hero">
  <div class="page-hero__bg"></div>
  <div class="page-hero__inner"></div>
</section>
`;

  const TAIL_HTML = `
<section class="foot-board" id="info">
  <div class="foot-board__grid">
    <div class="foot-card foot-card--hours">
      <h4>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        진료시간
      </h4>
      <div class="hours" id="hours-list"></div>
      <div class="contact-buttons">
        <a href="tel:054-705-0101">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z"/></svg>
          전화상담
        </a>
        <a class="kakao" href="#kakao">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.48 3 2 6.48 2 10.78c0 2.74 1.83 5.15 4.6 6.55-.2.7-.71 2.5-.81 2.89-.13.49.18.48.38.35.16-.1 2.5-1.7 3.51-2.39.76.11 1.54.18 2.32.18 5.52 0 10-3.48 10-7.78S17.52 3 12 3z"/></svg>
          카카오톡
        </a>
      </div>
    </div>
    <div class="foot-card foot-card--map">
      <h4>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        오시는 길
      </h4>
      <div class="map-placeholder" id="map-placeholder"><span></span></div>
      <div class="directions" id="directions"></div>
    </div>
  </div>
</section>

<footer class="copy">
  <div class="container">
    <div class="copy__brand">
      <span style="display:inline-block;padding:10px 16px;background:#fff;border-radius:10px">
        <img class="brand__img" src="imgs/logo.png" alt="달빛치과의원" style="height:36px;display:block">
      </span>
    </div>
    <address class="copy__addr" id="copy-addr"></address>
    <button class="copy__btn" type="button" data-modal-open="counsel">상담 신청</button>
  </div>
</footer>

<div class="bottom-bar" id="bottomBar">
  <form id="bottomForm" autocomplete="off">
    <h2><span>빠른</span> 상담신청</h2>
    <input type="text" name="name" placeholder="성함" maxlength="5" required>
    <input type="tel" name="phone" placeholder="연락처" maxlength="13" required>
    <label class="agree">
      <input type="checkbox" checked required> 개인정보수집 동의
      <a href="#privacy" target="_blank">[보기]</a>
    </label>
    <button type="submit">상담신청</button>
  </form>
</div>

<div class="modal" id="modal-counsel" aria-hidden="true">
  <div class="modal__dim" data-modal-close></div>
  <div class="modal__panel">
    <div class="modal__head">
      <h4>빠른 상담</h4>
      <button class="modal__close" type="button" data-modal-close aria-label="닫기">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="modal__body">
      <p class="intro-text"></p>
      <form class="quick-form" id="modalForm" autocomplete="off">
        <div><label>이름</label><input type="text" name="name" maxlength="4" required></div>
        <div><label>연락처</label><input type="tel" name="phone" maxlength="15" required placeholder="010-0000-0000"></div>
        <div><label>문의내용</label><textarea name="message" required></textarea></div>
        <label class="agree">
          <input type="checkbox" checked required> 개인정보취급방침 동의
          <a href="#privacy" target="_blank" style="color:var(--c-primary);text-decoration:underline">[자세히 보기]</a>
        </label>
        <button type="submit">상담하기</button>
      </form>
    </div>
  </div>
</div>
`;

  // page-shell.js 는 <body> 끝부분 <script> 직전에 로드됨 → body 이미 파싱됨
  document.body.insertAdjacentHTML('afterbegin', HEAD_HTML);

  // 첫 <script> 앞에 tail 삽입 (스크립트 뒤로 밀려나지 않게)
  const firstScript = document.body.querySelector('script');
  if(firstScript){
    firstScript.insertAdjacentHTML('beforebegin', TAIL_HTML);
  } else {
    document.body.insertAdjacentHTML('beforeend', TAIL_HTML);
  }
})();

/* ────────────────────────────────────────────────────────────
   맨 위로 가기 버튼 — 모든 페이지(index 포함) 공통 주입
   ──────────────────────────────────────────────────────────── */
(function injectScrollTop(){
  if(!document.body) return;
  if(document.querySelector('.scroll-top')) return;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'scroll-top';
  btn.setAttribute('aria-label', '맨 위로 이동');
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>';
  document.body.appendChild(btn);

  btn.addEventListener('click', () => {
    window.scrollTo({ top:0, behavior:'smooth' });
  });

  const onScroll = () => {
    btn.classList.toggle('is-visible', window.scrollY > 400);
  };
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();
})();

/* 팝업 창 오픈 (네이버톡톡 등) — 전역 위임, 모든 페이지 */
document.addEventListener('click', function(e){
  const a = e.target.closest('a[data-popup]');
  if(!a) return;
  const url = a.dataset.popup;
  if(!url) return;
  e.preventDefault();
  const w = 420, h = 720;
  const left = Math.max(0, (window.screen.availWidth  - w) / 2);
  const top  = Math.max(0, (window.screen.availHeight - h) / 2);
  const features = `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes`;
  const win = window.open(url, 'naverTalk', features);
  if(!win){ /* 팝업 차단 시 새 탭 폴백 */ window.open(url, '_blank'); }
});

/* 모바일 햄버거 메뉴 — 정적 HTML 기반, 즉시 부착 */
(function(){
  const init = () => {
    const btn    = document.getElementById('menuBtn');
    const header = document.querySelector('.header');
    if(!btn || !header) return;
    if(btn.dataset.bound) return;
    btn.dataset.bound = '1';

    btn.addEventListener('click', () => header.classList.toggle('is-menu-open'));
    header.addEventListener('click', e => {
      if(e.target.tagName === 'A' && header.classList.contains('is-menu-open')){
        header.classList.remove('is-menu-open');
      }
    });
    window.addEventListener('resize', () => {
      if(window.innerWidth > 1100) header.classList.remove('is-menu-open');
    });
  };
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

/* site:rendered 이후 — 모달/바텀바/폼 초기화
   (index.html 은 자체 인라인 핸들러를 가지므로 data-page="home" 인 경우 스킵하여 중복 바인딩 방지) */
document.addEventListener('site:rendered', function(){
  if(document.body.dataset.page === 'home') return;
  if(document.body.dataset.shellBound) return;
  document.body.dataset.shellBound = '1';

  /* MODAL system */
  (function(){
    const open = (id)=>{
      const m = document.getElementById('modal-'+id);
      if(!m) return;
      m.classList.add('is-open');
      m.setAttribute('aria-hidden','false');
      document.body.style.overflow = 'hidden';
    };
    const close = (m)=>{
      m.classList.remove('is-open');
      m.setAttribute('aria-hidden','true');
      document.body.style.overflow = '';
    };
    document.querySelectorAll('[data-modal-open]').forEach(btn=>{
      btn.addEventListener('click', ()=> open(btn.dataset.modalOpen));
    });
    document.querySelectorAll('[data-modal-close]').forEach(el=>{
      el.addEventListener('click', e=>{
        const m = e.currentTarget.closest('.modal');
        if(m) close(m);
      });
    });
    document.addEventListener('keydown', e=>{
      if(e.key === 'Escape') document.querySelectorAll('.modal.is-open').forEach(close);
    });
  })();

  /* BOTTOM bar visibility */
  (function(){
    const bar = document.getElementById('bottomBar');
    const footer = document.querySelector('.copy');
    if(!bar) return;
    const onScroll = () => {
      const scrollY = window.scrollY;
      const winH    = window.innerHeight;
      bar.classList.toggle('is-visible', scrollY > 300);
      if(footer){
        const footerTop = footer.getBoundingClientRect().top + scrollY;
        const nearFooter = (scrollY + winH) > footerTop - 40;
        bar.classList.toggle('is-near-footer', nearFooter);
      }
    };
    window.addEventListener('scroll', onScroll, {passive:true});
    window.addEventListener('resize', onScroll);
    onScroll();
  })();

  /* Form validation */
  (function(){
    const handle = (form, label)=>{
      if(!form) return;
      form.addEventListener('submit', e=>{
        e.preventDefault();
        const data = new FormData(form);
        if(!data.get('name') || form.elements['name'].value.trim().length < 2){
          alert('이름을 2글자 이상 입력해 주세요.');
          return;
        }
        if(!data.get('phone') || !/^[\d\-]{9,13}$/.test(form.elements['phone'].value.replace(/\s/g,''))){
          alert('올바른 연락처를 입력해 주세요.');
          return;
        }
        alert(label + ' 신청이 접수되었습니다. 곧 연락드리겠습니다.');
        form.reset();
        const m = form.closest('.modal');
        if(m){ m.classList.remove('is-open'); document.body.style.overflow=''; }
      });
    };
    handle(document.getElementById('modalForm'),  '상담');
    handle(document.getElementById('bottomForm'), '빠른 상담');
  })();

  /* Notice popup */
  (function(){
    const popups = Array.from(document.querySelectorAll('.notice-popup'));
    if(!popups.length) return;
    const wrap = document.getElementById('notice-popups');
    let lightbox = null;

    const ensureLightbox = () => {
      if(lightbox) return lightbox;
      lightbox = document.getElementById('notice-lightbox');
      if(lightbox) return lightbox;
      lightbox = document.createElement('div');
      lightbox.id = 'notice-lightbox';
      lightbox.className = 'notice-lightbox';
      lightbox.setAttribute('aria-hidden', 'true');
      lightbox.innerHTML = `
        <button class="notice-lightbox__close" type="button" aria-label="이미지 닫기" data-notice-lightbox-close>&times;</button>
        <img class="notice-lightbox__img" alt="">
      `;
      document.body.appendChild(lightbox);
      lightbox.addEventListener('click', e => {
        if(e.target === lightbox || e.target.closest('[data-notice-lightbox-close]')) closeLightbox();
      });
      return lightbox;
    };

    const openLightbox = (img) => {
      const viewer = ensureLightbox();
      const viewerImg = viewer.querySelector('.notice-lightbox__img');
      viewerImg.src = img.currentSrc || img.src;
      viewerImg.alt = img.alt || '';
      viewer.classList.add('is-open');
      viewer.setAttribute('aria-hidden', 'false');
    };

    const closeLightbox = () => {
      const viewer = ensureLightbox();
      viewer.classList.remove('is-open');
      viewer.setAttribute('aria-hidden', 'true');
    };

    const sizePopup = (popup) => {
      const img = popup.querySelector('.notice-popup__body img');
      if(!img) return;

      const naturalWidth = img.naturalWidth || img.width;
      const naturalHeight = img.naturalHeight || img.height;
      if(!naturalWidth || !naturalHeight) return;

      const isMobile = window.innerWidth <= 720;
      const ratio = naturalWidth / naturalHeight;
      const isLandscape = ratio >= 1.2;
      const viewportWidth = window.innerWidth - (isMobile ? 32 : 48);
      const chromeHeight = isMobile ? 176 : (isLandscape ? 176 : 220);
      const viewportHeight = Math.max(180, window.innerHeight - chromeHeight);
      const minWidth = Math.min(isMobile ? 260 : (isLandscape ? 520 : 320), viewportWidth);
      const maxWidth = isMobile ? viewportWidth : (isLandscape ? 920 : 560);
      const fittedWidth = Math.min(naturalWidth, viewportWidth, viewportHeight * ratio, maxWidth);
      const safeMinWidth = Math.min(minWidth, viewportWidth);
      const naturalCapWidth = Math.min(naturalWidth, viewportWidth, maxWidth);
      const popupWidth = Math.min(Math.max(safeMinWidth, fittedWidth), naturalCapWidth);

      popup.classList.toggle('is-landscape', isLandscape);
      popup.style.setProperty('--notice-width', `${Math.round(popupWidth)}px`);
      popup.style.setProperty('--notice-image-max-height', `${Math.round(viewportHeight)}px`);
    };

    const layoutPopups = () => {
      if(!wrap) return;
      wrap.classList.remove('notice-popups--row', 'notice-popups--column', 'notice-popups--scroll');
      const openPopups = popups.filter(popup => popup.classList.contains('is-open'));
      if(openPopups.length < 2) return;

      const isMobile = window.innerWidth <= 720;
      const gap = isMobile ? 12 : 18;
      const availableWidth = window.innerWidth - (isMobile ? 32 : 48);
      const availableHeight = window.innerHeight - (isMobile ? 32 : 48);
      const widths = openPopups.map(popup => popup.getBoundingClientRect().width);
      const heights = openPopups.map(popup => popup.getBoundingClientRect().height);
      const rowFits = widths.reduce((sum, width) => sum + width, 0) + (gap * (openPopups.length - 1)) <= availableWidth
        && Math.max(...heights) <= availableHeight;
      const columnFits = Math.max(...widths) <= availableWidth
        && heights.reduce((sum, height) => sum + height, 0) + (gap * (openPopups.length - 1)) <= availableHeight;

      if(rowFits) wrap.classList.add('notice-popups--row');
      else if(columnFits) wrap.classList.add('notice-popups--column');
      else wrap.classList.add('notice-popups--scroll');
    };

    popups.forEach((popup, index) => {
      if(popup.dataset.bound) return;
      popup.dataset.bound = '1';

      const storageKey = popup.dataset.storageKey || `notice-popup-hide-until-${index}`;
      const now = Date.now();
      let hiddenUntil = 0;

      try {
        hiddenUntil = parseInt(localStorage.getItem(storageKey) || '0', 10);
      } catch (_) {}

      const open = () => {
        popup.classList.add('is-open');
        popup.setAttribute('aria-hidden', 'false');
        layoutPopups();
      };

      const close = () => {
        popup.classList.remove('is-open');
        popup.setAttribute('aria-hidden', 'true');
        layoutPopups();
      };

      popup.querySelectorAll('[data-notice-close]').forEach(el => {
        el.addEventListener('click', close);
      });

      const img = popup.querySelector('.notice-popup__body img');
      if(img){
        img.tabIndex = 0;
        img.setAttribute('role', 'button');
        img.setAttribute('aria-label', `${img.alt || '팝업 이미지'} 크게 보기`);
        img.addEventListener('click', () => openLightbox(img));
        img.addEventListener('keydown', e => {
          if(e.key === 'Enter' || e.key === ' '){
            e.preventDefault();
            openLightbox(img);
          }
        });
        if(img.complete){
          sizePopup(popup);
          layoutPopups();
        } else {
          img.addEventListener('load', () => {
            sizePopup(popup);
            layoutPopups();
          }, { once:true });
        }
      }

      const hideDayBtn = popup.querySelector('[data-notice-hide-day]');
      if(hideDayBtn){
        hideDayBtn.addEventListener('click', () => {
          try {
            localStorage.setItem(storageKey, String(Date.now() + 24 * 60 * 60 * 1000));
          } catch (_) {}
          close();
        });
      }

      if(!(hiddenUntil > now)) open();
    });

    if(!document.body.dataset.noticeResizeBound){
      document.body.dataset.noticeResizeBound = '1';
      window.addEventListener('resize', () => {
        document.querySelectorAll('.notice-popup').forEach(sizePopup);
        layoutPopups();
      });
    }

    if(!document.body.dataset.noticeEscBound){
      document.body.dataset.noticeEscBound = '1';
      document.addEventListener('keydown', e => {
        if(e.key === 'Escape'){
          closeLightbox();
          document.querySelectorAll('.notice-popup.is-open').forEach(popup => {
            popup.classList.remove('is-open');
            popup.setAttribute('aria-hidden', 'true');
          });
        }
      });
    }
  })();

});
