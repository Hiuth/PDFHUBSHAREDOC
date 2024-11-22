import { getToken } from "../Share/localStorageService.js";

export function fetchreportDetails() {
    const token = getToken();
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);

    // Get feedbackId from localStorage
    const feedbackId = localStorage.getItem('feedbackId');
    console.log("Feedback ID:", feedbackId);

    if (!feedbackId) {
        console.error("Feedback ID is null or undefined");
        return;
    }

    // Connect to WebSocket
    client.debug = function (str) {};
    client.connect({ Authorization: `Bearer ${token}` }, function (frame) {
        // Subscribe to feedback first to get docId
        client.send(`/app/getFeedbackbyId/${feedbackId}`);
        client.subscribe('/topic/getFeedbackbyId', function (data) {
            const response = JSON.parse(data.body);
            const feedBack = response.result;

            if (feedBack) {
                const docId =  feedBack.otherId;
                console.log("Document ID from otherId:", docId);


                if (docId) {
                    client.send(`/app/getDocById/${docId}`);
                    client.subscribe('/topic/getDocById', function (docResponse) {
                        const docData = JSON.parse(docResponse.body);
                        if (docData.result && docData.result.name) {
                            document.querySelector(".DocsLink").value = docData.result.name;
                        } else {
                            document.querySelector(".DocsLink").value = 'N/A';
                        }
                    });


                }

                // Update other feedback fields
                document.querySelector(".form-group2 input.read[readonly]").value = feedBack.type || 'N/A';
                document.querySelector(".form-group2:nth-child(2) input.read[readonly]").value =
                    feedBack.date ? new Date(feedBack.date).toLocaleDateString() : 'N/A';
                document.querySelector("#problemDes").value = feedBack.feedback || 'N/A';
                document.querySelector("#reply").value = feedBack.feedbackFromAdmin || 'Chưa có phản hồi';
            } else {
                console.error("Feedback data is null or undefined");
            }
        });

        // Send request for feedback info

    });
}