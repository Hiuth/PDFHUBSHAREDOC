// Import necessary modules
import { getToken } from '../Share/localStorageService.js';

// Function to request notification permission
function requestNotificationPermission() {
    if (!("Notification" in window)) {
        console.error("Browser does not support notifications");
        return false;
    }

    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }
    return Notification.permission === "granted";
}

// Function to display browser notification
function showBrowserNotification(title, body, link) {
    if (requestNotificationPermission()) {
        const notification = new Notification(title, {
            body: body,
            icon: '../../static/images/icons/logo.png'
        });

        if (link) {
            notification.onclick = () => {
                window.open(link, '_blank');
            };
        }
    }
}

// Function to initialize notification count
function initializeNotificationCount() {
    const notiButton = document.querySelector('.noti-button');
    if (notiButton) {
        notiButton.style.display = 'flex'; // Show notification button
    }
}

// Function to update notification count
function updateNotificationCount(count, isNew = false) {
    const notiCountElement = document.querySelector('.noti-count');
    if (notiCountElement) {
        notiCountElement.textContent = count;
        notiCountElement.style.display = count > 0 ? 'block' : 'none';

        if (isNew) {
            notiCountElement.classList.add('new');
            setTimeout(() => {
                notiCountElement.classList.remove('new');
            }, 3000); // Remove pulse effect after 3 seconds
        }
    }
}

// Function to load and render notifications
export function loadNotifications() {
    return new Promise((resolve, reject) => {
        const token = getToken();
        const socket = new SockJS("http://localhost:8088/ws");
        const client = Stomp.over(socket);
        client.debug = null; // Tắt debug hoàn toàn

        // Kiểm tra token
        if (!token) {
            reject(new Error("Token not found"));
            return;
        }

        // Hàm để lấy thông tin cá nhân
        const getPersonalInfo = () => {
            return new Promise((infoResolve, infoReject) => {
                client.send(`/app/getInfo/${token}`, {}, JSON.stringify({ token }));

                const infoSubscription = client.subscribe(`/topic/getInfo/${token}`, function (data) {
                    try {
                        const response = JSON.parse(data.body);
                        const info = response.result;
                        infoSubscription.unsubscribe();
                        infoResolve(info.accountId);
                    } catch (error) {
                        infoSubscription.unsubscribe();
                        infoReject(error);
                    }
                });
            });
        };

        // Kết nối và thiết lập việc nhận thông báo
        client.connect({ Authorization: `Bearer ${token}` }, async function () {
            try {
                // Khởi tạo số lượng thông báo
                initializeNotificationCount();

                // Lấy accountId
                const accountId = await getPersonalInfo();

                // Đăng ký nhận thông báo liên tục
                const notificationSubscription = client.subscribe(`/topic/getNotification/${accountId}`, function (data) {
                    try {
                        const notifications = JSON.parse(data.body);

                        // Cập nhật số lượng thông báo ngay lập tức
                        if (notifications.result) {
                            updateNotificationCount(notifications.result.length);
                        }

                        // Render thông báo trong dropdown
                        renderNotifications(notifications);

                        // Hiển thị thông báo mới nhất dưới dạng browser notification
                        if (notifications.result && notifications.result.length > 0) {
                            const latestNoti = notifications.result[0];
                            showBrowserNotification(latestNoti.title, latestNoti.content, latestNoti.link);
                        }

                        // Xử lý thông báo theo cách cũ
                        handleNotifications(notifications.result);
                    } catch (error) {
                        console.error("Error processing notification:", error);
                    }
                });

                // Gửi yêu cầu lấy thông báo ban đầu
                client.send(`/app/getMyNoti/${accountId}`, {}, JSON.stringify({ accountId }));

                // Resolve promise để cho biết đã kết nối thành công
                resolve({
                    accountId,
                    disconnect: () => {
                        notificationSubscription.unsubscribe();
                        client.disconnect();
                    }
                });

            } catch (error) {
                console.error("Error setting up notifications:", error);
                reject(error);
            }
        }, function (error) {
            // Xử lý lỗi kết nối
            console.error("Connection error:", error);
            reject(error);
        });
    });
}

// Cách sử dụng
async function setupNotificationListener() {
    try {
        const { accountId, disconnect } = await loadNotifications1();
        console.log(`Notification listener connected with accountId: ${accountId}`);

        // Nếu muốn ngắt kết nối sau này
        // disconnect();
    } catch (error) {
        console.error("Failed to setup notification listener:", error);
    }
}

// Gọi hàm setup
setupNotificationListener();

export function deleteNotification2(id) {
    console.log(id);
    const token = getToken();
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);
    client.debug = function (str) {};
    client.connect({ Authorization: `Bearer ${token}` }, function (frame) {
        client.send(`/app/deleteNoti/${id}`, {}, JSON.stringify({ id }));
        client.subscribe('/topic/deleteNotification', function (data) {
            const notificationElement = document.querySelector(`.oneNotiBox[data-id="${id}"]`);
            if (notificationElement) {
                // Thêm lớp fade-out để kích hoạt animation
                notificationElement.classList.add("fade-out");

                // Đợi animation hoàn tất trước khi xóa
                setTimeout(() => {
                    notificationElement.remove();

                    // Cập nhật số lượng thông báo
                    const notiCountElement = document.querySelector('.noti-count');
                    if (notiCountElement) {
                        let currentCount = parseInt(notiCountElement.textContent, 10) || 0;
                        if (currentCount > 0) {
                            currentCount -= 1; // Giảm số lượng thông báo
                            notiCountElement.textContent = currentCount;
                            notiCountElement.style.display = currentCount > 0 ? 'block' : 'none';
                        }
                    }
                }, 500); // Thời gian khớp với `transition` trong CSS
            }
        });
    });
}

window. deleteNotification2= deleteNotification2

// Function to render notifications
function renderNotifications(notifications) {
    const notiContainer = document.getElementById("notification-list");
    notiContainer.innerHTML = ""; // Clear existing notifications

    // Sort notifications by date in descending order
    notifications.result.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

    notifications.result.forEach((noti) => {
        const oneNotiBox = document.createElement('div');
        oneNotiBox.className = 'oneNotiBox';
        oneNotiBox.setAttribute('data-id', noti.id);

        // Notification content
        oneNotiBox.innerHTML = `
      <div class="h-group">
        <img src="../../static/images/icons/QuoteBlack.png" alt="">
        <div class="noti-title">${noti.title}</div>
      </div>
      <div class="noti-content">${noti.content}</div>
      <div class="d-group">
        <div class="i-group">
          <img src="../../static/images/icons/Clock%20gray.png" alt="">
          <div class="noti-time">${formatDateTime(noti.dateTime)}</div>
        </div>
        <button id="noti-link" onclick="deleteNotification2('${noti.id}')">Xóa thông báo</button> 
      </div>
    `;

        // Add the notification to the container
        notiContainer.appendChild(oneNotiBox);
    });
}

// Function to format date and time
function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${hours}:${minutes}PM ${day}/${month}/${year}`;
}

// Event listener when the page loads
document.addEventListener("DOMContentLoaded", () => {
    // Request notification permission
    requestNotificationPermission();

    // Load notifications
    loadNotifications();
});