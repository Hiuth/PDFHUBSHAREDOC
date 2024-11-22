// Sử dụng fetch để lấy file header.html
fetch('header.html')
    .then(response => response.text())
    .then(data => {
        // Chèn nội dung vào phần tử có id là header
        document.getElementById('header-placeholder').innerHTML = data;

        // Sau khi header được tải, nạp và thực thi file header.js
        let script = document.createElement('script');
        script.src = '../../static/js/User/header.js';
        script.type="module";
        script.onload = function() {
            // Kích hoạt một sự kiện tùy chỉnh để báo hiệu header đã sẵn sàng
            document.dispatchEvent(new Event('headerLoaded'));
        };
        document.body.appendChild(script);
    })
    .catch(error => console.error('Error:', error));

// Sử dụng fetch để lấy file footer.html
fetch('footer.html')
    .then(response => response.text())
    .then(data => {
        // Chèn nội dung vào phần tử có id là footer
        document.getElementById('footer-placeholder').innerHTML = data;
    })
    .catch(error => console.error('Error:', error));

// Sử dụng fetch để lấy file sidebar.html
fetch('sidebar.html')
    .then(response => response.text())
    .then(data => {
        // Chèn nội dung vào phần tử có id là footer
        document.getElementById('sidebar-placeholder').innerHTML = data;
    })
    .catch(error => console.error('Error:', error));