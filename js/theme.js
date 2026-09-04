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
    
    SHADOW_MODES.forEach(mode => {
        const div = document.createElement('div');
        div.className = 'shadow-item';
        div.innerHTML = `
            <div class="shadow-header">
                <span data-i18n="${mode.nameKey}"></span>
                <input type="radio" name="active_shadow" value="${mode.id}" class="shadow-switch">
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

    document.getElementById('open-settings').onclick = () => document.getElementById('settings-drawer').classList.add('open');
    document.getElementById('close-settings').onclick = () => document.getElementById('settings-drawer').classList.remove('open');

    function updateLiveVariables() {
        root.style.setProperty('--bg-main', document.getElementById('val-bg-main').value);
        root.style.setProperty('--text-color', document.getElementById('val-text-color').value);
        root.style.setProperty('--frame-bg', document.getElementById('val-theme-frame').value);
        root.style.setProperty('--frame-size', document.getElementById('val-frame-size').value + 'px');
        root.style.setProperty('--svg-size', document.getElementById('val-svg-size').value + 'px');
        root.style.setProperty('--svg-color', document.getElementById('val-svg-color').value);

        const activeRadio = document.querySelector('input[name="active_shadow"]:checked');
        if (activeRadio) {
            document.querySelectorAll('.shadow-drawer').forEach(d => d.classList.remove('active'));
            const drawer = document.getElementById(`drawer-${activeRadio.value}`);
            drawer.classList.add('active');

            const mode = SHADOW_MODES.find(m => m.id === activeRadio.value);
            let shadowStr = mode.template
                .replace('{x}', drawer.querySelector('.s-x').value)
                .replace('{y}', drawer.querySelector('.s-y').value)
                .replace('{b}', drawer.querySelector('.s-b').value)
                .replace('{s}', drawer.querySelector('.s-s').value)
                .replace('{c}', drawer.querySelector('.s-c').value);

            root.style.setProperty('--btn-shadow', shadowStr);
        }
    }

    document.getElementById('settings-drawer').addEventListener('input', updateLiveVariables);
    document.querySelector('input[name="active_shadow"][value="outer"]').checked = true;
    updateLiveVariables();
});