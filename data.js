/* ============================================================
   달빛치과의원 — CMS 콘텐츠 로더
   ─────────────────────────────────────────────────────────────
   - 평상시: content/*.json 파일들을 fetch 해서 SITE_DATA 구성
   - 프리뷰 모드 (?preview=admin): 부모창(=admin)이 postMessage로
     보내주는 데이터를 기다렸다가 SITE_DATA로 사용
   ============================================================ */
(function(){
  const PAGE_KEYS = [
    'about',
    'conservation',
    'equipment',
    'implant',
    'laminate',
    'ortho',
    'wisdom',
  ];

  const CONTENT_PATHS = {
    site: [
      'content/site/brand.json',
      'content/site/navigation.json',
      'content/site/contact.json',
      'content/site/popups.json',
    ],
    home: [
      'content/home/hero.json',
      'content/home/focus.json',
      'content/home/banners.json',
      'content/home/blog.json',
    ],
    pages: PAGE_KEYS.reduce((acc, key) => {
      acc[key] = `content/pages/${key}.json`;
      return acc;
    }, {}),
  };

  const isPreview = (() => {
    try { return new URLSearchParams(location.search).get('preview') === 'admin'; }
    catch (e) { return false; }
  })();

  let cachedData = null;
  let inflight = null;

  window.SITE_DATA = window.SITE_DATA || {
    intro: { duration: 3200 },
  };

  // ─── 평상시 fetch 경로 ───
  const fetchJson = async (path) => {
    const response = await fetch(path, { cache: 'no-store' });
    if(!response.ok){
      throw new Error(`${path} 로드 실패 (${response.status})`);
    }
    return response.json();
  };

  // 파일 모음 -> SITE_DATA 구조로 변환
  function buildSiteData(filesByPath) {
    const get = (p) => filesByPath[p] || {};
    const site = Object.assign({},
      get('content/site/brand.json'),
      get('content/site/navigation.json'),
      get('content/site/contact.json'),
      get('content/site/popups.json')
    );
    const home = Object.assign({},
      get('content/home/hero.json'),
      get('content/home/focus.json'),
      get('content/home/banners.json'),
      get('content/home/blog.json')
    );
    const pages = {};
    PAGE_KEYS.forEach((k) => {
      pages[k] = get('content/pages/' + k + '.json');
    });
    return Object.assign({}, site, home, { pages });
  }

  // ─── 프리뷰 모드: 부모로부터 데이터 받기 ───
  function loadFromParent() {
    return new Promise((resolve) => {
      let resolved = false;

      window.addEventListener('message', (event) => {
        if (!event.data || event.data.type !== 'cms-preview') return;
        const filesByPath = event.data.files || {};
        const data = buildSiteData(filesByPath);
        window.SITE_DATA = data;
        cachedData = data;

        // 스크롤 위치 복원 (렌더 완료 후)
        const targetY = event.data.scrollY;
        if (typeof targetY === 'number' && targetY > 0) {
          const restore = () => {
            try { window.scrollTo(0, targetY); } catch (e) {}
          };
          // 렌더 완료 이벤트가 오면 즉시, 안 오면 fallback timeout
          document.addEventListener('site:rendered', () => {
            // 렌더 직후 + 이미지 로드 등 지연 대비 약간 후 한 번 더
            restore();
            setTimeout(restore, 60);
            setTimeout(restore, 200);
          }, { once: true });
          setTimeout(restore, 800); // safety net
        }

        if (!resolved) {
          resolved = true;
          resolve(data);
        } else {
          if (typeof window.rerenderSite === 'function') {
            try { window.rerenderSite(data); } catch (e) { console.error(e); }
          }
        }
      });

      // admin에게 "준비됐어, 데이터 보내줘" 신호
      try { window.parent.postMessage({ type: 'cms-preview-ready' }, '*'); } catch (e) {}
    });
  }

  window.loadSiteData = async function loadSiteData(){
    if(cachedData) return cachedData;
    if(inflight) return inflight;

    if (isPreview) {
      inflight = loadFromParent();
    } else {
      inflight = (async () => {
        const [siteSections, homeSections, pageEntries] = await Promise.all([
          Promise.all(CONTENT_PATHS.site.map(fetchJson)),
          Promise.all(CONTENT_PATHS.home.map(fetchJson)),
          Promise.all(
            PAGE_KEYS.map(async (key) => [key, await fetchJson(CONTENT_PATHS.pages[key])])
          ),
        ]);

        const site = Object.assign({}, ...siteSections);
        const home = Object.assign({}, ...homeSections);

        cachedData = {
          ...site,
          ...home,
          pages: Object.fromEntries(pageEntries),
        };
        window.SITE_DATA = cachedData;
        return cachedData;
      })();
    }

    try{
      return await inflight;
    } finally {
      inflight = null;
    }
  };
})();
