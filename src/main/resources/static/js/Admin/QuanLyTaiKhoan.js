import {getToken} from "../Share/localStorageService.js";

function checkStatus(isBanned, banUntil){
    var status;
    var styleBan ="display: none";
    var styleUnBan ="display: inline-block";
    if (isBanned) {
        if (banUntil) {
            const banUntilDate = new Date(banUntil);
            const today = new Date();
            const timeDiff = banUntilDate - today; // Tính khoảng cách thời gian
            const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // Chuyển đổi thành số ngày

            if (daysRemaining > 0) {
                status = `${daysRemaining} days banned`; // Hiển thị số ngày bị cấm
            }
        } else {
            status = "PERMANENT"; // Nếu `banUntil` là null
        }
        styleBan = "display: none";
        styleUnBan = "display: inline-block";
    } else {
        status = "Active";
        styleBan = "display: inline-block";
        styleUnBan = "display: none";
    }

    const data = {
        status: status,
        styleBan: styleBan,
        styleUnBan: styleUnBan,
    }
    return data;
}


export function fetchAllAccounts() {
    const token = getToken();
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);
    client.debug = function (str) {
    };
    client.connect(
        {Authorization: `Bearer ${token}`}, function (frame) {

            client.send("/app/allAccounts", {}, JSON.stringify({}));
            client.subscribe('/topic/accounts', function (data) {
                try {
                    const response = JSON.parse(data.body);
                    const accounts = response.result;

                    if (Array.isArray(accounts)) {
                        let i = 1;
                        const tbody = document.querySelector('.user-table tbody');
                        tbody.innerHTML = '';
                        accounts.forEach(account => {
                            const row = document.createElement('tr');
                           const status = checkStatus(account.banned,account.banUntil);
                            row.innerHTML = `
                            <td>${i}</td>
                            <td>${account.name}</td>
                            <td>${account.email}</td>
                            <td class="password-cell">
                                <span class="password-text">${account.points}</span>
                            </td>
                            <td id="userStatus${account.id}">${status.status}</td>
                            <td>
                                <button class="edit-button" onclick = "openModal('${account.id}', '${account.name}', '${account.email}', '${account.points}')">
                                <img src="../../static/images/bxs-edit.svg" alt="Edit" />
                                </button>
                                <button class="status-button unlocked" 
                                onclick= "openBanModal('${account.id}','${account.name}', '${account.email}')" 
                                id="banButton${account.id}"
                                style="${status.styleBan}"
                                >
                                    <img src="../../static/images/lock-alt-solid-24.png" alt="Lock" />
                                </button>
                                <button
                                  class="status-button unlocked"
                                  onclick="openUnbanModal('${account.id}')"
                                  id="unbanButton${account.id}"
                                  style="${status.styleUnBan}"
                                >
                                  <img src="../../static/images/lock-open-alt-solid-24.png" alt="Unlock" />
                                </button>
                            </td>
                        `;
                            tbody.appendChild(row);
                            i++;
                        });
                    }
                } catch (error) {
                    console.error("Error processing response:", error);
                }
            });
        },
        function (error) {
            console.error("STOMP connection error:", error);
        }
    );

}

export function openModal(id, name, email, password) {
    const modal = document.getElementById("editModal");
    document.getElementById("accId").value = id;
    document.getElementById("customerName").value = name;
    document.getElementById("customerEmail").value = email;
    document.getElementById("customerPassword").value = password;
    modal.style.display = "block";
}
window.openModal = openModal;

export function closeModal() {
    const modal = document.getElementById("editModal");
    modal.style.display = "none";
}
window.closeModal=closeModal;


document.addEventListener("DOMContentLoaded", function () {
    // Thêm xử lý sự kiện cho nút search
    const searchButton = document.getElementById("accButton");
    const searchInput = document.getElementById("searchAcc");

    // Kiểm tra xem các phần tử có tồn tại trước khi gán sự kiện
    if (searchButton && searchInput) {
        searchButton.addEventListener("click", function () {
            const query = searchInput.value;
            searchAccount(query)
        });

        // Sự kiện nhấn Enter trên ô input
        searchInput.addEventListener("keypress", function (e) {
            if (e.key === "Enter") {
                searchButton.click();
            }
        });
    }
});

function searchAccount(keyWord) {
    const token = getToken();
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);
    client.connect({Authorization: `Bearer ${token}`}, function (frame) {
        client.debug = function (str) {};
        client.send(`/app/findAcc/${keyWord}`,{},JSON.stringify(keyWord));
        client.subscribe('/topic/findAccount',function (data) {

            const response = JSON.parse(data.body);
            const accounts = response.result
            if(Array.isArray(accounts)) {
                var i = 1;
                const tbody = document.querySelector('.user-table tbody');
                tbody.innerHTML = ''; // Xóa nội dung cũ trong bảng
                accounts.forEach(account => {
                    const row = document.createElement('tr');
                    const status = checkStatus(account.banned,account.banUntil);
                    row.innerHTML = `
                            <td>${i}</td>
                            <td>${account.name}</td>
                            <td>${account.email}</td>
                            <td class="password-cell">
                                <span class="password-text">${account.points}</span>
                            </td>
                            <td id="userStatus${account.id}">${status.status}</td>
                            <td>
                                <button class="edit-button" onclick = "openModal('${account.id}', '${account.name}', '${account.email}', '${account.points}')">
                                <img src="../../static/images/bxs-edit.svg" alt="Edit" />
                                </button>
                                <button class="status-button unlocked" 
                                onclick= "openBanModal('${account.id}','${account.name}', '${account.email}')" 
                                id="banButton${account.id}"
                                style="${status.styleBan}"
                                >
                                    <img src="../../static/images/lock-alt-solid-24.png" alt="Lock" />
                                </button>
                                <button
                                  class="status-button unlocked"
                                  onclick="openUnbanModal('${account.id}')"
                                  id="unbanButton${account.id}"
                                  style="${status.styleUnBan}"
                                >
                                  <img src="../../static/images/lock-open-alt-solid-24.png" alt="Unlock" />
                                </button>
                            </td>
                        `;
                    tbody.appendChild(row);
                    i++;
                });
            }else {
                console.error("Expected an array but received:", accounts);
            }
        });
    });
}


// Hàm xác nhận mở khóa tài khoản
export function confirmUnban() {
    const userId = document
        .getElementById("unbanModal")
        .getAttribute("data-user-id");
    console.log(`User ID ${userId} has been unbanned.`);
    const message =`/app/unBanAccount/${userId}`;
    const topic ="/topic/unBan";
    const banStatus=""
    editStatusAccount(message, topic,banStatus);
    closeUnbanModal();
}
window.confirmUnban = confirmUnban;


// Mở modal khóa tài khoản với thông tin người dùng
export function openBanModal(userId, userName, userEmail) {
    document.getElementById("banUserName").textContent = userName;
    document.getElementById("banUserEmail").textContent = userEmail;
    document.getElementById("banModal").style.display = "block";
    document.getElementById("banModal").setAttribute("data-user-id", userId);
}
window.openBanModal = openBanModal;

// Đóng modal khóa tài khoản
export function closeBanModal() {
    document.getElementById("banModal").style.display = "none";
}
window.closeBanModal = closeBanModal;


// Áp dụng lệnh khóa tài khoản
export function applyBan() {
    const userId = document
        .getElementById("banModal")
        .getAttribute("data-user-id");
    const duration = document.getElementById("banDuration").value;
    var banStatus;
    if(duration ==="10"){
        banStatus = "TEMPORARY_10_DAYS";
    }else if(duration ==="30"){
        banStatus = "TEMPORARY_30_DAYS";
    }else if(duration ==="permanent"){
        banStatus = "PERMANENT";
    }
    const message =`/app/banAccount/${userId}/ban`;
    const topic ="/topic/banAcc";
    editStatusAccount(message, topic,banStatus);
    closeBanModal();
}
window.applyBan = applyBan;

function editStatusAccount(message,topic,banStatus){
    const token = getToken();
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);
    client.debug = function (str) {};
    client.connect({Authorization: `Bearer ${token}`}, function (frame) {
        client.subscribe(topic, function (message) {
            window.location.reload();
        })
        client.send(message,{},JSON.stringify(banStatus));
    })
}

// Mở modal mở khóa tài khoản
export function openUnbanModal(userId) {
    document.getElementById("unbanModal").style.display = "block";
    document.getElementById("unbanModal").setAttribute("data-user-id", userId);
}

window. openUnbanModal=  openUnbanModal;


// Đóng modal mở khóa tài khoản
export function closeUnbanModal() {
    document.getElementById("unbanModal").style.display = "none";
}
window.closeUnbanModal = closeUnbanModal;





// Hàm đóng modal chỉnh sửa


function sendData(id,data){
    const token = getToken();
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);
    client.connect({Authorization: `Bearer ${token}`}, function (frame) {
        client.debug = function (str) {};
        client.subscribe('/topic/accountUpdate', function (message) {
        })
        client.send(`/app/updateAcc/${id}`,{},JSON.stringify(data));
    })
}

document.getElementById('updateAcc').addEventListener('click', saveChanges);

// Hàm lưu thay đổi thông tin khách hàng
export function saveChanges() {
    const customerId = document.getElementById("accId").value;
    const customerName = document.getElementById("customerName").value;
    const customerEmail = document.getElementById("customerEmail").value;
    const customerPoint = document.getElementById("customerPassword").value;
    console.log("ID: ", customerId);
    var customerData = {
        name: customerName,
        points: customerPoint
    }
    console.log(customerData);
    sendData(customerId,customerData);
    closeModal();
}