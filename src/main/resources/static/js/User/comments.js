import { getToken } from "../Share/localStorageService.js";
document.addEventListener('DOMContentLoaded', function () {

    // Lấy documentId từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const documentId = urlParams.get('docId');

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
    if (!documentId) {
        console.error("Document ID is required");
        return;
    }

    documentId = String(documentId);
    console.log("Fetching comments for Document ID:", documentId);

    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);
    client.debug = null;

    client.connect(
        {},
        function (frame) {
            console.log("WebSocket connected. Fetching comments.");
            client.send(`/app/comments/${documentId}`, {}, JSON.stringify({ documentId }));

            const subscription = client.subscribe('/topic/getComments', function (data) {
                try {
                    const response = JSON.parse(data.body);
                    const comments = response.result;

                    if (Array.isArray(comments)) {
                        const commentsContainer = document.getElementById('comments-container');
                        if (commentsContainer) {
                            commentsContainer.innerHTML = '';

                            comments.forEach((comment) => {
                                const userName = comment.account ? comment.account.name : 'Anonymous';
                                const commentText = comment.comText || 'No comment text provided';
                                const createdAt = new Date(comment.createdAt);
                                const formattedDate = isNaN(createdAt) ? 'Invalid Date' : createdAt.toLocaleString();

                                const commentElement = document.createElement('div');
                                commentElement.id = 'cmtAndTime';
                                // Add this line to set the comment ID
                                commentElement.setAttribute('data-comment-id', comment.id);

                                commentElement.innerHTML = `
                                    <div class="form-group1" id="comment-class">
                                        <div class="form-group2">
                                            <img id="cmt-ava" src="../../static/images/icons/avatar.png" alt="">
                                            <div class="gray" id="nameUserComment">${userName}</div>
                                        </div>
                                        <div id="cmtAndTime">
                                            <div class="cmt-content">${commentText}</div>
                                            <button
                                                class="edit-button-comment"
                                                onclick="openEditCommentPopup('${comment.id}')"
                                            >
                                                <img src="../../static/images/bxs-edit.svg" alt="Edit" />
                                            </button>
                                            <div class="form-group2">
                                                <img id="cmt-icon" src="../../static/images/icons/Clock black.png" alt="">
                                                <div class="black" id="cmt-time">${formattedDate}</div>
                                            </div>
                                        </div>
                                    </div>
                                `;
                                commentsContainer.appendChild(commentElement);
                            });
                        } else {
                            console.error("Element with ID 'comments-container' not found");
                        }
                    } else {
                        console.error("Expected an array but received:", comments);
                    }

                    subscription.unsubscribe();
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
function editComment(commentId, newText) {
    if (!commentId || !newText) {
        console.error("Comment ID and new text are required");
        return;
    }

    const token = getToken();
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);

    client.connect(
        { Authorization: `Bearer ${token}` },
        function (frame) {
            const comment = {
                comText: newText
            };

            console.log("Sending edit request for comment:", commentId, comment);

            client.send(`/app/updateComment/${commentId}`, {}, JSON.stringify(comment));

            client.subscribe('/topic/commentUpdate', function (response) {
                try {
                    const updatedComment = JSON.parse(response.body);
                    console.log("Comment updated successfully:", updatedComment);

                    // Update UI with new comment text
                    const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
                    if (commentElement) {
                        const contentElement = commentElement.querySelector('.cmt-content');
                        if (contentElement) {
                            contentElement.textContent = newText;
                        }
                    }

                    // Close edit mode
                    const editInput = document.querySelector('.edit-input');
                    if (editInput) {
                        const cmtContent = document.querySelector('.cmt-content');
                        cmtContent.classList.remove('hidden');
                        editInput.remove();
                    }

                } catch (error) {
                    console.error("Error processing update response:", error);
                    alert("Error updating comment. Please try again.");
                }

                // Disconnect after receiving response
                client.disconnect();
            });
        },
        function (error) {
            console.error("WebSocket connection failed:", error);
            alert("Unable to connect to server. Please try again.");
        }
    );
}

function openEditCommentPopup(commentId) {
    const cmtContent = document.querySelector(`[data-comment-id="${commentId}"] .cmt-content`);
    if (!cmtContent) {
        console.error("Comment content element not found");
        return;
    }

    const commentText = cmtContent.textContent;
    cmtContent.classList.add('hidden');

    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.value = commentText;
    editInput.className = 'edit-input';

    const editButton = document.querySelector(`[data-comment-id="${commentId}"] .edit-button-comment`);
    editButton.parentNode.insertBefore(editInput, editButton);

    editInput.focus();

    editInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            if (this.value.trim()) {
                editComment(commentId, this.value.trim());
            }
        }
    });

    editInput.addEventListener('keyup', function(e) {
        if (e.key === 'Escape') {
            cancelEdit(commentId);
        }
    });
}
window.openEditCommentPopup = openEditCommentPopup;
function cancelEdit(commentId) {
    const cmtContent = document.querySelector(`[data-comment-id="${commentId}"] .cmt-content`);
    cmtContent.classList.remove('hidden');

    const editInput = document.querySelector(`[data-comment-id="${commentId}"] .edit-input`);
    if (editInput) {
        editInput.remove();
    }
}
window.cancelEdit = cancelEdit;

