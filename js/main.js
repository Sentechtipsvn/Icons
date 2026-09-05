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

        // --- Logic Đọc mảng vị trí lưu trữ (Reordering) ---
        let renderArray = data.buttons;
        const savedOrder = localStorage.getItem('sttv_iconOrder');
        if (savedOrder) {
            const orderIds = JSON.parse(savedOrder);
            renderArray = orderIds.map(id => data.buttons.find(b => b.id === id)).filter(b => b !== undefined);
            // Thêm các nút mới nếu có trong data mà chưa có trong bộ nhớ
            data.buttons.forEach(b => { if(!renderArray.includes(b)) renderArray.push(b); });
        }

        if (renderArray && renderArray.length > 0) {
            renderArray.forEach(item => {
                const btn = document.createElement('a');
                btn.className = 'glass-btn';
                btn.href = item.action;
                btn.dataset.id = item.id;
                btn.setAttribute('draggable', true);
                
                const localizedTitle = translations[item.title_key] || item.title || 'Phím tắt';
                btn.innerHTML = `<div class="icon-box">${item.svg}</div><span class="label">${localizedTitle}</span>`;
                container.appendChild(btn);
            });
        }

        // --- HỆ THỐNG KÉO THẢ SẮP XẾP ---
        const btnEditLayout = document.getElementById('btn-edit-layout');
        let editMode = false;
        
        btnEditLayout.addEventListener('click', () => {
            editMode = !editMode;
            document.body.classList.toggle('edit-mode', editMode);
            btnEditLayout.style.background = editMode ? 'red' : '';
            btnEditLayout.innerHTML = editMode ? 'Xong' : '🔄 Sắp xếp';
            // Vô hiệu hóa link khi sửa
            document.querySelectorAll('.glass-btn').forEach(b => {
                b.onclick = editMode ? (e) => e.preventDefault() : null;
            });
        });

        // HTML5 Drag and Drop Events
        let draggedItem = null;
        container.addEventListener('dragstart', (e) => {
            if (!editMode) { e.preventDefault(); return; }
            draggedItem = e.target.closest('.glass-btn');
            draggedItem.classList.add('dragging');
        });
        
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (!editMode || !draggedItem) return;
            const afterElement = getDragAfterElement(container, e.clientY, e.clientX);
            if (afterElement == null) { container.appendChild(draggedItem); } 
            else { container.insertBefore(draggedItem, afterElement); }
        });
        
        container.addEventListener('dragend', () => {
            if (draggedItem) draggedItem.classList.remove('dragging');
            draggedItem = null;
            // Lưu mảng ID mới vào LocalStorage
            const newOrder = Array.from(container.querySelectorAll('.glass-btn')).map(b => b.dataset.id);
            localStorage.setItem('sttv_iconOrder', JSON.stringify(newOrder));
        });

        function getDragAfterElement(container, y, x) {
            const draggableElements = [...container.querySelectorAll('.glass-btn:not(.dragging)')];
            return draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offsetY = y - box.top - box.height / 2;
                const offsetX = x - box.left - box.width / 2;
                // Tính khoảng cách 2D để tìm phần tử gần nhất
                const distance = Math.sqrt(offsetY*offsetY + offsetX*offsetX);
                if (offsetY < 0 && distance < closest.distance) { return { distance: distance, element: child }; } 
                else { return closest; }
            }, { distance: Number.POSITIVE_INFINITY }).element;
        }

    } catch (e) { console.error("Lỗi:", e); }
});