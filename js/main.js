const SUPPORTED_LANGS = ['ar', 'bn-BD', 'cs-CZ', 'da-DK', 'de-DE', 'el-GR', 'en-GB', 'en-US', 'es-ES', 'es-MX', 'fa-IR', 'fi-FI', 'fil-PH', 'fr-CA', 'fr-FR', 'hi-IN', 'hu-HU', 'id-ID', 'it-IT', 'ja', 'ko-KR', 'ms-MY', 'nb-NO', 'nl-NL', 'pl-PL', 'pt-BR', 'pt-PT', 'ro-RO', 'ru', 'sv-SE', 'sw-KE', 'th-TH', 'tr-TR', 'uk-UA', 'vi-VN', 'zh-CN', 'zh-TW'];

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Tự nhận diện ngôn ngữ và Fallback[span_2](start_span)[span_2](end_span)
    let userLang = navigator.language || navigator.userLanguage;
    if (!SUPPORTED_LANGS.includes(userLang)) {
        userLang = 'en-GB'; // Fallback nếu không thuộc 37 ngôn ngữ[span_3](start_span)[span_3](end_span)
    }
    
    // Tải tệp ngôn ngữ tương ứng
    let translations = {};
    try {
        const langRes = await fetch(`Language/${userLang}.json`);
        translations = await langRes.json();
    } catch (e) { console.warn("Lỗi tải ngôn ngữ, dùng mặc định"); }

    // Dịch tiêu đề bảng điều khiển
    if(translations['settings_title']) {
        document.getElementById('lang-settings-title').innerText = translations['settings_title'];
    }

    // 2. Tải Data và Vẽ Giao diện
    try {
        const dataRes = await fetch('Data/data.json');
        const data = await dataRes.json();
        const container = document.getElementById('control-panel');
        
        // Vẽ nút Cài đặt động (Fallback emoji nếu không có mã SVG)
        const fab = document.getElementById('open-settings');
        if (data.config && data.config.settings_icon) {
            fab.innerHTML = data.config.settings_icon;
        }

        // Vẽ các Webclip
        data.buttons.forEach(item => {
            const btn = document.createElement('a');
            btn.className = 'glass-btn';
            btn.href = item.action;
            
            // Map text đa ngôn ngữ
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