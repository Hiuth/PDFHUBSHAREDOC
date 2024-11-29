// Import necessary modules
import { getToken } from '../Share/localStorageService.js';

// Function to request notification permission
function requestNotificationPermission() {
    if (!("Notification" in window)) {
        console.error("Browser does not support notifications");
        return false;
    }

    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }
    return Notification.permission === "granted";
}

// Function to display browser notification
function showBrowserNotification(title, body, link) {
    if (requestNotificationPermission()) {
        const notification = new Notification(title, {
            body: body,
            icon: '../../static/images/icons/logo.png'
        });

        if (link) {
            notification.onclick = () => {
                window.open(link, '_blank');
            };
        }
    }
}

// Function to initialize notification count
function initializeNotificationCount() {
    const notiButton = document.querySelector('.noti-button');
    if (notiButton) {
        notiButton.style.display = 'flex'; // Show notification button
    }
}

// Function to update notification count
function updateNotificationCount(count, isNew = false) {
    const notiCountElement = document.querySelector('.noti-count');
    if (notiCountElement) {
        notiCountElement.textContent = count;
        notiCountElement.style.display = count > 0 ? 'block' : 'none';

        if (isNew) {
            notiCountElement.classList.add('new');
            setTimeout(() => {
                notiCountElement.classList.remove('new');
            }, 3000); // Remove pulse effect after 3 seconds
        }
    }
}

// Function to load and render notifications
export function loadNotifications() {
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);
    const token = getToken();

    if (!token) {
        console.error("Token not found");
        return;
    }

    // Initialize notification display
    initializeNotificationCount();

    client.connect({ Authorization: `Bearer ${token}` }, () => {
        // Initial request for notifications
        client.send(`/app/getMyNoti/${token}`, {}, JSON.stringify({token}));

        // Subscribe to real-time notifications
        client.subscribe(`/topic/getNotification/${token}`, (message) => {
            const notifications = JSON.parse(message.body);

            // Update notification count immediately
            if (notifications.result) {
                updateNotificationCount(notifications.result.length);
            }

            // Render notifications in the dropdown
            renderNotifications(notifications);

            // Display the latest notification as a browser notification
            if (notifications.result && notifications.result.length > 0) {
                const latestNoti = notifications.result[0];
                showBrowserNotification(latestNoti.title, latestNoti.content, latestNoti.link);
            }
        });
    }, (error) => {
        console.error("WebSocket connection error:", error);
    });
}

// Function to render notifications
function renderNotifications(notifications) {
    const notiContainer = document.getElementById("notification-list");
    notiContainer.innerHTML = ""; // Clear existing notifications

    // Sort notifications by date in descending order
    notifications.result.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

    notifications.result.forEach((noti) => {
        const oneNotiBox = document.createElement('div');
        oneNotiBox.className = 'oneNotiBox';
        oneNotiBox.setAttribute('data-id', noti.id);

        // Notification content
        oneNotiBox.innerHTML = `
      <div class="h-group">
        <img src="../../static/images/icons/QuoteBlack.png" alt="">
        <div class="noti-title">${noti.title}</div>
      </div>
      <div class="noti-content">${noti.content}</div>
      <div class="d-group">
        <div class="i-group">
          <img src="../../static/images/icons/Clock%20gray.png" alt="">
          <div class="noti-time">${formatDateTime(noti.dateTime)}</div>
        </div>
        <button id="noti-link">Xóa thông báo</button> 
      </div>
    `;

        // Add the notification to the container
        notiContainer.appendChild(oneNotiBox);
    });
}

// Function to format date and time
function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${hours}:${minutes}PM ${day}/${month}/${year}`;
}

// Event listener when the page loads
document.addEventListener("DOMContentLoaded", () => {
    // Request notification permission
    requestNotificationPermission();

    // Load notifications
    loadNotifications();
});