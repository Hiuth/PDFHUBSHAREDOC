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
                location.reload();
            });

        },
        function (error) {
            console.error("WebSocket connection failed:", error);
            alert("Unable to connect WebSocket. Please try again.");
        }
    );
}

let socketClient = null; // Biến toàn cục để quản lý kết nối
export async function fetchCommentsForDocument(documentId) {
    // Ngắt kết nối WebSocket cũ nếu tồn tại
    if (socketClient && socketClient.connected) {
        socketClient.disconnect();
    }

    if (!documentId) {
        console.error("Document ID is required");
        return;
    }

    documentId = String(documentId);
    console.log("Fetching comments for Document ID:", documentId);

    const socket = new SockJS("http://localhost:8088/ws");
    socketClient = Stomp.over(socket);
    socketClient.debug = null;

    socketClient.connect(
        {},
        function (frame) {
            console.log("WebSocket connected. Fetching comments.");
            socketClient.send(`/app/comments/${documentId}`, {}, JSON.stringify({ documentId }));

            // Chỉ subscribe một lần
            const subscription = socketClient.subscribe('/topic/getComments', function (data) {
                try {
                    const response = JSON.parse(data.body);
                    const comments = response.result;

                    if (Array.isArray(comments)) {
                        const commentsContainer = document.getElementById('comments-container');
                        if (commentsContainer) {
                            // Xóa nội dung cũ trước khi thêm
                            commentsContainer.innerHTML = '';

                            comments.forEach(async (comment) => {
                                // Xử lý từng comment
                                const userName = comment.account ? comment.account.name : 'Anonymous';
                                const commentText = comment.comText.replace(/\s+/g, " ").trim() || 'No comment text provided';
                                const createdAt = new Date(comment.createdAt);
                                const formattedDate = isNaN(createdAt) ? 'Invalid Date' : createdAt.toLocaleString();

                                const commentElement = document.createElement('div');
                                commentElement.id = 'cmtAndTime';
                                commentElement.setAttribute('data-comment-id', comment.id);

                                const avatar = await fetchAvatar2(comment.id);
                                console.log(`Avatar filename: ${avatar}`);

                                commentElement.innerHTML = `
                                    <div class="form-group1" id="comment-class">
                                        <div class="form-group2" id="cmt">
                                          
                                            <img id="cmt-ava" src="../../static/images/User/${avatar}" alt="Avatar">
                                            <div id="comment">
                                                <div class="gray" id="nameUserComment">${userName}</div>
                                                <hr style="margin-bottom: 0px">
                                                <div class="cmt-content">${commentText}</div>
                                            </div>
                                        </div>
                                        <div class="group">
                                            <div class="form-group2" id="time">
                                                <img id="cmt-icon" src="../../static/images/icons/Clock black.png" alt="">
                                                <div class="black" id="cmt-time">${formattedDate}</div>
                                            </div>
                                            <div class="comment-actions">
                                                <button
                                                    class="edit-button-comment"
                                                    onclick="openEditCommentPopup('${comment.id}')"
                                                >
                                                    <img src="../../static/images/bxs-edit.svg" alt="Edit" />
                                                </button>
                                                 <button
                                                    class="delete-button-comment"
                                                    onclick="openDeleteCommentPopup('${comment.id}')"
                                                    >
                                                    <img src="../../static/images/icons/delete-svgrepo-com.svg" alt="Delete" />
                                                 </button>
                                            </div>
                                        </div>
                                    </div>
                                `;
                                commentsContainer.appendChild(commentElement);
                            });
                        }
                    }

                    // Hủy subscription ngay sau khi nhận dữ liệu
                    subscription.unsubscribe();

                    // Ngắt kết nối WebSocket
                    if (socketClient) {
                        socketClient.disconnect();
                    }
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

function fetchAvatar2(CommentID) {
    return fetch(`http://localhost:8088/comment/avatar/${CommentID}`, {
        method: 'GET', // Phương thức GET vì chỉ lấy dữ liệu
        headers: {
            // Nếu cần thêm header, có thể thêm vào đây
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Lỗi HTTP! status: ${response.status}`);
            }
            return response.json(); // Chuyển phản hồi sang đối tượng JSON
        })
        .then(data => {
            return data.result || "avatar.png"; // Trả về giá trị của result, nếu không có thì trả về "avatar.png"
        })
        .catch(error => {
            console.error("Avatar fetch error:", error.message);
            return "avatar.png";  // Trả về avatar mặc định nếu có lỗi
        });
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
                    location.reload();
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
    // Kiểm tra nếu đã tồn tại input edit trong DOM
    const existingEditInput = document.querySelector('.edit-input');
    if (existingEditInput) {
        // Lấy lại nội dung cũ và hiển thị lại nó
        const parent = existingEditInput.parentElement;
        const hiddenCmtContent = parent.querySelector('.cmt-content.hidden');
        if (hiddenCmtContent) {
            hiddenCmtContent.classList.remove('hidden');
        }
        // Xóa input cũ
        existingEditInput.remove();
    }

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

    cmtContent.parentElement.appendChild(editInput);

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

function deleteComment(commentId) {
    if (!commentId) {
        console.error("Comment ID is required");
        return;
    }

    // Lấy documentId từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const documentId = urlParams.get('docId');

    if (!documentId) {
        console.error("Document ID not found in URL");
        return;
    }

    const token = getToken();
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);

    client.connect(
        { Authorization: `Bearer ${token}` },
        function (frame) {
            // Tạo payload với cả documentId và commentId
            // const payload = {
            //     documentId: documentId,
            //     commentId: commentId
            // };

            console.log("Sending delete request with commentID:", commentId);

            // Gửi cả documentId và commentId
            client.send(`/app/deleteComment/${commentId}`, {}, JSON.stringify(commentId));

            client.subscribe('/topic/commentDelete', function (response) {
                try {
                    const result = JSON.parse(response.body);
                    console.log("Delete response:", result);

                    // Kiểm tra kết quả trả về từ service
                    if (result.result === "Successfully deleted comment") {
                        location.reload();
                        // Xóa comment element khỏi UI
                        const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
                        if (commentElement) {
                            // Tìm phần tử cha gần nhất có class form-group1
                            const parentElement = commentElement.closest('.form-group1');
                            if (parentElement) {
                                parentElement.remove();
                            } else {
                                commentElement.remove();
                            }
                        }

                        // Đóng popup sau khi xóa thành công
                        const confirmDeletePopup = document.querySelector('.confirm-delete-popup');
                        if (confirmDeletePopup) {
                            confirmDeletePopup.remove();
                        }

                        // Optional: Refresh danh sách comments
                        fetchCommentsForDocument(documentId);
                    } else {
                        throw new Error(result.message || "Failed to delete comment");
                    }

                } catch (error) {
                    console.error("Error processing delete response:", error);
                    alert("Không thể xóa bình luận. Vui lòng thử lại.");
                }

                client.disconnect();
            });
        },
        function (error) {
            console.error("WebSocket connection failed:", error);
            alert("Không thể kết nối đến server. Vui lòng thử lại.");
        }
    );
}

function openDeleteCommentPopup(commentId) {
    const cmtContent = document.querySelector(`[data-comment-id="${commentId}"] .cmt-content`);
    if (!cmtContent) {
        console.error("Comment content element not found");
        return;
    }

    // Kiểm tra xem đã có popup nào đang mở không
    const existingPopup = document.querySelector('.confirm-delete-popup');
    if (existingPopup) {
        existingPopup.remove();
    }

    // Tạo popup xác nhận xóa
    const confirmDeletePopup = document.createElement('div');
    confirmDeletePopup.className = 'confirm-delete-popup';
    confirmDeletePopup.innerHTML = `
        <div class="confirm-delete-content">
            <p>Bạn có chắc chắn muốn xóa bình luận này?</p>
            <div class="confirm-delete-buttons">
                <button class="confirm-yes">Xóa</button>
                <button class="confirm-no">Hủy</button>
            </div>
        </div>
    `;
    document.querySelector("#overlay").style.display = "";

    // Chèn popup vào sau nút delete
    const deleteButton = document.querySelector(`[data-comment-id="${commentId}"] .delete-button-comment`);
    deleteButton.parentNode.insertBefore(confirmDeletePopup, deleteButton.nextSibling);

    // Xử lý sự kiện cho các nút
    const confirmYesButton = confirmDeletePopup.querySelector('.confirm-yes');
    const confirmNoButton = confirmDeletePopup.querySelector('.confirm-no');

    confirmYesButton.addEventListener('click', () => {
        deleteComment(commentId);
    });

    confirmNoButton.addEventListener('click', () => {
        confirmDeletePopup.remove();
        document.querySelector("#overlay").style.display = "none";
    });

    // Đóng popup khi click ra ngoài
    document.addEventListener('click', function closePopup(e) {
        if (!confirmDeletePopup.contains(e.target) &&
            !deleteButton.contains(e.target)) {
            confirmDeletePopup.remove();
            document.removeEventListener('click', closePopup);
        }
    });
}

window.openDeleteCommentPopup = openDeleteCommentPopup;