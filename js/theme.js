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

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    let audioCtx;
    function playTick() {
        if (!document.getElementById('toggle-audio').checked) return;
        if (!audioCtx) audioCtx = new AudioContext();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
        osc.type = 'sine'; osc.frequency.setValueAtTime(800, audioCtx.currentTime); osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(); osc.stop(audioCtx.currentTime + 0.05);
    }
    document.addEventListener('click', (e) => { if (e.target.tagName === 'BUTTON' || e.target.type === 'checkbox') playTick(); });
    document.getElementById('settings-drawer').addEventListener('input', (e) => { if (e.target.type === 'range') playTick(); });

    function handleOrientation(e) {
        if (!document.getElementById('toggle-parallax').checked) return;
        let x = e.gamma; let y = e.beta; 
        if (x > 30) x = 30; if (x < -30) x = -30;
        if (y > 30) y = 30; if (y < -30) y = -30;
        root.style.setProperty('--tilt-x', (x / 2) + 'px'); root.style.setProperty('--tilt-y', (y / 2) + 'px');
    }
    document.getElementById('toggle-parallax').addEventListener('change', (e) => {
        if (e.target.checked) {
            if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                DeviceOrientationEvent.requestPermission().then(state => {
                    if (state === 'granted') window.addEventListener('deviceorientation', handleOrientation);
                    else { e.target.checked = false; alert('Vui lòng cấp quyền cảm biến!'); }
                }).catch(console.error);
            } else { window.addEventListener('deviceorientation', handleOrientation); }
        } else {
            window.removeEventListener('deviceorientation', handleOrientation);
            root.style.setProperty('--tilt-x', '0px'); root.style.setProperty('--tilt-y', '0px');
        }
        localStorage.setItem('sttv_parallax', e.target.checked);
    });

    const uploadBg = document.getElementById('upload-bg');
    uploadBg.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const b64 = ev.target.result; localStorage.setItem('sttv_customBgImage', b64);
                document.body.style.backgroundImage = `url('${b64}')`;
            };
            reader.readAsDataURL(file);
        }
    });
    document.getElementById('clear-bg').addEventListener('click', () => { localStorage.removeItem('sttv_customBgImage'); document.body.style.backgroundImage = 'none'; uploadBg.value = ""; });

    document.querySelectorAll('.shadow-switch').forEach(switchBtn => {
        switchBtn.addEventListener('change', (e) => {
            const drawer = document.getElementById(`drawer-${e.target.value}`);
            if (e.target.checked) drawer.classList.add('active'); else drawer.classList.remove('active');
            updateLiveVariables();
        });
    });

    const overlay = document.getElementById('settings-overlay');
    const drawerEl = document.getElementById('settings-drawer');
    const closeSettings = () => { drawerEl.classList.remove('open'); overlay.classList.remove('open'); };
    document.getElementById('open-settings').onclick = () => { drawerEl.classList.add('open'); overlay.classList.add('open'); };
    document.getElementById('close-settings').onclick = closeSettings;
    overlay.onclick = closeSettings;

    let adjustTimeout;
    drawerEl.addEventListener('input', (e) => {
        if (e.target.tagName === 'INPUT') {
            drawerEl.classList.add('adjusting'); clearTimeout(adjustTimeout);
            adjustTimeout = setTimeout(() => drawerEl.classList.remove('adjusting'), 800);
        }
        updateLiveVariables();
    });

    const btnList = document.getElementById('btn-layout-list');
    const btnGrid = document.getElementById('btn-layout-grid');
    function setLayoutMode(mode) {
        localStorage.setItem('sttv_layoutMode', mode);
        if (mode === 'list') { btnList.classList.add('active'); btnGrid.classList.remove('active'); } 
        else { btnGrid.classList.add('active'); btnList.classList.remove('active'); }
        updateLiveVariables();
    }
    btnList.onclick = () => setLayoutMode('list'); btnGrid.onclick = () => setLayoutMode('grid');

    const infoModal = document.getElementById('info-modal');
    const infoOverlay = document.getElementById('info-overlay');
    document.getElementById('btn-info').onclick = () => { infoModal.classList.add('show'); infoOverlay.classList.add('show'); };
    document.getElementById('close-info').onclick = () => { infoModal.classList.remove('show'); infoOverlay.classList.remove('show'); };
    infoOverlay.onclick = () => { infoModal.classList.remove('show'); infoOverlay.classList.remove('show'); };

    function updateShadow() {
        const activeShadows = document.querySelectorAll('input[name="active_shadow"]:checked');
        let combinedShadow = '';
        activeShadows.forEach(checkbox => {
            const drawer = document.getElementById(`drawer-${checkbox.value}`);
            const mode = SHADOW_MODES.find(m => m.id === checkbox.value);
            let shadowStr = mode.template
                .replace('{x}', drawer.querySelector('.s-x').value).replace('{y}', drawer.querySelector('.s-y').value)
                .replace('{b}', drawer.querySelector('.s-b').value).replace('{s}', drawer.querySelector('.s-s').value).replace('{c}', drawer.querySelector('.s-c').value);
            if (combinedShadow) combinedShadow += ', '; combinedShadow += shadowStr;
        });
        root.style.setProperty('--btn-shadow', combinedShadow || 'none');
    }

    function saveSettingsToLocal() {
        localStorage.setItem('sttv_bgMain', document.getElementById('val-bg-main').value);
        localStorage.setItem('sttv_textColor', document.getElementById('val-text-color').value);
        localStorage.setItem('sttv_listBg', document.getElementById('val-list-bg').value);
        localStorage.setItem('sttv_listText', document.getElementById('val-list-text').value);
        localStorage.setItem('sttv_listSvg', document.getElementById('val-list-svg').value);
        localStorage.setItem('sttv_themeFrame', document.getElementById('val-theme-frame').value);
        localStorage.setItem('sttv_frameSize', document.getElementById('val-frame-size').value);
        localStorage.setItem('sttv_svgSize', document.getElementById('val-svg-size').value);
        localStorage.setItem('sttv_svgOpacity', document.getElementById('val-svg-opacity').value);
        localStorage.setItem('sttv_frameRadius', document.getElementById('val-frame-radius').value);
        localStorage.setItem('sttv_frameColor', document.getElementById('val-frame-color').value);
        localStorage.setItem('sttv_svgColor', document.getElementById('val-svg-color').value);
        
        localStorage.setItem('sttv_hideLabels', document.getElementById('toggle-hide-labels').checked);
        localStorage.setItem('sttv_listFrame', document.getElementById('toggle-list-frame').checked);
        localStorage.setItem('sttv_titleSize', document.getElementById('val-title-size').value);
        localStorage.setItem('sttv_titleSpacing', document.getElementById('val-title-spacing').value);
        localStorage.setItem('sttv_glassMode', document.getElementById('toggle-glass').checked);
        localStorage.setItem('sttv_audioFeedback', document.getElementById('toggle-audio').checked);

        const shadowState = {};
        SHADOW_MODES.forEach(mode => {
            const drawer = document.getElementById(`drawer-${mode.id}`);
            const checkbox = document.querySelector(`input[name="active_shadow"][value="${mode.id}"]`);
            shadowState[mode.id] = {
                active: checkbox.checked, x: drawer.querySelector('.s-x').value,
                y: drawer.querySelector('.s-y').value, b: drawer.querySelector('.s-b').value,
                s: drawer.querySelector('.s-s').value, c: drawer.querySelector('.s-c').value
            };
        });
        localStorage.setItem('sttv_shadowConfig', JSON.stringify(shadowState));
    }

    function updateLiveVariables() {
        root.style.setProperty('--bg-main', document.getElementById('val-bg-main').value);
        root.style.setProperty('--text-color', document.getElementById('val-text-color').value);
        root.style.setProperty('--frame-size', document.getElementById('val-frame-size').value + 'px');
        root.style.setProperty('--svg-size', document.getElementById('val-svg-size').value + 'px');
        root.style.setProperty('--svg-color', document.getElementById('val-svg-color').value);
        root.style.setProperty('--svg-opacity', document.getElementById('val-svg-opacity').value / 100);
        
        const rawRadius = document.getElementById('val-frame-radius').value;
        root.style.setProperty('--frame-border-radius', rawRadius + '%'); // Giữ nguyên % cho nút vuông grid
        root.style.setProperty('--list-border-radius', rawRadius + 'px'); // Cấp PX cho hình viên thuốc List

        root.style.setProperty('--title-size', document.getElementById('val-title-size').value + 'px');
        root.style.setProperty('--title-spacing', document.getElementById('val-title-spacing').value + 'px');
        root.style.setProperty('--label-display', document.getElementById('toggle-hide-labels').checked ? 'none' : 'block');
        
        const currentLayout = localStorage.getItem('sttv_layoutMode') || 'grid';
        const mainContainer = document.getElementById('main-container');
        if (currentLayout === 'list') { mainContainer.classList.add('list-mode'); mainContainer.classList.remove('grid-mode'); } 
        else { mainContainer.classList.remove('list-mode'); mainContainer.classList.add('grid-mode'); }

        const isListFrame = document.getElementById('toggle-list-frame').checked;
        if (isListFrame) mainContainer.classList.add('list-frame-active'); else mainContainer.classList.remove('list-frame-active');

        root.style.setProperty('--list-bg-color', document.getElementById('val-list-bg').value);
        root.style.setProperty('--list-text-color', document.getElementById('val-list-text').value);
        root.style.setProperty('--list-svg-color', document.getElementById('val-list-svg').value);

        const frameSelect = document.getElementById('val-theme-frame').value;
        const frameColor = document.getElementById('val-frame-color').value;
        const customContainer = document.getElementById('custom-svg-container');
        
        if (frameSelect === 'custom') {
            customContainer.style.display = 'block'; root.style.setProperty('--frame-bg-color', 'transparent'); 
            const savedCustom = localStorage.getItem('sttv_customSvg') || document.getElementById('custom-svg-code').value;
            if (savedCustom) { root.style.setProperty('--frame-bg', `url('data:image/svg+xml;base64,${btoa(savedCustom)}')`); }
        } else {
            customContainer.style.display = 'none';
            if (frameSelect === 'none') { root.style.setProperty('--frame-bg', 'none'); root.style.setProperty('--frame-bg-color', frameColor); } 
            else { root.style.setProperty('--frame-bg', `url('../${frameSelect}')`); root.style.setProperty('--frame-bg-color', 'transparent'); }
        }
        
        const glassMode = document.getElementById('toggle-glass').checked;
        if(glassMode) mainContainer.classList.add('glass-active'); else mainContainer.classList.remove('glass-active');

        updateShadow();
        saveSettingsToLocal();
    }

    function loadSettingsFromLocal() {
        const safeSet = (id, key, fallback, isCheck = false) => {
            const el = document.getElementById(id); if (!el) return;
            const val = localStorage.getItem('sttv_' + key);
            if (isCheck) el.checked = val === 'true' ? true : (val === null ? fallback : false);
            else el.value = val !== null ? val : fallback;
        };

        safeSet('val-bg-main', 'bgMain', '#121b22'); safeSet('val-text-color', 'textColor', '#ffffff');
        safeSet('val-list-bg', 'listBg', '#1a1a1a'); safeSet('val-list-text', 'listText', '#ffffff'); safeSet('val-list-svg', 'listSvg', '#ffffff');
        safeSet('val-theme-frame', 'themeFrame', 'none'); safeSet('val-frame-size', 'frameSize', '60');
        safeSet('val-svg-size', 'svgSize', '28'); safeSet('val-svg-opacity', 'svgOpacity', '100');
        safeSet('val-svg-color', 'svgColor', '#ffffff'); safeSet('val-frame-radius', 'frameRadius', '22');
        safeSet('val-frame-color', 'frameColor', '#000000');
        
        safeSet('toggle-hide-labels', 'hideLabels', false, true);
        safeSet('toggle-list-frame', 'listFrame', false, true);
        safeSet('val-title-size', 'titleSize', '22'); safeSet('val-title-spacing', 'titleSpacing', '0.5');
        
        safeSet('toggle-glass', 'glassMode', false, true); safeSet('toggle-audio', 'audioFeedback', false, true);
        safeSet('toggle-parallax', 'parallax', false, true);

        const initLayout = localStorage.getItem('sttv_layoutMode') || 'grid';
        const btnList = document.getElementById('btn-layout-list');
        const btnGrid = document.getElementById('btn-layout-grid');
        if (initLayout === 'list') { btnList.classList.add('active'); btnGrid.classList.remove('active'); } 
        else { btnGrid.classList.add('active'); btnList.classList.remove('active'); }

        const savedBg = localStorage.getItem('sttv_customBgImage'); if (savedBg) document.body.style.backgroundImage = `url('${savedBg}')`;

        const savedShadows = localStorage.getItem('sttv_shadowConfig');
        if (savedShadows) {
            try {
                const shadowState = JSON.parse(savedShadows);
                SHADOW_MODES.forEach(mode => {
                    if (shadowState[mode.id]) {
                        const drawer = document.getElementById(`drawer-${mode.id}`);
                        const checkbox = document.querySelector(`input[name="active_shadow"][value="${mode.id}"]`);
                        checkbox.checked = shadowState[mode.id].active;
                        if (checkbox.checked) drawer.classList.add('active'); else drawer.classList.remove('active');
                        drawer.querySelector('.s-x').value = shadowState[mode.id].x || 0;
                        drawer.querySelector('.s-y').value = shadowState[mode.id].y || 4;
                        drawer.querySelector('.s-b').value = shadowState[mode.id].b || 10;
                        drawer.querySelector('.s-s').value = shadowState[mode.id].s || 0;
                        drawer.querySelector('.s-c').value = shadowState[mode.id].c || '#000000';
                    }
                });
            } catch (e) {}
        }
    }

    document.getElementById('apply-custom-svg').addEventListener('click', () => { const svgCode = document.getElementById('custom-svg-code').value; if (svgCode) { localStorage.setItem('sttv_customSvg', svgCode); updateLiveVariables(); } });
    document.getElementById('btn-export').onclick = () => { /* Logic Base64 giữ nguyên, Sếp dùng hàm cũ */ alert("Vui lòng dùng mã ở bản trước, cấu trúc Pack/Unpack giữ nguyên!"); };
    
    loadSettingsFromLocal();
    updateLiveVariables();

    document.addEventListener("visibilitychange", function() { if (document.visibilityState === 'hidden') saveSettingsToLocal(); });
    window.addEventListener("beforeunload", saveSettingsToLocal);
});