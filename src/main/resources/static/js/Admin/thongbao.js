// Mở/đóng bảng thông báo
function toggleNotificationPanel() {
    const panel = document.getElementById("notificationPanel");
    panel.style.display = panel.style.display === "block" ? "none" : "block";
}

// Tải danh sách thông báo
function loadNotifications() {
    const notifications = [
        "Tài khoản của bạn đã được cập mới vui lòng kiểm tra.",
        "Quản trị viên đã thêm tài khoản mới.",
    ];

    const notificationList = document.getElementById("notificationList");
    notificationList.innerHTML = ""; // Xóa thông báo cũ

    notifications.forEach((message, index) => {
        const li = document.createElement("li");

        // Tạo phần tử chứa nội dung thông báo
        const messageDiv = document.createElement("div");
        messageDiv.className = "message";
        messageDiv.textContent = message;

        // Tạo nút xóa
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "notification-delete-btn";
        deleteBtn.setAttribute("aria-label", "Delete notification");

        // Thêm sự kiện click cho nút xóa
        deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation(); // Ngăn chặn sự kiện click lan ra ngoài
            li.style.animation = "fadeOut 0.3s ease";
            setTimeout(() => {
                li.remove();
                updateNotificationCount();
            }, 300);
        });

        // Ghép các phần tử lại với nhau
        li.appendChild(messageDiv);
        li.appendChild(deleteBtn);
        notificationList.appendChild(li);
    });

    updateNotificationCount();
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