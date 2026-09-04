document.addEventListener("DOMContentLoaded", () => {
    // 1. Tải Dữ liệu Json & Vẽ Giao diện
    fetch('data.json')
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById('control-panel');
            data.forEach(item => {
                const a = document.createElement('a');
                a.className = 'glass-btn';
                a.href = item.action; // Gửi tín hiệu sang QuickControl
                
                a.innerHTML = `
                    <div class="icon-box">${item.svg}</div>
                    <span class="label">${item.title}</span>
                `;
                container.appendChild(a);
            });
        });

    // 2. Xử lý Đóng/Mở Bảng Cài Đặt
    const modal = document.getElementById('settings-modal');
    document.getElementById('open-settings').onclick = () => modal.classList.add('active');
    document.getElementById('close-settings').onclick = () => modal.classList.remove('active');
});
