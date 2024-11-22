

function formatDownloadHistory(downloadHistory) {
    return downloadHistory.map(item => ({
        // id: item.id,
        documentName: item.document.name,
        documentAvatar: item.document.avatar || 'default-avatar.jpg',
        documentId: item.document.id,
        downloadDate: formatDate(item.downloadTime),
        documentPoint: item.document.point,
        downloadTimes: item.document.downloadTimes
    }));
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function renderDownloadHistory(downloadHistory) {
    const docsGroup = document.querySelector('.Docs-group');
    if (!docsGroup) return console.error("Docs-group element not found");

    docsGroup.innerHTML = downloadHistory.length > 0 ? downloadHistory.map(doc => `
        <a href="docsDetail.html?docId=${doc.documentId}" class="Docs">
            <img src="../../static/images/Documents/${doc.documentAvatar}" alt="">
            <div class="docTitle">${doc.documentName}</div>
            <div class="docInfor">
                <div class="uptime"><img src="../../static/images/icons/Clock.png" alt=""><div>${doc.downloadDate}</div></div>
                <div class="downtime"><img src="../../static/images/icons/Downloading Updates.png" alt=""><div>${doc.downloadTimes}</div></div>
                <div class="price"><img src="../../static/images/icons/icons8-coin-32.png" alt=""><div>${doc.documentPoint}</div></div>
            </div>
        </a>`).join('') : `
        <div class="no-results">
            <img src="../../static/images/icons/Box-Important.png">
            <div>Không tìm thấy lịch sử tải xuống</div>
        </div>`;
}
import { getToken } from "../Share/localStorageService.js";

export function fetchDownloadHistory() {
    return new Promise((resolve, reject) => {
        const token = getToken();
        const socket = new SockJS("http://localhost:8088/ws");
        const client = Stomp.over(socket);

        client.connect({ Authorization: `Bearer ${token}` }, () => {
            client.debug = () => {};
            client.send("/app/myDownloadHistory", {}, JSON.stringify({ token }));
            const subscription = client.subscribe("/topic/getMyDownloadHistory", data => {
                try {
                    const response = JSON.parse(data.body);
                    resolve(response.result || []);
                } catch (error) {
                    console.error("Error processing download history:", error);
                    reject(error);
                } finally {
                    subscription.unsubscribe();
                    client.disconnect();
                }
            });
        }, error => {
            console.error("WebSocket connection error:", error);
            reject(error);
        });
    });
}

function initializeDownloadHistory() {
    fetchDownloadHistory()
        .then(downloadHistory => renderDownloadHistory(formatDownloadHistory(downloadHistory)))
        .catch(error => console.error('Error fetching download history:', error));
}

document.addEventListener('DOMContentLoaded', initializeDownloadHistory);