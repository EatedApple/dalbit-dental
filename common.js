// ==========================================
// [ common.js ] 공통 레이아웃 및 데이터 로드
// ==========================================

async function loadCommonComponents() {
    try {
        // 1. 헤더, 푸터, JSON 데이터 한 번에 가져오기
        const [h, f, d] = await Promise.all([
            fetch('header.html').then(res => res.text()),
            fetch('footer.html').then(res => res.text()),
            fetch('./data.json').then(res => res.json())
        ]);
        
        // 2. 뼈대에 조립하기
        document.getElementById('header-container').innerHTML = h;
        document.getElementById('footer-container').innerHTML = f;
        
        // 3. 2단 드롭다운 메뉴 렌더링
        const navHtml = d.nav.map(menu => `
            <div class="nav-item">
                <a href="#" class="nav-link">${menu.category}</a>
                <div class="dropdown">
                    ${menu.submenu.map(sub => `<a href="${sub.link}" onclick="closeMenu()">${sub.name}</a>`).join('')}
                </div>
            </div>
        `).join('');
        document.getElementById('main-nav').innerHTML = navHtml;

        // 4. 공통 정보(전화번호, 병원이름 등) 세팅
        document.getElementById('hospital-name').innerText = d.hospitalName;
        document.getElementById('header-tel-btn').href = "tel:" + d.footer.tel;
        document.getElementById('float-tel').href = "tel:" + d.footer.tel;
        
        // 5. 푸터 내용 세팅
        const hours = d.footer.hours.map(h => `<p><span>${h.day}</span> <span>${h.time}</span></p>`).join('');
        const breaks = d.footer.breaks.map(b => `<p><span>${b.day}</span> <span>${b.time}</span></p>`).join('');
        document.getElementById('footer-inner-content').innerHTML = `
            <div class="footer-top">
                <div class="footer-brand"><div class="footer-logo">🌙 ${d.hospitalName}</div><p>${d.footer.address}</p><p class="footer-tel">전화 : ${d.footer.tel}</p></div>
                <div class="footer-time"><h4>진료시간</h4>${hours}<div style="margin-top:8px; padding-top:8px; border-top:1px solid rgba(255,255,255,0.1)">${breaks}</div></div>
            </div>
            <div style="text-align:center; padding-top:20px; font-size:0.85rem;">Copyright © 2026 ${d.hospitalName}. All rights reserved.</div>
        `;

        // ★★★ 6. 페이지별 고유 렌더링 함수 실행 ★★★
        // 이 공통 작업이 다 끝나면, 각 페이지(임플란트, 교정 등)에 있는 내용물 그리는 함수를 실행시킵니다.
        if (typeof renderPage === 'function') {
            renderPage(d);
        }

    } catch (e) { 
        console.error("데이터 로드 에러:", e); 
    }
}

// 스크립트가 로드되면 무조건 실행
loadCommonComponents();

// ==========================================
// 공통 UI 동작 (햄버거 메뉴 등)
// ==========================================
window.toggleMenu = function() {
    const nav = document.getElementById('main-nav');
    document.getElementById('menu-overlay').classList.toggle('active');
    nav.classList.toggle('active');
    document.querySelector('.hamburger').classList.toggle('active');
    document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : 'auto';
}

window.closeMenu = function() {
    document.getElementById('main-nav').classList.remove('active');
    document.querySelector('.hamburger').classList.remove('active');
    document.getElementById('menu-overlay').classList.remove('active');
    document.body.style.overflow = 'auto';
}

document.addEventListener('click', function(e) {
    if(window.innerWidth <= 768 && e.target.classList.contains('nav-link')) {
        e.preventDefault();
        const parentItem = e.target.parentElement;
        if(parentItem.classList.contains('active')) {
            parentItem.classList.remove('active');
        } else {
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            parentItem.classList.add('active');
        }
    }
});