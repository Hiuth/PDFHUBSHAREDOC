// Khởi tạo kết nối với SockJS và Stomp
const socket = new SockJS("http://localhost:8088/ws");
const client = Stomp.over(socket);
// Hàm gửi bình luận mới
function sendComment(documentId, commentText) {
    const comment = {
        document: documentId,
        comText: commentText,
        account: "user_account_id", // Cần thay thế bằng account ID thực tế
        createdAt: new Date().toISOString()
    };

    // Gửi bình luận qua WebSocket
    client.send(`/app/createComment/${documentId}`, {}, JSON.stringify(comment));
}

// Hàm lấy danh sách bình luận cho tài liệu
function fetchCommentsForDocument(documentId) {
    // Kết nối đến WebSocket
    client.connect({}, function (frame) {
        client.debug = function (str) {}; // Tắt log debug

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

// Lắng nghe sự kiện DOMContentLoaded để khởi tạo
document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const documentId = urlParams.get('docId'); // Lấy documentId từ URL
    if (documentId) {
        fetchCommentsForDocument(documentId); // Gọi hàm với documentId
    } else {
        console.error("Document ID not found in URL");
    }

});
