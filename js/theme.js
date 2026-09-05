// theme.js
const SHADOW_MODES = [
    { id: 'inset', nameKey: 'shadow_inset', template: 'inset {x}px {y}px {b}px {s}px {c}' },
    { id: 'outer', nameKey: 'shadow_outer', template: '{x}px {y}px {b}px {s}px {c}' },
    { id: 'soft', nameKey: 'shadow_soft', template: '{x}px {y}px {b}px {s}px {c}' },
    { id: 'hard', nameKey: 'shadow_hard', template: '{x}px {y}px 0px {s}px {c}' },
    { id: 'glow', nameKey: 'shadow_glow', template: '0px 0px {b}px {s}px {c}' }
];

document.addEventListener("DOMContentLoaded", () => {
    const root = document.documentElement;
    const shadowContainer = document.getElementById('shadow-controls');
    
    // Khởi tạo giao diện Đổ bóng
    SHADOW_MODES.forEach(mode => {
        const div = document.createElement('div');
        div.className = 'shadow-item';
        div.innerHTML = `
            <div class="shadow-header">
                <span data-i18n="${mode.nameKey}"></span>
                <input type="checkbox" name="active_shadow" value="${mode.id}" class="shadow-switch">
            </div>
            <div class="shadow-drawer" id="drawer-${mode.id}">
                <div class="setting-group"><label data-i18n="slider_x">Trục X</label><input type="range" class="s-x" min="-20" max="20" value="0"></div>
                <div class="setting-group"><label data-i18n="slider_y">Trục Y</label><input type="range" class="s-y" min="-20" max="20" value="4"></div>
                <div class="setting-group"><label data-i18n="slider_blur">Độ mờ</label><input type="range" class="s-b" min="0" max="50" value="10"></div>
                <div class="setting-group"><label data-i18n="slider_spread">Lan rộng</label><input type="range" class="s-s" min="-10" max="30" value="0"></div>
                <div class="setting-group"><label data-i18n="slider_color">Màu Bóng</label><input type="color" class="s-c" value="#000000"></div>
            </div>
        `;
        shadowContainer.appendChild(div);
    });

    // Lắng nghe sự kiện Checkbox bóng
    document.querySelectorAll('.shadow-switch').forEach(switchBtn => {
        switchBtn.addEventListener('change', (e) => {
            const drawer = document.getElementById(`drawer-${e.target.value}`);
            if (e.target.checked) drawer.classList.add('active');
            else drawer.classList.remove('active');
            updateLiveVariables();
        });
    });

    document.getElementById('open-settings').onclick = () => document.getElementById('settings-drawer').classList.add('open');
    document.getElementById('close-settings').onclick = () => document.getElementById('settings-drawer').classList.remove('open');

    const drawerEl = document.getElementById('settings-drawer');
    drawerEl.addEventListener('input', (e) => {
        if (e.target.tagName === 'INPUT' && e.target.type === 'range') {
            drawerEl.classList.add('adjusting');
            clearTimeout(window.adjustTimeout);
            window.adjustTimeout = setTimeout(() => drawerEl.classList.remove('adjusting'), 500);
        }
    });

    // Xử lý custom SVG Base64
    document.getElementById('apply-custom-svg').addEventListener('click', () => {
        const svgCode = document.getElementById('custom-svg-code').value;
        if (svgCode) {
            localStorage.setItem('sttv_customSvg', svgCode);
            updateLiveVariables();
            drawerEl.classList.remove('open'); 
        }
    });

    // Xây dựng chuỗi CSS tổng hợp đổ bóng đa lớp
    function updateShadow() {
        const activeShadows = document.querySelectorAll('input[name="active_shadow"]:checked');
        let combinedShadow = '';
        
        activeShadows.forEach(checkbox => {
            const drawer = document.getElementById(`drawer-${checkbox.value}`);
            const mode = SHADOW_MODES.find(m => m.id === checkbox.value);
            let shadowStr = mode.template
                .replace('{x}', drawer.querySelector('.s-x').value)
                .replace('{y}', drawer.querySelector('.s-y').value)
                .replace('{b}', drawer.querySelector('.s-b').value)
                .replace('{s}', drawer.querySelector('.s-s').value)
                .replace('{c}', drawer.querySelector('.s-c').value);
            
            if (combinedShadow) combinedShadow += ', ';
            combinedShadow += shadowStr;
        });

        root.style.setProperty('--btn-shadow', combinedShadow || 'none');
    }

    // Logic lưu Local Storage với tiền tố sttv_
    function saveSettingsToLocal() {
        localStorage.setItem('sttv_bgMain', document.getElementById('val-bg-main').value);
        localStorage.setItem('sttv_textColor', document.getElementById('val-text-color').value);
        localStorage.setItem('sttv_layoutMode', document.getElementById('layout-toggle').checked);
        localStorage.setItem('sttv_listBg', document.getElementById('val-list-bg').value);
        localStorage.setItem('sttv_listText', document.getElementById('val-list-text').value);
        localStorage.setItem('sttv_listSvg', document.getElementById('val-list-svg').value);
        localStorage.setItem('sttv_themeFrame', document.getElementById('val-theme-frame').value);
        localStorage.setItem('sttv_frameSize', document.getElementById('val-frame-size').value);
        localStorage.setItem('sttv_svgSize', document.getElementById('val-svg-size').value);
        localStorage.setItem('sttv_svgOpacity', document.getElementById('val-svg-opacity').value);
        localStorage.setItem('sttv_svgColor', document.getElementById('val-svg-color').value);
        localStorage.setItem('sttv_frameRadius', document.getElementById('val-frame-radius').value);
        localStorage.setItem('sttv_frameColor', document.getElementById('val-frame-color').value);

        // Lưu object cho đổ bóng
        const shadowState = {};
        SHADOW_MODES.forEach(mode => {
            const drawer = document.getElementById(`drawer-${mode.id}`);
            const checkbox = document.querySelector(`input[name="active_shadow"][value="${mode.id}"]`);
            shadowState[mode.id] = {
                active: checkbox.checked,
                x: drawer.querySelector('.s-x').value,
                y: drawer.querySelector('.s-y').value,
                b: drawer.querySelector('.s-b').value,
                s: drawer.querySelector('.s-s').value,
                c: drawer.querySelector('.s-c').value
            };
        });
        localStorage.setItem('sttv_shadowConfig', JSON.stringify(shadowState));
    }

    // Cập nhật DOM Live
    function updateLiveVariables() {
        root.style.setProperty('--bg-main', document.getElementById('val-bg-main').value);
        root.style.setProperty('--text-color', document.getElementById('val-text-color').value);
        root.style.setProperty('--frame-size', document.getElementById('val-frame-size').value + 'px');
        root.style.setProperty('--svg-size', document.getElementById('val-svg-size').value + 'px');
        root.style.setProperty('--svg-color', document.getElementById('val-svg-color').value);
        root.style.setProperty('--svg-opacity', document.getElementById('val-svg-opacity').value / 100);
        root.style.setProperty('--frame-border-radius', document.getElementById('val-frame-radius').value + '%');
        
        // Mode List/Grid
        const isListMode = document.getElementById('layout-toggle').checked;
        const mainContainer = document.getElementById('main-container');
        if (isListMode) {
            mainContainer.classList.add('list-mode');
            mainContainer.classList.remove('grid-mode');
        } else {
            mainContainer.classList.remove('list-mode');
            mainContainer.classList.add('grid-mode');
        }

        root.style.setProperty('--list-bg-color', document.getElementById('val-list-bg').value);
        root.style.setProperty('--list-text-color', document.getElementById('val-list-text').value);
        root.style.setProperty('--list-svg-color', document.getElementById('val-list-svg').value);

        // Logic xử lý Theme nền / Không nền / Custom SVG
        const frameSelect = document.getElementById('val-theme-frame');
        const frameColor = document.getElementById('val-frame-color');
        const customContainer = document.getElementById('custom-svg-container');

        if (frameSelect.value === 'custom') {
            customContainer.style.display = 'block';
            root.style.setProperty('--frame-bg-color', 'transparent');
            const savedCustom = localStorage.getItem('sttv_customSvg') || document.getElementById('custom-svg-code').value;
            if (savedCustom) {
                const dataUri = `data:image/svg+xml;base64,${btoa(savedCustom)}`;
                root.style.setProperty('--frame-bg', `url('${dataUri}')`);
            }
        } else {
            customContainer.style.display = 'none';
            if (frameSelect.value === 'none') {
                root.style.setProperty('--frame-bg', 'none');
                root.style.setProperty('--frame-bg-color', frameColor.value); // Hiển thị nền mặc định có bo góc
            } else {
                root.style.setProperty('--frame-bg', frameSelect.value);
                root.style.setProperty('--frame-bg-color', 'transparent'); // Thay thế hoàn toàn bằng ảnh, xoá màu nền default
            }
        }

        updateShadow();
        saveSettingsToLocal();
    }

    // Logic Tải trạng thái từ Local Storage khi Reload App
    function loadSettingsFromLocal() {
        const safeSet = (id, key, fallback, isCheck = false) => {
            const el = document.getElementById(id);
            if (!el) return;
            const val = localStorage.getItem('sttv_' + key);
            if (isCheck) el.checked = val === 'true' ? true : (val === null ? fallback : false);
            else el.value = val !== null ? val : fallback;
        };

        safeSet('val-bg-main', 'bgMain', '#121b22');
        safeSet('val-text-color', 'textColor', '#ffffff');
        safeSet('layout-toggle', 'layoutMode', false, true);
        safeSet('val-list-bg', 'listBg', '#ffffff');
        safeSet('val-list-text', 'listText', '#ffffff');
        safeSet('val-list-svg', 'listSvg', '#ffffff');
        safeSet('val-theme-frame', 'themeFrame', 'none');
        safeSet('val-frame-size', 'frameSize', '60');
        safeSet('val-svg-size', 'svgSize', '28');
        safeSet('val-svg-opacity', 'svgOpacity', '100');
        safeSet('val-svg-color', 'svgColor', '#ffffff');
        safeSet('val-frame-radius', 'frameRadius', '22');
        safeSet('val-frame-color', 'frameColor', '#000000');

        const savedSvg = localStorage.getItem('sttv_customSvg');
        if (savedSvg) document.getElementById('custom-svg-code').value = savedSvg;

        const savedShadows = localStorage.getItem('sttv_shadowConfig');
        if (savedShadows) {
            try {
                const shadowState = JSON.parse(savedShadows);
                SHADOW_MODES.forEach(mode => {
                    if (shadowState[mode.id]) {
                        const drawer = document.getElementById(`drawer-${mode.id}`);
                        const checkbox = document.querySelector(`input[name="active_shadow"][value="${mode.id}"]`);
                        
                        checkbox.checked = shadowState[mode.id].active;
                        if (checkbox.checked) drawer.classList.add('active');
                        else drawer.classList.remove('active');

                        drawer.querySelector('.s-x').value = shadowState[mode.id].x || 0;
                        drawer.querySelector('.s-y').value = shadowState[mode.id].y || 4;
                        drawer.querySelector('.s-b').value = shadowState[mode.id].b || 10;
                        drawer.querySelector('.s-s').value = shadowState[mode.id].s || 0;
                        drawer.querySelector('.s-c').value = shadowState[mode.id].c || '#000000';
                    }
                });
            } catch (e) { console.warn("Lỗi đọc cấu hình đổ bóng", e); }
        } else {
            // Giá trị đổ bóng mặc định nếu chưa có Local
            const defaultShadow = document.querySelector('input[name="active_shadow"][value="outer"]');
            if(defaultShadow) {
                defaultShadow.checked = true;
                document.getElementById('drawer-outer').classList.add('active');
            }
        }
    }

    // Gắn Event cho toàn bộ input thay đổi
    drawerEl.addEventListener('input', updateLiveVariables);
    document.getElementById('val-theme-frame').addEventListener('change', updateLiveVariables);

    // Kích hoạt khởi tạo dữ liệu
    loadSettingsFromLocal();
    updateLiveVariables();
});