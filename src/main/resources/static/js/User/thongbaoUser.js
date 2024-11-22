// Import các module cần thiết
import { getToken } from '../Share/localStorageService.js';

// Hàm tải thông báo
export function loadNotifications() {
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);
    const token = getToken(); // Lấy token từ localStorage
    console.log("Token kết nối WebSocket:", token); // Debug token
    if (!token) {
        console.error("Không tìm thấy token");
        return;
    }

    client.connect({ Authorization: `Bearer ${token}` }, () => {
        client.send('/app/getMyNoti', {}, JSON.stringify({}));
        console.log("Yêu cầu nhận thông báo đã được gửi"); // Debug gửi yêu cầu
        client.subscribe('/topic/getNotification', (message) => {
            console.log("Đã nhận thông báo:", message.body); // Debug thông báo nhận được
            const notifications = JSON.parse(message.body);
            renderNotifications(notifications);
        });
    }, (error) => {
        console.error("WebSocket connection error:", error);
    });
}

// Hàm hiển thị thông báo
function renderNotifications(notifications) {
    console.log("Render thông báo:", notifications); // Debug thông báo sẽ được render
    const notiContainer = document.getElementById("notification-list");
    notiContainer.innerHTML = ""; // Xóa nội dung cũ

    notifications.result.forEach((noti) => {
        const oneNotiBox = document.createElement('div');
        oneNotiBox.className = 'oneNotiBox';
        oneNotiBox.setAttribute('data-id', noti.id);

        // Nội dung thông báo
        oneNotiBox.innerHTML = `
            <div class="h-group">
                <img src="../../static/images/icons/Downloading%20Updates%20black.png" alt="">
                <div class="noti-header">${noti.title}</div>
            </div>
            <div class="noti-body">${noti.content}</div>
            <div class="d-group">
                <div class="i-group">
                    <img src="../../static/images/icons/Clock%20gray.png" alt="">
                    <div class="noti-time">${formatDateTime(noti.dateTime)}</div>
                </div>
                ${noti.link ? `<a href="${noti.link}" target="_blank">Xem thêm</a>` : ''}
            </div>
        `;

        // Thêm thông báo vào container
        notiContainer.appendChild(oneNotiBox);
    });
}

// Hàm định dạng ngày giờ
function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${hours}:${minutes}PM ${day}/${month}/${year}`;
}

// Sự kiện khi trang được tải
document.addEventListener("DOMContentLoaded", () => {
    console.log("Trang đã được tải xong"); // Debug khi trang tải xong
    loadNotifications();
});
