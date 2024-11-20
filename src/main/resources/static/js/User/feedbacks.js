import { getToken } from '../Share/localStorageService.js';

// Gửi dữ liệu qua WebSocket và trả về promise
function SendData(payload, destination, server) {
    return new Promise((resolve, reject) => {
        const token = getToken();
        const socket = new SockJS("http://localhost:8088/ws");
        const client = Stomp.over(socket);

        client.connect(
            { Authorization: `Bearer ${token}` },
            function () {
                // Subscribe trước khi gửi để đảm bảo không bỏ lỡ response
                client.subscribe(server, function (response) {
                    console.log("Received response:", JSON.parse(response.body));
                    resolve(response);
                    client.disconnect();
                });

                client.send(destination, {}, JSON.stringify(payload));
            },
            function(error) {
                console.error("WebSocket connection error:", error);
                reject(error);
                client.disconnect();
            }
        );
    });
}

// Xử lý khi submit form
export async function handleFeedbackSubmit(event) {
    event.preventDefault(); // Ngăn hành vi mặc định của form

    // Disable submit button để tránh double submit
    const submitInPut = event.target.querySelector('input[type="submit"]');
    submitInPut.disabled = true;

    try {
        // Lấy dữ liệu từ form
        const violationType = document.getElementById('violation-type').value.trim();
        const description = document.getElementById('description').value.trim();

        const urlParams = new URLSearchParams(window.location.search);
        const docId = urlParams.get('docId');

        if (!docId) {
            throw new Error("Không tìm thấy docId. Vui lòng thử lại.");
        }

        // Kiểm tra dữ liệu hợp lệ
        if (violationType === "" || description === "") {
            throw new Error("Vui lòng điền đầy đủ thông tin.");
        }

        const feedbackRequest = {
            type: violationType,
            feedback: description,
            docId: docId
        };

        console.log("Feedback Request:", feedbackRequest);

        // Gửi dữ liệu và đợi response
        const message = "/app/createFeedback";
        const server = "/topic/feedbacks";

        await SendData(feedbackRequest, message, server);
        alert("Phản hồi của bạn đã được gửi thành công!");
        closeReportPopup();
        window.location.reload();

    } catch (error) {
        alert(error.message || "Có lỗi xảy ra khi gửi phản hồi.");
        console.error("Error:", error);
    } finally {
        // Re-enable submit button
        submitButton.disabled = false;
    }
}

// Đảm bảo hàm được gắn sự kiện khi DOM đã load
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('report-form');
    if (form) {
        form.addEventListener('submit', handleFeedbackSubmit);
    }
});