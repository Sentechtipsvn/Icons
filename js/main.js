// js/main.js
const SUPPORTED_LANGS = ['ar', 'bn-BD', 'cs-CZ', 'da-DK', 'de-DE', 'el-GR', 'en-GB', 'en-US', 'es-ES', 'es-MX', 'fa-IR', 'fi-FI', 'fil-PH', 'fr-CA', 'fr-FR', 'hi-IN', 'hu-HU', 'id-ID', 'it-IT', 'ja', 'ko-KR', 'ms-MY', 'nb-NO', 'nl-NL', 'pl-PL', 'pt-BR', 'pt-PT', 'ro-RO', 'ru', 'sv-SE', 'sw-KE', 'th-TH', 'tr-TR', 'uk-UA', 'vi-VN', 'zh-CN', 'zh-TW'];

async function loadLanguageData(langCode) {
    try {
        const response = await fetch(`Language/${langCode}.json`);
        if (!response.ok) throw new Error("Tệp không tồn tại");
        return await response.json();
    } catch (error) {
        console.warn(`Lỗi tải ${langCode}.json, đang fallback về en-GB`);
        if (langCode !== 'en-GB') {
            const fallbackResponse = await fetch(`Language/en-GB.json`);
            return await fallbackResponse.json();
        }
        return {};
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    let userLang = navigator.language || navigator.userLanguage;
    if (!SUPPORTED_LANGS.includes(userLang)) userLang = 'en-GB';
    const translations = await loadLanguageData(userLang);

    // Fallback chuẩn theo ngữ cảnh, đảm bảo không dính thương hiệu
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.innerText = translations[key] || element.innerText || 'Nhãn văn bản';
    });

    try {
        const dataRes = await fetch('Data/data.json'); 
        const data = await dataRes.json();
        const container = document.getElementById('control-panel');
        
        const fab = document.getElementById('open-settings');
        if (fab && data.config && data.config.settings_icon) {
            fab.innerHTML = data.config.settings_icon;
        }

        if (data.buttons && data.buttons.length > 0) {
            data.buttons.forEach(item => {
                const btn = document.createElement('a');
                btn.className = 'glass-btn';
                btn.href = item.action;
                
                // Fallback mô tả chức năng
                const localizedTitle = translations[item.title_key] || item.title_key || 'Phím tắt';

                btn.innerHTML = `
                    <div class="icon-box">${item.svg}</div>
                    <span class="label">${localizedTitle}</span>
                `;
                container.appendChild(btn);
            });
        }
    } catch (e) {
        console.error("Lỗi tải dữ liệu JSON cấu hình:", e);
    }
});