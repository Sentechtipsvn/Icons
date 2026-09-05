const SHADOW_MODES = [
    { id: 'inset', nameKey: 'shadow_inset', name: 'Bóng Chìm', template: 'inset {x}px {y}px {b}px {s}px {c}' },
    { id: 'outer', nameKey: 'shadow_outer', name: 'Bóng Ngoài', template: '{x}px {y}px {b}px {s}px {c}' },
    { id: 'soft', nameKey: 'shadow_soft', name: 'Mờ Diện Rộng', template: '{x}px {y}px {b}px {s}px {c}' },
    { id: 'hard', nameKey: 'shadow_hard', name: 'Nổi Khối 3D', template: '{x}px {y}px 0px {s}px {c}' },
    { id: 'glow', nameKey: 'shadow_glow', name: 'Phát Sáng', template: '0px 0px {b}px {s}px {c}' }
];

document.addEventListener("DOMContentLoaded", () => {
    const root = document.documentElement;
    const shadowContainer = document.getElementById('shadow-controls');
    
    // Khởi tạo HTML Đổ bóng
    SHADOW_MODES.forEach(mode => {
        const div = document.createElement('div');
        div.className = 'shadow-item';
        div.innerHTML = `
            <div class="shadow-header">
                <span data-i18n="${mode.nameKey}">${mode.name}</span>
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

    document.querySelectorAll('.shadow-switch').forEach(switchBtn => {
        switchBtn.addEventListener('change', (e) => {
            const drawer = document.getElementById(`drawer-${e.target.value}`);
            if (e.target.checked) drawer.classList.add('active');
            else drawer.classList.remove('active');
            updateLiveVariables();
        });
    });

    // Mở / Đóng Settings
    const overlay = document.getElementById('settings-overlay');
    const drawerEl = document.getElementById('settings-drawer');

    const closeSettings = () => { drawerEl.classList.remove('open'); overlay.classList.remove('open'); };
    document.getElementById('open-settings').onclick = () => { drawerEl.classList.add('open'); overlay.classList.add('open'); };
    document.getElementById('close-settings').onclick = closeSettings;
    overlay.onclick = closeSettings;

    // Hiệu ứng mờ Popup khi tương tác Slider/Color
    let adjustTimeout;
    drawerEl.addEventListener('input', (e) => {
        if (e.target.tagName === 'INPUT') {
            drawerEl.classList.add('adjusting');
            clearTimeout(adjustTimeout);
            adjustTimeout = setTimeout(() => drawerEl.classList.remove('adjusting'), 800);
        }
        updateLiveVariables();
    });
    document.getElementById('val-theme-frame').addEventListener('change', updateLiveVariables);

    // Chuyển đổi Nút Layout Danh Sách / Lưới
    const btnList = document.getElementById('btn-layout-list');
    const btnGrid = document.getElementById('btn-layout-grid');
    
    function setLayoutMode(mode) {
        localStorage.setItem('sttv_layoutMode', mode);
        if (mode === 'list') {
            btnList.classList.add('active'); btnGrid.classList.remove('active');
        } else {
            btnGrid.classList.add('active'); btnList.classList.remove('active');
        }
        updateLiveVariables();
    }
    btnList.onclick = () => setLayoutMode('list');
    btnGrid.onclick = () => setLayoutMode('grid');

    // Mở Modal Info
    const infoBtn = document.getElementById('btn-info');
    const infoModal = document.getElementById('info-modal');
    infoBtn.onclick = () => infoModal.classList.toggle('show');

    // Nén Data Xuất Nhập Cấu Hình
    function packConfig() {
        const activeShadow = document.querySelector('input[name="active_shadow"]:checked');
        const sId = activeShadow ? activeShadow.value : '';
        let sData = [];
        if (sId) {
            const drw = document.getElementById(`drawer-${sId}`);
            sData = [ sId, drw.querySelector('.s-x').value, drw.querySelector('.s-y').value, drw.querySelector('.s-b').value, drw.querySelector('.s-s').value, drw.querySelector('.s-c').value ];
        }
        const dataArr = [
            document.getElementById('val-bg-main').value, document.getElementById('val-text-color').value,
            localStorage.getItem('sttv_layoutMode') || 'grid',
            document.getElementById('val-list-bg').value, document.getElementById('val-list-text').value, document.getElementById('val-list-svg').value,
            document.getElementById('val-theme-frame').value, document.getElementById('val-frame-size').value,
            document.getElementById('val-svg-size').value, document.getElementById('val-svg-opacity').value,
            document.getElementById('val-frame-radius').value, document.getElementById('val-frame-color').value, document.getElementById('val-svg-color').value,
            sData
        ];
        return btoa(JSON.stringify(dataArr)).replace(/=/g, ''); // Nén chuẩn chữ & số
    }

    function unpackConfig(base64Str) {
        try {
            const arr = JSON.parse(atob(base64Str));
            if (arr.length < 13) throw 'Lỗi';
            document.getElementById('val-bg-main').value = arr[0];
            document.getElementById('val-text-color').value = arr[1];
            setLayoutMode(arr[2]);
            document.getElementById('val-list-bg').value = arr[3];
            document.getElementById('val-list-text').value = arr[4];
            document.getElementById('val-list-svg').value = arr[5];
            document.getElementById('val-theme-frame').value = arr[6];
            document.getElementById('val-frame-size').value = arr[7];
            document.getElementById('val-svg-size').value = arr[8];
            document.getElementById('val-svg-opacity').value = arr[9];
            document.getElementById('val-frame-radius').value = arr[10];
            document.getElementById('val-frame-color').value = arr[11];
            document.getElementById('val-svg-color').value = arr[12];
            
            // Xóa bóng cũ
            document.querySelectorAll('.shadow-switch').forEach(c => { c.checked = false; document.getElementById(`drawer-${c.value}`).classList.remove('active'); });
            
            if (arr[13] && arr[13].length > 0) {
                const sId = arr[13][0];
                document.querySelector(`input[name="active_shadow"][value="${sId}"]`).checked = true;
                const drw = document.getElementById(`drawer-${sId}`);
                drw.classList.add('active');
                drw.querySelector('.s-x').value = arr[13][1]; drw.querySelector('.s-y').value = arr[13][2];
                drw.querySelector('.s-b').value = arr[13][3]; drw.querySelector('.s-s').value = arr[13][4];
                drw.querySelector('.s-c').value = arr[13][5];
            }
            updateLiveVariables();
        } catch(e) { alert("Mã cấu hình không hợp lệ!"); }
    }

    document.getElementById('btn-export').onclick = () => {
        const code = packConfig();
        navigator.clipboard.writeText(code).then(() => alert("Đã sao chép mã cấu hình (Gồm chữ và số an toàn)!"));
    };
    
    document.getElementById('btn-import').onclick = () => {
        const code = prompt("📥 Dán mã cấu hình vào đây:");
        if (code) unpackConfig(code);
    };

    function updateShadow() {
        const activeShadows = document.querySelectorAll('input[name="active_shadow"]:checked');
        let combinedShadow = '';
        activeShadows.forEach(checkbox => {
            const drawer = document.getElementById(`drawer-${checkbox.value}`);
            const mode = SHADOW_MODES.find(m => m.id === checkbox.value);
            let shadowStr = mode.template
                .replace('{x}', drawer.querySelector('.s-x').value).replace('{y}', drawer.querySelector('.s-y').value)
                .replace('{b}', drawer.querySelector('.s-b').value).replace('{s}', drawer.querySelector('.s-s').value).replace('{c}', drawer.querySelector('.s-c').value);
            if (combinedShadow) combinedShadow += ', ';
            combinedShadow += shadowStr;
        });
        root.style.setProperty('--btn-shadow', combinedShadow || 'none');
    }

    function updateLiveVariables() {
        root.style.setProperty('--bg-main', document.getElementById('val-bg-main').value);
        root.style.setProperty('--text-color', document.getElementById('val-text-color').value);
        root.style.setProperty('--frame-size', document.getElementById('val-frame-size').value + 'px');
        root.style.setProperty('--svg-size', document.getElementById('val-svg-size').value + 'px');
        root.style.setProperty('--svg-color', document.getElementById('val-svg-color').value);
        root.style.setProperty('--svg-opacity', document.getElementById('val-svg-opacity').value / 100);
        root.style.setProperty('--frame-border-radius', document.getElementById('val-frame-radius').value + '%');
        
        const currentLayout = localStorage.getItem('sttv_layoutMode') || 'grid';
        const mainContainer = document.getElementById('main-container');
        if (currentLayout === 'list') { mainContainer.classList.add('list-mode'); mainContainer.classList.remove('grid-mode'); } 
        else { mainContainer.classList.remove('list-mode'); mainContainer.classList.add('grid-mode'); }

        root.style.setProperty('--list-bg-color', document.getElementById('val-list-bg').value);
        root.style.setProperty('--list-text-color', document.getElementById('val-list-text').value);
        root.style.setProperty('--list-svg-color', document.getElementById('val-list-svg').value);

        const frameSelect = document.getElementById('val-theme-frame').value;
        const frameColor = document.getElementById('val-frame-color').value;
        
        if (frameSelect === 'custom') {
            root.style.setProperty('--frame-bg-color', 'transparent'); 
        } else if (frameSelect === 'none') {
            root.style.setProperty('--frame-bg', 'none'); root.style.setProperty('--frame-bg-color', frameColor);
        } else {
            root.style.setProperty('--frame-bg', `url('../${frameSelect}')`); root.style.setProperty('--frame-bg-color', 'transparent'); 
        }
        
        updateShadow();
        
        // Lưu LocalStorage ngầm
        localStorage.setItem('sttv_bgMain', document.getElementById('val-bg-main').value);
        localStorage.setItem('sttv_textColor', document.getElementById('val-text-color').value);
        localStorage.setItem('sttv_listBg', document.getElementById('val-list-bg').value);
    }

    // Load LocalStorage mặc định (Tương tự code cũ)
    const initLayout = localStorage.getItem('sttv_layoutMode') || 'grid';
    setLayoutMode(initLayout);
});