const SUPPORTED_LANGS = ['ar', 'en-GB', 'en-US', 'vi-VN', 'zh-CN', 'zh-TW'];

async function loadLanguageData(langCode) {
    try {
        const response = await fetch(`Language/${langCode}.json`);
        if (!response.ok) throw new Error("Tệp không tồn tại");
        return await response.json();
    } catch (error) {
        if (langCode !== 'en-GB') {
            try {
                const fallbackRes = await fetch(`Language/en-GB.json`);
                return await fallbackRes.json();
            } catch(e) {}
        }
        return {};
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    let userLang = navigator.language || navigator.userLanguage;
    if (!SUPPORTED_LANGS.includes(userLang)) userLang = 'en-GB';
    const translations = await loadLanguageData(userLang);

    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if(translations[key]) element.innerText = translations[key];
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
                
                const localizedTitle = translations[item.title_key] || item.title || item.title_key || 'Phím tắt';

                btn.innerHTML = `
                    <div class="icon-box">${item.svg}</div>
                    <span class="label">${localizedTitle}</span>
                `;
                container.appendChild(btn);
            });
        }
    } catch (e) { console.error("Lỗi tải dữ liệu JSON:", e); }
});