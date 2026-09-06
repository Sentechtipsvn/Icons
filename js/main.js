const SUPPORTED_LANGS = ['ar', 'en-GB', 'en-US', 'vi-VN', 'zh-CN', 'zh-TW'];

async function loadLanguageData(langCode) {
    try {
        const response = await fetch(`Language/${langCode}.json`);
        if (!response.ok) throw new Error("Tệp không tồn tại");
        return await response.json();
    } catch (error) {
        if (langCode !== 'en-GB') {
            try { const fallbackRes = await fetch(`Language/en-GB.json`); return await fallbackRes.json(); } catch(e) {}
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
        
        if (document.getElementById('open-settings') && data.config && data.config.settings_icon) {
            document.getElementById('open-settings').innerHTML = data.config.settings_icon;
        }

        let renderArray = data.buttons;
        const savedOrder = localStorage.getItem('sttv_iconOrder');
        if (savedOrder) {
            const orderIds = JSON.parse(savedOrder);
            renderArray = orderIds.map(id => data.buttons.find(b => b.id === id)).filter(b => b !== undefined);
            data.buttons.forEach(b => { if(!renderArray.includes(b)) renderArray.push(b); });
        }

        if (renderArray && renderArray.length > 0) {
            renderArray.forEach(item => {
                const btn = document.createElement('a');
                btn.className = 'glass-btn';
                btn.href = item.action;
                btn.dataset.id = item.id;
                
                const localizedTitle = translations[item.title_key] || item.title || 'Phím tắt';
                btn.innerHTML = `<div class="icon-box">${item.svg}</div><span class="label">${localizedTitle}</span>`;
                container.appendChild(btn);
            });
        }

        // --- HỆ THỐNG KÉO THẢ CẢM ỨNG (TOUCH DRAG & DROP CHO iOS) ---
        const btnEditLayout = document.getElementById('btn-edit-layout');
        let editMode = false;
        
        btnEditLayout.addEventListener('click', () => {
            editMode = !editMode;
            document.body.classList.toggle('edit-mode', editMode);
            btnEditLayout.style.background = editMode ? 'red' : '';
            btnEditLayout.innerHTML = editMode ? 'Xong' : '🔄 Sắp xếp';
            document.querySelectorAll('.glass-btn').forEach(b => {
                b.onclick = editMode ? (e) => e.preventDefault() : null;
            });
        });

        let draggedItem = null;
        let ghostEl = null;

        function getDragAfterElement(y, x) {
            const draggableElements = [...container.querySelectorAll('.glass-btn:not(.dragging)')];
            return draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offsetY = y - box.top - box.height / 2;
                const offsetX = x - box.left - box.width / 2;
                const distance = Math.sqrt(offsetY*offsetY + offsetX*offsetX);
                if (offsetY < 0 && distance < closest.distance) { return { distance: distance, element: child }; } 
                else { return closest; }
            }, { distance: Number.POSITIVE_INFINITY }).element;
        }

        // Bắt sự kiện chạm ngón tay
        container.addEventListener('touchstart', (e) => {
            if (!editMode) return;
            const target = e.target.closest('.glass-btn');
            if (!target) return;
            
            draggedItem = target;
            draggedItem.classList.add('dragging');
            
            // Tạo phần tử ảo bay theo ngón tay
            ghostEl = draggedItem.cloneNode(true);
            ghostEl.style.position = 'absolute';
            ghostEl.style.zIndex = 1000;
            ghostEl.style.opacity = '0.8';
            ghostEl.style.transform = 'scale(1.1)';
            ghostEl.style.pointerEvents = 'none'; // Ngăn lỗi che khuất element
            document.body.appendChild(ghostEl);
            
            const touch = e.touches[0];
            ghostEl.style.left = (touch.pageX - ghostEl.offsetWidth / 2) + 'px';
            ghostEl.style.top = (touch.pageY - ghostEl.offsetHeight / 2) + 'px';
        }, {passive: false});
        
        // Bắt sự kiện di chuyển ngón tay
        container.addEventListener('touchmove', (e) => {
            if (!editMode || !draggedItem || !ghostEl) return;
            e.preventDefault(); // Ngăn cuộn trang khi đang kéo
            const touch = e.touches[0];
            
            // Di chuyển bóng mờ
            ghostEl.style.left = (touch.pageX - ghostEl.offsetWidth / 2) + 'px';
            ghostEl.style.top = (touch.pageY - ghostEl.offsetHeight / 2) + 'px';
            
            // Sắp xếp lại lưới DOM
            const afterElement = getDragAfterElement(touch.clientY, touch.clientX);
            if (afterElement == null) { container.appendChild(draggedItem); } 
            else { container.insertBefore(draggedItem, afterElement); }
        }, {passive: false});
        
        // Bắt sự kiện thả ngón tay
        container.addEventListener('touchend', () => {
            if (!editMode || !draggedItem) return;
            if (ghostEl) { document.body.removeChild(ghostEl); ghostEl = null; }
            draggedItem.classList.remove('dragging');
            draggedItem = null;
            
            // Lưu mảng ID mới vào LocalStorage
            const newOrder = Array.from(container.querySelectorAll('.glass-btn')).map(b => b.dataset.id);
            localStorage.setItem('sttv_iconOrder', JSON.stringify(newOrder));
        });

    } catch (e) { console.error("Lỗi:", e); }
});