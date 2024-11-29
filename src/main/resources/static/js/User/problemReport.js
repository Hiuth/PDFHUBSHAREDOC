import { getToken } from '../Share/localStorageService.js';

// Send data via WebSocket and return a promise
function SendData(payload, destination, server) {
    return new Promise((resolve, reject) => {
        const token = getToken();
        const socket = new SockJS("http://localhost:8088/ws");
        const client = Stomp.over(socket);

        client.connect(
            { Authorization: `Bearer ${token}` },
            function () {
                // Subscribe before sending to ensure no response is missed
                client.subscribe(server, function (response) {
                    const parsedResponse = JSON.parse(response.body);
                    console.log("Received response:", parsedResponse);
                    resolve(parsedResponse);
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

// Handle form submission
// Cập nhật hàm handleFeedbackAccountSubmit
export async function handleFeedbackAccountSubmit(event) {
    event.preventDefault();

    const submitButton = event.target.querySelector('input[type="submit"]');
    submitButton.disabled = true;

    try {
        const description = document.getElementById('problemDes').value.trim();

        if (description === "") {
            throw new Error("Please provide a description.");
        }

        const feedbackRequest = {
            feedback: description,
            feedbackType: "ANOTHER_PROBLEM"
        };

        console.log("Feedback Request:", feedbackRequest);

        const message = "/app/createFeedback";
        const server = "/topic/feedbacks";

        const response = await SendData(feedbackRequest, message, server);

        if (response && response.result) {
            showPopup("Feedback của bạn đã được gửi thành công!");
        } else {
            showPopup("Lỗi khi gửi feedback, vui lòng điền đầy đủ thông tin và thử lại!");
        }

    } catch (error) {
        showPopup("Lỗi khi gửi feedback, vui lòng điền đầy đủ thông tin và thử lại!");
        console.error("Error:", error);
    } finally {
        submitButton.disabled = false;
    }
}

// Đảm bảo nút "OK" đóng popup
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('problemForm');
    if (form) {
        form.addEventListener('submit', handleFeedbackAccountSubmit);
    }

    const closePopupButton = document.getElementById('closePopupButton');
    closePopupButton.addEventListener('click', hidePopup);
});

function showPopup(message) {
    const popup = document.getElementById('successPopup');
    const popupMessage = document.getElementById('popupMessage');
    popupMessage.textContent = message;
    popup.classList.remove('hidden');
    popup.classList.add('visible');
}

function hidePopup() {
    const popup = document.getElementById('successPopup');
    popup.classList.remove('visible');
    popup.classList.add('hidden');
}