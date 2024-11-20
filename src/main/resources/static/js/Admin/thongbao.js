// Mở/đóng bảng thông báo
import {getToken} from "../Share/localStorageService.js";

export function toggleNotificationPanel() {
    const panel = document.getElementById("notificationPanel");
    panel.style.display = panel.style.display === "block" ? "none" : "block";
}
window.toggleNotificationPanel=toggleNotificationPanel;
// Tải danh sách thông báo

export function loadNotifications() {
    const token = getToken();
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);

    client.connect({ Authorization: `Bearer ${token}` }, function (frame) {
        client.debug = function (str) {}; // Tắt log debug

        // Gửi yêu cầu tải danh sách thông báo ban đầu
        client.send("/app/getMyNoti", {}, JSON.stringify({}));

        // Lắng nghe các thông báo mới từ server
        client.subscribe("/topic/getNotification", function (data) {
            const response = JSON.parse(data.body);
            let notifications = [];

            // Xử lý response.result là array hoặc single object
            if (Array.isArray(response.result)) {
                notifications = response.result;
            } else if (response.result) {
                notifications = [response.result];
            }
            console.log(notifications);

            const notificationList = document.getElementById("notificationList");
            //notificationList.innerHTML = ''; // Xóa danh sách cũ

            notifications.forEach((message) => {

                const li = document.createElement("li");
                // Tạo phần tử chứa nội dung thông báo
                const messageDiv = document.createElement("div");
                messageDiv.className = "message";
                messageDiv.textContent = message.content;

                const hiddenInput = document.createElement("input");
                hiddenInput.type = "hidden";
                hiddenInput.value = message.id; // Gán giá trị id thông báo vào input
                hiddenInput.className = "notificationId";
                messageDiv.appendChild(hiddenInput);

                // Tạo nút xóa
                const deleteBtn = document.createElement("button");
                deleteBtn.className = "notification-delete-btn";
                deleteBtn.setAttribute("aria-label", "Delete notification");

                // Thêm sự kiện click cho nút xóa
                deleteBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    li.style.animation = "fadeOut 0.3s ease";
                    setTimeout(() => {
                        li.remove();
                        const hiddenInput = li.querySelector(".notificationId");
                        const id = hiddenInput ? hiddenInput.value : null;
                        console.log(id);
                        updateNotificationCount();
                    }, 300);
                });

                // Ghép các phần tử lại với nhau
                li.appendChild(messageDiv);
                li.appendChild(deleteBtn);

                // Thêm animation cho thông báo mới
                li.style.animation = "fadeIn 0.3s ease";

                // Thêm thông báo mới vào đầu danh sách
                notificationList.prepend(li);
            });

            updateNotificationCount();
        });
    });
}


// Cập nhật số lượng thông báo
function updateNotificationCount() {
    const notificationCount = document.getElementById("notificationCount");
    const currentCount = document.querySelectorAll("#notificationList li").length;
    notificationCount.textContent = currentCount;

    // Ẩn badge khi không có thông báo
    if (currentCount === 0) {
        notificationCount.style.display = "none";
    } else {
        notificationCount.style.display = "flex";
    }
}

// Thêm animation cho việc xóa thông báo
const style = document.createElement("style");
style.textContent = `
  @keyframes fadeOut {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(30px); }
  }
`;
document.head.appendChild(style);

// Gọi hàm khi trang được tải
document.addEventListener("DOMContentLoaded", loadNotifications);
// Hiển thị số lượng thông báo chưa đọc
const notificationCount = document.getElementById("notificationCount");
notificationCount.textContent = notifications.length;

// Gọi hàm khi trang được tải
document.addEventListener("DOMContentLoaded", loadNotifications);