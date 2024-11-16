import {getToken} from "../Share/localStorageService.js";

document.addEventListener("DOMContentLoaded", () => {
    fetchAllFeedBack();
})

function fetchAllFeedBack() {
    const token = getToken();
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);
    client.connect({}, function (frame) {
        client.debug = function (str) {};
        //console.log("Connected: " + frame);
        client.send("/app/allFeed");  // Gửi yêu cầu WebSocket để lấy danh sách tài khoản
        // Nhận danh sách tài khoản từ server và hiển thị trong bảng
        client.subscribe('/topic/allFeedBack', function (data) {
            console.log("1");
            const response = JSON.parse(data.body);
            const feedBacks = response.result
            //console.log(feedBacks);
            if(Array.isArray(feedBacks)) {
                var i = 1;
                const tbody = document.querySelector('.feedback-table tbody');
                tbody.innerHTML = ''; // Xóa nội dung cũ trong bảng
                feedBacks.forEach(feed => {
                    console.log(feed);
                    const row = document.createElement('tr');
                    row.innerHTML = `
                     <tr>
                      <td>${i}</td>
                      <td>${feed.account.name}</td>
                      <td>${feed.account.email}</td>
                      <td>${feed.type}</td>
                      <td>${feed.feedback}</td>
                      <td>${feed.status}</td>
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