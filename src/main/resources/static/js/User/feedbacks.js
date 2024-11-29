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
export async function handleFeedbackSubmit(event) {
    event.preventDefault(); // Prevent default form submission

    // Disable submit button to prevent double submission
    const submitButton = event.target.querySelector('input[type="submit"]');
    submitButton.disabled = true;

    try {
        // Get form data
        const description = document.getElementById('description').value.trim();

        const urlParams = new URLSearchParams(window.location.search);
        const docId = urlParams.get('docId');

        if (!docId) {
            throw new Error("Document ID not found. Please try again.");
        }

        // Validate input
        if (description === "") {
            showPopup("Vui lòng điền đầy đủ thông tin và thử lại!");
        }

        const feedbackRequest = {
            feedback: description,
            feedbackType: "REPORT_DOCUMENT", // Explicitly set feedback type
            otherId: docId // Use otherId instead of docId
        };

        console.log("Feedback Request:", feedbackRequest);

        // Send data and wait for response
        const message = "/app/createFeedback";
        const server = "/topic/feedbacks";

        const response = await SendData(feedbackRequest, message, server);

        if (response && response.result) {
            showPopup("Feedback của bạn đã được gửi thành công!");
            closeReportPopup(); // Assuming this function exists in your HTML/JS
            //window.location.reload();
        } else {
            showPopup("Lỗi khi gửi feedback, vui lòng điền đầy đủ thông tin và thử lại!");
        }

    } catch (error) {
        showPopup("Lỗi khi gửi feedback, vui lòng điền đầy đủ thông tin và thử lại!");
        console.error("Error:", error);
    } finally {
        // Re-enable submit button
        submitButton.disabled = false;
    }
}

// Ensure event listener is added when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('report-form');
    if (form) {
        form.addEventListener('submit', handleFeedbackSubmit);
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