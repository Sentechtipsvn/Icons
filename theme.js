// Hàm chuyển đổi HEX sang RGBA để chỉnh độ trong suốt nền
function hexToRgba(hex, opacity) {
    let r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
}

// Hàm áp dụng CSS Variables lên HTML
function applyTheme(config) {
    const root = document.documentElement;
    root.style.setProperty('--main-color', config.mainColor);
    root.style.setProperty('--btn-bg', hexToRgba(config.bgColor, config.bgOpacity));
    root.style.setProperty('--shadow-blur', config.shadowBlur + 'px');
    root.style.setProperty('--shadow-spread', config.shadowSpread + 'px');
    root.style.setProperty('--border-radius', config.radius + 'px');
    root.style.setProperty('--font-size', config.fontSize + 'px');
}

// Khởi chạy khi Webclip mở lên
document.addEventListener("DOMContentLoaded", () => {
    // Load cấu hình đã lưu (nếu có)
    const savedConfig = JSON.parse(localStorage.getItem('webclipTheme')) || {
        mainColor: "#ffffff", bgColor: "#ffffff", bgOpacity: 15,
        shadowBlur: 16, shadowSpread: 0, radius: 25, fontSize: 14
    };

    // Áp dụng ngay giao diện
    applyTheme(savedConfig);

    // Bắt sự kiện thanh trượt (Live preview)
    const inputs = {
        mainColor: document.getElementById('val-color'),
        bgColor: document.getElementById('val-bg'),
        bgOpacity: document.getElementById('val-bg-opacity'),
        shadowBlur: document.getElementById('val-shadow-blur'),
        shadowSpread: document.getElementById('val-shadow-spread'),
        radius: document.getElementById('val-radius'),
        fontSize: document.getElementById('val-font-size')
    };

    // Set giá trị mặc định cho các thanh trượt theo LocalStorage
    Object.keys(inputs).forEach(key => {
        if(inputs[key]) inputs[key].value = savedConfig[key];
    });

    // Lắng nghe sự kiện kéo thả và lưu lại
    document.getElementById('settings-modal').addEventListener('input', () => {
        const newConfig = {
            mainColor: inputs.mainColor.value,
            bgColor: inputs.bgColor.value,
            bgOpacity: inputs.bgOpacity.value,
            shadowBlur: inputs.shadowBlur.value,
            shadowSpread: inputs.shadowSpread.value,
            radius: inputs.radius.value,
            fontSize: inputs.fontSize.value
        };
        applyTheme(newConfig);
        localStorage.setItem('webclipTheme', JSON.stringify(newConfig)); // Lưu vĩnh viễn
    });
});
