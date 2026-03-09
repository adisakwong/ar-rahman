const getApiUrl = (surahNo) => `https://quranapi.pages.dev/api/${surahNo}.json`;
// เราใช้ Proxy เพื่อแก้ปัญหา CORS (Cross-Origin Resource Sharing) 
// Proxy service for CORS issues (essential when running on GitHub Pages)
const proxyUrl = 'https://api.allorigins.win/get?url=';

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

        // GitHub Pages might require proxy usage due to HTTPS/CORS restrictions from some APIs
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

        const verseNumberArabic = toArabicDigits(index + 1);

        // วางหมายเลขไว้ท้าย Ayat ในสไตล์อัลกุรอาน
        verseCard.innerHTML = `
            <div class="ayah-text">
                ${verse} <span class="arabic-number-end">﴿${verseNumberArabic}﴾</span>
            </div>
        `;

        versesContainer.appendChild(verseCard);
    });
}

// Event listener for Surah selection
document.getElementById('surah-selector').addEventListener('change', (e) => {
    fetchSurah(e.target.value);
});

// Start fetching default selector value
fetchSurah(document.getElementById('surah-selector').value);
