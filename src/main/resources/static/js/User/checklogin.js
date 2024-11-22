import { getToken } from "../Share/localStorageService.js";
// Đồng thời cũng lắng nghe DOMContentLoaded để đảm bảo code vẫn chạy trong trường hợp
// sự kiện headerLoaded không được kích hoạt
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
});

function checkLoginStatus() {
    const notiButton = document.querySelector(".noti-button");
    const menuButton = document.querySelector(".menu-button");
    const register = document.querySelector(".register-button");
    const login = document.querySelector(".login-button");

    const token = getToken();

    if (token) {
        // Có token - hiển thị các nút liên quan đến người dùng đã đăng nhập
        notiButton.style.display = "";
        menuButton.style.display = "";
        register.style.display = "none";
        login.style.display = "none";


        // Không cần thêm event listener ở đây vì đã có trong file paste.txt
    } else {
        // Không có token - ẩn các nút
        notiButton.style.display = "none";
        menuButton.style.display = "none";

        register.style.display = "";
        login.style.display = "";
    }
}

export { checkLoginStatus };

// Luôn đảm bảo chạy khi DOM đã tải
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkLoginStatus);
} else {
    checkLoginStatus();
}