// ==========================================
// DATA HARGA
// Ganti angka di sini kalau harga berubah
// ==========================================

// Epic & Legend memakai sistem divisi (V, IV, III, II, I), masing-masing
// divisi punya ★0..★5. Naik dari ★0 ke ★5 butuh 5 win. Menang sekali lagi
// di ★5 akan LANGSUNG naik ke divisi berikutnya di ★1 (bukan ★0).
// Ini berarti: total win dari divisi X ★0 sampai divisi X ★5 = 5 win,
// dan win ke-6 mendarat di divisi berikutnya ★1.
//
// Rumus posisi lokal (dalam satu tier Epic atau Legend):
//   localPosition(divisionIndex, star) = divisionIndex * STARS_PER_DIVISION + star
//
// Rumus ini otomatis benar untuk kasus promosi karena:
//   divisi X ★5      -> posisi = X*5 + 5
//   divisi (X+1) ★0  -> posisi = (X+1)*5 + 0 = X*5 + 5   (SAMA, dan memang seharusnya sama:
//                        keduanya cuma butuh 1 win lagi untuk sampai ke divisi (X+1) ★1)
//
// type: 'division' -> bintang dipilih lewat <select> berisi kombinasi divisi + bintang
// type: 'input'     -> bintang diketik manual, harus di antara min-max
//                      (nomor bintangnya ABSOLUT/terusan, bukan mulai dari 1 lagi tiap tier)

const DIVISIONS = ['V', 'IV', 'III', 'II', 'I'];
const STARS_PER_DIVISION = 5; // jumlah win untuk dari ★0 ke ★5 dalam satu divisi

// Total "win slot" yang dimiliki satu tier divisi (Epic atau Legend):
// 5 divisi x 5 win per divisi = 25
const DIVISION_TIER_TOTAL_STARS = DIVISIONS.length * STARS_PER_DIVISION;

const tiers = [
    { name: 'Epic',     type: 'division', totalStars: DIVISION_TIER_TOTAL_STARS, priceGendong: 5000,  priceAkun: 3000 },
    { name: 'Legend',   type: 'division', totalStars: DIVISION_TIER_TOTAL_STARS, priceGendong: 6000,  priceAkun: 5000 },
    { name: 'Mythic',   type: 'input',    min: 1,   max: 24,       priceGendong: 10000, priceAkun: 8000 },
    { name: 'Honor',    type: 'input',    min: 25,  max: 49,       priceGendong: 12000, priceAkun: 10000 },
    { name: 'Glory',    type: 'input',    min: 50,  max: 99,       priceGendong: 15000, priceAkun: 13000 },
    { name: 'Immortal', type: 'input',    min: 100, max: Infinity, priceGendong: 20000, priceAkun: 18000 },
];

// Total win dari Epic V ★0 sampai Legend I ★5, dipakai buat offset posisi global
// tier-tier setelah Legend (Mythic dst).
const DROPDOWN_TOTAL_STARS = tiers
    .filter(t => t.type === 'division')
    .reduce((sum, t) => sum + t.totalStars, 0);

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

// Bangun opsi <select> untuk tier bertipe 'division': setiap divisi (V..I)
// menampilkan ★0..★5. Value tiap opsi adalah "divisionIndex-star" (mis. "1-0")
// supaya setiap opsi punya value HTML yang unik, meskipun dua opsi berbeda
// (mis. V★5 dan IV★0) bisa menghasilkan progression yang sama.
// readTierStar() yang mengubah value ini jadi posisi lokal untuk globalPosition().
function buildDivisionOptions(tier) {
    let html = '';
    DIVISIONS.forEach((divisionName, divisionIndex) => {
        html += `<optgroup label="${tier.name} ${divisionName}">`;
        for (let star = 0; star <= STARS_PER_DIVISION; star++) {
            const value = `${divisionIndex}-${star}`;
            html += `<option value="${value}">${divisionName} ★${star}</option>`;
        }
        html += '</optgroup>';
    });
    return html;
}

// Ganti elemen bintang jadi <select> (tier divisi) atau <input type="number"> (tier input)
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
        newEl.innerHTML = buildDivisionOptions(tier);
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
// (Tier bertipe 'division' selalu valid karena dibatasi oleh <select>.)
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

// Ubah (tierIndex, star) jadi posisi absolut (total win dari Epic V ★0) biar
// gampang dibandingin/diloop. Untuk tier 'division', `star` adalah posisi lokal
// yang sudah dihitung oleh buildDivisionOptions (divisionIndex*5 + star).
function globalPosition(tierIndex, star) {
    const tier = tiers[tierIndex];
    if (tier.type === 'input') {
        return DROPDOWN_TOTAL_STARS + star;
    }

    let offset = 0;
    for (let i = 0; i < tierIndex; i++) {
        if (tiers[i].type === 'division') offset += tiers[i].totalStars;
    }
    return offset + star;
}

// Ambil harga (gendong/akun) untuk 1 win di posisi global tertentu
function priceForPosition(pos) {
    if (pos <= DROPDOWN_TOTAL_STARS) {
        let cursor = 0;
        for (const t of tiers) {
            if (t.type !== 'division') continue;
            if (pos <= cursor + t.totalStars) {
                return mode === 'gendong' ? t.priceGendong : t.priceAkun;
            }
            cursor += t.totalStars;
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

// Harga tier tertentu secara langsung (dipakai untuk win pertama, lihat catatan
// di hitungHarga() soal kenapa win pertama tidak bisa memakai priceForPosition()).
function priceForTier(tierIndex) {
    const tier = tiers[tierIndex];
    return mode === 'gendong' ? tier.priceGendong : tier.priceAkun;
}

// Untuk tier 'division', value select-nya berformat "divisionIndex-star" (mis. "1-0"),
// jadi perlu di-parse dulu jadi posisi lokal (divisionIndex*5+star) sebelum dipakai
// oleh globalPosition(). Untuk tier 'input', value-nya sudah berupa angka bintang biasa.
function readTierStar(tierId, starId) {
    const tierIndex = parseInt(document.getElementById(tierId).value, 10);
    const tier = tiers[tierIndex];
    const rawValue = document.getElementById(starId).value;

    let star;
    if (tier.type === 'division') {
        const [divisionIndex, starInDivision] = rawValue.split('-').map(Number);
        star = divisionIndex * STARS_PER_DIVISION + starInDivision;
    } else {
        star = parseInt(rawValue, 10) || 0;
    }

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

    // Setiap win dihargai berdasarkan rank SEBELUM win itu terjadi (source),
    // bukan rank tujuannya. Untuk win pertama, source-nya persis rank yang
    // dipilih user di dropdown "from" — jadi harganya diambil langsung dari
    // tier yang dipilih itu. Ini penting karena Epic I★5 dan Legend V★0
    // punya posisi global yang sama (progress-nya memang identik), tapi win
    // pertama dari keduanya harus dihargai berbeda (Epic vs Legend).
    // Untuk win-win berikutnya, source position-nya sudah pasti tidak ambigu,
    // jadi cukup pakai priceForPosition() seperti biasa.
    for (let pos = fromPos + 1; pos <= toPos; pos++) {
        const sourcePos = pos - 1;
        total += (sourcePos === fromPos)
            ? priceForTier(from.tierIndex)
            : priceForPosition(sourcePos);
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