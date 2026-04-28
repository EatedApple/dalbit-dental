/* ============================================================
   달빛치과의원 — CMS 콘텐츠 로더
   ─────────────────────────────────────────────────────────────
   - 실제 편집 데이터는 content/*.json 에 저장됩니다.
   - Decap CMS 는 이 JSON 파일들을 수정합니다.
   - 렌더 스크립트는 window.loadSiteData() 를 통해 데이터를 읽습니다.
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

  let cachedData = null;
  let inflight = null;

  window.SITE_DATA = window.SITE_DATA || {
    intro: { duration: 3200 },
  };

  const fetchJson = async (path) => {
    const response = await fetch(path, { cache: 'no-store' });
    if(!response.ok){
      throw new Error(`${path} 로드 실패 (${response.status})`);
    }
    return response.json();
  };

  window.loadSiteData = async function loadSiteData(){
    if(cachedData) return cachedData;
    if(inflight) return inflight;

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

    try{
      return await inflight;
    } finally {
      inflight = null;
    }
  };
})();
