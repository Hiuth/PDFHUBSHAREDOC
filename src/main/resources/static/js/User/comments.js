import { getToken } from "../Share/localStorageService.js";

// Hàm gửi bình luận mới
export function sendComment(documentId, commentText) {
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);
    const token = getToken();
    client.debug = function (str) {}; // Tắt log debug
    client.connect(
        { Authorization: `Bearer ${token}` }, function (frame) {

            const comment = {
                document: documentId,
                comText: commentText
            };
            console.log(comment);

            // // Gửi bình luận qua WebSocket đến endpoint cụ thể
            client.send(`/app/createComment`, {}, JSON.stringify(comment));
            client.subscribe('/topic/comments', function (data){
                window.location.reload();
            });
        },

    );
}

// Lắng nghe sự kiện DOMContentLoaded để khởi tạo
document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const documentId = urlParams.get('docId'); // Lấy documentId từ URL
    if (documentId) {
        // Nếu có documentId, lấy bình luận cho tài liệu
        fetchCommentsForDocument(documentId);
    } else {
        console.error("Document ID not found in URL");
    }

    // Lắng nghe sự kiện khi người dùng nhấn nút gửi bình luận
    document.getElementById("submitComment").addEventListener("click", function (event) {
        event.preventDefault(); // Ngừng hành động mặc định của nút (nếu có)

        const commentText = document.getElementById("upcomment").value.trim(); // Lấy giá trị từ textarea
        // Kiểm tra nếu dữ liệu hợp lệ
        if (!documentId || !commentText) {
            console.error("documentId hoặc commentText không hợp lệ:", documentId, commentText);
            alert("Vui lòng nhập đầy đủ thông tin bình luận!");
            return; // Dừng lại nếu dữ liệu không hợp lệ
        }

        // Gọi hàm gửi bình luận
        sendComment(documentId, commentText);

        // Clear input sau khi gửi
        document.getElementById("upcomment").value = '';

    });
});

// Hàm lấy danh sách bình luận cho tài liệu
export function fetchCommentsForDocument(documentId) {
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);
    client.debug = function (str) {}; // Tắt log debug
    client.connect({}, function (frame) {

        // Gửi yêu cầu lấy danh sách bình luận từ server
        client.send(`/app/comments/${documentId}`, {}, JSON.stringify({ documentId }));

        // Lắng nghe dữ liệu trả về từ server
        client.subscribe('/topic/getComments', function (data) {
            const response = JSON.parse(data.body);
            const comments = response.result;

            // Kiểm tra và xử lý bình luận
            if (Array.isArray(comments)) {
                const commentsContainer = document.getElementById('comments-container');
                if (commentsContainer) {
                    commentsContainer.innerHTML = ''; // Xóa nội dung cũ

                    comments.forEach((comment) => {
                        const userName = comment.account ? comment.account.name : 'Anonymous';  // Lấy tên từ tài khoản
                        const commentText = comment.comText || 'No comment text provided'; // Lấy nội dung bình luận
                        const createdAt = new Date(comment.createdAt);
                        const formattedDate = isNaN(createdAt) ? 'Invalid Date' : createdAt.toLocaleString();

                        // Tạo phần tử HTML cho mỗi bình luận
                        const commentElement = document.createElement('div');
                        commentElement.id = 'cmtAndTime';
                        commentElement.innerHTML = `
                            <div class="form-group1" id="comment-class">
                                <div class="form-group2">
                                    <img id="cmt-ava" src="../../static/images/icons/avatar.png" alt="">
                                    <div class="gray" id="nameUserComment">${userName}</div>
                                </div>
                                <div id="cmtAndTime">
                                    <div class="cmt-content">${commentText}</div>
                                    <div class="form-group2">
                                        <img id="cmt-icon" src="../../static/images/icons/Clock black.png" alt="">
                                        <div class="black" id="cmt-time">${formattedDate}</div>
                                    </div>
                                </div>
                            </div>
                        `;
                        // Thêm phần tử bình luận vào container
                        commentsContainer.appendChild(commentElement);
                    });
                } else {
                    console.error("Element with ID 'comments-container' not found");
                }
            } else {
                console.error("Expected an array but received:", comments);
            }
        });
    }, function (error) {
        console.error("Connection error: ", error);
    });
}
