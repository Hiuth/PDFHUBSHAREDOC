document.addEventListener('headerLoaded', function() {
    let isMenuOpen = false;
    let isNotiOpen = false;

    function openMenu() {
        if (isNotiOpen) {
            closeNoti(); // Đóng thông báo trước nếu đang mở
        }   
        if (!isMenuOpen) {
            fetch('sidebar.html')
            .then(response => response.text())
            .then(data => {
                document.getElementById('popup-menu').innerHTML = data;
                document.getElementById('popup-menu').style.display = ''; // Hiển thị popup-menu
                document.getElementById('overlay').style.display = ''; // Hiển thị overlay
                isMenuOpen = true;
            })
            .catch(error => console.error('Error:', error));
        } else {
            closeMenu(); // Đóng menu nếu đang mở
        }
    }

    function openNoti() {
        if (isMenuOpen) {
            closeMenu(); // Đóng menu trước nếu đang mở
        }
        if (!isNotiOpen) {
            fetch('noti.html')
            .then(response => response.text())
            .then(data => {
                document.getElementById('popup-noti').innerHTML = data;
                document.getElementById('popup-noti').style.display = ''; // Hiển thị popup-noti
                document.getElementById('overlay').style.display = ''; // Hiển thị overlay
                isNotiOpen = true;
            })
            .catch(error => console.error('Error:', error));
        } else {
            closeNoti(); // Đóng menu nếu đang mở
        }
    }

    // Đảm bảo rằng menu-button đã tồn tại trong DOM trước khi gắn sự kiện
    document.querySelector('.menu-button').addEventListener('click', function(event) {
        event.stopPropagation();
        openMenu();
    });

    document.querySelector('.noti-button').addEventListener('click', function(event) {
        event.stopPropagation();
        openNoti();
    });

    function closeMenu() {
        document.getElementById('popup-menu').style.display = 'none';
        document.getElementById('overlay').style.display = 'none';
        isMenuOpen = false;
    }

    function closeNoti() {
        document.getElementById('popup-noti').style.display = 'none';
        document.getElementById('overlay').style.display = 'none';
        isNotiOpen = false;
    }

    //nếu click cái khác
    document.addEventListener('click', function(event) {
        const popupMenu = document.getElementById('popup-menu');
        const avatarButton = document.querySelector('.menu-button');
        const popupNoti = document.getElementById('popup-noti');
        const NotiButton = document.querySelector('.noti-button');

        if (isMenuOpen && !popupMenu.contains(event.target) && !avatarButton.contains(event.target)) {
            closeMenu();
        }
        else if (isNotiOpen && !popupNoti.contains(event.target) && !NotiButton.contains(event.target)) {
            closeNoti();
        }
    });
});

function searchRedirect(event) {
    event.preventDefault(); // Ngăn chặn hành động submit mặc định của form

    // Lấy giá trị từ ô tìm kiếm
    const searchQuery = document.getElementById('search-input').value;

    // Tạo URL chuyển hướng với tham số search
    if (searchQuery.trim()) {
        window.location.href = `search.html?search=${encodeURIComponent(searchQuery)}`;
    }
}

//update tìm kiếm
document.addEventListener('DOMContentLoaded', function() {
    function displaySearchResult() {
        // Lấy giá trị tham số 'search' từ URL
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search');

        // Nếu có nội dung tìm kiếm, chèn vào phần tử HTML
        if (searchQuery) {
            document.getElementById("searchText").textContent = `"${searchQuery}"`;
            document.getElementById("search-input").value= searchQuery;
        } else {
            document.getElementById("searchText").textContent = "{lỗi không tìm thấy nội dung search}";
        }
    }

    // Gọi hàm với phần tử bạn muốn chèn kết quả tìm kiếm
    displaySearchResult();
});