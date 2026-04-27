/* ============================================================
   달빛치과의원 — 사이트 콘텐츠 데이터
   ─────────────────────────────────────────────────────────────
   이 파일에서 텍스트/이미지/메뉴/링크를 수정하면 사이트에 즉시 반영됩니다.
   HTML은 건드리지 않아도 됩니다.

   ✏️  수정 가능한 항목
   - brand        : 병원명, 로고, 전화번호, 주소
   - intro        : 인트로 splash 애니메이션 텍스트
   - hero         : 메인 비주얼 슬라이드 (배열 — 추가/삭제 가능)
   - nav          : 헤더 네비게이션 (상위 + 서브메뉴)
   - focus        : 진료과목 4개 카드
   - checklist    : 체크리스트 배너
   - point        : 자체 약속 배너
   - blog         : 건강정보 블로그 카드 4개
   - hours        : 진료시간 표
   - directions   : 오시는 길 안내
   - footer       : 카피라이트
   - pages        : 서브페이지(임플란트/투명교정/장비/보존/턱관절/라미네이트) 콘텐츠
   ============================================================ */

window.SITE_DATA = {

  /* ---------------- 브랜드 / 연락처 ---------------- */
  brand: {
    logo:        "logo.png",
    name:        "달빛치과의원",
    headerName:  "달빛치과",
    nameEn:      "DALBIT DENTAL CLINIC",
    phone:       "054-705-0101",
    phoneText:   "054.705.0101",
    addrTagline: "포항시청 앞 · 포항시 남구 대이로 39 2층",
    pageTitle:   "달빛치과의원 | 임플란트 · 투명교정 · 심미치료 · 일반치료",
  },

  /* ---------------- 인트로 splash ---------------- */
  intro: {
    line1:    ["밤","에","도","","반","짝","이","는"],
    line1Accent: [true,true,true,false,false,false,false,false],
    line2:    ["당","신","의","","미","소"],
    line2Accent: [false,false,false,false,true,true],
    tagHTML:  "달빛처럼 은은한 진료, <b>달빛치과의원</b>",
    duration: 3200,
  },

  /* ---------------- 헤더 네비게이션 (다중 페이지) ---------------- */
  nav: [
    { label:"병원소개", href:"about.html", sub:[
      { label:"달빛치과 소개",         href:"about.html" },
      { label:"의료진 소개",           href:"about.html#doctors" },
      { label:"병원 둘러보기",         href:"about.html#gallery" },
      { label:"첨단 진료장비",         href:"equipment.html" },
      { label:"진료시간 / 오시는 길",   href:"about.html#info" },
    ]},
    { label:"임플란트", href:"implant.html", sub:[
      { label:"네비게이션 임플란트", href:"implant.html#points" },
      { label:"비교 안내",         href:"implant.html#compare" },
      { label:"진행 과정",         href:"implant.html#timeline" },
      { label:"추천 대상",         href:"implant.html#target" },
      { label:"임플란트 영상",     href:"implant.html#video" },
    ]},
    { label:"투명교정", href:"ortho.html", sub:[
      { label:"투명교정 안내",     href:"ortho.html" },
      { label:"교정 진행 과정",    href:"ortho.html#timeline" },
      { label:"유지장치 관리",     href:"ortho.html#maintenance" },
    ]},
    { label:"심미치료", href:"laminate.html", sub:[
      { label:"라미네이트",        href:"laminate.html" },
    ]},
    { label:"일반치료", href:"conservation.html", sub:[
      { label:"보존 · 치주치료",   href:"conservation.html" },
      { label:"턱관절 치료",       href:"wisdom.html" },
      { label:"사랑니 발치",       href:"wisdom.html#wisdom" },
    ]},
  ],

  /* ---------------- 우측 퀵메뉴 ---------------- */
  quick: [
    { label:"전화상담", href:"tel:054-705-0101", primary:true, icon:"phone" },
    { label:"네이버톡톡", href:"#", icon:"chat" },
  ],

  /* ---------------- 메인 비주얼 슬라이드 ---------------- */
  hero: [
    {
      type: "moon",
      h3:   "달빛처럼 은은하게,",
      h2:   "당신의 미소를<br>밝히다 <em>·</em>",
      list: [
        "15년 이상 임상경력 대표원장 직접 진료",
        "편안한 야간진료 · 충분한 상담",
      ],
      desc: "밤에도 환하게 빛나는 달빛처럼,<br>당신의 미소가 오래도록 반짝이도록 정성껏 진료합니다.",
    },
    {
      type: "photo",
      bgImage: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1600&q=80",
      h3:   "치료의 시작은<br><em>편안한 마음</em>입니다",
      paragraphs: [
        "처음 오시는 분들도 부담 없이 찾아주실 수 있도록<br>충분한 상담과 자세한 설명을 약속드립니다.",
        "달빛치과는 환자분의 두려움을 덜고,<br>가장 보수적이고 안전한 치료를 우선합니다.",
        "오랜 시간 함께할 수 있는<br>주치의가 되어드리겠습니다.",
      ],
      sign: "— 달빛치과의원 대표원장",
    },
  ],

  /* ---------------- 진료과목 4개 카드 ---------------- */
  focusTitle: { small:"OUR TREATMENTS", h2Html:"달빛치과의 <b>진료과목</b>" },
  focus: [
    {
      href:  "implant.html",
      img:   "imgs/implant_step4.jpg",
      small: "안전하고 정확하게",
      title: "임플란트",
      desc:  "원가이드 임플란트, 뼈이식·상악동 임플란트, 임플란트 틀니까지 — 잇몸뼈 상태에 맞춘 맞춤 식립",
    },
    {
      href:  "ortho.html",
      img:   "imgs/ortho_step4.jpg",
      small: "티 안 나는 교정",
      title: "투명교정",
      desc:  "철사 없이 투명한 장치로 진행하는 교정 — 일상 생활과 미소를 그대로 유지하면서 치아 배열을 바로잡습니다",
    },
    {
      href:  "laminate.html",
      img:   "imgs/self-whitening-beautis-home.jpg",
      small: "자연스러운 아름다움",
      title: "심미치료",
      desc:  "라미네이트와 자가미백으로 본래의 치아를 살리면서 자연스럽고 환한 미소를 디자인합니다",
    },
    {
      href:  "conservation.html",
      img:   "imgs/root-canal-info.png",
      small: "기본부터 꼼꼼하게",
      title: "일반치료",
      desc:  "보존치료, 치주치료, 턱관절 치료, 사랑니 발치까지 — 평생 건강한 치아를 위한 기본 진료",
    },
  ],

  /* ---------------- 체크리스트 배너 ---------------- */
  checklist: {
    bgImage:  "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1800&q=80",
    titleHTML:"치과,<br><span class='pen'>잘 선택하고 계신가요?</span>",
    items: [
      "대표원장이 처음부터 끝까지 직접 진료하는가?",
      "충분한 상담과 자세한 설명을 제공하는가?",
      "최신 디지털 장비로 정밀하게 진단하는가?",
      "1인 진료실로 안전한 진료환경을 갖췄는가?",
    ],
    closingHTML:"이 모든 조건을 갖춘 곳, 달빛치과의원<br>치료는 <span class='pen'>제대로 준비된 치과</span>에서 시작해야 합니다",
  },

  /* ---------------- 약속 배너 ---------------- */
  point: {
    bgImage:   "https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&w=1800&q=80",
    titleHTML: "<span>꼭 필요한 진료만</span>, 정직하게<br>가장 보수적인 <span>안전한 치료</span>를 약속합니다",
    descHTML:  "과한 진료를 권하지 않습니다.<br>가능한 한 자연치아를 살리고, 꼭 필요한 시기에 꼭 필요한 만큼만 치료합니다.",
    closingHTML:"환자 한분 한분 중심의 맞춤진료로<br>작은 차이까지 고려한 세심한 진료를 제공합니다",
  },

  /* ---------------- 블로그 카드 ---------------- */
  blogTitle: { small:"HEALTHY TIPS", h2Html:"치아 <b>건강정보</b>" },
  blog: [
    { tag:"IMPLANT", title:"임플란트 수술 전 꼭 알아두어야 할 5가지",
      img:"https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=700&q=80", href:"implant.html" },
    { tag:"ORTHO",   title:"투명교정, 어떤 사람에게 잘 맞을까요?",
      img:"https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=700&q=80", href:"ortho.html" },
    { tag:"BEAUTY",  title:"라미네이트 최소 삭제 0.3mm의 미학",
      img:"https://images.unsplash.com/photo-1571772996211-2f02c9727629?auto=format&fit=crop&w=700&q=80", href:"laminate.html" },
    { tag:"CARE",    title:"충치는 스스로 회복되지 않습니다",
      img:"imgs/caries-stages-4.png", href:"conservation.html" },
  ],

  /* ---------------- 진료시간 ---------------- */
  hours: [
    { day:"평 일",    time:"오전 10:00 ~ 오후 7:00<span class=\"hours-break\">휴식 오후 1:30 ~ 2:30</span>" },
    { day:"토요일",   time:"오전 10:00 ~ 오후 4:00<span class=\"hours-break\">휴식 오후 1:30 ~ 2:00</span>" },
  ],
  hoursClosed: "※ 일요일, 공휴일은 휴진입니다",

  /* ---------------- 오시는 길 ---------------- */
  directions: {
    address: "포항시청 앞 · 포항시 남구 대이로 39 2층",
    mapImage: "imgs/directions-info.png",
    bus: { label:"정류소 · 버스 안내", desc:"정류소명: 시청 / 버스 111, 216, 306, 700" },
    car: { label:"오시는 길 · 주차 안내", desc:"imgs/directions-info-car.png", isImage:true, popupOnly:true },
  },

  /* ---------------- 푸터 ---------------- */
  footer: {
    addrLine1: "달빛치과의원 · 대표자 김은주 · 사업자등록번호 5752602201",
    addrLine2: "포항시청 앞 · 포항시 남구 대이로 39 2층 · TEL 054.705.0101",
    copyright: "COPYRIGHT © 2026 달빛치과의원 ALL RIGHTS RESERVED.",
  },

  /* ---------------- 빠른 상담 모달 ---------------- */
  counselModal: {
    title:    "빠른 상담",
    intro:    "아래 연락처와 문의내용을 남겨주시면 상담원이 전화로 친절하게 상담을 도와드립니다.",
    privacyLink: "#privacy",
  },

  noticePopups: [
    {
      title: "진료 안내",
      image: "imgs/hours-info.png",
      storageKey: "dalbit-notice-hours-hide-until",
    },
    {
      title: "오시는 길 · 주차 안내",
      image: "imgs/directions-info-car.png",
      storageKey: "dalbit-notice-directions-hide-until",
    },
  ],

  /* ==========================================================
     서브페이지 콘텐츠
     ========================================================== */
  pages: {

    /* ──────── 병원소개 ──────── */
    about: {
      pageTitle: "병원소개 | 달빛치과의원",
      hero: {
        crumb:    "ABOUT · 병원소개",
        title:    "달빛처럼 은은한,<br><em>정성스러운 진료</em>",
        subtitle: "밤에도 환하게 빛나는 달빛처럼, 오래도록 반짝이는 미소를 위해 — 달빛치과의원",
        bg:       "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=2000&q=80",
      },
      intro: {
        note:  "Welcome to Dalbit",
        titleHTML: "오랜 시간 함께할 수 있는<br><span>당신의 주치의</span>가 되어드립니다",
        descHTML:  "처음 오시는 분들도 부담 없이 찾아주실 수 있도록 충분한 상담과 자세한 설명을 약속드립니다. 달빛치과는 환자분의 두려움을 덜고, <strong>가장 보수적이고 안전한 치료</strong>를 우선합니다. 한 번의 진료가 아닌, 평생의 구강 건강을 함께 지켜가는 든든한 동반자가 되겠습니다.",
      },
      promises: {
        small:  "OUR PROMISES",
        h2Html: "달빛치과의 <b>여섯 가지 약속</b>",
        lead:   "겉은 빛나되 속은 깊은 진료 — 달빛치과가 지켜온 원칙입니다.",
        cols:   3,
        items: [
          { emoji:"🌙", title:"정직한 진단",
            desc:"과한 진료를 권하지 않습니다. 3D CT · 디지털 스캐너로 꼭 필요한 부위만 정확히 찾아 치료합니다." },
          { emoji:"🦷", title:"자연치아 우선",
            desc:"가능한 한 환자분의 자연치아를 살립니다. 발치·신경치료는 반드시 필요한 경우에만 신중하게 진행합니다." },
          { emoji:"👩‍⚕️", title:"대표원장 직접 진료",
            desc:"처음 진단부터 마지막 사후 관리까지 — 통합치과의학 전문의 대표원장이 직접 책임지고 진료합니다." },
          { emoji:"💬", title:"충분한 상담",
            desc:"10분 진료가 아닙니다. 환자분의 이야기를 듣고 가능한 모든 선택지를 설명드립니다. 조급하게 결정하지 않습니다." },
          { emoji:"🛡️", title:"철저한 위생",
            desc:"감염 관리 기준을 철저히 준수하며, 모든 진료 공간과 기구를 꼼꼼하게 소독해 안전한 진료 환경을 유지합니다." },
          { emoji:"🌟", title:"평생 사후 관리",
            desc:"치료가 끝이 아닌 시작입니다. 정기 검진과 잇몸관리프로그램으로 평생 건강한 치아를 유지하도록 돕습니다." },
        ],
      },
      doctors: {
        id: "doctors",
        small:  "OUR DOCTORS",
        h2Html: "달빛치과 <b>의료진 소개</b>",
        lead:   "풍부한 임상 경험과 따뜻한 진심으로, 환자 한 분 한 분을 소중히 대합니다.",
        items: [
          {
            initial: "김",
            badge:   "통합치과의학 전문의",
            name:    "김은주",
            nameEn:  "Kim Eun Ju",
            role:    "Director",
            roleKo:  "대표원장",
            history: [
              "통합치과의학 전문의 (보건복지부 인증)",
              "경북대학교 치의학과 석사",
              "경북대학교 치의학전문대학원 치의학과 졸업",
              "경북대학교 병원장상 수상",
              "포항공과대학교 생명과학과 석사",
              "포항미르치과병원 특수임플란트과정 수료",
              "포항미르치과병원 임상전문의과정 수료",
              "(전) 포항미르치과병원 원장",
              "대한통합치과학회 정회원",
              "대한구강악안면임플란트학회 정회원",
              "대한치과보철학회 정회원",
              "대한치과마취과학회 정회원",
              "아시아 턱관절포럼(Asian TMJ forum) 연수회 수료",
            ],
          },
          {
            initial: "이",
            badge:   "통합치과의학 전문의",
            name:    "이혜경",
            nameEn:  "Lee Hye Kyung",
            role:    "Director",
            roleKo:  "대표원장",
            history: [
              "통합치과의학 전문의 (보건복지부 인증)",
              "연세대학교 생명공학과 졸업",
              "경북대학교 치의학전문대학원 졸업",
              "치의학전문대학원장상 수상 (차석 졸업)",
              "경북대학교 치과병원 인턴 수료",
              "(전) 권치과 원장",
              "(전) 엠치과 원장",
              "대한통합치과학회 정회원",
              "대한치주과학회 정회원",
              "대한치과보존학회 정회원",
              "Damon system orthodontic master course 수료",
              "Master course surgery of Osstem Implant 수료",
              "MagicalAlign · oneGuide · Digital master course (Osstem) 수료",
            ],
          },
        ],
      },
      gallery: {
        id: "gallery",
        small:  "OUR CLINIC",
        h2Html: "달빛치과 <b>둘러보기</b>",
        lead:   "편안한 대기 공간부터 정성스레 준비한 진료실까지 — 환자분이 머무는 모든 공간을 세심하게 준비했습니다.",
        items: [
          { img:"imgs/gallery_slider1.png", text:"접수 · 대기 공간" },
          { img:"imgs/gallery_slider3.png", text:"상담실" },
          { img:"imgs/gallery_slider4.png", text:"진료실" },
          { img:"imgs/gallery_slider5.png", text:"파노라마 진료실" },
          { img:"imgs/gallery_slider2.png", text:"대기 공간", span:"wide" },
          { img:"imgs/gallery_slider4.png", text:"진료실", span:"big" },
          { img:"imgs/gallery_slider5.png", text:"파노라마 진료실", span:"wide" },
        ],
      },
      cta: {
        titleHTML:"<span>치과가 두렵다면</span>, 달빛치과부터 들러보세요.",
        desc:     "충분한 상담으로 치료 방향을 먼저 알려드립니다. 처음 내원이 가장 어려운 법 — 부담 없이 방문해 주세요.",
      },
    },

    /* ──────── 임플란트 ──────── */
    implant: {
      pageTitle: "원가이드 임플란트 | 달빛치과의원",
      hero: {
        crumb:    "IMPLANT · 임플란트",
        title:    "원가이드 <em>네비게이션</em><br>임플란트",
        subtitle: "오스템 OneGuide 시스템으로 더 빠르고 정확하게, 안전하게",
        bg:       "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=2000&q=80",
      },
      intro: {
        note:  "Safer · Faster · More Accurate",
        titleHTML: "3D 컴퓨터 모의 수술로 결정하는<br><span>오차 없는 한 번의 식립</span>",
        descHTML:  "잇몸 뼈의 상태, 신경의 위치, 식립 각도를 미리 파악하여 <strong>0.1mm 단위로</strong> 설계합니다. 수술 당일의 부담과 회복 기간을 크게 줄이는 디지털 임플란트 시스템입니다.",
      },
      points: {
        small: "THREE KEY POINTS",
        h2Html: "달빛치과가 권하는 <b>네비게이션 임플란트</b>",
        cols: 3,
        items: [
          { num:"01", title:"오차 없는 정확도",     desc:"3D 컴퓨터 모의 수술로 신경 위치와 골조직을 미리 파악하여 식립 각도와 깊이를 0.1mm 단위로 결정합니다." },
          { num:"02", title:"부작용 · 통증 최소화", desc:"잇몸을 크게 절개하지 않는 '최소 절개' 방식으로 출혈과 붓기가 거의 없으며, 감염 위험을 획기적으로 낮췄습니다." },
          { num:"03", title:"빠른 회복 · 짧은 수술", desc:"미리 제작된 수술용 가이드를 사용해 시술 시간이 매우 짧으며, 수술 당일 즉시 일상생활 복귀가 가능합니다." },
        ],
      },
      compare: {
        small: "COMPARISON",
        h2Html: "기존 임플란트 vs <b>네비게이션 임플란트</b>",
        head:  ["구분", "기존 임플란트", "네비게이션 임플란트"],
        rows: [
          { label:"수술 방식", a:"잇몸 절개 (통증/붓기 동반)", b:"최소 절개 · 작은 홈으로 식립" },
          { label:"정확도",    a:"육안 및 경험 의존",          b:"3D 시뮬레이션 · 0.1mm 오차 조절" },
          { label:"회복 속도", a:"느림 (일상 복귀 지연)",     b:"매우 빠름 · 시술 당일 일상 복귀" },
          { label:"수술 시간", a:"1개당 30~60분 소요",        b:"약 15분 내외 · 체력 소모 최소화" },
        ],
      },
      timeline: {
        small:  "PROCESS",
        h2Html: "원가이드 <b>임플란트 진행 과정</b>",
        items: [
          { step:"STEP 01", title:"3D 정밀 분석 · 진단", img:"imgs/implant_step1.png",
            descHTML:"3D CT와 구강 스캐너를 이용해 환자분의 구강 상태를 <strong>입체적으로 재현</strong>합니다.",
            details:["신경관 위치 및 잇몸 뼈 상태 파악", "디지털 구강 스캔 데이터 수집"] },
          { step:"STEP 02", title:"컴퓨터 모의 수술",   img:"imgs/implant_step2.jpg",
            descHTML:"수집된 데이터를 전용 소프트웨어에 입력하여 <strong>가장 안전한 식립 위치</strong>를 시뮬레이션합니다.",
            details:["최적의 식립 각도 및 깊이 결정", "가장 튼튼한 골조직 위치 선별"] },
          { step:"STEP 03", title:"맞춤형 가이드 장치 제작", img:"imgs/implant_step3.jpg",
            descHTML:"시뮬레이션 결과 그대로 식립할 수 있도록 <strong>오스템 OneGuide</strong> 수술 보조 장치를 제작합니다.",
            details:["환자별 1:1 맞춤형 가이드", "오차 없는 시술을 위한 핵심 장치"] },
          { step:"STEP 04", title:"최소 절개 정밀 식립", img:"imgs/implant_step4.jpg",
            descHTML:"가이드를 입안에 고정하고 <strong>계획된 위치에 빠르게</strong> 식립합니다.",
            details:["수술 당일 임시 치아 장착 가능", "최소 절개로 빠른 일상 복귀"] },
        ],
      },
      target: {
        small:  "RECOMMENDED FOR",
        h2Html: "이런 분께 <b>꼭 필요합니다</b>",
        cols: 4,
        items: [
          { emoji:"👴", title:"고령의 어르신",    desc:"긴 수술 시간이 부담스럽고 빠른 회복이 필요한 부모님" },
          { emoji:"🩸", title:"전신질환 환자",    desc:"당뇨, 고혈압 등으로 출혈과 감염이 걱정되시는 분" },
          { emoji:"😰", title:"치과 공포증",      desc:"수술의 통증과 붓기가 두려워 치료를 미뤄오신 분" },
          { emoji:"💼", title:"바쁜 현대인",      desc:"잦은 내원이 힘들고 빠른 시술 결과가 필요한 직장인" },
        ],
      },
      video: {
        small:  "VIDEO",
        h2Html: "원가이드 <b>임플란트 영상</b>",
        youtube: "https://www.youtube.com/embed/MmkYHUc4ifQ",
      },
      cta: {
        titleHTML:"임플란트, <span>상담부터</span> 시작하세요.",
        desc:     "환자분의 잇몸뼈 상태와 건강 상태를 먼저 정확히 진단합니다. 정직하고 꼼꼼한 상담으로 최적의 치료 계획을 제안해 드립니다.",
      },
    },

    /* ──────── 투명교정 ──────── */
    ortho: {
      pageTitle: "투명교정 | 달빛치과의원",
      hero: {
        crumb:    "ORTHO · 투명교정",
        title:    "<em>티 나지 않는</em> 편안함,<br>맞춤 투명교정",
        subtitle: "디지털 기반의 정밀한 맞춤 투명교정 솔루션",
        bg:       "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=2000&q=80",
      },
      intro: {
        note:  "Digital · Clear · Predictable",
        titleHTML: "디지털로 완성하는<br><span>투명교정</span> 프로세스",
        descHTML:  "정밀한 디지털 스캔과 맞춤 장치 설계를 통해 더 편안하고 정확하게 치아 배열을 바로잡습니다.",
      },
      features: {
        small:  "FEATURES",
        h2Html: "투명교정의 <b>3가지 강점</b>",
        cols: 3,
        items: [
          { num:"01", title:"3-Layer 복합소재",
            desc:"일반 단층 소재와 달리 3층 구조의 '매직 포일'을 사용하여 초기 통증은 줄이고 교정 유지력은 15% 이상 높였습니다." },
          { num:"02", title:"매직 셋업 시스템",
            desc:"장치를 한 번에 다 만드는 것이 아니라, 12주 간격으로 치아 이동량을 재평가하여 장치를 분할 제작하므로 예측도가 매우 높습니다." },
          { num:"03", title:"정교한 어태치먼트",
            desc:"치아와 유사한 색상의 작은 돌기(손잡이)를 부착하여, 투명교정만으로는 어려웠던 복잡한 치아 이동도 가능하게 합니다." },
        ],
      },
      video: {
        small:  "VIDEO",
        h2Html: "투명교정 <b>소개 영상</b>",
        local: "./magic_align.mp4",
        caption: "투명교정 안내 영상",
      },
      timeline: {
        small:  "PROCESS",
        h2Html: "투명교정 <b>4단계 진행 과정</b>",
        items: [
          { step:"STEP 01", title:"3D 디지털 구강 스캔", img:"imgs/ortho_step1.jpg",
            descHTML:"차가운 고무 인상재 대신 <strong>Trios 5 광학 스캐너</strong>로 초정밀 디지털 데이터를 채득합니다.",
            details:["입을 크게 벌리는 불편함 없이 빠른 스캔", "구역반사 걱정 없는 편안한 채득 과정", "즉각적인 치아 배열 상태 확인"] },
          { step:"STEP 02", title:"매직플랜 3D 시뮬레이션", img:"imgs/ortho_step2.jpg",
            descHTML:"전용 소프트웨어로 <strong>치아 이동 경로를 3D로 예측</strong>하고 교정 후 모습을 미리 봅니다.",
            details:["단계별 치아 이동 경로 미리보기", "교정 후 안모 변화 · 미소 라인 예측", "1:1 맞춤형 정밀 치료 계획 수립"] },
          { step:"STEP 03", title:"맞춤 장치 제작 · 착용", img:"imgs/ortho_step3.jpg",
            descHTML:"설계 데이터 기반의 <strong>투명 교정 장치</strong>를 수령하고 1~2주 간격으로 교체합니다.",
            details:["하루 20~22시간 이상 규칙적 착용", "식사 · 양치 시 자유로운 탈부착", "이물감이 적고 부드러운 착용감"] },
          { step:"STEP 04", title:"주기적 분석 · 모니터링", img:"imgs/ortho_step4.jpg",
            descHTML:"투명교정 <strong>정기 모니터링 시스템</strong>으로 실제 이동량을 체크하고 필요시 보완 제작합니다.",
            details:["6~8주 간격 정기 내원 점검", "치아 이동 상태 실시간 분석 · 반영", "오차 없는 마무리 진료"] },
        ],
      },
      compare: {
        small:  "COMPARISON",
        h2Html: "전통 교정 vs <b>투명교정</b>",
        head:  ["구분", "전통 교정", "투명교정"],
        rows: [
          { label:"장치 노출",      a:"금속 장치와 철사가 노출됨",      b:"거의 투명하여 눈에 띄지 않음" },
          { label:"통증 · 이물감",  a:"철사가 입안을 찔러 통증 발생",   b:"부드러운 소재로 이물감 최소화" },
          { label:"음식 섭취",      a:"딱딱하거나 끈적이는 음식 제한",  b:"장치 탈착 후 자유로운 식사" },
          { label:"위생 관리",      a:"음식물이 잘 끼고 양치가 어려움", b:"장치 제거 후 평소처럼 양치 · 치실" },
          { label:"내원 주기",      a:"4주 간격 (철사 조절 필수)",      b:"6~8주 간격 (바쁜 분께 유리)" },
        ],
      },
      maintenance: {
        small:  "AFTER CARE",
        h2Html: "아름다운 미소를 지키는 <b>이중 안심 시스템</b>",
        lead:   "교정 치료만큼 중요한 사후 관리, 달빛치과가 끝까지 함께합니다.",
        cols: 2,
        items: [
          { num:"01", title:"고정식 유지장치", desc:"치아 안쪽에 얇은 와이어를 부착하여 24시간 안정적으로 치열을 고정합니다." },
          { num:"02", title:"가철식 유지장치", desc:"취침 시 착용하며 전체적인 치아궁 형태를 유지해 재교정을 방지합니다." },
        ],
      },
      cta: {
        titleHTML:"투명교정, <span>나에게 맞을까요?</span>",
        desc:     "교정은 진단이 가장 중요합니다. 디지털 정밀 분석으로 치료 가능 여부와 기간을 미리 확인하세요.",
      },
    },

    /* ──────── 첨단 진료장비 ──────── */
    equipment: {
      pageTitle: "첨단 디지털 장비 | 달빛치과의원",
      showTitle: false,
      hero: {
        crumb:    "EQUIPMENT · 진료장비",
        title:    "첨단 <em>디지털</em> 장비",
        subtitle: "달빛치과가 투자한 검증된 글로벌 의료 장비 시스템",
        bg:       "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=2000&q=80",
      },
      intro: null,
      cards: [
        {
          tag: "Trios 5 구강 스캐너",
          titleHTML: "고무 인상재 없이<br>빠르고 편안한 3D 스캔",
          desc: "입안을 꽉 채우던 차가운 고무 인상재 대신, 소형 스캐너가 부드럽게 지나가며 3D로 치아를 촬영합니다. 구역 반사나 이물감 없이 빠르고 정밀한 진단이 가능합니다.",
          images: [
            "imgs/equipment_trios1.png",
            "imgs/equipment_trios2.png",
            "imgs/equipment_trios3.png",
          ],
          points: [
            "고무 인상재 NO! 이물감 없는 편안함",
            "1분 만에 끝나는 초고속 3D 디지털 스캔",
            "눈에 안 보이는 미세한 오차까지 완벽 보정",
          ],
        },
        {
          tag: "Eco-X 3D CT",
          titleHTML: "보이지 않는 곳까지<br>확실하게 진단합니다",
          desc: "성공적인 임플란트와 발치를 위해서는 신경관의 위치 파악이 필수입니다. 2D 엑스레이의 한계를 넘어, 육안으로 확인하기 힘든 치조골의 상태를 3D 입체 영상으로 분석합니다.",
          images: [
            "imgs/equipment_eco.png",
            "imgs/equipment_eco2.png",
          ],
          points: [
            "방사선 노출량을 획기적으로 줄인 저선량 기술",
            "숨어있는 신경관까지 3D 입체 정밀 분석",
            "0.1mm의 오차도 허용하지 않는 수술 계획",
          ],
        },
        {
          tag: "K5 유니트 체어",
          titleHTML: "장시간 진료에도<br>몸이 편안한 체어",
          desc: "환자분이 가장 오래 머무는 공간인 만큼 편안함을 먼저 생각했습니다. 인체공학 시트가 적용된 프리미엄 체어로 진료 내내 몸의 부담을 줄여드립니다.",
          images: [
            "imgs/equipment_k5_1.png",
          ],
          points: [
            "인체공학적 설계로 허리가 편안한 프리미엄 시트",
            "진료 중 흔들림을 줄여 안정적인 포지션 유지",
            "장시간의 진료와 수술도 휴식처럼 편안하게",
          ],
        },
        {
          tag: "Luvis 무영등",
          titleHTML: "정확한 시야를 만드는<br>밝고 편안한 조명",
          desc: "술자의 시야를 또렷하게 확보해 섬세한 치료를 돕는 무영등입니다. 눈부심은 줄이고, 필요한 부위는 선명하게 비춰 보다 안정적인 진료 환경을 만듭니다.",
          images: [
            "imgs/equipment_luvis_1.jpg",
            "imgs/equipment_luvis_2.jpg",
          ],
          points: [
            "진료 부위를 균일하게 비춰 그림자 최소화",
            "환자 눈부심을 줄인 편안한 광량 설계",
            "정밀 진료에 필요한 시야 확보에 도움",
          ],
        },
      ],
      cta: {
        titleHTML:"달빛치과의 <span>장비가 궁금하시다면</span>",
        desc:     "실제 진료실을 방문해 직접 확인하실 수 있습니다. 편안한 시간에 예약 방문해 주세요.",
      },
    },

    /* ──────── 보존 · 보철 ──────── */
    conservation: {
      pageTitle: "보존 · 보철치료 | 달빛치과의원",
      hero: {
        crumb:    "CONSERVATION · 충치 · 보존",
        title:    "보존 · <em>보철</em> 치료",
        subtitle: "보건복지부 인증 전문의가 내 치아를 소중하게 지킵니다",
        bg:       "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=2000&q=80",
      },
      intro: {
        note:  "Save Your Natural Tooth",
        titleHTML: "방치하면 <span>'호미'</span>로 막을 것<br><span>'가래'</span>로 막습니다",
        descHTML:  "초기 충치는 통증이 없어 방치하기 쉽지만, 시간이 흐를수록 치아 뿌리와 신경까지 파고듭니다. 달빛치과는 보건복지부 인증 전문의가 정밀 진단하여 <strong>과잉 진료 없이 꼭 필요한 부위만</strong> 정직하게 치료합니다.",
      },
      stages: {
        small:  "CARIES PROGRESS",
        h2Html: "충치 진행 <b>4단계</b>",
        lead:   "충치는 스스로 회복되지 않습니다. 초기에 발견할수록 치아를 살리기 쉽습니다.",
        image: "imgs/caries-stages-4.png",
        items: [
          { head:"STAGE 01", title:"초기 충치 · 법랑질",
            desc:"치아 겉면만 손상된 상태. 통증은 거의 없으나 미세한 검은 점이 보입니다." },
          { head:"STAGE 02", title:"중기 충치 · 상아질",
            desc:"안쪽 상아질까지 진행된 상태. 찬물이나 단 음식에 찌릿한 통증이 느껴집니다." },
          { head:"STAGE 03", title:"신경 염증 · 치수염",
            desc:"염증이 신경까지 침범한 상태. 밤잠을 설치게 하는 극심한 통증이 발생합니다." },
          { head:"STAGE 04", title:"뿌리 괴사",
            desc:"신경이 괴사되고 염증이 뿌리 끝까지 퍼진 상태. 발치 위험이 매우 높습니다." },
        ],
      },
      compare: {
        small:  "TREATMENT OPTIONS",
        h2Html: "레진 · 인레이 · <b>크라운 비교</b>",
        head:  ["구분", "레진 (Resin)", "인레이 (Inlay)", "크라운 (Crown)"],
        rows: [
          { label:"치료 범위", cols:["초기, 좁은 부위",       "중기, 넓은 부위",       "신경치료 후 전체 보호"] },
          { label:"주요 재료", cols:["복합 레진",             "골드(금) · 세라믹",     "골드(금) · 지르코니아"] },
          { label:"치료 특징", cols:["당일 직접 충전",         "맞춤 제작 후 부착",     "치아 전체를 씌움"] },
        ],
      },
      endo: {
        id: "endo",
        titleHTML: "내 치아를 살리는 <span>신경치료</span>",
        descHTML:  "심한 충치나 파손으로 감염된 신경을 제거하고 소독하여 <strong>치아를 뽑지 않고 더 오래</strong> 사용할 수 있게 만드는 치료입니다.",
        img: "imgs/root-canal-info.png",
        steps: [
          { step:"STEP 01", title:"신경 제거 · 소독", desc:"감염된 조직을 정밀하게 제거하고 내부를 깨끗이 소독합니다." },
          { step:"STEP 02", title:"신경관 충전",      desc:"비워진 공간을 치과용 특수 재료로 빈틈없이 밀폐합니다." },
          { step:"STEP 03", title:"보철 보호",        desc:"약해진 치아가 깨지지 않도록 크라운으로 단단하게 보호합니다." },
        ],
      },
      strengths: {
        small:  "WHY DALBIT",
        h2Html: "달빛치과 <b>보존치료의 강점</b>",
        cols: 4,
        items: [
          { emoji:"🩺", title:"정직한 진단",     desc:"3D CT 디지털 진단으로 과잉 진료 없이 꼭 필요한 부위만 치료합니다." },
          { emoji:"💉", title:"편안한 마취",     desc:"도포 마취와 섬세한 테크닉으로 마취 통증과 공포감을 덜어드립니다." },
          { emoji:"🔬", title:"미세 정밀 시술",  desc:"숙련된 전문의가 건강한 치질은 보존하고 감염 부위만 선택적으로 제거합니다." },
          { emoji:"✨", title:"철저한 사후 관리", desc:"치료가 끝난 후에도 정기 검진을 통해 치아 건강을 끝까지 관리합니다." },
        ],
      },
      cta: {
        titleHTML:"작은 불편함도 <span>방치하지 마세요.</span>",
        desc:     "조기 발견이 자연치아를 지키는 가장 확실한 방법입니다. 부담 없이 방문해 정확히 진단받으세요.",
      },
    },

    /* ──────── 턱관절 · 사랑니 ──────── */
    wisdom: {
      pageTitle: "턱관절 · 사랑니 | 달빛치과의원",
      hero: {
        crumb:    "TMJ & WISDOM · 턱관절 · 사랑니",
        title:    "턱관절 · <em>사랑니</em>",
        subtitle: "구강악안면외과적 원칙에 따른 정직하고 안전한 진료",
        bg:       "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=2000&q=80",
      },
      intro: {
        note:  "Don't Wait · Treat Early",
        titleHTML: "불편함을 참을수록<br><span>치료는 복잡해집니다</span>",
        descHTML:  "턱관절 질환은 일상생활의 질을 떨어뜨리고, 잘못 난 사랑니는 주변 어금니까지 망가뜨릴 수 있습니다. 달빛치과는 <strong>풍부한 임상 경험</strong>을 바탕으로 가장 대중적이고 검증된 방법으로 해결합니다.",
      },
      tmj: {
        small:  "TMJ TREATMENT",
        h2Html: "턱관절 질환 <b>단계별 치료</b>",
        lead:   "증상의 경중에 따라 가장 적합한 보존적 치료부터 단계별로 시행합니다.",
        cols: 3,
        items: [
          { num:"01", title:"자가 관리 · 약물치료", desc:"긴장 완화 교육과 함께 염증과 통증을 줄여주는 약물을 처방하여 초기 증상을 완화합니다." },
          { num:"02", title:"물리치료 (건강보험)",  desc:"저출력 레이저, 적외선, 전기 자극 치료 등을 통해 근육을 이완시키고 혈류를 개선합니다." },
          { num:"03", title:"장치 치료 (스플린트)", desc:"턱관절에 가해지는 압력을 분산시키고 이갈이 등 좋지 않은 습관을 교정합니다." },
        ],
      },
      wisdom: {
        id: "wisdom",
        small:  "WISDOM TOOTH",
        h2Html: "사랑니 <b>발치가 필요한 이유</b>",
        lead:   "정상적인 저작 기능을 하지 못하는 사랑니는 예방적 차원에서 발치하는 것이 좋습니다.",
        cols: 3,
        items: [
          { num:"01", title:"청결 관리의 어려움",  desc:"입안 깊숙이 위치해 칫솔질이 잘 닿지 않아 충치와 구취의 원인이 됩니다." },
          { num:"02", title:"인접 어금니 손상",    desc:"사랑니가 앞 치아를 밀어 치열을 어긋나게 하거나 어금니 뿌리를 흡수시킬 수 있습니다." },
          { num:"03", title:"잇몸 염증 · 낭종",    desc:"잇몸 속에 매복된 경우 주변에 염증을 일으키거나 물혹(낭종)을 형성할 수 있습니다." },
        ],
      },
      wisdomTypes: {
        small:  "WISDOM TYPES",
        h2Html: "사랑니 <b>유형별 난이도</b>",
        lead:   "방향과 매복 정도에 따라 발치 난이도가 달라집니다. 정밀 진단 후 방법을 결정합니다.",
        image: "imgs/wisdom-types-info.png",
        items: [
          { title:"단순 발치", img:"imgs/wisdom1.jpg", desc:"똑바로 자라나 잇몸 절개 없이 발치 가능" },
          { title:"경사 매복", img:"imgs/wisdom2.jpg", desc:"비스듬히 누워 어금니를 압박하는 상태" },
          { title:"수평 매복", img:"imgs/wisdom3.jpg", desc:"잇몸 속에 완전히 누워 신경관과 인접한 상태" },
          { title:"완전 매복", img:"imgs/wisdom4.jpg", desc:"뼈 속에 깊이 묻혀 고난도 수술이 필요한 상태" },
        ],
      },
      precautions: {
        small:  "AFTER CARE",
        h2Html: "발치 후 <b>주의사항</b>",
        lead:   "안전한 회복을 위해 아래 주의사항을 꼭 지켜주세요.",
        items: [
          "발치 후 거즈는 2시간 동안 꽉 물고 계셔야 하며, 침이나 피는 삼키셔야 합니다.",
          "수술 당일 자극적인 음식과 뜨거운 음식은 피하고 부드러운 유동식을 권장합니다.",
          "빨대 사용이나 침 뱉기는 입안 압력을 높여 지혈을 방해하므로 금지합니다.",
          "음주와 흡연은 상처 회복을 더디게 하고 염증을 유발하므로 최소 1주일간 피해야 합니다.",
          "처방받은 약은 통증이 없더라도 지시된 기간 동안 모두 복용하시는 것이 좋습니다.",
        ],
      },
      cta: {
        titleHTML:"턱관절 소리 · 사랑니 통증, <span>미루지 마세요.</span>",
        desc:     "조기 치료가 가장 간단하고 안전한 치료입니다. 임상 경험이 풍부한 전문의가 직접 진료합니다.",
      },
    },

    /* ──────── 라미네이트 ──────── */
    laminate: {
      pageTitle: "라미네이트 | 달빛치과의원",
      hero: {
        crumb:    "LAMINATE · 라미네이트",
        title:    "라미네이트<br><em>Smile Design</em>",
        subtitle: "치아 손상은 최소로, 미소의 가치는 최대로",
        bg:       "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=2000&q=80",
      },
      intro: {
        note:  "Your Own Smile Line",
        titleHTML: "나에게 딱 맞는<br><span>'스마일 라인'</span>을 찾다",
        descHTML:  "라미네이트는 단순히 치아 색을 밝게 하는 것이 아닙니다. 입술의 곡선, 얼굴의 정중선, 치아의 비율을 고려한 <strong>디지털 스마일 디자인</strong>을 통해 가장 자연스럽고 찬란한 미소를 완성합니다.",
      },
      minimal: {
        small:  "MINIMAL PREP",
        h2Html: "달빛치과의 <b>최소 삭제 원칙</b>",
        descHTML:  "자연치아의 법랑질을 최대한 보존하는 것이 라미네이트의 핵심입니다.",
        img: "https://glidewelldental.com/content/glidewell/en/education/chairside-magazine/volume-16-issue-3/veneer-preparation-and-temporization-tips-and-techniques/_jcr_content/root/container/container_467654658/container_1170571169/container/container/container/image_709736086.coreimg.85.1600.jpeg/1668759091570/image-1b.jpeg",
        points: [
          { title:"0.3mm의 미학",     text:"콘택트렌즈만큼 얇은 세라믹을 사용하여 치아 삭제를 최소화하거나 거의 하지 않습니다." },
          { title:"강력한 결합력",    text:"법랑질을 보존할수록 라미네이트 보철물과의 접착 강도가 높아져 수명이 길어집니다." },
          { title:"시림 증상 방지",   text:"상아질 노출을 원천 차단하여 시술 후 시린 증상이 거의 없습니다." },
        ],
      },
      selfWhitening: {
        small: "SELF WHITENING",
        h2Html: "자가미백 <b>뷰티스 홈</b>",
        titleHTML: "집에서 완성하는 눈부신 미소,<br><span>뷰티스 홈(BeauTis Home)</span>",
        descHTML: "치과 방문이 바쁜 분들을 위해 오스템 임플란트가 만든 프리미엄 자가미백 시스템입니다. 치과에서 제작한 전용 맞춤 트레이를 이용해 집에서 편안하고 안전하게 치아를 밝힐 수 있습니다.",
        img: "imgs/self-whitening-beautis-home.jpg",
        strengths: [
          "식약처 허가 완료, 검증된 성분으로 안심하고 사용할 수 있습니다.",
          "환자의 치아 상태와 시린 증상 정도에 맞춰 농도를 선택할 수 있습니다.",
          "시림 방지 포뮬러로 미백 시 느껴지는 불편감을 줄여줍니다.",
          "고밀착 젤 타입으로 누락되는 곳 없이 고르게 미백됩니다.",
        ],
        recommend: [
          "시간 제약 없이 집에서 편하게 미백 관리를 하고 싶은 분",
          "전문가 미백 후 하얀 치아를 더 오래 유지하고 싶은 분",
          "착색된 치아로 인해 웃을 때 자신감이 부족하신 분",
          "면접, 웨딩 등 중요한 일정을 앞두고 이미지를 개선하고 싶은 분",
        ],
        cautions: [
          "커피, 카레, 와인 등 색소가 강한 음식은 미백 기간 동안 피해주시는 것이 좋습니다.",
          "일시적으로 시린 증상이 나타날 수 있으며, 심할 경우 사용 시간을 줄이거나 격일 사용을 권장합니다.",
          "남은 미백제는 성분 유지를 위해 서늘한 곳이나 냉장 보관을 권장합니다.",
        ],
      },
      types: {
        small:  "INDICATIONS",
        h2Html: "라미네이트가 <b>효과적인 경우</b>",
        lead:   "이런 분들께 라미네이트를 권해드립니다.",
        items: [
          { title:"벌어진 치아",   desc:"치아 사이의 틈을 삭제 없이 자연스럽게 해결",
            img:"https://images.unsplash.com/photo-1559131397-f94da358f7ca?auto=format&fit=crop&w=600&q=80" },
          { title:"변색 · 반점치", desc:"미백으로 해결 안 되는 영구적 변색 개선",
            img:"https://images.unsplash.com/photo-1571772996211-2f02c9727629?auto=format&fit=crop&w=600&q=80" },
          { title:"치아 형태 불규칙", desc:"왜소치나 깨진 치아의 형태를 이상적으로 복원",
            img:"https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=600&q=80" },
          { title:"치열 불균형",   desc:"교정 없이 단기간에 치열 교정 효과 완성",
            img:"https://images.unsplash.com/photo-1581585504432-2c5fe6e9b59c?auto=format&fit=crop&w=600&q=80" },
        ],
      },
      compare: {
        small:  "COMPARISON",
        h2Html: "라미네이트 vs <b>크라운</b>",
        head:  ["구분", "라미네이트", "크라운"],
        rows: [
          { label:"삭제량",   a:"매우 적음 (0.1~0.3mm)",        b:"전체 삭제 (1.0~1.5mm)" },
          { label:"시술 부위", a:"치아 앞면만 부분 부착",        b:"치아 전체를 씌움" },
          { label:"심미성",   a:"투명도가 높고 매우 자연스러움", b:"강도가 높고 형태 복원력이 좋음" },
        ],
      },
      precautions: {
        small:  "AFTER CARE",
        h2Html: "라미네이트 <b>사후 관리</b>",
        lead:   "오래 아름답게 유지하려면 아래 사항을 지켜주세요.",
        items: [
          "시술 후 약 1주일간은 너무 차갑거나 뜨거운 음식은 피하는 것이 좋습니다.",
          "앞니로 딱딱한 음식을 깨물거나 질긴 음식을 뜯는 행위는 보철물 파손의 원인이 됩니다.",
          "색소가 강한 음식(카레, 커피 등)은 장기적인 심미 유지를 위해 주의가 필요합니다.",
          "6개월~1년 단위의 정기 검진을 통해 접착 상태를 확인하는 것이 중요합니다.",
        ],
      },
      cta: {
        titleHTML:"당신만의 <span>스마일 라인</span>을 찾아 드립니다.",
        desc:     "얼굴형 · 입술 · 치아 비율을 정밀 분석하여 자연스러운 디자인을 제안해 드립니다.",
      },
    },

  }, /* end pages */

};
