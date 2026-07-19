// ==========================================
// DATA HARGA
// Ganti angka di sini kalau harga berubah
// ==========================================

// type: 'dropdown' -> bintang dipilih lewat <select> (1..stars)
// type: 'input'    -> bintang diketik manual, harus di antara min-max
//                     (nomor bintangnya ABSOLUT/terusan, bukan mulai dari 1 lagi tiap tier)
const tiers = [
    { name: 'Epic',     type: 'dropdown', stars: 5,                priceGendong: 5000,  priceAkun: 3000 },
    { name: 'Legend',   type: 'dropdown', stars: 5,                priceGendong: 6000,  priceAkun: 5000 },
    { name: 'Mythic',   type: 'input',    min: 1,   max: 24,       priceGendong: 10000, priceAkun: 8000 },
    { name: 'Honor',    type: 'input',    min: 25,  max: 49,       priceGendong: 12000, priceAkun: 10000 },
    { name: 'Glory',    type: 'input',    min: 50,  max: 99,       priceGendong: 15000, priceAkun: 13000 },
    { name: 'Immortal', type: 'input',    min: 100, max: Infinity, priceGendong: 20000, priceAkun: 18000 },
];

// Total bintang tier dropdown (Epic + Legend), dipakai buat offset posisi global
const DROPDOWN_TOTAL_STARS = tiers
    .filter(t => t.type === 'dropdown')
    .reduce((sum, t) => sum + t.stars, 0);

let mode = 'gendong'; // 'gendong' atau 'akun'

function populateSelects() {
    const fromTier = document.getElementById('fromTier');
    const toTier = document.getElementById('toTier');

    const options = tiers.map((t, i) => `<option value="${i}">${t.name}</option>`).join('');
    fromTier.innerHTML = options;
    toTier.innerHTML = options;

    updateStarInput('fromTier', 'fromStar');
    updateStarInput('toTier', 'toStar');

    fromTier.addEventListener('change', () => updateStarInput('fromTier', 'fromStar'));
    toTier.addEventListener('change', () => updateStarInput('toTier', 'toStar'));
}

// Ambil (atau buat kalau belum ada) elemen warning kecil di bawah calc-row punya starId
function getWarningEl(starId) {
    const existing = document.getElementById(starId + 'Warning');
    if (existing) return existing;

    const starEl = document.getElementById(starId);
    const group = starEl.closest('.calc-group');

    const warn = document.createElement('div');
    warn.id = starId + 'Warning';
    warn.className = 'calc-hint';
    group.appendChild(warn);
    return warn;
}

function rangeLabel(t) {
    return t.max === Infinity ? `★${t.min}+ (unlimited)` : `★${t.min}-${t.max}`;
}

// Ganti elemen bintang jadi <select> (tier dropdown) atau <input type="number"> (tier input)
// tergantung tier yang dipilih. Id-nya tetap sama biar gampang dibaca di tempat lain.
function updateStarInput(tierId, starId) {
    const tierIndex = parseInt(document.getElementById(tierId).value, 10);
    const tier = tiers[tierIndex];
    const oldEl = document.getElementById(starId);

    let newEl;
    if (tier.type === 'input') {
        newEl = document.createElement('input');
        newEl.type = 'number';
        newEl.id = starId;
        newEl.min = String(tier.min);
        if (tier.max !== Infinity) newEl.max = String(tier.max);
        newEl.step = '1';
        newEl.value = String(tier.min);
        newEl.placeholder = `Bintang ${tier.name}`;
        newEl.className = oldEl.className;
    } else {
        newEl = document.createElement('select');
        newEl.id = starId;
        newEl.className = oldEl.className;
        let opts = '';
        for (let i = 1; i <= tier.stars; i++) {
            opts += `<option value="${i}">Bintang ${i}</option>`;
        }
        newEl.innerHTML = opts;
    }

    oldEl.parentNode.replaceChild(newEl, oldEl);

    const warn = getWarningEl(starId);
    if (tier.type === 'input') {
        warn.textContent = `${tier.name} dari ${rangeLabel(tier)}`;
        warn.classList.remove('calc-hint-error');
        newEl.addEventListener('input', () => validateStarInput(tierId, starId));
    } else {
        warn.textContent = '';
        warn.classList.remove('calc-hint-error');
    }
}

// Cek apakah nilai yang diketik user masih sesuai range tier-nya sendiri.
// Kalau kelewatan, ganti warning jadi merah dan kasih pesan salah.
function validateStarInput(tierId, starId) {
    const tierIndex = parseInt(document.getElementById(tierId).value, 10);
    const tier = tiers[tierIndex];
    if (tier.type !== 'input') return true;

    const star = parseInt(document.getElementById(starId).value, 10);
    const warn = getWarningEl(starId);
    const valid = !isNaN(star) && star >= tier.min && star <= tier.max;

    if (valid) {
        warn.textContent = `${tier.name} dari ${rangeLabel(tier)}`;
        warn.classList.remove('calc-hint-error');
    } else {
        warn.textContent = `${tier.name} cuma dari ${rangeLabel(tier)}, ketik nomor bintang yang sesuai`;
        warn.classList.add('calc-hint-error');
    }
    return valid;
}

// Ubah (tierIndex, star) jadi posisi absolut biar gampang dibandingin/diloop
function globalPosition(tierIndex, star) {
    const tier = tiers[tierIndex];
    if (tier.type === 'input') {
        return DROPDOWN_TOTAL_STARS + star;
    }
    let pos = 0;
    for (let i = 0; i < tierIndex; i++) {
        if (tiers[i].type === 'dropdown') pos += tiers[i].stars;
    }
    return pos + star;
}

// Ambil harga (gendong/akun) untuk 1 bintang di posisi global tertentu
function priceForPosition(pos) {
    if (pos <= DROPDOWN_TOTAL_STARS) {
        let cursor = 0;
        for (const t of tiers) {
            if (t.type !== 'dropdown') continue;
            if (pos <= cursor + t.stars) {
                return mode === 'gendong' ? t.priceGendong : t.priceAkun;
            }
            cursor += t.stars;
        }
    } else {
        const star = pos - DROPDOWN_TOTAL_STARS;
        for (const t of tiers) {
            if (t.type !== 'input') continue;
            if (star >= t.min && star <= t.max) {
                return mode === 'gendong' ? t.priceGendong : t.priceAkun;
            }
        }
    }
    return 0;
}

function readTierStar(tierId, starId) {
    const tierIndex = parseInt(document.getElementById(tierId).value, 10);
    const starRaw = document.getElementById(starId).value;
    const star = parseInt(starRaw, 10) || 0;
    return { tierIndex, star };
}

function hitungHarga() {
    const fromValid = validateStarInput('fromTier', 'fromStar');
    const toValid = validateStarInput('toTier', 'toStar');

    const resultBox = document.getElementById('calcResult');
    const priceEl = document.getElementById('resultPrice');
    const starsEl = document.getElementById('resultStars');

    if (!fromValid || !toValid) {
        priceEl.textContent = 'Cek lagi nomor bintangnya';
        starsEl.textContent = 'Ada input yang di luar range tier-nya';
        resultBox.classList.add('show');
        return;
    }

    const from = readTierStar('fromTier', 'fromStar');
    const to = readTierStar('toTier', 'toStar');

    const fromPos = globalPosition(from.tierIndex, from.star);
    const toPos = globalPosition(to.tierIndex, to.star);

    if (toPos <= fromPos) {
        priceEl.textContent = 'Rank tujuan harus lebih tinggi';
        starsEl.textContent = '';
        resultBox.classList.add('show');
        return;
    }

    let total = 0;
    const totalStars = toPos - fromPos;

    for (let pos = fromPos + 1; pos <= toPos; pos++) {
        total += priceForPosition(pos);
    }

    priceEl.textContent = 'Rp ' + total.toLocaleString('id-ID');
    starsEl.textContent = totalStars + ' bintang';
    resultBox.classList.add('show');
}

function renderList() {
    const list = document.getElementById('calcList');
    const title = mode === 'gendong' ? 'JOKI GENDONG' : 'JOKI AKUN';

    let html = `<h3>${title}</h3>`;

    tiers.forEach((t) => {
        const price = mode === 'gendong' ? t.priceGendong : t.priceAkun;
        const label = t.type === 'input' ? ` <small>${rangeLabel(t)}</small>` : '';
        html += `<div class="calc-list-row">
            <span class="rank-name">${t.name}${label}</span>
            <span class="rank-price">Rp ${price.toLocaleString('id-ID')} / ★</span>
        </div>`;
    });

    list.innerHTML = html;
}

function initTabs() {
    document.querySelectorAll('.calc-tab').forEach((tab) => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.calc-tab').forEach((t) => t.classList.remove('active'));
            tab.classList.add('active');
            mode = tab.dataset.mode;
            renderList();
            document.getElementById('calcResult').classList.remove('show');
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    populateSelects();
    initTabs();
    renderList();
});