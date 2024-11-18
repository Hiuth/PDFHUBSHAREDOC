import { getToken } from "../Share/localStorageService.js";
document.addEventListener('DOMContentLoaded', function () {

    // Lấy documentId từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const documentId = urlParams.get('docId');
    console.log(window.location.href);

    console.log( documentId); // Debugging log

    if (documentId) {
        // Gọi hàm fetchCommentsForDocument với documentId
        fetchCommentsForDocument(documentId);

        // Thêm sự kiện cho nút submit comment
        document.getElementById('submitComment').addEventListener('click', function () {
            const commentText = document.getElementById('upcomment').value.trim();
            console.log("Comment Text:", commentText); // Debugging log

            if (documentId && commentText) {
                // Gọi hàm sendComment với documentId và commentText
                sendComment(documentId, commentText);
                document.getElementById('upcomment').value = ''; // Xóa nội dung textarea sau khi gửi
            } else {
                console.error("Document ID hoặc nội dung bình luận không hợp lệ");
                alert("Vui lòng nhập nội dung bình luận!");
            }
        });
    } else {
        console.error("Document ID không tìm thấy trong URL");
    }
});
// Hàm gửi bình luận mới
function sendComment(documentId, commentText) {
    // Kiểm tra và xử lý input
    if (!documentId || !commentText) {
        console.error("Document ID and comment text are required");
        return;
    }

    // // Chuyển đổi sang string để đảm bảo
    // documentId = String(documentId);
    // commentText = String(commentText);

    // Kiểm tra độ dài comment
    if (commentText.length === 0) {
        console.error("Comment cannot be empty");
        return;
    }

    console.log("Sending comment - Document ID:", documentId);

    // Lấy token từ localStorage
    const token = getToken();

    // Tạo kết nối WebSocket
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);



    // Kết nối và gửi comment
    client.connect(
        { Authorization: `Bearer ${token}` },
        function (frame) {
            const comment = {
                document: documentId,
                comText: commentText
            };

            console.log( comment);

            // Gửi comment qua WebSocket
            client.send(`/app/createComment`, {}, JSON.stringify(comment));
            client.subscribe('/topic/comments', function (data) {
                console.log("Received comment response:", data.body);
            });

        },
        function (error) {
            console.error("WebSocket connection failed:", error);
            alert("Unable to connect WebSocket. Please try again.");
        }
    );
}

// Hàm lấy danh sách bình luận cho tài liệu
export function fetchCommentsForDocument(documentId) {
    // Kiểm tra và xử lý input
    if (!documentId) {
        console.error("Document ID is required");
        return;
    }

    // Chuyển đổi sang string để đảm bảo
    documentId = String(documentId);

    console.log("Fetching comments for Document ID:", documentId);

    // Tạo kết nối WebSocket
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);

    // Tắt debug
    client.debug = null;

    // Kết nối và lấy danh sách bình luận
    client.connect(
        {},
        function (frame) {
            console.log("WebSocket connected. Fetching comments.");

            // Gửi yêu cầu lấy danh sách bình luận từ server
            client.send(`/app/comments/${documentId}`, {}, JSON.stringify({ documentId }));

            // Đăng ký để lắng nghe phản hồi
            const subscription = client.subscribe('/topic/getComments', function (data) {
                try {
                    const response = JSON.parse(data.body);
                    const comments = response.result;

                    // Kiểm tra và xử lý bình luận
                    if (Array.isArray(comments)) {
                        const commentsContainer = document.getElementById('comments-container');
                        if (commentsContainer) {
                            commentsContainer.innerHTML = ''; // Xóa nội dung cũ

                            comments.forEach((comment) => {
                                const userName = comment.account ? comment.account.name : 'Anonymous';
                                const commentText = comment.comText || 'No comment text provided';
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

                    // Hủy đăng ký sau khi nhận dữ liệu
                    subscription.unsubscribe();

                    // Đóng kết nối
                    client.disconnect();
                } catch (error) {
                    console.error("Error processing comments:", error);
                }
            });
        },
        function (error) {
            console.error("WebSocket connection error:", error);
            alert("Unable to connect WebSocket. Please try again.");
        }
    );
}


