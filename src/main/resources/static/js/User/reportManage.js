import { getToken } from '../Share/localStorageService.js';

export function fetchMyReports(retryAttempts = 3) {
    return new Promise((resolve, reject) => {
        const token = getToken();
        if (!token) {
            showError("Không tìm thấy token xác thực");
            reject(new Error("Authentication token missing"));
            return;
        }

        let currentAttempt = 0;
        let messageReceived = false;

        function showError(message) {
            console.log("Showing error:", message);
            const tbody = document.querySelector('.table tbody');
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="6" class="text-center">${message}
                    ${currentAttempt < retryAttempts ? '<br>Đang thử kết nối lại...' : ''}</td></tr>`;
            }
        }

        function showLoading() {
            const tbody = document.querySelector('.table tbody');
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="6" class="text-center">
                    Đang tải dữ liệu... (Lần thử ${currentAttempt + 1}/${retryAttempts})</td></tr>`;
            }
        }

        function connectWebSocket() {
            return new Promise((resolveConnection, rejectConnection) => {
                showLoading();

                // Thêm timestamp để tránh cache
                const socket = new SockJS(`http://localhost:8088/ws?t=${Date.now()}`);
                const client = Stomp.over(socket);

                // Disable STOMP debug logs
                client.debug = null;

                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'heart-beat': '10000,10000'  // Increased heartbeat interval
                };

                let cleanup = null;
                let responseTimeout = null;
                let reconnectTimeout = null;

                const handleResponse = (response) => {
                    try {
                        console.log("Raw response received:", response);
                        messageReceived = true;
                        clearTimeout(responseTimeout);

                        const parsedResponse = JSON.parse(response.body);
                        console.log("Parsed response:", parsedResponse);

                        if (!parsedResponse || !parsedResponse.result) {
                            throw new Error("Invalid response format");
                        }

                        updateTable(parsedResponse.result);
                        resolveConnection(cleanup);
                        resolve(parsedResponse.result);
                    } catch (error) {
                        console.error("Error processing response:", error);
                        handleError(new Error("Lỗi xử lý dữ liệu từ máy chủ"));
                    }
                };

                const handleError = (error) => {
                    console.error(`[Attempt ${currentAttempt + 1}] Error:`, error);

                    if (currentAttempt < retryAttempts - 1) {
                        currentAttempt++;
                        console.log(`Retrying... Attempt ${currentAttempt + 1}/${retryAttempts}`);
                        cleanup?.();
                        reconnectTimeout = setTimeout(async () => {
                            try {
                                const newCleanup = await connectWebSocket();
                                resolveConnection(newCleanup);
                            } catch (reconnectError) {
                                rejectConnection(reconnectError);
                            }
                        }, 2000);
                    } else {
                        showError("Không thể kết nối đến máy chủ sau nhiều lần thử. Vui lòng tải lại trang.");
                        rejectConnection(error);
                        reject(error);
                    }
                };

                // Add connection timeout
                const connectionTimeout = setTimeout(() => {
                    if (!client.connected) {
                        handleError(new Error("Timeout kết nối đến máy chủ"));
                    }
                }, 10000);

                client.connect(
                    headers,
                    function(frame) {
                        clearTimeout(connectionTimeout);
                        console.log(`[Attempt ${currentAttempt + 1}] WebSocket Connected`);

                        const subscription = client.subscribe('/topic/myFeedBack', handleResponse, headers);

                        setTimeout(() => {
                            if (client.connected) {
                                console.log("Sending request to /app/myFeedback");
                                client.send('/app/myFeedback', headers, JSON.stringify({
                                    timestamp: new Date().getTime()
                                }));

                                responseTimeout = setTimeout(() => {
                                    if (!messageReceived && client.connected) {
                                        handleError(new Error("Không nhận được phản hồi từ máy chủ"));
                                    }
                                }, 5000);
                            }
                        }, 500);

                        cleanup = () => {
                            clearTimeout(connectionTimeout);
                            clearTimeout(responseTimeout);
                            clearTimeout(reconnectTimeout);
                            if (subscription) {
                                subscription.unsubscribe();
                            }
                            if (client.connected) {
                                client.disconnect();
                            }
                        };
                    },
                    handleError
                );
            });
        }

        function updateTable(reports) {
            const tbody = document.querySelector('.table tbody');
            if (!tbody) return;

            tbody.innerHTML = '';

            if (!Array.isArray(reports) || !reports.length) {
                tbody.innerHTML = `<tr><td colspan="6" class="text-center">Không có báo cáo nào</td></tr>`;
                return;
            }

            reports.forEach(report => {
                const row = document.createElement('tr');
                const sanitize = (str) => str ? String(str).replace(/[<>]/g, '') : 'N/A';

                row.innerHTML = `
                    <td>${sanitize(report.id)}</td>
                    <td>${sanitize(report.type)}</td>
                    <td>${sanitize(report.feedback)}</td>
                    <td>${report.date ? new Date(report.date).toLocaleString('vi-VN') : 'N/A'}</td>
                    <td class="status-${report.status.toLowerCase()}">
                        ${report.status === 'RESPONDED' ? 'Đã phản hồi' : 'Chưa phản hồi'}
                    </td>
                    <td>
                        <button class="btn btn-info btn-sm" onclick="viewDetails('${sanitize(report.id)}')">
                            Xem chi tiết
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }

        return connectWebSocket();
    });
}

window.viewDetails = function(id) {
    if (!id) return;
    window.location.href = `reportDetails.html?id=${encodeURIComponent(id)}`;
};

document.addEventListener('DOMContentLoaded', async () => {
    console.log("Page loaded, initializing WebSocket...");
    try {
        const cleanup = await fetchMyReports();
        window.addEventListener('unload', () => {
            if (typeof cleanup === 'function') {
                cleanup();
            }
        });
    } catch (error) {
        console.error("Final error:", error);
    }
});