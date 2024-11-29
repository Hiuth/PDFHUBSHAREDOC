// Import các dependency
import { getToken } from "../Share/localStorageService.js";

// Khởi tạo các biến state
let isMenuOpen = false;
let isNotiOpen = false;

// Hàm chính để khởi tạo tất cả các functionality
function initializeHeader() {
    checkLoginStatus();
    displaySearchResult();
    setupEventListeners();
}

// Kiểm tra trạng thái đăng nhập và thay đổi giao diện
function checkLoginStatus() {
    const notiButton = document.querySelector(".noti-button");
    const menuButton = document.querySelector(".menu-button");
    const register = document.querySelector(".register-button");
    const login = document.querySelector(".login-button");

    const token = getToken();

    if (token && token.trim() !== "") {
        notiButton.style.display = "";
        menuButton.style.display = "";
        register.style.display = "none";
        login.style.display = "none";
    } else {
        notiButton.style.display = "none";
        menuButton.style.display = "none";
        register.style.display = "";
        login.style.display = "";
    }
}

// Hiển thị kết quả tìm kiếm
function displaySearchResult() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');

    const searchTextElement = document.getElementById("searchText");
    const searchInputElement = document.getElementById("search-input");

    if (searchTextElement && searchQuery) {
        searchTextElement.textContent = `"${searchQuery}"`;
    } else if (searchTextElement) {
        searchTextElement.textContent = "{lỗi không tìm thấy nội dung search}";
    }

    if (searchInputElement && searchQuery) {
        searchInputElement.value = searchQuery;
    }
}

function openMenu() {
    if (isNotiOpen) {
        closeNoti();
    }
    if (!isMenuOpen) {
        try {
            fetch('sidebar.html')
                .then(response => response.text())
                .then(data => {
                    document.getElementById('popup-menu').innerHTML = data;
                    document.getElementById('popup-menu').style.display = '';
                    document.getElementById('overlay').style.display = '';

                    // Create a new script element for sidebar.js
                    const script = document.createElement('script');
                    script.type = 'module';
                    script.textContent = `
                        import { PersonalInfo, logout } from '../../static/js/User/sidebar.js';
                        
                        // Immediately call PersonalInfo to update user data
                        PersonalInfo();

                        window.logoutHandler = logout;
                    `;

                    // Append the script to the body
                    document.body.appendChild(script);

                    isMenuOpen = true;
                })
                .catch(error => console.error('Error:', error));
        } catch (error) {
            console.error('Error:', error);
        }
    } else {
        closeMenu();
    }
}

// header.js

// Hàm mở thông báo
function openNoti() {
    if (isMenuOpen) {
        closeMenu();
    }

    if (!isNotiOpen) {
        try {
            fetch('noti.html')
                .then(response => response.text())
                .then(data => {
                    // Thêm nội dung vào popup-noti
                    document.getElementById('popup-noti').innerHTML = data;
                    document.getElementById('popup-noti').style.display = '';
                    document.getElementById('overlay').style.display = '';

                    // Tạo phần tử script mới cho thongbaoUser.js
                    const script = document.createElement('script');
                    script.src = '../../static/js/User/thongbaoUser.js'; // Đường dẫn đến file JavaScript cho thông báo
                    script.type = 'module';

                    // Sau khi script tải xong, gọi loadNotifications
                    script.onload = () => {
                        import('../../js/User/thongbaoUser.js').then(module => {
                            module.loadNotifications();  // Gọi hàm loadNotifications từ module đã import
                        }).catch(err => console.error("Không thể import thongbaoUser.js:", err));
                    };

                    // Thêm script vào body
                    document.body.appendChild(script);

                    isNotiOpen = true;
                })
                .catch(error => console.error('Error loading noti.html:', error));
        } catch (error) {
            console.error('Error:', error);
        }
    } else {
        closeNoti();
    }
}



// Hàm đóng menu
function closeMenu() {
    document.getElementById('popup-menu').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
    isMenuOpen = false;
}

// Hàm đóng thông báo
function closeNoti() {
    document.getElementById('popup-noti').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
    isNotiOpen = false;
}

// Thiết lập các event listener
function setupEventListeners() {
    const menuButton = document.querySelector('.menu-button');
    const notiButton = document.querySelector('.noti-button');

    if (menuButton) {
        menuButton.addEventListener('click', (event) => {
            event.stopPropagation();
            openMenu();
        });
    }

    if (notiButton) {
        notiButton.addEventListener('click', (event) => {
            event.stopPropagation();
            openNoti();
        });
    }

    document.addEventListener('click', function(event) {
        const popupMenu = document.getElementById('popup-menu');
        const avatarButton = document.querySelector('.menu-button');
        const popupNoti = document.getElementById('popup-noti');
        const notiButtonElement = document.querySelector('.noti-button');

        if (isMenuOpen && popupMenu && avatarButton &&
            !popupMenu.contains(event.target) && !avatarButton.contains(event.target)) {
            closeMenu();
        } else if (isNotiOpen && popupNoti && notiButtonElement &&
            !popupNoti.contains(event.target) && !notiButtonElement.contains(event.target)) {
            closeNoti();
        }
    });
}

// Hàm xử lý tìm kiếm
 function searchRedirect(event) {
    event.preventDefault();
    const searchInput = document.getElementById('search-input');
    const searchQuery = searchInput?.value;

    if (searchQuery?.trim()) {
        window.location.href = `search.html?search=${encodeURIComponent(searchQuery)}`;
    }
}

document.addEventListener('headerLoaded', function() {
    initializeHeader();
    PersonalInfo1();
});
// Khởi tạo khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', initializeHeader);

// Export các hàm cần thiết
// export { initializeHeader, searchRedirect };
window.initializeHeader = initializeHeader;
window.searchRedirect = searchRedirect;

export function PersonalInfo1() {
    const token = getToken();
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);
    client.debug = function (str) {};

    client.connect({Authorization: `Bearer ${token}`}, function (frame) {
        client.send(`/app/getInfo/${token}`,{},JSON.stringify(token));
        client.subscribe(`/topic/getInfo/${token}`, function (data) {
            const response = JSON.parse(data.body);
            const perInfo = response.result;

            // Cập nhật thông tin vào sidebar
            // Cập nhật avatar nếu không rỗng
            const avatarElement = document.getElementById("avatar");
            if (perInfo.avatar && perInfo.avatar.trim() !== "") {
                avatarElement.src = `../../static/images/User/${perInfo.avatar}`;
            }
        });
    });
}