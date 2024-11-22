// sidebar.js
import { getToken, removeToken } from "../Share/localStorageService.js";

export function PersonalInfo() {
    const token = getToken();
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);
    client.debug = function (str) {};

    client.connect({Authorization: `Bearer ${token}`}, function (frame) {
        client.send("/app/getInfo");
        client.subscribe("/topic/getInfo", function (data) {
            const response = JSON.parse(data.body);
            const perInfo = response.result;

            // Cập nhật thông tin vào sidebar
            document.getElementById("username").innerText = perInfo.fullName || "Username";
            document.getElementById("point").innerText = `${perInfo.coin || 0} xu`;
        });
    });
}

export function logout() {
    if (confirm('Xác nhận đăng xuất?')) {
        removeToken();
        window.location.href = 'index.html';
    }
}

document.addEventListener('sidebarLoaded', function() {
    PersonalInfo();

    // Gắn hàm logout vào window object để có thể gọi từ onclick
    window.logoutHandler = logout;
});