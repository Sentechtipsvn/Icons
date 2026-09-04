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
    
    // Tạo các Đổ bóng (Checkbox)
    SHADOW_MODES.forEach(mode => {
        const div = document.createElement('div');
        div.className = 'shadow-item';
        div.innerHTML = `
            <div class="shadow-header">
                <span data-i18n="${mode.nameKey}"></span>
                <input type="checkbox" name="active_shadow" value="${mode.id}" class="shadow-switch">
            </div>
            <div class="shadow-drawer" id="drawer-${mode.id}">
                <div class="setting-group"><label data-i18n="slider_x"></label><input type="range" class="s-x" min="-20" max="20" value="0"></div>
                <div class="setting-group"><label data-i18n="slider_y"></label><input type="range" class="s-y" min="-20" max="20" value="4"></div>
                <div class="setting-group"><label data-i18n="slider_blur"></label><input type="range" class="s-b" min="0" max="50" value="10"></div>
                <div class="setting-group"><label data-i18n="slider_spread"></label><input type="range" class="s-s" min="-10" max="30" value="0"></div>
                <div class="setting-group"><label data-i18n="slider_color"></label><input type="color" class="s-c" value="#000000"></div>
            </div>
        `;
        shadowContainer.appendChild(div);
    });

    // Mở/Đóng Drawer
    document.getElementById('open-settings').onclick = () => document.getElementById('settings-drawer').classList.add('open');
    document.getElementById('close-settings').onclick = () => document.getElementById('settings-drawer').classList.remove('open');

    // Kéo thanh trượt -> Nền mờ đi
    const drawer = document.getElementById('settings-drawer');
    document.getElementById('settings-drawer').addEventListener('input', (e) => {
        if (e.target.tagName === 'INPUT' && e.target.type === 'range') {
            drawer.classList.add('adjusting');
            clearTimeout(window.adjustTimeout);
            window.adjustTimeout = setTimeout(() => drawer.classList.remove('adjusting'), 500);
        }
    });

    // Xử lý chuyển Grid (4 cột) / List (2 cột)
    const layoutToggle = document.getElementById('layout-toggle');
    const mainContainer = document.getElementById('main-container');
    layoutToggle.addEventListener('change', () => {
        if (layoutToggle.checked) {
            mainContainer.classList.add('list-mode');
            mainContainer.classList.remove('grid-mode');
        } else {
            mainContainer.classList.remove('list-mode');
            mainContainer.classList.add('grid-mode');
        }
    });

    // Cập nhật màu sắc List mode
    function updateListColors() {
        root.style.setProperty('--list-bg-color', document.getElementById('val-list-bg').value);
        root.style.setProperty('--list-text-color', document.getElementById('val-list-text').value);
        root.style.setProperty('--list-svg-color', document.getElementById('val-list-svg').value);
    }

    // Xử lý chọn khung Icon (Ảnh nền hoặc SVG code)
    const frameSelect = document.getElementById('val-theme-frame');
    const customSvgContainer = document.getElementById('custom-svg-container');
    
    frameSelect.addEventListener('change', () => {
        if (frameSelect.value === 'custom') {
            customSvgContainer.style.display = 'block';
        } else {
            customSvgContainer.style.display = 'none';
            root.style.setProperty('--frame-bg', frameSelect.value);
        }
    });

    document.getElementById('apply-custom-svg').addEventListener('click', () => {
        const svgCode = document.getElementById('custom-svg-code').value;
        if (svgCode) {
            // Mã hóa SVG thành data URI để dùng làm nền
            const dataUri = `data:image/svg+xml;base64,${btoa(svgCode)}`;
            root.style.setProperty('--frame-bg', `url('${dataUri}')`);
            document.getElementById('settings-drawer').classList.remove('open'); 
        }
    });

    // Cập nhật toàn bộ biến CSS (Tổng hợp đổ bóng đa lớp)
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

    // Cập nhật toàn bộ biến
    function updateLiveVariables() {
        root.style.setProperty('--bg-main', document.getElementById('val-bg-main').value);
        root.style.setProperty('--text-color', document.getElementById('val-text-color').value);
        root.style.setProperty('--frame-size', document.getElementById('val-frame-size').value + 'px');
        root.style.setProperty('--svg-size', document.getElementById('val-svg-size').value + 'px');
        root.style.setProperty('--svg-color', document.getElementById('val-svg-color').value);
        updateListColors();
        updateShadow();
    }

    // Gắn sự kiện cho toàn bộ Sliders và Inputs
    document.getElementById('settings-drawer').addEventListener('input', updateLiveVariables);
    document.getElementById('val-list-bg').addEventListener('input', updateLiveVariables);
    document.getElementById('val-list-text').addEventListener('input', updateLiveVariables);
    document.getElementById('val-list-svg').addEventListener('input', updateLiveVariables);

    // Khởi tạo mặc định: Grid mode, Bật Drop Shadow
    mainContainer.classList.add('grid-mode');
    document.querySelector('input[name="active_shadow"][value="outer"]').checked = true;
    // Gọi cập nhật Shadow lần đầu để bộ lọc hiển thị đúng
    document.querySelector(`#drawer-outer .s-x`).value = 0;
    document.querySelector(`#drawer-outer .s-y`).value = 4;
    document.querySelector(`#drawer-outer .s-b`).value = 10;
    document.querySelector(`#drawer-outer .s-s`).value = 0;
    document.querySelector(`#drawer-outer .s-c`).value = "#000000";
    
    updateLiveVariables();
});