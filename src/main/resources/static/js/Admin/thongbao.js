// Mở/đóng bảng thông báo
import {getToken} from "../Share/localStorageService.js";

function fetchAvatar(){
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);
    const token = getToken();
    client.debug = function (str) {};
    client.connect({Authorization: `Bearer ${token}`}, function (frame){
        client.send(`/app/getInfo/${token}`,{},JSON.stringify({token}));
        client.subscribe(`/topic/getInfo/${token}`, function (data) {
            const response = JSON.parse(data.body);
            const perInfo = response.result;
            //const url = "";
           // document.getElementById('avatar').src ='../../static/images/icons/avatar.png';
            document.querySelector('.dropdown-toggle').textContent = perInfo.fullName;
        })
    });

}
document.addEventListener("DOMContentLoaded", fetchAvatar);


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

    client.debug = function (str) {}; // Tắt log debug

    client.connect({ Authorization: `Bearer ${token}` }, function () {
        // Yêu cầu danh sách thông báo ban đầu
        client.send(`/app/getMyNoti/${token}`, {}, JSON.stringify({token}));

        // Lắng nghe các thông báo mới từ server
        client.subscribe(`/topic/getNotification/${token}`, function (data) {
            const response = JSON.parse(data.body);
            handleNotifications(response.result); // Xử lý thông báo
        });
    });
}

function handleNotifications(result) {
    let notifications = [];
    if (Array.isArray(result)) {
        notifications = result;
    } else if (result) {
        notifications = [result];
    }

    const notificationList = document.getElementById("notificationList");

    // Thêm thông báo mới vào danh sách
    notifications.forEach((message) => {
        const existingNotification = Array.from(
            notificationList.querySelectorAll("input.notificationId")
        ).find((input) => input.value === String(message.id));

        // Chỉ thêm thông báo mới nếu chưa tồn tại
        if (!existingNotification) {
            const li = document.createElement("li");

            const messageDiv = document.createElement("div");
            messageDiv.className = "message";
            messageDiv.textContent = message.content;

            const hiddenInput = document.createElement("input");
            hiddenInput.type = "hidden";
            hiddenInput.value = message.id;
            hiddenInput.className = "notificationId";
            messageDiv.appendChild(hiddenInput);

            const deleteBtn = document.createElement("button");
            deleteBtn.className = "notification-delete-btn";
            deleteBtn.setAttribute("aria-label", "Delete notification");
            deleteBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                li.style.animation = "fadeOut 0.3s ease";
                setTimeout(() => {
                    li.remove();
                    deleteNotification(hiddenInput.value); // Xóa thông báo
                    updateNotificationCount(); // Cập nhật chấm đỏ
                }, 300);
            });

            li.appendChild(messageDiv);
            li.appendChild(deleteBtn);
            li.style.animation = "fadeIn 0.3s ease";

            notificationList.prepend(li); // Thêm thông báo mới vào đầu danh sách
        }
    });

    updateNotificationCount(); // Cập nhật chấm đỏ sau mỗi lần xử lý
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


function deleteNotification(id) {
    const token = getToken();
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);
    client.connect({ Authorization: `Bearer ${token}` }, function (frame) {
        client.send(`/app/deleteNoti/${id}`,{}, JSON.stringify({id}));
        client.subscribe('/topic/deleteNotification', function (data) {

        })
    })
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



