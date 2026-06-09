let accounts = [];

const RANK_NAMES = {
    bronze: 'Bronza',
    silver: 'Silver',
    gold: 'Gold',
    legend: 'Legend'
};

const RANK_COLORS = {
    bronze: 'cd7f32',
    silver: 'C0C0C0',
    gold: 'FFD700',
    legend: 'FF4500'
};

const RANK_ICONS = {
    bronze: 'bi-shield',
    silver: 'bi-shield-fill',
    gold: 'bi-shield-fill-check',
    legend: 'bi-trophy-fill'
};

(function initAccounts() {
    accounts = JSON.parse(localStorage.getItem('dls26_accounts') || '[]');
    renderAccounts(accounts);
})();

function renderAccounts(accs) {
    const container = document.getElementById('accountCards');
    if (!accs || accs.length === 0) {
        container.innerHTML = `
            <div class="no-accounts">
                <i class="bi bi-inbox"></i>
                <h4>Hozircha akkauntlar yo'q</h4>
                <p class="text-muted">Birinchi bo'lib akkauntingizni soting!</p>
                <a href="sell.html" class="btn btn-gold mt-3">Akkaunt sotish</a>
            </div>
        `;
        return;
    }

    container.innerHTML = accs.map(acc => {
        const rankName = RANK_NAMES[acc.rank] || acc.rank;
        const rankColor = RANK_COLORS[acc.rank] || '333';
        const imgSrc = (acc.images && acc.images.length > 0)
            ? acc.images[0]
            : `https://placehold.co/600x400/1a1a2e/${rankColor}?text=${rankName}+Account`;
        const imgCount = acc.images ? acc.images.length : 0;
        const tgMsg = encodeURIComponent(
            `Assalomu alaykum! Men DLS26 BOZOR platformasida "${acc.name}" (${rankName}, Level ${acc.level}) akkauntini ${Number(acc.price).toLocaleString()} so'm ga sotib olmoqchiman.`
        );
        return `
        <div class="col-xl-3 col-lg-4 col-md-6 col-sm-6">
            <div class="account-card">
                <div class="card-img-wrapper" onclick="${imgCount > 0 ? `openGallery(${acc.id})` : ''}" style="cursor:${imgCount > 0 ? 'pointer' : 'default'}">
                    <img src="${imgSrc}" class="card-img-top" alt="${acc.name}" onerror="this.src='https://placehold.co/600x400/1a1a2e/${rankColor}?text=${rankName}+Account'">
                    <div class="card-img-overlay-gradient"></div>
                    <span class="rank-badge ${acc.rank}">
                        <i class="bi ${RANK_ICONS[acc.rank] || 'bi-shield'}"></i>
                        ${rankName}
                    </span>
                    ${imgCount > 1 ? `<span class="img-count"><i class="bi bi-images"></i> ${imgCount}</span>` : ''}
                </div>
                <div class="card-body">
                    <h5 class="card-title">${acc.name}</h5>
                    <div class="card-meta">
                        <i class="bi bi-controller"></i> Level ${acc.level}
                        <span class="mx-2">|</span>
                        <i class="bi bi-calendar3"></i> ${acc.date}
                    </div>
                    <p class="card-text">${acc.desc}</p>
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <span class="price"><i class="bi bi-coin"></i> ${Number(acc.price).toLocaleString()} so'm</span>
                    </div>
                    <a href="https://t.me/programmer_67?text=${tgMsg}" target="_blank" class="btn-buy d-block text-center">
                        <i class="bi bi-telegram"></i> Sotib olish
                    </a>
                </div>
            </div>
        </div>`;
    }).join('');
}

function openGallery(accId) {
    const acc = accounts.find(a => a.id === accId);
    if (!acc || !acc.images || acc.images.length === 0) return;

    const overlay = document.createElement('div');
    overlay.className = 'gallery-overlay';
    overlay.innerHTML = `
        <div class="gallery-modal">
            <button class="gallery-close" onclick="closeGallery()"><i class="bi bi-x-lg"></i></button>
            <div class="gallery-counter"><span id="galleryCurrent">1</span> / ${acc.images.length}</div>
            <button class="gallery-nav gallery-prev" onclick="galleryNav(-1)"><i class="bi bi-chevron-left"></i></button>
            <img id="galleryImg" src="${acc.images[0]}" alt="${acc.name}">
            <button class="gallery-nav gallery-next" onclick="galleryNav(1)"><i class="bi bi-chevron-right"></i></button>
            <div class="gallery-thumbs">
                ${acc.images.map((src, i) => `<img src="${src}" class="gallery-thumb ${i === 0 ? 'active' : ''}" onclick="galleryTo(${i})">`).join('')}
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    window._galleryImages = acc.images;
    window._galleryIndex = 0;
}

function closeGallery() {
    const overlay = document.querySelector('.gallery-overlay');
    if (overlay) {
        overlay.remove();
        document.body.style.overflow = '';
    }
}

function galleryNav(dir) {
    const imgs = window._galleryImages;
    if (!imgs) return;
    window._galleryIndex = (window._galleryIndex + dir + imgs.length) % imgs.length;
    document.getElementById('galleryImg').src = imgs[window._galleryIndex];
    document.getElementById('galleryCurrent').textContent = window._galleryIndex + 1;
    document.querySelectorAll('.gallery-thumb').forEach((t, i) => {
        t.classList.toggle('active', i === window._galleryIndex);
    });
}

function galleryTo(idx) {
    window._galleryIndex = idx;
    document.getElementById('galleryImg').src = window._galleryImages[idx];
    document.getElementById('galleryCurrent').textContent = idx + 1;
    document.querySelectorAll('.gallery-thumb').forEach((t, i) => {
        t.classList.toggle('active', i === idx);
    });
}

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('gallery-overlay')) closeGallery();
});

document.addEventListener('keydown', function(e) {
    if (!document.querySelector('.gallery-overlay')) return;
    if (e.key === 'Escape') closeGallery();
    if (e.key === 'ArrowLeft') galleryNav(-1);
    if (e.key === 'ArrowRight') galleryNav(1);
});

function applyFilter() {
    const rank = document.getElementById('rankFilter').value;
    const price = document.getElementById('priceFilter').value;

    let filtered = [...accounts];

    if (rank !== 'all') {
        filtered = filtered.filter(a => a.rank === rank);
    }

    if (price !== 'all') {
        if (price === 'low') filtered = filtered.filter(a => a.price >= 50000 && a.price <= 100000);
        else if (price === 'mid') filtered = filtered.filter(a => a.price > 100000 && a.price <= 300000);
        else if (price === 'high') filtered = filtered.filter(a => a.price > 300000);
    }

    if (filtered.length === 0) {
        document.getElementById('accountCards').innerHTML = `
            <div class="no-accounts">
                <i class="bi bi-search"></i>
                <h4>Akkaunt topilmadi</h4>
                <p class="text-muted">Boshqa filtrlarni tanlab ko'ring</p>
                <button class="btn btn-outline-gold mt-3" onclick="resetFilter()">Filtrlarni tozalash</button>
            </div>
        `;
        return;
    }
    renderAccounts(filtered);
}

function resetFilter() {
    document.getElementById('rankFilter').value = 'all';
    document.getElementById('priceFilter').value = 'all';
    renderAccounts(accounts);
}

window.addEventListener('scroll', function() {
    const btn = document.getElementById('backToTop');
    if (window.scrollY > 400) {
        btn.classList.add('show');
    } else {
        btn.classList.remove('show');
    }

    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 80) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});