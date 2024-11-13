
// function fetchAllAccounts() {
//     const socket = new SockJS("http://localhost:8088/ws");
//     const client = Stomp.over(socket);
//     client.connect({}, function (frame) {
//         client.debug = function (str) {};
//         //console.log("Connected: " + frame);
//         client.send("/app/allAccounts");  // Gửi yêu cầu WebSocket để lấy danh sách tài khoản
//
//         // Nhận danh sách tài khoản từ server và hiển thị trong bảng
//         client.subscribe('/topic/accounts', function (data) {
//             const response = JSON.parse(data.body);
//             const accounts = response.result
//             if(Array.isArray(accounts)) {
//                 var i = 1;
//                 const tbody = document.querySelector('.user-table tbody');
//                 tbody.innerHTML = ''; // Xóa nội dung cũ trong bảng
//                 accounts.forEach(account => {
//                     const row = document.createElement('tr');
//                     row.innerHTML = `
//                 <td>${i}</td>
//                 <td>${account.name}</td>
//                 <td>${account.email}</td>
//                 <td class="password-cell">
//                     <span class="password-text">${account.points}</span>
//                 </td>
//                 <td>Active</td>
//                 <td>
//                     <button class="edit-button" onclick = "openModal('${account.id}', '${account.name}', '${account.email}', '${account.points}')">
//                         <img src="/WebChiaSeTaiLieu/src/main/resources/static/images/bxs-edit.svg" alt="Edit" />
//                     </button>
//                     <button class="status-button unlocked" onclick= "toggleLockStatus('${account.id}')">
//                         <img src="/webchiasetailieu/src/main/resources/static/images/lock-open-alt-solid-24.png" alt="Lock" />
//                     </button>
//                 </td>
//                 `;
//                     tbody.appendChild(row);
//                     i++;
//                 });
//             }else {
//                 console.error("Expected an array but received:", accounts);
//             }
//         });
//     });
// }
import {getToken} from "../Share/localStorageService.js";

export function fetchAllAccounts() {
    const token = getToken();
    if (!token) {
        // Handle the case where the token is not available
        console.error('No token found. Please log in again.');
        return;
    }
    fetch("http://localhost:8088/account", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            const accounts = data.result;
            if (Array.isArray(accounts)) {
                let i = 1;
                const tbody = document.querySelector('.user-table tbody');
                tbody.innerHTML = ''; // Xóa nội dung cũ trong bảng
                accounts.forEach(account => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                    <td>${i}</td>
                    <td>${account.name}</td>
                    <td>${account.email}</td>
                    <td class="password-cell">
                        <span class="password-text">${account.points}</span>
                    </td>
                    <td>Active</td>
                    <td>
                        <button class="edit-button" onclick="openModal('${account.id}', '${account.name}', '${account.email}', '${account.points}')">
                            <img src="/WebChiaSeTaiLieu/src/main/resources/static/images/bxs-edit.svg" alt="Edit" />
                        </button>
                        <button class="status-button unlocked" onclick="toggleLockStatus('${account.id}')">
                            <img src="/webchiasetailieu/src/main/resources/static/images/lock-open-alt-solid-24.png" alt="Lock" />
                        </button>
                    </td>
                `;
                    tbody.appendChild(row);
                    i++;
                });
            } else {
                console.error("Expected an array but received:", accounts);
            }
        })
        .catch(error => {
            console.error("Error fetching accounts:", error);
        });
}




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
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);
    client.connect({}, function (frame) {
        client.debug = function (str) {};
        //console.log("Connected: " + frame);
        client.send(`/app/findAcc/${keyWord}`,{},JSON.stringify(keyWord));  // Gửi yêu cầu WebSocket để lấy danh sách tài khoản
        // Nhận danh sách tài khoản từ server và hiển thị trong bảng
        client.subscribe('/topic/findAccount',function (data) {
           // console.log("check");
            const response = JSON.parse(data.body);
            const accounts = response.result
            if(Array.isArray(accounts)) {
                var i = 1;
                const tbody = document.querySelector('.user-table tbody');
                tbody.innerHTML = ''; // Xóa nội dung cũ trong bảng
                accounts.forEach(account => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                <td>${i}</td>
                <td>${account.name}</td>
                <td>${account.email}</td>
                <td class="password-cell">
                    <span class="password-text">${account.points}</span>
                </td>
                <td>Active</td>
                <td>
                    <button class="edit-button" onclick = "openModal('${account.id}', '${account.name}', '${account.email}', '${account.points}')">
                        <img src="/WebChiaSeTaiLieu/src/main/resources/static/images/bxs-edit.svg" alt="Edit" />
                    </button>
                    <button class="status-button unlocked" onclick= "toggleLockStatus('${account.id}')">
                        <img src="/webchiasetailieu/src/main/resources/static/images/lock-open-alt-solid-24.png" alt="Lock" />
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

function SendData(id,message,server) {
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);
    client.connect({}, function (frame) {
        client.debug = function (str) {};
        client.subscribe(server, function (message) {
            const result = JSON.parse(message.body);
            alert(result.message);
        })
        console.log(message,server);
        client.send(message,{},JSON.stringify(id));
    })
}

function toggleLockStatus(id) {
    const button = document.querySelector(
        `button[onclick="toggleLockStatus('${id}')"]`
    );
    const img = button.querySelector("img");

    if (button.classList.contains("locked")) {
        button.classList.remove("locked");
        button.classList.add("unlocked");
        img.src = "/webchiasetailieu/src/main/resources/static/images/lock-open-alt-solid-24.png"; // Thay đổi biểu tượng thành mở khóa
        const message =`/unbanAcc/${id}`;
        const server = "/topic/unbanAccount";
        SendData(id,message,server);
    } else {
        button.classList.remove("unlocked");
        button.classList.add("locked");
        img.src = "/webchiasetailieu/src/main/resources/static/images/lock-alt-solid-24.png"; // Thay đổi biểu tượng thành khóa
        const message =`/banAcc/${id}`;
        const server = "/topic/banAccount";
        SendData(id,message,server);
    }
}