// sidebar.js
import { getToken, removeToken } from "../Share/localStorageService.js";

export function PersonalInfo() {
    const token = getToken();
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);
    client.debug = function (str) {};

    client.connect({Authorization: `Bearer ${token}`}, function (frame) {
        client.send(`/app/getInfo/${token}`,{},JSON.stringify(token));
        client.subscribe(`/topic/getInfo/${token}`, function (data) {
            const response = JSON.parse(data.body);
            const perInfo = response.result;

            // Cập nhật thông tin vào sidebar
            // Cập nhật avatar nếu không rỗng
            const avatarElement = document.getElementById("avatar1");
            if (perInfo.avatar && perInfo.avatar.trim() !== "") {
                avatarElement.src = `../../static/images/User/${perInfo.avatar}`;
            }
            document.getElementById("username").innerText = perInfo.username || "Username";
            document.getElementById("point").innerText = `${perInfo.points || 0} xu`;
        });
    });
}

function logoutUser() {
    const token = getToken(); // Lấy token từ hàm getToken()

    // Dữ liệu gửi trong body của yêu cầu
    const logoutRequest = {
        token: token,
    };

    // Gửi yêu cầu POST đến API /logout
    fetch("http://localhost:8088/auth/logout", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Gửi token qua header Authorization
        },
        body: JSON.stringify(logoutRequest), // Chuyển đổi request thành chuỗi JSON
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json(); // Parse dữ liệu JSON từ phản hồi
        })
        .then((data) => {
            console.log("Logout response:", data);
            if (data.code === 1000) {
                console.log("Logout successful:", data.result);
                // Xử lý sau khi logout thành công (ví dụ: chuyển hướng đến trang đăng nhập)
                window.location.href = "/login"; // Thay đổi URL tùy theo ứng dụng của bạn
            } else {
                console.error("Logout failed with code:", data.code);
            }
        })
        .catch((error) => {
            console.error("Error during logout:", error); // Xử lý lỗi nếu xảy ra
        });
}


export function logout() {
    if (confirm('Xác nhận đăng xuất?')) {
        logoutUser();
        removeToken();
        window.location.href = 'index.html';
    }
}

document.addEventListener('sidebarLoaded', function() {
    PersonalInfo();

    // Gắn hàm logout vào window object để có thể gọi từ onclick
    window.logoutHandler = logout;
});