// App Settings State
const settings = {
    fontSize: localStorage.getItem('fontSize') || '2.8',
    numberType: localStorage.getItem('numberType') || 'arabic',
    theme: localStorage.getItem('theme') || 'light'
};

// Apply initial settings
document.documentElement.setAttribute('data-theme', settings.theme);
document.documentElement.style.setProperty('--ayah-font-size', `${settings.fontSize}rem`);

const getApiUrl = (surahNo) => `https://quranapi.pages.dev/api/${surahNo}.json`;
const proxyUrl = 'https://api.allorigins.win/get?url=';

let currentSurahData = null;

async function fetchSurah(surahNo = 55) {
    const versesContainer = document.getElementById('verses-container');
    const apiUrl = getApiUrl(surahNo);

    // Show loader
    versesContainer.innerHTML = `
        <div class="loader">
            <div class="spinner"></div>
            <p>กำลังอัญเชิญพระพจนารถ...</p>
        </div>
    `;

    try {
        let response;
        let data;

        try {
            response = await fetch(apiUrl);
            if (!response.ok) throw new Error();
            data = await response.json();
        } catch (e) {
            console.log("Direct fetch failed, trying proxy for compatibility...");
            response = await fetch(`${proxyUrl}${encodeURIComponent(apiUrl)}`);
            if (!response.ok) throw new Error('Cannot fetch data');
            const wrapper = await response.json();
            data = JSON.parse(wrapper.contents);
        }

        currentSurahData = data;
        renderSurah(data);
    } catch (error) {
        console.error('Error fetching surah:', error);
        versesContainer.innerHTML = `
            <div class="verse-card" style="text-align: center; border-left-color: #e74c3c;">
                <p>ขออภัย เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
                <p style="font-size: 0.9rem; color: #7f8c8d;">${error.message}</p>
                <button onclick="location.reload()" style="margin-top:15px; padding:10px 20px; cursor:pointer;">ลองใหม่</button>
            </div>
        `;
    }
}

function toArabicDigits(number) {
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return number.toString().split('').map(d => arabicDigits[d]).join('');
}

function renderSurah(data) {
    if (!data) return;
    const versesContainer = document.getElementById('verses-container');
    const surahTitleAb = document.getElementById('surah-title-arabic');
    const surahTitleEn = document.getElementById('surah-title-en');
    const surahInfo = document.getElementById('surah-info');

    // Update Header
    surahTitleAb.textContent = data.surahNameArabic;
    surahTitleEn.textContent = `Surah ${data.surahName}`;
    surahInfo.textContent = `${data.revelationPlace} • ${data.totalAyah} Verses`;

    // Clear Loader
    versesContainer.innerHTML = '';

    // Render Verses
    data.arabic1.forEach((verse, index) => {
        const verseCard = document.createElement('div');
        verseCard.className = 'verse-card';
        verseCard.style.animationDelay = `${index * 0.05}s`;

        const displayNum = settings.numberType === 'arabic' 
            ? `﴿${toArabicDigits(index + 1)}﴾` 
            : `(${index + 1})`;

        verseCard.innerHTML = `
            <div class="ayah-text">
                ${verse} <span class="arabic-number-end">${displayNum}</span>
            </div>
        `;

        versesContainer.appendChild(verseCard);
    });
}

// Settings UI Logic
const modal = document.getElementById('settings-modal');
const settingsBtn = document.getElementById('settings-btn');
const closeBtn = document.querySelector('.close-btn');

settingsBtn.onclick = () => modal.style.display = "block";
closeBtn.onclick = () => modal.style.display = "none";
window.onclick = (event) => {
    if (event.target == modal) modal.style.display = "none";
};

// Font Size Control
const fontSizeSlider = document.getElementById('font-size-slider');
const fontSizeValue = document.getElementById('font-size-value');

fontSizeSlider.value = settings.fontSize;
fontSizeValue.textContent = settings.fontSize;

fontSizeSlider.oninput = (e) => {
    const val = e.target.value;
    settings.fontSize = val;
    fontSizeValue.textContent = val;
    document.documentElement.style.setProperty('--ayah-font-size', `${val}rem`);
    localStorage.setItem('fontSize', val);
};

// Number Type Control
const numberTypeSelect = document.getElementById('number-type');
numberTypeSelect.value = settings.numberType;
numberTypeSelect.onchange = (e) => {
    settings.numberType = e.target.value;
    localStorage.setItem('numberType', e.target.value);
    renderSurah(currentSurahData);
};

// Theme Control
const themeToggle = document.getElementById('theme-toggle');
themeToggle.value = settings.theme;
themeToggle.onchange = (e) => {
    settings.theme = e.target.value;
    document.documentElement.setAttribute('data-theme', e.target.value);
    localStorage.setItem('theme', e.target.value);
};

// Event listener for Surah selection
document.getElementById('surah-selector').addEventListener('change', (e) => {
    fetchSurah(e.target.value);
});

// Start fetching default selector value
fetchSurah(document.getElementById('surah-selector').value);
