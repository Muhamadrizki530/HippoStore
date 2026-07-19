// ==========================================
// DATA HARGA
// Ganti angka di sini kalau harga berubah
// ==========================================

// Epic & Legend: dropdown, bintang terbatas (1-5)
const dropdownTiers = [
    { name: 'Epic',   stars: 5, priceGendong: 5000, priceAkun: 3000 },
    { name: 'Legend', stars: 5, priceGendong: 6000, priceAkun: 5000 },
];

// Mythic ke atas: satu hitungan bintang yang terus jalan (poin Mythic),
// dibagi per bracket. min/max dalam nomor bintang GLOBAL Mythic (bukan per-tier).
// Immortal max = Infinity artinya unlimited.
const mythicBrackets = [
    { name: 'Mythic',   min: 1,   max: 24,       priceGendong: 10000, priceAkun: 8000 },
    { name: 'Honor',    min: 25,  max: 49,       priceGendong: 12000, priceAkun: 10000 },
    { name: 'Glory',    min: 50,  max: 99,       priceGendong: 15000, priceAkun: 13000 },
    { name: 'Immortal', min: 100, max: Infinity, priceGendong: 20000, priceAkun: 18000 },
];

// Total bintang dropdown (Epic + Legend) dipakai buat offset posisi global
const DROPDOWN_TOTAL_STARS = dropdownTiers.reduce((sum, t) => sum + t.stars, 0);

// Tier yang muncul di pilihan "Dari" / "Ke"
// index 0..dropdownTiers.length-1 = dropdownTiers, index terakhir = 'Mythic' (mode input)
const MYTHIC_TIER_INDEX = dropdownTiers.length;

let mode = 'gendong'; // 'gendong' atau 'akun'

function populateSelects() {
    const fromTier = document.getElementById('fromTier');
    const toTier = document.getElementById('toTier');

    let options = dropdownTiers.map((t, i) => `<option value="${i}">${t.name}</option>`).join('');
    options += `<option value="${MYTHIC_TIER_INDEX}">Mythic+</option>`;

    fromTier.innerHTML = options;
    toTier.innerHTML = options;

    updateStarInput('fromTier', 'fromStar');
    updateStarInput('toTier', 'toStar');

    fromTier.addEventListener('change', () => updateStarInput('fromTier', 'fromStar'));
    toTier.addEventListener('change', () => updateStarInput('toTier', 'toStar'));
}

// Ganti elemen bintang jadi <select> (Epic/Legend) atau <input type="number"> (Mythic+)
// tergantung tier yang dipilih, tapi id-nya tetap sama biar gampang dibaca di hitungHarga()
function updateStarInput(tierId, starId) {
    const tierIndex = parseInt(document.getElementById(tierId).value, 10);
    const oldEl = document.getElementById(starId);

    let newEl;
    if (tierIndex === MYTHIC_TIER_INDEX) {
        newEl = document.createElement('input');
        newEl.type = 'number';
        newEl.id = starId;
        newEl.min = '1';
        newEl.step = '1';
        newEl.value = '1';
        newEl.placeholder = 'Bintang ke-';
        newEl.className = oldEl.className;
    } else {
        newEl = document.createElement('select');
        newEl.id = starId;
        newEl.className = oldEl.className;
        const starCount = dropdownTiers[tierIndex].stars;
        let opts = '';
        for (let i = 1; i <= starCount; i++) {
            opts += `<option value="${i}">Bintang ${i}</option>`;
        }
        newEl.innerHTML = opts;
    }

    oldEl.parentNode.replaceChild(newEl, oldEl);
}

// Ubah (tierIndex, star) jadi posisi absolut biar gampang dibandingin/diloop.
// Untuk Mythic+, "star" adalah nomor bintang Mythic itu sendiri (1, 2, 3, ... unlimited),
// jadi posisi globalnya = total bintang dropdown + nomor bintang mythic tsb.
function globalPosition(tierIndex, star) {
    if (tierIndex === MYTHIC_TIER_INDEX) {
        return DROPDOWN_TOTAL_STARS + star;
    }
    let pos = 0;
    for (let i = 0; i < tierIndex; i++) {
        pos += dropdownTiers[i].stars;
    }
    return pos + star;
}

// Ambil harga (gendong/akun) untuk 1 bintang di posisi global tertentu
function priceForPosition(pos) {
    if (pos <= DROPDOWN_TOTAL_STARS) {
        // Masih di area Epic/Legend, cari tier & bintang ke berapa posisi ini
        let cursor = 0;
        for (const t of dropdownTiers) {
            if (pos <= cursor + t.stars) {
                return mode === 'gendong' ? t.priceGendong : t.priceAkun;
            }
            cursor += t.stars;
        }
    } else {
        // Sudah masuk area Mythic+, cari bracket-nya
        const mythicStar = pos - DROPDOWN_TOTAL_STARS;
        for (const b of mythicBrackets) {
            if (mythicStar >= b.min && mythicStar <= b.max) {
                return mode === 'gendong' ? b.priceGendong : b.priceAkun;
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
    const from = readTierStar('fromTier', 'fromStar');
    const to = readTierStar('toTier', 'toStar');

    const fromPos = globalPosition(from.tierIndex, from.star);
    const toPos = globalPosition(to.tierIndex, to.star);

    const resultBox = document.getElementById('calcResult');
    const priceEl = document.getElementById('resultPrice');
    const starsEl = document.getElementById('resultStars');

    if (from.tierIndex === MYTHIC_TIER_INDEX && from.star < 1) {
        priceEl.textContent = 'Nomor bintang Mythic minimal 1';
        starsEl.textContent = '';
        resultBox.classList.add('show');
        return;
    }

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

    dropdownTiers.forEach((t) => {
        const price = mode === 'gendong' ? t.priceGendong : t.priceAkun;
        html += `<div class="calc-list-row">
            <span class="rank-name">${t.name}</span>
            <span class="rank-price">Rp ${price.toLocaleString('id-ID')} / ★</span>
        </div>`;
    });

    mythicBrackets.forEach((b) => {
        const price = mode === 'gendong' ? b.priceGendong : b.priceAkun;
        const rangeLabel = b.max === Infinity ? `★${b.min}+ (unlimited)` : `★${b.min}-${b.max}`;
        html += `<div class="calc-list-row">
            <span class="rank-name">${b.name} <small>${rangeLabel}</small></span>
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