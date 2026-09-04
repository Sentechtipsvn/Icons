// Danh sách 37 mã ngôn ngữ hỗ trợ
const SUPPORTED_LANGS = ['ar', 'bn-BD', 'cs-CZ', 'da-DK', 'de-DE', 'el-GR', 'en-GB', 'en-US', 'es-ES', 'es-MX', 'fa-IR', 'fi-FI', 'fil-PH', 'fr-CA', 'fr-FR', 'hi-IN', 'hu-HU', 'id-ID', 'it-IT', 'ja', 'ko-KR', 'ms-MY', 'nb-NO', 'nl-NL', 'pl-PL', 'pt-BR', 'pt-PT', 'ro-RO', 'ru', 'sv-SE', 'sw-KE', 'th-TH', 'tr-TR', 'uk-UA', 'vi-VN', 'zh-CN', 'zh-TW']; //[span_3](start_span)[span_3](end_span)

// Hàm tải tệp ngôn ngữ an toàn
async function loadLanguageData(langCode) {
    try {
        const response = await fetch(`Language/${langCode}.json`);
        if (!response.ok) throw new Error("Tệp không tồn tại");
        return await response.json();
    } catch (error) {
        console.warn(`Lỗi tải ${langCode}.json, đang fallback về en-GB`);
        // Nếu lỗi, bắt buộc tải en-GB.json làm phao cứu sinh
        if (langCode !== 'en-GB') {
            const fallbackResponse = await fetch(`Language/en-GB.json`);
            return await fallbackResponse.json();
        }
        return {};
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Xác định ngôn ngữ máy và Fallback
    let userLang = navigator.language || navigator.userLanguage;
    if (!SUPPORTED_LANGS.includes(userLang)) {
        userLang = 'en-GB'; // Ép về en-GB nếu không hỗ trợ[span_4](start_span)[span_4](end_span)
    }
    
    // 2. Tải bộ từ điển JSON
    const translations = await loadLanguageData(userLang);

    // 3. Quét toàn bộ HTML (kể cả phần theme.js vừa sinh ra) và dịch
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[key]) {
            element.innerText = translations[key];
        }
    });

    // 4. Tải Data Icon Webclip
    try {
        const dataRes = await fetch('Data/data.json');
        const data = await dataRes.json();
        const container = document.getElementById('control-panel');
        
        const fab = document.getElementById('open-settings');
        if (data.config && data.config.settings_icon) {
            fab.innerHTML = data.config.settings_icon;
        }

        data.buttons.forEach(item => {
            const btn = document.createElement('a');
            btn.className = 'glass-btn';
            btn.href = item.action;
            
            // Dịch tên nút từ biến title_key trong JSON
            const localizedTitle = translations[item.title_key] || item.title_key;

            btn.innerHTML = `
                <div class="icon-box">${item.svg}</div>
                <span class="label">${localizedTitle}</span>
            `;
            container.appendChild(btn);
        });
    } catch (e) {
        console.error("Lỗi khởi tạo JSON:", e);
    }
});
