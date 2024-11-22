import { getToken } from "../Share/localStorageService.js";

function formatMyDocuments(documents) {
    return documents.map(doc => ({
        id: doc.id,
        name: doc.name,
        avatar: doc.avatar || 'default-avatar.jpg',
        createdAt: formatDate(doc.createdAt),
        point: doc.point,
        downloadTimes: doc.downloadTimes
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

function renderMyDocuments(documents) {
    const docsGroup = document.querySelector('.Docs-group');
    if (!docsGroup) return console.error("Docs-group element not found");

    docsGroup.innerHTML = documents.length > 0 ? documents.map(doc => `
        <div class="Docs" data-doc-id="${doc.id}">
            <div class="docs-content">
                <a href="docsDetail.html?docId=${doc.id}">
                    <img src="../../static/images/Documents/${doc.avatar}" alt="">
                </a>
                <a class="docsbutton" id="edit" href="editPdf.html?docId=${doc.id}">
                    <img src="../../static/images/icons/Pencil.png" alt="">
                </a>
                <a class="docsbutton" id="delete" data-doc-id="${doc.id}">
                    <img src="../../static/images/icons/Delete.png" alt="">
                </a>
            </div>
            <a href="docsDetail.html?docId=${doc.id}" class="docTitle">${doc.name}</a>
            <div class="docInfor">
                <div class="uptime">
                    <img src="../../static/images/icons/Clock.png" alt="">
                    <div>${doc.createdAt}</div>
                </div>
                <div class="downtime">
                    <img src="../../static/images/icons/Downloading Updates.png" alt="">
                    <div>${doc.downloadTimes}</div>
                </div>
                <div class="price">
                    <img src="../../static/images/icons/icons8-coin-32.png" alt="">
                    <div>${doc.point}</div>
                </div>
            </div>
        </div>`).join('') : `
        <div class="no-results">
            <img src="../../static/images/icons/Box-Important.png">
            <div>Không tìm thấy tài liệu đã đăng tải</div>
        </div>`;

    // Add event listeners for delete buttons
    document.querySelectorAll('.docsbutton#delete').forEach(deleteButton => {
        deleteButton.addEventListener('click', showDeletePopup);
    });
}

function showDeletePopup(event) {
    const docId = event.currentTarget.getAttribute('data-doc-id');
    const deletePopup = document.getElementById('deleteConfirmPopup');
    deletePopup.setAttribute('data-doc-id', docId);
    deletePopup.style.display = 'block';
}

function deleteDocument(docId) {
    return new Promise((resolve, reject) => {
        const token = getToken();
        const socket = new SockJS("http://localhost:8088/ws");
        const client = Stomp.over(socket);

        client.connect({ Authorization: `Bearer ${token}` }, () => {
            client.debug = () => {};
            client.send(`/app/deleteDoc/${docId}`, {}, JSON.stringify({ token }));
            console.log(docId);
            const subscription = client.subscribe("/topic/deleteDocument", data => {
                try {
                    const response = JSON.parse(data.body);
                    if (response.result) {
                        resolve(response);
                    } else {
                        if (response.message === "Document does not exist") {
                            reject(new Error("The document you are trying to delete does not exist."));
                        } else {
                            reject(new Error(response.message || 'Delete failed'));
                        }
                    }
                } catch (error) {
                    console.error("Error processing delete response:", error);
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

function initDeletePopup() {
    const deletePopup = document.getElementById('deleteConfirmPopup');
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    const cancelDeleteBtn = document.getElementById('cancelDelete');

    // Confirm delete
    confirmDeleteBtn.addEventListener('click', async () => {
        const docId = deletePopup.getAttribute('data-doc-id');
        try {
            await deleteDocument(docId);
            console.log('Document deleted successfully');
            // Reload the page after successful deletion
            location.reload();
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Xóa tài liệu thất bại');
        }
    });

    // Cancel delete
    cancelDeleteBtn.addEventListener('click', () => {
        deletePopup.style.display = 'none';
    });

    // Close popup if clicked outside
    window.addEventListener('click', (event) => {
        if (event.target === deletePopup) {
            deletePopup.style.display = 'none';
        }
    });
}

export function fetchMyDocuments() {
    return new Promise((resolve, reject) => {
        const token = getToken();
        const socket = new SockJS("http://localhost:8088/ws");
        const client = Stomp.over(socket);

        client.connect({ Authorization: `Bearer ${token}` }, () => {
            client.debug = () => {};
            client.send("/app/getMyDoc", {}, JSON.stringify({ token }));
            const subscription = client.subscribe("/topic/getMyDoc", data => {
                try {
                    const response = JSON.parse(data.body);
                    resolve(response.result || []);
                } catch (error) {
                    console.error("Error processing documents:", error);
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

function initializeMyDocuments() {
    fetchMyDocuments()
        .then(documents => {
            renderMyDocuments(formatMyDocuments(documents));
            initDeletePopup();
        })
        .catch(error => console.error('Error fetching documents:', error));
}

document.addEventListener('DOMContentLoaded', initializeMyDocuments);