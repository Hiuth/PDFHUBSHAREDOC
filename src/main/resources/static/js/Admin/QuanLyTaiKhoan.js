import {getToken} from "../Share/localStorageService.js";

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