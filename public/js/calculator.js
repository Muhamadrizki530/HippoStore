// ==========================================
// DATA HARGA PER RANK (per bintang)
// Ganti angka di sini kalau harga berubah
// ==========================================
const tiers = [
    { name: 'Epic',     stars: 5, priceGendong: 5000,  priceAkun: 3000 },
    { name: 'Legend',   stars: 5, priceGendong: 6000,  priceAkun: 5000 },
    { name: 'Mythic',   stars: 5, priceGendong: 10000, priceAkun: 8000 },
    { name: 'Honor',    stars: 5, priceGendong: 12000, priceAkun: 10000 },
    { name: 'Glory',    stars: 5, priceGendong: 15000, priceAkun: 13000 },
    { name: 'Immortal', stars: 5, priceGendong: 20000, priceAkun: 18000 },
];
 
let mode = 'gendong'; // 'gendong' atau 'akun'
 
function populateSelects() {
    const fromTier = document.getElementById('fromTier');
    const toTier = document.getElementById('toTier');
 
    const options = tiers.map((t, i) => `<option value="${i}">${t.name}</option>`).join('');
    fromTier.innerHTML = options;
    toTier.innerHTML = options;
 
    updateStarOptions('fromTier', 'fromStar');
    updateStarOptions('toTier', 'toStar');
 
    fromTier.addEventListener('change', () => updateStarOptions('fromTier', 'fromStar'));
    toTier.addEventListener('change', () => updateStarOptions('toTier', 'toStar'));
}
 
function updateStarOptions(tierId, starId) {
    const tierIndex = parseInt(document.getElementById(tierId).value, 10);
    const starCount = tiers[tierIndex].stars;
    const starSelect = document.getElementById(starId);
 
    let opts = '';
    for (let i = 1; i <= starCount; i++) {
        opts += `<option value="${i}">Bintang ${i}</option>`;
    }
    starSelect.innerHTML = opts;
}
 
// Ubah (tierIndex, star) jadi posisi absolut biar gampang dibandingin/diloop
function globalPosition(tierIndex, star) {
    let pos = 0;
    for (let i = 0; i < tierIndex; i++) {
        pos += tiers[i].stars;
    }
    return pos + star;
}
 
function hitungHarga() {
    const fromTierIdx = parseInt(document.getElementById('fromTier').value, 10);
    const fromStar = parseInt(document.getElementById('fromStar').value, 10);
    const toTierIdx = parseInt(document.getElementById('toTier').value, 10);
    const toStar = parseInt(document.getElementById('toStar').value, 10);
 
    const fromPos = globalPosition(fromTierIdx, fromStar);
    const toPos = globalPosition(toTierIdx, toStar);
 
    const resultBox = document.getElementById('calcResult');
    const priceEl = document.getElementById('resultPrice');
    const starsEl = document.getElementById('resultStars');
 
    if (toPos <= fromPos) {
        priceEl.textContent = 'Rank tujuan harus lebih tinggi';
        starsEl.textContent = '';
        resultBox.classList.add('show');
        return;
    }
 
    let total = 0;
    let totalStars = 0;
    let cursor = 0;
 
    // Loop tiap bintang dari rank paling bawah, jumlahin yang ada di antara from -> to
    // (otomatis pakai harga tier masing-masing kalau lewat beberapa rank sekaligus)
    for (let t = 0; t < tiers.length; t++) {
        for (let s = 1; s <= tiers[t].stars; s++) {
            cursor++;
            if (cursor > fromPos && cursor <= toPos) {
                const price = mode === 'gendong' ? tiers[t].priceGendong : tiers[t].priceAkun;
                total += price;
                totalStars++;
            }
        }
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
        html += `<div class="calc-list-row">
            <span class="rank-name">${t.name}</span>
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