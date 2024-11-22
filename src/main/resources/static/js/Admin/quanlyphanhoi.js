import {getToken} from "../Share/localStorageService.js";

document.addEventListener("DOMContentLoaded", () => {
    fetchAllFeedBack();
})

function fetchAllFeedBack() {
    const token = getToken();
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);
    client.debug = function (str) {};
    client.connect({Authorization: `Bearer ${token}`}, function (frame) {
        //console.log("Connected: " + frame);
        client.send("/app/allFeed");  // Gửi yêu cầu WebSocket để lấy danh sách tài khoản
        // Nhận danh sách tài khoản từ server và hiển thị trong bảng
        client.subscribe('/topic/allFeedBack', function (data) {
            const response = JSON.parse(data.body);
            const feedBacks = response.result
            //console.log(feedBacks);
            if(Array.isArray(feedBacks)) {
                var i = 1;
                const tbody = document.querySelector('.feedback-table tbody');
                tbody.innerHTML = ''; // Xóa nội dung cũ trong bảng
                feedBacks.forEach(feed => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                     <tr>
                      <td>${i}</td>
                      <td>${feed.account.name}</td>
                      <td>${feed.account.email}</td>
                      <td>${feed.type}</td>
                      <td>${feed.feedback}</td>
                      <td>${feed.status}</td>
                         <input type="hidden" name="feedId" value="${feed.id}" />
                        <input type="hidden" name="otherId" value="${feed.otherId}" />
                      <td><button class="btn-process">Xử lý</button></td>
                    </tr>
                `;
                    tbody.appendChild(row);
                    i++;
                });
            }else {
                console.error("Expected an array but received:", feedBacks);
            }
        });
    });
}


function adminUpdateFeedBack(id,status, response) {
    const token = getToken();
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);
    const feedBacks={
        id: id,
        status: status,
        responseFromAdmin: response
    }
    client.connect({Authorization: `Bearer ${token}`}, function (frame) {
        //console.log("Connected: " + frame);
        client.send("/app/adminUpdateFeed",{},JSON.stringify(feedBacks));  // Gửi yêu cầu WebSocket để lấy danh sách tài khoản
        // Nhận danh sách tài khoản từ server và hiển thị trong bảng
        client.subscribe('/topic/adminUpdateFeedBack', function (data) {
            window.location.reload();
        });
    });
}

function adminSendNotification(feedId,type,content,docId) {
    const token = getToken();
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);
    let feedType="";
    if(type==="Violating content of documents"){
        feedType="REPORT_DOCUMENT";
    }
    const Notification ={
        id: feedId,
        type: feedType,
        content:content,
        docId: docId
    }
    console.log(Notification);
    client.connect({Authorization: `Bearer ${token}`}, function (frame) {
        //console.log("Connected: " + frame);
        client.send(`/app/adminSendNoti`,{},JSON.stringify(Notification));  // Gửi yêu cầu WebSocket để lấy danh sách tài khoản
        // Nhận danh sách tài khoản từ server và hiển thị trong bảng
        client.subscribe('/topic/adminSendNotification', function (data) {
            window.location.reload();
        });
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const tabsTriggers = document.querySelectorAll(".tabs-trigger");
    const tabsContents = document.querySelectorAll(".tabs-content");
    const modal = document.getElementById("modal");
    const btnCancel = document.getElementById("btnCancel");
    const btnSubmit = document.getElementById("btnSubmit");
    const statusSelect = document.getElementById("statusSelect");
    const responseTextarea = document.getElementById("responseTextarea");
    let currentRow;

    // Xử lý chuyển đổi tab
    tabsTriggers.forEach((trigger) => {
        trigger.addEventListener("click", () => {
            const target = trigger.getAttribute("data-target");

            tabsTriggers.forEach((btn) => btn.classList.remove("active"));
            trigger.classList.add("active");

            tabsContents.forEach((content) => {
                content.classList.remove("active");
                if (content.id === target) content.classList.add("active");
            });
        });
    });

    // Xử lý nút "Xử lý" và mở modal
    document.addEventListener("click", (event) => {
        if (event.target.classList.contains("btn-process")) {
            currentRow = event.target.closest("tr");
            const senderName =
                currentRow.querySelector("td:nth-child(2)").textContent;
            const senderEmail =
                currentRow.querySelector("td:nth-child(3)").textContent;
            const content = currentRow.querySelector("td:nth-child(5)").textContent;
            const status = currentRow.querySelector("td:nth-child(6)").textContent;
            const feedType = currentRow.querySelector("td:nth-child(4)").textContent;
            const feedId = currentRow.querySelector('input[name="feedId"]').value;
            const otherId = currentRow.querySelector('input[name="otherId"]').value;
            // Điền nội dung động vào modal
            document.querySelector(".sender-name").textContent = senderName;
            document.querySelector(".sender-email").textContent = senderEmail;
            document.querySelector(".feedback-content").textContent = content;
            statusSelect.value = status;
            document.getElementById("feedbackId").value = feedId;
            checkTypeAndToggleButton(feedType);
            document.getElementById("docId").value = otherId;
            modal.style.display = "flex";
        }
    });

    // Đóng modal
    btnCancel.addEventListener("click", () => {
        modal.style.display = "none";
        resetModalFields();
    });

    // Xử lý gửi form
    btnSubmit.addEventListener("click", () => {
        const newStatus = statusSelect.value;
        const response = responseTextarea.value;
        const id = document.getElementById('feedbackId').value;
        // Cập nhật hàng trong bảng với trạng thái mới
        currentRow.querySelector("td:nth-child(6)").textContent = newStatus;
        adminUpdateFeedBack(id,newStatus,response);
        // Đóng modal và đặt lại các trường
        modal.style.display = "none";
        resetModalFields();
    });

    btnSendNoti.addEventListener("click", () => {
        const docId = document.getElementById('docId').value;
        const feedId = document.getElementById('feedbackId').value;
        const content = currentRow.querySelector("td:nth-child(5)").textContent;
        const feedType = currentRow.querySelector("td:nth-child(4)").textContent;
        adminSendNotification(feedId, feedType,content ,docId);
        modal.style.display = "none";
        resetModalFields();
    })

    // Cho phép đóng modal bằng cách nhấp bên ngoài hoặc nhấn phím 'Escape'
    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
            resetModalFields();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            modal.style.display = "none";
            resetModalFields();
        }
    });

    // Hàm đặt lại các trường trong modal
    function resetModalFields() {
        statusSelect.value = "Chưa xử lý";
        responseTextarea.value = "";
    }

    function checkTypeAndToggleButton(feedType) {
        const sendNotiButton = document.getElementById("btnSendNoti");
        if (feedType === "Another problem") {
            sendNotiButton.style.display = "none"; // Ẩn nút
        } else {
            sendNotiButton.style.display = "inline-block"; // Hiển thị nút
        }
    }
});


