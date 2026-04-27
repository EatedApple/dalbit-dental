/* ============================================================
   달빛치과 — 서브페이지 공통 인터랙션
   (햄버거 메뉴 / 모달 / 바텀바 / 폼 검증)
   데이터 주입 전에 listener 를 등록해 site:rendered 이벤트를 받음.
   ============================================================ */

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

/* site:rendered 이후 — 모달/바텀바/폼 초기화 */
document.addEventListener('site:rendered', function(){

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

    const sizePopup = (popup) => {
      const img = popup.querySelector('.notice-popup__body img');
      if(!img) return;

      const naturalWidth = img.naturalWidth || img.width;
      const naturalHeight = img.naturalHeight || img.height;
      if(!naturalWidth || !naturalHeight) return;

      const isMobile = window.innerWidth <= 720;
      const viewportWidth = window.innerWidth - (isMobile ? 32 : 48);
      const viewportHeight = window.innerHeight - (isMobile ? 188 : 220);
      const ratio = naturalWidth / naturalHeight;
      const minWidth = isMobile ? 220 : 280;
      const maxWidth = isMobile ? 380 : 560;
      const fittedWidth = Math.min(viewportWidth, viewportHeight * ratio, maxWidth);
      const safeMinWidth = Math.min(minWidth, viewportWidth);
      const popupWidth = Math.max(safeMinWidth, fittedWidth);

      popup.style.setProperty('--notice-width', `${Math.round(popupWidth)}px`);
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
      };

      const close = () => {
        popup.classList.remove('is-open');
        popup.setAttribute('aria-hidden', 'true');
      };

      popup.querySelectorAll('[data-notice-close]').forEach(el => {
        el.addEventListener('click', close);
      });

      const img = popup.querySelector('.notice-popup__body img');
      if(img){
        if(img.complete) sizePopup(popup);
        else img.addEventListener('load', () => sizePopup(popup), { once:true });
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
      });
    }

    if(!document.body.dataset.noticeEscBound){
      document.body.dataset.noticeEscBound = '1';
      document.addEventListener('keydown', e => {
        if(e.key === 'Escape'){
          document.querySelectorAll('.notice-popup.is-open').forEach(popup => {
            popup.classList.remove('is-open');
            popup.setAttribute('aria-hidden', 'true');
          });
        }
      });
    }
  })();

});
