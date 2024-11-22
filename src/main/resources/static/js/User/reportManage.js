import { getToken } from '../Share/localStorageService.js';

// Fetch all reports via WebSocket and render them in the HTML table
export async function fetchMyReports() {
    return new Promise((resolve, reject) => {
        const token = getToken();
        console.log("Token:", token); // Log the token

        const socket = new SockJS("http://localhost:8088/ws");
        const client = Stomp.over(socket);

        client.connect(
            { Authorization: `Bearer ${token}` },
            function (frame) {
                console.log('Connected: ' + frame); // Log the connection frame
                client.send('/app/myFeedback', {}, JSON.stringify({}));
                client.subscribe('/topic/myFeedBack', function (response) {

                    try {
                        const parsedResponse = JSON.parse(response.body);
                        console.log("Parsed response:", parsedResponse); // Log the parsed response

                        const reports = parsedResponse.result;
                        if (Array.isArray(reports)) {
                            console.log("Reports array:", reports); // Log the reports array
                            const tbody = document.querySelector('.table tbody');
                            if (!tbody) {
                                console.error("Table body element not found");
                                return;
                            }
                            console.log("Processing report:", reports);
                            tbody.innerHTML = ''; // Clear existing rows
                            let i = 1;
                            reports.forEach(report => {
                                // Log each report
                                const row = document.createElement('tr');
                                row.innerHTML = `
                                <tr>
                                    <td>${i || 'N/A'}</td>
                                    <td>${report.type || 'N/A'}</td>
                                    <td>${report.feedback || 'N/A'}</td>
                                    <td>${report.status}</td>
                                    <td>${report.date ? new Date(report.date).toLocaleString('vi-VN') : 'N/A'}</td>
                                    <td>
                                       <a href="#" class="btn btn-primary btn-sm" onclick="viewDetails('${report.id}')">Xem chi tiết</a>
                                    </td>
                                    </tr>
                                `;
                                tbody.appendChild(row);
                                i++;
                            });

                            resolve(parsedResponse);
                        } else {
                            console.error("Reports is not an array:", reports); // Log if reports is not an array
                            reject(new Error("Reports is not an array"));
                        }
                    } catch (error) {
                        console.error("Error processing response:", error); // Log any error during processing
                        console.error("Response body:", response.body); // Log the response body
                        reject(error);
                    }
                });

                console.log("Sending request to /app/myFeedback"); // Log before sending request

            },
            function (error) {
                console.error("WebSocket connection error:", error); // Log connection error
                reject(error);
                client.disconnect();
            }
        );
    });
}

window.viewDetails = function(feedbackId) {
    localStorage.setItem('feedbackId', feedbackId);
    window.location.href = '../../templates/User/reportDetails.html';
}

// Fetch and display reports when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    console.log("Fetching all reports..."); // Log before fetching reports
    try {
        await fetchMyReports();
    } catch (error) {
        console.error("Error fetching reports:", error);
    }
});