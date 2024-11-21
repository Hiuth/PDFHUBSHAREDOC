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
export async function handleFeedbackAccountSubmit(event) {
    event.preventDefault(); // Prevent default form submission

    // Disable submit button to prevent double submission
    const submitButton = event.target.querySelector('input[type="submit"]');
    submitButton.disabled = true;

    try {
        // Get form data
        const description = document.getElementById('problemDes').value.trim();

        // Validate input
        if (description === "") {
            throw new Error("Please provide a description.");
        }

        const feedbackRequest = {
            feedback: description,
            feedbackType: "ANOTHER_PROBLEM" // Explicitly set feedback type
        };

        console.log("Feedback Request:", feedbackRequest);

        // Send data and wait for response
        const message = "/app/createFeedback";
        const server = "/topic/feedbacks";

        const response = await SendData(feedbackRequest, message, server);

        if (response && response.result) {
            alert("Your feedback has been submitted successfully!");

            window.location.reload();
        } else {
            throw new Error("Failed to submit feedback. Please try again.");
        }

    } catch (error) {
        alert(error.message || "An error occurred while submitting feedback.");
        console.error("Error:", error);
    } finally {
        // Re-enable submit button
        submitButton.disabled = false;
    }
}

// Ensure event listener is added when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('problemForm');
    if (form) {
        form.addEventListener('submit', handleFeedbackAccountSubmit);
    }
});